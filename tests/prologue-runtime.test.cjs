const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),T=require('three');
const S=require('../public/game/prologue-story.js'),C=require('../public/game/prologue-crowd.js');
function node(tag='div'){return {tagName:tag.toUpperCase(),style:{},children:[],hidden:false,textContent:'',setAttribute(){},addEventListener(){},appendChild(n){this.children.push(n);n.parentNode=this;return n;},replaceChildren(){this.children=[];},remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(n=>n!==this);},querySelectorAll(selector){return this.children.flatMap(n=>[...(selector==='iframe'&&n.tagName==='IFRAME'?[n]:[]),...n.querySelectorAll(selector)]);},querySelector(selector){return this.querySelectorAll(selector)[0]||null;},getContext(){return {fillRect(){},fillText(){}};},contentWindow:{postMessage(){}}};}
function harness({boat=false}={}){
 const elements={},events={},saved=[];let now=0,boarded=false,spawnCalls=0,handoffs=0;
 const venue=(id,x,y,other={})=>({id,b:{x,y,w:128,h:128},doorX:x+64,doorY:y+128,stationX:x+64,stationY:y+70,...other});
 const casino=venue('casino',128,128),garage=venue('garage',640,320),university=venue('classroom',320,128,{lotId:'university'}),jojo=venue('cafe',640,640,{storyRole:'jojo'}),mall=venue('mall',128,640);
 const city={world:true,width:40,height:40,venues:[casino,garage,university,jojo,mall],casinoVenue:casino,mall,greenmart:{checkout:{x:900,y:700}},civicLocations:{library:{x:320,y:640,w:280,h:220}},treme:{homes:[{x:200,y:400,w:64,h:80}]},neighborhood:{homes:[{x:300,y:800,w:80,h:120,apartment:true}],blocks:[{x:100,y:800,w:128,h:160},{x:500,y:800,w:128,h:160}]},heightAt:()=>0};if(boat)city.riverboatHub={entry:{x:180,y:200}};
 const nav={mask:new Uint8Array(1600).fill(1),point:k=>({x:(k%40+.5)*32,y:(Math.floor(k/40)+.5)*32}),nearest:(x,y)=>Math.floor(y/32)*40+Math.floor(x/32),walkable:()=>true,goal:(a,x,y)=>({x,y})};
 const scene=new T.Scene(),group=new T.Group();scene.add(group);
 const c={THREE:T,URL,window:null,innerWidth:390,innerHeight:760,location:{origin:'https://fixture.test'},performance:{now:()=>now},document:{head:node(),body:node(),createElement(tag){const n=node(tag);Object.defineProperty(n,'id',{set(v){elements[v]=n;},get(){return Object.keys(elements).find(k=>elements[k]===n);}});return n;},querySelectorAll:()=>[],exitPointerLock(){}},addEventListener:(type,fn)=>{(events[type]||=[]).push(fn);},mouse:{down:true},keys:{w:true},touch:{shoot:true},stick:{x:1,y:1},gp:{fire:true},soundMode:0,setSoundMode(v){c.soundMode=v;},rbStopVoice(){},state:'menu',mpRole:null,city,builtCity:city,scene,cityGroup:group,camera:new T.PerspectiveCamera(74,390/760,1,1500),player:{x:0,y:0,maxHp:100,hp:100},view:{},zombies:[],parts:[],heat:3,ronnie:{active:true},rbMesh:null,mission:null,banner:null,missionIdx:0,objective:'',cash:321,up:{rapid:2},console,actx:null,musicBus:null,addSign(){},tileAt:()=>2,blockedCircle:()=>false,snapCamera(){},toast(){},CAMO:['#4b5320'],MAT:{eye:new T.MeshBasicMaterial()},lam:color=>new T.MeshLambertMaterial({color}),level29PrologueStory:S,level29PrologueCrowd:C,level29Navigation:{graph:nav},level29People:{nameplateScale:()=>1},level29TimeOfDay:{setHour(v){c.finalHour=v;}},level29Save:{save(){saved.push(c.level29Prologue?.snapshot);return true;}},level29Riverboat:{get active(){return boarded;},enter(){boarded=true;return true;},leave(){boarded=false;}},level29RonnieReference:{load:()=>Promise.resolve(new T.Group()),install(T,actor,template){actor.userData.referenceModel=template;return true;}},startGame(){c.state='play';c.player={x:0,y:0,maxHp:100,hp:100};c.spawnZombieAt(0,0);c.placeMissionStart();},placeMissionStart(){c.mission={info:{i:0,title:'Original campaign'},phase:'start'};},extraBlips:()=>[],missionTarget(){return c.mission?.start||null;},updateMission(){c.originalMissionTicks=(c.originalMissionTicks||0)+1;},beginMission(){},serviceVenue(){},killPlayer(){c.originalDeath=true;},fireWeapon(){c.fired=true;},spawnZombieAt(x,y){spawnCalls++;const z={x,y,alive:true};c.zombies.push(z);return z;},ambientSpawn(){c.spawnZombieAt(1,1);},syncViewModel(){},vmScene:new T.Scene(),syncRonnie(){c.originalRonnie=true;},zombieGoal:(z,x,y)=>({x,y}),update(){c.updateMission();c.ambientSpawn();},buildCity(){},travelTo(){handoffs++;c.zombies=[{alive:true}];c.placeMissionStart();}};
 c.window=c;vm.createContext(c);const fp=fs.readFileSync('public/game/fp.js','utf8');vm.runInContext(fp.slice(fp.indexOf('let FIG = null;'),fp.indexOf('function makeBoss(')),c);vm.runInContext(fp.slice(fp.indexOf('function poseFigure('),fp.indexOf('// ---------- Cars ----------')),c);c.makeRonnie=()=>c.makeFigure(false);
 vm.runInContext(fs.readFileSync('public/game/prologue-director.js','utf8'),c);
 function update(count=1){for(let i=0;i<count;i++){now+=50;c.update();}}
 function moveToTarget(){const p=c.missionTarget();c.player.x=p.x;c.player.y=p.y;}
 function click(text){const b=elements.prologueModal.children[0].children.find(n=>n.tagName==='BUTTON'&&n.textContent===text);assert.ok(b,'missing '+text);b.onclick();}
 return {c,elements,events,saved,update,moveToTarget,click,get spawnCalls(){return spawnCalls;},get handoffs(){return handoffs;},get boarded(){return boarded;}};
}
test('new solo games gate original missions and zombies; existing saves and multiplayer bypass safely',()=>{
 const h=harness();h.c.startGame(0);h.update();assert.equal(h.c.level29Prologue.active,true);assert.equal(h.c.zombies.length,0);assert.equal(h.spawnCalls,0);h.c.fireWeapon();assert.equal(h.c.fired,undefined);h.c.syncRonnie();assert.equal(h.c.originalRonnie,undefined);assert.equal(h.c.mission.info.type,'prologue');assert.ok(h.c.level29Prologue.population.length>100);
 h.c.startGame(0,{resume:true});assert.equal(h.c.level29Prologue.active,false);h.c.mpRole='host';h.c.startGame(0);assert.equal(h.c.level29Prologue.active,false);h.c.mpRole=null;h.c.startGame(10);assert.equal(h.c.level29Prologue.active,false);
});
test('casino boarding is a real prerequisite and story cannot advance at the landing',()=>{
 const h=harness({boat:true});h.c.startGame(0);h.update();h.moveToTarget();h.c.level29Prologue.interact();assert.equal(h.boarded,true);assert.equal(h.c.level29Prologue.snapshot.stage,0);h.moveToTarget();h.c.level29Prologue.interact();assert.equal(h.c.state,'shop');h.click('CONTINUE');assert.equal(h.c.level29Prologue.snapshot.stage,1);assert.equal(h.boarded,false);
});
test('video scenes load only on Play, reject forged end events, pause input/audio and restore on completion',()=>{
 const h=harness();h.c.startGame(0,{resume:true,prologue:{v:1,stage:14}});h.update();h.moveToTarget();h.c.level29Prologue.interact();assert.equal(h.c.state,'shop');assert.equal(h.c.soundMode,2);assert.equal(h.c.keys.w,false);assert.equal(h.elements.prologueModal.querySelector('iframe'),null);h.click('PLAY SCENE');const frame=h.elements.prologueModal.querySelector('iframe');assert.ok(frame.src.includes('dyg3Wbx4iSc'));
 for(const fn of h.events.message)fn({source:{},origin:'https://www.youtube-nocookie.com',data:{event:'onStateChange',info:0}});assert.equal(h.c.level29Prologue.snapshot.stage,14);
 for(const fn of h.events.message)fn({source:frame.contentWindow,origin:'https://www.youtube-nocookie.com',data:{event:'onStateChange',info:0}});assert.equal(h.c.level29Prologue.snapshot.stage,15);assert.equal(h.c.state,'play');assert.equal(h.c.soundMode,0);assert.equal(h.elements.prologueModal.querySelector('iframe'),null);
});
test('supplies checkpoint equips lab outfit at dusk and mall checkpoint switches to black shirt and glasses',()=>{
 const h=harness();h.c.startGame(0,{resume:true,prologue:{v:1,stage:13}});h.update();assert.equal(h.c.level29Prologue.timeHour,18);assert.equal(h.c.level29Prologue.actors.coat.visible,true);assert.equal(h.c.level29Prologue.actors.goggles.visible,true);h.c.startGame(0,{resume:true,prologue:{v:1,stage:15}});h.update();assert.equal(h.c.level29Prologue.actors.coat.visible,false);assert.equal(h.c.level29Prologue.actors.glasses.visible,true);assert.equal(h.c.level29Prologue.actors.ahmad.userData.shirt.color.getHexString(),'111317');assert.equal(h.c.level29Prologue.actors.seated.visible,true);
});
test('outbreak chases civilians and Ronnie GLB triggers only within six feet; final film hands off once',async()=>{
 const h=harness();h.c.startGame(0,{resume:true,prologue:{v:1,stage:17}});h.update();await new Promise(r=>setImmediate(r));h.update();assert.ok(h.c.level29Prologue.actors.ronnie.userData.referenceModel);const target=h.c.level29Prologue.points.ronnie;h.c.player.x=target.x+30;h.c.player.y=target.y;h.update();assert.equal(h.c.level29Prologue.snapshot.stage,17);h.c.player.x=target.x+18;h.update();assert.equal(h.c.level29Prologue.snapshot.stage,18);assert.equal(h.c.state,'shop');h.click('SKIP SCENE / CONTINUE STORY');assert.equal(h.handoffs,1);assert.equal(h.c.level29Prologue.active,false);assert.equal(h.c.mission.info.title,'Original campaign');assert.equal(h.c.cash,321);assert.equal(h.c.up.rapid,2);assert.equal(h.c.finalHour,18);assert.equal(h.c.level29Prologue.snapshot.stage,19);
});
test('all errands, moving festival, escort, lab walk and three scenes complete in order without starting campaign early',async()=>{
 const h=harness();h.c.startGame(0);h.update();let safety=0;
 while(h.c.level29Prologue.active&&safety++<45){
  const stage=h.c.level29Prologue.snapshot.stage;
  if(stage===8){
   h.moveToTarget();assert.equal(h.c.level29Prologue.interact(),false,'cannot finish without Ahmad');
   const destination=h.c.level29Prologue.points.samGarage;
   for(let i=0;i<450;i++){const m=h.c.level29Prologue.actors.ahmad,dx=destination.x-m.position.x,dy=destination.y-m.position.z,d=Math.hypot(dx,dy);h.c.player.x=m.position.x+(d?dx/d*Math.min(70,d):0);h.c.player.y=m.position.z+(d?dy/d*Math.min(70,d):0);h.update();}
  }
  if(stage===13)h.update(250);
  if(stage===17){h.update();await new Promise(r=>setImmediate(r));h.update();}
  h.moveToTarget();
  if(!h.elements.prologueModal.hidden){h.click(h.c.level29Prologue.stage.video?'SKIP SCENE / CONTINUE STORY':'CONTINUE');}
  else{assert.equal(h.c.level29Prologue.interact(),true,'stage '+stage);if(!h.elements.prologueModal.hidden)h.click(h.c.level29Prologue.stage.video?'SKIP SCENE / CONTINUE STORY':'CONTINUE');}
  if(h.c.level29Prologue.snapshot.stage<17)assert.equal(h.c.zombies.length,0);h.update();
 }
 assert.ok(safety<45);assert.equal(h.handoffs,1);assert.equal(h.c.level29Prologue.snapshot.stage,19);assert.deepEqual([...new Set(h.saved.map(s=>s?.stage).filter(Number.isInteger))],Array.from({length:20},(_,i)=>i));
});
test('prologue death keeps collected supplies and does not start original safehouse/death timers',()=>{
 const h=harness();h.c.startGame(0,{resume:true,prologue:{v:1,stage:12}});h.update();h.c.player.hp=0;h.c.killPlayer();assert.equal(h.c.originalDeath,undefined);assert.equal(h.c.player.hp,100);assert.equal(h.c.level29Prologue.snapshot.stage,12);assert.deepEqual([...h.c.level29Prologue.inventory],['coat','goggles','kit','honey']);assert.equal(h.c.mission.info.type,'prologue');
});
