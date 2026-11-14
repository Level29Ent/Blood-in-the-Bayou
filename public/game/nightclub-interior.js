'use strict';
(function(){
function matches(v){return v?.id==='nightclub'&&!v.southern;}
function plan(b){const depth=Math.min(18,b.w*.14),booths=[-1,1].flatMap(side=>[.47,.76].map(f=>({x:b.x+(side<0?5:b.w-5-depth),y:b.y+b.h*f-10,w:depth,h:20}))),stage={x:b.x+b.w*.25,y:b.y+5,w:b.w*.5,h:19},bar={x:b.x+5,y:b.y+6,w:b.w*.18,h:17};return {booths,stage,bar,solids:[...booths,stage,bar],dancers:Array.from({length:9},(_,i)=>({x:b.x+b.w*(.37+(i%3)*.13),y:b.y+b.h*(.36+Math.floor(i/3)*.16)}))};}
function build(T,b,base=0,sign){const root=new T.Group();root.name='Velvet Jester · neon VIP nightclub';const p=plan(b),buckets=new Map(),tmp=new T.Object3D(),tint=new T.Color();
 const mat=(c,e={})=>new T.MeshStandardMaterial({color:c,roughness:.6,...e}),dark=mat('#10111c'),black=mat('#22212b'),pink=mat('#9e246e'),gold=mat('#a39474',{metalness:.5,roughness:.3}),silver=mat('#84999f',{metalness:.55,roughness:.3}),glass=mat('#b3b9dc',{transparent:true,opacity:.16,depthWrite:false}),purple=new T.MeshBasicMaterial({color:'#a53ee5'}),cyan=new T.MeshBasicMaterial({color:'#3e9dff'}),magenta=new T.MeshBasicMaterial({color:'#ff3aaf'}),white=new T.MeshBasicMaterial({color:'#d6eaff'}),product=mat('#ffffff');
 const cube=new T.BoxGeometry(1,1,1),cyl=new T.CylinderGeometry(1,1,1,12),ring=new T.TorusGeometry(1,.018,5,48),sphere=new T.SphereGeometry(1,8,6),bottleGeo=new T.LatheGeometry([[0,0],[.6,0],[.6,2],[.25,2.6],[.25,3.5],[0,3.5]].map(a=>new T.Vector2(...a)),8);
 function inst(g,m,x,y,z,sx=1,sy=1,sz=1,c,rot){if(!buckets.has(g))buckets.set(g,new Map());const by=buckets.get(g);if(!by.has(m))by.set(m,[]);tmp.position.set(x,base+y,z);tmp.scale.set(sx,sy,sz);tmp.rotation.set(...(rot||[0,0,0]));tmp.updateMatrix();by.get(m).push({matrix:tmp.matrix.clone(),c});}
 const box=(m,w,h,d,x,y,z,c)=>inst(cube,m,x,y,z,w,h,d,c),mid=b.x+b.w/2,center=b.y+b.h*.58;
 box(dark,b.w-6,.2,b.h-6,mid,1,b.y+b.h/2);
 // Polished dark tiles with pink/blue runway seams, and an open central dance floor.
 for(let x=b.x+8;x<b.x+b.w-4;x+=12)box(black,.15,.05,b.h-6,x,1.12,b.y+b.h/2);
 for(let z=b.y+8;z<b.y+b.h-4;z+=12)box(black,b.w-6,.05,.15,mid,1.12,z);
 inst(cyl,black,mid,1.3,center,b.w*.22,.25,b.h*.24);
 for(let i=0;i<12;i++){const a=i*2.4;inst(cyl,i%2?magenta:cyan,mid+Math.cos(a)*b.w*.16,1.47,center+Math.sin(a)*b.h*.17,1.3,.04,1.3);}
 // DJ platform, controller decks, laptop screens and flanking speaker stacks.
 const s=p.stage,x=s.x+s.w/2,z=s.y+s.h/2;box(black,s.w,3,s.h,x,2.5,z);box(magenta,s.w,.3,1,x,4.2,s.y+s.h);
 box(dark,s.w*.66,10,7,x,9,z);box(purple,s.w*.66-2,5,.3,x,10,z+3.7);box(silver,s.w*.7,.7,8,x,14.5,z);
 for(const side of [-1,1]){const xx=x+side*s.w*.2;box(black,11,.7,6,xx,15.2,z);inst(cyl,silver,xx,15.7,z,2.2,.3,2.2);box(black,9,5,.6,xx,19,z-3);box(cyan,7,3.5,.15,xx,19,z-2.6);const sx=x+side*(s.w/2+5);box(dark,8,26,7,sx,16,b.y+11);for(const yy of [9,18])inst(cyl,black,sx,yy,b.y+14.6,2.6,.4,2.6,null,[Math.PI/2,0,0]);}
 // Original LED wall: abstract magenta/cyan equalizer, not copied concert branding.
 box(black,b.w*.54,19,.8,mid,34,b.y+3.6);
 for(let i=0;i<30;i++){const h=3+(i*7%14);box(i%3?purple:cyan,b.w*.014,h,.3,mid-b.w*.24+i*b.w*.016,33,b.y+4.2);}
 // Reference-inspired concentric ceiling LEDs and radial ribs around a compact chandelier.
 for(let i=0;i<5;i++){const r=Math.min(b.w,b.h)*(.13+i*.055);inst(ring,i%2?cyan:magenta,mid,46-i*.3,center,r,r,r,null,[Math.PI/2,0,0]);}
 for(let i=0;i<32;i++){const a=i*Math.PI/16,r=Math.min(b.w,b.h)*.20;inst(cube,i%4?gold:purple,mid+Math.cos(a)*r,47,center+Math.sin(a)*r,Math.min(b.w,b.h)*.28,.18,.25,null,[0,-a,0]);}
 inst(cyl,silver,mid,44,center,2.5,2,2.5);for(let i=0;i<12;i++){const a=i*Math.PI/6;box(gold,.2,5,.2,mid+Math.cos(a)*4,41,center+Math.sin(a)*4);inst(sphere,magenta,mid+Math.cos(a)*4,38.5,center+Math.sin(a)*4,.6,1.4,.6);}
 // Pink velvet booth pockets with dark tufted backs and small bottle-service tables.
 for(const [i,r]of p.booths.entries()){const x=r.x+r.w/2,z=r.y+r.h/2,side=x<mid?-1:1;
  box(black,r.w,9,r.h,x,5.5,z);box(pink,r.w-2,2,r.h-3,x,10,z);box(black,2,12,r.h,x+side*(r.w/2-1),14,z);box(pink,1,8,r.h-2,x+side*(r.w/2-2.2),15,z);
  for(const end of [-1,1])box(pink,r.w,8,2,x,14,z+end*(r.h/2-1));
  for(let n=0;n<6;n++)inst(sphere,gold,x+side*(r.w/2-2.9),15,z-r.h*.35+n*r.h*.14,.15,.2,.2);
  const tx=x-side*2;box(silver,6,.6,9,tx,14.6,z);box(dark,1,4,1,tx,12,z);for(const dx of [-1.5,1.5])inst(bottleGeo,product,tx+dx,15,z,.55,.55,.55,i%2?'#b87a35':'#5e8660');
  box(i%2?cyan:magenta,r.w,.4,r.h,x,1.8,z);
 }
 // Back-left bottle bar and glowing cubby wall.
 const r=p.bar,bx=r.x+r.w/2,bz=r.y+r.h/2;box(dark,r.w,12,r.h,bx,7,bz);box(gold,r.w+1,1,r.h+1,bx,13.5,bz);
 for(let row=0;row<3;row++){const yy=19+row*6;box(purple,r.w,.4,5,bx,yy,b.y+5);for(let i=0;i<Math.floor(r.w/3);i++)inst(bottleGeo,product,r.x+2+i*3,yy+.4,b.y+5,.7,.7,.7,['#a87e41','#648861','#b7bdd1'][i%3]);}
 // Balcony-style side fascia and glass rails are scenic, not a traversable upper floor.
 for(const side of [-1,1]){const xx=b.x+(side<0?9:b.w-9);box(black,12,2,b.h*.56,xx,31,b.y+b.h*.62);box(purple,12,.4,b.h*.56,xx,29.7,b.y+b.h*.62);box(glass,.3,8,b.h*.56,xx-side*6,36,b.y+b.h*.62);box(silver,.5,.6,b.h*.56,xx-side*6,40,b.y+b.h*.62);for(let z=b.y+b.h*.34;z<b.y+b.h*.91;z+=12)box(silver,.5,9,.5,xx-side*6,35.5,z);}
 // Visible theatrical beam cones are cosmetic transparent meshes, no shadow/light cost.
 const beamGeo=new T.ConeGeometry(5,30,8,1,true),beams=new T.Group();beams.name='Decorative club light beams';const beamMat=new T.MeshBasicMaterial({color:'#5274ff',transparent:true,opacity:.055,depthWrite:false,side:T.DoubleSide});
 for(const side of [-1,1])for(let i=0;i<3;i++){const m=new T.Mesh(beamGeo,beamMat);m.position.set(mid+side*b.w*(.1+i*.08),29,b.y+b.h*.42);m.rotation.z=side*.35;m.userData.noBatch=true;beams.add(m);}root.add(beams);
 if(sign)sign(root,'THE VELVET JESTER · LIVE DJ',Math.min(b.w*.6,130),4,mid,45,b.y+4.5,'#f5a9e3');
 for(const [g,groups]of buckets)for(const [m,items]of groups){const mesh=new T.InstancedMesh(g,m,items.length);mesh.userData.noBatch=true;items.forEach((a,i)=>{mesh.setMatrixAt(i,a.matrix);if(a.c)mesh.setColorAt(i,tint.set(a.c));});root.add(mesh);}
 root.userData.nightclub={booths:p.booths.length,dancers:p.dancers.length,drawBatches:root.children.length};return {root,plan:p,solids:p.solids};
}
const api={matches,plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29Nightclub=api;
})();
