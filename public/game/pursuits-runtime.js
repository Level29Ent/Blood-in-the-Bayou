"use strict";
(function () {
  const C = BayouPursuitsCore,
    L = level29Leisure,
    K = BayouLeisureCore;
  let data = C.fresh(),
    job = null,
    tournament = false,
    racers = [],
    samples = [],
    previousRace = null,
    root = null,
    stamp = "",
    ghostMesh = null,
    rivalMeshes = [],
    plotMeshes = [],
    savedAt = 0;
  const dialog = document.createElement("dialog");
  dialog.id = "pursuitsBoard";
  dialog.className = "bayou-panel";
  dialog.setAttribute(
    "aria-label",
    "Businesses, gardens, racing and estate journal",
  );
  document.body.appendChild(dialog);
  let before = "play";
  function save() {
    window.level29Save?.save();
  }
  function clear() {
    mouse.down = false;
    window.level29Bindings?.release();
    if (typeof releaseTouchGesture === "function") releaseTouchGesture();
    for (const k in keys) keys[k] = false;
  }
  function close() {
    if (dialog.open) dialog.close();
    clear();
    if (state === "pause") state = before === "pause" ? "play" : before;
  }
  function line(t) {
    const p = document.createElement("p");
    p.textContent = t;
    dialog.appendChild(p);
    return p;
  }
  function button(t, fn) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = t;
    b.onclick = fn;
    dialog.appendChild(b);
    return b;
  }
  function near(p, r = 40) {
    return (
      !!L.position &&
      !player?.dead &&
      !player?.car &&
      Math.hypot(L.position.x - p.x, L.position.y - p.y) < r
    );
  }
  function available() {
    return L.active && !L.session && !job && !player.dead;
  }
  function open(page = "business") {
    if (!L.active) return window.level29Operations?.show();
    if (
      !["play", "pause"].includes(state) ||
      player.dead ||
      window.level29RuntimeResources?.lost
    )
      return;
    if (!dialog.open) before = state;
    state = "pause";
    clear();
    document.exitPointerLock?.();
    dialog.replaceChildren();
    const h = document.createElement("h2");
    h.textContent = "BAYOU ENTERPRISES · " + page.toUpperCase();
    dialog.appendChild(h);
    const nav = document.createElement("nav");
    dialog.appendChild(nav);
    for (const id of ["business", "garden", "racing", "journal"]) {
      const b = document.createElement("button");
      b.textContent = id.toUpperCase();
      b.onclick = () => open(id);
      nav.appendChild(b);
    }
    button("CLOSE / RESUME", close);
    line(
      "All purchases use earned game cash. Save-compatible, solo, optional. Game cash $" +
        Math.floor(cash),
    );
    if (page === "business") {
      for (const [id, def] of Object.entries(C.UPGRADES)) {
        const owned = L.snapshot.owned.includes(id),
          level = data.upgrades[id];
        line(
          K.BUSINESSES[id].name +
            " · UPGRADE " +
            level +
            "/3 · CONTRACTS " +
            data.contracts[id],
        );
        const cost = def.cost * (level + 1),
          b = button(
            def.name + " · " + (level === 3 ? "MAX LEVEL" : "$" + cost),
            () => {
              if (!available() || !L.atCounter(id))
                return line(
                  "Finish the current activity and visit this counter first.",
                );
              const balance = C.upgrade(data, id, owned, cash);
              if (balance === null)
                return line("Own the business, check cash and upgrade limit.");
              cash = balance;
              save();
              rebuild();
              open(page);
            },
          );
        b.disabled = !owned || level === 3;
        line(
          "Each level adds 5% completed-activity pay; farm levels also speed watered crop growth by 15%. Visible stocked displays mark purchased upgrades.",
        );
        button(
          "ACCEPT " +
            id.toUpperCase() +
            " SERVICE CONTRACT · 3 STOPS / $" +
            C.bonus(data, id, 600),
          () => {
            if (!available() || !L.atCounter(id))
              return line("Finish your activity and visit this counter first.");
            if (!owned)
              return line("Buy this business deed to dispatch its contracts.");
            job = C.contract(id);
            close();
            L.notice(
              "SERVICE CONTRACT · FOLLOW GOLD X · HOLD INTERACT FOR 2s AT EACH STOP",
            );
          },
        );
      }
      if (job) {
        line(
          "CONTRACT · " +
            job.id +
            " · " +
            (job.stage + 1) +
            "/3 · " +
            Math.ceil(job.seconds) +
            "s",
        );
        button("CANCEL SERVICE CONTRACT · NO REWARD", () => {
          job = null;
          close();
        });
      }
    }
    if (page === "garden") {
      line(
        "Cultivation is separate from the staffed harvest shift. Buy seeds at a plot, water once, wait active grounds-play seconds, harvest 3 units, then carry produce to a buyer. No offline or paused growth.",
      );
      for (let i = 0; i < 6; i++) {
        const p = K.PLOTS[i],
          plot = data.plots[i],
          here = near({ x: p.x + 50, y: p.y + 50 }, 80);
        line(
          "PLOT " +
            (i + 1) +
            " · " +
            (!plot
              ? "EMPTY"
              : plot.crop.toUpperCase() +
                " · " +
                (!plot.watered
                  ? "NEEDS WATER"
                  : plot.age >= C.CROPS[plot.crop].seconds
                    ? "READY"
                    : "GROWING " +
                      Math.floor(plot.age) +
                      "/" +
                      C.CROPS[plot.crop].seconds +
                      "s")),
        );
        if (!plot)
          for (const [id, crop] of Object.entries(C.CROPS))
            button(
              "PLANT " +
                id.toUpperCase() +
                " · $" +
                crop.seed +
                " · " +
                crop.seconds +
                "s · PLOT " +
                (i + 1),
              () => {
                if (!available() || !here)
                  return line(
                    "Finish current activity and stand at this plot.",
                  );
                const balance = C.plant(data, i, id, cash);
                if (balance === null)
                  return line("Not enough cash or plot already occupied.");
                cash = balance;
                save();
                open(page);
              },
            );
        else if (!plot.watered)
          button("WATER PLOT " + (i + 1), () => {
            if (!available() || !here)
              return line("Stand at this plot without another activity.");
            if (C.water(data, i)) save();
            open(page);
          });
        else
          button("HARVEST PLOT " + (i + 1), () => {
            if (!available() || !here)
              return line("Stand at this plot without another activity.");
            if (!C.harvest(data, i))
              return line("Crop not ready or inventory full.");
            save();
            open(page);
          });
      }
      line(
        "BUYERS · Clubhouse pays +20% for okra; market pays +15% for cane. Other produce uses its standard price.",
      );
      for (const [crop, n] of Object.entries(data.inventory)) {
        line(crop.toUpperCase() + " · " + n + " units");
        for (const [buyer, counter] of [
          ["market", "farm"],
          ["clubhouse", "golf"],
        ])
          button(
            "SELL " + crop.toUpperCase() + " AT " + buyer.toUpperCase(),
            () => {
              if (!available() || !L.atCounter(counter))
                return line(
                  "Visit the buyer counter and finish current activity.",
                );
              const pay = C.sell(data, crop, buyer);
              if (!pay) return line("No harvested produce to sell.");
              cash += pay;
              save();
              open(page);
            },
          );
      }
    }
    if (page === "racing") {
      line(
        "Your best clean completed time-trial path is saved locally as a translucent ghost. The ghost is a visual reference, not a remote player or authoritative leaderboard.",
      );
      line(
        "TOURNAMENT WINS " +
          data.tournaments +
          " · GHOST " +
          (data.ghost.length
            ? data.ghost.at(-1)[0].toFixed(1) + "s RAW TRACK TIME"
            : "NONE YET"),
      );
      button(
        tournament
          ? "RIVAL TOURNAMENT ON · TURN OFF"
          : "ENABLE TWO AI RIVALS FOR NEXT RENTAL",
        () => {
          if (L.session)
            return line("Finish this rental before changing race type.");
          tournament = !tournament;
          open(page);
        },
      );
      line(
        "Book the usual $100 rental at the kart counter. Rivals steer the same physics through 48 gates; no kart-to-kart collisions. Beat both for a $300 tournament bonus. Their difficulty is fixed; resets and penalties count.",
      );
    }
    if (page === "journal") {
      line(
        "Four original estate documents connect Sam, Ahmad and Ronnie. Find their amber pedestals in the manor, barn and market; approach on foot and READ. No new voice recordings.",
      );
      for (const clue of C.CLUES) {
        if (data.clues.includes(clue.id)) {
          line("✓ " + clue.title);
          line(clue.text);
        } else {
          line("UNDISCOVERED · " + clue.title);
          if (near(clue))
            button("READ " + clue.title, () => {
              C.clue(data, clue.id);
              save();
              open(page);
            });
        }
      }
      if (data.clues.length === 4)
        line(
          "ESTATE ARCHIVIST · Evidence recovered. These records complement the existing story; no campaign mission is skipped or reset.",
        );
    }
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
  function dispose() {
    if (!root) return;
    root.parent?.remove(root);
    const geos = new Set(),
      mats = new Set();
    root.traverse((o) => {
      if (o.isInstancedMesh) o.dispose();
      if (o.geometry) geos.add(o.geometry);
      for (const m of Array.isArray(o.material) ? o.material : [o.material])
        if (m) mats.add(m);
    });
    for (const x of [...geos, ...mats]) x.dispose();
    root = null;
    ghostMesh = null;
    rivalMeshes = [];
    plotMeshes = [];
    stamp = "";
  }
  function rebuild() {
    dispose();
    if (!L.world) return;
    root = new THREE.Group();
    root.name = "Optional enterprises · owned progression props";
    L.world.root.add(root);
    const cube = new THREE.BoxGeometry(1, 1, 1),
      wood = new THREE.MeshStandardMaterial({
        color: "#97764e",
        roughness: 0.8,
      }),
      gold = new THREE.MeshStandardMaterial({
        color: "#ddba69",
        roughness: 0.7,
      }),
      green = new THREE.MeshStandardMaterial({
        color: "#6c9b53",
        roughness: 0.8,
      }),
      blue = new THREE.MeshStandardMaterial({
        color: "#639dc1",
        roughness: 0.65,
      });
    function box(m, w, h, d, x, y, z, parent = root) {
      const mesh = new THREE.Mesh(cube, m);
      mesh.scale.set(w, h, d);
      mesh.position.set(x, y, z);
      parent.add(mesh);
      return mesh;
    }
    for (const [id, level] of Object.entries(data.upgrades)) {
      const p = K.SERVICES[id];
      for (let i = 0; i < level; i++) {
        box(wood, 15, 8, 12, p.x - 75 + i * 20, 4, p.y - 26);
        box(gold, 11, 2, 8, p.x - 75 + i * 20, 9, p.y - 26);
      }
    }
    for (let i = 0; i < 6; i++) {
      const p = K.PLOTS[i],
        mesh = box(green.clone(), 12, 2, 12, p.x + 50, 2, p.y + 50);
      plotMeshes.push(mesh);
    }
    for (const clue of C.CLUES) {
      box(wood, 9, 9, 7, clue.x, 4.5, clue.y);
      box(gold, 8, 0.8, 6, clue.x, 9.5, clue.y);
    }
    function kart(mat) {
      const g = new THREE.Group();
      box(mat, 16, 3, 10, 0, 4, 0, g);
      box(wood, 5, 7, 6, -2, 8, 0, g);
      for (const x of [-6, 6])
        for (const z of [-6, 6]) box(wood, 4, 4, 2, x, 2, z, g);
      root.add(g);
      g.visible = false;
      return g;
    }
    const ghostMat = new THREE.MeshBasicMaterial({
      color: "#79d9ee",
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    ghostMesh = kart(ghostMat);
    rivalMeshes = [kart(gold), kart(blue)];
    green.dispose();
    stamp = JSON.stringify(data.upgrades);
    // All geometries/materials used by this small prop root are private. No world templates are disposed.
  }
  function updateVisuals() {
    if (!root || stamp !== JSON.stringify(data.upgrades)) rebuild();
    if (!root) return;
    for (let i = 0; i < 6; i++) {
      const p = data.plots[i],
        mesh = plotMeshes[i];
      mesh.visible = !!p;
      if (p) {
        mesh.material.color.set(
          !p.watered
            ? "#6289ac"
            : p.age >= C.CROPS[p.crop].seconds
              ? "#deb556"
              : "#6c9b53",
        );
        mesh.scale.y = p.watered
          ? 2 + (8 * p.age) / C.CROPS[p.crop].seconds
          : 1;
        mesh.position.y = mesh.scale.y / 2;
      }
    }
    const game = L.session?.id === "kart" ? L.session.game : null;
    const g = game && C.ghostAt(data.ghost, game.seconds);
    ghostMesh.visible = !!g;
    if (g) {
      ghostMesh.position.set(g.x, g.h + 1, g.y);
      ghostMesh.rotation.y = -g.angle;
    }
    rivalMeshes.forEach((mesh, i) => {
      const r = racers[i];
      mesh.visible = !!game && !!r;
      if (mesh.visible) {
        mesh.position.set(r.x, r.h + 1, r.y);
        mesh.rotation.y = -r.angle;
      }
    });
  }
  L.register({
    enter: rebuild,
    leave() {
      if (dialog.open) close();
      job = null;
      racers = [];
      samples = [];
      previousRace = null;
      dispose();
    },
    busy: () => !!job || dialog.open,
    board({ button, close }) {
      button("BUSINESS UPGRADES / GARDEN / RIVALS / ESTATE JOURNAL", () => {
        close();
        open();
      });
      button("PHOTO MODE", () => {
        close();
        window.level29Photo?.open();
      });
    },
    start(session) {
      if (session?.id !== "kart") return;
      previousRace = session.game;
      racers = tournament ? [K.race(), K.race()] : [];
      samples = [];
    },
    finish(session, amount) {
      if (session.id === "kart") {
        const r = session.game;
        C.sample(samples, r);
        if (samples.length < 620 && samples.at(-1)?.[0] < r.seconds)
          samples.push([
            +r.seconds.toFixed(2),
            +r.x.toFixed(2),
            +r.y.toFixed(2),
            +r.h.toFixed(2),
            +r.angle.toFixed(3),
          ]);
        const old = data.ghost.at(-1)?.[0] ?? Infinity;
        if (r.penalty === 0 && samples.length >= 2 && r.seconds < old)
          data.ghost = samples.map((q) => q.slice());
        if (
          racers.length &&
          racers.every(
            (a) => !a.done || a.seconds + a.penalty > r.seconds + r.penalty,
          )
        ) {
          data.tournaments++;
          amount += 300;
        }
        racers = [];
        samples = [];
        previousRace = null;
      }
      return C.bonus(data, session.id, amount);
    },
    tick(dt) {
      if (dialog.open) return;
      C.grow(data, dt);
      savedAt += dt;
      if (savedAt >= 20) {
        savedAt = 0;
        save();
      }
      if (job) {
        const p = C.CONTRACTS[job.id][job.stage],
          event = C.work(job, dt, {
            near: near(p),
            onFoot: !player.car,
            using: !!keys.u || heldUse || gp.fire,
            alive: !player.dead,
          });
        if (event === "complete") {
          cash += C.bonus(data, job.id, 600);
          data.contracts[job.id]++;
          job = null;
          save();
          L.notice("SERVICE CONTRACT COMPLETE · PAYMENT SAVED");
        } else if (event === "failed") {
          job = null;
          L.notice("CONTRACT EXPIRED · NO PAYMENT");
        }
      }
      const game = L.session?.id === "kart" ? L.session.game : null;
      if (game) {
        C.sample(samples, game);
        racers.forEach((r, i) => {
          if (!r.done && !r.failed) K.drive(r, dt, C.rivalInput(K, r, i));
        });
      } else if (previousRace) {
        racers = [];
        samples = [];
        previousRace = null;
      }
    },
    draw: updateVisuals,
    target() {
      return job ? C.CONTRACTS[job.id][job.stage] : null;
    },
  });
  const service = serviceVenue;
  serviceVenue = function () {
    if (L.active && job && near(C.CONTRACTS[job.id][job.stage])) return;
    return service.apply(this, arguments);
  };
  let heldUse = false;
  const action = document.createElement("button");
  action.id = "pursuitsUse";
  action.textContent = "ENTERPRISES / JOURNAL";
  action.hidden = true;
  document.body.appendChild(action);
  action.onclick = (e) => {
    e.stopPropagation();
    if (job) return;
    open(
      C.CLUES.some((c) => near(c) && !data.clues.includes(c.id))
        ? "journal"
        : "garden",
    );
  };
  action.onpointerdown = (e) => {
    e.stopPropagation();
    heldUse = true;
    action.setPointerCapture?.(e.pointerId);
  };
  for (const t of ["pointerup", "pointercancel", "lostpointercapture", "blur"])
    action.addEventListener(t, () => {
      heldUse = false;
    });
  action.addEventListener("keydown", (e) => {
    if (["Enter", " "].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      if (job) heldUse = true;
      else if (!e.repeat) open("garden");
    }
  });
  action.addEventListener("keyup", (e) => {
    if (["Enter", " "].includes(e.key)) {
      e.preventDefault();
      heldUse = false;
    }
  });
  const tick = update;
  update = function () {
    if (dialog.open) {
      state = "pause";
      heldUse = false;
      action.hidden = true;
      return;
    }
    tick.apply(this, arguments);
    action.hidden = !L.active || state !== "play";
    if (!action.hidden)
      action.textContent = job
        ? "HOLD WORK · " +
          (job.stage + 1) +
          "/3 · " +
          Math.ceil(job.seconds) +
          "s"
        : "UPGRADES / GARDEN / JOURNAL";
    if (window.level29Photo?.active) action.hidden = true;
  };
  const start = startGame;
  startGame = function () {
    if (dialog.open) close();
    job = null;
    data = C.fresh();
    samples = [];
    racers = [];
    return start.apply(this, arguments);
  };
  addEventListener("blur", () => {
    heldUse = false;
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) heldUse = false;
  });
  window.level29Pursuits = {
    closeBoard: close,
    show: () => (L.active ? open() : window.level29Operations?.show()),
    openGarden: () => open("garden"),
    get snapshot() {
      return C.fresh(data);
    },
    restore(raw) {
      data = C.fresh(raw);
    },
    get data() {
      return data;
    },
    save,
    get operation() {
      return window.level29Operations?.active || null;
    },
    get busy() {
      return !!job;
    },
  };
})();
