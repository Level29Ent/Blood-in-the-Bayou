'use strict';
(function(){
// One civic room only. Shared instanced geometry keeps thousands of books off the draw-call budget.
function plan(b){const cx=b.x+b.w/2,z=b.y;
 const shelves=[-92,-48,48,92].map(dx=>({x:cx+dx-7,y:z+32,w:14,h:104,kind:'shelf'}));
 const desks=[-95,95].map(dx=>({x:cx+dx-20,y:z+166,w:40,h:22,kind:'study'}));
 const chairs=[-40,40].flatMap(dx=>[170,198].map(zz=>({x:cx+dx-7,y:z+zz-6,w:14,h:12,kind:'lounge'})));
 const tables=[-40,40].map(dx=>({x:cx+dx-6,y:z+178,w:12,h:12,kind:'table'}));
 const carts=[-122,122].map(dx=>({x:cx+dx-5,y:z+15,w:10,h:14,kind:'cart'}));
 const columns=[-30,30].map(dx=>({x:cx+dx-1.5,y:z+144.5,w:3,h:3,kind:'column'}));
 return {shelves,desks,chairs,tables,carts,columns,solids:[...shelves,...desks,...chairs,...tables,...carts,...columns],mission:{x:cx-70,y:z+35},entry:{x:cx,y:z+b.h}};
}
function build(T,b,base=0){const root=new T.Group();root.name='Greentown Library · reference interior';const p=plan(b),batches=new Map(),textures=[];
 const texture=(kind)=>{const n=128,data=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const k=(y*n+x)*4,noise=((x*13+y*37+x*y*7)%29)-14;let c=kind==='carpet'?173+noise:238+noise*.35;if(kind==='spine'){c=224+noise*.3;if(y>98&&y<119)c=251;if((y===18||y===22||y===40)&&x>24&&x<105)c=246;if((y===105||y===111)&&x>37&&x<90)c=71;}
 if(kind==='ceiling'&&(x<2||y<2))c=170;data.set([c,c,c,255],k);}const t=new T.DataTexture(data,n,n);t.encoding=T.sRGBEncoding;t.wrapS=t.wrapT=T.RepeatWrapping;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.generateMipmaps=true;t.needsUpdate=true;textures.push(t);return t;};
 const mat=(color,roughness=0.86,extra={})=>new T.MeshStandardMaterial({color,roughness,...extra});
 const cream=mat('#d5d1bf',.56,{metalness:.32}),shelf=mat('#e3dfcf',.6),oak=mat('#c3a476'),dark=mat('#39443f'),red=mat('#b92d35',.96,{map:texture('carpet')}),chrome=mat('#8f9792',.35,{metalness:.7}),carpet=mat('#91a18d',1,{map:texture('carpet')}),grey=mat('#999d95',1,{map:texture('carpet')}),ceiling=mat('#e1dfd3',.95,{map:texture('ceiling')}),book=mat('#ffffff',.88,{map:texture('spine')}),pages=mat('#d9d5bc'),glow=new T.MeshBasicMaterial({color:'#fff4d4'}),glass=mat('#b2d6db',.28,{emissive:'#526c70',emissiveIntensity:.22});
 carpet.map.repeat.set(14,12);grey.map.repeat.set(8,5);ceiling.map.repeat.set(b.w/20,b.h/20);
 const boxGeo=new T.BoxGeometry(1,1,1),cylinder=new T.CylinderGeometry(1,1,1,12);
 const emit=(w,h,d,x,y,z,m,geo=boxGeo,color=null,angle=0)=>{if(!batches.has(m))batches.set(m,new Map());const bucket=batches.get(m);if(!bucket.has(geo))bucket.set(geo,[]);bucket.get(geo).push({w,h,d,x,y:y+base,z,color,angle});};
 const box=(w,h,d,x,y,z,m)=>emit(w,h,d,x,y,z,m);
 const cx=b.x+b.w/2,cz=b.y+b.h/2;
 box(b.w-6,.18,b.h-6,cx,1.12,cz,carpet);box(b.w-8,.1,66,cx,1.26,b.y+183,grey);
 // A ceiling grid with recessed fluorescent strips; emissive faces do not allocate shadow maps/lights.
 box(b.w-5,.25,b.h-5,cx,48.65,cz,ceiling);
 for(const dx of [-106,-70,0,70,106])for(const zz of [34,92,151,199]){box(4.5,.55,23,cx+dx,48.25,b.y+zz,chrome);box(3.5,.18,21,cx+dx,47.9,b.y+zz,glow);}
 // Window-like glazed wall panels remain inside the existing solid civic walls.
 for(const side of [-1,1])for(const zz of [48,102,168]){const x=cx+side*(b.w/2-2.2);box(.35,23,34,x,28,b.y+zz,chrome);box(.45,21,31,x-side*.3,28,b.y+zz,glass);box(.8,1,33,x-side*.6,28,b.y+zz,shelf);box(.8,21,1,x-side*.6,28,b.y+zz,shelf);box(2,1,35,x-side*.7,16,b.y+zz,shelf);}
 // Powder-coated double-sided stacks, visible shelves, slender slotted uprights and hundreds of varied spines.
 const colors=['#44594e','#964e43','#3d6170','#c3a465','#d4d2b9','#634c5c','#323a3d','#7a8366','#a27749'];let seed=29;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};let books=0;
 for(const r of p.shelves){const x=r.x+r.w/2,z=r.y+r.h/2;box(1,27,104,x,14.5,z,cream);for(const end of [-1,1]){box(14,28,1,x,15,z+end*51.5,shelf);for(const side of [-1,1]){box(.7,28,.8,x+side*6.6,15,z+end*51.5,chrome);for(let h=5;h<29;h+=2)box(.82,.6,.15,x+side*6.6,h,z+end*52,dark);}}
 for(let level=0;level<5;level++){const yy=2.5+level*5.25;box(14,.45,103,x,yy,z,shelf);for(const side of [-1,1]){let zz=r.y+2;while(zz<r.y+r.h-3){const width=.7+rand()*.7,height=3.4+rand()*1.15;emit(4.5,height,width,x+side*3.3,yy+.23+height/2,zz+width/2,book,boxGeo,colors[Math.floor(rand()*colors.length)]);books++;zz+=width+.12;}}}
 box(14.4,.6,104,x,29.1,z,shelf);
 }
 // Study worktops and slim chairs sit away from the main entrance / mission aisle.
 for(const r of p.desks){const x=r.x+20,z=r.y+11;box(40,1.4,22,x,12.3,z,oak);for(const dx of [-17,17])for(const dz of [-8,8])box(.8,11, .8,x+dx,6.5,z+dz,chrome);for(const dx of [-10,10]){box(8,1,7,x+dx,7,z+5,red);box(8,8,1,x+dx,10,z+9,red);for(const sx of [-3,3])for(const sz of [2,8])box(.5,6,.5,x+dx+sx,4,z+sz,chrome);box(6,.2,4,x+dx,13.1,z-4,pages);box(2,.5,2,x+dx,13.4,z-4,dark);}}
 // Cushions are softened with low-segment spheres, shared by all lounge seats.
 const cushion=new T.SphereGeometry(1,12,8);
 for(const r of p.chairs){const x=r.x+7,z=r.y+6,front=z<b.y+184?1:-1;emit(6.4,1.7,5.2,x,7,z,red,cushion);emit(6.4,5.3,1.5,x,11,z-front*4.6,red,cushion);for(const side of [-1,1]){emit(1.2,3.3,5.3,x+side*6,8.4,z,red,cushion);for(const dz of [-4,4])box(.6,5,.6,x+side*5,3.6,z+dz,chrome);}}
 for(const r of p.tables){const x=r.x+6,z=r.y+6;emit(6,1,6,x,8,z,oak,cylinder);emit(.55,7,.55,x,4,z,chrome,cylinder);emit(3.2,.5,3.2,x,1.6,z,chrome,cylinder);box(4,.25,3,x-1,8.7,z,pages);}
 for(const r of p.carts){const x=r.x+5,z=r.y+7;for(const y of [3,9,15])box(10,.7,14,x,y,z,red);for(const dx of [-4.5,4.5])for(const dz of [-6,6]){box(.65,17,.65,x+dx,10,z+dz,red);emit(.8,1,.8,x+dx,1.8,z+dz,dark,cylinder);}for(let i=0;i<6;i++)box(1,4.5,4,x-3.7+i*1.4,5.7,z,book);}
 // Red architectural accents and a local-history display evoke the reference's reading lounge.
 for(const r of p.columns)box(3,46,3,r.x+1.5,24,r.y+1.5,red);for(const side of [-1,1])box(40,3,.7,cx+side*70,38,b.y+2.2,red);
 const dummy=new T.Object3D(),color=new T.Color();for(const [m,byGeo]of batches)for(const [geometry,list]of byGeo){const mesh=new T.InstancedMesh(geometry,m,list.length);mesh.name='Library · '+(m===book?'individual book spines':'fixtures');list.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.rotation.set(0,v.angle,0);dummy.scale.set(v.w,v.h,v.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);if(m===book)mesh.setColorAt(i,color.set(v.color||'#78846a'));});mesh.userData.noBatch=true;mesh.frustumCulled=false;root.add(mesh);}
 root.userData.library={books,plan:p,textureCount:textures.length};return {root,solids:p.solids,plan:p};
}
const api={plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29LibraryInterior=api;
})();
