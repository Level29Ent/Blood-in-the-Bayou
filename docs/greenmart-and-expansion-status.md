# Greenmart and Stage 2–4 status

## Implemented in this patch

Greenmart is an original two-story neighborhood superstore on added land east
of the housing blocks (world 2912,5280; footprint 352×288). No residential or
civic building is replaced. Ground floor has produce/groceries/frozen food;
upper floor has home/apparel/electronics displays, with stocked shelf rows,
checkout counters/terminals, two U/USE lifts, green fascia/signs, parking and
neighborhood road connection. G map marker identifies its entrance.

Both floors are occupied physical spaces: base Y=0/56, solid shelf/wall lists,
48-unit ground doorway, upper exterior bounds, lift return to ground. Zombie
spawn is excluded; indoor protection uses existing safety mechanism. Checkout
costs $75 fictional game cash for up to +50 health, with full-health and
insufficient-funds guards and existing campaign save hook. Other department
merchandise is decorative; no full grocery inventory/ownership system implied.
The lift is functional vertical transport, not an automatically moving escalator.

304 Node regressions pass. New tests check housing clearance, two floor plans,
checkout debit/health cap, actual lift roundtrip, upper exit boundary,
player-sized entrance/checkout and spawn exclusion. Actual-launcher local
DOM/Three harness enters from street through full collision wrappers, uses
both lift directions at 56-unit height, checks upper boundary and makes a
checkout purchase with the expected balance/health. No rendered appearance
proof from those source/scene checks. Build/native/preview results in PR.

## Stages are NOT marked complete

The user requested complete Stages 2, 3 and 4 as well as Greenmart. This patch
implements Greenmart only. The existing stage roadmap is retained, not replaced
with a claim that all those systems are done. It is important not to count a
configuration object, menu, source kit or decorative asset as fully integrated
and playtested gameplay.

### Stage 2 pending

Ten new actual weapons and ten vehicle types, first-person/third-person model
integration/ownership/purchases/saves, weapon attachments with actual combat
stat changes, full garage materials/tints/underglow/rim/performance persistence,
render-target rearview and safehouse furnishings/storage/safe timing gameplay.
Existing hydraulics and owned weapon racks are useful baseline features but
are not completion of Stage 2. No new weapon or car is added in Greenmart patch.

### Stage 3 pending

Studio beats, underground fight club, food-plaza/chop-shop mechanics, arcade
cabinet links, dispatch/bounty/delivery/smuggling/night-heist sequences, gangs/
territory/police/media escalation/roadblocks, emergency response, fuel/tolls,
property unlock and separate spare weapon/item/cash storage. Source-kit versions
in PR #50 remain unwired unless expressly integrated/tested in a later change.

### Stage 4 pending

Recorded faux radio commercials/station IDs, mission/business transitions,
shootout dive/drift/jump slow motion with shared simulation timing, fog/god-rays,
film grading/grain/impact aberration, physical headlight/brake-light effects,
carwash suds, reactive water/ripples/tire tracks and deeper business-specific
room rendering/fixtures. Existing baseline weather/lighting/props do not prove
these additional requests complete.

### Inputs needed for exact finishing work

- Actual public HTTPS merchandise checkout links and prices. Existing store
  buttons remain disabled; do not invent prices/URLs or enable fake checkout.
- Radio ID/commercial recordings, or an agreed supported audio-production path.
  Text/subtitle placeholders are not recorded commercials. No audio generation
  provider is configured in this source patch.
- Physical-device playtesting for expensive rearview/render/fog/light changes
  once implemented; automated source tests are not a mobile performance proof.

No save reset, ad activation, real payments or production promotion here.
Installed native apps need a signed release of the refreshed source bundle.
