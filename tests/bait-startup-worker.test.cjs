const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),T=require('../public/game/three.min.js'),B=require('../public/game/seafood-bait.js');
function launch(){
 const b={x:0,y:0,w:160,h:128,seed:12},v={depth:'bait',id:'retail',b,doorX:80,doorY:128,doorW:54,stationX:80,stationY:44.8,furniture:[],col:'#aabbaa',name:'BAYOU SEAFOOD & BAIT',short:'BAIT'},labels=[],colors=[];
 const c={THREE:T,level29SeafoodBait:B,terrainHeight:()=>0,cityGroup:new T.Group(),venueFloorTex:()=>null,softTex:null,addSign(){return new T.Group();},addPart(g,w,h,d,x,y,z,m){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);return o;},makeFigure(){const g=new T.Group(),body=new T.Group(),hair=new T.Group();g.add(body,hair);g.userData={body,hair};return g;},setFigureColors(...args){colors.push(args.slice(1));},batch(){return {box(){},finish(){}};},material:color=>new T.MeshStandardMaterial({color}),facade:color=>new T.MeshStandardMaterial({color}),box:(w,h,d,m)=>new T.Mesh(new T.BoxGeometry(w,h,d),m),hitRect:(x,y,r,s)=>x+r>s.x&&x-r<s.x+s.w&&y+r>s.y&&y-r<s.y+s.h,dist:(x,y,a,b)=>Math.hypot(x-a,y-b),signTex(label){labels.push(label);return null;}};c.window=c;vm.createContext(c);
 const expansion=fs.readFileSync('public/game/expansion.js','utf8');vm.runInContext(expansion.slice(expansion.indexOf('function buildVenue(v){'),expansion.indexOf('const _expBuildCity=')),c);
 // Include the real world decorator and its staff factory. The old test stopped before this wrapper.
 const world=fs.readFileSync('public/game/world.js','utf8');vm.runInContext(world.slice(world.indexOf('const jobs='),world.indexOf('// Detailed destinations in the expanded neighborhoods')),c);
 // places delegates non-extended retail to world, then city-life routes the authored bait shop to it.
 const places=fs.readFileSync('public/game/places.js','utf8');vm.runInContext('(function(){'+places.slice(places.indexOf('const oldVenue=buildVenue;'),places.indexOf('let guards=[]'))+'})();',c);
 const life=fs.readFileSync('public/game/city-life.js','utf8');vm.runInContext(life.slice(life.indexOf('const oldBuild=buildVenue;'),life.indexOf('const build=buildCity;')),c);
 return {c,v,labels,colors};
}
test('actual startup wrapper chain builds Seafood & Bait with retail staff instead of throwing at job[1]',()=>{
 const {c,v,labels,colors}=launch();assert.doesNotThrow(()=>c.buildVenue(v));assert.ok(v.referenceBait);assert.ok(v.worker&&v.worker.parent===v.mesh);assert.equal(labels.at(-1),'RETAIL CLERK');assert.equal(colors.length,1);assert.ok(colors[0].every(x=>typeof x==='string'&&/^#[0-9a-f]{6}$/i.test(x)));assert.ok(v.mesh.getObjectByName('Bayou Seafood & Bait · tackle and ice counter'));assert.equal(v.stationX,80);assert.equal(v.stationY,44.8);assert.ok(!v.furniture.some(s=>c.hitRect(v.stationX,v.stationY,10,s)));assert.ok(v.worker.position.toArray().every(Number.isFinite));
});
test('existing worker jobs still build with their original labels and without save access',()=>{
 for(const [id,label]of Object.entries({safe:'SAFE HOUSE CARETAKER',garage:'MECHANIC',armory:'ARMORY DEALER',spray:'CARWASH ATTENDANT',business:'BUSINESS MANAGER'})){
  const {c,v,labels}=launch();Object.assign(v,{id,mesh:new T.Group(),furniture:[]});assert.doesNotThrow(()=>c.worker(v));assert.equal(labels.at(-1),label);assert.ok(v.worker);assert.ok(v.worker.position.toArray().every(Number.isFinite));
 }
});
