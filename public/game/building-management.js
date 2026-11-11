'use strict';
// Level 29 · Blood in the Bayou — Construction & Building Management
// Build player-owned structures: validate placement against the live city
// grid, charge construction costs, finish builds, accrue resource yields and
// paint every structure onto the player's ground texture and minimap.
// Cloud sync (optional): window.BITB_BUILDING_DB={url,key} pointing at a
// Supabase project running supabase/migrations/0001_bitb_building_management.sql
(function(){
// ---------------- Catalog ----------------
// w/h in tiles, cost in fictional in-game cash, buildSec of construction time,
// cashPerHr yield rate once complete. requiresRoad: needs road frontage.
const BLUEPRINTS={
  shack:{name:'TRAPPER SHACK',short:'SHACK',letter:'S',col:'#7a8b6f',w:2,h:2,cost:4500,buildSec:30,cashPerHr:900,requiresRoad:false,desc:'Modest bayou camp. Small steady income.'},
  greenhouse:{name:'GATOR GREENHOUSE',short:'GREENHOUSE',letter:'G',col:'#6f9c78',w:3,h:2,cost:12000,buildSec:75,cashPerHr:3200,requiresRoad:false,desc:'Grow swamp herbs and sell the surplus.'},
  smokehouse:{name:'SMOKEHOUSE',short:'SMOKEHOUSE',letter:'M',col:'#8f7358',w:3,h:2,cost:18000,buildSec:90,cashPerHr:5200,requiresRoad:true,desc:'Cured meats command city prices.'},
  watchtower:{name:'WATCHTOWER',short:'TOWER',letter:'W',col:'#66594a',w:2,h:2,cost:15000,buildSec:60,cashPerHr:0,requiresRoad:false,radar:2000,desc:'Radar sweep: alerts zombies within 2000m.'},
  distillery:{name:'BAYOU DISTILLERY',short:'DISTILLERY',letter:'D',col:'#9c8a5c',w:4,h:3,cost:45000,buildSec:150,cashPerHr:13500,requiresRoad:true,desc:'Backroad spirits. High yield, needs frontage.'},
  trapdock:{name:'CRAWFISH DOCK',short:'DOCK',letter:'K',col:'#6d7f8a',w:3,h:3,cost:30000,buildSec:120,cashPerHr:9500,requiresRoad:false,water:true,desc:'Build on open water. Traps harvest crawfish.'},
  depot:{name:'SUPPLY DEPOT',short:'DEPOT',letter:'T',col:'#75705f',w:4,h:4,cost:60000,buildSec:210,cashPerHr:19000,requiresRoad:true,desc:'Regional distribution hub. Top income.'}
};
const T=32,MAX_PER_CITY=12,OFFLINE_CAP_HR=8,MARGIN=2;
const GRID_OK=[0,5]; // T_GRASS, T_PARK
function now(){return typeof performance!=='undefined'?performance.now():Date.now();}
// ---------------- Pure logic (unit tested) ----------------
function costFor(bp,count){return Math.round(bp.cost*Math.pow(1.18,count||0)/50)*50;}
function yieldRateFor(bp,count){return Math.round(bp.cashPerHr*(1-0.04*Math.min(count||0,10)));} // diminishing returns per same type
function finishedAt(s){return s.startedAt+BLUEPRINTS[s.bp].buildSec*1000;}
function overlapRect(a,b,pad){pad=pad||0;return a.x<b.x+b.w+pad&&a.x+a.w>b.x-pad&&a.y<b.y+b.h+pad&&a.y+a.h>b.y-pad;}
function structureRect(s){const bp=BLUEPRINTS[s.bp];return {x:s.x,y:s.y,w:bp.w*T,h:bp.h*T};}
// City ctx: {get(tx,ty), mw, mh, buildings, venues, features, owned, count, roadNear(r)}
function validatePlacement(ctx,s){
  const bp=BLUEPRINTS[s.bp],r={x:s.x,y:s.y,w:bp.w*T,h:bp.h*T};
  if(!bp)return {ok:false,reason:'UNKNOWN BLUEPRINT'};
  const tx0=Math.floor(r.x/T),ty0=Math.floor(r.y/T),tx1=Math.ceil((r.x+r.w)/T),ty1=Math.ceil((r.y+r.h)/T);
  if(tx0<MARGIN||ty0<MARGIN||tx1>ctx.mw-MARGIN||ty1>ctx.mh-MARGIN)return {ok:false,reason:'TOO CLOSE TO THE MAP EDGE'};
  for(let ty=ty0;ty<ty1;ty++)for(let tx=tx0;tx<tx1;tx++){
    const t=ctx.get(tx,ty);
    if(bp.water){if(t!==4)return {ok:false,reason:'WATER STRUCTURE NEEDS OPEN WATER'};}
    else if(!GRID_OK.includes(t))return {ok:false,reason:'BLOCKED TERRAIN'};
  }
  if(!bp.water&&ctx.buildings&&ctx.buildings.some(b=>overlapRect(r,b)))return {ok:false,reason:'OCCUPIED BY A BUILDING'};
  if(!bp.water&&ctx.venues&&ctx.venues.some(v=>overlapRect(r,{x:v.b.x,y:v.b.y,w:v.b.w,h:v.b.h})))return {ok:false,reason:'OCCUPIED BY A VENUE'};
  if(!bp.water&&ctx.features&&ctx.features.some(f=>overlapRect(r,f,24)))return {ok:false,reason:'OCCUPIED LANDMARK'};
  if(ctx.owned&&ctx.owned.some(o=>overlapRect(r,structureRect(o),16)))return {ok:false,reason:'TOO CLOSE TO YOUR OTHER STRUCTURES'};
  if(!bp.water&&bp.requiresRoad&&!ctx.roadNear(r))return {ok:false,reason:'NEEDS ROAD FRONTAGE'};
  if(ctx.count>=MAX_PER_CITY)return {ok:false,reason:'CITY LIMIT REACHED ('+MAX_PER_CITY+')'};
  return {ok:true,reason:'CLEAR'};
}
function accrue(structs,cash,atMs){
  let gained=0;
  for(const s of structs){
    if(s.completedAt==null)continue;
    const end=Math.min(atMs,s.completedAt+OFFLINE_CAP_HR*3600e3);
    const last=Math.max(s.collectedAt||s.completedAt,s.completedAt);
    if(end<=last)continue;
    const rate=yieldRateFor(BLUEPRINTS[s.bp],s.countAtBuild||0)/3600e3;
    gained+=rate*(end-last);
    s.collectedAt=end;
  }
  return {cash:Math.floor(cash+gained),gained:Math.floor(gained)};
}
if(typeof module!=='undefined')module.exports={BLUEPRINTS,costFor,yieldRateFor,validatePlacement,accrue,finishedAt,overlapRect,structureRect};
// ---------------- Browser layer ----------------
if(typeof window==='undefined')return;
const KEY='level29.buildings.v2';
let data={playerId:'',cities:{},spentTotal:0};
try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&s.v===2)data=s;}catch(_){}
if(!data.playerId)data.playerId='p'+Math.random().toString(36).slice(2,10)+Date.now().toString(36);
function persist(){try{localStorage.setItem(KEY,JSON.stringify({v:2,...data}));}catch(_){}if(window.level29Save)try{level29Save.save();}catch(_){}}
function cityKey(){try{return city.world?'world':DISTRICTS[distIdx].id;}catch(_){return 'world';}}
function cityState(){const k=cityKey();if(!data.cities[k])data.cities[k]={list:[]};return data.cities[k];}
function structs(){return cityState().list;}
function countOf(bpId){return structs().filter(s=>s.bp===bpId).length;}
function visible(){return state==='play'&&city;}
// ---- Cloud sync (optional; Supabase REST, RLS-guarded by player id) ----
const DB=window.BITB_BUILDING_DB;
function cloudPush(){
  if(!DB)return;
  const k=cityKey(),H={apikey:DB.key,'x-player-id':data.playerId};
  fetch(DB.url+'/rest/v1/bitb_player_buildings?player_id=eq.'+encodeURIComponent(data.playerId),{method:'DELETE',headers:H})
    .then(()=>{
      const rows=structs().map(s=>({player_id:data.playerId,city_key:k,structure:s}));
      if(!rows.length)return;
      return fetch(DB.url+'/rest/v1/bitb_player_buildings',{method:'POST',headers:{...H,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates'},body:JSON.stringify(rows)});
    }).catch(()=>{});
}
function cloudPull(){
  if(!DB)return Promise.resolve();
  return fetch(DB.url+'/rest/v1/bitb_player_buildings?select=city_key,structure&player_id=eq.'+encodeURIComponent(data.playerId),{headers:{apikey:DB.key,'x-player-id':data.playerId}})
    .then(r=>r.ok?r.json():[]).then(rows=>{
      for(const row of rows||[]){const k=row.city_key||'world';
        if(!data.cities[k])data.cities[k]={list:[]};
        if(row.structure&&row.structure.uid&&!data.cities[k].list.some(s=>s.uid===row.structure.uid))data.cities[k].list.push(row.structure);}
    }).catch(()=>{});
}
// ---- Meshes ----
let meshes=new Map(),ghost=null,ghostBp=null,gridOn=true,panelOpen=false,sel='shack',lastEarnSave=0;
function mat(col){return level29World.material(col,0,.85);}
function box(g,w,h,d,x,y,z,m){const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);g.add(b);return b;}
function buildMesh(s,ghosted){
  const bp=BLUEPRINTS[s.bp],g=new THREE.Group();
  const wall=ghosted?new THREE.MeshBasicMaterial({color:bp.col,transparent:true,opacity:.5,depthWrite:false}):level29World.facade(bp.col,'stucco');
  const roof=ghosted?new THREE.MeshBasicMaterial({color:'#556',transparent:true,opacity:.5,depthWrite:false}):mat('#4f5d4e'),trim=mat('#3d4a42');
  const done=!ghosted&&s.completedAt!=null;
  const wallH=s.bp==='watchtower'?46:(bp.w===bp.h?46:34);
  if(done){
    box(g,bp.w*T,10,bp.h*T,bp.w*T/2,5,bp.h*T/2,trim);
    box(g,bp.w*T-8,wallH,bp.h*T-8,bp.w*T/2,10+wallH/2,bp.h*T/2,wall);
    box(g,bp.w*T+6,4,bp.h*T+6,bp.w*T/2,10+wallH+2,bp.h*T/2,roof);
    if(s.bp==='watchtower'){box(g,8,60,8,bp.w*T/2,64,bp.h*T/2,wall);box(g,26,4,26,bp.w*T/2,96,bp.h*T/2,roof);}
    if(s.bp==='distillery'||s.bp==='depot'){const tank=new THREE.Mesh(new THREE.CylinderGeometry(14,14,34,16),wall);tank.position.set(bp.w*T*.72,58,bp.h*T*.7);g.add(tank);}
  }else{
    const pm=ghosted?new THREE.MeshBasicMaterial({color:'#c9a55a',transparent:true,opacity:.45,depthWrite:false}):mat('#8a6f3f');
    for(const [dx,dy] of [[.15,.15],[.85,.15],[.15,.85],[.85,.85]])box(g,6,42,6,bp.w*T*dx,21,bp.h*T*dy,pm);
    box(g,bp.w*T*.8,3,bp.h*T*.8,bp.w*T/2,40,bp.h*T/2,ghosted?pm:trim);
  }
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(bp.w*T*.8,150),16),new THREE.MeshBasicMaterial({map:signTex(bp.short,'#17232b',bp.col,512,72),side:THREE.DoubleSide,transparent:true}));
  sign.position.set(bp.w*T/2,done?wallH+16:46,bp.h*T+2);sign.rotation.y=Math.PI;g.add(sign);
  g.position.set(s.x,0,s.y);g.userData.level29Building=s.uid;
  return g;
}
function rebuildMeshes(){
  for(const m of meshes.values())if(m.parent)m.parent.remove(m);
  meshes.clear();
  if(!cityGroup)return;
  for(const s of structs())meshes.set(s.uid,cityGroup.add(buildMesh(s)));
}
const oldBuildCity=buildCity;
buildCity=function(){oldBuildCity.apply(this,arguments);rebuildMeshes();};
// ---- Map painting (ground texture + minimap) ----
function paintOne(m,s){
  if(!m||!m.getContext)return;
  const bp=BLUEPRINTS[s.bp];
  if(m===miniCv){const g=m.getContext('2d');g.fillStyle='#e0b64f';g.fillRect(Math.floor(s.x/T)*3,Math.floor(s.y/T)*3,bp.w*3,bp.h*3);g.fillStyle='#5a4a22';g.fillRect(Math.floor(s.x/T)*3+1,Math.floor(s.y/T)*3+1,bp.w*3-2,bp.h*3-2);}
  else{const g=m.getContext('2d');
    if(bp.water){g.fillStyle='#2d4a56';g.fillRect(s.x,s.y,bp.w*T,bp.h*T);g.strokeStyle='#e0b64f';g.lineWidth=3;g.strokeRect(s.x,s.y,bp.w*T,bp.h*T);}
    else{g.fillStyle='#5f5c4d';g.fillRect(s.x,s.y,bp.w*T,bp.h*T);g.strokeStyle='#e0b64f';g.lineWidth=3;g.strokeRect(s.x,s.y,bp.w*T,bp.h*T);}}
}
function repaintMaps(){
  if(groundCv)for(const s of structs())paintOne(groundCv,s);
  if(miniCv)for(const s of structs())paintOne(miniCv,s);
  const ground=cityGroup&&cityGroup.children&&cityGroup.children[0];
  if(ground&&ground.material&&ground.material.map)ground.material.map.needsUpdate=true;
}
const oldRenderGround=renderGround;
renderGround=function(){oldRenderGround.apply(this,arguments);repaintMaps();};
const blips=extraBlips;
extraBlips=function(){const out=blips.apply(this,arguments);if(!visible())return out;
  for(const s of structs())out.push({x:s.x+BLUEPRINTS[s.bp].w*T/2,y:s.y+BLUEPRINTS[s.bp].h*T/2,col:'#e0b64f',label:BLUEPRINTS[s.bp].letter});
  return out;};
