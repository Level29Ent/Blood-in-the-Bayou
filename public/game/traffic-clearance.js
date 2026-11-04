'use strict';
(function(){
function intersectsCar(c,x,y,a,r){
 const co=Math.cos(a),si=Math.sin(a),hx=c.spec.len/2+3,hy=c.spec.wid/2+3,rx=r.x+r.w/2,ry=r.y+r.h/2,dx=rx-x,dy=ry-y;
 // Separating-axis test for the oriented whole car versus a wall/footprint.
 return Math.abs(dx)<=r.w/2+hx*Math.abs(co)+hy*Math.abs(si)&&Math.abs(dy)<=r.h/2+hx*Math.abs(si)+hy*Math.abs(co)&&Math.abs(dx*co+dy*si)<=hx+r.w/2*Math.abs(co)+r.h/2*Math.abs(si)&&Math.abs(-dx*si+dy*co)<=hy+r.w/2*Math.abs(si)+r.h/2*Math.abs(co);
}
function clear(c,x,y,a,map,tileAt,roads){
 const rects=(map.buildings||[]).concat(map.fortressWalls||[],map.fortressGates||[]);
 if(rects.some(r=>intersectsCar(c,x,y,a,r)))return false;
 const co=Math.cos(a),si=Math.sin(a);
 for(const f of [-.5,0,.5])for(const s of [-.5,.5]){const px=x+co*c.spec.len*f-si*c.spec.wid*s,py=y+si*c.spec.len*f+co*c.spec.wid*s;if(!roads.includes(tileAt(px,py)))return false;}
 return true;
}
function sweep(c,map,tileAt,roads,distance){const steps=Math.max(1,Math.ceil(distance/6));for(let i=0;i<=steps;i++){const d=distance*i/steps;if(!clear(c,c.x+Math.cos(c.a)*d,c.y+Math.sin(c.a)*d,c.a,map,tileAt,roads))return false;}return true;}
const api={clear,sweep,intersectsCar};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29TrafficClearance=api;
})();
