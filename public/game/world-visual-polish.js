'use strict';
(function(){
function detailBudget(q){return q==='high'?{distance:650,windowStep:38}:q==='medium'?{distance:450,windowStep:56}:{distance:250,windowStep:80};}
function buildDetail(THREE,buildings,materials){const root=new THREE.Group();root.name='Expanded world · architectural depth';const lists=new Map();function box(w,h,d,x,y,z,m){if(!lists.has(m))lists.set(m,[]);lists.get(m).push([w,h,d,x,y,z]);}let buildingsDetailed=0;
 for(const b of buildings){if(b.venue||!['normal','tower','helipad','safe'].includes(b.kind)||b.w<55||b.h<45)continue;const h=Math.max(30,(b.H||20)*2.4),base=b.baseY||0,x=b.x+b.w/2,z=b.y+b.h/2;buildingsDetailed++;box(b.w+3,2.5,b.h+3,x,base+h+1.2,z,materials.stone);for(const side of [-1,1]){box(2,h,2,b.x+(side<0?1:b.w-1),base+h/2,b.y+1,materials.stone);box(2,h,2,b.x+(side<0?1:b.w-1),base+h/2,b.y+b.h-1,materials.stone);}for(let y=32;y<h-10;y+=40)box(b.w+1,1.1,b.h+1,x,base+y,z,materials.stone);
 // shallow window reveals and metal canopies add silhouettes without altering doors/colliders
 for(let xx=b.x+20;xx<b.x+b.w-12;xx+=52)for(const zz of [b.y-.7,b.y+b.h+.7]){for(let y=24;y<h-12;y+=48){box(23,1.2,2.5,xx,base+y-10,zz,materials.stone);box(.7,20,1.1,xx-10.5,base+y,zz,materials.metal);box(.7,20,1.1,xx+10.5,base+y,zz,materials.metal);}}
 box(Math.min(55,b.w*.45),1.4,13,x,base+26,b.y+b.h+4,materials.metal);box(17,8,13,b.x+b.w*.25,base+h+6,z,materials.metal);}
 const geo=new THREE.BoxGeometry(),dummy=new THREE.Object3D();for(const [mat,items]of lists){const mesh=new THREE.InstancedMesh(geo,mat,items.length);for(let i=0;i<items.length;i++){const p=items[i];dummy.scale.set(p[0],p[1],p[2]);dummy.position.set(p[3],p[4],p[5]);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);}mesh.frustumCulled=true;mesh.receiveShadow=true;mesh.castShadow=false;root.add(mesh);}root.userData.buildings=buildingsDetailed;return root;}
if(typeof module!=='undefined')module.exports={detailBudget,buildDetail};if(typeof window==='undefined')return;if(window.level29VisualPreview){window.level29VisualPolishBuilder={detailBudget,buildDetail};return;}
let root=null;const build=buildCity;buildCity=function(){build.apply(this,arguments);const stone=level29World.material('#aaa895',0,.9),metal=level29World.material('#50636b',.55,.4);root=buildDetail(THREE,city.buildings,{stone,metal});cityGroup.add(root);};
const tick=update;update=function(){tick.apply(this,arguments);if(root)root.visible=window.level29Graphics?.quality!=='low';};window.level29VisualPolish={detailBudget,buildDetail,get root(){return root;}};
})();
