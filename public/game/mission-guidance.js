'use strict';
(function(){
function points(m,survivors,boss){if(!m)return [];if(m.phase==='start')return m.start?[{...m.start,label:'MEET CONTACT'}]:[];if(m.phase!=='active')return [];
 const e=m.extra;if(e&&!e.done){const p=e.stage==='field'?e.field:e.extraction;return p?[{...p,label:e.stage==='field'?'FIELD OBJECTIVE':'EXTRACTION ZONE'}]:[];}
 const type=m.info.type;let ps=[];
 if(type==='prologue')return (m.targets||[]).map(p=>({...p,label:'PROLOGUE OBJECTIVE'})).concat(m.escort?[{...m.escort,label:'AHMAD · ESCORT'}]:[]);
 if(type==='op'&&m.opStops){return (m.opStops.slice(m.si||0).length?m.opStops.slice(m.si||0).map((s,i)=>({x:s.v.stationX,y:s.v.stationY,label:'PICKUP STOP '+((m.si||0)+i+1)})):m.drop?[{...m.drop,label:'RETURN TO MANSION'}]:[]);}
 if(type==='rob'){const p=m.step==='escape'?m.drop:m.robVenue&&{x:m.robVenue.stationX,y:m.robVenue.stationY};return p?[{...p,label:m.step==='escape'?'RETURN TO MANSION':'ROBBERY COUNTER'}]:[];}
 if(type==='rescue'){if(m.step==='reach')ps=survivors.filter(s=>!s.dead).map(s=>({...s,label:'RESCUE SURVIVOR'}));else if(m.drop){ps=[{...m.drop,label:'SAFEHOUSE HANDOFF'}];const trailing=survivors.find(s=>s.hp>0&&!s.inCar);if(trailing)ps.push({...trailing,label:'ESCORT SURVIVOR'});}}
 else if(type==='race')ps=(m.cks||[]).slice(m.ckIdx||0).map((p,i)=>({...p,label:'CHECKPOINT '+((m.ckIdx||0)+i+1)}));
 else if(type==='deliver')ps=m.step==='drop'?[{...m.drop,label:'DELIVER RESOURCES'}]:(m.targets||[]).map(p=>({...p,label:'COLLECT RESOURCE'}));
 else if(type==='boss')ps=m.drop?[{...m.drop,label:'COLLECT BOSS EVIDENCE'}]:[{...(boss&&!boss.dead?boss:m.targets?.[0]),label:'BOSS TARGET'}];
 else ps=(m.targets||[]).map((p,i)=>({...p,label:'OBJECTIVE '+(i+1)}));
 return ps.filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y));}
if(typeof module!=='undefined')module.exports={points};if(typeof window==='undefined')return;
const box=document.createElement('div');box.id='missionWaypoints';box.style.cssText='position:fixed;left:12px;top:calc(var(--hud-mission-bottom,150px) + 8px);z-index:21;max-width:min(330px,45vw);max-height:90px;overflow:hidden;pointer-events:none;color:#f3df9a;font:12px/1.5 monospace;text-shadow:0 1px 3px black';document.body.appendChild(box);
let lastRows="";const renderBase=render;render=function(){renderBase.apply(this,arguments);if(state!=='play'||!player||showMap){box.style.display='none';return;}box.style.display='block';const primary=missionTarget(),ps=points(mission,survivors,boss);if(primary&&!ps.some(p=>dist(p.x,p.y,primary.x,primary.y)<10))ps.unshift({...primary,label:window.level29Powell?.active?'POWELL · '+level29Powell.active.kind:'CURRENT OBJECTIVE'});const rows=ps.slice(0,5).map(p=>p.label+' · '+Math.round(dist(player.x,player.y,p.x,p.y)/10)+' m'),changed=rows.join('|')!==lastRows;if(changed){lastRows=rows.join('|');box.replaceChildren();}for(const p of ps.slice(0,5)){if(changed){const row=document.createElement('div');row.textContent=p.label+' · '+Math.round(dist(player.x,player.y,p.x,p.y)/10)+' m';box.appendChild(row);}const screen=project(p.x,p.y,terrainHeight(p.x,p.y)+30);if(screen&&screen.x>0&&screen.x<SW&&screen.y>Math.max(200,SH*.26)&&screen.y<SH-170){cx.fillStyle='#f1d875';cx.font='bold 12px monospace';cx.fillText('◆ '+p.label,screen.x,screen.y);}}
};
})();
