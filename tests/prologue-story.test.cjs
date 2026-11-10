const {test}=require('node:test'),assert=require('node:assert/strict'),T=require('three');
const S=require('../public/game/prologue-story.js'),C=require('../public/game/prologue-crowd.js');
test('prologue follows every requested errand, film and outbreak before original campaign',()=>{
 let s=S.fresh();const ids=[],items=[];
 while(S.active(s)){const stage=S.STAGES[s.stage];ids.push(stage.id);items.push(S.inventory(s));assert.equal(S.step(s,'unrelated'),s);assert.equal(S.peaceful(s),s.stage<17);s=S.step(s,stage.video?'videoDone':'interact');assert.deepEqual(S.restore(s),s);}
 assert.deepEqual(ids,['sam','festival','phone','phoneReturn','samBook','book','bookReturn','university','escort','gear','kit','honey','suppliesReturn','garage','garageVideo','mall','mallVideo','ronnie','ronnieVideo']);
 assert.deepEqual(items[3],['phone']);assert.deepEqual(items[4],[]);assert.deepEqual(items[6],['book']);assert.deepEqual(items[12],['coat','goggles','kit','honey']);assert.deepEqual(items[13],[]);assert.equal(S.active(s),false);assert.equal(S.step(s,'interact'),s);
 assert.deepEqual(S.STAGES.filter(s=>s.video).map(s=>s.video),['dyg3Wbx4iSc','vAZoEoBmff0','jy8lyAr8620']);
});
test('legacy campaigns are not forced into the prologue and malformed progress cannot unlock it',()=>{
 for(const v of [null,{}, {v:2,stage:0},{v:1,stage:-1},{v:1,stage:20},{v:1,stage:1.5},{v:1,stage:'18'}])assert.equal(S.restore(v),null);
 assert.equal(S.active(S.restore(null)),false);assert.equal(S.restore({v:1,stage:19}).stage,19);
});
test('interaction cannot remotely collect items or finish escort; Ronnie triggers at about six feet',()=>{
 const player={x:0,y:0},target={x:0,y:0};assert.equal(S.canInteract({v:1,stage:8},player,target,{x:200,y:0}),false);assert.equal(S.canInteract({v:1,stage:8},player,target,{x:30,y:0}),true);
 assert.equal(S.canInteract({v:1,stage:2},{x:200,y:0},target),false);assert.equal(S.canInteract({v:1,stage:2},{...player,car:{}},target),false);assert.equal(S.canInteract({v:1,stage:2},{...player,dead:true},target),false);
 assert.equal(S.canInteract({v:1,stage:17},{x:18,y:0},target),true);assert.equal(S.canInteract({v:1,stage:17},{x:19,y:0},target),false);
});
test('YouTube embed allowlist and completion verify both origin and exact frame source',()=>{
 assert.ok(S.embedURL('dyg3Wbx4iSc','https://game.test').includes('playsinline=1'));assert.equal(S.embedURL('javascript:alert(1)','https://game.test'),null);
 const frame={},event={source:frame,origin:'https://www.youtube-nocookie.com',data:JSON.stringify({event:'onStateChange',info:0})};assert.equal(S.videoEnded(event,frame),true);assert.equal(S.videoEnded({...event,source:{}},frame),false);assert.equal(S.videoEnded({...event,origin:'https://attacker.test'},frame),false);assert.equal(S.videoEnded({...event,data:'invalid'},frame),false);assert.equal(S.videoEnded({...event,data:{event:'onStateChange',info:1}},frame),false);
});
function navFixture(){const width=30,height=30,mask=new Uint8Array(width*height);for(let y=1;y<29;y++)for(let x=1;x<29;x++)mask[y*width+x]=1;return {width,mask,point:k=>({x:(k%width+.5)*32,y:(Math.floor(k/width)+.5)*32}),nearest(x,y){return Math.floor(y/32)*width+Math.floor(x/32);}};}
test('moving parade uses finite cardinal segments and never crosses off-network tiles',()=>{
 const nav=navFixture(),route=S.paradeRoute(nav,{x:160,y:160},nav.width);assert.ok(route.length>20);for(const [i,p]of route.entries()){const q=route[(i+1)%route.length];assert.ok(p.x===q.x||p.y===q.y);assert.ok(nav.mask[nav.nearest(p.x,p.y)]);}
 for(let d=-1000;d<4000;d+=7){const p=S.routePoint(route,d);assert.ok([p.x,p.y,p.a].every(Number.isFinite));}
 assert.equal(S.routePoint([],10),null);
});
test('civilian routines walk actual street cells and flee nearby zombies without mutating AI enemies',()=>{
 const nav=navFixture(),actors=C.population(nav,nav.width,120);assert.equal(actors.length,120);const a=actors[0],before={x:a.x,y:a.y},z={x:a.x-30,y:a.y,alive:true};
 for(let i=0;i<120;i++)C.advance(a,nav,nav.width,1/60,true,[z]);assert.ok(Math.hypot(a.x-before.x,a.y-before.y)>5);assert.ok(nav.mask[nav.nearest(a.x,a.y)]);assert.equal(z.x,before.x-30);
});
test('festivals and normal residents share a bounded nine-batch renderer with no per-resident figures',()=>{
 const root=C.create(T,72),actors=Array.from({length:120},(_,id)=>({id,x:id*10,y:0,a:0,anim:1,festival:id%2===0}));C.pose(T,root,actors,()=>0);assert.equal(root.children.length,9);assert.equal(root.children[0].count,72);assert.ok(root.children.every(m=>m.count<=144));assert.ok(root.children[7].count>0);assert.ok(root.children[8].count>0);assert.ok(root.children[1].geometry.type==='SphereGeometry');C.pose(T,root,[],()=>0);assert.ok(root.children.every(m=>m.count===0));
 const f=C.floatModel(T);assert.ok(f.children.length<20);assert.ok(new T.Box3().setFromObject(f).max.y>20);
});
test('escort paths use an actual doorway rather than crossing a solid interior wall',()=>{
 const blocked=(x,y)=>y>=48&&y<=56&&!(x>=44&&x<=60),path=S.localPath({x:16,y:16},{x:80,y:88},blocked,{x:0,y:0,w:96,h:96});assert.ok(path);assert.ok(path.every(p=>!blocked(p.x,p.y)));assert.ok(path.some(p=>p.y===48&&p.x>=44&&p.x<=60));assert.equal(S.localPath({x:8,y:8},{x:80,y:88},()=>true,{x:0,y:0,w:96,h:96}),null);
});
test('story dusk controls the actual world clock and original lighting resumes after the handoff',()=>{
 const fs=require('node:fs'),vm=require('node:vm');let now=0;const c={module:{exports:{}},window:{level29Prologue:{timeHour:12}},performance:{now:()=>now},state:'play',update(){},placeCamera(){},scene:null};vm.createContext(c);vm.runInContext(fs.readFileSync('public/game/world-atmosphere.js','utf8'),c);assert.equal(c.isDusk(),false);c.window.level29Prologue.timeHour=18;assert.equal(c.isDusk(),true);assert.equal(c.isNight(),false);assert.equal(c.window.level29TimeOfDay.hour,18);c.window.level29TimeOfDay.setHour(18);c.window.level29Prologue.timeHour=null;assert.equal(c.window.level29TimeOfDay.hour,18);
});
test('campaign snapshot embeds the prologue and continue passes it explicitly without altering legacy save-code keys',()=>{
 const fs=require('node:fs'),source=fs.readFileSync('public/game/savegame.js','utf8');assert.match(source,/prologue:window\.level29Prologue\?\.snapshot\|\|null/);assert.match(source,/startGame\(s\.missionIdx,\{resume:true,prologue:s\.prologue\}\)/);assert.ok(source.includes("'level29.campaign.v2'"));assert.ok(source.includes("!window.level29Prologue?.active"));
});
