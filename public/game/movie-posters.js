'use strict';
(function(){
const ART={bayou:{name:'BLOOD IN THE BAYOU',file:'posters/blood-in-the-bayou.webp',aspect:515/764},viral:{name:'VIRAL',file:'posters/viral.webp',aspect:501/668}};
function create(THREE,id,height=32,texture){const art=ART[id];if(!art)throw Error('Unknown film poster');const mesh=new THREE.Mesh(new THREE.PlaneGeometry(height*art.aspect,height),new THREE.MeshBasicMaterial({map:texture||null,color:texture?'#ffffff':'#b6a681',side:THREE.DoubleSide,toneMapped:false}));mesh.name='Official movie poster · '+art.name;mesh.userData.noBatch=true;return mesh;}
if(typeof module!=='undefined')module.exports={ART,create};if(typeof window==='undefined')return;
const textures=new Map();function texture(id){if(!textures.has(id)){const t=new THREE.TextureLoader().load(ART[id].file);t.encoding=THREE.sRGBEncoding;t.anisotropy=1;textures.set(id,t);}return textures.get(id);}
function poster(id,height){return create(THREE,id,height,texture(id));}
const build=buildCity;buildCity=function(){build.apply(this,arguments);const root=new THREE.Group();root.name='Official Level 29 film posters';cityGroup.add(root);for(const v of city.venues||[]){if(!v.mesh||!['safe','studio','business'].includes(v.id))continue;const b=v.frontage?.canonical||v.b;for(const [i,id]of ['bayou','viral'].entries()){const p=poster(id,23);p.position.set(b.x+b.w/2+(i?1:-1)*16,30,b.y+4.2);v.mesh.add(p);}}};
window.level29MoviePosters={ART,poster};
})();
