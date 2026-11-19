const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('public/game/player-experience.js','utf8');
function harness(){
  let saves=0,opens=0,clears=0;
  const events={},docEvents={},messages=[];
  const ctx={state:'play',mpRole:null,player:{dead:false},window:{level29Save:{save(){saves++;return true;}}},document:{hidden:false,addEventListener(k,f){docEvents[k]=f;}},addEventListener(k,f){events[k]=f;},open(){opens++;ctx.state='pause';},clearInput(){clears++;},text:s=>messages.push(s)};
  vm.createContext(ctx);
  vm.runInContext(source.slice(source.indexOf('  function saveProgress()'),source.indexOf('  function close()')),ctx);
  return {ctx,events,docEvents,messages,get saves(){return saves;},get opens(){return opens;},get clears(){return clears;}};
}
test('save reports success only after a real solo save; failure is explicit',()=>{
  const h=harness();assert.match(h.ctx.saveProgress(),/Progress saved/);assert.equal(h.saves,1);
  h.ctx.window.level29Save.save=()=>false;assert.match(h.ctx.saveProgress(),/Could not save/);
  h.ctx.mpRole='host';assert.match(h.ctx.saveProgress(),/solo play/);
  h.ctx.mpRole=null;h.ctx.player.dead=true;assert.match(h.ctx.saveProgress(),/solo play/);
  assert.equal(h.saves,1);
});
test('focus loss clears input and pauses solo play once, never resumes automatically',()=>{
  const h=harness();h.events.blur();assert.equal(h.clears,1);assert.equal(h.opens,1);assert.equal(h.ctx.state,'pause');assert.match(h.messages[0],/AUTO-PAUSED/);
  h.ctx.document.hidden=true;h.docEvents.visibilitychange();assert.equal(h.opens,1);
  h.ctx.document.hidden=false;h.docEvents.visibilitychange();assert.equal(h.ctx.state,'pause');
});
test('focus loss never pauses multiplayer or changes menu, shop, death states',()=>{
  for(const state of ['menu','shop','talk','pause']){const h=harness();h.ctx.state=state;h.events.blur();assert.equal(h.opens,0);assert.equal(h.ctx.state,state);assert.equal(h.clears,1);}
  for(const role of ['host','client']){const h=harness();h.ctx.mpRole=role;h.events.blur();assert.equal(h.ctx.state,'play');assert.equal(h.opens,0);assert.equal(h.clears,1);}
  const h=harness();h.ctx.player.dead=true;h.events.blur();assert.equal(h.opens,0);
});
test('visible settings drawer offers save feedback and objective; legacy Save & Resume really saves',()=>{
  assert.match(source,/add\("SAVE PROGRESS"/);assert.match(source,/status.textContent = saveProgress\(\)/);assert.match(source,/CURRENT OBJECTIVE/);
  assert.match(fs.readFileSync('public/game/pause-controls.js','utf8'),/level29Save\?\.save\('PROGRESS SAVED'\)/);
});
