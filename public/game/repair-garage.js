'use strict';
(function(){
function matches(v){return v.id==='garage'&&v.careerBusiness!=='marine';}
function plan(b){const cx=b.x+b.w/2,z=b.y+b.h*.56,spread=Math.min(50,b.w/2-25),posts=[-1,1].map(s=>({x:cx+s*spread-3,y:z-4,w:6,h:8,kind:'lift-post'})),rear={x:b.x+7,y:b.y+5,w:b.w-14,h:13,kind:'workbench'},sides=[{x:b.x+5,y:b.y+32,w:12,h:34,kind:'tire-rack'},{x:b.x+b.w-18,y:b.y+32,w:13,h:34,kind:'diagnostics'}];return {posts,rear,sides,solids:[rear,...posts,...sides],lift:{x:cx,y:z,spread},entry:{x:cx,y:b.y+b.h},service:{x:cx,y:b.y+b.h*.61}};}
function build(T,b,{base=0,sign}={}){
 const root=new T.Group();root.name='Repair Garage · red / steel workshop';root.position.y=base;root.userData.noBatch=true;const p=plan(b),batches=new Map(),textures=[];
 const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.8,...extra});
 function texture(kind){const n=128,a=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const noise=((x*17+y*29+x*y*3)%19)-9;let c=kind==='concrete'?164+noise:232+noise*.3;if(kind==='concrete'){const stain=Math.hypot((x-63)*.8,y-78);if(stain<19)c-=Math.max(0,19-stain)*1.5;if((x+y*2)%113<1)c-=16;}if(kind==='pegboard'&&Math.hypot(x%12-6,y%12-6)<1.5)c=65;if(kind==='label'&&y>72&&y<113&&y%8<2&&x>23&&x<105)c=68;a.set([c,c,c,255],(y*n+x)*4);}const t=new T.DataTexture(a,n,n);t.encoding=T.sRGBEncoding;t.wrapS=t.wrapT=T.RepeatWrapping;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;textures.push(t);return t;}
 const concrete=mat('#a6a9a1',{map:texture('concrete'),roughness:.92}),peg=mat('#c3c9c2',{map:texture('pegboard')}),red=mat('#a73534'),blue=mat('#176f9a'),steel=mat('#a1acab',{metalness:.65,roughness:.35}),dark=mat('#263138'),black=mat('#151e22'),rubber=mat('#242b2d',{roughness:.96}),wood=mat('#b28b5d'),cream=mat('#e1e2d7'),yellow=mat('#dfb14a'),product=mat('#ffffff',{map:texture('label')}),glow=new T.MeshBasicMaterial({color:'#f1f9ed'}),screen=new T.MeshBasicMaterial({color:'#65a5a6'});
 concrete.map.repeat.set(b.w/48,b.h/48);peg.map.repeat.set(b.w/25,2);
 const cube=new T.BoxGeometry(),cyl=new T.CylinderGeometry(1,1,1,12),torus=new T.TorusGeometry(1,.3,7,18),sphere=new T.SphereGeometry(1,8,6),dummy=new T.Object3D(),color=new T.Color();let tools=0,products=0;
 const emit=(geo,m,w,h,d,x,y,z,tint=null,rx=0,ry=0,rz=0)=>{if(!batches.has(m))batches.set(m,new Map());const by=batches.get(m);if(!by.has(geo))by.set(geo,[]);by.get(geo).push({w,h,d,x:b.x+x,y,z:b.y+z,tint,rx,ry,rz});};
 const box=(m,w,h,d,x,y,z,tint)=>emit(cube,m,w,h,d,x,y,z,tint),ball=(m,w,h,d,x,y,z)=>emit(sphere,m,w,h,d,x,y,z);
 box(concrete,b.w-6,.16,b.h-6,b.w/2,.91,b.h/2);box(red,b.w-6,12,.25,b.w/2,41,3.15);box(peg,b.w-18,19,.3,b.w/2,26,3.4);
 for(const x of [3.2,b.w-3.2]){box(cream,.2,37,b.h-7,x,20,b.h/2);box(red,.25,10,b.h-7,x,42,b.h/2);box(dark,.4,3,b.h-7,x,2.5,b.h/2);}
 // Continuous steel drawer workbench and red/gray rolling tool cabinets.
 const rear=p.rear;box(dark,rear.w,2,12,b.w/2,2,11.5);box(wood,rear.w+1,1.5,13,b.w/2,14,11.5);
 const count=Math.max(3,Math.floor((b.w-18)/22)),step=(b.w-18)/count;for(let i=0;i<count;i++){const x=9+(i+.5)*step,m=i%3===0?red:steel;box(m,step-1,10.5,11,x,8,11.5);for(let row=0;row<5;row++){box(dark,step-2,.2,.25,x,4+row*2,17.15);box(steel,step-5,.35,.5,x,4.5+row*2,17.4);}for(const s of [-1,1])emit(cyl,rubber,1,1,1,x+s*(step/2-2),1.2,14,null,Math.PI/2);}
 // Pegboard: open-jaw wrenches, pliers, hammers, screwdrivers and socket rows.
 for(let row=0;row<2;row++)for(let i=0;i<Math.floor((b.w-24)/4.8);i++){const x=12+i*4.8,y=21+row*8,k=(i+row)%4;tools++;box(steel,.2,.2,1,x,y+3.4,4.2);
  if(k===0){box(steel,.65,5,.5,x,y,4.8);box(steel,2.3,.5,.5,x,y+2.5,4.8);for(const s of [-1,1])box(steel,.5,1.3,.5,x+s*.9,y+2.9,4.8);}
  else if(k===1){for(const s of [-1,1]){box(red,.6,3,.6,x+s*.65,y-1,4.8);box(steel,.5,2.3,.5,x+s*.4,y+1.4,4.8);}box(steel,1.5,.6,.6,x,y+.4,4.8);}
  else if(k===2){box(wood,.7,5,.7,x,y,4.8);box(steel,3.5,1.2,1,x+.5,y+2.4,4.8);}
  else{box(steel,.25,3.5,.25,x,y+1,4.8);box(yellow,1,2.7,.9,x,y-1.7,4.8);}
 }
 for(let i=0;i<14;i++){const x=b.w*.25+i*2.8;if(x>b.w-13)break;emit(cyl,steel,.45,1+i%3*.4,.45,x,15.6,14);tools++;}
 // Upper cabinets flank a long red fascia; labels are original fictional workshop signs.
 for(const x of [17,b.w-17]){box(steel,22,11,8,x,39,7.5);box(dark,.15,10,.2,x,39,11.7);for(const s of [-1,1])box(dark,.3,3,.5,x+s*2,38,11.8);}
 for(let i=0;i<Math.floor((b.w-25)/8);i++){const x=12+i*8;box(product,4,5,3,x,17.3,10,['#a73534','#c6b652','#41677e'][i%3]);box(black,2.5,.5,2.5,x,20,10);products++;}
 // Two blue lift posts with tucked steel arms, matching only their post/base collider footprints.
 const cx=b.w/2,z=p.lift.y-b.y;for(const s of [-1,1]){const x=cx+s*p.lift.spread;box(blue,6,40,8,x,21,z);box(steel,2,33,.6,x-s*3.1,21,z);box(dark,4,1,5,x,3,z);box(blue,4,1,6,x,2,z);box(steel,2,1.1,6,x,4,z);box(blue,5,2,2,x,41,z);box(black,.4,8,2,x-s*3.2,23,z);box(yellow,.45,5,1,x-s*3.5,23,z);box(steel,4,1,2,x,3.5,z+3);}
 // Flush paint marks, not a raised platform across the vehicle approach.
 for(const s of [-1,1])box(yellow,.7,.03,Math.min(65,b.h-40),cx+s*25,1.02,b.h*.62);box(black,38,.05,26,cx,1.02,b.h*.60);
 // Tire rack/air compressor on the left, within an explicit wall-side footprint.
 for(const y of [5,16,27]){box(blue,12,1,34,11,y,49);for(let k=0;k<3;k++)emit(torus,rubber,4,4,2.1,11,y+4,37+k*10,null,0,Math.PI/2);}
 for(const x of [5.5,16.5])for(const zz of [32.5,65.5])box(steel,.8,34,.8,x,18,zz);
 // Right: diagnostic cart, drawers, bottles, laptop, hose and vertical gas cylinder.
 const dx=b.w-11.5;box(blue,11,13,14,dx,8,40);for(let row=0;row<4;row++)box(steel,.5,.5,10,dx-5.8,4+row*3,40);box(dark,12,1,15,dx,15,40);box(black,6,.5,7,dx,16,40);box(dark,6,6,.7,dx,19,37);box(screen,5,4.6,.1,dx,19,37.5);for(const s of [-1,1])emit(cyl,rubber,1,1,1,dx+s*4,1.4,44,null,Math.PI/2);
 emit(cyl,greenMaterial(),2.6,15,2.6,dx,9,59);ball(steel,2.6,1.3,2.6,dx,17,59);box(steel,.6,3,.6,dx,19,59);emit(torus,black,3,3,3,dx,24,58,null,0,Math.PI/2);box(steel,9,.7,8,dx,28,59);for(let i=0;i<4;i++){emit(cyl,product,.8,3,.8,dx-3+i*2,30,59,['#d6cf93','#4d879e'][i%2]);products++;}
 function greenMaterial(){return mat('#32735a',{metalness:.3});}
 // Checkerboard banner above the workshop; white cells share existing cream material.
 const bw=Math.min(64,b.w-55);for(let row=0;row<3;row++)for(let i=0;i<12;i++)box((row+i)%2?black:cream,bw/12,2,.13,cx-bw/2+(i+.5)*bw/12,42+row*2,3.7);
 for(const x of [b.w*.3,b.w*.7])for(const zz of [b.h*.28,b.h*.76]){box(steel,26,.6,5,x,49.4,zz);box(glow,24,.25,3.7,x,49,zz);}
 const roof=new T.Mesh(new T.BoxGeometry(b.w+2,1,b.h+2),cream);roof.position.set(b.x+b.w/2,51.2,b.y+b.h/2);roof.userData.noBatch=true;root.add(roof);
 if(sign){sign(root,'SERVICE / DIAGNOSTICS · REPAIR $150',Math.min(92,b.w-25),5,b.x+b.w/2,35,b.y+4.2,'#e8d9b3');}
 for(const [m,geos]of batches)for(const [geo,list]of geos){const mesh=new T.InstancedMesh(geo,m,list.length);mesh.userData.noBatch=true;list.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.rotation.set(v.rx,v.ry,v.rz);dummy.scale.set(v.w,v.h,v.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);if(v.tint)mesh.setColorAt(i,color.set(v.tint));});root.add(mesh);}
 root.userData.repairGarage={tools,products,lifts:1,posts:2,textures:textures.length};return {root,roof,plan:p,solids:p.solids};
}
const api={matches,plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29RepairGarage=api;
})();
