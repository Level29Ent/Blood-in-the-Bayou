# City depth expansion — exact scope, not a full requested cinematic campaign

Original procedural/stylized models. No realistic character/animation asset pack
or new recorded soundtrack/scanner audio is created in this patch.

## Integrated
12 enterable locations (cached dry protected parcels, public road approaches):
Production Studios, Crescent Records, Creole Night Diner/Truck Stop, Seafood/Bait,
Drive-Thru Carwash, Crescent Donuts, Moonlit Botanica, Freight Depot, Waterfront-
themed Warehouse, Perimeter Surplus, Gateway Pawn, Mess Stop Fast Food.
Base strip measured20/23/32in-game meters from gate. Waterfront-themed sites use
nearest available safe land;not guaranteed directly on a dock/launch. Existing
pawn/garage/juke/radio businesses retained,not replaced. Public businesses preserved.
Studio soundstage/camera/light rigs/movie posters and accessible280-unit glass-
colored tower roof via service lift. Roof bounds collision/Ureturn. Not a furnished
multifloor skyscraper or photo-real window asset. Existing carwash brushes/spray
loop reused with explicit $250washCar binding;working repairs/heat reduction.
Donut rooftop torus rotates,booth counters/health meals. Containers/crane/freight
car scenery but no physical freight train-hopping gameplay in newdepot.
Casino320×288vs224×192=2.14×usablefloorarea,10seated/tablepatrons with small arm/head
animations;working existing slots/tablemenus retained. NPCs don't simulate balances
or actually gamble. Newbasecommunications/fieldkitchen/crates. Instanced160maxshrubs,
no separate drawperplant or extra light pool. Public entrances/marksmanrange kept.

Skin shader: non-zombie figures replace skin material only with Standard(.72rough,
zero metal),small warm view-angle wrap at output stage. NOT true SSS/transmission
through ears or anatomical skin/tissue maps,newriggedlikenesses remain unfinished.
Water96×96subdivision,smallvertexwaves,scrollingnormalmap,existing8wakeimpulses/
8foamrings/32droplets retained. Medium/High only;Low retains direct water material.
South half westernshore gets safe sandtiles/umbrellas and one foam edge strip;
northernshore/offshore lanes remain bayou. Not draining halfocean or deletingdocks,
farms/park/etc. Existing easternbeach/shark swimming preserved;newwesternstrip
isnot a fully equipped shark/swimming destination. Approximatefoam,not depth-based
shoreline blending on everypond. No new complete global water/reflection rewrite.

One192particlepoints pool,24instanced blooddecal slots, reused typedarrays. Actual
existing wall/car bullet collisions emit concrete dust/metal sparks. Gore hook adds
bounded bloodparticles and nearbywall/pavementsplats. Not permanent character-model
blood maps,meshdismembermentor physicaldebris. Friendly NPCskinnotdupedperframe.

Businessservices:meals,coinfencing/weaponmenu,existingRonniebabyplaylist,artistcourier
(existing delivery),bait/health,botanicarmor,existinggarage/customization. No invented
newlicensedrecordings,no Spotify trackunlock API,not neweconomy forstolenparts.

## Contracts (new optional board, not replacements for 210 campaign missions)
F10/mobileboard selects Scout(+30s) or Medic(+25health),not physicalcrewNPCs.
Overpass:3Uinteractionsforcharge→sixmission-onlytacticalhumans→manorescape;
Smuggler:boardexistingboat→marinadelivery→manorescape;
Galleria:3Uterminal→3Uloot→manorescape;
Turf:twogroupsofrivalhumans→manorescape;
ProtectionResponse:onegroupnearpawn→manorescape,explicitopt-innotautomaticextortion.
Limited6opponents/wave,gunmeshes/muzzleflash/LOSshots,3damageper1.5s,rayvs10radius
hitboxforequippedplayergun.Humans usehealthandpose/damage,nofreeroamgang/police
AIrestoration. Abort/death/timer cleanup,partialprogressnotpersisted. Fixedcontracts
rewardgamecash/respect;repeatable. BoardcorkgeometryinsideplayerManor,notprivate
Ronniebabyhome. UI inputisolated. No actualmovingarmoredconvoy/explosiveplacement,
syndicatespeedboatchase,multitierterminal/securitysim,policegaragepursuitor persistent
territorycontrol/blueprintdrawing. Juke/scrapbrawl is timed-button existingmechanic,
not accessibleundergroundcagefullbodyhand-to-handcombat. These requests remain open.

## Evidence/limits
387Node tests/build/TypeScriptpass beforelastwallplacementaddition;finalchecks inPR.
Tests sharedskinshader actualr149chunk,sitecatalog,contractstageadvance,foamfalloff;
existingwaterhooktestsload actualmaterialhelper. ActualnonGPUlauncherscene:
13entrances(12new+casino)clear,roofroundtrip,2.14casinoratio,10patrons,623sandtiles,
base-stripdistances. Overpasscharge/defend/escape withforcedopponenthealthcompletion
verifies$6500exactpayout/cleanup—not a combatplaytest. Scenegeometryattributes≈166MB
vs159MBbefore,notGPURAM. SourceadditionsstillincreaseCPU/worldsize;nocrash/FPSclaim.
New venuefirstsearchslow;cache reuses occupied-safe parcels. Longallchapter/campaign,
newcontracts,boatroute and actualdeviceplaytest notcomplete. NativeiOS ZIPnotrebuilt.
GPU/fullcitypreview results inPR. No claimtheentireverylargefeaturelistisfinished.
