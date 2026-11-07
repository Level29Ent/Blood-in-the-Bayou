'use strict';
// LEVEL 29 open world: one connected map with several areas, the Gulf of America (boats, fishing, hidden cash),
// the Level 29 Tower (apartments + garage + vehicle customization), a store for upgrades / customization, and performance fixes.
// Load after world.js.
(function(){
const ZONE_NAMES={gulf:'THE BAYOU',quarter:'FRENCH QUARTER',marina:'MARINA DISTRICT',hollywood:'HOLLYWOOD HILLS',downtown:'DOWNTOWN HOUSTON',base:'CAMP LEJEUNE',forest:'PINE FOREST',mountain:'LEVEL 29 GARDENS'};
const CHAPTER_SAFE=['3,0','5,0','6,5','7,0','8,2','7,4','5,7'];
const SAVE_KEY='level29.openworld.v1';
let save={apartment:false,garage:[],custom:{},owned:{},fishCaught:0,caches:[]};
try{const st=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(st)save=Object.assign(save,st);}catch(_){}
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(save));}catch(_){}}
window.persistOpenWorld=persist;
const zoneAt=(x,y)=>{const tx=Math.floor(x/TILE),ty=Math.floor(y/TILE);if(tx<GULF_X+6)return 'gulf';return worldZoneAtTile(tx,ty);};
const tileXY=(tx,ty)=>[(tx+.5)*TILE,(ty+.5)*TILE];

// ---------------------------------------------------------------- curved roads
// Winding roads layered over the grid: they are painted as smooth asphalt, valleys are cut through the mountains, and
// anything ordinary standing in the way is cleared. Grid streets stay as they are for traffic and missions.
const CURVE_DEFS=[
  // Each scenic road runs down the middle of a block corridor and meets the grid streets at right angles (at the top of each
  // sweep), so it flows between streets instead of riding on top of them.
  {id:'summit',name:'SUMMIT SWITCHBACKS',pts:[[46.5,121],[60.5,126],[74.5,121],[88.5,126],[102.5,121],[116.5,126],[130.5,121]]},
  {id:'pine',name:'PINE TRAIL',pts:[[121.5,60.5],[125.5,74.5],[121.5,88.5],[125.5,102.5]]},
  {id:'bayou',name:'BAYOU PARKWAY',pts:[[74.5,97.5],[88.5,93.5],[102.5,97.5],[116.5,93.5]]}
];
function sampleCurve(pts){ // Catmull-Rom through the control points, returned in pixels about 8px apart
  const out=[],P=[pts[0],...pts,pts[pts.length-1]];
  for(let i=1;i<P.length-2;i++){const a=P[i-1],b=P[i],c=P[i+1],d=P[i+2],n=Math.max(4,Math.ceil(Math.hypot(c[0]-b[0],c[1]-b[1])*4));
    for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t;
      const f=(i0)=>.5*((2*b[i0])+(-a[i0]+c[i0])*t+(2*a[i0]-5*b[i0]+4*c[i0]-d[i0])*t2+(-a[i0]+3*b[i0]-3*c[i0]+d[i0])*t3);
      out.push({x:f(0)*TILE+TILE/2,y:f(1)*TILE+TILE/2});}}
  const e=pts[pts.length-1];out.push({x:e[0]*TILE+TILE/2,y:e[1]*TILE+TILE/2});return out;
}
function carveCurves(c){
  c.curves=CURVE_DEFS.map(d=>{const pts=sampleCurve(d.pts);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const q of pts){x0=Math.min(x0,q.x);y0=Math.min(y0,q.y);x1=Math.max(x1,q.x);y1=Math.max(y1,q.y);}return {id:d.id,name:d.name,pts,box:[x0-260,y0-260,x1+260,y1+260]};});
  c.curveInfo=(x,y)=>{let best=null,bd=1e18;for(const k of c.curves){if(x<k.box[0]||y<k.box[1]||x>k.box[2]||y>k.box[3])continue;
    for(let i=0;i<k.pts.length;i+=2){const q=k.pts[i],dd=(q.x-x)*(q.x-x)+(q.y-y)*(q.y-y);if(dd<bd){bd=dd;best=k;}}}return best?{d:Math.sqrt(bd),name:best.name}:null;};
  c.curveDist=(x,y)=>{const r=c.curveInfo(x,y);return r?r.d:1e9;};
  const near=(x0,y0,x1,y1,r)=>{for(const k of c.curves){for(let i=0;i<k.pts.length;i+=3){const q=k.pts[i],dx=Math.max(x0-q.x,0,q.x-x1),dy=Math.max(y0-q.y,0,q.y-y1);if(dx*dx+dy*dy<r*r)return true;}}return false;};
  c.curveConflicts=[];
  c.buildings=c.buildings.filter(b=>{if(!near(b.x,b.y,b.x+b.w,b.y+b.h,TILE*3.3))return true;
    if(b.kind==='normal'&&!b.venue){for(let y=b.y/TILE;y<(b.y+b.h)/TILE;y++)for(let x=b.x/TILE;x<(b.x+b.w)/TILE;x++)c.g[y*MW+x]=T_LOT;return false;}
    c.curveConflicts.push([b.kind,Math.round(b.x/TILE),Math.round(b.y/TILE)]);return true;});
  c.trees=c.trees.filter(t=>c.curveDist(t.x,t.y)>TILE*2.4);
  c.parked=c.parked.filter(p=>c.curveDist(p.x,p.y)>TILE*2.4);
}
function paintCurves(g,k,mini){
  for(const c of city.curves){
    const path=()=>{g.beginPath();c.pts.forEach((q,i)=>i?g.lineTo(q.x*k,q.y*k):g.moveTo(q.x*k,q.y*k));};
    const S=k; // scale (1 for ground canvas, 3/TILE for the minimap)
    g.lineJoin='round';g.lineCap=mini?'round':'butt';
    if(!mini){
      // Paint only outside the grid road tiles so the two road types meet in a clean junction (no edge lines across a street).
      const bx0=Math.max(0,Math.floor(c.box[0]/TILE)),by0=Math.max(0,Math.floor(c.box[1]/TILE)),bx1=Math.min(MW-1,Math.ceil(c.box[2]/TILE)),by1=Math.min(MH-1,Math.ceil(c.box[3]/TILE));
      g.save();g.beginPath();g.rect(c.box[0],c.box[1],c.box[2]-c.box[0],c.box[3]-c.box[1]);
      for(let ty=by0;ty<=by1;ty++)for(let tx=bx0;tx<=bx1;tx++){const t=city.get(tx,ty);if(t===T_ROAD||t===T_BRIDGE)g.rect(tx*TILE,ty*TILE,TILE,TILE);}
      // Clip using a second mask: duplicate rectangles in the even-odd path can reopen holes.
      g.clip('evenodd');
      g.beginPath();g.rect(0,0,WORLD,WORLD);
      for(const b of city.buildings)if(![city.farm,city.recreationParcel,city.airportParcel].filter(Boolean).some(r=>b.x>=r.x&&b.y>=r.y&&b.x+b.w<=r.x+r.w&&b.y+b.h<=r.y+r.h))g.rect(b.x-6,b.y-6,b.w+12,b.h+12);
      for(const r of [city.farm,city.recreationParcel,city.airportParcel].filter(Boolean))g.rect(r.x,r.y,r.w,r.h);
      g.clip('evenodd');
      path();g.strokeStyle='rgba(30,26,18,.28)';g.lineWidth=TILE*4.4*S;g.stroke();            // soft verge
      path();g.strokeStyle='#cfcfc6';g.lineWidth=TILE*3.35*S;g.stroke();                         // edge lines
      path();g.strokeStyle='#11161b';g.lineWidth=TILE*3.05*S;g.stroke();                         // asphalt
      path();g.strokeStyle='rgba(255,255,255,.015)';g.lineWidth=TILE*2.2*S;g.stroke();
      g.setLineDash([26*S,22*S]);path();g.strokeStyle='#d7b13b';g.lineWidth=3*S;g.stroke();g.setLineDash([]);
      g.restore();
    } else {path();g.strokeStyle='#d9d9d2';g.lineWidth=TILE*2.6*S;g.stroke();}
  }
}
// ---------------------------------------------------------------- world wiring
const prevGen=genCity;
genCity=function(di){
  if(di==='world'||state==='menu')return prevGen(di);
  const c=prevGen('world');
  carveCurves(c);
  buildOpenWorld(c);
  // Leave driving lanes, intersections and venue entrances clear. Preserve boats.
  const spaced=[];
  for(const p of c.parked){
    if(p.type==='boat'){spaced.push(p);continue;}
    if(c.venues.some(v=>Math.hypot(p.x-v.doorX,p.y-v.doorY)<110))continue;
    const tx=Math.floor(p.x/TILE),ty=Math.floor(p.y/TILE);
    if((c.get(tx,ty)===T_ROAD||c.get(tx,ty)===T_BRIDGE)&&
      (isRoadCol(tx-2)||isRoadCol(tx+2))&&(isRoadCol(ty-2)||isRoadCol(ty+2)))continue;
    if(spaced.some(q=>Math.hypot(q.x-p.x,q.y-p.y)<165))continue;
    spaced.push(p);
  }
  c.parked=spaced;
  return c;
};
function safeFor(c,chapter){if(c.mansion)return c.mansion;const key=CHAPTER_SAFE[chapter]||CHAPTER_SAFE[0];return (c.safes||[]).find(s=>s.bx+','+s.by===key)||c.safe;}
function teleportChapter(di,announce){
  const s=safeFor(city,di),fr=s.front||{x:s.x,y:s.y+30,a:-Math.PI/2};player.x=fr.x;player.y=fr.y;player.a=fr.a;player.vx=player.vy=0;view.yaw=fr.a;view.pitch=0;view.look=0;view.lastPlayer=player;
  clearSpawn();snapCamera();zombies=zombies.filter(z=>dist(z.x,z.y,player.x,player.y)>500);
  for(let k=0;k<22;k++){const p=randomRoadPoint(player.x,player.y,300,1100);if(p)spawnZombieAt(p.x,p.y);}
  if(announce)banner={big:ZONE_NAMES[['quarter','hollywood','downtown','base','base','forest','mountain'][di]],small:'CHAPTER '+(di+1)+' OF '+DISTRICTS.length+' · MISSIONS '+(di*MISSIONS_PER+1)+'–'+(di*MISSIONS_PER+MISSIONS_PER),t:240};
  placeMissionStart();
}
const CHAPTER_ZONE=['quarter','hollywood','downtown','base','base','forest','mountain'];
const prevTravel=travelTo;
travelTo=function(di){
  if(city&&city.world&&builtCity===city&&player){ // same continuous map: no teleport, the next missions simply move to the next area
    distIdx=di;D=DISTRICTS[di];city.safe=safeFor(city,di);
    banner={big:ZONE_NAMES[CHAPTER_ZONE[di]],small:'CHAPTER '+(di+1)+' OF '+DISTRICTS.length+' · MISSIONS '+(di*MISSIONS_PER+1)+'–'+(di*MISSIONS_PER+MISSIONS_PER)+' · DRIVE THERE',t:260};
    placeMissionStart();return;
  }
  prevTravel(di);
  if(city&&city.world){distIdx=di;D=DISTRICTS[di];teleportChapter(di,true);}
};
// All 140 missions live on the one map: each chapter owns an area, and its mission markers appear in that area.
const prevPlaceMission=placeMissionStart;
placeMissionStart=function(){
  if(!city||!city.world||!player){prevPlaceMission();return;}
  const ch=Math.min(DISTRICTS.length-1,Math.floor(missionIdx/MISSIONS_PER)),s=safeFor(city,ch);
  const px=player.x,py=player.y,inArea=zoneAt(px,py)===CHAPTER_ZONE[ch]&&dist(px,py,s.x,s.y)<2300;
  if(!inArea){player.x=s.x;player.y=s.y;}
  try{prevPlaceMission();}finally{player.x=px;player.y=py;}
  if(mission&&mission.start){
    const d=dist(px,py,mission.start.x,mission.start.y);
    if(d>1400)objective+=' '+ZONE_NAMES[zoneAt(mission.start.x,mission.start.y)]+' · '+Math.round(d/10)+' M AWAY. OPEN THE MAP WITH TAB.';
  }
};
// TAB map: the whole open world with every chapter area and mission zone.
const prevFullMap=drawFullMap;
drawFullMap=function(){
  const Dsave=D;if(city&&city.world){const pad=a=>{const o=(a||[]).slice();for(let i=o.length;i<ROADS.length;i++)o.push('COUNTY RD '+(i+1));return o;};D=Object.assign({},D,{v:pad(D.v),h:pad(D.h)});}
  try{prevFullMap();}finally{D=Dsave;}
  if(!city||!city.world)return;
  const S=Math.min(SW,SH)-80,X=(SW-S)/2,Y=(SH-S)/2,sc=S/WORLD,ch=Math.min(DISTRICTS.length-1,Math.floor(missionIdx/MISSIONS_PER));
  cx.fillStyle='rgba(8,10,12,.92)';cx.fillRect(SW/2-330,Y-56,660,40);
  hudText('LEVEL 29 OPEN WORLD · ALL MISSION AREAS',SW/2,Y-34,22,'#f4c355','center','900 ');
  cx.font="700 11px 'Barlow Condensed'";cx.textAlign='center';cx.textBaseline='middle';
  const seen={};
  for(let i=0;i<DISTRICTS.length;i++){
    const sf=safeFor(city,i),col=i<ch?'#3cc86e':i===ch?'#f4c355':'#8a949a',bx=X+sf.x*sc,by=Y+sf.y*sc;
    cx.fillStyle=col;cx.beginPath();cx.arc(bx,by,9,0,7);cx.fill();cx.fillStyle='#13191d';cx.font="900 12px 'Barlow Condensed'";cx.fillText(String(i+1),bx,by+.5);
    const nm=ZONE_NAMES[CHAPTER_ZONE[i]]+' · '+(i*MISSIONS_PER+1)+'-'+(i*MISSIONS_PER+MISSIONS_PER);cx.font="700 11px 'Barlow Condensed'";
    const w=cx.measureText(nm).width+10,k=Math.round(bx/20)+','+Math.round(by/20),dy=seen[k]?24:15;seen[k]=1;
    cx.fillStyle='rgba(8,10,12,.78)';cx.fillRect(bx-w/2,by+dy-8,w,14);cx.fillStyle=col;cx.fillText(nm,bx,by+dy);
  }
  const gx=X+GULF_X*TILE*sc*.45,gy=Y+WORLD*sc*.22;cx.fillStyle='rgba(230,245,255,.85)';cx.font="800 13px 'Barlow Condensed'";cx.fillText('THE BAYOU',gx,gy);
  hudText('GREEN = DONE · GOLD = CURRENT CHAPTER · GREY = LATER CHAPTERS',SW/2,Y+S+28,12,'#c9d1d4','center','600 ');
};
const prevStreet=streetAt;
streetAt=function(x,y){
  if(!city||!city.world)return prevStreet(x,y);
  const z=ZONE_NAMES[zoneAt(x,y)];const tx=Math.floor(x/TILE);
  const cv=city.curveInfo&&city.curveInfo(x,y);if(cv&&cv.d<64)return z+' · '+cv.name;
  if(tx<GULF_X+2)return z;
  return z+' · '+prevStreet(x,y);
};
let resident=null, interior=null, fish=null, fishingBar=null, openTab='home', customCar=null, perfChunks=[], latestCity=null;
function buildOpenWorld(c){
  c.world=true;c.regionNames=ZONE_NAMES;c.width=MW;c.height=MH;c.rocks=[];
  c.residence=null;
  // Existing services stay enterable; each starting area gets its own safehouse.
  for(const s of c.safes||[]){if(!s.B.venue)c.venues.push(createVenue(s.B,'safe','world-'+s.bx+'-'+s.by));}
  for(const zone of ['marina','hollywood','downtown','base'])for(const id of ['garage','armory','spray','business']){
    const candidate=c.buildings.find(b=>!b.venue&&b.kind==='normal'&&b.w>=128&&b.h>=128&&zoneAt(b.x+b.w/2,b.y+b.h/2)===zone);
    if(!candidate)continue;
    const v=createVenue(candidate,id,'world-'+zone);c.venues.push(v);
    for(let ty=candidate.y/TILE;ty<(candidate.y+candidate.h)/TILE;ty++)for(let tx=candidate.x/TILE;tx<(candidate.x+candidate.w)/TILE;tx++)c.g[ty*MW+tx]=T_LOT;
  }
  // Reserve the luxury tower footprint: the ground-floor lobby and garage are open.
  const tb=c.buildings.find(b=>b.kind==='tower'&&zoneAt(b.x,b.y)==='marina');
  if(tb){tb.venue='residence';for(let y=tb.y/TILE;y<(tb.y+tb.h)/TILE;y++)for(let x=tb.x/TILE;x<(tb.x+tb.w)/TILE;x++)c.g[y*MW+x]=T_LOT;
    c.residence={b:tb,floor:420,lobby:{x:tb.x+tb.w*.25,y:tb.y+tb.h+24},garage:{x:tb.x+tb.w*.75,y:tb.y+tb.h+24}};}
  for(const f of c.features){
    if(f.kind==='park'){
      const z=zoneAt(f.x,f.y);f.kind=z==='quarter'?'cemetery':z==='hollywood'?'skatepark':z==='marina'?'market':z==='downtown'?'basketball':'park';
    }
    if(f.kind==='mountain'){const cx=f.x+f.w/2,cy=f.y+f.h/2;c.rocks.push({x:cx-40,y:cy+55,r:24,a:1});}
  }
  const fs=c.features.find(f=>f.kind==='field');if(fs)fs.kind='training';
  const beachY=41*TILE;
  c.pier={x0:(GULF_X-18)*TILE,x1:(GULF_X+6)*TILE,y:beachY,width:3*TILE};
  // Pier is walkable and has a broad head with moorings. No land car can survive driving into the Gulf.
  for(let y=40;y<=42;y++)for(let x=GULF_X-18;x<GULF_X+6;x++)c.g[y*MW+x]=T_BRIDGE;
  for(let y=37;y<=45;y++)for(let x=GULF_X-20;x<GULF_X-17;x++)c.g[y*MW+x]=T_BRIDGE;
  c.parked.push({x:(GULF_X-19)*TILE,y:36*TILE,a:Math.PI,type:'boat'},{x:(GULF_X-15)*TILE,y:39*TILE,a:Math.PI,type:'boat'},
    {x:(GULF_X-14)*TILE,y:44*TILE,a:Math.PI,type:'yacht'});
  c.caches=[{id:'harbor-locker',x:(GULF_X+5)*TILE,y:35*TILE,amt:4500},{id:'pine-cache',x:112*TILE,y:81*TILE,amt:8500},
    {id:'summit-cache',x:83*TILE,y:113*TILE,amt:15000}];
  c.formerMountains=c.features.filter(f=>f.kind==='mountain').map(f=>({...f}));
  for(const f of c.features)if(f.kind==='mountain')f.kind='garden';
  c.rocks=c.rocks.filter(r=>!c.formerMountains.some(f=>r.x>=f.x&&r.x<=f.x+f.w&&r.y>=f.y&&r.y<=f.y+f.h));
  const forestF=c.features.filter(f=>f.kind==='forest');
  c.heightAt=(x,y)=>{
    if(interior==='apartment'&&c.residence&&x>c.residence.b.x-20&&x<c.residence.b.x+c.residence.b.w+20&&y>c.residence.b.y-20&&y<c.residence.b.y+c.residence.b.h+20)return c.residence.floor;
    for(const f of forestF)if(x>f.x&&x<f.x+f.w&&y>f.y&&y<f.y+f.h)return Math.max(0,3*Math.sin(x/95)*Math.sin(y/130));return 0;
  };
  indexTrees(c);
  // Cache collision rectangles once, rather than allocating walls on every collision check.
  for(const v of c.venues||[]){const b=v.b,th=3;
    v.colliderWalls=[{x:b.x,y:b.y,w:b.w,h:th},{x:b.x,y:b.y,w:th,h:b.h},{x:b.x+b.w-th,y:b.y,w:th,h:b.h},
      {x:b.x,y:b.y+b.h-th,w:(b.w-v.doorW)/2,h:th},{x:v.doorX+v.doorW/2,y:b.y+b.h-th,w:(b.w-v.doorW)/2,h:th}];
    v.colliderDoor={x:v.doorX-v.doorW/2,y:v.doorY-th,w:v.doorW,h:th};
  }
  c.safe=safeFor(c,distIdx);latestCity=c;
}

