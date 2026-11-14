const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),THREE=require('three');
const F=require('../public/game/firearm-models.js'),R=require('../public/game/armory-retail.js'),L=require('../public/game/site-layout.js');
function setup(w=128,h=128){
 const b={x:100,y:200,w,h},v={id:'armory',b,stationX:100+w/2,stationY:200+h*.35,doorX:100+w/2,doorY:200+h,furniture:[]},g=new THREE.Group(),source=new THREE.Group();
 source.add(new THREE.Mesh(new THREE.BoxGeometry(2,3,20),new THREE.MeshStandardMaterial()));
 const originals=Array.from({length:9},()=>source.clone(true)),ids=['m240','shotgun','rpg','molotov','bat','smg','carbine','pistol','marksman'];
 const c={THREE,window:{level29FirearmModels:F,level29ArmoryRetail:R,level29ArsenalVisuals:{createDisplayModels:()=>Object.fromEntries(ids.map((id,i)=>[id,originals[i]]))},level29Graphics:{quality:'high'}},level29SiteLayout:L,level29World:{batch(g){return {box(w,h,d,x,y,z,m){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);g.add(mesh)},finish(){}}}},addPart(g,w,h,d,x,y,z,m){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);g.add(mesh);return mesh},addSign(){},WEAPONS:Object.fromEntries(ids.map(id=>[id,{name:id}])),render(){},city:{venues:[v]},player:{dead:false},state:'play',insideVenue:()=>true};
 vm.createContext(c);vm.runInContext(fs.readFileSync('public/game/armory-showroom.js','utf8'),c);c.window.level29ArmoryShowroom.build(v,g);return {c,v,g,originals};
}
test('reference armory keeps all nine actual weapon display models and encloses each in glass',()=>{
 const {v,originals}=setup();assert.equal(v.weaponDisplays.length,9);
 for(let i=0;i<9;i++){const d=v.weaponDisplays[i];assert.equal(d.model,originals[i]);assert.equal(d.model.parent,d.stand);assert.ok(d.stand.children.filter(o=>o.material?.transparent).length>=5);const size=new THREE.Box3().setFromObject(d.model).getSize(new THREE.Vector3());assert.ok(size.x<=d.cell.w-4+.001&&size.z<=d.cell.d-4+.001&&size.y<=7.001);}
});
test('small and large gun stores retain a radius-ten entrance-to-dealer aisle and free service circle',()=>{
 for(const [w,h]of [[128,128],[192,160],[256,224]]){const {v}=setup(w,h);for(let y=v.stationY;y<=v.doorY+10;y+=2)for(const f of v.furniture){assert.equal(v.doorX+10>f.x&&v.doorX-10<f.x+f.w&&y+10>f.y&&y-10<f.y+f.h,false,'blocked central aisle '+w+' at '+y);}
 for(const f of v.furniture)assert.equal(v.stationX+13>f.x&&v.stationX-13<f.x+f.w&&v.stationY+13>f.y&&v.stationY-13<f.y+f.h,false,'dealer pad blocked');}
});
test('retail geometry stays finite, inside the store and contains no dynamic lights',()=>{
 const {v,g}=setup();let glass=0,stock=0;v.armoryRetail.traverse(o=>{assert.equal(Boolean(o.isLight),false);if(o.name.startsWith('Detailed retail stock'))stock++;if(o.material?.transparent)glass++;if(o.geometry){const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++)for(const n of [a.getX(i),a.getY(i),a.getZ(i)])assert.ok(Number.isFinite(n));if(o.geometry.parameters)for(const key of ['width','height','depth'])if(key in o.geometry.parameters)assert.ok(o.geometry.parameters[key]>0);}});
 assert.ok(stock>=20);assert.ok(glass>=2);const b=new THREE.Box3().setFromObject(g);assert.ok(b.min.x>=v.b.x+2&&b.max.x<=v.b.x+v.b.w-2);assert.ok(b.min.z>=v.b.y+2&&b.max.z<=v.b.y+v.b.h-2);assert.ok(b.max.y<=52);
});
test('display lighting is capped at two high-quality interior lights and turns off outside or on pause',()=>{
 const {c,v}=setup();c.render();assert.equal(v.weaponDisplays.filter(d=>d.light.visible).length,2);c.state='pause';c.render();assert.ok(v.weaponDisplays.every(d=>!d.light.visible));c.state='play';c.window.level29Graphics.quality='low';c.render();assert.ok(v.weaponDisplays.every(d=>!d.light.visible));c.window.level29Graphics.quality='high';c.insideVenue=()=>false;c.render();assert.ok(v.weaponDisplays.every(d=>!d.light.visible));
});
