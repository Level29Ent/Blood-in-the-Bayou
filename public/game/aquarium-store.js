'use strict';
(function(){
function plan(b,dir=1){const flip=r=>dir===-1?{...r,x:b.x+b.w-(r.x-b.x)-r.w,y:b.y+b.h-(r.y-b.y)-r.h}:r,point=p=>dir===-1?{x:b.x+b.w-(p.x-b.x),y:b.y+b.h-(p.y-b.y)}:p;
 const wall=[{x:b.x+3,y:b.y+3,w:b.w-6,h:8,kind:'tank-bank'},...[3,b.w-11].map(x=>({x:b.x+x,y:b.y+12,w:8,h:b.h-28,kind:'tank-bank'}))];
 const islands=b.w>=92?[22,b.w-22].map((x,i)=>({x:b.x+x-9,y:b.y+32,w:18,h:16,kind:i?'planted-tank':'reef-tank'})):[];
 const stock=[3,b.w-19].map(x=>({x:b.x+x,y:b.y+b.h-15,w:16,h:8,kind:'fish-care'}));
 return {wall:wall.map(flip),islands:islands.map(flip),stock:stock.map(flip),solids:[...wall,...islands,...stock].map(flip),entry:point({x:b.x+b.w/2,y:b.y+b.h}),service:point({x:b.x+b.w/2,y:b.y+b.h-20})};}
function build(T,b,{base=0,dir=1}={}){
 const root=new T.Group();root.name='Aquarium Store · blue tank gallery';root.position.y=base;root.userData.noBatch=true;const p=plan(b),batches=new Map(),textures=[];
 const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.75,...extra});
 function texture(kind){const n=128,data=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const noise=((x*17+y*23+x*y)%17)-8;let c=kind==='floor'?216+noise:235+noise*.3;if(kind==='floor'&&(x<2||y<2))c=175;if(kind==='label'&&(y===83||y===91||y===99)&&x>23&&x<106)c=65;if(kind==='wood')c=216+noise+Math.sin(x*.34+Math.sin(y*.08))*16;data.set([c,c,c,255],(y*n+x)*4);}const t=new T.DataTexture(data,n,n);t.encoding=T.sRGBEncoding;t.wrapS=t.wrapT=T.RepeatWrapping;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;textures.push(t);return t;}
 const white=mat('#e8e9e2'),black=mat('#19242a'),silver=mat('#9cabad',{metalness:.55,roughness:.35}),wood=mat('#655344',{map:texture('wood')}),floor=mat('#ccc8b7',{map:texture('floor'),roughness:.65}),sand=mat('#cfc8a6'),rock=mat('#687b80'),leaf=mat('#ffffff'),goods=mat('#ffffff',{map:texture('label')}),coral=mat('#ffffff'),fishMat=mat('#ffffff',{roughness:.45}),eye=new T.MeshBasicMaterial({color:'#101b22'}),blue=new T.MeshBasicMaterial({color:'#07579d'}),glow=new T.MeshBasicMaterial({color:'#66bdf4'}),lamp=new T.MeshBasicMaterial({color:'#f3fcff'}),glass=mat('#b8e5eb',{transparent:true,opacity:.12,depthWrite:false,roughness:.1}),water=new T.MeshBasicMaterial({color:'#4fabe1',transparent:true,opacity:.12,depthWrite:false,side:T.DoubleSide});floor.map.repeat.set(b.w/16,b.h/16);
 const cube=new T.BoxGeometry(),sphere=new T.SphereGeometry(1,8,6),cylinder=new T.CylinderGeometry(1,1,1,8),cone=new T.ConeGeometry(1,1,3),dummy=new T.Object3D(),color=new T.Color();
 function emit(geo,m,w,h,d,x,y,z,tint=null,rx=0,ry=0,rz=0){if(!batches.has(m))batches.set(m,new Map());const by=batches.get(m);if(!by.has(geo))by.set(geo,[]);by.get(geo).push({w,h,d,x,y,z,tint,rx,ry,rz});}
 const box=(m,w,h,d,x,y,z,tint)=>emit(cube,m,w,h,d,x,y,z,tint),ball=(m,w,h,d,x,y,z,tint)=>emit(sphere,m,w,h,d,x,y,z,tint);
 box(floor,b.w-4,.12,b.h-4,b.x+b.w/2,1.6,b.y+b.h/2);
 // Dark blue suspended ceiling grid and luminous panel covers, not additional lights.
 box(blue,b.w-4,.15,b.h-4,b.x+b.w/2,48.5,b.y+b.h/2);for(let x=b.x+3;x<b.x+b.w;x+=16)box(silver,.12,.1,b.h-4,x,48.3,b.y+b.h/2);for(let z=b.y+3;z<b.y+b.h;z+=16)box(silver,b.w-4,.1,.12,b.x+b.w/2,48.3,z);
 for(const x of [b.x+b.w*.3,b.x+b.w*.7])for(const z of [b.y+22,b.y+b.h-18])box(lamp,12,.2,10,x,48,z);
 let tanks=0,products=0;const swimmers=[];
 // Unit tank faces +Z. Rotating this sub-layout makes glass, fish and frame match every bank.
 function tank(x,y,z,w,h,d,angle,kind,idx){tanks++;const co=Math.cos(angle),si=Math.sin(angle),put=(geo,m,a,c,e,u,v,t,tint=null,rx=0,ry=0,rz=0)=>emit(geo,m,a,c,e,x+u*co+t*si,y+v,z-u*si+t*co,tint,rx,ry+angle,rz),B=(m,a,c,e,u,v,t,tint)=>put(cube,m,a,c,e,u,v,t,tint);
  B(black,w+.7,.55,d+.7,0,0,0);B(sand,w-.8,.4,d-.8,0,.5,0);B(blue,w-.6,h-.7,.15,0,h/2,-d/2+.15);
  for(const side of [-1,1]){B(glass,.12,h,d,side*w/2,h/2,0);B(black,.35,h,.35,side*w/2,h/2,d/2);}
  B(glass,w,h,.1,0,h/2,d/2);B(black,w+.5,.55,d+.5,0,h,0);B(glow,w-.7,.12,.35,0,h-.4,d/2-.6);B(water,w-.4,.06,d-.4,0,h-.65,0);
  // Filter box and slim intake tube, visibly inside the tank instead of occluding its front.
  B(black,1.3,h*.42,1.1,w/2-1.1,h*.65,-d/2+1);put(cylinder,silver,.14,h*.55,.14,w/2-1.1,h*.35,-d/2+1);
  for(let i=0;i<4;i++){const u=-w*.36+i*w*.23,t=-d*.15+(i%2)*d*.25;put(sphere,rock,1.4+i%2,.9,1,u,1,t);
   if(kind==='reef'){const tint=['#a25a9b','#e0b16b','#72a6af','#a1ae70'][i];put(sphere,coral,2.1,1.4,1.5,u,1.7,t,tint);for(let k=0;k<3;k++){put(cylinder,coral,.22,2.3,.22,u+(k-1)*.7,3,t,tint,0,0,(k-1)*.3);put(sphere,coral,.55,.45,.55,u+(k-1),4,t,tint);}}
   else{for(let k=0;k<3;k++)put(sphere,leaf,.35,1.8+i%2,.25,u+(k-1)*.6,2.4,t,['#547d43','#7a9b4c','#35704f'][k],0,0,(k-1)*.2);}}
  for(let i=0;i<3;i++){const u=(i-1)*w*.25,v=h*.4+(i%2)*h*.2,t=(i%2?1:-1)*d*.16;swimmers.push({x:x+u*co+t*si,y:y+v,z:z-u*si+t*co,angle,phase:idx*.7+i*1.9,range:Math.min(1,w*.07),color:['#f2c941','#df7137','#93c7d9','#416ab9','#d9dab1'][(idx+i)%5],scale:kind==='reef'?.8:.7});}
 }
 // Back-wall bank: three rows of blue-backed individual aquariums with white mullions.
 const n=Math.max(2,Math.floor((b.w-8)/18)),step=(b.w-8)/n;
 for(let row=0;row<3;row++)for(let i=0;i<n;i++)tank(b.x+4+(i+.5)*step,4+row*12.5,b.y+7,step-1,9,7,0,(i+row)%3===0?'reef':'planted',tanks);
 box(white,b.w-6,2,8,b.x+b.w/2,2,b.y+7);for(let row=0;row<3;row++)box(white,b.w-6,1.8,8,b.x+b.w/2,14+row*12.5,b.y+7);
 for(let i=0;i<=n;i++)box(white,.65,40,8,b.x+4+i*step,22,b.y+7);
 // Side tank stacks: dark wood lower joinery and accessible glass faces towards the aisle.
 for(const side of [-1,1]){const x=side<0?b.x+7:b.x+b.w-7,run=b.h-28,count=Math.max(2,Math.floor(run/18)),span=run/count;
  box(wood,8,3,run,x,2.5,b.y+12+run/2);
  for(let row=0;row<3;row++)for(let i=0;i<count;i++)tank(x,4+row*12.5,b.y+12+(i+.5)*span,span-1,9,7,side<0?Math.PI/2:-Math.PI/2,row===0?'planted':'reef',tanks);
  for(let row=0;row<3;row++)box(wood,8,2,run,x,14+row*12.5,b.y+12+run/2);
 }
 // Reef/planted island tanks sit on open white stands with shelves and visible sump equipment.
 for(const [i,r]of p.islands.entries()){const x=r.x+r.w/2,z=r.y+r.h/2;box(white,r.w,1,r.h,x,2.4,z);for(const dx of [-8,8])for(const dz of [-7,7])box(white,1.7,12,1.7,x+dx,8,z+dz);box(white,r.w,1,r.h,x,14,z);
  box(glass,11,6,9,x,6,z);putSump(x,z);tank(x,14.8,z,17,12,15,0,i?'planted':'reef',tanks);box(black,18,.8,2,x,32,z);for(const dx of [-6,6])box(black,.45,5,.45,x+dx,29,z);box(glow,16,.25,1.5,x,31.4,z);
 }
 function putSump(x,z){box(black,3,4,3,x+4,6,z);emit(cylinder,silver,.22,8,.22,x+5,10,z-4);emit(cylinder,black,1.3,6,1.3,x-4,7,z);}
 // Food, treatment bottles, nets and boxed filters along both front window wings.
 for(const r of p.stock){const x=r.x+r.w/2,z=r.y+r.h/2;box(white,r.w,2,r.h,x,2.6,z);box(white,r.w,22,.6,x,14,z-3.6);for(let row=0;row<3;row++){box(white,r.w,.6,r.h,x,5+row*7,z);for(let j=0;j<6;j++){const xx=r.x+1.5+j*2.5,tint=['#619c6d','#58a3b3','#e3ca68'][j%3];emit(cylinder,goods,.85,3.4,.85,xx,7.1+row*7,z,tint);box(white,1.4,.6,1.4,xx,9+row*7,z);products++;}}
  for(let j=0;j<3;j++){box(goods,3,4,2,r.x+3+j*5,27,z,['#5485ae','#85a65c','#c0a76d'][j]);products++;}}
 // Fish bodies, tails, fins and eyes are instanced separately and animated together by shared paths.
 const fishParts=[],fishDefs=[[sphere,fishMat,1.3,.55,.35,0,0,0],[cone,fishMat,.8,1.1,.18,-1.4,0,0],[cone,fishMat,.35,.6,.12,-.1,.5,0],[sphere,eye,.12,.12,.12,.75,.16,.3],[sphere,eye,.12,.12,.12,.75,.16,-.3]];
 for(const [geo,m,w,h,d,dx,dy,dz]of fishDefs){const mesh=new T.InstancedMesh(geo,m,swimmers.length);mesh.userData.noBatch=true;mesh.name='Aquarium · swimming '+(m===eye?'eyes':'fish');root.add(mesh);fishParts.push({mesh,w,h,d,dx,dy,dz,tail:geo===cone&&dx<0});swimmers.forEach((f,i)=>{if(m!==eye)mesh.setColorAt(i,color.set(f.color));});mesh.frustumCulled=false;}
 function animate(t){for(const part of fishParts){for(let i=0;i<swimmers.length;i++){const f=swimmers[i],a=f.angle+Math.sin(t*.4+f.phase)*.25,dx=Math.sin(t*.65+f.phase)*f.range,c=Math.cos(a),s=Math.sin(a);dummy.position.set(f.x+(dx+part.dx*f.scale)*c+part.dz*f.scale*s,f.y+Math.sin(t*.7+f.phase)*.15+part.dy*f.scale,f.z-(dx+part.dx*f.scale)*s+part.dz*f.scale*c);dummy.rotation.set(0,a,part.tail?Math.PI/2:0);dummy.scale.set(part.w*f.scale,part.h*f.scale,part.d*f.scale);dummy.updateMatrix();part.mesh.setMatrixAt(i,dummy.matrix);}part.mesh.instanceMatrix.needsUpdate=true;}}
 animate(0);
 if(typeof document!=='undefined'){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle='#163e66';ctx.fillRect(0,0,1024,256);ctx.fillStyle='#e6f9ff';ctx.textAlign='center';ctx.font='bold 40px sans-serif';ctx.fillText('REEF • FRESHWATER • AQUATIC PLANTS',512,67);ctx.font='28px sans-serif';ctx.fillText('KOI • GOLDFISH • ANGELFISH • SHRIMP • SNAILS',512,132);ctx.fillStyle='#9ccedd';ctx.font='25px sans-serif';ctx.fillText('FISH FOOD / WATER CARE / FILTERS',512,210);const tex=new T.CanvasTexture(canvas);tex.encoding=T.sRGBEncoding;textures.push(tex);const sign=new T.Mesh(new T.PlaneGeometry(b.w-9,7),new T.MeshBasicMaterial({map:tex,side:T.DoubleSide}));sign.position.set(b.x+b.w/2,44,b.y+2.2);sign.userData.noBatch=true;root.add(sign);}
 for(const [m,geos]of batches)for(const [geo,items]of geos){const mesh=new T.InstancedMesh(geo,m,items.length);mesh.userData.noBatch=true;items.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.rotation.set(v.rx,v.ry,v.rz);dummy.scale.set(v.w,v.h,v.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);if(v.tint)mesh.setColorAt(i,color.set(v.tint));});root.add(mesh);}
 if(dir===-1){root.rotation.y=Math.PI;root.position.x=2*b.x+b.w;root.position.z=2*b.y+b.h;}
 root.userData.aquarium={tanks,fish:swimmers.length,products,textures:textures.length};return {root,plan:plan(b,dir),solids:plan(b,dir).solids,animate};
}
const api={plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29AquariumStore=api;
})();
