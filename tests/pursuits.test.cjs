const { test } = require("node:test"),
  assert = require("node:assert/strict");
const C = require("../public/game/pursuits-core.js"),
  K = require("../public/game/leisure-core.js");
test("legacy and malicious progression imports normalize safely, with bounded ghost storage", () => {
  assert.equal(C.fresh().plots.length, 6);
  const d = C.fresh({
    v: 1,
    upgrades: { golf: 99, farm: -3 },
    inventory: { okra: Infinity, corn: 999999 },
    plots: [{ crop: "bad", watered: true, age: 999 }],
    operations: ["bad", "flood"],
    clues: ["lab", "bad"],
    ghost: [
      [0, 1300, 1000, 0, 0],
      [0, 1301, 1001, 0, 0],
    ],
  });
  assert.equal(d.upgrades.golf, 3);
  assert.equal(d.upgrades.farm, 0);
  assert.equal(d.inventory.corn, 999);
  assert.equal(d.plots[0], null);
  assert.deepEqual(d.operations, ["flood"]);
  assert.deepEqual(d.clues, ["lab"]);
  assert.equal(d.ghost.length, 0);
  assert.deepEqual(C.fresh(d), d);
});
test("owned business upgrades charge the correct escalating price once per level and cap at three", () => {
  const d = C.fresh();
  assert.equal(C.upgrade(d, "golf", false, 50000), null);
  assert.equal(C.upgrade(d, "golf", true, 3999), null);
  let cash = 24000;
  cash = C.upgrade(d, "golf", true, cash);
  assert.equal(cash, 20000);
  cash = C.upgrade(d, "golf", true, cash);
  assert.equal(cash, 12000);
  cash = C.upgrade(d, "golf", true, cash);
  assert.equal(cash, 0);
  assert.equal(d.upgrades.golf, 3);
  assert.equal(C.upgrade(d, "golf", true, 99999), null);
  assert.equal(C.bonus(d, "golf", 600), 690);
});
test("cultivation requires seeds, watering, active growth, harvest and sale at a distinct buyer", () => {
  const d = C.fresh();
  assert.equal(C.plant(d, -1, "okra", 100), null);
  assert.equal(C.plant(d, 0, "bad", 100), null);
  assert.equal(C.plant(d, 0, "okra", 10), null);
  assert.equal(C.plant(d, 0, "okra", 100), 85);
  assert.equal(C.plant(d, 0, "corn", 100), null);
  for (let i = 0; i < 700; i++) C.grow(d, 0.1);
  assert.equal(d.plots[0].age, 0);
  assert(!C.harvest(d, 0));
  assert(C.water(d, 0));
  assert(!C.water(d, 0));
  for (let i = 0; i < 601; i++) C.grow(d, 0.1);
  assert(C.harvest(d, 0));
  assert(!C.harvest(d, 0));
  assert.equal(d.inventory.okra, 3);
  assert.equal(C.sell(d, "okra", "bad"), 0);
  assert.equal(C.sell(d, "okra", "clubhouse"), 108);
  assert.equal(C.sell(d, "okra", "clubhouse"), 0);
  assert.equal(d.inventory.okra, 0);
});
test("different crop timers and farm upgrades change active growing time without offline catch-up", () => {
  const d = C.fresh();
  d.upgrades.farm = 2;
  for (const [i, crop] of ["okra", "corn", "cane"].entries()) {
    C.plant(d, i, crop, 1000);
    C.water(d, i);
  }
  for (let i = 0; i < 470; i++) C.grow(d, 0.1);
  assert(C.harvest(d, 0));
  assert(!C.harvest(d, 1));
  assert(!C.harvest(d, 2));
  const restored = C.fresh(JSON.parse(JSON.stringify(d)));
  assert.equal(restored.plots[1].age, d.plots[1].age);
  C.grow(d, 99999);
  assert(d.plots[1].age - restored.plots[1].age < 0.14);
});
test("repeatable service work requires three near/on-foot held stages and cannot pay twice or after failure", () => {
  const j = C.contract("kart");
  assert.equal(C.contract("bad"), null);
  for (let i = 0; i < 100; i++)
    C.work(j, 0.1, { near: false, onFoot: true, using: true });
  assert.equal(j.stage, 0);
  for (let stage = 0; stage < 3; stage++) {
    for (let i = 0; i < 21; i++)
      C.work(j, 0.1, { near: true, onFoot: true, using: true });
  }
  assert(j.paid);
  assert.equal(C.work(j, 0.1, { near: true, onFoot: true, using: true }), null);
  const failed = C.contract("golf");
  failed.seconds = 0.01;
  assert.equal(
    C.work(failed, 0.1, { near: true, onFoot: true, using: true }),
    "failed",
  );
  assert(!failed.paid);
});
test("ghost samples are bounded, validated and interpolate the correct layer and wrapped angle", () => {
  const list = [];
  for (let i = 0; i < 1000; i++)
    C.sample(list, { seconds: i * 0.5, x: 1300, y: 1000, h: 21, angle: 0 });
  assert.equal(list.length, 620);
  const samples = [
      [0, 1300, 1000, 0, 3.1],
      [1, 1310, 1020, 42, -3.1],
    ],
    g = C.ghostAt(samples, 0.5);
  assert.equal(g.x, 1305);
  assert.equal(g.y, 1010);
  assert.equal(g.h, 21);
  assert(Math.abs(g.angle - Math.PI) < 0.05);
  assert.equal(C.ghostAt(samples, 2), null);
  assert.equal(C.fresh({ v: 1, ghost: samples }).ghost.length, 2);
});
test("two bounded AI rivals drive the same circuit through 48 ordered gates without teleporting", () => {
  for (let i = 0; i < 2; i++) {
    const r = K.race();
    for (let t = 0; t < 18000 && !r.done && !r.failed; t++) {
      const old = { x: r.x, y: r.y };
      K.drive(r, 1 / 60, C.rivalInput(K, r, i));
      assert(Math.hypot(r.x - old.x, r.y - old.y) < 2);
    }
    assert(r.done);
    assert.equal(r.gates, 48);
    assert(r.seconds > 90 && r.seconds < 240);
  }
});
test("estate documents have unique physical positions, explicit discovery and persistent non-reward journal entries", () => {
  const d = C.fresh();
  assert.equal(C.CLUES.length, 4);
  assert.equal(new Set(C.CLUES.map((c) => c.id)).size, 4);
  assert(!C.clue(d, "bad"));
  for (const c of C.CLUES) {
    assert(C.clue(d, c.id));
    assert(!C.clue(d, c.id));
  }
  assert.deepEqual(C.fresh(d).clues, d.clues);
});
test("three survival operation machines enforce distinct rescue, ordered repair and live convoy completion conditions", () => {
  const rescue = C.operation("flood");
  for (let i = 0; i < 41; i++)
    C.opStep(rescue, 0.1, { near: true, onFoot: true, using: true });
  assert.equal(rescue.stage, 1);
  for (let i = 0; i < 30; i++)
    C.opStep(rescue, 0.1, {
      near: true,
      onFoot: true,
      using: true,
      ready: false,
    });
  assert(!rescue.paid);
  for (let i = 0; i < 21; i++)
    C.opStep(rescue, 0.1, {
      near: true,
      onFoot: true,
      using: true,
      ready: true,
    });
  assert(rescue.paid);
  assert.equal(C.opStep(rescue, 0.1, { ready: true }), null);
  const repair = C.operation("blackout");
  for (let i = 0; i < 61; i++)
    C.opStep(repair, 0.1, { near: true, onFoot: true, using: true });
  assert(repair.paid);
  assert.equal(repair.stage, 3);
  const convoy = C.operation("convoy");
  C.opStep(convoy, 0.1, { ready: false });
  assert(!convoy.paid);
  assert.equal(C.opStep(convoy, 0.1, { ready: true }), "complete");
  const dead = C.operation("convoy");
  assert.equal(C.opStep(dead, 0.1, { ready: true, alive: false }), "failed");
  assert(!dead.paid);
});
