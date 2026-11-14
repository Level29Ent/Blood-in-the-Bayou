'use strict';
(function(){
function plan(b,dir=1){const flip=r=>dir===-1?{...r,x:2*b.x+b.w-r.x-r.w,y:2*b.y+b.h-r.y-r.h}:r,point=p=>dir===-1?{x:2*b.x+b.w-p.x,y:2*b.y+b.h-p.y}:p;
 const bins=[{x:b.x+4,y:b.y+18,w:14,h:b.h-35,kind:'vinyl-bin'},{x:b.x+b.w-18,y:b.y+18,w:14,h:b.h-35,kind:'vinyl-bin'}],rear={x:b.x+4,y:b.y+4,w:b.w-8,h:9,kind:'record-wall'};
 return {bins:bins.map(flip),rear:flip(rear),solids:[...bins,rear].map(flip),entry:point({x:b.x+b.w/2,y:b.y+b.h}),service:point({x:b.x+b.w/2,y:b.y+b.h-20})};}
function build(T,b,{base=0,dir=1}={}){
 const root=new T.Group();root.name='Music Store · packed vinyl / CDs';root.position.y=base;root.userData.noBatch=true;const p=plan(b),batches=new Map(),textures=[];
 const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.82,...extra});
 function map(kind){const n=128,data=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){let c=224+((x*17+y*23+x*y)%19-9);if(kind==='wood')c+=Math.sin(x*.24+Math.sin(y*.08))*17;if(kind==='carpet')c=215+((x*7+y*13)%23-11);data.set([c,c,c,255],(y*n+x)*4);}const t=new T.DataTexture(data,n,n);t.encoding=T.sRGBEncoding;t.wrapS=t.wrapT=T.RepeatWrapping;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;textures.push(t);return t;}
 const wood=mat('#b28a50',{map:map('wood')}),dark=mat('#202528'),black=mat('#10181b'),cream=mat('#e3d9be'),red=mat('#7c2938',{map:map('carpet')}),purple=mat('#695685'),silver=mat('#a8b6b4',{metalness:.6,roughness:.35}),sleeve=mat('#ffffff'),paper=mat('#e7dfc8'),glow=new T.MeshBasicMaterial({color:'#fff3d8'}),screen=new T.MeshBasicMaterial({color:'#66968e'});
 wood.map.repeat.set(2,2);red.map.repeat.set(4,3);const cube=new T.BoxGeometry(),cyl=new T.CylinderGeometry(1,1,1,16),dummy=new T.Object3D(),color=new T.Color();let records=0,cds=0;
 const colors=['#b65e49','#487a88','#c3a65e','#7b5d92','#6b8560','#d5c3a3','#b95c80','#365c73'];
 function emit(geo,m,w,h,d,x,y,z,tint=null,rx=0,ry=0){if(!batches.has(m))batches.set(m,new Map());const by=batches.get(m);if(!by.has(geo))by.set(geo,[]);by.get(geo).push({w,h,d,x:b.x+x,y,z:b.y+z,tint,rx,ry});}
 const box=(m,w,h,d,x,y,z,tint)=>emit(cube,m,w,h,d,x,y,z,tint);
 box(red,b.w-4,.12,b.h-4,b.w/2,1.6,b.h/2);box(dark,b.w-4,42,.3,b.w/2,24,1.4);for(const x of [1.4,b.w-1.4])box(x<2?dark:purple,.3,42,b.h-4,x,24,b.h/2);
 // Side flip-through bins: open tops, raised front-facing sleeves and full lower storage.
 for(const [bank,r]of p.bins.entries()){const x=r.x-b.x+r.w/2,z=r.y-b.y+r.h/2;box(wood,r.w,2,r.h,x,2.5,z);for(const xx of [x-r.w/2+.5,x+r.w/2-.5])box(wood,1,15,r.h,xx,11,z);box(wood,r.w,1,r.h,x,11,z);box(wood,r.w,1,r.h,x,19,z);
 const cells=Math.max(2,Math.floor(r.h/11)),step=r.h/cells;for(let cell=0;cell<cells;cell++){const zz=r.y-b.y+(cell+.5)*step;for(const end of [-1,1])box(wood,r.w,.8,.7,x,20,zz+end*step/2);for(let j=0;j<14;j++){box(sleeve,11,6,.4,x,15,zz-step*.38+j*step*.055,colors[(j+cell+bank)%8]);records++;}for(let j=0;j<13;j++){box(sleeve,11,8,.45,x,7,zz-step*.38+j*step*.058,colors[(j+cell)%8]);records++;}box(paper,11.5,.7,.45,x,18.4,zz-step*.38);}
 }
 // Slatwall with rows of face-out album artwork; original covers are merged into one atlas mesh.
 const coverPositions=[],coverUvs=[],v=new T.Vector3();let atlas;
 if(typeof document!=='undefined'){
  const c=document.createElement('canvas');c.width=512;c.height=512;const ctx=c.getContext('2d');const titles=['BAYOU SOUL','CRESCENT JAZZ','NIGHT TRAIN','SECOND LINE','DELTA DUB','GOLDEN HOUR','RIVER SONGS','VINYL DAYS','STREET BRASS','MOONLIT','LOCAL CUTS','DEEP GROOVE','NOIR NOTES','SOUTH SIDE','FUNK 29','NEW ARRIVALS'];
  for(let i=0;i<16;i++){const x=i%4*128,y=Math.floor(i/4)*128;ctx.fillStyle=colors[i%8];ctx.fillRect(x,y,128,128);ctx.fillStyle=i%2?'#192a32':'#e2d4ae';ctx.beginPath();ctx.arc(x+64,y+55,18+i%4*5,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#efddad';ctx.lineWidth=2;for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(x+8,y+30+k*13);ctx.lineTo(x+120,y+10+k*19);ctx.stroke();}ctx.fillStyle='#101f27';ctx.fillRect(x+3,y+94,122,31);ctx.fillStyle='#f5e8c5';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText(titles[i],x+64,y+114,116);}
  atlas=new T.CanvasTexture(c);atlas.encoding=T.sRGBEncoding;textures.push(atlas);
 }
 const coverMat=mat('#ffffff',{map:atlas||null,roughness:.7});let covers=0;
 function cover(x,y,z,size,index,angle=0){const geo=new T.PlaneGeometry(size,size),uv=geo.attributes.uv,m=new T.Matrix4().makeRotationY(angle);m.setPosition(b.x+x,y,b.y+z);for(let i=0;i<geo.index.count;i++){const k=geo.index.getX(i);v.fromBufferAttribute(geo.attributes.position,k).applyMatrix4(m);coverPositions.push(v.x,v.y,v.z);coverUvs.push(((index%4)+uv.getX(k))/4,1-(Math.floor(index%16/4)+1-uv.getY(k))/4);}geo.dispose();covers++;}
 const rearCols=Math.max(3,Math.floor((b.w-10)/10)),step=(b.w-10)/rearCols;
 for(let row=0;row<3;row++){box(wood,b.w-8,.8,4,b.w/2,12+row*10,4);for(let i=0;i<rearCols;i++){const x=5+(i+.5)*step;box(black,step-.6,9,.5,x,17+row*10,2.7);cover(x,17+row*10,3.1,Math.min(8.5,step-1),i+row*rearCols);}}
 // Face-out sleeves along the side walls and on the upper bins, oriented towards the central aisle.
 for(const [bank,r]of p.bins.entries()){const side=bank===0?1:-1,x=bank===0?3:b.w-3,angle=side*Math.PI/2;for(let row=0;row<2;row++){box(wood,3,.7,r.h,x+side*.5,24+row*10,r.y-b.y+r.h/2);for(let i=0;i<Math.floor(r.h/10);i++)cover(x+side*.5,29+row*10,r.y-b.y+5+i*10,8.5,i+row*5+bank*3,angle);}for(let i=0;i<Math.floor(r.h/11);i++)cover(r.x-b.x+r.w/2,24,r.y-b.y+6+i*11,9,i+bank*6);}
 // CD jewel-case spines in a dense right-back rack, no separate texture per item.
 const cdRun=Math.min(20,b.w*.24);box(wood,cdRun,20,6,b.w-7-cdRun/2,13,8.5);for(let row=0;row<4;row++){box(wood,cdRun,.5,6,b.w-7-cdRun/2,4+row*4.7,8.5);for(let i=0;i<26;i++){box(sleeve,.5,3.9,4.5,b.w-7-cdRun+i*.7,6.2+row*4.7,9,colors[(i+row)%8]);cds++;}}
 // A compact till/turntable sits on the back shelf, not in the browsing corridor.
 box(black,17,2,7,b.w*.48,5,8);emit(cyl,black,3.2,.25,3.2,b.w*.48-3,6.3,8);emit(cyl,paper,.7,.27,.7,b.w*.48-3,6.4,8);box(silver,.2,.25,4,b.w*.48+3,6.5,8);box(black,5,3,3,b.w*.48+6,7,8);box(screen,4,1.8,.1,b.w*.48+6,7.5,9.6);
 // Framed music-inspired wall pieces, no real artist portraits copied from the references.
 for(let i=0;i<3;i++){const x=b.w*.2+i*b.w*.27;box(wood,10,7,.7,x,44,2.5);cover(x,44,3,5.7,12+i);}
 for(const x of [b.w*.25,b.w*.75]){box(black,2,.5,b.h-8,x,48,b.h/2);for(let z=13;z<b.h-4;z+=20){box(black,3,3,3,x,46,z);box(glow,2,.2,2,x,44.5,z);}}
 if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#172023';ctx.fillRect(0,0,1024,256);ctx.fillStyle='#ff515d';ctx.font='bold 112px sans-serif';ctx.textAlign='center';ctx.fillText('RECORDS',512,120);ctx.fillStyle='#ead9aa';ctx.font='30px sans-serif';ctx.fillText('VINYL • CDs • LOCAL MUSIC • NEW / USED',512,202);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;textures.push(t);const sign=new T.Mesh(new T.PlaneGeometry(b.w-12,9),new T.MeshBasicMaterial({map:t}));sign.position.set(b.x+b.w/2,40,b.y+5.3);sign.userData.noBatch=true;root.add(sign);}
 const faces=new T.BufferGeometry();faces.setAttribute('position',new T.Float32BufferAttribute(coverPositions,3));faces.setAttribute('uv',new T.Float32BufferAttribute(coverUvs,2));faces.computeVertexNormals();faces.computeBoundingSphere();const art=new T.Mesh(faces,coverMat);art.name='Record store · original illustrated album covers';art.userData.noBatch=true;root.add(art);
 for(const [m,geos]of batches)for(const [geo,items]of geos){const mesh=new T.InstancedMesh(geo,m,items.length);mesh.userData.noBatch=true;items.forEach((a,i)=>{dummy.position.set(a.x,a.y,a.z);dummy.rotation.set(a.rx,a.ry,0);dummy.scale.set(a.w,a.h,a.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);if(a.tint)mesh.setColorAt(i,color.set(a.tint));});root.add(mesh);}
 if(dir===-1){root.rotation.y=Math.PI;root.position.x=2*b.x+b.w;root.position.z=2*b.y+b.h;}
 root.userData.recordStore={records,cds,covers,textures:textures.length};return {root,plan:plan(b,dir),solids:plan(b,dir).solids};
}
const api={plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29RecordStore=api;
})();
