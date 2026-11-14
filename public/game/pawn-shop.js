'use strict';
(function(){
function matches(v){return v.depth==='basepawn'||v.careerBusiness==='pawn';}
function plan(b){const r=(x,y,w,h,kind)=>({x:b.x+x,y:b.y+y,w,h,kind}),cases=[r(5,29,17,b.h-53,'jewelry-case')],racks=[r(b.w-16,26,11,b.h-48,'electronics'),r(5,4,b.w-10,10,'guitars')];return {cases,racks,solids:[...cases,...racks,r(10,18,6,6,'stool')],entry:{x:b.x+b.w/2,y:b.y+b.h},service:{x:b.x+b.w/2,y:b.y+b.h*.35}};}
function build(T,b,{doorW=Math.min(54,b.w*.4),sign}={}){
 const root=new T.Group();root.name='Pawn Shop · jewelry / guitars / electronics';root.userData.noBatch=true;const p=plan(b),batches=new Map(),textures=[];
 const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.76,...extra});
 function texture(kind){const n=128,a=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){let v=225+((x*17+y*29+x*y)%19-9)*.5;if(kind==='wood')v+=Math.sin(x*.28+Math.sin(y*.07))*16;if(kind==='brick'&&(y%32<2||(x+Math.floor(y/32)%2*32)%64<2))v=90;if(kind==='label'&&[78,85,92].includes(y)&&x>20&&x<107)v=54;a.set([v,v,v,255],(y*n+x)*4);}const t=new T.DataTexture(a,n,n);t.encoding=T.sRGBEncoding;t.wrapS=t.wrapT=T.RepeatWrapping;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;textures.push(t);return t;}
 const oak=mat('#a56d42',{map:texture('wood')}),red=mat('#8d3539',{map:texture('brick')}),cream=mat('#dedbcf'),dark=mat('#172127'),black=mat('#20272b'),steel=mat('#a4b1b1',{metalness:.65,roughness:.3}),blue=mat('#275374'),gold=mat('#d3ac50',{metalness:.72,roughness:.27}),silver=mat('#c9d5d6',{metalness:.8,roughness:.22}),product=mat('#ffffff',{map:texture('label')}),felt=mat('#252932'),glass=mat('#bedbd7',{transparent:true,opacity:.13,roughness:.13,depthWrite:false}),glow=new T.MeshBasicMaterial({color:'#fff8dd'}),screen=new T.MeshBasicMaterial({color:'#507889'});
 const cube=new T.BoxGeometry(),cyl=new T.CylinderGeometry(1,1,1,12),sphere=new T.SphereGeometry(1,10,8),torus=new T.TorusGeometry(1,.13,5,14),dummy=new T.Object3D(),col=new T.Color();let products=0,jewelry=0,guitars=0;
 function emit(geo,m,w,h,d,x,y,z,tint=null,rx=0,ry=0,rz=0){if(!batches.has(m))batches.set(m,new Map());const by=batches.get(m);if(!by.has(geo))by.set(geo,[]);by.get(geo).push({w,h,d,x:b.x+x,y,z:b.y+z,tint,rx,ry,rz});}
 const box=(m,w,h,d,x,y,z,tint)=>emit(cube,m,w,h,d,x,y,z,tint),ball=(m,w,h,d,x,y,z,tint)=>emit(sphere,m,w,h,d,x,y,z,tint);
 box(oak,b.w,.8,b.h,b.w/2,.4,b.h/2);for(let x=4;x<b.w;x+=8)box(dark,.08,.03,b.h-4,x,.82,b.h/2);
 box(red,b.w,51,3,b.w/2,26,1.5);for(const x of [1.5,b.w-1.5])box(red,3,51,b.h,x,26,b.h/2);const span=(b.w-doorW)/2;for(const x of [span/2,b.w-span/2])box(red,span,51,3,x,26,b.h-1.5);box(cream,doorW,9,3,b.w/2,47,b.h-1.5);
 const roof=new T.Mesh(new T.BoxGeometry(b.w+2,2,b.h+2),cream);roof.position.set(b.x+b.w/2,53,b.y+b.h/2);roof.userData.noBatch=true;root.add(roof);
 for(let x=4;x<b.w;x+=24)box(steel,.12,.1,b.h-4,x,51,b.h/2);for(let z=4;z<b.h;z+=24)box(steel,b.w-4,.1,.12,b.w/2,51,z);
 for(const x of [b.w*.32,b.w*.72])for(const z of [b.h*.27,b.h*.72]){box(steel,4,.5,24,x,49,z);box(glow,3,.2,22,x,48.6,z);}
 // Glass cases are open volumes, never solid opaque boxes enclosing the merchandise.
 for(const c of p.cases){const x=c.x-b.x+c.w/2,z=c.y-b.y+c.h/2;box(oak,c.w,6,c.h,x,3.8,z);box(felt,c.w-1,.5,c.h-1,x,7.2,z);box(steel,c.w+.3,.6,c.h+.3,x,18,z);box(glass,c.w,.2,c.h,x,18.4,z);for(const side of [-1,1])box(glass,.15,10,c.h,x+side*c.w/2,12.5,z);for(const zz of [c.y-b.y,c.y-b.y+c.h]){box(oak,c.w,11,.8,x,12,zz);box(steel,c.w,1,.9,x,18,zz);}for(let zz=c.y-b.y+12;zz<c.y-b.y+c.h;zz+=16)box(steel,.5,11,.5,x+c.w/2,12,zz);
  for(let zz=c.y-b.y+5;zz<c.y-b.y+c.h-3;zz+=8){box(cream,12,.3,6,x,8,zz);for(let j=0;j<4;j++){emit(torus,j%2?gold:silver,.8,.8,.8,x-4+j*2.5,8.7,zz,null,Math.PI/2);jewelry++;}for(const dx of [-3,3]){emit(torus,gold,1.7,1.7,1.7,x+dx,9,zz+1,null,Math.PI/2);jewelry++;}}
  // Tall necklace busts face the aisle, on top of the existing case footprint.
  for(const zz of [c.y-b.y+13,c.y-b.y+c.h-12]){ball(felt,2.5,4,2,x,23,zz);emit(torus,gold,2.1,2.7,.7,x+2,23,zz,null,0,Math.PI/2);jewelry++;}
 }
 // Back-wall slat board with guitars, boxed cameras and small used electronics.
 box(oak,b.w-10,31,1,b.w/2,24,4.2);for(let y=10;y<39;y+=3)box(dark,b.w-12,.12,.15,b.w/2,y,4.8);
 const n=Math.max(3,Math.floor((b.w-12)/16));for(let i=0;i<n;i++){const x=12+i*(b.w-24)/(n-1),tint=['#a65730','#9e2f38','#d2af69','#284f69'][i%4];guitars++;ball(product,3,4.2,1.1,x,20,7,tint);ball(product,2.3,3,1,x,24,7,tint);box(dark,.9,12,.6,x,32,7);box(oak,1.5,3,.9,x,39,7);for(const dx of [-.25,0,.25])box(silver,.04,18,.07,x+dx,27,8.15);emit(torus,dark,1,1,.2,x,22,8);box(steel,.3,1,3,x,42,5.8);products++;}
 box(cream,b.w-10,.8,10,b.w/2,8,9);for(let i=0;i<Math.floor((b.w-14)/7);i++){const x=9+i*7;box(black,5,3.5,4,x,10.5,9);emit(cyl,steel,1.2,1,1.2,x,10.5,11.4,null,Math.PI/2);box(product,4,1,.1,x,9.7,11.55,'#e0cf78');products++;}
 // Right-hand blue steel racks: stereos, speakers, consoles, power tools and media spines.
 const r=p.racks[0],run=r.h,z0=r.y-b.y,x=b.w-10.5;for(const zz of [z0,z0+run])for(const xx of [b.w-16,b.w-5])box(blue,.8,42,.8,xx,22,zz);
 for(let row=0;row<4;row++){const y=3+row*10;box(oak,11,.8,run,x,y,z0+run/2);box(blue,.7,1.6,run,b.w-16,y,z0+run/2);for(let j=0;j<Math.floor(run/8);j++){const zz=z0+4+j*8;products++;if(row===0){emit(cyl,product,2,5,2,x,6.5,zz,['#d5b630','#b23b33'][j%2],0,0,Math.PI/2);box(black,4,2,3,x,10,zz);}else if(row===2){box(black,6,7,6,x,17+row*7,zz);for(const dy of [-1.5,1.5])emit(cyl,dark,1.3,.3,1.3,b.w-14,17+row*7+dy,zz,null,0,0,Math.PI/2);}else{box(black,6,4.5,6,x,y+3,zz);box(screen,.2,1.7,4,b.w-13.6,y+3,zz);for(let k=0;k<3;k++)box(steel,.2,.3,.3,b.w-13.8,y+2.2,zz-1+k); }box(product,.2,1.7,2,b.w-14,y+4,zz+2.8,'#edce64');}}
 // DVD/game case spines fill an end shelf without adding floor blockers.
 for(let row=0;row<3;row++)for(let i=0;i<14;i++){box(product,6,4,.5,b.w-10,34+row*4.5,z0+2+i*.7,['#b34b4d','#467da0','#d5c17a','#859c6b'][i%4]);products++;}
 // Wall sneaker cubbies above cases, like the jewelry-and-shoes reference.
 for(let j=0;j<Math.floor((b.h-50)/14);j++){const z=36+j*14;box(cream,5,.7,13,5.5,35,z);box(dark,.5,10,13,3.5,40,z);for(const k of [-1,1]){ball(cream,2,1.1,3.6,7,37,z+k*3);box(product,2.6,.5,7,7,36,z+k*3,['#773f44','#233d52'][k===1?0:1]);products++;}}
 // Register and red/chrome stool at the end of the jewelry case; no center-aisle islands.
 const c=p.cases[0],cz=c.y-b.y+8;box(black,7,1.5,6,13,19.5,cz);box(black,6,4,.7,13,22,cz);box(screen,5,2.7,.1,13,22,cz+.4);emit(cyl,steel,2.5,1,2.5,13,2,21);emit(cyl,steel,.4,9,.4,13,6,21);emit(cyl,red,3,1.2,3,13,11,21);
 // Stool lies between the rear bank and case, sharing a small additional collider.
 if(sign){sign(root,'PAWN · JEWELRY · GUITARS · ELECTRONICS',b.w-12,8,b.x+b.w/2,60,b.y+b.h+1,'#e8d2a1');sign(root,'BUY · SELL · TRADE / LOCAL SERVICES',b.w-12,5,b.x+b.w/2,46,b.y+4,'#edddb4');}
 else if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=1024;c.height=128;const a=c.getContext('2d');a.fillStyle='#682d31';a.fillRect(0,0,1024,128);a.fillStyle='#f0dcac';a.font='bold 36px sans-serif';a.textAlign='center';a.fillText('PAWN · JEWELRY · GUITARS · ELECTRONICS',512,54);a.font='24px sans-serif';a.fillText('BUY / SELL / TRADE · LOCAL SERVICES',512,102);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;const m=new T.Mesh(new T.PlaneGeometry(b.w-12,7),new T.MeshBasicMaterial({map:t}));m.position.set(b.x+b.w/2,46,b.y+4);m.userData.noBatch=true;root.add(m);}
 for(const [m,geos]of batches)for(const [geo,list]of geos){const mesh=new T.InstancedMesh(geo,m,list.length);mesh.userData.noBatch=true;list.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.rotation.set(v.rx,v.ry,v.rz);dummy.scale.set(v.w,v.h,v.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);if(v.tint)mesh.setColorAt(i,col.set(v.tint));});root.add(mesh);}
 root.userData.pawn={products,jewelry,guitars};return {root,roof,plan:p,solids:p.solids};
}
const api={matches,plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window==='undefined')return;window.level29PawnShop=api;if(window.level29PawnReview)return;
const old=buildVenue;buildVenue=function(v){if(!matches(v))return old.apply(this,arguments);if(v.mesh?.parent===cityGroup)return;const a=build(THREE,v.b,{doorW:v.doorW,sign:addSign});v.mesh=a.root;v.referencePawn=true;cityGroup.add(v.mesh);v.roof=a.roof;v.furniture=a.solids.slice();v.door=new THREE.Group();v.mesh.add(v.door);v.labelH=76;};
})();