// ---------------------------------------------------------------- interiors / fast collision
const prevBlocked=blockedCircle;
blockedCircle=function(x,y,r){
  if(!city||!city.world)return prevBlocked(x,y,r);
  const isZ=!!(moverCtx&&moverCtx.alive!==undefined);
  // Businesses: zombies are locked out completely.
  for(const v of (window.level29Navigation?.nearVenues(x,y,r)||city.venues)){const b=v.b;if(x+r<b.x||x-r>b.x+b.w||y+r<b.y||y-r>b.y+b.h)continue;
    if(isZ)return true; // zombies can never enter any business, safehouse or fortress
    if(v.colliderWalls.some(q=>hitRect(x,y,r,q))||(!v.open&&!isZ&&hitRect(x,y,r,v.colliderDoor))||(!v.open&&isZ&&!v.zOpen&&hitRect(x,y,r,v.colliderDoor))||v.furniture.some(q=>hitRect(x,y,r,q)))return true;
  }
  if(resident){const b=resident.b;if(x+r>b.x&&x-r<b.x+b.w&&y+r>b.y&&y-r<b.y+b.h){
    if(isZ||moverCtx&&moverCtx.boat)return true;
    const rooms=interior==='apartment'?resident.apartmentWalls:resident.lobbyWalls;
    if(rooms&&rooms.some(q=>hitRect(x,y,r,q)))return true;
  }}
  return solidAt(x-r,y-r)||solidAt(x+r,y-r)||solidAt(x-r,y+r)||solidAt(x+r,y+r)||solidAt(x,y-r)||solidAt(x,y+r)||solidAt(x-r,y)||solidAt(x+r,y)||treeHit(x,y,r)
    ||city.rocks.some(q=>(x-q.x)**2+(y-q.y)**2<(r+q.r*.8)**2);
};
const prevTH=terrainHeight;
terrainHeight=function(x,y){return city&&city.world&&city.heightAt?city.heightAt(x,y):prevTH(x,y);};
const prevSpawn=spawnZombieAt;
spawnZombieAt=function(x,y,type){if(city&&city.world){for(const v of city.venues)if(insideVenue(v,{x,y}))return null;if(resident&&x>resident.b.x&&x<resident.b.x+resident.b.w&&y>resident.b.y&&y<resident.b.y+resident.b.h)return null;}
  return prevSpawn(x,y,type);
};
const prevExit=exitCar;
exitCar=function(forced){if(player&&player.car&&player.car.boat&&!forced){const c=player.car;for(let dy=-75;dy<=75;dy+=15)for(let dx=-75;dx<=75;dx+=15){if(!blockedCircle(c.x+dx,c.y+dy,player.r)){player.x=c.x+dx;player.y=c.y+dy;c.driven=false;player.car=null;sfx('door');return;}}
  toast('MOOR NEAR THE PIER OR SHORE TO DISEMBARK');return;}prevExit(forced);};
