'use strict';
(function(){
const LENGTH=18;
function beat(id,t){t=Math.max(0,Math.min(LENGTH,t));const phase=Math.min(2,Math.floor(t/6));const captions={garageVideo:['AHMAD · The X29 formula is ready for a controlled test.','AHMAD · A measured dose. No shortcuts.','AHMAD · Now we wait for the reaction.'],mallVideo:['Ahmad has given X29 to the seated man.','AHMAD · Stay seated. Tell me how you feel.','Something is wrong. The first signs of the outbreak appear.'],ronnieVideo:['RONNIEBABY · Get away from them!','Ronniebaby strikes back against the zombies.','The zombies are down. Ronniebaby clears the street.']};if(!captions[id])throw Error('Unknown story cutscene');return {t,phase,caption:captions[id][phase],done:t>=LENGTH};}
// Copy visual nodes, not userData: live rigs store object references there.
// Bake skinned positions into a still mesh so no live skeleton is shared/mutated.
function copyActor(T,source,resources){
 if(!source)throw Error('Story character is not ready');const mapping=new Map();
 source.updateWorldMatrix(true,true);
 function copy(o){let n;if(o.isSprite||o.isLight)return null;
  if(o.isMesh){let geometry=o.geometry;if(o.isSkinnedMesh){geometry=geometry.clone();resources.geometries.add(geometry);const p=geometry.attributes.position,v=new T.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);o.boneTransform(i,v);p.setXYZ(i,v.x,v.y,v.z);}geometry.computeVertexNormals();geometry.computeBoundingSphere();}
   const mats=(Array.isArray(o.material)?o.material:[o.material]).map(m=>{const a=m.clone();resources.materials.add(a);return a;});n=new T.Mesh(geometry,Array.isArray(o.material)?mats:mats[0]);
  }else n=new T.Group();mapping.set(o,n);n.position.copy(o.position);n.quaternion.copy(o.quaternion);n.scale.copy(o.scale);n.visible=o.visible;for(const child of o.children){const c=copy(child);if(c)n.add(c);}return n;
 }
 const root=copy(source);root.visible=true;root.position.set(0,0,0);root.rotation.set(0,0,0);const body=mapping.get(source.userData.body);if(body){body.position.y=.6;body.rotation.set(0,0,0);}for(const limb of ['armL','armR','legL','legR'])mapping.get(source.userData[limb])?.rotation.set(0,0,0);return {root,arm:mapping.get(source.userData.armR),legL:mapping.get(source.userData.legL),legR:mapping.get(source.userData.legR)};
}
function start({T,mount,id,actors,onEnd=()=>{},onError=()=>{},rendererFactory,raf=requestAnimationFrame,cancel=cancelAnimationFrame,hidden=()=>document.hidden}){
 beat(id,0);const resources={geometries:new Set(),materials:new Set()},scene=new T.Scene(),camera=new T.PerspectiveCamera(48,16/9,.1,500);scene.background=new T.Color(id==='ronnieVideo'?'#272d39':'#24363e');scene.add(new T.HemisphereLight('#fff2d6','#334449',2));const sun=new T.DirectionalLight('#fff0d4',1.6);sun.position.set(30,60,50);scene.add(sun);
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-label','Animated in-game story scene');canvas.style.cssText='display:block;width:100%;height:auto;aspect-ratio:16/9;max-height:52dvh;object-fit:contain;background:#14232b';
 const caption=document.createElement('p');caption.setAttribute('aria-live','polite');caption.style.cssText='min-height:3em;color:#fff0c9;font:15px/1.5 monospace';mount.appendChild(canvas);mount.appendChild(caption);
 let renderer=null,handle=null,disposed=false,time=0,last=null,ended=false,lastCaption='';const cast=[];
 function cleanup(){if(disposed)return;disposed=true;if(handle!==null)cancel(handle);for(const g of resources.geometries)g.dispose();for(const m of resources.materials)m.dispose();renderer?.dispose();renderer?.forceContextLoss?.();canvas.remove();caption.remove();}
 function box(w,h,d,x,y,z,color){const geo=new T.BoxGeometry(w,h,d),mat=new T.MeshStandardMaterial({color,roughness:.8});resources.geometries.add(geo);resources.materials.add(mat);const m=new T.Mesh(geo,mat);m.position.set(x,y,z);scene.add(m);return m;}
 function actor(source,x,z){const a=copyActor(T,source,resources);a.root.position.set(x,0,z);scene.add(a.root);cast.push(a);return a;}
 try{
  renderer=rendererFactory?rendererFactory(canvas):new T.WebGLRenderer({canvas,antialias:false,powerPreference:'low-power'});renderer.setPixelRatio(1);renderer.setSize(640,360,false);renderer.outputEncoding=T.sRGBEncoding;
  box(150,1,120,0,-1,0,'#5b6261');box(150,55,2,0,26,-40,id==='ronnieVideo'?'#8c8173':'#647376');
  let lead,resident,vial,bat,victims=[];
  if(id==='garageVideo'){
   lead=actor(actors.ahmad,-8,0);lead.root.rotation.y=.25;
   box(36,2,18,12,10,0,'#aeb9b2');for(const x of [-3,27])box(2,10,14,x,4,0,'#53646c');box(20,14,8,-35,7,-20,'#506579');
   vial=box(2,5,2,8,14,0,'#83d89c');box(6,8,5,22,15,0,'#c6d5db');box(14,1,10,15,12,0,'#c5d5d6');
  }else if(id==='mallVideo'){
   lead=actor(actors.ahmad,-18,0);resident=actor(actors.seated,10,0);resident.root.position.y=-2.6;
   box(16,2,13,10,6,0,'#7d6154');box(16,17,2,10,13,-6,'#7d6154');for(const x of [4,16])box(1.5,6,10,x,2,0,'#353f46');
   vial=box(2,5,2,15,8,0,'#83d89c');box(12,2,12,22,5,0,'#a6a49a');for(const x of [-40,40])box(24,25,2,x,20,-38,'#a4c1c5');
  }else{
   lead=actor(actors.ronnie,0,0);bat=box(2,19,2,7,14,0,'#76513a');bat.name='Ronniebaby cutscene melee bat';for(let i=0;i<3;i++){const z=actor(actors.zombie,15+i*8,-12+i*12);z.root.name='Cutscene zombie '+(i+1);const skin=actors.zombie.userData.skin?.color;z.root.traverse(o=>{if(o.material?.color&&skin&&o.material.color.equals(skin))o.material.color.set('#789462');});victims.push(z);}
   for(const x of [-40,40]){box(24,32,22,x,15,-25,'#8a8275');box(18,12,1,x,22,-13,'#526c78');}for(let z=-35;z<50;z+=16)box(1,.1,8,0,0,z,'#d5bb61');
  }
  function frame(now){if(disposed)return;handle=null;if(last!==null&&!hidden())time+=Math.max(0,Math.min(.1,(now-last)/1000));last=now;const b=beat(id,time);if(b.caption!==lastCaption){caption.textContent=b.caption;lastCaption=b.caption;}
   if(id==='garageVideo'){if(lead.arm)lead.arm.rotation.z=-.7-Math.sin(Math.min(b.t,6)/6*Math.PI)*.7;vial.position.y=14+Math.sin(b.t)*.5;vial.rotation.z=b.phase===1?-.5:0;}
   if(id==='mallVideo'){if(lead.arm)lead.arm.rotation.z=-.5;if(resident.legL)resident.legL.rotation.z=-Math.PI/2;if(resident.legR)resident.legR.rotation.z=-Math.PI/2;resident.root.rotation.z=b.phase===2?Math.sin(b.t*8)*.1:0;resident.root.rotation.y=b.phase===2?Math.sin(b.t*5)*.12:0;}
   if(id==='ronnieVideo'){const n=Math.min(2,Math.floor(b.t/5)),local=b.t-n*5;lead.root.position.z=-12+n*12;lead.root.position.x=n*8+Math.sin(Math.min(local,2)/2*Math.PI)*8;bat.position.set(lead.root.position.x+6,16,lead.root.position.z+2);bat.rotation.z=-.5-Math.max(0,Math.sin(local*5))*1.4;if(lead.arm)lead.arm.rotation.z=-Math.max(0,Math.sin(local*5))*1.7;victims.forEach((z,i)=>{const fall=Math.max(0,Math.min(1,(b.t-(i*5+2))/.7));z.root.rotation.z=-fall*Math.PI/2;z.root.position.y=fall*3;z.root.position.x=15+i*8+fall*5;});}
   const angle=b.t*.012;camera.position.set(68*Math.cos(angle),31,75+18*Math.sin(angle));camera.lookAt(0,14,0);try{renderer.render(scene,camera);}catch(error){cleanup();onError(error);return;}
   if(b.done){ended=true;onEnd();return;}handle=raf(frame);
  }
  handle=raf(frame);
 }catch(error){cleanup();throw error;}
 return {dispose:cleanup,get done(){return ended;},get elapsed(){return time;},scene};
}
const api={beat,copyActor,start,LENGTH};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29StoryCutscenes=api;
})();
