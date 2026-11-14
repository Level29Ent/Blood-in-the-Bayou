'use strict';
(function(){
function overlap(a,b,p=0){return a.x<b.x+b.w+p&&a.x+a.w>b.x-p&&a.y<b.y+b.h+p&&a.y+a.h>b.y-p;}
function category(v){const name=(v.name||'').toUpperCase();if(/CAFE|CUISINE|BURGER|COFFEE|BAKERY|DONUT|CAJUN|RESTAURANT|DINER|SNOWBALL/.test(name)||['cafe','restaurant'].includes(v.id))return 'food';if(/ARMORY|GUN|SURPLUS|TACTICAL/.test(name)||v.id==='armory')return 'equipment';if(/GARAGE|MOTOR|TIRE|HARDWARE|CARWASH|BIKE/.test(name)||['garage','spray','showroom'].includes(v.id))return 'workshop';if(/CLINIC|HOSPITAL|PHARMACY|COSMETIC/.test(name)||v.id==='hospital')return 'care';if(/FURNITURE|HOMEWARES/.test(name))return 'furniture';if(/TOY/.test(name))return 'toys';if(/SPORT/.test(name)||v.id==='gym')return 'sports';if(/MUSIC|RECORD/.test(name))return 'music';if(/FASHION|SHOE|LUXURY|JEWELRY/.test(name)||v.id==='barber')return 'fashion';if(/TECH|CAMERA|GAME|MUSIC|STUDIO|RECORD|TERMINAL/.test(name)||v.id==='studio')return 'tech';if(/BOOK|MAGAZINE|LIBRARY/.test(name)||v.id==='classroom')return 'books';if(/PLANT|BOTANICA|AQUARIUM|FISH|BAIT/.test(name))return 'nature';if(['grocery','gas','retail'].includes(v.id)||/MARKET|GROCER|HOMEWARE/.test(name))return 'market';return 'office';}
function plan(v,{limit=6}={}){if(v.referenceLaundry||v.referenceFish||v.referenceBotanica||v.referenceJojo||v.referenceBank||v.referenceDonut||v.referenceSmoke)return [];const b=v.b,out=[],occupied=(v.furniture||[]).concat(v.colliderWalls||[]),door={x:v.doorX,y:v.doorY},station={x:v.stationX??b.x+b.w/2,y:v.stationY??b.y+b.h/2};
 const corridor={x:b.x+b.w/2-21,y:b.y+6,w:42,h:b.h-12};
 for(const [side,fixed]of [['north',b.y+18],['south',b.y+b.h-18],['west',b.x+18],['east',b.x+b.w-18]]){
  const horizontal=['north','south'].includes(side),run=horizontal?b.w:b.h;
  for(let n=22;n<run-22&&out.length<limit;n+=38){const r=horizontal?{x:b.x+n-15,y:fixed-4,w:30,h:8}:{x:fixed-4,y:b.y+n-15,w:8,h:30};
   if(overlap(r,corridor,2)||occupied.concat(out).some(p=>overlap(r,p,8))||Math.hypot(r.x+r.w/2-door.x,r.y+r.h/2-door.y)<55||Math.hypot(r.x+r.w/2-station.x,r.y+r.h/2-station.y)<44)continue;
   out.push({...r,kind:category(v),angle:horizontal?0:Math.PI/2,height:30});
  }
 }return out;
}
function fixture(T,kind,options={}){
 const root=new T.Group();root.name='Stocked '+kind+' fixture';const buckets=new Map(),geometries=new Map(),materials=new Map();
 const mat=(key,color,metal=0)=>{if(!materials.has(key))materials.set(key,options.material?options.material(color,metal):new T.MeshStandardMaterial({color,metalness:metal,roughness:metal?.45:.82}));return materials.get(key);},wood=mat('wood','#856348'),metal=mat('metal','#839497',.45),paper=mat('paper','#eee3cb'),dark=mat('dark','#253944'),green=mat('green','#4d8153'),red=mat('red','#aa5548'),gold=mat('gold','#d0ad5d',.3),blue=mat('blue','#547c9b');
 function part(type,args,m,x,y,z,sx=1,sy=1,sz=1,rz=0){const key=type+JSON.stringify(args);if(!geometries.has(key))geometries.set(key,type==='cyl'?new T.CylinderGeometry(...args):type==='sphere'?new T.SphereGeometry(...args):type==='torus'?new T.TorusGeometry(...args):new T.BoxGeometry());const geo=geometries.get(key);if(!buckets.has(geo))buckets.set(geo,new Map());if(!buckets.get(geo).has(m))buckets.get(geo).set(m,[]);buckets.get(geo).get(m).push({x,y,z,sx,sy,sz,rz});}
 const box=(w,h,d,x,y,z,m)=>part('box',[],m,x,y,z,w,h,d),ball=(x,y,z,sx,sy,sz,m)=>part('sphere',[1,8,6],m,x,y,z,sx,sy,sz);
 box(30,2,8,0,1,0,wood);for(const side of [-1,1])box(1,28,7,side*14.5,15,0,metal);box(28,28,.8,0,15,-3.8,wood);
 for(const y of [6,16,26]){
  box(28,1,8,0,y,0,wood);
  for(let i=0;i<5;i++){const x=-11+i*5.5,c=[red,green,gold,blue,paper][i],h=y+2.4;
   if(kind==='food'){if(y===6){part('cyl',[1.5,1.2,3,8],paper,x,h,0);part('torus',[.8,.2,5,8],paper,x+1.5,h,0);}else if(y===16){ball(x,h,0,2.2,1.1,2,c);box(4,.4,3.8,x,h-.8,0,green);}else{box(4,3,4,x,h,0,metal);box(3,1,3,x,h+2,0,dark);}}
   else if(kind==='equipment'){box(4.5,1.2,2,x,h,0,dark);box(3,.5,.6,x+1,h+1,0,metal);box(2.8,3.2,3,x,h+1,0,c);}
   else if(kind==='workshop'){if(i%2){part('torus',[1.5,.45,6,10],dark,x,h,0);}else{box(3.5,2.5,3,x,h,0,c);box(2,.4,.5,x,h+1.7,0,metal);}box(.5,3,.5,x,h+1,2.6,metal);}
   else if(kind==='care'||kind==='market'){part('cyl',[.7,1,3.3,8],c,x,h,0);box(1.5,.6,1.5,x,h+1.9,0,paper);box(1.7,1,.3,x,h,.95,paper);}
   else if(kind==='fashion'){if(y===16){ball(x,h,0,2.1,1,1.4,c);box(4,.4,2.7,x,h-1,0,paper);}else{box(4,1,3.5,x,h,0,c);box(3.7,.5,3.5,x,h+1,0,paper);}}
   else if(kind==='furniture'){box(4,1.2,3.5,x,h,0,c);box(4,2.6,.7,x,h+1.6,-1.4,c);for(const side of [-1,1])box(.6,1.8,3.5,x+side*2,h+1,0,paper);}
   else if(kind==='toys'){box(3.7,1.8,2.2,x,h,0,c);for(const side of [-1,1])for(const dx of [-1,1])ball(x+dx,h-.8,side, .6,.6,.4,dark);box(2,1,2,x,h+1.4,0,paper);}
   else if(kind==='sports'){ball(x,h+.6,0,1.8,1.8,1.8,c);part('torus',[1.8,.08,5,10],dark,x,h+.6,0);}
   else if(kind==='music'){ball(x,h,0,1.5,1.6,.6,wood);box(.6,4,.5,x,h+2.5,0,wood);box(.08,5,.08,x,h+2,1,paper);}
   else if(kind==='tech'){box(4,3,2.4,x,h,0,dark);box(3,2,.25,x,h,1.3,blue);box(.4,.4,2.5,x+1.3,h-1.1,0,paper);}
   else if(kind==='books'){box(2.7,4,3.5,x,h+1,0,c);for(let k=0;k<3;k++)box(2.8,.18,3.2,x,h+k*.9,0,paper);}
   else if(kind==='nature'){part('cyl',[1.5,1,2.8,8],wood,x,h,0);box(.3,4,.3,x,h+3,0,green);ball(x,h+4,0,2,1,1.5,green);}
   else{box(4,2,3.5,x,h,0,c);box(3,.3,3.5,x,h+1.2,0,paper);}
  }
 }
 if(kind==='food'){box(10,8,5,0,35,0,metal);box(8,4,.5,0,35,2.8,dark);for(const x of [-3,0,3])ball(x,32,3.1,.4,.4,.4,red);}
 const dummy=new T.Object3D();for(const [geo,by]of buckets)for(const [material,list]of by){const mesh=new T.InstancedMesh(geo,material,list.length),bounds=new T.Box3();geo.computeBoundingBox();list.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.scale.set(p.sx,p.sy,p.sz);dummy.rotation.set(0,0,p.rz);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);bounds.union(geo.boundingBox.clone().applyMatrix4(dummy.matrix));});mesh.geometry=geo.clone();mesh.geometry.boundingSphere=bounds.getBoundingSphere(new T.Sphere());mesh.frustumCulled=true;root.add(mesh);}root.userData.itemCount=45;return root;
}
const api={overlap,category,plan,fixture};if(typeof module!=='undefined')module.exports=api;if(typeof window==='undefined')return;window.level29BusinessRichness=api;if(window.level29RichnessReview)return;
function build(){if(!city?.world)return;const templates=new Map(),stockModel=kind=>{if(!templates.has(kind))templates.set(kind,fixture(THREE,kind,{material:level29World.material}));return templates.get(kind).clone(true);};const root=new THREE.Group();root.name='Business-specific stocked fixtures';cityGroup.add(root);const sites=[];
 for(const v of city.venues){if(v.referenceFish||v.referenceBotanica||v.referenceCorner||v.referenceBank||v.referenceHardware)continue;if(v.id==='mall'){for(const shop of v.mallLayout.shops.filter(s=>!s.referenceGameStore).filter(s=>!s.referenceBarber&&!s.referenceAquarium))sites.push({v,b:shop.room,name:shop.name,id:'retail',doorX:shop.doorX,doorY:shop.doorY,stationX:shop.x,stationY:shop.y,furniture:v.floorFurniture[shop.floor],floor:shop.floor,base:(v.baseY||0)+shop.floor*56});}else if(!['safe','shelter'].includes(v.id)&&v!==city.casinoVenue)sites.push({v,b:v.b,id:v.id,name:v.name,doorX:v.doorX,doorY:v.doorY,stationX:v.stationX,stationY:v.stationY,furniture:v.furniture,colliderWalls:v.colliderWalls,base:v.baseY||0,floor:0});}
 city.stockedBusinesses=[];
 const greenmart=city.greenmart;if(greenmart&&!greenmart.referenceInterior){for(let floor=0;floor<2;floor++){const group=new THREE.Group();group.name='Greenmart '+(floor?'home and electronics':'fresh food and grocery')+' wall stock';root.add(group);for(let row=0;row<3;row++){const m=stockModel(floor?['fashion','tech','market'][row]:['nature','food','market'][row]);m.scale.set(.85,.8,.85);m.position.set(greenmart.b.x+100+row*85,floor*56,greenmart.b.y+18);group.add(m);}if(window.level29BatchStatic)level29BatchStatic(group,[]);city.stockedBusinesses.push({name:group.name,count:3,surfaces:0,root:group,b:greenmart.b,floor,v:{id:'greenmart'},base:floor*56});}}

 for(const site of sites){const originalFurniture=(site.furniture||[]).slice(),specs=plan(site,{limit:site.v.id==='mall'?3:6});const group=new THREE.Group();group.name='Stocked room · '+site.name;root.add(group);
  for(const spec of specs){const m=stockModel(spec.kind);m.position.set(spec.x+spec.w/2,site.base,spec.y+spec.h/2);m.rotation.y=spec.angle;group.add(m);site.furniture.push({...spec});}
  // Dress existing counters too: these surfaces already have collision, so no new
  // floor footprint or blocked service pad is introduced by the mounted stock.
  const surfaces=originalFurniture.filter(r=>r.w>=24&&r.h>=8&&r.h<=34&&r.x>=site.b.x+2&&r.x+r.w<=site.b.x+site.b.w-2&&r.y>=site.b.y+2&&r.y+r.h<=site.b.y+site.b.h-2&&!specs.includes(r)).slice(0,3);
  for(const r of surfaces){const n=Math.min(3,Math.floor(r.w/24));for(let i=0;i<n;i++){const m=stockModel(category(site));m.scale.set(.65,.55,.65);m.position.set(r.x+(i+.5)*r.w/n,site.base+12,r.y+r.h/2);group.add(m);}}
  let wallStock=0;if(!specs.length&&!surfaces.length){
   const m=stockModel(category(site)),span=Math.min(.65,(site.b.w-20)/32);m.scale.set(span,.5,.4);
   const b=site.b,choices=[{x:b.x+b.w/2,y:b.y+5,a:0},{x:b.x+b.w/2,y:b.y+b.h-5,a:0},{x:b.x+5,y:b.y+b.h/2,a:Math.PI/2},{x:b.x+b.w-5,y:b.y+b.h/2,a:Math.PI/2}];choices.sort((a,b)=>Math.hypot(b.x-site.doorX,b.y-site.doorY)-Math.hypot(a.x-site.doorX,a.y-site.doorY));const p=choices[0];m.position.set(p.x,site.base+18,p.y);m.rotation.y=p.a;group.add(m);wallStock=1;
  }
  const lightMaterial=level29World.material('#e9e4d3'),light=new THREE.Mesh(new THREE.BoxGeometry(Math.min(36,site.b.w*.3),.4,4),lightMaterial);light.position.set(site.b.x+site.b.w/2,site.base+43,site.b.y+site.b.h*.5);group.add(light);
  const plaque=addSign(group,site.name+' · STOCK / SERVICES',Math.min(88,site.b.w-24),4,site.b.x+site.b.w/2,site.base+37,site.b.y+3,'#eadbc1');
  if(window.level29BatchStatic)level29BatchStatic(group,[]);city.stockedBusinesses.push({name:site.name,count:specs.length,surfaces:surfaces.length,wallStock,totalDisplays:wallStock+specs.length+surfaces.reduce((n,r)=>n+Math.min(3,Math.floor(r.w/24)),0),root:group,b:site.b,floor:site.floor,v:site.v,base:site.base});
 }
}
const base=buildCity;buildCity=function(){const r=base.apply(this,arguments);build();return r;};
const renderBase=render;render=function(){for(const s of city?.stockedBusinesses||[]){s.root.visible=state!=='menu'&&!!player&&Math.hypot(s.b.x+s.b.w/2-player.x,s.b.y+s.b.h/2-player.y)<520&&(s.v.id==='greenmart'?city.greenmart.floor===s.floor:s.v.id!=='mall'||s.v.floor===s.floor);}return renderBase.apply(this,arguments);};
})();
