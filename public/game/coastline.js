// Level 29 coastline update: penthouse stairs, 2 guests + cinema camera, free residence safehouse, character dancers,
// 2v2 basketball court (enemy-free), airstrip past the mountains, Santa Monica Pier behind the penthouse,
// detailed mountains and an image-based lighting pass for interiors and cars.
(function(){
'use strict';
const T=TILE;
const isWorld=c=>!!(c&&c.world&&c.width===WORLD_SIZE);
const d2=(ax,ay,bx,by)=>Math.hypot(ax-bx,ay-by);
const money=n=>'$'+Math.floor(n).toLocaleString();
const inRect=(x,y,r,m)=>{m=m||0;return x>r.x-m&&x<r.x+r.w+m&&y>r.y-m&&y<r.y+r.h+m;};
const rectHit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const tileRect=r=>({x:r.x0*T,y:r.y0*T,w:(r.x1-r.x0+1)*T,h:(r.y1-r.y0+1)*T});
const std=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.7,metalness:.05},o||{}));
function box(g,w,h,d,x,y,z,m){const me=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);me.position.set(x,y,z);g.add(me);return me;}
function cyl(g,r1,r2,h,x,y,z,m,seg){const me=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg||12),m);me.position.set(x,y,z);g.add(me);return me;}
function textTex(text,fg,bg,w,h){const cv=document.createElement('canvas');cv.width=w||1024;cv.height=h||128;const g=cv.getContext('2d');
  g.fillStyle=bg||'#111';g.fillRect(0,0,cv.width,cv.height);g.fillStyle=fg||'#fff';g.textAlign='center';g.textBaseline='middle';
  let size=Math.floor(cv.height*.6);g.font="900 "+size+"px 'Barlow Condensed',sans-serif";while(g.measureText(text).width>cv.width*.94&&size>10){size-=2;g.font="900 "+size+"px 'Barlow Condensed',sans-serif";}
  g.fillText(text,cv.width/2,cv.height/2);const t=new THREE.CanvasTexture(cv);return t;}
function sign(g,text,w,h,x,y,z,fg,bg,rotY){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:textTex(text,fg,bg),side:THREE.DoubleSide}));m.position.set(x,y,z);if(rotY)m.rotation.y=rotY;g.add(m);return m;}

// ---------------------------------------------------------------- map layout
let pier=null,strip=null,court=null,flats=[];
function frameFor(side,along,c){const Wp=c.width*T,Hp=c.height*T;
  const n=side==='L'?[1,0]:side==='R'?[-1,0]:side==='T'?[0,1]:[0,-1];
  const o=side==='L'?[0,along]:side==='R'?[Wp,along]:side==='T'?[along,0]:[along,Hp];
  const th=Math.atan2(n[0],n[1]),t=[Math.cos(th),-Math.sin(th)];
  return {side,n,o,t,th,toWorld:(u,v)=>({x:o[0]+t[0]*u+n[0]*v,y:o[1]+t[1]*u+n[1]*v}),toLocal:(x,y)=>{const dx=x-o[0],dy=y-o[1];return {u:dx*t[0]+dy*t[1],v:dx*n[0]+dy*n[1]};}};}
function nearestSide(c,x0,y0,x1,y1){const Wp=c.width*T,Hp=c.height*T;const d={L:x0,R:Wp-x1,T:y0,B:Hp-y1};return Object.keys(d).sort((a,b)=>d[a]-d[b])[0];}
function clearArea(c,r,keep){
  const hit=(x,y,m)=>inRect(x,y,r,m);
  c.trees=(c.trees||[]).filter(t=>!hit(t.x,t.y,20));
  if(c.pineTrees)c.pineTrees=c.pineTrees.filter(t=>!hit(t.x,t.y,20));
  if(c.rocks)c.rocks=c.rocks.filter(t=>!hit(t.x,t.y,20));
  c.parked=(c.parked||[]).filter(p=>!hit(p.x,p.y,30));
  c.features=(c.features||[]).filter(f=>!(f.kind==='forest'&&typeof f.x==='number'&&rectHit(r,{x:f.x,y:f.y,w:f.w||0,h:f.h||0})));
  c.buildings=(c.buildings||[]).filter(b=>b.venue||keep.includes(b)||!rectHit(r,b));
}
function keptBuilding(c,x,y){for(const b of c.buildings||[])if(x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h)return true;return false;}

function layoutPier(c){
  if(!c.mansion)return null;const B=c.mansion.B,mx=B.x+B.w/2,my=B.y+B.h/2;
  const side=nearestSide(c,B.x,B.y,B.x+B.w,B.y+B.h),vert=side==='L'||side==='R';let along=vert?my:mx;
  // Sit the pier down the coast from the penthouse with a 6-tile gap instead of directly in front of it.
  const span=(vert?c.height:c.width)*T,shift=(vert?B.h:B.w)/2+17*T,dir=along<span/2?1:-1,fitsAt=a=>a>12*T&&a<span-12*T;
  if(fitsAt(along+dir*shift))along+=dir*shift;else if(fitsAt(along-dir*shift))along-=dir*shift;
  const F=frameFor(side,along,c);const depth=10;
  const water=Math.max(5,depth-3);
  const W=c.width,H=c.height;let bx0=1e9,by0=1e9,bx1=-1,by1=-1;
  for(const [u,v] of [[-11*T,0],[11*T,0],[-11*T,depth*T],[11*T,depth*T]]){const p=F.toWorld(u,v);bx0=Math.min(bx0,p.x);by0=Math.min(by0,p.y);bx1=Math.max(bx1,p.x);by1=Math.max(by1,p.y);}
  const rect={x:bx0,y:by0,w:bx1-bx0,h:by1-by0};
  clearArea(c,rect,[B]);
  const mansionPad={x:B.x-T,y:B.y-T,w:B.w+2*T,h:B.h+2*T};
  for(let ty=Math.max(0,Math.floor(by0/T));ty<=Math.min(H-1,Math.ceil(by1/T));ty++)for(let tx=Math.max(0,Math.floor(bx0/T));tx<=Math.min(W-1,Math.ceil(bx1/T));tx++){
    const px=(tx+.5)*T,py=(ty+.5)*T;if(inRect(px,py,mansionPad)||keptBuilding(c,px,py))continue;
    const l=F.toLocal(px,py),u=l.u/T,v=l.v/T;if(Math.abs(u)>11||v<0||v>=depth)continue;
    const deck=(Math.abs(u)<=2.5&&v>=1&&v<water+1)||(Math.abs(u)<=6&&v>=1&&v<6.5);
    c.g[ty*W+tx]=deck?T_BRIDGE:v<water?T_WATER:T_SAND;}
  flats.push(rect);
  return {F,rect,water,depth};
}
function layoutStrip(c,avoid){
  const mt=(c.features||[]).filter(f=>f.kind==='mountain'&&typeof f.x==='number');
  const Wp=c.width*T,Hp=c.height*T;let x0=1e9,y0=1e9,x1=-1,y1=-1;
  for(const f of mt){x0=Math.min(x0,f.x);y0=Math.min(y0,f.y);x1=Math.max(x1,f.x+f.w);y1=Math.max(y1,f.y+f.h);}
  if(!mt.length){x0=Wp*.8;x1=Wp;y0=Hp*.4;y1=Hp*.6;}
  const side=nearestSide(c,x0,y0,x1,y1),w=12,h=11,W=c.width,H=c.height;
  const target=side==='L'||side==='R'?(y0+y1)/2/T:(x0+x1)/2/T;
  const cost=(rx,ry)=>{let s=0;for(let y=ry;y<ry+h;y++)for(let x=rx;x<rx+w;x++){const t=c.g[y*W+x];s+=t===T_WATER||t===T_BRIDGE?40:t===T_BLD?8:t===T_ROAD?1:0;}return s;};
  let best=null,bc=1e12;
  const span=side==='L'||side==='R'?H-h-2:W-w-2;
  for(let a=2;a<span;a++){
    const rx=side==='L'?1:side==='R'?W-w-1:a,ry=side==='T'?1:side==='B'?H-h-1:a;
    const r=tileRect({x0:rx,y0:ry,x1:rx+w-1,y1:ry+h-1});if(avoid.some(o=>rectHit(r,o)))continue;
    const k=cost(rx,ry)+Math.abs(a-target)*.6;if(k<bc){bc=k;best={x0:rx,y0:ry,x1:rx+w-1,y1:ry+h-1};}}
  if(!best)return null;
  const r=tileRect(best);clearArea(c,r,c.mansion?[c.mansion.B]:[]);
  for(let y=best.y0;y<=best.y1;y++)for(let x=best.x0;x<=best.x1;x++){if(keptBuilding(c,(x+.5)*T,(y+.5)*T))continue;c.g[y*W+x]=T_PLAZA;}
  const fb={x0:best.x0,y0:best.y0,x1:best.x0+3,y1:best.y0+3};
  for(let y=fb.y0;y<=fb.y1;y++)for(let x=fb.x0;x<=fb.x1;x++)c.g[y*W+x]=T_BLD;
  flats.push(r);
  return Object.assign(best,{fb,door:{x:(fb.x0+fb.x1+1)/2*T,y:(fb.y1+1)*T+24},side});
}
function layoutCourt(c,avoid){
  const W=c.width,H=c.height;
  const ref=c.residence?c.residence.lobby:{x:W*T/2,y:H*T/2},tx0=ref.x/T,ty0=ref.y/T;let best=null;
  const DL=window.level29Downtown&&window.level29Downtown.lots;const taken=avoid.slice();if(DL)for(const k in DL)taken.push(tileRect(DL[k]));
  const tries=[[8,5,1,t=>t===T_GRASS||t===T_PARK||t===T_LOT],[8,5,0,t=>t===T_GRASS||t===T_PARK||t===T_LOT||t===T_SAND],[6,4,0,t=>t===T_GRASS||t===T_PARK||t===T_LOT||t===T_SAND||t===T_PLAZA],
    [8,5,0,t=>t!==T_WATER&&t!==T_BRIDGE&&t!==T_BLD&&t!==T_ROAD],[6,4,0,t=>t!==T_WATER&&t!==T_BRIDGE&&t!==T_BLD]];
  for(const [w,h,m,ok] of tries){let bd=1e9;
    for(let y=4;y+h<H-4;y++)for(let x=4;x+w<W-4;x++){const d=Math.abs(x-tx0)+Math.abs(y-ty0);if(d>=bd)continue;
      let good=true;for(let yy=y-m;yy<y+h+m&&good;yy++)for(let xx=x-m;xx<x+w+m;xx++)if(!ok(c.g[yy*W+xx])||keptBuilding(c,(xx+.5)*T,(yy+.5)*T)){good=false;break;}
      if(good){const r=tileRect({x0:x,y0:y,x1:x+w-1,y1:y+h-1});if(taken.some(o=>rectHit(r,o)))continue;best={x0:x,y0:y,x1:x+w-1,y1:y+h-1};bd=d;}}
    if(best)break;}
  if(!best)return null;const r=tileRect(best);clearArea(c,r,[]);
  for(let y=best.y0;y<=best.y1;y++)for(let x=best.x0;x<=best.x1;x++)c.g[y*W+x]=T_PLAZA;
  flats.push(r);return Object.assign(best,{r});
}

