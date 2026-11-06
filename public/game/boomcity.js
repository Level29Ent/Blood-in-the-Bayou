'use strict';
// East coast: the Gulf of America bay (opposite the western bayou), the Natchez steamboat shrimp-trawling job,
// and the BoomCity waterfront casino (slots + blackjack). Load after every other world file.
(function(){
const T=TILE;
const BAY={x0:118,x1:135,y0:54,y1:114};          // tiles turned into open Gulf water
const PLAZA={x0:104,x1:114,y0:76,y1:86};          // waterfront block that hosts BoomCity
const CASINO={x0:105,x1:111,y0:77,y1:82};         // casino footprint (solid)
const PIER={x0:118,x1:120,y0:80,y1:82};
const DOOR={x:(CASINO.x0+CASINO.x1+1)/2*T,y:(CASINO.y1+1)*T+20};
const CAPTAIN={x:119*T,y:81.5*T};
const DOCK={x:123.3*T,y:81.5*T};
const inBay=(x,y)=>x>=BAY.x0*T&&x<(BAY.x1+1)*T&&y>=BAY.y0*T&&y<(BAY.y1+1)*T;
const inPlaza=(x,y)=>x>=PLAZA.x0*T&&x<(PLAZA.x1+1)*T&&y>=PLAZA.y0*T&&y<(PLAZA.y1+1)*T;
const isEastCity=c=>!!(c&&c.world&&(c.coreWidth||c.width)===WORLD_SIZE);

const SAVE_KEY='level29.boomcity.v1';
let save={shifts:0,lbs:0,earned:0,best:{},won:0,lost:0,biggest:0};
try{const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(s&&typeof s==='object')save=Object.assign(save,s);}catch(_){}
const persist=()=>{try{localStorage.setItem(SAVE_KEY,JSON.stringify(save));}catch(_){}};
const money=n=>'$'+Math.floor(n).toLocaleString();
const speak=(name,txt,col)=>{subtitle={name,txt,t:Math.max(240,txt.length*4),col};};

CAR_SPECS.steamboat={name:'NATCHEZ STEAMBOAT',len:130,wid:42,max:4.8,acc:.08,grip:.5,hp:700,cols:['#f4efe2'],boat:true};

// ---------------------------------------------------------------- map
const prevGen=genCity;
genCity=function(di){
  Object.assign(DOOR,{x:(CASINO.x0+CASINO.x1+1)/2*T,y:(CASINO.y1+1)*T+20});Object.assign(CAPTAIN,{x:119*T,y:81.5*T});Object.assign(DOCK,{x:123.3*T,y:81.5*T});Object.assign(PIER,{x0:118,x1:120,y0:80,y1:82});Object.assign(BAY,{x0:118,x1:135,y0:54,y1:114});const c=prevGen(di);if(!isEastCity(c))return c;
  const W=c.width,set=(x,y,t)=>{if(x>=0&&y>=0&&x<W&&y<c.height)c.g[y*W+x]=t;};
  for(let y=BAY.y0;y<=BAY.y1;y++)for(let x=BAY.x0;x<=BAY.x1;x++)set(x,y,T_WATER);
  for(let y=PIER.y0;y<=PIER.y1;y++)for(let x=PIER.x0;x<=PIER.x1;x++)set(x,y,T_BRIDGE);
  for(let y=PLAZA.y0+1;y<PLAZA.y1;y++)for(let x=PLAZA.x0+1;x<PLAZA.x1;x++)set(x,y,T_PLAZA);
  for(let y=CASINO.y0;y<=CASINO.y1;y++)for(let x=CASINO.x0;x<=CASINO.x1;x++)set(x,y,T_BLD);
  const cleared=[{x:BAY.x0*T,y:BAY.y0*T,w:(BAY.x1-BAY.x0+1)*T,h:(BAY.y1-BAY.y0+1)*T},{x:PLAZA.x0*T,y:PLAZA.y0*T,w:(PLAZA.x1-PLAZA.x0+1)*T,h:(PLAZA.y1-PLAZA.y0+1)*T}];
  const hits=(f,m=0)=>cleared.some(r=>f.x<r.x+r.w+m&&f.x+(f.w||0)>r.x-m&&f.y<r.y+r.h+m&&f.y+(f.h||0)>r.y-m);
  c.features=c.features.filter(f=>!(f.kind==='forest'&&hits(f)));
  c.trees=c.trees.filter(t=>!hits({x:t.x,y:t.y},24));
  if(c.pineTrees)c.pineTrees=c.pineTrees.filter(t=>!hits({x:t.x,y:t.y},24));
  if(c.curves)c.curves=c.curves.filter(k=>k.id!=='pine'); // the Pine Trail ran through what is now the bay
  c.parked=c.parked.filter(p=>!hits({x:p.x,y:p.y},40));
  for(const k of c.caches||[])if(hits({x:k.x,y:k.y}))Object.assign(k,{x:110*T,y:85.5*T});
  const h0=c.heightAt;if(typeof h0==='function')c.heightAt=(x,y)=>hits({x,y})?0:h0(x,y);
  if(typeof indexTrees==='function')indexTrees(c);
  c.parked.push({x:DOCK.x,y:DOCK.y,a:Math.PI/2,type:'steamboat'});
  // Reserve the whole pier, not just its posts. Later zoning must not fill it.
  c.natchezParcel={x:PIER.x0*T-8,y:PIER.y0*T-8,w:(PIER.x1-PIER.x0+1)*T+16,h:(PIER.y1-PIER.y0+1)*T+16};
  c.boom=true;return c;
};

const prevStreet=streetAt;
streetAt=function(x,y){if(isEastCity(city)){if(inBay(x,y))return 'GULF OF AMERICA · EAST COAST';if(inPlaza(x,y))return 'BOOMCITY WATERFRONT';}return prevStreet(x,y);};

const prevFullMap=drawFullMap;
drawFullMap=function(){prevFullMap();if(!isEastCity(city))return;
  const S=Math.min(SW,SH)-80,X=(SW-S)/2,Y=(SH-S)/2,sc=S/WORLD;
  const label=(t,x,y,col)=>{cx.font="800 13px 'Barlow Condensed'";cx.textAlign='center';cx.textBaseline='middle';const w=cx.measureText(t).width+10;cx.fillStyle='rgba(8,10,12,.8)';cx.fillRect(X+x*sc-w/2,Y+y*sc-8,w,16);cx.fillStyle=col;cx.fillText(t,X+x*sc,Y+y*sc);};
  label('GULF OF AMERICA',(BAY.x0+BAY.x1)/2*T,(BAY.y0+6)*T,'#bfe6ff');
  label('NATCHEZ DOCK',DOCK.x,DOCK.y+40,'#ffd36b');
  label('BOOMCITY',DOOR.x,DOOR.y-110,'#ff5fa2');
};

// ---------------------------------------------------------------- 3D
const geoBox=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
const basic=c=>new THREE.MeshBasicMaterial({color:c});
function put(g,geo,mat,x,y,z){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);g.add(m);return m;}
function signTex(text,w,h,fg,bg,glow){const cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d');
  g.fillStyle=bg;g.fillRect(0,0,w,h);g.font="900 "+Math.round(h*.64)+"px 'Barlow Condensed', sans-serif";g.textAlign='center';g.textBaseline='middle';
  g.shadowColor=glow;g.shadowBlur=h*.2;g.fillStyle=fg;g.fillText(text,w/2,h/2+2);g.shadowBlur=0;g.strokeStyle=fg;g.lineWidth=4;g.strokeRect(6,6,w-12,h-12);
  const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;return t;}
function signPlane(g,text,w,h,x,y,z,ry,fg,bg,glow){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:signTex(text,1024,Math.max(128,Math.round(1024*h/w)),fg,bg,glow),transparent:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));m.position.set(x,y,z);m.rotation.y=ry||0;g.add(m);return m;}

