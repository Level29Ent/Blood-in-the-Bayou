"use strict";
(function () {
  const C = BayouPursuitsCore;
  let active = null,
    owner = null,
    points = null,
    props = null,
    person = null,
    foes = [],
    van = null,
    held = false,
    blackoutMaterials = [],
    nightHour = null;
  const names = {
    flood: "FLOODED PORCH · RESCUE",
    blackout: "HOSPITAL BLACKOUT",
    convoy: "NIGHT RELIEF CONVOY",
  };
  function busy() {
    return !!(
      mpRole ||
      window.level29Field?.active ||
      window.level29Leisure?.active ||
      window.level29Prologue?.active ||
      (mission && mission.phase !== "start") ||
      window.level29Jobs?.active ||
      window.level29Powell?.active ||
      window.level29CityStories?.active ||
      window.level29CityCareers?.active ||
      window.level29SurvivorStories?.active ||
      window.level29Enterprise?.active ||
      window.level29Heists?.active ||
      window.level29StreetActivities?.active ||
      window.level29CityEvents?.dispatch ||
      window.level29Neighborhood?.active ||
      window.level29Nola?.active ||
      window.level29NolaActivities?.active ||
      window.level29SurvivalExpansion?.active ||
      window.level29Streamed?.active ||
      window.level29Riverboat?.active ||
      window.level29Park?.active ||
      window.level29BayouPolish?.active ||
      (window.level29AnthonyStory?.progress?.step > 0 &&
        window.level29AnthonyStory?.progress?.step < 10)
    );
  }
  const dialog = document.createElement("dialog");
  dialog.id = "survivalOperations";
  dialog.className = "bayou-panel";
  dialog.setAttribute("aria-label", "Optional survival operations");
  document.body.appendChild(dialog);
  let previous = "play";
  function clear() {
    mouse.down = false;
    held = false;
    window.level29Bindings?.release();
    for (const k in keys) keys[k] = false;
  }
  function close() {
    if (dialog.open) dialog.close();
    clear();
    if (state === "pause") state = previous === "pause" ? "play" : previous;
  }
  function line(t) {
    const n = document.createElement("p");
    n.textContent = t;
    dialog.appendChild(n);
    return n;
  }
  function button(t, fn) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = t;
    b.onclick = fn;
    dialog.appendChild(b);
    return b;
  }
  function show() {
    if (
      mpRole ||
      !player ||
      player.dead ||
      !["play", "pause"].includes(state) ||
      window.level29RuntimeResources?.lost
    )
      return;
    if (!dialog.open) previous = state;
    state = "pause";
    clear();
    document.exitPointerLock?.();
    dialog.replaceChildren();
    const h = document.createElement("h2");
    h.textContent = "BAYOU SURVIVAL DISPATCH";
    dialog.appendChild(h);
    line(
      "Three optional solo operations at existing city approaches. No fee. First completion pays $1,500 / $1,800 / $2,200 respectively; repeats are practice with no cash. Other active jobs block dispatch. Death, cancellation, blocked routes or timeout pay nothing.",
    );
    line(
      "Flooded porch: breach a stranded resident’s exterior shelter, escort them on foot to hospital triage; the resident can be hurt and waits if separated. The flood is a local cosmetic water surface, not a new swimming simulation.",
    );
    line(
      "Blackout: repair three outside hospital switch boxes in order while infected threaten the street. The hospital’s emissive lighting is temporarily dimmed and restored on cleanup; geometry and services remain intact.",
    );
    line(
      "Convoy: approach the marked departure, escort an actual collision-checked moving relief van to the hospital at night. Stay within 300 units to keep it moving; destroyed/blocked van or timeout fails. No teleport/rail movement.",
    );
    if (active) {
      line(names[active.id] + " · " + Math.ceil(active.seconds) + "s");
      button("CANCEL OPERATION · NO PAY", () => {
        cleanup();
        close();
      });
    } else
      for (const id of Object.keys(names))
        button(
          names[id] +
            (window.level29Pursuits.data.operations.includes(id)
              ? " · PRACTICE"
              : " · FIRST-CLEAR REWARD"),
          () => start(id),
        );
    button("PHOTO MODE · FREE ROAM ONLY", () => {
      close();
      window.level29Photo?.open();
    });
    button("CLOSE / RESUME", close);
    if (!dialog.open) dialog.showModal();
  }
  dialog.addEventListener("cancel", (e) => {
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
    dialog.addEventListener(t, (e) => e.stopPropagation());
  function point(v) {
    return window.level29NeighborhoodCore?.point(
      v,
      window.level29Navigation?.graph,
      (x, y, r) => !blockedCircle(x, y, r),
      (x, y) => city.heightAt(x, y),
    );
  }
  function resolve(id) {
    const hospital = (city.venues || []).find(
        (v) => v.id === "hospital" && !v.mallStore && !v.privateResidence,
      ),
      home = (city.neighborhood?.homes || []).find((b) => !b.apartment),
      base = point(hospital);
    if (!base) return null;
    if (id === "flood") {
      if (!home) return null;
      const pickup = point({
        doorX: home.x + home.w / 2,
        doorY: home.y + home.h,
        frontage: { dx: 0, dy: 1 },
      });
      if (!pickup || Math.hypot(pickup.x - base.x, pickup.y - base.y) > 4500)
        return null;
      const route = level29NolaActivityCore.route(
        city,
        pickup,
        base,
        [1, 2, 9],
        (x, y) => !blockedCircle(x, y, 8),
      );
      if (!route?.length) return null;
      return { hospital, home, pickup, base, route };
    }
    if (id === "blackout") {
      const boxes = [];
      for (const offset of [-96, 0, 96]) {
        const v = {
            doorX: hospital.doorX + offset,
            doorY: hospital.doorY + 48,
            frontage: { dx: 0, dy: 1 },
          },
          p = point(v);
        if (p && boxes.every((q) => Math.hypot(q.x - p.x, q.y - p.y) > 24))
          boxes.push(p);
      }
      return boxes.length === 3 ? { hospital, base, boxes } : null;
    }
    const car = makeCar(base.x, base.y, 0, "van"),
      candidates = level29CampaignMap
        .points()
        .filter(
          (p) =>
            Math.hypot(p.x - base.x, p.y - base.y) > 350 &&
            Math.hypot(p.x - base.x, p.y - base.y) < 1800,
        );
    for (const departure of candidates) {
      const route = level29NolaActivityCore.route(
        city,
        departure,
        base,
        [1, 9],
        (x, y) =>
          level29TrafficClearance.clear(car, x, y, 0, city, tileAt, [1, 9]),
      );
      if (!route || route.length < 12 || route.length > 120) continue;
      const a = route[0],
        b = route[1],
        angle = Math.atan2(b.y - a.y, b.x - a.x);
      if (
        !level29TrafficClearance.clear(
          car,
          a.x,
          a.y,
          angle,
          city,
          tileAt,
          [1, 9],
        ) ||
        cars.some(
          (c) => !c.gone && !c.dead && Math.hypot(c.x - a.x, c.y - a.y) < 100,
        )
      )
        continue;
      return { hospital, base, pickup: route[0], route };
    }
    return null;
  }
  function start(id) {
    if (!Object.hasOwn(names, id)) return false;
    if (active || busy() || !city?.world || player.dead || player.car)
      return line(
        "Finish the current job, exit interiors/vehicle and play solo first.",
      );
    const route = resolve(id);
    if (!route)
      return line(
        "No safe operation route in this city. Nothing started or charged.",
      );
    points = route;
    owner = city;
    active = C.operation(id);
    active.walker = null;
    active.pathIndex = 1;
    close();
    state = "play";
    props = new THREE.Group();
    props.name = "Optional survival operation · owned props";
    scene.add(props);
    const mat = new THREE.MeshStandardMaterial({
        color: "#cba665",
        roughness: 0.8,
      }),
      box = new THREE.BoxGeometry(10, 8, 8);
    for (const p of route.boxes || [route.pickup || route.base]) {
      const m = new THREE.Mesh(box, mat);
      m.position.set(p.x, city.heightAt(p.x, p.y) + 4, p.y);
      props.add(m);
    }
    if (id === "flood") {
      const water = new THREE.Mesh(
        new THREE.PlaneGeometry(route.home.w + 20, 50),
        new THREE.MeshBasicMaterial({
          color: "#3d6f7a",
          transparent: true,
          opacity: 0.65,
          depthWrite: false,
        }),
      );
      water.rotation.x = -Math.PI / 2;
      water.position.set(
        route.home.x + route.home.w / 2,
        0.5,
        route.home.y + route.home.h,
      );
      props.add(water);
    }
    if (id === "convoy" || id === "blackout") {
      nightHour = level29TimeOfDay.hour;
      level29TimeOfDay.setHour(22);
    }
    toast(names[id] + " · FOLLOW O · HOLD INTERACT AT THE OBJECTIVE");
  }
  function disposeOwned(g) {
    if (!g) return;
    g.parent?.remove(g);
    const geos = new Set(),
      mats = new Set();
    g.traverse((o) => {
      if (o.geometry) geos.add(o.geometry);
      if (o.material) mats.add(o.material);
    });
    for (const x of [...geos, ...mats]) x.dispose();
  }
  function cleanup() {
    for (const z of foes)
      if (z.alive) {
        z.alive = false;
        z.killSource = "ambient";
      }
    foes = [];
    disposeOwned(props);
    props = null;
    if (person) {
      level29RuntimePolicy.figureOwnership(person);
      level29RuntimePolicy.disposeOwned(person);
      person = null;
    }
    if (van) {
      van.gone = true;
      van.dead = true;
      van.v = 0;
      van = null;
    }
    for (const [mesh, original] of blackoutMaterials) {
      for (const m of Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material])
        if (m && ![].concat(original).includes(m)) m.dispose();
      mesh.material = original;
    }
    blackoutMaterials = [];
    if (nightHour !== null) {
      level29TimeOfDay.setHour(nightHour);
      nightHour = null;
    }
    active = null;
    points = null;
    owner = null;
    held = false;
  }
  function darken() {
    const root = points.hospital.mesh;
    if (!root) return;
    root.traverse((mesh) => {
      if (!mesh.material) return;
      const original = mesh.material,
        make = (m) => {
          const clone = m.clone();
          if (clone.emissive) clone.emissive.set(0);
          return clone;
        };
      mesh.material = Array.isArray(original)
        ? original.map(make)
        : make(original);
      blackoutMaterials.push([mesh, original]);
    });
  }
  function spawnNear(p) {
    if (foes.length) return;
    for (let i = 0; i < 3; i++) {
      const q = randomRoadPoint(p.x, p.y, 100, 180);
      if (
        q &&
        Math.hypot(q.x - p.x, q.y - p.y) < 220 &&
        window.level29UFO?.eligible(city, q)
      ) {
        const z = spawnZombieAt(q.x, q.y, i === 2 ? "runner" : "walker");
        if (z) {
          z.alert = true;
          z.storyOperation = "optional-survival";
          foes.push(z);
        }
      }
    }
  }
  function target() {
    if (!active || !points) return null;
    if (active.id === "flood")
      return active.stage === 0 ? points.pickup : points.base;
    if (active.id === "blackout") return points.boxes[active.stage];
    return van ? { x: van.x, y: van.y } : points.pickup;
  }
  function near(p, r = 40) {
    return (
      p &&
      !player.car &&
      Math.hypot(player.x - p.x, player.y - p.y) < r &&
      Math.abs(terrainHeight(player.x, player.y) - city.heightAt(p.x, p.y)) < 8
    );
  }
  function step(dt) {
    if (!active) return;
    if (active.id === "flood" && active.stage === 1) {
      const a = active.walker,
        p = player.car || player,
        d = Math.hypot(a.x - p.x, a.y - p.y);
      if (d > 35 && d < 300 && !player.car) {
        const goal = level29Navigation.graph?.goal(a, p.x, p.y);
        if (goal) {
          const dx = goal.x - a.x,
            dy = goal.y - a.y,
            len = Math.hypot(dx, dy),
            amount = Math.min(len, dt * 65),
            x = a.x + (dx / (len || 1)) * amount,
            y = a.y + (dy / (len || 1)) * amount;
          if (!blockedCircle(x, y, 8)) {
            a.x = x;
            a.y = y;
            a.angle = Math.atan2(dy, dx);
            a.anim += amount * 0.15;
          }
        }
      }
      for (const z of zombies)
        if (z.alive && Math.hypot(z.x - a.x, z.y - a.y) < 24) a.hp -= dt * 8;
      if (a.hp <= 0) {
        toast("RESIDENT LOST · OPERATION FAILED");
        cleanup();
        return;
      }
      poseFigure(person, a.x, a.y, a.angle, a.anim, "walk");
      person.position.y = city.heightAt(a.x, a.y);
    }
    if (active.id === "convoy") {
      if (
        !van &&
        Math.hypot(player.x - points.pickup.x, player.y - points.pickup.y) < 120
      ) {
        const p = points.route[0],
          q = points.route[1];
        if (
          cars.some(
            (c) => !c.dead && !c.gone && Math.hypot(c.x - p.x, c.y - p.y) < 90,
          )
        ) {
          toast("DEPARTURE BLOCKED · CLEAR THE ROAD");
        } else {
          van = makeCar(p.x, p.y, Math.atan2(q.y - p.y, q.x - p.x), "van");
          van.pursuitsConvoy = true;
          van.quest = true;
          van.hp = van.maxHp = 450;
          cars.push(van);
        }
      }
      if (van) {
        if (van.dead || van.hp <= 0) {
          toast("RELIEF VAN LOST");
          cleanup();
          return;
        }
        const q = points.route[active.pathIndex];
        if (q && Math.hypot(van.x - q.x, van.y - q.y) < 22) active.pathIndex++;
        if (active.pathIndex > points.route.length / 2) spawnNear(van);
      }
    }
    const p = target(),
      onFoot = !player.car,
      using = held || !!keys.u || gp.fire,
      ready =
        active.id === "flood"
          ? active.walker &&
            Math.hypot(
              active.walker.x - points.base.x,
              active.walker.y - points.base.y,
            ) < 55
          : active.id === "convoy" &&
            van &&
            active.pathIndex >= points.route.length &&
            Math.hypot(van.x - points.base.x, van.y - points.base.y) < 120 &&
            Math.hypot(player.x - van.x, player.y - van.y) < 150;
    const event = C.opStep(active, dt, {
      near: near(p),
      onFoot,
      using,
      ready,
      alive: !player.dead,
    });
    if (event === "stage" && active.id === "flood") {
      person = makeFigure(false);
      person.name = "Flood rescue resident";
      setFigureColors(person, "#a97b58", "#74948b", "#3b4b59");
      scene.add(person);
      active.walker = {
        x: points.pickup.x,
        y: points.pickup.y,
        hp: 100,
        angle: 0,
        anim: 0,
      };
      spawnNear(points.pickup);
      toast(
        "RESIDENT FOLLOWS ON FOOT · KEEP WITHIN 300 UNITS · RETURN TO HOSPITAL",
      );
    }
    if (event === "stage" && active.id === "blackout")
      toast("SWITCH REPAIRED · NEXT O MARKER");
    if (event === "complete") {
      const id = active.id,
        d = level29Pursuits.data,
        first = !d.operations.includes(id);
      if (first) {
        d.operations.push(id);
        cash += { flood: 1500, blackout: 1800, convoy: 2200 }[id];
      }
      cleanup();
      level29Pursuits.save();
      toast(
        first
          ? "OPERATION COMPLETE · FIRST-CLEAR PAYMENT SAVED"
          : "PRACTICE COMPLETE · NO REPEAT CASH",
      );
    } else if (event === "failed") {
      cleanup();
      toast("OPERATION EXPIRED · NO PAY");
    }
  }
  const drive = updateCar;
  updateCar = function (car, input) {
    if (active?.id === "convoy" && car === van) {
      const q = points.route[active.pathIndex],
        escort = Math.hypot(player.x - car.x, player.y - car.y) < 300,
        blocked =
          cars.some(
            (c) =>
              c !== car &&
              !c.dead &&
              !c.gone &&
              Math.hypot(c.x - car.x, c.y - car.y) < 75,
          ) || !level29TrafficClearance.sweep(car, city, tileAt, [1, 9], 40);
      input = q
        ? level29NolaActivityCore.steer(car, q, blocked || !escort)
        : { thr: 0, steer: 0, brake: true, boost: false };
      if (car.v > 1) input.thr = 0;
      const old = { x: car.x, y: car.y, a: car.a };
      const r = drive.call(this, car, input);
      if (
        !level29TrafficClearance.clear(
          car,
          car.x,
          car.y,
          car.a,
          city,
          tileAt,
          [1, 9],
        )
      ) {
        Object.assign(car, old);
        car.v = car.vs = 0;
      }
      return r;
    }
    return drive.apply(this, arguments);
  };
  const enter = enterExit;
  enterExit = function () {
    if (
      van &&
      !player.car &&
      Math.hypot(player.x - van.x, player.y - van.y) < 110
    )
      return toast("RELIEF VAN · ESCORT VEHICLE, NOT A RENTAL");
    return enter.apply(this, arguments);
  };
  const begin = beginMission;
  beginMission = function () {
    if (active) return toast("FINISH OR CANCEL SURVIVAL OPERATION FIRST");
    return begin.apply(this, arguments);
  };
  const use = serviceVenue;
  serviceVenue = function () {
    if (active && near(target())) return;
    return use.apply(this, arguments);
  };
  const buttonUse = document.createElement("button");
  buttonUse.id = "operationUse";
  buttonUse.textContent = "HOLD OPERATION USE";
  buttonUse.hidden = true;
  document.body.appendChild(buttonUse);
  buttonUse.onpointerdown = (e) => {
    e.stopPropagation();
    held = true;
    buttonUse.setPointerCapture?.(e.pointerId);
  };
  for (const t of ["pointerup", "pointercancel", "lostpointercapture", "blur"])
    buttonUse.addEventListener(t, () => {
      held = false;
    });
  buttonUse.addEventListener("keydown", (e) => {
    if (["Enter", " "].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      held = true;
    }
  });
  buttonUse.addEventListener("keyup", (e) => {
    if (["Enter", " "].includes(e.key)) {
      e.preventDefault();
      held = false;
    }
  });
  const mt = missionTarget;
  missionTarget = function () {
    const p = target();
    return p ? { ...p, label: "O", col: "#e9b77a" } : mt.apply(this, arguments);
  };
  const tick = update;
  update = function () {
    if (dialog.open) {
      state = "pause";
      buttonUse.hidden = true;
      return;
    }
    tick.apply(this, arguments);
    buttonUse.hidden = true;
    if (!active) return;
    if (owner !== city || player.dead || busy()) {
      cleanup();
      return;
    }
    if (state !== "play") {
      held = false;
      return;
    }
    if (active.id === "blackout") {
      if (!blackoutMaterials.length) darken();
      if (Math.hypot(player.x - points.base.x, player.y - points.base.y) < 220)
        spawnNear(points.base);
    }
    step(1 / 60);
    buttonUse.hidden = !active || !near(target());
  };
  const build = buildCity;
  buildCity = function () {
    cleanup();
    return build.apply(this, arguments);
  };
  const newGame = startGame;
  startGame = function () {
    cleanup();
    return newGame.apply(this, arguments);
  };
  const kill = killPlayer;
  killPlayer = function () {
    cleanup();
    return kill.apply(this, arguments);
  };
  const draw = render;
  render = function () {
    draw.apply(this, arguments);
    if (active && state === "play") {
      cx.save();
      cx.font = "12px monospace";
      cx.fillStyle = "#f2d4a2";
      cx.fillText(
        names[active.id] +
          " · " +
          Math.ceil(active.seconds) +
          "s" +
          (active.walker
            ? " · RESIDENT " + Math.ceil(active.walker.hp) + " HP"
            : ""),
        12,
        SH - 180,
      );
      cx.restore();
    }
  };
  addEventListener("blur", () => {
    held = false;
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) held = false;
  });
  window.level29Operations = {
    show,
    start,
    closeBoard: close,
    get active() {
      return active;
    },
    get busy() {
      return busy();
    },
    cancel: cleanup,
  };
})();
