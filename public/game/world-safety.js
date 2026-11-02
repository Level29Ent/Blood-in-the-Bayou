'use strict';
(function(){
function carHit(c,x,y,r){const a=c.a||0,dx=x-c.x,dy=y-c.y,co=Math.cos(a),si=Math.sin(a),u=dx*co+dy*si,v=-dx*si+dy*co;return Math.abs(u)<c.spec.len/2+r&&Math.abs(v)<c.spec.wid/2+r;}
function carsOverlap(a,b){
 const axes=[a.a||0,(a.a||0)+Math.PI/2,b.a||0,(b.a||0)+Math.PI/2];
 for(const angle of axes){const co=Math.cos(angle),si=Math.sin(angle),center=Math.abs((a.x-b.x)*co+(a.y-b.y)*si);const extent=c=>Math.abs(Math.cos((c.a||0)-angle))*c.spec.len/2+Math.abs(Math.sin((c.a||0)-angle))*c.spec.wid/2;if(center>=extent(a)+extent(b))return false;}return true;
}
function waterSpot(c,p,T,W,H,water,avoid=[]){for(let ring=0;ring<15;ring++)for(let k=0;k<24;k++){const a=k/24*Math.PI*2,x=p.x+Math.cos(a)*ring*T,y=p.y+Math.sin(a)*ring*T;if(x<64||y<64||x>(W-2)*T||y>(H-2)*T)continue;let ok=true;for(const dx of [-(p.spec?.len||100)/2,0,(p.spec?.len||100)/2])for(const dy of [-(p.spec?.wid||40)/2,0,(p.spec?.wid||40)/2])if(c.g[Math.floor((y+dy)/T)*W+Math.floor((x+dx)/T)]!==water)ok=false;if(ok&&!avoid.some(o=>Math.hypot(o.x-x,o.y-y)<((o.spec?.len||100)+(p.spec?.len||100))*.5+12)&&!c.buildings.some(b=>x>b.x-60&&x<b.x+b.w+60&&y>b.y-40&&y<b.y+b.h+40))return {x,y};}return null;}
if(typeof module!=='undefined')module.exports={carHit,carsOverlap,waterSpot};if(typeof window==='undefined')return;
const blocked=blockedCircle;blockedCircle=function(x,y,r){const mover=typeof moverCtx==='undefined'?null:moverCtx;for(const c of cars||[]){if(c.gone||c===mover||mover===player&&player?.car===c)continue;if(mover?.spec){if((mover.z||0)<6&&carsOverlap({...mover,x,y},c))return true;continue;}if(carHit(c,x,y,r))return true;}return blocked.apply(this,arguments);};
const gen=genCity;genCity=function(){const c=gen.apply(this,arguments);if(!c.world)return c;const moored=[];for(const p of c.parked){if(!CAR_SPECS[p.type]?.boat)continue;const spot=waterSpot(c,{...p,spec:CAR_SPECS[p.type]},TILE,MW,MH,T_WATER,moored);if(spot){Object.assign(p,spot);moored.push({...p,spec:CAR_SPECS[p.type]});}else p.omitUnsafeBoat=true;}c.parked=c.parked.filter(p=>!p.omitUnsafeBoat);return c;};
const build=buildCity;buildCity=function(){build.apply(this,arguments);if(!city?.world)return;
 for(const c of cars.filter(c=>c.ambientBoat&&!c.driven)){const p=waterSpot(city,c,TILE,MW,MH,T_WATER,cars.filter(o=>o!==c&&o.boat&&!o.dead&&!o.gone));if(p){c.x=p.x;c.y=p.y;c.z=0;}else{c.dead=true;c.gone=true;}}
 // Roofs used to be merged into the permanent static batch. Keep them separate
 // so entering a room does not place the camera under an unremovable ceiling.
};
const sync=syncCars;syncCars=function(){sync.apply(this,arguments);for(const [c,m]of carMeshes){if(c.gone){m.visible=false;continue;}if(c.boat&&!c.dead){m.position.y=.2+(c.z||0);m.rotation.x=Math.sin(frame*.025+c.x)*.015;m.rotation.z=Math.cos(frame*.02+c.y)*.012;}}};
const batch=window.level29BatchStatic;if(batch)window.level29BatchStatic=function(root,skip=[],target){const keep=skip.slice();for(const v of city?.venues||[])if(v.roof){v.roof.userData.noBatch=true;keep.push(v.roof);}return batch(root,keep,target);};
const renderBase=render;render=function(){for(const v of city?.venues||[])if(v.roof)v.roof.visible=!player||!insideVenue(v,player);renderBase.apply(this,arguments);};
window.level29WorldSafety={carHit,carsOverlap,waterSpot};
})();
