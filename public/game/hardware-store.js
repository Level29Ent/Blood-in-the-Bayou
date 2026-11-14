'use strict';
(function(){
function matches(v){return !!v.infill&&v.name==='BAYOU HARDWARE';}
function plan(b){const sx=b.w/96,sz=b.h/96,r=(x,y,w,h,kind)=>({x:b.x+x*sx,y:b.y+y*sz,w:w*sx,h:h*sz,kind});
 const racks=[r(4,15,12,58,'hand-tools'),r(80,15,12,58,'power-tools')],checkout=r(60,5,20,10,'checkout'),ladder=r(80,78,11,12,'ladder'),endcap=r(5,79,12,12,'fasteners');
 return {racks,checkout,ladder,endcap,solids:[...racks,checkout,ladder,endcap],entry:{x:b.x+b.w/2,y:b.y+b.h},service:{x:b.x+b.w/2,y:b.y+b.h-24}};
}
function build(T,b,options={}){
 const root=new T.Group();root.name='Bayou Hardware · stocked tool aisles';root.userData.noBatch=true;const p=plan(b),sx=b.w/96,sz=b.h/96,batches=new Map(),textures=[];
 const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.8,...extra});
 function map(kind){const n=128,a=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const noise=((x*17+y*29+x*y*3)%19)-9;let c=kind==='concrete'?159+noise*.65:224+noise*.25;if(kind==='pegboard'&&Math.hypot(x%16-8,y%16-8)<2)c=72;if(kind==='package'){c=235+noise*.2;if(y<23)c=255;if(y>94)c=31;if(y>99&&y<121&&x>26&&x<103)c=225;if(y>35&&y<72&&x>26&&x<103)c=250;}a.set([c,c,c,255],(y*n+x)*4);}const t=new T.DataTexture(a,n,n);t.encoding=T.sRGBEncoding;t.wrapS=t.wrapT=T.RepeatWrapping;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;textures.push(t);return t;}
 const floor=mat('#c2c1b7',{map:map('concrete'),roughness:.9}),peg=mat('#eee9d9',{map:map('pegboard')}),pack=mat('#ffffff',{map:map('package')}),white=mat('#e7e5d9'),orange=mat('#e76622'),steel=mat('#a1a9a8',{metalness:.6,roughness:.4}),dark=mat('#272d2e'),rubber=mat('#1a2225'),wood=mat('#ae8554'),colored=mat('#ffffff'),yellow=mat('#e9b52a'),blue=mat('#287995'),red=mat('#bd3631'),glow=new T.MeshBasicMaterial({color:'#f3faee'});
 floor.map.repeat.set(3,3);peg.map.repeat.set(2,4);
 const cube=new T.BoxGeometry(1,1,1),cylinder=new T.CylinderGeometry(1,1,1,10),dummy=new T.Object3D(),color=new T.Color();
 const emit=(geo,m,w,h,d,x,y,z,tint=null,rz=0,ry=0)=>{if(!batches.has(m))batches.set(m,new Map());const by=batches.get(m);if(!by.has(geo))by.set(geo,[]);by.get(geo).push({w:w*sx,h,d:d*sz,x:b.x+x*sx,y,z:b.y+z*sz,tint,rz,ry});};
 const box=(m,w,h,d,x,y,z,tint)=>emit(cube,m,w,h,d,x,y,z,tint);
 box(floor,96,.8,96,48,.4,48);box(white,96,51,3,48,26,1.5);for(const x of [1.5,94.5])box(white,3,51,96,x,26,48);
 const doorW=options.doorW||38,side=(96-doorW/sx)/2;for(const x of [side/2,96-side/2])box(white,side,51,3,x,26,94.5);box(orange,doorW/sx,8,3,48,47,94.5);
 const roof=new T.Mesh(new T.BoxGeometry(b.w+2,2,b.h+2),white);roof.position.set(b.x+b.w/2,53,b.y+b.h/2);roof.userData.noBatch=true;root.add(roof);
 for(const z of [9,33,57,81]){box(steel,89,.8,.8,48,49,z);for(let i=0;i<6;i++)emit(cube,steel,13,.35,.45,11+i*14,47.3,z,null,i%2?.24:-.24);}
 for(const x of [30,65]){box(steel,1.8,1.2,82,x,49,48);for(const z of [21,53,84]){box(dark,3,.65,19,x,47.5,z);box(glow,2.5,.25,17,x,47,z);}}
 // Warehouse rack frames, actual perforated board, open shelves and boxed stock.
 let products=0,tools=0;const palette=['#f0bc27','#ce3c30','#2a809c','#82a635','#d6b78b'];
 function sidePart(side,m,w,h,d,u,y,depth,tint){box(m,d,h,w,side===0?4+depth:92-depth,y,u,tint);}
 function tool(side,u,y,kind,i){const body=palette[i%palette.length];
  const put=(m,w,h,d,du,dy,dep,tint)=>sidePart(side,m,w,h,d,u+du,y+dy,dep,tint);
  // Product card and hanging peg are visibly behind the modeled tool.
  put(pack,4.9,7,.15,0,0,1.1,body);put(steel,.3,.3,1.3,0,3.7,1.5);put(rubber,1.3,.35,.18,0,2.8,1.3);
  if(kind===0){put(colored,.7,5,.8,0,-.1,2.2,body);put(steel,3,1,.9,.6,2,2.2);put(rubber,.9,2,.9,0,-1.5,2.3);}
  else if(kind===1){put(steel,.8,4,.6,0,-.1,2.3);put(steel,2.6,.5,.6,0,2,2.3);for(const s of [-1,1])put(steel,.55,1.2,.6,s*1.05,2.3,2.3);put(steel,1.8,.5,.6,0,-2,2.3);}
  else if(kind===2){for(const s of [-1,1]){put(colored,.65,3,.6,s*.65,-1,2.3,body);put(steel,.6,2,.6,s*.4,1.3,2.3);}put(steel,1.5,.6,.7,0,.4,2.3);}
  else if(kind===3){put(colored,3.3,3.4,1.4,0,-.4,2.4,body);put(rubber,2,2,.15,0,-.2,3.2);put(steel,2.5,.3,.3,1.4,-1.8,2.4);}
  else{put(steel,.35,4,.35,0,1,2.3);put(colored,1.2,2.7,1,0,-1.4,2.4,body);put(rubber,1,.5,1.1,0,-2.4,2.4);}
  tools++;products++;
 }
 for(const side of [0,1]){
  sidePart(side,peg,58,29,.5,44,23,.5);sidePart(side,wood,58,1,11,44,10.5,6);sidePart(side,dark,58,2,11,44,2,6);
  for(const u of [15.5,44,72.5]){sidePart(side,orange,1,45,1.2,u,23,1);sidePart(side,orange,1,45,1.2,u,23,11.5);}
  for(const y of [3,10,38,45]){sidePart(side,steel,59,.7,12,44,y,6);sidePart(side,orange,59,1,1,44,y,11.7);sidePart(side,white,58,.65,.1,44,y+.2,12.3);
   for(let j=0;j<10;j++){const u=18+j*5.6;sidePart(side,pack,4.6,y>30?5.3:4,y===10?4:7,u,y+(y>30?3:2.3),y===10?4:6,palette[(j+side)%5]);products++;}}
  for(let row=0;row<3;row++)for(let j=0;j<9;j++)tool(side,19+j*6.1,16+row*9,(j+row+side)%5,j+side);
  // Counter-mounted cordless drills: motor housing, chuck, grip and battery pack.
  for(let j=0;j<5;j++){const u=20+j*10.5,m=j%2?red:yellow;sidePart(side,m,4.5,2.5,2.3,u,15.8,9);sidePart(side,steel,1,1.4,1.7,u+2.7,15.8,9);sidePart(side,rubber,1.4,3,1.8,u-1,13.9,9);sidePart(side,m,3,1,2.5,u-1,12.2,9);products++;}
 }
 // Back-wall fastener bins and checkout. The service marker and main aisle remain clear.
 box(peg,45,30,.5,27,23,3.5);for(let row=0;row<3;row++)for(let j=0;j<8;j++){box(pack,4.8,6,.5,8+j*5.2,14+row*8,4,palette[(j+row)%5]);box(steel,1,3,.8,8+j*5.2,13+row*8,4.7);products++;}
 const c=p.checkout,cx=(c.x-b.x+c.w/2)/sx,cz=(c.y-b.y+c.h/2)/sz;
 box(orange,20,11,10,cx,6,cz);box(white,21,1,11,cx,12,cz);box(dark,7,2,5,cx-4,14,cz);box(dark,7,5,.7,cx-4,17,cz);box(glow,5,3,.1,cx-4,17,cz+.4);
 // Workbench endcap with categorized open fastener bins.
 box(wood,12,10,11,11,5.7,84.5);for(let row=0;row<3;row++)for(let j=0;j<3;j++){box(dark,3.3,2.4,2.8,7.4+j*3.6,3+row*2.8,89);box(steel,2,.4,1.5,7.4+j*3.6,3+row*2.8,90);products++;}
 // Orange rolling stock ladder with open treads, top platform and black casters.
 for(const x of [81,90])for(const z of [79,89]){box(orange,.7,38,.7,x,20,z);emit(cylinder,rubber,1,1,1,x,1.1,z,null,Math.PI/2);}
 for(let i=0;i<7;i++)box(steel,9,.6,2.1,85.5,3+i*4.8,89-i*1.25);box(orange,10,1,7,85.5,33,82.5);box(orange,10,1,1,85.5,39,79);for(const x of [81,90])box(orange,.7,7,7,x,36,82);
 // Shared atlas: original orange wayfinding, simple tool silhouettes, shelf labels and prices.
 if(typeof document!=='undefined'){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const ctx=canvas.getContext('2d');
 const labels=['HAND TOOLS','POWER TOOLS','HARDWARE / FASTENERS','BAYOU HARDWARE'];
 labels.forEach((s,i)=>{const y=i*128;ctx.fillStyle='#e36620';ctx.fillRect(0,y,1024,128);ctx.fillStyle='#28302e';ctx.fillRect(0,y+85,1024,43);ctx.fillStyle='#ffffff';ctx.font='bold 42px sans-serif';ctx.textAlign='left';ctx.fillText(String(i+1).padStart(2,'0'),24,y+58);ctx.font='bold 34px sans-serif';ctx.fillText(s,140,y+53,855);ctx.font='22px sans-serif';ctx.fillText(i===3?'TOOLS • SUPPLIES • CHECKOUT / U':'↓  QUALITY TOOLS  /  EVERYDAY VALUE',140,y+115);});
 const atlas=new T.CanvasTexture(canvas);atlas.encoding=T.sRGBEncoding;textures.push(atlas);const signMat=new T.MeshBasicMaterial({map:atlas,side:T.DoubleSide});
 function sign(row,w,h,x,y,z,ry=0){const geo=new T.PlaneGeometry(w*sx,h),uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,(3-row+uv.getY(i))/4);const m=new T.Mesh(geo,signMat);m.position.set(b.x+x*sx,y,b.y+z*sz);m.rotation.y=ry;m.userData.noBatch=true;root.add(m);}
 sign(3,70,9,48,59,97);sign(3,70,9,48,44,4.5);
 for(const [row,z]of [[0,29],[1,61]]){for(const x of [35,61])box(steel,.16,6,.16,x,47,z);sign(row,30,8,48,40,z);}
 sign(2,51,5,44,35,4.7);sign(1,43,5,79,43,44,-Math.PI/2);sign(0,43,5,17,43,44,Math.PI/2);
 }
 for(const [m,geos]of batches)for(const [geo,items]of geos){const inst=new T.InstancedMesh(geo,m,items.length);inst.userData.noBatch=true;items.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.rotation.set(0,v.ry,v.rz);dummy.scale.set(v.w,v.h,v.d);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);if(v.tint)inst.setColorAt(i,color.set(v.tint));});root.add(inst);}
 root.userData.hardware={products,tools};return {root,roof,plan:p,solids:p.solids};
}
const api={matches,plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window==='undefined')return;window.level29HardwareStore=api;if(window.level29HardwareReview)return;
const original=buildVenue;buildVenue=function(v){if(!matches(v))return original.apply(this,arguments);if(v.mesh?.parent===cityGroup)return;
 const store=build(THREE,v.b,{doorW:v.doorW});v.referenceHardware=true;v.mesh=store.root;cityGroup.add(v.mesh);v.mesh.position.y=v.baseY||v.b.baseY||0;v.roof=store.roof;v.furniture=store.solids.slice();v.labelH=76;
 v.door=new THREE.Group();v.mesh.add(v.door);
 const pad=new THREE.Mesh(new THREE.RingGeometry(10,10.5,24).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:'#e9a348',transparent:true,opacity:.65,side:THREE.DoubleSide}));pad.position.set(v.stationX,1,v.stationY);pad.userData.noBatch=true;v.mesh.add(pad);v.pad=pad;
};
})();
