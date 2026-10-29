'use strict';
(function(){
function route(points,reserved,T,W,H,water){
 const pad=T*2.25,mask=new Uint8Array(W*H),pos=k=>({x:(k%W+.5)*T,y:(Math.floor(k/W)+.5)*T});
 for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++){const px=(x+.5)*T,py=(y+.5)*T;if(!water(px,py)&&!reserved.some(b=>px>b.x-pad&&px<b.x+b.w+pad&&py>b.y-pad&&py<b.y+b.h+pad))mask[y*W+x]=1;}
 const nearest=p=>{let best=-1,dist=Infinity;for(let k=0;k<mask.length;k++)if(mask[k]){const q=pos(k),d=(q.x-p.x)**2+(q.y-p.y)**2;if(d<dist){best=k;dist=d;}}return best;};
 const start=nearest(points[0]),end=nearest(points[points.length-1]);if(start<0||end<0)return null;
 const q=[start],prev=new Int32Array(mask.length);prev.fill(-2);prev[start]=-1;
 for(let i=0;i<q.length;i++){const k=q[i];if(k===end){const path=[];for(let n=end;n!==-1;n=prev[n])path.push(pos(n));return path.reverse();}
 for(const n of [k-1,k+1,k-W,k+W])if(mask[n]&&prev[n]===-2){prev[n]=k;q.push(n);}}
 return null;
}
if(typeof module!=='undefined')module.exports={route};if(typeof window==='undefined')return;
const gen=genCity;
genCity=function(){const c=gen.apply(this,arguments);if(!c.world)return c;
 const reserved=c.buildings.concat([c.farm,c.recreationParcel,c.airportParcel].filter(Boolean)),water=(x,y)=>c.g[Math.floor(y/TILE)*MW+Math.floor(x/TILE)]===T_WATER;c.roadDetours=[];
 for(const curve of c.curves||[]){if(!curve.pts.some(p=>reserved.some(b=>level29SiteLayout.contains(b,p.x,p.y,TILE*2.25))))continue;
 const next=route(curve.pts,reserved,TILE,MW,MH,water);if(!next)throw Error('No safe scenic-road route for '+curve.id);
 curve.pts=next;c.roadDetours.push(curve.id);const xs=next.map(p=>p.x),ys=next.map(p=>p.y);curve.box=[Math.min(...xs)-260,Math.min(...ys)-260,Math.max(...xs)+260,Math.max(...ys)+260];
 // The visual road and driveable tile network agree; reserved parcels retain their original zoning.
 for(const p of next)for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const x=Math.floor(p.x/TILE)+dx,y=Math.floor(p.y/TILE)+dy,px=(x+.5)*TILE,py=(y+.5)*TILE;if(water(px,py)||reserved.some(b=>level29SiteLayout.contains(b,px,py,TILE*.5)))continue;c.g[y*MW+x]=T_ROAD;}
 }
 c.trees=c.trees.filter(t=>!c.curves.some(k=>k.pts.some(p=>Math.hypot(p.x-t.x,p.y-t.y)<72)));indexTrees(c);return c;
};
})();
