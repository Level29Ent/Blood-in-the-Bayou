const {test}=require('node:test'),assert=require('node:assert/strict'),T=require('three'),fs=require('node:fs');
const R=require('../public/game/city-renewal.js'),S=require('../public/game/prologue-story.js'),C=require('../public/game/prologue-crowd.js'),{buildNatchezExterior}=require('../public/game/riverboat-hub.js'),{layout}=require('../public/game/mall-gardens.js'),Shop=require('../public/game/retail-stock.js');
function map(){const width=60,height=60,g=new Uint8Array(width*height);for(let x=2;x<58;x++)for(let dy=0;dy<3;dy++)g[(5+dy)*width+x]=1;return {width,height,g,get:(x,y)=>g[Math.floor(y)*width+Math.floor(x)]??4,heightAt:()=>0};}
test('waterfront road is a connected three-tile corridor without consuming protected parcels',()=>{
 const c=map(),b={x:700,y:500,w:240,h:256};const path=R.accessRoad(c,{x:1000,y:1300},[b]);assert.ok(path.length>10);R.paintRoad(c,path,[b]);for(const p of path){assert.equal(c.get(p.x/32|0,p.y/32|0),1);assert.ok(!R.overlap({x:p.x-16,y:p.y-16,w:32,h:32},b,6));}assert.ok(path.every((p,i)=>!i||Math.hypot(p.x-path[i-1].x,p.y-path[i-1].y)===32));
 const copy=map();copy.g.fill(0);for(let x=2;x<58;x++)copy.g[5*60+x]=1;copy.g[20*60+30]=4;const bridgePath=R.accessRoad(copy,{x:976,y:1000},[]);R.paintRoad(copy,bridgePath,[]);assert.equal(copy.g[20*60+30],9);
});
test('roadside parcels include homes apartments offices and towers with clear public approaches',()=>{
 const c=map();for(let y=4;y<58;y+=12)for(let x=2;x<58;x++)c.g[y*60+x]=1;const reserved=[{x:256,y:256,w:128,h:128}],p=R.parcels(c,reserved,20);assert.ok(p.lots.length>=8);assert.equal(new Set(p.lots.map(b=>b.kind)).size,4);for(const [i,b]of p.lots.entries()){assert.ok(!reserved.some(r=>R.overlap(b,r,32)));for(let j=0;j<i;j++)assert.ok(!R.overlap(b,p.lots[j],24));assert.ok(p.walks[i].length);}
 const mats=Object.fromEntries(['wall','trim','roof','door','window'].map(k=>[k,new T.MeshLambertMaterial()]));for(const b of p.lots.slice(0,4)){const model=R.building(T,b,mats);assert.ok(model.children.length<=5);assert.ok(model.children.every(m=>m.isInstancedMesh));}
});
test('festival extension adds two 256-unit street blocks to the old outgoing route',()=>{
 const width=100,mask=new Uint8Array(width*width).fill(1),nav={mask,point:k=>({x:(k%width+.5)*32,y:(k/width|0)*32+16}),nearest:(x,y)=>(y/32|0)*width+(x/32|0)},start={x:800,y:800};
 const old=S.paradeRoute(nav,start,width,26),long=S.paradeRoute(nav,start,width,26,2),length=p=>p.reduce((n,q,i)=>n+(i?Math.hypot(q.x-p[i-1].x,q.y-p[i-1].y):0),0);assert.ok(length(long)>=length(old)+1024);for(const [i,p]of long.entries())if(i)assert.equal(Math.hypot(p.x-long[i-1].x,p.y-long[i-1].y),32);
});
test('sidewalk spectators never occupy road or water and raise hands without a walking stride',()=>{
 const route=[{x:0,y:0},{x:32,y:0},{x:64,y:0},{x:96,y:0},{x:64,y:0},{x:32,y:0}],tile=(x,y)=>Math.abs(y)<20?1:Math.abs(y)>45?4:2;
 const spectators=C.spectators(route,tile,()=>false,20);assert.ok(spectators.length);for(const a of spectators){assert.equal(tile(a.x,a.y),2);assert.equal(a.cheer,true);}const root=C.create(T,10);C.pose(T,root,[spectators[0]],()=>0);const matrix=new T.Matrix4();root.children[2].getMatrixAt(0,matrix);assert.ok(matrix.elements[13]>18);
});
test('Natchez exterior is at the actual boarding landing and has hull, galleries, chimneys and paddlewheel',()=>{
 const landing={x:5688,y:6400},boat=buildNatchezExterior(T,landing),box=new T.Box3().setFromObject(boat);assert.ok(box.min.x<landing.x+60);assert.ok(box.max.x>landing.x+240);assert.ok(box.max.y>130);assert.equal(boat.children[0].geometry.type,'ExtrudeGeometry');assert.ok(!boat.children.some(o=>o.name==='Riverboat deck 1'));assert.equal(boat.userData.floors.length,3);assert.ok(boat.userData.floors.every(g=>g.visible));assert.ok(boat.userData.wheel.children.length>10);
});
test('mall expands to 26 unique stores, retaining door width and original boutiques',()=>{
 const b={x:100,y:100,w:576,h:416},l=layout(b);assert.equal(l.shops.length,26);assert.equal(new Set(l.shops.map(s=>s.name)).size,26);for(const name of ['CRESCENT PHARMACY','CRESCENT BAKERY','HOMEWARES STORE','GAME STORE','COSMETICS STORE','CAMERA SHOP','29 CUISINE'])assert.ok(l.shops.some(s=>s.name===name));for(const s of l.shops){assert.ok(s.room.w>=70);assert.ok(s.room.x>b.x&&s.room.x+s.room.w<b.x+b.w);}
});
test('retail purchases charge once, clamp benefits and reject invalid or unnecessary sales',()=>{
 assert.equal(Shop.purchase('fruit',34,50,100),null);assert.equal(Shop.purchase('fruit',100,100,100),null);assert.deepEqual(Shop.purchase('fruit',100,95,100),{cash:65,hp:100,armor:0});assert.deepEqual(Shop.purchase('armor',200,50,100,40),{cash:20,hp:50,armor:50});assert.equal(Shop.purchase('unknown',999,0,100),null);assert.equal(Shop.purchase('water',NaN,50,100),null);const root=Shop.stock(T,56);assert.equal(root.children.length,5);assert.ok(root.children.every(m=>m.isInstancedMesh&&m.count>0));
});
test('HUD does not duplicate the primary objective and waypoints follow the measured mission bottom',()=>{
 const state=fs.readFileSync('public/game/mission-state.js','utf8'),guide=fs.readFileSync('public/game/mission-guidance.js','utf8');assert.ok(state.includes("hud.style.display='none';hud.setAttribute('aria-hidden','true')"));assert.ok(guide.includes('var(--hud-mission-bottom,150px) + 8px'));assert.ok(guide.includes('screen.y>Math.max(200,SH*.26)'));
});
test('surface road outside corner lanes stay at ground; legacy grade helper still reaches its endpoint',()=>{
 const R=require('../public/game/foundation-road.js'),B={left:128,top:96,right:5984,bottom:5984};for(const x of [B.left,B.right])for(const y of [B.top,B.bottom])for(const dx of [-42,0,42])for(const dy of [-42,0,42])assert.equal(R.deckHeight(B,x+dx,y+dy),0);
 for(const length of [160,220,300]){const path=[{x:0,y:0},{x:length,y:0}];assert.equal(R.routeHeight(path,length,0,40),0);assert.ok(R.routeHeight(path,length/2,0,40)>0);}
});
