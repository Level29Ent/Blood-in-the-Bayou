const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const {pixelRatio}=require('../public/game/mobile-budget.js');
test('desktop displays cap GPU pixels instead of forcing full Retina/window resolution',()=>{
 for(const [w,h] of [[1280,800],[1920,1080],[2560,1440],[3840,2160]]){
  const r=pixelRatio(w,h,2,false);assert.ok(r<=1);assert.ok(w*h*r*r<=1500001);assert.equal(r,pixelRatio(h,w,2,false));
 }
});
function setup(){
 let time=0,ratio=1,renders=0;const changes=[];
 const c={window:{level29MobileBudget:{mobile:false,pixelRatio:()=>1}},document:{hidden:false,documentElement:{style:{}},head:{appendChild(){}},createElement:()=>({}),addEventListener(){}},navigator:{maxTouchPoints:0},matchMedia:()=>({matches:false}),addEventListener(){},turnView(){},cv:{},performance:{now:()=>time},innerWidth:1920,innerHeight:1080,devicePixelRatio:2,mpRole:null,state:'play',renderer:{getPixelRatio:()=>ratio,setPixelRatio:r=>{ratio=r;changes.push(r)}},render(){renders++;}};
 vm.createContext(c);vm.runInContext(fs.readFileSync('public/game/smooth.js','utf8'),c);
 return {c,changes,frame(dt){time+=dt;c.render();},get ratio(){return ratio},get renders(){return renders}};
}
test('slow desktop rendering now scales below 1x rather than remaining locked at 1x',()=>{
 const s=setup();for(let i=0;i<180;i++)s.frame(45);assert.ok(s.ratio<1);assert.ok(s.ratio>=.5);assert.equal(s.renders,180);
});
test('very slow desktop frames still trigger downscaling',()=>{
 const s=setup();for(let i=0;i<40;i++)s.frame(220);assert.ok(s.ratio<1);assert.ok(s.ratio>=.5);
});
test('fast frames recover resolution gradually without exceeding the cap',()=>{
 const s=setup();for(let i=0;i<180;i++)s.frame(45);const low=s.ratio;
 for(let i=0;i<1100;i++)s.frame(16);assert.ok(s.ratio>low);assert.ok(s.ratio<=1);
});
