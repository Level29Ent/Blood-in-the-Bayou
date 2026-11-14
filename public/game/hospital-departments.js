'use strict';
(function(){
const DEPARTMENTS=['Lobby / Reception','X-Ray / Imaging','Morgue / Cold Storage','Patient Wards','Recovery / Dispatch'];
function nurseState(t,start=0){const cycle=6+4,p=t%cycle;return {target:(Math.floor(t/cycle)+start)%3,tending:p>=6,phase:p<6?p/6:1};}
function nursePosition(a,b,t,cx){const points=[a,{x:cx,y:a.y},{x:cx,y:b.y},b],lengths=points.slice(1).map((p,i)=>Math.hypot(p.x-points[i].x,p.y-points[i].y));let d=t*lengths.reduce((s,n)=>s+n,0);for(let i=0;i<3;i++){if(d<=lengths[i]||i===2){const k=lengths[i]?Math.min(1,d/lengths[i]):0;return {x:points[i].x+(points[i+1].x-points[i].x)*k,y:points[i].y+(points[i+1].y-points[i].y)*k,angle:Math.atan2(points[i+1].y-points[i].y,points[i+1].x-points[i].x)};}d-=lengths[i];}return b;}
if(typeof module!=='undefined')module.exports={DEPARTMENTS,nurseState,nursePosition};if(typeof window==='undefined')return;
function build(v,g,q,base,level,staff){
 const api=typeof module!=='undefined'&&typeof require==='function'?require('./hospital-interior.js'):window.level29HospitalInterior,deck=api.build(THREE,v.b,base,level),floor=level,ex=deck.plan.cx;g.add(deck.root);v.hospitalFloors=v.hospitalFloors||[];v.hospitalFloors[level]=deck.root;deck.root.visible=level===(v.floor||0);v.furniture.push(...deck.solids);v.referenceHospital=true;
 v.elevatorPoint=deck.plan.elevator;v.elevatorLanding=deck.plan.landing;staff(v,g,deck.plan.staff.x,deck.plan.staff.y,base,['RECEPTION NURSE','X-RAY TECHNOLOGIST','MORGUE ATTENDANT','WARD SUPERVISOR','RECOVERY DOCTOR'][level]);
 if(level>=3){v.patientBeds=v.patientBeds||[];v.careNurses=v.careNurses||[];const beds=deck.plan.beds;
 for(const [i,p]of beds.entries()){
   const patient=makeFigure(false);setFigureColors(patient,['#ac7a56','#d2a17a','#774b38'][i],'#9bb6bc','#d1dbd5');patient.name='hospital-patient';poseFigure(patient,0,0,0,0,'stand');patient.rotation.set(-Math.PI/2,0,0);patient.position.set(p.x,base+12,p.y-4);patient.userData.body.rotation.z=0;patient.scale.setScalar(.85);patient.traverse(o=>{o.userData.noBatch=true;});g.add(patient);v.patientBeds.push({floor,patient,x:p.x,y:p.y});
  }
  const nurse=makeFigure(false);setFigureColors(nurse,'#bd8e6e','#6b9e9a','#e2e3d9','#372b25');nurse.name='hospital-patrol-nurse';nurse.traverse(o=>{o.userData.noBatch=true;});g.add(nurse);v.careNurses.push({m:nurse,floor,base,start:level===3?0:1,points:beds.map(p=>({x:p.x+(p.x<ex?35:-35),y:p.y})),last:0});
 }
}
const updateBase=update;update=function(){updateBase.apply(this,arguments);if(state!=='play'||!city?.hospital)return;const h=city.hospital;
 for(const [i,root]of (h.hospitalFloors||[]).entries())root.visible=i===h.floor&&Math.hypot(player.x-(h.b.x+h.b.w/2),player.y-(h.b.y+h.b.h/2))<450;
 for(const n of h.careNurses||[]){const t=frame/60,s=nurseState(t,n.start),prev=(s.target+2)%3,a=n.points[prev],b=n.points[s.target];const p=nursePosition(a,b,s.phase,h.b.x+h.b.w/2);poseFigure(n.m,p.x,p.y,p.angle,s.tending?0:t*2,s.tending?'stand':'walk');n.m.position.y=n.base;if(s.tending)n.m.userData.armR.rotation.x=-1.1+Math.sin(t*3)*.2;n.m.visible=h.floor===n.floor&&insideVenue(h,player);}
 for(const b of h.patientBeds||[])b.patient.visible=h.floor===b.floor&&insideVenue(h,player);
};
window.level29HospitalDepartments={build,DEPARTMENTS,nurseState};
})();
