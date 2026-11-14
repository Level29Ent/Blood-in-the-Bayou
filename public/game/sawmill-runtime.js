'use strict';
(function(){
const builder=buildVenue;buildVenue=function(v){if(v.southern!=='sawmill')return builder.apply(this,arguments);if(v.mesh?.parent===cityGroup)return;const actual=v.b,f=v.frontage,b=f?.canonical||actual,base=v.baseY||0,model=level29SawmillYard.build(THREE,b,base);v.mesh=model.root;cityGroup.add(v.mesh);v.referenceSawmill=true;v.roof=null;v.door=new THREE.Object3D();v.door.position.y=20.5;v.furniture=model.solids;
 if(f?.angle){const co=Math.cos(f.angle),si=Math.sin(f.angle);v.mesh.rotation.y=f.angle;v.mesh.position.x=f.center.x-co*f.center.x-si*f.center.y;v.mesh.position.z=f.center.y+si*f.center.x-co*f.center.y;v.furniture=v.furniture.map(r=>level29Frontage.rect(r,f.center,f.angle));}
 // Keep existing station, doorway, perimeter colliders and supply-contract coordinates authoritative.
 v.labelH=86;v.mesh.userData.frontageDone=true;
 const worker=makeFigure(false);setFigureColors(worker,'#9e7456','#9b773f','#34473d','#352d26');worker.name='Sawmill yard foreman';worker.userData.noBatch=true;worker.traverse(o=>{o.userData.noBatch=true;});poseFigure(worker,b.x+b.w/2-20,b.y+40,0,0,'stand');worker.position.y=base;v.mesh.add(worker);v.worker=worker;const p=f?.angle?level29Frontage.point({x:b.x+b.w/2-20,y:b.y+40},f.center,f.angle):{x:b.x+b.w/2-20,y:b.y+40};v.workerX=p.x;v.workerY=p.y;
};
})();
