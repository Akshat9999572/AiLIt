-- AiLit Editorial Agent database setup.
-- This table stores literary submissions and the AI-generated editorial analysis
-- used by the Kaggle capstone feature. It is intentionally separate from the
-- existing public submission workflow so the agent can be developed safely.

create table if not exists public.editorial_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),

  title text not null,
  author_name text,
  author_email text,
  declared_genre text,
  submission_text text not null,

  summary text,
  detected_genre text,
  theme_fit_score integer,
  literary_quality_score integer,
  originality_score integer,
  fit_with_ailit_theme text,
  strengths text,
  weaknesses text,
  editorial_recommendation text,
  editor_notes text,
  polite_response_email_draft text,

  status text default 'pending'
);

comment on table public.editorial_submissions is
  'Stores AiLit Editorial Agent submissions, AI editorial analysis, recommendations, response drafts, and editor review status.';

comment on column public.editorial_submissions.submission_text is
  'The original poem, story, essay, review, research paper, or other literary submission text reviewed by the agent.';

comment on column public.editorial_submissions.summary is
  'AI-generated summary of the submitted work for editorial review.';

comment on column public.editorial_submissions.detected_genre is
  'Genre inferred by the AI editorial agent, which may differ from the author-declared genre.';

comment on column public.editorial_submissions.theme_fit_score is
  'AI score for how closely the piece fits AiLit themes around Artificial Intelligence and literature.';

comment on column public.editorial_submissions.literary_quality_score is
  'AI score for craft, language, structure, and literary strength.';

comment on column public.editorial_submissions.originality_score is
  'AI score for originality, freshness, and creative distinctiveness.';

comment on column public.editorial_submissions.editorial_recommendation is
  'AI-generated recommendation such as accept, revise, consider, or decline.';

comment on column public.editorial_submissions.editor_notes is
  'Private notes written by a human editor after reviewing the AI analysis.';

comment on column public.editorial_submissions.polite_response_email_draft is
  'AI-generated draft email that an editor can review and revise before responding to the author.';

comment on column public.editorial_submissions.status is
  'Human editorial workflow status, beginning as pending.';

alter table public.editorial_submissions enable row level security;

-- Keep this capstone review table private until an explicit admin dashboard
-- and policies are added in a later step.
revoke all on table public.editorial_submissions from anon, authenticated;
