'use strict';
(function(){
function plan(b){const cx=b.x+b.w/2,front=b.x+b.w-76,depth=(b.h-106)/2,cells=[0,1].map(i=>({x:front,y:b.y+94+i*(depth+4),w:64,h:depth}));const counter={x:cx-22,y:b.y+65,w:b.w-100,h:20},seats=[28,49,70].map(x=>({x:b.x+x,y:b.y+b.h-38})),lockers=[{x:b.x+27,y:b.y+110,w:30,h:18},{x:b.x+27,y:b.y+141,w:30,h:18}];const solids=[...cells.map(c=>({x:c.x-3,y:c.y-1,w:c.w+4,h:c.h+2,kind:'secured cell'})),{x:counter.x-counter.w/2,y:counter.y-10,w:counter.w,h:20,kind:'reception'},...seats.map(s=>({x:s.x-8,y:s.y-8,w:16,h:16,kind:'seat'})),...lockers.map(l=>({x:l.x-l.w/2,y:l.y-9,w:l.w,h:18,kind:'locker'})),{x:b.x+b.w-28,y:b.y+28,w:14,h:15,kind:'planter'}];
 const actors=[{x:front+32,z:cells[0].y+depth/2},{x:front+30,z:cells[1].y+depth*.34},{x:front+33,z:cells[1].y+depth*.68}];return {cells,counter,seats,lockers,solids,actors,staff:{x:cx,y:b.y+35},service:{x:cx,y:b.y+b.h*.65},entry:{x:cx,y:b.y+b.h-16},corridor:{x:front-19,y:b.y+150}};}
function build(T,b,base=0){const root=new T.Group();root.name='Police station · public reception and secure cell wing';root.userData.noBatch=true;const p=plan(b),batches=new Map(),textures=[];
 const texture=kind=>{if(typeof document==='undefined')return null;const c=document.createElement('canvas');c.width=512;c.height=256;const a=c.getContext('2d');if(!a)return null;
 if(kind==='block'){a.fillStyle='#d1cebc';a.fillRect(0,0,512,256);for(let row=0;row<8;row++)for(let col=-1;col<9;col++){const x=col*64+(row%2)*32,y=row*32;a.fillStyle=['#dbd8c7','#dedbcc','#d4d2c3'][(row+col+9)%3];a.fillRect(x+1,y+1,62,30);}a.strokeStyle='#bab8aa';a.lineWidth=1;for(let y=0;y<=256;y+=32){a.beginPath();a.moveTo(0,y);a.lineTo(512,y);a.stroke();}}
 else if(kind==='sign'){a.fillStyle='#14394d';a.fillRect(0,0,512,256);a.textAlign='center';a.fillStyle='#eff1df';a.font='bold 67px sans-serif';a.fillText('POLICE',256,89);a.font='25px sans-serif';a.fillText('PUBLIC ENQUIRIES',256,137);a.font='20px sans-serif';a.fillText('CAPTAIN SMITH · U TO SPEAK',256,187);a.fillStyle='#c2a36e';a.fillRect(25,216,462,3);}
 else if(kind==='notice'){a.fillStyle='#ebe6d5';a.fillRect(0,0,512,256);a.fillStyle='#193e54';a.font='bold 27px sans-serif';a.fillText('COMMUNITY INFORMATION',25,39);for(let i=0;i<4;i++){a.fillStyle=['#cbdfde','#e9d8a8','#c9d2e1','#dacbc1'][i];a.fillRect(20+i*123,64,112,170);a.fillStyle='#36505d';a.font='bold 15px sans-serif';a.fillText(['HELP','SAFETY','REPORT','CONTACT'][i],27+i*123,91);for(let j=0;j<8;j++)a.fillRect(28+i*123,108+j*13,85-(j%3)*12,2);}}
 else{a.fillStyle='#102831';a.fillRect(0,0,512,256);a.fillStyle='#accac8';a.font='bold 28px monospace';a.fillText('DISPATCH · DUTY LOG',25,45);for(let j=0;j<6;j++){a.fillStyle=j%2?'#27434b':'#1a353d';a.fillRect(18,62+j*29,476,26);a.fillStyle='#9abbb8';a.font='16px monospace';a.fillText('29-'+(100+j)+'   STATUS: STANDING BY',30,81+j*29);}}
 const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;if(kind==='block'){t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(2,2);}textures.push(t);return t;};
 const linear=m=>{m.color.convertSRGBToLinear();return m;},mat=(color,extra={})=>linear(new T.MeshStandardMaterial({color,roughness:.76,...extra})),basic=(color,extra={})=>linear(new T.MeshBasicMaterial({color,...extra}));
 const ivory=mat('#e4e2d7'),blue=mat('#25445e'),wood=mat('#b18f64'),dark=mat('#263139'),iron=mat('#35403f',{metalness:.55,roughness:.47}),rust=mat('#826a4b',{metalness:.4}),steel=mat('#9da7a5',{metalness:.62,roughness:.38}),floor=mat('#a4a7a0',{roughness:.5}),grout=mat('#737f80'),block=mat('#ffffff',{map:texture('block')}),bunk=mat('#637969'),sheet=mat('#b1b5a4'),black=mat('#202b32'),glass=mat('#b3d4cf',{transparent:true,opacity:.17,depthWrite:false,roughness:.14}),glow=basic('#fff8e7'),green=mat('#3d6845'),sign=basic('#ffffff',{map:texture('sign')}),notice=basic('#ffffff',{map:texture('notice')}),screen=basic('#ffffff',{map:texture('screen')});
 const unit=new T.BoxGeometry(1,1,1),cyl=new T.CylinderGeometry(1,1,1,12),sphere=new T.SphereGeometry(1,10,8),plane=new T.PlaneGeometry(1,1),torus=new T.TorusGeometry(1,.12,5,16),dummy=new T.Object3D();
 const E=(geo,m,w,h,d,x,y,z,rx=0,ry=0,rz=0)=>{if(!batches.has(m))batches.set(m,new Map());const by=batches.get(m);if(!by.has(geo))by.set(geo,[]);by.get(geo).push({w,h,d,x,y:base+y,z,rx,ry,rz});},B=(w,h,d,x,y,z,m)=>E(unit,m,w,h,d,x,y,z),C=(r,h,rz,x,y,z,m)=>E(cyl,m,r,h,rz,x,y,z),P=(m,w,h,x,y,z,ry=0)=>E(plane,m,w,h,1,x,y,z,0,ry),cx=b.x+b.w/2,cz=b.y+b.h/2;
 B(b.w-7,.12,b.h-7,cx,1.02,cz,floor);for(let x=b.x+8;x<b.x+b.w-4;x+=20)B(.15,.06,b.h-8,x,1.12,cz,grout);for(let z=b.y+8;z<b.y+b.h-4;z+=20)B(b.w-8,.06,.15,cx,1.12,z,grout);B(42,.05,18,cx,1.19,b.y+b.h-17,dark);
 for(const side of [-1,1]){const x=b.x+(side<0?3.4:b.w-3.4);B(.6,48,b.h-6,x,25,cz,ivory);B(1.1,4,b.h-6,x,3,cz,blue);}B(b.w-6,48,.6,cx,25,b.y+3.4,ivory);B(b.w-7,.3,b.h-7,cx,50.3,cz,ivory);
 for(let x=b.x+8;x<b.x+b.w-4;x+=24)B(.22,.2,b.h-8,x,50,cz,steel);for(let z=b.y+8;z<b.y+b.h-4;z+=24)B(b.w-8,.2,.22,cx,50,z,steel);for(const dx of [-76,0,76])for(const zz of [36,102,171]){B(20,.5,10,cx+dx,49.5,b.y+zz,steel);B(18,.14,8,cx+dx,49.15,b.y+zz,glow);}
 // Public enquiries counter: timber front, transaction ledge, framed glass and pass-through slots.
 const t=p.counter;B(t.w,13,20,t.x,7.5,t.y,wood);B(t.w+2,1.2,22,t.x,14.6,t.y,wood);B(t.w,.8,1,t.x,3,t.y+10.2,blue);
 for(let i=0;i<4;i++){const x=t.x-t.w/2+(i+.5)*t.w/4;B(t.w/4-1,11,.5,x,8,t.y+10.3,ivory);B(1,30,1,x-t.w/8,30,t.y,steel);B(t.w/4-1,25,.4,x,30,t.y,glass);B(t.w/4-1,1,1,x,43,t.y,steel);B(12,1,1,x,17,t.y,steel);}
 P(sign,58,13,t.x,34,t.y+1.2);P(notice,47,23,b.x+4.3,31,b.y+137,Math.PI/2);
 for(const dx of [-40,28]){B(12,9,1,t.x+dx,21,t.y-5,black);P(screen,10.5,7.5,t.x+dx,21,t.y-4.4);B(1,4,1,t.x+dx,15,t.y-5,steel);B(11,.4,4,t.x+dx,15.5,t.y+1,dark);}
 for(const dx of [-57,56]){B(8,5,5,t.x+dx,18,t.y+4,blue);for(let i=0;i<4;i++){B(5.8,.25,6,t.x+dx,20+i*.5,t.y+4,sheet);}}
 // Staff access door rendered behind reception; existing side route to Captain Smith is kept open.
 B(23,39,1,b.x+b.w-42,21,b.y+4.3,blue);B(9,16,1.2,b.x+b.w-42,27,b.y+4.9,glass);B(1,4,1,b.x+b.w-49,19,b.y+5.5,steel);
 // Reception seating and secure cabinets remain out of the center service lane.
 for(const s of p.seats){B(16,2,15,s.x,8,s.y,blue);B(16,12,2,s.x,15,s.y-6,blue);for(const dx of [-6,6])for(const dz of [-5,5])B(.7,7,.7,s.x+dx,4.5,s.y+dz,steel);}
 for(const [i,l]of p.lockers.entries()){B(l.w,28,18,l.x,15,l.y,steel);for(const dx of [-7,7]){B(12,25,.5,l.x+dx,15,l.y+9.4,blue);B(1,5,.6,l.x+dx+4,15,l.y+9.9,steel);for(let y=23;y<27;y+=1)B(8,.3,.6,l.x+dx,y,l.y+9.8,dark);}B(18,2,.6,l.x,31,l.y+9.4,ivory);}
 const px=b.x+b.w-21,pz=b.y+35;C(6.5,9,6.5,px,5.5,pz,ivory);for(let i=0;i<9;i++){const a=i*2.4;E(sphere,green,2,6,1.2,px+Math.cos(a)*4,16+(i%3)*3,pz+Math.sin(a)*4,0,a,.4);}
 // Two secure cells facing the lobby-side corridor. Solid full footprints are intentional: captives cannot be freed.
 for(const [i,c]of p.cells.entries()){const front=c.x,back=c.x+c.w,z=c.y+c.h/2;
 B(c.w,.14,c.h,front+c.w/2,1.22,z,grout);B(2,46,c.h,back,24,z,block);for(const zz of [c.y,c.y+c.h])B(c.w,46,2,front+c.w/2,24,zz,block);
 for(let zz=c.y+2;zz<c.y+c.h-1;zz+=2.8){C(.4,39,.4,front,21,zz,iron);}for(const y of [2,15,29,42])B(1.2,1.2,c.h,front,y,z,iron);for(const zz of [c.y+1,c.y+c.h-1])B(2.8,46,2.8,front,24,zz,iron);
 // Door frame, reinforced rectangular gate panel, handle, hinges and feeding slot on the corridor face.
 const dz=z;for(const zz of [dz-12,dz+12])B(2,41,1.8,front-.8,22,zz,rust);for(const y of [3,41])B(2,1.7,25,front-.8,y,dz,rust);B(1,11,9,front-1.5,24,dz+7,rust);B(1.3,1,8,front-1.6,12,dz,iron);B(1.8,5,1,front-2.2,24,dz+7,iron);for(const yy of [8,34])C(.9,4,.9,front-1,yy,dz-12,steel);
 for(let n=0;n<i+1;n++)B(.4,3,.55,front-1.8,44,z-1.5+n*2,ivory);
 // Two bunks along the back wall, a ladder and steel combination sink/toilet unit.
 for(const yy of [7,28]){B(17,1.2,c.h-8,back-11,yy,z,iron);B(16,2,c.h-9,back-11,yy+1.8,z,bunk);B(14,1.5,8,back-11,yy+3.3,c.y+10,sheet);B(14,.5,c.h*.45,back-11,yy+3,c.y+c.h*.65,bunk);}for(const zz of [c.y+4,c.y+c.h-4])B(.8,35,.8,back-19,19,zz,iron);for(const dz of [-5.5,5.5])B(1,30,1,back-20,17,z+dz,iron);for(let yy=5;yy<30;yy+=4)B(1,1,11,back-20,yy,z,iron);
 C(4.2,7,4.2,front+15,5,c.y+10,steel);E(sphere,ivory,4.7,.7,4.7,front+15,9,c.y+10);B(9,11,5,front+15,7,c.y+4,steel);B(9,.7,6,front+15,13,c.y+4,ivory);B(.5,3,.5,front+15,15,c.y+2,steel);
 // Small vent, drain and lower block courses accent the institutional room surfaces.
 B(.6,6,9,back-1.3,35,z,steel);for(let k=0;k<6;k++)B(.7,.3,8,back-1.7,32.7+k*.9,z,dark);C(2,.06,2,front+28,1.36,z,steel);for(let j=-1;j<=1;j++)B(3,.07,.16,front+28,1.42,z+j*.7,dark);
 }
 for(const [m,geos]of batches)for(const [geo,list]of geos){const mesh=new T.InstancedMesh(geo,m,list.length);mesh.name='Police · '+(m===glass?'reception glazing':m===block?'cell block walls':'instanced fittings');list.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.rotation.set(v.rx,v.ry,v.rz);dummy.scale.set(v.w,v.h,v.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.frustumCulled=false;mesh.userData.noBatch=true;root.add(mesh);}
 root.userData.police={cells:p.cells.length,bunks:4,actors:p.actors.length,textures:textures.length};return {root,solids:p.solids,plan:p};
}
const api={plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29PoliceInterior=api;
})();
