"use strict";
(function () {
  const PRESETS = {
    low: { fps: 30, particles: 120, shadow: 0, reflections: false },
    medium: { fps: 45, particles: 320, shadow: 512, reflections: false },
    high: { fps: 60, particles: 800, shadow: 1024, reflections: true },
  };
  function preset(q, mobile = false) {
    const name = Object.hasOwn(PRESETS, q) ? q : "low";
    return {
      ...PRESETS[name],
      name,
      fps: mobile ? Math.min(30, PRESETS[name].fps) : PRESETS[name].fps,
      shadow: mobile ? 0 : PRESETS[name].shadow,
      reflections: !mobile && PRESETS[name].reflections,
    };
  }
  function reupload(roots) {
    const geometries = new Set(),
      materials = new Set(),
      textures = new Set();
    for (const root of roots)
      root?.traverse((o) => {
        if (o.geometry) geometries.add(o.geometry);
        if (o.instanceMatrix) o.instanceMatrix.needsUpdate = true;
        if (o.instanceColor) o.instanceColor.needsUpdate = true;
        if (o.skeleton?.boneTexture) textures.add(o.skeleton.boneTexture);
        for (const m of Array.isArray(o.material) ? o.material : [o.material])
          if (m) {
            materials.add(m);
            for (const v of Object.values(m))
              if (v?.isTexture && !v.isRenderTargetTexture) textures.add(v);
            for (const u of Object.values(m.uniforms || {}))
              if (u?.value?.isTexture && !u.value.isRenderTargetTexture)
                textures.add(u.value);
          }
      });
    for (const g of geometries) {
      if (g.index) g.index.needsUpdate = true;
      for (const a of Object.values(g.attributes || {})) a.needsUpdate = true;
      for (const list of Object.values(g.morphAttributes || {}))
        for (const a of list) a.needsUpdate = true;
    }
    for (const m of materials) m.needsUpdate = true;
    for (const t of textures) t.needsUpdate = true;
    return {
      geometries: geometries.size,
      materials: materials.size,
      textures: textures.size,
    };
  }
  function figureOwnership(root) {
    const u = root?.userData;
    if (!u?.body) return;
    const originals = [
        u.skin,
        u.shirt,
        u.pants,
        u.hair?.material,
        u.helmet?.material,
      ].filter(Boolean),
      owned = new Set(originals);
    root.traverse((o) => {
      for (const m of Array.isArray(o.material) ? o.material : [o.material])
        if (
          m &&
          originals.some((source) => source.color && m.color === source.color)
        )
          owned.add(m);
    });
    u.ownedMaterials = owned;
    u.ownedGeometries = new Set(u.helmet?.geometry ? [u.helmet.geometry] : []);
  }
  function disposeOwned(root) {
    const geometries = new Set(),
      materials = new Set(),
      textures = new Set();
    root?.traverse((o) => {
      for (const x of o.userData.ownedGeometries || []) geometries.add(x);
      for (const x of o.userData.ownedMaterials || []) materials.add(x);
      for (const x of o.userData.ownedTextures || []) textures.add(x);
      o.userData.ownedGeometries?.clear();
      o.userData.ownedMaterials?.clear();
      o.userData.ownedTextures?.clear();
    });
    for (const x of geometries) x.dispose();
    for (const x of materials) x.dispose();
    for (const x of textures) x.dispose();
    root?.parent?.remove(root);
    return {
      geometries: geometries.size,
      materials: materials.size,
      textures: textures.size,
    };
  }
  if (typeof module !== "undefined")
    module.exports = {
      PRESETS,
      preset,
      reupload,
      disposeOwned,
      figureOwnership,
    };
  if (typeof window === "undefined") return;
  window.level29RuntimePolicy = {
    PRESETS,
    preset,
    reupload,
    disposeOwned,
    figureOwnership,
    get budget() {
      return preset(
        window.level29Graphics?.quality,
        !!window.level29MobileBudget?.mobile,
      );
    },
  };
})();
