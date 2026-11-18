'use strict';
(function(){
  // LEVEL 29 Realistic Rigged 3D NPC System
  // Blood in the Bayou - PBR character models with SkeletonUtils instancing & animation state machine

  // ---------- SkeletonUtils Implementation ----------
  function parallelTraverse(a, b, callback) {
    callback(a, b);
    for (let i = 0; i < a.children.length; ++i) {
      if (b.children[i]) {
        parallelTraverse(a.children[i], b.children[i], callback);
      }
    }
  }

  const SkeletonUtils = {
    clone: function(source, THREE_REF) {
      if (!source) return null;
      const sourceLookup = new Map();
      const cloneLookup = new Map();

      const clone = source.clone();

      parallelTraverse(source, clone, function(sourceNode, clonedNode) {
        sourceLookup.set(clonedNode, sourceNode);
        cloneLookup.set(sourceNode, clonedNode);
      });

      const T = THREE_REF || (typeof THREE !== 'undefined' ? THREE : (typeof globalThis !== 'undefined' && globalThis.THREE ? globalThis.THREE : (typeof global !== 'undefined' && global.THREE ? global.THREE : null)));

      clone.traverse(function(node) {
        if (!node.isSkinnedMesh) return;

        const sourceMesh = sourceLookup.get(node);
        if (!sourceMesh || !sourceMesh.skeleton) return;
        const sourceSkeleton = sourceMesh.skeleton;

        const orderedBones = [];
        for (let i = 0; i < sourceSkeleton.bones.length; ++i) {
          const sourceBone = sourceSkeleton.bones[i];
          const clonedBone = cloneLookup.get(sourceBone);
          orderedBones.push(clonedBone || sourceBone);
        }

        if (T && T.Skeleton) {
          node.bind(new T.Skeleton(orderedBones, sourceSkeleton.boneInverses), node.bindMatrix);
        }
      });

      return clone;
    }
  };

  if (typeof THREE !== 'undefined' && !THREE.SkeletonUtils) {
    THREE.SkeletonUtils = SkeletonUtils;
  }
  if (typeof window !== 'undefined') {
    window.SkeletonUtils = SkeletonUtils;
  }

  // ---------- Variant Configuration & Model Templates ----------
  const NPC_VARIANTS = [
    { id: 'civilian_01', file: 'npc_civilian_01.glb', district: ['nola', 'fq', 'treme'] },
    { id: 'civilian_02', file: 'npc_civilian_02.glb', district: ['nola', 'fq', 'canal'] },
    { id: 'bayou_local', file: 'npc_bayou_local.glb', district: ['bayou', 'forest', 'gardens'] },
    { id: 'civilian_03', file: 'npc_civilian_03.glb', district: ['canal', 'treme', 'nola'] },
    { id: 'civilian_04', file: 'npc_civilian_04.glb', district: ['bayou', 'forest', 'gardens'] },
    { id: 'tripo_76e7', file: 'tripo_convert_76e7a4f4-0853-40fa-855d-89ea8d8bdad9.glb', district: ['nola', 'fq'] },
    { id: 'tripo_5ccb', file: 'tripo_convert_5ccbf298-3609-41e5-9b5c-abb168e8d3aa.glb', district: ['canal', 'treme'] },
    { id: 'tripo_c5fa', file: 'tripo_convert_c5fa3aab-73ad-4057-a1e1-c6aa5923ce19.glb', district: ['bayou', 'forest'] },
    { id: 'tripo_4e66', file: 'tripo_convert_4e667b7e-7179-4c3c-aa39-b68179b7a9d1.glb', district: ['nola', 'gardens'] },
    { id: 'tripo_fe4d', file: 'tripo_convert_fe4d9a43-a215-4806-90d0-8a2f6756e3e8.glb', district: ['bayou', 'gardens'] }
  ];

  const candidateDirs = [
    'assets/models/npcs/',
    '/assets/models/npcs/',
    'public/assets/models/npcs/',
    'public/game/assets/models/npcs/',
    'models/npcs/'
  ];

  const loadedTemplates = new Map();
  const sharedAnimations = new Map();
  const activeNPCs = new Set();
  let defaultAnimations = [];

  // ---------- Higher-Detail Capsule/Standard PBR Human Proxy Fallback ----------
  function createPBRProxy(THREE_REF) {
    const T = THREE_REF || (typeof THREE !== 'undefined' ? THREE : null);
    if (!T) return null;

    const group = new T.Group();
    group.name = 'PBR_Human_Proxy';

    const skinMat = new T.MeshStandardMaterial({
      color: '#d4aa88',
      roughness: 0.75,
      metalness: 0.05,
      envMapIntensity: 0.85
    });

    const clothMat = new T.MeshStandardMaterial({
      color: '#394e5e',
      roughness: 0.82,
      metalness: 0.08,
      envMapIntensity: 0.85
    });

    const pantsMat = new T.MeshStandardMaterial({
      color: '#252e3b',
      roughness: 0.85,
      metalness: 0.06,
      envMapIntensity: 0.85
    });

    // Body parts
    // Total height = 1.80 world units, feet at y = 0
    // Torso: capsule height 0.65, radius 0.22 (y = 0.95 to 1.45)
    let torsoGeo;
    if (typeof T.CapsuleGeometry !== 'undefined') {
      torsoGeo = new T.CapsuleGeometry(0.22, 0.48, 8, 16);
    } else {
      torsoGeo = new T.CylinderGeometry(0.22, 0.20, 0.55, 12);
    }
    const torso = new T.Mesh(torsoGeo, clothMat);
    torso.position.y = 1.15;
    group.add(torso);

    // Head
    const head = new T.Mesh(new T.SphereGeometry(0.14, 16, 12), skinMat);
    head.position.y = 1.62;
    head.scale.set(0.95, 1.1, 0.95);
    group.add(head);

    // Legs
    let legGeo;
    if (typeof T.CapsuleGeometry !== 'undefined') {
      legGeo = new T.CapsuleGeometry(0.085, 0.60, 6, 12);
    } else {
      legGeo = new T.CylinderGeometry(0.085, 0.075, 0.72, 8);
    }

    const legL = new T.Mesh(legGeo, pantsMat);
    legL.position.set(-0.13, 0.45, 0);
    const legR = new T.Mesh(legGeo, pantsMat);
    legR.position.set(0.13, 0.45, 0);
    group.add(legL, legR);

    // Arms
    let armGeo;
    if (typeof T.CapsuleGeometry !== 'undefined') {
      armGeo = new T.CapsuleGeometry(0.065, 0.45, 6, 12);
    } else {
      armGeo = new T.CylinderGeometry(0.065, 0.055, 0.52, 8);
    }
    const armL = new T.Mesh(armGeo, clothMat);
    armL.position.set(-0.32, 1.12, 0);
    const armR = new T.Mesh(armGeo, clothMat);
    armR.position.set(0.32, 1.12, 0);
    group.add(armL, armR);

    // Enable shadows and PBR settings across proxy
    group.traverse(function(node) {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        node.frustumCulled = false;
      }
    });

    group.userData.humanHeight = 1.80;
    group.userData.normalizedHeight = 1.80;
    group.userData.isProxy = true;
    return group;
  }

  // ---------- Realistic PBR & Texture Normalization ----------
  function upgradeMeshPBR(object, THREE_REF) {
    const T = THREE_REF || (typeof THREE !== 'undefined' ? THREE : null);
    if (!object || !T) return;

    object.traverse(function(child) {
      if (!child.isMesh) return;

      child.castShadow = true;
      child.receiveShadow = true;
      child.frustumCulled = false;

      const materials = Array.isArray(child.material) ? child.material : [child.material];
      for (const mat of materials) {
        if (!mat) continue;

        // Ensure sRGB encoding on color/diffuse/albedo maps
        if (mat.map) {
          if (T.SRGBColorSpace) {
            mat.map.colorSpace = T.SRGBColorSpace;
          }
          if (typeof T.sRGBEncoding !== 'undefined') {
            mat.map.encoding = T.sRGBEncoding;
          }
        }

        // Natural skin / fabric roughness (0.60 - 0.85) to eliminate shiny plastic appearance
        mat.roughness = Math.max(0.62, Math.min(0.85, mat.roughness != null ? mat.roughness : 0.72));
        mat.metalness = Math.min(0.12, mat.metalness != null ? mat.metalness : 0.05);
        mat.envMapIntensity = 0.85;
        mat.needsUpdate = true;
      }
    });
  }

  // Normalize model scale so every NPC stands at realistic human height (~1.75 to 1.85 world units)
  function normalizeModelScale(model, targetHeight = 1.80, THREE_REF) {
    const T = THREE_REF || (typeof THREE !== 'undefined' ? THREE : null);
    if (!model || !T) return 1;

    model.updateMatrixWorld(true);
    const bbox = new T.Box3().setFromObject(model);
    const rawHeight = bbox.max.y - bbox.min.y;

    if (rawHeight > 0.001) {
      const scaleFactor = targetHeight / rawHeight;
      model.scale.setScalar(scaleFactor);
      model.position.y = -bbox.min.y * scaleFactor; // feet grounded cleanly at y = 0
    }

    model.userData.humanHeight = targetHeight;
    model.userData.normalizedHeight = targetHeight;
    return targetHeight;
  }

  // Root-motion horizontal stripping on animations
  function stripRootMotionXZ(clip) {
    if (!clip || !clip.tracks) return;
    for (const track of clip.tracks) {
      if (track.name.endsWith('.position') && /hips|root/i.test(track.name)) {
        const v = track.values;
        for (let i = 0; i < v.length; i += 3) {
          v[i] = 0;
          v[i + 2] = 0;
        }
      }
    }
  }

  // ---------- Asset Loading Pipeline ----------
  function loadGLTFVariant(variant, onLoaded, onError) {
    const T = (typeof THREE !== 'undefined' ? THREE : null);
    if (!T) return;

    const LoaderClass = (typeof BayouAssets !== 'undefined' && BayouAssets.GLTFLoader)
      ? BayouAssets.GLTFLoader
      : (T.GLTFLoader ? T.GLTFLoader : null);

    if (!LoaderClass) {
      setTimeout(() => loadGLTFVariant(variant, onLoaded, onError), 150);
      return;
    }

    const loader = new LoaderClass();

    // Setup DRACOLoader if available
    if (typeof T.DRACOLoader !== 'undefined') {
      const dracoLoader = new T.DRACOLoader();
      dracoLoader.setDecoderPath('vendor/draco/');
      loader.setDRACOLoader(dracoLoader);
    }

    function tryDir(idx) {
      if (idx >= candidateDirs.length) {
        if (onError) onError(new Error('Failed to load ' + variant.file + ' from all candidate dirs'));
        return;
      }
      const fullPath = candidateDirs[idx] + variant.file;
      loader.load(
        fullPath,
        function(gltf) {
          const template = gltf.scene;
          template.name = 'template_' + variant.id;

          // Process PBR and normalize to 1.80 units
          upgradeMeshPBR(template, T);
          normalizeModelScale(template, 1.80, T);

          // Store animations
          if (gltf.animations && gltf.animations.length) {
            for (const clip of gltf.animations) {
              stripRootMotionXZ(clip);
            }
            sharedAnimations.set(variant.id, gltf.animations);
            if (!defaultAnimations.length) {
              defaultAnimations = gltf.animations;
            }
          }

          loadedTemplates.set(variant.id, template);
          loadedTemplates.set(variant.file, template);
          if (onLoaded) onLoaded(template, gltf.animations);
        },
        undefined,
        function() {
          tryDir(idx + 1);
        }
      );
    }

    tryDir(0);
  }

  // Preload priority variants on startup
  function preloadNPCVariants() {
    for (const v of NPC_VARIANTS) {
      loadGLTFVariant(v);
    }
  }

  // Pick variant based on district / crowd variety
  function selectVariantForDistrict(districtId) {
    const d = districtId || (typeof D !== 'undefined' ? D?.id : 'nola');
    const matched = NPC_VARIANTS.filter(v => v.district && v.district.includes(d));
    const pool = matched.length ? matched : NPC_VARIANTS;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // ---------- NPC Spawning & Animation State Machine ----------
  function spawnNPC(options = {}) {
    const T = (typeof THREE !== 'undefined' ? THREE : null);
    if (!T) return null;

    const variant = options.variant
      ? (NPC_VARIANTS.find(v => v.id === options.variant || v.file === options.variant) || NPC_VARIANTS[0])
      : selectVariantForDistrict(options.district);

    const template = loadedTemplates.get(variant.id) || loadedTemplates.get('civilian_01') || loadedTemplates.get('tripo_76e7');

    const npcRoot = new T.Group();
    npcRoot.name = 'NPC_' + (variant.id || 'civilian') + '_' + Math.floor(Math.random() * 10000);

    let innerModel;
    let isCloned = false;

    if (template) {
      // Use SkeletonUtils.clone so each NPC has an independent skeleton and mixer
      innerModel = SkeletonUtils.clone(template);
      isCloned = true;
    } else {
      // Clean fallback to high-detail Capsule PBR proxy if GLB is loading / missing
      innerModel = createPBRProxy(T);
    }

    // Subtle scale variation (0.96 - 1.04) per spawn for natural crowds
    const scaleVar = 0.96 + Math.random() * 0.08;
    // In game world (where player EYE = 16), scale by game unit factor (~10x)
    const worldScale = (options.worldScale != null ? options.worldScale : 10) * scaleVar;
    npcRoot.scale.setScalar(worldScale);

    npcRoot.add(innerModel);

    // Subtle tint variation on materials
    if (options.tint !== false) {
      const tintJitter = (Math.random() - 0.5) * 0.12;
      innerModel.traverse(function(node) {
        if (node.isMesh && node.material) {
          const mats = Array.isArray(node.material) ? node.material : [node.material];
          for (const m of mats) {
            if (m.color) {
              const hsl = {};
              m.color.getHSL(hsl);
              m.color.setHSL(hsl.h, Math.max(0, hsl.s + tintJitter * 0.5), Math.max(0.2, Math.min(0.85, hsl.l + tintJitter)));
            }
          }
        }
      });
    }

    // Setup AnimationMixer
    let mixer = null;
    const actions = {};
    const animClips = sharedAnimations.get(variant.id) || defaultAnimations;

    if (animClips && animClips.length && isCloned) {
      mixer = new T.AnimationMixer(innerModel);
      for (const clip of animClips) {
        const action = mixer.clipAction(clip);
        actions[clip.name] = action;

        if (clip.name === 'idle' || clip.name === 'walk' || clip.name === 'run') {
          action.setLoop(T.LoopRepeat, Infinity);
        } else {
          action.setLoop(T.LoopOnce, 1);
          action.clampWhenFinished = false;
        }
      }

      // Action aliases
      if (actions['flee_01'] && !actions['react']) actions['react'] = actions['flee_01'];
      if (actions['freaky'] && !actions['react']) actions['react'] = actions['freaky'];
      if (!actions['walk'] && actions['run']) actions['walk'] = actions['run'];
      if (!actions['run'] && actions['walk']) actions['run'] = actions['walk'];

      // Start in idle
      if (actions['idle']) {
        actions['idle'].play();
      } else if (actions['walk']) {
        actions['walk'].play();
      }
    }

    // Compatibility userData layer for legacy engine hooks & tests
    const u = {
      body: new T.Group(),
      head: new T.Group(),
      hair: { material: { color: new T.Color('#3a2a1a') }, position: { y: 20.4 } },
      longHair: { visible: false },
      jaw: new T.Group(),
      face: new T.Group(),
      legL: { rotation: { z: 0 } },
      legR: { rotation: { z: 0 } },
      armL: { rotation: { z: 0 } },
      armR: { rotation: { z: 0, x: 0 } },
      skin: { color: new T.Color('#d4aa88'), emissive: { setRGB() {} } },
      shirt: { color: new T.Color('#394e5e'), emissive: { setRGB() {} } },
      pants: { color: new T.Color('#252e3b') },
      eyes: { visible: false },
      helmet: { visible: false, scale: { set() {} } },
      // NPC System State
      model: innerModel,
      mixer,
      actions,
      currentAction: actions['idle'] ? 'idle' : null,
      state: 'idle',
      isReacting: false,
      lastX: options.x || 0,
      lastY: options.y || 0,
      speed: 0,
      scaleVar,
      humanHeight: 1.80,
      normalizedHeight: 1.80
    };
    npcRoot.userData = u;

    activeNPCs.add(npcRoot);
    return npcRoot;
  }

  // Smooth crossfade between animation states (Idle, Walk, Run, React)
  function crossfadeNPC(npc, nextActionName, duration = 0.2, isOneShot = false) {
    const u = npc.userData;
    if (!u.mixer || !u.actions || !u.actions[nextActionName]) return;
    if (u.currentAction === nextActionName && u.actions[nextActionName].isRunning()) return;

    const prevAction = u.actions[u.currentAction];
    const nextAction = u.actions[nextActionName];

    nextAction.reset?.();
    nextAction.enabled = true;
    nextAction.setEffectiveTimeScale?.(1);
    nextAction.setEffectiveWeight?.(1);

    if (prevAction && prevAction !== nextAction && typeof prevAction.crossFadeTo === 'function') {
      prevAction.crossFadeTo(nextAction, duration, true);
    } else if (typeof nextAction.fadeIn === 'function') {
      nextAction.fadeIn(duration);
    }

    nextAction.play?.();
    u.currentAction = nextActionName;
    u.state = nextActionName;

    if (isOneShot) {
      u.isReacting = true;
      const onFinished = function(e) {
        if (e.action === nextAction) {
          u.isReacting = false;
          u.mixer.removeEventListener('finished', onFinished);
          // Return to walk or idle based on current speed
          const returnAction = u.speed > 0.2 ? (u.speed >= 3.5 ? 'run' : 'walk') : 'idle';
          crossfadeNPC(npc, u.actions[returnAction] ? returnAction : 'idle', 0.2, false);
        }
      };
      u.mixer.addEventListener('finished', onFinished);
    }
  }

  // Trigger reaction/combat/flee clip
  function triggerNPCReaction(npc) {
    const u = npc.userData;
    if (u.isReacting) return;
    const reactClip = u.actions['react'] ? 'react' : u.actions['flee_01'] ? 'flee_01' : u.actions['flee_02'] ? 'flee_02' : null;
    if (reactClip) {
      crossfadeNPC(npc, reactClip, 0.2, true);
    }
  }

  // Update NPC locomotion, animations, and reaction triggers
  function updateNPC(npc, dt) {
    const u = npc.userData;
    if (!u) return;

    if (u.mixer) {
      u.mixer.update(dt);
    }

    // If currently reacting / fleeing, allow one-shot to complete
    if (u.isReacting) return;

    // Determine target locomotion state based on movement speed
    let desiredAction = 'idle';
    if (u.speed >= 3.5) {
      desiredAction = u.actions['run'] ? 'run' : 'walk';
    } else if (u.speed > 0.2) {
      desiredAction = u.actions['walk'] ? 'walk' : 'run';
    } else {
      desiredAction = 'idle';
    }

    if (u.actions[desiredAction] && u.currentAction !== desiredAction) {
      crossfadeNPC(npc, desiredAction, 0.2, false);
    }
  }

  // Global per-frame update for all active NPCs
  let lastFrameTime = 0;
  function updateAllNPCs() {
    const now = performance.now();
    const dt = lastFrameTime ? Math.min((now - lastFrameTime) / 1000, 0.1) : 0.016;
    lastFrameTime = now;

    // Check if player fired weapon nearby (trigger reaction/flee across nearby NPCs)
    let playerFiredNearby = false;
    let px = 0, py = 0;
    if (typeof player !== 'undefined' && player) {
      px = player.x; py = player.y;
      playerFiredNearby = !!(player.flash > 0 || (typeof lastShotFrame !== 'undefined' && typeof frame !== 'undefined' && frame - lastShotFrame < 3));
    }

    for (const npc of activeNPCs) {
      // Remove dead or unparented NPCs from active set
      if (!npc.parent && activeNPCs.size > 150) {
        activeNPCs.delete(npc);
        continue;
      }

      if (playerFiredNearby) {
        const d = Math.hypot(npc.position.x - px, npc.position.z - py);
        if (d < 250) {
          triggerNPCReaction(npc);
        }
      }

      updateNPC(npc, dt);
    }
  }

  // ---------- Engine Hooks (makeFigure & poseFigure) ----------
  if (typeof window !== 'undefined') {
    // Wrap makeFigure to supply realistic rigged PBR GLB NPCs
    if (typeof makeFigure === 'function') {
      const baseMakeFigure = makeFigure;
      makeFigure = function(zombie) {
        // If templates are loaded and ready, spawn realistic rigged GLB NPC
        const d = (typeof D !== 'undefined' ? D?.id : 'nola');
        const npc = spawnNPC({ zombie: !!zombie, district: d });
        if (npc) return npc;
        return baseMakeFigure.apply(this, arguments);
      };
    }

    // Wrap poseFigure to drive world position, heading, velocity & animation states
    if (typeof poseFigure === 'function') {
      const basePoseFigure = poseFigure;
      poseFigure = function(m, x, y, a, anim, mode) {
        basePoseFigure.apply(this, arguments);

        const u = m?.userData;
        if (!u || !u.mixer) return;

        // Grounding cleanly at y = 0
        const groundY = (typeof terrainHeight === 'function' ? terrainHeight(x, y) : 0);
        m.position.set(x, groundY, y);
        m.rotation.y = -a;

        // Calculate velocity from position delta
        const dx = x - (u.lastX || x);
        const dy = y - (u.lastY || y);
        u.lastX = x;
        u.lastY = y;
        const currentSpeed = Math.hypot(dx, dy) * 60; // normalized speed per second
        u.speed = (mode === 'stand') ? 0 : Math.max(currentSpeed, (mode === 'walk' || mode === 'zombie') ? 1.5 : 0);

        if (mode === 'wave') {
          triggerNPCReaction(m);
        }
      };
    }

    // Hook render loop to update NPC mixers
    if (typeof render === 'function') {
      const baseRender = render;
      render = function() {
        updateAllNPCs();
        baseRender.apply(this, arguments);
      };
    }

    // Preload on startup
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', preloadNPCVariants);
    } else {
      setTimeout(preloadNPCVariants, 0);
    }
  }

  // ---------- Public Module API ----------
  const api = {
    SkeletonUtils,
    NPC_VARIANTS,
    createPBRProxy,
    upgradeMeshPBR,
    normalizeModelScale,
    loadGLTFVariant,
    preloadNPCVariants,
    selectVariantForDistrict,
    spawnNPC,
    crossfadeNPC,
    triggerNPCReaction,
    updateNPC,
    updateAllNPCs,
    get activeNPCs() { return activeNPCs; },
    get loadedTemplates() { return loadedTemplates; },
    get sharedAnimations() { return sharedAnimations; }
  };

  if (typeof window !== 'undefined') {
    window.level29NPC = api;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
