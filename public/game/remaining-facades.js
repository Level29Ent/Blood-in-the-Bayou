'use strict';
(function(){
const TYPES=new Set(['shelter','retail','grocery','cafe','business','garage','gas']);
const PALETTES=[['#c5b79b','#eee2c9','#3f5f55','#253c43'],['#b89378','#ead8bd','#4f6269','#263945'],['#a7b1a1','#e6e1cb','#64536c','#293b41'],['#c4b9aa','#eee8da','#5c6e7a','#253943']];
function authored(o){return !!o&&Object.keys(o).some(k=>/^(reference|authored)/i.test(k)&&!!o[k]);}
function eligible(v){return !!(v?.mesh?.userData.genericVenueShell&&TYPES.has(v.id)&&!v.privateResidence&&!v.floorFurniture&&!v.mall&&!v.millRoad&&!v.b?.apartment&&!authored(v)&&!authored(v.b));}
function plan(v){
 const b=v.frontage?.angle?v.frontage.canonical:v.b,w=b.w,d=b.h;if(![b.x,b.y,w,d].every(Number.isFinite)||w<64||d<64)return null;
 const seed=Math.abs(Math.floor(Number(v.b.seed)||b.x*3+b.y*7)),style=seed%4,parts=[];
 const add=(kind,material,x,y,z,width,height,depth)=>parts.push({kind,material,x,y,z,w:width,h:height,d:depth});
 const x=b.x,z=b.y,door=v.frontage?.angle?x+w/2:v.doorX,doorW=Math.max(24,Number(v.doorW)||44),left=door-doorW/2-4,right=door+doorW/2+4;
 // All relief stays above the walking clearance; existing signs at 35/46/62 remain exposed.
 for(const yy of [48.4,50.2]){add('cornice','stone',x+w/2,yy,z+d+.35,w+1,1,.65);add('cornice','stone',x+w/2,yy,z-.35,w+1,1,.65);for(const xx of [x-.35,x+w+.35])add('cornice','stone',xx,yy,z+d/2,.65,1,d);}
 for(const xx of [x+2,x+w-2]){add('corner-trim','masonry',xx,23,z+d+.3,3,44,.6);add('corner-trim','stone',xx,46,z+d+.5,5,1.6,1);}
 function windowBay(cx,cz,side=false){const width=Math.min(19,side?d*.18:w*.16),y=23,height=16;
  const box=(kind,mat,a,b,c,ww,hh,dd)=>add(kind,mat,side?cx+c:cx+a,y+b,side?cz+a:cz+c,side?dd:ww,hh,side?ww:dd);
  box('window-recess','dark',0,0,0,width+2,height+2,.22);box('window-glass','glass',0,0,.2,width,height,.22);
  for(const off of [-width/2,width/2])box('window-frame','stone',off,0,.43,.7,height+1,.45);
  for(const off of [-height/2,height/2])box('window-frame','stone',0,off,.43,width+1,.7,.45);
  box('window-sash','stone',0,0,.45,.65,height,.5);box('window-sill','stone',0,-height/2-1,.6,width+4,1,1.3);
  if(style%2===0){for(const off of [-width/2-2,width/2+2]){box('shutter','accent',off,0,.25,2.4,height+1,.5);for(const yy of [-5,-1,3])box('shutter-slat','stone',off,yy,.57,2.1,.35,.18);}}
 }
 // Front bays occupy solid wall either side of the door, never the door/service aisle.
 for(const [a,bx]of [[x+8,left],[right,x+w-8]])if(bx-a>=30)windowBay((a+bx)/2,z+d+.25);
 // Side bays are wall-mounted relief, not transparent holes into fake interiors.
 const count=Math.min(3,Math.max(1,Math.floor(d/56)));for(let i=0;i<count;i++){const zz=z+18+(d-36)*(i+.5)/count;windowBay(x+w+.25,zz,true);}
 // Discreet high-level masonry joints add scale without changing existing wall colors.
 for(const yy of [6,10,39,43])for(const xx of [x+2,x+w-2])add('masonry-joint','stone',xx,yy,z+d+.63,3.2,.35,.2);
 return {style,palette:PALETTES[style],parts,bounds:{...b},door:{left,right}};
}
function build(T,v){const p=plan(v);if(!p)return null;const root=new T.Group();root.name='Generic facade · '+(v.name||v.id);root.userData.noBatch=true;root.userData.mobileStaticScenery=true;root.userData.facadeMaterials=new Set();const cube=new T.BoxGeometry(1,1,1),dummy=new T.Object3D(),keys=['masonry','stone','accent','glass','dark'],colors=[p.palette[0],p.palette[1],p.palette[2],'#486674',p.palette[3]];
 keys.forEach((key,i)=>{const list=p.parts.filter(a=>a.material===key);if(!list.length)return;const mat=new T.MeshStandardMaterial({color:colors[i],roughness:key==='glass'?.28:.88,metalness:key==='glass'?.18:0}),mesh=new T.InstancedMesh(cube,mat,list.length);mesh.name='Facade '+key;mesh.frustumCulled=false;list.forEach((a,n)=>{dummy.position.set(a.x,a.y,a.z);dummy.scale.set(a.w,a.h,a.d);dummy.updateMatrix();mesh.setMatrixAt(n,dummy.matrix);});root.userData.facadeMaterials.add(mat);root.add(mesh);});root.userData.facadeGeometry=cube;return root;}
function apply(T,venues){let count=0;for(const v of venues){if(!eligible(v)||v.mesh.getObjectByName('Generic facade · '+(v.name||v.id)))continue;const root=build(T,v);if(root){v.mesh.add(root);count++;}}return count;}
function release(root){if(!root?.userData.facadeGeometry)return;for(const m of root.userData.facadeMaterials)m.dispose();root.userData.facadeMaterials.clear();root.userData.facadeGeometry.dispose();root.userData.facadeGeometry=null;for(const m of root.children)m.dispose?.();root.parent?.remove(root);}
const api={eligible,plan,build,apply,release};if(typeof module!=='undefined')module.exports=api;if(typeof window==='undefined')return;
let count=0,roots=[];const original=buildCity;buildCity=function(){for(const root of roots)release(root);roots=[];const r=original.apply(this,arguments);const venues=city?.venues||[];count=apply(THREE,venues);for(const v of venues){const root=v.mesh?.getObjectByName('Generic facade · '+(v.name||v.id));if(root)roots.push(root);}return r;};window.level29RemainingFacades={...api,get count(){return count;}};
})();
