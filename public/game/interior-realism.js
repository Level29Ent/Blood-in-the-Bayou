'use strict';
(function(){
const banks=new WeakMap(),finishClones=new WeakMap();
// Shared original PBR maps: fine, restrained grain rather than large uniform colour blocks.
function maps(T,kind){let bank=banks.get(T);if(!bank){bank=new Map();banks.set(T,bank);}if(bank.has(kind))return bank.get(kind);
 const size=128,rgb=new Uint8Array(size*size*4),normal=new Uint8Array(size*size*4),rough=new Uint8Array(size*size*4),height=new Float32Array(size*size);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const k=y*size+x,n=Math.sin(x*127.1+y*311.7)*43758.5453,f=n-Math.floor(n);let h=.5+(f-.5)*.06,value=238,rv=210;
  if(kind==='wood'){h+=.06*Math.sin(x*.38+Math.sin(y*.065)*2);value=227+Math.round((h-.5)*120);rv=174+f*24;}
  else if(kind==='marble'){const vein=Math.pow(Math.max(0,Math.sin(x*.12+y*.07+Math.sin(y*.12)*1.4)),20);h-=vein*.04;value=247-vein*38;rv=110+vein*25;}
  else if(kind==='fabric'){h+=.035*Math.sin(x*Math.PI)*Math.cos(y*Math.PI/2);value=229+f*16;rv=240;}
  else if(kind==='metal'){h=.5+(f-.5)*.016;value=245+f*8;rv=105+f*28;}
  else{h-=f>.98?.07:0;value=239+f*12;rv=217+f*15;}
  height[k]=h;rgb.set([value,value,value,255],k*4);rough.set([rv,rv,rv,255],k*4);
 }
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const dx=(height[y*size+(x+size-1)%size]-height[y*size+(x+1)%size])*2,dy=(height[((y+size-1)%size)*size+x]-height[((y+1)%size)*size+x])*2,v=new T.Vector3(dx,dy,1).normalize();normal.set([(v.x*.5+.5)*255,(v.y*.5+.5)*255,(v.z*.5+.5)*255,255],(y*size+x)*4);}
 const tex=(data,color=false)=>{const t=new T.DataTexture(data,size,size);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(2,2);t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;if(color)t.encoding=T.sRGBEncoding;t.needsUpdate=true;return t;};
 const result={map:tex(rgb,true),normalMap:tex(normal),roughnessMap:tex(rough)};bank.set(kind,result);return result;
}
function material(T,color,kind='paint'){const m=new T.MeshStandardMaterial({color,metalness:kind==='metal'?.65:0,roughness:kind==='marble'?.42:kind==='metal'?.55:kind==='fabric'?.95:.84});const set=maps(T,kind);Object.assign(m,set);m.normalScale.set(.2,.2);m.userData.interiorFinish=kind;return m;}
function upgrade(T,root,exclude=[]){const clones=finishClones;let added=0;root.traverse(o=>{if(!o.isMesh||exclude.includes(o))return;for(let p=o;p&&p!==root;p=p.parent)if(exclude.includes(p)||p.userData.body||p.userData.legs||p.userData.skinWrap)return;
 const finish=m=>{if(!m?.isMeshStandardMaterial||m.transparent||m.userData.interiorFinish||m.userData.skinWrap||m.emissiveIntensity>1||m.vertexColors)return m;if(clones.has(m))return clones.get(m);const n=m.clone(),kind=m.userData.surfaceKind==='wood'?'wood':m.userData.surfaceKind==='fabric'?'fabric':m.metalness>.35?'metal':'paint',set=maps(T,kind);
 // Preserve authored artwork, tiles, and product labels; add micro-normal and finish response.
 if(!m.map)n.map=set.map;if(!m.normalMap&&!m.bumpMap)n.normalMap=set.normalMap;if(!m.roughnessMap)n.roughnessMap=set.roughnessMap;n.roughness=Math.max(m.roughness,kind==='metal'?.45:.65);n.userData={...m.userData,interiorFinish:kind};clones.set(m,n);added++;return n;};o.material=Array.isArray(o.material)?o.material.map(finish):finish(o.material);
 });return added;}
