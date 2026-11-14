'use strict';
(function(){
function plan(b){
 const bar={x:b.x+5,y:b.y+b.h*.39,w:12,h:Math.max(22,b.h*.28)};
 const stools=[0,1,2].map(i=>({x:b.x+26,y:bar.y+4+i*(bar.h-8)/2,w:6,h:6}));
 const table={x:b.x+b.w*.74,y:b.y+b.h*.76};
 const chairs=[{x:table.x-11,y:table.y},{x:table.x+11,y:table.y}];
 return {bar,stools,table,chairs,solids:[bar,...stools.map(s=>({x:s.x-3,y:s.y-3,w:6,h:6})),{x:table.x-7,y:table.y-7,w:14,h:14},...chairs.map(p=>({x:p.x-3,y:p.y-3,w:6,h:6}))]};
}
function build(T,v,k,sign){
 const b=v.b,p=plan(b),root=new T.Group();root.name='Major Cajun · bar dining and open kitchen';v.mesh.add(root);const buckets=new Map(),tmp=new T.Object3D(),color=new T.Color();let bottles=0;
 const mat=(c,extra={})=>new T.MeshStandardMaterial({color:c,roughness:.7,...extra}),wood=mat('#56382b'),gold=mat('#bc9750',{metalness:.4,roughness:.4}),steel=mat('#9da9ad',{metalness:.55,roughness:.3}),dark=mat('#253337'),cream=mat('#d9cfb2'),teal=mat('#286563'),purple=mat('#54285e'),red=mat('#9c4637'),paper=mat('#e8d7ae'),bottleMat=mat('#ffffff',{roughness:.25,metalness:.12}),glow=new T.MeshBasicMaterial({color:'#ffdfa0'});
 const cube=new T.BoxGeometry(1,1,1),cyl=new T.CylinderGeometry(1,1,1,10),sphere=new T.SphereGeometry(1,10,6),ring=new T.TorusGeometry(1,.1,5,16),neck=new T.CylinderGeometry(.32,.32,1.4,8),bottleGeo=new T.LatheGeometry([[0,0],[.65,0],[.75,.2],[.75,2.9],[.3,3.6],[.3,4.8],[0,4.8]].map(a=>new T.Vector2(...a)),8);
 function inst(geo,m,x,y,z,sx=1,sy=1,sz=1,tint,rot){let list=buckets.get(geo);if(!list){list=new Map();buckets.set(geo,list);}if(!list.has(m))list.set(m,[]);tmp.position.set(x,y,z);tmp.scale.set(sx,sy,sz);tmp.rotation.set(...(rot||[0,0,0]));tmp.updateMatrix();list.get(m).push({matrix:tmp.matrix.clone(),tint});}
 const box=(m,w,h,d,x,y,z,tint)=>inst(cube,m,x,y,z,w,h,d,tint);
 // Bold teal/purple walls and warm wood trim follow the eclectic dining reference.
 for(const side of [-1,1]){const x=side<0?b.x+3.4:b.x+b.w-3.4;box(side<0?teal:purple,.5,29,b.h-8,x,28,b.y+b.h/2);box(wood,.6,12,b.h-8,x,7,b.y+b.h/2);box(gold,.7,1,b.h-8,x,14,b.y+b.h/2);}
 box(teal,b.w-8,24,.5,b.x+b.w/2,29,b.y+3.5);box(wood,b.w-8,2,.8,b.x+b.w/2,43,b.y+3.7);
 // Floorboard joints and a coffered ceiling add depth without new floor blockers.
 for(let x=b.x+8;x<b.x+b.w-4;x+=9)box(wood,.12,.05,b.h-6,x,1.04,b.y+b.h/2);
 for(let z=b.y+12;z<b.y+b.h-4;z+=22)box(cream,b.w-6,.05,.14,b.x+b.w/2,1.04,z);
 for(const x of [b.x+b.w*.25,b.x+b.w*.75])box(wood,1.5,1.3,b.h-6,x,44.8,b.y+b.h/2);
 for(let z=b.y+12;z<b.y+b.h-5;z+=22)box(cream,b.w-6,1,1.2,b.x+b.w/2,45,z);
 // Back kitchen: tile seams, a commercial hood and squared ventilation duct.
 const kitchenZ=b.y+24;
 box(cream,b.w-9,28,.4,b.x+b.w/2,17,b.y+4.2);
 for(let x=b.x+6;x<b.x+b.w-4;x+=8)box(steel,.12,28,.2,x,17,b.y+4.5);
 for(let y=4;y<31;y+=8)box(steel,b.w-9,.12,.2,b.x+b.w/2,y,b.y+4.5);
 box(steel,49,4,27,k.x,37.5,kitchenZ);box(dark,45,.6,23,k.x,35.2,kitchenZ);
 for(let i=0;i<10;i++)box(steel,3,.4,20,k.x-20+i*4.4,34.7,kitchenZ);
 box(steel,18,7,15,k.x,42.5,kitchenZ-4);
 box(steel,b.w*.22,2,7,b.x+b.w*.7,29,b.y+9);
 for(let i=0;i<4;i++){inst(cyl,steel,b.x+b.w*.7-10+i*6,31,b.y+9,2.1,2,2.1);box(dark,5,.4,.5,b.x+b.w*.7-8+i*6,32,b.y+9);}
 // Commercial refrigerator fits behind the right prep station without changing its collider.
 box(steel,16,24,7,b.x+b.w-12,14,b.y+8);box(dark,.3,18,.2,b.x+b.w-12,14,b.y+11.7);for(const dx of [-2,2])box(dark,.5,7,.8,b.x+b.w-12+dx,15,b.y+12);
 // Visible frying pan and contained stylized flame: scenery, no hazards or new lights.
 const panX=k.x-12,panZ=k.z;
 inst(cyl,dark,panX,11.5,panZ,4.3,1.1,4.3);box(dark,9,.6,.9,panX-6,12,panZ);
 const fireMat=new T.MeshBasicMaterial({color:'#ed8c24',transparent:true,opacity:.75,depthWrite:false}),coreMat=new T.MeshBasicMaterial({color:'#ffe09a',transparent:true,opacity:.85,depthWrite:false});
 const flames=new T.Group();flames.name='Contained decorative saute flame';for(let i=0;i<3;i++){const flame=new T.Mesh(new T.ConeGeometry(1.1,5+i,6),i%2?coreMat:fireMat);flame.position.set(panX-1+i,14+i*.4,panZ);flame.userData.noBatch=true;flames.add(flame);}root.add(flames);
 // Mahogany bar with metal top, bottle shelves, gilded uprights and round bentwood stools.
 const r=p.bar,cx=r.x+r.w/2,cz=r.y+r.h/2;box(wood,r.w,11,r.h,cx,6,cz);box(steel,r.w+1,1,r.h+1,cx,12.2,cz);box(gold,1,1,r.h,cx+r.w/2,9,cz);
 box(wood,.5,24,r.h,b.x+4,27,cz);
 for(const z of [r.y,r.y+r.h])box(gold,1,27,1,b.x+4.5,27,z);
 for(let row=0;row<3;row++){
  const y=17+row*7;box(wood,5,.6,r.h,b.x+6.5,y,cz);box(glow,.4,.2,r.h-2,b.x+8.4,y+5.6,cz);
  for(let i=0;i<Math.floor((r.h-3)/2.3);i++){const z=r.y+2+i*2.3;inst(bottleGeo,bottleMat,b.x+7,y+.4,z,.78,.78,.78,['#52754b','#a27836','#c1bda1','#6d3825'][i%4]);inst(neck,gold,b.x+7,y+4,z,.7,.25,.7);box(paper,.12,1.2,1,b.x+7.63,y+2,z);bottles++;}
 }
 for(const s of p.stools){inst(cyl,wood,s.x,8.6,s.y,3.2,.9,3.2);for(const dx of [-1.9,1.9])for(const dz of [-1.9,1.9])box(wood,.45,8,.45,s.x+dx,4,s.y+dz);inst(ring,wood,s.x-1.5,13,s.y,4,4,4,null,[0,Math.PI/2,0]);}
 for(const z of [r.y+6,r.y+r.h-6]){inst(cyl,cream,cx,13,z,1.4,1.5,1.4);inst(sphere,glow,cx,14.3,z,.4,.7,.4);}
 // Compact dining table with black/teal chairs and upright menus.
 const t=p.table;box(wood,16,1.2,16,t.x,10.5,t.y);box(dark,2,10,2,t.x,5,t.y);box(cream,3,4,.3,t.x,13,t.y);inst(cyl,paper,t.x+4,12,t.y,1,1.8,1);
 for(const c of p.chairs){box(teal,6,1,6,c.x,6,c.y);box(dark,.7,10,6,c.x+(c.x<t.x?-2.7:2.7),11,c.y);for(const dx of [-2,2])for(const dz of [-2,2])box(dark,.5,6,.5,c.x+dx,3,c.y+dz);}
 // Original framed artwork and sunburst motif: not copied venue logos/posters.
 for(let i=0;i<5;i++){const z=b.y+b.h*.43+i*b.h*.085;box(gold,.6,9,7,b.x+b.w-4,29,z);box(i%2?teal:red,.7,7,5,b.x+b.w-4.4,29,z);box(paper,.8,.5,3,b.x+b.w-4.8,28,z);
  // Original poster motifs: sun, instrument-like curves and geometric festival art.
  inst(sphere,i%2?gold:paper,b.x+b.w-4.9,30,z,.12,1.2,1.2);
  for(let n=0;n<3;n++)box(i%2?red:teal,.9,.4,1.7,b.x+b.w-4.9,26.5+n*.8,z-.5+n*.45);
 }
 const sunX=b.x+b.w-4.7,sunZ=b.y+b.h*.78;inst(sphere,gold,sunX,31,sunZ,.5,4,4);for(let i=0;i<12;i++){const a=i*Math.PI/6;inst(cube,gold,sunX-.2,31+Math.sin(a)*6,sunZ+Math.cos(a)*6,.7,1,4,null,[-a,0,0]);}
 // Chandelier retains ceiling clearance and uses self-lit candle tips only.
 const lx=b.x+b.w*.54,lz=b.y+b.h*.66;box(gold,.3,8,.3,lx,41,lz);inst(ring,gold,lx,37,lz,7,7,7,null,[Math.PI/2,0,0]);
 for(let i=0;i<6;i++){const a=i*Math.PI/3,x=lx+Math.cos(a)*7,z=lz+Math.sin(a)*7;inst(cyl,cream,x,38.7,z,.35,3,.35);inst(sphere,glow,x,40.5,z,.4,.8,.4);}
 if(sign){sign(root,'MAJOR CAJUN · CHIEF JOJO',Math.min(60,b.w*.35),4,b.x+b.w*.77,40,b.y+5,'#f7dc91');sign(root,'GUMBO · GOOD FOOD · GOOD COMPANY',Math.min(60,b.w*.35),3,b.x+b.w*.77,34,b.y+5.2,'#efce9b');}
 for(const [geo,groups]of buckets)for(const [m,items]of groups){const mesh=new T.InstancedMesh(geo,m,items.length);mesh.userData.noBatch=true;items.forEach((a,i)=>{mesh.setMatrixAt(i,a.matrix);if(a.tint)mesh.setColorAt(i,color.set(a.tint));});root.add(mesh);}
 v.furniture.push(...p.solids);v.referenceJojo=true;root.userData.jojoRestaurant={bottles,drawBatches:root.children.length};return {root,plan:p};
}
const api={plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29JojoRestaurant=api;
})();
