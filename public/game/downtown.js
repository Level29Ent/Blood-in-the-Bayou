'use strict';
// Downtown expansion: airport (3 Level 29 jets + 29s bomber gunner ride), clouds, bird hunting, dispensary,
// smoke shop, food truck, university + football stadium, Bonnie De Vette's slab dealership, the Velvet Jester
// club, the BoomCity casino floor (6 jester slots, blackjack, poker, roulette wheel, Level 29 Jackpot),
// the Natchez deck net fishing, a steamboat safe zone, and a playable confidence course. Load after boomcity.js.
(function(){
const T=TILE;
const SAVE_KEY='level29.downtown.v1';
let save={jackpot:29000,courseBest:0,birds:0,danceBest:0,bomberRuns:0,fish:0};
try{const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(s&&typeof s==='object')save=Object.assign(save,s);}catch(_){}
const persist=()=>{try{localStorage.setItem(SAVE_KEY,JSON.stringify(save));}catch(_){}};
const money=n=>'$'+Math.floor(n).toLocaleString();
const rnd=(a,b)=>a+Math.random()*(b-a);
const d2=(ax,ay,bx,by)=>Math.hypot(ax-bx,ay-by);
const isWorld=c=>!!(c&&c.world&&c.width===WORLD_SIZE);
const COL={purple:'#5b2a86',gold:'#f2c14e',green:'#2fae66'};
const BOMBER_COST=2900,BOMBER_FRAMES=29*60;
const coarse=()=>window.matchMedia&&matchMedia('(pointer: coarse)').matches;
const addJackpot=n=>{save.jackpot+=n;persist();};

CAR_SPECS.lowrider={name:'CANDY LOWRIDER',len:58,wid:24,max:6.2,acc:.13,grip:.8,hp:160,cols:['#6a1fb0','#1fa35a','#d9a520']};
CAR_SPECS.slab={name:'HOUSTON SLAB',len:62,wid:25,max:6.8,acc:.14,grip:.78,hp:180,cols:['#8a2be2','#f2c14e','#2fae66']};

// ---------------------------------------------------------------- lots on the open-world map
const LOTS=[
  {id:'airport',w:12,h:11,name:'LEVEL 29 INTERNATIONAL'},
  {id:'stadium',w:10,h:8,name:'JESTER STADIUM'},
  {id:'university',w:9,h:6,name:'BAYOU STATE UNIVERSITY'},
  {id:'dealer',w:12,h:10,name:'BONNIE DE VETTE SLAB MOTORS'},
  {id:'club',w:5,h:4,name:'THE VELVET JESTER'},
  {id:'dispensary',w:3,h:4,name:'ELEVATED MELANIN'},
  {id:'smoke',w:3,h:4,name:'CROWN SMOKE SHOP'},
  {id:'truck',w:3,h:3,name:"MAMA 29'S FOOD TRUCK"},
];
let lots={};
const okTile=t=>t===T_GRASS||t===T_PARK||t===T_LOT||t===T_SAND;
const rectHit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function findLot(c,w,h,taken){let bld=false;
  const W=c.width,H=c.height;
  const block=(c.features||[]).filter(f=>f.kind!=='forest'&&typeof f.x==='number').map(f=>({x:f.x,y:f.y,w:f.w||0,h:f.h||0}));
  if(c.safe)block.push({x:c.safe.x-4*T,y:c.safe.y-4*T,w:8*T,h:8*T});
  const fits=(x0,y0,needRoad)=>{
    for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const t=c.g[y*W+x];if(!(okTile(t)||bld&&t===T_BLD))return false;}
    const r={x:(x0-1)*T,y:(y0-1)*T,w:(w+2)*T,h:(h+2)*T};
    if(block.some(b=>rectHit(r,b)))return false;
    if(taken.some(t=>rectHit(r,{x:t.x0*T,y:t.y0*T,w:(t.x1-t.x0+1)*T,h:(t.y1-t.y0+1)*T})))return false;
    if((c.buildings||[]).some(b=>b.venue&&rectHit(r,b)))return false;
    if((c.venues||[]).some(v=>v.b&&rectHit(r,v.b)))return false;
    if(!needRoad)return true;
    for(let x=x0;x<x0+w;x++)for(let d=1;d<=3;d++){const t=c.g[(y0+h-1+d)*W+x];if(t===T_ROAD||t===T_WALK)return true;}
    return false;};
  for(const [need,b] of [[true,false],[false,false],[true,'nv'],[false,'nv']]){bld=b;for(let y=3;y+h<H-4;y++)for(let x=3;x+w<W-4;x++)if(fits(x,y,need))return {x0:x,y0:y,x1:x+w-1,y1:y+h-1};}
  return null;
}

const prevGen=genCity;
genCity=function(di){
  const c=prevGen.apply(this,arguments);lots={};if(!isWorld(c))return c;
  const W=c.width,set=(x,y,t)=>{if(x>=0&&y>=0&&x<W&&y<c.height)c.g[y*W+x]=t;};
  const taken=[];
  for(const L of [...LOTS].sort((a,b)=>(a.id==='dealer'?-1:b.id==='dealer'?1:0))){let w=L.w,h=L.h,r=null;while(!r&&w>=3&&h>=3){r=findLot(c,w,h,taken);if(!r){w--;if(h>w)h--;}}if(!r)continue;taken.push(r);lots[L.id]=Object.assign({},L,r);}
  for(const id in lots){const L=lots[id];
    for(let y=L.y0;y<=L.y1;y++)for(let x=L.x0;x<=L.x1;x++)set(x,y,T_PLAZA);
    let fb=null;
    if(id==='airport')fb={x0:L.x0,y0:L.y0,x1:L.x0+3,y1:L.y0+3};
    else if(id==='dealer')fb={x0:L.x0,y0:L.y0,x1:Math.min(L.x1,L.x0+5),y1:L.y0+2};
    else if(id!=='truck')fb={x0:L.x0,y0:L.y0,x1:L.x1,y1:L.y1-2};
    L.fb=fb;
    if(fb)for(let y=fb.y0;y<=fb.y1;y++)for(let x=fb.x0;x<=fb.x1;x++)set(x,y,T_BLD);
    L.door=fb?{x:(fb.x0+fb.x1+1)/2*T,y:(fb.y1+1)*T+24}:{x:(L.x0+1.5)*T,y:(L.y0+2.4)*T};
  }
  const rects=taken.map(t=>({x:t.x0*T,y:t.y0*T,w:(t.x1-t.x0+1)*T,h:(t.y1-t.y0+1)*T}));
  const hits=(x,y,m)=>rects.some(r=>x>r.x-m&&x<r.x+r.w+m&&y>r.y-m&&y<r.y+r.h+m);
  // Lots built over existing blocks would z-fight with them, so the old buildings under a lot are removed.
  if(c.buildings)c.buildings=c.buildings.filter(b=>{if(b.venue||!rects.some(r=>rectHit(r,b)))return true;
    for(let y=Math.floor(b.y/T);y<Math.ceil((b.y+b.h)/T);y++)for(let x=Math.floor(b.x/T);x<Math.ceil((b.x+b.w)/T);x++)if(c.g[y*W+x]===T_BLD&&!rects.some(r=>(x+.5)*T>r.x&&(x+.5)*T<r.x+r.w&&(y+.5)*T>r.y&&(y+.5)*T<r.y+r.h))set(x,y,T_LOT);
    return false;});
  c.features=c.features.filter(f=>!(f.kind==='forest'&&rects.some(r=>rectHit(r,{x:f.x,y:f.y,w:f.w||0,h:f.h||0}))));
  c.trees=c.trees.filter(t=>!hits(t.x,t.y,24));
  if(c.pineTrees)c.pineTrees=c.pineTrees.filter(t=>!hits(t.x,t.y,24));
  c.parked=c.parked.filter(p=>!hits(p.x,p.y,40));
  const h0=c.heightAt;if(typeof h0==='function')c.heightAt=(x,y)=>hits(x,y,0)?0:h0(x,y);
  if(typeof indexTrees==='function')indexTrees(c);
  const D=lots.dealer;
  if(D)D.inventory=['lowrider','slab','sedan','suv'].filter(type=>CAR_SPECS[type]).map((type,k)=>({type,price:4500+k*2000,x:(D.x0+1+k*1.9)*T,y:(D.y0+5.4)*T}));
  return c;
};

// ---------------------------------------------------------------- meshes
const lam=(c,e)=>new THREE.MeshLambertMaterial({color:c,emissive:e||0});
function box(g,w,h,d,x,y,z,m){const me=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);me.position.set(x,y,z);g.add(me);return me;}
function cyl(g,r1,r2,h,x,y,z,m,seg){const me=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg||14),m);me.position.set(x,y,z);g.add(me);return me;}
function textTex(text,fg,bg,w,h){const cv=document.createElement('canvas');cv.width=w||512;cv.height=h||128;const g=cv.getContext('2d');
  g.fillStyle=bg||'#120a1e';g.fillRect(0,0,cv.width,cv.height);g.strokeStyle=fg;g.lineWidth=6;g.strokeRect(6,6,cv.width-12,cv.height-12);
  let fs=Math.floor(cv.height*.5);g.font="800 "+fs+"px 'Barlow Condensed', sans-serif";while(g.measureText(text).width>cv.width-36&&fs>12){fs-=2;g.font="800 "+fs+"px 'Barlow Condensed', sans-serif";}
  g.fillStyle=fg;g.shadowColor=fg;g.shadowBlur=18;g.textAlign='center';g.textBaseline='middle';g.fillText(text,cv.width/2,cv.height/2+2);
  const t=new THREE.CanvasTexture(cv);return t;}
function sign(g,text,w,h,x,y,z,fg,bg,rotY){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:textTex(text,fg,bg),side:THREE.DoubleSide}));m.position.set(x,y,z);if(rotY)m.rotation.y=rotY;g.add(m);return m;}
function priceLabel(g,text,x,y,z){const cv=document.createElement('canvas');cv.width=1024;cv.height=192;const c=cv.getContext('2d');c.fillStyle='#0b141b';c.fillRect(0,0,1024,192);c.strokeStyle='#f4d27a';c.lineWidth=6;c.strokeRect(4,4,1016,184);c.fillStyle='#fff5d9';c.textAlign='center';c.font='bold 54px monospace';let fs=54;while(c.measureText(text).width>980){c.font='bold '+(--fs)+'px monospace';}c.fillText(text,512,118);const map=new THREE.CanvasTexture(cv);map.encoding=THREE.sRGBEncoding;map.minFilter=THREE.LinearFilter;map.generateMipmaps=false;
 const m=new THREE.Sprite(new THREE.SpriteMaterial({map,color:'#ffffff',opacity:1,transparent:false,fog:false,toneMapped:false,depthWrite:false}));m.name='dealer-opaque-price';m.scale.set(68,12.75,1);m.position.set(x,y,z);g.add(m);return m;}