function profile(v){const name=(v.name||'').toUpperCase();if(['safe','shelter'].includes(v.id)||v.apartment)return 'home';if(/HOSPITAL|CLINIC|PHARMACY/.test(name))return 'care';if(/GARAGE|WORKSHOP|WAREHOUSE|SAWMILL|HARDWARE/.test(name))return 'workshop';return 'public';}
/** Wall-mounted detail only: no new floor blockers or changes to gameplay collision. */
function decorate(T,b,options={}){const root=new T.Group();root.name='Architectural interior finishes';const base=options.base||0,theme=options.theme||'public',height=options.height||40,lists=new Map(),metal=material(T,'#909795','metal'),trim=material(T,theme==='home'?'#77604c':'#444b48','wood'),ivory=material(T,'#c9c6b9'),dark=material(T,'#272d2b');
 const emit=(w,h,d,x,y,z,m)=>{if(w<=0||d<=0)return;if(!lists.has(m))lists.set(m,[]);lists.get(m).push({w,h,d,x,y:y+base,z});};
 const x=b.x,z=b.y,w=b.w,d=b.h,door=Math.min(60,w*.42),cx=x+w/2;
 // Skirting + shadow line and crown trim follow the perimeter, splitting around the doorway.
 for(const y of [1.6,height-1.5]){const thick=y<3?2.6:1.2;emit(w-5,thick,.7,cx,y,z+2.8,trim);for(const sx of [x+2.8,x+w-2.8])emit(.7,thick,d-5,sx,y,z+d/2,trim);for(const side of [-1,1])emit((w-door)/2-3,thick,.7,cx+side*(door/2+(w-door)/4),y,z+d-2.8,trim);}
 // Door architrave, kick plates, outlets, switches and a fire-alarm panel.
 for(const side of [-1,1])emit(1,Math.min(34,height-4),1,cx+side*(door/2+1),Math.min(34,height-4)/2,z+d-3,trim);
 for(const sx of [x+4,x+w-4]){emit(.8,3,2,sx,5,z+d*.4,ivory);emit(.9,.7,.15,sx,5,z+d*.4+.9,dark);}
 emit(2.2,3,.7,cx+door/2+6,14,z+d-3,ivory);emit(1.1,1.5,.8,cx+door/2+6,14,z+d-2.6,dark);
 emit(3,2,1,x+w-8,height-7,z+3.5,ivory);emit(.7,.7,1.2,x+w-8,height-7,z+4,dark);
 // Framed art / service board on the back wall, plus ventilation grille and wall wash strips.
 const boardW=Math.min(30,w*.23);emit(boardW+2,11,.7,x+w*.23,height*.58,z+3.1,trim);emit(boardW,9,.8,x+w*.23,height*.58,z+3.5,material(T,theme==='care'?'#83998c':theme==='home'?'#627b78':'#9d9176','fabric'));
 emit(Math.min(28,w*.2),5,.6,x+w*.74,height-5,z+3.4,metal);for(let i=0;i<5;i++)emit(Math.min(25,w*.18),.35,.7,x+w*.74,height-7+i,z+3.8,dark);
 const glow=new T.MeshBasicMaterial({color:theme==='care'?'#dceae7':'#e7d8b7'});for(const sx of [x+6,x+w-6]){emit(3,9,2,sx,height*.65,z+4,metal);emit(2,7,2.1,sx,height*.65,z+4.2,glow);}
 const geometry=new T.BoxGeometry(),dummy=new T.Object3D();for(const [m,list]of lists){const mesh=new T.InstancedMesh(geometry,m,list.length);list.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.scale.set(p.w,p.h,p.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.frustumCulled=false;mesh.userData.noBatch=true;root.add(mesh);}root.userData.finishCount=[...lists.values()].reduce((n,a)=>n+a.length,0);return root;}
const api={maps,material,upgrade,profile,decorate};if(typeof module!=='undefined')module.exports=api;if(typeof window==='undefined')return;window.level29InteriorRealism=api;
})();
