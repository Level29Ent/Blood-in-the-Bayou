'use strict';
(function(){
function casino(v,g){const b=v.b,{material,batch}=level29World,q=batch(g),black=material('#20252a',.4,.45),chrome=material('#9ca7a8',.8,.3),felt=material('#2b614e',0,.9),wood=material('#674c3c'),light=material('#d9c083'),cloth=material('#634353');const item=(x,y,w,d)=>v.furniture.push({x:x-w/2,y:y-d/2,w,h:d});
 const screen=canvasTex(256,256,c=>{c.fillStyle='#121d32';c.fillRect(0,0,256,256);c.fillStyle='#dfbd68';c.font='bold 34px monospace';c.textAlign='center';c.fillText('BAYOU 29',128,48);for(let i=0;i<3;i++){c.fillStyle='#eee4c7';c.fillRect(15+i*78,76,68,96);c.fillStyle=['#be3b39','#527d55','#a47a3c'][i];c.font='bold 48px monospace';c.fillText(['7','29','7'][i],49+i*78,143);}c.fillStyle='#b99859';c.font='bold 20px monospace';c.fillText('GAME CASH ONLY',128,222);});screen.encoding=THREE.sRGBEncoding;
 for(let i=0;i<6;i++){const x=b.x+20+i*(b.w-40)/5,y=b.y+20;q.box(22,29,15,x,14.5,y,black);q.box(24,2,17,x,1,y,chrome);q.box(24,2,17,x,30,y,chrome);q.box(19,2,10,x,16,y+10,black);for(let k=0;k<3;k++)q.box(2,1,2,x-5+k*5,17.4,y+10,light);q.box(8,2,1,x+4,9,y+8,chrome);q.box(10,1,2,x,5,y+9,black);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(16,17),new THREE.MeshBasicMaterial({map:screen,toneMapped:false}));m.position.set(x,23,y+7.7);g.add(m);item(x,y,24,18);
  const stool=new THREE.Mesh(new THREE.CylinderGeometry(4,4,2,16),cloth);stool.position.set(x,8,y+24);g.add(stool);q.box(2,7,2,x,4,y+24,chrome);
 }
 for(let i=0;i<3;i++){const x=b.x+40+i*(b.w-80)/2,y=b.y+b.h*.5;q.box(37,10,25,x,5,y,wood);q.box(35,1,23,x,10.5,y,felt);for(const zz of [-12,12])q.box(37,1.5,1.5,x,11,y+zz,cloth);for(let k=0;k<4;k++){q.box(3,.2,5,x-12+k*7,11.2,y,light);q.box(2,.6,2,x-12+k*7,11.6,y+5,chrome);}item(x,y,39,27);
  if(i===2){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(7,7,1.4,32),wood);wheel.position.set(x,12.1,y);g.add(wheel);const rim=new THREE.Mesh(new THREE.TorusGeometry(6.2,.45,8,28),chrome);rim.rotation.x=Math.PI/2;rim.position.set(x,13,y);g.add(rim);for(let k=0;k<12;k++){q.box(1,.3,1,x+Math.cos(k/12*Math.PI*2)*5,13,y+Math.sin(k/12*Math.PI*2)*5,k%2?black:light);}q.box(.4,3,.4,x,14,y,chrome);}
  else for(let k=0;k<4;k++){const chip=new THREE.Mesh(new THREE.CylinderGeometry(1,1,.6,12),k%2?cloth:light);chip.position.set(x-12+k*7,11.8,y+7);g.add(chip);}
  addSign(g,['BLACKJACK','POKER','ROULETTE'][i],34,5,x,22,y-14,'#e0c891');}
 const customers=[];for(let i=0;i<6;i++){const m=makeFigure(false);setFigureColors(m,['#9c704e','#cc9c76','#704e3c'][i%3],['#71546e','#587888','#8b7952'][i%3],'#30373e');const x=b.x+20+i*(b.w-40)/5,y=b.y+48;poseFigure(m,x,y,-Math.PI/2,0,'stand');m.userData.legL.rotation.z=m.userData.legR.rotation.z=-1.2;m.scale.setScalar(.8);m.traverse(o=>{o.userData.noBatch=true;});g.add(m);customers.push(m);}
 v.casinoCustomers=customers;q.finish();
}
function smoke(v){const g=new THREE.Group();g.name='smoke-specialty-inventory';v.mesh.add(g);const b=v.b,{batch,material}=level29World,q=batch(g),wood=material('#71543c'),paper=material('#d1b78b'),glass=material('#769c91',.1,.5),steel=material('#a3aaa5',.75,.35),dark=material('#29343c');
 for(const side of [-1,1]){const x=b.x+b.w/2+side*(b.w/2-12);for(let level=0;level<3;level++){q.box(16,1,b.h-40,x,5+level*9,b.y+b.h/2,wood);for(let i=0;i<5;i++){const z=b.y+23+i*(b.h-46)/4;q.box(5,6,4,x,9+level*9,z,i%2?paper:glass);q.box(4,1,.3,x,9+level*9,z+2.2,paper);}}}
 for(let i=0;i<4;i++){const x=b.x+25+i*(b.w-50)/3,z=b.y+19;q.box(10,3,7,x,12,z,wood);for(let k=0;k<4;k++)q.box(1,1,6,x-3+k*2,14,z,paper);}
 for(const [text,z]of [['CIGAR HUMIDORS',b.y+4],['GLASSWARE / ACCESSORIES',b.y+b.h-5]]){const label=addSign(g,text,Math.min(100,b.w-12),5,b.x+b.w/2,32,z,'#dcc594');if(z>b.y+b.h/2)label.rotation.y=Math.PI;}
 // Glass water-pipe silhouettes, bowls and hose loops on existing rear counter.
 for(let i=0;i<3;i++){const x=b.x+b.w*.55+i*10,y=b.y+15;const base=new THREE.Mesh(new THREE.SphereGeometry(2.4,14,10),glass);base.position.set(x,15,y);g.add(base);q.box(1,9,1,x,20,y,steel);q.box(4,1,4,x,24,y,paper);const hose=new THREE.Mesh(new THREE.TorusGeometry(3.8,.3,6,20,Math.PI*1.7),dark);hose.position.set(x+3,19,y);g.add(hose);q.box(.5,5,.5,x+6,22,y,wood);}
 q.finish();
}
const build=buildVenue;buildVenue=function(v){build.apply(this,arguments);if(!v.mesh||v.mesh.userData.specialtyInventory||v.kind!=='smoke')return;v.mesh.userData.specialtyInventory=true;smoke(v);};
window.level29RetailCasino={casino};
})();
