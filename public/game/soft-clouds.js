'use strict';
(function(){
// One shared, soft-edged original alpha texture replaces overlapping faceted spheres.
function build(T,doc,random=Math.random){const c=doc.createElement('canvas');c.width=256;c.height=128;const ctx=c.getContext('2d');if(!ctx)return null;for(let i=0;i<9;i++){const x=35+i*23,y=61+Math.sin(i*2.4)*15,r=28+(i%3)*5,g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(255,255,255,.55)');g.addColorStop(.45,'rgba(255,255,255,.3)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}const map=new T.CanvasTexture(c);map.encoding=T.sRGBEncoding;const material=new T.MeshBasicMaterial({color:'#edf2ed',map,transparent:true,opacity:.48,depthWrite:false,side:T.DoubleSide,fog:false});const geometry=new T.PlaneGeometry(200,100);return {create(){const cloud=new T.Group(),m=new T.Mesh(geometry,material);m.rotation.x=-Math.PI/2;m.rotation.z=random()*Math.PI;cloud.add(m);cloud.scale.setScalar(.8+random()*.8);return cloud;},material,geometry,map};}
const api={build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29SoftClouds=api;
})();
