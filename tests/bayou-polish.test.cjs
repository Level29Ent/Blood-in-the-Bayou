const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  vm = require("node:vm");
const C = require("../public/game/bayou-polish-core.js");
const checkpoint = (n = 0) => ({
  v: 2,
  missionIdx: n,
  cash: 500,
  up: { nitro: true, armor: 1 },
  arsenal: { m240: "inf", pistol: 20 },
  completed: [0],
  packages: ["0:1"],
  jumps: ["0:2"],
  rampages: ["0:0"],
  maxHp: 100,
});
const bundle = (n = 0) => ({
  [C.KEY]: JSON.stringify(checkpoint(n)),
  "level29.bindings.v1": JSON.stringify({ forward: "w" }),
});
function storage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    map,
    getItem: (k) => map.get(k) ?? null,
    setItem(k, v) {
      map.set(k, v);
    },
    removeItem: (k) => map.delete(k),
  };
}
test("legacy campaign upgrades, string collectible IDs, infinite ammo and optional fields stay valid", () => {
  assert.equal(C.campaign(checkpoint()).cash, 500);
  assert.deepEqual(C.bundle(bundle()), bundle());
  assert.equal(C.fresh(null).chapter, 0);
});
test("save validation rejects bad mission bounds, money, nested pollution, malformed arrays and oversized input before writes", () => {
  for (const patch of [
    { missionIdx: -1 },
    { missionIdx: 210 },
    { missionIdx: 0.5 },
    { cash: -1 },
    { cash: null },
    { up: [] },
    { arsenal: { pistol: -1 } },
    { completed: [999] },
    { maxHp: NaN },
    { partial: { idx: 3, kind: "race" } },
  ])
    assert.throws(() => C.campaign({ ...checkpoint(), ...patch }));
  assert.throws(() =>
    C.bundle({ [C.KEY]: JSON.stringify(checkpoint()), evil: "{}" }),
  );
  assert.throws(() =>
    C.bundle({ [C.KEY]: '{"v":2,"missionIdx":0,"cash":20,"__proto__":{}}' }),
  );
  assert.throws(() =>
    C.bundle({ ...bundle(), "level29.places.v1": "x".repeat(C.LIMIT) }),
  );
  const s = storage(bundle());
  const old = [...s.map];
  assert.throws(() => C.install(s, { [C.KEY]: "bad" }));
  assert.deepEqual([...s.map], old);
});
test("rolling backups keep three distinct valid saves and recovery backs up the replaced state", () => {
  const s = storage(bundle(0));
  for (let n = 1; n <= 5; n++) C.install(s, bundle(n));
  assert.deepEqual(
    C.backups(s).map((x) => JSON.parse(x.data[C.KEY]).missionIdx),
    [4, 3, 2],
  );
  const previous = C.backups(s)[1].data;
  C.install(s, previous);
  assert.equal(JSON.parse(s.getItem(C.KEY)).missionIdx, 3);
  assert.equal(JSON.parse(C.backups(s)[0].data[C.KEY]).missionIdx, 5);
});
test("malformed current records can be recovered without silently discarding their raw contents", () => {
  const s = storage({ [C.KEY]: "corrupt" });
  C.install(s, bundle(2));
  assert.equal(JSON.parse(s.getItem(C.KEY)).missionIdx, 2);
  assert.equal(
    JSON.parse(s.getItem("level29.recovery-raw.v1"))[C.KEY],
    "corrupt",
  );
});
test("failed multi-key import rolls back all old records and imported missing records are removed", () => {
  const s = storage(bundle()),
    oldSet = s.setItem;
  let fail = true;
  s.setItem = (k, v) => {
    if (k === "level29.places.v1" && fail) {
      fail = false;
      throw Error("quota");
    }
    oldSet(k, v);
  };
  assert.throws(
    () => C.install(s, { ...bundle(3), "level29.places.v1": "{}" }),
    /quota/,
  );
  assert.equal(s.getItem(C.KEY), bundle()[C.KEY]);
  assert.equal(s.getItem("level29.places.v1"), null);
  C.install(s, { [C.KEY]: bundle(3)[C.KEY] });
  assert.equal(s.getItem("level29.bindings.v1"), null);
});
test("recipe crafting consumes only exact ingredients, never duplicates gathered nodes or goes negative", () => {
  const s = C.fresh();
  assert(!C.craft(s, "poultice"));
  assert(C.gather(s, "a", "herb"));
  assert(!C.gather(s, "a", "herb"));
  assert(C.gather(s, "b", "herb"));
  assert(C.craft(s, "poultice"));
  assert.equal(s.ingredients.herb, 0);
  assert(!C.craft(s, "poultice"));
  assert(!C.gather(s, "c", "money"));
  assert.deepEqual(C.fresh(s), s);
});
const live = { near: true, onFoot: true, alive: true, quiet: true };
test("three chapter activities enforce clue order, foot/proximity/alive gates, stealth, choice and one payout per mission", () => {
  const s = C.fresh();
  s.active = true;
  assert.equal(C.advance(s, "sam", { ...live, near: false }), null);
  assert.equal(C.advance(s, "sam", { ...live, alive: false }), null);
  assert.equal(C.advance(s, "lab", live), null);
  assert.equal(C.advance(s, "sam", { ...live, onFoot: false }), null);
  assert(C.advance(s, "sam", live));
  assert(C.advance(s, "lab", live));
  assert.equal(C.advance(s, "ronnie", live).pay, 400);
  assert.equal(C.advance(s, "ronnie", live), null);
  s.active = true;
  assert.equal(C.advance(s, "cache", { ...live, quiet: false }), null);
  assert(C.advance(s, "cache", live));
  assert.equal(C.advance(s, "handoff", live).pay, 650);
  s.active = true;
  assert.equal(C.advance(s, "decision", { ...live, choice: "hack" }), null);
  assert(C.advance(s, "decision", { ...live, choice: "shelter" }));
  assert.equal(C.advance(s, "broadcast", live), null);
  assert.equal(C.advance(s, "shelter", live).pay, 1000);
  assert.equal(s.chapter, 3);
  assert.equal(s.choice, "shelter");
  assert.equal(C.advance(s, "shelter", live), null);
});
test("chapter resume retains medicine, decision and claimed ingredients without changing campaign IDs", () => {
  const s = C.fresh();
  s.chapter = 1;
  s.step = 1;
  s.active = true;
  s.ingredients.reed = 3;
  s.gathered = ["plant:0"];
  assert.deepEqual(C.fresh(JSON.parse(JSON.stringify(s))), s);
  const r = C.fresh({ v: 1, chapter: 2, step: 50 });
  assert.equal(r.step, 1);
  assert.equal(r.active, false);
});
test("multiplayer library is absent from initial launcher and a gesture-triggered loader deduplicates requests", async () => {
  const html = fs.readFileSync("public/game/index.html", "utf8");
  assert(!html.includes('src="peerjs.min.js'));
  let script,
    calls = 0;
  const ctx = {
    window: {},
    document: {
      createElement: () => ({ remove() {} }),
      head: {
        appendChild(s) {
          script = s;
          calls++;
        },
      },
    },
    setTimeout: () => 1,
    clearTimeout() {},
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync("public/game/peer-loader.js", "utf8"), ctx);
  assert.equal(calls, 0);
  const a = ctx.window.level29Peer.load(),
    b = ctx.window.level29Peer.load();
  assert.equal(a, b);
  assert.equal(calls, 1);
  ctx.window.Peer = function () {};
  script.onload();
  assert.equal(await a, ctx.window.Peer);
});
test("real host-loss handler freezes client, preserves solo-save guard and offers explicit reconnect/title actions", () => {
  const src = fs.readFileSync("public/game/mp.js", "utf8"),
    buttons = [];
  const box = {
    className: "",
    appendChild(n) {
      if (
        n.onclick !== undefined ||
        n.textContent?.includes("RECONNECT") ||
        n.textContent?.includes("RETURN")
      )
        buttons.push(n);
    },
    querySelector: () => ({ focus() {} }),
  };
  const ctx = {
    MP: { code: "ABCD", hostSession: "session", pending: {} },
    mpRole: "client",
    player: { x: 1, y: 2, hp: 80 },
    cash: 900,
    arsenal: { pistol: 3 },
    curW: "pistol",
    state: "play",
    keys: { w: true },
    mouse: { down: true },
    window: {},
    mpEl: { replaceChildren() {}, appendChild() {}, style: {} },
    document: {
      exitPointerLock() {},
      createElement: (tag) => (tag === "div" ? box : { style: {} }),
    },
  };
  vm.createContext(ctx);
  vm.runInContext(
    src.slice(
      src.indexOf("function mpHostGone(){"),
      src.indexOf("function mpClientData(d)"),
    ),
    ctx,
  );
  ctx.mpHostGone();
  assert.equal(ctx.state, "pause");
  assert.equal(ctx.mpRole, "client");
  assert.equal(ctx.MP.recovering, true);
  assert.equal(ctx.MP.pending, null);
  assert.equal(ctx.keys.w, false);
  assert.equal(ctx.MP.resume.cash, 900);
  assert.equal(buttons.length, 2);
  ctx.mpHostGone();
  assert.equal(buttons.length, 2);
});
test("real bindings refresh title instructions on defaults, rebind and reset", () => {
  const node = { textContent: "" },
    events = {},
    ctx = {
      window: null,
      document: { querySelector: () => node, querySelectorAll: () => [] },
      addEventListener: (n, f) => (events[n] = f),
      localStorage: storage(),
    };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(
    fs.readFileSync("public/game/input-bindings.js", "utf8"),
    ctx,
  );
  events.DOMContentLoaded();
  assert.match(node.textContent, /E · interact/);
  assert.match(node.textContent, /G · vehicle/);
  ctx.level29Bindings.change("vehicle", "y");
  assert.match(node.textContent, /Y · vehicle/);
  ctx.level29Bindings.reset();
  assert.match(node.textContent, /G · vehicle/);
});
