'use strict';
(function(){
function plan(T=32){const r={x:148*T,y:145*T,w:24*T,h:24*T};return {...r,gate:{x:r.x+r.w/2,y:r.y+r.h},command:{x:r.x+r.w/2,y:r.y+r.h*.5},buildings:[{x:r.x+45,y:r.y+55,w:190,h:100,H:114,name:'BARRACKS'},{x:r.x+r.w-235,y:r.y+55,w:190,h:100,H:45,name:'COMMAND HQ'},{x:r.x+45,y:r.y+240,w:160,h:90,H:38,name:'SUPPLY DEPOT'},{x:r.x+r.w-205,y:r.y+240,w:160,h:90,H:38,name:'MOTOR POOL'}]};}
function commandAt(seconds){return Math.floor(seconds/20)%2?'PATROL THE PERIMETER':'FORM UP · HOLD POSITION';}
function goal(base,index,seconds){if(commandAt(seconds).startsWith('FORM'))return {x:base.command.x-75+(index%4)*50,y:base.command.y+75+Math.floor(index/4)*45};const points=[{x:base.x+26,y:base.y+26},{x:base.x+base.w-26,y:base.y+26},{x:base.x+base.w-26,y:base.y+base.h-50},{x:base.x+26,y:base.y+base.h-50}];return points[(Math.floor((seconds%20)/5)+index)%4];}
function pathTo(base,start,end){const T=16,W=Math.ceil(base.w/T),H=Math.ceil(base.h/T),point=k=>({x:base.x+(k%W+.5)*T,y:base.y+(Math.floor(k/W)+.5)*T}),key=p=>Math.floor((p.y-base.y)/T)*W+Math.floor((p.x-base.x)/T),from=key(start),to=key(end),q=[from],prev=new Map([[from,-1]]);
 for(let i=0;i<q.length;i++){const k=q[i];if(k===to){const out=[end];for(let n=to;n!==from;n=prev.get(n))out.push(point(n));return out.reverse();}const x=k%W,y=Math.floor(k/W);for(const [xx,yy]of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){const n=yy*W+xx,p=point(n);if(xx<1||yy<1||xx>=W-1||yy>=H-1||prev.has(n)||base.buildings.some(b=>p.x>b.x-9&&p.x<b.x+b.w+9&&p.y>b.y-9&&p.y<b.y+b.h+9))continue;prev.set(n,k);q.push(n);}}
 return [];
}
if(typeof module!=='undefined')module.exports={plan,commandAt,goal,pathTo};if(typeof window==='undefined')return;
const generate=genCity;genCity=function(){const c=generate.apply(this,arguments);if(!c.world||!c.coreWidth)return c;const b=plan(TILE);if(b.x+b.w>c.width*TILE||b.y+b.h>c.height*TILE)throw Error('Military base requires expanded map');c.militaryBase=b;c.militarySolids=[];
 for(let y=b.y/TILE;y<(b.y+b.h)/TILE;y++)for(let x=b.x/TILE;x<(b.x+b.w)/TILE;x++)c.g[y*c.width+x]=T_LOT;
 for(const h of b.buildings){c.buildings.push({...h,kind:'military-base',venue:'military-base',baseY:0});c.militarySolids.push(h);for(let y=Math.floor(h.y/TILE);y<Math.ceil((h.y+h.h)/TILE);y++)for(let x=Math.floor(h.x/TILE);x<Math.ceil((h.x+h.w)/TILE);x++)c.g[y*c.width+x]=T_BLD;}
 // Open access from gate to south highway, no forcefield across the entrance.
 const hy=c.highway.bounds.bottom;for(let y=Math.floor((b.command.y-32)/TILE);y<=Math.floor(hy/TILE);y++)for(let x=Math.floor(b.gate.x/TILE)-1;x<=Math.floor(b.gate.x/TILE)+1;x++)c.g[y*c.width+x]=T_ROAD;
 c.trees=c.trees.filter(t=>!(t.x>b.x-20&&t.x<b.x+b.w+20&&t.y>b.y-20&&t.y<b.y+b.h+20));indexTrees(c);return c;};
let troops=[],built=null,label=null,lastCommand='',elapsed=0,lastTime=null;
function build(){const b=city?.militaryBase;if(!b)return;troops=[];built=city;elapsed=0;lastTime=null;lastCommand='';const g=new THREE.Group();g.name='Military Base';cityGroup.add(g);const D=level29InteriorModels,steel=D.material('#4f6256','metal',.4),wall=D.material('#949782','brick'),roof=D.material('#3d4c42','metal'),sand=D.material('#c3b383','plaster'),q=level29World.batch(g);const box=(w,h,d,x,y,z,m)=>q.box(w,h,d,x,y,z,m);
 for(const h of b.buildings){if(h.name==='BARRACKS'&&window.level29BarracksModel){g.add(level29BarracksModel.build(THREE,D,h));addSign(g,'BACHELOR ENLISTED QUARTERS',h.w-12,7,h.x+h.w/2,31,h.y+h.h+1,'#e1d5b5');continue;}box(h.w,h.H,h.h,h.x+h.w/2,h.H/2,h.y+h.h/2,wall);box(h.w+8,3,h.h+8,h.x+h.w/2,h.H+1.5,h.y+h.h/2,roof);for(const dx of [h.w*.25,h.w*.75])box(28,16,1,h.x+dx,25,h.y+h.h+.5,steel);box(22,30,1,h.x+h.w/2,15,h.y+h.h+.8,steel);addSign(g,h.name,h.w-15,8,h.x+h.w/2,h.H+10,h.y+h.h+1,'#d7d1aa');}
 const edges=[{x:b.x,y:b.y,w:b.w,h:3},{x:b.x,y:b.y,w:3,h:b.h},{x:b.x+b.w-3,y:b.y,w:3,h:b.h},{x:b.x,y:b.y+b.h-3,w:b.w/2-55,h:3},{x:b.gate.x+55,y:b.y+b.h-3,w:b.w/2-55,h:3}];for(const r of edges){box(r.w,16,r.h,r.x+r.w/2,8,r.y+r.h/2,steel);city.militarySolids.push(r);}
 for(const side of [-1,1]){const x=b.gate.x+side*70,z=b.gate.y-20;box(28,20,25,x,10,z,sand);city.militarySolids.push({x:x-14,y:z-12.5,w:28,h:25});}
 box(4,110,4,b.x+280,55,b.y+80,steel);const flag=new THREE.Mesh(new THREE.PlaneGeometry(42,24),new THREE.MeshStandardMaterial({color:'#bfa565',side:THREE.DoubleSide}));flag.position.set(b.x+302,100,b.y+80);g.add(flag);
 addSign(g,'MILITARY BASE · SGT. POWELL',220,14,b.gate.x,45,b.gate.y,'#dfcf91');addSign(g,'P · POWELL OPERATIONS · FOLLOW COMMAND',180,9,b.command.x,37,b.command.y-20,'#dfcf91');
 for(let i=0;i<8;i++){const m=makeFigure(false);setFigureColors(m,['#b48763','#775136','#cfaa82'][i%3],'#526644','#354b3c','#1c2521');m.name='Powell troop '+(i+1);m.traverse(o=>{o.userData.noBatch=true;});const p=goal(b,i,0);poseFigure(m,p.x,p.y,-Math.PI/2,0,'stand');g.add(m);const helmet=D.mesh(m.userData.body,new THREE.SphereGeometry(2.8,12,8,0,Math.PI*2,0,Math.PI/2),steel,0,20,0);helmet.userData.noBatch=true;troops.push({m,x:p.x,y:p.y,index:i});}
 q.finish();
}
const buildBase=buildCity;buildCity=function(){buildBase.apply(this,arguments);build();};
const block=blockedCircle;blockedCircle=function(x,y,r){if((city?.militarySolids||[]).some(b=>hitRect(x,y,r,b)))return true;return block.apply(this,arguments);};
const tick=update;update=function(){const now=window.level29TimeOfDay?.seconds??0;tick.apply(this,arguments);if(state!=='play'||!city?.militaryBase||built!==city){if(label)label.style.display='none';lastTime=now;return;}const dt=lastTime===null?0:Math.max(0,Math.min(.1,now-lastTime));lastTime=now;elapsed+=dt;const b=city.militaryBase,cmd=commandAt(elapsed);
 if(!label){label=document.createElement('div');label.id='powellCommands';label.style.cssText='position:fixed;left:50%;top:110px;transform:translateX(-50%);background:#17251edb;color:#e5d99f;padding:7px 12px;font:12px monospace;pointer-events:none;z-index:22';document.body.appendChild(label);}const near=player&&!player.dead&&Math.hypot(player.x-b.command.x,player.y-b.command.y)<500;label.style.display=near?'block':'none';if(cmd!==lastCommand){label.textContent='SGT. POWELL: '+cmd;lastCommand=cmd;}
 for(const t of troops){const end=goal(b,t.index,elapsed),key=end.x+','+end.y;if(t.goalKey!==key){t.goalKey=key;t.path=pathTo(b,t,end);}let p=t.path?.[0]||end;if(Math.hypot(p.x-t.x,p.y-t.y)<2&&t.path?.length){t.path.shift();p=t.path[0]||end;}const dx=p.x-t.x,dy=p.y-t.y,d=Math.hypot(dx,dy),step=Math.min(d,dt*45);if(d>1){const nx=t.x+dx/d*step,ny=t.y+dy/d*step;if(!blockedCircle(nx,ny,7)){t.x=nx;t.y=ny;}}poseFigure(t.m,t.x,t.y,d>1?Math.atan2(dy,dx):-Math.PI/2,elapsed*6,d>1?'walk':'stand');t.m.position.y=0;}
};
window.level29MilitaryBase={plan,goal,commandAt,get troops(){return troops;},build};
})();
