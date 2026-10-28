// ===================== Blood in the Bayou · Co-op multiplayer =====================
// Peer-to-peer over WebRTC (PeerJS). One player hosts and runs the world (zombies,
// bosses, missions, Ronniebaby). Friends join with a 4-letter room code; they send
// their position + shots to the host and render the host's world from snapshots.
// Works on any static host (pplx.app, Vercel) with no game server.

const MP = { peer: null, conns: new Map(), code: '', name: 'JESTER', myId: 'host', remotes: new Map(), others: [], zmap: new Map(), pkRefs: [], hostConn: null, status: '', lastShotSnd: 0, avatars: new Map() };
const MP_PREFIX = 'bitb29-room-';
const MP_ICE = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478' }] };
const MP_COLORS = ['#b66cff', '#3cc86e', '#ff9b2a', '#5fb7ff', '#ff5a8a', '#f4c355'];
function mpCode(){ const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 4; i++) s += A[Math.floor(Math.random() * A.length)]; return s; }
function mpColor(id){ let h = 0; for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return MP_COLORS[h % MP_COLORS.length]; }
// Never queue stale state behind a congested WebRTC channel.
function mpCanSend(c,statePacket){return !!(c&&c.open&&(!statePacket||(((c.dataChannel&&c.dataChannel.bufferedAmount)||0)<65536&&(c.bufferSize||0)<4)));}
function mpSendAll(msg, except){ for (const [id, c] of MP.conns) if (id !== except && mpCanSend(c,msg.t==='s')) { try { c.send(msg); } catch(e){} } }
function mpSendHost(msg){ const c = MP.hostConn; if (mpCanSend(c,msg.t==='st')) { try { c.send(msg); } catch(e){} } }
const r1 = v => Math.round(v * 10) / 10, r2 = v => Math.round(v * 100) / 100;

// ---------- Menu UI ----------
const mpEl = document.createElement('div'); mpEl.id = 'mp'; document.body.appendChild(mpEl);
const mpBtn = document.createElement('button'); mpBtn.id = 'mpbtn'; mpBtn.textContent = 'MULTIPLAYER';
document.querySelector('#menu .row').appendChild(mpBtn);
mpBtn.addEventListener('click', () => openMP());
function openMP(){
  mpEl.innerHTML = '<div class="sbox mpbox"><div class="eyebrow">LEVEL 29 · CO-OP</div><h2>Multiplayer</h2>' +
    '<p class="mpdesc">Team up with friends in the same city. The host runs the world and leads the missions. Everyone fights the same horde.</p>' +
    '<label class="mpl">YOUR NAME<input id="mpName" maxlength="12" value="' + MP.name + '" autocomplete="off"></label>' +
    '<div class="mpcols"><div><b>HOST</b><span>Start a room in the Level 29 city and share the code.</span><button class="go" id="mpHost">HOST A GAME</button></div>' +
    '<div><b>JOIN</b><span>Type the 4-letter code a friend sent you.</span><div class="mpjoin"><input id="mpCodeIn" maxlength="4" placeholder="CODE" autocomplete="off"><button class="go" id="mpJoin">JOIN</button></div></div></div>' +
    '<p class="mpstatus" id="mpStatus">' + (MP.status || '') + '</p><div class="acts"><button id="mpClose">BACK · ESC</button></div></div>';
  mpEl.style.display = 'flex';
  const nameIn = document.getElementById('mpName'), codeIn = document.getElementById('mpCodeIn');
  for (const el of [nameIn, codeIn]) el.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter' && el === codeIn) mpJoin(codeIn.value); if (e.key === 'Escape') closeMP(); });
  codeIn.addEventListener('input', () => { codeIn.value = codeIn.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); });
  document.getElementById('mpHost').onclick = () => mpHost();
  document.getElementById('mpJoin').onclick = () => mpJoin(codeIn.value);
  document.getElementById('mpClose').onclick = closeMP;
}
function closeMP(){ mpEl.style.display = 'none'; }
function mpSetStatus(t, bad){ MP.status = t; const s = document.getElementById('mpStatus'); if (s){ s.textContent = t; s.classList.toggle('bad', !!bad); } }
function mpReadName(){ const n = document.getElementById('mpName'); MP.name = ((n && n.value) || 'JESTER').toUpperCase().replace(/[^A-Z0-9 _-]/g, '').slice(0, 12) || 'JESTER'; }
function mpReset(){ try { MP.peer && MP.peer.destroy(); } catch(e){} MP.peer = null; MP.conns.clear(); MP.remotes.clear(); mpRemotes = []; MP.hostConn = null; MP.others = []; MP.pending=null; MP.zmap.clear(); MP.pkRefs=[]; MP.lastNet=0; mpRole=null; }

