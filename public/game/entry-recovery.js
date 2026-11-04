'use strict';
// Keep title controls responsive: no city generation/GPU shader work before entry.
window.level29DeferredEntry={started:false,busy:false};
window.addEventListener('DOMContentLoaded',()=>{
 const button=document.getElementById('start'),status=document.createElement('p');status.id='entryStatus';status.setAttribute('role','status');status.style.cssText='color:#e9d7a8;font:12px monospace;max-width:440px;white-space:pre-wrap';button.after(status);
 window.addEventListener('click',event=>{if(event.target.closest?.('#start')!==button||state!=='menu')return;event.preventDefault();event.stopImmediatePropagation();const boot=window.level29DeferredEntry;if(boot.busy)return;boot.busy=true;button.disabled=true;button.textContent='STARTING CITY…';status.textContent='Preparing city. The first load may take a few seconds.';ensureAudio();
 setTimeout(()=>{try{startGame(+document.getElementById('district').value);if(!renderer)initGL();render();if(state!=='play')throw Error('Game did not enter play');boot.started=true;last=performance.now();accT=0;requestAnimationFrame(loop);status.textContent='';}catch(error){state='menu';document.getElementById('menu').style.display='flex';window.level29StartupDiagnostics?.report(error?.message||error);status.textContent='Startup failed: '+(error?.message||error)+'. Try reloading this page; do not clear browser data.';}finally{boot.busy=false;button.disabled=false;button.textContent='ENTER THE CITY';}},60);
 },true);
});
