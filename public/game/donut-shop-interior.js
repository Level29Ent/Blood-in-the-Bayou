'use strict';
(function(){
function matches(v){return v?.depth==='donut';}
function plan(b){const x=b.x,y=b.y,mid=x+b.w/2;
 const cases=[{x:x+8,y:y+20,w:b.w*.34,h:15},{x:x+b.w*.66-8,y:y+20,w:b.w*.34,h:15}];
 const bar={x:x+8,y:y+b.h*.58,w:21,h:b.h*.28};
 const stools=[0,1,2].map(i=>({x:x+39,y:bar.y+6+i*(bar.h-12)/2,w:8,h:8}));
 return {cases,bar,stools,solids:[...cases,bar,...stools.map(s=>({x:s.x-4,y:s.y-4,w:8,h:8}))],service:{x:mid,y:y+b.h*.35},staff:{x:mid,y:y+8}};
}
function build(T,b,base=0,sign){
 const p=plan(b),root=new T.Group();root.name='Crescent Donuts · reference pastry shop';const batches=new Map(),tmp=new T.Object3D(),tint=new T.Color();let pastries=0;
 const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.7,...extra});
 const wood=mat('#765034'),cream=mat('#e6d8b9'),mint=mat('#93b7a2'),steel=mat('#a6b0b0',{metalness:.55,roughness:.32}),black=mat('#222a2c'),dough=mat('#b87e3e',{roughness:.75}),icing=mat('#ffffff',{roughness:.4}),glass=mat('#d1e5e6',{transparent:true,opacity:.12,roughness:.15,depthWrite:false}),glow=new T.MeshBasicMaterial({color:'#fff0cd'});
 const cube=new T.BoxGeometry(1,1,1),ring=new T.TorusGeometry(1,.43,7,16),frost=new T.TorusGeometry(1,.36,5,16),cyl=new T.CylinderGeometry(1,1,1,12),sphere=new T.SphereGeometry(1,10,6),sprinkleGeo=new T.BoxGeometry(.08,.05,.28);
 function inst(geo,m,x,y,z,sx=1,sy=1,sz=1,color,rotation){let bucket=batches.get(geo);if(!bucket){bucket=new Map();batches.set(geo,bucket);}if(!bucket.has(m))bucket.set(m,[]);tmp.position.set(x,base+y,z);tmp.scale.set(sx,sy,sz);tmp.rotation.set(...(rotation||[0,0,0]));tmp.updateMatrix();bucket.get(m).push({matrix:tmp.matrix.clone(),color});}
 const box=(m,w,h,d,x,y,z,color)=>inst(cube,m,x,y,z,w,h,d,color);
 const colors=['#dc5290','#351b12','#c99437','#e7dfc9','#a97522','#71a97e'];
 function donut(x,y,z,i){const type=i%5;
  if(type===3){inst(sphere,dough,x,y,z,1.6,.55,.9);box(icing,2.6,.24,1.5,x,y+.57,z,colors[i%6]);}
  else if(type===4){inst(sphere,dough,x,y,z,1,.6,1);inst(sphere,icing,x,y+.35,z,.85,.22,.85,colors[i%6]);}
  else{inst(ring,dough,x,y,z,1,1,.9,null,[Math.PI/2,0,0]);inst(frost,icing,x,y+.36,z,1,1,.75,colors[i%6],[Math.PI/2,0,0]);}
  if(i%3===0)for(let n=0;n<7;n++){const a=n*.9;inst(sprinkleGeo,icing,x+Math.cos(a)*.92,y+.65,z+Math.sin(a)*.92,1,1,1,['#f9dc52','#f0c2cf','#edf0e6'][n%3],[0,a,0]);}pastries++;
 }
 // Mint walls, warm wood wainscoting and a tiled customer floor.
 box(cream,b.w-6,.2,b.h-6,b.x+b.w/2,1,b.y+b.h/2);
 for(let x=b.x+4;x<b.x+b.w-3;x+=12)box(steel,.12,.04,b.h-6,x,1.13,b.y+b.h/2);
 for(let z=b.y+4;z<b.y+b.h-3;z+=12)box(steel,b.w-6,.04,.12,b.x+b.w/2,1.13,z);
 box(mint,b.w-7,32,.4,b.x+b.w/2,32,b.y+3.3);box(wood,b.w-7,13,.5,b.x+b.w/2,7.5,b.y+3.5);
 for(const side of [-1,1]){const x=side===-1?b.x+3.5:b.x+b.w-3.5;box(mint,.5,32,b.h-7,x,32,b.y+b.h/2);box(wood,.5,13,b.h-7,x,7.5,b.y+b.h/2);}
 // Two illuminated pastry cabinets preserve the original central service point.
 for(const [k,r]of p.cases.entries()){
  const x=r.x+r.w/2,z=r.y+r.h/2;box(wood,r.w,6,r.h,x,4,z);box(steel,r.w+1,1,r.h+1,x,7.5,z);
  for(const end of [-1,1])box(steel,.7,19,r.h,x+end*r.w/2,17,z);
  for(let row=0;row<3;row++){
   const y=9+row*5;box(steel,r.w-1,.45,r.h-1,x,y,z);box(glow,r.w-2,.2,.6,x,y+4.2,r.y+1);
   const trays=Math.max(2,Math.floor(r.w/15)),step=r.w/trays;
   for(let t=0;t<trays;t++){const xx=r.x+step*(t+.5);box(cream,step-1,.25,r.h-2,xx,y+.4,z);for(let a=0;a<3;a++)for(let d=0;d<2;d++)donut(xx-step*.3+a*step*.3,y+1.2,z-3+d*5,t+row*7+a+k*3);}
  }
  // Sloping front glazing and horizontal top retain visible tray contents.
  inst(cube,glass,x,18,r.y+r.h+.3,r.w-1,19,.3,null,[-.11,0,0]);box(glass,r.w,.4,r.h,x,27.5,z);box(steel,r.w+1,.6,.7,x,27.7,r.y+r.h+.4);
  for(let i=0;i<3;i++){box(cream,6,.3,5,r.x+5+i*7,29,z);box(wood,.3,2,5,r.x+5+i*7,30,z);}
 }
 // Wood cabinets, coffee station, cups and donut-box stacks behind the cases.
 for(const side of [-1,1]){
  const x=b.x+b.w/2+side*b.w*.32;box(wood,b.w*.25,12,8,x,8,b.y+8);box(cream,b.w*.25+1,1,9,x,14.5,b.y+8);
  box(wood,b.w*.25,11,5,x,36,b.y+6);for(let i=0;i<3;i++)box(steel,.3,2,.4,x-8+i*8,36,b.y+8.7);
 }
 box(black,10,10,6,b.x+b.w*.25,20,b.y+8);box(steel,8,2,5,b.x+b.w*.25,15.7,b.y+11);box(cream,4,5,4,b.x+b.w*.25,18,b.y+13);
 for(let i=0;i<4;i++)inst(cyl,cream,b.x+b.w*.34+i*2,16+i*.6,b.y+9,.8,2,.8);
 for(let i=0;i<4;i++)box(cream,12,1.2,8,b.x+b.w*.79,15.5+i*1.3,b.y+8);
 // Chrome-rimmed diner stools alongside a compact side counter.
 const r=p.bar,x=r.x+r.w/2,z=r.y+r.h/2;box(cream,r.w,11,r.h,x,6.5,z);box(steel,r.w+2,1,r.h+2,x,12.5,z);
 for(const s of p.stools){inst(cyl,steel,s.x,2,s.y,3.8,.8,3.8);inst(cyl,steel,s.x,6,s.y,.65,8,.65);inst(cyl,steel,s.x,10,s.y,4,1,4);inst(cyl,black,s.x,11,s.y,3.7,1.2,3.7);}
 for(let i=0;i<2;i++){const xx=r.x+7,zz=r.y+9+i*14;inst(cyl,cream,xx,14,zz,1,2.2,1);box(black,4,3,3,xx+6,14.5,zz);}
 // Pendant cages over cases and warm white ceiling panels (no real-time lights).
 for(const side of [-1,1])for(let i=0;i<2;i++){
  const x=b.x+b.w/2+side*(b.w*.2+i*8),z=b.y+34;inst(cyl,black,x,46,z,.12,7,.12);inst(sphere,glow,x,41,z,1.1,1.7,1.1);
  for(const dx of [-1.8,1.8])box(steel,.12,5,.12,x+dx,41,z);for(const y of [38.5,43.5])box(steel,3.6,.15,3.6,x,y,z);
 }
 for(const x of [b.x+b.w*.3,b.x+b.w*.7])for(const z of [b.y+51,b.y+b.h-22]){box(steel,20,.5,12,x,50,z);box(glow,18,.3,10,x,49.6,z);}
 if(sign){sign(root,'CRESCENT DONUTS · FRESH DAILY',b.w*.6,6,b.x+b.w/2,44,b.y+4.2,'#ffe9b7');sign(root,'GLAZED · CHOCOLATE · SPRINKLES',b.w*.34,4,b.x+b.w/2,36,b.y+4.4,'#f5c0d2');sign(root,'COFFEE  /  PASTRIES  /  BREAKFAST',b.w*.34,4,b.x+b.w/2,30,b.y+4.5,'#f5e4ba');sign(root,'ORDER HERE',22,4,b.x+b.w/2,22,b.y+19,'#f4e3c4');}
 for(const [geo,groups]of batches)for(const [m,items]of groups){const mesh=new T.InstancedMesh(geo,m,items.length);mesh.userData.noBatch=true;items.forEach((a,i)=>{mesh.setMatrixAt(i,a.matrix);if(a.color)mesh.setColorAt(i,tint.set(a.color));});root.add(mesh);}
 root.userData.donutShop={pastries,drawBatches:root.children.length};return {root,plan:p,solids:p.solids};
}
const api={matches,plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29DonutShop=api;
})();
