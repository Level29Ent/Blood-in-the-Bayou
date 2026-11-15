'use strict';
(function(){
function matches(v){return v?.depth==='bait'&&!v.storyRole;}
function plan(b){const depth=12,solids=[{kind:'tackle wall',x:b.x+4,y:b.y+17,w:depth,h:b.h-27},{kind:'glass counter',x:b.x+b.w-22,y:b.y+b.h*.43,w:18,h:b.h*.39},{kind:'seafood ice case',x:b.x+b.w-25,y:b.y+17,w:21,h:b.h*.24},{kind:'rod rack',x:b.x+25,y:b.y+b.h*.58,w:13,h:b.h*.27},{kind:'bait buckets',x:b.x+21,y:b.y+b.h-18,w:18,h:11}];return {solids,entry:{x:b.x+b.w/2,y:b.y+b.h},service:{x:b.x+b.w/2,y:b.y+b.h*.35}};}
function build(T,b,{base=0,sign}={}){
 const root=new T.Group();root.name='Bayou Seafood & Bait · tackle and ice counter';root.userData.noBatch=true;const p=plan(b),groups=new Map(),dummy=new T.Object3D(),color=new T.Color(),cube=new T.BoxGeometry(1,1,1),ball=new T.SphereGeometry(1,10,6),cyl=new T.CylinderGeometry(1,1,1,12),ring=new T.TorusGeometry(1,.18,6,14),tail=new T.ConeGeometry(1,1,3),shrimp=new T.TorusGeometry(1,.28,5,10,Math.PI*1.5);
 const mat=(c,e={})=>{const m=new T.MeshStandardMaterial({color:c,roughness:.75,...e});m.color.convertSRGBToLinear();return m;},wood=mat('#795d3e'),panel=mat('#b9ac88'),metal=mat('#97a6a6',{metalness:.6,roughness:.35}),dark=mat('#273b3c'),white=mat('#dce4db'),tint=mat('#ffffff'),ice=mat('#c5dce0',{roughness:.3}),green=mat('#438444'),pink=mat('#dfa084'),glass=mat('#88b4ba',{transparent:true,opacity:.15,depthWrite:false,roughness:.15}),glow=new T.MeshBasicMaterial({color:'#fff3cc'});glow.color.convertSRGBToLinear();const colors=['#dccf22','#e35427','#56a96c','#d677bd','#94bfd5','#bdc6b8'];let packs=0,rods=0,fish=0,fillets=0,prawns=0;
 function I(geo,m,x,y,z,sx,sy,sz,c,rx=0,ry=0,rz=0){if(!groups.has(m))groups.set(m,new Map());const bucket=groups.get(m);if(!bucket.has(geo))bucket.set(geo,[]);bucket.get(geo).push({x,y:base+y,z,sx,sy,sz,c,rx,ry,rz});}
 const B=(m,x,y,z,w,h,d,c)=>I(cube,m,x,y,z,w,h,d,c),C=(m,x,y,z,r,h,c)=>I(cyl,m,x,y,z,r,h,r,c),S=(m,x,y,z,sx,sy,sz,c)=>I(ball,m,x,y,z,sx,sy,sz,c),mid=b.x+b.w/2;
 // Warm plank ceiling, speckled gray floor, pegboard panels and task-strip fixtures.
 B(wood,mid,49,b.y+b.h/2,b.w-7,1,b.h-7);for(let x=b.x+8;x<b.x+b.w-5;x+=8)B(dark,x,48.4,b.y+b.h/2,.15,.08,b.h-8);
 B(panel,mid,.9,b.y+b.h/2,b.w-7,.15,b.h-7);for(let i=0;i<110;i++)B(dark,b.x+6+(i*17%(b.w-12)),1,b.y+6+(i*23%(b.h-12)),.25,.03,.3);
 for(const z of[b.y+30,b.y+b.h*.70]){B(metal,mid,46.5,z,37,.7,5);B(glow,mid,46,z,34,.3,3);}
 const left=b.x+4.4,back=b.y+4.5;
 B(panel,left,24,b.y+b.h/2,.6,39,b.h-9);B(panel,mid,24,back,b.w-9,39,.6);B(wood,left,3,b.y+b.h/2,2,5,b.h-9);B(wood,mid,3,back,b.w-9,5,2);
 for(let z=b.y+10;z<b.y+b.h-6;z+=4)for(let y=8;y<43;y+=4)B(dark,left+.36,y,z,.12,.24,.24);
 for(let x=b.x+9;x<b.x+b.w-6;x+=4)for(let y=8;y<43;y+=4)B(dark,x,y,back+.36,.24,.24,.12);
 // Individually shaped carded lures, swivels and floats on metal peg hooks.
 function pack(x,y,z,i,side){// Coordinates stay unrotated by mapping box axes at emit time.
 const box=(m,xx,yy,zz,w,h,d,c)=>side?B(m,x+zz,y+yy,z+xx,d,h,w,c):B(m,x+xx,y+yy,z+zz,w,h,d,c);
 box(tint,0,0,0,3,4.6,.28,colors[i%6]);box(white,0,1.65,.21,3,1.25,.16);box(dark,0,1.7,.32,1.8,.13,.05);box(dark,0,.1,.24,2.55,2.7,.1);box(metal,0,2.5,-.5,.18,.18,1.3);
 if(side){S(tint,x+.5,y-.2,z,.35,1.2,.55,colors[(i+2)%6]);I(ring,metal,x+.6,y-1.3,z,.35,.35,.35,null,0,Math.PI/2);}else{S(tint,x,y-.2,z+.5,.55,1.2,.35,colors[(i+2)%6]);I(ring,metal,x,y-1.3,z+.6,.35,.35,.35);}
 packs++;}
 let index=0;for(let row=0;row<6;row++)for(let z=b.y+10;z<b.y+b.h-8;z+=4.3)pack(left+.7,10+row*5.5,z,index++,true);
 for(let row=0;row<6;row++)for(let x=b.x+10;x<b.x+b.w-8;x+=4.3)pack(x,10+row*5.5,back+.7,index++,false);
 const rack=p.solids.find(s=>s.kind==='rod rack'),rx=rack.x+rack.w/2;B(wood,rx,2,rack.y+rack.h/2,rack.w,2,rack.h);B(wood,rx,10,rack.y+rack.h/2,rack.w,.8,rack.h);for(let i=0;i<12;i++){const z=rack.y+2+i*(rack.h-4)/11,x=rx+(i%2?3:-3);C(dark,x,23,z,.17,39);C(wood,x,5,z,.6,6);S(dark,x+1.1,8,z,.9,1,.7);I(ring,metal,x+1.5,8,z,.8,.8,.7,null,0,Math.PI/2);for(const y of[14,23,33,40])I(ring,metal,x+.3,y,z,.3,.4,.3,null,0,Math.PI/2);rods++;}
 // Suspended rods and reels fill the overhead rack but never add walking blockers.
 for(let i=0;i<5;i++){const z=b.y+18+i*17;B(metal,b.x+29,44,z,44,.4,.4);B(wood,b.x+12,44,z,9,.8,.8);I(ring,metal,b.x+18,42.8,z,1.4,1.4,1.4);C(dark,b.x+29,47,z,.12,4);rods++;}
 const counter=p.solids.find(s=>s.kind==='glass counter'),x=counter.x+counter.w/2,z=counter.y+counter.h/2;B(wood,x,5,z,counter.w,8,counter.h);B(dark,x,9,z,counter.w,1,counter.h);B(white,x,14,z,counter.w-2,.6,counter.h-2);B(metal,x,21,z,counter.w,.7,counter.h);for(const xx of[counter.x,counter.x+counter.w]){B(glass,xx,15,z,.25,11,counter.h);for(const zz of[counter.y,counter.y+counter.h])B(metal,xx,15,zz,.6,12,.6);}B(glass,x,21.4,z,counter.w,.25,counter.h);
 for(let i=0;i<18;i++){const zz=counter.y+3+(i%6)*(counter.h-6)/6,xx=x+(i<6?-5:i<12?0:5);C(metal,xx,10.6,zz,.9,1.6);I(ring,dark,xx,12,zz,1,1,1,null,Math.PI/2);}
 B(dark,x,24,counter.y+6,8,4,7);B(metal,x,26.2,counter.y+6,7,.3,6);B(dark,x,29,counter.y+5,6,3,1);B(glow,x,29,counter.y+5.6,4,1,.1);
 const buckets=p.solids.find(s=>s.kind==='bait buckets');for(let i=0;i<3;i++){const xx=buckets.x+3+i*6,zz=buckets.y+buckets.h/2;C(tint,xx,4,zz,2.7,6,i%2?'#e8cf23':'#c7dbd6');C(white,xx,7.2,zz,2.9,.5);B(dark,xx,4,zz+2.6,3,2,.15);I(ring,metal,xx,6,zz,2.8,2.8,2.8);}
 // White market tray with green trim, crushed ice, whole fish, salmon cuts and shrimp.
 const r=p.solids.find(s=>s.kind==='seafood ice case'),fx=r.x+r.w/2,fz=r.y+r.h/2;B(wood,fx,5,fz,r.w-1,8,r.h-1);B(white,fx,10,fz,r.w,2,r.h);B(ice,fx,11.2,fz,r.w-2,1,r.h-2);
 for(const xx of[r.x+.5,r.x+r.w-.5])B(white,xx,12,fz,1,4,r.h);for(let k=0;k<3;k++){const zz=r.y+(k+.5)*r.h/3;B(green,fx,12,zz-r.h/6+.7,r.w-2,1.5,.8);for(let j=0;j<35;j++){const xx=r.x+2+(j%5)*(r.w-4)/5,iz=zz-r.h/6+1+Math.floor(j/5)*(r.h/3-2)/7;I(cube,ice,xx,12,iz,.65,.6,.75,null,.2*j,.4*j,.3);}
 if(k===0){for(let i=0;i<3;i++){const xx=fx-5+i*4;S(tint,xx,13,zz,1.1,.6,3.1,['#7a9095','#bdc8bc','#636f7c'][i]);I(tail,metal,xx,13,zz+3.2,1.3,1.5,.25,null,Math.PI/2);for(const s of[-1,1])S(dark,xx+s*.8,13.3,zz-2,.15,.15,.15);fish++;}}
 else if(k===1){for(let i=0;i<3;i++){const xx=fx-5+i*4;S(pink,xx,13,zz,1.4,.45,2.8);for(let j=0;j<5;j++)B(white,xx,13.4,zz-1.8+j*.75,2,.05,.1);fillets++;}}
 else{for(let i=0;i<20;i++){I(shrimp,pink,fx-7+(i%5)*3,12.9+(i%2)*.3,zz-2+Math.floor(i/5)*1.3,.55,.55,.55,null,Math.PI/2,i*.4);prawns++;}}
 S(tint,r.x+2,13,zz,1,.7,.8,'#decf21');B(metal,r.x+r.w-1.5,15.5,zz,.3,5,.3);B(white,r.x+r.w-1.5,18,zz,3.7,2.3,.2);for(let j=0;j<2;j++)B(dark,r.x+r.w-1.5,17.7+j*.6,zz+.15,2.6,.13,.1);}
 if(sign){sign(root,'BAYOU SEAFOOD & BAIT',Math.min(125,b.w-10),5,mid,44,back+1.2,'#e1ca8c');sign(root,'FRESH CATCH / TACKLE / LIVE BAIT',Math.min(105,b.w-10),3,mid,39.8,back+1.3,'#b7d3c2');}
 for(const[m,geos]of groups)for(const[geo,items]of geos){const mesh=new T.InstancedMesh(geo,m,items.length);mesh.userData.noBatch=true;mesh.name='Seafood & Bait · shared stock';items.forEach((a,i)=>{dummy.position.set(a.x,a.y,a.z);dummy.scale.set(a.sx,a.sy,a.sz);dummy.rotation.set(a.rx,a.ry,a.rz);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);if(a.c)mesh.setColorAt(i,color.set(a.c).convertSRGBToLinear());});mesh.frustumCulled=false;root.add(mesh);}
 root.userData.seafoodBait={packs,rods,fish,fillets,shrimp:prawns};return {root,solids:p.solids,plan:p};
}
const api={matches,plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29SeafoodBait=api;
})();
