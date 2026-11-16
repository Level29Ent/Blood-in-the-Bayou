const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  vm = require("node:vm"),
  THREE = require("three");
const P = require("../public/game/pursuits-core.js"),
  C = require("../public/game/leisure-core.js"),
  S = require("../public/game/leisure-scenery.js"),
  N = require("../public/game/neighborhood-chain-core.js"),
  A = require("../public/game/nola-activities-core.js");
function element(tag) {
  return {
    tag,
    children: [],
    style: {},
    classList: { add() {}, remove() {}, toggle() {} },
    open: false,
    hidden: false,
    attributes: {},
    listeners: {},
    appendChild(n) {
      this.children.push(n);
      return n;
    },
    replaceChildren() {
      this.children = [];
    },
    setAttribute(k, v) {
      this.attributes[k] = v;
    },
    addEventListener(k, fn) {
      (this.listeners[k] ??= []).push(fn);
    },
    showModal() {
      this.open = true;
    },
    close() {
      this.open = false;
    },
    focus() {},
    querySelector() {
      return this.children.find((n) => n.tag === "button");
    },
  };
}
function fixture() {
  const nodes = [],
    scene = new THREE.Scene(),
    cityGroup = new THREE.Group();
  scene.add(cityGroup);
  const hospital = {
      id: "hospital",
      name: "GENERAL HOSPITAL",
      doorX: 1300,
      doorY: 1000,
      b: { x: 1200, y: 800, w: 200, h: 200 },
      mesh: new THREE.Group(),
    },
    ctx = {
      window: null,
      BayouPursuitsCore: P,
      BayouLeisureCore: C,
      BayouLeisureScenery: S,
      level29NeighborhoodCore: N,
      level29NolaActivityCore: A,
      level29Navigation: {
        graph: {
          nearest(x, y) {
            nodes.push({ x, y });
            return nodes.length - 1;
          },
          point: (i) => nodes[i],
          goal: (a, x, y) => ({ x, y }),
        },
      },
      THREE,
      scene,
      cityGroup,
      city: {
        world: true,
        width: 80,
        height: 80,
        venues: [
          { id: "business", name: "TRAVEL", doorX: 100, doorY: 100 },
          hospital,
        ],
        neighborhood: { homes: [{ x: 300, y: 300, w: 100, h: 100 }] },
        heightAt: () => 0,
        get: () => 1,
      },
      builtCity: null,
      player: {
        x: 100,
        y: 148,
        r: 8,
        hp: 100,
        maxHp: 100,
        dead: false,
        car: null,
        vx: 0,
        vy: 0,
        anim: 0,
      },
      view: { yaw: 0, pitch: 0 },
      state: "play",
      mission: { phase: "start" },
      objective: "original",
      heat: 0,
      showMap: false,
      mpRole: null,
      cash: 100000,
      keys: {},
      touch: {},
      stick: { x: 0, y: 0 },
      gp: { fire: false, brake: false },
      mouse: { down: false },
      frame: 0,
      toastQ: null,
      document: {
        body: element("body"),
        createElement: element,
        getElementById: () => null,
        exitPointerLock() {},
        addEventListener() {},
      },
      addEventListener() {},
      addSign(root) {
        const g = new THREE.Group();
        root.add(g);
        return g;
      },
      toast(t) {
        ctx.lastToast = t;
      },
      blockedCircle: () => false,
      terrainHeight: () => 0,
      serviceVenue() {},
      enterExit() {},
      fireWeapon() {},
      missionTarget: () => ({ x: 1, y: 2, label: "BASE" }),
      extraBlips: () => [],
      startGame() {},
      buildCity() {},
      beginMission() {
        ctx.begins++;
      },
      begins: 0,
      killPlayer() {
        ctx.player.dead = true;
        ctx.state = "dead";
      },
      update() {
        ctx.updates++;
        for (const c of ctx.cars)
          if (!c.dead && !c.gone) ctx.updateCar(c, c.ai?.input);
      },
      updates: 0,
      render() {
        ctx.renders++;
      },
      renders: 0,
      pollPad() {},
      moveCircle(e, dx, dy, r) {
        if (!ctx.blockedCircle(e.x + dx, e.y, r)) e.x += dx;
        if (!ctx.blockedCircle(e.x, e.y + dy, r)) e.y += dy;
      },
      kU: () => false,
      kD: () => false,
      kR: () => false,
      kL: () => false,
      snapCamera() {},
      level29Save: {
        save() {
          ctx.saves++;
        },
      },
      saves: 0,
      level29RuntimePolicy: {
        figureOwnership() {},
        disposeOwned(g) {
          g.parent?.remove(g);
        },
      },
      makeFigure: () => new THREE.Group(),
      setFigureColors() {},
      poseFigure(m, x, y) {
        m.position.set(x, 0, y);
      },
      cars: [],
      zombies: [],
      makeCar: (x, y, a, type) => ({
        x,
        y,
        a,
        type,
        v: 0,
        vs: 0,
        hp: 100,
        maxHp: 100,
        r: 20,
        spec: { len: 50, wid: 22 },
        dead: false,
      }),
      updateCar(c, input) {
        ctx.carUpdates++;
        if (input?.thr) {
          c.x += Math.cos(c.a) * 0.2;
          c.y += Math.sin(c.a) * 0.2;
        }
      },
      carUpdates: 0,
      level29TrafficClearance: { clear: () => true, sweep: () => true },
      tileAt: () => 1,
      level29UFO: { eligible: () => true },
      spawnZombieAt(x, y, type) {
        const z = { x, y, type, alive: true };
        ctx.zombies.push(z);
        return z;
      },
      randomRoadPoint: (x, y) => ({ x: x + 120, y: y + 32 }),
      level29CampaignMap: { points: () => [{ x: 700, y: 1048 }] },
      level29TimeOfDay: {
        hour: 12,
        setHour(h) {
          this.hour = h;
        },
      },
      camera: new THREE.PerspectiveCamera(70, 1.6, 0.1, 2000),
      SW: 1280,
      SH: 800,
      DPR: 1,
      syncViewport() {},
      applyLightMode() {},
      viewTick() {},
      project: () => null,
      cx: {
        setTransform() {},
        clearRect() {},
        save() {},
        restore() {},
        fillRect() {},
        fillText() {},
      },
      renderer: {
        info: { reset() {} },
        clear() {},
        render() {},
        domElement: {
          toBlob(fn) {
            fn({ type: "image/png" });
          },
        },
      },
      URL: { createObjectURL: () => "blob:photo", revokeObjectURL() {} },
      performance: { now: () => 100 },
    };
  ctx.window = ctx;
  ctx.builtCity = ctx.city;
  vm.createContext(ctx);
  for (const f of ["leisure-runtime.js", "pursuits-runtime.js"])
    vm.runInContext(fs.readFileSync("public/game/" + f, "utf8"), ctx);
  ctx.update();
  return ctx;
}
function panel(c, id) {
  return c.document.body.children.find((n) => n.id === id);
}
function click(c, id, label) {
  const root = panel(c, id),
    all = [];
  function walk(n) {
    for (const x of n.children) {
      all.push(x);
      walk(x);
    }
  }
  walk(root);
  const b = all.find((n) => n.tag === "button" && n.textContent === label);
  assert(b, label);
  b.onclick();
}
const pos = (c, p) => {
  c.player.x = 24000 + p.x;
  c.player.y = 26000 + p.y;
};
function load(c, file) {
  vm.runInContext(fs.readFileSync("public/game/" + file, "utf8"), c);
}
test("actual business board enforces deed/counter, charges upgrades, shows physical displays and persists snapshot", () => {
  const c = fixture();
  c.level29Leisure.enter();
  pos(c, C.SERVICES.golf);
  c.level29Leisure.restore({ v: 1, owned: ["golf"] });
  c.level29Pursuits.show();
  click(c, "pursuitsBoard", "Clubhouse workshop · $4000");
  assert.equal(c.cash, 96000);
  assert.equal(c.level29Pursuits.data.upgrades.golf, 1);
  assert(c.saves);
  assert(
    c.level29Leisure.world.root.getObjectByName(
      "Optional enterprises · owned progression props",
    ),
  );
  const copy = JSON.parse(JSON.stringify(c.level29Pursuits.snapshot));
  c.level29Pursuits.restore(copy);
  assert.equal(c.level29Pursuits.data.upgrades.golf, 1);
});
test("real garden flow rejects remote planting, grows only during active grounds play, then pays the selected buyer", () => {
  const c = fixture();
  c.level29Leisure.enter();
  c.level29Pursuits.openGarden();
  click(c, "pursuitsBoard", "PLANT OKRA · $15 · 60s · PLOT 1");
  assert.equal(c.cash, 100000);
  click(c, "pursuitsBoard", "CLOSE / RESUME");
  pos(c, { x: 1400, y: 200 });
  c.level29Pursuits.openGarden();
  click(c, "pursuitsBoard", "PLANT OKRA · $15 · 60s · PLOT 1");
  assert.equal(c.cash, 99985);
  click(c, "pursuitsBoard", "WATER PLOT 1");
  for (let i = 0; i < 120; i++) c.update();
  assert.equal(c.level29Pursuits.data.plots[0].age, 0);
  click(c, "pursuitsBoard", "CLOSE / RESUME");
  for (let i = 0; i < 3601; i++) c.update();
  assert.equal(c.level29Pursuits.data.plots[0].age, 60);
  c.level29Pursuits.openGarden();
  click(c, "pursuitsBoard", "HARVEST PLOT 1");
  assert.equal(c.level29Pursuits.data.inventory.okra, 3);
  click(c, "pursuitsBoard", "CLOSE / RESUME");
  pos(c, C.SERVICES.golf);
  c.level29Pursuits.openGarden();
  click(c, "pursuitsBoard", "SELL OKRA AT CLUBHOUSE");
  assert.equal(c.cash, 100093);
  assert.equal(c.level29Pursuits.data.inventory.okra, 0);
});
test("real repeatable business contract suspends normal bookings, requires three held stops and pays once", () => {
  const c = fixture();
  c.level29Leisure.enter();
  c.level29Leisure.restore({ v: 1, owned: ["golf"] });
  pos(c, C.SERVICES.golf);
  c.level29Pursuits.show();
  click(c, "pursuitsBoard", "ACCEPT GOLF SERVICE CONTRACT · 3 STOPS / $600");
  assert(c.level29Pursuits.busy);
  c.level29Leisure.start("golf");
  assert(!c.level29Leisure.session);
  for (const p of P.CONTRACTS.golf) {
    pos(c, p);
    c.keys.u = true;
    for (let i = 0; i < 121; i++) c.update();
  }
  assert.equal(c.cash, 100600);
  assert.equal(c.level29Pursuits.data.contracts.golf, 1);
  assert(!c.level29Pursuits.busy);
  for (let i = 0; i < 10; i++) c.update();
  assert.equal(c.cash, 100600);
});
test("rental hooks save a clean ghost, apply upgrade pay and add tournament prize only once", () => {
  const c = fixture();
  c.level29Leisure.enter();
  pos(c, C.SERVICES.kart);
  c.level29Pursuits.data.upgrades.kart = 1;
  c.level29Pursuits.show();
  click(c, "pursuitsBoard", "RACING");
  click(c, "pursuitsBoard", "ENABLE TWO AI RIVALS FOR NEXT RENTAL");
  click(c, "pursuitsBoard", "CLOSE / RESUME");
  c.level29Leisure.start("kart");
  c.update();
  const r = c.level29Leisure.session.game;
  r.seconds = 70;
  r.gates = 47;
  r.next = 0;
  r.index = 159;
  r.x = C.TRACK[0].x;
  r.y = C.TRACK[0].y;
  r.h = C.TRACK[0].h;
  r.angle = Math.atan2(
    C.TRACK[0].y - C.TRACK[159].y,
    C.TRACK[0].x - C.TRACK[159].x,
  );
  r.speed = 10;
  c.update();
  assert(!c.level29Leisure.session);
  assert.equal(c.cash, 100845);
  assert.equal(c.level29Pursuits.data.tournaments, 1);
  assert(c.level29Pursuits.data.ghost.length >= 2);
  c.update();
  assert.equal(c.cash, 100845);
});
test("estate journal requires real proximity and discovers each clue once with no cash faucet", () => {
  const c = fixture();
  c.level29Leisure.enter();
  pos(c, P.CLUES[0]);
  c.level29Pursuits.show();
  click(c, "pursuitsBoard", "JOURNAL");
  click(c, "pursuitsBoard", "READ Sam’s shipping ledger");
  assert.deepEqual(Array.from(c.level29Pursuits.data.clues), ["manifest"]);
  assert.equal(c.cash, 100000);
  const text = panel(c, "pursuitsBoard")
    .children.map((n) => n.textContent || "")
    .join(" ");
  assert(text.includes("Sam:"));
  click(c, "pursuitsBoard", "CLOSE / RESUME");
  c.level29Leisure.leave();
  assert.equal(c.level29Pursuits.snapshot.clues.length, 1);
});
test("flood operation uses an actual resident, requires nearby escort at delivery and grants first clear only once", () => {
  const c = fixture();
  load(c, "survival-operations.js");
  c.level29Operations.show();
  click(c, "survivalOperations", "FLOODED PORCH · RESCUE · FIRST-CLEAR REWARD");
  assert(c.level29Operations.active);
  const pickup = c.missionTarget();
  c.player.x = pickup.x;
  c.player.y = pickup.y;
  c.keys.u = true;
  for (let i = 0; i < 241; i++) c.update();
  assert.equal(c.level29Operations.active.stage, 1);
  assert(c.level29Operations.active.walker);
  const destination = c.missionTarget();
  c.player.x = destination.x;
  c.player.y = destination.y;
  for (let i = 0; i < 130; i++) c.update();
  assert(c.level29Operations.active);
  const a = c.level29Operations.active.walker;
  a.x = destination.x;
  a.y = destination.y;
  for (let i = 0; i < 121; i++) c.update();
  assert(!c.level29Operations.active);
  assert.equal(c.cash, 101500);
  assert.deepEqual(Array.from(c.level29Pursuits.data.operations), ["flood"]);
});
test("blackout temporarily owns material clones and night presentation, then restores both on cancel", () => {
  const c = fixture(),
    m = new THREE.MeshStandardMaterial({
      color: "#777777",
      emissive: "#112233",
    }),
    mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), m);
  c.city.venues[1].mesh.add(mesh);
  load(c, "survival-operations.js");
  c.level29Operations.show();
  click(c, "survivalOperations", "HOSPITAL BLACKOUT · FIRST-CLEAR REWARD");
  assert(c.level29Operations.active);
  c.update();
  assert.equal(c.level29TimeOfDay.hour, 22);
  assert.notEqual(mesh.material, m);
  assert.equal(mesh.material.emissive.getHex(), 0);
  c.level29Operations.cancel();
  assert.equal(mesh.material, m);
  assert.equal(c.level29TimeOfDay.hour, 12);
  assert.equal(c.cash, 100000);
});
test("night convoy creates an actual quest van, uses updateCar and cannot pay before arrival or when destroyed", () => {
  const c = fixture();
  load(c, "survival-operations.js");
  c.level29Operations.show();
  click(c, "survivalOperations", "NIGHT RELIEF CONVOY · FIRST-CLEAR REWARD");
  assert(c.level29Operations.active);
  const p = c.missionTarget();
  c.player.x = p.x;
  c.player.y = p.y;
  c.update();
  assert.equal(c.cars.length, 1);
  assert(c.cars[0].pursuitsConvoy);
  const car = c.cars[0],
    old = { x: car.x, y: car.y };
  c.update();
  assert(c.carUpdates > 0);
  assert(Math.hypot(car.x - old.x, car.y - old.y) < 1);
  assert.equal(c.cash, 100000);
  car.hp = 0;
  c.update();
  assert(!c.level29Operations.active);
  assert.equal(c.cash, 100000);
  assert.equal(c.level29TimeOfDay.hour, 12);
});
test("photo mode freezes simulation, renders a separate bounded camera, captures locally and restores play", () => {
  const c = fixture();
  load(c, "photo-mode.js");
  assert(c.level29Photo.canOpen());
  const old = c.updates;
  c.level29Photo.open();
  assert(c.level29Photo.active);
  c.update();
  assert.equal(c.updates, old);
  assert.equal(c.state, "pause");
  let renderedCamera;
  c.renderer.render = (scene, camera) => {
    renderedCamera = camera;
  };
  c.render();
  assert.notEqual(renderedCamera, c.camera);
  assert(
    renderedCamera.position.distanceTo(
      new THREE.Vector3(c.player.x, 12, c.player.y),
    ) <= 160,
  );
  click(c, "photoControls", "CAPTURE PNG");
  c.render();
  const link = panel(c, "photoControls").children.find((n) => n.tag === "a");
  assert.equal(link.href, "blob:photo");
  assert.equal(link.hidden, false);
  c.level29Photo.toggleControls();
  assert(panel(c, "photoControls").hidden);
  c.level29Photo.close();
  assert(!c.level29Photo.active);
  assert.equal(c.state, "play");
  c.update();
  assert(c.updates > old);
});
test("photo mode refuses multiplayer, prologue, paid rentals and active jobs; new game resets optional progress", () => {
  const c = fixture();
  load(c, "photo-mode.js");
  c.mpRole = "host";
  assert(!c.level29Photo.canOpen());
  c.mpRole = null;
  c.level29Prologue = { active: true };
  assert(!c.level29Photo.canOpen());
  c.level29Prologue.active = false;
  c.level29Jobs = { active: {} };
  assert(!c.level29Photo.canOpen());
  c.level29Jobs.active = null;
  c.level29Pursuits.data.inventory.okra = 3;
  c.startGame();
  assert.equal(c.level29Pursuits.data.inventory.okra, 0);
  const save = fs.readFileSync("public/game/savegame.js", "utf8");
  assert(save.includes("pursuits:window.level29Pursuits?.snapshot||null"));
  assert(save.includes("window.level29Pursuits?.restore(s.pursuits)"));
});

