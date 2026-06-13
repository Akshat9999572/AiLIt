import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://ailitmagazine.xyz",
  "https://www.ailitmagazine.xyz",
  "capacitor://localhost",
  "http://localhost",
]);

const respond = (body: unknown, status = 200, origin = "") => new Response(JSON.stringify(body), {
  status,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://ailitmagazine.xyz",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  },
});

const base64Url = (input: Uint8Array | string) => {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const getAdminClient = () => {
  const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
  return createClient(
    Deno.env.get("SUPABASE_URL") || "",
    keys.default || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
  );
};

const getFirebaseAccessToken = async () => {
  const account = JSON.parse(Deno.env.get("FIREBASE_SERVICE_ACCOUNT") || "{}");
  if (!account.client_email || !account.private_key || !account.project_id) {
    throw new Error("Firebase service account is not configured.");
  }
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64Url(JSON.stringify({
    iss: account.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const keyData = account.private_key.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
  const keyBytes = Uint8Array.from(atob(keyData), (character) => character.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "pkcs8",
    keyBytes,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(`${header}.${claims}`),
  );
  const assertion = `${header}.${claims}.${base64Url(new Uint8Array(signature))}`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const result = await response.json();
  if (!response.ok || !result.access_token) throw new Error("Firebase authentication failed.");
  return { accessToken: result.access_token, projectId: account.project_id };
};

Deno.serve(async (request) => {
  const origin = request.headers.get("origin") || "";
  if (request.method === "OPTIONS") return respond({ ok: true }, 200, origin);
  if (request.method !== "POST") return respond({ error: "Method not allowed." }, 405, origin);

  try {
    const payload = await request.json();
    const supabase = getAdminClient();

    if (payload.action === "register") {
      const token = String(payload.token || "").trim();
      if (token.length < 80 || token.length > 4096) return respond({ error: "Invalid device token." }, 400, origin);
      const { error } = await supabase.from("push_devices").upsert({
        token,
        platform: "android",
        active: true,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      return respond({ registered: true }, 200, origin);
    }

    if (payload.action === "notify") {
      const jwt = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
      const { data: userData, error: userError } = await supabase.auth.getUser(jwt);
      if (userError || !userData.user) return respond({ error: "Unauthorized." }, 401, origin);
      const { data: admin } = await supabase.from("admins").select("user_id")
        .eq("user_id", userData.user.id).maybeSingle();
      if (!admin) return respond({ error: "Admin access required." }, 403, origin);

      const story = payload.story || {};
      if (!story.id || !story.title || !story.author) return respond({ error: "Missing writing details." }, 400, origin);
      const { data: devices, error } = await supabase.from("push_devices").select("token").eq("active", true);
      if (error) throw error;
      if (!devices?.length) return respond({ sent: 0, failed: 0 }, 200, origin);

      const { accessToken, projectId } = await getFirebaseAccessToken();
      let sent = 0;
      let failed = 0;
      const invalidTokens: string[] = [];
      for (const device of devices) {
        const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: {
              token: device.token,
              notification: {
                title: story.title,
                body: `New ${story.type || "writing"} by ${story.author} in AiLit`,
              },
              data: {
                path: `/writing/${story.id}`,
                storyId: String(story.id),
              },
              android: {
                priority: "high",
                notification: { channel_id: "new_writing", sound: "default" },
              },
            },
          }),
        });
        if (response.ok) {
          sent += 1;
        } else {
          failed += 1;
          const detail = await response.text();
          if (detail.includes("UNREGISTERED") || detail.includes("INVALID_ARGUMENT")) invalidTokens.push(device.token);
          console.error("FCM send failed", response.status, detail);
        }
      }
      if (invalidTokens.length) {
        await supabase.from("push_devices").update({ active: false, updated_at: new Date().toISOString() })
          .in("token", invalidTokens);
      }
      return respond({ sent, failed }, 200, origin);
    }

    return respond({ error: "Unknown action." }, 400, origin);
  } catch (error) {
    console.error(error);
    return respond({ error: "Push notification request failed." }, 500, origin);
  }
});
