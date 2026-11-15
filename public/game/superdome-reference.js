'use strict';
(function(){
// Original procedural exterior, proportioned from the supplied Superdome photos.
// Keep the existing solid parcel, story rendezvous and non-enterable stadium.
function plan(b){const r=Math.min(b.w,b.h)*.44;return {x:b.x+b.w/2,z:b.y+b.h/2,r,roofY:r*.61,roofRise:r*.255,profile:[[1,.12],[.99,.18],[.94,.24],[.865,.36],[.87,.405],[.925,.49],[.95,.59],[.945,.61]]};}
function build(T,b){
 const p=plan(b),r=p.r,root=new T.Group(),textures=[];
 root.name='Superdome · white cap and flared bronze cladding';root.position.set(p.x,b.baseY||0,p.z);root.userData.noBatch=true;
 function texture(w,h,paint){if(typeof document==='undefined')return null;const c=document.createElement('canvas');c.width=w;c.height=h;paint(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=4;textures.push(t);return t;}
 const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.62,...extra});
 const cladding=texture(1024,512,(c,w,h)=>{
  const g=c.createLinearGradient(0,0,0,h);for(const[y,col]of [[0,'#c3a372'],[.22,'#bca073'],[.38,'#907249'],[.59,'#665d4d'],[.78,'#978265'],[1,'#c0a77a']])g.addColorStop(y,col);c.fillStyle=g;c.fillRect(0,0,w,h);
  // Fine vertical aluminum panel joints, not heavy rectangular brickwork.
  for(let i=0;i<128;i++){const x=i*w/128;c.fillStyle=i%3?'rgba(24,20,13,.14)':'rgba(255,238,199,.16)';c.fillRect(x,0,1,h);}
 });
 const illumination=texture(1024,512,(c,w,h)=>{
  c.fillStyle='#000';c.fillRect(0,0,w,h);const colors=['#e7ad46','#9142cb','#d23cb4','#e7ad46','#4fa877','#8843bd'];
  for(let i=0;i<48;i++){const x=(i+.5)*w/48,g=c.createLinearGradient(x-12,0,x+12,0);g.addColorStop(0,'#000');g.addColorStop(.5,colors[i%colors.length]);g.addColorStop(1,'#000');c.fillStyle=g;c.fillRect(x-12,0,24,h);}
  const fade=c.createLinearGradient(0,0,0,h);fade.addColorStop(0,'rgba(0,0,0,.3)');fade.addColorStop(.28,'rgba(0,0,0,0)');fade.addColorStop(.55,'rgba(0,0,0,.94)');fade.addColorStop(.8,'rgba(0,0,0,.12)');fade.addColorStop(1,'rgba(0,0,0,1)');c.fillStyle=fade;c.fillRect(0,0,w,h);
 });
 const bronze=mat('#c2aa83',{map:cladding,metalness:.5,roughness:.42,emissive:'#ffffff',emissiveMap:illumination,emissiveIntensity:0});
 const roofMap=texture(1024,512,(c,w,h)=>{
  c.fillStyle='#eeeae0';c.fillRect(0,0,w,h);c.strokeStyle='rgba(115,116,109,.13)';c.lineWidth=1;
  for(let i=0;i<96;i++){const x=i*w/96;c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}
  for(let j=1;j<16;j++){c.fillStyle='rgba(100,103,101,.05)';c.fillRect(0,j*h/16,w,1);}
 });
 const ivory=mat('#f5f2e9',{map:roofMap,roughness:.86}),concrete=mat('#bcb5a3'),glass=mat('#233c3e',{metalness:.3,roughness:.28}),trim=mat('#c4baa4',{metalness:.6,roughness:.35}),dark=mat('#303734');
 function mesh(geo,m,name){const o=new T.Mesh(geo,m);o.name=name;o.userData.noBatch=true;root.add(o);return o;}
 const shell=mesh(new T.LatheGeometry(p.profile.map(([x,y])=>new T.Vector2(x*r,y*r)),128),bronze,'Superdome · inward skirt and outward gold crown');
 mesh(new T.CylinderGeometry(r*1.015,r*1.025,r*.12,128),mat('#b7a27d',{metalness:.22}),'Superdome · continuous entrance podium').position.y=r*.06;
 const roof=mesh(new T.SphereGeometry(r*.945,96,32,0,Math.PI*2,0,Math.PI/2),ivory,'Superdome · shallow white roof');roof.scale.y=p.roofRise/(r*.945);roof.position.y=p.roofY;
 for(const[y,rad]of [[.12,1.002],[.61,.945]]){const ring=mesh(new T.TorusGeometry(r*rad,r*.004,6,128),trim,'Superdome · thin perimeter coping');ring.rotation.x=Math.PI/2;ring.position.y=r*y;}
 const batches=new Map(),cube=new T.BoxGeometry(1,1,1),tmp=new T.Object3D();
 function box(m,w,h,d,x,y,z,a=0){if(!batches.has(m))batches.set(m,[]);tmp.position.set(x,y,z);tmp.scale.set(w,h,d);tmp.rotation.set(0,a,0);tmp.updateMatrix();batches.get(m).push(tmp.matrix.clone());}
 // Recessed entrances and mullions form a dark ribbon below the bronze skin.
 for(let i=0;i<80;i++){const a=i*Math.PI*2/80,rr=r*1.024;box(glass,r*.052,r*.069,.5,Math.sin(a)*rr,r*.054,Math.cos(a)*rr,a);box(trim,.38,r*.08,.7,Math.sin(a+.033)*rr,r*.054,Math.cos(a+.033)*rr,a+.033);}
 for(let k=0;k<4;k++){
  const a=k*Math.PI/2,s=Math.sin(a),c=Math.cos(a),at=(m,w,h,d,x,y,z)=>box(m,w,h,d,x*c+z*s,y,z*c-x*s,a);
  at(dark,r*.39,r*.075,5,0,r*.048,r*1.022);at(glass,r*.35,r*.064,.5,0,r*.05,r*1.047);
  at(trim,r*.44,1.1,10,0,r*.1,r*1.038);
  for(let j=0;j<4;j++)at(concrete,r*.44,.6+j*.55,2.4,0,(.6+j*.55)/2,r*1.123-j*2.4);
  for(const x of [-.16,-.08,0,.08,.16])at(trim,.4,r*.066,.6,x*r,r*.05,r*1.052);
 }
 const lettering=texture(1024,128,(c,w,h)=>{c.clearRect(0,0,w,h);c.textAlign='center';c.textBaseline='middle';c.font='bold 80px sans-serif';c.shadowColor='#302719';c.shadowOffsetX=3;c.shadowOffsetY=4;c.shadowBlur=2;c.fillStyle='#f4eee1';c.fillText('S U P E R D O M E',w/2,h/2,w*.94);});
 if(lettering){const sign=mesh(new T.CylinderGeometry(r*1.026,r*1.026,r*.035,32,1,true,-.39,.78),new T.MeshBasicMaterial({map:lettering,transparent:true,depthWrite:false}),'Superdome · mounted podium lettering');sign.position.y=r*.101;}
 for(const[m,list]of batches){const o=new T.InstancedMesh(cube,m,list.length);o.name='Superdome · batched entrance details';o.userData.noBatch=true;list.forEach((v,i)=>o.setMatrixAt(i,v));root.add(o);}
 root.userData.superdome={plan:p,textures,shell,night:false};return root;
}
function setNight(root,night){const d=root.userData.superdome;night=!!night;if(d.night===night)return;d.night=night;d.shell.material.emissiveIntensity=night?.85:0;}
const api={plan,build,setNight};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29SuperdomeReference=api;
})();
