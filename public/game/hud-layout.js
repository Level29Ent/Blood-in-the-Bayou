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
// Keep the original canvas cash, health, armor and weapon display.
window.level29UnifiedHUD=false;
const slot=document.getElementById('hudMapActions');
for(const id of ['dailyBtn','storyBoard','mallDirections','jobBoardButton']){const b=document.getElementById(id);if(b&&slot)slot.appendChild(b);}
document.getElementById('powellBoard')?.remove();
})();
