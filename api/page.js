const SITE_URL = 'https://ailit-xi.vercel.app';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://lvghjhjxntaeaukfcsrt.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_sELm91armEAnMH0fX8BCTw_aE9UgnZw';

const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[character]);

const pageDetails = async (path) => {
  if (path === '/about') {
    return {
      title: 'About AiLit - Artificial Intelligence and Literature',
      description: 'Discover why AiLit brings Artificial Intelligence into conversation with literature, language, and imagination.',
      image: `${SITE_URL}/about-ai-literature.png`,
      type: 'website',
    };
  }

  if (path === '/submit') {
    return {
      title: 'Submit Your Writing to AiLit',
      description: 'Send AiLit writing that explores the intersection of Artificial Intelligence and literature.',
      image: `${SITE_URL}/og-image.png`,
      type: 'website',
    };
  }

  const writingMatch = path.match(/^\/writing\/([0-9a-f-]{36})$/i);
  if (writingMatch) {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/writings?id=eq.${writingMatch[1]}&published=eq.true&select=title,author,introduction,image_url`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      },
    );
    const [writing] = response.ok ? await response.json() : [];
    if (writing) {
      return {
        title: `${writing.title} by ${writing.author} - AiLit`,
        description: writing.introduction,
        image: writing.image_url || `${SITE_URL}/og-image.png`,
        type: 'article',
      };
    }
  }

  return {
    title: 'AiLit - Artificial Intelligence and Literature',
    description: 'A literary magazine exploring the fusion of AI, literature, reading, and creative writing.',
    image: `${SITE_URL}/og-image.png`,
    type: 'website',
  };
};

export default async function handler(request, response) {
  const path = request.query.path ? `/${request.query.path}`.replace(/\/+/g, '/') : '/';
  const details = await pageDetails(path);
  const canonicalUrl = `${SITE_URL}${path === '/' ? '/' : path}`;
  const image = details.image.startsWith('http') ? details.image : `${SITE_URL}${details.image}`;

  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
  response.status(200).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(details.title)}</title>
    <meta name="description" content="${escapeHtml(details.description)}" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    <meta property="og:type" content="${details.type}" />
    <meta property="og:site_name" content="AiLit" />
    <meta property="og:title" content="${escapeHtml(details.title)}" />
    <meta property="og:description" content="${escapeHtml(details.description)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(image)}" />
    <meta property="og:image:alt" content="${escapeHtml(details.title)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(details.title)}" />
    <meta name="twitter:description" content="${escapeHtml(details.description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
    <link rel="icon" href="/ailit-logo.png" />
    <script>window.location.replace('/app-shell${path === '/' ? '' : path}');</script>
  </head>
  <body>
    <p><a href="/app-shell${path === '/' ? '' : path}">Open ${escapeHtml(details.title)}</a></p>
  </body>
</html>`);
}
