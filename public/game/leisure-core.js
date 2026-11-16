"use strict";
(function () {
  const SIZE = { w: 1840, h: 1400 };
  const BUSINESSES = {
    golf: { name: "CYPRESS LINKS · PRO SHOP", price: 18000 },
    farm: { name: "BELLE RIVE · FARM MARKET", price: 24000 },
    kart: { name: "BAYOU STACKS · KART RENTALS", price: 22000 },
  };
  const BUILDINGS = {
    club: { x: 90, y: 75, w: 430, h: 145 },
    manor: { x: 970, y: 90, w: 290, h: 220 },
    market: { x: 970, y: 450, w: 270, h: 120 },
    garage: { x: 1020, y: 630, w: 340, h: 105 },
    barn: { x: 1500, y: 470, w: 240, h: 160 },
  };
  const SERVICES = {
    golf: { x: 300, y: 188 },
    farm: { x: 1105, y: 538 },
    kart: { x: 1190, y: 703 },
    exit: { x: 850, y: 230 },
  };
  const HOLES = [
    { tee: { x: 145, y: 350 }, cup: { x: 665, y: 370 }, par: 4 },
    { tee: { x: 665, y: 690 }, cup: { x: 145, y: 650 }, par: 4 },
    { tee: { x: 145, y: 1020 }, cup: { x: 665, y: 1090 }, par: 4 },
  ];
  const PLOTS = Array.from({ length: 6 }, (_, i) => ({
    x: 1350 + (i % 3) * 130,
    y: 150 + Math.floor(i / 3) * 145,
    w: 100,
    h: 100,
    crop: ["okra", "corn", "sugarcane"][i % 3],
  }));
  const BUNKERS = [
    { x: 410, y: 305, w: 90, h: 34 },
    { x: 395, y: 710, w: 100, h: 38 },
    { x: 420, y: 975, w: 90, h: 38 },
  ];
  function inside(p, b, pad = 0) {
    return (
      p.x >= b.x - pad &&
      p.x <= b.x + b.w + pad &&
      p.y >= b.y - pad &&
      p.y <= b.y + b.h + pad
    );
  }
  function restore(raw) {
    const d = {
      v: 1,
      owned: [],
      bestGolf: null,
      bestKart: null,
      harvests: 0,
      golfRounds: 0,
      kartRaces: 0,
    };
    if (raw?.v !== 1) return d;
    d.owned = Object.keys(BUSINESSES).filter(
      (k) => Array.isArray(raw.owned) && raw.owned.includes(k),
    );
    for (const k of ["harvests", "golfRounds", "kartRaces"])
      d[k] = Number.isInteger(raw[k])
        ? Math.max(0, Math.min(100000, raw[k]))
        : 0;
    d.bestGolf =
      Number.isInteger(raw.bestGolf) && raw.bestGolf >= 3 && raw.bestGolf <= 24
        ? raw.bestGolf
        : null;
    d.bestKart =
      Number.isFinite(raw.bestKart) && raw.bestKart > 0 && raw.bestKart < 1800
        ? raw.bestKart
        : null;
    return d;
  }
  function buy(d, id, cash) {
    const b = BUSINESSES[id];
    if (!b || d.owned.includes(id) || !Number.isFinite(cash) || cash < b.price)
      return null;
    d.owned.push(id);
    return cash - b.price;
  }
  function payout(d, id, amount) {
    return Math.round(amount * (d.owned.includes(id) ? 1.2 : 1));
  }
  function golf() {
    return {
      hole: 0,
      strokes: 0,
      total: 0,
      ball: { ...HOLES[0].tee, vx: 0, vy: 0 },
      moving: false,
      done: false,
      paid: false,
    };
  }
  function shoot(g, angle, power) {
    if (
      !g ||
      g.done ||
      g.moving ||
      !Number.isFinite(angle) ||
      !Number.isFinite(power) ||
      power < 0.1 ||
      power > 1
    )
      return false;
    g.strokes++;
    g.ball.vx = Math.cos(angle) * power * 240;
    g.ball.vy = Math.sin(angle) * power * 240;
    g.moving = true;
    return true;
  }
  function golfTick(g, dt) {
    if (!g || g.done || !g.moving) return null;
    dt = Math.max(0, Math.min(1 / 30, dt));
    const b = g.ball,
      h = HOLES[g.hole],
      previous = { x: b.x, y: b.y };
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.x < 70 || b.x > 760) {
      b.x = Math.max(70, Math.min(760, b.x));
      b.vx *= -0.5;
    }
    if (b.y < 270 || b.y > 1270) {
      b.y = Math.max(270, Math.min(1270, b.y));
      b.vy *= -0.5;
    }
    const decel = BUNKERS.some((r) => inside(b, r)) ? 150 : 38,
      speed = Math.hypot(b.vx, b.vy),
      scale = Math.max(0, 1 - (decel * dt) / Math.max(0.001, speed));
    b.vx *= scale;
    b.vy *= scale;
    const dx = b.x - previous.x,
      dy = b.y - previous.y,
      t = Math.max(
        0,
        Math.min(
          1,
          ((h.cup.x - previous.x) * dx + (h.cup.y - previous.y) * dy) /
            (dx * dx + dy * dy || 1),
        ),
      ),
      distance = Math.hypot(
        previous.x + dx * t - h.cup.x,
        previous.y + dy * t - h.cup.y,
      );
    if (distance < 7 && speed < 85) {
      g.total += g.strokes;
      g.hole++;
      g.strokes = 0;
      g.moving = false;
      if (g.hole === 3) {
        g.done = true;
        return "complete";
      }
      g.ball = { ...HOLES[g.hole].tee, vx: 0, vy: 0 };
      return "cup";
    }
    if (speed < 2) {
      b.vx = b.vy = 0;
      g.moving = false;
      if (g.strokes >= 8) {
        g.total += 8;
        g.hole++;
        g.strokes = 0;
        if (g.hole === 3) {
          g.done = true;
          return "complete";
        }
        g.ball = { ...HOLES[g.hole].tee, vx: 0, vy: 0 };
        return "limit";
      }
      return "stopped";
    }
    return null;
  }
  function track(count = 160) {
    const raw = Array.from({ length: count }, (_, i) => {
      const t = (i / count) * Math.PI * 2;
      return {
        x: 1300 + 365 * Math.sin(t),
        y: 1035 + 205 * Math.sin(2 * t),
        h: 42 * Math.sin(t / 2) ** 2,
      };
    });
    return raw.slice(10).concat(raw.slice(0, 10));
  }
  const TRACK = track();
  function project(p, a, b) {
    const dx = b.x - a.x,
      dy = b.y - a.y,
      t = Math.max(
        0,
        Math.min(
          1,
          ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy),
        ),
      );
    return { x: a.x + dx * t, y: a.y + dy * t, h: a.h + (b.h - a.h) * t, t };
  }
  function nearest(p, previous = 0) {
    let best = null;
    for (let k = -5; k <= 5; k++) {
      const index = (previous + k + TRACK.length) % TRACK.length,
        a = TRACK[index],
        b = TRACK[(index + 1) % TRACK.length],
        q = project(p, a, b),
        distance = Math.hypot(p.x - q.x, p.y - q.y);
      if (!best || distance < best.distance) best = { ...q, index, distance };
    }
    return best;
  }
  function race() {
    const a = TRACK[0],
      b = TRACK[1];
    return {
      x: a.x,
      y: a.y,
      h: a.h,
      angle: Math.atan2(b.y - a.y, b.x - a.x),
      speed: 0,
      index: 0,
      next: 10,
      gates: 0,
      seconds: 0,
      penalty: 0,
      wallCooldown: 0,
      done: false,
      failed: false,
      paid: false,
    };
  }
  function drive(r, dt, { throttle = 0, steer = 0, brake = false } = {}) {
    if (!r || r.done || r.failed) return null;
    dt = Math.max(0, Math.min(1 / 30, dt));
    r.seconds += dt;
    r.wallCooldown = Math.max(0, r.wallCooldown - dt);
    if (r.seconds >= 300) {
      r.failed = true;
      return "timeout";
    }
    throttle = Math.max(-1, Math.min(1, Number(throttle) || 0));
    steer = Math.max(-1, Math.min(1, Number(steer) || 0));
    r.speed = Math.max(
      -25,
      Math.min(
        95,
        r.speed +
          throttle * 62 * dt -
          Math.sign(r.speed) *
            Math.min(Math.abs(r.speed), (brake ? 160 : 13) * dt),
      ),
    );
    r.angle +=
      steer *
      1.65 *
      dt *
      Math.min(1, Math.abs(r.speed) / 20) *
      Math.sign(r.speed || 1);
    const p = {
        x: r.x + Math.cos(r.angle) * r.speed * dt,
        y: r.y + Math.sin(r.angle) * r.speed * dt,
      },
      q = nearest(p, r.index);
    if (q.distance > 12) {
      r.speed *= 0.35;
      if (!r.wallCooldown) {
        r.penalty += 1;
        r.wallCooldown = 1;
      }
      return "wall";
    }
    r.x = p.x;
    r.y = p.y;
    r.h = q.h;
    r.index = q.index;
    const gate = TRACK[r.next],
      after = TRACK[(r.next + 1) % TRACK.length];
    if (
      r.speed > 0 &&
      Math.cos(r.angle) * (after.x - gate.x) +
        Math.sin(r.angle) * (after.y - gate.y) >
        0 &&
      Math.hypot(r.x - gate.x, r.y - gate.y) < 16 &&
      Math.abs(q.h - gate.h) < 6
    ) {
      r.gates++;
      r.next = (r.next + 10) % TRACK.length;
      if (r.gates >= 48) {
        r.done = true;
        return "complete";
      }
      return r.gates % 16 === 0 ? "lap" : "gate";
    }
    return null;
  }
  function harvest() {
    return {
      claimed: [],
      hold: 0,
      plot: -1,
      delivering: false,
      done: false,
      paid: false,
    };
  }
  function pick(
    h,
    index,
    dt,
    { near = false, onFoot = false, using = false } = {},
  ) {
    if (
      !h ||
      h.done ||
      h.delivering ||
      !Number.isInteger(index) ||
      !PLOTS[index] ||
      h.claimed.includes(index)
    )
      return false;
    if (!near || !onFoot || !using) {
      h.hold = 0;
      h.plot = -1;
      return false;
    }
    if (h.plot !== index) {
      h.plot = index;
      h.hold = 0;
    }
    h.hold += Math.max(0, Math.min(1 / 30, dt));
    if (h.hold < 3) return false;
    h.claimed.push(index);
    h.plot = -1;
    h.hold = 0;
    if (h.claimed.length === 6) h.delivering = true;
    return true;
  }
  function walls() {
    const out = [];
    for (const b of Object.values(BUILDINGS)) {
      const door = 44;
      out.push(
        { x: b.x, y: b.y, w: b.w, h: 3 },
        { x: b.x, y: b.y, w: 3, h: b.h },
        { x: b.x + b.w - 3, y: b.y, w: 3, h: b.h },
        { x: b.x, y: b.y + b.h - 3, w: (b.w - door) / 2, h: 3 },
        {
          x: b.x + (b.w + door) / 2,
          y: b.y + b.h - 3,
          w: (b.w - door) / 2,
          h: 3,
        },
      );
    }
    return out;
  }
  const WALLS = walls();
  function blocked(x, y, r = 8) {
    if (x < 40 + r || x > SIZE.w - 40 - r || y < 40 + r || y > SIZE.h - 40 - r)
      return true;
    if (x + r > 905 && x - r < 1695 && y + r > 790 && y - r < 1280) return true;
    return WALLS.some((b) => {
      const px = Math.max(b.x, Math.min(b.x + b.w, x)),
        py = Math.max(b.y, Math.min(b.y + b.h, y));
      return Math.hypot(x - px, y - py) < r;
    });
  }
  const api = {
    SIZE,
    BUSINESSES,
    BUILDINGS,
    SERVICES,
    HOLES,
    PLOTS,
    BUNKERS,
    TRACK,
    WALLS,
    inside,
    restore,
    buy,
    payout,
    golf,
    shoot,
    golfTick,
    track,
    nearest,
    race,
    drive,
    harvest,
    pick,
    blocked,
  };
  if (typeof module !== "undefined") module.exports = api;
  if (typeof window !== "undefined") window.BayouLeisureCore = api;
})();