let logoTex=null;const getLogo=()=>logoTex||(logoTex=new THREE.TextureLoader().load('logo.png'));
let bonnieTex=null;const getBonnie=()=>bonnieTex||(bonnieTex=new THREE.TextureLoader().load('bonnie.png'));

function planeMesh(bomber){
  const g=new THREE.Group(),s=bomber?1.25:1,body=lam(bomber?'#69716e':'#dadfdc'),metal=lam('#78868e'),dark=lam('#202b36'),rubber=lam('#202326');
  // Lathed tapered fuselage, aligned nose-forward along +X.
  const profile=[[-45,.2],[-38,2],[-24,5],[-5,6.8],[22,6.3],[33,4.8],[41,2.2],[44,.2]];
  const fuselage=new THREE.Mesh(new THREE.LatheGeometry(profile.map(([x,r])=>new THREE.Vector2(r*s,x*s)),24),body);fuselage.rotation.z=-Math.PI/2;g.add(fuselage);
  const pane=(points,mat)=>{const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(points.flatMap(p=>p.map(v=>v*s)),3));geo.setIndex([0,1,2,0,2,3]);geo.computeVertexNormals();const m=new THREE.Mesh(geo,mat);g.add(m);return m;};
  body.side=THREE.DoubleSide;metal.side=THREE.DoubleSide;
  for(const side of [-1,1]){
    pane([[12,0,4*side],[-16,0,55*side],[-29,-1,55*side],[-13,-1,5*side]],body);
    pane([[-30,2,2*side],[-38,2,22*side],[-46,2,22*side],[-42,2,2*side]],metal);
    for(let x=-24;x<20;x+=6){const w=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),dark);w.scale.set(1.5,1.2,.35);w.position.set(x*s,2*s,side*5.9*s);g.add(w);}
    const cockpit=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),dark);cockpit.scale.set(5,2.7,2.5);cockpit.position.set(29*s,3.4*s,side*2.7*s);g.add(cockpit);
    for(const z of (bomber?[18,36]:[24])){
      const engine=cyl(g,3.3*s,3.8*s,16*s,1*s,-4*s,side*z*s,metal,16);engine.rotation.z=Math.PI/2;
      const intake=cyl(g,2.6*s,2.6*s,.6,9.4*s,-4*s,side*z*s,dark,16);intake.rotation.z=Math.PI/2;
    }
    box(g,14*s,1,2,-27*s,0,side*48*s,metal);
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),new THREE.MeshBasicMaterial({color:side<0?'#df4b40':'#4ca986'}));lamp.position.set(-23*s,0,side*55*s);g.add(lamp);
  }
  pane([[-29,3,0],[-38,23,0],[-45,23,0],[-43,2,0]],metal);
  for(const [x,z]of [[24,0],[-13,-9],[-13,9]]){
    cyl(g,.7,.7,6,x*s,-8*s,z*s,metal,8);
    const tire=cyl(g,2.7,2.7,2,x*s,-11*s,z*s,rubber,12);tire.rotation.x=Math.PI/2;
  }
  return g;}

function lowriderMesh(color){
  const g=new THREE.Group(),paint=lam(color,0x111111),chrome=lam('#e6e1d0'),goldM=lam(COL.gold,0x2a1c00),tire=lam('#111');
  box(g,58,8,22,0,9,0,paint);box(g,30,8,19.5,-3,17,0,lam(color));box(g,26,6.5,20,-3,17,0,lam('#1a1424'));
  box(g,2,3,23,29.5,7,0,chrome);box(g,2,3,23,-29.5,7,0,chrome);
  for(const x of [-18,18])for(const z of [-11,11]){
    const w=cyl(g,6,6,4,x,6,z,tire);w.rotation.x=Math.PI/2;
    const rim=cyl(g,4.2,4.2,4.4,x,6,z,goldM);rim.rotation.x=Math.PI/2;
    const poke=cyl(g,1.9,.6,10,x,6,z+Math.sign(z)*7,goldM,8);poke.rotation.x=Math.PI/2*Math.sign(z);
    for(let k=0;k<4;k++){const sp=box(g,.6,8,.6,x,6,z+Math.sign(z)*2.3,chrome);sp.rotation.z=k*Math.PI/4;}
  }
  return g;}

function bonnieMesh(){
  const g=makeFigure(false),u=g.userData;setFigureColors(g,'#7a4a2e','#14231a','#24352c','#0d0a0a');
  u.torso.scale.z*=.94;u.longHair.visible=true;u.longHair.scale.set(.95,1.15,1.02);
  const goldM=lam(COL.gold),braid=u.hair.material;
  for(let k=0;k<12;k++){
    const a=k/12*Math.PI*2;if(Math.cos(a)>.45)continue;
    const loc=new THREE.Mesh(new THREE.CylinderGeometry(.2,.28,7.5,6),braid);
    loc.position.set(Math.cos(a)*2.05,17.1,Math.sin(a)*2.05);u.body.add(loc);
  }
  const crown=new THREE.Mesh(new THREE.TorusGeometry(2.05,.16,6,20),goldM);crown.rotation.x=Math.PI/2;crown.position.set(0,20,0);u.body.add(crown);
  for(const z of [-2.05,2.05]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.45,.1,6,12),goldM);ring.position.set(.1,17.8,z);u.body.add(ring);}
  for(let k=0;k<3;k++)box(u.body,.18,.25,.25,2.4,11+k*1.2,0,goldM);
  g.rotation.y=-Math.PI/2;u.armL.rotation.z=.06;u.armR.rotation.z=-.06;
  g.name='Bonnie De Vette · human scale';g.userData.identity='bonnie';window.level29People?.identify(g,'bonnie');
  g.traverse(o=>{o.userData.noBatch=true;});return g;
}

function genericBuilding(g,L,height,color,fg,bg){
  const fb=L.fb,w=(fb.x1-fb.x0+1)*T,d=(fb.y1-fb.y0+1)*T,cx=fb.x0*T+w/2,cz=fb.y0*T+d/2;
  if(L.venue){buildVenue(L.venue);return {cx,cz,w,d};}
  box(g,w-6,height,d-6,cx,height/2,cz,lam(color));
  box(g,w,3,d,cx,height+1.5,cz,lam(bg||'#1a1a1a'));
  sign(g,L.name,Math.min(w-10,260),Math.min(36,height*.35),cx,height*.72,fb.y0*T+d-2.5,fg,bg);
  box(g,26,22,2,cx,11,fb.y0*T+d-2.6,lam('#0e0a12',0x110611));
  return {cx,cz,w,d};}

let spins=[],flyer=null,clouds=[],course=null,dealerFig=null;
function buildLots(g){
  spins=[];
  for(const id in lots){const L=lots[id];
    if(id==='airport'){
      const w=(L.x1-L.x0+1)*T;
      const run=new THREE.Mesh(new THREE.PlaneGeometry(w-T,2.6*T),lam('#2b2b30'));run.rotation.x=-Math.PI/2;run.position.set(L.x0*T+w/2+T/2,.8,(L.y1-1.5)*T);g.add(run);
      for(let k=0;k<12;k++)box(g,T*.6,.3,3,L.x0*T+T*1.4+k*(w-2*T)/12,1,(L.y1-1.5)*T,lam('#f4f1e6'));
      const fb=L.fb,hw=(fb.x1-fb.x0+1)*T,hd=(fb.y1-fb.y0+1)*T;
      if(L.venue)buildVenue(L.venue);else{const hang=cyl(g,hd/2,hd/2,hw-6,fb.x0*T+hw/2,0,fb.y0*T+hd/2,lam('#8d8c96'),20);hang.rotation.z=Math.PI/2;hang.scale.set(1,1,.9);}
      sign(g,'LEVEL 29 INTERNATIONAL',hw-14,26,fb.x0*T+hw/2,hd*.42,fb.y0*T+hd-2,COL.gold,'#24103a');
      const towerX=(L.x1+.2)*T,towerZ=(L.y0+1.5)*T;cyl(g,8,10,90,towerX,45,towerZ,lam('#d9d4c4'));cyl(g,16,14,18,towerX,99,towerZ,lam('#2a6a8a',0x062030));
      const p1=planeMesh(false);p1.position.set((L.x0+(L.x1-L.x0+1)*.5)*T,14,(L.y0+2.5)*T);p1.rotation.y=-Math.PI/2;g.add(p1);
      const pb=planeMesh(true);pb.position.set((L.x0+(L.x1-L.x0+1)*.8)*T,16,(L.y0+2.5)*T);pb.rotation.y=-Math.PI/2;g.add(pb);
      sign(g,'BOMBER RIDE '+money(BOMBER_COST)+' · 29 SEC',120,18,(L.x0+(L.x1-L.x0+1)*.8)*T,8,(L.y0+4.3)*T,'#ff6b6b','#1a0808');
      L.planes=[p1,pb];
    }
    else if(id==='stadium'){
      const fb=L.fb,w=(fb.x1-fb.x0+1)*T,d=(fb.y1-fb.y0+1)*T,cx=fb.x0*T+w/2,cz=fb.y0*T+d/2,wall=lam('#3a1f5c'),seat=lam('#c9a33a');
      box(g,w,46,10,cx,23,fb.y0*T+5,wall);box(g,w,46,10,cx,23,fb.y0*T+d-5,wall);box(g,10,46,d,fb.x0*T+5,23,cz,wall);box(g,10,46,d,fb.x0*T+w-5,23,cz,wall);
      for(let k=0;k<4;k++){box(g,w-20-k*18,4,8,cx,8+k*9,fb.y0*T+14+k*8,seat);box(g,w-20-k*18,4,8,cx,8+k*9,fb.y0*T+d-14-k*8,seat);}
      const fieldTex=(()=>{const cv=document.createElement('canvas');cv.width=512;cv.height=256;const x=cv.getContext('2d');x.fillStyle='#2f7d3b';x.fillRect(0,0,512,256);x.strokeStyle='#fff';x.lineWidth=3;for(let i=0;i<=10;i++){x.beginPath();x.moveTo(30+i*45.2,10);x.lineTo(30+i*45.2,246);x.stroke();}x.fillStyle=COL.purple;x.fillRect(0,0,30,256);x.fillRect(482,0,30,256);return new THREE.CanvasTexture(cv);})();
      const field=new THREE.Mesh(new THREE.PlaneGeometry(w-60,d-70),new THREE.MeshLambertMaterial({map:fieldTex}));field.rotation.x=-Math.PI/2;field.position.set(cx,1,cz);g.add(field);
      for(const [x,z] of [[fb.x0*T+8,fb.y0*T+8],[fb.x0*T+w-8,fb.y0*T+8],[fb.x0*T+8,fb.y0*T+d-8],[fb.x0*T+w-8,fb.y0*T+d-8]]){cyl(g,2,2.6,96,x,48,z,lam('#ccc'));box(g,16,10,4,x,98,z,lam('#fffbe0',0xfff2b0));}
      sign(g,'JESTER STADIUM · BSU',Math.min(w-20,240),34,cx,58,fb.y0*T+d+.5,COL.gold,'#24103a');
    }
    else if(id==='university'){
      const b=genericBuilding(g,L,64,'#b7a58a',COL.gold,'#3b1c5c');
      for(let k=0;k<6;k++)cyl(g,3,3,44,b.cx-b.w/2+18+k*(b.w-36)/5,22,b.cz+b.d/2+6,lam('#efe9d8'));
      const dome=new THREE.Mesh(new THREE.SphereGeometry(22,16,10,0,Math.PI*2,0,Math.PI/2),lam(COL.gold,0x221800));dome.position.set(b.cx,64,b.cz);g.add(dome);
    }
    else if(id==='dealer'){
      genericBuilding(g,L,48,'#efeae0','#ffffff','#5b2a86');
      const cols=['#6a1fb0','#c21f6a','#1f9e5a','#d9a520'];
      cols.forEach((c,k)=>{const pad=new THREE.Group();pad.position.set((L.x0+1+k*(L.x1-L.x0-1)/3)*T,0,(L.y0+5)*T);g.add(pad);
        cyl(pad,30,32,3,0,1.5,0,lam('#1a1424'));const rec=L.inventory[k],sample=rec?makeCar(0,0,0,rec.type):null;if(sample)sample.col=c;const car=sample?makeCarMesh(sample):lowriderMesh(c);car.position.set(0,3,0);car.rotation.y=Math.PI/2;pad.add(car);spins.push(car);if(rec)priceLabel(pad,CAR_SPECS[rec.type].name+' · '+money(rec.price),0,35,27);});
      const fig=bonnieMesh(),bp=window.level29Frontage?level29Frontage.lotPoint(L,{x:(L.x0+2)*T,y:(L.y0+1.2)*T}):{x:(L.x0+2)*T,y:(L.y0+1.2)*T};fig.position.set(bp.x,L.venue?.baseY||0,bp.y);g.add(fig);dealerFig=fig;
      const bb=new THREE.Mesh(new THREE.PlaneGeometry(56,32),new THREE.MeshBasicMaterial({map:getBonnie(),side:THREE.DoubleSide}));bb.position.set((L.x0+6.6)*T,62,(L.y0+.5)*T);g.add(bb);
      cyl(g,1.5,1.5,46,(L.x0+6.6)*T,23,(L.y0+.5)*T,lam('#333'));
      sign(g,'BONNIE DE VETTE · OWNER',56,9,(L.x0+6.6)*T,41,(L.y0+.5)*T+.4,COL.gold,'#14231a');
    }
    else if(id==='club'){const b=genericBuilding(g,L,40,'#160b22','#d17bff','#0b0612');
      for(const [c,y] of [[COL.green,30],[COL.gold,34]])box(g,b.w-8,1.2,1.2,b.cx,y,b.cz+b.d/2+.8,lam(c,c));}
    else if(id==='dispensary')genericBuilding(g,L,28,'#e8efe6','#2fae66','#0d2416');
    else if(id==='smoke')genericBuilding(g,L,28,'#2a2420',COL.gold,'#1a120c');
    else if(id==='truck'){if(L.venue){buildVenue(L.venue);continue;}const tx=(L.x0+1.5)*T,tz=(L.y0+1.2)*T;
      box(g,70,30,28,tx,19,tz,lam('#f2c14e'));box(g,22,22,26,tx+44,15,tz,lam(COL.purple));
      box(g,36,12,1,tx-4,22,tz+14.2,lam('#1a1424',0x110022));
      sign(g,"MAMA 29'S",56,10,tx-4,34,tz+14.6,'#5b2a86','#f2c14e');
      for(const x of [-22,22,44])for(const z of [-13,13]){const w=cyl(g,5,5,3,tx+x,4,tz+z,lam('#111'));w.rotation.x=Math.PI/2;}
      L.door={x:tx-4,y:tz+T*.9};}
  }
}

