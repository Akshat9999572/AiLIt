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

### Problem

Literary magazines receive submissions that need careful reading, genre awareness, theme fit analysis, and respectful communication with writers. The challenge is to use AI to support editorial attention without replacing the human editor or turning literary judgment into an automatic decision.

### Solution

The AiLit Editorial Agent is a human-in-the-loop editorial assistant for AiLit Magazine. It accepts a literary submission, analyzes it with Gemini, saves both the original text and the AI analysis in Supabase, and presents the result to an editor for review. The agent provides a recommendation only; it does not publish, accept, reject, or email authors automatically.

### Architecture

- React/Vite frontend renders the new editorial pages.
- Vercel server-side API route `api/editorial.js` handles all Gemini and Supabase service-role work.
- Gemini is called only from the server.
- Supabase stores original submissions, AI analysis, editor notes, and review status in `public.editorial_submissions`.
- The editorial dashboard uses the existing Supabase Auth session and verifies that the signed-in user exists in the `admins` table.

### Routes

- `/editorial-agent` - public page for entering a literary submission and viewing the saved advisory analysis.
- `/editorial-dashboard` - admin-only list of saved editorial submissions.
- `/editorial-dashboard/[id]` - admin-only detail page for original text, AI analysis, recommendation, email draft, status, and editor notes.

### Supabase Table

The feature uses `public.editorial_submissions`, created by:

`supabase/migrations/20260620_add_editorial_submissions.sql`

The table stores title, author details, declared genre, original submission text, AI summary, detected genre, scores, AiLit theme fit, strengths, weaknesses, recommendation, editor notes, response email draft, status, and creation date.

### Gemini API Usage

The server route calls Gemini with an editorial prompt focused on AiLit Magazine's theme: literature, creativity, human imagination, and the relationship between AI and creative expression. Gemini is asked to return structured JSON with:

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

`AI analysis is advisory. Final editorial decisions remain with the human editor.`

The agent never makes the final publishing decision. It only prepares editorial support. A human editor must review the analysis, update the status, write or revise notes, and decide what happens next.

### Security Features

- `GEMINI_API_KEY` is used only in the server-side API route.
- `SUPABASE_SERVICE_ROLE_KEY` is used only in the server-side API route.
- Neither secret is exposed through frontend code.
- Required fields are validated before analysis.
- Dashboard list, detail, and update operations require an authenticated admin.
- The Supabase table has RLS enabled and public access revoked.
- The app does not automatically send emails.
- The app does not automatically publish submissions.

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
GEMINI_MODEL=gemini-1.5-flash
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
- `GEMINI_MODEL` - optional Gemini model override.

Never commit real API keys or secrets.

### Course Concepts Demonstrated

1. **Agent system** - Gemini acts as an advisory editorial agent that produces structured analysis and recommendations.
2. **Security features** - secrets stay server-side, admin routes verify auth, and Supabase RLS protects editorial data.
3. **Deployability** - the feature is implemented with Vercel API routes, Supabase, and environment variables suitable for production deployment.
4. **Antigravity-assisted development** - the project is extended incrementally with isolated database, API, UI, and documentation changes while preserving the existing website.
