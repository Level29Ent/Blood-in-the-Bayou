-- Optional manual game backups; never store access tokens or auth session records here.
begin;
create table public.bitb_cloud_saves (
  owner uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 2097152),
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);
alter table public.bitb_cloud_saves enable row level security;
revoke all on public.bitb_cloud_saves from public, anon, authenticated;
grant select, delete on public.bitb_cloud_saves to authenticated;
create policy own_cloud_read on public.bitb_cloud_saves for select to authenticated using (owner = auth.uid());
create policy own_cloud_delete on public.bitb_cloud_saves for delete to authenticated using (owner = auth.uid());
-- An atomic compare-and-swap prevents silent last-writer-wins across devices.
create function public.bitb_put_save(payload jsonb, expected_revision bigint)
returns bigint language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); next_revision bigint;
begin
  if uid is null then raise exception 'Sign in required'; end if;
  if payload is null or jsonb_typeof(payload) <> 'object' or octet_length(payload::text) > 2097152
    or jsonb_typeof(payload -> 'level29.campaign.v2') is distinct from 'string'
    or expected_revision is null or expected_revision < 0 then
    raise exception 'Invalid save payload';
  end if;
  if expected_revision = 0 then
    insert into public.bitb_cloud_saves(owner,payload) values(uid,payload)
      on conflict do nothing returning revision into next_revision;
  else
    update public.bitb_cloud_saves s set payload = bitb_put_save.payload,
      revision = s.revision + 1, updated_at = now()
      where s.owner = uid and s.revision = expected_revision
      returning s.revision into next_revision;
  end if;
  if next_revision is null then raise exception 'Cloud revision conflict; check the latest copy'; end if;
  return next_revision;
end;
$$;
revoke all on function public.bitb_put_save(jsonb,bigint) from public, anon;
grant execute on function public.bitb_put_save(jsonb,bigint) to authenticated;
commit;
