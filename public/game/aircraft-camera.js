'use strict';
(function(){
 const place=placeCamera;
 placeCamera=function(){
  const ride=window.level29Downtown?.ride;
  if(!ride)return place.apply(this,arguments);
  // Bypass walking-camera terrain offsets; the .50 cal view is under the plane.
  const p=ride.mesh.position,a=ride.a+Math.PI/2;
  camera.position.set(p.x,p.y-10,p.z);
  const x=p.x+Math.cos(a)*150,y=p.z+Math.sin(a)*150;
  camera.lookAt(x,city.heightAt?city.heightAt(x,y):0,y);camera.updateMatrixWorld();
  return a;
 };
 const weapon=fireWeapon;
 fireWeapon=function(){if(window.level29Downtown?.ride)return;return weapon.apply(this,arguments);};
})();
