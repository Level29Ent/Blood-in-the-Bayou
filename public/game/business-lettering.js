'use strict';
(function(){
const cache=new Map();
function shapes(text,font){const result=[];let offset=0;for(const ch of text.toUpperCase().replace(/[^A-Z0-9 &.'-]/g,' ')){const glyph=font.glyphs[ch]||font.glyphs['?'],p=new THREE.ShapePath(),o=(glyph.o||'').split(' ');for(let i=0;i<o.length;){const cmd=o[i++],n=()=>Number(o[i++])/font.resolution;let x,y;if(cmd==='m')p.moveTo(n()+offset,n());else if(cmd==='l')p.lineTo(n()+offset,n());else if(cmd==='q'){x=n()+offset;y=n();p.quadraticCurveTo(n()+offset,n(),x,y);}else if(cmd==='b'){x=n()+offset;y=n();p.bezierCurveTo(n()+offset,n(),n()+offset,n(),x,y);}else if(!cmd)break;else throw Error('Unsupported font contour');}result.push(...p.toShapes());offset+=glyph.ha/font.resolution;}return result;}
function geometry(text){if(!cache.has(text)){const g=new THREE.ExtrudeGeometry(shapes(text,level29BusinessFont),{depth:.09,bevelEnabled:false,curveSegments:3,steps:1});g.computeBoundingBox();cache.set(text,g);}return cache.get(text);}
function create(text,width=120){const geo=geometry(text),box=geo.boundingBox,size=box.getSize(new THREE.Vector3()),scale=Math.min(width/Math.max(.1,size.x),8/Math.max(.1,size.y)),group=new THREE.Group();group.name='raised-business-name:'+text;const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:'#e7d3a0',metalness:.5,roughness:.38}));mesh.scale.set(scale,scale,scale);mesh.position.set(-(box.min.x+size.x/2)*scale,-box.min.y*scale,0);group.add(mesh);return group;}
if(typeof module!=='undefined')module.exports={shapes};if(typeof window==='undefined')return;
const builder=buildVenue;
buildVenue=function(v){
 if(v.mesh?.userData.businessLettering)return builder.apply(this,arguments);
 const oldSign=addSign,generated=[];
 // Capture only signs made by this venue build. Interior instruction placards
 // remain small; name and repeated entrance banners become one facade name.
 addSign=function(group,text,w,h,x,y,z){if(v.id==='mall'&&v.mallLayout?.shops.some(s=>s.name===text)){const m=create(text,Math.min(w,90));m.name='raised-shop-name:'+text;m.position.set(x,y,z);group.add(m);generated.push(m);return m;}const m=oldSign.apply(this,arguments);m.userData.venuePlacard=true;generated.push(m);return m;};
 try{builder.apply(this,arguments);}finally{addSign=oldSign;}
 if(!v.mesh||v.mesh.userData.businessLettering)return;
 for(const sign of generated){const text=sign.name.replace('venue-sign:','');if(text===v.name||text===v.short||/WALK IN|AUTO DOOR|DRIVE IN|BUY WEAPONS|VEHICLE SALES/.test(text)){sign.parent?.remove(sign);}else if(sign.geometry?.parameters?.width>75){const w=sign.geometry.parameters.width;sign.scale.multiplyScalar(Math.min(1,65/w));}}
 // World/local build occurs before street-frontage transforms this group.
 const name=create(v.name,Math.max(40,v.b.w-18));name.position.set(v.doorX,53,v.doorY+3);v.mesh.add(name);v.mesh.userData.businessLettering=true;
 for(const actor of [v.worker,...(v.staff||[]).map(s=>s.m)].filter(Boolean)){const sprites=[];actor.traverse(o=>{if(o.isSprite)sprites.push(o);});for(const s of sprites){s.scale.set(10,1.5,1);s.position.y=25;s.userData.workerNameplate=true;}}
};
const renderBase=render;render=function(){for(const v of city?.venues||[])for(const actor of [v.worker,...(v.staff||[]).map(s=>s.m)].filter(Boolean))actor.traverse(o=>{if(o.userData.workerNameplate){const p=new THREE.Vector3();actor.getWorldPosition(p);const d=player?Math.hypot(player.x-p.x,player.y-p.z):Infinity;o.visible=!!player&&insideVenue(v,player)&&d<55&&d>14;}});renderBase.apply(this,arguments);};
window.level29BusinessLettering={create,shapes};
})();
