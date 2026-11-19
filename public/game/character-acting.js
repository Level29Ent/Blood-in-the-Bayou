'use strict';
(function(){
function blink(t,phase=0){const x=((t+phase)%6.8+6.8)%6.8;return x<.12?Math.max(.12,Math.abs(x-.06)/.06):1;}
const api={blink};if(typeof module!=='undefined')module.exports=api;if(typeof window==='undefined')return;const eyes=new WeakMap();
// Only existing procedural eyelids/eyes; GLBs without face controls are not distorted.
const pose=poseFigure;poseFigure=function(m){const r=pose.apply(this,arguments),face=m?.userData?.face;if(!face||m.userData.eyes)return r;let list=eyes.get(face);if(!list){list=face.children.filter(o=>o.isMesh&&Math.abs(o.position.y-18.65)<.01).map(o=>({mesh:o,scale:o.scale.y}));eyes.set(face,list);}const amount=blink((typeof frame==='number'?frame:0)/60,(m.position.x*.013+m.position.z*.017)%6.8);for(const e of list)e.mesh.scale.y=e.scale*amount;return r;};
let soundUntil=0;const sound=snd;snd=function(type){const result=sound.apply(this,arguments);if(type!=='zhit'||typeof actx==='undefined'||!actx||soundMode===2||state!=='play'||performance.now()<soundUntil)return result;soundUntil=performance.now()+80;
 try{const oscillator=actx.createOscillator(),gain=actx.createGain(),t=actx.currentTime;oscillator.type='triangle';oscillator.frequency.setValueAtTime(105,t);oscillator.frequency.exponentialRampToValueAtTime(48,t+.055);gain.gain.setValueAtTime(.035,t);gain.gain.exponentialRampToValueAtTime(.0001,t+.075);oscillator.connect(gain);gain.connect(typeof sfxBus!=='undefined'?sfxBus:master);oscillator.start(t);oscillator.stop(t+.08);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};}catch(_){}return result;};
window.level29CharacterActing=api;
})();
