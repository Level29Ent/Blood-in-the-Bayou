'use strict';
(function(){
function plan(b,dir=1){const flip=r=>dir===-1?{...r,x:b.x+b.w-(r.x-b.x)-r.w,y:b.y+b.h-(r.y-b.y)-r.h}:r;
 const stations=[.25,.75].map((k,i)=>({x:b.x+b.w*k,y:b.y+27,index:i}));
 const solids=[{x:b.x+4,y:b.y+4,w:b.w-8,h:9,kind:'cabinet'},...stations.map(s=>({x:s.x-8,y:s.y-12,w:16,h:26,kind:'barber-chair'})),...[6,b.w-16].map(x=>({x:b.x+x,y:b.y+b.h-24,w:10,h:12,kind:'waiting-seat'}))].map(flip);
 const point=p=>dir===-1?{x:b.x+b.w-(p.x-b.x),y:b.y+b.h-(p.y-b.y)}:p;
 return {solids,stations:stations.map(point),entry:point({x:b.x+b.w/2,y:b.y+b.h}),service:point({x:b.x+b.w/2,y:b.y+b.h-20})};}
function build(T,b,{base=0,dir=1}={}){const root=new T.Group();root.name='Barber Shop · classic brick / mirror studio';const p=plan(b,dir),batches=new Map(),textures=[];
 function map(kind){const n=128,a=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const noise=((x*13+y*37+x*y*3)%23)-11;let v=238+noise*.4;if(kind==='wood')v=222+noise+Math.sin(x*.44+Math.sin(y*.08))*10;if(kind==='brick'){v=218+noise;if(y%32<2||(x+(Math.floor(y/32)%2)*32)%64<2)v=252;}if(kind==='leather')v=229+noise*.5;if(kind==='tin')v=227+Math.sin(x*Math.PI/16)*Math.sin(y*Math.PI/16)*13;if(kind==='mirror'){v=195+y*.25;if(x<4||y<4)v=240;v=Math.min(249,v);}a.set([v,v,v,255],(y*n+x)*4);}const t=new T.DataTexture(a,n,n);t.encoding=T.sRGBEncoding;t.wrapS=t.wrapT=T.RepeatWrapping;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.needsUpdate=true;textures.push(t);return t;}
 const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.75,...extra});
 const wood=mat('#bb8d58',{map:map('wood')}),cabinet=mat('#26221e'),cream=mat('#e5d5b8'),brick=mat('#98664b',{map:map('brick')}),black=mat('#171c20',{map:map('leather'),roughness:.48}),red=mat('#9f3533',{roughness:.55}),chrome=mat('#aeb9bd',{metalness:.8,roughness:.23}),dark=mat('#303a3c'),mirror=mat('#c2d4d2',{map:map('mirror'),metalness:.72,roughness:.15}),tin=mat('#a6a49a',{map:map('tin'),metalness:.5,roughness:.55}),products=mat('#ffffff'),paper=mat('#efebdf'),glow=new T.MeshBasicMaterial({color:'#fff1c9'}),screen=new T.MeshBasicMaterial({color:'#354d59'});wood.map.repeat.set(b.w/14,b.h/28);brick.map.repeat.set(2,3);tin.map.repeat.set(b.w/16,b.h/16);
 const cube=new T.BoxGeometry(),sphere=new T.SphereGeometry(1,12,8),cylinder=new T.CylinderGeometry(1,1,1,16),torus=new T.TorusGeometry(1,.12,5,16),dummy=new T.Object3D(),col=new T.Color();
 const emit=(geo,m,w,h,d,x,y,z,color=null,rx=0,rz=0)=>{if(!batches.has(m))batches.set(m,new Map());const by=batches.get(m);if(!by.has(geo))by.set(geo,[]);by.get(geo).push({w,h,d,x,y,z,color,rx,rz});};
 const box=(m,w,h,d,x,y,z,color=null)=>emit(cube,m,w,h,d,x,y,z,color),ball=(m,w,h,d,x,y,z)=>emit(sphere,m,w,h,d,x,y,z),cyl=(m,r,h,x,y,z)=>emit(cylinder,m,r,h,r,x,y,z);
 box(wood,b.w-4,.22,b.h-4,b.w/2,1.7,b.h/2);for(let x=4;x<b.w-3;x+=7)box(cabinet,.08,.03,b.h-6,x,1.83,b.h/2);for(let x=5;x<b.w-4;x+=7)for(let z=6+(Math.floor(x/7)%2)*12;z<b.h-4;z+=24)box(cabinet,6.9,.03,.07,x+3.5,1.84,z);
 // Interior-facing wall finish; original tenant walls and entrance are retained by the mall.
 box(cream,b.w-3,40,.4,b.w/2,22,1.4);for(const x of [2,b.w-2])box(cream,.4,40,b.h-4,x,22,b.h/2);
 box(tin,b.w-4,.3,b.h-4,b.w/2,48.25,b.h/2);for(let x=8;x<b.w-5;x+=16)box(cabinet,.2,.3,b.h-5,x,47.9,b.h/2);for(let z=8;z<b.h-5;z+=16)box(cabinet,b.w-5,.3,.2,b.w/2,47.9,z);
 for(const x of [b.w*.25,b.w*.75]){box(chrome,13,.6,7,x,47.5,33);box(glow,12,.2,6,x,47.1,33);}
 // Continuous paneled base cabinets, countertop and warm brick pilasters.
 box(cabinet,b.w-8,11,9,b.w/2,7.1,8.5);box(dark,b.w-7,1,10,b.w/2,13,8.5);for(let x=9;x<b.w-6;x+=11){box(black,9,8,.3,x,7.5,13.2);box(chrome,3,.45,.6,x,10.5,13.6);}
 for(const x of [4,b.w/2,b.w-4]){box(brick,5.5,40,1,x,22,2);box(wood,6.5,1.4,2,x,42,2.4);box(chrome,1.4,2,.4,x,12,2.8);}
 let bottles=0;
 for(const [i,k]of [.25,.75].entries()){const x=b.w*k;
  // Tall dark-framed mirrors with silver inner bevel, no per-frame reflection render targets.
  box(cabinet,18,25,1,x,28,2.3);box(chrome,16.3,23.3,.3,x,28,2.95);box(mirror,15.5,22.5,.25,x,28,3.2);box(wood,20,1.5,2,x,41,2.8);
  for(const side of [-1,1]){box(chrome,.8,5,2,x+side*11,31,3.2);ball(glow,1.3,2.1,1.2,x+side*11,34,4);}
  for(let n=0;n<7;n++){const xx=x-7+n*2.2,zz=n%2?7:10;emit(cylinder,products,.6,2+(n%3)*.5,.6,xx,14.5,zz,['#e1dba5','#4e8f76','#c2dce2','#d3b759','#555765','#8b569d','#a7bba4'][n]);box(black,.65,.6,.65,xx,16.1+(n%3)*.25,zz);bottles++;}
  box(paper,4,.5,2,x-4,13.9,12);box(dark,3.5,.7,1.3,x+4,14,11);box(chrome,1.8,.15,3,x+1,13.8,10);for(const dx of [-1,1])emit(torus,chrome,.6,.6,.6,x+dx,14,12,null,Math.PI/2);box(chrome,.2,.15,3,x,14,10.4);
  // Clipper cradle and coiled cord are contained inside the cabinet footprint.
  box(black,1.5,2,1,x+6,11.5,13.5);emit(torus,black,1.5,3,1.5,x+6,8.5,13.6);
  // Detailed hydraulic chair facing the mirror: pedestal, upholstery, arms and footrest.
  cyl(chrome,6.7,.8,x,2.5,27);cyl(black,5.8,.5,x,3.1,27);cyl(chrome,1.2,5,x,5.5,27);box(chrome,12,1,12,x,8.2,27);ball(black,6.2,1.5,5.3,x,9.5,27);ball(black,6.2,5.7,1.7,x,15,31.5);box(chrome,.6,2,.6,x,21.2,31.5);ball(black,3.1,1.5,1.2,x,22.5,31.4);
  for(const side of [-1,1]){box(chrome,.6,5,9,x+side*6.2,11,27);ball(black,1.2,1.1,4.6,x+side*6.2,13.8,27);box(chrome,.6,5,.6,x+side*4.5,5.5,21);}
  box(chrome,10,.7,5,x,3.4,18);box(black,9.2,.25,4.2,x,3.9,18);for(let n=0;n<7;n++)box(chrome,.35,.08,3.5,x-3.6+n*1.2,4.08,18);
  // Tufted buttons/piping on the visible rear and front of each curved backrest.
  for(const yy of [12.7,16.5])for(const dx of [-2.8,0,2.8])ball(chrome,.2,.2,.12,x+dx,yy,33.1);
 }
 for(const x of [11,b.w-11]){const z=b.h-18;box(red,10,1.5,10,x,8,z);box(black,10,8,1.5,x,11.5,z+4.6);for(const dx of [-4,4])for(const dz of [-3.5,3.5])box(chrome,.5,6,.5,x+dx,4,z+dz);for(const dx of [-5,5])box(chrome,.6,3,8,x+dx,10,z);}
 // Wall-mounted TV and framed service board stay above customer routes.
 box(black,.7,9,16,b.w-1.8,30,b.h-20);box(screen,.75,7.7,14.7,b.w-2.1,30,b.h-20);box(cabinet,.8,8,10,1.8,29,b.h-19);box(paper,.85,6.5,8.5,2.1,29,b.h-19);
 for(const [m,by]of batches)for(const [geo,list]of by){const mesh=new T.InstancedMesh(geo,m,list.length);mesh.name=m===mirror?'Barber · silvered mirror panels':m===black?'Barber · leather upholstery':'Barber · fixtures';list.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.scale.set(v.w,v.h,v.d);dummy.rotation.set(v.rx,0,v.rz);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);if(m===products)mesh.setColorAt(i,col.set(v.color||'#ddddce'));});mesh.userData.noBatch=true;mesh.frustumCulled=false;root.add(mesh);}
 // Rotate the whole local room and every footprint together for the opposite mall gallery.
 root.position.set(dir===-1?b.x+b.w:b.x,base,dir===-1?b.y+b.h:b.y);root.rotation.y=dir===-1?Math.PI:0;
 root.userData.barber={chairs:2,waiting:2,bottles,textures:textures.length,mirrors:'static silvered panels'};return {root,solids:p.solids,plan:p};
}
const api={plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29BarberInterior=api;
})();
