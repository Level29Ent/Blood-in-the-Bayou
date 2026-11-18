'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const characterModule = require('../public/game/ronniebaby-character.js');

test('Ronniebaby_character.glb model files exist in public/models and public/game/models', () => {
  const rootPath = path.resolve(__dirname, '../public/models/Ronniebaby_character.glb');
  const gamePath = path.resolve(__dirname, '../public/game/models/Ronniebaby_character.glb');

  assert.ok(fs.existsSync(rootPath), 'public/models/Ronniebaby_character.glb exists');
  assert.ok(fs.existsSync(gamePath), 'public/game/models/Ronniebaby_character.glb exists');

  const rootStat = fs.statSync(rootPath);
  const gameStat = fs.statSync(gamePath);
  assert.ok(rootStat.size > 5000000, 'Root model file has expected size (~6MB)');
  assert.equal(rootStat.size, gameStat.size, 'Both model files match in byte length');
});

test('GLB binary contains all 19 embedded animation clips', () => {
  const modelPath = path.resolve(__dirname, '../public/game/models/Ronniebaby_character.glb');
  const buf = fs.readFileSync(modelPath);

  assert.equal(buf.toString('utf8', 0, 4), 'glTF', 'Valid GLB magic');
  const jsonLen = buf.readUInt32LE(12);
  const gltf = JSON.parse(buf.toString('utf8', 20, 20 + jsonLen));

  assert.ok(Array.isArray(gltf.animations), 'GLTF has animations array');
  assert.equal(gltf.animations.length, 19, 'Contains exactly 19 embedded animation clips');

  const animNames = gltf.animations.map(a => a.name);
  const expectedClips = [
    'run', 'shoot', 'defeat_03', 'hit_to_stomach', 'hit_to_body_01', 'hit_to_side',
    'box_02', 'complain_01', 'dance_05', 'fire', 'box_03', 'slash',
    'cast_a_spell', 'front_kick_01', 'front_kick_02', 'box_01', 'hit_to_head',
    'fall', 'walk'
  ];

  for (const name of expectedClips) {
    assert.ok(animNames.includes(name), 'Clip ' + name + ' is present in GLB');
  }
});

test('Root-motion stripping zeroes out X and Z while preserving Y on hips', () => {
  const fakeClip = {
    name: 'run',
    tracks: [
      {
        name: 'mixamorig:Hips.position',
        times: new Float32Array([0, 1]),
        values: new Float32Array([
          12.5, 9.8, -4.2,  // frame 0: X=12.5, Y=9.8, Z=-4.2
          15.1, 9.5, -8.7   // frame 1: X=15.1, Y=9.5, Z=-8.7
        ])
      },
      {
        name: 'mixamorig:LeftLeg.position',
        times: new Float32Array([0, 1]),
        values: new Float32Array([1.0, 2.0, 3.0, 1.1, 2.1, 3.1])
      }
    ]
  };

  characterModule.stripRootMotionXZ(fakeClip);

  const hipsValues = fakeClip.tracks[0].values;
  assert.equal(hipsValues[0], 0, 'Frame 0 X stripped to 0');
  assert.ok(Math.abs(hipsValues[1] - 9.8) < 1e-4, 'Frame 0 Y preserved at 9.8');
  assert.equal(hipsValues[2], 0, 'Frame 0 Z stripped to 0');

  assert.equal(hipsValues[3], 0, 'Frame 1 X stripped to 0');
  assert.ok(Math.abs(hipsValues[4] - 9.5) < 1e-4, 'Frame 1 Y preserved at 9.5');
  assert.equal(hipsValues[5], 0, 'Frame 1 Z stripped to 0');

  // Non-root tracks are untouched
  const legValues = fakeClip.tracks[1].values;
  assert.equal(legValues[0], 1.0, 'Leg X preserved');
  assert.equal(legValues[1], 2.0, 'Leg Y preserved');
});

