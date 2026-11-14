'use strict';
// Level 29: staffed interiors, five-floor hospital, fortress security and heists.
(function(){
const {batch,material,facade}=window.level29World;
const specs=[
 {id:'bank',name:'LEVEL 29 TRUST BANK',short:'TRUST BANK',letter:'$',col:'#e4c479'},
 {id:'grocery',name:'LEVEL 29 FRESH MARKET',short:'GROCERY',letter:'F',col:'#a8d18b'},
 {id:'gym',name:'LEVEL 29 IRON GYM',short:'IRON GYM',letter:'Y',col:'#ec9a6b'},
 {id:'hospital',name:'LEVEL 29 GENERAL HOSPITAL',short:'HOSPITAL · 5 FLOORS',letter:'+',col:'#9adbe0'},
 {id:'police',name:'LEVEL 29 POLICE STATION',short:'POLICE STATION',letter:'L',col:'#98b7f0'},
 {id:'gas',name:'LEVEL 29 GAS & GO',short:'GAS & GO',letter:'Q',col:'#efbd65'},
 {id:'fire',name:'LEVEL 29 FIRE & RESCUE',short:'FIRE STATION',letter:'R',col:'#ed9465'}
];
VENUE_TYPES.push(...specs);
const roles={fire:['FIRE CAPTAIN','#bd5033','#373d3f'],bank:['BANK TELLER','#3d5366','#263542'],grocery:['MARKET CLERK','#638b51','#343e30'],gym:['FITNESS COACH','#b64f35','#252b31'],hospital:['MEDICAL TEAM','#b5d3d5','#657f89'],police:['DESK SERGEANT','#31496d','#23344c'],gas:['STATION ATTENDANT','#b27339','#333b45']};
let saved={bank:0,cardio:0,conditioning:0,owned:[],income:0,at:Date.now()};
try{Object.assign(saved,JSON.parse(localStorage.getItem('level29.places.v1')||'{}'));}catch(_){}
function persist(){try{localStorage.setItem('level29.places.v1',JSON.stringify(saved));}catch(_){}}
function speak(name,txt,col){subtitle={name,txt,t:Math.max(240,txt.length*4),col};}
const portrait=new Image();portrait.crossOrigin='anonymous';portrait.src='ronnie.png';
const faces=new Map();
function face(name,col){if(faces.has(name))return faces.get(name);const c=document.createElement('canvas');c.width=c.height=80;const g=c.getContext('2d');g.fillStyle='#24313a';g.fillRect(0,0,80,80);g.fillStyle=col||'#74968a';g.fillRect(9,52,62,28);g.fillStyle='#b88767';g.beginPath();g.ellipse(40,32,17,22,0,0,7);g.fill();g.fillStyle='#27251f';g.fillRect(22,11,36,12);g.fillStyle='#222';g.fillRect(30,30,4,3);g.fillRect(46,30,4,3);g.fillStyle='#704a39';g.fillRect(36,43,9,2);faces.set(name,c);return c;}
window.drawCharacterCaption=function(s){
 const mobile=SW<700,w=Math.min(700,SW-24),sz=mobile?48:70,font=mobile?12:15,tx=(SW-w)/2+sz+24;
 cx.save();cx.font="500 "+font+"px 'IBM Plex Mono'";const max=w-sz-40,words=String(s.txt||'').split(/\s+/),lines=[];let line='';
 for(const word of words){const next=line?line+' '+word:word;if(cx.measureText(next).width>max&&line){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);
 const stereo=document.getElementById('spotifyPanel'),stereoUp=mobile&&player&&player.car&&stereo&&stereo.style.display==='block',expanded=stereoUp&&document.getElementById('spotifyMount').style.display!=='none';
 if(stereoUp&&lines.length>5){lines.length=5;lines[4]+='…';}
 const h=Math.max(sz+20,36+lines.length*(font+6)),y=mobile&&SH>=600?(stereoUp?(expanded?426:230):134):Math.max(110,SH-(mobile?190:135)-h),x=(SW-w)/2;
 cx.fillStyle='rgba(8,14,19,.94)';cx.fillRect(x,y,w,h);cx.fillStyle=s.col||'#e5bd63';cx.fillRect(x,y,3,h);
 const im=/RONNIEBABY/.test(s.name)&&portrait.complete&&portrait.naturalWidth?portrait:face(s.name,s.col);cx.drawImage(im,x+12,y+10,sz,sz);
 cx.textAlign='left';cx.textBaseline='top';cx.fillStyle=s.col||'#e5bd63';cx.font="800 "+(mobile?13:16)+"px 'Barlow Condensed'";cx.fillText(s.name,tx,y+10,max);
 cx.font="500 "+font+"px 'IBM Plex Mono'";cx.fillStyle='#f6f2e6';lines.forEach((l,i)=>cx.fillText(l,tx,y+33+i*(font+6)));cx.restore();
};
// Actual voice captions remain visible over Ronniebaby's conversation panel.
const voiceCaption=document.createElement('div');voiceCaption.id='voiceCaption';voiceCaption.style.cssText='display:none;position:fixed;z-index:65;left:50%;bottom:16px;transform:translateX(-50%);width:min(680px,calc(100% - 32px));background:#0b1319f5;border-left:3px solid #d4b266;padding:10px 14px;box-sizing:border-box;color:#f3eddb;font:13px/1.5 "IBM Plex Mono",monospace;pointer-events:none';document.body.appendChild(voiceCaption);
const oldRbSay=rbSay;rbSay=function(key,next){const out=oldRbSay(key,next);if(RB_TEXT[key])speak('RONNIEBABY',RB_TEXT[key]);return out;};
// Concrete blocks are reserved before the existing renderer builds the city.
const sites=[['bank',4,4,8,7],['grocery',6,4,8,7],['gym',4,5,8,7],['police',4,6,8,7],['hospital',5,6,9,8],['bank',6,6,8,7],['gas',3,6,7,4],['gas',5,2,7,4],['fire',6,2,8,7]];
function walls(v){const b=v.b,t=3;v.colliderWalls=[{x:b.x,y:b.y,w:b.w,h:t},{x:b.x,y:b.y,w:t,h:b.h},{x:b.x+b.w-t,y:b.y,w:t,h:b.h},{x:b.x,y:b.y+b.h-t,w:(b.w-v.doorW)/2,h:t},{x:v.doorX+v.doorW/2,y:b.y+b.h-t,w:(b.w-v.doorW)/2,h:t}];v.colliderDoor={x:v.doorX-v.doorW/2,y:v.doorY-t,w:v.doorW,h:t};}
const oldGen=genCity;genCity=function(di){const c=oldGen(di);c.fortressWalls=[];c.fortressGates=[];
 if(!c.world)return c;
 for(const [id,bx,by,wt,ht]of sites){const x=(ROADS[bx]+4)*TILE,y=(ROADS[by]+4)*TILE,lot={x,y,w:9*TILE,h:9*TILE};
  c.buildings=c.buildings.filter(b=>b.venue||!overlap(b,lot));c.features=c.features.filter(f=>!overlap(f,lot));c.parked=c.parked.filter(p=>!inside(p.x,p.y,lot));
  for(let yy=y/TILE;yy<y/TILE+9;yy++)for(let xx=x/TILE;xx<x/TILE+9;xx++)c.g[yy*MW+xx]=T_LOT;
  const b={x:x+(9-wt)*TILE/2,y:y+12,w:wt*TILE,h:ht*TILE,H:id==='hospital'?280:52,col:'#c7c0a8',kind:'normal',seed:bx*100+by};
  const v=createVenue(b,id,'places-'+bx+'-'+by);v.extended=true;v.serviceLabel='U · TALK / '+(id==='hospital'?'CARE / ELEVATOR':'SERVICES');v.stationX=b.x+b.w/2;v.stationY=b.y+b.h*.65;v.floor=0;v.staff=[];walls(v);c.buildings.push(b);c.venues.push(v);
  if(id==='hospital')c.hospital=v;
 }
 clearTreesFromBuildings(c);
 for(const sf of (c.safes||[]).slice(0,1)){const x=(ROADS[sf.bx]+3)*TILE,y=(ROADS[sf.by]+3)*TILE,w=11*TILE,h=11*TILE,gateX=sf.x,t=6,gw=48;
  const rs=[{x,y,w,h:t},{x,y,w:t,h},{x:x+w-t,y,w:t,h},{x,y:y+h-t,w:gateX-x-gw,h:t},{x:gateX+gw,y:y+h-t,w:x+w-gateX-gw,h:t}];c.fortressWalls.push(...rs);c.fortressGates.push({x:gateX-gw,y:y+h-t-1,w:gw*2,h:t+2});sf.fort={x,y,w,h,gateX};sf.front={x:gateX,y:y+h+48,a:-Math.PI/2};
 }
 return c;
};
// Venue lots stay fully clear so entrances are never blocked; every other building gets a margin around its footprint.
function clearTreesFromBuildings(c){
 const lots=sites.map(([,bx,by])=>({x:(ROADS[bx]+4)*TILE,y:(ROADS[by]+4)*TILE,w:9*TILE,h:9*TILE}));
 const pad=TILE*.75,zones=lots.concat(c.buildings.map(b=>({x:b.x-pad,y:b.y-pad,w:b.w+pad*2,h:b.h+pad*2})));
 for(const v of c.venues||[])if(v.doorX!==undefined)zones.push({x:v.doorX-TILE*1.5,y:v.doorY-TILE,w:TILE*3,h:TILE*3});
 const keep=t=>!zones.some(z=>t.x>z.x-(t.r||0)&&t.x<z.x+z.w+(t.r||0)&&t.y>z.y-(t.r||0)&&t.y<z.y+z.h+(t.r||0));
 c.trees=c.trees.filter(keep);
 if(c.pineTrees)c.pineTrees=c.pineTrees.filter(keep);
 if(c.biome&&c.pineTrees)c.trees=c.pineTrees;
 if(typeof indexTrees==='function')indexTrees(c);
}
function inside(x,y,b){return x>b.x&&x<b.x+b.w&&y>b.y&&y<b.y+b.h;}
function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
const oldBlocked=blockedCircle;blockedCircle=function(x,y,r){if(city&&city.world){for(const b of city.fortressWalls||[])if(hitRect(x,y,r,b))return true;if(moverCtx&&moverCtx.alive!==undefined){for(const b of city.fortressGates||[])if(hitRect(x,y,r,b))return true;}
 const h=city.hospital;if(h&&h.floor>0&&inside(player.x,player.y,h.b)&&moverCtx===player&&!inside(x,y,{x:h.b.x+4,y:h.b.y+4,w:h.b.w-8,h:h.b.h-8}))return true;}
 return oldBlocked(x,y,r);};
const oldHeight=terrainHeight;terrainHeight=function(x,y){const h=city&&city.hospital;if(h&&h.floor>0&&inside(x,y,h.b))return h.floor*56;return oldHeight(x,y);};
function staff(v,g,x,y,z,role){const m=makeFigure(false),job=roles[v.id];setFigureColors(m,'#b17c59',job[1],job[2],'#252320');poseFigure(m,x,y,Math.PI/2,0,'stand');m.position.y=z;g.add(m);const label=new THREE.Sprite(new THREE.SpriteMaterial({map:signTex(role||job[0],'#17232b',v.col,512,72)}));label.scale.set(52,7,1);label.position.y=28;m.add(label);v.staff.push({m,x,y,z,role:role||job[0],floor:Math.round(z/56)});v.furniture.push({x:x-5,y:y-5,w:10,h:10});return m;}
const wallStyle={fire:['#af725e','brick'],bank:['#b8a58b','brick'],grocery:['#d6cca4','stucco'],gym:['#9c6e56','brick'],police:['#8f9aa8','brick'],hospital:['#e6e2d6','stucco'],gas:['#d7c8a5','stucco']};
function fw(g,w,h,d,x,y,z,mat){const geo=new THREE.BoxGeometry(w,h,d),uv=geo.attributes.uv,rx=Math.max(1,Math.round(Math.max(w,d)/95)),ry=Math.max(1,Math.round(h/52));for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*rx,uv.getY(i)*ry);const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);g.add(m);return m;}
function shell(v,g,q,base,level){const b=v.b,st=wallStyle[v.id],fm=facade(st[0],st[1]),trim=material('#425560',.35),floor=material(level%2?'#6c7f7d':'#7d8279'),cap=material('#cfc9b8');
 q.box(b.w,.8,b.h,b.x+b.w/2,base+.4,b.y+b.h/2,floor);q.box(b.w+6,4,b.h+6,b.x+b.w/2,base+54,b.y+b.h/2,trim);if(level===4||v.id!=='hospital')q.box(b.w+9,4,b.h+9,b.x+b.w/2,base+58.5,b.y+b.h/2,cap);
 fw(g,b.w,52,3,b.x+b.w/2,base+26,b.y+1.5,fm);for(const x of [b.x+1.5,b.x+b.w-1.5])fw(g,3,52,b.h,x,base+26,b.y+b.h/2,fm);
 if(level===0){const sw=(b.w-v.doorW)/2;for(const x of [b.x+sw/2,b.x+b.w-sw/2])fw(g,sw,52,3,x,26,v.doorY-1.5,fm);fw(g,v.doorW,10,3,v.doorX,47,v.doorY-1.5,fm);v.door=addPart(g,v.doorW-1,41,1.5,v.doorX,20.5,v.doorY-1,material('#3c646b',.3));}
 else fw(g,b.w,52,3,b.x+b.w/2,base+26,v.doorY-1.5,fm);
 const ceil=new THREE.Mesh(new THREE.PlaneGeometry(b.w-6,b.h-6).rotateX(Math.PI/2),new THREE.MeshBasicMaterial({color:'#d7ded4'}));ceil.position.set(b.x+b.w/2,base+51,b.y+b.h/2);g.add(ceil);
 for(const x of [b.x+b.w*.28,b.x+b.w*.72])for(const y of [b.y+b.h*.23,b.y+b.h*.7])q.box(38,1,4,x,base+50,y,material('#f3eed6'));
}
function furnish(v,g,q,base,level){const b=v.b,white=material('#d9ded6'),dark=material('#253842'),wood=material('#866944'),steel=material('#7c8a8f',.6),green=material('#5c8e67');
 const item=(x,y,w,h,d,m,solid=true)=>{q.box(w,h,d,x,base+h/2,y,m);if(solid)v.furniture.push({x:x-w/2,y:y-d/2,w,h:d});};
 const sign=(s,x,y,w=100)=>addSign(g,s,w,9,x,base+30,y,v.col);
 if(v.id==='gas'){
  const store=level29GasStation.build(THREE,b,base);g.add(store.root);v.furniture.push(...store.solids);v.referenceGas=true;
  staff(v,g,store.plan.staff.x,store.plan.staff.y,base);
 }else if(v.id==='grocery'){
  item(b.x+b.w/2,b.y+40,80,12,18,wood);sign('CHECKOUT · U',b.x+b.w/2,b.y+4,100);
  for(const x of [b.x+38,b.x+b.w-38])for(const y of [b.y+90,b.y+145]){
   if(y>b.y+b.h-35)continue;
   v.furniture.push({x:x-14,y:y-19,w:28,h:38});
   q.box(28,25,1,x,base+12.5,y-18,steel);
   for(const s of [-1,1])q.box(1,25,38,x+s*13.5,base+12.5,y,steel);
   for(const h of [2,10,18,25])q.box(28,1,38,x,base+h,y,steel);
   for(let row=0;row<3;row++)for(let k=0;k<3;k++){
    q.box(6,5,10,x-8+k*8,base+6+row*8,y+10,material(['#b74737','#a9b765','#d2ad59'][k]));
    q.box(4,1.4,.2,x-8+k*8,base+6+row*8,y+15.1,white);
   }
  }
  staff(v,g,b.x+b.w/2,b.y+22,base);for(const [label,x]of [['DRINKS',b.x+38],['FOOD',b.x+b.w-38]])sign(label,x,b.y+5,55);
 }else if(v.id==='bank'){
  item(b.x+b.w/2,b.y+65,b.w-70,14,20,wood);sign('TELLER · ACCOUNTS / VAULT',b.x+b.w/2,b.y+4,180);staff(v,g,b.x+b.w/2,b.y+42,base);
  item(b.x+35,b.y+130,38,36,30,steel);sign('VAULT',b.x+35,b.y+112,40);for(let k=0;k<3;k++){q.box(8,3,9,b.x+25+k*9,base+21,b.y+147,green);}
  for(const x of [b.x+b.w-35,b.x+b.w-65])item(x,b.y+b.h-50,20,9,22,dark);
 }else if(v.id==='gym'){
  for(const x of [b.x+35,b.x+b.w-35])for(const y of [b.y+60,b.y+120]){item(x,y,28,3,40,dark);q.box(3,19,3,x+12,base+11,y-16,steel);q.box(28,2,3,x,base+21,y-16,steel);}
  for(const y of [b.y+40,b.y+95]){item(b.x+90,y,26,8,45,steel);q.box(45,2,3,b.x+90,base+24,y,steel);for(const x of [b.x+70,b.x+110])q.box(4,14,14,x,base+24,y,dark);}
  sign('CARDIO · STRENGTH · CONDITIONING',b.x+b.w/2,b.y+4,180);staff(v,g,b.x+b.w*.66,b.y+b.h*.4,base);
 }else if(v.id==='police'){
  item(b.x+b.w/2,b.y+65,b.w-65,14,24,dark);sign('DESK SERGEANT · U',b.x+b.w/2,b.y+4,155);staff(v,g,b.x+b.w/2,b.y+35,base);
  for(const x of [b.x+40,b.x+b.w-40]){item(x,b.y+120,35,25,22,steel);q.box(26,1,1,x,base+27,b.y+132,white);}
  sign('EVIDENCE',b.x+42,b.y+103,60);sign('EQUIPMENT',b.x+b.w-42,b.y+103,64);
  for(let k=0;k<5;k++)q.box(2,39,2,b.x+b.w*.68+k*8,base+20,b.y+b.h-45,steel);
 }else if(v.id==='fire'){
  item(b.x+b.w/2,b.y+58,84,13,22,dark);sign('FIRE CAPTAIN · PAID RESCUE JOBS',b.x+b.w/2,b.y+4,190);staff(v,g,b.x+b.w/2,b.y+30,base);
  for(let k=0;k<4;k++){const x=b.x+36+k*26;item(x,b.y+112,20,36,18,steel);q.box(13,18,2,x,base+22,b.y+122,material('#bd5033'));}
  for(const x of [b.x+38,b.x+b.w-38]){item(x,b.y+b.h-55,24,6,30,wood);q.box(9,14,9,x,base+13,b.y+b.h-55,material('#e5c24b'));}
  sign('RESCUE GEAR / DISPATCH',b.x+b.w/2,b.y+94,170);
 }else if(v.id==='hospital'){
  const labels=['1 · EMERGENCY / RECEPTION','2 · PHARMACY / WARDS','3 · SURGERY / TRAUMA','4 · DIAGNOSTICS / LAB','5 · RECOVERY / DISPATCH'];
  sign(labels[level],b.x+b.w/2,b.y+4,220);
  item(b.x+b.w/2,b.y+53,90,12,18,white);q.box(18,10,2,b.x+b.w/2,base+19,b.y+54,dark);
  staff(v,g,b.x+b.w/2,b.y+33,base,['ER NURSE','PHARMACIST','SURGEON','LAB TECHNICIAN','RECOVERY DOCTOR'][level]);
  for(const x of [b.x+40,b.x+b.w-40])for(const y of [b.y+110,b.y+180]){item(x,y,28,8,45,white);q.box(25,3,36,x,base+10,y,material('#83aeb6'));q.box(20,4,10,x,base+13,y-14,white);q.box(2,30,2,x+20,base+15,y-15,steel);q.box(12,12,2,x+20,base+30,y-15,dark);q.box(8,1,2,x+20,base+30,y-13,green);}
  const ex=b.x+b.w/2,ey=b.y+b.h-24;item(ex,ey,50,1,30,steel,false);sign('U · ELEVATOR / FLOOR '+(level+1),ex,b.y+b.h-4,150);
  if(level===1)for(let k=0;k<5;k++){q.box(7,5,6,b.x+38+k*12,base+17,b.y+69,material(k%2?'#e3e8d4':'#789cb6'));}
  if(level===2){item(b.x+b.w*.6,b.y+130,35,12,55,steel);q.box(36,1,25,b.x+b.w*.6,base+42,b.y+130,white);}
 }
}
const oldVenue=buildVenue;buildVenue=function(v){if(!v.extended)return oldVenue(v);const g=new THREE.Group();g.name='level29-'+v.id;v.mesh=g;cityGroup.add(g);v.floorFurniture=[];const q=batch(g),levels=v.id==='hospital'?5:1;
 for(let l=0;l<levels;l++){v.furniture=[];shell(v,g,q,l*56,l);furnish(v,g,q,l*56,l);v.floorFurniture.push(v.furniture);}
 v.furniture=v.floorFurniture[v.floor];q.finish();addSign(g,v.name,Math.min(250,v.b.w),15,v.doorX,levels*56+10,v.doorY,v.col);v.labelH=levels*56+34;addSign(g,'WALK IN · AUTO DOOR',150,8,v.doorX,46,v.doorY+1,v.col);
 const tq=batch(g);if(v.id==='gas'){const b=v.b,zz=b.y+b.h+58;tq.box(b.w+30,5,65,b.x+b.w/2,46,zz,material('#d2c3a1'));for(const x of [b.x+25,b.x+b.w-25]){tq.box(3,46,3,x,23,zz,material('#9b7548'));tq.box(15,22,13,x,11,zz,material('#c7b696'));tq.box(11,7,1,x,16,zz+7,material('#24343d'));tq.box(2,12,2,x+10,13,zz,material('#252d32'));}addSign(g,'LEVEL 29 · FUEL',170,10,b.x+b.w/2,44,zz+33,v.col);}
 if(v.id==='hospital'){const b=v.b;tq.box(8,35,2,b.x+20,170,v.doorY+2,material('#cf5551'));tq.box(25,8,2,b.x+20,170,v.doorY+2,material('#cf5551'));}
 tq.finish();
};
let guards=[];
const GUARD_SKINS=['#8a5a3c','#a87954','#6b4430','#c79a74','#523424','#b8875f'];
let guardKit=null;
function guardMats(){
 if(guardKit)return guardKit;
 const std=(c,m,r)=>new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r});
 guardKit={vest:std('#2f3826',0,.9),strap:std('#1d2219',0,.9),pouch:std('#3a4430',0,.92),helmet:std('#262b24',.1,.7),
  lens:std('#0b0d10',.6,.15),gun:std('#17191c',.6,.42),grip:std('#25221e',.1,.8),patch:std('#c9a44a',.3,.5),
  radio:std('#121417',.3,.5),pad:std('#1b1e1a',0,.8),glove:std('#141414',0,.85),led:new THREE.MeshBasicMaterial({color:'#5cff7a'})};
 return guardKit;
}
function guardRifle(K){
 const r=new THREE.Group();
 const p=(w,h,d,x,y,z,mat)=>{const m=box(w,h,d,mat);m.position.set(x,y,z);r.add(m);return m;};
 p(7,1.6,1,0,0,0,K.gun);p(3.6,1.9,.9,-5,-.35,0,K.grip);p(1.2,1.4,.8,-3.2,-.9,0,K.grip);
 p(3.8,1.3,1.15,5.2,.05,0,K.grip);p(2.6,.85,.75,.4,1.25,0,K.gun);
 const mag=p(1.1,2.8,.8,1.6,-1.8,0,K.gun);mag.rotation.z=-.22;
 const grip=p(.9,2,.8,-1.8,-1.4,0,K.grip);grip.rotation.z=.3;
 const brl=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,5,8),K.gun);brl.rotation.z=Math.PI/2;brl.position.set(9.4,.15,0);r.add(brl);
 return r;
}
function dressGuard(m,i){
 const K=guardMats(),u=m.userData;
 setFigureColors(m,GUARD_SKINS[i%GUARD_SKINS.length],'#232a31','#262b30','#16110d');
 const add=(parent,w,h,d,x,y,z,mat)=>{const b=box(w,h,d,mat);b.position.set(x,y,z);parent.add(b);return b;};
 const vest=new THREE.Mesh(new THREE.CylinderGeometry(1,.94,5.8,16),K.vest);vest.scale.set(2.78,1,4.1);vest.position.y=12.9;u.body.add(vest);
 for(const z of [-2.1,0,2.1])add(u.body,1.1,2.1,1.7,2.85,11.1,z,K.pouch);
 add(u.body,.5,.9,3.4,2.8,14.4,0,K.patch);
 for(const z of [-2.4,2.4])add(u.body,4.6,.8,1.1,0,15.9,z,K.strap);
 add(u.body,1.6,2.8,1.4,-2.7,12.4,-2.2,K.radio);
 const ant=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,3,5),K.radio);ant.position.set(-2.7,15.2,-2.2);u.body.add(ant);
 add(u.body,.2,.35,.35,-1.85,13.1,-2.2,K.led);
 add(u.body,2.4,1.1,4.2,0,9.45,0,K.strap);
 u.hair.visible=false;u.longHair.visible=false;
 u.helmet.material=K.helmet;u.helmet.visible=true;u.helmet.scale.set(.86,.78,.82);u.helmet.position.y=19.55;
 add(u.body,.35,.75,3.1,2.28,18.65,0,K.lens);
 for(const z of [-1.55,1.55])add(u.body,1.8,.22,.22,1.35,18.75,z,K.lens);
 const ear=new THREE.Mesh(new THREE.SphereGeometry(.42,8,6),K.radio);ear.position.set(-.1,18.2,-2.3);u.body.add(ear);
 for(const leg of [u.legL,u.legR])add(leg,1.1,1.8,2.4,1.45,-3.9,0,K.pad);
 add(u.legR,1.6,2.6,1.4,0,-2,1.75,K.strap);
 for(const arm of [u.armL,u.armR]){const g=new THREE.Mesh(new THREE.SphereGeometry(1.02,10,8),K.glove);g.position.set(.1,-7.7,0);g.scale.set(1,1.25,.82);arm.add(g);}
 const rifle=guardRifle(K);rifle.position.set(5.3,12.4,.9);rifle.rotation.y=-.12;u.body.add(rifle);
 u.aim=true;
 m.traverse(o=>{if(o.isMesh)o.castShadow=true;});
}
function buildFortresses(){guards=[];const g=new THREE.Group();g.name='level29-mansion-fortresses';cityGroup.add(g);const q=batch(g),stone=material('#a5a58e'),cap=material('#d4cfb7'),iron=material('#344047',.5),sand=material('#8d8965'),white=material('#dad2b8'),dark=material('#344651');
 for(const sf of city.safes){const f=sf.fort,b=sf.B;if(!f)continue;
  for(const r of city.fortressWalls.filter(r=>r.x>=f.x&&r.x<=f.x+f.w&&r.y>=f.y&&r.y<=f.y+f.h)){q.box(r.w,28,r.h,r.x+r.w/2,14,r.y+r.h/2,stone);q.box(r.w+2,3,r.h+2,r.x+r.w/2,29,r.y+r.h/2,cap);}
  for(let k=0;k<12;k++){const x=f.x+10+k*23;for(const y of [f.y+2,f.y+f.h-2]){if(y>f.y+10&&Math.abs(x-f.gateX)<48)continue;q.box(11,6,7,x,33,y,stone);}}
  for(const x of [f.x+14,f.x+f.w-14])for(const y of [f.y+14,f.y+f.h-14]){q.box(22,49,22,x,24.5,y,stone);q.box(29,3,29,x,51,y,iron);q.box(25,2,25,x,65,y,iron);for(const xx of [-11,11])for(const yy of [-11,11])q.box(1.3,13,1.3,x+xx,58,y+yy,iron);q.box(7,5,5,x,54,y,dark);
   const guard=makeFigure(false);dressGuard(guard,guards.length);g.add(guard);guards.push({m:guard,x,y,z:52,a:0,cool:0,home:sf});}
  const mk=(x,y,z,pts,a)=>{const gd=makeFigure(false);dressGuard(gd,guards.length);g.add(gd);guards.push({m:gd,x,y,z,a:a||0,cool:0,pts,pi:0,home:sf});};
  mk(f.gateX-70,f.y+f.h-30,0,null,Math.PI/2);mk(f.gateX+70,f.y+f.h-30,0,null,Math.PI/2);
  mk(f.x+60,f.y+f.h-36,0,[[f.x+50,f.y+f.h-36],[f.x+f.w-50,f.y+f.h-36]]);mk(f.x+f.w-60,f.y+f.h-36,0,[[f.x+f.w-50,f.y+f.h-36],[f.x+50,f.y+f.h-36]]);
  mk(f.x+f.w-30,f.y+90,0,[[f.x+f.w-30,f.y+60],[f.x+f.w-30,f.y+f.h-70]]);
  mk(f.x+30,f.y+90,0,[[f.x+30,f.y+60],[f.x+30,f.y+f.h-70]]);mk(f.x+f.w/2,f.y+f.h-110,0,[[f.x+70,f.y+f.h-110],[f.x+f.w-70,f.y+f.h-110]]);mk(f.x+f.w/2+20,f.y+50,0,[[f.x+60,f.y+36],[f.x+f.w-60,f.y+36]]);
  {const hx=f.x+f.w-82,hy=f.y+f.h-96,pad=material('#4a4f52'),paint=material('#e6d9a6');q.box(88,1.5,88,hx,.8,hy,pad);q.box(60,1.6,8,hx,1.7,hy,paint);q.box(8,1.6,60,hx,1.7,hy,paint);q.box(92,2,4,hx,1.5,hy-46,paint);q.box(92,2,4,hx,1.5,hy+46,paint);
   const fx=f.gateX-82,fy=f.y+f.h-88;q.box(54,4,54,fx,2,fy,stone);q.box(40,6,40,fx,5,fy,cap);q.box(10,22,10,fx,14,fy,white);q.box(26,3,26,fx,26,fy,cap);
   q.box(40,.6,f.y+f.h-(b.y+b.h),f.gateX,.5,(b.y+b.h+f.y+f.h)/2,material('#6d6a60'));}
  for(const x of [f.gateX-54,f.gateX+54]){q.box(14,56,14,x,28,f.y+f.h-5,cap);q.box(18,4,18,x,58,f.y+f.h-5,iron);q.box(24,3,26,x,5,f.y+f.h-24,sand);q.box(24,3,26,x,8,f.y+f.h-24,sand);q.box(24,3,26,x,11,f.y+f.h-24,sand);q.box(10,3,3,x,17,f.y+f.h-24,iron);}
  q.box(112,5,6,f.gateX,66,f.y+f.h-4,iron);
  addSign(g,'LEVEL 29 · GUARDED MANSION',200,12,f.gateX,54,f.y+f.h-3,'#e3cc8f');addSign(g,'SECURE CHECKPOINT · RESIDENT ACCESS',165,7,f.gateX,41,f.y+f.h-2,'#b5cdad');
  q.box(b.w,43,b.h,b.x+b.w/2,76,b.y+b.h/2,facade('#c2b99e','stucco'));q.box(b.w+12,6,b.h+12,b.x+b.w/2,101,b.y+b.h/2,iron);q.box(b.w+10,3,38,b.x+b.w/2,56,b.y+b.h+12,cap);
  for(const x of [b.x+10,b.x+b.w-10,b.x+b.w*.35,b.x+b.w*.65]){q.box(5,48,5,x,25,b.y+b.h+24,white);q.box(10,4,10,x,50,b.y+b.h+24,cap);}
  for(let k=0;k<14;k++)q.box(1.3,13,1.3,b.x+5+k*(b.w-10)/13,64,b.y+b.h+30,iron);q.box(b.w,1.5,1.5,b.x+b.w/2,71,b.y+b.h+30,iron);
  for(const x of [f.x+25,f.x+f.w-25])for(let k=0;k<3;k++)q.box(16,12,22,x,6,f.y+100+k*29,material('#4c6748'));
 }
 q.finish();return g;
}
const oldBuild=buildCity;buildCity=function(){oldBuild();if(!city.world)return;const g=buildFortresses();const keep=guards.map(q=>q.m);window.level29BatchStatic(g,keep);};
// Every worker can be spoken to, not only the marked service desk.
const oldNear=nearStation;nearStation=function(){if(player&&city){for(const v of city.venues||[]){if(!v.extended||!insideVenue(v,player))continue;const st=v.staff.filter(s=>s.floor===v.floor);if(st.some(s=>dist(player.x,player.y,s.x,s.y)<48)||dist(player.x,player.y,v.stationX,v.stationY)<50||v.id==='hospital'&&dist(player.x,player.y,v.b.x+v.b.w/2,v.b.y+v.b.h-24)<38)return v;}
 for(const v of city.venues||[]){if(v.worker&&insideVenue(v,player)&&dist(player.x,player.y,v.workerX,v.workerY)<38)return v;}}
 return oldNear();};
