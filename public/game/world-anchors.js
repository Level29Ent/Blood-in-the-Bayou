'use strict';
// Ground activities must use flat, reachable lowland, not one sampled point on a peak.
(function(){
function clearSite(c,x,y,radius,T,road){
 const box={x:x-radius,y:y-radius,w:radius*2,h:radius*2};
 if((c.features||[]).some(f=>f.kind==='mountain'&&level29SiteLayout.intersects(box,f)))return false;
 if((c.buildings||[]).some(b=>level29SiteLayout.intersects(box,b)))return false;
 if(c.farm&&level29SiteLayout.intersects(box,c.farm))return false;
 if(c.airportParcel&&level29SiteLayout.intersects(box,c.airportParcel))return false;
 if(c.recreationParcel&&level29SiteLayout.intersects(box,c.recreationParcel))return false;
 if(road&&!road(x,y))return false;
 const heights=[];for(const [dx,dy]of [[0,0],[-radius,-radius],[radius,-radius],[-radius,radius],[radius,radius]])heights.push(c.heightAt?c.heightAt(x+dx,y+dy):0);
 return Math.max(...heights)<=4&&Math.max(...heights)-Math.min(...heights)<1.5;
}
if(typeof module!=='undefined')module.exports={clearSite};
if(typeof window==='undefined')return;
window.level29WorldAnchors={clearSite};
const build=buildWorld;
buildWorld=function(){build.apply(this,arguments);if(!city?.world||!world)return;
 const candidates=[];for(let y=4;y<MH-4;y++)for(let x=GULF_X+4;x<MW-4;x++){const px=(x+.5)*TILE,py=(y+.5)*TILE;if(tileAt(px,py)===T_ROAD&&clearSite(city,px,py,48,TILE))candidates.push({x:px,y:py});}
 const used=[];for(const [key,radius]of [['jumps',48],['rampages',24],['packages',12]])for(const item of world[key]){
  if(clearSite(city,item.x,item.y,radius,TILE))continue;
  const choices=candidates.filter(p=>clearSite(city,p.x,p.y,radius,TILE)&&!used.some(q=>dist(q.x,q.y,p.x,p.y)<100));
  choices.sort((a,b)=>dist(a.x,a.y,item.x,item.y)-dist(b.x,b.y,item.x,item.y));const p=choices[0];
  if(p){item.x=p.x;item.y=p.y;used.push(p);}else item.unavailable=true;
 }
 for(const key of ['jumps','rampages','packages'])world[key]=world[key].filter(o=>!o.unavailable);
 const packages=[];for(const p of world.packages)if(!packages.some(q=>dist(p.x,p.y,q.x,q.y)<260)&&packages.length<20)packages.push(p);world.packages=packages;
};
})();
