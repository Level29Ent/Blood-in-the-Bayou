const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {streetRoute,overlaps}=require('../public/game/access.js');
test('street access routes around footprints and never across water',()=>{
 const c={g:Array(100).fill(0),buildings:[{x:40,y:20,w:20,h:40}]};
 for(let y=0;y<10;y++)c.g[y*10+8]=1;
 for(let y=3;y<8;y++)c.g[y*10+6]=2;
 const path=streetRoute(c,{doorX:35,doorY:35},10,10,10,1,2,3);
 assert.ok(path.length);assert.equal(c.g[path.at(-1)],1);
 for(const k of path){assert.notEqual(c.g[k],2);assert.equal(overlaps(k%10*10+5,Math.floor(k/10)*10+5,0,c.buildings[0]),false);}
});
test('isolated entrances report unavailable instead of carving through buildings',()=>{
 const c={g:Array(25).fill(2),buildings:[]};c.g[12]=0;
 assert.deepEqual(streetRoute(c,{doorX:25,doorY:20},10,5,5,1,2,3),[]);
});
test('zombie protection accounts for radius outside threshold',()=>{
 const b={x:10,y:10,w:30,h:30};assert.ok(overlaps(25,45,12,b));assert.ok(!overlaps(25,55,12,b));
});
function fishing({boat=false,rod=false,caught=0}={}){
 const source=fs.readFileSync('public/game/gulf.js','utf8');
 const bar={style:{},textContent:'',innerHTML:'',querySelector:()=>({style:{}})};
 const ctx=vm.createContext({city:{world:true},state:'play',player:{x:100,y:100,dead:false,car:boat?{x:100,y:100,boat:true,v:0}:null},T_WATER:2,tileAt:()=>2,cash:0,frame:0,save:{owned:{rod},fishCaught:caught},sfx:()=>{},toast:()=>{},persist:()=>{},dist:Math.hypot.bind(Math),document:{createElement:()=>bar,body:{appendChild:()=>{}}},fishingBar:null,fish:null,Math:Object.assign(Object.create(Math),{random:()=>.5})});
 vm.runInContext(source.slice(source.indexOf('const fishTable='),source.indexOf('function cacheTick()')),ctx);
 vm.runInContext('drawFishingVisual=()=>{};dist=(x,y,a,b)=>Math.hypot(x-a,y-b)',ctx);
 return {run:s=>vm.runInContext(s,ctx),ctx};
}
test('hooking alone does not award cash; controlled reeling lands the catch',()=>{
 const {run}=fishing();run('startFishing();fish.phase="bite";fish.needle=.5;reel()');
 assert.equal(run('fish.phase'),'fight');assert.equal(run('cash'),0);
 for(let i=0;i<7;i++){run('for(let j=0;j<50;j++)fishTick();reel()');}
 assert.equal(run('fish'),null);assert.equal(run('save.fishCaught'),1);assert.ok(run('cash')>0);
});
test('rapid reeling snaps the line, while cooldown blocks event spam',()=>{
 const {run}=fishing();run('startFishing();fish.phase="bite";fish.needle=.5;reel();reel()');assert.equal(run('fish.progress'),0);
 run('fish.reelCooldown=0;fish.tension=.9;reel()');assert.equal(run('fish'),null);assert.equal(run('cash'),0);
});
test('moving away cancels a cast even along a fishable shoreline',()=>{
 const {run}=fishing();run('startFishing();player.x+=60;fishTick()');assert.equal(run('fish'),null);assert.equal(run('cash'),0);
});
test('every fifth catch completes an angler contract and boat catches pay more',()=>{
 const shore=fishing(),boat=fishing({boat:true,caught:4});
 shore.run('startFishing();catchFish()');boat.run('startFishing();catchFish()');
 assert.equal(boat.run('save.fishCaught'),5);assert.ok(boat.run('cash')>=350+shore.run('cash'));
});
function shelter(){
 const b={x:20,y:20,w:60,h:60,kind:'normal',H:70};
 const c={world:true,buildings:[b],venues:[],g:Array(400).fill(0),trees:[],parked:[],rocks:[]};for(let y=0;y<20;y++)c.g[y*20+15]=1;
 const stored={};const ctx=vm.createContext({window:{},localStorage:{getItem:k=>stored[k],setItem:(k,v)=>stored[k]=v},VENUE_TYPES:[],genCity:()=>c,createVenue:(b,id,key)=>({b,id,key,doorX:b.x+b.w/2,doorY:b.y+b.h,doorW:30,stationX:50,stationY:45,furniture:[]}),TILE:10,MW:20,MH:20,T_ROAD:1,T_WATER:2,T_BRIDGE:3,T_LOT:4,T_WALK:5,indexTrees:()=>{},buildVenue:()=>{},serviceVenue:()=>{},nearStation:()=>null,blockedCircle:()=>false,spawnZombieAt:()=>({}),update:()=>{},city:c,moverCtx:null,player:{x:50,y:45,hp:50,maxHp:100},state:'play',zombies:[],cash:0,insideVenue:(v,p)=>overlaps(p.x,p.y,0,v.b),dist:(x,y,a,b)=>Math.hypot(x-a,y-b),toast:()=>{},sfx:()=>{}});
 vm.runInContext(fs.readFileSync('public/game/access.js','utf8'),ctx);vm.runInContext('genCity()',ctx);return s=>vm.runInContext(s,ctx);
}
test('new shelters connect to streets and protect open doors and spawn positions',()=>{
 const run=shelter();assert.equal(run('city.venues[0].streetAccessible'),true);
 assert.equal(run('spawnZombieAt(50,45)'),null);
 assert.equal(run('moverCtx={alive:true};blockedCircle(50,85,12)'),true);
 assert.equal(run('moverCtx=player;blockedCircle(50,85,12)'),false);
});
test('supply searches require three uninterrupted seconds and cannot be farmed',()=>{
 const run=shelter();run('for(let i=0;i<100;i++)update();player.x=100;update();player.x=50;for(let i=0;i<179;i++)update()');assert.equal(run('cash'),0);
 run('update()');assert.equal(run('cash'),120);assert.equal(run('player.hp'),65);
 run('for(let i=0;i<360;i++)update()');assert.equal(run('cash'),120);
});
test('migrated interior zombies are removed without a kill payout',()=>{
 const run=shelter();run('player.x=150;zombies.push({x:50,y:45,alive:true,hp:20});update()');
 assert.equal(run('zombies[0].alive'),false);assert.equal(run('cash'),0);
});
test('fishing requires a stopped boat and the rod reduces reel attempts',()=>{
 const moving=fishing({boat:true});moving.run('player.car.v=2;startFishing()');assert.equal(moving.run('fish'),null);
 const {run}=fishing({rod:true});run('startFishing();fish.phase="bite";fish.needle=.5;reel()');
 for(let i=0;i<6;i++)run('for(let j=0;j<50;j++)fishTick();reel()');assert.equal(run('save.fishCaught'),1);
});
