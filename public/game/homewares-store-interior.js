'use strict';
(function(){
function plan(b,dir=1){const depth=Math.min(11,Math.max(3,(b.w-28)/2)),rear=Math.min(9,b.h-34),flip=r=>dir===-1?{...r,x:2*b.x+b.w-r.x-r.w,y:2*b.y+b.h-r.y-r.h}:r;
 const solids=[{x:b.x+3,y:b.y+rear+7,w:depth,h:b.h-21-rear,kind:'kitchen-shelves'},{x:b.x+b.w-depth-3,y:b.y+rear+7,w:depth,h:b.h-21-rear,kind:'pillow-shelves'},{x:b.x+3,y:b.y+3,w:b.w-6,h:rear,kind:'basket-wall'}];
 if(b.h>=60)solids.push({x:b.x+b.w/2-Math.min(32,b.w-34)/2,y:b.y+14,w:Math.min(32,b.w-34),h:12,kind:'display-table'});
 return {depth,rear,solids:solids.map(flip),entry:{x:b.x+b.w/2,y:dir===1?b.y+b.h:b.y},service:{x:b.x+b.w/2,y:dir===1?b.y+b.h-20:b.y+20}};}
function build(T,b,{base=0,dir=1}={}){
 const root=new T.Group();root.name='Homewares Store · kitchen, baskets and cushions';root.position.y=base;root.userData.noBatch=true;const p=plan(b),batches=new Map(),textures=[],dummy=new T.Object3D(),stats={pots:0,pans:0,plates:0,bowls:0,mugs:0,baskets:0,pillows:0,towels:0};
 const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.78,...extra});
 function texture(kind){const n=64,data=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){let v=230;if(kind==='weave')v=((x%8<2||y%6<2)?155:239)+((x+y)%4)*3;else if(kind==='pillow')v=(Math.floor(x/8)%2?190:248)-(y%8<1?28:0);else v=225+Math.sin(x*.36+Math.sin(y*.09))*15;data.set([v,v,v,255],(y*n+x)*4);}const t=new T.DataTexture(data,n,n);t.encoding=T.sRGBEncoding;t.wrapS=t.wrapT=T.RepeatWrapping;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.needsUpdate=true;textures.push(t);return t;}
 const textileMap=texture('pillow');
 const cream=mat('#e6deca'),wood=mat('#ae875c',{map:texture('wood')}),dark=mat('#3c3830'),silver=mat('#b6c2c4',{metalness:.75,roughness:.28}),pan=mat('#272e31',{metalness:.35,roughness:.4}),wicker=mat('#bc945b',{map:texture('weave')}),wickerDark=mat('#795337',{map:wicker.map}),liner=mat('#f0e4c9'),floor=mat('#bda17c',{map:wood.map}),teal=mat('#378d96'),glow=new T.MeshBasicMaterial({color:'#fff6dc'}),pottery=['#ecc6c0','#ceddb9','#efe5c8','#b4d4d8'].map(c=>mat(c,{roughness:.35})),fabrics=['#2c8b9c','#5caaa8','#a4c3b4','#ece8d4','#ad9b57'].map(c=>mat(c,{map:textileMap}));
 const cube=new T.BoxGeometry(),cylinder=new T.CylinderGeometry(1,1,1,16),sphere=new T.SphereGeometry(1,12,8),torus=new T.TorusGeometry(1,.1,6,20);
 const profile=points=>new T.LatheGeometry(points.map(([x,y])=>new T.Vector2(x,y)),20),bowl=profile([[0,0],[.55,0],[1,.7],[1,1],[.88,1],[.78,.7],[.4,.16],[0,.16]]),pot=profile([[0,0],[1,0],[1,1],[.9,1],[.9,.15],[0,.15]]),plate=profile([[0,0],[.7,0],[1,.13],[1,.22],[.85,.22],[.65,.1],[0,.1]]);
 function emit(geo,m,w,h,d,x,y,z,rx=0,ry=0,rz=0){if(!batches.has(m))batches.set(m,new Map());const g=batches.get(m);if(!g.has(geo))g.set(geo,[]);g.get(geo).push({w,h,d,x:b.x+x,y,z:b.y+z,rx,ry,rz});}
 const box=(m,w,h,d,x,y,z)=>emit(cube,m,w,h,d,x,y,z);
 function basket(x,y,z,w=5,d=4,h=3,hanging=false){box(wicker,w,.5,d,x,y+.25,z);for(const side of [-1,1]){box(wicker,.45,h,d,x+side*(w/2-.2),y+h/2,z);box(wicker,w,h,.45,x,y+h/2,z+side*(d/2-.2));box(wickerDark,w,.25,.25,x,y+h,z+side*d/2);}box(liner,w-.9,.2,d-.9,x,y+.65,z);if(hanging){emit(torus,wicker,w*.45,h*.75,d*.4,x,y+h+1.3,z,0,0,0);}else for(const side of [-1,1])emit(torus,wicker,.8,.55,.5,x+side*w/2,y+h-.3,z,0,Math.PI/2);stats.baskets++;}
 function dishes(x,y,z,index){const m=pottery[index%4];for(let j=0;j<4;j++){emit(plate,m,2.3,.7,2.3,x,y+j*.35,z);stats.plates++;}emit(bowl,m,1.7,1.5,1.7,x+4,y,z);emit(torus,cream,1.67,1.67,1.67,x+4,y+1.45,z,Math.PI/2);stats.bowls++;emit(pot,m,1.15,2.5,1.15,x-3.6,y,z);emit(torus,m,.65,.85,.65,x-2.4,y+1.35,z,0,Math.PI/2);stats.mugs++;}
 function cookware(x,y,z,i){emit(pot,silver,2.4,3,2.4,x,y,z);for(const sign of [-1,1])emit(torus,silver,.7,.45,.7,x+sign*2.6,y+2,z,0,Math.PI/2);emit(cylinder,silver,2.5,.25,2.5,x,y+3.15,z);emit(sphere,dark,.45,.3,.45,x,y+3.5,z);stats.pots++;emit(pot,pan,2.4,.7,2.4,x,y,z+4);box(pan,.7,.6,3,x,y+.45,z+7);stats.pans++;}
 function pillow(x,y,z,i,rotation=0){emit(sphere,fabrics[i%5],3.1,3.3,1.35,x,y,z,0,rotation,.05*(i%3-1));box(fabrics[i%5],5.1,.35,2.2,x,y-2.3,z);stats.pillows++;}
 function label(text,x,y,z,w,h,rotation=0){if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1024;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle='#335c59';ctx.fillRect(0,0,1024,160);ctx.fillStyle='#fff2d8';ctx.textAlign='center';ctx.font='bold 70px sans-serif';ctx.fillText(text,512,108,985);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;textures.push(t);const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:t}));m.position.set(b.x+x,y,b.y+z);m.rotation.y=rotation;m.userData.noBatch=true;root.add(m);}
 box(floor,b.w-4,.25,b.h-4,b.w/2,1.8,b.h/2);for(let z=5;z<b.h-3;z+=6)box(dark,b.w-4,.025,.08,b.w/2,1.95,z);
 for(const x of [2,b.w-2])box(cream,.4,42,b.h-4,x,24,b.h/2);box(cream,b.w-4,42,.4,b.w/2,24,2);
 // Open steel-and-wood shelves: narrow backs and boards never conceal the stock.
 for(const side of [-1,1]){const r=p.solids[side<0?0:1],x=r.x-b.x+r.w/2,z=r.y-b.y+r.h/2;box(cream,.7,31,r.h,side<0?3.3:b.w-3.3,18,z);for(const end of [-1,1])box(cream,r.w,32,.5,x,18,z+end*r.h/2);
 for(let row=0;row<4;row++){const yy=4+row*8.2;box(wood,r.w,.6,r.h,x,yy,z);box(cream,.4,.8,r.h,side<0?3+r.w:b.w-3-r.w,yy,z);const cells=Math.max(2,Math.floor(r.h/11)),step=r.h/cells;for(let cell=0;cell<cells;cell++){const zz=r.y-b.y+(cell+.5)*step;if(side<0){if(row%2) dishes(x,yy+.5,zz,row+cell);else cookware(x,yy+.5,zz-3,cell);}else{pillow(x,yy+3.7,zz,row+cell,Math.PI/2);}}}
 label(side<0?'KITCHEN & TABLE':'PILLOWS & LINENS',side<0?3+r.w+.3:b.w-3-r.w-.3,39,z,r.h,4.5,side<0?Math.PI/2:-Math.PI/2);}
 // Rear basket cubbies and folded blankets, kept well behind the service point.
 const cols=Math.max(2,Math.floor((b.w-12)/10)),cell=(b.w-12)/cols;
 box(wood,b.w-6,29,.6,b.w/2,18,3.3);for(let row=0;row<3;row++){const y=4+row*9;box(cream,b.w-6,.65,p.rear,b.w/2,y,3+p.rear/2);for(let i=0;i<cols;i++){const x=6+(i+.5)*cell;if(row===1){for(let j=0;j<3;j++){box(fabrics[(i+j)%5],cell*.72,1.2,p.rear-1,x,y+1+j*1.25,3+p.rear/2);stats.towels++;}}else basket(x,y+.5,3+p.rear/2,Math.min(7,cell-1),Math.max(3,p.rear-1),5);}}
 label('HOMEWARES',b.w/2,42,4,b.w-12,6);label('BASKETS • KITCHEN • COMFORT',b.w/2,36,4,b.w-12,3.5);
 const table=p.solids.find(r=>r.kind==='display-table');if(table){const x=b.w/2,z=20,w=table.w;box(wood,w,1.2,12,x,14,z);box(cream,w-1,.7,11,x,5,z);for(const xx of [-1,1])for(const zz of [-1,1])box(cream,1.2,12,1.2,x+xx*(w/2-1),8,z+zz*5);basket(x-w*.25,5.5,z,6,8,4);basket(x+w*.25,5.5,z,6,8,4);for(let i=0;i<3;i++){emit(cylinder,fabrics[i],1.1,6,1.1,x-5+i*2.5,15.7,z+2,Math.PI/2);stats.towels++;}dishes(x+2,14.8,z-2,0);basket(x-w*.3,14.8,z-1,5,6,3);}
 // Hanging wicker above display shelving, not across the entrance or player's head.
 for(let i=0;i<3;i++){const x=12+i*(b.w-24)/2,z=8;box(dark,.2,4,.2,x,45,z);basket(x,35,z,6,5,4,true);}
 for(const x of [b.w*.3,b.w*.7]){box(cream,3,.6,b.h-12,x,47,b.h/2);box(glow,1.5,.2,b.h-14,x,46.6,b.h/2);}
 for(const [m,geos]of batches)for(const [geo,items]of geos){const mesh=new T.InstancedMesh(geo,m,items.length);mesh.userData.noBatch=true;items.forEach((a,i)=>{dummy.position.set(a.x,a.y,a.z);dummy.rotation.set(a.rx,a.ry,a.rz);dummy.scale.set(a.w,a.h,a.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});root.add(mesh);}
 if(dir===-1){root.rotation.y=Math.PI;root.position.x=2*b.x+b.w;root.position.z=2*b.y+b.h;}
 root.userData.homewares={...stats,textures:textures.length};return {root,solids:plan(b,dir).solids};
}
const api={plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29HomewaresStore=api;
})();
