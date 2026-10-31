'use strict';
(function(){
const materials=new Map();function mat(c){if(!materials.has(c))materials.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.75}));return materials.get(c);}
function box(g,w,h,d,x,y,z,c){return add(g,new THREE.BoxGeometry(w,h,d),x,y,z,c);}
function add(g,geo,x,y,z,c){const m=new THREE.Mesh(geo,typeof c==='string'?mat(c):c);m.position.set(x,y,z);g.add(m);return m;}
function figure(who){const m=makeFigure(false),u=m.userData;
 setFigureColors(m,who==='alex'?'#bf977c':'#9a6647',who==='jojo'?'#f5f1ed':who==='alex'?'#6a7988':'#74644a',who==='jojo'?'#25262b':who==='alex'?'#394554':'#c5c1b6','#211a19');
 if(who==='jojo'){
  u.longHair.visible=true;u.hair.scale.set(1.15,1.05,1.2);add(u.body,new THREE.CylinderGeometry(3.7,3,2,16),0,22,0,'#faf5ef');add(u.body,new THREE.SphereGeometry(1,16,12),0,25,0,'#faf5ef').scale.set(4.7,3.8,4.3);
  for(const z of [-1.5,1.5])for(let i=0;i<4;i++)box(u.body,.5,.5,.5,2.45,11+i*1.3,z,'#272527');
  for(const z of [-3,-1,1,3])box(u.body,.15,4,.15,2.4,7.8,z,'#d5d0cb');
  box(u.body,.2,6,.15,2.65,13,0,'#383333');const spoon=add(u.armR,new THREE.CylinderGeometry(.18,.18,9,8),0,-8,0,'#ae7e43');add(spoon,new THREE.SphereGeometry(1,12,8),0,5,0,'#ae7e43').scale.set(.8,1.2,.35);
 }else if(who==='alex'){
  add(u.body,new THREE.SphereGeometry(1,12,10),.65,16.7,0,'#49382d').scale.set(2.1,2.2,2.2);u.hair.position.y=20.9;u.hair.scale.set(1.05,1.12,1.06);box(u.body,1,2,2,2.5,12.8,0,'#626f7c');
 }else{
  for(const z of [-1,1]){const rim=add(u.body,new THREE.TorusGeometry(.8,.12,6,16),2.25,18.7,z,'#b6aa7d');rim.rotation.y=Math.PI/2;}
  box(u.body,.2,.15,1,2.45,18.7,0,'#b6aa7d');box(u.body,.4,.5,3.5,2.45,9.4,0,'#b7ae95');
 }
 m.traverse(o=>{o.userData.noBatch=true;});m.userData.identity=who;return m;
}
function kitchen(v){const g=new THREE.Group();g.name='Major Cajun kitchen';v.mesh.add(g);const b=v.b,x=b.x+b.w*.3,z=b.y+24;
 box(g,42,9,20,x,4.5,z,'#838c8e');box(g,44,1,22,x,9.5,z,'#bdc4bc');for(const dx of [-12,10])add(g,new THREE.TorusGeometry(5,.5,6,20),x+dx,10.3,z,'#222a2a').rotation.x=Math.PI/2;
 const pot=add(g,new THREE.CylinderGeometry(9,7,12,24,1,true),x,17,z,'#505d60');for(const dx of [-11,11])add(g,new THREE.TorusGeometry(2.5,.5,6,14),x+dx,20,z,'#879392').rotation.y=Math.PI/2;
 const liquid=add(g,new THREE.CircleGeometry(8.3,24),x,22.6,z,'#518aab');liquid.rotation.x=-Math.PI/2;const bubbles=[];for(let i=0;i<8;i++)bubbles.push(add(g,new THREE.SphereGeometry(.5,8,6),x+Math.sin(i*2)*5,23,z+Math.cos(i*2)*5,'#d8bb8a'));
 box(g,32,10,16,b.x+b.w*.7,5,z,'#735c42');for(let i=0;i<5;i++)box(g,3,3,4,b.x+b.w*.7-10+i*5,12,z,'#c6b68a');
 const bowl=add(g,new THREE.SphereGeometry(3.3,16,8,0,Math.PI*2,Math.PI/2,Math.PI/2),b.x+b.w*.7,13,z,'#eee1c5');const ice=box(g,2,2,2,b.x+b.w*.7,14,z,'#bad9e5');
 const ladle=add(g,new THREE.CylinderGeometry(.2,.2,15,8),x+11,25,z,'#b8c0bd');add(ladle,new THREE.SphereGeometry(1.5,12,8),0,-7,0,'#b8c0bd').scale.y=.45;ladle.rotation.z=-.4;
 const bowlFill=add(g,new THREE.CircleGeometry(2.7,16),b.x+b.w*.7,13.3,z,'#694020');bowlFill.rotation.x=-Math.PI/2;bowlFill.visible=false;const pour=add(g,new THREE.CylinderGeometry(.35,.7,8,10),x,19,z,'#694020');pour.visible=false;box(g,10,5,9,b.x+b.w*.7+14,12,z,'#9caeae');
 const chains=new THREE.Group();g.add(chains);const zx=b.x+b.w-17,zz=b.y+b.h*.45;
 for(const side of [-1,1])for(let i=0;i<8;i++){const ring=add(chains,new THREE.TorusGeometry(1.1,.25,6,10),zx-2,13+i*.5,zz+side*(4+i*.85),'#a1a3a0');ring.rotation.y=i%2?Math.PI/2:0;}
 const chef=figure('jojo');g.add(chef);poseFigure(chef,x+22,z,Math.PI,0,'stand');
 v.furniture.push({x:x-23,y:z-12,w:46,h:24},{x:b.x+b.w*.7-18,y:z-10,w:36,h:20});
 for(const dynamic of [chef,liquid,...bubbles,bowl,ice,ladle,chains,pour,bowlFill])dynamic.traverse(o=>{if(o.isMesh)o.userData.noBatch=true;});
 for(const side of [-1,1]){const xx=b.x+b.w/2+side*(b.w/2-20),zz=b.y+b.h*.72;add(g,new THREE.CylinderGeometry(9,9,2,16),xx,10,zz,'#775a3b');box(g,3,9,3,xx,4.5,zz,'#3c3931');v.furniture.push({x:xx-9,y:zz-9,w:18,h:18});}
 addSign(g,'CHIEF JOJO · GUMBO / CAJUN KITCHEN',Math.min(110,b.w-10),6,b.x+b.w/2,34,b.y+3,'#ebc187');return {g,chef,pot,liquid,bubbles,bowl,ice,ladle,chains,pour,bowlFill,x,z,zx,zz};
}
function theater(v){const g=new THREE.Group();v.mesh.add(g);const b=v.b,x=b.x+b.w/2,z=b.y+26;box(g,b.w-16,5,38,x,2.5,z,'#534035');box(g,b.w-12,35,2,x,20,b.y+4,'#602e3b');
 const damion=figure('damion');g.add(damion);poseFigure(damion,x,z,Math.PI/2,0,'stand');damion.position.y=5;
 box(g,.5,15,.5,x+7,12,z+4,'#272f31');add(g,new THREE.SphereGeometry(.9,10,8),x+7,20,z+4,'#a9aaa4');
 for(let row=0;row<3;row++)for(let col=0;col<3;col++){if(col===1)continue;const xx=b.x+22+col*(b.w-44)/2,zz=b.y+62+row*19;if(zz>b.y+b.h-18)continue;box(g,14,5,11,xx,2.5,zz,'#453b53');const a=makeFigure(false);setFigureColors(a,'#aa7958',['#697669','#9b6d53','#687f96'][col],'#303943');poseFigure(a,xx,zz,-Math.PI/2,0,'stand');a.userData.legL.rotation.z=-1.3;a.userData.legR.rotation.z=-1.3;a.userData.body.position.y=-2;a.scale.setScalar(.8);g.add(a);v.furniture.push({x:xx-7,y:zz-6,w:14,h:12});}
 return {g,damion};
}
window.level29StoryScenes={figure,kitchen,theater,box,add};
})();
