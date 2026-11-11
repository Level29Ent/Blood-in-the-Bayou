"use strict";
(function () {
  const PERKS = {
    stamina: { name: "Endurance", max: 3 },
    reload: { name: "Quick hands", max: 3 },
    melee: { name: "Heavy strike", max: 3 },
    stealth: { name: "Quiet steps", max: 3 },
  };
  const RECIPES = {
    poultice: { name: "Herbal poultice · heal 35", cost: 75 },
    tonic: { name: "Cypress tonic · speed for 60s", cost: 150 },
    charm: { name: "Swamp charm · hazard resistance for 120s", cost: 250 },
  };
  function fresh() {
    return {
      v: 1,
      seconds: 0,
      missions: [],
      points: 0,
      perks: { stamina: 0, reload: 0, melee: 0, stealth: 0 },
      owned: [],
      skin: "",
      outfit: "",
      bounties: [],
      records: { survival: 0, fastest: null, bounties: 0 },
    };
  }
  function normalize(d) {
    const s = fresh();
    if (d?.v !== 1) return s;
    s.seconds = Math.max(0, Math.min(1e8, Number(d.seconds) || 0));
    for (const k of ["missions", "bounties", "owned"])
      s[k] = [
        ...new Set(
          (Array.isArray(d[k]) ? d[k] : []).filter(
            (x) => typeof x === "string",
          ),
        ),
      ].slice(0, 500);
    for (const k of Object.keys(PERKS))
      s.perks[k] = Math.max(
        0,
        Math.min(3, Math.floor(Number(d.perks?.[k]) || 0)),
      );
    s.points = Math.max(0, Math.min(10000, Math.floor(Number(d.points) || 0)));
    for (const k of ["skin", "outfit"])
      s[k] = s.owned.includes(d[k]) ? d[k] : "";
    s.records.survival = Math.max(0, Number(d.records?.survival) || 0);
    s.records.fastest =
      Number(d.records?.fastest) > 0 ? Number(d.records.fastest) : null;
    s.records.bounties = s.bounties.length;
    return s;
  }
  function unlock(s, id) {
    if (!PERKS[id] || s.points < 1 || s.perks[id] >= 3) return false;
    s.points--;
    s.perks[id]++;
    return true;
  }
  function awardMission(s, id, seconds) {
    id = String(id);
    if (Number.isFinite(seconds) && seconds > 0)
      s.records.fastest = Math.min(s.records.fastest || Infinity, seconds);
    if (s.missions.includes(id)) return false;
    s.missions.push(id);
    s.points++;
    return true;
  }
  function height(x, z) {
    if (x >= 198 && x <= 234 && z >= 50 && z <= 150) return (150 - z) * 0.36;
    return z <= 50 ? 36 : 0;
  }
  function room(T, kind) {
    const g = new T.Group();
    g.name = "Survival interior · " + kind;
    const geos = new Set(),
      mats = new Set(),
      colliders = [];
    const mat = (c) => {
      const m = new T.MeshStandardMaterial({ color: c, roughness: 0.85 });
      mats.add(m);
      return m;
    };
    const wood = mat("#76624c"),
      stone = mat("#777e78"),
      iron = mat("#344b55"),
      gold = mat("#c5a365"),
      box = (w, h, d, x, y, z, m, solid = false) => {
        const geo = new T.BoxGeometry(w, h, d);
        geos.add(geo);
        const mesh = new T.Mesh(geo, m);
        mesh.position.set(x, y, z);
        g.add(mesh);
        if (solid) colliders.push({ x: x - w / 2, y: z - d / 2, w, h: d });
        return mesh;
      };
    box(240, 2, 180, 120, -1, 90, stone);
    box(240, 2, 50, 120, 35, 25, wood);
    for (const x of [0, 240])
      box(
        2,
        kind === "docks" && x === 240 ? 8 : 76,
        180,
        x,
        kind === "docks" && x === 240 ? 4 : 38,
        90,
        stone,
        true,
      );
    for (const z of [0, 180]) box(240, 76, 2, 120, 38, z, stone, true);
    // Continuous staircase-sized ramp and an upper gallery; no teleport needed for upper floor.
    const geo = new T.BufferGeometry();
    geo.setAttribute(
      "position",
      new T.Float32BufferAttribute(
        [
          198, 0, 150, 234, 0, 150, 234, 36, 50, 198, 0, 150, 234, 36, 50, 198,
          36, 50,
        ],
        3,
      ),
    );
    geo.computeVertexNormals();
    geos.add(geo);
    g.add(new T.Mesh(geo, wood));
    for (let i = 0; i < 12; i++)
      box(36, 0.5, 1, 216, i * 3 + 0.5, 150 - (i * 100) / 12, gold);
    for (let i = 0; i < 6; i++) {
      const x = 20 + i * 29;
      box(1, 10, 1, x, 42, 49, iron);
      box(29, 1, 1, x + 14, 47, 49, iron);
    } // gallery guard rail
    if (kind === "manor") {
      for (const x of [30, 170])
        for (const z of [70, 135]) box(5, 60, 5, x, 30, z, gold, true);
      box(80, 1, 50, 110, 0.3, 100, wood);
      box(240, 2, 180, 120, -49, 90, stone);
      for (const x of [0, 240]) box(2, 48, 180, x, -24, 90, stone);
      for (const z of [0, 180]) box(240, 48, 2, 120, -24, z, stone);
      box(64, 8, 12, 120, -44, 28, iron);
      for (const x of [45, 145]) box(22, 12, 8, x, 6, 32, wood);
    }
    if (kind === "docks") {
      box(600, 1, 900, 550, -5, 90, mat("#325868"));
      box(72, 5, 26, 300, -1, 122, wood);
      box(62, 2, 22, 300, 3, 122, wood);
      box(3, 10, 3, 272, 7, 122, iron);
      box(28, 1, 34, 285, 12, 122, wood);
      box(12, 7, 18, 290, 7, 122, iron);
      for (let i = 0; i < 5; i++)
        box(25, 20, 20, 25 + i * 30, 10, 22, wood, true);
      for (let i = 0; i < 3; i++)
        box(26, 20, 24, 25, 10, 65 + i * 35, wood, true);
    }
    let gate = null;
    if (kind === "jail") {
      for (const z of [40, 80, 120])
        for (let x = 10; x <= 65; x += 8) box(2, 30, 2, x, 15, z, iron, true);
      for (let z = 40; z <= 120; z += 8)
        if (z < 68 || z > 92) box(2, 30, 2, 65, 15, z, iron, true);
      gate = box(3, 30, 24, 65, 15, 80, iron);
      colliders.push({ x: 63, y: 68, w: 4, h: 24, gate: true });
    }
    const loot = box(12, 7, 8, 120, 40, 22, gold);
    loot.name = "Upper-gallery tactical case";
    const hatch = box(18, 1, 18, 45, 0.6, 155, iron);
    hatch.name = "Panic-room hatch";
    g.userData = {
      ownedGeometries: geos,
      ownedMaterials: mats,
      colliders,
      gate,
      loot,
    };
    return g;
  }
  if (typeof module !== "undefined")
    module.exports = {
      PERKS,
      RECIPES,
      fresh,
      normalize,
      unlock,
      awardMission,
      height,
      room,
    };
  if (typeof window === "undefined") return;
  window.level29SurvivalGeometry = { room, height };
  let saved = fresh();
  try {
    saved = normalize(
      JSON.parse(localStorage.getItem("level29.survival-expansion.v1")),
    );
  } catch (_) {}
  let outdoorZombies = null,
    active = null,
    root = null,
    enemies = [],
    returnPoint = null,
    missionStart = null,
    alive = 0,
    lastSave = 0,
    session = 0,
    buffs = { tonic: 0, charm: 0 },
    breach = 0,
    last = 0,
    actor = null,
    basement = false,
    doorBreached = false;
  const ORIGIN = { x: 14500, y: 14500 };
  function save() {
    saved.records.survival = Math.max(saved.records.survival, session);
    try {
      localStorage.setItem(
        "level29.survival-expansion.v1",
        JSON.stringify(saved),
      );
    } catch (_) {}
    window.level29Save?.save();
  }
  let siteOwner = null,
    cachedSites = [];
  function sites() {
    const c = city;
    if (c && c === siteOwner) return cachedSites;
    if (!c?.world) return [];
    const venues = c.venues || [],
      treme = c.nolaLandmarks?.sites.treme;
    const apothecary = venues
      .filter(
        (v) =>
          v.id === "business" && !v.southern && !v.storyRole && !v.mallStore,
      )
      .sort(
        (a, b) =>
          Math.hypot(a.doorX - (treme?.x || 0), a.doorY - (treme?.y || 0)) -
          Math.hypot(b.doorX - (treme?.x || 0), b.doorY - (treme?.y || 0)),
      )[0];
    siteOwner = c;
    cachedSites = [
      { id: "apothecary", name: "FRENCH QUARTER APOTHECARY", v: apothecary },
      {
        id: "docks",
        name: "ABANDONED RIVER WAREHOUSE",
        v: venues.find((v) => v.southern === "sawmill"),
      },
      {
        id: "manor",
        name: "PLANTATION RUINS",
        v: venues.find((v) => v.southern === "manor"),
      },
      {
        id: "jail",
        name: "PARISH LOCKDOWN",
        v: venues.find((v) => v.southern === "federal"),
      },
    ].filter((s) => s.v);
    return cachedSites;
  }
  function near(site) {
    return (
      site &&
      player &&
      !player.car &&
      Math.hypot(player.x - site.v.doorX, player.y - site.v.doorY) < 64
    );
  }
  function busy() {
    return (
      mpRole ||
      window.level29Prologue?.active ||
      mission?.phase === "active" ||
      window.level29Jobs?.active ||
      window.level29SurvivorStories?.active ||
      window.level29Creole?.run ||
      window.level29CityEvents?.dispatch
    );
  }
  const modal = document.createElement("dialog");
  modal.id = "survivalDialog";
  modal.setAttribute("aria-label", "Survival services");
  document.body.appendChild(modal);
  let previous = "play";
  function close() {
    if (modal.open) modal.close();
    document.body.classList.remove("ux-modal");
    mouse.down = false;
    for (const k in keys) keys[k] = false;
    if (state === "shop") state = previous;
  }
  function add(text, fn) {
    const b = document.createElement("button");
    b.textContent = text;
    b.type = "button";
    b.onclick = fn;
    modal.appendChild(b);
    return b;
  }
  function p(t) {
    const x = document.createElement("p");
    x.textContent = t;
    modal.appendChild(x);
  }
  function show() {
    if (
      (!["play", "pause"].includes(state) &&
        !(state === "shop" && modal.open)) ||
      player?.dead
    )
      return;
    if (!modal.open) previous = state;
    state = "shop";
    mouse.down = false;
    for (const k in keys) keys[k] = false;
    document.exitPointerLock?.();
    modal.replaceChildren();
    p("SURVIVAL · " + saved.points + " SKILL POINTS · $" + Math.floor(cash));
    for (const [id, d] of Object.entries(PERKS))
      add(d.name + " " + saved.perks[id] + "/3 · 1 point", () => {
        if (unlock(saved, id)) {
          save();
          show();
        }
      });
    p(
      "Earn one point per five minutes alive and per first mission completion. Endurance improves sprint speed; Quick hands speeds new-weapon reloads; Heavy strike improves melee; Quiet steps reduces footstep noise.",
    );
    for (const id of [
      "skin-bronze",
      "skin-olive",
      "outfit-indigo",
      "outfit-cypress",
    ])
      add(id + " · " + (saved.owned.includes(id) ? "EQUIP" : "$600"), () => {
        if (!saved.owned.includes(id)) {
          if (cash < 600) return p("Not enough game cash.");
          cash -= 600;
          saved.owned.push(id);
        }
        if (id.startsWith("skin")) saved.skin = id;
        else saved.outfit = id;
        save();
      });
    p(
      "Vehicle paint is available at the existing garage workshop; bring your vehicle. Cosmetics use earned game cash only.",
    );
    p(
      "LOCAL RECORDS — THIS BROWSER ONLY · Longest life " +
        Math.floor(saved.records.survival) +
        "s · Fastest mission " +
        (saved.records.fastest
          ? Math.round(saved.records.fastest) + "s"
          : "—") +
        " · Bounties " +
        saved.records.bounties,
    );
    p(
      "Global/friend rankings and public quick-match require an authenticated persistent backend; not enabled.",
    );
    if (!active) {
      for (const site of sites()) {
        const ready = near(site);
        add(
          site.name +
            (ready
              ? " · ENTER"
              : " · " +
                Math.round(
                  Math.hypot(player.x - site.v.doorX, player.y - site.v.doorY),
                ) +
                " units away"),
          () => {
            if (!ready)
              return p("Travel to its entrance first. Follow its map blip.");
            if (site.id === "apothecary") {
              shop();
              return;
            }
            if (busy())
              return p(
                "Finish your current mission first. These exploration operations are solo.",
              );
            close();
            enter(site);
          },
        );
      }
    }
    if (active) {
      p(
        active.name +
          " · " +
          enemies.filter((z) => z.alive).length +
          " infected remaining",
      );
      if (active.id === "jail" && !doorBreached)
        add("BREACH REINFORCED CELL DOOR · HOLD POSITION 3s", () => {
          close();
          breach = 3;
        });
      if (
        enemies.every((z) => !z.alive) &&
        doorBreached &&
        active.id === "jail"
      )
        add("RELEASE TRAPPED SURVIVOR / SECURE ARMORY", () => {
          if (
            Math.hypot(player.x - (ORIGIN.x + 85), player.y - (ORIGIN.y + 80)) >
            40
          )
            return p("Approach the breached cell door.");
          reward();
        });
      if (active.id !== "jail" && enemies.every((z) => !z.alive))
        add(
          active.id === "manor"
            ? "ENTER HIDDEN PANIC ROOM / SECURE LOOT"
            : "SECURE UPPER GALLERY CASE",
          () => {
            if (
              Math.hypot(
                player.x - (ORIGIN.x + 120),
                player.y - (ORIGIN.y + 22),
              ) > 32
            )
              return p("Reach the marked upper-gallery case using the stairs.");
            reward();
            if (active?.id === "manor") {
              basement = true;
              for (const z of enemies) z.alive = false;
              player.x = ORIGIN.x + 120;
              player.y = ORIGIN.y + 130;
              snapCamera();
            }
          },
        );
      if (active.id === "docks")
        add("FLATBOAT EXTRACTION TO CITY PARK", () => {
          if (enemies.some((z) => z.alive))
            return p("Clear the infected first.");
          const park = city?.nolaLandmarks?.sites.park;
          if (!park) return;
          close();
          leave();
          player.x = park.x + 150;
          player.y = park.y + 314;
          snapCamera();
        });
      add("RETURN TO STREET", () => {
        close();
        leave();
      });
    }
    add("BACK TO GAME", close);
    if (!modal.open) modal.showModal();
    document.body.classList.add("ux-modal");
  }
  function shop() {
    modal.replaceChildren();
    p("FRENCH QUARTER APOTHECARY · SAFE TRADING ZONE");
    for (const [id, d] of Object.entries(RECIPES))
      add(d.name + " · $" + d.cost, () => {
        if (cash < d.cost) return p("Not enough game cash.");
        if (id === "poultice" && player.hp >= player.maxHp)
          return p("Health is full.");
        cash -= d.cost;
        if (id === "poultice")
          player.hp = Math.min(player.maxHp, player.hp + 35);
        else buffs[id] = id === "tonic" ? 60 : 120;
        save();
        p(d.name + " applied. Timers advance only while playing.");
      });
    add("BACK", show);
  }
  function reward() {
    const id = active.id;
    if (saved.bounties.includes(id))
      return p("Case already claimed. You may still explore or extract.");
    saved.bounties.push(id);
    saved.records.bounties = saved.bounties.length;
    cash += id === "jail" ? 2200 : 1800;
    giveW(id === "manor" ? "sniper29" : "battle762", 24);
    saved.points++;
    if (actor) actor.visible = false;
    save();
    p(
      "Bounty secured · weapon, ammo, game cash and one skill point. Each location rewards once.",
    );
  }
  function enter(site) {
    outdoorZombies = zombies;
    zombies = [];
    active = site;
    returnPoint = { x: player.x, y: player.y };
    root = room(THREE, site.id);
    root.position.set(ORIGIN.x, 0, ORIGIN.y);
    scene.add(root);
    cityGroup.visible = false;
    player.x = ORIGIN.x + 120;
    player.y = ORIGIN.y + 157;
    player.vx = player.vy = 0;
    doorBreached = site.id !== "jail";
    basement = false;
    enemies = [];
    for (const [x, y] of [
      [110, 70],
      [140, 110],
      [170, 80],
    ]) {
      const z = makeZombie(ORIGIN.x + x, ORIGIN.y + y, "walker");
      z.alert = true;
      z.survivalRoom = true;
      zombies.push(z);
      enemies.push(z);
    }
    if (site.id === "jail") {
      actor = makeFigure(false);
      setFigureColors(actor, "#aa7857", "#977c52", "#414d59");
      actor.position.set(ORIGIN.x + 35, 0, ORIGIN.y + 60);
      scene.add(actor);
    }
    snapCamera();
    window.level29UX?.note(
      "survival-room",
      "E · Inspect room services. Stairs lead to gallery loot. Clear infected before extraction.",
    );
  }
  function leave() {
    for (const z of enemies) {
      z.alive = false;
      z.killSource = "ambient";
    }
    parts = parts.filter(
      (q) => Math.hypot(q.x - ORIGIN.x, q.y - ORIGIN.y) > 400,
    );
    zombies = outdoorZombies || zombies.filter((z) => !z.survivalRoom);
    outdoorZombies = null;
    enemies = [];
    level29RuntimePolicy.disposeOwned(root);
    root = null;
    if (actor) {
      level29RuntimePolicy.figureOwnership(actor);
      level29RuntimePolicy.disposeOwned(actor);
      actor = null;
    }
    if (cityGroup) cityGroup.visible = true;
    if (returnPoint && player) {
      player.x = returnPoint.x;
      player.y = returnPoint.y;
      player.vx = player.vy = 0;
      snapCamera();
    }
    active = null;
    returnPoint = null;
    basement = false;
    breach = 0;
  }
  const terrain = terrainHeight;
  terrainHeight = function (x, y) {
    if (
      active &&
      x >= ORIGIN.x &&
      x <= ORIGIN.x + 240 &&
      y >= ORIGIN.y &&
      y <= ORIGIN.y + 180
    )
      return basement ? -48 : height(x - ORIGIN.x, y - ORIGIN.y);
    return terrain.apply(this, arguments);
  };
  const solid = solidAt;
  solidAt = function (x, y) {
    if (
      active &&
      x > ORIGIN.x - 16 &&
      x < ORIGIN.x + 256 &&
      y > ORIGIN.y - 16 &&
      y < ORIGIN.y + 196
    )
      return roomBlocked(x, y, 0);
    return solid.apply(this, arguments);
  };
  function roomBlocked(x, y, r) {
    x -= ORIGIN.x;
    y -= ORIGIN.y;
    return (
      x < r + 3 ||
      x > 237 - r ||
      y < r + 3 ||
      y > 177 - r ||
      (!basement &&
        root.userData.colliders.some(
          (b) => (!b.gate || !doorBreached) && hitRect(x, y, r, b),
        ))
    );
  }
  const tile = tileAt;
  tileAt = function (x, y) {
    if (
      active &&
      x > ORIGIN.x - 16 &&
      x < ORIGIN.x + 256 &&
      y > ORIGIN.y - 16 &&
      y < ORIGIN.y + 196
    )
      return roomBlocked(x, y, 0) ? T_BLD : T_LOT;
    return tile.apply(this, arguments);
  };
  const goal = zombieGoal;
  zombieGoal = function (z, x, y) {
    if (active && enemies.includes(z)) return { x, y };
    return goal.apply(this, arguments);
  };
  const block = blockedCircle;
  blockedCircle = function (x, y, r) {
    if (active && (moverCtx === player || enemies.includes(moverCtx)))
      return roomBlocked(x, y, r);
    return block.apply(this, arguments);
  };
  const service = serviceVenue;
  serviceVenue = function () {
    if (active) {
      show();
      return;
    }
    const site = sites().find(near);
    if (site && site.id === "apothecary" && !busy()) {
      show();
      shop();
      return;
    }
    if (site && !busy()) {
      show();
      return;
    }
    return service.apply(this, arguments);
  };
  const spawn = spawnZombieAt;
  spawnZombieAt = function (x, y) {
    const site = sites().find((s) => s.id === "apothecary");
    if (site && Math.hypot(x - site.v.doorX, y - site.v.doorY) < 60)
      return null;
    return spawn.apply(this, arguments);
  };
  const hurt = hurtPlayer;
  hurtPlayer = function (n, x, y) {
    const site = sites().find((s) => s.id === "apothecary");
    if (site && near(site) && !mpRole) return;
    const hazard =
      tileAt(player.x, player.y) === T_WATER ||
      window.level29SouthernCombat?.turtles?.some(
        (t) => Math.hypot(t.x - x, t.y - y) < 5,
      );
    return hurt.call(this, buffs.charm > 0 && hazard ? n * 0.4 : n, x, y);
  };
  const pass = passMission;
  passMission = function () {
    const m = mission;
    if (m?.phase !== "active") return pass.apply(this, arguments);
    const id = String(m.info.i),
      elapsed = missionStart ? (frame - missionStart) / 60 : 0;
    const result = pass.apply(this, arguments);
    awardMission(saved, id, elapsed);
    save();
    return result;
  };
  const begin = beginMission;
  beginMission = function () {
    const r = begin.apply(this, arguments);
    if (mission?.phase === "active") missionStart = frame;
    return r;
  };
  const syncVM = syncViewModel;
  syncViewModel = function () {
    syncVM.apply(this, arguments);
    const host = level29Progression?.viewModel(curW) || gun;
    if (!host) return;
    const next = saved.skin + "|" + saved.outfit;
    if (host.userData.survivalSkin === next) return;
    host.userData.survivalSkin = next;
    host.traverse((o) => {
      if (!o.isMesh || !o.material?.color || o.material.transparent) return;
      if (!o.userData.skinOriginal) {
        o.userData.skinOriginal = o.material;
        o.material = o.material.clone();
        (host.userData.ownedMaterials ??= new Set()).add(o.material);
      }
      o.material.color.copy(o.userData.skinOriginal.color);
      if (o.material.name === "survivorSleeve") {
        if (saved.outfit)
          o.material.color.set(
            saved.outfit === "outfit-indigo" ? "#414c7e" : "#52735b",
          );
      } else if (saved.skin)
        o.material.color.multiply(
          new THREE.Color(saved.skin === "skin-bronze" ? "#c7a276" : "#91aa7c"),
        );
    });
  };
  const tick = update;
  update = function () {
    tick.apply(this, arguments);
    const now = performance.now(),
      dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
    last = now;
    if (state !== "play" || mpRole || !player) return;
    if (player.dead) {
      session = 0;
      alive = 0;
      if (active) leave();
      return;
    }
    session += dt;
    saved.seconds += dt;
    alive += dt;
    for (const id of ["tonic", "charm"])
      buffs[id] = Math.max(0, buffs[id] - dt);
    if (alive >= 300) {
      alive -= 300;
      saved.points++;
      save();
    }
    if (now - lastSave > 15000) {
      lastSave = now;
      save();
    }
    if (active) {
      cityGroup.visible = false;
      if (player.car) player.car = null;
      if (breach > 0) {
        breach -= dt;
        if (breach <= 0) {
          doorBreached = true;
          if (root.userData.gate) root.userData.gate.visible = false;
          toast("CELL DOOR BREACHED");
        }
      }
    }
  };
  const death = killPlayer;
  killPlayer = function () {
    save();
    if (active) leave();
    session = 0;
    alive = 0;
    return death.apply(this, arguments);
  };
  let shopProps = null;
  const build = buildCity;
  buildCity = function () {
    if (active) leave();
    level29RuntimePolicy.disposeOwned(shopProps);
    shopProps = null;
    const result = build.apply(this, arguments);
    siteOwner = null;
    const site = sites().find((s) => s.id === "apothecary");
    if (site && cityGroup && typeof addSign === "function") {
      const v = site.v;
      shopProps = new THREE.Group();
      shopProps.name = "French Quarter apothecary signs and medicines";
      cityGroup.add(shopProps);
      addSign(
        shopProps,
        "FRENCH QUARTER APOTHECARY · E · HERBS / CHARMS",
        Math.min(140, v.b?.w || 120),
        8,
        v.doorX,
        32,
        v.doorY + 3,
        "#c8d8a0",
      );
      const base = terrainHeight(v.doorX, v.doorY),
        geo = new THREE.CylinderGeometry(1.5, 2, 5, 8),
        mat = new THREE.MeshStandardMaterial({
          color: "#657c68",
          roughness: 0.65,
        });
      const bottles = new THREE.InstancedMesh(geo, mat, 12),
        dummy = new THREE.Object3D();
      for (let i = 0; i < 12; i++) {
        dummy.position.set(
          v.doorX - 22 + (i % 6) * 7,
          base + 12 + Math.floor(i / 6) * 10,
          v.doorY - 22,
        );
        dummy.updateMatrix();
        bottles.setMatrixAt(i, dummy.matrix);
      }
      shopProps.add(bottles);
      shopProps.userData.ownedGeometries = new Set();
      shopProps.userData.ownedMaterials = new Set();
      shopProps.userData.ownedTextures = new Set();
      shopProps.traverse((o) => {
        if (o.geometry) shopProps.userData.ownedGeometries.add(o.geometry);
        if (o.material) {
          shopProps.userData.ownedMaterials.add(o.material);
          if (o.material.map)
            shopProps.userData.ownedTextures.add(o.material.map);
        }
      });
    }
    return result;
  };
  const ambient = ambientSpawn;
  ambientSpawn = function () {
    if (!active) return ambient.apply(this, arguments);
  };
  const blips = extraBlips;
  extraBlips = function () {
    return blips.apply(this, arguments).concat(
      sites().map((s) => ({
        x: s.v.doorX,
        y: s.v.doorY,
        label: s.name,
        col: "#a6cda1",
      })),
    );
  };
  addEventListener("level29:bounty-complete", () => {
    saved.bounties.push("dispatch:" + Date.now() + ":" + frame);
    saved.records.bounties = saved.bounties.length;
    save();
  });
  for (const e of [
    "pointerdown",
    "pointerup",
    "click",
    "touchstart",
    "touchend",
    "wheel",
    "keydown",
    "keyup",
  ])
    modal.addEventListener(e, (x) => x.stopPropagation());
  modal.addEventListener("cancel", (e) => {
    e.preventDefault();
    close();
  });
  window.level29SurvivalExpansion = {
    show,
    close,
    get modalOpen() {
      return modal.open;
    },
    sites,
    PERKS,
    get saved() {
      return saved;
    },
    get active() {
      return active;
    },
    get buffs() {
      return buffs;
    },
    get outfit() {
      return saved.outfit;
    },
    sprintMultiplier() {
      return 1 + saved.perks.stamina * 0.06 + (buffs.tonic > 0 ? 0.12 : 0);
    },
    reloadMultiplier() {
      return 1 + saved.perks.reload * 0.1;
    },
    meleeBonus() {
      return saved.perks.melee;
    },
    noiseMultiplier() {
      return 1 - saved.perks.stealth * 0.15;
    },
  };
})();
