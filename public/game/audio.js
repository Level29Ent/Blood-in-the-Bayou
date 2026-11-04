function mkRng(seed){ let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash(n){ const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
// ---------- Audio ----------
// Buses: sfx + music -> master -> compressor -> speakers
let actx = null, noiseBuf = null, master = null, sfxBus = null, musicBus = null, comp = null;
let soundMode = 0; // 0 = music + sfx, 1 = sfx only, 2 = muted
const SOUND_LABELS = ['MUSIC ON', 'MUSIC OFF', 'MUTED'];
function ensureAudio(){
  if (window.bayouAdActive) return;
  if (!actx){
    try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){ return; }
    comp = actx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    master = actx.createGain(); master.gain.value = .9;
    sfxBus = actx.createGain(); musicBus = actx.createGain(); musicBus.gain.value = 0;
    sfxBus.connect(master); musicBus.connect(master); master.connect(comp); comp.connect(actx.destination);
    noiseBuf = actx.createBuffer(1, actx.sampleRate, actx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i=0;i<d.length;i++) d[i] = Math.random()*2-1;
    setInterval(musicTick, 25);
    loadVoices();
    applyVolumes();
  }
  if (actx.state === 'suspended') actx.resume();
}
function setSoundMode(m){ soundMode = (m + 3) % 3; applyVolumes(); const b = document.getElementById('audio'); if (b) b.textContent = ['SOUND ON','MUSIC OFF','MUTED'][soundMode]; }
function applyVolumes(){
  if (!actx) return;
  const t = actx.currentTime;
  sfxBus.gain.setTargetAtTime(soundMode===2 ? 0 : 1, t, .03);
  const speaking = typeof bossVoiceEnd!=='undefined' && bossVoiceEnd > t;
  const mv = soundMode>=1 ? 0 : (typeof state!=='undefined' && state==='pause') ? .04 : speaking ? .04 : .18;
  musicBus.gain.setTargetAtTime(mv, t, .08);
  if (typeof voiceBus!=='undefined' && voiceBus) voiceBus.gain.setTargetAtTime(soundMode===2 ? 0 : VOICE_GAIN, t, .03);
}

// Generic synth voice
function voice(bus, t, f1, dur, o){
  o = o || {};
  const osc = actx.createOscillator(), g = actx.createGain();
  osc.type = o.wave || 'square';
  osc.frequency.setValueAtTime(f1, t);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t + (o.glide || dur));
  if (o.detune) osc.detune.value = o.detune;
  const vol = o.vol == null ? .08 : o.vol, a = o.attack || .004;
  g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(vol, t + a);
  if (o.sustain) { g.gain.setValueAtTime(vol, t + Math.max(a, dur - .05)); g.gain.linearRampToValueAtTime(.0001, t + dur); }
  else g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  let node = osc;
  if (o.lp || o.hp || o.bp){
    const f = actx.createBiquadFilter(); f.type = o.lp ? 'lowpass' : o.hp ? 'highpass' : 'bandpass';
    f.frequency.value = o.lp || o.hp || o.bp; if (o.q) f.Q.value = o.q;
    osc.connect(f); node = f;
  }
  if (o.vib){ const l = actx.createOscillator(), lg = actx.createGain(); l.frequency.value = o.vib; lg.gain.value = o.vibAmt || 6; l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t+dur+.05); }
  node.connect(g); g.connect(bus); osc.start(t); osc.stop(t + dur + .05);
}
function noiseV(bus, t, dur, vol, o){
  o = o || {};
  const s = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain();
  s.buffer = noiseBuf; s.loop = true; f.type = o.type || 'lowpass'; f.frequency.setValueAtTime(o.f || 1200, t);
  if (o.fTo) f.frequency.exponentialRampToValueAtTime(o.fTo, t + dur);
  if (o.q) f.Q.value = o.q;
  g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(vol, t + (o.attack || .002));
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(bus); s.start(t, Math.random()*.5); s.stop(t + dur + .05);
}
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

