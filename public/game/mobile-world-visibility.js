'use strict';
(function(){
function profile(airborne=false){return airborne?{near:900,far:1500,clip:1700}:{near:360,far:660,clip:760};}
// Only snapshot static scenery; doors, actors, animated props and existing room islands stay owned by their systems.
function islands(T,root){root.updateWorldMatrix(true,true);const result=[];function walk(o){
 if(o.userData.mobileMoving||o.userData.legs||o.userData.noBatch||o.userData.body||o.userData.wheel||o.userData.dynamic||o.userData.vehicles||o.isSkinnedMesh||o.morphTargetInfluences||o.isSprite||o.isLight)return {dynamic:true,box:new T.Box3(),count:0};
 let dynamic=false,count=0;const box=new T.Box3(),parts=[];
 if(o.isMesh&&o.geometry?.attributes?.position){const geo=o.geometry;if(!geo.boundingBox)geo.computeBoundingBox();if(o.isInstancedMesh){const matrix=new T.Matrix4(),world=new T.Matrix4();for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);world.multiplyMatrices(o.matrixWorld,matrix);box.union(geo.boundingBox.clone().applyMatrix4(world));}}else box.union(geo.boundingBox.clone().applyMatrix4(o.matrixWorld));count=1;}
 for(const child of o.children){const part=walk(child);dynamic=dynamic||part.dynamic;count+=part.count;box.union(part.box);parts.push(part);}
 const size=box.getSize(new T.Vector3());if(!dynamic&&count&&Math.max(size.x,size.y,size.z)<=512){return {dynamic:false,box,count,node:o,parts:[]};}
 return {dynamic,box,count,node:null,parts:parts.concat(o.isMesh&&count?[{node:o,box,parts:[]}]:[])};
 }
 function collect(p){if(p.node){result.push({node:p.node,box:p.box,sphere:p.box.getBoundingSphere(new T.Sphere())});return;}for(const child of p.parts||[])collect(child);}
 collect(walk(root));return result;
}
function visible(T,item,camera,frustum,radius){const p=camera.position;return item.box.distanceToPoint(p)<=radius&&frustum.intersectsBox(item.box);}
function draw(T,items,camera,scene,radius,callback){camera.updateMatrixWorld(true);const frustum=new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse)),changed=[];let hidden=0;try{for(const item of items)if(item.node.visible&&!visible(T,item,camera,frustum,radius)){changed.push(item.node);item.node.visible=false;hidden++;}return {result:callback(),hidden};}finally{for(const o of changed)o.visible=true;}}
if(typeof module!=='undefined')module.exports={profile,islands,visible,draw};if(typeof window==='undefined')return;
let owner=null,items=[],rendererOwner=null,hidden=0;
function configure(){if(!renderer||renderer===rendererOwner)return;rendererOwner=renderer;const base=renderer.render.bind(renderer);renderer.render=function(world,cam){if(!window.level29MobileBudget?.mobile||world!==scene||!cityGroup)return base(world,cam);if(owner!==cityGroup){owner=cityGroup;items=islands(THREE,cityGroup);}const p=profile(!!window.level29Downtown?.ride||!!window.level29EstateAircraft?.active),oldFar=cam.far,oldNear=world.fog?.near,oldFogFar=world.fog?.far;try{cam.far=Math.min(oldFar,p.clip);cam.updateProjectionMatrix();if(world.fog){world.fog.near=p.near;world.fog.far=p.far;}const result=draw(THREE,items,cam,world,p.clip,()=>base(world,cam));hidden=result.hidden;return result.result;}finally{cam.far=oldFar;cam.updateProjectionMatrix();if(world.fog){world.fog.near=oldNear;world.fog.far=oldFogFar;}}};}
const baseRender=render;render=function(){configure();return baseRender.apply(this,arguments);};
window.level29MobileVisibility={get hidden(){return hidden;},get count(){return items.length;},profile};
})();
