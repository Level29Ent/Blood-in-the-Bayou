"use strict";
(function () {
  const SETTINGS_KEY = "level29.experience.v1";
  let settings = { minimal: false, trackers: false };
  try {
    const d = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    for (const k of Object.keys(settings))
      if (typeof d?.[k] === "boolean") settings[k] = d[k];
  } catch (_) {}
  const seen = new Set();
  try {
    for (const k of JSON.parse(
      localStorage.getItem("level29.context-tips.v1") || "[]",
    ))
      if (typeof k === "string") seen.add(k);
  } catch (_) {}
  const button = document.createElement("button");
  button.id = "experienceButton";
  button.type = "button";
  button.textContent = "SETTINGS / JOURNAL";
  document.body.appendChild(button);
  const dialog = document.createElement("dialog");
  dialog.id = "experienceDialog";
  dialog.setAttribute("aria-label", "Game settings and journal");
  document.body.appendChild(dialog);
  let previous = "menu",
    focus = null,
    page = "settings",
    tipUntil = 0,
    bindingNotice = "";
  const tip = document.createElement("aside");
  tip.id = "contextTip";
  tip.setAttribute("role", "status");
  tip.hidden = true;
  document.body.appendChild(tip);
  function persist() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (_) {}
    document.body.classList.toggle("hud-minimal", settings.minimal);
    document.body.classList.toggle("ux-drawer-closed", !settings.trackers);
  }
  function note(id, text) {
    if (seen.has(id) || state !== "play" || dialog.open) return;
    seen.add(id);
    try {
      localStorage.setItem(
        "level29.context-tips.v1",
        JSON.stringify([...seen]),
      );
    } catch (_) {}
    tip.textContent = text;
    tipUntil = performance.now() + 6500;
  }
  function clearInput() {
    mouse.down = false;
    window.level29Bindings.release();
    for (const k in keys) keys[k] = false;
    for (const k in touch) touch[k] = false;
    gp.fire = gp.sprint = gp.brake = false;
    stick.x = stick.y = 0;
  }
  function close() {
    window.level29Bindings.cancel();
    if (dialog.open) dialog.close();
    document.body.classList.remove("ux-modal");
    clearInput();
    if (state === "pause" && !mpRole)
      state = previous === "pause" ? "play" : previous;
    focus?.focus?.();
  }
  function open(tab = "settings") {
    if (
      window.level29RuntimeResources?.lost ||
      !["menu", "play", "pause"].includes(state)
    )
      return;
    previous = state;
    focus = document.activeElement;
    clearInput();
    document.exitPointerLock?.();
    if (state === "play" && !mpRole) state = "pause";
    page = tab;
    draw();
    if (!dialog.open) dialog.showModal();
    document.body.classList.add("ux-modal");
  }
  function add(text, fn, parent = dialog) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = text;
    b.onclick = fn;
    parent.appendChild(b);
    return b;
  }
  function text(value, parent = dialog) {
    const p = document.createElement("p");
    p.textContent = value;
    parent.appendChild(p);
    return p;
  }
  function check(label, key) {
    const l = document.createElement("label"),
      i = document.createElement("input");
    i.type = "checkbox";
    i.checked = settings[key];
    i.onchange = () => {
      settings[key] = i.checked;
      persist();
    };
    l.append(i, document.createTextNode(label));
    dialog.appendChild(l);
  }
  function draw() {
    window.level29Bindings.cancel();
    dialog.replaceChildren();
    const h = document.createElement("h2");
    h.textContent = "BLOOD IN THE BAYOU";
    dialog.appendChild(h);
    const nav = document.createElement("nav");
    dialog.appendChild(nav);
    for (const tab of ["settings", "controls", "journal", "crew"])
      add(
        tab.toUpperCase(),
        () => {
          page = tab;
          draw();
        },
        nav,
      );
    add("CLOSE / RESUME", close, nav);
    if (page === "settings") {
      text(
        "Graphics presets are saved. Mobile uses effective Low quality and a 30 FPS cap; the requested preset stays saved.",
      );
      const l = document.createElement("label");
      l.textContent = "Graphics quality ";
      const s = document.createElement("select");
      s.setAttribute("aria-label", "Graphics quality");
      for (const q of ["low", "medium", "high"]) {
        const o = document.createElement("option");
        o.value = q;
        o.textContent = q.toUpperCase();
        s.appendChild(o);
      }
      s.value = level29Graphics.preferred || level29Graphics.quality;
      s.onchange = () => level29Graphics.setQuality(s.value);
      l.appendChild(s);
      dialog.appendChild(l);
      check(
        " Minimalist HUD — health, armor, ammo and action prompts only",
        "minimal",
      );
      check(" Show secondary trackers, minimap and arcade panels", "trackers");
      const pause = document.getElementById("pauseControls");
      if (pause) {
        text("Aim and camera");
        for (const id of ["pauseSensitivity", "pauseShake"]) {
          const input = pause.querySelector("#" + id);
          if (input) {
            const label = document.createElement("label");
            label.textContent =
              id === "pauseSensitivity" ? "Aim sensitivity" : "Camera shake";
            const clone = input.cloneNode();
            clone.removeAttribute("id");
            clone.setAttribute("aria-label", label.textContent);
            clone.oninput = () => {
              input.value = clone.value;
              input.dispatchEvent(new Event("change"));
            };
            label.appendChild(clone);
            dialog.appendChild(label);
          }
        }
      }
      text(
        "Low: bounded particles, no shadows/post effects. Medium: reduced particles and a single desktop shadow. High: larger particle budget; desktop experimental reflections remain opt-in.",
      );
    }
    if (page === "controls") {
      text(
        "Mouse: look / aim. Left click: fire. E: use / talk. G: enter or exit vehicle. Shift: sprint. Escape: settings. Advanced controls appear as you encounter them. Rebind with an unused letter or number; legacy shortcuts are reserved.",
      );
      if (bindingNotice) {
        const status = text(bindingNotice);
        status.setAttribute("role", "status");
      }
      const table = document.createElement("table");
      dialog.appendChild(table);
      for (const action of Object.keys(level29Bindings.DEFAULTS)) {
        const row = table.insertRow();
        row.insertCell().textContent = action.replace(/slot(\d)/, "Weapon $1");
        const cell = row.insertCell();
        add(
          level29Bindings.label(action),
          () => {
            const b = cell.querySelector("button");
            b.textContent = "PRESS KEY · ESC CANCEL";
            level29Bindings.capture((key) => {
              bindingNotice =
                key === null
                  ? "Binding unchanged."
                  : level29Bindings.change(action, key)
                    ? "Binding saved."
                    : "Key unavailable or already assigned. Choose another key.";
              draw();
            });
          },
          cell,
        );
      }
      add("RESET DEFAULT BINDINGS", () => {
        level29Bindings.reset();
        draw();
      });
      text(
        "Advanced: U legacy use, Q weapon wheel (hold), T cheat console, F6 bounty dispatch, F7 heist dispatch, F8 flashbang, F9 smoke. These cannot be rebound in this version.",
      );
    }
    if (page === "journal") {
      text(
        mission
          ? mission.info.title + " · " + objective
          : "No active mission. Explore the city and meet your contacts.",
      );
      text("Game cash: $" + Math.floor(cash || 0));
      add(settings.trackers ? "COLLAPSE TRACKERS" : "EXPAND TRACKERS", () => {
        settings.trackers = !settings.trackers;
        persist();
        draw();
      });
      for (const [label, fn] of [
        ["CITY JOURNAL / ROUTES", () => window.level29CityCareers?.show("map")],
        ["SURVIVOR OPERATIONS", () => window.level29SurvivorStories?.show()],
        [
          "START BOUNTY DISPATCH",
          () => window.level29CityEvents?.dispatchStart("bounty"),
        ],
        [
          "START NIGHT HEIST",
          () => window.level29CityEvents?.dispatchStart("heist"),
        ],
        [
          "SURVIVAL / PERKS / LOCAL RECORDS",
          () => window.level29SurvivalExpansion?.show(),
        ],
      ])
        add(label, () => {
          close();
          fn();
        });
      const slot = document.getElementById("hudMapActions");
      for (const b of slot?.querySelectorAll("button") || [])
        if (b.isConnected)
          add(b.textContent, () => {
            close();
            b.click();
          });
    }
    if (page === "crew") {
      const community = document.createElement("a");
      if (location.protocol !== "https:" && location.hostname !== "localhost")
        community.hidden = true;
      community.href = "/game/community.html";
      community.target = "_blank";
      community.rel = "noopener";
      community.textContent =
        "ONLINE ACCOUNTS / FRIENDS / RANKINGS / FIND CREW";
      community.style.cssText =
        "display:block;min-height:44px;padding:12px;color:#e5cb8d";
      dialog.appendChild(community);
      const code = typeof MP !== "undefined" ? MP.code : "";
      text(
        code
          ? "CREW CODE: " + code
          : "Host a co-op room, then share its code or link. The host must stay online.",
      );
      if (code)
        add("COPY INVITE LINK", async () => {
          const url = new URL(location.href);
          url.pathname = "/game/index.html";
          url.search = "";
          url.searchParams.set("room", code);
          try {
            await navigator.clipboard.writeText(url.href);
            text("Invite copied.");
          } catch (_) {
            text(url.href);
          }
        });
      const input = document.createElement("input");
      input.maxLength = 4;
      input.placeholder = "ROOM CODE";
      input.setAttribute("aria-label", "Crew room code");
      dialog.appendChild(input);
      add("JOIN CREW", () => {
        const code = input.value.toUpperCase().trim();
        if (!/^[A-Z0-9]{4}$/.test(code))
          return text("Enter a four-character code.");
        close();
        window.__mp?.join(code);
      });
      add("HOST / MULTIPLAYER", () => {
        close();
        window.__mp?.open();
      });
      text(
        "Open Online Community for accounts, friends, casual rankings and live crew listings. Local records remain separate.",
      );
    }
  }
  button.onclick = () => open();
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
  const oldPause = window.level29Pause;
  if (oldPause) oldPause.open = () => open();
  document.getElementById("pauseControls")?.classList.add("ux-replaced");
  // Convert the old menu's wall of shortcuts into a short baseline and one controls entry.
  for (const el of document.querySelectorAll("#menu .keys"))
    el.textContent =
      "WASD move · Mouse aim · Click fire · E use · G vehicle · 1–4 weapons";
  const menu = document.getElementById("main-view-3");
  if (menu) add("CONTROLS / HUD / JOURNAL", () => open(), menu);
  let lastTipCheck = 0;
  const tick = update;
  update = function () {
    tick.apply(this, arguments);
    const max = level29RuntimePolicy.budget.particles;
    let left = max;
    for (let i = parts.length - 1; i >= 0; i--)
      if (parts[i].k !== "corpse" && --left < 0) parts.splice(i, 1);
    if (state !== "play" || performance.now() - lastTipCheck < 800) return;
    lastTipCheck = performance.now();
    if (window.level29Prologue?.active || nearStation())
      note(
        "use",
        level29Bindings.label("interact") +
          " · Interact with a contact or shop.",
      );
    else if (player?.car)
      note(
        "vehicle",
        level29Bindings.label("vehicle") +
          " · Leave vehicle. WASD drive; Shift boosts.",
      );
    else if (Object.keys(arsenal || {}).filter((id) => hasW(id)).length > 1)
      note("wheel", "Hold Q to browse weapons. 1–4 select primary slots.");
    if (
      window.level29SouthernCombat?.stash.flash > 0 &&
      zombies.some(
        (z) => z.alive && Math.hypot(z.x - player.x, z.y - player.y) < 100,
      )
    )
      note("utility", "F8 flashbang · F9 smoke. Charges are limited.");
    if (window.level29CityEvents?.dispatch)
      note(
        "dispatch",
        "F6 bounty dispatch · F7 heist dispatch. See Journal for routes.",
      );
  };
  const renderBase = render;
  render = function () {
    renderBase.apply(this, arguments);
    for (const id of ["prologueAction", "venueAction"]) {
      const el = document.getElementById(id);
      if (el && /^U [·:] /.test(el.textContent))
        el.textContent = el.textContent.replace(
          /^U/,
          level29Bindings.label("interact"),
        );
    }
    document.body.classList.toggle("ux-shop", state === "shop");
    button.hidden = !["play", "pause", "menu"].includes(state);
    tip.hidden =
      state !== "play" || performance.now() > tipUntil || settings.minimal;
  };
  addEventListener("keydown", (e) => {
    if (
      state !== "play" ||
      e.target?.closest?.("input,textarea,select,dialog[open]")
    )
      return;
    if (e.key.toLowerCase() === "t")
      note(
        "cheats",
        "T opens the optional cheat console. Close it with Escape.",
      );
  });
  // Legacy shops retain their own purchase/close logic; give their DOM panels a focus boundary.
  addEventListener(
    "keydown",
    (e) => {
      if (
        state !== "shop" ||
        e.key !== "Tab" ||
        document.querySelector("dialog[open]")
      )
        return;
      const panel = [
        ...document.querySelectorAll(
          "#shop,#progressionPanel,#inventoryPanel,#southernServices",
        ),
      ].find(
        (n) =>
          n.getClientRects().length && getComputedStyle(n).display !== "none",
      );
      if (!panel) return;
      const items = [
        ...panel.querySelectorAll(
          "button:not(:disabled),input,select,textarea,a[href]",
        ),
      ].filter((n) => n.getClientRects().length);
      if (!items.length) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const index = items.indexOf(document.activeElement);
      items[
        (index + (e.shiftKey ? -1 : 1) + items.length) % items.length
      ].focus();
    },
    true,
  );
  const room = new URLSearchParams(location.search).get("room");
  if (room && /^[A-Z0-9]{4}$/.test(room.toUpperCase())) {
    const target = document.querySelector(
      'input[aria-label="Multiplayer room code"]',
    );
    if (target) target.value = room.toUpperCase();
    add(
      "JOIN INVITED CREW " + room.toUpperCase(),
      () => window.__mp?.join(room.toUpperCase()),
      document.getElementById("main-view-0") || document.body,
    );
  }
  persist();
  window.level29UX = {
    open,
    close,
    note,
    get minimal() {
      return settings.minimal;
    },
    get trackers() {
      return settings.trackers;
    },
    get modalOpen() {
      return dialog.open;
    },
  };
})();
