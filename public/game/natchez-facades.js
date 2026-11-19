'use strict';
(function(){
const caches=new WeakMap();
function eligible(b,height,entry){
 if(!entry||b.venue||b.uploadAsset||!['normal','tower','helipad'].includes(b.kind)||height<80)return false;
 const match=/^#([0-9a-f]{6})$/i.exec(b.col||'');if(!match)return false;const rgb=[0,2,4].map(i=>parseInt(match[1].slice(i,i+2),16)),[r,g,blue]=rgb;if(Math.max(...rgb)-Math.min(...rgb)<20||!(blue>r+12||r>g+15&&blue>=g))return false;
 const dx=Math.max(b.x-entry.x,0,entry.x-b.x-b.w),dy=Math.max(b.y-entry.y,0,entry.y-b.y-b.h);
 return Math.hypot(dx,dy)<=550;
}
function finish(T,color,type,canvas){
 let cache=caches.get(T);if(!cache){cache=new Map();caches.set(T,cache);}const key=color+type;if(cache.has(key))return cache.get(key);
 const wall=new T.Color(color).lerp(new T.Color('#9c998d'),.4),wallCSS='#'+wall.getHexString(),W=256,H=256;
 function atlas(kind){const cv=canvas();cv.width=W;cv.height=H;const g=cv.getContext('2d');g.fillStyle=kind==='color'?wallCSS:kind==='rough'?'#ededed':'#888888';g.fillRect(0,0,W,H);
  // Large plaster patches and fine aggregate, deterministic and generated once.
  for(let i=0;i<1200;i++){const x=(i*73+11)%W,y=(i*47+Math.floor(i/256)*17)%H;g.fillStyle=kind==='color'?(i%2?'rgba(19,29,25,.07)':'rgba(255,248,225,.09)'):i%2?'#808080':'#959595';if(kind!=='rough')g.fillRect(x,y,1+i%3,1+i%2);}
  for(const x of [22,150]){const y=38,w=80,h=154;g.fillStyle=kind==='color'?'#343c3d':kind==='rough'?'#d0d0d0':'#555555';g.fillRect(x-5,y-5,w+10,h+14);g.fillStyle=kind==='color'?'#d4cbbb':kind==='rough'?'#dddddd':'#aaaaaa';g.fillRect(x-2,y-2,w+4,h+4);
   if(kind==='color'){const grad=g.createLinearGradient(x,y,x+w,y+h);grad.addColorStop(0,'#809ba3');grad.addColorStop(.35,'#425b66');grad.addColorStop(1,'#182e38');g.fillStyle=grad;}else g.fillStyle=kind==='rough'?'#484848':'#777777';g.fillRect(x,y,w,h);
   g.fillStyle=kind==='color'?'rgba(201,225,225,.21)':kind==='rough'?'#555555':'#777777';g.fillRect(x+5,y+5,11,h-10);
   g.fillStyle=kind==='color'?'#bdb9a9':kind==='rough'?'#cccccc':'#aaaaaa';g.fillRect(x+w/2-1,y,2,h);g.fillRect(x,y+h*.5,w,2);g.fillRect(x-7,y+h+2,w+14,4);
   if(kind==='color'){g.fillStyle='rgba(26,34,31,.2)';g.fillRect(x-5,y+h+6,w+10,9);}
  }
  const map=new T.CanvasTexture(cv);map.wrapS=map.wrapT=T.RepeatWrapping;map.minFilter=T.LinearMipmapLinearFilter;map.magFilter=T.LinearFilter;map.generateMipmaps=true;if(kind==='color')map.encoding=T.sRGBEncoding;return map;
 }
 const m=new T.MeshStandardMaterial({name:'Natchez weathered '+type,color:'#ffffff',map:atlas('color'),roughnessMap:atlas('rough'),bumpMap:atlas('bump'),bumpScale:.16,roughness:.95,metalness:0});m.userData.pbrDetail=true;m.userData.natchezFacade=true;cache.set(key,m);return m;
}
function apply(T,mesh,b,height,entry,canvas){if(!eligible(b,height,entry)||!Array.isArray(mesh.material)||mesh.material.length!==6)return false;const m=finish(T,b.col||'#9ba8a8',b.kind,canvas);mesh.material=[m,m,mesh.material[2],mesh.material[3],m,m];return true;}
const api={eligible,finish,apply};if(typeof module!=='undefined')module.exports=api;if(typeof window==='undefined')return;window.level29NatchezFacades=api;if(window.level29FacadeReview)return;
const box=buildingBox;buildingBox=function(b,h){const m=box.apply(this,arguments);apply(THREE,m,b,h,typeof city==='undefined'?null:city?.riverboatHub?.entry,()=>document.createElement('canvas'));return m;};
})();
