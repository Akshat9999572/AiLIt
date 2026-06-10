import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://ailit-xi.vercel.app",
  "http://localhost:4173",
  "http://localhost:5173",
  "http://127.0.0.1:4173",
  "http://127.0.0.1:5173",
]);

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

const escapeHtml = (value = "") =>
  value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[character] || character);

const getAdminClient = () => {
  const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
  const secretKey = secretKeys.default || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(Deno.env.get("SUPABASE_URL") || "", secretKey || "");
};

Deno.serve(async (request) => {
  const origin = request.headers.get("origin") || "";
  if (request.method === "OPTIONS") return respond({ ok: true }, 200, origin);
  if (request.method !== "POST") return respond({ error: "Method not allowed." }, 405, origin);

  try {
    const payload = await request.json();
    const adminClient = getAdminClient();

    if (payload.action === "subscribe") {
      const email = String(payload.email || "").trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
        return respond({ error: "Enter a valid email address." }, 400, origin);
      }
      const { error } = await adminClient.from("newsletter_subscribers").upsert(
        { email, active: true, unsubscribed_at: null, subscribed_at: new Date().toISOString() },
        { onConflict: "email" },
      );
      if (error) throw error;
      return respond({ message: "You are subscribed to AiLit." }, 200, origin);
    }

    if (payload.action === "unsubscribe") {
      const token = String(payload.token || "");
      if (!/^[0-9a-f-]{36}$/i.test(token)) return respond({ error: "Invalid unsubscribe link." }, 400, origin);
      const { error } = await adminClient.from("newsletter_subscribers")
        .update({ active: false, unsubscribed_at: new Date().toISOString() })
        .eq("unsubscribe_token", token);
      if (error) throw error;
      return respond({ message: "You have been unsubscribed." }, 200, origin);
    }

    if (payload.action === "notify") {
      const jwt = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
      const { data: userData, error: userError } = await adminClient.auth.getUser(jwt);
      if (userError || !userData.user) return respond({ error: "Unauthorized." }, 401, origin);
      const { data: admin } = await adminClient.from("admins").select("user_id")
        .eq("user_id", userData.user.id).maybeSingle();
      if (!admin) return respond({ error: "Admin access required." }, 403, origin);

      const story = payload.story || {};
      if (!story.id || !story.title || !story.author) return respond({ error: "Missing writing details." }, 400, origin);
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      if (!resendApiKey) return respond({ error: "Newsletter email provider is not configured." }, 503, origin);

      const { data: subscribers, error } = await adminClient.from("newsletter_subscribers")
        .select("email, unsubscribe_token").eq("active", true);
      if (error) throw error;
      if (!subscribers?.length) return respond({ sent: 0 }, 200, origin);

      const siteUrl = "https://ailit-xi.vercel.app";
      const from = Deno.env.get("NEWSLETTER_FROM") || "AiLit <onboarding@resend.dev>";
      let sent = 0;
      for (let index = 0; index < subscribers.length; index += 100) {
        const batch = subscribers.slice(index, index + 100).map((subscriber) => ({
          from,
          to: subscriber.email,
          subject: `New ${story.type || "writing"} from AiLit: ${story.title}`,
          html: `<div style="background:#f4efe5;padding:40px 20px;color:#171713;font-family:Georgia,serif"><div style="max-width:600px;margin:auto"><p style="font:12px Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase">New writing from AiLit</p><h1 style="font-size:42px;line-height:1.05;margin:24px 0">${escapeHtml(story.title)}</h1><p style="font-size:18px;line-height:1.6">${escapeHtml(story.introduction || "")}</p><p style="font:13px Arial,sans-serif;text-transform:uppercase">By ${escapeHtml(story.author)}</p><p style="margin:34px 0"><a href="${siteUrl}/?story=${encodeURIComponent(story.id)}" style="background:#171713;color:#fff;padding:14px 20px;text-decoration:none;font:14px Arial,sans-serif">Read on AiLit</a></p><p style="font:11px Arial,sans-serif;color:#6d695f">You received this because you subscribed to AiLit. <a href="${siteUrl}/?unsubscribe=${subscriber.unsubscribe_token}" style="color:#6d695f">Unsubscribe</a></p></div></div>`,
        }));
        const response = await fetch("https://api.resend.com/emails/batch", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
            "Idempotency-Key": `ailit-writing-${story.id}-batch-${index / 100}`,
          },
          body: JSON.stringify(batch),
        });
        if (!response.ok) throw new Error(`Email provider returned ${response.status}.`);
        sent += batch.length;
      }
      return respond({ sent }, 200, origin);
    }

    return respond({ error: "Unknown action." }, 400, origin);
  } catch (error) {
    console.error(error);
    return respond({ error: "The newsletter request could not be completed." }, 500, origin);
  }
});
