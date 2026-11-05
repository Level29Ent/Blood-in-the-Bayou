# Connected world / physics and mission iteration — exact implemented scope

## Confirmed repairs
Poster artwork no longer across centered business-service banners: shared helper
mounts two18unit framedposters on sidewall,inside canonicalvenuecoords so frontage
rotation follows. Existing officialtextures/ratios untouched.13venues withnewposter
mounts in localscene. NewposterModelspreviewhook avoids installing game hooks.

Road multi-source BFS connects reachable roadcomponents while keeping building/
feature/farm/zoo/park/base/airport parcels protected. Current map6→1gridcomponent,
5connectors/31cells,all31player-radius10samplesclear inactualscene. Sourcewater
cells becomeT_BRIDGEand getdeck/piers;syntheticwatergaptest verifies,no current
map watergap needed a newbridge. Existing interstateheightpreserved;newdeckheight
matches and guardrailopenings follow newjoins. GRIDconnectivity isnot everylane's
routing/driving proof;no guarantee allcurves/interchangesphysicallyperfect. Widened
basegap mask allows roadway between surplus/pawn without bulldozing stores.

## Motion / combat
Smooth exponential acceleration(.18s)/braking(.13s),substepmovement≤4units prevents
jumping through thin2Dcolliders. Existing authoredmallstairs remain;no newgeneral
raycaststairsolver or physicallycollidingjump. Existinghop remains camera/suspension
style,NOTphysicsjumpacrossobstacles. Vehiclelateraldriftcap/dampedvisualroll/pitch,
NOT newrigidbodyengine/tirecontactsolver. Ballistic bounded zombieimpulses;6max
falling/sliding visual corpseclones,NOT articulatedragdoll joints/limbphysics.
ScopeZ/touch,20°FOV,andcamera-centeredray againstbuildingboxes/zombies;ammo/reload
still calls existing firearm. Not mesh-perfectheadshots orallNPCballistics.
Missionhuman AI retreatsnearplayer,strafesand sidestepsblockedLOS ratherthanbeelines;
freeroamhostilepolice/gangsremainoff. OldgeneralhostileAI not rewritten.

## Interiors / properties / landmarks
Lazylocalfloorgeometry for existingstudiooffice(10floors) andtwoexistingapartment
buildings(4floors each);onevisiblefloor,retainedboundedfloorcache,explicitUP/DOWN/
EXIT. Multifroompartitions,furniture,player-sizedwalls. Transitionisexplicitportal,
notcontinuousstairgeometry/simulatedreinforcements. Testall18floor spawnsclear after
corridorwidening. Existingapartmentexteriorsadd balconies/mailbox/parkingdetail,
not fullmulti-buildingcomplexreplacement. No promisezero performance degradation.
NewdrylandShantySafehouseandParking/Helipadgarage,twoenterableexisting-shellservices,
rooftop via Uportals. Allocationonavailableland,not guaranteeddeepmarshwaterfront.
Parkingdecks/helipadroofscenery,notdriveablemultilevelramps. Existing scrapyard kept,
no fullcarcrusher/demolition physics added. Estate remainsprivate and notresized
into neighboringparcels. PoolandApache placed at existingfortresspatio/helipad.
Fullmansionfootprint/groundsresize remainsunimplemented.

Apache-inspiredoriginalmodel:rotors,collectiveSpace/Shift,pitchW/S,rollA/D,yawQ/R,
velocitydrag,buildingtopheight/terraincollision,boundedworld/altitude,ground-onlyexit.
Independentaxeswithlimitedbank,NOTaerodynamic6DOFrotor/thrust/quaternionsolver. GunF/
mouseandmissileT are cooldown-limitedrayweaponsvsvisiblezombies/buildings withtracers;
NOphysicalmissileprojectile/homing/blastphysics orarmor/vehicleballistics. Pilotgun
usespitch; no ammoeconomy/endgameunlock configured. Boardonlysolo andoutsideother
interiors/rides. Controlskeyboard;dedicatedmobileflightsticknotimplemented. Local
board/lift/land/exitpassed. Poolanimatedcolor/Fresnel-likeviewpattern/caustic-like
surface,smallentryparticles;NOTrealrefraction/reflection/normalmap/causticsprojection.
Existingmist remains,notnewweatherhazardphysics. Don'tclaimAAAhelicopter/pool.

## Missions / economy
Existingoptionaloverpassconvoyspawns a moving600HPtruck followinginterstateloop;
3Uchargeinteractionsstopitforcontract-onlytacticalwave. Notremotechargeobjects or
fullmusclecarracecutscene. Adds RooftopExtraction,CarwashShakedown,MidnightCourier,
DonutStakeout,BaseRetailSiege;existing210campaignunchanged. Rooftop:ascendexplicit
floor10,3dataUsteps,8slinearzipreturn;noactualofficefloorreinforcementfights/chopper
extraction. Donutobserves15s thenfollowsmovingmusclecar. Carwashusesmission-onlyheat
counter4,5interactionswash;noactualcorruptpolicevehiclepursuit. Couriernight-only/
cardelivery;no spawnedroadblocks/rivalambushzones. BaseSiege3waves existinghumans.
No newphysicalcrewNPCs. Latemoduleadapters routeF10/mobile/servicemenus,but keyboard
oldlexicalcallbacks limited;service pathusesupgradedhandler. Longplaytestsneeded.

Newcontractpayoutsescrowtodirtyledger;oldwalletcash/savesnotreclassified. Manorbasement
F11/mobilelaundering,$1000→$850after30activeseconds,onependingconversion,persisted.
Localrooftopflowtestpassed$8500dirtycredit/cleanup,noextra$8500walletcredit. Existing
robberies/territoryincome notretrofitted toledger;not entirecityeconomyconversion.

## Verification
395Node tests/build/TypeScriptpass;focusedtestsposters,roadswater/protected,swept
movement,streaming,landing,escrow arithmetic. ActualnonGPUfullscene6.0sbuild~13964
meshes,geometryattributes167.7MB,NOTrealRAM/GPUmeasure. All31newroadnodesplayerclear,
18floorsstream/clearspawn,heliup/down,13posterrooms. Bothrealmenubuildandexpandedworld
checksrun. Missionintegrationconvoyspawn/charge,rooftopflow,dirtyrewardpass;opponent
combatnotplayedthrough. SourceworkaddsGPUcost,noSafari/mobilecrashfixclaim.
GPUreview/currentPRresultsreportedseparately. NativeiOSZIPnotrebuilt.
