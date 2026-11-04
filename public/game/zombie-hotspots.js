'use strict';
(function(){
function zones(c){const out=[];const add=(p,name,radius=480)=>{if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y))out.push({...p,name,radius});};const terminal=c.venues?.find(v=>v.id==='terminal');if(terminal)add({x:terminal.doorX,y:terminal.doorY},'AIRPORT OUTSKIRTS');const garage=c.venues?.find(v=>v.id==='garage'&&!v.careerBusiness&&!v.storyRole);if(garage)add({x:garage.doorX,y:garage.doorY},'INDUSTRIAL STREETS');if(c.farmEntrance)add(c.farmEntrance,'BAYOU APPROACH',420);if(c.neighborhood)add({x:c.neighborhood.decaturX,y:c.neighborhood.bayou.y},'DECATUR BAYOU EDGE',380);return out;}
function protectedPoint(c,p){if(c.zoo&&p.x>c.zoo.x-180&&p.x<c.zoo.x+c.zoo.w+180&&p.y>c.zoo.y-180&&p.y<c.zoo.y+c.zoo.h+180)return true;return (c.venues||[]).some(v=>p.x>v.b.x-20&&p.x<v.b.x+v.b.w+20&&p.y>v.b.y-20&&p.y<v.b.y+v.b.h+20);}
if(typeof module!=='undefined')module.exports={zones,protectedPoint};if(typeof window==='undefined')return;
let current=null,hotspots=[];
const ambient=ambientSpawn;ambientSpawn=function(){if(!city||!player||state!=='play'||player.dead||mpRole==='client'||window.level29Downtown?.ride||window.level29MetroTravel?.underground)return ambient.apply(this,arguments);if(current!==city){current=city;hotspots=zones(city);}const p=player.car||player,near=hotspots.find(z=>Math.hypot(z.x-p.x,z.y-p.y)<z.radius+400);if(!near||protectedPoint(city,p))return ambient.apply(this,arguments);
 const original=randomRoadPoint;randomRoadPoint=function(x,y,min,max){for(let i=0;i<6;i++){const q=original(x,y,Math.max(240,min*.6),Math.min(max,650));if(q&&!protectedPoint(city,q)&&Math.hypot(q.x-near.x,q.y-near.y)<near.radius+180){const count=zombies.reduce((n,z)=>n+(z.alive&&Math.hypot(z.x-q.x,z.y-q.y)<180?1:0),0);if(count<12)return q;}}return null;};
 try{return ambient.apply(this,arguments);}finally{randomRoadPoint=original;}
};
window.level29ZombieHotspots={zones,protectedPoint,get hotspots(){return hotspots;}};
})();
