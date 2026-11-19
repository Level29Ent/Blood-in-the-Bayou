'use strict';
(function(){
function chapters(districts,per=30,total=districts.length*per){return districts.map((d,i)=>({name:d.name,first:i*per+1,last:Math.min(total,(i+1)*per)})).filter(c=>c.first<=total);}
const api={chapters};if(typeof module!=='undefined')module.exports=api;if(typeof window==='undefined')return;
const play=document.getElementById('main-view-0'),controls=document.getElementById('landingControls'),zones=document.getElementById('campaignZones'),list=document.getElementById('campaignZoneList');
if(play){if(controls)play.appendChild(controls);if(zones)play.appendChild(zones);}
if(list){list.replaceChildren();for(const c of chapters(DISTRICTS,MISSIONS_PER,CAMPAIGN_TOTAL)){const row=document.createElement('li');row.textContent=c.name+' · Missions '+c.first+'–'+c.last;list.appendChild(row);}}
// Keep the always-visible core hint truthful after controls are rebound.
const hint=document.querySelector('#menu .keys');function refresh(){if(!hint)return;const label=a=>window.level29Bindings?.label(a)||({forward:'W',back:'S',left:'A',right:'D',interact:'E',vehicle:'G'}[a]||a);hint.textContent=[['forward','back','left','right'].map(label).join('/')+' move','Mouse / right-side drag aim','Click / FIRE shoot',label('interact')+' / USE interact'].join(' · ');const body=document.getElementById('landingControlsBody');if(body){const note=document.getElementById('liveControlBindings')||document.createElement('p');note.id='liveControlBindings';note.textContent='Current bindings: use '+label('interact')+' · vehicle '+label('vehicle')+' · movement '+['forward','back','left','right'].map(label).join('/');if(!note.parentNode)body.appendChild(note);}}
controls?.addEventListener('toggle',refresh);refresh();window.level29Landing={...api,refresh};
})();
