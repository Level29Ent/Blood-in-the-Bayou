'use strict';
(function(){
function intersectsCar(c,x,y,a,r){
 const co=Math.cos(a),si=Math.sin(a),hx=c.spec.len/2+3,hy=c.spec.wid/2+3,rx=r.x+r.w/2,ry=r.y+r.h/2,dx=rx-x,dy=ry-y;
 // Separating-axis test for the oriented whole car versus a wall/footprint.
 return Math.abs(dx)<=r.w/2+hx*Math.abs(co)+hy*Math.abs(si)&&Math.abs(dy)<=r.h/2+hx*Math.abs(si)+hy*Math.abs(co)&&Math.abs(dx*co+dy*si)<=hx+r.w/2*Math.abs(co)+r.h/2*Math.abs(si)&&Math.abs(-dx*si+dy*co)<=hy+r.w/2*Math.abs(si)+r.h/2*Math.abs(co);
}
function clear(c,x,y,a,map,tileAt,roads,candidates){
 const rects=candidates||(map.buildings||[]).concat(map.fortressWalls||[],map.fortressGates||[]);
 if(rects.some(r=>intersectsCar(c,x,y,a,r)))return false;
 const co=Math.cos(a),si=Math.sin(a);
 for(const f of [-.5,0,.5])for(const s of [-.5,.5]){const px=x+co*c.spec.len*f-si*c.spec.wid*s,py=y+si*c.spec.len*f+co*c.spec.wid*s;if(!roads.includes(tileAt(px,py)))return false;}
 return true;
}
function sweep(c,map,tileAt,roads,distance){const steps=Math.max(1,Math.ceil(distance/6)),co=Math.cos(c.a),si=Math.sin(c.a),endX=c.x+co*distance,endY=c.y+si*distance,extent=Math.hypot(c.spec.len/2+3,c.spec.wid/2+3),minX=Math.min(c.x,endX)-extent,maxX=Math.max(c.x,endX)+extent,minY=Math.min(c.y,endY)-extent,maxY=Math.max(c.y,endY)+extent;
 // Broad phase once per sweep; keep the exact same whole-chassis SAT and six-unit samples.
 const candidates=(map.buildings||[]).concat(map.fortressWalls||[],map.fortressGates||[]).filter(r=>r.x<=maxX&&r.x+r.w>=minX&&r.y<=maxY&&r.y+r.h>=minY);
 for(let i=0;i<=steps;i++){const d=distance*i/steps;if(!clear(c,c.x+co*d,c.y+si*d,c.a,map,tileAt,roads,candidates))return false;}return true;}

const api={clear,sweep,intersectsCar};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29TrafficClearance=api;
})();