const greetings={fire:'Fire and rescue is hiring. Open the jobs board for paid fire calls and rescue work.',safe:'Welcome home. The perimeter is guarded. Rest here and save your progress.',garage:'Pull your vehicle into the marked bay and I will get it running again.',armory:'You need gear? Take a look at the weapons and body armor.',spray:'Bring your ride into the wash bay for repairs and a fresh coat.',business:'Welcome to the office. Buy this business or collect your income.',bank:'Welcome to Level 29 Trust. Deposit cash for safekeeping or withdraw it whenever you need it.',grocery:'Fresh food and cold drinks. What can I get you?',gym:'Ready to work? Cardio improves your movement. Conditioning builds your maximum health.',hospital:'You are safe here. We have emergency care, pharmacy, surgery, diagnostics and recovery. Use the elevator to visit all five floors.',police:'Welcome to the station. Settle your heat, collect armor or requisition a cruiser.',gas:'Fuel, snacks, repairs and station income. What do you need?'};
const panel=document.createElement('div');panel.id='placePanel';document.body.appendChild(panel);let active=null,robbery=null,robCooldown={};
const moneyText=n=>'$'+Math.floor(n).toLocaleString();
function close(){panel.style.display='none';if(state==='shop')state='play';for(const k in keys)keys[k]=false;mouse.down=false;active=null;}
function row(title,desc,label,act,disabled=false){return '<div class="item"><div><b>'+title+'</b><span>'+desc+'</span></div><button data-place="'+act+'" '+(disabled?'disabled':'')+'>'+label+'</button></div>';}
function show(v){active=v;state='shop';mouse.down=false;for(const k in keys)keys[k]=false;if(player.car)player.car.v=0;
 let h='',id=v.id;
 if(id==='grocery'||id==='gas'){h+=row('Hot meal','Restore 50 health.','BUY · $60','food');h+=row('Energy drink','Move faster for 90 seconds.','BUY · $90','drink');}
 if(id==='bank'){h+=row('Deposit $1,000','Banked balance: '+moneyText(saved.bank)+'. Your account stays safe in the vault.','DEPOSIT','deposit',cash<1000);h+=row('Withdraw $1,000','Move banked money into your wallet.','WITHDRAW','withdraw',saved.bank<1000);}
 if(id==='gas'){h+=row('Repair nearby vehicle','Restore the closest vehicle parked outside.','REPAIR · $150','repair');h+=row('Station investment','Own this station for $8,000. Earn $220 per minute.','INVEST / COLLECT','invest');}
 if(id==='gym'){h+=row('Cardio training','+5% walking speed per session. Level '+saved.cardio+'/4.','TRAIN · $800','cardio',saved.cardio>=4);h+=row('Conditioning','+25 maximum health per session. Level '+saved.conditioning+'/4.','TRAIN · $1,200','conditioning',saved.conditioning>=4);}
 if(id==='police'){h+=row('Settle heat','Clear your current wanted heat.','SETTLE · $750','heat');h+=row('Protective vest','Refill body armor to at least 100.','BUY · $400','armor');h+=row('Cruiser requisition','A repaired police cruiser is delivered outside.','BUY · $4,500','cruiser');}
 if(id==='hospital'){const f=v.floor;h+=row('Current department',['Emergency and reception','Pharmacy and patient wards','Surgery and trauma','Diagnostics and laboratory','Recovery and medical dispatch'][f],'FLOOR '+(f+1),'noop',true);
 const treatments=[['Emergency care','Restore all health.','TREAT · $200','heal'],['Pharmacy pack','Full heal and 90 seconds of regeneration.','BUY · $300','pharmacy'],['Trauma surgery','Increase maximum health by 25, up to 500.','OPERATE · $2,000','surgery'],['Diagnostic treatment','Full heal and two minutes of regeneration.','SCAN · $500','lab'],['Recovery ward','Full heal and clear heat.','REST · $250','recovery']];h+=row(...treatments[f]);
 for(let i=0;i<5;i++)h+=row('Elevator · Floor '+(i+1),['Emergency / reception','Pharmacy / wards','Surgery / trauma','Diagnostics / lab','Recovery / dispatch'][i],i===f?'CURRENT':'GO TO FLOOR '+(i+1),'floor-'+i,i===f);
 if(f===4)h+=row('Medical transport','Travel to the current chapter mansion.','DISPATCH · $500','medevac');}
 if(['fire','police','gas','hospital','grocery','bank','gym'].includes(id))h+=row('Paid jobs / careers','Clock in for '+({fire:'firefighter',police:'police',gas:'gas station',hospital:'hospital',grocery:'market',bank:'bank',gym:'gym trainer'}[id])+' shifts, build your rank and earn a paycheck.','VIEW JOBS','career');
 if(id==='bank'||id==='gas')h+=row('Mission robbery',mission&&mission.phase==='active'&&mission.info.type==='rob'&&mission.robVenue===v?'This is your mission target. Start the robbery, stay at the counter, then escape to the mansion.':'Robberies unlock when Ronniebaby assigns this location as a mission target.','START ROBBERY','rob',!(mission&&mission.phase==='active'&&mission.info.type==='rob'&&mission.robVenue===v));
 panel.innerHTML='<div class="sbox"><div class="eyebrow">STAFFED INTERIOR · ZOMBIE-FREE</div><h2>'+v.short+'</h2><p class="cash">WALLET '+moneyText(cash)+'</p>'+h+'<button class="close" data-place="close">RETURN TO THE INTERIOR · ESC</button></div>';panel.style.display='flex';
}
function pay(n){if(cash<n){toast('NOT ENOUGH CASH · '+moneyText(n)+' NEEDED');return false;}cash-=n;sfx('cash');return true;}
let drinkT=0,regenT=0;
panel.addEventListener('click',e=>{const b=e.target.closest('[data-place]');if(!b||!active)return;const a=b.dataset.place,v=active;if(a==='career'){close();if(window.level29Jobs)level29Jobs.open(v.id,v);return;}if(a==='close')return close();if(a==='rob'){close();return startRob(v);}
 if(a.startsWith('floor-')){v.floor=+a.split('-')[1];v.furniture=v.floorFurniture[v.floor];player.x=v.b.x+v.b.w/2;player.y=v.b.y+v.b.h-37;player.z=0;close();snapCamera();speak('HOSPITAL ELEVATOR','Floor '+(v.floor+1)+'. '+['Emergency and reception.','Pharmacy and wards.','Surgery and trauma.','Diagnostics and laboratory.','Recovery and medical dispatch.'][v.floor],v.col);return;}
 if(a==='food'&&pay(60))player.hp=Math.min(player.maxHp,player.hp+50);
 if(a==='drink'&&pay(90))drinkT=5400;
 if(a==='deposit'&&pay(1000))saved.bank+=1000;
 if(a==='withdraw'&&saved.bank>=1000){saved.bank-=1000;cash+=1000;sfx('cash');}
 if(a==='repair'){const c=cars.filter(c=>!c.dead&&dist(c.x,c.y,v.doorX,v.doorY)<180).sort((a,b)=>dist(a.x,a.y,v.doorX,v.doorY)-dist(b.x,b.y,v.doorX,v.doorY))[0];if(c&&pay(150)){c.hp=c.maxHp;c.burnT=0;}else if(!c)toast('PARK A VEHICLE OUTSIDE FIRST');}
 if(a==='invest'){if(saved.owned.includes(v.key)){cash+=Math.floor(saved.income);saved.income=0;sfx('cash');}else if(pay(8000))saved.owned.push(v.key);}
 if(a==='cardio'&&saved.cardio<4&&pay(800))saved.cardio++;
 if(a==='conditioning'&&saved.conditioning<4&&pay(1200)){saved.conditioning++;player.maxHp+=25;player.hp=player.maxHp;}
 if(a==='heat'&&pay(750))heat=0;
 if(a==='armor'&&pay(400))player.armor=Math.max(100,player.armor);
 if(a==='cruiser'&&pay(4500)){const c=makeCar(v.doorX,v.doorY+85,0,'police');cars.push(c);}
 if(a==='heal'&&pay(200))player.hp=player.maxHp;
 if(a==='pharmacy'&&pay(300)){player.hp=player.maxHp;regenT=5400;}
 if(a==='surgery'&&player.maxHp<500&&pay(2000)){player.maxHp=Math.min(500,player.maxHp+25);player.hp=player.maxHp;}
 if(a==='lab'&&pay(500)){player.hp=player.maxHp;regenT=7200;}
 if(a==='recovery'&&pay(250)){player.hp=player.maxHp;heat=0;}
 if(a==='medevac'&&pay(500)){v.floor=0;v.furniture=v.floorFurniture[0];const s=city.safe;player.x=s.x;player.y=s.y;player.hp=player.maxHp;close();snapCamera();return;}
 saved.maxHp=player.maxHp;persist();show(v);
});
addEventListener('keydown',e=>{if(panel.style.display!=='none'&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}},true);
const oldService=serviceVenue;serviceVenue=function(){const v=nearStation();if(v){speak(roles[v.id]?roles[v.id][0]:window.level29World.jobs[v.id][0],greetings[v.id]||'Welcome. How can I help?',v.col);if(v.extended){if(player.car)return toast('ENTER ON FOOT TO TALK TO STAFF');return show(v);}}return oldService();};
const touch=document.getElementById('venueAction');if(touch)touch.onclick=()=>serviceVenue();
// Bank / gas jobs appear in each chapter, retaining boss and original mission slots.
const OPS=[
 {t:'Medical Supply Run',stops:['hospital'],hold:200,line:'Grab the supplies from the hospital pharmacy and bring them back to the mansion.',say:'Supplies are bagged. Go, the survivors are waiting.'},
 {t:'Evidence Locker',stops:['police'],hold:260,heat:3,line:'There is a locker full of weapons at the police station. Secure it and get out.',say:'Locker is open. Take the case and leave quietly.'},
 {t:'Fuel Convoy',stops:['gas','grocery'],hold:200,line:'Pick up fuel at the gas station, then food at the market, and deliver both to the mansion.',say:'Loaded up. Keep moving.'},
 {t:'Payroll Courier',stops:['bank','police'],hold:240,heat:2,line:'Collect the payroll at the bank, drop it with the police for escort, then get home.',say:'Payroll received. Do not stop.'},
 {t:'Trauma Team',stops:['gym','hospital'],hold:200,line:'The coach has a wounded runner. Pick up his kit, bring it to the hospital, then get home.',say:'Kit handed over. Good work.'},
 {t:'Market Raid',stops:['grocery'],hold:300,heat:4,line:'The market is overrun outside. Fill the crates and fight your way back.',say:'Crates are full. Hurry.'},
 {t:'Grand Heist',stops:['bank'],hold:420,heat:5,loot:16000,rob:true,line:'The big one. Take the vault at the bank and get to the mansion alive.',say:'Vault is open. Take it all.'},
 {t:'Night Patrol',stops:['police','gas','hospital'],hold:160,heat:2,line:'Three stops across the city: police, fuel, hospital. Collect each package and return.',say:'Package secured. Next stop.'}
];
const OP_SLOTS=[20,21,22,23,25,26,27,28];
const oldInfo=missionInfo;missionInfo=function(i){const v=oldInfo(i);const slot=i%MISSIONS_PER;if(v.isBoss)return v;
 if(slot===3||slot===11||slot===17){v.type='rob';v.robKind=slot===11?'bank':'gas';v.title=v.robKind==='gas'?'Quick Stop Stickup':'Level 29 Vault Run';}
 const k=OP_SLOTS.indexOf(slot);if(k>=0){const op=OPS[(k+v.di)%OPS.length];v.type='op';v.op=op;v.title=op.t;}
 return v;};