function buildCourse(g){
  course=null;const f=(city.features||[]).find(f=>f.kind==='training'&&typeof f.x==='number');if(!f)return;
  const W=f.w||300,H=f.h||300;
  const pts=[
    {x:f.x+W/2,y:f.y+H+40,type:'start'},
    {x:f.x+20,y:f.y+H-24,type:'gate',name:'SPRINT GATE'},
    {x:f.x+20,y:f.y+30,type:'hold',hold:90,name:'HURDLE DRILL'},
    {x:f.x+W/2,y:f.y+28,type:'rope',taps:8,name:'ROPE CLIMB'},
    {x:f.x+W-20,y:f.y+30,type:'hold',hold:120,name:'LOW CRAWL'},
    {x:f.x+W-20,y:f.y+H/2,type:'wall',taps:6,name:'WALL OVER'},
    {x:f.x+W/2,y:f.y+H/2,type:'balance',hold:120,name:'BALANCE BEAM'},
    {x:f.x+W/2,y:f.y+H+40,type:'finish',name:'FINISH'},
  ];
  const rings=pts.map((p,i)=>{const m=new THREE.Mesh(new THREE.TorusGeometry(15,1.6,8,24),new THREE.MeshBasicMaterial({color:i===0?COL.green:COL.purple}));m.position.set(p.x,16,p.y);g.add(m);return m;});
  const timber=lam('#806548'),steel=lam('#6c7875'),rope=lam('#bdad83');
  for(let i=1;i<pts.length-1;i++){
    const p=pts[i];sign(g,(i)+' · '+p.name,65,8,p.x,42,p.y-18,'#f3d38d','#263b34');
    if(p.type==='rope'){for(const x of [-20,20])box(g,3,52,3,p.x+x,26,p.y-12,steel);box(g,44,3,3,p.x,52,p.y-12,steel);cyl(g,.8,.8,45,p.x,27,p.y-12,rope,6);}
    else if(p.type==='wall'){box(g,40,28,3,p.x,14,p.y-15,timber);for(let y=5;y<28;y+=7)box(g,28,1,2,p.x,y,p.y-12,rope);}
    else if(p.type==='balance'){box(g,9,3,48,p.x,2,p.y,timber);for(const z of [-20,20])box(g,12,2,5,p.x,1,p.y+z,steel);}
    else if(p.name==='LOW CRAWL'){for(const x of [-20,20])box(g,2,12,35,p.x+x,6,p.y,steel);for(let z=-15;z<=15;z+=6)box(g,40,.5,1,p.x,12,p.y+z,rope);}
    else for(const x of [-22,22])box(g,2,24,2,p.x+x,12,p.y,steel);
  }
  course={f,pts,rings};
}

const prevBuild=buildCity;
buildCity=function(){const r=prevBuild.apply(this,arguments);if(!cityGroup)return r;
  if(isWorld(city))try{buildLots(cityGroup);}catch(e){console.warn('downtown lots',e);}
  try{buildCourse(cityGroup);}catch(e){console.warn('downtown course',e);}return r;};

// ---------------------------------------------------------------- sky: clouds, the flying jet, birds
function ensureSky(){
  if(!scene)return;
  if(!clouds.length){const m=new THREE.MeshLambertMaterial({color:'#ffffff',transparent:true,opacity:.82});
    for(let i=0;i<26;i++){const c=new THREE.Group();const n=3+Math.floor(Math.random()*3);for(let k=0;k<n;k++){const s=new THREE.Mesh(new THREE.SphereGeometry(rnd(26,46),10,8),m);s.position.set(k*34-n*17,rnd(-6,8),rnd(-14,14));s.scale.y=.6;c.add(s);}
      c.name='weather-cloud';c.userData.v=rnd(.15,.45);c.position.set(player.x+rnd(-1300,1300),rnd(300,420),player.y+rnd(-1300,1300));clouds.push(c);}}
  for(const c of clouds)if(!c.parent)scene.add(c);
  if(!flyer){flyer=planeMesh(false);flyer.userData.a=0;}
  if(isWorld(city)&&!flyer.parent)scene.add(flyer);
  if(!isWorld(city)&&flyer.parent)flyer.parent.remove(flyer);
}
let birds=[];
function birdMesh(){
 const g=new THREE.Group(),m=lam('#6c7374'),dark=lam('#252b29'),pale=lam('#d7d5c9'),a=level29AnimalAnatomy;
 a.ell(g,6,2.6,2.8,0,0,0,m);a.ell(g,2.4,2.2,2.1,2.8,.8,0,m);
 const beak=a.tip(g,4.3,.6,0,.35,1.6,.3,lam('#c6a85b'));beak.rotation.z=-Math.PI/2;
 for(const side of [-1,1]){a.ell(g,.3,.3,.25,3.1,1.1,side*.94,dark);a.ell(g,.13,.13,.1,3.15,1.16,side*1.05,pale);}
 const wings=[];for(const side of [-1,1]){const w=new THREE.Group();w.position.z=side;g.add(w);a.ell(w,3,.5,8,-.4,0,side*3,m);for(let i=0;i<4;i++)a.ell(w,2,.22,2,-1+i*.5,-.1,side*(5+i*.15),dark);wings.push(w);}
 a.ell(g,3,.35,2.8,-3.6,-.1,0,dark);g.userData.w=wings;return g;
}
function updateBirds(){
  if(!scene||!player)return;
  while(birds.length<10){const a=Math.random()*6.28,r=rnd(250,650);const b={x:player.x+Math.cos(a)*r,y:player.y+Math.sin(a)*r,h:rnd(42,80),a:Math.random()*6.28,v:rnd(1.6,2.6),alive:true,fall:0,mesh:birdMesh()};scene.add(b.mesh);birds.push(b);}
  for(const b of birds){
    if(b.alive){b.a+=rnd(-.03,.03);b.x+=Math.cos(b.a)*b.v;b.y+=Math.sin(b.a)*b.v;const fl=Math.sin(frame*.4+b.x)*.7;b.mesh.userData.w[0].rotation.x=fl;b.mesh.userData.w[1].rotation.x=-fl;
      for(const bl of bullets){if(d2(bl.x,bl.y,b.x,b.y)<20){b.alive=false;bl.life=0;cash+=29;save.birds++;persist();sfx('cash');toast('BIRD DOWN · +$29 · '+save.birds+' BAGGED');break;}}}
    else{b.h-=2.4;b.fall++;b.mesh.rotation.z+=.3;}
    b.mesh.position.set(b.x,b.h,b.y);b.mesh.rotation.y=-b.a;
  }
  birds=birds.filter(b=>{const keep=(b.alive||b.h>0)&&d2(b.x,b.y,player.x,player.y)<1100;if(!keep&&b.mesh.parent)b.mesh.parent.remove(b.mesh);return keep;});
}
function updateSky(){
  for(const c of clouds){c.position.x+=c.userData.v;const dx=c.position.x-player.x,dz=c.position.z-player.y;
    if(Math.abs(dx)>1400)c.position.x=player.x-Math.sign(dx)*1350;if(Math.abs(dz)>1400)c.position.z=player.y-Math.sign(dz)*1350;}
  if(flyer&&flyer.parent){const a=(flyer.userData.a+=.0025),R=WORLD*.33,cx=WORLD/2,cy=WORLD/2;
    flyer.position.set(cx+Math.cos(a)*R,240,cy+Math.sin(a)*R);flyer.rotation.set(0,-(a+Math.PI/2),0);flyer.rotateX(-.25);}
  for(const s of spins)s.rotation.y+=.006;
}

