'use strict';
// =====================================================================
// BLOOD IN THE BAYOU — open-world extras: weapon wheel, gun shop,
// Bayou Shine, rampages, hidden packages, stunt jumps, traffic, cheats.
// =====================================================================

// ---------- Weapons ----------
const WEAPONS = {
  m240:    { name:'M240',      key:'1', price:0,    ammo:Infinity, pack:0,  col:'#f4c355' },
  shotgun: { name:'SHOTGUN',   key:'2', price:900,  ammo:24,  pack:24, ammoPrice:150, col:'#e8a25a' },
  rpg:     { name:'RPG',       key:'3', price:3500, ammo:6,   pack:4,  ammoPrice:600, col:'#ff6a4a' },
  molotov: { name:'MOLOTOV',   key:'4', price:600,  ammo:6,   pack:5,  ammoPrice:200, col:'#ff9a2a' },
  smg:     { name:'BAYOU SMG', key:'6', price:1700, ammo:120, pack:120, ammoPrice:220, col:'#81c5cf' },
  carbine: { name:'RANGER CARBINE', key:'7', price:2800, ammo:60, pack:60, ammoPrice:300, col:'#a6c183' },
  pistol: {name:'MARSH PISTOL',key:'8',price:1200,ammo:48,pack:48,ammoPrice:180,col:'#92bcca'},
  marksman: {name:'DELTA MARKSMAN',key:'9',price:4600,ammo:30,pack:30,ammoPrice:400,col:'#bcb894'},
  snowball: {name:'FELICIA SNOWBALL',key:'0',price:180,ammo:6,pack:6,ammoPrice:180,col:'#a5e5f4'},
  bat:     { name:'BAT',       key:'5', price:150,  ammo:Infinity, pack:0, col:'#c9a37a' },
};
const WORDER = ['m240','shotgun','rpg','molotov','bat','smg','carbine','pistol','marksman','snowball'];
let arsenal = null, curW = 'm240', wheelOpen = false, wheelSel = 0, wFire = 0, batSwing = 0;
function resetArsenal(){ arsenal = { m240: Infinity, bat: 0 }; arsenal.bat = undefined; delete arsenal.bat; curW = 'm240'; }
resetArsenal();
const hasW = w => arsenal[w] !== undefined;
function giveW(w, n){ if (!hasW(w)) arsenal[w] = 0; if (arsenal[w] !== Infinity) arsenal[w] += (n == null ? WEAPONS[w].ammo : n); if (WEAPONS[w].ammo === Infinity) arsenal[w] = Infinity; }
function selectW(w){ if (!hasW(w)) return; if (curW !== w){ curW = w; sfx('tune'); toast(WEAPONS[w].name); } }

// Replace the default fire path when a non-M240 weapon is held.
const _fireWeapon = fireWeapon;
fireWeapon = function(ox, oy, aim){
  const p = player;
  if (curW === 'm240' || p.car && curW === 'bat') return _fireWeapon(ox, oy, aim);
  if (curW !== 'bat' && arsenal[curW] <= 0){ if (frame % 30 === 0) toast('OUT OF ' + WEAPONS[curW].name + ' AMMO · Q TO SWITCH'); p.fireCd = 20; return; }
  if(curW==='snowball'){
    bullets.push({x:ox+Math.cos(aim)*22,y:oy+Math.sin(aim)*22,vx:Math.cos(aim)*11,vy:Math.sin(aim)*11,life:40,dmg:36,pierce:0,hit:new Set(),snowball:true});arsenal.snowball--;p.fireCd=35;p.flash=0;view.kick=.6;sfx('door');
  }else if(curW==='pistol'||curW==='marksman'){
    const long=curW==='marksman',a=aim+rnd(long?-.008:-.035,long?.008:.035),sp=long?30:22;
    bullets.push({x:ox+Math.cos(a)*22,y:oy+Math.sin(a)*22,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:long?48:26,dmg:(long?10:3.5)*(window.level29Trading?.damage||1)+up.ap*.35,pierce:long?2:0,hit:new Set()});
    arsenal[curW]--;p.fireCd=long?48:16;p.flash=3;view.kick=long?2.4:1.1;snd('shot');
  }else if(curW==='smg'||curW==='carbine'){
    const rifle=curW==='carbine',spread=(rifle?.018:.07)*(window.level29Trading?.spread||1),a=aim+rnd(-spread,spread),speed=rifle?24:18;
    bullets.push({x:ox+Math.cos(a)*22,y:oy+Math.sin(a)*22,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:rifle?38:24,dmg:(rifle?4.8:1.7)*(window.level29Trading?.damage||1)+up.ap*.35,pierce:rifle?1:0,hit:new Set()});
    arsenal[curW]--;p.fireCd=rifle?20:6;p.flash=3;view.kick=rifle?1.8:.65;snd('shot');
  }else if (curW === 'shotgun'){
    for (let k=0;k<9;k++){ const a = aim + rnd(-.16, .16), sp = rnd(13, 17); bullets.push({ x: ox + Math.cos(a)*22, y: oy + Math.sin(a)*22, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp, life: 20, dmg: 1.4 + up.ap*.4, pierce: 0, hit: new Set() }); }
    arsenal.shotgun--; p.fireCd = 42; p.flash = 3; shake = Math.max(shake, 5); snd('shot'); snd('shot'); view.kick = 2;
  } else if (curW === 'rpg'){
    rockets.push({ x: ox + Math.cos(aim)*24, y: oy + Math.sin(aim)*24, vx: Math.cos(aim)*9, vy: Math.sin(aim)*9, life: 110, h: p.car ? 12 : 14 });
    arsenal.rpg--; p.fireCd = 70; p.flash = 3; shake = Math.max(shake, 7); sfx('bang'); view.kick = 3;
  } else if (curW === 'molotov'){
    const d = 240, tx = ox + Math.cos(aim)*d, ty = oy + Math.sin(aim)*d;
    throws.push({ x: ox, y: oy, sx: ox, sy: oy, tx, ty, t: 0, T: 38 });
    arsenal.molotov--; p.fireCd = 45; sfx('door');
  } else if (curW === 'bat'){
    batSwing = 14; p.fireCd = 26; snd('bump');
    let hit = false;
    for (const z of zombies){ if (!z.alive) continue; const d = dist(ox, oy, z.x, z.y); if (d < 46 + z.r && Math.abs(angDiff(aim, Math.atan2(z.y - oy, z.x - ox))) < .9){ z.killSource='player';z.lastHit=0;z.hp -= 3.2 + up.ap; z.flash = 5; z.stun = 30; moveCircle(z, Math.cos(aim)*18, Math.sin(aim)*18, z.r*.8); gore(z.x, z.y, 4); hit = true; if (z.hp <= 0) killZombie(z, Math.cos(aim)*6, Math.sin(aim)*6); else snd('zhit'); } }
    if (boss && !boss.dead && dist(ox, oy, boss.x, boss.y) < 60 + boss.r){ damageBoss(4); hit = true; }
    if (hit){ view.hit = 7; shake = Math.max(shake, 4); sfx('splat'); }
  }
  lastShotFrame = frame; heat = Math.min(5, heat + .02);
};
let rockets = [], throws = [], fires = [];
function boom(x, y, max, owner){ explosions.push({ x, y, r: 0, max: max || 120, playerOwned:!owner, owner:owner||0, t: 28, dealt: false }); sfx('explode'); shake = Math.max(shake, 16); decal(x, y, 'scorch', 1); for (let k=0;k<22;k++) parts.push({ k:'fire', x, y, vx: rnd(-5,5), vy: rnd(-5,5), t: rnd(20,45) }); }
function updateWeapons(){
  const p = player;
  if (batSwing > 0) batSwing--;
  for (const r of rockets){
    r.x += r.vx; r.y += r.vy; r.life--;
    if (frame % 2 === 0) parts.push({ k:'smoke', x: r.x, y: r.y, vx: rnd(-.3,.3), vy: rnd(-.3,.3), t: 30 });
    let hit = solidAt(r.x, r.y) || r.life <= 0;
    if (!hit) for (const z of zombies) if (z.alive && dist(r.x, r.y, z.x, z.y) < z.r + 6){ hit = true; break; }
    if (!hit && boss && !boss.dead && dist(r.x, r.y, boss.x, boss.y) < boss.r + 6){ hit = true; damageBoss(18 + up.ap*4); }
    if (!hit) for (const c of cars) if (!c.dead && c !== p.car && dist(r.x, r.y, c.x, c.y) < c.r){ hit = true; damageCar(c, 300,r.owner?'remote':'player',r.owner); break; }
    if (hit){ r.life = 0; boom(r.x, r.y, 130,r.owner); if (boss && !boss.dead && dist(r.x, r.y, boss.x, boss.y) < 140) damageBoss(10); }
  }
  rockets = rockets.filter(r => r.life > 0);
  for (const t of throws){
    t.t++; const k = t.t / t.T; t.x = t.sx + (t.tx - t.sx) * k; t.y = t.sy + (t.ty - t.sy) * k; t.h = 14 + Math.sin(k * Math.PI) * 40;
    if (solidAt(t.x, t.y) || t.t >= t.T){ t.done = true; fires.push({ x: t.x, y: t.y, owner:t.owner||0, t: 300, r: 70 }); sfx('crash', 3); for (let j=0;j<30;j++) parts.push({ k:'fire', x: t.x + rnd(-30,30), y: t.y + rnd(-30,30), vx: rnd(-1,1), vy: rnd(-1,1), t: rnd(20,40) }); }
  }
  throws = throws.filter(t => !t.done);
  for (const f of fires){
    f.t--;
    if (frame % 2 === 0) parts.push({ k:'fire', x: f.x + rnd(-f.r, f.r) * .8, y: f.y + rnd(-f.r, f.r) * .8, vx: rnd(-.3,.3), vy: rnd(-.3,.3), t: rnd(15, 30) });
    if (frame % 10 === 0){
      for (const z of zombies) if (z.alive && dist(z.x, z.y, f.x, f.y) < f.r){ z.killSource=f.owner?'remote':'player';z.lastHit=f.owner||0;z.hp -= 1.1; z.flash = 3; if (z.hp <= 0) killZombie(z, 0, 0); }
      if (boss && !boss.dead && dist(boss.x, boss.y, f.x, f.y) < f.r + boss.r) damageBoss(1.5);
      if (!p.car && !p.dead && dist(p.x, p.y, f.x, f.y) < f.r * .8) hurtPlayer(4, f.x, f.y);
    }
  }
  fires = fires.filter(f => f.t > 0);
}