const oldBrief=briefing;briefing=function(info){if(info.type==='op')return info.op.line+' Zombies cannot follow you inside, so use the buildings. Do not run out of time.';if(info.type==='rob')return 'We need that money to keep the city alive. Head inside the marked '+(info.robKind==='gas'?'gas station':'bank')+', talk to the attendant, then start the robbery. Stay at the counter until the bag is full. Get back to our guarded mansion before time runs out. No shooting the staff.';return oldBrief(info);};
const oldBegin=beginMission;beginMission=function(){if(mission&&mission.info.type==='op')return beginOp();if(!mission||mission.info.type!=='rob')return oldBegin();const m=mission,v=city.venues.filter(v=>v.id===m.info.robKind).sort((a,b)=>dist(player.x,player.y,a.doorX,a.doorY)-dist(player.x,player.y,b.doorX,b.doorY))[0];m.phase='active';m.robVenue=v;m.timer=60*300;m.step='enter';m.targets=[{x:v.stationX,y:v.stationY}];m.drop={x:city.safe.x,y:city.safe.y};const rp=window.level29Save&&level29Save.resume(m.info.i);if(rp&&rp.kind==='rob'){m.step='escape';robbery={v,t:0,loot:rp.loot,phase:'escape',mission:m};m.timer=60*150;toast('RESUMED WITH THE LOOT · GET TO THE MANSION');}objective='Enter '+v.name+'. Press U at the counter to start the mission robbery.';banner={big:m.info.title.toUpperCase(),small:'MISSION '+(m.info.i+1)+' · ENTER THE MARKED BUSINESS',t:180};speak('RONNIEBABY',briefing(m.info));sfx('missionstart');};
function startRob(v){if(robbery||!mission||mission.info.type!=='rob'||mission.robVenue!==v||mission.phase!=='active')return;if(robCooldown[v.key]>frame){toast('THIS LOCATION IS LOCKED DOWN');return;}
 robbery={v,t:v.id==='bank'?480:240,loot:v.id==='bank'?8500:1800,phase:'take',mission};heat=5;mission.step='take';speak(roles[v.id][0],'The alarm is active. Take the money and leave. Please do not hurt anyone.',v.col);spawnHordeAround(v.doorX,v.doorY+30,8,230,420);sfx('fail');}
