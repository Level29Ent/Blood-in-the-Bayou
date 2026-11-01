'use strict';
(function(){
function overlap(a,b,pad=0){return a.x<b.x+b.w+pad&&a.x+a.w>b.x-pad&&a.y<b.y+b.h+pad&&a.y+a.h>b.y-pad;}
function reserve(c,T,W,H,blockedTiles,park){
 c.amenityMoves=[];const cemeteries=c.features.filter(f=>f.kind==='cemetery');
 for(const f of cemeteries){const forbidden=c.buildings.concat(c.features.filter(o=>o!==f&&o.kind!=='forest'),c.activityParcels||[],[c.farm,c.recreationParcel,c.airportParcel,c.natchezParcel,c.mallParcel].filter(Boolean));
  // The whole cemetery, including its entrance sign, needs its own parcel.
  let onBlocked=false;for(let y=Math.floor(f.y/T);y<Math.ceil((f.y+f.h)/T);y++)for(let x=Math.floor(f.x/T);x<Math.ceil((f.x+f.w)/T);x++)if(blockedTiles.includes(c.g[y*W+x]))onBlocked=true;
  if(!onBlocked&&!forbidden.some(r=>overlap(f,r,32)))continue;
  let best=null,score=Infinity;
  for(const [w,h]of [[f.w,f.h],[T*7,T*7],[T*6,T*6],[T*5,T*5],[T*4,T*4]]){for(let y=T*4;y+h<(H-4)*T;y+=T)for(let x=T*4;x+w<(W-4)*T;x+=T){const r={x,y,w,h};if(forbidden.some(b=>overlap(r,b,32)))continue;let ok=true;
   for(let yy=y/T;yy<(y+h)/T&&ok;yy++)for(let xx=x/T;xx<(x+w)/T;xx++)if(blockedTiles.includes(c.g[yy*W+xx])){ok=false;break;}
   if(!ok)continue;const d=Math.abs(x-f.x)+Math.abs(y-f.y);if(d<score){best=r;score=d;}
  }if(best)break;}
  if(!best)throw Error('No dedicated cemetery parcel available');const old={...f};Object.assign(f,best);c.amenityMoves.push({kind:f.kind,from:old,to:{...best}});
  for(let y=f.y/T;y<(f.y+f.h)/T;y++)for(let x=f.x/T;x<(f.x+f.w)/T;x++)c.g[y*W+x]=park;
 }
 return c;
}
if(typeof module!=='undefined')module.exports={reserve,overlap};if(typeof window==='undefined')return;
const gen=genCity;genCity=function(){const c=gen.apply(this,arguments);if(!c.world||state==='menu')return c;c.activityParcels=Object.values(window.level29Downtown?.lots||{}).map(l=>({x:l.x0*TILE,y:l.y0*TILE,w:(l.x1-l.x0+1)*TILE,h:(l.y1-l.y0+1)*TILE}));reserve(c,TILE,MW,MH,[T_ROAD,T_BRIDGE,T_WATER,T_BLD],T_PARK);
 const rs=c.features.filter(f=>f.kind==='cemetery');c.trees=c.trees.filter(t=>!rs.some(r=>overlap({x:t.x,y:t.y,w:1,h:1},r,16)));if(c.pineTrees)c.pineTrees=c.pineTrees.filter(t=>!rs.some(r=>overlap({x:t.x,y:t.y,w:1,h:1},r,16)));c.parked=c.parked.filter(t=>!rs.some(r=>overlap({x:t.x,y:t.y,w:1,h:1},r,24)));indexTrees(c);return c;};
})();
