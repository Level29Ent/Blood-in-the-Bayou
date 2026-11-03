// Level 29 graphics upgrade: color-managed tone mapping, sun shadows,
// gradient sky dome with sun glow and stars, and a cinematic vignette.
// Loaded last; wraps initGL/render the same way the other expansion files do.
(function(){
<<<<<<< HEAD
  // Performance-first policy on every device; ignore previously saved expensive settings.
  const quality = 'low';
=======
  const QUALITY_KEY = 'l29_gfx_quality';
  const LEVELS = ['high', 'medium', 'low'];
  const touch = matchMedia('(pointer: coarse)').matches;
  let quality = localStorage.getItem(QUALITY_KEY);
  if (!LEVELS.includes(quality)) quality = touch ? 'medium' : 'high';
>>>>>>> main

  const SHADOW = {
    high:   { size: 2048, extent: 260, every: 1 },
    medium: { size: 1024, extent: 200, every: 2 },
    low:    null,
  };

  const sunDir = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const seenMats = new WeakSet();
<<<<<<< HEAD
  let sky = null, ready = false, frameN = 0, vignette = null, scannedCity=null;
=======
  let sky = null, ready = false, frameN = 0, vignette = null;
>>>>>>> main

  function fixTexture(t){
    if (t && t.encoding !== THREE.sRGBEncoding){ t.encoding = THREE.sRGBEncoding; t.needsUpdate = true; return true; }
    return false;
  }
  function fixMaterial(m){
    if (!m || seenMats.has(m)) return;
    seenMats.add(m);
    let changed = fixTexture(m.map);
    if (fixTexture(m.emissiveMap)) changed = true;
    // Canvas-drawn signage reads as self-lit; tone mapping at low exposure made it murky.
    if (m.isMeshBasicMaterial && m.map && m.map.isCanvasTexture && !m.transparent && m.toneMapped){ m.toneMapped = false; changed = true; }
    if (changed) m.needsUpdate = true;
  }

  function prepareObject(o){
    if (o.userData.__gfx) return;
    o.userData.__gfx = true;
    if (!o.isMesh) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach(fixMaterial);
    const lit = mats.some(m => m && !m.isMeshBasicMaterial && !m.isShaderMaterial);
    const solid = mats.every(m => m && !m.transparent);
    o.receiveShadow = lit;
    o.castShadow = lit && solid;
  }

  function scanScenes(){
    scene.traverse(prepareObject);
    if (vmScene) vmScene.traverse(o => { if (o.isMesh){ const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(fixMaterial); } });
  }

  function makeSky(){
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        horizon: { value: new THREE.Color() },
        zenith:  { value: new THREE.Color() },
        sunColor:{ value: new THREE.Color() },
        sunDir:  { value: new THREE.Vector3(0, 1, 0) },
        night:   { value: 0 },
        sunSize: { value: 1 },
      },
      vertexShader: `
        varying vec3 vDir;
        void main(){
          vDir = normalize(position);
          vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_Position = p.xyww;
        }`,
      fragmentShader: `
        uniform vec3 horizon; uniform vec3 zenith; uniform vec3 sunColor; uniform vec3 sunDir;
        uniform float night; uniform float sunSize;
        varying vec3 vDir;
        float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
        void main(){
          vec3 d = normalize(vDir);
          float h = clamp(d.y, 0.0, 1.0);
          vec3 col = mix(horizon, zenith, pow(smoothstep(0.0, 0.85, h), 0.7));
          float s = max(dot(d, normalize(sunDir)), 0.0);
          col += sunColor * (pow(s, 6.0) * 0.18 + pow(s, 64.0) * 0.35) * sunSize;
          col += sunColor * smoothstep(0.9993, 0.9997, s) * 2.5 * sunSize;
          if (night > 0.0){
            vec3 cell = floor(d * 380.0);
            float star = step(0.9975, hash(cell)) * smoothstep(0.05, 0.35, h);
            col += vec3(0.9, 0.95, 1.0) * star * night * (0.6 + 0.4 * hash(cell + 7.0));
          }
          col = mix(horizon, col, smoothstep(-0.02, 0.08, d.y));
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <encodings_fragment>
        }`,
      side: THREE.BackSide, depthWrite: false, depthTest: true, fog: false,
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = -1000;
    mesh.userData.__gfx = true;
    mesh.onBeforeRender = (r, s, cam) => { mesh.position.copy(cam.position); mesh.scale.setScalar(cam.far * 0.95); mesh.updateMatrixWorld(); };
    return mesh;
  }

<<<<<<< HEAD
=======
  const EXPOSURE = { day: 0.74, dusk: 1.0, night: 1.15 };
>>>>>>> main
  const DAY_ZENITH = new THREE.Color('#3f74b8'), DUSK_ZENITH = new THREE.Color('#4a3d6e'), NIGHT_ZENITH = new THREE.Color('#03060f');
  function updateSky(){
    if (!sky) return;
    const u = sky.material.uniforms;
    const mode = lightMode || 'day';
    u.horizon.value.copy(scene.fog ? scene.fog.color : scene.background);
    const z = mode === 'night' ? NIGHT_ZENITH : mode === 'dusk' ? DUSK_ZENITH : DAY_ZENITH;
    u.zenith.value.copy(u.horizon.value).lerp(z, mode === 'night' ? 0.85 : 0.65);
    u.sunColor.value.copy(sun.color);
    u.sunDir.value.copy(sunDir);
    u.night.value = mode === 'night' ? 1 : 0;
    u.sunSize.value = mode === 'night' ? 0.25 : 1;
<<<<<<< HEAD
    renderer.toneMappingExposure = 1;
=======
    const target = EXPOSURE[mode] || EXPOSURE.day;
    renderer.toneMappingExposure += (target - renderer.toneMappingExposure) * 0.05;
>>>>>>> main
  }

  function applyQuality(){
    const cfg = SHADOW[quality];
    renderer.shadowMap.enabled = !!cfg;
    sun.castShadow = !!cfg;
    if (cfg){
      const sh = sun.shadow;
      if (sh.mapSize.x !== cfg.size){
        sh.mapSize.set(cfg.size, cfg.size);
        if (sh.map){ sh.map.dispose(); sh.map = null; }
      }
      const c = sh.camera;
      c.left = -cfg.extent; c.right = cfg.extent; c.top = cfg.extent; c.bottom = -cfg.extent;
      c.near = 10; c.far = 2000; c.updateProjectionMatrix();
      sh.bias = -0.0004; sh.normalBias = 0.6; sh.radius = 2;
    }
    scene.traverse(o => { if (o.material) { const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(m => m.needsUpdate = true); } });
    if (vignette) vignette.style.opacity = quality === 'low' ? '0.6' : '1';
  }

  function updateShadowCamera(){
    const cfg = SHADOW[quality];
    if (!cfg) return;
    renderer.shadowMap.autoUpdate = false;
    if (frameN % cfg.every === 0) renderer.shadowMap.needsUpdate = true;
    const focus = camera.position;
    const texel = (cfg.extent * 2) / cfg.size;
    tmp.set(Math.round(focus.x / texel) * texel, focus.y, Math.round(focus.z / texel) * texel);
    sun.target.position.copy(tmp);
    sun.position.copy(tmp).addScaledVector(sunDir, 900);
    sun.target.updateMatrixWorld();
  }

  function addVignette(){
    const gl = document.getElementById('gl');
    vignette = document.createElement('div');
    vignette.setAttribute('aria-hidden', 'true');
    vignette.style.cssText = 'position:absolute;inset:0;z-index:1;pointer-events:none;' +
      'background:radial-gradient(ellipse at 50% 45%,rgba(0,0,0,0) 55%,rgba(10,6,14,.38) 100%);';
    gl.after(vignette);
  }

  function setup(){
    if (ready || !renderer) return;
    ready = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
<<<<<<< HEAD
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.toneMappingExposure = 1;
=======
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
>>>>>>> main
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    sunDir.copy(sun.position).normalize();
    scene.add(sun.target);
    hemi.groundColor.set('#5a4a38');
    sky = makeSky();
    scene.add(sky);
    addVignette();
    applyQuality();
    scanScenes();
  }

  const baseInit = initGL;
  initGL = function(){ baseInit.apply(this, arguments); setup(); };

  const baseRender = render;
  render = function(){
    if (renderer && !ready) setup();
    if (ready){
      frameN++;
<<<<<<< HEAD
      if(scannedCity!==city){scanScenes();scannedCity=city;}
=======
      if (frameN % 30 === 1) scanScenes();
>>>>>>> main
      updateSky();
      updateShadowCamera();
    }
    baseRender.apply(this, arguments);
  };

<<<<<<< HEAD
  window.level29Graphics={get quality(){return quality;},setQuality(){ /* Fixed performance policy. */ }};
=======
  function toast(text){
    let el = document.getElementById('gfx-toast');
    if (!el){
      el = document.createElement('div'); el.id = 'gfx-toast'; el.setAttribute('role', 'status');
      el.style.cssText = 'position:absolute;left:50%;top:18px;transform:translateX(-50%);z-index:20;padding:8px 14px;' +
        'background:rgba(8,9,11,.82);border:1px solid rgba(246,243,230,.25);color:#f6f3e6;font:600 14px "IBM Plex Mono",monospace;' +
        'letter-spacing:.08em;pointer-events:none;transition:opacity .3s';
      document.body.appendChild(el);
    }
    el.textContent = text; el.style.opacity = '1';
    clearTimeout(el._t); el._t = setTimeout(() => { el.style.opacity = '0'; }, 1400);
  }

  addEventListener('keydown', e => {
    if (e.code !== 'KeyG' || e.repeat || e.target.closest('input,textarea')) return;
    quality = LEVELS[(LEVELS.indexOf(quality) + 1) % LEVELS.length];
    localStorage.setItem(QUALITY_KEY, quality);
    if (ready) applyQuality();
    toast('GRAPHICS: ' + quality.toUpperCase());
  });
>>>>>>> main
})();
