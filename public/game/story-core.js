'use strict';
(function(){
const INGREDIENTS=['rice','pork','shrimp','alligator','roux'];
const RENTALS={arc:{name:'ARC BROOM',price:450,damage:14,pierce:4,cooldown:7,color:'#69d9ef'},slug:{name:'CAJUN THUNDER',price:650,damage:30,pierce:2,cooldown:22,color:'#e9b56e'}};
function initial(){return {v:1,gumbo:'intro',ingredients:[],alexWins:0,bonnieWins:0};}
function ingredient(s,id){if(s.gumbo!=='ingredients'||!INGREDIENTS.includes(id)||s.ingredients.includes(id))return false;s.ingredients.push(id);if(INGREDIENTS.every(k=>s.ingredients.includes(k)))s.gumbo='return';return true;}
function rent(wallet,id,now){const r=Object.hasOwn(RENTALS,id)&&RENTALS[id];return !r||!Number.isFinite(wallet)||!Number.isFinite(now)||wallet<r.price?null:{id,expires:now+30000,balance:wallet-r.price};}
function sceneBeat(t){if(t<7)return 'prepare';if(t<13)return 'stir';if(t<18)return 'serve';if(t<24)return 'speech';if(t<29)return 'convulse';if(t<32)return 'still';if(t<37)return 'mutate';return 'escape';}
const api={INGREDIENTS,RENTALS,initial,ingredient,rent,sceneBeat};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29StoryCore=api;
})();
