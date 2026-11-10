'use strict';
(function(){
// Keep a desktop-sized viewmodel from filling a narrow portrait viewport.
// Apply a clip-space fit, anchored at the lower right. This leaves the world
// camera and weapon transforms (including muzzle/tracer origins) unchanged.
function fitViewmodel(camera,width,height){
 const aspect=width/Math.max(1,height),scale=Math.min(1,aspect/1.2);
 camera.aspect=aspect;camera.updateProjectionMatrix();
 const p=camera.projectionMatrix.elements;
 if(scale<1){p[0]*=scale;p[5]*=scale;p[8]=-(1-scale)*.65;p[9]=(1-scale)*.95;}
 camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
 return scale;
}
function hudLayout(width,height){
 const small=width<700||height<500;
 const statusWidth=small?Math.min(140,Math.max(100,width*.34)):190;
 return {statusWidth,missionWidth:small?Math.max(100,width-statusWidth-44):430,missionFont:small?11:14,lineHeight:small?15:18};
}
function fitText(ctx,text,size,maxWidth,font='800 ',family='Barlow Condensed'){
 ctx.font=font+size+"px '"+family+"'";
 return Math.min(size,size*maxWidth/Math.max(1,ctx.measureText(text).width));
}
function labelClear(x,y,width,height,missionBottom=160){return x>10&&x<width-10&&y>Math.max(missionBottom+48,height<500?110:190)&&y<height-(height<500?120:230);}
const api={fitViewmodel,hudLayout,fitText,labelClear};
if(typeof module!=='undefined')module.exports=api;
if(typeof window!=='undefined')window.level29MobileViewport=api;
})();
