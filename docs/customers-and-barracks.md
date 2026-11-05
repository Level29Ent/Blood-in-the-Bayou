# Nearby customer population and reference-inspired barracks

Shared NPC pool: Low6/Medium10/High14 globally, not per business. Public venue
registry+individual mall bays; privatehomes/police/hospitals/military excluded.
Tiny snowball trailer uses exteriorwaitingarea offpublicroad. Slots avoid walls,
furniture,door/servicepad; browsing takes small checked steps, not full AI errands.
Customerfiguresnoncombat,norewards/noincreasedzombies/noextraphysicsbody. They do
not block the player. Existing casino patrons remain;not every business rendered
simultaneously. Onlynearby/currentmallfloor active,hiddenunderground/streamedrooms.
Globalpoolreusedacrosscityrebuilds,mergedlimbbatchespreserveanimationhooks,only
ownedmergedgeometryandprimaryownedmaterialreleasedpagehide. Assign scan.75s.
No customer purchase transactions or complete navmesh/civilian dialogue system.

Barracks: original compactthree-storyBEQstyledexterior,brickbands,repeatedmetal
windowframes,centralenclosedstairtower/entryandstanding-seammetalroof. Original
190×100footprintkept,roof114height. ModeldoesNOTreplicateanexactexistingbuilding
orCampLejeune'smap;noactualmilitarylayout/floorplan. Barracksremainsexteriorsolid,
notawalkablemultifloorinterior. Powell/8troops/targetcourseunchanged.
Publicarchitecture references:
https://caddell.com/project/camp-johnson-beq-camp-lejeune-nc/
(two three-storybrickveneer/concretemasonrybuildings,standing-seammetalroof)
https://www.pgal.com/portfolio/navfac-camp-lejeune-stone-bay-bachelor-enlisted-quarters-beq/
(three-storyBEQs/modernGeorgianstyle)
No third-party mesh,photo textures,logos or floorplans copied.

475tests/build/typecheckpassbeforemallfloorvisibilityguard,focusedtestsrerunafter.
Actualworldinitialcoverage74sites/73usable,onlyFeliciatrailertoonarrow;outdoor
queueadded. FinalfullworldcoverageandGPUreviewresultsinPR. Isolatedreviewuses
productionbarracksbuilder/customerlogicandbasefpfigurefactory,notfullgameor
realSafariFPSproof. Existingcrash/performanceissueNOTclaimedresolved.
NativeZIPnotrebuilt;requiresseparatenativesync/releaseforinstalledapps.
