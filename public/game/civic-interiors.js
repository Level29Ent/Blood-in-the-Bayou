'use strict';
(function(){
function solid(v,r){v.furniture.push(r);}
function bank(v){const D=level29InteriorModels,b=v.b,g=new THREE.Group();g.name='Bank · vault and deposit suite';v.mesh.add(g);const steel=D.material('#a6b2b8','metal',.85),oak=D.material('#765640'),dark=D.material('#25343d','metal',.65),paper=D.material('#ded6c5','fabric');
 // Replace the old box safe. Retain its footprint and the teller mission station.
 const x=b.x+35,z=b.y+130;D.box(g,42,37,32,x,18.5,z,steel);const door=D.mesh(g,new THREE.CylinderGeometry(15,15,5,32),steel,x,19,z+18);door.rotation.x=Math.PI/2;door.name='Heavy steel vault door';D.mesh(g,new THREE.TorusGeometry(13,.9,8,32),dark,x,19,z+21);
 const wheel=D.mesh(g,new THREE.TorusGeometry(5,.55,8,24),dark,x,19,z+22);for(let i=0;i<5;i++){const a=i/5*Math.PI*2;D.rod(g,[x,19,z+22],[x+Math.cos(a)*5,19+Math.sin(a)*5,z+22],.3,steel);}for(const side of [-1,1])for(const h of [10,27])D.box(g,4,6,4,x+side*15,h,z+21,steel);
 for(let row=0;row<4;row++)for(let col=0;col<4;col++){const xx=b.x+b.w-14,zz=b.y+95+col*10,y=5+row*8;D.box(g,12,7.3,9,xx,y,zz,steel);D.box(g,.3,1.2,2,xx-6.2,y,zz,dark);D.ball(g,xx-6.4,y,zz+2,.2,.4,.4,dark);}
 solid(v,{x:b.x+b.w-21,y:b.y+90,w:15,h:42});
 for(const xx of [b.x+b.w*.35,b.x+b.w*.65]){D.box(g,10,7,.7,xx,18,b.y+65,dark);D.rod(g,[xx,14,b.y+65],[xx,12,b.y+65],.5,steel);D.box(g,10,.4,4,xx,15,b.y+71,paper);D.box(g,8,1,5,xx+12,15,b.y+66,paper);D.box(g,1,14,19,xx+20,21,b.y+65,steel);}
 D.box(g,b.w-68,1.2,22,b.x+b.w/2,15,b.y+65,oak);return g;}
function police(v){if(v.referencePolice){const g=new THREE.Group();g.name='Secure infected holding room';v.mesh.add(g);v.cellActors=[];for(const [i,p]of v.policePlan.actors.entries()){const m=makeFigure(true);m.name='Contained zombie '+(i+1);m.traverse(o=>{o.userData.noBatch=true;});m.userData.noBatch=true;g.add(m);poseFigure(m,p.x,p.z,0,i,'walk');m.position.y=v.baseY||0;v.cellActors.push({m,x:p.x,z:p.z,phase:i*2,cell:g,base:v.baseY||0});}return g;}const D=level29InteriorModels,b=v.b,g=new THREE.Group();g.name='Secure infected holding room';v.mesh.add(g);const w=Math.min(68,b.w*.3),d=56,x=b.x+b.w-w-12,z=b.y+b.h-d-12,iron=D.material('#303b40','metal',.7),wall=D.material('#88918b','tile');
 // Entire locked holding footprint blocks players. Captives are local figures,
 // not combat zombies, so indoor cleanup/spawning/rewards cannot free them.
 solid(v,{x,y:z,w,h:d});D.box(g,w,2,d,x+w/2,1,z+d/2,wall);for(const xx of [x,x+w])D.box(g,2,34,d,xx,17,z+d/2,wall);D.box(g,w,34,2,x+w/2,17,z,wall);
 for(let xx=x;xx<=x+w;xx+=4)D.rod(g,[xx,0,z+d],[xx,34,z+d],.45,iron);for(const h of [1,17,33])D.box(g,w,1.2,1.2,x+w/2,h,z+d,iron);D.box(g,5,7,2,x+w*.55,17,z+d+1,iron);
 for(const side of [-1,1])D.box(g,15,5,32,x+w/2+side*(w/2-10),2.5,z+23,wall);
 v.cellActors=[];for(let i=0;i<3;i++){const m=makeFigure(true);m.name='Contained zombie '+(i+1);m.userData.noBatch=true;m.traverse(o=>{o.userData.noBatch=true;});g.add(m);const xx=x+12+i*(w-24)/2;poseFigure(m,xx,z+d/2,0,i,'walk');m.position.y=0;v.cellActors.push({m,x:xx,z:z+d/2,phase:i*2,cell:g});}
 addSign(g,'SECURE HOLDING · 3 INFECTED',Math.min(100,w+10),5,x+w/2,39,z+d+1,'#dec084');return g;}
function mall(v){const D=level29InteriorModels,b=v.b,g=new THREE.Group();g.name='Mall facade frames, directory kiosks and cornices';v.mesh.add(g);const metal=D.material('#c5ac75','metal',.65),stone=D.material('#d5cebd','tile'),wood=D.material('#8a6d4d'),glass=new THREE.MeshStandardMaterial({color:'#a2d8df',transparent:true,opacity:.18,roughness:.15,depthWrite:false});
 for(const s of v.mallLayout.shops){const y=s.floor*56;for(const side of [-1,1]){const xx=s.doorX+side*(s.room.w/2-3);D.box(g,1.5,36,2,xx,y+18,s.doorY,metal);const pane=new THREE.Mesh(new THREE.PlaneGeometry(Math.max(5,(s.room.w-48)/2),22),glass);pane.position.set(s.doorX+side*(s.room.w/4+10),y+20,s.doorY);g.add(pane);}D.box(g,s.room.w,2,3,s.doorX,y+39,s.doorY,metal);D.box(g,s.room.w,1,6,s.doorX,y+32,s.doorY,stone);}
 for(let floor=0;floor<3;floor++){for(const side of [-1,1]){const x=b.x+b.w/2+side*72,z=b.y+18,y=floor*56;D.box(g,17,12,8,x,y+6,z,wood);D.box(g,19,1,10,x,y+12.5,z,stone);const screen=D.box(g,12,9,.8,x,y+19,z+1,D.material('#284956','metal'));screen.rotation.x=-.18;v.floorFurniture[floor].push({x:x-10,y:z-6,w:20,h:12});addSign(g,'DIRECTORY · '+(floor+1),30,3,x,y+27,z+2,'#c8d9d4');}
 }
}
const build=buildVenue;buildVenue=function(v){build.apply(this,arguments);if(!v.mesh||v.mesh.userData.civicDetail)return;v.mesh.userData.civicDetail=true;if(v.id==='bank'&&!v.referenceBank)bank(v);if(v.id==='police')police(v);if(v.id==='mall')mall(v);
 if(v.kind==='fish'&&!v.referenceFish){const b=v.b,g=new THREE.Group();g.name='Fish market live aquarium gallery';v.mesh.add(g);for(const side of [-1,1]){const x=b.x+b.w/2+side*(b.w/2-22),z=b.y+b.h*.62;const tank=level29InteriorModels.tank(g,x,2,z,30);tank.rotation.y=Math.PI/2;solid(v,{x:x-10,y:z-16,w:20,h:32});}}
};
const tick=update;update=function(){tick.apply(this,arguments);if(state!=='play'||!player||!city)return;const t=window.level29TimeOfDay?.seconds||frame/60;for(const v of city.venues||[]){if(!v.mesh||Math.hypot(player.x-v.doorX,player.y-v.doorY)>700)continue;level29InteriorModels.animate(v.mesh,t);for(const a of v.cellActors||[]){const x=a.x+Math.sin(t*.6+a.phase)*3,z=a.z+Math.cos(t*.5+a.phase)*5;poseFigure(a.m,x,z,Math.sin(t*.4+a.phase),t*4,'walk');a.m.position.y=a.base||0;}}
};
window.level29CivicInteriors={bank,police,mall};
})();