const prevGen=genCity;
genCity=function(){
  const c=prevGen.apply(this,arguments);pier=strip=court=null;flats=[];
  if(!isWorld(c))return c;
  try{
    pier=layoutPier(c);
    const DL=window.level29Downtown&&window.level29Downtown.lots;const old=DL&&DL.airport;
    strip=layoutStrip(c,pier?[pier.rect]:[]);
    if(strip&&DL){
      if(old)for(let y=old.y0;y<=old.y1;y++)for(let x=old.x0;x<=old.x1;x++)if(!flats.some(f=>inRect((x+.5)*T,(y+.5)*T,f)))c.g[y*c.width+x]=T_GRASS;
      DL.airport=Object.assign({id:'airport',w:12,h:11,name:'LEVEL 29 AIRSTRIP'},old||{},{x0:strip.x0,y0:strip.y0,x1:strip.x1,y1:strip.y1,fb:strip.fb,door:strip.door,name:'LEVEL 29 AIRSTRIP'});
    }
    court=layoutCourt(c,flats.slice());
    if(typeof indexTrees==='function')indexTrees(c);
  }catch(e){console.warn('coastline layout',e);}
  // Flatten the airstrip, pier and court even though heightAt is assigned later during the build.
  let inner=typeof c.heightAt==='function'?c.heightAt:null;
  const flat=(x,y)=>flats.some(f=>inRect(x,y,f));
  const wrapped=(x,y)=>flat(x,y)?0:inner(x,y);
  Object.defineProperty(c,'heightAt',{configurable:true,enumerable:true,get(){return inner?wrapped:undefined;},set(f){inner=f;}});
  return c;
};

// ---------------------------------------------------------------- meshes
let wheel=null,gondolas=[],coaster=null,carousel=null,camRig=null,ocean=null;
function buildPier(g){
  if(!pier)return;const F=pier.F,grp=new THREE.Group();grp.name='Santa Monica Pier';
  const o=F.toWorld(0,0);grp.position.set(o.x,0,o.y);grp.rotation.y=F.th;g.add(grp);
  const wood=std('#7b5b3e',{roughness:.85}),dark=std('#3a2a1e',{roughness:.9}),white=std('#f1efe8'),blue=std('#2f6db5'),red=std('#c8302c',{metalness:.3,roughness:.4}),steel=std('#c9ccd0',{metalness:.8,roughness:.3}),bulb=new THREE.MeshStandardMaterial({color:'#ffe08a',emissive:'#ffcc55',emissiveIntensity:1.2});
  const W=pier.water;
  ocean=new THREE.Mesh(new THREE.PlaneGeometry(22*T,W*T),new THREE.MeshStandardMaterial({color:'#1f5f86',roughness:.12,metalness:.25,transparent:true,opacity:.82}));
  ocean.rotation.x=-Math.PI/2;ocean.position.set(0,.5,W*T/2);grp.add(ocean);
  const sand=new THREE.Mesh(new THREE.PlaneGeometry(22*T,(pier.depth-W)*T),std('#d9c8a0',{roughness:1}));sand.rotation.x=-Math.PI/2;sand.position.set(0,.35,(W+pier.depth)/2*T);grp.add(sand);
  // Deck, planks and pilings.
  box(grp,5*T,1.6,W*T,0,.9,(1+W/2)*T,wood);box(grp,12*T,1.6,5.5*T,0,.95,3.75*T,wood);
  for(let z=1.2*T;z<(W+1)*T;z+=T*.5)box(grp,5*T,.2,1,0,1.8,z,dark);
  for(let x=-5.5;x<=5.5;x+=1.1)for(let z=1.4;z<6.4;z+=1.2)cyl(grp,2.4,2.4,22,x*T,-10,z*T,dark,8);
  for(let z=6.5;z<W+1;z+=1.2)for(const x of [-2.3,2.3])cyl(grp,2.4,2.4,22,x*T,-10,z*T,dark,8);
  for(const x of [-2.45,2.45])box(grp,1,6,(W-5.5)*T,x*T,4,(6.5+(W-5.5)/2)*T,white);
  box(grp,12*T,6,1,0,4,1*T,white);for(const x of [-6,6])box(grp,1,6,5.5*T,x*T,4,3.75*T,white);
  for(let z=1.6;z<W+1;z+=1.4)for(const x of [-2.3,2.3]){cyl(grp,.8,.8,24,x*T,13,z*T,std('#20262b',{metalness:.6}),6);const b=new THREE.Mesh(new THREE.SphereGeometry(2.4,10,8),bulb);b.position.set(x*T,26,z*T);grp.add(b);}
  // Harbor fittings sit along the edge, leaving the center deck unobstructed.
  for(let z=7*T;z<W*T;z+=3*T)for(const side of [-1,1]){
    const x=side*2.25*T;box(grp,6,2,3,x,3,z,steel);box(grp,2,4,2,x,5,z,steel);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(5,1,8,20),red);ring.position.set(x,8,z+10);ring.rotation.y=Math.PI/2;grp.add(ring);
    box(grp,12,4,6,x-side*10,4,z+15,wood);box(grp,12,5,1,x-side*10,8,z+18,white);
  }
  for(const x of [-1.9*T,1.9*T]){box(grp,9,7,8,x,5,(W-1)*T,blue);box(grp,10,1,9,x,9,(W-1)*T,white);}
  sign(grp,'FISHING: I / FISH · WAIT · HOOK · REEL / REST',110,9,0,22,(W-.5)*T,'#f3e2b4','#194b54');
  // Entrance arch (inland end).
  const az=(W+1.4)*T;for(const x of [-2.3,2.3]){box(grp,6,52,6,x*T,26,az,white);}
  box(grp,4.8*T,14,4,0,50,az,std('#e9e1cf'));
  sign(grp,'SANTA MONICA · YACHT HARBOR · SPORT FISHING · BOATING · CAFES',4.6*T,11,0,50,az+2.2,'#1b4f8f','#f3ecd8');
  sign(grp,'SANTA MONICA · YACHT HARBOR · SPORT FISHING · BOATING · CAFES',4.6*T,11,0,50,az-2.2,'#1b4f8f','#f3ecd8');
  // Route 66 End of the Trail sign.
  cyl(grp,1,1,30,2*T,15,(W-.6)*T,std('#3a3a3a'));sign(grp,'SANTA MONICA 66 · END OF THE TRAIL',38,14,2*T,30,(W-.6)*T+.8,'#fff','#2a2a2a');
  // Pacific Park sign and Pacific Wheel.
  sign(grp,'PACIFIC PARK',3*T,18,0,40,6.2*T,'#ffd84a','#c8302c');
  for(const x of [-.9*T,.9*T])cyl(grp,1.4,1.4,40,x,20,6.2*T,steel);
  wheel=new THREE.Group();wheel.position.set(-3.8*T,96,3.2*T);grp.add(wheel);
  const R=84,rim=std('#e3e6ea',{metalness:.7,roughness:.3});
  wheel.add(new THREE.Mesh(new THREE.TorusGeometry(R,1.8,8,72),rim));wheel.add(new THREE.Mesh(new THREE.TorusGeometry(R-6,1,6,72),rim));
  const glow=new THREE.Mesh(new THREE.TorusGeometry(R+1.5,.9,6,96),bulb);wheel.add(glow);
  for(let i=0;i<20;i++){const a=i/20*Math.PI*2,s=new THREE.Mesh(new THREE.BoxGeometry(1,R*2,1),rim);s.rotation.z=a;wheel.add(s);}
  wheel.add(new THREE.Mesh(new THREE.CylinderGeometry(5,5,10,16).rotateX(Math.PI/2),steel));
  for(const s of [-1,1])for(const z of [-9,9]){const leg=cyl(grp,1.8,1.8,104,-3.8*T+s*26,50,3.2*T+z,steel);leg.rotation.z=s*.26;}
  gondolas=[];const gc=['#c8302c','#ffd84a','#2f6db5','#2fae66'];
  for(let i=0;i<20;i++){const gm=new THREE.Group();box(gm,9,8,7,0,-4,0,std(gc[i%4],{metalness:.3,roughness:.4}));box(gm,10,1,8,0,.5,0,white);grp.add(gm);gondolas.push({m:gm,a:i/20*Math.PI*2});}
  wheel.userData={R,cx:-3.8*T,cy:96,cz:3.2*T};
  // West Coaster.
  const cx=3.9*T,cz=3.4*T,pts=[];
  for(let i=0;i<14;i++){const a=i/14*Math.PI*2,r=(i%2?1.25:1.6)*T;pts.push(new THREE.Vector3(cx+Math.cos(a)*r,18+Math.max(0,Math.sin(a*2))*40+(i===3?22:0),cz+Math.sin(a)*r*.75));}
  const curve=new THREE.CatmullRomCurve3(pts,true);
  grp.add(new THREE.Mesh(new THREE.TubeGeometry(curve,220,1.6,6,true),red));
  for(let i=0;i<28;i++){const p=curve.getPointAt(i/28);cyl(grp,.9,.9,p.y,p.x,p.y/2,p.z,std('#f3f3f3',{metalness:.4}),6);}
  const car=new THREE.Group();box(car,12,5,7,0,3,0,std('#ffd84a',{metalness:.4,roughness:.35}));box(car,10,3,6,0,6,0,std('#1a1a1a'));grp.add(car);
  coaster={curve,car,t:0};
  // Carousel (Looff Hippodrome style).
  const ch=new THREE.Group();ch.position.set(-3.9*T,0,5.6*T);grp.add(ch);
  box(ch,72,1,72,0,2,0,std('#efe6d2'));const roof=new THREE.Mesh(new THREE.ConeGeometry(42,22,12),std('#c8302c',{roughness:.5}));roof.position.y=46;ch.add(roof);
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;cyl(ch,1.2,1.2,34,Math.cos(a)*34,19,Math.sin(a)*34,white,6);}
  const spin=new THREE.Group();ch.add(spin);box(spin,50,2,50,0,4,0,std('#d8b04c',{metalness:.5}));
  const hc=['#ffffff','#f2c14e','#c58a5a','#9a9a9a'];
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2,h=new THREE.Group();h.position.set(Math.cos(a)*20,0,Math.sin(a)*20);h.rotation.y=-a;spin.add(h);
    box(h,4,5,10,0,14,0,std(hc[i%4]));box(h,3,5,3,0,18,5,std(hc[i%4]));cyl(h,.5,.5,30,0,20,0,steel,6);}
  carousel=spin;
  // Playland Arcade and shrimp shack.
  box(grp,1.8*T,30,46,3.9*T,16,6*T,std('#2b3f6b'));sign(grp,'PLAYLAND ARCADE',1.7*T,10,3.9*T,26,6*T+23.4,'#ffd84a','#1b1b2e');
  box(grp,60,24,40,-1.6*T,13,(W-.8)*T,std('#d9d2c2'));sign(grp,'PIER SHRIMP CO.',58,8,-1.6*T,20,(W-.8)*T+20.4,'#fff','#2a5f8a');
  // Beach: palms and lifeguard tower.
  const trunk=std('#7a6043',{roughness:.95}),frond=std('#2f6b35',{roughness:.8});
  for(let x=-10;x<=10;x+=2.5){if(Math.abs(x)<3)continue;const z=(pier.depth-1)*T,p=new THREE.Group();p.position.set(x*T,0,z);grp.add(p);
    const t=cyl(p,1.6,2.6,70,0,35,0,trunk,7);t.rotation.z=.08;
    for(let k=0;k<7;k++){const f=new THREE.Mesh(new THREE.ConeGeometry(4,34,4),frond);f.position.set(Math.cos(k)*10,68,Math.sin(k)*10);f.rotation.set(Math.sin(k)*1.2,0,Math.PI/2+Math.cos(k)*.6);p.add(f);}}
  const lg=new THREE.Group();lg.position.set(-7.5*T,0,(W+.8)*T);grp.add(lg);
  for(const [x,z] of [[-8,-8],[8,-8],[-8,8],[8,8]])cyl(lg,.9,.9,14,x,7,z,white,6);
  box(lg,22,14,20,0,21,0,std('#6fb7e8'));box(lg,26,2,24,0,29,0,white);sign(lg,'LIFEGUARD',18,5,0,22,10.2,'#c8302c','#ffffff');
}
const L29={purple:'#3b1c5c',deep:'#22093b',gold:'#f2c14e',green:'#2fae66',dkgreen:'#1f8a52'};
let ballTex=null;
function ballMaterial(){if(!ballTex){const cv=document.createElement('canvas');cv.width=256;cv.height=128;const x=cv.getContext('2d');const cols=['#6a2fa0',L29.gold,L29.green];
  for(let i=0;i<6;i++){x.fillStyle=cols[i%3];x.fillRect(0,i*128/6,256,128/6+1);}
  x.strokeStyle='#120a18';x.lineWidth=3;for(const X of [0,64,128,192]){x.beginPath();x.moveTo(X,0);x.lineTo(X,128);x.stroke();}x.beginPath();x.moveTo(0,64);x.lineTo(256,64);x.stroke();
  ballTex=new THREE.CanvasTexture(cv);}
  return new THREE.MeshStandardMaterial({map:ballTex,roughness:.55});}
