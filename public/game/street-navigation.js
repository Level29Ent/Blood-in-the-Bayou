'use strict';
(function(){
// A compact cardinal graph built once per map, shared by street actors. No diagonal corner cutting.
function graph(c,T,W,H,allowed){
 const mask=new Uint8Array(W*H),obstacles=new Uint8Array(W*H);
 // Rasterize static footprints once instead of scanning all buildings/trees for every tile.
 for(const b of c.buildings){const x0=Math.max(1,Math.floor((b.x-12)/T)),x1=Math.min(W-2,Math.floor((b.x+b.w+12)/T)),y0=Math.max(1,Math.floor((b.y-12)/T)),y1=Math.min(H-2,Math.floor((b.y+b.h+12)/T));for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const px=(x+.5)*T,py=(y+.5)*T;if(px>b.x-12&&px<b.x+b.w+12&&py>b.y-12&&py<b.y+b.h+12)obstacles[y*W+x]=1;}}
 for(const t of c.trees||[]){for(let y=Math.max(1,Math.floor((t.y-16)/T));y<=Math.min(H-2,Math.floor((t.y+16)/T));y++)for(let x=Math.max(1,Math.floor((t.x-16)/T));x<=Math.min(W-2,Math.floor((t.x+16)/T));x++)if(Math.hypot(t.x-(x+.5)*T,t.y-(y+.5)*T)<16)obstacles[y*W+x]=1;}
 for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if(allowed.includes(c.g[y*W+x])&&!obstacles[y*W+x])mask[y*W+x]=1;
 const key=(x,y)=>Math.floor(y/T)*W+Math.floor(x/T),point=k=>({x:(k%W+.5)*T,y:(Math.floor(k/W)+.5)*T});
 const nearest=(x,y,radius=0)=>{let best=-1,d=Infinity;const cx=Math.max(0,Math.min(W-1,Math.floor(x/T))),cy=Math.max(0,Math.min(H-1,Math.floor(y/T)));const visit=(xx,yy)=>{if(xx<0||yy<0||xx>=W||yy>=H)return;const k=yy*W+xx;if(!mask[k])return;const p=point(k),v=(p.x-x)**2+(p.y-y)**2;if((v<d||v===d&&(best<0||k<best))&&(!radius||walkable(p.x,p.y,radius))){best=k;d=v;}};
  for(let r=0;r<Math.max(W,H);r++){const left=cx-r,right=cx+r,top=cy-r,bottom=cy+r;for(let xx=left;xx<=right;xx++){visit(xx,top);if(r)visit(xx,bottom);}for(let yy=top+1;yy<bottom;yy++){visit(left,yy);if(r)visit(right,yy);}
   // Minimum possible distance to any tile center outside the searched rectangle.
   const next=Math.min(left>0?x-((left-1+.5)*T):Infinity,right<W-1?(right+1+.5)*T-x:Infinity,top>0?y-((top-1+.5)*T):Infinity,bottom<H-1?(bottom+1+.5)*T-y:Infinity);
   if(best>=0&&next>0&&d<next*next)return best;
   if(left<=0&&right>=W-1&&top<=0&&bottom>=H-1)break;
  }return best;};
 const fields=new Map(),endpoints=new Map();
 const endpoint=(x,y)=>{const k=key(x,y);if(mask[k])return k;if(!endpoints.has(k)){if(endpoints.size>64)endpoints.clear();endpoints.set(k,nearest(x,y));}return endpoints.get(k);};
 function field(target){if(fields.has(target))return fields.get(target);const out=new Int32Array(mask.length);out.fill(-1);if(target<0)return out;const q=[target];out[target]=target;
  for(let i=0;i<q.length;i++){const k=q[i],x=k%W,y=Math.floor(k/W);for(const n of [x>0?k-1:-1,x<W-1?k+1:-1,y>0?k-W:-1,y<H-1?k+W:-1])if(n>=0&&mask[n]&&out[n]<0){out[n]=k;q.push(n);}}
  if(fields.size>=8)fields.delete(fields.keys().next().value);fields.set(target,out);return out;
 }
 const walkable=(x,y,r=0)=>[[0,0],[r,0],[-r,0],[0,r],[0,-r]].every(([dx,dy])=>{const xx=Math.floor((x+dx)/T),yy=Math.floor((y+dy)/T);return xx>=0&&yy>=0&&xx<W&&yy<H&&!!mask[yy*W+xx];});
 function goal(actor,x,y){let at=key(actor.x,actor.y),target=key(x,y);if(!mask[target])target=endpoint(x,y);if(!mask[at])return null;const next=field(target)[at];if(next<0)return point(at);
  // Center in the present tile before taking a right-angle turn into the next one.
  const a=point(at),b=point(next);if(next!==at&&((b.x===a.x&&Math.abs(actor.x-a.x)>2)||(b.y===a.y&&Math.abs(actor.y-a.y)>2)))return a;return b;
 }
 return {mask,point,nearest,walkable,goal};
}
function venueIndex(venues,cell=256){const buckets=new Map();for(const v of venues){const b=v.b;if(!b)continue;for(let y=Math.floor(b.y/cell);y<=Math.floor((b.y+b.h)/cell);y++)for(let x=Math.floor(b.x/cell);x<=Math.floor((b.x+b.w)/cell);x++){const key=x+','+y;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(v);}}return (x,y,r=0)=>{const found=new Set();for(let yy=Math.floor((y-r)/cell);yy<=Math.floor((y+r)/cell);yy++)for(let xx=Math.floor((x-r)/cell);xx<=Math.floor((x+r)/cell);xx++)for(const v of buckets.get(xx+','+yy)||[])found.add(v);return [...found];};}
function indoors(c,p,candidates=c.venues||[]){p=p?.car&&typeof p.car==='object'?p.car:p;return !!(p&&(candidates.some(v=>p.x>v.b.x+3&&p.x<v.b.x+v.b.w-3&&p.y>v.b.y+3&&p.y<v.b.y+v.b.h-3)||c.residence&&p.x>c.residence.b.x+3&&p.x<c.residence.b.x+c.residence.b.w-3&&p.y>c.residence.b.y+3&&p.y<c.residence.b.y+c.residence.b.h-3));}
if(typeof module!=='undefined')module.exports={graph,indoors,venueIndex};if(typeof window==='undefined')return;
let forCity=null,nav=null,venueCity=null,venueCount=-1,queryVenues=null;
function nearVenues(x,y,r=0){if(venueCity!==city||venueCount!==city.venues.length){venueCity=city;venueCount=city.venues.length;queryVenues=venueIndex(city.venues);}return queryVenues(x,y,r);}
function get(){if(!city?.world)return null;if(forCity!==city){forCity=city;nav=graph(city,TILE,MW,MH,[T_ROAD,T_WALK,T_BRIDGE]);}return nav;}
window.isPlayerInsideBuilding=(p=player)=>!!city&&indoors(city,p,p?nearVenues((p.car||p).x,(p.car||p).y):[]);
window.level29Navigation={nearVenues,get graph(){return get();}};
const bossUpdate=updateBoss;updateBoss=function(){if(isPlayerInsideBuilding())return;return bossUpdate.apply(this,arguments);};
const carDamage=damageCar;damageCar=function(c){if(isPlayerInsideBuilding({car:c}))return;return carDamage.apply(this,arguments);};
const hurt=hurtPlayer;hurtPlayer=function(){if(isPlayerInsideBuilding())return;return hurt.apply(this,arguments);};
const spawn=spawnZombieAt;spawnZombieAt=function(x,y,type){const n=get();if(n){if(indoors(city,{x,y},nearVenues(x,y)))return null;if(!n.walkable(x,y,14)){const k=n.nearest(x,y,14);if(k<0)return null;const p=n.point(k);x=p.x;y=p.y;}}return spawn.call(this,x,y,type);};
const goalBase=zombieGoal;zombieGoal=function(z,x,y){const n=get();if(!n)return goalBase.apply(this,arguments);return n.goal(z,x,y)||{x:z.x,y:z.y};};
const move=moveCircle;moveCircle=function(e,dx,dy,r){const n=get(),survivor=typeof survivors!=='undefined'&&survivors.includes(e),streetActor=e!==player&&(e.alive!==undefined||e===boss||survivor);
 if(!n||!streetActor||survivor&&e.inCar)return move.apply(this,arguments);
 // Off-network spawn points are normalized once. Staff, pets and club dancers are not street actors.
 if(!n.walkable(e.x,e.y,r)){const k=n.nearest(e.x,e.y,r);if(k<0)return true;const p=n.point(k);e.x=p.x;e.y=p.y;}
 if(survivor&&e.following||e===boss){const p=player.car||player,g=n.goal(e,p.x,p.y);if(g){const d=Math.hypot(g.x-e.x,g.y-e.y),s=Math.min(Math.hypot(dx,dy),d);dx=d?(g.x-e.x)/d*s:0;dy=d?(g.y-e.y)/d*s:0;}}
 // Reject the entire off-network step, rather than clipping diagonally through a parcel.
 if(!n.walkable(e.x+dx,e.y+dy,r))return true;
 return move.call(this,e,dx,dy,r);
};
})();
