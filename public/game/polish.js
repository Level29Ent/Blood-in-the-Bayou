'use strict';
// Level 29 polish pass: camera feel, combat feedback, kill streaks and atmosphere.
// Loaded last; wraps placeCamera / hurtPlayer / killZombie / render like the other modules.
(() => {
  const BASE_FOV = 74;
  const quality = () => localStorage.getItem('l29_gfx_quality') || (matchMedia('(pointer: coarse)').matches ? 'medium' : 'high');
  const now = () => performance.now();

  // ---------- Camera feel: sprint/speed FOV and strafe lean ----------
  let fov = BASE_FOV, roll = 0, wasPlaying = false;
  const basePlace = placeCamera;
  placeCamera = function(){
    const yaw = basePlace.apply(this, arguments);
    const p = player;
    if (state !== 'play' || !p || p.dead){
      if (wasPlaying){ wasPlaying = false; fov = BASE_FOV; roll = 0; camera.fov = BASE_FOV; camera.updateProjectionMatrix(); }
      return yaw;
    }
    wasPlaying = true;
    let targetFov = BASE_FOV, targetRoll = 0;
    if (p.car){
      const top = (p.car.spec && p.car.spec.max) || 6;
      targetFov += Math.min(1, Math.abs(p.car.v || 0) / top) * 12;
    } else {
      const speed = Math.hypot(p.vx, p.vy);
      if (speed > .4 && keys['shift']) targetFov += 8;
      const side = -Math.sin(view.yaw) * p.vx + Math.cos(view.yaw) * p.vy;
      targetRoll = Math.max(-1, Math.min(1, side / 4)) * -.028;
    }
    fov += (targetFov - fov) * .08;
    roll += (targetRoll - roll) * .12;
    if (Math.abs(camera.fov - fov) > .01){ camera.fov = fov; camera.updateProjectionMatrix(); }
    if (Math.abs(roll) > .0005) camera.rotateZ(roll);
    return yaw;
  };

  // ---------- Damage direction ----------
  const hits = [];
  const baseHurt = hurtPlayer;
  hurtPlayer = function(n, sx, sy){
    const p = player, hpBefore = p ? p.hp + (p.armor || 0) : 0;
    baseHurt.apply(this, arguments);
    if (!p || p.hp + (p.armor || 0) >= hpBefore) return;
    let angle = null;
    if (typeof sx === 'number' && typeof sy === 'number' && (sx !== p.x || sy !== p.y)){
      const aim = p.car ? p.car.a + view.look : view.yaw;
      angle = Math.atan2(sy - p.y, sx - p.x) - aim;
    }
    hits.push({ angle, t: now() });
    if (hits.length > 6) hits.shift();
    if (navigator.vibrate) try { navigator.vibrate(30); } catch (_) {}
  };

  // ---------- Kill streaks ----------
  const STREAK_WINDOW = 3200;
  const streak = { n: 0, last: 0, shownAt: 0, bonus: 0, best: 0 };
  const baseKill = killZombie;
  killZombie = function(z, vx, vy){
    const was = z && z.alive;
    baseKill.apply(this, arguments);
    if (!was || z.alive || state !== 'play' || !player || player.dead) return;
    const t = now();
    streak.n = t - streak.last < STREAK_WINDOW ? streak.n + 1 : 1;
    streak.last = t;
    if (streak.n >= 3){
      const bonus = Math.min(250, streak.n * 5);
      cash += bonus; streak.bonus = bonus; streak.shownAt = t;
      if (streak.n > streak.best) streak.best = streak.n;
      if (streak.n % 5 === 0) try { sfx('cash'); } catch (_) {}
    }
  };
  const STREAK_NAMES = [[25, 'BAYOU BUTCHER'], [15, 'RAMPAGE'], [10, 'MASSACRE'], [5, 'KILLING SPREE'], [3, 'TRIPLE']];
  const streakName = n => (STREAK_NAMES.find(([min]) => n >= min) || [0, ''])[1];

  // ---------- Atmosphere: drifting dust by day, fireflies at night ----------
  let motes = null;
  const MOTES = 260, R = 260;
  function makeMotes(){
    const g = new THREE.BufferGeometry(), pos = new Float32Array(MOTES * 3), seed = new Float32Array(MOTES);
    for (let i = 0; i < MOTES; i++){ pos[i*3] = (Math.random() - .5) * R * 2; pos[i*3+1] = 4 + Math.random() * 60; pos[i*3+2] = (Math.random() - .5) * R * 2; seed[i] = Math.random() * 100; }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({ size: 1.6, color: 0xfff2c8, transparent: true, opacity: .35, depthWrite: false, blending: THREE.AdditiveBlending, fog: true });
    const pts = new THREE.Points(g, m);
    pts.frustumCulled = false; pts.userData.__gfx = true; pts.userData.seed = seed;
    scene.add(pts);
    return pts;
  }
  function updateMotes(){
    if (!scene) return;
    if (!motes) motes = makeMotes();
    const show = state !== 'menu' && quality() !== 'low';
    motes.visible = show;
    if (!show) return;
    const night = lightMode === 'night', dusk = lightMode === 'dusk';
    const m = motes.material;
    m.color.setHex(night ? 0xc8ff6a : dusk ? 0xffc890 : 0xfff2c8);
    m.size = night ? 2.4 : 1.4;
    const t = now() * .001, cp = camera.position, arr = motes.geometry.attributes.position.array, seed = motes.userData.seed;
    m.opacity = night ? .55 + Math.sin(t * 2.3) * .2 : .28;
    for (let i = 0; i < MOTES; i++){
      const o = i * 3, s = seed[i];
      arr[o] += Math.sin(t * .6 + s) * .08 + .03;
      arr[o+1] += Math.cos(t * .8 + s) * .05;
      arr[o+2] += Math.cos(t * .5 + s * 1.3) * .08;
      let dx = arr[o] - cp.x, dz = arr[o+2] - cp.z;
      if (dx > R) arr[o] -= R * 2; else if (dx < -R) arr[o] += R * 2;
      if (dz > R) arr[o+2] -= R * 2; else if (dz < -R) arr[o+2] += R * 2;
      if (arr[o+1] < 3) arr[o+1] = 60; else if (arr[o+1] > 64) arr[o+1] = 4;
    }
    motes.geometry.attributes.position.needsUpdate = true;
  }

  // ---------- Sharper textures at grazing angles ----------
  const sharpened = new WeakSet();
  function sharpen(){
    if (!renderer) return;
    const max = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    scene.traverse(o => {
      if (!o.isMesh || !o.material) return;
      const ms = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of ms){
        const t = m && m.map;
        if (t && !sharpened.has(t)){ sharpened.add(t); if (t.anisotropy < max){ t.anisotropy = max; t.needsUpdate = true; } }
      }
    });
  }

  // ---------- HUD overlays ----------
  function drawOverlays(){
    if (state === 'menu' || !player) return;
    const t = now(), p = player, w = SW, h = SH, ccx = w / 2, ccy = h / 2;
    cx.save();

    const hpFrac = Math.max(0, p.hp / (p.maxHp || 100));
    if (!p.dead && hpFrac < .35){
      const pulse = (.35 - hpFrac) / .35 * (.55 + Math.sin(t * .008) * .25);
      const g = cx.createRadialGradient(ccx, ccy, Math.min(w, h) * .3, ccx, ccy, Math.max(w, h) * .75);
      g.addColorStop(0, 'rgba(120,0,0,0)'); g.addColorStop(1, `rgba(150,0,10,${pulse.toFixed(3)})`);
      cx.fillStyle = g; cx.fillRect(0, 0, w, h);
    }

    const rad = Math.min(w, h) * .17;
    for (let i = hits.length - 1; i >= 0; i--){
      const age = (t - hits[i].t) / 900;
      if (age >= 1){ hits.splice(i, 1); continue; }
      const a = 1 - age;
      if (hits[i].angle === null){
        cx.strokeStyle = `rgba(220,20,30,${(a * .5).toFixed(3)})`; cx.lineWidth = 6;
        cx.beginPath(); cx.arc(ccx, ccy, rad, 0, Math.PI * 2); cx.stroke();
        continue;
      }
      const screenA = hits[i].angle - Math.PI / 2;
      cx.strokeStyle = `rgba(230,25,35,${(a * .9).toFixed(3)})`; cx.lineWidth = 8; cx.lineCap = 'round';
      cx.beginPath(); cx.arc(ccx, ccy, rad, screenA - .32, screenA + .32); cx.stroke();
    }

    if (view.hit > 0 && !p.car){
      const s = 6 + view.hit, gap = 5;
      cx.strokeStyle = `rgba(255,255,255,${Math.min(1, view.hit / 5).toFixed(3)})`; cx.lineWidth = 2.5; cx.lineCap = 'round';
      cx.beginPath();
      for (const [dx, dy] of [[1,1],[-1,1],[1,-1],[-1,-1]]){ cx.moveTo(ccx + dx * gap, ccy + dy * gap); cx.lineTo(ccx + dx * (gap + s), ccy + dy * (gap + s)); }
      cx.stroke();
    }

    if (t - streak.last > STREAK_WINDOW) streak.n = 0;
    if (streak.n >= 3){
      const age = t - streak.shownAt, pop = age < 180 ? 1 + (1 - age / 180) * .35 : 1;
      const fade = Math.min(1, (STREAK_WINDOW - (t - streak.last)) / 600);
      cx.globalAlpha = Math.max(0, fade);
      cx.translate(ccx, h * .22); cx.scale(pop, pop);
      cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.font = "900 34px 'Barlow Condensed', Impact, sans-serif";
      cx.lineWidth = 5; cx.strokeStyle = 'rgba(10,4,16,.85)';
      const title = `${streakName(streak.n)} x${streak.n}`;
      cx.strokeText(title, 0, 0); cx.fillStyle = '#f4c355'; cx.fillText(title, 0, 0);
      cx.font = '700 16px "IBM Plex Mono", monospace';
      const sub = `+$${streak.bonus} STREAK BONUS`;
      cx.strokeText(sub, 0, 26); cx.fillStyle = '#7ee08a'; cx.fillText(sub, 0, 26);
      const bar = Math.max(0, Math.min(1, 1 - (t - streak.last) / STREAK_WINDOW));
      cx.fillStyle = 'rgba(10,4,16,.6)'; cx.fillRect(-70, 42, 140, 4);
      cx.fillStyle = '#8e44c9'; cx.fillRect(-70, 42, 140 * bar, 4);
    }
    cx.restore();
  }

  // ---------- Render hook ----------
  let frameN = 0;
  const glEl = () => document.getElementById('gl');
  const baseRender = render;
  render = function(){
    frameN++;
    try { updateMotes(); } catch (_) {}
    if (frameN % 90 === 5) try { sharpen(); } catch (_) {}
    baseRender.apply(this, arguments);
    const gl = glEl();
    if (gl && state !== 'dead' && state !== 'menu'){
      const hpFrac = player ? Math.max(0, player.hp / (player.maxHp || 100)) : 1;
      const grade = quality() === 'high' ? 'saturate(1.12) contrast(1.05)' : '';
      const hurt = hpFrac < .35 ? ` saturate(${(.6 + hpFrac).toFixed(2)})` : '';
      const f = (grade + hurt).trim();
      if (gl.style.filter !== f) gl.style.filter = f;
    }
    try { drawOverlays(); } catch (_) {}
  };

  window.level29Polish = { streak, get fov(){ return fov; } };
})();
