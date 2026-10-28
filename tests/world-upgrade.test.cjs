const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {CATALOG,purchase}=require('../public/game/trading.js');
test('in-game ownership debits once and rejects insufficient or invalid purchases',()=>{
 const data={owned:{},finish:'stock'};
 assert.deepEqual(purchase(data,'boat',4499),{ok:false,balance:4499});assert.equal(data.owned.boat,undefined);
 assert.deepEqual(purchase(data,'boat',4500),{ok:true,balance:0});assert.equal(data.owned.boat,true);
 assert.equal(purchase(data,'boat',4500).ok,false);assert.equal(purchase(data,'missing',4500).ok,false);assert.equal(purchase(data,'__proto__',4500).ok,false);
 assert.equal(purchase(data,'grip',NaN).ok,false);
});
test('cosmetic ownership equips a finish and medical care remains repeatable',()=>{
 const data={owned:{},finish:'stock'};
 assert.equal(purchase(data,'teal',650).ok,true);assert.equal(data.finish,'teal');
 assert.equal(purchase(data,'medkit',180).ok,true);assert.equal(purchase(data,'medkit',180).ok,true);
 assert.ok(Object.values(CATALOG).every(i=>i.price>0&&['fish','smoke','clinic'].includes(i.kind)));
});
function course(){
 const source=fs.readFileSync('public/game/downtown.js','utf8');
 const ctx=vm.createContext({course:{pts:[{type:'start'}, {type:'hold',hold:90,x:0,y:0}, {type:'balance',hold:120,x:30,y:0}, {type:'rope',taps:3,x:60,y:0}, {type:'finish',x:90,y:0}],rings:[]},player:{x:0,y:0},state:'play',frame:0,COL:{},d2:(x,y,a,b)=>Math.hypot(x-a,y-b),toast:()=>{},sfx:()=>{}});
 vm.runInContext(source.slice(source.indexOf('let run=null;'),source.indexOf('function finishCourse()')),ctx);vm.runInContext('startCourse()',ctx);
 return s=>vm.runInContext(s,ctx);
}
test('course drills require uninterrupted proximity and balance alignment',()=>{
 const run=course();run('for(let i=0;i<80;i++)updateCourse();player.x=100;updateCourse();player.x=0;for(let i=0;i<89;i++)updateCourse()');assert.equal(run('run.i'),1);
 run('updateCourse()');assert.equal(run('run.i'),2);
 run('player.x=40;for(let i=0;i<140;i++)updateCourse()');assert.equal(run('run.i'),2);
 run('player.x=30;for(let i=0;i<120;i++)updateCourse()');assert.equal(run('run.i'),3);
});
test('climbing cannot be completed remotely or by repeated same-frame events',()=>{
 const run=course();run('run.i=3;player.x=0;climbTap()');assert.equal(run('run.taps'),0);
 run('player.x=60;climbTap();climbTap();climbTap()');assert.equal(run('run.taps'),1);
 run('frame+=10;climbTap();frame+=10;climbTap()');assert.equal(run('run.i'),4);
});
function weapons(){
 const source=fs.readFileSync('public/game/gta.js','utf8');
 const ctx=vm.createContext({window:{level29Trading:{spread:.65,damage:1.2}},player:{x:0,y:0},bullets:[],up:{ap:0},frame:1,rnd:(a,b)=>(a+b)/2,snd:()=>{},sfx:()=>{},toast:()=>{},fireWeapon:()=>{},view:{},lastShotFrame:0,heat:0});
 vm.runInContext(source.slice(source.indexOf('const WEAPONS ='),source.indexOf('let rockets =')),ctx);
 return s=>vm.runInContext(s,ctx);
}
test('new firearms consume ammo, respect empty magazines and use purchased upgrades',()=>{
 const run=weapons();run("giveW('smg');selectW('smg');fireWeapon(0,0,0)");assert.equal(run('arsenal.smg'),119);assert.equal(run('bullets.length'),1);assert.equal(run('bullets[0].dmg'),2.04);
 run("arsenal.smg=0;fireWeapon(0,0,0)");assert.equal(run('bullets.length'),1);
 run("giveW('carbine');selectW('carbine');fireWeapon(0,0,0)");assert.equal(run('arsenal.carbine'),59);assert.equal(run('bullets.at(-1).pierce'),1);
});
