'use strict';
(function(){
function matches(v){return v?.infill===true&&v?.name==='CRESCENT LAUNDRY';}
function plan(b){const washers=[16,30,44,58].map(z=>({x:b.x+4,y:b.y+z-6.5,w:14,h:13,kind:'washer'})),dryers=[16,30,44,58].map(z=>({x:b.x+b.w-18,y:b.y+z-6.5,w:14,h:13,kind:'stacked-dryer'})),table={x:b.x+b.w/2-6,y:b.y+50,w:12,h:18,kind:'folding-table'},cart={x:b.x+6,y:b.y+b.h-19,w:10,h:10,kind:'basket-cart'},bench={x:b.x+b.w-16,y:b.y+b.h-20,w:12,h:10,kind:'bench'},vending={x:b.x+24,y:b.y+4,w:16,h:13,kind:'vending'},change={x:b.x+b.w-40,y:b.y+4,w:13,h:8,kind:'change'};return {washers,dryers,table,cart,bench,vending,change,solids:[...washers,...dryers,table,cart,bench,vending,change],entry:{x:b.x+b.w/2,y:b.y+b.h},service:{x:b.x+b.w/2,y:b.y+b.h*.35}};}
function build(T,b,base=0,sign){const root=new T.Group();root.name='Crescent Laundry · stainless wash and fold';const p=plan(b),batches=new Map(),textures=[];
 function texture(kind){const n=128,a=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const noise=((x*17+y*31+x*y)%19)-9;let v=237+noise*.5;if(kind==='metal')v=236+Math.sin(y*1.9)*7+noise*.25;if(kind==='wood')v=228+Math.sin(x*.33+Math.sin(y*.04))*11+noise;if(kind==='floor')v=(Math.floor(x/32)+Math.floor(y/32))%2?170+noise:242+noise*.3;if(kind==='brick')v=216+noise;if(kind==='brick'&&(y%32<2||(x+(Math.floor(y/32)%2)*32)%64<2))v=250;a.set([v,v,v,255],(y*n+x)*4);}const t=new T.DataTexture(a,n,n);t.wrapS=t.wrapT=T.RepeatWrapping;t.encoding=T.sRGBEncoding;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.needsUpdate=true;textures.push(t);return t;}
 const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.72,...extra});
 const steel=mat('#a9b5b7',{map:texture('metal'),metalness:.65,roughness:.3}),silver=mat('#d0d9d7',{metalness:.78,roughness:.23}),dark=mat('#252e32'),cream=mat('#eee8d7'),blue=mat('#304f68'),floor=mat('#dbe3dd',{map:texture('floor'),roughness:.45}),wood=mat('#c59860',{map:texture('wood')}),brick=mat('#b98868',{map:texture('brick')}),glass=mat('#1e343b',{metalness:.22,roughness:.13}),cloth=mat('#a1bdc0',{roughness:.98}),yellow=mat('#e0aa36'),green=mat('#447357'),labels=new T.MeshBasicMaterial({color:'#9dd1d4'}),glow=new T.MeshBasicMaterial({color:'#fff8dc'});floor.map.repeat.set(6,6);brick.map.repeat.set(3,2);
 const cube=new T.BoxGeometry(),cylGeo=new T.CylinderGeometry(1,1,1,20),torus=new T.TorusGeometry(1,.13,6,24),sphere=new T.SphereGeometry(1,10,6),dummy=new T.Object3D();dummy.rotation.order='YXZ';
 const emit=(geo,m,w,h,d,x,y,z,rx=0,ry=0,color=null)=>{if(!batches.has(m))batches.set(m,new Map());const by=batches.get(m);if(!by.has(geo))by.set(geo,[]);by.get(geo).push({w,h,d,x,y,z,rx,ry,color});};
 const box=(m,w,h,d,x,y,z,color=null)=>emit(cube,m,w,h,d,x,y,z,0,0,color);
 box(floor,b.w-6,.18,b.h-6,b.w/2,1.3,b.h/2);
 box(brick,b.w-7,21,.45,b.w/2,31,3.3);for(const x of [3.4,b.w-3.4]){box(cream,.5,46,b.h-8,x,25,b.h/2);box(blue,.6,3,b.h-8,x,3,b.h/2);box(wood,.7,2,b.h-8,x,43,b.h/2);}
 // Dark suspended ceiling grid, warm panel lights and wall-mounted ventilation.
 box(dark,b.w-6,.3,b.h-6,b.w/2,50.1,b.h/2);for(const x of [22,b.w/2,b.w-22])for(const z of [18,46,77]){box(silver,12,.6,8,x,49.5,z);box(glow,11,.2,7,x,49.1,z);}
 for(const x of [26,b.w-26]){box(silver,12,7,1,x,43,3.7);for(let k=0;k<5;k++)box(dark,10,.4,1.2,x,40.8+k,4);}
 function machine(x,z,angle,dryer=false,upper=false,index=0){const yy=(upper?19:0)+1.5;
  const emitLocal=(geo,m,w,h,d,lx,y,lz,rx=0)=>{const co=Math.cos(angle),si=Math.sin(angle);emit(geo,m,w,h,d,x+co*lx+si*lz,yy+y,z-si*lx+co*lz,rx,angle);};
  const bx=(m,w,h,d,lx,y,lz)=>emitLocal(cube,m,w,h,d,lx,y,lz);
  bx(steel,12.8,17,11.7,0,9,0);bx(dark,12.5,2.7,.35,0,16.3,6);bx(blue,2.3,.9,.4,-4.4,16.3,6.25);bx(labels,2.5,1.2,.42,-1.3,16.3,6.25);bx(silver,.7,1.4,.5,2.5,16.4,6.3);bx(dark,.35,.9,.6,2.5,16.4,6.65);bx(yellow,.6,.6,.55,4.3,16.3,6.4);
  // Recessed round porthole, chrome annular rim, black gasket, drum and door handle.
  emitLocal(cylGeo,dark,4.6,.5,4.6,0,8.4,6.15,Math.PI/2);emitLocal(torus,silver,4.65,4.65,4.65,0,8.4,6.6);emitLocal(torus,dark,3.95,3.95,3.95,0,8.4,6.8);emitLocal(cylGeo,glass,3.75,.22,3.75,0,8.4,6.85,Math.PI/2);
  emitLocal(torus,steel,2.9,2.9,2.9,0,8.4,7.02);for(let k=0;k<8;k++){const a=k*Math.PI/4;emitLocal(sphere,dark,.18,.18,.12,Math.cos(a)*2.7,8.4+Math.sin(a)*2.7,7.1);}
  if(!dryer){emitLocal(sphere,cloth,1.7,.7,.15,-.7,6.7,7.1);emitLocal(sphere,cream,1.4,.65,.13,1,7.2,7.13);}bx(silver,.7,3.8,.8,4.6,8.3,7.2);bx(dark,11.8,1.5,11.5,0,.4,0);bx(blue,1.7,.6,.35,-4.5,13.9,6.1);
  for(const side of [-1,1])bx(silver,.18,15,.15,side*6.25,8.7,5.85);
 }
 for(const [i,r]of p.washers.entries())machine(10,r.y-b.y+6.5,Math.PI/2,false,false,i);
 for(const [i,r]of p.dryers.entries()){machine(b.w-10,r.y-b.y+6.5,-Math.PI/2,true,false,i);machine(b.w-10,r.y-b.y+6.5,-Math.PI/2,true,true,i);box(steel,11.7,2.2,12.8,b.w-10,20,r.y-b.y+6.5);}
 // Folding table has thin wood top, visible legs and towels; compact cart remains off the doorway.
 const t=p.table,tx=t.x-b.x+6,tz=t.y-b.y+9;box(wood,12,1.2,18,tx,12,tz);for(const dx of [-4.7,4.7])for(const dz of [-7,7])box(dark,.8,10,.8,tx+dx,6.3,tz+dz);for(let i=0;i<3;i++)box(i%2?cream:cloth,6,.55,4,tx,13.1+i*.6,tz-4);box(yellow,9,6,5,tx,5,tz);
 const cart=p.cart,cx=cart.x-b.x+5,cz=cart.y-b.y+5;box(blue,11,.5,11,cx,11,cz);for(const dx of [-5,5])for(const dz of [-5,5]){box(silver,.3,10,.3,cx+dx,7,cz+dz);emit(cylGeo,dark,.9,1,.9,cx+dx,2,cz+dz,Math.PI/2);}
 for(let y=6;y<=11;y+=1.3){for(const dz of [-5,5])box(silver,10,.13,.13,cx,y,cz+dz);for(const dx of [-5,5])box(silver,.13,.13,10,cx+dx,y,cz);}for(let k=-4;k<=4;k+=1.4){for(const dz of [-5,5])box(silver,.13,5,.13,cx+k,8.5,cz+dz);for(const dx of [-5,5])box(silver,.13,5,.13,cx+dx,8.5,cz+k);}box(blue,10,.6,.8,cx,13,cz+5);box(silver,8,.4,8,cx,4,cz);
 const bench=p.bench,bx=bench.x-b.x+6,bz=bench.y-b.y+5;box(yellow,12,2,9,bx,7,bz);for(const dx of [-4,4])box(dark,1,5,7,bx+dx,3.5,bz);box(yellow,12,7,1,bx,11,bz+4);
 // Back wall vending machines and a separate coin/change cabinet.
 const v=p.vending,vx=v.x-b.x+8;box(dark,16,26,11,vx,14,9.5);box(silver,7,23,.4,vx-3.8,14,15.2);box(glass,6,19,.4,vx-3.8,15,15.5);for(let row=0;row<4;row++)for(let n=0;n<3;n++)box(n%2?cream:green,1.4,2.5,1,vx-6+n*2,8+row*4,15.8);box(labels,4,4,.5,vx+4,20,15.3);box(silver,.6,1.5,.5,vx+4,15.5,15.3);box(dark,4,3,.5,vx+4,7,15.6);
 const change=p.change,mx=change.x-b.x+6.5;box(green,13,21,8,mx,12,8);box(cream,11,7,.5,mx,18,12.3);box(dark,4,2,.6,mx,9,12.5);for(const dx of [-3,3]){box(silver,2,3,.5,mx+dx,13,12.6);box(dark,.3,1.3,.6,mx+dx,13,12.9);}
 for(const [m,by]of batches)for(const [geo,list]of by){const mesh=new T.InstancedMesh(geo,m,list.length);mesh.name=m===glass?'Laundry · circular washer windows':m===silver?'Laundry · chrome doors and cart':'Laundry · fixtures';list.forEach((v,i)=>{dummy.position.set(b.x+v.x,base+v.y,b.y+v.z);dummy.scale.set(v.w,v.h,v.d);dummy.rotation.set(v.rx,v.ry,0);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.frustumCulled=false;mesh.userData.noBatch=true;root.add(mesh);}
 if(sign){sign(root,'WASH · DRY · FOLD',b.w-14,5,b.x+b.w/2,base+35,b.y+4.8,'#f0d4a7');sign(root,'CHANGE',11,2,b.x+mx,base+24,b.y+12.7,'#e4e9d6');}
 root.userData.laundry={washers:4,dryers:8,carts:1,foldingTables:1,textures:textures.length};return {root,solids:p.solids,plan:p};
}
const api={matches,plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29LaundryInterior=api;
})();
