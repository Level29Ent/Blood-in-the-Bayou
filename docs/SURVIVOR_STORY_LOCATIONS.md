# NOLA survivor stories and regional expansion

Original procedural assets retained; independent optional story board under Pause. Main210-mission campaign,player cash,legacy properties/garage/casino records remain. Six clearance-checked parcels add cathedral square,pharmacy,barn,grain yard,evacuation supply camp and hospital. Existing stadium receives evacuation signage/tower/barricade dressing; the separate safe camp avoids filling existing sport missions with permanent enemies. Not geographic/scanned replicas.

## Buildings

- St.Louis Cathedral-inspired triple-spire shell,walk-in center nave/pews,brick Jackson Square paths,artist fence and antique shop-front blocks. Stores are exterior cover; no merchant behavior added to every antique façade.
- Existing sports stadium/Superdome stays; bounded evacuation camp provides concrete cover,supply-tent shapes,tower housings. These are not dynamic shadow-casting searchlights or multi-floor stadium interiors.
- Old land casino exterior disabled and its previous site becomes open plaza. Same casino object/key follows a moored paddlewheel hub at(6656,6208),three decks:gaming,armory,roof H pad/barricades. Board from marked harbor entrance,UP/DOWN/EXIT controls. Only active interior deck visible; pad is decorative,not a new helicopter. Wheel rotates; the hub is moored,not driveable. Board/exit uses scripted transition rather than a physical1kmgangway. Existing earned-cash gaming via deck0 Trade/Gaming. Slots/save data retained. Multiple old generic casino detail wrappers may still need final visual review at their relocated source positions.
- Separate abandoned hospital shell and4streamed floors with clinical furnishings,stretcher/blood/shattered-window styling and2contained animated infected on fourth-floor biohazard ward. Existing General Hospital care missions remain. Contained figures are not a new damageable mutant AI species. One surgical kit saved as rare locker item,heal/armor; pharmacy offers one-session emergency supplies.
- Pharmacy aisles,pill bottle silhouettes,prescription screens and cooler partitions; not a simulated refrigeration system or all-prop destruction conversion.
- Grain silos,overhead conveyor shape,stacked cover containers and crane frame on checked inland waterfront approach. No moving barges/crusher simulation. Streetcar barn has2staticgreen cars/rails/benches and short overheadwire span; no map-wide electrified rail service or sliding bay-door animation.

## Five optional narratives

Equipment:recover marked warehouse crate,clear incoming zombies,return. Crypt:key in cathedral,enter separate below-ground vault,claim upgradecase,return. City Park:activate beacon,remain near it for180active seconds with capped waves,short six-second scripted park-boat extraction andreturntodock. Lab:clear infected hall,claimsample,leave before180s. Riverboat:board hub,clearlower/upperbrute decks,interactgenerator,claimblueprint. Completed stories pay once;savedcompletion prevents repeatedmissionpayouts. Crypt grants owneddrumSMG/ammo andriverstoryownedanti50/ammo plusblueprint record; no per-attachment fabrication menu is implied.

Objectives use N marker and subtitle/voicecue CustomEvent; recording script `docs/voice-recording/Survivor-Story-Radio-Cues.txt`. No new recorded voice is present. Mounted defense has a60roundbudget andrequires crosshair alignment/clearline; no auto-kills or infinite ammo. Existing firearm/melee/entity pathing/blood effects reused. Enemy population cap44atnewspawn and4perwave. Existing friendlyUFO/nightcap andprotectedzoo unchanged. Fullcombatbalance anddeckverticalhitbehavior must be playtested.

## Player presentation

Vehicle entry adds0.85s camera easing/kneel arc with cosmetic opening-door proxy;vehicle heldbraked/weapons gated duringtransition. Original bodyisnotriggedforfullhand-on-handle/climb-inanimation;existingdoorpanelmeshdoesnotphysicallyhinge. First-person procedural gloves/fingers slimmed and spaced aroundgrips. Not a motion-capture/photorealistic character upgrade.

## Verification and limits

Tests cover bounded instancing/transforms,stageguards,pause-friendly180seconddefense,death/timeoutnopay,boatdeckmetadata andsmoothentrycurve. NonGPUsourceharnesscanforceenemiesdead toverifyobjective/rewardchain;thisisnotarealcombatplaythrough. Allpublicpath/door/floorchecks distinctfromGPUscreenshot/phoneperformance. ExistingKTX2/PBR/Lowqualitybudgetretained,noextraeffectchain. No60FPS/allbugs/crash-freeguarantee. NativeZIP refreshed,notcompiled/signed. Keepdraftuntil latestcommitpreview evidence recorded.