function numPlate(g,text,fg,bg,z,rotY){const m=new THREE.Mesh(new THREE.PlaneGeometry(3.2,3.2),new THREE.MeshBasicMaterial({map:textTex(text,fg,bg,128,128),side:THREE.DoubleSide}));m.position.set(0,12.2,z);if(rotY)m.rotation.y=rotY;g.add(m);}
function makeFigure(jersey,trim,skin,num){
  const g=new THREE.Group(),J=std(jersey,{roughness:.6}),S=std(skin,{roughness:.7}),Tm=std(trim,{roughness:.6}),shoe=std('#f4f4f4');
  const limb=(x,y,w,h,m)=>{const p=new THREE.Group();p.position.set(x,y,0);g.add(p);box(p,w,h,w,0,-h/2,0,m);return p;};
  const legL=limb(-1.1,7.2,1.7,7,S),legR=limb(1.1,7.2,1.7,7,S);
  for(const l of [legL,legR]){box(l,2.1,1,3.2,0,-7,.5,shoe);box(l,1.9,1.6,1.9,0,-5.6,0,std('#f4f4f4'));}
  box(g,4.4,2.8,2.6,0,7.6,0,J);box(g,4.6,.5,2.7,0,6.4,0,Tm);box(g,4.6,6,2.8,0,11.8,0,J);box(g,4.7,.6,2.9,0,14.6,0,Tm);
  const armL=limb(-3,14.4,1.3,6,S),armR=limb(3,14.4,1.3,6,S);box(armL,1.7,1.9,1.7,0,-.8,0,J);box(armR,1.7,1.9,1.7,0,-.8,0,J);
  const head=new THREE.Mesh(new THREE.SphereGeometry(1.9,14,10),S);head.position.y=16.9;g.add(head);
  const hair=new THREE.Mesh(new THREE.SphereGeometry(1.98,14,8,0,Math.PI*2,0,Math.PI/2.3),std('#16100c',{roughness:.9}));hair.position.y=17.1;g.add(hair);
  numPlate(g,String(num),trim,jersey,1.45);numPlate(g,String(num),trim,jersey,-1.45,Math.PI);
  return {g,legL,legR,armL,armR,x:0,z:0,ph:Math.random()*6};
}
function makeMascot(){
  const f=makeFigure('#5b2a86',L29.gold,'#f6f1e8',29),hatCols=[L29.green,L29.gold,'#7a3fb8'];
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2,c=new THREE.Mesh(new THREE.ConeGeometry(.9,2.6,6),std(i%2?L29.green:L29.gold));c.position.set(Math.cos(a)*2.4,14.9,Math.sin(a)*1.6);c.rotation.set(Math.sin(a)*1.3,0,-Math.cos(a)*1.3);f.g.add(c);}
  for(let i=0;i<3;i++){const p=new THREE.Group();p.position.set(0,18.4,0);p.rotation.z=(i-1)*.85;f.g.add(p);
    const c=new THREE.Mesh(new THREE.ConeGeometry(1.4,6.4,10),std(hatCols[i]));c.position.y=3.1;p.add(c);
    const b=new THREE.Mesh(new THREE.SphereGeometry(.85,10,8),std(L29.gold,{metalness:.7,roughness:.3}));b.position.y=6.5;p.add(b);}
  for(const s of [-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.32,8,6),std('#111'));e.position.set(s*.7,17.3,1.75);f.g.add(e);
    const d=new THREE.Mesh(new THREE.SphereGeometry(.42,8,6),std(s<0?L29.green:L29.gold));d.position.set(s*1.1,16.2,1.62);d.scale.set(1,.5,.4);f.g.add(d);}
  const smile=new THREE.Mesh(new THREE.TorusGeometry(.8,.16,6,12,Math.PI),std('#7a1a2a'));smile.position.set(0,16.3,1.78);smile.rotation.z=Math.PI;f.g.add(smile);
  const ball=new THREE.Mesh(new THREE.SphereGeometry(1.5,18,14),ballMaterial());f.g.add(ball);f.ball=ball;
  f.g.scale.setScalar(1.15);return f;
}
let hoopsRig=null,mascot=null,board=null;
function buildCourt(g){
  hoopsRig=mascot=board=null;
  if(!court)return;const r=court.r,cx=r.x+r.w/2,cz=r.y+r.h/2,grp=new THREE.Group();grp.name='Level 29 basketball court';g.add(grp);
  const cv=document.createElement('canvas');cv.width=1024;cv.height=640;const x=cv.getContext('2d'),tex=new THREE.CanvasTexture(cv);tex.anisotropy=8;
  const paint=logo=>{
    const gr=x.createLinearGradient(0,0,0,640);gr.addColorStop(0,'#2b1147');gr.addColorStop(.5,'#43206b');gr.addColorStop(1,'#2b1147');x.fillStyle=gr;x.fillRect(0,0,1024,640);
    for(let i=0;i<80;i++){x.fillStyle=i%2?'rgba(0,0,0,.07)':'rgba(255,255,255,.03)';x.fillRect(0,i*8,1024,8);}
    for(let i=0;i<120;i++){x.fillStyle='rgba(0,0,0,.12)';x.fillRect((i*211)%1024,(i*8*13)%640,2,8);}
    x.fillStyle=L29.dkgreen;x.fillRect(0,0,1024,24);x.fillRect(0,616,1024,24);x.fillRect(0,0,24,640);x.fillRect(1000,0,24,640);
    x.fillStyle=L29.dkgreen;x.fillRect(24,220,190,200);x.fillRect(810,220,190,200);
    x.strokeStyle=L29.gold;x.lineWidth=7;x.strokeRect(24,24,976,592);x.beginPath();x.moveTo(512,24);x.lineTo(512,616);x.stroke();
    x.strokeRect(24,220,190,200);x.strokeRect(810,220,190,200);
    for(const [kx,a0,a1] of [[214,-Math.PI/2,Math.PI/2],[810,Math.PI/2,Math.PI*1.5]]){x.beginPath();x.arc(kx,320,62,a0,a1);x.stroke();}
    for(const [bx,a0,a1] of [[60,-1.2,1.2],[964,Math.PI-1.2,Math.PI+1.2]]){x.beginPath();x.arc(bx,320,262,a0,a1);x.stroke();}
    x.fillStyle=L29.gold;x.beginPath();x.arc(512,320,140,0,7);x.fill();x.fillStyle=L29.green;x.beginPath();x.arc(512,320,130,0,7);x.fill();
    x.fillStyle=L29.deep;x.beginPath();x.arc(512,320,120,0,7);x.fill();
    if(logo){const s=232,ar=logo.width/logo.height,w=ar>1?s:s*ar,h=ar>1?s/ar:s;x.save();x.beginPath();x.arc(512,320,118,0,7);x.clip();x.drawImage(logo,512-w/2,320-h/2,w,h);x.restore();}
    else{x.fillStyle=L29.gold;x.font="900 64px 'Barlow Condensed',sans-serif";x.textAlign='center';x.textBaseline='middle';x.fillText('LEVEL 29',512,320);}
    x.fillStyle=L29.gold;x.font="900 30px 'Barlow Condensed',sans-serif";x.textAlign='center';x.textBaseline='middle';x.fillText('LEVEL 29 ENTERTAINMENT · BAYOU COURTS',512,58);
    x.save();x.translate(512,582);x.rotate(Math.PI);x.fillText('LEVEL 29 ENTERTAINMENT · BAYOU COURTS',0,0);x.restore();
    tex.needsUpdate=true;};
  paint(null);const img=new Image();img.onload=()=>paint(img);img.src='logo.png';
  box(grp,r.w+16,.8,r.h+16,cx,.2,cz,std(L29.deep,{roughness:.8}));
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(r.w,r.h),std('#ffffff',{map:tex,roughness:.32,metalness:.06}));floor.rotation.x=-Math.PI/2;floor.position.set(cx,.7,cz);grp.add(floor);
  const pole=std(L29.purple,{metalness:.5,roughness:.4}),pad=std(L29.green,{roughness:.8}),glass=new THREE.MeshStandardMaterial({color:'#dfe9ef',transparent:true,opacity:.42,roughness:.05,metalness:.1}),
    orange=std('#e2561b',{metalness:.5,roughness:.35}),net=new THREE.MeshBasicMaterial({color:'#ffffff',wireframe:true}),goldM=std(L29.gold,{metalness:.7,roughness:.3});
  for(const s of [-1,1]){const bx=cx+s*(r.w/2-14);
    box(grp,6,4,6,bx+s*8,2,cz,pole);cyl(grp,1.8,1.8,40,bx+s*8,20,cz,pole);box(grp,2.6,14,2.6,bx+s*8,8,cz,pad);box(grp,12,2,2,bx+s*2,40,cz,pole);
    box(grp,1,14,24,bx-s*3,44,cz,glass);for(const [w,h,y,zo] of [[1.2,.6,51,0],[1.2,.6,37,0],[1.2,14,44,12],[1.2,14,44,-12]])box(grp,w,h,zo?.6:24,bx-s*3.1,y,cz+zo,goldM);
    box(grp,1.2,6,8,bx-s*3.2,41,cz,std('#ffffff'));
    const rim=new THREE.Mesh(new THREE.TorusGeometry(4.6,.5,6,20),orange);rim.rotation.x=Math.PI/2;rim.position.set(bx-s*8.5,38,cz);grp.add(rim);
    const n=new THREE.Mesh(new THREE.CylinderGeometry(4.4,2.8,7,12,2,true),net);n.position.set(bx-s*8.5,34.4,cz);grp.add(n);}
  for(const z of [r.y-6,r.y+r.h+6])box(grp,r.w,10,1.5,cx,5,z,new THREE.MeshStandardMaterial({color:'#b9a0d8',wireframe:true}));
  const headM=new THREE.MeshStandardMaterial({color:'#fffbe8',emissive:'#fff2c0',emissiveIntensity:1.3});
  for(const [px,pz] of [[r.x-8,r.y-10],[r.x+r.w+8,r.y-10],[r.x-8,r.y+r.h+10],[r.x+r.w+8,r.y+r.h+10]]){cyl(grp,1.4,1.8,66,px,33,pz,pole);box(grp,12,4,6,px,67,pz,headM);}
  sign(grp,'LEVEL 29 COURTS · 2v2 · NO ENEMIES',r.w*.5,10,cx+20,12,r.y+r.h+7,L29.gold,'#1d1030');
  // Scoreboard over the far sideline.
  const bc=document.createElement('canvas');bc.width=512;bc.height=160;const bt=new THREE.CanvasTexture(bc);
  board={draw(you,them,msg){const b=bc.getContext('2d');b.fillStyle='#0b0612';b.fillRect(0,0,512,160);b.strokeStyle=L29.gold;b.lineWidth=6;b.strokeRect(3,3,506,154);
    b.textAlign='center';b.textBaseline='middle';b.font="900 26px 'Barlow Condensed',sans-serif";b.fillStyle=L29.green;b.fillText('LEVEL 29',128,34);b.fillStyle=L29.gold;b.fillText('BALLERS',384,34);
    b.font="900 76px 'Barlow Condensed',sans-serif";b.fillStyle='#fff';b.fillText(String(you),128,100);b.fillText(String(them),384,100);
    b.font="800 20px 'Barlow Condensed',sans-serif";b.fillStyle='#d9c7f0';b.fillText((msg||'FIRST TO 21').toUpperCase().slice(0,34),256,140);b.fillStyle=L29.gold;b.fillRect(254,20,4,100);bt.needsUpdate=true;}};
  board.draw(0,0,'');
  for(const s of [-1,1])cyl(grp,1.2,1.2,46,cx+s*30,23,r.y-16,pole);
  box(grp,74,24,2,cx,50,r.y-17.2,std('#0b0612'));const bm=new THREE.Mesh(new THREE.PlaneGeometry(70,22),new THREE.MeshBasicMaterial({map:bt}));bm.position.set(cx,50,r.y-16);grp.add(bm);
  // Level 29 mascot dribbling a purple, gold and green ball on the near sideline.
  mascot=makeMascot();const mx=r.x+22,mz=r.y+r.h+14;mascot.g.position.set(mx,.6,mz);mascot.g.rotation.y=Math.PI;mascot.home={x:mx,z:mz};grp.add(mascot.g);
  sign(grp,'BAYOU JESTER · LEVEL 29 MASCOT',34,4.5,mx,30,mz+3,L29.gold,'#22093b',Math.PI);
  // Players for the live 2v2 game.
  const rig=new THREE.Group();rig.visible=false;grp.add(rig);
  const P={you:makeFigure(L29.dkgreen,L29.gold,'#8a5a3c',29),mate:makeFigure(L29.dkgreen,L29.gold,'#c69072',7),o1:makeFigure('#d9a92f',L29.purple,'#5e3b2a',3),o2:makeFigure('#d9a92f',L29.purple,'#e0b998',11)};
  for(const k in P)rig.add(P[k].g);
  sign(P.you.g,'YOU',5,2.2,0,22.5,0,'#0b0612',L29.gold);
  const ball=new THREE.Mesh(new THREE.SphereGeometry(1.5,18,14),ballMaterial());rig.add(ball);
  hoopsRig={grp:rig,P,ball,cx,cz,rimX:r.w/2-22.5};
}
function buildStairsAndCamera(){
  const E=window.level29Estate,p=E&&E.penthouse;if(!p)return;const pg=cityGroup.getObjectByName('Ronniebaby penthouse');if(!pg)return;
  const b=p.b,cx=b.x+b.w/2,gold=std('#c4a249',{metalness:.7,roughness:.35}),stone=std('#c9c1ad',{roughness:.8}),black=std('#15171a',{metalness:.3,roughness:.5});
  const sx=Math.min(cx+46,b.x+b.w-18);p.stairs={out:{x:sx,y:b.y+b.h+32},top:{x:sx,y:b.y+b.h-18}};
  for(let k=0;k<10;k++){const z=b.y+b.h+40-k*3.8,h=(k+1)*2.4;box(pg,24,h,3.8,sx,h/2,z,stone);}
  for(const s of [-1,1])box(pg,1,1,38,sx+s*12.5,16,b.y+b.h+21,gold);
  box(pg,22,30,1.2,sx,15,b.y+b.h+.8,black);sign(pg,'STAIRS · PENTHOUSE',30,6,sx,34,b.y+b.h+1.6,'#f0d692','#243c32');
  // Top-of-stairs landing inside the penthouse.
  box(pg,22,.4,16,sx,p.base+1.3,p.stairs.top.y,black);for(const s of [-1,1])box(pg,1,8,16,sx+s*11,p.base+5,p.stairs.top.y,gold);
  sign(pg,'STAIRS DOWN',18,4,sx,p.base+14,p.stairs.top.y-8.2,'#f0d692','#243c32',Math.PI);
  // Only two guests remain in the penthouse.
  const gs=E.guests||[];for(let i=2;i<gs.length;i++)if(gs[i].parent)gs[i].parent.remove(gs[i]);
  // Cinema camera on a tripod with matte box, follow-focus, monitor and tally light.
  const rig=new THREE.Group();rig.name='Ronniebaby cinema camera';const rx=b.x+40,rz=b.y+b.h-40;rig.position.set(rx,p.base+1,rz);rig.rotation.y=Math.PI*.8;pg.add(rig);
  for(let i=0;i<3;i++){const a=i/3*Math.PI*2,l=cyl(rig,.45,.45,18,Math.cos(a)*4,8.5,Math.sin(a)*4,black,6);l.rotation.set(Math.sin(a)*.32,0,-Math.cos(a)*.32);}
  cyl(rig,1.2,1.4,3,0,17.5,0,black);box(rig,6,4.5,9,0,21.5,0,black);box(rig,5,1,6,0,24.5,0,black);
  const lens=cyl(rig,1.6,1.6,7,0,21.5,-7.5,std('#0d0d0d',{metalness:.5,roughness:.3}),16);lens.rotation.x=Math.PI/2;
  box(rig,6,5,1.2,0,21.5,-11.6,black);box(rig,4,3,.3,3.6,24,2,std('#111'));
  const scr=new THREE.Mesh(new THREE.PlaneGeometry(3.6,2.4),new THREE.MeshBasicMaterial({color:'#6fb7e8'}));scr.position.set(3.6,24,2.2);rig.add(scr);
  const tally=new THREE.Mesh(new THREE.SphereGeometry(.45,8,6),new THREE.MeshBasicMaterial({color:'#ff2a2a'}));tally.position.set(0,24.4,-3.5);rig.add(tally);
  sign(rig,'LEVEL 29 FILMS',8,1.6,-3.1,21.5,0,'#f2c14e','#111',-Math.PI/2);
  p.furniture.push({x:rx-6,y:rz-6,w:12,h:12});camRig=rig;
}

