'use strict';
(function(){
const ids=['m240','shotgun','rpg','molotov','bat','smg','carbine','pistol','marksman'];
function build(v,g){
 const retail=window.level29ArmoryRetail,P=retail?.palette(THREE);
 const models=window.level29ArsenalVisuals?.createDisplayModels()||{};
 if(retail)retail.build(THREE,v,g,level29World,addSign,P);
 const cells=level29SiteLayout.slots(v.b,ids.length),steel=new THREE.MeshStandardMaterial({color:'#725037',metalness:.05,roughness:.7}),rim=new THREE.MeshStandardMaterial({color:'#a5afb0',metalness:.55,roughness:.3});v.weaponDisplays=[];
 cells.forEach((cell,i)=>{
 const id=ids[i],m=models[id]||(window.level29ArmoryReview&&retail?retail.silhouette(THREE,id==='pistol'?'pistol':id==='shotgun'?'shotgun':'carbine',P):null);if(!m)return;
 // Normalize against the actual model bounds, including attachments, not hardcoded gun dimensions.
 m.position.set(0,0,0);m.rotation.set(0,Math.PI/2,0);m.scale.setScalar(1);m.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(m),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
 const scale=Math.min((cell.w-4)/Math.max(size.x,.01),(cell.d-4)/Math.max(size.z,.01),7/Math.max(size.y,.01),.55);
 const stand=new THREE.Group();stand.name='armory-display-'+id;stand.position.set(cell.x,0,cell.y);g.add(stand);
 addPart(stand,cell.w,cell.top,cell.d,0,cell.top/2,0,steel);addPart(stand,cell.w+1,1,cell.d+1,0,cell.top+.5,0,rim);
 if(P){
  addPart(stand,cell.w-1,.3,cell.d-1,0,cell.top+1.1,0,P.cream);
  for(const side of [-1,1]){
   addPart(stand,.3,8,cell.d,side*cell.w/2,cell.top+5,0,P.glass);
   addPart(stand,cell.w,8,.3,0,cell.top+5,side*cell.d/2,P.glass);
   for(const end of [-1,1])addPart(stand,.6,8,.6,side*cell.w/2,cell.top+5,end*cell.d/2,rim);
  }
  addPart(stand,cell.w+1,.4,cell.d+1,0,cell.top+9.2,0,P.glass);
  addPart(stand,cell.w-2,.3,.5,0,cell.top+8.7,-cell.d/2+.6,P.glow);
 }

 m.scale.setScalar(scale);m.position.set(-center.x*scale,cell.top+1.5-bounds.min.y*scale,-center.z*scale);stand.add(m);
 addSign(stand,WEAPONS[id].name,cell.w-1,4,0,cell.top-3,cell.d/2+.1,'#ead7a6');
 const lamp=new THREE.SpotLight('#fff0d4',.65,65,.45,.65,1);lamp.position.set(cell.x,45,cell.y+7);lamp.target.position.set(cell.x,cell.top+4,cell.y);lamp.castShadow=false;lamp.visible=false;g.add(lamp, lamp.target);
 const collider={x:cell.x-cell.w/2,y:cell.y-cell.d/2,w:cell.w,h:cell.d};v.furniture.push(collider);
 v.weaponDisplays.push({id,model:m,stand,light:lamp,collider,cell});
 });
}
const renderBase=render;render=function(){
 if(city&&player)for(const v of city.venues||[])if(v.weaponDisplays)for(const [i,d]of v.weaponDisplays.entries())d.light.visible=i<2&&state==='play'&&!player.dead&&window.level29Graphics?.quality==='high'&&insideVenue(v,player);
 renderBase.apply(this,arguments);
};
window.level29ArmoryShowroom={build};
})();