// ---------------------------------------------------------------- steamboat safe zone
const dockSafe=(x,y)=>{const B=window.boomCity;if(!B||!isWorld(city))return false;return d2(x,y,B.DOCK.x,B.DOCK.y)<600||d2(x,y,B.CAPTAIN.x,B.CAPTAIN.y)<500;};
function updateSafeZone(){
  if(!player||ride||!dockSafe(player.x,player.y))return;
  const push=o=>{if(!o||typeof o.x!=='number')return;const d=d2(o.x,o.y,player.x,player.y);if(d<520){const k=(520-d)/520*4+1;o.x+=(o.x-player.x)/(d||1)*k;o.y+=(o.y-player.y)/(d||1)*k;o.alert=false;if('atkCd' in o)o.atkCd=Math.max(o.atkCd,30);}};
  for(const z of zombies)if(z.alive)push(z);
  try{if(typeof gators!=='undefined'&&Array.isArray(gators))for(const g of gators)push(g);}catch(_){}
}
try{const prevHurt=hurtPlayer;hurtPlayer=function(){if(ride||(player&&dockSafe(player.x,player.y)))return;return prevHurt.apply(this,arguments);};}catch(e){console.warn('downtown hurt hook',e);}

// ---------------------------------------------------------------- bomber gunner ride
let ride=null,fireHeld=false,tracers=[];
function startBomber(missionFlight=false){
  if(mpRole)return toast('BOMBER RIDE IS AVAILABLE IN SOLO PLAY');if(ride)return;if(!lots.airport)return toast('NO AIRPORT ON THIS MAP');if(player.car)return toast('STEP OUT OF YOUR VEHICLE FIRST');
  if(!missionFlight&&cash<BOMBER_COST)return toast('THE BOMBER RIDE COSTS '+money(BOMBER_COST));
  if(!missionFlight)cash-=BOMBER_COST;sfx('cash');save.bomberRuns++;persist();closePanel();
  const L=lots.airport,m=planeMesh(true);scene.add(m);
  ride={t:BOMBER_FRAMES,a:0,cx:(L.x0+6)*T,cy:(L.y0+5)*T,home:{x:player.x,y:player.y},kills:0,cd:0,mesh:m};
  ride.homeView={yaw:view.yaw,pitch:view.pitch};ride.startYaw=view.yaw;ride.startPitch=view.pitch;view.lastPlayer=player;
  ride.radius=level29Gunnery.ORBIT_RADIUS;const center=level29Gunnery.orbitCenter(ride.cx,ride.cy,MW*T,MH*T,ride.radius);ride.cx=center.x;ride.cy=center.y;
  ride.remainingMs=(missionFlight?60:level29Gunnery.DURATION_SECONDS)*1000;ride.t=Math.ceil(ride.remainingMs*.06);ride.lastUpdate=performance.now();
  ride.altitude=level29AircraftFlight.altitude(city,ride.cx,ride.cy,ride.radius);
  ride.mesh.position.set(ride.cx+ride.radius,ride.altitude,ride.cy);
  toast('GUNNER SEAT · HOLD FIRE ON THE .50 CAL');
}
function updateRide(){
  if(!ride)return;
  if(state==='shop'){try{if(typeof closeShop==='function')closeShop();}catch(_){}try{closePanel();}catch(_){}document.querySelectorAll('.panel,.overlay,#shop').forEach(e=>{if(e.style)e.style.display='none';});state='play';}
  const now=performance.now(),elapsed=Math.max(0,now-ride.lastUpdate);ride.lastUpdate=now;
  if(state!=='play')return;
  ride.remainingMs=Math.max(0,ride.remainingMs-elapsed);ride.t=Math.ceil(ride.remainingMs*.06);
  const R=ride.radius;ride.a+=elapsed*.000318;
  const px=ride.cx+Math.cos(ride.a)*R,py=ride.cy+Math.sin(ride.a)*R;
  player.x=px;player.y=py;if('vx' in player){player.vx=0;player.vy=0;}
  ride.mesh.position.set(px,ride.altitude,py);ride.mesh.rotation.set(0,-(ride.a+Math.PI/2),0);ride.mesh.rotateX(.35);
  if(frame%18===0&&zombiesNear(px,py,520)<16){const a=Math.random()*6.28,r=rnd(120,420);spawnZombieAt(px+Math.cos(a)*r,py+Math.sin(a)*r);}
  const firing=fireHeld||mouse.down||keys[' ']||keys.Space||gp.fire||touch.shoot;
  if(firing&&--ride.cd<=0){ride.cd=6;fireBomber();sfx('bang');}
  if(ride.t<=0)endRide();
}
function fireBomber(){
  level29AircraftCamera.pose(ride);
  const origin=camera.position.clone(),direction=new THREE.Vector3();camera.getWorldDirection(direction);
  const ray=new THREE.Raycaster(origin,direction,0,level29Gunnery.MAX_RANGE),candidates=[];
  const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
  // Only rendered, alive zombies can be hit. Do not award kills for offscreen,
  // culled or hidden NPCs; exact mesh intersections must lie on the center ray.
  const cull=isNight()?470:600,fog=scene.fog?.far||level29Gunnery.MAX_RANGE;
  for(const z of zombies){const m=zPool?.map.get(z);if(!z.alive||!m||!m.parent||!visible(m)||d2(z.x,z.y,player.x,player.y)>cull)continue;
    m.updateWorldMatrix(true,true);const hit=ray.intersectObject(m,true).find(h=>visible(h.object));
    if(hit&&hit.distance<fog*.9)candidates.push({target:z,visible:true,alive:true,distance:hit.distance});
  }
  const obstacles=[],box=(x,y,z,w,h,d)=>obstacles.push({min:{x,y,z},max:{x:x+w,y:y+h,z:z+d}});
  for(const b of city.buildings){const v=city.venues.find(v=>v.b===b),h=b===city.residence?.b?1050:v?.id==='hospital'?300:v?Math.max(52,b.H||52):Math.max(30,(b.H||42)*2.4);box(b.x,b.baseY||0,b.y,b.w,h,b.h);}
  for(const t of city.trees||[])box(t.x-8,0,t.y-8,16,t.H||55,16);
  for(const r of city.rocks||[])box(r.x-r.r,0,r.y-r.r,r.r*2,r.r*2,r.r*2);
  for(const c of cars)if(!c.dead)box(c.x-c.spec.len/2,city.heightAt?.(c.x,c.y)||0,c.y-c.spec.wid/2,c.spec.len,c.boat?30:18,c.spec.wid);
  const shot=level29Gunnery.firstHit(origin,direction,candidates,obstacles,(x,z)=>city.heightAt?city.heightAt(x,z):0);
  const muzzle=origin.clone().add(new THREE.Vector3(.8,-.7,-2).applyQuaternion(camera.quaternion));
  addTracer(muzzle,shot.point);
  if(shot.target){const z=shot.target;z.killSource='player';z.lastHit=0;z.hp-=level29Gunnery.DAMAGE;z.flash=4;z.alert=true;
    if(z.hp<=0){killZombie(z,direction.x*8,direction.z*8);if(!z.alive)ride.kills++;}
  }
}
function addTracer(origin,point){const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(origin.x,origin.y,origin.z),new THREE.Vector3(point.x,point.y,point.z)]);const l=new THREE.Line(geo,new THREE.LineBasicMaterial({color:'#ffd36b'}));scene.add(l);tracers.push({l,t:6});}
function updateTracers(){tracers=tracers.filter(t=>{if(--t.t<=0){scene.remove(t.l);t.l.geometry.dispose();t.l.material.dispose();return false;}return true;});}
function endRide(){const r=ride;ride=null;fireHeld=false;scene.remove(r.mesh);player.x=r.home.x;player.y=r.home.y;player.vx=player.vy=0;mouse.down=false;keys[' ']=keys.Space=false;view.yaw=r.homeView.yaw;view.pitch=r.homeView.pitch;snapCamera();const bounty=r.kills*15;cash+=bounty;
  toast('LANDED · '+r.kills+' ZOMBIES FROM THE SKY · BOUNTY '+money(bounty));sfx('cash');}

// ---------------------------------------------------------------- obstacle course
let run=null;
function startCourse(){if(run)return;if(player.car)return toast('THE COURSE IS ON FOOT');run={i:1,t0:frame,taps:0,hold:0};setRing();toast('GO! RUN THROUGH THE GOLD RINGS');}
function setRing(){if(!course)return;course.rings.forEach((m,i)=>m.material.color.set(run&&i===run.i?COL.gold:i===0||i===course.pts.length-1?COL.green:COL.purple));}
function updateCourse(){
  if(!run||!course)return;const p=course.pts[run.i];
  if(player.car||player.dead||frame-run.t0>150*60){run=null;setRing();return toast('COURSE FAILED · TRY AGAIN AT THE START');}
  if(p.type==='hold'||p.type==='balance'){
    const close=d2(player.x,player.y,p.x,p.y)<(p.type==='balance'?26:30),balanced=p.type!=='balance'||Math.abs(player.x-p.x)<7;
    run.hold=close&&balanced?(run.hold||0)+1:0;
    if(run.hold>=p.hold){run.i++;run.hold=0;sfx('cash');setRing();toast('DRILL CLEARED · '+course.pts[run.i].name);}
  }
  if((p.type==='gate'||p.type==='finish')&&d2(player.x,player.y,p.x,p.y)<34){
    if(p.type==='finish')return finishCourse();run.i++;run.taps=0;sfx('cash');setRing();toast((course.pts[run.i].name||'NEXT'));}
  course.rings[run.i]&&(course.rings[run.i].rotation.y+=.05);
}
function climbTap(){if(!run||!course||state!=='play'||player.car||player.dead)return;const p=course.pts[run.i];if(!p.taps||d2(player.x,player.y,p.x,p.y)>46||frame-(run.lastTap??-100)<10)return;run.lastTap=frame;run.taps++;if(run.taps>=p.taps){run.i++;run.taps=0;sfx('cash');setRing();toast(p.name+' CLEARED');}}
function finishCourse(){const secs=(frame-run.t0)/60;run=null;setRing();
  const medal=secs<45?'GOLD':secs<65?'SILVER':'BRONZE',pay={GOLD:1500,SILVER:900,BRONZE:400}[medal];
  const record=!save.courseBest||secs<save.courseBest;if(record){save.courseBest=secs;persist();}
  cash+=pay+(record?500:0);sfx('cash');toast(medal+' · '+secs.toFixed(1)+'s · '+money(pay+(record?500:0))+(record?' · NEW RECORD':''));}

