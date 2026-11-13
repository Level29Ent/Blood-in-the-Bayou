'use strict';
(function(){
if(typeof window==='undefined')return;
const gen=genCity;genCity=function(){const c=gen.apply(this,arguments);if(!c.world)return c;
 const r=level29Southern.parcel(c,{w:160,h:192},TILE);if(!r)throw Error('No clear road-accessible Karma parcel');
 const b={x:r.x,y:r.y,w:160,h:192,H:23,kind:'normal',baseY:0,col:'#183e29'},v=createVenue(b,'retail','karma');
 Object.assign(v,{name:'KARMA DISPENSARY',short:'Karma',karma:true,letter:'K',col:'#8fbe51',open:true,baseY:0,doorW:50,stationX:b.x+b.w/2,stationY:b.y+48,serviceLabel:'U · KARMA COUNTER'});
 c.buildings.push(b);c.venues.push(v);c.karma=v;
 for(let y=b.y/TILE;y<(b.y+b.h)/TILE;y++)for(let x=b.x/TILE;x<(b.x+b.w)/TILE;x++)c.g[y*c.width+x]=T_LOT;
 for(let y=Math.floor(v.doorY/TILE);y<=Math.floor(r.road.y/TILE);y++)if(![T_ROAD,T_BRIDGE].includes(c.g[y*c.width+Math.floor(v.doorX/TILE)]))c.g[y*c.width+Math.floor(v.doorX/TILE)]=T_WALK;
 for(const key of ['trees','pineTrees','rocks','parked'])if(c[key])c[key]=c[key].filter(p=>!(p.x>b.x-24&&p.x<b.x+b.w+24&&p.y>b.y-24&&p.y<r.road.y+24));
 indexTrees(c);return c;
};
const builder=buildVenue;buildVenue=function(v){if(!v.karma)return builder.apply(this,arguments);if(v.mesh?.parent===cityGroup)return;
 const model=level29KarmaModel.buildKarma(THREE),b=v.b,root=model.root,sx=b.w/14,sz=b.h/16;
 root.scale.set(sx,10,sz);root.position.set(b.x+b.w/2,city.heightAt(b.x+b.w/2,b.y+b.h/2),b.y+b.h/2);cityGroup.add(root);v.mesh=root;v.roof=model.roof;v.door=new THREE.Object3D();root.add(v.door);
 const rect=s=>({x:root.position.x+s.x*sx,y:root.position.z+s.y*sz,w:s.w*sx,h:s.h*sz});
 v.colliderWalls=model.solids.filter(s=>s.w>10||s.h>10).map(rect);v.furniture=model.solids.filter(s=>s.w<=10&&s.h<=10).map(rect);v.colliderDoor=null;
 // Merge in local coordinates (not world-space) and protect the roof and glass.
 const leaves=[];root.traverse(o=>{if(o.isMesh&&o!==v.roof&&!o.material.transparent)leaves.push(o);});
 if(window.level29RoomPerformance)level29RoomPerformance.mergeStatic(THREE,root,leaves);
 root.traverse(o=>{if(o.isMesh)o.userData.noBatch=true;});
};
const service=serviceVenue;serviceVenue=function(){const v=city?.karma;if(state==='play'&&player&&!player.dead&&!player.car&&v&&insideVenue(v,player)&&Math.hypot(player.x-v.stationX,player.y-v.stationY)<38){toast('KARMA · WELCOME IN · EXPLORE THE SHOP');return;}return service.apply(this,arguments);};
const blips=extraBlips;extraBlips=function(){const out=blips.apply(this,arguments).filter(p=>!city?.karma||p.x!==city.karma.doorX||p.y!==city.karma.doorY);if(city?.karma)out.push({x:city.karma.doorX,y:city.karma.doorY+20,label:'K',col:'#8fbe51'});return out;};
window.level29Karma={get venue(){return city?.karma;}};
})();
