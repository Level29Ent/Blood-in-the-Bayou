'use strict';
(function(){
function casingStep(c,dt){c.age+=Math.min(.05,Math.max(0,dt));c.vy-=28*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.z+=c.vz*dt;return c.age<.7;}
if(typeof module!=='undefined')module.exports={casingStep};if(typeof window==='undefined')return;
let pool=null,owner=null,clock=0,last=0,feed=0,model=null;const shells=[];
function setup(){pool?.parent?.remove(pool);pool?.geometry.dispose();pool?.material.dispose();pool=new THREE.InstancedMesh(new THREE.CylinderGeometry(.12,.12,.7,8),new THREE.MeshStandardMaterial({color:'#b49a59',metalness:.65,roughness:.35}),12);pool.count=0;pool.frustumCulled=false;vmScene.add(pool);owner=vmScene;shells.length=0;}
const fired=fireWeapon;fireWeapon=function(){const n=bullets.length,result=fired.apply(this,arguments);if(curW==='m240'&&bullets.length>n){if(vmScene&&owner!==vmScene)setup();if(model!==gun){model=gun;feed=0;}feed+=.43;if(shells.length>=12)shells.shift();shells.push({x:3,y:-3,z:-12,vx:8+Math.random()*3,vy:5,vz:2,age:0});}return result;};
const sync=syncViewModel;syncViewModel=function(){sync.apply(this,arguments);if(!vmScene)return;if(owner!==vmScene)setup();const now=performance.now(),dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;if(state!=='play')return;clock+=dt;if(model!==gun){model=gun;feed=0;}for(const [i,m]of (gun?.userData.feedBelt||[]).entries()){const phase=feed%(.43*8);m.position.x=m.userData.restX-phase;while(m.position.x<-3.5)m.position.x+=.43*8;m.position.y=.35+Math.sin(i*.52+feed*2)*.26;}
const dummy=new THREE.Object3D();let j=0;for(let i=shells.length-1;i>=0;i--){const c=shells[i];if(!casingStep(c,dt)){shells.splice(i,1);continue;}dummy.position.set(c.x,c.y,c.z);dummy.rotation.set(c.age*12,c.age*8,Math.PI/2+c.age*9);dummy.updateMatrix();pool.setMatrixAt(j++,dummy.matrix);}pool.count=j;pool.visible=!!gun?.visible&&curW==='m240';pool.instanceMatrix.needsUpdate=true;};
window.level29WeaponFeed={casingStep,get activeCases(){return shells.length;}};
})();
