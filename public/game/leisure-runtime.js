"use strict";
(function () {
  const daylight = new THREE.Color("#a9c2d4");
  const C = BayouLeisureCore,
    ORIGIN = { x: 24000, y: 26000 };
  let data = C.restore(),
    active = false,
    owner = null,
    world = null,
    home = null,
    root = null,
    hidden = new Map(),
    shuttle = null,
    shuttleCity = null,
    shuttleSign = null,
    session = null,
    cooldown = { golf: 0, farm: 0, kart: 0 },
    clock = 0,
    held = false,
    notice = "",
    noticeUntil = 0,
    tracked = "exit";
  const extensions=[];
  const input = { throttle: 0, steer: 0, brake: false };
  function note(t) {
    notice = t;
    noticeUntil = clock + 7;
    toast(t);
  }
  function save() {
    window.level29Save?.save();
  }
  function local() {
    return { x: player.x - ORIGIN.x, y: player.y - ORIGIN.y };
  }
  function at(p, r = 40) {
    return (
      !!player &&
      !player.car &&
      !player.dead &&
      Math.hypot(local().x - p.x, local().y - p.y) < r
    );
  }
  function busy() {
    return !!(
      window.level29Field?.active ||
      window.level29Pursuits?.operation ||
      mpRole ||
      window.level29Prologue?.active ||
      (mission && mission.phase !== "start") ||
      window.level29Jobs?.active ||
      window.level29Powell?.active ||
      window.level29CityStories?.active ||
      window.level29CityStories?.cutscene ||
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
  function dispose(g) {
    if (!g) return;
    g.parent?.remove(g);
    const geos = new Set(),
      mats = new Set(),
      textures = new Set();
    g.traverse((o) => {
      if (o.geometry) geos.add(o.geometry);
      for (const m of Array.isArray(o.material) ? o.material : [o.material])
        if (m) {
          mats.add(m);
          for (const value of Object.values(m))
            if (value?.isTexture) textures.add(value);
        }
    });
    for (const x of [...textures, ...mats, ...geos]) x.dispose();
  }
  function clearInput() {
    held = false;
    if (session?.id === "farm") {
      session.game.hold = 0;
      session.game.plot = -1;
    }
    input.throttle = input.steer = 0;
    input.brake = false;
    mouse.down = false;
    window.level29Bindings?.release();
    if (typeof releaseTouchGesture === "function") releaseTouchGesture();
    for (const k in keys) keys[k] = false;
  }
  function resolveShuttle() {
    if (shuttleCity === city) return;
    shuttleCity = city;
    shuttle = null;
    dispose(shuttleSign);
    shuttleSign = null;
    if (!city?.world) return;
    const venues = (city.venues || []).filter(
      (v) =>
        !v.privateResidence &&
        !v.mallStore &&
        v.id === "business" &&
        !v.storyRole,
    );
    for (const v of venues) {
      const p = window.level29NeighborhoodCore?.point(
        v,
        window.level29Navigation?.graph,
        (x, y, r) => !blockedCircle(x, y, r),
        (x, y) => city.heightAt(x, y),
      );
      if (p) {
        shuttle = { ...p, name: v.name };
        break;
      }
    }
    if (shuttle && cityGroup) {
      shuttleSign = new THREE.Group();
      shuttleSign.name = "Leisure shuttle · city pickup";
      cityGroup.add(shuttleSign);
      addSign(
        shuttleSign,
        "CYPRESS GROUNDS SHUTTLE · GOLF / FARM / KARTS",
        180,
        12,
        shuttle.x,
        27,
        shuttle.y,
        "#edcf83",
      );
    }
  }
  function nearShuttle() {
    return (
      !!shuttle &&
      !!player &&
      !player.dead &&
      !player.car &&
      Math.hypot(player.x - shuttle.x, player.y - shuttle.y) < 35 &&
      Math.abs(terrainHeight(player.x, player.y) - shuttle.base) < 8
    );
  }
  function isolate() {
    for (const node of scene.children) {
      if (node === root || node.isLight || node.isCamera) continue;
      if (!hidden.has(node)) hidden.set(node, node.visible);
      node.visible = false;
    }
  }
  function enter() {
    resolveShuttle();
    if (
      active ||
      !nearShuttle() ||
      busy() ||
      !["play", "pause"].includes(state)
    ) {
      note("SHUTTLE · FINISH CURRENT JOB, ARRIVE ON FOOT AND USE THE PICKUP");
      return false;
    }
    clearInput();
    home = {
      x: player.x,
      y: player.y,
      yaw: view.yaw,
      pitch: view.pitch,
      objective,
      heat,
      showMap,
      lighting: {
        background: scene.background,
        fog: scene.fog
          ? {
              color: scene.fog.color.clone(),
              near: scene.fog.near,
              far: scene.fog.far,
            }
          : null,
        hemi: typeof hemi === "undefined" ? null : hemi.intensity,
        sun:
          typeof sun === "undefined"
            ? null
            : { intensity: sun.intensity, color: sun.color.clone() },
      },
    };
    owner = city;
    session = null;
    world = BayouLeisureScenery.build(THREE, C, addSign);
    root = world.root;
    root.position.set(ORIGIN.x, 0, ORIGIN.y);
    scene.add(root);
    active = true;
    document.body.classList.add("leisure-away");
    player.x = ORIGIN.x + 850;
    player.y = ORIGIN.y + 265;
    player.vx = player.vy = 0;
    view.yaw = Math.PI / 2;
    view.pitch = 0;
    view.lastPlayer = player;
    view.lastCar = null;
    view.look = 0;
    showMap = false;
    heat = 0;
    objective = "CYPRESS LEISURE GROUNDS · GOLF / ESTATE FARM / KART RENTALS";
    isolate();
    for(const extension of extensions)extension.enter?.();
    note(
      "SHUTTLE ARRIVED · VISIT THE THREE WALK-IN BUSINESSES · NO FEE TO EXPLORE",
    );
    return true;
  }
  function leave() {
    if (!active) return;
    for(const extension of extensions)extension.leave?.();
    close();
    clearInput();
    session = null;
    active = false;
    for (const [node, visible] of hidden) node.visible = visible;
    hidden.clear();
    dispose(root);
    root = null;
    world = null;
    document.body.classList.remove("leisure-away");
    if (player && home) {
      player.x = home.x;
      player.y = home.y;
      player.vx = player.vy = 0;
      view.yaw = home.yaw;
      view.pitch = home.pitch;
      objective = home.objective;
      heat = home.heat;
      showMap = home.showMap;
    }
    if (home?.lighting) {
      const l = home.lighting;
      scene.background = l.background;
      if (l.fog && scene.fog) {
        scene.fog.color.copy(l.fog.color);
        scene.fog.near = l.fog.near;
        scene.fog.far = l.fog.far;
      }
      if (l.hemi !== null && typeof hemi !== "undefined")
        hemi.intensity = l.hemi;
      if (l.sun && typeof sun !== "undefined") {
        sun.intensity = l.sun.intensity;
        sun.color.copy(l.sun.color);
      }
      if (typeof lightMode !== "undefined") lightMode = "";
    }
    home = null;
    owner = null;
    guidance.hidden = true;
    state = "play";
    snapCamera();
    save();
    note(
      "RETURNED TO CITY · ACTIVITIES ENDED, BUSINESS DEEDS AND RECORDS SAVED",
    );
  }
  const dialog = document.createElement("dialog");
  dialog.id = "leisureDialog";
  dialog.className = "bayou-panel";
  dialog.setAttribute(
    "aria-label",
    "Cypress Leisure Grounds activities and businesses",
  );
  document.body.appendChild(dialog);
  let previous = "play";
  function close() {
    if (dialog.open) dialog.close();
    if (active && state === "pause") state = "play";
    else if (!active && state === "pause")
      state = previous === "pause" ? "play" : previous;
    clearInput();
  }
  function text(t) {
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
  function start(id) {
    if (!Object.hasOwn(C.BUSINESSES, id)) return false;
    if (
      !active ||
      session || extensions.some(e=>e.busy?.()) ||
      !at(C.SERVICES[id]) ||
      player.dead ||
      clock < cooldown[id]
    )
      return note(
        "VISIT THE MATCHING COUNTER ON FOOT · FINISH CURRENT ACTIVITY OR WAIT FOR COOLDOWN",
      );
    const fee = id === "golf" ? 50 : id === "kart" ? 100 : 0;
    if (cash < fee) return note("NOT ENOUGH GAME CASH");
    cash -= fee;
    if (id === "golf")
      session = {
        id,
        game: C.golf(),
        aim: Math.atan2(
          C.HOLES[0].cup.y - C.HOLES[0].tee.y,
          C.HOLES[0].cup.x - C.HOLES[0].tee.x,
        ),
        power: 0.6,
      };
    if (id === "golf") power.value = "60";
    if (id === "farm") session = { id, game: C.harvest() };
    if (id === "kart") session = { id, game: C.race() };
    for(const extension of extensions)extension.start?.(session);
    close();
    save();
    note(
      id === "golf"
        ? "GOLF STARTED · FOLLOW WHITE BALL / USE SWING CONTROLS"
        : id === "farm"
          ? "HARVEST SHIFT · HOLD HARVEST AT EACH OF SIX PLOTS, THEN RETURN TO MARKET"
          : "KART RACE · MANUAL STEERING · 3 LAPS · WALL TOUCH +1s · 5 MINUTE LIMIT",
    );
  }
  function finish(id, amount) {
    if (!session || session.game.paid) return;
    session.game.paid = true;
    for(const extension of extensions)amount=extension.finish?.(session,amount)??amount;
    const pay = C.payout(data, id, amount);
    cash += pay;
    if (id === "golf") {
      data.golfRounds++;
      data.bestGolf = Math.min(data.bestGolf ?? 99, session.game.total);
    }
    if (id === "kart") {
      data.kartRaces++;
      const time = session.game.seconds + session.game.penalty;
      data.bestKart = Math.min(data.bestKart ?? Infinity, time);
    }
    if (id === "farm") data.harvests++;
    session = null;
    cooldown[id] = clock + 60;
    clearInput();
    save();
    note(
      "ACTIVITY COMPLETE · +$" +
        pay +
        (data.owned.includes(id) ? " · OWNER BONUS INCLUDED" : "") +
        " · 60 ACTIVE-SECOND REBOOK COOLDOWN",
    );
  }
  function navigation() {
    if (session?.id === "golf")
      return { point: session.game.ball, label: "GOLF BALL" };
    if (session?.id === "farm") {
      if (session.game.delivering)
        return { point: C.SERVICES.farm, label: "DELIVER TO MARKET" };
      const index = C.PLOTS.findIndex(
          (_, i) => !session.game.claimed.includes(i),
        ),
        plot = C.PLOTS[index];
      return plot
        ? {
            point: { x: plot.x + plot.w / 2, y: plot.y + plot.h / 2 },
            label: "PLOT " + (index + 1) + " · " + plot.crop.toUpperCase(),
          }
        : null;
    }
    if (session?.id === "kart")
      return { point: C.TRACK[session.game.next], label: "NEXT KART GATE" };
    return {
      point: C.SERVICES[tracked] || C.SERVICES.exit,
      label:
        tracked === "exit"
          ? "RETURN SHUTTLE"
          : C.BUSINESSES[tracked]?.name || "RETURN SHUTTLE",
    };
  }
  function confirmAbandon(action) {
    if (!session) return action();
    dialog.replaceChildren();
    text(
      "END " +
        session.id.toUpperCase() +
        "? Entry fees are not refunded and unfinished progress will be lost. Completed records and deeds stay saved.",
    );
    button("KEEP PLAYING", close);
    button("CONFIRM · END ACTIVITY", action);
  }
  function recover() {
    if (!active || session?.id !== "kart") return;
    if (!C.recoverKart(session.game))
      return text(
        "Slow to walking speed (below 2 km/h) before resetting. No reset or penalty applied.",
      );
    const r = session.game;
    player.x = ORIGIN.x + r.x;
    player.y = ORIGIN.y + r.y;
    view.yaw = r.angle;
    close();
    note("KART RESET TO LAST CHECKPOINT · +5s PENALTY · LAP PROGRESS KEPT");
  }
  function show() {
    if (
      window.level29RuntimeResources?.lost ||
      !player ||
      player.dead ||
      !["play", "pause"].includes(state) ||
      mpRole
    )
      return;
    if (!dialog.open) previous = state;
    clearInput();
    document.exitPointerLock?.();
    state = "pause";
    dialog.replaceChildren();
    const h = document.createElement("h2");
    h.textContent = "CYPRESS LEISURE GROUNDS";
    dialog.appendChild(h);
    if (!active) {
      resolveShuttle();
      text(
        "A separate solo destination: three-hole golf, Belle Rive plantation estate with working farmland, and a real two-level figure-eight kart track. Ride the explicit shuttle; your original city and outdoor activity timers stay paused during the visit.",
      );
      if (shuttle) {
        text(
          "PICKUP · " +
            shuttle.name +
            " · " +
            Math.round(
              Math.hypot(player.x - shuttle.x, player.y - shuttle.y) / 10,
            ) +
            "m",
        );
        button("TRACK SHUTTLE · L MARKER", () => {
          window.level29Nola?.setWaypoint({ ...shuttle, color: "#a9d19b" });
          close();
        });
        if (nearShuttle())
          button("BOARD SHUTTLE · FREE", () => {
            close();
            enter();
          });
      } else
        text(
          "No safe shuttle approach available in this world. No destination or charge has been forced.",
        );
    } else {
      text(
        "Explore on foot; meet the pro shop, produce market and kart-rental counters. Museum-style plantation manor and barn are walk-in. The fenced circuit is kart-only; rental puts you safely on the starting grid. All prices/rewards use earned fictional game cash.",
      );
      text(
        "CASH $" +
          Math.floor(cash) +
          " · GOLF BEST " +
          (data.bestGolf ?? "—") +
          " · KART BEST " +
          (data.bestKart ? data.bestKart.toFixed(1) + "s" : "—") +
          " · HARVEST SHIFTS " +
          data.harvests,
      );
      text(
        "NAVIGATION · Choose a business to see its live distance and relative direction. Active activities automatically guide you to the ball, next plot or checkpoint.",
      );
      for (const [id, point] of Object.entries(C.SERVICES)) {
        const label = id === "exit" ? "RETURN SHUTTLE" : C.BUSINESSES[id].name,
          g = C.guidance(local(), point, view.yaw);
        const trackButton = button(
          "TRACK " + label + " · " + g.metres + "m",
          () => {
            tracked = id;
            close();
          },
        );
        trackButton.disabled = !!session;
      }
      for (const [id, b] of Object.entries(C.BUSINESSES)) {
        text(
          b.name +
            (at(C.SERVICES[id])
              ? " · AT COUNTER"
              : " · WALK TO " +
                (id === "golf"
                  ? "PRO SHOP: NORTHWEST"
                  : id === "farm"
                    ? "MARKET: EAST-CENTER"
                    : "KART RENTALS: SOUTHEAST")),
        );
        const booking = button(
          id === "golf"
            ? "PLAY THREE HOLES · $50"
            : id === "farm"
              ? "WORK SIX-PLOT HARVEST · FREE"
              : "RENT KART · THREE-LAP TIME TRIAL · $100",
          () => start(id),
        );
        const fee = id === "golf" ? 50 : id === "kart" ? 100 : 0;
        const reason = session
          ? "Finish or cancel your current activity."
          : !at(C.SERVICES[id])
            ? "Walk to this business counter."
            : clock < cooldown[id]
              ? "Reopens in " +
                Math.ceil(cooldown[id] - clock) +
                " active seconds."
              : cash < fee
                ? "Need $" + fee + " game cash."
                : "";
        booking.disabled = !!reason;
        if (reason) text(reason);
        if (!data.owned.includes(id))
          button("BUY " + id.toUpperCase() + " BUSINESS · $" + b.price, () => {
            if (!at(C.SERVICES[id]) || session)
              return text("Visit this counter and finish the activity first.");
            const balance = C.buy(data, id, cash);
            if (balance === null)
              return text("Not enough game cash or deed already owned.");
            cash = balance;
            save();
            show();
            text(
              "DEED SAVED · 20% bonus on completed activities at this business. No passive income or real-money purchase.",
            );
          });
        else text("OWNED · +20% on completed local activities.");
      }
      if (session) {
        text(
          "ACTIVE · " +
            session.id.toUpperCase() +
            " · CANCEL/LEAVE forfeits its entry fee and unfinished reward.",
        );
        if (session.id === "kart") button("RESET STUCK KART · +5s", recover);
        button("CANCEL ACTIVITY · NO REFUND", () =>
          confirmAbandon(() => {
            if (session?.id === "kart") {
              player.x = ORIGIN.x + C.SERVICES.kart.x;
              player.y = ORIGIN.y + C.SERVICES.kart.y;
            }
            session = null;
            clearInput();
            show();
          }),
        );
      }
      text(
        "Farmland: six crop plots (okra, corn, sugarcane). Hold HARVEST for three seconds at each plot, then deliver at the market for $450. Golf: aim/power controls, physical rolling ball and bunkers, eight strokes maximum per hole; finish all three for $150–$600. Karts: accelerate/steer/brake yourself through all checkpoints; three laps pay $600. Deeds add 20%.",
      );
      button("RETURN SHUTTLE · END CURRENT ACTIVITY", () =>
        confirmAbandon(leave),
      );
    }
    for(const extension of extensions)extension.board?.({text,button,close});
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
  const controls = document.createElement("div");
  controls.id = "leisureControls";
  controls.hidden = true;
  document.body.appendChild(controls);
  const guidance = document.createElement("aside");
  guidance.id = "leisureGuidance";
  guidance.hidden = true;
  guidance.setAttribute("aria-label", "Activity navigation and progress");
  document.body.appendChild(guidance);
  const destination = document.createElement("p"),
    detail = document.createElement("p"),
    eventStatus = document.createElement("p");
  eventStatus.setAttribute("role", "status");
  guidance.appendChild(destination);
  guidance.appendChild(detail);
  guidance.appendChild(eventStatus);
  function setText(node, value) {
    if (node.textContent !== value) node.textContent = value;
  }
  const menu = document.createElement("button");
  menu.type = "button";
  menu.textContent = "GROUNDS / BUSINESSES";
  menu.onclick = show;
  controls.appendChild(menu);
  const useButton = document.createElement("button");
  useButton.type = "button";
  useButton.textContent = "USE / HARVEST";
  useButton.onclick = (e) => {
    e.stopPropagation();
    use();
  };
  controls.appendChild(useButton);
  for (const t of ["pointerdown", "touchstart"])
    useButton.addEventListener(t, (e) => {
      e.stopPropagation();
      held = true;
    });
  for (const t of [
    "pointerup",
    "pointercancel",
    "touchend",
    "touchcancel",
    "mouseleave",
  ])
    useButton.addEventListener(t, () => {
      held = false;
    });
  useButton.addEventListener("keydown", (e) => {
    if (["Enter", " "].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      if (!e.repeat) {
        held = true;
        if (session?.id !== "farm") use();
      }
    }
  });
  useButton.addEventListener("keyup", (e) => {
    if (["Enter", " "].includes(e.key)) {
      e.preventDefault();
      held = false;
    }
  });
  useButton.addEventListener("blur", () => {
    held = false;
  });
  const shot = document.createElement("div");
  shot.id = "leisureGolfControls";
  controls.appendChild(shot);
  const aim = document.createElement("input");
  aim.type = "range";
  aim.min = "-180";
  aim.max = "180";
  aim.step = "1";
  aim.setAttribute("aria-label", "Golf aim angle in degrees");
  const power = document.createElement("input");
  power.type = "range";
  power.min = "10";
  power.max = "100";
  power.value = "60";
  power.setAttribute("aria-label", "Golf shot power percent");
  for (const [label, input] of [
    ["Golf aim", aim],
    ["Shot power", power],
  ]) {
    const l = document.createElement("label");
    l.textContent = label;
    l.appendChild(input);
    shot.appendChild(l);
  }
  aim.oninput = () => {
    if (session?.id === "golf")
      session.aim = (Number(aim.value) * Math.PI) / 180;
  };
  power.oninput = () => {
    if (session?.id === "golf") session.power = Number(power.value) / 100;
  };
  const swing = document.createElement("button");
  swing.textContent = "SWING";
  swing.onclick = () => swingBall();
  shot.appendChild(swing);
  const aimCup = document.createElement("button");
  aimCup.type = "button";
  aimCup.textContent = "AIM AT CUP";
  aimCup.onclick = () => {
    if (state !== "play" || session?.id !== "golf" || session.game.moving)
      return;
    const b = session.game.ball,
      cup = C.HOLES[session.game.hole].cup;
    session.aim = Math.atan2(cup.y - b.y, cup.x - b.x);
    aim.value = String(Math.round((session.aim * 180) / Math.PI));
  };
  shot.appendChild(aimCup);
  const shotReadout = document.createElement("output");
  shotReadout.setAttribute("aria-label", "Golf shot settings");
  shot.appendChild(shotReadout);
  const driveControls = document.createElement("div");
  driveControls.id = "leisureDriveControls";
  controls.appendChild(driveControls);
  for (const [label, key, value] of [
    ["LEFT", "steer", -1],
    ["ACCELERATE", "throttle", 1],
    ["RIGHT", "steer", 1],
    ["BRAKE", "brake", true],
    ["REVERSE", "throttle", -1],
  ]) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.onpointerdown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      input[key] = value;
      b.setPointerCapture?.(e.pointerId);
    };
    for (const t of ["pointerup", "pointercancel", "lostpointercapture"])
      b.addEventListener(t, () => {
        input[key] = key === "brake" ? false : 0;
      });
    b.addEventListener("keydown", (e) => {
      if (!["Enter", " "].includes(e.key)) return;
      e.preventDefault();
      e.stopPropagation();
      if (active && state === "play" && session?.id === "kart")
        input[key] = value;
    });
    const release = () => {
      input[key] = key === "brake" ? false : 0;
    };
    b.addEventListener("keyup", (e) => {
      if (["Enter", " "].includes(e.key)) {
        e.preventDefault();
        release();
      }
    });
    b.addEventListener("blur", release);
    driveControls.appendChild(b);
  }
  for (const t of [
    "pointerdown",
    "pointerup",
    "click",
    "touchstart",
    "touchend",
    "wheel",
  ])
    controls.addEventListener(t, (e) => e.stopPropagation());
  function swingBall() {
    if (!active || state !== "play" || session?.id !== "golf") return;
    const g = session.game;
    if (Math.hypot(local().x - g.ball.x, local().y - g.ball.y) > 35)
      return note("WALK TO THE WHITE BALL BEFORE SWINGING");
    if (C.shoot(g, session.aim, session.power))
      note("STROKE " + g.strokes + " · WATCH THE BALL");
  }
  function use() {
    if (state !== "play" || !player || player.dead) return false;
    if (!active) {
      resolveShuttle();
      if (nearShuttle()) {
        show();
        return true;
      }
      return false;
    }
    if (session?.id === "golf") {
      swingBall();
      return true;
    }
    if (
      session?.id === "farm" &&
      session.game.delivering &&
      at(C.SERVICES.farm)
    ) {
      finish("farm", 450);
      return true;
    }
    if (session?.id === "farm") {
      note(
        "HOLD HARVEST / YOUR INTERACT KEY AT AN UNHARVESTED PLOT FOR 3 SECONDS",
      );
      return true;
    }
    if (Object.values(C.SERVICES).some((p) => at(p))) {
      show();
      return true;
    }
    return true;
  }
  const service = serviceVenue;
  serviceVenue = function () {
    if (use()) return;
    return service.apply(this, arguments);
  };
  const vehicle = enterExit;
  enterExit = function () {
    if (active) {
      use();
      return;
    }
    return vehicle.apply(this, arguments);
  };
  const firing = fireWeapon;
  fireWeapon = function () {
    if (active) return;
    return firing.apply(this, arguments);
  };
  const mt = missionTarget;
  missionTarget = function () {
    if (!active) return mt.apply(this, arguments);
    const p = extensions.map(e=>e.target?.()).find(Boolean)||navigation()?.point;
    return p
      ? { x: ORIGIN.x + p.x, y: ORIGIN.y + p.y, label: "L", col: "#a9d19b" }
      : null;
  };
  const markers = extraBlips;
  extraBlips = function () {
    if (active) return [];
    const out = markers.apply(this, arguments);
    if (shuttle) out.push({ ...shuttle, label: "L", col: "#a9d19b" });
    return out;
  };
  const terrain = terrainHeight;
  terrainHeight = function (x, y) {
    if (
      active &&
      x >= ORIGIN.x &&
      x <= ORIGIN.x + C.SIZE.w &&
      y >= ORIGIN.y &&
      y <= ORIGIN.y + C.SIZE.h
    )
      return session?.id === "kart" &&
        Math.hypot(x - player.x, y - player.y) < 80
        ? session.game.h + 1
        : 0;
    return terrain.apply(this, arguments);
  };
  const block = blockedCircle;
  blockedCircle = function (x, y, r) {
    if (active) return C.blocked(x - ORIGIN.x, y - ORIGIN.y, r);
    return block.apply(this, arguments);
  };
  const startGameBase = startGame;
  startGame = function () {
    if (active) leave();
    clock = 0;
    cooldown = { golf: 0, farm: 0, kart: 0 };
    tracked = "exit";
    data = C.restore();
    return startGameBase.apply(this, arguments);
  };
  const build = buildCity;
  buildCity = function () {
    if (active) leave();
    shuttleCity = null;
    const result = build.apply(this, arguments);
    resolveShuttle();
    return result;
  };
  const priorOpen = window.level29UX?.open;
  if (priorOpen)
    window.level29UX.open = function () {
      if (active) return show();
      return priorOpen.apply(this, arguments);
    };
  const priorMap = window.level29Nola?.openMap;
  if (priorMap)
    window.level29Nola.openMap = function () {
      if (active) return show();
      return priorMap.apply(this, arguments);
    };
  const tick = update;
  update = function () {
    if (dialog.open) {
      guidance.hidden = true;
      state = "pause";
      controls.hidden = true;
      held = false;
      return;
    }
    if (!active) {
      guidance.hidden = true;
      tick.apply(this, arguments);
      controls.hidden = !nearShuttle();
      menu.hidden = !active;
      useButton.hidden = false;
      shot.hidden = true;
      driveControls.hidden = true;
      useButton.textContent = "LEISURE SHUTTLE · BOARD / INFO";
      if (player && city?.world && shuttleCity !== city && builtCity === city)
        resolveShuttle();
      return;
    }
    guidance.hidden = state !== "play";
    menu.hidden = false;
    useButton.textContent =
      session?.id === "farm" ? "USE / HOLD HARVEST" : "USE / SWING";
    controls.hidden = !["play", "pause"].includes(state);
    useButton.hidden = state !== "play";
    shot.hidden = state !== "play" || session?.id !== "golf";
    driveControls.hidden = state !== "play" || session?.id !== "kart";
    if (owner !== city || player.dead) {
      leave();
      return;
    }
    if (window.level29RuntimeResources?.lost) return;
    pollPad();
    document
      .getElementById("joyZone")
      ?.classList.toggle("live", state === "play");
    if (typeof coarse !== "undefined")
      joyEl.style.display = coarse && state === "play" ? "block" : "none";
    if (state !== "play") {
      held = false;
      return;
    }
    frame++;
    clock += 1 / 60;
    for(const extension of extensions)extension.tick?.(1/60);
    if (toastQ && --toastQ.life <= 0) toastQ = null;
    if (session?.id === "kart") {
      const r = session.game,
        event = C.drive(r, 1 / 60, {
          throttle:
            input.throttle ||
            Math.max(-1, Math.min(1, Number(kU()) - Number(kD()) + stick.y)),
          steer:
            input.steer ||
            Math.max(-1, Math.min(1, Number(kR()) - Number(kL()) + stick.x)),
          brake: input.brake || keys[" "] || gp.brake,
        });
      player.x = ORIGIN.x + r.x;
      player.y = ORIGIN.y + r.y;
      player.vx = player.vy = 0;
      view.yaw = r.angle;
      if (event === "complete") {
        player.x = ORIGIN.x + C.SERVICES.kart.x;
        player.y = ORIGIN.y + C.SERVICES.kart.y;
        finish("kart", 600);
      } else if (event === "timeout") {
        session = null;
        player.x = ORIGIN.x + C.SERVICES.kart.x;
        player.y = ORIGIN.y + C.SERVICES.kart.y;
        note("TIME TRIAL EXPIRED · NO REWARD");
      }
    } else {
      const fw = Math.max(
          -1,
          Math.min(1, Number(kU()) - Number(kD()) + stick.y),
        ),
        side = Math.max(
          -1,
          Math.min(
            1,
            Number(keys.d || touch.right || false) -
              Number(keys.a || touch.left || false) +
              stick.x,
          ),
        ),
        n = Math.max(1, Math.hypot(fw, side)),
        speed = keys.shift ? 3.3 : 2.3;
      player.vx =
        ((Math.cos(view.yaw) * fw + Math.cos(view.yaw + Math.PI / 2) * side) *
          speed) /
        n;
      player.vy =
        ((Math.sin(view.yaw) * fw + Math.sin(view.yaw + Math.PI / 2) * side) *
          speed) /
        n;
      moveCircle(player, player.vx, player.vy, player.r);
      player.anim += (Math.abs(fw) + Math.abs(side)) * 0.2;
      if (session?.id === "golf") {
        const event = C.golfTick(session.game, 1 / 60);
        if (event === "complete")
          finish(
            "golf",
            Math.max(150, 600 - Math.max(0, session.game.total - 12) * 30),
          );
        else if (event === "cup" || event === "limit") {
          const h = C.HOLES[session.game.hole];
          session.aim = Math.atan2(h.cup.y - h.tee.y, h.cup.x - h.tee.x);
          note(
            event === "cup"
              ? "HOLED · NEXT TEE MARKED"
              : "EIGHT-STROKE LIMIT · NEXT HOLE",
          );
        }
      }
      if (session?.id === "farm" && !session.game.delivering) {
        const p = local(),
          index = C.PLOTS.findIndex((r) => C.inside(p, r, 15));
        if (index >= 0) {
          if (
            C.pick(session.game, index, 1 / 60, {
              near: true,
              onFoot: true,
              using: held || !!keys.u || gp.fire,
            })
          )
            note(
              session.game.delivering
                ? "ALL SIX CRATES READY · RETURN TO MARKET"
                : "PLOT HARVESTED · " + session.game.claimed.length + "/6",
            );
        } else {
          session.game.hold = 0;
          session.game.plot = -1;
          held = false;
        }
      }
    }
    shot.hidden = session?.id !== "golf";
    driveControls.hidden = session?.id !== "kart";
    if (session?.id === "golf") {
      aim.value = String(Math.round((session.aim * 180) / Math.PI));
      swing.disabled =
        session.game.moving ||
        Math.hypot(
          local().x - session.game.ball.x,
          local().y - session.game.ball.y,
        ) > 35;
      aimCup.disabled = session.game.moving;
      const cup = C.HOLES[session.game.hole].cup;
      setText(
        shotReadout,
        "POWER " +
          Math.round(session.power * 100) +
          "% · CUP " +
          Math.round(
            Math.hypot(
              cup.x - session.game.ball.x,
              cup.y - session.game.ball.y,
            ) / 10,
          ) +
          "m",
      );
    }
  };
  const draw = render;
  render = function () {
    if (!active) return draw.apply(this, arguments);
    if (window.level29RuntimeResources?.lost) return;
    syncViewport();
    applyLightMode();
    scene.background = daylight;
    if (scene.fog) {
      scene.fog.color.copy(daylight);
      scene.fog.near = 240;
      scene.fog.far = 2000;
    }
    if (typeof hemi !== "undefined") hemi.intensity = 0.9;
    if (typeof sun !== "undefined") {
      sun.intensity = 0.8;
      sun.color.set("#fff0d6");
    }
    isolate();
    viewTick();
    const p = local();
    for (const r of world.roofs) r.root.visible = !C.inside(p, r.b, 5);
    world.crates.forEach((mesh, i) => {
      mesh.visible =
        session?.id !== "farm" || !session.game.claimed.includes(i);
    });
    world.ball.visible = session?.id === "golf";
    if (world.ball.visible) {
      const b = session.game.ball;
      world.ball.position.set(b.x, 2.4, b.y);
    }
    world.checkpoint.visible = session?.id === "kart";
    if (world.checkpoint.visible) {
      const next = session.game.next,
        p = C.TRACK[next],
        q = C.TRACK[(next + 1) % C.TRACK.length];
      world.checkpoint.position.set(p.x, p.h + 1, p.y);
      world.checkpoint.rotation.y = -Math.atan2(q.y - p.y, q.x - p.x);
    }
    world.kart.visible = session?.id === "kart";
    if (world.kart.visible) {
      const r = session.game;
      world.kart.position.set(r.x, r.h + 1, r.y);
      world.kart.rotation.y = -r.angle;
      camera.position.set(
        player.x - Math.cos(r.angle) * 38,
        r.h + 29,
        player.y - Math.sin(r.angle) * 38,
      );
      camera.lookAt(
        player.x + Math.cos(r.angle) * 35,
        r.h + 8,
        player.y + Math.sin(r.angle) * 35,
      );
    } else {
      camera.position.set(player.x, 18, player.y);
      camera.lookAt(
        player.x + Math.cos(view.yaw) * Math.cos(view.pitch),
        18 + Math.sin(view.pitch),
        player.y + Math.sin(view.yaw) * Math.cos(view.pitch),
      );
    }
    camera.updateMatrixWorld(true);
    for(const extension of extensions)extension.draw?.();
    renderer.info.reset();
    renderer.clear();
    renderer.render(scene, camera);
    cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx.clearRect(0, 0, SW, SH);
    cx.save();
    let status = "WEST: GOLF · NORTHEAST: MANOR / CROPS · SOUTHEAST: KARTS";
    if (session?.id === "golf")
      status =
        "GOLF · HOLE " +
        (session.game.hole + 1) +
        "/3 · STROKES " +
        session.game.strokes +
        " · TOTAL " +
        session.game.total;
    else if (session?.id === "kart")
      status =
        "KART · LAP " +
        Math.min(3, 1 + Math.floor(session.game.gates / 16)) +
        "/3 · " +
        Math.round(Math.abs(session.game.speed) * 0.36) +
        " km/h · " +
        session.game.seconds.toFixed(1) +
        "s · PENALTY +" +
        session.game.penalty +
        "s";
    else if (session?.id === "farm")
      status =
        "HARVEST " +
        session.game.claimed.length +
        "/6 · " +
        (session.game.delivering
          ? "RETURN TO MARKET"
          : Math.round((session.game.hold / 3) * 100) +
            "% · HOLD HARVEST AT PLOT");
    const external=extensions.map(e=>e.target?.()).find(Boolean);
    const nav = external?{point:external,label:external.label||'SERVICE CONTRACT'}:navigation();
    if (nav) {
      const g = C.guidance(
        local(),
        nav.point,
        session?.id === "kart" ? session.game.angle : view.yaw,
      );
      setText(
        destination,
        nav.label + " · " + g.metres + "m " + g.compass + " · " + g.turn,
      );
    }
    setText(detail, "$" + Math.floor(cash) + " · " + status);
    setText(eventStatus, clock < noticeUntil ? notice : "");
    cx.font = "12px monospace";
    const target = missionTarget();
    if (target && session?.id !== "kart") {
      const q = project(target.x, target.y, 24);
      if (q && q.x > 20 && q.x < SW - 20 && q.y > 110 && q.y < SH - 130) {
        cx.fillStyle = "#f2d18a";
        cx.fillText(session?.id === "golf" ? "BALL" : "NEXT", q.x, q.y);
      }
    }
    if (session?.id === "golf" && !session.game.moving) {
      const b = session.game.ball,
        a = session.aim,
        p1 = project(ORIGIN.x + b.x, ORIGIN.y + b.y, 3),
        p2 = project(
          ORIGIN.x + b.x + Math.cos(a) * 70,
          ORIGIN.y + b.y + Math.sin(a) * 70,
          3,
        );
      if (p1 && p2) {
        cx.strokeStyle = "#f2d18a";
        cx.lineWidth = 2;
        cx.beginPath();
        cx.moveTo(p1.x, p1.y);
        cx.lineTo(p2.x, p2.y);
        cx.stroke();
      }
    }
    if (state === "pause") {
      cx.fillStyle = "#10252caa";
      cx.fillRect(0, 0, SW, SH);
      cx.fillStyle = "#f2d18a";
      cx.fillText("PAUSED · P / ESC TO OPEN GROUNDS MENU", 20, SH / 2);
    }
    cx.restore();
  };
  const pause = document.getElementById("pauseControls");
  if (pause) {
    const b = document.createElement("button");
    b.textContent = "GOLF / ESTATE FARM / KART BUSINESSES";
    b.onclick = show;
    pause.appendChild(b);
  }
  addEventListener("blur", () => {
    if (active) {
      clearInput();
      if (state === "play") state = "pause";
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (active && document.hidden) {
      clearInput();
      if (state === "play") state = "pause";
    }
  });
  window.level29Leisure = {
    closeBoard:close,
    register(extension){extensions.push(extension);},
    get world(){return world;},get position(){return active?local():null;},atCounter:id=>active&&at(C.SERVICES[id]),
    get groundsOpen(){return dialog.open;},notice:note,
    show,
    enter,
    leave,
    use,
    start,
    get active() {
      return active;
    },
    get snapshot() {
      return C.restore(data);
    },
    restore(raw) {
      data = C.restore(raw);
    },
    get shuttle() {
      return shuttle;
    },
    get session() {
      return session;
    },
    get stats() {
      return world?.stats || null;
    },
  };
})();
