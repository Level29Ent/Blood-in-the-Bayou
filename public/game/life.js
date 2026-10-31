'use strict';
// City life: auto doors, robbery cash animation, side hustles, apartment decor, pets, bayou wildlife and birds.
(function(){
const KEY='level29.life.v1';
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')||{};}catch(_){return {};}};
const data=Object.assign({decor:[],paint:'cream',floor:'oak',pets:[],activePet:null,earned:0},read());
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(data));}catch(_){}};
const OW=()=>window.level29OpenWorld||{};
const rnd=(a,b)=>a+Math.random()*(b-a);
const money=n=>'$'+Math.round(n).toLocaleString('en-US');
const earn=(n,label)=>{n=Math.round(n);cash+=n;data.earned=(data.earned||0)+n;persist();toast(label+' +'+money(n));};
const playSfx=n=>{try{sfx(n);}catch(_){}};
const ground=(x,y)=>{try{return terrainHeight(x,y)||0;}catch(_){return 0;}};

const matCache={};
const M=(c,o={})=>{const k=c+JSON.stringify(o);if(matCache[k])return matCache[k];return matCache[k]=new THREE.MeshStandardMaterial({color:c,roughness:o.r??.75,metalness:o.m??0,emissive:o.e??c,emissiveIntensity:o.ei??.14,transparent:o.t!=null,opacity:o.t??1,side:o.side||THREE.FrontSide,depthWrite:o.t==null});};
const add=(g,geo,m,x=0,y=0,z=0)=>{const k=new THREE.Mesh(geo,m);k.position.set(x,y,z);g.add(k);return k;};
// graphics.js gives every new mesh a shadow pass; small props don't need one and it doubles their draw cost.
const noShadow=o=>{o.traverse(k=>{k.userData.__gfx=true;if(k.isMesh){k.castShadow=false;k.receiveShadow=false;}});return o;};
const B=(g,w,h,d,x,y,z,m)=>add(g,new THREE.BoxGeometry(w,h,d),m,x,y,z);
const S=(g,r,x,y,z,m,sx=1,sy=1,sz=1)=>{const k=add(g,new THREE.SphereGeometry(r,10,8),m,x,y,z);k.scale.set(sx,sy,sz);return k;};
const Cy=(g,rt,rb,h,x,y,z,m,seg=10)=>add(g,new THREE.CylinderGeometry(rt,rb,h,seg),m,x,y,z);

let root=null,builtFor=null,shoreline=[],gators=[],flocks=[],egrets=[],pigeons=[],scrap=[],mist=[],chop=null;

/* ---------- Shoreline and bayou scenery ---------- */
function scanShore(){
 const pts=[],N=Math.floor(WORLD/TILE);
 for(let ty=3;ty<N-3;ty+=2)for(let tx=3;tx<N-3;tx+=2){
  const x=tx*TILE+16,y=ty*TILE+16;if(tileAt(x,y)!==T_WATER)continue;
  let land=false;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(tileAt(x+dx*TILE*2,y+dy*TILE*2)!==T_WATER)land=true;
  if(land)pts.push({x,y});
 }
 return pts;
}
const isWater=(x,y)=>tileAt(x,y)===T_WATER;
function nearWater(x,y,r){if(isWater(x,y))return true;for(let k=0;k<8;k++){const a=k/8*Math.PI*2;if(isWater(x+Math.cos(a)*r,y+Math.sin(a)*r))return true;}return false;}
const softLand=t=>t===T_GRASS||t===T_SAND||t===T_PARK||t===T_WATER;

function instanced(geo,mat,list,fn){
 if(!list.length)return;const im=new THREE.InstancedMesh(geo,mat,list.length),d=new THREE.Object3D();
 list.forEach((p,i)=>{d.position.set(0,0,0);d.rotation.set(0,0,0);d.scale.set(1,1,1);fn(d,p,i);d.updateMatrix();im.setMatrixAt(i,d.matrix);});
 im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;root.add(im);return im;
}
function buildBayou(){
 if(!shoreline.length)return;
 const pick=()=>shoreline[Math.floor(Math.random()*shoreline.length)];
 const trees=[];for(let i=0;i<Math.min(90,shoreline.length*2);i++){const p=pick(),x=p.x+rnd(-26,26),y=p.y+rnd(-26,26);if(softLand(tileAt(x,y)))trees.push({x,y,s:rnd(.75,1.35),a:rnd(0,6.28)});}
 const trunk=new THREE.CylinderGeometry(1.4,5.2,48,7).translate(0,24,0);
 instanced(trunk,M('#5a4a38',{r:.95,ei:.08}),trees,(d,t)=>{d.position.set(t.x,ground(t.x,t.y)-1,t.y);d.scale.setScalar(t.s);d.rotation.y=t.a;});
 const crown=new THREE.SphereGeometry(15,9,6);
 instanced(crown,M('#3c5a2c',{r:.9,ei:.1}),trees,(d,t)=>{d.position.set(t.x,ground(t.x,t.y)+46*t.s,t.y);d.scale.set(t.s*1.2,t.s*.38,t.s);});
 const crown2=new THREE.SphereGeometry(10,8,5);
 instanced(crown2,M('#4a6a33',{r:.9,ei:.1}),trees,(d,t)=>{d.position.set(t.x+6*t.s,ground(t.x,t.y)+38*t.s,t.y-4*t.s);d.scale.set(t.s,t.s*.35,t.s);});
 const mossList=[];trees.forEach(t=>{for(let k=0;k<5;k++)mossList.push({t,k});});
 const moss=new THREE.PlaneGeometry(2.6,16).translate(0,-8,0);
 instanced(moss,M('#9aa585',{t:.82,side:THREE.DoubleSide,ei:.2}),mossList,(d,{t,k})=>{const a=k/5*Math.PI*2+t.a,r=10*t.s;d.position.set(t.x+Math.cos(a)*r,ground(t.x,t.y)+42*t.s,t.y+Math.sin(a)*r);d.rotation.y=a;d.scale.set(1,rnd(.7,1.3)*t.s,1);});
 const knees=[];trees.forEach(t=>{for(let k=0;k<3;k++)knees.push({x:t.x+rnd(-12,12),y:t.y+rnd(-12,12)});});
 instanced(new THREE.ConeGeometry(1.4,5,6).translate(0,2.5,0),M('#5a4a38'),knees,(d,p)=>d.position.set(p.x,ground(p.x,p.y)-.5,p.y));
 const reeds=[];for(let i=0;i<520;i++){const p=pick(),x=p.x+rnd(-40,40),y=p.y+rnd(-40,40),t=tileAt(x,y);if(softLand(t)&&nearWater(x,y,40))reeds.push({x,y,h:rnd(.7,1.4),a:rnd(-.25,.25)});}
 instanced(new THREE.BoxGeometry(.45,12,.45).translate(0,6,0),M('#6f7d3c',{ei:.12}),reeds,(d,p)=>{d.position.set(p.x,ground(p.x,p.y),p.y);d.scale.set(1,p.h,1);d.rotation.z=p.a;});
 const tails=reeds.filter((_,i)=>i%3===0);
 instanced(new THREE.CylinderGeometry(.75,.75,3,6),M('#5a3a22'),tails,(d,p)=>{d.position.set(p.x+Math.sin(-p.a)*-12*p.h,ground(p.x,p.y)+12*p.h,p.y);d.rotation.z=p.a;});
 const pads=[];for(let i=0;i<420;i++){const p=pick(),x=p.x+rnd(-60,60),y=p.y+rnd(-60,60);if(isWater(x,y))pads.push({x,y,s:rnd(.6,1.4),a:rnd(0,6.28)});}
 instanced(new THREE.CircleGeometry(3.4,10,.3,5.9).rotateX(-Math.PI/2),M('#4e7d2c',{ei:.2,side:THREE.DoubleSide}),pads,(d,p)=>{d.position.set(p.x,1.35,p.y);d.rotation.y=p.a;d.scale.setScalar(p.s);});
 instanced(new THREE.SphereGeometry(1,8,6),M('#f2a6c8',{ei:.35}),pads.filter((_,i)=>i%6===0),(d,p)=>{d.position.set(p.x+1,1.9,p.y);d.scale.set(1,.6,1);});
 const algae=[];for(let i=0;i<70;i++){const p=pick(),x=p.x+rnd(-30,30),y=p.y+rnd(-30,30);if(isWater(x,y))algae.push({x,y,s:rnd(1,2.6),a:rnd(0,6.28)});}
 instanced(new THREE.CircleGeometry(14,12).rotateX(-Math.PI/2),M('#5f7a2c',{t:.55,ei:.15}),algae,(d,p)=>{d.position.set(p.x,1.2,p.y);d.scale.set(p.s,1,p.s*.7);d.rotation.y=p.a;});
 const cv=document.createElement('canvas');cv.width=cv.height=64;const c2=cv.getContext('2d'),gr=c2.createRadialGradient(32,32,2,32,32,32);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');c2.fillStyle=gr;c2.fillRect(0,0,64,64);
 const mistMat=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),color:'#d6dfc8',transparent:true,opacity:.26,depthWrite:false});
 const mistGeo=new THREE.PlaneGeometry(170,110).rotateX(-Math.PI/2);
 for(let i=0;i<Math.min(10,shoreline.length);i++){const p=pick(),m=add(root,mistGeo,mistMat,p.x,7+rnd(0,6),p.y);mist.push({m,x:p.x,y:p.y,ph:rnd(0,6.28)});}
}

