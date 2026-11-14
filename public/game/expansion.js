'use strict';
// LEVEL 29 expansion: deterministic 80x80 biomes, enterable venues, detailed vehicles.
// Load LAST, after joy.js. All existing campaign, weapon and multiplayer hooks are preserved.
const VENUE_TYPES = [
  {id:'safe',name:'SAFE HOUSE',short:'SAFE HOUSE',letter:'S',col:'#6ecf96'},
  {id:'garage',name:'GARAGE',short:'GARAGE',letter:'G',col:'#e8bc64'},
  {id:'armory',name:'ARMORY',short:'ARMORY',letter:'A',col:'#e58e72'},
  {id:'spray',name:"BAYOU SHINE AUTO SPA",short:'BAYOU SHINE',letter:'P',col:'#73bddd'},
  {id:'business',name:'BUSINESS',short:'BUSINESS',letter:'B',col:'#bea0dd'}
];
const expansionSaveKey='level29.venues.v1';
let venueSave={owned:[],balance:0,accruedAt:Date.now(),checkpoint:null};
try { const stored=JSON.parse(localStorage.getItem(expansionSaveKey)||'null'); if(stored && Array.isArray(stored.owned)) venueSave=Object.assign(venueSave,stored); } catch(_){}
function saveVenues(){try{localStorage.setItem(expansionSaveKey,JSON.stringify(venueSave));}catch(_){toast('BROWSER STORAGE UNAVAILABLE');}}
function smooth01(t){t=clamp(t,0,1);return t*t*(3-2*t);}
function rawTerrain(id,x,y){
  if(id==='forest') return 7+5*Math.sin(x/290)*Math.cos(y/250)+3*Math.sin((x+y)/170);
  if(id==='mountain')return 0; // Former mountain chapter is level landscaped ground.
  return 0;
}
function generateBiome(di){
  const d=DISTRICTS[di], rng=mkRng(di*977+31), g=new Uint8Array(MW*MH);
  const get=(x,y)=>(x<0||y<0||x>=MW||y>=MH)?T_BLD:g[y*MW+x];
  const set=(x,y,t)=>{if(x>=0&&y>=0&&x<MW&&y<MH)g[y*MW+x]=t;};
  g.fill(d.id==='forest'?T_PARK:T_GRASS);
  // Two connected main routes, plus the scenic loop. Traffic can use existing lane logic.
  for(let y=2;y<78;y++)for(let x=2;x<78;x++){
    if([17,45].some(r=>(x>=r&&x<r+3)||(y>=r&&y<r+3)))set(x,y,T_ROAD);
    const scenic=62 - .48*x + 5*Math.sin(x/8);
    if(x>10&&x<72&&Math.abs(y-scenic)<1.65)set(x,y,T_ROAD);
  }
  // Visible boundary cliffs rather than an endless driveable plane.
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(x<2||y<2||x>=78||y>=78)set(x,y,T_BLD);
  const c={g,get,buildings:[],trees:[],pineTrees:[],rocks:[],parked:[],features:[],safe:null,rng,biome:d.id,venues:[],pads:[],roads:[]};
  // Service camps are level, reachable clearings with access lanes.
  const camps=[{x:5,y:5,id:'safe'},{x:27,y:5,id:'garage'},{x:5,y:28,id:'armory'},{x:27,y:28,id:'spray'},{x:52,y:48,id:'business'}];
  for(const camp of camps){
    const px=camp.x*TILE,py=camp.y*TILE;
    c.pads.push({x:px+128,y:py+128,w:288,h:288,height:rawTerrain(d.id,px+128,py+128)});
    for(let yy=camp.y;yy<camp.y+9;yy++)for(let xx=camp.x;xx<camp.x+9;xx++)set(xx,yy,T_LOT);
    const cy=camp.y+8,joinX=camp.x<17?18:camp.x<45?46:46;
    for(let xx=Math.min(camp.x+4,joinX);xx<=Math.max(camp.x+4,joinX);xx++)for(let k=-1;k<=1;k++)set(xx,cy+k,T_ROAD);
    const b={x:px+32,y:py+32,w:192,h:160,H:23,col:'#7c776d',kind:camp.id==='safe'?'safe':'normal',seed:rng()*1000};
    c.buildings.push(b);
    if(camp.id==='safe')c.safe={x:b.x+b.w/2,y:b.y+b.h+48,B:b};
    const v=createVenue(b,camp.id,di);c.venues.push(v);
    c.features.push({kind:'lot',x:px,y:py,w:288,h:288});
    c.parked.push({x:px+232,y:py+210,a:-Math.PI/2,type:camp.id==='garage'?'sports':'pickup'});
  }
  if(d.id==='forest'){
    c.lake={x:1940,y:1860,r:135};
    for(let yy=0;yy<MH;yy++)for(let xx=0;xx<MW;xx++)if(dist((xx+.5)*TILE,(yy+.5)*TILE,c.lake.x,c.lake.y)<c.lake.r)set(xx,yy,T_WATER);
  }
  // Deterministic vegetation, with a full vehicle-width margin beside the road and camps.
  const clear=(x,y,r)=>{
    const tx=Math.floor(x/TILE),ty=Math.floor(y/TILE);
    for(let yy=ty-1;yy<=ty+1;yy++)for(let xx=tx-1;xx<=tx+1;xx++)if(get(xx,yy)===T_ROAD||get(xx,yy)===T_LOT||get(xx,yy)===T_WATER||get(xx,yy)===T_BLD)return false;
    return c.pads.every(p=>Math.abs(x-p.x)>p.w/2+r+25||Math.abs(y-p.y)>p.h/2+r+25);
  };
  for(let k=0;k<(d.id==='forest'?2600:1350);k++){
    const x=90+rng()*(WORLD-180),y=90+rng()*(WORLD-180);if(!clear(x,y,10))continue;
    const height=rawTerrain(d.id,x,y);
    if(d.id==='mountain'&&height>260)continue;
    if(c.pineTrees.some(t=>dist(x,y,t.x,t.y)<27))continue;
    c.pineTrees.push({x,y,r:6,H:(d.id==='forest'?62:43)+rng()*42,tint:rng()});
  }
  for(let k=0;k<(d.id==='forest'?130:320);k++){
    const x=100+rng()*(WORLD-200),y=100+rng()*(WORLD-200);if(!clear(x,y,18))continue;
    c.rocks.push({x,y,r:8+rng()*(d.id==='forest'?13:23),a:rng()*7});
  }
  // Build the collision/terrain height grid once. Render and physics use the same grid.
  const n=160,field=new Float32Array((n+1)*(n+1));
  for(let j=0;j<=n;j++)for(let i=0;i<=n;i++){
    const x=i*WORLD/n,y=j*WORLD/n;let h=rawTerrain(d.id,x,y);
    if(d.id==='mountain'){
      const lines=[544,1440].map(a=>Math.min(Math.abs(x-(a+48)),Math.abs(y-(a+48))));
      const scenic=Math.abs(y-(62-.48*(x/TILE)+5*Math.sin((x/TILE)/8))*TILE)*.82;
      const rd=Math.min(...lines,scenic),a=1-smooth01((rd-70)/190);h=h*(1-a)+(10+h*.1)*a;
    }
    for(const p of c.pads){const q=Math.max(Math.abs(x-p.x)-p.w/2,Math.abs(y-p.y)-p.h/2);const a=1-smooth01(q/95);h=h*(1-a)+p.height*a;}
    if(c.lake){const a=1-smooth01((dist(x,y,c.lake.x,c.lake.y)-(c.lake.r-15))/45);h=h*(1-a)-3*a;}
    field[j*(n+1)+i]=h;
  }
  c.heightField=field;c.heightN=n;
  c.heightAt=(x,y)=>{
    const fx=clamp(x/WORLD*n,0,n-.0001),fy=clamp(y/WORLD*n,0,n-.0001),ix=Math.floor(fx),iy=Math.floor(fy),u=fx-ix,v=fy-iy,a=iy*(n+1)+ix;
    return field[a]*(1-u)*(1-v)+field[a+1]*u*(1-v)+field[a+n+1]*(1-u)*v+field[a+n+2]*u*v;
  };
  for(let yy=2;yy<78;yy++)for(let xx=2;xx<78;xx++){
    const x=(xx+.5)*TILE,y=(yy+.5)*TILE;
    const slope=Math.hypot((c.heightAt(x+16,y)-c.heightAt(x-16,y))/32,(c.heightAt(x,y+16)-c.heightAt(x,y-16))/32);
    if(slope>.92&&get(xx,yy)!==T_ROAD&&get(xx,yy)!==T_LOT)set(xx,yy,T_BLD);
  }
  c.trees=c.pineTrees;indexTrees(c);return c;
}
function createVenue(b,id,di){
  const spec=VENUE_TYPES.find(t=>t.id===id);b.venue=id;b.H=23;
  const vehicle=id==='garage'||id==='spray';
  return Object.assign({},spec,{b,key:di+':'+id,doorX:b.x+b.w/2,doorY:b.y+b.h,doorW:vehicle?84:Math.min(54,b.w*.4),vehicle,open:false,slide:0,
    stationX:b.x+b.w/2,stationY:b.y+b.h*(vehicle?.61:.35),walls:[],furniture:[],wash:0,cooldown:0});
}
function indexTrees(c){
  c.treeGrid=new Map();
  for(const t of c.trees){const key=Math.floor(t.x/64)+','+Math.floor(t.y/64);if(!c.treeGrid.has(key))c.treeGrid.set(key,[]);c.treeGrid.get(key).push(t);}
}
const _expGenCity=genCity;
genCity=function(di){
  if(di>=5)return generateBiome(di);
  const c=_expGenCity(di);c.venues=[];
  const chosen=[];
  if(c.safe.B)chosen.push(createVenue(c.safe.B,'safe',di));
  for(const id of ['garage','armory','spray','business']){
    const candidates=c.buildings.filter(b=>b.kind==='normal'&&!b.venue&&b.w>=128&&b.h>=128
      &&[T_WALK,T_LOT,T_PLAZA,T_PARK].includes(c.get(Math.floor((b.x+b.w/2)/TILE),Math.floor((b.y+b.h+16)/TILE))));
    candidates.sort((a,b)=>dist(a.x,a.y,c.safe.x,c.safe.y)-dist(b.x,b.y,c.safe.x,c.safe.y));
    const b=candidates[0];if(b)chosen.push(createVenue(b,id,di));
  }
  for(const v of chosen){
    const b=v.b;
    for(let yy=Math.floor(b.y/TILE);yy<Math.ceil((b.y+b.h)/TILE);yy++)for(let xx=Math.floor(b.x/TILE);xx<Math.ceil((b.x+b.w)/TILE);xx++)c.g[yy*MW+xx]=T_LOT;
    c.venues.push(v);
  }
  indexTrees(c);return c;
};
function terrainHeight(x,y){return city&&city.heightAt?city.heightAt(x,y):0;}
const _expTreeHit=treeHit;
treeHit=function(x,y,r){
  if(!city.treeGrid)return _expTreeHit(x,y,r);
  const gx=Math.floor(x/64),gy=Math.floor(y/64),rad=Math.ceil((r+8)/64);
  for(let yy=gy-rad;yy<=gy+rad;yy++)for(let xx=gx-rad;xx<=gx+rad;xx++)for(const t of city.treeGrid.get(xx+','+yy)||[]){if((x-t.x)**2+(y-t.y)**2<(r+5)**2)return true;}
  return false;
};
function hitRect(x,y,r,q){const px=clamp(x,q.x,q.x+q.w),py=clamp(y,q.y,q.y+q.h);return (x-px)**2+(y-py)**2<r*r;}
const _expBlockedCircle=blockedCircle;
blockedCircle=function(x,y,r){
  if(_expBlockedCircle(x,y,r))return true;
  if(!city||!city.venues)return false;
  for(const v of city.venues){
    const b=v.b,th=3;
    if(x+r<b.x||x-r>b.x+b.w||y+r<b.y||y-r>b.y+b.h)continue;
    const walls=[{x:b.x,y:b.y,w:b.w,h:th},{x:b.x,y:b.y,w:th,h:b.h},{x:b.x+b.w-th,y:b.y,w:th,h:b.h},
      {x:b.x,y:b.y+b.h-th,w:(b.w-v.doorW)/2,h:th},{x:v.doorX+v.doorW/2,y:b.y+b.h-th,w:(b.w-v.doorW)/2,h:th}];
    if(!v.open)walls.push({x:v.doorX-v.doorW/2,y:v.doorY-th,w:v.doorW,h:th});
    if(walls.some(q=>hitRect(x,y,r,q))||v.furniture.some(q=>hitRect(x,y,r,q)))return true;
  }
  if(city.rocks&&city.rocks.some(q=>(x-q.x)**2+(y-q.y)**2<(r+q.r*.8)**2))return true;
  return false;
};
// -------- Ground texture and real elevation mesh --------
const _expRenderGround=renderGround;
renderGround=function(){
  _expRenderGround();if(!city.biome)return;
  const g=groundCv.getContext('2d'),rng=mkRng(distIdx*721+91);
  for(let yy=0;yy<MH;yy++)for(let xx=0;xx<MW;xx++){
    const t=city.get(xx,yy);if(t===T_ROAD||t===T_LOT||t===T_WATER)continue;
    const height=terrainHeight((xx+.5)*TILE,(yy+.5)*TILE);
    let col=city.biome==='forest'?'#314733':height>430?'#e6ebec':height>300?'#9aa1a0':height>150?'#767e78':'#65715b';
    g.fillStyle=shade(col,.89+rng()*.2);g.fillRect(xx*TILE,yy*TILE,TILE,TILE);
    for(let k=0;k<13;k++){g.fillStyle=rng()>.5?'rgba(210,207,180,.12)':'rgba(18,27,19,.14)';g.fillRect(xx*TILE+rng()*32,yy*TILE+rng()*32,1+rng()*3,1+rng()*2);}
  }
};
function addPart(group,w,h,d,x,y,z,mat){const m=box(w,h,d,mat);m.position.set(x,y,z);group.add(m);return m;}
function addSign(group,text,w,h,x,y,z,col){
  const cv=document.createElement('canvas');cv.width=1024;cv.height=Math.max(64,Math.round(1024*h/w));const c=cv.getContext('2d');
  c.fillStyle='#172127';c.fillRect(0,0,cv.width,cv.height);c.strokeStyle=col;c.lineWidth=7;c.strokeRect(5,5,cv.width-10,cv.height-10);
  let size=Math.round(cv.height*.62);c.font='800 '+size+"px 'Barlow Condensed', sans-serif";
  while(c.measureText(text).width>cv.width-60&&size>12){size-=2;c.font='800 '+size+"px 'Barlow Condensed', sans-serif";}
  c.textAlign='center';c.textBaseline='middle';c.shadowColor=col;c.shadowBlur=Math.round(size*.18);
  c.fillStyle=col;c.fillText(text,cv.width/2,cv.height/2+2);c.shadowBlur=0;c.fillStyle='rgba(255,255,255,.35)';c.fillText(text,cv.width/2,cv.height/2+2);
  const tex=new THREE.CanvasTexture(cv);tex.anisotropy=8;tex.encoding=THREE.sRGBEncoding;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));m.position.set(x,y,z);m.name='venue-sign:'+text;group.add(m);return m;
}
let sharedVehicleEnv=null,sharedVehicleTarget=null;
function vehicleEnv(){
  if(sharedVehicleEnv)return sharedVehicleEnv;
  const cv=document.createElement('canvas');cv.width=512;cv.height=256;const c=cv.getContext('2d');
  const grad=c.createLinearGradient(0,0,0,256);grad.addColorStop(0,'#cce3ef');grad.addColorStop(.46,'#f9f4df');grad.addColorStop(.52,'#a3b6ae');grad.addColorStop(1,'#26352b');c.fillStyle=grad;c.fillRect(0,0,512,256);
  c.fillStyle='#fff';c.fillRect(70,45,130,16);c.fillRect(310,62,95,12);
  const tex=new THREE.CanvasTexture(cv);tex.mapping=THREE.EquirectangularReflectionMapping;
  const pmrem=new THREE.PMREMGenerator(renderer);sharedVehicleTarget=pmrem.fromEquirectangular(tex);sharedVehicleEnv=sharedVehicleTarget.texture;tex.dispose();pmrem.dispose();return sharedVehicleEnv;
}
function restoreVehicleEnvironment(){const old=sharedVehicleEnv;if(!old)return;sharedVehicleTarget?.dispose();sharedVehicleTarget=null;sharedVehicleEnv=null;const next=vehicleEnv();for(const root of [scene,typeof vmScene!=='undefined'?vmScene:null])root?.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material])if(m?.envMap===old){m.envMap=next;m.needsUpdate=true;}});window.level29Cars?.restoreEnvironment?.(old,next);}
function roundedCarBody(L,H,W,mat){
  const shape=new THREE.Shape(),x=-L/2,y=-W/2,rf=Math.min(W*.34,9),rr=Math.min(W*.2,5),nose=W*.07;
  shape.moveTo(x+rr,y);shape.lineTo(x+L-rf-4,y+nose*.4);shape.quadraticCurveTo(x+L,y+nose,x+L,y+rf+nose);shape.lineTo(x+L,y+W-rf-nose);shape.quadraticCurveTo(x+L,y+W-nose,x+L-rf-4,y+W-nose*.4);
  shape.lineTo(x+rr,y+W);shape.quadraticCurveTo(x,y+W,x,y+W-rr);shape.lineTo(x,y+rr);shape.quadraticCurveTo(x,y,x+rr,y);
  const geo=new THREE.ExtrudeGeometry(shape,{depth:H-2.4,bevelEnabled:true,bevelThickness:1.2,bevelSize:1.2,bevelSegments:4,steps:1,curveSegments:8});geo.rotateX(-Math.PI/2);geo.translate(0,4,0);
  return new THREE.Mesh(geo,mat);
}
// Replace the block-like car with bevelled bodywork, metallic paint, cabin, wheel hubs and trim.
makeCarMesh=function(c){
  const L=c.spec.len,W=c.spec.wid,t=c.type,g=new THREE.Group(),offroad=['pickup','humvee','mtvr'].includes(t),cargo=['truck','mtvr'].includes(t);
  const env=vehicleEnv();
  const paint=new THREE.MeshPhysicalMaterial({color:c.col,metalness:.55,roughness:.24,clearcoat:1,clearcoatRoughness:.14,envMap:env,envMapIntensity:.9});
  const rubber=new THREE.MeshStandardMaterial({color:'#16181a',roughness:.95}),chrome=new THREE.MeshStandardMaterial({color:'#c4cbd0',metalness:.95,roughness:.2,envMap:env});
  const black=new THREE.MeshStandardMaterial({color:'#20252a',roughness:.7}),glass=new THREE.MeshPhysicalMaterial({color:'#354f5c',metalness:.55,roughness:.12,envMap:env,transparent:true,opacity:.7,side:THREE.DoubleSide});
  const H=t==='sports'?5.6:t==='van'?10:offroad?9:7.4,top=4+H,parts=[];
  const body=roundedCarBody(L,H,W,paint);g.add(body);parts.push(body);
  // Lower skirts and bumpers, front grille and license plates.
  addPart(g,L*.95,2,W*.98,0,4,0,black);
  addPart(g,1.5,3,W*.9,L/2+.25,5.5,0,chrome);addPart(g,1.5,3,W*.9,-L/2-.25,5.5,0,chrome);
  addPart(g,.5,3.5,W*.36,L/2+1,top-3,0,black);
  for(let k=-2;k<=2;k++)addPart(g,.6,.35,W*.35,L/2+1.4,top-4+k*.6,0,chrome);
  const plate=new THREE.Mesh(new THREE.PlaneGeometry(6,2),new THREE.MeshBasicMaterial({map:signTex('L29','#ecead9','#172228',128,40)}));plate.rotation.y=-Math.PI/2;plate.position.set(-L/2-1.2,5.8,0);g.add(plate);
  const roofY=top+(cargo?11:t==='van'?13:offroad?8:t==='sports'?4.4:5.6),cabFront=cargo?L*.44:t==='pickup'?L*.27:t==='sports'?L*.08:L*.17,cabRear=cargo?L*.12:t==='pickup'?-L*.04:t==='sports'?-L*.3:-L*.28;
  const bottomFront=cabFront+3,bottomRear=cabRear-3,halfW=W*.4;
  // Cabin's sloped glass panels; +X is front, matching all original physics.
  const panel=(points,mat)=>{const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));geo.setIndex([0,1,2,0,2,3]);geo.computeVertexNormals();const m=new THREE.Mesh(geo,mat);g.add(m);return m;};
  panel([[bottomFront,top,-halfW],[bottomFront,top,halfW],[cabFront,roofY-1,halfW*.95],[cabFront,roofY-1,-halfW*.95]],glass);
  if(!c.spec.open){
    panel([[bottomRear,top,halfW],[bottomRear,top,-halfW],[cabRear,roofY-1,-halfW*.95],[cabRear,roofY-1,halfW*.95]],glass);
    for(const side of [-1,1])panel([[bottomRear,top,side*halfW],[bottomFront,top,side*halfW],[cabFront,roofY-1,side*halfW*.95],[cabRear,roofY-1,side*halfW*.95]],glass);
    parts.push(addPart(g,cabFront-cabRear+1,1.1,W*.8,(cabFront+cabRear)/2,roofY,0,paint));
    const beam=(a,b,r,mat)=>{const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),dv=bv.clone().sub(av);const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,dv.length(),6),mat);mesh.position.copy(av.add(bv).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dv.normalize());g.add(mesh);};
    for(const side of [-1,1]){beam([bottomFront,top,side*halfW],[cabFront,roofY,side*halfW*.95],.65,paint);beam([bottomRear,top,side*halfW],[cabRear,roofY,side*halfW*.95],.75,paint);addPart(g,.8,roofY-top,W*.02,(cabFront+cabRear)/2,(top+roofY)/2,side*halfW,black);}
  }
  // Actual seats and steering wheel are visible through the glass and in the convertible.
  for(const z of [-W*.21,W*.21]){addPart(g,7,2,6,-L*.04,top+.6,z,black);addPart(g,1.6,5,6,-L*.12,top+3,z,black);}
  const steering=new THREE.Mesh(new THREE.TorusGeometry(2.5,.35,6,16),rubber);steering.rotation.y=Math.PI/2;steering.position.set(L*.1,top+3,-W*.2);g.add(steering);
  for(const side of [-1,1]){
    addPart(g,3.5,.5,.7,0,top-2,side*(W/2+1),chrome);
    addPart(g,2.4,1.7,3,cabFront-1,top+2,side*(W/2+1.2),paint);
    addPart(g,L*.56,.28,.35,0,top-4,side*(W/2+1),chrome);
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-L*.1,4,side*(W/2+1.02)),new THREE.Vector3(-L*.1,top-.5,side*(W/2+1.02))]),new THREE.LineBasicMaterial({color:'#333a40'}));g.add(line);
  }
  if(t==='pickup'){
    addPart(g,L*.36,.7,W*.76,-L*.29,top+.3,0,black);
    for(const z of [-W*.45,W*.45])parts.push(addPart(g,L*.39,3,1.3,-L*.29,top+1.5,z,paint));
    parts.push(addPart(g,1.4,3,W*.92,-L/2,top+1.5,0,paint));
    for(let i=0;i<5;i++)addPart(g,L*.3,.3,.3,-L*.29,top+.75,(i-2)*3,chrome);
  }
  if(cargo){
    const cargoMat=t==='truck'?new THREE.MeshStandardMaterial({color:'#dddcd6',roughness:.6}):new THREE.MeshStandardMaterial({color:'#526146',roughness:.8});
    addPart(g,L*.64,t==='truck'?24:16,W*.97,-L*.16,top+(t==='truck'?12:8),0,cargoMat);
    for(const z of [-W/2,W/2])for(let k=0;k<6;k++)addPart(g,1.1,t==='truck'?22:13,.6,-L*.46+k*L*.105,top+(t==='truck'?12:8),z,chrome);
  }
  if(t==='van')addPart(g,L*.48,14,W*.9,-L*.2,top+7,0,paint);
  if(t==='humvee'){
    addPart(g,L*.92,1,W*1.05,0,top*.65,0,black);
    const spare=new THREE.Mesh(new THREE.TorusGeometry(4.5,1.4,8,20),rubber);spare.rotation.y=Math.PI/2;spare.position.set(-L/2-2,top,0);g.add(spare);
  }
  if(t==='sports')addPart(g,3,1,W*.88,-L*.44,top+4,0,black);
  if(t==='taxi')addSign(g,'TAXI',7,2.7,-L*.04,roofY+2,0,'#e5c05a');
  if(c.spec.police){
    const red=addPart(g,3,1.6,W*.34,-L*.05,roofY+1.7,-W*.2,MAT.red.clone()),blue=addPart(g,3,1.6,W*.34,-L*.05,roofY+1.7,W*.2,MAT.blue.clone());g.userData.bar=[red,blue];
    for(const z of [-W/2-1.1,W/2+1.1])addPart(g,L*.55,2,.3,0,top-3,z,black);
  }
  const wheels=[],radius=offroad?5.4:t==='sports'?4.3:4.6;
  for(const wx of cargo?[-L*.32,-L*.06,L*.34]:[-L*.3,L*.3])for(const side of [-1,1]){
    const wheel=new THREE.Group();wheel.position.set(wx,radius,side*(W/2-1.6));g.add(wheel);
    const tire=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,3.4,24),rubber);tire.rotation.x=Math.PI/2;wheel.add(tire);
    const rim=new THREE.Mesh(new THREE.CylinderGeometry(radius*.66,radius*.66,3.5,20),chrome);rim.rotation.x=Math.PI/2;wheel.add(rim);
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(radius*.2,radius*.2,3.7,10),black);hub.rotation.x=Math.PI/2;wheel.add(hub);
    for(let k=0;k<5;k++){const spoke=box(radius*1.15,.55,.5,black);spoke.position.z=side*1.8;spoke.rotation.z=k*Math.PI/5;wheel.add(spoke);}
    wheels.push({mesh:wheel,front:wx>0});
    const arch=new THREE.Mesh(new THREE.TorusGeometry(radius+1.1,.4,6,24,Math.PI),black);arch.position.set(wx,radius,side*(W/2+.6));g.add(arch);
  }
  const tails=[];
  for(const z of [-W*.33,W*.33]){
    addPart(g,.7,2.2,4.5,L/2+1.2,top-2,z,new THREE.MeshBasicMaterial({color:'#fff0ce'}));
    addPart(g,.8,1,2,L/2+1.3,top-4,z,new THREE.MeshBasicMaterial({color:'#e4a552'}));
    tails.push(addPart(g,.7,2.5,4,-L/2-1.1,top-2,z,new THREE.MeshBasicMaterial({color:'#8e2026'})));
  }
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(L+10,W+8),new THREE.MeshBasicMaterial({map:softTex,color:'#050a08',opacity:.6,transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.15;g.add(shadow);
  g.userData={...g.userData,paint,parts,top,dead:false,wheels,tails,col:c.col};scene.add(g);return g;
};
// -------- Build functional interior shells --------
const floorTexCache={};
function venueFloorTex(v){
  const key=v.id+':'+Math.round(v.b.w)+'x'+Math.round(v.b.h);if(floorTexCache[key])return floorTexCache[key];
  const cv=document.createElement('canvas');cv.width=cv.height=128;const g=cv.getContext('2d');
  const pal=v.id==='bank'?['#d9d2c2','#2f3a3f']:v.id==='safe'?['#8b775e','#6f5d48']:v.vehicle?['#6c7172','#5b6061']:['#ece6d6','#b9463c'];
  for(let y=0;y<4;y++)for(let x=0;x<4;x++){g.fillStyle=(x+y)%2?pal[1]:pal[0];g.fillRect(x*32,y*32,32,32);}
  g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=1;for(let i=0;i<=4;i++){g.beginPath();g.moveTo(i*32,0);g.lineTo(i*32,128);g.stroke();g.beginPath();g.moveTo(0,i*32);g.lineTo(128,i*32);g.stroke();}
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(v.b.w/64,v.b.h/64);t.encoding=THREE.sRGBEncoding;return floorTexCache[key]=t;
}
function buildVenue(v){
  const b=v.b,group=new THREE.Group(),height=52,referenceLiquor=window.level29LiquorStore?.matches(v);group.position.y=terrainHeight(b.x+b.w/2,b.y+b.h/2);cityGroup.add(group);v.mesh=group;
  const wall=new THREE.MeshStandardMaterial({color:v.id==='safe'?'#d8cbaa':'#e6dfcf',roughness:.88,emissive:v.id==='safe'?'#4a3f2e':'#4b463c'}),trim=new THREE.MeshStandardMaterial({color:'#3f4b50',metalness:.4,roughness:.55});
  const floorMat=new THREE.MeshStandardMaterial({map:venueFloorTex(v),roughness:.55,metalness:.05,emissive:'#2c2a26'});
  addPart(group,b.w,.6,b.h,b.x+b.w/2,.3,b.y+b.h/2,floorMat);
  const accent=new THREE.MeshStandardMaterial({color:v.col||'#5a6b70',roughness:.6,emissive:v.col||'#333',emissiveIntensity:.18}),base=new THREE.MeshStandardMaterial({color:'#2a2622',roughness:.7});
  addPart(group,b.w-6,14,.6,b.x+b.w/2,7,b.y+3.4,accent);addPart(group,.6,14,b.h-6,b.x+3.4,7,b.y+b.h/2,accent);addPart(group,.6,14,b.h-6,b.x+b.w-3.4,7,b.y+b.h/2,accent);
  addPart(group,b.w-6,2,.8,b.x+b.w/2,1,b.y+3.6,base);addPart(group,.8,2,b.h-6,b.x+3.6,1,b.y+b.h/2,base);addPart(group,.8,2,b.h-6,b.x+b.w-3.6,1,b.y+b.h/2,base);
  const panelMat=new THREE.MeshBasicMaterial({color:'#fff7e2'});
  for(let px=b.x+30;px<b.x+b.w-20;px+=55)for(let pz=b.y+30;pz<b.y+b.h-20;pz+=55)addPart(group,22,.5,8,px,height-.6,pz,panelMat);
  const roof=addPart(group,b.w+6,3,b.h+6,b.x+b.w/2,height+1.5,b.y+b.h/2,trim);v.roof=roof;
  addPart(group,b.w,height,3,b.x+b.w/2,height/2,b.y+1.5,wall);
  addPart(group,3,height,b.h,b.x+1.5,height/2,b.y+b.h/2,wall);addPart(group,3,height,b.h,b.x+b.w-1.5,height/2,b.y+b.h/2,wall);
  const side=(b.w-v.doorW)/2;
  addPart(group,side,height,3,b.x+side/2,height/2,v.doorY-1.5,wall);addPart(group,side,height,3,b.x+b.w-side/2,height/2,v.doorY-1.5,wall);
  addPart(group,v.doorW,10,3,v.doorX,height-5,v.doorY-1.5,wall);
  const doorMat=new THREE.MeshStandardMaterial({color:v.vehicle?'#687c88':'#41665a',metalness:.4,roughness:.5});
  v.door=addPart(group,v.doorW-1,41,1.5,v.doorX,20.5,v.doorY-.8,doorMat);
  if(v.vehicle){for(let k=0;k<8;k++)addPart(v.door,v.doorW-2,.3,.2,0,-18+k*5,1,trim);}else{addPart(v.door,1.5,.6,1.5,v.doorW/2-4,0,1,trim);addPart(v.door,v.doorW*.6,15,.3,0,7,1,new THREE.MeshStandardMaterial({color:'#254039',metalness:.4,roughness:.2}));}
  addSign(group,v.name,Math.min(160,b.w),13,b.x+b.w/2,height+10.5,v.doorY-1,v.col);v.labelH=height+32;
  if(!v.privateResidence)addSign(group,v.vehicle?'DRIVE IN · E OPEN BAY':'WALK IN · AUTO DOOR',Math.min(125,b.w-8),7,v.doorX,46,v.doorY+.3,v.col);
  if(!referenceLiquor&&!['business','armory'].includes(v.id))addSign(group,v.short,Math.min(100,b.w-15),12,b.x+b.w/2,35,b.y+3,v.col);
  for(const z of [b.y+25,b.y+b.h-25]){
    addPart(group,60,1,5,b.x+b.w/2,48,z,new THREE.MeshBasicMaterial({color:'#e8e8cf'}));
    const pool=new THREE.Mesh(new THREE.PlaneGeometry(110,90).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:'#fff1d4',map:softTex,transparent:true,opacity:.12,depthWrite:false}));pool.position.set(b.x+b.w/2,.7,z);group.add(pool);
  }
  const furniture=(x,z,w,h,d,color)=>{const m=addPart(group,w,h,d,x,h/2,z,new THREE.MeshStandardMaterial({color,roughness:.8,emissive:color,emissiveIntensity:.28}));v.furniture.push({x:x-w/2,y:z-d/2,w,h:d});return m;};
  if(referenceLiquor){
    const store=level29LiquorStore.build(THREE,b,0,addSign);group.add(store.root);v.furniture.push(...store.solids);v.referenceLiquor=true;
  }else if(v.id==='garage'){
    furniture(b.x+14,b.y+45,19,10,55,'#c98642');furniture(b.x+b.w-14,b.y+45,19,20,50,'#3f5869');
    for(const x of [b.x+34,b.x+b.w-34])addPart(group,3,34,3,x,17,b.y+55,trim);
    for(const z of [b.y+60,b.y+110])addPart(group,70,.4,1,b.x+b.w/2,1,z,new THREE.MeshBasicMaterial({color:'#e3b950'}));
    addSign(group,'REPAIR · $150',68,9,b.x+b.w/2,21,b.y+3,v.col);
    for(let k=0;k<4;k++){const wheel=new THREE.Mesh(new THREE.TorusGeometry(4,1.5,6,12),MAT.tire);wheel.position.set(b.x+17,13+k*3,b.y+78);wheel.rotation.x=Math.PI/2;group.add(wheel);}
  }else if(v.id==='spray'){
    for(const x of [b.x+24,b.x+b.w-24]){
      addPart(group,3,34,3,x,17,b.y+60,trim);
      const brush=new THREE.Mesh(new THREE.CylinderGeometry(6,6,25,16),new THREE.MeshStandardMaterial({color:'#3a9fab',roughness:.9}));brush.position.set(x,14,b.y+85);group.add(brush);(v.brushes||(v.brushes=[])).push(brush);
      for(let k=0;k<5;k++)addPart(group,17,.5,2,x,4+k*5,b.y+85,new THREE.MeshStandardMaterial({color:'#70c9c6',roughness:1}));
    }
    addPart(group,b.w-45,3,4,b.x+b.w/2,35,b.y+60,trim);
    addSign(group,'WASH + RESPRAY · $250',100,9,b.x+b.w/2,21,b.y+3,v.col);
  }else if(v.id==='armory'){
    if(window.level29ArmoryShowroom)level29ArmoryShowroom.build(v,group);
    addSign(group,'U · WEAPONS / ARMOR',Math.min(48,b.w-76),4,b.x+b.w/2,6,b.y+20,v.col);
  }else if(v.id==='business'){
    furniture(b.x+30,b.y+30,40,9,24,'#805f42');furniture(b.x+b.w-22,b.y+40,25,22,45,'#5a625b');
    addPart(group,14,10,1,b.x+30,18,b.y+32,new THREE.MeshStandardMaterial({color:'#243840',metalness:.2,roughness:.2}));
    furniture(b.x+30,b.y+70,16,9,16,'#3d4548');
    const deskSign=addSign(group,'U · BUSINESS SERVICES',Math.min(65,b.w-20),5,b.x+b.w/2,26,b.y+4,v.col);deskSign.name='business-service-sign';
  }else{
    furniture(b.x+31,b.y+24,47,8,30,'#665d48');addPart(group,43,3,25,b.x+31,9,b.y+24,new THREE.MeshStandardMaterial({color:'#a8b39b',roughness:1}));
    furniture(b.x+b.w-24,b.y+25,30,13,35,'#635b48');furniture(b.x+b.w-25,b.y+76,33,7,37,'#47574b');
    furniture(b.x+27,b.y+72,28,8,22,'#79694e');addPart(group,18,2,12,b.x+27,9,b.y+72,new THREE.MeshStandardMaterial({color:'#bcceac',roughness:.7}));
    addSign(group,'U REST · HEAL · SAVE CHECKPOINT',130,9,b.x+b.w/2,18,b.y+4,v.col);
  }
  // Visible interaction disc remains clear of furniture and off the threshold.
  const pad=new THREE.Mesh(new THREE.RingGeometry(v.vehicle?28:12,v.vehicle?29:13,32).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:v.col,side:THREE.DoubleSide,transparent:true,opacity:.7}));pad.position.set(v.stationX,1,v.stationY);group.add(pad);v.pad=pad;
}
const _expBuildCity=buildCity;
buildCity=function(){
  // Base tree builder is deliberately bypassed for conifer instances.
  const trees=city.trees;if(city.biome)city.trees=[];
  _expBuildCity();city.trees=trees;
  if(city.biome){
    const ground=cityGroup.children[0],n=city.heightN;
    ground.geometry.dispose();const geo=new THREE.PlaneGeometry(WORLD,WORLD,n,n);geo.rotateX(-Math.PI/2);
    const pos=geo.attributes.position;
    for(let i=0;i<pos.count;i++)pos.setY(i,terrainHeight(pos.getX(i)+WORLD/2,pos.getZ(i)+WORLD/2));geo.computeVertexNormals();ground.geometry=geo;ground.rotation.set(0,0,0);
    const sea=cityGroup.children[1];sea.material.color.set(city.biome==='mountain'?'#69746d':'#354f42');sea.position.y=-10;
    // Other static objects (road signs) use the same elevation function.
    for(let i=2;i<cityGroup.children.length;i++){const o=cityGroup.children[i];if(!o.isInstancedMesh)o.position.y+=terrainHeight(o.position.x,o.position.z);}
    const dummy=new THREE.Object3D(),trees=city.pineTrees;
    const trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(1.4,2.3,1,6).translate(0,.5,0),new THREE.MeshStandardMaterial({color:'#65513a',roughness:1}),trees.length);
    const leaves=[0,1,2].map((_,i)=>new THREE.InstancedMesh(new THREE.ConeGeometry(1,1,8).translate(0,.5,0),new THREE.MeshStandardMaterial({color:['#224734','#2e5137','#3f6344'][i],roughness:1}),trees.length));
    trees.forEach((t,i)=>{const h=terrainHeight(t.x,t.y);dummy.position.set(t.x,h,t.y);dummy.scale.set(1,t.H*.7,1);dummy.rotation.set(0,0,0);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);
      leaves.forEach((m,k)=>{dummy.position.set(t.x,h+t.H*(.27+k*.19),t.y);dummy.scale.set(t.H*(.22-k*.035),t.H*(.44-k*.03),t.H*(.22-k*.035));dummy.rotation.y=t.tint*7;dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);m.setColorAt(i,new THREE.Color().setScalar(.78+t.tint*.24));});});
    cityGroup.add(trunks,...leaves);
    const rocks=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),new THREE.MeshStandardMaterial({color:'#808780',roughness:1}),city.rocks.length);
    city.rocks.forEach((r,i)=>{dummy.position.set(r.x,terrainHeight(r.x,r.y)+r.r*.3,r.y);dummy.scale.set(r.r,r.r*.6,r.r*.82);dummy.rotation.set(.2,r.a,.1);dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix);});cityGroup.add(rocks);
    if(city.lake){const lake=new THREE.Mesh(new THREE.CircleGeometry(city.lake.r,64).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:'#477a80',metalness:.35,roughness:.2,transparent:true,opacity:.9}));lake.position.set(city.lake.x,-.8,city.lake.y);cityGroup.add(lake);}
  }
  for(const v of city.venues||[])buildVenue(v);
};
// Existing shop service now lives INSIDE the armory. Exterior fake doors are removed.
const _expBuildWorld=buildWorld;
buildWorld=function(){
  _expBuildWorld();
  const arm=(city.venues||[]).find(v=>v.id==='armory'),spr=(city.venues||[]).find(v=>v.id==='spray');
  world.shops=arm?[{x:arm.stationX,y:arm.stationY,B:arm.b,kind:'gun',venue:arm}]:[];
  world.sprays=spr?[{x:spr.stationX,y:spr.stationY,B:spr.b,venue:spr}]:[];
};
const _expBuildGtaMeshes=buildGtaMeshes;
buildGtaMeshes=function(){
  const shops=world.shops,sprays=world.sprays;world.shops=[];world.sprays=[];_expBuildGtaMeshes();world.shops=shops;world.sprays=sprays;
  for(const o of gtaGroup.children)o.position.y+=terrainHeight(o.position.x,o.position.z);
};
nearShop=function(){return null;}; // Don't auto-open a menu just by entering a room.
updateSpray=function(){}; // Expansion handles the physical wash bay with explicit consent.
const _expExtraBlips=extraBlips;
extraBlips=function(){return _expExtraBlips().filter(p=>p.label!=='$'&&p.label!=='P').concat((city.venues||[]).filter(v=>v.id!=='safe').map(v=>({x:v.doorX,y:v.doorY,col:v.col,label:v.letter})));};
function insideVenue(v,p){return p.x>v.b.x+3&&p.x<v.b.x+v.b.w-3&&p.y>v.b.y+3&&p.y<v.b.y+v.b.h-3;}
function nearDoor(){if(!player||!city.venues)return null;const p=player.car||player;return city.venues.find(v=>dist(p.x,p.y,v.doorX,v.doorY)<(player.car?70:45));}
function nearStation(){if(!player||!city.venues)return null;const p=player.car||player;return city.venues.find(v=>insideVenue(v,p)&&dist(p.x,p.y,v.stationX,v.stationY)<(v.vehicle?57:38));}
function toggleDoor(){
  const v=nearDoor();if(!v)return false;
  const p=player.car||player;
  if(v.open&&Math.abs(p.y-v.doorY)<(player.car?player.car.r+9:15)&&Math.abs(p.x-v.doorX)<v.doorW/2+(player.car?player.car.r:player.r)){toast('CLEAR THE DOORWAY BEFORE CLOSING');return true;}
  // Doors open automatically now, so E only ever opens; closing here locked players out of doorways.
  if(v.open)return false;
  v.open=true;v.autoOpened=true;sfx('door');toast(v.short+' · DOOR OPEN');return true;
}
const _expEnterExit=enterExit;
enterExit=function(){if(toggleDoor())return;_expEnterExit();};
function accrueIncome(){
  const now=Date.now(),elapsed=Math.max(0,Math.min(now-venueSave.accruedAt,30*60*1000));
  venueSave.balance+=elapsed/60000*150*venueSave.owned.length;venueSave.accruedAt=now;
}
function serviceVenue(){
  const v=nearStation();if(!v){toast('STEP INSIDE AND APPROACH THE MARKED STATION');return;}
  if(v.cooldown>0)return;
  const p=player;
  if(v.id==='armory'){if(p.car){toast('ENTER THE ARMORY ON FOOT');return;}openShop();return;}
  if(v.id==='safe'){
    if(p.car){toast('ENTER THE SAFE HOUSE ON FOOT');return;}
    p.hp=p.maxHp;p.armor=Math.max(p.armor,25);p.heat=0;p.overheat=false;heat=0;
    venueSave.checkpoint={district:distIdx,mission:missionIdx,cash,up:{...up},arsenal:{...arsenal},curW,packages:[...packagesFound],jumps:[...jumpsDone],rampages:[...rampagesDone]};
    // Infinity is represented separately because JSON serializes it as null.
    venueSave.checkpoint.arsenal.m240='infinite';saveVenues();v.cooldown=120;sfx('heal');toast('RESTED · HEALTH RESTORED · CHECKPOINT SAVED');refreshResume();return;
  }
  if(v.id==='garage'){
    if(!p.car){toast('DRIVE A CAR INTO THE MARKED REPAIR BAY');return;}
    if(cash<150){toast('GARAGE REPAIR COSTS $150');return;}
    if(Math.abs(p.car.v)>1){toast('STOP YOUR CAR BEFORE REPAIRING');return;}
    cash-=150;p.car.hp=p.car.maxHp;p.car.burnT=0;v.cooldown=120;sfx('cash');toast('CAR REPAIRED · -$150');return;
  }
  if(v.id==='spray'){
    if(!p.car){toast('DRIVE A CAR INSIDE THE CARWASH');return;}
    if(cash<250){toast('WASH + RESPRAY COSTS $250');return;}
    if(Math.abs(p.car.v)>1){toast('STOP YOUR CAR IN THE WASH BAY');return;}
    if(v.wash)return;
    v.wash=180;v.washCar=p.car;cash-=250;sfx('door');toast('WASHING + RESPRAYING · -$250');return;
  }
  if(v.id==='business'){
    if(p.car){toast('ENTER THE BUSINESS OFFICE ON FOOT');return;}
    accrueIncome();
    if(!venueSave.owned.includes(v.key)){
      const cost=window.level29BusinessEconomy.quote(v,venueSave.owned);const bought=window.level29BusinessEconomy.purchase(v,venueSave,cash);if(!bought){toast('BUSINESS PURCHASE COSTS $'+cost.toLocaleString());return;}
      cash=bought.balance;saveVenues();window.level29Save?.save();toast('BUSINESS OWNED · -$'+bought.cost.toLocaleString()+' · EARNS $150 / MINUTE');
    }else{
      const amount=Math.floor(venueSave.balance);if(amount<1){toast('INCOME ACCUMULATING · $150 / MINUTE PER BUSINESS');return;}
      cash+=amount;venueSave.balance-=amount;saveVenues();toast('BUSINESS INCOME COLLECTED · +$'+amount);
    }
    v.cooldown=60;sfx('cash');
  }
}
const interactBtn=document.createElement('button');interactBtn.id='venueAction';interactBtn.textContent='USE';interactBtn.onclick=serviceVenue;const touchGroup=document.querySelector('#touch .group');if(touchGroup)touchGroup.appendChild(interactBtn);
addEventListener('keydown',e=>{if(e.key.toLowerCase()==='u'&&!e.repeat&&state==='play'&&e.target.tagName!=='INPUT'){e.preventDefault();serviceVenue();}});
const _expUpdate=update;
update=function(){
  _expUpdate();if(state!=='play'||!player)return;
  for(const v of city.venues||[]){
    if(v.cooldown)v.cooldown--;
    if(v.wash){
      const c=v.washCar;v.wash--;
      if(c&&!c.dead){c.v=0;c.vs=0;
        if(frame%3===0)parts.push({k:'spark',x:c.x+rnd(-c.spec.len*.4,c.spec.len*.4),y:c.y+rnd(-c.spec.wid*.4,c.spec.wid*.4),vx:rnd(-1,1),vy:rnd(-1,1),t:12});
        if(!v.wash){c.hp=c.maxHp;c.burnT=0;const cols=c.spec.cols.filter(k=>k!==c.col);c.col=cols.length?cols[Math.floor(Math.random()*cols.length)]:'#1e8a8a';heat=0;for(const z of zombies)z.alert=false;sfx('cash');toast('WASHED · REPAIRED · RESPRAYED · HEAT CLEARED');v.cooldown=120;}
      }else v.wash=0;
    }
    // Interiors are safe from random horde spawns, but no remote multiplayer state is modified.
    if(v.id==='safe'&&insideVenue(v,player)){player.inv=Math.max(player.inv,2);zombies=zombies.filter(z=>!insideVenue(v,z));}
  }
  if(frame%600===0){accrueIncome();saveVenues();}
};
const _expSyncCars=syncCars;
syncCars=function(){
  _expSyncCars();
  for(const[c,m]of carMeshes){
    if(!m.visible)continue;
    const h=terrainHeight(c.x,c.y);m.position.y=h+(c.dead?-1:(c.z||0));
    const dx=Math.cos(c.a),dy=Math.sin(c.a),surface=(x,y)=>{const v=terrainHeight(x,y);return Math.abs(v-h)>12?h:v;},pitch=Math.atan2(surface(c.x+dx*12,c.y+dy*12)-surface(c.x-dx*12,c.y-dy*12),24);
    const roll=Math.atan2(surface(c.x-dy*12,c.y+dx*12)-surface(c.x+dy*12,c.y-dx*12),24);
    m.rotation.z+=clamp(pitch,-.5,.5);m.rotation.x+=clamp(roll,-.35,.35);
    for(const wheel of m.userData.wheels||[]){wheel.mesh.rotation.z-=c.v*.023;if(wheel.front)wheel.mesh.rotation.y=clamp(c.vs*.35,-.25,.25);}
    for(const lamp of m.userData.tails||[])lamp.material.color.set((keys[' ']||c.v<-.5)?'#ff3440':'#8e2026');
  }
};
const _expPoseFigure=poseFigure;
poseFigure=function(m,x,y,a,anim,mode){_expPoseFigure(m,x,y,a,anim,mode);m.position.y=terrainHeight(x,y);};
const _expPlaceCamera=placeCamera;
placeCamera=function(){const yaw=_expPlaceCamera();const h=terrainHeight(camera.position.x,camera.position.z);camera.position.y+=h;camera.updateMatrixWorld();return yaw;};
project=function(x,y,h){const v=new THREE.Vector3(x,h+terrainHeight(x,y),y).project(camera);if(v.z>1||v.z< -1)return null;return{x:(v.x+1)/2*SW,y:(1-v.y)/2*SH};};
// Particle arrays and markers are positioned by base code each frame, then offset to the terrain.
const _expSyncDynamic=syncDynamic;
syncDynamic=function(){
  _expSyncDynamic();
  if(city.biome){
    for(const o of [markerMesh,markerRing,safeMarker,bossFx,...boomPool])if(o&&o.visible)o.position.y+=terrainHeight(o.position.x,o.position.z);
    for(const[o,m]of kPool.map)m.position.y+=terrainHeight(o.x,o.y);
    for(const o of [ptsSmall,ptsFire,ptsSmoke,bulletLines]){
      const attr=o.geometry.attributes.position,count=o.geometry.drawRange.count;if(!attr)continue;
      for(let i=0;i<Math.min(attr.count,Number.isFinite(count)?count:attr.count);i++)attr.setY(i,attr.getY(i)+terrainHeight(attr.getX(i),attr.getZ(i)));attr.needsUpdate=true;
    }
  }
  for(const v of city.venues||[]){
    v.slide+=(Number(v.open)-v.slide)*.16;
    // Roll-up: keep the door's top edge under the lintel instead of sliding it through the floors above.
    if(v.door){const s=1-v.slide*.94;v.door.scale.y=s;v.door.position.y=41-20.5*s;}
    if(v.brushes)for(const b of v.brushes)b.rotation.y+=v.wash?.12:.006;
  }
};
const _expSyncLights=syncLights;
syncLights=function(yaw){_expSyncLights(yaw);if(city.biome)for(const o of [flash,flash.target,headL,headL.target,boomLight,muzzleLight])o.position.y+=terrainHeight(o.position.x,o.position.z);};
const _expApplyLightMode=applyLightMode;
applyLightMode=function(){
  _expApplyLightMode();if(!city.biome)return;
  if(!isNight()){
    const dusk=isDusk()||state==='menu';scene.background.set(dusk?'#9baba0':city.biome==='forest'?'#a9c9ba':'#afc7d2');scene.fog.color.copy(scene.background);scene.fog.near=city.biome==='forest'?300:420;scene.fog.far=city.biome==='forest'?1250:1900;hemi.intensity=dusk?.85:1.08;sun.intensity=dusk?.6:1;
    camera.far=2200;camera.updateProjectionMatrix();
  }
};
const _venueRay=new THREE.Raycaster(),_venueTarget=new THREE.Vector3();
function venueLabelVisible(v,top){
  if(typeof cityGroup==='undefined'||!camera)return true;
  _venueTarget.set(v.doorX,top+terrainHeight(v.doorX,v.doorY),v.doorY+4);
  const origin=camera.position,len=origin.distanceTo(_venueTarget);
  _venueRay.set(origin,_venueTarget.clone().sub(origin).normalize());_venueRay.near=4;_venueRay.far=Math.max(0,len-30);_venueRay.camera=camera;
  for(const hit of _venueRay.intersectObject(cityGroup,true)){
    if(hit.object.isSprite)continue;
    let o=hit.object,own=false;while(o){if(o===v.mesh){own=true;break;}o=o.parent;}
    if(own||!hit.object.visible)continue;
    const m=hit.object.material;if(m&&(m.transparent||m.opacity<1))continue;
    return false;
  }
  return true;
}
const _expFpHUD=fpHUD;
fpHUD=function(small){
  _expFpHUD(small);if(!player||!city.venues||state!=='play')return;
  const p=player.car||player;
  const now=performance.now();
  for(const v of city.venues){
    // Up close the 3D roof sign is readable, so the floating name would only cover it.
    const d=dist(p.x,p.y,v.doorX,v.doorY);if(d>1100||d<520)continue;
    const top=v.labelH||82;const pr=project(v.doorX,v.doorY,top);if(!pr||pr.x<50||pr.x>SW-50||pr.y<80||pr.y>SH-100)continue;
    const half=Math.min(80,(v.b?v.b.w:160)/2),pl=project(v.doorX-half,v.doorY,top),pq=project(v.doorX+half,v.doorY,top);
    if(pl&&pq&&Math.hypot(pq.x-pl.x,pq.y-pl.y)>(small?110:150))continue;
    if(!v._visT||now-v._visT>350){v._visT=now+Math.random()*120;v._vis=venueLabelVisible(v,top);}
    if(!v._vis)continue;
    const size=small?11:14,w=v.short.length*size*.62+18;
    cx.fillStyle='rgba(9,16,20,.72)';cx.fillRect(pr.x-w/2,pr.y-3,w,size+8);
    hudText(v.short,pr.x,pr.y,size,v.col,'center','800 ');
  }
  const station=nearStation(),door=nearDoor();let text='';
  if(station)text=station.serviceLabel|| (station.id==='garage'?'U · REPAIR CAR $150':station.id==='spray'?(station.wash?'WASHING + RESPRAYING…':'U · WASH + RESPRAY $250'):station.id==='safe'?'U · REST / SAVE CHECKPOINT':station.id==='armory'?'U · BUY WEAPONS / ARMOR':venueSave.owned.includes(station.key)?'U · COLLECT BUSINESS INCOME':'U · BUY BUSINESS $'+window.level29BusinessEconomy.quote(station,venueSave.owned).toLocaleString());
  else if(door)text='E · '+(door.open?'CLOSE':'OPEN')+' '+door.short;
  if(text){const w=Math.min(SW-24,small?310:400),x=(SW-w)/2,y=SH*(small?.73:.78);cx.fillStyle='rgba(9,18,19,.88)';cx.fillRect(x,y,w,34);hudText(text,SW/2,y+8,small?13:16,station?station.col:door.col,'center','800 ');}
};
// -------- Missing HTML/assets were not part of the upload: launcher is supplied separately. --------
const districtSelect=document.getElementById('district');
if(districtSelect)for(const i of [5,6]){const option=document.createElement('option');option.value=i*MISSIONS_PER;option.textContent=DISTRICTS[i].name+' · 80 × 80';districtSelect.appendChild(option);}
const resumeBtn=document.createElement('button');resumeBtn.id='resume';resumeBtn.textContent='RESUME CHECKPOINT';const menuRow=document.querySelector('#menu .row');if(menuRow)menuRow.appendChild(resumeBtn);
function refreshResume(){resumeBtn.style.display=venueSave.checkpoint?'inline-block':'none';}
refreshResume();
resumeBtn.onclick=()=>{
  const cp=venueSave.checkpoint;if(!cp)return;startGame(cp.mission);cash=Number(cp.cash)||0;Object.assign(up,cp.up||{});
  if(cp.arsenal){arsenal={...cp.arsenal,m240:Infinity};curW=hasW(cp.curW)?cp.curW:'m240';}
  packagesFound=new Set(cp.packages||[]);jumpsDone=new Set(cp.jumps||[]);rampagesDone=new Set(cp.rampages||[]);
  player.x=city.safe.x;player.y=city.safe.y;player.hp=player.maxHp;toast('CHECKPOINT RESUMED · '+D.name);snapCamera();
};
// -------- Car radio: Spotify playlist replaces the old MP3 station --------
const SPOTIFY_PLAYLIST_ID='03UeKWi4XPjVbllCBkJYD5',SPOTIFY_URI='spotify:playlist:'+SPOTIFY_PLAYLIST_ID;
RADIO.splice(0,RADIO.length,['SPOTIFY · LEVEL 29 PLAYLIST','spotify']);radioIdx=0;
const spotifyPanel=document.createElement('div');spotifyPanel.id='spotifyPanel';
spotifyPanel.innerHTML='<div class="spHead"><b>LEVEL 29 · SPOTIFY</b><button id="spotifyToggle" type="button" aria-expanded="true">HIDE PLAYER</button></div><div id="spotifyMount"><div id="spotifyController"></div></div><p style="margin:6px 4px;font:11px/1.4 monospace;color:#d4d8d6">Tap Play if Spotify blocks autoplay. Shuffle is controlled by Spotify.</p>';
const spotifyStyle=document.createElement('style');
spotifyStyle.textContent='#spotifyPanel{position:fixed;right:12px;bottom:12px;width:min(340px,calc(100vw - 24px));z-index:6;display:none;background:rgba(9,15,16,.92);border:1px solid rgba(244,195,85,.7);border-radius:14px;padding:8px;box-shadow:0 8px 30px rgba(0,0,0,.45)}#spotifyPanel .spHead{display:flex;justify-content:space-between;align-items:baseline;font:700 12px "Barlow Condensed",sans-serif;letter-spacing:.08em;color:#f4c355;margin:0 4px 6px}#spotifyPanel .spHead span{color:#9caab2;font-weight:500;letter-spacing:0}#spotifyPanel iframe{border-radius:12px;display:block;width:100%}';
document.head.appendChild(spotifyStyle);document.body.appendChild(spotifyPanel);
const spToggle=document.getElementById('spotifyToggle');
spToggle.style.cssText='background:transparent;color:#f4c355;border:1px solid #817142;padding:5px;cursor:pointer;font:700 10px monospace';
spToggle.onclick=()=>{const m=document.getElementById('spotifyMount'),hide=m.style.display!=='none';m.style.display=hide?'none':'block';spotifyPanel.querySelector('p').style.display=hide?'none':'block';spToggle.textContent=hide?'SHOW PLAYER':'HIDE PLAYER';spToggle.setAttribute('aria-expanded',String(!hide));};
if(window.matchMedia('(max-width:699px)').matches)spToggle.click();
const spMobile=document.createElement('style');
spMobile.textContent='#spotifyPanel{top:210px;bottom:auto}@media(max-width:699px){#spotifyPanel{top:176px;bottom:auto;right:12px;width:min(300px,calc(100vw - 40px));z-index:5}}';
document.head.appendChild(spMobile);
let spotifyCtl=null,spotifyReady=false,spotifyPlaying=false,spotifyFallback=false;
function mountSpotifyFallback(){
  if(spotifyFallback||spotifyCtl)return;spotifyFallback=true;
  const f=document.createElement('iframe');f.setAttribute('data-testid','embed-iframe');f.style.borderRadius='12px';
  f.src='https://open.spotify.com/embed/playlist/'+SPOTIFY_PLAYLIST_ID+'?utm_source=generator&si=e8b13c7099424318';
  f.width='100%';f.height='152';f.frameBorder='0';f.allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';f.loading='lazy';
  document.getElementById('spotifyMount').replaceChildren(f);
}
window.onSpotifyIframeApiReady=IFrameAPI=>{
  if(spotifyFallback)return;
  IFrameAPI.createController(document.getElementById('spotifyController'),{uri:SPOTIFY_URI,width:'100%',height:152},c=>{
    spotifyCtl=c;c.addListener('ready',()=>{spotifyReady=true;if(spotifyWantedNow()){try{c.play();}catch(_){}}});
    c.addListener('playback_update',e=>{spotifyPlaying=!!(e.data&&!e.data.isPaused);});
  });
};
const spotifyScript=document.createElement('script');spotifyScript.src='https://open.spotify.com/embed/iframe-api/v1';spotifyScript.async=true;
spotifyScript.onerror=mountSpotifyFallback;document.head.appendChild(spotifyScript);
setTimeout(()=>{if(!spotifyCtl)mountSpotifyFallback();},6000);
let spotifyWanted=false;
function spotifyWantedNow(){return stage1RadioEnabled&&soundMode===0&&['play','shop'].includes(state)&&player&&(player.car||window.level29CityLife?.inClub)&&!player.dead;}
let stage1RadioEnabled=true;window.level29RadioMenu={show(){mountSpotifyFallback();},setEnabled(v){stage1RadioEnabled=!!v;if(!v&&spotifyCtl)spotifyCtl.pause();}};
const _baseRadio=updateRadio;
updateRadio=function(){
  _baseRadio();
  const want=!!spotifyWantedNow();
  spotifyPanel.style.display=want?'block':'none';
  if(want!==spotifyWanted&&spotifyCtl){try{want?spotifyCtl.play():spotifyCtl.pause();}catch(_){}}
  if(!want&&spotifyWanted&&spotifyFallback){const m=document.getElementById('spotifyMount');if(m)m.innerHTML='';spotifyFallback=false;}
  if(want&&!spotifyWanted&&!spotifyCtl&&!spotifyFallback&&document.getElementById('spotifyMount')&&!document.getElementById('spotifyMount').firstChild)mountSpotifyFallback();
  if(want&&!spotifyWanted)toast('SPOTIFY · LEVEL 29 PLAYLIST');
  spotifyWanted=want;
};
const _expMusicFor=musicFor;
// No title beat, no alternate radio or generated music in a car.
musicFor=function(){if(state==='menu'||(player&&player.car))return null;return _expMusicFor();};
// Game diagnostics for repeatable terrain/interior QA.
window.level29Expansion={
  get terrains(){return DISTRICTS.slice(5).map(d=>({name:d.name,tiles:[MW,MH],worldUnits:[WORLD,WORLD]}));},
  get venues(){return (city.venues||[]).map(v=>({id:v.id,name:v.name,door:{x:v.doorX,y:v.doorY,width:v.doorW,open:v.open},station:{x:v.stationX,y:v.stationY},occupied:player&&insideVenue(v,player.car||player)}));},
  height:terrainHeight,service:serviceVenue,get save(){return venueSave;}
};
// Regenerate the initial district through the expansion hook before the next frame.
if(!window.level29Boot)travelToMenu();
