const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs");
const { PGlite } = require("@electric-sql/pglite");
test("cloud backups isolate owners and use server-side compare-and-swap for create/update", async () => {
  const db = new PGlite(),
    a = "11111111-1111-4111-8111-111111111111",
    b = "22222222-2222-4222-8222-222222222222";
  try {
    await db.exec(
      `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;insert into auth.users values('${a}'),('${b}');`,
    );
    await db.exec(
      fs.readFileSync(
        "supabase/migrations/202611160001_cloud_saves.sql",
        "utf8",
      ),
    );
    const as = async (id) => {
      await db.exec("reset role");
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
        id,
      ]);
      await db.exec("set role authenticated");
    };
    const payload = {
      "level29.campaign.v2": JSON.stringify({ v: 2, missionIdx: 2, cash: 50 }),
    };
    await db.exec("set role anon");
    await assert.rejects(
      db.query("select * from public.bitb_cloud_saves"),
      /permission denied/,
    );
    await assert.rejects(
      db.query("select public.bitb_put_save($1,0)", [payload]),
      /permission denied/,
    );
    await as(a);
    assert.equal(
      (
        await db.query("select public.bitb_put_save($1,0) as revision", [
          payload,
        ])
      ).rows[0].revision,
      1,
    );
    await assert.rejects(
      db.query("select public.bitb_put_save($1,0)", [payload]),
      /revision conflict/,
    );
    assert.equal(
      (
        await db.query("select public.bitb_put_save($1,1) as revision", [
          payload,
        ])
      ).rows[0].revision,
      2,
    );
    await assert.rejects(
      db.query("select public.bitb_put_save($1,1)", [payload]),
      /revision conflict/,
    );
    await assert.rejects(
      db.query("update public.bitb_cloud_saves set revision=900"),
      /permission denied/,
    );
    await assert.rejects(
      db.query(
        "insert into public.bitb_cloud_saves(owner,payload) values($1,$2)",
        [b, payload],
      ),
      /permission denied/,
    );
    await assert.rejects(
      db.query("select public.bitb_put_save($1,2)", [{ bad: true }]),
      /Invalid save/,
    );
    await assert.rejects(
      db.query("select public.bitb_put_save($1,2)", [
        { "level29.campaign.v2": "x".repeat(2100000) },
      ]),
      /Invalid save/,
    );
    await as(b);
    assert.equal(
      (await db.query("select * from public.bitb_cloud_saves")).rows.length,
      0,
    );
    assert.equal(
      (await db.query("delete from public.bitb_cloud_saves returning *")).rows
        .length,
      0,
    );
    await assert.rejects(
      db.query("select public.bitb_put_save($1,2)", [payload]),
      /revision conflict/,
    );
    assert.equal(
      (
        await db.query("select public.bitb_put_save($1,0) as revision", [
          payload,
        ])
      ).rows[0].revision,
      1,
    );
    await as(a);
    assert.equal(
      (await db.query("select revision from public.bitb_cloud_saves")).rows[0]
        .revision,
      2,
    );
    assert.equal(
      (await db.query("delete from public.bitb_cloud_saves returning *")).rows
        .length,
      1,
    );
  } finally {
    await db.close();
  }
});
