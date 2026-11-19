'use strict';
(function(){
const caches=new WeakMap();
function resources(T){
 if(caches.has(T))return caches.get(T);const size=64,cloth=new Uint8Array(size*size*4),decay=new Uint8Array(size*size*4),rough=new Uint8Array(size*size*4),clothRough=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const k=(y*size+x)*4,weave=128+Math.cos(x*Math.PI)*Math.cos(y*Math.PI)*18,vein=Math.pow(Math.max(0,Math.sin(x*.38+Math.sin(y*.2)*2)),12),spot=Math.sin(x*2.13+y*7.91)*.5+.5;cloth.set([weave,weave,weave,255],k);const cr=235+Math.round((weave-110)/36*20);clothRough.set([cr,cr,cr,255],k);const h=128+vein*40+spot*8;decay.set([h,h,h,255],k);const r=spot>.78?90:255;rough.set([r,r,r,255],k);}
 const map=data=>{const t=new T.DataTexture(data,size,size);t.wrapS=t.wrapT=T.RepeatWrapping;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t;};
 const r={cloth:map(cloth),clothRough:map(clothRough),decay:map(decay),rough:map(rough),converted:new WeakMap(),rim:{value:new T.Color('#ffe0a6')}};caches.set(T,r);return r;
}
function finish(T,source,role){
 if(!source||source.isShaderMaterial||source.isSpriteMaterial||source.isMeshDepthMaterial||source.isMeshNormalMaterial||source.userData.characterFinish)return source;
 const r=resources(T);let byRole=r.converted.get(source);if(!byRole){byRole=new Map();r.converted.set(source,byRole);}if(byRole.has(role))return byRole.get(role);
 // Keep emissive eyes, labels and transparent hair cards authored and unlit.
 if(source.isMeshBasicMaterial||source.transparent&&role!=='mixed')return source;
 const physical=['skin','infected','cloth','mixed','atlas'].includes(role),m=physical?new T.MeshPhysicalMaterial():new T.MeshStandardMaterial();
 if(source.isMeshPhysicalMaterial&&physical)m.copy(source);else if(source.isMeshStandardMaterial)T.MeshStandardMaterial.prototype.copy.call(m,source);else{m.color.copy(source.color||new T.Color('white'));m.map=source.map||null;m.side=source.side;m.vertexColors=source.vertexColors;m.alphaTest=source.alphaTest||0;}
 // Existing identity/outfit setters retain their color reference.
 m.color=source.color||m.color;m.userData={...source.userData,characterFinish:role,pbrDetail:true};
 if(role==='skin'){m.roughness=.45;m.metalness=0;m.clearcoat=.12;m.clearcoatRoughness=.45;m.thickness=.4;m.attenuationColor.set('#b96738');m.attenuationDistance=1.5;}
 if(role==='infected'){m.roughness=.85;m.metalness=0;m.clearcoat=.05;m.thickness=.15;m.attenuationColor.set('#606449');m.attenuationDistance=.8;if(!m.normalMap&&!m.map){m.bumpMap=r.decay;m.bumpScale=.08;}if(!m.map)m.roughnessMap=r.rough;}
 if(role==='cloth'){m.roughness=.95;m.metalness=0;m.sheen=.35;m.sheenRoughness=.9;m.sheenColor.set('#80796f');if(!m.roughnessMap)m.roughnessMap=r.clothRough;if(!m.normalMap&&!m.bumpMap){m.bumpMap=r.cloth;m.bumpScale=.035;}}
 if(role==='metal'){m.metalness=.85;m.roughness=.25;}
 if(role==='atlas'){m.metalness=0;m.roughness=.9;m.clearcoat=.12;m.clearcoatRoughness=.45;m.sheen=.35;m.sheenColor.set('#80796f');m.thickness=.4;m.attenuationColor.set('#b96738');}
 const compile=source.onBeforeCompile,key=source.customProgramCacheKey,baseKey=key.call(source);
 m.onBeforeCompile=function(shader,renderer){compile.call(this,shader,renderer);shader.uniforms.characterRim=r.rim;shader.fragmentShader='uniform vec3 characterRim;\n'+shader.fragmentShader;
 if(role==='cloth')shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=clamp(roughnessFactor,.85,.95);');
 // Mask forwarding does not replace skinning, morph targets or position transforms.
 if(role==='atlas'){
  shader.vertexShader='attribute float characterSkin;varying float vCharacterSkin;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCharacterSkin=characterSkin;');
  shader.fragmentShader='varying float vCharacterSkin;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(.93,.45,clamp(vCharacterSkin,0.,1.));');
  shader.fragmentShader=shader.fragmentShader.replace('#include <lights_physical_fragment>','#include <lights_physical_fragment>\n#ifdef USE_CLEARCOAT\nmaterial.clearcoat*=vCharacterSkin;\n#endif\n#ifdef USE_SHEEN\nmaterial.sheenColor*=1.-vCharacterSkin;\n#endif');
 }

 shader.fragmentShader=shader.fragmentShader.replace('#include <output_fragment>',`
 float characterEdge=pow(1.-clamp(dot(normal,normalize(vViewPosition)),0.,1.),3.);
 ${role==='skin'||role==='infected'||role==='atlas'?`// Thin-surface warm wrap approximation, not transmission-based SSS.
 outgoingLight+=diffuseColor.rgb*vec3(${role!=='infected'?'1.,.28,.08':'.22,.26,.12'})*characterEdge*${role==='atlas'?'.055*clamp(vCharacterSkin,0.,1.)':role==='skin'?'.055':'.018'};`:''}
 ${role==='infected'?'outgoingLight*=mix(.88,1.,clamp(dot(geometryNormal,normal),0.,1.));':''}
 outgoingLight+=characterRim*characterEdge*.065*min(vec3(.6),diffuseColor.rgb+vec3(.1));
 #include <output_fragment>`);
 };
 m.customProgramCacheKey=()=>baseKey+'-character-finish-v1-'+role;byRole.set(role,m);return m;
}
function skinMask(T,o){
 if(!o.isSkinnedMesh||!o.geometry?.attributes.skinIndex||!o.geometry.attributes.skinWeight)return false;
 if(o.geometry.attributes.characterSkin)return true;
 const index=o.geometry.attributes.skinIndex,weights=o.geometry.attributes.skinWeight,values=new Float32Array(index.count);
 const exposed=o.skeleton.bones.map(b=>/head|neck|hand|finger|thumb|forearm/i.test(b.name));
 for(let i=0;i<index.count;i++)for(let j=0;j<4;j++){const bone=index[['getX','getY','getZ','getW'][j]](i);if(exposed[bone])values[i]+=weights[['getX','getY','getZ','getW'][j]](i);}
 o.geometry.setAttribute('characterSkin',new T.BufferAttribute(values,1));return true;
}
function ensureUV(T,g){if(!g?.attributes.position||g.attributes.uv)return;const p=g.attributes.position,uv=new Float32Array(p.count*2);for(let i=0;i<p.count;i++){uv[i*2]=p.getX(i)*.25;uv[i*2+1]=p.getY(i)*.25;}g.setAttribute('uv',new T.BufferAttribute(uv,2));}
function apply(T,actor,infected=false){
 if(!actor)return actor;const u=actor.userData||{},replacements=new Map();
 for(const [key,role]of [['skin',infected?'infected':'skin'],['shirt','cloth'],['pants','cloth']])if(u[key]){const old=u[key],m=finish(T,old,role);replacements.set(old,m);u[key]=m;}
 if(infected&&u.infectedDetails)u.eyeSockets=true;
 if(infected&&u.eyes&&!u.eyeSockets){const socket=new T.MeshStandardMaterial({color:'#22271e',roughness:.9}),geometry=new T.SphereGeometry(1,8,6);for(const z of [-.95,.95]){const eye=new T.Mesh(geometry,socket);eye.name='infected eye socket AO';eye.position.set(2.01,18.6,z);eye.scale.set(.04,.73,.78);u.body.add(eye);}u.eyeSockets=true;}
 actor.traverse(o=>{if(!o.isMesh)return;ensureUV(T,o.geometry);const atlas=skinMask(T,o);const convert=m=>{if(replacements.has(m))return replacements.get(m);const name=(m?.name||'')+' '+o.name,role=o.userData.characterSurface||m?.userData?.characterSurface;
 if(role)return finish(T,m,role);if(/buckle|jewel|chain|brass|metal/i.test(name)||m?.metalness>.5||o.geometry?.type==='TorusGeometry')return finish(T,m,'metal');
 if(/skin|head|face|hand/i.test(name))return finish(T,m,infected?'infected':'skin');
 if(/shirt|pant|cloth|denim|cotton|fabric|sleeve|legs/i.test(name))return finish(T,m,'cloth');
 // Unknown single-atlas GLBs mix skin, clothes and accessories. Preserve PBR maps/scalars.
 return finish(T,m,atlas?'atlas':'mixed');};
 o.material=Array.isArray(o.material)?o.material.map(convert):convert(o.material);o.castShadow=true;o.receiveShadow=true;
 if(o.isSkinnedMesh)o.frustumCulled=false;
 });return actor;
}
const api={resources,finish,apply,skinMask,ensureUV};if(typeof module!=='undefined')module.exports=api;if(typeof window==='undefined')return;if(window.level29CharacterReviewMode){window.level29CharacterMaterials=api;return;}window.level29CharacterMaterials=api;
// This last-loaded factory wrapper runs after older skin-wrap/appearance owners.
const jester=typeof makeJester==='function'?makeJester:null;if(jester)makeJester=function(){return apply(THREE,jester.apply(this,arguments));};
const make=makeFigure;makeFigure=function(zombie){return apply(THREE,make.apply(this,arguments),!!zombie);};
const references=new WeakSet(),ronnie=syncRonnie;syncRonnie=function(){const result=ronnie.apply(this,arguments),model=typeof rbMesh==='undefined'?null:rbMesh?.userData?.referenceModel;if(model&&!references.has(model)){apply(THREE,model);references.add(model);}return result;};
const sync=syncDynamic;syncDynamic=function(){resources(THREE).rim.value.copy(sun.color);return sync.apply(this,arguments);};
})();
