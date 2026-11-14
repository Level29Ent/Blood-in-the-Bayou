'use strict';
(function(){
function plan(b,dir=1){const flip=r=>dir===-1?{...r,x:2*b.x+b.w-r.x-r.w,y:2*b.y+b.h-r.y-r.h}:r;return {solids:[{x:b.x+3,y:b.y+18,w:17,h:b.h-33,kind:'electronics-counter'},{x:b.x+b.w-20,y:b.y+18,w:17,h:b.h-33,kind:'gift-shelves'},{x:b.x+3,y:b.y+3,w:b.w-6,h:11,kind:'accessory-wall'},{x:b.x+5,y:b.y+b.h-13,w:17,h:10,kind:'tablet-podium'},{x:b.x+b.w-22,y:b.y+b.h-13,w:17,h:10,kind:'plush-tower'}].map(flip)};}
function build(T,b,{base=0,dir=1}={}){
 const root=new T.Group();root.name='Tech & Gifts · electronics showroom and souvenir boutique';root.position.set(b.x,base,b.y);if(dir===-1){root.rotation.y=Math.PI;root.position.set(b.x+b.w,base,b.y+b.h);}root.userData.noBatch=true;const batches=new Map(),dummy=new T.Object3D(),tint=new T.Color(),cube=new T.BoxGeometry(1,1,1),sphere=new T.SphereGeometry(1,12,8),cyl=new T.CylinderGeometry(1,1,1,16),ring=new T.TorusGeometry(1,.2,6,16);
 const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.75,...extra}),white=mat('#e6e6db'),oak=mat('#a88453'),wood=mat('#7c603c'),dark=mat('#20282c'),silver=mat('#a3aeb0',{metalness:.65,roughness:.35}),black=mat('#101a21'),stock=mat('#ffffff'),plush=mat('#ffffff'),glass=mat('#bbd9d9',{transparent:true,opacity:.12,depthWrite:false,roughness:.2}),glow=new T.MeshBasicMaterial({color:'#fff1d0'}),screen=new T.MeshBasicMaterial({color:'#ffffff'}),colors=['#699fa8','#c56d8d','#d4bb70','#788c58','#7296c4','#ede0bc','#9d7865','#78567e'];let laptops=0,tablets=0,monitors=0,packages=0,toys=0,mugs=0,bottles=0,bags=0;
 function emit(g,m,x,y,z,sx,sy,sz,rot=[0,0,0],color){dummy.position.set(x,y,z);dummy.rotation.set(...rot);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();if(!batches.has(g))batches.set(g,new Map());const by=batches.get(g);if(!by.has(m))by.set(m,[]);by.get(m).push({matrix:dummy.matrix.clone(),color});}
 const box=(m,w,h,d,x,y,z,c)=>emit(cube,m,x,y,z,w,h,d,undefined,c),ball=(m,x,y,z,rx,ry,rz,c)=>emit(sphere,m,x,y,z,rx,ry,rz,undefined,c);
 function laptop(x,y,z,i){box(silver,7.5,.45,5.3,x,y,z);box(dark,6.5,.08,2.7,x,y+.28,z-.4);for(let j=0;j<3;j++)box(silver,6,.1,.12,x,y+.35,z-1.3+j*.7);box(silver,2,.08,.9,x,y+.29,z+1.7);box(black,7.7,5.5,.45,x,y+3,z-2.5);box(screen,6.7,4.5,.1,x,y+3,z-2.2,colors[i%8]);box(screen,3,1.3,.12,x-1.5,y+3.6,z-2.12,colors[(i+2)%8]);box(screen,2,1.5,.12,x+1.5,y+2.1,z-2.11,colors[(i+4)%8]);box(white,.7,.5,1.8,x+5.1,y+.3,z+1.1);laptops++;}
 function tablet(x,y,z,i){box(silver,3.5,.3,3,x,y,z);box(silver,.55,3,.55,x,y+1.5,z-.5);box(black,4.5,6,.4,x,y+4,z-.5);box(screen,3.8,5,.08,x,y+4,z-.25,colors[i%8]);box(screen,2.9,1.7,.09,x,y+4.8,z-.18,colors[(i+3)%8]);tablets++;}
 function monitor(x,y,z,i){box(silver,5,.35,3,x,y,z);box(silver,.7,4,.7,x,y+2,z);box(black,10,7,.5,x,y+7,z);box(screen,8.8,5.8,.1,x,y+7,z+.31,colors[i%8]);box(dark,8,.3,2.5,x,y+.35,z+3);monitors++;}
 function packageBox(x,y,z,i){box(stock,3.4,4.6,1,x,y,z,colors[i%8]);box(white,2.8,.8,1.1,x,y+1.4,z+.05);box(black,1.7,2.5,.12,x,y-.2,z+.56);box(screen,1.3,1.8,.13,x,y-.1,z+.65,colors[(i+3)%8]);box(dark,.3,.4,.4,x,y+2.7,z);packages++;}
 function bear(x,y,z,i){const c=colors[i%8];ball(plush,x,y+2,z,1.8,2,1.4,c);ball(plush,x,y+4.8,z,1.6,1.5,1.4,c);for(const side of [-1,1]){ball(plush,x+side*1.2,y+5.8,z,.65,.7,.5,c);ball(plush,x+side*1.9,y+2.5,z,.6,1.1,.6,c);ball(plush,x+side*1.05,y+.6,z+.7,.85,.7,1,c);ball(black,x+side*.55,y+5,z+1.22,.13,.16,.12);}ball(white,x,y+4.3,z+1.25,.7,.5,.3);ball(black,x,y+4.5,z+1.5,.22,.15,.1);toys++;}
 const w=b.w,h=b.h;
 box(mat('#727b79'),w-4,.15,h-4,w/2,1.65,h/2);for(let x=5;x<w-3;x+=12)box(silver,.08,.02,h-4,x,1.75,h/2);
 // White electronics counters on one side, warm gift shelving on the other.
 const left=11.5,right=w-11.5,run=h-33;
 box(white,17,1,run,left,2.5,h/2+1.5);for(const z of [18.7,h-15.7])box(white,17,10,1.4,left,8,z);box(white,18,.7,run+1,left,14,h/2+1.5);for(let i=0;i<3;i++)laptop(left,14.7,23+i*10,i);
 for(let i=0;i<2;i++){box(dark,6,10,9,left-3,6.5,27+i*17);box(screen,.1,.4,2.5,left+.06,9,27+i*17,colors[i]);}
 box(oak,17,33,1,right,18,h/2-16);for(const x of [right-8,right+8])box(wood,.7,33,run,x,18,h/2+1.5);
 for(let row=0;row<3;row++){const y=4+row*10;box(oak,17,.65,run,right,y,h/2+1.5);box(wood,.5,2,run,right-8.2,y+1,h/2+1.5);for(let j=0;j<4;j++){const z=21+j*8;if(row===0)bear(right,y+.4,z,j+row);else if(row===1){emit(cyl,stock,right,y+2,z,1.3,3.4,1.3,undefined,colors[j]);emit(cyl,dark,right,y+3.75,z,1,.12,1);emit(ring,stock,right,y+2,z+1.3,.85,.85,.85,[0,Math.PI/2,0],colors[j]);mugs++;}else{box(stock,4,4.5,2,right,y+2.6,z,colors[j]);emit(ring,wood,right,y+5,z,1.1,1.1,1.1);bags++;}}}
 // Back-wall slatwall packs, monitor gallery and accessory bins.
 box(oak,w-4,37,.45,w/2,23,1.7);for(let y=6;y<40;y+=3)box(wood,w-5,.12,.15,w/2,y,2.1);
 for(let row=0;row<3;row++)for(let j=0;j<Math.floor((w-12)/5);j++)packageBox(7+j*5,10+row*8,3.3,j+row*3);
 box(white,w-8,9,9,w/2,6.2,8);for(let i=0;i<5;i++){const x=10+i*(w-20)/4;if(i%2)monitor(x,11.3,8,i);else tablet(x,11.3,9,i);}
 for(let i=0;i<2;i++){const x=w*.3+i*w*.42;box(black,24,12,.8,x,34,3);box(screen,22.5,10.5,.1,x,34,3.5,colors[i*3]);box(screen,12,3,.15,x-3,35,3.6,colors[i*3+2]);}
 // Rounded tablet demo podium at entry, mirrored by a tiered plush gift tower.
 emit(cyl,white,13.5,8,h-8,7.8,13,4.6);emit(cyl,silver,13.5,14.6,h-8,8,.5,4.8);tablet(10,15,h-8,4);tablet(17,15,h-8,2);
 const tx=w-13.5,tz=h-8;emit(cyl,wood,tx,12,tz,.9,21,.9);for(let tier=0;tier<3;tier++){const y=3+tier*8,r=7-tier*.5;emit(cyl,oak,tx,y,tz,r,.8,4.8);for(const side of [-1,1])bear(tx+side*3,y+.5,tz,tier+3);}
 // Bottle/gift baskets below the right-hand displays.
 for(let i=0;i<8;i++){const z=20+i*4;emit(cyl,stock,right+4,2.8,z,.65,2.2,.65,undefined,colors[i%8]);emit(cyl,silver,right+4,4,z,.4,.4,.4);bottles++;}
 // Small glass screen/accessory wall case, simple white ceiling panels and warm downlights.
 box(glass,.15,18,run,right-8.5,28,h/2+1.5);for(const x of [w*.25,w*.75]){box(silver,15,.5,h-8,x,48,h/2);for(const z of [15,35,55]){emit(cyl,white,x,46,z,2.6,1.5,2.6);emit(cyl,glow,x,45.2,z,2.2,.15,2.2);}}
 if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#f0ece0';ctx.fillRect(0,0,1024,128);ctx.fillStyle='#234c57';ctx.textAlign='center';ctx.font='bold 48px sans-serif';ctx.fillText('TECH & GIFTS',512,55);ctx.font='23px sans-serif';ctx.fillText('COMPUTERS · ACCESSORIES · BAYOU SOUVENIRS',512,104);const map=new T.CanvasTexture(c);map.encoding=T.sRGBEncoding;const sign=new T.Mesh(new T.PlaneGeometry(w-12,6),new T.MeshBasicMaterial({map}));sign.position.set(w/2,44,3);sign.userData.noBatch=true;root.add(sign);}
 for(const [g,groups]of batches)for(const [m,items]of groups){const mesh=new T.InstancedMesh(g,m,items.length);mesh.userData.noBatch=true;items.forEach((a,i)=>{mesh.setMatrixAt(i,a.matrix);if(a.color)mesh.setColorAt(i,tint.set(a.color));});root.add(mesh);}
 root.userData.techGifts={laptops,tablets,monitors,packages,plush:toys,mugs,bottles,bags};return {root,solids:plan(b,dir).solids,plan:plan(b,dir)};
}
const api={plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29TechGifts=api;
})();