// ---------------------------------------------------------------- interaction spots
function spots(){
  const out=[];const add=(p,label,act)=>{if(p){const l=Object.values(lots).find(l=>l.venue&&p.x>=l.venue.b.x&&p.x<=l.venue.b.x+l.venue.b.w&&p.y>=l.venue.b.y&&p.y<=l.venue.b.y+l.venue.b.h);const casino=city.casinoVenue,f=casino?.frontage;const q=l&&window.level29Frontage?level29Frontage.lotPoint(l,p):f&&window.level29Frontage&&p.x>=casino.b.x&&p.x<=casino.b.x+casino.b.w&&p.y>=casino.b.y&&p.y<=casino.b.y+casino.b.h?level29Frontage.lotPoint({venue:casino},p):p;out.push({x:q.x,y:q.y,label,act});}};
  for(const id in lots){const L=lots[id];
    if(id==='airport'){add({x:(L.fb.x0+L.fb.x1+1)/2*T,y:(L.fb.y0+1.2)*T},'AIRPORT TERMINAL',()=>openPanel(airportPanel));add({x:(L.x0+(L.x1-L.x0+1)*.8)*T,y:(L.y0+4.6)*T},'BOMBER GUNNER RIDE · '+money(BOMBER_COST),()=>openPanel(airportPanel));}
    if(id==='stadium')add(L.door,'JESTER STADIUM · KICK FIELD GOALS',()=>openPanel(kickPanel()));
    if(id==='university')add({x:(L.fb.x0+L.fb.x1+1)/2*T,y:(L.fb.y0+1.5)*T},'BAYOU STATE UNIVERSITY · CLASS',()=>openPanel(quizPanel()));
    if(id==='dealer')add({x:(L.x0+2)*T,y:(L.y0+1.2)*T},'TALK TO BONNIE DE VETTE',()=>openPanel(bonniePanel));
    if(id==='club')add({x:(L.fb.x0+L.fb.x1+1)/2*T,y:(L.fb.y0+1.5)*T},'DANCE AT THE VELVET JESTER',()=>openPanel(clubPanel));
    if(id==='dispensary')add(L.door,'ELEVATED MELANIN',()=>openPanel(shopPanel('dispensary')));
    if(id==='smoke')add(L.door,'CROWN SMOKE SHOP',()=>openPanel(shopPanel('smoke')));
    if(id==='truck')add(L.door,"FELICIA'S SNOWBALL TRAILER · WALK INSIDE",()=>window.level29Felicia?.open());}
  const B=window.boomCity;
  if(B&&isWorld(city)){for(const [i,p]of (city.casinoStations||[]).entries())add(p,['PLAY SLOT MACHINE','PLAY BLACKJACK','PLAY POKER','PLAY ROULETTE'][i%4],()=>{tab=['slots','bj','poker','rr'][i%4];openPanel(casinoPanel);});
    add({x:B.CAPTAIN.x+T*1.7,y:B.CAPTAIN.y},'BOARD THE NATCHEZ DECK · NET FISHING',()=>openPanel(fishPanel()));}
  if(course){if(!run)add(course.pts[0],'START CONFIDENCE COURSE'+(save.courseBest?' · BEST '+save.courseBest.toFixed(1)+'s':''),startCourse);
    else{const p=course.pts[run.i];if(p.taps)add(p,p.name+' · TAP '+run.taps+' / '+p.taps,climbTap);}}
  return out;}
let curSpot=null;
function nearestSpot(){if(!player||player.car||player.dead||ride)return null;let best=null,bd=42;for(const s of spots()){const d=d2(s.x,s.y,player.x,player.y);if(d<bd){bd=d;best=s;}}return best;}

const prevEnter=enterExit;
enterExit=function(){if(state==='play'){const s=nearestSpot();if(s){s.act();return;}}return prevEnter.apply(this,arguments);};

// ---------------------------------------------------------------- DOM: panel + buttons
const css=document.createElement('style');css.textContent=`
#l29Panel{position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(8,3,14,.82);font-family:'Barlow Condensed',system-ui,sans-serif;color:#f3eefa}
#l29Panel .bx{position:relative;width:min(94vw,780px);max-height:90vh;overflow:auto;background:#140a22;border:1px solid #f2c14e;border-radius:12px;padding:18px 18px 22px;box-shadow:0 0 40px rgba(91,42,134,.6)}
#l29Panel h2{margin:0 0 4px;font-size:30px;letter-spacing:.04em;color:#f2c14e}
#l29Panel .eb{font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#b9a6d6}
#l29Panel p{line-height:1.4;margin:8px 0}
#l29Panel .row{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0;align-items:center}
#l29Panel button{min-height:44px;padding:8px 14px;border-radius:8px;border:1px solid #f2c14e;background:#5b2a86;color:#fff;font:700 17px 'Barlow Condensed',sans-serif;letter-spacing:.04em;cursor:pointer;touch-action:manipulation}
#l29Panel button.on{background:#f2c14e;color:#1a0c26}#l29Panel button.g{background:#1f7a46}#l29Panel button:disabled{opacity:.4;cursor:not-allowed}
#l29Panel .x{position:absolute;top:8px;right:8px;min-height:36px;padding:4px 12px;background:#2a1640}
#l29Panel .wal{font-size:20px;color:#7dffb0;margin:2px 0 8px}
#l29Panel .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
#l29Panel .card{border:1px solid #4a2f6a;border-radius:10px;padding:10px;background:#1c1030}
#l29Panel .reels{display:flex;gap:8px;justify-content:center;margin:12px 0}
#l29Panel .reel{width:96px;height:72px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:#0c0616;border:2px solid #f2c14e;font-weight:800;font-size:20px}
#l29Panel .pc{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;width:54px;height:76px;border-radius:8px;background:#fbf7ee;color:#111;font-weight:800;font-size:22px;margin:3px}
#l29Panel .pc.red{color:#c0182c}#l29Panel .pc.held{outline:3px solid #2fae66;transform:translateY(-6px)}
#l29Panel .meter{position:relative;height:30px;border-radius:15px;background:#0c0616;border:1px solid #6d4c92;overflow:hidden;margin:12px 0}
#l29Panel .zone{position:absolute;top:0;bottom:0;background:rgba(47,174,102,.55)}
#l29Panel .nd{position:absolute;top:-2px;bottom:-2px;width:6px;margin-left:-3px;background:#f2c14e;box-shadow:0 0 10px #f2c14e}
#l29Panel .jp{font-size:26px;color:#f2c14e;text-shadow:0 0 14px rgba(242,193,78,.8)}
#l29Panel.club .bx{background:radial-gradient(circle at 20% 10%,rgba(47,174,102,.35),transparent 40%),radial-gradient(circle at 80% 15%,rgba(242,193,78,.35),transparent 40%),linear-gradient(#24063d,#12021f);animation:l29lights 2.4s ease-in-out infinite alternate}
@keyframes l29lights{from{box-shadow:0 0 30px #2fae66}to{box-shadow:0 0 50px #f2c14e}}
#l29Panel .pole{border:1px solid #6d4c92;border-radius:10px;padding:10px;text-align:center;background:rgba(10,2,20,.6)}
#l29Panel .pole .bar{width:6px;height:70px;margin:0 auto 6px;background:linear-gradient(#fff,#bbb);border-radius:3px}
#l29Panel .dancer{width:34px;height:34px;border-radius:50%;margin:-60px auto 30px;animation:l29sway 1s ease-in-out infinite alternate}
@keyframes l29sway{from{transform:translateX(-10px)}to{transform:translateX(10px)}}
#l29Panel .arrow{font-size:64px;line-height:1;color:#f2c14e;text-align:center}
#l29Panel .vinyl{width:48px;height:48px;border-radius:50%;background:repeating-radial-gradient(#111 0 3px,#2a2a2a 3px 5px);border:3px solid #5b2a86;animation:l29spin 1.2s linear infinite}
@keyframes l29spin{to{transform:rotate(360deg)}}
#l29Use,#l29Fire{position:fixed;z-index:40;display:none;border:2px solid #f2c14e;color:#fff;font:800 16px 'Barlow Condensed',sans-serif;border-radius:999px;touch-action:none}
#l29Use{right:18px;bottom:190px;min-height:56px;padding:0 20px;background:#5b2a86}
#l29Fire{right:24px;bottom:120px;width:96px;height:96px;background:#a3172a}
`;document.head.appendChild(css);
const panel=document.createElement('div');panel.id='l29Panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');document.body.appendChild(panel);
const useBtn=document.createElement('button');useBtn.id='l29Use';useBtn.type='button';document.body.appendChild(useBtn);
useBtn.addEventListener('click',e=>{e.preventDefault();const s=nearestSpot();if(s&&state==='play')s.act();});
const fireBtn=document.createElement('button');fireBtn.id='l29Fire';fireBtn.type='button';fireBtn.textContent='FIRE .50';fireBtn.setAttribute('aria-label','Hold to fire the 50 caliber gun');document.body.appendChild(fireBtn);
fireBtn.addEventListener('pointerdown',e=>{e.preventDefault();fireHeld=true;});
for(const ev of ['pointerup','pointercancel','pointerleave'])fireBtn.addEventListener(ev,()=>{fireHeld=false;});

let cur=null,anim=0;
function openPanel(p){cur=p;state='shop';mouse.down=false;for(const k in keys)keys[k]=false;if(player&&player.car)player.car.v=0;panel.style.display='flex';draw();useBtn.style.display='none';}
function closePanel(){if(cur&&cur.close)cur.close();cur=null;cancelAnimationFrame(anim);panel.style.display='none';if(state==='shop')state='play';}
function draw(){if(!cur)return;panel.className=cur.theme||'';panel.innerHTML='<div class="bx"><button class="x" data-a="close" aria-label="Close">CLOSE</button>'+cur.render()+'</div>';}
panel.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||!cur||b.disabled)return;const a=b.dataset.a;if(a==='close')return closePanel();cur.act(a,b.dataset.v);if(cur)draw();});
panel.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-f]');if(!b||!cur||!cur.fast)return;e.preventDefault();cur.fast(b.dataset.f);});
window.addEventListener('keydown',e=>{if(!cur)return;if(e.key==='Escape'){closePanel();return;}
  const map={ArrowLeft:'L',ArrowUp:'U',ArrowRight:'R',ArrowDown:'D',' ':'go'};const k=map[e.key];if(k&&cur.fast){e.preventDefault();e.stopPropagation();cur.fast(k);}},true);
const wallet=()=>'<p class="wal">WALLET '+money(cash)+'</p>';
const BETS=[25,100,500,2900];
let bet=100;
const betRow=lock=>'<div class="row"><span>BET</span>'+BETS.map(b=>'<button data-a="bet" data-v="'+b+'" class="'+(b===bet?'on':'')+'" '+(lock?'disabled':'')+'>'+money(b)+'</button>').join('')+'</div>';
function meterLoop(cb){const t0=performance.now();const step=t=>{if(!cur)return;const v=cb((t-t0)/1000);const n=document.getElementById('l29nd');if(n)n.style.left=v+'%';anim=requestAnimationFrame(step);};anim=requestAnimationFrame(step);}

