'use strict';
(function(){
function segmentDistance2(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,d=dx*dx+dy*dy,t=d?Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/d)):0;return (px-ax-dx*t)**2+(py-ay-dy*t)**2;}
function blockedSegment(ax,ay,bx,by,blocked){const n=Math.max(1,Math.ceil(Math.hypot(bx-ax,by-ay)/4));for(let i=1;i<=n;i++)if(blocked(ax+(bx-ax)*i/n,ay+(by-ay)*i/n))return true;return false;}
function velocity(current,target){const accel=Math.abs(target)<.05?.5:.38;const v=current+(target-current)*accel;return Math.abs(v)<.015?0:v;}
function sensitivity(n){return Math.max(.4,Math.min(2,Number(n)||1));}
const api={segmentDistance2,blockedSegment,velocity,sensitivity};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29GameplayMath=api;
})();