const oldTarget=missionTarget;missionTarget=function(){const m=mission;if(m&&m.info.type==='op'&&m.phase==='active')return opTarget(m);if(m&&m.info.type==='rob'&&m.phase==='active'){const t=m.step==='escape'?m.drop:{x:m.robVenue.doorX,y:m.robVenue.doorY};return {...t,col:m.step==='escape'?'#6fd49c':'#e3be68',label:m.step==='escape'?'S':'$'};}return oldTarget();};
const oldMissionUpdate=updateMission;updateMission=function(){const m=mission;if(m&&m.info.type==='op'&&m.phase==='active')return updateOp(m);if(!m||m.info.type!=='rob'||m.phase!=='active')return oldMissionUpdate();if(--m.timer<=0){robbery=null;return failMission('THE ROBBERY CLOCK RAN OUT');}
 if(m.step==='enter')objective='Enter '+m.robVenue.short+'. Press U at the counter, then START ROBBERY.';
 if(m.step==='take'&&robbery){const r=robbery;if(!insideVenue(r.v,player)||dist(player.x,player.y,r.v.stationX,r.v.stationY)>105){objective='Stay near the counter to collect the bag.';return;}if(--r.t<=0){r.phase='escape';m.step='escape';if(window.level29Save)level29Save.partial({idx:m.info.i,kind:'rob',loot:r.loot});objective='Bag secured. Escape to the guarded Level 29 mansion.';speak('RONNIEBABY','You got the bag. Get back to the mansion. Our guards will cover you.');sfx('pickup');}else objective='Collecting cash · '+Math.ceil(r.t/60)+' seconds. Stay at the counter.';}
 if(m.step==='escape'&&robbery){const p=player.car||player;if(dist(p.x,p.y,m.drop.x,m.drop.y)<65){cash+=robbery.loot;robCooldown[robbery.v.key]=frame+3600;robbery=null;heat=0;passMission();}}
};

