'use strict';
(function(){
function plan(b,dir=1){const flip=r=>dir===-1?{...r,x:2*b.x+b.w-r.x-r.w,y:2*b.y+b.h-r.y-r.h}:r;const sides=[{x:b.x+3,y:b.y+18,w:9,h:b.h-31,kind:'bookcase'},{x:b.x+b.w-12,y:b.y+18,w:9,h:b.h-31,kind:'bookcase'}],back={x:b.x+3,y:b.y+3,w:b.w-6,h:10,kind:'children-display'},nook={x:b.x+b.w-22,y:b.y+b.h-14,w:16,h:9,kind:'reading-seat'};return {solids:[...sides,back,nook].map(flip)};}
function build(T,b,{base=0,dir=1,sign}={}){
 const root=new T.Group();root.name='Book Store · wood shelves and illustrated covers';root.position.set(b.x+b.w/2,base,b.y+b.h/2);if(dir===-1)root.rotation.y=Math.PI;const w=b.w,h=b.h,p=plan(b,dir),batches=new Map(),tmp=new T.Object3D(),color=new T.Color();let books=0,covers=0;
 const mat=(c,e={})=>new T.MeshStandardMaterial({color:c,roughness:.8,...e}),oak=mat('#a47c47'),trim=mat('#705131'),paper=mat('#e8dfc8'),dark=mat('#30392e'),white=mat('#ded6c1'),product=mat('#ffffff'),teal=mat('#68a7a0'),orange=mat('#b26a36'),glow=new T.MeshBasicMaterial({color:'#fff0d0'});
 const cube=new T.BoxGeometry(1,1,1),cyl=new T.CylinderGeometry(1,1,1,10),sphere=new T.SphereGeometry(1,10,6),colors=['#895349','#3f677b','#d7b35b','#667e50','#9c6b8a','#d8ceb0','#a94839','#477e7b'];
 function inst(g,m,x,y,z,sx=1,sy=1,sz=1,c,rot){if(!batches.has(g))batches.set(g,new Map());const by=batches.get(g);if(!by.has(m))by.set(m,[]);tmp.position.set(x,y,z);tmp.scale.set(sx,sy,sz);tmp.rotation.set(...(rot||[0,0,0]));tmp.updateMatrix();by.get(m).push({matrix:tmp.matrix.clone(),c});}
 const box=(m,ww,hh,dd,x,y,z,c)=>inst(cube,m,x,y,z,ww,hh,dd,c);
 // Original atlas: storybook landscapes/characters and geometric cover art, not photo covers.
 const n=256,atlas=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const cellX=Math.floor(x/64),cellY=Math.floor(y/128),u=x%64,v=y%128,id=cellX+cellY*4;let r=110+id*13,g=140-id*7,bl=145+id*9;
  if(v<15||v>113){r=235;g=225;bl=196;}if(v>23&&v<32&&u>7&&u<57){r=45;g=53;bl=58;}if(v>65){r=65+id*12;g=115+id*4;bl=90;}const sun=(u-45)**2+(v-47)**2<56,figure=(u-29)**2+(v-66)**2<48||u>23&&u<36&&v>70&&v<91;if(sun){r=238;g=195;bl=91;}if(figure){r=220;g=149;bl=111;}if(v>99&&v<106&&u>9&&u<55){r=225;g=221;bl=197;}atlas.set([r,g,bl,255],(y*n+x)*4);}
 const tex=new T.DataTexture(atlas,n,n);tex.encoding=T.sRGBEncoding;tex.needsUpdate=true;const coverMat=mat('#ffffff',{map:tex});
 const coverGeos=Array.from({length:8},(_,i)=>{const g=new T.PlaneGeometry(1,1),uv=g.attributes.uv;for(let j=0;j<uv.count;j++)uv.setXY(j,(uv.getX(j)+i%4)/4,(uv.getY(j)+Math.floor(i/4))/2);return g;});
 function cover(x,y,z,i,width=4,height=6,angle=0){inst(coverGeos[i%8],coverMat,x,y,z,width,height,1,null,[0,angle,0]);covers++;}
 function spine(x,y,z,i,height,side){box(product,side?4.4:1.15,height,side?1.15:4.4,x,y,z,colors[i%8]);const face=side||1;if(side){box(paper,.11,height*.7,.72,x+face*2.26,y,z);for(let k=0;k<3;k++)box(dark,.13,.14,.6,x+face*2.33,y+height*.22-k*.6,z);}else{box(paper,.74,height*.65,.1,x,y,z+2.25);for(let k=0;k<3;k++)box(dark,.62,.14,.12,x,y+height*.2-k*.6,z+2.32);}books++;}
 box(oak,w-4,.18,h-4,0,1.35,0);for(let x=-w/2+6;x<w/2-2;x+=5)box(trim,.11,.05,h-4,x,1.47,0);
 // Tall wall bookshelves: densely varied spines, paper title bands and occasional face-outs.
 for(const side of [-1,1]){const x=side*(w/2-7),run=h-31;box(trim,.6,38,run,side*(w/2-1.7),21,0);
  for(const z of [-run/2,0,run/2])box(oak,10,39,.7,x,21,z);
  for(let row=0;row<5;row++){const y=3+row*7.4;box(oak,10,.65,run,x,y,0);for(let i=0;i<Math.floor((run-3)/1.35);i++){const zz=-run/2+1.4+i*1.35,hh=4.1+(i*7+row)%4*.45;spine(x,y+.6+hh/2,zz,i+row*3,hh,-side);}box(trim,.4,1,run,x-side*5,y-.1,0);}
 }
 // Children's wall: face-out illustrated picture books with stacks below and warm timber backing.
 const bz=-h/2+6.5;box(trim,w-6,35,.5,0,20,-h/2+1.7);for(let row=0;row<4;row++){const y=4+row*8;box(oak,w-6,.7,9,0,y,bz);const count=Math.floor((w-12)/6.4),step=(w-12)/count;for(let i=0;i<count;i++){const x=-(w-12)/2+(i+.5)*step;box(product,4.6,6,.8,x,y+3.5,bz+2,colors[(i+row)%8]);cover(x,y+3.5,bz+2.46,i+row*3,4.5,5.8);books++;}box(trim,w-6,.8,.5,0,y,bz+4.7);}
 // Original genre cards on shelf ends echo the hanging turquoise category labels.
 if(sign){for(const side of [-1,1]){const label=sign(root,side<0?'FICTION':'HISTORY',12,2.6,side*(w/2-11),31,3,'#e0f0dd');if(label)label.rotation.y=side<0?Math.PI/2:-Math.PI/2;}sign(root,'CHILDREN’S STORIES · NEW READS',w-12,3,0,39,-h/2+2.6,'#f3dfb2');}
 // Shallow reading nook beside the entrance, safely outside the central browse point.
 const nx=w/2-14,nz=h/2-9.5;box(orange,15,5,8,nx,4,nz);box(orange,15,6,1.7,nx,7,nz-3);for(const side of [-1,1])box(orange,1.6,6,8,nx+side*7,6,nz);box(paper,3,.6,4,nx,7,nz);box(teal,3,2,.7,nx+4,8,nz-2);
 // Tin-style ceiling coffers, track rails and warm pendant-style bulbs.
 for(let x=-w/2+7;x<w/2-4;x+=10)for(let z=-h/2+7;z<h/2-3;z+=10){box(white,9,.4,9,x,47.8,z);box(trim,8,.12,.2,x,47.5,z-4);box(trim,.2,.12,8,x-4,47.5,z);inst(cyl,paper,x,47.25,z,2.1,.25,2.1);}
 for(const side of [-1,1]){const x=side*w*.23;box(dark,.4,.4,h-12,x,46,0);for(let z=-h/2+14;z<h/2-10;z+=17){inst(cyl,dark,x,44.6,z,.65,2,.65);inst(sphere,glow,x,43.4,z,1,.5,1);}}
 for(const [g,groups]of batches)for(const [m,items]of groups){const mesh=new T.InstancedMesh(g,m,items.length);mesh.userData.noBatch=true;items.forEach((a,i)=>{mesh.setMatrixAt(i,a.matrix);if(a.c)mesh.setColorAt(i,color.set(a.c));});root.add(mesh);}root.userData.bookStore={books,covers,drawBatches:root.children.length};return {root,solids:p.solids,plan:p};
}
const api={plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29BookStore=api;
})();