// ---------- Weapon wheel ----------
function openWheel(on){ wheelOpen = on; if (on) wheelSel = Math.max(0, WORDER.indexOf(curW)); else { const w = WORDER[wheelSel]; if (hasW(w)) selectW(w); } }
function drawWheel(){
  if (!wheelOpen) return;
  cx.fillStyle = 'rgba(8,10,12,.55)'; cx.fillRect(0, 0, SW, SH);
  const R = Math.min(SW, SH) * .3, X = SW/2, Y = SH/2;
  WORDER.forEach((w, i) => {
    const a = -Math.PI/2 + i * Math.PI*2/WORDER.length, x = X + Math.cos(a) * R, y = Y + Math.sin(a) * R, sel = i === wheelSel, own = hasW(w);
    cx.fillStyle = sel ? 'rgba(244,195,85,.92)' : 'rgba(18,24,28,.88)'; cx.beginPath(); cx.arc(x, y, 50, 0, 7); cx.fill();
    cx.strokeStyle = own ? WEAPONS[w].col : '#555'; cx.lineWidth = 3; cx.stroke();
    hudText(WEAPONS[w].name, x, y - 16, 18, sel ? '#13191d' : own ? '#f6f3e6' : '#666', 'center', '900 ');
    const am = own ? (arsenal[w] === Infinity ? '∞' : arsenal[w] + '') : 'LOCKED';
    hudText(am, x, y + 6, 13, sel ? '#13191d' : own ? '#c9d1d4' : '#666', 'center', '700 ');
  });
  hudText('WEAPON WHEEL', X, Y - 22, 26, '#f4c355', 'center', '900 ');
  hudText('move mouse or arrows · release Q · 1-5 also work', X, Y + 10, 12, '#c9d1d4', 'center', '600 ');
}
function drawWeaponPanel(R, bw, y){
  const p = player, W = WEAPONS[curW];
  if (curW === 'm240') return false;
  cx.fillStyle = 'rgba(0,0,0,.55)'; cx.fillRect(R - bw, y, bw, 34);
  hudText(W.name, R - bw + 8, y + 4, 16, W.col);
  hudText(arsenal[curW] === Infinity ? '∞' : arsenal[curW] + ' LEFT', R - 8, y + 7, 14, '#f6f3e6', 'right', '700 ');
  hudText('Q WEAPON WHEEL', R - 8, y + 22, 10, '#9caab2', 'right', '600 ');
  return true;
}

// ---------- World features: shops, sprays, rampages, packages, jumps ----------
let world = null, packagesFound = new Set(), jumpsDone = new Set(), rampagesDone = new Set(), rampage = null, sprayT = 0;
function freeRoadSpot(rng, nearX, nearY, minD, maxD){
  for (let t=0;t<200;t++){
    const i = Math.floor(rng() * ROADS.length), k = 4 + Math.floor(rng() * (MW - 8)), lane = ROADS[i] + .5 + Math.floor(rng()*3) ;
    const vert = rng() < .5, x = (vert ? lane : k + .5) * TILE, y = (vert ? k + .5 : lane) * TILE;
    const tt = tileAt(x, y); if (tt !== T_ROAD) continue;
    if (nearX != null){ const d = dist(x, y, nearX, nearY); if (d < minD || d > maxD) continue; }
    return { x, y, vert };
  }
  return null;
}
function walkSpotByBuilding(rng, kind){
  const bs = city.buildings.filter(b => b.kind === 'normal' && b.w >= 3*TILE);
  for (let t=0;t<100;t++){
    const b = bs[Math.floor(rng() * bs.length)]; if (!b) break;
    const x = b.x + b.w/2, y = b.y + b.h + TILE*.5;
    if (tileAt(x, y) === T_WALK && dist(x, y, city.safe.x, city.safe.y) > 300) return { x, y, B: b, face: 'S' };
  }
  return null;
}
function buildWorld(){
  const rng = mkRng(distIdx * 7919 + 13);
  const w = { shops: [], sprays: [], rampages: [], packages: [], jumps: [] };
  const gs = walkSpotByBuilding(rng); if (gs) w.shops.push({ x: gs.x, y: gs.y, B: gs.B, kind: 'gun' });
  for (let k=0;k<1;k++){ const s = walkSpotByBuilding(rng); if (s && (!gs || dist(s.x, s.y, gs.x, gs.y) > 600)) w.sprays.push({ x: s.x, y: s.y + 10, B: s.B }); }
  if (!w.sprays.length){ const s = walkSpotByBuilding(rng); if (s) w.sprays.push({ x: s.x, y: s.y + 10, B: s.B }); }
  for (let k=0;k<3;k++){ const s = freeRoadSpot(rng); if (s) w.rampages.push({ x: s.x, y: s.y, id: distIdx + ':' + k, weap: ['shotgun','rpg','molotov'][k], need: 20 + k*5, time: 60*60 }); }
  for (let k=0;k<10;k++){
    let s = null;
    if (k % 2) { const fs = city.features.filter(f => f.kind === 'park' || f.kind === 'field' || f.kind === 'lot'); const f = fs[Math.floor(rng() * fs.length)]; if (f) s = { x: f.x + 30 + rng() * (f.w - 60), y: f.y + 30 + rng() * (f.h - 60) }; }
    if (!s) s = freeRoadSpot(rng);
    if (s && !solidAt(s.x, s.y)) w.packages.push({ x: s.x, y: s.y, id: distIdx + ':' + k });
  }
  for (let k=0;k<4;k++){
    for (let t=0;t<60;t++){
      const s = freeRoadSpot(rng); if (!s) break;
      const a = s.vert ? (rng() < .5 ? Math.PI/2 : -Math.PI/2) : (rng() < .5 ? 0 : Math.PI);
      const ahead = Array.from({length: 8}, (_, j) => tileAt(s.x + Math.cos(a)*(j+1)*TILE, s.y + Math.sin(a)*(j+1)*TILE));
      if (ahead.every(t => t === T_ROAD || t === T_BRIDGE) && !w.jumps.some(j => dist(j.x, j.y, s.x, s.y) < 500) && dist(s.x, s.y, city.safe.x, city.safe.y) > 250){ w.jumps.push({ x: s.x, y: s.y, a, id: distIdx + ':' + k }); break; }
    }
  }
  world = w; rampage = null;
}
function extraBlips(){
  if (!world) return [];
  const out = [];
  for (const s of world.shops) out.push({ x: s.x, y: s.y, col: '#ff8a3a', label: '$' });
  for (const s of world.sprays) out.push({ x: s.x, y: s.y, col: '#5fb7ff', label: 'P' });
  for (const r of world.rampages) if (!rampagesDone.has(r.id)) out.push({ x: r.x, y: r.y, col: '#d23aff', label: 'R' });
  for (const j of world.jumps) if (!jumpsDone.has(j.id)) out.push({ x: j.x, y: j.y, col: '#f6f3e6', label: 'J' });
  return out;
}