function beginOp(){const m=mission,op=m.info.op;let at={x:player.x,y:player.y},len=0;const stops=[];
 for(const id of op.stops){const v=city.venues.filter(v=>v.id===id).sort((a,b)=>dist(at.x,at.y,a.doorX,a.doorY)-dist(at.x,at.y,b.doorX,b.doorY))[0];len+=dist(at.x,at.y,v.doorX,v.doorY);at={x:v.doorX,y:v.doorY};stops.push({v,id});}
 const home=city.safe;len+=dist(at.x,at.y,home.x,home.y);m.phase='active';m.opStops=stops;m.si=0;m.holdT=0;m.drop={x:home.x,y:home.y};m.timer=Math.round(len/3.2*1.7)+2400+op.hold*stops.length;m.step='go';m.carry=0;
 const rp=window.level29Save&&level29Save.resume(m.info.i);if(rp&&rp.kind==='op'&&rp.si>0&&rp.si<=stops.length){m.si=rp.si;toast('RESUMED FROM STAGE CHECKPOINT · STOP '+(m.si+1)+' OF '+stops.length);}
 objective=m.si<stops.length?'Go to the '+stops[m.si].v.short+'. Enter and stay at the counter.':'Return to the mansion.';banner={big:op.t.toUpperCase(),small:'MISSION '+(m.info.i+1)+' · '+stops.length+' STOP'+(stops.length>1?'S':'')+' · RETURN TO THE MANSION',t:200};speak('RONNIEBABY',briefing(m.info));sfx('missionstart');if(op.heat)heat=Math.max(heat,op.heat-1);}