// ---------- Hosting ----------
function mpHost(tries){
  if (typeof Peer === 'undefined'){ mpSetStatus('Multiplayer could not load. Check your connection and reload.', true); return; }
  mpReadName(); mpReset(); tries = tries || 0;
  const code = mpCode();
  mpSetStatus('Opening room...');
  const peer = new Peer(MP_PREFIX + code, { debug: 0, config: MP_ICE }); MP.peer = peer;
  peer.on('open', () => {
    MP.code = code; MP.myId = 'host'; mpRole = 'host';
    closeMP(); startGame(+document.getElementById('district').value);
    banner = { big: 'ROOM ' + code, small: 'SEND THIS CODE TO YOUR CREW · THEY PICK MULTIPLAYER > JOIN', t: 420 };
  });
  peer.on('connection', conn => mpHostConn(conn));
  peer.on('error', e => {
    if (e.type === 'unavailable-id' && tries < 4) return mpHost(tries + 1);
    if (mpRole === 'host' && state !== 'menu') toast('MULTIPLAYER: ' + (e.type || 'error').toUpperCase());
    else mpSetStatus('Could not open a room (' + (e.type || 'network') + '). Try again.', true);
  });
  peer.on('disconnected', () => { try { peer.reconnect(); } catch(e){} });
}
function mpHostConn(conn){
  conn.on('open', () => {
    if (MP.conns.size >= 5){ conn.send({ t: 'full' }); setTimeout(() => conn.close(), 300); return; }
    const id = conn.peer;
    MP.conns.set(id, conn);
    MP.remotes.set(id, { id, name: (conn.metadata && conn.metadata.name) || 'JESTER', x: player.x, y: player.y, a: 0, dead: false, car: null, safe: true, conn, anim: 0, lastSeen:performance.now() });
    mpRemotes = [...MP.remotes.values()];
    conn.send({ t: 'welcome', id, di: distIdx, mi: missionIdx, code: MP.code, host: MP.name });
    toast(MP.remotes.get(id).name + ' JOINED THE ROOM'); sfx('tune');
    mpSendAll({ t: 'msg', txt: MP.remotes.get(id).name + ' JOINED THE ROOM' }, id);
  });
  conn.on('data', d => mpHostData(conn.peer, d));
  conn.on('close', () => mpDrop(conn.peer));
  conn.on('error', () => mpDrop(conn.peer));
}
function mpDrop(id){
  const r = MP.remotes.get(id); if (!r) return;
  MP.remotes.delete(id); MP.conns.delete(id); mpRemotes = [...MP.remotes.values()];
  toast(r.name + ' LEFT THE ROOM'); mpSendAll({ t: 'msg', txt: r.name + ' LEFT THE ROOM' });
}
function mpHostData(id, d){
  const r = MP.remotes.get(id); if (!r || !d) return;
  r.lastSeen=performance.now();
  if (d.t === 'st'){
    if(!Number.isFinite(d.x)||!Number.isFinite(d.y)||!Number.isFinite(d.a))return;
    if(d.c&&(!Array.isArray(d.c)||!CAR_SPECS[d.c[0]]||!d.c.slice(2,6).every(Number.isFinite)))return;
    r.name = d.n || r.name; r.dead = !!d.dead; r.safe = !!d.safe; r.hp = d.hp; r.a = d.a;
    r.height=Number.isFinite(d.h)?clamp(d.h,0,600):0;
    if (d.c){ r.car = { type: d.c[0], col: d.c[1], x: d.c[2], y: d.c[3], a: d.c[4], v: d.c[5], z: d.c[6] || 0 }; r.x = r.car.x; r.y = r.car.y; }
    else { r.car = null; r.x = d.x; r.y = d.y; }
  } else if (d.t === 'b'){
    if(!Array.isArray(d.l)||d.l.length>24)return;
    for (const q of d.l) if(Array.isArray(q)&&q.slice(0,6).every(Number.isFinite))bullets.push({ x: q[0], y: q[1], vx: q[2], vy: q[3], life: Math.min(120,q[4]), dmg: Math.min(100,q[5]), pierce: q[6], hit: new Set(), owner: id, mpS: 1 });
    mpSendAll(d, id); mpShotSound(d.l[0]);
  } else if (d.t === 'rk'){
    if(!Array.isArray(d.l)||d.l.length>8)return;
    for (const q of d.l) if(Array.isArray(q)&&q.slice(0,6).every(Number.isFinite))rockets.push({ x: q[0], y: q[1], vx: q[2], vy: q[3], life: Math.min(180,q[4]), h: q[5], owner: id, mpS: 1 });
    mpSendAll(d, id);
  } else if (d.t === 'th'){
    if(!Array.isArray(d.l)||d.l.length>8)return;
    for (const q of d.l) if(Array.isArray(q)&&q.slice(0,5).every(Number.isFinite))throws.push({ x: q[0], y: q[1], sx: q[0], sy: q[1], tx: q[2], ty: q[3], t: 0, T: Math.max(1,Math.min(180,q[4])), owner: id, mpS: 1 });
    mpSendAll(d, id);
  } else if (d.t === 'mel'){
    if(![d.x,d.y,d.a,d.dmg].every(Number.isFinite))return;
    for (const z of zombies){ if (!z.alive) continue; const dd = dist(d.x, d.y, z.x, z.y); if (dd < 46 + z.r && Math.abs(angDiff(d.a, Math.atan2(z.y - d.y, z.x - d.x))) < .9){ z.hp -= Math.min(25,d.dmg); z.flash = 5; z.stun = 30; z.lastHit = id; moveCircle(z, Math.cos(d.a)*18, Math.sin(d.a)*18, z.r*.8); if (z.hp <= 0) killZombie(z, Math.cos(d.a)*6, Math.sin(d.a)*6); } }
    if (boss && !boss.dead && dist(d.x, d.y, boss.x, boss.y) < 60 + boss.r) damageBoss(4);
  } else if (d.t === 'take'){
    if (mission && mission.phase === 'start'){
      if (state === 'talk') closeRonnie();
      ronnie.active = false; toast(r.name + ' TOOK THE JOB'); beginMission();
    }
  } else if (d.t === 'pick'){
    let best = null, bd = 60; for (const k of pickups){ if (k.kind !== d.k) continue; const dd = dist(k.x, k.y, d.x, d.y); if (dd < bd){ bd = dd; best = k; } }
    if (best) best.got = true;
  } else if (d.t === 'die'){
    toast(r.name + ' GOT WASTED'); mpSendAll({ t: 'msg', txt: r.name + ' GOT WASTED' }, id);
  }
}
function mpHurtRemote(r, n, sx, sy){ if (r.conn && r.conn.open) try { r.conn.send({ t: 'h', n, sx: Math.round(sx), sy: Math.round(sy) }); } catch(e){} }