const prevWaterUpdate=updateCar;
updateCar=function(c,input){if(c.boat&&c.dead)return;if(city&&city.world&&!input&&!c.burnT&&Math.abs(c.v)<.01&&Math.abs(c.vs)<.01&&!c.ai)return;
  prevWaterUpdate(c,input);
};

// ---------------------------------------------------------------- boating models
const prevCarMesh=makeCarMesh;
makeCarMesh=function(c){if(!c.boat)return prevCarMesh(c);
  const g=new THREE.Group(),L=c.spec.len,W=c.spec.wid,yacht=c.type==='yacht'||c.type==='cabinboat';
  const paint=new THREE.MeshPhysicalMaterial({name:'boatPaint',color:c.col,metalness:.35,roughness:.22,clearcoat:1,clearcoatRoughness:.12});
  const hull=new THREE.Shape();hull.moveTo(-L/2,-W/2);hull.lineTo(L*.22,-W/2);hull.quadraticCurveTo(L*.54,-W*.35,L/2,0);hull.quadraticCurveTo(L*.54,W*.35,L*.22,W/2);hull.lineTo(-L/2,W/2);hull.closePath();
  const hgeo=new THREE.ExtrudeGeometry(hull,{depth:8,bevelEnabled:true,bevelThickness:2,bevelSize:1.8,bevelSegments:3,steps:1,curveSegments:16});hgeo.rotateX(-Math.PI/2);hgeo.translate(0,5,0);g.add(new THREE.Mesh(hgeo,paint));
  const deck=new THREE.MeshStandardMaterial({color:'#e8e1ce',roughness:.65,metalness:0}),glass=new THREE.MeshPhysicalMaterial({name:'boatGlass',color:'#b5cfd9',metalness:0,roughness:.08,transmission:.78,thickness:.3,ior:1.45,transparent:true,opacity:1,depthWrite:false});
  addPart(g,L*.7,1,W*.86,-L*.09,9,0,deck);
  for(const side of [-1,1])addPart(g,L*.18,7,.5,-L*.10,13,side*W*.34,glass);const screen=addPart(g,.6,7,W*.68,0,13,0,glass);screen.rotation.z=-.15;
  addPart(g,12,3,W*.64,-L*.30,11,0,lam('#b7aa90'));
  addPart(g,7,11,6,-L*.5-2,3,0,lam('#24282e'));
  if(yacht){for(const side of [-1,1])addPart(g,L*.37,14,1.5,-L*.12,19,side*W*.37,deck);addPart(g,L*.37,1.5,W*.74,-L*.12,26,0,deck);for(const side of [-1,1])addPart(g,L*.26,10,.5,-L*.14,31,side*W*.325,glass);addPart(g,L*.43,1.6,W*.88,-L*.12,37,0,deck);
    for(const z of [-W*.37,W*.37])addPart(g,L*.5,1,1,L*.22,17,z,lam('#b8c4c9'));}
  else{addPart(g,22,2,1,2,16,-W*.33,deck);addPart(g,22,2,1,2,16,W*.33,deck);}
  const chrome=new THREE.MeshStandardMaterial({color:'#c3cccd',metalness:.8,roughness:.26}),teak=lam('#967354'),rubber=lam('#252b2e');
  for(let x=-L*.34;x<L*.29;x+=5)addPart(g,1,.3,W*.7,x,10,0,teak);
  for(const side of [-1,1]){
    for(const x of [-L*.39,-L*.1,L*.22])addPart(g,.65,7,.65,x,13,side*W*.43,chrome);
    addPart(g,L*.64,.7,.7,-L*.07,16.5,side*W*.43,chrome);
    addPart(g,4,.7,1,-L*.35,11,side*W*.32,chrome);
    addPart(g,L*.68,1,.8,-L*.07,7,side*W*.49,rubber);
    for(const x of [-L*.25,0]){const f=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.4,6,8),deck);f.position.set(x,6,side*W*.52);g.add(f);}
    addPart(g,3,.8,1.5,L*.27,15,side*W*.38,new THREE.MeshBasicMaterial({color:side<0?'#dd5544':'#51b487'}));
  }
  addPart(g,L*.19,5,W*.34,-L*.27,13,0,lam('#d2c5ac'));
  const helm=new THREE.Mesh(new THREE.TorusGeometry(2,.25,6,18),chrome);helm.position.set(-L*.06,16,0);helm.rotation.y=Math.PI/2;g.add(helm);
  const prop=new THREE.Mesh(new THREE.TorusGeometry(2,.45,6,12),rubber);prop.position.set(-L*.53,1,0);prop.rotation.y=Math.PI/2;g.add(prop);
  addPart(g,1,2,5,-L*.53,1,0,chrome);addPart(g,.8,5,1,-L*.53,1,0,chrome);
  addSign(g,yacht?'LEVEL 29 YACHT':'LEVEL 29',yacht?46:28,6,-L/2-.3,10,0,'#d9b861').rotation.y=-Math.PI/2;
  g.userData={paint,dead:false,col:c.col,top:16,bar:null};scene.add(g);return g;
};

