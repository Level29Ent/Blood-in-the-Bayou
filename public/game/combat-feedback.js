'use strict';
(function(){
if(typeof window==='undefined')return;let ends=0;const fire=fireWeapon;fireWeapon=function(){const n=bullets.length,result=fire.apply(this,arguments);if(bullets.length>n)ends=frame+180;return result;};
const tick=update;update=function(){tick.apply(this,arguments);if(state!=='play'||!player)return;const p=player.car||player;for(const s of survivors){if(s.dead||s.following||s.inCar||frame>ends||dist(s.x,s.y,p.x,p.y)>260)continue;const dx=s.x-p.x,dy=s.y-p.y,d=Math.max(1,Math.hypot(dx,dy));moveCircle(s,dx/d*.8,dy/d*.8,7);}
 // Existing armed foot actors use a reachable lateral position under player fire;
 // collision and LOS still decide damage, no movement through cover.
 if(frame%30===0&&frame<ends)for(const g of window.level29Territories?.gangs||[]){if(g.hp<=0||dist(g.x,g.y,p.x,p.y)>250)continue;const a=Math.atan2(g.y-p.y,g.x-p.x)+Math.PI/2,x=g.x+Math.cos(a)*12,y=g.y+Math.sin(a)*12;if(!blockedCircle(x,y,8)){g.x=x;g.y=y;}}};
const renderBase=render;render=function(){renderBase.apply(this,arguments);if(state!=='play'||!player)return;const a=level29CityCareers?.active;if(a){const p=project(a.point.x,a.point.y,terrainHeight(a.point.x,a.point.y)+24);if(p){cx.save();cx.fillStyle='#cfe6b6';cx.font='bold 13px monospace';cx.fillText('C · '+a.kind.toUpperCase(),p.x,p.y);cx.restore();}}};
})();
