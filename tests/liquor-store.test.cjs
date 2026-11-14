const {test}=require('node:test'),assert=require('node:assert/strict'),T=require('three'),fs=require('node:fs'),vm=require('node:vm'),L=require('../public/game/liquor-store-interior.js');
const hit=(x,z,r,s)=>x+r>s.x&&x-r<s.x+s.w&&z+r>s.y&&z-r<s.y+s.h;
test('liquor fixtures preserve story station, entry path, both customer aisles and back-bar access',()=>{
 for(const [w,h]of [[128,128],[160,160],[224,160]]){
  const b={x:0,y:0,w,h},p=L.plan(b),clear=(x,z)=>x>=10&&x<=w-10&&z>=14&&z<=h+2&&!p.solids.some(s=>hit(x,z,10,s));
  const q=[[w/2,h]],seen=new Set([w/2+','+h]);for(let i=0;i<q.length;i++){const [x,z]=q[i];for(const [dx,dz]of [[2,0],[-2,0],[0,2],[0,-2]]){const xx=x+dx,zz=z+dz,key=xx+','+zz;if(!seen.has(key)&&clear(xx,zz)){seen.add(key);q.push([xx,zz]);}}}
  const a=p.shelves[0],c=p.shelves[1];for(const [x,z]of [[p.service.x,p.service.y],[a.x-10.1,a.y+a.h/2],[c.x+c.w+10.1,c.y+c.h/2],[w/2,h*.47]])assert.ok(q.some(([xx,zz])=>Math.hypot(x-xx,z-zz)<3.5),'unreachable '+w+' '+x+','+z);
  assert.equal(p.solids.some(s=>hit(p.service.x,p.service.y,13,s)),false);assert.equal(p.service.y,h*.35);
 }
});
test('stock uses shaped bottle instances, multiple colors, labels and capped draw calls without lights',()=>{
 const {root,solids}=L.build(T,{x:0,y:0,w:128,h:128});assert.ok(root.userData.liquorStore.bottles>=350);assert.ok(root.children.length<=20);assert.equal(solids.length,8);
 let shaped=0,labels=0;root.traverse(o=>{assert.ok(!o.isLight);if(!o.isInstancedMesh)return;assert.ok(o.userData.noBatch);if(o.geometry.type==='LatheGeometry')shaped+=o.count;if(o.material.map)labels+=o.count;const m=new T.Matrix4();for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);assert.ok(m.elements.every(Number.isFinite));assert.ok(m.elements[0]!==0||m.elements[2]!==0);}});assert.equal(shaped,root.userData.liquorStore.bottles);assert.ok(labels>=shaped);
});
test('the real venue builder selects liquor stores only and retains door, station and cover',()=>{
 const src=fs.readFileSync('public/game/expansion.js','utf8'),fn=src.slice(src.indexOf('function buildVenue(v){'),src.indexOf('const _expBuildCity=buildCity;'));
 const box=(w,h,d,m)=>new T.Mesh(new T.BoxGeometry(w,h,d),m),ctx={THREE:T,window:{level29LiquorStore:L},level29LiquorStore:L,terrainHeight:()=>7,cityGroup:new T.Group(),venueFloorTex:()=>new T.Texture(),softTex:new T.Texture(),addSign(){},box,addPart(g,w,h,d,x,y,z,m){const mesh=box(w,h,d,m);mesh.position.set(x,y,z);g.add(mesh);return mesh}};vm.createContext(ctx);vm.runInContext(fn,ctx);
 const v={id:'retail',name:'NEIGHBORHOOD LIQUOR STORE',b:{x:0,y:0,w:128,h:128},col:'#91714c',doorW:51.2,doorX:64,doorY:128,stationX:64,stationY:44.8,furniture:[]};ctx.buildVenue(v);assert.equal(v.referenceLiquor,true);assert.equal(v.stationX,64);assert.equal(v.stationY,44.8);assert.equal(v.mesh.position.y,7);assert.ok(v.door&&v.pad);assert.deepEqual(v.furniture,L.plan(v.b).solids);assert.ok(v.mesh.getObjectByName('Liquor checkout cover'));assert.equal(L.matches({id:'retail',name:'TOY STORE'}),false);assert.equal(L.matches({id:'gas',name:'LIQUOR STORE'}),false);
 const C=require('../public/game/interior-core.js');assert.deepEqual(C.plan(v).props,[]);
});
test('raised translated builds retain consistent stock transforms and shared per-room geometry',()=>{
 const a=L.build(T,{x:0,y:0,w:128,h:128}),b=L.build(T,{x:300,y:700,w:128,h:128},22),m=new T.Matrix4(),n=new T.Matrix4();for(let i=0;i<a.root.children.length;i++){const x=a.root.children[i],y=b.root.children[i];if(!x.isInstancedMesh){assert.equal(y.position.y-x.position.y,22);continue;}assert.equal(x.count,y.count);for(let j=0;j<x.count;j++){x.getMatrixAt(j,m);y.getMatrixAt(j,n);for(const [k,d]of [[12,300],[13,22],[14,700]])assert.ok(Math.abs(n.elements[k]-m.elements[k]-d)<.001);}}
});
test('curated store skips generic architectural finish passes rather than overlaying its shelves',()=>{
 const c={window:{},level29InteriorRealism:{upgrade(){throw Error('do not repaint bottle stock')}},level29InteriorRuntime:{record(){}},buildVenue(){},buildCity(){},update(){},city:{world:true,venues:[]}};vm.createContext(c);vm.runInContext(fs.readFileSync('public/game/interior-finish-runtime.js','utf8'),c);const source=new T.Group();c.buildVenue({referenceLiquor:true,mesh:source});c.window.level29InteriorFinishes.register(source,{x:0,y:0,w:128,h:128},0,{referenceLiquor:true});assert.equal(c.window.level29InteriorFinishes.sites.length,0);
});