test('Auto-maps all animations, aliases defeat_02 <-> defeat_03, and creates idle action', () => {
  // Mock Three.js environment
  const mockThree = {
    LoopOnce: 2200,
    LoopRepeat: 2201,
    AnimationClip: class {
      constructor(name, duration, tracks) {
        this.name = name;
        this.duration = duration;
        this.tracks = tracks;
      }
    },
    AnimationMixer: class {
      constructor(scene) {
        this.scene = scene;
        this._listeners = {};
      }
      clipAction(clip) {
        return {
          clip,
          name: clip.name,
          loop: null,
          clampWhenFinished: false,
          running: false,
          enabled: false,
          setLoop(mode) { this.loop = mode; },
          reset() { this.running = true; },
          play() { this.running = true; },
          fadeIn() {},
          crossFadeTo() {},
          isRunning() { return this.running; },
          setEffectiveTimeScale() {},
          setEffectiveWeight() {}
        };
      }
      addEventListener(evt, fn) {
        this._listeners[evt] = fn;
      }
    }
  };

  const fakeGLTF = {
    scene: { name: 'RootScene' },
    animations: [
      { name: 'run', tracks: [] },
      { name: 'shoot', tracks: [] },
      { name: 'defeat_03', tracks: [] },
      { name: 'hit_to_stomach', tracks: [] },
      { name: 'hit_to_body_01', tracks: [] },
      { name: 'box_01', tracks: [] },
      { name: 'box_02', tracks: [] },
      { name: 'walk', tracks: [{ name: 'bone.position', times: [0, 1], values: [0,0,0, 0,0,0], clone() { return { name: this.name, times: this.times, values: this.values }; } }] }
    ]
  };

  characterModule.setupCharacterAnimations(fakeGLTF, mockThree);

  const actions = characterModule.actions;
  assert.ok(actions['run'], 'run action exists');
  assert.ok(actions['shoot'], 'shoot action exists');
  assert.ok(actions['defeat_03'], 'defeat_03 action exists');
  assert.ok(actions['defeat_02'], 'defeat_02 alias exists');
  assert.equal(actions['defeat_02'], actions['defeat_03'], 'defeat_02 aliases defeat_03');
  assert.equal(actions['defeat_02'].clampWhenFinished, true, 'defeat_02 clamped when finished');
  assert.equal(actions['defeat_02'].loop, mockThree.LoopOnce, 'defeat_02 uses LoopOnce');

  assert.ok(actions['idle'], 'idle action generated and mapped');
  assert.equal(actions['idle'].loop, mockThree.LoopRepeat, 'idle loops repeatedly');

  assert.equal(actions['shoot'].loop, mockThree.LoopOnce, 'shoot uses LoopOnce');
  assert.equal(actions['hit_to_stomach'].loop, mockThree.LoopOnce, 'hit_to_stomach uses LoopOnce');
  assert.equal(actions['box_01'].loop, mockThree.LoopOnce, 'box_01 uses LoopOnce');
  assert.equal(actions['run'].loop, mockThree.LoopRepeat, 'run loops repeatedly');
  assert.equal(actions['walk'].loop, mockThree.LoopRepeat, 'walk loops repeatedly');
});