// ---------- Gun shop UI ----------
const shopEl = document.createElement('div'); shopEl.id = 'shop'; document.body.appendChild(shopEl);
const SHOP_ITEMS = () => [
  ...['smg','carbine'].map(id=>({id,label:WEAPONS[id].name,desc:id==='smg'?'Fast automatic fire with a wider spread.':'Accurate, hard-hitting semi-automatic rounds with penetration.',price:hasW(id)?WEAPONS[id].ammoPrice:WEAPONS[id].price,buy:hasW(id)?'+'+WEAPONS[id].pack+' ROUNDS':'BUY'})),
  { id:'shotgun', label:'Shotgun', desc:'9-pellet spread. Clears a crowd at close range.', price: hasW('shotgun') ? WEAPONS.shotgun.ammoPrice : WEAPONS.shotgun.price, buy: hasW('shotgun') ? '+24 SHELLS' : 'BUY' },
  { id:'rpg', label:'RPG launcher', desc:'Rocket with blast radius. Flattens bosses and cars.', price: hasW('rpg') ? WEAPONS.rpg.ammoPrice : WEAPONS.rpg.price, buy: hasW('rpg') ? '+4 ROCKETS' : 'BUY' },
  { id:'molotov', label:'Molotov cocktails', desc:'Throw a pool of fire that burns for five seconds.', price: hasW('molotov') ? WEAPONS.molotov.ammoPrice : WEAPONS.molotov.price, buy: hasW('molotov') ? '+5 BOTTLES' : 'BUY' },
  { id:'bat', label:'Baseball bat', desc:'Silent, unlimited, knocks zombies back.', price: hasW('bat') ? 0 : WEAPONS.bat.price, buy: hasW('bat') ? 'OWNED' : 'BUY' },
  { id:'armor', label:'Body armor', desc:'Refill armor to full.', price: 400, buy: 'BUY' },
  { id:'health', label:'First-aid kit', desc:'Refill health to full.', price: 250, buy: 'BUY' },
];
function openShop(){
  state = 'shop'; mouse.down = false;
  const items = SHOP_ITEMS();
  shopEl.innerHTML = '<div class="sbox"><div class="eyebrow">BAYOU ARSENAL · ' + D.name + '</div><h2>Gun shop</h2><p class="cash">' + money(cash) + '</p>' +
    items.map(it => '<div class="item"><div><b>' + it.label + '</b><span>' + it.desc + '</span></div><button data-id="' + it.id + '"' + ((it.buy === 'OWNED' || cash < it.price) ? ' disabled' : '') + '>' + it.buy + (it.price ? ' · $' + it.price : '') + '</button></div>').join('') +
    '<button class="close">LEAVE SHOP · ESC</button></div>';
  shopEl.style.display = 'flex';
  shopEl.querySelectorAll('button[data-id]').forEach(b => b.onclick = () => buyItem(b.dataset.id));
  shopEl.querySelector('.close').onclick = closeShop;
}
function buyItem(id){
  const it = SHOP_ITEMS().find(i => i.id === id); if (!it || cash < it.price) return;
  cash -= it.price; sfx('cash');
  if (id === 'armor') player.armor = 50 + up.armor * 25;
  else if (id === 'health') player.hp = player.maxHp;
  else if (hasW(id)) giveW(id, WEAPONS[id].pack);
  else { giveW(id); selectW(id); }
  openShop();
}
function closeShop(){ shopEl.style.display = 'none'; if (state === 'shop') state = 'play'; shopCd = 120; }
let shopCd = 0;

// ---------- Cheats ----------
const cheatEl = document.createElement('div'); cheatEl.id = 'cheat'; cheatEl.innerHTML = '<div class="sbox small"><div class="eyebrow">CHEAT CODE</div><input id="cheatIn" maxlength="24" autocomplete="off" spellcheck="false" placeholder="type a code"><p class="hint">Enter to apply · Esc to cancel</p></div>'; document.body.appendChild(cheatEl);
const cheatIn = cheatEl.querySelector('input');
const CHEATS = {
  LEVEL29:     ['ALL WEAPONS + FULL AMMO', () => { for (const w of WORDER) giveW(w); arsenal.rpg = 20; arsenal.molotov = 20; arsenal.shotgun = 99; }],
  JESTERMODE:  ['HEALTH + ARMOR MAXED', () => { player.hp = player.maxHp; player.armor = 50 + up.armor*25; }],
  BAYOUBLAST:  ['SPAWN A SPORTS COUPE', () => { const p = player; const c = makeCar(p.x + Math.cos(view.yaw)*42, p.y + Math.sin(view.yaw)*42, view.yaw, 'sports'); cars.push(c); }],
  SEMPERFI:    ['SPAWN A HUMVEE', () => { const p = player; const c = makeCar(p.x + Math.cos(view.yaw)*42, p.y + Math.sin(view.yaw)*42, view.yaw, 'humvee'); cars.push(c); }],
  QUIETSTORM:  ['HORDE CLEARED · HEAT ZERO', () => { heat = 0; for (const z of zombies) if (dist(z.x, z.y, player.x, player.y) < 900){z.killSource='ambient';killZombie(z, 0, 0);} }],
  NEVERHOT:    ['M240 NEVER OVERHEATS', () => { cheatFlags.cool = !cheatFlags.cool; return cheatFlags.cool ? 'M240 NEVER OVERHEATS' : 'M240 HEAT RESTORED'; }],
  GODMODE:     ['INVINCIBLE', () => { cheatFlags.god = !cheatFlags.god; return cheatFlags.god ? 'INVINCIBLE' : 'INVINCIBLE OFF'; }],
  SLOWDEAD:    ['ZOMBIES SLOWED', () => { cheatFlags.slow = !cheatFlags.slow; for (const z of zombies) z.speed *= cheatFlags.slow ? .5 : 2; return cheatFlags.slow ? 'ZOMBIES SLOWED' : 'ZOMBIE SPEED NORMAL'; }],
  NIGHTSHIFT:  ['SKIP TO NEXT MISSION', () => { if (mission && mission.phase !== 'done'){ mission.phase = 'active'; passMission(); } }],
};
const cheatFlags = { god: false, cool: false, slow: false };
const _mkZ = makeZombie; makeZombie = function(x, y, t){ const z = _mkZ(x, y, t); if (cheatFlags.slow) z.speed *= .5; return z; };
function openCheat(){ state = 'cheat'; mouse.down = false; cheatEl.style.display = 'flex'; cheatIn.value = ''; cheatIn.focus(); setTimeout(() => cheatIn.focus(), 30); }
function closeCheat(){ cheatEl.style.display = 'none'; cheatIn.blur(); if (state === 'cheat') state = 'play'; for (const k in keys) keys[k] = false; }
function applyCheat(code){
  code = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code === 'KILO3028'){ cash += 1000000; toast('PRIVATE CREDIT APPLIED'); sfx('cash'); if (typeof persistOpenWorld === 'function') persistOpenWorld(); return true; }
  const c = CHEATS[code];
  if (!c){ toast('UNKNOWN CODE'); sfx('fail'); return false; }
  const r = c[1](); toast('CHEAT ACTIVATED · ' + (typeof r === 'string' ? r : c[0])); sfx('checkpoint'); return true;
}
cheatIn.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter'){ applyCheat(cheatIn.value); closeCheat(); } if (e.key === 'Escape') closeCheat(); });
// typed cheats on the fly (GTA style): keep the last letters pressed during play
let typed = '';
const _hurt = hurtPlayer; hurtPlayer = function(n, sx, sy){ if (cheatFlags.god) return; return _hurt(n, sx, sy); };

