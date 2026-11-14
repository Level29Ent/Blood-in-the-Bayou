'use strict';
(function(){
function plan(b,dir=1){const flip=r=>dir===-1?{...r,x:2*b.x+b.w-r.x-r.w,y:2*b.y+b.h-r.y-r.h}:r;return {solids:[{x:b.x+3,y:b.y+18,w:13,h:b.h-31,kind:'camera-counter'},{x:b.x+b.w-16,y:b.y+18,w:13,h:b.h-31,kind:'lens-counter'},{x:b.x+3,y:b.y+3,w:b.w-6,h:11,kind:'rear-cabinet'},{x:b.x+4,y:b.y+b.h-12,w:11,h:10,kind:'tripod'},{x:b.x+b.w-15,y:b.y+b.h-12,w:11,h:10,kind:'tripod'}].map(flip)};}
function build(T,b,{base=0,dir=1}={}){
 const root=new T.Group();root.name='Camera Shop · glass cabinets and photographic equipment';root.position.set(b.x+b.w/2,base,b.y+b.h/2);if(dir===-1)root.rotation.y=Math.PI;root.userData.noBatch=true;
 const batches=new Map(),dummy=new T.Object3D(),tint=new T.Color(),cube=new T.BoxGeometry(1,1,1),cyl=new T.CylinderGeometry(1,1,1,16),ring=new T.TorusGeometry(1,.1,5,16);
 const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.7,...extra}),wood=mat('#ba8d50'),edge=mat('#805c35'),black=mat('#242a2d'),rubber=mat('#13191c'),metal=mat('#aeb7b8',{metalness:.7,roughness:.28}),lensGlass=mat('#19344b',{metalness:.45,roughness:.13}),coating=mat('#5c8298',{metalness:.55,roughness:.17}),paper=mat('#f2e5be'),red=mat('#a3393e'),bag=mat('#96724e'),tile=mat('#d8d0bb'),glass=mat('#b8d7d7',{transparent:true,opacity:.12,depthWrite:false,roughness:.15}),glow=new T.MeshBasicMaterial({color:'#fff6dd'});
 let cameras=0,lenses=0,bags=0,tripods=0,tickets=0,pose=null;
 function emit(g,m,x,y,z,sx,sy,sz,rot=[0,0,0],c){dummy.position.set(x,y,z);dummy.rotation.set(...rot);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();const matrix=dummy.matrix.clone();if(pose)matrix.premultiply(pose);if(!batches.has(g))batches.set(g,new Map());const groups=batches.get(g);if(!groups.has(m))groups.set(m,[]);groups.get(m).push({matrix,c});}
 const box=(m,w,h,d,x,y,z,c)=>emit(cube,m,x,y,z,w,h,d,undefined,c);
 const disk=(m,r,h,x,y,z)=>emit(cyl,m,x,y,z,r,h,r,[Math.PI/2,0,0]);
 function at(x,y,z,angle,fn){pose=new T.Matrix4().makeRotationY(angle);pose.setPosition(x,y,z);fn();pose=null;}
 function lens(x,y,z,r=1,long=false){const length=long?4.1:2.4;disk(black,r,length,x,y,z+length/2);for(let i=0;i<5;i++)disk(i===3?metal:rubber,r*1.055,.14,x,y,z+.25+i*(length-.4)/5);disk(metal,r*1.1,.16,x,y,z+length);disk(lensGlass,r*.86,.18,x,y,z+length+.11);disk(coating,r*.45,.035,x-.16,y+.14,z+length+.22);lenses++;}
 function camera(x,y,z,i,angle=0){at(x,y,z,angle,()=>{const twin=i%7===0,compact=i%5===0;if(twin){box(black,3.3,5.8,2.2,0,2.9,0);for(const yy of [1.7,4.2]){disk(metal,1.05,.3,0,yy,1.2);disk(lensGlass,.82,.2,0,yy,1.45);}box(metal,2.8,.35,2,0,5.9,0);disk(metal,.38,.6,1.8,3.3,0);}else{box(i%3===0?metal:black,4.6,2.9,1.9,0,1.7,0);box(rubber,1.05,3.1,2.4,1.8,1.7,.15);if(!compact){box(black,1.9,1.1,1.4,-.2,3.5,0);box(metal,1,.15,1,0,4.1,0);}lens(-.35,1.8,1,compact?.6:1.1,!compact&&i%4===0);emit(cyl,black,-1.5,3.3,0,.5,.45,.5);emit(cyl,metal,1.5,3.35,.5,.25,.2,.25);box(red,.3,.25,.1,-1.7,2.6,1);box(metal,.5,.3,.1,1.7,2.9,1.45);box(rubber,2.3,1.5,.1,0,1.9,-1.02);}cameras++;});}
 function ticket(x,y,z,angle=0){at(x,y,z,angle,()=>{box(paper,4,2.5,.13,0,0,0);box(red,3.7,.4,.15,0,.8,.09);for(let i=0;i<3;i++)box(black,2.3-i*.4,.13,.16,-.2,.25-i*.42,.1);});tickets++;}
 function cameraBag(x,y,z,i,angle=0){at(x,y,z,angle,()=>{box(bag,5.3,3.4,3.5,0,2,0,['#9e643b','#a79b7e','#454b4c'][i%3]);box(edge,5.7,.5,3.8,0,3.9,0);box(edge,1,2,.15,-1.7,2.5,1.85);box(edge,1,2,.15,1.7,2.5,1.85);box(metal,.7,.5,.2,-1.7,2,1.95);box(metal,.7,.5,.2,1.7,2,1.95);emit(ring,edge,0,4.5,0,1.2,.65,1.2);});bags++;}
 function rod(a,c,r,m){const start=new T.Vector3(...a),end=new T.Vector3(...c),d=end.clone().sub(start);dummy.position.copy(start.add(end).multiplyScalar(.5));dummy.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.clone().normalize());dummy.scale.set(r,d.length(),r);dummy.updateMatrix();if(!batches.has(cyl))batches.set(cyl,new Map());const groups=batches.get(cyl);if(!groups.has(m))groups.set(m,[]);groups.get(m).push({matrix:dummy.matrix.clone()});}
 const w=b.w,h=b.h,run=h-31;
 box(tile,w-4,.12,h-4,0,1.6,0);for(let x=-w/2+5;x<w/2-3;x+=10)box(edge,.1,.02,h-4,x,1.68,0);for(let z=-h/2+5;z<h/2-3;z+=10)box(edge,w-4,.02,.1,0,1.68,z);
 // The back wall reads as a traditional warm timber camera cabinet, with lit glass shelves.
 box(wood,w-4,39,1,0,22,-h/2+2);for(const x of [-w/2+3,0,w/2-3])box(edge,.8,38,10,x,22,-h/2+7);
 const cols=Math.floor((w-10)/8),step=(w-10)/cols;
 for(let row=0;row<4;row++){const y=4.5+row*8.5;box(metal,w-7,.45,10,0,y,-h/2+7);box(glow,w-10,.18,.4,0,y+7.9,-h/2+3);for(let i=0;i<cols;i++){const x=-w/2+5+(i+.5)*step;if(row===0&&i%2===0)cameraBag(x,y+.3,-h/2+7,i);else camera(x,y+.3,-h/2+7,i+row*9);ticket(x,y+1,-h/2+12.3);}}
 box(glass,w-7,34,.15,0,22,-h/2+12.5);box(edge,w-5,1.3,11,0,40.5,-h/2+7);
 // Glass-topped side counters have tiered display stock and tall wall lens cabinets behind them.
 for(const side of [-1,1]){const cx=side*(w/2-9.5),wall=side*(w/2-2.8),angle=-side*Math.PI/2;box(wood,13,6,run,cx,4.8,0);box(edge,13,.8,run,cx,8,0);for(const z of [-run/2,run/2])box(metal,13,17,.5,cx,16.5,z);
  for(let row=0;row<2;row++){const y=8.7+row*7.5;box(metal,12,.35,run,cx,y,0);box(glow,.25,.18,run-1,cx+side*5.5,y+6.5,0);for(let i=0;i<Math.floor(run/6.5);i++){const z=-run/2+3.5+i*6.5;camera(cx,y+.4,z,i+row*6+(side===1?3:0),angle);ticket(cx-side*4.6,y+1.5,z,angle);}}
  box(glass,.15,16.5,run,cx-side*6.5,16.8,0);box(glass,13,.15,run,cx,25.2,0);box(metal,.45,.45,run,cx-side*6.5,25.5,0);
  // Top-deck demonstration cameras on dark stepped pedestals, with white/red price cards.
  for(let i=0;i<3;i++){const z=-run*.28+i*run*.28;box(black,7,1.2,7,cx,26,z);camera(cx,26.7,z,i+4,angle);ticket(cx-side*5,27.7,z,angle);}
  box(wood,.5,18,run,wall,35,0);for(const z of [-run/2,run/2])box(edge,5,18,.6,wall-side*2,35,z);
  for(let row=0;row<2;row++){const y=29+row*8;box(metal,5,.3,run,wall-side*2,y,0);for(let i=0;i<7;i++){const z=-run/2+3+i*(run-6)/6;at(wall-side*2,y,z,angle,()=>{emit(cyl,i%4===0?paper:black,0,2.2,0,1.3,4.4,1.3);for(let n=0;n<4;n++)emit(cyl,rubber,0,.7+n,0,1.35,.15,1.35);emit(cyl,lensGlass,0,4.45,0,1.05,.1,1.05);});lenses++;}}
  box(glass,.1,17,run,wall-side*4.7,35,0);
 }
 // Freestanding tripods occupy the front side corners, with dedicated footprint blockers.
 for(const side of [-1,1]){const x=side*(w/2-9.5),z=h/2-7;for(let i=0;i<3;i++){const a=i*Math.PI*2/3;rod([x,22,z],[x+Math.cos(a)*3,2,z+Math.sin(a)*3],.3,black);rod([x,17,z],[x+Math.cos(a)*3,2,z+Math.sin(a)*3],.14,metal);}rod([x,22,z],[x,30,z],.35,metal);box(black,3,1,2,x,30,z);rod([x,30,z],[x+3,29,z+2],.2,black);tripods++;}
 for(const x of [-w*.24,w*.24]){box(edge,14,.4,h-8,x,48,0);for(const z of [-h*.22,h*.22])box(glow,12,.18,10,x,47.6,z);}
 if(typeof document!=='undefined'){
  const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#e8d4a9';ctx.fillRect(0,0,1024,128);ctx.fillStyle='#252f31';ctx.textAlign='center';ctx.font='bold 52px sans-serif';ctx.fillText('CRESCENT CAMERA',512,54);ctx.font='25px sans-serif';ctx.fillText('NEW / USED  ·  CAMERAS  ·  LENSES  ·  FILM',512,103);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;const sign=new T.Mesh(new T.PlaneGeometry(w-10,7),new T.MeshBasicMaterial({map:t}));sign.position.set(0,45,-h/2+3);sign.userData.noBatch=true;root.add(sign);
 }
 for(const [g,groups]of batches)for(const [m,items]of groups){const mesh=new T.InstancedMesh(g,m,items.length);mesh.userData.noBatch=true;items.forEach((a,i)=>{mesh.setMatrixAt(i,a.matrix);if(a.c)mesh.setColorAt(i,tint.set(a.c));});root.add(mesh);}
 root.userData.cameraShop={cameras,lenses,bags,tripods,tickets};return {root,solids:plan(b,dir).solids,plan:plan(b,dir)};
}
const api={plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29CameraShop=api;
})();
