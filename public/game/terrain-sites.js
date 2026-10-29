'use strict';
// Shared terrain checks used by lot allocation and final terrain grading.
(function(){
function sampleLot(c,r){const h=[];for(let y=0;y<=2;y++)for(let x=0;x<=2;x++)h.push(c.heightAt?c.heightAt(r.x+r.w*x/2,r.y+r.h*y/2):0);return {max:Math.max(...h),min:Math.min(...h)};}
function lowland(c,r){const h=sampleLot(c,r);return h.max<=6&&h.min>=-1&&h.max-h.min<=2;}
function padWeight(x,y,b,margin=32){const dx=Math.max(b.x-x,0,x-b.x-b.w),dy=Math.max(b.y-y,0,y-b.y-b.h),d=Math.hypot(dx,dy);if(d>=margin)return 0;const t=d/margin;return 1-t*t*(3-2*t);}
if(typeof module!=='undefined')module.exports={sampleLot,lowland,padWeight};
if(typeof window!=='undefined')window.level29Terrain={sampleLot,lowland,padWeight};
})();