function buildCasino(){
  if(city.riverboatHub)return new THREE.Group();
  const v=city.casinoVenue,b=v?.frontage?.canonical||v?.b||{x:CASINO.x0*T,y:CASINO.y0*T,w:7*T,h:6*T};
  const g=new THREE.Group(),x0=b.x,z0=b.y,w=b.w,d=b.h,cxp=x0+w/2,czp=z0+d/2,front=z0+d;
  const body=lam('#1b1420'),trim=basic('#f2c14e'),pink=basic('#ff3d8b'),cyan=basic('#3de0ff');
  if(city.casinoVenue)buildVenue(city.casinoVenue);else put(g,geoBox(w,64,d),body,cxp,32,czp);
  put(g,geoBox(w*.46,150,d*.42),lam('#251a2c'),cxp,139,z0+d*.3);
  // Exterior bands are thin perimeter rails, never solid plates through the building.
  function band(width,depth,y,height,material,z){
    for(const side of [-1,1]){
      const a=put(g,geoBox(width,height,1.2),material,cxp,y,z+side*depth/2);
      const b=put(g,geoBox(1.2,height,depth),material,cxp+side*width/2,y,z);
      a.name=b.name='casino-exterior-band';
    }
  }
  band(w+6,d+6,64,2,pink,czp);
  band(w*.46+4,d*.42+4,150,2,cyan,z0+d*.3);
  for(let k=0;k<6;k++)band(w*.46+1,d*.42+1,82+k*11,1.5,k%2?pink:trim,z0+d*.3);
  put(g,geoBox(w,2,2),pink,cxp,48,front+2.5);
  signPlane(g,'BOOMCITY',w*.43,20,cxp,177,z0+d*.51+2,0,'#ffe27a','#1a0f1f','#ff3d8b');
  signPlane(g,'BOOMCITY CASINO',w*.78,12,cxp,57,front+4,0,'#ffffff','#2a0d22','#ff3d8b');
  put(g,geoBox(120,3,40),trim,cxp,45,front+22);put(g,geoBox(118,1,38),basic('#fff3c4'),cxp,43,front+22);
  for(const sx of [-54,54])put(g,new THREE.CylinderGeometry(2.4,2.4,44,10),trim,cxp+sx,22,front+42);
  // Keep the walk-in doorway clear; no second facade panel across it.
  for(const sx of [-1,1])put(g,geoBox(2,64,2),sx<0?cyan:pink,cxp+sx*(w/2-2),32,front+2);
  signPlane(g,'SLOTS · BLACKJACK · 24/7',w*.5,7,cxp,41,front+44,0,'#3de0ff','#120a16','#3de0ff');
  for(const side of [-1,1]){const sideSign=signPlane(g,'BOOMCITY · CASINO',d*.65,14,cxp+side*(w/2+4),30,czp,side*Math.PI/2,'#ffe27a','#21162c','#ff3d8b');sideSign.name='casino-side-sign';}
  if(v?.frontage?.angle){const f=v.frontage,a=f.angle;g.rotation.y=a;g.position.x=f.center.x-Math.cos(a)*f.center.x-Math.sin(a)*f.center.y;g.position.z=f.center.y+Math.sin(a)*f.center.x-Math.cos(a)*f.center.y;}g.position.y=v?.baseY||0;g.name='BoomCity facade';return g;
}
function buildDock(){
  const g=new THREE.Group(),wood=lam('#6d5236');g.name='Natchez pier';
  const width=(PIER.x1-PIER.x0+1)*T,depth=(PIER.y1-PIER.y0+1)*T;
  put(g,geoBox(width,3,depth),wood,(PIER.x0*T)+width/2,.5,(PIER.y0*T)+depth/2);
  for(let x=PIER.x0*T+8;x<(PIER.x1+1)*T;x+=8)put(g,geoBox(.5,.15,depth),lam('#493629'),x,2.1,PIER.y0*T+depth/2);

  for(let x=PIER.x0;x<=PIER.x1+1;x++)for(const y of [PIER.y0,PIER.y1+1])put(g,new THREE.CylinderGeometry(2.6,2.6,16,8),wood,x*T,4,y*T);
  put(g,geoBox(4,30,4),wood,CAPTAIN.x-22,15,CAPTAIN.y-30);
  signPlane(g,'NATCHEZ SHRIMP CO.',80,18,CAPTAIN.x-22,34,CAPTAIN.y-27.5,0,'#ffd36b','#122028','#ffd36b');
  const captain=makeFigure(false);setFigureColors(captain,'#c99b73','#d7d9cf','#263c54');
  poseFigure(captain,CAPTAIN.x,CAPTAIN.y,Math.PI,0,'stand');captain.position.y=2;
  captain.name='Natchez captain';captain.traverse(o=>{o.userData.noBatch=true;});g.add(captain);
  const hat=new THREE.Mesh(new THREE.CylinderGeometry(3.4,3.6,1.3,12),lam('#f4efe2'));hat.position.set(0,21.5,0);captain.add(hat);
  return g;
}
const prevBuild=buildCity;
buildCity=function(){prevBuild();if(!isEastCity(city)||!city.boom||!cityGroup)return;cityGroup.add(buildCasino());cityGroup.add(buildDock());};

