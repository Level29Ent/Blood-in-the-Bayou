"use strict";
(function () {
  let client = null,
    pending = null;
  async function connect() {
    if (client) return client;
    if (pending) return pending;
    pending = (async () => {
      const response = await fetch("/api/community/config", {
          cache: "no-store",
        }),
        config = await response.json();
      if (!response.ok || !config.ready)
        throw Error(config.message || "Supabase is not configured.");
      if (!window.BayouSupabase) {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "/game/vendor/community-client.js";
          s.onload = resolve;
          s.onerror = () => reject(Error("Account library could not load."));
          document.head.appendChild(s);
        });
      }
      client = BayouSupabase.createClient(config.url, config.key, {
        auth: {
          storageKey: "bitb.community.auth",
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      });
      return client;
    })().catch((e) => {
      pending = null;
      throw e;
    });
    return pending;
  }
  function result(response) {
    if (response.error) throw Error(response.error.message);
    return response.data;
  }
  async function user() {
    const c = await connect();
    const r = await c.auth.getUser();
    if (r.error || !r.data.user)
      throw Error("Sign in to use community features.");
    return r.data.user;
  }
  async function request(table, fn) {
    const c = await connect();
    return result(await fn(c.from(table)));
  }
  async function startRun(category) {
    await user();
    if (!["survival", "mission", "bounties"].includes(category))
      throw Error("Unknown run category.");
    await request("bitb_runs", (q) =>
      q.update({ finished: true }).eq("finished", false),
    );
    return await request("bitb_runs", (q) =>
      q.insert({ category }).select("id,category").single(),
    );
  }
  async function submit(run, value) {
    if (!Number.isFinite(value) || value < 1)
      throw Error("No completed activity to submit.");
    return request("bitb_scores", (q) =>
      q.insert({
        run_id: run.id,
        category: run.category,
        value: Math.max(1, Math.floor(value)),
      }),
    );
  }
  function inviteURL(origin, code) {
    if (!/^[A-Z0-9]{4}$/.test(code)) throw Error("Invalid lobby code");
    const url = new URL("/game/index.html", origin);
    url.searchParams.set("room", code);
    return url.href;
  }
  window.BayouCommunity = {
    connect,
    user,
    request,
    result,
    startRun,
    submit,
    inviteURL,
  };
})();