// ---------------------------------------------------------------- casino floor
const SLOTS=[
  {n:'JESTER KING',c:'#5b2a86'},{n:'MARDI GOLD',c:'#b8860b'},{n:'BAYOU JOKER',c:'#1f7a46'},
  {n:'PURPLE REIGN',c:'#7a2fb8'},{n:'LEVEL 29 CROWN',c:'#a3172a'},{n:'NOLA NIGHTS',c:'#1d3d7a'}];
const SYM=[['JESTER',1],['29',2],['CROWN',3],['MASK',4],['BEADS',5],['FLEUR',5]];
const PAY={'29':29,CROWN:20,MASK:14,BEADS:9,FLEUR:8};
const pick=()=>{let r=Math.random()*20;for(const [s,w] of SYM){if((r-=w)<0)return s;}return 'FLEUR';};
let tab='slots',machine=0,reels=['JESTER','29','CROWN'],msg='',bj=null,pk=null,rr={pick:'red',num:29,last:null,hist:[]};
const buzz=p=>{try{if(navigator.vibrate)navigator.vibrate(p);}catch(e){}};
const RED=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const rColor=n=>n===0?'green':RED.has(n)?'red':'black';
const RBETS=[['red','Red',2],['black','Black',2],['green','Green 0',36],['odd','Odd',2],['even','Even',2],['low','1-18',2],['high','19-36',2],['num','Number',36]];
const rWins=(p,n,num)=>p==='red'||p==='black'||p==='green'?rColor(n)===p:n===0?false:p==='odd'?n%2===1:p==='even'?n%2===0:p==='low'?n<=18:p==='high'?n>=19:p==='num'?n===num:false;
function slotSpin(){if(cash<bet){msg='Not enough cash.';return;}cash-=bet;addJackpot(Math.round(bet*.029));const r=[pick(),pick(),pick()];reels=r;
  const j=r.filter(s=>s==='JESTER').length;let ret=0;
  if(j===3){ret=Math.round(save.jackpot*Math.min(1,bet/2900));save.jackpot=Math.max(29000,save.jackpot-ret);persist();msg='LEVEL 29 JACKPOT! '+money(ret);}
  else if(r[0]===r[1]&&r[1]===r[2]){ret=bet*PAY[r[0]];msg='THREE '+r[0]+' · WIN '+money(ret);}
  else if(j===2){ret=bet*5;msg='TWO JESTERS · '+money(ret);}
  else if(j===1){ret=Math.round(bet*1.5);msg='JESTER · '+money(ret);}
  else msg='No win. Spin again.';
  if(ret){cash+=ret;sfx('cash');buzz(j===3?[100,50,100,50,300]:50);}}
const rankL=r=>({1:'A',11:'J',12:'Q',13:'K',14:'A'}[r]||String(r));
const SUITS=['\u2660','\u2665','\u2666','\u2663'];
const cardHtml=(c,extra)=>'<span class="pc '+(c.s===1||c.s===2?'red ':'')+(extra||'')+'">'+rankL(c.r)+'<small>'+SUITS[c.s]+'</small></span>';
const drawCard=()=>({r:1+Math.floor(Math.random()*13),s:Math.floor(Math.random()*4)});
const bjVal=h=>{let t=0,a=0;for(const c of h){const v=c.r===1?11:Math.min(10,c.r);t+=v;if(c.r===1)a++;}while(t>21&&a--)t-=10;return t;};
function bjAct(a){
  if(a==='deal'){if(cash<bet){msg='Not enough cash.';return;}cash-=bet;bj={stake:bet,p:[drawCard(),drawCard()],d:[drawCard(),drawCard()],done:false};if(bjVal(bj.p)===21)bjSettle();return;}
  if(!bj||bj.done)return;
  if(a==='hit'){bj.p.push(drawCard());if(bjVal(bj.p)>21)bjSettle();}
  if(a==='stand')bjSettle(true);
  if(a==='double'&&bj.p.length===2&&cash>=bj.stake){cash-=bj.stake;bj.stake*=2;bj.p.push(drawCard());bjSettle(true);}}
function bjSettle(play){const p=bjVal(bj.p);if(p<=21&&play!==undefined||p===21)while(bjVal(bj.d)<17)bj.d.push(drawCard());
  const d=bjVal(bj.d);let ret=0;
  if(p>21)msg='Bust. Dealer wins.';else if(p===21&&bj.p.length===2&&!(d===21&&bj.d.length===2)){ret=bj.stake*2.5;msg='BLACKJACK! '+money(ret);}
  else if(d>21||p>d){ret=bj.stake*2;msg='You win '+money(ret);}else if(p===d){ret=bj.stake;msg='Push. Bet returned.';}else msg='Dealer wins with '+d+'.';
  if(ret){cash+=ret;sfx('cash');}bj.done=true;}
function newDeck(){const d=[];for(let s=0;s<4;s++)for(let r=2;r<=14;r++)d.push({r,s});for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]];}return d;}
function pokerEval(h){const rs=h.map(c=>c.r).sort((a,b)=>a-b),fl=h.every(c=>c.s===h[0].s),cnt={};rs.forEach(r=>cnt[r]=(cnt[r]||0)+1);
  const cv=Object.values(cnt).sort((a,b)=>b-a),uniq=new Set(rs).size===5;let st=uniq&&rs[4]-rs[0]===4;if(uniq&&rs.join()==='2,3,4,5,14')st=true;
  if(st&&fl&&rs[0]===10)return['ROYAL FLUSH',250];if(st&&fl)return['STRAIGHT FLUSH',50];if(cv[0]===4)return['FOUR OF A KIND',25];
  if(cv[0]===3&&cv[1]===2)return['FULL HOUSE',9];if(fl)return['FLUSH',6];if(st)return['STRAIGHT',4];if(cv[0]===3)return['THREE OF A KIND',3];
  if(cv[0]===2&&cv[1]===2)return['TWO PAIR',2];if(cv[0]===2&&+Object.keys(cnt).find(k=>cnt[k]===2)>=11)return['JACKS OR BETTER',1];return['NO WIN',0];}
function pkAct(a,v){
  if(a==='pdeal'){if(cash<bet){msg='Not enough cash.';return;}cash-=bet;const d=newDeck();pk={deck:d,h:d.splice(0,5),held:[0,0,0,0,0],stake:bet,done:false};msg='Tap cards to hold, then draw.';return;}
  if(!pk||pk.done)return;
  if(a==='hold'){pk.held[+v]^=1;return;}
  if(a==='draw'){pk.h=pk.h.map((c,i)=>pk.held[i]?c:pk.deck.pop());const [name,m]=pokerEval(pk.h);const ret=pk.stake*m;if(ret){cash+=ret;sfx('cash');}msg=m?name+' · '+money(ret):'No win.';pk.done=true;}}
function rrAct(a,v){
  if(a==='rpick'){rr.pick=v;return;}
  if(a==='rnum'){rr.num=Math.max(0,Math.min(36,rr.num+(+v)));return;}
  if(a==='rspin'){if(cash<bet){msg='Not enough cash.';return;}cash-=bet;
    const n=Math.floor(Math.random()*37);rr.last=n;rr.hist=[n,...rr.hist].slice(0,8);
    const mult=RBETS.find(b=>b[0]===rr.pick)[2];const label=rColor(n).toUpperCase()+' '+n;
    if(rWins(rr.pick,n,rr.num)){const ret=bet*mult;cash+=ret;msg='Ball lands on '+label+' · WIN '+money(ret);sfx('cash');buzz(mult>2?[60,40,60,40,120]:60);}
    else{msg='Ball lands on '+label+'. House wins.';addJackpot(Math.round(bet*.029));buzz(25);}}}
const casinoPanel={
  render(){
    let h='<div class="eb">BoomCity casino floor</div><h2>BoomCity</h2>'+wallet()+'<p class="jp">LEVEL 29 JACKPOT '+money(save.jackpot)+'</p>';
    h+='<div class="row">'+[['slots','Jester slots'],['bj','Blackjack'],['poker','Poker'],['rr','Roulette']].map(([k,l])=>'<button data-a="tab" data-v="'+k+'" class="'+(tab===k?'on':'')+'">'+l+'</button>').join('')+'</div>';
    if(tab==='slots'){h+='<div class="grid">'+SLOTS.map((s,i)=>'<button data-a="mach" data-v="'+i+'" class="'+(machine===i?'on':'')+'" style="'+(machine===i?'':'background:'+s.c)+'">'+s.n+'</button>').join('')+'</div>';
      h+='<div class="reels">'+reels.map(r=>'<div class="reel" style="color:'+(r==='JESTER'?'#f2c14e':r==='29'?'#ff6b8a':'#e9dcff')+'">'+r+'</div>').join('')+'</div>';
      h+=betRow()+'<div class="row" style="justify-content:center"><button class="g" data-a="spin" '+(cash<bet?'disabled':'')+'>SPIN '+SLOTS[machine].n+' · '+money(bet)+'</button></div>';
      h+='<p>3 JESTERS wins the Level 29 Jackpot (full jackpot at a '+money(2900)+' bet). 3 of a kind pays 29x / 20x / 14x / 9x / 8x. Two jesters pay 5x, one pays 1.5x.</p>';}
    if(tab==='bj'){const live=bj&&!bj.done;
      if(bj)h+='<p>Dealer ('+(live?'?':bjVal(bj.d))+')</p><div>'+bj.d.map((c,i)=>live&&i===1?'<span class="pc">?</span>':cardHtml(c)).join('')+'</div><p>You ('+bjVal(bj.p)+')</p><div>'+bj.p.map(c=>cardHtml(c)).join('')+'</div>';
      h+=betRow(live)+'<div class="row">'+(live?'<button data-a="hit">Hit</button><button data-a="stand">Stand</button><button data-a="double" '+(bj.p.length!==2||cash<bj.stake?'disabled':'')+'>Double</button>':'<button class="g" data-a="deal" '+(cash<bet?'disabled':'')+'>Deal · '+money(bet)+'</button>')+'</div>';}
    if(tab==='poker'){const live=pk&&!pk.done;
      if(pk)h+='<div>'+pk.h.map((c,i)=>live?'<button data-a="hold" data-v="'+i+'" style="background:none;border:none;padding:0">'+cardHtml(c,pk.held[i]?'held':'')+'</button>':cardHtml(c)).join('')+'</div>';
      h+=betRow(live)+'<div class="row">'+(live?'<button class="g" data-a="draw">Draw</button>':'<button class="g" data-a="pdeal" '+(cash<bet?'disabled':'')+'>Deal · '+money(bet)+'</button>')+'</div>';
      h+='<p>Jacks or Better: Royal 250x · Straight flush 50x · Quads 25x · Full house 9x · Flush 6x · Straight 4x · Trips 3x · Two pair 2x · Jacks+ 1x.</p>';}
    if(tab==='rr'){const bg={red:'#c0182c',black:'#16131a',green:'#1f8a4c'};
      const ball=n=>'<span style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;margin:2px;font-weight:700;color:#fff;border:2px solid #f2c14e;background:'+bg[rColor(n)]+'">'+n+'</span>';
      h+='<p>Single-zero wheel. Pick where the ball lands: red, black or green 0, odd or even, low or high, or one exact number.</p>';
      if(rr.last!==null)h+='<div class="row" style="justify-content:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:72px;height:72px;border-radius:50%;font-size:30px;font-weight:800;color:#fff;border:4px solid #f2c14e;background:'+bg[rColor(rr.last)]+'">'+rr.last+'</span></div>';
      if(rr.hist.length)h+='<div class="row" style="justify-content:center"><span>LAST</span>'+rr.hist.map(ball).join('')+'</div>';
      h+='<div class="row">'+RBETS.map(([k,l,m])=>'<button data-a="rpick" data-v="'+k+'" class="'+(rr.pick===k?'on':'')+'" style="'+(rr.pick===k?'':(bg[k]?'background:'+bg[k]:''))+'">'+l+' · '+(m-1)+':1</button>').join('')+'</div>';
      if(rr.pick==='num')h+='<div class="row" style="justify-content:center"><button data-a="rnum" data-v="-1" aria-label="Lower number">-</button>'+ball(rr.num)+'<button data-a="rnum" data-v="1" aria-label="Higher number">+</button></div>';
      h+=betRow()+'<div class="row" style="justify-content:center"><button class="g" data-a="rspin" '+(cash<bet?'disabled':'')+'>SPIN THE WHEEL · '+money(bet)+'</button></div>';}
    if(msg)h+='<p style="font-size:20px;color:#7dffb0" role="status">'+msg+'</p>';
    return h+'<p style="font-size:13px;color:#a89fb0">In-game money only. No real-money gambling.</p>';},
  act(a,v){if(a==='tab'){tab=v;msg='';return;}if(a==='bet'){bet=+v;return;}if(a==='mach'){machine=+v;return;}if(a==='spin')return slotSpin();
    if(['deal','hit','stand','double'].includes(a))return bjAct(a);if(a==='pdeal'||a==='hold'||a==='draw')return pkAct(a,v);if(a==='rpick'||a==='rnum'||a==='rspin')return rrAct(a,v);}
};

