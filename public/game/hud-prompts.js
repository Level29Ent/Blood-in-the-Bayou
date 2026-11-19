'use strict';
(function(){
// One layout owner for the independently rendered Natchez / construction hints.
// Keep real action buttons (and their listeners) rather than cloning them.
function select(rows,storyAction){
 const construction=rows.get('construction');
 const nearby=storyAction?null:rows.get('downtown')||rows.get('boat');
 return [nearby,construction].filter(Boolean);
}
if(typeof module!=='undefined')module.exports={select};
if(typeof window==='undefined')return;
const dock=document.createElement('div');dock.id='hudPromptStack';
dock.setAttribute('role','group');dock.setAttribute('aria-label','Nearby actions and construction controls');
document.body.appendChild(dock);
for(const type of ['pointerdown','pointerup','mousedown','mouseup','click','touchstart','touchend','wheel'])dock.addEventListener(type,e=>e.stopPropagation());
for(const id of ['prologueAction','riverboatControls']){const el=document.getElementById(id);if(el)dock.appendChild(el);}
const nearby=document.createElement('div'),construction=document.createElement('div');
for(const el of [nearby,construction]){el.className='hud-prompt-row';el.hidden=true;dock.appendChild(el);}
const rows=new Map();
window.level29HudPrompts={set(id,text){if(text)rows.set(id,{id,text});}};
const draw=render;
render=function(){
 rows.clear();const result=draw.apply(this,arguments);
 dock.hidden=state!=='play'||!!showMap||!!player?.dead||!!window.level29UX?.modalOpen;
 const action=document.getElementById('prologueAction');
 const storyAction=!!action&&!action.hidden&&getComputedStyle(action).display!=='none';
 const chosen=select(rows,storyAction);
 for(const [el,id] of [[nearby,'nearby'],[construction,'construction']]){
  const row=chosen.find(r=>id==='construction'?r.id==='construction':r.id!=='construction');
  el.hidden=!row;if(row&&el.textContent!==row.text)el.textContent=row.text;
 }
 return result;
};
})();
