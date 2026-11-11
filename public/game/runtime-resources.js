'use strict';
(function(){
function releaseVehicle(root){if(root.userData.resourcesReleased)return 0;root.userData.resourcesReleased=true;let count=0;for(const m of root.userData.ownedMaterials||[]){m.dispose();count++;}root.userData.ownedMaterials?.clear();for(const g of root.userData.ownedGeometries||[])g.dispose();root.userData.ownedGeometries?.clear();root.parent?.remove(root);return count;}
function removedVehicles(meshes,cars){const live=new Set(cars.filter(c=>!c.gone));return [...meshes].filter(([c])=>!live.has(c));}
function mobileTraffic(cars,position,own,radius=780,limit=16){const near=cars.filter(c=>!c.gone&&c!==own).map(c=>({c,d:Math.hypot(c.x-position.x,c.y-position.z)})).filter(o=>o.d<radius).sort((a,b)=>a.d-b.d);return new Set([...(own?[own]:[]),...near.slice(0,Math.max(0,limit-(own?1:0))).map(o=>o.c)]);}
if(typeof module!=='undefined')module.exports={releaseVehicle,removedVehicles,mobileTraffic};if(typeof window==='undefined')return;
const sync=syncCars;syncCars=function(){for(const [c,m]of removedVehicles(carMeshes,cars)){releaseVehicle(m);carMeshes.delete(c);}return sync.apply(this,arguments);};
const build=buildCity;buildCity=function(){for(const m of carMeshes.values())releaseVehicle(m);return build.apply(this,arguments);};
let lost=false,recovering=false,previousState='pause';const notice=document.createElement('div');notice.id='gpuRecoveryNotice';notice.style.cssText='display:none;position:fixed;inset:0;z-index:150;background:#071116ed;color:#ecd49e;padding:12vh 8vw;box-sizing:border-box;font:18px monospace';notice.textContent='GRAPHICS INTERRUPTED · Your browser paused the graphics device. Gameplay is paused. If the image does not return, reload and use your saved progress.';document.body.appendChild(notice);
addEventListener('webglcontextlost',e=>{if(e.target?.id!=='gl')return;e.preventDefault();lost=true;recovering=false;previousState=state;if(typeof touch!=='undefined')for(const k in touch)touch[k]=false;if(typeof gp!=='undefined')gp.fire=gp.brake=gp.sprint=false;if(typeof stick!=='undefined')stick.x=stick.y=0;if(state==='play'&&!mpRole)state='pause';mouse.down=false;for(const k in keys)keys[k]=false;window.level29Save?.save();notice.style.display='block';},true);
addEventListener('webglcontextrestored',e=>{if(e.target?.id!=='gl'||recovering)return;recovering=true;notice.textContent='RESTORING GRAPHICS · Rebuilding GPU resources…';
 // Three r149 resets its internal GL caches in its own target listener. Run after it.
 queueMicrotask(()=>{try{if(renderer.getContext().isContextLost())throw Error('Graphics device is still unavailable');
   window.level29AdvancedLighting?.engine.dispose();if(window.level29AdvancedLighting)window.level29AdvancedLighting.engine.failed=false;
   window.level29Cinematic?.recover?.();window.level29BayouEffects?.dispose();
   if(typeof restoreVehicleEnvironment==='function')restoreVehicleEnvironment();
   const result=window.level29RuntimePolicy.reupload([scene,typeof vmScene!=='undefined'?vmScene:null]);renderer.resetState();renderer.setRenderTarget(null);renderer.shadowMap.needsUpdate=true;
   window.level29SessionRecovery?.record('graphics-restored',JSON.stringify(result));lost=false;recovering=false;
   notice.replaceChildren();const text=document.createElement('p');text.textContent='GRAPHICS RESTORED · Your game and checkpoint are preserved.';notice.appendChild(text);const resume=document.createElement('button');resume.textContent='RESUME';resume.style.minHeight='44px';resume.onclick=e=>{e.stopPropagation();mouse.down=false;notice.style.display='none';if(previousState==='play'&&state==='pause')state='play';};notice.appendChild(resume);
 }catch(error){recovering=false;lost=true;notice.textContent='GRAPHICS RECOVERY FAILED · Your checkpoint is saved. Close and reopen the game to continue.';window.level29SessionRecovery?.record('recovery-failed',error.message);}});
},true);
const renderBase=render;render=function(){if(lost)return;return renderBase.apply(this,arguments);};window.level29RuntimeResources={releaseVehicle,removedVehicles,mobileTraffic,get lost(){return lost;}};
})();
