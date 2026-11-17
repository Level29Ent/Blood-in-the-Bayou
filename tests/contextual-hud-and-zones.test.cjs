'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('DISTRICTS has 7 tiers clearly labeling the full progression path from New Orleans to Gardens', () => {
  const code = fs.readFileSync('public/game/game.js', 'utf8');
  const ctx = {};
  vm.createContext(ctx);
  // Extract DISTRICTS declaration
  const start = code.indexOf('const DISTRICTS = [');
  const end = code.indexOf('const MISSIONS_PER =', start);
  assert.ok(start > 0 && end > start, 'DISTRICTS defined');
  const districts = vm.runInContext('(function(){\n' + code.slice(start, end) + '\nreturn DISTRICTS;\n})()', ctx);
  assert.equal(districts.length, 7, 'Must have exactly 7 district tiers');

  assert.equal(districts[0].name, 'NEW ORLEANS', 'Tier 1 (Missions 1–30) is New Orleans');
  assert.equal(districts[1].name, 'FRENCH QUARTER', 'Tier 2 (Missions 31–60) is French Quarter');
  assert.equal(districts[2].name, 'TREMÉ', 'Tier 3 (Missions 61–90) is Tremé');
  assert.equal(districts[3].name, 'INDUSTRIAL CANAL', 'Tier 4 (Missions 91–120) is Industrial Canal');
  assert.equal(districts[4].name, 'BAYOU SWAMP', 'Tier 5 (Missions 121–150) is Bayou Swamp');
  assert.equal(districts[5].name, 'FOREST RESERVE', 'Tier 6 (Missions 151–180) is Forest Reserve');
  assert.equal(districts[6].name, 'LEVEL 29 GARDENS', 'Tier 7 (Missions 181–210) is Level 29 Gardens');
});

test('Zone selector is present, unhidden, and options cover all 210 missions across 7 tiers', () => {
  for (const htmlPath of ['public/game/index.html', 'public/index.html']) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    assert.match(html, /<select\s+id="district"[^>]*aria-label="Select campaign zone"[^>]*>/, 'District selector must be unhidden in ' + htmlPath);
    assert.doesNotMatch(html, /<select\s+id="district"[^>]*hidden/, 'Selector must not have hidden attribute');
    assert.doesNotMatch(html, /<select\s+id="district"[^>]*style="display:none"/, 'Selector must not have display:none');

    // Check all 7 option tiers are represented
    assert.match(html, /value="0"[^>]*>New Orleans/, 'Option 0 is New Orleans in ' + htmlPath);
    assert.match(html, /value="30"[^>]*>French Quarter/, 'Option 30 is French Quarter in ' + htmlPath);
    assert.match(html, /value="60"[^>]*>Tremé/, 'Option 60 is Tremé in ' + htmlPath);
    assert.match(html, /value="90"[^>]*>Industrial Canal/, 'Option 90 is Industrial Canal in ' + htmlPath);
    assert.match(html, /value="120"[^>]*>Bayou Swamp/, 'Option 120 is Bayou Swamp in ' + htmlPath);
    assert.match(html, /value="150"[^>]*>Forest Reserve/, 'Option 150 is Forest Reserve in ' + htmlPath);
    assert.match(html, /value="180"[^>]*>Level 29 Gardens/, 'Option 180 is Level 29 Gardens in ' + htmlPath);
  }
});

