'use strict';
(function(){
// Compact production shop: the rotated street-frontage parcel is only 64 × 96.
function plan(b){const left={x:b.x+4,y:b.y+23,w:10,h:b.h-48,kind:'counter'},back={x:b.x+4,y:b.y+4,w:b.w-8,h:6,kind:'wall-stock'},right={x:b.x+b.w-9,y:b.y+14,w:5,h:32,kind:'glassware'},island={x:b.x+b.w-16,y:b.y+b.h-40,w:11,h:20,kind:'hookah-island'};return {left,back,right,island,solids:[left,back,right,island],entry:{x:b.x+b.w/2,y:b.y+b.h},service:{x:b.x+b.w/2,y:b.y+b.h*.65}};}
function build(T,b,options={}){const p=plan(b),root=new T.Group();root.name='Crown Smoke Shop · glass / hookah gallery';const batches=new Map(),textures=[];
 const map=kind=>{const n=128,a=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const noise=((x*17+y*29+x*y)%17)-8;let v=240+noise*.6;if(kind==='tile'&&(x<1||y<1))v=172;if(kind==='wood')v=224+noise+Math.sin(x*.4+Math.sin(y*.08))*12;if(kind==='label'){v=225+noise;if(y>25&&y<62&&x>16&&x<112)v=255;if(y>96&&y<118)v=246;if(y>100&&y<114&&x>38&&x<96)v=65;}a.set([v,v,v,255],(y*n+x)*4);}const t=new T.DataTexture(a,n,n);t.encoding=T.sRGBEncoding;t.wrapS=t.wrapT=T.RepeatWrapping;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.needsUpdate=true;textures.push(t);return t;};
 const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.68,...extra});
 const black=mat('#14171b'),purple=mat('#542669'),cream=mat('#eeeadd'),wood=mat('#c3ab83',{map:map('wood')}),floor=mat('#d4d3c9',{map:map('tile'),roughness:.33}),metal=mat('#a3b3b5',{metalness:.75,roughness:.26}),darkmetal=mat('#323a3d',{metalness:.5}),product=mat('#ffffff',{map:map('label')}),coloredGlass=mat('#ffffff',{metalness:.18,roughness:.18}),pane=mat('#c9ecf2',{transparent:true,opacity:.12,depthWrite:false,roughness:.12}),glow=new T.MeshBasicMaterial({color:'#e7f5ed'}),led=new T.MeshBasicMaterial({color:'#66e7c8'});floor.map.repeat.set(6,9);
 const cube=new T.BoxGeometry(),sphere=new T.SphereGeometry(1,10,8),cylinder=new T.CylinderGeometry(1,1,1,10),torus=new T.TorusGeometry(1,.16,5,14),dummy=new T.Object3D(),color=new T.Color();
 const add=(geo,m,w,h,d,x,y,z,tint=null,rx=0,ry=0,rz=0)=>{if(!batches.has(m))batches.set(m,new Map());const by=batches.get(m);if(!by.has(geo))by.set(geo,[]);by.get(geo).push({w,h,d,x:b.x+x,y:y+(options.base||0),z:b.y+z,tint,rx,ry,rz});};
 const box=(m,w,h,d,x,y,z,tint=null)=>add(cube,m,w,h,d,x,y,z,tint);
 const cyl=(m,r,h,x,y,z,tint=null)=>add(cylinder,m,r,h,r,x,y,z,tint);
 const ball=(m,w,h,d,x,y,z,tint=null)=>add(sphere,m,w,h,d,x,y,z,tint);
 let glassware=0,hookahs=0,packages=0;
 const hues=['#2b83b9','#8b4db0','#5b9e54','#cc4569','#d7ad4d','#c9e5e4'];
 function waterpipe(x,y,z,s,tint){cyl(coloredGlass,1.15*s,.6*s,x,y+.3*s,z,tint);ball(coloredGlass,1.2*s,1.65*s,1.2*s,x,y+2*s,z,tint);cyl(coloredGlass,.4*s,4.5*s,x,y+4.6*s,z,tint);cyl(metal,.6*s,.5*s,x,y+7*s,z);cyl(black,.44*s,.35*s,x,y+7.4*s,z);add(cylinder,coloredGlass,.35*s,2.5*s,.35*s,x+.8*s,y+3.6*s,z,tint,0,0,-.65);glassware++;}
 function hookah(x,y,z,s,tint){cyl(black,1.8*s,.6*s,x,y+.3*s,z);ball(coloredGlass,1.45*s,2.3*s,1.45*s,x,y+2.5*s,z,tint);cyl(metal,.3*s,7.5*s,x,y+7*s,z);for(const yy of [4.5,6.2,8.8])ball(metal,.65*s,.6*s,.65*s,x,y+yy*s,z);cyl(metal,1.5*s,.25*s,x,y+10.9*s,z);cyl(coloredGlass,.65*s,1.2*s,x,y+11.7*s,z,tint);
 // Shared torus loops suggest flexible hoses; the mouthpiece is angled out of the display base.
 add(torus,coloredGlass,2.7*s,3.9*s,2.7*s,x+1.7*s,y+5.6*s,z,tint,0,.35,-.2);add(cylinder,metal,.18*s,3.2*s,.18*s,x+3*s,y+9.5*s,z,null,0,0,-.35);hookahs++;}
 function packs(x,y,z,n,alongX=true,scale=1){for(let i=0;i<n;i++){const a=alongX?i*2.6*scale:0,c=alongX?0:i*2.6*scale;box(product,1.9*scale,2.8*scale,1.5*scale,x+a,y+1.4*scale,z+c,hues[(i+Math.round(y))%hues.length]);packages++;}}
 // Existing doorway width and street orientation are passed by the production venue builder.
 const door=Math.min(options.doorWidth||38.4,b.w-12),cx=b.w/2;
 box(floor,b.w-3,1,b.h-3,cx,.5,b.h/2);box(black,b.w,48,2,cx,24,0);for(const x of [0,b.w])box(purple,2,48,b.h,x,24,b.h/2);
 for(const side of [-1,1]){const span=(b.w-door)/2;box(cream,span,48,2,cx+side*(door/2+span/2),24,b.h);box(metal,.8,37,1,cx+side*door/2,19,b.h-.8);}box(black,door,8,2,cx,44,b.h);
 box(black,b.w-2,.4,b.h-2,cx,47.7,b.h/2);
 for(const x of [12,b.w-12])for(const z of [18,b.h/2,b.h-14]){box(darkmetal,6,.7,14,x,46.8,z);box(glow,5,.2,13,x,46.3,z);}
 for(const x of [2,b.w-2])box(led,.4,.4,b.h-5,x,44,b.h/2);box(led,b.w-4,.4,.4,cx,44,2);
 // Blonde slatwall and black adjustable shelves, with small packed goods and glass displays.
 box(wood,b.w-7,31,.6,cx,20,1.7);for(let y=6;y<=35;y+=2.8)box(black,b.w-8,.18,.7,cx,y,2.1);
 for(const y of [7,14,21,28]){box(black,b.w-8,.5,6,cx,y,7);packs(6,y+.4,7,Math.floor((b.w-12)/2.6));}
 for(let i=0;i<6;i++)hookah(7+i*(b.w-14)/5,29,6,.68,hues[i]);
 // Glazed service counter at the left leaves the central service point unobstructed.
 const r=p.left,x=r.x-b.x+5,z=r.y-b.y+r.h/2;
 box(black,10,2,r.h,x,2,z);box(black,10,.7,r.h,x,17,z);for(const yy of [4,8.5,13]){box(metal,9,.35,r.h-1,x,yy,z);box(glow,.15,.2,r.h-2,x+3.6,yy+.4,z);for(let i=0;i<Math.floor((r.h-4)/4);i++){waterpipe(x,yy+.3,z-r.h/2+3+i*4,.38,hues[i%6]);}}
 for(const end of [-1,1]){box(pane,10,14,.18,x,9.5,z+end*r.h/2);for(const xx of [-4.8,4.8])box(metal,.45,15,.45,x+xx,9.5,z+end*r.h/2);}for(const xx of [-4.9,4.9])box(pane,.18,14,r.h,x+xx,9.5,z);box(pane,10,.2,r.h,x,16.4,z);
 box(black,4,.5,3,x,17.8,z+12);box(metal,.4,3,.4,x,19,z+11);box(black,5,3,.5,x,21,z+11);box(led,4.3,2.3,.1,x,21,z+11.3);
 // Right-hand wall glassware shelves and tiered feature island fit the compact room.
 for(const yy of [8,18,28]){box(black,5,.5,32,b.w-6.5,yy,30);for(let i=0;i<7;i++)waterpipe(b.w-6.5,yy+.3,17+i*4,.8,hues[(i+yy)%6]);}
 const f=p.island,fx=f.x-b.x+5.5,fz=f.y-b.y+10;for(const yy of [2,9,16]){box(black,11,1,20,fx,yy,fz);if(yy<16)for(const dx of [-2.6,1])packs(fx+dx,yy+.7,fz-6,5,false,.9);}box(black,11,16,1,fx,9,fz);for(const zz of [-5,5])hookah(fx,16.5,fz+zz,.95,hues[zz<0?1:2]);
 const roof=new T.Mesh(new T.BoxGeometry(b.w+2,1,b.h+2),black);roof.position.set(b.x+cx,(options.base||0)+49,b.y+b.h/2);roof.userData.noBatch=true;root.add(roof);
 for(const [m,by]of batches)for(const [geo,list]of by){const mesh=new T.InstancedMesh(geo,m,list.length);mesh.name=m===coloredGlass?'Crown · colorful glassware and hookahs':'Crown · retail fixtures';list.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.scale.set(v.w,v.h,v.d);dummy.rotation.set(v.rx,v.ry,v.rz);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);if(m===coloredGlass||m===product)mesh.setColorAt(i,color.set(v.tint||'#eee3c7'));});mesh.frustumCulled=false;mesh.userData.noBatch=true;root.add(mesh);}
 if(options.sign){options.sign(root,'CROWN SMOKE SHOP',Math.min(90,b.w+12),7,b.x+cx,55,b.y+b.h+1,'#c6a4dd');options.sign(root,'HOOKAH · TOBACCO · GLASS',b.w-10,3,b.x+cx,40,b.y+2.8,'#e3dcc6');}
 root.userData.smokeShop={glassware,hookahs,packages,textures:textures.length};return {root,roof,solids:p.solids,plan:p};
}
const api={plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29SmokeShop=api;
})();
