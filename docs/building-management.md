# Level 29 · Building Management

Player-owned construction for Blood in the Bayou: place new structures in the
open world, pay escalating construction costs, wait out the build, and collect
hourly resource yields. Everything is validated against the live city grid
before anything is built, and every structure is painted onto the player's
ground texture and minimap.

## Player flow

1. Press **Y** in play mode to open the construction menu.
2. Pick a blueprint with the number keys **1–7** (or click a row).
3. A ghost of the structure follows in front of the player. **T** toggles
   16px grid snapping.
4. Press **X** to place. The cost is charged and a construction site
   (scaffolding) appears.
5. When the build timer finishes the finished structure takes its place.
6. Completed structures earn cash every hour. Yields keep accruing while you
   are away, capped at 8 hours offline.

## Blueprints

| # | Structure | Cost | Build | Yield | Needs |
|---|-----------|------|-------|-------|-------|
| 1 | Trapper Shack | $4,500 | 30s | $900/hr | clear grass |
| 2 | Gator Greenhouse | $12,000 | 75s | $3,200/hr | clear grass |
| 3 | Smokehouse | $18,000 | 90s | $5,200/hr | road frontage |
| 4 | Watchtower | $15,000 | 60s | radar 2000m | clear grass |
| 5 | Bayou Distillery | $45,000 | 150s | $13,500/hr | road frontage |
| 6 | Crawfish Dock | $30,000 | 120s | $9,500/hr | open water |
| 7 | Supply Depot | $60,000 | 210s | $19,000/hr | road frontage |

- Costs escalate 18% per structure of the same type, rounded to $50.
- Yields shrink 4% per duplicate (max 10 duplicates counted).
- Each city (world or district) holds at most 12 player structures.

## Dynamic placement validation

`validatePlacement` in `public/game/building-management.js` checks, per
placement attempt:

- 2-tile margin from the map edge
- every footprint tile must be clear grass/park (or open water for docks)
- no overlap with generated buildings, venues or landmark features
- 16px separation from the player's other structures
- road frontage within ~3 tiles for frontage-dependent blueprints
- the per-city structure cap

Placement, completion and yield collection repaint `groundCv` (the 3D ground
texture), `miniCv` (the minimap) and add gold map blips per structure.

## Persistence and cloud sync

- Local save: `localStorage['level29.buildings.v2']` per device, synced into
  the campaign save via `level29Save`.
- Optional cloud sync: set `window.BITB_BUILDING_DB={url,key}` (Supabase
  project URL + publishable key) before this script loads. The client then
  pulls on load and pushes on every change via the Supabase REST API,
  identifying itself with the `x-player-id` header.

## Database schema

`supabase/migrations/0001_bitb_building_management.sql` creates the `bitb`
schema:

- `bitb.blueprints` — catalog (seeded to match the game values)
- `bitb.player_buildings` — one row per structure (player_id, city, position,
  jsonb record)
- `bitb.construction_costs` — ledger of every placement charge
- `bitb.resource_yields` — ledger of collected yield batches
- helpers `bitb.cost_for` / `bitb.yield_rate_for` mirror the client economy,
  and `bitb.check_yield_claim` audits the 8-hour offline cap
- RLS: each device only reads and writes its own rows (via the `x-player-id`
  header); the blueprint catalog is public read

Apply it with the Supabase CLI (`supabase db push`), the dashboard SQL
editor, or the platform's migration tooling. To enable cloud sync in the
game, add before the script tag:

```html
<script>window.BITB_BUILDING_DB={url:'https://<ref>.supabase.co',key:'<publishable key>'};</script>
```

## Tests

`node --test tests/building-management.test.cjs` covers the catalog, cost
escalation, yield diminishing returns and the offline cap, placement
validation (terrain, edge, overlaps, spacing, caps, water rules, frontage),
build timing and accrual math.
