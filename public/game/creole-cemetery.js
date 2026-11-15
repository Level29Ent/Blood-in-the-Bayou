'use strict';
(function(){
function plan(b){const lane=Math.min(40,b.w*.25),side=(b.w-lane)/2-8,tombs=[],rows=Math.max(1,Math.floor((b.h-36)/58)),depth=Math.min(34,(b.h-36)/rows-22),width=Math.min(27,side-8);for(const sideSign of[-1,1]){const cols=Math.max(1,Math.floor(side/43));for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){const x=b.x+b.w/2+sideSign*(lane/2+8+width/2+col*43),y=b.y+12+row*(b.h-36)/rows; tombs.push({x:x-width/2,y,w:width,h:depth,variant:tombs.length%5});}}return {tombs,solids:tombs.map(t=>({...t})),lane};}
function build(T,b,{base=0}={}){const root=new T.Group();root.name='Creole cemetery · above-ground tomb lanes';root.position.y=base;const p=plan(b),cube=new T.BoxGeometry(1,1,1),cyl=new T.CylinderGeometry(1,1,1,12),sphere=new T.SphereGeometry(1,10,7),cone=new T.ConeGeometry(1,1,4).rotateY(Math.PI/4),batches=new Map(),o=new T.Object3D(),mat=(c,e={})=>new T.MeshStandardMaterial({color:c,roughness:.92,...e}),white=mat('#dfddd0'),aged=mat('#a5a599'),stone=mat('#858980'),brick=mat('#916c54'),dark=mat('#4f5750'),iron=mat('#303b36',{metalness:.4}),grass=mat('#718364'),path=mat('#b4ac96'),flower=mat('#ad4a5d'),leaf=mat('#4f7350');
 function put(g,m,w,h,d,x,y,z){const key=g.uuid+m.uuid;if(!batches.has(key))batches.set(key,{g,m,list:[]});o.position.set(x,y,z);o.scale.set(w,h,d);o.rotation.set(0,0,0);o.updateMatrix();batches.get(key).list.push(o.matrix.clone());}
 const box=(m,w,h,d,x,y,z)=>put(cube,m,w,h,d,x,y,z);box(grass,b.w,.15,b.h,b.x+b.w/2,.1,b.y+b.h/2);box(path,p.lane,.16,b.h-4,b.x+b.w/2,.21,b.y+b.h/2);
 for(const [i,t]of p.tombs.entries()){const x=t.x+t.w/2,z=t.y+t.h/2,H=22+(i%4)*4,m=t.variant===4?brick:t.variant===2?aged:white;box(stone,t.w,.7,t.h,x,.7,z);box(m,t.w-2,H,t.h-2,x,H/2+1,z);box(white,t.w+1,1.3,t.h+1,x,H+1,z);box(stone,t.w-1,2,3,x,2,t.y+t.h-1);
 // Sealed tablet, pale surround and layered cornice; no real family names copied.
 box(white,t.w*.65,H*.78,.7,x,H*.48,t.y+t.h-.4);box(dark,t.w*.5,H*.65,.8,x,H*.48,t.y+t.h);box(aged,t.w*.47,H*.61,.9,x,H*.48,t.y+t.h+.15);for(let line=0;line<4;line++)box(stone,t.w*.25,.2,.12,x,H*.62-line*1.6,t.y+t.h+.65);
 if(t.variant===0){put(cone,white,(t.w+2)*.7071,8,(t.h+2)*.7071,x,H+5,z);}else if(t.variant===1){const roof=new T.Mesh(new T.CylinderGeometry(t.w/2,t.w/2,t.h,16,1,false,0,Math.PI),m);roof.rotation.x=Math.PI/2;roof.position.set(x,H+1,z);roof.userData.noBatch=true;root.add(roof);}else box(stone,t.w,2,t.h,x,H+3,z);
 if(i%3===0){box(white,1.4,10,1.4,x,H+10,z);box(white,7,1.4,1.4,x,H+12,z);}else if(i%4===0){put(cone,white,3,12,3,x,H+9,z);}
 // Weather streaks and exposed masonry patches stay on tomb surfaces, never span walking lanes.
 for(let k=0;k<5;k++){box(i%2?aged:stone,.35,3+k%3, .12,x-t.w*.35+k*t.w*.17,H-2-k%3,t.y+t.h+.3);}
 if(t.variant===4)for(let row=0;row<5;row++)for(let col=0;col<3;col++)box(aged,4,.15,.14,t.x+3+col*6,H*.2+row*3,t.y+t.h+.4);
 // Modest flower/vase offerings nested on tomb plinth, with no additional lane blockers.
 for(const side of[-1,1]){const xx=x+side*t.w*.3,zz=t.y+t.h-1;put(cyl,white,1.2,3,1.2,xx,2.5,zz);box(leaf,.2,4,.2,xx,5,zz);for(let f=0;f<3;f++)put(sphere,flower,.65,.65,.65,xx+(f-1)*.6,6+f%2*.6,zz);}
 }
 // Perimeter spear-style fence retains a wide south gate.
 for(const x of[b.x+1,b.x+b.w-1])for(let z=b.y+3;z<b.y+b.h-2;z+=5){box(iron,.4,11,.4,x,5.5,z);put(cone,iron,.7,1.5,.7,x,11.5,z);}for(let x=b.x+3;x<b.x+b.w-2;x+=5)for(const z of[b.y+1,b.y+b.h-1])if(z===b.y+1||Math.abs(x-(b.x+b.w/2))>24){box(iron,.4,11,.4,x,5.5,z);put(cone,iron,.7,1.5,.7,x,11.5,z);}
 for(const{g,m,list}of batches.values()){const mesh=new T.InstancedMesh(g,m,list.length);list.forEach((a,i)=>mesh.setMatrixAt(i,a));mesh.userData.noBatch=true;root.add(mesh);}root.userData.cemetery={tombs:p.tombs.length,variants:5};return {root,solids:p.solids,plan:p};}
const api={plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29CreoleCemetery=api;
})();
