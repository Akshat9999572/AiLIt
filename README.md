# AiLit Editorial Agent

AiLit Editorial Agent is a human-in-the-loop AI agent for literary magazine submissions. It helps editors analyze poems, stories, essays, and other creative work with structured support from Gemini. The agent saves the original submission and AI-generated analysis to Supabase, then keeps the final decision with the human editor.

It is integrated into the existing AiLit Magazine website as a capstone feature, not as an automatic publishing system.

## Live Demo

- **Live Agent**: https://ailitmagazine.xyz/editorial-agent
- **Editorial Dashboard**: https://ailitmagazine.xyz/editorial-dashboard
- **Video Demo**: YouTube link to be added
- **Kaggle Writeup**: Kaggle writeup link to be added

## Selected Track

**Track: Agents for Good**

AiLit Editorial Agent supports literature, creativity, writers, and responsible AI use in the arts. It uses AI to reduce the first-pass workload for small editorial teams while preserving human judgment, taste, care, and accountability.

## Problem

Small literary magazines often receive poems, stories, essays, reviews, and creative submissions, but editors have limited time. Every piece deserves careful reading, genre awareness, theme-fit evaluation, editorial notes, and respectful communication with the writer.

The problem is not simply speed. The goal is to support attentive editorial work without turning literary judgment into an automatic machine decision.

## Solution

AiLit Editorial Agent helps with the first layer of editorial review. It:

- summarizes the submission
- detects genre
- scores theme fit
- scores literary quality
- scores originality
- identifies strengths and weaknesses
- suggests an editorial recommendation
- drafts a polite response email
- saves the full record to Supabase

The editor can then review the saved record in the dashboard, update status, add notes, and make the final decision.

## Human-In-The-Loop Principle

The AI does **not** publish, accept, reject, or email writers automatically.

AI analysis is advisory. Final editorial decisions remain with the human editor. Any response email draft must be reviewed and revised by a human before it is sent.

## Features

- Submission analysis form
- Gemini-powered editorial analysis
- Structured JSON output
- Theme fit score
- Literary quality score
- Originality score
- Strengths and weaknesses
- Editorial recommendation
- Editor notes
- Polite response email draft
- Supabase saving
- Editorial dashboard
- Submission detail review
- Status and notes update
- Diagnostic endpoint

## Demo Flow

1. Open `/editorial-agent`.
2. Enter title, author details, genre, and submission text.
3. Click **Analyze Submission**.
4. Review the saved AI analysis.
5. Open `/editorial-dashboard`.
6. Review saved records and update status or notes.

## Architecture

```text
Editor
  |
  v
/editorial-agent
  |
  v
Vercel Server API /api/editorial
  |
  v
Gemini Model
  |
  v
Structured JSON Analysis
  |
  v
Supabase editorial_submissions table
  |
  v
/editorial-dashboard
  |
  v
Human Editor Final Decision
```

![AiLit Editorial Agent Architecture](./screenshots/ailit-editorial-agent-architecture.png)

The architecture keeps Gemini and privileged Supabase access on the server. The browser submits text to a Vercel API route, the route calls Gemini, parses structured JSON, stores the result in Supabase, and returns the saved advisory analysis to the interface.

## Main Routes

- `/editorial-agent` - public submission analysis page.
- `/editorial-dashboard` - admin-only editorial submissions list.
- `/editorial-dashboard/[id]` - admin-only detail review page.
- `/api/editorial?action=analyze` - analyzes a submission and saves the result.
- `/api/editorial?action=list` - lists saved editorial submissions for admins.
- `/api/editorial?action=get&id=<id>` - fetches one editorial submission for admins.
- `/api/editorial?action=update&id=<id>` - updates status and editor notes.
- `/api/editorial?action=diagnose` - checks Gemini, JSON parsing, and Supabase access.

## Supabase Database

The feature uses:

```text
public.editorial_submissions
```

This table stores:

- original submission details
- AI summary
- detected genre
- theme fit score
- literary quality score
- originality score
- AiLit theme fit explanation
- strengths
- weaknesses
- editorial recommendation
- editor notes
- polite response email draft
- status
- created date

The database setup is in:

```text
supabase/migrations/20260620_add_editorial_submissions.sql
```

## Gemini API Usage

Gemini is called only from the server-side API route:

```text
api/editorial.js
```

The frontend never calls Gemini directly and never receives the Gemini API key. The model is configurable through:

