# Southern noir expansion: implemented scope and limits

This is original stylized Three r149 artwork, not UE5, scanned photoreal models,
or an accurate geographic recreation of I-10/any real plantation or agency.

## Renderer
Existing single renderer preserved. ACES and exposure1day/1.08dusk/1.2night,
r149 EffectComposer with SSAO,subtle UnrealBloomPass,High-only BokehPass in talk/
city-story cutscenes,final sRGB grade. No blur in normal gameplay. Composer sizes
remain capped1280High/800Medium,Medium0.6drawingbuffer. Low allocates no composer
or HDR PMREM. Original analytic64x32HDR(~8KB),RGBELoader/HalfFloat/PMREM,sharedscene
and weapon reflection texture. NOT an external photo HDR. HDR source/PMREM generator
disposed after conversion;Low/context loss disposes environment target. Shared
256²PBR normal/roughness/metalness textures preserve authored maps and scalar
metalness (stone/skin nonmetal),emissive signs/sprites/water shaders intentionally
excluded. PCFSoftShadowMap,one sun shadow512Medium/1024High updated8/4frames,Lowoff.
No guarantee of zero GPU spikes or Safari crashes; those require device profiling.

## Road and locations
Existing tested 85%-elevated road heights/exits preserved,not raised over every
building. Heavier barriers,pier footings/caps,cylindrical support piers50units
apart,striped lane/edge paint,overheadgantries. Under-pier collision added separately
from deck collision. I-10-inspired textural/detail pass,not replica interchange.

Five enterable new parcels avoiding existing buildings/roads/features and protected
zoo/park/base/airport/farm: MossFallManor,CypressJukeJoint,SouthernIronScrapYard,
BlackwaterSawmill&Fishery,FederalQuarantineOutpost. Safe south-facing road access.
Manor$12000deed,hidden basement weapon workshop,existing ownedgun racks/decor/stash/
rareitem APIs reused. Ronniebaby remains private. JukeJoint offers existing radio
and$100health;garage supports fence(nonownedstoppedvehicle)/existingcustomization;
sawmill has log/machine cover;federaloutpost guardtowers/armor/supplies. No federal
player hostility or gangs restored. Four-player social simulation/new music tracks
NOT added;existingmultiplayer/radio remains. Site placement is available land—not
an exact waterfront/remote/geographiclocation. Survival contract60s+clear spawned
zombies,$1500;guarded initialcap48;zombiecombatonly;outpostfirstcompletion unlocks
.50rifle/5rounds. Existing contracts/objectives retained,no factionassaultcampaign.

Creole cemetery replaces old tomb-rendering pass,keeps dedicated parcel,creates
stonecrypts,ironboundaries,48unitentry,moss. Newperimeter/tombcolliders match props.
No cemetery/road businesses erased.

## Combat/environment
.50anti-materiel rifle5roundbase,drumSMG60roundbase,existing ammo/reload/attachments
integration. Existingtenweaponprices preserved. No armored vehicle ballistic
simulation or motioncapture/takedown character replacement. Xmelee:infront48units,
LOS,2damage/stagger;unalerted rear attack is silentlethal. F8flash/F9smoke:2each
perpage,max6on$300supplykit;nearbyzombiestuns,smokehas7svisiblecloud/localAIreset.
Not a general physics/AI LOS rewrite;nohostilepolice/gangs. UI buttonsdesktoponly;
keyboard and mobile action drawer supported.

Breakable approachcrates,lightpoles and fuelpumps(two selectednewsites),precisegun
ray vspropbox andocclusioncheck. Fuelpumps small player-attributedexplosion.
Not all existing worldprops destructive,no rigidbody debris or explosion-resistant
cover physics. Reactive snappingturtlehazards+existingalligator systems;shared
instancedgrass vertexshader bendsnear player/vehicle,hiddenLow. Two reusedplayer
headlights:12-sample fogcone integration and spot projections,offLow. Not shadow-
occluded godrays and NOTnewconesoneveryworldlamp;existingboundedstreetpool remains.
Ownednewshaders/materials disposed on rebuild. No infinite particleemission.

## Screening and assets
Poster gallery uses suppliedmovieart. Actual HTMLvideo player readyfor up to4
sameorigin licensedMP4/WebM entries in /game/media/trailers.json:
{"trailers":[{"title":"VIRAL teaser","src":"/game/media/viral-teaser.mp4"}]}
Video preloads none,manualcontrols. No movievideoswereprovided,so none playsyet.
No fabricated footage/new soundtrack. NativeiOSsourceZIPnotrefreshed.

## Evidence
380Node tests pass,build/TypeScript pass before last manifest-only change;final
checks recordedinPR. Newtests originalHDRdecode,sharedPBRmaps,parcelprotection,
magazinecapacities,meleecones,ACES/bloom/DOFquality/disposal. ActualnonGPU scene
checks fiveentrances,manorpurchaseandcellarroundtrip;61venues;geometryattribute
bytes≈145MB vs prior137MB,NOTGPUMemory/RAMusage. Fullcity12kmeshes is stillheavy.
Initial repeated generation cost8seconds;validated parcel reuse reduces the measured repeat to0.44seconds. Allchapter playthrough not verified. GPU
review /game/expansion-demo/southern-noir.html uses actualcinematicpipeline in a
smallfixture;no fullworld/deviceFPSclaim. SeePRforrenderedverificationandgaps.