const prevMesh=makeCarMesh;
makeCarMesh=function(c){if(c.type!=='steamboat')return prevMesh(c);
  const g=new THREE.Group(),L=c.spec.len,W=c.spec.wid,paint=new THREE.MeshStandardMaterial({color:c.col,roughness:.5});
  const red=lam('#a3261d'),dark=lam('#22282e'),glass=lam('#2a3a46'),gold=lam('#d6b25a');
  put(g,geoBox(L,10,W),paint,0,5,0);put(g,geoBox(L*.2,10,W*.7),paint,L*.55,5,0).rotation.y=0;
  put(g,geoBox(L+1,2,W+1),red,0,10,0);
  put(g,geoBox(L*.72,13,W*.86),paint,-L*.04,17,0);put(g,geoBox(L*.72+.4,4,W*.86+.4),glass,-L*.04,18,0);
  put(g,geoBox(L*.74,1.5,W*.9),red,-L*.04,24,0);
  put(g,geoBox(L*.56,11,W*.72),paint,-L*.08,30,0);put(g,geoBox(L*.56+.4,3.5,W*.72+.4),glass,-L*.08,31,0);
  put(g,geoBox(L*.58,1.5,W*.76),red,-L*.08,36,0);
  put(g,geoBox(16,9,16),paint,L*.18,41,0);put(g,geoBox(16.4,3,16.4),glass,L*.18,42,0);
  for(const z of [-W*.22,W*.22]){put(g,new THREE.CylinderGeometry(3.2,3.2,36,12),dark,L*.3,54,z);put(g,new THREE.CylinderGeometry(5,3.2,4,12),gold,L*.3,73,z);}
  const wheel=new THREE.Group();wheel.position.set(-L/2-8,13,0);g.add(wheel);
  const rim=new THREE.CylinderGeometry(13,13,W*.72,18,1,true);rim.rotateX(Math.PI/2);wheel.add(new THREE.Mesh(rim,new THREE.MeshLambertMaterial({color:0xff0000,side:THREE.DoubleSide})));
  for(let k=0;k<8;k++){const p=new THREE.Mesh(geoBox(2,26,W*.7),new THREE.MeshLambertMaterial({color:0xff0000}));p.rotation.z=k*Math.PI/8;wheel.add(p);}
  for(const s of [1,-1])signPlane(g,'NATCHEZ',L*.42,9,-L*.04,13,s*(W/2+.6),s>0?0:Math.PI,'#1c1c1c','#f4efe2','#f4efe2');
  g.userData={paint,dead:false,col:c.col,top:42,bar:null,wheel};scene.add(g);return g;
};

// ---------------------------------------------------------------- shrimp job
const RANKS=['DECKHAND','TRAWLER HAND','FIRST MATE','CAPTAIN','COMMODORE'],RANK_AT=[0,3,7,12,20];
const CONTRACTS=[
  {id:'day',name:'Day Trawl',pay:2600,perLb:4,mins:5,grounds:3,haul:300,rank:0,storm:false,desc:'Three calm shrimp grounds in the bay. Stop the Natchez inside each marked ring and hold U to haul the net.'},
  {id:'run',name:'Gulf Run',pay:4800,perLb:5,mins:7,grounds:5,haul:330,rank:1,storm:false,desc:'Five grounds spread across the Gulf. A bigger hold, a longer route and a tighter clock.'},
  {id:'storm',name:'Storm Haul',pay:8200,perLb:7,mins:7,grounds:6,haul:360,rank:2,storm:true,desc:'Six grounds in rough seas. Rogue waves knock the boat off course and damage the hull.'},
  {id:'charter',name:'Commodore Charter',pay:13500,perLb:9,mins:9,grounds:8,haul:380,rank:3,storm:true,desc:'Eight grounds in a full Gulf storm. Bring the catch home before the hull gives out.'}];
const rank=()=>{let r=0;for(let i=0;i<RANK_AT.length;i++)if(save.shifts>=RANK_AT[i])r=i;return r;};
let shift=null,haulKey=false,haulTouch=false,marker=null,lastResult=null;
const steamboat=()=>cars.find(c=>c.type==='steamboat'&&!c.dead);
const onBoat=()=>!!(shift&&player&&player.car&&player.car===shift.boat);
function busy(){return !!(window.level29Jobs&&level29Jobs.active)||!!(window.level29Guard&&level29Guard.shift)||mission&&mission.phase==='active';}
function waterClear(x,y,r){for(let a=0;a<Math.PI*2;a+=Math.PI/6)if(tileAt(x+Math.cos(a)*r,y+Math.sin(a)*r)!==T_WATER)return false;return tileAt(x,y)===T_WATER;}
function pickGrounds(n){const out=[];let tries=0;
  while(out.length<n&&tries++<4000){const x=(BAY.x0+3)*T+Math.random()*((BAY.x1-BAY.x0-6)*T),y=(BAY.y0+3)*T+Math.random()*((BAY.y1-BAY.y0-6)*T);
    if(x>WORLD-140||dist(x,y,DOCK.x,DOCK.y)<300||!waterClear(x,y,80))continue;const prev=out[out.length-1]||DOCK;if(dist(x,y,prev.x,prev.y)<280&&tries<3000)continue;out.push({x,y});}
  return out;}
