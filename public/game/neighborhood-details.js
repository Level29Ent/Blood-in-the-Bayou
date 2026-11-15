'use strict';
(function(){
const shared=new WeakMap(),THEMES=['porch garden','fenced cottage','working household','courtyard planters'];
function plan(b,{index=0,treme=false,address=null}={}){
 const theme=((index%4)+4)%4,W=b.w,D=b.h,front=treme?D+6:D-7,items=[],add=(kind,x,z,w,d)=>items.push({kind,x:b.x+x-w/2,y:b.y+z-d/2,w,h:d});
 // These details stay in existing house/porch scenery, never on public roads or paths.
 const offset=treme?W/2-4:W*.32;
 for(const side of[-1,1])add(theme===2?'terracotta planter':'flower pot',W/2+side*offset,front,6,6);
 if(!treme){
  add(b.apartment?'courtyard bench':theme===2?'recycling bin':'porch chair',W*.2,front-4,8,6);
  if(theme===1||b.apartment)for(const side of[-1,1])add('picket fence',W/2+side*(W/4+10),D-1.2,W/2-23,1);
  if(theme===0||b.apartment)add('bicycle',W*.81,front-3,10,3);
 }
 return {theme:THEMES[theme],address:address??(2900+Math.abs(Math.floor(b.x/32+b.y/32*7))%700),items,entry:{x:b.x+W/2-16,y:b.y+D-16,w:32,h:treme?36:40},visualOnly:true};
}
function resources(T){if(shared.has(T))return shared.get(T);const cube=new T.BoxGeometry(),ball=new T.SphereGeometry(1,8,6),cyl=new T.CylinderGeometry(1,1,1,10),ring=new T.TorusGeometry(1,.12,5,16),colors=['#d6c7a8','#6c5745','#404e51','#6c8252','#b77855','#c58a96','#baad5c','#5b766e'],mats=colors.map(color=>new T.MeshStandardMaterial({color,roughness:.9})),k={cube,ball,cyl,ring,mats};shared.set(T,k);return k;}
function build(T,b,options={}){
 const p=plan(b,options),K=resources(T),root=new T.Group();root.name='Lived-in yard · '+p.theme;root.userData.noBatch=true;const[cream,wood,metal,leaf,clay,pink,gold,green]=K.mats,buckets=new Map(),o=new T.Object3D();
 function put(g,m,x,y,z,w,h,d,rot=[0,0,0]){const key=g.uuid+m.uuid;if(!buckets.has(key))buckets.set(key,{g,m,list:[]});o.position.set(b.x+x,(options.base||0)+y,b.y+z);o.scale.set(w,h,d);o.rotation.set(...rot);o.updateMatrix();buckets.get(key).list.push(o.matrix.clone());}
 const box=(m,w,h,d,x,y,z)=>put(K.cube,m,x,y,z,w,h,d),rod=(a,b,r=.16)=>{const aa=new T.Vector3(...a),v=new T.Vector3(...b).sub(aa),mid=aa.addScaledVector(v,.5),e=new T.Euler().setFromQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),v.clone().normalize()));put(K.cyl,metal,...mid.toArray(),r,v.length(),r,[e.x,e.y,e.z]);};
 for(const item of p.items){const x=item.x-b.x+item.w/2,z=item.y-b.y+item.h/2,y=options.treme?5:0;
  if(item.kind.includes('pot')||item.kind.includes('planter')){put(K.cyl,clay,x,y+1.5,z,2.5,3,2.5);put(K.cyl,wood,x,y+3.05,z,2.25,.15,2.25);for(let i=0;i<5;i++){const a=i*Math.PI*2/5,xx=x+Math.cos(a)*1.6,zz=z+Math.sin(a)*1.6;put(K.ball,leaf,xx,y+4.2,zz,1.2,1.5,1.2);put(K.ball,i%2?pink:gold,xx,y+5.8,zz,.8,.65,.8);}}
  if(item.kind==='porch chair'||item.kind==='courtyard bench'){const bench=item.kind==='courtyard bench',w=bench?8:5;box(wood,w,1,5,x,y+4,z);box(wood,w,6,1,x,y+7,z-2.5);for(const side of[-1,1])for(const dz of[-2,2])box(metal,.55,4,.55,x+side*(w/2-.5),y+2,z+dz);for(const side of[-1,1]){box(cream,.5,.5,5,x+side*w/2,y+6,z);box(metal,.4,2,.4,x+side*w/2,y+5,z+2);}}
  if(item.kind==='recycling bin'){box(green,4.5,6,4,x,3,z);box(metal,5,.6,4.5,x,6.3,z);for(const side of[-1,1])put(K.cyl,metal,x+side*2,1,z-1.5,.7,.6,.7,[0,0,Math.PI/2]);box(cream,2,.5,.2,x,4,z+2.1);}
  if(item.kind==='picket fence'){for(let dx=-item.w/2+1;dx<item.w/2;dx+=3){box(cream,1,7,1,x+dx,3.5,z);put(K.ball,cream,x+dx,7,z,.5,.7,.5);}for(const yy of[2,5])box(wood,item.w,.65,.65,x,yy,z);}
  if(item.kind==='bicycle'){for(const side of[-1,1]){put(K.ring,metal,x+side*3,2.3,z,2,2,2);for(let j=0;j<4;j++){const a=j*Math.PI/2;rod([x+side*3,2.1,z],[x+side*3+Math.cos(a)*1.8,2.1+Math.sin(a)*1.8,z],.07);}}for(const[a,b]of[[[-3,2],[0,2]],[[0,2],[-1.5,5]],[[-1.5,5],[-3,2]],[[0,2],[2,5]],[[2,5],[-1.5,5]],[[2,5],[3,2]]])rod([x+a[0],a[1],z],[x+b[0],b[1],z]);box(wood,2,.5,1,x-1.5,5.3,z);rod([x+2,5,z],[x+2,6,z]);box(metal,.5,.4,2,x+2,6,z);}
 }
 // Original geometric house number; no per-home canvas or texture allocation.
 const x=options.treme?b.w-11:b.w/2+14,z=options.treme?b.h+1.8:b.h-13.5,y=options.treme?24:19;
 box(metal,9,4,.4,x,y,z);const segments=[[0,1.2,1.1,.22],[.65,.6,.22,1],[.65,-.6,.22,1],[0,-1.2,1.1,.22],[-.65,-.6,.22,1],[-.65,.6,.22,1],[0,0,1.1,.22]],digits=['012345','12','01643','01236','1256','05236','054326','012','0123456','012356'];for(const[i,ch]of String(p.address).split('').entries())for(const n of digits[+ch]){const[sx,sy,w,h]=segments[+n];box(cream,w,h,.12,x-3+i*2+sx,y+sy,z+.26);}
 for(const{g,m,list}of buckets.values()){const mesh=new T.InstancedMesh(g,m,list.length);list.forEach((a,i)=>mesh.setMatrixAt(i,a));mesh.userData.noBatch=true;root.add(mesh);}root.userData.neighborhoodDetails=p;return {root,plan:p};
}
const api={THEMES,plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29NeighborhoodDetails=api;
})();