// ---------- Sound effects ----------
let lastShot = 0, shotN = 0;
function snd(type, arg){
  if (!actx || soundMode===2) return;
  try{
    const t = actx.currentTime, B = sfxBus;
    const tone = (f1, f2, dur, wave='square', vol=.08, delay=0) => voice(B, t+delay, f1, dur, {wave, vol, to:f2||0});
    const noise = (dur, vol, freq=1200, delay=0) => noiseV(B, t+delay, dur, vol, {f:freq});
    const r = (a, b) => a + Math.random()*(b-a);
    if (type==='shot'){
      shotN++;
      noiseV(B, t, .09, .22, {type:'bandpass', f:r(1600,2400), fTo:500, q:.8});
      voice(B, t, r(150,175), .09, {wave:'sine', to:45, vol:.32});
      voice(B, t, 90, .05, {wave:'square', to:40, vol:.04});
      if (shotN % 3 === 0) voice(B, t + r(.18,.3), r(3200,4200), .05, {wave:'triangle', vol:.025});
    }
    if (type==='jump') voice(B, t, 300, .16, {to:720, vol:.06});
    if (type==='land'){ noiseV(B, t, .08, .08, {f:400}); voice(B, t, 120, .08, {wave:'sine', to:60, vol:.12}); }
    if (type==='bolt'){ tone(988,0,.07,'square',.06); tone(1319,0,.22,'square',.06,.07); }
    if (type==='stomp'){ voice(B, t, 420, .14, {wave:'triangle', to:90, vol:.18}); noiseV(B, t, .1, .1, {f:600}); }
    if (type==='zhit'){ noiseV(B, t, .06, .1, {f:r(500,900)}); voice(B, t, r(140,200), .06, {wave:'triangle', to:70, vol:.07}); }
    if (type==='zdie'){
      noiseV(B, t, .25, .16, {f:700, fTo:150});
      voice(B, t, r(150,200), .45, {wave:'sawtooth', to:55, vol:.07, lp:900, vib:9, vibAmt:12});
    }
    if (type==='groan'){
      const f = arg || r(85, 140), dur = r(.7, 1.3);
      const o = actx.createOscillator(), g = actx.createGain(), fl = actx.createBiquadFilter();
      o.type = 'sawtooth'; fl.type = 'bandpass'; fl.frequency.value = r(500, 800); fl.Q.value = 2.5;
      o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f*1.25, t + dur*.35); o.frequency.linearRampToValueAtTime(f*.7, t + dur);
      const l = actx.createOscillator(), lg = actx.createGain(); l.frequency.value = r(5,8); lg.gain.value = f*.06; l.connect(lg); lg.connect(o.frequency);
      g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.09, t + .12); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(fl); fl.connect(g); g.connect(B); o.start(t); l.start(t); o.stop(t+dur+.05); l.stop(t+dur+.05);
      noiseV(B, t, dur*.8, .025, {type:'bandpass', f:900, q:1.5, attack:.1});
    }
    if (type==='hit') { voice(B, t, 240, .12, {to:80, vol:.05}); }
    if (type==='bosshit'){ noiseV(B, t, .05, .07, {f:500}); voice(B, t, r(90,110), .07, {wave:'sine', to:50, vol:.12}); }
    if (type==='hurt'){
      voice(B, t, 260, .28, {wave:'sawtooth', to:110, vol:.1, lp:1400});
      noiseV(B, t, .15, .1, {f:1500});
    }
    if (type==='bump') tone(140, 90, .08, 'triangle', .15);
    if (type==='break'){ noiseV(B, t, .25, .16, {f:1400, fTo:300}); for (let k=0;k<3;k++) voice(B, t+k*.04, r(500,900), .05, {wave:'triangle', vol:.04}); }
    if (type==='heat'){
      noiseV(B, t, .9, .12, {type:'highpass', f:3000, fTo:7000, attack:.05});
      voice(B, t, 900, .4, {wave:'triangle', to:250, vol:.07});
    }
    if (type==='cooled'){ voice(B, t, 1800, .03, {wave:'square', vol:.05}); voice(B, t+.08, 1200, .04, {wave:'square', vol:.05}); }
    if (type==='die'){ [523,494,466,440,415,392].forEach((f,i)=>tone(f,0,.14,'square',.07,i*.13)); voice(B, t+.8, 196, .6, {wave:'triangle', vol:.09}); }
    if (type==='gameover'){ [392,370,349,330,262].forEach((f,i)=>voice(B, t+i*.32, f, i===4 ? 1.2 : .3, {wave:'square', vol:.06, lp:2200})); }
    if (type==='flag') voice(B, t, 200, .8, {to:1200, vol:.05});
    if (type==='clear'){ [523,659,784,1047,784,1047,1319].forEach((f,i)=>{ voice(B, t+i*.14, f, i===6?.6:.16, {vol:.07}); voice(B, t+i*.14, f/2, .14, {wave:'triangle', vol:.08}); }); }
    if (type==='tick') tone(1600,0,.03,'square',.03);
    if (type==='hurry'){ [880,0,880,0,880].forEach((f,i)=>f&&tone(f,0,.1,'square',.06,i*.1)); }
    if (type==='life'){ [659,784,1319,1047,1175,1568].forEach((f,i)=>tone(f,0,.1,'square',.06,i*.09)); }
    if (type==='heal'){ tone(660,0,.08,'triangle',.09); tone(990,0,.1,'triangle',.09,.08); tone(1320,0,.18,'triangle',.08,.16); }
    if (type==='roar'){
      voice(B, t, 70, 1.4, {wave:'sawtooth', to:50, vol:.18, lp:700, vib:7, vibAmt:14, attack:.15});
      voice(B, t, 104, 1.3, {wave:'sawtooth', to:70, vol:.1, lp:900, vib:6, vibAmt:10, attack:.2});
      noiseV(B, t, 1.3, .14, {f:900, fTo:300, attack:.15});
    }
    if (type==='boss'){ [196,185,175,165].forEach((f,i)=>{ voice(B, t+i*.28, f, .3, {wave:'sawtooth', vol:.07, lp:1500}); voice(B, t+i*.28, f/2, .3, {wave:'square', vol:.05}); }); }
    if (type==='bossdie'){
      voice(B, t, 120, 2, {wave:'sawtooth', to:30, vol:.18, lp:800, vib:5, vibAmt:20});
      noiseV(B, t, 1.8, .25, {f:1200, fTo:100});
      for (let k=0;k<5;k++) noiseV(B, t + .3 + k*.25, .3, .2, {f:400});
    }
    if (type==='slam'){ noiseV(B, t, .4, .3, {f:350, fTo:80}); voice(B, t, 95, .4, {wave:'sine', to:35, vol:.3}); }
    if (type==='spit'){ noiseV(B, t, .2, .1, {type:'bandpass', f:1200, fTo:400, q:3}); voice(B, t, 300, .15, {wave:'sawtooth', to:120, vol:.04}); }
    if (type==='crate'){ voice(B, t, 160, .15, {wave:'sine', to:60, vol:.2}); noiseV(B, t, .12, .1, {f:600}); }
    if (type==='power'){ [523,659,784,1047,1319,1568,2093].forEach((f,i)=>{ voice(B, t+i*.07, f, .14, {vol:.06}); voice(B, t+i*.07, f*1.5, .1, {wave:'triangle', vol:.03}); }); }
    if (type==='intro'){ const base = arg || 60; [0,7,12].forEach((s,i)=>voice(B, t+i*.12, mtof(base+s), i===2?.5:.12, {vol:.06})); }
    if (type==='win'){ [523,523,523,659,784,659,784,1047].forEach((f,i)=>voice(B, t+i*.16, f, i===7?1:.14, {vol:.07})); }
  }catch(e){}
}

