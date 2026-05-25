-- ============================================================
-- ¿Qué Suzuki eres? — Schema Supabase
-- Copia y pega este SQL en: Supabase → SQL Editor → New query
-- ============================================================

create table if not exists public.participants (
  id           bigserial primary key,
  name         text not null,
  email        text not null,
  result       text not null check (result in ('swift', 'dzire', 'jimny')),
  result_name  text,
  answers      jsonb,
  started_at   timestamptz,
  finished_at  timestamptz default now(),
  created_at   timestamptz default now()
);

-- Index para búsquedas rápidas
create index if not exists participants_email_idx        on public.participants (email);
create index if not exists participants_result_idx       on public.participants (result);
create index if not exists participants_finished_at_idx  on public.participants (finished_at desc);

-- ============================================================
-- Row Level Security
-- El cliente usa la "anon" key, así que necesitamos políticas
-- explícitas. Para un evento simple:
--   - INSERT abierto (cualquiera puede registrarse)
--   - SELECT abierto (el panel admin lee con la misma key)
-- En producción / largo plazo, restringe SELECT a usuarios
-- autenticados y crea un dashboard con auth.
-- ============================================================

alter table public.participants enable row level security;

drop policy if exists "Anyone can insert participant"  on public.participants;
drop policy if exists "Anyone can read participants"   on public.participants;

create policy "Anyone can insert participant"
  on public.participants
  for insert
  to anon
  with check (true);

create policy "Anyone can read participants"
  on public.participants
  for select
  to anon
  using (true);

-- ============================================================
-- (Opcional) Realtime — habilita que admin.html reciba
-- nuevos registros en vivo durante el evento
-- ============================================================

alter publication supabase_realtime add table public.participants;