/* ---------- Alligators ---------- */
function gatorMesh(scale=1){
 const g=new THREE.Group(),skin=M('#3b4a26',{r:.9,ei:.08}),dark=M('#2a3519',{r:.9}),belly=M('#a49c72'),eye=M('#e8d23a',{ei:.6}),tooth=M('#f2efe2');
 B(g,22,4.6,9,0,2.6,0,skin);B(g,20,1.6,7,0,.8,0,belly);
 const head=new THREE.Group();head.position.set(11,2.8,0);g.add(head);
 B(head,8,3.4,7,4,0,0,skin);B(head,9,2.2,4.6,11.5,-.4,0,skin);
 const jaw=new THREE.Group();jaw.position.set(4,-1.4,0);head.add(jaw);B(jaw,15,1.2,4.6,5.5,-.4,0,belly);
 for(const z of [-2.3,2.3]){S(head,1.05,5,2.2,z*.85,eye);S(head,.55,5.6,2.4,z*.85,dark);B(head,8.5,.7,.3,11.5,-1.2,z,tooth);}
 const tail=new THREE.Group();tail.position.set(-11,2.4,0);g.add(tail);
 const tc=add(tail,new THREE.ConeGeometry(4.2,22,6),skin,-11,0,0);tc.rotation.z=Math.PI/2;tc.scale.set(1,1,.7);
 for(let i=0;i<7;i++)B(g,2.2,1.4,1.2,-9+i*3,5.3,i%2?1.5:-1.5,dark);
 for(let i=0;i<4;i++)B(tail,2,1.2,1,-3-i*4,2.4-i*.4,0,dark);
 const legs=[];for(const [x,z] of [[7,5],[7,-5],[-7,5],[-7,-5]]){const l=B(g,2.6,3,2.6,x,.6,z,skin);legs.push(l);}
 g.scale.setScalar(scale);g.userData={head,jaw,tail,legs};return g;
}
function spawnGators(){
 if(!shoreline.length)return;
 for(let i=0;i<14;i++){const p=shoreline[Math.floor(Math.random()*shoreline.length)];if(!isWater(p.x,p.y))continue;
  const m=gatorMesh(rnd(.9,1.25));root.add(m);gators.push({m,hx:p.x,hy:p.y,x:p.x,y:p.y,a:rnd(0,6.28),hp:70,cd:0,dead:false,respawn:0,wander:rnd(0,6.28)});}
}
function killGator(g,label){dispatchEvent(new CustomEvent('level29:gator-killed',{detail:{x:g.x,y:g.y,playerOwned:true}}));g.dead=true;g.respawn=3600;g.m.rotation.z=Math.PI;earn(110+Math.random()*60,label);playSfx('coin');}
function updateGators(){
 if(!player)return;const p=player.car||player,petGator=data.activePet&&petKind()==='gator';
 for(const g of gators){
  const d=dist(g.x,g.y,p.x,p.y);g.m.visible=d<520;if(!g.m.visible&&!g.dead)continue;
  if(g.dead){if(--g.respawn<=0){g.dead=false;g.hp=70;g.x=g.hx;g.y=g.hy;g.m.rotation.z=0;}else{g.m.position.y=1.4;continue;}}
  const onFootClose=!player.dead&&!player.car&&d<200&&nearWater(player.x,player.y,80)&&!petGator&&!OW().interior;
  let tx,ty,sp;
  if(onFootClose){tx=player.x;ty=player.y;sp=1.55;}else{g.wander+=rnd(-.05,.05);tx=g.hx+Math.cos(g.wander)*70;ty=g.hy+Math.sin(g.wander)*70;sp=.32;}
  const want=Math.atan2(ty-g.y,tx-g.x);let da=want-g.a;while(da>Math.PI)da-=Math.PI*2;while(da<-Math.PI)da+=Math.PI*2;g.a+=Math.max(-.07,Math.min(.07,da));
  const moving=dist(g.x,g.y,tx,ty)>14;
  if(moving){const nx=g.x+Math.cos(g.a)*sp,ny=g.y+Math.sin(g.a)*sp;if(tileAt(nx,ny)!==T_BLD&&nearWater(nx,ny,onFootClose?55:20)){g.x=nx;g.y=ny;}else g.wander+=1;}
  if(--g.cd<0)g.cd=0;
  if(onFootClose&&d<22&&g.cd===0){hurtPlayer(16,g.x,g.y);g.cd=60;g.snap=12;}
  if(player.car&&d<28&&Math.abs(player.car.v||0)>3){killGator(g,'GATOR ROADKILL · HIDE SOLD');continue;}
  for(const b of bullets){if(b.life<=0||b.hit&&b.hit.has(g))continue;if((b.x-g.x)**2+(b.y-g.y)**2<17*17){g.hp-=b.dmg||20;b.hit&&b.hit.add(g);b.life=0;if(g.hp<=0)break;}}
  if(g.hp<=0){killGator(g,'GATOR HIDE SOLD');continue;}
  const inW=isWater(g.x,g.y);g.m.position.set(g.x,inW?-1.2:ground(g.x,g.y),g.y);g.m.rotation.y=-g.a;
  const u=g.m.userData,t=frame*.12;u.tail.rotation.y=Math.sin(t*(moving?1.6:.4))*(moving?.35:.1);
  g.snap=Math.max(0,(g.snap||0)-1);u.jaw.rotation.z=-(g.snap>0?.55:onFootClose&&d<70?.3:.05);
  u.legs.forEach((l,i)=>{l.position.y=.6+(moving&&!inW?Math.sin(t*2+i*1.6)*.6:0);});
 }
}

