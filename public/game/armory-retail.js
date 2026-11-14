'use strict';
(function(){
// Cosmetic stock silhouettes only; inventory, unlocks and purchasing stay in the game.
function palette(T){return {
 wood:new T.MeshStandardMaterial({color:'#8d6441',roughness:.65}),
 pale:new T.MeshStandardMaterial({color:'#cfb78d',roughness:.8}),
 black:new T.MeshStandardMaterial({color:'#25292b',roughness:.5,metalness:.3}),
 steel:new T.MeshStandardMaterial({color:'#879296',roughness:.35,metalness:.65}),
 cream:new T.MeshStandardMaterial({color:'#e4ddcb',roughness:.75}),
 red:new T.MeshStandardMaterial({color:'#9a3c31'}),green:new T.MeshStandardMaterial({color:'#48644a'}),
 glass:new T.MeshStandardMaterial({color:'#b9d8d8',transparent:true,opacity:.18,depthWrite:false,roughness:.15}),
 glow:new T.MeshBasicMaterial({color:'#fff2d5'})
};}
function box(T,g,w,h,d,x,y,z,mat){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);g.add(m);return m;}
function silhouette(T,id,P){
 const g=new T.Group();g.name='Cosmetic retail stock · '+id;
 const part=(w,h,d,x,y,z,m)=>box(T,g,w,h,d,x,y,z,m);
 if(id==='pistol'){
  part(9,1.7,1.4,0,2,0,P.black);part(3,4,1.4,-2,-.5,0,P.black).rotation.z=-.2;
  part(2,.5,1.3,1,0,0,P.steel);part(.8,.6,.8,2,3,0,P.steel);
 }else{
  const wood=id==='shotgun'||id==='marksman',stock=wood?P.wood:P.black;
  part(7,3,1.6,-10,0,0,stock);part(10,2,1.8,-1,1,0,P.black);
  part(12,.8,.8,10,1.5,0,P.steel);part(5,1.7,1.9,5,.9,0,stock);
  part(2.2,3,1.2,-2,-1.4,0,P.black).rotation.z=-.25;
  if(!wood)part(2.5,4,1.2,1,-1.8,0,P.black).rotation.z=.1;
  if(id==='marksman'){part(7,1,1,-1,3.4,0,P.black);for(const x of [-3,1])part(.5,1.5,.5,x,2.7,0,P.steel);}
 }
 return g;
}
function build(T,v,parent,world,sign,P=palette(T)){
 const b=v.b,g=new T.Group();g.name='Reference gun-store retail';parent.add(g);
 const q=world.batch(g),part=(w,h,d,x,y,z,m)=>q.box(w,h,d,x,y,z,m),mid=b.x+b.w/2;
 const solid=(x,z,w,d)=>v.furniture.push({x:x-w/2,y:z-d/2,w,h:d});
 // Oak floorboards and fluorescent ceiling grid; self-lit panels add no dynamic lights.
 part(b.w-8,.25,b.h-8,mid,.85,b.y+b.h/2,P.pale);
 for(let x=b.x+8;x<b.x+b.w-4;x+=8)part(.18,.07,b.h-8,x,1.02,b.y+b.h/2,P.wood);
 for(let z=b.y+20;z<b.y+b.h-4;z+=24)part(b.w-8,.07,.15,mid,1.02,z,P.wood);
 for(let x=b.x+28;x<b.x+b.w-15;x+=48)for(let z=b.y+30;z<b.y+b.h-15;z+=48){
  part(25,.6,13,x,50,z,P.steel);part(23,.4,11,x,49.5,z,P.glow);
 }
 // Back-wall slatboard: horizontal long-gun silhouettes, hooks and stock labels.
 const board=new T.Group();board.name='Slatwall long-gun gallery';board.position.set(mid,0,b.y+5);g.add(board);
 const qb=world.batch(board),bp=(w,h,d,x,y,z,m)=>qb.box(w,h,d,x,y,z,m);
 bp(b.w-12,39,1,0,23,0,P.pale);
 for(let y=5;y<43;y+=3)bp(b.w-12,.22,1.2,0,y,.2,P.wood);
 for(const x of [-(b.w-12)/2,(b.w-12)/2])bp(1,40,2,x,23,.3,P.black);
 const columns=Math.max(2,Math.floor((b.w-20)/38)),spacing=(b.w-20)/columns;
 for(let row=0;row<3;row++)for(let col=0;col<columns;col++){
  const x=-(b.w-20)/2+spacing*(col+.5),y=16+row*10,id=['carbine','marksman','shotgun'][(col+row)%3];
  const gun=silhouette(T,id,P);gun.scale.setScalar(Math.min(.85,(spacing-5)/30));gun.position.set(x,y,2);board.add(gun);
  for(const dx of [-6,5])bp(.5,2.5,2,x+dx,y-1,1.2,P.steel);
  bp(2.3,3,.15,x-7,y-3,3,P.cream);
 }
 qb.finish();
 // Side-wall oak racks with upright long guns above low ammunition cubbies.
 const count=Math.max(5,Math.min(14,Math.floor((b.h-32)/13)));
 for(const side of [-1,1]){
  const rack=new T.Group();rack.name='Upright oak rifle rack';rack.position.set(side<0?b.x+5:b.x+b.w-5,0,b.y+b.h/2-3);rack.rotation.y=side<0?Math.PI/2:-Math.PI/2;g.add(rack);
  const qr=world.batch(rack),length=b.h-34;
  qr.box(length,39,1,0,23,0,P.wood);
  for(const y of [5,13,28,41])qr.box(length,1.4,4,0,y,1.6,P.pale);
  for(let i=0;i<count;i++){
   const x=-length/2+(i+.5)*length/count;
   // Butt-down presentation: local +X barrel rotates toward the ceiling.
   const gun=silhouette(T,i%3===0?'shotgun':'marksman',P);gun.rotation.z=Math.PI/2;gun.scale.setScalar(.83);gun.position.set(x,25,3);rack.add(gun);
   qr.box(2,3,.2,x+2,21,4.2,P.cream);
   qr.box(length/count-1,4,4,x,8,3,i%2?P.red:P.green);
   qr.box(length/count-2,1,.2,x,8,5.1,P.cream);
  }
  qr.finish();
 }
 // Rear ammo cabinets and a compact glass service counter stay behind the service pad.
 const counterZ=b.y+13,counterW=Math.min(54,b.w-76);
 part(counterW,7,12,mid,4.5,counterZ,P.wood);
 part(counterW,1,13,mid,8.5,counterZ,P.steel);
 part(counterW-2,6,.4,mid,12,counterZ+6,P.glass);
 part(counterW, .6,13,mid,15.5,counterZ,P.glass);
 for(const side of [-1,1])part(.6,7,13,mid+side*counterW/2,12,counterZ,P.steel);
 for(const x of [-counterW*.28,0,counterW*.28]){const gun=silhouette(T,'pistol',P);gun.scale.setScalar(.6);gun.rotation.x=-Math.PI/2;gun.position.set(mid+x,9.5,counterZ);g.add(gun);}
 solid(mid,counterZ,counterW,13);
 for(const side of [-1,1]){
  const w=Math.max(14,(b.w-counterW-28)/2),x=mid+side*(counterW/2+5+w/2);
  for(const y of [2,8]){
   part(w,1,9,x,y,b.y+10,P.wood);
   for(let i=0;i<4;i++){const xx=x-w*.36+i*w*.24;part(w*.19,4,6,xx,y+2.6,b.y+10,i%2?P.green:P.red);part(w*.15,1,.2,xx,y+2.6,b.y+13.1,P.cream);}
  }
  solid(x,b.y+10,w,10);
 }
 // Register and paperwork sit on the counter, not on the dealer interaction circle.
 part(7,1.5,5,mid+counterW*.28,16.5,counterZ,P.black);
 part(6,4,.8,mid+counterW*.28,19,counterZ-1,P.black);
 part(4.8,2.5,.2,mid+counterW*.28,19,counterZ-.5,P.green);
 part(7,.3,4,mid-counterW*.25,16,counterZ,P.cream);
 const label=sign(g,'AMMUNITION · SPORTING GOODS',Math.min(100,b.w-16),4,mid,46,b.y+6,'#f4e7c9');
 if(label)label.name='Retail department sign';
 q.finish();v.armoryRetail=g;return {root:g,palette:P};
}
const api={palette,silhouette,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29ArmoryRetail=api;
})();
