'use strict';
(function(){
function size(w,h,quality='low'){const width=quality==='high'?1024:512;return {width,height:Math.max(64,Math.min(1024,Math.round(width*Math.max(.01,h)/Math.max(.01,w))))};}
function cache(limit=64){const maps=new Map();let hits=0,misses=0;return {get(key,create){if(maps.has(key)){hits++;return maps.get(key);}misses++;const value=create();if(maps.size<limit)maps.set(key,value);return value;},get stats(){return {entries:maps.size,hits,misses};},clear(){maps.clear();}};}
const api={size,cache};if(typeof module!=='undefined')module.exports=api;if(typeof window==='undefined')return;const signs=cache();window.level29StartupTextures={...api,signs};
// Owned canvas creation was 1024-wide even for tiny labels; create once per text/palette/aspect/quality.
const sign=addSign;addSign=function(group,text,w,h,x,y,z,col){const quality=window.level29Graphics?.quality||'low',s=size(w,h,quality),key=JSON.stringify([text,col,s.width,s.height]);let captured=null;
 const texture=signs.get(key,()=>{const g=new THREE.Group(),m=sign.call(this,g,text,w,h,0,0,0,col);captured=m;return m.material.map;});
 if(captured){captured.position.set(x,y,z);group.add(captured);return captured;}
 const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));m.position.set(x,y,z);m.name='venue-sign:'+text;group.add(m);return m;};
})();
