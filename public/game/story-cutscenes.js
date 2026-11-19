'use strict';
(function(){
const LENGTH=18;
const staging=typeof module!=='undefined'?require('./story-cinema-staging.js'):window.level29StoryStaging;
function beat(id,t){t=Math.max(0,Math.min(LENGTH,t));const phase=Math.min(2,Math.floor(t/6));const captions={garageVideo:['AHMAD · The X29 formula is ready for a controlled test.','AHMAD · A measured dose. No shortcuts.','AHMAD · Now we wait for the reaction.'],mallVideo:['Ahmad has given X29 to the seated man.','AHMAD · Stay seated. Tell me how you feel.','Something is wrong. The first signs of the outbreak appear.'],ronnieVideo:['RONNIEBABY · Get away from them!','Ronniebaby strikes back against the zombies.','The zombies are down. Ronniebaby clears the street.']};if(!captions[id])throw Error('Unknown story cutscene');return {t,phase,caption:captions[id][phase],done:t>=LENGTH};}
// Copy visual nodes, not userData: live rigs store object references there.
// Bake skinned positions into a still mesh so no live skeleton is shared/mutated.
function copyActor(T,source,resources){
 if(!source)throw Error('Story character is not ready');const mapping=new Map();
 source.updateWorldMatrix(true,true);
 function copy(o){let n;if(o.isSprite||o.isLight)return null;
  if(o.isMesh){let geometry=o.geometry;if(o.isSkinnedMesh){geometry=geometry.clone();resources.geometries.add(geometry);const p=geometry.attributes.position,v=new T.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);o.boneTransform(i,v);p.setXYZ(i,v.x,v.y,v.z);}geometry.computeVertexNormals();geometry.computeBoundingSphere();}
   const mats=(Array.isArray(o.material)?o.material:[o.material]).map(m=>{const a=m.clone();a.onBeforeCompile=m.onBeforeCompile;a.customProgramCacheKey=m.customProgramCacheKey;resources.materials.add(a);return a;});n=new T.Mesh(geometry,Array.isArray(o.material)?mats:mats[0]);n.castShadow=n.receiveShadow=true;
  }else n=new T.Group();mapping.set(o,n);n.position.copy(o.position);n.quaternion.copy(o.quaternion);n.scale.copy(o.scale);n.visible=o.visible;for(const child of o.children){const c=copy(child);if(c)n.add(c);}return n;
 }
 const root=copy(source);root.visible=true;root.position.set(0,0,0);root.rotation.set(0,0,0);const visible=o=>{for(let p=o;p&&p!==root;p=p.parent)if(!p.visible)return false;return !!o;};const body=mapping.get(source.userData.body);if(body){body.position.y=.6;body.rotation.set(0,0,0);}for(const limb of ['armL','armR','legL','legR'])mapping.get(source.userData[limb])?.rotation.set(0,0,0);const arm=mapping.get(source.userData.armR);return {root,body,armL:mapping.get(source.userData.armL),arm:visible(arm)?arm:null,legL:mapping.get(source.userData.legL),legR:mapping.get(source.userData.legR)};
}
// This GLB is loaded exclusively for the scene; do not clone/share the live player skeleton.
function animatedActor(T,gltf,resources){
 const rig=gltf.scene,root=new T.Group(),box=new T.Box3().setFromObject(rig),h=box.max.y-box.min.y;if(!Number.isFinite(h)||h<=0)throw Error('Invalid cinematic character bounds');
 const scale=23/h;rig.scale.multiplyScalar(scale);rig.position.y-=box.min.y*scale;root.add(rig);const mixer=new T.AnimationMixer(rig),actions={};
 for(const source of gltf.animations||[]){const clip=source.clone();for(const track of clip.tracks)if(/(?:hips|root).*\.position$/i.test(track.name))for(let i=0;i<track.values.length;i+=3){track.values[i]=0;track.values[i+2]=0;}actions[clip.name]=mixer.clipAction(clip);}
 rig.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;o.frustumCulled=false;resources.geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material]){resources.materials.add(m);for(const t of Object.values(m))if(t?.isTexture)resources.textures.add(t);}}});
 return {root,mixer,actions,rig,hand:rig.getObjectByName('mixamorig:RightHand')||rig.getObjectByName('mixamorigRightHand'),scale};
}
function seatLeg(T,leg,resources){
 if(!leg||leg.children.length<4)return;const parts=leg.children.slice(),upper=parts[0],feet=parts.filter(o=>o.position.y< -6);
 if(!upper.isMesh||!feet.length)return;upper.position.y=-1.8;upper.scale.y*=.48;
 const knee=parts.find(o=>o!==upper&&o.position.y< -3&&o.position.y> -5);if(knee)knee.position.y=-3.6;
 const lower=new T.Group();lower.position.y=-3.6;lower.rotation.z=-1.35;leg.add(lower);
 const geo=new T.CylinderGeometry(1.25,1.05,6.2,12);resources.geometries.add(geo);const shin=new T.Mesh(geo,upper.material);shin.position.y=-3.1;shin.castShadow=shin.receiveShadow=true;lower.add(shin);
 for(const foot of feet){leg.remove(foot);foot.position.y+=1;lower.add(foot);}
 leg.rotation.z=1.35;
}
function start({T,mount,id,actors,onEnd=()=>{},onError=()=>{},rendererFactory,raf=requestAnimationFrame,cancel=cancelAnimationFrame,hidden=()=>document.hidden,loadRonnie}){
 beat(id,0);const resources={geometries:new Set(),materials:new Set(),textures:new Set()},scene=new T.Scene(),camera=new T.PerspectiveCamera(43,16/9,.1,500);scene.background=new T.Color(id==='ronnieVideo'?'#17241f':'#303d35');scene.fog=new T.FogExp2(scene.background,.004);scene.add(new T.HemisphereLight('#b5c2af','#343227',.65));const sun=new T.DirectionalLight(id==='ronnieVideo'?'#a9c4d2':'#ffe1ac',id==='ronnieVideo'?1.5:1.8);sun.position.set(20,65,35);sun.castShadow=true;sun.shadow.mapSize.set(512,512);Object.assign(sun.shadow.camera,{left:-85,right:85,top:85,bottom:-85,near:1,far:180});sun.shadow.normalBias=.12;scene.add(sun);
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-label','Animated in-game story scene');canvas.style.cssText='display:block;width:100%;height:auto;aspect-ratio:16/9;box-shadow:0 8px 30px #0008;max-height:52dvh;object-fit:contain;background:#14232b';
 const caption=document.createElement('p');caption.setAttribute('aria-live','polite');caption.style.cssText='min-height:3em;color:#fff0c9;font:15px/1.5 monospace';mount.appendChild(canvas);mount.appendChild(caption);
 let renderer=null,handle=null,disposed=false,time=0,last=null,ended=false,lastCaption='';const cast=[];let animated=null,actionName='',actionSegment=-1;
 function cleanup(){if(disposed)return;disposed=true;if(handle!==null)cancel(handle);if(animated){animated.mixer.stopAllAction();animated.mixer.uncacheRoot(animated.rig);}for(const t of resources.textures)t.dispose();for(const g of resources.geometries)g.dispose();for(const m of resources.materials)m.dispose();sun.shadow.map?.dispose();sun.shadow.mapPass?.dispose();renderer?.dispose();renderer?.forceContextLoss?.();canvas.remove();caption.remove();}
 function actor(source,x,z){const a=copyActor(T,source,resources);a.root.position.set(x,0,z);scene.add(a.root);cast.push(a);return a;}
 try{
  renderer=rendererFactory?rendererFactory(canvas):new T.WebGLRenderer({canvas,antialias:false,powerPreference:'low-power'});renderer.setPixelRatio(1);renderer.setSize(960,540,false);renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;if(renderer.shadowMap){renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;}
  const set=staging.build(T,scene,resources,id),box=set.box;
  let lead,resident,vial,bat,victims=[];
  function attach(a,prop,x=0,y=-8,z=0){scene.remove(prop);(a.arm||a.root).add(prop);prop.position.set(x,a.arm?y:15,z);}
  if(id==='garageVideo'){
   lead=actor(actors.ahmad,-9,0);vial=set.cylinder(.8,.8,3,0,0,0,'#839d7b');vial.name='Hand-held X29 vial';attach(lead,vial);vial.rotation.z=-.8;
  }else if(id==='mallVideo'){
   lead=actor(actors.ahmad,0,0);resident=actor(actors.seated,12,0);resident.root.name='Seated mall resident';
   vial=set.cylinder(.8,.8,3,0,0,0,'#839d7b');vial.name='Hand-held X29 vial';attach(lead,vial);
   resident.root.rotation.y=-Math.PI/2;seatLeg(T,resident.legL,resources);seatLeg(T,resident.legR,resources);
  }else{
   lead=actor(actors.ronnie,0,0);bat=box(1.5,15,1.5,0,0,0,'#76513a');bat.name='Ronniebaby cutscene melee bat';attach(lead,bat,0,-11,0);
   for(let i=0;i<3;i++){const z=actor(actors.zombie,15+i*8,-12+i*12);z.root.name='Cutscene zombie '+(i+1);const skin=actors.zombie.userData.skin?.color;z.root.traverse(o=>{if(o.material?.color&&skin&&o.material.color.equals(skin))o.material.color.set('#789462');});// The story resident is the infection source: retain identity, add restrained socket/lesion cues.
    for(const side of [-1,1]){const socket=box(.12,1.1,1.15,0,0,0,'#2c3728');scene.remove(socket);z.root.add(socket);socket.position.set(2.2,18.55,side*.85);}
    victims.push(z);}
  }
  if(id==='ronnieVideo'&&loadRonnie){
   Promise.resolve().then(loadRonnie).then(gltf=>{
    const local={geometries:new Set(),materials:new Set(),textures:new Set()},a=animatedActor(T,gltf,local);
    if(disposed||ended){for(const t of local.textures)t.dispose();for(const g of local.geometries)g.dispose();for(const m of local.materials)m.dispose();return;}
    for(const key of Object.keys(local))for(const asset of local[key])resources[key].add(asset);
    scene.remove(lead.root);animated=a;lead={root:a.root};scene.add(a.root);bat.parent?.remove(bat);
    if(a.hand){a.hand.add(bat);const size=a.hand.getWorldScale(new T.Vector3());bat.scale.set(.9/Math.max(.0001,Math.abs(size.x)),13/Math.max(.0001,Math.abs(size.y)),.9/Math.max(.0001,Math.abs(size.z)));bat.position.set(0,0,0);bat.rotation.set(0,0,0);}else a.root.add(bat);
   }).catch(()=>{}); // Retain original actor if optional animated asset is unavailable.
  }
  function frame(now){if(disposed)return;handle=null;if(last!==null&&!hidden())time+=Math.max(0,Math.min(.1,(now-last)/1000));last=now;const b=beat(id,time);if(b.caption!==lastCaption){caption.textContent=b.caption;lastCaption=b.caption;}
   if(id==='garageVideo'){
    // One deliberate inspection/pour/retract gesture; props follow the hand.
    const reach=staging.ease(b.t/3),retract=staging.ease((b.t-10)/3);if(lead.arm)lead.arm.rotation.z=.25+reach*.95-retract*.65;
    vial.rotation.z=-.25-staging.ease((b.t-6)/2)*.65+retract*.7;
    if(lead.body)lead.body.rotation.z=-.035*Math.sin(Math.min(b.t,12)/12*Math.PI);
   }
   if(id==='mallVideo'){
    if(lead.arm)lead.arm.rotation.z=.45+staging.ease(b.t/3)*.8-staging.ease((b.t-7)/2)*.9;
    const distress=staging.ease((b.t-12)/4);if(resident.body)resident.body.rotation.z=distress*.13;
    resident.root.rotation.y=-Math.PI/2+distress*.06*Math.sin(b.t*2);if(resident.arm)resident.arm.rotation.z=.2+distress*.45;
   }
   if(id==='ronnieVideo'){
    const n=Math.min(2,Math.floor(b.t/5)),local=b.t-n*5,approach=staging.ease(local/1.7),swing=staging.ease((local-1.7)/.25)*(1-staging.ease((local-2.15)/.6));
    lead.root.position.set(n*8+approach*5,0,-12+n*12);
    if(animated){const name=local<1.7?'walk':'slash',next=animated.actions[name];if(next){if(actionName!==name||actionSegment!==n){animated.mixer.stopAllAction();next.reset().setLoop(T.LoopOnce,1);next.clampWhenFinished=true;next.play();actionName=name;actionSegment=n;}next.time=local<1.7?local%Math.max(.01,next.getClip().duration):Math.min(next.getClip().duration,(local-1.7)*1.5);animated.mixer.update(0);}lead.root.rotation.y=Math.PI/2;}
    if(lead.arm)lead.arm.rotation.z=.4+swing*1.4;else if(!animated)bat.rotation.z=.4+swing*1.4;
    victims.forEach((z,i)=>{const fall=staging.ease((b.t-(i*5+2.15))/1.15);z.root.rotation.y=Math.PI;z.root.rotation.z=-fall*Math.PI/2;if(z.arm)z.arm.rotation.z=.9;if(z.armL)z.armL.rotation.z=.95;if(z.legL)z.legL.rotation.z=(1-fall)*Math.sin(b.t*2+i)*.1;if(z.legR)z.legR.rotation.z=-(1-fall)*Math.sin(b.t*2+i)*.1;z.root.position.y=fall*3;z.root.position.x=15+i*8+fall*5;});
   }
   const framing=staging.shot(id,b.t);camera.position.fromArray(framing.position);camera.lookAt(...framing.look);if(camera.fov!==framing.fov){camera.fov=framing.fov;camera.updateProjectionMatrix();}
   try{renderer.render(scene,camera);}catch(error){cleanup();onError(error);return;}
   if(b.done){ended=true;onEnd();return;}handle=raf(frame);
  }
  handle=raf(frame);
 }catch(error){cleanup();throw error;}
 return {dispose:cleanup,get done(){return ended;},get elapsed(){return time;},scene};
}
const api={beat,copyActor,animatedActor,seatLeg,start,LENGTH};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29StoryCutscenes=api;
})();
