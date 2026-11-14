'use strict';
(function(){
// Shared by the live venue and isolated review. Distances are in existing game units.
function plan(b){
 const cx=b.x+b.w/2, shelfY=b.y+b.h*.65;
 const shelves=[b.x+b.w*.19,b.x+b.w*.76].map(x=>({x:x-10,y:shelfY-18,w:20,h:36,kind:'snacks'}));
 const counter={x:b.x+12,y:b.y+30,w:b.w*.38,h:17,kind:'checkout'};
 const coolers=[{x:b.x+b.w*.60,y:b.y+4,w:b.w*.35,h:11,kind:'cooler'}, {x:b.x+b.w-15,y:b.y+39,w:11,h:62,kind:'cooler'}];
 const stock={x:b.x+12,y:b.y+4,w:b.w*.38,h:8,kind:'stock'};
 return {shelves,counter,coolers,stock,solids:[counter,...coolers,stock,...shelves],entry:{x:cx,y:b.y+b.h},service:{x:cx,y:b.y+b.h*.65},staff:{x:b.x+12+b.w*.19,y:b.y+21}};
}
function build(T,b,base=0){
 const p=plan(b),root=new T.Group(),batches=new Map(),textures=[];root.name='GAS & GO · reference convenience interior';
 const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.78,...extra});
 const dark=mat('#25292c'),steel=mat('#b3b8b6',{metalness:.48,roughness:.35}),white=mat('#e2e0d5'),wood=mat('#625b55'),black=mat('#13191d'),gold=mat('#c99a48'),product=mat('#ffffff');
 const glow=new T.MeshBasicMaterial({color:'#eaf8ff'}),glass=mat('#b9d7dc',{transparent:true,opacity:.17,roughness:.16,depthWrite:false});
 function box(m,w,h,d,x,y,z,color){if(!batches.has(m))batches.set(m,[]);batches.get(m).push({w,h,d,x,y:base+y,z,color});}
 function texture(kind){const size=128,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){let n=((x*17+y*23+x*y)%19)-9,c;
  if(kind==='tile'){const vein=Math.sin(x*.07+y*.11+Math.sin(y*.08)*3);c=190+n+(vein>.92?9:vein<-.93?-10:0);if(x<2||y<2)c=135;data.set([c+8,c+4,c-7,255],(y*size+x)*4);}
  else{c=235+n*.3;if(y>32&&y<81)c=255;if((y===48||y===54||y===60)&&x>26&&x<100)c=75;if(y>103)c=180;data.set([c,c,c,255],(y*size+x)*4);}}
 const t=new T.DataTexture(data,size,size);t.encoding=T.sRGBEncoding;t.wrapS=t.wrapT=T.RepeatWrapping;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;textures.push(t);return t;}
 const floor=mat('#ffffff',{map:texture('tile'),roughness:.38,metalness:.03});floor.map.repeat.set(b.w/24,b.h/24);
 box(floor,b.w-7,.12,b.h-7,b.x+b.w/2,1,b.y+b.h/2);
 const packs=mat('#ffffff',{map:texture('pack')});
 const colors=['#ca352c','#e8b328','#3f8151','#286eab','#e37d32','#72519d'];let products=0;
 function pack(x,y,z,w,h,d,i){box(packs,w,h,d,x,y,z,colors[i%colors.length]);products++;}
 function bottle(x,y,z,i){pack(x,y,z,1.8,4.1,1.8,i);box(steel,1.1,.55,1.1,x,y+2.5,z);box(product,1.8,1,1.86,x,y-.1,z,'#e7e8d9');}
 // Tiled floor, charcoal entrance mat and suspended ceiling grid with luminous strips.
 box(dark,40,.15,18,p.entry.x,1.15,b.y+b.h-14);
 for(let x=b.x+4;x<b.x+b.w-3;x+=24)box(steel,.14,.1,b.h-7,x,50.75,b.y+b.h/2);
 for(let z=b.y+4;z<b.y+b.h-3;z+=24)box(steel,b.w-7,.1,.14,b.x+b.w/2,50.75,z);
 for(const x of [b.x+b.w*.25,b.x+b.w*.70])for(const z of [b.y+31,b.y+b.h-32]){box(dark,37,.35,3.4,x,50.3,z);box(glow,35,.25,2.5,x,50,z);}
 // Long gray millwork checkout with ribbed fascia, pale stone top and black toe kick.
 const c=p.counter,cx=c.x+c.w/2,cz=c.y+c.h/2;
 const cover=new T.Mesh(new T.BoxGeometry(c.w,13,c.h),wood);cover.name='Checkout cover';cover.position.set(cx,base+7.5,cz);root.add(cover);box(black,c.w,1.4,c.h,cx,1.8,cz);box(white,c.w+1.5,1,c.h+1.5,cx,14.5,cz);
 for(let x=c.x+1;x<c.x+c.w;x+=1.6)box(steel,.14,11,.2,x,8,c.y+c.h/2+8.6);
 // Till, card reader, paper cups and a glazed heated-food display at the far end.
 box(black,8,2,6,cx-12,16,cz);box(dark,7,5,1,cx-12,19,cz);box(glow,5.5,3,.2,cx-12,19,cz+.61);box(black,3,1.5,4,cx-3,16,cz+3);
 const hx=c.x+c.w-15;box(steel,23,2,13,hx,16,cz);box(gold,23,.5,12,hx,23,cz);box(glass,23,7,.2,hx,20,cz+6);box(glass,23,7,.2,hx,20,cz-6);
 for(const x of [hx-11.5,hx+11.5]){box(glass,.2,7,12,x,20,cz);box(steel,.5,8,.5,x,20,cz+6);}
 for(let i=0;i<6;i++)box(gold,2.5,1.1,3.5,hx-8+i*3.2,17.7,cz);
 for(let i=0;i<3;i++)box(white,1.5,2.2,1.5,cx+1+i*2,16.2,cz-4);
 box(dark,8,11,8,c.x+2,6,c.y+c.h+9);box(steel,9,1,9,c.x+2,12,c.y+c.h+9);
 // Back-bar liquor / tobacco stock: actual rows of colored packages and bottle necks.
 const s=p.stock;box(dark,s.w,28,.7,s.x+s.w/2,15,s.y+.4);
 for(let row=0;row<4;row++){box(steel,s.w,.5,8,s.x+s.w/2,3+row*7,s.y+4);for(let i=0;i<Math.floor(s.w/3.6);i++)bottle(s.x+2+i*3.6,6+row*7,s.y+5,i+row);}
 // Double-sided gondolas, six stocked faces per aisle and candy endcaps.
 for(const [k,r]of p.shelves.entries()){
 const x=r.x+r.w/2,z=r.y+r.h/2;box(dark,r.w,2,r.h,x,2,z);box(dark,1,24,r.h,x,14,z);
 for(const end of [-1,1])box(steel,1,26,1,x,14,z+end*(r.h/2-.5));
 for(let row=0;row<4;row++){const y=4+row*5.5;box(steel,r.w,.6,r.h,x,y,z);
 for(const side of [-1,1]){box(white,.25,1,r.h,x+side*(r.w/2+.1),y,z);for(let j=0;j<8;j++)pack(x+side*5.5,y+2.4,z-r.h/2+2.4+j*4.4,6,3.9,3.4,j+row+k);}}
 for(let row=0;row<5;row++){box(dark,r.w,.6,4,x,3+row*4,z+r.h/2+1);for(let j=0;j<5;j++)pack(x-8+j*4,4.4+row*4,z+r.h/2+1,3.3,1.8,2.5,j+row);}
 }
 // Back and side refrigerator banks. Glass stays faint so shelves remain legible.
 for(const [bank,r]of p.coolers.entries()){
 const side=bank===1,length=side?r.h:r.w,doors=Math.floor(length/13),step=length/doors;
 const put=(m,w,h,d,u,y,depth)=>side?box(m,d,h,w,r.x+r.w-depth,y,r.y+u):box(m,w,h,d,r.x+u,y,r.y+depth);
 put(dark,length,33,.8,length/2,18,.5);for(const u of [.5,length-.5])put(dark,1,33,11,u,18,5.5);put(black,length+1,6,11,length/2,38,5.5);
 for(let door=0;door<doors;door++){const u=(door+.5)*step;put(white,step-1,29,.5,u,18,.7);
 for(let row=0;row<5;row++){put(steel,step-1,.35,8,u,4+row*5.5,6);for(let j=0;j<4;j++){
  const a=u-step/2+2+j*(step-3)/4;put(packs,2,3.8,2,a,6.3+row*5.5,8);const last=batches.get(packs).at(-1);last.color=colors[(door+row+j)%colors.length];products++;}}
 put(glass,step-1,29,.2,u,18,11.1);for(const edge of [-1,1]){put(steel,.45,30,.7,u+edge*step/2,18,11.4);put(glow,.18,28,.3,u+edge*(step/2-1),18,10.8);}put(steel,.5,9,1.1,u+step*.32,18,12);
 }
 }
 // One canvas atlas for legible menu boards and refrigerator category headers.
 if(typeof document!=='undefined'){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const ctx=canvas.getContext('2d');
 ctx.fillStyle='#112534';ctx.fillRect(0,0,1024,512);ctx.textAlign='center';ctx.fillStyle='#f8d27e';ctx.font='bold 38px sans-serif';ctx.fillText('GAS & GO  •  BAYOU KITCHEN',512,51);
 const menus=[['HOT FOOD','PO BOY  $8','FRIED CHICKEN  $7','BOUDIN BITES  $5'],['FRESH DAILY','BREAKFAST  $6','HOT COFFEE  $2','COLD DRINKS  $3'],['QUICK STOP','SNACKS • ICE','FUEL • REPAIRS','CHECKOUT  /  U']];
 menus.forEach((lines,i)=>{const x=170+i*342;ctx.fillStyle='#23597d';ctx.fillRect(i*342+9,77,324,45);ctx.fillStyle='#ffffff';ctx.font='bold 26px sans-serif';ctx.fillText(lines[0],x,109);ctx.font='22px sans-serif';lines.slice(1).forEach((l,j)=>{ctx.fillStyle=j%2?'#e5c878':'#ecf1ee';ctx.fillText(l,x,164+j*44);});});
 ctx.fillStyle='#203c56';ctx.fillRect(0,320,1024,192);ctx.fillStyle='#c5ad5a';ctx.fillRect(0,320,1024,7);ctx.fillStyle='#b5c95e';ctx.fillRect(0,331,1024,5);ctx.fillStyle='#ffffff';ctx.font='bold 59px sans-serif';ctx.fillText('WATER     •     SODA     •     BEER',512,435);
 const atlas=new T.CanvasTexture(canvas);atlas.encoding=T.sRGBEncoding;textures.push(atlas);
 function sign(w,h,x,y,z,side,header){const geo=new T.PlaneGeometry(w,h),uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,header?uv.getY(i)*.375:uv.getY(i)*.60+.40);const mesh=new T.Mesh(geo,new T.MeshBasicMaterial({map:atlas}));mesh.position.set(x,base+y,z);mesh.rotation.y=side?-Math.PI/2:0;root.add(mesh);}
 sign(s.w,15,s.x+s.w/2,41,b.y+4,false,false);
 const r=p.coolers[0];sign(r.w,6,r.x+r.w/2,38,r.y+11.1,false,true);
 const r2=p.coolers[1];sign(r2.h,6,r2.x-.1,38,r2.y+r2.h/2,true,true);
 }
 const unit=new T.BoxGeometry(1,1,1),o=new T.Object3D(),color=new T.Color();
 for(const [m,items]of batches){const mesh=new T.InstancedMesh(unit,m,items.length);mesh.userData.noBatch=true;items.forEach((a,i)=>{o.position.set(a.x,a.y,a.z);o.scale.set(a.w,a.h,a.d);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);if(a.color)mesh.setColorAt(i,color.set(a.color));});root.add(mesh);}
 root.userData.gasStation={products,drawBatches:root.children.length};return {root,plan:p,solids:p.solids};
}
const api={plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29GasStation=api;
})();
