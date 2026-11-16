"use strict";
(function () {
  const DEFS = {
    fishing: {
      name: "BAYOU ANGLER CUP",
      seconds: 180,
      pay: 600,
      reward: "headwear-3-2",
      cosmetic: "Gold Bucket Hat",
    },
    recovery: {
      name: "ROADSIDE REVIVAL",
      seconds: 360,
      pay: 900,
      reward: "shoes-1-2",
      cosmetic: "Gold Work Boots",
    },
    trail: {
      name: "FIVE-PARISH SCAVENGER TRAIL",
      seconds: 600,
      pay: 1000,
      reward: "tops-2-2",
      cosmetic: "Gold Varsity Jacket",
    },
  };
  function restore(raw) {
    const d = {
      v: 1,
      cleared: [],
      best: { fishing: null, recovery: null, trail: null },
    };
    if (raw?.v !== 1) return d;
    d.cleared = Object.keys(DEFS).filter(
      (id) => Array.isArray(raw.cleared) && raw.cleared.includes(id),
    );
    for (const id of Object.keys(DEFS)) {
      const n = raw.best?.[id];
      if (Number.isFinite(n) && n > 0 && n <= DEFS[id].seconds) d.best[id] = n;
    }
    return d;
  }
  function create(id) {
    return Object.hasOwn(DEFS, id)
      ? {
          id,
          remaining: DEFS[id].seconds,
          elapsed: 0,
          stage: 0,
          hold: 0,
          catches: 0,
          lastCatch: 0,
          ready: false,
          failed: false,
          paid: false,
        }
      : null;
  }
  function tick(job, dt, { alive = true } = {}) {
    if (!job || job.failed || job.paid || job.ready) return false;
    dt = Math.max(0, Math.min(0.1, dt));
    job.remaining -= dt;
    job.elapsed += dt;
    if (!alive || job.remaining <= 0) {
      job.failed = true;
      return false;
    }
    return true;
  }
  function catchLanded(job, { name, sequence } = {}) {
    if (
      !job ||
      job.id !== "fishing" ||
      job.failed ||
      job.paid ||
      job.ready ||
      name === "Sealed dockside lockbox" ||
      typeof name !== "string" ||
      !Number.isInteger(sequence) ||
      sequence <= job.lastCatch
    )
      return false;
    job.lastCatch = sequence;
    job.catches++;
    if (job.catches === 3) job.ready = true;
    return true;
  }
  function work(
    job,
    dt,
    {
      near = false,
      onFoot = false,
      using = false,
      drivingTarget = false,
      stopped = false,
    } = {},
  ) {
    if (!job || job.failed || job.paid || job.ready || job.id === "fishing")
      return null;
    if (job.id === "recovery" && job.stage === 1) {
      if (near && drivingTarget && stopped) {
        job.ready = true;
        return "ready";
      }
      return null;
    }
    if (!near || !onFoot || !using) {
      job.hold = 0;
      return null;
    }
    job.hold += Math.max(0, Math.min(0.1, dt));
    if (job.hold < (job.id === "recovery" ? 4 : 2)) return null;
    job.hold = 0;
    job.stage++;
    if (job.id === "trail" && job.stage === 5) {
      job.ready = true;
      return "ready";
    }
    return "stage";
  }
  function settle(data, job) {
    if (!job || !job.ready || job.failed || job.paid) return null;
    job.paid = true;
    const first = !data.cleared.includes(job.id);
    if (first) data.cleared.push(job.id);
    data.best[job.id] = Math.min(
      data.best[job.id] ?? Infinity,
      job.elapsed || 0.01,
    );
    return {
      cash: first ? DEFS[job.id].pay : 0,
      reward: DEFS[job.id].reward,
      first,
    };
  }
  const api = { DEFS, restore, create, tick, catchLanded, work, settle };
  if (typeof module !== "undefined") module.exports = api;
  if (typeof window !== "undefined") window.BayouFieldCore = api;
})();
