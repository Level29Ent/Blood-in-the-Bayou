const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('fs'),vm=require('node:vm');
// Minimal THREE stand-in (the real package is not installed in this clone;
// pre-existing tests that require it fail the same way in this environment).
class Group{constructor(){this.children=[];this.position={set(){}};this.userData={};}add(m){return m;}remove(){}traverse(){}}
const THREE={Group,Mesh:class{constructor(geo,mat){this.geometry=geo;this.material=mat;this.position={set(){}};this.rotation={y:0};}},
  BoxGeometry:class{},PlaneGeometry:class{},CylinderGeometry:class{},SphereGeometry:class{},
  MeshBasicMaterial:class{constructor(o){Object.assign(this,o);}},
  MeshStandardMaterial:class{constructor(o){Object.assign(this,o);}},
  MeshLambertMaterial:class{constructor(o){Object.assign(this,o);}},
  Vector3:class{constructor(){}}};
// Smoke-test the browser layer of building-management.js inside a VM that
// stands in for the live game page: the script must load without touching
// missing globals, its wrapped hooks must survive a simulated frame, and a
// placement must flow through cost, validation and map painting.
const src=fs.readFileSync('public/game/building-management.js','utf8');
function makeCtx(){
  const calls={};
  const canvas=()=>({getContext:()=>({fillRect(){},strokeRect(){},fillStyle:'',strokeStyle:'',lineWidth:0}),width:240,height:240,toDataURL:()=>'data:'});
  const ctx={
    THREE,window:{},document:{body:{appendChild(){}},createElement:tag=>tag==='div'?{style:{},addEventListener(){},querySelector:()=>null,appendChild(){},id:'',innerHTML:''}:canvas()},
    addEventListener(){},performance:{now:()=>ctx.t},
    localStorage:{getItem:()=>null,setItem(k,v){ctx.saved[k]=v;}},
    city:{world:true,get:()=>0,buildings:[],venues:[],features:[]},
    state:'play',distIdx:0,DISTRICTS:[{id:'nola'}],MW:136,MH:136,TILE:32,
    cash:100000,frame:1,zombies:[],mpRole:null,touch:{},
    player:{x:2000,y:2000,aim:0,car:null},
    toast:t=>{ctx.toasts.push(t);},money:n=>'$'+n,hudText(){},sfx(){},dist:()=>10,
    signTex:()=>'tex',level29World:{material:()=>new THREE.MeshStandardMaterial(),facade:()=>new THREE.MeshStandardMaterial()},
    buildCity(){calls.buildCity=(calls.buildCity||0)+1;},renderGround(){calls.renderGround=(calls.renderGround||0)+1;},
    update(){},drawHUD(){},extraBlips:()=>[{x:1,y:2,label:'S',col:'#fff'}],
    groundCv:canvas(),miniCv:canvas(),
    cityGroup:{children:[{material:{map:{needsUpdate:false}}}],add(m){return m;},remove(){}},
    t:0,toasts:[],saved:{},appendChild(){},
    requestAnimationFrame:()=>{},
  };
  ctx.window=ctx;ctx.window.BITB_BUILDING_DB=undefined;
  return ctx;
}
test('script loads in a game-like environment and wraps the frame hooks',()=>{
  const ctx=makeCtx();
  vm.createContext(ctx);vm.runInContext(src,ctx);
  assert.equal(ctx.window.level29Buildings&&typeof ctx.window.level29Buildings.tryPlace,'function');
  assert.equal(ctx.window.level29Buildings.BLUEPRINTS.shack.cost,4500);
});
test('a simulated frame loop finishes construction and accrues yields',()=>{
  const ctx=makeCtx();
  vm.createContext(ctx);vm.runInContext(src,ctx);
  const B=ctx.window.level29Buildings;
  // place a shack directly through the public API path pieces
  const placed=B.state();placed.cities.world={list:[{uid:'u1',bp:'shack',x:1000,y:1000,startedAt:0,countAtBuild:0,completedAt:null,collectedAt:null}]};
  B.persist();
  ctx.t=1000*60; // 60s later: build finished
  ctx.update();
  const list=B.structs();
  assert.equal(list[0].completedAt!=null,true,'build should complete after buildSec');
  ctx.t=1000*60+3600e3; // then accrue one hour of yield
  const before=ctx.cash;ctx.update();
  assert.ok(ctx.cash-before>=899,'yield should be collected ('+(ctx.cash-before)+')');
  assert.equal(list[0].collectedAt,ctx.t);
});
test('tryPlace charges the escalated cost and records the structure',()=>{
  const ctx=makeCtx();
  vm.createContext(ctx);vm.runInContext(src,ctx);
  const B=ctx.window.level29Buildings;
  ctx.player.aim=0; // ghost lands ahead of the player on clear grass
  const cashBefore=ctx.cash;
  B.tryPlace();
  const list=B.structs();
  assert.equal(list.length,1);
  assert.equal(ctx.cash,cashBefore-4500,'first shack costs the base price');
  ctx.player.x+=200; // step aside so the ghost no longer overlaps the first shack
  B.tryPlace();
  assert.equal(list.length,2);
  assert.equal(ctx.cash,cashBefore-4500-5300,'second shack costs the escalated price');
  // persisted to localStorage
  const saved=JSON.parse(ctx.saved['level29.buildings.v2']);
  assert.equal(saved.v,2);assert.equal(saved.cities.world.list.length,2);
  assert.equal(saved.spentTotal,9800);
});
test('invalid terrain is refused without spending cash',()=>{
  const ctx=makeCtx();
  ctx.city.get=()=>1; // road everywhere
  vm.createContext(ctx);vm.runInContext(src,ctx);
  ctx.window.level29Buildings.tryPlace();
  assert.equal(ctx.window.level29Buildings.structs().length,0);
  assert.equal(ctx.cash,100000);
  assert.ok(ctx.toasts.some(t=>/CANNOT BUILD/.test(t)));
});
