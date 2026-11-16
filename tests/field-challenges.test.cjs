const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  vm = require("node:vm"),
  THREE = require("three");
const C = require("../public/game/field-challenges-core.js"),
  N = require("../public/game/neighborhood-chain-core.js"),
  A = require("../public/game/nola-activities-core.js");
test("progress imports accept only known completions and bounded positive times", () => {
  assert.deepEqual(C.restore(null).cleared, []);
  assert.deepEqual(
    C.restore({
      v: 1,
      cleared: ["trail", "bad", "trail"],
      best: { fishing: 99999, recovery: -1, trail: 200 },
    }),
    {
      v: 1,
      cleared: ["trail"],
      best: { fishing: null, recovery: null, trail: 200 },
    },
  );
});
test("angler cup counts three real unique landed fish but never lockboxes or duplicate sequences", () => {
  const j = C.create("fishing");
  assert(!C.catchLanded(j, { name: "Sealed dockside lockbox", sequence: 1 }));
  assert(C.catchLanded(j, { name: "Catfish", sequence: 2 }));
  assert(!C.catchLanded(j, { name: "Catfish", sequence: 2 }));
  assert(C.catchLanded(j, { name: "Crawfish", sequence: 3 }));
  assert(C.catchLanded(j, { name: "Bass", sequence: 4 }));
  assert(j.ready);
  assert(!C.catchLanded(j, { name: "Bass", sequence: 5 }));
  const d = C.restore();
  j.elapsed = 60;
  const r = C.settle(d, j);
  assert.equal(r.cash, 600);
  assert.equal(r.reward, "headwear-3-2");
  assert.equal(C.settle(d, j), null);
  const repeat = C.create("fishing");
  repeat.ready = true;
  repeat.elapsed = 70;
  assert.equal(C.settle(d, repeat).cash, 0);
  assert.equal(d.best.fishing, 60);
});
test("repair requires four uninterrupted seconds on foot and return requires exact stopped loaner", () => {
  const j = C.create("recovery");
  for (let i = 0; i < 20; i++)
    C.work(j, 0.1, { near: true, onFoot: true, using: true });
  C.work(j, 0.1, { near: false, onFoot: true, using: true });
  assert.equal(j.hold, 0);
  for (let i = 0; i < 41; i++)
    C.work(j, 0.1, { near: true, onFoot: true, using: true });
  assert.equal(j.stage, 1);
  assert.equal(
    C.work(j, 0.1, { near: true, drivingTarget: false, stopped: true }),
    null,
  );
  assert.equal(
    C.work(j, 0.1, { near: true, drivingTarget: true, stopped: false }),
    null,
  );
  assert.equal(
    C.work(j, 0.1, { near: true, drivingTarget: true, stopped: true }),
    "ready",
  );
});
test("five trail stops require distinct ordered stages and timeout/death cannot reward", () => {
  const j = C.create("trail");
  for (let stage = 0; stage < 5; stage++)
    for (let i = 0; i < 21; i++)
      C.work(j, 0.1, { near: true, onFoot: true, using: true });
  assert(j.ready);
  assert.equal(j.stage, 5);
  const dead = C.create("trail");
  C.tick(dead, 0.1, { alive: false });
  dead.ready = true;
  assert.equal(C.settle(C.restore(), dead), null);
  const timeout = C.create("fishing");
  timeout.remaining = 0.01;
  assert(!C.tick(timeout, 0.1));
  assert(timeout.failed);
});
function el(tag) {
  return {
    tag,
    children: [],
    style: {},
    open: false,
    hidden: false,
    listeners: {},
    appendChild(n) {
      this.children.push(n);
      return n;
    },
    replaceChildren() {
      this.children = [];
    },
    setAttribute() {},
    addEventListener(n, f) {
      (this.listeners[n] ??= []).push(f);
    },
    showModal() {
      this.open = true;
    },
    close() {
      this.open = false;
    },
  };
}
function fixture() {
  const listeners = {},
    points = [
      { x: 600, y: 800, name: "LIBRARY" },
      { x: 1000, y: 800, name: "MARKET" },
      { x: 1400, y: 800, name: "RADIO" },
      { x: 1800, y: 800, name: "PARK" },
      { x: 2200, y: 800, name: "DEPOT" },
    ],
    nodes = [],
    wardrobe = { outfit: { tops: "tops-0-0" }, owned: ["tops-0-0"] };
  const c = {
    window: null,
    BayouFieldCore: C,
    THREE,
    scene: new THREE.Scene(),
    city: {
      world: true,
      width: 100,
      height: 100,
      venues: [{ id: "garage", name: "GARAGE", doorX: 2300, doorY: 1000 }],
      heightAt: () => 0,
      get: () => 1,
    },
    player: { x: 100, y: 100, r: 8, hp: 100, dead: false, car: null },
    state: "play",
    mission: { phase: "start" },
    mpRole: null,
    keys: {},
    mouse: { down: false },
    gp: { fire: false },
    cash: 100,
    document: {
      body: el("body"),
      createElement: el,
      exitPointerLock() {},
      addEventListener() {},
    },
    addEventListener: (n, f) => (listeners[n] ??= []).push(f),
    listeners,
    level29Bindings: { release() {} },
    level29NeighborhoodCore: N,
    level29NolaActivityCore: A,
    level29Navigation: {
      graph: {
        nearest(x, y) {
          nodes.push({ x, y });
          return nodes.length - 1;
        },
        point: (i) => nodes[i],
      },
    },
    level29CampaignMap: { points: () => points },
    cars: [],
    blockedCircle: () => false,
    terrainHeight: () => 0,
    tileAt: () => 1,
    level29TrafficClearance: { clear: () => true },
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
      gone: false,
    }),
    toast(t) {
      c.notice = t;
    },
    level29OpenWorld: { fish: null, waterSpot: () => ({ x: 90, y: 90 }) },
    level29WardrobeCatalog: {
      catalog: [
        { id: "headwear-3-2", category: "headwear" },
        { id: "shoes-1-2", category: "shoes" },
        { id: "tops-2-2", category: "tops" },
      ],
    },
    level29Wardrobe: {
      get snapshot() {
        return JSON.parse(JSON.stringify(wardrobe));
      },
      restore(d) {
        Object.assign(wardrobe, d);
        return true;
      },
    },
    level29Save: {
      save() {
        c.saves++;
      },
    },
    saves: 0,
    serviceVenue() {
      c.services++;
    },
    services: 0,
    enterExit() {
      c.mounts++;
    },
    mounts: 0,
    updateCar() {
      c.drives++;
    },
    drives: 0,
    beginMission() {
      c.begins++;
    },
    begins: 0,
    update() {
      c.updates++;
    },
    updates: 0,
    killPlayer() {
      c.player.dead = true;
    },
    buildCity() {},
    startGame() {},
    missionTarget: () => ({ x: 0, y: 0, label: "BASE" }),
    exitCar() {
      c.player.car = null;
    },
  };
  c.window = c;
  vm.createContext(c);
  vm.runInContext(
    fs.readFileSync("public/game/field-challenges.js", "utf8"),
    c,
  );
  return c;
}
function click(c, label) {
  const p = c.document.body.children.find((n) => n.id === "fieldBoard"),
    b = p.children.find((n) => n.textContent === label);
  assert(b, label);
  b.onclick();
}
function start(c, id) {
  c.level29Field.show();
  click(c, "START " + C.DEFS[id].name);
}
test("real fishing notification completes cup, persists cosmetic ownership and preserves the current outfit until equip", () => {
  const c = fixture();
  start(c, "fishing");
  assert(c.level29Field.active);
  for (let i = 1; i <= 3; i++)
    for (const f of c.listeners["level29:fish-landed"])
      f({ detail: { name: "Catfish", sequence: i } });
  assert(!c.level29Field.active);
  assert.equal(c.cash, 700);
  assert(c.level29Wardrobe.snapshot.owned.includes("headwear-3-2"));
  assert.equal(c.level29Wardrobe.snapshot.outfit.tops, "tops-0-0");
  assert(!c.level29Wardrobe.snapshot.outfit.headwear);
  c.level29Field.show();
  click(c, "EQUIP GOLD BUCKET HAT");
  assert.equal(c.level29Wardrobe.snapshot.outfit.headwear, "headwear-3-2");
});
test("angler dispatch rejects remote water/cast and multiplayer boards cannot pause a host", () => {
  const c = fixture();
  c.level29OpenWorld.waterSpot = () => null;
  start(c, "fishing");
  assert(!c.level29Field.active);
  c.mpRole = "host";
  c.state = "play";
  c.level29Field.show();
  assert.equal(c.state, "play");
});
test("trail runtime checks on-foot proximity, progresses all five real sites and pays once", () => {
  const c = fixture();
  start(c, "trail");
  const oldCash = c.cash;
  c.keys.u = true;
  for (let i = 0; i < 130; i++) c.update();
  assert.equal(c.level29Field.active.stage, 0);
  for (let i = 0; i < 5; i++) {
    const p = c.missionTarget();
    c.player.x = p.x;
    c.player.y = p.y;
    c.player.car = {};
    for (let t = 0; t < 125; t++) c.update();
    assert.equal(c.level29Field.active.stage, i);
    c.player.car = null;
    for (let t = 0; t < 125; t++) c.update();
  }
  assert(!c.level29Field.active);
  assert.equal(c.cash, oldCash + 1000);
  assert(c.level29Wardrobe.snapshot.owned.includes("tops-2-2"));
  c.update();
  assert.equal(c.cash, oldCash + 1000);
});
test("recovery loaner is repair-locked, only that driven stopped vehicle can deliver, and cleanup never deletes other cars", () => {
  const c = fixture(),
    owned = { x: 50, y: 50, dead: false, gone: false };
  c.cars.push(owned);
  start(c, "recovery");
  const car = c.level29Field.car;
  assert(car && car.recoveryJob);
  c.player.x = car.x;
  c.player.y = car.y;
  c.enterExit();
  assert.equal(c.mounts, 0);
  c.keys.u = true;
  for (let i = 0; i < 241; i++) c.update();
  assert.equal(c.level29Field.active.stage, 1);
  const p = c.missionTarget();
  car.x = p.x;
  car.y = p.y;
  c.player.car = owned;
  c.update();
  assert(c.level29Field.active);
  c.player.car = car;
  car.v = 2;
  c.update();
  assert(c.level29Field.active);
  car.v = 0;
  c.update();
  assert(!c.level29Field.active);
  assert.equal(c.cash, 1000);
  assert(car.gone);
  assert(!owned.gone);
  assert(c.level29Wardrobe.snapshot.owned.includes("shoes-1-2"));
});
test("failed recovery/aborted trail and new-game cleanup never reward while saved best results survive restore", () => {
  const c = fixture();
  start(c, "recovery");
  c.level29Field.car.hp = 0;
  c.update();
  assert(!c.level29Field.active);
  assert.equal(c.cash, 100);
  start(c, "trail");
  c.level29Field.active.remaining = 0.001;
  c.update();
  assert(!c.level29Field.active);
  assert.equal(c.cash, 100);
  c.level29Field.restore({ v: 1, cleared: ["trail"], best: { trail: 90 } });
  assert.equal(c.level29Field.snapshot.best.trail, 90);
  c.startGame();
  assert.equal(c.level29Field.snapshot.cleared.length, 0);
});
test("production catch event is emitted only by the actual success handler and excludes historical counter polling", () => {
  const s = fs.readFileSync("public/game/gulf.js", "utf8"),
    catchBody = s.slice(
      s.indexOf("function catchFish(){"),
      s.indexOf("function fishingUI()"),
    );
  assert(
    catchBody.includes("dispatchEvent(new CustomEvent('level29:fish-landed'"),
  );
  assert.equal((s.match(/level29:fish-landed/g) || []).length, 1);
  assert(s.includes("waterSpot:nearWaterSpot"));
  const save = fs.readFileSync("public/game/savegame.js", "utf8");
  assert(save.includes("field:window.level29Field?.snapshot||null"));
  assert(save.includes("window.level29Field?.restore(s.field)"));
});