function setMarker(p,col){if(marker){scene.remove(marker);marker=null;}if(!p)return;
  marker=new THREE.Group();const ring=new THREE.Mesh(new THREE.TorusGeometry(120,3,8,48),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.85}));ring.rotation.x=Math.PI/2;ring.position.y=3;marker.add(ring);
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(5,5,260,10,1,true),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.3,side:THREE.DoubleSide}));pole.position.y=130;marker.add(pole);
  const buoy=new THREE.Mesh(new THREE.SphereGeometry(7,12,10),lam('#ff7a2a'));buoy.position.y=4;marker.add(buoy);
  marker.position.set(p.x,0,p.y);marker.userData.ring=ring;scene.add(marker);}
function beginShift(def){if(shift)return;if(busy())return toast('FINISH YOUR CURRENT JOB OR MISSION FIRST');if(rank()<def.rank)return toast('REACH '+RANKS[def.rank]+' TO RUN THIS CONTRACT');
  let b=steamboat();if(!b){b=makeCar(DOCK.x,DOCK.y,Math.PI/2,'steamboat');cars.push(b);}
  if(!b.driven&&dist(b.x,b.y,DOCK.x,DOCK.y)>200){b.x=DOCK.x;b.y=DOCK.y;b.a=Math.PI/2;b.v=b.vs=0;}
  b.hp=b.maxHp;b.burnT=0;
  shift={def,boat:b,t:def.mins*3600,total:def.mins*3600,grounds:pickGrounds(def.grounds),idx:0,lbs:0,prog:0,phase:'board',lastHaul:def.mins*3600,wave:600+Math.random()*600,hold:Math.round(def.haul*(1-.08*rank())),clean:0};
  closePanel();setMarker(DOCK,'#ffd36b');speak('NATCHEZ CAPTAIN','Natchez is fired up. Climb aboard, steam out to the marked grounds and fill the hold.','#ffd36b');sfx('door');}
function endShift(ok,why){const s=shift;if(!s)return;shift=null;setMarker(null);haulKey=haulTouch=false;
  if(!ok){const salvage=Math.floor(s.lbs*s.def.perLb*.25);cash+=salvage;lastResult={ok:false,why,pay:salvage};toast((why||'SHIFT FAILED')+(salvage?' · SALVAGE '+money(salvage):''));return;}
  const f=s.t/s.total,grade=f>.55?'S':f>.35?'A':f>.15?'B':'C',mult={S:1.25,A:1.1,B:1,C:.85}[grade],r=rank();
  const pay=Math.round((s.def.pay*(1+.12*r)+s.lbs*s.def.perLb)*mult);cash+=pay;sfx('cash');
  save.shifts++;save.lbs+=Math.round(s.lbs);save.earned+=pay;const prev=save.best[s.def.id];if(!prev||'SABC'.indexOf(grade)<'SABC'.indexOf(prev))save.best[s.def.id]=grade;persist();
  lastResult={ok:true,grade,pay,lbs:Math.round(s.lbs)};
  banner={big:'CATCH SOLD · '+money(pay),small:'GRADE '+grade+' · '+Math.round(s.lbs).toLocaleString()+' LB OF GULF SHRIMP'+(rank()>r?' · PROMOTED TO '+RANKS[rank()]:''),t:260};}
function tickShift(){const s=shift,b=s.boat;
  if(player.dead){endShift(false,'YOU WENT DOWN · SHIFT LOST');return;}
  if(!b||b.dead||b.hp<=0){endShift(false,'THE NATCHEZ IS WRECKED');return;}
  if(--s.t<=0){endShift(false,'OUT OF TIME · THE CATCH SPOILED');return;}
  if(s.phase==='board'){if(player.car===b){s.phase='ground';setMarker(s.grounds[0],'#ffcf4a');toast('STEAM TO SHRIMP GROUND 1 OF '+s.grounds.length);}return;}
  if(marker&&marker.userData.ring){const k=1+Math.sin(frame*.08)*.04;marker.userData.ring.scale.set(k,k,k);}
  if(s.def.storm&&player.car===b&&s.phase!=='board'&&--s.wave<=0){s.wave=700+Math.random()*700;b.hp-=30+Math.random()*30;b.a+=(Math.random()-.5)*.8;b.v*=.4;shake=Math.max(shake||0,10);toast('ROGUE WAVE · HULL '+Math.max(0,Math.round(b.hp/b.maxHp*100))+'%');}
  if(s.phase==='ground'){const g=s.grounds[s.idx],d=dist(b.x,b.y,g.x,g.y),slow=Math.abs(b.v)<1.6;
    s.at=d<120&&player.car===b;
    if(s.at&&slow&&(haulKey||haulTouch)){s.prog++;if(frame%20===0)parts.push({k:'smoke',x:b.x-Math.cos(b.a)*70,y:b.y-Math.sin(b.a)*70,vx:0,vy:-.2,t:20});}
    else if(s.prog>0&&(!s.at||!slow))s.prog=Math.max(0,s.prog-2);
    if(s.prog>=s.hold){const quick=s.lastHaul-s.t<2400;let lbs=(90+Math.random()*60)*(1+.08*rank());if(quick){lbs*=1.15;s.clean++;}
      s.lbs+=lbs;s.lastHaul=s.t;s.prog=0;s.idx++;sfx('cash');
      if(s.idx>=s.grounds.length){s.phase='return';setMarker(DOCK,'#7dffb0');toast('HOLD FULL · '+Math.round(s.lbs)+' LB · RETURN TO THE NATCHEZ DOCK');}
      else{setMarker(s.grounds[s.idx],'#ffcf4a');toast((quick?'CLEAN HAUL · ':'')+Math.round(lbs)+' LB · GROUND '+(s.idx+1)+' OF '+s.grounds.length);}}
    return;}
  if(s.phase==='return'&&player.car===b&&dist(b.x,b.y,DOCK.x,DOCK.y)<170&&Math.abs(b.v)<1.5)endShift(true);
}

