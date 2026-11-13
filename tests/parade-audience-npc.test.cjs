const {test}=require('node:test'),assert=require('node:assert/strict'),T=require('three'),fs=require('node:fs'),vm=require('node:vm');
const A=require('../public/game/npc-appearance.js'),C=require('../public/game/prologue-crowd.js');
function route(){const out=[];for(let x=0;x<=1056;x+=32)out.push({x,y:0});return out.concat(out.slice(1,-1).reverse());}
const tile=(x,y)=>Math.abs(y)<64?1:Math.abs(y)<116?2:0;
test('sidewalk audience triples from 128 to 384 with cheering variety, road clearance and no overlap',()=>{
 const old=C.spectators(route(),tile,()=>false,128),now=C.spectators(route(),tile,()=>false,384);assert.equal(old.length,128);assert.equal(now.length,old.length*3);assert.equal(new Set(now.map(a=>a.reaction)).size,4);assert.equal(new Set(now.map(a=>a.id)).size,384);
 for(const [i,a]of now.entries()){assert.equal(tile(a.x,a.y),2);assert.ok(a.cheer);assert.ok(now.slice(i+1).every(b=>Math.hypot(b.x-a.x,b.y-a.y)>=13));assert.ok([-5,5].every(dx=>[-5,5].every(dy=>tile(a.x+dx,a.y+dy)===2)));}
 assert.ok(Math.min(...now.map(a=>a.x))<50&&Math.max(...now.map(a=>a.x))>1000);
 const blocked=C.spectators(route(),tile,(x,y)=>x>400&&x<600,384);assert.ok(blocked.every(a=>a.x<=400||a.x>=600));assert.equal(C.spectators(route(),()=>1,()=>false,384).length,0);
});
function crowd(){const c={window:{level29NPCAppearance:A}};vm.createContext(c);vm.runInContext(fs.readFileSync('public/game/prologue-crowd.js','utf8'),c);return c.window.level29PrologueCrowd;}
test('detailed crowd retains nine instanced batches with facial/anatomical geometry and shared textures',()=>{
 const D=crowd(),root=D.create(T,768);assert.equal(root.children.length,9);assert.ok(root.userData.detailed);assert.ok(root.children[1].geometry.attributes.color);assert.ok(root.children[1].geometry.attributes.position.count>1000);assert.ok(root.children[0].material.bumpMap);assert.ok(root.children.every(m=>m.isInstancedMesh));
 const actors=C.spectators(route(),tile,()=>false,384).concat(C.procession());D.pose(T,root,actors,()=>0);assert.equal(root.children[0].count,714);for(const m of root.children){assert.ok(m.count<=m.instanceMatrix.count);const matrix=new T.Matrix4();for(let i=0;i<m.count;i++){m.getMatrixAt(i,matrix);assert.ok(matrix.elements.every(Number.isFinite));}}
 D.pose(T,root,[],()=>0);assert.ok(root.children.every(m=>m.count===0));
});
test('wave clap dance and watching poses differ without moving spectators off their sidewalk',()=>{
 const D=crowd(),root=D.create(T,4),actors=['wave','clap','dance','watch'].map((reaction,id)=>({id,x:0,y:80,a:0,anim:1,wait:999,cheer:true,reaction}));D.pose(T,root,actors,()=>0);const a=new T.Matrix4(),b=new T.Matrix4();root.children[2].getMatrixAt(0,a);root.children[2].getMatrixAt(2,b);assert.notDeepEqual(a.elements,b.elements);assert.ok(actors.every(a=>a.x===0&&a.y===80));
});
test('shared NPC rig gains PBR skin/cloth and reused anatomical hands while preserving colors, rig and infected eyes',()=>{
 const ctx={window:{level29NPCAppearance:A},THREE:T,MAT:{eye:new T.MeshBasicMaterial({color:'red'})},lam:c=>new T.MeshLambertMaterial({color:c})};vm.createContext(ctx);const source=fs.readFileSync('public/game/fp.js','utf8');vm.runInContext(source.slice(source.indexOf('let FIG = null;'),source.indexOf('function makeBoss(')),ctx);
 const a=ctx.makeFigure(false),b=ctx.makeFigure(false),z=ctx.makeFigure(true);assert.ok(a.userData.skin.isMeshStandardMaterial);assert.ok(a.userData.shirt.bumpMap);assert.equal(a.userData.skin.bumpMap,b.userData.skin.bumpMap);assert.equal(a.userData.npcAppearance,true);const hand=m=>m.userData.armL.children.find(o=>o.position.y< -7);assert.equal(hand(a).geometry,hand(b).geometry);assert.ok(hand(a).geometry.attributes.position.count>1000);assert.ok(a.userData.face.children.length>=15);assert.ok(z.userData.eyes);assert.equal(z.userData.face,null);
 ctx.setFigureColors(a,'#bc8051','#445566','#334422','#111111');assert.equal(a.userData.skin.color.getHexString(),'bc8051');const body=a.userData.body;A.apply(T,a);assert.equal(a.userData.body,body);
});
