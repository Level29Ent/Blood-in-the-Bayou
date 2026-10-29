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
 const ell=(mat,x,y,z,sx,sy,sz)=>{const m=new THREE.Mesh(sphere,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);g.add(m);return m;};
 const horn=(x,y,z,mat,h=3)=>{const m=new THREE.Mesh(cone,mat);m.position.set(x,y,z);m.scale.set(.6,h,.6);g.add(m);};
 if(kind==='chicken'){
  ell(skin,0,5,0,4,3.4,2.8);ell(skin,3,8,0,1.7,2.7,1.8);ell(skin,4,10,0,1.7,1.8,1.6);
  for(const z of [-2.4,2.4])ell(skin,-.6,5.6,z,2.9,2.2,.55);
  for(const z of [-.9,.9]){ell(gold,0,1.7,z,.28,1.8,.28);for(let i=-1;i<=1;i++)ell(gold,1,.2,z+i*.45,1.5,.2,.18);ell(dark,5,10.5,z*1.65,.24,.28,.22);}
  ell(gold,6,9.7,0,1.2,.55,.7);for(let i=0;i<3;i++)ell(red,3.2+i*.7,12,0,.5,.9,.4);ell(red,5,8.3,0,.5,.8,.5);
  for(let i=0;i<4;i++){const m=ell(skin,-4-i*.35,7+i*.65,(i-1.5)*.5,2.3,.5,.7);m.rotation.z=-.5;}
 }else{
  const cow=kind==='cow',scale=cow?1:.8;g.scale.setScalar(scale);ell(skin,0,12,0,cow?12:10,6,5.7);ell(skin,8,14,0,5,5,4.7);ell(skin,12,14,0,4,4.8,3.8);ell(pink,15,12,0,2.4,2,3);
  for(const z of [-1.4,1.4])ell(dark,17,12,z,.25,.5,.4);
  for(const z of [-3.7,3.7]){ell(dark,12.6,16,z,.55,.65,.35);const ear=ell(skin,9,18,z*1.5,2.6,.65,1.4);ear.rotation.z=z>0?.2:-.2;}
  for(const x of [-7,7])for(const z of [-3.8,3.8]){ell(skin,x,6,z,1.3,5,1.25);ell(dark,x+.4,1.2,z,1.65,1.2,1.35);ell(skin,x,8,z,1.8,2.3,1.7);}
  if(cow){for(const z of [-2.7,2.7])horn(10,20,z,ivory);ell(pink,-3,6,0,3.4,1.8,2.6);for(const x of [-4,-2])for(const z of [-1,1])ell(pink,x,4.6,z,.35,.85,.35);const tail=ell(skin,-12,10,0,.55,4,.6);tail.rotation.z=-.3;ell(dark,-13,6,0,1,1.7,.9);}
  else{for(const z of [-2.8,2.8])horn(10,20,z,skin,3);const tail=new THREE.Mesh(new THREE.TorusGeometry(1.1,.28,6,18,Math.PI*1.8),pink);tail.position.set(-10,12,0);tail.rotation.y=Math.PI/2;g.add(tail);}
 }
 // Merge static anatomy per material before animation moves the whole animal.
 const scale=g.scale.x;g.scale.setScalar(1);if(window.level29BatchStatic)level29BatchStatic(g,[]);g.scale.setScalar(scale);g.userData.kind=kind;return g;
}
window.level29FarmModels={create};
})();
