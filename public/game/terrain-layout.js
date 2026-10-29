'use strict';
(function(){
const generate=genCity;
genCity=function(){const c=generate.apply(this,arguments);if(!c.world)return c;
 const lots=Object.values(window.level29Downtown?.lots||{}).map(l=>({x:l.x0*TILE,y:l.y0*TILE,w:(l.x1-l.x0+1)*TILE,h:(l.y1-l.y0+1)*TILE}));
 const pads=c.buildings.concat(lots,c.farm?[c.farm]:[]).map(b=>({x:b.x-12,y:b.y-12,w:b.w+24,h:b.h+24}));
 c.developmentWeight=(x,y)=>{let w=0;for(const b of pads)w=Math.max(w,level29Terrain.padWeight(x,y,b,48));return w;};
 // Keep later heightAt replacements (world construction) subject to the same graded terrain.
 const desc=Object.getOwnPropertyDescriptor(c,'heightAt');let raw=c.heightAt;
 const height=(x,y)=>{const f=desc?.get?desc.get.call(c):raw;const h=f?f(x,y):0;const b=c.residence?.b;if(window.level29OpenWorld?.interior==='apartment'&&b&&x>b.x&&x<b.x+b.w&&y>b.y&&y<b.y+b.h)return h;return h*(1-c.developmentWeight(x,y));};
 Object.defineProperty(c,'heightAt',{enumerable:true,configurable:true,get:()=>height,set(f){if(desc?.set)desc.set.call(c,f);else raw=f;}});
 c.rocks=(c.rocks||[]).filter(r=>c.developmentWeight(r.x,r.y)===0);
 c.trees=c.trees.filter(t=>c.developmentWeight(t.x,t.y)<.5);if(c.pineTrees)c.pineTrees=c.pineTrees.filter(t=>c.developmentWeight(t.x,t.y)<.5);indexTrees(c);
 return c;
};
})();
