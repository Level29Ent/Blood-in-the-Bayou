'use strict';
(function(){
 function pose(ride){
  const p=ride.mesh.position,a=level29Gunnery.aim(ride,view);
  camera.position.set(p.x,p.y-10,p.z);
  camera.lookAt(p.x+Math.cos(a.yaw)*Math.cos(a.pitch),p.y-10+Math.sin(a.pitch),p.z+Math.sin(a.yaw)*Math.cos(a.pitch));
  camera.updateMatrixWorld(true);return a.yaw;
 }
 window.level29AircraftCamera={pose};
 const place=placeCamera;
 placeCamera=function(){
  const ride=window.level29Downtown?.ride;
  if(!ride)return place.apply(this,arguments);
  // Same pose is applied before each shot and before rendering: input steers
  // the center crosshair, rather than selecting a nearby ground target.
  return level29AircraftCamera.pose(ride);
 };
 const model=syncViewModel;syncViewModel=function(){model.apply(this,arguments);if(!window.level29Downtown?.ride)return;gun.visible=false;dash.visible=false;if(extraWeap)for(const m of Object.values(extraWeap))m.visible=false;};
 const weapon=fireWeapon;
 fireWeapon=function(){if(window.level29Downtown?.ride)return;return weapon.apply(this,arguments);};
})();
