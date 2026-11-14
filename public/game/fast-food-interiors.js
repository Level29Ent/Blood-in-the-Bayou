'use strict';
(function(){
function plan(b,theme='mess',dir=1){const mall=theme==='bayou',depth=mall?10:12,mid=b.w/2;
 const local=[{x:8,y:18,w:b.w-16,h:depth,kind:'counter'},{x:5,y:4,w:b.w-10,h:8,kind:'kitchen'}];
 if(mall){for(const x of [5,b.w-19])local.push({x,y:b.h-35,w:14,h:24,kind:'booth-table'});}
 else{for(const x of [5,b.w-25])for(const y of [60,91])local.push({x,y,w:20,h:23,kind:'dining-booth'});local.push({x:6,y:34,w:12,h:17,kind:'drinks'});}
 const flip=r=>dir===-1?{...r,x:b.x+b.w-r.x-r.w,y:b.y+b.h-r.y-r.h}:{...r,x:b.x+r.x,y:b.y+r.y};
 return {solids:local.map(flip),entry:{x:b.x+mid,y:b.y+(dir===1?b.h:0)},service:{x:b.x+mid,y:b.y+(dir===1?(mall?b.h-20:b.h*.35):(mall?20:b.h*.65))},seats:mall?4:8};}
function build(T,b,{theme='mess',base=0,dir=1,sign=null}={}){const mall=theme==='bayou',p=plan(b,theme,dir),root=new T.Group();root.name=mall?'Bayou Burgers · warm urban burger bar':'Mess Stop · red stainless diner';const batches=new Map(),textures=[];
 function texture(kind){const n=128,a=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const noise=((x*13+y*31+x*y)%21)-10;let v=235+noise*.5;if(kind==='wood')v=221+noise+Math.sin(x*.4+Math.sin(y*.07))*13;if(kind==='floor'){v=mall?204+noise:((Math.floor(x/32)+Math.floor(y/32))%2?182:246)+noise*.3;}if(kind==='tile'&&(x%32<2||y%16<1))v=170;if(kind==='metal')v=237+Math.sin(y*2)*7+noise*.2;a.set([v,v,v,255],(y*n+x)*4);}const t=new T.DataTexture(a,n,n);t.wrapS=t.wrapT=T.RepeatWrapping;t.encoding=T.sRGBEncoding;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.needsUpdate=true;textures.push(t);return t;}
 const mat=(c,o={})=>new T.MeshStandardMaterial({color:c,roughness:.75,...o}),steel=mat('#a5b0b1',{map:texture('metal'),metalness:.65,roughness:.32}),wood=mat('#b88e58',{map:texture('wood')}),tile=mat(mall?'#514c43':'#e4d6bd',{map:texture('tile')}),floor=mat(mall?'#827e71':'#e2ded0',{map:texture('floor'),roughness:.45}),black=mat('#202628'),red=mat(mall?'#d9a34c':'#b63232'),cloth=mat(mall?'#426b50':'#b63232',{roughness:.95}),lime=mat('#8dba48'),cream=mat('#e8e0c8'),glass=mat('#b4cdd1',{transparent:true,opacity:.12,depthWrite:false,roughness:.18}),food=mat('#ffffff'),glow=new T.MeshBasicMaterial({color:'#fff1ce'}),screen=new T.MeshBasicMaterial({color:'#80a9ad'});
 floor.map.repeat.set(mall?6:8,mall?5:8);tile.map.repeat.set(3,3);
 const cube=new T.BoxGeometry(),sphere=new T.SphereGeometry(1,10,6),cylinder=new T.CylinderGeometry(1,1,1,12),dummy=new T.Object3D(),color=new T.Color();let meals=0;
 function emit(geo,m,w,h,d,x,y,z,tint=null,rx=0){if(!batches.has(m))batches.set(m,new Map());const by=batches.get(m);if(!by.has(geo))by.set(geo,[]);by.get(geo).push({w,h,d,x,y,z,tint,rx});}
 const box=(m,w,h,d,x,y,z,tint=null)=>emit(cube,m,w,h,d,x,y,z,tint),cyl=(m,r,h,x,y,z,tint=null)=>emit(cylinder,m,r,h,r,x,y,z,tint),ball=(m,w,h,d,x,y,z,tint=null)=>emit(sphere,m,w,h,d,x,y,z,tint);
 box(floor,b.w-4,.25,b.h-4,b.w/2,1.7,b.h/2);box(tile,b.w-4,31,.5,b.w/2,17.5,2);for(const x of [2,b.w-2])box(mall?black:cream,.6,44,b.h-4,x,24,b.h/2);box(mall?black:red,b.w-4,8,.9,b.w/2,42,2.5);
 box(black,b.w-4,.25,b.h-4,b.w/2,48.5,b.h/2);if(mall){for(const x of [8,b.w-8])for(const z of [18,b.h-18]){cyl(black,.17,5,x,44,z);cyl(wood,2.4,1.1,x,41,z);cyl(glow,2,.2,x,40.3,z);}for(let x=5;x<b.w-3;x+=5)box(wood,1.5,1,b.h-4,x,47,b.h/2);}
 else for(const x of [24,b.w/2,b.w-24])for(const z of [25,68,107]){box(steel,15,.6,9,x,47.5,z);box(glow,14,.2,8,x,47.1,z);}
 // Red steel service line versus slatted oak burger-bar counter.
 box(mall?wood:red,b.w-16,11,mall?10:12,b.w/2,7,24);box(steel,b.w-15,1,mall?11:13,b.w/2,13,24);
 if(mall)for(let x=10;x<b.w-7;x+=3)box(black,.4,9,.4,x,7,29.2);else for(const y of [3,6,9])box(steel,b.w-17,.6,.6,b.w/2,y,30.2);
 for(const f of [.29,.7]){const x=b.w*f;box(black,8,.6,6,x,14,24);box(steel,.6,3,.6,x,16,23);box(black,9,5,.7,x,19,23);box(screen,7.8,3.9,.8,x,19,23.4);box(cream,3,2,3,x+7,15,24);box(black,5,.4,3,x,14.5,27);}
 // Visible open prep line and extraction hood, all within the kitchen collider.
 box(steel,b.w-12,8,7,b.w/2,6,7.5);box(steel,b.w*.43,2,7,b.w*.3,12,7.5);for(let i=0;i<6;i++)box(black,1, .35,5,b.w*.12+i*3,13.2,7.5);
 box(steel,b.w*.42,4,9,b.w*.3,29,7);box(steel,5,7,5,b.w*.3,34,6);for(let i=0;i<5;i++)box(black,2,.3,5,b.w*.16+i*3,27,7);
 const fryerX=b.w*.72;for(const dx of [-4,4]){box(black,6,.4,5,fryerX+dx,12,7);box(steel,.5,3,4,fryerX+dx-3,14,7);box(black,.6,.6,5,fryerX+dx,15.5,10);}
 for(let i=0;i<5;i++){box(cream,3,1,2,b.w*.45+i*3.5,13,8);cyl(food,.55,2.6,b.w*.45+i*3.5,14.5,5,['#ba382e','#d7ab35'][i%2]);}
 // Display cabinet, original burger silhouettes and pickup bags.
 const caseX=b.w*.48;box(black,14,1,8,caseX,14,24);for(const side of [-1,1]){box(steel,.3,6,8,caseX+side*7,17,24);box(glass,14,6,.15,caseX,17,24+side*4);}box(glass,14,.15,8,caseX,20,24);
 function burger(x,y,z,s=1){ball(food,2*s,.6*s,1.7*s,x,y+1.8*s,z,'#d9a354');box(food,3.8*s,.35*s,3*s,x,y+1.1*s,z,'#679245');box(food,3.6*s,.3*s,2.9*s,x,y+.7*s,z,'#713f2a');box(food,3.6*s,.2*s,2.8*s,x,y+.45*s,z,'#e1b94c');ball(food,2*s,.4*s,1.7*s,x,y,z,'#c78c48');meals++;}
 burger(caseX-3,14.5,24,.8);burger(caseX+3,14.5,24,.8);box(wood,4,5,3,b.w-16,16,24);box(cream,3,.5,3,b.w-16,18.8,24);
 // Side dining zones, never the center customer/service route.
 const rows=mall?[b.h-23]:[71,102];for(const side of [-1,1])for(const z of rows){const x=side<0?(mall?12:15):b.w-(mall?12:15),w=mall?14:20;
  box(wood,w,1,8,x,11,z);cyl(black,1,9,x,6,z);cyl(steel,3,.5,x,1.9,z);
  for(const dz of [-8,8]){box(mall?(dz<0?lime:cloth):cloth,w,2,6,x,7,z+dz);box(mall?black:red,w,8,1,x,11,z+dz+(dz<0?-2.7:2.7));for(const dx of [-w*.35,w*.35])box(steel,.5,5,4,x+dx,4,z+dz);}
  box(cream,4,.4,3,x-3,11.8,z);burger(x+2,11.9,z,.55);cyl(cream,.7,2.4,x-3,13,z+2);box(red,.15,2.5,.15,x-3,15,z+2);
 }
 if(!mall){box(black,12,17,17,12,10,42.5);box(red,12,3,17,12,20,42.5);for(let i=0;i<3;i++){box(cream,2.3,4,.7,8+i*3.2,16,51.2);box(steel,.5,1.5,1,8+i*3.2,13.5,51.8);}box(black,11,1,5,12,10,51);}
 else{for(const x of [5,b.w-5]){box(wood,4,4,4,x,4,b.h-8);for(let k=0;k<4;k++)ball(cloth,1,2.5,1,x+Math.sin(k)*1.4,8+k*.6,b.h-8+Math.cos(k)*1.4);}}
 // Original illustrated menu artwork: no copied restaurant logos, stock photos or external image requests.
 function menu(){const w=1024,h=256,data=new Uint8Array(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const panel=Math.floor(x/256),px=x%256;let c=mall?[34,43,38]:[250,242,219];if(px<5||y<5||y>250)c=mall?[183,144,82]:[159,47,42];if(px>30&&px<150&&y>45&&y<60)c=mall?[237,209,145]:[72,64,53];const dx=(px-96)/62,dy=(y-125)/30;if(dx*dx+dy*dy<1&&y<130)c=[211,151,70];if(px>35&&px<157&&y>=130&&y<141)c=[73,115,53];if(px>38&&px<154&&y>=141&&y<155)c=[97,55,37];if(px>38&&px<154&&y>=155&&y<165)c=[225,180,64];if(px>40&&px<152&&y>=165&&y<177)c=[203,141,65];if(y>200&&y<207&&px>30&&px<180)c=mall?[202,197,171]:[74,68,56];data.set([...c,255],(y*w+x)*4);}const tex=new T.DataTexture(data,w,h);tex.encoding=T.sRGBEncoding;tex.needsUpdate=true;textures.push(tex);return tex;}
 const menuMat=new T.MeshBasicMaterial({map:menu()}),panel=new T.Mesh(new T.PlaneGeometry(b.w-18,12),menuMat);panel.name='Original illustrated burger menus';panel.position.set(b.w/2,37,12.8);root.add(panel);box(black,b.w-16,13,1,b.w/2,37,12.1);
 for(const [m,by]of batches)for(const [geo,list]of by){const mesh=new T.InstancedMesh(geo,m,list.length);mesh.name=mall?'Bayou · warm burger-bar fixtures':'Mess Stop · red diner fixtures';list.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.scale.set(v.w,v.h,v.d);dummy.rotation.set(v.rx,0,0);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);if(m===food)mesh.setColorAt(i,color.set(v.tint||'#dfcda2'));});mesh.userData.noBatch=true;mesh.frustumCulled=false;root.add(mesh);}
 if(sign){sign(root,mall?'BAYOU BURGERS · FRESH OFF THE GRILL':'MESS STOP · ORDER / PICK UP',b.w-14,3,b.w/2,45,13.1,mall?'#e2bd7d':'#fff1ce');for(let i=0;i<4;i++)sign(root,['CLASSIC','DOUBLE','CHICKEN','VEGGIE'][i],(b.w-20)/4,2,9+(i+.5)*(b.w-18)/4,33,13.2,mall?'#f7e2ad':'#fff2d9');}
 root.position.set(dir===-1?b.x+b.w:b.x,base,dir===-1?b.y+b.h:b.y);root.rotation.y=dir===-1?Math.PI:0;root.userData.fastFood={theme,seats:p.seats,meals,textures:textures.length,menu:'original illustration'};return {root,solids:p.solids,plan:p};
}
const api={plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29FastFood=api;
})();
