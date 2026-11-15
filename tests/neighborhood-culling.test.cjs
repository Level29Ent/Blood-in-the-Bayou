const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const T = require('three');
const B = require('../public/game/bonnie-showroom');
const P = require('../public/game/penthouse-luxury');
const V = require('../public/game/mobile-world-visibility');

function showroom() {
  const specs = {supercar:{len:44,wid:24},sedan:{len:48,wid:24},muscle:{len:48,wid:24},suv:{len:58,wid:28},slab:{len:62,wid:25},pickup:{len:58,wid:27}};
  const c = {THREE:T,clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),window:{},canvasTex:()=>new T.Texture(),vehicleEnv:()=>null,softTex:new T.Texture(),scene:new T.Scene(),carMeshes:new Map(),updateCar(){},syncCars(){},console};
  vm.createContext(c);
  vm.runInContext(fs.readFileSync('public/game/cars.js','utf8'),c);
  return B.build(T,{x:800,y:900,w:352,h:256},{car:slot=>{
    const mesh=c.makeCarMesh({type:slot.type,col:slot.color,spec:specs[slot.type],v:0});
    return slot.hero?B.customize(T,mesh):mesh;
  }}).root;
}
function drawables(root) { let n=0;root.traverseVisible(o=>{if(o.isMesh)n++;});return n; }

for (const name of ['penthouse','showroom']) {
  test(`${name} authored static detail is culled offscreen with geometry and ownership intact`, () => {
    const root = name==='penthouse'?P.build(T,{x:800,y:900,w:192,h:154}).root:showroom();
    const scene=new T.Scene();scene.add(root);
    const before=drawables(root),originals=[];
    root.traverse(o=>{if(o.isMesh)originals.push([o,o.geometry,o.material,o.isInstancedMesh?Array.from(o.instanceMatrix.array):null]);});
    // Reproduce the old exclusion without changing noBatch or any child ownership.
    delete root.userData.mobileStaticScenery;
    assert.equal(V.islands(T,scene).length,0);
    root.userData.mobileStaticScenery=true;
    const items=V.islands(T,scene);
    assert.ok(items.length>0);assert.ok(root.userData.noBatch);
    const camera=new T.PerspectiveCamera(70,1,1,2400);
    camera.position.set(975,20,1250);camera.lookAt(975,20,1600);
    V.draw(T,items,camera,scene,760,()=>assert.equal(drawables(scene),0));
    assert.equal(drawables(root),before);
    const eye=name==='penthouse'?125:20;
    camera.position.set(975,eye,1000);camera.lookAt(975,eye,950);
    V.draw(T,items,camera,scene,760,()=>assert.equal(drawables(scene),before));
    camera.position.set(975,20,2600);camera.lookAt(975,20,1000);
    V.draw(T,items,camera,scene,760,()=>assert.equal(drawables(scene),0));
    assert.throws(()=>V.draw(T,items,camera,scene,760,()=>{throw Error('draw failed');}),/draw failed/);
    assert.equal(root.visible,true);
    for(const [o,geo,mat,matrices] of originals){assert.equal(o.geometry,geo);assert.equal(o.material,mat);if(matrices)assert.deepEqual(Array.from(o.instanceMatrix.array),matrices);}
    assert.ok(before >= (name==='showroom'?300:20));
  });
}

test('static opt-in never absorbs actors, moving rigs, lights or unrelated noBatch room islands', () => {
  const root=new T.Group();root.userData.mobileStaticScenery=true;root.userData.noBatch=true;
  const fixed=new T.Mesh(new T.BoxGeometry(10,10,10),new T.MeshBasicMaterial());root.add(fixed);
  const dynamic=[];
  for(const flag of ['mobileMoving','body','legs','dynamic','wheel','vehicles']){
    const g=new T.Group();g.userData[flag]=true;g.add(new T.Mesh(new T.BoxGeometry(),new T.MeshBasicMaterial()));root.add(g);dynamic.push(g);
  }
  const light=new T.PointLight();root.add(light);
  const scene=new T.Group();scene.add(root);
  const room=new T.Group();room.userData.noBatch=true;room.add(new T.Mesh(new T.BoxGeometry(),new T.MeshBasicMaterial()));scene.add(room);
  const items=V.islands(T,scene);
  assert.ok(items.some(i=>i.node===fixed));
  assert.ok(!items.some(i=>[root,room,light,...dynamic].includes(i.node)));
});
