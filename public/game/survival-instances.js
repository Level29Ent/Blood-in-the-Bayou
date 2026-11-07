'use strict';
(function(){
  function selectMobile(actors,camera,limit=48){return actors.filter(z=>z.alive&&!z.storyOperation&&!z.storyScale&&!z.military&&z.type!=='brute'&&Math.hypot(z.x-camera.x,z.y-camera.z)>140&&Math.hypot(z.x-camera.x,z.y-camera.z)<470).sort((a,b)=>Math.hypot(a.x-camera.x,a.y-camera.z)-Math.hypot(b.x-camera.x,b.y-camera.z)).slice(0,limit);}
  function createHorde(T,count=12){const root=new T.Group();root.name='Bounded survival horde instances';const geometry=new T.BoxGeometry(),parts=[{size:[5,8,3],offset:[0,12,0],color:'#657666'},{size:[4,5,4],offset:[0,19,0],color:'#92a779'},{size:[2,8,2],offset:[-3.5,12,0],color:'#92a779'},{size:[2,8,2],offset:[3.5,12,0],color:'#92a779'},{size:[2,9,2],offset:[-1.5,4.5,0],color:'#354550'},{size:[2,9,2],offset:[1.5,4.5,0],color:'#354550'}];for(const p of parts){const material=new T.MeshStandardMaterial({color:p.color,roughness:.9}),mesh=new T.InstancedMesh(geometry,material,count);mesh.count=0;mesh.frustumCulled=false;root.add(mesh);}root.userData.parts=parts;return root;}
  function pose(T,root,actors,height){const dummy=new T.Object3D(),local=new T.Vector3(),rotation=new T.Quaternion(),yaxis=new T.Vector3(0,1,0);const selected=actors.slice(0,root.children[0].instanceMatrix.count);for(let p=0;p<root.children.length;p++){const mesh=root.children[p],spec=root.userData.parts[p];mesh.count=selected.length;selected.forEach((z,i)=>{rotation.setFromAxisAngle(yaxis,Math.PI/2-z.a);local.set(...spec.offset);const limb=p>1?Math.sin(z.anim||0)*(p%2?1:-1):0;local.z+=limb*(p>3?1:2);local.applyQuaternion(rotation);dummy.position.set(z.x+local.x,height(z.x,z.y)+local.y,z.y+local.z);const scale=z.type==='runner'?.95:1;dummy.scale.set(spec.size[0]*scale,spec.size[1]*scale,spec.size[2]*scale);dummy.quaternion.copy(rotation);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.instanceMatrix.needsUpdate=true;}return selected;}
  if(typeof module!=='undefined')module.exports={createHorde,pose,selectMobile};if(typeof window==='undefined')return;if(window.level29HordeReview){window.level29HordeReview={createHorde,pose,selectMobile};return;}
  let root=null,owner=null,mobileRoot=null;const selection=new Set();window.level29MobileHordeSelection=selection;
  function dispose(g){if(!g)return;g.parent?.remove(g);g.children.forEach(m=>{m.material.dispose();});g.children[0]?.geometry.dispose();}
  const sync=syncDynamic;syncDynamic=function(){
   selection.clear();if(city?.world&&scene&&window.level29MobileBudget?.mobile&&camera){for(const z of selectMobile(zombies,camera.position))selection.add(z);}
   // Select before the detailed pool is populated: don't build full figures only to hide them.
   sync.apply(this,arguments);if(!city?.world||!scene)return;
   if(owner!==city||root?.parent!==scene){dispose(root);dispose(mobileRoot);owner=city;root=createHorde(THREE);scene.add(root);mobileRoot=null;}
   if(selection.size){if(!mobileRoot){mobileRoot=createHorde(THREE,48);mobileRoot.name='Mobile distant zombies';scene.add(mobileRoot);}pose(THREE,mobileRoot,[...selection],terrainHeight);}else if(mobileRoot)pose(THREE,mobileRoot,[],terrainHeight);
   const actors=zombies.filter(z=>z.alive&&z.creoleWave&&!selection.has(z)&&Math.hypot(z.x-camera.position.x,z.y-camera.position.z)<600),drawn=pose(THREE,root,actors,terrainHeight);for(const z of drawn){const m=zPool.map.get(z);if(m)m.visible=false;}
  };
})();