test("blackout requires all three real targets and restores private materials after first-clear payment", () => {
  const c = fixture(),
    m = new THREE.MeshStandardMaterial({ emissive: "#223344" }),
    mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), m);
  c.city.venues[1].mesh.add(mesh);
  load(c, "survival-operations.js");
  c.level29Operations.show();
  click(c, "survivalOperations", "HOSPITAL BLACKOUT · FIRST-CLEAR REWARD");
  for (let stage = 0; stage < 3; stage++) {
    const p = c.missionTarget();
    c.player.x = p.x;
    c.player.y = p.y;
    c.keys.u = true;
    for (let i = 0; i < 121; i++) c.update();
  }
  assert(!c.level29Operations.active);
  assert.equal(c.cash, 101800);
  assert.equal(mesh.material, m);
  assert.equal(c.level29TimeOfDay.hour, 12);
  c.level29Operations.show();
  click(c, "survivalOperations", "HOSPITAL BLACKOUT · PRACTICE");
  for (let stage = 0; stage < 3; stage++) {
    const p = c.missionTarget();
    c.player.x = p.x;
    c.player.y = p.y;
    c.keys.u = true;
    for (let i = 0; i < 121; i++) c.update();
  }
  assert.equal(c.cash, 101800);
});
test("arrived living convoy grants payment once and cleanup removes only the quest van", () => {
  const c = fixture();
  load(c, "survival-operations.js");
  c.level29Operations.show();
  click(c, "survivalOperations", "NIGHT RELIEF CONVOY · FIRST-CLEAR REWARD");
  let p = c.missionTarget();
  c.player.x = p.x;
  c.player.y = p.y;
  c.update();
  const car = c.cars[0];
  c.level29Operations.active.pathIndex = 10000;
  c.update();
  assert(c.level29Operations.active, "route index alone is not arrival");
  car.x = 1300;
  car.y = 1048;
  c.player.x = 1300;
  c.player.y = 1048;
  c.update();
  assert(!c.level29Operations.active);
  assert.equal(c.cash, 102200);
  assert(car.gone);
  assert.equal(c.level29TimeOfDay.hour, 12);
  c.update();
  assert.equal(c.cash, 102200);
});
test("actual service use at the final contract counter does not open an unrelated business panel mid-hold", () => {
  const c = fixture();
  c.level29Leisure.enter();
  c.level29Leisure.restore({ v: 1, owned: ["golf"] });
  pos(c, C.SERVICES.golf);
  c.level29Pursuits.show();
  click(c, "pursuitsBoard", "ACCEPT GOLF SERVICE CONTRACT · 3 STOPS / $600");
  for (const p of P.CONTRACTS.golf) {
    pos(c, p);
    c.serviceVenue();
    assert.equal(c.state, "play");
    c.keys.u = true;
    for (let i = 0; i < 121; i++) c.update();
  }
  assert.equal(c.cash, 100600);
});
test("bounded rival and garden props retire owned resources without disposing original scenery", () => {
  const c = fixture();
  c.level29Leisure.enter();
  c.level29Pursuits.data.plots[0] = { crop: "okra", watered: true, age: 60 };
  c.render();
  const root = c.level29Leisure.world.root.getObjectByName(
    "Optional enterprises · owned progression props",
  );
  assert(root);
  let disposals = 0;
  const geos = new Set(),
    mats = new Set();
  root.traverse((o) => {
    if (o.geometry) geos.add(o.geometry);
    if (o.material) mats.add(o.material);
  });
  for (const x of [...geos, ...mats])
    x.addEventListener("dispose", () => disposals++);
  c.level29Leisure.leave();
  assert.equal(disposals, geos.size + mats.size);
});
test("photo controls restore on touch and failed PNG capture offers a useful fallback", () => {
  const c = fixture();
  load(c, "photo-mode.js");
  c.level29Photo.open();
  click(c, "photoControls", "HIDE CONTROLS · H TO RESTORE");
  assert(panel(c, "photoControls").hidden);
  assert.equal(panel(c, "photoRestore").hidden, false);
  panel(c, "photoRestore").onclick();
  assert.equal(panel(c, "photoControls").hidden, false);
  c.renderer.domElement.toBlob = (fn) => fn(null);
  click(c, "photoControls", "CAPTURE PNG");
  c.render();
  const board = panel(c, "photoControls");
  assert(
    board.children.some((n) => n.textContent?.includes("device screenshot")),
  );
  assert.equal(
    board.children.find((n) => n.textContent === "CAPTURE PNG").disabled,
    false,
  );
  c.level29Photo.close();
  assert.equal(panel(c, "photoRestore").hidden, true);
});