// ---------------------------------------------------------------- architectural additions
const mCache=new Map();
function mat(c,metal=0,rough=.7){const key=c+metal+rough;if(!mCache.has(key))mCache.set(key,new THREE.MeshStandardMaterial({color:c,metalness:metal,roughness:rough}));return mCache.get(key);}
function part(g,w,h,d,x,y,z,col,metal=0){return addPart(g,w,h,d,x,y,z,mat(col,metal));}
function frameRoom(g,b,y,col){part(g,b.w,2,b.h,b.x+b.w/2,y,b.y+b.h/2,col);}
function wall(g,q,floor,h,col){part(g,q.w,h,q.h,q.x+q.w/2,floor+h/2,q.y+q.h/2,col);}
function tower(c){
  resident=c.residence;if(!resident)return;
  const b=resident.b,g=new THREE.Group();g.name='level29-residence';cityGroup.add(g);
  const glass=canvasTex(512,512,(ctx,w,h)=>{ctx.fillStyle='#29424f';ctx.fillRect(0,0,w,h);for(let y=0;y<h;y+=32)for(let x=0;x<w;x+=32){ctx.fillStyle=(x/32+y/32)%3?'#476975':'#d5b674';ctx.fillRect(x+2,y+3,28,26);ctx.fillStyle='#1e343f';ctx.fillRect(x+2,y+3,10,26);}});
  const glassMat=h=>{const t=glass.clone();t.needsUpdate=true;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,Math.max(.2,h/340));return new THREE.MeshStandardMaterial({map:t,roughness:.3,metalness:.45,emissive:0x1b1608,emissiveMap:t,emissiveIntensity:isNight()?1.4:.25});};
  const gm=glassMat(420);
  const fl=resident.floor,curtain=new THREE.MeshPhysicalMaterial({name:'buildingGlass',color:'#b9d0d6',transmission:.78,thickness:.3,ior:1.45,transparent:true,opacity:1,roughness:.1,metalness:0,depthWrite:false,side:THREE.DoubleSide});
  const s1=box(b.w,fl-48,b.h,gm),s2=box(b.w,44,b.h,curtain),s3=box(b.w,250,b.h,glassMat(250));
  s1.position.set(b.x+b.w/2,48+(fl-48)/2,b.y+b.h/2);s2.position.set(b.x+b.w/2,fl+22,b.y+b.h/2);s3.position.set(b.x+b.w/2,fl+44+125,b.y+b.h/2);g.add(s1,s2,s3);part(g,b.w,3,b.h,b.x+b.w/2,fl+44,b.y+b.h/2,'#e4dccd');
  // Stepped crown with a lit gold lantern, spire, and a two-story podium with colonnade.
  const topY=fl+296,cxw=b.x+b.w/2,czw=b.y+b.h/2;
  const c1=box(b.w*.74,70,b.h*.74,glassMat(70));c1.position.set(cxw,topY+38,czw);g.add(c1);part(g,b.w*.82,4,b.h*.82,cxw,topY+74,czw,'#d9c58f',.6);
  const c2=box(b.w*.46,46,b.h*.46,glassMat(46));c2.position.set(cxw,topY+99,czw);g.add(c2);part(g,b.w*.54,3,b.h*.54,cxw,topY+124,czw,'#d9c58f',.6);
  part(g,5,90,5,cxw,topY+170,czw,'#d9c58f',.7);part(g,16,6,16,cxw,topY+212,czw,'#ffd88a',0).material=new THREE.MeshBasicMaterial({color:'#ffd88a'});
  part(g,b.w+54,4,46,cxw,48,b.y+b.h+22,'#e3dccd');part(g,b.w+58,3,50,cxw,51,b.y+b.h+22,'#b9a26b',.6);
  for(let x=b.x-18;x<=b.x+b.w+22;x+=34)part(g,5,48,5,x,24,b.y+b.h+42,'#efe9db');
  for(let y=70;y<fl;y+=70)part(g,b.w+8,2.4,b.h+8,cxw,y,czw,'#c9b27a',.6);
  part(g,b.w+22,6,b.h+22,b.x+b.w/2,52,b.y+b.h/2,'#d7d3ca');part(g,b.w+10,6,b.h+10,b.x+b.w/2,fl+296,b.y+b.h/2,'#dfd7c8');
  for(const x of [b.x+2,b.x+b.w/2,b.x+b.w-2])part(g,5,fl+294,b.h+2,x,(fl+294)/2,b.y+b.h/2,'#b4a17e',.45);
  // Porte-cochere and warm brass signage; dark marble foyer and a separate vehicle bay.
  frameRoom(g,b,1,'#262b2d');  for(const x of [b.x-10,b.x+b.w+10])part(g,4,43,4,x,21,b.y+b.h+48,'#bca56c',.6);
  addSign(g,'RESIDENCES',b.w-18,18,b.x+b.w/2,36,b.y+b.h+59,'#d9ba78');
  const gapC=b.x+b.w*.24,lobbyR=b.x+b.w*.48;
  resident.lobbyWalls=[{x:b.x,y:b.y,w:b.w,h:4},{x:b.x,y:b.y,w:4,h:b.h},{x:b.x+b.w-4,y:b.y,w:4,h:b.h},
    {x:lobbyR,y:b.y,w:4,h:b.h-45},{x:b.x,y:b.y+b.h-4,w:gapC-22-b.x,h:4},{x:gapC+22,y:b.y+b.h-4,w:lobbyR-gapC-22,h:4}];
  part(g,b.w,4,b.h,b.x+b.w/2,46,b.y+b.h/2,'#e4dccd');
  for(const q of resident.lobbyWalls.slice(4)){const gl=box(q.w,38,2,curtain);gl.position.set(q.x+q.w/2,22,q.y+q.h/2);g.add(gl);part(g,q.w,3,3,q.x+q.w/2,43,q.y+q.h/2,'#c4aa6a',.6);}
  for(const x of [gapC-22,gapC+22])part(g,3,40,3,x,22,b.y+b.h-2,'#c4aa6a',.6);
  part(g,b.w*.5-8,3,5,b.x+b.w*.76,43,b.y+b.h-2,'#c4aa6a',.6);
  for(const q of resident.lobbyWalls.slice(0,4))wall(g,q,0,43,'#b8b5aa');
  part(g,55,15,18,b.x+45,7.5,b.y+85,'#8e7041');addSign(g,'CONCIERGE',50,10,b.x+45,23,b.y+96,'#d9ba78');
  part(g,50,29,3,b.x+53,15,b.y+3,'#737878',.7);addSign(g,'ELEVATOR · U',50,9,b.x+53,36,b.y+5,'#dcc17f');
  addSign(g,'PRIVATE GARAGE',b.w*.4,11,b.x+b.w*.76,32,b.y+b.h+1,'#d9ba78');
  // A real one-bedroom apartment on floor 29, with living area, kitchen, bath and balcony.
  const floor=resident.floor;frameRoom(g,b,floor,'#cbb89b');
  resident.apartmentWalls=[{x:b.x,y:b.y,w:b.w,h:3},{x:b.x,y:b.y,w:3,h:b.h},{x:b.x+b.w-3,y:b.y,w:3,h:b.h},
    {x:b.x,y:b.y+b.h-3,w:b.w,h:3}, {x:b.x+b.w*.55,y:b.y+3,w:3,h:80}, {x:b.x+b.w*.55,y:b.y+115,w:3,h:b.h-118},
    {x:b.x+b.w*.55,y:b.y+82,w:b.w*.45,h:3},{x:b.x+b.w*.75,y:b.y,w:3,h:58}];
  resident.apartmentWalls.forEach((q,i)=>{if(i<4){const gw=box(q.w,36,q.h,new THREE.MeshStandardMaterial({color:'#bfe0ea',transparent:true,opacity:.14,roughness:.05,metalness:.4,side:THREE.DoubleSide}));gw.position.set(q.x+q.w/2,floor+18,q.y+q.h/2);g.add(gw);part(g,q.w,2,q.h,q.x+q.w/2,floor+36,q.y+q.h/2,'#d9c58f',.6);if(q.w>q.h)for(let x=q.x;x<=q.x+q.w;x+=56)part(g,2,36,q.h+1,x,floor+18,q.y+q.h/2,'#d9c58f',.6);else for(let y=q.y;y<=q.y+q.h;y+=56)part(g,q.w+1,36,2,q.x+q.w/2,floor+18,y,'#d9c58f',.6);}else wall(g,q,floor,35,'#eee7d9');});
  part(g,b.w,2,b.h,b.x+b.w/2,floor+37,b.y+b.h/2,'#f3ecdc');part(g,b.w*.5,1,b.h*.3,b.x+b.w*.3,floor+36,b.y+b.h*.7,'#fff3d2').material=new THREE.MeshBasicMaterial({color:'#fff1c8'});
  // Kitchen: worktop, cabinets, refrigerator, sink and island.
  part(g,80,11,18,b.x+51,floor+6,b.y+17,'#6e5140');part(g,82,2,20,b.x+51,floor+13,b.y+17,'#efe9dc');
  part(g,18,29,20,b.x+12,floor+15,b.y+44,'#bbc3c5',.4);part(g,17,1,10,b.x+60,floor+14.5,b.y+17,'#65777a',.5);
  part(g,44,13,25,b.x+70,floor+7,b.y+58,'#896c50');part(g,46,2,27,b.x+70,floor+14,b.y+58,'#eee7d9');
  // Living room: sectional, brass table, wall television and balcony seating.
  part(g,61,7,22,b.x+54,floor+7,b.y+136,'#35454f');part(g,61,14,7,b.x+54,floor+11,b.y+144,'#35454f');part(g,20,7,40,b.x+16,floor+7,b.y+123,'#35454f');
  part(g,34,8,22,b.x+62,floor+4,b.y+107,'#b29455',.5);part(g,44,23,2,b.x+105,floor+20,b.y+132,'#10242e');
  // Bedroom: upholstered king bed, pillows, bedside cabinets, wardrobe.
  part(g,64,8,74,b.x+b.w*.78,floor+5,b.y+b.h*.68,'#67584e');part(g,62,4,70,b.x+b.w*.78,floor+11,b.y+b.h*.68,'#eee8db');
  part(g,65,20,4,b.x+b.w*.78,floor+11,b.y+b.h*.68+38,'#6c564d');
  for(const x of [b.x+b.w*.69,b.x+b.w*.86])part(g,23,3,13,x,floor+15,b.y+b.h*.68+24,'#f8f4e9');
  part(g,21,10,20,b.x+b.w*.6,floor+5,b.y+b.h*.78,'#a28455');part(g,58,30,13,b.x+b.w*.81,floor+15,b.y+b.h-12,'#8d7965');
  // Bathroom behind the bedroom wall.
  part(g,39,8,22,b.x+b.w*.63,floor+4,b.y+17,'#f0eee8');part(g,24,9,19,b.x+b.w*.88,floor+5,b.y+26,'#f5f2e9');
  addSign(g,'FLOOR 29 · ONE BEDROOM',110,9,b.x+58,floor+30,b.y+b.h-4,'#d9ba78').rotation.y=Math.PI;
  addSign(g,'U · LOBBY / GARAGE',96,8,b.x+54,floor+24,b.y+5,'#d9ba78');
  g.userData.floor=floor;resident.mesh=g;
}
function marina(c){
  const p=c.pier,g=new THREE.Group();g.name='level29-marina';cityGroup.add(g);
  // Water is a procedural shaded surface; pier boards and posts are batched below.
  part(g,p.x1-p.x0,2.4,p.width,p.x0+(p.x1-p.x0)/2,1.4,p.y+16,'#897654');
  part(g,96,2.4,288,p.x0-16,1.4,p.y+16,'#897654');
  for(let x=p.x0;x<p.x1;x+=32){part(g,1,1,p.width,x,3,p.y+16,'#4a4438');for(const z of [p.y-p.width/2+16,p.y+p.width/2+16]){part(g,4,17,4,x,5,z,'#554a36');}}
  addSign(g,'THE BAYOU',250,28,p.x1-82,54,p.y+70,'#91d3dd').rotation.y=Math.PI/2;
  addSign(g,'MARINA · E BOARD · I FISH',290,17,p.x1-85,27,p.y+72,'#ddc080').rotation.y=Math.PI/2;
  // Sign posts sit directly under the rotated BAYOU sign so they never land on the road when the pier moves.
  for(const dz of [-110,110]){const px=p.x1-82,pz=p.y+70+dz;if(!(isRoadCol(Math.floor(px/TILE))||isRoadCol(Math.floor(pz/TILE))))part(g,6,48,6,px,23,pz,'#686554');}
  // Mooring cleats, life rings, shaded fishing deck.
  for(let x=p.x0;x<p.x0+400;x+=100){part(g,9,2,3,x,5,p.y+56,'#899095',.7);}
  part(g,70,3,65,p.x0+82,36,p.y+12,'#ede4ce');for(const x of [p.x0+49,p.x0+115])for(const z of [p.y-17,p.y+42])part(g,3,36,3,x,18,z,'#d1d3cd');
  addSign(g,'FISHING DECK',90,12,p.x0+88,22,p.y+59,'#b9ded6');
  for(const k of c.caches){if(save.caches.includes(k.id))continue;const boxM=window.level29ArsenalVisuals?level29ArsenalVisuals.createCacheMesh():part(g,18,12,14,k.x,6,k.y,'#51483a');if(window.level29ArsenalVisuals){boxM.position.set(k.x,c.heightAt?c.heightAt(k.x,k.y):0,k.y);g.add(boxM);}boxM.name='hidden:'+k.id;k.mesh=boxM;}
}

// ---------------------------------------------------------------- ground paint, water and terrain meshes
const prevGround=renderGround;
renderGround=function(){
  prevGround();
  if(!city.world)return;
  const g=groundCv.getContext('2d'),rng=mkRng(4091);
  // Bayou: murky tea-green swamp water with duckweed mats and algae slicks.
  const grad=g.createLinearGradient(0,0,GULF_X*TILE,0);grad.addColorStop(0,'#1d2716');grad.addColorStop(.7,'#2c3a1f');grad.addColorStop(1,'#46552c');
  g.fillStyle=grad;g.fillRect(0,0,GULF_X*TILE,WORLD);
  for(let i=0;i<900;i++){const x=rng()*GULF_X*TILE,y=rng()*WORLD,w=40+rng()*130;g.strokeStyle='rgba(150,170,90,'+(.04+rng()*.1)+')';g.lineWidth=1.5;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+w/2,y-5,x+w,y);g.stroke();}
  for(let i=0;i<700;i++){const x=rng()*GULF_X*TILE,y=rng()*WORLD,r=4+rng()*22;g.fillStyle='rgba(98,128,52,'+(.12+rng()*.22)+')';g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();}
  // Muddy bank: dark wet silt, then marsh grass flecks.
  const sx=GULF_X*TILE;g.fillStyle='rgba(52,44,26,.7)';g.fillRect(sx-10,0,10,WORLD);
  const sg=g.createLinearGradient(sx,0,ROADS[3]*TILE,0);sg.addColorStop(0,'#4a4228');sg.addColorStop(.3,'#5d5a33');sg.addColorStop(1,'#6c7040');
  for(let ty=3;ty<MH-3;ty++)for(let tx=GULF_X;tx<ROADS[3];tx++)if(city.get(tx,ty)===T_SAND){g.fillStyle=sg;g.fillRect(tx*TILE,ty*TILE,TILE,TILE);}
  for(let i=0;i<500;i++){const x=sx+rng()*(ROADS[3]-GULF_X)*TILE,y=rng()*WORLD;if(city.get(Math.floor(x/TILE),Math.floor(y/TILE))===T_SAND){g.fillStyle='rgba(120,92,50,'+(.1+rng()*.2)+')';g.fillRect(x,y,2+rng()*3,2);}}
  // Pier boards.
  for(let ty=0;ty<MH;ty++)for(let tx=0;tx<MW;tx++)if(city.get(tx,ty)===T_BRIDGE&&tx<ROADS[3]+1){
    g.fillStyle=(tx+ty)%2?'#8c7753':'#94805a';g.fillRect(tx*TILE,ty*TILE,TILE,TILE);g.strokeStyle='rgba(40,28,14,.5)';g.lineWidth=1;for(let k=0;k<4;k++){g.beginPath();g.moveTo(tx*TILE+k*8,ty*TILE);g.lineTo(tx*TILE+k*8,ty*TILE+TILE);g.stroke();}}
  // Zone floors.
  for(const f of city.features){
    if(f.kind==='forest'){g.fillStyle='#2f4a2c';g.fillRect(f.x,f.y,f.w,f.h);for(let i=0;i<260;i++){g.fillStyle='rgba('+(30+rng()*40|0)+','+(60+rng()*40|0)+',28,.45)';g.beginPath();g.arc(f.x+rng()*f.w,f.y+rng()*f.h,3+rng()*8,0,7);g.fill();}}
    if(f.kind==='mountain'){g.fillStyle='#6f7770';g.fillRect(f.x,f.y,f.w,f.h);for(let i=0;i<340;i++){g.fillStyle='rgba('+(90+rng()*70|0)+','+(95+rng()*70|0)+','+(90+rng()*60|0)+',.35)';g.fillRect(f.x+rng()*f.w,f.y+rng()*f.h,3+rng()*12,3+rng()*6);}}
    if(f.kind==='tower'){g.fillStyle='#d6d1c6';g.fillRect(f.x,f.y,f.w,f.h);g.strokeStyle='#b19c6b';g.lineWidth=3;for(let i=0;i<=f.w;i+=48){g.beginPath();g.moveTo(f.x+i,f.y);g.lineTo(f.x+i,f.y+f.h);g.stroke();}
      g.fillStyle='#8fb6c3';g.beginPath();g.ellipse(f.x+f.w/2,f.y+f.h-26,38,12,0,0,7);g.fill();}
  }
  // Pier lane markings in the harbor.
  g.fillStyle='rgba(255,255,255,.12)';g.fillRect(0,0,6,WORLD);
  paintCurves(g,1,false);
  if(miniCv){const m=miniCv.getContext('2d');m.save();paintCurves(m,3/TILE,true);m.restore();}
};
let waterMats=[];
function mountains(c){
  const grp=new THREE.Group();grp.name='level29-mountains';cityGroup.add(grp);
  for(const f of c.features){if(f.kind!=='mountain')continue;
    const seg=40,geo=new THREE.PlaneGeometry(f.w,f.h,seg,seg);geo.rotateX(-Math.PI/2);const pos=geo.attributes.position,col=new Float32Array(pos.count*3);
    for(let i=0;i<pos.count;i++){const x=pos.getX(i)+f.x+f.w/2,z=pos.getZ(i)+f.y+f.h/2;const onRoad=c.curveDist(x,z)<64;const h=onRoad?-3:c.heightAt(x,z)+ (Math.sin(x*.07)*Math.cos(z*.09)*3);pos.setXYZ(i,x,h,z);
      const k=Math.min(1,h/260);let r,gg,b;if(k>.72){r=gg=b=.93;}else if(k>.4){r=.5;gg=.52;b=.5;}else if(k>.12){r=.34;gg=.38;b=.31;}else{r=.28;gg=.36;b=.25;}
      const j=(Math.sin(x*.31)+Math.cos(z*.27))*.03;col[i*3]=r+j;col[i*3+1]=gg+j;col[i*3+2]=b+j;}
    geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.computeVertexNormals();
    const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true}));m.position.y=.4;grp.add(m);
  }
}

