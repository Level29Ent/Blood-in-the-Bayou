# Ronniebaby reference-inspired model

Original procedural asset, not a photographic scan, not an Unreal Engine export.
Reference direction: locs, olive shirt, gray utility trousers, brown boots,
olivemilitary-style backpack,radio. No external proprietary meshes/textures.
Static/unrigged; no skeletal animation clips. 22,272 triangles,12indexedmaterial
batches,4embedded128²PNGtextures;788212bytes. Uses metre units,Yup,+Zforward.
Gameadapter12units/metre and+90°Y maps +Z to existing rig's+X,retainsmission
root/ringandlegacydata,buthidesoldvisuals onlyafterloadsuccess. Loadfailurekeeps
oldactor. Singlecachedtemplate;nomodeldownloads beforeentry/whileNPCfaraway.

Regenerate from repo root:
python3 scripts/character/build-ronnie.py
python3 scripts/character/batch-ronnie.py

Compression pipeline: scripts/build-production-pbr.cjs, BASISU_BIN pointing to
installed basisu1.16.3. Maps are original procedural micro-surfaces,512²withmips,
UASTCKTX2,notphotographed4Kassets. Three.jsr149transcoderdetectsGPUformat.
Taggedconcrete/wood/fabricgetnormal+roughness;albedo/metalness/artworkpreserved.
Do not market this character or procedural surfaces as photorealistic.
