'use strict';
(function(){
function intersects(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function clean(c){if(!c.farm)return c;const sports=c.features.filter(f=>['basketball','skatepark','training','market','cemetery'].includes(f.kind)&&intersects(f,c.farm));if(sports.length)throw Error('Farm must occupy a separate grass parcel');return c;}
if(typeof module!=='undefined')module.exports={intersects,clean};if(typeof window==='undefined')return;
const gen=genCity;genCity=function(){return clean(gen.apply(this,arguments));};
const ground=renderGround;renderGround=function(){ground.apply(this,arguments);if(!city?.farm||!groundCv)return;const f=city.farm,g=groundCv.getContext('2d');g.save();g.setTransform(GS,0,0,GS,0,0);g.fillStyle='#48673b';g.fillRect(f.x,f.y,f.w,f.h);const r=mkRng(2917);for(let i=0;i<400;i++){g.fillStyle=i%2?'#526f40':'#3c5932';g.fillRect(f.x+r()*f.w,f.y+r()*f.h,1+r()*3,2);}g.restore();};
const build=buildCity;buildCity=function(){build.apply(this,arguments);if(!city?.farm)return;const f=city.farm,model=level29FarmReference.build(THREE,f,terrainHeight(f.x+f.w/2,f.y+32));cityGroup.add(model.root);city.farmEquipment=model.solids;city.referenceFarm=true;
};
const blocked=blockedCircle;blockedCircle=function(x,y,r){if(city?.farmEquipment?.some(b=>hitRect(x,y,r,b)))return true;return blocked.apply(this,arguments);};
})();
