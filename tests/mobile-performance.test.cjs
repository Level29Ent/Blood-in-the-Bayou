'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict'), fs=require('node:fs'), vm=require('node:vm');
const policy=require('../public/game/runtime-policy.js');
test('phone pacing holds 60 on healthy frames, ignores loading spikes and falls back under sustained load',()=>{
 const p=policy.mobilePacing();for(let i=0;i<600;i++)p.observe(16.7);assert.equal(p.fps,60);
 p.observe(2000);p.observe(100,false);assert.equal(p.fps,60);
 for(let i=0;i<180;i++)p.observe(33.3);assert.equal(p.fps,30);
 for(let i=0;i<600;i++)p.observe(16.7);assert.equal(p.fps,30,'avoid target oscillation within the page session');
});
test('actual mobile policy changes pacing without enabling shadows, reflections or extra particles',()=>{
 const c={window:{level29MobileBudget:{mobile:true},level29Graphics:{quality:'low'}}};vm.createContext(c);vm.runInContext(fs.readFileSync('public/game/runtime-policy.js','utf8'),c);const p=c.window.level29RuntimePolicy;
 assert.equal(p.budget.fps,60);for(let i=0;i<180;i++)p.observeMobileFrame(33.3,true);
 assert.equal(p.budget.fps,30);assert.equal(p.budget.shadow,0);assert.equal(p.budget.reflections,false);assert.equal(p.budget.particles,120);
});
test('touch camera updates before the next render with no leftover movement tail',()=>{
 let calls=[],now=0;const c={window:{},document:{hidden:false,head:{appendChild(){}},createElement:()=>({}),addEventListener(){}},navigator:{maxTouchPoints:5},matchMedia:()=>({matches:true}),addEventListener(){},turnView:(...args)=>calls.push(args),cv:{},performance:{now:()=>now},state:'play',renderer:null,render(){}};
 vm.createContext(c);vm.runInContext(fs.readFileSync('public/game/smooth.js','utf8'),c);
 c.turnView(.1,.2);assert.deepEqual(calls,[[.1,.2]]);now+=33.3;c.render();assert.equal(calls.length,1);
});
function audio(){
 const requested=[],started=[],responses=[],events={};let decodes=0;
 const c={window:{level29VoiceFiles:{zm_0:'voices/zm_0.mp3',sv_0:'voices/sv_0.mp3',b_final_0:'voices/b_final_0.mp3'},addEventListener:(name,fn)=>events[name]=fn},document:{hidden:false,addEventListener:(name,fn)=>events[name]=fn},fetch:url=>new Promise(resolve=>{requested.push(url);responses.push(resolve);}),actx:{currentTime:0,createGain:()=>({gain:{value:0},connect(){}}),decodeAudioData(bytes,resolve){decodes++;resolve({duration:3});},createBufferSource:()=>({playbackRate:{},connect(){},start(){started.push(this);},stop(){this.stopped=true;}})},soundMode:0,master:{},console};
 vm.createContext(c);const source=fs.readFileSync('public/game/audio.js','utf8');vm.runInContext(source.slice(source.indexOf('const VO_TEXT =')),c);c.loadVoices();
 return {c,events,requested,started,get decodes(){return decodes;},respond(ok=true){responses.shift()({ok,arrayBuffer:async()=>new ArrayBuffer(2)});}};
}
const settle=()=>new Promise(r=>setImmediate(r));
test('audio unlock does not download or decode the voice bank; requests deduplicate and decoded clips replay',async()=>{
 const t=audio();assert.equal(t.requested.length,0);assert.equal(t.decodes,0);
 const first=t.c.prepareVO('zm_0'),second=t.c.prepareVO('zm_0');assert.equal(first,second);assert.equal(t.requested.length,1);t.respond();await first;
 assert.equal(t.decodes,1);assert.equal(t.c.playVO('zm_0').dur,3);assert.equal(t.c.playVO('zm_0').dur,3);assert.equal(t.requested.length,1);
});
test('failed voice requests retry and unknown keys never fetch',async()=>{
 const t=audio();const p=t.c.prepareVO('sv_0');t.respond(false);assert.equal(await p,null);const retry=t.c.prepareVO('sv_0');t.respond();assert.ok(await retry);assert.equal(t.requested.length,2);assert.equal(await t.c.prepareVO('missing'),null);
});
test('story audio and captions start after decode, with stale/muted/hidden requests discarded',async()=>{
 for(const cancel of [null,'invalid','muted','hidden']){
  const t=audio();let valid=true,captions=0;t.c.valid=()=>valid;t.c.caption=()=>captions++;
  t.c.queuedVO('sv_0',{},t.c.valid,t.c.caption);assert.equal(captions,0);
  if(cancel==='invalid')valid=false;if(cancel==='muted')t.c.soundMode=2;if(cancel==='hidden')t.c.document.hidden=true;
  t.respond();await settle();assert.equal(t.started.length,cancel?0:1);assert.equal(captions,cancel?0:1);
 }
});
test('leaving the tab and returning before download completion cannot revive queued speech',async()=>{
 const t=audio();t.c.queuedVO('sv_0',{},()=>true,()=>assert.fail('stale caption'));
 t.events.pagehide();t.respond();await settle();assert.equal(t.started.length,0);
});
test('new boss cue or stopping cancels an older in-flight recording',async()=>{
 const t=audio();t.c.boss={name:'boss'};t.c.state='play';t.c.D={id:'final'};t.c.applyVolumes=()=>{};
 const source=fs.readFileSync('public/game/game.js','utf8');vm.runInContext(source.slice(source.indexOf('function bossKey('),source.indexOf('function updateBoss(')),t.c);
 t.c.bossSay(0,true);t.c.stopBossVoice();t.respond();await settle();assert.equal(t.started.length,0);
});
test('external voice assets are byte-identical and the launcher no longer requests the embedded bank',()=>{
 const c={window:{}};vm.runInNewContext(fs.readFileSync('public/game/vo.js','utf8'),c);vm.runInNewContext(fs.readFileSync('public/game/voice-manifest.js','utf8'),c);
 assert.deepEqual(Object.keys(c.window.level29VoiceFiles).sort(),Object.keys(c.window.VO_DATA).sort());
 for(const [key,url]of Object.entries(c.window.level29VoiceFiles))assert.deepEqual(fs.readFileSync('public/game/'+url),Buffer.from(c.window.VO_DATA[key],'base64'));
 const html=fs.readFileSync('public/game/index.html','utf8');assert.doesNotMatch(html,/<script[^>]+src="vo\.js/);assert.match(html,/voice-manifest\.js/);
 assert.ok(fs.statSync('public/game/voice-manifest.js').size<6000);
});
