'use strict';
(function(){
 const profiles={
  ronnie:{name:'Ronniebaby',role:'MISSION CONTACT',width:1.02,jaw:1.06},
  bonnie:{name:'Bonnie De Vette',role:'SLAB MOTORS',width:.94,jaw:.9},
  jojo:{name:'Chief Jojo',role:'MAJOR CAJUN',width:1.08,jaw:1.08},
  alex:{name:'Alex',role:'AK GUN PLUS',width:.98,jaw:1.05},
  dayshawn:{name:'Dayshawn',role:'ELEVATED MELANIN',width:1.05,jaw:1.12},
  felicia:{name:'Felicia',role:'SNOWBALL SHOP',width:.95,jaw:.88},
  sheldon:{name:'Sheldon',role:'SHELDON’S THREADS',width:1,jaw:1.02},
  damion:{name:'Damion',role:'TALENT AGENCY',width:.96,jaw:.94},
 };
 if(typeof module!=='undefined')module.exports={profiles};
 if(typeof window==='undefined')return;
 const labels=new Map(),actors=new Set();
 function label(id){
  if(labels.has(id))return labels.get(id);
  const p=profiles[id],c=document.createElement('canvas');c.width=512;c.height=112;const ctx=c.getContext('2d');
  ctx.fillStyle='#101d25ee';ctx.fillRect(0,0,512,112);ctx.fillStyle='#e5c886';ctx.fillRect(0,0,5,112);
  ctx.textAlign='center';ctx.fillStyle='#fff5df';ctx.font='bold 35px sans-serif';ctx.fillText(p.name,256,48);
  ctx.fillStyle='#d2c2a0';ctx.font='22px monospace';ctx.fillText(p.role,256,88);
  const texture=new THREE.CanvasTexture(c);texture.encoding=THREE.sRGBEncoding;
  const material=new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:true,depthWrite:false,toneMapped:false});
  labels.set(id,material);return material;
 }
 function identify(actor,id){
  const p=profiles[id];if(!p||!actor.userData.head||actor.userData.nameplate)return actor;
  const u=actor.userData;u.head.scale.z*=p.width;if(u.jaw)u.jaw.scale.z*=p.jaw;
  if(u.face)u.face.scale.z*=p.width;
  const tag=new THREE.Sprite(label(id));tag.name='identity:'+id;tag.position.set(0,id==='jojo'?34:29,0);tag.scale.set(27,5.9,1);tag.visible=false;tag.userData.noBatch=true;
  actor.add(tag);u.nameplate=tag;u.identity=id;actors.add(actor);return actor;
 }
 const sync=syncDynamic;
 syncDynamic=function(){sync.apply(this,arguments);if(!camera)return;
  const pos=new THREE.Vector3();
  for(const actor of actors){let root=actor;while(root.parent)root=root.parent;
   if(root!==scene){actors.delete(actor);continue;}
   actor.getWorldPosition(pos);const distance=pos.distanceTo(camera.position);
   actor.userData.nameplate.visible=actor.visible&&state!=='menu'&&distance<160&&distance>12;
  }
 };
 // Neutral expressions and readable eyes retain the original animation/skin hooks.
 // No extra render pass, network asset, skeleton, or per-frame texture generation.
 window.level29People={identify,profiles};
})();
