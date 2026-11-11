const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  vm = require("node:vm"),
  T = require("three");
const policy = require("../public/game/runtime-policy.js"),
  bindings = require("../public/game/input-bindings.js"),
  S = require("../public/game/survival-expansion.js");
test("quality budgets bound particles, cap mobile and reserve reflections for desktop High", () => {
  assert.equal(policy.preset("low").particles, 120);
  assert.equal(policy.preset("medium").shadow, 512);
  for (const q of ["low", "medium", "high"]) {
    assert.equal(policy.preset(q, true).reflections, false);
    assert.equal(policy.preset(q, true).shadow, 0);
    assert.equal(policy.preset(q, true).fps, 30);
  }
  assert.equal(policy.preset("high").reflections, true);
  assert.equal(policy.preset("junk").name, "low");
});
test("GPU recovery reuploads shared textures, instanced buffers and shader materials without disposing CPU assets", () => {
  const scene = new T.Scene(),
    geo = new T.BoxGeometry(),
    texture = new T.Texture(),
    target = new T.WebGLRenderTarget(8, 8),
    material = new T.ShaderMaterial({
      uniforms: { map: { value: texture }, screen: { value: target.texture } },
    }),
    mesh = new T.InstancedMesh(geo, material, 2);
  mesh.instanceColor = new T.InstancedBufferAttribute(new Float32Array(6), 3);
  scene.add(mesh);
  let disposed = 0;
  for (const x of [geo, texture, material])
    x.addEventListener("dispose", () => disposed++);
  const before = texture.version,
    buffer = mesh.instanceMatrix.version,
    rt = target.texture.version;
  const counts = policy.reupload([scene]);
  assert.equal(counts.geometries, 1);
  assert.equal(counts.materials, 1);
  assert.equal(counts.textures, 1);
  assert.equal(texture.version, before + 1);
  assert.equal(mesh.instanceMatrix.version, buffer + 1);
  assert.equal(target.texture.version, rt);
  assert.equal(disposed, 0);
});
test("ownership-aware disposal is idempotent and never frees shared scene resources", () => {
  const scene = new T.Scene(),
    root = new T.Group(),
    child = new T.Mesh(new T.BoxGeometry(), new T.MeshBasicMaterial());
  root.add(child);
  scene.add(root);
  const owned = new T.Texture();
  root.userData.ownedTextures = new Set([owned]);
  let freed = 0,
    shared = 0;
  owned.addEventListener("dispose", () => freed++);
  child.geometry.addEventListener("dispose", () => shared++);
  policy.disposeOwned(root);
  policy.disposeOwned(root);
  assert.equal(freed, 1);
  assert.equal(shared, 0);
  assert.equal(scene.children.length, 0);
});
test("keybindings reject collisions, reserved actions and invalid imported bindings", () => {
  assert(bindings.validate(bindings.DEFAULTS));
  assert.equal(bindings.change(bindings.DEFAULTS, "forward", "e"), null);
  assert.equal(bindings.change(bindings.DEFAULTS, "forward", "Escape"), null);
  assert.equal(bindings.change(bindings.DEFAULTS, "other", "y"), null);
  assert.equal(bindings.change(bindings.DEFAULTS, "forward", "y").forward, "y");
  assert.equal(bindings.validate({ forward: "w" }), false);
});
test("real keyboard adapter translates press/release, prevents stale defaults and keeps E distinct from vehicle action", () => {
  const events = {},
    data = new Map(),
    seen = [],
    ctx = {
      window: null,
      state: "play",
      KeyboardEvent: class {
        constructor(type, options) {
          this.type = type;
          Object.assign(this, options);
        }
      },
      localStorage: {
        getItem: (k) => data.get(k),
        setItem: (k, v) => data.set(k, v),
        removeItem: (k) => data.delete(k),
      },
      addEventListener: (n, f) => (events[n] ??= []).push(f),
      dispatchEvent(e) {
        for (const fn of events[e.type] || []) {
          fn(e);
          if (e.stopped) return;
        }
        seen.push(e.key);
      },
    };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(
    fs.readFileSync("public/game/input-bindings.js", "utf8"),
    ctx,
  );
  const send = (type, key) =>
    ctx.dispatchEvent({
      type,
      key,
      code: "Key" + key.toUpperCase(),
      preventDefault() {},
      stopImmediatePropagation() {
        this.stopped = true;
      },
    });
  send("keydown", "e");
  send("keyup", "e");
  assert.deepEqual(seen, ["u", "u"]);
  seen.length = 0;
  send("keydown", "g");
  send("keyup", "g");
  assert.deepEqual(seen, ["e", "e"]);
  assert(ctx.level29Bindings.change("forward", "y"));
  seen.length = 0;
  send("keydown", "w");
  assert.deepEqual(seen, []);
  send("keydown", "y");
  send("keyup", "y");
  assert.deepEqual(seen, ["w", "w"]);
});
test("survival progression rewards mission completion once and caps perks", () => {
  const s = S.fresh();
  assert(S.awardMission(s, "one", 30));
  assert.equal(S.awardMission(s, "one", 1), false);
  assert.equal(s.points, 1);
  assert(S.unlock(s, "stamina"));
  assert.equal(S.unlock(s, "stamina"), false);
  s.points = 10;
  assert(S.unlock(s, "stamina"));
  assert(S.unlock(s, "stamina"));
  assert.equal(S.unlock(s, "stamina"), false);
  assert.equal(s.records.fastest, 1);
});
test("survival imports reject unknown cosmetics and clamp malicious perk levels", () => {
  const s = S.normalize({
    v: 1,
    points: -3,
    perks: { reload: 999 },
    outfit: "anything",
    owned: [],
    missions: ["a", "a"],
  });
  assert.equal(s.perks.reload, 3);
  assert.equal(s.points, 0);
  assert.equal(s.outfit, "");
  assert.deepEqual(s.missions, ["a"]);
});
test("all exploration interiors have bounded owned resources, a continuous stair ramp and upper gallery", () => {
  for (const id of ["manor", "docks", "jail"]) {
    const root = S.room(T, id);
    assert(root.userData.ownedGeometries.size < 90);
    assert.equal(root.userData.ownedMaterials.size, id === "docks" ? 5 : 4);
    assert.equal(S.height(216, 150), 0);
    assert.equal(S.height(216, 50), 36);
    assert.equal(S.height(100, 22), 36);
    const old = S.height(216, 150);
    assert.equal(old, 0);
    let freed = 0;
    for (const g of root.userData.ownedGeometries)
      g.addEventListener("dispose", () => freed++);
    const count = root.userData.ownedGeometries.size;
    policy.disposeOwned(root);
    assert.equal(freed, count);
  }
});
test("frame limiter throttles only rendering, preserves simulation timing, and suspends everything during context loss", () => {
  let time = 0,
    renders = 0,
    updates = 0,
    schedules = 0;
  const code = fs.readFileSync("public/game/game.js", "utf8"),
    start = code.indexOf("let last = performance.now(), accT = 0;"),
    ctx = {
      window: { level29RuntimePolicy: { budget: { fps: 30 } } },
      performance: { now: () => time },
      requestAnimationFrame() {
        schedules++;
      },
      document: { hidden: false },
      mpRole: null,
      state: "play",
      update() {
        updates++;
      },
      updateMusic() {},
      updateEngine() {},
      render() {
        renders++;
      },
      console,
    };
  vm.createContext(ctx);
  vm.runInContext(code.slice(start), ctx);
  for (let i = 1; i <= 120; i++) {
    time = (i * 1000) / 120;
    ctx.loop(time);
  }
  assert(renders <= 31 && renders >= 29);
  assert(updates >= 58 && updates <= 60);
  ctx.window.level29RuntimeResources = { lost: true };
  const before = [updates, renders];
  time += 100;
  ctx.loop(time);
  assert.deepEqual([updates, renders], before);
  assert.equal(schedules, 121);
});
test("retiring actor pools release converted owned colors but preserve shared shoe/eye materials", () => {
  const root = new T.Group(),
    skin = new T.MeshLambertMaterial({ color: "#abc" }),
    converted = new T.MeshStandardMaterial(),
    shared = new T.MeshStandardMaterial();
  converted.color = skin.color;
  const helmet = new T.Mesh(
      new T.SphereGeometry(),
      new T.MeshLambertMaterial(),
    ),
    hair = new T.Mesh(new T.BoxGeometry(), new T.MeshLambertMaterial());
  root.userData = {
    body: new T.Group(),
    skin,
    shirt: new T.MeshLambertMaterial(),
    pants: new T.MeshLambertMaterial(),
    hair,
    helmet,
  };
  root.add(
    new T.Mesh(new T.BoxGeometry(), converted),
    new T.Mesh(new T.BoxGeometry(), shared),
  );
  let disposed = 0,
    kept = 0;
  converted.addEventListener("dispose", () => disposed++);
  shared.addEventListener("dispose", () => kept++);
  policy.figureOwnership(root);
  policy.disposeOwned(root);
  assert.equal(disposed, 1);
  assert.equal(kept, 0);
});
test('45 FPS preset keeps its cadence on a 60 Hz display rather than collapsing to 30 FPS',()=>{let time=0,renders=0;const code=fs.readFileSync('public/game/game.js','utf8'),ctx={window:{level29RuntimePolicy:{budget:{fps:45}}},performance:{now:()=>time},requestAnimationFrame(){},document:{hidden:false},mpRole:null,state:'play',update(){},updateMusic(){},updateEngine(){},render(){renders++;},console};vm.createContext(ctx);vm.runInContext(code.slice(code.indexOf('let last = performance.now(), accT = 0;')),ctx);for(let i=1;i<=600;i++){time=i*1000/60;ctx.loop(time);}assert(renders>=448&&renders<=451);});
