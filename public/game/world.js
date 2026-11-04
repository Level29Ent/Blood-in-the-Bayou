'use strict';
// Level 29 world realism. Load after expansion.js and cars.js.
// Procedural game props only; currency is deliberately marked as fictional.
(function(){
const extraStreets=[
 [['CLAIBORNE AVE','POYDRAS ST'],['BAYOU RD','LOYOLA AVE']],
 [['FIGUEROA ST','CRENSHAW BLVD'],['OLYMPIC BLVD','PICO BLVD']],
 [['TRAVIS ST','SAN JACINTO ST'],['DALLAS ST','POLK ST']],
 [['SERVICE RD','TRAINING RD'],['LOGISTICS RD','BATTALION WAY']],
 [['DEPOT RD','RECRUIT WAY'],['CONFIDENCE COURSE','SOUTH GATE RD']]
];
DISTRICTS.slice(0,5).forEach((d,i)=>{d.v.push(...extraStreets[i][0]);d.h.push(...extraStreets[i][1]);});
const oldGen=genCity;
genCity=function(di){
  const isW=di==='world';
  MW=MH=isW?WORLD_SIZE:di<5?108:80;WORLD=MW*TILE;ROADS.splice(0,ROADS.length,...(isW?WORLD_ROADS:di<5?[3,17,31,45,59,73,87,101]:[3,17,31,45,59,73]));
  const c=oldGen(di);c.width=MW;c.height=MH;
  if(isW){indexTrees(c);return c;}
  if(di<5){
    const types=di===0?['cemetery','market','basketball']:di===1?['skatepark','market','basketball']:di===2?['basketball','market','skatepark']:['training','market','basketball'];
    types.push('landmark');
    [[5,4],[6,5],[5,1],[3,5]].forEach(([bx,by],i)=>{const x=(ROADS[bx]+4)*TILE,y=(ROADS[by]+4)*TILE;const f=c.features.find(f=>Math.abs(f.x-x)<4&&Math.abs(f.y-y)<4);if(f){f.kind=types[i];if(f.kind==='landmark'){c.rocks=c.rocks||[];c.rocks.push({x:f.x+f.w/2,y:f.y+f.h/2,r:di===2?24:di===3?105:di===4?32:54,a:0});}c.trees=c.trees.filter(t=>!(t.x>x&&t.x<x+288&&t.y>y&&t.y<y+288));}});
    if(di===0)c.features.push({kind:'riverfront',x:23*TILE,y:(MH-18)*TILE,w:31*TILE,h:2*TILE});
    indexTrees(c);
  }
  return c;
};
// Cached high-resolution brick / stucco / glass materials with matching window emission.
const facades=new Map(),textures=new Map(),materials=new Map();
<<<<<<< HEAD
function material(color,metal=0,rough=.85){const key=color+metal+rough;if(!materials.has(key))materials.set(key,level29SurfaceDetail.apply(new THREE.MeshStandardMaterial({color,metalness:metal,roughness:rough}),level29SurfaceDetail.kind(color,metal)));return materials.get(key);}
=======
function material(color,metal=0,rough=.85){const key=color+metal+rough;if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,metalness:metal,roughness:rough}));return materials.get(key);}
>>>>>>> main
function facade(col,type){
 const key=col+':'+type;if(facades.has(key))return facades.get(key);
 const map=canvasTex(512,384,(g,w,h)=>{
  g.fillStyle=type==='glass'?'#324958':col;g.fillRect(0,0,w,h);
  const rng=mkRng(type==='brick'?871:341);
  if(type==='brick'){
   for(let row=0;row<24;row++)for(let x=-32;x<w;x+=64){const off=row%2?32:0;g.fillStyle='rgba(30,20,15,'+(.07+rng()*.09)+')';g.fillRect(x+off,row*16,62,14);g.fillStyle='rgba(245,234,210,.17)';g.fillRect(x+off,row*16,62,1);}
  }else if(type!=='glass')for(let i=0;i<5500;i++){g.fillStyle=rng()>.5?'rgba(45,40,30,.05)':'rgba(255,255,245,.12)';g.fillRect(rng()*w,rng()*h,1+rng()*3,1+rng()*3);}
  // Two window bays per texture repeat; frame, inset shade, reflection, sash and projecting sill.
  for(const x of [58,304]){
   const ww=type==='glass'?191:150,yy=type==='glass'?12:74,hh=type==='glass'?338:214;
   g.fillStyle='rgba(12,18,21,.28)';g.fillRect(x-13,yy-9,ww+32,hh+35);
   g.fillStyle=type==='glass'?'#111e26':'#ddccb0';g.fillRect(x-7,yy-7,ww+14,hh+14);
   const grad=g.createLinearGradient(x,yy,x+ww,yy+hh);grad.addColorStop(0,'#78929e');grad.addColorStop(.3,'#405d6a');grad.addColorStop(.53,'#1b313e');grad.addColorStop(1,'#38525f');g.fillStyle=grad;g.fillRect(x,yy,ww,hh);
   g.fillStyle='rgba(207,226,232,.14)';g.beginPath();g.moveTo(x,yy);g.lineTo(x+ww*.45,yy);g.lineTo(x+ww,yy+hh*.8);g.lineTo(x+ww,yy+hh);g.fill();
   g.fillStyle=type==='glass'?'#182c36':'#d1c4af';g.fillRect(x+ww/2-3,yy,6,hh);g.fillRect(x,yy+hh*.48,ww,5);
   if(type!=='glass'){g.fillStyle='#e8dac5';g.fillRect(x-15,yy+hh+6,ww+30,9);g.fillStyle='rgba(12,18,20,.23)';g.fillRect(x-10,yy+hh+15,ww+20,6);}
  }
  if(type!=='glass'){g.fillStyle='rgba(246,229,202,.27)';g.fillRect(0,h-27,w,7);g.fillStyle='rgba(40,34,27,.2)';g.fillRect(0,h-20,w,4);}
 },true);
 const emission=canvasTex(512,384,(g)=>{g.fillStyle='#000';g.fillRect(0,0,512,384);for(const x of [58,304]){g.fillStyle=x===58?'#ffe0a5':'#514738';g.fillRect(x,type==='glass'?12:74,type==='glass'?191:150,type==='glass'?338:214);}},true);
<<<<<<< HEAD
 const m=new THREE.MeshStandardMaterial({color:'#fff',map,emissiveMap:emission,emissive:'#000',roughness:type==='glass'?.3:.94,metalness:type==='glass'?.4:0});if(type!=='glass')level29SurfaceDetail.apply(m,type==='brick'?'brick':'plaster',false);facades.set(key,m);facadeMats.set('l29:'+key,m);return m;
=======
 const m=new THREE.MeshStandardMaterial({color:'#fff',map,emissiveMap:emission,emissive:'#000',roughness:type==='glass'?.3:.94,metalness:type==='glass'?.4:0});facades.set(key,m);facadeMats.set('l29:'+key,m);return m;
>>>>>>> main
}
function roofMaterial(){
 if(!textures.has('roof'))textures.set('roof',canvasTex(256,256,g=>{g.fillStyle='#4a4b47';g.fillRect(0,0,256,256);const r=mkRng(82);for(let i=0;i<10000;i++){g.fillStyle=r()>.5?'#53544f':'#40423e';g.fillRect(r()*256,r()*256,1,1);}g.strokeStyle='#414841';g.lineWidth=2;g.strokeRect(4,4,248,248);},true));
 if(!materials.has('roof'))materials.set('roof',new THREE.MeshStandardMaterial({map:textures.get('roof'),roughness:1}));return materials.get('roof');
}
const oldBuilding=buildingBox;
buildingBox=function(b,h){const m=oldBuilding(b,h);const type=b.kind==='tower'||b.kind==='helipad'?'glass':D.id==='nola'&&Math.floor(b.seed)%3===0?'brick':'stucco';const fm=facade(b.kind==='cathedral'?'#e4dfd0':b.col,type),rm=roofMaterial();m.material=[fm,fm,rm,rm,fm,fm];return m;};
// Batched cuboids keep facade/roof/street detail inexpensive, one draw per material.
function batch(group){const buckets=new Map();const tmp=new THREE.Object3D();return {
 box(w,h,d,x,y,z,mat,rot=0){if(!buckets.has(mat))buckets.set(mat,[]);buckets.get(mat).push([w,h,d,x,y,z,rot]);},
 finish(){for(const [mat,items]of buckets){const m=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,items.length);items.forEach((q,i)=>{tmp.position.set(q[3],q[4],q[5]);tmp.scale.set(q[0],q[1],q[2]);tmp.rotation.set(0,q[6],0);tmp.updateMatrix();m.setMatrixAt(i,tmp.matrix);});group.add(m);}}
 };}
