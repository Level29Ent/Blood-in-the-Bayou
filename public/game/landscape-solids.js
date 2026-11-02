'use strict';
(function(){
function hit(p,x,y,r){return x+r>p.x&&x-r<p.x+p.w&&y+r>p.y&&y-r<p.y+p.h;}
function connect(c,p,T,W,H,road,water,bridge){
 const reserved=c.buildings.concat([c.farm,c.recreationParcel,c.airportParcel,c.natchezParcel].filter(Boolean));
 const ok=(x,y)=>x>1&&y>1&&x<W-2&&y<H-2&&![water,bridge].includes(c.g[y*W+x])&&!reserved.some(b=>hit(b,(x+.5)*T,(y+.5)*T,T*.48));
 const ring=[];for(let y=p.y/T;y<(p.y+p.h)/T;y++)for(let x=p.x/T;x<(p.x+p.w)/T;x++)if(x===p.x/T||y===p.y/T||x===(p.x+p.w)/T-1||y===(p.y+p.h)/T-1)if(ok(x,y))ring.push(y*W+x);
 const paths=[];for(const start of ring.filter((_,i)=>i%8===0)){const q=[start],prev=new Map([[start,-1]]);let end=-1;for(let i=0;i<q.length;i++){const k=q[i],x=k%W,y=Math.floor(k/W);if(c.g[k]===road){end=k;break;}for(const [xx,yy]of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){const n=yy*W+xx;if(!prev.has(n)&&ok(xx,yy)){prev.set(n,k);q.push(n);}}}if(end>=0){const path=[];for(let k=end;k!==-1;k=prev.get(k))path.push(k);paths.push(path);if(paths.length===2)break;}}
 for(const k of ring.concat(...paths))c.g[k]=road;return paths;
}
if(typeof module!=='undefined')module.exports={hit,connect};if(typeof window==='undefined')return;
const gen=genCity;genCity=function(){const c=gen.apply(this,arguments);if(c.world&&c.mallParcel)c.mallAccessPaths=connect(c,c.mallParcel,TILE,MW,MH,T_ROAD,T_WATER,T_BRIDGE);return c;};
const blocked=blockedCircle;blockedCircle=function(x,y,r){const height=player&&moverCtx===player&&city?.mall?.floor>0?city.mall.floor*56:0;if(!height)for(const p of [...(city?.landscapeSolids||[]),...(city?.lightPoleSolids||[])])if(hit(p,x,y,r))return true;return blocked.apply(this,arguments);};
})();
