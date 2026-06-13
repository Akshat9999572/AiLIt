create table if not exists public.push_devices (
  token text primary key,
  platform text not null default 'android' check (platform in ('android')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.push_devices enable row level security;

revoke all on table public.push_devices from anon, authenticated;
