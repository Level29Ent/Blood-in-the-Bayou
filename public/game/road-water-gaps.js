'use strict';
(function(){
function repair(c,{tile=32,maxGap=7,protectedRects=[]}={}){
 const candidates=new Map(),roads=[1,9],T=tile,W=c.width,H=c.height;
 const protectedAt=(x,y)=>protectedRects.some(b=>x*T<b.x+b.w&&x*T+T>b.x&&y*T<b.y+b.h&&y*T+T>b.y);
 for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
  if(!roads.includes(c.get(x,y)))continue;
  for(const [dx,dy]of [[1,0],[0,1]]){let n=1;while(n<=maxGap&&x+dx*n<W-1&&y+dy*n<H-1&&c.get(x+dx*n,y+dy*n)===4)n++;
   if(n<2||n>maxGap+1||!roads.includes(c.get(x+dx*n,y+dy*n)))continue;
   if(Array.from({length:n-1},(_,i)=>protectedAt(x+dx*(i+1),y+dy*(i+1))).some(Boolean))continue;
   const a=c.heightAt((x+.5)*T,(y+.5)*T),b=c.heightAt((x+dx*n+.5)*T,(y+dy*n+.5)*T);if(Math.abs(a-b)>2)continue;
   candidates.set(x+','+y+','+dx,{x,y,dx,dy,n});
  }
 }
 const tiles=new Map();for(const p of candidates.values()){
  // Never turn one-tile walking piers or isolated shore roads into causeways.
  if(![-1,1].some(s=>{const q=candidates.get((p.x-p.dy*s)+','+(p.y+p.dx*s)+','+p.dx);return q&&q.n===p.n;}))continue;
  for(let i=1;i<p.n;i++){const x=p.x+p.dx*i,y=p.y+p.dy*i,k=y*W+x;c.g[k]=9;tiles.set(k,{x:(x+.5)*T,y:(y+.5)*T,dx:p.dx,dy:p.dy});}
 }
 return [...tiles.values()];
}
if(typeof module!=='undefined')module.exports={repair};if(typeof window==='undefined')return;
const gen=genCity;genCity=function(){const c=gen.apply(this,arguments);if(!c.world)return c;const protectedRects=[...c.buildings,...c.features,c.zoo,c.farm,c.militaryBase,c.beach,c.airportParcel,c.themePark?.rect,c.riverboatHub?.b,...Object.values(c.nolaLandmarks?.sites||{}),...Object.values(c.survivalLandmarks?.sites||{})].filter(b=>b&&b.w&&b.h);c.repairedWaterRoads=repair(c,{protectedRects});return c;};
const build=buildCity;buildCity=function(){const result=build.apply(this,arguments);if(!city?.repairedWaterRoads?.length)return result;city.waterGapRails=[];const g=new THREE.Group();g.name='Continuous road water crossings';const q=level29World.batch(g),concrete=level29World.material('#777e79'),paint=level29World.material('#d4d2bb'),keys=new Set(city.repairedWaterRoads.map(p=>Math.floor(p.y/32)*city.width+Math.floor(p.x/32)));
 for(const p of city.repairedWaterRoads){const h=city.heightAt(p.x,p.y);q.box(32,2,32,p.x,h-1,p.y,concrete);q.box(p.dx?18:1,.14,p.dx?1:18,p.x,h+.12,p.y,paint);
  for(const side of [-1,1]){const x=p.x-p.dy*side*32,y=p.y+p.dx*side*32,k=Math.floor(y/32)*city.width+Math.floor(x/32);if(keys.has(k)||[1,9].includes(city.get(Math.floor(x/32),Math.floor(y/32))))continue;const px=p.x-p.dy*side*15,py=p.y+p.dx*side*15;const w=p.dx?32:1.5,d=p.dx?1.5:32;city.waterGapRails.push({x:px-w/2,y:py-d/2,w,h:d});q.box(w,3,d,px,h+1.5,py,concrete);}
 }q.finish();cityGroup.add(g);return result;};const blocked=blockedCircle;blockedCircle=function(x,y,r){if(city?.waterGapRails?.some(b=>hitRect(x,y,r,b)))return true;return blocked.apply(this,arguments);};window.level29RoadWaterGaps={repair};
})();
