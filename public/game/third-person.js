'use strict';
(function(){
function pose(p,yaw,pitch,base,aiming=false){const pitchSafe=Math.max(-1.1,Math.min(1.1,Number(pitch)||0)),distance=aiming?29:48,shoulder=aiming?3:8,co=Math.cos(yaw),si=Math.sin(yaw),anchor={x:p.x,y:base+17+(p.jumpHeight||0),z:p.y};return {anchor,desired:{x:p.x-co*distance-si*shoulder,y:anchor.y+9-Math.sin(pitchSafe)*distance*.7,z:p.y-si*distance+co*shoulder},look:{x:p.x+co*220,y:anchor.y+Math.sin(pitchSafe)*220,z:p.y+si*220},distance};}
// Sweep, don't just test the endpoint: thin walls cannot be skipped. Padding includes near-plane margin.
function sweep(anchor,desired,blocked,step=2){const dx=desired.x-anchor.x,dy=desired.y-anchor.y,dz=desired.z-anchor.z,len=Math.hypot(dx,dy,dz),n=Math.max(1,Math.ceil(len/step));for(let i=1;i<=n;i++){const t=i/n,p={x:anchor.x+dx*t,y:anchor.y+dy*t,z:anchor.z+dz*t};if(blocked(p)){const safe=Math.max(0,(i-2)/n);return {x:anchor.x+dx*safe,y:anchor.y+dy*safe,z:anchor.z+dz*safe,ratio:safe};}}return {...desired,ratio:1};}
const api={pose,sweep};if(typeof module!=='undefined')module.exports=api;if(typeof window==='undefined')return;
let wanted=false;try{wanted=localStorage.getItem('level29.camera.v1')==='third';}catch(_){}
let active=false,owner=null,lastCar=null,footApplied=false,carChase=false,displayModels=null,sourceVM=null,held=null,heldId='',avatar=null,hiddenVM=null,priorVMVisible=true;
function special(){return !!(window.level29NolaActivities?.match||window.level29Wardrobe?.dressing||window.level29Scope?.scoped||window.level29CityStories?.cutscene||window.level29Prologue?.peaceful||window.level29Downtown?.ride||window.level29Apache?.active||window.level29Park?.active||window.level29Coast?.ride||window.level29Subterranean?.active||window.level29MetroTravel?.underground||window.level29MetroTravel?.trip||window.level29Destinations?.swimming);}
function allowed(){return !!player&&!player.dead&&!player.car&&['play','pause'].includes(state)&&!special();}
function set(value){wanted=!!value;try{localStorage.setItem('level29.camera.v1',wanted?'third':'first');}catch(_){}refresh();if(state==='play')toast(wanted?'THIRD PERSON · C TO RETURN':'FIRST PERSON');return wanted;}
function refresh(){for(const b of buttons){b.textContent=wanted?'VIEW · THIRD PERSON · C':'VIEW · FIRST PERSON · C';b.setAttribute('aria-pressed',String(wanted));}}
function detach(){held?.parent?.remove(held);held=null;heldId='';}
function body(){const rig=window.level29Wardrobe?.localAvatar;if(!rig)return;avatar=rig;if(!active){rig.visible=false;detach();return;}rig.visible=true;const moving=Math.hypot(player.vx||0,player.vy||0)>.15;poseFigure(rig,player.x,player.y,view.yaw,moving?player.anim:Math.PI/2,'walk');rig.position.y=terrainHeight(player.x,player.y)+(player.jumpHeight||0);if(!moving){rig.userData.legL.rotation.z=0;rig.userData.legR.rotation.z=0;}
 if(sourceVM!==vmScene){detach();sourceVM=vmScene;displayModels=null;}
 if(!displayModels&&window.level29ArsenalVisuals&&gun)displayModels=level29ArsenalVisuals.createDisplayModels();
 const peaceful=window.level29Prologue?.peaceful;if(peaceful){detach();return;}if(heldId!==curW||held?.parent!==rig.userData.body){detach();const model=displayModels?.[curW];if(model){held=model;heldId=curW;held.position.set(5,12,2);held.rotation.set(0,-Math.PI/2,0);held.scale.setScalar(curW==='rpg'?.4:.55);held.visible=true;rig.userData.body.add(held);}}
 if(held){rig.userData.armL.rotation.z=-1.1;rig.userData.armR.rotation.z=-1.25;held.rotation.x=0;held.rotation.z=-Math.max(-.7,Math.min(.7,view.pitch||0));}
}
const buttons=[];function button(parent){if(!parent)return;const b=document.createElement('button');b.type='button';b.style.cssText='min-height:44px;padding:8px 12px;touch-action:manipulation';b.onclick=e=>{e.stopPropagation();set(!wanted);};for(const type of['pointerdown','pointerup','touchstart','touchend'])b.addEventListener(type,e=>e.stopPropagation());parent.appendChild(b);buttons.push(b);}
button(document.getElementById('pauseControls'));button(document.getElementById('hudMapActions'));refresh();
const place=placeCamera;placeCamera=function(){
 // Keep independent on-foot preference without changing C's original cockpit/chase choice.
 if(owner!==player){owner=player;lastCar=null;footApplied=false;active=false;detach();}
 if(player?.car){if(footApplied){view.chase=carChase;footApplied=false;}lastCar=player.car;carChase=!!view.chase;}else{if(lastCar){carChase=!!view.chase;lastCar=null;}if(!footApplied)carChase=!!view.chase;view.chase=wanted&&allowed();footApplied=true;}
 const yaw=place.apply(this,arguments);active=false;if(!wanted||!allowed()||!camera)return yaw;
 const base=terrainHeight(player.x,player.y),p=pose(player,view.yaw,view.pitch,base,!!(mouse.down||keys.f||keys.j||touch.shoot||player.flash>0));
 const inside=city?.venues?.some(v=>insideVenue(v,player)),ceiling=window.level29Streamed?.active?base+24:base+39;
 const previous=moverCtx;let result;try{moverCtx=player;result=sweep(p.anchor,p.desired,q=>{if(blockedCircle(q.x,q.z,4))return true;const ground=terrainHeight(q.x,q.z);if(!Number.isFinite(ground)||Math.abs(ground-base)>8||q.y<ground+4)return true;return (inside||window.level29Streamed?.active)&&q.y>ceiling;});}finally{moverCtx=previous;}
 if(Math.hypot(result.x-player.x,result.z-player.y)<12){view.chase=false;return yaw;} // camera too close: retain original eye camera and hide avatar.
 camera.position.set(result.x,result.y,result.z);camera.lookAt(p.look.x,p.look.y,p.look.z);camera.updateMatrixWorld(true);active=true;return yaw;
};
const dynamic=syncDynamic;syncDynamic=function(){const r=dynamic.apply(this,arguments);window.level29Wardrobe?.syncLocalAvatar();body();return r;};
const vm=syncViewModel;syncViewModel=function(){if(hiddenVM){hiddenVM.visible=priorVMVisible;hiddenVM=null;}const r=vm.apply(this,arguments);if(active&&vmScene){hiddenVM=vmScene;priorVMVisible=vmScene.visible;vmScene.visible=false;}return r;};
const draw=render;render=function(){if(avatar)avatar.visible=false;const r=draw.apply(this,arguments);for(const b of buttons)if(b.parentNode?.id==='hudMapActions')b.style.display=state==='play'&&!player?.dead?'':'none';return r;};
window.level29ThirdPerson={...api,set,toggle:()=>set(!wanted),get enabled(){return wanted;},get active(){return active;}};
})();
