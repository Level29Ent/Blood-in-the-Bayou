'use strict';
(function(){
const builder=buildVenue;buildVenue=function(v){if(v.southern!=='scrap')return builder.apply(this,arguments);if(v.mesh?.parent===cityGroup)return;const actual=v.b,f=v.frontage,b=f?.canonical||actual,base=v.baseY||0,model=level29Scrapyard.build(THREE,b,base);v.mesh=model.root;cityGroup.add(v.mesh);v.referenceScrapyard=true;v.roof=null;v.door=new THREE.Object3D();v.door.position.y=20.5;v.furniture=model.solids;
 if(f?.angle){const co=Math.cos(f.angle),si=Math.sin(f.angle);v.mesh.rotation.y=f.angle;v.mesh.position.x=f.center.x-co*f.center.x-si*f.center.y;v.mesh.position.z=f.center.y+si*f.center.x-co*f.center.y;v.furniture=v.furniture.map(r=>level29Frontage.rect(r,f.center,f.angle));}
 // Keep existing station, doorway, perimeter colliders and salvage-service coordinates authoritative.
 v.labelH=64;v.mesh.userData.frontageDone=true;
 const worker=makeFigure(false);setFigureColors(worker,'#9e7456','#9b773f','#34473d','#352d26');worker.name='Scrapyard dispatcher';worker.userData.noBatch=true;worker.traverse(o=>{o.userData.noBatch=true;});poseFigure(worker,b.x+83,b.y+b.h-42,0,0,'stand');worker.position.y=base;v.mesh.add(worker);v.worker=worker;const label=new THREE.Group();label.name='Southern Iron gate signage';v.mesh.add(label);addSign(label,'SOUTHERN IRON · SALVAGE / PARTS',200,8,b.x+b.w/2,43,b.y+4,'#d9c28d');addSign(label,'U · FENCE / REPAIR · B · UPGRADES',160,6,b.x+b.w/2,30,b.y+5,'#d9c28d');const p=f?.angle?level29Frontage.point({x:b.x+83,y:b.y+b.h-42},f.center,f.angle):{x:b.x+83,y:b.y+b.h-42};v.workerX=p.x;v.workerY=p.y;
};
})();