// ---------- Traffic ----------
const TRAFFIC_MAX = 8;
function laneDir(c){ // which axis + direction a lane drives, right-hand traffic
  const tx = Math.floor(c.x / TILE), ty = Math.floor(c.y / TILE);
  return { tx, ty };
}
function spawnTraffic(){
  if (state !== 'play' || !player) return;
  const live = cars.filter(c => c.ai && !c.dead);
  if (live.length >= TRAFFIC_MAX || frame % (live.length < 4 ? 12 : 40)) return;
  const px = player.car ? player.car.x : player.x, py = player.car ? player.car.y : player.y;
  const rng = Math.random;
  for (let t=0;t<60;t++){
    const i = Math.floor(rng() * ROADS.length), vert = rng() < .5, side = rng() < .5 ? 0 : 2;
    const lane = (ROADS[i] + side + .5) * TILE, k = (4 + rng() * (MW - 8)) * TILE;
    const x = vert ? lane : k, y = vert ? k : lane;
    if (tileAt(x, y) !== T_ROAD) continue;
    const d = dist(x, y, px, py); if (d < 320 || d > 1100) continue;
    if (cars.some(c => !c.dead && dist(c.x, c.y, x, y) < 160)) continue;
    // right-hand: on vertical roads, east lane (side 2) heads south (+y), west lane north; horizontal: south lane (side 2) heads west
    const a = vert ? (side === 2 ? Math.PI/2 : -Math.PI/2) : (side === 2 ? Math.PI : 0);
    const c = makeCar(x, y, a, D.cars[Math.floor(rng() * D.cars.length)]);
    c.ai = { input: { thr: 1, steer: 0, brake: false, boost: false }, cruise: c.spec.max * rnd(.38, .5), lane, vert, side, turnCd: 0, target: a, stuck: 0 };
    cars.push(c); return;
  }
}
function updateTraffic(){
  const p = player;
  for (const c of cars){
    const ai = c.ai; if (!ai) continue;
    if (c.dead || c.burnT || c.driven){ ai.input.thr = 0; ai.input.steer = 0; if (c.dead || c.driven) c.ai = null; continue; }
    // follow lane
    const want = ai.target;
    const da = angDiff(c.a, want);
    let steer = clamp(da * 2.4, -1, 1);
    if (Math.abs(da) < .2){ // lane keep
      const off = ai.vert ? (c.x - ai.lane) : (c.y - ai.lane);
      const sgn = ai.vert ? (Math.sin(c.a) > 0 ? 1 : -1) : (Math.cos(c.a) > 0 ? -1 : 1);
      steer += clamp(off * .03 * sgn, -.4, .4);
    }
    // obstacles ahead: player, zombies (they plough slowly), other cars, buildings/water
    const fx = c.x + Math.cos(c.a) * (c.spec.len * .5 + 40), fy = c.y + Math.sin(c.a) * (c.spec.len * .5 + 40);
    let block = solidAt(fx, fy) || tileAt(fx, fy) === T_WATER;
    if (!block) for (const o of cars){ if (o === c || o.dead) continue; if (dist(o.x, o.y, fx, fy) < o.r + 14){ block = true; break; } }
    const ped = !p.dead && !p.car && dist(p.x, p.y, fx, fy) < 34;
    let thr = Math.abs(c.v) < ai.cruise ? 1 : 0;
    if (block || ped){ thr = 0; ai.input.brake = true; ai.stuck++; if (ped && frame % 50 === 0) sfx('horn'); }
    else { ai.input.brake = false; ai.stuck = Math.max(0, ai.stuck - 2); }
    // A blocked car waits; off-screen stalled traffic is recycled instead of becoming permanent clutter.
    if (ai.stuck > 360 && dist(c.x,c.y,p.car?p.car.x:p.x,p.car?p.car.y:p.y)>400){ c.dead=true;c.gone=true;continue; }
    // turn at intersections occasionally
    if (ai.turnCd > 0) ai.turnCd--;
    const tx = Math.floor(c.x / TILE), ty = Math.floor(c.y / TILE);
    if (ai.turnCd <= 0 && isRoadCol(tx) && isRoadCol(ty) && Math.abs(da) < .1){
      ai.turnCd = 140;
      const r = Math.random();
      if (r < .45){
        const right = r < .3; const na = c.a + (right ? Math.PI/2 : -Math.PI/2);
        const nv = !ai.vert, ri = roadIndex(nv ? tx : ty);
        if (ri >= 0){
          const dirPos = nv ? Math.sin(na) > 0 : Math.cos(na) > 0;
          const side = nv ? (dirPos ? 2 : 0) : (dirPos ? 0 : 2);
          const lane = (ROADS[ri] + side + .5) * TILE;
          const okX = nv ? lane : c.x + Math.cos(na) * 100, okY = nv ? c.y + Math.sin(na) * 100 : lane;
          if (tileAt(okX, okY) === T_ROAD || tileAt(okX, okY) === T_BRIDGE){ ai.vert = nv; ai.lane = lane; ai.target = Math.round(na / (Math.PI/2)) * (Math.PI/2); }
        }
      }
    }
    ai.input.thr = thr; ai.input.steer = steer;
    // despawn far away
    const pxx = p.car ? p.car.x : p.x, pyy = p.car ? p.car.y : p.y;
    if (dist(c.x, c.y, pxx, pyy) > 1500){ c.dead = true; c.gone = true; }
  }
  if (frame % 60 === 0) cars = cars.filter(c => !c.gone);
}

