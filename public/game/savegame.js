'use strict';
// Level 29: campaign autosave, stage checkpoints, nearest-safehouse respawn and CONTINUE on the title screen.
(function(){
const KEY='level29.campaign.v2';
let rest=null,partial=null,loading=false,lastSave=0,warned=false,armed=0;
const pack=o=>{const r={};for(const k in o)r[k]=o[k]===Infinity?'inf':o[k];return r;};
const unpack=o=>{const r={};for(const k in o)r[k]=o[k]==='inf'?Infinity:o[k];return r;};
function read(){try{const s=JSON.parse(localStorage.getItem(KEY)||'null');return s&&s.v===2&&Number.isFinite(s.missionIdx)?s:null;}catch(_){return null;}}
function snapshot(){const pl=window.level29Places&&level29Places.saved;
 if(partial&&partial.idx!==missionIdx)partial=null;
 return {v:2,at:Date.now(),prologue:window.level29Prologue?.snapshot||null,missionIdx,cash:Math.floor(cash),completed:[...completed],up:{...up},arsenal:pack(arsenal||{}),curW,packages:[...packagesFound],jumps:[...jumpsDone],rampages:[...rampagesDone],maxHp:player&&player.maxHp||100,rest,partial};}
function save(announce){if(loading||state==='menu'||state==='win'||!player||mpRole==='client')return false;
 try{localStorage.setItem(KEY,JSON.stringify(snapshot()));lastSave=Date.now();refresh();if(announce)toast(announce);return true;}
 catch(_){if(!warned){warned=true;toast('BROWSER STORAGE UNAVAILABLE · PROGRESS CANNOT BE SAVED');}return false;}}
// A new mission marker, a retry or a chapter change is always a checkpoint.
const oldPlace=placeMissionStart;placeMissionStart=function(){oldPlace();if(state==='play'&&mission&&mission.phase==='start')save('CHECKPOINT SAVED · MISSION '+(missionIdx+1)+' OF '+CAMPAIGN_TOTAL);};
// Resting at a safehouse sets the respawn point and writes the save.
const oldService=serviceVenue;serviceVenue=function(){const v=nearStation();const before=v&&v.id==='safe'?v.cooldown:null;oldService();if(v&&v.id==='safe'&&before<=0&&v.cooldown>0){const sf=(city.safes||[]).find(q=>q.B===v.b)||city.safe,fr=sf.front||{x:sf.x,y:sf.y+30};rest={x:fr.x,y:fr.y,pos:1,chapter:distIdx};save();}};
// Front-gate position for a safehouse or a saved rest point.
function spot(t){if(!t)return null;if(t.front)return {x:t.front.x,y:t.front.y};if(t.pos)return {x:t.x,y:t.y};const n=(city.safes||[]).slice().sort((a,b)=>dist(t.x,t.y,a.x,a.y)-dist(t.x,t.y,b.x,b.y))[0];return n&&n.front?{x:n.front.x,y:n.front.y}:{x:t.x,y:t.y+30};}
// After death, return to the last rested safehouse, otherwise the nearest one.
const oldKill=killPlayer;killPlayer=function(){if(player&&player.dead)return oldKill();const dx=player.x,dy=player.y;oldKill();
 setTimeout(()=>{if(state!=='play'||!player||!city)return;const t=spot(rest&&rest.x?rest:(city.safes||[]).slice().sort((a,b)=>dist(dx,dy,a.x,a.y)-dist(dx,dy,b.x,b.y))[0]);if(!t)return;
  player.x=t.x;player.y=t.y;player.a=-Math.PI/2;view.yaw=-Math.PI/2;view.pitch=0;view.look=0;player.vx=player.vy=0;clearSpawn();zombies=zombies.filter(z=>dist(z.x,z.y,player.x,player.y)>500);snapCamera();placeMissionStart();toast('RESPAWNED AT YOUR LAST SAFEHOUSE');},3700);};
// Mid-mission checkpoints for multi-stop jobs and robberies.
function stage(p,silent){partial=p;save(silent?null:'STAGE CHECKPOINT SAVED');}
window.level29Save={save,partial:p=>stage(p),resume:idx=>partial&&partial.idx===idx?partial:null,clear:()=>{partial=null;},get rest(){return rest;}};

// Stage checkpoints for the classic mission types.
const oldBeginM=beginMission;beginMission=function(){oldBeginM();const m=mission,rp=m&&partial&&partial.idx===m.info.i?partial:null;if(!rp||m.info.type!==rp.kind)return;let ok=true;
 if(rp.kind==='race'){m.cks=rp.cks;m.ckIdx=rp.ckIdx;m.timer=Math.max(rp.timer,60*25);objective='Checkpoint '+(m.ckIdx+1)+' of '+m.cks.length+'. Get in a vehicle.';}
 else if(rp.kind==='clear'){m.kills=Math.min(rp.kills,m.need-1);}
 else if(rp.kind==='deliver'){m.step='drop';m.drop=rp.drop;player.carrying=true;pickups=pickups.filter(q=>q.kind!=='crate');objective='Deliver the crate to '+streetAt(m.drop.x,m.drop.y)+'.';}
 else if(rp.kind==='rescue'&&survivors[0]){const sv=survivors[0];sv.x=player.x+30;sv.y=player.y+10;sv.following=true;m.step='escort';objective='Get the survivor to the safehouse.';}
 else if(rp.kind==='defend'){m.holdT=Math.max(60*10,rp.holdT);}
 else if(rp.kind==='boss'){m.resumeFrac=rp.frac;}
 else ok=false;
 if(ok)toast('RESUMED FROM STAGE CHECKPOINT');};
let seen={};
function watch(m){if(m.extra)return;const i=m.info.i,t=m.info.type;if(seen.i!==i)seen={i};
 if(t==='race'&&m.ckIdx>0&&seen.ck!==m.ckIdx){seen.ck=m.ckIdx;stage({idx:i,kind:'race',ckIdx:m.ckIdx,cks:m.cks,timer:m.timer});}
 else if(t==='clear'&&m.need){const q=Math.floor(m.kills/m.need*4);if(q>0&&q!==seen.q){seen.q=q;stage({idx:i,kind:'clear',kills:m.kills});}}
 else if(t==='deliver'&&m.step==='drop'&&!seen.d){seen.d=1;stage({idx:i,kind:'deliver',drop:m.drop});}
 else if(t==='rescue'&&m.step==='escort'&&!seen.r){seen.r=1;stage({idx:i,kind:'rescue'});}
 else if(t==='defend'&&m.step==='hold'){if(!seen.h){seen.h=1;stage({idx:i,kind:'defend',holdT:m.holdT});}else if(frame%600===0&&seen.f!==frame){seen.f=frame;stage({idx:i,kind:'defend',holdT:m.holdT},true);}}
 else if(t==='boss'&&boss&&!boss.dead&&m.step==='fight'){if(m.resumeFrac){boss.hp=Math.max(1,Math.round(boss.maxHp*m.resumeFrac));m.resumeFrac=0;}
  const f=boss.hp/boss.maxHp,l=f<=.25?3:f<=.5?2:f<=.75?1:0;if(l>0&&l!==seen.b){seen.b=l;stage({idx:i,kind:'boss',frac:f});}}}
const oldUpd=updateMission;updateMission=function(){oldUpd();const m=mission;if(m&&m.phase==='active'&&!loading)watch(m);};
// Title screen: CONTINUE button and a guarded NEW GAME.
const row=document.querySelector('#menu .row'),startBtn=document.getElementById('start');
let cont=document.getElementById('resume');if(!cont){cont=document.createElement('button');cont.id='resume';row&&row.appendChild(cont);}
const old=cont.onclick;
function refresh(){const s=read();if(s){cont.style.display='inline-block';const ch=DISTRICTS[Math.min(DISTRICTS.length-1,Math.floor(s.missionIdx/MISSIONS_PER))].name;cont.textContent=(s.prologue?.v===1&&Number.isInteger(s.prologue.stage)&&s.prologue.stage>=0&&s.prologue.stage<19?'CONTINUE · PROLOGUE CHECKPOINT '+(s.prologue.stage+1):'CONTINUE · MISSION '+(s.missionIdx+1)+' / '+CAMPAIGN_TOTAL+' · '+ch)+' · $'+s.cash.toLocaleString();}else if(old&&typeof venueSave!=='undefined'&&venueSave.checkpoint){cont.style.display='inline-block';cont.textContent='RESUME CHECKPOINT';}else cont.style.display='none';}
cont.onclick=()=>{const s=read();if(!s){return old&&old();}
 loading=true;try{startGame(s.missionIdx,{resume:true,prologue:s.prologue});cash=s.cash;completed=new Set(s.completed||[]);Object.assign(up,s.up||{});if(s.arsenal){arsenal=unpack(s.arsenal);arsenal.m240=Infinity;curW=hasW(s.curW)?s.curW:'m240';}
  packagesFound=new Set(s.packages||[]);jumpsDone=new Set(s.jumps||[]);rampagesDone=new Set(s.rampages||[]);rest=s.rest||null;partial=s.partial||null;
  const hp=Math.max(100+25*(up.vital||0),s.maxHp||100,window.level29Places&&level29Places.saved.maxHp||0);player.maxHp=hp;player.hp=hp;player.armor=Math.max(player.armor,up.armor*25);
  if(rest&&rest.x&&!window.level29Prologue?.active){const q=spot(rest);player.x=q.x;player.y=q.y;player.a=-Math.PI/2;view.yaw=-Math.PI/2;view.lastPlayer=player;snapCamera();}}finally{loading=false;}
 placeMissionStart();toast('SAVE LOADED · MISSION '+(s.missionIdx+1)+(partial?' · STAGE CHECKPOINT READY':''));};
startBtn.addEventListener('click',e=>{if(!read())return;if(Date.now()-armed<4500){return;}e.preventDefault();e.stopImmediatePropagation();armed=Date.now();startBtn.dataset.label=startBtn.textContent;startBtn.textContent='ERASES SAVE · CLICK AGAIN';setTimeout(()=>{if(startBtn.dataset.label&&Date.now()-armed>=4400){startBtn.textContent=startBtn.dataset.label;}},4600);},true);

// Save code: move progress to another browser or device.
const KEYS=['level29.survival-expansion.v1','level29.bindings.v1','level29.experience.v1','level29.campaign.v2','level29.places.v1','level29.venues.v1','level29.openworld.v1','level29.guard.v1','level29.jobs.v1','level29.shelter-search.v1','level29.trading.v1'];
const box=document.createElement('div');box.style.cssText='position:fixed;inset:0;z-index:99;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.78)';
box.innerHTML='<div style="width:min(520px,92vw);background:#16171b;border:1px solid #ecc35c;padding:18px;font:12px/1.5 monospace;color:#eee"><div id="sioT" style="color:#ecc35c;font-weight:700;letter-spacing:.1em;margin-bottom:8px"></div><textarea id="sioA" style="width:100%;height:120px;background:#0c0d0f;color:#ecc35c;border:1px solid #444;font:11px monospace;box-sizing:border-box"></textarea><div id="sioM" style="min-height:18px;margin:6px 0;color:#9bd"></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button id="sioGo" style="background:#ecc35c;color:#101114;border:0;height:34px;padding:0 14px;font:700 12px monospace;cursor:pointer"></button><button id="sioX" style="background:transparent;color:#ecc35c;border:1px solid #ecc35c;height:34px;padding:0 14px;font:700 12px monospace;cursor:pointer">CLOSE</button></div></div>';
document.body.appendChild(box);
const $=id=>box.querySelector('#'+id);let mode='';
function openBox(m){mode=m;box.style.display='flex';$('sioM').textContent='';if(m==='out'){const o={};for(const k of KEYS){let v=null;try{v=localStorage.getItem(k);}catch(_){}if(v)o[k]=v;}$('sioT').textContent='SAVE CODE';$('sioA').value=Object.keys(o).length?'L29-'+btoa(unescape(encodeURIComponent(JSON.stringify(o)))):'';$('sioA').readOnly=true;$('sioGo').textContent='COPY CODE';$('sioM').textContent=$('sioA').value?'Copy this code and keep it safe.':'No save found yet.';}
 else{$('sioT').textContent='LOAD SAVE CODE';$('sioA').value='';$('sioA').readOnly=false;$('sioGo').textContent='LOAD';$('sioM').textContent='Paste a code from another device. This replaces the save on this browser.';}}
$('sioX').onclick=()=>box.style.display='none';
$('sioGo').onclick=()=>{if(mode==='out'){const a=$('sioA');a.select();try{navigator.clipboard.writeText(a.value);document.execCommand&&document.execCommand('copy');$('sioM').textContent='Copied.';}catch(_){$('sioM').textContent='Press Ctrl+C to copy.';}return;}
 try{const t=$('sioA').value.trim().replace(/^L29-/,'');const o=JSON.parse(decodeURIComponent(escape(atob(t))));const c=JSON.parse(o['level29.campaign.v2']||'null');if(!c||c.v!==2)throw 0;for(const k of KEYS)if(typeof o[k]==='string')localStorage.setItem(k,o[k]);$('sioM').textContent='Save loaded. Reloading...';setTimeout(()=>location.reload(),600);}catch(_){$('sioM').textContent='That code is not valid.';}};
const io=document.createElement('div');io.style.cssText='margin-top:8px;display:flex;gap:14px';
for(const [lab,m] of [['SAVE CODE','out'],['LOAD CODE','in']]){const b=document.createElement('button');b.textContent=lab;b.style.cssText='background:none;border:0;border-bottom:1px solid #ecc35c88;color:#ecc35c;font:700 11px monospace;letter-spacing:.1em;padding:2px 0;cursor:pointer';b.onclick=()=>openBox(m);io.appendChild(b);}
cont.insertAdjacentElement('afterend',io);
refresh();
// Quiet autosave: cash, weapons and purchases are captured every 25 seconds and when the tab closes.
setInterval(()=>{if(state==='play'&&mission&&Date.now()-lastSave>24000)save();},5000);
addEventListener('pagehide',()=>save());document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});
})();
