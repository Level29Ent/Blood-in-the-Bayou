const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const THREE=require('three');
function setup(){const ctx={THREE,window:{},MAT:{eye:new THREE.MeshBasicMaterial()},lam:c=>new THREE.MeshLambertMaterial({color:c}),scene:new THREE.Scene(),camera:new THREE.PerspectiveCamera(),state:'play',syncDynamic(){},document:{createElement:()=>({getContext:()=>({fillRect(){},fillText(){}})})}};
 vm.createContext(ctx);const source=fs.readFileSync('public/game/fp.js','utf8');vm.runInContext(source.slice(source.indexOf('let FIG = null;'),source.indexOf('function makeBoss(')),ctx);vm.runInContext(source.slice(source.indexOf('function poseFigure('),source.indexOf('// ---------- Cars ----------')),ctx);return ctx;}
test('human face has round eyes, visible nose bridge, cheek and lip geometry with shared reusable parts',()=>{const c=setup(),a=c.makeFigure(false),b=c.makeFigure(false),u=a.userData;
 assert.ok(u.face.children.length>=15);assert.ok(u.face.children.filter(o=>o.geometry.type==='SphereGeometry').length>=12);
 assert.equal(u.head.geometry,b.userData.head.geometry);assert.notEqual(u.skin,b.userData.skin);assert.ok(u.jaw);
 const bnd=new THREE.Box3().setFromObject(a);assert.ok(bnd.max.y>20&&bnd.max.y<23);
 c.setFigureColors(a,'#b17953','#394f62','#20312f','#171717');assert.equal(u.skin.color.getHexString(),'b17953');assert.notEqual(u.skin.color.getHex(),b.userData.skin.color.getHex());
 for(const mode of ['stand','wave','walk']){c.poseFigure(a,100,200,.5,2,mode);assert.ok(Number.isFinite(u.armR.rotation.x));assert.equal(a.position.x,100);}
});
test('zombies retain glow-eye and helmet rig rather than receiving civilian faces',()=>{const c=setup(),z=c.makeFigure(true);assert.equal(z.userData.face,null);assert.ok(z.userData.eyes);assert.ok(z.userData.helmet);c.poseFigure(z,1,2,0,1,'zombie');assert.ok(z.userData.armL.rotation.z>1);});
test('named profiles are distinct and nearby labels hide beyond recognition distance',()=>{const c=setup();vm.runInContext(fs.readFileSync('public/game/people.js','utf8'),c);const api=c.window.level29People;
 const a=c.makeFigure(false);c.scene.add(a);api.identify(a,'alex');api.identify(a,'alex');assert.equal(a.children.filter(o=>o.isSprite).length,1);assert.equal(a.userData.identity,'alex');assert.equal(a.userData.nameplate.material.depthTest,true);
 a.position.set(60,0,0);c.syncDynamic();assert.equal(a.userData.nameplate.visible,true);a.position.x=300;c.syncDynamic();assert.equal(a.userData.nameplate.visible,false);
 const b=c.makeFigure(false);api.identify(b,'felicia');assert.notEqual(a.userData.head.scale.z,b.userData.head.scale.z);assert.equal(Object.keys(api.profiles).length,8);
});
test('named NPC customizations keep detailed faces visible and do not cover eyes with beard spheres',()=>{const c=setup();vm.runInContext(fs.readFileSync('public/game/people.js','utf8'),c);const s=fs.readFileSync('public/game/story-scenes.js','utf8');c.canvasTex=()=>new THREE.Texture();vm.runInContext(s.slice(s.indexOf('const materials='),s.indexOf('function kitchen(')),c);
 for(const id of ['jojo','sheldon','dayshawn','felicia','alex','damion']){const actor=c.figure(id);assert.equal(actor.userData.face.visible,true);assert.equal(actor.userData.identity,id);assert.ok(actor.userData.nameplate);const facePos=new THREE.Vector3(2,18.65,0);
 for(const mesh of actor.userData.body.children){if(!mesh.visible||!mesh.isMesh||mesh===actor.userData.head||mesh===actor.userData.jaw||mesh===actor.userData.hair)continue;if(mesh.geometry.type!=='SphereGeometry')continue;mesh.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(mesh);assert.ok(Number.isFinite(bounds.min.x)&&Number.isFinite(bounds.max.y),id+' nonfinite detail');assert.equal(new THREE.Box3().setFromObject(mesh).containsPoint(facePos),false,id+' detail covers eyes');}
 }
});

test('Ronnie retains a full-width torso and shared facial features with bounded hair mesh cost',()=>{
 const c=setup();c.patchTex=()=>new THREE.Texture();c.mkRng=()=>()=>.5;c.box=(w,h,d,mat)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
 const s=fs.readFileSync('public/game/ronnie.js','utf8');vm.runInContext(s.slice(s.indexOf('function makeRonnie(){'),s.indexOf('function syncRonnie(){')),c);
 const m=c.makeRonnie();assert.equal(m.userData.face.visible,true);assert.ok(m.userData.torso.scale.x>2.3);assert.ok(m.userData.torso.scale.z>3.7);
 let count=0;m.traverse(o=>{if(o.isMesh)count++;});assert.ok(count<125,'avoid per-loc decorative mesh explosions');
 const bounds=new THREE.Box3().setFromObject(m);assert.ok(Number.isFinite(bounds.max.y));
});