// ---------- Rampage ----------
function startRampage(r){
  const old = curW;
  rampage = { r, kills: 0, t: r.time, prev: old };
  if (!hasW(r.weap)) giveW(r.weap); if (arsenal[r.weap] !== Infinity) arsenal[r.weap] = Math.max(arsenal[r.weap], r.weap === 'rpg' ? 25 : r.weap === 'molotov' ? 25 : 80);
  curW = r.weap;
  banner = { big: 'RAMPAGE', small: 'Kill ' + r.need + ' zombies in 60 seconds with the ' + WEAPONS[r.weap].name, t: 200, bad: true };
  snd('roar'); heat = 5; spawnHordeAround(r.x, r.y, 16, 200, 520);
}
const _kill = killZombie; killZombie = function(z, vx, vy){ const was = z.alive; _kill(z, vx, vy); if (was && !z.alive && z.playerKill && rampage) rampage.kills++; };
function updateRampage(){
  if (!rampage) return;
  const R = rampage; R.t--;
  if (frame % 50 === 0 && zombiesNear(player.x, player.y, 500) < 14) spawnHordeAround(player.x, player.y, 6, 260, 520);
  if (R.kills >= R.r.need){ rampagesDone.add(R.r.id); const rw = 2000 + rampagesDone.size * 500; cash += rw; banner = { big: 'RAMPAGE COMPLETE', small: '+$' + rw + ' · ' + rampagesDone.size + ' of 15 rampages', t: 220, good: true }; sfx('pass'); rampage = null; return; }
  if (R.t <= 0 || player.dead){ banner = { big: 'RAMPAGE FAILED', small: R.kills + ' / ' + R.r.need + ' kills', t: 200, bad: true }; sfx('fail'); rampage = null; }
}

// ---------- Stunt jumps ----------
function updateStunts(){
  const p = player;
  for (const c of cars){
    if (c.dead) continue;
    if ((c.z || 0) > 0 || c.vz){
      c.vz = (c.vz || 0) - .32; c.z = (c.z || 0) + c.vz;
      if (c === p.car && c.air){ c.air.t++; c.air.spin += Math.abs(angDiff(c.air.lastA, c.a)); c.air.lastA = c.a; c.air.maxZ = Math.max(c.air.maxZ, c.z); }
      if (c.z <= 0){
        const hard = c.vz < -6; c.z = 0; c.vz = 0; sfx('crash', hard ? 6 : 3); shake = Math.max(shake, hard ? 10 : 5);
        if (hard) damageCar(c, 12);
        if (c.air && c === p.car){
          const A = c.air, distM = Math.round(dist(A.sx, A.sy, c.x, c.y) / 10), h = Math.round(A.maxZ / 10);
          const unique = !jumpsDone.has(A.id); const bonus = 300 + distM * 12 + h * 40 + (unique ? 1000 : 0);
          if (unique) jumpsDone.add(A.id);
          cash += bonus;
          banner = { big: unique ? 'UNIQUE STUNT BONUS' : 'STUNT BONUS', small: distM + ' M · ' + h + ' M HIGH · +$' + bonus + (unique ? ' · ' + jumpsDone.size + ' of 20 jumps' : ''), t: 200, good: true };
          sfx('pass');
        }
        c.air = null;
      }
    }
  }
  if (!world || !p.car) return;
  const c = p.car;
  for (const j of world.jumps){
    if ((c.z || 0) > 0) break;
    const d = dist(c.x, c.y, j.x, j.y);
    if (d < 30 && c.v > 3.2 && Math.abs(angDiff(c.a, j.a)) < .7){
      c.vz = 4 + c.v * .9; c.z = 1; c.air = { sx: c.x, sy: c.y, t: 0, spin: 0, lastA: c.a, maxZ: 0, id: j.id };
      c.v = Math.min(c.spec.max * 1.25, c.v * 1.12); sfx('bang');
    }
  }
}

// ---------- Bayou Shine ----------
function updateSpray(){
  const p = player; if (!world || !p.car) { sprayT = 0; return; }
  const s = world.sprays.find(s => dist(p.car.x, p.car.y, s.x, s.y) < 46);
  if (!s){ sprayT = 0; return; }
  if (Math.abs(p.car.v) > 1){ if (frame % 60 === 0) toast("STOP IN THE BAYOU SHINE"); return; }
  sprayT++;
  if (sprayT === 1){ if (cash < 250){ toast('PAY \'N\' SPRAY COSTS $250'); sprayT = -9999; return; } sfx('door'); }
  if (sprayT === 90){
    cash -= 250; const c = p.car; c.hp = c.maxHp; c.burnT = 0; const cols = c.spec.cols.length > 1 ? c.spec.cols.filter(k => k !== c.col) : ['#3a3a3a', '#f6f3e6', '#7d2bb2', '#1e8a8a'];
    c.col = cols[Math.floor(Math.random() * cols.length)]; heat = 0; for (const z of zombies) z.alert = false;
    banner = { big: 'RESPRAYED', small: 'Car repaired · horde lost your scent · -$250', t: 180, good: true }; sfx('cash');
  }
}

// ---------- Hidden packages ----------
function updatePackages(){
  if (!world) return;
  const p = player, ox = p.car ? p.car.x : p.x, oy = p.car ? p.car.y : p.y;
  for (const k of world.packages){
    if (packagesFound.has(k.id)) continue;
    if (dist(ox, oy, k.x, k.y) < 26){
      packagesFound.add(k.id); const n = packagesFound.size; cash += 500; sfx('cash'); sfx('checkpoint');
      let extra = '';
      if (n === 5){ giveW('shotgun'); extra = ' · SHOTGUN UNLOCKED'; }
      if (n === 10){ giveW('molotov', 10); extra = ' · MOLOTOVS UNLOCKED'; }
      if (n === 15){ giveW('rpg', 8); extra = ' · RPG UNLOCKED'; }
      if (n === 20){ up.cool += 2; extra = ' · M240 COOLING BOOST'; }
      banner = { big: 'HIDDEN PACKAGE', small: n + ' found · +$500' + extra, t: 170, good: true };
    }
  }
}

// ---------- Shop interaction ----------
function nearShop(){ if (!world || player.car || player.dead) return null; return world.shops.find(s => dist(player.x, player.y, s.x, s.y) < 40) || null; }
function nearRampage(){ if (!world || rampage || player.dead) return null; const ox = player.car ? player.car.x : player.x, oy = player.car ? player.car.y : player.y; return world.rampages.find(r => !rampagesDone.has(r.id) && dist(ox, oy, r.x, r.y) < 34) || null; }


// Car music is handled exclusively by the Spotify playlist in expansion.js.
function updateRadio(){}


// ---------- Survivor voice lines ----------
const _say = say; say = function(t){ _say(t); if (/thank god/i.test(t)) playVO('sv_0', { vol: 1.1 }); };
let svState = { car: false, warnT: 0 };
function updateSurvivorVO(){
  const s = survivors[0];
  if (!s || !s.following){ svState.car = false; return; }
  if (s.inCar && !svState.car){ svState.car = true; playVO('sv_2', { vol: 1.1 }); subtitle = { name: 'SURVIVOR', txt: VO_TEXT.sv_2, t: 150 }; }
  if (!s.inCar) svState.car = false;
  if (--svState.warnT <= 0 && !s.inCar && zombiesNear(s.x, s.y, 160) >= 2){ svState.warnT = 600; playVO('sv_1', { vol: 1.1 }); subtitle = { name: 'SURVIVOR', txt: VO_TEXT.sv_1, t: 140 }; }
}
const _pass = passMission; passMission = function(){ const wasRescue = mission && mission.info.type === 'rescue'; _pass(); if (wasRescue){ playVO('sv_3', { vol: 1.1 }); subtitle = { name: 'SURVIVOR', txt: VO_TEXT.sv_3, t: 170 }; } };

// ---------- Hook into the update loop ----------
const _update = update;
update = function(){
  if (city && world && world.city !== city){ world = null; }
  if (city && !world && state !== 'menu'){ buildWorld(); world.city = city; }
  _update();
  updateRadio();
  if (state !== 'play' || !player) return;
  if (shopCd > 0) shopCd--;
  updateWeapons(); updateSurvivorVO(); spawnTraffic(); updateTraffic(); updateStunts(); updateSpray(); updatePackages(); updateRampage();
  const sh = nearShop(); if (sh && shopCd <= 0) openShop();
  const rp = nearRampage(); if (rp) startRampage(rp);
  if (cheatFlags.cool && player) { player.heat = 0; player.overheat = false; }
};
// cars on traffic duty shouldn't be counted as 'parked' for re-entry: handled in enterExit via c.ai = null

