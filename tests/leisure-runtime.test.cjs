const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  vm = require("node:vm"),
  THREE = require("three");
const C = require("../public/game/leisure-core.js"),
  S = require("../public/game/leisure-scenery.js"),
  N = require("../public/game/neighborhood-chain-core.js");
function node(tag) {
  return {
    tag,
    children: [],
    style: {},
    classList: { add() {}, remove() {}, toggle() {} },
    open: false,
    hidden: false,
    value: "",
    appendChild(n) {
      this.children.push(n);
      return n;
    },
    replaceChildren() {
      this.children = [];
    },
    setAttribute() {},
    addEventListener() {},
    showModal() {
      this.open = true;
    },
    close() {
      this.open = false;
    },
    focus() {},
    querySelector() {
      return null;
    },
  };
}
function fixture() {
  const nodes = [],
    scene = new THREE.Scene(),
    cityGroup = new THREE.Group();
  scene.add(cityGroup);
  const ctx = {
    window: null,
    BayouLeisureCore: C,
    BayouLeisureScenery: S,
    level29NeighborhoodCore: N,
    level29Navigation: {
      graph: {
        nearest(x, y) {
          nodes.push({ x, y });
          return nodes.length - 1;
        },
        point: (i) => nodes[i],
      },
    },
    THREE,
    city: {
      world: true,
      venues: [
        { id: "business", name: "TRAVEL OFFICE", doorX: 100, doorY: 100 },
      ],
      heightAt: () => 0,
    },
    cityGroup,
    scene,
    builtCity: null,
    player: {
      x: 100,
      y: 148,
      r: 8,
      dead: false,
      car: null,
      vx: 0,
      vy: 0,
      anim: 0,
    },
    view: { yaw: 0.2, pitch: 0 },
    state: "play",
    objective: "original",
    heat: 2,
    showMap: false,
    mission: { phase: "start" },
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
      body: node("body"),
      createElement: node,
      getElementById: () => null,
      exitPointerLock() {},
      addEventListener() {},
    },
    addEventListener() {},
    addSign(root) {
      const sign = new THREE.Group();
      root.add(sign);
      return sign;
    },
    toast(t) {
      ctx.lastToast = t;
    },
    blockedCircle: () => false,
    terrainHeight: () => 0,
    serviceVenue() {
      ctx.oldServices++;
    },
    oldServices: 0,
    enterExit() {},
    fireWeapon() {
      ctx.shots++;
    },
    shots: 0,
    missionTarget: () => ({ x: 1, y: 2, label: "OLD" }),
    extraBlips: () => [],
    startGame() {
      ctx.newGames++;
    },
    newGames: 0,
    buildCity() {
      ctx.builds++;
    },
    builds: 0,
    update() {
      ctx.cityUpdates++;
    },
    cityUpdates: 0,
    render() {
      ctx.cityRenders++;
    },
    cityRenders: 0,
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
  };
  ctx.window = ctx;
  ctx.builtCity = ctx.city;
  vm.createContext(ctx);
  vm.runInContext(
    fs.readFileSync("public/game/leisure-runtime.js", "utf8"),
    ctx,
  );
  ctx.update();
  return ctx;
}
const pos = (c, p) => {
  c.player.x = 24000 + p.x;
  c.player.y = 26000 + p.y;
};
function click(c, label) {
  const dialog = c.document.body.children.find((x) => x.tag === "dialog"),
    button = dialog.children.find((x) => x.textContent === label);
  assert(button, label);
  button.onclick();
}
test("actual shuttle requires proximity, on-foot and no active mission before allocating the new district", () => {
  const c = fixture();
  assert(c.level29Leisure.shuttle);
  c.player.x += 200;
  assert(!c.level29Leisure.enter());
  assert.equal(c.scene.children.length, 1);
  c.player.x = 100;
  c.player.car = {};
  assert(!c.level29Leisure.enter());
  c.player.car = null;
  c.mission.phase = "active";
  assert(!c.level29Leisure.enter());
  c.mission.phase = "done";
  assert(!c.level29Leisure.enter());
  c.mission.phase = "failed";
  assert(!c.level29Leisure.enter());
  c.mission.phase = "start";
  assert(c.level29Leisure.enter());
  assert(c.level29Leisure.active);
  assert.equal(c.player.x, 24850);
  assert.equal(c.cityGroup.visible, false);
  assert.equal(c.city.venues.length, 1);
  assert.equal(c.level29Leisure.stats.levels, 2);
});
test("annex update isolates city timers/combat and return restores exact scene visibility and location", () => {
  const c = fixture(),
    old = { x: c.player.x, y: c.player.y };
  const special = new THREE.Group();
  special.visible = false;
  c.scene.add(special);
  c.level29Leisure.enter();
  const updates = c.cityUpdates;
  for (let i = 0; i < 10; i++) c.update();
  assert.equal(c.cityUpdates, updates);
  c.fireWeapon();
  assert.equal(c.shots, 0);
  assert.equal(c.heat, 0);
  let released = 0;
  const root = c.scene.children.find((o) => o.name.includes("Cypress Leisure"));
  const geos = new Set(),
    mats = new Set();
  root.traverse((o) => {
    if (o.geometry) geos.add(o.geometry);
    if (o.material) mats.add(o.material);
  });
  for (const x of [...geos, ...mats])
    x.addEventListener("dispose", () => released++);
  c.level29Leisure.leave();
  assert(!c.level29Leisure.active);
  assert.equal(c.player.x, old.x);
  assert.equal(c.player.y, old.y);
  assert.equal(c.cityGroup.visible, true);
  assert.equal(special.visible, false);
  assert.equal(c.objective, "original");
  assert.equal(c.heat, 2);
  assert.equal(released, geos.size + mats.size);
  c.update();
  assert.equal(c.cityUpdates, updates + 1);
});
test("real farm business buys once at its counter, harvests six plots with held input and rewards once only at market", () => {
  const c = fixture();
  c.level29Leisure.enter();
  pos(c, C.SERVICES.farm);
  c.level29Leisure.show();
  click(c, "BUY FARM BUSINESS · $24000");
  assert.equal(c.cash, 76000);
  click(c, "CLOSE / RESUME");
  c.level29Leisure.start("farm");
  assert(c.level29Leisure.session);
  // Calling USE is not a latched hold and cannot gather by itself.
  for (const p of C.PLOTS) {
    pos(c, { x: p.x + 20, y: p.y + 20 });
    c.level29Leisure.use();
    for (let i = 0; i < 200; i++) c.update();
    assert.equal(c.level29Leisure.session.game.claimed.length, 0);
    break;
  }
  c.keys.u = true;
  for (const p of C.PLOTS) {
    pos(c, { x: p.x + 20, y: p.y + 20 });
    for (let i = 0; i < 182; i++) c.update();
  }
  assert(c.level29Leisure.session.game.delivering);
  assert.equal(c.cash, 76000);
  pos(c, C.SERVICES.farm);
  c.level29Leisure.use();
  assert.equal(c.cash, 76540);
  assert.equal(c.level29Leisure.snapshot.harvests, 1);
  assert(!c.level29Leisure.session);
  c.level29Leisure.use();
  assert.equal(c.cash, 76540);
  assert(c.saves >= 2);
});
test("rental fees require service proximity and cancellation safely returns an on-track driver to the counter", () => {
  const c = fixture();
  c.level29Leisure.enter();
  const before = c.cash;
  c.level29Leisure.start("kart");
  assert.equal(c.cash, before);
  assert(!c.level29Leisure.session);
  pos(c, C.SERVICES.kart);
  c.level29Leisure.start("kart");
  assert.equal(c.cash, before - 100);
  c.update();
  assert(c.player.y > 26800);
  c.level29Leisure.show();
  click(c, "CANCEL ACTIVITY · NO REFUND");
  assert(!c.level29Leisure.session);
  assert.equal(c.player.x, 24000 + C.SERVICES.kart.x);
  assert.equal(c.player.y, 26000 + C.SERVICES.kart.y);
  assert.equal(c.cash, before - 100);
});
test("leaving/rebuilding/new game cannot strand a visitor; checkpoint restore retains deeds and records only", () => {
  const c = fixture();
  c.level29Leisure.restore({ v: 1, owned: ["kart"], bestKart: 123.4 });
  c.level29Leisure.enter();
  c.buildCity();
  assert(!c.level29Leisure.active);
  assert.equal(c.builds, 1);
  assert.deepEqual(
    JSON.parse(JSON.stringify(c.level29Leisure.snapshot.owned)),
    ["kart"],
  );
  const save = JSON.parse(JSON.stringify(c.level29Leisure.snapshot));
  c.startGame();
  assert.equal(c.level29Leisure.snapshot.owned.length, 0);
  c.level29Leisure.restore(save);
  assert.equal(c.level29Leisure.snapshot.bestKart, 123.4);
  assert(!c.level29Leisure.session);
  const source = fs.readFileSync("public/game/savegame.js", "utf8");
  assert(source.includes("leisure:window.level29Leisure?.snapshot||null"));
  assert(source.includes("window.level29Leisure?.restore(s.leisure)"));
});
test("launcher loads new modules once in dependency order without changing the legacy city generation", () => {
  const html = fs.readFileSync("public/game/index.html", "utf8");
  for (const file of [
    "leisure-core.js",
    "leisure-scenery.js",
    "leisure-runtime.js",
  ])
    assert.equal(html.split('src="' + file).length - 1, 1);
  assert(html.indexOf("leisure-core.js") < html.indexOf("leisure-scenery.js"));
  assert(
    html.indexOf("leisure-scenery.js") < html.indexOf("leisure-runtime.js"),
  );
  assert(
    !fs
      .readFileSync("public/game/leisure-runtime.js", "utf8")
      .includes("genCity ="),
  );
});

