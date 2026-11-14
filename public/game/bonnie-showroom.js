'use strict';
(function(){
function footprint(l,T=32){return {x0:l.x0,y0:l.y0,x1:Math.min(l.x1,l.x0+10),y1:Math.min(l.y1-2,l.y0+7)};}
function plan(b){
 const sx=b.w/352,sz=b.h/256,rect=(x,y,w,h,kind)=>({x:b.x+x*sx,y:b.y+y*sz,w:w*sx,h:h*sz,kind});
 const reception=rect(24,59,106,13,'reception');
 const offices=[118,198].flatMap(z=>[36,110].map(x=>rect(x-27,z-26,54,52,'office')));
 const cars=b.w>=300&&b.h>=220?[['supercar',214,48,'#131b23'],['sedan',308,48,'#73afd3'],['muscle',214,126,'#c83931'],['suv',308,126,'#e3dfd4'],['slab',214,204,'#11864f'],['pickup',308,204,'#f1eee2']].map(([type,x,z,color])=>({type,x:b.x+x*sx,y:b.y+z*sz,color,hero:type==='slab',w:76,h:54})):[];
 const columns=[rect(142,92,2,2,'column'),rect(142,173,2,2,'column')];
 const officeSolids=offices.flatMap(r=>[{x:r.x,y:r.y,w:1*sx,h:r.h},{x:r.x+r.w-sx,y:r.y,w:sx,h:r.h},{x:r.x,y:r.y,w:r.w,h:sz},{x:r.x+9*sx,y:r.y+13.5*sz,w:36*sx,h:15*sz},...[-9,9].map(dx=>({x:r.x+(27+dx-4.5)*sx,y:r.y+31.5*sz,w:9*sx,h:9*sz})),{x:r.x+22.5*sx,y:r.y+4.5*sz,w:9*sx,h:9*sz}]);
 const lounge=[rect(14,29,22,14,'sofa'),rect(113,26,22,14,'sofa'),...[[13,84],[334,16],[333,243]].map(([x,z])=>rect(x-4,z-4,8,8,'planter'))];
 const solids=[reception,...officeSolids,...lounge,...columns,...cars.map(c=>({x:c.x-c.w/2,y:c.y-c.h/2,w:c.w,h:c.h,kind:'display-car'}))];
 return {reception,offices,cars,columns,solids,entry:{x:b.x+b.w/2,y:b.y+b.h},bonnie:{x:b.x+64*sx,y:b.y+38*sz}};
}
function build(T,b,options={}){
 const p=plan(b),root=new T.Group(),batches=new Map();root.name='Bonnie De Vette · reference showroom';const sx=b.w/352,sz=b.h/256;
 const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.72,...extra});
 const white=mat('#e5e5e1'),tile=mat('#d2cec1',{roughness:.28,metalness:.08}),seam=mat('#a4a69f'),dark=mat('#202a30'),metal=mat('#74878d',{roughness:.3,metalness:.65}),wood=mat('#ba9566'),blue=mat('#194563'),black=mat('#141c20');
 const glass=mat('#c1dee0',{transparent:true,opacity:.13,roughness:.14,depthWrite:false}),glow=new T.MeshBasicMaterial({color:'#f8fbf5'}),screen=new T.MeshBasicMaterial({color:'#78b9c8'});
 const unit=new T.BoxGeometry(1,1,1),dummy=new T.Object3D();
 function box(m,w,h,d,x,y,z){if(!batches.has(m))batches.set(m,[]);batches.get(m).push({w:w*sx,h,d:d*sz,x:b.x+x*sx,y,z:b.y+z*sz});}
 function mesh(geo,m,x,y,z){const o=new T.Mesh(geo,m);o.position.set(b.x+x*sx,y,b.y+z*sz);root.add(o);return o;}
 // Warm polished tiles, white perimeter and glass facade, not a solid outdoor display building.
 box(tile,346,.25,250,176,1,128);for(let x=4;x<350;x+=24)box(seam,.12,.02,248,x,1.14,128);for(let z=4;z<254;z+=24)box(seam,344,.02,.12,176,1.14,z);
 box(white,352,52,3,176,26,1.5);box(white,3,52,256,1.5,26,128);box(dark,352,2,256,176,53,128);
 box(white,3,8,256,350.5,4,128);box(glass,.4,41,248,350,29,128);
 // Clear 54-unit entry. Fixed glazing panels remain within the matching wall collider spans.
 for(const side of [-1,1]){const width=176-27,center=side<0?width/2:352-width/2;box(glass,width-2,40,.4,center,25,254.7);box(white,width,5,3,center,2.5,254.5);}
 box(dark,56,3,6,176,45,255);box(dark,54,.12,19,176,1.3,245);
 for(let x=16;x<350;x+=42){if(Math.abs(x-176)<28)continue;box(dark,1.1,44,1.2,x,26,254);}
 for(let z=18;z<250;z+=48)box(dark,2,48,2,350,26,z);
 // Black exposed rafters and service ducts above the vehicle gallery; pale office ceiling at left.
 box(white,138,.5,249,73,50,128);for(let z=12;z<252;z+=24){box(seam,135,.12,.15,73,49.65,z);box(dark,204,1.4,1.2,247,49,z);}
 for(let x=12;x<144;x+=24)box(seam,.15,.12,247,x,49.65,128);
 for(const x of [153,222,293]){box(dark,1.5,2,248,x,49,128);const duct=mesh(new T.CylinderGeometry(1.4,1.4,236*sz,12).rotateX(Math.PI/2),metal,x,46,128);duct.name='Exposed HVAC duct';}
 for(const z of [34,110,188])for(const x of [50,119,205,297]){box(dark,27,.8,10,x,48,z);box(glow,25,.3,8,x,47.4,z);}
 for(const r of p.columns)box(dark,2,47,2,(r.x-b.x)/sx+1,24,(r.y-b.y)/sz+1);
 // Curved oak reception desk faces the entrance; owner stands behind its open back.
 for(let i=0;i<18;i++){const a=i*Math.PI/18,aa=(i+.5)*Math.PI/18;const x=77+53*Math.cos(aa),z=59+12*Math.sin(aa);const panel=mesh(new T.BoxGeometry(9.4*sx,13,1.2*sz),wood,x,7.8,z);panel.rotation.y=-Math.atan2(12*Math.cos(a),-53*Math.sin(a));}
 box(wood,106,12,10,77,7,64);box(white,108,1.3,13,77,14,65);box(glow,103,.5,.4,77,2,70.9);
 function computer(x,z){box(black,8,.6,6,x,15,z);box(metal,1,5,1,x,17,z-1);box(dark,12,7,1,x,21,z-1);box(screen,10.5,5.4,.15,x,21,z-.4);box(white,7,.2,4,x+9,15,z+1);}
 computer(54,65);computer(100,65);
 const ring=mesh(new T.CylinderGeometry(35*sx,35*sx,5,48,1,true),blue,77,42,49);ring.scale.z=.6*sz/sx;
 const trim=mesh(new T.TorusGeometry(35*sx,.35,6,48),glow,77,39.5,49);trim.rotation.x=Math.PI/2;trim.scale.y=.6*sz/sx;
 // Sales pods with frosted lower partitions, glass upper panels, monitors and visitor chairs.
 function chair(x,z){box(dark,9,2,9,x,5,z);box(dark,9,9,1,x,10,z-4);for(const side of [-1,1])box(metal,.5,5,7,x+side*3.5,2.5,z);}
 for(const r of p.offices){const x=(r.x-b.x)/sx+27,z=(r.y-b.y)/sz+26;
  for(const side of [-1,1]){box(white,1,12,51,x+side*26,7,z);box(glass,.3,10,51,x+side*26,18,z);box(metal,.7,.7,51,x+side*26,23,z);}
  box(white,53,12,1,x,7,z-25);box(glass,53,10,.3,x,18,z-25);box(metal,53,.7,.6,x,23,z-25);
  box(wood,36,1.5,15,x,12,z-5);for(const dx of [-15,15])box(metal,1,11,12,x+dx,6,z-5);computer(x-5,z-5);chair(x,z-17);chair(x-9,z+10);chair(x+9,z+10);
 }
 // Guest lounge and indoor plants break up the display hall without entering its central aisle.
 box(blue,22,5,13,25,4,36);box(blue,22,9,2,25,10,30);box(blue,22,5,13,124,4,33);box(blue,22,9,2,124,10,27);
 const leafMat=mat('#4b7054');for(const [x,z]of [[13,84],[334,16],[333,243]]){box(white,8,9,8,x,5.5,z);for(let k=0;k<5;k++){const a=k*1.4;const leaf=mesh(new T.SphereGeometry(1,8,6),leafMat,x+Math.cos(a)*3,15+k*.7,z+Math.sin(a)*3);leaf.scale.set(2.5,5,1.3);}}
 // Six existing game car types: no duplicated driveable entities or purchase inventory changes.
 for(const c of p.cars){const x=(c.x-b.x)/sx,z=(c.y-b.y)/sz;box(seam,78,.18,56,x,1.3,z);box(tile,76,.18,54,x,1.43,z);
  if(options.car){const car=options.car(c);car.position.set(c.x,1.6,c.y);car.rotation.y=0;root.add(car);}
  box(metal,1,14,1,x-30,8,z+28);box(dark,20,7,1,x-30,18,z+28);
 }
 function label(text,w,h,x,y,z,color='#e9e9df'){
 if(options.sign){options.sign(root,text,w*sx,h,b.x+x*sx,y,b.y+z*sz,color);return;}
 if(typeof document==='undefined')return;const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle='#163449';ctx.fillRect(0,0,1024,128);ctx.fillStyle=color;ctx.textAlign='center';ctx.font='bold 42px sans-serif';ctx.fillText(text,512,79,1000);const tex=new T.CanvasTexture(canvas);tex.encoding=T.sRGBEncoding;mesh(new T.PlaneGeometry(w*sx,h),new T.MeshBasicMaterial({map:tex}),x,y,z);}
 label('BONNIE DE VETTE',118,12,76,33,4);label('SLAB MOTORS  /  VEHICLE SALES',115,6,76,23,4.1);label('BONNIE  •  WELCOME / SALES',82,5,77,10,71.1);
 label('BONNIE DE VETTE MOTORS',216,10,176,60,257);label('WALK IN  /  AUTO DOOR',90,5,176,39,257);
 for(const c of p.cars)label(c.hero?'HOUSTON SLAB':c.type.toUpperCase(),19,5,(c.x-b.x)/sx-30,18,(c.y-b.y)/sz+28.6);
 for(const [m,items]of batches){const inst=new T.InstancedMesh(unit,m,items.length);inst.userData.noBatch=true;items.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.scale.set(v.w,v.h,v.d);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);});root.add(inst);}
 root.userData.noBatch=true;return {root,plan:p,solids:p.solids};
}
// Display-only customization: trunk audio, tall taillights and long chrome wire-wheel hubs.
function customize(T,car){const chrome=new T.MeshStandardMaterial({color:'#cad9d7',metalness:.9,roughness:.16}),black=new T.MeshStandardMaterial({color:'#152222'}),light=new T.MeshBasicMaterial({color:'#38e79a'}),red=new T.MeshBasicMaterial({color:'#e93138'}),green=new T.MeshStandardMaterial({color:'#11864f',metalness:.5,roughness:.22});const g=new T.Group();g.name='Green Houston slab · display-only trunk audio';car.add(g);
 const add=(geo,m,x,y,z)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);g.add(o);return o;};
 const lid=add(new T.BoxGeometry(13,1,23),green,-29,23,0);lid.rotation.z=-.85;
 add(new T.BoxGeometry(10,7,22),black,-27,13,0);for(const z of [-6,6]){const speaker=add(new T.CylinderGeometry(3.3,3.3,.7,20),black,-32.4,14,z);speaker.rotation.z=Math.PI/2;const rim=add(new T.TorusGeometry(3.3,.25,6,20),chrome,-32.9,14,z);rim.rotation.y=Math.PI/2;}
 for(const side of [-1,1]){add(new T.BoxGeometry(1,9,1.3),red,-30,11,side*11.8);for(const x of [-20,20]){const spoke=add(new T.CylinderGeometry(.3,1.9,12,12),chrome,x,4.2,side*20);spoke.rotation.x=side*Math.PI/2;}add(new T.BoxGeometry(48,.1,.8),light,0,.2,side*10);}
 add(new T.BoxGeometry(.5,.5,21),light,-33,18,0);return car;
}
const api={footprint,plan,build,customize};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29BonnieShowroom=api;
})();
