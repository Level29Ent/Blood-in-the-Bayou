# Requested district relocation and trailer

Coordinated generation after expanded destinations but before Tremé/Southern
allocation. No wholesale reset of world,venueIDs,missionIDsor savekeys. Existing
public venues,cemetery,zoo,park,airport,obstaclecourse androadsprotected. Generic
anonymousscenery maybe replacedfor downtownhomes/dome,not businesses. The five
Southernvenues reallocate around these reservedparcels automatically.

## Placement
Militarybase:4352,416,768×768,25.6in-game meters east of confidencecourse
3808,672,288×288. Translate originalbasebuilding refs,command,gate,solids together;
Powell,troops,medic,targets read newbase dynamically. Oldbaseinterior revertsgrass;
existing publicroads outside abandoned footprint unchanged.Newgate road path.

Farm:3744,4992,384×224vs256×224 before =1.5area,3.2in-game meters north of zoo.
Metadata/terrain/entrance/animals/barn/equipment/maps all use newfarm reference.
Oldfarm interior releasedgrass;olderpublicbypass roads left intact. 24animals,
6exhibits(cow,pig,chicken,goat,sheep,duck),fencecolliders/feedingtroughs/labels.
Goat/sheep/duck use adaptedexistingoriginalanatomy/wool/horns/beak,not newscanned
models. ExistingUfeeding service preserved. Newfarmroadapproach doesn't cutpens.
Zoo's eightwildlifespecies/size remainunchanged;this expands FARM,not zooarea.

Tremé:8new narrowshotgun-stylehouseexteriors near Ronniebaby,using existing
neighborhoodrenderer plus porch/shutter/ironrail/planterdetails. Preserved Decatur
houses,onlyTremé art theme movesnear mansion. Checkedclosestland parcels yield
homes primarilywest/south of mansion,not continuous360degree ring.Drynearbyland
limitedbyexisting venues/roads;no businesses removed just to force symmetry.
Homes are exterior scenery,not newpurchasableinteriors. Planters skip walkingpaths.

Superdome:previous320wide allocationforced itwest. New256×256dedicateddowntown
parcel1984,1088 with publicstreet approach,entrance2112,1364. Originalmesh fitsnew
footprint;not an enterablestadium/fullsizegeographicreplica.NoCaesars/Level29prefix.

11BFSaccesspaths:base,farm,dome,8homes.Narrowfarm-zoo gap is playerwalkable;
cellcollision check8radius alongpaths,10atdestinationgate,farm,dome passes.
Flatdestinationfoundations,trees/rocks/parkedcarsremoved only fromnewparcels/access.
Road/grids/sharedmetadata coherent;oldclippedTremé planter removedfromroute.

## Trailer
UservideoIDjy8lyAr8620 in manormenu WATCHOFFICIALTRAILER (manordeenownershiprequired).
No rawiframeHTML interpolation. ClickPlay constructs validatedyoutube-nocookie
embed,autoplayoff,rel0,fullscreen,strictoriginreferrer;external requestonlyonclick.
Close/Escape removesiframe/stopsplaybackand returnsstate;controlsstoppropagation.
OpenonYouTubefallbacklink. Signed-outplayer review/game/expansion-demo/trailer.html
uses same module.No bundledcopy/download ofvideo.No trailer title guess.
Externalreadtimedout,ownerembeddingpermissions/age/region restrictions unverified.
ManorposterMP4/WebMmanifest supportunchanged.NativeiOS ZIPnotrebuilt.

## Verification
383Node tests pass,build/TypeScriptpass.Testsparcelprotection,roads,noarbitraryembed.
Actual-launcher nonGPU generationall7chapters gives samerelocatedmetadata.
Fullcityscene:24farmanimals/6exhibits,8homes,11clearpaths,base/course/farmzoogaps,
traileriframecorrectID/lazycreation/removal. Existing5Southernentrancesandmanor
purchase/cellarroundtripstillpass.Sceneattributegeometry≈159MBversus145MBbefore,
not actualGPURAM measurement. Newanimals/exhibits addcost,nocrashorFPSclaim.
Renderedandexternalvideoresults recordedinPR. No claimallmissionsplaytested.
