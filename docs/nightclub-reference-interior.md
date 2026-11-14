# Velvet Jester reference-inspired nightclub

The main Velvet Jester nightclub now combines the supplied nightclub references: concentric magenta/blue ceiling rings and radial ribs, compact chandelier, DJ stage with decks/laptops and abstract equalizer wall, flanking speaker stacks, four pink VIP booth pockets, bottle-service tables, bottle bar, glowing floor spots and glass-railed side fascias. Walls/floor are dark so the cyan/magenta self-lit details read clearly.

The existing venue footprint, entry, service targets, dance minigame, tip/jackpot mechanics, music integration and nine dancer actors remain. Dancer positions move to a tested clear central grid. The southern juke joint is explicitly excluded and retains its previous theme and three dancers. Later generic furnishing/register/finish/business-stock passes skip the curated main club.

Balcony-style side features are scenic only, not a new occupiable upper floor or staircase. Light-beam cones, floor spots and LED materials are cosmetic geometry, not actual moving projectors or a volumetric lighting system. No dynamic lights/shadows, external assets, crowd-density increase or new animation loop are added. The existing actor dance update still runs.

`/game/nightclub-review.html` uses the production furnishings in an isolated 160×128 shell, with entrance, VIP and DJ views. It does not populate the full game crowd or exercise music/minigames; full-city gameplay and physical-device performance require separate verification. Original abstract signs/LED art avoid copied club branding.

Focused regressions check clear radius-ten entry/central floor and radius-seven positions for all nine dancers, bounded geometry below the existing ceiling, restricted main-club matching, shared instance draw limits and no new real lights.