// ---------------------------------------------------------------- the Velvet Jester club
const DANCERS=[{n:'Sapphire',c:'#2fae66'},{n:'Mardi',c:'#f2c14e'},{n:'Velvet',c:'#b45cff'}];
const DIRS={L:'\u2190',U:'\u2191',R:'\u2192',D:'\u2193'};
let dance=null,clubMsg='';
function tipDancer(i,amt){if(cash<amt){clubMsg='Not enough cash.';return;}cash-=amt;addJackpot(Math.round(amt*.29));sfx('cash');clubMsg='You made it rain '+money(amt)+' on '+DANCERS[i].n+'. 29% went to the Level 29 Jackpot.';}
function startDance(){dance={i:0,n:16,dir:null,until:0,combo:0,gross:0,hits:0,timer:0};nextBeat();}
function nextBeat(){if(!dance)return;if(dance.i>=dance.n)return endDance();const ks=Object.keys(DIRS);dance.dir=ks[Math.floor(Math.random()*4)];dance.i++;
  clearTimeout(dance.timer);const win=Math.max(650,1100-dance.i*25);dance.timer=setTimeout(()=>{if(!dance)return;dance.combo=0;dance.miss=true;nextBeat();draw();},win);dance.miss=false;}
function danceInput(k){if(!dance||!DIRS[k])return;if(k===dance.dir){dance.combo++;dance.hits++;const tip=Math.round(rnd(10,40)*(1+dance.combo*.12));dance.gross+=tip;dance.last='+'+money(tip);}else{dance.combo=0;dance.last='MISS';}nextBeat();draw();}
function endDance(){clearTimeout(dance.timer);const g=dance.gross,keep=Math.round(g*.71),jp=g-keep;cash+=keep;addJackpot(jp);if(g>save.danceBest){save.danceBest=g;persist();}
  clubMsg='Set over · '+dance.hits+'/'+dance.n+' moves · crowd threw '+money(g)+'. You keep '+money(keep)+', '+money(jp)+' (29%) went to the Level 29 Jackpot.';sfx('cash');dance=null;}
const clubPanel={theme:'club',
  render(){let h='<div class="eb">Velvet Jester · purple room</div><h2>The Velvet Jester</h2>'+wallet();
    h+='<div class="row" style="gap:14px"><div class="vinyl" aria-hidden="true"></div><div><b style="color:#2fae66">DJ BAYOU BOOM</b><br><span style="color:#f2c14e">Now playing: Level 29 · Blood in the Bayou</span></div></div>';
    if(dance){h+='<p class="eb">STAGE 4 · YOU ARE DANCING · MOVE '+dance.i+' / '+dance.n+' · COMBO x'+dance.combo+'</p><div class="arrow" aria-live="polite">'+DIRS[dance.dir]+'</div>';
      h+='<p style="text-align:center;font-size:20px">'+(dance.last||'Hit the arrow!')+' · Crowd tips '+money(dance.gross)+'</p>';
      h+='<div class="row" style="justify-content:center">'+Object.keys(DIRS).map(k=>'<button data-f="'+k+'" aria-label="'+k+'" style="font-size:28px;min-width:64px">'+DIRS[k]+'</button>').join('')+'</div><p style="text-align:center;color:#a89fb0">Use the arrow keys or tap the arrows.</p>';return h;}
    h+='<div class="grid">'+DANCERS.map((d,i)=>'<div class="pole"><div class="bar"></div><div class="dancer" style="background:'+d.c+'"></div><b>'+d.n+'</b><div class="row" style="justify-content:center">'+[5,20,100].map(a=>'<button data-a="tip" data-v="'+i+':'+a+'" '+(cash<a?'disabled':'')+'>'+money(a)+'</button>').join('')+'</div></div>').join('');
    h+='<div class="pole"><div class="bar"></div><div class="dancer" style="background:#fff;opacity:.3"></div><b>Stage 4 · open</b><p style="font-size:14px">One player at a time. Hit the dance prompts and the crowd throws money. You keep 71%, 29% goes to the Level 29 Jackpot.</p><button class="g" data-a="dance">Take the stage</button></div></div>';
    h+='<p class="jp">LEVEL 29 JACKPOT '+money(save.jackpot)+'</p>';if(save.danceBest)h+='<p>Your best set: '+money(save.danceBest)+'</p>';
    if(clubMsg)h+='<p role="status" style="color:#7dffb0">'+clubMsg+'</p>';return h;},
  act(a,v){if(a==='tip'){const [i,amt]=v.split(':').map(Number);tipDancer(i,amt);}if(a==='dance'){clubMsg='';startDance();}},
  fast(k){danceInput(k);},
  close(){if(dance){clearTimeout(dance.timer);dance=null;}}};

// ---------------------------------------------------------------- shops
const SHOPS={
  dispensary:{t:'Elevated Melanin',eb:'Hemp & wellness · fictional in-game items',items:[['Bayou herbal tea',29,15],['Purple Jester CBD gummies',59,30],['Gold Leaf hemp balm',99,50],['King Cake wellness bar',149,100]]},
  smoke:{t:'Crown Smoke Shop',eb:'Cigars · hookah · accessories',items:[['Swisher pack',12,8],['Cohiba cigar',45,20],['Hookah session',80,40],['Level 29 gold grinder',29,0]]},
  truck:{t:"Mama 29's Food Truck",eb:'Fresh off the bayou',items:[['Beignets',9,15],['Sweet tea',4,8],['Jambalaya',16,30],["Shrimp po'boy",18,35],['Seafood gumbo',20,40],['Crawfish etouffee',22,45]]}};
function shopPanel(id){const S=SHOPS[id];let m='';return{
  render(){return '<div class="eb">'+S.eb+'</div><h2>'+S.t+'</h2>'+wallet()+'<p>HP '+Math.round(player.hp)+'</p><div class="grid">'+S.items.map((it,i)=>'<div class="card"><b>'+it[0]+'</b><p>'+money(it[1])+(it[2]?' · +'+it[2]+' HP':' · collectible')+'</p><button data-a="buy" data-v="'+i+'" '+(cash<it[1]?'disabled':'')+'>Buy</button></div>').join('')+'</div>'+(m?'<p role="status" style="color:#7dffb0">'+m+'</p>':'');},
  act(a,v){if(a!=='buy')return;const it=S.items[+v];if(cash<it[1])return;cash-=it[1];sfx('cash');if(it[2])player.hp=Math.min(player.maxHp||100,player.hp+it[2]);m='Bought '+it[0]+'.';}};}

// ---------------------------------------------------------------- airport, Bonnie, university, stadium, fishing
const airportPanel={render(){return '<div class="eb">Level 29 International</div><h2>Airport terminal</h2>'+wallet()+
  '<div class="grid"><div class="card"><b>Jester One</b><p>Purple and gold jet with the Level 29 logo on the tail. Always flying over the city.</p></div><div class="card"><b>Jester Two</b><p>Parked on the apron for display.</p></div><div class="card"><b>B-29 Jester Bomber</b><p>Ride the .50 cal gunner seat for 29 seconds and shoot zombies from the sky. $15 bounty per kill.</p><button class="g" data-a="bomb" '+(cash<BOMBER_COST?'disabled':'')+'>Fly · '+money(BOMBER_COST)+'</button></div></div>'+
  '<p style="color:#a89fb0">Move the mouse, drag the view, or use the right stick to aim the center crosshair. Hold the mouse button, Space, FIRE, or RT to shoot. Hits require a visible zombie under the crosshair; buildings block shots. You can\'t be hurt while you\'re in the air.</p>';},act(a){if(a==='bomb')startBomber();}};