function mpSnapshot(){
  const pl = [{ i: 'host', n: MP.name, x: Math.round(player.car ? player.car.x : player.x), y: Math.round(player.car ? player.car.y : player.y), h:Math.round(terrainHeight(player.x,player.y)), a: r2(player.car ? player.car.a : player.aim), d: player.dead ? 1 : 0, c: player.car ? [player.car.type, player.car.col, Math.round(player.car.x), Math.round(player.car.y), r2(player.car.a), Math.round(player.car.z || 0)] : 0 }];
  for (const r of MP.remotes.values()) pl.push({ i: r.id, n: r.name, x: Math.round(r.x), y: Math.round(r.y), h:r.height||0, a: r2(r.a || 0), d: r.dead ? 1 : 0, c: r.car ? [r.car.type, r.car.col, Math.round(r.car.x), Math.round(r.car.y), r2(r.car.a), Math.round(r.car.z || 0)] : 0 });
  const m = mission;
  return {
    t: 's', di: distIdx, mi: missionIdx, obj: objective, heat: r1(heat),
    z: zombies.filter(z => z.alive).map(z => [z.id, Math.round(z.x), Math.round(z.y), r2(z.a), z.type[0], z.fem ? 1 : 0, z.flash > 0 ? 1 : 0, z.shirt, z.military ? 1 : 0, r2(z.v), z.alert ? 1 : 0]),
    b: boss ? { x: Math.round(boss.x), y: Math.round(boss.y), a: r2(boss.a), hp: r1(boss.hp), maxHp: boss.maxHp, mode: boss.mode, t: boss.t, name: boss.name, final: boss.final, flash: boss.flash, dead: boss.dead, deadT: boss.deadT, r: boss.r } : 0,
    m: m ? { i: m.info.i, ph: m.phase, st: m.start, tg: m.targets, dr: m.drop, sp: m.step, tm: m.timer, nd: m.need, k: m.kills, ck: m.cks, ci: m.ckIdx, ht: m.holdT, sd: m.started, ex:m.extra||null, si:m.si||0, os:m.opStops?m.opStops.map(s=>({id:s.id,vi:city.venues.indexOf(s.v)})):null, rv:m.robVenue?city.venues.indexOf(m.robVenue):-1 } : 0,
    rb: [Math.round(ronnie.x || 0), Math.round(ronnie.y || 0), ronnie.active ? 1 : 0],
    sv: survivors.map(s => [Math.round(s.x), Math.round(s.y), s.following ? 1 : 0, s.inCar ? 1 : 0, s.shirt, s.hp]),
    pk: pickups.filter(k => !k.got && (!k.expiresAt||k.expiresAt>Date.now())).map(k => [Math.round(k.x), Math.round(k.y), k.kind, k.amt || 0, k.t||0, k.expiresAt?Math.max(0,k.expiresAt-Date.now()):null]),
    pl
  };
}

