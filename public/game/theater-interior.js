'use strict';
(function(){
function plan(b){const seats=[],rows=Math.max(2,Math.floor((b.h-68)/12)),perSide=Math.max(2,Math.floor((b.w/2-30)/9)),spacing=(b.w/2-30)/perSide;
 for(let row=0;row<rows;row++)for(const side of [-1,1])for(let col=0;col<perSide;col++){const x=b.x+b.w/2+side*(18+col*spacing),y=b.y+58+row*12;seats.push({x,y,row,side});}
 return {seats,solids:seats.map(s=>({x:s.x-3.6,y:s.y-4,w:7.2,h:8})),audience:seats.filter(s=>s.row<2).filter((_,i)=>i%2===0).slice(0,6)};
}
function build(T,v,sign){const b=v.b,p=plan(b),root=new T.Group();root.name='Bayou Laugh · ornate red and gold auditorium';v.mesh.add(root);const buckets=new Map(),tmp=new T.Object3D(),color=new T.Color();
 const mat=(c,e={})=>new T.MeshStandardMaterial({color:c,roughness:.7,...e}),red=mat('#782238'),velvet=mat('#a12b3c'),gold=mat('#b89b58',{metalness:.4,roughness:.4}),cream=mat('#d9c9a7'),wood=mat('#674633'),dark=mat('#302c2d'),black=mat('#17191e'),glow=new T.MeshBasicMaterial({color:'#ffebbf'});
 const cube=new T.BoxGeometry(1,1,1),cyl=new T.CylinderGeometry(1,1,1,12),sphere=new T.SphereGeometry(1,10,6),ring=new T.TorusGeometry(1,.028,5,40),ornament=new T.TorusGeometry(1,.18,5,14,Math.PI*1.5);
 function inst(g,m,x,y,z,sx=1,sy=1,sz=1,c,rot){if(!buckets.has(g))buckets.set(g,new Map());const by=buckets.get(g);if(!by.has(m))by.set(m,[]);tmp.position.set(x,y,z);tmp.scale.set(sx,sy,sz);tmp.rotation.set(...(rot||[0,0,0]));tmp.updateMatrix();by.get(m).push({matrix:tmp.matrix.clone(),c});}
 const box=(m,w,h,d,x,y,z,c)=>inst(cube,m,x,y,z,w,h,d,c),mid=b.x+b.w/2;
 // Carpet aisle and perimeter running trim retain the original level walking surface.
 box(red,25,.2,b.h-45,mid,1.12,b.y+(b.h+39)/2);for(const side of [-1,1])box(gold,.7,.1,b.h-45,mid+side*12,1.28,b.y+(b.h+39)/2);
 // Red plush seats: upholstered cushion/back, wooden shell, paired arms and pedestal.
 for(const s of p.seats){box(wood,7.3,7,1,s.x,5,s.y+3.8);box(velvet,6.5,6.2,1,s.x,5.5,s.y+3.1);box(red,6.6,1.5,6,s.x,3.9,s.y);box(dark,1.6,2.5,2.8,s.x,1.8,s.y);for(const side of [-1,1]){box(wood,.65,3,6,s.x+side*3.6,4,s.y);box(gold,.7,.25,5,s.x+side*3.6,5.7,s.y);}box(gold,1,.6,.15,s.x,7.5,s.y+4.4);}
 // Proscenium columns and red pleated side curtains frame Damion's existing stage.
 const stageFront=b.y+44,left=b.x+10,right=b.x+b.w-10;
 for(const x of [left,right]){box(cream,8,35,8,x,21,b.y+12);for(const y of [5,34,39])box(gold,10,1.8,10,x,y,b.y+12);for(const dx of [-2,0,2])box(gold,.45,26,.5,x+dx,21,b.y+16.2);}
 box(cream,b.w-12,5,9,mid,40,b.y+12);box(gold,b.w-10,1,10,mid,42.7,b.y+12);box(gold,b.w-12,.8,10,mid,37.2,b.y+12);
 // Open curtains are scenery; no opaque backdrop across the microphone/performance spot.
 const curtainW=Math.min(19,b.w*.15);
 for(const side of [-1,1]){const x=side<0?left+12:right-12;box(red,curtainW,29,3,x,21,b.y+8);for(let i=0;i<7;i++)inst(cyl,i%2?velvet:red,x-curtainW/2+(i+.5)*curtainW/7,21,b.y+10,.9,28,1.2);box(gold,curtainW+1,.8,3,x,11,b.y+11);}
 for(let i=0;i<10;i++){const x=b.x+23+(b.w-46)*(i+.5)/10;inst(sphere,red,x,35,b.y+8,(b.w-46)/17,4,1.7);inst(ring,gold,x,34.7,b.y+10,(b.w-46)/18,2,1,null,[0,0,Math.PI]);}
 box(black,b.w-56,21,.6,mid,19,b.y+3.7);
 // Cream-and-gold wall pilasters, inset red panels, scroll motifs and warm sconces.
 for(const side of [-1,1]){
  const x=b.x+(side<0?3.5:b.w-3.5);
  box(cream,.7,40,b.h-8,x,23,b.y+b.h/2);
  for(let z=b.y+42;z<b.y+b.h-22;z+=19){box(gold,1.3,28,2,x-side*.5,24,z);box(red,.8,14,10,x-side*.9,26,z+8);for(const end of [-1,1])inst(ornament,gold,x-side*1.5,34,z+8+end*3,.3,2,2,null,[0,Math.PI/2,0]);box(wood,1,7,2,x-side*1.4,18,z+8);inst(sphere,glow,x-side*2.2,22,z+8,.8,2,.8);}
  // Side balcony boxes visually echo the references but are not new traversable floors.
  box(wood,9,2,b.h*.58,x-side*4,27,b.y+b.h*.64);box(red,1.2,5,b.h*.58,x-side*8,30,b.y+b.h*.64);box(gold,1.6,.7,b.h*.58,x-side*8,33,b.y+b.h*.64);box(gold,1.2,.6,b.h*.58,x-side*8,27.7,b.y+b.h*.64);
  for(let z=b.y+b.h*.36;z<b.y+b.h*.93;z+=6)box(gold,.7,4,.5,x-side*8,30,z);
 }
 // Shallow rear balcony fascia stays well above the rear entry/service pad.
 box(wood,b.w-10,2,10,mid,27,b.y+b.h-8);box(red,b.w-10,5,1,mid,30,b.y+b.h-13);box(gold,b.w-10,.7,1.5,mid,33,b.y+b.h-13);for(let x=b.x+8;x<b.x+b.w-7;x+=6)box(gold,.5,4,.7,x,30,b.y+b.h-13);
 // Oval coffer medallion and small ornamental rosettes below the existing 45-unit roof.
 const centerZ=b.y+b.h*.58;inst(cyl,cream,mid,43.4,centerZ,b.w*.32,.6,b.h*.28);
 for(const [i,r]of [.18,.23,.29].entries())inst(ring,i===1?glow:gold,mid,42.8-i*.3,centerZ,b.w*r,b.h*r,b.h*r,null,[Math.PI/2,0,0]);
 for(let i=0;i<20;i++){const a=i*Math.PI/10,x=mid+Math.cos(a)*b.w*.285,z=centerZ+Math.sin(a)*b.h*.285;inst(sphere,gold,x,42,z,1.3,.4,1.3);inst(ring,wood,x,41.8,z,1.8,1.8,1.8,null,[Math.PI/2,0,0]);}
 // Tiered chandelier with candle tips: self-lit geometry, no point lights/shadows.
 inst(cyl,gold,mid,38.5,centerZ,.3,8,.3);for(let tier=0;tier<2;tier++){const r=5-tier*2,y=34-tier*3;inst(ring,gold,mid,y,centerZ,r,r,r,null,[Math.PI/2,0,0]);for(let i=0;i<8;i++){const a=i*Math.PI/4,x=mid+Math.cos(a)*r,z=centerZ+Math.sin(a)*r;box(gold,.2,3,.2,x,y+1.5,z);inst(sphere,glow,x,y+3,z,.35,.7,.35);inst(sphere,cream,x,y-1,z,.4,.8,.4);}}
 if(sign){sign(root,'BAYOU LAUGH THEATER',Math.min(b.w*.6,100),4,mid,41,b.y+17,'#ffe4a8');sign(root,'DAMION · LIVE COMEDY',Math.min(70,b.w*.5),3,mid,34,b.y+5,'#efd6a6');}
 for(const [g,groups]of buckets)for(const [m,items]of groups){const mesh=new T.InstancedMesh(g,m,items.length);mesh.userData.noBatch=true;items.forEach((a,i)=>{mesh.setMatrixAt(i,a.matrix);if(a.c)mesh.setColorAt(i,color.set(a.c));});root.add(mesh);}
 v.furniture.push(...p.solids);v.referenceTheater=true;root.userData.theater={seats:p.seats.length,drawBatches:root.children.length};return {root,plan:p};
}
const api={plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29Theater=api;
})();
