'use strict';
(function(){
function category(text,id){if(id==='hudDrawerToggle'||id==='mobileActionsToggle'||id==='mobileActionsClose')return null;if(['shoot','enter','use','run','store','fish','jumpControl'].includes(id))return null;return /PROPERTY \/ RARE LOCKER|BOUNTY WORKSHOP|LOCAL JOBS \/ ARCADE|CITY JOURNAL \/ ROUTES/.test(text)?'secondary':null;}
if(typeof module!=='undefined')module.exports={category};if(typeof window==='undefined')return;
const style=document.createElement('style');style.textContent=`
@media(max-width:760px),(pointer:coarse){
 .mobile-secondary-source{display:none!important}
 #mobileActionsToggle{display:block!important;position:fixed;top:calc(env(safe-area-inset-top,0px) + 162px);right:max(10px,env(safe-area-inset-right));z-index:44;min-height:40px;padding:8px 12px;background:#162b34ed;color:#ebd89f;border:1px solid #b09a5e;font:12px monospace}
 #hudDrawerToggle{display:none!important}
 #jumpControl{right:max(10px,env(safe-area-inset-right))!important;bottom:calc(env(safe-area-inset-bottom,0px) + 310px)!important;min-height:44px!important;min-width:54px!important}
 #missionWaypoints{top:calc(env(safe-area-inset-top,0px) + 128px)!important;left:10px!important;max-width:48vw!important;font-size:10px!important;max-height:65px;overflow:hidden}
 #touch{bottom:calc(env(safe-area-inset-bottom,0px) + 70px)!important;right:max(10px,env(safe-area-inset-right))!important;max-width:44vw!important}
 #touch button{min-width:44px!important;min-height:44px!important;max-width:70px;font-size:11px!important;padding:8px!important;box-sizing:border-box}
 #joy{bottom:calc(env(safe-area-inset-bottom,0px) + 70px)!important;left:max(16px,env(safe-area-inset-left))!important;width:120px!important;height:120px!important}
 #joyKnob{width:48px!important;height:48px!important}
 #hudMapActions{display:none!important}
 body.touch-left #touch{right:auto!important;left:10px!important}body.touch-left #joy{left:auto!important;right:16px!important}
}
#mobileActionsToggle{display:none}#mobileActionsToggle[hidden]{display:none!important}
#mobileActionsPanel{position:fixed;inset:0;z-index:110;background:rgba(0,0,0,.85);color:#f0dba7;padding:max(20px,env(safe-area-inset-top)) 16px max(20px,env(safe-area-inset-bottom));box-sizing:border-box;overflow:auto;font:14px monospace}
#mobileActionsPanel[hidden]{display:none}#mobileActionsPanel section{margin:0 auto;width:min(440px,100%);padding:16px;box-sizing:border-box;background:#13262e;border:1px solid #b49b5b}#mobileActionsPanel button{display:block;width:100%;min-height:44px;margin:8px 0;padding:10px;background:#2b424a;color:#ead9ad;border:1px solid #8e805e;font:12px monospace}
`;document.head.appendChild(style);
const toggle=document.createElement('button');toggle.id='mobileActionsToggle';toggle.textContent='MENU +';toggle.type='button';toggle.hidden=true;toggle.setAttribute('aria-expanded','false');document.body.appendChild(toggle);const panel=document.createElement('div');panel.id='mobileActionsPanel';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Game actions');const section=document.createElement('section');panel.appendChild(section);document.body.appendChild(panel);let paused=false;const sources=new Map();
function mobile(){return matchMedia('(max-width:760px),(pointer:coarse)').matches;}
function close(){panel.hidden=true;toggle.setAttribute('aria-expanded','false');if(paused&&state==='pause')state='play';paused=false;mouse.down=false;}
function open(){if(state!=='play')return;section.replaceChildren();const h=document.createElement('h2');h.textContent='GAME ACTIONS';section.appendChild(h);const add=(text,fn)=>{const b=document.createElement('button');b.textContent=text;b.type='button';b.onclick=e=>{e.stopPropagation();close();fn();};section.appendChild(b);};
 for(const b of sources.keys())if(b.isConnected&&b.style.display!=='none'&&!b.hidden)add(b.textContent,()=>b.click());for(const id of ['dailyBadge','dailyBtn','jobBoardButton']){const b=document.getElementById(id);if(b)add(b.textContent,()=>b.click());}if(window.level29SouthernCombat){add('MELEE',()=>level29SouthernCombat.melee());add('FLASHBANG',()=>level29SouthernCombat.utility('flash'));add('SMOKE',()=>level29SouthernCombat.utility('smoke'));}add('MAP',()=>showMap=!showMap);add('CLOSE',()=>{});mouse.down=false;for(const k in keys)keys[k]=false;document.exitPointerLock?.();paused=!mpRole;if(paused)state='pause';panel.hidden=false;toggle.setAttribute('aria-expanded','true');}
function scan(){for(const b of document.body.querySelectorAll(':scope > button'))if(category(b.textContent,b.id)){b.classList.add('mobile-secondary-source');sources.set(b,true);}}
scan();const observer=new MutationObserver(scan);observer.observe(document.body,{childList:true});toggle.onclick=e=>{e.stopPropagation();panel.hidden?open():close();};for(const root of [panel,toggle])for(const type of ['click','pointerdown','pointerup','touchstart','touchend','wheel','keydown','keyup'])root.addEventListener(type,e=>e.stopPropagation());addEventListener('keydown',e=>{if(!panel.hidden&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}},true);
const tick=update;update=function(){tick.apply(this,arguments);toggle.hidden=!mobile()||state!=='play'&&panel.hidden;if(!panel.hidden&&state!=='pause'&&state!=='play')close();};
window.level29MobileLayout={open,close,scan,category,get sources(){return [...sources.keys()];}};
})();
