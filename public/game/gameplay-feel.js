'use strict';
(function(){
let options={sensitivity:1,shake:.45};try{Object.assign(options,JSON.parse(localStorage.getItem('level29.controls.v1')||'{}'));}catch(_){}options.sensitivity=level29GameplayMath.sensitivity(options.sensitivity);options.shake=Math.max(0,Math.min(1,Number(options.shake)||0));
function open(){if(state==='play'&&!mpRole)state='pause';}
let lastObjective='',objectiveNoticeUntil=0;let hitUntil=0,kill=false;function hit(dead){hitUntil=performance.now()+150;kill=!!dead;}
const renderBase=render;render=function(){renderBase.apply(this,arguments);if(state!=='play'||!player)return;const op=window.level29Powell?.active;const next=op?'powell:'+op.id+':'+op.stage+':'+op.returning:mission?[mission.info.i,mission.phase,mission.step,mission.ckIdx].join(':'):'';if(next&&next!==lastObjective){if(lastObjective)objectiveNoticeUntil=performance.now()+1800;lastObjective=next;}if(performance.now()<objectiveNoticeUntil){cx.save();cx.fillStyle='#e3cc81';cx.font='bold 13px monospace';cx.textAlign='center';cx.fillText('OBJECTIVE UPDATED · FOLLOW YOUR WAYPOINT',SW/2,SH-160);cx.restore();}if(performance.now()<hitUntil){cx.save();cx.strokeStyle=kill?'#f4c355':'#f6f4e8';cx.lineWidth=2;const x=SW/2,y=SH/2;for(const a of [Math.PI/4,Math.PI*3/4,Math.PI*5/4,Math.PI*7/4]){cx.beginPath();cx.moveTo(x+Math.cos(a)*8,y+Math.sin(a)*8);cx.lineTo(x+Math.cos(a)*14,y+Math.sin(a)*14);cx.stroke();}cx.restore();}};
// Brief respite after actual mission completion, not invulnerability or free rewards.
let respiteUntil=0;const pass=passMission;passMission=function(){const result=pass.apply(this,arguments);respiteUntil=frame+600;return result;};
const ambient=ambientSpawn;ambientSpawn=function(){if(frame<respiteUntil||state!=='play'||player?.dead)return;return ambient.apply(this,arguments);};
// Leaving the tab must not leave held fire or movement stuck on. Shared worlds
// continue; solo play pauses instead of killing the player while they are away.
function release(){for(const k in keys)keys[k]=false;for(const k in touch)touch[k]=false;gp.fire=gp.brake=gp.sprint=false;stick.x=stick.y=0;mouse.down=false;if(!mpRole&&state==='play')state='pause';}
addEventListener('blur',release);document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
window.level29GameFeel={hit,open,get options(){return {...options};}};
})();
