'use strict';
(function(){
// Oriented vehicle footprint in the game's x/y ground plane; no mesh traversal.
function footprint(c,height){return c&&!c.gone&&!c.boat&&c.spec&&Number.isFinite(c.x)&&Number.isFinite(c.y)&&Math.abs((c.z||0)-height)<18;}
function local(c,x,y){const co=Math.cos(c.a||0),si=Math.sin(c.a||0),dx=x-c.x,dy=y-c.y;return {x:dx*co+dy*si,y:-dx*si+dy*co,co,si};}
function contains(c,x,y,r=7){const p=local(c,x,y);return Math.abs(p.x)<c.spec.len/2+r&&Math.abs(p.y)<c.spec.wid/2+r;}
function blocked(vehicles,x,y,r=7,height=0){return vehicles.some(c=>footprint(c,height)&&contains(c,x,y,r));}
function sweep(vehicles,a,b,r=7,height=0){const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/3));for(let i=1;i<=n;i++)if(blocked(vehicles,a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n,r,height))return true;return false;}
function resolve(a,vehicles,wall,height=0){for(const c of vehicles){if(!footprint(c,height)||!contains(c,a.x,a.y,7))continue;const p=local(c,a.x,a.y),lx=c.spec.len/2+7.5,ly=c.spec.wid/2+7.5;const choices=[{x:p.x,y:ly},{x:p.x,y:-ly},{x:lx,y:p.y},{x:-lx,y:p.y}].map(q=>({x:c.x+q.x*p.co-q.y*p.si,y:c.y+q.x*p.si+q.y*p.co})).sort((p,q)=>Math.hypot(p.x-a.x,p.y-a.y)-Math.hypot(q.x-a.x,q.y-a.y));const safe=choices.find(q=>!wall(q.x,q.y,7)&&!blocked(vehicles,q.x,q.y,7,height));if(safe){a.x=safe.x;a.y=safe.y;}}}
// Waypoints skirt a stopped car rather than leaving a pedestrian marching into it forever.
function step(a,target,amount,vehicles,wall,height=0){resolve(a,vehicles,wall,height);let goal=a.vehicleDetour;if(goal&&Math.hypot(goal.x-a.x,goal.y-a.y)<3){a.vehicleDetour=null;goal=null;}const d=Math.hypot(target.x-a.x,target.y-a.y);if(!d)return false;
 if(!goal&&sweep(vehicles,a,{x:a.x+(target.x-a.x)/d*amount,y:a.y+(target.y-a.y)/d*amount},7,height)){
  const c=vehicles.find(c=>footprint(c,height)&&contains(c,a.x+(target.x-a.x)/d*(amount+10),a.y+(target.y-a.y)/d*(amount+10),7));if(c){const p=local(c,a.x,a.y),L=c.spec.len/2+12,W=c.spec.wid/2+12;const candidates=[-1,1].flatMap(s=>[{x:-L,y:s*W},{x:L,y:s*W}]).map(q=>({x:c.x+q.x*p.co-q.y*p.si,y:c.y+q.x*p.si+q.y*p.co})).filter(q=>!wall(q.x,q.y,7)&&!blocked(vehicles,q.x,q.y,7,height)&&!sweep(vehicles,a,q,7,height));candidates.sort((p,q)=>(Math.hypot(p.x-a.x,p.y-a.y)+Math.hypot(p.x-target.x,p.y-target.y))-(Math.hypot(q.x-a.x,q.y-a.y)+Math.hypot(q.x-target.x,q.y-target.y)));goal=candidates[0];if(goal)a.vehicleDetour=goal;}}
 goal=goal||target;const dist=Math.hypot(goal.x-a.x,goal.y-a.y),s=Math.min(amount,dist),next={x:a.x+(goal.x-a.x)/(dist||1)*s,y:a.y+(goal.y-a.y)/(dist||1)*s};if(wall(next.x,next.y,7)||sweep(vehicles,a,next,7,height)){a.vehicleDetour=null;return false;}a.a=Math.atan2(next.y-a.y,next.x-a.x);a.x=next.x;a.y=next.y;a.anim+=s*.15;return Math.hypot(target.x-a.x,target.y-a.y)<.1;
}
const api={contains,blocked,sweep,resolve,step};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29PedestrianVehicles=api;
})();