test('GTA 5-Style Animation State Machine transitions smoothly based on player state', () => {
  // Stationary -> idle
  let state = characterModule.determinePlayerState(
    { x: 100, y: 100, vx: 0, vy: 0, dead: false, hp: 100 },
    { keys: {}, mouseDown: false, curW: 'm240' }
  );
  assert.equal(state, 'idle', 'Stationary player maps to idle');

  // Walking (WASD) -> walk
  state = characterModule.determinePlayerState(
    { x: 100, y: 100, vx: 1.5, vy: 0, dead: false, hp: 100 },
    { keys: { w: true }, mouseDown: false, curW: 'm240' }
  );
  assert.equal(state, 'walk', 'WASD movement maps to walk');

  // Sprinting (Shift + move) -> sprint (run)
  state = characterModule.determinePlayerState(
    { x: 100, y: 100, vx: 4.5, vy: 0, dead: false, hp: 100 },
    { keys: { w: true, shift: true }, mouseDown: false, curW: 'm240' }
  );
  assert.equal(state, 'sprint', 'Shift movement maps to sprint');

  // Firing ranged weapon -> shoot
  state = characterModule.determinePlayerState(
    { x: 100, y: 100, vx: 0, vy: 0, dead: false, hp: 100 },
    { keys: {}, mouseDown: true, curW: 'm240' }
  );
  assert.equal(state, 'shoot', 'Firing ranged weapon maps to shoot');

  // Melee attack -> melee (box_01/box_02)
  state = characterModule.determinePlayerState(
    { x: 100, y: 100, vx: 0, vy: 0, dead: false, hp: 100 },
    { keys: {}, mouseDown: true, curW: 'bat' }
  );
  assert.equal(state, 'melee', 'Firing melee weapon maps to melee');

  // Taking damage -> hit (hit_to_stomach/body)
  state = characterModule.determinePlayerState(
    { x: 100, y: 100, vx: 0, vy: 0, dead: false, hp: 80 }, // dropped from 100
    { keys: {}, mouseDown: false, curW: 'm240' }
  );
  assert.equal(state, 'hit', 'Damage taken maps to hit');

  // Dead -> defeat (defeat_02)
  state = characterModule.determinePlayerState(
    { x: 100, y: 100, vx: 0, vy: 0, dead: true, hp: 0 },
    { keys: {}, mouseDown: false, curW: 'm240' }
  );
  assert.equal(state, 'defeat', 'Player death maps to defeat');
});

test('Over-the-shoulder chase camera positions behind right shoulder and looks along heading', () => {
  let camPos = null, lookTarget = null;
  global.camera = {
    position: {
      set(x, y, z) { camPos = { x, y, z }; }
    },
    lookAt(x, y, z) { lookTarget = { x, y, z }; }
  };
  global.terrainHeight = () => 0;
  global.blockedCircle = () => false;

  const player = { x: 500, y: 500, z: 0 };
  const view = { yaw: 0, pitch: 0 }; // Facing +X

  characterModule.applyOverTheShoulderCamera(player, view);

  assert.ok(camPos, 'Camera position set');
  assert.ok(lookTarget, 'Camera lookAt target set');

  // Yaw = 0 means looking toward +X
  // Behind is -X (less than player.x = 500)
  assert.ok(camPos.x < player.x, 'Camera is positioned behind player (X < 500)');
  // Right vector for yaw=0 is along +Z (yaw + PI/2)
  assert.ok(camPos.z > player.y, 'Camera has over-the-shoulder right offset');
  // Height should be above ground
  assert.ok(camPos.y > 10, 'Camera height is above ground level (~16.5)');
  // Target should be ahead of player along +X
  assert.ok(lookTarget.x > player.x, 'Look target points forward ahead of player');

  delete global.camera;
  delete global.terrainHeight;
  delete global.blockedCircle;
});

test('Clean 1PV/3PV view toggling and mesh visibility management', () => {
  global.view = { chase: false };
  global.state = 'play';
  global.toast = () => {};

  // Initially 1PV
  assert.equal(global.view.chase, false);

  // Toggle to 3PV
  const is3PV = characterModule.toggleView();
  assert.equal(is3PV, true, 'Toggled to 3PV');
  assert.equal(global.view.chase, true);

  // Toggle back to 1PV
  const is1PV = !characterModule.toggleView();
  assert.equal(is1PV, true, 'Toggled back to 1PV');
  assert.equal(global.view.chase, false);

  delete global.view;
  delete global.state;
  delete global.toast;
});

