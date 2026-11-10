'use strict';
(function(){
const mats=new Map();
function material(color,type='wood',metal=0){const key=color+type+metal;if(!mats.has(key)){const m=new THREE.MeshStandardMaterial({color,roughness:type==='fabric'?.9:.45,metalness:metal});window.level29SurfaceDetail?.apply(m,type);mats.set(key,m);}return mats.get(key);}
function mesh(g,geo,mat,x=0,y=0,z=0){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);g.add(m);return m;}
function box(g,w,h,d,x,y,z,m){return mesh(g,new THREE.BoxGeometry(w,h,d),m,x,y,z);}
function ball(g,x,y,z,sx,sy,sz,m){const o=mesh(g,new THREE.SphereGeometry(1,12,8),m,x,y,z);o.scale.set(sx,sy,sz);return o;}
function rod(g,a,b,r,m){const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a)),o=mesh(g,new THREE.CylinderGeometry(r,r,v.length(),8),m,...a);o.position.addScaledVector(v,.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
function fish(kind){const g=new THREE.Group();g.name=kind;g.userData.species=kind;const orange=material('#d98237','plaster'),white=material('#eee4d1','plaster'),black=material('#202d32','metal'),shell=material('#8b6749','plaster');
 if(kind==='snail'){ball(g,0,.4,0,2,.6,.6,shell);const coil=mesh(g,new THREE.TorusGeometry(1,.65,8,16),shell,0,1.7,0);coil.rotation.y=Math.PI/2;ball(g,0,1.7,0,1.1,1.2,1.1,shell);for(const z of [-.3,.3])rod(g,[1.3,.8,z],[1.8,1.8,z],.09,white);return g;}
 if(kind==='freshwater shrimp'){const body=material('#c77a59','plaster');for(let i=0;i<5;i++){ball(g,-i*.6,1-i*.1,0,.8,.6,.5,body);for(const side of [-1,1])rod(g,[-i*.6,.6,side*.3],[-i*.6-.3,0,side*.9],.07,white);}for(const side of [-1,1])rod(g,[.8,1,side*.3],[3,2,side*1.2],.055,white);return g;}
 const angel=kind==='angelfish',body=kind==='koi'?white:angel?white:orange;ball(g,0,0,0,angel?2.5:3,angel?2.9:1.4,angel?.65:1.1,body);
 const tail=mesh(g,new THREE.ConeGeometry(angel?1.8:2,3,3),kind==='koi'?orange:body,-3.8,0,0);tail.rotation.z=-Math.PI/2;tail.scale.z=.25;g.userData.tail=tail;
 for(const side of [-1,1]){ball(g,2, .5,side*(angel?.6:.9),.28,.28,.14,black);const fin=mesh(g,new THREE.ConeGeometry(1,2,3),body,-.3,-.6,side*1.2);fin.rotation.x=side*1.1;fin.scale.z=.25;}
 if(angel){for(const side of [-1,1]){const fin=mesh(g,new THREE.ConeGeometry(2,4,3),white,-.5,side*3,0);fin.rotation.z=side>0?0:Math.PI;fin.scale.z=.2;}for(const dx of [-1.3,0,1.3])ball(g,dx,0,.62,.3,2.5,.08,black);}
 if(kind==='koi')for(const [x,z]of [[-1,1],[1,-1],[0,.8]])ball(g,x,.6,z,.9,.6,.22,orange);
 return g;}
function tank(g,x,y,z,width=30){const root=new THREE.Group();root.name='Living aquarium';root.position.set(x,y,z);g.add(root);const steel=material('#31454a','metal',.65),sand=material('#c6b993','plaster');box(root,width+2,3,20,0,0,0,steel);box(root,width-2,1,16,0,2,0,sand);
 const glass=new THREE.MeshStandardMaterial({color:'#a1e5ee',transparent:true,opacity:.15,roughness:.12,metalness:.1,depthWrite:false});box(root,width,20,18,0,12,0,glass);box(root,width+2,2,20,0,23,0,steel);
 const glow=new THREE.MeshBasicMaterial({color:'#76d8ed'});box(root,width-2,.35,1,0,21,7.8,glow);
 for(let i=0;i<6;i++){const plant=material(i%2?'#467e60':'#5f9662','plaster');const blade=mesh(root,new THREE.ConeGeometry(1,7+i%3,6),plant,-width*.4+i*width*.16,6,-5);blade.rotation.z=(i%2?.2:-.2);}
 const kinds=['koi','goldfish','angelfish','freshwater shrimp','snail'];kinds.forEach((kind,i)=>{const o=fish(kind);o.scale.setScalar(.65);o.position.set(-width*.32+i*width*.16,i<3?7+i*3:3,0);o.userData.origin=o.position.clone();o.userData.phase=i*1.3;o.traverse(n=>{n.userData.noBatch=true;});root.add(o);});invalidateAnimation(g);return root;}
function props(kind){const g=new THREE.Group();g.name='Detailed retail props: '+kind;const oak=material('#8b6749'),steel=material('#acb5b9','metal',.7),cloth=material('#48596b','fabric'),cream=material('#e4d8c1','fabric'),dark=material('#26363d','metal');
 const chair=()=>{mesh(g,new THREE.CylinderGeometry(5,6,1,16),steel,0,1,0);rod(g,[0,1,0],[0,7,0],.8,steel);ball(g,0,8,0,6,2,5,cloth);ball(g,0,13,-4,6,5,1.5,cloth);for(const side of [-1,1])rod(g,[side*5,8,-3],[side*5,11,3],.6,steel);};
 if(/BARBER/.test(kind)){chair();mesh(g,new THREE.CircleGeometry(7,24),new THREE.MeshStandardMaterial({color:'#b4d1da',metalness:.9,roughness:.08}),0,18,-8);for(let i=0;i<4;i++)box(g,.5,4,1,-7+i*2,5,6,steel);}
 else if(/BIKE/.test(kind)){for(const x of [-8,8]){const wheel=mesh(g,new THREE.TorusGeometry(5,.6,8,20),dark,x,6,0);for(let i=0;i<6;i++)rod(g,[x,6,0],[x+Math.cos(i*Math.PI/3)*4.7,6+Math.sin(i*Math.PI/3)*4.7,0],.07,steel);}for(const [a,b]of [[[-8,6,0],[0,6,0]],[[0,6,0],[-3,14,0]],[[-3,14,0],[-8,6,0]],[[-3,14,0],[5,14,0]],[[5,14,0],[0,6,0]],[[5,14,0],[8,6,0]]])rod(g,a,b,.45,steel);box(g,5,1,3,-3,15,0,cloth);rod(g,[5,14,0],[4,17,0],.3,steel);}
 else if(/FURNITURE|LUXURY/.test(kind)){ball(g,0,6,0,14,4,6,cloth);ball(g,0,11,-5,14,6,2,cloth);for(const side of [-1,1]){ball(g,side*13,8,0,2,4,6,cloth);rod(g,[side*11,0,-4],[side*11,4,-4],.7,oak);}for(const x of [-7,0,7])ball(g,x,8,0,3.5,1.5,5.5,cream);}
 else if(/FASHION|SHOE/.test(kind)){for(let i=0;i<3;i++){const x=-9+i*9;if(/SHOE/.test(kind)){ball(g,x,3,1,4,2,2.2,cloth);ball(g,x-2,5,0,2,2,2,cloth);box(g,8,.6,4,x,1,1,cream);for(let n=0;n<3;n++)box(g,.25,.25,3,x+n*.8,4,1,cream);}else{ball(g,x,9,0,3,5,1.5,cloth);for(const side of [-1,1])rod(g,[x+side*2,12,0],[x+side*5,8,0],1,cloth);rod(g,[x,0,0],[x,17,0],.25,steel);}}}
 else if(/CUISINE|BURGERS|COFFEE/.test(kind)){mesh(g,new THREE.CylinderGeometry(3,2.5,5,16),cream,-6,5,0);mesh(g,new THREE.TorusGeometry(1.7,.4,8,16),cream,-2.8,5,0);for(const y of [2,3,4,5])ball(g,5,y,0,3,y===5?1.5:.4,3,y===3?cloth:oak);box(g,9,9,7,11,6,-4,steel);}
 else if(/CAMERA|TECH|GAME/.test(kind)){for(const x of [-8,0,8]){box(g,6,4,3,x,4,0,dark);mesh(g,new THREE.CylinderGeometry(1.5,1.5,2,10),steel,x,4,2).rotation.x=Math.PI/2;box(g,5,3,.4,x,4,-1.6,cream);}}
 else if(/PHARMACY|COSMETICS/.test(kind)){for(const x of [-9,-3,3,9]){mesh(g,new THREE.CylinderGeometry(1,1.4,5,10),cream,x,4,0);box(g,1.8,.8,1.8,x,7,0,cloth);box(g,2,.6,2,x,4,0,oak);}}
 else if(/BAKERY/.test(kind)){for(const x of [-8,0,8]){ball(g,x,3,0,3.6,2,2.6,oak);for(const off of [-1,1])box(g,.5,.2,4,x+off,4.9,0,cream);}}
 else if(/HOMEWARES/.test(kind)){for(const x of [-8,8]){mesh(g,new THREE.CylinderGeometry(3,2.5,4,12),steel,x,3,0);mesh(g,new THREE.TorusGeometry(2,.4,6,12),dark,x+4,3,0);box(g,7,.4,6,x,5.3,0,cream);}}
 else if(/TOY/.test(kind)){ball(g,-6,7,0,3,3.5,2,oak);ball(g,-6,12,0,2.7,2.5,2,oak);for(const side of [-1,1]){ball(g,-6+side*2,14,0,1,1,1,oak);ball(g,-6+side*3,7,0,1,2,1,oak);}ball(g,7,3,0,5,2,2,cloth);for(const x of [4,10])for(const z of [-2,2]){const wheel=mesh(g,new THREE.CylinderGeometry(1,1,1,10),dark,x,2,z);wheel.rotation.x=Math.PI/2;}}
 else if(/JEWELRY/.test(kind)){for(const x of [-8,0,8])mesh(g,new THREE.TorusGeometry(2,.35,8,18),material('#d1ab55','metal',.8),x,4,0);}
 else if(/SPORT/.test(kind)){for(const x of [-8,0,8]){ball(g,x,4,0,3,3,3,oak);mesh(g,new THREE.TorusGeometry(3,.08,6,18),dark,x,4,0);}}
 else if(/MUSIC/.test(kind)){for(const x of [-8,8]){ball(g,x,5,0,3.5,4,1,oak);box(g,1.3,11,1,x,12,0,oak);for(const dx of [-.3,0,.3])rod(g,[x+dx,3,1],[x+dx,18,1],.04,steel);}}
 else if(/PLANT/.test(kind)){for(const x of [-8,8]){mesh(g,new THREE.CylinderGeometry(3,2,5,14),oak,x,3,0);rod(g,[x,4,0],[x,14,0],.25,steel);for(let i=0;i<5;i++)ball(g,x+Math.sin(i)*3,8+i,Math.cos(i)*2,3,1,1.5,material('#527c51','plaster'));}}
 else if(/EXECUTIVE/.test(kind)){chair();box(g,24,2,10,0,8,8,oak);box(g,9,6,.6,0,13,8,dark);rod(g,[0,8,8],[0,11,8],.4,steel);}
 else{for(let i=0;i<7;i++){const cover=material(['#774b4b','#436c77','#b59652'][i%3],'fabric');box(g,2,8+i%3,5,-12+i*4,6,0,cover);for(let n=0;n<3;n++)box(g,2.05,.15,4.7,-12+i*4,4+n*2,0,cream);}}
 return g;}
const animationCache=new WeakMap();
function invalidateAnimation(root){for(let p=root;p;p=p.parent)animationCache.delete(p);}
function animate(root,t){let actors=animationCache.get(root);if(!actors){actors=[];root.traverse(o=>{if(o.userData.species)actors.push(o);});animationCache.set(root,actors);}for(const o of actors){const p=o.userData.origin;if(!p)continue;if(['koi','goldfish','angelfish'].includes(o.userData.species)){o.position.x=p.x+Math.sin(t*.5+o.userData.phase)*1.5;o.position.z=p.z+Math.cos(t*.5+o.userData.phase)*2;o.rotation.y=Math.sin(t*.5+o.userData.phase)*.4;if(o.userData.tail)o.userData.tail.rotation.y=Math.sin(t*4+o.userData.phase)*.3;}else o.position.x=p.x+Math.sin(t*.1+o.userData.phase)*.6;}}
window.level29InteriorModels={material,mesh,box,ball,rod,fish,tank,props,animate,invalidateAnimation};
})();
