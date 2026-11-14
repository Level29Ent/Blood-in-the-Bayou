'use strict';
(function(){
function plan(b){const cx=b.x+b.w/2,vx=b.x+61,vz=b.y+102;const solids=[{x:b.x+5,y:b.y+5,w:105,h:7,kind:'deposit wall'},{x:b.x+5,y:b.y+7,w:7,h:94,kind:'deposit wall'},{x:b.x+103,y:b.y+7,w:7,h:94,kind:'vault side'},{x:b.x+5,y:vz-3,w:34,h:6,kind:'vault face'},{x:b.x+83,y:vz-3,w:27,h:6,kind:'vault face'},{x:b.x+92,y:vz+1,w:10,h:47,kind:'open vault door'}];
 const tellers=[48,82,116].map(z=>({x:b.x+b.w-48,y:b.y+z}));for(const t of tellers)solids.push({x:t.x-14,y:t.y-16,w:28,h:32,kind:'teller'});
 const seats=[{x:b.x+27,y:b.y+b.h-40},{x:b.x+48,y:b.y+b.h-40},{x:b.x+69,y:b.y+b.h-40}];for(const s of seats)solids.push({x:s.x-8,y:s.y-8,w:16,h:16,kind:'waiting seat'});
 const office={x:b.x+b.w-48,y:b.y+b.h-46};solids.push({x:office.x-23,y:b.y+145.8,w:46,h:.4,kind:'office glass'},{x:office.x-23,y:office.y-15,w:46,h:17,kind:'desk'},{x:office.x-5,y:office.y+6,w:13,h:13,kind:'office chair'},{x:b.x+b.w-83,y:b.y+152,w:1.5,h:21,kind:'office glass'},{x:b.x+b.w-83,y:b.y+204,w:1.5,h:14,kind:'office glass'});
 const valuables={x:b.x+30,y:b.y+57,w:26,h:43};solids.push({...valuables,x:valuables.x-13,y:valuables.y-21.5,kind:'valuables table'});
 return {valuables,solids,tellers,seats,office,vault:{x:vx,y:vz},entry:{x:cx,y:b.y+b.h-16},service:{x:cx,y:b.y+b.h*.65},staff:{x:cx,y:b.y+42},deposits:{x:vx,y:b.y+34}};}
function build(T,b,base=0){const root=new T.Group();root.name='Trust Bank · brass teller hall and open deposit vault';root.userData.noBatch=true;const p=plan(b),batches=new Map(),textures=[];
 const texture=kind=>{if(typeof document==='undefined')return null;const c=document.createElement('canvas');c.width=512;c.height=256;const a=c.getContext('2d');if(!a)return null;a.fillStyle=kind==='screen'?'#102d42':'#173d50';a.fillRect(0,0,512,256);a.fillStyle='#ecd6a0';a.textAlign='center';a.font='bold 48px Georgia';a.fillText('TRUST BANK',256,70);a.font='22px sans-serif';a.fillText(kind==='screen'?'ACCOUNTS · CUSTOMER SERVICES':'DEPOSITS · SAVINGS · PRIVATE BANKING',256,121);a.strokeStyle='#bda36c';a.lineWidth=2;a.strokeRect(10,10,492,236);a.font='18px sans-serif';a.fillText(kind==='screen'?'FICTIONAL GAME CURRENCY':'SAFE DEPOSIT · EST. 1929',256,199);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;textures.push(t);return t;};
 const linear=m=>{m.color.convertSRGBToLinear();return m;},mat=(color,extra={})=>linear(new T.MeshStandardMaterial({color,roughness:.65,...extra})),basic=(color,extra={})=>linear(new T.MeshBasicMaterial({color,...extra}));
 const brass=mat('#be9157',{metalness:.72,roughness:.32}),steel=mat('#879799',{metalness:.65,roughness:.4}),dark=mat('#263441'),wood=mat('#5c3827'),oak=mat('#ad8255'),cream=mat('#e4ddcc'),white=mat('#f0eae0'),blue=mat('#276987'),black=mat('#20272c'),red=mat('#84313c'),glass=mat('#a4ccce',{transparent:true,opacity:.19,depthWrite:false,roughness:.13}),glow=basic('#fff0c5'),sign=basic('#ffffff',{map:texture('sign')}),screen=basic('#ffffff',{map:texture('screen')});
 const unit=new T.BoxGeometry(1,1,1),cyl=new T.CylinderGeometry(1,1,1,20),sphere=new T.SphereGeometry(1,12,8),plane=new T.PlaneGeometry(1,1),ring=new T.TorusGeometry(1,.07,8,40),dummy=new T.Object3D();
 const E=(geo,m,w,h,d,x,y,z,rx=0,ry=0,rz=0)=>{if(!batches.has(m))batches.set(m,new Map());const by=batches.get(m);if(!by.has(geo))by.set(geo,[]);by.get(geo).push({w,h,d,x,y:y+base,z,rx,ry,rz});},B=(w,h,d,x,y,z,m)=>E(unit,m,w,h,d,x,y,z),C=(r,h,rz,x,y,z,m)=>E(cyl,m,r,h,rz,x,y,z),P=(m,w,h,x,y,z,ry=0)=>E(plane,m,w,h,1,x,y,z,0,ry),cx=b.x+b.w/2,cz=b.y+b.h/2;
 B(b.w-7,.16,b.h-7,cx,1.05,cz,cream);for(let x=b.x+8;x<b.x+b.w;x+=24)B(.18,.05,b.h-8,x,1.16,cz,steel);for(let z=b.y+8;z<b.y+b.h;z+=24)B(b.w-8,.05,.18,cx,1.16,z,steel);
 for(const side of [-1,1]){const x=b.x+(side<0?3.5:b.w-3.5);B(.8,48,b.h-6,x,25,cz,cream);B(1.1,10,b.h-6,x,6,cz,wood);B(1.5,.8,b.h-6,x,12,cz,brass);for(const zz of [34,90,147,201]){B(4,46,4,x+(side<0?3:-3),24,b.y+zz,white);for(const yy of [3,45])B(6,2,6,x+(side<0?3:-3),yy,b.y+zz,cream);}}
 B(b.w-6,48,1,cx,25,b.y+3.5,white);B(b.w-6,.3,b.h-6,cx,50.4,cz,cream);for(let z=b.y+12;z<b.y+b.h;z+=28){B(b.w-8,.5,1,cx,49.9,z,white);for(const dx of [-b.w*.25,0,b.w*.25]){B(18,.6,11,cx+dx,49.2,z,steel);B(16,.15,9,cx+dx,48.8,z,glow);}}
 P(sign,93,17,cx+20,37,b.y+4.3);
 // Rear-left safe-deposit chamber, entered through an actual clear circular opening.
 const vx=p.vault.x,vz=p.vault.y;
 B(98,.12,88,b.x+57,1.25,b.y+54,red);B(7,48,94,b.x+8.5,25,b.y+54,steel);B(7,48,94,b.x+106.5,25,b.y+54,steel);B(105,48,7,b.x+57.5,25,b.y+8.5,steel);
 for(const [x,w]of [[b.x+22,34],[b.x+96.5,27]])B(w,48,6,x,25,vz,steel);
 // The ring lies in the XY plane, its bottom above the existing floor; no collision disk in the opening.
 E(ring,brass,23,23,23,vx,25.4,vz+1);E(ring,dark,21,21,21,vx,25.4,vz+1.4);E(ring,steel,19.8,19.8,19.8,vx,25.4,vz+1.7);
 for(let i=0;i<20;i++){const a=i*Math.PI/10;E(unit,brass,2.6,5,3,vx+Math.cos(a)*21.4,25.4+Math.sin(a)*21.4,vz+2,0,0,a-Math.PI/2);}
 // Hinged-open door parks alongside the opening, rather than sealing it with a decorative solid safe.
 const door=new T.Group();door.name='Open circular bank vault door';door.position.set(b.x+97,base+26.3,vz+25);door.rotation.y=-Math.PI/2;root.add(door);
 // Recessed brushed-steel face, deep rim, mechanical radial boltwork and paired hinge barrels.
 const brushed=mat('#9ba8ab',{metalness:.78,roughness:.34}),machined=mat('#59666d',{metalness:.8,roughness:.28});
 const doorPart=(geo,m,x,y,z,rx=0,ry=0,rz=0)=>{const mesh=new T.Mesh(geo,m);mesh.position.set(x,y,z);mesh.rotation.set(rx,ry,rz);door.add(mesh);return mesh;};
 doorPart(new T.CylinderGeometry(23,23,7,48),machined,0,0,0,Math.PI/2);
 doorPart(new T.CylinderGeometry(21.8,21.8,.6,48),brushed,0,0,3.9,Math.PI/2);
 doorPart(new T.CylinderGeometry(17.8,17.8,.5,48),steel,0,0,4.55,Math.PI/2);
 for(const radius of [18.4,21.3])doorPart(new T.TorusGeometry(radius,.32,8,48),brass,0,0,4.9);
 for(let i=0;i<16;i++){const a=i*Math.PI/8,dx=Math.cos(a),dy=Math.sin(a);doorPart(new T.CylinderGeometry(1.15,1.15,5,10),brushed,dx*22,dy*22,0,0,0,a-Math.PI/2);doorPart(new T.CylinderGeometry(.65,.65,.7,6),dark,dx*20,dy*20,4.6,Math.PI/2);}
 for(let i=0;i<8;i++){const a=i*Math.PI/4;doorPart(new T.BoxGeometry(12,.9,1),machined,Math.cos(a)*11,Math.sin(a)*11,5.2,0,0,a);}
 doorPart(new T.CylinderGeometry(2.6,2.6,2,20),brass,0,0,6,Math.PI/2);
 doorPart(new T.TorusGeometry(6,.5,8,32),brushed,0,0,7.5);
 for(let i=0;i<5;i++){const a=i*Math.PI*2/5;doorPart(new T.BoxGeometry(6,.55,.6),brushed,Math.cos(a)*3,Math.sin(a)*3,7.3,0,0,a);}
 doorPart(new T.BoxGeometry(5.5,7,.8),dark,-10,3,5.3);doorPart(new T.CylinderGeometry(1.5,1.5,1.2,24),brushed,-10,3,6.1,Math.PI/2);
 for(let i=0;i<12;i++){const a=i*Math.PI/6;doorPart(new T.BoxGeometry(.16,.55,.1),white,-10+Math.sin(a)*1.25,3+Math.cos(a)*1.25,6.8,0,0,-a);}
 for(const y of [12,39]){B(6,8,7,b.x+97,y,vz+2,machined);C(2.5,10,2.5,b.x+97,y,vz+5,brushed);for(const dy of [-4,4])C(2.8,.6,2.8,b.x+97,y+dy,vz+5,brass);}
 // Subtle lathe rings avoid a uniformly flat disk without adding lights or image downloads.
 for(let i=0;i<7;i++)doorPart(new T.TorusGeometry(8+i*1.25,.035,4,48),machined,0,0,4.86);
 // Valuables remain physical display props: no new rewards or changes to bank/heist economy.
 const table=p.valuables,tx=table.x,tz=table.y,cash=mat('#a6b394'),paper=mat('#dedac0'),band=mat('#b6a6c2'),velvet=mat('#253c48'),gold=mat('#e3b658',{metalness:.72,roughness:.24}),gem=mat('#83c9dd',{metalness:.12,roughness:.14});
 B(26,1.6,43,tx,14,tz,wood);B(25,.2,42,tx,14.95,tz,velvet);for(const dx of [-10,10])for(const dz of [-18,18])B(1.6,12,1.6,tx+dx,7,tz+dz,steel);B(21,1,1,tx,5,tz,steel);
 let bundles=0;for(let row=0;row<5;row++)for(let col=0;col<3;col++){const x=tx-8+col*7.8,z=tz-16+row*5;const count=2+(row+col)%4;for(let stack=0;stack<count;stack++){const y=15.5+stack*.95;B(6.7,.85,3.4,x,y,z,paper);B(6.5,.08,3.2,x,y+.46,z,cash);B(1.5,.96,3.5,x,y,z,band);for(const side of [-1,1])B(1.4,.03,2.1,x+side*2.1,y+.51,z,velvet);bundles++;}}
 // Jewelry trays: necklace links, bracelets, rings, faceted gems and gold watches.
 for(const dx of [-6.5,6.5]){B(11,.45,11,tx+dx,15.3,tz+13.5,brass);B(10,.2,10,tx+dx,15.65,tz+13.5,black);}
 for(let i=0;i<22;i++){const a=i*Math.PI/11;E(ring,gold,.55,.75,.55,tx-6.5+Math.cos(a)*3.3,16,tz+13+Math.sin(a)*3.8,Math.PI/2,i%2*.55);}
 const facetedGem=new T.OctahedronGeometry(1,0);for(let i=0;i<7;i++){const x=tx+3.4+(i%3)*2.6,z=tz+10+Math.floor(i/3)*3;E(ring,gold,.8,.8,.8,x,16,z,Math.PI/2);E(facetedGem,gem,.6,.6,.6,x,16.75,z);}
 for(const dz of [-3,2]){E(ring,gold,1.4,1.4,1.4,tx+7.5,16,tz+dz+8,Math.PI/2);}
 B(2.6,.5,5,tx-10,15.7,tz+6,gold);C(1.4,.7,1.4,tx-10,16,tz+6,brushed);C(1.1,.1,1.1,tx-10,16.4,tz+6,dark);
 // Hundreds of shallow metal safe-deposit fronts; tiny handles and keyholes are instanced.
 let boxes=0;for(const side of [-1,1])for(let col=0;col<11;col++)for(let row=0;row<7;row++){const x=b.x+(side<0?12.6:102.4),z=b.y+16+col*7.2,y=5+row*5.8;B(.8,5.3,6.7,x,y,z,steel);B(1.1,.5,2,x-side*.6,y,z,brass);B(1.15,.65,.45,x-side*.7,y,z+1.9,dark);boxes++;}
 for(let col=0;col<12;col++)for(let row=0;row<7;row++){const x=b.x+16+col*7.2,y=5+row*5.8;B(6.7,5.3,.8,x,y,b.y+12.6,steel);B(2,.5,1,x,y,b.y+13.2,brass);B(.45,.65,1.1,x+1.9,y,b.y+13.3,dark);boxes++;}
 // Brass teller screens, dark timber panels, pale stone tops and small arched service windows.
 for(const [i,t]of p.tellers.entries()){B(28,12,32,t.x,7,t.y,wood);B(30,1.5,33,t.x,13.8,t.y,cream);B(1,22,31,t.x-13,26,t.y,glass);for(const dz of [-16,16])B(1.4,29,1.4,t.x-13,29,t.y+dz,brass);B(1.4,1.4,32,t.x-13,43,t.y,brass);
  for(let k=0;k<10;k++){const a=k*Math.PI/9;E(unit,brass,1,1.1,3.8,t.x-13.7,24+Math.sin(a)*9,t.y+Math.cos(a)*9,Math.PI/2-a);}B(2,2,18,t.x-14.2,17,t.y,brass);B(18,1,1,t.x-14.2,17,t.y,cream);B(.5,8,9,t.x-5,23,t.y,dark);P(screen,8,7,t.x-5.3,23,t.y,-Math.PI/2);B(9,.5,5,t.x-5,15,t.y+7,dark);B(6,.4,8,t.x+4,15,t.y+6,white);
  for(const side of [-1,1]){B(.6,8,26,t.x+side*12.8,7,t.y,brass);B(24,8,.6,t.x,7,t.y+side*14.8,oak);}E(sphere,glow,2,1.8,2,t.x-5,23,t.y-9);C(.4,7,.4,t.x-5,18,t.y-9,brass);}
 const chair=(x,z,m,angle=0)=>{E(unit,m,16,2,15,x,8,z,0,angle);E(unit,m,16,13,2,x,15,z-6,0,angle);for(const dx of [-6,6])for(const dz of [-5,5])B(.8,7,.8,x+dx,4.5,z+dz,steel);for(const dx of [-8,8])B(1,1,14,x+dx,12,z,steel);};for(const s of p.seats)chair(s.x,s.y,black);
 // Modern consultation suite: frosted band glass, desk, computer and a warm lounge seat.
 const o=p.office;B(46,1.6,17,o.x,13,o.y-6.5,oak);for(const dx of [-19,19])B(2,12,14,o.x+dx,7,o.y-6.5,white);B(12,9,1,o.x,19,o.y-7,dark);P(screen,10.5,7.5,o.x,19,o.y-6.4);B(1,4,1,o.x,14,o.y-7,steel);chair(o.x+1.5,o.y+12.5,black);for(const [z,d]of [[b.y+162.5,21],[b.y+211,14]]){B(.5,39,d,b.x+b.w-83,21,z,glass);B(.7,9,d,b.x+b.w-83,19,z,white);B(1,1,d,b.x+b.w-83,41,z,steel);}B(46,.8,1,o.x,41,b.y+146,steel);B(46,36,.4,o.x,23,b.y+146,glass);
 root.userData.bank={depositBoxes:boxes,cashBundles:bundles,jewelryPieces:32,plan:p,textureCount:textures.length};for(const [m,geos]of batches)for(const [geo,list]of geos){const mesh=new T.InstancedMesh(geo,m,list.length);mesh.name='Bank · instanced '+(m===glass?'glass':'fixtures');list.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.rotation.set(v.rx,v.ry,v.rz);dummy.scale.set(v.w,v.h,v.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.frustumCulled=false;mesh.userData.noBatch=true;root.add(mesh);}return {root,solids:p.solids,plan:p};
}
const api={plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29BankInterior=api;
})();
