# AiLit Magazine

## AiLit Editorial Agent Database Setup

The `editorial_submissions` table stores the database foundation for the AiLit Editorial Agent capstone feature. It is designed to save both the original literary submission and the AI-generated editorial review, including summary, detected genre, theme fit, literary quality, originality, strengths, weaknesses, recommendation, editor notes, response email draft, and review status.

To run this setup in Supabase:

1. Open your Supabase project dashboard.
2. Go to **SQL Editor**.
3. Open the file `supabase/migrations/20260620_add_editorial_submissions.sql` from this project.
4. Copy the SQL into the Supabase SQL Editor.
5. Click **Run**.

This table is needed for the Kaggle capstone project because the AiLit Editorial Agent needs a structured place to store submissions and preserve the full editorial reasoning process. Keeping the original text, AI analysis, recommendation, and human editor notes together makes the capstone easier to demonstrate, review, and extend later without changing the existing AiLit homepage, submission page, or published writing workflow.

No Gemini API key, agent UI, admin dashboard, or production automation is included in this first database-only step.

## Kaggle Capstone: AiLit Editorial Agent

Selected track: **Agents for Good**

### Problem

Small literary magazines often receive more submissions than a small editorial team can read quickly. Each piece deserves careful attention: genre awareness, close reading, theme fit, literary quality, originality, and respectful communication with the writer. The challenge is to use AI for public good in the arts without replacing human taste, accountability, or editorial judgment.

### Solution

The AiLit Editorial Agent is a human-in-the-loop editorial assistant for AiLit Magazine. It accepts a literary submission, analyzes it with Gemini, saves both the original text and the AI analysis in Supabase, and presents the result to a human editor for review.

The agent provides decision support only. It does not accept, reject, publish, or email writers automatically. The human editor remains the final authority.

### Architecture

The feature is intentionally small and deployable:

- **Frontend**: React/Vite renders the editorial agent form, result display, dashboard list, and detail review page.
- **Server API**: Vercel serverless route `api/editorial.js` receives requests, validates input, calls Gemini, parses structured JSON, saves records to Supabase, and protects dashboard operations.
- **AI model**: Gemini returns advisory editorial analysis in a structured JSON shape.
- **Database**: Supabase stores the original submission, AI analysis, recommendation, editor notes, status, and timestamps in `public.editorial_submissions`.
- **Authentication**: The dashboard uses the existing Supabase Auth session and verifies that the signed-in user appears in the `admins` table.
- **Human review**: Editors update status and notes manually after reading the submission and the advisory analysis.

### Routes

- `/editorial-agent` - public page for entering a literary submission and viewing the saved advisory analysis.
- `/editorial-dashboard` - admin-only list of saved editorial submissions.
- `/editorial-dashboard/[id]` - admin-only detail page showing original text, AI summary, scores, strengths, weaknesses, recommendation, draft response, status, and editor notes.
- `/api/editorial?action=analyze` - server-side analysis and save endpoint.
- `/api/editorial?action=list` - admin-only list endpoint.
- `/api/editorial?action=get&id=<id>` - admin-only detail endpoint.
- `/api/editorial?action=update&id=<id>` - admin-only status and notes update endpoint.
- `/api/editorial?action=diagnose` - server-side health check for Gemini, parsing, and Supabase access.

### Supabase Table

The feature uses `public.editorial_submissions`, created by:

`supabase/migrations/20260620_add_editorial_submissions.sql`

The table stores title, author details, declared genre, original submission text, AI summary, detected genre, scores, AiLit theme fit, strengths, weaknesses, recommendation, editor notes, response email draft, status, and creation date.

### Gemini API Usage

The server route calls Gemini with an editorial prompt focused on AiLit Magazine's theme: literature, creativity, human imagination, and the relationship between AI and creative expression.

The model is configurable with:

```bash
GEMINI_MODEL=gemini-3.1-flash-lite
```

If `GEMINI_MODEL` is not set, the server defaults to `gemini-3.1-flash-lite`. The frontend never calls Gemini directly and never receives the Gemini API key.

Gemini is asked to return structured JSON with:

- `summary`
- `detected_genre`
- `theme_fit_score`
- `literary_quality_score`
- `originality_score`
- `fit_with_ailit_theme`
- `strengths`
- `weaknesses`
- `editorial_recommendation`
- `editor_notes`
- `polite_response_email_draft`

### Human-In-The-Loop Design

The interface displays this notice clearly:

`AI analysis is advisory. Final editorial decisions remain with the human editor. The agent does not publish work or send email automatically.`

The agent never makes the final publishing decision. It only prepares editorial support. A human editor must review the analysis, update the status, write or revise notes, decide what happens next, and revise any email draft before sending.

### Security Features

- `GEMINI_API_KEY` is used only in the server-side API route.
- `SUPABASE_SERVICE_ROLE_KEY` is used only in the server-side API route.
- Neither secret is exposed through frontend code.
- Required fields are validated before analysis.
- Gemini errors are logged with safe model/status/message details only; secrets are redacted.
- Gemini responses are parsed defensively so markdown fences or extra prose do not break the workflow.
- Dashboard list, detail, and update operations require an authenticated admin.
- The Supabase table has RLS enabled and public access revoked.
- The app does not automatically send emails.
- The app does not automatically publish submissions.
- The diagnostic endpoint reports whether required services are reachable without exposing secret values.

### How To Run Locally

1. Install dependencies:

```bash
npm install
```

2. Add local environment variables in `.env`:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3.1-flash-lite
```

3. Run the local app:

```bash
npm run dev
```

For local testing of Vercel API routes, use the Vercel dev environment if available:

```bash
vercel dev
```

### Environment Variables

- `VITE_SUPABASE_URL` - Supabase project URL used by the frontend and server.
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase publishable key used by frontend features.
- `SUPABASE_SERVICE_ROLE_KEY` - private server-only key used to write/read protected editorial records.
- `GEMINI_API_KEY` - private server-only key used to call Gemini.
- `GEMINI_MODEL` - optional Gemini model override. The default production model is `gemini-3.1-flash-lite`.

Never commit real API keys or secrets.

### How To Deploy

1. Add the production environment variables in Vercel.
2. Confirm `GEMINI_API_KEY`, `GEMINI_MODEL`, `SUPABASE_SERVICE_ROLE_KEY`, and Supabase public variables are set.
3. Push to the production branch connected to Vercel.
4. After deployment, test:

```bash
https://ailitmagazine.xyz/api/editorial?action=diagnose
```

The diagnostic should report Gemini, JSON parsing, and Supabase as healthy.

### Course Concepts Demonstrated

1. **Agent system** - Gemini acts as an advisory editorial agent with a defined role, prompt, structured outputs, model configuration, and a saved reasoning trail for editors.
2. **Security features** - secrets stay server-side, admin routes verify Supabase Auth, service-role access is isolated in the API route, RLS protects editorial data, and logs avoid exposing keys.
3. **Deployability** - the feature runs on the existing Vercel deployment, uses environment variables, stores data in Supabase, and includes a diagnostic endpoint for production verification.
4. **Antigravity-assisted development** - the capstone was built incrementally: database setup first, server-side agent workflow next, editor dashboard after that, then final debugging, documentation, and deployment polish while preserving the existing AiLit site.
