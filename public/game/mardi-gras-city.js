'use strict';
(function(){
// A 3×1 block perimeter: four distinct turns, no out-and-back or diagonal cuts.
function threeBlockRoute(nav,start,width,roads,tileAt,T=32){
 const lines=[...new Set(roads.filter(Number.isFinite).map(r=>Math.floor(r)+1))].sort((a,b)=>a-b),candidates=[];
 let reachable=null;if(nav.nearest){const first=nav.nearest(start.x,start.y,10);if(first>=0){reachable=new Uint8Array(nav.mask.length);const queue=[first];reachable[first]=1;for(let i=0;i<queue.length;i++){const k=queue[i],x=k%width;for(const n of [x?k-1:-1,x<width-1?k+1:-1,k-width,k+width])if(n>=0&&n<nav.mask.length&&nav.mask[n]&&!reachable[n]){reachable[n]=1;queue.push(n);}}}}
 const valid=(x,y)=>x>=0&&y>=0&&x<width&&y*width+x<nav.mask.length&&nav.mask[y*width+x]&&(!reachable||reachable[y*width+x])&&[1,9].includes(tileAt((x+.5)*T,(y+.5)*T));
 for(const [sx,sy]of [[3,1],[1,3]])for(let i=0;i+sx<lines.length;i++)for(let j=0;j+sy<lines.length;j++){
  const left=lines[i],right=lines[i+sx],top=lines[j],bottom=lines[j+sy];
  if(Math.hypot((left+right+1)*T/2-start.x,(top+bottom+1)*T/2-start.y)>2600)continue;
  const cells=[];for(let x=left;x<right;x++)cells.push([x,top]);for(let y=top;y<bottom;y++)cells.push([right,y]);for(let x=right;x>left;x--)cells.push([x,bottom]);for(let y=bottom;y>top;y--)cells.push([left,y]);
  if(!cells.length||!cells.every(([x,y])=>valid(x,y)))continue;
  let index=0,distance=Infinity;cells.forEach(([x,y],k)=>{const d=Math.hypot((x+.5)*T-start.x,(y+.5)*T-start.y);if(d<distance){distance=d;index=k;}});
  const route=cells.slice(index).concat(cells.slice(0,index)).map(([x,y])=>nav.point(y*width+x));route.blocks=3;route.closedLoop=true;candidates.push({route,distance});
 }
 candidates.sort((a,b)=>a.distance-b.distance);return candidates[0]?.route||null;
}
function length(route){return route.reduce((n,p,i)=>n+Math.hypot(p.x-route[(i+1)%route.length].x,p.y-route[(i+1)%route.length].y),0);}
function decorPlan(buildings,limit=180){
 return buildings.filter(b=>!b.venue&&!b.uploadAsset&&['normal','tower','helipad'].includes(b.kind)&&b.w>=32&&b.h>=32).filter((b,i)=>i%2===0).slice(0,limit).map((b,i)=>({x:b.x+b.w/2,z:b.y+b.h+.45,y:Math.min(52,Math.max(24,b.H*2.4-6)),w:Math.min(32,b.w*.6),color:i%3}));
}
function build(T,buildings,route=[],height=()=>0){const root=new T.Group();root.name='Citywide Mardi Gras balcony banners';root.userData.noBatch=true;const plan=decorPlan(buildings),geo=new T.BoxGeometry(1,1,1),dummy=new T.Object3D(),colors=['#743b98','#2e8153','#c5a042'];
 for(let color=0;color<3;color++){const list=plan.filter(p=>p.color===color),mat=new T.MeshStandardMaterial({color:colors[color],roughness:.9,metalness:0}),mesh=new T.InstancedMesh(geo,mat,list.length*5);mesh.frustumCulled=false;mesh.userData.prologueOwned=true;let n=0;for(const p of list){for(const [dx,dy,w,h]of [[0,0,p.w,6],[0,3.5,p.w+1,.6],[0,-3.5,p.w+1,.6],[-p.w/2,0,.6,7],[p.w/2,0,.6,7]]){dummy.position.set(p.x+dx,p.y+dy+(height(p.x,p.z)||0),p.z);dummy.scale.set(w,h,.35);dummy.updateMatrix();mesh.setMatrixAt(n++,dummy.matrix);}}root.add(mesh);}root.userData.bannerCount=plan.length;
 if(route.length){const flag=new T.BufferGeometry();flag.setAttribute('position',new T.Float32BufferAttribute([-1,0,0,1,0,0,0,-3,0],3));flag.computeVertexNormals();const points=route.filter((p,i)=>i%4===0).slice(0,64);
 for(let c=0;c<3;c++){const m=new T.InstancedMesh(flag,new T.MeshStandardMaterial({color:colors[c],side:T.DoubleSide,roughness:.95}),points.length*3);m.frustumCulled=false;m.userData.prologueOwned=true;let n=0;for(const p of points){const q=route[(route.indexOf(p)+1)%route.length],a=Math.atan2(q.y-p.y,q.x-p.x);for(let j=0;j<3;j++){const offset=-32+(c+j*3)*8;dummy.position.set(p.x-Math.sin(a)*offset,34-Math.abs(offset)*.045+(height(p.x,p.y)||0),p.y+Math.cos(a)*offset);dummy.scale.set(2,1.5,1);dummy.rotation.set(0,-a,0);dummy.updateMatrix();m.setMatrixAt(n++,dummy.matrix);}}root.add(m);}root.userData.pennants=points.length*9;
 }return root;}
const api={threeBlockRoute,length,decorPlan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29MardiCity=api;
})();