```bash
GEMINI_MODEL=gemini-3.1-flash-lite
```

The current default model is `gemini-3.1-flash-lite`.

Gemini is prompted to return structured JSON containing summary, detected genre, scores, strengths, weaknesses, recommendation, editor notes, and a polite response email draft. The API route defensively parses the response, including cases where the model wraps JSON in markdown fences.

## Environment Variables

These names match the current codebase and `.env.example`.

### Frontend Supabase Variables

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

Used by the Vite frontend and other public Supabase features.

### Server Supabase Variables

```bash
SUPABASE_SERVICE_ROLE_KEY=your-server-only-supabase-service-role-key
```

Used only by server-side API routes for protected editorial operations.

The editorial API can read the Supabase URL from one of these variables:

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
```

`.env.example` currently includes `NEXT_PUBLIC_SUPABASE_URL` for compatibility with the server health checks.

### Optional Next-Style Public Supabase Variable

```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-or-publishable-key
```

This is checked by `api/editorial-health.js` for deployment diagnostics. The Vite app itself uses `VITE_SUPABASE_PUBLISHABLE_KEY`.

### Gemini Variables

```bash
GEMINI_API_KEY=your-server-only-gemini-api-key
GEMINI_MODEL=gemini-3.1-flash-lite
```

Do not commit real API keys or secrets.

## Security Features

- API keys stay server-side.
- `SUPABASE_SERVICE_ROLE_KEY` is server-side only.
- Gemini is called only from `api/editorial.js`.
- No secrets are exposed to frontend code.
- RLS is enabled on `public.editorial_submissions`.
- Public access is revoked where appropriate.
- Dashboard list, detail, and update operations require admin access.
- User input is validated before analysis.
- Gemini responses are parsed safely.
- Errors are returned in a safe user-facing format.
- Logs redact secrets and avoid exposing API keys.
- Diagnostic endpoints report presence/health without exposing values.
- No automatic publishing.
- No automatic emailing.

## Course Concepts Demonstrated

- **Agent system**: Gemini acts as an advisory editorial agent with a defined role, task, prompt, and structured outputs.
- **Tool/API use**: The server API coordinates Gemini, Supabase Auth, and Supabase Database.
- **Structured JSON output**: Gemini returns normalized fields for editorial review and persistence.
- **Human-in-the-loop design**: The agent supports editors but does not replace them.
- **Security features**: Secrets stay server-side, admin routes are protected, and diagnostic output is safe.
- **Supabase-backed state/persistence**: Submissions and analyses are stored in `public.editorial_submissions`.
- **Deployability on Vercel**: The app runs live with Vercel serverless API routes and environment variables.
- **Antigravity/Codex-assisted iterative development**: The project was built through incremental debugging, deployment, database setup, and polish inside the existing AiLit website.

## What This Project Does Not Use Yet

These are future improvements, not current implementation claims:

- MCP Server
- ADK multi-agent system
- A2A protocol
- A2UI protocol
- Agents CLI
- LLM-as-judge evaluation
- Full automated test harness
- Multi-agent orchestration

## Future Improvements

- MCP integration
- ADK multi-agent reviewer system
- LLM-as-judge evaluation
- Automated test harness
- Gmail draft integration
- PDF upload support
- Better admin roles
- Writer-facing submission-to-review pipeline

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local `.env` file using `.env.example` as a guide:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-or-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-server-only-supabase-service-role-key
GEMINI_API_KEY=your-server-only-gemini-api-key
GEMINI_MODEL=gemini-3.1-flash-lite
```

Run the frontend locally:

```bash
npm run dev
```

For local testing of Vercel API routes, use Vercel dev if available:

```bash
vercel dev
```

## Deployment

1. Add environment variables in Vercel.
2. Deploy through Vercel using the connected GitHub repository or Vercel CLI.
3. Test the diagnostic endpoint:

```text
https://ailitmagazine.xyz/api/editorial?action=diagnose
```

4. Test the agent:

```text
https://ailitmagazine.xyz/editorial-agent
```

The diagnostic endpoint should confirm that Gemini, JSON parsing, and Supabase access are healthy.

## Screenshots

- Architecture diagram: `./screenshots/ailit-editorial-agent-architecture.png`
- Editorial Agent form
- Saved analysis result
- Scores and recommendation
- Email draft
- Supabase saved record
- Editorial dashboard
