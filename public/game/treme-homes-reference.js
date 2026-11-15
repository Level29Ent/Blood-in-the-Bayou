'use strict';
(function(){
const PALETTES=[['#238f93','#d27ba5','#70539b'],['#18a9be','#e4c238','#a53b40'],['#577c7a','#dfceb2','#293d43'],['#ba8c83','#e2c998','#66817d'],['#a78c65','#b8b19d','#5e726b'],['#7e9690','#dbcbb0','#3c5d64']];
function build(T,b,{index=0,base=0}={}){const root=new T.Group();root.name='Tremé shotgun home · '+index;const buckets=new Map(),dummy=new T.Object3D(),cube=new T.BoxGeometry(1,1,1),sphere=new T.SphereGeometry(1,10,6),roofGeo=new T.ConeGeometry(1,1,4).rotateY(Math.PI/4),palette=PALETTES[index%6],mat=(c,e={})=>new T.MeshStandardMaterial({color:c,roughness:.9,...e}),paint=mat(palette[0]),trim=mat(palette[1]),shutter=mat(palette[2]),stone=mat('#a49d8b'),wood=mat('#8f7554'),slate=mat('#474e4b'),dark=mat('#243e43'),iron=mat('#293b36',{metalness:.4});const H=Math.max(27,Math.min(44,b.H||32)),w=b.w,d=b.h,cx=b.x+w/2,cz=b.y+d/2,front=b.y+d;let boards=0;
 function emit(g,m,x,y,z,sx,sy,sz,ry=0,rz=0){const key=g.uuid+m.uuid;if(!buckets.has(key))buckets.set(key,{g,m,list:[]});dummy.position.set(x,base+y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(0,ry,rz);dummy.updateMatrix();buckets.get(key).list.push(dummy.matrix.clone());}
 const box=(m,ww,hh,dd,x,y,z)=>emit(cube,m,x,y,z,ww,hh,dd);
 box(stone,w,5,d,cx,2.5,cz);box(paint,w,H-5,d,cx,(H+5)/2,cz);
 for(let y=7;y<H-1;y+=2){box(index%6===4&&boards%4===0?wood:trim,w,.13,.2,cx,y,front+.12);for(const side of[-1,1])box(index%6===4?wood:paint,.2,.16,d,b.x+(side<0?-.1:w+.1),y,cz);boards++;}
 // Gabled roof and fan-trimmed pediment, all above existing solid house footprint.
 emit(roofGeo,slate,cx,H+7,cz,(w+4)*.7071,15,(d+4)*.7071);box(trim,w+2,1,2,cx,H+1,front+.7);for(const side of[-1,1])emit(cube,trim,cx+side*w*.23,H+6,front+.6,w*.56,.8,.8,0,side*-.35);
 for(let i=0;i<7;i++){const a=(i/6)*Math.PI;emit(cube,trim,cx+Math.cos(a)*w*.08,H+2.5+Math.sin(a)*4,front+1,.3,7,.4,0,-a+Math.PI/2);}
 // Tall paired shutter/door-like openings give narrow shotgun facades their rhythm.
 const count=w<55?3:4;for(let i=0;i<count;i++){const x=b.x+(i+.5)*w/count,ww=Math.min(10,w/count*.6),z=front+.45;box(trim,ww+3,24,.7,x,18,z);box(dark,ww,21,.8,x,18,z+.5);for(const side of[-1,1]){box(shutter,ww*.42,20,.5,x+side*ww*.24,17.8,z+1);for(let k=0;k<11;k++)box(trim,ww*.39,.16,.65,x+side*ww*.24,9+k*1.65,z+1.1);}box(trim,ww+4,1.2,1.6,x,30.3,z+.6);emit(sphere,dark,x,28.8,z+.95,ww*.46,1.6,.25);box(trim,.55,20,1,x,18,z+1.2);}
 // Raised porch with shallow steps retains a broad central approach; no new ground blockers.
 box(stone,w-2,2,14,cx,4,front+6);for(let i=0;i<4;i++)box(stone,Math.min(22,w*.47),1,3,cx,.5+i,front+18-i*3);box(trim,w+2,2,17,cx,H-1,front+7);
 for(const side of[-1,1]){const x=cx+side*(w/2-3);box(trim,.9,H-7,.9,x,(H+3)/2,front+12);for(const y of[8,H-6])box(shutter,1.7,1,1.7,x,y,front+12);for(let k=0;k<4;k++){box(trim,3.8-k*.6,.6,.7,x+side*(1.3+k*.3),H-4-k*.8,front+12);box(trim,.6,3.8-k*.6,.7,x+side*2,H-4-k*.4,front+12);}box(iron,.6,6,10,x,7,front+7);}
 for(const x of[cx-w*.28,cx+w*.28]){box(stone,5,3,5,x,1.5,b.y+9);box(wood,5,3,5,x,H+8,b.y+15);}
 for(const{g,m,list}of buckets.values()){const mesh=new T.InstancedMesh(g,m,list.length);list.forEach((a,i)=>mesh.setMatrixAt(i,a));mesh.userData.noBatch=true;root.add(mesh);}const details=typeof require==='function'?require('./neighborhood-details.js'):window.level29NeighborhoodDetails;root.add(details.build(T,b,{index,treme:true,base}).root);root.userData.tremeReference={palette:index%6,boards,openings:count,weathered:index%6===4};return {root};}
const api={PALETTES,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29TremeHomesReference=api;
})();
