'use strict';
(function(){
function matches(v){return v?.depth==='botanica';}
function plan(b){const mid=b.x+b.w/2;
 const counter={x:mid-20,y:b.y+19,w:40,h:11},islands=[{x:b.x+23,y:b.y+b.h*.61,w:24,h:29},{x:b.x+b.w-45,y:b.y+b.h*.62,w:22,h:28}];
 const walls=[{x:b.x+4,y:b.y+4,w:b.w-8,h:8},{x:b.x+4,y:b.y+28,w:8,h:b.h*.55},{x:b.x+b.w-12,y:b.y+28,w:8,h:b.h*.55}];
 return {counter,islands,walls,solids:[counter,...islands,...walls],service:{x:mid,y:b.y+b.h*.35}};
}
function build(T,b,base=0,sign){
 const root=new T.Group();root.name='Moonlit Botanica · candles plants and pottery';const p=plan(b),batches=new Map(),o=new T.Object3D(),color=new T.Color();let products=0,plants=0;
 const mat=(c,e={})=>new T.MeshStandardMaterial({color:c,roughness:.8,...e}),wood=mat('#997653'),sage=mat('#49634e'),cream=mat('#e7ddc8'),steel=mat('#8d9996',{metalness:.35,roughness:.4}),dark=mat('#293630'),product=mat('#ffffff'),leaf=mat('#ffffff'),gold=mat('#bd9f5b',{metalness:.3}),glass=mat('#607c57',{roughness:.3}),glow=new T.MeshBasicMaterial({color:'#fff2d9'});
 const cube=new T.BoxGeometry(1,1,1),cyl=new T.CylinderGeometry(1,1,1,10),potGeo=new T.CylinderGeometry(1,.75,1,10),sphere=new T.SphereGeometry(1,8,6),ring=new T.TorusGeometry(1,.055,4,20),crystal=new T.ConeGeometry(1,1,5);
 function inst(g,m,x,y,z,sx=1,sy=1,sz=1,tint,rot){if(!batches.has(g))batches.set(g,new Map());const by=batches.get(g);if(!by.has(m))by.set(m,[]);o.position.set(x,base+y,z);o.scale.set(sx,sy,sz);o.rotation.set(...(rot||[0,0,0]));o.updateMatrix();by.get(m).push({matrix:o.matrix.clone(),tint});}
 const box=(m,w,h,d,x,y,z,c)=>inst(cube,m,x,y,z,w,h,d,c);
 const colors=['#e8d6ac','#9d3840','#d2a347','#6b9c79','#a87eb1','#e5b1bb','#416f8a'];
 function candle(x,y,z,i){inst(cyl,product,x,y+2,z,.85,4,.85,colors[i%7]);box(cream,1.1,1.5,.12,x,y+2,z+.86);box(gold,.2,.35,.2,x,y+4.2,z);products++;}
 function bottle(x,y,z,i){inst(cyl,glass,x,y+1.4,z,.65,2.8,.65);inst(cyl,gold,x,y+3.3,z,.3,1,.3);box(product,1,1.4,.1,x,y+1.4,z+.66,colors[i%7]);products++;}
 function plant(x,y,z,scale=1,i=0){inst(potGeo,product,x,y+1.6*scale,z,2*scale,3.2*scale,2*scale,['#d4b7a9','#e5e0d2','#ad7052','#9f9876'][i%4]);inst(cyl,dark,x,y+3.2*scale,z,1.7*scale,.15,1.7*scale);
  for(let k=0;k<5;k++){const a=k*2.4+i;inst(cyl,sage,x,y+5*scale,z,.12*scale,4*scale,.12*scale);inst(sphere,leaf,x+Math.cos(a)*1.4*scale,y+(5+k*.6)*scale,z+Math.sin(a)*1.4*scale,.8*scale,2*scale,.35*scale,['#3e704a','#638553','#7d9b5d'][k%3],[.2, a,.5]);}plants++;
 }
 box(wood,b.w-7,.2,b.h-7,b.x+b.w/2,1,b.y+b.h/2);for(let x=b.x+8;x<b.x+b.w-4;x+=7)box(dark,.12,.04,b.h-7,x,1.12,b.y+b.h/2);
 // Sage-green walls, a wood-framed interior window and tiled potting backsplash.
 box(sage,b.w-8,39,.5,b.x+b.w/2,25,b.y+3.5);box(cream,b.w-8,8,.6,b.x+b.w/2,11,b.y+3.8);
 box(wood,39,18,1,b.x+b.w/2,32,b.y+4.2);box(dark,35,14,1.1,b.x+b.w/2,32,b.y+4.3);
 for(const dx of [-12,0,12])box(wood,.7,14,1.3,b.x+b.w/2+dx,32,b.y+4.5);box(wood,35,.7,1.3,b.x+b.w/2,32,b.y+4.5);
 // Dense back shelves leave the window and the existing service station visible.
 for(const side of [-1,1]){const x=b.x+b.w/2+side*b.w*.34,w=b.w*.25;for(let row=0;row<4;row++){const y=4+row*8;box(wood,w,.6,7,x,y,b.y+8);for(let i=0;i<Math.floor(w/2.5);i++){const xx=x-w/2+1.5+i*2.5;if(row%2)candle(xx,y+.4,b.y+8,i+row);else bottle(xx,y+.4,b.y+8,i+row);}}}
 // Black metal candle/oil shelving on the left; white plant cubbies on the right.
 for(const [side,r]of p.walls.slice(1).map((r,i)=>[i===0?-1:1,r])){
  const x=r.x+r.w/2,z=r.y+r.h/2,m=side<0?steel:cream;
  for(const end of [-1,1])box(m,8,38,.7,x,21,z+end*r.h/2);
  for(let row=0;row<4;row++){const y=3+row*9;box(m,8,.6,r.h,x,y,z);for(let i=0;i<Math.floor(r.h/(side<0?3:9));i++){const zz=r.y+2+i*(side<0?3:9);if(side>0)plant(x,y+.5,zz,.65,i+row);else if(row%2)bottle(x,y+.4,zz,i);else candle(x,y+.4,zz,i+row);}}
 }
 // Two tiered market islands, split around a broad central customer aisle.
 for(const [k,r]of p.islands.entries()){
  const x=r.x+r.w/2,z=r.y+r.h/2;
  for(const y of [3,13,23]){box(wood,r.w,1,r.h,x,y,z);for(const dx of [-r.w*.4,r.w*.4])box(wood,1,y,1,x+dx,1+y/2,z);}
  if(k===0){for(let row=0;row<3;row++)for(let i=0;i<6;i++){const xx=r.x+3+(i%3)*7,zz=r.y+5+Math.floor(i/3)*14;if(row===2)plant(xx,24,zz,.8,i);else{bottle(xx,4+row*10,zz,i);candle(xx+2.5,4+row*10,zz,i+2);}}
   for(let i=0;i<7;i++)box(product,2,.8,9,r.x+2+i*3,4,z,colors[i%7]);
  }else{for(let i=0;i<8;i++){const xx=r.x+3+(i%4)*5,zz=r.y+5+Math.floor(i/4)*14;inst(crystal,product,xx,25,zz,.8,3+i%3,.8,['#d2c3d9','#f1e4d0','#b9c8c2'][i%3]);products++;bottle(xx,14,zz,i);box(product,4,2,5,xx,5,zz,colors[i%7]);}plant(x,24,z,1.1);}
 }
 // Potting/checkout table, ceramic bowls, buckets and original advice board.
 const c=p.counter,x=c.x+c.w/2,z=c.y+c.h/2;box(wood,c.w,2,c.h,x,12,z);for(const dx of [-17,17])box(wood,1.4,11,1.4,x+dx,6,z);
 for(let i=0;i<4;i++){inst(potGeo,cream,x-12+i*5,14,z,1.8,3,1.8);inst(cyl,dark,x-12+i*5,15.6,z,1.5,.1,1.5);}box(dark,6,4,1,x+13,15,z-1);box(product,4,2.5,.15,x+13,15,z-.4,'#94ac98');
 for(const side of [-1,1])for(let i=0;i<3;i++){const xx=x+side*(25+i*5);inst(potGeo,cream,xx,3.6,b.y+18,2.3,6,2.3);}
 // Paper lanterns and hanging plants create the light-filled plant-studio canopy.
 for(const [i,xx]of [b.x+b.w*.28,b.x+b.w*.5,b.x+b.w*.72].entries()){box(steel,.15,5,.15,xx,47,b.y+b.h*.45);inst(sphere,glow,xx,42,b.y+b.h*.45,5+i%2,5,5+i%2);for(let n=0;n<4;n++)inst(ring,cream,xx,39+n*1.7,b.y+b.h*.45,4.4,4.4,4.4,null,[Math.PI/2,0,0]);}
 for(const side of [-1,1]){const xx=b.x+b.w/2+side*(b.w/2-17),zz=b.y+b.h-22;box(steel,.15,7,.15,xx,44,zz);plant(xx,32,zz,1.2,side+2);for(let i=0;i<4;i++)for(let j=0;j<4;j++)inst(sphere,leaf,xx+Math.sin(i)*2,33-j*2,zz+Math.cos(i)*2,.5,1.2,.35,'#4d7c4e');}
 // Abstract floral/eye-inspired wall art, no copied religious or retailer imagery.
 for(let i=0;i<3;i++){const zz=b.y+35+i*19;box(wood,.7,9,8,b.x+b.w-3.5,40,zz);inst(sphere,gold,b.x+b.w-4,40,zz,.2,2,3);inst(sphere,dark,b.x+b.w-4.3,40,zz,.25,1.3,1.3);}
 if(sign){sign(root,'MOONLIT BOTANICA',Math.min(72,b.w*.55),5,b.x+b.w/2,46,b.y+5,'#e4cf9c');sign(root,'PLANTS · CANDLES · OILS · INCENSE',Math.min(80,b.w*.6),3,b.x+b.w/2,20,b.y+5,'#f1dfbe');}
 for(const [g,groups]of batches)for(const [m,items]of groups){const mesh=new T.InstancedMesh(g,m,items.length);mesh.userData.noBatch=true;items.forEach((a,i)=>{mesh.setMatrixAt(i,a.matrix);if(a.tint)mesh.setColorAt(i,color.set(a.tint));});root.add(mesh);}
 root.userData.botanica={products,plants,drawBatches:root.children.length};return {root,plan:p,solids:p.solids};
}
const api={matches,plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29Botanica=api;
})();
