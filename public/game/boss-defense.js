'use strict';
(function(){
const HEALTH_MULTIPLIER=3,ARMOR_DAMAGE_MULTIPLIER=.55;
function enhance(z){if(!z||z.heavyArmor)return z;const old=z.maxHp||z.hp;z.maxHp=Math.round(old*HEALTH_MULTIPLIER);let hp=z.maxHp;Object.defineProperty(z,'hp',{configurable:true,enumerable:true,get:()=>hp,set(value){hp=value<hp?hp-(hp-value)*ARMOR_DAMAGE_MULTIPLIER:value;}});z.heavyArmor=true;z.armorMultiplier=ARMOR_DAMAGE_MULTIPLIER;return z;}
if(typeof module!=='undefined')module.exports={enhance,HEALTH_MULTIPLIER,ARMOR_DAMAGE_MULTIPLIER};if(typeof window==='undefined')return;
window.level29BossDefense={enhance,HEALTH_MULTIPLIER,ARMOR_DAMAGE_MULTIPLIER};
const spawn=spawnBoss;spawnBoss=function(){spawn.apply(this,arguments);enhance(boss);};
// Direct explosive/vehicle/melee kill callbacks must damage armor instead of bypassing HP.
const hud=drawHUD;drawHUD=function(){hud.apply(this,arguments);const encounter=window.level29CityStories?.active;const armored=(boss&&!boss.dead?boss:null)||(encounter?.entities||[]).find(z=>z.alive&&z.heavyArmor);if(armored&&state==='play')hudText('ARMORED BOSS · '+Math.max(0,Math.ceil(armored.hp))+' / '+armored.maxHp+' HP · 45% DAMAGE RESIST',SW/2,SH<500?105:95,11,'#e1c795','center','700 ');};
const kill=killZombie;killZombie=function(z){if(z?.heavyArmor&&z.hp>0){z.hp-=Math.min(140,z.maxHp*.22);z.flash=6;if(z.hp>0)return;}return kill.apply(this,arguments);};
})();
