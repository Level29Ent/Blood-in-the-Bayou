const {test}=require('node:test'),assert=require('node:assert/strict');
const BM=require('../public/game/building-management.js');
const {BLUEPRINTS,costFor,yieldRateFor,validatePlacement,accrue,finishedAt}=BM;
const T=32;
function mkCity(g){ // g: function(tx,ty)->tile
  return {get:(tx,ty)=>g(tx,ty),mw:80,mh:80,buildings:[],venues:[],features:[],owned:[],count:0,
    roadNear:()=>false};
}
const grass=mkCity(()=>0);
test('catalog has seven buildable bayou structures with sane costs and yields',()=>{
  const ids=Object.keys(BLUEPRINTS);
  assert.equal(ids.length,7);
  for(const id of ids){const bp=BLUEPRINTS[id];
    assert.ok(bp.w>=2&&bp.h>=2&&bp.w<=4&&bp.h<=4,id+' footprint');
    assert.ok(bp.cost>=4000&&bp.cost<=80000,id+' cost');
    assert.ok(bp.buildSec>=20&&bp.buildSec<=300,id+' build time');
    assert.ok(bp.cashPerHr===0||bp.cashPerHr>=500,id+' yield');
    assert.equal(typeof bp.desc,'string');}
  assert.ok(BLUEPRINTS.distillery.requiresRoad);
  assert.ok(BLUEPRINTS.trapdock.water);
  assert.ok(BLUEPRINTS.watchtower.radar>0);
});
test('construction costs escalate 18% per same-type structure, rounded to $50',()=>{
  assert.equal(costFor(BLUEPRINTS.shack,0),4500);
  assert.equal(costFor(BLUEPRINTS.shack,1),5300);
  assert.equal(costFor(BLUEPRINTS.shack,2),6250);
  const a=costFor(BLUEPRINTS.depot,0),b=costFor(BLUEPRINTS.depot,1);
  assert.ok(b>a&&b-a<0.2*a);
  assert.equal(a%50,0);assert.equal(b%50,0);
});
test('yields scale down 4% per duplicate structure',()=>{
  assert.equal(yieldRateFor(BLUEPRINTS.depot,0),19000);
  assert.equal(yieldRateFor(BLUEPRINTS.depot,1),Math.round(19000*.96));
  assert.equal(yieldRateFor(BLUEPRINTS.depot,25),Math.round(19000*.6)); // capped at 10 dups
});
test('placement is allowed on clear grass inside the map',()=>{
  const s={bp:'shack',x:10*T,y:10*T};
  assert.deepEqual(validatePlacement(grass,s),{ok:true,reason:'CLEAR'});
});
test('placement rejects roads, water, sidewalks and lots',()=>{
  const s={bp:'shack',x:10*T,y:10*T};
  for(const t of [1,2,3,4,6,7,8,9]){
    const c=mkCity(()=>t);
    const v=validatePlacement(c,s);
    assert.equal(v.ok,false,'tile '+t);
    assert.equal(v.reason,'BLOCKED TERRAIN');
  }
});
test('placement rejects the map edge and overlaps with buildings, venues and landmarks',()=>{
  assert.equal(validatePlacement(mkCity(()=>0),{bp:'shack',x:3*T,y:3*T}).ok,true); // just inside margin
  assert.equal(validatePlacement(mkCity(()=>0),{bp:'shack',x:1*T,y:1*T}).ok,false);
  const withBuilding=mkCity(()=>0);withBuilding.buildings=[{x:10*T,y:10*T,w:200,h:200}];
  assert.equal(validatePlacement(withBuilding,{bp:'shack',x:10*T,y:10*T}).ok,false);
  const withVenue=mkCity(()=>0);withVenue.venues=[{b:{x:10*T,y:10*T,w:200,h:200}}];
  assert.equal(validatePlacement(withVenue,{bp:'shack',x:10*T,y:10*T}).ok,false);
  const withFeature=mkCity(()=>0);withFeature.features=[{x:10*T,y:10*T,w:100,h:100}];
  const near=validatePlacement(withFeature,{bp:'shack',x:10*T,y:10*T});
  assert.equal(near.ok,false);
});
test('structures keep clear of each other and respect the per-city cap',()=>{
  const c=mkCity(()=>0);
  c.owned=[{bp:'shack',x:10*T,y:10*T}];
  const v=validatePlacement(c,{bp:'shack',x:10*T+2*T,y:10*T}); // adjacent, within 16px pad
  assert.equal(v.ok,false);
  const far=validatePlacement(c,{bp:'shack',x:20*T,y:20*T});
  assert.equal(far.ok,true);
  c.count=12;assert.equal(validatePlacement(c,{bp:'shack',x:40*T,y:40*T}).ok,false);
  c.count=11;assert.equal(validatePlacement(c,{bp:'shack',x:40*T,y:40*T}).ok,true);
});
test('water structures need open water and land structures reject water tiles',()=>{
  const water=mkCity(()=>4);
  assert.equal(validatePlacement(water,{bp:'trapdock',x:10*T,y:10*T}).ok,true);
  assert.equal(validatePlacement(water,{bp:'shack',x:10*T,y:10*T}).ok,false);
  const mixed=mkCity((tx,ty)=>tx<12?4:0);
  assert.equal(validatePlacement(mixed,{bp:'trapdock',x:10*T,y:10*T}).ok,false); // straddles shore
});
test('structures requiring road frontage are rejected without a road nearby',()=>{
  const c=mkCity(()=>0);c.roadNear=()=>false;
  assert.equal(validatePlacement(c,{bp:'distillery',x:10*T,y:10*T}).ok,false);
  c.roadNear=()=>true;
  assert.equal(validatePlacement(c,{bp:'distillery',x:10*T,y:10*T}).ok,true);
});
test('construction finishes after the blueprint build time',()=>{
  const s={bp:'shack',x:0,y:0,startedAt:1000};
  assert.equal(finishedAt(s),1000+BLUEPRINTS.shack.buildSec*1000);
});
test('completed structures accrue cash per elapsed time at the built rate',()=>{
  const s={bp:'shack',x:0,y:0,startedAt:0,completedAt:0,collectedAt:0,countAtBuild:0};
  const oneHour=accrue([s],0,3600e3);
  assert.equal(oneHour.gained,BLUEPRINTS.shack.cashPerHr);
  assert.equal(oneHour.cash,BLUEPRINTS.shack.cashPerHr);
  // no double-collect
  assert.equal(accrue([s],0,3600e3).gained,0);
  // accrual continues
  assert.equal(accrue([s],0,7200e3).gained,BLUEPRINTS.shack.cashPerHr);
});
test('unfinished structures earn nothing and accrual is capped offline',()=>{
  const building={bp:'shack',x:0,y:0,startedAt:0,completedAt:null,collectedAt:null};
  assert.equal(accrue([building],0,99999e3).gained,0);
  const done={bp:'shack',x:0,y:0,startedAt:0,completedAt:0,collectedAt:0,countAtBuild:0};
  const capped=accrue([done],0,100*3600e3); // 100 hours later
  assert.equal(capped.gained,BLUEPRINTS.shack.cashPerHr*8); // 8h cap
});
test('duplicate structures accrue at their diminished rate',()=>{
  const dup={bp:'depot',x:0,y:0,startedAt:0,completedAt:0,collectedAt:0,countAtBuild:2};
  assert.equal(accrue([dup],0,3600e3).gained,yieldRateFor(BLUEPRINTS.depot,2));
});
