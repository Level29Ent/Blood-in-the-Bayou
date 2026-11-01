const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');const THREE=require('three');
const {reserve,overlap}=require('../public/game/amenity-parcels.js');const {altitude}=require('../public/game/aircraft-flight.js');
test('cemetery avoids the whole dealer display lot, not only its showroom building',()=>{
 const grave={kind:'cemetery',x:160,y:192,w:128,h:128},lot={x:128,y:128,w:320,h:288},building={x:128,y:128,w:128,h:48};
 assert.equal(overlap(grave,building),false);const c={g:new Uint8Array(64*64),buildings:[building],features:[grave],activityParcels:[lot]};
 reserve(c,16,64,64,[1],2);assert.equal(overlap(grave,lot,32),false);assert.equal(c.amenityMoves.length,1);
});
test('cemetery relocates off road/water tiles even without a building overlap',()=>{
 const grave={kind:'cemetery',x:96,y:96,w:96,h:96},c={g:new Uint8Array(32*32),buildings:[],features:[grave]};c.g[7*32+7]=1;
 reserve(c,16,32,32,[1],2);assert.equal(c.amenityMoves.length,1);
 for(let y=grave.y/16;y<(grave.y+grave.h)/16;y++)for(let x=grave.x/16;x<(grave.x+grave.w)/16;x++)assert.notEqual(c.g[y*32+x],1);
});
test('Natchez has a continuous deck under the captain and its own full-body NPC',()=>{
 const source=fs.readFileSync('public/game/boomcity.js','utf8');const ctx={THREE,T:32,PIER:{x0:118,x1:120,y0:80,y1:82},CAPTAIN:{x:119*32,y:81.5*32},lam:c=>new THREE.MeshBasicMaterial({color:c}),geoBox:(w,h,d)=>new THREE.BoxGeometry(w,h,d),
 put(g,geo,mat,x,y,z){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);g.add(m);return m;},signPlane(){},makeFigure(){return new THREE.Group();},setFigureColors(){},poseFigure(m,x,y){m.position.set(x,0,y);}};
 vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf('function buildDock(){'),source.indexOf('const prevBuild=buildCity;')),ctx);
 const g=ctx.buildDock(),captain=g.getObjectByName('Natchez captain'),deck=g.children.find(m=>m.geometry?.parameters?.width===96);
 assert.ok(captain);assert.equal(captain.position.y,2);assert.ok(deck);assert.equal(deck.position.y+deck.geometry.parameters.height/2,captain.position.y);
 assert.ok(Math.abs(captain.position.x-deck.position.x)<=48);assert.ok(Math.abs(captain.position.z-deck.position.z)<=48);
});
test('flight altitude clears the whole terrain orbit and nearby buildings',()=>{
 const c={heightAt:(x,y)=>x>400?350:20,buildings:[{x:400,y:-30,w:70,h:60,H:500,baseY:50}],venues:[]};
 assert.equal(altitude(c,0,0,440),1430);
 const far={x:2000,y:2000,w:100,h:100,H:4000};c.buildings.push(far);assert.equal(altitude(c,0,0,440),1430);
});
test('flight considers hospital floors and the residence tower along the orbit',()=>{
 const b={x:400,y:-40,w:80,h:80,H:50,baseY:12},c={heightAt:()=>12,buildings:[b],venues:[{id:'hospital',b}]};
 assert.equal(altitude(c,0,0,440),492);c.residence={b};assert.equal(altitude(c,0,0,440),1242);
});
test('gunner camera shares plane altitude instead of walking terrain offsets and restores walking afterward',()=>{
 let walk=0,fired=0;const ride={a:0,mesh:{position:new THREE.Vector3(100,480,200)}};
 const ctx={window:{level29Downtown:{ride}},camera:new THREE.PerspectiveCamera(),city:{heightAt:()=>300},placeCamera(){walk++;return 7;},fireWeapon(){fired++;}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync('public/game/aircraft-camera.js','utf8'),ctx);
 ctx.placeCamera();assert.equal(walk,0);assert.equal(ctx.camera.position.y,470);assert.equal(ctx.camera.position.x,100);ctx.fireWeapon();assert.equal(fired,0);
 ctx.window.level29Downtown.ride=null;assert.equal(ctx.placeCamera(),7);assert.equal(walk,1);ctx.fireWeapon();assert.equal(fired,1);
});
test('ride mesh and tracers use the computed altitude and landing clears velocity and held fire',()=>{
 const s=fs.readFileSync('public/game/downtown.js','utf8');const ctx={THREE,ride:{altitude:480},city:{heightAt:()=>300},scene:new THREE.Group(),tracers:[]};vm.createContext(ctx);
 vm.runInContext(s.slice(s.indexOf('function addTracer('),s.indexOf('function updateTracers(')),ctx);ctx.addTracer(1,2,3,4);
 const position=ctx.tracers[0].l.geometry.attributes.position;assert.equal(position.getY(0),475);assert.equal(position.getY(1),304);
 assert.match(s,/position.set\(px,ride.altitude,py\)/);
});
test('late terrain pass clears pier vegetation and restores walkable bridge tiles',()=>{
 const c={world:true,g:new Uint8Array(32*32),features:[],buildings:[],trees:[{x:180,y:180},{x:600,y:600}],pineTrees:[{x:170,y:170}],rocks:[{x:185,y:185}],heightAt:()=>20,natchezParcel:{x:152,y:152,w:112,h:112}};
 const ctx={window:{level29Downtown:{lots:{}},level29OpenWorld:{}},genCity:()=>c,buildVenue(){},level29SiteLayout:require('../public/game/site-layout.js'),level29Terrain:require('../public/game/terrain-sites.js'),TILE:32,MW:32,T_WATER:2,T_BRIDGE:3,indexTrees(){}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync('public/game/terrain-layout.js','utf8'),ctx);ctx.genCity();assert.equal(c.heightAt(180,180),0);assert.equal(c.g[5*32+5],3);assert.equal(c.pineTrees.length,0);assert.equal(c.rocks.length,0);assert.equal(c.trees.length,1);
});
