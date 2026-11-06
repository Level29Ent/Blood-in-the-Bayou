'use strict';
(function () {
  const SIZES = { treme: [416, 352], university: [448, 384], park: [384, 448] };
  const COLORS = ['#add8e6', '#e5a5b2', '#e5dbac', '#9ac5a0', '#dfb89d', '#b7aecf'];

  function overlap(a, b, margin = 0) {
    return a.x < b.x + b.w + margin && a.x + a.w > b.x - margin &&
      a.y < b.y + b.h + margin && a.y + a.h > b.y - margin;
  }

  function layout(kind) {
    if (kind === 'treme') return {
      homes: Array.from({ length: 18 }, (_, i) => ({ x: 22 + i % 6 * 64, y: 16 + Math.floor(i / 6) * 112, w: 44, h: 72, H: i % 4 === 0 ? 55 : 32 })),
      rooms: [], solids: [], water: []
    };
    if (kind === 'university') return {
      homes: [],
      rooms: [
        { x: 128, y: 20, w: 192, h: 80, name: 'ADMINISTRATION', role: 'admin' },
        { x: 16, y: 136, w: 112, h: 112, name: 'SCIENCE LAB', role: 'science' },
        { x: 320, y: 136, w: 112, h: 112, name: 'LIBERAL ARTS', role: 'arts' },
        { x: 144, y: 280, w: 160, h: 80, name: 'CAMPUS LIBRARY', role: 'library' }
      ], solids: [], water: []
    };
    return { homes: [], rooms: [], solids: [], water: [{ x: 42, y: 48, w: 64, h: 320 }] };
  }

  // Public adapter: supply real map placements; sample negative coordinates are deliberately not used.
  function createNewOrleansLandmarks(T, scene, placements, options = {}) {
    const root = new T.Group(); root.name = 'NOLA Landmarks · original regional interpretation';
    const materials = new Map(), geometries = new Map(), buckets = new Map(), solids = [], waters = [], doors = [];
    const mat = (color, metalness = 0, roughness = .8) => {
      const key = color + ':' + metalness + ':' + roughness;
      if (!materials.has(key)) materials.set(key, options.material ? options.material(color, metalness, roughness) : new T.MeshStandardMaterial({ color, metalness, roughness }));
      return materials.get(key);
    };
    const concrete = mat('#a7aaa0'), brick = mat('#963f32'), wood = mat('#79553e'), slate = mat('#3b444b', .12), iron = mat('#253338', .65, .4), glass = mat('#557c88', .3, .23), green = mat('#3c6a49'), moss = mat('#71846b');
    const add = (kind, args, material, x, y, z, scale = [1, 1, 1], ry = 0) => {
      const key = kind + ':' + args.join(',');
      if (!geometries.has(key)) geometries.set(key, kind === 'cylinder' ? new T.CylinderGeometry(...args) : kind === 'sphere' ? new T.SphereGeometry(...args) : kind === 'roof' ? new T.ConeGeometry(...args) : new T.BoxGeometry(1, 1, 1));
      const geo = geometries.get(key);
      let list = buckets.get(geo); if (!list) buckets.set(geo, list = new Map());
      if (!list.has(material)) list.set(material, []);
      list.get(material).push({ x, y, z, scale, ry });
    };
    const box = (w, h, d, x, y, z, m) => add('box', [], m, x, y, z, [w, h, d]);
    const solid = (site, r) => solids.push({ x: site.x + r.x, y: site.y + r.y, w: r.w, h: r.h });
    const label = (text, site, x, y, z, width) => options.label?.(root, text, width, 5, site.x + x, y, site.y + z, '#ede1ba');

    for (const [kind, site] of Object.entries(placements)) {
      if (!site) continue;
      const data = layout(kind), ox = site.x, oz = site.y;
      if (kind === 'treme') {
        data.homes.forEach((h, i) => {
          const x = ox + h.x + h.w / 2, z = oz + h.y + h.h / 2, color = mat(COLORS[i % COLORS.length]);
          box(h.w, h.H, h.h, x, h.H / 2, z, color);
          add('roof', [h.w * .72, 15, 4], slate, x, h.H + 6, z, [1, 1, h.h / h.w], Math.PI / 4);
          box(h.w, 2, 17, x, 1, oz + h.y + h.h + 8, wood);
          box(h.w + 3, 2, 18, x, 27, oz + h.y + h.h + 8, slate);
          for (const side of [-1, 1]) {
            box(1.5, 25, 1.5, x + side * 19, 14, oz + h.y + h.h + 14, concrete);
            box(10, 15, 1, x + side * 12, 16, oz + h.y + h.h + .8, glass);
            for (const trim of [-1, 1]) box(2, 17, 1.5, x + side * 12 + trim * 6, 16, oz + h.y + h.h + 1, concrete);
          }
          box(9, 24, 1, x, 12, oz + h.y + h.h + .8, wood);
          if (h.H > 40) {
            box(h.w, 2, 16, x, 31, oz + h.y + h.h + 7, wood);
            // Actual balusters instead of a solid box across the porch.
            for (let k = 0; k < 9; k++) box(.7, 9, .7, x - 20 + k * 5, 36, oz + h.y + h.h + 15, iron);
            box(h.w, 1, 1, x, 41, oz + h.y + h.h + 15, iron);
          }
          solid(site, h);
        });
        label('TREMÉ · CREOLE COTTAGES / DOUBLE GALLERIES', site, 208, 24, 342, 260);
      } else if (kind === 'university') {
        box(416, .5, 350, ox + 224, .1, oz + 192, green);
        box(48, .6, 350, ox + 224, .5, oz + 192, concrete);
        box(416, .6, 36, ox + 224, .6, oz + 192, concrete);
        for (const r of data.rooms) {
          const cx = ox + r.x + r.w / 2, cz = oz + r.y + r.h / 2, height = 48, side = (r.w - 40) / 2;
          box(r.w, .6, r.h, cx, .5, cz, concrete);
          box(r.w, height, 3, cx, 24, oz + r.y + 1.5, brick);
          box(3, height, r.h, ox + r.x + 1.5, 24, cz, brick);
          box(3, height, r.h, ox + r.x + r.w - 1.5, 24, cz, brick);
          for (const s of [-1, 1]) box(side, height, 3, cx + s * (20 + side / 2), 24, oz + r.y + r.h - 1.5, brick);
          box(40, 10, 3, cx, 43, oz + r.y + r.h - 1.5, concrete);
          box(r.w + 4, 3, r.h + 4, cx, 50, cz, slate);
          for (const w of [{ x: r.x, y: r.y, w: r.w, h: 3 }, { x: r.x, y: r.y, w: 3, h: r.h }, { x: r.x + r.w - 3, y: r.y, w: 3, h: r.h }, { x: r.x, y: r.y + r.h - 3, w: side, h: 3 }, { x: r.x + r.w / 2 + 20, y: r.y + r.h - 3, w: side, h: 3 }]) solid(site, w);
          doors.push({ x: cx, y: oz + r.y + r.h, room: r.role });
          if (r.role === 'admin') {
            add('sphere', [20, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2], mat('#4a7c59', .4, .45), cx, 51, cz);
            for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
              const x = cx + s * (28 + k * 23), z = oz + r.y + r.h + 7;
              add('cylinder', [2.5, 3, 34, 8], concrete, x, 17, z);
              solid(site, { x: x - ox - 3, y: z - oz - 3, w: 6, h: 6 });
            }
          }
          // Wall-aligned furniture leaves a 40-unit entry aisle in every room.
          for (const s of [-1, 1]) {
            const x = cx + s * (r.w / 2 - 19), z = cz;
            box(22, 14, Math.max(24, r.h - 34), x, 7, z, wood);
            solid(site, { x: x - ox - 11, y: z - oz - (r.h - 34) / 2, w: 22, h: r.h - 34 });
            if (r.role === 'library') for (let k = 0; k < 5; k++) box(19, 2, r.h - 38, x, 17 + k * 4, z, k % 2 ? brick : concrete);
            else if (r.role === 'science') for (let k = 0; k < 3; k++) add('cylinder', [1.5, 2, 6, 8], glass, x, 18, z - 15 + k * 15);
            else box(12, 7, 1, x, 19, z, glass);
          }
          label(r.name, site, r.x + r.w / 2, 41, r.y + r.h + 2, Math.min(r.w - 6, 155));
        }
        label('BAYOU STATE UNIVERSITY · CAMPUS QUAD', site, 224, 24, 380, 280);
      } else {
        box(site.w, .5, site.h, ox + site.w / 2, 0, oz + site.h / 2, green);
        box(40, .7, site.h, ox + 192, .4, oz + site.h / 2, concrete);
        const water = data.water[0]; waters.push({ x: ox + water.x, y: oz + water.y, w: water.w, h: water.h });
        box(water.w, .2, water.h, ox + water.x + water.w / 2, .5, oz + water.y + water.h / 2, mat('#28554f', .2, .22));
        // Main park route remains dry; footbridge crosses only the lagoon spur.
        box(120, 2, 28, ox + 74, 2, oz + 208, wood);
        for (const z of [oz + 195, oz + 221]) { box(120, 1.2, 1.2, ox + 74, 12, z, iron); }
        const trees = Array.from({ length: 12 }, (_, i) => ({ x: 242 + i % 3 * 50, y: 24 + Math.floor(i / 3) * 102 }));
        for (const p of trees) {
          add('cylinder', [2, 4, 26, 8], wood, ox + p.x, 13, oz + p.y);
          add('sphere', [1, 10, 7], mat('#2e4f2f'), ox + p.x, 34, oz + p.y, [29, 11, 26]);
          for (const s of [-1, 1]) box(2, 15, 1, ox + p.x + s * 18, 24, oz + p.y + 6, moss);
          solid(site, { x: p.x - 4, y: p.y - 4, w: 8, h: 8 });
        }
        const x = ox + 138, z = oz + 90;
        box(50, 1.5, 72, x, 1, z, concrete); box(54, 3, 76, x, 34, z, concrete);
        for (let k = 0; k < 4; k++) for (const side of [-1, 1]) {
          const xx = x - 21 + k * 14, zz = z + side * 31;
          add('cylinder', [1.6, 2, 31, 8], concrete, xx, 17, zz);
          solid(site, { x: xx - ox - 2, y: zz - oz - 2, w: 4, h: 4 });
        }
        label('CITY PARK · LIVE OAKS / LAGOON / PERISTYLE', site, 192, 24, 430, 275);
      }
    }
    const dummy = new T.Object3D();
    for (const [geo, byMaterial] of buckets) for (const [material, list] of byMaterial) {
      const mesh = new T.InstancedMesh(geo, material, list.length);
      list.forEach((p, i) => { dummy.position.set(p.x, p.y, p.z); dummy.scale.set(...p.scale); dummy.rotation.set(0, p.ry, 0); dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix); });
      mesh.castShadow = false; mesh.receiveShadow = true; root.add(mesh);
    }
    root.userData.solids = solids; root.userData.water = waters; root.userData.doors = doors;
    scene.add(root); return root;
  }

  if (typeof module !== 'undefined') module.exports = { SIZES, layout, overlap, createNewOrleansLandmarks };
  if (typeof window === 'undefined') return;
  if (window.level29NolaReview) { window.level29NolaReview = { SIZES, layout, createNewOrleansLandmarks }; return; }
  let root = null;
  const sitesCache = new Map();
  const gen = genCity;
  genCity = function () {
    const c = gen.apply(this, arguments); if (!c.world) return c;
    const taken = [...c.buildings, ...c.features, c.farm, c.zoo, c.militaryBase, c.beach, c.themePark?.rect, c.airportParcel, c.recreationParcel, c.residence?.b, c.dealerAnnex, ...(c.originalInfill?.lots || [])].filter(r => r && r.w && r.h);
    // Protect every existing approach, including narrow mission/public paths.
    for (const path of [...(c.relocation?.paths || []).map(p => p.path), ...(c.originalInfill?.paths || []), c.outerCoast?.access || []]) for (const p of path) taken.push({ x: p.x - 24, y: p.y - 24, w: 48, h: 48 });
    c.nolaLandmarks = { sites: {}, paths: [], solids: [], water: [] };
    const university = window.level29Downtown?.lots.university;
    const target = { treme: { x: c.mansion.B.x, y: c.mansion.B.y }, university: { x: (university?.x0 || 80) * 32, y: (university?.y0 || 40) * 32 }, park: { x: 640, y: 3200 } };
    const valid = r => { for (let y = r.y; y < r.y + r.h; y += 32) for (let x = r.x; x < r.x + r.w; x += 32) if (![T_GRASS, T_LOT].includes(c.get(x / 32, y / 32)) || Math.abs(c.heightAt(x + 16, y + 16)) > 1) return false; return !!level29DistrictPlanning.access(c, { x: r.x + r.w / 2, y: r.y + r.h + 32 }, taken.concat(r)); };
    for (const [kind, [w, h]] of Object.entries(SIZES)) {
      let site = sitesCache.get(kind);
      if (!site || taken.some(r => overlap(r, site, 32)) || !valid(site)) site = level29DistrictPlanning.nearest(c, w, h, target[kind], taken, { padding: 32, maxDistance: 6500, valid });
      if (!site) throw Error('No clear NOLA parcel for ' + kind);
      sitesCache.set(kind, site); c.nolaLandmarks.sites[kind] = site;
      const path = level29DistrictPlanning.access(c, { x: site.x + w / 2, y: site.y + h + 32 }, taken.concat(site));
      c.nolaLandmarks.paths.push(path);
      taken.push(site, ...path.map(p => ({ x: p.x - 24, y: p.y - 24, w: 48, h: 48 })));
      for (const p of path) { const k = Math.floor(p.y / 32) * c.width + Math.floor(p.x / 32); if (![T_ROAD, T_BRIDGE].includes(c.g[k])) c.g[k] = T_WALK; }
      const data = layout(kind);
      for (const b of data.homes) {
        const home = { x: site.x + b.x, y: site.y + b.y, w: b.w, h: b.h, H: b.H / 2.4, baseY: 0, kind: 'nola-home', venue: 'nola-exterior' };
        c.buildings.push(home);
      }
      for (const b of data.rooms) c.buildings.push({ x: site.x + b.x, y: site.y + b.y, w: b.w, h: b.h, H: 20, baseY: 0, kind: 'nola-campus', venue: 'nola-room' });
      for (const k of ['trees', 'pineTrees', 'rocks', 'parked']) if (c[k]) c[k] = c[k].filter(p => !overlap({ x: p.x - 10, y: p.y - 10, w: 20, h: 20 }, site, 24) && !path.some(q => Math.hypot(q.x - p.x, q.y - p.y) < 28));
      for (let y = site.y / 32; y < (site.y + h) / 32; y++) for (let x = site.x / 32; x < (site.x + w) / 32; x++) c.g[y * c.width + x] = T_PLAZA;
    }
    indexTrees(c); return c;
  };
  const build = buildCity;
  buildCity = function () {
    build.apply(this, arguments); if (!city?.nolaLandmarks) return;
    root = createNewOrleansLandmarks(THREE, cityGroup, city.nolaLandmarks.sites, { material: level29World.material, label: addSign });
    city.nolaLandmarks.solids = root.userData.solids; city.nolaLandmarks.water = root.userData.water;
  };
  const blocked = blockedCircle;
  blockedCircle = function (x, y, r) {
    const data = city?.nolaLandmarks;
    if (data) {
      for (const b of data.solids) if (hitRect(x, y, r, b)) return true;
      for (const b of data.water) if (hitRect(x, y, r, b) && !(Math.abs(y - (b.y + 160)) < 12 && x > b.x - 28 && x < b.x + b.w + 28)) return true;
    }
    return blocked.apply(this, arguments);
  };
  const blips = extraBlips;
  extraBlips = function () { const out = blips.apply(this, arguments); for (const [kind, r] of Object.entries(city?.nolaLandmarks?.sites || {})) out.push({ x: r.x + r.w / 2, y: r.y + r.h + 16, label: kind === 'university' ? 'UNI' : kind === 'park' ? 'PARK' : 'TR', col: '#c4d1a2' }); return out; };
  window.createNewOrleansLandmarks = function (scene) { return createNewOrleansLandmarks(THREE, scene, city.nolaLandmarks.sites, { material: level29World.material, label: addSign }); };
  window.level29NolaLandmarks = { createNewOrleansLandmarks, get root() { return root; } };
})();