// ---------------------------------------------------------------- casino
const SYMS=[{k:'LEMON',w:30,c:'#f5e663',p:3},{k:'CHERRY',w:25,c:'#ff4d5e',p:5},{k:'BELL',w:18,c:'#f2c14e',p:8},{k:'BAR',w:14,c:'#f3ecdc',p:12},{k:'7',w:9,c:'#ff3d3d',p:25},{k:'BOOM',w:4,c:'#ff3d8b',p:50}];
const BETS=[50,100,500,1000,5000];
let tab='slots',bet=100,reels=['BOOM','7','BOOM'],spinning=null,slotMsg='Line up three of a kind. Cherries always pay.',bj=null,shoe=[],bjMsg='Dealer stands on all 17s. Blackjack pays 3 to 2.';
const pickSym=()=>{let r=Math.random()*100;for(const s of SYMS){if((r-=s.w)<0)return s.k;}return 'LEMON';};
const symOf=k=>SYMS.find(s=>s.k===k);
function slotPayout(r){if(r[0]===r[1]&&r[1]===r[2])return symOf(r[0]).p;const ch=r.filter(k=>k==='CHERRY').length;return ch===2?2:ch===1?1:0;}
function record(stake,ret){const net=ret-stake;if(net>0){save.won+=net;save.biggest=Math.max(save.biggest,net);}else save.lost-=net;persist();}
function spin(){if(spinning)return;if(cash<bet){slotMsg='Not enough cash for that bet.';return render();}
  cash-=bet;sfx('cash');const stake=bet,final=[pickSym(),pickSym(),pickSym()];let n=0;slotMsg='Spinning...';
  spinning=setInterval(()=>{n++;for(let i=0;i<3;i++)if(n<8+i*5)reels[i]=pickSym();else reels[i]=final[i];
    if(n>=18){clearInterval(spinning);spinning=null;settleSpin(final,stake);}render();},70);render();}
function settleSpin(final,stake){reels=final.slice();const m=slotPayout(final),ret=stake*m;if(ret)cash+=ret;record(stake,ret);
  slotMsg=m>=50?'BOOM! JACKPOT · '+money(ret):m>2?'THREE '+final[0]+' · WIN '+money(ret):m===2?'TWO CHERRIES · '+money(ret):m===1?'ONE CHERRY · BET RETURNED':'No win. Spin again?';if(m>2)sfx('cash');}
function freshShoe(){shoe=[];for(let d=0;d<6;d++)for(const s of ['♠','♥','♦','♣'])for(const r of ['A','2','3','4','5','6','7','8','9','10','J','Q','K'])shoe.push({r,s});for(let i=shoe.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shoe[i],shoe[j]]=[shoe[j],shoe[i]];}}
const draw1=()=>{if(shoe.length<52)freshShoe();return shoe.pop();};
function handVal(h){let v=0,a=0;for(const c of h){if(c.r==='A'){a++;v+=11;}else v+=['J','Q','K'].includes(c.r)?10:+c.r;}while(v>21&&a){v-=10;a--;}return v;}
const isBJ=h=>h.length===2&&handVal(h)===21;
function deal(){if(bj&&bj.phase==='player')return;if(cash<bet){bjMsg='Not enough cash for that bet.';return render();}
  cash-=bet;sfx('cash');bj={stake:bet,player:[draw1(),draw1()],dealer:[draw1(),draw1()],phase:'player'};
  if(isBJ(bj.player)||isBJ(bj.dealer))return settleBJ();bjMsg='Hit, stand or double down.';render();}
function hit(){if(!bj||bj.phase!=='player')return;bj.player.push(draw1());const v=handVal(bj.player);if(v>21)return settleBJ();if(v===21)return stand();render();}
function stand(){if(!bj||bj.phase!=='player')return;while(handVal(bj.dealer)<17)bj.dealer.push(draw1());settleBJ();}
function doubleDown(){if(!bj||bj.phase!=='player'||bj.player.length!==2)return;if(cash<bj.stake){bjMsg='Not enough cash to double.';return render();}
  cash-=bj.stake;bj.stake*=2;bj.player.push(draw1());if(handVal(bj.player)>21)return settleBJ();stand();}
function settleBJ(){const p=handVal(bj.player),d=handVal(bj.dealer),pb=isBJ(bj.player),db=isBJ(bj.dealer);let ret=0,msg;
  if(pb&&db){ret=bj.stake;msg='Both blackjack · push.';}else if(pb){ret=bj.stake*2.5;msg='BLACKJACK · WIN '+money(bj.stake*1.5);}else if(db){msg='Dealer blackjack.';}
  else if(p>21)msg='Bust at '+p+'.';else if(d>21){ret=bj.stake*2;msg='Dealer busts · WIN '+money(bj.stake);}else if(p>d){ret=bj.stake*2;msg=p+' beats '+d+' · WIN '+money(bj.stake);}
  else if(p===d){ret=bj.stake;msg='Push at '+p+'.';}else msg='Dealer '+d+' beats '+p+'.';
  if(ret){cash+=ret;sfx('cash');}record(bj.stake,ret);bj.phase='done';bjMsg=msg;render();}