test("touch pause still exposes GROUNDS / BUSINESSES and the isolated renderer uses finite player-relative cameras", () => {
  const c = fixture();
  c.level29Leisure.enter();
  c.state = "pause";
  c.update();
  const controls = c.document.body.children.find(
    (n) => n.id === "leisureControls",
  );
  assert.equal(controls.hidden, false);
  const menu = controls.children.find(
    (n) => n.textContent === "GROUNDS / BUSINESSES",
  );
  assert.equal(menu.hidden, false);
  menu.onclick();
  assert(c.document.body.children.find((n) => n.tag === "dialog").open);
  click(c, "CLOSE / RESUME");
  assert.equal(c.state, "play");
  c.camera = new THREE.PerspectiveCamera(70, 1.6, 0.1, 2000);
  c.renderer = {
    info: { reset() {} },
    clear() {},
    render(scene, camera) {
      c.drawn = scene;
      c.cameraUsed = camera;
    },
  };
  c.syncViewport = () => {};
  c.applyLightMode = () => {};
  c.viewTick = () => {};
  c.DPR = 1;
  c.SW = 1280;
  c.SH = 800;
  c.cx = {
    setTransform() {},
    clearRect() {},
    save() {},
    restore() {},
    fillRect() {},
    fillText() {},
  };
  c.project = () => null;
  c.render();
  assert.equal(c.drawn, c.scene);
  assert.equal(c.cityRenders, 0);
  assert.equal(c.camera.position.x, c.player.x);
  assert.equal(c.camera.position.z, c.player.y);
  assert.equal(c.camera.position.y, 18);
  assert(c.camera.matrixWorld.elements.every(Number.isFinite));
});

