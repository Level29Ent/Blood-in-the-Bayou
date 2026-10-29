const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const THREE=require('../public/game/three.min.js');
const L=require('../public/game/site-layout.js');
test('seven display footprints fit inside a narrow armory without touching each other',()=>{const b={x:100,y:100,w:128,h:128},slots=L.slots(b,7);assert.equal(slots.length,7);for(let i=0;i<slots.length;i++){const a=slots[i],r={x:a.x-a.w/2,y:a.y-a.d/2,w:a.w,h:a.d};assert.ok(r.x>b.x+3&&r.y>b.y+3&&r.x+r.w<b.x+b.w-3);for(let j=i+1;j<slots.length;j++){const o=slots[j];assert.equal(L.intersects(r,{x:o.x-o.w/2,y:o.y-o.d/2,w:o.w,h:o.d}),false);}}});
test('oversized models are fitted above their own pedestal and lights aim at that display',()=>{
 const ids=['m240','shotgun','rpg','molotov','bat','smg','carbine'],models=Object.fromEntries(ids.map((id,i)=>[id,new THREE.Mesh(new THREE.BoxGeometry(20+i*10,10+i*5,8+i),new THREE.MeshStandardMaterial())]));
 const ctx={THREE,window:{level29ArsenalVisuals:{createDisplayModels:()=>models}},level29SiteLayout:L,WEAPONS:Object.fromEntries(ids.map(id=>[id,{name:id}])),render(){},addSign(){},addPart(g,w,h,d,x,y,z,mat){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);g.add(m);return m;}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync('public/game/armory-showroom.js','utf8'),ctx);const v={b:{x:100,y:100,w:128,h:128},furniture:[]},g=new THREE.Group();ctx.window.level29ArmoryShowroom.build(v,g);g.updateMatrixWorld(true);
 for(const d of v.weaponDisplays){const box=new THREE.Box3().setFromObject(d.model),s=d.cell;assert.ok(box.min.y>=s.top+1.99);assert.ok(box.max.y<46);assert.ok(box.min.x>=s.x-s.w/2&&box.max.x<=s.x+s.w/2);assert.ok(box.min.z>=s.y-s.d/2&&box.max.z<=s.y+s.d/2);assert.equal(d.light.target.position.x,s.x);assert.equal(d.light.target.position.z,s.y);assert.equal(d.light.castShadow,false);}
});
test('a curved through-road detours around the full-width farm boundary',()=>{const f={x:160,y:160,w:96,h:96},points=[{x:32,y:208},{x:180,y:208},{x:400,y:208}];const out=L.detour(points,f,16,32,32,[],()=>false,32);assert.ok(out&&out!==points);for(const p of out)assert.equal(L.contains(f,p.x,p.y,32),false);});
test('non-intersecting roads are preserved and impossible routes report failure',()=>{const f={x:160,y:160,w:96,h:96},p=[{x:32,y:32},{x:400,y:32}];assert.equal(L.detour(p,f,16,32,32,[],()=>false,32),p);assert.equal(L.detour([{x:32,y:208},{x:400,y:208}],f,16,32,32,[],()=>true,32),null);});
test('foundation height follows the entrance surface instead of sea level or a buried center',()=>{const b={x:100,y:100,w:100,h:80},c={heightAt:(x,y)=>y===200?35:90};assert.equal(L.foundation(c,b),35);});
test('farm perimeter keeps the agricultural interior free of roads and joins a lane outside',()=>{
 const f={x:160,y:160,w:96,h:96},c={world:true,width:32,height:32,g:Array(1024).fill(0),buildings:[],trees:[],parked:[],farm:f,curves:[{id:'crossing',pts:[{x:32,y:208},{x:180,y:208},{x:400,y:208}],box:[0,0,500,500]}]};
 const ctx={genCity:()=>c,level29SiteLayout:L,TILE:16,MW:32,MH:32,T_GRASS:0,T_ROAD:1,T_WATER:2,indexTrees(){}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('public/game/farm-roads.js','utf8'),ctx);ctx.genCity();assert.equal(c.farmRoads.length,1);assert.ok(c.farmPerimeter.length>0);
 for(let y=10;y<16;y++)for(let x=10;x<16;x++)assert.equal(c.g[y*32+x],0);
 for(const p of c.farmPerimeter)assert.equal(c.g[Math.floor(p.y/16)*32+Math.floor(p.x/16)],1);
});
test('raised venue roots and colliders share one stable foundation before batching',()=>{
 const box={x:100,y:100,w:100,h:3},b={x:100,y:100,w:100,h:80},v={b,colliderWalls:[box],furniture:[],colliderDoor:{x:145,y:178,w:20,h:2}},c={world:true,buildings:[b],venues:[v],trees:[],heightAt:()=>35};
 const ctx={window:{level29Downtown:{lots:{}},level29OpenWorld:{interior:null}},level29SiteLayout:L,level29Terrain:require('../public/game/terrain-sites.js'),genCity:()=>c,TILE:32,indexTrees(){},buildVenue(v){v.mesh={position:{y:35}};v.furniture.push({x:110,y:110,w:20,h:20});}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync('public/game/terrain-layout.js','utf8'),ctx);ctx.genCity();ctx.buildVenue(v);assert.equal(v.mesh.position.y,35);assert.equal(v.colliderWalls[0].minY,35);assert.equal(v.colliderDoor.maxY,87);assert.equal(v.furniture[0].minY,35);ctx.buildVenue(v);assert.equal(v.mesh.position.y,35);
});
