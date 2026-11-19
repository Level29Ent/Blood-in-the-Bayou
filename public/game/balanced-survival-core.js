'use strict';
(function(){
const LIMIT=3;
function restore(raw){return {v:1,enabled:raw?.enabled!==false,read:[...new Set((Array.isArray(raw?.read)?raw.read:[]).filter(x=>['landing','clinic','shelter'].includes(x)))],claimed:[...new Set((Array.isArray(raw?.claimed)?raw.claimed:[]).filter(x=>['landing','clinic','shelter'].includes(x)))],kits:Math.max(0,Math.min(LIMIT,Math.floor(Number(raw?.kits)||0))),quiet:0};}
function claim(s,id){if(!['landing','clinic','shelter'].includes(id)||s.claimed.includes(id)||s.kits>=LIMIT)return false;s.claimed.push(id);s.kits++;return true;}
function heal(s,hp,max){if(s.kits<1||hp>=max||hp<=0)return null;s.kits--;return Math.min(max,hp+25);}
function prepare(s){if(s.kits<1)return false;s.kits--;s.quiet=120;return true;}
function role(z,water){if(z.type!=='walker'||z.nolaScreamer||z.nolaArmored||z.storyOperation||z.anthonyStory||z.heavyArmor||z.storyScale)return null;return water?'bank-lurker':z.v<.12?'listener':z.v>.9?'drifter':null;}
function direction(px,py,sx,sy,yaw){return Math.atan2(sy-py,sx-px)-yaw;}
const api={restore,claim,heal,prepare,role,direction,LIMIT};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.BalancedSurvivalCore=api;
})();
