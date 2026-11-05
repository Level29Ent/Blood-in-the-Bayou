'use strict';
(function(){
const ART={bayou:{name:'BLOOD IN THE BAYOU',file:'posters/blood-in-the-bayou.webp',aspect:515/764},viral:{name:'VIRAL',file:'posters/viral.webp',aspect:501/668}};
function create(THREE,id,height=32,texture){const art=ART[id];if(!art)throw Error('Unknown film poster');const mesh=new THREE.Mesh(new THREE.PlaneGeometry(height*art.aspect,height),new THREE.MeshBasicMaterial({map:texture||null,color:texture?'#ffffff':'#b6a681',side:THREE.DoubleSide,toneMapped:false}));mesh.name='Official movie poster · '+art.name;mesh.userData.noBatch=true;return mesh;}
function mounts(b){return [0,1].map(i=>({x:b.x+4.5,z:b.y+b.h*(.38+i*.28),height:18,y:29,angle:Math.PI/2}));}
if(typeof module!=='undefined')module.exports={ART,create,mounts};if(typeof window==='undefined')return;if(window.level29PosterReview){window.level29PosterModels={ART,create,mounts};return;}
const textures=new Map();function texture(id){if(!textures.has(id)){const t=new THREE.TextureLoader().load(ART[id].file);t.encoding=THREE.sRGBEncoding;t.anisotropy=1;textures.set(id,t);}return textures.get(id);}
function poster(id,height){return create(THREE,id,height,texture(id));}
const build=buildCity;buildCity=function(){build.apply(this,arguments);const root=new THREE.Group();root.name='Official Level 29 film posters';cityGroup.add(root);for(const v of city.venues||[]){if(!v.mesh||!['safe','studio','business'].includes(v.id))continue;const b=v.frontage?.canonical||v.b;for(const [i,id]of ['bayou','viral'].entries()){const mount=mounts(b)[i],p=poster(id,mount.height);p.position.set(mount.x,mount.y,mount.z);p.rotation.y=mount.angle;const frame=new THREE.Mesh(new THREE.BoxGeometry(1,20,18*ART[id].aspect+2),new THREE.MeshStandardMaterial({color:'#514536',roughness:.8}));frame.position.set(mount.x-.55,mount.y,mount.z);frame.userData.noBatch=true;v.mesh.add(frame,p);}}};
window.level29MoviePosters={ART,poster};
})();
