const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://lvghjhjxntaeaukfcsrt.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_FALLBACK_MODEL = 'gemini-1.5-flash';

const editorialFields = 'id,created_at,title,author_name,author_email,declared_genre,submission_text,summary,detected_genre,theme_fit_score,literary_quality_score,originality_score,fit_with_ailit_theme,strengths,weaknesses,editorial_recommendation,editor_notes,polite_response_email_draft,status';
const allowedStatuses = new Set(['pending', 'accepted', 'maybe', 'revise', 'rejected']);

const sendJson = (response, status, payload) => {
  response.status(status).json(payload);
};

class EditorialError extends Error {
  constructor(publicMessage, logMessage = publicMessage, status = 500, code = 'EDITORIAL_ERROR') {
    super(logMessage);
    this.publicMessage = publicMessage;
    this.status = status;
    this.code = code;
  }
}

const safeErrorBody = (value) => {
  const text = typeof value === 'string' ? value : JSON.stringify(value || {});
  return text
    .replace(new RegExp(GEMINI_API_KEY || 'never-match-this-key', 'g'), '[redacted-gemini-key]')
    .replace(new RegExp(SUPABASE_SERVICE_ROLE_KEY || 'never-match-this-key', 'g'), '[redacted-supabase-key]')
    .slice(0, 1800);
};

const readBody = async (request) => {
  if (request.body && typeof request.body === 'object') return request.body;
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString('utf8');
  return rawBody ? JSON.parse(rawBody) : {};
};

const cleanText = (value, maxLength = 20000) => String(value || '').trim().slice(0, maxLength);

const parseJsonMaybe = (text) => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const supabaseRequest = async (path, options = {}) => {
  if (!SUPABASE_SERVICE_ROLE_KEY) throw new EditorialError('Missing environment variable', 'SUPABASE_SERVICE_ROLE_KEY is not configured.', 500, 'MISSING_ENV');
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const data = parseJsonMaybe(text);
  if (!response.ok) {
    console.error('Supabase request failed', {
      status: response.status,
      path,
      body: safeErrorBody(data || text),
    });
    throw new EditorialError('Supabase save failed', data?.message || data?.error_description || data?.hint || 'Supabase request failed.', 500, 'SUPABASE_FAILED');
  }
  return data;
};

const getUser = async (token) => {
  if (!token) return null;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${token}`,
    },
  });
  return response.ok ? response.json() : null;
};

const requireAdmin = async (request) => {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  const user = await getUser(token);
  if (!user?.id) return null;
  const admins = await supabaseRequest(`/rest/v1/admins?user_id=eq.${encodeURIComponent(user.id)}&select=user_id&limit=1`, {
    method: 'GET',
  });
  return admins?.[0] ? user : null;
};

const parseGeminiJson = (data) => {
  const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n').trim();
  if (!text) throw new EditorialError('Invalid JSON from Gemini', 'Gemini returned an empty analysis.', 502, 'GEMINI_INVALID_JSON');
  const withoutFence = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  const match = withoutFence.match(/\{[\s\S]*\}/);
  const jsonText = match ? match[0] : withoutFence;
  try {
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Invalid JSON from Gemini', { preview: safeErrorBody(text), message: error.message });
    throw new EditorialError('Invalid JSON from Gemini', error.message, 502, 'GEMINI_INVALID_JSON');
  }
};

const normalizeAnalysis = (analysis) => ({
  summary: cleanText(analysis.summary, 4000),
  detected_genre: cleanText(analysis.detected_genre, 200),
  theme_fit_score: Number.parseInt(analysis.theme_fit_score, 10),
  literary_quality_score: Number.parseInt(analysis.literary_quality_score, 10),
  originality_score: Number.parseInt(analysis.originality_score, 10),
  fit_with_ailit_theme: cleanText(analysis.fit_with_ailit_theme, 4000),
  strengths: cleanText(analysis.strengths, 4000),
  weaknesses: cleanText(analysis.weaknesses, 4000),
  editorial_recommendation: cleanText(analysis.editorial_recommendation, 1200),
  editor_notes: cleanText(analysis.editor_notes, 4000),
  polite_response_email_draft: cleanText(analysis.polite_response_email_draft, 6000),
});

const clampScores = (analysis) => {
  ['theme_fit_score', 'literary_quality_score', 'originality_score'].forEach((field) => {
    if (!Number.isFinite(analysis[field])) analysis[field] = null;
    if (analysis[field] !== null) analysis[field] = Math.max(0, Math.min(100, analysis[field]));
  });
  return analysis;
};

const buildEditorialPrompt = (submission) => {
  // The agent is advisory: it produces structured editorial support, never a final decision.
  return `You are the AiLit Editorial Agent for AiLit Magazine.

AiLit Magazine explores literature, creativity, human imagination, and the relationship between AI and creative expression.

Analyze the submission below for a human editor. You must not make a final publishing decision. You only provide an editorial recommendation. The human editor remains the final authority. Do not send emails or imply publication is automatic.

Return only valid JSON with these keys:
summary, detected_genre, theme_fit_score, literary_quality_score, originality_score, fit_with_ailit_theme, strengths, weaknesses, editorial_recommendation, editor_notes, polite_response_email_draft.

Scores must be integers from 0 to 100.

Title: ${submission.title}
Author name: ${submission.author_name || 'Not provided'}
Author email: ${submission.author_email || 'Not provided'}
Declared genre: ${submission.declared_genre || 'Not provided'}

Submission:
${submission.submission_text}`;
};

const isUnsupportedGeminiModel = (status, message) =>
  status === 404 || /not found|not supported|unsupported|is not found|model/i.test(message);

const callGeminiModel = async (model, prompt) => {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const response = await fetch(`${endpoint}?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.35,
        responseMimeType: 'application/json',
      },
    }),
  });

  const text = await response.text();
  const data = parseJsonMaybe(text);
  console.info('Gemini API response', {
    status: response.status,
    ok: response.ok,
    model,
  });

  if (!response.ok) {
    const message = data?.error?.message || 'Gemini analysis failed.';
    console.error('Gemini API failed', {
      status: response.status,
      model,
      body: safeErrorBody(data || text),
    });
    const error = new EditorialError('Gemini API failed', message, 502, 'GEMINI_FAILED');
    error.geminiStatus = response.status;
    error.geminiMessage = message;
    throw error;
  }

  return data;
};