function plane(group,w,h,x,y,z,tex,rot=0){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.y=rot;group.add(m);return m;}
function architecturalDetails(group){
 const q=batch(group),stone=material('#b9b29f'),iron=material('#263231',.55,.55),concrete=material('#7c817c'),metal=material('#8c9694',.45,.55),black=material('#253332');
 for(const b of city.buildings){if(b.venue||['dome','watertower','iwo'].includes(b.kind))continue;
  const h=Math.max(30,b.H*BH),x=b.x,z=b.y,w=b.w,d=b.h;
  q.box(w+3,5,d+3,x+w/2,2.5,z+d/2,stone);
  for(const yy of [h-2,h+3])q.box(w+6,3,d+6,x+w/2,yy,z+d/2,stone);
  for(const zz of [z+1,z+d-1])q.box(w,7,2,x+w/2,h+5,zz,concrete);
  for(const xx of [x+1,x+w-1])q.box(2,7,d,xx,h+5,z+d/2,concrete);
  if(b.kind!=='cathedral'){
   q.box(15,9,21,x+w*.64,h+6,z+d*.52,metal);q.box(16,1,23,x+w*.64,h+11,z+d*.52,black);
   for(let k=0;k<5;k++)q.box(1,6,19,x+w*.64-6+k*3,h+6,z+d*.52,black);
   q.box(6,13,6,x+w*.25,h+7,z+d*.28,concrete);
   // Recessed storefront / office entry, canopy and plinth.
   q.box(18,28,1.5,x+w*.5,14,z+d+.5,black);q.box(.6,11,1,x+w*.5+5,13,z+d+1.7,metal);
   q.box(42,2,13,x+w*.5,32,z+d+4,iron);
  }
  if(D.id==='nola'&&b.kind==='normal'){
   const yy=Math.min(h*.52,43),floor=material('#8f7c68');
   q.box(w-12,2,12,x+w/2,yy,z+d+5,floor);
   q.box(w-12,1,1,x+w/2,yy+12,z+d+11,iron);
   q.box(w-12,.6,1,x+w/2,yy+6,z+d+11,iron);
   for(let xx=x+8;xx<x+w-4;xx+=6)q.box(.65,12,.65,xx,yy+6,z+d+11,iron);
   for(const xx of [x+9,x+w-9])q.box(1.2,yy,1.2,xx,yy/2,z+d+10,iron);
  }
  if(b.kind==='cathedral'){
   // Pale stone pilasters, lancet-style windows and a real central clock.
   for(const xx of [x+10,x+w*.2,x+w*.5,x+w*.8,x+w-10])q.box(4,h,3,xx,h/2,z+d+1,stone);
   const clock=canvasTex(256,256,g=>{g.fillStyle='#f7f0d9';g.beginPath();g.arc(128,128,123,0,7);g.fill();g.strokeStyle='#292e31';g.lineWidth=8;g.stroke();g.translate(128,128);for(let i=0;i<12;i++){g.save();g.rotate(i*Math.PI/6);g.fillStyle='#292e31';g.fillRect(-3,-110,6,15);g.restore();}g.lineWidth=7;g.beginPath();g.moveTo(0,-75);g.lineTo(0,0);g.lineTo(54,26);g.stroke();});
   plane(group,15,15,x+w/2,126,z+d-2,clock);
   for(const xx of [x+w*.2,x+w*.5,x+w*.8])q.box(12,22,1,xx,11,z+d+2,material('#4c3830'));
  }
  if(b.kind==='watertower')continue;
 }
 q.finish();
}
// Money: layered rag-paper edges, engraved border, four 100 denominations and a central L29 seal.
let billMat=null,paperMat=null;
function billTexture(){return canvasTex(1024,448,(g,W,H)=>{
 const r=mkRng(2929);g.fillStyle='#a9c08f';g.fillRect(0,0,W,H);for(let i=0;i<18000;i++){g.fillStyle=r()>.5?'rgba(28,62,34,.1)':'rgba(240,255,215,.1)';g.fillRect(r()*W,r()*H,1+r()*2,1);}
 g.strokeStyle='#455f43';for(let i=0;i<5;i++){g.lineWidth=i===0?3:1;g.strokeRect(13+i*5,13+i*5,W-26-i*10,H-26-i*10);}
 // Engraved guilloche curves are original art, not copied legal tender.
 g.strokeStyle='rgba(46,75,44,.35)';g.lineWidth=.8;for(let n=0;n<36;n++){g.beginPath();for(let x=32;x<W-32;x+=3){const y=H*.5+Math.sin(x*.045+n*.33)*(120-n*1.8);x===32?g.moveTo(x,y):g.lineTo(x,y);}g.stroke();}
 g.fillStyle='#244a2c';g.textAlign='center';g.textBaseline='middle';g.font='bold 74px Georgia';for(const [x,y]of [[95,64],[929,64],[95,382],[929,382]])g.fillText('100',x,y);
 g.font='bold 23px Georgia';g.fillText('LEVEL 29 • HUNDRED DOLLARS',512,56);g.font='17px Georgia';g.fillText('BLOOD IN THE BAYOU • GAME CURRENCY • NOT LEGAL TENDER',512,408);
 g.fillStyle='#b9cf9a';g.beginPath();g.ellipse(512,226,128,145,0,0,7);g.fill();g.strokeStyle='#3d5b3f';g.lineWidth=5;g.stroke();g.lineWidth=1;for(let k=0;k<5;k++){g.beginPath();g.ellipse(512,226,116-k*3,132-k*3,0,0,7);g.stroke();}
 g.fillStyle='#25432f';g.beginPath();g.moveTo(512,109);g.lineTo(593,151);g.lineTo(580,258);g.lineTo(512,325);g.lineTo(444,258);g.lineTo(431,151);g.closePath();g.fill();g.strokeStyle='#aabf8f';g.lineWidth=3;g.stroke();g.fillStyle='#e5e7cb';g.font='bold 27px Georgia';g.fillText('LEVEL',512,176);g.font='bold 90px Georgia';g.fillText('29',512,237);
 g.fillStyle='#47684b';g.font='18px monospace';g.fillText('L29 000029 RB',244,324);g.fillText('L29 000029 RB',781,120);g.font='bold 33px Georgia';g.fillText('100',812,288);
});}
function strapTextures(){
 const logo=(g,cx,cy,sz,dark)=>{g.fillStyle=dark;g.beginPath();for(let k=0;k<6;k++){const a=-Math.PI/2+k*Math.PI/3;g.lineTo(cx+Math.cos(a)*sz,cy+Math.sin(a)*sz);}g.closePath();g.fill();g.strokeStyle='#efe3ae';g.lineWidth=sz*.07;g.stroke();g.fillStyle='#efe3ae';g.textAlign='center';g.textBaseline='middle';g.font='bold '+sz*.34+'px Georgia';g.fillText('LEVEL',cx,cy-sz*.33);g.font='bold '+sz*.72+'px Georgia';g.fillText('29',cx,cy+sz*.18);};
 const top=canvasTex(256,256,(g,w,h)=>{g.fillStyle='#d6bd70';g.fillRect(0,0,w,h);for(let i=0;i<1400;i++){g.fillStyle='rgba(95,72,25,.07)';g.fillRect(Math.random()*w,Math.random()*h,2,1);}g.fillStyle='rgba(80,60,20,.55)';g.fillRect(0,0,w,7);g.fillRect(0,h-7,w,7);logo(g,w/2,h/2,92,'#1c4630');});
 const side=canvasTex(256,64,(g,w,h)=>{g.fillStyle='#d3b966';g.fillRect(0,0,w,h);g.fillStyle='#1c4630';g.font='bold 31px Georgia';g.textAlign='center';g.textBaseline='middle';g.fillText('$10,000 · LEVEL 29',w/2,h/2);});
 return {top,side};
}
function bundle(){
 const g=new THREE.Group();
 // One stack of hundreds: a single banded block of notes (2 draw calls per stack).
 const pile=new THREE.Mesh(new THREE.BoxGeometry(18,3.7,7.9),[paperMat,paperMat,billMat,paperMat,paperMat,paperMat]);pile.position.y=1.85;g.add(pile);
 const st=strapTextures(),sideMat=new THREE.MeshStandardMaterial({map:st.side,roughness:.85}),topMat=new THREE.MeshStandardMaterial({map:st.top,roughness:.85});
 // Wrapped currency strap: Level 29 crest in the middle of the stack, printed denomination on its edges.
 const strap=new THREE.Mesh(new THREE.BoxGeometry(4.2,3.95,8.12),[sideMat,sideMat,topMat,topMat,sideMat,sideMat]);strap.position.set(0,1.85,0);g.add(strap);
 return g;
}
function moneyStack(){
 if(!billMat){billMat=new THREE.MeshStandardMaterial({map:billTexture(),roughness:.95});paperMat=new THREE.MeshStandardMaterial({map:canvasTex(128,64,g=>{g.fillStyle='#b8c79d';g.fillRect(0,0,128,64);for(let y=0;y<64;y+=3){g.fillStyle=y%2?'#5f7650':'#dadcbd';g.fillRect(0,y,128,1);}}),roughness:1});}
 const g=new THREE.Group(),slots=[[0,0,0,0]];
 g.userData.bundles=slots.map(([x,y,z,a])=>{const b=bundle();b.position.set(x,y+.34,z);b.rotation.y=a;g.add(b);return b;});g.scale.setScalar(.62);return g;
}
const oldPickup=makePickup;
makePickup=function(){const m=oldPickup();m.userData.cashStack=moneyStack();m.userData.cashStack.visible=false;m.add(m.userData.cashStack);return m;};
// Existing pool captured the old factory at init; swap it explicitly as well.
if(kPool)kPool.make=makePickup;
// Host-authoritative death drops, including remote players; snapshots already sync all pickups.
function deathCash(x,y){pickups.push({x,y,kind:'cash',t:0,amt:100,expiresAt:Date.now()+30000});}
const oldKillP=killPlayer;killPlayer=function(){const was=player.dead,x=player.car?player.car.x:player.x,y=player.car?player.car.y:player.y;oldKillP();if(!was&&mpRole!=='client')deathCash(x,y);};
const oldHost=mpHostData;mpHostData=function(id,d){const r=MP.remotes.get(id);if(r&&d){if(d.t==='st'&&!d.dead)r.l29Dropped=false;if((d.t==='die'||(d.t==='st'&&d.dead))&&!r.l29Dropped){deathCash(Number.isFinite(d.x)?d.x:r.x,Number.isFinite(d.y)?d.y:r.y);r.l29Dropped=true;}}oldHost(id,d);};
// Every enterable venue has a staff member with role-specific clothing and equipment.
const jobs={safe:['SAFE HOUSE CARETAKER','#788c67','#4e5e43'],garage:['MECHANIC','#2a4b69','#263e52'],armory:['ARMORY DEALER','#505f38','#2f3828'],spray:['CARWASH ATTENDANT','#31a4b0','#2d5261'],business:['BUSINESS MANAGER','#30394a','#242c39']};
function worker(v){
 const job=jobs[v.id],m=makeFigure(false),u=m.userData;setFigureColors(m,['#b17953','#8c573a','#d4a078'][Math.floor(v.b.seed)%3],job[1],job[2],'#28221b');
 const q=batch(u.body),cloth=material(job[1]),boots=material('#272c2b'),white=material('#e1decf');
 for(const z of [-4.9,4.9])q.box(2.5,4.2,2.6,0,13,z,cloth);
 for(const z of [-1.8,1.8])q.box(5,1.7,3.5,1,1,z,boots);
 q.box(.35,1.3,2.3,2.5,13.2,-1.9,white); // name patch on front of uniform
 if(v.id==='business'){
  q.box(.3,6,2.3,2.5,12.5,0,white);q.box(.5,4.8,.8,2.8,12,0,material('#9b6546'));
  for(const z of [-1.8,1.8])q.box(.5,5,1.7,2.7,13.5,z,cloth);
 }else if(v.id==='garage'){
  q.box(.4,6,.4,2.6,11.7,0,material('#989d96',.6));for(const z of [-2.2,2.2])q.box(.4,1.8,2.2,2.7,10,z,material('#213a50'));
  q.box(.6,4,.8,2.9,9,-2.4,material('#b0b7b0',.8));
 }else if(v.id==='armory'){
  q.box(5.1,6,7.8,0,12,0,material('#323d2c'));for(const z of [-2.5,2.5])q.box(.5,2.4,2.3,2.8,11.8,z,material('#667244'));
 }else if(v.id==='spray'){q.box(.5,5.7,5.1,2.6,10.4,0,material('#1b666f'));q.box(.8,4,1,3,9.5,2,material('#eecc70'));}
 else q.box(.4,3.4,3,2.6,12,0,material('#ece5cf'));
 if(v.id!=='business'){
  const hat=new THREE.Mesh(new THREE.CylinderGeometry(2.8,3,.9,16),cloth);hat.position.y=20.7;u.body.add(hat);q.box(3.3,.35,5,3,20.5,0,cloth);u.hair.visible=false;
 }
 for(const z of [-1.1,1.1]){q.box(.2,.45,.65,2.3,18.6,z,material('#202620'));q.box(.22,.16,.85,2.32,17.1,z*.3,material('#854f3b'));}
 q.finish();
 // Find a free interior location off the vehicle bay and service interaction disc.
 let x=v.b.x+v.b.w*.25,y=v.stationY-20;
 const free=(x,y)=>!v.furniture.some(f=>hitRect(x,y,8,f))&&dist(x,y,v.stationX,v.stationY)>(v.vehicle?33:16);
 let found=false;for(const yy of [v.stationY-20,v.stationY+25,v.b.y+45,v.b.y+65]){for(const xx of [v.b.x+v.b.w*.25,v.b.x+v.b.w*.75,v.b.x+v.b.w*.5])if(!found&&free(xx,yy)){x=xx;y=yy;found=true;}}
 m.position.set(x,0,y);m.rotation.y=-Math.PI/2;v.mesh.add(m);v.worker=m;v.workerX=x;v.workerY=y;v.furniture.push({x:x-5,y:y-5,w:10,h:10});
 const label=new THREE.Sprite(new THREE.SpriteMaterial({map:signTex(job[0],'#162322',v.col,512,72),depthTest:true}));label.scale.set(38,5.4,1);label.position.set(0,28,0);m.add(label);
}
const oldVenue=buildVenue;buildVenue=function(v){oldVenue(v);const b=v.b,g=v.mesh,q=batch(g),stone=material('#a89d85'),dark=material('#374747',.2),steel=material('#80918e',.45,.55);
 // Weathered masonry, projecting lintels and external window frames.
 const wall=facade(v.id==='safe'?'#c2b799':'#b5b5a6','brick');g.children.filter(o=>o.isMesh&&o.geometry.type==='BoxGeometry'&&o.geometry.parameters.height===52).forEach(o=>{o.material=wall;const uv=o.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*2,uv.getY(i));});
 q.box(b.w+6,3,5,b.x+b.w/2,39,b.y+b.h+2,stone);q.box(b.w+6,3,5,b.x+b.w/2,2,b.y+b.h+1,stone);
 q.box(24,9,21,b.x+b.w*.73,60,b.y+b.h*.45,steel);
 for(let k=0;k<5;k++)q.box(.8,6,20,b.x+b.w*.73-8+k*4,60,b.y+b.h*.45,dark);
 for(const xx of [b.x+b.w*.17,b.x+b.w*.83]){
  if(Math.abs(xx-v.doorX)<v.doorW/2+12)continue;
<<<<<<< HEAD
  q.box(21,21,.9,xx,23,v.doorY+1,stone);q.box(17,17,1,xx,23,v.doorY+1.7,new THREE.MeshPhysicalMaterial({name:'buildingGlass',color:'#b9d0d2',metalness:0,roughness:.1,transmission:.6,thickness:.25,ior:1.45,transparent:true,opacity:1,depthWrite:false}));q.box(.8,17,1,xx,23,v.doorY+2.3,dark);q.box(17,.8,1,xx,23,v.doorY+2.3,dark);
=======
  q.box(21,21,.9,xx,23,v.doorY+1,stone);q.box(17,17,1,xx,23,v.doorY+1.7,material('#3f6269',.4,.25));q.box(.8,17,1,xx,23,v.doorY+2.3,dark);q.box(17,.8,1,xx,23,v.doorY+2.3,dark);
>>>>>>> main
 }
 q.finish();worker(v);
 // Interior finish: light ceiling with fluorescent fixtures and a less glaring floor.
 g.children.forEach(o=>{if(o.isMesh&&o.geometry.type==='BoxGeometry'&&o.geometry.parameters.height===.6){o.material=new THREE.MeshStandardMaterial({color:v.id==='safe'?'#6e6252':'#5f6561',roughness:.9});}});
 const ceil=new THREE.Mesh(new THREE.PlaneGeometry(b.w-6,b.h-6).rotateX(Math.PI/2),new THREE.MeshStandardMaterial({color:'#d3d1c6',emissive:'#8b8a80',roughness:1}));ceil.position.set(b.x+b.w/2,50.7,b.y+b.h/2);g.add(ceil);
 const tube=new THREE.MeshBasicMaterial({color:'#fff8df'});for(const zz of [b.y+b.h*.28,b.y+b.h*.7])for(const xx of [b.x+b.w*.28,b.x+b.w*.72]){const t=box(34,1,3,tube);t.position.set(xx,50,zz);g.add(t);}
};
// Detailed destinations in the expanded neighborhoods and waterfront.
function amenities(group){
 const q=batch(group),concrete=material('#a7a99b'),iron=material('#343f3c',.4),wood=material('#8b6242'),white=material('#e4dec8'),green=material('#467958');
 for(const f of city.features){const x=f.x,z=f.y,w=f.w,d=f.h;
  if(f.kind==='cemetery'){
<<<<<<< HEAD
   const plot=new THREE.Group();plot.name='dedicated-cemetery';plot.position.y=city.heightAt?city.heightAt(x+w/2,z+d/2):0;group.add(plot);
   const cq=batch(plot),stone=material('#8b8472');
   cq.box(w,1,d,x+w/2,.55,z+d/2,stone);
   // Low perimeter fence with a clear entrance; all graves remain inside this plot.
   for(const xx of [x+2,x+w-2])cq.box(1.5,10,d-4,xx,5,z+d/2,iron);
   cq.box(w-4,10,1.5,x+w/2,5,z+2,iron);
   for(const side of [-1,1])cq.box((w-40)/2,10,1.5,x+w/2+side*(w+40)/4,5,z+d-2,iron);
   const cols=Math.max(1,Math.min(5,Math.floor((w-30)/36))),rows=Math.max(1,Math.min(4,Math.floor((d-60)/52)));
   for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
    const xx=x+24+col*(w-48)/Math.max(1,cols-1),zz=z+28+row*(d-90)/Math.max(1,rows-1);
    cq.box(25,19,38,xx,10,zz,white);cq.box(29,3,42,xx,21,zz,concrete);cq.box(13,5,1,xx,13,zz+19.6,iron);cq.box(1,8,1,xx,27,zz,white);cq.box(5,1,1,xx,28.5,zz,white);
   }
   addSign(plot,'LEVEL 29 · OLD TOWN CEMETERY',Math.min(190,w-24),12,x+w/2,24,z+d-6,'#d5c7a4');cq.finish();
=======
   q.box(w,1,d,x+w/2,.55,z+d/2,material('#8b8472'));
   for(let row=0;row<4;row++)for(let col=0;col<5;col++){const xx=x+28+col*52,zz=z+26+row*61;q.box(25,19,38,xx,10,zz,white);q.box(29,3,42,xx,21,zz,concrete);q.box(13,5,1,xx,13,zz+19.6,iron);q.box(1,8,1,xx,27,zz,white);q.box(5,1,1,xx,28.5,zz,white);}
   addSign(group,'LEVEL 29 · OLD TOWN CEMETERY',190,12,x+w/2,24,z+d, '#d5c7a4');
>>>>>>> main
  }
  if(f.kind==='market'){
   q.box(w,1,d,x+w/2,.55,z+d/2,material('#8b826c'));
   for(let row=0;row<2;row++)for(let k=0;k<4;k++){const xx=x+34+k*69,zz=z+60+row*133,canopy=material(['#ad4f3c','#c6a262','#497c68','#677e99'][k]);
    for(const dx of [-25,25])for(const dz of [-18,18])q.box(1,30,1,xx+dx,15,zz+dz,iron);
    q.box(57,2,43,xx,31,zz,canopy);q.box(57,7,1,xx,28,zz+21,canopy);q.box(46,9,17,xx,4.5,zz+8,wood);
    for(let i=0;i<5;i++)q.box(6,3,8,xx-17+i*8,11,zz+8,material(i%2?'#c4b463':'#77814c'));
   }
   addSign(group,D.id==='nola'?'FRENCH MARKET · LEVEL 29':'LEVEL 29 · COMMUNITY MARKET',190,12,x+w/2,42,z+d,'#e0c186');
  }
  if(f.kind==='basketball'){
   const tex=canvasTex(512,512,g=>{g.fillStyle='#466a5d';g.fillRect(0,0,512,512);g.fillStyle='#af6c44';g.fillRect(30,30,452,452);g.strokeStyle='#ece5c9';g.lineWidth=4;g.strokeRect(30,30,452,452);g.beginPath();g.moveTo(30,256);g.lineTo(482,256);g.stroke();g.beginPath();g.arc(256,256,42,0,7);g.stroke();for(const yy of [30,482]){g.strokeRect(182,yy===30?30:376,148,106);g.beginPath();g.arc(256,yy===30?136:376,75,0,7);g.stroke();}});
   const floor=plane(group,w-20,d-20,x+w/2,1,z+d/2,tex);floor.rotation.x=-Math.PI/2;
   for(const zz of [z+30,z+d-30]){q.box(2,27,2,x+w/2,13.5,zz,iron);q.box(32,20,1,x+w/2,27,zz,white);const hoop=new THREE.Mesh(new THREE.TorusGeometry(5,.5,6,16),material('#bc6435',.4));hoop.rotation.x=Math.PI/2;hoop.position.set(x+w/2,22,zz+(zz<z+d/2?6:-6));group.add(hoop);}
  }
  if(f.kind==='skatepark'){
   q.box(w,1,d,x+w/2,.7,z+d/2,concrete);
   for(const xx of [x+50,x+w-50]){const ramp=new THREE.Mesh(new THREE.CylinderGeometry(32,32,76,20,1,true,0,Math.PI/2),concrete);ramp.rotation.z=Math.PI/2;ramp.position.set(xx,33,z+d*.45);group.add(ramp);}
   for(let k=0;k<5;k++)q.box(65,2,25,x+w/2,1+k*2,z+d*.7+k*8,concrete);
   q.box(100,1,1,x+w/2,10,z+70,iron);for(const xx of [x+w/2-45,x+w/2+45])q.box(1,10,1,xx,5,z+70,iron);
  }
  if(f.kind==='training'){
   for(let k=0;k<4;k++){const xx=x+34+k*66;q.box(3,40,3,xx,20,z+60,wood);q.box(3,40,3,xx,20,z+120,wood);q.box(3,3,63,xx,40,z+90,iron);}
   for(let k=0;k<5;k++)q.box(40,2,20,x+40+k*48,7+k*3,z+205,wood);
   addSign(group,'USMC · CONFIDENCE COURSE',175,12,x+w/2,24,z+d,'#b8b98c');
  }
  if(f.kind==='square'||f.kind==='park'){
   for(const xx of [x+w*.2,x+w*.8]){q.box(30,2,8,xx,7,z+d*.65,wood);q.box(30,7,1,xx,10,z+d*.65+4,wood);for(const dx of [-11,11])q.box(1.2,7,7,xx+dx,3.5,z+d*.65,iron);}
   if(f.kind==='square'){const fountain=new THREE.Mesh(new THREE.CylinderGeometry(19,21,5,32),concrete);fountain.position.set(x+w/2,3,z+d/2);group.add(fountain);const water=new THREE.Mesh(new THREE.CircleGeometry(18,32),material('#55929b',.45,.22));water.rotation.x=-Math.PI/2;water.position.set(x+w/2,5.7,z+d/2);group.add(water);q.box(5,20,5,x+w/2,13,z+d/2,concrete);}
  }
 
  if(f.kind==='landmark'){
   const cx=x+w/2,cz=z+d/2,lm=new THREE.Group();lm.position.set(cx,0,cz);group.add(lm);const lq=batch(lm),pale=material('#e8e5d8',.1,.6),red=material('#a53b31',.1,.55),blue=material('#3d6e8f',.3,.45);
   q.box(w-12,1,d-12,x+w/2,.7,z+d/2,material('#7b786b'));
   if(D.id==='nola'||D.id==='la'){
    const wheel=new THREE.Group();wheel.position.set(0,92,0);lm.add(wheel);group.userData.wheel=wheel;
    for(const r of [66,60]){const ring=new THREE.Mesh(new THREE.TorusGeometry(r,1.2,6,72),material('#d8d6cb',.5,.4));wheel.add(ring);}
    for(let k=0;k<16;k++){const a=k*Math.PI/8,sp=box(1.1,1.1,132,pale);sp.rotation.z=a+Math.PI/2;sp.rotation.y=Math.PI/2;sp.position.set(0,0,0);const spoke=new THREE.Mesh(new THREE.BoxGeometry(132,.9,.9),pale);spoke.rotation.z=a;wheel.add(spoke);
     const car=box(11,9,9,material(['#d1503b','#f0c75e','#3f87a6','#5da36c'][k%4]));car.position.set(Math.cos(a)*66,Math.sin(a)*66-6,0);wheel.add(car);}
    for(const zz of [-18,18]){const leg1=box(3,98,3,iron),leg2=box(3,98,3,iron);leg1.position.set(-24,46,zz);leg1.rotation.z=-.28;leg2.position.set(24,46,zz);leg2.rotation.z=.28;lm.add(leg1,leg2);}
    lq.box(66,3,42,0,2,0,concrete);addSign(lm,D.id==='nola'?'RIVERFRONT WHEEL':'PACIFIC PARK',110,9,0,18,28,'#f0d28a');
   }else if(D.id==='hou'){
    const stage=(r,h,y,c)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r*1.02,h,32),material(c,.15,.45));m.position.set(0,y,0);lm.add(m);};
    stage(13,92,46,'#ece8dc');stage(13.2,6,70,'#242a2d');stage(13.2,6,38,'#242a2d');stage(10,58,121,'#ece8dc');stage(6.6,34,167,'#dcd5c1');
    const nose=new THREE.Mesh(new THREE.ConeGeometry(6.6,34,24),material('#f1eee3',.1,.5));nose.position.y=201;lm.add(nose);const tip=new THREE.Mesh(new THREE.ConeGeometry(1.2,17,12),red);tip.position.y=226;lm.add(tip);
    for(let k=0;k<4;k++){const a=k*Math.PI/2+.78,fin=box(17,32,1.3,pale);fin.position.set(Math.cos(a)*17,16,Math.sin(a)*17);fin.rotation.y=-a;lm.add(fin);}
    for(let y=8;y<232;y+=18){for(const xx of [-34,-28])lq.box(1.4,19,1.4,xx,y+8,0,iron);lq.box(7,1,1,-31,y,0,iron);}
    addSign(lm,'LEVEL 29 SPACE CENTER',150,10,0,16,45,'#e7e1cc');lq.box(80,3,80,0,2,0,concrete);
   }else if(D.id==='lej'){
    const hangar=new THREE.Mesh(new THREE.CylinderGeometry(78,78,190,32,1,true,0,Math.PI),new THREE.MeshStandardMaterial({color:'#7f8978',metalness:.35,roughness:.55,side:THREE.DoubleSide}));hangar.rotation.set(Math.PI/2,0,Math.PI/2);hangar.position.set(0,0,0);lm.add(hangar);
    for(const zz of [-95,95]){const e=new THREE.Mesh(new THREE.CircleGeometry(78,32,0,Math.PI),material('#3b4741',.2,.7));e.position.z=zz;lm.add(e);}
    const heli=new THREE.Group();heli.position.set(0,0,0);lm.add(heli);for(const [w,h,dd,x,y,zz,c] of [[48,16,17,0,24,0,'#51603f'],[40,4,4,-42,28,0,'#51603f'],[4,13,2,-62,32,0,'#51603f']]){const part=box(w,h,dd,material(c));part.position.set(x,y,zz);heli.add(part);}
    const rotor=box(95,1,5,iron);rotor.position.set(0,34,0);heli.add(rotor);const rotor2=box(5,1,95,iron);rotor2.position.set(0,34,0);heli.add(rotor2);addSign(lm,'MCAS NEW RIVER',130,10,0,18,-96,'#cfd2a8');
   }else{
    for(let k=0;k<6;k++){const seg=new THREE.Mesh(new THREE.CylinderGeometry(15.5-k*1.5-.8,15.5-k*1.5,32,24),material(k%2?'#cf433f':'#f1ede2',.1,.55));seg.position.y=20+k*31;lm.add(seg);}
    const gallery=new THREE.Mesh(new THREE.CylinderGeometry(15,13,4,24),iron);gallery.position.y=208;lm.add(gallery);const lamp=new THREE.Mesh(new THREE.CylinderGeometry(7,7,20,16),new THREE.MeshBasicMaterial({color:'#ffe9a1'}));lamp.position.y=222;lm.add(lamp);
    const cap=new THREE.Mesh(new THREE.ConeGeometry(11,16,16),red);cap.position.y=240;lm.add(cap);lq.box(50,16,34,40,8,0,pale);lq.box(54,3,38,40,18,0,red);addSign(lm,'PARRIS ISLAND LIGHT',110,9,0,38,16,'#f0d6a0');
   }
   lq.finish();
  }
  if(f.kind==='riverfront'){
   q.box(w,1.5,31,x+w/2,1,z+40,wood);q.box(w,1,1,x+w/2,14,z+55,iron);for(let xx=x;xx<x+w;xx+=18)q.box(.8,14,.8,xx,7,z+55,iron);
   const boat=new THREE.Group();boat.position.set(x+w*.62,0,z+165);group.add(boat);
   const bq=batch(boat);bq.box(145,8,56,0,4,0,material('#283c3e'));bq.box(126,13,47,-3,15,0,white);bq.box(137,3,57,-3,23,0,white);bq.box(110,13,40,-6,31,0,white);bq.box(125,2,53,-6,39,0,white);
   for(const xx of [-33,-17]){bq.box(7,29,7,xx,54,0,iron);bq.box(9,3,9,xx,68,0,material('#a64932'));}
   for(let xx=-48;xx<52;xx+=16)for(const zz of [-24,24])bq.box(9,7,1,xx,15,zz,material('#435b65'));
   for(let xx=-60;xx<60;xx+=8)for(const zz of [-27,27])bq.box(.7,12,.7,xx,29,zz,iron);
   for(const zz of [-27,27])bq.box(125,.8,.8,0,35,zz,iron);
   const wheel=new THREE.Mesh(new THREE.CylinderGeometry(18,18,38,20),material('#a33d2c'));wheel.rotation.x=Math.PI/2;wheel.position.set(67,10,0);boat.add(wheel);
   for(let k=0;k<12;k++){const paddle=box(4,4,40,wood);paddle.position.set(67+Math.cos(k*Math.PI/6)*18,10+Math.sin(k*Math.PI/6)*18,0);paddle.rotation.z=k*Math.PI/6;boat.add(paddle);}
   bq.finish();addSign(boat,'BAYOU QUEEN',82,7,0,31,25,'#d8b968');
   addSign(group,'MISSISSIPPI RIVERFRONT',175,12,x+85,25,z+20,'#dbcba8');
  }
 }
 // Urban street furniture follows safe sidewalk locations and does not obstruct lanes.
 if(!city.biome)for(let i=0;i<ROADS.length;i++)for(let j=0;j<ROADS.length;j++){
  const x=(ROADS[i]+3.5)*TILE,z=(ROADS[j]+3.5)*TILE;
  if(tileAt(x,z)!==T_WALK)continue;
  q.box(5,8,5,x+8,4,z+8,material('#465951'));q.box(5.7,1,5.7,x+8,8,z+8,iron);
  q.box(3,8,3,x-8,4,z+9,material('#a45b3d'));q.box(5,1,2,x-8,6,z+9,material('#a45b3d'));
  for(const dx of [20,55]){q.box(1,24,1,x+dx,12,z-7,iron);q.box(4,9,3,x+dx,22,z-7,iron);q.box(2,2,3.1,x+dx,24,z-7,material('#c0513d'));q.box(2,2,3.1,x+dx,20,z-7,material('#4e8d63'));}
 }
 q.finish();
}
const oldBuild=buildCity;buildCity=function(){oldBuild();const group=new THREE.Group();group.name='level29-world-detail';cityGroup.add(group);if(!city.biome)architecturalDetails(group);amenities(group);};
const oldSyncCars=syncCars;syncCars=function(){oldSyncCars();for(const [c,m] of carMeshes)if(m.visible&&!(player&&player.car===c)&&dist(c.x,c.y,camera.position.x,camera.position.z)>980)m.visible=false;};
const oldDynamic=syncDynamic;syncDynamic=function(){oldDynamic();const wd=cityGroup&&cityGroup.getObjectByName('level29-world-detail');if(wd&&wd.userData.wheel)wd.userData.wheel.rotation.z-=.0022;for(const [k,m] of kPool.map){const st=m.userData.cashStack;if(st&&k.kind==='cash'){const n=k.amt<100?1:k.amt<190?2:k.amt<320?3:4;st.userData.bundles.forEach((b,i)=>b.visible=i<n);}}for(const v of city.venues||[]){if(!v.worker)continue;const u=v.worker.userData;u.body.position.y=Math.sin(frame*.026+v.b.seed)*.12;u.armL.rotation.z=Math.sin(frame*.017)*.04;u.armR.rotation.z=-Math.sin(frame*.019)*.05;if(player&&dist(player.x,player.y,v.workerX,v.workerY)<110){v.worker.rotation.y=-Math.atan2(player.y-v.workerY,player.x-v.workerX);}}};
// State inspection and performance readout for testing without changing gameplay controls.
window.render_game_to_text=()=>JSON.stringify({mode:state,district:D&&D.name,map:[MW,MH],coordinates:'x east, y south; world ground height separate',player:player&&{x:Math.round(player.x),y:Math.round(player.y),hp:player.hp,car:player.car&&player.car.type},cash,pickups:pickups.map(k=>({kind:k.kind,x:k.x,y:k.y,amount:k.amt})),venues:(city&&city.venues||[]).map(v=>({id:v.id,open:v.open,staff:jobs[v.id]?.[0]||v.name})),features:city&&city.features.map(f=>f.kind)});
const debug=document.createElement('div');debug.id='l29-performance';debug.style.cssText='position:fixed;top:3px;left:3px;z-index:20;background:rgba(11,20,22,.72);padding:3px 6px;color:#bfcdbd;font:10px monospace;pointer-events:none';debug.style.display=/[?&]debug/.test(location.search)?'block':'none';addEventListener('keydown',e=>{if(e.key==='F3'){debug.style.display=debug.style.display==='none'?'block':'none';e.preventDefault();}});document.body.appendChild(debug);
let debugFrames=0,debugLast=performance.now();const oldRender=render;render=function(){oldRender();debugFrames++;const now=performance.now();if(now-debugLast>1000){debug.textContent=Math.round(debugFrames*1000/(now-debugLast))+' FPS · '+renderer.info.render.calls+' draws · '+MW+'×'+MH;debugLast=now;debugFrames=0;}};
window.level29World={version:1,makeMoney:moneyStack,jobs,facades,batch,material,facade,worker,features:()=>city.features,map:()=>[MW,MH]};
})();
// Superdome: original procedural game model based on exterior form, not a scanned replica.
function makeLevel29Superdome(b){
 const g=new THREE.Group(),R=Math.min(b.w,b.h)*.49,cx=b.x+b.w/2,cz=b.y+b.h/2;g.position.set(cx,0,cz);
 const cladding=canvasTex(512,512,(c,w,h)=>{
  const gr=c.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#a99d89');gr.addColorStop(.27,'#81776a');gr.addColorStop(.55,'#b4a791');gr.addColorStop(1,'#d3c4a8');c.fillStyle=gr;c.fillRect(0,0,w,h);
  for(let x=0;x<w;x+=16){c.fillStyle='rgba(27,25,23,.21)';c.fillRect(x,0,1,h);c.fillStyle='rgba(248,235,210,.22)';c.fillRect(x+1,0,1,h);}c.fillStyle='#435553';for(let x=10;x<w;x+=64)c.fillRect(x,288,40,12);
 },true);cladding.repeat.x=8;
 const mat=new THREE.MeshStandardMaterial({map:cladding,metalness:.45,roughness:.48});
 const profile=[[R,15],[R*.98,24],[R*.93,36],[R*.90,48],[R*.895,59],[R*.91,72],[R*.95,86],[R*.98,98]].map(v=>new THREE.Vector2(...v));
 const shell=new THREE.Mesh(new THREE.LatheGeometry(profile,128),mat);g.add(shell);
 const base=new THREE.Mesh(new THREE.CylinderGeometry(R*1.03,R*1.03,15,96),new THREE.MeshStandardMaterial({color:'#898b81',roughness:.8}));base.position.y=7.5;g.add(base);
 const roofTex=canvasTex(1024,512,(c,w,h)=>{c.fillStyle='#e7e6dc';c.fillRect(0,0,w,h);c.strokeStyle='rgba(60,68,70,.26)';c.lineWidth=2;for(let y=0;y<h;y+=32){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}for(let x=0;x<w;x+=16){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}c.fillStyle='rgba(60,68,70,.2)';for(let y=0;y<h;y+=64)c.fillRect(0,y,w,4);});
 const roof=new THREE.Mesh(new THREE.SphereGeometry(R*.98,96,40,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({map:roofTex,color:'#d4d4cb',roughness:.72}));roof.scale.y=.34;roof.position.y=98;g.add(roof);
 for(const y of [15,98]){const ring=new THREE.Mesh(new THREE.TorusGeometry(y===15?R*1.025:R*.98,1.05,6,128),new THREE.MeshStandardMaterial({color:'#d8d4c6',metalness:.6,roughness:.4}));ring.rotation.x=Math.PI/2;ring.position.y=y;g.add(ring);}
 const q=new THREE.Group();g.add(q);const tmp=new THREE.Object3D(),arr=[];for(let k=0;k<64;k++){const a=k*Math.PI/32;arr.push([a,Math.sin(a)*R*1.035,Math.cos(a)*R*1.035]);}
 const panels=new THREE.InstancedMesh(new THREE.BoxGeometry(6,10,1),new THREE.MeshStandardMaterial({color:'#294548',metalness:.3,roughness:.35}),arr.length);arr.forEach(([a,x,z],i)=>{tmp.position.set(x,7.5,z);tmp.rotation.set(0,a,0);tmp.updateMatrix();panels.setMatrixAt(i,tmp.matrix);});g.add(panels);
 // Four public entrance pavilions and wide, stepped approaches.
 for(let k=0;k<4;k++){
  const a=k*Math.PI/2,entrance=new THREE.Group();entrance.rotation.y=a;g.add(entrance);
  addPart(entrance,52,12,14,0,6,R*1.01,new THREE.MeshStandardMaterial({color:'#8f9087'}));addPart(entrance,44,8,1,0,6,R*1.01+7.2,new THREE.MeshStandardMaterial({color:'#263f43',metalness:.4,roughness:.25}));addPart(entrance,56,2,22,0,14,R*1.01+3,new THREE.MeshStandardMaterial({color:'#c0b7a5'}));
  for(let j=0;j<6;j++)addPart(entrance,50,1+j*.7,3,0,(1+j*.7)/2,R*1.01+22-j*3,new THREE.MeshStandardMaterial({color:'#abae9f',roughness:1}));
 }
 // Roof lettering is placed on the forward slope instead of a floating roadside sign.
  addSign(g,'CAESARS SUPERDOME',R*1.2,10,0,19,R*1.03+8,'#e2d9bf');
 return g;
}
