'use strict';
(function(){
function plan(b){return {counter:{x:b.x+12,y:b.y+23,w:b.w-24,h:14,kind:'order-counter'},cooler:{x:b.x+7,y:b.y+49,w:14,h:18,kind:'cooler'},solids:[{x:b.x+12,y:b.y+23,w:b.w-24,h:14,kind:'order-counter'},{x:b.x+7,y:b.y+49,w:14,h:18,kind:'cooler'}],entry:{x:b.x+b.w/2,y:b.y+b.h},owner:{x:b.x+b.w/2,y:b.y+13},service:{x:b.x+b.w/2,y:b.y+b.h-24}};}
function build(T,b,{base=0}={}){
const root=new T.Group();root.name='Felicia Snowballs · green bamboo order counter';root.position.y=base;root.userData.noBatch=true;const p=plan(b),batches=new Map(),textures=[];
const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.8,...extra});
function map(kind){const n=128,a=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){let v=230+((x*17+y*23+x*y)%17-8);if(kind==='bamboo')v+=Math.sin(x*.8)*16+(y%40<2?-12:0);if(kind==='tile'&&(x<2||y<2))v=165;a.set([v,v,v,255],(y*n+x)*4);}const t=new T.DataTexture(a,n,n);t.encoding=T.sRGBEncoding;t.wrapS=t.wrapT=T.RepeatWrapping;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;textures.push(t);return t;}
const green=mat('#55a32e'),bamboo=mat('#cda665',{map:map('bamboo')}),tile=mat('#d0c6ad',{map:map('tile')}),white=mat('#ecece2'),steel=mat('#aebcb9',{metalness:.6,roughness:.35}),dark=mat('#1b292b'),wood=mat('#986a3b'),product=mat('#ffffff'),glass=mat('#c4dedd',{transparent:true,opacity:.16,depthWrite:false,roughness:.15}),glow=new T.MeshBasicMaterial({color:'#f8ffea'});tile.map.repeat.set(b.w/18,b.h/18);bamboo.map.repeat.set(b.w/12,1);
const cube=new T.BoxGeometry(),cylinder=new T.CylinderGeometry(1,1,1,12),sphere=new T.SphereGeometry(1,10,8),cone=new T.ConeGeometry(1,1,6),dummy=new T.Object3D(),color=new T.Color();let bottles=0;
function emit(geo,m,w,h,d,x,y,z,tint=null,rx=0,rz=0){if(!batches.has(m))batches.set(m,new Map());const by=batches.get(m);if(!by.has(geo))by.set(geo,[]);by.get(geo).push({w,h,d,x:b.x+x,y,z:b.y+z,tint,rx,rz});}
const box=(m,w,h,d,x,y,z,tint)=>emit(cube,m,w,h,d,x,y,z,tint);
box(tile,b.w-6,.2,b.h-6,b.w/2,2.15,b.h/2);box(green,b.w-6,36,.2,b.w/2,20,3.2);for(const x of [3.2,b.w-3.2])box(green,.2,36,b.h-6,x,20,b.h/2);
// Reed-faced counter and orange hatch backdrop; keep owner's original back-counter space clear.
const cw=b.w-24,cx=b.w/2;box(bamboo,cw,12,14,cx,7,30);box(steel,cw+1,1,15,cx,13.5,30);box(wood,cw+1,1,1,cx,2.5,37.5);for(let x=13;x<b.w-12;x+=1.4)box(wood,.12,10,.15,x,7,37.1);
box(wood,cw+4,16,1,cx,27,5);for(const x of [11,b.w-11])box(bamboo,2,18,2,x,27,12);box(bamboo,cw+8,3,20,cx,38,11);for(let x=9;x<b.w-8;x+=1.2)emit(cone,bamboo,.55,5,1.2,x,37.5,20,null,0,.12*Math.sin(x));
// Two rows of colored syrup bottles, white pump collars, plungers and horizontal spouts.
const flavors=['#c6445f','#e6a232','#58a58d','#8b5b9d','#b63f32','#5e98b6'];const n=Math.max(6,Math.floor(cw/4.5));for(let row=0;row<2;row++)for(let i=0;i<n;i++){const x=15+i*(cw-6)/Math.max(1,n-1),z=27+row*5;bottles++;emit(cylinder,product,1.1,4.2,1.1,x,16,z,flavors[i%6]);emit(sphere,product,1.1,.7,1.1,x,18.1,z,flavors[i%6]);emit(cylinder,white,.5,2,.5,x,19.2,z);box(white,.35,1.3,.35,x,20.5,z);box(white,.35,.35,2,x,21.2,z+.8);box(white,.9,1.2,.1,x,16.5,z+1.13);}
// Cup towers and finished cups of shaved ice, never a new weapon or purchase mechanic.
for(const x of [b.w-19,b.w-24])for(let i=0;i<6;i++)emit(cylinder,white,1.2,.55,1.2,x,14.7+i*.45,35);for(const [i,x]of [18,b.w/2,b.w-18].entries()){emit(cylinder,product,1.6,3.4,1.6,x,15.8,36,flavors[i*2]);emit(sphere,white,1.7,1.6,1.7,x,18,36);emit(sphere,product,1.5,.8,1.5,x,18.8,36,flavors[i*2]);box(white,.13,4,.13,x+.6,20,36);}
// Stocked glass-front drink cooler; blue interior, thin cabinet edges, visible bottles.
const k=p.cooler,x=k.x-b.x+7,z=k.y-b.y+9;box(dark,14,27,1,x,15,z-8.5);box(dark,14,2,18,x,2.5,z);box(dark,14,2,18,x,29,z);for(const xx of [x-6.5,x+6.5])box(dark,1,27,18,xx,15,z);box(glass,12,25,.15,x,15,z+9);box(steel,.5,8,.6,x+5,16,z+9.5);box(glow,11,.2,1,x,27,z+7);
for(let row=0;row<4;row++){box(steel,12,.4,15,x,4+row*6,z);for(let i=0;i<4;i++){emit(cylinder,product,.9,3.6,.9,x-4.5+i*3,6+row*6,z+5,flavors[(i+row)%6]);emit(cylinder,white,.45,.6,.45,x-4.5+i*3,8.2+row*6,z+5);}}
// Bright overhead strips, potted plants and a small countertop ice-shaver.
for(const xx of [b.w*.28,b.w*.72]){box(steel,3,.5,b.h-20,xx,38.7,b.h/2);box(glow,2.3,.2,b.h-22,xx,38.3,b.h/2);}box(steel,7,5,6,b.w-18,16,26);emit(cylinder,steel,2,8,2,b.w-18,22,26);box(dark,5,.8,5,b.w-18,26.5,26);box(white,3,2,3,b.w-18,15,29);
for(const xx of [14,b.w-14]){emit(cylinder,wood,2,3,2,xx,15,24);for(let i=0;i<5;i++)emit(sphere,green,.6,3,.3,xx+Math.sin(i)*1.4,18+Math.cos(i),24+Math.cos(i),null,0,Math.sin(i)*.6);}
// Original chalk menus and ORDER HERE signs share one small canvas atlas, no retailer branding.
if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=1024;c.height=512;const a=c.getContext('2d');a.fillStyle='#192b27';a.fillRect(0,0,1024,512);a.fillStyle='#f2edcc';a.font='bold 43px sans-serif';a.textAlign='center';a.fillText('FELICIA’S SNOWBALLS',512,56);const lines=['CLASSIC FLAVORS','STRAWBERRY • MANGO • BLUE RASPBERRY','GRAPE • LIME • CHERRY • CREAM','PACKED ICE · SIX FOR $180 GAME CASH'];lines.forEach((l,i)=>{a.fillStyle=['#f4c56e','#b7e5db','#e9bdd4','#ffffff'][i];a.font=i===0?'bold 28px sans-serif':'23px sans-serif';a.fillText(l,512,111+i*42);});a.fillStyle='#f5f6e6';a.fillRect(0,320,1024,192);a.fillStyle='#284f53';a.font='bold 58px sans-serif';a.fillText('ORDER HERE',512,406);a.font='25px sans-serif';a.fillText('FELICIA / WALK INSIDE TO ORDER',512,460);const tex=new T.CanvasTexture(c);tex.encoding=T.sRGBEncoding;textures.push(tex);const m=new T.MeshBasicMaterial({map:tex,side:T.DoubleSide});
function sign(w,h,x,y,z,order=false,ry=0){const geo=new T.PlaneGeometry(w,h),uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,order?uv.getY(i)*.375:uv.getY(i)*.625+.375);const mesh=new T.Mesh(geo,m);mesh.position.set(b.x+x,y,b.y+z);mesh.rotation.y=ry;mesh.userData.noBatch=true;root.add(mesh);}
sign(Math.min(50,cw),13,cx,28,5.7);sign(30,10,3.7,26,b.h*.65,false,Math.PI/2);for(const xx of [b.w*.3,b.w*.7])sign(Math.min(23,cw*.36),6,xx,33,21,true);
}
for(const [m,geos]of batches)for(const [geo,items]of geos){const mesh=new T.InstancedMesh(geo,m,items.length);mesh.userData.noBatch=true;items.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.rotation.set(v.rx,0,v.rz);dummy.scale.set(v.w,v.h,v.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);if(v.tint)mesh.setColorAt(i,color.set(v.tint));});root.add(mesh);}
root.userData.snowball={syrupBottles:bottles,drinkBottles:16};return {root,solids:p.solids,plan:p};
}
const api={plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29SnowballInterior=api;
})();
