'use strict';
(function(){
function groundSize(world,quality='low',gpuLimit=4096){const cap=Math.max(1,Math.min(quality==='high'?4096:quality==='medium'?3072:2048,gpuLimit||2048)),pixels=Math.min(Math.round(world*(world>4000?.75:1)),cap);return {pixels,scale:pixels/world};}
function releaseGround(root,currentCanvas){if(!root)return {textures:0,materials:0};const mats=new Set(),textures=new Set();root.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material])if(m?.name==='worldGround'){mats.add(m);if(m.map)textures.add(m.map);}});for(const t of textures){t.dispose();const image=t.image;if(image&&image!==currentCanvas&&typeof image.getContext==='function'){image.width=1;image.height=1;}}for(const m of mats)m.dispose();return {textures:textures.size,materials:mats.size};}
if(typeof module!=='undefined')module.exports={groundSize,releaseGround};if(typeof window!=='undefined')window.level29GroundMemory={groundSize,releaseGround};
})();
