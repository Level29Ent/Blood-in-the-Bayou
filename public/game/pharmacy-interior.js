'use strict';
(function(){
function plan(b,dir=1){
 const rows=[{x:b.x+3,y:b.y+12,w:8,h:b.h-27,kind:'medicine-wall'},{x:b.x+b.w-11,y:b.y+12,w:8,h:b.h-27,kind:'medicine-wall'},{x:b.x+12,y:b.y+3,w:b.w-24,h:7,kind:'prescription-wall'},{x:b.x+17,y:b.y+Math.min(17,b.h-40),w:b.w-34,h:9,kind:'counter'}];
 if(b.w>=96)rows.push({x:b.x+b.w*.29-4,y:b.y+b.h*.47,w:8,h:b.h*.28,kind:'gondola'});
 const flip=r=>dir===-1?{...r,x:2*b.x+b.w-r.x-r.w,y:2*b.y+b.h-r.y-r.h}:r;
 return {solids:rows.map(flip),entry:{x:b.x+b.w/2,y:dir===1?b.y+b.h:b.y},service:{x:b.x+b.w/2,y:dir===1?b.y+b.h-20:b.y+20}};
}
function build(T,b,{base=0,dir=1}={}){
 const root=new T.Group();root.name='Crescent Pharmacy · prescriptions and medicine aisles';root.position.y=base;root.userData.noBatch=true;
 const white=new T.MeshStandardMaterial({color:'#edece4',roughness:.7}),oak=new T.MeshStandardMaterial({color:'#9d7751',roughness:.8}),blue=new T.MeshStandardMaterial({color:'#225775'}),green=new T.MeshStandardMaterial({color:'#689733'}),dark=new T.MeshStandardMaterial({color:'#27383f'}),stock=new T.MeshStandardMaterial({color:'#ffffff'}),floor=new T.MeshStandardMaterial({color:'#bca78c',roughness:.6}),glow=new T.MeshBasicMaterial({color:'#fffbe8'});
 const cube=new T.BoxGeometry(),cylinder=new T.CylinderGeometry(.5,.5,1,10),batches=new Map(),tints=new Map(),dummy=new T.Object3D(),color=new T.Color();let boxes=0,bottles=0;const labels=[];
 function emit(geo,mat,w,h,d,x,y,z,tint){if(tint){if(!tints.has(tint))tints.set(tint,new T.MeshStandardMaterial({color:tint,roughness:.7}));mat=tints.get(tint);}if(!batches.has(mat))batches.set(mat,new Map());const g=batches.get(mat);if(!g.has(geo))g.set(geo,[]);g.get(geo).push({w,h,d,x:x+b.x,y,z:z+b.y,tint});}
 const box=(m,w,h,d,x,y,z,tint)=>emit(cube,m,w,h,d,x,y,z,tint);
 function sign(text,x,y,z,w,h,bg='#225775',rotation=0){labels.push(text);if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,1024,128);ctx.fillStyle='#ffffff';ctx.textAlign='center';ctx.font='bold 64px sans-serif';ctx.fillText(text,512,87,990);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:t}));m.position.set(b.x+x,y,b.y+z);m.rotation.y=rotation;m.userData.noBatch=true;root.add(m);}
 const palette=['#2e7b9b','#69a887','#b7545e','#b1a35a','#796aa2','#ebeee2'];
 function product(x,y,z,i,rot=0){const tint=palette[i%palette.length];if(i%3){box(stock,rot?2:1.7,3.1,rot?1.7:2,x,y+1.55,z);box(stock,rot?.09:1.73,1.05,rot?1.73:.09,x+(rot?Math.sign(rot)*1.02:0),y+1.9,z+(rot?0:1.03),tint);box(white,rot?.1:1.74,.15,rot?1.74:.1,x+(rot?Math.sign(rot)*1.03:0),y+1.75,z+(rot?0:1.09));boxes++;}else{emit(cylinder,stock,1.55,3.3,1.55,x,y+1.65,z);emit(cylinder,white,1.7,.6,1.7,x,y+3.6,z);box(stock,rot?.08:1.2,1.3,rot?1.2:.08,x+(rot?Math.sign(rot)*.8:0),y+1.8,z+(rot?0:.8),tint);bottles++;}}
 box(floor,b.w-4,.3,b.h-4,b.w/2,1.7,b.h/2);for(let z=4;z<b.h-3;z+=7)box(oak,b.w-4,.04,.12,b.w/2,1.88,z);
 // Wall shelving has thin backs, not solid cabinet volumes hiding the products.
 for(const side of [0,1]){const x=side?b.w-7:7,z=b.h/2-1.5,len=b.h-27;box(oak,8,2,len,x,2.7,z);box(white,.7,29,len,side?b.w-3.4:3.4,17,z);
 for(let row=0;row<5;row++){const y=4+row*5.7;box(white,8,.6,len,x,y,z);box(side?green:blue,.3,.7,len,side?b.w-11:11,y-.1,z);const n=Math.floor((len-2)/2.6);for(let i=0;i<n;i++)product(x,y+.4,12+(i+.5)*(len/n),i+row*3+side,side?-1:1);}
 sign(side?'VITAMINS • WELLNESS':'COUGHS • COLDS',side?b.w-11.5:11.5,36,z,len-2,4,side?'#54842c':'#225775',side?-Math.PI/2:Math.PI/2);}
 const rearW=b.w-24;box(oak,rearW,36,1,b.w/2,20,3.5);for(let row=0;row<5;row++){const y=4+row*5.8;box(white,rearW,.65,6,b.w/2,y,6.5);for(let i=0;i<Math.floor(rearW/2.7);i++)product(13+i*2.7,y+.4,7,i+row);}
 sign('PRESCRIPTIONS',b.w/2,40,4.3,b.w-19,7);sign('MEDICINES',b.w/2,34,7.4,b.w-27,3);
 const cz=Math.min(21.5,b.h-35.5);box(oak,b.w-34,12,9,b.w/2,7.6,cz);box(white,b.w-32,1,11,b.w/2,14,cz);box(white,b.w-36,8,.3,b.w/2,8.5,cz+4.65);sign('Rx  •  PICK UP',b.w/2,9.2,cz+4.9,Math.min(28,b.w-36),4);
 box(dark,6,4,.6,b.w*.68,17.7,cz-1.3);box(dark,1,3,1,b.w*.68,14.8,cz-1.5);box(blue,5.2,3,.1,b.w*.68,17.8,cz-.94);box(dark,6,.5,3,b.w*.68,14.8,cz+2.5);
 for(const r of plan(b).solids.filter(r=>r.kind==='gondola')){const x=r.x-b.x+4,z=r.y-b.y+r.h/2;box(white,.5,24,r.h,x,14,z);for(const end of [-1,1])box(white,8,24,.6,x,14,z+end*r.h/2);for(let row=0;row<4;row++){const y=4+row*5.5;box(white,8,.6,r.h,x,y,z);for(const side of [-1,1])for(let i=0;i<Math.floor(r.h/2.7);i++)product(x+side*2.3,y+.4,r.y-b.y+1.6+i*2.7,i+row,1);}box(green,8,3,r.h,x,28,z);sign('PAIN RELIEF',x,28,z+r.h/2+.4,8,2.3,'#54842c');}
 for(const x of [b.w*.3,b.w*.7]){box(white,4,.8,b.h-12,x,47,b.h/2);box(glow,2,.2,b.h-14,x,46.5,b.h/2);}
 for(const [mat,geos]of batches)for(const [geo,items]of geos){const mesh=new T.InstancedMesh(geo,mat,items.length);mesh.userData.noBatch=true;items.forEach((a,i)=>{dummy.position.set(a.x,a.y,a.z);dummy.scale.set(a.w,a.h,a.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);if(a.tint)mesh.setColorAt(i,color.set(a.tint));});root.add(mesh);}
 if(dir===-1){root.rotation.y=Math.PI;root.position.x=2*b.x+b.w;root.position.z=2*b.y+b.h;}
 root.userData.pharmacy={boxes,bottles,labels};return {root,solids:plan(b,dir).solids};
}
const api={plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29PharmacyInterior=api;
})();