// travel/reset hooks
const _travelTo = travelTo; travelTo = function(di){ _travelTo(di); world = null; rockets = []; throws = []; fires = []; rampage = null; };
const _startGame = startGame; startGame = function(i){ resetArsenal(); packagesFound = new Set(); jumpsDone = new Set(); rampagesDone = new Set(); for (const k in cheatFlags) cheatFlags[k] = false; _startGame(i); };

// ---------- Input ----------
addEventListener('keydown', e => {
  if (e.target === cheatIn) return;
  const k = e.key.toLowerCase();
  if (state === 'shop' && (k === 'escape' || k === 'e')){ closeShop(); e.preventDefault(); e.stopImmediatePropagation(); keys[k] = true; return; }
  if (state === 'shop' || state === 'cheat'){ e.stopImmediatePropagation(); return; }
  if (state !== 'play') return;
  if (k === 'q' && !e.repeat){ openWheel(true); }
  if (wheelOpen){ if (k === 'arrowleft' || k === 'arrowup') wheelSel = (wheelSel + WORDER.length - 1) % WORDER.length; if (k === 'arrowright' || k === 'arrowdown') wheelSel = (wheelSel + 1) % WORDER.length; }
  const numbered=Object.keys(WEAPONS).find(id=>WEAPONS[id].key===k);if(numbered)selectW(numbered);
  if (k === 't' && !e.repeat){ e.preventDefault(); openCheat(); return; }
  if (k.length === 1 && /[a-z0-9]/.test(k)){ typed = (typed + k).slice(-12).toUpperCase(); for (const c of [...Object.keys(CHEATS), 'KILO3028']) if (typed.endsWith(c)){ applyCheat(c); typed = ''; } }
}, true);
addEventListener('keyup', e => { if (e.key.toLowerCase() === 'q' && wheelOpen) openWheel(false); });
addEventListener('wheel', e => { if (state !== 'play') return; const owned = WORDER.filter(hasW); const i = owned.indexOf(curW); selectW(owned[(i + (e.deltaY > 0 ? 1 : -1) + owned.length) % owned.length]); }, { passive: true });
cv.addEventListener('mousemove', e => { if (!wheelOpen) return; const a = Math.atan2(e.clientY - SH/2, e.clientX - SW/2); if (Math.hypot(e.clientX - SW/2, e.clientY - SH/2) > 40){ let i = Math.round((a + Math.PI/2) / (Math.PI*2/WORDER.length)); wheelSel = ((i % WORDER.length) + WORDER.length) % WORDER.length; } });
// touch: weapon button
const wBtn = document.createElement('button'); wBtn.id = 'wbtn'; wBtn.textContent = 'WEAPON'; document.querySelector('#touch .group:last-child').prepend(wBtn);
wBtn.addEventListener('click', e => { e.preventDefault(); const owned = WORDER.filter(hasW); const i = owned.indexOf(curW); selectW(owned[(i + 1) % owned.length]); });

// ---------- HUD extras ----------
const _drawHUD = drawHUD;
drawHUD = function(){
  _drawHUD();
  const small = SW < 700 || SH < 500, p = player;
  if (rampage){ const s = Math.ceil(rampage.t / 60); hudText('RAMPAGE  ' + rampage.kills + ' / ' + rampage.r.need, SW/2, small ? 64 : 52, small ? 18 : 24, '#d23aff', 'center', '900 '); hudText('0:' + String(s).padStart(2, '0'), SW/2, small ? 86 : 80, 18, s < 10 && frame % 30 < 15 ? '#ff5a4a' : '#fff', 'center', '800 '); }
  if (world && p && p.car && sprayT > 0 && sprayT < 90){ cx.fillStyle = 'rgba(0,0,0,.6)'; cx.fillRect(SW/2 - 120, SH*.62, 240, 30); cx.fillStyle = '#5fb7ff'; cx.fillRect(SW/2 - 116, SH*.62 + 22, 232 * sprayT / 90, 4); hudText("BAYOU SHINE · $250", SW/2, SH*.62 + 3, 16, '#5fb7ff', 'center'); }
  // stats line on the full map
  if (showMap){ hudText('PACKAGES ' + world.packages.filter(p=>packagesFound.has(p.id)).length + '/' + (world?.packages.length||0) + '   ·   STUNT JUMPS ' + jumpsDone.size + '/' + DISTRICTS.length*4 + '   ·   RAMPAGES ' + rampagesDone.size + '/' + DISTRICTS.length*3 + '', SW/2, SH - 26, 13, '#f4c355', 'center', '700 '); hudText('$ gun shop   P pay \'n\' spray   R rampage   J stunt jump', SW/2, 14, 12, '#c9d1d4', 'center', '600 '); }
  drawWheel();
};
const _fpHUD = fpHUD;
fpHUD = function(small){
  _fpHUD(small);
  const p = player; if (!world || !p || p.dead) return;
  // world labels for nearby features
  const ox = p.car ? p.car.x : p.x, oy = p.car ? p.car.y : p.y;
  const label = (x, y, h, t, col, maxD) => { const d = dist(ox, oy, x, y); if (d > maxD) return; const pr = project(x, y, h); if (!pr || pr.x < 0 || pr.x > SW || pr.y < 0 || pr.y > SH) return; cx.globalAlpha = clamp(1.4 - d / maxD, 0, 1); hudText(t, pr.x, pr.y, 15, col, 'center', '900 '); hudText(Math.round(d/10) + ' M', pr.x, pr.y + 18, 11, '#f6f3e6', 'center', '700 '); cx.globalAlpha = 1; };
  for (const s of world.shops) label(s.x, s.y, 60, 'BAYOU ARSENAL', '#ff8a3a', 650);
  for (const s of world.sprays) label(s.x, s.y, 54, "BAYOU SHINE", '#5fb7ff', 650);
  for (const r of world.rampages) if (!rampagesDone.has(r.id) && !rampage) label(r.x, r.y, 36, 'RAMPAGE', '#d23aff', 420);
  for (const j of world.jumps) if (!jumpsDone.has(j.id)) label(j.x, j.y, 26, 'STUNT JUMP', '#f6f3e6', 380);
};

