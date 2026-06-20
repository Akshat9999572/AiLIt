const hasValue = (value) => typeof value === 'string' && value.trim().length > 0;

export default function handler(_request, response) {
  response.setHeader('Cache-Control', 'no-store');
  response.status(200).json({
    GEMINI_API_KEY: hasValue(process.env.GEMINI_API_KEY),
    SUPABASE_SERVICE_ROLE_KEY: hasValue(process.env.SUPABASE_SERVICE_ROLE_KEY),
    NEXT_PUBLIC_SUPABASE_URL: hasValue(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: hasValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    VITE_SUPABASE_URL: hasValue(process.env.VITE_SUPABASE_URL),
    VITE_SUPABASE_PUBLISHABLE_KEY: hasValue(process.env.VITE_SUPABASE_PUBLISHABLE_KEY),
  });
}
