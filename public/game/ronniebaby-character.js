'use strict';
(function(){
  // Ronniebaby 3rd-Person Character (3PV) & Animation State Machine
  // Blood in the Bayou - Level 29 Production

  const ALL_CLIP_NAMES = [
    'run', 'shoot', 'defeat_03', 'hit_to_stomach', 'hit_to_body_01', 'hit_to_side',
    'box_02', 'complain_01', 'dance_05', 'fire', 'box_03', 'slash',
    'cast_a_spell', 'front_kick_01', 'front_kick_02', 'box_01', 'hit_to_head',
    'fall', 'walk'
  ];

  const ONE_SHOT_CLIPS = new Set([
    'shoot', 'fire', 'hit_to_stomach', 'hit_to_body_01', 'hit_to_side', 'hit_to_head',
    'box_01', 'box_02', 'box_03', 'slash', 'front_kick_01', 'front_kick_02',
    'complain_01', 'cast_a_spell', 'defeat_02', 'defeat_03', 'fall'
  ]);

  let characterMesh = null;
  let mixer = null;
  const clips = new Map();
  const actions = {};
  let currentActionName = null;
  let activeOneShot = null;
  let lastHp = 100;
  let lastMeleeIndex = 0;
  let lastTime = 0;
  let isDead = false;
  let targetRotationY = 0;

  // Root-motion stripping: Zero out horizontal X/Z translation on root bone (Hips)
  // while preserving vertical Y translation (drops, crouches, jumps, defeat fall)
  function stripRootMotionXZ(clip) {
    if (!clip || !clip.tracks) return;
    for (const track of clip.tracks) {
      if (track.name.endsWith('.position') && /hips|root/i.test(track.name)) {
        const v = track.values;
        for (let i = 0; i < v.length; i += 3) {
          v[i] = 0;     // X translation = 0
          v[i + 2] = 0; // Z translation = 0
        }
      }
    }
  }

  // Create an idle standing clip from stationary frame 0 of walk/pose if idle is absent
  function createIdleClip(sourceClip, THREE_REF) {
    const T = THREE_REF || (typeof THREE !== 'undefined' ? THREE : null);
    if (!T) return null;
    const newTracks = [];
    if (sourceClip && sourceClip.tracks) {
      for (const track of sourceClip.tracks) {
        const stride = track.values.length / track.times.length;
        const frame0 = track.values.slice(0, stride);
        const cloned = track.clone();
        cloned.times = new Float32Array([0, 2]);
        const doubleValues = new Float32Array(stride * 2);
        doubleValues.set(frame0, 0);
        doubleValues.set(frame0, stride);
        cloned.values = doubleValues;
        newTracks.push(cloned);
      }
    }
    return new T.AnimationClip('idle', 2, newTracks);
  }

  // Shortest-angle interpolation
  function lerpAngle(current, target, alpha) {
    let diff = (target - current) % (Math.PI * 2);
    if (diff < -Math.PI) diff += Math.PI * 2;
    if (diff > Math.PI) diff -= Math.PI * 2;
    return current + diff * alpha;
  }

  // Transition between animation actions with smooth crossfade
  function transitionTo(name, duration, isOneShot) {
    if (!actions[name]) return;
    const nextAction = actions[name];
    if (currentActionName === name && nextAction.isRunning()) return;

    const prevAction = currentActionName ? actions[currentActionName] : null;
    const fade = typeof duration === 'number' ? duration : 0.2;

    nextAction.reset();
    nextAction.enabled = true;
    nextAction.setEffectiveTimeScale(1);
    nextAction.setEffectiveWeight(1);

    if (prevAction && prevAction !== nextAction) {
      prevAction.crossFadeTo(nextAction, fade, true);
    } else {
      nextAction.fadeIn(fade);
    }
    nextAction.play();
    currentActionName = name;
    if (isOneShot) {
      activeOneShot = name;
    } else {
      activeOneShot = null;
    }
  }

  // Setup animations and actions on a loaded GLTF scene
  function setupCharacterAnimations(gltf, THREE_REF) {
    const T = THREE_REF || (typeof THREE !== 'undefined' ? THREE : null);
    if (!T) return;

    clips.clear();
    for (const k in actions) delete actions[k];

    // Log loaded clip names on startup
    const loadedNames = (gltf.animations || []).map(a => a.name);
    console.log('Loaded Ronniebaby character animations:', loadedNames);

    mixer = new T.AnimationMixer(gltf.scene);

    for (const clip of (gltf.animations || [])) {
      stripRootMotionXZ(clip);
      clips.set(clip.name, clip);
      const action = mixer.clipAction(clip);
      actions[clip.name] = action;

      if (ONE_SHOT_CLIPS.has(clip.name)) {
        action.setLoop(T.LoopOnce, 1);
        action.clampWhenFinished = (clip.name === 'defeat_02' || clip.name === 'defeat_03');
      } else {
        action.setLoop(T.LoopRepeat, Infinity);
        action.clampWhenFinished = false;
      }
    }

    // Bidirectional alias defeat_02 <-> defeat_03
    if (actions['defeat_03'] && !actions['defeat_02']) {
      actions['defeat_02'] = actions['defeat_03'];
      clips.set('defeat_02', clips.get('defeat_03'));
      actions['defeat_02'].clampWhenFinished = true;
    } else if (actions['defeat_02'] && !actions['defeat_03']) {
      actions['defeat_03'] = actions['defeat_02'];
      clips.set('defeat_03', clips.get('defeat_02'));
      actions['defeat_03'].clampWhenFinished = true;
    }

    // Ensure idle action exists
    if (!actions['idle']) {
      const baseClip = clips.get('walk') || clips.get('box_01') || gltf.animations[0];
      const idleClip = createIdleClip(baseClip, T);
      if (idleClip) {
        clips.set('idle', idleClip);
        const idleAction = mixer.clipAction(idleClip);
        idleAction.setLoop(T.LoopRepeat, Infinity);
        idleAction.clampWhenFinished = false;
        actions['idle'] = idleAction;
      }
    }

    // Handle one-shot animation completion
    mixer.addEventListener('finished', function(e) {
      if (e.action === actions['defeat_02'] || e.action === actions['defeat_03']) {
        return; // stay clamped on defeat
      }
      if (activeOneShot && actions[activeOneShot] === e.action) {
        activeOneShot = null;
      }
    });

    // Start with idle
    if (actions['idle']) {
      transitionTo('idle', 0.1, false);
    }
  }

  // Animation state evaluation based on current player state
  function determinePlayerState(p, inputState) {
    if (!p) return 'idle';
    const dead = !!(p.dead || isDead || (typeof state !== 'undefined' && state === 'dead') || (p.hp != null && p.hp <= 0));
    if (dead) return 'defeat';

    // Damage reaction
    const curHp = p.hp != null ? p.hp : 100;
    if (curHp < lastHp - 1) {
      lastHp = curHp;
      return 'hit';
    }
    lastHp = curHp;

    // Firing / Melee check
    const keysDown = inputState?.keys || (typeof keys !== 'undefined' ? keys : {});
    const mouseDown = inputState?.mouseDown != null ? inputState.mouseDown : (typeof mouse !== 'undefined' ? mouse.down : false);
    const touchShoot = inputState?.touchShoot != null ? inputState.touchShoot : (typeof touch !== 'undefined' ? touch.shoot : false);
    const currentWeapon = inputState?.curW || (typeof curW !== 'undefined' ? curW : 'm240');
    const isFiring = !!(mouseDown || keysDown['f'] || keysDown['j'] || touchShoot || (p.flash && p.flash > 0));

    if (isFiring) {
      if (currentWeapon === 'bat') return 'melee';
      return 'shoot';
    }

    // Movement check
    const vx = p.vx || 0, vy = p.vy || 0;
    const speed = Math.hypot(vx, vy);
    const hasMoveKey = !!(keysDown['w'] || keysDown['s'] || keysDown['a'] || keysDown['d'] ||
                          keysDown['arrowup'] || keysDown['arrowdown'] ||
                          keysDown['arrowleft'] || keysDown['arrowright']);
    const isMoving = speed > 0.25 || hasMoveKey;

    if (isMoving) {
      const isShift = !!(keysDown['shift'] || keysDown['Shift']);
      if (isShift || speed > 3.8) return 'sprint';
      return 'walk';
    }

    return 'idle';
  }

  // Update animation state machine
  function updateAnimationStateMachine(p, inputState) {
    if (!mixer) return;
    const st = determinePlayerState(p, inputState);

    // Death has highest priority and stays clamped
    if (st === 'defeat') {
      isDead = true;
      if (currentActionName !== 'defeat_02' && currentActionName !== 'defeat_03') {
        transitionTo('defeat_02', 0.2, true);
      }
      return;
    }
    isDead = false;

    // Damage reaction
    if (st === 'hit') {
      const hitClip = (Math.random() < 0.5 && actions['hit_to_body_01']) ? 'hit_to_body_01' : 'hit_to_stomach';
      transitionTo(hitClip, 0.15, true);
      return;
    }

    // Shooting / Melee action
    if (st === 'shoot') {
      if (activeOneShot !== 'shoot' && activeOneShot !== 'fire') {
        transitionTo('shoot', 0.15, true);
      }
      return;
    }

    if (st === 'melee') {
      if (activeOneShot !== 'box_01' && activeOneShot !== 'box_02') {
        lastMeleeIndex = 1 - lastMeleeIndex;
        const meleeClip = lastMeleeIndex === 0 ? 'box_01' : 'box_02';
        transitionTo(actions[meleeClip] ? meleeClip : 'box_01', 0.15, true);
      }
      return;
    }

    // If a one-shot (e.g. shoot or hit) is currently playing, let it finish unless interrupted
    if (activeOneShot && actions[activeOneShot] && actions[activeOneShot].isRunning()) {
      return;
    }

    // Locomotion
    if (st === 'sprint') {
      transitionTo('run', 0.2, false);
    } else if (st === 'walk') {
      transitionTo('walk', 0.2, false);
    } else {
      transitionTo('idle', 0.25, false);
    }
  }

  // GTA 5-style Over-The-Shoulder Chase Camera
  function applyOverTheShoulderCamera(p, v) {
    if (typeof camera === 'undefined' || !camera) return;
    const yaw = v ? v.yaw : (typeof view !== 'undefined' ? view.yaw : 0);
    const pitch = v ? (v.pitch || 0) : (typeof view !== 'undefined' ? (view.pitch || 0) : 0);

    const groundY = typeof terrainHeight === 'function' ? terrainHeight(p.x, p.y) : (p.z || 0);
    const heightAbove = 16.5; // Shoulder/head eye level
    const shoulderRight = 5.2; // Over-the-shoulder right offset

    const cosYaw = Math.cos(yaw);
    const sinYaw = Math.sin(yaw);
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);

    // Right vector (perpendicular to yaw on the XZ plane)
    const rightX = Math.cos(yaw + Math.PI / 2);
    const rightZ = Math.sin(yaw + Math.PI / 2);

    // Obstacle avoidance: cast back from player to find clear chase distance
    let targetDistance = 30;
    for (let d = 8; d <= 32; d += 4) {
      const probeX = p.x - cosYaw * d + rightX * (shoulderRight * 0.5);
      const probeZ = p.y - sinYaw * d + rightZ * (shoulderRight * 0.5);
      if (typeof blockedCircle === 'function' && blockedCircle(probeX, probeZ, 2.5)) {
        targetDistance = Math.max(8, d - 4);
        break;
      }
    }

    // Camera world position
    const camX = p.x - cosYaw * (targetDistance * cosPitch) + rightX * shoulderRight;
    const camZ = p.y - sinYaw * (targetDistance * cosPitch) + rightZ * shoulderRight;
    const camY = groundY + heightAbove - sinPitch * targetDistance;

    // Look-at point: forward focus point down crosshair with slight shoulder compensation
    const focusDist = 80;
    const focusX = p.x + cosYaw * focusDist + rightX * (shoulderRight * 0.25);
    const focusZ = p.y + sinYaw * focusDist + rightZ * (shoulderRight * 0.25);
    const focusY = groundY + heightAbove + sinPitch * focusDist;

    camera.position.set(camX, camY, camZ);
    camera.lookAt(focusX, focusY, focusZ);
  }

  // Toggle view between 1st-person and 3rd-person
  function toggleView() {
    if (typeof view === 'undefined') return false;
    view.chase = !view.chase;
    if (characterMesh) {
      characterMesh.visible = !!view.chase;
    }
    if (typeof toast === 'function') {
      toast(view.chase ? 'THIRD PERSON · C TO RETURN' : 'FIRST PERSON · C FOR 3PV');
    }
    return view.chase;
  }

  // Main per-frame update for character mesh and mixer
  function updateCharacter(dt) {
    if (mixer) mixer.update(dt);
    if (!characterMesh || typeof player === 'undefined' || !player) return;

    const p = player;
    const inCar = !!p.car;
    const isPlay = (typeof state === 'undefined' || state === 'play');
    const is3PV = (typeof view !== 'undefined' && view.chase);

    // Hide 3PV character mesh in 1PV or while inside car so it doesn't block camera
    characterMesh.visible = isPlay && !inCar && is3PV;

    // Suppress legacy procedural avatar and 1st-person gun in 3PV
    if (typeof localAvatar !== 'undefined' && localAvatar) localAvatar.visible = false;
    if (is3PV && typeof gun !== 'undefined' && gun) gun.visible = false;
    if (is3PV && typeof dash !== 'undefined' && dash) dash.visible = false;

    if (!characterMesh.visible) return;

    // Position mesh on ground
    const groundY = typeof terrainHeight === 'function' ? terrainHeight(p.x, p.y) : (p.z || 0);
    characterMesh.position.set(p.x, groundY, p.y);

    // Calculate heading rotation
    const vx = p.vx || 0, vy = p.vy || 0;
    const speed = Math.hypot(vx, vy);
    const keysDown = typeof keys !== 'undefined' ? keys : {};
    const mouseDown = typeof mouse !== 'undefined' ? mouse.down : false;
    const touchShoot = typeof touch !== 'undefined' ? touch.shoot : false;
    const isFiring = !!(mouseDown || keysDown['f'] || keysDown['j'] || touchShoot || (p.flash && p.flash > 0));

    if (isFiring || speed < 0.2) {
      // Facing aim direction (view.yaw)
      const yaw = typeof view !== 'undefined' ? view.yaw : 0;
      targetRotationY = Math.atan2(Math.cos(yaw), Math.sin(yaw));
    } else {
      // Rotate mesh smoothly toward movement heading
      targetRotationY = Math.atan2(vx, vy);
    }
    characterMesh.rotation.y = lerpAngle(characterMesh.rotation.y, targetRotationY, 0.18);

    // Update animation state machine
    updateAnimationStateMachine(p, { keys: keysDown, mouseDown, touchShoot, curW: typeof curW !== 'undefined' ? curW : 'm240' });
  }

  // Load the character model
  function initCharacter() {
    if (typeof BayouAssets === 'undefined' && (typeof THREE === 'undefined' || !THREE.GLTFLoader)) {
      console.warn('Ronniebaby Character: GLTFLoader not yet ready.');
      return;
    }
    const LoaderClass = (typeof BayouAssets !== 'undefined' && BayouAssets.GLTFLoader) ? BayouAssets.GLTFLoader : THREE.GLTFLoader;
    const loader = new LoaderClass();

    const candidatePaths = [
      'models/Ronniebaby_character.glb',
      '/models/Ronniebaby_character.glb',
      'public/game/models/Ronniebaby_character.glb'
    ];

    function tryLoad(pathIndex) {
      if (pathIndex >= candidatePaths.length) {
        console.error('Failed to load Ronniebaby_character.glb from any candidate path.');
        return;
      }
      const path = candidatePaths[pathIndex];
      loader.load(
        path,
        function(gltf) {
          characterMesh = gltf.scene;
          characterMesh.name = 'Ronniebaby_3PV_Character';
          // Scale to ~16.15 units tall to match EYE = 16
          characterMesh.scale.setScalar(16.5);
          characterMesh.traverse(function(node) {
            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;
              if (node.material) {
                node.material.roughness = Math.min(node.material.roughness, 0.65);
              }
            }
          });

          // Initially visible only if already in 3PV
          characterMesh.visible = (typeof view !== 'undefined' && !!view.chase);

          if (typeof scene !== 'undefined' && scene) {
            scene.add(characterMesh);
          }

          setupCharacterAnimations(gltf, THREE);
          console.log('Ronniebaby playable 3PV character integrated successfully.');
        },
        undefined,
        function() {
          tryLoad(pathIndex + 1);
        }
      );
    }

    tryLoad(0);
  }

  // Hook into game engine camera and render loops if running in browser
  if (typeof window !== 'undefined') {
    // Key listener for 'C' view toggle
    window.addEventListener('keydown', function(e) {
      if (e.key.toLowerCase() === 'c' && !e.repeat && typeof state !== 'undefined' && state === 'play') {
        if (typeof player !== 'undefined' && player && !player.car) {
          toggleView();
        }
      }
    }, true);

    // Hook placeCamera for over-the-shoulder chase camera
    if (typeof placeCamera === 'function') {
      const basePlaceCamera = placeCamera;
      placeCamera = function() {
        const y = basePlaceCamera.apply(this, arguments);
        if (typeof state !== 'undefined' && state === 'play' && typeof player !== 'undefined' && player && !player.car && typeof view !== 'undefined' && view.chase) {
          applyOverTheShoulderCamera(player, view);
        }
        return y;
      };
    }

    // Hook render for per-frame animation and mesh update
    if (typeof render === 'function') {
      const baseRender = render;
      render = function() {
        baseRender.apply(this, arguments);
        const now = performance.now();
        const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.1) : 0.016;
        lastTime = now;
        updateCharacter(dt);
      };
    }

    // Kick off initialization on DOM load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initCharacter);
    } else {
      setTimeout(initCharacter, 0);
    }
  }

  // Public API export
  const api = {
    ALL_CLIP_NAMES,
    ONE_SHOT_CLIPS,
    stripRootMotionXZ,
    createIdleClip,
    lerpAngle,
    transitionTo,
    setupCharacterAnimations,
    determinePlayerState,
    updateAnimationStateMachine,
    applyOverTheShoulderCamera,
    toggleView,
    updateCharacter,
    initCharacter,
    get characterMesh() { return characterMesh; },
    get mixer() { return mixer; },
    get actions() { return actions; },
    get clips() { return clips; },
    get currentActionName() { return currentActionName; }
  };

  if (typeof window !== 'undefined') {
    window.level29Character = api;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
