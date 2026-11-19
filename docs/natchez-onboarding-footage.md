# Natchez approach, onboarding and footage capture

## Targeted facades

A late wrapper changes only generated tall blue/pink buildings whose footprint
is within 550 world units of the actual Natchez riverboat entry. It excludes
venues, uploaded models, low homes, gray/green walls and special landmarks.
Geometry, roof materials, collisions, doors and mission data are untouched.

The existing repeated wall/window atlas is replaced with a cached finish:
muted weathered paint, framed blue-gray glazing, thin reflection strips,
weathering below sills, and separate *linear-data* roughness/bump maps so glass
has lower roughness than opaque plaster. Both remain dielectric (metalness 0).
There are no extra meshes, dynamic lights, reflection cameras or per-frame
scans. The isolated `/game/natchez-facades-review.html` page uses this exact
finish and production UV scaling, but is not evidence of exact full-city
placement. It is a procedural improvement, not photogrammetry or transparent
window interiors.

## Optional interactive tutorial

First active play offers a dismissible guide; replay via PAUSE → HOW TO PLAY or
the main menu SETTINGS tab. It does not pause or hijack gameplay and explains
that PAUSE is available. Movement/look advance only after measured movement;
view/interact/journal/vehicle/shot lessons observe actual game outcomes, not
merely a key press. Every lesson can be skipped. Storage records dismissal,
completion and skipped count independently of campaign saves; blocked storage
is harmless. Remapped interaction/vehicle/movement labels come from the live
bindings module. Mobile joystick/look/action explanations are included.

Peaceful story lessons explicitly explain that shooting is disabled until the
outbreak. No tutorial reward, forced vehicle purchase, account, enemy spawn or
campaign mutation. The guide uses the existing scene's interaction/service
entry point and riverboat API; it doesn't add a competing gameplay key handler.

## Gameplay footage recorder — not an already-created trailer

PAUSE → GAMEPLAY VIDEO provides an explicit start/stop capture tool. Enter the
city first; a menu-only recording is rejected. Press START, then play normally.
It records up to 45 seconds of the real WebGL and HUD canvases at a capped
1280×720/30 fps, with title/end captions. It does not capture DOM menus, browser
UI, microphone, Spotify or other copyrighted/external audio; output is silent.
The player chooses the footage and camera—there is no scripted fake playthrough.

Use the Natchez exit, a walking/driving exploration shot and an outbreak combat
shot when those are available in your current campaign. Auto-stop at 45 seconds;
STOP RECORDING allows shorter clips. Return to PAUSE → GAMEPLAY VIDEO and choose
DOWNLOAD GAMEPLAY VIDEO. Browser-supported WebM/MP4 is selected honestly; no
format conversion is claimed. A 64 MiB cap, track cleanup, local object-URL
revocation, page-hide/visibility stop and guarded errors bound resource use.
No footage is uploaded and no credentials are involved. Unsupported browsers
should use the device screen recorder instead. Performance varies with GPU and
encoding support; real-device testing is required.

**Outstanding deliverable:** a finished edited gameplay trailer has not been
created. The session browser exports screenshots, not video recordings. Capture
actual footage with this tool/device recording and provide the video for an
editing pass; do not represent a fixture or screenshot slideshow as gameplay.

The main `/game/index.html` launcher is updated. The legacy standalone launcher
and signed/native archive are not rebuilt. Automated and preview check results
are recorded in the PR; full-city visual placement and real-device video export
must not be inferred from Node tests or READY deployment status.
