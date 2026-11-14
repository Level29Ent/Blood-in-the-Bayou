'use strict';
(function(){
function matches(v){return v?.careerBusiness==='tow';}
function plan(b){const mid=b.x+b.w/2,office={x:b.x+5,y:b.y+4,w:b.w-10,h:Math.min(21,b.h*.17)},cars=[],rows=Math.max(2,Math.floor((b.h-44)/17)),columns=Math.max(1,Math.floor((b.w/2-32)/26));
 for(const side of [-1,1])for(let row=0;row<rows;row++)for(let col=0;col<columns;col++)cars.push({x:mid+side*(45+col*26),y:b.y+38+row*17,tow:row===0,col,row,side});
 const fence=[{x:b.x+2,y:b.y+2,w:1,h:b.h-4},{x:b.x+b.w-3,y:b.y+2,w:1,h:b.h-4},{x:b.x+2,y:b.y+2,w:b.w-4,h:1},{x:b.x+2,y:b.y+b.h-3,w:b.w/2-44,h:1},{x:mid+42,y:b.y+b.h-3,w:b.w/2-44,h:1}];
 return {office,cars,solids:[office,...cars.map(c=>({x:c.x-12,y:c.y-6,w:24,h:12})),...fence],gate:{x:mid,y:b.y+b.h},officeDoor:{x:mid,y:office.y+office.h}};
}
function build(T,b,{sign}={}){const root=new T.Group();root.name='29 Tow & Impound · fenced vehicle yard';const p=plan(b),buckets=new Map(),o=new T.Object3D(),color=new T.Color();
 const mat=(c,e={})=>new T.MeshStandardMaterial({color:c,roughness:.75,...e}),asphalt=mat('#595e5b'),tan=mat('#b4a07d'),trim=mat('#736754'),roofMat=mat('#423a35'),dark=mat('#202a2d'),steel=mat('#a7b0ac',{metalness:.45,roughness:.42}),rubber=mat('#252728'),paint=mat('#ffffff',{metalness:.18,roughness:.5}),windowMat=mat('#3d535d',{metalness:.25,roughness:.32}),white=mat('#e4ddd0'),yellow=mat('#d4ac46');
 const cube=new T.BoxGeometry(1,1,1),cyl=new T.CylinderGeometry(1,1,1,10),sphere=new T.SphereGeometry(1,8,5);let rot=new T.Quaternion();
 function inst(g,m,x,y,z,sx=1,sy=1,sz=1,c,q){if(!buckets.has(g))buckets.set(g,new Map());const by=buckets.get(g);if(!by.has(m))by.set(m,[]);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.quaternion.copy(q||rot.identity());o.updateMatrix();by.get(m).push({matrix:o.matrix.clone(),c});}
 const box=(m,w,h,d,x,y,z,c)=>inst(cube,m,x,y,z,w,h,d,c);
 function rod(a,b,r,m=steel){const av=new T.Vector3(...a),bv=new T.Vector3(...b),v=bv.clone().sub(av),mid=av.add(bv).multiplyScalar(.5);inst(cyl,m,mid.x,mid.y,mid.z,r,v.length(),r,null,new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),v.normalize()));}
 const mid=b.x+b.w/2;box(asphalt,b.w-2,.3,b.h-2,mid,.85,b.y+b.h/2);
 // Cracked, patched pavement and parking stripes; all flush scenery.
 for(let i=0;i<16;i++)inst(sphere,dark,b.x+8+(i*31)%(b.w-16),1.02,b.y+26+(i*19)%(b.h-32),2.5+i%3,.025,1.6);
 for(const c of p.cars){box(white,25,.05,.25,c.x,1.05,c.y-8);box(yellow,.3,.05,10,c.x+12.5,1.05,c.y);}
 // Two-storey tan dispatch office, like the reference fleet yard. Upper floor is scenery.
 const r=p.office,x=r.x+r.w/2,z=r.y+r.h/2;box(tan,r.w,27,r.h,x,14,z);box(trim,r.w+2,1,r.h+2,x,28,z);
 // Pitched roof is a simple original gable, no image textures.
 const roofGeo=new T.BufferGeometry(),xx=r.w/2+2,zz=r.h/2+2;roofGeo.setAttribute('position',new T.Float32BufferAttribute([-xx,0,-zz,xx,0,-zz,xx,5,0,-xx,0,-zz,xx,5,0,-xx,5,0,-xx,5,0,xx,5,0,xx,0,zz,-xx,5,0,xx,0,zz,-xx,0,zz],3));roofGeo.computeVertexNormals();const roof=new T.Mesh(roofGeo,new T.MeshStandardMaterial({color:'#443832',side:T.DoubleSide}));roof.position.set(x,28.5,z);root.add(roof);
 box(dark,8,12,.3,mid,7,r.y+r.h+.25);box(windowMat,5,7,.35,mid,9,r.y+r.h+.5);box(steel,.4,2,.5,mid+2,7,r.y+r.h+.8);
 const count=Math.max(3,Math.floor(r.w/19));for(let i=0;i<count;i++){const wx=r.x+(i+.5)*r.w/count;box(trim,10,7,.6,wx,21,r.y+r.h+.3);box(windowMat,8,5,.7,wx,21,r.y+r.h+.4);box(white,.4,5,.8,wx,21,r.y+r.h+.5);if(Math.abs(wx-mid)>10){box(trim,10,6,.6,wx,8,r.y+r.h+.3);box(windowMat,8,4,.7,wx,8,r.y+r.h+.4);}}
 // Compact parked models are scenery only, not inserted into driveable vehicle/AI pools.
 const colors=['#c3cac5','#893e39','#3b6471','#273f47','#9c8a5b','#514755','#d7d0ba'];
 for(const [i,c]of p.cars.entries()){
  const x=c.x,z=c.y,bodyColor=c.tow?(i%2?'#a43730':'#d5d9d3'):colors[i%colors.length],wagon=i%3===0;
  box(rubber,22,1.2,9.5,x,2,z);box(paint,23,3.2,10.5,x,4,z,bodyColor);box(steel,1,1,10.8,x-11.7,3.1,z);box(steel,1,1,10.8,x+11.7,3.1,z);
  box(windowMat,c.tow?7:wagon?13:10,4,9.2,x+(c.tow?5:0),7.2,z);box(paint,c.tow?7.5:wagon?13.5:10.5,.7,9.8,x+(c.tow?5:0),9.6,z,bodyColor);
  for(const side of [-1,1]){for(const dx of [-7,7]){inst(cyl,rubber,x+dx,2.6,z+side*5.3,2.4,1.1,2.4,null,new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),Math.PI/2));inst(cyl,steel,x+dx,2.6,z+side*5.9,1.3,.2,1.3,null,new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),Math.PI/2));}box(paint,.5,4,9.6,x+(c.tow?5:0),7.1,z,bodyColor);box(white,.4,1,2.2,x+11.9,4.5,z+side*3.5);box(paint,.4,1,2,x-11.9,4.5,z+side*3.5,'#ab302d');box(steel,2,.3,.2,x+3,4.6,z+side*5.4);}
  if(c.tow){box(dark,13,.7,10,x-4.5,5.8,z);rod([x-3,6,z],[x-8,13,z],.6,dark);rod([x-8,13,z],[x-11,7,z],.12);box(yellow,3,.6,1.4,x+5,10.5,z);box(white,4,1,.2,x+6,5,z+5.5);}
  else if(i%4===1){const hood=new T.Mesh(new T.BoxGeometry(6,.6,9),paint.clone());hood.material.color.set(bodyColor);hood.position.set(x+8,8,z);hood.rotation.z=-.65;root.add(hood);}
 }
 // Chain-link fencing uses one small alpha texture, not thousands of wire cylinders.
 const size=32,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const d1=(x-y+size)%16,d2=(x+y)%16,a=d1<2||d2<2?180:0;data.set([167,179,174,a],(y*size+x)*4);}const meshMap=new T.DataTexture(data,size,size);meshMap.wrapS=meshMap.wrapT=T.RepeatWrapping;meshMap.needsUpdate=true;
 const fenceMat=new T.MeshStandardMaterial({color:'#b3bcb4',map:meshMap,transparent:true,alphaTest:.3,side:T.DoubleSide,roughness:.7,depthWrite:false});
 function fence(ax,az,bx,bz){const len=Math.hypot(bx-ax,bz-az),geo=new T.PlaneGeometry(len,12),uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*len/5,uv.getY(i)*2.4);const wall=new T.Mesh(geo,fenceMat);wall.position.set((ax+bx)/2,7,(az+bz)/2);wall.rotation.y=-Math.atan2(bz-az,bx-ax);root.add(wall);rod([ax,13,az],[bx,13,bz],.18);for(let d=0;d<=len;d+=12){const t=d/len;rod([ax+(bx-ax)*t,1,az+(bz-az)*t],[ax+(bx-ax)*t,15,az+(bz-az)*t],.3);}}
 fence(b.x+2,b.y+2,b.x+2,b.y+b.h-2);fence(b.x+b.w-2,b.y+2,b.x+b.w-2,b.y+b.h-2);fence(b.x+2,b.y+2,b.x+b.w-2,b.y+2);fence(b.x+2,b.y+b.h-2,mid-42,b.y+b.h-2);fence(mid+42,b.y+b.h-2,b.x+b.w-2,b.y+b.h-2);
 if(sign){sign(root,'29 TOW & IMPOUND',Math.min(95,r.w-5),5,mid,16,r.y+r.h+.9,'#f2dfae');sign(root,'NO TRESPASSING',Math.min(27,b.w*.2),4,b.x+b.w*.2,10,b.y+b.h-1,'#ecb5a4');sign(root,'DISPATCH · KEEP LANE CLEAR',Math.min(48,b.w*.32),3,mid,31,r.y+r.h+1,'#e9e4cd');}
 for(const [g,groups]of buckets)for(const [m,items]of groups){const mesh=new T.InstancedMesh(g,m,items.length);mesh.userData.noBatch=true;items.forEach((a,i)=>{mesh.setMatrixAt(i,a.matrix);if(a.c)mesh.setColorAt(i,color.set(a.c));});root.add(mesh);}root.traverse(o=>{if(o.isMesh)o.userData.noBatch=true;});root.userData.towYard={vehicles:p.cars.length,towTrucks:p.cars.filter(c=>c.tow).length};return {root,solids:p.solids,plan:p};
}
const api={matches,plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29TowYard=api;
})();
