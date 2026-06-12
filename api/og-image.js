import sharp from 'sharp';

const SITE_URL = 'https://ailit-xi.vercel.app';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://lvghjhjxntaeaukfcsrt.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_sELm91armEAnMH0fX8BCTw_aE9UgnZw';

export default async function handler(request, response) {
  const id = String(request.query.id || '');
  if (!/^[0-9a-f-]{36}$/i.test(id)) return response.status(400).send('Invalid writing ID.');

  const writingResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/writings?id=eq.${id}&published=eq.true&select=image_url`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    },
  );
  const [writing] = writingResponse.ok ? await writingResponse.json() : [];
  const sourceUrl = writing?.image_url || `${SITE_URL}/og-image.png`;
  const imageResponse = await fetch(sourceUrl);
  if (!imageResponse.ok) return response.redirect(302, `${SITE_URL}/og-image.png`);

  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
  const output = await sharp(imageBuffer)
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 82, progressive: true })
    .toBuffer();

  response.setHeader('Content-Type', 'image/jpeg');
  response.setHeader('Content-Length', output.length);
  response.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
  response.status(200).send(output);
}
