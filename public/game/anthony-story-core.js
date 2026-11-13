'use strict';
(function(){
const STEPS=['Meet Ant: Superdome pickup','Meet Nora and Elise at the Superdome','Escort both women back to Ant','Talk to Ant: Greenmart errand','Collect condoms at Greenmart checkout','Return the condoms to Ant','Talk to Ant: liquor errand','Collect a bottle at the liquor store','Return to Ant — something is wrong','Help Ant defeat both transformed women','Ant’s neighborhood story complete'];
function restore(v){return {v:1,step:Number.isInteger(v?.step)?Math.max(0,Math.min(10,v.step)):0};}
function checkpoint(v){const s=restore(v);if(s.step===2)s.step=1;if(s.step===9)s.step=8;return s;}
function advance(s,{use=false,atAnt=false,atDome=false,atGreenmart=false,atLiquor=false,escorted=false,cleared=false,playerHelp=false,dead=false,busy=false}={}){if(dead||busy||s.step===10)return false;const ready=[use&&atAnt,use&&atDome,use&&atAnt&&escorted,use&&atAnt,use&&atGreenmart,use&&atAnt,use&&atAnt,use&&atLiquor,atAnt,cleared&&playerHelp][s.step];if(!ready)return false;s.step++;return true;}
const api={STEPS,restore,checkpoint,advance};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29AnthonyCore=api;
})();