// ---------------------------------------------------------------- panels
const css=document.createElement('style');css.textContent=`
#boomPanel{display:none;position:fixed;inset:0;z-index:45;align-items:center;justify-content:center;padding:14px;box-sizing:border-box;background:rgba(6,3,9,.8);font-family:'Barlow Condensed',sans-serif;color:#f3ecdc}
#boomPanel .bx{width:min(680px,100%);max-height:94vh;overflow:auto;box-sizing:border-box;background:linear-gradient(180deg,#1a1020,#0e0a12);border:1px solid #f2c14e;box-shadow:0 0 0 1px #ff3d8b55,0 24px 90px #000c;padding:20px 22px}
#boomPanel.sea .bx{background:linear-gradient(180deg,#0f1c24,#0a1217);border-color:#ffd36b;box-shadow:0 24px 90px #000c}
#boomPanel .eb{font:600 11px 'IBM Plex Mono',monospace;letter-spacing:.2em;color:#ff5fa2;text-transform:uppercase}
#boomPanel.sea .eb{color:#7fd3ff}
#boomPanel h2{margin:4px 0 2px;font:900 44px/1 'Barlow Condensed',sans-serif;letter-spacing:.02em;color:#f2c14e;text-transform:uppercase}
#boomPanel p{font:400 13px/1.55 'IBM Plex Mono',monospace;color:#cfc6d6;margin:6px 0}
#boomPanel .wal{font:800 24px 'Barlow Condensed',sans-serif;color:#f2c14e;margin:2px 0 12px}
#boomPanel button{font:700 13px 'IBM Plex Mono',monospace;text-transform:uppercase;background:#241a2a;color:#f3ecdc;border:1px solid #4d3d55;padding:10px 14px;cursor:pointer;border-radius:3px;touch-action:manipulation}
#boomPanel.sea button{background:#16262f;border-color:#35505e}
#boomPanel button:hover:not(:disabled){border-color:#f2c14e}
#boomPanel button:disabled{opacity:.35;cursor:not-allowed}
#boomPanel button.on{background:#f2c14e;color:#1a1020;border-color:#f2c14e}
#boomPanel button.big{background:#ff3d8b;border-color:#ff3d8b;color:#fff;font-size:16px;padding:12px 22px}
#boomPanel.sea button.big{background:#ffd36b;border-color:#ffd36b;color:#0e1a20}
#boomPanel .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:10px 0}
#boomPanel .reels{display:flex;gap:10px;justify-content:center;margin:14px 0}
#boomPanel .reel{flex:1;max-width:150px;height:110px;display:flex;align-items:center;justify-content:center;background:#0a070c;border:2px solid #f2c14e;border-radius:6px;font:900 34px 'Barlow Condensed',sans-serif;box-shadow:inset 0 0 22px #000}
#boomPanel .msg{font:800 20px 'Barlow Condensed',sans-serif;color:#3de0ff;text-align:center;min-height:26px;margin:6px 0}
#boomPanel .pay{display:grid;grid-template-columns:repeat(3,1fr);gap:4px 12px;font:500 12px 'IBM Plex Mono',monospace;color:#a89fb0}
#boomPanel .felt{background:radial-gradient(ellipse at center,#14553a,#0b3526);border:2px solid #6b4a1f;border-radius:10px;padding:12px 14px;margin:12px 0}
#boomPanel .lbl{font:700 12px 'IBM Plex Mono',monospace;color:#cfe8d8;letter-spacing:.12em;text-transform:uppercase}
#boomPanel .cards{display:flex;gap:8px;min-height:74px;margin:6px 0 10px;flex-wrap:wrap}
#boomPanel .card{width:50px;height:70px;border-radius:6px;background:#fbf8f0;color:#151515;display:flex;flex-direction:column;align-items:center;justify-content:center;font:800 20px/1 'Barlow Condensed',sans-serif;box-shadow:0 3px 8px #0008}
#boomPanel .card.red{color:#c4162c}#boomPanel .card.back{background:repeating-linear-gradient(45deg,#ff3d8b 0 6px,#8a1846 6px 12px);border:3px solid #fbf8f0}
#boomPanel .job{display:flex;gap:12px;justify-content:space-between;align-items:center;border-top:1px solid #ffffff18;padding:12px 0}
#boomPanel .job b{font:800 22px 'Barlow Condensed',sans-serif;color:#f3ecdc}
#boomPanel .specs{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
#boomPanel .specs span{font:600 11px 'IBM Plex Mono',monospace;background:#ffffff10;border:1px solid #ffffff1c;padding:3px 7px;border-radius:3px;color:#d8e6ec}
#boomPanel .close{width:100%;margin-top:14px}
#boomHaul{display:none;position:fixed;right:18px;bottom:44%;z-index:30;width:104px;height:104px;border-radius:50%;border:3px solid #ffd36b;background:rgba(14,26,32,.82);color:#ffd36b;font:900 16px/1.1 'Barlow Condensed',sans-serif;text-transform:uppercase;touch-action:none;user-select:none;-webkit-user-select:none}
#boomHaul.on{background:#ffd36b;color:#0e1a20}
@media (max-width:520px){#boomPanel h2{font-size:34px}#boomPanel .reel{height:84px;font-size:26px}#boomPanel .job{flex-direction:column;align-items:stretch}}`;
document.head.appendChild(css);
const panel=document.createElement('div');panel.id='boomPanel';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');document.body.appendChild(panel);
let panelKind=null;
function openPanel(kind){panelKind=kind;state='shop';mouse.down=false;for(const k in keys)keys[k]=false;haulKey=false;if(player.car)player.car.v=0;render();panel.style.display='flex';}
function closePanel(){if(!panelKind)return;if(spinning){clearInterval(spinning);spinning=null;}panelKind=null;panel.style.display='none';if(state==='shop')state='play';for(const k in keys)keys[k]=false;mouse.down=false;}
const cardHTML=(c,hide)=>hide?'<div class="card back" aria-label="Hidden card"></div>':'<div class="card'+(c.s==='♥'||c.s==='♦'?' red':'')+'"><span>'+c.r+'</span><span>'+c.s+'</span></div>';
function betRow(lock){return '<div class="row"><span class="lbl" style="color:#a89fb0">BET</span>'+BETS.map(b=>'<button data-b="bet-'+b+'" class="'+(b===bet?'on':'')+'" '+(lock||cash<b?'disabled':'')+'>'+money(b)+'</button>').join('')+'</div>';}
function render(){if(!panelKind)return;let h;
  if(panelKind==='casino'){panel.className='';
    h='<div class="eb">Waterfront casino · Gulf of America</div><h2>BoomCity</h2><p class="wal">WALLET '+money(cash)+'</p>';
    h+='<div class="row" role="tablist"><button role="tab" data-b="tab-slots" class="'+(tab==='slots'?'on':'')+'">Slots</button><button role="tab" data-b="tab-bj" class="'+(tab==='bj'?'on':'')+'">Blackjack</button><button role="tab" data-b="tab-stats" class="'+(tab==='stats'?'on':'')+'">Cashier</button></div>';
    if(tab==='slots'){h+='<div class="reels">'+reels.map(k=>'<div class="reel" style="color:'+symOf(k).c+'">'+k+'</div>').join('')+'</div><div class="msg" aria-live="polite">'+slotMsg+'</div>'+betRow(!!spinning);
      h+='<div class="row" style="justify-content:center"><button class="big" data-b="spin" '+(spinning||cash<bet?'disabled':'')+'>Spin · '+money(bet)+'</button></div>';
      h+='<div class="pay">'+SYMS.slice().reverse().map(s=>'<span><b style="color:'+s.c+'">'+s.k+' x3</b> · '+s.p+'x</span>').join('')+'<span><b style="color:#ff4d5e">2 CHERRY</b> · 2x</span><span><b style="color:#ff4d5e">1 CHERRY</b> · 1x</span></div>';}
    if(tab==='bj'){const live=bj&&bj.phase==='player';
      h+='<div class="felt"><div class="lbl">Dealer'+(bj?' · '+(live?handVal([bj.dealer[0]]):handVal(bj.dealer)):'')+'</div><div class="cards">'+(bj?bj.dealer.map((c,i)=>cardHTML(c,live&&i===1)).join(''):'')+'</div>';
      h+='<div class="lbl">You'+(bj?' · '+handVal(bj.player)+' · STAKE '+money(bj.stake):'')+'</div><div class="cards">'+(bj?bj.player.map(c=>cardHTML(c)).join(''):'')+'</div></div><div class="msg" aria-live="polite">'+bjMsg+'</div>'+betRow(live);
      h+='<div class="row" style="justify-content:center">'+(live?'<button class="big" data-b="hit">Hit</button><button class="big" data-b="stand">Stand</button><button data-b="double" '+(bj.player.length!==2||cash<bj.stake?'disabled':'')+'>Double</button>':'<button class="big" data-b="deal" '+(cash<bet?'disabled':'')+'>Deal · '+money(bet)+'</button>')+'</div>';}
    if(tab==='stats')h+='<p>Total won: <b style="color:#7dffb0">'+money(save.won)+'</b><br>Total lost: <b style="color:#ff7a8a">'+money(save.lost)+'</b><br>Biggest single win: <b style="color:#f2c14e">'+money(save.biggest)+'</b></p><p>All bets use your wallet cash. The house always has a small edge, so play for fun.</p>';
    h+='<button class="close" data-b="close">Leave BoomCity · Esc</button>';}
  else{panel.className='sea';const r=rank();
    h='<div class="eb">Gulf of America · East coast dock</div><h2>Natchez Shrimp Co.</h2><p class="wal">'+RANKS[r]+' · '+save.shifts+' TRIPS · '+save.lbs.toLocaleString()+' LB LANDED</p>';
    h+='<p>Board the Natchez paddle steamer at the pier, steam to each glowing ring, stop inside it and hold U (or the HAUL button on mobile) to bring in the net. Moving too fast drags the net empty. Return to the dock to sell the catch. Quick hauls between grounds add 15% weight.</p>';
    if(r<RANKS.length-1)h+='<p style="color:#7fd3ff">Next rank: '+RANKS[r+1]+' after '+RANK_AT[r+1]+' completed trips. Each rank pays 12% more, adds 8% catch weight and hauls 8% faster.</p>';
    for(const d of CONTRACTS){const lock=r<d.rank,best=save.best[d.id];
      h+='<div class="job"><div><b>'+d.name+'</b><p>'+d.desc+'</p><div class="specs"><span>BASE '+money(d.pay*(1+.12*r))+'</span><span>+'+money(d.perLb)+' / LB</span><span>'+d.mins+' MIN</span><span>'+d.grounds+' GROUNDS</span><span>SEAS: '+(d.storm?'ROUGH':'CALM')+'</span><span>BEST: '+(best||'-')+'</span>'+(lock?'<span style="color:#ffb35a">NEEDS '+RANKS[d.rank]+'</span>':'')+'</div></div>';
      h+='<button class="big" data-b="job-'+d.id+'" '+(lock||shift?'disabled':'')+'>'+(lock?'Locked':'Set sail')+'</button></div>';}
    if(shift)h+='<button data-b="quit" style="width:100%;margin-top:6px">Abandon current trip</button>';
    h+='<button class="close" data-b="close">Back to the pier · Esc</button>';}
  panel.innerHTML='<div class="bx">'+h+'</div>';}
