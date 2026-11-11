const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  vm = require("node:vm"),
  fs = require("node:fs");
const { publicConfig } = require("../lib/community-config.cjs");
test("public configuration fails closed on secret/legacy keys and invalid endpoints", () => {
  for (const key of ["sb_secret_hidden", "eyJhbGciOiJWT", "", undefined]) {
    const c = publicConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key,
    });
    assert.equal(c.ready, false);
    assert.equal(c.key, undefined);
  }
  for (const url of [
    "http://example.supabase.co",
    "https://example.com",
    "https://secret@example.supabase.co",
  ])
    assert.equal(
      publicConfig({
        NEXT_PUBLIC_SUPABASE_URL: url,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
      }).ready,
      false,
    );
  assert.equal(
    publicConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
    }).ready,
    true,
  );
});
test("community client bounds score submissions, does not expose admin keys, and builds local lobby links", async () => {
  const c = {
    window: null,
    URL,
    fetch: async () => ({
      ok: true,
      json: async () => ({
        ready: true,
        url: "https://fixture.supabase.co",
        key: "sb_publishable_fixture",
      }),
    }),
    BayouSupabase: {
      createClient: () => ({
        from: () => ({ insert: (v) => ({ data: v, error: null }) }),
      }),
    },
  };
  c.window = c;
  vm.createContext(c);
  vm.runInContext(
    fs.readFileSync("public/game/community-service.js", "utf8"),
    c,
  );
  await assert.rejects(
    c.BayouCommunity.submit({ id: "a", category: "bounties" }, 0),
    /No completed/,
  );
  const r = await c.BayouCommunity.submit(
    { id: "a", category: "survival" },
    12.9,
  );
  assert.equal(r.value, 12);
  assert.equal(
    c.BayouCommunity.inviteURL("https://game.test", "AB12"),
    "https://game.test/game/index.html?room=AB12",
  );
  assert.throws(() =>
    c.BayouCommunity.inviteURL("https://game.test", "evil/path"),
  );
});
