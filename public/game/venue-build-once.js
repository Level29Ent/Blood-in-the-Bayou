'use strict';
(function(){
function once(builder,root){const completed=new WeakMap();return function(v){const parent=root();if(completed.get(v)===parent&&v.mesh?.parent===parent)return;const result=builder.apply(this,arguments);if(v.mesh?.parent===parent)completed.set(v,parent);return result;};}
if(typeof module!=='undefined')module.exports={once};if(typeof window!=='undefined')buildVenue=once(buildVenue,()=>cityGroup);
})();