test("optional systems survive campaign bundle validation without storing account state", () => {
  const C = require("../public/game/bayou-polish-core.js"),
    d = P.fresh();
  d.upgrades.golf = 2;
  d.plots[1] = { crop: "corn", watered: true, age: 20 };
  d.clues = ["lab"];
  d.ghost = [
    [0, 1300, 1000, 0, 0],
    [1, 1310, 1010, 1, 0.1],
  ];
  const campaign = { v: 2, missionIdx: 1, cash: 1000, pursuits: d },
    bundle = C.bundle({ [C.KEY]: JSON.stringify(campaign) });
  const restored = P.fresh(JSON.parse(bundle[C.KEY]).pursuits);
  assert.deepEqual(restored, d);
  assert(!Object.keys(bundle).some((k) => k.includes("auth")));
});
test("unsafe survival routes refuse dispatch and campaign mission starts are blocked during an accepted operation", () => {
  const c = fixture();
  load(c, "survival-operations.js");
  c.city.venues = c.city.venues.filter((v) => v.id !== "hospital");
  c.level29Operations.show();
  click(c, "survivalOperations", "FLOODED PORCH · RESCUE · FIRST-CLEAR REWARD");
  assert(!c.level29Operations.active);
  assert.equal(c.cash, 100000);
  const d = fixture();
  load(d, "survival-operations.js");
  d.level29Operations.show();
  click(d, "survivalOperations", "FLOODED PORCH · RESCUE · FIRST-CLEAR REWARD");
  d.beginMission();
  assert.equal(d.begins, 0);
  d.killPlayer();
  assert(!d.level29Operations.active);
});
test("early photo input routes Escape/H before city/grounds shortcuts while leaving photo controls accessible", () => {
  const listeners = {},
    c = {
      window: null,
      state: "pause",
      document: { querySelector: () => null, querySelectorAll: () => [] },
      localStorage: { getItem: () => null },
      addEventListener: (n, fn) => {
        listeners[n] = fn;
      },
      level29Photo: {
        active: true,
        close() {
          c.closed++;
        },
        toggleControls() {
          c.toggled++;
        },
      },
      closed: 0,
      toggled: 0,
    };
  c.window = c;
  vm.createContext(c);
  vm.runInContext(fs.readFileSync("public/game/input-bindings.js", "utf8"), c);
  const event = (key) => ({
    type: "keydown",
    key,
    repeat: false,
    target: { closest: () => false },
    preventDefault() {},
    stopImmediatePropagation() {
      this.stopped = true;
    },
  });
  const h = event("h");
  listeners.keydown(h);
  assert.equal(c.toggled, 1);
  assert(h.stopped);
  listeners.keydown(event("Escape"));
  assert.equal(c.closed, 1);
  const control = event("Enter");
  control.target.closest = (selector) => selector.includes("photoControls");
  listeners.keydown(control);
  assert(!control.stopped);
  const focusedEscape = event("Escape");
  focusedEscape.target.closest = () => true;
  c.level29Leisure = {
    active: true,
    show() {
      throw Error("must not open grounds behind photo mode");
    },
  };
  listeners.keydown(focusedEscape);
  assert.equal(c.closed, 2);
  assert(focusedEscape.stopped);
});

test("solo dispatch cannot pause a multiplayer host and stale photo encodes cannot enter a new session", () => {
  const c = fixture();
  load(c, "survival-operations.js");
  c.mpRole = "host";
  c.level29Operations.show();
  assert.equal(c.state, "play");
  assert.equal(panel(c, "survivalOperations").open, false);
  c.mpRole = null;
  load(c, "photo-mode.js");
  let callback;
  c.renderer.domElement.toBlob = (fn) => {
    callback = fn;
  };
  c.level29Photo.open();
  click(c, "photoControls", "CAPTURE PNG");
  c.render();
  c.level29Photo.close();
  c.level29Photo.open();
  callback({});
  assert.equal(
    panel(c, "photoControls").children.find((n) => n.tag === "a").hidden,
    true,
  );
  c.level29Photo.close();
});
