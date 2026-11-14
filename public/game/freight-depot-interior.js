'use strict';
(function(){
function matches(v){return v?.depth==='rail';}
function plan(b){const rect=(x,y,w,h,kind)=>({x:b.x+x,y:b.y+y,w,h,kind});const counter=rect(b.w*.56,24,b.w*.35,15,'service-counter'),racks=[rect(7,22,14,b.h*.60,'packing-rack'),rect(34,6,b.w*.39,12,'wall-stock'),rect(b.w-21,57,14,b.h*.49,'accessory-rack')],islands=[rect(b.w*.19,b.h*.55,52,33,'flat-boxes'),rect(b.w*.62,b.h*.55,45,36,'cartons')],cart=rect(b.w-58,b.h-40,18,20,'hand-truck'),blankets=rect(32,b.h-40,21,23,'moving-blankets');const wardrobe=rect(b.w-44,11.5,20,21,'wardrobe-cartons'),dividers=rect(31.5,b.h*.49-9,9,18,'flat-dividers');return {counter,racks,islands,cart,blankets,solids:[counter,...racks,...islands,cart,blankets,wardrobe,dividers],entry:{x:b.x+b.w/2,y:b.y+b.h},service:{x:b.x+b.w/2,y:b.y+b.h*.35}};}
function build(T,b,{base=0,sign=null}={}){const p=plan(b),root=new T.Group();root.name='Crescent Freight Depot · moving / packing supplies';const batches=new Map(),textures=[];
 function texture(kind){const n=128,a=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const noise=((x*17+y*29+x*y)%19)-9;let v=235+noise*.5;if(kind==='cardboard'){v=224+noise+Math.sin(x*1.9)*3;if(x<2||y<2)v=164;}if(kind==='floor')v=215+noise*.6;if(kind==='ceiling'&&(x<2||y<2))v=176;if(kind==='label'){v=240;if(y>12&&y<29)v=175;if(y>48&&y<67)v=205;if(y>90&&y<112&&x>18&&x<110)v=x%5<2?70:245;}a.set([v,v,v,255],(y*n+x)*4);}const t=new T.DataTexture(a,n,n);t.encoding=T.sRGBEncoding;t.wrapS=t.wrapT=T.RepeatWrapping;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.needsUpdate=true;textures.push(t);return t;}
 const mat=(c,o={})=>new T.MeshStandardMaterial({color:c,roughness:.8,...o}),cardboard=mat('#bb9157',{map:texture('cardboard')}),edge=mat('#755e3d'),paper=mat('#eee9d9'),green=mat('#32634c'),floor=mat('#54775c',{map:texture('floor'),roughness:.4}),steel=mat('#879696',{metalness:.7,roughness:.32}),black=mat('#222e2b'),cream=mat('#dfd8bb'),white=mat('#e6e7db'),orange=mat('#bf6237'),blanket=mat('#48565e',{roughness:1}),products=mat('#ffffff',{map:texture('label')}),ceiling=mat('#d9dacd',{map:texture('ceiling')}),glow=new T.MeshBasicMaterial({color:'#fff6d8'}),screen=new T.MeshBasicMaterial({color:'#739d9a'});floor.map.repeat.set(12,9);ceiling.map.repeat.set(b.w/20,b.h/20);
 const cube=new T.BoxGeometry(),cylinder=new T.CylinderGeometry(1,1,1,12),torus=new T.TorusGeometry(1,.3,6,16),dummy=new T.Object3D(),col=new T.Color();dummy.rotation.order='YXZ';let cartons=0,flatBoxes=0,packages=0;
 const emit=(geo,m,w,h,d,x,y,z,rx=0,ry=0,tint=null)=>{if(!batches.has(m))batches.set(m,new Map());const by=batches.get(m);if(!by.has(geo))by.set(geo,[]);by.get(geo).push({w,h,d,x,y,z,rx,ry,tint});};
 const box=(m,w,h,d,x,y,z,tint=null)=>emit(cube,m,w,h,d,x,y,z,0,0,tint);
 box(floor,b.w-6,.25,b.h-6,b.w/2,1.7,b.h/2);box(cream,b.w-6,45,.5,b.w/2,24,3.3);for(const x of [3.4,b.w-3.4]){box(cream,.5,45,b.h-7,x,24,b.h/2);box(green,.7,3,b.h-8,x,3,b.h/2);}
 box(ceiling,b.w-6,.3,b.h-6,b.w/2,49.2,b.h/2);for(let x=30;x<b.w-10;x+=52)for(let z=25;z<b.h-10;z+=52){box(steel,24,.6,12,x,48.7,z);box(glow,23,.2,11,x,48.3,z);}for(const x of [b.w*.3,b.w*.7]){box(white,18,.4,14,x,48.9,50);for(let k=0;k<6;k++)box(black,15,.14,.6,x,48.6,45+k*1.6);}
 function carton(x,y,z,w,h,d){box(cardboard,w,h,d,x,y+h/2,z);box(edge,w+.1,.18,.2,x,y+h+.12,z);box(cream,w*.16,.12,d+.1,x,y+h+.22,z);box(edge,.15,h,.15,x-w/2+.2,y+h/2,z+d/2+.05);box(paper,Math.min(5,w*.4),Math.min(4,h*.4),.12,x-w*.2,y+h*.6,z+d/2+.15);cartons++;}
 // Two separate islands keep the door-to-service lane open through the middle.
 const flat=p.islands[0],fx=flat.x-b.x+26,fz=flat.y-b.y+16.5;for(const dx of [-13,13]){for(let k=0;k<18;k++){box(cardboard,24,.65,31,fx+dx,2.5+k*.7,fz);box(edge,.1,.11,30,fx+dx-11.8,2.6+k*.7,fz);flatBoxes++;}box(green,1,13,31,fx+dx,8.5,fz);}
 const pile=p.islands[1],px=pile.x-b.x+22.5,pz=pile.y-b.y+18;for(const dx of [-11,11])for(const dz of [-8.5,8.5])for(let k=0;k<2;k++)carton(px+dx,2+k*13,pz+dz,20,12.8,16);
 // Open wire gondolas: upright grid, package hooks and orange/green moving-supply cartons.
 for(const [i,r]of p.racks.entries()){const horiz=r.w>r.h,x=r.x-b.x+r.w/2,z=r.y-b.y+r.h/2,run=horiz?r.w:r.h;for(const end of [-1,1])box(black,horiz?.7:r.w,36,horiz?r.h:.7,horiz?x+end*run/2:x,20,horiz?z:z+end*run/2);
  for(const yy of [3,13,23,33]){box(green,r.w,.7,r.h,x,yy,z);const count=Math.floor((run-5)/5);for(let k=0;k<count;k++){const a=-run/2+3+k*5;box(products,horiz?3.7:6,7,horiz?6:3.7,horiz?x+a:x,yy+4,horiz?z:z+a,['#d26d37','#315e4a','#e3dbbd','#444d49'][k%4]);packages++;}}
  for(let a=-run/2+1;a<=run/2;a+=3){box(black,horiz?.14:.14,33,horiz?.14:.14,horiz?x+a:x,20,horiz?z:z+a);}for(let yy=5;yy<36;yy+=4)box(black,horiz?r.w:.14,.14,horiz?.14:r.h,x,yy,z);
 }
 // Rolls of stretch wrap/bubble packing and rows of packing tape sit above the rear rack.
 for(let i=0;i<12;i++){const x=40+i*8;emit(cylinder,i%3?paper:green,1.8,10,1.8,x,41,12);emit(cylinder,edge,.65,10.5,.65,x,41,12);}
 for(let i=0;i<7;i++)emit(torus,orange,1.8,1.8,1.8,42+i*9,19,19,Math.PI/2);
 // Service counter / register / upright display of envelopes, straps and labels.
 const c=p.counter,cx=c.x-b.x+c.w/2,cz=c.y-b.y+7.5;box(cardboard,c.w,13,15,cx,8.5,cz);box(black,c.w+1,1,16,cx,15.5,cz);box(green,c.w-3,2,.7,cx,4,cz+7.9);
 for(const dx of [-c.w*.28,c.w*.28]){box(black,9,.5,6,cx+dx,16.5,cz);box(steel,.8,4,.8,cx+dx,18,cz-1);box(black,12,7,1,cx+dx,22,cz-1);box(screen,10.5,5.5,1.1,cx+dx,22,cz-.4);box(paper,7,.4,4,cx+dx+10,16.6,cz+1);}
 for(let i=0;i<4;i++){box(products,5,6,1,cx-8+i*6,19,cz+5.5,['#b95635','#385c4a','#c9c3a2','#51757d'][i]);packages++;}
 // Folded moving pads, hand truck, upright wardrobe boxes and corrugated moving dividers.
 const pad=p.blankets,bx=pad.x-b.x+10.5,bz=pad.y-b.y+11.5;for(let k=0;k<9;k++){box(blanket,20,1.1,21,bx,2.5+k*1.2,bz);box(white,.3,.14,20,bx-9.5,2.8+k*1.2,bz);}box(black,21,1,22,bx,1.5,bz);
 const cart=p.cart,tx=cart.x-b.x+9,tz=cart.y-b.y+10;for(const dx of [-6,6]){box(steel,1,28,1,tx+dx,16,tz+5);emit(cylinder,black,3,2,3,tx+dx,4,tz+6,Math.PI/2,Math.PI/2);}box(green,16,1,15,tx,2,tz);box(green,13,1,1,tx,30,tz+5);for(const yy of [8,15,23])box(steel,12,.7,.7,tx,yy,tz+5);carton(tx,3,tz-1,13,17,12);
 for(let i=0;i<3;i++)carton(b.w-34,2+i*12,22,20,11.5,21);
 for(let k=0;k<9;k++)box(cardboard,.7,29,18,32+k*.9,16,b.h*.49); // stored flat against left rack, not a new floor island
 for(const x of [fx,px])box(steel,.7,20,.7,x,23,fz-9);
 // Branded signs remain original and read as a shipping-supply business, not copied retail logos.
 for(const [m,by]of batches)for(const [geo,list]of by){const mesh=new T.InstancedMesh(geo,m,list.length);mesh.name=m===cardboard?'Depot · corrugated cartons and flat boxes':'Depot · moving supply fixtures';list.forEach((v,i)=>{dummy.position.set(b.x+v.x,base+v.y,b.y+v.z);dummy.scale.set(v.w,v.h,v.d);dummy.rotation.set(v.rx,v.ry,0);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);if(m===products)mesh.setColorAt(i,col.set(v.tint||'#dfd7bd'));});mesh.userData.noBatch=true;mesh.frustumCulled=false;root.add(mesh);}
 if(sign){sign(root,'CRESCENT FREIGHT · PACK / SHIP',b.w-40,6,b.x+b.w/2,base+43,b.y+4.2,'#f1e5bf');for(const [i,x]of [fx,px].entries()){sign(root,i?'LARGE BOXES':'SMALL / MEDIUM BOXES',42,6,b.x+x,base+34,b.y+fz-9,'#f4efd9');}sign(root,'SERVICE / DISPATCH',c.w-5,5,b.x+cx,base+36,b.y+cz-8,'#f4efd9');}
 root.userData.freight={cartons,flatBoxes,packages,textures:textures.length};return {root,solids:p.solids,plan:p};
}
const api={matches,plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29FreightDepot=api;
})();
