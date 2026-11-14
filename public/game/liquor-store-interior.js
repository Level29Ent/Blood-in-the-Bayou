'use strict';
(function(){
function matches(v){return v?.id==='retail'&&/LIQUOR STORE/i.test(v.name||'');}
function plan(b){
 const mid=b.x+b.w/2,depth=Math.min(10,b.w*.07),run=b.h*.29,z=b.y+b.h*.65;
 const shelves=[b.x+b.w*.30,b.x+b.w*.70].map(x=>({x:x-depth/2,y:z-run/2,w:depth,h:run,kind:'gondola'}));
 const back={x:b.x+5,y:b.y+4,w:b.w-10,h:9,kind:'spirits'};
 const sides=[{x:b.x+4,y:b.y+b.h*.26,w:7,h:b.h*.50,kind:'wine'},{x:b.x+b.w-11,y:b.y+b.h*.26,w:7,h:b.h*.50,kind:'spirits'}];
 const counter={x:mid-Math.min(38,b.w*.29)/2,y:b.y+18,w:Math.min(38,b.w*.29),h:10,kind:'checkout'};
 const cases=[-1,1].map(side=>({x:mid+side*b.w*.34-6,y:b.y+b.h-20,w:12,h:12,kind:'cases'}));
 return {back,sides,shelves,counter,cases,solids:[back,...sides,...shelves,counter,...cases],entry:{x:mid,y:b.y+b.h},service:{x:mid,y:b.y+b.h*.35}};
}
function build(T,b,base=0,sign){
 const p=plan(b),root=new T.Group();root.name='Neighborhood liquor · reference interior';
 const batches=new Map(),matrix=new T.Object3D(),tint=new T.Color();let bottles=0;
 const mat=(color,extra={})=>{const m=new T.MeshStandardMaterial({color,roughness:.75,...extra});return m;};
 const oak=mat('#79553a'),pale=mat('#bca17c'),steel=mat('#555d60',{metalness:.45,roughness:.4}),dark=mat('#262b2e'),paper=mat('#eee3ca'),white=mat('#ffffff'),glass=mat('#829b7b',{roughness:.22,metalness:.12}),cap=mat('#e0c58c',{metalness:.25,roughness:.4});
 const glow=new T.MeshBasicMaterial({color:'#fff5dc'});
 const cube=new T.BoxGeometry(1,1,1),plane=new T.PlaneGeometry(1,1);
 function instance(geo,m,x,y,z,sx,sy,sz,color,angle=0){let byGeo=batches.get(geo);if(!byGeo){byGeo=new Map();batches.set(geo,byGeo);}if(!byGeo.has(m))byGeo.set(m,[]);byGeo.get(m).push({x,y:base+y,z,sx,sy,sz,color,angle});}
 const box=(m,w,h,d,x,y,z,color)=>instance(cube,m,x,y,z,w,h,d,color);
 // Small repeatable label patterns keep the stock recognizably bottled rather than solid blocks.
 const data=new Uint8Array(64*64*4);for(let y=0;y<64;y++)for(let x=0;x<64;x++){
  const line=y>16&&y<47&&y%6<2&&x>9&&x<55,c=line?65:y<7||y>57?153:238;data.set([c,c,c,255],(y*64+x)*4);
 }
 const labelTex=new T.DataTexture(data,64,64);labelTex.encoding=T.sRGBEncoding;labelTex.needsUpdate=true;
 const labels=mat('#ffffff',{map:labelTex});
 const profiles=[[[0,0],[.7,0],[.86,.25],[.86,3.8],[.52,4.5],[.32,4.8],[.32,6],[0,6]],[[0,0],[.85,0],[.9,.25],[.9,3.3],[.52,3.7],[.28,4.1],[.28,5.5],[0,5.5]],[[0,0],[.65,0],[.79,.3],[.79,3.5],[.43,4],[.29,4.3],[.29,5.7],[0,5.7]]];
 const bottleGeo=profiles.map(points=>new T.LatheGeometry(points.map(a=>new T.Vector2(...a)),10));
 const capGeo=new T.CylinderGeometry(.35,.35,.55,8);
 const colors=['#72936b','#a07539','#43664c','#c6c8a5','#874d25','#e4dfcb','#344a3b','#bc923f'];
 const labelColors=['#eee4c9','#bba165','#ddd7c2','#ab3430','#3b698a'];
 function bottle(x,y,z,i,scale=1,angle=0){
  const type=i%3,height=[6,5.5,5.7][type];instance(bottleGeo[type],glass,x,y,z,scale,scale,scale,colors[i%colors.length]);
  instance(capGeo,cap,x,y+(height-.15)*scale,z,scale,scale,scale,i%4===0?'#332e29':i%4===1?'#b8543b':'#c2ae70');
  const nx=Math.sin(angle),nz=Math.cos(angle);instance(plane,labels,x+nx*.87*scale,y+2.5*scale,z+nz*.87*scale,1.45*scale,1.9*scale,1,labelColors[i%labelColors.length],angle);bottles++;
 }
 // Gray-brown plank floor, staggered joints, and a drop-ceiling fluorescent grid.
 box(pale,b.w-7,.18,b.h-7,b.x+b.w/2,.95,b.y+b.h/2);
 for(let x=b.x+4;x<b.x+b.w-3;x+=6){box(steel,.12,.04,b.h-7,x,1.06,b.y+b.h/2);for(let z=b.y+8+(Math.round(x)%3)*8;z<b.y+b.h-3;z+=30)box(steel,Math.min(6,b.x+b.w-3-x),.04,.12,x+Math.min(6,b.x+b.w-3-x)/2,1.06,z);}
 for(let x=b.x+4;x<b.x+b.w-3;x+=20)box(steel,.18,.12,b.h-7,x,50.5,b.y+b.h/2);
 for(let z=b.y+4;z<b.y+b.h-3;z+=20)box(steel,b.w-7,.12,.18,b.x+b.w/2,50.5,z);
 for(const x of [b.x+b.w*.30,b.x+b.w*.70])for(const z of [b.y+b.h*.24,b.y+b.h*.70]){box(dark,11,.5,23,x,49.9,z);box(glow,9,.3,21,x,49.55,z);}
 function price(x,y,z,w,angle=0){instance(plane,paper,x,y,z,w,.8,1,null,angle);for(let i=0;i<3;i++)instance(plane,dark,x+Math.cos(angle)*(-w*.2+i*w*.2),y,z+Math.sin(-angle)*(-w*.2+i*w*.2)+.012,w*.08,.3,1,null,angle);}
 // Wooden premium back bar: thin back panels never hide the front-facing bottles.
 const r=p.back;box(oak,r.w,36,.6,r.x+r.w/2,21,r.y+.3);
 const bays=Math.max(3,Math.floor(r.w/28)),bay=r.w/bays;
 for(let i=0;i<=bays;i++)box(pale,.7,37,r.h,r.x+i*bay,21,r.y+r.h/2);
 for(let row=0;row<4;row++){
  const y=3+row*8;box(oak,r.w,.7,r.h,r.x+r.w/2,y,r.y+r.h/2);box(glow,r.w,.18,.5,r.x+r.w/2,y+7.3,r.y+1.5);
  for(let i=0;i<Math.floor((r.w-4)/2.7);i++)bottle(r.x+2+i*2.7,y+.5,r.y+5,i+row*7,.95);
  for(let i=0;i<bays;i++)price(r.x+(i+.5)*bay,y-.4,r.y+r.h/2+4.7,4);
 }
 // Side shelving uses upright long rows and an inward-facing label direction.
 for(const [k,r]of p.sides.entries()){
  const side=k===0?1:-1,backX=k===0?r.x:r.x+r.w,x=r.x+r.w/2;
  box(dark,.5,36,r.h,backX,20,r.y+r.h/2);
  for(const z of [r.y,r.y+r.h])box(steel,r.w,37,.7,x,20,z);
  for(let row=0;row<4;row++){
   const y=3+row*8;box(steel,r.w,.6,r.h,x,y,r.y+r.h/2);
   for(let i=0;i<Math.floor((r.h-3)/2.6);i++)bottle(x,y+.4,r.y+2+i*2.6,i+row*3,.92,side*Math.PI/2);
   for(let i=0;i<4;i++)price(x+side*(r.w/2+.1),y-.3,r.y+(i+.5)*r.h/4,3.4,side*Math.PI/2);
  }
 }
 // Double-sided gray gondolas with visible bottle necks, colored caps and shelf tickets.
 for(const [k,r]of p.shelves.entries()){
  const x=r.x+r.w/2,z=r.y+r.h/2;box(dark,r.w,2,r.h,x,2,z);box(dark,.5,29,r.h,x,16,z);
  for(const zz of [r.y,r.y+r.h])for(const side of [-1,1])box(steel,.7,30,.7,x+side*(r.w/2-.4),16,zz);
  for(let row=0;row<4;row++){
   const y=4+row*7;box(steel,r.w,.6,r.h,x,y,z);
   for(const side of [-1,1]){
    box(paper,.25,1,r.h,x+side*r.w/2,y,z);
    for(let i=0;i<Math.floor((r.h-3)/2.5);i++)bottle(x+side*(r.w*.28),y+.4,r.y+2+i*2.5,i+row+k*13,.83,side*Math.PI/2);
    for(let i=0;i<4;i++)price(x+side*(r.w/2+.2),y,r.y+(i+.5)*r.h/4,3,side*Math.PI/2);
   }
  }
 }
 // Mixed shipping cases near aisle ends, clear of the doorway and story pickup.
 for(const [k,r]of p.cases.entries())for(let row=0;row<3;row++){
  box(white,r.w,4,r.h,r.x+r.w/2,3+row*4.1,r.y+r.h/2,k?'#41685b':'#61558d');
  instance(plane,labels,r.x+r.w/2,3+row*4.1,r.y+r.h+.02,9,2.8,1,'#eee2ca');
  if(row===2)for(let i=0;i<3;i++)bottle(r.x+2+i*3.5,13.5,r.y+r.h/2,i+k*3,.75);
 }
 // A compact real counter behind the existing story station, with a till and bagging space.
 const c=p.counter,cx=c.x+c.w/2,cz=c.y+c.h/2;
 const cover=new T.Mesh(new T.BoxGeometry(c.w,11,c.h),oak);cover.name='Liquor checkout cover';cover.position.set(cx,base+6.5,cz);root.add(cover);
 box(dark,c.w+1,1,c.h+1,cx,12.5,cz);box(steel,8,1,6,cx+9,13.5,cz);box(dark,6,5,1,cx+9,16.3,cz-1);box(glow,4.5,3,.2,cx+9,16.3,cz-.38);box(paper,6,.3,5,cx-8,13.3,cz);box(pale,5,6,4,cx-11,16,cz-1);
 if(sign){
  sign(root,'RUM  ·  TEQUILA  ·  GIN',Math.min(b.w-12,120),6,b.x+b.w/2,44,b.y+13,'#f4ddb2');
  for(const [k,r]of p.shelves.entries())sign(root,k?'WINE / SPIRITS':'WHISKEY / BOURBON',Math.min(35,r.h),4,r.x+r.w/2,35,r.y+r.h+.5,'#e8d4a8');
  sign(root,'CHECKOUT',c.w,3,cx,8,c.y+c.h+.6,'#f0e2c9');
 }
 for(const [geo,groups]of batches)for(const [m,items]of groups){
  const mesh=new T.InstancedMesh(geo,m,items.length);mesh.userData.noBatch=true;
  items.forEach((a,i)=>{matrix.position.set(a.x,a.y,a.z);matrix.rotation.set(0,a.angle,0);matrix.scale.set(a.sx,a.sy,a.sz);matrix.updateMatrix();mesh.setMatrixAt(i,matrix.matrix);if(a.color)mesh.setColorAt(i,tint.set(a.color));});root.add(mesh);
 }
 root.userData.liquorStore={bottles,drawBatches:root.children.length};return {root,plan:p,solids:p.solids};
}
const api={matches,plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29LiquorStore=api;
})();
