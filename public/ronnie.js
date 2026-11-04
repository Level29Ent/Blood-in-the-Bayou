'use strict';
// =====================================================================
// RONNIEBABY — mission giver + upgrade dealer.
// Stands at every mission start. Walk up to him to get the job briefing
// and to buy permanent upgrades with the cash Jester earns.
// =====================================================================

// ---------- Upgrade catalog ----------
const RB_UPG = [
  { id:'rapid',  name:'Rapid Fire',            desc:'M240 cycles faster.',                          max:4, base:1500, lvl:() => up.rapid,  buy:() => { up.rapid++; } },
  { id:'cool',   name:'Cooling Kit',           desc:'Barrel heats slower and cools quicker.',       max:4, base:1200, lvl:() => up.cool,   buy:() => { up.cool++; } },
  { id:'ap',     name:'Armor-Piercing Rounds', desc:'More damage, bullets punch through crowds.',   max:3, base:2500, lvl:() => up.ap,     buy:() => { up.ap++; } },
  { id:'spread', name:'Spread Shot',           desc:'Fire 3, then 5 rounds per trigger pull.',      max:2, base:3000, lvl:() => up.spread, buy:() => { up.spread++; } },
  { id:'armor',  name:'Armor Plates',          desc:'+25 max armor and a full refill.',             max:4, base:1000, lvl:() => up.armor,  buy:() => { up.armor++; player.armor = 50 + up.armor * 25; } },
  { id:'vital',  name:'Level 29 Grit',         desc:'+25 max health and a full heal.',              max:4, base:1400, lvl:() => up.vital || 0, buy:() => { up.vital = (up.vital || 0) + 1; player.maxHp = 100 + up.vital * 25; player.hp = player.maxHp; } },
  { id:'tough',  name:'Bulletproof Rides',     desc:'Cars you drive take less damage.',             max:3, base:1800, lvl:() => up.tough,  buy:() => { up.tough++; } },
  { id:'nitro',  name:'Nitro Boost',           desc:'Hold Shift (or LB) in a car for a burst.',     max:1, base:2000, lvl:() => up.nitro ? 1 : 0, buy:() => { up.nitro = true; } },
];
const rbPrice = u => u.base * (u.lvl() + 1);

// keep extra max health across new player bodies (respawn, district travel)
const _newPlayer = newPlayer;
newPlayer = function(x, y){ const p = _newPlayer(x, y); if (up.vital){ p.maxHp = 100 + up.vital * 25; p.hp = p.maxHp; } return p; };

// ---------- Where Ronniebaby stands ----------
let ronnie = { x: 0, y: 0, active: false, cd: 0, greeted: false };
function sidewalkNear(x, y){
  for (let r = 1; r <= 4; r++){
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){
      const qx = x + dx * r * TILE, qy = y + dy * r * TILE;
      if (tileAt(qx, qy) === T_WALK && !solidAt(qx, qy)) return { x: Math.floor(qx / TILE) * TILE + TILE / 2, y: Math.floor(qy / TILE) * TILE + TILE / 2 };
    }
  }
  return { x, y };
}
const _placeStart = placeMissionStart;
placeMissionStart = function(){
  _placeStart();
  const s = sidewalkNear(mission.start.x, mission.start.y);
  mission.start = s; ronnie.x = s.x; ronnie.y = s.y; ronnie.active = true; ronnie.cd = 0;
  objective = 'Meet Ronniebaby for mission ' + (missionIdx + 1) + '. He is marked RB on your map.';
};
const _missionTarget = missionTarget;
missionTarget = function(){ const t = _missionTarget(); if (t && mission && mission.phase === 'start') t.label = 'RB'; return t; };

