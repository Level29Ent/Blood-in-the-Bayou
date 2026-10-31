'use strict';
(function(){
function intersects(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function clean(c){if(!c.farm)return c;const sports=c.features.filter(f=>['basketball','skatepark','training','market','cemetery'].includes(f.kind)&&intersects(f,c.farm));if(sports.length)throw Error('Farm must occupy a separate grass parcel');return c;}
if(typeof module!=='undefined')module.exports={intersects,clean};if(typeof window==='undefined')return;
const gen=genCity;genCity=function(){return clean(gen.apply(this,arguments));};
const ground=renderGround;renderGround=function(){ground.apply(this,arguments);if(!city?.farm||!groundCv)return;const f=city.farm,g=groundCv.getContext('2d');g.save();g.setTransform(GS,0,0,GS,0,0);g.fillStyle='#48673b';g.fillRect(f.x,f.y,f.w,f.h);const r=mkRng(2917);for(let i=0;i<400;i++){g.fillStyle=i%2?'#526f40':'#3c5932';g.fillRect(f.x+r()*f.w,f.y+r()*f.h,1+r()*3,2);}g.restore();};
const build=buildCity;buildCity=function(){build.apply(this,arguments);if(!city?.farm)return;const f=city.farm,g=new THREE.Group();g.name='Farmhouse and working equipment';g.position.y=terrainHeight(f.x+f.w/2,f.y+32);cityGroup.add(g);const {box,add}=level29StoryScenes;
 const house={x:f.x+12,y:f.y+10,w:56,h:48};city.farmEquipment=[house,{x:f.x+84,y:f.y+14,w:46,h:40}];
 box(g,56,26,44,house.x+28,13,house.y+22,'#b8af94');for(const side of [-1,1]){const roof=box(g,34,3,52,house.x+28+side*14,31,house.y+22,'#56483b');roof.rotation.z=side*.42;}
 box(g,14,19,1,house.x+28,9.5,house.y+44.7,'#544d3d');for(const x of [house.x+10,house.x+46]){box(g,11,10,1,x,17,house.y+44.8,'#8fa7a5');box(g,12,1,2,x,11.5,house.y+45,'#d7d0b8');}
 box(g,60,2,12,house.x+28,1,house.y+50,'#8c7657');for(const x of [house.x+2,house.x+54])box(g,2,24,2,x,13,house.y+54,'#d2c4a2');box(g,60,2,14,house.x+28,26,house.y+50,'#665947');
 const tx=f.x+104,tz=f.y+34;box(g,28,9,14,tx,9,tz,'#526c40');box(g,10,15,13,tx-10,16,tz,'#647f52');box(g,3,13,3,tx+9,19,tz,'#363d35');box(g,7,2,10,tx-10,20,tz,'#393d34');
 for(const x of [-12,11])for(const side of [-1,1]){const wheel=add(g,new THREE.CylinderGeometry(x<0?8:5,x<0?8:5,4,16),tx+x,x<0?8:5,tz+side*10,'#252d29');wheel.rotation.x=Math.PI/2;const hub=add(g,new THREE.CylinderGeometry(3,3,4.4,12),tx+x,x<0?8:5,tz+side*10,'#b49c55');hub.rotation.x=Math.PI/2;}
 for(let i=0;i<3;i++){box(g,14,9,10,f.x+30+i*17,4.5,f.y+f.h-26,'#ac965a');box(g,1,9.2,10.2,f.x+30+i*17,4.5,f.y+f.h-26,'#5b6941');}
 box(g,48,6,12,f.x+f.w-40,3,f.y+f.h-28,'#876b4a');box(g,44,1,8,f.x+f.w-40,6.1,f.y+f.h-28,'#7d9c9c');
 addSign(g,'BAYOU FARMHOUSE',55,6,house.x+28,23,house.y+45,'#e4d2a5');
 if(window.level29BatchStatic)level29BatchStatic(g,[]);
};
const blocked=blockedCircle;blockedCircle=function(x,y,r){if(city?.farmEquipment?.some(b=>hitRect(x,y,r,b)))return true;return blocked.apply(this,arguments);};
})();
