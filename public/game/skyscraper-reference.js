'use strict';
(function(){
function plan(b){return {x:b.x+b.w*.35,y:b.y+30,w:b.w*.3,h:b.h*.45,base:280};}
function build(T,b){const root=new T.Group();root.name='Production skyscraper · stepped blue glass and crown';root.userData.noBatch=true;const roof=plan(b),cx=roof.x+roof.w/2,cz=roof.y+roof.h/2,items=new Map(),tmp=new T.Object3D(),cube=new T.BoxGeometry(1,1,1),cyl=new T.CylinderGeometry(1,1,1,20),sphere=new T.SphereGeometry(1,12,8),mat=(c,e={})=>new T.MeshStandardMaterial({color:c,roughness:.4,...e}),glass=mat('#548899',{metalness:.45,roughness:.25}),silver=mat('#b8bfc0',{metalness:.7}),stone=mat('#bab7a9'),gold=mat('#bca15a',{metalness:.6}),purple=new T.MeshBasicMaterial({color:'#913fb5'}),cream=mat('#ded8c7'),teal=mat('#467c80'),wood=mat('#8c7353'),black=mat('#344347');
 function put(g,m,x,y,z,w,h,d){const key=g.uuid+m.uuid;if(!items.has(key))items.set(key,{g,m,list:[]});tmp.position.set(x,y,z);tmp.scale.set(w,h,d);tmp.rotation.set(0,0,0);tmp.updateMatrix();items.get(key).list.push(tmp.matrix.clone());}
 const box=(m,w,h,d,x,y,z)=>put(cube,m,x,y,z,w,h,d);let ribs=0;
 // The original ground studio remains below 52. Setbacks occupy only its old tower footprint.
 for(let tier=0;tier<8;tier++){const y=52+tier*25,hh=25,scale=1-tier*.075,w=roof.w*scale,d=roof.h*scale;box(glass,w,hh,d,cx,y+hh/2,cz);box(silver,w+1,.9,d+1,cx,y+hh-.45,cz);for(const side of[-1,1]){for(let x=-w/2+3;x<w/2;x+=6){box(silver,.45,hh, .6,cx+x,y+hh/2,cz+side*(d/2+.25));ribs++;}for(let z=-d/2+3;z<d/2;z+=7){box(silver,.6,hh,.45,cx+side*(w/2+.25),y+hh/2,cz+z);ribs++;}}for(let row=1;row<6;row++)box(silver,w+.5,.17,d+.5,cx,y+row*4,cz);}
 // Crown is static purple/gold art, not new dynamic lights or changes to time of day.
 box(purple,roof.w*.32,18,roof.h*.32,cx,261,cz);box(gold,roof.w*.35,2,roof.h*.35,cx,270,cz);put(cyl,silver,cx,311,roof.y+5,2,62,2);put(cyl,gold,cx,350,roof.y+5,.65,22,.65);
 // Keep actual rooftop platform/base and lift spawn. Decorative balcony seating hugs side edges.
 box(stone,roof.w+4,3,roof.h+4,cx,280,cz);for(const side of[-1,1]){const x=roof.x+roof.w/2+side*(roof.w/2-2);box(black,.7,12,roof.h,x,287,cz);box(glass,.2,10,roof.h-2,x,287,cz);const z=roof.y+roof.h/2+side*(roof.h/2-2);box(black,roof.w,12,.7,cx,287,z);box(glass,roof.w-2,10,.2,cx,287,z);}
 for(const side of[-1,1]){const x=cx+side*(roof.w/2-9);for(let n=0;n<3;n++){const z=cz-10+n*10;put(sphere,cream,x,285,z,5,2.5,5.5);put(sphere,cream,x+side*3,289,z,2,4,5.5);put(sphere,teal,x,289,z,1.5,2.5,3);}box(wood,8,.2,35,x,282,cz);}
 // Roof elevation and central travel area are intentionally unchanged; no extra floors created.
 for(const{g,m,list}of items.values()){const mesh=new T.InstancedMesh(g,m,list.length);list.forEach((a,i)=>mesh.setMatrixAt(i,a));mesh.userData.noBatch=true;root.add(mesh);}root.userData.skyscraper={tiers:8,ribs,rooftopBase:280,spireTop:361};return {root,roof,spawn:{x:cx,y:cz}};}
const api={plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29SkyscraperReference=api;
})();
