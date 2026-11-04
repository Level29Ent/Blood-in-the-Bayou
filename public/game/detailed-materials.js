'use strict';
(function(){
// Original tileable PBR texture sets, shared per surface, no network downloads or new render passes.
const sets=new Map();
function textures(kind){if(sets.has(kind))return sets.get(kind);const n=256,height=new Float32Array(n*n),rgb=new Uint8Array(n*n*4),normal=new Uint8Array(n*n*4),rough=new Uint8Array(n*n*4);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const k=y*n+x,noise=Math.sin(x*127.1+y*311.7)*43758.5453,grain=noise-Math.floor(noise);let h=.5+(grain-.5)*.16;
 if(kind==='brick'){const row=Math.floor(y/32),xx=(x+(row%2)*32)%64;h=xx<3||y%32<3?.16:.65+(grain-.5)*.12;}
 if(kind==='tile')h=x%64<2||y%64<2?.25:.7+(grain-.5)*.035;
 if(kind==='wood')h=.5+.13*Math.sin(x*.35+Math.sin(y*.045)*2)+.035*(grain-.5);
 if(kind==='metal')h=.5+(grain-.5)*.055+.035*Math.sin(y*2.3);
 if(kind==='fabric')h=.5+.07*Math.sin(x*Math.PI/2)*Math.cos(y*Math.PI/2);
 if(kind==='plaster'){const pore=Math.sin(x*19.7+y*73.1)*43758.54;h-=pore-Math.floor(pore)>.975?.14:0;h+=.022*Math.sin(x*.09)*Math.cos(y*.11);}
 height[k]=h;const value=Math.round(218+(h-.5)*38),rv=kind==='metal'?150:kind==='tile'?170:kind==='wood'?210:235;
 rgb.set([value,value,value,255],k*4);rough.set([rv,rv,rv,255],k*4);
 }
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const dx=height[y*n+(x+n-1)%n]-height[y*n+(x+1)%n],dy=height[((y+n-1)%n)*n+x]-height[((y+1)%n)*n+x],v=new THREE.Vector3(dx,dy,1).normalize();normal.set([Math.round((v.x*.5+.5)*255),Math.round((v.y*.5+.5)*255),Math.round((v.z*.5+.5)*255),255],(y*n+x)*4);}
 const tex=(a,color=false)=>{const t=new THREE.DataTexture(a,n,n);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.repeat.set(2,2);if(color)t.encoding=THREE.sRGBEncoding;t.needsUpdate=true;return t;};
 const out={map:tex(rgb,true),normalMap:tex(normal),roughnessMap:tex(rough)};sets.set(kind,out);return out;
}
function kind(color,metal){if(metal>.4)return 'metal';const c=new THREE.Color(color),r=c.r,g=c.g,b=c.b;if(r>g*1.1&&g>b*1.1)return 'wood';return 'plaster';}
function apply(m,type='plaster',albedo=true){if(!m?.isMeshStandardMaterial||m.transparent||m.userData?.pbrDetail||m.name==='worldGround'||m.vertexColors)return m;if(m.name==='vehiclePaint'||m.name==='boatPaint')return m;const t=textures(type);if(albedo&&!m.map)m.map=t.map;if(!m.normalMap&&!m.bumpMap){m.normalMap=t.normalMap;m.normalScale.set(type==='brick'?.45:.22,type==='brick'?.45:.22);}if(!m.roughnessMap)m.roughnessMap=t.roughnessMap;m.userData={...m.userData,pbrDetail:true};m.needsUpdate=true;return m;}
window.level29SurfaceDetail={textures,apply,kind,get count(){return sets.size;}};
})();
