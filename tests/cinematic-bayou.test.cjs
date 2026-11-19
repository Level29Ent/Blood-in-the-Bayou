const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),T=require('three');
const {bathymetry,patch}=require('../public/game/water-surface.js');
test('shore bathymetry deepens away from land, uses linear data and releases texture',()=>{
 const c={width:8,height:3,get:(x,y)=>x?4:0},b=bathymetry(T,c),d=b.map.image.data;
 assert.equal(d[0],0);assert.ok(d[4]>0&&d[4]<d[12]);assert.equal(d[7*4],255);
 assert.equal(b.map.encoding,T.LinearEncoding);assert.equal(b.map.generateMipmaps,false);assert.deepEqual(b.size.toArray(),[256,96]);
 let released=false;b.map.addEventListener('dispose',()=>released=true);b.map.dispose();assert.equal(released,true);
 const allWater=bathymetry(T,{width:2,height:2,g:[4,4,4,4]});assert.ok(allWater.map.image.data.every(v=>v===255));allWater.map.dispose();
});
test('water shader uses the shipped r149 UV contract, depth absorption, foam and fresnel',()=>{
 const shader={uniforms:{},fragmentShader:T.ShaderLib.standard.fragmentShader},u={bayouDepth:{value:{}},bayouExtent:{value:new T.Vector2(100,100)}};
 patch(shader,T,u);assert.equal(shader.uniforms.bayouDepth,u.bayouDepth);assert.match(shader.fragmentShader,/bayouWorld.xz\*\.035\+vec2\(bayouTime/);
 assert.ok(!shader.fragmentShader.includes('vNormalMapUv'));assert.match(shader.fragmentShader,/exp\(-waterDepth/);assert.match(shader.fragmentShader,/shore\*wash/);assert.match(shader.fragmentShader,/waterFresnel/);
});
test('time/weather camera owner installs exponential green/amber fog and preserves it across frames',()=>{
 const c={THREE:T,window:{level29Prologue:{timeHour:18}},performance:{now:()=>0},update(){},placeCamera:()=>0,scene:new T.Scene(),city:{},hemi:new T.HemisphereLight(),sun:new T.DirectionalLight()};
 c.scene.background=new T.Color();c.scene.fog=new T.Fog('#aaa',60,1000);c.sun.target.position.set(100,20,50);
 vm.createContext(c);vm.runInContext(fs.readFileSync('public/game/world-atmosphere.js','utf8'),c);c.placeCamera();const fog=c.scene.fog;
 assert.equal(fog.isFogExp2,true);assert.equal(fog.density,.0018);assert.equal(fog.color.getHexString(),'766647');assert.ok(Math.abs(c.sun.position.distanceTo(c.sun.target.position)-900)<1e-8);
 c.window.level29Weather={kind:'fog'};c.placeCamera();assert.equal(c.scene.fog,fog);assert.equal(fog.density,.0032);
 c.window.level29Prologue.timeHour=23;c.placeCamera();assert.equal(fog.color.getHexString(),'273b36');assert.ok(c.hemi.intensity>.2);
});
test('mobile exponential fog conceals the clip boundary and restores density even after draw failure',()=>{
 const c={THREE:T,window:{level29MobileBudget:{mobile:true}},scene:new T.Scene(),cityGroup:new T.Group(),render(){c.renderer.render(c.scene,c.camera);},camera:new T.PerspectiveCamera(70,1,1,2400)};
 c.scene.add(c.cityGroup);c.scene.fog=new T.FogExp2('#647767',.0018);let density,fail=false;
 c.renderer={render(){density=c.scene.fog.density;if(fail)throw Error('GPU failure');}};vm.createContext(c);vm.runInContext(fs.readFileSync('public/game/mobile-world-visibility.js','utf8'),c);
 c.render();assert.ok(density>.0018);assert.equal(c.scene.fog.density,.0018);fail=true;assert.throws(()=>c.render(),/GPU failure/);assert.equal(c.scene.fog.density,.0018);assert.equal(c.camera.far,2400);
});
test('water helper loads once, before bounded water effects',()=>{const html=fs.readFileSync('public/game/index.html','utf8');assert.equal((html.match(/src="water-surface.js/g)||[]).length,1);assert.ok(html.indexOf('src="water-surface.js')<html.indexOf('src="bayou-volumetrics.js'));});
test('asphalt gains surface relief and lowers roughness only during wet weather',()=>{
 const c={THREE:T,window:{level29StreetReview:true,level29Weather:{kind:'clear'}}};vm.createContext(c);vm.runInContext(fs.readFileSync('public/game/street-surfaces.js','utf8'),c);
 const city={width:3,height:3,buildings:[],get:()=>1,heightAt:()=>0},mesh=c.window.level29StreetSurfaces.build(T,city).children[0];
 assert.ok(mesh.material.isMeshStandardMaterial);assert.ok(mesh.material.bumpMap);mesh.onBeforeRender();assert.equal(mesh.material.roughness,.97);
 c.window.level29Weather.kind='rain';mesh.onBeforeRender();assert.equal(mesh.material.roughness,.24);
 c.window.level29Weather.kind='clear';mesh.onBeforeRender();assert.equal(mesh.material.roughness,.97);
});