// ---------- Joining ----------
function mpJoin(code){
  code = String(code || '').toUpperCase().trim();
  if (code.length !== 4){ mpSetStatus('Room codes are 4 letters or numbers.', true); return; }
  if (typeof Peer === 'undefined'){ mpSetStatus('Multiplayer could not load. Check your connection and reload.', true); return; }
  mpReadName(); mpReset();
  mpSetStatus('Connecting to room ' + code + '...');
  const peer = new Peer(undefined, { debug: 0, config: MP_ICE }); MP.peer = peer;
  let joined = false;
  const fail = setTimeout(() => { if (!joined){ mpSetStatus('Could not reach room ' + code + '. Check the code and that the host is still in the game.', true); mpReset(); } }, 15000);
  peer.on('open', () => {
    const conn = peer.connect(MP_PREFIX + code, { reliable: true, serialization: 'json', metadata: { name: MP.name } });
    MP.hostConn = conn;
    conn.on('data', d => { if (d && d.t === 'welcome'){ joined = true; clearTimeout(fail); } mpClientData(d); });
    conn.on('close', () => mpHostGone());
    conn.on('error', () => mpHostGone());
  });
  peer.on('error', e => {
    if (e.type === 'peer-unavailable'){ clearTimeout(fail); mpSetStatus('No room called ' + code + '. Check the code with your host.', true); mpReset(); }
    else if (!joined){ mpSetStatus('Connection problem (' + (e.type || 'network') + '). Try again.', true); }
  });
}
function mpHostGone(){
  if (mpRole !== 'client') return;
  mpRole = null; MP.hostConn = null; MP.others = []; MP.zmap.clear();
  banner = { big: 'HOST LEFT', small: 'YOU ARE PLAYING SOLO NOW', t: 260, bad: true };
  boss = null; survivors = [];
  for (const z of zombies) z.alert = true;
  if (state === 'talk') closeRonnie();
  placeMissionStart();
}
function mpClientData(d){
  if (!d) return;
  if (d.t === 'welcome'){
    MP.myId = d.id; MP.code = d.code; mpRole = 'client';
    closeMP(); startGame(d.mi);
    zombies = []; MP.zmap.clear(); pickups = [];
    banner = { big: 'ROOM ' + d.code, small: 'YOU JOINED ' + (d.host || 'THE HOST') + ' · THE HOST LEADS THE MISSIONS', t: 300 };
  } else if (d.t === 'full'){ mpSetStatus('That room is full (6 players max).', true); mpReset(); }
  else if (d.t === 's') { if(Array.isArray(d.z)&&d.z.length<=1200&&Array.isArray(d.pk)&&Array.isArray(d.pl))MP.pending=d; }
  else if (d.t === 'h'){ if (state === 'play') hurtPlayer(d.n, d.sx, d.sy); }
  else if (d.t === 'pts'){ cash += d.amt; }
  else if (d.t === 'b'){ for (const q of d.l) bullets.push({ x: q[0], y: q[1], vx: q[2], vy: q[3], life: q[4], dmg: 0, pierce: 0, hit: new Set(), owner: 'x', mpS: 1 }); mpShotSound(d.l[0]); }
  else if (d.t === 'rk'){ for (const q of d.l) rockets.push({ x: q[0], y: q[1], vx: q[2], vy: q[3], life: q[4], h: q[5], mpS: 1 }); }
  else if (d.t === 'th'){ for (const q of d.l) throws.push({ x: q[0], y: q[1], sx: q[0], sy: q[1], tx: q[2], ty: q[3], t: 0, T: q[4], mpS: 1 }); }
  else if (d.t === 'pass'){
    cash += d.amt; sfx('pass');
    banner = { big: 'MISSION PASSED', small: '+$' + d.amt.toLocaleString() + ' · TEAM REWARD', t: 240, good: true };
    setTimeout(() => { if (state === 'play'){ subtitle = { name: 'RONNIEBABY · PHONE', txt: d.boss ? RB_TEXT.rb_passboss : RB_TEXT['rb_pass_' + (d.n % 4)], t: 260 }; rbSay(d.boss ? 'rb_passboss' : 'rb_pass_' + (d.n % 4)); } }, 2600);
  }
  else if (d.t === 'fail'){ sfx('fail'); banner = { big: 'MISSION FAILED', small: d.reason || '', t: 220, bad: true }; }
  else if (d.t === 'boom'){ /* explosion visuals come from relayed rockets */ }
  else if (d.t === 'msg') toast(d.txt);
}
function mpApply(s){
  if (s.di !== distIdx){ travelTo(s.di); zombies = []; MP.zmap.clear(); }
  missionIdx = s.mi; heat = s.heat;
  objective = s.obj;
  // zombies
  const seen = new Set();
  for (const q of s.z){
    let z = MP.zmap.get(q[0]);
    const type = q[4] === 'b' ? 'brute' : q[4] === 'r' ? 'runner' : 'walker';
    if (!z){ z = makeZombie(q[1], q[2], type); z.id = q[0]; z.fem = !!q[5]; z.shirt = q[7]; z.military = !!q[8]; z.v = q[9]; z.a = q[3]; MP.zmap.set(z.id, z); }
    z.tx = q[1]; z.ty = q[2]; z.ta = q[3]; if (q[6]) z.flash = 4; z.alert = !!q[10]; z.alive = true;
    seen.add(z.id);
  }
  for (const [id, z] of MP.zmap) if (!seen.has(id)){
    MP.zmap.delete(id);
    const px = player.car ? player.car.x : player.x, py = player.car ? player.car.y : player.y;
    if (dist(z.x, z.y, px, py) < 1400) mpFakeKill(z);
  }
  zombies = [...MP.zmap.values()];
  // boss
  if (s.b){
    if (!boss){ boss = { spec: BOSSES[D.id], anim: 0, vx: 0, vy: 0, x: s.b.x, y: s.b.y }; snd('roar'); setTimeout(() => bossSay(0, true), 300); }
    const b = s.b; boss.tx = b.x; boss.ty = b.y; boss.a = b.a; boss.hp = b.hp; boss.maxHp = b.maxHp; boss.mode = b.mode; boss.t = b.t; boss.name = b.name; boss.final = b.final; boss.flash = b.flash; boss.dead = b.dead; boss.deadT = b.deadT; boss.r = b.r;
  } else if (boss){ boss = null; stopBossVoice(); }
  // mission
  if (s.m){
    const was = mission ? mission.phase : null;
    if (!mission || mission.info.i !== s.m.i) mission = { info: missionInfo(s.m.i), outT: 0 };
    const m = mission, q = s.m;
    m.phase = q.ph; m.start = q.st; m.targets = q.tg || []; m.drop = q.dr; m.step = q.sp; m.timer = q.tm; m.need = q.nd; m.kills = q.k; m.cks = q.ck; m.ckIdx = q.ci; m.holdT = q.ht; m.started = q.sd; m.extra=q.ex||null;
    // Clients need the venue references too: missing operation/robbery state used to throw in every render.
    m.si=q.si||0;m.opStops=q.os?q.os.map(s=>({id:s.id,v:city.venues[s.vi]})).filter(s=>s.v):[];
    m.robVenue=q.rv>=0?city.venues[q.rv]:null;
    if (was === 'start' && m.phase === 'active'){ sfx('missionstart'); banner = { big: m.info.title.toUpperCase(), small: 'MISSION ' + (m.info.i + 1) + ' / ' + CAMPAIGN_TOTAL + ' · ' + D.name, t: 220 }; if (state === 'talk') closeRonnie(); }
    if (m.phase === 'start') objective = 'Meet Ronniebaby for mission ' + (m.info.i + 1) + '. He is marked RB on your map.';
  } else mission = null;
  ronnie.x = s.rb[0]; ronnie.y = s.rb[1]; ronnie.active = !!s.rb[2];
  // survivors
  survivors = s.sv.map((q, i) => { const o = survivors[i] || { anim: 0 }; return Object.assign(o, { x: q[0], y: q[1], following: !!q[2], inCar: !!q[3], shirt: q[4], hp: q[5] }); });
  // pickups (health, armor, cash are collectable by anyone; crates and power-ups belong to the host)
  pickups = s.pk.filter(q => q[2] !== 'power').map(q => ({ x: q[0], y: q[1], kind: q[2], amt: q[3], t: q[4]||0, expiresAt:q[5]==null?undefined:Date.now()+q[5] }));
  MP.pkRefs = pickups.slice();
  MP.others = s.pl.filter(p => p.i !== MP.myId);
}
function mpFakeKill(z){
  z.alive = false; snd('zdie'); zombieSay(z, true);
  gore(z.x, z.y, 10); decal(z.x, z.y, Math.random() < .5 ? 'blood' : 'green', z.type === 'brute' ? 1.6 : 1);
  parts.push({ k: 'corpse', x: z.x, y: z.y, a: z.a, t: 600, shirt: z.shirt, military: z.military, r: z.r, vx: 0, vy: 0 });
}
function mpShotSound(q){
  if (!q || frame - MP.lastShotSnd < 4) return; MP.lastShotSnd = frame;
  const px = player.car ? player.car.x : player.x, py = player.car ? player.car.y : player.y;
  if (dist(q[0], q[1], px, py) < 700) snd('shot');
}

