'use strict';
(function(){
const allowed=new Set(['dailyBadge','dailyBtn','jobBoardButton']);
const css=document.createElement('style');css.textContent='#hudMapActions{position:fixed!important;right:12px!important;top:calc(var(--hud-status-bottom,200px) + 8px)!important;width:120px!important;display:flex;flex-direction:column!important;gap:5px!important;padding:0!important;background:none!important}#hudMapActions>button{min-height:30px!important;padding:5px 7px!important;font:700 9px monospace!important;animation:none!important;position:static!important}#unifiedHUD{display:contents!important}#unifiedHUD>div:not(#hudMapActions){display:none!important}';document.head.appendChild(css);
window.level29UnifiedHUD=false;
function clean(){const slot=document.getElementById('hudMapActions');if(!slot)return;for(const b of [...slot.children])if(!allowed.has(b.id)){if(b.id==='jobWorkButton'&&document.querySelector('#touch .group'))document.querySelector('#touch .group').appendChild(b);else b.remove();}for(const [id,label]of [['dailyBadge','DAILY SPIN'],['dailyBtn','DAILY OBJECTIVES'],['jobBoardButton','JOBS']]){const b=document.getElementById(id);if(b){if(b.parentElement!==slot)slot.appendChild(b);b.textContent=label;}}}
const renderBase=render;render=function(){renderBase.apply(this,arguments);clean();};clean();
})();
