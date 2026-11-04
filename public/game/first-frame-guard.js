'use strict';
(function(){
let starting=false,frames=0;const loading=document.createElement('div');loading.id='firstFrameStatus';loading.style.cssText='display:none;position:fixed;inset:0;background:#0a151bef;color:#eedba9;z-index:12000;padding:20vh 8vw;box-sizing:border-box;font:18px monospace;white-space:pre-wrap';document.body.appendChild(loading);
function fail(error){starting=false;mouse.down=false;if(!mpRole)state='pause';document.exitPointerLock?.();loading.textContent='THE CITY COULD NOT DRAW ITS FIRST FRAME\n'+String(error?.message||error).slice(0,250)+'\nYour saved progress has not been cleared. Reload to retry.';loading.style.display='block';window.level29StartupDiagnostics?.report(error?.message||error);}
const begin=startGame;startGame=function(){if(starting)return;starting=true;frames=0;loading.textContent='DRAWING THE UPGRADED CITY…';loading.style.display='block';try{return begin.apply(this,arguments);}catch(e){fail(e);throw e;}};
const renderBase=render;render=function(){try{const result=renderBase.apply(this,arguments);if(starting&&renderer&&state==='play'){if(renderer.getContext().isContextLost())throw Error('WebGL graphics device is unavailable');if(++frames>=2){starting=false;loading.style.display='none';}}return result;}catch(e){if(starting)fail(e);throw e;}};
window.level29FirstFrame={get starting(){return starting;},get frames(){return frames;}};
})();
