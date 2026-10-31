# Felicia, snowball weapons and cemetery parcel correction

## Screenshot fix
The cemetery amenity rectangle was reused by three commercial buildings; its old entrance sign and tomb meshes still rendered over their storefronts. A final amenity allocator now moves the **whole cemetery**, not just its text, to a dedicated grid parcel after building zoning. It excludes buildings, roads/water, other amenities, the farm, court and airport. On the current seven chapter layouts it chooses a 192×192 parcel at X=3328, Y=3040; the source screenshot's overlapping storefronts remain in place. Tomb row counts/spacing adapt to parcel size, and the entrance sign is inset inside the cemetery. Late scenic-road routing and storefront paths honor this reservation. Menu-backdrop generation is excluded from playable-world allocation.

## Felicia’s Snowball Trailer
The existing Mama 29 food-truck lot is now a walk-in trailer, with a clear entrance/central aisle, sales counter, flavor cups, ice shaver/freezer and wheels. **Felicia** stands inside. Her stylized procedural avatar uses the supplied dark-to-golden long hair and clothing as reference; her portrait is shown in the shop. This is not a face scan or photorealistic reconstruction.

Follow **CITY STORIES → FELICIA’S SNOWBALL TRAILER**, walk inside, and use the service station. **$180 of fictional earned cash buys six weapon snowballs.** They equip immediately and remain in the normal saved inventory. Press **0**, use the weapon wheel or touch WEAPON to select them. FIRE throws a slower, 36-damage projectile with a visible ice sphere and shallow visual arc. Hits use the existing bullet/combat collision/kill attribution; ordinary walkers can die from a hit, stronger targets need more. Empty stock does not fire. Twelve reusable world sphere meshes bound the visual cost. No molten/fire effects or real payment system are added.

Snowball damage uses the existing projectile network serialization; remote clients may see the generic projectile visual instead of the local ice sphere. Multiplayer visual parity and physical-device FPS remain unverified. The existing direct-rendering/glass policy and quiet rain are unchanged.

## Recording scripts
`BUSINESS_CHARACTER_VOICE_SCRIPTS.md` contains **41 character/role scripts and 190 individual lines**, including Felicia, Chief Jojo, Alex, Bonnie, Damion, ordinary shop/public-service staff, the hospital departments, Natchez captain, university/airport/club/film staff and one optional new Ronniebaby roux handoff.

`docs/voice-recording/business-lines.csv` is the recording checklist; `business-lines.json` carries the same filenames, cues and spoken text. The downloadable ZIP also contains one text script per character. Record dry mono MP3 at 44.1 kHz, trim silence and use the exact filenames. Send back the recordings as a ZIP or stage them under `public/game/business-vo/`. Existing Ronniebaby clips remain in `public/game/rbvo/`.

**These are recording scripts and a cue manifest, not an installed audio pack or automatic playback integration.** The new clips must still be connected and timing-tested after recording. No new speech recordings, voice clones or impersonations are generated. Jojo's longer takes may require scene retiming; cues explicitly distinguish directions from words to say.
