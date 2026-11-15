const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const T = require('three');
const viewport = require('../public/game/mobile-viewport.js');

function fixture() {
  let rect = { width: 844, height: 390 }, resizes = 0;
  const cv = { getBoundingClientRect: () => rect };
  const context = {
    window: { devicePixelRatio: 3, level29MobileViewport: viewport,
      level29MobileBudget: { mobile: true, pixelRatio: () => 1 } },
    innerWidth: 844, innerHeight: 390, devicePixelRatio: 3,
    SW: 844, SH: 390, DPR: 1.5, cv,
    camera: new T.PerspectiveCamera(74, 844 / 390, 1, 1500),
    vmCam: new T.PerspectiveCamera(58, 844 / 390, .1, 100),
    THREE: T,
  };
  let size = new T.Vector2(844, 390), ratio = .85;
  context.renderer = {
    getSize: target => target.copy(size),
    setSize(w, h, updateStyle) { size.set(w, h); resizes++; assert.equal(updateStyle, false); },
    getPixelRatio: () => ratio,
    setPixelRatio(value) { ratio = value; },
  };
  vm.createContext(context);
  const game = fs.readFileSync('public/game/game.js', 'utf8');
  vm.runInContext(game.slice(game.indexOf('function resize(){'), game.indexOf("addEventListener('resize', resize)")), context);
  const fp = fs.readFileSync('public/game/fp.js', 'utf8');
  vm.runInContext(fp.slice(fp.indexOf('const viewportRenderSize ='), fp.indexOf('// ---------- Main render ----------')), context);
  return { context, setRect(w, h) { rect = { width: w, height: h }; }, get resizes() { return resizes; } };
}

test('portrait CSS sizing repairs both canvas layers even with stale landscape window dimensions and no resize event', () => {
  const f = fixture(), c = f.context;
  f.setRect(390, 704);
  c.syncViewport();
  assert.equal(c.SW, 390); assert.equal(c.SH, 704);
  assert.equal(c.cv.width, 585); assert.equal(c.cv.height, 1056);
  assert.equal(c.camera.aspect, 390 / 704);
  assert.equal(c.vmCam.aspect, 390 / 704);
  // A circle in camera space has equal CSS-pixel horizontal and vertical radii.
  const center = new T.Vector3(0, 0, -30).project(c.camera);
  const x = new T.Vector3(1, 0, -30).project(c.camera);
  const y = new T.Vector3(0, 1, -30).project(c.camera);
  assert.ok(Math.abs((x.x - center.x) * 390 - (y.y - center.y) * 704) < 1e-6);
  assert.equal(f.resizes, 1);
  const projection = c.vmCam.projectionMatrix.clone();
  for (let i = 0; i < 100; i++) c.syncViewport();
  assert.equal(f.resizes, 1, 'steady frames do not reallocate drawing buffers');
  assert.deepEqual(c.vmCam.projectionMatrix.elements, projection.elements);
  assert.equal(c.renderer.getPixelRatio(), .85, 'adaptive resolution is preserved');
});

test('toolbar height changes and repeated orientation changes resize HUD, renderer and cameras together', () => {
  const f = fixture(), c = f.context;
  for (const [w, h] of [[390, 704], [390, 760], [844, 390], [390, 704]]) {
    f.setRect(w, h); c.syncViewport();
    const size = c.renderer.getSize(new T.Vector2());
    assert.equal(size.x, w); assert.equal(size.y, h);
    assert.equal(c.cv.width / c.cv.height, w / h);
    assert.equal(c.camera.aspect, w / h); assert.equal(c.vmCam.aspect, w / h);
  }
});

test('CSS viewport measurement rounds fractional pixels and falls back safely before layout', () => {
  assert.deepEqual(viewport.viewportSize({ getBoundingClientRect: () => ({ width: 390.2, height: 703.8 }) }, 844, 390), { width: 390, height: 704 });
  assert.deepEqual(viewport.viewportSize({ getBoundingClientRect: () => ({ width: 0, height: 0 }) }, 390, 704), { width: 390, height: 704 });
  assert.deepEqual(viewport.viewportSize(null, 0, 0), { width: 1, height: 1 });
});
