# Traffic wall clearance and site AdSense tag

Traffic previously checked a single tile ahead with solidAt. Walk-in buildings
and fortress walls can occupy tiles that are still marked as road/lot, and the
car's circular physics proxy does not cover its front/rear corners. New traffic
checks test the full oriented chassis against final building footprints and
fortress walls/gates, sample a forward braking corridor and require road/bridge
tiles under its footprint. Unsafe spawns are rejected; AI turns/slides that clip
a wall roll back and stop. Already embedded AI cars retire rather than continue
through buildings. Player-controlled cars and boats keep their existing physics.
This is safe stopping, not a new city-wide rerouting system; a blocked lane can
wait and recycle offscreen rather than drive through its obstacle.

The exact owner-supplied async AdSense client tag is now in the Next site head.
The unused parent copy of game/ads.js is removed; the game document keeps its
own disabled/consent-gated H5 scaffold. The site tag is not copied to the native
iOS game or loaded twice in the same document.

This does NOT establish account/site approval or earnings. Complete site review
in AdSense and configure Privacy & messaging / a suitable certified CMP before
live serving where required. Review Auto ads settings and exclude gameplay from
all overlay/in-page placements; the root page is a full-screen game iframe, not
an editorial page with safe ad whitespace. Do not enable intrusive Auto ads over
controls. Browser in-game interstitials still need H5 Games Ads approval, consent
integration and a tested release; no live H5 switches were changed here.

Google references:
- https://support.google.com/adsense/answer/7584263?hl=en
- https://support.google.com/adsense/answer/9261307?hl=en
- https://support.google.com/adsense/answer/9955214?hl=en