// ---------- Game hooks ----------
// Zombie ids so snapshots can track them.
let mpZid = 0;
const _mkZombieMP = makeZombie;
makeZombie = function(x, y, type){ const z = _mkZombieMP(x, y, type); z.id = ++mpZid; return z; };

// Client: the host owns kills, boss damage, mission starts, and mission placement.
const _killZMP = killZombie;
killZombie = function(z, vx, vy){
  if (mpRole === 'client') return; // host decides; the snapshot removes it
  const owner = z.lastHit, before = cash;
  _killZMP(z, vx, vy);
  if (mpRole === 'host' && owner && MP.remotes.has(owner)){
    cash = before; const r = MP.remotes.get(owner);
    if (r.conn && r.conn.open) try { r.conn.send({ t: 'pts', amt: z.pts || 25 }); } catch(e){}
  }
};
const _dmgBossMP = damageBoss;
damageBoss = function(n){ if (mpRole === 'client'){ if (boss) boss.flash = 4; return; } _dmgBossMP(n); };
const _placeMP = placeMissionStart;
placeMissionStart = function(){ if (mpRole === 'client') return; _placeMP(); };
const _beginMP = beginMission;
beginMission = function(){
  if (mpRole === 'client'){ ronnie.active = false; mpSendHost({ t: 'take' }); toast('TELLING THE HOST YOU TOOK THE JOB'); return; }
  _beginMP();
};
const _passMP = passMission;
passMission = function(){
  const info = mission && mission.info;
  _passMP();
  if (mpRole === 'host' && info) mpSendAll({ t: 'pass', amt: 500 + info.i * 120 + (info.isBoss ? 2500 : 0), boss: !!info.isBoss, n: info.i });
};
const _failMP = failMission;
failMission = function(reason){ const was = mission && mission.phase; _failMP(reason); if (mpRole === 'host' && was === 'active') mpSendAll({ t: 'fail', reason }); };
const _killPMP = killPlayer;
killPlayer = function(){ const was = player.dead; _killPMP(); if (!was && mpRole === 'client') mpSendHost({ t: 'die' }); if (!was && mpRole === 'host') mpSendAll({ t: 'msg', txt: MP.name + ' GOT WASTED' }); };

