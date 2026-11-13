'use strict';
(function(){
const caches=new WeakMap();
function details(T){if(caches.has(T))return caches.get(T);const n=64,skin=new Uint8Array(n*n*4),cloth=new Uint8Array(n*n*4),rough=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const k=(y*n+x)*4,f=Math.sin(x*127.1+y*311.7)*43758.5453%1,p=128+f*7,w=128+Math.sin(x*Math.PI/2)*Math.cos(y*Math.PI/2)*9;skin.set([p,p,p,255],k);cloth.set([w,w,w,255],k);rough.set([225,225,225,255],k);}const tex=data=>{const t=new T.DataTexture(data,n,n);t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t;};const out={skin:tex(skin),cloth:tex(cloth),rough:tex(rough)};caches.set(T,out);return out;}
function apply(T,actor){const u=actor.userData;if(!u.body||u.npcAppearance)return actor;u.npcAppearance=true;const textures=details(T),replacement=new Map();
 for(const key of ['skin','shirt','pants']){const old=u[key];if(!old)continue;const m=new T.MeshStandardMaterial({color:old.color,roughness:key==='skin'?.78:.94,metalness:0,bumpMap:key==='skin'?textures.skin:textures.cloth,bumpScale:key==='skin'?.018:.035,roughnessMap:textures.rough});m.userData.npcFinish=true;replacement.set(old,m);u[key]=m;}
 actor.traverse(o=>{if(o.isMesh)o.material=Array.isArray(o.material)?o.material.map(m=>replacement.get(m)||m):replacement.get(o.material)||o.material;});
 // Existing rigs, named faces, custom hair, infected eyes and GLB replacement hooks are retained.
 // Only add detail to the shared rig; do not change collision, proportions or identity scaling.
 if(!textures.seam)textures.seam=new T.BoxGeometry(.08,.14,1.2);const seam=new T.Mesh(textures.seam,u.shirt);seam.position.set(2.3,12.5,0);u.body.add(seam);
 for(const old of replacement.keys())old.dispose();
 const out=details(T);if(!out.hand){const sphere=()=>new T.SphereGeometry(1,10,8),pieces=[[sphere(),[0,0,0],[.78,.9,.57],'#ffffff']];for(let i=0;i<4;i++)pieces.push([sphere(),[.04,-.7, -.5+i*.31],[.22,.59+(i%2)*.09,.15],'#ffffff']);pieces.push([sphere(),[.57,-.1,.62],[.32,.53,.24],'#ffffff']);out.hand=combine(T,pieces);}
 for(const arm of [u.armL,u.armR]){const hand=arm?.children.find(o=>o.geometry?.type==='SphereGeometry'&&o.position.y< -7);if(hand)hand.geometry=out.hand;}
 return actor;
}
function styleWoman(T,actor,variant=0){const u=actor?.userData;if(!u?.body||u.womanStyle!==undefined)return actor;const i=((Math.trunc(variant)||0)%4+4)%4;u.womanStyle=i;u.gender='woman';
 // Adult, fully clothed everyday silhouettes; retain the rig, identity colors and gameplay footprint.
 u.torso.scale.x*=.93;u.torso.scale.z*=[.88,.95,.94,.91][i];u.head.scale.z*=.97;u.jaw.scale.z*=.94;
 u.hair.visible=true;u.longHair.visible=false;const cache=details(T);if(!cache.hairForm)cache.hairForm=new T.SphereGeometry(1,12,8);
 const styles=[{p:[-.95,18.4,0],s:[1.35,1.75,2.1]},{p:[-2,18.5,0],s:[.85,2,.85]},{p:[-1.25,20.6,0],s:[1.05,1.05,1.05]},{p:[-.3,19.4,0],s:[2.35,1.5,2.35]}],spec=styles[i],hair=new T.Mesh(cache.hairForm,u.hair.material);hair.position.set(...spec.p);hair.scale.set(...spec.s);hair.userData.residentHair=true;u.body.add(hair);u.womanHair=hair;u.hairstyle=['bob','ponytail','bun','natural'][i];
 if(i===2){u.torso.scale.y*=1.12;u.torso.position.y-=.4;}u.outfit=['blouse','jacket','tunic','tee'][i];return actor;
}
function styleResident(T,actor,look){if(!actor?.userData?.body||actor.userData.residentStyle)return actor;const u=actor.userData;u.residentStyle={...look};if(look.gender==='woman')styleWoman(T,actor,look.build||0);u.gender=look.gender;u.heritage=look.heritage;
 if(look.skin)u.skin.color.set(look.skin);if(look.hairColor)u.hair.material.color.set(look.hairColor);
 if(look.hairstyle!=='long'&&!look.hairstyle.startsWith('locs'))return actor;
 // Remove only the additional everyday-style hair, leaving named/mission rigs untouched.
 for(const child of u.body.children.slice())if(child.userData.residentHair)u.body.remove(child);
 u.longHair.visible=false;const cache=details(T);if(!cache.hairForm)cache.hairForm=new T.SphereGeometry(1,12,8);
 const add=(x,y,z,sx,sy,sz)=>{const m=new T.Mesh(cache.hairForm,u.hair.material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.userData.residentHair=true;u.body.add(m);};
 // Hide the old style extension added by styleWoman, not the face/head.
 if(u.womanHair)u.womanHair.visible=false;
 if(look.hairstyle==='long'){for(let i=0;i<6;i++)add(-1.25,16.3,(i-2.5)*.65,.8,3.5,.55);for(const side of [-1,1])add(-.2,17,side*1.95,.65,2.8,.45);}
 else{const tied=look.hairstyle==='locs-tied',length=look.hairstyle==='locs-long'?6:look.hairstyle==='locs-short'?2.5:4;
  for(let i=0;i<18;i++){const a=Math.PI*.35+i/17*Math.PI*1.3,drop=length*(.85+i%3*.075);add(tied?-2.2:-.5+Math.cos(a)*1.5,tied?18.4-i%4*.3:19.4-drop*.5,tied?Math.sin(a)*.7:Math.sin(a)*2.05,.23,tied?2:drop*.56,.26);}if(tied)add(-2,19.8,0,.8,.8,.8);
 }u.hairstyle=look.hairstyle;return actor;
}
function combine(T,pieces){const pos=[],normal=[],color=[];for(const [geometry,position,scale,tint]of pieces){const g=geometry.index?geometry.toNonIndexed():geometry.clone();g.scale(...scale);g.translate(...position);const p=g.attributes.position,n=g.attributes.normal,c=new T.Color(tint);for(let i=0;i<p.count;i++){pos.push(p.getX(i),p.getY(i),p.getZ(i));normal.push(n.getX(i),n.getY(i),n.getZ(i));color.push(c.r,c.g,c.b);}g.dispose();geometry.dispose();}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(normal,3));g.setAttribute('color',new T.Float32BufferAttribute(color,3));return g;}
// Merge facial/anatomical cues into the existing nine crowd batches, not per-person draw calls.
function crowdGeometry(T,kind){const sphere=()=>new T.SphereGeometry(1,12,8),cyl=()=>new T.CylinderGeometry(1,.85,1,12),box=()=>new T.BoxGeometry(),white='#ffffff',dark='#29221f',pieces=[];
 if(kind==='skin'){
  pieces.push([sphere(),[0,0,0],[1,1,1],white],[sphere(),[.19,-.55,0],[.76,.46,.82],white],[cyl(),[0,-1.02,0],[.42,.58,.42],white],[sphere(),[1.02,-.05,0],[.17,.29,.16],white],[sphere(),[1.13,-.18,0],[.15,.12,.19],white]);
  for(const side of [-1,1]){pieces.push([sphere(),[-.03,0,side],[.19,.3,.16],white],[sphere(),[.94,.15,side*.39],[.1,.1,.18],'#f2e8d8'],[sphere(),[1.025,.15,side*.39],[.035,.07,.07],dark],[box(),[.93,.31,side*.39],[.07,.045,.38],dark]);}
  pieces.push([sphere(),[.96,-.48,0],[.06,.055,.25],'#794b43']);
 }
 if(kind==='shirt'){pieces.push([cyl(),[0,0,0],[1,1,1],white],[cyl(),[0,-.47,0],[.86,.07,.88],'#56575a']);for(const side of [-1,1])pieces.push([sphere(),[0,.34,side*.81],[.66,.19,.26],white]);pieces.push([box(),[.91,.08,-.37],[.07,.22,.22],'#bbb7ac']);}
 if(kind==='arms'){pieces.push([cyl(),[0,0,0],[1,1,1],white],[sphere(),[0,-.42,0],[.89,.15,.9],white],[sphere(),[.05,-.53,0],[.88,.14,.72],white]);}
 if(kind==='legs'){pieces.push([cyl(),[0,0,0],[1,1,1],white],[sphere(),[.09,-.04,0],[.84,.12,.87],white],[box(),[.02,.08,.96],[.04,.77,.025],'#c0bbae']);}
 if(kind==='shoes'){pieces.push([sphere(),[0,.02,0],[.5,.49,.48],white],[box(),[0,-.38,0],[.96,.16,.96],'#c5c0b3']);}
 if(kind==='eyes'){pieces.push([sphere(),[0,0,0],[1,1,1],white]);}
 if(kind==='hat'){pieces.push([new T.CylinderGeometry(1,1,.35,12),[0,0,0],[1,1,1],white],[new T.CylinderGeometry(.7,.75,1,12),[0,.42,0],[1,1,1],white]);}
 return pieces.length?combine(T,pieces):null;
}
const api={details,apply,styleWoman,styleResident,combine,crowdGeometry};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29NPCAppearance=api;
})();
