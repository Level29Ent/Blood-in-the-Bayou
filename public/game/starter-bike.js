'use strict';
(function(){
const TYPE='bicycle';
const SPEC={name:'STARTER BICYCLE',len:23,wid:8,max:3.8,acc:.065,grip:.94,hp:140,cols:['#7254a5'],bicycle:true};
function eligible(index,options={},multiplayer=false){return !multiplayer&&((!options.resume&&index===0)||(options.resume&&options.starterBike?.v===1&&options.starterBike.granted===true));}
function location(origin,check){for(const radius of [38,56,78,104,128])for(let i=0;i<16;i++){const a=i*Math.PI/8,x=origin.x+Math.cos(a)*radius,y=origin.y+Math.sin(a)*radius;if(check(x,y,a))return {x,y,a};}return null;}
function model(T,color=SPEC.cols[0]){
 const root=new T.Group(),geometries=new Set(),materials=new Set(),wheels=[];
 root.name='Player starter bicycle';root.userData.mobileMoving=true;
 const mat=c=>{const m=new T.MeshStandardMaterial({color:c,roughness:.65});materials.add(m);return m;},paint=mat(color),black=mat('#19272b'),steel=mat('#a1b3b3'),purple=mat('#8a1fb0'),green=mat('#2fb33a'),gold=mat('#e4bd72');
 const unit=new T.BoxGeometry(1,1,1),cyl=new T.CylinderGeometry(1,1,1,8),ring=new T.TorusGeometry(4.5,.55,6,16),ball=new T.SphereGeometry(1,8,6);for(const g of [unit,cyl,ring,ball])geometries.add(g);
 function mesh(geo,m,x,y,z,sx=1,sy=1,sz=1,parent=root){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);parent.add(o);return o;}
 function rod(a,b,r,m,parent=root){const p=new T.Vector3(...a),q=new T.Vector3(...b),d=q.clone().sub(p),o=mesh(cyl,m,0,0,0,r,d.length(),r,parent);o.position.copy(p.add(q).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o;}
 for(const x of [-7,7]){const pivot=new T.Group();pivot.position.set(x,5,0);root.add(pivot);mesh(ring,black,0,0,0,1,1,1,pivot);for(let i=0;i<6;i++){const a=i*Math.PI/3;rod([0,0,0],[Math.cos(a)*4.3,Math.sin(a)*4.3,0],.09,steel,pivot);}wheels.push(pivot);}
 const crank=[-1,5,0],seat=[-3,12,0],front=[6,13,0];for(const [a,b]of [[[-7,5,0],seat],[seat,crank],[crank,[-7,5,0]],[seat,front],[front,crank],[front,[7,5,0]]])rod(a,b,.4,paint);
 mesh(unit,black,-3,13,0,4,1,3);rod(front,[7,15,0],.35,steel);rod([7,15,-3],[7,15,3],.35,steel);
 const pedals=new T.Group();pedals.position.set(-1,5,0);root.add(pedals);rod([0,0,-2],[0,0,2],.18,steel,pedals);for(const side of [-1,1]){rod([0,0,side*2],[side*2,0,side*2],.2,steel,pedals);mesh(unit,black,side*2,0,side*2,2,.5,1.2,pedals);}
 const rider=new T.Group();rider.name='Seated bicycle rider';root.add(rider);mesh(unit,purple,-3,19,0,4,7,5);mesh(ball,gold,-1.5,25,0,2.5,3,2.5);for(const side of [-1,1]){rod([-2,21,side*3],[7,15,side*3],.85,purple,rider);rod([-3,15,side*2],[2,11,side*2],1,green,rider);rod([2,11,side*2],[-1,5,side*2],.85,green,rider);}
 rider.visible=false;root.userData={...root.userData,top:15,paint,col:color,dead:false,wheels:[],tails:[],bar:null,bikeWheels:wheels,pedals,rider,ownedMaterials:materials,ownedGeometries:geometries};return root;
}
const api={TYPE,SPEC,eligible,location,model};if(typeof module!=='undefined')module.exports=api;if(typeof window==='undefined')return;
CAR_SPECS[TYPE]=SPEC;
let granted=false,pending=false,owner=null,tries=0,lastTry=-Infinity;
const start=startGame;startGame=function(index,options={}){granted=eligible(index,options,!!mpRole);pending=granted;owner=null;tries=0;lastTry=-Infinity;return start.apply(this,arguments);};
function ensure(){if(!granted||mpRole||state!=='play'||!player||player.dead||!city)return;if(owner!==city){owner=city;pending=true;tries=0;lastTry=-Infinity;}if(!pending||frame-lastTry<60)return;lastTry=frame;if(cars.some(c=>c.starterBike&&!c.gone)){pending=false;return;}if(++tries>10){pending=false;toast('STARTER BIKE PARKING BLOCKED · TRY CONTINUE LATER');return;}
 const probe={spec:SPEC},at=location(player,(x,y,a)=>{
  if(!Number.isFinite(terrainHeight(x,y))||Math.abs(terrainHeight(x,y)-terrainHeight(player.x,player.y))>3)return false;
  if(!window.level29TrafficClearance?.clear(probe,x,y,a,city,tileAt,[T_ROAD,T_WALK,T_LOT,T_PLAZA,T_BRIDGE]))return false;
  if(cars.some(c=>!c.dead&&!c.gone&&Math.hypot(c.x-x,c.y-y)<(c.r||20)+18))return false;
  for(const d of [0,8,16,24])if(blockedCircle(x+Math.cos(a+Math.PI/2)*d,y+Math.sin(a+Math.PI/2)*d,10))return false;
  return true;
 });
 if(!at)return;const bike=makeCar(at.x,at.y,at.a,TYPE);bike.starterBike=true;bike.ai=null;cars.push(bike);pending=false;window.level29Save?.save();toast('FREE STARTER BICYCLE · FOLLOW B · '+(window.level29Bindings?.label('vehicle')||'G')+' / ENTER TO RIDE');
}
const tick=update;update=function(){const r=tick.apply(this,arguments);ensure();return r;};
const factory=makeCarMesh;makeCarMesh=function(c){if(c.type!==TYPE)return factory.apply(this,arguments);const m=model(THREE,c.col);scene.add(m);return m;};
const sync=syncCars;syncCars=function(){const r=sync.apply(this,arguments);for(const [c,m]of carMeshes)if(c.type===TYPE&&m.userData.bikeWheels){const u=m.userData;if(u.bikeFrame!==frame){const dt=u.bikeFrame===undefined?1:Math.min(3,frame-u.bikeFrame);for(const wheel of u.bikeWheels)wheel.rotation.z-=c.v/4.5*dt;u.pedals.rotation.z-=c.v/7*dt;u.bikeFrame=frame;}u.rider.visible=player?.car===c&&view.chase&&!c.dead;}return r;};
const vm=syncViewModel;syncViewModel=function(){const r=vm.apply(this,arguments);if(player?.car?.type===TYPE&&dash)dash.visible=false;return r;};
const blips=extraBlips;extraBlips=function(){const out=blips.apply(this,arguments);for(const c of cars)if(c.starterBike&&!c.dead&&!c.gone)out.push({x:c.x,y:c.y,col:'#d7bf78',label:'B'});return out;};
window.level29StarterBike={...api,get snapshot(){return granted?{v:1,granted:true}:null;},ensure};
})();
