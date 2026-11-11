const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  vm = require("node:vm");
function fixture() {
  const storage = new Map([
      ["bitb.community.enabled", "yes"],
      ["bitb.community.category", "survival"],
    ]),
    events = {},
    submissions = [],
    c = {
      window: null,
      location: { protocol: "https:", hostname: "game.test" },
      document: { getElementById: () => null, querySelector: () => null },
      localStorage: {
        getItem: (k) => storage.get(k) || null,
        setItem: (k, v) => storage.set(k, v),
        removeItem: (k) => storage.delete(k),
      },
      performance: { now: () => (c.frame * 1000) / 60 },
      state: "menu",
      mpRole: null,
      player: { dead: false },
      frame: 0,
      mission: null,
      startGame() {
        c.state = "play";
      },
      beginMission() {
        c.mission = { phase: "active" };
      },
      passMission() {
        c.mission.phase = "done";
      },
      failMission() {
        c.mission.phase = "failed";
      },
      killPlayer() {
        c.player.dead = true;
      },
      update() {
        c.frame++;
      },
      MP: { code: "AB12", conns: new Map() },
      BayouCommunity: {
        user: async () => ({ id: "owner" }),
        startRun: async (category) => ({ id: "run", category }),
        submit: async (r, value) => submissions.push({ r, value }),
        request: async () => [],
      },
      addEventListener: (n, f) => (events[n] ??= []).push(f),
    };
  c.window = c;
  vm.createContext(c);
  vm.runInContext(
    fs.readFileSync("public/game/community-bridge.js", "utf8"),
    c,
  );
  return { c, storage, events, submissions };
}
const flush = () => new Promise((r) => setImmediate(r));
test("opted-in survival measures simulation time and submits once on death without changing game behavior", async () => {
  const h = fixture();
  h.c.startGame();
  await flush();
  for (let i = 0; i < 610; i++) h.c.update();
  h.c.killPlayer();
  await flush();
  assert.equal(h.submissions.length, 1);
  assert.equal(h.submissions[0].r.category, "survival");
  assert(h.submissions[0].value >= 10 && h.submissions[0].value <= 11);
  h.c.killPlayer();
  await flush();
  assert.equal(h.submissions.length, 1);
  assert.equal(h.c.player.dead, true);
});
test("offline and opt-out play never starts a network score run", async () => {
  const h = fixture();
  h.storage.set("bitb.community.enabled", "no");
  h.c.BayouCommunity.startRun = async () => assert.fail("Unexpected score run");
  h.c.startGame();
  for (let i = 0; i < 10; i++) h.c.update();
  h.c.killPlayer();
  await flush();
  assert.equal(h.submissions.length, 0);
});
test("mission runs start on acceptance and submit only after successful completion", async () => {
  const h = fixture();
  h.storage.set("bitb.community.category", "mission");
  h.c.startGame();
  await flush();
  assert.equal(h.storage.get("bitb.community.run"), undefined);
  h.c.beginMission();
  await flush();
  h.c.failMission();
  await flush();
  assert.equal(h.submissions.length, 0);
  h.c.beginMission();
  await flush();
  for (let i = 0; i < 400; i++) h.c.update();
  h.c.passMission();
  await flush();
  assert.equal(h.submissions.length, 1);
  assert.equal(h.submissions[0].r.category, "mission");
});
test("a missing schema or failed login cannot break starting the game", async () => {
  const h = fixture();
  h.c.BayouCommunity.user = async () => {
    throw Error("Sign in required");
  };
  assert.doesNotThrow(() => h.c.startGame());
  await flush();
  assert.equal(h.c.state, "play");
  assert.match(h.c.level29CommunityBridge.status, /unavailable/);
});
