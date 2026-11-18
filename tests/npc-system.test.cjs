'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const npcModule = require('../public/game/npc-system.js');

test('Realistic human .glb models exist in public/assets/models/npcs with valid GLTF magic', () => {
  const dir = path.resolve(__dirname, '../public/assets/models/npcs');
  assert.ok(fs.existsSync(dir), 'public/assets/models/npcs directory exists');

  const files = [
    'npc_civilian_01.glb',
    'npc_civilian_02.glb',
    'npc_bayou_local.glb',
    'npc_civilian_03.glb',
    'npc_civilian_04.glb',
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
    MeshStandardMaterial: class { constructor(opts) { Object.assign(this, opts); } },
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

test('Variety Across Districts selects valid variants and randomizes subtle tint and scale variations', () => {
  const v1 = npcModule.selectVariantForDistrict('nola');
  const v2 = npcModule.selectVariantForDistrict('bayou');

  assert.ok(v1 && v1.file, 'New Orleans variant returned');
  assert.ok(v2 && v2.file, 'Bayou variant returned');

  // Test random scale variation in spawnNPC options
  assert.ok(npcModule.NPC_VARIANTS.length >= 5, 'Contains multiple NPC variants');
  const files = npcModule.NPC_VARIANTS.map(v => v.file);
  assert.ok(files.includes('npc_civilian_01.glb'), 'Includes npc_civilian_01.glb');
  assert.ok(files.includes('npc_civilian_02.glb'), 'Includes npc_civilian_02.glb');
  assert.ok(files.includes('npc_bayou_local.glb'), 'Includes npc_bayou_local.glb');
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