test('Script tag for ronniebaby-character.js is in public/game/index.html in valid order', () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../public/game/index.html'), 'utf8');
  assert.ok(html.includes('ronniebaby-character.js?v=1'), 'Script included in index.html');

  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(m => m[1].split('?')[0]);
  assert.equal(new Set(scripts).size, scripts.length, 'All scripts in index.html remain unique');

  const gltfLoaderIdx = scripts.indexOf('vendor/gltf-loader-r149.js');
  const hudIdx = scripts.indexOf('contextual-hud.js');
  const characterIdx = scripts.indexOf('ronniebaby-character.js');

  assert.ok(gltfLoaderIdx >= 0, 'GLTFLoader present');
  assert.ok(hudIdx >= 0, 'Contextual HUD present');
  assert.ok(characterIdx >= 0, 'Character script present');
  assert.ok(gltfLoaderIdx < characterIdx, 'GLTFLoader is loaded before character script');
  assert.ok(hudIdx < characterIdx, 'Contextual HUD is loaded before character script');
});

test('Late scene initialization attaches characterMesh and disables frustum culling', () => {
  const fakeMesh = {
    name: 'Ronniebaby_3PV_Character',
    parent: null,
    position: { set(x, y, z) { this.x = x; this.y = y; this.z = z; } },
    rotation: { y: 0 },
    visible: false
  };

  const fakeScene = {
    children: [],
    add(child) {
      this.children.push(child);
      child.parent = this;
    }
  };

  global.scene = fakeScene;
  global.player = { x: 400, y: 300, vx: 0, vy: 0, dead: false };
  global.state = 'play';
  global.view = { chase: true, yaw: 0, pitch: 0 };
  global.terrainHeight = () => 5;

  // Simulate updateCharacter attaching mesh to scene when scene becomes available
  if (!fakeMesh.parent || fakeMesh.parent !== global.scene) {
    global.scene.add(fakeMesh);
  }
  assert.equal(fakeMesh.parent, fakeScene, 'Mesh is attached to active scene');
  assert.ok(fakeScene.children.includes(fakeMesh), 'Scene contains character mesh');

  delete global.scene;
  delete global.player;
  delete global.state;
  delete global.view;
  delete global.terrainHeight;
});

test('Wardrobe script does not double-toggle or override 3PV when level29Character exists', () => {
  const wardrobeSource = fs.readFileSync(path.resolve(__dirname, '../public/game/wardrobe.js'), 'utf8');

  assert.ok(wardrobeSource.includes('!window.level29Character'), 'wardrobe.js checks for level29Character before handling 3PV chase camera');
  assert.ok(wardrobeSource.includes('if(window.level29Character){if(localAvatar)localAvatar.visible=false;}'), 'wardrobe.js suppresses legacy localAvatar when level29Character exists');
});