// ---- Build mode ----
function groundCtx(){
  const roadNear=r=>{for(let ty=Math.floor((r.y-96)/T);ty<Math.ceil((r.y+r.h+96)/T);ty++)for(let tx=Math.floor((r.x-96)/T);tx<Math.ceil((r.x+r.w+96)/T);tx++){const t=city.get?city.get(tx,ty):-1;if(t===1||t===9)return true;}return false;};
  return {get:(tx,ty)=>city.get?city.get(tx,ty):0,mw:MW,mh:MH,buildings:city.buildings,venues:city.venues||[],features:city.features||[],owned:structs(),count:structs().length,roadNear};
}
function ghostSpot(){
  const px=player.car?player.car.x:player.x,py=player.car?player.car.y:player.y,a=player.car?player.car.a:player.aim;
  let x=px+Math.cos(a)*110,y=py+Math.sin(a)*110;
  if(gridOn){x=Math.round(x/16)*16;y=Math.round(y/16)*16;}
  return {x:Math.round(x),y:Math.round(y),bp:sel,uid:'ghost'};
}
function refreshGhost(){
  if(!visible()||panelOpen){if(ghost&&ghost.parent){ghost.parent.remove(ghost);ghost=null;ghostBp=null;}return;}
  const s=ghostSpot();
  if(!ghost||ghostBp!==sel){
    if(ghost&&ghost.parent)ghost.parent.remove(ghost);
    ghost=buildMesh(s,true);ghostBp=sel;
    if(cityGroup)cityGroup.add(ghost);else return;
  }
  ghost.position.set(s.x,0,s.y);
}
function tryPlace(){
  if(!visible()||panelOpen)return;
  const s=ghostSpot(),v=validatePlacement(groundCtx(),s);
  if(!v.ok){toast('CANNOT BUILD · '+v.reason);return;}
  const bp=BLUEPRINTS[s.bp],cost=costFor(bp,countOf(s.bp));
  if(cash<cost){toast('NEED '+money(cost)+' · YOU HAVE '+money(cash));return;}
  cash-=cost;data.spentTotal+=cost;
  const rec={uid:data.playerId+'-'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),bp:s.bp,x:s.x,y:s.y,startedAt:now(),countAtBuild:countOf(s.bp),completedAt:null,collectedAt:null};
  structs().push(rec);persist();cloudPush();
  if(cityGroup){meshes.set(rec.uid,cityGroup.add(buildMesh(rec)));}
  paintOne(groundCv,rec);paintOne(miniCv,rec);repaintMaps();
  toast('CONSTRUCTION STARTED · '+bp.name+' · '+money(cost));
  try{sfx('cash');}catch(_){}
}
// ---- Build menu panel ----
const panel=document.createElement('div');panel.id='buildPanel';
panel.style.cssText='position:fixed;inset:0;z-index:70;display:none;align-items:center;justify-content:center;background:#071017d9;padding:16px;color:#eee';
panel.innerHTML='<div style="width:min(560px,94vw);background:#0d1720;border:1px solid #2a3a46;border-radius:10px;padding:18px 20px;max-height:86vh;overflow:auto">'+
'<div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:6px"><b style="font:800 20px \'Barlow Condensed\',sans-serif;color:#e0b64f;letter-spacing:1px">LEVEL 29 CONSTRUCTION</b><span id="buildBudget" style="font:600 11px \'IBM Plex Mono\',monospace;color:#8fa3ad"></span></div>'+
'<div style="font:600 11px \'IBM Plex Mono\',monospace;color:#8fa3ad;margin:6px 0 12px">Number keys select · Y exits · T toggles grid snapping. Structures keep earning while you are away (up to 8 hours).</div>'+
'<div id="buildList"></div></div>';
document.body.appendChild(panel);
function renderPanel(){
  const list=panel.querySelector('#buildList'),budget=panel.querySelector('#buildBudget');
  if(!list)return;
  if(budget)budget.textContent='BUDGET '+money(cash)+' · SPENT '+money(data.spentTotal);
  list.innerHTML=Object.entries(BLUEPRINTS).map(([id,bp],i)=>{
    const n=countOf(id),cost=costFor(bp,n),rate=bp.cashPerHr?'$'+yieldRateFor(bp,n).toLocaleString()+'/HR':(bp.radar?'RADAR '+bp.radar+'M':'NO YIELD');
    return '<button data-bp="'+id+'" style="display:flex;width:100%;text-align:left;gap:10px;align-items:center;background:#101d26;border:1px solid '+(sel===id?'#e0b64f':'#24343f')+';border-radius:8px;padding:10px 12px;margin-bottom:8px;color:#eee;cursor:pointer;font-family:inherit">'+
    '<span style="font:800 18px \'Barlow Condensed\',sans-serif;color:'+bp.col+';width:26px">'+(i+1)+'</span>'+
    '<span style="flex:1"><b style="font:800 14px \'Barlow Condensed\',sans-serif;letter-spacing:.5px">'+bp.name+(n?' · OWNED '+n:'')+'</b>'+
    '<span style="display:block;font:500 11px \'IBM Plex Mono\',monospace;color:#9db0ba">'+bp.desc+'</span>'+
    '<span style="display:block;font:600 11px \'IBM Plex Mono\',monospace;color:#7d94a0">'+money(cost)+' · '+bp.buildSec+'s BUILD · '+rate+'</span></span></button>';
  }).join('');
  list.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{sel=b.dataset.bp;renderPanel();}));
}
function openPanel(){panelOpen=true;panel.style.display='flex';if(state==='play')state='shop';renderPanel();if(ghost&&ghost.parent){ghost.parent.remove(ghost);ghost=null;ghostBp=null;}}
function closePanel(){panelOpen=false;panel.style.display='none';if(state==='shop')state='play';}
panel.addEventListener('click',e=>{if(e.target===panel)closePanel();});
// ---- Input ----
addEventListener('keydown',e=>{
  if(e.target&&e.target.tagName==='INPUT')return;
  const k=e.key.toLowerCase();
  if(panelOpen&&(k==='y'||k==='escape')){e.preventDefault();e.stopImmediatePropagation();closePanel();return;}
  if(k==='y'&&!e.repeat&&state==='play'){e.preventDefault();e.stopImmediatePropagation();openPanel();return;}
  if(k==='t'&&!e.repeat&&state==='play'&&!panelOpen){e.preventDefault();gridOn=!gridOn;toast('BUILD GRID '+(gridOn?'ON':'OFF'));return;}
  if(panelOpen&&/^[1-7]$/.test(k)){const id=Object.keys(BLUEPRINTS)[+k-1];if(id){sel=id;renderPanel();}return;}
  if(k==='x'&&state==='play'&&!panelOpen){e.preventDefault();e.stopImmediatePropagation();tryPlace();return;}
},true);
// ---- Frame loop: finish construction, accrue yields, radar ----
const oldUpdate=update;
update=function(){oldUpdate.apply(this,arguments);
  if(!visible())return;
  let changed=false;
  for(const s of structs()){
    if(s.completedAt==null&&now()>=finishedAt(s)){
      s.completedAt=now();s.collectedAt=now();changed=true;
      toast(BLUEPRINTS[s.bp].name+' COMPLETE');
    }
  }
  if(changed){persist();rebuildMeshes();repaintMaps();cloudPush();}
  const a=accrue(structs(),0,now());
  if(a.gained>0){
    cash+=a.gained;
    const cs=cityState();cs.earnedTotal=(cs.earnedTotal||0)+a.gained;
    // Throttle disk writes: accrual updates every frame, saves every ~10s.
    if(now()-(lastEarnSave||0)>10000){lastEarnSave=now();persist();}
    if(frame%900===0)toast('PROPERTIES EARNED '+money(a.gained));
  }
  refreshGhost();
  const px=player.car?player.car.x:player.x,py=player.car?player.car.y:player.y;
  for(const s of structs()){const bp=BLUEPRINTS[s.bp];
    if(bp.radar&&s.completedAt!=null&&dist(px,py,s.x,s.y)<bp.radar){
      for(const z of zombies)if(z.alive&&dist(z.x,z.y,s.x,s.y)<bp.radar)z.alert=true;}}
};
// ---- HUD hint ----
const oldDrawHUD=drawHUD;
drawHUD=function(){oldDrawHUD.apply(this,arguments);
  if(!visible()||panelOpen)return;
  const bp=BLUEPRINTS[sel];
  const mobile=typeof touch!=='undefined'&&Object.values(touch).some(Boolean);
  hudText('Y · CONSTRUCT   '+bp.short+' ('+money(costFor(bp,countOf(sel)))+')   X · PLACE   T · GRID '+(gridOn?'ON':'OFF'),SW/2,SH-(mobile?180:120),11,'#e0b64f','center','700 ');
};
// ---- Sync on load ----
cloudPull().then(()=>{if(city)rebuildMeshes();});
window.level29Buildings={BLUEPRINTS,costFor,yieldRateFor,validatePlacement,accrue,finishedAt,structs:()=>structs(),state:()=>data,persist,tryPlace,openPanel,closePanel,setBlueprint:id=>{sel=id;}};
})();
