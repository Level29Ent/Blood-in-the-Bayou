'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const npcModule = require('../public/game/npc-system.js');

class TestColor {
  constructor(c) { this.hex = c; }
  set(c) { this.hex = c; return this; }
  copy(c) { this.hex = c.hex; return this; }
  lerp() { return this; }
  getHSL(target) { target.h = 0; target.s = 0; target.l = 0.5; return target; }
  setHSL() { return this; }
}

test('Realistic human .glb models exist in public/assets/models/npcs with valid GLTF magic', () => {
  const dir = path.resolve(__dirname, '../public/assets/models/npcs');
  assert.ok(fs.existsSync(dir), 'public/assets/models/npcs directory exists');

  const files = [
    'npc_civilian_01.glb',
    'npc_civilian_02.glb',
    'npc_bayou_local.glb',
    'npc_civilian_03.glb',
    'npc_civilian_04.glb',
    'npc_anthony.glb',
    'npc_drako.glb',
    'npc_ronnie_crew.glb',
    'tripo_convert_76e7a4f4-0853-40fa-855d-89ea8d8bdad9.glb',
    'tripo_convert_5ccbf298-3609-41e5-9b5c-abb168e8d3aa.glb',
    'tripo_convert_c5fa3aab-73ad-4057-a1e1-c6aa5923ce19.glb',
    'tripo_convert_4e667b7e-7179-4c3c-aa39-b68179b7a9d1.glb',
    'tripo_convert_fe4d9a43-a215-4806-90d0-8a2f6756e3e8.glb'
  ];

  for (const f of files) {
    const fullPath = path.join(dir, f);
    assert.ok(fs.existsSync(fullPath), f + ' exists');
    const buf = fs.readFileSync(fullPath);
    assert.ok(buf.length > 1000000, f + ' has substantial asset size (>1MB)');
    assert.equal(buf.toString('utf8', 0, 4), 'glTF', f + ' has valid glTF magic');
  }
});

test('SkeletonUtils.clone creates independent skeletons and bones for each instanced NPC', () => {
  // Mock THREE skeleton and skinned mesh
  class MockBone {
    constructor(name) {
      this.name = name;
      this.isBone = true;
      this.children = [];
      this.position = { x: 0, y: 0, z: 0 };
    }
    clone() {
      const b = new MockBone(this.name);
      b.position = { ...this.position };
      return b;
    }
  }

  class MockSkeleton {
    constructor(bones, boneInverses) {
      this.bones = bones;
      this.boneInverses = boneInverses || [];
    }
  }

  class MockSkinnedMesh {
    constructor(skeleton) {
      this.isSkinnedMesh = true;
      this.skeleton = skeleton;
      this.bindMatrix = {};
      this.children = [];
    }
    bind(skeleton, bindMatrix) {
      this.skeleton = skeleton;
      this.bindMatrix = bindMatrix;
    }
    clone() {
      const m = new MockSkinnedMesh(this.skeleton);
      return m;
    }
  }

  const hip = new MockBone('mixamorig:Hips');
  const spine = new MockBone('mixamorig:Spine');
  hip.children.push(spine);

  const origSkeleton = new MockSkeleton([hip, spine]);
  const origMesh = new MockSkinnedMesh(origSkeleton);

  const rootScene = {
    children: [origMesh, hip],
    clone() {
      const clonedMesh = origMesh.clone();
      const clonedHip = hip.clone();
      const clonedSpine = spine.clone();
      clonedHip.children.push(clonedSpine);
      return {
        children: [clonedMesh, clonedHip],
        traverse(fn) {
          fn(this);
          fn(clonedMesh);
          fn(clonedHip);
          fn(clonedSpine);
        }
      };
    },
    traverse(fn) {
      fn(this);
      fn(origMesh);
      fn(hip);
      fn(spine);
    }
  };

  const globalThree = {
    Skeleton: MockSkeleton,
    SkeletonUtils: npcModule.SkeletonUtils
  };
  global.THREE = globalThree;

  const cloned1 = npcModule.SkeletonUtils.clone(rootScene, globalThree);
  const cloned2 = npcModule.SkeletonUtils.clone(rootScene, globalThree);

  assert.ok(cloned1, 'First clone created');
  assert.ok(cloned2, 'Second clone created');

  const skinned1 = cloned1.children.find(c => c.isSkinnedMesh);
  const skinned2 = cloned2.children.find(c => c.isSkinnedMesh);

  assert.ok(skinned1, 'Cloned mesh 1 exists');
  assert.ok(skinned2, 'Cloned mesh 2 exists');
  assert.notEqual(skinned1.skeleton, skinned2.skeleton, 'Each instanced NPC receives an independent skeleton');
  assert.notEqual(skinned1.skeleton.bones[0], skinned2.skeleton.bones[0], 'Bones are independently instanced');
});

