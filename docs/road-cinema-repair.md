# Road joins and cinematic composer repair

Confirmed on main before repair:
- Road grid: six components joined to one by existing connector routine. Four named
  exit centerlines clear for radius12 in actual generated world, all four corners clear.
- Fifth late connector jumped40worldunits at5328,5904into elevateddeck. New graded
  profile reduces max1unitcenterline heightchange40→0.08334; otherconnectors0.
- Legacy cityextensionrails/paint/lightfixtures still drawn beside stage1viaduct;
  now onlydrawn if replacementroadinactive. New rails/lightingsystemretained.
- Interstatepaintqboxes wereyaw-only/horizontal onslopes;nowsharedeck3Dbasis.
- BokehPassr149writeswriteBufferbutneedsSwapfalse;composerignoreditsoutput.
  SetneedsSwaptrue,updateBokeh-aspectonresize,restoreoverrideMaterial/autoClear
  beforefallback if depth pass throws. Keeponeexistingcomposer/no secondrenderer.

Requestedstyle:ACES1.2(day/night),1.1dusk;Highbloom.6/.4/.85;Medium.22/.4/.85.
HighDOFonlytalk/cutscene/scope,Lowallocatesnocomposer. HUD/viewmodelremainoutside
worldeffects. r149usesoutputEncoding=sRGBEncoding ratherthanneweroutputColorSpace.
Bokehfocus/aperturenotcopiedverbatim:worldunits10permetre;cameraall-gameblurunsafe.

Tests:443nodechecks,productionbuild/TypeScript(seePR). NonGPUactualscene retained
fullmap/mall/zooandchecked235exitcenters+4corners.Noactualdrivingplaythroughor
allroad/vehiclewidth/bridge/ocean-edgeguarantee.Nativearchiveunchanged.
Road-cinema-review.htmlisolatedGPUfixtureusesactualcomposer/purebasishelper,
NOTareplicaofthecityorproofSafariFPS/crashresolution. BrowserresultsinPR.
