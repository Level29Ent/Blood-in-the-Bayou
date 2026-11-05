# Night visitors / place-name cleanup

## Playable behavior
Nightly solo event window21:00–00:00,three game hours,using existing active-play
clock. Game hour=50real seconds,window=150active seconds. Pauses/shop dialogs stop
that clock. Entering outdoors late joins the remaining window,not a fresh3hours.
Once started,one landing remains fixed for that night/world. Select safe outdoor
road near player,bounded12placement attempts at most onceper5gameplay seconds.
UFO descends over8seconds,visible translucent beam lowers4armed friendly aliens.
Aliens remain in a defensive formation. The saucer hovers untilmidnight;it is
removed/hidden at event end (no long cinematic flyaway). Player gets a UFO map
marker and remaining-game-minutes HUD. No speech recordings added.

Horde waves every12active seconds,up to8 perwave. Use existing ambient cap formula
with tighter absolute ceilings48Low/64MediumHigh;do NOT raise global100cap. Local
10-zombie/160-unit density safeguard. No forced spawns when capalreadyfull.
Additional zombies are tagged to this event;at end,remove only its surviving
owned zombies. Existing zombies/story actors remain. Allied fire targets only
these event-wave zombies,not story targets,checking buildings/terrain/range420.
Energy weapon flashes/tracers,1damage/.9seconds. Kill source guard means no free
player mission credit/cash or loot. Player-fired kills keep normal rewards.
Friendly aliens cannot harm players/keepers/otherNPCs. No gang/police restoration.

No event gameplay in multiplayer (no unsynchronized authority),indoors,penthouse,
zoo+200buffer,subway,bomber,themeparkorboat rides. Hide/suspend local effects and
waves outside1000units/whileunsafe;windowstill ends on gameclock. No additional
RAF loop,shadowlightorvolumetricpass. Fixed4aliens/4tracers/1beam;reusemodelnextnight,
dispose owned materials/geometry once onworldchange. Not a crash-resolution claim.

## Names
Remove leadingLevel29 from place names,associated signs/service labels/mission
references (banks,hospital,fire/police,base,airport,marina,residences,cemetery,etc).
Superdome has no Caesars sponsor or Level29 prefix. Runtime world check confirms
all56venue names lackprefix. Preserve venueIDs/savekeys/routes/coordinates,studio
Level29Ent/film/radio/product/vehicle branding,team names and29Land/Greenmart.
No prerecorded audio edited;old recordings may still say formernames.

## Checks
374Node tests pass;productionbuildandTypeScriptpass. Actual-launcher nonGPU scene
verifiesdescent,hordeallocation,allykillwithnoplayerreward,pause,noevent/ownedhorde
atmidnight,56venuenamesandSuperdomename. GPU/fullcity checks inPR. Shared graphics
reviewat/game/expansion-demo/ufo.html uses actualmakeModels,not gameplay verification.
No nativeiOSarchive refresh inthiswebsourcePR.
