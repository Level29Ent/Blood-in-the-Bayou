const {test}=require('node:test'),assert=require('node:assert/strict'),T=require('three'),fs=require('node:fs'),vm=require('node:vm');
const F=require('../public/game/firearm-models.js');
test('all firearm families have finite normals and believable separated features within a bounded draw budget',()=>{
 for(const id of ['pistol','smg','carbine','marksman','shotgun']){
  const g=F.create(T,id),b=new T.Box3().setFromObject(g),size=b.getSize(new T.Vector3());assert.ok(g.children.length<=7);assert.ok(size.z>size.x*3);assert.ok(size.y<size.z);assert.ok(size.z<32);
  assert.ok(g.userData.details.includes('recessed muzzle'));assert.ok(g.userData.details.includes('open trigger guard'));assert.ok(g.userData.details.includes('ejection port'));
  let triangles=0;g.traverse(o=>{if(!o.geometry)return;triangles+=o.geometry.attributes.position.count/3;for(const key of ['position','normal','uv'])for(const n of o.geometry.attributes[key].array)assert.ok(Number.isFinite(n));});assert.ok(triangles<14000,id+' triangles '+triangles);
 }
 assert.ok(F.create(T,'marksman').userData.details.includes('scope lenses'));assert.equal(F.create(T,'snowball'),null);
});
test('retail/held clones share immutable geometry and materials but not transforms',()=>{
 const a=F.create(T,'carbine'),b=F.create(T,'carbine');assert.notEqual(a,b);assert.equal(a.children[0].geometry,b.children[0].geometry);assert.equal(a.children[0].material,b.children[0].material);a.scale.setScalar(.2);a.rotation.y=2;assert.equal(b.scale.x,1);assert.equal(b.rotation.y,0);
});
test('detailed gun replacements preserve existing held transforms, visibility and arsenal identity without changing gameplay data',()=>{
 const ids=['shotgun','rpg','molotov','bat','pistol','smg','carbine','marksman'],gun=new T.Group(),scene=new T.Scene();gun.position.set(3,-4,-12);gun.scale.setScalar(.55);scene.add(gun);
 const extra=Object.fromEntries(ids.map(id=>{const g=new T.Group();g.position.set(2,-3,-10);g.scale.setScalar(.6);scene.add(g);return [id,g]}));
 const ctx={THREE:T,window:{level29FirearmModels:F},gun,vmScene:scene,extraWeap:extra,ensurePools(){},buildM240(){const g=new T.Group();g.userData.flash={};return g},buildShotgun:()=>new T.Group(),buildRPG:()=>new T.Group(),buildMolotov:()=>new T.Group(),buildBat:()=>new T.Group(),arms(g){const m=new T.Mesh(new T.BoxGeometry(),new T.MeshStandardMaterial());m.userData.firstPersonOnly=true;g.add(m)},bake:g=>g,muzzle:null};
 vm.createContext(ctx);const src=fs.readFileSync('public/game/arsenal-visuals.js','utf8');vm.runInContext(src.slice(src.indexOf('let installed=false;'),src.indexOf('const oldSync=syncGta;')),ctx);ctx.ensurePools();
 for(const id of ['pistol','smg','carbine','marksman']){const g=extra[id];assert.equal(g.userData.firearm,id);assert.deepEqual(g.position.toArray(),[2,-3,-10]);assert.equal(g.scale.x,.6);assert.equal(g.visible,false);assert.ok(g.children.at(-1).children[0].userData.firstPersonOnly);}
 const once=extra.pistol;ctx.ensurePools();assert.equal(extra.pistol,once);assert.deepEqual(ctx.gun.position.toArray(),[3,-4,-12]);
});
