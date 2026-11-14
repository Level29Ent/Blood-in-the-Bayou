'use strict';
(function(){
function residential(id){return /^apartment\d+$/.test(id)||id==='harbor-condo';}
function plan(b){return {solids:[{x:b.x+3,y:b.y+6,w:Math.min(12,b.w*.2),h:b.h*.3,kind:'modern-sofa'},{x:b.x+b.w-Math.min(10,b.w*.18)-3,y:b.y+6,w:Math.min(10,b.w*.18),h:b.h*.32,kind:'modern-kitchen'},{x:b.x+3,y:b.y+b.h*.68,w:b.w*.28,h:b.h*.22,kind:'modern-bed'}]};}
function build(T,b,{base=0,variant=0,height=28,bedroom=true}={}){const root=new T.Group();root.name='Modern apartment · neutral lounge and marble kitchen';root.position.set(b.x,base,b.y);root.userData.noBatch=true;const batches=new Map(),tmp=new T.Object3D(),cube=new T.BoxGeometry(1,1,1),sphere=new T.SphereGeometry(1,12,8),cyl=new T.CylinderGeometry(1,1,1,16),torus=new T.TorusGeometry(1,.1,5,24);const mat=(c,e={})=>new T.MeshStandardMaterial({color:c,roughness:.8,...e}),cream=mat('#d9d2bf'),sofa=mat(variant%2?'#515757':'#b6b1a1'),dark=mat('#303a3a'),oak=mat('#b18d61'),gold=mat('#ad985d',{metalness:.5,roughness:.4}),white=mat('#e8e3d8'),orange=mat('#b47b53'),leaf=mat('#476d50'),glass=mat('#d6dcda',{transparent:true,opacity:.15,depthWrite:false,roughness:.2}),glow=new T.MeshBasicMaterial({color:'#fff0cd'}),marble=mat('#d8d6cb',{roughness:.38});
 function emit(g,m,x,y,z,sx,sy,sz,rot=[0,0,0]){tmp.position.set(x,y,z);tmp.rotation.set(...rot);tmp.scale.set(sx,sy,sz);tmp.updateMatrix();if(!batches.has(g))batches.set(g,new Map());const by=batches.get(g);if(!by.has(m))by.set(m,[]);by.get(m).push(tmp.matrix.clone());}
 const box=(m,w,h,d,x,y,z)=>emit(cube,m,x,y,z,w,h,d),ball=(m,x,y,z,xr,yr,zr)=>emit(sphere,m,x,y,z,xr,yr,zr),w=b.w,h=b.h,p=plan(b),sh=Math.min(9,height*.3);
 // Pale oak floor, restrained geometric rug and neutral seating; all furniture stays off the main center route.
 box(oak,w-2,.12,h-2,w/2,.15,h/2);for(let x=3;x<w-1;x+=5)box(cream,.08,.02,h-2,x,.23,h/2);
 const a=p.solids[0],sx=a.x-b.x+a.w/2,sz=a.y-b.y+a.h/2;box(dark,a.w,a.h*.005,a.h,sx,.28,sz);for(let i=0;i<3;i++){const z=a.y-b.y+(i+.5)*a.h/3;ball(sofa,sx,3,z,a.w*.48,2,a.h/6);ball(sofa,4,5,z,1.6,3,a.h/6);ball(white,sx,4.3,z,a.w*.4,1,a.h*.13);ball(i%2?orange:dark,6,6,z,1,2,1.7);}box(cream,a.w+6,.08,a.h+5,sx+2,.35,sz);box(dark,1,.09,a.h+5,sx+5,.42,sz);box(orange,3,.1,4,sx+3,.44,sz+a.h*.25);
 // Small round marble table is nested within sofa footprint rather than blocking the shared aisle.
 emit(cyl,marble,sx+a.w*.2,5,sz+1,Math.min(3,a.w*.23),.7,Math.min(3,a.w*.23));box(dark,.5,4,.5,sx+a.w*.2,2.6,sz+1);box(white,2,.2,2,sx+a.w*.2,5.5,sz+1);
 const k=p.solids[1],kx=k.x-b.x+k.w/2,kz=k.y-b.y+k.h/2;box(cream,k.w,sh,k.h,kx,sh/2+.4,kz);box(marble,k.w+.5,.7,k.h+.5,kx,sh+.8,kz);for(let i=0;i<7;i++)emit(cube,cream,kx,sh+1.17,k.y-b.y+2+i*k.h/8,k.w*.8,.025,.08,[0,.3,0]);for(let z=k.y-b.y+2;z<k.y-b.y+k.h;z+=5){box(dark,.1,.3,2,k.x-b.x-.1,sh*.6,z);box(white,k.w*.75,height*.18,4,kx,height*.71,z);}box(dark,k.w*.65,.15,5,kx,sh+1.3,kz);emit(torus,gold,kx,sh+3,kz,1.5,1.5,1.5,[0,Math.PI/2,0]);box(white,k.w*.65,1,4,kx,sh+1.3,kz+6);
 // Original abstract wall art and slim fireplace panel, not a live mirror or flame simulation.
 box(marble,.7,height*.57,h*.17,1.1,height*.48,h*.45);box(dark,.15,3,h*.11,1.6,4,h*.45);for(let i=0;i<3;i++)ball(glow,1.8,4,h*.42+i*2,.1,1.1,.5);
 for(const x of [w*.25,w*.75]){box(dark,w*.17,height*.19,.3,x,height*.7,1.3);box(white,w*.15,height*.17,.4,x,height*.7,1.5);ball(dark,x,height*.71,1.8,w*.04,height*.04,.05);}
 // Slat screen stays in rear side corner; curtain folds and glazing suggest broad apartment windows.
 for(let x=3;x<w*.3;x+=2)box(oak,.5,height*.78,.6,x,height*.45,h-3);for(const side of [-1,1]){const x=side<0?1.6:w-1.6;for(let z=h*.4;z<h*.62;z+=2)emit(cyl,cream,x,height*.5,z,.45,height*.85,.45);box(glass,.2,height*.7,h*.22,x,height*.5,h*.51);}
 if(bedroom){const r=p.solids[2],x=r.x-b.x+r.w/2,z=r.y-b.y+r.h/2;box(sofa,r.w,2.5,r.h,x,1.8,z);box(white,r.w-.4,1,r.h-.4,x,3.5,z);box(orange,r.w*.95,.2,r.h*.2,x,4.1,z+2);box(white,r.w*.75,1.2,3,x,4.5,z-r.h*.25);}
 // Plants, warm cove strips and a ring pendant: no new actual lighting or reflection passes.
 for(const [x,z]of [[w-4,h-5],[4,h*.58]]){emit(cyl,cream,x,1.7,z,1.4,3,1.4);box(oak,.25,6,.25,x,5,z);for(let i=0;i<5;i++)ball(leaf,x+Math.sin(i*2)*1.2,7+i*.6,z+Math.cos(i*2),1.3,.35,1.8);}
 for(const x of [2,w-2])box(glow,.3,.15,h-5,x,height-1.5,h/2);emit(torus,gold,w*.6,height-4,h*.35,Math.min(5,w*.13),Math.min(5,w*.13),Math.min(5,w*.13),[Math.PI/2,0,0]);emit(torus,glow,w*.6,height-4.2,h*.35,Math.min(4.7,w*.12),Math.min(4.7,w*.12),Math.min(4.7,w*.12),[Math.PI/2,0,0]);box(gold,.2,3,.2,w*.6,height-2.2,h*.35);
 for(const [g,groups]of batches)for(const [m,items]of groups){const mesh=new T.InstancedMesh(g,m,items.length);mesh.userData.noBatch=true;items.forEach((a,i)=>mesh.setMatrixAt(i,a));root.add(mesh);}root.userData.modernApartment={sofas:1,kitchens:1,beds:bedroom?1:0,pendants:1};return {root,solids:bedroom?p.solids:p.solids.slice(0,2),plan:p};
}
const api={residential,plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29ModernApartment=api;
})();
