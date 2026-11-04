'use strict';
(function(){
const cache=new Map();
function shapes(text,font){const result=[];let offset=0;for(const ch of text.toUpperCase().replace(/[^A-Z0-9 &.'-]/g,' ')){const glyph=font.glyphs[ch]||font.glyphs['?'],p=new THREE.ShapePath(),o=(glyph.o||'').split(' ');for(let i=0;i<o.length;){const cmd=o[i++],n=()=>Number(o[i++])/font.resolution;let x,y;if(cmd==='m')p.moveTo(n()+offset,n());else if(cmd==='l')p.lineTo(n()+offset,n());else if(cmd==='q'){x=n()+offset;y=n();p.quadraticCurveTo(n()+offset,n(),x,y);}else if(cmd==='b'){x=n()+offset;y=n();p.bezierCurveTo(n()+offset,n(),n()+offset,n(),x,y);}else if(!cmd)break;else throw Error('Unsupported font contour');}result.push(...p.toShapes());offset+=glyph.ha/font.resolution;}return result;}
function geometry(text){if(!cache.has(text)){const g=new THREE.ExtrudeGeometry(shapes(text,level29BusinessFont),{depth:.09,bevelEnabled:false,curveSegments:3,steps:1});g.computeBoundingBox();cache.set(text,g);}return cache.get(text);}
const glowCache=new Map();
// Rasterize the actual glyph contours, not a different system font. A local
// additive halo keeps signs luminous even with the mobile bloom pass disabled.
function glowTexture(text){
 if(glowCache.has(text))return glowCache.get(text);
 const geo=geometry(text),bounds=geo.boundingBox,size=bounds.getSize(new THREE.Vector3());
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=Math.max(64,Math.round(1024*(size.y+.5)/(size.x+.5)));
 const ctx=canvas.getContext('2d'),sx=canvas.width/(size.x+.5),sy=canvas.height/(size.y+.5);
 ctx.beginPath();
 for(const shape of shapes(text,level29BusinessFont))for(const contour of [shape,...shape.holes]){
  const points=contour.getPoints(4);points.forEach((p,i)=>{const x=(p.x-bounds.min.x+.25)*sx,y=canvas.height-(p.y-bounds.min.y+.25)*sy;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);});ctx.closePath();
 }
 ctx.shadowColor='#ffffff';ctx.shadowBlur=Math.max(3,sy*.1);ctx.fillStyle='#ffffff';ctx.fill('evenodd');
 const texture=new THREE.CanvasTexture(canvas);texture.encoding=THREE.sRGBEncoding;glowCache.set(text,texture);return texture;
}
function create(text,width=120,height=8,color='#85eaff'){
 const geo=geometry(text),box=geo.boundingBox,size=box.getSize(new THREE.Vector3()),scale=Math.min(width/Math.max(.1,size.x+.5),height/Math.max(.1,size.y+.5)),group=new THREE.Group();
 group.name='raised-business-name:'+text;
 const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:'#e9ffff',emissive:color,emissiveIntensity:2,metalness:.1,roughness:.3,toneMapped:false}));
 mesh.scale.setScalar(scale);mesh.position.set(-(box.min.x+size.x/2)*scale,-box.min.y*scale,0);group.add(mesh);
 const halo=new THREE.Mesh(new THREE.PlaneGeometry((size.x+.5)*scale,(size.y+.5)*scale),new THREE.MeshBasicMaterial({map:glowTexture(text),color,transparent:true,opacity:.45,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:true,toneMapped:false,side:THREE.FrontSide}));
 halo.name='neon-halo';halo.position.set(0,size.y*scale/2,.09*scale+.06);group.add(halo);return group;
}
function mounting(v){
 // Standard entry doors end at 41; the roof starts at 49–52. Fit the
 // whole halo on that lintel, not at the roof's midpoint (the old y=53).
 const roof=v.roof,roofDepth=roof?.geometry?.parameters?.height;
 const underside=Number.isFinite(roofDepth)?roof.position.y-roofDepth/2:52;
 const height=7,base=v.id==='mall'?103:underside-7;
 return {x:v.doorX,y:base,z:v.doorY+4.8,width:Math.max(20,v.b.w-18),height};
}
if(typeof module!=='undefined')module.exports={shapes};if(typeof window==='undefined')return;
const builder=buildVenue;
buildVenue=function(v){
 if(v.mesh?.userData.businessLettering)return builder.apply(this,arguments);
 const oldSign=addSign,generated=[];
 // Capture only signs made by this venue build. Interior instruction placards
 // remain small; name and repeated entrance banners become one facade name.
 addSign=function(group,text,w,h,x,y,z){if(v.id==='mall'&&v.mallLayout?.shops.some(s=>s.name===text)){const m=create(text,Math.min(w,90),Math.min(h,7));m.name='raised-shop-name:'+text;m.position.set(x,y,z);group.add(m);generated.push(m);return m;}const m=oldSign.apply(this,arguments);m.userData.venuePlacard=true;generated.push(m);return m;};
 try{builder.apply(this,arguments);}finally{addSign=oldSign;}
 if(!v.mesh||v.mesh.userData.businessLettering)return;
 for(const sign of generated){const text=sign.name.replace('venue-sign:','');if(text===v.name||text===v.short||/WALK IN|AUTO DOOR|DRIVE IN|BUY WEAPONS|VEHICLE SALES/.test(text)||sign.userData.venuePlacard&&Math.abs(sign.position.z-v.doorY)<=3&&sign.position.y>=38&&!text.startsWith('EXIT')){sign.parent?.remove(sign);}else if(sign.geometry?.parameters?.width>75){const w=sign.geometry.parameters.width;sign.scale.multiplyScalar(Math.min(1,65/w));}}
 // World/local build occurs before street-frontage transforms this group.
 const mount=mounting(v);if(v.privateResidence){mount.y=89;mount.width=Math.min(135,v.b.w-18);mount.height=7;}const name=create(v.name,mount.width,mount.height);name.position.set(mount.x,mount.y,mount.z);v.mesh.add(name);v.mesh.userData.businessLettering=true;
 for(const actor of [v.worker,...(v.staff||[]).map(s=>s.m)].filter(Boolean)){const sprites=[];actor.traverse(o=>{if(o.isSprite)sprites.push(o);});for(const s of sprites){s.scale.set(10,1.5,1);s.position.y=25;s.userData.workerNameplate=true;}}
};
const renderBase=render;render=function(){for(const v of city?.venues||[])for(const actor of [v.worker,...(v.staff||[]).map(s=>s.m)].filter(Boolean))actor.traverse(o=>{if(o.userData.workerNameplate){const p=new THREE.Vector3();actor.getWorldPosition(p);const d=player?Math.hypot(player.x-p.x,player.y-p.z):Infinity;o.visible=!!player&&insideVenue(v,player)&&d<55&&d>14;}});renderBase.apply(this,arguments);};
window.level29BusinessLettering={create,shapes,mounting};
})();
