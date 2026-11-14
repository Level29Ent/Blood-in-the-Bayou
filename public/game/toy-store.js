'use strict';
(function(){
function plan(b,dir=1){const flip=r=>dir===-1?{...r,x:2*b.x+b.w-r.x-r.w,y:2*b.y+b.h-r.y-r.h}:r;const sides=[{x:b.x+3,y:b.y+18,w:10,h:b.h-30,kind:'toy-shelf'},{x:b.x+b.w-13,y:b.y+18,w:10,h:b.h-30,kind:'toy-shelf'}],rear={x:b.x+3,y:b.y+3,w:b.w-6,h:10,kind:'showcase'};return {solids:[...sides,rear].map(flip)};}
function build(T,b,{base=0,dir=1,sign}={}){
 const root=new T.Group();root.name='Toy Store · colorful playroom showroom';root.position.set(b.x+b.w/2,base,b.y+b.h/2);if(dir===-1)root.rotation.y=Math.PI;const w=b.w,h=b.h,p=plan(b,dir),batches=new Map(),o=new T.Object3D(),color=new T.Color();let boxes=0,plush=0;
 const mat=(c,e={})=>new T.MeshStandardMaterial({color:c,roughness:.75,...e}),yellow=mat('#e3b72b'),white=mat('#e8e5d7'),dark=mat('#283840'),metal=mat('#819394',{metalness:.4,roughness:.4}),red=mat('#b7333d'),product=mat('#ffffff',{roughness:.65}),black=mat('#18252a'),glass=mat('#b6d6d9',{transparent:true,opacity:.13,depthWrite:false}),glow=new T.MeshBasicMaterial({color:'#fff6db'});
 const cube=new T.BoxGeometry(1,1,1),sphere=new T.SphereGeometry(1,10,7),cyl=new T.CylinderGeometry(1,1,1,10),ring=new T.TorusGeometry(1,.055,4,24),cone=new T.ConeGeometry(1,1,8),colors=['#bc414b','#4c8bae','#58a67c','#d9a238','#9b66af','#d790ab','#e5ded0'];
 function inst(g,m,x,y,z,sx=1,sy=1,sz=1,c,rot){if(!batches.has(g))batches.set(g,new Map());const by=batches.get(g);if(!by.has(m))by.set(m,[]);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.rotation.set(...(rot||[0,0,0]));o.updateMatrix();by.get(m).push({matrix:o.matrix.clone(),c});}
 const box=(m,ww,hh,dd,x,y,z,c)=>inst(cube,m,x,y,z,ww,hh,dd,c);
 // Original illustrated toy-box atlas: vehicles, castles, robots and creatures, no copied brands.
 const n=128,data=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const stripe=y<16||y>111,shape=(x>27&&x<100&&y>35&&y<85)||(y>22&&y<43&&((x>31&&x<47)||(x>78&&x<94)));let c=stripe?220:shape?250:160+((x*13+y*7)%22);if(y>94&&y<100&&x>18&&x<108)c=65;data.set([c,c,c,255],(y*n+x)*4);}const tex=new T.DataTexture(data,n,n);tex.encoding=T.sRGBEncoding;tex.needsUpdate=true;const pack=mat('#ffffff',{map:tex});
 function toyBox(x,y,z,i,side=false){box(pack,side?2.8:5.7,4.2,side?5.7:2.8,x,y,z,colors[i%7]);boxes++;}
 function bear(x,y,z,i,s=1){const c=colors[i%7];inst(sphere,product,x,y+1.6*s,z,1.4*s,1.8*s,1.1*s,c);inst(sphere,product,x,y+3.5*s,z,1.3*s,1.2*s,1.1*s,c);for(const side of [-1,1]){inst(sphere,product,x+side*s,y+4.4*s,z,.48*s,.5*s,.4*s,c);inst(sphere,product,x+side*1.4*s,y+1.9*s,z,.6*s,.8*s,.6*s,c);inst(sphere,product,x+side*.7*s,y+.2*s,z+.6*s,.6*s,.45*s,.7*s,c);inst(sphere,black,x+side*.4*s,y+3.8*s,z+1.02*s,.12*s,.12*s,.1*s);}inst(sphere,white,x,y+3.2*s,z+1.1*s,.6*s,.4*s,.2*s);inst(sphere,black,x,y+3.45*s,z+1.28*s,.16*s,.12*s,.1*s);plush++;}
 box(white,w-4,.2,h-4,0,1.3,0);box(yellow,w-6,.05,16,0,1.43,h/2-11);
 // Yellow slatwall, white gondola frames and five tightly stocked shelf levels.
 box(yellow,w-3,36,.6,0,23,-h/2+1.5);for(let y=8;y<39;y+=3)box(dark,w-3,.12,.15,0,y,-h/2+1.9);
 for(const side of [-1,1]){const x=side*(w/2-7),z=0;box(white,1,34,h-29,side*(w/2-1.7),21,z);for(const zz of [-(h-30)/2,(h-30)/2])box(metal,9,33,.6,x,20,zz);
  for(let row=0;row<5;row++){const y=4+row*6.4;box(white,10,.5,h-30,x,y,z);for(let i=0;i<Math.floor((h-32)/4);i++)toyBox(x,y+2.5,-(h-30)/2+2+i*4,i+row*3,true);box(yellow,.3,1,h-30,x-side*5,y,z);}
 }
 // Red-base glass showcase packed with plush and small toy props.
 const backZ=-h/2+8;box(red,w-8,5,10,0,4,backZ);box(metal,w-7,.7,11,0,6.9,backZ);
 for(const y of [7.5,15,22.5]){box(white,w-9,.4,9,0,y,backZ);for(let i=0;i<Math.floor((w-12)/6);i++)bear(-(w-12)/2+3+i*6,y+.4,backZ,i+Math.round(y),.85);}
 box(glass,w-8,22,.2,0,17,backZ+5.3);box(glass,w-8,.3,10,0,28.3,backZ);for(let x=-w/2+4;x<=w/2-4;x+=(w-8)/3)box(metal,.6,23,.6,x,17,backZ+5.4);
 // Hanging wire baskets of plush and balls above side shelves; within existing rack blockers.
 for(const side of [-1,1])for(let j=0;j<2;j++){const x=side*(w/2-6),z=-h*.12+j*h*.24;for(const yy of [15,18,21])inst(ring,metal,x,yy,z,3,3,3,null,[Math.PI/2,0,0]);for(let i=0;i<8;i++){const a=i*Math.PI/4;box(metal,.13,6,.13,x+Math.cos(a)*3,18,z+Math.sin(a)*3);}for(let k=0;k<3;k++)bear(x-1.2+k*1.2,17,z,k+j,.6);}
 // Two original blocky mascot figures remain on the rear display, not in the center aisle.
 for(const [i,x]of [-w*.22,w*.22].entries()){const z=-h/2+8,y=29;box(product,4,5,2.6,x,y+5,z,colors[i]);for(const side of [-1,1]){box(product,1.7,4,2.2,x+side*1.1,y+1,z,'#3e7da3');box(product,1.4,4,1.8,x+side*3,y+5,z,colors[i]);inst(cyl,yellow,x+side*3,y+2.3,z,.8,1,.8);}inst(cyl,yellow,x,y+9,z,2,3,2);inst(cyl,yellow,x,y+11,z,.7,.6,.7);for(const side of [-1,1])inst(sphere,black,x+side*.65,y+9.5,z+1.9,.18,.18,.1);box(black,1,.15,.1,x,y+8.6,z+2);}
 // Small castle and construction-block canopy bring the playful overhead reference into the bay.
 const castleX=0,z=-h/2+7;box(white,17,5,6,castleX,31,z);for(const side of [-1,1]){box(white,4,11,5,side*9,34,z);inst(cone,product,side*9,42,z,3,5,3,side<0?'#8c69ad':'#5e96b6');box(dark,1.3,3,.3,side*9,36,z+2.7);}box(product,12,3,.4,0,34,z+3.2,'#d9b5d6');
 for(let i=0;i<12;i++){const x=-w*.30+i*w*.055,zz=-h*.12+Math.sin(i*.7)*4;box(product,w*.06,1,3,x,44.5,zz,colors[i%7]);inst(cyl,product,x,45.2,zz,.8,.5,.8,colors[i%7]);}
 for(const side of [-1,1]){const x=side*w*.23;box(yellow,w*.3,1,15,x,47,-h*.13);box(glow,w*.26,.2,11,x,46.3,-h*.13);}
 if(sign){sign(root,'BAYOU TOYS · BUILD / PLAY / IMAGINE',w-10,3,0,39,-h/2+2.5,'#f4e2a2');sign(root,'PLUSH / GAMES / BUILDING SETS',w-12,2.6,0,12,backZ+5.8,'#ffe3a1');}
 for(const [g,groups]of batches)for(const [m,items]of groups){const mesh=new T.InstancedMesh(g,m,items.length);mesh.userData.noBatch=true;items.forEach((a,i)=>{mesh.setMatrixAt(i,a.matrix);if(a.c)mesh.setColorAt(i,color.set(a.c));});root.add(mesh);}root.userData.toyStore={boxes,plush,drawBatches:root.children.length};return {root,solids:p.solids,plan:p};
}
const api={plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29ToyStore=api;
})();
