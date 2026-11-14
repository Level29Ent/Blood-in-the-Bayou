'use strict';
// Estate and world art expansion. No added render loops, music players or network timers.
(function(){
const {batch}=level29World;
const material=(color,rough=.85,metal=0)=>level29World.material(color,metal,rough);
const vehicleData=[
 ['electric','CRESCENT ELECTRIC','sedan',48,24,8.9,150],
 ['ambulance','PARISH AMBULANCE','van',65,28,7,230],
 ['utility','LEVEE UTILITY PICKUP','pickup',58,27,6.5,210],
 ['compact','CITY COMPACT','sedan',36,20,6.9,100],
 ['hatchback','SPORT HATCH','sedan',40,21,7.8,110],
 ['wagon','TOURING WAGON','sedan',52,23,7.4,140],
 ['crossover','BAYOU CROSSOVER','sedan',49,25,7.2,155],
 ['suv','FULL-SIZE SUV','humvee',58,28,7,190],
 ['executive','EXECUTIVE SEDAN','sedan',54,24,8.3,150],
 ['limousine','STRETCH LIMO','sedan',82,25,6.5,210],
 ['muscle','CLASSIC MUSCLE','lowrider',51,25,9,130],
 ['roadster','OPEN ROADSTER','convertible',39,21,9.8,90],
 ['minivan','FAMILY MINIVAN','van',54,26,6.8,155],
 ['delivery','DELIVERY STEP VAN','truck',63,28,5.9,205],
 ['offroad','TRAIL 4X4','humvee',46,27,7.2,210],
 ['rally','RALLY COUPE','sports',42,23,9.2,125],
 ['flatbed','WORK FLATBED','pickup',66,28,5.8,220],
 ['towtruck','RECOVERY TOW TRUCK','pickup',64,29,5.7,235],
 ['supercar','MIDNIGHT SUPERCAR','sports',44,24,11.2,115],
 ['hypercar','JESTER HYPERCAR','sports',46,25,12.4,120],
 ['coupe','GRAND TOURER COUPE','sports',47,23,10,130],
 ['cadillac','FAT TUESDAY CRUISER','lowrider',58,25,7.8,160],
 ['ponycar','PONY CAR','lowrider',48,24,9.4,135],
 ['hearse','VOODOO HEARSE','sedan',64,25,7,180],
 ['swampbuggy','SWAMP BUGGY','humvee',44,28,7.6,230],
 ['monster','MONSTER TRUCK','humvee',56,34,7.4,320],
 ['icecream','SNO-BALL TRUCK','van',56,27,6,170],
 ['camper','BAYOU CAMPER','truck',70,29,5.4,240]
];
for(const [id,name,base,len,wid,max,hp]of vehicleData){
 CAR_SPECS[id]={...CAR_SPECS[base],name,len,wid,max,hp,cols:['#384c52','#c5bba5','#702d36','#424046','#416551','#b9974c']};
}
let penthouse=null,guests=[],wildlife=[];
const oldPlayer=newPlayer;
newPlayer=function(x,y){if(penthouse)penthouse.active=false;return oldPlayer(x,y);};
const contains=(b,x,y,pad=0)=>x>b.x+pad&&x<b.x+b.w-pad&&y>b.y+pad&&y<b.y+b.h-pad;
const oldGen=genCity;
genCity=function(di){
 const c=oldGen(di);penthouse=null;guests=[];wildlife=[];
 if(!c.world)return c;
 c.mansion=(c.safes||[]).find(s=>s.fort)||null;
 if(c.mansion){c.safe=c.mansion;const v=c.venues.find(v=>v.b===c.mansion.B);if(v){v.privateResidence=true;v.name="RONNIEBABY'S PENTHOUSE";v.short='PRIVATE RESIDENCE';v.serviceLabel='RONNIEBABY · PRIVATE RESIDENCE · U ELEVATOR';}}
 const roadCars=c.parked.filter(p=>!CAR_SPECS[p.type]?.boat);
 // Reuse existing spaced parking spots, rather than increasing congestion.
 for(let i=0;i<roadCars.length;i++)if(i%2===0)roadCars[i].type=vehicleData[(i/2)%vehicleData.length][0];
 for(const sf of c.safes||[])if(sf!==c.mansion&&sf.B.venue){
  const v=c.venues.find(v=>v.b===sf.B);if(v){v.name='NEIGHBORHOOD SAFEHOUSE';v.short='SAFEHOUSE';}
 }
 return c;
};
function addMesh(g,geo,mat,x,y,z){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);g.add(m);return m;}
function ball(g,rx,ry,rz,x,y,z,mat){
 const m=addMesh(g,new THREE.SphereGeometry(1,14,10),mat,x,y,z);m.scale.set(rx,ry,rz);return m;
}
function rod(g,a,b,r,mat){
 const p=new THREE.Vector3(...a),end=new THREE.Vector3(...b),d=end.clone().sub(p);
 const m=addMesh(g,new THREE.CylinderGeometry(r,r,d.length(),7),mat,...p.clone().add(end).multiplyScalar(.5).toArray());
 m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m;
}
function text(g,s,w,h,x,y,z,color='#e9ce85',angle=0){
 const t=canvasTex(512,128,c=>{c.fillStyle='#152823';c.fillRect(0,0,512,128);c.strokeStyle=color;c.lineWidth=5;c.strokeRect(7,7,498,114);c.fillStyle=color;c.font='bold 29px sans-serif';c.textAlign='center';c.fillText(s,256,74);});
 const m=addMesh(g,new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}),x,y,z);m.rotation.y=angle;return m;
}
function wallTexture(){
 return canvasTex(128,512,g=>{
  g.fillStyle='#672e79';g.fillRect(0,0,128,512);
  g.fillStyle='#173f30';g.fillRect(0,320,128,192);
  g.fillStyle='#c5a23c';g.fillRect(0,245,128,65);
  g.fillStyle='#d3bedb';g.fillRect(0,310,128,10);
  const r=mkRng(2929);for(let i=0;i<9000;i++){g.fillStyle=r()>.5?'rgba(255,255,255,.025)':'rgba(0,0,0,.025)';g.fillRect(r()*128,r()*512,1,1);}
 });
}
// Adult guests, fully clothed, with rounded bodies, dress seams, individual hairstyles and heels.
function guest(index){
 const looks=[
  ['Ari',28,'#85503b','#1c1415','#b82242','long'],
  ['Simone',31,'#4c2b21','#171311','#d2ac4d','curly'],
  ['Valentina',27,'#bd8a66','#522716','#286d61','bob'],
  ['Jade',30,'#d8ae87','#c3a15e','#34244b','long'],
  ['Camille',29,'#9a6750','#171719','#bcb2a3','bun']
 ];
 const [name,age,skinCol,hairCol,dressCol,style]=looks[index],g=new THREE.Group();
 g.name=name+' · adult guest';g.userData={name,age,adult:true};
 const skin=material(skinCol,.85),hair=material(hairCol,.9),dress=material(dressCol,.54),shoe=material('#18191c',.35),gold=material('#d4b35f',.3,.65);
 ball(g,2.0,2.8,1.8,0,23,0,skin);
 ball(g,2.2,1.4,2,0,25,0,hair);
 if(style==='long')ball(g,2.3,4.4,1.3,0,21,-1.1,hair);
 if(style==='bob')ball(g,2.5,2.5,1.8,0,23.7,-.6,hair);
 if(style==='bun')ball(g,1.6,1.5,1.6,0,26.3,-1.1,hair);
 if(style==='curly')for(let k=0;k<9;k++){const a=k/9*Math.PI*2;ball(g,1.1,1.3,1.1,Math.cos(a)*2,24+Math.sin(a)*1.3,-.6,hair);}
 // Tailored hourglass dress silhouette, with a covered bodice.
 const profile=[[0,8],[3.8,8],[4.1,10],[3.6,12.5],[2.4,15],[3.2,18],[2.7,20],[0,20]].map(p=>new THREE.Vector2(...p));
 addMesh(g,new THREE.LatheGeometry(profile,18),dress,0,0,0);
 ball(g,1.65,1.65,1.25,-1.25,18.3,1.85,dress);ball(g,1.65,1.65,1.25,1.25,18.3,1.85,dress);
 for(const s of [-1,1]){
  rod(g,[s*2.6,19,0],[s*4,14.5,.3],.85,skin);
  rod(g,[s*4,14.5,.3],[s*3.9,10,1.1],.65,skin);ball(g,.7,1,.6,s*3.9,9.6,1.1,skin);
  rod(g,[s*1.65,8.3,0],[s*1.7,2.3,.2],.92,skin);
  ball(g,1.1,.7,2,s*1.7,1.3,.9,shoe);rod(g,[s*1.7,1.3,-.4],[s*1.7,.1,-.4],.22,shoe);
  ball(g,.28,.7,.28,s*2.1,23,.6,gold);
  ball(g,.22,.22,.15,s*.72,23.3,1.69,shoe);
 }
 rod(g,[-1,20.5,1],[1,20.5,1],.16,gold);
 // Thin waist belt and stitched front line.
 const belt=addMesh(g,new THREE.TorusGeometry(2.45,.13,5,24),gold,0,15,0);belt.rotation.x=Math.PI/2;
 window.level29BatchStatic(g,[]);
 return g;
}
function buildPenthouse(){
 if(!city.mansion)return;
 const sf=city.mansion,b=sf.B,base=105,g=new THREE.Group();g.name='Ronniebaby penthouse';cityGroup.add(g);
 const gold=material('#c4a249',.35,.55),stone=material('#bcb39d'),wood=material('#392b24'),black=material('#23252a'),cream=material('#bbae96'),purple=material('#632b70');
 const marble=canvasTex(256,256,c=>{c.fillStyle='#8b8171';c.fillRect(0,0,256,256);const r=mkRng(2928);for(let k=0;k<60;k++){c.strokeStyle=k%3?'rgba(239,226,192,.12)':'rgba(40,32,30,.22)';c.lineWidth=.3+r()*1.8;c.beginPath();const y=r()*256;c.moveTo(0,y);c.bezierCurveTo(70,y-25,130,y+20,256,y+20);c.stroke();}});
 marble.wrapS=marble.wrapT=THREE.RepeatWrapping;marble.repeat.set(4,3);
 const floorMat=new THREE.MeshStandardMaterial({map:marble,roughness:.4,metalness:.04});
 const paintTexture=wallTexture();paintTexture.encoding=THREE.sRGBEncoding;
 const walls=new THREE.MeshBasicMaterial({name:'penthouseOriginalPaint',map:paintTexture,toneMapped:false}),q=batch(g),cx=b.x+b.w/2,cy=b.y+b.h/2;
 penthouse={b,base,active:false,lift:{x:cx,y:b.y+b.h+12},exit:{x:cx,y:b.y+b.h-19},furniture:[]};
 city.penthouse=penthouse;
 q.box(b.w,2,b.h,cx,base,cy,floorMat);
 // Correct photo ordering: purple at top, gold band, pale trim, green at bottom.
 for(const [w,d,x,z]of [[b.w,2,cx,b.y],[b.w,2,cx,b.y+b.h],[2,b.h,b.x,cy]])
  addMesh(g,new THREE.BoxGeometry(w,48,d),walls,x,base+25,z);
 // City-facing penthouse glazing, with a sill and slim brass mullions.
 for(const z of [b.y+10,b.y+b.h-10])addMesh(g,new THREE.BoxGeometry(2,48,20),walls,b.x+b.w,base+25,z);
 q.box(2,13,b.h-40,b.x+b.w,base+7,cy,new THREE.MeshBasicMaterial({name:'penthouseOriginalGreen',color:'#173f30',toneMapped:false}));
 q.box(2,11,b.h-40,b.x+b.w,base+43,cy,new THREE.MeshBasicMaterial({name:'penthouseOriginalPurple',color:'#672e79',toneMapped:false}));
 const glass=new THREE.MeshPhysicalMaterial({name:'buildingGlass',color:'#b9d0d6',transmission:.78,thickness:.25,ior:1.45,transparent:true,opacity:1,roughness:.1,metalness:0,depthWrite:false});
 q.box(.5,24,b.h-40,b.x+b.w,base+26,cy,glass);
 for(const z of [b.y+20,cy-20,cy+20,b.y+b.h-20])q.box(2,25,1,b.x+b.w-1,base+26,z,gold);
 q.box(2,1,b.h-40,b.x+b.w-1,base+14,cy,gold);q.box(2,1,b.h-40,b.x+b.w-1,base+38,cy,gold);
 q.box(b.w+7,3,b.h+7,cx,base+51,cy,stone);
 q.box(b.w-5,.5,b.h-5,cx,base+49,cy,cream);
 for(const x of [b.x+3,b.x+b.w-3])q.box(2,2,b.h-4,x,base+46,cy,gold);
 q.box(b.w-5,2,2,cx,base+46,b.y+3,gold);
 // Marble grid floor and a lounge rug.
 for(let x=b.x+16;x<b.x+b.w;x+=24)q.box(.25,.1,b.h-3,x,base+1.1,cy,wood);
 for(let y=b.y+16;y<b.y+b.h;y+=24)q.box(b.w-3,.1,.25,cx,base+1.12,y,wood);
 q.box(85,.3,54,cx,base+1.4,cy+3,purple);
 function furniture(x,y,w,h,d,m){
  q.box(w,h,d,x,base+1+h/2,y,m);penthouse.furniture.push({x:x-w/2,y:y-d/2,w,h:d});
 }
 // Leather sofa, segmented cushions, brass feet and low glass coffee table.
 furniture(b.x+19,cy,24,8,57,cream);
 q.box(5,13,57,b.x+9,base+11,cy,cream);
 for(let k=0;k<3;k++){q.box(19,3,16,b.x+21,base+11,cy-19+k*19,cream);q.box(18,3,12,b.x+20,base+13,cy-20+k*19,purple);}
 furniture(cx,cy+4,29,7,21,wood);q.box(30,.6,22,cx,base+9,cy+4,gold);
 for(const x of [-10,10])for(const z of [-7,7])q.box(1.2,7,1.2,cx+x,base+4,cy+4+z,gold);
 furniture(b.x+b.w-15,b.y+27,19,15,42,wood);q.box(21,1,43,b.x+b.w-15,base+17,b.y+27,gold);
 for(let k=0;k<5;k++){q.box(2.3,7,2.3,b.x+b.w-15,base+21,b.y+10+k*6,material(['#33604c','#80532f','#d2c59c'][k%3]));}
 // Elevator: ground-level portal, actual top-floor exit and clear central circulation.
 // Private lift lobby: one clear central approach, one compact sign, no overlapping door panel.
 q.box(42,39,2,cx,19.5,b.y+b.h+2,black);
 for(const dx of [-22,22])q.box(2,41,4,cx+dx,20.5,b.y+b.h+3,gold);
 q.box(46,2,25,cx,42,b.y+b.h+12,black);
 q.box(38,.4,42,cx,.25,b.y+b.h+23,stone);
 q.box(.8,34,.6,cx,18,b.y+b.h+3.2,gold);
 for(const dx of [-16,16])q.box(1,28,.8,cx+dx,18,b.y+b.h+3.3,gold);
 q.box(29,34,1,cx,base+18,b.y+b.h-1,black);q.box(1,33,1,cx,base+18,b.y+b.h-2,gold);
 text(g,'RONNIEBABY · PRIVATE LIFT · U',46,5,cx,36,b.y+b.h+4);
 text(g,'LOBBY · U',25,7,cx,base+38,b.y+b.h-2,'#e9ce85',Math.PI);
 text(g,'RONNIEBABY · LEVEL 29',71,11,cx,base+36,b.y+1.3);
 // Exactly two original, unaltered logo artworks with wide gold frames.
 const logo=new THREE.TextureLoader().setCrossOrigin('anonymous').load('logo.png');
 for(const x of [b.x+31,b.x+b.w-31]){
  q.box(25,25,1.4,x,base+30,b.y+1.4,gold);q.box(22,22,1.5,x,base+30,b.y+2,black);
  const artwork=addMesh(g,new THREE.PlaneGeometry(20,20),new THREE.MeshBasicMaterial({map:logo}),x,base+30,b.y+2.9);artwork.name='Level 29 framed logo';
 }
 // Warm coffer lighting without costly extra shadow-casting lights.
 for(const x of [cx-36,cx+36]){q.box(16,1,16,x,base+47,cy,material('#eee0b0'));q.box(2,7,2,x,base+44,cy,gold);}
 q.finish();
 const fill=new THREE.PointLight('#ffe2b2',.6,200,1);fill.position.set(cx,base+37,cy);g.add(fill);
 const positions=[[b.x+46,b.y+30],[b.x+b.w-43,b.y+35],[b.x+42,b.y+b.h-29],[b.x+b.w-39,b.y+b.h-31],[cx+18,cy+23]];
 guests=positions.map(([x,y],i)=>{const m=guest(i);m.position.set(x,base+1,y);m.rotation.y=i%2?-.6:.9;g.add(m);return m;});
 ronnie.x=cx;ronnie.y=b.y+34;
 const dog=germanShepherd();dog.position.set(cx-20,base+1,b.y+40);dog.rotation.y=-Math.PI/2+.35;g.add(dog);
 penthouse.dog=dog;penthouse.furniture.push({x:cx-26,y:b.y+35,w:12,h:10});
}
// Ronniebaby's German Shepherd: tan body, black saddle and muzzle, upright ears, wagging tail.
function germanShepherd(){
 const g=new THREE.Group();g.name='Ronniebaby German Shepherd';
 const tan=material('#b07a3c',.8),black=material('#1d1a17',.8),dark=material('#5a3a1e',.8),eye=material('#0b0a09',.3);
 const B=level29AnimalAnatomy.ell;
 B(g,11,4.4,4.2,0,7.4,0,tan);
 B(g,8.6,1.6,4.5,-.6,9.6,0,black);
 B(g,3.4,3.8,4,4.6,8.6,0,tan);
 for(const [x,z]of [[3.8,1.4],[3.8,-1.4],[-4,1.4],[-4,-1.4]]){B(g,1.3,5.6,1.3,x,3,z,x>0?tan:dark);B(g,1.6,.7,1.6,x+.2,.35,z,dark);}
 const head=new THREE.Group();head.position.set(6.8,11.6,0);g.add(head);
 B(head,3.4,3,3.2,0,0,0,tan);B(head,1.2,2.4,2.4,-.6,.7,0,black);
 B(head,2.8,1.6,2,2.6,-.6,0,tan);B(head,1.2,1.2,1.4,3.6,-.4,0,black);B(head,.6,.6,.8,4.2,-.1,0,eye);
 for(const z of [1.1,-1.1]){const ear=level29AnimalAnatomy.tip(head,-.4,2.6,z,.7,3,.65,black);ear.rotation.x=z>0?-.18:.18;B(head,.4,.4,.4,1.5,.5,z*1.2,eye);}
 const tail=new THREE.Group();tail.position.set(-5.4,8.6,0);g.add(tail);
 const t1=B(tail,4.6,1.3,1.3,-2,-.8,0,tan);t1.rotation.z=.55;B(tail,2.2,1.2,1.2,-4.2,-2.4,0,black).rotation.z=.9;
 for(const z of [-1.1,1.1]){B(head,.12,.12,.12,1.7,.6,z*1.25,material('#e5cf9b'));for(let k=0;k<3;k++)B(g,1.1,.15,.15,4.3,.4,z+(k-1)*.3,dark);}
 g.userData.tail=tail;g.userData.head=head;
 g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;}});
 return g;
}
// Realistic nylon plate carrier with contoured plates, MOLLE webbing, pockets and buckles.
let vestTemplate=null;
function armor(){
 if(!vestTemplate){
  const g=new THREE.Group(),q=batch(g),nylon=material('#52604b',.95),strap=material('#303b31',.97),buckle=material('#8b9181',.48,.45);
  const pts=[[0,-5],[3.8,-5],[4.2,0],[3.2,4],[1.9,5],[0,5]].map(p=>new THREE.Vector2(...p));
  const core=addMesh(g,new THREE.LatheGeometry(pts,8),nylon,0,0,0);core.scale.z=.48;
  for(const x of [-2.7,2.7]){q.box(1.5,5,1,x,5,0,strap);q.box(1.7,.9,1.3,x,4.3,1,buckle);}
  for(let row=0;row<5;row++)for(let col=0;col<5;col++)q.box(1.25,.45,.3,-3+col*1.5,-2+row*1.15,2.1,strap);
  for(const x of [-2.2,0,2.2]){q.box(1.8,3.5,1.4,x,-2.5,2.4,nylon);q.box(1.8,.55,1.5,x,-.55,2.45,strap);}
  q.box(7.5,1,1,0,-3.7,-2,strap);q.box(2.8,.9,.3,0,2.6,2.1,buckle);q.finish();vestTemplate=g;
 }
 return vestTemplate.clone(true);
}
const oldPickup=makePickup;
makePickup=function(){const g=oldPickup(),v=armor();v.visible=false;g.add(v);g.userData.plateCarrier=v;return g;};
if(kPool)kPool.make=makePickup;
const oldDynamic=syncDynamic;
syncDynamic=function(){
 oldDynamic();if(!kPool)return;
 for(const [k,m]of kPool.map||[]){const v=m.userData.plateCarrier;if(!v)continue;v.visible=k.kind==='armor';if(v.visible){m.userData.m.visible=false;if(m.userData.cashStack)m.userData.cashStack.visible=false;}}
};
const oldWorld=buildWorld;
buildWorld=function(){
 oldWorld();if(!city.world)return;
 const r=mkRng(292903);
 // One cache per region; preserve stable IDs without littering every street.
 for(let gy=0;gy<5;gy++)for(let gx=0;gx<3;gx++)for(let n=0;n<1;n++){
  for(let tries=0;tries<120;tries++){
   const x=(GULF_X+7+(MW-GULF_X-10)*(gx+r())/3)*TILE,y=(4+(MH-8)*(gy+r())/5)*TILE;
   if(solidAt(x,y)||blockedCircle(x,y,14)||[T_WATER,T_BRIDGE,T_BLD,T_ROAD].includes(tileAt(x,y)))continue;
   if(city.features.some(f=>['tower','landmark','dome'].includes(f.kind)&&contains(f,x,y,-20)))continue;
   if((city.venues||[]).some(v=>contains(v.b,x,y,-15))||world.packages.some(p=>dist(x,y,p.x,p.y)<65))continue;
   world.packages.push({x,y,id:'estate-cache-'+gy+'-'+gx+'-'+n});break;
  }
 }
};
function decorateVenues(){
 const g=new THREE.Group();g.name='career-interior-detail';cityGroup.add(g);const q=batch(g);
 const steel=material('#a2aaa5',.42,.5),dark=material('#273437'),wood=material('#846340'),paper=material('#e1d8c3'),red=material('#b34432'),green=material('#56765b'),blue=material('#36647b');
 for(const v of city.venues||[]){
  if(v.referenceLaundry||v.referenceBank||v.referenceFish||v.referenceBotanica||v.referenceDonut||v.referenceLiquor||v.referenceBonnie||v.referenceGas||v.id==='mall'||v.frontage?.angle||v.storyRole||v.kind==='snowballs'||v.id==='hospital')continue; // Rotated rooms receive local-space detail from interior-details.
  const b=v.b,levels=v.id==='hospital'?5:1;
  for(let l=0;l<levels;l++){
   const z=(v.baseY||0)+l*56,x=b.x+b.w/2,y=b.y+7;
   // Painted skirting, tiled floor joints and ceiling fixture covers.
   for(const xx of [b.x+3,b.x+b.w-3])q.box(1,3,b.h-8,xx,z+2,b.y+b.h/2,dark);
   for(let yy=b.y+24;yy<b.y+b.h-5;yy+=32)q.box(b.w-8,.06,.22,x,z+.9,yy,steel);
   const title={garage:'SERVICE / DIAGNOSTICS',armory:'LICENSED EQUIPMENT',spray:'DETAILING / FINISH BAY',business:'OPERATIONS / DISPATCH',safe:'RESIDENT LOUNGE',bank:'ACCOUNTS / SECURE DEPOSITS',grocery:'FRESH PRODUCE / CHECKOUT',gym:'STRENGTH / RECOVERY',hospital:['TRIAGE / EMERGENCY','PHARMACY / WARD','STERILE OPERATING ROOM','IMAGING / PATHOLOGY','RECOVERY WARD'][l],police:'DUTY ROSTER / EVIDENCE',gas:'FUEL / CONVENIENCE',fire:'RESCUE / EQUIPMENT'}[v.id];
   if(title&&!['business','armory'].includes(v.id))text(g,title,Math.min(120,b.w-20),9,x,z+39,y);
   if(['garage','spray'].includes(v.id)){
    for(const xx of [b.x+17,b.x+b.w-17]){q.box(12,20,19,xx,z+10,b.y+25,red);for(let k=0;k<4;k++)q.box(9,.5,.7,xx,z+4+k*4,b.y+35,steel);}
    if(v.id==='garage')for(let k=0;k<5;k++){q.box(2,6+k%2*2,1,b.x+24+k*9,z+26,b.y+3,steel);q.box(4,2,1,b.x+24+k*9,z+30,b.y+3,steel);}
    else for(const xx of [b.x+9,b.x+b.w-9]){q.box(4,35,4,xx,z+18,b.y+b.h*.45,blue);for(let k=0;k<9;k++)q.box(4,2,7,xx,z+5+k*3,b.y+b.h*.45,green);}
   }else if(v.id==='armory'){
    // Curated glass cases and wall racks are built by armory-showroom.js.
   }else if(['business','police','bank'].includes(v.id)){
    q.box(47,23,1,b.x+32,z+25,b.y+3,dark);
    for(let k=0;k<6;k++)q.box(10,6,.4,b.x+17+(k%3)*13,z+20+Math.floor(k/3)*8,b.y+4,paper);
    for(let k=0;k<4;k++){q.box(3,10,4,b.x+b.w-14-k*4,z+8,b.y+8,k%2?blue:red);}
    if(v.id==='bank'){
     const vault=addMesh(g,new THREE.CylinderGeometry(11,11,2,24),steel,b.x+b.w-22,z+19,b.y+3);vault.rotation.x=Math.PI/2;
     const wheel=addMesh(g,new THREE.TorusGeometry(4,.55,6,20),dark,b.x+b.w-22,z+19,b.y+4.5);
     for(let k=0;k<4;k++){const a=k*Math.PI/2;rod(g,[b.x+b.w-22,z+19,b.y+4.5],[b.x+b.w-22+Math.cos(a)*4,z+19+Math.sin(a)*4,b.y+4.5],.3,dark);}
    }
   }else if(['grocery','gas'].includes(v.id)){
    for(let k=0;k<4;k++){q.box(14,9,10,b.x+17+k*16,z+5,b.y+b.h-18,wood);for(let j=0;j<3;j++)q.box(3,3,3,b.x+13+k*16+j*4,z+11,b.y+b.h-18,k%2?green:red);}
    q.box(18,25,5,b.x+b.w-16,z+13,b.y+7,steel);q.box(14,19,.5,b.x+b.w-16,z+14,b.y+10,blue);
    if(v.id==='grocery')for(let k=0;k<12;k++)ball(g,1.9,1.8,1.9,b.x+12+(k%6)*5,z+12,b.y+b.h-20+Math.floor(k/6)*4,k%2?red:green);
   }else if(v.id==='hospital'){
    q.box(13,18,5,b.x+13,z+10,b.y+7,steel);q.box(2,7,1,b.x+13,z+16,b.y+10,red);q.box(7,2,1,b.x+13,z+16,b.y+10,red);
    for(let k=0;k<7;k++)q.box(6,2,2,b.x+b.w-28,z+12+k*2.5,b.y+4,k%2?green:steel);
    rod(g,[b.x+b.w-13,z+2,b.y+16],[b.x+b.w-13,z+32,b.y+16],.5,steel);
    rod(g,[b.x+b.w-18,z+31,b.y+16],[b.x+b.w-8,z+31,b.y+16],.4,steel);
    q.box(4,7,2,b.x+b.w-17,z+25,b.y+16,paper);
    q.box(10,7,2,b.x+26,z+22,b.y+4,dark);q.box(8,5,.2,b.x+26,z+22,b.y+5.2,green);
   }else if(v.id==='fire'){
    for(let k=0;k<3;k++){q.box(4,19,4,b.x+b.w-14,z+10,b.y+20+k*12,red);q.box(2,2,3,b.x+b.w-14,z+20,b.y+20+k*12,steel);}
    for(let k=0;k<8;k++){q.box(1,27,1,b.x+14+k*4,z+15,b.y+3,steel);}
    for(let k=0;k<3;k++){
     addMesh(g,new THREE.TorusGeometry(4.5,.8,7,18),paper,b.x+18+k*14,z+24,b.y+4);
     ball(g,3,1.8,3,b.x+18+k*14,z+11,b.y+8,red);
    }
   }else if(v.id==='gym'){
    q.box(b.w-20,19,.4,x,z+25,b.y+3,steel);
    for(let k=0;k<6;k++){q.box(2,6,6,b.x+13+k*8,z+8,b.y+8,dark);q.box(6,1,1,b.x+13+k*8,z+8,b.y+8,steel);}
   }else if(v.id==='safe'){
    q.box(30,6,17,b.x+23,z+3,b.y+22,green);q.box(30,11,3,b.x+23,z+8,b.y+14,green);
   }
  }
 }
 q.finish();
 window.level29BatchStatic(g,[]);
}
function buildWaterLife(){
 const g=new THREE.Group();g.name='bayou-waterlife';cityGroup.add(g);
 const fishMat=material('#5a6b52',.15,.35),belly=material('#cfc6a6',.05,.5),finMat=material('#5d6b5c',.05,.5),barbel=material('#2c2a24'),
  eyeMat=material('#0d0d0d',.5,.15),eyeRing=material('#c9b56a',.2,.4),red=material('#b8432a',.1,.38),redDk=material('#7a2a1c',.1,.4),dark=material('#3a231b',.1,.5),tip=material('#e2d0b0',.05,.5);
 const r=mkRng(29155),pier=city.pier;if(!pier)return;
 const fin=(m,pts,mat)=>{const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(const p of pts.slice(1))s.lineTo(p[0],p[1]);
  const geo=new THREE.ShapeGeometry(s);const f=addMesh(m,geo,mat,0,0,0);f.material.side=THREE.DoubleSide;return f;};
 for(let i=0;i<30;i++){
  const cat=i<12,m=new THREE.Group();m.name=cat?'Channel catfish':'Louisiana crawfish';
  if(cat){
   ball(m,4.2,1.25,2.5,3.2,.85,0,fishMat);ball(m,4.4,1.1,1.9,-1.6,.85,0,fishMat);ball(m,2.8,.8,1.1,-5.6,.85,0,fishMat);
   ball(m,4,.6,2.2,2.6,.35,0,belly);ball(m,4,.5,1.6,-1.6,.4,0,belly);
   ball(m,1.6,.55,1.9,6.6,.75,0,fishMat);
   const tl=fin(m,[[0,0],[-3.6,2.2],[-2.4,0],[-3.6,-2.2]],finMat);tl.rotation.x=-Math.PI/2;tl.position.set(-7.6,.85,0);
   const df=fin(m,[[0,0],[1.6,2.6],[2.6,0]],finMat);df.position.set(1.2,1.8,0);
   const af=fin(m,[[0,0],[3.8,0],[3.2,-.9],[.4,-.7]],finMat);af.position.set(-5.4,.5,0);
   for(const s of [-1,1]){
    const pf=fin(m,[[0,0],[2.4,0],[-1.2,s*2.8]],finMat);pf.rotation.x=-Math.PI/2;pf.position.set(4.2,.55,s*1.9);
    const vf=fin(m,[[0,0],[1.8,0],[-.8,s*1.8]],finMat);vf.rotation.x=-Math.PI/2;vf.position.set(-2.4,.45,s*1.4);
    ball(m,.42,.42,.42,6.1,1.2,s*1.45,eyeRing);ball(m,.28,.3,.3,6.35,1.25,s*1.62,eyeMat);
    rod(m,[7.6,.95,s*.9],[10.8,.55,s*3.8],.1,barbel);rod(m,[7.9,.7,s*.4],[10.6,.35,s*1.6],.08,barbel);
    rod(m,[7.3,.4,s*.6],[9.4,.2,s*1.9],.07,barbel);rod(m,[7,.35,s*.3],[8.8,.15,s*.9],.07,barbel);
   }
  }else{
   ball(m,2.4,1.05,1.45,1.1,.75,0,red);ball(m,1.3,.8,1.05,3.2,.7,0,red);
   const rost=addMesh(m,new THREE.ConeGeometry(.45,1.6,6),redDk,4.6,.75,0);rost.rotation.z=-Math.PI/2;
   for(let k=0;k<5;k++){const w=1.2-k*.13;ball(m,.62,.7-k*.06,w,-1.6-k*.95,.65-k*.04,0,k%2?red:redDk);}
   for(let k=0;k<5;k++){const a=(k-2)*.42;const p=fin(m,[[0,0],[-1.7,-.55],[-1.7,.55]],red);p.rotation.x=-Math.PI/2;p.rotation.y=a;p.position.set(-6.3,.5,0);}
   for(const s of [-1,1]){
    ball(m,.26,.26,.26,3.9,1.2,s*.55,eyeMat);
    rod(m,[4.3,.9,s*.35],[10.5,.6,s*3.2],.06,dark);rod(m,[4.3,.9,s*.2],[6.5,.8,s*.8],.06,dark);
    rod(m,[2.8,.6,s*.9],[4.6,.6,s*2.3],.32,red);rod(m,[4.6,.6,s*2.3],[6.2,.6,s*2.6],.3,red);
    ball(m,1.75,.6,.85,7.6,.6,s*2.75,red);
    ball(m,1.5,.32,.32,9.6,.6,s*2.45,redDk);ball(m,1.4,.3,.3,9.5,.6,s*3.25,red);
    ball(m,.3,.25,.25,10.9,.6,s*2.45,tip);ball(m,.28,.22,.22,10.7,.6,s*3.25,tip);
    for(let k=0;k<4;k++)rod(m,[1.6-k*.8,.5,s*1.1],[2.2-k*.9,.15,s*3],.11,k%2?red:redDk);
   }
  }
  // These shallow-water silhouettes are above the opaque map sheet, below a local water film.
  let x=pier.x0+12+r()*210,y=pier.y+(i%2?-1:1)*(75+r()*95);
  if(tileAt(x,y)!==T_WATER){x=(GULF_X-6-r()*8)*TILE;y=(30+r()*6)*TILE;}
  window.level29BatchStatic(m,[]);
  m.scale.set(cat?1.05:.62,cat?.55:.62,cat?1.05:.62);
  m.position.set(x,.9,y);m.rotation.y=r()*6.28;g.add(m);
  wildlife.push({m,cat,x,y,a:m.rotation.y,phase:r()*6.28});
 }
 const shrimpMat=material('#e0a48c',.08,.32),shrimpDk=material('#b8735e',.08,.36),
  bassMat=material('#5f7a3a',.12,.34),bassDk=material('#2f3d1e',.1,.42),bassBelly=material('#e4dcb8',.05,.45),bassFin=material('#6f7d48',.05,.5),mouth=material('#1d1a14',.05,.6),
  sharkMat=material('#6d7c88',.18,.3),sharkDk=material('#4c5862',.15,.34),sharkBelly=material('#e8ecee',.05,.4);
 const spawnAt=(deep)=>{
  let x=pier.x0+(deep?110:12)+r()*(deep?180:210),y=pier.y+(r()<.5?-1:1)*((deep?120:70)+r()*(deep?90:100));
  if(tileAt(x,y)!==T_WATER){x=(GULF_X-6-r()*8)*TILE;y=(30+r()*6)*TILE;}
  return [x,y];
 };
 const addCreature=(m,kind,scale,deep,swim)=>{
  window.level29BatchStatic(m,[]);
  const [x,y]=spawnAt(deep);m.name=kind;m.scale.setScalar(scale);m.position.set(x,.9,y);m.rotation.y=r()*6.28;g.add(m);
  wildlife.push({m,kind,x,y,a:m.rotation.y,phase:r()*6.28,...swim});
 };
 for(let i=0;i<16;i++){
  const m=new THREE.Group();
  for(let k=0;k<6;k++){const a=k*.32,w=1.05-k*.12;ball(m,.95,.85-k*.08,w,-Math.sin(a)*2.6+k*-.55,.9-Math.cos(a)*.1+k*-.05,0,k%2?shrimpDk:shrimpMat);}
  ball(m,1.9,.95,1.05,1.6,1.05,0,shrimpMat);
  const rost=addMesh(m,new THREE.ConeGeometry(.22,1.6,5),shrimpDk,3.9,1.3,0);rost.rotation.z=-Math.PI/2.4;
  for(let k=0;k<5;k++){const p=fin(m,[[0,0],[-1.3,-.4],[-1.3,.4]],shrimpMat);p.rotation.x=-Math.PI/2;p.rotation.y=(k-2)*.38;p.position.set(-5.2,.55,0);}
  for(const s of [-1,1]){
   ball(m,.22,.22,.22,3,1.45,s*.5,eyeMat);
   rod(m,[3.2,1.2,s*.3],[9.5,1.7,s*2.6],.04,shrimpDk);rod(m,[3.2,1.1,s*.2],[7.5,.9,s*1.4],.035,shrimpDk);
   for(let k=0;k<5;k++)rod(m,[1.8-k*.6,.6,s*.5],[2.1-k*.7,.1,s*1.3],.06,shrimpDk);
  }
  addCreature(m,'Gulf shrimp',.5,false,{rx:3,rz:2,sp:.02,face:true});
 }
 for(let i=0;i<8;i++){
  const m=new THREE.Group();
  ball(m,3.6,1.9,1.35,1.2,1.1,0,bassMat);ball(m,3.2,1.6,1.15,-2.4,1.05,0,bassMat);ball(m,1.6,.9,.65,-5.4,1,0,bassMat);
  ball(m,3.2,.9,1.15,.8,.35,0,bassBelly);ball(m,2.4,.7,.9,-2.6,.4,0,bassBelly);
  ball(m,1.8,1.3,1.05,4.6,1.15,0,bassMat);ball(m,1,.6,.95,5.9,.85,0,mouth);
  for(let k=0;k<5;k++)ball(m,1,.55,.2,3-k*1.85,1.2+Math.sin(k*1.7)*.2,0,bassDk);
  fin(m,[[0,0],[.8,2],[1.8,1.6],[2.6,2],[3.4,1.3],[4.2,0]],bassFin).position.set(-1.4,2.6,0);
  fin(m,[[0,0],[1,1.8],[2.6,1.4],[3,0]],bassFin).position.set(-4.4,2.3,0);
  fin(m,[[0,0],[-2.8,2.4],[-2.2,0],[-2.8,-2.4]],bassFin).position.set(-6.6,1,0);
  fin(m,[[0,0],[2,0],[1.4,-1.2]],bassFin).position.set(-4.2,.1,0);
  for(const s of [-1,1]){
   ball(m,.45,.45,.45,5,1.55,s*.85,eyeRing);ball(m,.3,.32,.32,5.2,1.6,s*1,eyeMat);
   const pf=fin(m,[[0,0],[2,0],[-1,s*2]],bassFin);pf.rotation.x=-Math.PI/2;pf.position.set(2.8,.7,s*1.2);
  }
  addCreature(m,'Largemouth bass',.8,false,{rx:11,rz:7,sp:.014,face:true});
 }
 for(let i=0;i<4;i++){
  const m=new THREE.Group();
  ball(m,7,2.4,2.6,2,1.2,0,sharkMat);ball(m,6.5,2,2.1,-5,1.1,0,sharkMat);ball(m,4,1.1,1.1,-11,1.1,0,sharkMat);
  ball(m,3.4,1.6,1.9,8.2,1.05,0,sharkMat);ball(m,1.8,.9,1.2,11,.95,0,sharkDk);
  ball(m,6.5,1.1,2.2,2,.2,0,sharkBelly);ball(m,5.5,.9,1.7,-5,.3,0,sharkBelly);ball(m,3,.7,1.5,8,.3,0,sharkBelly);
  fin(m,[[0,0],[2.4,5.2],[4.4,5.6],[5.8,0]],sharkDk).position.set(-1.2,3,0);
  fin(m,[[0,0],[.8,1.6],[1.6,0]],sharkDk).position.set(-9.6,2,0);
  fin(m,[[0,0],[-4.6,6],[-3.4,.4],[-2.4,-3.2]],sharkDk).position.set(-13.6,1.1,0);
  fin(m,[[0,0],[1.4,-1.4],[2,0]],sharkDk).position.set(-7.8,0,0);
  for(const s of [-1,1]){
   ball(m,.38,.38,.38,9.4,1.6,s*1.55,eyeMat);
   for(let k=0;k<5;k++)rod(m,[6.6-k*.7,1.9,s*1.95],[6.3-k*.7,.6,s*2.05],.07,sharkDk);
   const pf=fin(m,[[0,0],[3.4,0],[-2.6,s*5]],sharkDk);pf.rotation.x=-Math.PI/2;pf.position.set(4.6,.5,s*1.6);
  }
  addCreature(m,'Bull shark',1,true,{rx:38,rz:26,sp:.006,face:true});
 }
 // Continuous water film, rather than individual circles under each animal.
 const water=new THREE.MeshBasicMaterial({color:'#2a9cbd',transparent:true,opacity:.26,depthWrite:false});
 for(let x=pier.x0-32;x<pier.x0+288;x+=32)for(let y=pier.y-224;y<pier.y+224;y+=32){
  if(tileAt(x+16,y+16)!==T_WATER)continue;
  const m=addMesh(g,new THREE.PlaneGeometry(32,32),water,x+16,1.9,y+16);m.rotation.x=-Math.PI/2;
 }
 window.level29BatchStatic(g,wildlife.map(a=>a.m));
}
function landscape(){
 const g=new THREE.Group();g.name='waterfront-landscape';cityGroup.add(g);const q=batch(g);
 const stem=material('#73794d'),leaf=material('#3a6953'),sand=material('#a29878'),r=mkRng(29861);
 // Shoreline vegetation and stone clusters stay away from roads and access points.
 for(let i=0;i<125;i++){
  const x=(GULF_X+.1+r()*1.4)*TILE,y=(4+r()*(MH-8))*TILE;
  if(![T_SAND,T_PARK].includes(tileAt(x,y)))continue;
  for(let k=0;k<4;k++){const h=5+r()*11;q.box(.7,h,.7,x+k*1.8,h/2,y+r()*6,stem);q.box(.8,h*.6,2,x+k*1.8+1,h*.4,y,leaf,.3);}
  if(i%5===0)q.box(8+r()*5,3+r()*4,6+r()*4,x,2,y,sand,r()*3);
 }
 q.finish();
}
const oldBuild=buildCity;
buildCity=function(){oldBuild();if(!city.world)return;buildPenthouse();decorateVenues();buildWaterLife();landscape();};
const oldTH=terrainHeight;
terrainHeight=function(x,y){if(penthouse?.active&&contains(penthouse.b,x,y))return penthouse.base+1;return oldTH(x,y);};
const oldBlock=blockedCircle;
blockedCircle=function(x,y,r){
 if(penthouse?.active&&moverCtx===player){
  if(!contains(penthouse.b,x,y,r+2))return true;
  return penthouse.furniture.some(b=>hitRect(x,y,r,b));
 }
 return oldBlock(x,y,r);
};
const oldStart=placeMissionStart;
placeMissionStart=function(){oldStart();if(city?.mansion&&mission&&mpRole!=='client'){const b=city.mansion.B;ronnie.x=b.x+b.w/2;ronnie.y=b.y+34;mission.start={x:ronnie.x,y:ronnie.y};objective='Meet Ronniebaby in the mansion penthouse. Take the elevator marked U.';}};
const oldOpen=openRonnie;
let liftHintAt=-999;
openRonnie=function(tab){if(city?.mansion&&!penthouse?.active){if(frame-liftHintAt>240){liftHintAt=frame;toast('RONNIEBABY IS IN THE PENTHOUSE · USE THE MANSION ELEVATOR');}return;}oldOpen(tab);};
const oldNear=nearStation;
nearStation=function(){return penthouse?.active?null:oldNear();};
const oldRonnie=syncRonnie;
syncRonnie=function(){
 oldRonnie();
 if(penthouse?.dog&&penthouse.active){const d=penthouse.dog.userData;d.tail.rotation.y=Math.sin(frame*.25)*.6;d.head.rotation.y=Math.sin(frame*.012)*.35;}
 if(!rbMesh||!penthouse)return;
 if(!rbMesh.userData.estateBatched){
  const u=rbMesh.userData,pos=rbMesh.position.clone(),rot=rbMesh.rotation.clone(),scale=rbMesh.scale.clone(),bp=u.body.position.clone();
  rbMesh.position.set(0,0,0);rbMesh.rotation.set(0,0,0);rbMesh.scale.setScalar(1);u.body.position.set(0,0,0);
  rbMesh.updateMatrixWorld(true);
  window.level29BatchStatic(u.body,[u.armL,u.armR,u.legL,u.legR,u.helmet]);
  rbMesh.position.copy(pos);rbMesh.rotation.copy(rot);rbMesh.scale.copy(scale);u.body.position.copy(bp);u.estateBatched=true;
 }
 if(missionIdx>0&&!penthouse.active){rbMesh.visible=state!=='menu';poseFigure(rbMesh,ronnie.x,ronnie.y,0,0,'stand');rbMesh.position.y=terrainHeight(ronnie.x,ronnie.y);return;}
 const b=penthouse.b;ronnie.x=b.x+b.w/2;ronnie.y=b.y+34;
 rbMesh.visible=state!=='menu'&&penthouse.active;
 poseFigure(rbMesh,ronnie.x,ronnie.y,Math.PI/2,0,'stand');rbMesh.position.y=penthouse.base+1;
};
function useLift(){
 if(state!=='play'||!penthouse||player.dead||player.car)return;
 const p=penthouse;
 if(p.active){
  if(dist(player.x,player.y,p.exit.x,p.exit.y)>33)return;
  p.active=false;player.x=p.lift.x;player.y=p.lift.y+20;
 }else{
  if(dist(player.x,player.y,p.lift.x,p.lift.y)>55)return;
  p.active=true;player.x=p.exit.x;player.y=p.exit.y-12;
 }
 if(p.active)ronnie.cd=0;
 player.vx=player.vy=0;view.yaw=-Math.PI/2;view.pitch=0;view.lastPlayer=player;snapCamera();
 toast(p.active?'RONNIEBABY’S PENTHOUSE · PRIVATE RESIDENCE':'RONNIEBABY · PRIVATE LIFT LOBBY');
}
const liftButton=document.createElement('button');liftButton.id='penthouseLift';liftButton.textContent='U · PENTHOUSE';
liftButton.style.cssText='position:fixed;z-index:46;left:50%;transform:translateX(-50%);bottom:155px;border:1px solid #c7a74e;border-radius:8px;background:#243c32;color:#f0d692;padding:12px 18px;font:700 12px monospace;display:none;touch-action:manipulation';
document.body.appendChild(liftButton);
let liftTapAt=0;
liftButton.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();liftTapAt=performance.now();if(typeof ensureAudio==='function')ensureAudio();useLift();});
liftButton.addEventListener('click',e=>{e.stopPropagation();if(performance.now()-liftTapAt<700)return;useLift();});
const liftPrevEnterExit=enterExit;
enterExit=function(){if(liftButton.style.display!=='none'&&!player?.car){useLift();return;}liftPrevEnterExit();};
const liftStyle=document.createElement('style');liftStyle.textContent='@media(max-width:700px){#penthouseLift{top:155px!important;bottom:auto!important;}}';document.head.appendChild(liftStyle);
addEventListener('keydown',e=>{if(e.key.toLowerCase()!=='u'||e.repeat||e.target?.matches?.('input,textarea'))return;
 if(liftButton.style.display!=='none'){e.preventDefault();e.stopImmediatePropagation();useLift();}
},true);
const oldUpdate=update;
update=function(){
 oldUpdate();
 if(!player||!penthouse||state==='menu'){liftButton.style.display='none';return;}
 if(player.dead||player.car||penthouse.active&&!contains(penthouse.b,player.x,player.y))penthouse.active=false;
 const pos=penthouse.active?penthouse.exit:penthouse.lift;
 const near=state==='play'&&!player.dead&&!player.car&&dist(player.x,player.y,pos.x,pos.y)<(penthouse.active?33:55);
 liftButton.style.display=near?'block':'none';liftButton.textContent=penthouse.active?'U · RETURN TO LOBBY':'U · PENTHOUSE';
 // Hide the stock safehouse ceiling/worker while occupying the top story.
 const home=city.venues.find(v=>v.b===penthouse.b);if(home?.mesh)home.mesh.visible=!penthouse.active;
};
const oldRender=render;
render=function(){
 if(player&&penthouse){
  for(let i=0;i<guests.length;i++){const m=guests[i];m.visible=penthouse.active;m.rotation.y+=(Math.sin(frame*.008+i)*.0005);}
  const px=(player.car||player).x,py=(player.car||player).y;
  for(const a of wildlife){a.m.visible=state!=='menu'&&dist(px,py,a.x,a.y)<520;if(a.m.visible){const t=frame*(a.sp||.012)+a.phase,rx=a.rx??(a.cat?14:2),rz=a.rz??(a.cat?9:1.5);a.m.position.x=a.x+Math.sin(t)*rx;a.m.position.z=a.y+Math.cos(t*.7)*rz;
  a.m.rotation.y=a.face?Math.atan2(Math.sin(t*.7)*.7*rz,Math.cos(t)*rx):a.a+Math.sin(t)*.18;}}
 }
 oldRender();
};
window.level29Estate={version:1,vehicleTypes:vehicleData.map(a=>a[0]),get penthouse(){return penthouse;},get guests(){return guests;},get wildlife(){return wildlife;},useLift};
})();
