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
    { id: 'civilian_01', file: 'npc_civilian_01.glb', district: ['nola', 'fq', 'treme'], role: 'streetwear' },
    { id: 'civilian_02', file: 'npc_civilian_02.glb', district: ['nola', 'fq', 'canal'], role: 'commuter' },
    { id: 'bayou_local', file: 'npc_bayou_local.glb', district: ['bayou', 'forest', 'gardens'], role: 'local' },
    { id: 'civilian_03', file: 'npc_civilian_03.glb', district: ['canal', 'treme', 'nola'], role: 'urban' },
    { id: 'civilian_04', file: 'npc_civilian_04.glb', district: ['bayou', 'forest', 'gardens'], role: 'worker' },
    { id: 'anthony', file: 'npc_anthony.glb', district: ['nola', 'fq', 'treme', 'canal'], role: 'stylish' },
    { id: 'drako', file: 'npc_drako.glb', district: ['canal', 'treme', 'gardens', 'nola'], role: 'enforcer' },
    { id: 'ronnie_crew', file: 'npc_ronnie_crew.glb', district: ['bayou', 'nola', 'gardens', 'fq'], role: 'gang' },
    { id: 'tripo_76e7', file: 'tripo_convert_76e7a4f4-0853-40fa-855d-89ea8d8bdad9.glb', district: ['nola', 'fq'], role: 'civilian' },
    { id: 'tripo_5ccb', file: 'tripo_convert_5ccbf298-3609-41e5-9b5c-abb168e8d3aa.glb', district: ['canal', 'treme'], role: 'civilian' },
    { id: 'tripo_c5fa', file: 'tripo_convert_c5fa3aab-73ad-4057-a1e1-c6aa5923ce19.glb', district: ['bayou', 'forest'], role: 'local' },
    { id: 'tripo_4e66', file: 'tripo_convert_4e667b7e-7179-4c3c-aa39-b68179b7a9d1.glb', district: ['nola', 'gardens'], role: 'pedestrian' },
    { id: 'tripo_fe4d', file: 'tripo_convert_fe4d9a43-a215-4806-90d0-8a2f6756e3e8.glb', district: ['bayou', 'gardens'], role: 'local' }
  ];

  // Authentic demographic skin tone spectrum (Fitzpatrick I-VI)
  const SKIN_TONES = [
    '#2f1d18', // Deep Mahogany
    '#43281c', // Rich Espresso
    '#593826', // Warm Chestnut
    '#744a34', // Rich Cocoa / Bronze
    '#8d5b3f', // Caramel Bronze
    '#a87251', // Warm Amber
    '#bf8866', // Golden Tan
    '#cfa07e', // Warm Honey
    '#dfb496', // Olive Peach
    '#ecc4aa', // Light Honey
    '#f3d3bd'  // Warm Fair
  ];

  const HAIR_COLORS = [
    '#151210', '#251b14', '#362316', '#4a3321', '#66472f', '#7d5936', '#3b3b3b', '#6b6b6b'
  ];

  // District-Themed Wardrobe Palettes
  const DISTRICT_PALETTES = {
    nola: [
      { shirt: '#1e293b', pants: '#334155', accent: '#38bdf8' },
      { shirt: '#475569', pants: '#1e293b', accent: '#f59e0b' },
      { shirt: '#0f172a', pants: '#475569', accent: '#e2e8f0' },
      { shirt: '#3b82f6', pants: '#1e293b', accent: '#60a5fa' },
      { shirt: '#f8fafc', pants: '#0f172a', accent: '#0284c7' }
    ],
    fq: [ // French Quarter: Vibrant carnival, jazz, nightlife, velvet
      { shirt: '#6b21a8', pants: '#18181b', accent: '#eab308' }, // Mardi Gras purple & gold
      { shirt: '#047857', pants: '#374151', accent: '#fbbf24' }, // Emerald & brass
      { shirt: '#be123c', pants: '#1f2937', accent: '#f43f5e' }, // Velvet crimson
      { shirt: '#d97706', pants: '#292524', accent: '#f59e0b' }, // Bourbon amber
      { shirt: '#0891b2', pants: '#f3f4f6', accent: '#22d3ee' }, // Tropical teal
      { shirt: '#831843', pants: '#18181b', accent: '#f472b6' }
    ],
    treme: [ // Tremé: Soulful, brass bands, earth tones
      { shirt: '#b45309', pants: '#262626', accent: '#f59e0b' },
      { shirt: '#4338ca', pants: '#171717', accent: '#818cf8' },
      { shirt: '#15803d', pants: '#3f3f46', accent: '#4ade80' },
      { shirt: '#9a3412', pants: '#1c1917', accent: '#fb923c' },
      { shirt: '#7c3aed', pants: '#27272a', accent: '#c084fc' }
    ],
    canal: [ // Industrial Canal: Workwear, dockers, high-vis
      { shirt: '#ea580c', pants: '#1e293b', accent: '#facc15', isWorkwear: true },
      { shirt: '#65a30d', pants: '#334155', accent: '#e2e8f0', isWorkwear: true },
      { shirt: '#0369a1', pants: '#1e293b', accent: '#94a3b8' },
      { shirt: '#57534e', pants: '#292524', accent: '#ea580c' },
      { shirt: '#3b82f6', pants: '#1c1917', accent: '#fbbf24', isWorkwear: true }
    ],
    bayou: [ // Bayou Swamp: Anglers, camo, flannel, outdoor survival
      { shirt: '#3f6212', pants: '#365314', accent: '#a3e635' },
      { shirt: '#991b1b', pants: '#1e293b', accent: '#450a0a' },
      { shirt: '#78350f', pants: '#451a03', accent: '#d97706' },
      { shirt: '#1e3a5f', pants: '#334155', accent: '#64748b' },
      { shirt: '#4d5b41', pants: '#2a3324', accent: '#a8a29e' }
    ],
    forest: [ // Forest Reserve: Rangers, hikers, scouts
      { shirt: '#365314', pants: '#1c1917', accent: '#fef08a' },
      { shirt: '#854d0e', pants: '#3f3f46', accent: '#fbbf24' },
      { shirt: '#065f46', pants: '#18181b', accent: '#34d399' },
      { shirt: '#c2410c', pants: '#292524', accent: '#fed7aa' }
    ],
    gardens: [ // Level 29 Gardens: Luxury, sleek fashion, velvet, gold
      { shirt: '#09090b', pants: '#18181b', accent: '#ecc35c' },
      { shirt: '#f8fafc', pants: '#020617', accent: '#ecc35c' },
      { shirt: '#4c1d95', pants: '#09090b', accent: '#e879f9' },
      { shirt: '#064e3b', pants: '#111827', accent: '#10b981' },
      { shirt: '#701a75', pants: '#0f172a', accent: '#f43f5e' }
    ]
  };

  // Diverse NPC Archetypes across Districts
  const NPC_ARCHETYPES = [
    { id: 'civilian', name: 'Civilian', chance: 0.30, hats: ['none', 'none', 'cap', 'beanie'], shades: 0.25 },
    { id: 'tourist', name: 'Tourist', chance: 0.15, district: ['fq', 'nola'], hats: ['fedora', 'cap', 'none'], shades: 0.55, prop: 'phone' },
    { id: 'musician', name: 'Street Musician', chance: 0.12, district: ['treme', 'fq'], hats: ['fedora', 'beanie'], shades: 0.45 },
    { id: 'worker', name: 'Dock Worker', chance: 0.18, district: ['canal'], hats: ['hardhat', 'cap'], shades: 0.15, prop: 'clipboard', vest: true },
    { id: 'angler', name: 'Bayou Fisherman', chance: 0.20, district: ['bayou'], hats: ['cap', 'none'], shades: 0.35, prop: 'rod' },
    { id: 'ranger', name: 'Forest Ranger', chance: 0.15, district: ['forest'], hats: ['cap', 'none'], shades: 0.30 },
    { id: 'vip', name: 'VIP Resident', chance: 0.15, district: ['gardens', 'nola'], hats: ['none'], shades: 0.70, goldChain: true },
    { id: 'guard', name: 'Security Guard', chance: 0.10, district: ['canal', 'gardens', 'nola'], hats: ['cap'], shades: 0.80 },
    { id: 'hustler', name: 'Street Hustler', chance: 0.12, district: ['treme', 'canal', 'fq'], hats: ['beanie', 'cap'], shades: 0.60, goldChain: true },
    { id: 'jogger', name: 'City Jogger', chance: 0.08, district: ['nola', 'gardens', 'forest'], hats: ['cap', 'none'], shades: 0.40, speedMultiplier: 1.5 }
  ];

  const candidateDirs = [
    'assets/models/npcs/',
    '/assets/models/npcs/',
    'public/assets/models/npcs/',
    'public/game/assets/models/npcs/',
    'models/npcs/',
    'models/',
    'public/models/',
    'public/game/models/'
  ];

  const loadedTemplates = new Map();
  const sharedAnimations = new Map();
  const activeNPCs = new Set();
  let defaultAnimations = [];

  // ---------- Higher-Detail Capsule/Standard PBR Human Proxy Fallback ----------
  function createPBRProxy(THREE_REF, options = {}) {
    const T = THREE_REF || (typeof THREE !== 'undefined' ? THREE : (typeof globalThis !== 'undefined' && globalThis.THREE ? globalThis.THREE : null));
    if (!T) return null;

    const group = new T.Group();
    group.name = 'PBR_Human_Proxy';

    const skinColor = options.skin || selectSkinTone();
    const shirtColor = options.shirt || (options.palette?.shirt || '#394e5e');
    const pantsColor = options.pants || (options.palette?.pants || '#252e3b');

    const skinMat = new T.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.75,
      metalness: 0.05,
      envMapIntensity: 0.85
    });

    const clothMat = new T.MeshStandardMaterial({
      color: shirtColor,
      roughness: 0.82,
      metalness: 0.08,
      envMapIntensity: 0.85
    });

    const pantsMat = new T.MeshStandardMaterial({
      color: pantsColor,
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
    group.userData.skinMat = skinMat;
    group.userData.clothMat = clothMat;
    group.userData.pantsMat = pantsMat;
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

  // ---------- NPC Accessory & Prop Generation ----------
  function findBone(root, pattern) {
    if (!root || !root.traverse) return null;
    let found = null;
    root.traverse(function(node) {
      if (!found && node.isBone && pattern.test(node.name)) {
        found = node;
      }
    });
    return found;
  }

  function createShades(T) {
    const group = new T.Group();
    group.name = 'prop_shades';
    const darkMat = new T.MeshStandardMaterial({ color: 0x111216, roughness: 0.2, metalness: 0.85 });
    const lensMat = new T.MeshStandardMaterial({ color: 0x050608, roughness: 0.1, metalness: 0.95 });

    const frame = new T.Mesh(new T.BoxGeometry(0.24, 0.04, 0.04), darkMat);
    const lensL = new T.Mesh(new T.BoxGeometry(0.08, 0.05, 0.015), lensMat);
    lensL.position.set(-0.055, -0.01, 0.02);
    const lensR = new T.Mesh(new T.BoxGeometry(0.08, 0.05, 0.015), lensMat);
    lensR.position.set(0.055, -0.01, 0.02);

    group.add(frame, lensL, lensR);
    return group;
  }

  function createCap(T, color = '#272a30') {
    const group = new T.Group();
    group.name = 'prop_cap';
    const mat = new T.MeshStandardMaterial({ color, roughness: 0.78, metalness: 0.05 });
    const dome = new T.Mesh(new T.SphereGeometry(0.145, 12, 8, 0, Math.PI * 2, 0, Math.PI / 1.9), mat);
    const brim = new T.Mesh(new T.BoxGeometry(0.16, 0.016, 0.11), mat);
    brim.position.set(0, 0.01, 0.11);
    group.add(dome, brim);
    return group;
  }

  function createFedora(T, color = '#222326', bandColor = '#ecc35c') {
    const group = new T.Group();
    group.name = 'prop_fedora';
    const mat = new T.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.05 });
    const bandMat = new T.MeshStandardMaterial({ color: bandColor, roughness: 0.5, metalness: 0.2 });

    const brim = new T.Mesh(new T.CylinderGeometry(0.23, 0.23, 0.015, 16), mat);
    const crown = new T.Mesh(new T.CylinderGeometry(0.13, 0.15, 0.11, 16), mat);
    crown.position.y = 0.055;
    const band = new T.Mesh(new T.CylinderGeometry(0.152, 0.152, 0.025, 16), bandMat);
    band.position.y = 0.02;

    group.add(brim, crown, band);
    return group;
  }

  function createHardHat(T, color = '#f59e0b') {
    const group = new T.Group();
    group.name = 'prop_hardhat';
    const mat = new T.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.12 });
    const shell = new T.Mesh(new T.SphereGeometry(0.155, 14, 8, 0, Math.PI * 2, 0, Math.PI / 1.8), mat);
    const brim = new T.Mesh(new T.CylinderGeometry(0.19, 0.19, 0.018, 16), mat);
    group.add(shell, brim);
    return group;
  }

  function createBeanie(T, color = '#3b4252') {
    const group = new T.Group();
    group.name = 'prop_beanie';
    const mat = new T.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.02 });
    const shell = new T.Mesh(new T.SphereGeometry(0.148, 12, 8, 0, Math.PI * 2, 0, Math.PI / 1.6), mat);
    shell.scale.set(1, 1.15, 1);
    if (typeof T.TorusGeometry !== 'undefined') {
      const cuff = new T.Mesh(new T.TorusGeometry(0.138, 0.025, 8, 16), mat);
      cuff.rotation.x = Math.PI / 2;
      group.add(cuff);
    }
    group.add(shell);
    return group;
  }

  function createGoldChain(T) {
    const group = new T.Group();
    group.name = 'prop_gold_chain';
    const goldMat = new T.MeshStandardMaterial({ color: '#ecc35c', roughness: 0.22, metalness: 0.92 });
    if (typeof T.TorusGeometry !== 'undefined') {
      const ring = new T.Mesh(new T.TorusGeometry(0.15, 0.014, 8, 20), goldMat);
      ring.rotation.x = Math.PI / 2.3;
      group.add(ring);
    }
    return group;
  }

  function createSafetyVest(T, color = '#ea580c') {
    const group = new T.Group();
    group.name = 'prop_safety_vest';
    const vestMat = new T.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.05 });
    const silverMat = new T.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.3, metalness: 0.75 });

    const strapL = new T.Mesh(new T.BoxGeometry(0.05, 0.45, 0.26), vestMat);
    strapL.position.set(-0.14, 0, 0);
    const strapR = new T.Mesh(new T.BoxGeometry(0.05, 0.45, 0.26), vestMat);
    strapR.position.set(0.14, 0, 0);
    const belt = new T.Mesh(new T.BoxGeometry(0.38, 0.06, 0.28), silverMat);
    belt.position.set(0, -0.15, 0);

    group.add(strapL, strapR, belt);
    return group;
  }

  function createHandProp(T, type) {
    const group = new T.Group();
    group.name = 'prop_' + type;
    if (type === 'phone') {
      const phoneMat = new T.MeshStandardMaterial({ color: 0x18181b, roughness: 0.2, metalness: 0.8 });
      const body = new T.Mesh(new T.BoxGeometry(0.05, 0.10, 0.008), phoneMat);
      const screen = new T.Mesh(new T.PlaneGeometry(0.042, 0.088), new T.MeshBasicMaterial({ color: 0x60a5fa }));
      screen.position.z = 0.005;
      group.add(body, screen);
      group.rotation.set(-0.5, 0.3, 0);
    } else if (type === 'clipboard') {
      const board = new T.Mesh(new T.BoxGeometry(0.14, 0.20, 0.01), new T.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.8 }));
      const paper = new T.Mesh(new T.PlaneGeometry(0.11, 0.17), new T.MeshBasicMaterial({ color: 0xf8fafc }));
      paper.position.z = 0.006;
      group.add(board, paper);
      group.rotation.set(-0.6, 0, 0);
    } else if (type === 'rod') {
      const rodMat = new T.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.6 });
      const rod = new T.Mesh(new T.CylinderGeometry(0.008, 0.018, 1.8, 6), rodMat);
      rod.position.y = 0.5;
      rod.rotation.z = -0.4;
      group.add(rod);
    }
    return group;
  }

  function attachAccessories(npcRoot, innerModel, archetype, context, T) {
    if (!T || !npcRoot || !innerModel || !archetype) return [];
    const attached = [];

    const headBone = findBone(innerModel, /head/i);
    const handBone = findBone(innerModel, /r.*hand|hand.*r|right_hand/i);
    const spineBone = findBone(innerModel, /spine2|chest|spine/i);

    // Sunglasses
    const wantShades = (archetype.shades && Math.random() < archetype.shades);
    if (wantShades) {
      const shades = createShades(T);
      if (headBone) {
        shades.position.set(0, 0.08, 0.11);
        headBone.add(shades);
      } else {
        shades.position.set(0, 1.63, 0.12);
        innerModel.add(shades);
      }
      attached.push('shades');
    }

    // Headwear
    const hatList = archetype.hats || ['none'];
    const hatType = hatList[Math.floor(Math.random() * hatList.length)];
    if (hatType && hatType !== 'none') {
      let hatObj = null;
      if (hatType === 'cap') hatObj = createCap(T, context?.palette?.shirt || '#272a30');
      else if (hatType === 'fedora') hatObj = createFedora(T, '#202226', context?.palette?.accent || '#ecc35c');
      else if (hatType === 'hardhat') hatObj = createHardHat(T, '#facc15');
      else if (hatType === 'beanie') hatObj = createBeanie(T, context?.palette?.pants || '#3b4252');

      if (hatObj) {
        if (headBone) {
          hatObj.position.set(0, 0.14, 0.01);
          headBone.add(hatObj);
        } else {
          hatObj.position.set(0, 1.76, 0.01);
          innerModel.add(hatObj);
        }
        attached.push(hatType);
      }
    }

    // Gold Chain
    if (archetype.goldChain) {
      const chain = createGoldChain(T);
      if (spineBone) {
        chain.position.set(0, 0.12, 0.02);
        spineBone.add(chain);
      } else {
        chain.position.set(0, 1.34, 0.02);
        innerModel.add(chain);
      }
      attached.push('goldChain');
    }

    // Safety Vest
    if (archetype.vest) {
      const vest = createSafetyVest(T, '#ea580c');
      if (spineBone) {
        spineBone.add(vest);
      } else {
        vest.position.set(0, 1.18, 0);
        innerModel.add(vest);
      }
      attached.push('vest');
    }

    // Handheld Props
    if (archetype.prop) {
      const propObj = createHandProp(T, archetype.prop);
      if (handBone) {
        handBone.add(propObj);
      } else {
        propObj.position.set(0.35, 0.95, 0.15);
        innerModel.add(propObj);
      }
      attached.push(archetype.prop);
    }

    // Ensure all attached accessories cast and receive shadows
    for (const child of [headBone, handBone, spineBone, innerModel]) {
      if (child) {
        child.traverse(function(node) {
          if (node.isMesh && node.name && node.name.startsWith('prop_')) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
      }
    }

    return attached;
  }

  function applyColorsToModel(npc, skin, shirt, pants, hairCol, THREE_REF) {
    const T = THREE_REF || (typeof THREE !== 'undefined' ? THREE : (typeof globalThis !== 'undefined' && globalThis.THREE ? globalThis.THREE : null));
    if (!npc || !npc.userData) return;
    const u = npc.userData;

    if (u.skin?.color?.set && skin) u.skin.color.set(skin);
    if (u.shirt?.color?.set && shirt) u.shirt.color.set(shirt);
    if (u.pants?.color?.set && pants) u.pants.color.set(pants);
    if (u.hair?.material?.color?.set && hairCol) u.hair.material.color.set(hairCol);

    const model = u.model || npc;
    if (!model || !T) return;

    // If PBR proxy, directly update the proxy materials
    if (u.isProxy) {
      if (u.skinMat && skin) u.skinMat.color.set(skin);
      if (u.clothMat && shirt) u.clothMat.color.set(shirt);
      if (u.pantsMat && pants) u.pantsMat.color.set(pants);
      return;
    }

    const skinColor = skin ? new T.Color(skin) : null;
    const shirtColor = shirt ? new T.Color(shirt) : null;
    const pantsColor = pants ? new T.Color(pants) : null;

    model.traverse(function(child) {
      if (!child.isMesh || !child.material) return;
      if (child.name && child.name.startsWith('prop_')) return; // don't colorize props

      const mats = Array.isArray(child.material) ? child.material : [child.material];
      for (const m of mats) {
        if (!m || !m.color) continue;
        const name = (child.name + ' ' + (m.name || '')).toLowerCase();

        if (/skin|head|face|hand|body|arm/i.test(name) && skinColor) {
          if (typeof m.color.copy === 'function') m.color.copy(skinColor);
          else if (m.color.set) m.color.set(skin);
        } else if (/shirt|top|torso|cloth|jacket|hoodie/i.test(name) && shirtColor) {
          if (typeof m.color.copy === 'function') m.color.copy(shirtColor);
          else if (m.color.set) m.color.set(shirt);
        } else if (/pants|legs|bottom|jeans/i.test(name) && pantsColor) {
          if (typeof m.color.copy === 'function') m.color.copy(pantsColor);
          else if (m.color.set) m.color.set(pants);
        } else if (shirtColor) {
          if (typeof m.color.lerp === 'function') m.color.lerp(shirtColor, 0.4);
          else if (m.color.set) m.color.set(shirt);
        }
        m.needsUpdate = true;
      }
    });
  }

  function selectSkinTone() {
    return SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)];
  }

  function selectOutfitPalette(districtId, isWorkwear) {
    const d = districtId || (typeof D !== 'undefined' ? D?.id : 'nola');
    const list = DISTRICT_PALETTES[d] || DISTRICT_PALETTES.nola;
    if (isWorkwear) {
      const ww = list.filter(p => p.isWorkwear);
      if (ww.length) return ww[Math.floor(Math.random() * ww.length)];
    }
    return list[Math.floor(Math.random() * list.length)];
  }

  function selectArchetypeForDistrict(districtId) {
    const d = districtId || (typeof D !== 'undefined' ? D?.id : 'nola');
    const matched = NPC_ARCHETYPES.filter(a => !a.district || a.district.includes(d));
    if (!matched.length) return NPC_ARCHETYPES[0];
    const totalWeight = matched.reduce((sum, a) => sum + (a.chance || 0.1), 0);
    let r = Math.random() * totalWeight;
    for (const arch of matched) {
      r -= (arch.chance || 0.1);
      if (r <= 0) return arch;
    }
    return matched[0];
  }

  // Pick variant based on district & archetype variety
  function selectVariantForDistrict(districtId, archetypeId) {
    const d = districtId || (typeof D !== 'undefined' ? D?.id : 'nola');
    let pool = NPC_VARIANTS.filter(v => v.district && v.district.includes(d));
    if (archetypeId) {
      const roleMatched = pool.filter(v => v.role === archetypeId);
      if (roleMatched.length) pool = roleMatched;
    }
    if (!pool.length) pool = NPC_VARIANTS;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // ---------- NPC Spawning & Animation State Machine ----------
  function spawnNPC(options = {}) {
    const T = (typeof THREE !== 'undefined' ? THREE : (typeof globalThis !== 'undefined' && globalThis.THREE ? globalThis.THREE : (typeof global !== 'undefined' && global.THREE ? global.THREE : null)));
    if (!T) return null;

    const district = options.district || (typeof D !== 'undefined' ? D?.id : 'nola');
    const archetype = options.archetype
      ? (NPC_ARCHETYPES.find(a => a.id === options.archetype) || NPC_ARCHETYPES[0])
      : selectArchetypeForDistrict(district);

    const variant = options.variant
      ? (NPC_VARIANTS.find(v => v.id === options.variant || v.file === options.variant) || NPC_VARIANTS[0])
      : selectVariantForDistrict(district, archetype.id);

    const template = loadedTemplates.get(variant.id) || loadedTemplates.get(variant.file) || loadedTemplates.get('civilian_01') || loadedTemplates.get('tripo_76e7');

    const npcRoot = new T.Group();
    npcRoot.name = 'NPC_' + (variant.id || 'civilian') + '_' + Math.floor(Math.random() * 10000);

    const skinTone = options.skin || (options.zombie ? '#6b8258' : selectSkinTone());
    const palette = options.palette || selectOutfitPalette(district, archetype.id === 'worker');
    const hairColor = options.hair || HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)];

    let innerModel;
    let isCloned = false;

    if (template) {
      innerModel = SkeletonUtils.clone(template, T);
      isCloned = true;
    } else {
      innerModel = createPBRProxy(T, { skin: skinTone, shirt: palette.shirt, pants: palette.pants, palette });
    }

    // Height & body proportions variation
    // Height: 1.68m to 1.92m (realistic distribution around 1.80m)
    const targetHeight = options.height != null ? options.height : (1.68 + Math.random() * 0.24);
    const widthRatio = 0.93 + Math.random() * 0.14; // shoulder width variation
    const depthRatio = 0.94 + Math.random() * 0.12; // torso depth variation

    normalizeModelScale(innerModel, targetHeight, T);
    innerModel.scale.x *= widthRatio;
    innerModel.scale.z *= depthRatio;

    // Subtle scale variation per spawn for world scaling
    const scaleVar = 0.96 + Math.random() * 0.08;
    const worldScale = (options.worldScale != null ? options.worldScale : 10) * scaleVar;
    npcRoot.scale.setScalar(worldScale);

    npcRoot.add(innerModel);

    // Color application & tinting
    if (options.tint !== false) {
      applyColorsToModel({ userData: { model: innerModel, isProxy: !isCloned } }, skinTone, palette.shirt, palette.pants, hairColor, T);
    }

    // Attach archetype accessories (shades, hats, vests, props)
    const attachedProps = (options.accessories !== false)
      ? attachAccessories(npcRoot, innerModel, archetype, { district, palette }, T)
      : [];

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
    const body = new T.Group();
    npcRoot.add(body);

    const skinColor = new T.Color(skinTone);
    const shirtColor = new T.Color(palette.shirt);
    const pantsColor = new T.Color(palette.pants);
    const hairColorObj = new T.Color(hairColor);

    const skinMat = (typeof T.MeshStandardMaterial === 'function' ? new T.MeshStandardMaterial({ color: skinColor }) : (typeof T.MeshBasicMaterial === 'function' ? new T.MeshBasicMaterial({ color: skinColor }) : { color: skinColor, emissive: { setRGB() {} } }));
    const shirtMat = (typeof T.MeshStandardMaterial === 'function' ? new T.MeshStandardMaterial({ color: shirtColor }) : (typeof T.MeshBasicMaterial === 'function' ? new T.MeshBasicMaterial({ color: shirtColor }) : { color: shirtColor, emissive: { setRGB() {} } }));
    const pantsMat = (typeof T.MeshStandardMaterial === 'function' ? new T.MeshStandardMaterial({ color: pantsColor }) : (typeof T.MeshBasicMaterial === 'function' ? new T.MeshBasicMaterial({ color: pantsColor }) : { color: pantsColor, emissive: { setRGB() {} } }));
    const hairMat = (typeof T.MeshStandardMaterial === 'function' ? new T.MeshStandardMaterial({ color: hairColorObj }) : (typeof T.MeshBasicMaterial === 'function' ? new T.MeshBasicMaterial({ color: hairColorObj }) : { color: hairColorObj, emissive: { setRGB() {} } }));

    const BoxGeo = typeof T.BoxGeometry === 'function' ? T.BoxGeometry : (typeof T.BufferGeometry === 'function' ? T.BufferGeometry : class {});
    const SphereGeo = typeof T.SphereGeometry === 'function' ? T.SphereGeometry : (typeof T.BufferGeometry === 'function' ? T.BufferGeometry : class {});

    const armL = new T.Group();
    const armLSleeve = new T.Mesh(new BoxGeo(1, 1, 1), shirtMat);
    armL.add(armLSleeve);
    body.add(armL);

    const armR = new T.Group();
    const armRSleeve = new T.Mesh(new BoxGeo(1, 1, 1), shirtMat);
    armR.add(armRSleeve);
    body.add(armR);

    const legL = new T.Group();
    body.add(legL);
    const legR = new T.Group();
    body.add(legR);

    const torso = new T.Mesh(new BoxGeo(1, 1, 1), shirtMat);
    body.add(torso);

    const head = new T.Mesh(new BoxGeo(1, 1, 1), skinMat);
    body.add(head);

    const jaw = new T.Group();
    body.add(jaw);

    const hairMesh = new T.Mesh(new SphereGeo(1, 8, 8), hairMat);
    hairMesh.position.y = 20.4;
    body.add(hairMesh);

    const face = new T.Group();
    body.add(face);

    const eyes = new T.Group();
    body.add(eyes);

    const helmet = new T.Mesh(new SphereGeo(1, 8, 8), shirtMat);
    helmet.visible = false;
    body.add(helmet);

    const u = {
      body,
      head,
      hair: hairMesh,
      longHair: { visible: false },
      jaw,
      face,
      legL,
      legR,
      armL,
      armR,
      torso,
      skin: skinMat,
      shirt: shirtMat,
      pants: pantsMat,
      eyes,
      helmet,
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
      humanHeight: targetHeight,
      normalizedHeight: targetHeight,
      targetHeight,
      widthRatio,
      depthRatio,
      archetype: archetype.id,
      archetypeName: archetype.name,
      district,
      skinTone,
      palette,
      accessories: attachedProps,
      speedMultiplier: archetype.speedMultiplier || 1.0
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
        // If called by specialized procedural character constructors (makeRonnie, Sheldon wardrobe preview,
        // Sgt Powell, Captain Smith, Felicia trailer, etc.), preserve the original base figure geometry
        try {
          const stack = new Error().stack || '';
          if (/makeRonnie|syncRonnie|wardrobe|sheldon|powell|smith|trailer|rental/i.test(stack)) {
            return baseMakeFigure.apply(this, arguments);
          }
        } catch (_) {}

        // If templates are loaded and ready, spawn realistic rigged GLB NPC
        const d = (typeof D !== 'undefined' ? D?.id : 'nola');
        const npc = spawnNPC({ zombie: !!zombie, district: d });
        if (npc) return npc;
        return baseMakeFigure.apply(this, arguments);
      };
    }

    // Wrap setFigureColors to update realistic 3D model materials
    if (typeof setFigureColors === 'function') {
      const baseSetFigureColors = setFigureColors;
      setFigureColors = function(m, skin, shirt, pants, hairCol) {
        baseSetFigureColors.apply(this, arguments);
        if (m && m.userData && m.userData.model) {
          applyColorsToModel(m, skin, shirt, pants, hairCol);
        }
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
    NPC_ARCHETYPES,
    SKIN_TONES,
    DISTRICT_PALETTES,
    HAIR_COLORS,
    createPBRProxy,
    upgradeMeshPBR,
    normalizeModelScale,
    loadGLTFVariant,
    preloadNPCVariants,
    selectVariantForDistrict,
    selectArchetypeForDistrict,
    selectOutfitPalette,
    selectSkinTone,
    createShades,
    createCap,
    createFedora,
    createHardHat,
    createBeanie,
    createGoldChain,
    createSafetyVest,
    createHandProp,
    attachAccessories,
    applyColorsToModel,
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
