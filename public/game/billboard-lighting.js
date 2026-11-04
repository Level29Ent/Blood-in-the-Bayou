'use strict';
(function(){
function intensity(hour){const h=((hour%24)+24)%24,smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};return .08+1.52*(h>=12?smooth((h-17)/3):1-smooth((h-5)/2));}
function illuminate(mesh,hour){const old=mesh.material;mesh.material=new THREE.MeshStandardMaterial({map:old.map,emissiveMap:old.map,emissive:'#ffffff',emissiveIntensity:intensity(hour),roughness:.65,metalness:0,side:old.side,toneMapped:false});mesh.userData.noBatch=true;mesh.userData.nightBillboard=true;old.dispose();return mesh;}
if(typeof module!=='undefined')module.exports={intensity,illuminate};if(typeof window==='undefined')return;
let registered=[];function add(mesh){illuminate(mesh,window.level29TimeOfDay?.hour??8);registered.push(mesh);return mesh;}
const build=buildCity;buildCity=function(){registered=[];return build.apply(this,arguments);};
const updateBase=update;update=function(){updateBase.apply(this,arguments);const h=window.level29TimeOfDay?.hour??8,value=intensity(h);for(const m of registered)m.material.emissiveIntensity=value;};
window.level29BillboardLighting={add,intensity};
})();
