'use strict';
(function(){
if(typeof window==='undefined')return;
function build(s,g,base,part,palette,venue){if(s.name==='BOOK STORE'){const built=level29BookStore.build(THREE,s.room,{base,dir:s.dir,sign:addSign});g.add(built.root);s.referenceBookStore=true;return built;}if(s.name==='MAGAZINE STORE'){const built=level29MagazineStore.build(THREE,s.room,{base,dir:s.dir});g.add(built.root);s.referenceMagazine=true;return built;}if(s.name==='MUSIC STORE'){const built=level29RecordStore.build(THREE,s.room,{base,dir:s.dir});g.add(built.root);s.referenceRecordStore=true;return built;}if(s.name==='BAYOU BURGERS'){const built=level29FastFood.build(THREE,s.room,{theme:'bayou',base,dir:s.dir,sign:addSign});g.add(built.root);s.referenceFastFood=true;return built;}if(s.name==='BARBER SHOP'){const built=level29BarberInterior.build(THREE,s.room,{base,dir:s.dir});g.add(built.root);s.referenceBarber=true;return built;}if(s.name==='GAME STORE')return;
 if(s.name==='BIKE SHOP'&&window.level29BikeShop){const shop=level29BikeShop.build(THREE,s,base,addSign);g.add(shop.root);if(venue)venue.floorFurniture[s.floor].push(...shop.solids);return;}
 if(s.name==='FISH AQUARIUM STORE'){const built=level29AquariumStore.build(THREE,s.room,{base,dir:s.dir});g.add(built.root);s.referenceAquarium=true;s.animateAquarium=built.animate;return built;}
 const D=window.level29InteriorModels;if(!D)return;const z=s.dir===1?s.room.y+12:s.room.y+s.room.h-12;

 for(const dx of [-s.room.w*.24,s.room.w*.24]){const p=D.props(s.name);p.scale.setScalar(Math.min(.65,(s.room.w-20)/65));p.position.set(s.doorX+dx,base+12,z);if(s.dir===-1)p.rotation.y=Math.PI;g.add(p);}const upper=D.props(s.name);upper.scale.setScalar(.45);upper.position.set(s.doorX,base+27,z);if(s.dir===-1)upper.rotation.y=Math.PI;g.add(upper);D.box(g,s.room.w-12,1,15,s.doorX,base+26,z,D.material('#8c6d4c'));
 const shelf=D.material('#8c6d4c'),trim=D.material('#a4b3b5','metal',.65);
 D.box(g,s.room.w-12,1,18,s.doorX,base+11,z,shelf);for(const side of [-1,1])D.box(g,1.5,11,16,s.doorX+side*(s.room.w/2-8),base+5.5,z,trim);
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
