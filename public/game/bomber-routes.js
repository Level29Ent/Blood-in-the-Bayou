'use strict';
(function(){
const NAMES=['BAYOU CROSSING','DECATUR SWEEP','EAST DISTRICTS','SOUTHERN COMMAND','CITY FIGURE EIGHT','COAST TO COAST'];
function plan(index,width,height){const patterns=[[[.16,.18],[.35,.28],[.68,.2],[.82,.45],[.58,.62],[.25,.82],[.14,.5]],[[.18,.74],[.4,.85],[.65,.75],[.78,.45],[.55,.2],[.3,.35],[.22,.58]],[[.75,.18],[.84,.42],[.72,.7],[.45,.84],[.25,.62],[.45,.38],[.65,.3]],[[.2,.45],[.4,.65],[.8,.78],[.82,.88],[.5,.88],[.25,.78],[.17,.58]],[[.2,.2],[.65,.2],[.8,.5],[.3,.82],[.2,.65],[.65,.45],[.8,.8],[.45,.86]],[[.15,.23],[.25,.6],[.42,.84],[.82,.85],[.8,.52],[.55,.28],[.3,.18]]];return patterns[index%6].map(([x,y])=>({x:x*width,y:y*height}));}
function sample(points,t){const lengths=points.map((p,i)=>Math.hypot(points[(i+1)%points.length].x-p.x,points[(i+1)%points.length].y-p.y)),total=lengths.reduce((a,b)=>a+b,0);let d=((t%1)+1)%1*total;for(let i=0;i<points.length;i++){if(d<=lengths[i]||i===points.length-1){const a=points[i],b=points[(i+1)%points.length],s=d/Math.max(1,lengths[i]);return {x:a.x+(b.x-a.x)*s,y:a.y+(b.y-a.y)*s,heading:Math.atan2(b.y-a.y,b.x-a.x)};}d-=lengths[i];}}
function choose(previous,rng=Math.random){return ((previous<0?0:previous+1)+Math.floor(rng()*5))%6;}
function clearance(c,x,y){let h=(c.heightAt?.(x,y)||0)+210;for(const b of c.buildings||[]){if(x<b.x-90||x>b.x+b.w+90||y<b.y-90||y>b.y+b.h+90)continue;const v=c.venues?.find(v=>v.b===b),top=b===c.residence?.b?1050:v?.id==='hospital'?300:v?Math.max(64,b.H||52):Math.max(100,(b.H||42)*2.4);h=Math.max(h,(b.baseY||0)+top+130);}return h;}
if(typeof module!=='undefined')module.exports={NAMES,plan,sample,choose,clearance};if(typeof window==='undefined')return;window.level29BomberRoutes={NAMES,plan,sample,choose,clearance};
})();
