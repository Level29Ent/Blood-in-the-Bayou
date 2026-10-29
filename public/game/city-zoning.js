'use strict';
(function(){
function overlap(a,b,pad=0){return a.x<b.x+b.w+pad&&a.x+a.w>b.x-pad&&a.y<b.y+b.h+pad&&a.y+a.h>b.y-pad;}
function mountain(c,b){return (c.features||[]).some(f=>f.kind==='mountain'&&overlap(b,f,32));}
function valid(c,b,placed,T,W,H,types){
 if(b.x<T*3||b.y<T*3||b.x+b.w>(W-3)*T||b.y+b.h>(H-3)*T||mountain(c,b)||placed.some(p=>overlap(b,p,32)))return false;
 for(let y=Math.floor((b.y-16)/T);y<Math.ceil((b.y+b.h+16)/T);y++)for(let x=Math.floor((b.x-16)/T);x<Math.ceil((b.x+b.w+16)/T);x++)if(types.includes(c.g[y*W+x]))return false;
 return true;
}
if(typeof module!=='undefined')module.exports={overlap,mountain,valid};
if(typeof window==='undefined')return;
const generate=genCity;
genCity=function(){const c=generate.apply(this,arguments);if(!c.world)return c;
 const lots=Object.values(level29Downtown.lots),placed=[],movements=[],removed=[];
 // Fixed waterfront/civic lots and the mansion are reserved before ordinary frontage.
 const order=c.buildings.slice().sort((a,b)=>priority(b)-priority(a));
 function priority(b){return b===c.mansion?.B?100:c.venues.find(v=>v.b===b)?.lotId?90:b===c.casinoVenue?.b?90:b.venue==='residence'?80:['bank','hospital','fire','police','grocery','gym','gas'].includes(b.venue)?70:['armory','garage','spray','business'].includes(b.venue)?60:b.venue==='shelter'?0:10;}
 for(const b of order){
  const old={x:b.x,y:b.y,w:b.w,h:b.h};
  const bad=mountain(c,b)||placed.some(p=>overlap(b,p,32));
  if(!bad){placed.push(b);continue;}
  let best=null,score=Infinity;
  for(let y=6*TILE;y+b.h<(MH-4)*TILE;y+=TILE)for(let x=(GULF_X+7)*TILE;x+b.w<(MW-4)*TILE;x+=TILE){
   const r={x,y,w:b.w,h:b.h};if(!valid(c,r,placed,TILE,MW,MH,[T_WATER,T_ROAD,T_BRIDGE]))continue;
   if(c.basketballReservation&&overlap(r,c.basketballReservation,32)||(c.features||[]).some(f=>['market','basketball','training','skatepark'].includes(f.kind)&&overlap(r,f,16)))continue;
   if(c.farm&&overlap(r,c.farm,64)||lots.some(l=>l.venue?.b!==b&&overlap(r,{x:l.x0*TILE,y:l.y0*TILE,w:(l.x1-l.x0+1)*TILE,h:(l.y1-l.y0+1)*TILE},32)))continue;
   const s=Math.abs(x-old.x)+Math.abs(y-old.y);if(s<score){best=r;score=s;}
  }
  if(!best){
   // Scenic fillers may be removed, but never silently drop a business or mission landmark.
   if(!b.venue&&b.kind==='normal'||b.venue==='shelter'&&c.venues.filter(v=>v.id==='shelter'&&v.kind===c.venues.find(o=>o.b===b)?.kind).length>1){
    removed.push({id:c.venues.find(v=>v.b===b)?.kind||b.kind,x:b.x,y:b.y});c.buildings=c.buildings.filter(o=>o!==b);c.venues=c.venues.filter(v=>v.b!==b);
    for(let y=Math.floor(b.y/TILE);y<Math.ceil((b.y+b.h)/TILE);y++)for(let x=Math.floor(b.x/TILE);x<Math.ceil((b.x+b.w)/TILE);x++)if(!placed.some(p=>overlap({x:x*TILE,y:y*TILE,w:TILE,h:TILE},p)))c.g[y*MW+x]=T_LOT;
    continue;
   }
   throw Error('No lowland clearance for '+(b.venue||b.kind)+' '+old.x+','+old.y+' '+b.w+'x'+b.h+' placed '+placed.length);
  }
  const dx=best.x-old.x,dy=best.y-old.y;b.x=best.x;b.y=best.y;
  for(let y=Math.floor(old.y/TILE);y<Math.ceil((old.y+old.h)/TILE);y++)for(let x=Math.floor(old.x/TILE);x<Math.ceil((old.x+old.w)/TILE);x++)if(c.g[y*MW+x]!==T_WATER&&!placed.some(p=>overlap({x:x*TILE,y:y*TILE,w:TILE,h:TILE},p)))c.g[y*MW+x]=T_LOT;
  const v=c.venues.find(v=>v.b===b);if(v){for(const k of ['doorX','stationX','workerX'])if(Number.isFinite(v[k]))v[k]+=dx;for(const k of ['doorY','stationY','workerY'])if(Number.isFinite(v[k]))v[k]+=dy;
   for(const r of [...(v.colliderWalls||[]),...(v.colliderDoor?[v.colliderDoor]:[]),...(v.furniture||[])]){r.x+=dx;r.y+=dy;}v.streetAccessible=false;
  }
  const l=lots.find(l=>l.venue?.b===b);if(l){const tx=dx/TILE,ty=dy/TILE;for(const k of ['x0','x1'])l[k]+=tx;for(const k of ['y0','y1'])l[k]+=ty;if(l.fb){for(const k of ['x0','x1'])l.fb[k]+=tx;for(const k of ['y0','y1'])l.fb[k]+=ty;}l.door.x+=dx;l.door.y+=dy;for(const r of l.inventory||[]){r.x+=dx;r.y+=dy;}}
  if(c.residence?.b===b)for(const p of [c.residence.lobby,c.residence.garage]){p.x+=dx;p.y+=dy;}
  for(let y=Math.floor(b.y/TILE);y<Math.ceil((b.y+b.h)/TILE);y++)for(let x=Math.floor(b.x/TILE);x<Math.ceil((b.x+b.w)/TILE);x++)c.g[y*MW+x]=v?T_LOT:T_BLD;
  movements.push({id:v?.id||b.kind,from:old,to:{...best}});placed.push(b);
 }
 // Resolve fresh entrances through walkable lowland without crossing another building.
 for(const v of c.venues){const start=Math.floor((v.doorY+24)/TILE)*MW+Math.floor(v.doorX/TILE),q=[start],prev=new Map([[start,-1]]);let end=-1;
 for(let i=0;i<q.length;i++){const k=q[i],x=k%MW,y=Math.floor(k/MW);if([T_ROAD,T_BRIDGE].includes(c.g[k])){end=k;break;}for(const [xx,yy]of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){const n=yy*MW+xx,r={x:(xx+.5)*TILE-10,y:(yy+.5)*TILE-10,w:20,h:20};if(xx<2||yy<2||xx>=MW-2||yy>=MH-2||prev.has(n)||c.g[n]===T_WATER||c.buildings.some(b=>overlap(r,b))||c.farm&&overlap(r,c.farm,16))continue;prev.set(n,k);q.push(n);}}
 if(end<0)throw Error('No clear street entrance for '+v.id);for(let k=end;k!==-1;k=prev.get(k))if(![T_ROAD,T_BRIDGE].includes(c.g[k]))c.g[k]=T_WALK;v.streetAccessible=true;
 }
 c.zoningMoves=movements;c.zoningRemoved=removed;c.trees=c.trees.filter(t=>!c.buildings.some(b=>overlap({x:t.x,y:t.y,w:1,h:1},b,32)));c.parked=c.parked.filter(p=>!c.buildings.some(b=>overlap({x:p.x,y:p.y,w:1,h:1},b,48)));indexTrees(c);return c;
};
})();
