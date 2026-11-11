const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {mobileDevice,pixelRatio,releaseShadow}=require('../public/game/mobile-budget.js');
test('mobile profile detects phone/tablet including desktop-mode iPad but not mouse desktop',()=>{
 assert.equal(mobileDevice({userAgent:'iPhone'},()=>({matches:false})),true);
 assert.equal(mobileDevice({platform:'MacIntel',maxTouchPoints:5},()=>({matches:false})),true);
 assert.equal(mobileDevice({platform:'MacIntel',maxTouchPoints:0},()=>({matches:false})),false);
 assert.equal(mobileDevice({},()=>({matches:true})),true);
});
test('mobile drawing buffer stays within 750k pixels and rotation keeps the same budget',()=>{
 for(const [w,h]of [[390,844],[844,390],[1366,1024],[1024,1366],[2048,1536]]){const r=pixelRatio(w,h,3,true);assert.ok(r<=1.5);assert.ok(w*h*r*r<=750001);assert.equal(r,pixelRatio(h,w,3,true));}
 assert.equal(pixelRatio(1280,800,2,false),1);
});
test('Low releases both shadow targets once without touching light/shared textures',()=>{
 let count=0;const light={shadow:{map:{dispose:()=>count++},mapPass:{dispose:()=>count++}}};assert.equal(releaseShadow(light),2);assert.equal(releaseShadow(light),0);assert.equal(count,2);assert.equal(light.shadow.map,null);
});
test('actual graphics selector cannot enable desktop composer/shadows on mobile',()=>{
 const source=fs.readFileSync('public/game/graphics.js','utf8');const a=source.indexOf('window.level29Graphics='),body=source.slice(a,source.indexOf('\n})();',a));
 const c={window:{level29MobileBudget:{quality:()=> 'low'}},quality:'low',preferred:'low',localStorage:{setItem:(k,v)=>c.stored=v}};vm.createContext(c);vm.runInContext(body,c);c.window.level29Graphics.setQuality('high');assert.equal(c.window.level29Graphics.quality,'low');assert.equal(c.stored,'high');assert.equal(c.window.level29Graphics.preferred,'high');
});
test('blur, OS tab hide, orientation and GPU loss clear private drag/run and look state',()=>{
 const source=fs.readFileSync('public/game/joy.js','utf8'),a=source.indexOf('function releaseTouchGesture'),b=source.indexOf('// ---------- Game controller',a),events={},docs={};let removed=0;
 const c={releaseStick(){c.released=true;},runHeld:true,document:{getElementById:()=>({classList:{remove(){removed++;}}}),addEventListener:(n,f)=>docs[n]=f,hidden:true},addEventListener:(n,f)=>events[n]=f,gp:{fire:true,sprint:true,brake:true},touch:{shoot:true,use:true},mouse:{down:true},lookTouch:{id:2}};vm.createContext(c);vm.runInContext(source.slice(a,b),c);
 for(const n of ['blur','orientationchange','pagehide','webglcontextlost']){c.runHeld=true;c.lookTouch={id:2};events[n]();assert.equal(c.runHeld,false);assert.equal(c.lookTouch,null);assert.equal(c.gp.sprint,false);assert.equal(c.mouse.down,false);assert.equal(c.touch.shoot,false);}
 docs.visibilitychange();assert.ok(c.released);assert.ok(removed>=5);
});
test('mobile budget loads before canvas allocation and clamps actual ground texture size',()=>{
 const html=fs.readFileSync('public/game/index.html','utf8');assert.ok(html.indexOf('mobile-budget.js')<html.indexOf('game.js?'));
 const source=fs.readFileSync('public/game/game.js','utf8'),a=source.indexOf('const groundBudget='),b=source.indexOf('  GS =',a),c={window:{level29GroundMemory:require('../public/game/ground-memory.js'),level29Graphics:{quality:'high'},level29MobileBudget:{groundLimit:1024}},WORLD:7680,renderer:{capabilities:{maxTextureSize:16384}}};c.level29GroundMemory=c.window.level29GroundMemory;vm.createContext(c);assert.equal(vm.runInContext(source.slice(a,b)+'groundBudget.pixels',c),1024);
});
test('phone render buffer starts above CSS resolution without allocating full Retina pixels',()=>{
 const r=pixelRatio(390,760,3,true);assert.ok(r>=1.25);assert.ok(r<=1.5);assert.ok(390*760*r*r<=750001);
});
function adaptivePhone(){
 let time=0,ratio=pixelRatio(390,760,3,true);const c={window:{level29MobileBudget:{mobile:true,pixelRatio:()=>pixelRatio(390,760,3,true)}},document:{hidden:false,head:{appendChild(){}},createElement:()=>({}),addEventListener(){}},navigator:{maxTouchPoints:5},matchMedia:()=>({matches:true}),addEventListener(){},turnView(){},cv:{},performance:{now:()=>time},innerWidth:390,innerHeight:760,devicePixelRatio:3,mpRole:null,state:'play',renderer:{getPixelRatio:()=>ratio,setPixelRatio:r=>ratio=r},render(){}};
 vm.createContext(c);vm.runInContext(fs.readFileSync('public/game/smooth.js','utf8'),c);
 return {frame(dt){time+=dt;c.render();},get ratio(){return ratio}};
}
test('steady 30fps mobile play does not repeatedly sacrifice resolution trying to reach 60fps',()=>{
 const s=adaptivePhone(),initial=s.ratio;for(let i=0;i<600;i++)s.frame(1000/30);assert.equal(s.ratio,initial);
});
test('sustained slow phone rendering retains a readable floor and recovers when fast',()=>{
 const s=adaptivePhone();for(let i=0;i<600;i++)s.frame(60);assert.ok(s.ratio>=.85);assert.ok(s.ratio<1.5);
 const low=s.ratio;for(let i=0;i<1800;i++)s.frame(16.7);assert.ok(s.ratio>low);assert.ok(s.ratio<=1.5);
});

test('mobile renderer requests edge smoothing while desktop keeps its existing context',()=>{
 const source=fs.readFileSync('public/game/fp.js','utf8'),a=source.indexOf('renderer = new THREE.WebGLRenderer('),b=source.indexOf('\n',a);
 for(const mobile of [true,false]){let options;const c={renderer:null,glCv:{},window:{level29MobileBudget:{mobile}},THREE:{WebGLRenderer:class{constructor(o){options=o;}}}};vm.createContext(c);vm.runInContext(source.slice(a,b),c);assert.equal(options.antialias,mobile);}
});
