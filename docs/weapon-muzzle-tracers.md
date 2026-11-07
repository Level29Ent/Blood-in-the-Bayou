# Weapon muzzle/tracer repair

The old tracer buffer drew every projectile at the current player's fixed13/12-unit height,then added terrain under each segment. It never used barrel geometry or accounted for the separate58-degree weapon camera versus world-camera FOV. Other firearms also lacked a consistent barrel flash.

New local ballistic shots record their original terrain elevation and weapon ID. The barrel point is projected from view-model space through the world camera at22-unit depth so it shares the exact screen pixel. Short visual segments blend from that recorded muzzle onto the unchanged horizontal simulation path over120units. This is a visual parallax bridge,not a full3Dballistic trajectory. It preserves bullet position/velocity/spread/ammo/damage and obstruction code. No autoaim/free damage. Remote,melee,thrown,snowball and bomber systems are excluded. Later camera/player motion cannot move already-fired tracers; distant tracer height no longer follows the player's current floor.

Each base firearm and progression-gun family has an explicit barrel coordinate. A single reused sprite provides flashes for nonM240 firearms; M240's original flash/belt/casing animations remain. Flash ownership prevents equipping another gun from borrowing the preceding weapon flash. No added dynamic lights,reflection targets or new mesh per bullet. Existing600segment buffer is reused. The static progression GLB/model-loader policy remains unchanged.

Boss/car hit checks now use swept projectile segments just like normal zombies,fixing fast rounds that crossed a small target between frames. This preserves existing target radius/damage and does not add auto-target selection. Normal game hit logic remains primarily2D;pitch-accurate3D combat,projectile rooftops and custom mission damage wrappers are not rewritten here. This does not fix outstanding mobile crashes or frame rate.

Review page uses actual M240 builder and shared visual helpers in isolation. Finalchecks/preview recorded inPR. Source iOSZIP refreshed,not compiled/released. Saves/map remain intact.
