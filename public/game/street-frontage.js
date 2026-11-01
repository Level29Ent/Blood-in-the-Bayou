'use strict';
(function(){
function point(p,c,angle){const dx=p.x-c.x,dy=p.y-c.y,co=Math.cos(angle),si=Math.sin(angle);return {x:c.x+co*dx+si*dy,y:c.y-si*dx+co*dy};}
function rect(r,c,angle){const ps=[point({x:r.x,y:r.y},c,angle),point({x:r.x+r.w,y:r.y},c,angle),point({x:r.x,y:r.y+r.h},c,angle),point({x:r.x+r.w,y:r.y+r.h},c,angle)],xs=ps.map(p=>p.x),ys=ps.map(p=>p.y);return {...r,x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)};}
function nearest(c,v,T,W,H,roads,water){
 const b=v.b,cx=b.x+b.w/2,cy=b.y+b.h/2,options=[{angle:0,x:cx,y:b.y+b.h,dx:0,dy:1},{angle:Math.PI,x:cx,y:b.y,dx:0,dy:-1},{angle:Math.PI/2,x:b.x+b.w,y:cy,dx:1,dy:0},{angle:-Math.PI/2,x:b.x,y:cy,dx:-1,dy:0}];let best=null;
 for(const side of options)for(let d=8;d<T*18;d+=8){const x=side.x+side.dx*d,y=side.y+side.dy*d,tx=Math.floor(x/T),ty=Math.floor(y/T);if(tx<1||ty<1||tx>=W-1||ty>=H-1||c.g[ty*W+tx]===water||c.buildings.some(o=>o!==b&&x>o.x-12&&x<o.x+o.w+12&&y>o.y-12&&y<o.y+o.h+12)||(c.features||[]).some(f=>f.kind==='cemetery'&&x>f.x-12&&x<f.x+f.w+12&&y>f.y-12&&y<f.y+f.h+12)||c.recreationParcel&&x>c.recreationParcel.x-16&&x<c.recreationParcel.x+c.recreationParcel.w+16&&y>c.recreationParcel.y-16&&y<c.recreationParcel.y+c.recreationParcel.h+16||c.farm&&x>c.farm.x-16&&x<c.farm.x+c.farm.w+16&&y>c.farm.y-16&&y<c.farm.y+c.farm.h+16)break;
  if(roads.includes(c.g[ty*W+tx])){if(!best||d<best.distance)best={...side,distance:d,street:{x,y}};break;}
 }
 return best;
}
function displayFront(v){
 if(v.lotId!=='dealer')return null;
 const b=v.b;
 // The slab display court is authored on +Y. Keep the showroom opening there,
 // not on whichever street happens to be closest to the rear/side of the lot.
 return {angle:0,x:b.x+b.w/2,y:b.y+b.h,dx:0,dy:1,distance:0,displayCourt:true};
}
if(typeof module!=='undefined')module.exports={point,rect,nearest,displayFront};if(typeof window==='undefined')return;
function lotPoint(l,p){const f=l?.venue?.frontage;if(!f||!f.angle)return p;const b=l.venue.b,cb=f.canonical;return point({x:cb.x+(p.x-b.x)/b.w*cb.w,y:cb.y+(p.y-b.y)/b.h*cb.h},f.center,f.angle);}
window.level29Frontage={point,rect,nearest,lotPoint};
const gen=genCity;
genCity=function(){const c=gen.apply(this,arguments);if(!c.world)return c;
 for(const v of c.venues){
  // Mansion lift/fortress and exterior activity shells retain their authored accessible entrance.
  if(v.b===c.mansion?.B)continue;
  const selected=displayFront(v)||nearest(c,v,TILE,MW,MH,[T_ROAD,T_BRIDGE],T_WATER);if(!selected)throw Error('No unobstructed street frontage for '+v.id);
  const b=v.b,center={x:b.x+b.w/2,y:b.y+b.h/2},angle=selected.angle,swap=Math.abs(Math.sin(angle))>.5;
  const cb={...b,x:center.x-(swap?b.h:b.w)/2,y:center.y-(swap?b.w:b.h)/2,w:swap?b.h:b.w,h:swap?b.w:b.h};
  v.frontage={...selected,center,canonical:cb};v.doorX=selected.x;v.doorY=selected.y;
  if(selected.displayCourt)v.entranceAisle={x:v.doorX-v.doorW/2-8,y:v.doorY-42,w:v.doorW+16,h:42};
  const s=point({x:cb.x+(v.stationX-b.x)/b.w*cb.w,y:cb.y+(v.stationY-b.y)/b.h*cb.h},center,angle);v.stationX=s.x;v.stationY=s.y;
  const walls=[{x:cb.x,y:cb.y,w:cb.w,h:3},{x:cb.x,y:cb.y,w:3,h:cb.h},{x:cb.x+cb.w-3,y:cb.y,w:3,h:cb.h},{x:cb.x,y:cb.y+cb.h-3,w:(cb.w-v.doorW)/2,h:3},{x:center.x+v.doorW/2,y:cb.y+cb.h-3,w:(cb.w-v.doorW)/2,h:3}];
  v.colliderWalls=walls.map(r=>rect(r,center,angle));v.colliderDoor=rect({x:center.x-v.doorW/2,y:cb.y+cb.h-3,w:v.doorW,h:3},center,angle);
  // Door -> sidewalk -> street uses the same straight ray used to choose its orientation.
  for(let d=8;d<selected.distance;d+=8){const x=Math.floor((v.doorX+selected.dx*d)/TILE),y=Math.floor((v.doorY+selected.dy*d)/TILE);if(![T_ROAD,T_BRIDGE].includes(c.g[y*MW+x]))c.g[y*MW+x]=T_WALK;}
  c.trees=c.trees.filter(t=>Math.abs((t.x-selected.x)*selected.dy-(t.y-selected.y)*selected.dx)>32||((t.x-selected.x)*selected.dx+(t.y-selected.y)*selected.dy)<-16||((t.x-selected.x)*selected.dx+(t.y-selected.y)*selected.dy)>selected.distance+24); // bounded entrance clearance
 }
 indexTrees(c);return c;
};
function clearService(v){if(v.id!=='armory')return;const f=v.frontage||{dx:0,dy:1,angle:0};
 for(let d=36;d<=72;d+=6){const x=v.doorX-f.dx*d,y=v.doorY-f.dy*d;if(x<v.b.x+14||x>v.b.x+v.b.w-14||y<v.b.y+14||y>v.b.y+v.b.h-14||v.furniture.some(r=>hitRect(x,y,14,r)))continue;
 v.stationX=x;v.stationY=y;if(v.pad){const p=f.angle?point({x,y},f.center,-f.angle):{x,y};v.pad.position.set(p.x,1,p.y);}break;
 }}
const builder=buildVenue;
buildVenue=function(v){
 if(v.mesh?.parent===cityGroup&&v.mesh.userData.frontageDone)return;
 const f=v.frontage;if(!f||!f.angle){builder.apply(this,arguments);clearService(v);return;}
 const actual=v.b,save={doorX:v.doorX,doorY:v.doorY,stationX:v.stationX,stationY:v.stationY,colliderWalls:v.colliderWalls,colliderDoor:v.colliderDoor};
 v.b=f.canonical;v.doorX=f.center.x;v.doorY=v.b.y+v.b.h;const st=point({x:save.stationX,y:save.stationY},f.center,-f.angle);v.stationX=st.x;v.stationY=st.y;
 v.colliderWalls=save.colliderWalls.map(r=>rect(r,f.center,-f.angle));v.colliderDoor=rect(save.colliderDoor,f.center,-f.angle);
 builder.call(this,v);v.b=actual;Object.assign(v,save);
 v.mesh.userData.frontageDone=true;const co=Math.cos(f.angle),si=Math.sin(f.angle);v.mesh.rotation.y=f.angle;v.mesh.position.x=f.center.x-co*f.center.x-si*f.center.y;v.mesh.position.z=f.center.y+si*f.center.x-co*f.center.y;
 v.furniture=v.furniture.map(r=>rect(r,f.center,f.angle));if(v.floorFurniture){v.floorFurniture=v.floorFurniture.map(list=>list.map(r=>rect(r,f.center,f.angle)));v.furniture=v.floorFurniture[v.floor||0];}
 if(Number.isFinite(v.workerX)){const p=point({x:v.workerX,y:v.workerY},f.center,f.angle);v.workerX=p.x;v.workerY=p.y;}
 if(v.elevatorPoint)v.elevatorPoint=point(v.elevatorPoint,f.center,f.angle);if(v.elevatorLanding)v.elevatorLanding=point(v.elevatorLanding,f.center,f.angle);
 clearService(v);
 for(const staff of v.staff||[]){const p=point(staff,f.center,f.angle);staff.x=p.x;staff.y=p.y;}
};
})();