// ---------------------------------------------------------------- static batching (large draw-call reduction)
function matSig(m){return [m.type,m.color&&m.color.getHex(),m.map&&m.map.uuid,m.emissive&&m.emissive.getHex(),m.emissiveIntensity,m.emissiveMap&&m.emissiveMap.uuid,m.opacity,m.transparent,m.side,m.roughness,m.metalness,m.depthWrite,m.blending,m.alphaTest,m.fog].join('|');}
window.level29BatchStatic=batchStatic;
function batchStatic(root,skip,target){
  root.updateMatrixWorld(true);
  const buckets=new Map(),rep=new Map(),remove=[];const _v=new THREE.Vector3(),_n=new THREE.Matrix3(),_m=new THREE.Matrix4();
  const keep=new Set(skip);
  function ancestorKept(o){for(let p=o;p&&p!==root;p=p.parent)if(keep.has(p))return true;return false;}
  function add(geo,matrix,material,cx,cz){
    const sig=matSig(material);if(!rep.has(sig))rep.set(sig,material);
    const key=sig+'#'+Math.floor(cx/1100)+','+Math.floor(cz/1100);let b=buckets.get(key);if(!b){b={sig,pos:[],nor:[],uv:[],indices:[]};buckets.set(key,b);}
    const p=geo.attributes.position,nr=geo.attributes.normal,uv=geo.attributes.uv,idx=geo.index;_n.getNormalMatrix(matrix);
    const vertices=new Map();const emit=(i)=>{if(vertices.has(i)){b.indices.push(vertices.get(i));return;}const next=b.pos.length/3;vertices.set(i,next);b.indices.push(next);_v.fromBufferAttribute(p,i).applyMatrix4(matrix);b.pos.push(_v.x,_v.y,_v.z);if(nr){_v.fromBufferAttribute(nr,i).applyMatrix3(_n).normalize();b.nor.push(_v.x,_v.y,_v.z);}else b.nor.push(0,1,0);if(uv)b.uv.push(uv.getX(i),uv.getY(i));else b.uv.push(0,0);};
    return emit;
  }
  root.traverse(o=>{
    if(!o.isMesh||o===root||ancestorKept(o)||o.name.startsWith('hidden:')||o.userData.noBatch)return;
    const mats=Array.isArray(o.material)?o.material:[o.material];
    if(mats.some(m=>!m||m.vertexColors||m.isShaderMaterial||m.isPointsMaterial))return;
    if(o.isInstancedMesh&&o.instanceColor)return;
    const geo=o.geometry;if(!geo||!geo.attributes.position||geo.attributes.position.count>60000)return;
    const idx=geo.index,ranges=Array.isArray(o.material)&&geo.groups.length?geo.groups:[{start:0,count:idx?idx.count:geo.attributes.position.count,materialIndex:0}];
    const bb=geo.boundingBox||(geo.computeBoundingBox(),geo.boundingBox);
    if(!o.isInstancedMesh){
      if(bb.max.x-bb.min.x>2500||bb.max.z-bb.min.z>2500)return;
      const cen=bb.getCenter(new THREE.Vector3()).applyMatrix4(o.matrixWorld);
      for(const r of ranges){const emit=add(geo,o.matrixWorld,mats[r.materialIndex]||mats[0],cen.x,cen.z);const end=r.start+r.count;
        for(let k=r.start;k<end;k++)emit(idx?idx.getX(k):k);}
      remove.push(o);
    }else{
      const m4=new THREE.Matrix4(),world=new THREE.Matrix4();
      for(let i=0;i<o.count;i++){o.getMatrixAt(i,m4);world.multiplyMatrices(o.matrixWorld,m4);const cx=world.elements[12],cz=world.elements[14];
        for(const r of ranges){const emit=add(geo,world,mats[r.materialIndex]||mats[0],cx,cz);const end=r.start+r.count;for(let k=r.start;k<end;k++)emit(idx?idx.getX(k):k);}}
      remove.push(o);
    }
  });
  for(const o of remove){if(o.parent)o.parent.remove(o);}
  const out=new THREE.Group();out.name='level29-batched';let n=0;
  for(const [key,b] of buckets){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(b.nor,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(b.uv,2));g.setIndex(b.indices);g.computeBoundingSphere();
    const m=new THREE.Mesh(g,rep.get(b.sig));m.matrixAutoUpdate=false;out.add(m);n++;}
  (target||root).add(out);out.userData.count=n;return out;
}
const prevBuild=buildCity;
buildCity=function(){
  stopFishing();
  prevBuild();
  if(!city.world)return;
  waterMats=[];
  const sea=cityGroup.children[1];if(sea&&sea.material){sea.material=new THREE.MeshStandardMaterial({color:'#36452a',roughness:.24,metalness:.2,transparent:true,opacity:.97});sea.position.y=-1.2;waterMats.push(sea);}
  marina(city);tower(city);mountains(city);
  resident=city.residence;
  scene.fog.far=Math.max(scene.fog.far,1000);
  const skip=[cityGroup.children[0],cityGroup.children[1]];const wd=cityGroup.getObjectByName('level29-world-detail');if(wd&&wd.userData.wheel)skip.push(wd.userData.wheel);
  for(const o of cityGroup.children)if(o.name==='level29-mountains')skip.push(o);
  for(const v of city.venues||[])if(v.roof){v.roof.userData.noBatch=true;skip.push(v.roof);}
  for(const v of city.venues||[])for(const o of [v.door,v.worker,...(v.brushes||[])])if(o)skip.push(o);
  const t0=performance.now();const out=batchStatic(cityGroup,skip);city.batchInfo={ms:Math.round(performance.now()-t0),meshes:out.userData.count};
};

