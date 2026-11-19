'use strict';
(function(){
function inPlace(clip){const c=clip.clone();for(const t of c.tracks)if(/(?:hips|root).*\.position$/i.test(t.name))for(let i=0;i<t.values.length;i+=3){t.values[i]=0;t.values[i+2]=0;}return c;}
function stateFor(p,input){if(p.dead)return 'defeat_03';if(input.fire)return 'fire';if(Math.hypot(p.vx||0,p.vy||0)>.25)return input.sprint?'run':'walk';return 'idle';}
class AnimatedPlayer{
 constructor(T,gltf){this.T=T;this.root=gltf.scene;this.mixer=new T.AnimationMixer(this.root);this.actions={};this.current='';this.owner=null;
  for(const clip of gltf.animations||[]){const c=inPlace(clip),a=this.mixer.clipAction(c);if(['fire','defeat_03'].includes(c.name)){a.setLoop(T.LoopOnce,1);a.clampWhenFinished=c.name==='defeat_03';}this.actions[c.name]=a;}
  const source=(gltf.animations||[]).find(c=>c.name==='walk');if(source){const idle=inPlace(source);idle.name='idle';idle.duration=1;for(const t of idle.tracks){const stride=t.getValueSize(),first=t.values.slice(0,stride);t.times=new Float32Array([0,1]);t.values=new Float32Array([...first,...first]);}this.actions.idle=this.mixer.clipAction(idle);}
  this.root.updateMatrixWorld(true);const b=new T.Box3().setFromObject(this.root),h=b.max.y-b.min.y;if(!Number.isFinite(h)||h<=0)throw Error('Invalid animated player bounds');
  const wrapper=new T.Group();wrapper.name='Ronniebaby animated player';this.root.scale.multiplyScalar(23/h);this.root.position.y-=b.min.y*23/h;wrapper.add(this.root);this.model=wrapper;this.model.visible=false;
  this.root.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;o.frustumCulled=false;o.userData.noBatch=true;}});
 }
 update(p,input,dt,base){if(this.owner!==p){this.mixer.stopAllAction();this.current='';this.owner=p;}
  const name=stateFor(p,input),next=this.actions[name]||this.actions.idle;if(next&&(this.current!==name||name==='fire'&&!next.isRunning())){const old=this.actions[this.current];next.reset().setEffectiveWeight(1).play();if(old&&old!==next)old.crossFadeTo(next,.15,false);this.current=name;}
  this.mixer.update(Math.max(0,Math.min(.05,dt)));this.model.position.set(p.x,base+(p.jumpHeight||0),p.y);this.model.rotation.y=Math.PI/2-input.yaw;
 }
 dispose(){this.mixer.stopAllAction();this.mixer.uncacheRoot(this.root);this.model.parent?.remove(this.model);}
}
const api={AnimatedPlayer,inPlace,stateFor};if(typeof module!=='undefined')module.exports=api;if(typeof window==='undefined')return;if(window.level29CharacterReviewMode){window.level29AnimatedPlayer=api;return;}
let instance=null,pending=false,failed=false,last=0,weapon=null,weaponId='',models=null,weaponSource=null;
function load(){if(instance||pending||failed||(typeof renderer==='undefined'||!renderer))return;pending=true;Promise.resolve().then(()=>{window.level29PbrAssets.init(renderer);return window.level29PbrAssets.load('models/Ronniebaby_character.glb');}).then(gltf=>{instance=new AnimatedPlayer(THREE,gltf);window.level29CharacterMaterials?.apply(THREE,instance.model);}).catch(e=>{failed=true;console.warn('Animated player unavailable; retaining wardrobe avatar:',e.message);}).finally(()=>pending=false);}
function heldWeapon(){if(!instance)return;if(window.level29Prologue?.peaceful){weapon?.parent?.remove(weapon);weapon=null;weaponId='';return;}if(typeof vmScene!=='undefined'&&weaponSource!==vmScene){weapon?.parent?.remove(weapon);weapon=null;weaponId='';models=null;weaponSource=vmScene;}const hand=instance.root.getObjectByName('mixamorig:RightHand')||instance.root.getObjectByName('mixamorigRightHand');if(!hand)return;
 if(weaponId===curW)return;weapon?.parent?.remove(weapon);weapon=null;weaponId=curW;models ||= window.level29ArsenalVisuals?.createDisplayModels();const source=models?.[curW];if(!source)return;weapon=source;weapon.position.set(0,0,0);weapon.rotation.set(0,0,-Math.PI/2);weapon.scale.setScalar(.55/instance.root.scale.x);hand.add(weapon);
}
const sync=syncDynamic;syncDynamic=function(){const result=sync.apply(this,arguments),now=performance.now(),dt=last?(now-last)/1000:0;last=now;
 const active=!!window.level29ThirdPerson?.active;if(!active){if(instance)instance.model.visible=false;return result;}
 if(!instance){load();return result;}if(instance.model.parent!==scene)scene.add(instance.model);
 instance.model.visible=state==='play'||state==='pause';const rig=window.level29Wardrobe?.localAvatar;if(rig)rig.visible=false;
 instance.update(player,{yaw:view.yaw,fire:!window.level29Prologue?.peaceful&&!!(mouse.down||keys.f||keys.j||touch.shoot||player.flash>0),sprint:!!(keys.shift||keys.Shift)},state==='play'?dt:0,terrainHeight(player.x,player.y));heldWeapon();return result;
};
window.level29AnimatedPlayer={...api,get instance(){return instance;},get failed(){return failed;}};
})();
