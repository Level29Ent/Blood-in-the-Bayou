"use strict";
(function () {
  const DEFAULTS = {
    forward: "w",
    back: "s",
    left: "a",
    right: "d",
    interact: "e",
    vehicle: "g",
    slot1: "1",
    slot2: "2",
    slot3: "3",
    slot4: "4",
  };
  const RESERVED = new Set([
    "escape",
    "tab",
    "p",
    "q",
    "t",
    "u",
    "f6",
    "f7",
    "f8",
    "f9",
    "shift",
    " ",
    "enter",
    "r",
    "h",
    "m",
    "n",
    "f",
    "j",
    "b",
    "c",
    "x",
    "v",
    "i",
    "z",
    "l",
    "o",
    "k",
    "5",
    "6",
    "7",
    "8",
    "9",
    "0",
  ]);
  function validate(bindings) {
    if (
      !bindings ||
      Object.keys(DEFAULTS).some(
        (a) =>
          typeof bindings[a] !== "string" ||
          !/^[a-z0-9]$/.test(bindings[a]) ||
          RESERVED.has(bindings[a]),
      )
    )
      return false;
    return (
      new Set(Object.keys(DEFAULTS).map((a) => bindings[a])).size ===
      Object.keys(DEFAULTS).length
    );
  }
  function change(bindings, action, key) {
    key = String(key).toLowerCase();
    const next = { ...bindings, [action]: key };
    return Object.hasOwn(DEFAULTS, action) && validate(next) ? next : null;
  }
  if (typeof module !== "undefined")
    module.exports = { DEFAULTS, validate, change };
  if (typeof window === "undefined") return;
  let bindings = { ...DEFAULTS };
  try {
    const b = JSON.parse(localStorage.getItem("level29.bindings.v1"));
    if (validate(b)) bindings = b;
  } catch (_) {}
  const generated = new WeakSet(),
    held = new Map();
  let capture = null;
  function emit(type, key, repeat = false) {
    const event = new KeyboardEvent(type, {
      key,
      bubbles: true,
      cancelable: true,
      repeat,
    });
    generated.add(event);
    window.dispatchEvent(event);
  }
  function release() {
    for (const key of held.values()) emit("keyup", key);
    held.clear();
  }
  function stop(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
  }
  function input(e) {
    if (generated.has(e)) return;
    if (capture && e.type === "keydown") {
      stop(e);
      if (e.key === "Escape") {
        const fn = capture;
        capture = null;
        fn(null);
        return;
      }
      const fn = capture;
      capture = null;
      fn(e.key);
      return;
    }
    if (
      e.target?.closest?.(
        'input,textarea,select,[contenteditable="true"],dialog[open]',
      )
    )
      return;
    const physical = e.code || e.key;
    if (e.type === "keyup" && held.has(physical)) {
      stop(e);
      emit("keyup", held.get(physical));
      held.delete(physical);
      return;
    }
    if (window.level29UX?.modalOpen && e.key === "Escape") {
      stop(e);
      window.level29UX.close();
      return;
    }
    if (
      typeof state !== "undefined" &&
      state === "play" &&
      e.type === "keydown" &&
      ["escape", "p"].includes(e.key.toLowerCase()) &&
      window.level29UX
    ) {
      stop(e);
      window.level29UX.open();
      return;
    }
    if (
      typeof state === "undefined" ||
      state !== "play" ||
      window.level29UX?.modalOpen ||
      window.level29RuntimeResources?.lost
    )
      return;
    const key = e.key.toLowerCase(),
      action = Object.keys(bindings).find((a) => bindings[a] === key);
    if (action) {
      stop(e);
      if (e.type === "keyup") return;
      if (action === "interact") {
        if (!e.repeat) {
          held.set(physical, "u");
          emit("keydown", "u");
        }
        return;
      }
      if (action === "vehicle") {
        if (!e.repeat) {
          held.set(physical, "e");
          emit("keydown", "e");
        }
        return;
      }
      const canonical = DEFAULTS[action];
      held.set(physical, canonical);
      emit("keydown", canonical, e.repeat);
      return;
    }
    // Rebound physical defaults must not still perform their old action.
    if (
      Object.values(DEFAULTS).includes(key) &&
      !Object.values(bindings).includes(key)
    )
      stop(e);
  }
  for (const type of ["keydown", "keyup"]) addEventListener(type, input, true);
  addEventListener("blur", release);
  window.level29Bindings = {
    get values() {
      return { ...bindings };
    },
    DEFAULTS,
    change(action, key) {
      const next = change(bindings, action, key);
      if (!next) return false;
      release();
      bindings = next;
      try {
        localStorage.setItem("level29.bindings.v1", JSON.stringify(bindings));
      } catch (_) {}
      return true;
    },
    reset() {
      release();
      bindings = { ...DEFAULTS };
      try {
        localStorage.removeItem("level29.bindings.v1");
      } catch (_) {}
    },
    capture(fn) {
      release();
      capture = fn;
    },
    cancel() {
      capture = null;
      release();
    },
    label(action) {
      return (bindings[action] || action).toUpperCase();
    },
    release,
  };
})();