// ---------- 3D meshes for the new features ----------
let gtaGroup = null, gtaBuiltFor = null, pkgMeshes = [], rampMeshes = [], jumpMeshes = [], rocketPool = [], throwPool = [], firePool = [], batMesh = null, extraWeap = null;
function buildGtaMeshes(){
  if (gtaGroup){ scene.remove(gtaGroup); gtaGroup.traverse(o => o.geometry && o.geometry.dispose()); }
  gtaGroup = new THREE.Group(); scene.add(gtaGroup); gtaBuiltFor = world; pkgMeshes = []; rampMeshes = []; jumpMeshes = [];
  for (const s of world.shops){
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(90, 22), new THREE.MeshBasicMaterial({ map: signTex('BAYOU ARSENAL', '#1a1a1a', '#ff8a3a', 360, 88) }));
    sign.position.set(s.x, 50, s.B.y + s.B.h + .8); gtaGroup.add(sign);
    const door = box(26, 30, 1.2, lam('#2a1a10', { emissive: 0x401800 })); door.position.set(s.x, 15, s.B.y + s.B.h + .6); gtaGroup.add(door);
  }
  for (const s of world.sprays){
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(100, 22), new THREE.MeshBasicMaterial({ map: signTex("BAYOU SHINE", '#0e2a4a', '#5fb7ff', 400, 88) }));
    sign.position.set(s.x, 52, s.B.y + s.B.h + .8); gtaGroup.add(sign);
    const bay = new THREE.Mesh(new THREE.PlaneGeometry(70, 70).rotateX(-Math.PI/2), new THREE.MeshBasicMaterial({ color: 0x5fb7ff, transparent: true, opacity: .25, depthWrite: false })); bay.position.set(s.x, .8, s.y); gtaGroup.add(bay);
    const garage = box(64, 36, 1.2, lam('#9aa8b4')); garage.position.set(s.x, 18, s.B.y + s.B.h + .5); gtaGroup.add(garage);
  }
  const pkGeo = new THREE.BoxGeometry(7, 7, 7), pkMat = lam('#3cc86e', { emissive: 0x0c3a1a });
  for (const k of world.packages){ const m = new THREE.Mesh(pkGeo, pkMat); m.position.set(k.x, 8, k.y); m.userData.id = k.id; gtaGroup.add(m); pkgMeshes.push(m); }
  const skull = signTex('RAMPAGE', '#2a0a3a', '#d23aff', 200, 60);
  for (const r of world.rampages){ const g = new THREE.Group(); const orb = new THREE.Mesh(new THREE.OctahedronGeometry(7), lam('#d23aff', { emissive: 0x3a0a5a })); orb.position.y = 14; const pl = new THREE.Mesh(new THREE.PlaneGeometry(36, 11), new THREE.MeshBasicMaterial({ map: skull, side: THREE.DoubleSide, transparent: true })); pl.position.y = 28; g.add(orb, pl); g.position.set(r.x, 0, r.y); g.userData.id = r.id; gtaGroup.add(g); rampMeshes.push(g); }
  const rampMat = lam('#c79a3a'), stripe = lam('#1a1a1a');
  for (const j of world.jumps){
    const g = new THREE.Group();
    const L = 46, H = 13, W = 54; const shape = new THREE.Shape(); shape.moveTo(-L/2, 0); shape.lineTo(L/2, 0); shape.lineTo(L/2, H); shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: W, bevelEnabled: false }); geo.translate(0, 0, -W/2);
    const ramp = new THREE.Mesh(geo, rampMat); g.add(ramp);
    for (let s=0;s<3;s++){ const st = box(2, .4, W, stripe); st.position.set(-L/2 + 10 + s*12, (10 + s*12) / L * H + .3, 0); st.rotation.z = Math.atan2(H, L); g.add(st); }
    g.position.set(j.x - Math.cos(j.a) * 20, 0, j.y - Math.sin(j.a) * 20); g.rotation.y = -j.a; g.userData.id = j.id; gtaGroup.add(g); jumpMeshes.push(g);
  }
}
function ensurePools(){
  if (rocketPool.length) return;
  for (let k=0;k<6;k++){ const m = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 9, 8).rotateZ(Math.PI/2), lam('#5a6238', { emissive: 0x201000 })); const f = new THREE.Mesh(new THREE.SphereGeometry(2.2, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffa040 })); f.position.x = -5.5; m.add(f); m.visible = false; scene.add(m); rocketPool.push(m); }
  for (let k=0;k<6;k++){ const m = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.4, 5, 8), lam('#6a8a3a', { emissive: 0x302000 })); m.visible = false; scene.add(m); throwPool.push(m); }
  for (let k=0;k<10;k++){ const m = new THREE.Mesh(new THREE.CircleGeometry(1, 24).rotateX(-Math.PI/2), new THREE.MeshBasicMaterial({ color: 0xff6a1a, transparent: true, opacity: .45, depthWrite: false, blending: THREE.AdditiveBlending })); m.visible = false; scene.add(m); firePool.push(m); }
  // view-model weapons
  extraWeap = {};
  const blk = lam('#1d1e1f'), wood = lam('#6a4428'), olv = lam('#4b5320'), glove = lam('#2b2620'), sleeve = lam('#0d0d0d');
  const arms = g => { const gl = box(2.2, 2.2, 2.6, glove); gl.position.set(.2, -1.6, -6.2); const fl = box(2.4, 2.4, 9, sleeve); fl.rotation.set(.3, .45, 0); fl.position.set(-1.8, -3.4, -2.2); const gr = box(2.2, 2.4, 2.4, glove); gr.position.set(.5, -2.4, 2.2); const fr = box(2.6, 2.6, 10, sleeve); fr.rotation.set(.5, -.25, 0); fr.position.set(1.8, -4.8, 7.2); g.add(gl, fl, gr, fr); };
  let g = new THREE.Group(); const b1 = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, 13, 8), blk); b1.rotation.x = Math.PI/2; b1.position.set(-.5, .3, -7); const b2 = b1.clone(); b2.position.x = .5; const st = box(1.8, 2.6, 7, wood); st.position.set(0, -.6, 3.5); const pump = box(1.9, 1.4, 4, wood); pump.position.set(0, -.6, -6); g.add(b1, b2, st, pump); arms(g); extraWeap.shotgun = g;
  g = new THREE.Group(); const tube = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 20, 12), olv); tube.rotation.x = Math.PI/2; tube.position.set(0, 1.5, -4); const war = new THREE.Mesh(new THREE.ConeGeometry(2.4, 6, 10), lam('#3a4a2a')); war.rotation.x = -Math.PI/2; war.position.set(0, 1.5, -16.5); const grip = box(1, 3, 1.2, blk); grip.position.set(0, -1.2, -1); g.add(tube, war, grip); arms(g); extraWeap.rpg = g;
  g = new THREE.Group(); const bot = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 6, 10), lam('#6a8a3a', { transparent: true, opacity: .85 })); bot.position.set(1, 0, -6); const neck = new THREE.Mesh(new THREE.CylinderGeometry(.6, .8, 3, 8), lam('#6a8a3a')); neck.position.set(1, 4.4, -6); const rag = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffa020 })); rag.position.set(1, 6.4, -6); const hand = box(3, 3, 3, glove); hand.position.set(1, -2.5, -6); const arm = box(2.6, 2.6, 11, sleeve); arm.rotation.set(.4, -.2, 0); arm.position.set(2.4, -5, 1); g.add(bot, neck, rag, hand, arm); g.userData.rag = rag; extraWeap.molotov = g;
  g = new THREE.Group(); const batG = new THREE.CylinderGeometry(.9, .45, 18, 10); const bat = new THREE.Mesh(batG, lam('#b08850')); bat.position.set(0, 8, 0); const hnd = box(2.6, 3, 3, glove); hnd.position.set(0, -.4, 0); const arm2 = box(2.6, 2.6, 10, sleeve); arm2.rotation.set(.6, 0, 0); arm2.position.set(0, -4, 4); g.add(bat, hnd, arm2); extraWeap.bat = g;
  for(const id of ['smg','carbine','pistol','marksman']){
    const m=new THREE.Group(),paint=new THREE.MeshStandardMaterial({color:'#353c41',roughness:.48,metalness:.55}),rifle=id==='carbine'||id==='marksman';
    const part=(w,h,d,x,y,z,mat)=>{const o=box(w,h,d,mat);o.position.set(x,y,z);m.add(o);return o;};
    part(1.9,2.2,rifle?8:5,0,0,0,paint);part(1.4,2,3,0,-.5,rifle?6:4,blk);
    part(.9,3.2,1.7,0,-2,1,blk);part(.9,3,2,0,-2.2,-1.5,paint);
    const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,rifle?10:5,10),blk);barrel.rotation.x=Math.PI/2;barrel.position.set(0,.4,rifle?-8:-5);m.add(barrel);
    part(1.5,.6,4,0,1.4,-1,blk);
    for(let j=0;j<5;j++)part(1.65,.16,.22,0,1.8,-3+j*.55,blk);
    for(const side of [-1,1]){part(.12,.8,3,side*1.03,.1,-1,paint);for(let j=0;j<3;j++)part(.14,.24,.35,side*1.12,.3,-2+j*.7,blk);}
    const muzzleBrake=new THREE.Mesh(new THREE.CylinderGeometry(.43,.43,1.4,16),paint);muzzleBrake.rotation.x=Math.PI/2;muzzleBrake.position.set(0,.4,rifle?-13:-7.6);m.add(muzzleBrake);
    part(.5,1,.5,0,1.7,rifle?-12:-7,blk);
    const sight=new THREE.Mesh(new THREE.TorusGeometry(.65,.13,6,16),blk);sight.position.set(0,2,-1);m.add(sight);if(id==='pistol'){
      for(const o of [...m.children]){m.remove(o);o.geometry.dispose();}
      part(1.6,1.2,5,0,.6,-1.4,paint);const handle=part(1.4,3,1.8,0,-1.5,.4,blk);handle.rotation.x=-.18;
      const muzzle=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,4.5,14),blk);muzzle.rotation.x=Math.PI/2;muzzle.position.set(0,.65,-1.7);m.add(muzzle);
      part(1.4,.2,.3,0,1.35,.5,blk);part(.3,.3,.3,0,1.4,-3.5,blk);
      for(let j=0;j<4;j++)part(1.68,.55,.1,0,.7,-.1+j*.25,blk);
    }
    arms(m);
    if(id==='pistol'){part(1.6,.7,5,0,1,-1.8,paint);part(1.3,1.2,.3,0,-1.6,1,blk);}
    if(id==='marksman'){const scope=new THREE.Mesh(new THREE.CylinderGeometry(.8,.8,5,16),blk);scope.rotation.x=Math.PI/2;scope.position.set(0,2.6,0);m.add(scope);part(1,1.3,.6,0,1.7,-2,paint);part(1,1.3,.6,0,1.7,2,paint);part(1,.4,5,0,2,-7,paint);}
    m.userData.finishMaterial=paint;extraWeap[id]=m;
  }
  const ice=new THREE.Group();const ball=new THREE.Mesh(new THREE.SphereGeometry(2.3,16,12),new THREE.MeshStandardMaterial({color:'#d3f4ff',roughness:.35}));ball.position.set(1,0,-5);ice.add(ball);arms(ice);extraWeap.snowball=ice;
  for (const k in extraWeap){ extraWeap[k].scale.setScalar(k === 'rpg' ? .4 : .55); extraWeap[k].visible = false; vmScene.add(extraWeap[k]); }
}
function syncGta(){
  if (!scene) return;
  ensurePools();
  if (world && gtaBuiltFor !== world) buildGtaMeshes();
  if (gtaGroup) gtaGroup.visible = state !== 'menu' && !!world;
  for (const m of pkgMeshes){ m.visible = !packagesFound.has(m.userData.id); m.rotation.y = frame * .04; m.position.y = 8 + Math.sin(frame * .06 + m.position.x) * 1.5; }
  for (const g of rampMeshes){ g.visible = !rampagesDone.has(g.userData.id) && !rampage; g.children[0].rotation.y = frame * .05; g.children[1].lookAt(camera.position.x, g.children[1].getWorldPosition(new THREE.Vector3()).y, camera.position.z); }
  for (const g of jumpMeshes) g.visible = true;
  let i = 0; for (const r of rockets){ if (i >= rocketPool.length) break; const m = rocketPool[i++]; m.visible = true; m.position.set(r.x, r.h, r.y); m.rotation.set(0, -Math.atan2(r.vy, r.vx), 0); } for (; i < rocketPool.length; i++) rocketPool[i].visible = false;
  i = 0; for (const t of throws){ if (i >= throwPool.length) break; const m = throwPool[i++]; m.visible = true; m.position.set(t.x, t.h || 14, t.y); m.rotation.set(t.t * .4, 0, t.t * .3); } for (; i < throwPool.length; i++) throwPool[i].visible = false;
  i = 0; for (const f of fires){ if (i >= firePool.length) break; const m = firePool[i++]; m.visible = true; m.position.set(f.x, .9, f.y); m.scale.setScalar(f.r * (.9 + Math.sin(frame * .3 + f.x) * .06)); m.material.opacity = Math.min(.5, f.t / 60 * .5); } for (; i < firePool.length; i++) firePool[i].visible = false;
  // view model swap
  const p = player, show = state !== 'menu' && p && !p.dead && !view.chase;
  const firingInCar = p && p.car && (mouse.down || keys['f'] || keys['j'] || touch.shoot);
  const useExtra = show && curW !== 'm240' && (!p.car || firingInCar) && !(p.car && curW === 'bat');
  if (useExtra) gun.visible = false;
  for (const k in extraWeap){
    const m = extraWeap[k]; if(m.userData.finishMaterial)m.userData.finishMaterial.color.set(window.level29Trading?.color||'#353c41'); m.visible = !!(useExtra && k === curW); if (!m.visible) continue;
    const moving = !p.car && Math.hypot(p.vx, p.vy) > .4, bobX = moving ? Math.sin(p.anim * .5) * .35 : 0, bobY = moving ? -Math.abs(Math.cos(p.anim * .5)) * .3 : 0;
    if (k === 'bat'){ const s = batSwing / 14; m.position.set(4.5 + bobX - s * 6, -5 + bobY + s * 2, -10); m.rotation.set(-.3 - s * .4, 0, -.5 + s * 1.8); }
    else { m.position.set((k === 'rpg' ? 5.2 : 4.2) + bobX, (k === 'rpg' ? -3.6 : -4.4) + bobY, -12 + view.kick * .8); m.rotation.set(view.kick * .06, 0, 0); }
    if (k === 'molotov') m.userData.rag.scale.setScalar(.8 + Math.random() * .5);
  }
}
const _render = render;
render = function(){ if (renderer) syncGta(); _render(); };

