const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  T = require("three");
const {
    eligible,
    partition,
    optimize,
    release,
  } = require("../public/game/mobile-static-chunks.js"),
  { islands, draw } = require("../public/game/mobile-world-visibility.js");
function batch(root) {
  const m = new T.InstancedMesh(
      new T.BoxGeometry(8, 12, 8),
      new T.MeshStandardMaterial(),
      100,
    ),
    matrix = new T.Matrix4();
  for (let i = 0; i < 100; i++)
    m.setMatrixAt(
      i,
      matrix.makeTranslation((i % 10) * 200, 6, -Math.floor(i / 10) * 200 - 50),
    );
  m.name = "Test street props";
  m.userData.staticWorldBatch = true;
  root.add(m);
  return m;
}
test("wide instance batch becomes bounded spatial chunks with exact instance transforms and shared resources", () => {
  const root = new T.Group(),
    m = batch(root);
  m.position.set(40, 0, 70);
  m.rotation.y = 0.4;
  const output = partition(T, m);
  assert(output.children.length > 1);
  assert.equal(
    output.children.reduce((n, c) => n + c.count, 0),
    100,
  );
  assert.equal(output.position.x, 40);
  assert(output.quaternion.angleTo(m.quaternion) < 1e-7);
  const original = new Set();
  const x = new T.Matrix4();
  for (let i = 0; i < m.count; i++) {
    m.getMatrixAt(i, x);
    original.add(x.elements.join(","));
  }
  for (const chunk of output.children) {
    assert.equal(chunk.geometry, m.geometry);
    assert.equal(chunk.material, m.material);
    for (let i = 0; i < chunk.count; i++) {
      chunk.getMatrixAt(i, x);
      assert(original.delete(x.elements.join(",")));
    }
  }
  assert.equal(original.size, 0);
});
test("mobile visibility excludes off-camera instance chunks instead of sending the whole city batch", () => {
  const scene = new T.Scene(),
    root = new T.Group();
  scene.add(root);
  const m = batch(root);
  let geoDisposed = 0,
    matDisposed = 0;
  m.geometry.addEventListener("dispose", () => geoDisposed++);
  m.material.addEventListener("dispose", () => matDisposed++);
  const stats = optimize(T, root);
  assert.equal(stats.instances, 100);
  const items = islands(T, root),
    cam = new T.PerspectiveCamera(60, 1, 1, 760);
  cam.position.set(0, 12, 0);
  cam.lookAt(0, 12, -100);
  let drawn = 0;
  draw(T, items, cam, scene, 760, () =>
    root.traverseVisible((o) => {
      if (o.isInstancedMesh) drawn += o.count;
    }),
  );
  assert(drawn < 20, "visible instance budget " + drawn);
  assert(drawn > 0);
  assert.equal(
    root.children[0].children.reduce((n, o) => n + o.count, 0),
    100,
  );
  assert.equal(geoDisposed, 0);
  assert.equal(matDisposed, 0);
  assert.equal(release(root), stats.chunks);
  assert.equal(geoDisposed, 0);
});
test("runtime-owned and moving instance batches are never partitioned", () => {
  for (const flag of [
    "noBatch",
    "body",
    "legs",
    "wheel",
    "dynamic",
    "mobileMoving",
    "vehicles",
  ]) {
    const root = new T.Group(),
      m = batch(root);
    root.userData[flag] = true;
    assert.equal(eligible(m), false);
    assert.equal(optimize(T, root).sources, 0);
  }
  const root = new T.Group(),
    m = batch(root);
  m.instanceColor = new T.InstancedBufferAttribute(new Float32Array(300), 3);
  assert.equal(eligible(m), false);
});
test("actual world batch builder shares cube buffers across materials and rebuilds", () => {
  const fs = require("node:fs"),
    vm = require("node:vm"),
    source = fs.readFileSync("public/game/world.js", "utf8"),
    a = source.indexOf("let sharedBatchCube=null;"),
    b = source.indexOf(
      "\nfunction ",
      source.indexOf("function batch(group)", a) + 20,
    ),
    c = { THREE: T };
  vm.createContext(c);
  vm.runInContext(source.slice(a, b), c);
  const material = new T.MeshStandardMaterial(),
    roots = [new T.Group(), new T.Group()];
  for (const root of roots) {
    const q = c.batch(root);
    for (let i = 0; i < 30; i++)
      q.box(
        8,
        12,
        8,
        i * 200,
        6,
        0,
        i % 2 ? material : new T.MeshStandardMaterial(),
      );
    q.finish();
  }
  const geos = new Set(roots.flatMap((r) => r.children.map((o) => o.geometry)));
  assert.equal(geos.size, 1);
  assert(
    roots.every((r) => r.children.every((o) => o.userData.staticWorldBatch)),
  );
  assert.equal(
    optimize(T, roots[0]).sources,
    0,
    "small batches stay unchanged",
  );
});
test("actual legacy world merger keeps authored instances compact only on mobile", () => {
  const fs = require("node:fs"),
    vm = require("node:vm"),
    code = fs.readFileSync("public/game/gulf.js", "utf8"),
    a = code.indexOf("function matSig("),
    b = code.indexOf("const prevBuild=buildCity;", a);
  for (const mobile of [true, false]) {
    const c = { THREE: T, window: { level29MobileBudget: { mobile } } };
    vm.createContext(c);
    vm.runInContext(code.slice(a, b), c);
    const root = new T.Group(),
      m = batch(root);
    c.window.level29BatchStatic(root, []);
    if (mobile) {
      assert.equal(m.parent, root);
      assert.equal(m.geometry.attributes.position.count, 24);
      assert(optimize(T, root).chunks > 1);
    } else assert.equal(m.parent, null);
  }
});
