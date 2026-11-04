'use strict';
(function(){
const gen=genCity;
genCity=function(){const c=gen.apply(this,arguments);if(!c.world||!c.farm)return c;
 const f=c.farm,pad=TILE*3,water=(x,y)=>c.g[Math.floor(y/TILE)*MW+Math.floor(x/TILE)]===T_WATER;
 c.farmRoads=[];
 for(const curve of c.curves||[]){const points=level29SiteLayout.detour(curve.pts,f,TILE,MW,MH,c.buildings,water,pad);
  if(!points){throw Error('Farm road cannot be safely rerouted: '+curve.id);}
  if(points===curve.pts)continue;
  curve.pts=points;const xs=points.map(p=>p.x),ys=points.map(p=>p.y);curve.box=[Math.min(...xs)-260,Math.min(...ys)-260,Math.max(...xs)+260,Math.max(...ys)+260];c.farmRoads.push(curve.id);
 }
 // Remove any grid path in the agricultural interior. The allocator already avoids roads,
 // but late footpath generation and save-compatible fixed farm coordinates need this guard.
 for(let y=Math.floor(f.y/TILE);y<Math.ceil((f.y+f.h)/TILE);y++)for(let x=Math.floor(f.x/TILE);x<Math.ceil((f.x+f.w)/TILE);x++)c.g[y*MW+x]=T_GRASS;
 // Explicit one-tile perimeter lane: no agricultural tile is a through-road.
 // The farm allocator reserves a building-free margin, so this loop stays outside structures.
 const x0=Math.floor(f.x/TILE)-1,x1=Math.ceil((f.x+f.w)/TILE),y0=Math.floor(f.y/TILE)-1,y1=Math.ceil((f.y+f.h)/TILE);
 c.farmPerimeter=[];
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(x===x0||x===x1||y===y0||y===y1){
  const px=(x+.5)*TILE,py=(y+.5)*TILE;if(x<1||y<1||x>=MW-1||y>=MH-1||water(px,py)||c.buildings.some(b=>level29SiteLayout.contains(b,px,py,TILE*.49)))continue;
  c.g[y*MW+x]=T_ROAD;c.farmPerimeter.push({x:px,y:py});
 }
 // Curved centerlines, road texture and driving tile types now share one perimeter route.
 for(const id of c.farmRoads){const curve=c.curves.find(k=>k.id===id);
 for(let i=1;i<curve.pts.length;i++){const a=curve.pts[i-1],b=curve.pts[i],n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/8));
  for(let j=0;j<=n;j++){const x=a.x+(b.x-a.x)*j/n,y=a.y+(b.y-a.y)*j/n;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=Math.floor(x/TILE)+dx,yy=Math.floor(y/TILE)+dy,px=(xx+.5)*TILE,py=(yy+.5)*TILE;
    if(xx<1||yy<1||xx>=MW-1||yy>=MH-1||level29SiteLayout.contains(f,px,py,TILE*.5)||water(px,py)||c.buildings.some(b=>level29SiteLayout.contains(b,px,py,TILE)))continue;c.g[yy*MW+xx]=T_ROAD;
   }
  }
 }
 }
 // Vehicles must not spawn in the field or the fresh bypass.
 c.parked=c.parked.filter(p=>!level29SiteLayout.contains(f,p.x,p.y,pad));
 c.trees=c.trees.filter(p=>!level29SiteLayout.contains(f,p.x,p.y,pad));if(c.pineTrees)c.pineTrees=c.pineTrees.filter(p=>!level29SiteLayout.contains(f,p.x,p.y,pad));indexTrees(c);
 return c;
};
})();
