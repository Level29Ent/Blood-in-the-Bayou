'use strict';
(function(){
function releaseVehicle(root){if(root.userData.resourcesReleased)return 0;root.userData.resourcesReleased=true;let count=0;for(const m of root.userData.ownedMaterials||[]){m.dispose();count++;}root.userData.ownedMaterials?.clear();for(const g of root.userData.ownedGeometries||[])g.dispose();root.userData.ownedGeometries?.clear();root.parent?.remove(root);return count;}
function removedVehicles(meshes,cars){const live=new Set(cars.filter(c=>!c.gone));return [...meshes].filter(([c])=>!live.has(c));}
function mobileTraffic(cars,position,own,radius=780,limit=16){const near=cars.filter(c=>!c.gone&&c!==own).map(c=>({c,d:Math.hypot(c.x-position.x,c.y-position.z)})).filter(o=>o.d<radius).sort((a,b)=>a.d-b.d);return new Set([...(own?[own]:[]),...near.slice(0,Math.max(0,limit-(own?1:0))).map(o=>o.c)]);}
if(typeof module!=='undefined')module.exports={releaseVehicle,removedVehicles,mobileTraffic};if(typeof window==='undefined')return;
const sync=syncCars;syncCars=function(){for(const [c,m]of removedVehicles(carMeshes,cars)){releaseVehicle(m);carMeshes.delete(c);}return sync.apply(this,arguments);};
const build=buildCity;buildCity=function(){for(const m of carMeshes.values())releaseVehicle(m);return build.apply(this,arguments);};
let lost=false;const notice=document.createElement('div');notice.id='gpuRecoveryNotice';notice.style.cssText='display:none;position:fixed;inset:0;z-index:150;background:#071116ed;color:#ecd49e;padding:12vh 8vw;box-sizing:border-box;font:18px monospace';notice.textContent='GRAPHICS INTERRUPTED · Your browser paused the graphics device. Gameplay is paused. If the image does not return, reload and use your saved progress.';document.body.appendChild(notice);
addEventListener('webglcontextlost',e=>{if(e.target?.id!=='gl')return;e.preventDefault();lost=true;if(state==='play'&&!mpRole)state='pause';mouse.down=false;for(const k in keys)keys[k]=false;window.level29Save?.save();notice.style.display='block';},true);
addEventListener('webglcontextrestored',e=>{if(e.target?.id!=='gl')return;lost=false;notice.textContent='GRAPHICS RESTORED · Reload to resume from saved progress. The game will not reload automatically.';notice.style.display='block';},true);
const renderBase=render;render=function(){if(lost)return;return renderBase.apply(this,arguments);};window.level29RuntimeResources={releaseVehicle,removedVehicles,mobileTraffic,get lost(){return lost;}};
})();