function opTarget(m){if(!m.opStops||m.si>=m.opStops.length)return {...m.drop,col:'#6fd49c',label:'S'};const s=m.opStops[m.si],v=s.v,inn=insideVenue(v,player);return inn?{x:v.stationX,y:v.stationY,col:'#e3be68',label:'!'}:{x:v.doorX,y:v.doorY,col:'#e3be68',label:'$'};}
function updateOp(m){const op=m.info.op;if(--m.timer<=0)return failMission('THE CLOCK RAN OUT');
 if(m.si>=m.opStops.length){const p=player.car||player;objective='Return to the mansion with '+(m.opStops.length>1?'the packages':'the package')+'.';if(dist(p.x,p.y,m.drop.x,m.drop.y)<65){cash+=(op.loot||0)+m.opStops.length*600;heat=Math.max(0,heat-2);passMission();}return;}
 const s=m.opStops[m.si],v=s.v;if(!insideVenue(v,player)||dist(player.x,player.y,v.stationX,v.stationY)>105){m.holdT=Math.max(0,m.holdT-2);objective='Stop '+(m.si+1)+' of '+m.opStops.length+': go inside the '+v.short+' and stay at the counter.';return;}
 if(m.holdT===0&&!s.alarm){s.alarm=1;heat=Math.max(heat,op.heat||2);spawnHordeAround(v.doorX,v.doorY+30,4+Math.min(10,Math.round(m.info.di*1.5)+m.si*2),230,430);speak(roles[v.id][0],'Pickup is ready. Stay with me for a moment while it is prepared.',v.col);}
 m.holdT++;objective='Preparing pickup '+Math.max(0,Math.ceil((op.hold-m.holdT)/60))+' s. Stay at the counter.';
 if(m.holdT>=op.hold){speak(roles[v.id][0],op.say,v.col);sfx('pickup');m.si++;m.holdT=0;if(window.level29Save)level29Save.partial({idx:m.info.i,kind:'op',si:m.si});toast(m.si<m.opStops.length?'STOP COMPLETE · NEXT: '+m.opStops[m.si].v.short:'ALL STOPS DONE · GET HOME');}}
