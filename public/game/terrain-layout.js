'use strict';
(function(){
const generate=genCity;
genCity=function(){const c=generate.apply(this,arguments);if(!c.world)return c;
 const lots=Object.values(window.level29Downtown?.lots||{}).map(l=>({x:l.x0*TILE,y:l.y0*TILE,w:(l.x1-l.x0+1)*TILE,h:(l.y1-l.y0+1)*TILE}));
 const desc=Object.getOwnPropertyDescriptor(c,'heightAt');let raw=c.heightAt;
 // Compute each foundation before installing our getter. A plot sits at its entrance elevation,
 // rather than being pulled to sea level in the middle of a hillside.
 const footprints=c.buildings.concat(lots,(c.features||[]).filter(f=>f.kind==='cemetery'),c.farm?[c.farm]:[]);
 const pads=footprints.map(b=>{const venue=(c.venues||[]).find(v=>v.b===b),f=venue?.frontage;const base=f&&c.heightAt?c.heightAt(venue.doorX+f.dx*20,venue.doorY+f.dy*20):level29SiteLayout.foundation(c,b);b.baseY=base;return {x:b.x-36,y:b.y-36,w:b.w+72,h:b.h+72,baseY:base};});
 c.foundationPads=pads;
 const buckets=new Map(),cell=256;for(const b of pads)for(let y=Math.floor((b.y-96)/cell);y<=Math.floor((b.y+b.h+96)/cell);y++)for(let x=Math.floor((b.x-96)/cell);x<=Math.floor((b.x+b.w+96)/cell);x++){const k=x+','+y;if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(b);}
 const influence=(x,y)=>{let weight=0,base=0;for(const b of buckets.get(Math.floor(x/cell)+','+Math.floor(y/cell))||[]){const w=level29Terrain.padWeight(x,y,b,96);if(w>weight){weight=w;base=b.baseY;}}return {weight,base};};
 c.developmentWeight=(x,y)=>influence(x,y).weight;
 const analytic=(x,y)=>{const f=desc?.get?desc.get.call(c):raw;const h=f?f(x,y):0;const b=c.residence?.b;
 if(window.level29OpenWorld?.interior==='apartment'&&b&&x>b.x&&x<b.x+b.w&&y>b.y&&y<b.y+b.h)return h;
 const p=influence(x,y);return h*(1-p.weight)+p.base*p.weight;};
 // Precompute shore distance once; no shoreline scans in the terrain/collision hot path.
 let shore=null;if(typeof MW!=='undefined'&&typeof T_WATER!=='undefined'&&c.g){shore=new Float32Array(c.g.length);shore.fill(4);const q=[];for(let k=0;k<c.g.length;k++)if(c.g[k]===T_WATER){shore[k]=0;q.push(k);}for(let i=0;i<q.length;i++){const k=q[i],x=k%MW,y=Math.floor(k/MW);if(shore[k]>=3)continue;for(const n of [x? k-1:-1,x<MW-1?k+1:-1,y?k-MW:-1,k+MW<c.g.length?k+MW:-1])if(n>=0&&shore[n]>shore[k]+1){shore[n]=shore[k]+1;q.push(n);}}}
 const safeSurface=(x,y)=>{const pier=c.natchezParcel;if(pier&&x>=pier.x&&x<=pier.x+pier.w&&y>=pier.y&&y<=pier.y+pier.h)return 0;const h=analytic(x,y);const b=c.residence?.b;if(window.level29OpenWorld?.interior==='apartment'&&b&&x>b.x&&x<b.x+b.w&&y>b.y&&y<b.y+b.h)return h;if(!shore)return h;const xx=x/TILE-.5,yy=y/TILE-.5,ix=Math.floor(xx),iy=Math.floor(yy),fx=xx-ix,fy=yy-iy,val=(a,b)=>shore[Math.max(0,Math.min(Math.ceil(shore.length/MW)-1,b))*MW+Math.max(0,Math.min(MW-1,a))]||0;
 const d=(val(ix,iy)*(1-fx)+val(ix+1,iy)*fx)*(1-fy)+(val(ix,iy+1)*(1-fx)+val(ix+1,iy+1)*fx)*fy,t=Math.max(0,Math.min(1,d/4));return h*t*t*(3-2*t);};
 const height=(x,y)=>level29Terrain.mountainSurface(c,safeSurface,x,y);
 Object.defineProperty(c,'heightAt',{enumerable:true,configurable:true,get:()=>height,set(f){if(desc?.set)desc.set.call(c,f);else raw=f;}});
 for(const v of c.venues||[]){v.baseY=c.heightAt(v.b.x+v.b.w/2,v.b.y+v.b.h/2);v.b.baseY=v.baseY;
 for(const box of [...(v.colliderWalls||[]),...(v.furniture||[]),...(v.colliderDoor?[v.colliderDoor]:[])]){box.minY=v.baseY;box.maxY=v.baseY+(v.id==='hospital'?280:52);}}
 const pier=c.natchezParcel;if(pier){for(let y=Math.ceil((pier.y+8)/TILE);y<(pier.y+pier.h-8)/TILE;y++)for(let x=Math.ceil((pier.x+8)/TILE);x<(pier.x+pier.w-8)/TILE;x++)c.g[y*MW+x]=T_BRIDGE;const inside=o=>o.x>pier.x-20&&o.x<pier.x+pier.w+20&&o.y>pier.y-20&&o.y<pier.y+pier.h+20;c.trees=c.trees.filter(o=>!inside(o));if(c.pineTrees)c.pineTrees=c.pineTrees.filter(o=>!inside(o));c.rocks=(c.rocks||[]).filter(o=>!inside(o));}
 c.rocks=(c.rocks||[]).filter(r=>c.developmentWeight(r.x,r.y)===0);
 c.trees=c.trees.filter(t=>c.developmentWeight(t.x,t.y)<.5);if(c.pineTrees)c.pineTrees=c.pineTrees.filter(t=>c.developmentWeight(t.x,t.y)<.5);indexTrees(c);
 return c;
};
// Builders use absolute map X/Z but inconsistent Y roots. Normalize the root exactly once,
// before static batching bakes its world transform. Wall/furniture X/Z colliders stay unchanged.
const build=buildVenue;
buildVenue=function(v){build.apply(this,arguments);if(!v.mesh)return;const base=v.baseY||0;v.mesh.position.y=base;
 for(const box of [...(v.colliderWalls||[]),...(v.furniture||[]),...(v.colliderDoor?[v.colliderDoor]:[])]){box.minY=base;box.maxY=base+(v.id==='hospital'?280:52);}
};
})();
