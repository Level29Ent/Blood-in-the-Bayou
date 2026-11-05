'use strict';
// r149 composer, SSAO, PBR lighting and grading. World-only: HUD and weapon remain crisp.
(function(){
let composer=null,ssao=null,renderPass=null,grade=null,width=0,height=0,failed=false,mode='',env=null,aoSupported=false,bloom=null,bokeh=null,hdrLoading=false,exposure=1.2;
let envPhase='',envBases=new WeakMap();function environmentStrength(m){if(!m?.isMeshStandardMaterial)return;if(!envBases.has(m))envBases.set(m,m.envMapIntensity??1);m.envMapIntensity=envBases.get(m)*(lightMode==='night'?.08:lightMode==='dusk'?.5:1);}
let prepared=new WeakSet(),converted=new WeakMap(),ticks=0,preparedCity=null;
const quality=()=>window.level29Graphics?.quality||localStorage.getItem('l29_gfx_quality')|| (matchMedia('(pointer: coarse)').matches?'low':'medium');
const glassCache=new WeakMap();
const drawingSize=new THREE.Vector2(),depth=window.level29DepthVisibility?.visibilityCache();
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
 const surfaces=Array.isArray(o.material)?o.material:[o.material];for(const m of surfaces)if(m?.isMeshStandardMaterial)level29SurfaceDetail.apply(m,level29SurfaceDetail.kind(m.color,m.metalness),false);
 const mats=Array.isArray(o.material)?o.material:[o.material];
 for(const m of mats)if(m?.isMeshPhysicalMaterial&&m.transmission>0&&quality()!=='high'){m.transmission=0;if(!['vehiclePaint','boatPaint'].includes(m.name))m.opacity=.27;m.needsUpdate=true;}
 for(const m of mats)environmentStrength(m);o.castShadow=mats.some(m=>m?.isMeshStandardMaterial&&!m.transparent&&!(m.transmission>0));o.receiveShadow=mats.some(m=>m?.isMeshStandardMaterial);
 if(o.geometry?.type==='PlaneGeometry'&&mats.some(m=>m?.transparent))o.castShadow=false;
 });}
