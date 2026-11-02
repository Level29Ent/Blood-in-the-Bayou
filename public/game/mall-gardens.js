'use strict';
(function(){
function overlap(a,b,pad=0){return a.x<b.x+b.w+pad&&a.x+a.w>b.x-pad&&a.y<b.y+b.h+pad&&a.y+a.h>b.y-pad;}
function findSite(c,T,W,H,blocked){
 const reserved=c.buildings.concat((c.features||[]).filter(f=>!['garden','forest'].includes(f.kind)),[c.farm,c.recreationParcel,c.airportParcel,c.natchezParcel].filter(Boolean),Object.values(c.activityLots||{}));
 const former=c.formerMountains||[];let best=null,score=Infinity;
 for(const [w,h]of [[20*T,16*T],[18*T,14*T],[16*T,12*T],[12*T,10*T]]){
  for(let y=4*T;y+h<(H-4)*T;y+=T)for(let x=4*T;x+w<(W-4)*T;x+=T){const p={x,y,w,h};if(reserved.some(r=>overlap(p,r,24)))continue;
   let ok=true;for(let yy=y/T;yy<(y+h)/T&&ok;yy++)for(let xx=x/T;xx<(x+w)/T;xx++)if(blocked.includes(c.g[yy*W+xx])){ok=false;break;}if(!ok)continue;
   const near=former.length?Math.min(...former.map(f=>Math.hypot(x+w/2-f.x-f.w/2,y+h/2-f.y-f.h/2))):Math.hypot(x-W*T*.65,y-H*T*.7);
   if(near<score){score=near;best=p;}
  }if(best)return best;
 }return null;
}
function layout(b){const shops=[];const names=[['BAYOU FASHION','TECH & GIFTS'],['HOME & LIVING','29 CUISINE'],['LUXURY COLLECTION','EXECUTIVE TALENT']];for(let floor=0;floor<3;floor++)for(let side=0;side<2;side++){const w=100,d=Math.min(125,b.h-110),x=side?b.x+b.w-w-5:b.x+5,y=b.y+64;shops.push({name:names[floor][side],floor,x:x+w/2,y:y+d/2+24,room:{x,y,w,h:d},doorX:x+w/2,doorY:y+d});}for(const [side,name]of [[0,'GREENTOWN PLANT STORE'],[1,'FISH AQUARIUM STORE']]){const w=100,d=125,x=side?b.x+b.w-w-5:b.x+5,y=b.y+b.h-165;shops.push({name,floor:0,x:x+w/2,y:y+d/2+24,room:{x,y,w,h:d},doorX:x+w/2,doorY:y+d});}return {lift:{x:b.x+b.w/2,y:b.y+28},landing:{x:b.x+b.w/2,y:b.y+35},southLift:{x:b.x+b.w/2,y:b.y+b.h-24},shops};}
if(typeof module!=='undefined')module.exports={findSite,overlap,layout};if(typeof window==='undefined')return;
VENUE_TYPES.push({id:'mall',name:'GREENTOWN MALL',short:'MALL · 3 LEVELS',letter:'M',col:'#e9c27a'});
const gen=genCity;genCity=function(){const c=gen.apply(this,arguments);if(!c.world)return c;
 c.activityLots=Object.fromEntries(Object.entries(window.level29Downtown?.lots||{}).map(([id,l])=>[id,{x:l.x0*TILE,y:l.y0*TILE,w:(l.x1-l.x0+1)*TILE,h:(l.y1-l.y0+1)*TILE}]));
 const p=findSite(c,TILE,MW,MH,[T_ROAD,T_BRIDGE,T_WATER,T_BLD])||findSite({...c,buildings:c.buildings.filter(b=>b.venue||b.kind!=='normal')},TILE,MW,MH,[T_WATER,T_BRIDGE]);if(!p)throw Error('No clear landscaped mall parcel');
 c.buildings=c.buildings.filter(b=>b.venue||b.kind!=='normal'||!overlap(b,p,8));
 c.mallParcel=p;const b={x:p.x+32,y:p.y+32,w:p.w-64,h:p.h-96,H:176,kind:'normal',seed:2929,col:'#d7c9ac'};
 const v=createVenue(b,'mall','garden-mall');b.H=176;v.floor=0;v.open=true;v.extended=false;v.staff=[];v.mallLayout=layout(b);v.colliderDoor={x:v.doorX-v.doorW/2,y:v.doorY-3,w:v.doorW,h:3};
 v.colliderWalls=[{x:b.x,y:b.y,w:b.w,h:3},{x:b.x,y:b.y,w:3,h:b.h},{x:b.x+b.w-3,y:b.y,w:3,h:b.h},{x:b.x,y:b.y+b.h-3,w:(b.w-v.doorW)/2,h:3},{x:v.doorX+v.doorW/2,y:b.y+b.h-3,w:(b.w-v.doorW)/2,h:3}];
 v.parkingDecks=[{x:b.x-28,y:b.y+b.h/2-45,w:28,h:90},{x:b.x+b.w,y:b.y+b.h/2-45,w:28,h:90}];
 v.stationX=v.mallLayout.lift.x;v.stationY=v.mallLayout.lift.y;c.buildings.push(b);c.venues.push(v);c.mall=v;
 for(let y=p.y/TILE;y<(p.y+p.h)/TILE;y++)for(let x=p.x/TILE;x<(p.x+p.w)/TILE;x++)c.g[y*MW+x]=T_PARK;
 for(let y=b.y/TILE;y<(b.y+b.h)/TILE;y++)for(let x=b.x/TILE;x<(b.x+b.w)/TILE;x++)c.g[y*MW+x]=T_LOT;
 const inPlot=o=>overlap({x:o.x,y:o.y,w:1,h:1},p,16);c.trees=c.trees.filter(o=>!inPlot(o));if(c.pineTrees)c.pineTrees=c.pineTrees.filter(o=>!inPlot(o));c.parked=c.parked.filter(o=>!inPlot(o));c.rocks=(c.rocks||[]).filter(o=>!inPlot(o));indexTrees(c);return c;
};
function buildMall(v){const b=v.b,g=new THREE.Group();g.name='Greentown Mall · three levels';v.mesh=g;cityGroup.add(g);const M=level29World.material,q=level29World.batch(g),cream=M('#d9cfb8'),gold=M('#bd9b58',.45,.5),tile=M('#b8c6bc'),dark=M('#233c43'),wood=M('#87684e');v.floorFurniture=[[],[],[]];
 const glassRail=new THREE.MeshStandardMaterial({color:'#b5d4d4',transparent:true,opacity:.25,roughness:.25,depthWrite:false});
 const part=(w,h,d,x,y,z,m)=>q.box(w,h,d,x,y,z,m);
 for(let floor=0;floor<3;floor++){const base=floor*56;
  if(!floor)part(b.w,2,b.h,b.x+b.w/2,base,b.y+b.h/2,tile);
  else{const edge=112;part(edge,2,b.h,b.x+edge/2,base,b.y+b.h/2,tile);part(edge,2,b.h,b.x+b.w-edge/2,base,b.y+b.h/2,tile);part(b.w-edge*2,2,edge,b.x+b.w/2,base,b.y+edge/2,tile);part(b.w-edge*2,2,edge,b.x+b.w/2,base,b.y+b.h-edge/2,tile);
   const hole={x:b.x+edge,y:b.y+edge,w:b.w-2*edge,h:b.h-2*edge};if(floor===2){const gap=24,mid=hole.y+hole.h/2;v.floorFurniture[floor].push({...hole,h:hole.h/2-gap/2},{...hole,y:mid+gap/2,h:hole.h/2-gap/2});part(hole.w,2,gap,hole.x+hole.w/2,base,mid,tile);for(const side of [-1,1])part(hole.w,12,1,hole.x+hole.w/2,base+7,mid+side*gap/2,glassRail);addSign(g,'SKYBRIDGE · LUXURY WING',100,6,hole.x+hole.w/2,base+22,mid,'#e5d3a4');}else v.floorFurniture[floor].push(hole);
   for(const x of [hole.x,hole.x+hole.w])part(1,12,hole.h,x,base+7,hole.y+hole.h/2,glassRail);for(const y of [hole.y,hole.y+hole.h])part(hole.w,12,1,hole.x+hole.w/2,base+7,y,glassRail);
  }
  for(const r of v.colliderWalls){if(floor===2&&r.h>20&&r.w<=3){const span=(r.h-28)/2;for(const side of [-1,1])part(r.w,48,span,r.x+r.w/2,base+24,r.y+r.h/2+side*(r.h+28)/4,glassRail);}else part(r.w,48,r.h,r.x+r.w/2,base+24,r.y+r.h/2,r.h>20&&r.w<=3?glassRail:cream);if(r.h>20&&r.w<=3)for(let z=r.y+16;z<r.y+r.h;z+=32)if(floor!==2||Math.abs(z-(r.y+r.h/2))>16)part(2,50,2,r.x+r.w/2,base+25,z,gold);}
  // Upper front wall is closed except for the lift: players cannot exit into midair.
  if(floor)part(v.doorW,48,3,v.doorX,base+24,v.doorY-1.5,glassRail);
  for(const hub of [v.mallLayout.lift,v.mallLayout.southLift]){
   for(const side of [-1,1])part(1,45,24,hub.x+side*15,base+23,hub.y,glassRail);
   addSign(g,'U · GLASS LIFT',65,5,hub.x,base+27,hub.y-12,'#e6c887');
  }
  if(floor<2){for(const side of [-1,1]){const x=b.x+28,z=b.y+b.h/2+side*45;const ramp=new THREE.Mesh(new THREE.BoxGeometry(28,2,76),dark);ramp.rotation.x=side*.64;ramp.position.set(x,base+28,z);g.add(ramp);for(let i=0;i<12;i++)part(24,1,4,x,base+3+i*4.6,z-side*(33-i*6),gold);}}
  const lift=v.mallLayout.lift;part(36,1,26,lift.x,base+1,lift.y,gold);addSign(g,'U · LIFT · FLOOR '+(floor+1),100,7,lift.x,base+30,b.y+4,'#e6c887');
  for(const shop of v.mallLayout.shops.filter(s=>s.floor===floor)){
   const r=shop.room,door=30,wall=(w,d,x,z)=>{part(w,42,d,x,base+21,z,cream);v.floorFurniture[floor].push({x:x-w/2,y:z-d/2,w,h:d});};
   wall(r.w,2,r.x+r.w/2,r.y);wall(2,r.h,r.x,r.y+r.h/2);wall(2,r.h,r.x+r.w,r.y+r.h/2);
   const span=(r.w-door)/2;for(const side of [-1,1])wall(span,2,shop.doorX+side*(r.w+door)/4,shop.doorY);
   part(door,8,2,shop.doorX,base+46,shop.doorY,cream);
   part(r.w-4,1,r.h-4,r.x+r.w/2,base+1,r.y+r.h/2,tile);
   const counterY=r.y+28;part(r.w-24,12,16,shop.doorX,base+6,counterY,wood);v.floorFurniture[floor].push({x:r.x+12,y:counterY-8,w:r.w-24,h:16});
   if(shop.name==='GREENTOWN PLANT STORE'){for(let n=0;n<4;n++){const x=shop.x-18+n*12,z=shop.y;const pot=new THREE.Mesh(new THREE.CylinderGeometry(2.2,1.6,3.5,10),wood);pot.position.set(x,base+16,z);g.add(pot);const stem=new THREE.Mesh(new THREE.CylinderGeometry(.2,.25,7,6),gold);stem.position.set(x,base+21,z);g.add(stem);for(const side of [-1,1]){const leaf=new THREE.Mesh(new THREE.SphereGeometry(1,10,6),new THREE.MeshStandardMaterial({color:'#477847'}));leaf.scale.set(3,.5,1.5);leaf.rotation.z=side*.4;leaf.position.set(x+side*2,base+23,z);g.add(leaf);}}}
   if(shop.name==='FISH AQUARIUM STORE'){for(const dx of [-17,17]){part(26,2,18,shop.x+dx,base+15,shop.y,gold);const tank=new THREE.Mesh(new THREE.BoxGeometry(24,15,16),new THREE.MeshStandardMaterial({color:'#85c5d0',transparent:true,opacity:.22,depthWrite:false}));tank.position.set(shop.x+dx,base+23,shop.y);g.add(tank);part(22,1,14,shop.x+dx,base+16,shop.y,cream);for(let n=0;n<3;n++){const fish=new THREE.Mesh(new THREE.SphereGeometry(1,10,6),new THREE.MeshStandardMaterial({color:n%2?'#df9e53':'#6397b2'}));fish.scale.set(2,.8,.6);fish.position.set(shop.x+dx-6+n*5,base+21+(n%2)*3,shop.y+(n-1)*3);g.add(fish);}}}
   addSign(g,shop.name,r.w-8,7,shop.doorX,base+36,shop.doorY+2,'#ead39b');
   for(let k=0;k<4;k++)part(8,5,8,r.x+19+k*20,base+15,counterY,dark);
   if(shop.name==='29 CUISINE'){addSign(g,'U · BURGER MEAL $60 · +50 HEALTH',90,5,shop.doorX,base+25,shop.doorY+2,'#e4b578');for(const dx of [-25,25]){part(20,1,18,shop.doorX+dx,base+10,r.y+65,gold);part(2,10,2,shop.doorX+dx,base+5,r.y+65,dark);}}
  }
  for(const side of [-1,1]){const x=b.x+b.w/2+side*42,z=b.y+b.h-43;part(28,6,12,x,base+3,z,wood);part(28,8,2,x,base+8,z-5,cream);v.floorFurniture[floor].push({x:x-14,y:z-6,w:28,h:12});}
 }
 // Barrel-vault skylight leaves the atrium open rather than a solid slab.
 const glassRoof=new THREE.MeshStandardMaterial({color:'#a4d1d5',transparent:true,opacity:.25,roughness:.2,depthWrite:false,side:THREE.DoubleSide});
 const geo=new THREE.PlaneGeometry(b.w,b.h,24,1),verts=geo.attributes.position;
 for(let i=0;i<verts.count;i++){const x=verts.getX(i),z=verts.getY(i);verts.setXYZ(i,b.x+b.w/2+x,168+Math.sqrt(Math.max(0,1-(x/(b.w/2))**2))*24,b.y+b.h/2+z);}geo.computeVertexNormals();
 const roof=new THREE.Mesh(geo,glassRoof);g.add(roof);
 for(let z=b.y;z<=b.y+b.h;z+=40){for(let k=0;k<24;k++){const x=-b.w/2+k*b.w/24,nx=x+b.w/24,y=168+Math.sqrt(Math.max(0,1-(x/(b.w/2))**2))*24,ny=168+Math.sqrt(Math.max(0,1-(nx/(b.w/2))**2))*24;const rod=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,Math.hypot(nx-x,ny-y),6),gold);rod.position.set(b.x+b.w/2+(x+nx)/2,(y+ny)/2,z);rod.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(nx-x,ny-y,0).normalize());g.add(rod);}}v.roof=null;
 const rink=new THREE.Mesh(new THREE.CircleGeometry(Math.min(b.w,b.h)*.23,48),new THREE.MeshStandardMaterial({color:'#c3e6eb',roughness:.3}));rink.rotation.x=-Math.PI/2;rink.position.set(b.x+b.w/2,1.5,b.y+b.h/2);g.add(rink);
 addSign(g,'GREENTOWN ATRIUM · SYNTHETIC ICE',110,6,b.x+b.w/2,18,b.y+b.h/2,'#e8d9b0');
 for(const x of [b.x+10,b.x+b.w-10])part(5,110,5,x,55,b.y+b.h+3,gold);
 // Large window frames on both stories; transparent glass stays performance-friendly.
 const glass=new THREE.MeshStandardMaterial({color:'#90bdb7',transparent:true,opacity:.3,roughness:.2,depthWrite:false});
 for(const side of [-1,1])for(let level=0;level<3;level++)for(let k=0;k<4;k++){const z=b.y+24+k*(b.h-48)/3;part(.6,23,20,b.x+b.w/2+side*(b.w/2+1),level*56+27,z,glass);}
 addSign(g,'GREENTOWN MALL',Math.min(250,b.w),14,v.doorX,104,v.doorY+3,'#f0d396');addSign(g,'WALK IN · THREE LEVELS · U LIFT',150,7,v.doorX,43,v.doorY+3,'#d8e5cc');
 for(const deck of v.parkingDecks||[]){part(deck.w,3,deck.h,deck.x+deck.w/2,112,deck.y+deck.h/2,cream);for(const x of [deck.x+2,deck.x+deck.w-2])for(const z of [deck.y+3,deck.y+deck.h-3])part(3,112,3,x,56,z,gold);for(const x of [deck.x<b.x?deck.x+1:deck.x+deck.w-1])part(1,12,deck.h,x,119,deck.y+deck.h/2,glassRail);for(const z of [deck.y+1,deck.y+deck.h-1])part(deck.w,12,1,deck.x+deck.w/2,119,z,glassRail);for(let z=deck.y+10;z<deck.y+deck.h;z+=20)part(deck.w-4,.3,1,deck.x+deck.w/2,114,z,gold);addSign(g,'PARKING SKYDECK',60,6,deck.x+deck.w/2,135,deck.y,'#ead5a5');}
 v.furniture=v.floorFurniture[0];q.finish();return g;
}
const builder=buildVenue;buildVenue=function(v){if(v.id!=='mall')return builder.apply(this,arguments);if(v.mesh?.parent===cityGroup)return;buildMall(v);};
function landscaping(){const p=city.mallParcel;if(!p)return;city.landscapeSolids=[];const g=new THREE.Group();g.name='Greentown Mall landscape';cityGroup.add(g);const q=level29World.batch(g),M=level29World.material,stone=M('#d9cdb1'),green=M('#4d7950'),pink=M('#b97093'),gold=M('#d0ad63');g.position.y=city.mall.baseY||0;
 const b=city.mall.b;
 q.box(38,1,p.y+p.h-(b.y+b.h),city.mall.doorX,.6,(b.y+b.h+p.y+p.h)/2,stone);
 for(const side of [-1,1]){const x=p.x+p.w/2+side*(p.w/2-15);for(let i=0;i<6;i++){const z=p.y+24+i*(p.h-48)/5;if([T_ROAD,T_BRIDGE].includes(city.g[Math.floor(z/TILE)*MW+Math.floor(x/TILE)]))continue;q.box(18,3,18,x,1.5,z,stone);city.landscapeSolids.push({x:x-9,y:z-9,w:18,h:18});const shrub=new THREE.Mesh(new THREE.SphereGeometry(1,10,8),green);shrub.scale.set(8,5,8);shrub.position.set(x,6,z);g.add(shrub);for(let k=0;k<3;k++){const flower=new THREE.Mesh(new THREE.SphereGeometry(1.5,8,6),k%2?gold:pink);flower.position.set(x-4+k*4,10,z);g.add(flower);}}}
 for(const side of [-1,1]){const x=city.mall.doorX+side*85,z=p.y+p.h-48;if([T_ROAD,T_BRIDGE].includes(city.g[Math.floor(z/TILE)*MW+Math.floor(x/TILE)]))continue;city.landscapeSolids.push({x:x-20,y:z-20,w:40,h:40});const basin=new THREE.Mesh(new THREE.CylinderGeometry(18,20,4,24),stone);basin.position.set(x,2,z);g.add(basin);const water=new THREE.Mesh(new THREE.CircleGeometry(16,24),M('#648e9d'));water.rotation.x=-Math.PI/2;water.position.set(x,4.1,z);g.add(water);const stem=new THREE.Mesh(new THREE.CylinderGeometry(2,3,12,12),stone);stem.position.set(x,10,z);g.add(stem);const tier=new THREE.Mesh(new THREE.CylinderGeometry(7,5,2,18),stone);tier.position.set(x,16,z);g.add(tier);}
 q.finish();if(window.level29BatchStatic)level29BatchStatic(g,[]);
 // Former mountain plots become light, original garden landscaping with no extra passes.
 const garden=new THREE.Group();garden.name='Former mountains · landscaped gardens';cityGroup.add(garden);const gb=level29World.batch(garden);
 for(const f of city.formerMountains||[])for(let y=f.y+32;y<f.y+f.h-20;y+=64)for(let x=f.x+32;x<f.x+f.w-20;x+=64){if((city.features||[]).some(o=>o!==f&&['basketball','training','skatepark','market','cemetery'].includes(o.kind)&&overlap({x:x-16,y:y-16,w:32,h:32},o,32))||[city.recreationParcel,city.basketballReservation,city.airportParcel].filter(Boolean).some(r=>overlap({x:x-16,y:y-16,w:32,h:32},r,32))||city.buildings.some(b=>overlap({x:x-16,y:y-16,w:32,h:32},b,32))||overlap({x,y,w:1,h:1},p,24)||[T_ROAD,T_BRIDGE,T_WATER].includes(city.g[Math.floor(y/TILE)*MW+Math.floor(x/TILE)]))continue;const h=city.heightAt(x,y);gb.box(16,2,16,x,h+1,y,stone);city.landscapeSolids.push({x:x-8,y:y-8,w:16,h:16});gb.box(12,5,12,x,h+4,y,green);for(const dx of [-3,3])gb.box(2,1,2,x+dx,h+7,y,pink);}
 gb.finish();
}
const build=buildCity;buildCity=function(){build.apply(this,arguments);if(city?.world)landscaping();};
function mallInside(v,p,r=0){const b=v.b;if(p.x-r>b.x+3&&p.x+r<b.x+b.w-3&&p.y-r>b.y+3&&p.y+r<b.y+b.h-3)return true;if(v.floor!==2)return false;return (v.parkingDecks||[]).some(d=>p.x-r>d.x&&p.x+r<d.x+d.w&&p.y-r>d.y&&p.y+r<d.y+d.h)||Math.abs(p.y-(b.y+b.h/2))+r<12&&p.x-r>b.x-26&&p.x+r<b.x+b.w+26;}
const originalInside=insideVenue;insideVenue=function(v,p){if(v.id==='mall'&&v.floor===2)return mallInside(v,p);return originalInside(v,p);};
const height=terrainHeight;terrainHeight=function(x,y){const v=city?.mall;if(v?.floor>0&&mallInside(v,{x,y}))return (v.baseY||0)+v.floor*56;return height.apply(this,arguments);};
const blocked=blockedCircle;blockedCircle=function(x,y,r){const v=city?.mall;if(v?.floor>0&&player&&moverCtx===player&&insideVenue(v,player)){if(!mallInside(v,{x,y},r))return true;return v.furniture.some(f=>x+r>f.x&&x-r<f.x+f.w&&y+r>f.y&&y-r<f.y+f.h);}return blocked.apply(this,arguments);};
const service=serviceVenue;serviceVenue=function(){const v=city?.mall;if(!v||!player||player.car||!insideVenue(v,player))return service.apply(this,arguments);const north=v.mallLayout.lift,south=v.mallLayout.southLift;const lift=dist(player.x,player.y,north.x,north.y)<dist(player.x,player.y,south.x,south.y)?north:south;if(dist(player.x,player.y,lift.x,lift.y)>32){const shop=v.mallLayout.shops.find(s=>s.floor===v.floor&&dist(player.x,player.y,s.x,s.y)<42);if(shop?.name==='29 CUISINE'){if(player.hp>=player.maxHp)return toast('29 CUISINE · HEALTH ALREADY FULL');if(cash<60)return toast('29 CUISINE · MEAL COSTS $60 GAME CASH');cash-=60;player.hp=Math.min(player.maxHp,player.hp+50);window.level29Save?.save();return toast('29 CUISINE · +50 HEALTH · $60');}return toast(shop?shop.name+' · BROWSE THE DISPLAY · LIFT AT THE REAR':'GREENTOWN MALL · APPROACH THE MARKED LIFT · U TO CHANGE FLOOR');}v.floor=(v.floor+1)%3;v.furniture=v.floorFurniture[v.floor];player.x=lift.x;player.y=lift===north?v.mallLayout.landing.y:lift.y-10;player.vx=player.vy=0;snapCamera();toast('GREENTOWN MALL · FLOOR '+(v.floor+1)+(v.floor===2?' · LUXURY / EXECUTIVE TALENT':v.floor?' · HOME & LIVING / 29 CUISINE':' · FASHION / TECH & GIFTS'));};
const updateBase=update;update=function(){updateBase.apply(this,arguments);const v=city?.mall;if(!v||!player)return;if(!insideVenue(v,player)&&v.floor){v.floor=0;v.furniture=v.floorFurniture[0];} };
let gps=false;
const mallButton=document.createElement('button');mallButton.id='mallDirections';mallButton.type='button';mallButton.textContent='MALL';mallButton.title='Toggle directions to Greentown Mall';mallButton.style.cssText='min-height:44px;padding:8px 12px;background:#263e39;color:#f0d99f;border:1px solid #c4ab6b;cursor:pointer';mallButton.onclick=()=>{gps=!gps;toast(gps?'GREENTOWN MALL · FOLLOW THE M MARKER':'MALL DIRECTIONS OFF');};(document.getElementById('hudMapActions')||document.body).appendChild(mallButton);
const target=missionTarget;missionTarget=function(){if(gps&&city?.mall){const v=city.mall;return {x:v.doorX,y:v.doorY+24,col:'#e9c27a',label:'M'};}return target.apply(this,arguments);};
window.level29Mall={findSite,layout,buildMall};
})();