// Higher detail mountains with fractal ridges, slope-based rock and snow, boulders and pines.
function hash(x,y){const s=Math.sin(x*127.1+y*311.7)*43758.5453;return s-Math.floor(s);}
function noise(x,y){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
  const a=hash(ix,iy),b=hash(ix+1,iy),c=hash(ix,iy+1),d=hash(ix+1,iy+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
function fbm(x,y){let s=0,a=.5,f=1;for(let i=0;i<5;i++){s+=a*(1-Math.abs(noise(x*f,y*f)*2-1));f*=2.03;a*=.5;}return s;}
let rockSurface=null;
function terrainSurface(){
  if(rockSurface)return rockSurface;
  const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),im=g.createImageData(128,128);
  for(let y=0;y<128;y++)for(let x=0;x<128;x++){const i=(y*128+x)*4,n=noise(x*.15,y*.15),strata=Math.sin(y*.45+noise(x*.06,y*.02)*4),v=Math.round(145+n*65+strata*9);im.data[i]=v;im.data[i+1]=v;im.data[i+2]=v;im.data[i+3]=255;}
  g.putImageData(im,0,0);rockSurface=new THREE.CanvasTexture(c);rockSurface.wrapS=rockSurface.wrapT=THREE.RepeatWrapping;rockSurface.repeat.set(18,18);return rockSurface;
}
function rebuildMountains(c){
  const old=cityGroup.getObjectByName('level29-mountains');if(!old||typeof c.heightAt!=='function')return;
  old.parent.remove(old);const grp=new THREE.Group();grp.name='level29-mountains';cityGroup.add(grp);
  const rockM=new THREE.MeshStandardMaterial({color:'#7d776d',roughness:.95,flatShading:true}),pineM=std('#24412b',{roughness:.9}),trunkM=std('#4a3726',{roughness:.95});
  const rocks=[],pines=[];
  for(const f of c.features){if(f.kind!=='mountain')continue;
    const seg=Math.min(110,Math.max(40,Math.round(Math.max(f.w,f.h)/14))),geo=new THREE.PlaneGeometry(f.w,f.h,seg,seg);geo.rotateX(-Math.PI/2);
    const pos=geo.attributes.position;
    for(let i=0;i<pos.count;i++){const x=pos.getX(i)+f.x+f.w/2,z=pos.getZ(i)+f.y+f.h/2;const road=c.curveDist?c.curveDist(x,z)<64:false;
      const base=c.heightAt(x,z);let h=road?-3:base;if(!road&&base>2){const m=Math.min(1,base/90)*(c.developmentWeight?1-c.developmentWeight(x,z):1);h+=(fbm(x*.006,z*.006)-.45)*60*m+(noise(x*.05,z*.05)-.5)*6*m;}
      pos.setXYZ(i,x,Math.max(road?-3:0,h),z);}
    geo.computeVertexNormals();const nor=geo.attributes.normal,col=new Float32Array(pos.count*3);let maxH=1;for(let i=0;i<pos.count;i++)maxH=Math.max(maxH,pos.getY(i));
    for(let i=0;i<pos.count;i++){const h=pos.getY(i),k=h/maxH,slope=1-nor.getY(i),j=(noise(pos.getX(i)*.08,pos.getZ(i)*.08)-.5)*.08;let r,g,b;
      if(k>.87+noise(pos.getX(i)*.009,pos.getZ(i)*.009)*.08&&slope<.34){r=.92;g=.93;b=.95;}else if(slope>.42||k>.6){r=.45;g=.42;b=.38;}else if(k>.3){r=.3;g=.36;b=.24;}else if(k>.04){r=.25;g=.34;b=.2;}else{r=.36;g=.33;b=.24;}
      col[i*3]=r+j;col[i*3+1]=g+j;col[i*3+2]=b+j;
      const x=pos.getX(i),z=pos.getZ(i),hr=hash(x*.13,z*.17);
      if(h>8&&slope>.3&&hr<.012)rocks.push([x,h,z,4+hr*600]);
      else if(h>4&&k<.55&&slope<.35&&hr<.03)pines.push([x,h,z,.8+hash(z,x)*.6]);}
    geo.setAttribute('color',new THREE.BufferAttribute(col,3));
    const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,map:terrainSurface(),bumpMap:terrainSurface(),bumpScale:1.2,roughness:.96,metalness:0}));m.position.y=.4;grp.add(m);}
  const dummy=new THREE.Object3D();
  if(rocks.length){const im=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),rockM,rocks.length);rocks.forEach(([x,y,z,s],i)=>{dummy.position.set(x,y,z);dummy.rotation.set(s,s*2,s*3);dummy.scale.set(s,s*.7,s*1.1);dummy.updateMatrix();im.setMatrixAt(i,dummy.matrix);});grp.add(im);}
  if(pines.length){const n=Math.min(pines.length,900),cone=new THREE.InstancedMesh(new THREE.ConeGeometry(7,26,11),pineM,n),tr=new THREE.InstancedMesh(new THREE.CylinderGeometry(1.2,1.6,8,5),trunkM,n);
    for(let i=0;i<n;i++){const [x,y,z,s]=pines[i];dummy.rotation.set(0,s*9,0);dummy.scale.set(s,s,s);dummy.position.set(x,y+4*s,z);dummy.updateMatrix();tr.setMatrixAt(i,dummy.matrix);dummy.position.set(x,y+19*s,z);dummy.updateMatrix();cone.setMatrixAt(i,dummy.matrix);}
    grp.add(tr);grp.add(cone);
    // A second offset crown breaks up the single traffic-cone silhouette, still instanced.
    const crown=new THREE.InstancedMesh(new THREE.ConeGeometry(5.8,20,11),std('#36533a',{roughness:1}),n);
    for(let i=0;i<n;i++){const [x,y,z,s]=pines[i];dummy.rotation.set(.04*Math.sin(x),s*4,.04*Math.cos(z));dummy.scale.set(s,s,s);dummy.position.set(x+1.2*s,y+28*s,z);dummy.updateMatrix();crown.setMatrixAt(i,dummy.matrix);}grp.add(crown);}
}
function upgradeMaterials(root){if(!root)return;const cache=new Map();
  root.traverse(o=>{if(!o.isMesh)return;const list=Array.isArray(o.material)?o.material:[o.material];
    const out=list.map(m=>{if(!m||!(m.isMeshLambertMaterial||m.isMeshPhongMaterial))return m;if(cache.has(m))return cache.get(m);
      const n=new THREE.MeshStandardMaterial({color:m.color,map:m.map,emissive:m.emissive,emissiveMap:m.emissiveMap,transparent:m.transparent,opacity:m.opacity,side:m.side,vertexColors:m.vertexColors,roughness:.6,metalness:.06});cache.set(m,n);return n;});
    o.material=Array.isArray(o.material)?out:out[0];});}