test('PBR and lighting upgrade configures castShadow, receiveShadow, sRGB color space, and proper roughness', () => {
  const mapObj = { colorSpace: '', encoding: 0 };
  const fakeMaterial = {
    map: mapObj,
    roughness: 0.1, // too shiny plastic
    metalness: 0.9,
    envMapIntensity: 0
  };

  const fakeMesh = {
    isMesh: true,
    castShadow: false,
    receiveShadow: false,
    frustumCulled: true,
    material: fakeMaterial
  };

  const fakeRoot = {
    traverse(fn) { fn(fakeMesh); }
  };

  const mockThree = {
    SRGBColorSpace: 'srgb',
    sRGBEncoding: 3001
  };

  npcModule.upgradeMeshPBR(fakeRoot, mockThree);

  assert.equal(fakeMesh.castShadow, true, 'castShadow enabled');
  assert.equal(fakeMesh.receiveShadow, true, 'receiveShadow enabled');
  assert.equal(fakeMesh.frustumCulled, false, 'frustumCulled disabled to prevent skinned mesh culling');
  assert.equal(mapObj.colorSpace, 'srgb', 'Albedo map set to SRGBColorSpace');
  assert.equal(mapObj.encoding, 3001, 'Albedo map encoding set to sRGBEncoding');
  assert.ok(fakeMaterial.roughness >= 0.6 && fakeMaterial.roughness <= 0.85, 'Roughness upgraded to natural skin/fabric (0.6 - 0.85)');
  assert.ok(fakeMaterial.metalness <= 0.15, 'Metalness tuned to non-metallic skin/fabric');
  assert.equal(fakeMaterial.envMapIntensity, 0.85, 'envMapIntensity tuned to scene lighting');
});

test('Scale normalization grounds feet at y=0 and normalizes model to realistic human height (~1.75 to 1.85 units)', () => {
  // Raw Tripo model height ~0.977 units
  const fakeModel = {
    updateMatrixWorld() {},
    scale: { x: 1, y: 1, z: 1, setScalar(s) { this.x = s; this.y = s; this.z = s; } },
    position: { x: 0, y: 0, z: 0 },
    userData: {}
  };

  const mockThree = {
    Box3: class {
      setFromObject() {
        return {
          min: { x: -0.4, y: 0.05, z: -0.2 },
          max: { x: 0.4, y: 1.027, z: 0.2 } // rawHeight = 0.977
        };
      }
    }
  };

  const targetHeight = 1.80; // realistic human height (~1.75 to 1.85 units)
  const normalized = npcModule.normalizeModelScale(fakeModel, targetHeight, mockThree);

  assert.equal(normalized, 1.80, 'Returns target height');
  assert.ok(fakeModel.scale.y > 1.8 && fakeModel.scale.y < 1.9, 'Scale normalized from ~0.977 to 1.80');
  assert.equal(fakeModel.userData.humanHeight, 1.80, 'humanHeight recorded in userData');
  assert.equal(fakeModel.userData.normalizedHeight, 1.80, 'normalizedHeight recorded in userData');
  assert.ok(fakeModel.position.y <= 0, 'Feet grounded cleanly at y=0');
});

