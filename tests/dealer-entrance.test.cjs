const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const F=require('../public/game/street-frontage.js');
test('Bonnie entrance faces the slab court even when a street is closer behind the showroom',()=>{const b={x:320,y:320,w:192,h:96},v={id:'showroom',lotId:'dealer',b};const selected=F.displayFront(v);assert.equal(selected.angle,0);assert.equal(selected.x,416);assert.equal(selected.y,416);assert.equal(selected.dy,1);assert.equal(selected.distance,0);assert.equal(F.displayFront({...v,lotId:'airport'}),null);});
test('frontage generation keeps door colliders aligned with display side and leaves an interior aisle',()=>{
 const b={x:160,y:160,w:192,h:96},v={id:'showroom',lotId:'dealer',b,doorW:32,stationX:200,stationY:200,furniture:[]};const city={world:true,venues:[v],buildings:[b],trees:[],g:new Uint8Array(40*40)};
 const ctx={window:{},genCity:()=>city,buildVenue(){},TILE:16,MW:40,MH:40,T_ROAD:1,T_BRIDGE:2,T_WATER:3,T_WALK:4,indexTrees(){}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('public/game/street-frontage.js','utf8'),ctx);ctx.genCity();
 assert.equal(v.frontage.angle,0);assert.equal(v.doorY,256);assert.equal(v.colliderDoor.y,253);assert.equal(v.colliderDoor.x,240);assert.equal(v.colliderDoor.w,32);assert.equal(v.entranceAisle.y,214);
 assert.ok(v.colliderWalls.every(r=>!(v.doorX>r.x&&v.doorX<r.x+r.w&&v.doorY-1>r.y&&v.doorY-1<r.y+r.h)));
 assert.equal(city.g.filter(t=>t===4).length,0,'do not cut a new straight street ray through displayed cars');
});
