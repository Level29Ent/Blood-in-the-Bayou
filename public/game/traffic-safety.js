'use strict';
(function(){
const update=updateCar;updateCar=function(c,input){
 if(!c.ai||c.boat||c.driven)return update.apply(this,arguments);
 const old={x:c.x,y:c.y,a:c.a},check=level29TrafficClearance,roads=[T_ROAD,T_BRIDGE];
 // A restored/spawned AI car already intersecting a wall is not safe traffic.
 if(!check.clear(c,c.x,c.y,c.a,city,tileAt,roads)){c.dead=true;c.gone=true;c.v=c.vs=0;return;}
 update.apply(this,arguments);
 // Circle physics only protects the car center. Validate the final full chassis
 // too, including turn rotation and any lateral collision slide.
 if(!check.clear(c,c.x,c.y,c.a,city,tileAt,roads)){
  Object.assign(c,old);c.v=c.vs=0;c.steerSmooth=0;c.ai.input.thr=0;c.ai.input.brake=true;
 }
};
})();
