'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('Unreal E5 graphics quality tier is supported and configures 4K soft shadow maps', () => {
  const gSrc = fs.readFileSync(path.join(__dirname, '../public/game/graphics.js'), 'utf8');

  // Verify ultra SHADOW config
  assert.ok(gSrc.includes('ultra:'), "graphics.js must define 'ultra' shadow tier");
  assert.ok(gSrc.includes('size: 4096'), 'ultra tier must configure 4096px shadow map');
  assert.ok(gSrc.includes("sh.radius = quality === 'ultra' ? 3.5 : 2"), 'ultra tier must configure PCF soft shadow radius 3.5');

  // Verify level29Graphics accepts ultra
  const THREE = require('../public/game/three.min.js');
  let applied = false;
  const ctx = {
    THREE,
    localStorage: { getItem: () => null, setItem() {} },
    window: {},
    document: { createElement: () => ({ style: {} }), querySelector: () => null },
    initGL() {},
    render() {}
  };
  vm.createContext(ctx);
  vm.runInContext(gSrc, ctx);

  assert.equal(ctx.window.level29Graphics.quality, 'low');
  ctx.window.level29Graphics.setQuality('ultra');
  assert.equal(ctx.window.level29Graphics.quality, 'ultra', 'setQuality accepts ultra');
});

test('Unreal E5 postprocessing pipeline features bloom, chromatic aberration, and SSAO contact shading', () => {
  const cSrc = fs.readFileSync(path.join(__dirname, '../public/game/cinematic.js'), 'utf8');

  // Verify Screen Space Ambient Occlusion radius on ultra
  assert.ok(cSrc.includes("aoRadius=quality()==='ultra'?14"), 'SSAO kernel radius must expand to 14 on ultra');

  // Verify radial chromatic aberration for anamorphic lens simulation
  assert.ok(cSrc.includes('vec2 ca=d*(r2*0.0032)'), 'grade shader must calculate radial chromatic aberration');

  // Verify luminous bloom highlight extraction and bleed
  assert.ok(cSrc.includes('vec3 bloom=max(vec3(0.0)'), 'grade shader must extract and bleed luminous bloom');

  // Verify automotive clearcoat lacquer on vehicle paint
  assert.ok(cSrc.includes('p.clearcoat=1'), 'makeCarMesh must apply clearcoat = 1 on vehicle paint');
  assert.ok(cSrc.includes('p.clearcoatRoughness=0.06'), 'makeCarMesh must apply low clearcoatRoughness for showroom gloss');
  assert.ok(cSrc.includes('p.envMapIntensity=1.25'), 'makeCarMesh must reflect environment map');
});

test('Bayou raymarched atmospheric volumetrics expands to 32 steps on ultra', () => {
  const vSrc = fs.readFileSync(path.join(__dirname, '../public/game/bayou-volumetrics.js'), 'utf8');
  assert.ok(vSrc.includes("quality==='ultra'?{steps:32,volumes:6}"), 'budget must allocate 32 raymarching steps and 6 volumes on ultra');
});

test('Pause menu provides interactive Unreal E5 graphics controls and in-game [G] shortcut', () => {
  const pSrc = fs.readFileSync(path.join(__dirname, '../public/game/pause-controls.js'), 'utf8');
  assert.ok(pSrc.includes('gfxUltra'), 'Pause menu must include gfxUltra button');
  assert.ok(pSrc.includes('⚡ UNREAL E5'), 'Pause menu must display ⚡ UNREAL E5');
  assert.ok(pSrc.includes("setQuality('ultra')"), 'Clicking gfxUltra must set quality to ultra');
  assert.ok(pSrc.includes("(e.key||'').toLowerCase()!=='g'"), 'In-game [G] keydown shortcut must be registered');
});