// ---------------------------------------------------------------- customizations, ownership and store
const panel=document.createElement('div');panel.id='worldStore';panel.style.display='none';document.body.appendChild(panel);
const style=document.createElement('style');style.textContent=`
#worldStore{position:fixed;inset:0;z-index:60;background:rgba(7,12,17,.83);align-items:center;justify-content:center;padding:24px;box-sizing:border-box;color:#e7e4db;font-family:'Barlow Condensed',sans-serif}
#worldStore .ws{width:min(880px,96vw);max-height:88vh;overflow:auto;background:#14202a;border:1px solid #b99a5f;box-shadow:0 28px 110px #0008;padding:28px;box-sizing:border-box}
#worldStore .ws-head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;border-bottom:1px solid #374550;padding-bottom:18px;margin-bottom:18px}
#worldStore h2{font-size:36px;letter-spacing:1px;margin:4px 0}#worldStore h3{font-size:22px;margin:0 0 10px;color:#e0c082}
#worldStore p{font-size:16px;line-height:1.4;color:#b8c5cb;margin:8px 0}#worldStore .eyebrow{color:#d9ba78;letter-spacing:2px;font-size:14px}
#worldStore button{font:700 15px 'Barlow Condensed',sans-serif;letter-spacing:.5px;background:#b6975d;color:#0c1820;border:1px solid #d3b57b;padding:10px 14px;cursor:pointer}#worldStore button:hover{background:#ddc389}#worldStore button:disabled{opacity:.35;cursor:not-allowed}
#worldStore .tabs{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:20px}#worldStore .tabs button{background:#1a2a35;color:#c8d2d5;border-color:#40515e}#worldStore .tabs button.active{border-color:#d9ba78;color:#e1c082}
#worldStore .ws-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}#worldStore .card{background:#1b2b36;padding:17px;border:1px solid #344652;display:flex;flex-direction:column;gap:8px}
#worldStore .card>button{margin-top:auto}#worldStore input[type=color]{width:62px;height:40px;padding:0;border:1px solid #53626b;background:transparent}
#worldStore .editrow{display:flex;align-items:center;gap:10px;flex-wrap:wrap}#worldStore .cash{color:#e3c485;font-size:24px;margin:0;font-variant-numeric:tabular-nums}
#worldStore .save-code{box-sizing:border-box;width:100%;min-height:100px;color:#d7e0e3;background:#0c1820;border:1px solid #40515e;font-size:13px;padding:10px;margin-top:12px}
#fishPanel{position:fixed;left:50%;bottom:105px;transform:translateX(-50%);z-index:8;background:#10232be8;border:1px solid #a8cdd0;color:#d7eff1;min-width:280px;padding:16px;text-align:center;font:600 17px 'Barlow Condensed',sans-serif;pointer-events:none}
#fishPanel .track{height:14px;margin-top:12px;position:relative;background:#244b57}#fishPanel .sweet{position:absolute;left:37%;width:26%;height:100%;background:#b99757}#fishPanel .needle{position:absolute;top:-3px;width:3px;height:20px;background:#fff}
@media(max-width:620px){#worldStore{padding:10px}#worldStore .ws{padding:18px;max-height:94vh}#worldStore .ws-grid{grid-template-columns:1fr}#worldStore h2{font-size:28px}#worldStore .ws-head{gap:10px}#worldStore .tabs button{padding:8px 11px;font-size:13px}}
`;document.head.appendChild(style);
const itemList=[
 {id:'rapid',name:'Rapid fire',desc:'Faster firing rate. Stackable upgrade.',price:1200,buy:()=>up.rapid++},
 {id:'cool',name:'Cooling system',desc:'Cool your M240 more quickly.',price:900,buy:()=>up.cool++},
 {id:'spread',name:'Spread shot',desc:'Add firepower against crowds.',price:1500,buy:()=>up.spread++},
 {id:'ap',name:'Armor-piercing rounds',desc:'Increase bullet penetration.',price:2000,buy:()=>up.ap++},
 {id:'tough',name:'Vehicle protection',desc:'Increase protection while driving.',price:1800,buy:()=>up.tough++},
 {id:'nitro',name:'Nitrous upgrade',desc:'Hold Shift to boost your land vehicle.',price:2200,buy:()=>up.nitro=true},
 {id:'armorup',name:'Extra armor capacity',desc:'Increase armor capacity and refill it.',price:1000,buy:()=>{up.armor++;player.armor=50+up.armor*25;}},
 {id:'healup',name:'Health capacity',desc:'Add 25 maximum health, then heal.',price:1600,buy:()=>{player.maxHp+=25;player.hp=player.maxHp;}},
 {id:'rod',name:'Professional fishing rod',desc:'A wider reel window and better catches.',price:900,buy:()=>save.owned.rod=true},
 {id:'treasure',name:'Treasure tackle',desc:'Improve chances of finding submerged cash.',price:1600,buy:()=>save.owned.treasure=true},
];
const codeItems=[
 {id:'code-level',name:'LEVEL29',desc:'All weapons and full ammo.',price:5000,code:'LEVEL29'},
 {id:'code-health',name:'JESTERMODE',desc:'Restore maximum health and armor.',price:1000,code:'JESTERMODE'},
 {id:'code-sports',name:'BAYOUBLAST',desc:'Spawn a sports coupe.',price:2500,code:'BAYOUBLAST'},
 {id:'code-humvee',name:'SEMPERFI',desc:'Spawn a Humvee.',price:3000,code:'SEMPERFI'},
 {id:'code-cool',name:'NEVERHOT',desc:'Toggle unlimited M240 cooling.',price:6500,code:'NEVERHOT'},
 {id:'code-slow',name:'SLOWDEAD',desc:'Toggle slow zombies.',price:7500,code:'SLOWDEAD'},
 {id:'code-god',name:'GODMODE',desc:'Toggle invincibility.',price:25000,code:'GODMODE'},
];
function hasEnough(price){return cash>=price;}
function pay(price){if(cash<price){toast('NOT ENOUGH IN-GAME CASH');return false;}cash-=price;sfx('cash');persist();return true;}
function buy(id){const it=itemList.find(q=>q.id===id);if(!it||!pay(it.price))return;it.buy();save.up={...up};save.maxHp=player.maxHp;persist();showStore(openTab);}
function buyCode(id){const it=codeItems.find(q=>q.id===id);if(!it)return;if(!save.owned[it.code]){if(!pay(it.price))return;save.owned[it.code]=true;persist();}applyCheat(it.code);showStore('codes');}
function carRecord(c){return {id:c.saveId||(c.saveId='v'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)),type:c.type,col:c.col,custom:{...(c.custom||{})}};}
function applyVehicleTuning(c){const q=c.custom||{},base=CAR_SPECS[c.type]||CAR_SPECS.sedan;
  c.spec={...base,max:base.max*(1+(q.engine||0)*.12),acc:base.acc*(1+(q.engine||0)*.15),grip:Math.min(.96,base.grip+(q.tires||0)*.025)};
  c.maxHp=base.hp*(1+(q.armor||0)*.25);c.hp=Math.min(c.maxHp,c.hp);
}
function saveCar(){if(!save.apartment){toast('BUY AN APARTMENT FIRST');return;}const c=player.car;if(!c||c.boat||c.dead){toast('DRIVE A LAND VEHICLE TO YOUR GARAGE');return;}
  if(Math.abs(c.v)>1){toast('STOP YOUR VEHICLE BEFORE STORING IT');return;}if(dist(c.x,c.y,resident.garage.x,resident.garage.y)>210){toast('DRIVE TO THE PRIVATE GARAGE AT RESIDENCES');return;}
  const rec=carRecord(c),idx=save.garage.findIndex(q=>q.id===rec.id);if(idx<0&&save.garage.length>=12){toast('GARAGE FULL · 12 VEHICLE SLOTS');return;}if(idx<0)save.garage.push(rec);else save.garage[idx]=rec;
  player.car=null;cars=cars.filter(q=>q!==c);player.x=resident.lobby.x;player.y=resident.lobby.y;c.driven=false;customCar=null;persist();toast('VEHICLE STORED · CUSTOMIZATIONS SAVED');showStore('garage');
}
function retrieveCar(id){const rec=save.garage.find(q=>q.id===id);if(!rec||!resident)return;
  if(dist(player.x,player.y,resident.garage.x,resident.garage.y)>250&&interior!=='apartment'){toast('RETURN TO YOUR PRIVATE GARAGE');return;}
  const old=cars.find(c=>c.saveId===id&&!c.dead);if(old){toast('THIS VEHICLE IS ALREADY OUTSIDE');closeStore();return;}
  interior=null;const c=makeCar(resident.garage.x,resident.garage.y+20,Math.PI/2,rec.type);c.col=rec.col;c.custom={...rec.custom};c.saveId=rec.id;applyVehicleTuning(c);c.hp=c.maxHp;c.driven=true;cars.push(c);
  player.x=c.x;player.y=c.y;player.car=c;closeStore();toast('SAVED VEHICLE RETRIEVED');snapCamera();
}
function enterApartment(){if(!resident||!save.apartment)return;
  if(player.car){toast('PARK YOUR VEHICLE OR STORE IT IN THE GARAGE');return;}interior='apartment';player.x=resident.b.x+52;player.y=resident.b.y+resident.b.h-36;player.vx=player.vy=0;player.heat=0;player.inv=120;view.yaw=-Math.PI/2;snapCamera();closeStore();toast('WELCOME HOME · FLOOR 29 · U FOR SERVICES');
}
function leaveApartment(){interior=null;player.x=resident.lobby.x;player.y=resident.lobby.y;player.vx=player.vy=0;snapCamera();closeStore();}
function purchaseApartment(){if(save.apartment)return;if(!pay(25000))return;save.apartment=true;persist();showStore('home');toast('APARTMENT PURCHASED · PRIVATE GARAGE UNLOCKED');}
function carTarget(){if(player&&player.car&&!player.car.boat)return player.car;return customCar;}
function upgradeVehicle(id){const c=carTarget();if(!c)return;const costs={engine:1200,tires:800,armor:1000,spoiler:650,underglow:500,rims:700,finish:400,neon:600,stripes:450,bodykit:900,bullbar:550,roofrack:350,exhaust:500,scoop:600,chrome:800};
  const q=c.custom||(c.custom={});const price=costs[id];if(['engine','tires','armor'].includes(id)&&q[id]>=3){toast('MAXIMUM UPGRADE INSTALLED');return;}
  if(!pay(price))return;
  if(['engine','tires','armor'].includes(id))q[id]=(q[id]||0)+1;else q[id]=!q[id];applyVehicleTuning(c);persistTarget(c);showStore('custom');}
