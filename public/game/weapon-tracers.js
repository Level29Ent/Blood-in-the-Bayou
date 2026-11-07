'use strict';
(function(){
const MUZZLES={m240:[0,.43,-16.7],shotgun:[0,.6,-15.68],pistol:[0,.65,-3.95],smg:[0,.4,-8.32],carbine:[0,.4,-13.72],marksman:[0,.4,-13.72]};
function muzzlePoint(id,weapon){if(MUZZLES[id])return MUZZLES[id];if(weapon){const length=weapon.speed>30?20:weapon.pellets>1?15:12;return [length,0,0];}return null;}
function projectMuzzle(T,node,viewCamera,worldCamera,distance=22){node.updateWorldMatrix(true,false);viewCamera.updateMatrixWorld(true);worldCamera.updateMatrixWorld(true);const ndc=node.getWorldPosition(new T.Vector3()).project(viewCamera),ray=new T.Raycaster();ray.setFromCamera(new T.Vector2(ndc.x,ndc.y),worldCamera);const forward=new T.Vector3();worldCamera.getWorldDirection(forward);const denom=ray.ray.direction.dot(forward);return ray.ray.origin.clone().addScaledVector(ray.ray.direction,distance/Math.max(.05,denom));}
// Visual parallax joins the existing horizontal simulation path. Never change bullet x/y, damage or spread.
function pointAt(shot,b,distance){const speed=Math.max(.001,Math.hypot(b.vx,b.vy)),x=shot.x+b.vx/speed*distance,z=shot.z+b.vy/speed*distance,t=Math.min(1,Math.max(0,distance/120));return {x:shot.muzzle.x+(x-shot.muzzle.x)*t,y:shot.muzzle.y+(shot.height-shot.muzzle.y)*t,z:shot.muzzle.z+(z-shot.muzzle.z)*t};}
function segment(shot,b){const d=Math.hypot(b.x-shot.x,b.y-shot.z),speed=Math.hypot(b.vx,b.vy),tail=Math.max(0,d-Math.max(70,speed*2.4));return {head:pointAt(shot,b,d),tail:pointAt(shot,b,tail)};}
if(typeof module!=='undefined')module.exports={MUZZLES,muzzlePoint,projectMuzzle,segment};if(typeof window==='undefined')return;if(window.level29TracerReview){window.level29TracerReview={muzzlePoint,projectMuzzle,segment};return;}
let lastShot=null,flashSprite=null,flashOwner=null;const anchors=new WeakMap();
function model(id){if(id==='m240')return gun;return window.level29Progression?.viewModel(id)||extraWeap?.[id]||null;}
function anchor(id){const m=model(id);if(!m)return null;let a=anchors.get(m);if(a)return a;const w=window.level29Progression?.NEW_WEAPONS.find(w=>w.id===id),p=muzzlePoint(id,w);if(!p)return null;a=new THREE.Object3D();a.name='muzzle:'+id;a.position.set(...p);a.userData.noBatch=true;m.add(a);anchors.set(m,a);return a;}
const fire=fireWeapon;fireWeapon=function(){const n=bullets.length,id=curW,result=fire.apply(this,arguments);if(!player||player.dead||window.level29Downtown?.ride||view.chase||!muzzlePoint(id,window.level29Progression?.NEW_WEAPONS.find(w=>w.id===id)))return result;for(const b of bullets.slice(n)){if(b.owner||b.snowball||b.life<=0)continue;const x=player.car?.x??player.x,z=player.car?.y??player.y;b.visualShot={id,x,z,height:terrainHeight(x,z)+(player.car?12:13),muzzle:null};lastShot={id,frame};}return result;};
const sync=syncViewModel;syncViewModel=function(){sync.apply(this,arguments);if(!vmScene||!camera||!vmCam||!bulletLines)return;if(flashOwner!==vmScene){flashSprite?.parent?.remove(flashSprite);flashSprite?.material.dispose();flashSprite=new THREE.Sprite(new THREE.SpriteMaterial({map:starTex,color:'#ffe7ad',transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending}));flashSprite.scale.set(2.5,2.5,1);flashSprite.userData.noBatch=true;vmScene.add(flashSprite);flashOwner=vmScene;}
 const m=model(curW),a=anchor(curW),active=state==='play'&&!player?.dead&&!view.chase&&!window.level29Downtown?.ride&&m?.visible&&a;
 if(gun?.userData.flash&&curW==='m240')gun.userData.flash.visible=!!(active&&lastShot?.id===curW&&frame-lastShot.frame<3);
 flashSprite.visible=!!(active&&curW!=='m240'&&lastShot?.id===curW&&frame-lastShot.frame<3);if(flashSprite.visible){a.updateWorldMatrix(true,false);a.getWorldPosition(flashSprite.position);flashSprite.material.rotation=frame*.7;}
 if(active&&player.flash>0){const origin=projectMuzzle(THREE,a,vmCam,camera);muzzleLight.position.copy(origin);}
 const attr=bulletLines.geometry.attributes.position;let i=0;for(const b of bullets){if(i>=600)break;const s=b.visualShot;if(s){if(!s.muzzle){const n=anchor(s.id);if(n&&model(s.id)?.visible)s.muzzle=projectMuzzle(THREE,n,vmCam,camera);else s.muzzle={x:s.x,y:s.height,z:s.z};}const line=segment(s,b);attr.setXYZ(i*2,line.head.x,line.head.y,line.head.z);attr.setXYZ(i*2+1,line.tail.x,line.tail.y,line.tail.z);}i++;}attr.needsUpdate=true;
};
window.level29WeaponTracers={muzzlePoint,projectMuzzle,segment,getAnchor:anchor};
})();
