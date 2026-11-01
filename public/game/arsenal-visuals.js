'use strict';
// Detailed, reusable cosmetic meshes. Combat, inventory and collectible IDs are unchanged.
(function(){
const mats={};
function finish(name,color,roughness=.6,metalness=0){
 if(!mats[name])mats[name]=new THREE.MeshStandardMaterial({color,roughness,metalness});
 return mats[name];
}
const metal=finish('steel','#42494b',.34,.78),dark=finish('blackened','#202628',.47,.66),
 edge=finish('edges','#818b8a',.35,.8),rubber=finish('rubber','#171c1c',.92),
 olive=finish('olive','#535e44',.78,.08),brass=finish('brass','#b69b54',.3,.75),
 copper=finish('copper','#99704b',.38,.65),cloth=finish('cloth','#39413a',.95),
 glove=finish('glove','#3c3b33',.92),seam=finish('seam','#656252',.95);
const grain=canvasTex(256,128,g=>{
 g.fillStyle='#754e30';g.fillRect(0,0,256,128);
 const rng=mkRng(2907);
 for(let i=0;i<170;i++){g.strokeStyle=i%3?'rgba(31,15,6,.18)':'rgba(231,190,123,.19)';g.lineWidth=.5+rng();
 g.beginPath();const y=rng()*128;g.moveTo(0,y);g.bezierCurveTo(70,y+rng()*7,180,y-rng()*6,256,y+2);g.stroke();}
});
const wood=new THREE.MeshStandardMaterial({map:grain,roughness:.66});
// Fine machining / woven fabric surface relief stays legible on small displays.
const machining=canvasTex(128,128,g=>{
 g.fillStyle='#888';g.fillRect(0,0,128,128);const r=mkRng(2914);
 for(let y=0;y<128;y++){g.fillStyle=y%3?'#929292':'#666';g.fillRect(0,y,128,.6);}
 for(let i=0;i<120;i++){g.fillStyle=r()>.5?'#aaa':'#777';g.fillRect(r()*128,r()*128,2+r()*9,.6);}
});
machining.wrapS=machining.wrapT=THREE.RepeatWrapping;machining.repeat.set(3,3);
for(const m of [metal,dark,edge,olive]){m.bumpMap=machining;m.bumpScale=.045;m.needsUpdate=true;}
function put(g,m,x=0,y=0,z=0){m.position.set(x,y,z);g.add(m);return m;}
function rounded(w,h,d,mat,r=.12){
 r=Math.min(r,w*.22,h*.22,d*.22);
 const s=new THREE.Shape();s.moveTo(-w/2+r,-h/2+r);s.lineTo(w/2-r,-h/2+r);s.lineTo(w/2-r,h/2-r);s.lineTo(-w/2+r,h/2-r);s.closePath();
 const geo=new THREE.ExtrudeGeometry(s,{depth:Math.max(.01,d-2*r),steps:1,bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:2,curveSegments:1});
 geo.translate(0,0,-d/2+r);geo.computeVertexNormals();return new THREE.Mesh(geo,mat);
}
function rb(g,w,h,d,mat,x,y,z,r){return put(g,rounded(w,h,d,mat,r),x,y,z);}
function cy(g,r1,r2,len,mat,x,y,z,axis='z',segments=16){
 const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,len,segments),mat);
 if(axis==='z')m.rotation.x=Math.PI/2;if(axis==='x')m.rotation.z=Math.PI/2;
 return put(g,m,x,y,z);
}
function ring(g,r,t,mat,x,y,z,axis='z'){
 const m=new THREE.Mesh(new THREE.TorusGeometry(r,t,6,20),mat);
 if(axis==='y')m.rotation.x=Math.PI/2;if(axis==='x')m.rotation.y=Math.PI/2;
 return put(g,m,x,y,z);
}
function label(text,sub,color='#d5cbb0'){
 return canvasTex(256,128,g=>{
  g.fillStyle='#242b28';g.fillRect(0,0,256,128);g.strokeStyle=color;g.lineWidth=3;g.strokeRect(8,8,240,112);
  g.fillStyle=color;g.font='bold 30px monospace';g.fillText(text,17,48);g.font='14px monospace';g.fillText(sub,17,73);
  for(let i=0;i<48;i++){const w=1+(i*17%3);g.fillRect(18+i*4.4,88,w,20);}
 });
}
function plate(g,tex,w,h,x,y,z){
 const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tex,roughness:.85}));
 return put(g,m,x,y,z);
}
// Combine static parts by material. A detailed package draws in a handful of calls, not dozens.
function bake(g){
 g.updateMatrixWorld(true);const buckets=new Map(),old=[];
 g.traverse(o=>{if(!o.isMesh||o.userData.keep)return;old.push(o);const mat=o.material,key=mat.uuid+'|'+!!o.userData.firstPersonOnly;if(!buckets.has(key))buckets.set(key,{mat,geos:[],firstPersonOnly:!!o.userData.firstPersonOnly});const a=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();a.applyMatrix4(o.matrixWorld);buckets.get(key).geos.push(a);});
 for(const o of old)o.parent.remove(o);
 for(const {mat,geos,firstPersonOnly}of buckets.values()){
  const result=new THREE.BufferGeometry();
  for(const attr of ['position','normal','uv']){
   if(!geos.every(a=>a.attributes[attr]))continue;
   const size=geos[0].attributes[attr].itemSize,total=geos.reduce((n,a)=>n+a.attributes[attr].array.length,0),data=new Float32Array(total);let off=0;
   for(const a of geos){data.set(a.attributes[attr].array,off);off+=a.attributes[attr].array.length;}
   result.setAttribute(attr,new THREE.BufferAttribute(data,size));
  }
  result.computeBoundingSphere();const merged=new THREE.Mesh(result,mat);merged.userData.firstPersonOnly=firstPersonOnly;g.add(merged);for(const a of geos)a.dispose();
 }
 const retired=new Set(old.map(o=>o.geometry));for(const geo of retired)geo.dispose();
 return g;
}
function arms(g,one=false){
 const existing=new Set(g.children);
 const cuff=finish('cuff','#232b29',.96);
 const sleeve=(a,b)=>{
  const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),v=end.clone().sub(start);
  const m=new THREE.Mesh(new THREE.CylinderGeometry(.92,1.2,v.length(),14),cuff);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());m.position.copy(start.add(end).multiplyScalar(.5));g.add(m);
 };
 const hand=(x,y,z,a)=>{
  const palm=rb(g,1.65,1.8,2.2,glove,x,y,z,.25);palm.rotation.z=a;
  rb(g,1.8,.65,1.9,cuff,x,y-.85,z+.6,.18);
  for(let k=0;k<4;k++){rb(g,.34,.65,1.1,glove,x-.62+k*.4,y+.16,z-.95,.14);rb(g,.27,.13,.65,seam,x-.62+k*.4,y+.54,z-1,.05);}
  const thumb=rb(g,.55,.7,1.15,glove,x+.94,y-.05,z-.25,.2);thumb.rotation.z=-.55;
 };
 hand(.6,-2.3,2.5,-.12);
 sleeve([.7,-3.2,3.1],[2.8,-5.4,10.3]);
 if(!one){hand(-.1,-1.7,-6,-.12);sleeve([-.1,-2.7,-4.8],[-1.6,-4.9,3.4]);}
 for(const child of g.children)if(!existing.has(child))child.traverse(o=>{o.userData.firstPersonOnly=true;});
}
function screws(g,x,y,z,count=3){
 for(let k=0;k<count;k++){cy(g,.11,.11,.06,edge,x,y,z+k*.8,'x',8);rb(g,.07,.13,.025,dark,x+.04,y,z+k*.8,.01);}
}
function sights(g,frontZ,backZ,height=2.1){
 rb(g,.32,.65,.35,dark,0,height-.4,frontZ,.06);
 ring(g,.42,.07,metal,0,height+.2,frontZ);
 rb(g,.09,.55,.12,edge,0,height+.03,frontZ,.02);
 for(const s of [-1,1])rb(g,.22,.6,.65,metal,s*.55,height-.1,backZ,.04);
}
function buildM240(){
 const g=new THREE.Group();
 rb(g,2.05,2.1,7.8,dark,0,.1,0,.2);rb(g,2.15,.52,6.1,metal,0,1.42,-.6,.12);
 rb(g,1.75,.18,4.8,rubber,0,1.77,-.4,.05);
 for(let i=0;i<10;i++)rb(g,2.02,.13,.17,edge,0,1.85,-2.5+i*.44,.03);
 const heat=new THREE.MeshStandardMaterial({color:'#343b3d',metalness:.78,roughness:.4,emissive:'#000000'});
 g.userData.barrel=heat;cy(g,.28,.36,11.5,heat,0,.43,-9.6);
 cy(g,.45,.48,1.35,dark,0,.43,-15.8);cy(g,.26,.26,.04,rubber,0,.43,-16.49);
 ring(g,.32,.07,edge,0,.43,-16.52);
 rb(g,1.45,1.25,5.9,olive,0,-.27,-6.5,.19);
 for(let s of [-1,1])for(let i=0;i<7;i++)rb(g,.03,.36,.38,rubber,s*.73,-.04,-8.9+i*.73,.04);
 cy(g,.16,.16,7.3,dark,0,-.52,-9.9);
 for(let i=0;i<5;i++)ring(g,.4,.09,metal,0,.43,-10.1-i*.45);
 const stock=rb(g,1.7,2.25,5.3,olive,0,-.35,6,.22);stock.rotation.x=-.07;
 rb(g,1.9,2.65,.5,rubber,0,-.55,8.8,.15);
 const grip=rb(g,.83,2.8,1.25,rubber,.15,-2.08,2.5,.15);grip.rotation.x=-.2;
 ring(g,.78,.12,dark,.1,-1.8,.85,'x');
 rb(g,.45,1.15,.25,metal,.15,-1.8,1.1,.05);
 rb(g,3.1,3.3,3.5,cloth,-2.7,-1.7,-.5,.25);
 for(const z of [-1.7,.7])rb(g,3.25,.24,.26,olive,-2.7,-.4,z,.06);
 for(let i=0;i<8;i++){
  const x=-3.2+i*.43,y=.35+Math.sin(i*.52)*.26;
  cy(g,.17,.17,1.3,brass,x,y,-.95);cy(g,.16,.035,.58,copper,x,y,-1.88);
  rb(g,.22,.15,.45,metal,x,y-.12,-.5,.02);
 }
 for(const s of [-1,1]){const bipod=rb(g,.18,.24,6.8,dark,s*.63,-.7,-11,.05);bipod.rotation.y=s*.075;cy(g,.18,.18,.45,edge,s*.65,-.7,-7.9,'x');}
 screws(g,1.04,.25,-2,4);rb(g,.35,.32,2.2,metal,1.3,.3,1,.08);
 sights(g,-12.8,1.1,2.05);arms(g);
 const mark=plate(g,label('L29 / M240','FIELD SERVICE'),1.3,.65,0,.5,4.05);mark.userData.keep=true;
 const flashMesh=new THREE.Mesh(new THREE.PlaneGeometry(5,5),new THREE.MeshBasicMaterial({map:starTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
 flashMesh.position.set(0,.43,-16.7);flashMesh.userData.keep=true;g.add(flashMesh);g.userData.flash=flashMesh;
 return bake(g);
}
function buildShotgun(){
 const g=new THREE.Group();
 rb(g,1.65,1.85,5.5,dark,0,.15,.5,.18);
 cy(g,.36,.4,14,metal,0,.6,-8.6);cy(g,.24,.28,11.7,dark,0,-.25,-7.6);
 ring(g,.39,.07,edge,0,.6,-15.62);cy(g,.3,.3,.03,rubber,0,.6,-15.65);
 rb(g,1.74,1.25,4.7,wood,0,-.4,-6.3,.2);
 for(let i=0;i<9;i++)rb(g,1.79,.12,.13,dark,0,-.38,-8.15+i*.47,.025);
 const st=rb(g,1.65,2.15,5.7,wood,0,-.45,5.8,.3);st.rotation.x=-.12;
 rb(g,1.8,2.5,.55,rubber,0,-.72,8.9,.17);
 ring(g,.72,.12,dark,0,-1.55,1.5,'x');
 rb(g,.85,1.9,1.4,wood,.05,-1.45,2.7,.14);
 rb(g,.035,.8,1.6,rubber,.84,.35,-.25,.05);screws(g,-.86,.3,-.2,3);
 cy(g,.13,.13,.22,brass,0,1.05,-14.5,'y',10);
 for(let i=0;i<4;i++){cy(g,.23,.23,1.25,finish('shell','#873b31',.6),-1.05,-.1,-1.25+i*.7,'y');cy(g,.25,.25,.23,brass,-1.05,-.78,-1.25+i*.7,'y');}
 arms(g);return bake(g);
}
function buildRPG(){
 const g=new THREE.Group();
 cy(g,1.05,1.05,19.5,dark,0,1.4,-3.9);
 cy(g,1.5,1.08,2.3,metal,0,1.4,6.6);
 ring(g,1.34,.14,edge,0,1.4,7.8);cy(g,1.18,1.18,.03,rubber,0,1.4,7.82);
 cy(g,1.2,1.2,6.8,olive,0,1.4,-2.8);
 for(const z of [-6,-.2])ring(g,1.22,.1,edge,0,1.4,z);
 cy(g,.8,1.75,3.1,olive,0,1.4,-15.2);cy(g,1.75,.04,4.6,olive,0,1.4,-19);
 ring(g,1.74,.08,edge,0,1.4,-16.7);
 const grip=rb(g,.8,2.8,1.3,wood,0,-.9,-1,.16);grip.rotation.x=-.15;
 rb(g,.85,2.5,1.2,wood,0,-.8,-5.2,.15);
 rb(g,.5,1.5,2.1,metal,-1.5,2.1,-3,.1);cy(g,.52,.52,3.2,dark,-1.65,3.05,-3.9);
 cy(g,.42,.42,.06,finish('optic','#467071',.16,.4),-1.65,3.05,-2.25);
 rb(g,.15,1.25,.15,edge,0,3.15,-11,.03);
 arms(g);return bake(g);
}
function buildMolotov(){
 const g=new THREE.Group(),profile=[[0,-3.1],[1.2,-3.1],[1.48,-2.85],[1.5,1.5],[1.2,2.3],[.56,3.1],[.51,5.1],[.64,5.25],[.65,5.6],[0,5.6]].map(p=>new THREE.Vector2(...p));
 const glass=new THREE.MeshPhysicalMaterial({color:'#7b9b69',transparent:true,opacity:.58,roughness:.16,metalness:.05,clearcoat:1,depthWrite:false,side:THREE.FrontSide});
 put(g,new THREE.Mesh(new THREE.LatheGeometry(profile,24),glass),.8,0,-5.7);
 cy(g,1.32,1.32,3.4,finish('liquid','#6b5730',.35),.8,-1.1,-5.7,'y');
 ring(g,.57,.12,edge,.8,5.4,-5.7,'y');
 put(g,new THREE.Mesh(new THREE.CylinderGeometry(1.53,1.53,2.3,24,1,true,-Math.PI/3,Math.PI*2/3),new THREE.MeshStandardMaterial({map:label('BAYOU','GLASS / RETURNABLE','#c8c2a6'),roughness:.9})),.8,-.4,-5.7);
 const wick=rb(g,.48,2.2,.55,finish('rag','#aaa48c',1),.9,6,-5.7,.15);wick.rotation.z=-.3;
 const rig=new THREE.Group();arms(rig,true);rig.position.set(.2,.6,-7.5);g.add(rig);
 const rag=new THREE.Mesh(new THREE.PlaneGeometry(1.8,3.4),new THREE.MeshBasicMaterial({map:starTex,color:'#ffad46',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
 rag.position.set(.95,7.3,-5.7);rag.userData.keep=true;g.add(rag);g.userData.rag=rag;
 // Transparent glass is kept separate so the label and liquid sort correctly.
 return g;
}
function buildBat(){
 const g=new THREE.Group();
 const profile=[[0,-1],[.48,-1],[.56,-.8],[.42,-.5],[.4,4],[.64,8],[1.03,12.5],[1.12,16],[1.03,17.6],[.55,18],[0,18]].map(p=>new THREE.Vector2(...p));
 const batWood=wood.clone();batWood.map=grain.clone();batWood.map.center.set(.5,.5);batWood.map.rotation=Math.PI/2;batWood.map.needsUpdate=true;
 put(g,new THREE.Mesh(new THREE.LatheGeometry(profile,20),batWood));
 for(let i=0;i<13;i++){const r=ring(g,.43,.065,rubber,0,.1+i*.28,0,'y');r.rotation.z=.06;}
 cy(g,.61,.61,.23,dark,0,-.78,0,'y');
 const decal=plate(g,label('LEVEL 29','ASH / PRO SERIES'),1.4,2.5,0,13.4,1.09);
 const rig=new THREE.Group();arms(rig,true);rig.position.set(-.6,1.9,-2.2);g.add(rig);return bake(g);
}
let caseTemplate=null;
const haloMaterial=new THREE.MeshBasicMaterial({color:'#d3b565',transparent:true,opacity:.36,depthWrite:false,side:THREE.DoubleSide});
function supplyCase(){
 if(!caseTemplate){
  const body=new THREE.Group();
  rb(body,16.6,6.3,10.8,olive,0,4.1,0,.65);
  rb(body,17.2,1.7,11.3,dark,0,8.1,0,.48);
  rb(body,16.5,.7,10.7,olive,0,9,0,.25);
  for(const x of [-7.7,7.7])for(const z of [-4.9,4.9])rb(body,1.5,6.4,1.5,rubber,x,4.2,z,.28);
  for(const x of [-5,5]){rb(body,1.5,2.2,.55,edge,x,6.8,5.5,.12);rb(body,.8,1.25,.68,dark,x,6.7,5.85,.08);}
  for(const x of [-5,5]){rb(body,2.2,.8,.5,metal,x,7.2,-5.6,.12);cy(body,.25,.25,2.4,edge,x,7.3,-5.85,'x');}
  for(const x of [-8.55,8.55]){rb(body,.4,2.6,4.3,dark,x,4.8,0,.12);ring(body,1.15,.2,rubber,x*1.03,4.8,0,'x');}
  for(const x of [-5.9,5.9])for(const z of [-3.4,3.4])rb(body,.55,.34,1.2,edge,x,9.4,z,.08);
  for(const x of [-2.4,2.4])rb(body,.5,1.3,.6,metal,x,4.4,5.9,.09);
  rb(body,5.2,.6,.8,rubber,0,3.9,6.2,.16);
  for(const x of [-5.5,5.5])rb(body,1.1,.25,8.8,dark,x,9.45,0,.05);
  const tex=label('LEVEL 29','SEALED FIELD CACHE / SUPPLIES','#d9cfae');
  const top=plate(body,tex,7,3.5,0,9.43,0);top.rotation.x=-Math.PI/2;
  plate(body,tex,6,2.5,0,5.8,5.56);
  const rear=plate(body,tex,4.6,2,0,5.1,-5.56);rear.rotation.y=Math.PI;
  rb(body,.65,4,.15,finish('seal','#b88a40',.75),3.4,6.5,5.7,.06);
  rb(body,.9,.32,.2,new THREE.MeshStandardMaterial({color:'#9cab8d',emissive:'#7e9c68',emissiveIntensity:.8,roughness:.5}),-3.5,6.8,5.7,.04);
  caseTemplate=bake(body);
 }
 const root=new THREE.Group(),body=caseTemplate.clone(true);root.add(body);root.userData.caseBody=body;
 const halo=new THREE.Mesh(new THREE.RingGeometry(11.4,12.7,40),haloMaterial);
 halo.rotation.x=-Math.PI/2;halo.position.y=.3;root.add(halo);root.userData.halo=halo;
 return root;
}
const oldBuild=buildGtaMeshes;
buildGtaMeshes=function(){
 oldBuild();
 pkgMeshes=pkgMeshes.map(old=>{
  const m=supplyCase();m.position.copy(old.position);m.position.y=0;m.userData.id=old.userData.id;m.userData.heading=hash(String(m.userData.id).split('').reduce((a,c)=>a+c.charCodeAt(0),0))*6.28;
  gtaGroup.remove(old);gtaGroup.add(m);return m;
 });
};
let installed=false;
const oldPools=ensurePools;
ensurePools=function(){
 oldPools();if(installed)return;installed=true;
 const oldGun=gun;gun=buildM240();gun.scale.copy(oldGun.scale);gun.position.copy(oldGun.position);vmScene.remove(oldGun);vmScene.add(gun);muzzle=gun.userData.flash;
 const models={shotgun:buildShotgun(),rpg:buildRPG(),molotov:buildMolotov(),bat:buildBat()};
 for(const k in models){const old=extraWeap[k],m=models[k];m.scale.copy(old.scale);m.position.copy(old.position);m.visible=false;vmScene.remove(old);vmScene.add(m);extraWeap[k]=m;}
};
const oldSync=syncGta;
syncGta=function(){
 oldSync();
 if(extraWeap)for(const m of Object.values(extraWeap)){m.scale.setScalar(SW<700?.53:.55);if(SW<700){m.position.x-=2.9;m.position.y+=1.6;}}
 for(const m of pkgMeshes){
  const d=player?dist((player.car||player).x,(player.car||player).y,m.position.x,m.position.z):10000;
  m.visible=state!=='menu'&&!packagesFound.has(m.userData.id)&&d<260;
  m.position.y=city&&city.heightAt?Math.max(0,city.heightAt(m.position.x,m.position.z)):0;
  m.rotation.y=m.userData.heading;
  m.userData.caseBody.position.y=.25+Math.sin(frame*.025+m.position.x)*.15;
  m.userData.halo.material.opacity=(isNight()?.52:.3)+Math.sin(frame*.04)*.06;
 }
};
const oldView=syncViewModel;
syncViewModel=function(){oldView();if(gun&&installed){gun.scale.setScalar(SW<700?.53:.55);if(SW<700){gun.position.x-=2.9;gun.position.y+=1.6;}}};
window.level29ArsenalVisuals={version:1,createDisplayModels(){
 ensurePools();const models={m240:gun,...extraWeap},out={};
 for(const [id,source]of Object.entries(models)){
  const clone=source.clone(true),remove=[];clone.visible=true;
  clone.traverse(o=>{if(o.userData.firstPersonOnly||o.isMesh&&o.material?.transparent&&o.material?.blending===THREE.AdditiveBlending)remove.push(o);else if(o.isMesh)o.userData.noBatch=true;});
  for(const o of remove)o.parent?.remove(o);
  out[id]=clone;
 }return out;
},createCacheMesh(){const m=supplyCase();m.traverse(o=>{o.userData.noBatch=true;});return m;},get packages(){return pkgMeshes;},get weapons(){return {m240:gun,...extraWeap};}};
})();
