'use strict';
(function(){
const intersects=(a,b,p=0)=>a.x<b.x+b.w+p&&a.x+a.w>b.x-p&&a.y<b.y+b.h+p&&a.y+a.h>b.y-p;
function reservations(c){return [...(c.buildings||[]),...(c.features||[]),c.zoo,c.farm,c.beach,c.militaryBase,c.themePark?.rect,c.airportParcel,c.recreationParcel,c.mallParcel,c.natchezParcel,c.residence?.b,c.greenmart?.b,...Object.values(c.nolaLandmarks?.sites||{}),...Object.values(c.survivalLandmarks?.sites||{}),...(c.neighborhood?.homes||[])].filter(r=>r?.w&&r?.h);}
// Road centers are tile-grid corners: four neighboring cells form a full 64-unit lane.
function plan(c,{tile=32,reserved=reservations(c)}={}){
 if(!c.zoo||!c.farm)return {path:[],cells:[],reason:'missing-sites'};
 const W=c.width,H=c.height,T=tile,allowed=new Int8Array(W*H),levels=new Float32Array(W*H),roads=new Uint8Array(W*H);
 // Rasterize protected ground footprints once, not once per BFS expansion.
 const blocked=new Uint8Array(W*H);for(const b of reserved)for(let y=Math.max(1,Math.floor((b.y-4)/T));y<=Math.min(H-2,Math.ceil((b.y+b.h+4)/T));y++)for(let x=Math.max(1,Math.floor((b.x-4)/T));x<=Math.min(W-2,Math.ceil((b.x+b.w+4)/T));x++)if(intersects({x:x*T,y:y*T,w:T,h:T},b,4))blocked[y*W+x]=1;
 function valid(k){if(allowed[k])return allowed[k]>0;const x=k%W,y=Math.floor(k/W);if(x<2||y<2||x>=W-2||y>=H-2){allowed[k]=-1;return false;}const cells=[k-W-1,k-W,k-1,k];if(cells.some(n=>blocked[n]||![0,1,2,5,6,7,9].includes(c.g[n]))){allowed[k]=-1;return false;}const hs=[[0,0],[-T,-T],[T,-T],[-T,T],[T,T]].map(([dx,dy])=>c.heightAt(x*T+dx,y*T+dy));if(hs.some(h=>!Number.isFinite(h)||Math.abs(h)>3)||Math.max(...hs)-Math.min(...hs)>2){allowed[k]=-1;return false;}levels[k]=hs[0];roads[k]=cells.some(n=>[1,9].includes(c.g[n]))?1:0;allowed[k]=1;return true;}
 const zoo=c.zoo.entrance||{x:c.zoo.x+c.zoo.w/2,y:c.zoo.y},farm=c.farmEntrance||{x:c.farm.x+c.farm.w/2,y:c.farm.y+c.farm.h+24};
 function approach(p,dy){const candidates=[];for(let y=Math.floor((p.y+dy-96)/T);y<=Math.ceil((p.y+dy+96)/T);y++)for(let x=Math.floor((p.x-96)/T);x<=Math.ceil((p.x+96)/T);x++){if(x<2||y<2||x>=W-2||y>=H-2)continue;const k=y*W+x,dx=x*T-p.x,d=y*T-p.y;if(Math.abs(dx)>80||d*dy<0||!valid(k))continue;candidates.push({k,d:Math.hypot(dx,d)});}return candidates.sort((a,b)=>a.d-b.d)[0]?.k;}
 const start=approach(zoo,-T),end=approach(farm,T);if(start==null||end==null)return {path:[],cells:[],reason:'no-safe-approach'};
 function search(starts,goal){const prev=new Int32Array(W*H);prev.fill(-2);const queue=[];for(const k of starts){prev[k]=-1;queue.push(k);}let end=-1;for(let i=0;i<queue.length;i++){const k=queue[i];if(goal(k)){end=k;break;}for(const n of [k-1,k+1,k-W,k+W])if(n>=0&&n<W*H&&prev[n]===-2&&valid(n)&&Math.abs(levels[k]-levels[n])<=1){prev[n]=k;queue.push(n);}}if(end<0)return null;const chain=[];for(let k=end;k>=0;k=prev[k])chain.push(k);return chain.reverse();}
 const main=search([start],k=>k===end);if(!main)return {path:[],cells:[],reason:'no-safe-link'};
 // Also join a public road. Do not leave a decorative dead-end strip disconnected from driving tiles.
 const join=search(main,k=>roads[k]===1);if(!join)return {path:[],cells:[],reason:'no-public-road'};
 const nodes=[...new Set([...main,...join])],cells=[...new Set(nodes.flatMap(k=>[k-W-1,k-W,k-1,k]))];
 return {path:main.map(k=>({x:k%W*T,y:Math.floor(k/W)*T})),junction:join.map(k=>({x:k%W*T,y:Math.floor(k/W)*T})),cells,width:2*T,approaches:{zoo:{x:start%W*T,y:Math.floor(start/W)*T},farm:{x:end%W*T,y:Math.floor(end/W)*T}},reason:null};
}
function install(c){if(c.zooFarmRoad)return c.zooFarmRoad;const route=plan(c);c.zooFarmRoad=route;if(!route.cells.length)return route;for(const k of route.cells)if(c.g[k]!==9)c.g[k]=1;const cleared=new Set(route.cells);for(const key of ['trees','pineTrees','rocks','parked'])if(c[key])c[key]=c[key].filter(p=>!cleared.has(Math.floor(p.y/32)*c.width+Math.floor(p.x/32)));return route;}
function geometry(T,c,cells){const positions=[];for(const k of cells){const x=k%c.width*32,z=Math.floor(k/c.width)*32;for(const [dx,dz]of [[0,0],[0,32],[32,0],[32,0],[0,32],[32,32]])positions.push(x+dx,c.heightAt(x+dx,z+dz)+.12,z+dz);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.computeVertexNormals();geo.computeBoundingSphere();return geo;}
function build(T,c){const root=new T.Group();root.name='Zoo–Farm public access road';const route=c.zooFarmRoad;if(!route?.cells.length)return root;const asphalt=new T.MeshStandardMaterial({color:'#303a3c',roughness:.95,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-3});const mesh=new T.Mesh(geometry(T,c,route.cells),asphalt);mesh.userData.noBatch=true;root.add(mesh);return root;}
const api={plan,install,reservations,geometry,build};if(typeof module!=='undefined')module.exports=api;if(typeof window==='undefined')return;window.level29ZooFarmRoad=api;if(window.level29ZooFarmReview)return;
const gen=genCity;genCity=function(){const c=gen.apply(this,arguments);if(c.world){install(c);if(c.zooFarmRoad.cells.length&&typeof indexTrees==='function')indexTrees(c);}return c;};
const cityBuild=buildCity;buildCity=function(){const result=cityBuild.apply(this,arguments);if(city?.world){const root=build(THREE,city);cityGroup.add(root);if(city.zooFarmRoad?.cells.length){for(const [name,p]of Object.entries(city.zooFarmRoad.approaches))addSign(root,name==='zoo'?'29 ZOO · FARM ROAD':'FARM · ZOO ROAD',95,7,p.x+26,20,p.y+1,'#e5d5a4');}}return result;};
})();