// Melee on clients is sent to the host.
const _fireMP = fireWeapon;
fireWeapon = function(ox, oy, aim){
  _fireMP(ox, oy, aim);
  if (mpRole === 'client' && curW === 'bat' && !player.car) mpSendHost({ t: 'mel', x: Math.round(ox), y: Math.round(oy), a: r2(aim), dmg: 3.2 + up.ap });
};

// Per-frame: send, receive, interpolate, splats.
const _updMP = update;
update = function(){
  if(mpRole==='client'&&MP.pending){const s=MP.pending;MP.pending=null;mpApply(s);}
  if (mpRole && state === 'pause') state = 'play'; // no pausing a shared world
  if (mpRole === 'host' && (state === 'talk' || state === 'shop' || state === 'cheat') && player) player.inv = Math.max(player.inv, 30);
  _updMP();
  if (!mpRole || state === 'menu') return;
  // new projectiles fired locally -> everyone else
  const nb = [], nr = [], nt = [];
  for (const b of bullets) if (!b.mpS){ b.mpS = 1; nb.push([r1(b.x), r1(b.y), r2(b.vx), r2(b.vy), b.life, r2(b.dmg), b.pierce]); }
  for (const r of rockets) if (!r.mpS){ r.mpS = 1; nr.push([r1(r.x), r1(r.y), r2(r.vx), r2(r.vy), r.life, r.h]); }
  for (const t of throws) if (!t.mpS){ t.mpS = 1; nt.push([r1(t.sx), r1(t.sy), r1(t.tx), r1(t.ty), t.T]); }
  const send = mpRole === 'host' ? (m => mpSendAll(m)) : mpSendHost;
  if (nb.length) send({ t: 'b', l: nb }); if (nr.length) send({ t: 'rk', l: nr }); if (nt.length) send({ t: 'th', l: nt });
  if (mpRole === 'host'){
    for(const [id,r]of MP.remotes)if(performance.now()-(r.lastSeen||0)>15000){try{r.conn.close();}catch(_){}mpDrop(id);}
    // remote cars run zombies over
    for (const r of MP.remotes.values()){
      if (!r.car || Math.abs(r.car.v || 0) < 2.2 || (r.car.z || 0) > 8) continue;
      const cr = (CAR_SPECS[r.car.type] || CAR_SPECS.sedan).len * .42;
      for (const z of zombies) if (z.alive && dist(z.x, z.y, r.car.x, r.car.y) < cr + z.r - 2 && !(z.type === 'brute' && Math.abs(r.car.v) < 4.5)){ z.lastHit = r.id; killZombie(z, Math.cos(r.car.a) * r.car.v, Math.sin(r.car.a) * r.car.v); }
    }
    if (performance.now()-(MP.lastNet||0)>=100 && MP.conns.size && [...MP.conns.values()].some(c=>mpCanSend(c,true))){ MP.lastNet=performance.now();mpSendAll(mpSnapshot()); }
    MP.others = [...MP.remotes.values()].map(r => ({ i: r.id, n: r.name, x: r.x, y: r.y, h:r.height||0, a: r.a || 0, d: r.dead ? 1 : 0, c: r.car ? [r.car.type, r.car.col, r.car.x, r.car.y, r.car.a, r.car.z || 0] : 0 }));
  } else {
    // smooth the host's world between snapshots
    for (const z of zombies){ if (z.tx == null) continue; const dx = z.tx - z.x, dy = z.ty - z.y, dd = Math.hypot(dx, dy); if (dd > 120){ z.x = z.tx; z.y = z.ty; } else { z.x += dx * .25; z.y += dy * .25; } z.a = z.ta; z.anim += Math.min(1.6, dd * .06 + .02) * .5; if (z.flash > 0) z.flash--; }
    if (boss && boss.tx != null){ boss.x += (boss.tx - boss.x) * .25; boss.y += (boss.ty - boss.y) * .25; boss.anim = (boss.anim || 0) + .12; if (boss.flash > 0) boss.flash--; }
    for (const k of MP.pkRefs) if (k.got){ k.got = false; k.sent = true; mpSendHost({ t: 'pick', x: k.x, y: k.y, k: k.kind }); }
    MP.pkRefs = MP.pkRefs.filter(k => !k.sent);
    if (performance.now()-(MP.lastNet||0)>=100){ MP.lastNet=performance.now();
      const p = player, c = p.car;
      mpSendHost({ t: 'st', n: MP.name, x: Math.round(p.x), y: Math.round(p.y), h:Math.round(terrainHeight(p.x,p.y)), a: r2(c ? c.a : p.aim), dead: p.dead ? 1 : 0, hp: Math.round(p.hp), safe: (state === 'talk' || state === 'shop' || state === 'cheat') ? 1 : 0, c: c ? [c.type, c.col, Math.round(c.x), Math.round(c.y), r2(c.a), r2(c.v), Math.round(c.z || 0)] : 0 });
    }
  }
};
// Block the pause keys in multiplayer (the world keeps going for everyone).
addEventListener('keydown', e => { if (mpRole && state === 'play' && (e.key.toLowerCase() === 'p' || e.key === 'Escape')){ e.stopImmediatePropagation(); toast('NO PAUSING IN MULTIPLAYER'); } }, true);
addEventListener('keydown', e => { if (e.key === 'Escape' && mpEl.style.display === 'flex'){ closeMP(); } });

