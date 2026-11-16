"use strict";
(function () {
  const C = BayouFieldCore;
  let data = C.restore(),
    job = null,
    owner = null,
    route = [],
    home = null,
    car = null,
    props = null,
    held = false;
  function busy() {
    return !!(
      mpRole ||
      window.level29Leisure?.active ||
      window.level29Operations?.active ||
      window.level29Photo?.active ||
      window.level29Prologue?.active ||
      (mission && mission.phase !== "start") ||
      window.level29Jobs?.active ||
      window.level29CityCareers?.active ||
      window.level29CityStories?.active ||
      window.level29Powell?.active ||
      window.level29Enterprise?.active ||
      window.level29Heists?.active ||
      window.level29SurvivorStories?.active ||
      window.level29StreetActivities?.active ||
      window.level29CityEvents?.dispatch ||
      window.level29Neighborhood?.active ||
      window.level29BayouPolish?.active ||
      window.level29Nola?.active ||
      window.level29NolaActivities?.active ||
      window.level29SurvivalExpansion?.active ||
      window.level29Streamed?.active ||
      window.level29Riverboat?.active ||
      window.level29Park?.active ||
      (window.level29AnthonyStory?.progress?.step > 0 &&
        window.level29AnthonyStory?.progress?.step < 10)
    );
  }
  const panel = document.createElement("dialog");
  panel.id = "fieldBoard";
  panel.className = "bayou-panel";
  panel.setAttribute(
    "aria-label",
    "Bayou field challenges and cosmetic rewards",
  );
  document.body.appendChild(panel);
  let previous = "play";
  function save() {
    window.level29Save?.save();
  }
  function clear() {
    held = false;
    if (job) job.hold = 0;
    mouse.down = false;
    window.level29Bindings?.release();
    if (typeof releaseTouchGesture === "function") releaseTouchGesture();
    for (const k in keys) keys[k] = false;
  }
  function close() {
    if (panel.open) panel.close();
    clear();
    if (state === "pause") state = previous === "pause" ? "play" : previous;
  }
  function text(s) {
    const p = document.createElement("p");
    p.textContent = s;
    panel.appendChild(p);
    return p;
  }
  function button(label, fn) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.onclick = fn;
    panel.appendChild(b);
    return b;
  }
  function show() {
    if (
      !player ||
      player.dead ||
      mpRole ||
      !["play", "pause"].includes(state) ||
      window.level29RuntimeResources?.lost
    )
      return;
    if (!panel.open) previous = state;
    state = "pause";
    clear();
    document.exitPointerLock?.();
    panel.replaceChildren();
    const h = document.createElement("h2");
    h.textContent = "BAYOU FIELD CHALLENGES";
    panel.appendChild(h);
    text(
      "Three free optional solo challenges. First clear pays game cash and unlocks an existing gold wardrobe cosmetic. Repeat runs track best times but pay no cash. No active job is overwritten.",
    );
    text(
      "ANGLER CUP · land 3 real fish in 180 active seconds using existing fishing controls. Lockboxes do not count; ordinary fishing rewards remain. Start beside water.",
    );
    text(
      "ROADSIDE REVIVAL · approach a safely dispatched loaner sedan, hold USE for 4 seconds to repair it, drive that exact car to the garage and stop inside the marked return zone. No teleporting or towing simulation. 6 minute limit.",
    );
    text(
      "SCAVENGER TRAIL · follow 5 different reachable street markers, on foot hold USE for 2 seconds each. The next clue appears after collecting. 10 minute limit.",
    );
    if (job) {
      text(C.DEFS[job.id].name + " · " + Math.ceil(job.remaining) + "s");
      button("CANCEL CHALLENGE · NO REWARD", () => {
        cleanup();
        close();
      });
    } else
      for (const [id, d] of Object.entries(C.DEFS)) {
        text(
          d.name +
            " · " +
            (data.cleared.includes(id)
              ? "CLEARED · PRACTICE"
              : "+$" + d.pay + " FIRST CLEAR") +
            " · " +
            d.cosmetic +
            (data.best[id] ? " · BEST " + data.best[id].toFixed(1) + "s" : ""),
        );
        button("START " + d.name, () => start(id));
      }
    for (const id of data.cleared)
      button("EQUIP " + C.DEFS[id].cosmetic.toUpperCase(), () => {
        grant(C.DEFS[id].reward, true);
        save();
        text(
          "Reward applied to your existing wardrobe. Use outfit view in the city to see it.",
        );
      });
    button("CLOSE / RESUME", close);
    if (!panel.open) panel.showModal();
  }
  panel.addEventListener("cancel", (e) => {
    e.preventDefault();
    close();
  });
  for (const t of [
    "click",
    "pointerdown",
    "pointerup",
    "touchstart",
    "touchend",
    "keydown",
    "keyup",
    "wheel",
  ])
    panel.addEventListener(t, (e) => e.stopPropagation());
  function grant(id, equip = false) {
    const W = window.level29Wardrobe,
      catalog = window.level29WardrobeCatalog;
    if (!W || !catalog) return false;
    const s = W.snapshot,
      item = catalog.catalog.find((i) => i.id === id);
    if (!item) return false;
    return W.restore({
      owned: [...s.owned, id],
      outfit: equip ? { ...s.outfit, [item.category]: id } : s.outfit,
    });
  }
  function near(p, r = 38) {
    return (
      p &&
      player &&
      !player.car &&
      !player.dead &&
      Math.hypot(player.x - p.x, player.y - p.y) < r &&
      Math.abs(terrainHeight(player.x, player.y) - city.heightAt(p.x, p.y)) < 8
    );
  }
  function venuePoint(v) {
    return window.level29NeighborhoodCore?.point(
      v,
      window.level29Navigation?.graph,
      (x, y, r) => !blockedCircle(x, y, r),
      (x, y) => city.heightAt(x, y),
    );
  }
  function clearCar(c, p, a) {
    return (
      level29TrafficClearance.clear(c, p.x, p.y, a, city, tileAt, [1, 9]) &&
      !cars.some(
        (o) => !o.dead && !o.gone && Math.hypot(o.x - p.x, o.y - p.y) < 95,
      )
    );
  }
  function start(id) {
    if (
      !Object.hasOwn(C.DEFS, id) ||
      job ||
      busy() ||
      !player ||
      player.dead ||
      !city?.world ||
      !["play", "pause"].includes(state)
    )
      return text("Finish your current job and start from solo free roam.");
    route = [];
    home = null;
    if (id === "fishing") {
      if (
        window.level29OpenWorld?.fish ||
        !window.level29OpenWorld?.waterSpot?.()
      )
        return text(
          "Stand beside water with no line currently cast. A stopped boat is allowed.",
        );
    } else if (player.car)
      return text("Exit your vehicle before dispatching this job.");
    if (id === "trail") {
      const candidates = level29CampaignMap.points();
      for (const p of candidates) {
        if (
          route.every((q) => Math.hypot(p.x - q.x, p.y - q.y) > 160) &&
          !blockedCircle(p.x, p.y, 12)
        )
          route.push({ ...p });
        if (route.length === 5) break;
      }
      if (route.length < 5)
        return text(
          "Five safe distinct sites are not available. Nothing started.",
        );
    }
    if (id === "recovery") {
      const garage = city.venues.find(
          (v) => v.id === "garage" && !v.mallStore && !v.privateResidence,
        ),
        point = venuePoint(garage);
      if (!point) return text("No safe garage approach available.");
      const probe = makeCar(point.x, point.y, 0, "sedan"),
        candidate = level29CampaignMap
          .points()
          .find(
            (p) =>
              Math.hypot(p.x - point.x, p.y - point.y) > 300 &&
              Math.hypot(p.x - point.x, p.y - point.y) < 2000 &&
              clearCar(probe, p, 0),
          );
      if (!candidate) return text("No clear roadside dispatch.");
      const path = level29NolaActivityCore.route(
        city,
        candidate,
        point,
        [1, 9],
        (x, y) =>
          level29TrafficClearance.clear(probe, x, y, 0, city, tileAt, [1, 9]),
      );
      if (
        !path ||
        path.length < 10 ||
        !clearCar(
          probe,
          path[0],
          Math.atan2(path[1].y - path[0].y, path[1].x - path[0].x),
        )
      )
        return text("No safe drivable garage route.");
      home = path.at(-1);
      route = [path[0], home];
      car = makeCar(
        route[0].x,
        route[0].y,
        Math.atan2(path[1].y - path[0].y, path[1].x - path[0].x),
        "sedan",
      );
      car.fieldRecovery = true;
      car.recoveryJob = true;
      car.quest = true;
      car.hp = Math.max(1, Math.round(car.maxHp * 0.25));
      car.v = car.vs = 0;
      car.ai = null;
      cars.push(car);
    }
    job = C.create(id);
    owner = city;
    close();
    state = "play";
    buildProps();
    toast(
      C.DEFS[id].name +
        " · FOLLOW F · " +
        C.DEFS[id].seconds +
        " ACTIVE SECONDS",
    );
  }
  function releaseProps() {
    if (!props) return;
    props.parent?.remove(props);
    const geos = new Set(),
      mats = new Set();
    props.traverse((o) => {
      if (o.geometry) geos.add(o.geometry);
      if (o.material) mats.add(o.material);
    });
    for (const x of [...geos, ...mats]) x.dispose();
    props = null;
  }
  function buildProps() {
    releaseProps();
    if (!scene || !route.length) return;
    props = new THREE.Group();
    props.name = "Field challenge · owned markers";
    const geo = new THREE.OctahedronGeometry(4),
      material = new THREE.MeshBasicMaterial({ color: "#84cdb1" });
    for (const [i, p] of route.entries()) {
      const m = new THREE.Mesh(geo, material);
      m.visible = i === 0;
      m.position.set(p.x, city.heightAt(p.x, p.y) + 10, p.y);
      props.add(m);
    }
    scene.add(props);
  }
  function cleanup() {
    releaseProps();
    if (car) {
      if (player?.car === car) {
        exitCar(true);
      }
      car.gone = true;
      car.dead = true;
      car.v = car.vs = 0;
      car = null;
    }
    job = null;
    owner = null;
    route = [];
    home = null;
    held = false;
  }
  function target() {
    return job?.id === "trail"
      ? route[job.stage]
      : job?.id === "recovery"
        ? job.stage === 0
          ? car
          : home
        : null;
  }
  function finish() {
    const result = C.settle(data, job);
    if (!result) return;
    cash += result.cash;
    grant(result.reward);
    cleanup();
    save();
    toast(
      result.first
        ? "FIELD CHALLENGE COMPLETE · +$" +
            result.cash +
            " · GOLD COSMETIC UNLOCKED"
        : "PRACTICE COMPLETE · BEST TIME SAVED · NO REPEAT CASH",
    );
  }
  addEventListener("level29:fish-landed", (e) => {
    if (state !== "play" || !job || owner !== city || player.dead || busy())
      return;
    if (C.catchLanded(job, e.detail) && job.ready) finish();
  });
  const service = serviceVenue;
  serviceVenue = function () {
    if (job && near(target())) return;
    return service.apply(this, arguments);
  };
  const enter = enterExit;
  enterExit = function () {
    if (
      job?.id === "recovery" &&
      job.stage === 0 &&
      car &&
      !player.car &&
      Math.hypot(player.x - car.x, player.y - car.y) < 95
    )
      return toast("REPAIR THE DISPATCH SEDAN FIRST · HOLD USE");
    return enter.apply(this, arguments);
  };
  const drive = updateCar;
  updateCar = function (c, input) {
    if (c === car && job?.stage === 0)
      input = { thr: 0, steer: 0, brake: true, boost: false };
    return drive.call(this, c, input);
  };
  const begin = beginMission;
  beginMission = function () {
    if (job) return toast("FINISH OR CANCEL FIELD CHALLENGE FIRST");
    return begin.apply(this, arguments);
  };
  const action = document.createElement("button");
  action.id = "fieldUse";
  action.textContent = "HOLD FIELD USE";
  action.hidden = true;
  action.style.cssText =
    "position:fixed;left:50%;bottom:max(150px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:80;min-height:44px;max-width:85vw;padding:12px;background:#234c42;color:#ffe2ac;border:1px solid #b7b57b;font:12px monospace;touch-action:none";
  document.body.appendChild(action);
  action.onpointerdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    held = true;
    action.setPointerCapture?.(e.pointerId);
  };
  for (const t of ["pointerup", "pointercancel", "lostpointercapture", "blur"])
    action.addEventListener(t, () => {
      held = false;
    });
  action.addEventListener("keydown", (e) => {
    if (["Enter", " "].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      held = true;
    }
  });
  action.addEventListener("keyup", (e) => {
    if (["Enter", " "].includes(e.key)) {
      e.preventDefault();
      held = false;
    }
  });
  const status = document.createElement("aside");
  status.id = "fieldStatus";
  status.setAttribute("role", "status");
  status.hidden = true;
  status.style.cssText =
    "position:fixed;left:12px;bottom:205px;z-index:72;max-width:min(510px,85vw);padding:8px;background:#102d28e8;color:#f3ddaa;font:12px/1.5 monospace;pointer-events:none";
  document.body.appendChild(status);
  const tick = update;
  update = function () {
    if (panel.open) {
      state = "pause";
      action.hidden = status.hidden = true;
      return;
    }
    tick.apply(this, arguments);
    action.hidden = status.hidden = true;
    if (!job) return;
    if (owner !== city || player.dead || busy()) {
      cleanup();
      return;
    }
    if (state !== "play") {
      held = false;
      job.hold = 0;
      return;
    }
    if (car && (car.dead || car.gone || car.hp <= 0)) {
      cleanup();
      toast("RECOVERY VEHICLE LOST · NO REWARD");
      return;
    }
    if (!C.tick(job, 1 / 60, { alive: !player.dead })) {
      cleanup();
      toast("FIELD CHALLENGE EXPIRED");
      return;
    }
    const p = target(),
      at =
        job.id === "recovery" && job.stage === 1
          ? !!car && Math.hypot(car.x - home.x, car.y - home.y) < 50
          : near(p);
    const event = C.work(job, 1 / 60, {
      near: at,
      onFoot: !player.car,
      using: held || !!keys.u || gp.fire,
      drivingTarget: player.car === car,
      stopped: !!car && Math.abs(car.v) < 0.3,
    });
    if (event === "stage" && job.id === "trail")
      toast(
        "CLUE " +
          job.stage +
          " FOUND · NEXT: " +
          (route[job.stage].name || "MARKED CITY APPROACH"),
      );
    if (event === "stage" && car) {
      car.hp = car.maxHp;
      toast("SEDAN REPAIRED · DRIVE THIS CAR TO THE GARAGE F MARKER");
    }
    if (job.ready) {
      finish();
      return;
    }
    if (props)
      props.children.forEach((m, i) => {
        m.visible = i === job.stage;
      });
    action.hidden =
      job.id === "fishing" ||
      (job.id === "recovery" && job.stage === 1) ||
      !near(p);
    status.hidden = false;
    const message =
      C.DEFS[job.id].name +
      " · " +
      Math.ceil(job.remaining) +
      "s · " +
      (job.id === "fishing"
        ? job.catches + "/3 LANDED FISH"
        : job.id === "trail"
          ? "STOP " +
            (job.stage + 1) +
            "/5 · " +
            Math.floor((job.hold / 2) * 100) +
            "%"
          : job.stage === 0
            ? "REPAIR " + Math.floor((job.hold / 4) * 100) + "%"
            : "DRIVE THE LOANER TO GARAGE · STOP TO RETURN");
    if (status.textContent !== message) status.textContent = message;
  };
  const mt = missionTarget;
  missionTarget = function () {
    const p = target();
    return p
      ? { x: p.x, y: p.y, label: "F", col: "#84cdb1" }
      : mt.apply(this, arguments);
  };
  const killed = killPlayer;
  killPlayer = function () {
    cleanup();
    return killed.apply(this, arguments);
  };
  const build = buildCity;
  buildCity = function () {
    cleanup();
    return build.apply(this, arguments);
  };
  const startGameBase = startGame;
  startGame = function () {
    if (panel.open) close();
    cleanup();
    data = C.restore();
    return startGameBase.apply(this, arguments);
  };
  addEventListener("blur", () => {
    held = false;
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) held = false;
  });
  window.level29Field = {
    show,
    start,
    cancel: cleanup,
    get active() {
      return job;
    },
    get snapshot() {
      return C.restore(data);
    },
    restore(raw) {
      data = C.restore(raw);
    },
    get car() {
      return car;
    },
  };
})();
