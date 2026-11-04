'use strict';
(function(){
let weave=null;const old=makeFigure;makeFigure=function(zombie){const m=old.apply(this,arguments);if(zombie)return m;if(!weave){weave=canvasTex(64,64,c=>{c.fillStyle='#888';c.fillRect(0,0,64,64);for(let i=0;i<64;i+=4){c.fillStyle='#999';c.fillRect(i,0,1,64);c.fillStyle='#777';c.fillRect(0,i,64,1);}});weave.wrapS=weave.wrapT=THREE.RepeatWrapping;weave.repeat.set(2,2);}
 const u=m.userData;for(const key of ['shirt','pants']){u[key].bumpMap=weave;u[key].bumpScale=.025;u[key].needsUpdate=true;}
 const g=new THREE.Group();g.name='tailored-business-detail';u.body.add(g);const q=level29World.batch(g),seam=level29World.material('#8d8d7f');q.box(.18,5,.18,2.4,12.4,-2.8,seam);q.box(.18,5,.18,2.4,12.4,2.8,seam);q.box(.2,.45,1.1,2.5,13.2,-1.8,seam);q.finish();return m;};
})();
