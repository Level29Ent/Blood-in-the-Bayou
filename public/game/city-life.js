'use strict';
(function(){
const TYPES=[
 {id:'showroom',name:'BONNIE DE VETTE MOTORS',short:'SHOWROOM',letter:'V',col:'#ebc17a'},
 {id:'nightclub',name:'THE VELVET JESTER',short:'DANCE CLUB',letter:'D',col:'#b487db'},
 {id:'casino',name:'BOOMCITY CASINO',short:'CASINO',letter:'C',col:'#e9b75c'},
 {id:'terminal',name:'LEVEL 29 AIR TERMINAL',short:'AIR TERMINAL',letter:'T',col:'#a3c6d5'},
 {id:'classroom',name:'BAYOU STATE UNIVERSITY',short:'CLASSROOM',letter:'U',col:'#beaa7e'},
 {id:'retail',name:'CROWN RETAIL',short:'RETAIL',letter:'R',col:'#afc28b'},
 {id:'cafe',name:'BAYOU CORNER CAFE',short:'CAFE',letter:'C',col:'#b9ca8e'},
 {id:'studio',name:'GOLDEN HILLS STUDIOS',short:'FILM STUDIO',letter:'H',col:'#cbb9df'}
];
VENUE_TYPES.push(...TYPES);
function prepare(c,b,id,key){
 const v=createVenue(b,id,key),t=3;v.open=true;v.autoOpened=false;
 v.colliderWalls=[{x:b.x,y:b.y,w:b.w,h:t},{x:b.x,y:b.y,w:t,h:b.h},{x:b.x+b.w-t,y:b.y,w:t,h:b.h},{x:b.x,y:b.y+b.h-t,w:(b.w-v.doorW)/2,h:t},{x:v.doorX+v.doorW/2,y:b.y+b.h-t,w:(b.w-v.doorW)/2,h:t}];v.colliderDoor={x:v.doorX-v.doorW/2,y:v.doorY-t,w:v.doorW,h:t};
 for(let y=Math.floor(b.y/TILE);y<Math.ceil((b.y+b.h)/TILE);y++)for(let x=Math.floor(b.x/TILE);x<Math.ceil((b.x+b.w)/TILE);x++)c.g[y*MW+x]=T_LOT;
 c.venues.push(v);if(!c.buildings.includes(b))c.buildings.push(b);return v;
}
function freeLot(c,w,h,predicate,grade=false){
 for(let y=4;y<MH-h-4;y+=2)for(let x=GULF_X+8;x<MW-w-4;x+=2){
  if(predicate&&!predicate(x,y))continue;const r={x:x*TILE,y:y*TILE,w:w*TILE,h:h*TILE};if(!grade&&window.level29Terrain&&!level29Terrain.lowland(c,r))continue;
  if(c.basketballReservation&&level29SiteLayout.intersects(r,c.basketballReservation))continue;
  if(c.buildings.some(b=>r.x<b.x+b.w+32&&r.x+r.w>b.x-32&&r.y<b.y+b.h+32&&r.y+r.h>b.y-32))continue;
  if(Object.values(window.level29Downtown.lots).some(l=>r.x<(l.x1+2)*TILE&&r.x+r.w>(l.x0-1)*TILE&&r.y<(l.y1+2)*TILE&&r.y+r.h>(l.y0-1)*TILE))continue;
  let ok=true;for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(![T_GRASS,T_PARK,T_LOT,T_SAND].includes(c.g[yy*MW+xx]))ok=false;
  if(ok)return r;
 }return null;
}
const gen=genCity;
genCity=function(){
 const c=gen.apply(this,arguments);if(!c.world)return c;
 // New bank lots can replace a secondary shelter footprint. Remove the superseded room,
 // rather than leaving nested collision shells and an unreachable business inside the bank.
 const replaced=c.venues.filter(v=>v.id==='safe'&&c.venues.some(o=>o.id==='bank'&&v.b.x>=o.b.x&&v.b.y>=o.b.y&&v.b.x+v.b.w<=o.b.x+o.b.w&&v.b.y+v.b.h<=o.b.y+o.b.h));
 c.venues=c.venues.filter(v=>!replaced.includes(v));c.buildings=c.buildings.filter(b=>!replaced.some(v=>v.b===b));
 const keep=c.venues.find(v=>v.id==='safe'&&c.mansion&&v.b===c.mansion.B)||c.venues.find(v=>v.id==='safe');
 let i=0;for(const v of c.venues)if(v.id==='safe'&&v!==keep){const spec=VENUE_TYPES.find(t=>t.id===(i++%2?'business':'grocery'));Object.assign(v,spec);v.b.venue=v.id;v.floor=0;v.staff=[];v.extended=v.id==='grocery';}
 c.safes=(c.safes||[]).filter(s=>keep&&s.B===keep.b);c.safe=c.safes[0]||c.safe;
 for(const [id,type]of [['dealer','showroom'],['club','nightclub'],['dispensary','retail'],['smoke','retail'],['university','classroom'],['airport','terminal'],['truck','retail']]){
  const l=window.level29Downtown.lots[id];if(id==='truck'&&l){l.fb={x0:l.x0,y0:l.y0,x1:l.x1,y1:l.y1};l.name="FELICIA'S SNOWBALL TRAILER";}if(!l?.fb)continue;
  const f=l.fb,b={x:f.x0*TILE,y:f.y0*TILE,w:(f.x1-f.x0+1)*TILE,h:(f.y1-f.y0+1)*TILE,H:48,kind:'normal',col:'#c4bca8'};
  l.venue=prepare(c,b,type,'lot-'+id);l.venue.lotId=id;if(id==='truck'){l.venue.stationX=b.x+b.w/2;l.venue.stationY=b.y+b.h-24;Object.assign(l.venue,{name:l.name,short:'FELICIA · SNOWBALLS',kind:'snowballs',letter:'F',col:'#d8a6c0'});}if(['dispensary','smoke'].includes(id))l.venue.name=l.name;if(id==='smoke'){l.venue.kind='smoke';l.venue.short='SMOKE SHOP';}
 }

 // Public coordinates match the existing casino shell; upper hotel remains scenery.
 const cb={x:105*TILE,y:77*TILE,w:7*TILE,h:6*TILE,H:64,kind:'normal',col:'#62516a'};
 c.casinoVenue=prepare(c,cb,'casino','waterfront-casino');
 c.casinoStations=[0,1,2,3].map(k=>({x:cb.x+36+k*48,y:cb.y+80}));
 const hills=freeLot(c,8,7,(x,y)=>x>85&&y>100,true);
 c.hollywood=null;if(hills){c.hollywood=prepare(c,{...hills,H:48,kind:'normal',col:'#c9bfa8'},'studio','golden-hills');c.hollywood.name='GOLDEN HILLS · HOLLYWOOD DISTRICT';}
 c.hollywoodSites=c.hollywood?[c.hollywood]:[];
 for(const [i,id]of ['cafe','business','studio'].entries()){
  const lot=freeLot(c,5,4,(x,y)=>x>85&&y>100,true);if(!lot)continue;
  const v=prepare(c,{...lot,H:48,kind:'normal',col:'#bfa886'},id,'golden-hills-'+i);
  v.name=['GOLDEN HILLS CAFE','GOLDEN HILLS TALENT AGENCY','GOLDEN HILLS SCREEN TESTS'][i];c.hollywoodSites.push(v);
 }
 c.farm=freeLot(c,8,7,(x,y)=>x>65&&y>75)||freeLot(c,7,6,(x,y)=>x>50&&y>55);
 if(c.farm){const r=c.farm;for(let y=r.y/TILE;y<(r.y+r.h)/TILE;y++)for(let x=r.x/TILE;x<(r.x+r.w)/TILE;x++)c.g[y*MW+x]=T_GRASS;}
 // Clear trees on the new lots, and connect entrances without crossing water or another footprint.
 const zones=c.venues.filter(v=>TYPES.some(t=>t.id===v.id)).map(v=>v.b).concat(c.farm?[c.farm]:[]);
 c.trees=c.trees.filter(t=>!zones.some(b=>t.x>b.x-24&&t.x<b.x+b.w+24&&t.y>b.y-24&&t.y<b.y+b.h+24));indexTrees(c);
 // New sites attach to existing street network through the same tested route planner.
 for(const v of c.venues)if(!v.streetAccessible){const route=routeToStreet(c,v);v.streetAccessible=route.length>0;for(const k of route)if(c.g[k]!==T_ROAD&&c.g[k]!==T_BRIDGE)c.g[k]=T_WALK;}
 return c;
};
function routeToStreet(c,v){
 const start=Math.floor((v.doorY+16)/TILE)*MW+Math.floor(v.doorX/TILE),q=[start],prev=new Map([[start,-1]]);let end=-1;
 for(let i=0;i<q.length;i++){const k=q[i],x=k%MW,y=Math.floor(k/MW);if([T_ROAD,T_BRIDGE].includes(c.g[k])){end=k;break;}
 for(const [xx,yy]of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){const n=yy*MW+xx;if(xx<1||yy<1||xx>=MW-1||yy>=MH-1||prev.has(n)||c.g[n]===T_WATER||(c.farm&&level29SiteLayout.contains(c.farm,(xx+.5)*TILE,(yy+.5)*TILE,TILE))||c.buildings.some(b=>xx*TILE<b.x+b.w&&(xx+1)*TILE>b.x&&yy*TILE<b.y+b.h&&(yy+1)*TILE>b.y))continue;prev.set(n,k);q.push(n);}}
 const out=[];if(end<0)return out;for(let k=end;k!==-1;k=prev.get(k))out.push(k);return out;
}
let dancers=[],animals=[],crew=[],root=null;
function cFarmEntrance(r){city.farmEntrance={x:r.x+r.w/2,y:r.y+r.h+24};}
const oldBuild=buildVenue;
buildVenue=function(v){
 if(!TYPES.some(t=>t.id===v.id))return oldBuild(v);
 if(v.mesh&&v.mesh.parent===cityGroup)return;
 const b=v.b,g=new THREE.Group();v.mesh=g;cityGroup.add(g);const mat=c=>window.level29World.material(c),wood=mat('#785b43'),dark=mat('#253039'),gold=mat('#d8b46d');
 const part=(w,h,d,x,y,z,m)=>addPart(g,w,h,d,x,y,z,m);
 part(b.w,1,b.h,b.x+b.w/2,.5,b.y+b.h/2,mat(v.id==='casino'?'#69334d':'#bdb5a1'));
 for(const r of v.colliderWalls)part(r.w,48,r.h,r.x+r.w/2,24,r.y+r.h/2,mat('#b9b5ad'));
 part(v.doorW,7,3,v.doorX,45,v.doorY,gold);v.door=part(1,1,1,v.doorX,0,v.doorY,dark);v.door.visible=false;
 v.roof=part(b.w,2,b.h,b.x+b.w/2,50,b.y+b.h/2,dark);v.labelH=70;
 addSign(g,v.name,Math.min(220,b.w),11,v.doorX,61,v.doorY,v.col);
 if(v.id==='casino'){
  for(let i=0;i<6;i++){const x=b.x+20+i*32;part(19,30,12,x,15,b.y+18,dark);part(14,13,1,x,23,b.y+25,mat('#c68c37'));addSign(g,'29 · 7 · 29',15,7,x,24,b.y+26,'#f3d186');v.furniture.push({x:x-10,y:b.y+12,w:20,h:13});}
  for(let i=1;i<4;i++){const x=b.x+36+i*48;part(32,9,22,x,4.5,b.y+58,mat('#31644f'));v.furniture.push({x:x-16,y:b.y+47,w:32,h:22});addSign(g,['','BLACKJACK','POKER','ROULETTE'][i],30,5,x,13,b.y+70,'#eac879');}
 }else if(v.id==='nightclub'){
  part(b.w-30,2,28,b.x+b.w/2,1,b.y+16,dark);part(25,12,8,b.x+b.w/2,8,b.y+18,gold);
  for(let i=0;i<9;i++){const x=b.x+20+(i%3)*Math.max(12,(b.w-40)/3),y=b.y+28+Math.floor(i/3)*Math.max(6,(b.h-38)/3),m=makeFigure(false);setFigureColors(m,['#986d50','#c3946a','#6e4939'][i%3],['#87539b','#d5b568','#4c8491'][i%3],'#28313b','#272322');m.traverse(o=>{if(o.isMesh)o.userData.noBatch=true;});g.add(m);dancers.push({m,x,y});}
 }else if(v.id==='terminal'){
  part(b.w-24,12,12,b.x+b.w/2,6,b.y+14,dark);addSign(g,'CHECK IN · AIR TOURS',90,9,b.x+b.w/2,30,b.y+4,v.col);
  for(let i=0;i<3;i++)part(28,7,10,b.x+24+i*32,3.5,b.y+45,gold);
 }else if(v.id==='classroom'){
  part(b.w-30,22,1,b.x+b.w/2,27,b.y+4,mat('#31564b'));addSign(g,'BAYOU HISTORY & CULTURE',100,7,b.x+b.w/2,28,b.y+5,v.col);
  for(let i=0;i<6;i++){const x=b.x+24+(i%3)*32,y=b.y+36+Math.floor(i/3)*30;part(22,8,14,x,4,y,wood);part(12,6,10,x,3,y+15,dark);}
 }else if(v.id==='retail'){
  for(const x of [b.x+10,b.x+b.w-10])for(let y=8;y<30;y+=10){part(14,2,b.h-30,x,y,b.y+b.h/2,wood);for(let j=0;j<4;j++)part(3,5,3,x,y+3,b.y+20+j*9,mat(j%2?'#9f9d69':'#6b997e'));}
  part(32,10,12,b.x+b.w/2,5,b.y+16,wood);addSign(g,'ACCESSORIES · LOCAL GOODS',90,7,b.x+b.w/2,32,b.y+4,v.col);
 }else if(v.id==='showroom'){part(40,12,12,b.x+35,6,b.y+12,wood);part(12,8,1,b.x+35,16,b.y+12,dark);addSign(g,'BONNIE · VEHICLE SALES',80,8,b.x+64,34,b.y+4,v.col);}
 else if(v.id==='studio'){for(let i=0;i<3;i++){part(16,20,8,b.x+20+i*30,10,b.y+20,dark);part(3,28,3,b.x+20+i*30,14,b.y+35,gold);}addSign(g,'SOUNDSTAGE · GOLDEN HILLS',130,10,b.x+b.w/2,34,b.y+4,v.col);}
 else {for(const side of [-1,1]){part(25,10,20,b.x+b.w/2+side*30,5,b.y+24,wood);part(12,7,10,b.x+b.w/2+side*30,3.5,b.y+43,dark);}addSign(g,'COFFEE · FRESH FOOD',100,9,b.x+b.w/2,32,b.y+4,v.col);}
};
const build=buildCity;
buildCity=function(){farmGPS=false;farmButton.textContent='MAP';dancers=[];animals=[];crew=[];build.apply(this,arguments);if(!city.world)return;root=new THREE.Group();cityGroup.add(root);
 const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.8});
 const part=(w,h,d,x,y,z,c)=>addPart(root,w,h,d,x,y,z,mat(c));
 if(city.hollywood){const b=city.hollywood.b;addSign(root,'GOLDEN HILLS · HOLLYWOOD',240,24,b.x+b.w/2,100,b.y,'#f3dfb5');for(let i=0;i<8;i++){part(18,.3,18,b.x+i*28,1,b.y+b.h+22,i%2?'#b39b70':'#74637c');part(14,30,2,b.x+i*30,15,b.y+2,'#a38b6b');}addSign(root,'FILM ROW · CAFES · STUDIO TOURS',220,10,b.x+b.w/2,35,b.y+b.h+2,'#e5d2a4');}
 if(city.farm){const r=city.farm,base=city.heightAt?city.heightAt(r.x+r.w/2,r.y+r.h/2):0;
  // A visible lowland landmark and open entrance, not just a small remote sign.
  const farmGroup=new THREE.Group();farmGroup.name='Bayou Farm landmark';farmGroup.position.y=base;root.add(farmGroup);
  const barnMat=new THREE.MeshStandardMaterial({color:'#993f32',roughness:1}),roofMat=new THREE.MeshStandardMaterial({color:'#313b3b',roughness:.9});
  city.farmBarn={x:r.x+r.w-77.5,y:r.y+15.5,w:65,h:45};addPart(farmGroup,65,35,45,r.x+r.w-45,17.5,r.y+38,barnMat);const roof=addPart(farmGroup,76,4,58,r.x+r.w-45,37,r.y+38,roofMat);roof.rotation.z=.08;
  addPart(farmGroup,24,25,1,r.x+r.w-45,12.5,r.y+61,new THREE.MeshStandardMaterial({color:'#efe3be',roughness:1}));
  addSign(farmGroup,'BAYOU FARM · ANIMALS & PRODUCE',190,17,r.x+r.w/2,45,r.y+r.h,'#edcf7c');
  addSign(farmGroup,'ENTER HERE · USE TO FEED ANIMALS',160,10,r.x+r.w/2,24,r.y+r.h+1,'#d5e5b0');
  cFarmEntrance(r);
  addSign(root,'LEVEL 29 BAYOU FARM',150,14,r.x+r.w/2,base+48,r.y,'#d3c38c');
  for(let x=r.x;x<=r.x+r.w;x+=24)for(const y of [r.y,r.y+r.h]){if(y===r.y+r.h&&Math.abs(x-(r.x+r.w/2))<40)continue;part(2,16,2,x,8,y,'#96774e');part(23,2,2,x,11,y,'#ad9268');}
  for(let i=0;i<12;i++){const kind=i<4?'cow':i<8?'pig':'chicken',g=level29FarmModels.create(kind,i);root.add(g);animals.push({g,kind,x:r.x+35+(i%4)*40,y:r.y+82+Math.floor(i/4)*43,seed:i});}
 }
 for(let i=0;i<4;i++){const c=makeCar((122+i*3)*TILE,(58+i*9)*TILE,Math.PI/2,i%2?'skiff':'cabinboat');c.ambientBoat=true;cars.push(c);const m=makeFigure(false);setFigureColors(m,'#b48a66','#c2a36e','#35485d','#352d29');scene.add(m);if(i%2){const rod=addPart(m.userData.armR,.25,22,.25,0,-7,0,new THREE.MeshStandardMaterial({color:'#6e604b'}));rod.rotation.z=.55;}crew.push({m,c,kind:i%2?'fish':'helm'});}
};
CAR_SPECS.skiff={...CAR_SPECS.boat,name:'BAYOU SKIFF',len:58,wid:22,hp:180,cols:['#698b72','#b1b9ad'],boat:true};
CAR_SPECS.cabinboat={...CAR_SPECS.yacht,name:'GULF CABIN CRUISER',len:92,wid:34,hp:350,cols:['#d7e0d7','#547b8a'],boat:true};
const block=blockedCircle;blockedCircle=function(x,y,r){if(city?.farmBarn&&hitRect(x,y,r,city.farmBarn))return true;return block.apply(this,arguments);};
const figure=makeFigure;
makeFigure=function(zombie){const m=figure(zombie);if(zombie)return m;
 const body=m.userData.body,cloth=new THREE.MeshStandardMaterial({color:'#dcc6a3',roughness:.7});
 for(const z of [-2.1,2.1])addPart(body,.4,3.5,.4,2.4,12,z,cloth);
 addPart(body,.5,1.4,1.6,2.6,13,-1.5,new THREE.MeshStandardMaterial({color:'#b6c3c9',metalness:.5,roughness:.4}));return m;};
