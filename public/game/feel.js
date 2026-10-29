'use strict';
// Level 29 feel pass: heavier weapon kick + layered gunfire, bayou weather, daily challenges.
// Loaded after polish.js; wraps snd / placeCamera / killZombie / render.
(() => {
  const now = () => performance.now();
  const rand = (a, b) => a + Math.random() * (b - a);
  const lowGfx = () => (localStorage.getItem('l29_gfx_quality') || '') === 'low';
  const touch = matchMedia('(pointer: coarse)').matches;

  // ================= WEAPON KICK =================
  const kick = { pitch: 0, yaw: 0, light: 0, lastBuzz: 0 };
  let muzzle = null;
  const aimDir = new THREE.Vector3();
  function onShot(){
    const p = player;
    if (!p || p.dead || p.car || state !== 'play') return;
    kick.pitch = Math.min(.11, kick.pitch + rand(.018, .028));
    kick.yaw += rand(-.009, .009);
    kick.light = 1;
    if (typeof shake === 'number') shake = Math.max(shake, 2.2);
    const t = now();
    if (touch && navigator.vibrate && t - kick.lastBuzz > 70){ kick.lastBuzz = t; try { navigator.vibrate(14); } catch (_) {} }
  }

  const baseSnd = snd;
  snd = function(type){
    baseSnd.apply(this, arguments);
    if (type !== 'shot') return;
    onShot();
    if (!actx || soundMode === 2) return;
    try {
      const t = actx.currentTime, B = sfxBus;
      voice(B, t, rand(58, 66), .2, { wave: 'sine', to: 30, vol: .42 });
      noiseV(B, t, .035, .14, { type: 'highpass', f: 5200, fTo: 2600 });
      noiseV(B, t + .025, .6, .065, { f: 950, fTo: 110, attack: .03 });
      if (Math.random() < .35) voice(B, t + .05, rand(1900, 2300), .03, { wave: 'square', vol: .02, hp: 1500 });
    } catch (_) {}
  };

  // ================= WEATHER =================
  const KINDS = {
    clear: { fog: 1, rain: 0, dim: 0, mist: 0, msg: 'SKIES CLEARING OVER THE BAYOU' },
    fog:   { fog: .32, rain: 0, dim: .12, mist: .55, msg: 'FOG ROLLING OFF THE BAYOU' },
    rain:  { fog: .62, rain: .65, dim: .28, mist: .3, msg: 'RAIN MOVING IN' },
    storm: { fog: .45, rain: 1, dim: .42, mist: .4, msg: 'STORM OVER THE GULF · STAY LOW' },
  };
  const wx = { kind: 'clear', next: now() + rand(60000, 110000), fog: 1, rain: 0, dim: 0, mist: 0, flash: 0, nextBolt: 0, covered: false };
  const daily = { pendingWeather: false };

  function pickWeather(){
    const night = lightMode === 'night' || lightMode === 'dusk';
    const w = daily.pendingWeather
      ? { clear: .15, fog: .35, rain: .3, storm: .2 }
      : { clear: .4, fog: night ? .3 : .2, rain: .22, storm: .14 };
    let r = Math.random() * Object.values(w).reduce((a, b) => a + b, 0);
    for (const k in w){ r -= w[k]; if (r <= 0) return k; }
    return 'clear';
  }
  function setWeather(kind, quiet){
    if (!KINDS[kind] || kind === wx.kind) return;
    wx.kind = kind;
    wx.next = now() + rand(150000, 280000);
    wx.nextBolt = now() + rand(4000, 9000);
    if (!quiet && state === 'play') try { toast('WEATHER · ' + KINDS[kind].msg); } catch (_) {}
  }

  let rainMesh = null, rainVel = null;
  const RAIN_BOX = 200, RAIN_H = 150;
  function makeRain(){
    const n = touch ? 700 : 1400;
    const pos = new Float32Array(n * 6);
    rainVel = new Float32Array(n);
    for (let i = 0; i < n; i++){
      const x = rand(-RAIN_BOX, RAIN_BOX), y = rand(0, RAIN_H), z = rand(-RAIN_BOX, RAIN_BOX);
      pos.set([x, y, z, x, y + 5, z], i * 6);
      rainVel[i] = rand(5.5, 8.5);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.LineBasicMaterial({ color: 0xb8c8d8, transparent: true, opacity: .4, depthWrite: false, fog: true });
    const mesh = new THREE.LineSegments(g, m);
    mesh.frustumCulled = false; mesh.userData.__gfx = true; mesh.visible = false;
    scene.add(mesh);
    return mesh;
  }

  const ray = new THREE.Raycaster(), UP = new THREE.Vector3(0, 1, 0);
  let coverCheck = 0;
  function updateCover(){
    if (++coverCheck % 30 !== 0 || typeof cityGroup === 'undefined' || !cityGroup) return;
    ray.set(camera.position, UP); ray.far = 260;
    try { wx.covered = ray.intersectObject(cityGroup, true).length > 0; } catch (_) { wx.covered = false; }
  }

  function updateRain(){
    if (!rainMesh) rainMesh = makeRain();
    const amount = wx.covered ? 0 : wx.rain;
    const show = amount > .03 && state !== 'menu' && !lowGfx();
    rainMesh.visible = show;
    if (!show) return;
    rainMesh.material.opacity = .18 + amount * .32;
    const arr = rainMesh.geometry.attributes.position.array, cp = camera.position;
    const windX = wx.kind === 'storm' ? 1.6 : .5, len = 4 + amount * 5;
    for (let i = 0, n = rainVel.length; i < n; i++){
      const o = i * 6, v = rainVel[i] * (.7 + amount * .6);
      let x = arr[o] + windX, y = arr[o + 1] - v, z = arr[o + 2];
      const dx = x - cp.x, dz = z - cp.z;
      if (y < cp.y - 40 || dx > RAIN_BOX || dx < -RAIN_BOX || dz > RAIN_BOX || dz < -RAIN_BOX){
        x = cp.x + rand(-RAIN_BOX, RAIN_BOX); z = cp.z + rand(-RAIN_BOX, RAIN_BOX); y = cp.y + rand(40, RAIN_H);
      }
      arr[o] = x; arr[o + 1] = y; arr[o + 2] = z;
      arr[o + 3] = x - windX * len * .25; arr[o + 4] = y + len; arr[o + 5] = z;
    }
    rainMesh.geometry.attributes.position.needsUpdate = true;
  }

  let rainSrc = null, rainGain = null;
  function updateRainSound(){
    if (!actx || typeof noiseBuf === 'undefined' || !noiseBuf) return;
    if (!rainSrc){
      rainSrc = actx.createBufferSource(); rainSrc.buffer = noiseBuf; rainSrc.loop = true;
      const hp = actx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 600;
      const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200;
      rainGain = actx.createGain(); rainGain.gain.value = 0;
      rainSrc.connect(hp); hp.connect(lp); lp.connect(rainGain); rainGain.connect(sfxBus); rainSrc.start();
    }
    const muted = soundMode === 2 || state === 'menu';
    const target = muted ? 0 : wx.rain * (wx.covered ? .05 : .14);
    rainGain.gain.setTargetAtTime(target, actx.currentTime, .6);
  }

  function thunder(delay){
    if (!actx || soundMode === 2) return;
    try {
      const t = actx.currentTime + delay, B = sfxBus;
      noiseV(B, t, 2.6, .34, { f: 420, fTo: 55, attack: .05 });
      voice(B, t, 48, 2, { wave: 'sine', to: 28, vol: .3 });
      noiseV(B, t + .3, 1.4, .16, { f: 260, fTo: 60, attack: .2 });
    } catch (_) {}
  }

  const fogState = { n: 0, f: 0, setN: -1, setF: -1, bg: null, bgSet: -1, hemi: null, hemiSet: -1, sun: null, sunSet: -1 };
  const grey = new THREE.Color(0x8e9aa0), tmp = new THREE.Color();
  function applyAtmosphere(){
    if (!scene || !scene.fog) return;
    const F = scene.fog;
    if (Math.abs(F.near - fogState.setN) > .5 || Math.abs(F.far - fogState.setF) > .5){ fogState.n = F.near; fogState.f = F.far; }
    F.near = fogState.n * (.25 + wx.fog * .75); F.far = fogState.f * wx.fog;
    fogState.setN = F.near; fogState.setF = F.far;

    if (scene.background && scene.background.isColor){
      if (scene.background.getHex() !== fogState.bgSet) fogState.bg = scene.background.clone();
      const night = lightMode === 'night';
      tmp.copy(fogState.bg).lerp(night ? tmp.set(0x1a2028) : grey, Math.min(.75, wx.mist * .9 + wx.rain * .35));
      if (wx.flash > .01) tmp.lerp(tmp.clone().set(0xdfe6ff), wx.flash * .6);
      scene.background.copy(tmp); F.color.copy(tmp);
      fogState.bgSet = scene.background.getHex();
    }
    const dimK = 1 - wx.dim;
    if (typeof hemi !== 'undefined' && hemi){
      if (Math.abs(hemi.intensity - fogState.hemiSet) > 1e-4) fogState.hemi = hemi.intensity;
      hemi.intensity = fogState.hemi * dimK + wx.flash * 1.6; fogState.hemiSet = hemi.intensity;
    }
    if (typeof sun !== 'undefined' && sun){
      if (Math.abs(sun.intensity - fogState.sunSet) > 1e-4) fogState.sun = sun.intensity;
      sun.intensity = fogState.sun * Math.max(.15, 1 - wx.dim * 1.3); fogState.sunSet = sun.intensity;
    }
  }

  function updateWeather(){
    const t = now();
    if (state === 'play' && t > wx.next) setWeather(pickWeather());
    const K = KINDS[wx.kind], e = .004;
    wx.fog += (K.fog - wx.fog) * e; wx.rain += (K.rain - wx.rain) * e * 1.5;
    wx.dim += (K.dim - wx.dim) * e; wx.mist += (K.mist - wx.mist) * e;
    if (wx.kind === 'storm' && state === 'play' && t > wx.nextBolt && !wx.covered){
      wx.flash = 1; wx.nextBolt = t + rand(7000, 18000); thunder(rand(.4, 1.8));
    }
    wx.flash *= .86;
  }

  // ================= DAILY CHALLENGES =================
  const KEY = 'l29_daily_challenges';
  const POOL = [
    { id: 'kills', text: n => `Kill ${n} zombies`, n: [60, 100, 150], pay: [500, 800, 1200] },
    { id: 'streak', text: n => `Hit a ${n}-kill streak`, n: [8, 12, 16], pay: [600, 900, 1300] },
    { id: 'roadkill', text: n => `Run over ${n} zombies`, n: [15, 25, 40], pay: [500, 800, 1100] },
    { id: 'drive', text: n => `Drive ${n} km`, n: [3, 5, 8], pay: [400, 650, 1000] },
    { id: 'foot', text: n => `Cover ${n} km on foot`, n: [1, 2, 3], pay: [400, 700, 1000] },
    { id: 'cash', text: n => `Earn $${n.toLocaleString()}`, n: [2000, 4000, 7000], pay: [500, 800, 1200] },
    { id: 'weather', text: n => `Kill ${n} zombies in rain or fog`, n: [20, 35, 50], pay: [700, 1000, 1400] },
  ];
  const BONUS = 1000, UNIT_M = .125;
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  function seeded(str){ let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; }; }
  function generate(date){
    const r = seeded('level29-' + date), pool = POOL.slice(), items = [];
    while (items.length < 3){
      const c = pool.splice(Math.floor(r() * pool.length), 1)[0], tier = Math.floor(r() * 3);
      items.push({ id: c.id, n: c.n[tier], pay: c.pay[tier], p: 0, done: false });
    }
    return { date, items, bonus: false };
  }
  let data, uiReady = false;
  try { data = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (_) { data = null; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (_) {} };
  function ensureToday(){ if (!data || data.date !== today()){ data = generate(today()); save(); render_(); } }
  ensureToday();
  const def = id => POOL.find(c => c.id === id);

  let dirty = false, lastCash = null, lastSave = 0;
  function progress(id, amount, absolute){
    ensureToday();
    for (const it of data.items){
      if (it.id !== id || it.done) continue;
      it.p = absolute ? Math.max(it.p, amount) : it.p + amount;
      dirty = true;
      if (it.p >= it.n){
        it.p = it.n; it.done = true;
        cash += it.pay; lastCash = cash;
        try { toast(`DAILY COMPLETE · ${def(id).text(it.n).toUpperCase()} · +$${it.pay}`); sfx('pass'); } catch (_) {}
        if (!data.bonus && data.items.every(i => i.done)){
          data.bonus = true; cash += BONUS; lastCash = cash;
          setTimeout(() => { try { toast(`ALL DAILIES DONE · +$${BONUS} BONUS`); sfx('cash'); } catch (_) {} }, 2600);
        }
        save(); render_();
      }
    }
  }
  daily.update = () => { daily.pendingWeather = !!data && data.items.some(i => i.id === 'weather' && !i.done); };

  const baseKill = killZombie;
  killZombie = function(z){
    const was = z && z.alive;
    baseKill.apply(this, arguments);
    if (!was || z.alive || !z.playerKill || state !== 'play' || !player || player.dead) return;
    progress('kills', 1);
    if (player.car) progress('roadkill', 1);
    if (wx.kind !== 'clear') progress('weather', 1);
    const s = window.level29Polish && window.level29Polish.streak;
    if (s) progress('streak', s.n, true);
  };

  let lastPos = null;
  function trackMovement(){
    const p = player;
    if (!p || p.dead || state !== 'play'){ lastPos = null; return; }
    const src = p.car || p;
    if (lastPos && lastPos.car === !!p.car){
      const d = Math.hypot(src.x - lastPos.x, src.y - lastPos.y);
      if (d > 0 && d < 40){
        const km = d * UNIT_M / 1000;
        progress(p.car ? 'drive' : 'foot', km);
      }
    }
    lastPos = { x: src.x, y: src.y, car: !!p.car };
    if (lastCash === null) lastCash = cash;
    if (cash > lastCash) progress('cash', Math.min(5000, cash - lastCash));
    lastCash = cash;
  }

  // ---- Daily UI ----
  const css = document.createElement('style');
  css.textContent = `
  #dailyBtn{position:fixed;right:18px;top:252px;z-index:25;display:none;background:#111c24e8;color:#e5bd63;border:1px solid #b2945688;padding:11px 14px;font:700 12px 'IBM Plex Mono',monospace;min-height:44px;cursor:pointer}
  #dailyBtn.done{color:#7ee08a;border-color:#7ee08a88}
  #dailyPanel{position:fixed;inset:302px 18px auto auto!important;height:auto!important;max-height:calc(100dvh - 320px);overflow-y:auto;z-index:26;display:none;width:290px;max-width:calc(100vw - 24px);background:#0d151cf2;border:1px solid #b2945688;color:#d8dde2;font:500 12px 'IBM Plex Mono',monospace;padding:14px 16px;box-shadow:0 10px 30px #0008}
  #dailyPanel h3{margin:0 0 2px;font:900 22px 'Barlow Condensed',Impact,sans-serif;letter-spacing:.04em;color:#e5bd63}
  #dailyPanel .sub{color:#8a97a3;margin-bottom:12px;font-size:11px}
  #dailyPanel .ch{margin:0 0 12px}
  #dailyPanel .row{display:flex;justify-content:space-between;gap:8px;margin-bottom:5px}
  #dailyPanel .pay{color:#7ee08a;white-space:nowrap}
  #dailyPanel .bar{height:5px;background:#ffffff14}
  #dailyPanel .bar i{display:block;height:100%;background:#8e44c9}
  #dailyPanel .ch.done .bar i{background:#7ee08a}
  #dailyPanel .ch.done .txt{color:#7ee08a;text-decoration:line-through}
  #dailyPanel .num{color:#8a97a3;font-size:11px;margin-top:4px}
  #dailyPanel .foot{border-top:1px solid #ffffff1a;padding-top:10px;display:flex;justify-content:space-between;color:#8a97a3;font-size:11px}
  #dailyPanel button{margin-top:10px;width:100%;min-height:40px;background:transparent;border:1px solid #b2945688;color:#e5bd63;font:700 12px 'IBM Plex Mono',monospace;cursor:pointer}
  @media(max-width:699px){#dailyBtn{right:12px;top:350px;padding:9px}#dailyPanel{inset:400px 12px auto auto!important;max-height:calc(100dvh - 412px)}}`;
  document.head.appendChild(css);
  const btn = document.createElement('button');
  btn.id = 'dailyBtn'; btn.type = 'button'; btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'dailyPanel');
  const panel = document.createElement('div');
  panel.id = 'dailyPanel'; panel.setAttribute('role', 'region'); panel.setAttribute('aria-label', 'Daily challenges');
  document.body.append(btn, panel);
  uiReady = true;
  const toggle = open => { panel.style.display = open ? 'block' : 'none'; btn.setAttribute('aria-expanded', String(open)); if (open) render_(); };
  btn.onclick = () => toggle(panel.style.display !== 'block');
  addEventListener('keydown', e => { if (e.key === 'Escape' && panel.style.display === 'block'){ e.preventDefault(); toggle(false); } });

  function fmt(it){
    if (it.id === 'drive' || it.id === 'foot') return `${it.p.toFixed(2)} / ${it.n} km`;
    if (it.id === 'cash') return `$${Math.floor(it.p).toLocaleString()} / $${it.n.toLocaleString()}`;
    return `${Math.floor(it.p)} / ${it.n}`;
  }
  function resetIn(){ const d = new Date(), m = new Date(d); m.setHours(24, 0, 0, 0); const s = (m - d) / 1000; return `${Math.floor(s / 3600)}h ${Math.floor(s % 3600 / 60)}m`; }
  function render_(){
    if (!uiReady || !data) return;
    const done = data.items.filter(i => i.done).length;
    btn.textContent = `DAILY · ${done}/3`;
    btn.classList.toggle('done', done === 3);
    if (panel.style.display !== 'block') return;
    panel.innerHTML = `<h3>DAILY CHALLENGES</h3><div class="sub">Resets in ${resetIn()} · weather now: ${wx.kind.toUpperCase()}</div>` +
      data.items.map(it => `<div class="ch${it.done ? ' done' : ''}"><div class="row"><span class="txt">${def(it.id).text(it.n)}</span><span class="pay">+$${it.pay}</span></div><div class="bar"><i style="width:${Math.min(100, it.p / it.n * 100).toFixed(1)}%"></i></div><div class="num">${fmt(it)}</div></div>`).join('') +
      `<div class="foot"><span>Finish all 3</span><span class="pay">${data.bonus ? 'BONUS PAID' : '+$' + BONUS + ' BONUS'}</span></div><button type="button" id="dailyClose">CLOSE</button>`;
    panel.querySelector('#dailyClose').onclick = () => toggle(false);
  }

  // ================= HOOKS =================
  const basePlace = placeCamera;
  placeCamera = function(){
    const yaw = basePlace.apply(this, arguments);
    try { applyAtmosphere(); } catch (_) {}
    kick.pitch *= .82; kick.yaw *= .8;
    if (state === 'play' && player && !player.car && !player.dead){
      if (kick.pitch > .0005) camera.rotateX(kick.pitch);
      if (Math.abs(kick.yaw) > .0003) camera.rotateY(kick.yaw);
    }
    if (!muzzle && scene){ muzzle = new THREE.PointLight(0xffc070, 0, 70, 2); muzzle.userData.__gfx = true; scene.add(muzzle); }
    if (muzzle){
      kick.light *= .55;
      muzzle.intensity = kick.light * 3.2;
      if (kick.light > .02){ camera.getWorldDirection(aimDir); muzzle.position.copy(camera.position).addScaledVector(aimDir, 14); }
    }
    return yaw;
  };

  let frameN = 0;
  const baseRender = render;
  render = function(){
    frameN++;
    try { updateWeather(); updateCover(); updateRain(); if (frameN % 10 === 0) updateRainSound(); } catch (_) {}
    try { trackMovement(); daily.update(); } catch (_) {}
    baseRender.apply(this, arguments);
    if (wx.flash > .05 && state !== 'menu'){
      cx.save(); cx.fillStyle = `rgba(225,232,255,${(wx.flash * .35).toFixed(3)})`; cx.fillRect(0, 0, SW, SH); cx.restore();
    }
    const showBtn = state !== 'menu';
    if ((btn.style.display === 'block') !== showBtn){ btn.style.display = showBtn ? 'block' : 'none'; if (!showBtn) toggle(false); }
    const t = now();
    if (dirty && t - lastSave > 5000){ lastSave = t; dirty = false; save(); }
    if (frameN % 30 === 0) render_();
  };

  addEventListener('pagehide', save);
  window.level29Weather = { get kind(){ return wx.kind; }, set: k => setWeather(k), state: wx };
  window.level29Daily = { get data(){ return data; }, progress, open: () => toggle(true) };
})();