const oldNew=newPlayer;newPlayer=function(x,y){let fr=null;const sf=city&&city.safe;if(sf&&sf.front&&x===sf.x&&y===sf.y+30){fr=sf.front;x=fr.x;y=fr.y;}const p=oldNew(x,y);if(fr){p.a=fr.a;p.aim=fr.a;view.yaw=fr.a;view.pitch=0;view.look=0;view.lastPlayer=p;}p.maxHp=Math.max(p.maxHp,saved.maxHp||100);p.hp=p.maxHp;return p;};
// Security is physical: walls stop everyone, the open resident gate stops only zombies.
let currentVenue=null,lastFrame=-1;
const oldUpdate=update;update=function(){const ox=player&&player.x,oy=player&&player.y;oldUpdate();if(!city||!player||state!=='play')return;
 if(drinkT>0)drinkT--;if(regenT>0){regenT--;if(frame%60===0)player.hp=Math.min(player.maxHp,player.hp+4);}
 if(!player.car&&!player.dead&&Number.isFinite(ox)){const boost=saved.cardio*.05+(drinkT>0?.15:0);if(boost)moveCircle(player,(player.x-ox)*boost,(player.y-oy)*boost,player.r);}
 if(saved.owned.length&&frame%60===0){saved.income+=saved.owned.length*220/60;persist();}
 const now=city.penthouse&&city.penthouse.active?null:city.venues.find(v=>insideVenue(v,player));if(now!==currentVenue){if(now)speak(roles[now.id]?roles[now.id][0]:window.level29World.jobs[now.id]?.[0]||'STAFF',greetings[now.id],now.col);currentVenue=now;}
 // Remove any migrated/spawned zombie from protected interiors, without a kill reward.
 for(const z of zombies){if(!z.alive)continue;let protectedArea=false;for(const v of city.venues){if(inside(z.x,z.y,v.b)){protectedArea=true;break;}}if(!protectedArea)for(const sf of city.safes){if(sf.fort&&inside(z.x,z.y,sf.fort)){protectedArea=true;break;}}if(protectedArea){z.alive=false;z.hp=0;z.deathT=60;}}
 if(player.dead&&robbery)robbery=null;
 for(const a of guards){const near=dist(player.x,player.y,a.x,a.y)<850;a.m.visible=near;if(!near)continue;a.cool=Math.max(0,a.cool-1);let target=null,d=310;for(const z of zombies){if(!z.alive)continue;const dd=dist(z.x,z.y,a.x,a.y);if(dd<d){d=dd;target=z;}}let mv=false;if(a.pts){const t=a.pts[a.pi],dx=t[0]-a.x,dy=t[1]-a.y,dd=Math.hypot(dx,dy);if(dd<3)a.pi=(a.pi+1)%a.pts.length;else{a.x+=dx/dd*.55;a.y+=dy/dd*.55;mv=true;if(!target)a.a=Math.atan2(dy,dx);}}
  if(target)a.a=Math.atan2(target.y-a.y,target.x-a.x);else if(!a.pts&&a.z>0)a.a=frame*.007;
  poseFigure(a.m,a.x,a.y,a.a,mv?frame*.18:0,'stand');a.m.position.y=a.z;{const u=a.m.userData;if(u.aim){u.armR.rotation.set(.12,0,1.2);u.armL.rotation.set(-.38,0,1.38);}}if(target&&a.cool===0){a.cool=45;target.hp-=45;target.flash=4;if(target.hp<=0)killZombie(target,Math.cos(a.a)*3,Math.sin(a.a)*3);parts.push({k:'spark',x:a.x,y:a.y,vx:Math.cos(a.a)*2,vy:Math.sin(a.a)*2,t:8});}}
};
const oldRender=render;render=function(){oldRender();if(panel.style.display!=='none'&&state!=='shop')close();const show=state==='talk'&&subtitle;voiceCaption.style.display=show?'block':'none';if(show)voiceCaption.textContent=subtitle.name+' — '+subtitle.txt;};
const oldText=window.render_game_to_text;window.render_game_to_text=()=>{const x=JSON.parse(oldText());x.caption=subtitle&&{name:subtitle.name,text:subtitle.txt};x.hospitalFloor=city?.hospital?.floor+1;x.businesses=city?.venues?.filter(v=>v.extended).map(v=>({type:v.id,x:v.doorX,y:v.doorY,open:v.open}));x.fortressGuards=guards.length;x.robbery=robbery&&{phase:robbery.phase,seconds:Math.ceil(robbery.t/60),loot:robbery.loot};return JSON.stringify(x);};
window.advanceTime=ms=>{for(let i=0;i<Math.min(600,Math.round(ms/16.667));i++)update();render();};
window.level29Places={get saved(){return saved;},get robbery(){return robbery;},get guards(){return guards;},get panel(){return panel;},show,close,speak};
// Initial title backdrop must use the newly reserved blocks too.
travelToMenu();
})();
