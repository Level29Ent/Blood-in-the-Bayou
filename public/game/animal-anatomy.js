'use strict';
(function(){
 const sphere=new THREE.SphereGeometry(1,12,8),cone=new THREE.ConeGeometry(1,1,8),shapes=new Map();
 function ell(g,w,h,d,x,y,z,mat){const key=[w,h,d].join(',');if(!shapes.has(key))shapes.set(key,sphere.clone().scale(w/2,h/2,d/2));const m=new THREE.Mesh(shapes.get(key),mat);m.position.set(x,y,z);g.add(m);return m;}
 function tip(g,x,y,z,w,h,d,mat){const m=new THREE.Mesh(cone,mat);m.scale.set(w,h,d);m.position.set(x,y,z);g.add(m);return m;}
 function details(g,kind,material){
  const dark=material('#211f1b'),ivory=material('#d8ccb0'),pink=material('#c28c7b');
  if(kind==='dog'||kind==='cat'){
   const cat=kind==='cat',hx=cat?4.69:6.04,hy=cat?7:8;
   for(const side of [-1,1]){
    // Visible forward muzzle pads and eye glints, rather than a faceless block.
    ell(g,1.5,.9,1.05,hx+1.2,hy-.5,side*.55,ivory);
    ell(g,.18,.18,.18,hx+1.5,hy+.65,side*.92,ivory);
    for(let i=0;i<3;i++)ell(g,1.6,.07,.07,hx+1.25,hy-.5+i*.18,side*(1.2+i*.2),ivory);
   }
   ell(g,.6,.5,.7,hx+2,hy-.15,0,dark);
   if(cat){for(let i=0;i<4;i++)for(const side of [-1,1])ell(g,.5,2.5,.2,-2+i*1.2,5.2,side*1.45,dark);}
   else{ell(g,5,1.7,3.6,-.6,6.4,0,dark);}
  }
  if(kind==='pig'){
   for(const side of [-1,1])ell(g,.25,.45,.35,8.7,8.2,side*.62,dark);
   const curl=new THREE.Mesh(new THREE.TorusGeometry(.65,.16,6,14,Math.PI*1.8),pink);curl.position.set(-4.7,5.3,0);curl.rotation.y=Math.PI/2;g.add(curl);
  }
  return g;
 }
 const api={ell,tip,details};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29AnimalAnatomy=api;
})();
