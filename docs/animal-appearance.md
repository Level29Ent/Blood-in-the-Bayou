# More recognizable animals

This is an original procedural/stylized appearance update, not photorealistic
scans or imported animal assets. It preserves gameplay counts, collision sizes,
pet ownership, hunting rewards and existing animation handles.

- Farm cows: wider muzzle, smaller eyes with highlights, inner ears, split hooves.
- Farm pigs: smaller snout, upright soft ears instead of horn-like cones, split hooves.
- Chickens: tapered beak and eye highlights, retaining comb, wattles, wings and toes.
- Dogs/cats/pet pigs: rounded body/head/limbs, muzzle pads, nose and whisker details,
  saddle/tabby markings and pig nostrils/curled tail.
- Mansion shepherd: rounded anatomy, pointed ears, eye highlights and paws; the
  original head/tail pivots remain available to its idle animation.
- Alligators: rounded body and jaw, individual teeth and back scutes, retaining
  head/jaw/tail/four-leg animation handles; baby-gator pets use the same model.
- Flying huntable birds: rounded body/head, tapered beak, eyes, feathered wings
  and tail, retaining both wing animation groups. Flock birds and egrets get
  clearer eyes/beaks/toes. Parrot pets get rounded wings/beak/tail.

Existing detailed aquatic catfish/crawfish/shrimp are retained, not replaced.
No population increase, extra render pass, external download or new dependency.
A shared geometry cache keeps rounded anatomy reusable without scaling attached
child parts accidentally; per-mesh transforms stay unit scale for rig compatibility.

Checks construct each pet, alligator, shepherd and huntable bird; verify finite
bounded geometry, mesh budget, shared geometry and animation handles. Existing
farm tests exercise all three species. Full regression/build/type checks and iOS
archive generation are run. These do not establish physical-phone performance
or visual realism: deployed visual and native-device verification remain required.
The iOS ZIP includes the latest source and still needs a new signed app build.
