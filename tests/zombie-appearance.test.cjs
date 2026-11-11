const {test}=require('node:test'),assert=require('node:assert/strict'),T=require('three'),C=require('cannon-es'),fs=require('node:fs'),vm=require('node:vm');
const {createHorde,pose}=require('../public/game/survival-instances.js'),{RagdollWorld,bindZombieVisual}=require('../public/game/articulated-physics.js');
function figure(){const c={THREE:T,MAT:{eye:new T.MeshBasicMaterial({color:'red'})},lam:c=>new T.MeshLambertMaterial({color:c}),CAMO:['#4b5320']};vm.createContext(c);const s=fs.readFileSync('public/game/fp.js','utf8');vm.runInContext(s.slice(s.indexOf('let FIG = null;'),s.indexOf('function makeBoss(')),c);vm.runInContext(s.slice(s.indexOf('function configureZombieFigure('),s.indexOf('function syncDynamic(){')),c);return c;}
test('distant zombies retain six draw batches but have rounded heads, face detail and per-zombie clothing',()=>{
 const root=createHorde(T,48);assert.equal(root.children.length,6);assert.ok(root.children.every(m=>m.geometry.type==='BufferGeometry'));
 assert.ok(root.children[1].geometry.attributes.position.count>100);assert.ok(root.children[1].geometry.attributes.color);
 const actors=[{x:10,y:20,a:0,anim:1,shirt:'#883344',type:'runner'},{x:20,y:20,a:1,anim:2,shirt:'#224477'}];pose(T,root,actors,()=>5);
 const c=new T.Color();root.children[0].getColorAt(0,c);assert.equal(c.getHexString(),'883344');root.children[0].getColorAt(1,c);assert.equal(c.getHexString(),'224477');
 for(const mesh of root.children){assert.equal(mesh.count,2);const m=new T.Matrix4();mesh.getMatrixAt(0,m);assert.ok(m.elements.every(Number.isFinite));}
 assert.equal(actors[0].x,10);pose(T,root,[],()=>0);assert.ok(root.children.every(m=>m.count===0));
});
test('death physics renders the configured zombie anatomy, not collider boxes, and preserves shared resources',()=>{
 const c=figure(),f=c.makeFigure(true);c.configureZombieFigure(f,{type:'runner',shirt:'#883344',fem:true,v:.2});f.userData.eyes.visible=false;
 const scene=new T.Scene(),world=new RagdollWorld(C,T,scene),r=world.spawn(100,5,200,{x:5,y:1,z:0});
 const shared=f.userData.legL.children[0].geometry,sharedMat=f.userData.legL.children[2].material;let disposed=0;shared.addEventListener('dispose',()=>disposed++);sharedMat.addEventListener('dispose',()=>disposed++);
 bindZombieVisual(T,r,f,100,5,200,.7);assert.ok(r.meshes.every(g=>g.isGroup));assert.ok(r.meshes[2].children.some(m=>m.geometry.type==='SphereGeometry'));
 assert.ok(r.meshes.flatMap(g=>g.children).some(m=>m.material===f.userData.shirt));assert.equal(f.userData.shirt.color.getHexString(),'883344');
 for(let i=0;i<30;i++)world.step(1/60);assert.ok(r.meshes.every(g=>g.position.toArray().every(Number.isFinite)));world.remove(r);assert.equal(disposed,0);assert.equal(scene.children.length,0);world.dispose();
});
test('corpse configuration preserves runner scale, clothing and hair while resetting reused pool state',()=>{
 const c=figure(),m=c.makeFigure(true);c.configureZombieFigure(m,{type:'brute',shirt:'#123456',military:true,v:.2});assert.equal(m.scale.x,1.6);assert.equal(m.userData.helmet.visible,true);
 c.configureZombieFigure(m,{type:'runner',shirt:'#883344',fem:true,v:.8});assert.equal(m.scale.x,.95);assert.equal(m.userData.helmet.visible,false);assert.equal(m.userData.longHair.visible,true);assert.equal(m.userData.shirt.color.getHexString(),'883344');
});
test('corpse renderer waits for the real-model ragdoll and resumes only after removal',()=>{
 const source=fs.readFileSync('public/game/fp.js','utf8'),a=source.indexOf('  cPool.begin();'),b=source.indexOf('  // survivors',a);let requested=0;
 const q={k:'corpse',x:0,y:0,a:0,t:100,ragdoll:{root:{parent:{}}}},u={eyes:{},legL:{rotation:{}},legR:{rotation:{}},armL:{rotation:{}},armR:{rotation:{}},body:{rotation:{set(){}},position:{}}};
 const c={parts:[q],far:600,camP:{x:0,z:0},dist:()=>0,configureZombieFigure(){},cPool:{begin(){},end(){},get(){requested++;return [{userData:u,position:{set(){}},rotation:{set(){}}},true];}}};vm.createContext(c);vm.runInContext(source.slice(a,b),c);assert.equal(requested,0);q.ragdoll.root.parent=null;vm.runInContext(source.slice(a,b),c);assert.equal(requested,1);
});
