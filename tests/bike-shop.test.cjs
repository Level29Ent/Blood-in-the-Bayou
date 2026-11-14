const {test}=require('node:test'),assert=require('node:assert/strict'),T=require('three'),B=require('../public/game/bike-shop-interior.js');
const hit=(x,y,r,f)=>x+r>f.x&&x-r<f.x+f.w&&y+r>f.y&&y-r<f.y+f.h;
test('both storefront orientations keep radius-ten entrance and central showroom aisle open',()=>{
 for(const dir of [-1,1])for(const [w,h]of [[102,70],[66,60],[120,80]]){
  const s={room:{x:100,y:200,w,h},dir},p=B.plan(s),start=p.toWorld(0,h/2-1),end=p.toWorld(0,-h/2+28);
  for(let z=-h/2+28;z<=h/2+10;z+=1){const a=p.toWorld(0,z);assert.equal(p.solids.some(f=>hit(a.x,a.y,10,f)),false);}
  for(const f of p.solids){assert.ok(f.x>s.room.x&&f.x+f.w<s.room.x+w);assert.ok(f.y>s.room.y&&f.y+f.h<s.room.y+h);}
  assert.ok(Math.abs(start.y-end.y)>10);
 }
});
test('showroom has two-tier and hanging detailed bicycles in bounded instance batches with no lights',()=>{
 const s={dir:1,room:{x:0,y:0,w:102,h:70}},r=B.build(T,s);assert.equal(r.root.userData.bikeShop.bikes,10);assert.ok(r.root.userData.bikeShop.accessories>=20);assert.ok(r.root.children.length<=28);let draws=0,parts=0;const bounds=new T.Box3(),m=new T.Matrix4();r.root.updateMatrixWorld(true);
 r.root.traverse(o=>{assert.ok(!o.isLight);if(!o.isMesh)return;assert.ok(o.isInstancedMesh&&o.userData.noBatch);draws++;o.geometry.computeBoundingBox();for(let i=0;i<o.count;i++){parts++;o.getMatrixAt(i,m);assert.ok(m.elements.every(Number.isFinite));m.premultiply(o.matrixWorld);bounds.union(o.geometry.boundingBox.clone().applyMatrix4(m));}});
 assert.ok(draws<28&&parts>500);assert.ok(bounds.min.x>=0&&bounds.max.x<=102);assert.ok(bounds.min.z>=0&&bounds.max.z<=70);assert.ok(bounds.min.y>=1&&bounds.max.y<49);
});
test('reversed upper-floor shop remains inside its actual world-space room',()=>{
 const s={dir:-1,room:{x:800,y:900,w:102,h:70}},r=B.build(T,s,112),bounds=new T.Box3(),m=new T.Matrix4();r.root.updateMatrixWorld(true);r.root.traverse(o=>{if(!o.isInstancedMesh)return;o.geometry.computeBoundingBox();for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);m.premultiply(o.matrixWorld);bounds.union(o.geometry.boundingBox.clone().applyMatrix4(m));}});assert.ok(bounds.min.x>=800&&bounds.max.x<=902);assert.ok(bounds.min.z>=900&&bounds.max.z<=970);assert.ok(bounds.min.y>=113&&bounds.max.y<161);
});
