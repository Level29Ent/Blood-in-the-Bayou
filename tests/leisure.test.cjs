const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  T = require("three");
const C = require("../public/game/leisure-core.js"),
  S = require("../public/game/leisure-scenery.js");
test("three saved business deeds use earned cash once, bounded records and a 20 percent completion bonus", () => {
  const d = C.restore();
  assert.equal(C.buy(d, "golf", 17999), null);
  assert.equal(C.buy(d, "golf", 18000), 0);
  assert.equal(C.buy(d, "golf", 99999), null);
  assert.equal(C.buy(d, "other", 99999), null);
  assert.equal(C.payout(d, "golf", 500), 600);
  assert.equal(C.payout(d, "farm", 500), 500);
  const saved = C.restore(
    JSON.parse(
      JSON.stringify({ ...d, bestGolf: 12, bestKart: 125.5, harvests: 2 }),
    ),
  );
  assert.deepEqual(saved.owned, ["golf"]);
  assert.equal(saved.bestGolf, 12);
  assert.equal(saved.bestKart, 125.5);
  assert.equal(
    C.restore({ v: 1, owned: ["bad"], bestGolf: -1, bestKart: Infinity })
      .bestKart,
    null,
  );
});
test("real rolling golf honors shot power, friction, bunkers, cup capture and the eight-stroke hole cap", () => {
  const g = C.golf();
  assert(!C.shoot(g, NaN, 0.5));
  assert(!C.shoot(g, 0, 2));
  assert(C.shoot(g, 0, 0.6));
  assert(!C.shoot(g, 0, 0.6));
  let frames = 0;
  while (g.moving && frames++ < 2000) C.golfTick(g, 1 / 60);
  assert(!g.moving);
  assert(g.ball.x > 145);
  assert(g.ball.x < 760);
  const a = C.golf(),
    b = C.golf();
  a.ball = { x: 430, y: 320, vx: 100, vy: 0 };
  b.ball = { x: 430, y: 400, vx: 100, vy: 0 };
  a.moving = b.moving = true;
  C.golfTick(a, 1 / 60);
  C.golfTick(b, 1 / 60);
  assert(a.ball.vx < b.ball.vx);
  const cup = C.HOLES[g.hole].cup;
  g.ball = { x: cup.x - 3, y: cup.y, vx: 10, vy: 0 };
  g.strokes = 3;
  g.moving = true;
  assert.equal(C.golfTick(g, 1 / 60), "cup");
  assert.equal(g.total, 3);
  assert.equal(g.hole, 1);
  for (let i = 1; i < 3; i++) {
    g.ball = { x: 70, y: 270, vx: 1, vy: 0 };
    g.strokes = 8;
    g.moving = true;
    C.golfTick(g, 1 / 60);
  }
  assert(g.done);
  assert.equal(g.total, 19);
  assert(!C.shoot(g, 0, 1));
});
test("golf holes are playable from tee to cup with physical stroke simulation", () => {
  const g = C.golf();
  for (let hole = 0; hole < 3; hole++) {
    let safety = 0;
    while (g.hole === hole && !g.done && safety++ < 8) {
      const ball = g.ball,
        cup = C.HOLES[hole].cup,
        distance = Math.hypot(cup.x - ball.x, cup.y - ball.y);
      const power = Math.max(
        0.1,
        Math.min(1, Math.sqrt(2 * 38 * distance) / 240),
      );
      assert(C.shoot(g, Math.atan2(cup.y - ball.y, cup.x - ball.x), power));
      for (let tick = 0; g.moving && tick < 2000; tick++) C.golfTick(g, 1 / 60);
    }
  }
  assert(g.done);
  assert(g.total < 24);
});
test("two-level figure-eight has a 42-unit overpass, continuous gentle ramps and no ribbon cracks", () => {
  const points = C.TRACK;
  assert.equal(points.length, 160);
  const low = points.find(
      (p) => Math.hypot(p.x - 1300, p.y - 1035) < 0.01 && p.h < 1,
    ),
    high = points.find(
      (p) => Math.hypot(p.x - 1300, p.y - 1035) < 0.01 && p.h > 40,
    );
  assert(low && high);
  assert.equal(high.h - low.h, 42);
  for (let i = 0; i < points.length; i++) {
    const a = points[i],
      b = points[(i + 1) % points.length],
      length = Math.hypot(b.x - a.x, b.y - a.y);
    assert(length > 0);
    assert(Math.abs(b.h - a.h) / length < 0.17);
    assert(a.x > 905 && a.x < 1695 && a.y > 790 && a.y < 1280);
  }
  const r = C.race();
  r.index = 70;
  const q = C.nearest({ x: 1300, y: 1035 }, 70);
  assert(q.h > 40, "nearest keeps upper crossing instead of snapping down");
});
test("manual kart input is necessary, walls stop shortcuts, reverse cannot award gates, and timeout has no reward", () => {
  const r = C.race();
  for (let i = 0; i < 120; i++) C.drive(r, 1 / 60);
  assert.equal(r.gates, 0);
  assert.equal(r.speed, 0);
  const p = { x: r.x, y: r.y };
  r.angle += Math.PI / 2;
  for (let i = 0; i < 180; i++) C.drive(r, 1 / 60, { throttle: 1 });
  assert(r.penalty > 0);
  assert.equal(r.gates, 0);
  assert(Math.hypot(r.x - p.x, r.y - p.y) < 50);
  const reverse = C.race();
  for (let i = 0; i < 60; i++) C.drive(reverse, 1 / 60, { throttle: -1 });
  assert.equal(reverse.gates, 0);
  const expired = C.race();
  expired.seconds = 299.999;
  assert.equal(C.drive(expired, 1 / 60), "timeout");
  assert(expired.failed);
  assert(!expired.done);
});
test("driving the actual centerline with steering completes exactly 48 ordered gates and three laps", () => {
  const r = C.race();
  for (let i = 0; i < 18000 && !r.done && !r.failed; i++) {
    const target = C.TRACK[(r.index + 3) % 160],
      angle = Math.atan2(target.y - r.y, target.x - r.x),
      error = Math.atan2(Math.sin(angle - r.angle), Math.cos(angle - r.angle));
    C.drive(r, 1 / 60, {
      throttle: r.speed < 55 ? 1 : 0,
      steer: Math.max(-1, Math.min(1, error * 3)),
    });
  }
  assert(r.done);
  assert.equal(r.gates, 48);
  assert.equal(r.penalty, 0);
  assert(r.seconds > 60 && r.seconds < 300);
  const old = r.seconds;
  assert.equal(C.drive(r, 1 / 60, { throttle: 1 }), null);
  assert.equal(r.seconds, old);
});
test("farm harvesting requires six distinct plots, three uninterrupted held seconds and a delivery stage", () => {
  const h = C.harvest();
  assert(!C.pick(h, 99, 1 / 60, { near: true, onFoot: true, using: true }));
  for (let i = 0; i < 100; i++)
    C.pick(h, 0, 1 / 60, { near: true, onFoot: true, using: true });
  C.pick(h, 0, 1 / 60, { near: false, onFoot: true, using: true });
  assert.equal(h.hold, 0);
  for (let plot = 0; plot < 6; plot++) {
    for (let i = 0; i < 181; i++)
      C.pick(h, plot, 1 / 60, { near: true, onFoot: true, using: true });
    assert.equal(h.claimed.length, plot + 1);
    assert(!C.pick(h, plot, 1 / 60, { near: true, onFoot: true, using: true }));
  }
  assert(h.delivering);
  assert(!h.paid);
  assert(!h.done);
});
test("walk-in doors and counters remain open while walls, district edges and kart fencing block walkers", () => {
  for (const b of Object.values(C.BUILDINGS)) {
    const x = b.x + b.w / 2;
    for (let y = b.y + b.h + 20; y > b.y + b.h - 25; y -= 2)
      assert(!C.blocked(x, y, 8));
    assert(C.blocked(b.x, b.y + b.h / 2, 8));
  }
  for (const p of Object.values(C.SERVICES)) assert(!C.blocked(p.x, p.y, 8));
  assert(C.blocked(1000, 950, 8));
  assert(C.blocked(10, 300, 8));
  for (const h of C.HOLES) {
    assert(!C.blocked(h.tee.x, h.tee.y, 8));
    assert(!C.blocked(h.cup.x, h.cup.y, 8));
  }
});
test("production scenery includes finite shared crops, walk-in business shells, an upward-facing ramp deck and bounded resources", () => {
  const signs = [],
    world = S.build(T, C, (_, text) => signs.push(text));
  assert.deepEqual(world.stats, {
    staticBatches: 27,
    plots: 6,
    holes: 3,
    levels: 2,
  });
  assert.equal(world.roofs.length, 5);
  assert.equal(world.crates.length, 6);
  assert(signs.some((s) => s.includes("FARM MARKET")));
  assert(signs.some((s) => s.includes("KART RENTALS")));
  assert(signs.some((s) => s.includes("PRO SHOP")));
  let lights = 0,
    instances = 0,
    geos = new Set(),
    mats = new Set();
  world.root.traverse((o) => {
    if (o.isLight) lights++;
    if (o.isInstancedMesh) instances += o.count;
    if (o.geometry) {
      geos.add(o.geometry);
      const p = o.geometry.attributes.position;
      for (let i = 0; i < p.array.length; i++)
        assert(Number.isFinite(p.array[i]));
    }
    if (o.material) mats.add(o.material);
  });
  assert.equal(lights, 0);
  assert(instances < 2000);
  assert(geos.size < 40);
  assert(mats.size < 18);
  const deck = world.root.getObjectByName(
      "Continuous ramped two-level circuit",
    ),
    p = deck.geometry.attributes.position,
    index = deck.geometry.index;
  for (let i = 0; i < index.count; i += 3) {
    const a = new T.Vector3().fromBufferAttribute(p, index.getX(i)),
      b = new T.Vector3().fromBufferAttribute(p, index.getX(i + 1)),
      c = new T.Vector3().fromBufferAttribute(p, index.getX(i + 2));
    assert(b.sub(a).cross(c.sub(a)).y > 0);
  }
  assert.equal(world.kart.visible, false);
  assert.equal(world.ball.visible, false);
});

test("crossing the expected gate facing backwards cannot award progress, and malformed ownership imports stay safe", () => {
  const r = C.race(),
    p = C.TRACK[10],
    q = C.TRACK[11];
  r.x = p.x;
  r.y = p.y;
  r.h = p.h;
  r.index = 10;
  r.angle = Math.atan2(q.y - p.y, q.x - p.x) + Math.PI;
  r.speed = 10;
  C.drive(r, 1 / 60, { throttle: 1 });
  assert.equal(r.gates, 0);
  assert.deepEqual(C.restore({ v: 1, owned: { includes: 1 } }).owned, []);
});
