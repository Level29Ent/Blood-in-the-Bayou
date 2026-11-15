'use strict';
(function(){
const matches=v=>v?.depth==='diner';
function plan(b){const booths=[];for(let i=0;i<3;i++)booths.push({x:b.x+7,y:b.y+18+i*36,w:43,h:28,kind:'booth'});const counter={x:b.x+b.w-40,y:b.y+18,w:30,h:b.h-57,kind:'counter'},stools=[];for(let z=32;z<b.h-34;z+=20)stools.push({x:b.x+b.w-56,y:b.y+z-5,w:10,h:10,kind:'stool'});const jukebox={x:b.x+9,y:b.y+b.h-36,w:18,h:13,kind:'jukebox'};return {booths,counter,stools,jukebox,solids:[...booths,{...counter,h:counter.h+14},...stools,jukebox],entry:{x:b.x+b.w/2,y:b.y+b.h},service:{x:b.x+b.w/2,y:b.y+b.h-40}};}
function build(T,b,{base=0}={}){
 const root=new T.Group();root.name='Creole Night Diner · red vinyl chrome and neon';root.position.y=base;root.userData.noBatch=true;const p=plan(b),batches=new Map(),dummy=new T.Object3D(),textures=[],stats={booths:3,stools:p.stools.length,burgers:0,shakes:0,jukebox:1};
 const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.7,...extra}),red=mat('#9e283c',{roughness:.38}),cream=mat('#ebe7d8'),black=mat('#19252b'),steel=mat('#aabdc1',{metalness:.82,roughness:.22}),darkRed=mat('#51232f'),wall=mat('#405560'),wood=mat('#80573d'),green=mat('#4b7556'),bun=mat('#c88b42'),lettuce=mat('#5a8c48'),cheese=mat('#dcb947'),tomato=mat('#a5423c'),meat=mat('#54372e'),white=mat('#f4e8cc'),glass=mat('#71abbc',{metalness:.25,roughness:.22}),cyan=new T.MeshBasicMaterial({color:'#42d9ed'}),neonRed=new T.MeshBasicMaterial({color:'#ff455e'}),amber=new T.MeshBasicMaterial({color:'#ffb865'});
 const cube=new T.BoxGeometry(),cyl=new T.CylinderGeometry(1,1,1,16),sphere=new T.SphereGeometry(1,12,8),torus=new T.TorusGeometry(1,.1,6,20);
 function emit(geo,m,w,h,d,x,y,z,rx=0,ry=0,rz=0){if(!batches.has(m))batches.set(m,new Map());const g=batches.get(m);if(!g.has(geo))g.set(geo,[]);g.get(geo).push({w,h,d,x:b.x+x,y,z:b.y+z,rx,ry,rz});}
 const box=(m,w,h,d,x,y,z)=>emit(cube,m,w,h,d,x,y,z);
 function sign(text,x,y,z,w,h,{rotation=0,bg='#20333c',color='#ffd9bc'}={}){if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1024;c.height=192;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,1024,192);ctx.fillStyle=color;ctx.textAlign='center';ctx.font='bold 75px sans-serif';ctx.fillText(text,512,125,980);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;textures.push(t);const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:t}));m.position.set(b.x+x,y,b.y+z);m.rotation.y=rotation;m.userData.noBatch=true;root.add(m);}
 // Checkerboard is original repeating pixel data, shared on the floor and dado.
 const n=64,data=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const v=(Math.floor(x/32)+Math.floor(y/32))%2?32:229;data.set([v,v,v,255],(y*n+x)*4);}const floorMap=new T.DataTexture(data,n,n);floorMap.encoding=T.sRGBEncoding;floorMap.wrapS=floorMap.wrapT=T.RepeatWrapping;floorMap.magFilter=T.NearestFilter;floorMap.repeat.set((b.w-8)/16,(b.h-8)/16);floorMap.needsUpdate=true;textures.push(floorMap);const tile=mat('#ffffff',{map:floorMap,roughness:.35});
 box(tile,b.w-8,.25,b.h-8,b.w/2,1,b.h/2);box(wall,b.w-8,44,.4,b.w/2,24,3.6);for(const x of [3.6,b.w-3.6])box(wall,.4,44,b.h-8,x,24,b.h/2);
 // Individual black/white wall tiles avoid stretching the floor texture on wall bands.
 for(let row=0;row<3;row++)for(let i=0;i<Math.floor((b.w-8)/5);i++)box((i+row)%2?black:cream,5,5,.25,6.5+i*5,5+row*5,4);
 for(const side of [-1,1]){const x=side<0?4:b.w-4;for(let row=0;row<3;row++)for(let i=0;i<Math.floor((b.h-8)/5);i++)box((i+row)%2?black:cream,.25,5,5,x,5+row*5,6.5+i*5);box(steel,.6,1,b.h-8,x,17,b.h/2);box(cyan,.4,.5,b.h-10,x,43,b.h/2);}
 box(steel,b.w-8,1,.6,b.w/2,17,4);box(neonRed,b.w-8,.6,.4,b.w/2,44,4);
 // Three red vinyl booth bays with cream piping, chrome tables and condiment sets.
 function condiments(x,y,z){emit(cyl,red,.45,2.7,.45,x-1,y+1.35,z);emit(cyl,cheese,.45,2.5,.45,x+1,y+1.25,z);box(steel,2,1.5,1.5,x,y+.8,z+2);box(white,1.6,.6,.1,x,y+1.6,z+2.8);}
 for(const r of p.booths){const x=r.x-b.x+r.w/2,z=r.y-b.y+r.h/2;for(const side of [-1,1]){box(red,40,6,7,x,5,z+side*10);box(darkRed,42,15,2,x,9,z+side*13);box(red,40,12,2,x,12,z+side*12);box(cream,40,.3,.3,x,18.1,z+side*10.8);for(let j=0;j<4;j++)box(darkRed,.25,8,.15,x-14+j*9.3,12,z+side*10.9);}
 box(steel,35,.7,11,x+1,12,z);box(cream,34,.5,10,x+1,12.7,z);emit(cyl,steel,1,10,1,x+1,6,z);emit(cyl,steel,5,.6,4,x+1,1.6,z);condiments(x-10,13,z);box(glass,.2,15,25,4.3,29,z);for(const zz of [-12.5,12.5])box(cyan,.3,16,.4,4.7,29,z+zz);for(const yy of [21,37])box(cyan,.3,.4,25,4.7,yy,z);}
 const c=p.counter,x=c.x-b.x+c.w/2,z=c.y-b.y+c.h/2;box(darkRed,c.w,12,c.h,x,7,z);box(steel,c.w+1,1,c.h+1,x,14,z);box(cream,c.w, .6,c.h,x,14.8,z);for(let yy=3;yy<13;yy+=2)box(steel,.2,.3,c.h,c.x-b.x-.2,yy,z);
 // Rounded end cap echoes a traditional curved lunch counter.
 emit(cyl,cream,c.w/2,.6,c.w/2,x,14.8,c.y-b.y+c.h-1);emit(cyl,steel,c.w/2+.5,.5,c.w/2+.5,x,14.2,c.y-b.y+c.h-1);
 for(const r of p.stools){const xx=r.x-b.x+5,zz=r.y-b.y+5;emit(cyl,steel,4.4,.8,4.4,xx,1.7,zz);emit(cyl,steel,.7,8,.7,xx,6,zz);emit(torus,steel,2.8,2.8,2.8,xx,5.5,zz,Math.PI/2);emit(cyl,red,4.5,1.6,4.5,xx,10.8,zz);emit(torus,cream,4.25,4.25,4.25,xx,11,zz,Math.PI/2);}
 function burger(xx,y,zz){emit(cyl,white,2.2,.25,2.2,xx,y,zz);emit(sphere,bun,1.8,.65,1.8,xx,y+.7,zz);emit(cyl,meat,1.75,.4,1.75,xx,y+1.25,zz);box(cheese,3.4,.12,3.4,xx,y+1.52,zz);emit(cyl,lettuce,1.85,.2,1.85,xx,y+1.7,zz);emit(sphere,bun,1.8,.9,1.8,xx,y+2.4,zz);stats.burgers++;}
 for(let i=0;i<3;i++){const zz=30+i*28;burger(x-4,15.2,zz);emit(cyl,white,.65,3,.65,x+3,16.7,zz);emit(sphere,white,.8,.6,.8,x+3,18.5,zz);box(neonRed,.1,3,.1,x+3.2,19.2,zz);stats.shakes++;condiments(x-8,15.2,zz+7);}
 // Back-bar equipment, menu signs and original roadside artwork.
 box(steel,c.w-4,16,16,x,9,14);box(black,16,10,1,x,12,22.3);box(steel,10,2,8,x,6,25);for(const side of [-1,1])emit(cyl,black,2.2,5,2.2,x+side*4,21,16);box(black,7,5,1,x-7,19,35);box(cyan,6,4,.1,x-7,19,35.6);
 sign('BURGERS • SHAKES • PIE',b.w/2,35,4.5,60,6);sign('CREOLE NIGHT DINER',b.w/2,43,4.6,82,6,{color:'#ff7884'});sign('OPEN LATE',4.8,30,b.h-30,30,6,{rotation:Math.PI/2,color:'#ff5b72'});
 for(let i=0;i<3;i++){const xx=58+i*23;box(steel,18,12,.6,xx,24,4.5);box(cream,16,10,.1,xx,24,4.9);box([cyan,amber,neonRed][i],13,1,.1,xx,25.5,5);box([green,tomato,bun][i],12,3,.1,xx,22.7,5);}
 // Arched jukebox is static scenery; music controls keep using the existing game systems.
 const j=p.jukebox,jx=j.x-b.x+j.w/2,jz=j.y-b.y+j.h/2;box(wood,17,19,11,jx,11,jz);emit(cyl,wood,8.5,11,8.5,jx,20,jz,Math.PI/2);box(black,13,17,.3,jx,12,jz+5.7);for(let i=0;i<7;i++)box(steel,11,.25,.2,jx,5+i*1.5,jz+5.9);for(const side of [-1,1]){box(neonRed,.8,18,.5,jx+side*7.2,12,jz+6);box(amber,.5,17,.5,jx+side*5.8,12,jz+6.2);}for(let i=0;i<17;i++){const a=i*Math.PI/16;emit(sphere,i%2?amber:neonRed,.7,.7,.5,jx+Math.cos(a)*7.2,20+Math.sin(a)*7.2,jz+6);}for(let i=0;i<6;i++)box(cream,1.3,3,.2,jx-4+i*1.6,19,jz+6.2);sign('JUKE BOX',jx,12,jz+6.3,10,2.5,{bg:'#54262e',color:'#ffdc8c'});
 for(const xx of [b.w*.28,b.w*.72])for(let zz=32;zz<b.h-15;zz+=42){box(steel,.2,4,.2,xx,46,zz);emit(cyl,red,4,1.8,4,xx,43,zz);emit(cyl,amber,3.5,.2,3.5,xx,42,zz);}
 for(const [m,geos]of batches)for(const [geo,items]of geos){const mesh=new T.InstancedMesh(geo,m,items.length);mesh.userData.noBatch=true;items.forEach((a,i)=>{dummy.position.set(a.x,a.y,a.z);dummy.rotation.set(a.rx,a.ry,a.rz);dummy.scale.set(a.w,a.h,a.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});root.add(mesh);}
 root.userData.nightDiner={...stats,textures:textures.length};return {root,solids:p.solids};
}
const api={matches,plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29NightDiner=api;
})();
