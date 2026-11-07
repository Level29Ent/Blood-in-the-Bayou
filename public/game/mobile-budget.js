
'use strict';
(function(){
function mobileDevice(nav,media){return !!(media?.('(pointer: coarse)').matches||/Android|iPhone|iPad|iPod/i.test(nav?.userAgent||'')||nav?.platform==='MacIntel'&&nav?.maxTouchPoints>1);}
function pixelRatio(width,height,dpr=1,mobile=false){if(!mobile)return Math.min(1,dpr||1);return Math.max(.25,Math.min(.85,dpr||1,Math.sqrt(750000/Math.max(1,width*height))));}
function releaseShadow(light){let released=0;for(const key of ['map','mapPass'])if(light?.shadow?.[key]){light.shadow[key].dispose();light.shadow[key]=null;released++;}return released;}
if(typeof module!=='undefined')module.exports={mobileDevice,pixelRatio,releaseShadow};if(typeof window==='undefined')return;
const mobile=mobileDevice(navigator,window.matchMedia?.bind(window))||new URLSearchParams(location.search).get('mobilePreview')==='1';
window.level29MobileBudget={mobile,pixelRatio:(w,h,dpr)=>pixelRatio(w,h,dpr,mobile),quality:q=>mobile?'low':q,groundLimit:mobile?1024:4096,releaseShadow};
})();
