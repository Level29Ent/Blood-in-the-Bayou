'use strict';
(function(){
function plan(s){
 const r=s.room,w=r.w,h=r.h,depth=Math.min(10,w*.12);
 const fixtures=[{x:-w/2+depth/2+2,z:0,w:depth,h:h-12,kind:'two-tier rack'},{x:w/2-depth/2-2,z:0,w:depth,h:h-12,kind:'two-tier rack'}, {x:0,z:-h/2+9,w:Math.min(32,w-38),h:10,kind:'service counter'}];
 const toWorld=(x,z)=>({x:r.x+w/2+(s.dir===-1?-x:x),y:r.y+h/2+(s.dir===-1?-z:z)});
 return {fixtures,solids:fixtures.map(f=>{const p=toWorld(f.x,f.z);return {x:p.x-f.w/2,y:p.y-f.h/2,w:f.w,h:f.h};}),toWorld};
}
function build(T,s,base=0,sign){
 const r=s.room,w=r.w,h=r.h,p=plan(s),root=new T.Group();root.name='Reference bicycle showroom';root.position.set(r.x+w/2,base,r.y+h/2);if(s.dir===-1)root.rotation.y=Math.PI;
 const mats={},material=(key,color,extra={})=>mats[key]||(mats[key]=new T.MeshStandardMaterial({color,roughness:.7,...extra}));
 const rubber=material('rubber','#1d2427'),steel=material('steel','#a4b0b4',{roughness:.35,metalness:.6}),black=material('black','#30383b'),wood=material('wood','#97724d'),pale=material('pale','#c8b18a'),white=material('white','#eee6d5'),screen=material('screen','#4e8c93'),product=material('product','#ffffff');
 const glow=new T.MeshBasicMaterial({color:'#fff3d9'}),buckets=new Map(),boxGeo=new T.BoxGeometry(1,1,1),rodGeo=new T.CylinderGeometry(1,1,1,8),tireGeo=new T.TorusGeometry(4,.38,6,20),rimGeo=new T.TorusGeometry(3.55,.11,4,20),ringGeo=new T.TorusGeometry(1,.12,4,14),helmetGeo=new T.SphereGeometry(1,10,6,0,Math.PI*2,0,Math.PI/2),m=new T.Object3D(),matrix=new T.Matrix4(),tint=new T.Color();
 const rotation=new T.Quaternion(),up=new T.Vector3(0,1,0);let current=new T.Matrix4(),bikes=0,accessories=0;
 function inst(geo,mat,x,y,z,sx=1,sy=1,sz=1,color,quat){let list=buckets.get(geo);if(!list){list=new Map();buckets.set(geo,list);}if(!list.has(mat))list.set(mat,[]);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.quaternion.copy(quat||rotation.identity());m.updateMatrix();matrix.multiplyMatrices(current,m.matrix);list.get(mat).push({matrix:matrix.clone(),color});}
 const box=(mat,ww,hh,dd,x,y,z,color)=>inst(boxGeo,mat,x,y,z,ww,hh,dd,color);
 function rod(a,b,radius,mat){const start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start),q=new T.Quaternion().setFromUnitVectors(up,delta.clone().normalize());const mid=start.add(end).multiplyScalar(.5);inst(rodGeo,mat,mid.x,mid.y,mid.z,radius,delta.length(),radius,null,q);}
 function bicycle(x,y,z,color,style='road',scale=1){
  const transform=new T.Object3D();transform.position.set(x,y,z);transform.scale.setScalar(scale);transform.rotation.y=-Math.PI/2;transform.updateMatrix();current=transform.matrix;
  // Local bike plane XY; wheelbase, diamond frame and drivetrain are decorative game art.
  const frame=material(color,color,{roughness:.35,metalness:.35}),wheelZ=0;
  for(const xx of [-7,7]){
   inst(tireGeo,rubber,xx,4.4,wheelZ);inst(rimGeo,steel,xx,4.4,.03);
   for(let i=0;i<10;i++){const angle=i*Math.PI/5;rod([xx,4.4,.02],[xx+Math.cos(angle)*3.5,4.4+Math.sin(angle)*3.5,.02],.035,steel);}
   rod([xx,4.4,-.6],[xx,4.4,.6],.18,steel);
  }
  const crank=[0,4.1,0],seat=[-2.6,10.1,0],head=[5.3,10.4,0],rear=[-7,4.4,0],front=[7,4.4,0];
  for(const [a,b]of [[rear,crank],[crank,seat],[seat,rear],[seat,head],[head,crank],[head,front]])rod(a,b,.22,frame);
  // Paired fork and rear stays are visibly split around the wheels.
  for(const side of [-1,1]){rod([5.7,9.1,side*.45],[7,4.4,side*.45],.13,steel);rod([-2.6,10,side*.45],[-7,4.4,side*.45],.12,frame);}
  rod([-2.6,9.7,0],[-2.8,11.8,0],.13,steel);box(black,3.3,.6,1.5,-3,11.9,0);
  rod([5.2,10.4,0],[5.3,12,0],.14,steel);rod([5.3,12,0],[6.5,12,0],.14,steel);
  if(style==='road')for(const side of [-1,1]){rod([6.5,12,0],[6.5,12,side*1.8],.15,black);rod([6.5,12,side*1.8],[7.3,10.8,side*1.8],.17,black);rod([7.3,10.8,side*1.8],[6.3,10.4,side*1.8],.15,black);}
  else{rod([6.4,12,-2.3],[6.4,12,2.3],.16,steel);for(const side of [-1,1])rod([6.4,12,side*1.35],[6.4,12,side*2.4],.22,black);}
  inst(ringGeo,steel,0,4.1,.55);rod([-7,4.4,.6],[0,5.05,.6],.06,black);rod([-7,4.2,.6],[0,3.15,.6],.06,black);
  rod([0,4.1,.65],[1.1,3.1,.65],.14,steel);box(black,1.2,.3,.8,1.2,3,.65);rod([0,4.1,-.65],[-1,5.2,-.65],.14,steel);box(black,1.2,.3,.8,-1,5.3,-.65);
  box(white,.65,2,.7,-.7,7.2,0);current=new T.Matrix4();bikes++;
 }
 // Warm wood showroom floor and bright ceiling panels.
 box(pale,w-4,.15,h-4,0,1.65,0);for(let x=-w/2+4;x<w/2-2;x+=5)box(wood,.12,.05,h-4,x,1.76,0);
 for(const x of [-w*.26,w*.26])for(const z of [-h*.22,h*.22]){box(steel,12,.4,8,x,48,z);box(glow,10,.25,6,x,47.65,z);}
 // Two-tier racks run along the side walls, never across the central entrance aisle.
 const colors=['#c94331','#367b90','#85a639','#dfa33b','#ddd9c9','#563f6f'];
 for(const [k,f]of p.fixtures.slice(0,2).entries()){
  const x=f.x,rows=h>=65?2:1,spacing=(h-20)/rows;
  box(black,.6,32,f.h,k===0?-w/2+1.5:w/2-1.5,19,0);
  for(const level of [2,21]){
   box(wood,f.w,1.4,f.h,x,level,0);
   for(const end of [-1,1])box(steel,1,34,1,x,18,end*(f.h/2-1));
   for(let j=0;j<rows;j++){const z=-(h-20)/2+spacing*(j+.5);bicycle(x,level+.8,z,colors[(k*3+j+(level>10?1:0))%colors.length],j%2?'trail':'road',Math.min(.85,spacing/23));}
  }
 }
 // Hanging show bikes sit high along the rear side bays, not above the doorway.
 for(const side of [-1,1]){const x=side*w*.24,z=-h*.22;rod([x,46,z-5],[x,35,z-5],.11,steel);rod([x,46,z+5],[x,35,z+5],.11,steel);bicycle(x,34,z,side===-1?'#3f8972':'#a84c3b','road',.68);}
 // Rear slatwall, accessories and compact service counter.
 box(black,w-5,34,.6,0,23,-h/2+1.4);for(let y=7;y<40;y+=3)box(steel,w-5,.16,.3,0,y,-h/2+1.8);
 for(const side of [-1,1])for(let row=0;row<3;row++)for(let i=0;i<3;i++){
  const x=side*(w*.26+i*2.4),y=12+row*7,z=-h/2+3;
  box(product,1.9,4,.8,x,y,z,['#42686f','#d58d42','#806069'][(i+row)%3]);box(white,1.2,.8,.1,x,y+.8,z+.5);rod([x,y+2,z-1],[x,y+2,z+.8],.07,steel);accessories++;
 }
 // Open oak accessory cubbies hold helmets and soft bikepacking bags.
 for(const side of [-1,1]){
  const x=side*w*.32,z=-h/2+4;
  box(wood,16,.6,6,x,20,z);box(wood,16,.6,6,x,10,z);
  for(const end of [-1,1])box(wood,.6,10,6,x+end*8,15,z);
  for(let i=0;i<3;i++){
   const xx=x-5+i*5;inst(helmetGeo,product,xx,20.4,z,1.8,1.6,2.1,colors[(i+(side>0?2:0))%colors.length]);
   for(const dx of [-.7,.7])box(black,.24,.16,2,xx+dx,21.8,z);
   box(black,3.4,4,2.5,xx,13,z);box(steel,.22,3,2.6,xx,13,z);accessories+=2;
  }
 }
 // Spare tires hang high on the back wall, like a busy repair shop.
 for(const side of [-1,1])for(let i=0;i<2;i++){
  inst(tireGeo,rubber,side*(w*.26+i*7),31,-h/2+3,.63,.63,.63);accessories++;
 }
 const c=p.fixtures[2];box(wood,c.w,10,c.h,0,6.5,c.z);box(black,c.w+1,1,c.h+1,0,12,c.z);box(steel,6,1,5,6,13,c.z);box(black,5,4,.6,6,15,c.z-1);box(screen,4,2.7,.1,6,15,c.z-.6);box(white,6,.2,4,-6,12.7,c.z);
 // Wrenches and tools behind the service desk; no new gameplay services or purchases.
 for(let i=0;i<5;i++){const x=-6+i*3;rod([x,21,-h/2+2.5],[x,26,-h/2+2.5],.13,steel);inst(ringGeo,steel,x,26,-h/2+2.5,.3,.3,.3);}
 if(sign){sign(root,'BAYOU CYCLES · SALES / SERVICE',w-8,4,0,42,-h/2+2.5,'#f0dbaf');sign(root,'TUNE-UPS · PARTS · GEAR',Math.min(c.w,32),3,0,8,c.z+c.h/2+.6,'#f4e3bd');}
 for(const [geo,groups]of buckets)for(const [mat,items]of groups){const mesh=new T.InstancedMesh(geo,mat,items.length);mesh.userData.noBatch=true;items.forEach((a,i)=>{mesh.setMatrixAt(i,a.matrix);if(a.color)mesh.setColorAt(i,tint.set(a.color));});root.add(mesh);}
 root.userData.bikeShop={bikes,accessories,drawBatches:root.children.length};return {root,solids:p.solids,plan:p};
}
const api={plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29BikeShop=api;
})();
