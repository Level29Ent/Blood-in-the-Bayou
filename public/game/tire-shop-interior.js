'use strict';
(function(){
function matches(v){return v?.kind==='tires';}
function plan(b){const d=Math.min(12,b.w*.13);return {racks:[{x:b.x+4,y:b.y+22,w:d,h:b.h-34},{x:b.x+b.w-4-d,y:b.y+22,w:d,h:b.h-34}],bench:{x:b.x+5,y:b.y+4,w:b.w-10,h:8},solids:[]};}
function build(T,b,base=0,sign){const root=new T.Group();root.name='Tire shop · industrial racks and service bay';const p=plan(b),batches=new Map(),tmp=new T.Object3D(),tint=new T.Color();let tires=0;
 const mat=(c,e={})=>new T.MeshStandardMaterial({color:c,roughness:.75,...e}),rubber=mat('#202427'),tread=mat('#34393b'),yellow=mat('#b7a33d'),steel=mat('#8a969b',{metalness:.5,roughness:.38}),red=mat('#a5322d'),blue=mat('#285caa'),dark=mat('#273035'),white=mat('#dfded2'),floor=mat('#77756d'),glow=new T.MeshBasicMaterial({color:'#fff3d7'});
 const cube=new T.BoxGeometry(1,1,1),torus=new T.TorusGeometry(3.2,1.05,7,20),ring=new T.TorusGeometry(2.1,.12,4,18),cyl=new T.CylinderGeometry(1,1,1,10),sphere=new T.SphereGeometry(1,10,6);
 function inst(g,m,x,y,z,sx=1,sy=1,sz=1,c,rot){if(!batches.has(g))batches.set(g,new Map());const by=batches.get(g);if(!by.has(m))by.set(m,[]);tmp.position.set(x,base+y,z);tmp.scale.set(sx,sy,sz);tmp.rotation.set(...(rot||[0,0,0]));tmp.updateMatrix();by.get(m).push({matrix:tmp.matrix.clone(),c});}
 const box=(m,w,h,d,x,y,z,c)=>inst(cube,m,x,y,z,w,h,d,c);
 function tire(x,y,z,flat=false,scale=1){const rot=flat?[Math.PI/2,0,0]:[0,Math.PI/2,0];inst(torus,rubber,x,y,z,scale,scale,scale,null,rot);inst(ring,steel,x,y,z,scale,scale,scale,null,rot);
  for(let i=0;i<16;i++){const a=i*Math.PI/8;if(flat)inst(cube,tread,x+Math.cos(a)*3.9*scale,y,z+Math.sin(a)*3.9*scale,.65*scale,1.8*scale,.3*scale,null,[0,-a,0]);else inst(cube,tread,x,y+Math.sin(a)*3.9*scale,z+Math.cos(a)*3.9*scale,1.8*scale,.32*scale,.6*scale,null,[-a,0,0]);}
  tires++;
 }
 box(floor,b.w-6,.2,b.h-6,b.x+b.w/2,1,b.y+b.h/2);for(let i=0;i<5;i++){const x=b.x+b.w*.25+i*b.w*.1,z=b.y+b.h*.67;inst(sphere,dark,x,1.14,z,3+i%2,.025,2.5);}
 // Yellow steel storage banks with three stocked tiers and visible sidewall/tread detail.
 for(const r of p.racks){const x=r.x+r.w/2,z=r.y+r.h/2,slots=Math.max(2,Math.floor(r.h/10));
  for(const xx of [r.x+.7,r.x+r.w-.7])for(const zz of [r.y,r.y+r.h])box(yellow,1.1,36,1.1,xx,19,zz);
  for(const y of [3,14,25,36]){box(yellow,r.w,.8,r.h,x,y,z);box(steel,.5,1,r.h,x,y+.6,z);}
  for(let level=0;level<3;level++)for(let i=0;i<slots;i++){const zz=r.y+(i+.5)*r.h/slots;tire(x,7.5+level*11,zz,false,.9);if(i%3===0)box(white,.15,3,2,x+(x<b.x+b.w/2?r.w/2:-r.w/2),8+level*11,zz);}
  p.solids.push({...r});
 }
 // Workbench, blue drawer cabinet, pegboard and hanging workshop hand tools.
 const r=p.bench,x=r.x+r.w/2,z=r.y+r.h/2;box(steel,r.w,1,r.h,x,13,z);box(dark,r.w,11,r.h,x,7,z);box(blue,20,10,8,b.x+b.w*.7,7,z);
 for(let y=4;y<=11;y+=2)box(steel,17,.4,.4,b.x+b.w*.7,y,z+4.3);
 box(white,r.w,17,.5,x,27,b.y+3.5);for(let i=0;i<Math.floor(r.w/5);i++){const xx=r.x+3+i*5;box(steel,.35,7,.4,xx,27,b.y+4.2);inst(ring,steel,xx,31,b.y+4.2,.23,.23,.23);}
 p.solids.push({...r});
 // Tire-changing machine and wheel balancer stay at rear corners, outside the central service pad.
 for(const [i,xx]of [b.x+b.w*.18,b.x+b.w*.82].entries()){
  const zz=b.y+18;box(red,12,10,9,xx,6,zz);box(steel,13,1,10,xx,11.5,zz);
  if(i===0){box(red,2,20,2,xx-5,20,zz-3);box(dark,10,1,1.5,xx,29,zz-3);inst(cyl,steel,xx,13,zz,3.5,2,3.5);}
  else{box(dark,8,5,1,xx,17,zz-3);box(white,6,3,.15,xx,17,zz-2.4);tire(xx,15,zz+2,false,.7);}
  p.solids.push({x:xx-6,y:zz-4.5,w:12,h:9});
 }
 // Empty two-post lift: no fake raised driveable vehicle or new lift mechanics.
 const liftZ=b.y+b.h*.68,offset=Math.max(17,b.w*.21);
 for(const side of [-1,1]){const xx=b.x+b.w/2+side*offset;box(blue,3,29,4,xx,15.5,liftZ);box(steel,5,1,6,xx,1.6,liftZ);box(dark,.4,23,1,xx-side*1.6,16,liftZ);box(yellow,6,.8,1.8,xx-side*2.5,2.6,liftZ+5);box(yellow,6,.8,1.8,xx-side*2.5,2.6,liftZ-5);p.solids.push({x:xx-2.5,y:liftZ-8,w:5,h:16});}
 // Oil drain, rolling red service stool and fire extinguisher by the rack ends.
 const drainX=b.x+b.w-12,drainZ=b.y+b.h-13;inst(cyl,red,drainX,4,drainZ,2,6,2);inst(cyl,steel,drainX,8,drainZ,.3,5,.3);inst(cyl,dark,drainX,11,drainZ,3,.8,3);p.solids.push({x:drainX-3,y:drainZ-3,w:6,h:6});
 // Corrugated roof ribs, exposed red beams, ceiling fan and bright tubes.
 for(let xx=b.x+4;xx<b.x+b.w-3;xx+=4)box(steel,.5,.6,b.h-6,xx,47,b.y+b.h/2);
 for(const zz of [b.y+b.h*.28,b.y+b.h*.7])box(red,b.w-6,1.7,1.5,b.x+b.w/2,46.5,zz);
 const fx=b.x+b.w/2,fz=b.y+b.h*.54;inst(cyl,dark,fx,43,fz,.4,5,.4);inst(cyl,white,fx,40.5,fz,1.8,1,1.8);for(let i=0;i<5;i++){const a=i*Math.PI*.4;inst(cube,dark,fx+Math.cos(a)*5,41,fz+Math.sin(a)*5,8,.3,1.7,null,[0,-a,0]);}
 for(const side of [-1,1]){const xx=b.x+b.w/2+side*b.w*.22;box(dark,16,.6,3,xx,45,b.y+26);box(glow,14,.3,2,xx,44.6,b.y+26);}
 if(sign){sign(root,'TIRE SERVICE · REPAIRS',Math.min(80,b.w-12),5,b.x+b.w/2,39,b.y+4.7,'#f2d68c');sign(root,'PARK OUTSIDE · U FOR SERVICE',Math.min(84,b.w-12),3,b.x+b.w/2,34,b.y+4.9,'#e3e4d8');}
 for(const [g,groups]of batches)for(const [m,items]of groups){const mesh=new T.InstancedMesh(g,m,items.length);mesh.userData.noBatch=true;items.forEach((a,i)=>{mesh.setMatrixAt(i,a.matrix);if(a.c)mesh.setColorAt(i,tint.set(a.c));});root.add(mesh);}
 root.userData.tireShop={tires,drawBatches:root.children.length};return {root,solids:p.solids,plan:p};
}
const api={matches,plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29TireShop=api;
})();