/* ---------- Birds ---------- */
const birdGeo={body:new THREE.SphereGeometry(1.6,8,6),wing:new THREE.BoxGeometry(1.8,.25,6).translate(0,0,3),neck:new THREE.CylinderGeometry(.35,.45,6,6),leg:new THREE.CylinderGeometry(.15,.15,6,4)};
function birdMesh(col,beak='#e0a53a',size=1){
 const g=new THREE.Group(),m=M(col,{ei:.2});add(g,birdGeo.body,m).scale.set(1.8,.9,1);S(g,1,2.6,.8,0,m);B(g,1.4,.4,.5,3.9,.7,0,M(beak));
 const wl=new THREE.Group(),wr=new THREE.Group();add(wl,birdGeo.wing,m);add(wr,birdGeo.wing,m).rotation.y=Math.PI;wl.position.y=wr.position.y=.5;g.add(wl,wr);
 B(g,2.4,.3,1.6,-3,.2,0,m);g.scale.setScalar(size);g.userData={wl,wr};return g;
}
function egretMesh(){
 const g=new THREE.Group(),w=M('#f4f2ea',{ei:.25}),y=M('#e3b52e'),k=M('#2b2b2b');
 add(g,birdGeo.body,w,0,10,0).scale.set(2.2,1.1,1.2);const n=add(g,birdGeo.neck,w,3.2,14,0);n.rotation.z=-.5;S(g,1.1,5,17,0,w);B(g,4,.5,.6,7.2,16.8,0,y);
 for(const z of [-.8,.8])add(g,birdGeo.leg,k,0,4,z);return g;
}
function spawnBirds(){
 const N=Math.floor(WORLD/TILE);
 for(let f=0;f<4;f++){const cx=rnd(200,WORLD-200),cy=rnd(200,WORLD-200),col=f%3===0?'#efeee6':f%3===1?'#1f1f22':'#5b5e66',flock={cx,cy,r:rnd(150,300),h:rnd(95,170),sp:rnd(.0025,.005)*(f%2?1:-1),t:rnd(0,6.28),birds:[]};
  for(let i=0;i<6;i++){const m=birdMesh(col,'#e0a53a',rnd(1.1,1.5));root.add(m);flock.birds.push({m,ox:rnd(-28,28),oy:rnd(-28,28),oh:rnd(-10,10),ph:rnd(0,6.28)});}flocks.push(flock);}
 for(let i=0;i<14&&shoreline.length;i++){const p=shoreline[Math.floor(Math.random()*shoreline.length)],x=p.x+rnd(-20,20),y=p.y+rnd(-20,20);const m=egretMesh();m.position.set(x,isWater(x,y)?-2:ground(x,y),y);m.rotation.y=rnd(0,6.28);root.add(m);egrets.push({m,x,y,hx:x,hy:y,fly:0});}
 const spots=[];for(let k=0;k<1200&&spots.length<4;k++){const x=rnd(100,WORLD-100),y=rnd(100,WORLD-100),t=tileAt(x,y);if(t===T_PLAZA||t===T_PARK)spots.push({x,y});}
 for(const s of spots)for(let i=0;i<4;i++){const x=s.x+rnd(-25,25),y=s.y+rnd(-25,25),m=birdMesh('#7d8088','#d9b38a',.55);root.add(m);pigeons.push({m,x,y,hx:x,hy:y,h:0,vh:0,fly:0,a:rnd(0,6.28)});}
}
function updateBirds(){
 if(!player)return;const p=player.car||player;
 for(const f of flocks){f.t+=f.sp;const fx=f.cx+Math.cos(f.t)*f.r,fy=f.cy+Math.sin(f.t)*f.r,ang=f.t+(f.sp>0?Math.PI/2:-Math.PI/2),vis=dist(fx,fy,p.x,p.y)<750;
  for(const b of f.birds){b.m.visible=vis;if(!vis)continue;b.m.position.set(fx+b.ox,f.h+b.oh+Math.sin(frame*.03+b.ph)*3,fy+b.oy);b.m.rotation.y=-ang;const fl=Math.sin(frame*.35+b.ph)*.7;b.m.userData.wl.rotation.x=fl;b.m.userData.wr.rotation.x=-fl;}}
 for(const e of egrets){const d=dist(e.x,e.y,p.x,p.y);e.m.visible=d<460;if(!e.m.visible)continue;
  if(e.fly<=0&&d<55){e.fly=160;e.a=Math.atan2(e.y-p.y,e.x-p.x);}
  if(e.fly>0){e.fly--;e.x+=Math.cos(e.a)*1.6;e.y+=Math.sin(e.a)*1.6;e.m.position.set(e.x,Math.sin((160-e.fly)/160*Math.PI)*30,e.y);e.m.rotation.y=-e.a;if(e.fly===0&&!nearWater(e.x,e.y,30)){e.x=e.hx;e.y=e.hy;}e.m.position.y+=isWater(e.x,e.y)?-2:ground(e.x,e.y);}
  else e.m.rotation.y+=Math.sin(frame*.01+e.hx)*.004;}
 for(const b of pigeons){const d=dist(b.x,b.y,p.x,p.y);b.m.visible=d<380;if(!b.m.visible)continue;const u=b.m.userData;
  if(b.fly<=0&&d<60){b.fly=420;b.a=Math.atan2(b.y-p.y,b.x-p.x)+rnd(-.6,.6);}
  if(b.fly>0){b.fly--;const up=b.fly>200;b.h+=up?.9:-.9;b.h=Math.max(0,Math.min(70,b.h));const sp=up?1.8:.9;if(up){b.x+=Math.cos(b.a)*sp;b.y+=Math.sin(b.a)*sp;}else{b.x+=(b.hx-b.x)*.012;b.y+=(b.hy-b.y)*.012;}const fl=Math.sin(frame*.6+b.hx)*.8;u.wl.rotation.x=fl;u.wr.rotation.x=-fl;b.m.rotation.y=-(up?b.a:Math.atan2(b.hy-b.y,b.hx-b.x));}
  else{u.wl.rotation.x=u.wr.rotation.x=0;if(Math.random()<.01)b.a=rnd(0,6.28);if(Math.random()<.3){b.x+=Math.cos(b.a)*.15;b.y+=Math.sin(b.a)*.15;b.m.rotation.y=-b.a;}}
  b.m.position.set(b.x,ground(b.x,b.y)+1.2+b.h+(b.fly<=0?Math.abs(Math.sin(frame*.2+b.hx))*.3:0),b.y);}
}

/* ---------- Side hustles ---------- */
function scrapMesh(){const g=new THREE.Group(),metal=M('#9aa2a8',{m:.6,r:.4,ei:.25}),rust=M('#9a5a36',{r:.8}),can=M('#d23a32',{m:.5,ei:.3});
 B(g,5,1.6,3.4,0,.8,0,metal).rotation.y=.4;B(g,3.6,1.2,2.2,1.4,2,.5,rust).rotation.y=-.5;Cy(g,.8,.8,2.6,-2,1.3,1.6,can).rotation.z=Math.PI/2;Cy(g,.7,.7,2.2,1.8,1.1,-1.6,M('#4a8ed8',{m:.5,ei:.3}));
 const glint=add(g,new THREE.RingGeometry(4.6,5.4,20).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:'#f7e08a',transparent:true,opacity:.6,side:THREE.DoubleSide}),0,.4,0);g.userData.glint=glint;return g;}
function placeScrap(s){for(let k=0;k<60;k++){const x=rnd(120,WORLD-120),y=rnd(120,WORLD-120),t=tileAt(x,y);if((t===T_LOT||t===T_WALK||t===T_PARK)&&!blockedHere(x,y)){s.x=x;s.y=y;s.m.position.set(x,ground(x,y),y);s.off=false;s.wait=0;return;}}
 // Back off after a failed placement so a crowded map can't trigger this search every frame.
 s.off=true;s.m.visible=false;s.wait=900;}
