create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  active boolean not null default true,
  unsubscribe_token uuid not null default gen_random_uuid(),
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  constraint newsletter_subscribers_email_unique unique (email),
  constraint newsletter_subscribers_unsubscribe_token_unique unique (unsubscribe_token),
  constraint newsletter_subscribers_email_normalized check (email = lower(trim(email)))
);

alter table public.newsletter_subscribers enable row level security;
revoke all on table public.newsletter_subscribers from anon, authenticated;
