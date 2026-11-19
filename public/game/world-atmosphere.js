'use strict';
(function(){
const CYCLE_SECONDS=1200;
function clock(seconds){const hour=(8+seconds/CYCLE_SECONDS*24)%24;return {hour,night:hour<5||hour>=20,dusk:hour>=17&&hour<20||hour>=5&&hour<7};}
function palette(hour,weather){
 const t=clock((hour-8+24)%24/24*CYCLE_SECONDS),night=t.night,dusk=t.dusk;
 return {sky:night?'#111b24':dusk?'#9b7950':'#87998c',haze:night?'#273b36':dusk?'#766647':'#647767',
 hemi:night?.38:dusk?.65:.85,sun:night?.18:dusk?.65:.8,sunColor:night?'#9ebacb':dusk?'#ffc17e':'#ffe0a6',
 dim:{clear:1,fog:.85,rain:.7,storm:.48}[weather]||1,
 density:weather==='fog'?.0032:weather==='storm'?.0027:weather==='rain'?.0023:night?.0022:.0018,
 fog:weather==='fog'?360:weather==='storm'?560:weather==='rain'?760:night?780:1400};
}
if(typeof module!=='undefined')module.exports={clock,palette,CYCLE_SECONDS};if(typeof window==='undefined')return;
let clouds=[],cloudScene=null,cloudCity=null,cloudColor='';let elapsed=0,last=performance.now();const tick=update;update=function(){const n=performance.now(),dt=Math.max(0,Math.min(1,(n-last)/1000));last=n;if(state==='play')elapsed+=dt;tick.apply(this,arguments);};
function current(){const hour=window.level29Prologue?.timeHour;return Number.isFinite(hour)?{hour,night:hour<5||hour>=20,dusk:hour>=17&&hour<20||hour>=5&&hour<7}:clock(elapsed);}
isNight=function(){return current().night;};isDusk=function(){return current().dusk;};
const cameraBase=placeCamera;placeCamera=function(){const yaw=cameraBase.apply(this,arguments);if(!scene?.fog||!scene.background?.isColor)return yaw;const c=current(),weather=window.level29Weather?.kind||'clear',p=palette(c.hour,weather),blend=weather==='clear'?0:weather==='fog'?.55:.7;const target=new THREE.Color(p.sky).lerp(new THREE.Color(c.night?'#1b2430':'#6f7f8b'),blend);scene.background.copy(target);if(!scene.fog.isFogExp2)scene.fog=new THREE.FogExp2(p.haze,p.density);scene.fog.color.set(p.haze);scene.fog.density=p.density;if(cloudScene!==scene||cloudCity!==city){cloudScene=scene;cloudCity=city;cloudColor='';clouds=[];scene.traverse(o=>{if(o.name==='weather-cloud')clouds.push(o);});}const nextCloudColor=c.night?'#344253':weather==='storm'?'#5a626b':weather==='rain'?'#929ca5':'#e2e3dc';if(nextCloudColor!==cloudColor){cloudColor=nextCloudColor;for(const cloud of clouds)cloud.traverse(o=>{if(o.isMesh&&o.material?.color)o.material.color.set(c.night?'#344253':weather==='storm'?'#5a626b':weather==='rain'?'#929ca5':'#e2e3dc');});}scene.fog.near=60;scene.fog.far=p.fog;if(hemi){hemi.intensity=p.hemi*p.dim;hemi.color.set(c.night?'#7794a3':'#c3ceb1');hemi.groundColor.set('#343c28');}if(sun){sun.intensity=p.sun*p.dim;sun.color.set(p.sunColor);const a=(c.hour-6)/24*Math.PI*2;sun.position.set(Math.cos(a)*300,Math.max(35,Math.sin(a)*300),100).normalize().multiplyScalar(900).add(sun.target.position);}return yaw;};
window.level29TimeOfDay={get hour(){return current().hour;},get seconds(){return elapsed;},setHour(hour){if(Number.isFinite(hour))elapsed=((hour-8+24)%24)/24*CYCLE_SECONDS;},clock};
})();