// ---------- Rendering teammates ----------
function makeJester(col){
  const g = makeFigure(false), u = g.userData;
  const PURPLE = '#8a1fb0', GREEN = '#2fb33a', GOLD = '#f2b51c', SKIN = '#e4bd72';
  setFigureColors(g, SKIN, PURPLE, GREEN, '#1a1208');
  u.hair.visible = false;
  if (u.face) u.face.visible = false;
  const bellMat = lam(GOLD, { emissive: 0x4a3200 }), ink = lam('#120c08');
  const bell = (r) => new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), bellMat);
  const prong = (color, x, y, z, rx, rz, h, r) => {
    const p = new THREE.Group(); p.position.set(x, y, z); p.rotation.set(rx, 0, rz);
    const c = new THREE.Mesh(new THREE.ConeGeometry(r, h, 8), lam(color)); c.position.y = h / 2;
    const tip = bell(.85); tip.position.y = h + .3; p.add(c, tip); return p;
  };
  const hat = new THREE.Group();
  const cap = new THREE.Mesh(new THREE.SphereGeometry(2.7, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), lam(PURPLE)); cap.position.y = 20.2;
  hat.add(cap,
    prong(PURPLE, -.4, 21.4, 0, 0, .32, 8.5, 1.9),
    prong(GREEN, -.2, 21, -1.6, -1.05, .15, 7, 1.6),
    prong(GREEN, -.2, 21, 1.6, 1.05, .15, 7, 1.6),
    prong(GOLD, 0, 20.4, -2.2, -1.9, -.1, 6, 1.4),
    prong(GOLD, 0, 20.4, 2.2, 1.9, -.1, 6, 1.4));
  const band = new THREE.Mesh(new THREE.TorusGeometry(2.55, .55, 6, 18).rotateX(Math.PI / 2), lam(GOLD)); band.position.y = 20.3;
  const brow = bell(.9); brow.position.set(2.2, 21, 0);
  hat.add(band, brow); u.body.add(hat);
  for (const z of [-1.05, 1.05]){
    const socket = box(.3, 1, 1.35, ink); socket.position.set(2.26, 18.5, z); socket.rotation.x = z > 0 ? -.35 : .35;
    const eye = box(.32, .5, .95, lam('#ffffff', { emissive: 0x555555 })); eye.position.set(2.32, 18.45, z * 1.05); eye.rotation.x = socket.rotation.x;
    u.body.add(socket, eye);
  }
  const mouth = box(.3, 1.3, 3.4, ink); mouth.position.set(2.26, 16.4, 0);
  const teeth = box(.34, .9, 3.0, lam('#fbfaf2')); teeth.position.set(2.3, 16.4, 0);
  u.body.add(mouth, teeth);
  for (let i = -3; i <= 3; i++){ const gap = box(.36, 1, .1, ink); gap.position.set(2.31, 16.4, i * .42); u.body.add(gap); }
  const nose = box(.8, .9, .9, lam('#d1a85c')); nose.position.set(2.5, 17.5, 0); u.body.add(nose);
  const ruff = new THREE.Group(); ruff.position.y = 14.6;
  const ruffCols = [PURPLE, GREEN, GOLD];
  for (let i = 0; i < 9; i++){
    const a = i / 9 * Math.PI * 2, p = new THREE.Group(); p.rotation.y = a;
    const c = new THREE.Mesh(new THREE.ConeGeometry(.9, 3.2, 6), lam(ruffCols[i % 3])); c.rotation.z = -1.75; c.position.x = 2.8;
    const t = bell(.5); t.position.set(4.4, -.3, 0); p.add(c, t); ruff.add(p);
  }
  const tag = new THREE.Mesh(new THREE.TorusGeometry(2.3, .4, 6, 18).rotateX(Math.PI / 2), lam(col, { emissive: 0x111111 })); tag.position.y = .2;
  ruff.add(tag); u.body.add(ruff);
  const gun = box(9, 2, 1.6, lam('#1b1d1f')); gun.position.set(5, 12, 2.4); u.body.add(gun);
  g.scale.setScalar(1.05); scene.add(g); return g;
}
function syncTeam(){
  if (!scene) return;
  const live = new Set();
  for (const o of (mpRole ? MP.others : [])){
    live.add(o.i);
    let av = MP.avatars.get(o.i);
    if (!av){ av = { fig: makeJester(mpColor(o.i)), car: null, carKey: '', x: o.x, y: o.y, anim: 0 }; MP.avatars.set(o.i, av); }
    const dx = o.x - av.x, dy = o.y - av.y, dd = Math.hypot(dx, dy);
    if (dd > 150){ av.x = o.x; av.y = o.y; } else { av.x += dx * .25; av.y += dy * .25; }
    if (o.c){
      av.fig.visible = false;
      const key = o.c[0] + o.c[1];
      if (av.carKey !== key){ if (av.car) scene.remove(av.car); const dummy = makeCar(0, 0, 0, o.c[0]); dummy.col = o.c[1]; av.car = makeCarMesh(dummy); av.carKey = key; }
      av.car.visible = true; av.car.position.set(av.x, o.c[5] || 0, av.y); av.car.rotation.set(0, -o.c[4], 0);
    } else {
      if (av.car) av.car.visible = false;
      av.fig.visible = true; av.anim += Math.min(1.2, dd * .1);
      poseFigure(av.fig, av.x, av.y, o.a, av.anim, 'walk');
      if(Number.isFinite(o.h))av.fig.position.y=clamp(o.h,0,600);
      if (o.d){ av.fig.userData.body.rotation.z = -Math.PI / 2; av.fig.userData.body.position.y = 2; }
    }
  }
  for (const [id, av] of MP.avatars) if (!live.has(id)){ scene.remove(av.fig); if (av.car) scene.remove(av.car); MP.avatars.delete(id); }
}
const _renderMP = render;
render = function(){ if (renderer){
  const ratio=mpRole?Math.min(1,devicePixelRatio||1):Math.min(1.5,devicePixelRatio||1);
  if(MP.renderScale!==ratio){MP.renderScale=ratio;renderer.setPixelRatio(ratio);}
  syncTeam();
} _renderMP(); };

