const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),THREE=require('three');
const {buildKarma}=require('../public/game/karma-model.js');
const doc={createElement(){return {width:0,height:0,getContext(){return new Proxy({},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});}};}};
test('Karma has a photo-inspired branded interior and clear central entry-to-counter aisle',()=>{
 global.document=doc;try{const m=buildKarma(THREE);let glass=0,lights=0;const maps=new Set();m.root.traverse(o=>{if(!o.isMesh)return;if(o.material.transparent&&o.material.opacity===.14)glass++;if(o.material.emissiveIntensity===1.4)lights++;if(o.material.map)maps.add(o.material.map);});assert.equal(glass,10);assert.equal(lights,3);assert.ok(maps.size>=8);assert.equal(m.roof.material.side,THREE.FrontSide);
 for(let z=8.5;z>=-5;z-=.1)assert.ok(!m.solids.some(s=>0>s.x-.5&&0<s.x+s.w+.5&&z>s.y-.5&&z<s.y+s.h+.5),'clear aisle '+z);
 assert.ok(m.solids.some(s=>4.65>s.x&&4.65<s.x+s.w&&0>s.y&&0<s.y+s.h),'glass case has collision');
 }finally{delete global.document;}
});
test('Karma registration adds a new public venue, walkable approach and map blip without replacing dealer',()=>{
 const width=64,g=new Uint8Array(width*width),dealer={name:'ELEVATED MELANIN',id:'dealer',b:{x:128,y:128,w:128,h:128}},city={world:true,width,g,venues:[dealer],buildings:[dealer.b],trees:[],heightAt:()=>0};
 for(let x=1;x<63;x++)g[32*width+x]=1;
 const c={city,window:{},level29Southern:{parcel:()=>({x:512,y:768,w:160,h:192,road:{x:592,y:1040}})},genCity:()=>city,buildVenue(){},serviceVenue(){},extraBlips:()=>[],createVenue:(b,id,key)=>({b,id,key,doorX:b.x+b.w/2,doorY:b.y+b.h}),TILE:32,T_LOT:3,T_WALK:2,T_ROAD:1,T_BRIDGE:9,indexTrees(){}};
 vm.createContext(c);vm.runInContext(fs.readFileSync('public/game/karma.js','utf8'),c);c.genCity();assert.equal(city.venues.length,2);assert.equal(city.venues[0],dealer);assert.equal(city.karma.name,'KARMA DISPENSARY');assert.equal(city.karma.open,true);assert.equal(c.extraBlips()[0].label,'K');
 for(let y=city.karma.doorY;y<1040;y+=32)assert.equal(g[(y/32|0)*width+(city.karma.doorX/32|0)],y>=1024?1:2);
});
test('surface roads leave no elevated pier or rail collision and keep link junctions at zero',()=>{
 const source=fs.readFileSync('public/game/foundation-road.js','utf8'),city={highway:{bounds:{left:128,right:5984,top:96,bottom:5984},links:[{path:[{x:128,y:1000},{x:256,y:1000},{x:400,y:1000}]}]},heightAt:()=>0};
 const c={window:{},genCity:()=>city,buildCity(){},blockedCircle(){},updateTraffic(){}};vm.createContext(c);vm.runInContext(source,c);c.genCity();assert.equal(city.surfaceRoads,true);assert.equal(city.interstateBridges.length,0);
 for(let x=128;x<=400;x+=4)assert.equal(city.heightAt(x,1000),0);assert.equal(city.heightAt(1000,1000),0);assert.equal(city.interstateSurface(1000,1000),null);
 assert.ok(!source.includes('new THREE.CylinderGeometry'));assert.ok(!source.includes('interstateRailSegments.push'));assert.ok(!source.includes("addSign(g,'I-10"));
});
