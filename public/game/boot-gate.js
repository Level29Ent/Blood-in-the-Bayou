'use strict';
(function(){
// Menu is readable immediately. Audio is unlocked synchronously in the same
// real click that starts/continues play; WebGL/world work remains deferred.
let entered=false,started=false,failed=false,ready=false,pending=0,total=0,done=0;
const gate=document.getElementById('entryGate'),status=document.getElementById('loadStatus'),fill=document.getElementById('loadFill');
function paint(){const percent=total?Math.floor(done/total*100):0;if(fill){fill.style.width=percent+'%';fill.parentElement?.setAttribute('aria-valuenow',String(percent));}if(status)status.textContent=failed?'STARTUP FAILED · RELOAD TO RETRY; SAVED PROGRESS IS KEPT':!ready?'PREPARING MENU':pending?'LOADING OPTIONAL ASSETS · '+done+' / '+total:'READY · ENTER THE CITY';}
function enter(){if(failed)return false;if(started){try{if(typeof actx!=='undefined'&&actx?.state==='suspended')actx.resume().catch(()=>{});}catch(_){}return true;}
 // Retrying a browser-suspended AudioContext needs the current user activation.
 try{ensureAudio();if(typeof actx!=='undefined'&&actx?.state==='suspended')actx.resume().catch(()=>{});}catch(_){}
 try{entered=true;last=performance.now();accT=0;requestAnimationFrame(loop);started=true;window.level29SessionRecovery?.record('menu-ready','Single play gesture unlocked audio; world entry follows');return true;}
 catch(e){failed=true;window.level29StartupDiagnostics?.report(e.message||String(e));paint();return false;}
}
window.level29Boot={enter,get entered(){return entered;},get started(){return started;},codeReady(){ready=true;if(gate)gate.hidden=true;const start=document.getElementById('start');if(start)start.disabled=false;paint();},ready(){ready=true;paint();},assetStart(){pending++;total++;paint();},assetEnd(){pending=Math.max(0,pending-1);done++;paint();}};
// Capture preserves the real gesture before first-frame queueing and supports
// Continue, multiplayer and other play actions without an extra unlock screen.
document.addEventListener('click',e=>{if(!ready)return;if(e.target?.closest?.('#start,#resume,#mpbtn,#mpStart,#mpHost,#mpJoin'))enter();},true);
})();