function persistTarget(c){if(c.saveId){const i=save.garage.findIndex(q=>q.id===c.saveId);if(i>=0)save.garage[i]=carRecord(c);}persist();}
function paintVehicle(color){const c=carTarget();if(!c||!/^#[0-9a-f]{6}$/i.test(color)||!pay(250))return;c.col=color;persistTarget(c);showStore('custom');}
function selectSaved(id){const rec=save.garage.find(q=>q.id===id);if(!rec)return;customCar={type:rec.type,saveId:rec.id,col:rec.col,custom:{...rec.custom},hp:CAR_SPECS[rec.type].hp,maxHp:CAR_SPECS[rec.type].hp};applyVehicleTuning(customCar);showStore('custom');}
function exportSave(){save.cash=cash;save.up={...up};save.arsenal={...arsenal};save.chapter=distIdx;save.mission=missionIdx;save.maxHp=player&&player.maxHp;const str=JSON.stringify(save);const box=panel.querySelector('textarea');if(box)box.value=str;persist();toast('COPY YOUR SAVE TEXT · IMPORT TO RESTORE ON ANY DEVICE');}
function importSave(){try{const val=JSON.parse(panel.querySelector('textarea').value);
  if(typeof val.apartment!=='boolean'||!Array.isArray(val.garage)||val.garage.length>12||!val.garage.every(v=>CAR_SPECS[v.type]&&!CAR_SPECS[v.type].boat))throw Error('invalid');
  save=Object.assign({apartment:false,garage:[],custom:{},owned:{},fishCaught:0,caches:[]},val);cash=Math.max(0,Number(save.cash)||0);if(save.up)up={...up,...save.up};if(save.arsenal)arsenal={...arsenal,...save.arsenal};
  if(player&&save.maxHp){player.maxHp=Math.max(100,Math.min(1000,Number(save.maxHp)||100));player.hp=player.maxHp;}persist();showStore('save');toast('SAVE RESTORED');
  }catch(_){toast('INVALID SAVE TEXT');}}
function card(title,desc,button,action,disabled=false){return '<div class="card"><h3>'+title+'</h3><p>'+desc+'</p><button data-action="'+action+'"'+(disabled?' disabled':'')+'>'+button+'</button></div>';}
function showStore(tab='home'){
  openTab=tab;state='shop';mouse.down=false;for(const k in keys)keys[k]=false;
  let html='';
  if(tab==='home'){
    html=card('RESIDENCES','Floor 29 · One bedroom, living room, kitchen, bathroom and Gulf views. Includes a private 12-vehicle garage. All purchases use earned in-game cash.',save.apartment?'ENTER APARTMENT':'BUY APARTMENT · $25,000',save.apartment?'enter-home':'buy-home',!save.apartment&&cash<25000);
    html+=card('Your private garage','Keep your saved vehicles and their custom parts. Use the motorcourt garage downstairs to store or retrieve a vehicle.','OPEN GARAGE','tab-garage',!save.apartment);
    if(interior==='apartment')html+=card('Elevator','Return to the lobby and private garage.','GO DOWNSTAIRS','leave-home');
    else html+=card('Find the tower','Residences is in the Marina District, east of the Gulf pier. The H marker on the map shows the lobby, and the F marker shows the fishing pier.','CLOSE AND EXPLORE','close');
  }
  if(tab==='garage'){
    html=card('Store current vehicle','Stop at the private garage. Vehicles stay here with every customization. Up to 12 saved cars.','STORE VEHICLE','store-car',!save.apartment||!player.car);
    for(const rec of save.garage){html+='<div class="card"><h3>'+CAR_SPECS[rec.type].name+'</h3><p>Paint '+rec.col+' · Engine '+(rec.custom.engine||0)+' · Tires '+(rec.custom.tires||0)+' · Armor '+(rec.custom.armor||0)+'</p><div class="editrow"><button data-action="retrieve:'+rec.id+'">RETRIEVE</button><button data-action="edit:'+rec.id+'">CUSTOMIZE</button></div></div>';}
    if(!save.garage.length)html+='<div class="card"><h3>No saved vehicles yet</h3><p>Buy an apartment, then drive a vehicle into its private garage and store it here.</p></div>';
  }
  if(tab==='custom'){
    const c=carTarget();
    if(!c)html=card('Choose a vehicle','Bring a vehicle to the garage, or select CUSTOMIZE on a saved vehicle. Customize paint, rims, spoiler, underglow, finish, engine, tires and armor.','CHOOSE SAVED VEHICLE','tab-garage');
    else{
      const q=c.custom||{};html='<div class="card"><h3>'+CAR_SPECS[c.type].name+' · Paint</h3><p>Custom metallic body color · $250.</p><div class="editrow"><input type="color" id="carColor" value="'+c.col+'"><button data-action="paint">APPLY PAINT</button></div></div>';
      const opts=[['engine','Engine tuning',1200],['tires','Performance tires',800],['armor','Reinforced armor',1000],['rims','Sport rims',700],['spoiler','Rear spoiler',650],['underglow','Gold underglow',500],['neon','Mardi Gras purple neon',600],['finish','Matte finish',400],['chrome','Chrome trim package',800],['stripes','Racing stripes',450],['bodykit','Wide body kit',900],['scoop','Hood scoop',600],['exhaust','Twin exhaust',500],['bullbar','Bull bar',550],['roofrack','Roof rack + lights',350]];
      for(const[id,name,price]of opts)html+=card(name,['engine','tires','armor'].includes(id)?'Upgrade '+(q[id]||0)+' / 3. Improves vehicle performance.':q[id]?'Installed. Purchase to remove.':'Visual customization, saved with this vehicle.',(q[id]?'UPGRADE / TOGGLE':'INSTALL')+' · $'+price,'vehicle:'+id,cash<price||['engine','tires','armor'].includes(id)&&q[id]>=3);
    }
  }
  if(tab==='upgrades')for(const it of itemList){const owned=['rod','treasure','nitro'].includes(it.id)&&(save.owned[it.id]||it.id==='nitro'&&up.nitro);html+=card(it.name,it.desc,owned?'OWNED':'BUY · $'+it.price,'buy:'+it.id,owned||cash<it.price);}
  if(tab==='codes')for(const it of codeItems)html+=card(it.name,it.desc+' Enter T to use your purchased code again.',save.owned[it.code]?'ACTIVATE OWNED CODE':'BUY + ACTIVATE · $'+it.price,'code:'+it.id,!save.owned[it.code]&&cash<it.price);
  if(tab==='save')html='<div class="card"><h3>Keep your progress</h3><p>Your apartment, garage and customization purchases save locally when browser storage is available. For the preview or a different device, export your save text and keep it somewhere safe. Import it to restore ownership, vehicles, currency and upgrades.</p><div class="editrow"><button data-action="export">EXPORT SAVE TEXT</button><button data-action="import">IMPORT SAVE TEXT</button></div><textarea class="save-code" aria-label="Save text" placeholder="Export, then copy your save text. To restore, paste it here and choose Import."></textarea></div>';
  panel.innerHTML='<div class="ws"><div class="ws-head"><div><div class="eyebrow">LEVEL 29 · IN-GAME SERVICES</div><h2>'+(tab==='home'?'Luxury living':tab==='garage'?'Private garage':tab==='custom'?'Vehicle customization':tab==='codes'?'Code dealer':tab==='upgrades'?'Upgrade store':'Save & restore')+'</h2><p class="cash">'+money(cash)+'</p></div><button data-action="close">CLOSE · ESC</button></div><div class="tabs">'+[['home','Residence'],['garage','Garage'],['custom','Customize'],['upgrades','Upgrades'],['codes','Codes'],['save','Save']].map(([id,name])=>'<button class="'+(id===tab?'active':'')+'" data-action="tab-'+id+'">'+name+'</button>').join('')+'</div><div class="ws-grid">'+html+'</div><p>All prices use fictional Level 29 in-game currency. No real-money purchases.</p></div>';
  panel.style.display='flex';panel.querySelectorAll('button[data-action]').forEach(btn=>btn.onclick=()=>dispatch(btn.dataset.action));
}
function closeStore(){panel.style.display='none';if(state==='shop')state='play';for(const k in keys)keys[k]=false;mouse.down=false;}
function dispatch(act){if(act==='close'){closeStore();return;}if(act.startsWith('tab-')){showStore(act.slice(4));return;}const[typ,val]=act.split(':');
  if(act==='buy-home')purchaseApartment();else if(act==='enter-home'){
    if(!resident||dist(player.x,player.y,resident.lobby.x,resident.lobby.y)>260){toast('VISIT THE RESIDENCE LOBBY TO USE THE ELEVATOR');return;}enterApartment();
  }else if(act==='leave-home')leaveApartment();else if(act==='store-car')saveCar();else if(act==='paint')paintVehicle(panel.querySelector('#carColor').value);
  else if(act==='export')exportSave();else if(act==='import')importSave();else if(typ==='buy')buy(val);else if(typ==='code')buyCode(val);else if(typ==='retrieve')retrieveCar(val);else if(typ==='edit')selectSaved(val);else if(typ==='vehicle')upgradeVehicle(val);
}

// ---------------------------------------------------------------- zombie access to businesses
zombieGoal=function(z,gx,gy){return {x:gx,y:gy};};
function venueAt(x,y){if(!city.venues)return null;for(const v of city.venues){const b=v.b;if(x>b.x&&x<b.x+b.w&&y>b.y&&y<b.y+b.h)return v;}return null;}
function zombieDoors(){}

// ---------------------------------------------------------------- fishing and hidden cash
const fishTable=[['Redfish',70,.22],['Speckled trout',55,.18],['Flounder',90,.13],['Red snapper',140,.10],['Mahi-mahi',220,.08],['Blue marlin',420,.04],['Sealed dockside lockbox',850,.01],['Channel catfish',95,.15],['Louisiana crawfish',45,.09]];
function nearWaterSpot(){
  const p=player;if(!p||p.dead)return null;
  const baseX=p.car&&p.car.boat?p.car.x:p.x,baseY=p.car&&p.car.boat?p.car.y:p.y;
  if(p.car&&!p.car.boat)return null;if(p.car&&Math.abs(p.car.v)>1.2)return null;
  for(let a=0;a<Math.PI*2;a+=Math.PI/8)for(const r of [28,52,80]){const x=baseX+Math.cos(a)*r,y=baseY+Math.sin(a)*r;if(tileAt(x,y)===T_WATER)return {x,y};}
  return null;
}
function startFishing(){
  if(!city||!city.world||state!=='play'||fish)return;
  const spot=nearWaterSpot();if(!spot){toast('GO TO THE PIER, BEACH OR A BOAT TO FISH');return;}
  fish={phase:'cast',t:60+Math.random()*130,x:spot.x,y:spot.y,needle:0,dir:1,hold:0,boat:!!(player.car&&player.car.boat),originX:player.x,originY:player.y,progress:0,tension:.25};sfx('door');toast('LINE CAST · WAIT FOR A BITE');
  if(!fishingBar){fishingBar=document.createElement('div');fishingBar.id='fishPanel';document.body.appendChild(fishingBar);}fishingBar.style.display='block';fishingBar.textContent='Waiting for a bite...';
}
let fishingVisual=null;
function clearFishingVisual(){if(!fishingVisual)return;scene.remove(fishingVisual);fishingVisual.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});fishingVisual=null;}
function stopFishing(msg){fish=null;clearFishingVisual();if(fishingBar)fishingBar.style.display='none';if(msg)toast(msg);}
function catchFish(){
  // Normalize weights and favor offshore species only when fishing from a boat.
  const table=fishTable.map(f=>[f[0],f[1],f[2]*(fish.boat&&f[1]>=140?2:1)*(save.owned.treasure&&f[1]>=420?1.5:1)]);
  let r=Math.random()*table.reduce((n,f)=>n+f[2],0),pick=table[table.length-1];
  for(const f of table){r-=f[2];if(r<=0){pick=f;break;}}
  const offshore=fish.boat,gain=Math.round(pick[1]*(.85+Math.random()*.4)*(save.owned.rod?1.25:1)*(offshore?1.2:1));
  cash+=gain;save.fishCaught++;if(pick[0]!=='Sealed dockside lockbox')save.fishStock=(Number(save.fishStock)||0)+1;sfx('cash');
  const goal=save.fishCaught%5===0,bonus=goal?350:0;if(goal)cash+=bonus;
  stopFishing(pick[0].toUpperCase()+' CAUGHT · +$'+gain+(goal?' · ANGLER CONTRACT +$350':' · '+(5-save.fishCaught%5)+' TO CONTRACT BONUS'));
  persist();
}
function fishingUI(){
  if(!fish)return;
  const width=save.owned.rod?34:24;
  if(fish.phase==='bite')fishingBar.innerHTML='BITE! I / FISH in the gold zone to hook.<div class="track"><div class="sweet" style="left:'+(50-width/2)+'%;width:'+width+'%"></div><div class="needle"></div></div>';
  else if(fish.phase==='fight')fishingBar.innerHTML='HOOKED · Tap I / FISH to reel. Rest to cool tension.<br>Catch '+Math.round(fish.progress*100)+'% · Tension '+Math.round(fish.tension*100)+'%<div class="track"><div style="height:100%;width:'+(fish.progress*100)+'%;background:#9ed5c1"></div></div>';
}
function reel(){
  if(state!=='play'||!player||player.dead)return;
  if(!fish)return startFishing();
  if(fish.phase==='cast'){stopFishing('YOU REELED IN TOO SOON');return;}
  if(fish.phase==='fight'){
    if(fish.reelCooldown>0)return;
    fish.reelCooldown=10;fish.tension+=save.owned.rod?.14:.19;
    if(fish.tension>=1){stopFishing('LINE SNAPPED · REST BETWEEN REELS');return;}
    fish.progress+=(save.owned.rod?.19:.15)*(window.level29Trading?.reelPower||1);fish.t=600;sfx('door');
    if(fish.progress>=1)return catchFish();fishingUI();return;
  }
  const width=save.owned.rod?.34:.24;
  if(Math.abs(fish.needle-.5)>=width/2){stopFishing('THE FISH GOT AWAY');return;}
  fish.phase='fight';fish.t=600;fish.reelCooldown=10;sfx('hit');fishingUI();
}
function drawFishingVisual(){
  if(!fish||!scene)return;
  if(!fishingVisual){
    fishingVisual=new THREE.Group();fishingVisual.name='Fishing bobber and line';scene.add(fishingVisual);
    const bob=new THREE.Mesh(new THREE.SphereGeometry(2.5,8,6),new THREE.MeshBasicMaterial({color:'#ffbe5a'}));fishingVisual.add(bob);
    const ring=new THREE.Mesh(new THREE.RingGeometry(5,6,24).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:'#d0efdc',transparent:true,opacity:.55,side:THREE.DoubleSide}));fishingVisual.add(ring);
    const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);
    fishingVisual.add(new THREE.Line(geo,new THREE.LineBasicMaterial({color:'#f4e8c8',transparent:true,opacity:.8})));
  }
  const bob=fishingVisual.children[0],ring=fishingVisual.children[1],line=fishingVisual.children[2];
  const pulse=Math.sin(frame*.12),x=fish.x,y=fish.y;
  bob.position.set(x,1.5+pulse*(fish.phase==='cast'?.5:1.8),y);
  ring.position.set(x,.4,y);ring.scale.setScalar(1+(frame%50)/25);ring.material.opacity=.55*(1-(frame%50)/50);
  const pos=line.geometry.attributes.position;pos.setXYZ(0,player.x,terrainHeight(player.x,player.y)+20,player.y);pos.setXYZ(1,x,bob.position.y,y);pos.needsUpdate=true;line.geometry.computeBoundingSphere();
}
function fishTick(){
  if(!fish)return;
  if(!nearWaterSpot()||state!=='play'||player.dead||dist(player.x,player.y,fish.originX,fish.originY)>45){stopFishing('FISHING CANCELLED · STAY AT YOUR CAST');return;}
  drawFishingVisual();
  if(fish.phase==='cast'){fish.t--;if(fish.t<=0){fish.phase='bite';fish.t=150;fish.needle=0;fish.dir=1;sfx('hit');fishingUI();}}
  else if(fish.phase==='bite'){fish.t--;fish.needle+=fish.dir*.018;if(fish.needle>1){fish.needle=1;fish.dir=-1;}if(fish.needle<0){fish.needle=0;fish.dir=1;}
    const n=fishingBar.querySelector('.needle');if(n)n.style.left=(fish.needle*100)+'%';
    if(fish.t<=0)stopFishing('THE FISH GOT AWAY');}
  else if(fish.phase==='fight'){
    fish.t--;fish.reelCooldown=Math.max(0,(fish.reelCooldown||0)-1);fish.tension=Math.max(.08,fish.tension-.004);
    if(fish.t<=0){stopFishing('THE FISH SHOOK THE HOOK');return;}if(frame%6===0)fishingUI();
  }
}
function cacheTick(){
  if(!city.caches)return;
  const ox=player.car?player.car.x:player.x,oy=player.car?player.car.y:player.y;
  for(const k of city.caches){
    if(save.caches.includes(k.id))continue;
    if(dist(ox,oy,k.x,k.y)<34){save.caches.push(k.id);cash+=k.amt;if(k.mesh){k.mesh.visible=false;}sfx('cash');toast('HIDDEN CASH FOUND · +$'+k.amt);banner={big:'HIDDEN MONEY',small:'+ $'+k.amt+' IN A BURIED CASH CACHE',t:180,good:true};persist();}
  }
}
let wakeGroup=null,wakeCity=null,wakeCursor=0;
function boatWakeTick(){
  if(!scene)return;
  if(wakeCity!==city){
    if(wakeGroup){scene.remove(wakeGroup);wakeGroup.children.forEach(m=>{m.geometry.dispose();m.material.dispose();});}
    wakeCity=city;wakeGroup=new THREE.Group();scene.add(wakeGroup);wakeCursor=0;
    // Fixed pool: up to six nearby moving boats, no per-frame allocations.
    for(let i=0;i<72;i++){
      const m=new THREE.Mesh(new THREE.PlaneGeometry(5,5).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:softTex,color:'#d9eeed',transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));
      m.userData.life=0;m.visible=false;wakeGroup.add(m);
    }
  }
  for(const m of wakeGroup.children){if(m.userData.life<=0)continue;m.userData.life--;m.visible=m.userData.life>0;m.material.opacity=m.userData.life/110;m.scale.setScalar(1+(50-m.userData.life)*.045);m.position.x+=m.userData.vx||0;m.position.z+=m.userData.vy||0;}
  if(frame%5!==0)return;
  const focus=player.car||player;
  for(const c of cars.filter(c=>c.boat&&!c.dead&&!c.gone&&Math.abs(c.v)>.5&&dist(c.x,c.y,focus.x,focus.y)<500).slice(0,6)){
    const direction=c.v<0?-1:1,speed=Math.min(1,Math.abs(c.v)/4);
    for(const side of [-1,1]){
      const m=wakeGroup.children[wakeCursor++%72],px=-Math.sin(c.a)*side,py=Math.cos(c.a)*side;
      m.position.set(c.x-Math.cos(c.a)*c.spec.len*.38*direction+px*c.spec.wid*.4,.65,c.y-Math.sin(c.a)*c.spec.len*.38*direction+py*c.spec.wid*.4);
      m.userData.life=50;m.userData.vx=px*.35*speed-Math.cos(c.a)*.1*direction;m.userData.vy=py*.35*speed-Math.sin(c.a)*.1*direction;m.visible=true;m.scale.setScalar(1);
    }
  }
}
function updateWorld(){
  if(!city||!city.world||state==='menu'||!player)return;
  if(panel.style.display!=='none'&&state!=='shop')closeStore();
  if(frame%6===0&&city.residence){const l=city.residence.lobby;nearResidence=interior==='apartment'?'apartment':dist(player.x,player.y,l.x,l.y)<150?'lobby':dist(player.x,player.y,city.residence.garage.x,city.residence.garage.y)<150?'garage':null;}
  if(state!=='play'){if(fish)stopFishing();return;}
  warmAssets();zombieDoors();fishTick();cacheTick();boatWakeTick();
  // The tower's elevator only works inside the lobby; high-floor camera uses terrainHeight.
  if(!resident)resident=city.residence;
  if(interior==='apartment'&&resident){const b=resident.b;player.x=clamp(player.x,b.x+8,b.x+b.w-8);player.y=clamp(player.y,b.y+8,b.y+b.h-8);}
}
let nearResidence=null,warmed=false;
const prevBlips=extraBlips;
extraBlips=function(){const out=prevBlips();if(city&&city.world){if(city.residence)out.push({x:city.residence.lobby.x,y:city.residence.lobby.y,col:'#e8e1cf',label:'H'});
  if(city.pier)out.push({x:city.pier.x1-60,y:city.pier.y+16,col:'#39c6d6',label:'F'});}return out;};
