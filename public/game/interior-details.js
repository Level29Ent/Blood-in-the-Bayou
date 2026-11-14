'use strict';
(function(){
const builder=buildVenue;
buildVenue=function(v){builder.apply(this,arguments);if(v.referenceLaundry||v.referenceDonut||v.referenceSmoke||v.referenceBonnie||v.referenceGas||['mall','bank','police'].includes(v.id)||v.id==='hospital'||v.kind==='snowballs'||v.storyRole==='jojo'||v.storyRole==='damion'||!v.mesh||v.mesh.userData.roomClutter)return;v.mesh.userData.roomClutter=true;
 const b=v.b,g=new THREE.Group();g.name='business-interior-props';v.mesh.add(g);const {material,batch}=level29World,q=batch(g),wood=material('#795b43'),steel=material('#839295',.45,.45),cloth=material('#486b63'),paper=material('#e2d9bd'),dark=material('#26363d');
 function fixture(x,y,w,d,kind){const r={x:x-w/2,y:y-d/2,w,h:d};const aisle=v.entranceAisle;if(aisle&&r.x<aisle.x+aisle.w&&r.x+r.w>aisle.x&&r.y<aisle.y+aisle.h&&r.y+r.h>aisle.y)return;if(Math.abs(x-v.doorX)<w/2+18&&y+d/2>v.doorY-40)return;
 if(x-w/2<b.x+6||x+w/2>b.x+b.w-6||y-d/2<b.y+6||y+d/2>b.y+b.h-6||dist(x,y,v.stationX,v.stationY)<42||v.furniture.some(f=>hitRect(x,y,Math.max(w,d)*.65,f)))return;
 v.furniture.push(r);
 if(kind==='desk'){q.box(w,2,d,x,12,y,wood);for(const xx of [-w*.4,w*.4])q.box(2,12,d-2,x+xx,6,y,steel);q.box(10,7,1,x,18,y-3,dark);q.box(4,4,4,x+w*.3,15,y,paper);q.box(7,.5,4,x,13.5,y+3,paper);}
 else if(kind==='display'){q.box(w,11,d,x,5.5,y,wood);q.box(w-2,.5,d-2,x,12,y,paper);for(let i=0;i<3;i++){q.box(4,2,5,x-w*.3+i*w*.3,14,y,cloth);q.box(4,1,3,x-w*.3+i*w*.3,16,y,paper);}}
 else if(kind==='medical'){q.box(w,5,d,x,4,y,steel);q.box(w-2,2,d-2,x,8,y,paper);q.box(2,22,2,x+w/2-2,11,y,steel);q.box(8,7,2,x+w/2-2,22,y,dark);for(let i=0;i<3;i++)q.box(1,1,2.2,x+w/2-4+i*2,22,y+.1,cloth);}
 else if(kind==='shelf'){for(const z of [-d/2,d/2])for(const xx of [-w/2,w/2])q.box(1,26,1,x+xx,13,y+z,steel);for(let h=4;h<25;h+=9){q.box(w,1,d,x,h,y,wood);for(let i=0;i<3;i++)q.box(w/5,4,d*.6,x-w*.3+i*w*.3,h+3,y,i%2?paper:cloth);}}
 else if(kind==='partition'){q.box(w,24,2,x,12,y,cloth);for(const xx of [-w*.4,w*.4])q.box(2,2,d,x+xx,1,y,steel);}
 else{q.box(w,6,d,x,3,y,cloth);q.box(w,10,2,x,9,y-d/2,cloth);for(const xx of [-w*.35,w*.35])q.box(2,3,2,x+xx,1.5,y,wood);}
 }
 const kind=v.id==='hospital'||v.kind==='clinic'?'medical':['grocery','gas','armory','retail'].includes(v.id)||v.kind==='fish'||v.kind==='smoke'?'shelf':['bank','business','police','terminal','studio'].includes(v.id)?'desk':['cafe','showroom','casino'].includes(v.id)?'display':'seating';
 for(const side of [-1,1]){const x=b.x+b.w/2+side*(b.w/2-20);fixture(x,b.y+b.h*.64,24,18,kind);fixture(x,b.y+b.h*.82,24,18,'seating');}
 if(v.id==='hospital'||v.kind==='clinic')fixture(b.x+b.w*.7,b.y+b.h*.48,28,12,'partition');
 // Wall-mounted stock/art breaks up blank rooms without consuming walking space.
 for(const side of [-1,1]){const x=b.x+b.w/2+side*(b.w/2-2);q.box(1,11,18,x,28,b.y+b.h*.45,wood);q.box(1.2,8,15,x-side*.3,28,b.y+b.h*.45,paper);for(let i=0;i<3;i++)q.box(1.4,1,9,x-side*.5,26+i*2,b.y+b.h*.45,cloth);}
 for(const side of [-1,1])fixture(b.x+b.w/2+side*(b.w/2-20),b.y+b.h*.45,22,16,kind);
 q.finish();
};
})();
