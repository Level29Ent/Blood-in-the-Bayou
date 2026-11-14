'use strict';
(function(){
/** One optional asset operation at a time, started only after its owner has been near for a grace interval. */
function createQueue({load,install,now=()=>performance.now(),onError=()=>{},grace=1200,retryAfter=30000}={}){
 let entries=[],inflight=false,generation=0;
 function clear(){generation++;entries=[];}
 function add(owner,name){entries.push({owner,name,since:null,retry:0,loaded:false,pending:false});}
 function tick(near){const time=now();for(const e of entries){if(!e.owner?.parent||!near(e.owner)){e.since=null;continue;}if(e.since===null)e.since=time;}
  if(inflight)return;const e=entries.find(e=>!e.loaded&&!e.pending&&e.owner?.parent&&e.since!==null&&time-e.since>=grace&&time>=e.retry);if(!e)return;const token=generation;e.pending=true;inflight=true;
  Promise.resolve().then(()=>load(e.name)).then(template=>{if(token!==generation||!e.owner.parent)return;install(e.owner,template);e.loaded=true;}).catch(error=>{e.retry=now()+retryAfter;onError(e.name,error);}).finally(()=>{e.pending=false;inflight=false;});
 }
 return {add,clear,tick,get count(){return entries.length;},get pending(){return inflight;}};
}
if(typeof module!=='undefined')module.exports={createQueue};if(typeof window!=='undefined')window.level29NearbyAssets={createQueue};
})();
