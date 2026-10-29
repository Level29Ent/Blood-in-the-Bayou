const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const {overlap,mountain,valid}=require('../public/game/city-zoning.js');
test('building clearance rejects close frontage even when rectangles do not overlap',()=>{const a={x:100,y:100,w:100,h:100};assert.equal(overlap(a,{x:220,y:100,w:100,h:100},32),true);assert.equal(overlap(a,{x:232,y:100,w:100,h:100},32),false);});
test('mountain zoning rejects footprints including the buffer around mountain features',()=>{const c={features:[{kind:'mountain',x:300,y:300,w:300,h:300}]};assert.equal(mountain(c,{x:310,y:310,w:80,h:80}),true);assert.equal(mountain(c,{x:200,y:200,w:70,h:70}),true);assert.equal(mountain(c,{x:100,y:100,w:80,h:80}),false);});
test('lowland relocation rejects roads, water and reserved building clearance',()=>{const c={g:Array(400).fill(0),features:[]},b={x:64,y:64,w:32,h:32};assert.equal(valid(c,b,[],16,20,20,[1,2]),true);c.g[4*20+4]=1;assert.equal(valid(c,b,[],16,20,20,[1,2]),false);c.g.fill(0);assert.equal(valid(c,b,[{x:105,y:64,w:32,h:32}],16,20,20,[1,2]),false);});
test('all devices use the fixed lightweight policy without menu or keyboard selection',()=>{
 const THREE=require('../public/game/three.min.js');
 for(const touch of [true,false]){let appended=0,keys=0;const ctx={THREE,localStorage:{getItem:()=> 'high',setItem(){}},matchMedia:()=>({matches:touch}),window:{},document:{createElement:()=>({style:{},addEventListener(){}}),querySelector:()=>({appendChild(){appended++;}})},initGL(){},render(){},addEventListener(){keys++;}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync('public/game/graphics.js','utf8'),ctx);assert.equal(ctx.window.level29Graphics.quality,'low');ctx.window.level29Graphics.setQuality('high');assert.equal(ctx.window.level29Graphics.quality,'low');assert.equal(appended,0);assert.equal(keys,0);
 }
});
