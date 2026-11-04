'use strict';
(function(){
function create(){
 const m=makeFigure(false),u=m.userData;
 m.name='Captain Smith · Station Commander';u.identity='captain-smith';
 setFigureColors(m,'#70442f','#14171c','#202834','#161213');
 u.head.scale.z*=1.04;u.jaw.scale.z*=1.04;u.longHair.visible=false;u.hair.visible=false;
 const hair=new THREE.MeshStandardMaterial({color:'#181311',roughness:.94}),gold=new THREE.MeshStandardMaterial({color:'#c7a25d',roughness:.5,metalness:.45});
 // Swept-back, sectioned braids matching the supplied reference, with a small back bun.
 const braidGeo=new THREE.SphereGeometry(1,10,7);
 for(let row=0;row<7;row++){const z=(row-3)*.56;
  for(let step=0;step<5;step++){const x=1.3-step*.7,y=20.25+Math.sin(step/4*Math.PI)*.55;
   const p=new THREE.Mesh(braidGeo,hair);p.position.set(x,y,z);p.scale.set(.48,.28,.3);u.body.add(p);}
 }
 const bun=new THREE.Mesh(braidGeo,hair);bun.position.set(-2.2,19.3,0);bun.scale.set(.7,.8,1);u.body.add(bun);
 const badge=new THREE.Mesh(new THREE.CircleGeometry(.85,6),gold);badge.rotation.y=Math.PI/2;badge.position.set(2.45,13,-1.65);u.body.add(badge);
 function patch(text,z,w){const c=document.createElement('canvas');c.width=256;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#14171c';ctx.fillRect(0,0,256,128);ctx.strokeStyle='#d7b563';ctx.lineWidth=9;ctx.strokeRect(5,5,246,118);ctx.fillStyle='#f6edda';ctx.font='bold 38px sans-serif';ctx.textAlign='center';ctx.fillText(text[0],128,51);ctx.fillText(text[1],128,99);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;const p=new THREE.Mesh(new THREE.PlaneGeometry(w,1.8),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));p.rotation.y=Math.PI/2;p.position.set(2.53,12.8,z);u.body.add(p);}
 patch(['CAPTAIN','SMITH'],1.65,2.4);patch(['LEVEL 29','POLICE'],-1.65,2);
 m.traverse(o=>{o.userData.noBatch=true;});return m;
}
if(typeof module!=='undefined')module.exports={create};if(typeof window!=='undefined')window.level29CaptainSmith={create};
})();
