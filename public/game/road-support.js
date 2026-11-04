'use strict';
(function(){
function supported(c,x,y,a,map,water,T=32){const h=map.heightAt(x,y),co=Math.cos(a),si=Math.sin(a);for(const f of [-.5,0,.5])for(const side of [-.5,0,.5]){const px=x+co*c.spec.len*f-si*c.spec.wid*side,py=y+si*c.spec.len*f+co*c.spec.wid*side;if(Math.abs(map.heightAt(px,py)-h)>12)return false;if(c.boat&&map.get(Math.floor(px/T),Math.floor(py/T))!==water)return false;}return true;}
if(typeof module!=='undefined')module.exports={supported};if(typeof window==='undefined')return;
function validateBoats(){if(!city?.world)return;for(const c of cars){if(!c.boat&&!c.dead&&c.ai&&city.interstateSurface?.(c.x,c.y)!=null&&!supported(c,c.x,c.y,c.a,city,T_WATER,TILE)){c.dead=true;c.gone=true;c.v=c.vs=0;}if(!c.boat||c.dead||supported(c,c.x,c.y,c.a,city,T_WATER,TILE))continue;const occupied=player?.car===c;if(occupied){c.x=c.safeWater?.x??c.x;c.y=c.safeWater?.y??c.y;c.v=c.vs=0;}if(supported(c,c.x,c.y,c.a,city,T_WATER,TILE))continue;const p=level29WorldSafety.waterSpot(city,c,TILE,city.width,city.height,T_WATER,cars.filter(o=>o!==c&&o.boat&&!o.dead));if(p){c.x=p.x;c.y=p.y;c.a=0;c.z=0;c.v=c.vs=0;}else{if(occupied)player.car=null;c.dead=true;c.gone=true;}}}
const build=buildCity;buildCity=function(){build.apply(this,arguments);validateBoats();};
const drive=updateCar;updateCar=function(c,input){if(!city?.world||c.dead)return drive.apply(this,arguments);const old={x:c.x,y:c.y,a:c.a,z:c.z||0};if(c.boat&&supported(c,c.x,c.y,c.a,city,T_WATER,TILE))c.safeWater={x:c.x,y:c.y};drive.apply(this,arguments);if((c.boat||city.interstateSurface?.(c.x,c.y)!=null||city.interstateSurface?.(old.x,old.y)!=null)&&!supported(c,c.x,c.y,c.a,city,T_WATER,TILE)){Object.assign(c,old);c.v=c.vs=0;if(c.ai){c.ai.input.thr=0;c.ai.input.brake=true;}}};
const tick=update;update=function(){if(frame%120===0)validateBoats();return tick.apply(this,arguments);};
window.level29RoadSupport={supported,validateBoats};
})();
