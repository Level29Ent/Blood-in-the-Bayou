'use strict';
// Street routes are planned against footprints, never through another building or water.
(function(){
function streetRoute(c,v,T,W,H,road,water,bridge){
 const sx=Math.floor(v.doorX/T),sy=Math.floor((v.doorY+T/2)/T);
 const occupied=new Set();
 for(const b of c.buildings)for(let y=Math.floor(b.y/T);y<Math.ceil((b.y+b.h)/T);y++)for(let x=Math.floor(b.x/T);x<Math.ceil((b.x+b.w)/T);x++)occupied.add(y*W+x);
 const start=sy*W+sx,queue=[start],prev=new Map([[start,-1]]);let end=-1;
 for(let i=0;i<queue.length;i++){
  const k=queue[i],x=k%W,y=Math.floor(k/W);
  if(c.g[k]===road||c.g[k]===bridge){end=k;break;}
  for(const [xx,yy] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){
   const n=yy*W+xx;if(xx<1||yy<1||xx>=W-1||yy>=H-1||prev.has(n)||occupied.has(n)||c.g[n]===water)continue;
   prev.set(n,k);queue.push(n);
  }
 }
 const path=[];if(end<0)return path;for(let k=end;k!==-1;k=prev.get(k))path.push(k);return path.reverse();
}
function overlaps(x,y,r,b){return x+r>b.x&&x-r<b.x+b.w&&y+r>b.y&&y-r<b.y+b.h;}
if(typeof module!=='undefined')module.exports={streetRoute,overlaps};
if(typeof window==='undefined')return;
VENUE_TYPES.push({id:'shelter',name:'NEIGHBORHOOD SHELTER',short:'SAFE INTERIOR',letter:'·',col:'#9ed5c1'});
const SHOP_TYPES=[
 {name:'BAYOU SMOKE & SUPPLY',short:'SMOKE SHOP',col:'#d3af79',letter:'S',kind:'smoke'},
 {name:'BAYOU COMMUNITY HOSPITAL',short:'HOSPITAL',col:'#9adbe0',letter:'+',kind:'clinic'},
 {name:'GULF FRESH FISH MARKET',short:'FISH MARKET',col:'#81c9d2',letter:'F',kind:'fish'}
];
const generate=genCity;
genCity=function(){
 const c=generate.apply(this,arguments);if(!c.world)return c;
 for(const b of c.buildings){
  if(b.venue||!['normal','tower','helipad','cathedral'].includes(b.kind))continue;
  const height=b.H,v=createVenue(b,'shelter','street-'+b.x+'-'+b.y);v.upperHeight=height;
  const t=3;v.colliderWalls=[{x:b.x,y:b.y,w:b.w,h:t},{x:b.x,y:b.y,w:t,h:b.h},{x:b.x+b.w-t,y:b.y,w:t,h:b.h},{x:b.x,y:b.y+b.h-t,w:(b.w-v.doorW)/2,h:t},{x:v.doorX+v.doorW/2,y:b.y+b.h-t,w:(b.w-v.doorW)/2,h:t}];
  v.colliderDoor={x:v.doorX-v.doorW/2,y:v.doorY-t,w:v.doorW,h:t};c.venues.push(v);
  for(let y=Math.floor(b.y/TILE);y<Math.ceil((b.y+b.h)/TILE);y++)for(let x=Math.floor(b.x/TILE);x<Math.ceil((b.x+b.w)/TILE);x++)c.g[y*MW+x]=T_LOT;
 }
 // Give the converted street buildings distinct services; preserve their collision/door layout.
 const converted=c.venues.filter(v=>v.id==='shelter').sort((a,b)=>{
  const p=c.pier;return p?Math.hypot(a.doorX-p.x1,a.doorY-p.y)-Math.hypot(b.doorX-p.x1,b.doorY-p.y):a.doorX-b.doorX;
 });
 converted.forEach((v,i)=>{const spec=SHOP_TYPES[i%2?1:2];Object.assign(v,spec);});
 // Secondary neighborhood safehouses were still marked solid on the tile grid.
 for(const v of c.venues)if(v.id==='safe'){
  const b=v.b;for(let y=Math.floor(b.y/TILE);y<Math.ceil((b.y+b.h)/TILE);y++)for(let x=Math.floor(b.x/TILE);x<Math.ceil((b.x+b.w)/TILE);x++)c.g[y*MW+x]=T_LOT;
 }
 c.streetRoutes=[];
 for(const v of c.venues){const route=streetRoute(c,v,TILE,MW,MH,T_ROAD,T_WATER,T_BRIDGE);v.streetAccessible=route.length>0;
  for(const k of route){if(c.g[k]!==T_ROAD&&c.g[k]!==T_BRIDGE)c.g[k]=T_WALK;c.streetRoutes.push({x:(k%MW+.5)*TILE,y:(Math.floor(k/MW)+.5)*TILE});}
 }
 const clear=p=>!c.streetRoutes.some(q=>Math.abs(p.x-q.x)<TILE*.75+(p.r||0)&&Math.abs(p.y-q.y)<TILE*.75+(p.r||0));
 c.trees=c.trees.filter(clear);if(c.pineTrees)c.pineTrees=c.pineTrees.filter(clear);c.rocks=(c.rocks||[]).filter(clear);c.parked=c.parked.filter(p=>p.type==='boat'||p.type==='yacht'||clear(p));indexTrees(c);
 return c;
};
let searched=[];try{const saved=JSON.parse(localStorage.getItem('level29.shelter-search.v1')||'[]');if(Array.isArray(saved))searched=saved;}catch(_){}
const build=buildVenue;
buildVenue=function(v){
 if(v.id!=='shelter'){
  build(v);if(!v.mesh)return;
  const {material}=window.level29World,b=v.b;
  // Exit guidance and trim do not add collision in the service aisle.
  const exit=addSign(v.mesh,'EXIT → STREET',Math.min(55,v.doorW),4,v.doorX,36,v.doorY-4,'#9ed5c1');exit.rotation.y=Math.PI;exit.material.side=THREE.FrontSide;
  addPart(v.mesh,Math.max(8,b.w-8),2,1,b.x+b.w/2,13,b.y+3.5,material('#c6ab77'));
  return;
 }
 const b=v.b,g=new THREE.Group();v.mesh=g;cityGroup.add(g);g.position.y=terrainHeight(b.x+b.w/2,b.y+b.h/2);
 const {material,facade}=window.level29World,wall=facade(b.col||'#b7b4a0','brick'),wood=material('#715746'),trim=material('#e4c78d'),green=material('#405d55');
 const part=(w,h,d,x,y,z,m)=>addPart(g,w,h,d,x,y,z,m);
 part(b.w,1,b.h,b.x+b.w/2,.5,b.y+b.h/2,material('#d3cabb'));
 for(const r of v.colliderWalls)part(r.w,48,r.h,r.x+r.w/2,24,r.y+r.h/2,wall);
 part(v.doorW,7,3,v.doorX,45,v.doorY-1.5,trim);
 v.door=part(v.doorW-1,40,1.5,v.doorX,20,v.doorY-1,green);
 v.roof=part(b.w+2,3,b.h+2,b.x+b.w/2,50,b.y+b.h/2,green);
 if(v.upperHeight>60)part(b.w,v.upperHeight-52,b.h,b.x+b.w/2,52+(v.upperHeight-52)/2,b.y+b.h/2,wall);
 if(window.level29FishMarket?.matches(v)){const store=level29FishMarket.build(THREE,b,0,addSign);g.add(store.root);v.furniture.push(...store.solids);v.referenceFish=true;addSign(g,v.name,Math.min(140,b.w),9,v.doorX,59,v.doorY,v.col);v.labelH=72;return;}
 // Furniture hugs the back wall; the entrance and central aisle remain clear.
 const benchW=Math.min(45,b.w*.3),depth=Math.min(18,b.h*.2),x=b.x+8+benchW/2,z=b.y+8+depth/2;
 part(benchW,8,depth,x,4,z,wood);part(benchW,3,depth,x,9,z,green);v.furniture.push({x:x-benchW/2,y:z-depth/2,w:benchW,h:depth});
 part(Math.min(25,b.w*.2),18,2,b.x+b.w*.72,26,b.y+3,trim);
 part(Math.min(21,b.w*.16),14,2.1,b.x+b.w*.72,26,b.y+3.2,green);
 part(b.w-8,2,1,b.x+b.w/2,14,b.y+3,trim);
 part(Math.min(22,b.w*.3),.5,10,b.x+b.w/2,46,b.y+b.h*.5,new THREE.MeshBasicMaterial({color:'#fff1cb'}));
 if(v.kind==='clinic'){
  part(22,5,12,b.x+b.w-24,4,b.y+24,trim);part(20,2,11,b.x+b.w-24,8,b.y+24,material('#e9f4ef'));
  part(1,25,1,b.x+b.w-10,14,b.y+24,trim);part(3,6,2,b.x+b.w-10,24,b.y+24,material('#c1d8de'));
  part(8,7,1,b.x+b.w-24,20,b.y+4,material('#263c40'));
  part(4,18,1,b.x+b.w*.72,26,b.y+4,material('#c84444'));part(14,4,1.1,b.x+b.w*.72,26,b.y+4.1,material('#c84444'));
 }else{
  const w=Math.min(38,b.w*.35);part(w,10,12,b.x+b.w-10-w/2,5,b.y+20,wood);
  if(v.kind==='fish')for(let i=0;i<4;i++){
   const m=new THREE.Mesh(new THREE.SphereGeometry(1,10,6),material(i%2?'#b0c5bd':'#658991'));m.scale.set(3,1,1.2);m.position.set(b.x+b.w-14-i*7,11,b.y+20);g.add(m);
  }else for(let i=0;i<5;i++)part(3,7,3,b.x+b.w-14-i*5,14,b.y+20,material(i%2?'#b09564':'#4b5968'));
 }
 if(v.kind==='clinic')v.furniture.push({x:b.x+b.w-35,y:b.y+18,w:22,h:12});else {const w=Math.min(38,b.w*.35);v.furniture.push({x:b.x+b.w-10-w,y:b.y+14,w,h:12});}
 part(12,2,10,v.stationX,1,v.stationY,green);
 addSign(g,'U / USE · '+v.short,Math.min(110,b.w-8),7,v.stationX,23,b.y+4,v.col);
 addSign(g,v.name,Math.min(140,b.w),9,v.doorX,59,v.doorY,v.col);v.labelH=72;
};
const service=serviceVenue;
serviceVenue=function(){const v=nearStation();if(v&&(v.id==='shelter'||v.kind==='smoke')){if(window.level29Trading)level29Trading.open(v);return;}return service.apply(this,arguments);};
const buildSafe=buildVenue;
buildVenue=function(v){
 buildSafe(v);if(v.id!=='safe'||!v.mesh)return;
 // Locate the service/search marker only after furniture and staff colliders exist.
 const b=v.b;let target=null;
 for(let y=b.y+b.h-28;y>b.y+20&&!target;y-=8)for(let x=b.x+20;x<b.x+b.w-20;x+=8){
  if(!v.furniture.some(r=>hitRect(x,y,14,r))){target={x,y};break;}
 }
 if(target){v.stationX=target.x;v.stationY=target.y;if(v.pad)v.pad.position.set(target.x,1,target.y);}
 addSign(v.mesh,'STAND HERE · SEARCH SUPPLIES',110,7,v.stationX,23,v.stationY,'#9ed5c1');
};
// Also covers spawn/migration and collision calls made without moverCtx.
const blocked=blockedCircle;
blockedCircle=function(x,y,r){if(city&&moverCtx&&moverCtx.alive!==undefined&&city.buildings.some(b=>overlaps(x,y,r,b)))return true;return blocked(x,y,r);};
const spawn=spawnZombieAt;
spawnZombieAt=function(x,y,type){if(city&&city.buildings.some(b=>overlaps(x,y,12,b)))return null;return spawn.apply(this,arguments);};
const tick=update;
update=function(){tick.apply(this,arguments);if(!city||!player||state!=='play')return;
 const v=!player.car&&!player.dead&&!(city.penthouse&&city.penthouse.active)&&city.venues.find(v=>v.id==='safe'&&insideVenue(v,player)&&dist(player.x,player.y,v.stationX,v.stationY)<24);
 for(const room of city.venues)if(room.id==='safe'&&room!==v)room.searchT=0;
 if(v&&!searched.includes(v.key)){
  v.searchT=(v.searchT||0)+1;
  if(v.searchT===1)toast('SEARCHING SUPPLIES · STAY HERE 3 SECONDS');
  if(v.searchT>=180){searched.push(v.key);cash+=120;player.hp=Math.min(player.maxHp,player.hp+15);sfx('cash');toast('SUPPLIES FOUND · +$120 · +15 HEALTH');try{localStorage.setItem('level29.shelter-search.v1',JSON.stringify(searched));}catch(_){}if(window.level29Save)level29Save.save();}
 }
 for(const z of zombies)if(z.alive&&city.buildings.some(b=>overlaps(z.x,z.y,0,b))){z.alive=false;z.hp=0;z.deathT=60;}
};
})();
