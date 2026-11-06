'use strict';
(function(){
function quote(v,owned=[]){const area=(v?.b?.w||96)*(v?.b?.h||96),base=area>=45000?65000:area>=22000?40000:25000;return Math.round(base*(1+Math.min(1.5,owned.length*.15))/500)*500;}
function purchase(v,data,balance){const cost=quote(v,data.owned);if(v?.id!=='business'||v.privateResidence||data.owned.includes(v.key)||!Number.isFinite(balance)||balance<cost)return null;data.owned.push(v.key);return {balance:balance-cost,cost};}
if(typeof module!=='undefined')module.exports={quote,purchase};if(typeof window!=='undefined')window.level29BusinessEconomy={quote,purchase};
})();
