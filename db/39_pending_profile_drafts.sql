-- 39 — Cross-device drafts van de interactieve builder op /start.
--
-- Een bezoeker bouwt zijn aliasprofiel zonder account. Bij stap 5 vult hij een
-- e-mailadres in: de payload wordt hier 24 uur bewaard en na het volgen van de
-- magic link vastgelegd in `public.alias_profiles`. Zo kan je de tour op je
-- telefoon starten en op je laptop afwerken.

create table if not exists public.pending_profile_drafts (
  email         text primary key,
  alias_handle  text not null,
  display_name  text,
  bio           text,
  theme_id      text not null default 'noir',
  avatar_url    text,
  links         jsonb not null default '[]'::jsonb,
  want_vcard    boolean not null default false,
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null default (now() + interval '24 hours')
);

create index if not exists pending_profile_drafts_expires_idx
  on public.pending_profile_drafts (expires_at);
