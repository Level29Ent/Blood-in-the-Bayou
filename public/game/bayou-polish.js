"use strict";
(function () {
  const C = BayouPolishCore;
  let data = C.fresh(),
    owner = null,
    points = {},
    plants = [],
    root = null,
    quietFrames = 0,
    warnings = [],
    scanAt = -1;
  const titles = ["Paper Trail", "Quiet Medicine", "Who Gets the Signal?"];
  const descriptions = [
    "Sam radios from the riverboat landing: Ahmad left a lab ledger. Compare the landing manifest, university ledger and Ronnie’s street dead drop. Three clues, no combat timer.",
    "Ahmad: There is medicine at the university drop. Approach on foot and keep the nearby area clear of alerted infected for two seconds. Deliver the sealed supplies to the hospital. No extra extraction hold.",
    "Ronnie: We have one working transmitter battery. Keep it at the hospital for triage, or return it to Ahmad to broadcast the lab evidence. Choose a destination; the completed chapter leaves a visible supply station or radio beacon.",
  ];
  function busy() {
    return !!(
      mpRole ||
      window.level29Prologue?.active ||
      mission?.phase === "active" ||
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
      (window.level29AnthonyStory?.snapshot?.step > 0 &&
        window.level29AnthonyStory?.snapshot?.step < 10)
    );
  }
  function save() {
    window.level29Save?.save();
  }
  function say(text) {
    subtitle = {
      name: "BAYOU AFTERMATH · RADIO",
      txt: text,
      t: 540,
      col: "#edce82",
    };
    toast(text);
  }
  function dispose() {
    if (!root) return;
    root.parent?.remove(root);
    const geos = new Set(),
      mats = new Set();
    root.traverse((o) => {
      if (o.geometry) geos.add(o.geometry);
      if (o.material) mats.add(o.material);
    });
    for (const g of geos) g.dispose();
    for (const m of mats) m.dispose();
    root = null;
  }
  function setup() {
    dispose();
    owner = city;
    points = {};
    plants = [];
    if (!city?.world) return;
    const venues = city.venues || [],
      pick = (re) =>
        venues.find(
          (v) => re.test(v.name || "") && !v.privateResidence && !v.mallStore,
        );
    const sites = {
      sam: city.casinoVenue || pick(/CASINO|RIVERBOAT/i),
      lab: pick(/UNIVERSITY/i),
      ronnie: venues.find((v) => v.id === "safe"),
      clinic: pick(/HOSPITAL/i),
    };
    const graph = window.level29Navigation?.graph;
    for (const [k, v] of Object.entries(sites)) {
      let source = v;
      if (k === "sam" && city.riverboatHub?.entry)
        source = {
          ...v,
          doorX: city.riverboatHub.entry.x,
          doorY: city.riverboatHub.entry.y,
          frontage: { dx: 0, dy: 1 },
        };
      const p = window.level29NeighborhoodCore?.point(
        source,
        graph,
        (x, y, r) => !blockedCircle(x, y, r),
        (x, y) => city.heightAt(x, y),
      );
      if (p) points[k] = p;
    }
    // Real graph nodes only, no random coordinates inside buildings or water.
    const candidates = venues
      .filter(
        (v) =>
          /FARM|PLANT|GROCERY|FRESH|BOTANICA|GREENMART|FISH MARKET/i.test(
            v.name || "",
          ) &&
          !v.mallStore &&
          !v.privateResidence,
      )
      .slice(0, 12);
    for (let i = 0; i < candidates.length; i++) {
      const v = candidates[i],
        p = window.level29NeighborhoodCore?.point(
          v,
          graph,
          (x, y, r) => !blockedCircle(x, y, r),
          (x, y) => city.heightAt(x, y),
        );
      if (p && !plants.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 30))
        plants.push({
          ...p,
          id: "plant:" + i,
          kind: C.INGREDIENTS[i % 3],
          name: v.name,
        });
    }
    if (!cityGroup) return;
    root = new THREE.Group();
    root.name = "Bayou Aftermath · owned nonblocking markers";
    cityGroup.add(root);
    const geo = new THREE.OctahedronGeometry(2.5),
      mat = new THREE.MeshBasicMaterial({ color: "#83b886" });
    for (const p of plants) {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(p.x, p.base + 5, p.y);
      mesh.userData.plantId = p.id;
      root.add(mesh);
      p.mesh = mesh;
    }
    if (!plants.length) {
      geo.dispose();
      mat.dispose();
    }
    const p =
      data.chapter === 3
        ? points[data.choice === "shelter" ? "clinic" : "lab"]
        : null;
    if (p) {
      const g = new THREE.BoxGeometry(9, 6, 7),
        m = new THREE.MeshStandardMaterial({
          color: data.choice === "shelter" ? "#73937c" : "#d0ad66",
          roughness: 0.8,
        });
      const mesh = new THREE.Mesh(g, m);
      mesh.position.set(p.x + 9, p.base + 3, p.y);
      root.add(mesh);
    }
    syncPlants();
  }
  function syncPlants() {
    for (const p of plants)
      if (p.mesh) p.mesh.visible = !data.gathered.includes(p.id);
  }
  function target() {
    if (!data.active || data.chapter >= 3) return null;
    if (data.chapter === 0)
      return {
        id: ["sam", "lab", "ronnie"][data.step],
        label: ["READ MANIFEST", "COMPARE LAB LEDGER", "RADIO RONNIE"][
          data.step
        ],
      };
    if (data.chapter === 1)
      return {
        id: data.step === 0 ? "lab" : "clinic",
        label:
          data.step === 0
            ? "COLLECT MEDICINE · QUIET APPROACH"
            : "DELIVER MEDICINE",
      };
    return {
      id:
        data.step === 0
          ? "ronnie"
          : data.choice === "shelter"
            ? "clinic"
            : "lab",
      label:
        data.step === 0
          ? "CHOOSE BATTERY DESTINATION"
          : data.choice === "shelter"
            ? "DELIVER TRIAGE BATTERY"
            : "BROADCAST LAB EVIDENCE",
    };
  }
  function near(p) {
    return (
      !!p &&
      !!player &&
      !player.dead &&
      !player.car &&
      Math.hypot(player.x - p.x, player.y - p.y) < 30 &&
      Math.abs(terrainHeight(player.x, player.y) - p.base) < 8
    );
  }
  const dialog = document.createElement("dialog");
  dialog.id = "bayouChapter";
  dialog.className = "bayou-panel";
  dialog.setAttribute("aria-label", "Bayou Aftermath chapter");
  document.body.appendChild(dialog);
  let previous = "play",
    focus = null;
  function close() {
    if (dialog.open) dialog.close();
    if (state === "pause" && !mpRole)
      state = previous === "pause" ? "play" : previous;
    mouse.down = false;
    focus?.focus?.();
  }
  function text(t) {
    const p = document.createElement("p");
    p.textContent = t;
    dialog.appendChild(p);
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
    if (!player || player.dead || !["play", "pause"].includes(state) || mpRole)
      return;
    if (owner !== city) setup();
    if (!dialog.open) {
      previous = state;
      focus = document.activeElement;
    }
    state = "pause";
    mouse.down = false;
    window.level29Bindings?.release();
    for (const k in keys) keys[k] = false;
    document.exitPointerLock?.();
    dialog.replaceChildren();
    const h = document.createElement("h2");
    h.textContent = "BAYOU AFTERMATH · THREE RADIO MISSIONS";
    dialog.appendChild(h);
    text(
      "Optional solo chapter after the opening. Existing campaign IDs, characters and building designs are unchanged. Other active stories suspend this route. Radio dialogue is captioned; no new voice recordings.",
    );
    for (let i = 0; i < 3; i++)
      text(
        (i < data.chapter ? "✓ " : i === data.chapter ? "→ " : "□ ") +
          titles[i],
      );
    const missing = ["sam", "lab", "ronnie", "clinic"].filter(
      (k) => !points[k],
    );
    if (data.chapter < 3) {
      text(descriptions[data.chapter]);
      if (missing.length)
        text(
          "Route unavailable: " +
            missing.join(", ") +
            ". No reward or progress changed.",
        );
      else
        button(
          data.active
            ? "PAUSE CHAPTER TRACKING"
            : "ACCEPT / RESUME " + titles[data.chapter],
          () => {
            if (!data.active && busy())
              return text("Finish the current mission / story first.");
            data.active = !data.active;
            close();
            save();
          },
        );
    } else
      text(
        data.choice === "shelter"
          ? "ENDING · The hospital has a powered triage station. Claim its one-time medical care at the gold A marker."
          : "ENDING · Ahmad broadcasts the evidence. A gold radio beacon marks the university; claim a one-time $300 community contribution there.",
      );
    text(
      "FORAGING · " +
        C.INGREDIENTS.map(
          (k) => k.toUpperCase() + " " + data.ingredients[k],
        ).join(" · ") +
        ". Green diamonds mark one-time ingredient bundles outside relevant shops/farm. Use on foot. Recipes at the existing Apothecary accept ingredients OR game cash, never both.",
    );
    for (const p of plants
      .filter((p) => !data.gathered.includes(p.id))
      .slice(0, 4))
      button("TRACK " + p.kind.toUpperCase() + " · " + p.name, () => {
        window.level29Nola?.setWaypoint({ ...p, color: "#83b886" });
        close();
      });
    button("CLOSE / RESUME", close);
    if (!dialog.open) dialog.showModal();
  }
  dialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    close();
  });
  for (const type of [
    "pointerdown",
    "pointerup",
    "click",
    "touchstart",
    "touchend",
    "wheel",
    "keydown",
    "keyup",
  ])
    dialog.addEventListener(type, (e) => e.stopPropagation());
  function use(choice = "") {
    if (state !== "play" || busy() || !player || player.dead) return false;
    const t = target(),
      p = t && points[t.id];
    if (t && near(p)) {
      if (data.chapter === 2 && data.step === 0 && !choice) {
        show();
        text("Choose once; the destination is saved.");
        for (const [id, label] of [
          ["shelter", "POWER HOSPITAL TRIAGE"],
          ["broadcast", "BROADCAST AHMAD’S EVIDENCE"],
        ])
          button(label, () => {
            close();
            use(id);
          });
        return true;
      }
      const action =
        data.chapter === 0
          ? t.id
          : data.chapter === 1
            ? data.step === 0
              ? "cache"
              : "handoff"
            : data.step === 0
              ? "decision"
              : data.choice;
      const event = C.advance(data, action, {
        near: true,
        onFoot: true,
        alive: true,
        quiet: quietFrames >= 120,
        choice,
      });
      if (!event) {
        toast(
          "WAIT FOR A QUIET APPROACH · KEEP ALERTED INFECTED AWAY FOR 2 SECONDS",
        );
        return true;
      }
      cash += event.pay;
      save();
      say(
        event.complete
          ? "CHAPTER COMPLETE · +$" + event.pay + " · NEXT CHAPTER IN JOURNAL"
          : data.chapter === 0
            ? [
                "Sam: This manifest and Ahmad’s ledger should match. Check the university street drop.",
                "Ahmad: Batch X29 was diverted. Ronnie needs this evidence.",
              ][data.step - 1] || "Evidence recorded."
            : data.chapter === 1
              ? "Medicine secured. Get it to the hospital."
              : "Choice saved. Follow the A marker.",
      );
      if (data.chapter === 3) setup();
      return true;
    }
    const plant = plants.find((p) => near(p) && !data.gathered.includes(p.id));
    if (plant && C.gather(data, plant.id, plant.kind)) {
      syncPlants();
      save();
      toast("GATHERED " + plant.kind.toUpperCase() + " · APOTHECARY RECIPES");
      return true;
    }
    const outcome =
      data.chapter === 3 &&
      points[data.choice === "shelter" ? "clinic" : "lab"];
    if (outcome && near(outcome) && !data.paid.includes("aftermath")) {
      if (data.choice === "shelter") {
        if (player.hp >= player.maxHp) {
          toast("TRIAGE READY · RETURN WHEN INJURED");
          return true;
        }
        player.hp = Math.min(player.maxHp, player.hp + 50);
      } else cash += 300;
      data.paid.push("aftermath");
      save();
      toast(
        data.choice === "shelter"
          ? "TRIAGE SUPPLIES · +50 HEALTH"
          : "COMMUNITY RADIO SUPPORT · +$300",
      );
      return true;
    }
    return false;
  }
  function craft(id) {
    if (
      !player ||
      player.dead ||
      mpRole ||
      (id === "poultice" && player.hp >= player.maxHp)
    )
      return false;
    if (!C.craft(data, id)) return false;
    return true;
  }
  const service = serviceVenue;
  serviceVenue = function () {
    if (use()) return;
    return service.apply(this, arguments);
  };
  const start = startGame;
  startGame = function () {
    if (dialog.open) close();
    data = C.fresh();
    quietFrames = 0;
    scanAt = -1;
    warnings = [];
    hintAfter = 0;
    owner = null;
    return start.apply(this, arguments);
  };
  const build = buildCity;
  buildCity = function () {
    dispose();
    const r = build.apply(this, arguments);
    setup();
    return r;
  };
  const action = document.createElement("button");
  action.id = "bayouAction";
  action.className = "bayou-action";
  action.hidden = true;
  action.onclick = (e) => {
    e.stopPropagation();
    use();
  };
  for (const t of ["pointerdown", "pointerup", "touchstart", "touchend"])
    action.addEventListener(t, (e) => e.stopPropagation());
  document.body.appendChild(action);
  const tick = update;
  update = function () {
    tick.apply(this, arguments);
    action.hidden = true;
    if (!player || !city?.world) return;
    if (owner !== city && builtCity === city) setup();
    if (state !== "play" || player.dead || busy()) {
      quietFrames = 0;
      return;
    }
    const t = target(),
      p = t && points[t.id];
    if (
      data.chapter === 1 &&
      data.step === 0 &&
      near(p) &&
      !zombies.some(
        (z) =>
          z.alive &&
          z.alert &&
          Math.hypot(z.x - player.x, z.y - player.y) < 140,
      )
    )
      quietFrames++;
    else quietFrames = 0;
    if (t && near(p)) {
      action.textContent = level29Bindings.label("interact") + " · " + t.label;
      action.hidden = false;
    } else if (plants.some((p) => near(p) && !data.gathered.includes(p.id))) {
      action.textContent =
        level29Bindings.label("interact") + " · GATHER INGREDIENT";
      action.hidden = false;
    } else if (
      data.chapter === 3 &&
      !data.paid.includes("aftermath") &&
      near(points[data.choice === "shelter" ? "clinic" : "lab"])
    ) {
      action.textContent =
        "CLAIM " +
        (data.choice === "shelter" ? "TRIAGE CARE" : "RADIO SUPPORT");
      action.hidden = false;
    }
    if (data.active && t && !data.tips.includes("chapter")) {
      data.tips.push("chapter");
      window.level29UX?.note(
        "bayou-chapter",
        "A marks the optional chapter. Pause tracking in Journal to return to the campaign.",
      );
    }
  };
  const mt = missionTarget;
  missionTarget = function () {
    const t = target();
    return t && !busy() && points[t.id]
      ? { ...points[t.id], label: "A", col: "#edce82" }
      : mt.apply(this, arguments);
  };
  const blips = extraBlips;
  extraBlips = function () {
    const out = blips.apply(this, arguments);
    if (!busy()) {
      const t = target(),
        p = t && points[t.id];
      if (p) out.push({ ...p, label: "A", col: "#edce82" });
      for (const p of plants)
        if (!data.gathered.includes(p.id))
          out.push({ ...p, label: "H", col: "#83b886" });
      if (data.chapter === 3 && !data.paid.includes("aftermath")) {
        const p = points[data.choice === "shelter" ? "clinic" : "lab"];
        if (p) out.push({ ...p, label: "A", col: "#edce82" });
      }
    }
    return out;
  };
  const renderBase = render;
  render = function () {
    renderBase.apply(this, arguments);
    if (state !== "play" || !player || player.dead || showMap) return;
    if (frame - scanAt >= 6 || scanAt < 0) {
      scanAt = frame;
      warnings = zombies
        .filter(
          (z) =>
            z.alive &&
            z.windup !== undefined &&
            Math.hypot(z.x - player.x, z.y - player.y) < 110,
        )
        .slice(0, 6);
    }
    cx.save();
    cx.strokeStyle = "#ffb86b";
    cx.lineWidth = 3;
    for (const z of warnings) {
      if (!z.alive || z.windup === undefined) continue;
      const p = project(z.x, z.y, terrainHeight(z.x, z.y) + 25);
      if (p && p.x > 0 && p.x < SW && p.y > 0 && p.y < SH) {
        cx.beginPath();
        cx.arc(
          p.x,
          p.y,
          12,
          -Math.PI / 2,
          -Math.PI / 2 + Math.PI * 2 * (1 - z.windup / 18),
        );
        cx.stroke();
        cx.fillStyle = "#ffcb8a";
        cx.font = "bold 11px monospace";
        cx.fillText("STRIKE", p.x + 16, p.y);
      }
    }
    cx.restore();
  };
  // Measured beginner milestones, not a mandatory second tutorial or extra travel.
  let origin = null,
    soloPlayer = null,
    hintAfter = 0;
  const tutorial = update;
  update = function () {
    tutorial.apply(this, arguments);
    if (
      state !== "play" ||
      !player ||
      player.dead ||
      mpRole ||
      performance.now() < hintAfter
    )
      return;
    if (soloPlayer !== player) {
      soloPlayer = player;
      origin = { x: player.x, y: player.y };
    }
    const tips = [
      [
        "move",
        Math.hypot(player.x - origin.x, player.y - origin.y) > 35,
        "Movement ready. Follow your story waypoint; Journal contains the current objective.",
      ],
      [
        "drive",
        !!player.car,
        "Vehicle ready. " +
          level29Bindings.label("vehicle") +
          " exits; keep your delivery approach clear.",
      ],
      [
        "combat",
        player.flash > 0 && !window.level29Prologue?.peaceful,
        "Gold hit markers confirm kills. Orange STRIKE rings warn of an incoming melee attack.",
      ],
      [
        "save",
        !!window.level29SaveTransfer,
        "Progress saves automatically. Export SAVE CODE at the title screen; LOCAL BACKUP RECOVERY restores earlier checkpoints.",
      ],
    ];
    for (const [id, ok, message] of tips)
      if (ok && !data.tips.includes(id)) {
        data.tips.push(id);
        hintAfter = performance.now() + 7500;
        window.level29UX?.note("polish-" + id, message);
        break;
      }
  };
  window.level29BayouPolish = {
    show,
    close,
    use,
    craft,
    commit: save,
    get active() {
      return data.active && !busy();
    },
    get snapshot() {
      return JSON.parse(JSON.stringify(data));
    },
    restore(raw) {
      data = C.fresh(raw);
      owner = null;
    },
    get ingredients() {
      return { ...data.ingredients };
    },
  };
})();
