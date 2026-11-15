const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

function navigation(){
 const elements=[],properties={};
 const ctx={clearRect(){},fillRect(){},beginPath(){},arc(){},fill(){},fillText(){}};
 const c={window:null,document:{createElement:()=>({style:{},setAttribute(){},getContext:()=>ctx}),body:{appendChild(n){elements.push(n);}},documentElement:{style:{setProperty(k,v){properties[k]=v;}}}},performance:{now:()=>0},addEventListener(){},render(){},update(){},updateMusic(){},player:{x:48,y:48,dead:false},state:'play',city:{width:4,height:4,get:()=>1},missionTarget:()=>null,level29Nola:{sites:[],waypoint:null},level29UX:{trackers:true,minimal:false},level29NolaActivityCore:{route:()=>null},survivors:[]};
 c.window=c;vm.createContext(c);
 vm.runInContext(fs.readFileSync('public/game/nola-navigation-audio.js','utf8'),c);
 return {c,map:elements[0],properties};
}
test('navigation map honors tracker/minimal/dialog state and reserves space below the complete status stack',()=>{
 const {c,map,properties}=navigation();
 assert.ok(map.style.cssText.includes('var(--hud-status-bottom,200px) + 12px'));
 c.render();assert.equal(map.style.display,'block');assert.equal(c.level29NolaNavigation.ownsMap,true);assert.equal(properties['--hud-navigation-height'],'159px');
 for(const mode of ['trackers','minimal','pause','dead','prologue','pit']){
  c.level29UX={trackers:mode!=='trackers',minimal:mode==='minimal'};
  c.state=mode==='pause'?'pause':'play';c.player.dead=mode==='dead';c.level29Prologue={active:mode==='prologue'};c.level29NolaActivities={match:mode==='pit'?{}:null};
  c.render();assert.equal(map.style.display,'none',mode);assert.equal(c.level29NolaNavigation.ownsMap,false,mode);assert.equal(properties['--hud-navigation-height'],'0px',mode);
 }
});

test('legacy minimap yields only when the live navigation map owns the slot',()=>{
 const s=fs.readFileSync('public/game/game.js','utf8');
 const statement=s.slice(s.indexOf('if(trackers&&!minimal'),s.indexOf('if(trackers&&!minimal')+s.slice(s.indexOf('if(trackers&&!minimal')).indexOf(';')+1);
 let draws=0;const c={trackers:true,minimal:false,small:false,window:{level29NolaNavigation:{ownsMap:true}},drawMinimap(){draws++;}};vm.createContext(c);
 vm.runInContext(statement,c);assert.equal(draws,0);
 c.window.level29NolaNavigation.ownsMap=false;vm.runInContext(statement,c);assert.equal(draws,1);
 delete c.window.level29NolaNavigation;vm.runInContext(statement,c);assert.equal(draws,2);
 c.minimal=true;vm.runInContext(statement,c);assert.equal(draws,2);
});

test('keyboard/mouse gameplay hides the joystick while touch play retains it and menus release held input',()=>{
 const s=fs.readFileSync('public/game/joy.js','utf8');
 for(const coarse of [false,true]){
  let released=0,updates=0;
  const c={coarse,state:'play',player:{dead:false},showMap:false,pollPad(){},padActive:false,joyEl:{style:{}},zone:{classList:{toggle(){}}},releaseStick(){released++;},runHeld:false,document:{getElementById:()=>null},gp:{},joyPtr:null,stick:{},update(){updates++;}};
  vm.createContext(c);vm.runInContext(s.slice(s.indexOf('const _updJoy = update;')),c);
  c.update();assert.equal(c.joyEl.style.display,coarse?'block':'none');
  c.state='pause';c.update();assert.equal(c.joyEl.style.display,'none');assert.equal(released,1);assert.equal(updates,2);
 }
});

test('secondary actions reserve map height and short landscape mission text has a readable floor',()=>{
 const hud=fs.readFileSync('public/game/hud-layout.js','utf8'),mobile=fs.readFileSync('public/game/mobile-layout-fix.js','utf8');
 for(const s of [hud,mobile])assert.ok(s.includes('var(--hud-navigation-height,0px)'));
 const layout=require('../public/game/mobile-viewport').hudLayout(844,390);
 assert.ok(layout.missionFont>=12);assert.ok(layout.lineHeight>=16);
});
