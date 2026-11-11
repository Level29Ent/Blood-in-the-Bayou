begin;
create schema if not exists bitb_private;
revoke all on schema bitb_private from public;

create table public.bitb_profiles (
  id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  handle text not null unique check (handle ~ '^[a-zA-Z0-9_]{3,24}$'),
  created_at timestamptz not null default now()
);
create table public.bitb_friends (
  sender uuid not null default auth.uid() references public.bitb_profiles(id) on delete cascade,
  recipient uuid not null references public.bitb_profiles(id) on delete cascade,
  accepted boolean not null default false,
  created_at timestamptz not null default now(),
  primary key(sender,recipient), check(sender <> recipient)
);
create index bitb_friends_recipient on public.bitb_friends(recipient);
create table public.bitb_runs (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references public.bitb_profiles(id) on delete cascade,
  category text not null check(category in ('survival','mission','bounties')),
  started_at timestamptz not null default now(),
  finished boolean not null default false
);
create index bitb_runs_owner on public.bitb_runs(owner,started_at desc);
create unique index bitb_one_open_run on public.bitb_runs(owner) where not finished;
create table public.bitb_scores (
  run_id uuid primary key references public.bitb_runs(id) on delete cascade,
  owner uuid not null default auth.uid() references public.bitb_profiles(id) on delete cascade,
  category text not null check(category in ('survival','mission','bounties')),
  value integer not null check(value > 0),
  submitted_at timestamptz not null default now(),
  verification text not null default 'client-reported' check(verification='client-reported')
);
create index bitb_scores_rank on public.bitb_scores(category,value);
create table public.bitb_lobbies (
  host uuid primary key default auth.uid() references public.bitb_profiles(id) on delete cascade,
  code text not null unique check(code ~ '^[A-Z0-9]{4}$'),
  players integer not null check(players between 1 and 6),
  visibility text not null check(visibility in ('public','friends')),
  updated_at timestamptz not null default now()
);

-- Never trust client-supplied timestamps, ownership, elapsed time or acceptance changes.
create function bitb_private.guard_run() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if TG_OP='INSERT' then
    perform pg_advisory_xact_lock(hashtext(auth.uid()::text));
    if (select count(*) from public.bitb_runs where owner=auth.uid() and started_at>now()-interval '1 hour')>=30 then raise exception 'Run rate limit reached'; end if;
    new.owner:=auth.uid();new.started_at:=now();new.finished:=false;
  else
    if new.id<>old.id or new.owner<>old.owner or new.started_at<>old.started_at or new.category<>old.category or old.finished then raise exception 'Immutable run'; end if;
    if not new.finished then raise exception 'Only closing a run is permitted'; end if;
  end if;return new;
end $$;
create trigger bitb_run_guard before insert or update on public.bitb_runs for each row execute function bitb_private.guard_run();
create function bitb_private.guard_score() returns trigger language plpgsql security definer set search_path='' as $$
declare r public.bitb_runs; elapsed integer;
begin
  select * into r from public.bitb_runs where id=new.run_id and owner=auth.uid() for update;
  if not found or r.finished then raise exception 'Run missing or already submitted'; end if;
  elapsed:=floor(extract(epoch from now()-r.started_at));
  if elapsed<5 or elapsed>21600 then raise exception 'Run must last 5 seconds to 6 hours'; end if;
  if new.category<>r.category then raise exception 'Category mismatch'; end if;
  if new.category='mission' then new.value:=elapsed;
  elsif new.category='survival' then
    if new.value>elapsed+2 then raise exception 'Survival exceeds server elapsed time'; end if;
  elsif new.value>least(100,floor(elapsed/20.0)) then raise exception 'Bounty count exceeds rate limit'; end if;
  new.owner:=auth.uid();new.submitted_at:=now();new.verification:='client-reported';
  update public.bitb_runs set finished=true where id=r.id;
  return new;
end $$;
create trigger bitb_score_guard before insert on public.bitb_scores for each row execute function bitb_private.guard_score();
create function bitb_private.guard_friend() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if TG_OP='INSERT' then
    perform pg_advisory_xact_lock(hashtext(auth.uid()::text));
    if (select count(*) from public.bitb_friends where sender=auth.uid())>=100 then raise exception 'Friend request limit reached';end if;
    new.sender:=auth.uid();new.accepted:=false;new.created_at:=now();
  elsif new.sender<>old.sender or new.recipient<>old.recipient or new.created_at<>old.created_at then raise exception 'Immutable friend request';end if;return new;
end $$;
create trigger bitb_friend_guard before insert or update on public.bitb_friends for each row execute function bitb_private.guard_friend();
create function bitb_private.guard_lobby() returns trigger language plpgsql set search_path='' as $$
begin new.host:=auth.uid();new.updated_at:=now();return new;end $$;
create trigger bitb_lobby_guard before insert or update on public.bitb_lobbies for each row execute function bitb_private.guard_lobby();

alter table public.bitb_profiles enable row level security;
alter table public.bitb_friends enable row level security;
alter table public.bitb_runs enable row level security;
alter table public.bitb_scores enable row level security;
alter table public.bitb_lobbies enable row level security;
revoke all on public.bitb_profiles,public.bitb_friends,public.bitb_runs,public.bitb_scores,public.bitb_lobbies from anon,authenticated;
grant select,insert,delete on public.bitb_profiles to authenticated;
grant select,insert,update,delete on public.bitb_friends to authenticated;
grant select,insert,update on public.bitb_runs to authenticated;
grant select,insert on public.bitb_scores to authenticated;
grant select,insert,update,delete on public.bitb_lobbies to authenticated;
create policy profiles_read on public.bitb_profiles for select to authenticated using(true);
create policy profiles_create on public.bitb_profiles for insert to authenticated with check(id=auth.uid());
create policy profiles_delete on public.bitb_profiles for delete to authenticated using(id=auth.uid());
create policy friends_read on public.bitb_friends for select to authenticated using(auth.uid() in (sender,recipient));
create policy friends_create on public.bitb_friends for insert to authenticated with check(sender=auth.uid());
create policy friends_accept on public.bitb_friends for update to authenticated using(recipient=auth.uid()) with check(recipient=auth.uid());
create policy friends_remove on public.bitb_friends for delete to authenticated using(auth.uid() in (sender,recipient));
create policy runs_read on public.bitb_runs for select to authenticated using(owner=auth.uid());
create policy runs_create on public.bitb_runs for insert to authenticated with check(owner=auth.uid());
create policy runs_close on public.bitb_runs for update to authenticated using(owner=auth.uid()) with check(owner=auth.uid());
create policy scores_read on public.bitb_scores for select to authenticated using(true);
create policy scores_create on public.bitb_scores for insert to authenticated with check(owner=auth.uid());
create policy lobbies_read on public.bitb_lobbies for select to authenticated using(
  host=auth.uid() or (updated_at>now()-interval '90 seconds' and (visibility='public' or exists(
    select 1 from public.bitb_friends f where f.accepted and ((f.sender=auth.uid() and f.recipient=host) or (f.recipient=auth.uid() and f.sender=host))
  )))
);
create policy lobbies_create on public.bitb_lobbies for insert to authenticated with check(host=auth.uid());
create policy lobbies_update on public.bitb_lobbies for update to authenticated using(host=auth.uid()) with check(host=auth.uid());
create policy lobbies_delete on public.bitb_lobbies for delete to authenticated using(host=auth.uid());
revoke all on all functions in schema bitb_private from public,anon,authenticated;
commit;
