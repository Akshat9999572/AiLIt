create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  designation text not null,
  short_bio text not null,
  picture_path text not null,
  manuscript_path text not null,
  manuscript_name text not null,
  status text not null default 'received'
    check (status in ('received', 'under_review', 'accepted', 'declined')),
  created_at timestamptz not null default now()
);

alter table public.submissions enable row level security;
revoke all on table public.submissions from anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'submissions',
  'submissions',
  false,
  5242880,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
