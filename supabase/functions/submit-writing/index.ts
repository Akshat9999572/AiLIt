import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://ailit-xi.vercel.app",
  "http://localhost:4173",
  "http://localhost:5173",
  "http://127.0.0.1:4173",
  "http://127.0.0.1:5173",
]);

const manuscriptTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const respond = (body: unknown, status = 200, origin = "") =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://ailit-xi.vercel.app",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Vary": "Origin",
    },
  });

const cleanFileName = (name: string) =>
  name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");

Deno.serve(async (request) => {
  const origin = request.headers.get("origin") || "";
  if (request.method === "OPTIONS") return respond({ ok: true }, 200, origin);
  if (request.method !== "POST") return respond({ error: "Method not allowed." }, 405, origin);

  try {
    const form = await request.formData();
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim().toLowerCase();
    const designation = String(form.get("designation") || "").trim();
    const shortBio = String(form.get("shortBio") || "").trim();
    const picture = form.get("picture");
    const manuscript = form.get("manuscript");

    if (!name || name.length > 120) return respond({ error: "Enter your name." }, 400, origin);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return respond({ error: "Enter a valid email address." }, 400, origin);
    }
    if (!designation || designation.length > 160) {
      return respond({ error: "Enter your designation." }, 400, origin);
    }
    if (!shortBio || shortBio.length > 1000) {
      return respond({ error: "Short bio must be between 1 and 1000 characters." }, 400, origin);
    }
    if (!(picture instanceof File) || !imageTypes.has(picture.type) || picture.size > 5 * 1024 * 1024) {
      return respond({ error: "Upload a JPG, PNG, WebP, or GIF picture up to 5 MB." }, 400, origin);
    }
    if (!(manuscript instanceof File) || !manuscriptTypes.has(manuscript.type) || manuscript.size > 5 * 1024 * 1024) {
      return respond({ error: "Upload a PDF, DOC, or DOCX manuscript up to 5 MB." }, 400, origin);
    }

    const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    const secretKey = secretKeys.default || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(Deno.env.get("SUPABASE_URL") || "", secretKey || "");
    const submissionId = crypto.randomUUID();
    const picturePath = `${submissionId}/portrait-${cleanFileName(picture.name)}`;
    const manuscriptPath = `${submissionId}/manuscript-${cleanFileName(manuscript.name)}`;

    const { error: pictureError } = await supabase.storage
      .from("submissions")
      .upload(picturePath, picture, { contentType: picture.type, upsert: false });
    if (pictureError) throw pictureError;

    const { error: manuscriptError } = await supabase.storage
      .from("submissions")
      .upload(manuscriptPath, manuscript, { contentType: manuscript.type, upsert: false });
    if (manuscriptError) {
      await supabase.storage.from("submissions").remove([picturePath]);
      throw manuscriptError;
    }

    const { error: insertError } = await supabase.from("submissions").insert({
      id: submissionId,
      name,
      email,
      designation,
      short_bio: shortBio,
      picture_path: picturePath,
      manuscript_path: manuscriptPath,
      manuscript_name: manuscript.name,
    });

    if (insertError) {
      await supabase.storage.from("submissions").remove([picturePath, manuscriptPath]);
      throw insertError;
    }

    return respond({
      message: "Your work has been received. Thank you for sharing it with AiLit.",
      submissionId,
    }, 200, origin);
  } catch (error) {
    console.error(error);
    return respond({ error: "The submission could not be completed. Please try again." }, 500, origin);
  }
});
