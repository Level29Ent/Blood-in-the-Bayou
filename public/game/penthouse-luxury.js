'use strict';
(function(){
function plan(b){const cx=b.x+b.w/2,cy=b.y+b.h/2;return {solids:[{x:b.x+7,y:cy-29,w:25,h:58,kind:'cloud-sofa'},{x:cx-43,y:cy-5,w:23,h:22,kind:'marble-tables'},{x:b.x+b.w-31,y:cy-2,w:23,h:31,kind:'rounded-chaise'},{x:b.x+b.w-25,y:b.y+6,w:19,h:42,kind:'marble-bar'}]};}
function build(T,b,{base=105}={}){const root=new T.Group();root.name='Ronniebaby · sculptural luxury lounge';root.position.set(b.x,base,b.y);root.userData.noBatch=true;const p=plan(b),batches=new Map(),dummy=new T.Object3D(),cube=new T.BoxGeometry(1,1,1),sphere=new T.SphereGeometry(1,16,10),cyl=new T.CylinderGeometry(1,1,1,16),torus=new T.TorusGeometry(1,.1,6,24),color=new T.Color();
 const material=(c,e={})=>new T.MeshStandardMaterial({color:c,roughness:.75,...e}),cream=material('#e7dfcd'),pillow=material('#f0e8d8'),gold=material('#c8a653',{metalness:.65,roughness:.33}),black=material('#252d31'),wood=material('#8f6642'),purple=material('#652e77'),green=material('#204c39'),glass=material('#d3dfdc',{transparent:true,opacity:.14,depthWrite:false,roughness:.14}),glow=new T.MeshBasicMaterial({color:'#fff0c9'}),leaf=material('#2a5c40'),soil=material('#413c2d'),stone=material('#e4dbc8',{roughness:.4});
 // One small deterministic marble texture is shared by interlocking tables and island.
 const size=128,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const vein=Math.pow(Math.max(0,Math.sin(x*.1+y*.17+Math.sin(y*.12)*1.6)),28),v=239-vein*65;data.set([v,v*.98,v*.94,255],(y*size+x)*4);}const map=new T.DataTexture(data,size,size);map.encoding=T.sRGBEncoding;map.wrapS=map.wrapT=T.RepeatWrapping;map.needsUpdate=true;stone.map=map;
 function emit(g,m,x,y,z,sx,sy,sz,rotation=[0,0,0],tint){dummy.position.set(x,y,z);dummy.rotation.set(...rotation);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();if(!batches.has(g))batches.set(g,new Map());const by=batches.get(g);if(!by.has(m))by.set(m,[]);by.get(m).push({matrix:dummy.matrix.clone(),tint});}
 const box=(m,w,h,d,x,y,z)=>emit(cube,m,x,y,z,w,h,d),ball=(m,x,y,z,rx,ry,rz)=>emit(sphere,m,x,y,z,rx,ry,rz),cx=b.w/2,cy=b.h/2;
 emit(cyl,black,30,1.35,cy,27,.15,35);
 // Rounded modular sofa stays in the original left-side sofa footprint.
 for(let i=0;i<4;i++){const z=cy-21+i*14;ball(cream,19,5,z,11,4,8);ball(pillow,12,11,z,4.5,7,8);ball(pillow,21,8,z,8,2.7,6.6);if(i%2===0)ball(i===0?green:purple,15.5,12,z,2.1,4.2,4.5);for(const side of [-1,1])emit(cyl,gold,19+side*7,2,z,1,2,1);}
 for(const z of [cy-26,cy+26])ball(cream,21,8,z,10,5,3);
 // Pale interlocking block tables, gold base strips and glass dish.
 for(const [x,z,w,d,y]of [[cx-32,cy+1,21,10,8],[cx-32,cy+12,14,10,6.7]]){box(stone,w,y,d,x,1+y/2,z);box(gold,w+.2,.35,d+.2,x,1.6,z);}
 emit(cyl,glass,cx-31,9.2,cy+1,3,.3,3);emit(cyl,gold,cx-31,9.45,cy+1,1.7,.25,1.7);box(wood,4,.5,5,cx-24,9.3,cy+1);
 // Cloud chaise with deep rounded cushion divisions and a sculptural side table.
 const rx=b.w-19;for(const z of [cy+5,cy+17]){ball(cream,rx,5,z,10,4,7);ball(pillow,rx,8,z,9,2.7,6.4);ball(cream,rx+7,10,z,3,6,7);}ball(cream,rx,10,cy+25,10,6,3);ball(pillow,rx,13,cy+21,4,3,2.4);
 for(const [y,r]of [[2,3.2],[4,2.2],[6.5,3.8]])emit(cyl,stone,b.w-8,y,cy-8,r,1.5,r);emit(cyl,gold,b.w-8,7.6,cy-8,2.8,.15,2.8);
 // Veined marble island/bar in the existing rear-right footprint, with fluted walnut backing.
 box(stone,19,15,42,b.w-15,8.5,27);box(stone,21,1,43,b.w-15,16.6,27);for(let z=8;z<48;z+=2)box(wood,.4,12,.55,b.w-25.2,8,z);for(let i=0;i<5;i++){emit(cyl,i%2?green:purple,b.w-15,21,10+i*6,1.1,7,1.1);emit(cyl,gold,b.w-15,25,10+i*6,.7,1.2,.7);}
 // A slim marble hearth and original abstract painting leave the colored walls exposed.
 box(stone,1.8,22,25,2.5,13,cy);box(black,.25,12,17,3.5,10,cy);for(let i=0;i<4;i++)ball(i%2?gold:glow,3.8,6+i,cy-5+i*3,.18,2.4,1);box(gold,.8,15,18,3,34,cy);box(purple,1,13,16,3.5,34,cy);for(let i=0;i<3;i++)ball(green,4.1,31+i*3,cy-4+i*4,.1,2,2.5);
 // Gold-edged coffer, cove strips and two chandeliers without extra dynamic lights.
 for(const inset of [7,10]){for(const x of [inset,b.w-inset])box(gold,.65,.6,b.h-inset*2,x,47.5,cy);for(const z of [inset,b.h-inset])box(gold,b.w-inset*2,.6,.65,cx,47.5,z);}
 for(const x of [7,b.w-7])box(glow,.35,.2,b.h-16,x,47,cy);for(const z of [7,b.h-7])box(glow,b.w-16,.2,.35,cx,47,z);
 for(const x of [b.w*.28,b.w*.72]){emit(cyl,gold,x,44,cy, .3,6,.3);for(const [y,r]of [[41,8],[36,5.5]]){emit(torus,gold,x,y,cy,r,r,r,[Math.PI/2,0,0]);for(let i=0;i<12;i++){const a=i*Math.PI*2/12,xx=x+Math.cos(a)*r,zz=cy+Math.sin(a)*r;emit(cyl,gold,xx,y-2.5,zz,.13,5,.13);ball(glow,xx,y-5,zz,.65,1.3,.65);}}}
 // Near-glass planted corner is wall-hugging; no new walkable mezzanine or stairs.
 for(const z of [cy-18,cy+34]){const x=b.w-5;emit(cyl,stone,x,3.5,z,2.5,5,2.5);emit(cyl,soil,x,6,z,2.1,.2,2.1);box(wood,.5,14,.5,x,13,z);for(let i=0;i<5;i++){const a=i*2.4;ball(leaf,x+Math.sin(a)*2,15+i,z+Math.cos(a)*2,2,.65,3);}}
 // Tall picture-window glazing: the purple/gold/green perimeter bands remain untouched.
 for(const z of [b.h*.3,b.h*.5,b.h*.7]){box(gold,1,24,.7,b.w-1.2,26,z);box(glass,.18,22,b.h*.18,b.w-1,26,z);}
 for(const [g,groups]of batches)for(const [m,items]of groups){const mesh=new T.InstancedMesh(g,m,items.length);mesh.userData.noBatch=true;items.forEach((a,i)=>{mesh.setMatrixAt(i,a.matrix);if(a.tint)mesh.setColorAt(i,color.set(a.tint));});root.add(mesh);}root.userData.penthouseLuxury={cloudModules:4,chaises:1,marbleTables:2,bars:1,chandeliers:2,textures:1};return {root,solids:p.solids,plan:p};
}
const api={plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29PenthouseLuxury=api;
})();