function warmAssets(){
  if(warmed)return;warmed=true;
  // Only warm nearby vehicles. Building every catalog model at startup caused long
  // main-thread stalls, especially now that the vehicle selection is larger.
  const types=[...new Set(cars.filter(c=>!c.boat&&dist(c.x,c.y,player.x,player.y)<380).map(c=>c.type))];let i=0;
  const step=()=>{if(i>=types.length){try{const k=makePickup();k.visible=false;}catch(_){}return;}
    try{const c=makeCar(0,0,0,types[i++]);const m=makeCarMesh(c);scene.remove(m);}catch(_){}
    setTimeout(step,70);};
  setTimeout(step,1200);
}
const prevUpdate=update;
update=function(){prevUpdate();updateWorld();};
const prevCheat=applyCheat;
applyCheat=function(code){
  const clean=String(code).toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(clean==='KILO3028')return prevCheat(clean);
  if(CHEATS[clean]&&!save.owned[clean]){toast('CODE LOCKED · BUY IT FROM THE CODE DEALER');return false;}
  return prevCheat(clean);
};
addEventListener('keydown',e=>{
  if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'))return;
  const k=e.key.toLowerCase();
  if(state==='menu')return;
  if(k==='escape'&&panel.style.display!=='none'){closeStore();return;}
  if(state!=='play')return;
  if(k==='b'&&!e.repeat){e.preventDefault();showStore(nearResidence==='garage'?'garage':nearResidence?'home':'upgrades');}
  if(k==='i'&&!e.repeat){e.preventDefault();reel();}
  if(k==='u'&&!e.repeat&&city&&city.world&&nearResidence&&!nearVenueStation()){e.preventDefault();showStore(nearResidence==='garage'?'garage':'home');}
},true);
function nearVenueStation(){for(const v of city.venues||[])if(dist(player.x,player.y,v.stationX,v.stationY)<60)return true;return false;}
const touchGroup2=document.querySelector('#touch .group');
if(touchGroup2){for(const [id,label,fn] of [['storeBtn','STORE',()=>state==='play'&&showStore(nearResidence==='garage'?'garage':nearResidence?'home':'upgrades')],['fishBtn','FISH',reel]]){const b=document.createElement('button');b.id=id;b.textContent=label;b.onclick=fn;touchGroup2.appendChild(b);}}
window.level29OpenWorld={get fish(){return fish;},get near(){return nearResidence;},nearStation:()=>nearVenueStation(),get save(){return save;},zones:ZONE_NAMES,showStore,startFishing,reel,get interior(){return interior;},get drawCalls(){return renderer.info.render.calls;},get city(){return city;},teleport:(x,y)=>{if(player){player.x=x;player.y=y;snapCamera();}}};
// ---------------------------------------------------------------- vehicle customization visuals
function decorate(m,c){
  const u=m.userData,q=c.custom||{},p=u.profile;if(!p)return;
  if(u.customGroup){m.remove(u.customGroup);u.customGroup.traverse(o=>{if(o.geometry)o.geometry.dispose();});}
  for(const w of u.rollingWheels||[]){if(w.rimDisc){w.spin.remove(w.rimDisc);w.rimDisc.geometry.dispose();w.rimDisc=null;}}
  const grp=new THREE.Group();u.customGroup=grp;m.add(grp);const L=c.spec.len,W=c.spec.wid;
  if(q.spoiler){const gold=new THREE.MeshStandardMaterial({color:'#15191c',metalness:.45,roughness:.35});
    for(const z of [-W*.34,W*.34]){const post=new THREE.Mesh(new THREE.BoxGeometry(1.2,5,1.2),gold);post.position.set(-L*.43,p.belt+3,z);grp.add(post);}
    const wing=new THREE.Mesh(new THREE.BoxGeometry(5,.9,W*.92),new THREE.MeshStandardMaterial({color:c.col,metalness:.5,roughness:.25}));wing.position.set(-L*.43,p.belt+6,0);grp.add(wing);u.customWing=wing;}
  if(q.underglow){const glow=new THREE.Mesh(new THREE.PlaneGeometry(L*1.25,W*1.55).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:'#ffd36b',map:softTex,transparent:true,opacity:.62,depthWrite:false,blending:THREE.AdditiveBlending}));glow.position.y=.42;grp.add(glow);}
  if(q.rims)for(const w of u.rollingWheels||[]){const disc=new THREE.Mesh(new THREE.CircleGeometry(p.r*.62,5+3),new THREE.MeshStandardMaterial({color:'#e2c36a',metalness:.9,roughness:.2,side:THREE.DoubleSide}));
    disc.position.z=w.side*1.9;if(w.side<0)disc.rotation.y=Math.PI;w.spin.add(disc);w.rimDisc=disc;}
  const part=(w,h,d,mat,x,y,z)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);o.position.set(x,y,z);grp.add(o);return o;};
  const dark=new THREE.MeshStandardMaterial({color:'#17191c',metalness:.5,roughness:.4}),chrome=new THREE.MeshStandardMaterial({color:'#dfe4ea',metalness:1,roughness:.12});
  if(q.neon){const glow=new THREE.Mesh(new THREE.PlaneGeometry(L*1.3,W*1.6).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:'#b04dff',map:softTex,transparent:true,opacity:.7,depthWrite:false,blending:THREE.AdditiveBlending}));glow.position.y=.45;grp.add(glow);}
  if(q.stripes){const st=new THREE.MeshStandardMaterial({color:c.col==='#f2f2f2'?'#1a1a1a':'#f4f1e8',roughness:.4});for(const z of [-1.6,1.6]){part(L*.36,.25,1.6,st,L*.2,p.belt+.15,z);part(L*.42,.25,1.6,st,-L*.05,p.roof+.15,z);}}
  if(q.bodykit){for(const z of [-W*.52,W*.52])part(L*.62,1.6,1.4,dark,0,2.6,z);part(1.6,2.4,W*1.02,dark,L*.5,2.4,0);part(1.6,2.4,W*1.02,dark,-L*.5,2.4,0);}
  if(q.scoop){part(5,2.2,W*.32,dark,L*.28,p.belt+1.1,0);part(.4,1.4,W*.26,new THREE.MeshBasicMaterial({color:'#050505'}),L*.28+2.6,p.belt+1.3,0);}
  if(q.exhaust)for(const z of [-W*.22,W*.22]){const t=new THREE.Mesh(new THREE.CylinderGeometry(.75,.75,3,10).rotateZ(Math.PI/2),chrome);t.position.set(-L*.5-.8,2.6,z);grp.add(t);}
  if(q.bullbar){for(const z of [-W*.3,W*.3])part(1,6,1,chrome,L*.5+1.2,5,z);part(1,1,W*.7,chrome,L*.5+1.2,8,0);part(1,1,W*.7,chrome,L*.5+1.2,3.6,0);}
  if(q.roofrack){for(const z of [-W*.36,W*.36])part(L*.34,.6,.6,dark,-L*.02,p.roof+1.2,z);for(const x of [-L*.15,L*.12])part(.6,.6,W*.75,dark,x,p.roof+1.2,0);
    const lamp=new THREE.MeshStandardMaterial({color:'#fff6cf',emissive:0xfff0b0,emissiveIntensity:1.2});for(const z of [-W*.24,-W*.08,W*.08,W*.24])part(.8,1.4,1.6,lamp,L*.14,p.roof+2.2,z);}
  if(q.chrome){for(const z of [-W*.5,W*.5])part(L*.7,.35,.3,chrome,0,p.belt-.4,z);part(.5,2,W*.7,chrome,L*.5+.2,5.2,0);}
}
const prevCarSync=syncCars;
syncCars=function(){
  prevCarSync();
  for(const [c,m] of carMeshes){
    if(!c.custom||!m.visible)continue;const u=m.userData,key=JSON.stringify(c.custom);
    if(u.cKey!==key){u.cKey=key;decorate(m,c);}
    if(c.custom.finish&&u.paint){u.paint.metalness=.05;u.paint.roughness=.88;u.paint.clearcoat=0;}
    if(u.customWing)u.customWing.material.color.set(c.col);
  }
};
})();
