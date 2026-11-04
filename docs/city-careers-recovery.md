# City careers / recovery — implemented scope and remaining gaps

Current main contained committed conflict markers around runtime-resources script;
remove markers and retain cleanup module. No feature code selected by discarding
either side. Existing source-integrity tests now pass.

## Recovery
10second quiet campaign saves (existing25second save preserved),10second session
heartbeat,24entry diagnostic ring for script/promise/GPU errors,unexpected previous
active-session notice in menu. CONTINUE remains existing checkpoint restore,not
exact live-position/no-loss crash recovery. F4 journal stores city-job stage so
owner can explicitly resume it;time resets and stage assets regenerate,not full
NPC/vehicle world snapshots. No auto-restart/reload and no telemetry uploads.
Menu downloads a local diagnostics JSON for user to inspect/share. Browser kill
may occur between writes;not proof exact Safari restart fixed.

## Six businesses using existing anonymous compatible parcels
29Tow & Impound, Bayou Pawn & Collectibles,29Marine Repair,Level29Broadcast House,
29City Works and Bayou Veterinary Care. Main hospital/named story businesses kept;
secondary clinic renamed for vet (keeps original clinic mechanics). Other original
venue IDs/services retained,not full new ownership/business-economy systems.
Added low-poly equipment accents,existing complete store shells remain. Main map
not enlarged. No real money/prices,fictional bounty rewards only.

##36city jobs /12dispatches
Three each for six businesses plus Greenmart,zoo,base,metro,29Land,studio. Catalog
is real in-game journal(F4/touch),not just documentation. Each has3ordered stages
and cash payout once plus persisted completion/reputation. Trusted after2jobs
awards10%bonus on subsequent completion;not a locked-shop-item tree.

Stage mechanics:
- inspect/investigate/search/repair:3/5/4/7second U-held interactions at waypoint,
  not a clue-evidence deduction UI or interactive mechanical repair puzzles.
- stealth:10seconds near objective without firing;shooting resets progress,
  not guard vision-cone/infiltration stealth.
- recover:enter an actual nearby undestroyed parked land vehicle;drive:reach next
  marked point in a land vehicle. Cargo Recovery does NOT attach a physical tow
  cable or transport represented cargo. Existing vehicle damage/death fails job.
- boat:board actual available watercraft,not an escorted AI flotilla/naval convoy.
- escort:modeled human follows navigation,waits beyond180units,return outdoors to
  dispatch. Animal Transfer/Missing Pet use a human handler,NOT moving zoo-animal
  entity or captured pet. Zoo peace stages stay near approach,combat offsite.
- defend:spawn5actual zombies at road-site,defeat them and remain18seconds.
- return:U at home grants reward once. Timer/death/vehicle-loss/abort fail safely.

Do not start over active campaign/career/Powell/story/street/dispatch job;main
mission initiation blocked while new city job active. Existing system menus
may need additional conflict audits. Journal/route/reputation tab captures input
and pauses through existing shop state. Map selections show G,activejob C takes
priority. Actual route is a destination waypoint,NOT turn-by-turn road polyline.
Side-job escrow/actor state not network synchronized;solo only.

## Combat feedback
Nearby local on-foot zombie melee winds up18simulation frames before damage,
range loss resets windup;cooldown/death/car safety existing. HUD attack-outline
warns while windup active. Gunfire makes non-following survivors flee,armed gang
foot actors take bounded collision-clear sidesteps every30frames when fired at.
NOT sophisticated cover-selection/peek/reload AI,ragdoll/new hit animations or
universal perception rewrite. Existing cover/LOS checks remain elsewhere.

## Verification
358Node tests after initial implementation:36unique3stage definitions/sixbusinesses,
once-only cash/reputation record,distinct durations,bounded diagnostics plus
existing regressions/source integrity. Local actual-launcher fixture generates
6parcels and12dispatch homes,constructs careers and mechanically advances36job
stage chains;this is NOT playthrough of goals/escort/defense/timing in browser.
Build/TypeScript/native archive+preview evidence in PR. Physical Safari crash
reproduction,long session stability,all mission completions and remaining deeper
feature requests unverified/unfinished. Do not call full suggested expansion done.
