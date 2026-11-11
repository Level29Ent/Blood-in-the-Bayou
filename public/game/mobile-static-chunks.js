"use strict";
(function () {
  // Only immutable scenery batches. Never touch doors, characters, boats, moving rigs or runtime-owned rooms.
  function eligible(mesh) {
    if (
      !mesh.userData.staticWorldBatch ||
      !mesh.isInstancedMesh ||
      mesh.count < 24 ||
      mesh.children.length ||
      mesh.instanceColor ||
      mesh.geometry?.morphAttributes?.position?.length
    )
      return false;
    for (let p = mesh; p; p = p.parent) {
      const u = p.userData;
      if (
        u.noBatch ||
        u.body ||
        u.legs ||
        u.mobileMoving ||
        u.dynamic ||
        u.wheel ||
        u.vehicles ||
        u.mobileChunk
      )
        return false;
    }
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    return (
      materials.every((m) => m && !m.transparent && !m.isShaderMaterial) &&
      mesh.onBeforeRender === Object.getPrototypeOf(mesh).onBeforeRender
    );
  }
  function partition(T, mesh, size = 192) {
    const matrix = new T.Matrix4(),
      groups = new Map();
    for (let i = 0; i < mesh.count; i++) {
      mesh.getMatrixAt(i, matrix);
      const k =
        Math.floor(matrix.elements[12] / size) +
        ":" +
        Math.floor(matrix.elements[14] / size);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(i);
    }
    if (groups.size < 2) return null;
    const root = new T.Group();
    root.name = "Spatial static chunks · " + mesh.name;
    root.position.copy(mesh.position);
    root.quaternion.copy(mesh.quaternion);
    root.scale.copy(mesh.scale);
    root.visible = mesh.visible;
    root.layers.mask = mesh.layers.mask;
    root.userData.mobileChunk = true;
    for (const ids of groups.values()) {
      const chunk = new T.InstancedMesh(
        mesh.geometry,
        mesh.material,
        ids.length,
      );
      chunk.name = mesh.name;
      chunk.castShadow = mesh.castShadow;
      chunk.receiveShadow = mesh.receiveShadow;
      chunk.renderOrder = mesh.renderOrder;
      chunk.layers.mask = mesh.layers.mask;
      chunk.userData.mobileChunk = true;
      ids.forEach((id, i) => {
        mesh.getMatrixAt(id, matrix);
        chunk.setMatrixAt(i, matrix);
      });
      chunk.instanceMatrix.needsUpdate = true;
      chunk.frustumCulled = false;
      root.add(chunk);
    }
    return root;
  }
  function optimize(T, root) {
    const selected = [];
    root.traverse((o) => {
      if (eligible(o)) selected.push(o);
    });
    let sources = 0,
      chunks = 0,
      instances = 0;
    for (const mesh of selected) {
      const output = partition(T, mesh);
      if (!output) continue;
      const parent = mesh.parent;
      parent.add(output);
      parent.remove(mesh);
      mesh.dispose();
      sources++;
      chunks += output.children.length;
      instances += mesh.count;
    }
    return { sources, chunks, instances };
  }
  function release(root) {
    let n = 0;
    root?.traverse((o) => {
      if (o.isInstancedMesh && o.userData.mobileChunk) {
        o.dispose();
        n++;
      }
    });
    return n;
  }
  if (typeof module !== "undefined")
    module.exports = { eligible, partition, optimize, release };
  if (typeof window === "undefined") return;
  let owner = null,
    stats = { sources: 0, chunks: 0, instances: 0 };
  const build = buildCity;
  buildCity = function () {
    if (owner) release(owner);
    owner = null;
    const r = build.apply(this, arguments);
    if (window.level29MobileBudget?.mobile && cityGroup) {
      owner = cityGroup;
      stats = optimize(THREE, cityGroup);
    }
    return r;
  };
  window.level29MobileChunks = {
    get stats() {
      return stats;
    },
    optimize,
    release,
  };
})();