test('gulf.js ZONE_NAMES and CHAPTER_ZONE map all 7 districts to valid Louisiana names', () => {
  const code = fs.readFileSync('public/game/gulf.js', 'utf8');
  assert.match(code, /nola:'NEW ORLEANS'/);
  assert.match(code, /quarter:'FRENCH QUARTER'/);
  assert.match(code, /treme:'TREMÉ'/);
  assert.match(code, /canal:'INDUSTRIAL CANAL'/);
  assert.match(code, /swamp:'BAYOU SWAMP'/);
  assert.match(code, /forest:'FOREST RESERVE'/);
  assert.match(code, /mountain:'LEVEL 29 GARDENS'/);

  const chZoneMatch = code.match(/const CHAPTER_ZONE=\[([^\]]+)\]/);
  assert.ok(chZoneMatch, 'CHAPTER_ZONE array present');
  const zones = chZoneMatch[1].replace(/['\s]/g, '').split(',');
  assert.equal(zones.length, 7, 'CHAPTER_ZONE must map 7 tiers');
  assert.deepEqual(zones, ['nola', 'quarter', 'treme', 'canal', 'swamp', 'forest', 'mountain']);
});

test('Contextual HUD & Prompts displays dynamic prompts and Level 29 Construction mode', () => {
  function createDOM() {
    const elements = new Map();
    function createEl(tag) {
      const el = {
        tag,
        style: {},
        attrs: {},
        children: [],
        innerHTML: '',
        textContent: '',
        dataset: {},
        setAttribute(k, v) { this.attrs[k] = v; },
        removeAttribute(k) { delete this.attrs[k]; },
        appendChild(child) { this.children.push(child); elements.set(child.id, child); return child; },
        addEventListener(type, fn) { this['on' + type] = fn; },
        closest() { return null; }
      };
      return el;
    }

    const head = createEl('head');
    const body = createEl('body');
    const doc = {
      createElement: createEl,
      getElementById: (id) => elements.get(id) || null,
      head,
      body
    };
    return { doc, elements };
  }

  const { doc, elements } = createDOM();
  const ctx = {
    document: doc,
    window: {},
    addEventListener: () => {},
    state: 'play',
    player: { x: 100, y: 100, a: 0, dead: false, car: null, hp: 100 },
    cars: [
      { x: 130, y: 100, dead: false, burnT: 0, spec: { name: 'BAYOU GT' } },
      { x: 500, y: 500, dead: false, burnT: 0, spec: { name: 'SEDAN' } }
    ],
    cash: 500,
    city: { solids: [] },
    sfx: () => {},
    toast: () => {},
    nearWaterSpot: () => null,
    render: () => {}
  };
  ctx.window = ctx;
  vm.createContext(ctx);

  const hudScript = fs.readFileSync('public/game/contextual-hud.js', 'utf8');
  vm.runInContext(hudScript, ctx);

  const prompts = elements.get('contextualPrompts');
  assert.ok(prompts, '#contextualPrompts element created');

  // Case 1: Standing near a car (distance 30 < 72)
  ctx.render();
  assert.equal(prompts.style.display, 'flex');
  assert.ok(prompts.innerHTML.includes('Enter BAYOU GT'), 'Shows [E] Enter Vehicle near car');
  assert.ok(!prompts.innerHTML.includes('Sandbag Barrier'), 'Hides build prompts when not in construction mode');

  // Case 2: In a car
  ctx.player.car = ctx.cars[0];
  ctx.render();
  assert.equal(prompts.style.display, 'flex');
  assert.ok(prompts.innerHTML.includes('Exit Vehicle'), 'Shows [E] Exit Vehicle when inside car');

  // Case 3: Far away from any car, open street
  ctx.player.car = null;
  ctx.player.x = 2000;
  ctx.player.y = 2000;
  ctx.render();
  assert.equal(prompts.style.display, 'none', 'Hides prompts when no contextual action is relevant');

  // Case 4: Near fishing spot
  ctx.nearWaterSpot = () => ({ x: 2020, y: 2000 });
  ctx.render();
  assert.equal(prompts.style.display, 'flex');
  assert.ok(prompts.innerHTML.includes('Haul Net'), 'Shows [U] Haul Net at fishing spot');

  // Case 5: LEVEL 29 CONSTRUCTION MODE
  ctx.nearWaterSpot = () => null;
  assert.equal(ctx.level29Construction.active, false);
  ctx.level29Construction.toggle();
  assert.equal(ctx.level29Construction.active, true);

  ctx.render();
  assert.equal(prompts.style.display, 'flex');
  assert.ok(prompts.innerHTML.includes('LEVEL 29 CONSTRUCTION'), 'Highlights LEVEL 29 CONSTRUCTION mode');
  assert.ok(prompts.innerHTML.includes('1'), 'Shows [1] prompt');
  assert.ok(prompts.innerHTML.includes('Sandbag Barrier'), 'Shows Sandbag Barrier');
  assert.ok(prompts.innerHTML.includes('Work Floodlight'), 'Shows Floodlight');
  assert.ok(prompts.innerHTML.includes('Supply Crate'), 'Shows Supply Crate');
  assert.ok(prompts.innerHTML.includes('Concrete Barricade'), 'Shows Barricade');
  assert.ok(prompts.innerHTML.includes('Defense Turret'), 'Shows Turret');

  // Place an item
  const initialCash = ctx.cash;
  const ok = ctx.level29Construction.place(0); // place barrier ($50)
  assert.equal(ok, true);
  assert.equal(ctx.cash, initialCash - 50, 'Deducts game cash');
  assert.equal(ctx.level29Construction.placed.length, 1);
  assert.equal(ctx.city.solids.length, 1, 'Registers collision solid');

  // Exit construction mode
  ctx.level29Construction.toggle();
  assert.equal(ctx.level29Construction.active, false);
  ctx.render();
  assert.equal(prompts.style.display, 'none', 'Hides prompts when construction closed on open street');
});
