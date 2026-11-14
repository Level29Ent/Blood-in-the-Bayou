'use strict';
(function(){
const DEPARTMENTS=['Lobby / Reception','X-Ray / Imaging','Morgue / Cold Storage','Patient Wards','Recovery / Dispatch'];
function plan(b,level){const cx=b.x+b.w/2,bedPoints=[{x:b.x+45,y:b.y+106},{x:b.x+b.w-45,y:b.y+106},{x:b.x+45,y:b.y+181}];return {level,cx,entry:{x:cx,y:b.y+b.h-8},elevator:{x:cx,y:b.y+b.h-24},landing:{x:cx,y:b.y+b.h-37},staff:{x:cx,y:b.y+(level===2?45:30)},beds:level>=3?bedPoints:[],bays:level===1?[{x:b.x+45,y:b.y+115},{x:b.x+b.w-45,y:b.y+115}]:level>=3?bedPoints:[],stretchers:level===2?[-1,1].flatMap(side=>[112,184].map(z=>({x:cx+side*86,y:b.y+z}))):[]};}
function build(T,b,base=0,level=0){const root=new T.Group();root.name='General Hospital · '+DEPARTMENTS[level];const p=plan(b,level),solids=[],batches=new Map(),maps=[];
 const tex=(kind)=>{if(typeof document==='undefined')return null;const c=document.createElement('canvas');c.width=512;c.height=256;const a=c.getContext('2d');if(!a)return null;
 if(kind==='monitor'){a.fillStyle='#10252b';a.fillRect(0,0,512,256);a.strokeStyle='#1d4544';a.lineWidth=1;for(let x=0;x<512;x+=16){a.beginPath();a.moveTo(x,0);a.lineTo(x,256);a.stroke();}for(let y=0;y<256;y+=16){a.beginPath();a.moveTo(0,y);a.lineTo(512,y);a.stroke();}for(let j=0;j<3;j++){a.strokeStyle=['#73ef9a','#f8d16a','#71c9e2'][j];a.lineWidth=3;a.beginPath();for(let x=8;x<385;x++){let y=56+j*65+Math.sin(x*.06+j)*6;const t=x%110;if(j===0&&t>40&&t<57)y+=(t<48?-1:1)*(1-Math.abs(t-48)/9)*33;x===8?a.moveTo(x,y):a.lineTo(x,y);}a.stroke();a.fillStyle=a.strokeStyle;a.font='bold 34px monospace';a.fillText(['72','98','120'][j],400,66+j*65);}a.fillStyle='#c8e5df';a.font='16px sans-serif';a.fillText('GENERAL HOSPITAL · DEMO',12,242);
 }else if(kind==='sign'){a.fillStyle='#16445c';a.fillRect(0,0,512,256);a.fillStyle='#fff';a.textAlign='center';a.font='bold 34px sans-serif';a.fillText('GENERAL HOSPITAL',256,57);a.font='24px sans-serif';a.fillText(DEPARTMENTS[level].toUpperCase(),256,115);a.font='20px sans-serif';a.fillText('PATIENT CARE  +  ELEVATOR  ↓',256,184);a.fillStyle='#b8d6df';a.fillRect(24,213,464,3);
 }else{a.fillStyle='#eef0e8';a.fillRect(0,0,512,256);for(let x=0;x<512;x+=64)for(let y=0;y<256;y+=64){a.fillStyle=((x*7+y*13)%17)>8?'#e1e2d7':'#e8e9df';a.fillRect(x+1,y+1,62,62);}a.strokeStyle='#b9c1bf';a.lineWidth=2;for(let x=0;x<512;x+=64){a.beginPath();a.moveTo(x,0);a.lineTo(x,256);a.stroke();}for(let y=0;y<256;y+=64){a.beginPath();a.moveTo(0,y);a.lineTo(512,y);a.stroke();}}
 const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;if(kind==='tile'){t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(b.w/80,b.h/40);}maps.push(t);return t;};
 const linear=m=>{m.color.convertSRGBToLinear();if(m.emissive)m.emissive.convertSRGBToLinear();return m;},mat=(color,extra={})=>linear(new T.MeshStandardMaterial({color,roughness:.72,...extra})),basic=(color,extra={})=>linear(new T.MeshBasicMaterial({color,...extra}));
 const white=mat('#e9e9de'),cream=mat('#dcded6'),blue=mat('#7cb1c4'),navy=mat('#18506b'),teal=mat('#607f88'),lime=mat('#aabd39'),green=mat('#52a376'),pink=mat('#d82c77'),wood=mat('#bb9162'),steel=mat('#a3afb0',{metalness:.6,roughness:.35}),dark=mat('#26373f'),sheet=mat('#e2ecec'),blanket=mat('#95bcc5'),glass=mat('#91c3d2',{transparent:true,opacity:.18,depthWrite:false,roughness:.16}),tile=mat('#ffffff',{map:tex('tile'),roughness:.5}),glow=basic('#fff9e7'),screen=basic('#ffffff',{map:tex('monitor')}),sign=basic('#ffffff',{map:tex('sign')});
 const unit=new T.BoxGeometry(1,1,1),cyl=new T.CylinderGeometry(1,1,1,12),sphere=new T.SphereGeometry(1,12,8),plane=new T.PlaneGeometry(1,1),torus=new T.TorusGeometry(1,.12,5,12),dummy=new T.Object3D();
 const emit=(geo,m,w,h,d,x,y,z,rx=0,ry=0,rz=0)=>{if(!batches.has(m))batches.set(m,new Map());const by=batches.get(m);if(!by.has(geo))by.set(geo,[]);by.get(geo).push({w,h,d,x,y:base+y,z,rx,ry,rz});};
 const B=(w,h,d,x,y,z,m)=>emit(unit,m,w,h,d,x,y,z),C=(r,h,rz,x,y,z,m)=>emit(cyl,m,r,h,rz,x,y,z),S=(x,z,w,h,kind)=>solids.push({x:x-w/2,y:z-h/2,w,h,kind}),cx=p.cx,cz=b.y+b.h/2;
 B(b.w-6,.16,b.h-6,cx,.96,cz,tile);B(46,.04,b.h-8,cx,1.08,cz,level===0?blue:cream);for(const side of [-1,1])B(1,.05,b.h-8,cx+side*24,1.1,cz,navy);
 // Wall finishes sit inside the existing five-story shell; the front center remains open.
 for(const side of [-1,1]){const x=b.x+(side<0?3.4:b.w-3.4);B(.65,49,b.h-6,x,25,cz,level===0?lime:white);B(.8,17,b.h-6,x-side*.3,10,cz,level===0?navy:blue);for(const y of [2,19,47])B(1.3,1,b.h-6,x-side*.5,y,cz,white);B(2,1.5,b.h-10,x-side*1.2,17,cz,steel);}
 B(b.w-6,49,.65,cx,25,b.y+3.4,level===0?green:white);
 // Tile ceiling and flat panel illumination, matching the reference's bright clinical lighting.
 B(b.w-7,.3,b.h-7,cx,50.45,cz,white);for(let x=b.x+6;x<b.x+b.w-5;x+=24)B(.3,.15,b.h-8,x,50.2,cz,steel);for(let z=b.y+6;z<b.y+b.h-5;z+=24)B(b.w-8,.15,.3,cx,50.2,z,steel);
 for(const dx of [-85,0,85])for(const zz of [43,107,177]){B(20,.5,11,cx+dx,49.7,b.y+zz,steel);B(18,.15,9,cx+dx,49.35,b.y+zz,glow);}
 emit(plane,sign,94,15,1,cx,39,b.y+4.1);emit(plane,sign,64,10,1,cx,36,b.y+b.h-4.1,0,Math.PI);
 const monitor=(x,y,z,angle=0)=>{B(13,9,1,x,y,z,dark);emit(plane,screen,11.7,7.5,1,x,y,z+.6,0,angle);B(1,5,1,x,y-6,z,steel);};
 const chair=(x,z,m=teal)=>{B(14,1.6,13,x,7,z,m);B(14,12,1.7,x,13,z-5.6,m);for(const dx of [-5.5,5.5]){for(const dz of [-4,4])B(.65,6,.65,x+dx,3.6,z+dz,steel);B(.7,4,.7,x+dx,10,z+2,steel);B(.9,.8,11,x+dx,12,z,steel);}S(x,z,15,15,'chair');};
 const sink=(x,z)=>{B(17,12,12,x,7,z,wood);B(19,1.2,14,x,13.5,z,white);emit(sphere,steel,6,.6,4,x,14.2,z);emit(sphere,white,5,.35,3,x,14.6,z);B(.7,5,.7,x,17,z-3.8,steel);B(.7,.7,4,x,19,z-2,steel);B(4,6,2,x+12,23,z-5,white);B(3,2,2,x+12,20,z-3.5,dark);S(x,z,19,14,'sink');};
 const bed=(x,z,covered=false)=>{B(26,2,47,x,4,z,steel);B(23,2,44,x,7,z,white);B(23,3,42,x,9,z,sheet);for(const dx of [-10.5,10.5])for(const dz of [-18,18]){emit(cyl,dark,1.7,1.2,1.7,x+dx,2.8,z+dz,Math.PI/2);B(.9,3,.9,x+dx,3.5,z+dz,steel);}if(covered){emit(sphere,sheet,10,3.7,19,x,12,z+1);emit(sphere,sheet,6,2.8,6,x,12,z-15);B(2,.15,4,x+7,10.7,z+19,cream);}else{B(21,2,28,x,11,z+6,blanket);B(18,3,9,x,12,z-15,sheet);for(const side of [-1,1]){B(1,5,31,x+side*12.5,12,z,white);B(23,7,1.8,x,12,z+side*22,white);B(5,1,.25,x+side*7,13,z+22.95,navy);}B(1,29,1,x+21,16,z-12,steel);monitor(x+21,29,z-12);B(2,4,2,x+20,13,z-9,white);}
 S(x,z,27,48,covered?'covered stretcher':'patient bed');if(!covered)S(x+21,z-12,7,10,'monitor stand');};
 const bay=(s,index)=>{const left=s.x<cx,edge=left?b.x+96:b.x+b.w-96,far=left?b.x+4:b.x+b.w-4,signDir=left?1:-1,z=s.y;
 B(Math.abs(edge-far),40,1.3,(edge+far)/2,21,z-34,blue);S((edge+far)/2,z-34,Math.abs(edge-far),1.3,'bay partition');
 for(const dz of [-26,26]){for(const yy of [3,42])B(1.3,1,17,edge,yy,z+dz,steel);for(const dd of [-8,8])B(1.3,40,.7,edge,22,z+dz+dd,steel);B(.4,37,15,edge,23,z+dz,glass);S(edge,z+dz,1.6,17,'fixed glass');}B(2,3,70,edge,43,z,steel);for(const dz of [-34,34])B(2,42,1.2,edge,22,z+dz,steel); // 35-unit open entry, no invisible sliding-door collider.
 B(31,20,.3,s.x,17,z-33.1,level>=3?wood:cream);B(12,5,.4,s.x,31,z-33.1,navy);for(let i=0;i<index+1;i++)B(.6,2,.5,s.x-3+i*2,31,z-32.8,white);
 const wx=left?b.x+4.4:b.x+b.w-4.4;B(.5,19,26,wx,31,z+3,navy);B(.6,17,24,wx+signDir*.35,31,z+3,blue);for(let j=0;j<9;j++)B(.8,.25,24,wx+signDir*.6,23+j*1.8,z+3,white);B(12,5,1,s.x+signDir*25,22,z-32,white);for(const dx of [-4,0,4])B(1.5,1.5,1.2,s.x+signDir*25+dx,22,z-31,navy);
 };
 if(level===0){
 // Desk, workstation displays, connected waiting seats and bright pediatric feature walls.
 B(112,14,17,cx,8,b.y+57,white);B(114,1.5,20,cx,15.8,b.y+57,steel);B(112,2,1,cx,3,b.y+67,navy);S(cx,b.y+57,114,20,'reception');B(12,14,31,cx+52,8,b.y+42,white);S(cx+52,b.y+42,12,31,'desk return');for(const dx of [-36,0,36])monitor(cx+dx,21,b.y+56);monitor(cx+28,34,b.y+4.8);monitor(cx-28,34,b.y+4.8);
 for(const side of [-1,1])for(const zz of [113,178])for(let i=0;i<3;i++)chair(cx+side*92+(i-1)*17,b.y+zz);for(const side of [-1,1]){const x=b.x+(side<0?4.3:b.w-4.3);for(const zz of [92,153,213]){B(.4,13,2,x,26,b.y+zz,white);for(const dz of [-4,4])emit(sphere,white,.4,4,5,x,34,b.y+zz+dz);}B(34,5,13,cx+side*94,4,b.y+82,white);for(let i=0;i<6;i++)emit(sphere,green,3.5,4,3,cx+side*94-13+i*5,9,b.y+82);S(cx+side*94,b.y+82,34,13,'planter');}
 // Suspended hexagonal fixtures inspired by the nurses' station reference.
 for(const zz of [88,143])for(let i=0;i<6;i++){const a=i*Math.PI/3;emit(unit,dark,15,2,1,cx+Math.cos(a)*13,44,b.y+zz+Math.sin(a)*13,0,-a-Math.PI/2);emit(unit,glow,14,.15,.7,cx+Math.cos(a)*13,42.9,b.y+zz+Math.sin(a)*13,0,-a-Math.PI/2);}
 }else if(level===2){
 for(const s of p.stretchers)bed(s.x,s.y,true);for(const dx of [-46,0,46])for(const y of [13,34]){B(43,18,14,cx+dx,y,b.y+14,steel);B(39,15,1,cx+dx,y,b.y+21.5,cream);B(8,1,1.4,cx+dx+10,y,b.y+22.5,dark);}S(cx,b.y+14,138,17,'cold storage');sink(b.x+b.w-27,b.y+51);
 }else{
 for(const [i,s]of p.bays.entries()){bay(s,i);bed(s.x,s.y);if(level===1){B(4,33,4,s.x-22,19,s.y-17,steel);B(33,3,8,s.x-7,35,s.y-17,white);B(11,10,12,s.x+6,29,s.y-17,white);S(s.x-22,s.y-17,5,6,'imaging arm');}}
 // Unoccupied fourth room becomes a bedside recliner/sink family-support space.
 const rx=b.x+b.w-45,rz=b.y+187;chair(rx,rz,wood);B(14,4,10,rx,3,rz+10,wood);S(rx,rz+10,14,10,'recliner footrest');sink(b.x+b.w-26,b.y+218);B(16,1,12,rx-25,12,rz,white);C(.7,10,.7,rx-25,6,rz,steel);S(rx-25,rz,16,12,'side table');
 B(38,13,15,cx,7.5,b.y+57,white);B(40,1,17,cx,14.5,b.y+57,steel);S(cx,b.y+57,40,17,'nurse desk');monitor(cx,20,b.y+57);
 }
 for(const [m,geos]of batches)for(const [geo,list]of geos){const mesh=new T.InstancedMesh(geo,m,list.length);mesh.name='Hospital · '+(m===glass?'glazed treatment fronts':m===screen?'clinical displays':'instanced fixtures');list.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.rotation.set(v.rx,v.ry,v.rz);dummy.scale.set(v.w,v.h,v.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.userData.noBatch=true;mesh.frustumCulled=false;root.add(mesh);}
 root.userData.hospital={level,plan:p,textureCount:maps.length};return {root,solids,plan:p};
}
const api={build,plan,DEPARTMENTS};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29HospitalInterior=api;
})();