test('Capsule/Standard PBR human proxy fallback constructs properly with PBR materials and shadows', () => {
  class MockMesh {
    constructor(geo, mat) {
      this.geometry = geo;
      this.material = mat;
      this.position = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
      this.scale = { x: 1, y: 1, z: 1, set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
      this.isMesh = true;
    }
  }

  class MockGroup {
    constructor() {
      this.children = [];
      this.userData = {};
    }
    add(...args) {
      this.children.push(...args);
    }
    traverse(fn) {
      fn(this);
      for (const c of this.children) {
        fn(c);
      }
    }
  }

  const mockThree = {
    Group: MockGroup,
    Mesh: MockMesh,
    MeshStandardMaterial: class { constructor(opts) { Object.assign(this, opts); if (typeof this.color === 'string') this.color = new TestColor(this.color); } },
    CapsuleGeometry: class { constructor(r, h) { this.r = r; this.h = h; } },
    SphereGeometry: class { constructor(r) { this.r = r; } }
  };

  const proxy = npcModule.createPBRProxy(mockThree);
  assert.ok(proxy, 'Proxy constructed');
  assert.equal(proxy.name, 'PBR_Human_Proxy');
  assert.equal(proxy.userData.isProxy, true, 'Marked as proxy');
  assert.equal(proxy.userData.humanHeight, 1.80, 'Proxy height normalized to 1.80 units');

  for (const c of proxy.children) {
    assert.equal(c.castShadow, true, 'Proxy part casts shadow');
    assert.equal(c.receiveShadow, true, 'Proxy part receives shadow');
    assert.ok(c.material.roughness >= 0.7, 'Proxy uses natural non-shiny roughness');
  }
});

test('Automatic Animation Playback crossfades between Idle, Walk, Run based on velocity and triggers React', () => {
  let crossfadedTo = null;
  let crossfadeDuration = 0;

  const fakeActions = {
    idle: { isRunning: () => true, play() {}, reset() {}, fadeIn() {}, crossFadeTo() {}, setEffectiveTimeScale() {}, setEffectiveWeight() {} },
    walk: { isRunning: () => false, play() {}, reset() {}, fadeIn() {}, crossFadeTo() {}, setEffectiveTimeScale() {}, setEffectiveWeight() {} },
    run: { isRunning: () => false, play() {}, reset() {}, fadeIn() {}, crossFadeTo() {}, setEffectiveTimeScale() {}, setEffectiveWeight() {} },
    react: { isRunning: () => false, play() {}, reset() {}, fadeIn() {}, crossFadeTo() {}, setEffectiveTimeScale() {}, setEffectiveWeight() {} }
  };

  const fakeNPC = {
    position: { x: 100, y: 0, z: 100 },
    userData: {
      mixer: { update() {}, addEventListener() {} },
      actions: fakeActions,
      currentAction: 'idle',
      state: 'idle',
      speed: 0,
      isReacting: false
    }
  };

  // Stationary -> idle
  fakeNPC.userData.speed = 0;
  npcModule.updateNPC(fakeNPC, 0.016);
  assert.equal(fakeNPC.userData.state, 'idle', 'Speed 0 remains idle');

  // Walking velocity (1.5) -> crossfades to walk
  fakeNPC.userData.speed = 1.5;
  npcModule.updateNPC(fakeNPC, 0.016);
  assert.equal(fakeNPC.userData.state, 'walk', 'Walking speed crossfades to walk');

  // Running velocity (4.2) -> crossfades to run
  fakeNPC.userData.speed = 4.2;
  npcModule.updateNPC(fakeNPC, 0.016);
  assert.equal(fakeNPC.userData.state, 'run', 'Fast speed crossfades to run');

  // Gunfire or interaction -> triggers React clip
  npcModule.triggerNPCReaction(fakeNPC);
  assert.equal(fakeNPC.userData.state, 'react', 'Gunfire / interaction triggers React clip');
  assert.equal(fakeNPC.userData.isReacting, true, 'isReacting flag set during reaction');
});

test('Extended Model Variants includes Anthony, Drako, Ronnie crew, and role tags', () => {
  assert.ok(npcModule.NPC_VARIANTS.length >= 12, 'Includes at least 12 model variants');
  const ids = npcModule.NPC_VARIANTS.map(v => v.id);
  assert.ok(ids.includes('anthony'), 'Includes Anthony variant');
  assert.ok(ids.includes('drako'), 'Includes Drako variant');
  assert.ok(ids.includes('ronnie_crew'), 'Includes Ronnie crew variant');

  const files = npcModule.NPC_VARIANTS.map(v => v.file);
  assert.ok(files.includes('npc_anthony.glb'), 'References npc_anthony.glb');
  assert.ok(files.includes('npc_drako.glb'), 'References npc_drako.glb');
  assert.ok(files.includes('npc_ronnie_crew.glb'), 'References npc_ronnie_crew.glb');

  // Verify role matching
  const workerVariant = npcModule.selectVariantForDistrict('canal', 'worker');
  assert.ok(workerVariant, 'Finds role-matched variant for canal worker');
});

test('Demographic Skin Tones and District Wardrobe Palettes cover all 7 districts', () => {
  assert.ok(npcModule.SKIN_TONES.length >= 10, 'Rich Fitzpatrick skin tone spectrum (>=10 tones)');
  assert.ok(npcModule.HAIR_COLORS.length >= 6, 'Natural hair color range (>=6 colors)');

  const districts = ['nola', 'fq', 'treme', 'canal', 'bayou', 'forest', 'gardens'];
  for (const d of districts) {
    assert.ok(npcModule.DISTRICT_PALETTES[d], 'Palette defined for ' + d);
    assert.ok(npcModule.DISTRICT_PALETTES[d].length >= 3, d + ' has multiple curated colorways');
  }

  // Workwear filtering for Industrial Canal
  const workwearPalette = npcModule.selectOutfitPalette('canal', true);
  assert.ok(workwearPalette.isWorkwear, 'Selects high-vis workwear for canal workers');
  assert.ok(workwearPalette.shirt, 'Workwear has shirt color');
});

test('NPC Archetypes system spans diverse Louisiana roles and selects district-specific archetypes', () => {
  assert.ok(npcModule.NPC_ARCHETYPES.length >= 10, 'Defines at least 10 distinct NPC archetypes');
  const archetypeIds = npcModule.NPC_ARCHETYPES.map(a => a.id);
  assert.ok(archetypeIds.includes('civilian'), 'Includes civilian');
  assert.ok(archetypeIds.includes('tourist'), 'Includes tourist');
  assert.ok(archetypeIds.includes('musician'), 'Includes musician');
  assert.ok(archetypeIds.includes('worker'), 'Includes worker');
  assert.ok(archetypeIds.includes('angler'), 'Includes angler');
  assert.ok(archetypeIds.includes('ranger'), 'Includes ranger');
  assert.ok(archetypeIds.includes('vip'), 'Includes vip');
  assert.ok(archetypeIds.includes('guard'), 'Includes guard');
  assert.ok(archetypeIds.includes('hustler'), 'Includes hustler');
  assert.ok(archetypeIds.includes('jogger'), 'Includes jogger');

  const bayouArch = npcModule.selectArchetypeForDistrict('bayou');
  assert.ok(bayouArch && bayouArch.id, 'Bayou archetype selected');

  const canalArch = npcModule.selectArchetypeForDistrict('canal');
  assert.ok(canalArch && canalArch.id, 'Canal archetype selected');
});

test('Procedural Accessories and Props generate valid 3D meshes with shadows and proper attachments', () => {
  class TestColor {
    constructor(c) { this.set(c); }
    set(c) { this.hex = c; return this; }
    copy(c) { this.hex = c.hex; return this; }
    lerp() { return this; }
    getHSL(target) { target.h = 0; target.s = 0; target.l = 0.5; return target; }
    setHSL() { return this; }
  }
  class TestMesh {
    constructor(geo, mat) {
      this.isMesh = true;
      this.geometry = geo;
      this.material = mat || {};
      this.position = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
      this.rotation = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
      this.scale = { x: 1, y: 1, z: 1, set(x, y, z) { this.x = x; this.y = y; this.z = z; }, setScalar(s) { this.x = s; this.y = s; this.z = s; } };
      this.name = '';
    }
  }
  class TestGroup {
    constructor() {
      this.children = [];
      this.userData = {};
      this.position = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
      this.rotation = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
      this.scale = { x: 1, y: 1, z: 1, set(x, y, z) { this.x = x; this.y = y; this.z = z; }, setScalar(s) { this.x = s; this.y = s; this.z = s; } };
      this.name = '';
    }
    add(...nodes) {
      for (const n of nodes) {
        if (n) {
          n.parent = this;
          this.children.push(n);
        }
      }
    }
    traverse(fn) {
      fn(this);
      for (const c of this.children) {
        if (c.traverse) c.traverse(fn);
        else fn(c);
      }
    }
  }

  const mockThree = {
    Group: TestGroup,
    Mesh: TestMesh,
    Color: TestColor,
    MeshStandardMaterial: class { constructor(opts) { Object.assign(this, opts); if (typeof this.color === 'string') this.color = new TestColor(this.color); } },
    MeshBasicMaterial: class { constructor(opts) { Object.assign(this, opts); } },
    BoxGeometry: class {},
    SphereGeometry: class { scale() {} },
    CylinderGeometry: class {},
    PlaneGeometry: class {},
    TorusGeometry: class {}
  };

  const shades = npcModule.createShades(mockThree);
  assert.equal(shades.name, 'prop_shades', 'createShades builds prop_shades');

  const cap = npcModule.createCap(mockThree, '#1e293b');
  assert.equal(cap.name, 'prop_cap', 'createCap builds prop_cap');

  const fedora = npcModule.createFedora(mockThree, '#202226', '#ecc35c');
  assert.equal(fedora.name, 'prop_fedora', 'createFedora builds prop_fedora');

  const hardhat = npcModule.createHardHat(mockThree, '#facc15');
  assert.equal(hardhat.name, 'prop_hardhat', 'createHardHat builds prop_hardhat');

  const beanie = npcModule.createBeanie(mockThree, '#3b4252');
  assert.equal(beanie.name, 'prop_beanie', 'createBeanie builds prop_beanie');

  const chain = npcModule.createGoldChain(mockThree);
  assert.equal(chain.name, 'prop_gold_chain', 'createGoldChain builds prop_gold_chain');

  const vest = npcModule.createSafetyVest(mockThree, '#ea580c');
  assert.equal(vest.name, 'prop_safety_vest', 'createSafetyVest builds prop_safety_vest');

  const phone = npcModule.createHandProp(mockThree, 'phone');
  assert.equal(phone.name, 'prop_phone', 'createHandProp builds prop_phone');

  // Test attachment to model
  const root = new TestGroup();
  const inner = new TestGroup();
  root.add(inner);

  const archetype = { id: 'worker', shades: 1.0, hats: ['hardhat'], goldChain: true, vest: true, prop: 'clipboard' };
  const attached = npcModule.attachAccessories(root, inner, archetype, { district: 'canal' }, mockThree);

  assert.ok(attached.includes('shades'), 'Attached shades');
  assert.ok(attached.includes('hardhat'), 'Attached hardhat');
  assert.ok(attached.includes('goldChain'), 'Attached gold chain');
  assert.ok(attached.includes('vest'), 'Attached safety vest');
  assert.ok(attached.includes('clipboard'), 'Attached clipboard');
});

test('spawnNPC populates rich variation metadata, physical proportions, and attaches accessories', () => {
  class TestColor {
    constructor(c) { this.set(c); }
    set(c) { this.hex = c; return this; }
    copy(c) { this.hex = c.hex; return this; }
    lerp() { return this; }
    getHSL(target) { target.h = 0; target.s = 0; target.l = 0.5; return target; }
    setHSL() { return this; }
  }
  class TestMesh {
    constructor(geo, mat) {
      this.isMesh = true;
      this.geometry = geo;
      this.material = mat || {};
      this.position = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
      this.rotation = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
      this.scale = { x: 1, y: 1, z: 1, set(x, y, z) { this.x = x; this.y = y; this.z = z; }, setScalar(s) { this.x = s; this.y = s; this.z = s; } };
      this.name = '';
    }
  }
  class TestGroup {
    constructor() {
      this.children = [];
      this.userData = {};
      this.position = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
      this.rotation = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
      this.scale = { x: 1, y: 1, z: 1, set(x, y, z) { this.x = x; this.y = y; this.z = z; }, setScalar(s) { this.x = s; this.y = s; this.z = s; } };
      this.name = '';
    }
    add(...nodes) {
      for (const n of nodes) {
        if (n) {
          n.parent = this;
          this.children.push(n);
        }
      }
    }
    traverse(fn) {
      fn(this);
      for (const c of this.children) {
        if (c.traverse) c.traverse(fn);
        else fn(c);
      }
    }
    updateMatrixWorld() {}
  }

  const mockThree = {
    Group: TestGroup,
    Mesh: TestMesh,
    Color: TestColor,
    MeshStandardMaterial: class { constructor(opts) { Object.assign(this, opts); if (typeof this.color === 'string') this.color = new TestColor(this.color); } },
    MeshBasicMaterial: class { constructor(opts) { Object.assign(this, opts); } },
    BoxGeometry: class {},
    SphereGeometry: class { scale() {} },
    CylinderGeometry: class {},
    PlaneGeometry: class {},
    TorusGeometry: class {},
    Box3: class {
      setFromObject() {
        return { min: { x: -0.4, y: 0, z: -0.2 }, max: { x: 0.4, y: 1.80, z: 0.2 } };
      }
    }
  };
  global.THREE = mockThree;

  const npc = npcModule.spawnNPC({ district: 'canal', archetype: 'worker' });
  assert.ok(npc, 'NPC spawned');
  assert.equal(npc.userData.district, 'canal', 'District recorded in userData');
  assert.equal(npc.userData.archetype, 'worker', 'Archetype recorded in userData');
  assert.ok(npc.userData.skinTone, 'Skin tone assigned');
  assert.ok(npc.userData.palette, 'Palette assigned');
  assert.ok(npc.userData.targetHeight >= 1.65 && npc.userData.targetHeight <= 1.95, 'Target height within natural human bounds');
  assert.ok(npc.userData.widthRatio > 0.85 && npc.userData.widthRatio < 1.15, 'Width ratio assigned');
  assert.ok(npc.userData.depthRatio > 0.85 && npc.userData.depthRatio < 1.15, 'Depth ratio assigned');

  // Test setFigureColors color update hook
  npcModule.applyColorsToModel(npc, '#5a3826', '#ea580c', '#1e293b', '#151210', mockThree);
  assert.equal(npc.userData.skin.color.hex, '#5a3826', 'Skin color updated');
  assert.equal(npc.userData.shirt.color.hex, '#ea580c', 'Shirt color updated');
  assert.equal(npc.userData.pants.color.hex, '#1e293b', 'Pants color updated');
});

test('Script tag for npc-system.js is present in public/game/index.html after GLTFLoader', () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../public/game/index.html'), 'utf8');
  assert.ok(html.includes('npc-system.js?v=1'), 'npc-system.js included in index.html');

  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(m => m[1].split('?')[0]);
  assert.equal(new Set(scripts).size, scripts.length, 'All scripts in index.html remain unique');

  const gltfLoaderIdx = scripts.indexOf('vendor/gltf-loader-r149.js');
  const npcSystemIdx = scripts.indexOf('npc-system.js');

  assert.ok(gltfLoaderIdx >= 0, 'GLTFLoader present');
  assert.ok(npcSystemIdx >= 0, 'NPC system present');
  assert.ok(gltfLoaderIdx < npcSystemIdx, 'GLTFLoader is loaded before npc-system.js');
});