let envDone=false;
function applyEnvironment(){
  if(envDone||typeof renderer==='undefined'||!renderer||!scene||!THREE.PMREMGenerator)return;envDone=true;
  try{const s=new THREE.Scene(),sky=new THREE.Mesh(new THREE.SphereGeometry(50,32,16),new THREE.MeshBasicMaterial({side:THREE.BackSide,vertexColors:true}));
    const pos=sky.geometry.attributes.position,col=new Float32Array(pos.count*3);
    for(let i=0;i<pos.count;i++){const k=(pos.getY(i)/50+1)/2;col[i*3]=.18+.32*k;col[i*3+1]=.17+.36*k;col[i*3+2]=.16+.46*k;}
    sky.geometry.setAttribute('color',new THREE.BufferAttribute(col,3));s.add(sky);
    for(const [x,y,z] of [[20,30,10],[-25,22,-15],[0,40,-20]]){const l=new THREE.Mesh(new THREE.BoxGeometry(14,2,14),new THREE.MeshBasicMaterial({color:'#fff3dc'}));l.position.set(x,y,z);l.lookAt(0,0,0);s.add(l);}
    const pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromScene(s,.04).texture;pm.dispose();
  }catch(e){console.warn('coastline env',e);}
}

const prevBuild=buildCity;
buildCity=function(){
  if(isWorld(city)&&!court){try{court=layoutCourt(city,flats.slice());}catch(e){console.warn('coastline court',e);}}
  prevBuild.apply(this,arguments);
  if(!isWorld(city))return;
  try{const g=new THREE.Group();g.name='level29-coastline';cityGroup.add(g);buildPier(g);buildCourt(g);upgradeMaterials(g);}catch(e){console.warn('coastline build',e);}
  try{buildStairsAndCamera();}catch(e){console.warn('coastline penthouse',e);}
  try{rebuildMountains(city);}catch(e){console.warn('coastline mountains',e);}
  try{upgradeMaterials(cityGroup.getObjectByName('Ronniebaby penthouse'));upgradeMaterials(cityGroup.getObjectByName('level29-residence'));}catch(e){}
  envDone=false;
};

