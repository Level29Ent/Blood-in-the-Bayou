-- =====================================================================
-- Level 29 · Blood in the Bayou — Building Management schema
-- Apply with: supabase db push  (or paste into the Supabase SQL editor)
-- Player identity is a device-generated id (the game has no login yet),
-- passed to the REST API as a filter. RLS keeps every device to its rows.
-- =====================================================================

create schema if not exists bitb;

-- ---------------------------------------------------------------------
-- Catalog of buildable structures. Server-side mirror of the in-game
-- BLUEPRINTS catalog (public/game/building-management.js). Prices and
-- yields are denominated in fictional in-game cash.
-- ---------------------------------------------------------------------
create table if not exists bitb.blueprints (
  bp_id       text primary key,              -- 'shack', 'distillery', ...
  name        text not null,
  w_tiles     int  not null check (w_tiles between 1 and 8),
  h_tiles     int  not null check (h_tiles between 1 and 8),
  cost_cash   numeric(12,2) not null check (cost_cash >= 0),
  build_sec   int not null check (build_sec between 1 and 3600),
  cash_per_hr numeric(12,2) not null default 0,
  requires_road boolean not null default false,
  water_only  boolean not null default false,
  radar_m     int,                            -- watchtower detection radius
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- One row per player-owned structure. city_key matches the client's
-- district id ('world', 'nola', 'la', ...). The full structure record
-- (uid, position, build state) is stored in the jsonb column so the
-- client can round-trip its save format without a rigid column set.
-- ---------------------------------------------------------------------
create table if not exists bitb.player_buildings (
  player_id  text not null,
  uid        text not null,
  city_key   text not null,
  bp_id      text not null references bitb.blueprints(bp_id) on delete cascade,
  x_px       int not null check (x_px >= 0),
  y_px       int not null check (y_px >= 0),
  structure  jsonb not null,                  -- full client record
  created_at timestamptz not null default now(),
  primary key (player_id, uid)
);

create index if not exists player_buildings_city_idx
  on bitb.player_buildings (player_id, city_key);

-- ---------------------------------------------------------------------
-- Construction ledger: one row per placement. Costs are tracked here so
-- the game can show total spend and so yields can be audited against
-- what was paid (server-side integrity, optional to read client-side).
-- ---------------------------------------------------------------------
create table if not exists bitb.construction_costs (
  id          bigint generated always as identity primary key,
  player_id   text not null,
  uid         text not null,
  city_key    text not null,
  bp_id       text not null,
  cost_cash   numeric(12,2) not null,
  duplicates_of_type int not null default 0,   -- countAtBuild: escalation input
  built_at    timestamptz not null default now()
);

create index if not exists construction_costs_player_idx
  on bitb.construction_costs (player_id, built_at desc);

-- ---------------------------------------------------------------------
-- Yield ledger: one row per accrual batch the client collects. The
-- server records what the client claims so offline progress can be
-- capped and reconciled (8h cap enforced client-side and audited here).
-- ---------------------------------------------------------------------
create table if not exists bitb.resource_yields (
  id          bigint generated always as identity primary key,
  player_id   text not null,
  city_key    text not null,
  cash_amount numeric(12,2) not null check (cash_amount >= 0),
  covered_seconds int not null check (covered_seconds >= 0),
  collected_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Helpers mirroring the client's economy rules.
-- ---------------------------------------------------------------------
create or replace function bitb.cost_for(bp bitb.blueprints, dup_count int)
returns numeric language sql immutable as $$
  select round(bp.cost_cash * power(1.18, dup_count) / 50) * 50;
$$;

create or replace function bitb.yield_rate_for(bp bitb.blueprints, dup_count int)
returns numeric language sql immutable as $$
  select round(bp.cash_per_hr * (1 - 0.04 * least(dup_count, 10)));
$$;

-- Server-side check of a claimed accrual: max 8h per structure per claim.
create or replace function bitb.check_yield_claim(
  p_player text, p_city text, p_cash numeric, p_seconds int)
returns boolean language sql stable as $$
  select p_cash >= 0 and p_seconds <= 8 * 3600;
$$;

-- ---------------------------------------------------------------------
-- Row Level Security: the game has no login yet, so each device is
-- identified by a generated player id that the client sends both as a
-- query filter and as the x-player-id header. These policies keep every
-- device to its own rows.
-- ---------------------------------------------------------------------
create or replace function bitb.requested_player()
returns text language sql stable as $$
  select nullif(current_setting('request.headers', true)::json->>'x-player-id', '')
$$;

alter table bitb.blueprints          enable row level security;
alter table bitb.player_buildings    enable row level security;
alter table bitb.construction_costs  enable row level security;
alter table bitb.resource_yields    enable row level security;

-- Catalog is readable by everyone, writable only via the dashboard/CLI.
drop policy if exists "catalog is public read" on bitb.blueprints;
create policy "catalog is public read" on bitb.blueprints
  for select using (true);

drop policy if exists "players manage own buildings" on bitb.player_buildings;
create policy "players manage own buildings" on bitb.player_buildings
  for all using (player_id = bitb.requested_player())
  with check (player_id = bitb.requested_player());

drop policy if exists "players log own costs" on bitb.construction_costs;
create policy "players log own costs" on bitb.construction_costs
  for all using (player_id = bitb.requested_player())
  with check (player_id = bitb.requested_player());

drop policy if exists "players log own yields" on bitb.resource_yields;
create policy "players log own yields" on bitb.resource_yields
  for all using (player_id = bitb.requested_player())
  with check (player_id = bitb.requested_player());

-- ---------------------------------------------------------------------
-- Seed the catalog from the live game values (idempotent).
-- ---------------------------------------------------------------------
insert into bitb.blueprints (bp_id,name,w_tiles,h_tiles,cost_cash,build_sec,cash_per_hr,requires_road,water_only,radar_m) values
  ('shack','TRAPPER SHACK',2,2,4500,30,900,false,false,null),
  ('greenhouse','GATOR GREENHOUSE',3,2,12000,75,3200,false,false,null),
  ('smokehouse','SMOKEHOUSE',3,2,18000,90,5200,true,false,null),
  ('watchtower','WATCHTOWER',2,2,15000,60,0,false,false,2000),
  ('distillery','BAYOU DISTILLERY',4,3,45000,150,13500,true,false,null),
  ('trapdock','CRAWFISH DOCK',3,3,30000,120,9500,false,true,null),
  ('depot','SUPPLY DEPOT',4,4,60000,210,19000,true,false,null)
on conflict (bp_id) do update set
  name=excluded.name, w_tiles=excluded.w_tiles, h_tiles=excluded.h_tiles,
  cost_cash=excluded.cost_cash, build_sec=excluded.build_sec,
  cash_per_hr=excluded.cash_per_hr, requires_road=excluded.requires_road,
  water_only=excluded.water_only, radar_m=excluded.radar_m;