const analyzeWithGemini = async (submission) => {
  if (!GEMINI_API_KEY) throw new EditorialError('Missing environment variable', 'GEMINI_API_KEY is not configured.', 500, 'MISSING_ENV');

  const prompt = buildEditorialPrompt(submission);
  let data;
  try {
    data = await callGeminiModel(GEMINI_MODEL, prompt);
  } catch (error) {
    if (GEMINI_MODEL !== GEMINI_FALLBACK_MODEL && isUnsupportedGeminiModel(error.geminiStatus, error.geminiMessage || error.message)) {
      console.warn('Gemini primary model failed; trying fallback model', {
        primaryModel: GEMINI_MODEL,
        fallbackModel: GEMINI_FALLBACK_MODEL,
        status: error.geminiStatus,
      });
      data = await callGeminiModel(GEMINI_FALLBACK_MODEL, prompt);
    } else {
      throw error;
    }
  }

  return clampScores(normalizeAnalysis(parseGeminiJson(data)));
};

const analyzeSubmission = async (request, response) => {
  const body = await readBody(request);
  const submission = {
    title: cleanText(body.title, 300),
    author_name: cleanText(body.author_name, 200) || null,
    author_email: cleanText(body.author_email, 300) || null,
    declared_genre: cleanText(body.declared_genre, 200) || null,
    submission_text: cleanText(body.submission_text, 50000),
  };

  if (!submission.title || !submission.submission_text) {
    return sendJson(response, 400, { error: 'Title and submission text are required.' });
  }
  if (submission.author_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submission.author_email)) {
    return sendJson(response, 400, { error: 'Enter a valid author email address.' });
  }

  const analysis = await analyzeWithGemini(submission);
  let saved;
  try {
    [saved] = await supabaseRequest(`/rest/v1/editorial_submissions?select=${editorialFields}`, {
      method: 'POST',
      body: JSON.stringify({ ...submission, ...analysis, status: 'pending' }),
    });
  } catch (error) {
    if (error instanceof EditorialError) throw error;
    console.error('Supabase save failed', { message: error.message });
    throw new EditorialError('Supabase save failed', error.message, 500, 'SUPABASE_FAILED');
  }
  return sendJson(response, 200, { submission: saved });
};

const listSubmissions = async (request, response) => {
  const admin = await requireAdmin(request);
  if (!admin) return sendJson(response, 401, { error: 'Admin access is required.' });
  const data = await supabaseRequest(`/rest/v1/editorial_submissions?select=id,created_at,title,author_name,detected_genre,theme_fit_score,editorial_recommendation,status&order=created_at.desc`, {
    method: 'GET',
  });
  return sendJson(response, 200, { submissions: data || [] });
};

const getSubmission = async (request, response, id) => {
  const admin = await requireAdmin(request);
  if (!admin) return sendJson(response, 401, { error: 'Admin access is required.' });
  const data = await supabaseRequest(`/rest/v1/editorial_submissions?id=eq.${encodeURIComponent(id)}&select=${editorialFields}&limit=1`, {
    method: 'GET',
  });
  if (!data?.[0]) return sendJson(response, 404, { error: 'Editorial submission not found.' });
  return sendJson(response, 200, { submission: data[0] });
};

const updateSubmission = async (request, response, id) => {
  const admin = await requireAdmin(request);
  if (!admin) return sendJson(response, 401, { error: 'Admin access is required.' });
  const body = await readBody(request);
  const status = cleanText(body.status, 40);
  if (!allowedStatuses.has(status)) return sendJson(response, 400, { error: 'Choose a valid editorial status.' });
  const editorNotes = cleanText(body.editor_notes, 6000);
  const [updated] = await supabaseRequest(`/rest/v1/editorial_submissions?id=eq.${encodeURIComponent(id)}&select=${editorialFields}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, editor_notes: editorNotes }),
  });
  return sendJson(response, 200, { submission: updated });
};

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  try {
    const url = new URL(request.url, `https://${request.headers.host || 'ailitmagazine.xyz'}`);
    const action = url.searchParams.get('action');
    const id = url.searchParams.get('id');

    if (request.method === 'POST' && action === 'analyze') return analyzeSubmission(request, response);
    if (request.method === 'GET' && action === 'list') return listSubmissions(request, response);
    if (request.method === 'GET' && action === 'get' && id) return getSubmission(request, response, id);
    if (request.method === 'PATCH' && action === 'update' && id) return updateSubmission(request, response, id);

    return sendJson(response, 404, { error: 'Editorial API route not found.' });
  } catch (error) {
    console.error('Editorial API error', {
      code: error.code || 'EDITORIAL_ERROR',
      message: error.message,
    });
    return sendJson(response, error.status || 500, {
      error: error.publicMessage || 'The editorial request failed.',
      code: error.code || 'EDITORIAL_ERROR',
    });
  }
}
