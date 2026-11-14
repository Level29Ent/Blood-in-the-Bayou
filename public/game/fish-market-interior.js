'use strict';
(function(){
function matches(v){return v?.kind==='fish'&&v.storyRole!=='jojo';}
function plan(b){const depth=Math.min(16,b.w*.15),run=Math.max(22,b.h-40),cases=[{x:b.x+5,y:b.y+28,w:depth,h:run},{x:b.x+b.w-5-depth,y:b.y+28,w:depth,h:run}],prep={x:b.x+5,y:b.y+4,w:b.w-10,h:Math.min(10,Math.max(4,b.h*.35-15))};return {cases,prep,solids:[...cases,prep]};}
function build(T,b,base=0,sign){
 const root=new T.Group();root.name='Gulf Fresh · iced seafood market';const p=plan(b),buckets=new Map(),tmp=new T.Object3D(),color=new T.Color();let fish=0,fillets=0,shellfish=0;
 const mat=(c,e={})=>new T.MeshStandardMaterial({color:c,roughness:.6,...e}),steel=mat('#a6b4b7',{metalness:.5,roughness:.3}),dark=mat('#26343c'),blue=mat('#23516b'),white=mat('#e0e9e6'),ice=mat('#d0e3e7',{roughness:.28}),green=mat('#3f7d4d'),body=mat('#ffffff',{metalness:.25,roughness:.4}),pink=mat('#ed9d83'),eye=mat('#111c21'),glass=mat('#b3dce1',{transparent:true,opacity:.11,depthWrite:false,roughness:.15}),glow=new T.MeshBasicMaterial({color:'#eefaff'});
 const cube=new T.BoxGeometry(1,1,1),ball=new T.SphereGeometry(1,10,6),tail=new T.ConeGeometry(1,1,3),shell=new T.SphereGeometry(1,8,5),shrimp=new T.TorusGeometry(.6,.19,5,10,Math.PI*1.5),disc=new T.CylinderGeometry(1,1,1,10);
 function inst(g,m,x,y,z,sx=1,sy=1,sz=1,tint,rot){if(!buckets.has(g))buckets.set(g,new Map());const by=buckets.get(g);if(!by.has(m))by.set(m,[]);tmp.position.set(x,base+y,z);tmp.scale.set(sx,sy,sz);tmp.rotation.set(...(rot||[0,0,0]));tmp.updateMatrix();by.get(m).push({matrix:tmp.matrix.clone(),tint});}
 const box=(m,w,h,d,x,y,z,tint)=>inst(cube,m,x,y,z,w,h,d,tint);
 function whole(x,y,z,i,scale=1){const c=['#738e93','#b7c9c6','#b6664f','#4c7278'][i%4];inst(ball,body,x,y,z,1.1*scale,.55*scale,3.3*scale,c);inst(ball,white,x,y+.18,z,scale*.8,.36*scale,2.65*scale);inst(tail,body,x,y,z+3.5*scale,1.4*scale,1.5*scale,.23*scale,c,[Math.PI/2,0,0]);inst(tail,blue,x,y+.6*scale,z,.2*scale,.8*scale,1.3*scale,null,[0,0,0]);for(const side of [-1,1])inst(ball,eye,x+side*.65*scale,y+.38*scale,z-2.1*scale,.13*scale,.13*scale,.13*scale);box(blue,.14*scale,.12*scale,3.7*scale,x,y+.53*scale,z);fish++;}
 function fillet(x,y,z,i){inst(ball,pink,x,y,z,1.25,.35,2.7,i%2?'#f0b6a6':'#dc896a');for(let n=0;n<6;n++)box(white,2,.04,.09,x,y+.32,z-1.8+n*.6);fillets++;}
 // Blue tile and white grout, clinical prep surfaces and overhead task strips.
 box(white,b.w-6,.2,b.h-6,b.x+b.w/2,1,b.y+b.h/2);for(let x=b.x+6;x<b.x+b.w-4;x+=10)box(steel,.12,.04,b.h-6,x,1.12,b.y+b.h/2);for(let z=b.y+6;z<b.y+b.h-4;z+=10)box(steel,b.w-6,.04,.12,b.x+b.w/2,1.12,z);
 box(blue,b.w-7,28,.4,b.x+b.w/2,24,b.y+3.4);for(let y=12;y<39;y+=6)box(white,b.w-7,.18,.2,b.x+b.w/2,y,b.y+3.7);for(let x=b.x+8;x<b.x+b.w-4;x+=10)box(white,.18,28,.2,x,24,b.y+3.7);
 const pr=p.prep;box(steel,pr.w,10,pr.h,pr.x+pr.w/2,6,pr.y+pr.h/2);box(white,pr.w+1,.8,pr.h+1,pr.x+pr.w/2,11.5,pr.y+pr.h/2);
 // Scales, sink and preparation boards along the back; still behind the service marker.
 const mid=b.x+b.w/2;box(dark,8,2,6,mid,13,b.y+10);box(steel,10,.5,7,mid,14.2,b.y+10);box(steel,.6,8,.6,mid,18,b.y+7);box(dark,10,4,1,mid,22,b.y+7);box(glow,7,2,.15,mid,22,b.y+7.6);
 box(dark,12,.5,7,b.x+b.w*.78,12,b.y+10);box(steel,10,.6,5,b.x+b.w*.78,12.4,b.y+10);box(white,12,.4,7,b.x+b.w*.22,12.4,b.y+10);
 for(const [k,r]of p.cases.entries()){
  const x=r.x+r.w/2,z=r.y+r.h/2,trays=Math.max(3,Math.floor(r.h/13)),step=r.h/trays;
  box(dark,r.w,7,r.h,x,4.5,z);box(steel,r.w+1,1,r.h+1,x,8.5,z);box(ice,r.w-1,2,r.h-1,x,10,z);
  for(const side of [-1,1])box(steel,.7,4,r.h,x+side*r.w/2,10,z);
  for(let t=0;t<trays;t++){
   const zz=r.y+(t+.5)*step;box(steel,r.w-1,.4,.6,x,11,zz-step/2+.3);
   // Deterministic crushed-ice chips and parsley edging, shared across all counters.
   for(let i=0;i<12;i++){const xx=r.x+1.5+(i%3)*(r.w-3)/3,zp=zz-step*.38+Math.floor(i/3)*step*.2;inst(ball,ice,xx,11.1,zp,.6,.4,.65);}
   for(const side of [-1,1])for(let n=0;n<4;n++)inst(ball,green,x+side*(r.w/2-1.3),11.6,zz-step*.34+n*step*.22,.7,.5,.9);
   const type=(t+k)%4;
   if(type===0)for(let i=0;i<3;i++)whole(x+(i-1)*3,12,zz,i+k*2,.72);
   else if(type===1)for(let i=0;i<3;i++)fillet(x+(i-1)*3,11.9,zz,i);
   else for(let i=0;i<22;i++){const xx=x-4+(i%5)*1.8,zp=zz-step*.3+Math.floor(i/5)*step*.12;const yy=11.5+(i%3)*.25;if(type===2)inst(shrimp,pink,xx,yy,zp,1,1,1,'#bf927c',[Math.PI/2,.2*i,0]);else inst(shell,body,xx,yy,zp,.8,.4,1.1,['#363e3c','#9e9783','#c2b9a1'][i%3]);shellfish++;}
   // Customer-facing small category/price cards with physical stands.
   const face=k===0?1:-1;box(steel,.3,2,.3,x+face*(r.w/2-1),13.5,zz);box(white,.25,3.2,5,x+face*(r.w/2-1),16,zz);for(let n=0;n<3;n++)box(blue,.3,.18,3,x+face*(r.w/2-.8),15.2+n*.65,zz);
  }
  // Glass sneeze screen only on the outer wall edge keeps seafood readable in the aisle.
  const outer=k===0?r.x:r.x+r.w;box(glass,.25,14,r.h,outer,19,z);for(const zz of [r.y,r.y+r.h])box(steel,.7,16,.7,outer,18,zz);box(steel,.7,.7,r.h,outer,26,z);
  // Blue insulated crates at the near end, within the same counter collider.
  box(blue,r.w-2,5,9,x,4,r.y+r.h-5);for(let j=0;j<4;j++)box(steel,r.w-3,.2,.2,x,3+j,r.y+r.h-.3);
 }
 // Rear display of pantry stock, clean plates and stainless tool rail.
 for(const side of [-1,1]){const x=mid+side*b.w*.3;box(steel,b.w*.25,1,5,x,29,b.y+7);for(let i=0;i<6;i++)inst(disc,white,x-8+i*3,31,b.y+7,1.1,2,1.1);}
 for(const x of [b.x+b.w*.3,b.x+b.w*.7])for(const z of [b.y+37,b.y+b.h-18]){box(steel,20,.6,6,x,46,z);box(glow,18,.3,4,x,45.5,z);}
 if(sign){sign(root,'GULF FRESH · SEAFOOD MARKET',Math.min(b.w-12,140),6,mid,41,b.y+4.5,'#e1d092');sign(root,'WHOLE FISH · FILLETS · SHRIMP · SHELLFISH',Math.min(b.w-12,135),3.3,mid,35,b.y+4.7,'#b9e2e4');}
 for(const [g,groups]of buckets)for(const [m,items]of groups){const mesh=new T.InstancedMesh(g,m,items.length);mesh.userData.noBatch=true;items.forEach((a,i)=>{mesh.setMatrixAt(i,a.matrix);if(a.tint)mesh.setColorAt(i,color.set(a.tint));});root.add(mesh);}
 root.userData.fishMarket={fish,fillets,shellfish,drawBatches:root.children.length};return {root,plan:p,solids:p.solids};
}
const api={matches,plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29FishMarket=api;
})();