panel.addEventListener('click',e=>{const b=e.target.closest('[data-b]');if(!b||b.disabled)return;const a=b.dataset.b;
  if(a==='close')return closePanel();
  if(a.startsWith('tab-')){tab=a.slice(4);return render();}
  if(a.startsWith('bet-')){bet=+a.slice(4);return render();}
  if(a==='spin')return spin();if(a==='deal')return deal();if(a==='hit')return hit();if(a==='stand')return stand();if(a==='double')return doubleDown();
  if(a==='quit'){endShift(false,'TRIP ABANDONED');return render();}
  if(a.startsWith('job-')){const d=CONTRACTS.find(c=>c.id===a.slice(4));if(d)beginShift(d);}
});
panel.addEventListener('pointerdown',e=>e.stopPropagation());

// ---------------------------------------------------------------- input
const nearDoor=()=>isEastCity(city)&&city.boom&&player&&!player.car&&dist(player.x,player.y,DOOR.x,DOOR.y)<80;
const nearCaptain=()=>isEastCity(city)&&city.boom&&player&&!player.car&&dist(player.x,player.y,CAPTAIN.x,CAPTAIN.y)<90;
function useAction(){if(nearDoor()){toast('WALK INSIDE · APPROACH A SLOT OR TABLE');return true;}if(nearCaptain()){openPanel('shrimp');return true;}return false;}
addEventListener('keydown',e=>{if(e.target&&e.target.matches&&e.target.matches('input,textarea,select'))return;const k=e.key.toLowerCase();
  if(panelKind&&(k==='escape'||k==='o')){e.preventDefault();e.stopImmediatePropagation();closePanel();return;}
  if(panelKind){if(k!=='tab')e.stopImmediatePropagation();return;}
  if(k!=='u'||state!=='play')return;
  if(window.level29CityStories?.ownsUse())return;
  if(onBoat()){e.preventDefault();e.stopImmediatePropagation();haulKey=true;return;}
  if(!e.repeat&&useAction()){e.preventDefault();e.stopImmediatePropagation();}
},true);
addEventListener('keyup',e=>{if(e.key.toLowerCase()==='u')haulKey=false;});
addEventListener('blur',()=>{haulKey=haulTouch=false;});
const useBtn=document.getElementById('venueAction');
if(useBtn){const prev=useBtn.onclick;useBtn.onclick=e=>{if(state==='play'&&useAction())return;if(prev)prev.call(useBtn,e);};}
const haulBtn=document.createElement('button');haulBtn.id='boomHaul';haulBtn.type='button';haulBtn.textContent='HOLD · HAUL NET';haulBtn.setAttribute('aria-label','Hold to haul the shrimp net');document.body.appendChild(haulBtn);
const haulOn=e=>{e.preventDefault();e.stopPropagation();haulTouch=true;haulBtn.classList.add('on');},haulOff=e=>{if(e)e.stopPropagation();haulTouch=false;haulBtn.classList.remove('on');};
haulBtn.addEventListener('pointerdown',haulOn);for(const ev of ['pointerup','pointercancel','pointerleave'])haulBtn.addEventListener(ev,haulOff);
haulBtn.addEventListener('mousedown',e=>e.stopPropagation());haulBtn.addEventListener('touchstart',e=>e.stopPropagation(),{passive:true});