// ---------- Boot ----------
travelToMenu();
requestAnimationFrame(loop);
window.render_game_to_text = () => JSON.stringify({ state, district: D.name, mission: mission && { n: mission.info.i+1, type: mission.info.type, phase: mission.phase, step: mission.step, kills: mission.kills, need: mission.need }, player: player && { x: Math.round(player.x), y: Math.round(player.y), hp: Math.round(player.hp), armor: Math.round(player.armor), inCar: !!player.car, carZ: player.car ? +(player.car.z || 0).toFixed(1) : 0, yaw: +view.yaw.toFixed(2) }, weapon: curW, arsenal: Object.fromEntries(Object.entries(arsenal).map(([k, v]) => [k, v === Infinity ? 'inf' : v])), view: { chase: view.chase, mode: lightMode }, zombies: zombies.length, traffic: cars.filter(c => c.ai && !c.dead).length, cash, heat: +heat.toFixed(2), boss: boss && { hp: Math.round(boss.hp), dead: boss.dead }, rampage: rampage && { kills: rampage.kills, need: rampage.r.need, t: Math.ceil(rampage.t/60) }, packages: packagesFound.size, jumps: jumpsDone.size, rampagesDone: rampagesDone.size, radio: RADIO[radioIdx] && RADIO[radioIdx][0], cheats: cheatFlags });
window.__dc = { get player(){ return player; }, get mission(){ return mission; }, get cars(){ return cars; }, get boss(){ return boss; }, get zombies(){ return zombies; }, startGame, enterExit, get state(){ return state; }, set mission(v){ mission = v; }, beginMission, setMission(i){ missionIdx = i; placeMissionStart(); }, get city(){ return city; }, get music(){ return mus.name; }, get vo(){ return Object.keys(voBufs).length; }, get up(){ return up; }, view, get info(){ return renderer && renderer.info.render; }, get world(){ return world; }, applyCheat, selectW, giveW, set cash(v){ cash = v; } };
