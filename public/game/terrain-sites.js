'use strict';
// Shared terrain checks used by lot allocation and final terrain grading.
(function(){
function sampleLot(c,r){const h=[];for(let y=0;y<=2;y++)for(let x=0;x<=2;x++)h.push(c.heightAt?c.heightAt(r.x+r.w*x/2,r.y+r.h*y/2):0);return {max:Math.max(...h),min:Math.min(...h)};}
function lowland(c,r){const h=sampleLot(c,r);return h.max<=6&&h.min>=-1&&h.max-h.min<=2;}
function padWeight(x,y,b,margin=32){const dx=Math.max(b.x-x,0,x-b.x-b.w),dy=Math.max(b.y-y,0,y-b.y-b.h),d=Math.hypot(dx,dy);if(d>=margin)return 0;const t=d/margin;return 1-t*t*(3-2*t);}
const mountainCache=new WeakMap();
function mountainSurface(c,analytic,x,y){
 let cached=mountainCache.get(c);if(!cached||cached.source!==c.features){cached={source:c.features,list:(c.features||[]).filter(f=>f.kind==='mountain')};mountainCache.set(c,cached);}
 const f=cached.list.find(f=>f.kind==='mountain'&&x>=f.x&&x<=f.x+f.w&&y>=f.y&&y<=f.y+f.h);if(!f)return analytic(x,y);
 const n=Math.min(64,Math.max(24,Math.round(Math.max(f.w,f.h)/24))),gx=Math.min(n-1,Math.max(0,Math.floor((x-f.x)/f.w*n))),gy=Math.min(n-1,Math.max(0,Math.floor((y-f.y)/f.h*n))),dx=f.w/n,dy=f.h/n,xx=f.x+gx*dx,yy=f.y+gy*dy,u=(x-xx)/dx,v=(y-yy)/dy;
 const h00=analytic(xx,yy),h10=analytic(xx+dx,yy),h01=analytic(xx,yy+dy),h11=analytic(xx+dx,yy+dy);
 return u+v<=1?h00*(1-u-v)+h10*u+h01*v:h11*(u+v-1)+h01*(1-u)+h10*(1-v);
}
if(typeof module!=='undefined')module.exports={sampleLot,lowland,padWeight,mountainSurface};
if(typeof window!=='undefined')window.level29Terrain={sampleLot,lowland,padWeight,mountainSurface};
})();
