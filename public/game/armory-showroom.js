'use strict';
(function(){
const ids=['m240','shotgun','rpg','molotov','bat','smg','carbine'];
function build(v,g){
 const models=window.level29ArsenalVisuals?.createDisplayModels();if(!models)return;
 const cells=level29SiteLayout.slots(v.b,ids.length),steel=new THREE.MeshStandardMaterial({color:'#434f55',metalness:.65,roughness:.36}),rim=new THREE.MeshStandardMaterial({color:'#c6b075',metalness:.55,roughness:.3});v.weaponDisplays=[];
 cells.forEach((cell,i)=>{
 const id=ids[i],m=models[id];if(!m)return;
 // Normalize against the actual model bounds, including attachments, not hardcoded gun dimensions.
 m.position.set(0,0,0);m.rotation.set(0,Math.PI/2,0);m.scale.setScalar(1);m.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(m),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
 const scale=Math.min((cell.w-4)/Math.max(size.x,.01),(cell.d-4)/Math.max(size.z,.01),17/Math.max(size.y,.01));
 const stand=new THREE.Group();stand.name='armory-display-'+id;stand.position.set(cell.x,0,cell.y);g.add(stand);
 addPart(stand,cell.w,cell.top,cell.d,0,cell.top/2,0,steel);addPart(stand,cell.w+1,1,cell.d+1,0,cell.top+.5,0,rim);
 m.scale.setScalar(scale);m.position.set(-center.x*scale,cell.top+2-bounds.min.y*scale,-center.z*scale);stand.add(m);
 addSign(stand,WEAPONS[id].name,cell.w-1,4,0,cell.top-3,cell.d/2+.1,'#ead7a6');
 const lamp=new THREE.SpotLight('#fff0d4',.85,65,.45,.65,1);lamp.position.set(cell.x,45,cell.y+7);lamp.target.position.set(cell.x,cell.top+7,cell.y);lamp.castShadow=false;lamp.visible=false;g.add(lamp, lamp.target);
 const collider={x:cell.x-cell.w/2,y:cell.y-cell.d/2,w:cell.w,h:cell.d};v.furniture.push(collider);
 v.weaponDisplays.push({id,model:m,stand,light:lamp,collider,cell});
 });
}
const renderBase=render;render=function(){
 if(city&&player)for(const v of city.venues||[])if(v.weaponDisplays)for(const d of v.weaponDisplays)d.light.visible=state==='play'&&!player.dead&&window.level29Graphics?.quality==='high'&&insideVenue(v,player);
 renderBase.apply(this,arguments);
};
window.level29ArmoryShowroom={build};
})();
