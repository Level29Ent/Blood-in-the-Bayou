'use strict';
// r149 composer, SSAO, PBR lighting and grading. World-only: HUD and weapon remain crisp.
(function(){
let composer=null,ssao=null,renderPass=null,grade=null,width=0,height=0,failed=false,mode='',env=null,aoSupported=false;
let prepared=new WeakSet(),converted=new WeakMap(),ticks=0,preparedCity=null;
const quality=()=>window.level29Graphics?.quality||localStorage.getItem('l29_gfx_quality')|| (matchMedia('(pointer: coarse)').matches?'low':'medium');
const glassCache=new WeakMap();
const drawingSize=new THREE.Vector2();
function physicalGlass(m){
 if(glassCache.has(m))return glassCache.get(m);
 const g=new THREE.MeshPhysicalMaterial({name:m.name||'glass',color:'#bbd5db',map:m.map||null,roughness:.09,metalness:0,clearcoat:1,clearcoatRoughness:.06,transmission:quality()==='high'?.78:0,thickness:.3,ior:1.45,transparent:true,opacity:quality()==='high'?1:.27,depthWrite:false,side:THREE.DoubleSide,envMapIntensity:.7});
 glassCache.set(m,g);return g;
}
function standard(m){
 if(m?.isMeshPhysicalMaterial&&['buildingGlass','boatGlass'].includes(m.name))return physicalGlass(m);
 if(!m||m.isShaderMaterial||m.isMeshNormalMaterial||m.isMeshDepthMaterial)return m;
 // Keep signs, light emitters, particles, sky and decal overlays unlit by design.
 if(m.isMeshBasicMaterial||m.transparent||m.blending===THREE.AdditiveBlending)return m;
 if(!m.isMeshLambertMaterial&&!m.isMeshPhongMaterial)return m;
 if(converted.has(m))return converted.get(m);
 const n=new THREE.MeshStandardMaterial({color:m.color,map:m.map,emissive:m.emissive,emissiveMap:m.emissiveMap,emissiveIntensity:Math.min(m.emissiveIntensity||0,.18),roughness:.72,metalness:.08,side:m.side,vertexColors:m.vertexColors,alphaTest:m.alphaTest||0,normalMap:m.normalMap,bumpMap:m.bumpMap,bumpScale:m.bumpScale,envMapIntensity:.45});n.color=m.color;if(m.emissive)n.emissive=m.emissive;converted.set(m,n);return n;
}
function prepare(root){if(!root)return;root.traverse(o=>{
 if(!o.isMesh||prepared.has(o))return;prepared.add(o);
 o.material=Array.isArray(o.material)?o.material.map(standard):standard(o.material);
 const surfaces=Array.isArray(o.material)?o.material:[o.material];for(const m of surfaces)if(m?.isMeshStandardMaterial&&!m.map)level29SurfaceDetail.apply(m,level29SurfaceDetail.kind(m.color,m.metalness));
 const mats=Array.isArray(o.material)?o.material:[o.material];
 for(const m of mats)if(m?.isMeshPhysicalMaterial&&m.transmission>0&&quality()!=='high'){m.transmission=0;if(!['vehiclePaint','boatPaint'].includes(m.name))m.opacity=.27;m.needsUpdate=true;}
 o.castShadow=mats.some(m=>m?.isMeshStandardMaterial&&!m.transparent&&!(m.transmission>0));o.receiveShadow=mats.some(m=>m?.isMeshStandardMaterial);
 if(o.geometry?.type==='PlaneGeometry'&&mats.some(m=>m?.transparent))o.castShadow=false;
 });}
function makeEnvironment(){
 if(env||!THREE.PMREMGenerator)return;
 const s=new THREE.Scene(),geo=new THREE.SphereGeometry(50,24,12),p=geo.attributes.position,colors=[];
 for(let i=0;i<p.count;i++){const h=(p.getY(i)/50+1)/2;colors.push(.18+.38*h,.2+.43*h,.22+.5*h);}
 geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));const mat=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide});s.add(new THREE.Mesh(geo,mat));
 const sunCard=new THREE.Mesh(new THREE.CircleGeometry(5,16),new THREE.MeshBasicMaterial({color:'#fff2db'}));sunCard.position.set(-20,30,12);sunCard.lookAt(0,0,0);s.add(sunCard);
 const pm=new THREE.PMREMGenerator(renderer);const target=pm.fromScene(s,.03);env=target;scene.environment=target.texture;vmScene.environment=target.texture;pm.dispose();s.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
}
function setup(){
 if(quality()==='low'||composer||failed||!window.BayouPost||!renderer)return;
 try{
 aoSupported=renderer.capabilities.isWebGL2||(renderer.extensions.has('WEBGL_depth_texture')&&renderer.extensions.has('OES_texture_float'));
 const A=window.BayouPost;composer=new A.EffectComposer(renderer);renderPass=new A.RenderPass(scene,camera);ssao=new A.SSAOPass(scene,camera,256,256);ssao.needsSwap=true;ssao.kernelRadius=7;ssao.minDistance=.001;ssao.maxDistance=.035;
 const shader={uniforms:{tDiffuse:{value:null},contrast:{value:1},saturation:{value:1}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:`uniform sampler2D tDiffuse;uniform float contrast;uniform float saturation;varying vec2 vUv;
 void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,saturation);c=(c-.18)*contrast+.18;gl_FragColor=LinearTosRGB(vec4(max(c,vec3(0.)),1.));
}`};
 grade=new A.ShaderPass(shader);grade.material.toneMapped=false;composer.addPass(renderPass);composer.addPass(ssao);composer.addPass(grade);makeEnvironment();
 }catch(e){failed=true;dispose();console.warn('Cinematic pipeline unavailable; using direct renderer',e);}
}
function dispose(){if(composer){ssao?.dispose();grade?.material.dispose();grade?.fsQuad.dispose();renderPass?.dispose();composer.dispose();}composer=ssao=renderPass=grade=null;width=height=0;}
function configure(){
 const q=quality();if(q!==mode){mode=q;scene.traverse(o=>{for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m?.isMeshPhysicalMaterial&&m.name!=='vehiclePaint'&&m.name!=='boatPaint'){m.transmission=q==='high'?.78:0;m.opacity=q==='high'?1:.27;m.needsUpdate=true;}});prepared=new WeakSet();converted=new WeakMap();ticks=0;if(ssao)ssao.enabled=q!=='low'&&aoSupported;if(renderPass)renderPass.enabled=q==='low'||!aoSupported;}
 // Follow adaptive pixel ratio and resize; AO renders at capped resolution to bound mobile GPU cost.
 const size=renderer.getDrawingBufferSize(drawingSize),scale=q==='high'?Math.min(1,1280/Math.max(size.x,size.y)):Math.min(.6,800/Math.max(size.x,size.y));
 const w=Math.max(1,Math.floor(size.x*scale)),h=Math.max(1,Math.floor(size.y*scale));
 if(w!==width||h!==height){width=w;height=h;composer.setPixelRatio(1);composer.setSize(w,h);}
}
function beforeWorld(){
 if(quality()==='low'&&composer)dispose();setup();if(!scene)return;
 if(!composer&&mode!==quality()){mode=quality();prepared=new WeakSet();converted=new WeakMap();ticks=0;scene.traverse(o=>{for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m?.isMeshPhysicalMaterial&&!['vehiclePaint','boatPaint'].includes(m.name)){m.transmission=0;m.opacity=.27;m.needsUpdate=true;}});}
 if(composer)configure();if(ssao?.ssaoMaterial){const u=ssao.ssaoMaterial.uniforms;u.cameraProjectionMatrix.value.copy(camera.projectionMatrix);u.cameraInverseProjectionMatrix.value.copy(camera.projectionMatrixInverse);u.cameraNear.value=camera.near;u.cameraFar.value=camera.far;}ticks++;if(preparedCity!==(typeof city==='undefined'?null:city)||ticks===1){prepare(scene);prepare(vmScene);preparedCity=typeof city==='undefined'?null:city;}
 // Retain only distant depth haze; no nearby gray veil.
 if(scene.fog){scene.fog.near=lightMode==='night'?400:1000;scene.fog.far=lightMode==='night'?1400:2400;}
 renderer.toneMapping=THREE.NoToneMapping;renderer.toneMappingExposure=1;
 // One lighting palette for direct rendering and postprocessing; avoid bleaching dark albedo.
 sun.intensity=lightMode==='day'?.8:lightMode==='dusk'?.65:.2;hemi.intensity=lightMode==='night'?.3:.45;
 scene.environment=env?.texture||scene.environment;if(vmScene)vmScene.environment=scene.environment;
}
function drawWorld(){
 beforeWorld();
 if(!composer||failed||renderer.getContext().isContextLost()){renderer.render(scene,camera);return;}
 // Render targets receive linear output; ACES is applied by beauty materials once. Only grade encodes sRGB.
 const encoding=renderer.outputEncoding;
 try{renderer.outputEncoding=THREE.LinearEncoding;composer.render();}catch(e){failed=true;dispose();renderer.setRenderTarget(null);renderer.outputEncoding=encoding;renderer.clear();renderer.render(scene,camera);console.warn('Cinematic fallback',e);}finally{renderer.outputEncoding=encoding;}
}
const init=initGL;initGL=function(){init.apply(this,arguments);setup();};
const make=makeCarMesh;makeCarMesh=function(c){const g=make.apply(this,arguments);const p=g.userData.paint;if(p?.isMeshStandardMaterial){p.roughness=g.userData.profile?.military?.7:.21;p.metalness=c.boat?.35:g.userData.profile?.military?.15:.55;p.envMapIntensity=.85;}
 g.traverse(o=>{if(!o.isMesh)return;const m=o.material;if(m?.isMeshPhysicalMaterial&&!['vehiclePaint','boatPaint'].includes(m.name)&&(m.transparent||m.name==='buildingGlass'||m.name==='boatGlass'))o.material=physicalGlass(m);});prepare(g);return g;};
const sync=syncCars;
syncCars=function(){sync.apply(this,arguments);for(const[c,m]of carMeshes){if(!c.boat||c.dead||!m.visible)continue;const t=frame/60;m.position.y=(c.z||0)+Math.sin(t*1.4+c.x*.015)*.65;m.rotation.x=Math.sin(t*1.1+c.y*.02)*.018;m.rotation.z=Math.sin(t*1.6+c.x*.01)*.014-clamp(c.v*.003,-.025,.025);}};
window.level29Cinematic={drawWorld,physicalGlass,prepare,get composer(){return composer;},get ssao(){return ssao;},get quality(){return mode;},get size(){return {width,height};},get failed(){return failed;}};
addEventListener('webglcontextlost',()=>{failed=true;dispose();},{capture:true});
})();
