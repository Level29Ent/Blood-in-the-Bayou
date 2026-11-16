const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  vm = require("node:vm"),
  THREE = require("three");
const C = require("../public/game/bayou-polish-core.js"),
  N = require("../public/game/neighborhood-chain-core.js");
function element(tag) {
  return {
    tag,
    style: {},
    children: [],
    open: false,
    hidden: false,
    appendChild(n) {
      this.children.push(n);
      return n;
    },
    replaceChildren() {
      this.children = [];
    },
    setAttribute() {},
    addEventListener() {},
    focus() {},
    showModal() {
      this.open = true;
    },
    close() {
      this.open = false;
    },
    querySelector() {
      return this.children.find((n) => n.tag === "button");
    },
  };
}
function fixture() {
  const venues = [
    ["CASINO", 0, "casino"],
    ["BAYOU STATE UNIVERSITY", 300, "classroom"],
    ["RONNIE MANSION", 600, "safe"],
    ["GENERAL HOSPITAL", 900, "hospital"],
    ["FRESH MARKET", 1200, "grocery"],
  ].map(([name, x, id]) => ({
    name,
    id,
    doorX: x,
    doorY: 100,
    b: { x, y: 50, w: 50, h: 50 },
  }));
  const city = {
    world: true,
    venues,
    casinoVenue: venues[0],
    heightAt: () => 0,
  };
  const nodes = [];
  const ctx = {
    window: null,
    BayouPolishCore: C,
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
    document: {
      body: element("body"),
      createElement: element,
      exitPointerLock() {},
    },
    THREE,
    city,
    cityGroup: new THREE.Group(),
    builtCity: city,
    player: { x: 0, y: 148, hp: 100, maxHp: 100, r: 8, flash: 0 },
    state: "play",
    subtitle: null,
    mpRole: null,
    mission: { phase: "start" },
    keys: {},
    mouse: { down: false },
    zombies: [],
    cash: 100,
    frame: 0,
    performance: { now: () => 100 },
    blockedCircle: () => false,
    terrainHeight: () => 0,
    toast() {},
    level29Bindings: {
      label: (a) => (a === "interact" ? "E" : "G"),
      release() {},
    },
    level29Save: {
      save() {
        ctx.saves++;
      },
    },
    saves: 0,
    serviceVenue() {
      ctx.services++;
    },
    services: 0,
    startGame() {},
    buildCity() {},
    update() {},
    missionTarget: () => ({ label: "BASE" }),
    extraBlips: () => [],
    render() {},
    showMap: false,
    SW: 1280,
    SH: 800,
    project: () => null,
    cx: { save() {}, restore() {} },
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync("public/game/bayou-polish.js", "utf8"), ctx);
  ctx.buildCity();
  return ctx;
}
test("actual chapter runtime routes outside existing venues, suspends during campaign combat, and checkpoints payouts once", () => {
  const c = fixture();
  c.level29BayouPolish.restore({ ...C.fresh(), active: true });
  c.update();
  assert.equal(c.missionTarget().x, 0);
  c.player.x = 300;
  assert.equal(c.level29BayouPolish.use(), false);
  c.player.x = 0;
  assert(c.level29BayouPolish.use());
  assert.equal(c.level29BayouPolish.snapshot.step, 1);
  c.player.x = 300;
  c.mission.phase = "active";
  assert.equal(c.level29BayouPolish.use(), false);
  assert.equal(c.missionTarget().label, "BASE");
  c.mission.phase = "start";
  assert(c.level29BayouPolish.use());
  c.player.x = 600;
  assert(c.level29BayouPolish.use());
  assert.equal(c.cash, 500);
  assert.equal(c.level29BayouPolish.snapshot.chapter, 1);
  assert(!c.level29BayouPolish.use());
  assert.equal(c.cash, 500);
  assert(c.saves >= 3);
});
test("actual medicine pickup requires two seconds clear; pause, vehicle and alert conditions cannot advance it", () => {
  const c = fixture();
  c.level29BayouPolish.restore({ ...C.fresh(), chapter: 1, active: true });
  c.player.x = 300;
  c.update();
  assert(c.level29BayouPolish.use());
  assert.equal(c.level29BayouPolish.snapshot.step, 0);
  c.zombies = [{ alive: true, alert: true, x: 300, y: 148 }];
  for (let i = 0; i < 125; i++) c.update();
  c.level29BayouPolish.use();
  assert.equal(c.level29BayouPolish.snapshot.step, 0);
  c.zombies = [];
  for (let i = 0; i < 120; i++) c.update();
  c.player.car = {};
  assert(!c.level29BayouPolish.use());
  c.player.car = null;
  assert(c.level29BayouPolish.use());
  assert.equal(c.level29BayouPolish.snapshot.step, 1);
  c.player.x = 900;
  assert(c.level29BayouPolish.use());
  assert.equal(c.cash, 750);
});
test("real gathering consumes the visible node once, survives restore, and all owned marker resources retire on rebuild", () => {
  const c = fixture();
  c.player.x = 1200;
  c.update();
  assert(c.level29BayouPolish.use());
  assert.equal(c.level29BayouPolish.ingredients.herb, 1);
  assert(!c.level29BayouPolish.use());
  const saved = c.level29BayouPolish.snapshot;
  c.level29BayouPolish.restore(saved);
  c.update();
  assert(!c.level29BayouPolish.use());
  assert.equal(c.level29BayouPolish.ingredients.herb, 1);
  let disposed = 0;
  const root = c.cityGroup.children[0],
    geos = new Set(),
    mats = new Set();
  root.traverse((o) => {
    if (o.geometry) geos.add(o.geometry);
    if (o.material) mats.add(o.material);
  });
  for (const x of [...geos, ...mats])
    x.addEventListener("dispose", () => disposed++);
  c.buildCity();
  assert.equal(c.cityGroup.children.length, 1);
  assert.equal(disposed, geos.size + mats.size);
});
test("existing apothecary can use gathered ingredients instead of cash and refuses full-health waste", () => {
  const src = fs.readFileSync("public/game/survival-expansion.js", "utf8"),
    buttons = [];
  const data = C.fresh();
  data.ingredients.herb = 2;
  const ctx = {
    RECIPES: { poultice: { name: "Heal", cost: 75 } },
    BayouPolishCore: C,
    modal: { replaceChildren() {} },
    p() {},
    add: (label, fn) => buttons.push({ label, fn }),
    cash: 200,
    player: { hp: 100, maxHp: 100 },
    buffs: {},
    show() {},
    save() {
      ctx.saves++;
    },
    saves: 0,
    window: null,
    level29BayouPolish: {
      get ingredients() {
        return data.ingredients;
      },
      craft: (id) => C.craft(data, id),
    },
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(
    src.slice(
      src.indexOf("  function shop()"),
      src.indexOf("  function reward()"),
    ),
    ctx,
  );
  ctx.shop();
  const craft = buttons.find((b) => b.label.startsWith("CRAFT"));
  craft.fn();
  assert.equal(data.ingredients.herb, 2);
  ctx.player.hp = 50;
  craft.fn();
  assert.equal(ctx.player.hp, 85);
  assert.equal(ctx.cash, 200);
  assert.equal(data.ingredients.herb, 0);
  assert.equal(ctx.saves, 1);
  craft.fn();
  assert.equal(ctx.player.hp, 85);
});
test("synth profiles distinguish firearms and muted shots never allocate audio nodes", () => {
  const s = fs.readFileSync("public/game/audio.js", "utf8"),
    ctx = {
      actx: { currentTime: 0 },
      soundMode: 2,
      sfxBus: {},
      voice() {
        throw Error("muted allocation");
      },
      noiseV() {
        throw Error("muted allocation");
      },
    };
  vm.createContext(ctx);
  vm.runInContext(
    s.slice(
      s.indexOf("function weaponShotProfile"),
      s.indexOf("function snd("),
    ),
    ctx,
  );
  assert.equal(
    new Set(
      ["shotgun", "smg", "ranger", "pistol"].map(
        (id) => ctx.weaponShotProfile(id).body,
      ),
    ).size,
    4,
  );
  // Execute the production snd function without its unrelated voice-bank initialization.
  const start = s.indexOf("function snd("),
    end = s.indexOf("\nfunction ", start + 10);
  vm.runInContext(s.slice(start, end), ctx);
  assert.doesNotThrow(() => ctx.snd("shot"));
});

test("cloud UI requires an explicit check, handles revision conflicts and rejects account-switched restores", async () => {
  const local = new Map([
      [C.KEY, JSON.stringify({ v: 2, missionIdx: 0, cash: 100 })],
    ]),
    body = element("body");
  function el(tag) {
    const n = element(tag);
    n.querySelectorAll = () => {
      const result = [];
      const walk = (x) => {
        for (const child of x.children) {
          if (child.tag === "button") result.push(child);
          walk(child);
        }
      };
      walk(n);
      return result;
    };
    return n;
  }
  let owner = "alice",
    rpcCalls = 0,
    conflict = false;
  const row = {
    revision: 4,
    updated_at: "2026-11-16T00:00:00Z",
    payload: { [C.KEY]: JSON.stringify({ v: 2, missionIdx: 3, cash: 800 }) },
  };
  const client = {
    from() {
      return {
        select() {
          return this;
        },
        eq() {
          return this;
        },
        maybeSingle: async () => ({ data: row }),
      };
    },
    rpc: async (name, args) => {
      rpcCalls++;
      assert.equal(args.expected_revision, 4);
      return conflict
        ? { error: { message: "revision conflict" } }
        : { data: 5 };
    },
  };
  const ctx = {
    window: null,
    BayouPolishCore: C,
    BayouCommunity: {
      user: async () => ({ id: owner }),
      connect: async () => client,
    },
    document: {
      body,
      createElement: el,
      querySelector: () => null,
      exitPointerLock() {},
    },
    localStorage: {
      getItem: (k) => local.get(k) ?? null,
      setItem: (k, v) => local.set(k, v),
      removeItem: (k) => local.delete(k),
    },
    state: "menu",
    mpRole: null,
    mouse: { down: false },
    keys: {},
    location: {
      protocol: "https:",
      reload() {
        ctx.reloaded = true;
      },
    },
    reloaded: false,
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync("public/game/cloud-save.js", "utf8"), ctx);
  ctx.level29CloudSave.show();
  const dialog = body.children[0];
  const click = async (label) => {
    const b = dialog.querySelectorAll().find((b) => b.textContent === label);
    assert(b, label);
    await b.onclick();
  };
  await click("UPLOAD THIS DEVICE · MANUAL");
  assert.equal(rpcCalls, 0);
  await click("CHECK CLOUD COPY");
  conflict = true;
  await click("UPLOAD THIS DEVICE · MANUAL");
  assert.equal(rpcCalls, 1);
  await click("UPLOAD THIS DEVICE · MANUAL");
  assert.equal(rpcCalls, 1);
  await click("CHECK CLOUD COPY");
  owner = "bob";
  await click("RESTORE CHECKED CLOUD COPY");
  assert.equal(ctx.reloaded, false);
  assert.equal(JSON.parse(local.get(C.KEY)).missionIdx, 0);
  assert(
    dialog.children.some((n) => n.textContent?.includes("Account changed")),
  );
});

test("field-stage transitions do not get completed-mission ambient respite", () => {
  const ctx = {
    window: {},
    document: { addEventListener() {} },
    addEventListener() {},
    localStorage: { getItem: () => null },
    level29GameplayMath: { sensitivity: (x) => x },
    render() {},
    mission: { phase: "active" },
    passMission() {
      this.calls++;
    },
    calls: 0,
    ambientSpawn() {
      ctx.spawns++;
    },
    spawns: 0,
    frame: 100,
    state: "play",
    player: { dead: false },
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync("public/game/gameplay-feel.js", "utf8"), ctx);
  ctx.passMission();
  ctx.ambientSpawn();
  assert.equal(ctx.spawns, 1);
});

test("actual welcome restores only a matching known host instance and a clear ground-level location", () => {
  const source = fs.readFileSync("public/game/mp.js", "utf8");
  function join(session, blocked = false) {
    const c = {
      MP: {
        resume: {
          code: "ABCD",
          sessionId: "same",
          x: 40,
          y: 50,
          hp: 60,
          cash: 900,
          arsenal: { pistol: 20 },
          curW: "pistol",
        },
        zmap: new Map(),
      },
      mpRole: null,
      player: null,
      cash: 0,
      arsenal: {},
      curW: "m240",
      banner: null,
      zombies: [],
      pickups: [],
      performance: { now: () => 100 },
      closeMP() {},
      startGame() {
        c.player = { x: 0, y: 0, r: 8, hp: 100, maxHp: 100 };
        c.cash = 10;
      },
      blockedCircle: () => blocked,
      terrainHeight: () => 0,
      snapCamera() {
        c.snaps++;
      },
      snaps: 0,
    };
    vm.createContext(c);
    vm.runInContext(
      source.slice(
        source.indexOf("function mpClientData(d)"),
        source.indexOf("function mpApply(s)"),
      ),
      c,
    );
    c.mpClientData({
      t: "welcome",
      id: "client",
      code: "ABCD",
      sessionId: session,
      mi: 0,
      host: "HOST",
    });
    return c;
  }
  const same = join("same");
  assert.equal(same.cash, 900);
  assert.equal(same.player.x, 40);
  assert.equal(same.player.hp, 60);
  assert.equal(same.mpRole, "client");
  assert.equal(same.MP.lastSnapshot, 100);
  const changed = join("different");
  assert.equal(changed.cash, 10);
  assert.equal(changed.player.x, 0);
  assert.equal(join(undefined).cash, 10);
  assert.equal(join("same", true).player.x, 0);
});
