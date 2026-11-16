"use strict";
(function () {
  const CROPS = {
    okra: { seed: 15, seconds: 60, price: 30 },
    corn: { seed: 25, seconds: 90, price: 50 },
    cane: { seed: 40, seconds: 120, price: 80 },
  };
  const UPGRADES = {
    golf: { name: "Clubhouse workshop", cost: 4000 },
    farm: { name: "Irrigation and packing benches", cost: 5000 },
    kart: { name: "Timing and pit workshop", cost: 6000 },
  };
  const CLUES = [
    {
      id: "manifest",
      x: 1100,
      y: 130,
      title: "Sam’s shipping ledger",
      text: "Sam: The riverboat manifest lists six cold-chain crates for Belle Rive. Somebody changed the destination to X29. Compare the dates with Ahmad’s lab notes.",
    },
    {
      id: "lab",
      x: 1220,
      y: 255,
      title: "Ahmad’s field notebook",
      text: "Ahmad: Okra and cane shipments were cover for refrigerated samples. The trial did not start in the swamp. Preserve the ledger; Ronnie needs proof, not rumors.",
    },
    {
      id: "radio",
      x: 1650,
      y: 545,
      title: "Ronnie’s recorded radio transcript",
      text: "Ronnie: I sent drivers to the old estate after Sam’s call. Keep the market open for survivors. Nobody moves another X29 crate through this town.",
    },
    {
      id: "letter",
      x: 1070,
      y: 485,
      title: "Market relief letter",
      text: "The market crew: We used the last delivery to feed the evacuation line. Sam kept the records, Ahmad kept the samples, and Ronnie kept the road open. Leave a copy for whoever comes next.",
    },
  ];
  function fresh(raw) {
    const d = {
      v: 1,
      upgrades: { golf: 0, farm: 0, kart: 0 },
      contracts: { golf: 0, farm: 0, kart: 0 },
      plots: Array.from({ length: 6 }, () => null),
      inventory: { okra: 0, corn: 0, cane: 0 },
      clues: [],
      operations: [],
      tournaments: 0,
      ghost: [],
    };
    if (raw?.v !== 1) return d;
    for (const k of Object.keys(UPGRADES)) {
      d.upgrades[k] = Math.max(
        0,
        Math.min(3, Number.isInteger(raw.upgrades?.[k]) ? raw.upgrades[k] : 0),
      );
      d.contracts[k] = Math.max(
        0,
        Math.min(
          100000,
          Number.isInteger(raw.contracts?.[k]) ? raw.contracts[k] : 0,
        ),
      );
    }
    for (const [i, p] of (Array.isArray(raw.plots) ? raw.plots : [])
      .slice(0, 6)
      .entries())
      if (p && Object.hasOwn(CROPS, p.crop))
        d.plots[i] = {
          crop: p.crop,
          watered: p.watered === true,
          age: Math.max(0, Math.min(CROPS[p.crop].seconds, Number(p.age) || 0)),
        };
    for (const k of Object.keys(CROPS))
      d.inventory[k] = Math.max(
        0,
        Math.min(
          999,
          Number.isInteger(raw.inventory?.[k]) ? raw.inventory[k] : 0,
        ),
      );
    d.clues = CLUES.map((c) => c.id).filter(
      (id) => Array.isArray(raw.clues) && raw.clues.includes(id),
    );
    d.operations = ["flood", "blackout", "convoy"].filter(
      (id) => Array.isArray(raw.operations) && raw.operations.includes(id),
    );
    d.tournaments = Math.max(
      0,
      Math.min(100000, Number.isInteger(raw.tournaments) ? raw.tournaments : 0),
    );
    if (
      Array.isArray(raw.ghost) &&
      raw.ghost.length >= 2 &&
      raw.ghost.length <= 620
    ) {
      let previous = -1;
      const valid = raw.ghost.every((q) => {
        if (
          !Array.isArray(q) ||
          q.length !== 5 ||
          !q.every(Number.isFinite) ||
          q[0] <= previous ||
          q[0] < 0 ||
          q[0] > 310 ||
          q[1] < 900 ||
          q[1] > 1700 ||
          q[2] < 780 ||
          q[2] > 1290 ||
          q[3] < 0 ||
          q[3] > 45 ||
          Math.abs(q[4]) > 1e6
        )
          return false;
        previous = q[0];
        return true;
      });
      if (valid) d.ghost = raw.ghost.map((q) => q.slice());
    }
    return d;
  }
  function upgrade(d, id, owned, cash) {
    if (!Object.hasOwn(UPGRADES, id) || !owned || d.upgrades[id] >= 3)
      return null;
    const cost = UPGRADES[id].cost * (d.upgrades[id] + 1);
    if (!Number.isFinite(cash) || cash < cost) return null;
    d.upgrades[id]++;
    return cash - cost;
  }
  function bonus(d, id, amount) {
    return Math.round(amount * (1 + 0.05 * (d.upgrades[id] || 0)));
  }
  function plant(d, index, crop, cash) {
    if (
      !Number.isFinite(cash) ||
      !Number.isInteger(index) ||
      index < 0 ||
      index > 5 ||
      d.plots[index] ||
      !Object.hasOwn(CROPS, crop) ||
      cash < CROPS[crop].seed
    )
      return null;
    d.plots[index] = { crop, watered: false, age: 0 };
    return cash - CROPS[crop].seed;
  }
  function water(d, index) {
    if (!d.plots[index] || d.plots[index].watered) return false;
    d.plots[index].watered = true;
    return true;
  }
  function grow(d, dt) {
    dt = Math.max(0, Math.min(0.1, dt));
    for (const p of d.plots)
      if (p?.watered)
        p.age = Math.min(
          CROPS[p.crop].seconds,
          p.age + dt * (1 + d.upgrades.farm * 0.15),
        );
  }
  function harvest(d, index) {
    const p = d.plots[index];
    if (
      !p ||
      !p.watered ||
      p.age < CROPS[p.crop].seconds ||
      d.inventory[p.crop] > 996
    )
      return false;
    d.inventory[p.crop] += 3;
    d.plots[index] = null;
    return true;
  }
  function sell(d, crop, buyer) {
    if (
      !Object.hasOwn(CROPS, crop) ||
      !["market", "clubhouse"].includes(buyer) ||
      d.inventory[crop] < 1
    )
      return 0;
    const qty = d.inventory[crop];
    d.inventory[crop] = 0;
    return Math.round(
      qty *
        CROPS[crop].price *
        (buyer === "clubhouse" && crop === "okra"
          ? 1.2
          : buyer === "market" && crop === "cane"
            ? 1.15
            : 1),
    );
  }
  function clue(d, id) {
    if (!CLUES.some((c) => c.id === id) || d.clues.includes(id)) return false;
    d.clues.push(id);
    return true;
  }
  const CONTRACTS = {
    golf: [
      { x: 150, y: 350, label: "Inspect tee markers" },
      { x: 665, y: 370, label: "Service flagstick" },
      { x: 300, y: 188, label: "Return pro-shop tools" },
    ],
    farm: [
      { x: 1510, y: 540, label: "Collect barn packing crates" },
      { x: 1400, y: 200, label: "Inspect crop row" },
      { x: 1105, y: 538, label: "Deliver packing crates" },
    ],
    kart: [
      { x: 950, y: 765, label: "Inspect spectator fence" },
      { x: 1500, y: 755, label: "Inspect eastern safety board" },
      { x: 1190, y: 703, label: "Return timing kit" },
    ],
  };
  function contract(id) {
    return Object.hasOwn(CONTRACTS, id)
      ? { id, stage: 0, hold: 0, paid: false, failed: false, seconds: 240 }
      : null;
  }
  function work(
    job,
    dt,
    { near = false, onFoot = false, using = false, alive = true } = {},
  ) {
    if (!job || job.paid || job.failed) return null;
    dt = Math.max(0, Math.min(0.1, dt));
    job.seconds -= dt;
    if (!alive || job.seconds <= 0) {
      job.failed = true;
      return "failed";
    }
    if (!near || !onFoot || !using) {
      job.hold = 0;
      return null;
    }
    job.hold += dt;
    if (job.hold < 2) return null;
    job.hold = 0;
    job.stage++;
    if (job.stage === 3) {
      job.paid = true;
      return "complete";
    }
    return "stage";
  }
  function sample(samples, r) {
    if (samples.length >= 620) return;
    if (!samples.length || r.seconds - samples[samples.length - 1][0] >= 0.5)
      samples.push([
        +r.seconds.toFixed(2),
        +r.x.toFixed(2),
        +r.y.toFixed(2),
        +r.h.toFixed(2),
        +r.angle.toFixed(3),
      ]);
  }
  function ghostAt(samples, time) {
    if (!samples.length || time > samples[samples.length - 1][0]) return null;
    let lo = 0,
      hi = samples.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (samples[mid][0] < time) lo = mid + 1;
      else hi = mid;
    }
    const b = samples[lo],
      a = samples[Math.max(0, lo - 1)],
      t = Math.max(0, Math.min(1, (time - a[0]) / (b[0] - a[0] || 1))),
      angle =
        a[4] + Math.atan2(Math.sin(b[4] - a[4]), Math.cos(b[4] - a[4])) * t;
    return {
      x: a[1] + (b[1] - a[1]) * t,
      y: a[2] + (b[2] - a[2]) * t,
      h: a[3] + (b[3] - a[3]) * t,
      angle,
    };
  }
  function rivalInput(C, r, index) {
    const p = C.TRACK[(r.index + 3) % C.TRACK.length],
      angle = Math.atan2(p.y - r.y, p.x - r.x),
      error = Math.atan2(Math.sin(angle - r.angle), Math.cos(angle - r.angle)),
      target = [45, 52][index % 2];
    return {
      throttle: r.speed < target ? 1 : 0,
      steer: Math.max(-1, Math.min(1, error * 3)),
      brake: Math.abs(error) > 1 && r.speed > 30,
    };
  }
  function operation(id) {
    return ["flood", "blackout", "convoy"].includes(id)
      ? {
          id,
          stage: 0,
          hold: 0,
          seconds: id === "convoy" ? 360 : 300,
          paid: false,
          failed: false,
        }
      : null;
  }
  function opStep(
    op,
    dt,
    {
      near = false,
      using = false,
      onFoot = false,
      ready = false,
      alive = true,
    } = {},
  ) {
    if (!op || op.paid || op.failed) return null;
    dt = Math.max(0, Math.min(0.1, dt));
    op.seconds -= dt;
    if (!alive || op.seconds <= 0) {
      op.failed = true;
      return "failed";
    }
    if (op.id === "convoy") {
      if (!ready) return null;
      op.paid = true;
      return "complete";
    }
    if (!near || !onFoot || !using) {
      op.hold = 0;
      return null;
    }
    if (op.id === "flood" && op.stage === 1 && !ready) {
      op.hold = 0;
      return null;
    }
    op.hold += dt;
    if (op.hold < (op.id === "flood" && op.stage === 0 ? 4 : 2)) return null;
    op.hold = 0;
    op.stage++;
    if (op.stage === (op.id === "flood" ? 2 : 3)) {
      op.paid = true;
      return "complete";
    }
    return "stage";
  }
  const api = {
    CROPS,
    UPGRADES,
    CLUES,
    CONTRACTS,
    fresh,
    upgrade,
    bonus,
    plant,
    water,
    grow,
    harvest,
    sell,
    clue,
    contract,
    work,
    sample,
    ghostAt,
    rivalInput,
    operation,
    opStep,
  };
  if (typeof module !== "undefined") module.exports = api;
  if (typeof window !== "undefined") window.BayouPursuitsCore = api;
})();