function makeEnvironment(){
 if(env||hdrLoading||quality()==='low'||!THREE.PMREMGenerator||!window.BayouPost?.RGBELoader)return;
 hdrLoading=true;const owner=renderer;
 new BayouPost.RGBELoader().setDataType(THREE.HalfFloatType).load('/game/environments/southern-dusk.hdr',texture=>{hdrLoading=false;if(renderer!==owner||quality()==='low'){texture.dispose();return;}texture.mapping=THREE.EquirectangularReflectionMapping;const pm=new THREE.PMREMGenerator(owner);try{env=pm.fromEquirectangular(texture);scene.environment=env.texture;if(vmScene)vmScene.environment=env.texture;}finally{texture.dispose();pm.dispose();}},undefined,()=>{hdrLoading=false;console.warn('HDR environment unavailable; retaining direct lighting');});
}
function setup(){
 if(quality()==='low'||composer||failed||!window.BayouPost||!renderer)return;
 try{
 aoSupported=renderer.capabilities.isWebGL2||(renderer.extensions.has('WEBGL_depth_texture')&&renderer.extensions.has('OES_texture_float'));
 const A=window.BayouPost;composer=new A.EffectComposer(renderer);renderPass=new A.RenderPass(scene,camera);ssao=new A.SSAOPass(scene,camera,256,256);ssao.needsSwap=true;ssao.kernelRadius=7;ssao.minDistance=.001;ssao.maxDistance=.035;
 if(depth){window.level29DepthVisibility.tuneAO(ssao);window.level29DepthVisibility.attachAO(ssao,depth);}
 const shader={uniforms:{tDiffuse:{value:null},contrast:{value:1},saturation:{value:1},grain:{value:0},clock:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:`uniform sampler2D tDiffuse;uniform float contrast;uniform float saturation;uniform float grain;uniform float clock;varying vec2 vUv;
 void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,saturation);c=(c-.18)*contrast+.18;c+=vec3(.012,.006,-.008)*smoothstep(.1,.7,l);float edge=dot(vUv-.5,vUv-.5);c*=1.-edge*.16;float n=fract(sin(dot(vUv+clock*.001,vec2(12.9898,78.233)))*43758.5453)-.5;c+=n*grain;gl_FragColor=LinearTosRGB(vec4(max(c,vec3(0.)),1.));
}`};
 bloom=new A.UnrealBloomPass(new THREE.Vector2(256,256),.16,.35,.85);bokeh=new A.BokehPass(scene,camera,{focus:80,aperture:.000015,maxblur:.003,width:256,height:256});bokeh.enabled=false;bokeh.needsSwap=true;if(depth)window.level29DepthVisibility.attachBokeh(bokeh,depth);grade=new A.ShaderPass(shader);grade.material.toneMapped=false;composer.addPass(renderPass);composer.addPass(ssao);composer.addPass(bokeh);composer.addPass(bloom);composer.addPass(grade);makeEnvironment();
 }catch(e){failed=true;dispose();console.warn('Cinematic pipeline unavailable; using direct renderer',e);}
}
function dispose(){depth?.clear();if(composer){ssao?.noiseTexture?.dispose();ssao?.ssaoMaterial?.dispose();ssao?.dispose();bloom?.dispose();bokeh?.dispose();grade?.material.dispose();grade?.fsQuad.dispose();renderPass?.dispose();composer.dispose();}composer=ssao=renderPass=grade=bloom=bokeh=null;width=height=0;}
function configure(){
 const q=quality();if(q!==mode){mode=q;scene.traverse(o=>{for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m?.isMeshPhysicalMaterial&&m.name!=='vehiclePaint'&&m.name!=='boatPaint'){m.transmission=q==='high'?.78:0;m.opacity=q==='high'?1:.27;m.needsUpdate=true;}});prepared=new WeakSet();converted=new WeakMap();ticks=0;if(ssao)ssao.enabled=q!=='low'&&aoSupported;if(renderPass)renderPass.enabled=q==='low'||!aoSupported;}
 // Follow adaptive pixel ratio and resize; AO renders at capped resolution to bound mobile GPU cost.
 const size=renderer.getDrawingBufferSize(drawingSize),scale=q==='high'?Math.min(1,1280/Math.max(size.x,size.y)):Math.min(.6,800/Math.max(size.x,size.y));
 const w=Math.max(1,Math.floor(size.x*scale)),h=Math.max(1,Math.floor(size.y*scale));
 if(w!==width||h!==height){width=w;height=h;composer.setPixelRatio(1);composer.setSize(w,h);}
 if(bokeh?.uniforms.aspect)bokeh.uniforms.aspect.value=w/h;
}
function beforeWorld(){
 if(quality()==='low'){if(composer)dispose();if(env){scene.environment=null;if(vmScene)vmScene.environment=null;env.dispose();env=null;}}setup();if(!scene)return;
 if(!composer&&mode!==quality()){mode=quality();prepared=new WeakSet();converted=new WeakMap();ticks=0;scene.traverse(o=>{for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m?.isMeshPhysicalMaterial&&!['vehiclePaint','boatPaint'].includes(m.name)){m.transmission=0;m.opacity=.27;m.needsUpdate=true;}});}
 if(composer){depth?.refresh(scene,typeof city==='undefined'?null:city,frame);configure();if(bloom){bloom.enabled=true;bloom.strength=quality()==='high'?.6:.22;bloom.radius=.4;bloom.threshold=.85;}if(bokeh){const scoped=!!window.level29Scope?.scoped,cinematic=state==='talk'||!!window.level29CityStories?.cutscene;bokeh.enabled=quality()==='high'&&(cinematic||scoped);bokeh.uniforms.focus.value=scoped?300:80;}if(grade){grade.uniforms.contrast.value=1.035;grade.uniforms.saturation.value=1.03;grade.uniforms.grain.value=quality()==='high'?.003:0;grade.uniforms.clock.value=frame/60;}}if(ssao?.ssaoMaterial){const u=ssao.ssaoMaterial.uniforms;u.cameraProjectionMatrix.value.copy(camera.projectionMatrix);u.cameraInverseProjectionMatrix.value.copy(camera.projectionMatrixInverse);u.cameraNear.value=camera.near;u.cameraFar.value=camera.far;}ticks++;if(preparedCity!==(typeof city==='undefined'?null:city)||ticks===1){prepare(scene);prepare(vmScene);preparedCity=typeof city==='undefined'?null:city;}
 // Retain only distant depth haze; no nearby gray veil.
 if(scene.fog){scene.fog.near=lightMode==='night'?400:1000;scene.fog.far=lightMode==='night'?1400:2400;}
 renderer.toneMapping=THREE.ACESFilmicToneMapping;exposure=lightMode==='dusk'?1.1:1.2;renderer.toneMappingExposure=exposure;
 // One lighting palette for direct rendering and postprocessing; avoid bleaching dark albedo.
 sun.intensity=lightMode==='day'?.8:lightMode==='dusk'?.65:.2;hemi.intensity=lightMode==='night'?.3:.45;
 if(window.level29AdvancedLighting?.engine.stats.cascades){sun.intensity=0;sun.castShadow=false;}
 scene.environment=env?.texture||scene.environment;if(vmScene)vmScene.environment=scene.environment;
}
function drawWorld(){
 beforeWorld();if(envPhase!==lightMode){envPhase=lightMode;for(const root of [scene,vmScene])root?.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material])environmentStrength(m);});}
 if(!composer||failed||renderer.getContext().isContextLost()){renderer.render(scene,camera);return;}
 // Render targets receive linear output; ACES is applied by beauty materials once. Only grade encodes sRGB.
 const encoding=renderer.outputEncoding,override=scene.overrideMaterial,autoClear=renderer.autoClear;
 try{renderer.outputEncoding=THREE.LinearEncoding;composer.render();}catch(e){failed=true;dispose();scene.overrideMaterial=override;renderer.autoClear=autoClear;renderer.setRenderTarget(null);renderer.outputEncoding=encoding;renderer.clear();renderer.render(scene,camera);console.warn('Cinematic fallback',e);}finally{renderer.outputEncoding=encoding;scene.overrideMaterial=override;renderer.autoClear=autoClear;}
}
const init=initGL;initGL=function(){init.apply(this,arguments);setup();};
const make=makeCarMesh;makeCarMesh=function(c){const g=make.apply(this,arguments);const p=g.userData.paint;if(p?.isMeshStandardMaterial){p.roughness=g.userData.profile?.military?.7:.21;p.metalness=c.boat?.35:g.userData.profile?.military?.15:.55;p.envMapIntensity=.85;}
 g.traverse(o=>{if(!o.isMesh)return;const m=o.material;if(m?.isMeshPhysicalMaterial&&!['vehiclePaint','boatPaint'].includes(m.name)&&(m.transparent||m.name==='buildingGlass'||m.name==='boatGlass'))o.material=physicalGlass(m);});prepare(g);return g;};
const sync=syncCars;
syncCars=function(){sync.apply(this,arguments);for(const[c,m]of carMeshes){if(!c.boat||c.dead||!m.visible)continue;const t=frame/60;m.position.y=(c.z||0)+Math.sin(t*1.4+c.x*.015)*.65;m.rotation.x=Math.sin(t*1.1+c.y*.02)*.018;m.rotation.z=Math.sin(t*1.6+c.x*.01)*.014-clamp(c.v*.003,-.025,.025);}};
window.level29Cinematic={drawWorld,physicalGlass,prepare,get composer(){return composer;},get ssao(){return ssao;},get quality(){return mode;},get size(){return {width,height};},get failed(){return failed;},get bloom(){return bloom;},get bokeh(){return bokeh;},get environment(){return env;},get exposure(){return exposure;}};
addEventListener('webglcontextlost',()=>{failed=true;dispose();if(env){env.dispose();env=null;}},{capture:true});
})();