test("actual golf completion records score and pays once after all three holes, not on booking", () => {
  const c = fixture();
  c.level29Leisure.enter();
  pos(c, C.SERVICES.golf);
  const controls = c.document.body.children.find(
      (n) => n.id === "leisureControls",
    ),
    shot = controls.children.find((n) => n.id === "leisureGolfControls"),
    power = shot.children[1].children[0];
  power.value = "100";
  c.level29Leisure.start("golf");
  assert.equal(power.value, "60");
  assert.equal(c.cash, 99950);
  for (let i = 0; i < 3; i++) {
    const g = c.level29Leisure.session.game,
      cup = C.HOLES[i].cup;
    g.ball = { x: cup.x - 2, y: cup.y, vx: 10, vy: 0 };
    g.moving = true;
    g.strokes = 1;
    c.update();
  }
  assert(!c.level29Leisure.session);
  assert.equal(c.cash, 100550);
  assert.equal(c.level29Leisure.snapshot.bestGolf, 3);
  assert.equal(c.level29Leisure.snapshot.golfRounds, 1);
  c.update();
  assert.equal(c.cash, 100550);
});

test("actual kart final gate pays once and moves rider off the fenced circuit; timeout pays nothing", () => {
  const c = fixture();
  c.level29Leisure.enter();
  pos(c, C.SERVICES.kart);
  c.level29Leisure.start("kart");
  const r = c.level29Leisure.session.game,
    gate = C.TRACK[0],
    before = C.TRACK[159];
  r.index = 159;
  r.next = 0;
  r.gates = 47;
  r.x = gate.x;
  r.y = gate.y;
  r.h = gate.h;
  r.angle = Math.atan2(gate.y - before.y, gate.x - before.x);
  r.speed = 10;
  r.seconds = 80;
  c.update();
  assert(!c.level29Leisure.session);
  assert.equal(c.cash, 100500);
  assert.equal(c.player.x, 24000 + C.SERVICES.kart.x);
  assert.equal(c.level29Leisure.snapshot.kartRaces, 1);
  assert(c.level29Leisure.snapshot.bestKart > 80);
  const d = fixture();
  d.level29Leisure.enter();
  pos(d, C.SERVICES.kart);
  d.level29Leisure.start("kart");
  d.level29Leisure.session.game.seconds = 300;
  d.update();
  assert(!d.level29Leisure.session);
  assert.equal(d.cash, 99900);
  assert.equal(d.level29Leisure.snapshot.kartRaces, 0);
});

