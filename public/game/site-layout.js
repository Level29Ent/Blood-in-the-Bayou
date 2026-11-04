'use strict';
(function(){
function intersects(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function contains(r,x,y,pad=0){return x>=r.x-pad&&x<=r.x+r.w+pad&&y>=r.y-pad&&y<=r.y+r.h+pad;}
function slots(b,count){
 // Side-wall galleries leave a wide central aisle from the entrance to the dealer.
 const perSide=Math.ceil(count/2),depth=Math.min(18,(b.h-36)/perSide-6),out=[];
 for(let i=0;i<count;i++){
  const side=i%2?-1:1,row=Math.floor(i/2),spacing=(b.h-40)/perSide;
  out.push({x:b.x+b.w/2+side*(b.w/2-22),y:b.y+20+spacing*(row+.5),w:24,d:Math.max(8,depth),top:8});
 }
 return out;
}
function foundation(c,b){const at=c.heightAt||(()=>0),x=b.x+b.w/2;const h=at(x,b.y+b.h+20);return Number.isFinite(h)?Math.max(0,h):0;}
// Route a road centerline around the farm with enough clearance for its full asphalt/verge width.
function detour(points,farm,tile,width,height,buildings,waterAt,clearance=80){
 const r={x:farm.x-clearance,y:farm.y-clearance,w:farm.w+clearance*2,h:farm.h+clearance*2};
 const cross=(a,b)=>{const steps=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/(tile/4)));for(let i=0;i<=steps;i++)if(contains(r,a.x+(b.x-a.x)*i/steps,a.y+(b.y-a.y)*i/steps))return true;return false;};
 let first=-1,last=-1;for(let i=1;i<points.length;i++)if(cross(points[i-1],points[i])){if(first<0)first=i-1;last=i;}
 if(first<0)return points;
 while(first>0&&contains(r,points[first].x,points[first].y))first--;
 while(last<points.length-1&&contains(r,points[last].x,points[last].y))last++;
 const start=points[first],end=points[last],key=(x,y)=>y*width+x,sx=Math.floor(start.x/tile),sy=Math.floor(start.y/tile),ex=Math.floor(end.x/tile),ey=Math.floor(end.y/tile);
 const queue=[key(sx,sy)],prev=new Map([[queue[0],-1]]);let found=-1;
 for(let i=0;i<queue.length;i++){const k=queue[i],x=k%width,y=Math.floor(k/width);if(x===ex&&y===ey){found=k;break;}
 for(const [xx,yy]of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){const n=key(xx,yy),px=(xx+.5)*tile,py=(yy+.5)*tile;
 if(xx<1||yy<1||xx>=width-1||yy>=height-1||prev.has(n)||contains(r,px,py,tile*.75)||waterAt(px,py)||buildings.some(b=>contains(b,px,py,clearance)))continue;
 prev.set(n,k);queue.push(n);}}
 if(found<0)return null;
 const path=[];for(let k=found;k!==-1;k=prev.get(k))path.push({x:(k%width+.5)*tile,y:(Math.floor(k/width)+.5)*tile});path.reverse();
 return points.slice(0,first).concat([start],path,[end],points.slice(last+1));
}
const api={intersects,contains,slots,foundation,detour};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29SiteLayout=api;
})();
