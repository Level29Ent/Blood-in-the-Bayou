'use strict';
(function(){
const SIZE=192;
function grow(c,T,size=SIZE,types={grass:0,water:4,road:1,walk:2,lot:6}){
 const old=c.width,g=new Uint8Array(size*size);g.fill(types.grass);for(let y=0;y<old;y++)g.set(c.g.subarray(y*old,(y+1)*old),y*size);
 const set=(x,y,t)=>{if(x>=0&&y>=0&&x<size&&y<size)g[y*size+x]=t;};
 // Continue the bayou along the western edge of the new southern district.
 for(let y=old;y<size;y++)for(let x=0;x<40;x++)set(x,y,types.water);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(x===0||y===0||x>=size-1||y>=size-1)set(x,y,types.water);
 const blocks=[];for(let row=0;row<2;row++)for(let col=0;col<3;col++){const x=44+col*15,y=old+8+row*16,r={x:x*T,y:y*T,w:12*T,h:13*T,row,col};blocks.push(r);
  for(let yy=y-2;yy<y+15;yy++)for(let xx=x-2;xx<x+14;xx++)set(xx,yy,xx<x||xx>=x+12||yy<y||yy>=y+13?types.road:types.lot);
 }
 const homes=[];for(const b of blocks){if(b.col===2){homes.push({x:b.x+64,y:b.y+64,w:160,h:224,H:126,apartment:true});}else for(let i=0;i<4;i++)homes.push({x:b.x+28+(i%2)*176,y:b.y+28+Math.floor(i/2)*192,w:112,h:96,H:35,apartment:false});}
 c.coreWidth=old;c.coreHeight=c.height;c.width=c.height=size;c.g=g;c.get=(x,y)=>x<0||y<0||x>=size||y>=size?types.water:g[y*size+x];
 c.neighborhood={name:'DECATUR BAYOU',blocks,homes,bayou:{x:40*T,y:old*T},decaturX:42*T};return c;
}
function route(c,start,end,T,types,width=2){const W=c.width,H=c.height,ok=(x,y)=>x>width&&y>width&&x<W-width-1&&y<H-width-1&&!c.buildings.some(b=>x*T>b.x-width*T&&x*T<b.x+b.w+width*T&&y*T>b.y-width*T&&y*T<b.y+b.h+width*T)&&![c.farm,c.recreationParcel,c.mallParcel,c.natchezParcel,...(c.features||[]).filter(f=>['cemetery','market','basketball','skatepark'].includes(f.kind))].filter(Boolean).some(b=>x*T>b.x-width*T&&x*T<b.x+b.w+width*T&&y*T>b.y-width*T&&y*T<b.y+b.h+width*T);
 const key=p=>Math.floor(p.y/T)*W+Math.floor(p.x/T),a=key(start),z=key(end),q=[a],prev=new Map([[a,-1]]);for(let i=0;i<q.length;i++){const k=q[i];if(k===z){const path=[];for(let n=z;n!==-1;n=prev.get(n))path.push({x:(n%W+.5)*T,y:(Math.floor(n/W)+.5)*T});return path.reverse();}const x=k%W,y=Math.floor(k/W);for(const [xx,yy]of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){const n=yy*W+xx;if(!prev.has(n)&&ok(xx,yy)){prev.set(n,k);q.push(n);}}}return null;}
function lanes(size,T){const left=4*T,top=3*T,right=(size-5)*T,bottom=(size-5)*T;return {left,top,right,bottom};}
function lanePath(bounds,clockwise=true,lane=0){const o=(lane?42:14)*(clockwise?1:-1),l=bounds.left+o,r=bounds.right-o,t=bounds.top+o,b=bounds.bottom-o,R=48,out=[];
 for(const [x,y,start]of [[r-R,t+R,-Math.PI/2],[r-R,b-R,0],[l+R,b-R,Math.PI/2],[l+R,t+R,Math.PI]])for(let i=0;i<=8;i++){const a=start+i/8*Math.PI/2;out.push({x:x+Math.cos(a)*R,y:y+Math.sin(a)*R});}
 const dense=[];for(let i=0;i<out.length;i++){const a=out[i],b=out[(i+1)%out.length],n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/64));for(let k=0;k<n;k++)dense.push({x:a.x+(b.x-a.x)*k/n,y:a.y+(b.y-a.y)*k/n});}return clockwise?dense:dense.reverse();
}
if(typeof module!=='undefined')module.exports={grow,route,lanes,lanePath,SIZE};if(typeof window==='undefined')return;
const gen=genCity;genCity=function(){const c=gen.apply(this,arguments);if(!c.world)return c;const old=c.width,core=c.heightAt;grow(c,TILE);MW=MH=c.width;WORLD=MW*TILE;GS=Math.min(GS,.65);
 Object.defineProperty(c,'heightAt',{configurable:true,enumerable:true,value:(x,y)=>x<old*TILE&&y<old*TILE?core(x,y):0,writable:true});
 const bounds=lanes(MW,TILE);c.highway={bounds,links:[],solids:[]};const paint=(p,r=2)=>{for(let yy=Math.floor(p.y/TILE)-r;yy<=Math.floor(p.y/TILE)+r;yy++)for(let xx=Math.floor(p.x/TILE)-r;xx<=Math.floor(p.x/TILE)+r;xx++){if(xx<1||yy<1||xx>=MW-1||yy>=MH-1)continue;const x=(xx+.5)*TILE,y=(yy+.5)*TILE;if(c.buildings.some(b=>x>b.x-12&&x<b.x+b.w+12&&y>b.y-12&&y<b.y+b.h+12))continue;c.g[yy*MW+xx]=c.g[yy*MW+xx]===T_WATER?T_BRIDGE:T_ROAD;}};
 for(let x=bounds.left;x<=bounds.right;x+=TILE){paint({x,y:bounds.top});paint({x,y:bounds.bottom});}for(let y=bounds.top;y<=bounds.bottom;y+=TILE){paint({x:bounds.left,y});paint({x:bounds.right,y});}
 // New parcels are physical homes, not registered as replacement city businesses.
 for(const h of c.neighborhood.homes){c.buildings.push({...h,kind:'extension-home',venue:'extension-residence',baseY:0});for(let y=Math.floor(h.y/TILE);y<Math.ceil((h.y+h.h)/TILE);y++)for(let x=Math.floor(h.x/TILE);x<Math.ceil((h.x+h.w)/TILE);x++)c.g[y*MW+x]=T_BLD;}
 const destinations=[{name:'DECATUR ST · BAYOU HOMES',p:{x:42.5*TILE,y:(old+8)*TILE},anchor:{x:42.5*TILE,y:bounds.bottom}},{name:'AIRPORT EXIT',p:c.airportAccess.at(-1),anchor:{x:bounds.right,y:c.airportParcel.y+5.5*TILE}},{name:'GREENTOWN MALL',p:{x:c.mall.doorX,y:c.mallParcel.y+c.mallParcel.h+80},anchor:{x:c.mall.doorX,y:bounds.bottom}}];
 for(const d of destinations){const path=route(c,d.anchor,d.p,TILE,[T_ROAD,T_BRIDGE],1);if(!path)throw Error('No extension link for '+d.name);path.forEach(p=>paint(p,1));c.highway.links.push({...d,path});}
 for(let y=129;y<=old+8;y++)for(let x=41;x<=43;x++)if(!c.buildings.some(b=>x*TILE>b.x-16&&x*TILE<b.x+b.w+16&&y*TILE>b.y-16&&y*TILE<b.y+b.h+16))c.g[y*MW+x]=T_ROAD;
 c.trees=c.trees.filter(t=>![T_ROAD,T_BRIDGE].includes(c.get(Math.floor(t.x/TILE),Math.floor(t.y/TILE))));indexTrees(c);return c;
};
function build(){const c=city;if(!c?.neighborhood)return;const root=new THREE.Group();root.name='Decatur Bayou neighborhood and outer highway';cityGroup.add(root);const D=level29InteriorModels,M=D.material,brick=M('#bfa88d','brick'),roof=M('#4a5055','metal'),wood=M('#805d42'),glass=M('#456d80','metal',.3),paint=M('#e6d6b4','plaster'),q=level29World.batch(root);const box=(w,h,d,x,y,z,m)=>q.box(w,h,d,x,y+(city.interstateSurface?.(x,z)||0),z,m);
 for(const h of c.neighborhood.homes){const cx=h.x+h.w/2,cz=h.y+h.h/2;box(h.w,h.H,h.h,cx,h.H/2,cz,brick);box(h.w+6,3,h.h+6,cx,h.H+1.5,cz,roof);
  if(!h.apartment){const tri=new THREE.Mesh(new THREE.ConeGeometry(h.w*.6,20,4),roof);tri.rotation.y=Math.PI/4;tri.scale.z=h.h/h.w;tri.position.set(cx,h.H+12,cz);root.add(tri);}
  for(let y=15;y<h.H;y+=30)for(const dx of [-h.w*.3,h.w*.3]){box(19,16,1,cx+dx,y,h.y+h.h+.7,glass);box(1,16,1.2,cx+dx,y,h.y+h.h+1,paint);}
  box(14,25,1,cx,12.5,h.y+h.h+1,wood);box(25,2,16,cx,1,h.y+h.h+9,paint);for(const side of [-1,1]){box(1,10,h.h+30,cx+side*(h.w/2+10),5,cz,wood);}box(h.w+20,10,1,cx,5,h.y-12,wood);
 }
 const B=c.highway.bounds,metal=M('#a8b5b7','metal',.7),white=M('#e7dfbb');
 for(const y of [B.top,B.bottom])for(let x=B.left+100;x<B.right-100;x+=96){box(35,.2,1,x,1.2,y,white);for(const side of [-1,1]){const z=y+side*82;box(92,2,1,x,7,z,metal);if(x%288<96){box(1,42,1,x,21,z,metal);box(7,1,4,x,43,z,white);}}}
 for(const x of [B.left,B.right])for(let y=B.top+100;y<B.bottom-100;y+=96){box(1,.2,35,x,1.2,y,white);for(const side of [-1,1])box(1,2,92,x+side*82,7,y,metal);}
 for(const link of c.interstateExits?[]:c.highway.links){const p=link.path[Math.min(3,link.path.length-1)];addSign(root,link.name,140,9,p.x,35,p.y,'#e8e7ce');}
 addSign(root,'DECATUR ST · BAYOU RESIDENTIAL · 6 BLOCKS',210,12,58*TILE,40,(c.coreWidth+6)*TILE,'#e8d4a1');
 for(const [i,title]of ['LEVEL 29 ENT.','BLOOD IN THE BAYOU','VIRAL'].entries()){const x=B.right-100,z=1800+i*640;box(3,60,3,x,30,z,metal);let face;if(i&&window.level29MoviePosters){face=level29MoviePosters.poster(i===1?'bayou':'viral',44);face.position.set(x,75,z);root.add(face);}else face=addSign(root,title,140,34,x,75,z,'#d8bb6a');level29BillboardLighting.add(face);}
 q.finish();if(window.level29BatchStatic)level29BatchStatic(root,[]);
}
const buildBase=buildCity;buildCity=function(){buildBase.apply(this,arguments);build();};
const street=streetAt;streetAt=function(x,y){if(city?.neighborhood&&y>=city.coreHeight*TILE&&x>=40*TILE&&x<90*TILE)return 'DECATUR ST · BAYOU NEIGHBORHOOD';return street.apply(this,arguments);};
const trafficBase=updateTraffic;updateTraffic=function(){const list=cars.filter(c=>c.ai?.highway),saved=list.map(c=>[c,c.ai]);for(const [c]of saved)c.ai=null;try{trafficBase.apply(this,arguments);}finally{for(const [c,a]of saved)if(!c.dead&&!c.driven)c.ai=a;}
 for(const [c,a]of saved){if(c.dead||c.driven)continue;const P=player.car||player;if(Math.hypot(c.x-P.x,c.y-P.y)>1500){c.dead=true;c.gone=true;c.ai=null;continue;}const path=a.path;let p=path[a.index];if(Math.hypot(c.x-p.x,c.y-p.y)<45){a.index=(a.index+1)%path.length;p=path[a.index];}const target=Math.atan2(p.y-c.y,p.x-c.x),error=angDiff(c.a,target),look=Math.max(65,Math.abs(c.v)*18),clear=level29TrafficClearance.sweep(c,city,tileAt,[T_ROAD,T_BRIDGE],look),ahead={x:c.x+Math.cos(c.a)*look,y:c.y+Math.sin(c.a)*look};
 const obstacle=cars.some(o=>o!==c&&!o.dead&&Math.hypot(o.x-ahead.x,o.y-ahead.y)<o.r+25)||!player.car&&Math.hypot(player.x-ahead.x,player.y-ahead.y)<30;
 a.input={thr:clear&&!obstacle&&Math.abs(c.v)<(Math.abs(error)>.3?1.5:4)?1:0,steer:clamp(error*2,-1,1),brake:!clear||obstacle||Math.abs(error)>.7&&Math.abs(c.v)>1.5,boost:false};
 }
};
const tick=update;update=function(){tick.apply(this,arguments);if(state!=='play'||!city?.highway||!player||mpRole==='client'||frame%120)return;const existing=cars.filter(c=>c.ai?.highway&&!c.dead);if(existing.length>=6)return;const p=player.car||player;for(const clockwise of [true,false])for(const lane of [0,1]){const path=lanePath(city.highway.bounds,clockwise,lane);for(let i=0;i<path.length;i++){const q=path[i],next=path[(i+1)%path.length],d=Math.hypot(q.x-p.x,q.y-p.y);if(d<350||d>1100||cars.some(c=>!c.dead&&Math.hypot(q.x-c.x,q.y-c.y)<150))continue;const a=Math.atan2(next.y-q.y,next.x-q.x),c=makeCar(q.x,q.y,a,'sedan');if(!level29TrafficClearance.sweep(c,city,tileAt,[T_ROAD,T_BRIDGE],100))continue;c.ai={highway:true,path,index:(i+1)%path.length,input:{thr:1,steer:0,brake:false,boost:false}};cars.push(c);return;}}};
window.level29CityExtension={grow,route,build,lanePath};
})();
