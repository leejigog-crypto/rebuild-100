-- 100억 리빌드 — 초기 스키마
-- 로그인 화면 없이 Supabase 익명 로그인(브라우저마다 자동 계정)을 사용합니다.
-- 모든 테이블은 RLS로 "내 것만 쓰기"를 강제합니다.

-- ---------------------------------------------------------------------------
-- 진행 저장 (사용자당 1행): 인트로 이름 + 부지·견적 선택
-- ---------------------------------------------------------------------------
create table public.saves (
  user_id     uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  player_name text not null default '' check (char_length(player_name) <= 12),
  house_name  text not null default '' check (char_length(house_name) <= 16),
  spec        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.saves enable row level security;

create policy "saves: owner reads"   on public.saves for select to authenticated using (user_id = (select auth.uid()));
create policy "saves: owner inserts" on public.saves for insert to authenticated with check (user_id = (select auth.uid()));
create policy "saves: owner updates" on public.saves for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- 완공한 집: 결과 화면에서 자동 저장, "갤러리에 공개"로 다른 사람에게 보임
-- ---------------------------------------------------------------------------
create table public.houses (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  player_name     text not null default '' check (char_length(player_name) <= 12),
  house_name      text not null check (char_length(house_name) between 1 and 16),
  spec            jsonb not null,
  site_name       text not null check (char_length(site_name) <= 40),
  look_name       text not null check (char_length(look_name) <= 40),
  grade           text not null check (grade in ('S', 'A', 'B', 'C')),
  total           int  not null check (total between 0 and 100),
  title           text not null check (char_length(title) <= 20),
  scores          jsonb not null,
  remaining_tenth int  not null,
  photo           text not null check (photo ~ '^[sabc]-[0-9]{1,2}$'),
  is_public       boolean not null default false,
  likes_count     int not null default 0,
  created_at      timestamptz not null default now()
);

create index houses_public_likes_idx on public.houses (likes_count desc, created_at desc) where is_public;
create index houses_public_total_idx on public.houses (total desc, created_at desc) where is_public;
create index houses_user_idx on public.houses (user_id, created_at desc);

alter table public.houses enable row level security;

-- 공개된 집은 누구나(로그인 전 포함) 볼 수 있고, 내 집은 비공개여도 보입니다.
create policy "houses: public or owner reads" on public.houses for select to anon, authenticated
  using (is_public or user_id = (select auth.uid()));
create policy "houses: owner inserts" on public.houses for insert to authenticated
  with check (user_id = (select auth.uid()) and is_public = false and likes_count = 0);
create policy "houses: owner updates" on public.houses for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "houses: owner deletes" on public.houses for delete to authenticated
  using (user_id = (select auth.uid()));

-- 결과(점수·등급 등)는 저장 후 바꿀 수 없고, 공개 여부만 바꿀 수 있습니다.
revoke update on public.houses from anon, authenticated;
grant update (is_public) on public.houses to authenticated;

-- ---------------------------------------------------------------------------
-- 좋아요: 한 사람이 한 집에 한 번
-- ---------------------------------------------------------------------------
create table public.likes (
  house_id   uuid not null references public.houses (id) on delete cascade,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (house_id, user_id)
);

create index likes_user_idx on public.likes (user_id);

alter table public.likes enable row level security;

create policy "likes: owner reads" on public.likes for select to authenticated
  using (user_id = (select auth.uid()));
create policy "likes: owner likes public houses" on public.likes for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.houses h where h.id = house_id and h.is_public)
  );
create policy "likes: owner unlikes" on public.likes for delete to authenticated
  using (user_id = (select auth.uid()));

-- likes_count는 트리거만 바꿉니다 (클라이언트는 수정 권한 없음).
create or replace function public.sync_likes_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.houses set likes_count = likes_count + 1 where id = new.house_id;
  elsif tg_op = 'DELETE' then
    update public.houses set likes_count = greatest(likes_count - 1, 0) where id = old.house_id;
  end if;
  return null;
end;
$$;

create trigger likes_count_sync
after insert or delete on public.likes
for each row execute function public.sync_likes_count();

revoke execute on function public.sync_likes_count() from public, anon, authenticated;
