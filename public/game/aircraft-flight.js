'use strict';
(function(){
 // One altitude shared by mesh, camera and tracer origins. Sample the entire orbit
 // before takeoff so the gunner never follows street-level terrain/collisions.
 function altitude(c,cx,cy,radius){
  let top=0;
  for(let i=0;i<144;i++){const a=i/144*Math.PI*2,x=cx+Math.cos(a)*radius,y=cy+Math.sin(a)*radius;top=Math.max(top,c.heightAt?c.heightAt(x,y):0);}
  for(const b of c.buildings||[]){const distance=Math.hypot(b.x+b.w/2-cx,b.y+b.h/2-cy),extent=Math.hypot(b.w,b.h)/2;
   if(Math.abs(distance-radius)>extent+90)continue;
   const v=(c.venues||[]).find(v=>v.b===b),height=b===c.residence?.b?1050:v?.id==='hospital'?300:v?Math.max(64,b.H||52):Math.max(100,(b.H||42)*2.4);
   top=Math.max(top,(b.baseY||0)+height);
  }
  return top+180;
 }
 if(typeof module!=='undefined')module.exports={altitude};
 if(typeof window!=='undefined')window.level29AircraftFlight={altitude};
})();
