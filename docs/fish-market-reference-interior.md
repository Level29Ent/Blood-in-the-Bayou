# Gulf Fresh fish-market reference interior

Existing `kind === 'fish'` street-market venues now use long stainless iced displays rather than a generic bench, four oval fish props and two aquarium galleries. The reference-inspired stock includes whole fish with eyes, tails, fins and dark backs; striped salmon-like fillets; curled shrimp and mixed shellfish; crushed-ice chips, parsley edges, metal tray divisions, upright price cards, faint glass sneeze screens, insulated blue crates, a prep counter, scales and blue tiled walls with large seafood-market signs.

The original converted-building shell, terrain placement, automatic door, service coordinates, fish-market identity/map marker and trading behavior remain unchanged. Catch-sale bonuses, cooler/tackle purchases and boat delivery are still implemented by the existing trading module. Jojo’s repurposed restaurant is explicitly excluded. Generic furnishing/finish/register/stock passes and duplicate live-aquarium displays skip only the curated markets.

A 128×128 room contains nine whole fish, twelve fillets and 110 shellfish pieces across 18 instanced furnishing batches before signage. Geometry/materials are reused per room, with no new dynamic lights, image/model downloads or animation loops. The glass screens do not write depth and remain faint to keep seafood visible. This is stylized procedural scenery, not a photographic scan; product cards use generic original marks.

`/game/fish-market-review.html` uses the production builder in an isolated 128×128 shell with entrance, whole-fish and fillet/shellfish views. It does not demonstrate full-city transactions, startup or physical-device performance.

Focused checks cover the actual access/shelter venue builder, unchanged service point and terrain base, restricted matching, clear radius-ten entrance/service routes across 64/96/128/160-wide footprints, finite room-bounded stock transforms, draw budgets, no new lights and existing trading purchase behavior.