test("early binding adapter blocks city dispatch/weapon shortcuts in the grounds but keeps movement, interaction, audio and native dialog focus", () => {
  const listeners = {},
    c = {
      window: null,
      document: { querySelector: () => null, querySelectorAll: () => [] },
      state: "play",
      localStorage: { getItem: () => null },
      addEventListener: (name, fn) => {
        listeners[name] = fn;
      },
      KeyboardEvent: class {
        constructor(type, options) {
          this.type = type;
          Object.assign(this, options);
        }
      },
      dispatchEvent() {},
      level29Leisure: {
        active: true,
        show() {
          c.opened++;
        },
      },
      opened: 0,
    };
  c.window = c;
  vm.createContext(c);
  vm.runInContext(fs.readFileSync("public/game/input-bindings.js", "utf8"), c);
  const event = (key) => ({
    type: "keydown",
    key,
    code: "Key" + key,
    repeat: false,
    target: { closest: () => false },
    preventDefault() {
      this.prevented = true;
    },
    stopImmediatePropagation() {
      this.stopped = true;
    },
  });
  for (const key of ["F6", "F7", "q", "t", "1", "b"]) {
    const e = event(key);
    listeners.keydown(e);
    assert(e.stopped, key);
  }
  for (const key of ["m", "n", "shift", "u"]) {
    const e = event(key);
    listeners.keydown(e);
    assert(!e.stopped, key);
  }
  const focusedButton = event("F6");
  focusedButton.target.closest = (selector) => selector.includes("button");
  listeners.keydown(focusedButton);
  assert(focusedButton.stopped);
  const pause = event("p");
  listeners.keydown(pause);
  assert.equal(c.opened, 1);
  assert(pause.stopped);
  const dialog = event("Tab");
  dialog.target.closest = () => true;
  listeners.keydown(dialog);
  assert(!dialog.stopped);
});

test("annex daylight restores the existing city background, fog and light intensities on return", () => {
  const c = fixture();
  c.scene.background = new THREE.Color("#112233");
  c.scene.fog = new THREE.Fog("#112233", 80, 600);
  c.hemi = { intensity: 0.2 };
  c.sun = { intensity: 0.15, color: new THREE.Color("#778899") };
  const background = c.scene.background,
    oldColor = c.sun.color.getHex();
  c.level29Leisure.enter();
  c.camera = new THREE.PerspectiveCamera();
  c.renderer = { info: { reset() {} }, clear() {}, render() {} };
  c.syncViewport = () => {};
  c.applyLightMode = () => {};
  c.viewTick = () => {};
  c.DPR = 1;
  c.SW = 1280;
  c.SH = 800;
  c.cx = {
    setTransform() {},
    clearRect() {},
    save() {},
    restore() {},
    fillRect() {},
    fillText() {},
  };
  c.project = () => null;
  c.render();
  assert.equal(c.hemi.intensity, 0.9);
  assert.equal(c.scene.fog.far, 2000);
  c.level29Leisure.leave();
  assert.equal(c.scene.background, background);
  assert.equal(c.scene.fog.far, 600);
  assert.equal(c.scene.fog.near, 80);
  assert.equal(c.hemi.intensity, 0.2);
  assert.equal(c.sun.intensity, 0.15);
  assert.equal(c.sun.color.getHex(), oldColor);
});

test("an open grounds dialog freezes gamepad resume and unknown booking IDs cannot charge cash", () => {
  const c = fixture();
  c.level29Leisure.enter();
  const before = c.cash;
  assert.equal(c.level29Leisure.start("unknown"), false);
  assert.equal(c.cash, before);
  c.level29Leisure.show();
  c.pollPad = () => {
    c.state = "play";
  };
  c.update();
  assert.equal(c.state, "pause");
  assert(c.document.body.children.find((n) => n.tag === "dialog").open);
  assert.equal(c.cash, before);
});
