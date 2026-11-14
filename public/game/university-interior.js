'use strict';
(function(){
function plan(b){const rows=Math.max(2,Math.min(5,Math.floor((b.h-52)/24))),bank=(b.w-58)/2;return {rows,solids:Array.from({length:rows},(_,i)=>[-1,1].map(side=>({x:b.x+b.w/2+(side<0?-22-bank:22),y:b.y+36+i*24,w:bank,h:20,kind:'lecture-bank'}))).flat()};}
function build(T,b,{base=0}={}){const root=new T.Group();root.name='Bayou State · modern tiered lecture hall';root.position.y=base;const ceiling=new T.Group();ceiling.name='University · wood ceiling and drum lights';ceiling.position.y=base;const p=plan(b),batches=new Map(),dummy=new T.Object3D(),cube=new T.BoxGeometry(1,1,1),cyl=new T.CylinderGeometry(1,1,1,16),mat=(c,extra={})=>new T.MeshStandardMaterial({color:c,roughness:.75,...extra}),wood=mat('#bc8b50'),pale=mat('#dbccad'),steel=mat('#606b6e',{metalness:.5,roughness:.35}),black=mat('#252c31'),blue=mat('#344b60'),orange=mat('#bb623e'),paper=mat('#dcdac9'),board=mat('#294e4c'),glass=mat('#b4cfcd',{transparent:true,opacity:.14,depthWrite:false,roughness:.2}),screen=new T.MeshBasicMaterial({color:'#9db6c6'}),glow=new T.MeshBasicMaterial({color:'#fff2ce'});
 function put(g,m,x,y,z,sx,sy,sz,parent=root){if(!batches.has(parent))batches.set(parent,new Map());const groups=batches.get(parent),key=g.uuid+':'+m.uuid;if(!groups.has(key))groups.set(key,{g,m,items:[]});dummy.position.set(b.x+x,y,b.y+z);dummy.rotation.set(0,0,0);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();groups.get(key).items.push(dummy.matrix.clone());}
 const box=(m,w,h,d,x,y,z,parent)=>put(cube,m,x,y,z,w,h,d,parent);let seats=0,laptops=0;
 box(pale,b.w-6,.2,b.h-6,b.w/2,1.15,b.h/2);
 // Clear central aisle is flat; tiered side-bank risers are blocked scenery, not walkable levels.
 for(let row=0;row<p.rows;row++)for(const side of [-1,1]){const r=p.solids[row*2+(side===-1?0:1)],x=r.x-b.x+r.w/2,z=r.y-b.y+r.h/2,y=1+row*2;box(black,r.w,y,r.h,x,y/2+1,z);box(wood,r.w,1,7,x,11+y,z-5);for(const xx of [x-r.w/2+2,x+r.w/2-2])box(steel,.7,10,5,xx,6+y,z-5);const n=Math.max(1,Math.floor(r.w/15));for(let j=0;j<n;j++){const xx=r.x-b.x+(j+.5)*r.w/n;box(blue,9,2,8,xx,6+y,z+5);box(blue,9,8,1.4,xx,10+y,z+8);for(const dx of [-3.5,3.5])box(steel,.6,5,.6,xx+dx,3.5+y,z+5);box(black,7.5,.4,5,xx,11.8+y,z-5);box(black,7.5,5,.35,xx,14.1+y,z-7.3);box(screen,6.5,4,.2,xx,14.1+y,z-7.05);box(paper,3.4,.2,4,xx+6,11.8+y,z-5);seats++;laptops++;}}
 box(board,b.w*.63,20,1,b.w/2,27,4);box(steel,b.w*.63+2,1,2,b.w/2,16.5,4.5);box(paper,b.w*.28,13,.5,b.w*.76,32,5.5);for(let i=0;i<3;i++)box(blue,b.w*.22,.45,.2,b.w*.76,36-i*3,5.9);
 // Low lectern stays to one side of the original scientist/quiz service point.
 box(wood,13,15,9,16,8.5,17);box(black,14,.7,10,16,16.5,17);box(screen,7,4,.5,16,19,16);
 // Orange lounge bench and glass partitions flank the entry lobby, never its center route.
 for(const side of [-1,1]){const x=b.w/2+side*(b.w/2-14);box(orange,17,5,9,x,4,b.h-16);box(orange,17,6,2,x,8,b.h-20);for(const z of [b.h-29,b.h-7])box(steel,.5,32,.5,side<0?5:b.w-5,18,z);box(glass,.25,27,20,side<0?5:b.w-5,18,b.h-18);}
 // Cof­fered wood ceiling and drum pendant fixtures echo the contemporary campus references.
 for(let x=7;x<b.w-3;x+=13)box(wood,12,.5,b.h-6,x,48,b.h/2,ceiling);for(let z=9;z<b.h-3;z+=14)box(pale,b.w-6,.7,.7,b.w/2,47.3,z,ceiling);
 for(const x of [b.w*.25,b.w*.75])for(let z=22;z<b.h-12;z+=36){put(cyl,pale,x,43,z,4,4,4,ceiling);put(cyl,glow,x,40.9,z,3.8,.15,3.8,ceiling);box(steel,.25,4,.25,x,46,z,ceiling);}
 // Crenellated stone frontage and lancet-window silhouettes are roof-owned so interiors can reveal cleanly.
 for(const side of [-1,1]){const x=b.w/2+side*(b.w/2-5);box(pale,5,18,6,x,56,b.h-4,ceiling);put(cyl,pale,x,68,b.h-4,2,8,2,ceiling);}
 for(let x=10;x<b.w-6;x+=12)box(pale,6,5,4,x,53,b.h-2,ceiling);
 for(const side of [-1,1])for(let i=0;i<3;i++){const x=b.w/2+side*(28+i*(b.w/2-38)/3);box(board,9,19,.5,x,30,b.h+.1,ceiling);for(const d of [-1,1])box(pale,.7,21,.9,x+d*5,30,b.h+.6,ceiling);box(pale,.6,20,1,x,30,b.h+.7,ceiling);box(pale,11,1,1,x,20,b.h+.7,ceiling);}
 for(const [parent,groups]of batches)for(const {g,m,items}of groups.values()){const mesh=new T.InstancedMesh(g,m,items.length);mesh.userData.noBatch=true;items.forEach((a,i)=>mesh.setMatrixAt(i,a));parent.add(mesh);}root.userData.university={rows:p.rows,seats,laptops};return {root,ceiling,solids:[...p.solids,...[-1,1].map(side=>({x:b.x+b.w/2+side*(b.w/2-14)-8.5,y:b.y+b.h-21,w:17,h:10,kind:'lounge-bench'})),{x:b.x+9,y:b.y+12,w:14,h:10,kind:'lectern'}],plan:p};
}
const api={plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29University=api;
})();
