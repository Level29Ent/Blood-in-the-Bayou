# Mobile runtime safety

Phones/tablets (coarse pointer, mobile UA or desktop-mode iPad) use a Low-only GPU profile. Desktop retains its quality options. The initial drawing ratio is at most .85 and capped to roughly 750,000 pixels; adaptive resolution can reduce it further. The map canvas is capped at 1024 per side on mobile (4 MiB RGBA instead of 16 MiB for the old 2048 canvas; CPU canvas and GPU copy are separate). World coordinates, collision, mission and save data are unchanged. Smaller terrain texture can soften distant surface details; geometry road markings remain intact.

Switching to Low now releases both sun shadow targets, not just disabling updates. Detached named actors leave the tracking set. Touch dragging, held Run/Fire and camera look are reset on focus loss, tab hiding, orientation changes, graphics loss and page exit; Run also resets when leaving gameplay. Existing context-loss pause/recovery remains manual and never auto-reloads or clears saves.

Session checkpoints now retain GPU texture/geometry counts, draw calls, pixel ratio and mobile-safe status to help investigate another restart. These are counters, not a total VRAM measurement or an identified crash cause. No personal information is added.

This is a mitigation and concrete cleanup/input repair, not a guarantee of crash-free mobile play. All world meshes are still built; full-world geometry streaming and a proven device-memory budget are not implemented. Browser previews cannot reproduce every iOS GPU/thermal limitation. Physical iPhone/Capacitor endurance tests are required. The source ZIP is updated, not signed or released.
