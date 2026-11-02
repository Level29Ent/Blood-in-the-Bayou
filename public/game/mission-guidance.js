'use strict';
(function(){
function points(m,survivors,boss){if(!m)return [];if(m.phase==='start')return m.start?[{...m.start,label:'MEET CONTACT'}]:[];if(m.phase!=='active')return [];
 const type=m.info.type;let ps=[];
 if(type==='rescue'){if(m.step==='reach')ps=survivors.filter(s=>!s.dead).map(s=>({...s,label:'RESCUE SURVIVOR'}));else if(m.drop)ps=[{...m.drop,label:'SAFE EXTRACTION'}];}
 else if(type==='race')ps=(m.cks||[]).slice(m.ckIdx||0).map((p,i)=>({...p,label:'CHECKPOINT '+((m.ckIdx||0)+i+1)}));
 else if(type==='deliver')ps=m.step==='drop'?[{...m.drop,label:'DELIVER RESOURCES'}]:(m.targets||[]).map(p=>({...p,label:'COLLECT RESOURCE'}));
 else if(type==='boss')ps=[{...(boss&&!boss.dead?boss:m.targets?.[0]),label:'BOSS TARGET'}];
 else ps=(m.targets||[]).map((p,i)=>({...p,label:'OBJECTIVE '+(i+1)}));
 return ps.filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y));}
if(typeof module!=='undefined')module.exports={points};if(typeof window==='undefined')return;
const box=document.createElement('div');box.id='missionWaypoints';box.style.cssText='position:fixed;left:12px;top:150px;z-index:21;max-width:min(330px,45vw);pointer-events:none;color:#f3df9a;font:12px/1.5 monospace;text-shadow:0 1px 3px black';document.body.appendChild(box);
const renderBase=render;render=function(){renderBase.apply(this,arguments);if(state!=='play'||!player||showMap){box.style.display='none';return;}box.style.display='block';const primary=missionTarget(),ps=points(mission,survivors,boss);if(primary&&!ps.some(p=>dist(p.x,p.y,primary.x,primary.y)<10))ps.unshift({...primary,label:window.level29Powell?.active?'POWELL · '+level29Powell.active.kind:'CURRENT OBJECTIVE'});box.replaceChildren();for(const p of ps.slice(0,5)){const row=document.createElement('div');row.textContent=p.label+' · '+Math.round(dist(player.x,player.y,p.x,p.y)/10)+' m';box.appendChild(row);const screen=project(p.x,p.y,terrainHeight(p.x,p.y)+30);if(screen&&screen.x>0&&screen.x<SW&&screen.y>0&&screen.y<SH){cx.fillStyle='#f1d875';cx.font='bold 12px monospace';cx.fillText('◆ '+p.label,screen.x,screen.y);}}
};
})();