// ---------- Briefings ----------
const BRIEF_TYPES = ['rescue', 'clear', 'deliver', 'race', 'defend', 'boss'];
const RB_TEXT = {
 "rb_rescue_0": "Look, man. One of ours is pinned down out there. Go find him and bring him back to the safehouse in one piece.",
 "rb_rescue_1": "Got a survivor hidin' from the horde. Get there before the dead do, and then get 'em back home.",
 "rb_clear_0": "This whole block crawlin' with 'em, bruh. Go kill them motherf***ers. Every last one of 'em.",
 "rb_clear_1": "Them motherf***ers took over the whole street. Clear it out so the people can breathe again.",
 "rb_deliver_0": "Supply crate went down across the town. Grab it, drop it where I marked it. Don't let 'em take s***.",
 "rb_deliver_1": "Folks need that crate, man. Pick it up, run it across the city, and keep your head on a swivel.",
 "rb_race_0": "I need you movin' fast. Grab some wheels and hit every checkpoint before the clock run out.",
 "rb_race_1": "Hurry the f*** up, Jester. Get in the car and burn through every checkpoint.",
 "rb_defend_0": "Get to that barricade and hold it down, motherf***er. Don't let nobody through. I said nobody.",
 "rb_defend_1": "They 'bout to overrun the barricade. Plant your motherf***in' feet down and hold the line, p***y.",
 "rb_boss_0": "Oh, look, this must be the big one. Somethin' nasty out there in that motherf***er, and I got somethin' special waitin' on you.",
 "rb_boss_1": "You heard them screams? That's the boss. Go put 'em down for good.",
 "rb_take_0": "Go handle it. I'mma be watchin'.",
 "rb_take_1": "Do it for the city, Jester. F***in' right. Level 29.",
 "rb_take_2": "Make it loud, man.",
 "rb_take_3": "Level 29. Let's work.",
 "rb_pass_0": "That's what I'm talkin' 'bout, motherf***er. Come see me, I got some more.",
 "rb_pass_1": "That's how we do it. Swing by, I got some upgrades waitin'.",
 "rb_pass_2": "Man, the city owe you a big one, bro. Come get paid and come get strapped.",
 "rb_pass_3": "Clean. Come find me for the next one.",
 "rb_passboss": "You took down a motherf***in' boss. Legendary. Yeah, come f*** with me, I got some more work for ya.",
 "rb_hey_1": "There he go. What's happenin'? I got some work for you.",
 "rb_buy": "Good choice. That's gonna keep you breathin'."
};
function briefing(info){
  const t = BRIEF_TYPES.includes(info.type) ? info.type : 'rescue';
  return RB_TEXT['rb_' + t + '_' + (info.i % 2)];
}
// ---------- Ronniebaby voice (rbvo/*.mp3, plain <audio> so it works everywhere) ----------
const rbVoice = new Audio(); rbVoice.preload = 'auto';
let rbQueue = [];
function rbSay(key, ...more){
  if (typeof soundMode !== 'undefined' && soundMode === 2) return;
  if (state !== 'play' && state !== 'talk') return;
  rbQueue = more;
  try { rbVoice.pause(); rbVoice.muted = false; rbVoice.src = 'rbvo/' + key + '.mp3'; rbVoice.volume = 1; rbVoice.play().catch(() => {}); } catch(e){}
  rbVoice.speaking = true;
}
// Phones only let a media element play from code after a tap has started it once, so unlock the voice player silently on the first touch or key press.
let rbVoiceUnlocked = false;
function rbVoiceUnlock(){ if (rbVoiceUnlocked) return; rbVoiceUnlocked = true; try { if (rbVoice.speaking) return; rbVoice.muted = true; rbVoice.volume = 0; rbVoice.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='; const p = rbVoice.play(); const done = () => { if (!rbVoice.speaking){ rbVoice.pause(); rbVoice.currentTime = 0; } rbVoice.muted = false; }; if (p && p.then) p.then(done).catch(() => { rbVoiceUnlocked = false; rbVoice.muted = false; }); else done(); } catch (_){ rbVoiceUnlocked = false; rbVoice.muted = false; } }
for (const ev of ['touchend', 'pointerup', 'click', 'keydown']) addEventListener(ev, rbVoiceUnlock, true);
rbVoice.addEventListener('ended', () => { rbVoice.speaking = false; if (rbQueue.length){ const [k, ...rest] = rbQueue; setTimeout(() => { if (state === 'talk') rbSay(k, ...rest); }, 250); } });
function rbStopVoice(){ rbQueue = []; try { rbVoice.pause(); } catch(e){} rbVoice.speaking = false; }
function rewardFor(info){ return 500 + info.i * 120 + (info.isBoss ? 2500 : 0); }

// ---------- Dialog UI ----------
const rbEl = document.createElement('div'); rbEl.id = 'rbtalk'; document.body.appendChild(rbEl);
let rbTab = 'job';
function openRonnie(tab){
  state = 'talk'; mouse.down = false; rbTab = tab || 'job';
  for (const k in keys) keys[k] = false; stick.x = 0; stick.y = 0;
  if (player.car) player.car.v = 0;
  renderRonnie(); rbEl.style.display = 'flex';
  const firstMeet = !ronnie.greeted;
  if (!ronnie.greeted){ ronnie.greeted = true; sfx('tune'); }
  ronnie.visits = (ronnie.visits || 0) + 1;
  // his real voice: "Oh man, what's happenin'? You got here just in time."
  const hello = firstMeet || ronnie.visits % 2 === 0 ? 'rb_hey_0' : null;
  if (mission && mission.info && rbTab === 'job'){
    const brief = 'rb_' + (BRIEF_TYPES.includes(mission.info.type) ? mission.info.type : 'rescue') + '_' + (mission.info.i % 2);
    if (!BRIEF_TYPES.includes(mission.info.type)) rbSay(hello || 'rb_hey_1'); else if (hello && !firstMeet) rbSay(hello, brief); else rbSay(brief);
  }
  else rbSay(hello || 'rb_hey_1');
}
function renderRonnie(){
  const info = mission ? mission.info : null;
  const head = '<div class="rbhead"><img src="ronnie.png" alt="Ronniebaby" crossorigin="anonymous"><div><div class="eyebrow">LEVEL 29 · MISSION CONTACT</div><h2>Ronniebaby</h2><div class="tabs"><button data-tab="job" class="' + (rbTab === 'job' ? 'on' : '') + '">THE JOB</button><button data-tab="upg" class="' + (rbTab === 'upg' ? 'on' : '') + '">UPGRADES</button></div></div></div>';
  let body = '';
  if (rbTab === 'job' && info){
    body = '<p class="quote">“' + briefing(info) + '”</p>' +
      '<div class="jobmeta"><span>MISSION ' + (info.i + 1) + ' / ' + CAMPAIGN_TOTAL + '</span><b>' + info.title.toUpperCase() + '</b><span>PAYS ' + money(rewardFor(info)).replace(/^\$0+/, '$') + (info.isBoss ? ' + POWER-UP' : '') + '</span></div>' +
      '<div class="acts"><button class="go" data-act="take">TAKE THE JOB · E</button><button data-act="upg">UPGRADES · U</button><button data-act="leave">NOT NOW · ESC</button></div>';
  } else {
    body = '<p class="cash">' + money(cash) + '</p><div class="upgs">' + RB_UPG.map(u => {
      const l = u.lvl(), maxed = l >= u.max, pr = rbPrice(u);
      return '<div class="item"><div><b>' + u.name + ' <em>' + (u.max > 1 ? l + '/' + u.max : (maxed ? 'OWNED' : '')) + '</em></b><span>' + u.desc + '</span></div><button data-upg="' + u.id + '"' + (maxed || cash < pr ? ' disabled' : '') + '>' + (maxed ? 'MAXED' : 'BUY · $' + pr.toLocaleString()) + '</button></div>';
    }).join('') + '</div><div class="acts">' + (info ? '<button class="go" data-act="take">TAKE THE JOB · E</button>' : '') + '<button data-act="leave">LEAVE · ESC</button></div>';
  }
  rbEl.innerHTML = '<div class="sbox rb">' + head + body + '</div>';
  rbEl.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { rbTab = b.dataset.tab; renderRonnie(); });
  rbEl.querySelectorAll('[data-act]').forEach(b => b.onclick = () => rbAct(b.dataset.act));
  rbEl.querySelectorAll('[data-upg]').forEach(b => b.onclick = () => buyUpg(b.dataset.upg));
}
function buyUpg(id){
  const u = RB_UPG.find(x => x.id === id); if (!u || u.lvl() >= u.max) return;
  const pr = rbPrice(u); if (cash < pr){ sfx('fail'); return; }
  cash -= pr; u.buy(); sfx('cash'); snd('power'); if (!rbVoice.speaking) rbSay('rb_buy');
  toast('UPGRADE · ' + u.name.toUpperCase() + (u.max > 1 ? ' ' + u.lvl() + '/' + u.max : ''));
  renderRonnie();
}
function closeRonnie(){ rbEl.style.display = 'none'; if (state === 'talk') state = 'play'; for (const k in keys) keys[k] = false; }
function rbAct(a){
  if (a === 'upg'){ rbTab = 'upg'; renderRonnie(); return; }
  if (a === 'take'){
    closeRonnie(); ronnie.active = false;
    subtitle = { name: 'RONNIEBABY', txt: RB_TEXT['rb_take_' + (mission.info.i % 4)], t: 200 };
    rbSay('rb_take_' + (mission.info.i % 4));
    beginMission(); return;
  }
  rbStopVoice(); closeRonnie(); ronnie.cd = 1; // stays closed until Jester walks away
}

// ---------- Mission start: talk instead of auto-start ----------
const _updMission = updateMission;
updateMission = function(){
  const m = mission;
  if (m && m.phase === 'start'){
    const px = player.car ? player.car.x : player.x, py = player.car ? player.car.y : player.y;
    const d = dist(px, py, ronnie.x, ronnie.y);
    if (ronnie.cd && d > 110) ronnie.cd = 0;
    if (!ronnie.cd && d < 52 && (!player.car || Math.abs(player.car.v) < 2.5) && !player.dead) openRonnie('job');
    else if (!ronnie.cd && d < 70 && player.car && frame % 60 === 0) toast('SLOW DOWN TO TALK TO RONNIEBABY');
    return;
  }
  _updMission();
};
const _passM = passMission;
passMission = function(){
  const info = mission && mission.info;
  _passM();
  const lines = [0,1,2,3].map(n => RB_TEXT['rb_pass_' + n]);
  setTimeout(() => { if (state === 'play') subtitle = { name: 'RONNIEBABY · PHONE', txt: info && info.isBoss ? RB_TEXT.rb_passboss : lines[(info ? info.i : 0) % lines.length], t: 260 }; sfx('tune'); setTimeout(() => rbSay(info && info.isBoss ? 'rb_passboss' : 'rb_pass_' + ((info ? info.i : 0) % 4)), 500); }, 2600);
};
const _startG = startGame;
startGame = function(i){
  ronnie.greeted = false;
  _startG(i);
  up.vital = 0; player.maxHp = 100;
  setTimeout(() => { if (state === 'play') subtitle = { name: 'RONNIEBABY · PHONE', txt: 'Oh man, what\u2019s happenin\u2019? You got here just in time. Look, the city f***in\u2019 falling apart... and I need you.', t: 480 }; rbSay('rb_intro'); }, 1800);
};

// ---------- Input while talking ----------
addEventListener('keydown', e => {
  if (state !== 'talk') return;
  const k = e.key.toLowerCase();
  e.stopImmediatePropagation(); e.preventDefault();
  if (k === 'e' || k === 'enter' || k === ' ') { if (rbTab === 'job' || mission) rbAct('take'); }
  else if (k === 'u') rbAct('upg');
  else if (k === 'j') { rbTab = 'job'; renderRonnie(); }
  else if (k === 'escape' || k === 'q') rbAct('leave');
}, true);
// controller: A take, X upgrades, B leave
let rbPadPrev = [];
const _updRb = update;
update = function(){
  if (state === 'talk' && navigator.getGamepads){
    const pad = [...navigator.getGamepads()].find(p => p && p.connected);
    if (pad){
      const b = i => !!(pad.buttons[i] && pad.buttons[i].pressed), edge = i => b(i) && !rbPadPrev[i];
      if (edge(0)) rbAct('take'); else if (edge(2)) rbAct('upg'); else if (edge(1)) rbAct('leave');
      rbPadPrev = pad.buttons.map(x => !!(x && x.pressed));
    }
  }
  _updRb();
};

// ---------- 3D Ronniebaby ----------
let rbMesh = null;
function patchTex(){
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  g.fillStyle = '#1c1c1e'; g.fillRect(0, 0, 128, 128);
  const shades = ['#e8e6e0', '#b9b7b2', '#7d7c79', '#4a4a4b', '#2a2a2c', '#d2d0ca'];
  const r = mkRng(29);
  for (let y = 0; y < 128; y += 16) for (let x = 0; x < 128; x += 16){
    g.fillStyle = shades[Math.floor(r() * shades.length)];
    const ox = r() * 3, oy = r() * 3; g.fillRect(x + 1 + ox, y + 1 + oy, 12 + r() * 3, 12 + r() * 3);
    g.strokeStyle = 'rgba(240,238,232,.55)'; g.lineWidth = 1;
    for (let f = 0; f < 6; f++){ const fx = x + r() * 16, fy = y + r() * 16; g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx + (r() - .5) * 5, fy + (r() - .5) * 5); g.stroke(); }
  }
  const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; return t;
}
function makeRonnie(){
  const g = makeFigure(false), u = g.userData;
  const skinCol = '#5b3a27';
  setFigureColors(g, skinCol, '#ffffff', '#111113', '#120d0a');
  u.shirt.map = patchTex(); u.shirt.needsUpdate = true;
  u.eyes = null;
  if (u.face) u.face.visible = false;
  // sleeves: patchwork arms + hands
  const sleeve = u.shirt, handM = lam(skinCol);
  for (const arm of [u.armL, u.armR]){ arm.children[0].material = sleeve; const h = box(2.2, 1.6, 2.2, handM); h.position.y = -7.6; arm.add(h); }
  // oversized jacket: slightly wider torso + hem
  u.torso.scale.set(1.12, 1.08, 1.08);
  const hem = box(5.4, 1.4, 8.2, sleeve); hem.position.y = 7.9; u.body.add(hem);
  // face: eyes, mustache + chin hair
  const dark = lam('#0d0a08');
  for (const z of [-1.05, 1.05]){ const e = box(.3, .55, .8, dark); e.position.set(2.24, 18.5, z); u.body.add(e); }
  const stache = box(.35, .45, 2.2, dark); stache.position.set(2.25, 17.1, 0); u.body.add(stache);
  const chin = box(.5, 1.1, 1.6, dark); chin.position.set(2.1, 15.9, 0); u.body.add(chin);
  // long twisted locs
  u.hair.scale.set(1.08, 1.2, 1.08); u.hair.position.y = 20.5;
  const locM = [lam('#120d0a'), lam('#1d1510'), lam('#0a0806')], rng = mkRng(1129);
  const locs = new THREE.Group();
  const N = 34;
  for (let k = 0; k < N; k++){
    const ang = (k / N) * Math.PI * 2, cx0 = Math.cos(ang), sz0 = Math.sin(ang);
    const front = cx0 > .55; // face side (+x)
    if (front && Math.abs(sz0) < .5) continue; // keep most of the face visible
    const len = front ? 5.5 + rng() * 2.5 : 8 + rng() * 4;
    const loc = new THREE.Mesh(new THREE.BoxGeometry(.55, len, .55), locM[k % 3]);
    const rx = 2.35 * Math.sign(cx0) * Math.min(1, Math.abs(cx0) * 1.4), rz = 2.35 * Math.sign(sz0) * Math.min(1, Math.abs(sz0) * 1.4);
    loc.position.set(rx * (front ? 1.02 : 1), 20.6 - len / 2, rz);
    loc.rotation.set(sz0 * .18 + (rng() - .5) * .12, 0, -cx0 * .12 + (rng() - .5) * .1);
    // twist bands for texture
    for (let t = 1; t < len / 1.3; t++){ const band = box(.7, .22, .7, locM[(k + 1) % 3]); band.position.y = len / 2 - t * 1.3; loc.add(band); }
    locs.add(loc);
  }
  // a few locs falling over the front of the face, like the photo
  for (const z of [-1.75, 1.6]){ const loc = new THREE.Mesh(new THREE.BoxGeometry(.5, 7, .5), locM[0]); loc.position.set(2.45, 17, z); loc.rotation.x = z * .05; locs.add(loc); }
  u.body.add(locs);
  g.scale.setScalar(1.08);
  // gold ground ring so he is easy to spot
  const ring = new THREE.Mesh(new THREE.RingGeometry(14, 17, 40), new THREE.MeshBasicMaterial({ color: 0xf4c355, transparent: true, opacity: .55, side: THREE.DoubleSide, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = .5; g.add(ring); u.ring = ring;
  scene.add(g);
  return g;
}
function syncRonnie(){
  if (!scene) return;
  if (!rbMesh) rbMesh = makeRonnie();
  const show = state !== 'menu' && ronnie.active && mission && mission.phase === 'start';
  rbMesh.visible = !!show; if (!show) return;
  const p = player, px = p.car ? p.car.x : p.x, py = p.car ? p.car.y : p.y, d = dist(px, py, ronnie.x, ronnie.y);
  const face = Math.atan2(py - ronnie.y, px - ronnie.x);
  poseFigure(rbMesh, ronnie.x, ronnie.y, face, d < 220 ? frame * .12 : 0, d < 220 && state !== 'talk' ? 'wave' : 'stand');
  if (d >= 220 || state === 'talk'){ const u = rbMesh.userData; u.legL.rotation.z = 0; u.legR.rotation.z = 0; u.armR.rotation.x = 0; u.armL.rotation.z = .08; u.armR.rotation.z = -.08; u.body.position.y = Math.sin(frame * .05) * .15; }
  const s = 1 + Math.sin(frame * .08) * .05; rbMesh.userData.ring.scale.set(s, s, s);
}
const _renderRb = render;
render = function(){ if (renderer) syncRonnie(); _renderRb(); };

// name tag above his head
const _fpHUDrb = fpHUD;
fpHUD = function(small){
  _fpHUDrb(small);
  if (!ronnie.active || !mission || mission.phase !== 'start' || !player || state === 'talk') return;
  const px = player.car ? player.car.x : player.x, py = player.car ? player.car.y : player.y, d = dist(px, py, ronnie.x, ronnie.y);
  if (d > 700) return;
  const pr = project(ronnie.x, ronnie.y, 30); if (!pr || pr.x < 0 || pr.x > SW || pr.y < 0 || pr.y > SH) return;
  cx.globalAlpha = clamp(1.5 - d / 700, 0, 1);
  hudText('RONNIEBABY', pr.x, pr.y - 18, small ? 15 : 18, '#f4c355', 'center', '900 ');
  hudText(d < 160 ? ('ontouchstart' in window ? 'WALK UP TO TALK' : 'WALK UP TO TALK · MISSION + UPGRADES') : Math.round(d / 10) + ' M · MISSION ' + (missionIdx + 1), pr.x, pr.y + 2, 11, '#f6f3e6', 'center', '700 ');
  cx.globalAlpha = 1;
};
