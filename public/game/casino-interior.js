'use strict';
(function(){
// Original procedural furnishings inspired by the casino references, not photo billboards.
function plan(b){
 const cx=b.x+b.w/2,slots=[],tables=[],columns=[];
 for(const side of [-1,1]){
  for(let i=0;i<6;i++)slots.push({x:cx+side*132,z:b.y+28+i*24,angle:-side*Math.PI/2});
  for(const dx of [44,72])slots.push({x:cx+side*dx,z:b.y+15,angle:0});
  for(const zz of [78,134])tables.push({x:cx+side*49,z:b.y+zz});
  for(const zz of [43,102,162])columns.push({x:cx+side*86,z:b.y+zz});
 }
 const solids=[...slots.map(s=>({x:s.x+Math.sin(s.angle)*7.5-(s.angle?13.5:9),y:s.z+Math.cos(s.angle)*7.5-(s.angle?9:13.5),w:s.angle?27:18,h:s.angle?18:27,kind:'slot-and-seat'})),...tables.map(s=>({x:s.x-23,y:s.z-14,w:46,h:28,kind:'table'})),...tables.flatMap(s=>[-13,13].map(dx=>({x:s.x+dx-4,y:s.z+17,w:8,h:10,kind:'chair'}))),...columns.map(s=>({x:s.x-3,y:s.z-3,w:6,h:6,kind:'column'}))];
 return {slots,tables,columns,solids,entry:{x:cx,y:b.y+b.h-28},gaming:{x:cx,y:b.y+b.h-35}};
}
function build(T,b){
 const root=new T.Group();root.name='BoomCity · grand gold casino gaming deck';const p=plan(b),batches=new Map();
 const texture=(kind)=>{
  if(typeof document==='undefined')return null;
  const c=document.createElement('canvas');c.width=kind==='screen'?256:512;c.height=kind==='screen'?512:512;const a=c.getContext('2d');if(!a)return null;
  if(kind==='carpet'){
   a.fillStyle='#591e35';a.fillRect(0,0,512,512);
   // Interlocking scrolls, gold petals and jewel-toned diamonds, seamless at tile edges.
   for(let y=-128;y<=640;y+=128)for(let x=-128;x<=640;x+=128){
    a.strokeStyle='#bd874a';a.lineWidth=3;a.beginPath();a.moveTo(x,y-54);a.lineTo(x+54,y);a.lineTo(x,y+54);a.lineTo(x-54,y);a.closePath();a.stroke();
    a.strokeStyle='#c25548';a.lineWidth=7;for(let i=0;i<4;i++){a.save();a.translate(x,y);a.rotate(i*Math.PI/2);a.beginPath();a.moveTo(0,0);a.bezierCurveTo(50,-48,65,39,24,25);a.bezierCurveTo(5,16,19,4,28,13);a.stroke();a.restore();}
    a.fillStyle='#d7a65b';a.beginPath();a.ellipse(x,y,4,9,Math.PI/4,0,Math.PI*2);a.fill();a.fillStyle='#36525b';a.beginPath();a.arc(x+64,y+64,12,0,Math.PI*2);a.fill();
   }
  }else if(kind==='screen'){
   const grad=a.createLinearGradient(0,0,0,512);grad.addColorStop(0,'#502d8c');grad.addColorStop(.5,'#142753');grad.addColorStop(1,'#551b46');a.fillStyle=grad;a.fillRect(0,0,256,512);
   a.strokeStyle='#ffd878';a.lineWidth=7;a.strokeRect(7,7,242,498);a.fillStyle='#ffe294';a.textAlign='center';a.font='bold 27px Georgia';a.fillText('BOOMCITY',128,48);a.font='bold 40px Georgia';a.fillText('GOLD 7',128,104);a.fillStyle='#151523';a.fillRect(20,130,216,44);a.fillStyle='#ffda65';a.font='bold 24px monospace';a.fillText('$ 29,777',128,161);
   for(let row=0;row<3;row++)for(let col=0;col<3;col++){const x=25+col*70,y=204+row*65;a.fillStyle='#fff0c7';a.fillRect(x,y,64,59);a.fillStyle=(row+col)%2?'#a52145':'#613e99';a.font='bold 42px Georgia';a.fillText(['7','♠','♦'][(row+col)%3],x+32,y+45);}
   a.fillStyle='#ffe294';a.font='bold 20px sans-serif';a.fillText('BAYOU JACKPOT',128,453);a.font='16px sans-serif';a.fillText('FICTIONAL GAME CREDITS',128,482);
  }else{
   a.fillStyle='#147e61';a.fillRect(0,0,512,512);a.strokeStyle='#e8d99b';a.lineWidth=3;a.beginPath();a.ellipse(256,285,210,170,0,Math.PI,Math.PI*2);a.stroke();a.textAlign='center';a.fillStyle='#f3e9bc';a.font='bold 29px Georgia';a.fillText('BOOMCITY',256,206);a.font='19px Georgia';a.fillText('BLACKJACK PAYS 3 TO 2',256,245);a.font='14px sans-serif';a.fillText('FICTIONAL CREDITS ONLY',256,275);for(let i=0;i<5;i++)a.strokeRect(60+i*83,340,54,75);
  }
  const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;if(kind==='carpet'){t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(5,3);}return t;
 };
 // Three r149 uses legacy linear Color inputs; decode CSS swatches before sRGB output.
 const linear=m=>{m.color.convertSRGBToLinear();if(m.emissive)m.emissive.convertSRGBToLinear();return m;},mat=(color,roughness=.7,extra={})=>linear(new T.MeshStandardMaterial({color,roughness,...extra})),basic=(color,extra={})=>linear(new T.MeshBasicMaterial({color,...extra}));
 const gold=mat('#c2984d',.34,{metalness:.65}),cream=mat('#e1c693',.65,{emissive:'#9a6831',emissiveIntensity:.18}),wine=mat('#682d40'),wood=mat('#35202b',.48),black=mat('#141925',.4,{metalness:.28}),leather=mat('#352132',.82),felt=mat('#137857',.95),carpet=mat('#ffffff',1,{map:texture('carpet')}),blue=basic('#6367ff'),amber=basic('#ffe1a0'),screen=basic('#ffffff',{map:texture('screen')}),markings=basic('#ffffff',{map:texture('felt')});
 if(!carpet.map)carpet.color.set('#72283e');if(!screen.map)screen.color.set('#7565cf');if(!markings.map)markings.color.set('#147e61');
 const box=new T.BoxGeometry(1,1,1),cyl=new T.CylinderGeometry(1,1,1,16),sphere=new T.SphereGeometry(1,12,8),plane=new T.PlaneGeometry(1,1);
 function emit(geo,m,w,h,d,x,y,z,angle=0,rx=0){if(!batches.has(m))batches.set(m,new Map());const bucket=batches.get(m);if(!bucket.has(geo))bucket.set(geo,[]);bucket.get(geo).push({w,h,d,x,y,z,angle,rx});}
 const B=(w,h,d,x,y,z,m,angle=0)=>emit(box,m,w,h,d,x,y,z,angle),C=(r,h,rz,x,y,z,m)=>emit(cyl,m,r,h,rz,x,y,z),cx=b.x+b.w/2,cz=b.y+b.h/2;
 B(b.w-7,.16,b.h-7,cx,1.13,cz,carpet);
 // Central burgundy runner and inlaid brass borders, not obstacles in the entry lane.
 B(40,.05,b.h-6,cx,1.25,cz,wine);for(const dx of [-21,21]){B(1,.06,b.h-6,cx+dx,1.26,cz,gold);B(.4,.07,b.h-6,cx+dx*1.1,1.27,cz,cream);}
 // Paneled walls / wainscoting and layered crown moulding inside the existing collision shell.
 for(const side of [-1,1]){
  const x=cx+side*(b.w/2-2.8);B(1,40,b.h-4,x,21,cz,wine);B(1.4,8,b.h-4,x-side*.3,5,cz,wood);
  for(const y of [9,31,35,39])B(2,1,b.h-4,x-side*.4,y,cz,gold);
  for(let z=b.y+8;z<b.y+b.h-8;z+=26)B(1.4,21,.65,x-side*.4,20,z,gold);
 }
 B(b.w-5,40,1,cx,21,b.y+2.7,wine);for(const y of [9,31,35,39])B(b.w-5,1,1.5,cx,y,b.y+3,gold);
 // Shallow barrel vault plus stepped side coffers fit below the next 48-unit deck.
 const strips=24;for(let i=0;i<strips;i++){const a=i*Math.PI/strips,bb=(i+1)*Math.PI/strips,x1=cx-80*Math.cos(a),x2=cx-80*Math.cos(bb),y1=35+9*Math.sin(a),y2=35+9*Math.sin(bb),w=Math.hypot(x2-x1,y2-y1);const geo=new T.BoxGeometry(w+.12,.45,b.h-5),mesh=new T.Mesh(geo,cream);mesh.position.set((x1+x2)/2,(y1+y2)/2,cz);mesh.rotation.z=Math.atan2(y2-y1,x2-x1);root.add(mesh);}
 const rib=new T.TorusGeometry(1,.02,5,48,Math.PI);for(const zz of [8,66,124,183])emit(rib,gold,80,9,80,cx,34.4,b.y+zz);
 for(const side of [-1,1]){B(74,.7,b.h-5,cx+side*119,37,cz,wood);for(const dx of [80,84,153]){B(1.3,1.2,b.h-5,cx+side*dx,35.4,cz,gold);B(.6,.3,b.h-5,cx+side*(dx+1),34.7,cz,amber);}for(const zz of [35,94,153]){B(68,.8,2,cx+side*119,36,b.y+zz,gold);B(58,.3,1,cx+side*119,35.5,b.y+zz+2,blue);}}
 // Columns define the vaulted table hall without cutting the central or perimeter aisles.
 for(const s of p.columns){C(2,29,2,s.x,16,s.z,cream);for(const y of [2,4,29,31,33])C(y===33?3.6:3,1,3,s.x,y,s.z,gold);}
 // Three tiered chandeliers. Emissive crystal beads add no real-time lights or shadow maps.
 for(const zz of [37,96,155]){const z=b.y+zz;C(4,.5,4,cx,43,z,gold);C(.3,8,.3,cx,39,z,gold);for(const [r,y]of [[8,32],[5.5,29],[3,26]]){C(r,.5,r,cx,y,z,gold);for(let i=0;i<10;i++){const a=i*Math.PI/5;emit(sphere,amber,.7,1.5,.7,cx+Math.cos(a)*r,y-1.2,z+Math.sin(a)*r);}}emit(sphere,amber,1.7,2,1.7,cx,24,z);}
 const chair=(x,z,angle)=>{const part=(w,h,d,dx,y,dz,m)=>B(w,h,d,x+dx*Math.cos(angle)+dz*Math.sin(angle),y,z-dx*Math.sin(angle)+dz*Math.cos(angle),m,angle);C(.65,5,.65,x,4,z,gold);C(3.6,.5,3.6,x,1.7,z,black);part(8,1.6,8,0,7,0,leather);part(8,8,1.5,0,11.2,3.5,leather);part(8.4,.6,1.7,0,15.3,3.5,gold);};
 for(let i=0;i<p.slots.length;i++){
  const s=p.slots[i],a=s.angle,part=(w,h,d,dx,y,dz,m)=>B(w,h,d,s.x+dx*Math.cos(a)+dz*Math.sin(a),y,s.z-dx*Math.sin(a)+dz*Math.cos(a),m,a);
  part(17,3,12,0,2.7,0,black);part(16,14,11,0,11,0,wood);part(17,18,5,0,24,-2,black);part(14.6,15.7,.3,0,24,.7,gold);
  emit(plane,screen,12.8,14,1,s.x+Math.sin(a)*.9,24,s.z+Math.cos(a)*.9,a);
  for(const dx of [-8.5,8.5])part(.7,18,.8,dx,24,1,i%2?blue:amber);
  part(18,1.5,7,0,14,5,black);part(15,.3,1,0,15,7.5,blue);for(const dx of [-4,0,4])part(1.8,.4,1.2,dx,15,5,amber);
  part(18,4,3,0,35,-2,gold);part(16,2.8,.3,0,35,-.3,i%2?blue:amber);
  chair(s.x+Math.sin(a)*15,s.z+Math.cos(a)*15,a);
 }
 for(const s of p.tables){
  for(const dx of [-14,14])C(1.5,9,1.5,s.x+dx,6,s.z,wood);C(23,2,14,s.x,11,s.z,wood);C(21.5,.4,12.5,s.x,12.2,s.z,gold);C(20.5,.3,11.5,s.x,12.55,s.z,felt);
  emit(plane,markings,31,16,1,s.x,12.73,s.z,0,-Math.PI/2);
  B(8,.5,3,s.x,13,s.z-7,black);for(let i=0;i<6;i++)C(.6,.5,.6,s.x-4+i*1.4,13.2,s.z-5,i%2?gold:cream);
  for(const dx of [-13,13])chair(s.x+dx,s.z+22,0);
 }
 const dummy=new T.Object3D();for(const [m,geos]of batches)for(const [geo,list]of geos){const mesh=new T.InstancedMesh(geo,m,list.length);mesh.name='Casino · '+(m===screen?'illuminated reel displays':m===carpet?'patterned carpet':'batched furnishings');list.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.rotation.set(v.rx,v.angle,0);dummy.scale.set(v.w,v.h,v.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.userData.noBatch=true;mesh.frustumCulled=false;root.add(mesh);}
 root.userData.casino={slots:p.slots.length,tables:p.tables.length,chandeliers:3,plan:p};return {root,solids:p.solids,plan:p};
}
const api={plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29CasinoInterior=api;
})();