test("real production catch handler emits species and incremented sequence after normal fishing rewards", () => {
  const src = fs.readFileSync("public/game/gulf.js", "utf8"),
    body = src.slice(
      src.indexOf("function catchFish(){"),
      src.indexOf("function fishingUI()"),
    );
  const events = [],
    c = {
      fishTable: [["Catfish", 100, 1]],
      fish: { boat: false },
      save: { owned: {}, fishCaught: 6, fishStock: 2 },
      cash: 50,
      Math: Object.create(Math),
      sfx() {},
      stopFishing() {
        c.fish = null;
      },
      persist() {
        c.persisted = true;
      },
      dispatchEvent: (e) => events.push(e),
      CustomEvent: class {
        constructor(type, options) {
          this.type = type;
          this.detail = options.detail;
        }
      },
    };
  c.Math.random = () => 0.5;
  vm.createContext(c);
  vm.runInContext(body, c);
  c.catchFish();
  assert.equal(c.save.fishCaught, 7);
  assert.equal(c.save.fishStock, 3);
  assert(c.cash > 50);
  assert(c.persisted);
  assert.equal(events.length, 1);
  assert.equal(events[0].type, "level29:fish-landed");
  assert.equal(events[0].detail.name, "Catfish");
  assert.equal(events[0].detail.sequence, 7);
});
test("paused challenge clears partial holds, time does not count in its board, death/changed activity cannot reward", () => {
  const c = fixture();
  start(c, "trail");
  const j = c.level29Field.active,
    p = c.missionTarget();
  c.player.x = p.x;
  c.player.y = p.y;
  c.keys.u = true;
  for (let i = 0; i < 60; i++) c.update();
  assert(j.hold > 0);
  c.state = "pause";
  c.update();
  assert.equal(j.hold, 0);
  c.level29Field.show();
  const remaining = j.remaining;
  for (let i = 0; i < 200; i++) c.update();
  assert.equal(j.remaining, remaining);
  click(c, "CLOSE / RESUME");
  c.level29Jobs = { active: {} };
  c.update();
  assert(!c.level29Field.active);
  assert.equal(c.cash, 100);
});
test("full challenge data survives existing campaign bundle export/import validation", () => {
  const B = require("../public/game/bayou-polish-core.js"),
    d = C.restore({
      v: 1,
      cleared: ["fishing", "trail"],
      best: { fishing: 65, trail: 200 },
    }),
    bundle = B.bundle({
      [B.KEY]: JSON.stringify({ v: 2, missionIdx: 2, cash: 100, field: d }),
    });
  assert.deepEqual(C.restore(JSON.parse(bundle[B.KEY]).field), d);
});

test("dispatch creates only private bounded markers, hides future clues and frees them on cancellation", () => {
  const c = fixture();
  start(c, "trail");
  const root = c.scene.getObjectByName("Field challenge · owned markers");
  assert(root);
  assert.equal(root.children.length, 5);
  assert.equal(root.children.filter((n) => n.visible).length, 1);
  let disposed = 0;
  root.children[0].geometry.addEventListener("dispose", () => disposed++);
  root.children[0].material.addEventListener("dispose", () => disposed++);
  c.level29Field.cancel();
  assert.equal(disposed, 2);
  assert(!c.scene.getObjectByName("Field challenge · owned markers"));
  assert.equal(c.cash, 100);
});
