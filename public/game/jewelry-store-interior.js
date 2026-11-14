'use strict';
(function(){
function plan(b,dir=1){const depth=Math.min(12,Math.max(2,(b.w-28)/2)),rear=Math.max(3,Math.min(9,b.h-42)),sideStart=rear+5,sideEnd=b.h-14,flip=r=>dir===-1?{...r,x:2*b.x+b.w-r.x-r.w,y:2*b.y+b.h-r.y-r.h}:r;
 const solids=[{x:b.x+3,y:b.y+sideStart,w:depth,h:sideEnd-sideStart,kind:'glass-case'},{x:b.x+b.w-3-depth,y:b.y+sideStart,w:depth,h:sideEnd-sideStart,kind:'glass-case'},{x:b.x+3,y:b.y+3,w:b.w-6,h:rear+3,kind:'rear-display'}];
 return {depth,rear,solids:solids.map(flip),entry:{x:b.x+b.w/2,y:dir===1?b.y+b.h:b.y},service:{x:b.x+b.w/2,y:dir===1?b.y+b.h-20:b.y+20}};}
function build(T,b,{base=0,dir=1}={}){
 const root=new T.Group();root.name='Jewelry Store · gold, glass and velvet';root.position.y=base;root.userData.noBatch=true;const p=plan(b),batches=new Map(),dummy=new T.Object3D(),textures=[],stats={necklaces:0,rings:0,earringPairs:0,bracelets:0,chandeliers:0};
 const material=(color,more={})=>new T.MeshStandardMaterial({color,roughness:.65,...more});
 const gold=material('#c39b48',{metalness:.72,roughness:.27}),silver=material('#c6d3db',{metalness:.65,roughness:.22}),wood=material('#52382b'),cream=material('#eee9da'),navy=material('#142647'),velvet=material('#30457a'),black=material('#192429'),crystal=material('#e7f6ff',{metalness:.15,roughness:.12}),glass=material('#b8e5ed',{transparent:true,opacity:.1,roughness:.15,depthWrite:false,side:T.DoubleSide}),glow=new T.MeshBasicMaterial({color:'#fff1c4'}),gemMats=['#a32346','#346d8c','#368473','#734f94'].map(c=>material(c,{metalness:.3,roughness:.2}));
 const cube=new T.BoxGeometry(),sphere=new T.SphereGeometry(1,10,8),cylinder=new T.CylinderGeometry(1,1,1,16),torus=new T.TorusGeometry(1,.1,6,20),gem=new T.OctahedronGeometry(1);
 function emit(geo,m,w,h,d,x,y,z,rx=0,ry=0,rz=0){if(!batches.has(m))batches.set(m,new Map());const geos=batches.get(m);if(!geos.has(geo))geos.set(geo,[]);geos.get(geo).push({w,h,d,x:b.x+x,y,z:b.y+z,rx,ry,rz});}
 const box=(m,w,h,d,x,y,z)=>emit(cube,m,w,h,d,x,y,z);
 function label(text,x,y,z,w,h,rotation=0){if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1024;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle='#142647';ctx.fillRect(0,0,1024,160);ctx.fillStyle='#eed7a0';ctx.textAlign='center';ctx.font='bold 76px serif';ctx.fillText(text,512,106,980);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;textures.push(t);const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:t}));m.userData.noBatch=true;m.position.set(b.x+x,y,b.y+z);m.rotation.y=rotation;root.add(m);}
 // Original marble-like veins; no downloaded store imagery or brand assets.
 const size=128,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const line=Math.abs(Math.sin(x*.05+y*.032+Math.sin(y*.08)*.5)),v=line>.987?189:235+Math.round(Math.sin(x*.14+y*.09)*5);data.set([v,v,v-3,255],(y*size+x)*4);}const marbleMap=new T.DataTexture(data,size,size);marbleMap.encoding=T.sRGBEncoding;marbleMap.wrapS=marbleMap.wrapT=T.RepeatWrapping;marbleMap.repeat.set(3,3);marbleMap.needsUpdate=true;textures.push(marbleMap);const marble=material('#ffffff',{map:marbleMap,roughness:.3});
 box(marble,b.w-4,.25,b.h-4,b.w/2,1.8,b.h/2);for(let z=18;z<b.h-4;z+=16)box(cream,b.w-4,.03,.12,b.w/2,1.95,z);
 box(navy,b.w-4,43,.4,b.w/2,24,2);for(const x of [2,b.w-2]){box(cream,.35,43,b.h-4,x,24,b.h/2);box(gold,.5,1,b.h-4,x,43,b.h/2);}
 // Headless necklace busts with curved shoulders, neck stands and layered chains.
 function bust(x,y,z,scale=1,ry=0,index=0){const local=(geo,m,w,h,d,lx,ly,lz,rx=0,rz=0)=>{const xx=lx*Math.cos(ry)+lz*Math.sin(ry),zz=-lx*Math.sin(ry)+lz*Math.cos(ry);emit(geo,m,w*scale,h*scale,d*scale,x+xx*scale,y+ly*scale,z+zz*scale,rx,ry,rz);};
 local(cylinder,cream,2.1,.6,1.6,0,.3,0);local(sphere,cream,2.5,3.2,1.05,0,3.6,0);local(cylinder,cream,.85,2, .7,0,6.6,0);local(cylinder,cream,1.1,.25,.85,0,7.65,0);
 for(let j=0;j<2;j++)local(torus,index%2?gold:silver,1.4+j*.25,1.75+j*.27,.7,0,4.5-j*.35,.95,.12);local(gem,gemMats[index%4],.45,.7,.28,0,2.6,1.15);stats.necklaces+=2;}
 function ring(x,y,z,i){emit(torus,i%2?gold:silver,.5,.65,.5,x,y+.75,z,-.4);emit(gem,gemMats[i%4],.38,.4,.33,x,y+1.4,z+.2);stats.rings++;}
 function tray(x,y,z,w,d){box(velvet,w,.45,d,x,y,z);for(const side of [-1,1]){box(gold,.15,.4,d,x+side*w/2,y+.2,z);box(gold,w,.4,.15,x,y+.2,z+side*d/2);}}
 const sideLength=b.h-14-(p.rear+5),caseZ=(p.rear+5+b.h-14)/2;
 for(const side of [-1,1]){const x=side<0?3+p.depth/2:b.w-3-p.depth/2,inner=x-side*p.depth/2,rotation=side<0?Math.PI/2:-Math.PI/2;
 box(wood,p.depth,11,sideLength,x,7.3,caseZ);box(gold,p.depth+.3,.5,sideLength+.3,x,13,caseZ);box(velvet,p.depth-.8,.4,sideLength-1,x,13.5,caseZ);
 for(const end of [-1,1]){box(gold,.35,10,.35,inner,18,caseZ+end*sideLength/2);box(glass,p.depth,9,.12,x,18,caseZ+end*sideLength/2);}
 box(glass,.12,9,sideLength,inner,18,caseZ);box(glass,p.depth,.12,sideLength,x,22.6,caseZ);for(const edge of [-1,1]){box(gold,.3,.5,sideLength+.4,x+edge*p.depth/2,23,caseZ);box(gold,p.depth+.4,.5,.3,x,23,caseZ+edge*sideLength/2);}box(glow,.2,.2,sideLength-1,inner-side*.6,22.4,caseZ);
 for(let z=p.rear+12;z<b.h-17;z+=11){const sc=Math.min(1,p.depth/8);bust(x,13.8,z,sc,rotation,Math.floor(z));tray(inner+side*2,14,z+4,Math.min(3,p.depth*.35),5);for(let j=0;j<3;j++)ring(inner+side*2,14.3,z+2.5+j*1.4,j);}
 for(let z=p.rear+10;z<b.h-15;z+=9){box(gold,.25,6,6,inner+.15*side,7,z);box(wood,.3,5,5,inner+.2*side,7,z);}
 label(side<0?'NECKLACES':'RINGS & GEMS',side<0?2.6:b.w-2.6,38,b.h/2,b.h-20,4,rotation);
 }
 // Open wall cubbies: individual busts, earring cards and bracelet stands.
 const rearDepth=p.rear,cols=Math.max(2,Math.floor((b.w-12)/12)),cell=(b.w-12)/cols;box(wood,b.w-6,31,.7,b.w/2,18,3.2);box(navy,b.w-8,27,.25,b.w/2,20,3.7);
 for(let row=0;row<2;row++){const yy=8+row*13;box(gold,b.w-9,.6,rearDepth,b.w/2,yy-1.1,3+rearDepth/2);for(let i=0;i<cols;i++){const x=6+(i+.5)*cell;box(gold,.5,26,rearDepth,6+i*cell,20,3+rearDepth/2);bust(x,yy,3+rearDepth-.8,.85,0,i+row);}}
 // Cases remain visually open above their low cabinet plinths.
 box(wood,b.w-6,6,rearDepth,b.w/2,4.8,3+rearDepth/2);box(marble,b.w-6,.8,rearDepth+1,b.w/2,8,3+rearDepth/2);label('CRESCENT JEWELERS',b.w/2,40,2.5,b.w-12,6);
 for(let i=0;i<cols;i++){const x=6+(i+.5)*cell;tray(x,9,3+rearDepth-.2,cell*.75,2.5);for(let j=0;j<3;j++)ring(x-2+j*2,9.3,3+rearDepth-.2,i+j);box(cream,2.5,3,.4,x,16,3+rearDepth+.7);for(const offset of [-.7,.7]){emit(torus,gold,.35,.6,.35,x+offset,16,3+rearDepth+1);emit(gem,gemMats[i%4],.3,.5,.25,x+offset,15.3,3+rearDepth+1);}stats.earringPairs++;emit(cylinder,cream,2,.5,2,x,10,3+rearDepth+1);emit(torus,gold,1.5,1.5,1.5,x,10.5,3+rearDepth+1,Math.PI/2);stats.bracelets++;}
 for(const z of [b.h*.4,b.h*.78]){const x=b.w/2,r=Math.min(6,b.w*.12);box(gold,.35,5,.35,x,46,z);emit(torus,gold,r,r,r,x,42.5,z,Math.PI/2);emit(cylinder,gold,r,.5,r,x,43,z);for(let i=0;i<16;i++){const a=i*Math.PI/8,xx=x+Math.cos(a)*r*.85,zz=z+Math.sin(a)*r*.85;box(gold,.15,2,.15,xx,41.5,zz);emit(sphere,crystal,.5,1.5,.5,xx,39.7,zz);emit(sphere,glow,.3,.5,.3,xx,41.7,zz);}emit(sphere,glow,2,1,2,x,41,z);stats.chandeliers++;}
 for(const [m,geos]of batches)for(const [geo,items]of geos){const mesh=new T.InstancedMesh(geo,m,items.length);mesh.userData.noBatch=true;items.forEach((a,i)=>{dummy.position.set(a.x,a.y,a.z);dummy.rotation.set(a.rx,a.ry,a.rz);dummy.scale.set(a.w,a.h,a.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});root.add(mesh);}
 if(dir===-1){root.rotation.y=Math.PI;root.position.x=2*b.x+b.w;root.position.z=2*b.y+b.h;}
 root.userData.jewelry={...stats,textures:textures.length};return {root,solids:plan(b,dir).solids};
}
const api={plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29JewelryStore=api;
})();