function blockedHere(x,y){const prev=moverCtx;moverCtx={x,y};let b=false;try{b=blockedCircle(x,y,10);}catch(_){}moverCtx=prev;return b||(city.venues||[]).some(v=>insideVenue(v,{x,y}));}
function spawnScrap(){for(let i=0;i<28;i++){const s={m:scrapMesh(),x:0,y:0,wait:0};root.add(s.m);placeScrap(s);scrap.push(s);}}
function buildChop(){
 const res=city.residence,cands=[];for(let k=0;k<1500&&cands.length<40;k++){const x=rnd(200,WORLD-200),y=rnd(200,WORLD-200);if(tileAt(x,y)===T_LOT&&!blockedHere(x,y))cands.push({x,y});}
 if(!cands.length)return;cands.sort((a,b)=>res?dist(b.x,b.y,res.b.x,res.b.y)-dist(a.x,a.y,res.b.x,res.b.y):0);const p=cands[Math.floor(cands.length*.3)];
 const g=new THREE.Group();g.position.set(p.x,ground(p.x,p.y),p.y);root.add(g);
 add(g,new THREE.RingGeometry(34,38,40).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:'#ff8a2a',transparent:true,opacity:.8,side:THREE.DoubleSide}),0,.6,0);
 const beam=add(g,new THREE.CylinderGeometry(3,3,240,10,1,true),new THREE.MeshBasicMaterial({color:'#ff8a2a',transparent:true,opacity:.22,depthWrite:false,side:THREE.DoubleSide}),0,120,0);
 const shed=M('#5a4e44',{r:.9}),tin=M('#8a8f92',{m:.5,r:.5});
 B(g,6,30,6,-46,15,-30,shed);B(g,6,30,6,46,15,-30,shed);B(g,100,3,30,0,31,-34,tin);
 for(let i=0;i<4;i++){const w=add(g,new THREE.TorusGeometry(4,1.5,6,12),M('#1d1d1d'),-40+i*3,4+i*3,-40);w.rotation.x=Math.PI/2;}
 chop={x:p.x,y:p.y,g,beam,cd:0};
}
const carValue=c=>{const base={sport:1500,super:2400,muscle:1200,suv:900,truck:800,van:700,taxi:650,police:1100,limo:1800,lowrider:1300,pickup:750,coupe:1000,bike:500};return Math.round((base[c.type]||850)*Math.max(.35,(c.hp||100)/(c.maxHp||100)));};
let buskT=0,keyV=false,touchBusk=false,petFindT=0,rentT=0;
function updateHustles(){
 if(!player||player.dead)return;const p=player;
 for(const s of scrap){if(s.off){if(--s.wait<=0)placeScrap(s);continue;}const d=dist(s.x,s.y,p.x,p.y);s.m.visible=d<480;if(!s.m.visible)continue;s.m.userData.glint.material.opacity=.35+Math.sin(frame*.12+s.x)*.3;
  if(!p.car&&!OW().interior&&d<18){s.off=true;s.m.visible=false;s.wait=7200;earn(20+Math.random()*40,'SCRAP SOLD');}}
 if(chop){chop.beam.material.opacity=.16+Math.sin(frame*.08)*.08;if(chop.cd>0)chop.cd--;const c=p.car;
  if(c&&!c.saveId&&!c.boat&&chop.cd===0&&dist(c.x,c.y,chop.x,chop.y)<40){hint('CHOP SHOP · STOP TO SELL THIS RIDE · '+money(carValue(c)));if(Math.abs(c.v||0)<.6){const val=carValue(c);exitCar(true);c.gone=true;chop.cd=900;earn(val,'CHOP SHOP PAID');}}}
 const busking=(keyV||touchBusk)&&!p.car&&!OW().interior&&[T_PLAZA,T_WALK,T_PARK].includes(tileAt(p.x,p.y));
 if(busking){buskT++;hint('BUSKING · '+Math.min(100,Math.round(buskT%150/1.5))+'% TO NEXT TIP');if(buskT%150===0){const crowd=(window.survivors||[]).length;earn(10+Math.random()*24+(data.activePet?12:0),'STREET PERFORMANCE TIPS');void crowd;}}
 else if(keyV&&!p.car)hint('BUSK ON A SIDEWALK, PLAZA OR PARK');
 if(data.activePet&&!p.car&&!OW().interior){petFindT++;const pet=PETS[petKind()];if(pet&&petFindT>pet.findEvery){petFindT=0;earn(pet.find[0]+Math.random()*(pet.find[1]-pet.find[0]),activePetRec().name.toUpperCase()+' '+pet.findLine);}}
 const val=decorValue();if(val>0){rentT++;if(rentT>10800){rentT=0;earn(Math.min(1200,40+val*.03),'APARTMENT GUESTS PAID RENT');}}
}

/* ---------- Store robbery cash animation ---------- */
let bag=null,stacks=[],robRef=null,bagFill=0,bagFade=0;
const stackGeo=new THREE.BoxGeometry(2.6,.9,1.3),bandGeo=new THREE.BoxGeometry(.55,.95,1.36);
function cashStack(){const g=new THREE.Group();add(g,stackGeo,M('#3f8a4a',{ei:.25}));add(g,bandGeo,M('#efe2a6',{ei:.3}));return noShadow(g);}
function bagMesh(){const g=new THREE.Group(),blk=M('#0f0f10',{r:.95,ei:.03}),strap=M('#2a2a2c');
 const body=add(g,new THREE.CylinderGeometry(3.4,3.4,11,14),blk,0,3.4,0);body.rotation.z=Math.PI/2;
 B(g,10.6,.3,2,0,6.6,0,M('#1c1c1e'));for(const x of [-2.6,2.6]){const s=add(g,new THREE.TorusGeometry(2.6,.35,6,14,Math.PI),strap,x,6.4,0);}
 const pile=new THREE.Group();pile.position.y=6.2;g.add(pile);g.userData.pile=pile;return g;}
function updateRobbery(){
 const r=window.level29Places&&level29Places.robbery,scene3=root;
 if(r&&r.phase==='take'){
  if(robRef!==r){robRef=r;bagFill=0;if(bag)root.remove(bag);bag=bagMesh();scene3.add(bag);}
  const v=r.v,cx=v.stationX,cy=v.stationY-24,gy=ground(player.x,player.y),dx=cx-player.x,dy=cy-player.y,dl=Math.hypot(dx,dy)||1;
  const bx=player.x+dx/dl*11-dy/dl*5,by=player.y+dy/dl*11+dx/dl*5;bag.position.set(bx,gy,by);bag.rotation.y=-Math.atan2(dy,dx)+Math.PI/2;bag.visible=true;
  const near=insideVenue(v,player)&&dist(player.x,player.y,v.stationX,v.stationY)<105;
  if(near&&frame%12===0){const m=cashStack();m.position.set(cx,gy+13,cy);root.add(m);stacks.push({m,t:0,from:{x:cx,y:gy+13,z:cy},spin:rnd(-.2,.2)});}
 }else if(robRef){
  if(r&&r.phase==='escape'&&!player.car){const a=view.yaw,gy=ground(player.x,player.y);bag.position.set(player.x+Math.cos(a+1.4)*7,gy+4,player.y+Math.sin(a+1.4)*7);bag.rotation.y=-a;bag.visible=true;}
  else if(!r){bagFade++;if(bagFade>90){root.remove(bag);bag=null;robRef=null;bagFade=0;}}
  else if(bag)bag.visible=false;
 }
 for(let i=stacks.length-1;i>=0;i--){const s=stacks[i];s.t+=1/24;if(!bag){root.remove(s.m);stacks.splice(i,1);continue;}
  const to=bag.position,top=to.y+6.5,t=Math.min(1,s.t);
  s.m.position.set(s.from.x+(to.x-s.from.x)*t,s.from.y+(top-s.from.y)*t+Math.sin(t*Math.PI)*7,s.from.z+(to.z-s.from.z)*t);s.m.rotation.y+=s.spin;s.m.rotation.x=Math.sin(t*Math.PI)*.6;
  if(t>=1){root.remove(s.m);stacks.splice(i,1);bagFill++;const pile=bag.userData.pile;if(pile.children.length<14){const q=cashStack();q.position.set(rnd(-3.5,3.5),pile.children.length*.18,rnd(-.6,.6));q.rotation.y=rnd(-.4,.4);pile.add(q);}bag.scale.setScalar(1+Math.min(bagFill,40)*.012);if(bagFill%4===0)playSfx('coin');}}
}