const bonniePanel={render(){const L=lots.dealer;return '<div class="eb">Owner · in-game cash</div><h2>Bonnie De Vette</h2><button data-a=story>RECOVERY MISSIONS · TALK TO BONNIE</button>'+wallet()+'<p>Welcome to Slab Motors. Choose your ride; I will deliver it to the front lot.</p><div class="grid">'+(L?.inventory||[]).map((r,i)=>'<div class="card"><b>'+CAR_SPECS[r.type].name+'</b><p>'+money(r.price)+'</p><button data-a="vehicle" data-v="'+i+'" '+(cash<r.price?'disabled':'')+'>PURCHASE</button></div>').join('')+'</div><p>Owned vehicles are stored in your local garage.</p>'+((window.level29OpenWorld?.save.dealerGarage)||[]).map((r,i)=>'<button data-a=recall data-v='+i+'>DELIVER OWNED '+CAR_SPECS[r.type].name+'</button>').join('');},act(a,v){
 if(!lots.dealer?.venue||!insideVenue(lots.dealer.venue,player))return;
 if(a==='story'){closePanel();return window.level29CityStories?.open('bonnie');}
 if(a==='recall'){const rec=window.level29OpenWorld?.save.dealerGarage?.[+v];if(!rec||!CAR_SPECS[rec.type])return;if(cars.some(c=>c.dealerSlot===+v&&!c.dead&&!c.gone))return toast('YOUR VEHICLE IS ALREADY IN THE CITY · V ON MAP');const L=lots.dealer,x=(L.x0+2)*T,y=(L.y1+1)*T;if(cars.some(c=>!c.dead&&dist(x,y,c.x,c.y)<70))return toast('CLEAR THE DELIVERY BAY FIRST');const c=makeCar(x,y,0,rec.type);c.col=rec.col;c.dealerOwned=true;c.dealerSlot=+v;cars.push(c);return toast('OWNED VEHICLE DELIVERED');}
 if(a!=='vehicle')return;const L=lots.dealer,r=L?.inventory[+v];if(!r||cash<r.price)return;
 const x=(L.x0+2)*T,y=(L.y1+1)*T;const old=moverCtx;moverCtx={};let ok=false;try{ok=!blockedCircle(x,y,26)&&!cars.some(c=>!c.dead&&dist(x,y,c.x,c.y)<70);}finally{moverCtx=old;}if(!ok)return toast('CLEAR THE DELIVERY BAY FIRST');
 const c=makeCar(x,y,0,r.type);c.dealerOwned=true;cars.push(c);cash-=r.price;
 const own=window.level29OpenWorld?.save;if(own){own.dealerGarage=own.dealerGarage||[];c.dealerSlot=own.dealerGarage.length;own.dealerGarage.push({type:r.type,col:c.col});persistOpenWorld();}if(window.level29Save)level29Save.save();toast('PURCHASED · YOUR VEHICLE IS OUT FRONT');sfx('cash');
}};
const QUIZ=[['What is the state capital of Louisiana?',['Baton Rouge','New Orleans','Shreveport'],0],['What river runs through New Orleans?',['Mississippi','Red River','Missouri'],0],['Mardi Gras colors are purple, green and...',['Gold','Red','Blue'],0],['What is a beignet?',['A fried pastry','A boat','A dance'],0],['Louisiana counties are called...',['Parishes','Boroughs','Wards'],0],['Which is a classic Cajun dish?',['Jambalaya','Pierogi','Pho'],0],['What animal is the Louisiana state reptile?',['Alligator','Turtle','Snake'],0],['The French Quarter is in which city?',['New Orleans','Lafayette','Houma'],0]];
function quizPanel(){const qs=QUIZ.slice().sort(()=>Math.random()-.5).slice(0,5).map(([q,o,a])=>{const ord=o.map((t,i)=>[t,i===a]).sort(()=>Math.random()-.5);return{q,o:ord};});let i=0,right=0,m='';
  return{render(){if(i>=qs.length)return '<div class="eb">Bayou State University</div><h2>Class dismissed</h2><p>'+right+' / '+qs.length+' correct · earned '+money(right*290)+'</p>';
    return '<div class="eb">Bayou State University · Louisiana 101 · question '+(i+1)+' of '+qs.length+'</div><h2>'+qs[i].q+'</h2><p>$290 per correct answer.</p><div class="row">'+qs[i].o.map((o,k)=>'<button data-a="ans" data-v="'+k+'">'+o[0]+'</button>').join('')+'</div>'+(m?'<p role="status">'+m+'</p>':'');},
  act(a,v){if(a!=='ans'||i>=qs.length)return;if(qs[i].o[+v][1]){right++;cash+=290;sfx('cash');m='Correct! +$290';}else m='Wrong. Answer: '+qs[i].o.find(o=>o[1])[0];i++;}};}
function kickPanel(){let k=0,made=0,res='',zone=[40,62];const YARDS=[20,30,40,50,60];
  const p={render(){if(k>=5)return '<div class="eb">Jester Stadium</div><h2>Field goals</h2><p>'+made+' / 5 good · earned '+money(made*250*3)+'</p>';
    return '<div class="eb">Jester Stadium · kick '+(k+1)+' of 5</div><h2>'+YARDS[k]+'-yard field goal</h2><p>Stop the needle inside the green. Each kick is worth more.</p><div class="meter"><div class="zone" style="left:'+zone[0]+'%;width:'+(zone[1]-zone[0])+'%"></div><div class="nd" id="l29nd"></div></div><div class="row" style="justify-content:center"><button class="g" data-f="go">KICK (Space)</button></div>'+(res?'<p role="status">'+res+'</p>':'');},
    act(){},fast(){if(k>=5)return;const n=document.getElementById('l29nd'),v=n?parseFloat(n.style.left):0;const good=v>=zone[0]&&v<=zone[1];
      if(good){made++;const pay=250*(k+1);cash+=pay;sfx('cash');res='GOOD! +'+money(pay);}else res='No good.';k++;const w=Math.max(8,22-k*3.5),c=rnd(20,80);zone=[c-w/2,c+w/2];draw();}};
  setTimeout(()=>meterLoop(t=>50+48*Math.sin(t*(2.4+k*.5))),0);return p;}
const CATCH=[['Gulf shrimp',0,40],['Redfish',85,14],['Speckled trout',60,14],['Flounder',70,10],['Red snapper',120,6],['Blue crab',25,10],['Old boot',0,6]];
function fishPanel(){let casts=10,haul=0,log=[],zone=[38,62];
  const p={render(){if(casts<=0)return '<div class="eb">Natchez deck</div><h2>Nets in</h2><p>Trip total '+money(haul)+'</p><p>'+log.slice(-6).join('<br>')+'</p>';
    return '<div class="eb">Natchez steamboat deck �� safe from zombies and gators</div><h2>Net fishing</h2>'+wallet()+'<p>Casts left '+casts+' · trip '+money(haul)+'</p><p>Haul the net while the needle is over the school (green).</p><div class="meter"><div class="zone" style="left:'+zone[0]+'%;width:'+(zone[1]-zone[0])+'%"></div><div class="nd" id="l29nd"></div></div><div class="row" style="justify-content:center"><button class="g" data-f="go">HAUL NET (Space)</button></div><p>'+log.slice(-4).join('<br>')+'</p>';},
    act(){},fast(){if(casts<=0)return;const n=document.getElementById('l29nd'),v=n?parseFloat(n.style.left):0;casts--;
      if(v<zone[0]||v>zone[1]){log.push('Empty net.');}else{let r=Math.random()*100,c=CATCH[0];for(const it of CATCH){if((r-=it[2])<0){c=it;break;}}
        let val=c[1],name=c[0];if(c[0]==='Gulf shrimp'){const lb=Math.round(rnd(8,30));val=lb*9;name=lb+' lb Gulf shrimp';}haul+=val;cash+=val;save.fish++;persist();if(val)sfx('cash');log.push(name+(val?' · '+money(val):''));}
      const c=rnd(25,75);zone=[c-11,c+11];draw();}};
  setTimeout(()=>meterLoop(t=>50+48*Math.sin(t*2.2)),0);return p;}

// ---------------------------------------------------------------- frame hooks
const prevUpdate=update;
update=function(){const r=prevUpdate.apply(this,arguments);
  try{if(player){ensureSky();updateSky();updateBirds();updateSafeZone();updateRide();updateTracers();updateCourse();
    curSpot=state==='play'?nearestSpot():null;
    const showUse=!!curSpot&&coarse()&&!cur;useBtn.style.display=showUse?'block':'none';if(showUse)useBtn.textContent=curSpot.label.split(' · ')[0];
    fireBtn.style.display=ride&&coarse()?'block':'none';}}catch(e){if(!update.l29err){update.l29err=1;console.warn('downtown tick',e);}}
  return r;};
const prevHUD=drawHUD;
drawHUD=function(){const r=prevHUD.apply(this,arguments);try{
  cx.save();cx.textAlign='center';cx.textBaseline='middle';
  if(curSpot&&!coarse()){const t='E · '+curSpot.label;cx.font="800 18px 'Barlow Condensed'";const w=cx.measureText(t).width+28;cx.fillStyle='rgba(20,10,34,.85)';cx.fillRect(SW/2-w/2,SH-128,w,34);cx.strokeStyle=COL.gold;cx.strokeRect(SW/2-w/2,SH-128,w,34);cx.fillStyle='#fff';cx.fillText(t,SW/2,SH-111);}
  if(ride){cx.fillStyle='rgba(120,10,20,.12)';cx.fillRect(0,0,SW,SH);cx.strokeStyle='#ffd36b';cx.lineWidth=2;cx.beginPath();cx.arc(SW/2,SH/2,34,0,6.283);cx.moveTo(SW/2-50,SH/2);cx.lineTo(SW/2+50,SH/2);cx.moveTo(SW/2,SH/2-50);cx.lineTo(SW/2,SH/2+50);cx.stroke();
    cx.font="800 26px 'Barlow Condensed'";cx.fillStyle='#ffd36b';cx.fillText('B-29 GUNNER · '+(ride.t/60).toFixed(1)+'s · KILLS '+ride.kills,SW/2,70);}
  if(run&&course){cx.font="800 24px 'Barlow Condensed'";cx.fillStyle=COL.gold;const p=course.pts[run.i];cx.fillText('COURSE '+((frame-run.t0)/60).toFixed(1)+'s · '+(p.name||'')+(p.hold?' · HOLD '+Math.round((run.hold||0)/p.hold*100)+'%':'')+' ('+run.i+'/'+(course.pts.length-1)+')',SW/2,70);}
  cx.restore();}catch(_){}return r;};
const prevFullMap=drawFullMap;
drawFullMap=function(){prevFullMap.apply(this,arguments);if(!isWorld(city))return;try{
  const S=Math.min(SW,SH)-80,X=(SW-S)/2,Y=(SH-S)/2,sc=S/WORLD;
  for(const id in lots){const L=lots[id],x=(L.x0+L.x1+1)/2*T,y=(L.y0+L.y1+1)/2*T;cx.font="800 12px 'Barlow Condensed'";cx.textAlign='center';cx.textBaseline='middle';const w=cx.measureText(L.name).width+10;
    cx.fillStyle='rgba(8,10,12,.8)';cx.fillRect(X+x*sc-w/2,Y+y*sc-8,w,16);cx.fillStyle=COL.gold;cx.fillText(L.name,X+x*sc,Y+y*sc);}}catch(_){}};

window.level29Downtown={get lots(){return lots;},get save(){return save;},get ride(){return ride;},get course(){return course;},get birds(){return birds.length;},startMissionFlight:()=>{const a=window.level29Powell?.active;if(a?.kind?.startsWith('air'))return startBomber(true);},openCasino:()=>openPanel(casinoPanel),openClub:()=>openPanel(clubPanel),startBomber,startCourse,closePanel,spots};
})();