// ---------- Music ----------
// Each track: tempo, key, chord progression (1 chord per bar), drum/bass patterns, melody rhythm.
const Q = { M:[0,4,7,11], m:[0,3,7,10], D:[0,4,7,10], s:[0,5,7,10] };
const TRACK_DEFS = {
  forest: { bpm:84, swing:.08, key:52, seed:41, prog:[[0,'m'],[8,'M'],[5,'M'],[10,'D']],
    kick:'x.......x...x...', snare:'........x.......', hat:'..x.....x.x.....', bass:'0-------5---7---',
    lead:['x---....x-x-....','..x---x-....x---'], leadV:{wave:'triangle', vol:.1, lp:1800, attack:.03, vib:4, vibAmt:4}, pad:'saw', bassV:'tri' },
  mountain: { bpm:100, swing:0, key:55, seed:57, prog:[[0,'m'],[5,'M'],[3,'M'],[10,'D']],
    kick:'x...x...x..x....', snare:'....x.......x...', hat:'x.x.x.x.x.x.x.xx', bass:'0---0---5---3---',
    lead:['x-x---x-x---....','x---x-x-....x-x-'], leadV:{wave:'sawtooth', vol:.06, lp:1500, attack:.02, vib:5, vibAmt:3}, pad:'saw', bassV:'tri' },
  title: { bpm:92, swing:0, key:57, seed:3, prog:[[0,'m'],[8,'M'],[3,'M'],[7,'D']],
    kick:'x.......x.......', snare:'........x.......', hat:'..x...x...x...x.', bass:'0---....0---..5-',
    lead:['x---..x-x---....','x-x-x---....x---'], leadV:{wave:'triangle', vol:.12}, pad:'saw', bassV:'tri' },
  nola: { bpm:116, swing:.2, key:58, seed:11, prog:[[0,'M'],[9,'m'],[2,'m'],[7,'D']],
    kick:'x..x..x...x.x...', snare:'g.gx.gx.g.gx.gxg', hat:'x.x.x.x.x.x.x.x.', bass:'0...5...8...7...',
    lead:['x.x-x...x-x.x---','x-x.x.x---..x.x.'], leadV:{wave:'sawtooth', vol:.07, lp:2200, attack:.02, vib:5, vibAmt:5}, stab:'..c...c...c...c.', bassV:'tuba' },
  la: { bpm:104, swing:0, key:57, seed:23, prog:[[0,'m'],[8,'M'],[3,'M'],[10,'M']],
    kick:'x...x...x...x...', snare:'....x.......x...', hat:'x.x.x.x.x.x.x.x.', bass:'0.8.0.8.0.8.0.8.',
    lead:['x---x-x-x---x---','x-x-x-x-x-------'], leadV:{wave:'sawtooth', vol:.06, lp:2600, detune:8}, pad:'saw', bassV:'saw' },
  hou: { bpm:140, swing:0, key:48, seed:37, prog:[[0,'m'],[8,'M'],[5,'m'],[7,'D']],
    kick:'x......x..x.....', snare:'........x.......', hat:'xxxxxxxxxxxxxxrr', bass:'0-------....0-5-',
    lead:['x...x...x..x....','x.......x...x...'], leadV:{wave:'sine', vol:.1, attack:.005}, bell:true, bassV:'808' },
  lej: { bpm:118, swing:0, key:50, seed:41, prog:[[0,'M'],[5,'M'],[0,'M'],[7,'D']],
    kick:'x.......x.......', snare:'x.ggx.g.x.ggx.gg', hat:'', bass:'0...5...0...5...',
    lead:['x-.xx-x.x---x.x.','x-x-x-.xx-------'], leadV:{wave:'square', vol:.05, lp:2400, attack:.01}, bassV:'tri' },
  pi: { bpm:122, swing:0, key:53, seed:53, prog:[[0,'M'],[7,'D'],[9,'m'],[5,'M']],
    kick:'x.......x.......', snare:'x.ggx.ggx.g.xggg', hat:'', bass:'0...5...0...5...',
    lead:['x-xx-xx.x---x.x.','x.x.x.x.x-------'], leadV:{wave:'square', vol:.05, lp:2400, attack:.01}, bassV:'tri' },
  boss: { bpm:152, swing:0, key:52, seed:67, prog:[[0,'m'],[0,'m'],[8,'M'],[10,'M']],
    kick:'x..x..x.x..x..x.', snare:'....x.......x...', hat:'x.x.x.x.x.x.x.x.', bass:'0000000080008000',
    lead:['x.x.x---x.x.x---','x-x-x-x-x---x---'], leadV:{wave:'square', vol:.05, lp:3000}, stab:'c.......c.......', bassV:'saw' },
  final: { bpm:164, swing:0, key:50, seed:79, prog:[[0,'m'],[1,'M'],[0,'m'],[10,'M']],
    kick:'x.xx..x.x.xx..x.', snare:'....x.......x..g', hat:'xxxxxxxxxxxxxxxx', bass:'0000800000008080',
    lead:['x.x.x.x.x---x---','x-x-x---x.x.x---'], leadV:{wave:'sawtooth', vol:.05, lp:3200}, stab:'c...c...c...c...', bassV:'saw' },
};
function buildTrack(def){
  const rng = mkRng(def.seed * 1013);
  // melody motif as chord-tone indices, form A A' B A over 8 bars
  const motif = rhythm => { const out = []; let idx = 4 + Math.floor(rng()*3);
    for (let s=0;s<16;s++) if (rhythm[s]==='x'){ let len = 1; while (s+len<16 && rhythm[s+len]==='-') len++;
      const stepR = rng(); idx += stepR < .2 ? 0 : stepR < .6 ? (rng()<.5?1:-1) : (rng()<.5?2:-2); idx = Math.max(2, Math.min(9, idx));
      out.push({s, len, idx}); }
    return out; };
  const A1 = motif(def.lead[0]), A2 = motif(def.lead[1]), B1 = motif(def.lead[0]), B2 = motif(def.lead[1]), A2v = motif(def.lead[1]);
  const form = [A1, A2, A1, A2v, B1, B2, A1, A2];
  return { def, form, bars: 8 };
}
const TRACKS = {}; for (const k in TRACK_DEFS) TRACKS[k] = buildTrack(TRACK_DEFS[k]);
const mus = { name:null, tr:null, step:0, next:0, tempo:1 };
function setMusic(name){
  if (mus.name === name) return;
  mus.name = name; mus.tr = name ? TRACKS[name] : null; mus.step = 0;
  if (actx) mus.next = actx.currentTime + .08;
}
function chordTones(def, bar){ const [r, q] = def.prog[bar % def.prog.length]; return Q[q].map(i => def.key + r + i); }
function musicTick(){
  if (!actx || !mus.tr) return;
  if (mus.next < actx.currentTime - .2) mus.next = actx.currentTime + .02;
  let guard = 0;
  while (mus.next < actx.currentTime + .14 && guard++ < 64){
    const def = mus.tr.def, step = mus.step, s16 = step % 16, bar = Math.floor(step / 16) % mus.tr.bars;
    const base = 60 / def.bpm / 4 / mus.tempo;
    let dur = def.swing ? base * (s16 % 2 === 0 ? 1 + def.swing : 1 - def.swing) : base;
    if (!(dur > 0.005)) dur = 0.005;
    playStep(mus.tr, def, s16, bar, mus.next, base);
    mus.next += dur; mus.step++;
  }
}
function playStep(tr, def, s, bar, t, sd){
  const M = musicBus, ct = chordTones(def, bar);
  // drums
  if (def.kick[s]==='x'){ voice(M, t, def.bassV==='808' ? 110 : 150, .18, {wave:'sine', to:42, glide:.12, vol:.55}); }
  const sn = def.snare[s];
  if (sn==='x'){ noiseV(M, t, .14, .22, {type:'highpass', f:1400}); voice(M, t, 210, .08, {wave:'triangle', to:140, vol:.12}); }
  else if (sn==='g'){ noiseV(M, t, .05, .07, {type:'highpass', f:2000}); }
  const hh = def.hat[s];
  if (hh==='x') noiseV(M, t, .03, .06, {type:'highpass', f:7500});
  else if (hh==='r'){ noiseV(M, t, .02, .05, {type:'highpass', f:8000}); noiseV(M, t + sd/2, .02, .05, {type:'highpass', f:8000}); }
  // bass
  const b = def.bass[s];
  if (b && b!=='.' && b!=='-'){
    let len = 1; while (s+len<16 && def.bass[s+len]==='-') len++;
    const deg = {0:0, 3:ct[1]-ct[0], 5:7, 6:9, 7:ct[3]-ct[0], 8:12}[b] || 0;
    const note = ct[0] - 24 + deg + (def.bassV==='808' ? 0 : 0);
    const d = sd * len * .95;
    if (def.bassV==='808') voice(M, t, mtof(note), d + .1, {wave:'sine', vol:.5, sustain:true, attack:.005});
    else if (def.bassV==='tuba') voice(M, t, mtof(note), d, {wave:'sawtooth', vol:.16, lp:500, attack:.015, sustain:true});
    else if (def.bassV==='saw') voice(M, t, mtof(note), d, {wave:'sawtooth', vol:.12, lp:800, sustain:true});
    else voice(M, t, mtof(note), d, {wave:'triangle', vol:.28, sustain:true});
  }
  // pad (one per bar)
  if (def.pad && s===0){ for (const n of ct.slice(0,3)) voice(M, t, mtof(n), sd*16*.98, {wave:'sawtooth', vol:.022, lp:900, attack:.25, sustain:true, detune:(Math.random()-.5)*12}); }
  // chord stabs
  if (def.stab && def.stab[s]==='c'){ for (const n of ct.slice(0,3)) voice(M, t, mtof(n+12), sd*1.5, {wave:def.bassV==='saw' ? 'sawtooth' : 'triangle', vol:.04, lp:2400}); }
  // bell arps (Houston)
  if (def.bell && s % 4 === 2){ const n = ct[(s/4|0) % 3] + 24; voice(M, t, mtof(n), .6, {wave:'sine', vol:.035}); voice(M, t, mtof(n)*2.01, .3, {wave:'sine', vol:.012}); }
  // lead
  const phrase = tr.form[bar];
  for (const nt of phrase) if (nt.s === s){
    const i = nt.idx, n = ct[i % 4] + 12 * Math.floor(i / 4);
    const L = def.leadV;
    voice(M, t, mtof(n), sd * nt.len * .92, {wave:L.wave, vol:L.vol, lp:L.lp, attack:L.attack || .006, sustain:true, vib:L.vib, vibAmt:L.vibAmt, detune:L.detune});
    if (L.detune) voice(M, t, mtof(n), sd * nt.len * .92, {wave:L.wave, vol:L.vol*.8, lp:L.lp, sustain:true, detune:-L.detune});
  }
}
// ---------- Voice lines ----------
const VO_TEXT = {"b_lej_4": "Semper... fi...", "b_final_2": "There is no safe zone. There never was.", "b_la_3": "CUT! I am rewriting your ENDING!", "b_la_1": "Smile, darling. It's your close-up.", "b_hou_0": "Welcome to H-Town, jester! Ain't NOBODY leavin'!", "b_final_3": "I... WILL... NOT... DIE!", "zm_5": "Come... HEEERE!", "b_pi_4": "Recruit... you... graduate...", "zm_0": "BRAAAAAINS!", "b_pi_2": "You will address me as MA'AM... before I EAT you!", "zf_5": "Don't run... DON'T RUUUN!", "zfd_1": "NOOOOO!", "b_lej_2": "I've eaten tougher Marines than you for BREAKFAST!", "b_la_0": "Lights... camera... DINNER! You're on, jester!", "zmar_0": "OOO-RAHHH... BRAINS!", "b_nola_0": "Ha! Ha! Welcome... to MY kingdom, little jester! The dead rule the Quarter now!", "b_la_4": "That's... a... wrap...", "b_lej_0": "On your FEET, maggot! Gunny's back... from the DEAD!", "zf_0": "BRAAAAAINS!", "b_pi_0": "Get on my yellow footprints! NOW! NOW! NOW!", "sv_3": "We made it... we actually made it.", "b_final_1": "The WHOLE WORLD... is MINE!", "zmar_1": "Hut... HUT... BRAAAINS!", "zm_1": "Uuuuurrrrgh...", "zf_1": "So... hungryyyy...", "zd_0": "AAAAARGH!", "b_hou_1": "Everything's bigger in Texas, includin' my APPETITE!", "b_nola_4": "My crown... my kingdom... gone...", "b_final_4": "Impossible... the jester... wins...", "zm_4": "JESTERRRRR!", "zf_2": "Jesterrrr... come play with meee...", "b_la_2": "This town eats boys like you... alive.", "zd_1": "UGGGHHH!", "zfd_0": "AAAAAAHHH!", "zd_2": "HHHUUUNGH!", "b_final_0": "Every street... and still you stand. FACE your END, jester!", "b_pi_1": "Did I say you could SHOOT me, recruit?!", "b_hou_2": "I'mma STOMP you flat, boy!", "b_nola_1": "Your bones will DANCE on Bourbon Street!", "b_nola_2": "The spirits... are HUNGRY... for you.", "b_hou_3": "Now you done made me MAD!", "zmar_3": "CHOW... TIME!", "zfd_2": "HHHAAAAGH!", "sv_0": "Oh thank God! Get me out of here!", "b_lej_1": "Is that ALL you got, devil dog?", "sv_1": "Behind you! They're COMING!", "b_pi_3": "SOUND OFF! I CAN'T HEAR YOU!", "b_lej_3": "FIX BAYONETS! NO! RETREAT!", "sv_2": "Drive! DRIVE! Just GO!", "zf_3": "Fresh... MEEEAT!", "b_nola_3": "ENOUGH! RISE, my children! RISE!", "zf_4": "I can SMELL you...", "b_hou_4": "Houston... we got... a problem...", "zm_3": "Hungryyyy... so hungryyyy...", "zmar_2": "Semper... hungryyy...", "zm_2": "Fresh... MEEEAT!"};
const voBufs = {}; let voLoading = false, voiceBus = null;
const VOICE_GAIN = 2.0; let voDuckUntil = 0;
let zVoiceUntil = 0, zDeathUntil = 0, bossVoice = null, bossVoiceEnd = 0, subtitle = null;
function loadVoices(){
  if (voLoading || !actx) return; voLoading = true;
  voiceBus = actx.createGain(); voiceBus.gain.value = soundMode===2 ? 0 : VOICE_GAIN; voiceBus.connect(master);
  const data = window.VO_DATA || {};
  for (const k of Object.keys(VO_TEXT)){
    if (!data[k]) continue;
    try {
      const bin = atob(data[k]), bytes = new Uint8Array(bin.length);
      for (let i=0;i<bin.length;i++) bytes[i] = bin.charCodeAt(i);
      new Promise((res, rej) => actx.decodeAudioData(bytes.buffer, res, rej)).then(buf => { voBufs[k] = buf; }).catch(() => {});
    } catch(e){}
  }
}
function playVO(key, o){
  o = o || {};
  if (!actx || !voiceBus || soundMode===2) return null;
  const buf = voBufs[key]; if (!buf) return null;
  const s = actx.createBufferSource(); s.buffer = buf; s.playbackRate.value = o.rate || 1;
  const g = actx.createGain(); g.gain.value = o.vol == null ? 1 : o.vol;
  s.connect(g);
  if (actx.createStereoPanner){ const p = actx.createStereoPanner(); p.pan.value = o.pan || 0; g.connect(p); p.connect(voiceBus); } else g.connect(voiceBus);
  s.start();
  if (/^(b_|sv_)/.test(key)) voDuckUntil = Math.max(voDuckUntil, actx.currentTime + buf.duration / (o.rate || 1) + .3);
  return { src:s, dur: buf.duration / (o.rate || 1) };
}
const VO_COUNT = { zm:6, zf:6, zmar:4, zd:3, zfd:3, sv:4 };
function stopBossVoice(){ if (bossVoice){ try { bossVoice.src.stop(); } catch(e){} bossVoice = null; } bossVoiceEnd = 0; }

