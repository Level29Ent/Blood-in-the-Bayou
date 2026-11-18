const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('Fireworks and Flare Gun are registered in WEAPONS and WORDER', () => {
  const gtaCode = fs.readFileSync(path.join(__dirname, '../public/game/gta.js'), 'utf8');

  // Verify firework and flaregun are in WEAPONS
  assert.ok(gtaCode.includes("firework:"), "WEAPONS must include 'firework'");
  assert.ok(gtaCode.includes("flaregun:"), "WEAPONS must include 'flaregun'");
  assert.ok(gtaCode.includes("FIREWORKS"), "Weapon name must include 'FIREWORKS'");
  assert.ok(gtaCode.includes("FLARE GUN"), "Weapon name must include 'FLARE GUN'");

  // Verify firework and flaregun are inside WORDER
  const worderMatch = gtaCode.match(/const WORDER\s*=\s*\[([^\]]+)\]/);
  assert.ok(worderMatch, 'WORDER definition must be present');
  const worderItems = worderMatch[1].replace(/['"\s]/g, '').split(',');
  assert.ok(worderItems.includes('firework'), "WORDER must contain 'firework'");
  assert.ok(worderItems.includes('flaregun'), "WORDER must contain 'flaregun'");

  // Verify Gun Shop items include fireworks and flaregun
  assert.ok(gtaCode.includes("id:'firework'"), "Gun shop must include firework");
  assert.ok(gtaCode.includes("id:'flaregun'"), "Gun shop must include flaregun");

  // Verify resetArsenal provides fireworks and flaregun ammo
  assert.ok(gtaCode.includes("firework: 15"), "resetArsenal must initialize fireworks ammo");
  assert.ok(gtaCode.includes("flaregun: 10"), "resetArsenal must initialize flaregun ammo");
});

test('Mobile touch controls provide #lookZone and Fire & Aim ergonomics', () => {
  const joyCode = fs.readFileSync(path.join(__dirname, '../public/game/joy.js'), 'utf8');

  // Verify #lookZone is styled and initialized for touch devices
  assert.ok(joyCode.includes('#lookZone'), '#lookZone selector must exist in joy.js');
  assert.ok(joyCode.includes("lookZone.id = 'lookZone'"), 'lookZone element must be created');
  assert.ok(joyCode.includes("lookZone.classList.toggle('live', live)"), 'lookZone live state must toggle with gameplay');

  // Verify Fire & Aim on #shoot
  assert.ok(joyCode.includes("shootBtn.addEventListener('pointermove'"), 'shoot button must track pointer movements for aiming');
  assert.ok(joyCode.includes("turnView(dx *"), 'dragging shoot button must rotate view via turnView');

  // Verify touch layout styles arrange #shoot prominently
  assert.ok(joyCode.includes('#touch #shoot'), '#touch #shoot must have dedicated styling');
  assert.ok(joyCode.includes('border-radius:50%'), '#touch #shoot must be styled as a large thumb button');
});

test('HUD sanitization purges any floating buttons for Fireworks and Flare Gun', () => {
  const hudCode = fs.readFileSync(path.join(__dirname, '../public/game/contextual-hud.js'), 'utf8');

  assert.ok(hudCode.includes('purgeFloatingWeapons'), 'purgeFloatingWeapons function must be present');
  assert.ok(hudCode.includes('FIREWORK|FLARE\\s*GUN|F10|F11'), 'HUD purge regex must filter floating firework / flare gun HUD buttons');
});

test('Weapon button supports tap-to-cycle and hold-to-wheel on touch', () => {
  const gtaCode = fs.readFileSync(path.join(__dirname, '../public/game/gta.js'), 'utf8');

  assert.ok(gtaCode.includes("wBtn.id = 'wbtn'"), 'WEAPON button #wbtn must be created');
  assert.ok(gtaCode.includes('openWheel(true)'), 'Holding WEAPON button must open the weapon wheel');
  assert.ok(gtaCode.includes('openWheel(false, true)'), 'Releasing WEAPON button must commit the selected weapon');
  assert.ok(gtaCode.includes("cv.addEventListener('touchmove'"), 'Canvas must handle touchmove for radial wheel selection');
});