const _fpHUDmp = fpHUD;
fpHUD = function(small){
  _fpHUDmp(small);
  if (!mpRole || state === 'menu') return;
  for (const o of MP.others){
    const av = MP.avatars.get(o.i); if (!av) continue;
    const px = player.car ? player.car.x : player.x, py = player.car ? player.car.y : player.y, d = dist(px, py, av.x, av.y);
    if (d > 1400) continue;
    const pr = project(av.x, av.y, o.c ? 26 : 32); if (!pr || pr.x < 0 || pr.x > SW || pr.y < 0 || pr.y > SH) continue;
    cx.globalAlpha = clamp(1.6 - d / 1400, .35, 1);
    hudText(o.n + (o.d ? ' · DOWN' : ''), pr.x, pr.y - 6, small ? 12 : 14, mpColor(o.i), 'center', '900 ');
    cx.globalAlpha = 1;
  }
  // room badge
  const n = 1 + MP.others.length, label = 'ROOM ' + MP.code + ' · ' + n + (n === 1 ? ' JESTER' : ' JESTERS') + (mpRole === 'host' ? ' · HOST' : '');
  hudText(label, SW / 2, small ? 64 : 74, small ? 11 : 12, '#b66cff', 'center', '800 ');
};
const _blipsMP = typeof extraBlips === 'function' ? extraBlips : () => [];
extraBlips = function(){ const l = _blipsMP() || []; if (mpRole) for (const o of MP.others) l.push({ x: o.x, y: o.y, col: mpColor(o.i), label: 'J' }); return l; };

// Expose for testing
window.__mp = { MP, get role(){ return mpRole; }, host: () => mpHost(), join: c => mpJoin(c), open: openMP };
