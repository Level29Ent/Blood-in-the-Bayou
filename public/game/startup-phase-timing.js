'use strict';
(function(){
if(typeof window==='undefined')return;
// Persist each phase before expensive synchronous work so an interrupted startup leaves useful evidence.
function timed(kind,fn){return function(){const start=performance.now();window.level29SessionRecovery?.record(kind+'-start','Starting '+kind);try{const result=fn.apply(this,arguments);window.level29SessionRecovery?.record(kind+'-ready',JSON.stringify({elapsedMs:Math.round(performance.now()-start)}));return result;}catch(error){window.level29SessionRecovery?.record(kind+'-failed',error?.message||String(error));throw error;}};}
genCity=timed('world-generation',genCity);renderGround=timed('ground-paint',renderGround);buildCity=timed('world-build',buildCity);
})();