// Board the Natchez from anywhere on the pier, not only right beside the hull.
const prevEnter=enterExit;
enterExit=function(){if(player&&!player.car&&state==='play'){const b=steamboat();if(b&&!b.burnT&&dist(player.x,player.y,b.x,b.y)<130){player.car=b;b.driven=true;b.ai=null;sfx('door');vehShow={txt:b.spec.name,t:160};return;}}prevEnter();};

// ---------------------------------------------------------------- frame + HUD
const prevUpdate=update;
update=function(){prevUpdate();if(!player||!isEastCity(city))return;
  if(shift&&state==='play')tickShift();
  const b=cars.find(c=>c.type==='steamboat');if(b){const m=carMeshes.get(b);if(m&&m.userData.wheel)m.userData.wheel.rotation.z-=(b.v||0)*.05;
    if(b.driven&&frame%9===0&&Math.abs(b.v)>.4)for(const s of [-1,1])parts.push({k:'smoke',x:b.x+Math.cos(b.a)*39+Math.cos(b.a+Math.PI/2)*9*s,y:b.y+Math.sin(b.a)*39+Math.sin(b.a+Math.PI/2)*9*s,vx:(Math.random()-.5)*.3,vy:-.4,t:40});}
  const showHaul=!!(shift&&shift.phase==='ground'&&shift.at&&state==='play');haulBtn.style.display=showHaul?'block':'none';if(!showHaul&&haulTouch)haulOff();
  if(useBtn){const t=nearDoor()?'CASINO':nearCaptain()?'JOBS':'USE';if(useBtn.textContent!==t&&(t!=='USE'||useBtn.dataset.boom)){useBtn.textContent=t;useBtn.dataset.boom=t==='USE'?'':'1';}}
};
const compass=a=>['E','SE','S','SW','W','NW','N','NE'][Math.round(((a%(Math.PI*2))+Math.PI*2)%(Math.PI*2)/(Math.PI/4))%8];
const prevHUD=drawHUD;
drawHUD=function(){prevHUD();if(!player||state==='menu'||!isEastCity(city))return;
  if(state==='play'&&!shift){if(nearDoor())hudText('BOOMCITY CASINO · PRESS U OR TAP CASINO',SW/2,SH-140,20,'#ff7ab4','center');
    else if(nearCaptain())hudText('NATCHEZ SHRIMP CO. · PRESS U OR TAP JOBS',SW/2,SH-140,20,'#ffd36b','center');}
  if(!shift)return;const s=shift,b=s.boat,tgt=s.phase==='board'?b:s.phase==='ground'?s.grounds[s.idx]:DOCK,from=player.car||player;
  const d=tgt?dist(from.x,from.y,tgt.x,tgt.y):0,dir=tgt?compass(Math.atan2(tgt.y-from.y,tgt.x-from.x)):'';
  const W=Math.min(460,SW-24),X=SW/2-W/2,Y=Math.max(70,SH*.11);
  cx.fillStyle='rgba(10,20,26,.82)';cx.fillRect(X,Y,W,s.phase==='ground'?86:66);cx.fillStyle='#ffd36b';cx.fillRect(X,Y,4,s.phase==='ground'?86:66);
  const sec=Math.ceil(s.t/60);hudText('NATCHEZ · '+s.def.name.toUpperCase()+' · '+Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0'),X+14,Y+8,18,'#ffd36b');
  const line=s.phase==='board'?'BOARD THE NATCHEZ AT THE PIER · E':s.phase==='ground'?(s.at?(Math.abs(b.v)<1.6?'HOLD U / HAUL NET TO BRING IT IN':'SLOW DOWN · THE NET IS DRAGGING'):'GROUND '+(s.idx+1)+' OF '+s.grounds.length+' · '+dir+' '+Math.round(d/10)+' M'):'RETURN TO THE DOCK · '+dir+' '+Math.round(d/10)+' M';
  hudText(line,X+14,Y+30,16,'#eaf4f8');hudText(Math.round(s.lbs)+' LB IN THE HOLD · HULL '+Math.max(0,Math.round(b.hp/b.maxHp*100))+'%',X+14,Y+48,14,'#9fc6d6');
  if(s.phase==='ground'){cx.fillStyle='#22343d';cx.fillRect(X+14,Y+68,W-28,8);cx.fillStyle='#7dffb0';cx.fillRect(X+14,Y+68,(W-28)*Math.min(1,s.prog/s.hold),8);}
};
const prevText=window.render_game_to_text;
window.render_game_to_text=()=>{const x=JSON.parse(prevText?prevText():'{}');x.shrimp=shift&&{contract:shift.def.id,phase:shift.phase,ground:shift.idx,lbs:Math.round(shift.lbs),seconds:Math.ceil(shift.t/60)};x.boomPanel=panelKind;return JSON.stringify(x);};
window.boomCity={DOOR,CAPTAIN,DOCK,BAY,PIER,CONTRACTS,get shift(){return shift;},get save(){return save;},get lastResult(){return lastResult;},openPanel,closePanel,beginShift,endShift,slotPayout};
})();
