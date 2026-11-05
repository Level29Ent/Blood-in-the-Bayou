'use strict';
(function(){
// Small merged opaque markings remain sharp without enlarging the world texture.
function markings(c,roads,width,tile,road,bridge){const white=[],yellow=[];const blocked=r=>c.buildings.some(b=>r.x<b.x+b.w&&r.x+r.w>b.x&&r.z<b.y+b.h&&r.z+r.d>b.y);const emit=(out,x,z,w,d)=>{const r={x,z,w,d};if(blocked(r))return;const samples=[[x,z],[x+w,z],[x,z+d],[x+w,z+d]];if(!samples.every(([a,b])=>[road,bridge].includes(c.get(Math.floor(a/tile),Math.floor(b/tile)))))return;out.push(r);};
 for(const a of roads){const mid=(a+1.5)*tile;for(let k=0;k<width;k++){const cross=roads.some(b=>k>=b-1&&k<=b+3);if(cross)continue;for(const offset of [-3,1]){emit(yellow,mid+offset,k*tile+4,2,24);emit(yellow,k*tile+4,mid+offset,24,2);}}
 for(const b of roads){if(c.get(a+1,b+1)!==road)continue;const x=a*tile,z=b*tile;for(let s=0;s<8;s++){emit(white,x+4+s*11,z-14,6,12);emit(white,x+4+s*11,z+3*tile+2,6,12);emit(white,x-14,z+4+s*11,12,6);emit(white,x+3*tile+2,z+4+s*11,12,6);}}}return {white,yellow};}
function geometry(THREE,rects,height){const p=[];for(const r of rects){const points=[[r.x,r.z],[r.x,r.z+r.d],[r.x+r.w,r.z+r.d],[r.x,r.z],[r.x+r.w,r.z+r.d],[r.x+r.w,r.z]];for(const [x,z]of points)p.push(x,height(x,z)+.16,z);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.computeBoundingSphere();return g;}
if(typeof module!=='undefined')module.exports={markings,geometry};if(typeof window==='undefined')return;
window.level29RoadPaint={markings,geometry};
let materials=null;
const build=buildCity;buildCity=function(){const result=build.apply(this,arguments);if(!city?.world)return result;if(!materials)materials={white:new THREE.MeshBasicMaterial({color:'#cfcfc7',polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),yellow:new THREE.MeshBasicMaterial({color:'#c4a33f',polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1})};const paint=markings(city,ROADS,MW,TILE,T_ROAD,T_BRIDGE),root=new THREE.Group();root.name='Sharp vector road markings';for(const key of ['white','yellow']){if(!paint[key].length)continue;const mat=materials[key],mesh=new THREE.Mesh(geometry(THREE,paint[key],(x,z)=>city.heightAt(x,z)||0),mat);mesh.userData.noBatch=true;root.add(mesh);}cityGroup.add(root);};
})();
