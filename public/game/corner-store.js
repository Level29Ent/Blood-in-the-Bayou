'use strict';
(function(){
function matches(v){return !!v.infill&&v.name==='CORNER GROCER';}
function plan(b){const sx=b.w/96,sz=b.h/96,r=(x,y,w,h,kind)=>({x:b.x+x*sx,y:b.y+y*sz,w:w*sx,h:h*sz,kind});const shelves=[r(4,8,12,65,'grocery'),r(80,4,12,48,'back-bar')],counter=r(63,23,14,48,'deli-counter'),cooler=r(5,78,13,13,'drink-cooler');return {shelves,counter,cooler,solids:[...shelves,counter,cooler,r(79,53,12,18,'hot-food'),r(81,76.5,10,11,'kitchen')],entry:{x:b.x+b.w/2,y:b.y+b.h},service:{x:b.x+b.w/2,y:b.y+b.h-24}};}
function build(T,b,options={}){
 const root=new T.Group();root.name='Corner Grocer · neighborhood deli';root.userData.noBatch=true;const p=plan(b),sx=b.w/96,sz=b.h/96,batches=new Map();
 const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.8,...extra});
 function texture(kind){const n=128,a=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const noise=((x*13+y*29+x*y)%17)-8;let v=kind==='wood'?220+noise+Math.sin(x*.24+Math.sin(y*.06))*14:kind==='floor'?177+noise*.65:235+noise*.25;if(kind==='package'){if(y>80&&y<119)v=251;if(y===92||y===98||y===104)v=x>23&&x<103?65:v;}a.set([v,v,v,255],(y*n+x)*4);}const t=new T.DataTexture(a,n,n);t.encoding=T.sRGBEncoding;t.wrapS=t.wrapT=T.RepeatWrapping;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t;}
 const wood=mat('#be9764',{map:texture('wood')}),floor=mat('#92978b',{map:texture('floor'),roughness:.9}),pack=mat('#ffffff',{map:texture('package')}),green=mat('#315b45'),steel=mat('#9da8a4',{metalness:.55,roughness:.38}),dark=mat('#202c2d'),white=mat('#e9e0c7'),product=mat('#ffffff'),purple=mat('#733e8f'),red=mat('#a73e37'),gold=mat('#bd9654'),glass=mat('#b6d6d0',{transparent:true,opacity:.15,depthWrite:false,roughness:.16}),glow=new T.MeshBasicMaterial({color:'#fff4cf'}),screen=new T.MeshBasicMaterial({color:'#85c2b1'});
 floor.map.repeat.set(3,3);wood.map.repeat.set(2,1);
 const cube=new T.BoxGeometry(),cyl=new T.CylinderGeometry(1,1,1,10),sphere=new T.SphereGeometry(1,8,6),ring=new T.TorusGeometry(1,.16,5,12),o=new T.Object3D(),color=new T.Color();
 function emit(geo,m,w,h,d,x,y,z,tint=null,rx=0,ry=0,rz=0){if(!batches.has(m))batches.set(m,new Map());const by=batches.get(m);if(!by.has(geo))by.set(geo,[]);by.get(geo).push({w:w*sx,h,d:d*sz,x:b.x+x*sx,y,z:b.y+z*sz,tint,rx,ry,rz});}
 const box=(m,w,h,d,x,y,z,tint)=>emit(cube,m,w,h,d,x,y,z,tint);
 box(floor,96,.8,96,48,.4,48);box(green,96,51,3,48,26,1.5);for(const x of [1.5,94.5])box(green,3,51,96,x,26,48);
 const doorW=options.doorW||38,span=(b.w-doorW)/sx/2;for(const x of [span/2,96-span/2])box(wood,span,51,3,x,26,94.5);box(wood,doorW/sx,9,3,48,47,94.5);
 const roof=new T.Mesh(new T.BoxGeometry(b.w+2,2,b.h+2),dark);roof.position.set(b.x+b.w/2,53,b.y+b.h/2);roof.userData.noBatch=true;root.add(roof);
 box(dark,35,.12,15,48,.9,85);
 // Exposed dark ceiling and luminous fluorescent tubes, no extra lights or shadow maps.
 for(let z=8;z<94;z+=16)box(dark,90,1.8,1,48,50,z);for(const x of [15,39,63,86])box(dark,1,2,88,x,50,48);
 for(const x of [28,60])for(const z of [19,52,83]){box(steel,3,.7,21,x,48,z);box(glow,2.2,.25,19,x,47.5,z);}
 let products=0,bottles=0;const colors=['#c14336','#d8af38','#3c805a','#457b99','#a05f7f','#e7c897'];
 function bottle(x,y,z,i){emit(cyl,product,1,3.4,1,x,y,z,colors[i%6]);emit(cyl,steel,.45,1,.45,x,y+2.1,z);box(white,1.85,1.1,.12,x,y-.2,z+1.02);products++;bottles++;}
 function parcel(x,y,z,i,w=3.5,h=4,d=3){box(pack,w,h,d,x,y,z,colors[i%6]);products++;}
 // Shelves face into the store, with green back panels and weathered wood ledges.
 for(const [side,start,length]of [[0,8,65],[1,4,48]]){
  const x=side?90.8:5.2;box(green,.7,34,length,x,19,start+length/2);
  for(const z of [start,start+length])box(wood,10,37,1,side?86:10,19,z);
  for(let row=0;row<5;row++){const y=3+row*7;box(wood,11,.7,length,side?85.8:10.2,y,start+length/2);box(white,.12,.8,length-1,side?80.2:15.8,y,start+length/2);
   for(let j=0;j<Math.floor(length/4.5);j++){const z=start+2.5+j*4.5;if((j+row)%3===0)bottle(side?84:12,y+2.7,z,j+row);else parcel(side?84:12,y+2.8,z,j+row,4.3,4.7,3.8);}}
 }
 // Back-wall pantry and boxed food stacks, avoiding the central service approach.
 box(wood,43,1,8,27,8,7);box(wood,43,1,8,27,19,7);box(wood,43,1,8,27,30,7);
 for(let row=0;row<3;row++)for(let j=0;j<9;j++)parcel(8+j*4.5,11+row*11,7,row+j,3.8,5,4);
 // L-shaped visual deli with blond base, transparent front and displayed sandwiches/snacks.
 const c=p.counter,x=(c.x-b.x)/sx+7,z=(c.y-b.y)/sz+24;
 box(wood,14,6,48,x,3.8,z);box(steel,14,.7,48,x,7.2,z);box(steel,14,.7,48,x,16.5,z);box(glass,.2,9,47,63,12,z);box(glass,14,9,.2,x,12,23);box(glass,14,9,.2,x,12,71);box(glass,14,.2,48,x,17,z);
 for(const zz of [23.3,39,55,70.7])box(wood,.7,15,1,63,9,zz);
 for(const y of [8,12]){box(glass,12,.15,46,x,y,z);for(let j=0;j<9;j++){if(y===8)parcel(x,y+1.4,26+j*4.8,j,6,2.3,3);else{emit(sphere,gold,2.8,1.1,1.3,x,y+1.3,26+j*4.8);box(green,5.3,.25,2.7,x,y+1.2,26+j*4.8);products++;}}}
 // POS counter and hot-food case above the back part of the deli, with metal kitchen equipment.
 box(wood,14,12,11,x,7,28.5);box(white,14,1,11,x,13.5,28.5);box(dark,5,1,4,x,14.5,29);box(dark,5,4,.6,x,17,29);box(screen,4,2.8,.1,x,17,29.4);
 box(steel,12,1,18,85,12,62);box(dark,12,10,18,85,6,62);box(glass,.2,8,17,79,17,62);box(glass,11,.2,18,84,21,62);for(const zz of [54,70])box(steel,11,8,.5,84,17,zz);for(let j=0;j<6;j++){emit(sphere,gold,1.7,1.2,1.7,84,13.5,55.5+j*2.5);products++;}
 box(steel,10,13,11,86,7,82);box(dark,9,2,10,86,14,82);for(const xx of [83.5,88])emit(cyl,dark,2,.3,2,xx,15.1,82);box(steel,15,3,17,85,36,81);
 for(const zz of [76,81,86])bottle(78,17,zz,zz%6);
 // Cup stacks, baked goods and countertop condiments.
 for(const zz of [40,46,52]){for(let i=0;i<4;i++)emit(cyl,white,1.3,.6,1.3,72,18+i*.55,zz);bottle(68,19,zz,Math.floor(zz/6));}
 // Left-front glass-door drink cooler with visible drinks behind faint glass.
 box(dark,13,31,1,11.5,16.5,78.5);for(const xx of [5.5,17.5])box(steel,1,31,13,xx,16.5,84.5);box(glass,11,28,.2,11.5,16,90.5);box(steel,13,2,13,11.5,32,84.5);box(steel,.5,9,1,16,17,91);
 for(let row=0;row<4;row++){box(steel,11,.5,9,11.5,3+row*7,84);for(let j=0;j<4;j++)bottle(7+j*3,6+row*7,87,j+row);}
 // Purple/gold garland on the deli fascia and tricolor flags along the grocery aisle.
 for(let j=0;j<28;j++){const zz=24+j*1.65,y=18-Math.sin(j/27*Math.PI)*2;emit(ring,j%3===0?gold:purple,.85,.85,.85,62.7,y,zz,null,0,Math.PI/2);}
 for(let j=0;j<5;j++){const zz=17+j*13;box(steel,.1,.1,11,20,37,zz);for(const [i,m]of [green,white,red].entries())box(m,2,5,.15,18+i*2,33.5,zz);}
 // A single original atlas provides menu photography substitutes and legible shop labels.
 if(typeof document!=='undefined'){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const ctx=canvas.getContext('2d');
 const titles=['PO-BOYS','HOT PLATES','QUICK BITES','CORNER GROCER'];
 titles.forEach((s,i)=>{const y=i*128;ctx.fillStyle=i===3?'#244a37':'#f3dfab';ctx.fillRect(0,y,1024,128);ctx.fillStyle=i===3?'#f5e5b7':'#275b70';ctx.font='bold 38px sans-serif';ctx.textAlign='left';ctx.fillText(s,22,y+43);ctx.font='21px sans-serif';const lines=[['SHRIMP $9  •  ROAST BEEF $8','HOT SAUSAGE $7  •  DRESSED TO ORDER'],['FRIED CHICKEN $8  •  SEAFOOD $12','RED BEANS & RICE $6  •  DAILY SPECIALS'],['MUFFULETTA $8  •  WINGS $7','COFFEE $2  •  COLD DRINKS $3'],['NEIGHBORHOOD DELI / MARKET','PO-BOYS  •  GROCERIES  •  CHECKOUT']][i];lines.forEach((l,j)=>ctx.fillText(l,22,y+77+j*29,820));if(i<3){ctx.fillStyle='#bd8c40';ctx.beginPath();ctx.ellipse(925,y+59,65,26,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#496b39';ctx.fillRect(865,y+55,118,7);ctx.fillStyle='#a54e33';ctx.fillRect(877,y+64,90,5);}});
 const atlas=new T.CanvasTexture(canvas);atlas.encoding=T.sRGBEncoding;const m=new T.MeshBasicMaterial({map:atlas,side:T.DoubleSide});
 function sign(row,w,h,x,y,z,angle=0){const geo=new T.PlaneGeometry(w*sx,h),uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,(3-row+uv.getY(i))/4);const mesh=new T.Mesh(geo,m);mesh.position.set(b.x+x*sx,y,b.y+z*sz);mesh.rotation.y=angle;mesh.userData.noBatch=true;root.add(mesh);}
 sign(3,74,10,48,59,97);sign(3,70,9,48,42,4);
 for(const [i,zz]of [[0,30],[1,48],[2,66]]){box(dark,.6,10,18,79,34,zz);sign(i,18,9,78.5,34,zz,-Math.PI/2);}
 sign(2,33,7,31,36,48);for(const xx of [20,42])box(steel,.15,9,.15,xx,44,48);
 }
 for(const [m,geos]of batches)for(const [geo,items]of geos){const inst=new T.InstancedMesh(geo,m,items.length);inst.userData.noBatch=true;items.forEach((v,i)=>{o.position.set(v.x,v.y,v.z);o.rotation.set(v.rx,v.ry,v.rz);o.scale.set(v.w,v.h,v.d);o.updateMatrix();inst.setMatrixAt(i,o.matrix);if(v.tint)inst.setColorAt(i,color.set(v.tint));});root.add(inst);}
 root.userData.cornerStore={products,bottles};return {root,roof,plan:p,solids:p.solids};
}
const api={matches,plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window==='undefined')return;window.level29CornerStore=api;if(window.level29CornerReview)return;
const original=buildVenue;buildVenue=function(v){if(!matches(v))return original.apply(this,arguments);if(v.mesh?.parent===cityGroup)return;const store=build(THREE,v.b,{doorW:v.doorW});v.referenceCorner=true;v.mesh=store.root;v.mesh.position.y=v.baseY||v.b.baseY||0;cityGroup.add(v.mesh);v.roof=store.roof;v.furniture=store.solids.slice();v.door=new THREE.Group();v.mesh.add(v.door);v.labelH=76;};
})();
