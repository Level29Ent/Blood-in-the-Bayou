"use strict";
(function () {
  const KEY = "level29.campaign.v2",
    BACKUP = "level29.backups.v1";
  const KEYS = [
    "level29.wardrobe.v1",
    "level29.wardrobe-owned.v1",
    "level29.downtown.v1",
    "level29.survival-expansion.v1",
    "level29.bindings.v1",
    "level29.experience.v1",
    KEY,
    "level29.places.v1",
    "level29.venues.v1",
    "level29.openworld.v1",
    "level29.guard.v1",
    "level29.jobs.v1",
    "level29.shelter-search.v1",
    "level29.trading.v1",
    "level29.bank-sublevels.v1",
    "level29.boomcity.v1",
    "level29.buildings.v2",
    "level29.city-stories.v1",
    "level29.citycareers-active.v1",
    "level29.citycareers.v1",
    "level29.context-tips.v1",
    "level29.controls.v1",
    "level29.daily.v1",
    "level29.heists.v1",
    "level29.laundering.v1",
    "level29.life.v1",
    "level29.pause-controls.v1",
    "level29.powell.v1",
    "level29.progression.v1",
    "level29.properties.v1",
    "level29.quarantine-surgical.v1",
    "level29.southern.v1",
    "level29.spin.v1",
    "level29.survivalstories.v1",
    "level29.zoo-tour.v1",
  ];
  const LIMIT = 2 * 1024 * 1024;
  function safeTree(value, depth = 0, budget = { n: 0 }) {
    if (++budget.n > 80000 || depth > 24) throw Error("Save is too complex.");
    if (typeof value === "number" && !Number.isFinite(value))
      throw Error("Invalid number.");
    if (value && typeof value === "object")
      for (const k of Object.keys(value)) {
        if (["__proto__", "constructor", "prototype"].includes(k))
          throw Error("Unsafe save field.");
        safeTree(value[k], depth + 1, budget);
      }
    return value;
  }
  function campaign(s) {
    safeTree(s);
    if (
      !s ||
      s.v !== 2 ||
      !Number.isInteger(s.missionIdx) ||
      s.missionIdx < 0 ||
      s.missionIdx > 209 ||
      !Number.isFinite(s.cash) ||
      s.cash < 0 ||
      s.cash > 1e12
    )
      throw Error("Invalid campaign checkpoint.");
    for (const k of ["completed", "packages", "jumps", "rampages"])
      if (
        s[k] !== undefined &&
        (!Array.isArray(s[k]) ||
          s[k].some((x) =>
            k === "completed"
              ? !Number.isInteger(x) || x < 0 || x > 209
              : typeof x !== "string" || x.length > 100,
          ))
      )
        throw Error("Invalid " + k + ".");
    for (const k of ["up", "arsenal"])
      if (
        s[k] !== undefined &&
        (!s[k] ||
          Array.isArray(s[k]) ||
          typeof s[k] !== "object" ||
          Object.values(s[k]).some(
            (x) =>
              !(Number.isFinite(x) && x >= 0) &&
              !(k === "arsenal" && x === "inf") &&
              !(k === "up" && typeof x === "boolean"),
          ))
      )
        throw Error("Invalid " + k + ".");
    if (
      s.maxHp !== undefined &&
      (!Number.isFinite(s.maxHp) || s.maxHp < 1 || s.maxHp > 1e7)
    )
      throw Error("Invalid health.");
    if (s.rest && (!Number.isFinite(s.rest.x) || !Number.isFinite(s.rest.y)))
      throw Error("Invalid rest point.");
    if (
      s.partial &&
      (s.partial.idx !== s.missionIdx || typeof s.partial.kind !== "string")
    )
      throw Error("Invalid stage checkpoint.");
    if (s.partial) {
      const p = s.partial,
        point = (q) => q && Number.isFinite(q.x) && Number.isFinite(q.y),
        nonnegative = (n) => Number.isFinite(n) && n >= 0;
      if (
        ![
          "race",
          "clear",
          "deliver",
          "rescue",
          "defend",
          "boss",
          "extended",
          "rob",
          "op",
        ].includes(p.kind)
      )
        throw Error("Unknown checkpoint type.");
      if (
        p.kind === "race" &&
        (!Array.isArray(p.cks) ||
          !p.cks.length ||
          p.cks.some((q) => !point(q)) ||
          !Number.isInteger(p.ckIdx) ||
          p.ckIdx < 0 ||
          p.ckIdx >= p.cks.length ||
          !nonnegative(p.timer))
      )
        throw Error("Invalid race checkpoint.");
      if (p.kind === "deliver" && !point(p.drop))
        throw Error("Invalid delivery checkpoint.");
      if (
        (p.kind === "clear" && !nonnegative(p.kills)) ||
        (p.kind === "defend" && !nonnegative(p.holdT)) ||
        (p.kind === "boss" && (!nonnegative(p.frac) || p.frac > 1))
      )
        throw Error("Invalid combat checkpoint.");
      if (
        (p.kind === "op" && (!Number.isInteger(p.si) || p.si < 0)) ||
        (p.kind === "rob" && !nonnegative(p.loot))
      )
        throw Error("Invalid operation checkpoint.");
      if (
        p.kind === "extended" &&
        (!p.extra ||
          !["field", "extract"].includes(p.extra.stage) ||
          !point(p.extra.field) ||
          !point(p.extra.extraction) ||
          !nonnegative(p.extra.hold) ||
          !nonnegative(p.extra.required) ||
          !nonnegative(p.extra.extractRequired) ||
          !nonnegative(p.timer))
      )
        throw Error("Invalid extended checkpoint.");
    }
    return s;
  }
  function bundle(raw) {
    if (
      !raw ||
      typeof raw !== "object" ||
      Array.isArray(raw) ||
      JSON.stringify(raw).length > LIMIT
    )
      throw Error("Invalid or oversized save.");
    const out = {};
    for (const [k, v] of Object.entries(raw)) {
      if (!KEYS.includes(k) || typeof v !== "string")
        throw Error("Unknown save record.");
      if (v.length > LIMIT) throw Error("Oversized record.");
      safeTree(JSON.parse(v));
      out[k] = v;
    }
    campaign(JSON.parse(out[KEY] || "null"));
    return out;
  }
  function collect(storage) {
    const out = {};
    for (const k of KEYS) {
      const v = storage.getItem(k);
      if (v !== null) out[k] = v;
    }
    return bundle(out);
  }
  function backups(storage) {
    try {
      return JSON.parse(storage.getItem(BACKUP) || "[]")
        .filter((b) => {
          try {
            bundle(b.data);
            return Number.isFinite(b.at);
          } catch (_) {
            return false;
          }
        })
        .slice(0, 3);
    } catch (_) {
      return [];
    }
  }
  function backup(storage, required = false) {
    try {
      const data = collect(storage),
        list = backups(storage);
      if (JSON.stringify(list[0]?.data) === JSON.stringify(data)) return;
      storage.setItem(
        BACKUP,
        JSON.stringify([{ at: Date.now(), data }, ...list].slice(0, 3)),
      );
    } catch (e) {
      if (required && storage.getItem(KEY)) {
        // Preserve malformed records too, but never offer them as a valid checkpoint.
        const raw = {};
        for (const k of KEYS) {
          const v = storage.getItem(k);
          if (v !== null) raw[k] = v;
        }
        try {
          storage.setItem("level29.recovery-raw.v1", JSON.stringify(raw));
        } catch (_) {
          throw Error(
            "Cannot preserve current save; free storage before importing.",
          );
        }
      }
    }
  }
  function install(storage, raw) {
    const data = bundle(raw),
      old = new Map(KEYS.map((k) => [k, storage.getItem(k)]));
    backup(storage, true);
    try {
      for (const k of KEYS)
        if (Object.hasOwn(data, k)) storage.setItem(k, data[k]);
        else storage.removeItem(k);
    } catch (e) {
      // A quota failure must not leave a half-imported multi-record save.
      for (const k of KEYS) storage.removeItem(k);
      for (const [k, v] of old) if (v !== null) storage.setItem(k, v);
      throw e;
    }
    return data;
  }
  const INGREDIENTS = ["herb", "bark", "reed"];
  const RECIPES = {
    poultice: { herb: 2 },
    tonic: { herb: 1, bark: 1 },
    charm: { bark: 1, reed: 2 },
  };
  function fresh(raw) {
    const s = {
      v: 1,
      chapter: 0,
      step: 0,
      choice: "",
      active: false,
      clues: [],
      paid: [],
      gathered: [],
      ingredients: { herb: 0, bark: 0, reed: 0 },
      tips: [],
    };
    if (raw?.v !== 1) return s;
    for (const k of ["chapter", "step"])
      s[k] = Number.isInteger(raw[k])
        ? Math.max(0, Math.min(k === "chapter" ? 3 : 2, raw[k]))
        : 0;
    s.choice = ["shelter", "broadcast"].includes(raw.choice) ? raw.choice : "";
    if (s.chapter > 0) s.step = Math.min(1, s.step);
    s.active = raw.active === true && s.chapter < 3;
    for (const k of ["clues", "paid", "gathered", "tips"])
      s[k] = [
        ...new Set(
          (Array.isArray(raw[k]) ? raw[k] : []).filter(
            (x) => typeof x === "string",
          ),
        ),
      ].slice(0, 200);
    for (const k of INGREDIENTS)
      s.ingredients[k] = Math.max(
        0,
        Math.min(99, Math.floor(Number(raw.ingredients?.[k]) || 0)),
      );
    return s;
  }
  function craft(s, id) {
    const recipe = RECIPES[id];
    if (
      !recipe ||
      Object.entries(recipe).some(([k, n]) => s.ingredients[k] < n)
    )
      return false;
    for (const [k, n] of Object.entries(recipe)) s.ingredients[k] -= n;
    return true;
  }
  function gather(s, id, kind) {
    if (
      !INGREDIENTS.includes(kind) ||
      s.gathered.includes(id) ||
      s.ingredients[kind] >= 99
    )
      return false;
    s.gathered.push(id);
    s.ingredients[kind]++;
    return true;
  }
  function advance(
    s,
    action,
    {
      near = false,
      onFoot = false,
      alive = false,
      quiet = false,
      choice = "",
    } = {},
  ) {
    if (!s.active || s.chapter >= 3 || !near || !onFoot || !alive) return null;
    if (s.chapter === 0) {
      if (!["sam", "lab", "ronnie"].includes(action)) return null;
      const expected = ["sam", "lab", "ronnie"][s.step];
      if (action !== expected) return null;
      s.clues.push(action);
      if (s.step < 2) {
        s.step++;
        return { pay: 0 };
      }
    } else if (s.chapter === 1) {
      if (action !== ["cache", "handoff"][s.step] || (s.step === 0 && !quiet))
        return null;
      if (s.step === 0) {
        s.step = 1;
        return { pay: 0 };
      }
    } else {
      if (s.step === 0) {
        if (action !== "decision" || !["shelter", "broadcast"].includes(choice))
          return null;
        s.choice = choice;
        s.step = 1;
        return { pay: 0 };
      }
      if (action !== s.choice) return null;
    }
    const id = "chapter:" + s.chapter,
      pay = s.paid.includes(id) ? 0 : [400, 650, 1000][s.chapter];
    if (pay) s.paid.push(id);
    s.chapter++;
    s.step = 0;
    s.active = false;
    return { pay, complete: true };
  }
  const api = {
    KEY,
    BACKUP,
    KEYS,
    LIMIT,
    campaign,
    bundle,
    collect,
    backups,
    backup,
    install,
    fresh,
    INGREDIENTS,
    RECIPES,
    craft,
    gather,
    advance,
  };
  if (typeof module !== "undefined") module.exports = api;
  if (typeof window !== "undefined") window.BayouPolishCore = api;
})();