/* ---------- Pets ---------- */
const PETS={
 dog:{label:'Bayou Hound',price:1500,find:[25,70],findEvery:5400,findLine:'DUG UP CASH',desc:'Loyal hound. Digs up buried cash on walks.'},
 cat:{label:'Alley Cat',price:1200,find:[15,45],findEvery:4200,findLine:'BROUGHT YOU A WALLET',desc:'Sneaky tabby. Steals wallets from strangers.'},
 parrot:{label:'Mardi Gras Parrot',price:2200,find:[30,90],findEvery:6000,findLine:'CHARMED A TOURIST',desc:'Rides your shoulder and charms tips out of tourists.'},
 pig:{label:'Truffle Pig',price:1800,find:[60,160],findEvery:9000,findLine:'SNIFFED OUT TRUFFLES',desc:'Finds rare truffles worth real money.'},
 gator:{label:'Baby Gator',price:4800,find:[40,120],findEvery:7200,findLine:'SCARED UP A BOUNTY',desc:'Wild gators leave you alone while it rides with you.'}
};
const activePetRec=()=>data.pets.find(p=>p.id===data.activePet);
const petKind=()=>activePetRec()?.kind;
function petMesh(kind,col){
 const g=new THREE.Group(),c=M(col,{ei:.2}),dk=M('#1b1410'),pink=M('#e79aa2'),legs=[];
 if(kind==='dog'||kind==='cat'||kind==='pig'){
  const big=kind==='dog',pig=kind==='pig',L=big?9:pig?8:7,H=big?4.4:pig?5:3.4;
  B(g,L,H,H*.9,0,H/2+3.2,0,c);const head=B(g,H,H*.9,H*.85,L/2+H*.35,H+3.6,0,c);
  if(kind==='dog'){B(g,2.6,1.8,2.2,L/2+H*.9,H+2.8,0,c);B(head,.8,2.8,1.2,-.4,1.8,-1.4,dk);B(head,.8,2.8,1.2,-.4,1.8,1.4,dk);B(g,1.2,1,1,L/2+H*1.35,H+3.2,0,dk);}
  if(kind==='cat'){for(const z of [-1,1])add(head,new THREE.ConeGeometry(.8,1.8,4),c,0,2,z);const t=B(g,.8,.8,6,-L/2-1,H+5,0,c);t.rotation.x=0;t.rotation.z=.9;t.scale.set(1,1,1);}
  if(pig){B(g,1.4,1.8,2.2,L/2+H*.8,H+3.2,0,pink);for(const z of [-1.3,1.3])add(head,new THREE.ConeGeometry(.9,1.4,4),c,0,2.4,z).rotation.x=z>0?.5:-.5;}
  for(const z of [-1.3,1.3])S(head,.45,H/2+.05,.6,z*(H/4),dk);
  if(kind==='dog'){const t=B(g,4,.9,.9,-L/2-1.6,H+4.4,0,c);t.rotation.z=.6;g.userData.tail=t;}
  for(const [x,z] of [[L/2-1.2,1.3],[L/2-1.2,-1.3],[-L/2+1.2,1.3],[-L/2+1.2,-1.3]])legs.push(B(g,1.3,3.4,1.3,x,1.7,z*(H/3.4),c));
 }else if(kind==='parrot'){
  S(g,1.8,0,4,0,c,1,1.5,1);S(g,1.3,.4,6.6,0,c);B(g,1,.8,.6,1.7,6.4,0,M('#f2c33a'));for(const z of [-1.3,1.3]){S(g,.3,1.1,7,z*.6,dk);const w=B(g,1,3.6,.5,-.3,4,z*1.5,M('#2d8bd8',{ei:.2}));legs.push(w);}
  B(g,.6,4,1.2,-1.8,1.6,0,M('#2fb33a',{ei:.2})).rotation.z=.4;
 }else{const m=gatorMesh(.32);g.add(m);legs.push(...m.userData.legs);g.userData.gtail=m.userData.tail;}
 g.userData.legs=legs;return noShadow(g);
}
const PET_COLORS={dog:'#9a6a3a',cat:'#d8893a',parrot:'#d23a32',pig:'#efb0b4',gator:'#3b4a26'};
let petObj=null,petRef=null;
function updatePet(){
 const rec=activePetRec();if(!rec||!player){if(petObj){root.remove(petObj.m);petObj=null;}return;}
 if(petRef!==rec.id||!petObj){if(petObj)root.remove(petObj.m);petObj={m:petMesh(rec.kind,rec.col||PET_COLORS[rec.kind]),x:player.x-12,y:player.y,a:0};root.add(petObj.m);petRef=rec.id;}
 const P=petObj,m=P.m;m.visible=!player.car&&state!=='menu';if(!m.visible){P.x=player.x;P.y=player.y;return;}
 const a=view.yaw,parrot=rec.kind==='parrot',tx=parrot?player.x+Math.cos(a+1.6)*5:player.x-Math.cos(a)*14+Math.cos(a+1.6)*7,ty=parrot?player.y+Math.sin(a+1.6)*5:player.y-Math.sin(a)*14+Math.sin(a+1.6)*7;
 const d=dist(P.x,P.y,tx,ty);if(d>260){P.x=tx;P.y=ty;}
 const moving=d>3;if(moving){const sp=Math.min(d*.12,4.2);P.a=Math.atan2(ty-P.y,tx-P.x);P.x+=Math.cos(P.a)*sp;P.y+=Math.sin(P.a)*sp;}
 const gy=ground(P.x,P.y),t=frame*.4;m.position.set(P.x,gy+(parrot?14+Math.sin(frame*.1)*.6:moving?Math.abs(Math.sin(t))*.6:0),P.y);m.rotation.y=-(moving?P.a:a);
 m.userData.legs.forEach((l,i)=>{if(parrot)l.rotation.x=moving?Math.sin(t*2+i*3)*.6:0;else l.rotation.z=moving?Math.sin(t+(i%2?0:Math.PI))*.5:0;});
 if(m.userData.tail)m.userData.tail.rotation.y=Math.sin(frame*.5)*.5;
}

