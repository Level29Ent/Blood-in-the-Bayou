'use strict';
(function(){
const DURATION_SECONDS=29,ORBIT_RADIUS=900,MAX_RANGE=1800,DAMAGE=35;
function rayBox(origin,direction,box,limit=MAX_RANGE){
 let near=0,far=limit;
 for(const axis of ['x','y','z']){const a=box.min[axis],b=box.max[axis],v=direction[axis],o=origin[axis];
  if(Math.abs(v)<1e-9){if(o<a||o>b)return null;continue;}
  const t1=(a-o)/v,t2=(b-o)/v;near=Math.max(near,Math.min(t1,t2));far=Math.min(far,Math.max(t1,t2));if(near>far)return null;
 }return near<=limit&&far>=0?near:null;
}
function terrainHit(origin,direction,height,limit){
 const above=t=>{const x=origin.x+direction.x*t,z=origin.z+direction.z*t;return origin.y+direction.y*t-height(x,z);};
 if(above(0)<=0)return 0;
 for(let t=4;t<=limit+4;t+=4){const end=Math.min(t,limit);if(above(end)<=0){let lo=Math.max(0,end-4),hi=end;for(let k=0;k<10;k++){const mid=(lo+hi)/2;if(above(mid)>0)lo=mid;else hi=mid;}return hi;}if(end===limit)break;}
 return limit;
}
function firstHit(origin,direction,candidates,obstacles,height,limit=MAX_RANGE){
 let distance=terrainHit(origin,direction,height,limit),target=null;
 for(const box of obstacles){const t=rayBox(origin,direction,box,distance);if(t!==null&&t<=distance)distance=t;}
 for(const c of candidates){if(!c.visible||!c.alive||!Number.isFinite(c.distance)||c.distance<0||c.distance>=distance)continue;distance=c.distance;target=c.target;}
 return {target,distance,point:{x:origin.x+direction.x*distance,y:origin.y+direction.y*distance,z:origin.z+direction.z*distance}};
}
function orbitCenter(x,y,width,height,radius=ORBIT_RADIUS){const pad=radius+48;return {x:Math.max(pad,Math.min(width-pad,x)),y:Math.max(pad,Math.min(height-pad,y))};}
function aim(ride,view){return {yaw:ride.a+Math.PI/2+(view.yaw-ride.startYaw),pitch:Math.max(-1.45,Math.min(-.12,-.9+view.pitch-ride.startPitch))};}
const api={DURATION_SECONDS,ORBIT_RADIUS,MAX_RANGE,DAMAGE,rayBox,terrainHit,firstHit,orbitCenter,aim};
if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29Gunnery=api;
})();
