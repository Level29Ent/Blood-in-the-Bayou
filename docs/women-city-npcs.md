# Women residents and parade NPCs

Blood in the Bayou's generated civilian population is now a stable mixed cast: half of the authored prologue resident, marching and spectator slots represent women. The existing 384-spectator and 330-marcher limits remain. Skin tones vary independently of the gender split.

Women have four deterministic hairstyle/appearance profiles (bob, ponytail, bun and natural hair), everyday trouser/top and skirt silhouettes, varied shoulder/build scaling, and a longer tunic variant. Clothing remains modest and fully clothed. Hair and identity do not change when the camera moves or the animation updates. Women have the same walking, cheering, watching, clapping, dancing and outbreak escape behavior as other residents. Hairstyles are presentation choices, not a gender detector; men with long hair remain.

The close-up business customer pool also alternates women and men. Women are styled once before static batching so their hair and proportions survive batching, assignment to a different shop and reuse of the bounded pool. Named characters, story dialogue, rescue missions, zombie selection, collision, saved progress, prices and rewards are unchanged. This does not add dialogue-driven named characters or replace every independently authored NPC model.

The civilian renderer stays at nine instanced draw batches; hair instance storage expands to handle the extra shapes without per-woman models/downloads. Customer hair uses shared geometry and the existing hair material.

## Validation

41 focused tests pass, including balanced populations, deterministic appearance, four hairstyle profiles, animation/finite transforms, crowd batch bounds, empty-frame reset, shared customer geometry, identity colors and idempotent styling. Complete prologue and existing business-customer/source checks remain. Full suite and build/typecheck results and deployed preview evidence are recorded on the PR.

The visual component viewer at `/game/interior-parade-review.html` now includes WOMEN NPCs and a mixed NPC close-up, plus the production crowd formation. It is not proof of every in-city placement or phone FPS. These remain original procedural models, not newly imported GLBs. The iOS packager copies current web sources; installed apps need a new signed release.
