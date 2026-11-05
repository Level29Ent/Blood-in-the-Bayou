'use strict';
(function(){if(typeof window==='undefined')return;
let built=null;const build=buildCity;buildCity=function(){build.apply(this,arguments);if(!city?.relocation)return;built=city;const D=level29InteriorModels,g=new THREE.Group();g.name='Farm visitor exhibits / zoo connection';cityGroup.add(g);const q=level29World.batch(g),wood=D.material('#927d5a','wood'),dark=D.material('#596c50'),solids=[];city.farmExhibitSolids=solids;const f=city.farm;
 for(const e of city.farmExhibits||[]){for(const z of [e.y,e.y+e.h]){q.box(e.w,1.2,1,e.x+e.w/2,9,z,wood);q.box(e.w,1.2,1,e.x+e.w/2,4,z,wood);solids.push({x:e.x,y:z-.6,w:e.w,h:1.2});}for(const x of [e.x,e.x+e.w]){q.box(1,10,e.h,x,5,e.y+e.h/2,wood);solids.push({x:x-.6,y:e.y,w:1.2,h:e.h});}for(const x of [e.x,e.x+e.w])for(const y of [e.y,e.y+e.h])q.box(2,12,2,x,6,y,wood);q.box(18,2,6,e.x+e.w/2,3,e.y+12,dark);addSign(g,e.kind.toUpperCase()+' · OBSERVE / U FEED',e.w,5,e.x+e.w/2,17,e.y+e.h+1,'#eddbb1');}
 const gate={x:f.x+f.w/2,y:f.y+f.h};addSign(g,'FARM / ZOO · SIX ANIMAL EXHIBITS',210,9,gate.x,28,gate.y+4,'#dce4b7');q.finish();if(window.level29BatchStatic)level29BatchStatic(g,[]);};
const blocked=blockedCircle;blockedCircle=function(x,y,r){if(city?.farmExhibitSolids?.some(b=>hitRect(x,y,r,b)))return true;return blocked.apply(this,arguments);};
})();
