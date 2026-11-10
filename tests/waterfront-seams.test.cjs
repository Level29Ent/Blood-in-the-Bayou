const {test}=require('node:test'),assert=require('node:assert/strict'),T=require('three'),fs=require('node:fs');
const {continuousSurface,roadGeometry}=require('../public/game/city-renewal.js'),{buildNatchezExterior}=require('../public/game/riverboat-hub.js');
test('waterfront neighboring cells share exact vertex heights instead of 32-unit stair steps',()=>{
 const width=12,cells=[25,26,27,37,38,39],values=new Map(cells.map((k,i)=>[k,[40,20,0,40,20,0][i]])),s=continuousSurface(width,cells,values,()=>0);
 for(const x of [64,96])for(let z=64;z<=128;z+=2){assert.ok(Math.abs(s.height(x-.00001,z)-s.height(x+.00001,z))<.001);}
 const geo=roadGeometry(T,width,cells,s.height),p=geo.attributes.position,vertices=new Map();for(let i=0;i<p.count;i++){const key=p.getX(i)+','+p.getZ(i);if(vertices.has(key))assert.equal(vertices.get(key),p.getY(i));vertices.set(key,p.getY(i));assert.ok(Math.abs(p.getY(i)-s.height(p.getX(i),p.getZ(i)))<1e-6);}
 assert.equal(s.height(500,500),0);
});
test('pavement triangles use the same interpolation as character/vehicle support',()=>{
 const s=continuousSurface(10,[22,23,32,33],new Map([[22,40],[23,20],[32,10],[33,0]]),()=>0),g=roadGeometry(T,10,[22,23,32,33],s.height),mesh=new T.Mesh(g,new T.MeshBasicMaterial({side:T.DoubleSide}));mesh.updateMatrixWorld();
 for(let x=65;x<127;x+=7)for(let z=65;z<127;z+=7){const ray=new T.Raycaster(new T.Vector3(x,100,z),new T.Vector3(0,-1,0)),hit=ray.intersectObject(mesh)[0];assert.ok(hit);assert.ok(Math.abs(hit.point.y-s.height(x,z))<.0001);}
});
test('Natchez paddlewheel is on the far side, not across the casino boarding landing',()=>{
 const entry={x:5688,y:6400},b=buildNatchezExterior(T,entry),wheel=b.userData.wheel;b.updateMatrixWorld(true);const p=wheel.getWorldPosition(new T.Vector3());assert.ok(p.x-entry.x>300);assert.ok(Math.hypot(p.x-entry.x,p.z-entry.y)>300);const gangway=b.children.filter(m=>m.geometry?.type==='BoxGeometry'&&m.geometry.parameters.width===66)[0];const center=gangway.getWorldPosition(new T.Vector3());assert.ok(Math.abs(center.x-entry.x)<45);assert.ok(Math.abs(center.z-entry.y)<1);
});
test('peaceful camera does not re-enable weapon overlay and remote casino interior is hidden outside',()=>{
 const coast=fs.readFileSync('public/game/coastline.js','utf8'),hub=fs.readFileSync('public/game/riverboat-hub.js','utf8');assert.ok(coast.includes('vmScene.visible=!window.level29Prologue?.peaceful'));assert.ok(hub.includes('if(root)root.visible=!!active'));assert.ok(fs.readFileSync('public/game/world.js','utf8').includes("f.kind==='riverfront'&&!city.riverboatHub"));
});
