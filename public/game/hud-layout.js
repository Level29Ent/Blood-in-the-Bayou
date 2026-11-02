'use strict';
(function(){
const style=document.createElement('style');style.textContent=`
#hudMapActions{right:max(12px,env(safe-area-inset-right))!important;top:calc(var(--hud-status-bottom,200px) + 14px)!important;display:grid;grid-template-columns:repeat(2,minmax(60px,1fr));gap:8px!important;width:202px;max-height:calc(100dvh - var(--hud-status-bottom,200px) - 80px);overflow:auto;align-items:stretch!important;padding:4px;box-sizing:border-box}
#hudMapActions>button{position:static!important;inset:auto!important;margin:0!important;transform:none!important;min-height:44px;max-width:100%;font-size:10px!important;white-space:normal;box-sizing:border-box}
@media(max-width:699px){#hudMapActions{width:156px;gap:6px!important;grid-template-columns:1fr 1fr}}
@media(max-height:500px){#hudMapActions{width:240px;grid-template-columns:repeat(3,1fr);max-height:130px}}
#dailyChallengesPanel{inset:80px 12px auto auto!important;max-height:calc(100dvh - 110px)!important;z-index:70!important}
#powellPanel{position:fixed;inset:0;z-index:90;display:none;background:#081018e8;padding:16px;overflow:auto;color:#eee5ce;font:14px/1.5 monospace}#powellPanel .sbox{margin:auto;width:min(760px,100%)}#powellPanel button{min-height:44px;margin:5px;padding:8px}
`;document.head.appendChild(style);
window.level29UnifiedHUD=true;
const frame=document.createElement('aside');frame.id='unifiedHUD';frame.style.cssText='position:fixed;right:max(12px,env(safe-area-inset-right));top:max(12px,env(safe-area-inset-top));width:202px;max-width:40vw;max-height:calc(100dvh - 80px);overflow:auto;z-index:26;display:flex;flex-direction:column;gap:8px;padding:4px;box-sizing:border-box;color:#ead7a6;font:12px monospace;background:#101c2266';
const status=document.createElement('div');status.style.cssText='display:grid;gap:6px;text-align:right;padding:6px;background:#0b141dcc';frame.appendChild(status);document.body.appendChild(frame);
const slot=document.getElementById('hudMapActions');if(slot){slot.style.cssText='';frame.appendChild(slot);const reset=document.createElement('style');reset.textContent='#unifiedHUD #hudMapActions{position:static!important;inset:auto!important;width:100%!important;max-height:none!important;display:grid!important;pointer-events:auto}';document.head.appendChild(reset);}
const oldRender=render;render=function(){oldRender.apply(this,arguments);frame.style.display=!['play','pause'].includes(state)?'none':'flex';if(!player)return;status.replaceChildren();for(const text of ['$'+Math.floor(cash).toLocaleString(),'HEALTH '+Math.ceil(player.hp)+' / '+player.maxHp,'ARMOR '+Math.ceil(player.armor||0)+' · HEAT '+Math.ceil(heat),(typeof WEAPONS!=='undefined'&&WEAPONS[curW]?WEAPONS[curW].name:'M240')+' · '+(arsenal[curW]===Infinity?'∞':arsenal[curW]||0),player.car?player.car.spec.name+' · '+Math.ceil(player.car.hp)+' HP':'',Object.entries(up||{}).filter(([k,v])=>v).map(([k,v])=>k.toUpperCase()+' '+v).join(' · ')])if(text){const row=document.createElement('div');row.textContent=text;status.appendChild(row);} };for(const id of ['dailyBtn','storyBoard','mallDirections','powellBoard','jobBoardButton']){const b=document.getElementById(id);if(b&&slot)slot.appendChild(b);}
})();