let checkpoint=null,farmGPS=false;
const mapActions=document.createElement('div');mapActions.id='hudMapActions';mapActions.setAttribute('role','group');mapActions.setAttribute('aria-label','Map and rewards');
const mapStyle=document.createElement('style');mapStyle.textContent=`
 #hudMapActions{position:fixed;right:max(18px,env(safe-area-inset-right));top:calc(var(--hud-status-bottom, 200px) + 12px);z-index:25;display:none;flex-direction:column;align-items:flex-end;gap:8px;pointer-events:none}
 #hudMapActions>button{pointer-events:auto;margin:0;box-sizing:border-box}
 #findFarm{min-width:64px;min-height:44px;padding:8px 12px;background:#17271fe8;color:#e2d5a6;border:1px solid #958455;font:700 11px monospace;cursor:pointer}
 #hudMapActions #dailyBadge,#hudMapActions #jobBoardButton,#hudMapActions #jobWorkButton{position:static;inset:auto;transform:none}
 #hudMapActions{flex-wrap:wrap;max-width:calc(100vw - 36px)}
 @media(max-height:499px){#hudMapActions{flex-direction:row;align-items:center}}
`;document.head.appendChild(mapStyle);document.body.appendChild(mapActions);
const farmButton=document.createElement('button');farmButton.id='findFarm';farmButton.type='button';farmButton.textContent='MAP';mapActions.appendChild(farmButton);
// One spaced action stack also prevents the daily-reward button covering MAP on phones.
const dailyBadge=document.getElementById('dailyBadge');if(dailyBadge)mapActions.appendChild(dailyBadge);
// Desktop job actions previously kept independent fixed offsets and could cover MAP.
// Touch job controls already belong to the bottom control grid; do not move those.
for(const id of ['jobBoardButton','jobWorkButton']){const action=document.getElementById(id);if(action?.parentElement===document.body)mapActions.appendChild(action);}
function mapActionLabel(){const action=farmGPS?(showMap?'Return to game; keep farm directions':'Cancel farm directions'):'Open map with farm directions';farmButton.title=action;farmButton.setAttribute('aria-label','MAP · '+action);farmButton.setAttribute('aria-expanded',String(!!showMap));}
farmButton.onclick=()=>{if(farmGPS&&showMap){showMap=false;mapActionLabel();return;}if(!city?.farmEntrance)return toast('FARM UNAVAILABLE IN THIS AREA');farmGPS=!farmGPS;showMap=farmGPS;mapActionLabel();if(farmGPS)toast('FARM GPS · FOLLOW THE GREEN BEAM / F ON THE MAP');};
const renderBase=render;
render=function(){renderBase.apply(this,arguments);mapActions.style.display=state==='play'?'flex':'none';farmButton.hidden=!city?.farm;mapActionLabel();if(!scene||!city?.world)return;
 if(farmGPS&&city.farmEntrance&&dist(player.x,player.y,city.farmEntrance.x,city.farmEntrance.y)<50){farmGPS=false;farmButton.textContent='MAP';toast('BAYOU FARM · WALK THROUGH THE ENTRANCE · USE TO FEED');}
 if(!checkpoint||checkpoint.parent!==scene){checkpoint=new THREE.Mesh(new THREE.CylinderGeometry(20,20,110,20,1,true),new THREE.MeshBasicMaterial({color:'#f1c361',transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false}));scene.add(checkpoint);}
 const t=farmGPS&&city.farmEntrance?{...city.farmEntrance,col:'#a4d876',label:'FARM'}:missionTarget();checkpoint.visible=!!t&&state==='play';if(t){checkpoint.position.set(t.x,terrainHeight(t.x,t.y)+55,t.y);checkpoint.material.color.set(t.col||'#f1c361');}
};
const tick=update;
update=function(){tick.apply(this,arguments);if(state!=='play'||!city||!player)return;
 for(const d of dancers){poseFigure(d.m,d.x+Math.sin(frame*.05+d.x)*2,d.y,Math.sin(frame*.025+d.y),frame*.12,'wave');d.m.userData.armL.rotation.x=Math.sin(frame*.07)*1.3;}
 for(const a of animals){a.g.position.set(a.x+Math.sin(frame*.008+a.seed)*9,terrainHeight(a.x,a.y),a.y+Math.cos(frame*.006+a.seed)*8);a.g.rotation.y=Math.sin(frame*.003+a.seed)*.5;}
 for(const n of crew){const c=n.c;poseFigure(n.m,c.x-8,c.y,c.a,frame*.02,'stand');n.m.position.y=12+Math.sin(frame/60*1.4+c.x*.015)*.65;n.m.visible=!c.dead&&!c.gone;if(n.kind==='fish')n.m.userData.armR.rotation.x=-1.2;}
};
let farmCooldown=0;
const service=serviceVenue;
serviceVenue=function(){if(city?.farm&&!player.car){const r=city.farm;if(player.x>r.x&&player.x<r.x+r.w&&player.y>r.y&&player.y<r.y+r.h){if(frame<farmCooldown)return toast('ANIMALS ARE FED · RETURN LATER');if(cash<20)return toast('FEED COSTS $20');cash-=20;farmCooldown=frame+3600;player.hp=Math.min(player.maxHp,player.hp+15);toast('FARM ANIMALS FED · FRESH PRODUCE +15 HEALTH');return;}}const v=nearStation();if(v&&['showroom','nightclub','casino'].includes(v.id)){const s=level29Downtown.spots().filter(s=>dist(player.x,player.y,s.x,s.y)<42).sort((a,b)=>dist(player.x,player.y,a.x,a.y)-dist(player.x,player.y,b.x,b.y))[0];if(s)return s.act();return toast('APPROACH BONNIE, THE DANCE FLOOR OR A CASINO TABLE');}if(v?.id==='studio'){if(cash<100)return toast('STUDIO TOUR COSTS $100');cash-=100;toast('GOLDEN HILLS · SOUNDSTAGE TOUR COMPLETE');return;}if(v?.id==='cafe'){if(cash<25)return toast('MEAL COSTS $25');cash-=25;player.hp=Math.min(player.maxHp,player.hp+20);toast('LOCAL CAFE · +20 HEALTH');return;}return service.apply(this,arguments);};
// Successive mission briefings visit successive districts instead of always forcing the mansion.
const start=placeMissionStart;
placeMissionStart=function(){start.apply(this,arguments);if(!city?.world||!mission||missionIdx===0||mpRole==='client')return;
 const points=[];const prior=moverCtx;moverCtx=player;
 try{for(let y=2;y<MH-2;y++)for(let x=GULF_X+2;x<MW-2;x++){const px=(x+.5)*TILE,py=(y+.5)*TILE;if([T_WALK,T_PLAZA,T_ROAD].includes(city.g[y*MW+x])&&!blockedCircle(px,py,player.r)&&!city.venues.some(v=>insideVenue(v,{x:px,y:py})))points.push({x:px,y:py});}}finally{moverCtx=prior;}
 if(!points.length)return;const p=points[(missionIdx*37)%points.length];mission.start=p;ronnie.x=p.x;ronnie.y=p.y;objective='Meet Ronniebaby at dispatch checkpoint '+(missionIdx+1)+'. Follow the gold beam and map marker.';
};
const blips=extraBlips;
extraBlips=function(){const out=blips();for(const c of cars)if(c.dealerOwned&&!c.dead&&!c.gone)out.push({x:c.x,y:c.y,col:'#e6bf78',label:'V'});if(city?.farm)out.push({x:city.farm.x+city.farm.w/2,y:city.farm.y+city.farm.h/2,col:'#a4c379',label:'FARM'});return out;};
const fullMap=drawFullMap;
drawFullMap=function(){fullMap.apply(this,arguments);if(!city?.farm)return;const r=city.farm,S=Math.min(SW,SH)-80,X=(SW-S)/2,Y=(SH-S)/2;cx.save();cx.font='bold 13px monospace';cx.textAlign='center';cx.fillStyle='#111d16';const x=X+(r.x+r.w/2)/WORLD*S,y=Y+(r.y+r.h/2)/WORLD*S;cx.fillRect(x-42,y-10,84,20);cx.fillStyle='#b8e58b';cx.fillText('BAYOU FARM',x,y+4);cx.restore();};
window.level29CityLife={get farmGPS(){return farmGPS;},get inClub(){return !!player&&city?.venues?.some(v=>v.id==='nightclub'&&insideVenue(v,player));},get animals(){return animals;},get crew(){return crew;}};
})();