/* ---------- Apartment decor ---------- */
const DECOR={
 sofa:{label:'Velvet sofa',price:650},bed:{label:'King bed',price:900},tv:{label:'85" TV wall',price:1200},rug:{label:'Mardi Gras rug',price:250},
 plant:{label:'Potted palm',price:120},lamp:{label:'Brass floor lamp',price:180},aquarium:{label:'Reef aquarium',price:2200},pool:{label:'Pool table',price:3200},
 bar:{label:'Home bar',price:2600},art:{label:'Jester canvas',price:400},jukebox:{label:'Neon jukebox',price:1500},dining:{label:'Dining set',price:700},
 rig:{label:'Gaming rig',price:1800},statue:{label:'Gold jester statue',price:5000},petbed:{label:'Pet bed',price:200}
};
const PAINTS={cream:['#eee7d9',0],purple:['#5b2a7a',400],teal:['#2b6f73',400],charcoal:['#2f3236',400],gold:['#c9a24a',400],green:['#2f6a3a',400]};
const FLOORS={oak:[['#8a6440','#7a5636'],0],marble:[['#e9e6df','#cfcac0'],600],checker:[['#ece6d6','#1e1e22'],600],carpet:[['#4a2466','#3d1d55'],600],gold:[['#b48a3a','#9a7430'],900]};
function decorMesh(kind){
 const g=new THREE.Group();const w=(c,o)=>M(c,o);
 switch(kind){
  case 'sofa':B(g,30,6,12,0,4,0,w('#6a2a8a'));B(g,30,9,3.5,0,9,-5,w('#6a2a8a'));for(const x of [-15,15])B(g,3,9,12,x,5,0,w('#5a2276'));for(const x of [-8,8])B(g,12,2,9,x,8,1,w('#8a3fb0'));break;
  case 'bed':B(g,30,5,36,0,3,0,w('#5a3c26'));B(g,28,4,34,0,7,0,w('#f2efe6'));B(g,30,16,2,0,8,-18,w('#3c281a'));for(const x of [-7,7])B(g,10,3,6,x,10,-13,w('#ffffff'));B(g,28,1.4,20,0,9.4,6,w('#2fb33a'));break;
  case 'tv':B(g,40,3,10,0,6,0,w('#222'));B(g,46,26,1.4,0,26,-3,w('#0b0b0d',{m:.4,r:.2}));B(g,43,23,.4,0,26,-2.2,new THREE.MeshBasicMaterial({color:'#3a7ad8'}));break;
  case 'rug':{const r=add(g,new THREE.PlaneGeometry(40,28).rotateX(-Math.PI/2),w('#6a2a8a',{side:THREE.DoubleSide}),0,.5,0);B(g,34,.3,4,0,.6,0,w('#f2b51c'));B(g,4,.3,22,0,.6,0,w('#2fb33a'));void r;break;}
  case 'plant':Cy(g,3,2.4,6,0,3,0,w('#b8643a'));for(let i=0;i<6;i++){const l=add(g,new THREE.ConeGeometry(1.4,12,4),w('#2f8a3a'),0,11,0);l.rotation.set(Math.cos(i)*.8,0,Math.sin(i*1.7)*.8);}break;
  case 'lamp':Cy(g,3,3,1,0,.5,0,w('#b8943a',{m:.7,r:.3}));Cy(g,.5,.5,26,0,13,0,w('#b8943a',{m:.7,r:.3}));Cy(g,3,5,6,0,27,0,new THREE.MeshBasicMaterial({color:'#fff2c8'}));break;
  case 'aquarium':B(g,24,10,10,0,5,0,w('#2a2a2c'));B(g,24,14,10,0,17,0,M('#5ec8e8',{t:.45,ei:.5}));for(let i=0;i<5;i++)B(g,2,1.2,.5,-8+i*4,14+i%3*3,0,w(['#ff8a2a','#f2e23a','#e83a8a'][i%3],{ei:.5}));break;
  case 'pool':B(g,40,4,22,0,13,0,w('#5a3c26'));B(g,36,1,18,0,15.4,0,w('#2f7a3a'));for(const [x,z] of [[-17,-9],[17,-9],[-17,9],[17,9]])B(g,3,12,3,x,6,z,w('#3c281a'));for(let i=0;i<6;i++)S(g,.9,-6+i*2.2,16.6,(i%2)*1.6,w(['#f2b51c','#d23a32','#2d6ad8','#f2f2f2'][i%4]));break;
  case 'bar':B(g,34,15,8,0,7.5,0,w('#3c281a'));B(g,36,1.4,10,0,15.6,0,w('#c9a24a',{m:.6,r:.3}));B(g,34,22,3,0,24,-8,w('#2a1c12'));for(let i=0;i<7;i++)Cy(g,.8,.8,4,-12+i*4,26,-7,w(['#3a8a4a','#8a3a2a','#d8b04a'][i%3],{t:.8,ei:.4}));for(const x of [-10,0,10])Cy(g,2.4,2.4,1,x,10,8,w('#d23a32'));break;
  case 'art':B(g,22,16,1,0,22,0,w('#c9a24a',{m:.5}));B(g,19,13,.4,0,22,.6,w('#6a2a8a'));S(g,3.4,0,22,1,w('#e4bd72'));for(const x of [-4,4])add(g,new THREE.ConeGeometry(1.6,5,6),w(x<0?'#2fb33a':'#f2b51c'),x,27,.8).rotation.z=x<0?.6:-.6;break;
  case 'jukebox':B(g,12,20,8,0,10,0,w('#8a2a3a'));Cy(g,6,6,8,0,20,0,w('#f2b51c',{ei:.5})).rotation.x=Math.PI/2;B(g,9,8,.5,0,11,4.2,new THREE.MeshBasicMaterial({color:'#7af0ff'}));break;
  case 'dining':Cy(g,10,10,1.2,0,12,0,w('#5a3c26'));Cy(g,1.2,1.6,12,0,6,0,w('#3c281a'));for(let i=0;i<4;i++){const a=i/4*Math.PI*2;B(g,5,7,5,Math.cos(a)*13,3.5,Math.sin(a)*13,w('#6a2a8a'));}break;
  case 'rig':B(g,26,1.4,12,0,12,0,w('#1a1a1c'));for(const x of [-11,11])B(g,1.4,12,10,x,6,0,w('#1a1a1c'));for(const x of [-7,7])B(g,11,7,.6,x,18,-3,new THREE.MeshBasicMaterial({color:x<0?'#a33af0':'#2af0a0'}));B(g,6,10,8,15,5,0,w('#222',{ei:.2}));B(g,6,10,.3,15,5,4.2,new THREE.MeshBasicMaterial({color:'#ff3ac8'}));break;
  case 'statue':B(g,10,8,10,0,4,0,w('#2a2a2c'));S(g,4,0,16,0,M('#f2b51c',{m:.8,r:.25,ei:.35}),1,1.3,1);S(g,3,0,24,0,M('#f2b51c',{m:.8,r:.25,ei:.35}));for(const z of [-3,0,3])add(g,new THREE.ConeGeometry(1.4,6,6),M('#f2b51c',{m:.8,r:.25,ei:.35}),0,29,z).rotation.x=z*.25;break;
  case 'petbed':Cy(g,7,7,2,0,1,0,w('#6a2a8a'));Cy(g,5.5,5.5,1,0,2,0,w('#f2e6c8'));break;
 }
 return g;
}
let decorGroup=null,decorFor=null,paintMeshes=[],floorMesh=null;
const room=()=>city&&city.residence;
function floorTex(key){const cols=FLOORS[key][0],cv=document.createElement('canvas');cv.width=cv.height=64;const g=cv.getContext('2d');
 if(key==='oak'||key==='gold'){for(let i=0;i<8;i++){g.fillStyle=cols[i%2];g.fillRect(0,i*8,64,8);}g.fillStyle='rgba(0,0,0,.15)';for(let i=0;i<8;i++)g.fillRect((i*23)%64,i*8,1,8);}
 else if(key==='carpet'){g.fillStyle=cols[0];g.fillRect(0,0,64,64);g.fillStyle=cols[1];for(let i=0;i<60;i++)g.fillRect(Math.random()*64,Math.random()*64,2,2);}
 else for(let y=0;y<2;y++)for(let x=0;x<2;x++){g.fillStyle=(x+y)%2?cols[1]:cols[0];g.fillRect(x*32,y*32,32,32);}
 const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;const r=room();if(r)t.repeat.set(r.b.w/48,r.b.h/48);t.encoding=THREE.sRGBEncoding;return t;}
