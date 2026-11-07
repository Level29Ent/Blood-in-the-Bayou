const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {distribute,choose,sector,connectedMask,travelAllowance}=require('../public/game/campaign-map.js');
test('round-robin destinations visit sparse outer sectors before repeating dense downtown',()=>{
 const points=Array.from({length:80},(_,i)=>({x:30+i,y:30}));for(let i=1;i<9;i++)points.push({x:(i%3)*1000+100,y:Math.floor(i/3)*1000+100});
 const ordered=distribute(points,3000,3000);assert.equal(new Set(ordered.slice(0,9).map(p=>sector(p,3000,3000))).size,9);assert.equal(ordered.length,points.length);
 const visits=new Set();for(let id=1;id<210;id++)visits.add(sector(ordered[(id-1)%ordered.length],3000,3000));assert.equal(visits.size,9);
});
test('selection honors exclusion, minimum distance, bounded local requests and stable IDs',()=>{
 const ps=[{x:0,y:0},{x:400,y:0},{x:9000,y:0}];assert.equal(choose(ps,{index:0,from:ps[0],min:300,max:1000}),ps[1]);assert.equal(choose(ps,{index:0,used:[ps[0],ps[1]]}),ps[2]);assert.equal(choose(ps,{index:0,from:ps[0],min:1,max:10}),null);assert.equal(choose(ps,{index:-1}),ps[2]);assert.ok(travelAllowance(ps[0],ps[2])>100);assert.equal(travelAllowance(ps[0],{x:1e9,y:0}),240);
});
test('street graph rejects isolated islands and never wraps across row edges',()=>{
 const mask=Uint8Array.from([0,0,1,1,0,0,0,1,1,0,1,1]);const connected=connectedMask({mask},3);assert.equal(connected[2],0);assert.equal(connected[3],0);for(const k of [7,8,10,11])assert.equal(connected[k],1);
});
function fixture(){
 const venues=[];for(let i=0;i<9;i++)venues.push({name:'SECTOR '+i,doorX:(i%3)*1000+150,doorY:Math.floor(i/3)*1000+150});
 const c={window:{},MW:100,MH:100,TILE:32,T_ROAD:1,T_BRIDGE:9,MISSIONS_PER:30,mpRole:null,missionIdx:0,player:{x:100,y:100},ronnie:{},objective:'',mission:null,dist:Math.hypot,
 city:{world:true,width:100,height:100,venues,heightAt:()=>0,nolaLandmarks:{sites:{university:{x:2400,y:2300,w:100,h:100},park:{x:200,y:2100,w:100,h:100}}},survivalLandmarks:{sites:{cathedral:{x:1200,y:2400,w:100,h:100}}},riverboatHub:{entry:{x:2500,y:1600}}},
 level29Navigation:{graph:{nearest:(x,y)=>({x,y}),point:p=>p,walkable:()=>true}},blockedCircle:()=>false,level29TrafficClearance:{clear:()=>true},tileAt:()=>1,
 missionInfo:i=>({i,isBoss:i%5===4}),briefing:()=>'',roadPointFar:()=>({x:60,y:60}),passMission(){},
 placeMissionStart(){c.mission={phase:'start',start:{x:100,y:100}};},beginMission(){c.mission.phase='active';c.mission.timer=600;c.mission.targets=[c.roadPointFar(100,100,100,1000)];}};
 c.dist=(x,y,a,b)=>Math.hypot(x-a,y-b);vm.createContext(c);vm.runInContext(fs.readFileSync('public/game/campaign-map.js','utf8'),c);return c;
}
test('210 campaign dispatch IDs use all nine sectors without moving the tutorial or changing story stops',()=>{
 const c=fixture(),sectors=new Set();c.placeMissionStart();assert.equal(c.mission.start.x,100);
 for(let id=1;id<210;id++){c.missionIdx=id;c.placeMissionStart();assert.ok(Number.isFinite(c.mission.start.x));assert.ok(c.mission.dispatchVenue);sectors.add(sector(c.mission.start,3200,3200));}
 assert.equal(sectors.size,9);assert.equal(c.missionInfo(20).op.storyStops.join(','),'jojo,grocery');assert.equal(c.missionInfo(4).isBoss,true);
 const names=c.window.level29CampaignMap.points().map(p=>p.name);for(const n of ['NOLA UNIVERSITY','NOLA PARK','CATHEDRAL DISTRICT','RIVERBOAT HARBOR'])assert.ok(names.includes(n),n);
});
test('begin grants a distance-based travel budget once and restores the global point generator',()=>{
 const c=fixture();c.placeMissionStart();const before=c.roadPointFar;c.beginMission();assert.equal(c.roadPointFar,before);assert.ok(c.mission.timer>600);assert.ok(c.mission.routeAllowance>0);assert.ok(c.mission.targets[0].name);
});
test('shared router bypasses the redundant legacy full-map dispatch sweep',()=>{
 const source=fs.readFileSync('public/game/city-life.js','utf8'),code=source.slice(source.indexOf('const start=placeMissionStart;'),source.indexOf('const blips=extraBlips;'));
 let calls=0;const c={window:{level29CampaignMap:{}},placeMissionStart:()=>calls++,city:{world:true},mission:{},missionIdx:1,mpRole:null};vm.createContext(c);vm.runInContext(code,c);c.placeMissionStart();assert.equal(calls,1);
});
