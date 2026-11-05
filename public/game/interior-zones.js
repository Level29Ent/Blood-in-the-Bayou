'use strict';
(function(){
function contains3(b,p){return p.x>=b.min.x&&p.x<=b.max.x&&p.y>=b.min.y&&p.y<=b.max.y&&p.z>=b.min.z&&p.z<=b.max.z;}
class ZoneTracker{constructor(){this.inside=new Set();}tick(zones,p,emit){const next=new Set();for(const z of zones){if(!contains3(z.bounds,p))continue;next.add(z.id);if(!this.inside.has(z.id))emit('enter',z);}for(const id of this.inside)if(!next.has(id))emit('exit',{id});this.inside=next;}clear(){this.inside.clear();}}
if(typeof module!=='undefined')module.exports={contains3,ZoneTracker};if(typeof window==='undefined')return;
let owner=null,zones=[],tracker=new ZoneTracker();function rebuild(){owner=city;tracker.clear();zones=(city?.venues||[]).map(v=>({id:v.key||v.name,venue:v,bounds:{min:{x:v.b.x+4,y:v.baseY||0,z:v.b.y+4},max:{x:v.b.x+v.b.w-4,y:(v.baseY||0)+46,z:v.b.y+v.b.h-4}}}));}
const tick=update;update=function(){tick.apply(this,arguments);if(!city||!player)return;if(owner!==city)rebuild();if(state!=='play'||player.car)return;if(frame%10)return;tracker.tick(zones,{x:player.x,y:terrainHeight(player.x,player.y)+8,z:player.y},(kind,z)=>{dispatchEvent(new CustomEvent('level29:interior-zone-'+kind,{detail:{id:z.id,venue:z.venue?.name,mission:window.level29ObjectiveState?.current?.snapshot()||null}}));});};window.level29InteriorZones={ZoneTracker,contains3,get zones(){return zones;}};
})();
