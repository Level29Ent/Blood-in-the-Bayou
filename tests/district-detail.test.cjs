const {test}=require('node:test'),assert=require('node:assert/strict'),T=require('three'),fs=require('node:fs'),vm=require('node:vm');
const E=require('../public/game/cathedral-energy.js'),B=require('../public/game/business-richness.js'),F=require('../public/game/festival-spectacle.js');
function bounds(root){const box=new T.Box3(),m=new T.Matrix4(),world=new T.Matrix4();root.updateMatrixWorld(true);root.traverse(o=>{if(!o.isMesh)return;o.geometry.computeBoundingBox();if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);world.multiplyMatrices(o.matrixWorld,m);box.union(o.geometry.boundingBox.clone().applyMatrix4(world));}}else box.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld));});return box;}
test('relocation is snapped, dry and excludes every reserved building and public road',()=>{
 const c={width:80,height:80,get:(x,y)=>y===20?1:x<8?4:0,heightAt:()=>0},reserved=[{x:500,y:500,w:320,h:320}],r=E.chooseSite(c,{w:320,h:320},{x:800,y:800},reserved,{maxDistance:1000});assert.ok(r);assert.equal(r.x%32,0);assert.equal(r.y%32,0);assert.ok(!E.overlap(r,reserved[0],24));for(let y=r.y;y<r.y+r.h;y+=32)for(let x=r.x;x<r.x+r.w;x+=32)assert.notEqual(c.get(x/32,y/32),1);
 assert.equal(E.chooseSite({...c,get:()=>4},{w:320,h:320},{x:800,y:800},[],{maxDistance:1000}),null);
});
test('moved business metadata, canonical frontage, furniture, station and approach move together once',()=>{
 const door={x:10,y:30,w:20,h:3},v={b:{x:0,y:0,w:100,h:100},doorX:50,doorY:100,stationX:50,stationY:60,colliderWalls:[door],colliderDoor:door,furniture:[{x:20,y:20,w:10,h:10}],entranceAisle:{x:30,y:60,w:40,h:40},depthPath:[{x:50,y:130}],frontage:{x:50,y:100,center:{x:50,y:50},canonical:{x:0,y:0,w:100,h:100},street:{x:50,y:140}}};E.translateVenue(v,320,640);assert.equal(v.doorX,370);assert.equal(v.doorY,740);assert.equal(door.x,330);assert.equal(v.frontage.center.y,690);assert.equal(v.entranceAisle.y,700);assert.equal(v.depthPath[0].x,370);
});
test('nuclear station remains inside the former cathedral parcel with solid structures and a clear gate',()=>{
 const site={x:1000,y:2000,w:320,h:320},g=E.buildPlant(T,site),b=bounds(g);assert.ok(b.min.x>=site.x-1);assert.ok(b.max.x<=site.x+site.w+1);assert.ok(b.min.z>=site.y-1);assert.ok(b.max.z<=site.y+site.h+1);assert.ok(b.max.y>140);assert.ok(g.children.length<25);const gate={x:site.x+site.w/2,y:site.y+site.h-12};assert.ok(!g.userData.solids.some(r=>E.overlap({x:gate.x-10,y:gate.y-10,w:20,h:20},r)));
});
test('business fixture plans never obstruct central aisles, service pads, doorways or existing furniture',()=>{
 const v={id:'cafe',name:'BAYOU COFFEE',b:{x:0,y:0,w:180,h:180},doorX:90,doorY:180,stationX:90,stationY:55,furniture:[{x:12,y:25,w:32,h:30}]},p=B.plan(v);assert.ok(p.length>=2);for(const r of p){assert.equal(r.kind,'food');assert.ok(!B.overlap(r,{x:69,y:6,w:42,h:168},2));assert.ok(!B.overlap(r,v.furniture[0],8));assert.ok(Math.hypot(r.x+r.w/2-v.stationX,r.y+r.h/2-v.stationY)>=44);}
});
test('businesses receive specific material/merchandise categories, not identical empty counters',()=>{
 const cases=[['MAJOR CAJUN','food'],['CAMERA SHOP','tech'],['CRESCENT PHARMACY','care'],['AK GUN PLUS','equipment'],['TIRE SHOP','workshop'],['BAYOU FASHION','fashion'],['BOOK STORE','books'],['BOTANICA','nature'],['FRESH MARKET','market'],['ACCOUNTING','office'],['FURNITURE STORE','furniture'],['TOY STORE','toys'],['SPORTING GOODS','sports'],['MUSIC STORE','music']];for(const [name,kind]of cases){assert.equal(B.category({name}),kind);const m=B.fixture(T,kind),b=bounds(m);assert.ok(m.userData.itemCount>=40);assert.ok(b.max.y>=28);assert.ok(b.max.x-b.min.x<=31);assert.ok(m.children.every(o=>o.isInstancedMesh));assert.ok(m.children.length<25);}
});
test('five Mardi Gras floats have distinct tall sculpted themes, riders, skirts and bounded batch counts',()=>{
 const names=new Set();for(let i=0;i<5;i++){const f=F.floatModel(T,i),b=bounds(f);names.add(f.userData.theme);assert.ok(b.max.y>40);assert.ok(b.max.z-b.min.z<=30);assert.ok(b.max.x-b.min.x>=70);assert.ok(f.children.length<28);assert.ok(f.children.every(m=>m.isInstancedMesh));}assert.equal(names.size,5);
});
test('confetti remains a three-batch bounded effect and hides all far particles',()=>{
 const root=F.confetti(T,96),point=()=>({x:10,y:10});F.animateConfetti(T,root,[],point,3,{x:0,y:0});assert.equal(root.children.length,3);assert.equal(root.children.reduce((n,m)=>n+m.count,0),96);F.animateConfetti(T,root,[],point,3,{x:1000,y:1000});assert.equal(root.children.reduce((n,m)=>n+m.count,0),0);
});
test('actual generation wrapper relocates the whole cathedral grouping, reserves the old site for the plant and preserves roads',()=>{
 const width=100,height=100,g=new Uint8Array(width*height);for(let y=0;y<height;y++)g[y*width+5]=1;
 const old={x:2000,y:1800,w:320,h:320},mansion={x:800,y:300,w:192,h:160,venue:'safe'},c={world:true,width,height,g,get:(x,y)=>g[y*width+x]??4,heightAt:()=>0,mansion:{B:mansion},venues:[{id:'safe',b:mansion}],buildings:[mansion],features:[],survivalLandmarks:{sites:{cathedral:{...old}},paths:[],solids:[]},nolaLandmarks:{sites:{}},trees:[],rocks:[],parked:[]};
 const context={window:null,city:c,genCity:()=>c,buildCity(){},blockedCircle:()=>false,extraBlips:()=>[],level29DistrictPlanning:{access:(c,p)=>[{x:176,y:Math.floor(p.y/32)*32+16}]},indexTrees(){},T_WALK:2,T_GRASS:0,T_LOT:6,T_PLAZA:5};context.window=context;vm.createContext(context);vm.runInContext(fs.readFileSync('public/game/cathedral-energy.js','utf8'),context);context.genCity();const moved=c.survivalLandmarks.sites.cathedral;assert.notEqual(moved.x,old.x);assert.deepEqual(JSON.parse(JSON.stringify(c.energyPlant.site)),old);assert.equal(c.features.find(f=>f.kind==='nuclear-plant').x,old.x);assert.ok(Math.hypot(moved.x+160-896,moved.y+160-380)<1500);for(let y=0;y<height;y++)assert.equal(c.g[y*width+5],1);assert.ok(c.cathedralRelocation.moves.some(m=>m.key==='cathedral'));
});
test('stocked Greenmart uses food bottles and produce geometry downstairs, varied package proportions upstairs',()=>{
 const {stock}=require('../public/game/retail-stock.js'),ground=stock(T,0),upper=stock(T,56);assert.ok(ground.children.some(m=>m.geometry.type==='SphereGeometry'));assert.ok(ground.children.some(m=>m.geometry.type==='CylinderGeometry'));assert.equal(ground.children.length,5);assert.equal(upper.children.length,5);const a=new T.Matrix4(),b=new T.Matrix4();upper.children[0].getMatrixAt(0,a);upper.children[1].getMatrixAt(0,b);assert.notEqual(a.elements[5],b.elements[5]);
});
test('real storefront wall colliders leave usable shelving setbacks instead of rejecting all fixtures',()=>{
 const b={x:100,y:100,w:160,h:160},v={id:'cafe',name:'BAYOU COFFEE',b,doorX:180,doorY:260,stationX:180,stationY:140,furniture:[],colliderWalls:[{x:100,y:100,w:160,h:3},{x:100,y:100,w:3,h:160},{x:257,y:100,w:3,h:160}]};const p=B.plan(v);assert.ok(p.length>=2);for(const r of p)assert.ok(!v.colliderWalls.some(w=>B.overlap(r,w,8)));
});
test('crypt pickups follow the moved cathedral center, including the compact square layout',()=>{
 const src=fs.readFileSync('public/game/survival-stories.js','utf8');assert.ok(src.includes('x:cat.x+cat.w/2,y:cat.y+65'));assert.ok(src.includes('x:cat.x+cat.w/2,y:cat.y+190'));assert.ok(!src.includes('x:cat.x+160'));
});
test('the full-size church remains walkable inside its compact square and relocated crypt points are clear',()=>{
 const {buildLandmark}=require('../public/game/survival-landmarks.js'),site={x:512,y:1472,w:256,h:256},g=buildLandmark(T,site,'cathedral');for(const y of [site.y+65,site.y+190,site.y+site.h+16]){const p={x:site.x+site.w/2-10,y:y-10,w:20,h:20};assert.ok(!g.userData.solids.some(r=>E.overlap(p,r)));}const b=bounds(g);assert.ok(b.max.y>=190,'the church itself was not scaled down');assert.ok(b.min.x>=site.x&&b.max.x<=site.x+site.w);
});
