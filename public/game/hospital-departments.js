'use strict';
(function(){
const DEPARTMENTS=['Lobby / Reception','X-Ray / Imaging','Morgue / Cold Storage','Patient Wards','Recovery / Dispatch'];
function nurseState(t,start=0){const cycle=6+4,p=t%cycle;return {target:(Math.floor(t/cycle)+start)%3,tending:p>=6,phase:p<6?p/6:1};}
if(typeof module!=='undefined')module.exports={DEPARTMENTS,nurseState};if(typeof window==='undefined')return;
function build(v,g,q,base,level,staff){const b=v.b,M=level29World.material,white=M('#d8e0db'),steel=M('#899996',.8,.4),dark=M('#263a43'),blue=M('#739daa'),wood=M('#81715d'),mint=M('#8bc1b1');const floor=level;
 const part=(w,h,d,x,y,z,m)=>q.box(w,h,d,x,base+y,z,m);
 const item=(w,h,d,x,y,z,m)=>{part(w,h,d,x,y,z,m);v.furniture.push({x:x-w/2,y:z-d/2,w,h:d});};
 addSign(g,(level+1)+' · '+DEPARTMENTS[level],Math.min(210,b.w-20),9,b.x+b.w/2,base+31,b.y+4,v.col);
 const ex=b.x+b.w/2,ey=b.y+b.h-24;v.elevatorPoint={x:ex,y:ey};v.elevatorLanding={x:ex,y:ey-13};part(50,1,30,ex,1,ey,steel);addSign(g,'U · ELEVATOR / FLOOR '+(level+1),150,8,ex,base+30,b.y+b.h-4,v.col);
 if(level===0){item(88,13,20,ex,6.5,b.y+54,white);part(16,10,2,ex+24,18,b.y+52,dark);part(17,1,10,ex+24,13.5,b.y+58,steel);staff(v,g,ex,b.y+31,base,'RECEPTION NURSE');
  for(const x of [b.x+38,b.x+b.w-38])for(const y of [b.y+105,b.y+145,b.y+185]){item(23,6,18,x,3,y,blue);part(23,12,2,x,10,y-8,blue);for(const dx of [-9,9])part(2,5,14,x+dx,2.5,y,steel);}
  item(22,14,14,b.x+32,7,b.y+46,wood);part(20,3,12,b.x+32,16,b.y+46,mint);
 }else if(level===1){staff(v,g,ex,b.y+32,base,'X-RAY TECHNOLOGIST');
  for(const x of [b.x+58,b.x+b.w-58]){item(32,9,67,x,4.5,b.y+120,white);part(28,3,52,x,10,b.y+120,blue);part(8,34,8,x-23,17,b.y+101,steel);part(42,5,9,x-4,35,b.y+101,white);part(14,12,15,x+13,27,b.y+101,dark);part(9,1,10,x+13,20,b.y+101,white);}
  item(48,11,18,ex,5.5,b.y+62,steel);for(const x of [ex-12,ex+12]){part(18,13,2,x,20,b.y+58,dark);for(let i=0;i<5;i++)part(11,.4,1,x,16+i*2,b.y+59,mint);}addSign(g,'RADIATION · CONTROLLED ACCESS',120,6,ex,base+42,b.y+5,'#e4cf76');
 }else if(level===2){staff(v,g,ex,b.y+30,base,'MORGUE ATTENDANT');
  for(const x of [b.x+52,b.x+b.w-52])for(const y of [b.y+110,b.y+185]){item(30,2,48,x,15,y,steel);for(const dx of [-11,11])part(2,15,38,x+dx,7.5,y,steel);part(28,2,5,x,17,y-21,dark);}
  for(let col=0;col<3;col++)for(let row=0;row<2;row++){const x=ex-46+col*46;part(43,18,14,x,12+row*21,b.y+14,steel);part(32,.7,1,x,12+row*21,b.y+22,dark);part(9,1.4,2,x+10,12+row*21,b.y+23,white);}v.furniture.push({x:ex-69,y:b.y+7,w:138,h:16});
 }else{staff(v,g,ex,b.y+30,base,level===3?'WARD SUPERVISOR':'RECOVERY DOCTOR');v.patientBeds=v.patientBeds||[];v.careNurses=v.careNurses||[];
  const beds=[{x:b.x+45,y:b.y+106},{x:b.x+b.w-45,y:b.y+106},{x:b.x+45,y:b.y+181}];
  for(const [i,p]of beds.entries()){item(29,7,47,p.x,4,p.y,steel);part(27,3,42,p.x,9,p.y,white);part(24,2,30,p.x,11,p.y+4,blue);part(22,3,9,p.x,12,p.y-15,white);for(const side of [-1,1])part(1,6,35,p.x+side*15,10,p.y,steel);part(2,26,2,p.x+23,13,p.y-12,steel);part(12,10,2,p.x+23,26,p.y-12,dark);for(let k=0;k<3;k++)part(7,.5,1,p.x+23,23+k*2,p.y-10,mint);
   const patient=makeFigure(false);setFigureColors(patient,['#ac7a56','#d2a17a','#774b38'][i],'#9bb6bc','#d1dbd5');patient.name='hospital-patient';poseFigure(patient,0,0,0,0,'stand');patient.rotation.set(-Math.PI/2,0,0);patient.position.set(p.x,base+12,p.y-4);patient.userData.body.rotation.z=0;patient.scale.setScalar(.85);patient.traverse(o=>{o.userData.noBatch=true;});g.add(patient);v.patientBeds.push({floor,patient,x:p.x,y:p.y});
  }
  const nurse=makeFigure(false);setFigureColors(nurse,'#bd8e6e','#6b9e9a','#e2e3d9','#372b25');nurse.name='hospital-patrol-nurse';nurse.traverse(o=>{o.userData.noBatch=true;});g.add(nurse);v.careNurses.push({m:nurse,floor,base,start:level===3?0:1,points:beds.map(p=>({x:p.x+(p.x<ex?24:-24),y:p.y})),last:0});
 }
}
const updateBase=update;update=function(){updateBase.apply(this,arguments);if(state!=='play'||!city?.hospital)return;const h=city.hospital;
 for(const n of h.careNurses||[]){const t=frame/60,s=nurseState(t,n.start),prev=(s.target+2)%3,a=n.points[prev],b=n.points[s.target];poseFigure(n.m,a.x+(b.x-a.x)*s.phase,a.y+(b.y-a.y)*s.phase,Math.atan2(b.y-a.y,b.x-a.x),s.tending?0:t*2,s.tending?'stand':'walk');n.m.position.y=n.base;if(s.tending)n.m.userData.armR.rotation.x=-1.1+Math.sin(t*3)*.2;n.m.visible=h.floor===n.floor&&insideVenue(h,player);}
 for(const b of h.patientBeds||[])b.patient.visible=h.floor===b.floor&&insideVenue(h,player);
};
window.level29HospitalDepartments={build,DEPARTMENTS,nurseState};
})();
