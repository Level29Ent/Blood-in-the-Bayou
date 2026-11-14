'use strict';
(function(){
// Original, lightweight textured anatomy; no external/licensed animal pack or extra engine.
const materials=new Map(),sphere=new THREE.SphereGeometry(1,16,12),cone=new THREE.ConeGeometry(1,1,10);
function hide(kind){if(materials.has(kind))return materials.get(kind);const cv=document.createElement('canvas');cv.width=cv.height=128;const c=cv.getContext('2d'),r=mkRng(kind==='cow'?29041:kind==='pig'?29042:29043);
 c.fillStyle={cow:'#d6cfbb',pig:'#c69888',chicken:'#c7b18a'}[kind];c.fillRect(0,0,128,128);
 if(kind==='cow')for(let i=0;i<9;i++){c.fillStyle='#443e35';c.beginPath();c.ellipse(r()*128,r()*128,8+r()*20,6+r()*14,r()*6.28,0,6.28);c.fill();}
 for(let i=0;i<1800;i++){c.fillStyle=i%2?'rgba(38,26,18,.10)':'rgba(255,244,211,.16)';const x=r()*128,y=r()*128;c.fillRect(x,y,kind==='chicken'?3:1,kind==='pig'?1:2);}
 const map=new THREE.CanvasTexture(cv);map.encoding=THREE.sRGBEncoding;const m=new THREE.MeshStandardMaterial({map,roughness:.94});materials.set(kind,m);return m;}
function create(kind,seed){const g=new THREE.Group();g.name='farm-'+kind;const skin=hide(kind),dark=level29World.material('#3b332d'),pink=level29World.material('#bf8e7d'),ivory=level29World.material('#ded0a1'),red=level29World.material('#a7352e'),gold=level29World.material('#b49343');
 const legs=[];g.userData.features={};const ell=(mat,x,y,z,sx,sy,sz)=>{const m=new THREE.Mesh(sphere,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);g.add(m);return m;};
 const horn=(x,y,z,mat,h=3)=>{const m=new THREE.Mesh(cone,mat);m.position.set(x,y,z);m.scale.set(.6,h,.6);g.add(m);};
 if(kind==='chicken'){
  ell(skin,0,5,0,4,3.4,2.8);ell(skin,3,8,0,1.7,2.7,1.8);ell(skin,4,10,0,1.7,1.8,1.6);
  for(const z of [-2.4,2.4])ell(skin,-.6,5.6,z,2.9,2.2,.55);for(let j=0;j<5;j++)for(const side of [-1,1])ell(ivory,-2+j*.8,5.8,side*2.9,.7,1.1,.12);
  for(const z of [-.9,.9]){ell(gold,0,1.7,z,.28,1.8,.28);for(let i=-1;i<=1;i++)ell(gold,1,.2,z+i*.45,1.5,.2,.18);ell(dark,5,10.5,z*1.65,.24,.28,.22);}
  const beak=new THREE.Mesh(cone,gold);beak.position.set(6,9.7,0);beak.scale.set(.65,2,.6);beak.rotation.z=-Math.PI/2;g.add(beak);g.userData.features.beak=beak;
  for(const side of [-1,1])ell(ivory,5.12,10.62,side*1.53,.08,.1,.08);for(let i=0;i<3;i++)ell(red,3.2+i*.7,12,0,.5,.9,.4);ell(red,5,8.3,0,.5,.8,.5);
  for(let i=0;i<4;i++){const m=ell(skin,-4-i*.35,7+i*.65,(i-1.5)*.5,2.3,.5,.7);m.rotation.z=-.5;}
 }else{
  const cow=kind==='cow',scale=cow?1:.8;g.scale.setScalar(scale);ell(skin,0,12,0,cow?12:10,6,5.7);ell(skin,8,14,0,5,5,4.7);ell(skin,12,14,0,4,4.8,3.8);const muzzle=ell(pink,15,12,0,cow?2.8:1.8,cow?2:1.6,cow?3:2.4);g.userData.features.muzzle=muzzle;
  for(const z of [-1.4,1.4])ell(dark,17,12,z,.25,.5,.4);
  for(const z of [-3.7,3.7]){ell(dark,12.6,16,z,.42,.48,.3);ell(ivory,12.82,16.16,z*1.03,.12,.14,.1);const ear=ell(skin,9,18,z*(cow?1.5:1.1),cow?2.6:1.5,cow?.65:2,cow?1.4:1.1);ear.rotation.z=cow?(z>0?.2:-.2):-.4;ell(pink,9.1,18.15,z*(cow?1.52:1.12),cow?1.6:.8,.24,cow?.85:.7);}
  for(const x of [-7,7])for(const z of [-3.8,3.8]){legs.push(ell(skin,x,6,z,1.3,5,1.25));for(const toe of [-1,1])ell(dark,x+.4,1.2,z+toe*.65,.95,1.2,.6);ell(skin,x,8,z,1.8,2.3,1.7);}
  if(cow){for(const z of [-2.7,2.7])horn(10,20,z,ivory);ell(pink,-3,6,0,3.4,1.8,2.6);for(const x of [-4,-2])for(const z of [-1,1])ell(pink,x,4.6,z,.35,.85,.35);const tail=ell(skin,-12,10,0,.55,4,.6);tail.rotation.z=-.3;ell(dark,-13,6,0,1,1.7,.9);}
  else{const tail=new THREE.Mesh(new THREE.TorusGeometry(1.1,.28,6,18,Math.PI*1.8),pink);tail.position.set(-10,12,0);tail.rotation.y=Math.PI/2;g.add(tail);}
 }
 // Merge static anatomy per material before animation moves the whole animal.
 for(const l of legs)l.userData.noBatch=true;const scale=g.scale.x;g.scale.setScalar(1);if(window.level29BatchStatic)level29BatchStatic(g,legs);g.scale.setScalar(scale);g.userData.kind=kind;g.userData.legs=legs;g.userData.variant=seed;g.scale.multiplyScalar(.94+(seed%4)*.035);return g;
}
const originalCreate=create;
function smallRuminant(kind,seed){const g=new THREE.Group(),wool=level29World.material('#d9d5c2'),coat=level29World.material(kind==='goat'?'#d7cbb1':'#bdb7a3'),hoof=level29World.material('#443d32'),eye=level29World.material('#262e29'),legs=[];g.name='farm-'+kind;const ell=(m,x,y,z,w,h,d)=>{const o=new THREE.Mesh(sphere,m);o.position.set(x,y,z);o.scale.set(w,h,d);g.add(o);return o;};ell(kind==='sheep'?wool:coat,0,10,0,8,4,3.8);ell(coat,7,12,0,2.5,3.5,2.1);ell(coat,9,10,0,2.4,1.8,1.8);for(const side of[-1,1]){ell(coat,6.5,14,side*2.5,1.6,.5,.9);ell(eye,8.6,13,side*1.7,.22,.28,.18);if(kind==='goat'){const horn=new THREE.Mesh(cone,hoof);horn.position.set(6.5,17,side*1.2);horn.scale.set(.4,4,.4);horn.rotation.z=-.4;g.add(horn);}}for(const x of[-5,5])for(const z of[-2.5,2.5]){legs.push(ell(coat,x,4.6,z,.7,3.8,.7));ell(hoof,x,.9,z,.9,.8,.85);}if(kind==='sheep')for(let i=0;i<24;i++){const a=i*2.4;ell(wool,Math.cos(a)*(5+i%3),10+Math.sin(a)*2.2,Math.sin(i*1.7)*3,2,1.7,1.7);}else ell(coat,8,7.3,0,.7,1.8,.7);ell(coat,-8,11,0,1.7,.5,.6);g.userData={kind,legs,features:{},variant:seed};g.scale.setScalar(.85+(seed%3)*.03);if(window.level29BatchStatic)level29BatchStatic(g,legs);return g;}
function visitorAnimal(kind,seed){if(kind==='goat'||kind==='sheep')return smallRuminant(kind,seed);if(!['goat','sheep','duck'].includes(kind))return originalCreate(kind,seed);const base=originalCreate(kind==='duck'?'chicken':'cow',seed);base.name='farm-'+kind;base.userData.kind=kind;if(kind==='duck'){base.scale.multiplyScalar(.85);const beak=new THREE.Mesh(new THREE.BoxGeometry(4,.8,2.5),level29World.material('#cb9c3c'));beak.position.set(7,7,0);base.add(beak);}else if(kind==='goat'){base.scale.multiplyScalar(.7);for(const side of [-1,1]){const horn=new THREE.Mesh(new THREE.ConeGeometry(.8,6,8),level29World.material('#cbbfa4'));horn.position.set(6,18,side*2);horn.rotation.z=-.4;base.add(horn);}}else{base.scale.multiplyScalar(.7);const wool=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),level29World.material('#d7d2bb'));wool.scale.set(9,6.5,5.7);wool.position.set(0,9,0);base.add(wool);}return base;}
window.level29FarmModels={create:visitorAnimal};
})();