function rebuildDecor(){
 const r=room();if(decorGroup){scene.remove(decorGroup);decorGroup=null;}if(!r)return;decorFor=r;decorGroup=new THREE.Group();scene.add(decorGroup);
 const b=r.b,f=r.floor;
 floorMesh=add(decorGroup,new THREE.PlaneGeometry(b.w-6,b.h-6).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({map:floorTex(data.floor),roughness:data.floor==='marble'?.25:.7,metalness:data.floor==='marble'?.15:0}),b.x+b.w/2,f+.35,b.y+b.h/2);
 const pc=PAINTS[data.paint][0],pm=new THREE.MeshStandardMaterial({color:pc,roughness:.8,emissive:pc,emissiveIntensity:.12});
 paintMeshes=(r.apartmentWalls||[]).slice(4).map(q=>B(decorGroup,q.w+.8,34,q.h+.8,q.x+q.w/2,f+17.5,q.y+q.h/2,pm));
 for(const d of data.decor){const m=decorMesh(d.kind);m.position.set(d.x,f+.4,d.y);m.rotation.y=d.r||0;decorGroup.add(m);d._m=m;}
}
const decorValue=()=>data.decor.reduce((s,d)=>s+(DECOR[d.kind]?.price||0),0);
function frontSpot(dist0=26){const r=room(),a=view.yaw;let x=player.x+Math.cos(a)*dist0,y=player.y+Math.sin(a)*dist0;if(r){x=Math.max(r.b.x+14,Math.min(r.b.x+r.b.w-14,x));y=Math.max(r.b.y+14,Math.min(r.b.y+r.b.h-14,y));}return {x,y};}
const inApartment=()=>OW().interior==='apartment';

/* ---------- UI ---------- */
const css=document.createElement('style');css.textContent=`
#lifePanel{display:none;position:fixed;inset:0;z-index:42;align-items:center;justify-content:center;padding:18px;box-sizing:border-box;background:rgba(5,8,10,.74);font-family:'Barlow Condensed',sans-serif;color:#f1ecda}
#lifePanel .lp{width:min(760px,100%);max-height:88vh;overflow:auto;background:#14111a;border:1px solid #5b3a78;border-radius:10px;padding:18px 20px;box-shadow:0 20px 60px rgba(0,0,0,.6)}
#lifePanel h2{margin:0 0 2px;font-size:28px;letter-spacing:.04em;color:#f2b51c}#lifePanel .sub{margin:0 0 12px;color:#b9b0c8;font-size:15px}
#lifePanel .tabs{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap}#lifePanel .tabs button,#lifePanel .row button{font:inherit;font-size:15px;letter-spacing:.05em;background:#2a2036;color:#f1ecda;border:1px solid #5b3a78;border-radius:6px;padding:6px 12px;cursor:pointer}
#lifePanel .tabs button.on{background:#8a1fb0;border-color:#c06ae0}#lifePanel .row button:hover{background:#3a2c4c}#lifePanel .row button.buy{background:#2f7a3a;border-color:#4fb35a}#lifePanel .row button:disabled{opacity:.45;cursor:not-allowed}
#lifePanel .row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #2a2234}#lifePanel .row .t{flex:1;min-width:0}#lifePanel .row b{display:block;font-size:18px}#lifePanel .row span{color:#b9b0c8;font-size:14px}
#lifePanel .acts{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}#lifePanel .foot{margin-top:12px;display:flex;justify-content:space-between;align-items:center;color:#b9b0c8;font-size:14px}
#lifeHint{position:fixed;left:50%;bottom:118px;transform:translateX(-50%);z-index:30;padding:6px 14px;border-radius:6px;background:rgba(20,17,26,.82);border:1px solid #8a1fb0;color:#f2e6c8;font:16px 'Barlow Condensed',sans-serif;letter-spacing:.06em;pointer-events:none;display:none}`;
document.head.appendChild(css);
const panel=document.createElement('div');panel.id='lifePanel';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','City life menu');document.body.appendChild(panel);
const hintEl=document.createElement('div');hintEl.id='lifeHint';hintEl.setAttribute('aria-live','polite');document.body.appendChild(hintEl);
let hintT=0;function hint(t){if(hintEl.textContent!==t)hintEl.textContent=t;if(hintT===0)hintEl.style.display='block';hintT=8;}
let tab='hustles',prevState=null;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const row=(title,desc,acts)=>`<div class="row"><div class="t"><b>${esc(title)}</b><span>${esc(desc)}</span></div><div class="acts">${acts}</div></div>`;
const btn=(label,act,opts={})=>`<button type="button" data-life="${act}" class="${opts.buy?'buy':''}" ${opts.off?'disabled':''}>${esc(label)}</button>`;
function render(){
 const tabs=[['hustles','Hustles'],['pets','Pets'],['home','Apartment']].map(([k,l])=>`<button type="button" data-tab="${k}" class="${tab===k?'on':''}">${l}</button>`).join('');
 let h='';
 if(tab==='hustles'){
  const c=chop&&player?Math.round(dist(player.x,player.y,chop.x,chop.y)/TILE):null;
  h+=row('Gator hunting','Shoot or run over alligators in the bayou. Each hide sells for $110 to $170.','');
  h+=row('Scrap collecting','Walk over glinting scrap piles on lots, sidewalks and parks for $20 to $60.','');
  h+=row('Street performing','Hold V on a sidewalk, plaza or park to busk for tips. Pets earn bigger tips.','');
  h+=row('Chop shop','Drive any car you do not own into the orange beacon and stop. Paid by model and condition.'+(c!=null?' About '+c+' blocks away.':''),'');
  h+=row('Pet finds','Walk your pet around the city. Each pet finds a different kind of loot.','');
  h+=row('Apartment rentals','Decorated apartments earn rent from guests every few minutes. Current decor value '+money(decorValue())+'.','');
  h+=`<div class="foot"><span>Side hustle earnings ${money(data.earned||0)}</span><span>Cash ${money(cash)}</span></div>`;
 }else if(tab==='pets'){
  for(const [k,p] of Object.entries(PETS)){const owned=data.pets.find(x=>x.kind===k);
   h+=row(p.label+(owned?' · '+owned.name:''),p.desc+' '+money(p.price)+'.',owned?(data.activePet===owned.id?btn('Leave at home','pet-home:'+owned.id):btn('Walk with me','pet-walk:'+owned.id)):btn('Adopt · '+money(p.price),'pet-buy:'+k,{buy:1,off:cash<p.price}));}
  h+=`<div class="foot"><span>Pets live in your highrise apartment.</span><span>Cash ${money(cash)}</span></div>`;
 }else{
  if(!inApartment()){h+=row('Not at home','Take the lobby lift to your apartment on floor 29 to decorate, then press K.','');}
  else{
   h+=`<div class="sub">New items are placed in front of you. Turn to face a spot, then use Move here to rearrange.</div>`;
   h+=row('Wall paint','Repaint the interior walls.',Object.entries(PAINTS).map(([k,[c,p]])=>btn((data.paint===k?'✓ ':'')+k+(p&&data.paint!==k?' $'+p:''),'paint:'+k,{off:data.paint!==k&&cash<p})).join(''));
   h+=row('Flooring','Replace the apartment floor.',Object.entries(FLOORS).map(([k,[,p]])=>btn((data.floor===k?'✓ ':'')+k+(p&&data.floor!==k?' $'+p:''),'floor:'+k,{off:data.floor!==k&&cash<p})).join(''));
   for(const [k,d] of Object.entries(DECOR))h+=row(d.label,money(d.price),btn('Buy','buy:'+k,{buy:1,off:cash<d.price}));
   if(data.decor.length){h+=`<div class="sub" style="margin-top:12px">Your furniture</div>`;data.decor.forEach((d,i)=>{h+=row(DECOR[d.kind].label,'Arrange this item.',btn('Move here','move:'+i)+btn('Rotate','rot:'+i)+btn('Sell','sell:'+i));});}
  }
  h+=`<div class="foot"><span>Decor value ${money(decorValue())}</span><span>Cash ${money(cash)}</span></div>`;
 }
 panel.innerHTML=`<div class="lp"><h2>City Life</h2><p class="sub">Hustles, pets and your highrise apartment. Press K or Esc to close.</p><div class="tabs" role="tablist">${tabs}</div>${h}</div>`;
}
function open(t){if(!player||state==='menu')return;if(t)tab=t;else if(inApartment())tab='home';prevState=state==='shop'?'play':state;state='shop';try{mouse.down=false;for(const k in keys)keys[k]=false;document.exitPointerLock&&document.exitPointerLock();}catch(_){}render();panel.style.display='flex';}
function close(){panel.style.display='none';if(state==='shop')state=prevState||'play';try{for(const k in keys)keys[k]=false;mouse.down=false;}catch(_){}}
panel.addEventListener('click',e=>{
 if(e.target===panel)return close();const tb=e.target.closest('[data-tab]');if(tb){tab=tb.dataset.tab;render();return;}
 const b=e.target.closest('[data-life]');if(!b||b.disabled)return;const [a,arg]=b.dataset.life.split(':');
 if(a==='pet-buy'){const p=PETS[arg];if(cash<p.price)return;cash-=p.price;const names={dog:'Boudreaux',cat:'Praline',parrot:'Beignet',pig:'Andouille',gator:'Thibodeaux'};const rec={id:Date.now().toString(36),kind:arg,name:names[arg],col:PET_COLORS[arg]};data.pets.push(rec);data.activePet=rec.id;persist();toast(rec.name.toUpperCase()+' THE '+p.label.toUpperCase()+' IS YOURS');playSfx('coin');}
 else if(a==='pet-walk'){data.activePet=arg;persist();}
 else if(a==='pet-home'){data.activePet=null;persist();}
 else if(a==='paint'){const p=PAINTS[arg][1];if(data.paint!==arg){if(cash<p)return;cash-=p;data.paint=arg;persist();rebuildDecor();toast('WALLS PAINTED '+arg.toUpperCase());}}
 else if(a==='floor'){const p=FLOORS[arg][1];if(data.floor!==arg){if(cash<p)return;cash-=p;data.floor=arg;persist();rebuildDecor();toast('NEW '+arg.toUpperCase()+' FLOORS');}}
 else if(a==='buy'){const d=DECOR[arg];if(cash<d.price||!inApartment())return;cash-=d.price;const s=frontSpot();data.decor.push({kind:arg,x:s.x,y:s.y,r:-view.yaw-Math.PI/2});persist();rebuildDecor();toast(d.label.toUpperCase()+' DELIVERED');playSfx('coin');}
 else if(a==='move'){const d=data.decor[+arg];if(d){const s=frontSpot();d.x=s.x;d.y=s.y;persist();rebuildDecor();}}
 else if(a==='rot'){const d=data.decor[+arg];if(d){d.r=(d.r||0)+Math.PI/4;persist();rebuildDecor();}}
 else if(a==='sell'){const d=data.decor[+arg];if(d){cash+=Math.round(DECOR[d.kind].price*.5);data.decor.splice(+arg,1);persist();rebuildDecor();toast('SOLD FOR HALF PRICE');}}
 render();
});
addEventListener('keydown',e=>{if(e.target?.matches&&e.target.matches('input,textarea,select'))return;const k=e.key.toLowerCase();
 if(panel.style.display!=='none'&&(k==='escape'||k==='k')){e.preventDefault();e.stopImmediatePropagation();close();return;}
 if(k==='k'&&!e.repeat&&state==='play'){e.preventDefault();open();return;}
 if(k==='v')keyV=true;},true);
