const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs");
const { PGlite } = require("@electric-sql/pglite");
test("community SQL enforces isolation, consent, expiration, ownership and bounded one-time scores", async () => {
  const db = new PGlite(),
    a = "11111111-1111-4111-8111-111111111111",
    b = "22222222-2222-4222-8222-222222222222",
    c = "33333333-3333-4333-8333-333333333333";
  try {
    await db.exec(
      `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;insert into auth.users values('${a}'),('${b}'),('${c}');`,
    );
    await db.exec(
      fs.readFileSync("supabase/migrations/202611110001_community.sql", "utf8"),
    );
    const as = async (id) => {
      await db.exec("reset role");
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
        id,
      ]);
      await db.exec("set role authenticated");
    };
    await db.exec("set role anon");
    await assert.rejects(
      db.query("select * from public.bitb_scores"),
      /permission denied/,
    );
    for (const [id, handle] of [
      [a, "Alice"],
      [b, "Bob"],
      [c, "Carol"],
    ]) {
      await as(id);
      await db.query("insert into public.bitb_profiles(handle) values($1)", [
        handle,
      ]);
    }
    await as(a);
    await assert.rejects(
      db.query("insert into public.bitb_profiles(id,handle) values($1,$2)", [
        b,
        "Impersonation",
      ]),
      /row-level|duplicate/,
    );
    await db.query(
      "insert into public.bitb_friends(recipient,accepted) values($1,true)",
      [b],
    );
    let f = await db.query("select accepted from public.bitb_friends");
    assert.equal(f.rows[0].accepted, false);
    assert.equal(
      (
        await db.query(
          "update public.bitb_friends set accepted=true returning *",
        )
      ).rows.length,
      0,
    );
    await as(c);
    assert.equal(
      (await db.query("select * from public.bitb_friends")).rows.length,
      0,
    );
    await as(b);
    await db.exec("update public.bitb_friends set accepted=true");
    await as(a);
    assert.equal(
      (await db.query("select accepted from public.bitb_friends")).rows[0]
        .accepted,
      true,
    );
    await db.query(
      "insert into public.bitb_lobbies(code,players,visibility) values('AB12',2,'friends')",
    );
    await as(b);
    assert.equal(
      (await db.query("select * from public.bitb_lobbies")).rows.length,
      1,
    );
    assert.equal(
      (await db.query("update public.bitb_lobbies set code='HACK' returning *"))
        .rows.length,
      0,
    );
    await as(c);
    assert.equal(
      (await db.query("select * from public.bitb_lobbies")).rows.length,
      0,
    );
    await as(a);
    const run = (
      await db.query(
        "insert into public.bitb_runs(category,started_at,finished) values('survival','2000-01-01',true) returning *",
      )
    ).rows[0];
    assert.equal(run.finished, false);
    assert(new Date(run.started_at).getUTCFullYear() > 2025);
    await assert.rejects(
      db.query(
        "insert into public.bitb_scores(run_id,category,value) values($1,'survival',1000)",
        [run.id],
      ),
      /Run must last/,
    );
    await as(b);
    await assert.rejects(
      db.query(
        "insert into public.bitb_scores(run_id,category,value) values($1,'survival',1)",
        [run.id],
      ),
      /Run missing/,
    );
    // Set up server time as database administrator; clients have no timestamp privilege.
    await db.exec(
      "reset role;alter table public.bitb_runs disable trigger bitb_run_guard",
    );
    await db.query(
      "update public.bitb_runs set started_at=now()-interval '10 seconds' where id=$1",
      [run.id],
    );
    await db.exec("alter table public.bitb_runs enable trigger bitb_run_guard");
    await as(a);
    await assert.rejects(
      db.query(
        "insert into public.bitb_scores(run_id,category,value) values($1,'survival',500)",
        [run.id],
      ),
      /exceeds/,
    );
    await db.query(
      "insert into public.bitb_scores(run_id,category,value,verification) values($1,'survival',8,'client-reported')",
      [run.id],
    );
    await assert.rejects(
      db.query(
        "insert into public.bitb_scores(run_id,category,value) values($1,'survival',8)",
        [run.id],
      ),
      /already submitted/,
    );
    await assert.rejects(
      db.query("update public.bitb_scores set value=900"),
      /permission denied/,
    );
    await as(b);
    assert.equal(
      (await db.query("select * from public.bitb_runs")).rows.length,
      0,
    );
    assert.equal(
      (await db.query("select * from public.bitb_scores")).rows[0].verification,
      "client-reported",
    );
    await as(a);
    await db.query("delete from public.bitb_profiles where id=$1", [a]);
    await as(b);
    assert.equal(
      (await db.query("select * from public.bitb_scores")).rows.length,
      0,
    );
    assert.equal(
      (await db.query("select * from public.bitb_friends")).rows.length,
      0,
    );
  } finally {
    await db.close();
  }
});
