'use strict';
(function(){
// A bird kill must come from an actual local firearm shot, intersect its
// rendered 3D anatomy, and precede all visible solid scene/terrain hits.
function eligible(shots){return shots.some(b=>!b.owner&&!b.snowball&&b.life>0);}
function visible(object){for(let o=object;o;o=o.parent)if(!o.visible)return false;return true;}
function firstBird(hits,obstacleDistance){return hits.find(h=>h.distance<obstacleDistance&&visible(h.object))||null;}
if(typeof module!=='undefined')module.exports={eligible,firstBird};if(typeof window==='undefined')return;
const tick=update;update=function(){if(typeof wheelOpen!=='undefined'&&wheelOpen){if(state!=='play')openWheel(false,false);else{for(const k of ['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '])keys[k]=false;mouse.down=false;}}return tick.apply(this,arguments);};
const fire=fireWeapon;
fireWeapon=function(){if(typeof wheelOpen!=='undefined'&&wheelOpen)return;const count=bullets.length,result=fire.apply(this,arguments),shots=bullets.slice(count);if(!eligible(shots)||!camera||!window.level29Downtown)return result;
 const birds=level29Downtown.birdTargets.filter(b=>b.alive&&b.mesh?.visible);if(!birds.length)return result;
 camera.updateMatrixWorld(true);const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(0,0),camera);ray.far=900;
 for(const b of birds)b.mesh.updateMatrixWorld(true);
 const hits=ray.intersectObjects(birds.map(b=>b.mesh),true).filter(h=>visible(h.object));if(!hits.length)return result;
 const blockers=[];if(cityGroup)blockers.push(cityGroup);if(typeof carMeshes!=='undefined')for(const m of carMeshes.values())if(m.visible)blockers.push(m);
 for(const pool of [typeof zPool==='undefined'?null:zPool,typeof sPool==='undefined'?null:sPool])for(const m of pool?.map?.values()||[])if(m.visible)blockers.push(m);if(typeof bossMesh!=='undefined'&&bossMesh?.visible)blockers.push(bossMesh);
 for(const m of blockers)m.updateMatrixWorld(true);
 const solid=ray.intersectObjects(blockers,true).find(h=>visible(h.object)&&!h.object.material?.transparent);
 const ground=level29Gunnery.terrainHit(ray.ray.origin,ray.ray.direction,(x,z)=>city.heightAt?.(x,z)||0,900),hit=firstBird(hits,Math.min(ground,solid?.distance??900));
 if(!hit)return result;
 const bird=birds.find(b=>{let o=hit.object;while(o){if(o===b.mesh)return true;o=o.parent;}return false;});
 if(bird&&level29Downtown.hitBird(bird)){const shot=shots.find(b=>!b.owner&&!b.snowball&&b.life>0);if(shot)shot.life=0;}
 return result;
};
})();
