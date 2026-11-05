'use strict';
(function(){
function layout(b){const levels=[0,34,68],rooms=6,windows=[];for(const floor of levels)for(let i=0;i<rooms;i++)for(const side of [-1,1])windows.push({x:b.x+18+i*(b.w-36)/(rooms-1),y:floor+18,z:side<0?b.y-.3:b.y+b.h+.3});return {levels,rooms,windows,height:102,footprint:{x:b.x,y:b.y,w:b.w,h:b.h}};}
function build(T,D,b){const p=layout(b),g=new T.Group();g.name='Camp Lejeune-inspired brick BEQ barracks';const brick=D.material('#9a6653','brick'),stone=D.material('#c5bba6','concrete'),roof=D.material('#46544d','metal',.35),glass=D.material('#4c6872','metal',.2),dark=D.material('#313f43','metal'),door=D.material('#66766a','metal');const box=(w,h,d,x,y,z,m)=>D.box(g,w,h,d,x,y,z,m);
 box(b.w,100,b.h,b.x+b.w/2,50,b.y+b.h/2,brick);box(b.w,3,b.h,b.x+b.w/2,1.5,b.y+b.h/2,stone);
 for(const y of [34,68,99])box(b.w+.2,.9,b.h+.2,b.x+b.w/2,y,b.y+b.h/2,stone);
 for(const w of p.windows){box(16,17,1.2,w.x,w.y,w.z,stone);box(13,14,1.4,w.x,w.y,w.z+(w.z<b.y?-.3:.3),glass);box(.7,14,1.6,w.x,w.y,w.z+(w.z<b.y?-.9:.9),dark);box(13,.6,1.6,w.x,w.y,w.z+(w.z<b.y?-.9:.9),dark);box(18,1,3,w.x,w.y-8.5,w.z,stone);}
 // Central enclosed stair tower/entry, not an exposed walkable balcony.
 box(28,101,8,b.x+b.w/2,50.5,b.y+b.h-3,stone);for(const y of [18,52,86])box(8,19,1,b.x+b.w/2,y,b.y+b.h+1.2,glass);for(const side of [-1,1])box(7,25,1,b.x+b.w/2+side*4,12.5,b.y+b.h+1.2,door);box(28,2,12,b.x+b.w/2,28,b.y+b.h-6,roof);
 // Standing-seam roof; geometry stays within the old barracks parcel.
 const half=b.h/2,rise=12,slope=Math.atan2(rise,half);for(const side of [-1,1]){const panel=new T.Mesh(new T.BoxGeometry(b.w,1.5,Math.hypot(half,rise)),roof);panel.position.set(b.x+b.w/2,106,b.y+b.h/2+side*half/2);panel.rotation.x=side*slope;g.add(panel);}for(let x=b.x+6;x<b.x+b.w;x+=10)for(const side of [-1,1]){const seam=new T.Mesh(new T.BoxGeometry(.45,1.8,Math.hypot(half,rise)),roof);seam.position.set(x,107,b.y+b.h/2+side*half/2);seam.rotation.x=side*slope;g.add(seam);}box(b.w,2,2,b.x+b.w/2,113,b.y+b.h/2,roof);
 box(18,3,10,b.x+22,105,b.y+18,dark);box(18,3,10,b.x+b.w-22,105,b.y+18,dark);g.userData.barracksLayout=p;if(typeof window!=='undefined'&&window.level29RoomPerformance?.mergeStatic){const meshes=[];g.traverse(o=>{if(o.isMesh)meshes.push(o);});window.level29RoomPerformance.mergeStatic(T,g,meshes);}return g;}
if(typeof module!=='undefined')module.exports={layout,build};if(typeof window!=='undefined')window.level29BarracksModel={layout,build};
})();