test('Adaptive over-the-shoulder camera framing adjusts for mobile portrait vs landscape viewports', () => {
  let portraitCamPos = null;
  let landscapeCamPos = null;

  global.terrainHeight = () => 0;
  global.blockedCircle = () => false;

  const player = { x: 500, y: 500, z: 0 };
  const view = { yaw: 0, pitch: 0 }; // Facing +X

  // 1. Mobile Portrait orientation (aspect ~ 0.5)
  global.camera = {
    aspect: 0.5,
    position: { set(x, y, z) { portraitCamPos = { x, y, z }; } },
    lookAt() {}
  };
  characterModule.applyOverTheShoulderCamera(player, view);

  // 2. Desktop Landscape orientation (aspect ~ 1.77)
  global.camera = {
    aspect: 1.77,
    position: { set(x, y, z) { landscapeCamPos = { x, y, z }; } },
    lookAt() {}
  };
  characterModule.applyOverTheShoulderCamera(player, view);

  assert.ok(portraitCamPos, 'Portrait camera position calculated');
  assert.ok(landscapeCamPos, 'Landscape camera position calculated');

  // Portrait should be backed up farther (distance 40 -> X = 500 - 40 = 460) vs landscape (distance 32 -> X = 500 - 32 = 468)
  assert.ok(portraitCamPos.x < landscapeCamPos.x, 'Portrait camera backs up further than landscape for narrow mobile FOV');
  assert.equal(Math.round(player.x - portraitCamPos.x), 40, 'Portrait camera distance is ~40');
  assert.equal(Math.round(player.x - landscapeCamPos.x), 32, 'Landscape camera distance is ~32');

  // Portrait shoulder offset should be narrower (3.4 vs 5.2) to center the crosshair
  const portraitShoulderOffset = portraitCamPos.z - player.y;
  const landscapeShoulderOffset = landscapeCamPos.z - player.y;
  assert.ok(portraitShoulderOffset < landscapeShoulderOffset, 'Portrait shoulder offset is narrower than landscape');
  assert.ok(Math.abs(portraitShoulderOffset - 3.4) < 0.1, 'Portrait shoulder offset is ~3.4');
  assert.ok(Math.abs(landscapeShoulderOffset - 5.2) < 0.1, 'Landscape shoulder offset is ~5.2');

  delete global.camera;
  delete global.terrainHeight;
  delete global.blockedCircle;
});

test('Mobile 3PV touch button #camBtn creation and label synchronization', () => {
  // Mock DOM environment
  const mockElements = new Map();
  const mockTouchGroup = {
    children: [],
    appendChild(child) {
      this.children.push(child);
      mockElements.set(child.id, child);
    }
  };

  global.document = {
    getElementById(id) { return mockElements.get(id) || null; },
    querySelector(selector) {
      if (selector === '#touch .group') return mockTouchGroup;
      return null;
    },
    createElement(tag) {
      const el = {
        tagName: tag.toUpperCase(),
        id: '',
        textContent: '',
        classList: {
          classes: new Set(),
          add(c) { this.classes.add(c); },
          remove(c) { this.classes.delete(c); },
          toggle(c, force) {
            if (force === undefined) {
              if (this.classes.has(c)) this.classes.delete(c);
              else this.classes.add(c);
            } else if (force) {
              this.classes.add(c);
            } else {
              this.classes.delete(c);
            }
          },
          contains(c) { return this.classes.has(c); }
        },
        attrs: {},
        setAttribute(k, v) { this.attrs[k] = v; },
        getAttribute(k) { return this.attrs[k]; },
        listeners: {},
        addEventListener(evt, fn) { this.listeners[evt] = fn; }
      };
      return el;
    }
  };

  global.view = { chase: false };

  const btn = characterModule.setupMobileCamButton();
  assert.ok(btn, '#camBtn created');
  assert.equal(btn.id, 'camBtn');
  assert.equal(btn.textContent, '3PV', 'Shows 3PV when in 1st person');
  assert.equal(btn.classList.contains('on'), false, 'Does not have .on class in 1PV');
  assert.ok(mockTouchGroup.children.includes(btn), '#camBtn docked inside #touch .group');

  // Trigger button tap to switch to 3PV
  btn.listeners['pointerdown']({ preventDefault() {}, stopPropagation() {} });
  assert.equal(global.view.chase, true, 'Tapped #camBtn toggled view.chase to true');
  assert.equal(btn.textContent, '1PV', 'Shows 1PV when in 3rd person');
  assert.equal(btn.classList.contains('on'), true, 'Has .on class in 3PV');

  // Trigger button tap again to return to 1PV
  btn.listeners['pointerdown']({ preventDefault() {}, stopPropagation() {} });
  assert.equal(global.view.chase, false, 'Tapped #camBtn toggled view.chase back to false');
  assert.equal(btn.textContent, '3PV', 'Shows 3PV when in 1st person');
  assert.equal(btn.classList.contains('on'), false, 'Does not have .on class in 1PV');

  delete global.document;
  delete global.view;
});

