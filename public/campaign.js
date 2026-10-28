'use strict';
// Every campaign mission now has a primary job, a field objective and a timed extraction.
(function(){
const themes={
 rescue:['Recover the survivor medical kit','Protect the evacuation point'],
 clear:['Secure the district radio relay','Keep the evacuation route open'],
 deliver:['Collect the second supply manifest','Guard the delivery handoff'],
 race:['Collect the route transmitter','Hold the getaway rendezvous'],
 defend:['Restore the backup power relay','Defend the relief crew'],
 boss:['Recover the boss evidence cache','Protect the evidence extraction'],
 rob:['Collect the getaway documents','Hold the getaway rendezvous'],
 op:['Secure the final field supplies','Guard the relief team']
};
function stamp(m){if(window.level29Save)level29Save.partial({idx:m.info.i,kind:'extended',extra:JSON.parse(JSON.stringify(m.extra)),timer:m.timer});}
const baseBegin=beginMission;
beginMission=function(){
 const m=mission,rp=window.level29Save&&m&&level29Save.resume(m.info.i);
 if(rp&&rp.kind==='extended'&&rp.extra){
  m.phase='active';m.extra=JSON.parse(JSON.stringify(rp.extra));m.timer=Math.max(18000,rp.timer||0);
  m.extra.hold=Math.max(0,m.extra.hold||0);survivors=[];player.carrying=false;
  objective='Resume the field objective marked on your map.';sfx('missionstart');return;
 }
 baseBegin();
 if(!m||m.phase!=='active'||mpRole==='client')return;
 if(m.timer>0)m.timer=Math.round(m.timer*1.65);
 if(m.info.type==='clear')m.need=Math.ceil(m.need*1.5);
 if(m.info.type==='defend')m.holdT=Math.max(60*75,Math.round(m.holdT*1.7));
 if(m.info.type==='race'&&m.cks){
  let p=m.cks[m.cks.length-1];
  for(let i=0;i<4;i++){p=roadPointFar(p.x,p.y,450,850);m.cks.push(p);}
  m.timer+=60*65;
 }
};
const basePass=passMission;
passMission=function(){
 const m=mission;
 if(!m||m.phase!=='active'||mpRole==='client')return;
 if(m.extra&&m.extra.done)return basePass();
 if(m.extra)return;
 const p=player.car||player,field=roadPointFar(p.x,p.y,500,1000);
 const extraction=roadPointFar(field.x,field.y,650,1200);
 m.extra={stage:'field',field,extraction,hold:0,required:60*(12+Math.floor(m.info.d*6)),extractRequired:60*(45+Math.floor(m.info.d*20)),done:false};
 m.timer=60*420;survivors=[];player.carrying=false;
 pickups=pickups.filter(k=>k.kind!=='power'&&k.kind!=='crate');
 if(boss&&boss.dead){boss=null;stopBossVoice();}
 objective='PRIMARY COMPLETE. '+(themes[m.info.type]||themes.op)[0]+'. Reach the field marker on foot.';
 banner={big:'PRIMARY COMPLETE',small:'FIELD OBJECTIVE + EXTRACTION STILL REQUIRED',t:220};
 spawnHordeAround(field.x,field.y,5+Math.floor(m.info.d*5),180,340);
 stamp(m);sfx('checkpoint');
};
const baseTarget=missionTarget;
missionTarget=function(){const e=mission&&mission.phase==='active'&&mission.extra;if(e&&!e.done){const p=e.stage==='field'?e.field:e.extraction;return {x:p.x,y:p.y,col:e.stage==='field'?'#5fb7ff':'#3cc86e',label:e.stage==='field'?'F':'E',zone:e.stage==='field'?70:180};}return baseTarget();};
const baseUpdate=updateMission;
updateMission=function(){
 const m=mission,e=m&&m.phase==='active'&&m.extra;
 if(!e||e.done)return baseUpdate();
 if(mpRole==='client')return;
 if(--m.timer<=0)return failMission('FIELD OPERATION RAN OUT OF TIME');
 const P=player.car||player,labels=themes[m.info.type]||themes.op;
 if(e.stage==='field'){
  const close=!player.car&&dist(P.x,P.y,e.field.x,e.field.y)<70;
  if(close)e.hold++;
  objective=labels[0]+': '+Math.ceil((e.required-e.hold)/60)+'s remaining. '+(close?'Stay here on foot.':'Reach the blue F marker on foot.');
  if(e.hold>=e.required){e.stage='extract';e.hold=0;stamp(m);toast('FIELD OBJECTIVE SECURED. REACH THE EXTRACTION POINT.');sfx('checkpoint');}
 }else{
  const close=dist(P.x,P.y,e.extraction.x,e.extraction.y)<180;
  if(close){e.hold++;if(e.hold%300===1)spawnHordeAround(e.extraction.x,e.extraction.y,3+Math.floor(m.info.d*3),260,420);}
  objective=labels[1]+': '+Math.ceil((e.extractRequired-e.hold)/60)+'s. '+(close?'Stay in the green zone.':'Reach the green E marker. Timer pauses outside the zone.');
  if(e.hold>0&&e.hold%900===0&&e.savedHold!==e.hold){e.savedHold=e.hold;stamp(m);}
  if(e.hold>=e.extractRequired){e.done=true;passMission();}
 }
};
const baseBrief=briefing;
briefing=function(info){return baseBrief(info)+' After the main job, '+(themes[info.type]||themes.op)[0].toLowerCase()+', then '+(themes[info.type]||themes.op)[1].toLowerCase()+' until the team is clear. Finish all three stages to get paid.';};
window.level29Campaign={get extra(){return mission&&mission.extra;},themes};
})();