// ---------------------------------------------------------------- interaction button
const useBtn=document.createElement('button');useBtn.id='l29CoastUse';
useBtn.style.cssText='position:fixed;z-index:47;left:50%;transform:translateX(-50%);bottom:205px;border:1px solid #f2c14e;border-radius:8px;background:#1d1030;color:#f2c14e;padding:12px 18px;font:700 12px monospace;display:none;touch-action:manipulation;max-width:86vw';
document.body.appendChild(useBtn);
let nearSpot=null,tapAt=0;
useBtn.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();tapAt=performance.now();if(nearSpot)nearSpot.act();});
useBtn.addEventListener('click',e=>{e.stopPropagation();if(performance.now()-tapAt<700)return;if(nearSpot)nearSpot.act();});
const prevEE=enterExit;enterExit=function(){if(nearSpot&&useBtn.style.display!=='none'&&!player?.car){nearSpot.act();return;}prevEE.apply(this,arguments);};

function payFor(n){if(cash<n){toast('NOT ENOUGH CASH · '+money(n));return false;}cash-=n;if(typeof sfx==='function')sfx('cash');return true;}
let ride=null;
function startRide(kind){if(ride||!payFor(10))return;ride={kind,t:kind==='wheel'?12*60:10*60,home:{x:player.x,y:player.y},g:gondolas[0]};toast(kind==='wheel'?'PACIFIC WHEEL · ENJOY THE VIEW':'WEST COASTER · HANG ON');}
function ridePos(){if(!ride||!pier)return null;const grp=cityGroup.getObjectByName('Santa Monica Pier');if(!grp)return null;const v=new THREE.Vector3();
  if(ride.kind==='wheel')ride.g.m.getWorldPosition(v);else coaster.car.getWorldPosition(v);return v;}
function spots(){const out=[];const add=(p,label,act)=>{if(p)out.push({x:p.x,y:p.y,label,act});};
  if(pier){const F=pier.F;
    add(F.toWorld(-3.8*T,4.6*T),'RIDE THE PACIFIC WHEEL · $10',()=>startRide('wheel'));
    add(F.toWorld(2.6*T,4.8*T),'RIDE THE WEST COASTER · $10',()=>startRide('coaster'));
    add(F.toWorld(-2.7*T,5.6*T),'RIDE THE CAROUSEL · $5',()=>{if(payFor(5))toast('ROUND AND ROUND ON THE HIPPODROME CAROUSEL');});
    add(F.toWorld(3.9*T,6.6*T),'PLAYLAND ARCADE · $5',()=>{if(!payFor(5))return;const w=[0,0,10,25,50,100][Math.floor(Math.random()*6)];cash+=w;toast(w?'ARCADE WIN · '+money(w):'SO CLOSE · TRY AGAIN');});
    add(F.toWorld(0,1.7*T),'FISH OFF THE END OF THE PIER',()=>{const O=window.level29OpenWorld;if(O&&O.startFishing)O.startFishing();});
    add(F.toWorld(2*T,(pier.water-1.2)*T),'PHOTO · END OF THE TRAIL',()=>toast('ROUTE 66 · END OF THE TRAIL · SANTA MONICA'));}
  if(court)add({x:court.r.x+court.r.w/2,y:court.r.y+court.r.h+20},'PLAY 2v2 BASKETBALL',openHoops);
  const res=city&&city.residence;if(res)add(res.lobby,'ENTER LEVEL 29 RESIDENCE · SAFEHOUSE',enterResidence);
  return out;}
function enterResidence(){const O=window.level29OpenWorld;if(!O||!O.save)return;if(player.car)return toast('STEP OUT OF YOUR VEHICLE FIRST');
  if(!O.save.apartment){O.save.apartment=true;toast('RESIDENCE SAFEHOUSE UNLOCKED');}
  O.showStore('home');const b=document.querySelector('[data-action="enter-home"]');if(b)b.click();}

// ---------------------------------------------------------------- 2v2 basketball
const hp=document.createElement('div');hp.id='l29Hoops';hp.setAttribute('role','dialog');hp.setAttribute('aria-label','2v2 basketball');
hp.style.cssText='position:fixed;inset:0;z-index:60;display:none;align-items:flex-end;justify-content:center;background:linear-gradient(transparent 55%,rgba(5,3,10,.55));pointer-events:none;font-family:"Barlow Condensed",system-ui,sans-serif';
document.body.appendChild(hp);
const hs=document.createElement('style');hs.textContent=
'#l29Hoops .bx{pointer-events:auto;width:min(640px,96vw);max-height:44vh;overflow:auto;margin-bottom:12px;background:linear-gradient(rgba(29,16,48,.88),rgba(14,8,24,.92));border:1px solid #f2c14e;border-radius:14px;padding:12px 16px;color:#f3ecd8}'+
'#l29Hoops .bx h2{font-size:24px!important}#l29Hoops .bx>p{margin:4px 0}'+
'#l29Hoops h2{margin:0 0 6px;font-size:30px;color:#f2c14e}#l29Hoops .sb{display:flex;justify-content:space-between;font-size:26px;font-weight:900;margin:8px 0}'+
'#l29Hoops button{background:#2fae66;color:#08140c;border:0;border-radius:8px;padding:12px 14px;font:800 15px "Barlow Condensed",sans-serif;margin:4px;cursor:pointer;min-height:44px}'+
'#l29Hoops button.alt{background:#3a2a55;color:#f3ecd8}#l29Hoops .meter{position:relative;height:26px;border-radius:13px;background:#2a1d3d;overflow:hidden;margin:12px 0}'+
'#l29Hoops .zone{position:absolute;top:0;bottom:0;background:rgba(47,174,102,.55)}#l29Hoops .needle{position:absolute;top:0;bottom:0;width:5px;background:#f2c14e;left:0}'+
'#l29Hoops .roster{display:flex;gap:10px;font-size:15px}#l29Hoops .roster div{flex:1;background:rgba(255,255,255,.06);border-radius:8px;padding:8px}'+
'#l29Panel .dancer.fig{width:44px;height:84px;border-radius:0;background:none!important;position:relative;margin:-80px auto 8px;animation:l29step .9s ease-in-out infinite alternate}'+
'#l29Panel .fig i{position:absolute;display:block}#l29Panel .fig .hd{width:16px;height:18px;left:14px;top:0;border-radius:50%;background:var(--s);box-shadow:0 -3px 0 2px var(--h)}'+
'#l29Panel .fig .tor{width:20px;height:28px;left:12px;top:18px;border-radius:6px 6px 3px 3px;background:var(--c)}'+
'#l29Panel .fig .ar{width:6px;height:24px;top:20px;border-radius:3px;background:var(--c);transform-origin:50% 3px}#l29Panel .fig .ar::after{content:"";position:absolute;bottom:-5px;left:0;width:6px;height:6px;border-radius:50%;background:var(--s)}'+
'#l29Panel .fig .ar.l{left:7px;animation:l29armL .9s ease-in-out infinite alternate}#l29Panel .fig .ar.r{left:31px;animation:l29armR .9s ease-in-out infinite alternate}'+
'#l29Panel .fig .lg{width:8px;height:32px;top:45px;border-radius:2px;background:#20202e;transform-origin:50% 0}#l29Panel .fig .lg::after{content:"";position:absolute;bottom:-3px;left:-1px;width:11px;height:5px;border-radius:2px;background:#f3f3f3}'+
'#l29Panel .fig .lg.l{left:13px;animation:l29legL .9s ease-in-out infinite alternate}#l29Panel .fig .lg.r{left:23px;animation:l29legR .9s ease-in-out infinite alternate}'+
'#l29Panel .fig.v1 .ar.l{animation-name:l29clapL}#l29Panel .fig.v1 .ar.r{animation-name:l29clapR}#l29Panel .fig.v2{animation:l29spin 2.4s linear infinite}'+
'@keyframes l29step{0%{transform:translate(-7px,0)}50%{transform:translate(0,-5px)}100%{transform:translate(7px,0)}}'+
'@keyframes l29armL{from{transform:rotate(25deg)}to{transform:rotate(165deg)}}@keyframes l29armR{from{transform:rotate(-165deg)}to{transform:rotate(-25deg)}}'+
'@keyframes l29clapL{from{transform:rotate(150deg)}to{transform:rotate(195deg)}}@keyframes l29clapR{from{transform:rotate(-150deg)}to{transform:rotate(-195deg)}}'+
'@keyframes l29legL{from{transform:rotate(10deg)}to{transform:rotate(-14deg)}}@keyframes l29legR{from{transform:rotate(-14deg)}to{transform:rotate(10deg)}}'+
'@keyframes l29spin{0%{transform:rotateY(0) translateY(0)}50%{transform:rotateY(180deg) translateY(-4px)}100%{transform:rotateY(360deg) translateY(0)}}';
document.head.appendChild(hs);
const SHOTS={layup:{n:'Layup',pts:2,w:34},jumper:{n:'Jumper',pts:2,w:22},three:{n:'Three',pts:3,w:13}};
let bb=null,raf=0,meterVal=0,meterDir=1;
function openHoops(){if(player.car)return toast('STEP OUT OF YOUR VEHICLE FIRST');bb={you:0,them:0,poss:'you',phase:'choose',msg:'Tip-off won. Your ball.',shot:null};state='shop';for(const k in keys)keys[k]=false;hp.style.display='flex';resetHoops3D();hdraw();}
function closeHoops(){cancelAnimationFrame(raf);bb=null;hAnim=null;hp.style.display='none';if(hoopsRig)hoopsRig.grp.visible=false;if(state==='shop')state='play';}
function startMeter(){cancelAnimationFrame(raf);meterVal=0;meterDir=1;const tick=()=>{meterVal+=meterDir*2.1;if(meterVal>=100||meterVal<=0)meterDir*=-1;const n=hp.querySelector('.needle');if(n)n.style.left=meterVal+'%';raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);}
function score(team,pts){bb[team]+=pts;if(bb[team]>=21){const won=team==='you';cash+=won?600:100;if(typeof sfx==='function')sfx('cash');bb.phase='over';bb.msg=won?'You won '+bb.you+'-'+bb.them+'! +$600':'Bayou Ballers win '+bb.them+'-'+bb.you+'. +$100 for playing.';return true;}return false;}
function hact(a,v){if(!bb)return;
  if(a==='close')return closeHoops();if(a==='again')return openHoops();
  if(bb.phase==='choose'){if(a==='pass'){const made=Math.random()<.5;shotAnim('mate',made,'jumper');bb.msg=made?'Kick-out to Boudreaux · bucket! +2':'Boudreaux bricks it.';if(made&&score('you',2))return hdraw();bb.poss='them';bb.phase='defend';startMeter();return hdraw();}
    if(SHOTS[a]){bb.shot=a;bb.phase='shoot';startMeter();return hdraw();}}
  if(bb.phase==='shoot'&&a==='release'){cancelAnimationFrame(raf);const s=SHOTS[bb.shot],off=Math.abs(meterVal-50),made=off<=s.w/2?Math.random()<.92:off<=s.w?Math.random()<.18:Math.random()<.04;shotAnim('you',made,bb.shot);
    bb.msg=(made?'Splash! ':'Miss. ')+s.n+(made?' +'+s.pts:'')+' · release '+(off<=s.w/2?'perfect':off<=s.w?'close':'late');if(made&&score('you',s.pts))return hdraw();bb.poss='them';bb.phase='defend';startMeter();return hdraw();}
  if(bb.phase==='defend'&&a==='contest'){cancelAnimationFrame(raf);const off=Math.abs(meterVal-50);
    if(off<=4&&Math.random()<.5){bb.msg='STEAL! Your ball.';bb.poss='you';bb.phase='choose';return hdraw();}
    const three=Math.random()<.3,chance=off<=10?.25:off<=20?.4:.55,made=Math.random()<chance;if(hoopsRig)hoopsRig.P.you.jump=26;shotAnim('o1',made,three?'three':'jumper');
    bb.msg=(off<=10?'Great contest. ':off<=20?'Hand in the face. ':'Too late on the closeout. ')+(made?'They score '+(three?3:2)+'.':'They miss.');
    if(made&&score('them',three?3:2))return hdraw();bb.poss='you';bb.phase='choose';return hdraw();}
}
function hdraw(){if(!bb)return;let h='<div class="bx"><h2>Level 29 Courts · 2v2</h2><div class="roster"><div><b style="color:#2fae66">LEVEL 29</b><br>You + J. Boudreaux (AI)</div><div><b style="color:#f2c14e">BAYOU BALLERS</b><br>2 AI players</div></div>';
  h+='<p style="font-size:13px;color:#a89fb0;margin:6px 0">2v2 max · 4 players per game · no zombies or gators can enter the court · first to 21</p>';
  h+='<div class="sb"><span>LEVEL 29 '+bb.you+'</span><span>'+bb.them+' BALLERS</span></div><p role="status" aria-live="polite" style="font-size:18px;min-height:24px">'+bb.msg+'</p>';
  if(bb.phase==='choose')h+='<p>Your possession. Pick a play:</p>'+Object.keys(SHOTS).map(k=>'<button data-h="'+k+'">'+SHOTS[k].n+' ('+SHOTS[k].pts+')</button>').join('')+'<button class="alt" data-h="pass">Pass to teammate</button>';
  else if(bb.phase==='shoot'){const w=SHOTS[bb.shot].w;h+='<p>Release in the green zone.</p><div class="meter"><div class="zone" style="left:'+(50-w/2)+'%;width:'+w+'%"></div><div class="needle"></div></div><button data-h="release">RELEASE (SPACE)</button>';}
  else if(bb.phase==='defend')h+='<p>They are attacking. Time your contest in the green zone.</p><div class="meter"><div class="zone" style="left:40%;width:20%"></div><div class="needle"></div></div><button data-h="contest">CONTEST (SPACE)</button>';
  else h+='<button data-h="again">Run it back</button>';
  h+='<button class="alt" data-h="close">Leave court · ESC</button></div>';hp.innerHTML=h;if(board)board.draw(bb.you,bb.them,bb.msg);}

