'use strict';
(function(){
  function selectMobile(actors,camera,limit=48){return actors.filter(z=>z.alive&&!z.storyOperation&&!z.storyScale&&!z.military&&z.type!=='brute'&&Math.hypot(z.x-camera.x,z.y-camera.z)>140&&Math.hypot(z.x-camera.x,z.y-camera.z)<470).sort((a,b)=>Math.hypot(a.x-camera.x,a.y-camera.z)-Math.hypot(b.x-camera.x,b.y-camera.z)).slice(0,limit);}
  // Six shared anatomical batches: rounded head/jaw, tapered clothing, reaching
  // arms with hands, and trouser legs with boots. Vertex colors retain face detail.
  function combined(T,pieces){
   const positions=[],normals=[],colors=[];
   for(const [geo,position,scale,color] of pieces){
    const g=geo.index?geo.toNonIndexed():geo.clone();g.scale(...scale);g.translate(...position);
    const p=g.attributes.position,n=g.attributes.normal,c=new T.Color(color);
    for(let i=0;i<p.count;i++){positions.push(p.getX(i),p.getY(i),p.getZ(i));normals.push(n.getX(i),n.getY(i),n.getZ(i));colors.push(c.r,c.g,c.b);}
    g.dispose();geo.dispose();
   }
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));return g;
  }
  function createHorde(T,count=12){
   const root=new T.Group();root.name='Bounded survival horde instances';
   const sphere=()=>new T.SphereGeometry(1,10,8),cylinder=()=>new T.CylinderGeometry(1,.84,1,10),box=()=>new T.BoxGeometry();
   const parts=[
    {offset:[0,12.4,0],kind:'shirt',pieces:[[cylinder(),[0,0,0],[2.38,7.2,3.75],'#ffffff']]},
    {offset:[0,18.3,0],kind:'skin',pieces:[[sphere(),[.05,0,0],[2.2,2.45,2.12],'#ffffff'],[sphere(),[.45,-1.25,0],[1.55,1.05,1.6],'#ffffff'],[sphere(),[0,1.6,0],[2.22,.85,2.12],'#382c22'],...[-.95,.95].map(z=>[box(),[2.05,.3,z],[.4,.8,.9],'#ff3030'])]},
    ...[-1,1].map(side=>({offset:[0,15,side*4.9],kind:'skin',arm:true,pieces:[[cylinder(),[0,-3.5,0],[1.05,7,1.05],'#ffffff'],[sphere(),[.1,-7.7,0],[.95,1.18,.8],'#ffffff']]})),
    ...[-1,1].map(side=>({offset:[0,8,side*1.8],kind:'pants',leg:true,pieces:[[cylinder(),[0,-3.7,0],[1.6,7.4,1.5],'#ffffff'],[box(),[.55,-7.35,0],[4.3,1.3,2.7],'#222226']]}))
   ];
   for(const p of parts){const mesh=new T.InstancedMesh(combined(T,p.pieces),new T.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:.9}),count);mesh.count=0;mesh.frustumCulled=false;root.add(mesh);}
   root.userData.parts=parts;return root;
  }
  function pose(T,root,actors,height){
   const dummy=new T.Object3D(),pivot=new T.Object3D(),local=new T.Matrix4(),world=new T.Matrix4(),color=new T.Color();
   const selected=actors.slice(0,root.children[0].instanceMatrix.count);
   for(let p=0;p<root.children.length;p++){
    const mesh=root.children[p],spec=root.userData.parts[p];mesh.count=selected.length;
    selected.forEach((z,i)=>{
     const scale=z.type==='runner'?.95:1,sw=Math.sin(z.anim||0),skin=z.type==='runner'?'#a3bc6c':'#86a46e';
     dummy.position.set(z.x,height(z.x,z.y),z.y);dummy.rotation.set(0,-z.a,0);dummy.scale.setScalar(scale);dummy.updateMatrix();
     pivot.position.set(...spec.offset);pivot.rotation.set(0,0,spec.arm?Math.PI/2-.15+Math.sin((z.anim||0)*.7)*.15:spec.leg?sw*(p%2?-.7:.7):0);pivot.scale.setScalar(1);pivot.updateMatrix();
     local.copy(pivot.matrix);world.multiplyMatrices(dummy.matrix,local);mesh.setMatrixAt(i,world);
     color.set(spec.kind==='shirt'?(z.shirt||'#555555'):spec.kind==='skin'?skin:'#2e3a52');mesh.setColorAt(i,color);
    });mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
   }return selected;
  }
  if(typeof module!=='undefined')module.exports={createHorde,pose,selectMobile};if(typeof window==='undefined')return;if(window.level29HordeReview){window.level29HordeReview={createHorde,pose,selectMobile};return;}
  let root=null,owner=null,mobileRoot=null;const selection=new Set();window.level29MobileHordeSelection=selection;
  function dispose(g){if(!g)return;g.parent?.remove(g);g.children.forEach(m=>{m.material.dispose();m.geometry.dispose();});}
  const sync=syncDynamic;syncDynamic=function(){
   selection.clear();if(city?.world&&scene&&window.level29MobileBudget?.mobile&&camera){for(const z of selectMobile(zombies,camera.position))selection.add(z);}
   // Select before the detailed pool is populated: don't build full figures only to hide them.
   sync.apply(this,arguments);if(!city?.world||!scene)return;
   if(owner!==city||root?.parent!==scene){dispose(root);dispose(mobileRoot);owner=city;root=createHorde(THREE);scene.add(root);mobileRoot=null;}
   if(selection.size){if(!mobileRoot){mobileRoot=createHorde(THREE,48);mobileRoot.name='Mobile distant zombies';scene.add(mobileRoot);}pose(THREE,mobileRoot,[...selection],terrainHeight);}else if(mobileRoot)pose(THREE,mobileRoot,[],terrainHeight);
   const actors=zombies.filter(z=>z.alive&&z.creoleWave&&!selection.has(z)&&Math.hypot(z.x-camera.position.x,z.y-camera.position.z)<600),drawn=pose(THREE,root,actors,terrainHeight);for(const z of drawn){const m=zPool.map.get(z);if(m)m.visible=false;}
  };
})();
