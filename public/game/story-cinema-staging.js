'use strict';
(function(){
const SHOTS={
 garageVideo:[{from:[49,29,49],to:[44,27,44],look:[1,13,0],fov:43},{from:[27,23,21],to:[24,22,20],look:[4,16,1],fov:38},{from:[30,25,40],to:[27,24,36],look:[-2,17,0],fov:42}],
 mallVideo:[{from:[48,26,48],to:[44,25,43],look:[0,12,0],fov:44},{from:[30,22,25],to:[26,22,23],look:[5,17,0],fov:39},{from:[29,22,32],to:[25,21,29],look:[10,17,0],fov:36}],
 ronnieVideo:[{from:[57,28,66],to:[52,26,60],look:[11,12,0],fov:46},{from:[41,25,51],to:[38,24,47],look:[14,12,0],fov:46},{from:[51,28,51],to:[47,27,47],look:[16,8,4],fov:44}]
};
function ease(v){v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);}
function shot(id,time){const list=SHOTS[id];if(!list)throw Error('Unknown story scene');const phase=Math.min(2,Math.floor(Math.max(0,time)/6)),s=list[phase],t=ease((time-phase*6)/6);return {phase,position:s.from.map((v,i)=>v+(s.to[i]-v)*t),look:s.look,fov:s.fov};}
function build(T,scene,resources,id){
 const materials=new Map(),cube=new T.BoxGeometry(),data=new Uint8Array(64*64*4);let seed=91;for(let i=0;i<64*64;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const v=110+seed%36;data.set([v,v,v,255],i*4);}const grain=new T.DataTexture(data,64,64);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.generateMipmaps=true;grain.minFilter=T.LinearMipmapLinearFilter;grain.needsUpdate=true;(resources.textures ||= new Set()).add(grain);resources.geometries.add(cube);
 function mat(color,metal=0,rough=.85){const key=color+metal+rough;if(!materials.has(key)){const m=new T.MeshStandardMaterial({color,metalness:metal,roughness:rough,...(rough>.6?{bumpMap:grain,bumpScale:.08}:{} )});resources.materials.add(m);materials.set(key,m);}return materials.get(key);}
 function box(w,h,d,x,y,z,color,metal=0,rough=.85){const m=new T.Mesh(cube,mat(color,metal,rough));m.scale.set(w,h,d);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;scene.add(m);return m;}
 function cylinder(rt,rb,h,x,y,z,color){const geo=new T.CylinderGeometry(rt,rb,h,12);resources.geometries.add(geo);const m=new T.Mesh(geo,mat(color,.15,.4));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;scene.add(m);return m;}
 // Separate dielectric glazing from opaque weathered surfaces; no fake video plane.
 const palette={floor:'#42483f',wall:'#69736a',trim:'#aca68e',steel:'#53615e',wood:'#6b5040'};
 box(180,1,150,0,-.65,0,palette.floor);box(180,60,2,0,29,-48,palette.wall);
 for(const x of [-65,65]){box(3,54,3,x,26,-45,palette.steel,.55);box(14,.4,150,x,.02,0,'#343c36');}
 if(id==='garageVideo'){
  // Workshop table with visible legs, lab rack, drawers and equipment rail.
  box(37,1.4,19,10,11,0,'#aaa99b',.35,.4);for(const x of [-6,26])for(const z of [-7,7])box(1.2,10,1.2,x,5,z,palette.steel,.6);
  box(24,15,13,-37,7,-27,'#435550',.3);for(let y=3;y<15;y+=4){box(22,.3,.4,-37,y,-20,'#8a9992',.7);box(7,.5,.7,-37,y+1.5,-19.8,'#222f2b');}
  for(const x of [-43,-24,37]){box(13,1.2,10,x,20,-39,palette.wood);for(let i=0;i<4;i++)box(2,4+i%2,2,x-4+i*2.5,22,-38,['#a6b3a1','#6b8270','#a99778','#6a7c7f'][i]);}
  box(24,1,1,10,17,-4,palette.steel,.65);for(const x of [3,8,13,18]){cylinder(.7,.7,5,x,14,-4,'#899c90');box(.9,.4,.9,x,16.8,-4,'#c3bbaa');}
  box(10,.5,8,20,12,4,'#beb9a2');for(let i=0;i<3;i++)box(8,.1,5,20+i*.3,12.35+i*.15,4,'#dbd3ba');
  // Overhead fixture creates a believable visual source for the key light.
  box(40,1,7,3,43,-1,palette.steel,.5);box(34,.3,4,3,42.3,-1,'#ece2bc');
 }else if(id==='mallVideo'){
  // Bench dimensions align with a seated rig, not a character pushed through the floor.
  box(18,1.6,13,12,7,0,palette.wood);box(18,12,1.5,12,13,-6,palette.wood);for(const x of [5,19])for(const z of [-4,4])box(1,6,1,x,3,z,palette.steel,.5);
  for(let x=-72;x<80;x+=16){box(.2,.04,150,x,.01,0,'#62695b');box(180,.04,.2,0,.01,x,'#62695b');}
  for(const x of [-43,43]){box(30,28,1,x,18,-46,'#243e42',0,.25);for(const dx of [-16,16])box(1,31,2,x+dx,18,-44,palette.trim);box(32,1,2,x,33,-44,palette.trim);box(18,6,1,x,10,-44,'#6d7770');box(13,1,13,x,1,-35,'#73796b');cylinder(5,4,9,x,5,-34,'#697761');}
  box(6,10,6,-28,5,-26,'#3f5049',.3);box(7,1,7,-28,10.5,-26,palette.steel,.6);
 }else{
  // Night street: articulated figures remain the focal point, with depth behind them.
  box(180,.15,11,0,.1,-36,'#747665');for(let x=-80;x<85;x+=18)box(9,.08,1,x,.1,22,'#b6a76a');
  for(const x of [-45,49]){box(28,52,30,x,25,-28,x<0?'#69736d':'#8d7768');box(31,2,32,x,52,-28,palette.trim);for(const y of [14,34]){box(16,12,1,x,y,-12,'#324d55',0,.22);box(18,1,2,x,y-7,-11,palette.trim);box(.6,12,1,x,y,-11,'#aaa48c');}}
  box(1.5,43,1.5,-32,21,12,palette.steel,.7);box(11,1,4,-28,43,12,'#cec5a0');
 }
 return {box,cylinder,mat};
}
const api={shot,ease,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29StoryStaging=api;
})();