// ---------------------------------------------------------------- live 3D 2v2 seen in third person
const SHOT_DIST={layup:18,jumper:58,three:92};
let hAnim=null,hoopsT=0,hcam=null;
function shotAnim(who,made,kind){if(hoopsRig)hAnim={who,made,kind,t:0,dur:kind==='layup'?32:46};}
function resetHoops3D(){if(!hoopsRig)return;hAnim=null;hcam=null;const P=hoopsRig.P;
  [['you',-40,0],['mate',-70,40],['o1',-28,0],['o2',-60,40]].forEach(([k,x,z])=>{const f=P[k];f.x=f.tx=x;f.z=f.tz=z;f.jump=0;});}
function stepFigure(f,fx,fz){const dx=f.tx-f.x,dz=f.tz-f.z;f.x+=dx*.08;f.z+=dz*.08;const sp=Math.min(1,Math.hypot(dx,dz)*.06);f.ph+=.12+sp*.3;
  const sw=Math.sin(f.ph)*(.08+sp*.75);f.legL.rotation.x=sw;f.legR.rotation.x=-sw;f.armL.rotation.x=-sw*.7;f.armR.rotation.x=sw*.7;
  let jy=0;if(f.jump>0){jy=Math.sin((1-f.jump/26)*Math.PI)*10;f.jump--;f.armL.rotation.x=f.armR.rotation.x=-2.9;}
  const H=hoopsRig;f.g.position.set(H.cx+f.x,.7+jy,H.cz+f.z);f.g.rotation.y=Math.atan2(fx-f.x,fz-f.z);f.y=jy;}
function tickHoops(){const H=hoopsRig;if(!H)return;H.grp.visible=!!bb;if(!bb)return;hoopsT++;
  const P=H.P,R=H.rimX,hz=Math.max(30,(court.r.h/2)-18);
  const us=hAnim?hAnim.who!=='o1':bb.phase!=='defend',s=us?1:-1,A1=us?P.you:P.o1,A2=us?P.mate:P.o2,D1=us?P.o1:P.you,D2=us?P.o2:P.mate;
  const kind=hAnim?hAnim.kind:us?(bb.phase==='shoot'&&bb.shot?bb.shot:'jumper'):'jumper',dist=SHOT_DIST[kind]||58,w=Math.sin(hoopsT*.025);
  const ax=s*(R-dist-(bb.phase==='choose'?18:0)),az=w*hz*(dist>30?.55:.2);
  A1.tx=ax;A1.tz=az;A2.tx=s*(R-80);A2.tz=hz*.8*(az>0?-1:1);
  D1.tx=ax+s*13;D1.tz=az*.85;D2.tx=A2.tx+s*12;D2.tz=A2.tz*.8;
  const rimP={x:s*R,z:0};
  for(const f of [A1,A2])stepFigure(f,rimP.x,rimP.z);
  stepFigure(D1,A1.x,A1.z);stepFigure(D2,A2.x,A2.z);
  const b=H.ball;
  if(hAnim){const f=P[hAnim.who==='o1'?'o1':hAnim.who],k=Math.min(1,hAnim.t/hAnim.dur);hAnim.t++;
    if(hAnim.t===2)f.jump=26;
    if(k<1){const sx=f.x,sz=f.z,sy=22+f.y,ex=rimP.x,ez=hAnim.made?0:(hAnim.t%2?5:-5),ey=39,peak=dist*.28+10;
      b.position.set(H.cx+sx+(ex-sx)*k,sy+(ey-sy)*k+4*peak*k*(1-k),H.cz+sz+(ez-sz)*k);}
    else{const q=hAnim.t-hAnim.dur;if(hAnim.made)b.position.set(H.cx+rimP.x,Math.max(2,39-q*1.6),H.cz);
      else b.position.set(H.cx+rimP.x-s*q*1.5,Math.max(2,40+q*.8-q*q*.06),H.cz+q*.9);
      if(q>26)hAnim=null;}
    b.rotation.x+=.2;}
  else{const holder=bb.phase==='over'?P.you:A1,a=holder.g.rotation.y,bounce=Math.abs(Math.sin(hoopsT*.2));
    holder.armR.rotation.x=-.5-bounce*.5;
    b.position.set(holder.g.position.x+Math.sin(a)*3.2+Math.cos(a)*2.4,2+bounce*9.5,holder.g.position.z+Math.cos(a)*3.2-Math.sin(a)*2.4);b.rotation.x+=.15;}
  try{vmScene.visible=false;}catch(_){}}
function tickMascot(){if(!mascot)return;const m=mascot,t=frame||0,bounce=Math.abs(Math.sin(t*.16)),side=Math.sin(t*.03)>0?1:-1;
  m.side=(m.side==null?side:m.side)+(side-(m.side==null?side:m.side))*.15;
  m.g.position.x=m.home.x+Math.sin(t*.008)*14;m.g.position.y=.6+Math.abs(Math.sin(t*.32))*.4;
  m.ball.position.set(m.side*2.6,1.5+bounce*9,3.2);m.ball.rotation.x+=.18;
  const hand=-.45-bounce*.55;if(m.side>0){m.armR.rotation.x=hand;m.armL.rotation.x=.2;}else{m.armL.rotation.x=hand;m.armR.rotation.x=.2;}
  const step=Math.sin(t*.16)*.35;m.legL.rotation.x=step;m.legR.rotation.x=-step;m.g.rotation.y=Math.PI+Math.sin(t*.02)*.3;}
