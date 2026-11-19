'use strict';
(function(){
const STEPS=['move','look','view','interact','journal','vehicle','combat'];
function sample(p,v){return {x:p.x,y:p.y,yaw:v.yaw||0,pitch:v.pitch||0};}
function achieved(step,start,now,events){return step==='move'?Math.hypot(now.x-start.x,now.y-start.y)>=24:step==='look'?Math.abs(now.yaw-start.yaw)+Math.abs(now.pitch-start.pitch)>.25:!!events[step];}
function lesson(step,label,peaceful){return {
 move:['Move around',label('forward')+' / '+label('back')+' / '+label('left')+' / '+label('right')+' to walk; Shift to sprint; Space to jump. On touch, drag the left movement stick. Walk a few steps.'],
 look:['Look and aim','Move the mouse or drag the right-side look area. On a controller use the right stick. Turn to look around.'],
 view:['See your character','Press C or tap VIEW to switch first/third person. Walls may temporarily shorten the camera or return to first person.'],
 interact:['Talk and use objects','Follow the gold mission marker and approach Sam or a marked service. Press '+label('interact')+' (or the onscreen interaction button). The Natchez CASINO button offers BOARD / EXIT and deck controls. Complete one real interaction.'],
 journal:['Find your route','Open SETTINGS / JOURNAL for the controls, objectives and route pages. Escape opens settings; return to the game when ready.'],
 vehicle:['Enter a vehicle','Approach a parked vehicle and press '+label('vehicle')+'. Touch: use the nearby vehicle action. Drive with movement controls; use the same action to exit. This is optional—skip if you want to stay on foot.'],
 combat:['Survive the outbreak',peaceful?'The opening story is peaceful: weapons and firing are intentionally disabled. Continue the story first, or skip this lesson for now.':'Click / tap FIRE to shoot, R to reload. Hold Q for the weapon wheel. Watch health and ammo; use cover. Fire one actual shot.']
}[step];}
const api={STEPS,sample,achieved,lesson};if(typeof module!=='undefined')module.exports=api;if(typeof window==='undefined')return;
const KEY='level29.interaction-tutorial.v1';let dismissed=false;try{dismissed=!!JSON.parse(localStorage.getItem(KEY)||'null')?.dismissed;}catch(_){}
let running=false,welcome=true,index=0,baseline=null,owner=null,events={},shown=false,lastStep='',skipped=0;
const panel=document.createElement('aside');panel.id='interactionTutorial';panel.hidden=true;panel.setAttribute('aria-label','Interactive controls tutorial');panel.style.cssText='position:fixed;left:12px;bottom:100px;z-index:87;width:min(360px,calc(100vw - 24px));max-height:42dvh;overflow:auto;box-sizing:border-box;background:#10231bea;color:#f4ead2;padding:14px;border:1px solid #bead7b;font:14px/1.45 system-ui';
const title=document.createElement('h3'),text=document.createElement('p'),primary=document.createElement('button'),skip=document.createElement('button'),close=document.createElement('button');title.style.margin='0';panel.append(title,text,primary,skip,close);for(const b of [primary,skip,close]){b.type='button';b.style.cssText='min-height:44px;margin:3px;padding:8px;background:#304c3b;color:#fff0ce;border:1px solid #a99d78';}close.textContent='CLOSE';document.body.appendChild(panel);
function persist(done){try{localStorage.setItem(KEY,JSON.stringify({dismissed:true,completed:done,skipped}));}catch(_){}dismissed=true;}
function begin(){shown=true;owner=player;running=true;welcome=false;index=0;skipped=0;events={};baseline=player?sample(player,view):null;lastStep='';draw();}
function draw(){panel.hidden=!running||!['play','pause'].includes(state)||!!window.level29UX?.modalOpen;if(!running)return;if(welcome){title.textContent='WELCOME · LEARN BY DOING';text.textContent='A short optional guide to movement, interaction and survival. The game keeps running; use PAUSE if you need a break. No rewards or purchases are required.';primary.textContent='START TUTORIAL';skip.hidden=true;return;}
 const step=STEPS[index],label=a=>window.level29Bindings?.label(a)||a.toUpperCase(),l=lesson(step,label,!!window.level29Prologue?.peaceful);title.textContent=(index+1)+' / '+STEPS.length+' · '+l[0];text.textContent=l[1];primary.textContent='WAITING FOR ACTION';primary.disabled=true;skip.hidden=false;skip.textContent='SKIP STEP';}
function next(){index++;events={};baseline=player?sample(player,view):null;lastStep='';if(index===STEPS.length){persist(true);running=false;panel.hidden=true;toast('TUTORIAL FINISHED · REPLAY FROM PAUSE OR SETTINGS');}else draw();}
primary.onclick=()=>{if(welcome){primary.disabled=false;begin();}};skip.onclick=()=>{skipped++;next();};close.onclick=()=>{persist(false);running=false;panel.hidden=true;};
for(const e of ['click','pointerdown','pointerup','touchstart','touchend','keydown','keyup','wheel'])panel.addEventListener(e,x=>x.stopPropagation());
function control(parent){if(!parent)return;const b=document.createElement('button');b.type='button';b.textContent='HOW TO PLAY · TUTORIAL';b.style.minHeight='44px';b.onclick=()=>{running=true;welcome=true;primary.disabled=false;draw();};parent.appendChild(b);}
control(document.getElementById('pauseControls'));control(document.getElementById('main-view-3'));
// Observe actual outcomes, not mere key presses. No input remapping or simulation changes.
const service=serviceVenue;serviceVenue=function(){const before={state,stage:window.level29Prologue?.snapshot?.stage,boat:window.level29Riverboat?.active},result=service.apply(this,arguments);if(result===true||state!==before.state||before.stage!==window.level29Prologue?.snapshot?.stage||before.boat!==window.level29Riverboat?.active)events.interact=true;return result;};
if(window.level29Riverboat){for(const name of ['enter','leave']){const fn=level29Riverboat[name];level29Riverboat[name]=function(){const before=level29Riverboat.active,r=fn.apply(this,arguments);if(before!==level29Riverboat.active)events.interact=true;return r;};}}
const shot=fireWeapon;fireWeapon=function(){const before=typeof lastShotFrame==='undefined'?null:lastShotFrame,result=shot.apply(this,arguments);if(before!==null&&lastShotFrame!==before)events.combat=true;return result;};
const tick=update;update=function(){const r=tick.apply(this,arguments);if(!player)return r;if(owner!==player){owner=player;baseline=sample(player,view);events={};}if(!dismissed&&!shown&&state==='play'){shown=true;running=true;welcome=true;}
 if(running&&!welcome){if(!baseline)baseline=sample(player,view);events.vehicle ||= !!player.car;events.journal ||= !!window.level29UX?.modalOpen;events.view ||= !!window.level29ThirdPerson?.active;if(state==='play'&&achieved(STEPS[index],baseline,sample(player,view),events))next();}
 const stamp=[running,welcome,index,state,!!window.level29UX?.modalOpen,!!window.level29Prologue?.peaceful].join(':');if(stamp!==lastStep){lastStep=stamp;draw();}return r;};
window.level29InteractionTutorial={...api,begin,get step(){return running&&!welcome?STEPS[index]:null;}};
})();
