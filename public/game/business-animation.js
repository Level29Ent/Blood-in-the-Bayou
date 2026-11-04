'use strict';
(function(){
const cloth=canvasTex(256,256,c=>{c.fillStyle='#888';c.fillRect(0,0,256,256);for(let i=0;i<256;i+=3){c.fillStyle=i%2?'#949494':'#777';c.fillRect(i,0,1,256);c.fillRect(0,i,256,1);}});cloth.wrapS=cloth.wrapT=THREE.RepeatWrapping;
const make=makeFigure;makeFigure=function(zombie){const m=make.apply(this,arguments);if(!zombie){for(const key of ['shirt','pants']){m.userData[key].bumpMap=cloth;m.userData[key].bumpScale=.035;}const u=m.userData,q=level29World.batch(u.body),seam=level29World.material('#7c8077');q.box(.12,4,.14,2.4,12.5,-2.4,seam);q.box(.12,4,.14,2.4,12.5,2.4,seam);q.finish();}return m;};
const skinDetail=canvasTex(256,256,c=>{c.fillStyle='#888';c.fillRect(0,0,256,256);const random=mkRng(29083);for(let i=0;i<2500;i++){c.fillStyle=i%2?'#939393':'#7b7b7b';c.fillRect(random()*256,random()*256,1,1);}});
let root=null,actors=[];
const sync=syncDynamic;syncDynamic=function(){sync.apply(this,arguments);if(!player||state==='menu')return;if(root!==cityGroup){root=cityGroup;actors=[];scene?.traverse(m=>{if(m.userData?.identity&&m.userData.head)actors.push(m);});}
 for(const v of city?.venues||[])for(const s of v.staff||[])if(!actors.includes(s.m))actors.push(s.m);
 for(const m of actors){const u=m.userData;if(!u?.body||!u.armL)continue;if(!u.businessPolished){u.businessPolished=true;if(u.skin){u.skin.bumpMap=skinDetail;u.skin.bumpScale=.012;u.skin.needsUpdate=true;}if(u.identity==='damion'&&u.jaw){u.jaw.scale.z*=.94;u.head.scale.y*=1.03;}if(u.identity==='dayshawn'&&u.jaw)u.jaw.scale.z*=1.03;}const p=new THREE.Vector3();m.getWorldPosition(p);const d=Math.hypot(p.x-player.x,p.z-player.y);if(d>150)continue;const talking=(state==='shop'||state==='talk')&&d<65;u.body.position.y=Math.sin(frame*.025)*.1;u.armL.rotation.z=.06+Math.sin(frame*.035)*.035;u.armR.rotation.z=-.06-(talking?Math.sin(frame*.08)*.18:Math.sin(frame*.025)*.035);u.head.rotation.z=Math.sin(frame*.02)*.025;if(talking)u.armR.rotation.x=Math.sin(frame*.055)*.16;}
};
})();
