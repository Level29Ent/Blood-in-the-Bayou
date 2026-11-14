'use strict';
(function(){
function matches(v){return v.depth==='records';}
function plan(b){const split=b.x+b.w*.62,cz=b.y+b.h*.30,dx=b.x+b.w*.25,desk={x:dx-24,y:cz-10,w:48,h:20,kind:'console'},chair={x:dx-6,y:cz+15,w:12,h:12,kind:'engineer-chair'},partition=[{x:split,y:b.y+4,w:1.2,h:b.h-48,kind:'booth-glass'},{x:split,y:b.y+b.h-12,w:1.2,h:8,kind:'booth-glass'}],racks=[{x:b.x+5,y:b.y+5,w:12,h:18,kind:'outboard'},{x:b.x+5,y:b.y+b.h-26,w:28,h:12,kind:'keyboard'},{x:b.x+5,y:b.y+53,w:12,h:23,kind:'outboard'}],booth=[{x:split+12,y:b.y+14,w:20,h:18,kind:'live-instruments'},{x:split+12,y:b.y+50,w:20,h:18,kind:'live-instruments'}];return {desk,chair,partition,racks,booth,solids:[desk,chair,...partition,...racks,...booth],entry:{x:b.x+b.w/2,y:b.y+b.h},service:{x:b.x+b.w/2,y:b.y+b.h*.35},boothDoor:{x:split,y:b.y+b.h-28}};}
function build(T,b,{base=0,sign}={}){
const root=new T.Group();root.name='Crescent Records · control room and live booth';root.userData.noBatch=true;root.position.y=base;const p=plan(b),batches=new Map(),textures=[];
const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.8,...extra});
function map(kind){const n=128,a=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const noise=((x*13+y*29+x*y)%19)-9;let c=228+noise*.4;if(kind==='wood')c=216+noise+Math.sin(x*.23+Math.sin(y*.1))*15;if(kind==='fabric')c=210+noise+(x%3===0||y%3===0?-6:2);a.set([c,c,c,255],(y*n+x)*4);}const t=new T.DataTexture(a,n,n);t.encoding=T.sRGBEncoding;t.wrapS=t.wrapT=T.RepeatWrapping;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;textures.push(t);return t;}
const wood=mat('#875b36',{map:map('wood')}),black=mat('#182327'),fabric=mat('#323033',{map:map('fabric')}),cream=mat('#d7cfb7'),silver=mat('#a1b1b4',{metalness:.65,roughness:.32}),red=mat('#963d3b'),blue=mat('#244a62'),gold=mat('#cbb47a'),white=mat('#ebe9d9'),glass=mat('#b6d4cf',{transparent:true,opacity:.13,roughness:.1,depthWrite:false}),rug=mat('#705d4f',{map:map('fabric')}),screen=new T.MeshBasicMaterial({color:'#34646c'}),cyan=new T.MeshBasicMaterial({color:'#7ba9aa'}),violet=new T.MeshBasicMaterial({color:'#6955d9'}),green=new T.MeshBasicMaterial({color:'#5eaa7a'}),glow=new T.MeshBasicMaterial({color:'#fff1c9'});
wood.map.repeat.set(b.w/18,b.h/36);rug.map.repeat.set(3,2);
const cube=new T.BoxGeometry(),cylinder=new T.CylinderGeometry(1,1,1,12),sphere=new T.SphereGeometry(1,10,8),torus=new T.TorusGeometry(1,.13,5,18),dummy=new T.Object3D(),color=new T.Color();let channels=0,modules=0,panels=0;
function emit(geo,m,w,h,d,x,y,z,tint=null,rx=0,ry=0,rz=0){if(!batches.has(m))batches.set(m,new Map());const by=batches.get(m);if(!by.has(geo))by.set(geo,[]);by.get(geo).push({w,h,d,x:b.x+x,y,z:b.y+z,tint,rx,ry,rz});}
const box=(m,w,h,d,x,y,z,tint)=>emit(cube,m,w,h,d,x,y,z,tint),ball=(m,w,h,d,x,y,z)=>emit(sphere,m,w,h,d,x,y,z);
box(wood,b.w-6,.15,b.h-6,b.w/2,1.1,b.h/2);for(let x=5;x<b.w-3;x+=7)box(black,.1,.02,b.h-6,x,1.19,b.h/2);for(let z=14;z<b.h;z+=23)for(let x=5;x<b.w;x+=14)box(black,7,.02,.1,x,1.2,z+(Math.floor(x/14)%2)*10);
box(rug,69,.1,61,b.w*.26,1.28,b.h*.51);for(const s of [-1,1])box(gold,68,.03,.4,b.w*.26,1.35,b.h*.51+s*29);
// Alternating wood diffusion strips and dark fabric panels around the room.
box(wood,b.w-6,41,.3,b.w/2,23,3.2);for(const x of [3.2,b.w-3.2])box(wood,.3,41,b.h-6,x,23,b.h/2);
for(let x=10;x<b.w-8;x+=13){box(fabric,9,25,.5,x,27,3.6);panels++;for(const dx of [-5.5,5.5])box(cream,.6,33,.6,x+dx,24,3.8);}
for(let z=15;z<b.h-18;z+=17){box(fabric,.5,22,11,3.6,26,z);box(cream,.5,22,11,b.w-3.6,26,z);panels+=2;for(let j=0;j<3;j++)box(wood,.7,26,.7,b.w-4,24,z-4+j*4);}
// Suspended absorption clouds, timber ceiling and blue-violet perimeter trim (no real lights).
box(wood,b.w-6,.2,b.h-6,b.w/2,49,b.h/2);for(const x of [b.w*.23,b.w*.49,b.w*.8])for(const z of [b.h*.25,b.h*.68]){box(fabric,b.w*.18,1,29,x,46,z);for(const dx of [-4,4])box(silver,.12,2,.12,x+dx,47,z);panels++;}
for(const x of [4,b.w-4])box(violet,.4,.5,b.h-8,x,45,b.h/2);box(violet,b.w-8,.5,.4,b.w/2,45,4);for(const x of [b.w*.25,b.w*.77])box(glow,20,.2,2,x,47,b.h*.47);
// Desk: gently banked channel surface with walnut cheeks, faders/knobs/meters and DAW screen.
const dx=p.desk.x-b.x+24,dz=p.desk.y-b.y+10;for(const side of [-1,1]){box(wood,3,12,20,dx+side*22.5,7,dz);box(black,3,2,20,dx+side*22.5,2,dz);}box(wood,48,2,20,dx,14,dz);box(black,43,.7,17,dx,15.4,dz);box(black,47,2,2.5,dx,14.4,dz+9);
for(let i=0;i<24;i++){const x=dx-19.5+i*1.7;channels++;box(silver,1.45,.12,13,x,15.9,dz);box(black,.12,.08,5,x,16,dz+3);box(white,.9,.35,.6,x,16.2,dz+1.4+(i%5)*.7);for(let j=0;j<5;j++)emit(cylinder,[silver,red,blue,gold,black][j],.21,.35,.21,x,16.2,dz-5.5+j*1.15);box(green,.6,.06,1+(i%5)*.25,x,16,dz-6.6);}
for(let i=0;i<5;i++){box(black,6,.4,3,dx-15+i*7.5,17,dz-8);box(screen,4.8,.08,1.8,dx-15+i*7.5,17.3,dz-8);}
box(silver,17,.7,8,dx,17,dz-1);box(black,17,9,.8,dx,23,dz-3);box(screen,15.5,7.6,.12,dx,23,dz-2.5);for(let row=0;row<6;row++){box(black,14,.15,.12,dx,20+row,dz-2.38);for(let j=0;j<8;j++)box(j%2?green:cyan,1.1,.25,.08,dx-6+j*1.6,20.4+row,dz-2.27);}box(white,9,.3,3,dx,16.5,dz+5);
// Monitor pair on stands, tweeters/woofers facing the engineer, not the rear wall.
for(const side of [-1,1]){const x=dx+side*18;box(black,11,2,10,x,2,dz-5);box(black,1.5,16,1.5,x,11,dz-5);box(black,10,14,8,x,26,dz-5);for(const [y,r]of [[23,3],[30,1.1]]){emit(cylinder,silver,r,.35,r,x,y,dz-.8,null,Math.PI/2);emit(cylinder,black,r*.75,.4,r*.75,x,y,dz-.55,null,Math.PI/2);}}
// Engineer chair with casters, padded seat/back, armrests and metal pedestal.
const cx=p.chair.x-b.x+6,cz=p.chair.y-b.y+6;emit(cylinder,silver,.7,7,.7,cx,5,cz);for(let i=0;i<5;i++){const a=i/5*Math.PI*2;emit(cube,black,6,.6,.6,cx+Math.cos(a)*2.5,1.5,cz+Math.sin(a)*2.5,null,0,-a);emit(cylinder,black,.8,.7,.8,cx+Math.cos(a)*5,1.2,cz+Math.sin(a)*5,null,Math.PI/2);}box(fabric,11,2,10,cx,9,cz);box(fabric,10,10,2,cx,15,cz+4);for(const side of [-1,1]){box(black,.5,6,.5,cx+side*5.5,11,cz);box(black,1,.8,8,cx+side*5.5,14,cz);}
// Two open-front outboard racks with densely varied meters, patch points and controls.
for(const r of p.racks.slice(0,1).concat(p.racks.slice(2))){const x=r.x-b.x+r.w/2,z=r.y-b.y+r.h/2;box(wood,r.w,25,1,x,14,z-r.h/2);for(const xx of [x-r.w/2+.5,x+r.w/2-.5])box(wood,1,25,r.h,xx,14,z);for(let j=0;j<9;j++){const y=3+j*2.6;modules++;box(j%3===0?silver:black,r.w-2,2.2,r.h-2,x,y,z);for(let i=0;i<4;i++){box(screen,1.3,.7,.15,x-3.5+i*2.3,y+.2,z+r.h/2-.8);emit(cylinder,silver,.3,.3,.3,x-3+i*2.1,y-.6,z+r.h/2-.65,null,Math.PI/2);}}}
// Side keyboard and a compact lounge at the entrance-side wall (no center-aisle obstruction).
const k=p.racks[1],kx=k.x-b.x+k.w/2,kz=k.y-b.y+k.h/2;for(const side of [-1,1])emit(cube,black,1,12,1,kx+side*8,7,kz,null,0,0,side*.5);box(black,28,2,12,kx,14,kz);for(let i=0;i<25;i++){box(white,.95,.5,7,kx-12+i,15.3,kz+2);if(i%7!==2&&i%7!==6)box(black,.5,.7,4,kx-11.5+i,15.8,kz+.5);}
// Glazed control/live separation. A 32-unit open doorway at the front stays usable.
const split=b.w*.62;for(const r of p.partition){const x=r.x-b.x+.6,z=r.y-b.y+r.h/2;box(wood,1.4,5,r.h,x,4,z);box(glass,.2,30,r.h,x,22,z);box(wood,1.5,2,r.h,x,38,z);for(const zz of [r.y-b.y,r.y-b.y+r.h])box(wood,1.5,38,1, x,20,zz);}
box(wood,1.7,5,32,split+.6,39.5,b.h-28);
// Cello/violin silhouettes, music stands, boom microphones and overhead diffusion blocks.
for(const [i,r]of p.booth.entries()){const x=r.x-b.x+10,z=r.y-b.y+9;box(fabric,10,2,9,x,7,z+4);box(fabric,10,10,1.5,x,13,z+8);for(const side of [-1,1])box(black,.5,7,.5,x+side*4,3.5,z+6);ball(wood,3,5,1.3,x,12,z);ball(wood,2.2,3.2,1.1,x,17,z);box(black,.65,10,.5,x,23,z);box(wood,1.1,2,.7,x,29,z);for(const off of [-.22,0,.22])box(silver,.035,19,.05,x+off,19,z+1.4);box(black,.2,8,.2,x,4,z);emit(cube,wood,.15,.15,11,x+4,17,z,null,.55,0,.2);
const mx=x+7,mz=z-5;emit(cylinder,black,.35,20,.35,mx,11,mz);for(const a of [0,2.1,4.2])emit(cube,black,6,.25,.3,mx+Math.cos(a)*2,1.5,mz+Math.sin(a)*2,null,0,-a);emit(cube,silver,9,.25,.25,mx-3,22,mz,null,0,0,-.25);emit(cylinder,black,.65,2.3,.65,mx-7,21,mz);box(black,8,.5,6,x-4,13,z-7);box(cream,5,.1,4,x-4,13.35,z-7);emit(cylinder,black,.25,12,.25,x-4,7,z-7);}
for(let x=split+5;x<b.w-4;x+=4)for(let row=0;row<5;row++){const h=3+(Math.floor(x)+row*7)%5;box(wood,3,h,1.1,x,9+row*7,4.5);}
// Floor cables stay flush and decorative, not new trip or collision mechanics.
for(let i=0;i<3;i++){const curve=new T.CatmullRomCurve3([new T.Vector3(b.x+dx-5+i,1.35,b.y+dz+10),new T.Vector3(b.x+dx-12,1.35,b.y+dz+23),new T.Vector3(b.x+10,1.35,b.y+62+i)]);const cable=new T.Mesh(new T.TubeGeometry(curve,12,.10,4,false),black);cable.userData.noBatch=true;root.add(cable);}
if(sign)sign(root,'CRESCENT RECORDS / CONTROL ROOM',Math.min(80,b.w*.52),4,b.x+b.w*.29,43,b.y+4.5,'#e6d3a5');
else if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=1024;c.height=128;const a=c.getContext('2d');a.fillStyle='#242b31';a.fillRect(0,0,1024,128);a.fillStyle='#ead4a6';a.font='bold 38px sans-serif';a.textAlign='center';a.fillText('CRESCENT RECORDS / CONTROL ROOM',512,76,1000);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;textures.push(t);const m=new T.Mesh(new T.PlaneGeometry(Math.min(80,b.w*.52),4),new T.MeshBasicMaterial({map:t}));m.position.set(b.x+b.w*.29,43,b.y+4.5);m.userData.noBatch=true;root.add(m);}
for(const [m,geos]of batches)for(const [geo,list]of geos){const mesh=new T.InstancedMesh(geo,m,list.length);mesh.userData.noBatch=true;list.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.rotation.set(v.rx,v.ry,v.rz);dummy.scale.set(v.w,v.h,v.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);if(v.tint)mesh.setColorAt(i,color.set(v.tint));});root.add(mesh);}
root.userData.recordingStudio={channels,modules,panels,instruments:3,microphones:2,textures:textures.length};return {root,plan:p,solids:p.solids};
}
const api={matches,plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29RecordingStudio=api;
})();
