"use strict";
(async function () {
  const S = BayouCommunity,
    status = document.getElementById("status"),
    content = document.getElementById("content");
  let tab = "account",
    me = null,
    version = 0,
    recovering =
      new URLSearchParams(location.hash.slice(1)).get("type") === "recovery";
  const message = (t) => (status.textContent = t);
  function text(t, parent = content, tag = "p") {
    const n = document.createElement(tag);
    n.textContent = t;
    parent.appendChild(n);
    return n;
  }
  function button(t, fn, parent = content) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = t;
    b.onclick = async () => {
      b.disabled = true;
      try {
        await fn();
      } catch (e) {
        message(e.message);
      } finally {
        b.disabled = false;
      }
    };
    parent.appendChild(b);
    return b;
  }
  function input(label, type = "text") {
    const l = text(label, content, "label"),
      i = document.createElement("input");
    i.type = type;
    i.setAttribute("aria-label", label);
    l.appendChild(i);
    return i;
  }
  function select(label, options) {
    const l = text(label, content, "label"),
      s = document.createElement("select");
    s.setAttribute("aria-label", label);
    for (const [v, t] of options) {
      const o = document.createElement("option");
      o.value = v;
      o.textContent = t;
      s.appendChild(o);
    }
    l.appendChild(s);
    return s;
  }
  async function refresh() {
    const token = ++version;
    content.replaceChildren();
    try {
      const c = await S.connect();
      const auth = await c.auth.getUser();
      me = auth.data.user;
      if (token !== version) return;
      for (const n of document.querySelectorAll("[data-tab]"))
        n.setAttribute("aria-current", String(n.dataset.tab === tab));
      if (!me || tab === "account") return await account(c);
      if (tab === "friends") await friends();
      else if (tab === "scores") await scores();
      else await lobbies();
    } catch (e) {
      message(
        "Community unavailable: " +
          e.message +
          " If tables are missing, the database migration still needs to be applied.",
      );
    }
  }
  async function account(c) {
    if (!me) {
      text(
        "Create an account or sign in. Confirm your email before signing in.",
      );
      const email = input("Email", "email"),
        password = input("Password", "password");
      password.minLength = 12;
      password.autocomplete = "current-password";
      email.autocomplete = "email";
      button("Sign in", async () => {
        S.result(
          await c.auth.signInWithPassword({
            email: email.value.trim(),
            password: password.value,
          }),
        );
        password.value = "";
        message("Signed in.");
        await refresh();
      });
      button("Create account", async () => {
        if (password.value.length < 12)
          throw Error("Use at least 12 characters.");
        S.result(
          await c.auth.signUp({
            email: email.value.trim(),
            password: password.value,
            options: {
              emailRedirectTo: location.origin + "/game/community.html",
            },
          }),
        );
        password.value = "";
        message("Check your email to confirm your account, then sign in.");
      });
      button("Reset password", async () => {
        S.result(
          await c.auth.resetPasswordForEmail(email.value.trim(), {
            redirectTo: location.origin + "/game/community.html",
          }),
        );
        message("If eligible, a recovery email has been sent.");
      });
      return;
    }
    text("Signed in as " + me.email);
    if (recovering) {
      const password = input("New password", "password");
      password.autocomplete = "new-password";
      button("Save new password", async () => {
        if (password.value.length < 12)
          throw Error("Use at least 12 characters.");
        S.result(await c.auth.updateUser({ password: password.value }));
        password.value = "";
        recovering = false;
        message("Password updated.");
        await refresh();
      });
      return;
    }
    button("Sign out", async () => {
      try {
        await S.request("bitb_lobbies", (q) => q.delete().eq("host", me.id));
      } catch (_) {
        /* Expiry removes stale listings; signing out must work without schema. */
      }
      S.result(await c.auth.signOut());
      localStorage.removeItem("bitb.community.enabled");
      localStorage.removeItem("bitb.community.run");
      message("Signed out; local campaign saves are unchanged.");
      await refresh();
    });
    const profile = await S.request("bitb_profiles", (q) =>
      q.select("id,handle").eq("id", me.id).maybeSingle(),
    );
    if (!profile) {
      const name = input(
        "Public handle (3–24 letters, numbers or underscores)",
      );
      button("Create public profile", async () => {
        if (!/^[A-Za-z0-9_]{3,24}$/.test(name.value))
          throw Error("Choose a valid handle.");
        await S.request("bitb_profiles", (q) =>
          q.insert({ handle: name.value }),
        );
        message("Public profile created.");
        await refresh();
      });
      return;
    }
    text("Public handle: " + profile.handle);
    text(
      "Handle is visible to signed-in players. Email and account tokens are never included in rankings or lobbies.",
    );
    const enabled = input("Opt in to uploading new casual runs", "checkbox");
    enabled.checked = localStorage.getItem("bitb.community.enabled") === "yes";
    enabled.onchange = () =>
      localStorage.setItem(
        "bitb.community.enabled",
        enabled.checked ? "yes" : "no",
      );
    const category = select("New run category", [
      ["survival", "Survival duration"],
      ["mission", "Mission clear time"],
      ["bounties", "Bounties per session"],
    ]);
    category.value =
      localStorage.getItem("bitb.community.category") || "survival";
    category.onchange = () =>
      localStorage.setItem("bitb.community.category", category.value);
    text(
      "Start a fresh game/session after changing this setting. Mission timing starts when you accept a mission. Scores require a minimum 5-second run; bounty submissions allow at most one per 20 seconds.",
    );
    button("Submit current run", async () => {
      const run = JSON.parse(
        localStorage.getItem("bitb.community.run") || "null",
      );
      if (!run) throw Error("No active opted-in run.");
      if (run.owner !== me.id)
        throw Error("This run belongs to another account.");
      if (run.category === "mission")
        throw Error(
          "Mission records submit only on actual mission completion.",
        );
      await S.submit(
        run,
        run.category === "bounties" ? run.bounties : Math.floor(run.seconds),
      );
      localStorage.removeItem("bitb.community.run");
      message("Casual record submitted. Start a new session for another run.");
    });
    button("Delete public profile and community data", async () => {
      if (
        !confirm(
          "Delete your public profile, scores, friends and lobby? Your login and local campaign save will remain.",
        )
      )
        return;
      await S.request("bitb_profiles", (q) => q.delete().eq("id", me.id));
      localStorage.removeItem("bitb.community.enabled");
      localStorage.removeItem("bitb.community.run");
      await refresh();
    });
  }
  async function friends() {
    const rows = await S.request("bitb_friends", (q) =>
      q.select("*").or("sender.eq." + me.id + ",recipient.eq." + me.id),
    );
    const ids = rows.map((f) => (f.sender === me.id ? f.recipient : f.sender)),
      profiles = ids.length
        ? await S.request("bitb_profiles", (q) =>
            q.select("id,handle").in("id", ids),
          )
        : [];
    const name = input("Exact public handle");
    button("Send friend request", async () => {
      const p = await S.request("bitb_profiles", (q) =>
        q.select("id").eq("handle", name.value.trim()).single(),
      );
      if (p.id === me.id) throw Error("Choose another player.");
      await S.request("bitb_friends", (q) => q.insert({ recipient: p.id }));
      message("Request sent.");
      await refresh();
    });
    if (!rows.length) text("No friend requests yet.");
    for (const f of rows) {
      const id = f.sender === me.id ? f.recipient : f.sender,
        row = document.createElement("article");
      content.appendChild(row);
      text(
        (profiles.find((p) => p.id === id)?.handle || "Deleted player") +
          " · " +
          (f.accepted
            ? "friends"
            : f.sender === me.id
              ? "request sent"
              : "incoming request"),
        row,
      );
      if (!f.accepted && f.recipient === me.id)
        button(
          "Accept",
          async () => {
            await S.request("bitb_friends", (q) =>
              q
                .update({ accepted: true })
                .eq("sender", f.sender)
                .eq("recipient", me.id),
            );
            await refresh();
          },
          row,
        );
      button(
        "Remove",
        async () => {
          await S.request("bitb_friends", (q) =>
            q.delete().eq("sender", f.sender).eq("recipient", f.recipient),
          );
          await refresh();
        },
        row,
      );
    }
  }
  async function scores() {
    text(
      "GLOBAL CASUAL RANKINGS · client-reported, bounded by database timing checks; not verified gameplay.",
    );
    const category = select("Category", [
        ["survival", "Longest survival (seconds)"],
        ["mission", "Fastest mission (seconds)"],
        ["bounties", "Most bounties per run"],
      ]),
      scope = select("Scope", [
        ["global", "Global"],
        ["friends", "Friends and me"],
      ]);
    const list = document.createElement("div");
    content.appendChild(list);
    let queryVersion = 0;
    async function load() {
      const v = ++queryVersion;
      list.replaceChildren();
      let ids = null;
      if (scope.value === "friends") {
        const f = await S.request("bitb_friends", (q) =>
          q.select("sender,recipient").eq("accepted", true),
        );
        ids = [
          me.id,
          ...f.map((r) => (r.sender === me.id ? r.recipient : r.sender)),
        ];
      }
      const rows = await S.request("bitb_scores", (q) => {
        q = q
          .select("owner,value,category")
          .eq("category", category.value)
          .order("value", { ascending: category.value === "mission" })
          .limit(100);
        return ids ? q.in("owner", ids) : q;
      });
      if (v !== queryVersion) return;
      const users = [...new Set(rows.map((r) => r.owner))],
        profiles = users.length
          ? await S.request("bitb_profiles", (q) =>
              q.select("id,handle").in("id", users),
            )
          : [];
      if (v !== queryVersion) return;
      if (!rows.length) {
        text("No submitted records in this category.", list);
        return;
      }
      const table = document.createElement("table");
      list.appendChild(table);
      const seen = new Set();
      let rank = 0;
      for (const r of rows) {
        if (seen.has(r.owner)) continue;
        seen.add(r.owner);
        const tr = document.createElement("tr");
        table.appendChild(tr);
        text(String(++rank), tr, "td");
        text(
          profiles.find((p) => p.id === r.owner)?.handle || "Player",
          tr,
          "td",
        );
        text(
          String(r.value) + (category.value === "bounties" ? "" : "s"),
          tr,
          "td",
        );
      }
    }
    category.onchange = scope.onchange = () =>
      load().catch((e) => message(e.message));
    await load();
    text(
      "Showing best records per player from the top 100 runs. Missions currently share one casual category, not comparable mission-specific competitive tiers.",
    );
  }
  async function lobbies() {
    text(
      "Live host listings expire after 90 seconds without a heartbeat. Listings do not reserve a seat; joining uses the existing PeerJS room code.",
    );
    const visibility = select("When hosting, publish to", [
      ["off", "Do not publish"],
      ["friends", "Accepted friends only"],
      ["public", "All signed-in players"],
    ]);
    visibility.value = localStorage.getItem("bitb.community.lobby") || "off";
    visibility.onchange = async () => {
      localStorage.setItem("bitb.community.lobby", visibility.value);
      if (visibility.value === "off")
        await S.request("bitb_lobbies", (q) => q.delete().eq("host", me.id));
      message("Host visibility saved.");
    };
    const list = document.createElement("div");
    content.appendChild(list);
    async function load() {
      const rows = await S.request("bitb_lobbies", (q) =>
        q
          .select("host,code,players,visibility")
          .gt("updated_at", new Date(Date.now() - 90000).toISOString())
          .lt("players", 6)
          .order("updated_at", { ascending: false })
          .limit(30),
      );
      list.replaceChildren();
      const publicRoom = rows.find(
        (r) => r.host !== me.id && r.visibility === "public",
      );
      if (publicRoom)
        button(
          "Quick join a public crew",
          () => {
            location.assign(S.inviteURL(location.origin, publicRoom.code));
          },
          list,
        );
      if (!rows.length)
        text("No open crews. Host a game and opt in to publishing it.", list);
      for (const r of rows) {
        const row = document.createElement("article");
        list.appendChild(row);
        text(
          "Room " + r.code + " · " + r.players + "/6 · " + r.visibility,
          row,
        );
        const link = document.createElement("a");
        link.href = S.inviteURL(location.origin, r.code);
        link.textContent = "Join room";
        row.appendChild(link);
      }
    }
    button("Refresh live crews", load);
    await load();
  }
  for (const b of document.querySelectorAll("[data-tab]"))
    b.onclick = () => {
      tab = b.dataset.tab;
      refresh();
    };
  try {
    const c = await S.connect();
    c.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        recovering = true;
        setTimeout(() => refresh(), 0);
      }
    });
    message("Supabase configured. Sign in to continue.");
    await refresh();
  } catch (e) {
    message(e.message);
  }
})();
