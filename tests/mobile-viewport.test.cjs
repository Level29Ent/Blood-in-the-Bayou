const {test}=require('node:test'),assert=require('node:assert/strict'),T=require('three');
const {fitViewmodel,hudLayout,fitText}=require('../public/game/mobile-viewport.js');
test('portrait weapon fits the lower right without changing weapon or muzzle coordinates',()=>{
 for(const [w,h]of [[360,740],[390,760],[430,844],[768,1024],[844,390]]){
  const c=new T.PerspectiveCamera(58,w/h,.1,100),point=new T.Vector3(1,-4,-12),before=point.clone().project(c);
  const scale=fitViewmodel(c,w,h),after=point.clone().project(c);
  assert.ok(Math.abs(after.x-(before.x*scale+(1-scale)*.65))<1e-6);
  assert.ok(Math.abs(after.y-(before.y*scale-(1-scale)*.95))<1e-6);
  assert.ok(point.distanceTo(after.clone().unproject(c))<1e-5,'inverse remains correct for tracers');
  const once=c.projectionMatrix.clone();fitViewmodel(c,w,h);assert.deepEqual(c.projectionMatrix.elements,once.elements,'resize does not accumulate scaling');
  fitViewmodel(c,h,w);if(h/w>=1.2){const normal=new T.PerspectiveCamera(58,h/w,.1,100);assert.deepEqual(c.projectionMatrix.elements,normal.projectionMatrix.elements);}
 }
});
test('mission text and status occupy separate columns on narrow phones and in landscape',()=>{
 for(const [w,h]of [[320,568],[360,740],[390,760],[430,844],[844,390]]){const l=hudLayout(w,h);assert.ok(18+l.missionWidth<w-18-l.statusWidth);assert.ok(l.missionWidth>=100);assert.ok(l.lineHeight>=l.missionFont);}
 assert.equal(hudLayout(1280,800).statusWidth,190);
});
test('long mission, area and banner labels fit their allotted width',()=>{
 const ctx={font:'',measureText(text){return {width:parseFloat(this.font.split(' ')[1])*text.length*.6};}};
 for(const text of ['FRENCH QUARTER','FRENCH QUARTER · CHARTRES ST & ST. CHARLES AVE','A LONG MISSION TITLE']){
  const size=fitText(ctx,text,32,280,'900 ');assert.ok(size<=32);ctx.font='900 '+size+'px font';assert.ok(ctx.measureText(text).width<=280.001);
 }
});
