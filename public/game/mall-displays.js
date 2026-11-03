'use strict';
(function(){
if(typeof window==='undefined')return;
function build(s,g,base,part,m){const x=s.doorX,z=s.dir===1?s.room.y+12:s.room.y+s.room.h-12,y=base+18;
 const box=(w,h,d,dx,dy,dz,mat=m.dark)=>part(w,h,d,x+dx,y+dy,z+dz,mat);
 if(s.name==='BARBER SHOP'){for(const dx of [-20,20]){box(12,3,13,dx,-9,14);box(12,13,2,dx,-2,8);box(10,16,1,dx,5,-5,m.cream);}box(2,22,2,-s.room.w/2+6,0,0,m.gold);}
 else if(s.name==='BIKE SHOP'){for(const dx of [-18,18]){for(const dz of [-8,8]){const wheel=new THREE.Mesh(new THREE.TorusGeometry(5,.7,6,16),m.dark);wheel.rotation.y=Math.PI/2;wheel.position.set(x+dx,base+19,z+dz);g.add(wheel);}box(1,2,16,dx,1,0,m.gold);box(1,11,1,dx,5,-6,m.gold);box(6,1,3,dx,8,0);}}
 else if(s.name==='FISH AQUARIUM STORE'||s.name==='GREENTOWN PLANT STORE')return;
 else if(s.name==='FURNITURE STORE'){box(32,6,14,0,-1,0,m.cream);box(32,10,2,0,5,-7,m.wood);}
 else if(s.name==='SHOE STORE'){for(let i=0;i<5;i++){box(9,3,4,-28+i*14,0,0,m.cream);box(3,3,4,-31+i*14,3,0);}}
 else if(s.name==='BAYOU FASHION'||s.name==='LUXURY COLLECTION'){for(let i=0;i<4;i++){box(1,15,1,-24+i*16,3,0,m.gold);box(10,9,2,-24+i*16,3,0,m.cream);}}
 else if(['BOOK STORE','MAGAZINE STORE','MUSIC STORE','ART & CRAFT STORE'].includes(s.name)){for(let i=0;i<7;i++)box(4,7+i%3,6,-30+i*10,1,0,i%2?m.gold:m.cream);}
 else if(['29 CUISINE','BAYOU BURGERS','BAYOU COFFEE'].includes(s.name)){for(let i=0;i<4;i++)box(5,4,5,-22+i*15,1,0,m.cream);box(12,14,8,22,6,-2,m.dark);}
 else if(s.name==='TOY STORE'){for(let i=0;i<4;i++){box(10,4,5,-24+i*16,0,0,i%2?m.gold:m.cream);box(5,3,4,-24+i*16,3,0);}}
 else{for(let i=0;i<4;i++)box(8,6,7,-24+i*16,0,0,i%2?m.gold:m.cream);}
}
function foodCourt(v){const b=v.b,g=new THREE.Group();g.name='Food court · flowing waterfall';g.position.y=0;v.mesh.add(g);const x=b.x+b.w/2,z=b.y+b.h/2,M=level29World.material,stone=M('#e4d7bd'),wood=M('#886c50'),q=level29World.batch(g);v.mallWater=[];
 const box=(w,h,d,xx,y,zz,mat)=>q.box(w,h,d,xx,y,zz,mat);
 box(32,3,26,x,1.5,z,stone);box(28,28,3,x,16,z-9,stone);
 const water=new THREE.Mesh(new THREE.PlaneGeometry(24,25),new THREE.MeshBasicMaterial({color:'#7bd9ed',transparent:true,opacity:.55,side:THREE.DoubleSide,depthWrite:false}));water.position.set(x,16,z-6.9);water.userData.noBatch=true;g.add(water);
 const pool=new THREE.Mesh(new THREE.CircleGeometry(11,24),new THREE.MeshStandardMaterial({color:'#5abdd6',transparent:true,opacity:.8,roughness:.15}));pool.rotation.x=-Math.PI/2;pool.position.set(x,3.2,z);pool.userData.noBatch=true;g.add(pool);
 for(let i=0;i<18;i++){const drop=new THREE.Mesh(new THREE.BoxGeometry(.35,2.3,.35),new THREE.MeshBasicMaterial({color:'#d7faff',transparent:true,opacity:.8}));drop.position.set(x-11+i%9*2.7,4+(i*7)%24,z-6.5+(i%2)*.7);drop.userData.noBatch=true;g.add(drop);v.mallWater.push({mesh:drop,offset:i/18});}
 v.floorFurniture[0].push({x:x-16,y:z-13,w:32,h:26});
 for(const dx of [-78,-46,46,78]){box(20,2,16,x+dx,11,z,wood);box(2,10,2,x+dx,5,z,stone);for(const dz of [-13,13]){box(12,5,7,x+dx,2.5,z+dz,wood);v.floorFurniture[0].push({x:x+dx-6,y:z+dz-3.5,w:12,h:7});}v.floorFurniture[0].push({x:x+dx-10,y:z-8,w:20,h:16});}
 const label=addSign(g,'FOOD COURT · WATERFALL',125,5,x,34,z+2,'#a8ecf1');q.finish();return label;
}
window.level29MallDisplays={build,foodCourt};
})();
