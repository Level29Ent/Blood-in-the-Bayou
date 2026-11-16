"use strict";
(function () {
  function build(T, C, label = () => {}) {
    const root = new T.Group();
    root.name = "Cypress Leisure Grounds · golf estate farmland karting";
    root.userData.noBatch = true;
    const cube = new T.BoxGeometry(1, 1, 1),
      cyl = new T.CylinderGeometry(1, 1, 1, 10),
      sphere = new T.SphereGeometry(1, 10, 7),
      cone = new T.ConeGeometry(1, 1, 8),
      batches = new Map(),
      dummy = new T.Object3D(),
      roofs = [];
    const mats = {},
      material = (id, color, extra = {}) =>
        mats[id] ||
        (mats[id] = new T.MeshStandardMaterial({
          color,
          roughness: 0.85,
          ...extra,
        }));
    const grass = material("grass", "#557348"),
      fairway = material("fairway", "#6d9252"),
      green = material("green", "#8aaa5e"),
      sand = material("sand", "#c7af77"),
      wood = material("wood", "#816247"),
      cream = material("cream", "#ddcfac"),
      white = material("white", "#eee2c7"),
      dark = material("dark", "#26383a"),
      asphalt = material("asphalt", "#404b50"),
      soil = material("soil", "#654b36"),
      leaf = material("leaf", "#426643"),
      crop = material("crop", "#7a9a41"),
      red = material("red", "#9f4e43"),
      metal = material("metal", "#a1aaa3", { metalness: 0.35 }),
      gold = material("gold", "#dfb75e");
    function put(geo, mat, x, y, z, sx, sy, sz, rx = 0, ry = 0, rz = 0) {
      if (!batches.has(geo)) batches.set(geo, new Map());
      const by = batches.get(geo);
      if (!by.has(mat)) by.set(mat, []);
      dummy.position.set(x, y, z);
      dummy.rotation.set(rx, ry, rz);
      dummy.scale.set(sx, sy, sz);
      dummy.updateMatrix();
      by.get(mat).push(dummy.matrix.clone());
    }
    const box = (m, w, h, d, x, y, z) => put(cube, m, x, y, z, w, h, d);
    const rod = (a, b, r, m) => {
      const p = new T.Vector3(...a),
        q = new T.Vector3(...b),
        delta = q.clone().sub(p);
      dummy.position.copy(p.add(q).multiplyScalar(0.5));
      dummy.quaternion.setFromUnitVectors(
        new T.Vector3(0, 1, 0),
        delta.clone().normalize(),
      );
      dummy.scale.set(r, delta.length(), r);
      dummy.updateMatrix();
      if (!batches.has(cyl)) batches.set(cyl, new Map());
      const by = batches.get(cyl);
      if (!by.has(m)) by.set(m, []);
      by.get(m).push(dummy.matrix.clone());
    };
    box(grass, C.SIZE.w, 2, C.SIZE.h, C.SIZE.w / 2, -1, C.SIZE.h / 2);
    box(sand, 90, 0.12, 1230, 850, 0.08, 700);
    box(sand, 790, 0.12, 70, 1260, 0.09, 370);
    // Course: three individually numbered fairways, bunker islands, tees and flagsticks.
    C.HOLES.forEach((h, i) => {
      const a = h.tee,
        b = h.cup,
        length = Math.hypot(a.x - b.x, a.y - b.y),
        angle = -Math.atan2(b.y - a.y, b.x - a.x);
      put(
        cube,
        fairway,
        (a.x + b.x) / 2,
        0.12,
        (a.y + b.y) / 2,
        length + 45,
        0.15,
        125,
        0,
        angle,
      );
      put(cyl, green, b.x, 0.25, b.y, 48, 0.2, 45);
      put(cyl, dark, b.x, 0.4, b.y, 5.5, 0.15, 5.5);
      rod([b.x, 0.5, b.y], [b.x, 38, b.y], 0.65, white);
      box(i % 2 ? red : gold, 17, 10, 0.5, b.x + 8, 33, b.y);
      for (const side of [-1, 1])
        put(sphere, white, a.x, 0.9, a.y + side * 12, 2, 1.5, 2);
      label(
        root,
        "HOLE " + (i + 1) + " · PAR " + h.par,
        70,
        7,
        a.x,
        10,
        a.y - 32,
        "#f0e4bf",
      );
    });
    for (const b of C.BUNKERS)
      put(cyl, sand, b.x + b.w / 2, 0.25, b.y + b.h / 2, b.w / 2, 0.2, b.h / 2);
    // Distinct manor, pro shop, market, garage and barn. Front doorways stay open.
    for (const [id, b] of Object.entries(C.BUILDINGS)) {
      const height = id === "manor" ? 60 : id === "barn" ? 43 : 28,
        m = id === "barn" ? red : id === "garage" ? dark : cream,
        door = 44;
      box(m, b.w, height, 3, b.x + b.w / 2, height / 2, b.y);
      for (const x of [b.x, b.x + b.w])
        box(m, 3, height, b.h, x, height / 2, b.y + b.h / 2);
      for (const side of [-1, 1])
        box(
          m,
          (b.w - door) / 2,
          height,
          3,
          b.x + b.w / 2 + side * (door / 2 + (b.w - door) / 4),
          height / 2,
          b.y + b.h,
        );
      box(wood, door, 4, 4, b.x + b.w / 2, height - 2, b.y + b.h);
      box(sand, b.w - 4, 0.3, b.h - 3, b.x + b.w / 2, 0.2, b.y + b.h / 2);
      const roof = new T.Group();
      roof.name = id + " · roof hides for indoor camera";
      for (const side of [-1, 1]) {
        const mesh = new T.Mesh(
          new T.BoxGeometry(b.w * 0.55, 2, b.h + 14),
          dark,
        );
        mesh.position.set(
          b.x + b.w / 2 + side * b.w * 0.24,
          height + 10,
          b.y + b.h / 2,
        );
        mesh.rotation.z = -side * 0.28;
        roof.add(mesh);
      }
      root.add(roof);
      roofs.push({ id, b, root: roof });
      for (let x = b.x + 25; x < b.x + b.w - 15; x += 50)
        for (const yy of id === "manor" ? [22, 46] : [17]) {
          if (Math.abs(x - (b.x + b.w / 2)) < door / 2 + 15) continue;
          box(dark, 17, 15, 1, x, yy, b.y + b.h + 2);
          box(white, 1, 15, 1.4, x, yy, b.y + b.h + 3);
          box(white, 18, 1, 1.4, x, yy, b.y + b.h + 3);
        }
      const service = {
        club: C.SERVICES.golf,
        market: C.SERVICES.farm,
        garage: C.SERVICES.kart,
      }[id];
      if (service) {
        for (const side of [-1, 1])
          box(wood, 62, 10, 14, service.x + side * 62, 5, service.y);
        label(
          root,
          {
            club: "CYPRESS LINKS · PRO SHOP",
            market: "BELLE RIVE · FARM MARKET",
            garage: "BAYOU STACKS · KART RENTALS",
          }[id],
          Math.min(220, b.w - 20),
          10,
          b.x + b.w / 2,
          height + 4,
          b.y + b.h + 2,
          "#eeddb3",
        );
      }
      // Side-wall fixtures preserve the center walking line and service counter gap.
      if (id === "club")
        for (let i = 0; i < 5; i++) {
          box(wood, 24, 18, 12, b.x + 28 + i * 33, 9, b.y + 18);
          for (let j = 0; j < 3; j++)
            rod(
              [b.x + 20 + i * 33 + j * 4, 7, b.y + 19],
              [b.x + 20 + i * 33 + j * 4, 28, b.y + 19],
              0.35,
              metal,
            );
        }
      if (id === "market")
        for (let i = 0; i < 6; i++) {
          box(wood, 25, 7, 20, b.x + 28 + i * 37, 3.5, b.y + 22);
          for (let j = 0; j < 4; j++)
            put(
              sphere,
              i % 2 ? crop : red,
              b.x + 20 + i * 37 + j * 4,
              9,
              b.y + 22,
              2,
              2,
              2,
            );
        }
      if (id === "garage") {
        for (let i = 0; i < 4; i++) {
          box(metal, 35, 15, 10, b.x + 33 + i * 70, 7.5, b.y + 18);
          for (let j = 0; j < 3; j++)
            put(
              sphere,
              i % 2 ? gold : red,
              b.x + 25 + i * 70 + j * 8,
              19,
              b.y + 18,
              3.5,
              4,
              3.5,
            );
        }
        for (let i = 0; i < 5; i++)
          put(cyl, dark, b.x + 15, 3 + i * 4, b.y + b.h * 0.5, 8, 3, 8);
      }
      if (id === "manor") {
        box(wood, b.w + 25, 1.2, 45, b.x + b.w / 2, 0.6, b.y + b.h + 19);
        box(cream, b.w + 25, 2, 48, b.x + b.w / 2, 34, b.y + b.h + 20);
        for (let i = 0; i < 6; i++) {
          const x = b.x + 12 + (i * (b.w - 24)) / 5;
          put(cyl, white, x, 17, b.y + b.h + 35, 2, 32, 2);
          put(cyl, cream, x, 2, b.y + b.h + 35, 4, 3, 4);
        }
        for (const side of [-1, 1]) {
          const x = b.x + b.w / 2 + side * 90;
          box(wood, 70, 9, 25, x, 4.5, b.y + 55);
          box(green, 72, 4, 27, x, 10, b.y + 55);
          box(wood, 42, 12, 24, x, 6, b.y + 150);
          box(gold, 22, 1, 16, x, 13, b.y + 150);
        }
        box(wood, 60, 3, 32, b.x + b.w / 2, 13, b.y + 45);
        for (const side of [-1, 1])
          box(dark, 12, 12, 12, b.x + b.w / 2 + side * 42, 6, b.y + 45);
        label(
          root,
          "BELLE RIVE · WORKING FARMLAND ESTATE",
          280,
          12,
          b.x + b.w / 2,
          76,
          b.y + b.h + 18,
          "#f2ddac",
        );
      }
      if (id === "barn") {
        for (let i = 0; i < 5; i++) {
          put(
            cyl,
            sand,
            b.x + 25 + i * 43,
            8,
            b.y + 25,
            10,
            15,
            10,
            Math.PI / 2,
          );
          box(wood, 28, 12, 25, b.x + 25 + i * 43, 6, b.y + 100);
        }
        rod(
          [b.x + b.w + 15, 0, b.y + 15],
          [b.x + b.w + 15, 60, b.y + 15],
          8,
          metal,
        );
        put(cone, metal, b.x + b.w + 15, 66, b.y + 15, 9, 14, 9);
      }
    }
    // Field rows are batched, not hundreds of individually animated crop meshes.
    C.PLOTS.forEach((p, i) => {
      box(soil, p.w, 0.2, p.h, p.x + p.w / 2, 0.15, p.y + p.h / 2);
      for (let row = 0; row < 5; row++)
        for (let col = 0; col < 7; col++) {
          const x = p.x + 10 + col * 13,
            z = p.y + 10 + row * 19;
          const height = p.crop === "okra" ? 9 : p.crop === "corn" ? 23 : 32;
          put(cyl, wood, x, height / 2, z, 0.45, height, 0.45);
          for (const side of [-1, 1])
            put(
              sphere,
              p.crop === "okra" ? leaf : crop,
              x + side * 2,
              height * 0.68,
              z,
              p.crop === "okra" ? 3.8 : 4.8,
              0.8,
              2.5,
              0,
              side * 0.4,
              side * 0.2,
            );
          if (p.crop === "corn") put(sphere, gold, x + 1.5, 14, z, 1, 3, 1);
          if (p.crop === "sugarcane")
            put(cyl, crop, x + 2, 13, z + 2, 0.4, 26, 0.4);
        }
      label(
        root,
        i + 1 + " · " + p.crop.toUpperCase(),
        65,
        6,
        p.x + p.w / 2,
        12,
        p.y - 9,
        "#e6d8a6",
      );
    });
    // Two-level figure-eight: the same crossing has a 42-unit vertical clearance.
    const vertices = [],
      normals = [],
      indices = [],
      edge = [[], []],
      N = C.TRACK.length;
    for (let i = 0; i <= N; i++) {
      const p = C.TRACK[i % N],
        next = C.TRACK[(i + 1) % N],
        prev = C.TRACK[(i - 1 + N) % N],
        a = Math.atan2(next.y - prev.y, next.x - prev.x),
        nx = -Math.sin(a),
        nz = Math.cos(a);
      for (const side of [-1, 1]) {
        vertices.push(p.x + nx * side * 20, p.h + 1, p.y + nz * side * 20);
        normals.push(0, 1, 0);
        edge[side < 0 ? 0 : 1].push([
          p.x + nx * side * 20,
          p.h + 5,
          p.y + nz * side * 20,
        ]);
      }
      if (i < N) {
        const k = i * 2;
        indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
      }
      if (i < N && i % 5 === 0 && p.h > 12)
        for (const side of [-1, 1])
          rod(
            [p.x + nx * side * 15, 0, p.y + nz * side * 15],
            [p.x + nx * side * 15, p.h, p.y + nz * side * 15],
            1.6,
            metal,
          );
    }
    const deckGeo = new T.BufferGeometry();
    deckGeo.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
    deckGeo.setAttribute("normal", new T.Float32BufferAttribute(normals, 3));
    deckGeo.setIndex(indices);
    deckGeo.computeBoundingSphere();
    const deck = new T.Mesh(deckGeo, asphalt);
    deck.name = "Continuous ramped two-level circuit";
    root.add(deck);
    for (const list of edge)
      for (let i = 0; i < N; i++)
        rod(list[i], list[i + 1], 0.7, i % 5 ? white : red);
    const start = C.TRACK[0],
      next = C.TRACK[1],
      angle = -Math.atan2(next.y - start.y, next.x - start.x);
    for (let j = 0; j < 10; j++)
      put(
        cube,
        j % 2 ? white : dark,
        start.x + Math.sin(angle) * (j - 4.5) * 4,
        start.h + 1.2,
        start.y + Math.cos(angle) * (j - 4.5) * 4,
        4,
        0.2,
        5,
        0,
        angle,
      );
    label(
      root,
      "BAYOU STACKS · TWO LEVELS · 3 LAPS",
      350,
      16,
      1300,
      63,
      790,
      "#f1d88f",
    );
    // Spectator rail separates walking visitors from the active kart-only circuit.
    for (const [a, b] of [
      [
        [905, 0, 790],
        [1695, 0, 790],
      ],
      [
        [905, 0, 790],
        [905, 0, 1280],
      ],
      [
        [1695, 0, 790],
        [1695, 0, 1280],
      ],
      [
        [905, 0, 1280],
        [1695, 0, 1280],
      ],
    ]) {
      rod([a[0], 11, a[2]], [b[0], 11, b[2]], 0.8, wood);
      const n = Math.ceil(Math.hypot(b[0] - a[0], b[2] - a[2]) / 32);
      for (let i = 0; i <= n; i++)
        rod(
          [a[0] + ((b[0] - a[0]) * i) / n, 0, a[2] + ((b[2] - a[2]) * i) / n],
          [a[0] + ((b[0] - a[0]) * i) / n, 13, a[2] + ((b[2] - a[2]) * i) / n],
          1,
          wood,
        );
    }
    for (const [x, z] of [
      [950, 765],
      [1500, 755],
      [900, 150],
      [800, 350],
      [800, 700],
      [780, 1200],
    ]) {
      box(wood, 35, 2, 10, x, 6, z);
      for (const side of [-1, 1]) box(dark, 2, 6, 8, x + side * 12, 3, z);
    }
    for (let i = 0; i < 18; i++) {
      const x = i < 9 ? 45 : 1785,
        z = 80 + (i % 9) * 145;
      rod([x, 0, z], [x, 32, z], 2, wood);
      put(sphere, leaf, x, 40, z, 15, 18, 15);
    }
    label(
      root,
      "CYPRESS LEISURE GROUNDS · SHUTTLE TO CITY",
      290,
      15,
      850,
      34,
      170,
      "#f4dfa8",
    );
    for (const side of [-1, 1])
      rod([850 + side * 155, 0, 170], [850 + side * 155, 45, 170], 2.3, wood);
    for (const [geo, groups] of batches)
      for (const [m, list] of groups) {
        const mesh = new T.InstancedMesh(geo, m, list.length);
        mesh.name = "Leisure · shared static detail";
        mesh.userData.noBatch = true;
        list.forEach((matrix, i) => mesh.setMatrixAt(i, matrix));
        mesh.instanceMatrix.needsUpdate = true;
        mesh.frustumCulled = false;
        root.add(mesh);
      }
    const crates = C.PLOTS.map((p) => {
      const mesh = new T.Mesh(new T.BoxGeometry(10, 7, 9), wood);
      mesh.position.set(p.x + p.w / 2, 4, p.y + p.h + 10);
      mesh.name = "Harvestable produce crate";
      root.add(mesh);
      return mesh;
    });
    const checkpoint = new T.Group();
    checkpoint.name = "Next ordered kart checkpoint";
    const gateGeo = new T.BoxGeometry(1, 1, 1);
    for (const side of [-1, 1]) {
      const post = new T.Mesh(gateGeo, gold);
      post.scale.set(1, 22, 1);
      post.position.set(0, 11, side * 18);
      checkpoint.add(post);
    }
    const beam = new T.Mesh(gateGeo, gold);
    beam.scale.set(2, 1.5, 38);
    beam.position.y = 22;
    checkpoint.add(beam);
    checkpoint.visible = false;
    root.add(checkpoint);
    const ball = new T.Mesh(new T.SphereGeometry(2.2, 10, 8), white);
    ball.visible = false;
    ball.name = "Playable golf ball";
    root.add(ball);
    const kart = new T.Group();
    kart.name = "Manually driven rental kart";
    const kartPart = (geometry, m, x, y, z) => {
      const mesh = new T.Mesh(geometry, m);
      mesh.position.set(x, y, z);
      kart.add(mesh);
      return mesh;
    };
    kartPart(new T.BoxGeometry(17, 3, 10), red, 0, 4, 0);
    kartPart(new T.BoxGeometry(6, 7, 7), dark, -2, 8, 0);
    kartPart(new T.BoxGeometry(7, 2, 11), gold, 7, 4, 0);
    for (const x of [-6, 6])
      for (const z of [-6, 6]) {
        const wheel = kartPart(
          new T.CylinderGeometry(2.7, 2.7, 2, 10),
          dark,
          x,
          2.7,
          z,
        );
        wheel.rotation.x = Math.PI / 2;
      }
    kartPart(new T.SphereGeometry(2.6, 10, 8), gold, -2, 15, 0);
    kartPart(new T.BoxGeometry(5, 6, 6), green, -2, 10, 0);
    kart.visible = false;
    root.add(kart);
    return {
      root,
      roofs,
      ball,
      kart,
      crates,
      checkpoint,
      stats: {
        staticBatches: [...batches.values()].reduce((n, v) => n + v.size, 0),
        plots: 6,
        holes: 3,
        levels: 2,
      },
    };
  }
  const api = { build };
  if (typeof module !== "undefined") module.exports = api;
  if (typeof window !== "undefined") window.BayouLeisureScenery = api;
})();
