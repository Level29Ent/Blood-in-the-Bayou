'use strict';
(function(){
function buildKarma(THREE,options={}){
 const finish=options.finish||(typeof window!=='undefined'?window.level29InteriorRealism:null);
 const scene=new THREE.Group();scene.name='Karma dispensary · reference interior';
 const solids=[],materials=new Map();
 function box(x,y,z,w,h,d,color,solid=false){
  if(!materials.has(color)){const wood=[0x88735a,0x39322b,0x84683c,0x9b7b4f].includes(color),metal=[0x171c19,0x18201a,0x8ca69a,0x272b29].includes(color);materials.set(color,finish?finish.material(THREE,color,wood?'wood':metal?'metal':'paint'):new THREE.MeshStandardMaterial({color,roughness:.75}));}
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),materials.get(color));mesh.position.set(x,y,z);scene.add(mesh);
  if(solid)solids.push({x:x-w/2,y:z-d/2,w,h:d});return mesh;
 }
 // This venue has its own materials, not the generic shops' warm brick and wood.
 const floor=box(0,-.15,0,14,.3,16,0xd9d5ca);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const pen=canvas.getContext('2d');
 pen.fillStyle='#d9d5ca';pen.fillRect(0,0,256,256);pen.strokeStyle='#a19c90';pen.lineWidth=1;
 for(let i=0;i<24;i++){const x=i*37%256,y=i*53%256;pen.beginPath();pen.moveTo(x,y);pen.lineTo(x+19,y+29);pen.lineTo(x+13,y+48);pen.lineTo(x+36,y+73);pen.stroke();}
 pen.strokeStyle='#716c61';for(let x=0;x<256;x+=128)for(let y=0;y<256;y+=64)pen.strokeRect(x,y,128,64);
 const marble=new THREE.CanvasTexture(canvas);marble.encoding=THREE.sRGBEncoding;marble.wrapS=marble.wrapT=THREE.RepeatWrapping;marble.repeat.set(4,4);
 floor.material=floor.material.clone();floor.material.map=marble;floor.material.roughness=.42;if(finish){const detail=finish.maps(THREE,'marble');floor.material.normalMap=detail.normalMap;floor.material.roughnessMap=detail.roughnessMap;}
 box(-7,2,0,.2,4,16,0x131614,true);box(7,2,0,.2,4,16,0x131614,true);box(0,2,-8,14,4,.2,0x131614,true);
 // Front doorway and facade remain open in the centre, with a matching collision opening.
 box(-4.75,2,8,4.5,4,.2,0x131614,true);box(4.75,2,8,4.5,4,.2,0x131614,true);box(0,3.6,8,5,.8,.2,0x131614);

 const textures=[];
 function label(text,x,y,z,w,h,background='#101412',ink='#a2d355'){
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=256;
  const c=canvas.getContext('2d');c.fillStyle=background;c.fillRect(0,0,768,256);
  c.strokeStyle=ink;c.lineWidth=8;c.strokeRect(12,12,744,232);
  c.fillStyle=ink;c.font='bold italic 100px Georgia';c.textAlign='center';c.fillText(text,384,164,720);
  const texture=new THREE.CanvasTexture(canvas);texture.encoding=THREE.sRGBEncoding;textures.push(texture);
  const mesh=box(x,y,z,w,h,.025,0xffffff);mesh.material=mesh.material.clone();mesh.material.map=texture;return mesh;
 }
 // Dark, uncluttered walls with black baseboards, unlike the city's generic furnished rooms.
 for(const x of [-6.85,6.85])box(x,.16,0,.12,.32,15.6,0x080a09);
 box(0,.16,-7.85,13.8,.32,.12,0x080a09);
 // A one-sided ceiling is visible from inside, but not through the overhead third-person camera.
 const ceilingGeometry=new THREE.PlaneGeometry(14,16),ceilingMaterial=new THREE.MeshStandardMaterial({color:0x111312});
 const ceiling=new THREE.Mesh(ceilingGeometry,ceilingMaterial);ceiling.rotation.x=Math.PI/2;ceiling.position.y=4.1;scene.add(ceiling);
 for(const z of [-4,1,5]){
  box(0,3.96,z,2.4,.12,1.5,0x272b29);
  const panel=box(0,3.88,z,2.2,.05,1.3,0xffffff);panel.material=panel.material.clone();const material=panel.material;
  material.emissive.setHex(0xfff7e8);material.emissiveIntensity=1.4;
  if(z!==1){const light=new THREE.PointLight(0xfff1d8,.55,70,1.5);light.position.set(0,3.6,z);light.castShadow=false;scene.add(light);}

 }
 // Pale oak slat feature wall, back-room door and dark framed service window.
 box(0,2,-7.8,13.5,4,.14,0x88735a);
 for(let x=-6.6;x<6.7;x+=.18)box(x,2,-7.69,.045,3.95,.035,0x39322b);
 box(-4.9,1.55,-7.55,2.2,3.1,.18,0xb1aaa0);
 box(-4.9,1.5,-7.4,1.96,2.9,.14,0x292d2b);
 for(const y of [.65,1.5,2.35])for(const x of [-5.35,-4.45])box(x,y,-7.3,.69,.57,.04,0x414440);
 box(-4.18,1.35,-7.25,.09,.12,.12,0xd2bc82);
 box(-.3,2.05,-7.5,4.9,1.8,.2,0x090c0b);box(-.3,2.05,-7.36,4.5,1.45,.06,0x2b4447);
 for(const x of [-1.75,-.3,1.15])box(x,2.05,-7.3,.045,1.45,.04,0x111815);
 label('KARMA',-.3,3.42,-7.48,4.8,.72);
 label('DISPENSARY',-.3,2.05,-7.26,3.6,.48,'#172728','#e0dec7');
 box(-.3,.7,-6.9,1.1,1.4,1,0x242725,true);
 // Right-hand glass display cases: black metal frames, transparent panes and stocked shelves.
 function displayCase(x,z,w,d){
  box(x,.13,z,w,.26,d,0x111713,true);
  const glassMaterial=new THREE.MeshPhysicalMaterial({color:0xddebe6,transparent:true,opacity:.14,depthWrite:false,roughness:.08,metalness:.08,clearcoat:1,clearcoatRoughness:.08});
  // Separate thin panes instead of a tinted solid block hiding the merchandise.
  for(const side of [-1,1]){const pane=box(x,.93,z+side*(d/2-.025),w-.06,1.25,.025,0xffffff);pane.material=glassMaterial;const end=box(x+side*(w/2-.025),.93,z,.025,1.25,d-.06,0xffffff);end.material=glassMaterial;}
  const top=box(x,1.57,z,w-.04,.025,d-.04,0xffffff);top.material=glassMaterial;
  const led=box(x,1.49,z-d/2+.08,w-.2,.025,.03,0xffffff);led.material=new THREE.MeshBasicMaterial({color:'#ece6ce'});
  for(const dx of [-w/2,w/2])for(const dz of [-d/2,d/2])box(x+dx,.88,z+dz,.055,1.5,.055,0x171c19);
  for(const y of [.32,.92,1.58]){box(x,y,z,w,.04,d,0x8ca69a);for(const dz of [-d/2,d/2])box(x,y,z+dz,w,.055,.045,0x18201a);}
  for(const y of [.48,1.07])for(let i=0;i<5;i++){
   const px=x-w*.38+i*w*.19;
   const jar=new THREE.Mesh(new THREE.CylinderGeometry(.13,.14,.27,16),materials.get(0x131614).clone());jar.material.color.setHex([0x628151,0xb18a52,0x905c94,0x567c85,0xb8a675][i]);jar.position.set(px,y,z);scene.add(jar);
   const cap=new THREE.Mesh(new THREE.CylinderGeometry(.145,.145,.045,16),materials.get(0x131614));cap.position.set(px,y+.15,z);scene.add(cap);
   box(px,y,z+d*.18,.18,.13,.015,0xe7dfbb);
  }
 }
 // Cases parallel to the long room, plus a shorter cabinet by the entrance on the left.
 displayCase(4.65,-.8,2.1,7.1);displayCase(-4.65,4.1,2.5,2.5);
 // Wall shelves with small bottles, jars and colourful retail packets.
 for(const side of [-1,1])for(const y of [.8,1.65,2.5]){
  box(side*6.35,y,-.7,1,.08,10.2,0x25251f,true);
  for(let i=0;i<7;i++){
   const z=-5+i*1.4;
   box(side*6.25,y+.21,z,.22,.35,.25,[0x42794f,0x77568a,0xac9255][i%3]);
   box(side*6.25,y+.41,z,.24,.07,.26,0x141c16);
   box(side*6.25,y+.2,z+.14,.16,.17,.015,0xe4dec8);
  }
 }
 // Backlit timber product cubbies above the main display counter.
 box(6.75,2.8,-1.7,.2,1.65,5.9,0x84683c);
 for(const z of [-4,-3,-2,-1,0]){
  const glow=box(6.6,2.8,z,.06,1.4,.85,0xf8df9a);glow.material=glow.material.clone();const m=glow.material;m.emissive.setHex(0xf2d584);m.emissiveIntensity=.4;
  for(const y of [2.25,2.8,3.35]){box(6.25,y,z,.8,.06,.9,0x9b7b4f);for(const dz of [-.23,.05,.3])box(6.3,y+.16,z+dz,.17,.27,.2,0xc5b49a);}
 }
 // Green Karma entrance rugs and a branded centre-aisle mat.
 const rug=label('Karma',0,.045,1,3.3,2.2,'#133f2b','#a3be4d');rug.rotation.x=-Math.PI/2;
 const entryRug=label('Karma',0,.045,5.7,2.8,1.4,'#133f2b','#a3be4d');entryRug.rotation.x=-Math.PI/2;
 label('KARMA',0,.26,.1,1.8,.24,'#10261c','#d8e4bb');
 // Articulated skeleton decorations: ribs, pelvis, long bones, skull and dark eye sockets.
 function skeleton(x,y,z,redShirt=false){
  const bone=0xd1c8a6;
  box(x,y,z,.13,.85,.14,bone);
  box(x,y+.64,z,.39,.45,.27,bone);box(x,y+.42,z+.03,.27,.11,.23,bone);
  for(const dx of [-.1,.1])box(x+dx,y+.7,z+.145,.08,.1,.02,0x24251e);
  for(const dy of [-.18,0,.18])box(x,y+dy,z,.52,.055,.22,bone);
  box(x,y-.5,z,.38,.2,.21,bone);
  for(const side of [-1,1]){
   const arm=box(x+side*.4,y-.13,z,.065,.8,.08,bone);arm.rotation.z=side*.25;
   box(x+side*.5,y-.58,z,.1,.18,.09,bone);
   box(x+side*.14,y-1,z,.075,.85,.08,bone);box(x+side*.14,y-1.48,z+.1,.11,.12,.27,bone);
  }
  if(redShirt){box(x,y-.02,z,.63,.57,.29,0xa72c31);label('KARMA',x,y,z+.16,.55,.2,'#a72c31','#eee2bd');}
 }
 // Checkout equipment and small-scale cues ground the room in a real shop.
 box(3.1,.72,-5.9,2.5,1.44,1,0x171c19,true);box(3.1,1.47,-5.9,2.6,.06,1.06,0x8ca69a);
 box(3.15,1.67,-6.04,.06,.4,.08,0x272b29);const monitor=box(3.15,1.95,-6,.7,.45,.06,0x272b29);monitor.rotation.x=-.16;
 const screen=label('KARMA',3.15,1.95,-5.95,.6,.34,'#19362a','#d7dbba');screen.rotation.x=-.16;
 box(3.15,1.52,-5.68,.7,.045,.23,0x272b29);box(2.3,1.56,-5.75,.25,.16,.4,0xc5b49a);box(2.3,1.7,-5.73,.2,.17,.015,0xe7dfbb);
 box(4,1.6,-5.72,.3,.2,.28,0x272b29);box(4,1.72,-5.72,.22,.02,.22,0x8ca69a);
 for(const x of [-6.86,6.86]){box(x,.7,3,.05,.22,.16,0xc5b49a);box(x,3.4,-3,.08,.3,.8,0x272b29);for(let i=0;i<5;i++)box(x-Math.sign(x)*.05,3.3+i*.05,-3,.02,.012,.7,0x8ca69a);}
 skeleton(3.55,1.95,-7.35,true);skeleton(-6.28,2.42,-4.6);skeleton(6.27,2.42,4.6);
 // Local scaled scene is also used by the isolated review page and geometry tests.
 label('KARMA · DISPENSARY',0,3.9,8.16,6.8,.7);
 label('EXIT',0,.25,7.2,1.6,.3);
 return {root:scene,solids,roof:ceiling,textures:[marble,...textures]};
}

if(typeof module!=='undefined')module.exports={buildKarma};if(typeof window!=='undefined')window.level29KarmaModel={buildKarma};
})();
