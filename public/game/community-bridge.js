"use strict";
(function () {
  if (location.protocol !== "https:" && location.hostname !== "localhost")
    return;
  // Lazy connection: accounts and networking never block the game loop or alter campaign saves.
  let run = null,
    starting = false,
    epoch = 0,
    seconds = 0,
    bounties = 0,
    lastFrame = null,
    persistAt = 0,
    heartbeatAt = 0,
    publishing = false,
    notice = "";
  function opted() {
    try {
      return localStorage.getItem("bitb.community.enabled") === "yes";
    } catch (_) {
      return false;
    }
  }
  function category() {
    try {
      return localStorage.getItem("bitb.community.category") || "survival";
    } catch (_) {
      return "survival";
    }
  }
  function say(text) {
    notice = text;
    window.level29SessionRecovery?.record("community", text);
  }
  function persist() {
    if (!run) return;
    try {
      localStorage.setItem(
        "bitb.community.run",
        JSON.stringify({ ...run, seconds: Math.floor(seconds), bounties }),
      );
    } catch (_) {}
  }
  async function begin(kind) {
    if (!opted() || starting || mpRole) return;
    const token = ++epoch;
    starting = true;
    run = null;
    seconds = 0;
    bounties = 0;
    try {
      const owner = await BayouCommunity.user(),
        data = await BayouCommunity.startRun(kind);
      if (token !== epoch) {
        await BayouCommunity.request("bitb_runs", (q) =>
          q.update({ finished: true }).eq("id", data.id),
        );
        return;
      }
      run = { ...data, owner: owner.id };
      persist();
      say("Casual " + kind + " run started.");
    } catch (e) {
      say("Online records unavailable: " + e.message);
    } finally {
      starting = false;
    }
  }
  async function finish() {
    const record = run;
    if (!record) return;
    run = null;
    epoch++;
    try {
      if (!opted()) return;
      const owner = await BayouCommunity.user();
      if (owner.id !== record.owner) return;
      await BayouCommunity.submit(
        record,
        record.category === "bounties" ? bounties : Math.floor(seconds),
      );
      say("Casual record submitted.");
    } catch (e) {
      say("Casual record not submitted: " + e.message);
    } finally {
      try {
        const stored = JSON.parse(
          localStorage.getItem("bitb.community.run") || "null",
        );
        if (stored?.id === record.id)
          localStorage.removeItem("bitb.community.run");
      } catch (_) {}
    }
  }
  const start = startGame;
  startGame = function () {
    epoch++;
    run = null;
    const r = start.apply(this, arguments);
    lastFrame = frame;
    if (category() !== "mission" && opted()) begin(category());
    return r;
  };
  const missionBegin = beginMission;
  beginMission = function () {
    const r = missionBegin.apply(this, arguments);
    if (mission?.phase === "active" && opted() && category() === "mission")
      begin("mission");
    return r;
  };
  const pass = passMission;
  passMission = function () {
    const eligible = mission?.phase === "active";
    const r = pass.apply(this, arguments);
    if (eligible && run?.category === "mission") finish();
    return r;
  };
  const fail = failMission;
  failMission = function () {
    if (run?.category === "mission") {
      const id = run.id;
      run = null;
      epoch++;
      BayouCommunity.request("bitb_runs", (q) =>
        q.update({ finished: true }).eq("id", id),
      ).catch((e) => say(e.message));
    }
    return fail.apply(this, arguments);
  };
  const death = killPlayer;
  killPlayer = function () {
    if (run && run.category !== "mission") {
      persist();
      finish();
    } else {
      epoch++;
      run = null;
    }
    return death.apply(this, arguments);
  };
  addEventListener("level29:bounty-complete", () => {
    if (run?.category === "bounties") {
      bounties++;
      persist();
    }
  });
  async function publish() {
    if (publishing) return;
    publishing = true;
    try {
      const visibility = localStorage.getItem("bitb.community.lobby") || "off";
      if (
        !["public", "friends"].includes(visibility) ||
        mpRole !== "host" ||
        !MP.code
      )
        return;
      const user = await BayouCommunity.user();
      await BayouCommunity.request("bitb_lobbies", (q) =>
        q.upsert({
          host: user.id,
          code: MP.code,
          players: Math.min(6, 1 + MP.conns.size),
          visibility,
        }),
      );
    } catch (e) {
      say("Lobby listing unavailable: " + e.message);
    } finally {
      publishing = false;
    }
  }
  const tick = update;
  update = function () {
    const before = state;
    tick.apply(this, arguments);
    const now = performance.now();
    if (run && (!opted() || before === "menu")) {
      epoch++;
      run = null;
    }
    if (
      run &&
      before === "play" &&
      state === "play" &&
      !mpRole &&
      !player?.dead
    ) {
      seconds += Math.min(
        0.1,
        Math.max(0, (frame - (lastFrame ?? frame)) / 60),
      );
      if (now - persistAt > 5000) {
        persistAt = now;
        persist();
      }
    }
    lastFrame = frame;
    if (now - heartbeatAt > 25000) {
      heartbeatAt = now;
      publish();
    }
  };
  addEventListener("pagehide", persist);
  addEventListener("storage", (e) => {
    if (e.key === "bitb.community.run" && !e.newValue) {
      epoch++;
      run = null;
    }
    if (e.key === "bitb.community.enabled" && e.newValue !== "yes") {
      epoch++;
      run = null;
    }
  });
  const menu =
    document.getElementById("main-view-0") ||
    document.querySelector("#menu .copy");
  if (menu) {
    const a = document.createElement("a");
    a.href = "/game/community.html";
    a.textContent = "ACCOUNTS / FRIENDS / RANKINGS / FIND CREW";
    a.style.cssText =
      "display:block;min-height:44px;padding:12px;color:#e1c781";
    menu.appendChild(a);
  }
  const pause = document.getElementById("experienceButton");
  if (pause) {
    const old = window.level29UX.open;
    window.level29UX.open = function () {
      const r = old.apply(this, arguments);
      const dialog = document.getElementById("experienceDialog");
      if (dialog && !dialog.querySelector("[data-community-link]")) {
        const a = document.createElement("a");
        a.dataset.communityLink = "true";
        a.href = "/game/community.html";
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = "ONLINE ACCOUNTS / FRIENDS / CREWS";
        a.style.cssText =
          "display:block;min-height:44px;padding:10px;color:#e5cb8d";
        dialog.appendChild(a);
      }
      return r;
    };
  }
  window.level29CommunityBridge = {
    finish,
    get status() {
      return notice;
    },
  };
})();