addEventListener('keyup',e=>{if(e.key.toLowerCase()==='v'){keyV=false;buskT=0;}});
addEventListener('blur',()=>{keyV=false;});

/* ---------- Doors ---------- */
function updateDoors(){
 if(!player||!city.venues)return;const p=player.car||player;
 const rob=window.level29Places&&level29Places.robbery;
 for(const v of city.venues){if(v.doorX==null)continue;const d=dist(p.x,p.y,v.doorX,v.doorY);
  if(v.open){const b=v.b,inside=p.x>b.x&&p.x<b.x+b.w&&p.y>b.y&&p.y<b.y+b.h;
   if(v.autoOpened&&!inside&&d>160&&!(rob&&rob.v===v)){v.open=false;v.autoOpened=false;}continue;}
  if(v.vehicle?(player.car&&d<90):(!player.car&&d<60)){v.open=true;v.autoOpened=true;playSfx('door');}}
}

/* ---------- Main loop ---------- */
function rebuild(){
 if(root)scene.remove(root);root=new THREE.Group();root.name='level29Life';scene.add(root);builtFor=city;
 gators=[];flocks=[];egrets=[];pigeons=[];scrap=[];mist=[];chop=null;bag=null;stacks=[];robRef=null;petObj=null;
 shoreline=scanShore();
 try{buildBayou();}catch(e){console.warn('bayou',e);}
 try{spawnGators();spawnBirds();spawnScrap();buildChop();}catch(e){console.warn('life',e);}
 root.children.forEach(c=>{if(!c.isInstancedMesh)noShadow(c);});
 rebuildDecor();
 // Compile shaders for robbery cash, the bag and pets up front so they don't stall play the first time they appear.
 try{const warm=[cashStack(),bagMesh(),...Object.keys(PETS).map(k=>petMesh(k,PET_COLORS[k]))];warm.forEach(w=>{noShadow(w);w.position.set(0,-400,0);root.add(w);});
  if(typeof renderer!=='undefined'&&renderer&&camera)renderer.compile(scene,camera);warm.forEach(w=>root.remove(w));}catch(e){console.warn('life warmup',e);}
}
const prevUpdate=update;
update=function(){
 prevUpdate();
 try{
  if(typeof scene==='undefined'||!scene||!city||!city.world)return;
  if(builtFor!==city||!root||root.parent!==scene)rebuild();
  root.visible=state!=='menu';if(decorGroup)decorGroup.visible=inApartment();
  if(state!=='play')return;
  updateDoors();updateRobbery();updateGators();updateBirds();updateHustles();updatePet();
  for(const m of mist)m.m.position.x=m.x+Math.sin(frame*.002+m.ph)*30;
  if(hintT>0&&--hintT===0)hintEl.style.display='none';
 }catch(e){console.warn('life update',e);}
};
window.level29Life={open,close,get data(){return data;},get gators(){return gators;},get chop(){return chop;},get shoreline(){return shoreline.length;},setBusk:v=>{touchBusk=!!v;if(!v)buskT=0;}};
})();
