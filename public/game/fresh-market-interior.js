'use strict';
(function(){
function plan(b){
 const mid=b.x+b.w/2,wide=b.w>=220&&b.h>=190,depth=14;
 const cold=[{x:b.x+6,y:b.y+7,w:b.w/2-32,h:depth,kind:'deli'},{x:mid+26,y:b.y+7,w:b.w/2-32,h:depth,kind:'dairy'},{x:b.x+6,y:b.y+62,w:14,h:b.h-100,kind:'refrigerated-produce'}];
 const dry={x:b.x+b.w-20,y:b.y+62,w:14,h:b.h-100,kind:'groceries'};
 const counter={x:mid-18,y:b.y+31,w:36,h:12,kind:'checkout'};
 const produce=wide?[{x:b.x+b.w*.32-20,y:b.y+b.h*.43-14,w:40,h:28,kind:'produce'},{x:b.x+b.w*.32-20,y:b.y+b.h*.75-14,w:40,h:28,kind:'produce'},{x:b.x+b.w*.72-20,y:b.y+b.h*.77-13,w:40,h:26,kind:'produce'}]:[];
 const aisles=wide?[{x:b.x+b.w*.72-11,y:b.y+65,w:22,h:b.h*.27,kind:'cereal-aisle'}]:[];
 return {cold,dry,counter,produce,aisles,wide,staff:{x:mid,y:b.y+22},service:{x:mid,y:b.y+b.h*.65},entry:{x:mid,y:b.y+b.h-15},solids:[...cold,dry,counter,...produce,...aisles]};
}
function build(T,b,base=0){
 const root=new T.Group();root.name='Fresh Market · produce deli and stocked grocery aisles';root.position.y=base;root.userData.noBatch=true;const p=plan(b),batches=new Map(),textures=[],dummy=new T.Object3D(),color=new T.Color(),stats={fruit:0,packages:0,meals:0,coldCases:3};
 const mat=(c,e={})=>new T.MeshStandardMaterial({color:c,roughness:.7,...e}),steel=mat('#9aa7a3',{metalness:.6,roughness:.35}),shelf=mat('#d8d5c5',{metalness:.25}),dark=mat('#222d2c'),wood=mat('#b08446'),wall=mat('#72969b'),orange=mat('#a9743d'),white=mat('#f4ecd7'),leaf=mat('#4c793b'),food=mat('#ffffff'),pack=mat('#ffffff'),glass=mat('#b9dadd',{transparent:true,opacity:.12,depthWrite:false,roughness:.15,metalness:.1}),glow=new T.MeshBasicMaterial({color:'#fff4d9'}),screen=new T.MeshBasicMaterial({color:'#84b4a0'});
 const cube=new T.BoxGeometry(1,1,1),sphere=new T.SphereGeometry(1,8,6),cyl=new T.CylinderGeometry(1,1,1,10);
 function emit(geo,m,w,h,d,x,y,z,tint=null,rx=0,ry=0,rz=0){if(!batches.has(m))batches.set(m,new Map());const by=batches.get(m);if(!by.has(geo))by.set(geo,[]);dummy.position.set(x,y,z);dummy.scale.set(w,h,d);dummy.rotation.set(rx,ry,rz);dummy.updateMatrix();by.get(geo).push({matrix:dummy.matrix.clone(),tint});}
 const B=(m,w,h,d,x,y,z,tint=null)=>emit(cube,m,w,h,d,x,y,z,tint);
 function canvas(w,h,paint){if(typeof document==='undefined')return null;const c=document.createElement('canvas');c.width=w;c.height=h;paint(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;textures.push(t);return t;}
 const packageMap=canvas(128,128,(c,w,h)=>{c.fillStyle='#fff';c.fillRect(0,0,w,h);c.fillStyle='#d0c9ac';c.fillRect(4,5,120,5);c.fillRect(4,117,120,5);c.fillStyle='#f2e7bd';c.fillRect(12,22,104,66);c.fillStyle='#404b42';c.fillRect(25,30,78,7);c.fillRect(34,44,60,4);c.fillStyle='#b2bd85';c.beginPath();c.ellipse(64,69,22,15,0,0,Math.PI*2);c.fill();c.fillStyle='#555';for(let x=28;x<96;x+=4)c.fillRect(x,97,1+x%3,12);});pack.map=packageMap;
 const labels=['FARM FRESH PRODUCE','DELI / PREPARED MEALS','MILK / DAIRY / FROZEN','PANTRY / CEREAL','CHECKOUT','FRESH MARKET'];
 const signMap=canvas(1024,768,(c,w,h)=>{for(let i=0;i<6;i++){c.fillStyle=['#6e854e','#96734c','#587d83','#aa793f','#526b57','#62808a'][i];c.fillRect(0,i*128,w,128);c.fillStyle='#e4c38a';c.fillRect(0,i*128+118,w,4);c.fillStyle='#fff2d6';c.font='bold 63px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(labels[i],512,i*128+61,990);}});
 const signMat=signMap?new T.MeshBasicMaterial({map:signMap}):null;
 function sign(index,w,h,x,y,z,ry=0){if(!signMat)return;const geo=new T.PlaneGeometry(w,h),uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,(5-index+uv.getY(i))/6);const m=new T.Mesh(geo,signMat);m.name='Fresh Market · '+labels[index];m.position.set(x,y,z);m.rotation.y=ry;m.userData.noBatch=true;root.add(m);}
 // Brown polished retail flooring and exposed steel roof trusses below the existing shell.
 const floor=mat('#a58a65',{roughness:.45});B(floor,b.w-6,.15,b.h-6,b.x+b.w/2,1.05,b.y+b.h/2);
 for(let z=b.y+4;z<b.y+b.h-3;z+=12)B(wood,b.w-7,.03,.15,b.x+b.w/2,1.14,z);
 B(wall,b.w-7,12,.4,b.x+b.w/2,41,b.y+3.3);B(orange,b.w-7,2,.5,b.x+b.w/2,34,b.y+3.6);
 B(shelf,b.w-7,.3,b.h-7,b.x+b.w/2,50,b.y+b.h/2);
 for(let z=b.y+28;z<b.y+b.h-10;z+=44){B(steel,b.w-12,.6,.7,b.x+b.w/2,46,z);B(steel,b.w-12,.6,.7,b.x+b.w/2,49,z);for(let x=b.x+10;x<b.x+b.w-30;x+=24)emit(cube,steel,24, .35,.4,x+12,47.5,z,null,0,0,(Math.floor((x-b.x)/24)%2?1:-1)*.12);}
 for(const x of [b.x+b.w*.25,b.x+b.w*.75])for(let z=b.y+26;z<b.y+b.h-10;z+=46){B(steel,29,.6,4,x,44,z);B(glow,27,.25,3.3,x,43.5,z);}
 const palette=['#b64438','#dfb748','#65954c','#d4ca9e','#678da0','#d68741','#815063','#e0d5ab'];
 function packet(x,y,z,w,h,d,i,ry=0){emit(cube,pack,w,h,d,x,y,z,palette[i%8],0,ry);stats.packages++;}
 // One double-sided cereal gondola and a long wall of jars, cans, cartons and sauces.
 function rack(r,wallRack=false){const x=r.x+r.w/2,z=r.y+r.h/2,w=r.w,len=r.h;B(shelf,wallRack?1:1.2,30,len,wallRack?r.x+r.w-1:x,16,z);for(const zz of [r.y+1,r.y+r.h-1])for(const xx of [r.x+.6,r.x+r.w-.6])B(steel,.7,31,.7,xx,16.5,zz);
  for(let l=0;l<5;l++){const y=3+l*5.8;B(shelf,w,.6,len,x,y,z);for(const side of wallRack?[-1]:[-1,1]){const face=wallRack?r.x+.3:x+side*(w/2-.1);B(orange,.5,1,len,face,y+.4,z);for(let j=0;j<Math.floor(len/5.6);j++){const zz=r.y+3+j*5.6,xx=wallRack?x:x+side*w*.27;if(wallRack&&l%2){emit(cyl,pack,1.4,3.1,1.4,xx,y+1.9,zz,palette[(l+j)%8]);B(dark,2,.6,2,xx,y+3.6,zz);stats.packages++;}else packet(xx,y+2.7,zz,wallRack?5:4.2,4.4,4.5,l+j,Math.PI/2);B(white,.55,.65,2,face+side*.3,y+.45,zz);}}
  }
 }
 rack(p.dry,true);for(const r of p.aisles)rack(r);
 // Tilted wood produce bins in colored rows, with fruit mounds and leafy tops.
 for(const [i,r]of p.produce.entries()){const x=r.x+r.w/2,z=r.y+r.h/2;B(wood,r.w,8,r.h,x,5.2,z);emit(cube,dark,r.w,1,r.h,x,10.3,z,null,-.12);for(const dx of [-r.w/2,0,r.w/2])B(wood,.7,4,r.h,x+dx,11,z);for(const zz of [r.y+.5,r.y+r.h-.5])B(wood,r.w,3,.8,x,11.4,zz);
  for(let a=0;a<8;a++)for(let j=0;j<5;j++){const tint=['#a92f39','#76a43a','#daae35','#de6f30','#754a83','#a9bd74'][(Math.floor(a/2)+i)%6],xx=r.x+3+a*(r.w-6)/7,zz=r.y+3+j*(r.h-6)/4,yy=12+(j-2)*.4;emit(sphere,food,1.9,1.7,1.85,xx,yy,zz,tint);stats.fruit++;if((a+j)%3===0){emit(sphere,food,1.7,1.5,1.7,xx,yy+2.2,zz,tint);stats.fruit++;}if(i===1&&a>5)emit(sphere,leaf,2.2,.6,1,xx,yy+1.8,zz,null,.3,0,.4);}
  B(dark,.6,6,.6,x,17,z);B(dark,11,5,.6,x,21,z);B(white,8,.8,.1,x,21,z+.35);
 }
 for(const [index,r]of p.cold.entries()){
  const side=index===2,x=r.x+r.w/2,z=r.y+r.h/2,width=side?r.h:r.w,deep=side?r.w:r.h;
  // Build each case facing the aisle; the side produce fridge rotates as a unit in its footprint.
  const C=(m,w,h,d,u,y,v,tint)=>{if(side)B(m,d,h,w,x+v,y,z-u,tint);else B(m,w,h,d,x+u,y,z+v,tint);};
  C(dark,width,3,deep,0,3,0);C(dark,width,30,1,0,19,-deep/2+.5);C(steel,width,2,deep,0,35,0);C(glow,width-2,.4,1,0,33,deep/2-1);
  const bays=Math.max(1,Math.floor(width/20));for(let k=0;k<=bays;k++)C(steel,.7,31,deep,-width/2+k*width/bays,19,0);
  for(let l=0;l<4;l++){const y=6+l*6.2;C(shelf,width-1,.5,deep-1,0,y,0);C(white,width-1,1,.5,0,y+.4,deep/2-.4);
   for(let j=0;j<Math.floor(width/4.5);j++){const u=-width/2+3+j*4.5;if(index===0){C(dark,3.9,.6,8,u,y+.6,0);C(food,3.2,1.2,3.1,u,y+1.4,-1.6,['#d99866','#79a554','#cbb577'][j%3]);C(food,3.2,1.4,2.8,u,y+1.4,1.8,['#6d9250','#e6bb63','#b37554'][j%3]);C(glass,3.9,1.8,8,u,y+1.5,0);stats.meals++;}else if(index===1){C(pack,3.3,4.4,4,u,y+2.5,0,palette[(j+l)%8]);C(white,2.1,.8,3,u,y+5.1,0);stats.packages++;}else{for(let k=0;k<2;k++){C(food,3,2,3.5,u,y+1.5,-3+k*5,['#779846','#c2b762','#df8636','#a34b48'][(j+l)%4]);stats.fruit++;}C(glass,3.8,3.4,10,u,y+2,0);}}
  }
  if(index===1||side)for(let k=0;k<bays;k++){const u=-width/2+(k+.5)*width/bays;C(glass,width/bays-1,28,.2,u,19,deep/2+.1);C(steel,.5,8,.7,u+width/bays*.35,19,deep/2+.6);}
 }
 // One recognizable checkout at the old clerk side, leaving the original service coordinate open.
 const r=p.counter,x=r.x+r.w/2,z=r.y+r.h/2;B(wood,r.w,11,r.h,x,6.7,z);B(steel,r.w+1,.8,r.h+1,x,12.6,z);B(dark,22,.3,10,x-5,13.2,z);B(dark,7,1,5,x+11,13.5,z);B(steel,.7,4,.7,x+11,16,z);B(dark,8,6,1,x+11,20,z);B(screen,6,4,.15,x+11,20,z+.6);
 sign(1,p.cold[0].w,8,p.cold[0].x+p.cold[0].w/2,40,b.y+3.8);sign(2,p.cold[1].w,8,p.cold[1].x+p.cold[1].w/2,40,b.y+3.8);sign(4,37,6,x,30,z-3);sign(0,Math.min(110,b.h-60),7,b.x+3.6,40,b.y+b.h/2,Math.PI/2);sign(3,Math.min(110,b.h-60),7,b.x+b.w-3.6,40,b.y+b.h/2,-Math.PI/2);
 for(const [m,by]of batches)for(const [geo,list]of by){const mesh=new T.InstancedMesh(geo,m,list.length);mesh.name='Fresh Market · '+(m===food?'produce and meal stock':m===pack?'pantry and dairy packages':m===glass?'refrigerator glazing':'fixtures');mesh.userData.noBatch=true;mesh.frustumCulled=false;list.forEach((v,i)=>{mesh.setMatrixAt(i,v.matrix);if(m===food||m===pack)mesh.setColorAt(i,color.set(v.tint||'#ffffff'));});root.add(mesh);}
 root.userData.freshMarket={...stats,plan:p,textures};return {root,solids:p.solids,plan:p};
}
const api={plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29FreshMarket=api;
})();
