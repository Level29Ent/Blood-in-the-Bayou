# Player and infected visual polish

The active `/game/index.html` launcher keeps the existing procedural Level 29 jester and zombie rigs. This is a stylized geometry pass, not a photorealistic model swap or a new skeletal animation set.

- Jester: gold lapels, diamond appliques, a compact back panel, belt trim, knee protection, boot buckles, cheek planes and sharper brows. Existing hat, mask, ruff, local/remote ownership and animation pivots remain. Equipping a wardrobe top hides the base jacket details; removing it restores them.
- Infected: recessed sockets, brow ridges, ears, nose, broken teeth, an asymmetric scar, shirt slashes and a torn hem. Runner/brute head and jaw proportions reset when pooled actors change role. Existing military helmets, hair and corpse/ragdoll bindings remain.
- Distant mobile horde: nose, teeth, sockets and shirt damage are merged into the same six instanced batches. No per-zombie lights, new textures, extra renderer passes, collider or AI changes.
- Shared primitive geometry is reused across near characters. Named uploaded GLBs are unchanged. The old standalone launcher and native archives are not regenerated.

`pnpm build:character-review` regenerates `/game/character-polish-models.js` from the exact production constructors in `fp.js` and `mp.js`. `/game/character-polish-review.html` displays that production-art lineup with player/infected close-ups and animation. A regression check fails if the generated review drifts from production; this page does not prove full-city gameplay or phone frame rate.

Checks cover shared resources, finite poses, pooled role reset, wardrobe compatibility, distant batch counts and unchanged actor data. Full-city GPU behavior, networked multiplayer appearance and mobile endurance still need device testing.
