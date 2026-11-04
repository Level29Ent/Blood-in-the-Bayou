# Superdome / Tremé Bayou Quarter / boxing

Existing detailed procedural Superdome mesh was available but no dome footprint
remained in expanded map. Reserve nearest clear320×288world-unit parcel to mansion,
protecting all buildings,feature parcels(cemetery etc),park,zoo,beach,base,airport,
farm,Greenmart androads. Current placement2016,1120≈96in-game meters from mansion
origin. This is close within city,not forced beside penthouse wall or overwriting
business. Dome is exterior landmark/plaza,not enterable stadium/event simulation.
Original procedural form,not scanned/official licensed branding asset.

Reuse first3existing residential blocks as Tremé Bayou Quarter:9homes/apartment
exteriors get muted colorful porch fascia/shutters,thin wrought-iron-style rails,
address plaques,potted planting and district sign. Inspired by neighborhood
architecture,NOT a geographic recreation or claim of representing its full
history/culture. Existing houses remain exteriors,not9new enterable interiors.
No additional map extent/newhouse density. Planters solid,central porch path open.

Existing unnamed fitness gym becomes Tremé Fight House. Add static ring/post/rope
geometry,modeled coach with gloves,2bags,wall sign. Ring solid for walking;coaching
is a vanilla modal drill with30s cues:OPEN→PUNCH/GUARD→BLOCK,oneaction per1.4s cue,
8clean and≤3errorspasses;once-per-page-session$200gamecash. Free retry,noreal betting,
not physical cage sparring or new hand-to-hand combat physics. U inside opens drill;
Escape/CLOSE exits,input isolated/game paused as existing shop. Existing gym
progression API/IDs retained but U interior prioritizes boxing coaching.

Ring reservation initially blocked station;recompute nearest collision-clear
service position after additions and move visible pad through inverse world
transform. Local actual-launcher verifies station clear and bounds finite;
makeLevel29Superdome uses existing renderer,not duplicate dome rendering.

368Node tests pass before finalkeyboard-only tweak,full latest results inPR.
Tests:dome safe parcel selection,road/cemetery buffers,drill pass criteria. Local
current-world scene includes9Tremé homes,gymring,clear player service and finite
dome bounds. Build/TypeScript reported inPR;real GPU/fullcity scene/physicalSafari
FPS unverified until preview. No crash-fix claim. Web-only source,no nativeZIP.
