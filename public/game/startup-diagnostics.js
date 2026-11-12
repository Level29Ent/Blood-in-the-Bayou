'use strict';
(function(){
const box=document.createElement('pre');box.id='startupError';box.style.cssText='display:none;position:fixed;inset:12px 12px auto;z-index:99999;max-height:40vh;overflow:auto;white-space:pre-wrap;background:#1b1111ee;color:#f5d6ae;padding:16px;font:12px monospace;pointer-events:auto';document.body.appendChild(box);
function report(message){window.level29SessionRecovery?.record('startup-error',String(message));if(box.style.display!=='none')return;box.textContent='GAME ERROR · '+String(message).slice(0,500)+'\nPlease send a screenshot of this message. Saved browser data has not been cleared.';box.style.display='block';}
addEventListener('error',e=>report(e.message+' · '+(e.filename||'').split('/').pop()+':'+e.lineno));addEventListener('unhandledrejection',e=>report(e.reason?.message||'Unhandled promise rejection'));
window.level29StartupDiagnostics={report};
})();