if(typeof placeCamera==='function'){const basePlace=placeCamera;
  placeCamera=function(){if(!bb||!hoopsRig||!isWorld(city)){try{vmScene.visible=true;}catch(_){}return basePlace.apply(this,arguments);}
    const H=hoopsRig,me=H.P.you,defending=hAnim?hAnim.who==='o1':bb.phase==='defend';
    const fx=defending?H.P.o1.x:H.rimX,fz=defending?H.P.o1.z:0;let dx=fx-me.x,dz=fz-me.z;const L=Math.hypot(dx,dz)||1;dx/=L;dz/=L;
    const cr=court.r,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
    const want={x:clamp(H.cx+me.x-dx*46,cr.x+6,cr.x+cr.w-6),y:34,z:clamp(H.cz+me.z-dz*46+22,cr.y+10,cr.y+cr.h+12)},look={x:H.cx+me.x+dx*34,y:14,z:H.cz+me.z+dz*34};
    if(hAnim){look.x=(look.x+H.ball.position.x)/2;look.y=(look.y+H.ball.position.y)/2;look.z=(look.z+H.ball.position.z)/2;}
    if(!hcam)hcam={p:Object.assign({},want),l:Object.assign({},look)};
    for(const k of ['x','y','z']){hcam.p[k]+=(want[k]-hcam.p[k])*.08;hcam.l[k]+=(look[k]-hcam.l[k])*.1;}
    camera.position.set(hcam.p.x,hcam.p.y,hcam.p.z);camera.lookAt(hcam.l.x,hcam.l.y,hcam.l.z);
    return Math.atan2(hcam.l.z-hcam.p.z,hcam.l.x-hcam.p.x);};}
hp.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-h]');if(!b)return;e.preventDefault();hact(b.dataset.h);});
addEventListener('keydown',e=>{if(!bb)return;if(e.key==='Escape'){e.preventDefault();closeHoops();return;}
  if(e.key===' '||e.code==='Space'){e.preventDefault();e.stopImmediatePropagation();hact(bb.phase==='shoot'?'release':bb.phase==='defend'?'contest':'');}},true);

// ---------------------------------------------------------------- character dancers in the club panel
const DANCE_LOOK=[{s:'#8a5a3c',h:'#1a1210'},{s:'#c69072',h:'#3b2314'},{s:'#5e3b2a',h:'#121010'},{s:'#e0b998',h:'#6b4a2a'}];
const clubObs=new MutationObserver(()=>{const p=document.getElementById('l29Panel');if(!p)return;
  p.querySelectorAll('.dancer:not(.fig)').forEach((d,i)=>{const L=DANCE_LOOK[i%4];const c=d.style.background||'#5b2a86';
    d.classList.add('fig','v'+(i%3));d.style.setProperty('--c',c);d.style.setProperty('--s',L.s);d.style.setProperty('--h',L.h);
    d.innerHTML='<i class="hd"></i><i class="tor"></i><i class="ar l"></i><i class="ar r"></i><i class="lg l"></i><i class="lg r"></i>';d.setAttribute('aria-hidden','true');});});
function watchClub(){const p=document.getElementById('l29Panel');if(p)clubObs.observe(p,{childList:true,subtree:true});else setTimeout(watchClub,500);}watchClub();

// ---------------------------------------------------------------- safety, stairs, rides and spot detection
const courtSafe=(x,y)=>court&&inRect(x,y,court.r,2*T);
function pushAway(){if(!player||!courtSafe(player.x,player.y))return;
  const push=o=>{if(!o||typeof o.x!=='number')return;const d=d2(o.x,o.y,player.x,player.y);if(d<480){const k=(480-d)/480*4+1;o.x+=(o.x-player.x)/(d||1)*k;o.y+=(o.y-player.y)/(d||1)*k;o.alert=false;if('atkCd' in o)o.atkCd=Math.max(o.atkCd,30);}};
  for(const z of zombies)if(z.alive)push(z);try{if(typeof gators!=='undefined'&&Array.isArray(gators))for(const g of gators)push(g);}catch(_){}}
try{const prevHurt=hurtPlayer;hurtPlayer=function(){if(ride||(player&&courtSafe(player.x,player.y)))return;return prevHurt.apply(this,arguments);};}catch(e){}
const prevTH=terrainHeight;terrainHeight=function(x,y){if(ride&&player&&Math.abs(x-player.x)<1&&Math.abs(y-player.y)<1){const v=ridePos();if(v)return v.y-6;}return prevTH.apply(this,arguments);};
let stairLatch=false;
function stairs(){const E=window.level29Estate,p=E&&E.penthouse;if(!p||!p.stairs||player.car||player.dead)return;const s=p.stairs;
  const dOut=d2(player.x,player.y,s.out.x,s.out.y),dTop=d2(player.x,player.y,s.top.x,s.top.y);
  if(stairLatch){if(dOut>30&&dTop>26)stairLatch=false;return;}
  const freeSpot=(x,y)=>{const prev=moverCtx;moverCtx=player;const r=player.r||10;try{for(let ring=0;ring<=60;ring+=6)for(let k=0;k<(ring?12:1);k++){const a=k/12*Math.PI*2,tx=x+Math.cos(a)*ring,ty=y+Math.sin(a)*ring;if(!blockedCircle(tx,ty,r))return{x:tx,y:ty};}}finally{moverCtx=prev;}return{x,y};};
  const go=(x,y,up)=>{p.active=up;const f=freeSpot(x,y);x=f.x;y=f.y;player.x=x;player.y=y;player.vx=player.vy=0;if(up&&typeof ronnie!=='undefined')ronnie.cd=0;view.yaw=-Math.PI/2;view.pitch=0;snapCamera();stairLatch=true;toast(up?'RONNIEBABY’S PENTHOUSE · TOP FLOOR':'MANSION FRONT STEPS');};
  if(!p.active&&dOut<22)go(s.top.x,s.top.y-18,true);
  else if(p.active&&dTop<14)go(s.out.x,s.out.y+26,false);}
const prevUpdate=update;
update=function(){
  prevUpdate.apply(this,arguments);
  if(!isWorld(city)||!player||state==='menu'){useBtn.style.display='none';return;}
  if(ride){if(state==='play'){const v=ridePos();if(v){player.x=v.x;player.y=v.z;player.vx=player.vy=0;}if(--ride.t<=0){player.x=ride.home.x;player.y=ride.home.y;ride=null;snapCamera();toast('RIDE OVER');}}useBtn.style.display='none';return;}
  if(state!=='play'){useBtn.style.display='none';return;}
  stairs();pushAway();
  if(frame%5===0){nearSpot=null;if(!player.car&&!player.dead){let bd=60;for(const s of spots()){const d=d2(player.x,player.y,s.x,s.y);if(d<bd){bd=d;nearSpot=s;}}}
    useBtn.style.display=nearSpot?'block':'none';if(nearSpot)useBtn.textContent='E · '+nearSpot.label;}
};
const prevRender=render;
render=function(){
  if(isWorld(city)){applyEnvironment();
    if(wheel){wheel.rotation.z+=.0035;const u=wheel.userData;for(const g of gondolas){const a=g.a+wheel.rotation.z;g.m.position.set(u.cx+Math.cos(a)*u.R,u.cy+Math.sin(a)*u.R,u.cz);}}
    if(coaster){coaster.t=(coaster.t+.0018)%1;const p=coaster.curve.getPointAt(coaster.t),q=coaster.curve.getPointAt((coaster.t+.01)%1);coaster.car.position.copy(p);coaster.car.lookAt(coaster.car.parent.localToWorld(q.clone()));}
    try{tickMascot();tickHoops();}catch(e){}
    if(carousel)carousel.rotation.y+=.012;if(ocean)ocean.material.opacity=.8+Math.sin(frame*.03)*.04;}
  prevRender.apply(this,arguments);
};
if(typeof makeCarMesh==='function'){
  const baseCarMesh=makeCarMesh,rimMat=new THREE.MeshStandardMaterial({color:0xd8d8dc,metalness:.9,roughness:.25}),
    trimMat=new THREE.MeshStandardMaterial({color:0x151518,metalness:.3,roughness:.6}),
    glassMat=new THREE.MeshStandardMaterial({color:0x1c2630,metalness:.6,roughness:.08,transparent:true,opacity:.82});
  makeCarMesh=function(c){
    const g=baseCarMesh(c);
    if(c.boat||g.userData.visualVersion===2)return g; // Boats have their own hull, deck and helm; never attach car wheels.
    try{
      const s=c.spec,L=s.len,W=s.wid,top=g.userData.top,old=g.userData.paint;
      if(old&&old.color){const paint=new THREE.MeshStandardMaterial({color:old.color.clone(),metalness:.55,roughness:.32});
        g.traverse(o=>{if(o.isMesh&&o.material===old)o.material=paint;});g.userData.paint=paint;}
      for(const [wx,wz] of [[L*.3,-W/2],[L*.3,W/2],[-L*.3,-W/2],[-L*.3,W/2]]){
        const rim=new THREE.Mesh(new THREE.CylinderGeometry(2.4,2.4,3.3,14),rimMat);rim.rotation.x=Math.PI/2;rim.position.set(wx,4,wz);g.add(rim);
        const hub=new THREE.Mesh(new THREE.CylinderGeometry(.8,.8,3.5,8),trimMat);hub.rotation.x=Math.PI/2;hub.position.set(wx,4,wz);g.add(hub);}
      const fb=new THREE.Mesh(new THREE.BoxGeometry(1.4,2,W*1.02),trimMat);fb.position.set(L/2+.4,4,0);g.add(fb);
      const rb=fb.clone();rb.position.x=-L/2-.4;g.add(rb);
      const grille=new THREE.Mesh(new THREE.BoxGeometry(.4,2.4,W*.42),trimMat);grille.position.set(L/2+.3,6.4,0);g.add(grille);
      if(!s.open&&c.type!=='truck'&&c.type!=='mtvr'&&c.type!=='humvee'){
        for(const z of [-W/2-.1,W/2+.1]){const sw=new THREE.Mesh(new THREE.BoxGeometry(L*.36,3.6,.3),glassMat);sw.position.set(-L*.04,top+3.4,z);g.add(sw);
          const mir=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.2,1.6),trimMat);mir.position.set(L*.2,top+1.4,z+(z<0?-.9:.9));g.add(mir);}}
      const skirt=new THREE.Mesh(new THREE.BoxGeometry(L*.42,.9,W+.4),trimMat);skirt.position.set(0,3.4,0);g.add(skirt);
    }catch(e){}
    return g;};
}
window.level29Coast={get pier(){return pier;},get strip(){return strip;},get court(){return court;},openHoops,startRide,get ride(){return ride;},enterResidence};
})();
