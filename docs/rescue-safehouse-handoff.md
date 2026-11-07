# Ronnie campaign rescue handoff repair

Reproduction in current map: city.safe=(1680,432),front gate=(1680,592). Nearest navigable street point to the inner coordinate is(1680,528),64units away,while rescue completion requires<60. The street follower cannot walk into the inner fort parcel,so the old return marker can never complete on foot.

All21campaignrescueIDs now use the validated,clear,groundlevel exterior gate street point. Existing/resumed escort stages with old drops repair once without clearing survivors or changing campaign/saveIDs. Timer receives a bounded return-leg allowance. Arrival requires a living,collected,following survivor plus nearbyplayer; leaving them behind never completes the primary job. Missing/dead target fails explicitly instead of silently hanging.

Second reproduced logicbug: a survivor not within70units of the player's vehicle did nothing while player.car was set. Now they approach a car within500units using existing navigation/collisions,then board at the same70units. No teleport from across the map;stop near survivor and wait. Existing car-follow/exit logic remains. A survivor waypoint remains visible alongside safehouse handoff until boarding. This does not add physical boarding animation.

An already-active campaign job cannot be accepted again to reset objectives. Nonactive/nextmission flow unchanged. After a safehandoff,the existing campaign field/medicalkit and timed extraction stages remain; explicit objective/toast says payment stillrequires those stages. No false payout or removal of preexistingchallenge. No mission-completion/rewardretuning,world expansion orsave reset.

Source-world checks and PR document exactverification scope. These fixes do not establish that all210missions are bugfree,nor fix the unresolved mobilefreeze/crash. NativeZIP is sourceonly,not Xcodecompiled/signed.
