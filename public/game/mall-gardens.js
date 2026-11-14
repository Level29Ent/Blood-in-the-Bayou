'use strict';
(function(){
function overlap(a,b,pad=0){return a.x<b.x+b.w+pad&&a.x+a.w>b.x-pad&&a.y<b.y+b.h+pad&&a.y+a.h>b.y-pad;}
function findSite(c,T,W,H,blocked){
 const reserved=c.buildings.concat((c.features||[]).filter(f=>!['garden','forest'].includes(f.kind)),[c.farm,c.recreationParcel,c.airportParcel,c.natchezParcel].filter(Boolean),Object.values(c.activityLots||{}));
 const former=c.formerMountains||[];let best=null,score=Infinity;
 for(const [w,h]of [[20*T,16*T],[18*T,14*T],[16*T,12*T],[12*T,10*T]]){
  for(let y=4*T;y+h<(H-4)*T;y+=T)for(let x=4*T;x+w<(W-4)*T;x+=T){const p={x,y,w,h};if(reserved.some(r=>overlap(p,r,24)))continue;
   let ok=true;for(let yy=y/T;yy<(y+h)/T&&ok;yy++)for(let xx=x/T;xx<(x+w)/T;xx++)if(blocked.includes(c.g[yy*W+xx])){ok=false;break;}if(!ok)continue;
   const near=former.length?Math.min(...former.map(f=>Math.hypot(x+w/2-f.x-f.w/2,y+h/2-f.y-f.h/2))):Math.hypot(x-W*T*.65,y-H*T*.7);
   if(near<score){score=near;best=p;}
  }if(best)return best;
 }return null;
}
const STORE_NAMES=[
 ['BAYOU FASHION','TECH & GIFTS','BARBER SHOP','BIKE SHOP','TOY STORE','MAGAZINE STORE','FISH AQUARIUM STORE','CRESCENT PHARMACY'],
 ['FURNITURE STORE','29 CUISINE','BOOK STORE','SHOE STORE','GREENTOWN PLANT STORE','BAYOU BURGERS','BAYOU COFFEE','CRESCENT BAKERY','HOMEWARES STORE'],
 ['LUXURY COLLECTION','EXECUTIVE TALENT','JEWELRY STORE','SPORTING GOODS','MUSIC STORE','ART & CRAFT STORE','GAME STORE','COSMETICS STORE','CAMERA SHOP']
];
function layout(b){
 const shops=[],margin=Math.min(60,b.w*.15),depth=Math.min(70,b.h*.2),inset=Math.min(38,b.h*.1);
 for(let floor=0;floor<3;floor++){const names=STORE_NAMES[floor],north=Math.ceil(names.length/2);
  for(let i=0;i<names.length;i++){const row=i<north?0:1,n=row?names.length-north:north,k=row?i-north:i,cell=(b.w-2*margin)/n,w=cell-12,x=b.x+margin+k*cell+6,y=row?b.y+b.h-inset-depth:b.y+inset,dir=row?-1:1,doorY=row?y:y+depth;
   shops.push({name:names[i],floor,x:x+w/2,y:doorY-dir*20,dir,room:{x,y,w,h:depth},doorX:x+w/2,doorY});
  }
 }
 const start=b.y+b.h*.3,end=b.y+b.h*.7;
 return {lift:{x:b.x+b.w/2,y:b.y+20},landing:{x:b.x+b.w/2,y:b.y+20},southLift:{x:b.x+b.w/2,y:b.y+b.h-20},shops,
 stairs:[{x:b.x+28,start,end,width:30,from:0,to:1},{x:b.x+b.w-28,start,end,width:30,from:1,to:2}]};
}
function stairHeight(stair,y){return stair.from*56+Math.max(0,Math.min(1,(y-stair.start)/(stair.end-stair.start)))*56;}
if(typeof module!=='undefined')module.exports={findSite,overlap,layout,stairHeight,STORE_NAMES};if(typeof window==='undefined')return;
VENUE_TYPES.push({id:'mall',name:'GREENTOWN MALL',short:'MALL · 3 LEVELS',letter:'M',col:'#e9c27a'});
const gen=genCity;genCity=function(){const c=gen.apply(this,arguments);if(!c.world)return c;
 c.activityLots=Object.fromEntries(Object.entries(window.level29Downtown?.lots||{}).map(([id,l])=>[id,{x:l.x0*TILE,y:l.y0*TILE,w:(l.x1-l.x0+1)*TILE,h:(l.y1-l.y0+1)*TILE}]));
 const p=findSite(c,TILE,MW,MH,[T_ROAD,T_BRIDGE,T_WATER,T_BLD])||findSite({...c,buildings:c.buildings.filter(b=>b.venue||b.kind!=='normal')},TILE,MW,MH,[T_WATER,T_BRIDGE]);if(!p)throw Error('No clear landscaped mall parcel');
 c.buildings=c.buildings.filter(b=>b.venue||b.kind!=='normal'||!overlap(b,p,8));
 c.mallParcel=p;const b={x:p.x+32,y:p.y+32,w:p.w-64,h:p.h-96,H:176,kind:'normal',seed:2929,col:'#d7c9ac'};
 const v=createVenue(b,'mall','garden-mall');b.H=176;v.floor=0;v.open=true;v.extended=false;v.staff=[];v.mallLayout=layout(b);v.colliderDoor={x:v.doorX-v.doorW/2,y:v.doorY-3,w:v.doorW,h:3};
 v.colliderWalls=[{x:b.x,y:b.y,w:b.w,h:3},{x:b.x,y:b.y,w:3,h:b.h},{x:b.x+b.w-3,y:b.y,w:3,h:b.h},{x:b.x,y:b.y+b.h-3,w:(b.w-v.doorW)/2,h:3},{x:v.doorX+v.doorW/2,y:b.y+b.h-3,w:(b.w-v.doorW)/2,h:3}];
 v.parkingDecks=[{x:b.x-28,y:b.y+b.h/2-45,w:28,h:90},{x:b.x+b.w,y:b.y+b.h/2-45,w:28,h:90}];
 v.stationX=v.mallLayout.lift.x;v.stationY=v.mallLayout.lift.y;c.buildings.push(b);c.venues.push(v);c.mall=v;
 for(let y=p.y/TILE;y<(p.y+p.h)/TILE;y++)for(let x=p.x/TILE;x<(p.x+p.w)/TILE;x++)c.g[y*MW+x]=T_PARK;
 for(let y=b.y/TILE;y<(b.y+b.h)/TILE;y++)for(let x=b.x/TILE;x<(b.x+b.w)/TILE;x++)c.g[y*MW+x]=T_LOT;
 const inPlot=o=>overlap({x:o.x,y:o.y,w:1,h:1},p,16);c.trees=c.trees.filter(o=>!inPlot(o));if(c.pineTrees)c.pineTrees=c.pineTrees.filter(o=>!inPlot(o));c.parked=c.parked.filter(o=>!inPlot(o));c.rocks=(c.rocks||[]).filter(o=>!inPlot(o));indexTrees(c);return c;
};
function buildMall(v){const b=v.b,g=new THREE.Group();g.name='Greentown Mall · three levels';v.mesh=g;cityGroup.add(g);const M=level29World.material,q=level29World.batch(g),cream=M('#eee8da'),gold=M('#a9b3b4',.65,.3),tile=M('#d8cbb5',0,.3),dark=M('#292b2c'),wood=M('#886348');v.floorFurniture=[[],[],[]];
 const glassRail=new THREE.MeshStandardMaterial({color:'#b5d4d4',transparent:true,opacity:.25,roughness:.25,depthWrite:false});
 const part=(w,h,d,x,y,z,m)=>q.box(w,h,d,x,y,z,m);
 const windowGlass=new THREE.MeshStandardMaterial({color:'#d4e7e4',transparent:true,opacity:.16,roughness:.15,depthWrite:false});
 const glow=new THREE.MeshBasicMaterial({color:'#fff0cf'}),grout=M('#b5aa98'),black=M('#24292b',.2,.4);
 // All repeated details use the venue's material batches; no new real-time lights.
 function beam(x,y,z,xx,yy,zz,width,mat){
  const length=Math.hypot(xx-x,yy-y,zz-z),mesh=new THREE.Mesh(new THREE.BoxGeometry(width,length,width),mat);
  mesh.position.set((x+xx)/2,(y+yy)/2,(z+zz)/2);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(xx-x,yy-y,zz-z).normalize());g.add(mesh);
 }
 function railing(x,z,xx,zz,base){
  const length=Math.hypot(xx-x,zz-z),count=Math.ceil(length/24);
  for(let i=0;i<=count;i++){const t=i/count;part(1,13,1,x+(xx-x)*t,base+7,z+(zz-z)*t,gold);}
  beam(x,base+14,z,xx,base+14,zz,1.2,gold);
  beam(x,base+2,z,xx,base+2,zz,.6,gold);
  // Solid cream slab edges and warm soffit strips below the glass balustrades.
  if(x===xx){part(2,5,length,x,base-1,(z+zz)/2,cream);part(2,.5,length,x,base-3.7,(z+zz)/2,glow);}
  else{part(length,5,2,(x+xx)/2,base-1,z,cream);part(length,.5,2,(x+xx)/2,base-3.7,z,glow);}
 }
 function tileLines(base){
  const edge=Math.min(140,b.w*.3,b.h*.34),hx=b.x+edge,hz=b.y+edge,hw=b.w-2*edge,hd=b.h-2*edge;
  const cuts=v.mallLayout.stairs.filter(st=>st.to===base/56).map(st=>({start:st.start,end:st.end,lo:st.x<b.x+b.w/2?b.x:st.x-st.width/2-2,hi:st.x<b.x+b.w/2?st.x+st.width/2+2:b.x+b.w}));
  // Split seams at the actual atrium void: nothing floats across the opening.
  for(let x=b.x+16;x<b.x+b.w;x+=16){
   if(base&&x>hx&&x<hx+hw){for(const z of [b.y+edge/2,b.y+b.h-edge/2])part(.16,.08,edge,x,base+1.05,z,grout);}
   else{const cut=cuts.find(c=>x>=c.lo&&x<=c.hi);if(cut){for(const [lo,hi]of [[b.y,cut.start],[cut.end,b.y+b.h]])part(.16,.08,hi-lo,x,base+1.05,(lo+hi)/2,grout);}else part(.16,.08,b.h,x,base+1.05,b.y+b.h/2,grout);}
  }
  for(let z=b.y+16;z<b.y+b.h;z+=16){
   // North/south galleries are continuous; side galleries have stair openings.
   const spans=base&&z>hz&&z<hz+hd?[[b.x,hx],[hx+hw,b.x+b.w]]:[[b.x,b.x+b.w]];
   for(const [lo,hi]of spans){let cursor=lo;
    const wells=cuts.filter(c=>z>c.start&&z<c.end&&c.hi>lo&&c.lo<hi);
    for(const st of wells){const end=Math.min(hi,Math.max(cursor,st.lo));if(end>cursor)part(end-cursor,.08,.16,(cursor+end)/2,base+1.05,z,grout);cursor=Math.max(cursor,st.hi);}
    if(hi>cursor)part(hi-cursor,.08,.16,(cursor+hi)/2,base+1.05,z,grout);
   }
  }
 }

 for(let floor=0;floor<3;floor++){const base=floor*56;
  if(!floor)part(b.w,2,b.h,b.x+b.w/2,base,b.y+b.h/2,tile);
  else{const edge=Math.min(140,b.w*.3,b.h*.34);for(const side of [0,1]){const stair=v.mallLayout.stairs[side],x=side?b.x+b.w-edge/2:b.x+edge/2;if(stair.to===floor){for(const [lo,hi]of [[b.y,stair.start],[stair.end,b.y+b.h]])part(edge,2,hi-lo,x,base,(hi+lo)/2,tile);
 // Keep the corridor beside the opening, leaving only the actual stair width cut out.
 const inner=side?b.x+b.w-edge:stair.x+stair.width/2+2,outer=side?stair.x-stair.width/2-2:b.x+edge;
 part(outer-inner,2,stair.end-stair.start,(inner+outer)/2,base,(stair.start+stair.end)/2,tile);
 v.floorFurniture[floor].push({x:stair.x-stair.width/2,y:stair.start+10,w:stair.width,h:stair.end-stair.start-20,stairWell:true});
 }else part(edge,2,b.h,x,base,b.y+b.h/2,tile);}part(b.w-edge*2,2,edge,b.x+b.w/2,base,b.y+edge/2,tile);part(b.w-edge*2,2,edge,b.x+b.w/2,base,b.y+b.h-edge/2,tile);
   const hole={x:b.x+edge,y:b.y+edge,w:b.w-2*edge,h:b.h-2*edge};if(floor===2){const gap=24,mid=hole.y+hole.h/2;v.floorFurniture[floor].push({...hole,h:hole.h/2-gap/2},{...hole,y:mid+gap/2,h:hole.h/2-gap/2});part(hole.w,2,gap,hole.x+hole.w/2,base,mid,tile);for(const side of [-1,1]){part(hole.w,12,1,hole.x+hole.w/2,base+7,mid+side*gap/2,glassRail);railing(hole.x,mid+side*gap/2,hole.x+hole.w,mid+side*gap/2,base);}addSign(g,'SKYBRIDGE · LUXURY WING',100,6,hole.x+hole.w/2,base+22,mid,'#e5d3a4');}else v.floorFurniture[floor].push(hole);
   for(const x of [hole.x,hole.x+hole.w]){part(1,12,hole.h,x,base+7,hole.y+hole.h/2,glassRail);railing(x,hole.y,x,hole.y+hole.h,base);}for(const y of [hole.y,hole.y+hole.h]){part(hole.w,12,1,hole.x+hole.w/2,base+7,y,glassRail);railing(hole.x,y,hole.x+hole.w,y,base);}
  }
  for(const r of v.colliderWalls){if(floor===2&&r.h>20&&r.w<=3){const span=(r.h-28)/2;for(const side of [-1,1])part(r.w,48,span,r.x+r.w/2,base+24,r.y+r.h/2+side*(r.h+28)/4,glassRail);}else part(r.w,48,r.h,r.x+r.w/2,base+24,r.y+r.h/2,r.h>20&&r.w<=3?glassRail:cream);if(r.h>20&&r.w<=3)for(let z=r.y+16;z<r.y+r.h;z+=32)if(floor!==2||Math.abs(z-(r.y+r.h/2))>16)part(2,50,2,r.x+r.w/2,base+25,z,gold);}
  // Upper front wall is closed except for the lift: players cannot exit into midair.
  if(floor)part(v.doorW,48,3,v.doorX,base+24,v.doorY-1.5,glassRail);
  for(const hub of [v.mallLayout.lift,v.mallLayout.southLift]){
   for(const side of [-1,1])part(1,45,24,hub.x+side*15,base+23,hub.y,glassRail);
   addSign(g,'U · GLASS LIFT',65,5,hub.x,base+27,hub.y-12,'#e6c887');
  }
  const stair=v.mallLayout.stairs.find(s=>s.from===floor);if(stair){
   const n=28,run=(stair.end-stair.start)/n;
   for(let i=0;i<n;i++){
    const y=base+(i+1)*56/n-1,z=stair.start+(i+.5)*run;
    part(stair.width,2,run+.1,stair.x,y,z,gold);
    part(stair.width-2,.2,.35,stair.x,y+1.1,z+run/2-.2,black);
   }
   for(const side of [-1,1]){
    const x=stair.x+side*(stair.width/2+1);
    beam(x,base+4,stair.start,x,base+60,stair.end,2.5,gold);
    beam(x,base+14,stair.start,x,base+70,stair.end,2,black);
    const panelGeometry=new THREE.BufferGeometry();
    panelGeometry.setAttribute('position',new THREE.Float32BufferAttribute([
     x,base+4,stair.start,x,base+60,stair.end,x,base+69,stair.end,
     x,base+4,stair.start,x,base+69,stair.end,x,base+13,stair.start
    ],3));panelGeometry.computeVertexNormals();
    const panel=new THREE.Mesh(panelGeometry,glassRail);panel.material.side=THREE.DoubleSide;g.add(panel);
    for(let i=0;i<8;i++){const t=(i+.5)/8,z=stair.start+t*(stair.end-stair.start);part(1,11,1,x,base+t*56+8,z,gold);}
   }
   for(const [z,y]of [[stair.start,base],[stair.end,base+56]]){
    part(stair.width,1,6,stair.x,y+1,z,gold);
    part(stair.width,.2,1,stair.x,y+1.6,z,glow);
   }
   addSign(g,'WALK UP · FLOOR '+(stair.to+1),34,4,stair.x,base+22,stair.start-4,'#f4eee2');
  }
  const lift=v.mallLayout.lift;part(36,1,26,lift.x,base+1,lift.y,gold);addSign(g,'U · LIFT · FLOOR '+(floor+1),100,7,lift.x,base+30,b.y+4,'#e6c887');
  for(const shop of v.mallLayout.shops.filter(s=>s.floor===floor)){
   const r=shop.room,door=Math.min(40,r.w-16),wall=(w,d,x,z)=>{part(w,42,d,x,base+21,z,cream);v.floorFurniture[floor].push({x:x-w/2,y:z-d/2,w,h:d});};
   wall(r.w,2,r.x+r.w/2,shop.dir===1?r.y:r.y+r.h);wall(2,r.h,r.x,r.y+r.h/2);wall(2,r.h,r.x+r.w,r.y+r.h/2);
   const span=(r.w-door)/2;for(const side of [-1,1]){
    const x=shop.doorX+side*(r.w+door)/4;
    part(span,30,1,x,base+16,shop.doorY,windowGlass);
    v.floorFurniture[floor].push({x:x-span/2,y:shop.doorY-1,w:span,h:2});
    part(span,2,2,x,base+2,shop.doorY,gold);
    part(1,33,2,shop.doorX+side*door/2,base+17,shop.doorY,gold);
    part(span-2,.6,9,x,base+33,shop.doorY-shop.dir*5,glow);
    // Window plinths frame the merchandise without narrowing the existing doorway.
    part(Math.max(2,span-4),3,10,x,base+3,shop.doorY-shop.dir*8,cream);
   }
   const fascia=[dark,wood,M('#52534b')][(floor+v.mallLayout.shops.indexOf(shop))%3];
   part(r.w,12,3,shop.doorX,base+40,shop.doorY,fascia);
   part(r.w,.7,3,shop.doorX,base+47,shop.doorY,gold);
   part(r.w-4,.5,r.h-4,r.x+r.w/2,base+49,r.y+r.h/2,cream);
   for(const dx of [-r.w*.25,r.w*.25])part(7,.6,3,shop.doorX+dx,base+48,shop.doorY-shop.dir*18,glow);
   part(r.w-4,1,r.h-4,r.x+r.w/2,base+1,r.y+r.h/2,tile);
   if(shop.name!=='BAYOU BURGERS'&&!['COSMETICS STORE','FURNITURE STORE','MAGAZINE STORE','SPORTING GOODS','GAME STORE','BIKE SHOP','BARBER SHOP','FISH AQUARIUM STORE','MUSIC STORE','JEWELRY STORE'].includes(shop.name)){const counterY=shop.dir===1?r.y+12:r.y+r.h-12;part(r.w-24,10,16,shop.doorX,base+5,counterY,wood);v.floorFurniture[floor].push({x:r.x+12,y:counterY-8,w:r.w-24,h:16});}
   if(shop.name==='GAME STORE'){const store=level29GameStoreInterior.build(THREE,shop,base);g.add(store.root);v.floorFurniture[floor].push(...store.solids);shop.referenceGameStore=true;shop.referenceRoot=store.root;store.root.visible=v.floor===floor;}
   const label=addSign(g,shop.name,r.w-8,7,shop.doorX,base+40,shop.doorY+shop.dir*2,'#fff6e7');if(label&&shop.dir===-1)label.rotation.y=Math.PI;
   const detail=window.level29MallDisplays?.build(shop,g,base,part,{wood,gold,dark,cream},v);if((shop.referenceCosmetics||shop.referenceSports||shop.referenceFurniture||shop.referenceMagazine||shop.referenceJewelry||shop.referenceRecordStore||shop.referenceFastFood||shop.referenceBarber||shop.referenceAquarium)&&detail){v.floorFurniture[floor].push(...detail.solids);shop.referenceRoot=detail.root;detail.root.visible=v.floor===floor;}

   if(shop.name==='29 CUISINE'){addSign(g,'U · BURGER MEAL $60 · +50 HEALTH',90,5,shop.doorX,base+25,shop.doorY+2,'#e4b578');}
  }
  tileLines(base);
  for(const side of [-1,1]){const x=b.x+b.w/2+side*42,z=b.y+b.h-43;part(28,6,12,x,base+3,z,wood);part(28,8,2,x,base+8,z-5,cream);v.floorFurniture[floor].push({x:x-14,y:z-6,w:28,h:12});}
 }
 // Reference-inspired clerestory: cream pitched ceiling wings, a clear central skylight,
 // and silver cross-trusses. The open atrium still connects all three playable floors.
 const roofZ=b.y+b.h/2,roofX=b.x+b.w/2,roofY=170,peak=196;
 const roofGlass=new THREE.MeshStandardMaterial({color:'#d7edf3',transparent:true,opacity:.2,roughness:.2,depthWrite:false,side:THREE.DoubleSide});
 function roofPanel(lo,hi,y1,y2,mat){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([lo,y1,b.y,hi,y2,b.y,hi,y2,b.y+b.h,lo,y1,b.y,hi,y2,b.y+b.h,lo,y1,b.y+b.h],3));geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,mat);g.add(mesh);}
 const roofCream=M('#f6f0e2');roofCream.side=THREE.DoubleSide;
 roofPanel(b.x,roofX-48,roofY,peak-7,roofCream);roofPanel(roofX+48,b.x+b.w,peak-7,roofY,roofCream);
 roofPanel(roofX-48,roofX,peak-7,peak,roofGlass);roofPanel(roofX,roofX+48,peak,peak-7,roofGlass);
 for(let z=b.y;z<=b.y+b.h;z+=32){
  for(const side of [-1,1]){
   beam(roofX+side*b.w/2,roofY,z,roofX,peak,z,2,cream);
   beam(roofX+side*48,peak-7,z,roofX,peak,z,1,gold);
  }
  beam(b.x,roofY-2,z,b.x+b.w,roofY-2,z,1.5,gold);
 }
 for(const x of [roofX-48,roofX,roofX+48])beam(x,x===roofX?peak:peak-7,b.y,x,x===roofX?peak:peak-7,b.y+b.h,1,gold);
 v.roof=null;
 // A patterned stone court replaces the blue rink; the waterfall remains playable.
 part(Math.min(220,b.w*.5),.3,Math.min(100,b.h*.24),roofX,1.3,roofZ,M('#bca98b',0,.4));
 const leaf=M('#427047'),leafLight=M('#67864f'),soil=M('#453c2e'),crownGeometry=new THREE.IcosahedronGeometry(6,0);
 for(const side of [-1,1])for(const end of [-1,1]){
  const x=roofX+side*Math.min(108,b.w*.21),z=roofZ+end*Math.min(45,b.h*.12);
  part(26,5,18,x,3.5,z,cream);part(23,.5,15,x,6.2,z,soil);
  for(let k=0;k<5;k++){
   const dx=(k%3-1)*7,dz=(Math.floor(k/3)-.5)*6;
   part(1,12,1,x+dx,12,z+dz,wood);
   // Angular clusters read as planted indoor trees, not opaque walls.
   for(const offset of [-1,1]){const crown=new THREE.Mesh(crownGeometry,k%2?leaf:leafLight);crown.scale.set(1,1.3,.85);crown.position.set(x+dx+offset*2,17+k%2*3,z+dz);g.add(crown);}
  }
  v.floorFurniture[0].push({x:x-13,y:z-9,w:26,h:18});
 }
 // Wood-clad guest-services desk and freestanding directory, kept off the lift route.
 const deskZ=roofZ+Math.min(48,b.h*.12);
 part(36,11,14,roofX,6.5,deskZ,wood);part(39,1.5,16,roofX,12.8,deskZ,cream);
 v.floorFurniture[0].push({x:roofX-19.5,y:deskZ-8,w:39,h:16});
 addSign(g,'GUEST SERVICES',34,4,roofX,9,deskZ+8,'#fff0d0');
 for(const side of [-1,1]){const x=roofX+side*(b.w/2-72),z=roofZ+45;
  part(13,2,10,x,2,z,gold);part(11,25,2,x,15,z,dark);
  addSign(g,'DIRECTORY',10,2,x,24,z+1.5,'#ffffff');
  for(let i=0;i<3;i++)part(8,1,.4,x,19-i*4,z+1.5,[gold,wood,leaf][i]);
  v.floorFurniture[0].push({x:x-6.5,y:z-5,w:13,h:10});
 }

 for(const x of [b.x+10,b.x+b.w-10])part(5,110,5,x,55,b.y+b.h+3,gold);
 // Large window frames on both stories; transparent glass stays performance-friendly.
 const glass=new THREE.MeshStandardMaterial({color:'#90bdb7',transparent:true,opacity:.3,roughness:.2,depthWrite:false});
 for(const side of [-1,1])for(let level=0;level<3;level++)for(let k=0;k<4;k++){const z=b.y+24+k*(b.h-48)/3;part(.6,23,20,b.x+b.w/2+side*(b.w/2+1),level*56+27,z,glass);}
 addSign(g,'GREENTOWN MALL',Math.min(250,b.w),14,v.doorX,104,v.doorY+3,'#f0d396');addSign(g,'WALK IN · THREE LEVELS · U LIFT',150,7,v.doorX,43,v.doorY+3,'#d8e5cc');
 for(const deck of v.parkingDecks||[]){part(deck.w,3,deck.h,deck.x+deck.w/2,112,deck.y+deck.h/2,cream);for(const x of [deck.x+2,deck.x+deck.w-2])for(const z of [deck.y+3,deck.y+deck.h-3])part(3,112,3,x,56,z,gold);for(const x of [deck.x<b.x?deck.x+1:deck.x+deck.w-1])part(1,12,deck.h,x,119,deck.y+deck.h/2,glassRail);for(const z of [deck.y+1,deck.y+deck.h-1])part(deck.w,12,1,deck.x+deck.w/2,119,z,glassRail);for(let z=deck.y+10;z<deck.y+deck.h;z+=20)part(deck.w-4,.3,1,deck.x+deck.w/2,114,z,gold);addSign(g,'PARKING SKYDECK',60,6,deck.x+deck.w/2,135,deck.y,'#ead5a5');}
 window.level29MallDisplays?.foodCourt(v);v.furniture=v.floorFurniture[0];q.finish();return g;
}
const builder=buildVenue;buildVenue=function(v){if(v.id!=='mall')return builder.apply(this,arguments);if(v.mesh?.parent===cityGroup)return;buildMall(v);};
function landscaping(){const p=city.mallParcel;if(!p)return;city.landscapeSolids=[];const g=new THREE.Group();g.name='Greentown Mall landscape';cityGroup.add(g);const q=level29World.batch(g),M=level29World.material,stone=M('#d9cdb1'),green=M('#4d7950'),pink=M('#b97093'),gold=M('#d0ad63');g.position.y=city.mall.baseY||0;
 const b=city.mall.b;
 q.box(38,1,p.y+p.h-(b.y+b.h),city.mall.doorX,.6,(b.y+b.h+p.y+p.h)/2,stone);
 for(const side of [-1,1]){const x=p.x+p.w/2+side*(p.w/2-15);for(let i=0;i<6;i++){const z=p.y+24+i*(p.h-48)/5;if([T_ROAD,T_BRIDGE].includes(city.g[Math.floor(z/TILE)*MW+Math.floor(x/TILE)]))continue;q.box(18,3,18,x,1.5,z,stone);city.landscapeSolids.push({x:x-9,y:z-9,w:18,h:18});const shrub=new THREE.Mesh(new THREE.SphereGeometry(1,10,8),green);shrub.scale.set(8,5,8);shrub.position.set(x,6,z);g.add(shrub);for(let k=0;k<3;k++){const flower=new THREE.Mesh(new THREE.SphereGeometry(1.5,8,6),k%2?gold:pink);flower.position.set(x-4+k*4,10,z);g.add(flower);}}}
 for(const side of [-1,1]){const x=city.mall.doorX+side*85,z=p.y+p.h-48;if([T_ROAD,T_BRIDGE].includes(city.g[Math.floor(z/TILE)*MW+Math.floor(x/TILE)]))continue;city.landscapeSolids.push({x:x-20,y:z-20,w:40,h:40});const basin=new THREE.Mesh(new THREE.CylinderGeometry(18,20,4,24),stone);basin.position.set(x,2,z);g.add(basin);const water=new THREE.Mesh(new THREE.CircleGeometry(16,24),M('#648e9d'));water.rotation.x=-Math.PI/2;water.position.set(x,4.1,z);g.add(water);const stem=new THREE.Mesh(new THREE.CylinderGeometry(2,3,12,12),stone);stem.position.set(x,10,z);g.add(stem);const tier=new THREE.Mesh(new THREE.CylinderGeometry(7,5,2,18),stone);tier.position.set(x,16,z);g.add(tier);}
 q.finish();if(window.level29BatchStatic)level29BatchStatic(g,[]);
 // Former mountain plots become light, original garden landscaping with no extra passes.
 const garden=new THREE.Group();garden.name='Former mountains · landscaped gardens';cityGroup.add(garden);const gb=level29World.batch(garden);
 for(const f of city.formerMountains||[])for(let y=f.y+32;y<f.y+f.h-20;y+=64)for(let x=f.x+32;x<f.x+f.w-20;x+=64){if((city.features||[]).some(o=>o!==f&&['basketball','training','skatepark','market','cemetery'].includes(o.kind)&&overlap({x:x-16,y:y-16,w:32,h:32},o,32))||[city.recreationParcel,city.basketballReservation,city.airportParcel].filter(Boolean).some(r=>overlap({x:x-16,y:y-16,w:32,h:32},r,32))||city.buildings.some(b=>overlap({x:x-16,y:y-16,w:32,h:32},b,32))||overlap({x,y,w:1,h:1},p,24)||[T_ROAD,T_BRIDGE,T_WATER].includes(city.g[Math.floor(y/TILE)*MW+Math.floor(x/TILE)]))continue;const h=city.heightAt(x,y);gb.box(16,2,16,x,h+1,y,stone);city.landscapeSolids.push({x:x-8,y:y-8,w:16,h:16});gb.box(12,5,12,x,h+4,y,green);for(const dx of [-3,3])gb.box(2,1,2,x+dx,h+7,y,pink);}
 gb.finish();
}
const build=buildCity;buildCity=function(){build.apply(this,arguments);if(city?.world)landscaping();};
function mallInside(v,p,r=0){const b=v.b;if(p.x-r>b.x+3&&p.x+r<b.x+b.w-3&&p.y-r>b.y+3&&p.y+r<b.y+b.h-3)return true;if(v.floor!==2)return false;return (v.parkingDecks||[]).some(d=>p.x-r>d.x&&p.x+r<d.x+d.w&&p.y-r>d.y&&p.y+r<d.y+d.h)||Math.abs(p.y-(b.y+b.h/2))+r<12&&p.x-r>b.x-26&&p.x+r<b.x+b.w+26;}
const originalInside=insideVenue;insideVenue=function(v,p){if(v.id==='mall'&&v.floor===2)return mallInside(v,p);return originalInside(v,p);};
const height=terrainHeight;terrainHeight=function(x,y){const v=city?.mall;if(v?.stair&&Math.abs(x-v.stair.x)<=v.stair.width/2+1&&y>=v.stair.start-2&&y<=v.stair.end+2)return (v.baseY||0)+stairHeight(v.stair,y);if(v?.floor>0&&mallInside(v,{x,y}))return (v.baseY||0)+v.floor*56;return height.apply(this,arguments);};
const blocked=blockedCircle;blockedCircle=function(x,y,r){const v=city?.mall;if(v?.stair&&moverCtx===player){const s=v.stair;if(y>=s.start&&y<=s.end&&Math.abs(x-s.x)+r>s.width/2)return true;return false;}if(v?.floor>0&&player&&moverCtx===player&&insideVenue(v,player)){if(!mallInside(v,{x,y},r))return true;return v.furniture.some(f=>x+r>f.x&&x-r<f.x+f.w&&y+r>f.y&&y-r<f.y+f.h);}return blocked.apply(this,arguments);};
const moveBase=moveCircle;moveCircle=function(e,dx,dy,r){
 const v=city?.mall;if(e===player&&v&&!e.car&&!e.dead&&insideVenue(v,e)){
  if(!v.stair)for(const s of v.mallLayout.stairs){if(Math.abs(e.x-s.x)+r>s.width/2)continue;
   if((v.floor===s.from&&e.y<=s.start+8&&e.y+dy>=s.start&&e.y+dy<=s.start+12)||(v.floor===s.to&&e.y>=s.end-8&&e.y+dy<=s.end&&e.y+dy>=s.end-12)){v.stair=s;break;}}
  const result=moveBase.apply(this,arguments),s=v.stair;if(s){if(e.y>=s.end){v.floor=s.to;v.stair=null;}else if(e.y<=s.start){v.floor=s.from;v.stair=null;}v.furniture=v.floorFurniture[v.floor];}return result;
 }return moveBase.apply(this,arguments);
};
const service=serviceVenue;serviceVenue=function(){const v=city?.mall;if(!v||!player||player.car||!insideVenue(v,player))return service.apply(this,arguments);const north=v.mallLayout.lift,south=v.mallLayout.southLift;const lift=dist(player.x,player.y,north.x,north.y)<dist(player.x,player.y,south.x,south.y)?north:south;if(dist(player.x,player.y,lift.x,lift.y)>32){const shop=v.mallLayout.shops.find(s=>s.floor===v.floor&&dist(player.x,player.y,s.x,s.y)<42);if(shop?.name==='29 CUISINE'){if(player.hp>=player.maxHp)return toast('29 CUISINE · HEALTH ALREADY FULL');if(cash<60)return toast('29 CUISINE · MEAL COSTS $60 GAME CASH');cash-=60;player.hp=Math.min(player.maxHp,player.hp+50);window.level29Save?.save();return toast('29 CUISINE · +50 HEALTH · $60');}return toast(shop?shop.name+' · BROWSE THE DISPLAY · LIFT AT THE REAR':'GREENTOWN MALL · APPROACH THE MARKED LIFT · U TO CHANGE FLOOR');}v.stair=null;v.floor=(v.floor+1)%3;v.furniture=v.floorFurniture[v.floor];player.x=lift.x;player.y=lift===north?v.mallLayout.landing.y:lift.y-10;player.vx=player.vy=0;snapCamera();toast('GREENTOWN MALL · FLOOR '+(v.floor+1)+(' · '+v.mallLayout.shops.filter(s=>s.floor===v.floor).length+' STORES · STAIRS / LIFT'));};
const updateBase=update;update=function(){updateBase.apply(this,arguments);const v=city?.mall;if(!v||!player)return;for(const s of v.mallLayout.shops)if(s.referenceRoot){s.referenceRoot.visible=v.floor===s.floor&&Math.hypot(player.x-s.doorX,player.y-s.doorY)<350;if(s.referenceAquarium&&s.referenceRoot.visible&&state==='play'&&Math.hypot(player.x-s.doorX,player.y-s.doorY)<140)s.animateAquarium((window.level29TimeOfDay?.seconds||frame/60));}if(typeof state!=='undefined'&&state==='play')for(const drop of v.mallWater||[]){const t=window.level29TimeOfDay?.seconds||frame/60;drop.mesh.position.y=4+24*(1-(t*.7+drop.offset)%1);}if(!insideVenue(v,player)){v.stair=null;if(v.floor){v.floor=0;v.furniture=v.floorFurniture[0];}} };
let gps=false;
const mallButton=document.createElement('button');mallButton.id='mallDirections';mallButton.type='button';mallButton.textContent='MALL';mallButton.title='Toggle directions to Greentown Mall';mallButton.style.cssText='min-height:44px;padding:8px 12px;background:#263e39;color:#f0d99f;border:1px solid #c4ab6b;cursor:pointer';mallButton.onclick=()=>{gps=!gps;toast(gps?'GREENTOWN MALL · FOLLOW THE M MARKER':'MALL DIRECTIONS OFF');};(document.getElementById('hudMapActions')||document.body).appendChild(mallButton);
const target=missionTarget;missionTarget=function(){if(gps&&city?.mall){const v=city.mall;return {x:v.doorX,y:v.doorY+24,col:'#e9c27a',label:'M'};}return target.apply(this,arguments);};
window.level29Mall={findSite,layout,buildMall,stairHeight};
})();
