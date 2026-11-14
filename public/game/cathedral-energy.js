'use strict';
(function(){
function overlap(a,b,p=0){return a.x<b.x+b.w+p&&a.x+a.w>b.x-p&&a.y<b.y+b.h+p&&a.y+a.h>b.y-p;}
function chooseSite(c,size,target,reserved,{maxDistance=1700,valid=null,allowScenery=false,allowLandscape=false}={}){
 const choices=[];for(let y=192;y+size.h<(c.height-4)*32;y+=32)for(let x=192;x+size.w<(c.width-4)*32;x+=32){const d=Math.hypot(x+size.w/2-target.x,y+size.h/2-target.y);if(d<=maxDistance)choices.push({x,y,w:size.w,h:size.h,d});}choices.sort((a,b)=>a.d-b.d);
 for(const r of choices){if(reserved.some(b=>overlap(r,b,24)))continue;let good=true;for(let y=r.y;y<r.y+r.h&&good;y+=32)for(let x=r.x;x<r.x+r.w;x+=32)if(!(allowLandscape?[0,2,3,5,6,7,8]:allowScenery?[0,3,6]:[0,6]).includes(c.get(x/32,y/32))||Math.abs(c.heightAt(x+16,y+16))>1){good=false;break;}if(!good||valid&&!valid(r))continue;return r;}return null;
}
function translateVenue(v,dx,dy){const move=p=>{if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y)){p.x+=dx;p.y+=dy;}};move(v.b);for(const [x,y]of [['doorX','doorY'],['stationX','stationY'],['workerX','workerY']]){if(Number.isFinite(v[x]))v[x]+=dx;if(Number.isFinite(v[y]))v[y]+=dy;}const visited=new Set();for(const p of [...(v.colliderWalls||[]),...(v.furniture||[]),...(v.colliderDoor?[v.colliderDoor]:[]),v.entranceAisle,v.elevatorPoint,v.elevatorLanding,...(v.depthPath||[])])if(p&&!visited.has(p)){visited.add(p);move(p);}if(v.frontage){for(const p of [v.frontage,v.frontage.canonical,v.frontage.center,v.frontage.street])move(p);}return v;}
function buildPlant(T,site,options={}){
 const root=new T.Group();root.name='Crescent Energy · twin cooling tower campus';const x=site.x,z=site.y,W=site.w,H=site.h,solids=[],buckets=new Map(),geos=new Map(),mats=new Map();
 const mat=(c,metal=0)=>{if(!mats.has(c))mats.set(c,options.material?options.material(c,metal):new T.MeshStandardMaterial({color:c,metalness:metal,roughness:.8}));return mats.get(c);},concrete=mat('#b0b1a6'),dark=mat('#4a626d',.2),steel=mat('#82999d',.55),blue=mat('#4f7c91',.35),yellow=mat('#d5b34f'),green=mat('#667f64');
 function part(kind,args,m,px,y,pz,s=[1,1,1],ry=0,rx=0){const key=kind+JSON.stringify(args);if(!geos.has(key))geos.set(key,kind==='cyl'?new T.CylinderGeometry(...args):kind==='sphere'?new T.SphereGeometry(...args):kind==='lathe'?new T.LatheGeometry(args.map(p=>new T.Vector2(...p)),48):kind==='ring'?new T.TorusGeometry(...args):new T.BoxGeometry());const geo=geos.get(key);if(!buckets.has(geo))buckets.set(geo,new Map());if(!buckets.get(geo).has(m))buckets.get(geo).set(m,[]);buckets.get(geo).get(m).push({px,y,pz,s,ry,rx});}
 const box=(w,h,d,px,y,pz,m,solid=false)=>{part('box',[],m,px,y,pz,[w,h,d]);if(solid)solids.push({x:px-w/2,y:pz-d/2,w,h:d});};
 const lawn=mat('#5d7850'),asphalt=mat('#666b69'),curb=mat('#c5c5b9'),seam=mat('#92988f'),interior=mat('#596362');
 box(W,.8,H,x+W/2,.3,z+H/2,lawn);
 // Rectangular loop road and a central gate approach fit the unchanged existing parcel.
 const road=14;for(const zz of [z+16,z+H-18]){box(W-24,.18,road,x+W/2,.82,zz,asphalt);for(const side of [-1,1])box(W-24,.3,1,x+W/2,.9,zz+side*road/2,curb);}
 for(const xx of [x+18,x+W-18]){box(road,.18,H-36,xx,.82,z+H/2,asphalt);for(const side of [-1,1])box(1,.3,H-36,xx+side*road/2,.9,z+H/2,curb);}
 box(26,.18,H*.33,x+W/2,.83,z+H*.835,asphalt);
 const scale=Math.min(W,H)/320,towers=[];
 const towerConcrete=concrete.clone();towerConcrete.side=T.DoubleSide;
 // Smooth hyperboloid-like profile with an open throat and rolled concrete lip.
 for(const dx of [.27,.72]){
  const px=x+W*dx,pz=z+H*.28;
  const profile=[];for(let j=0;j<=36;j++){const yy=j*120/36,rr=29*Math.sqrt(1+((yy-75)/70)**2);profile.push([rr*scale,(yy+9)*scale]);}
  part('lathe',profile,towerConcrete,px,0,pz);
  // Lip and inset inner wall are annular geometry, never a solid cylinder across the opening.
  const topR=profile.at(-1)[0];
  part('lathe',[[topR-1.3*scale,119*scale],[topR-1.3*scale,129*scale],[topR,129*scale],[topR+.8*scale,128*scale],[topR+.8*scale,126.8*scale],[topR,126.8*scale]],towerConcrete,px,0,pz);
  part('lathe',[[topR-1.5*scale,116*scale],[topR-1.5*scale,127*scale]],interior,px,0,pz);
  // Repeated horizontal construction seams follow the curved silhouette.
  for(let yy=18;yy<121;yy+=10){const rr=29*Math.sqrt(1+((yy-75)/70)**2)*scale;part('ring',[1,.003,4,48],seam,px,(yy+9)*scale,pz,[rr,rr,rr],0,Math.PI/2);}
  const baseR=profile[0][0];
  part('cyl',[baseR+2*scale,baseR+2*scale,1.2*scale,48],curb,px,.9*scale,pz);
  // Air intake gap and slender support piers are visible below each shell.
  for(let i=0;i<24;i++){const a=i*Math.PI/12;box(1.7*scale,9*scale,1.7*scale,px+Math.cos(a)*(baseR-1.2*scale),5*scale,pz+Math.sin(a)*(baseR-1.2*scale),concrete);}
  solids.push({x:px-(baseR+3*scale),y:pz-(baseR+3*scale),w:2*(baseR+3*scale),h:2*(baseR+3*scale)});
  towers.push({x:px,z:pz,height:129*scale,topRadius:topR});
 }
 // Soft white steam is shared, static low-poly scenery, not a weather/fluid simulation.
 const steam=new T.Group();steam.name='White cooling-tower steam';const steamGeo=new T.SphereGeometry(1,10,7),steamMat=new T.MeshBasicMaterial({color:'#f1f3ec',transparent:true,opacity:.22,depthWrite:false}),steamMesh=new T.InstancedMesh(steamGeo,steamMat,32),steamTransform=new T.Object3D();let steamIndex=0;
 for(const tower of towers)for(let i=0;i<16;i++){
  const level=Math.floor(i/2),a=i*2.4,r=(11+level*1.6)*scale;
  steamTransform.position.set(tower.x+level*2*scale+Math.sin(a)*r*.55,tower.height+(5+level*10)*scale,tower.z+Math.cos(a)*r*.45);
  steamTransform.scale.set(r*.95,r*1.3,r*.9);steamTransform.updateMatrix();steamMesh.setMatrixAt(steamIndex++,steamTransform.matrix);
 }
 steamMesh.userData.noBatch=true;steam.add(steamMesh);

 const hall={x:x+W*.08,y:z+H*.56,w:W*.52,h:H*.23};box(hall.w,36,hall.h,hall.x+hall.w/2,18,hall.y+hall.h/2,dark,true);box(hall.w+5,3,hall.h+5,hall.x+hall.w/2,38,hall.y+hall.h/2,steel);
 for(let i=0;i<7;i++){box(hall.w/9,14,1,hall.x+12+i*hall.w/8,22,hall.y+hall.h+.7,blue);box(1,18,1,hall.x+12+i*hall.w/8,22,hall.y+hall.h+1.4,concrete);}
 for(let i=0;i<5;i++){const hx=hall.x+15+i*hall.w*.17;box(11,3,9,hx,41,hall.y+hall.h*.6,concrete);box(9,.4,7,hx,42.7,hall.y+hall.h*.6,seam);}
 const annex={x:x+W*.37,y:z+H*.42,w:W*.24,h:H*.1};box(annex.w,15,annex.h,annex.x+annex.w/2,7.5,annex.y+annex.h/2,concrete,true);box(annex.w+2,1,annex.h+2,annex.x+annex.w/2,15.8,annex.y+annex.h/2,curb);
 // Low intake/service houses at the bases echo the industrial campus photograph.
 for(const tower of towers){box(66*scale,10*scale,13*scale,tower.x,5*scale,tower.z+43*scale,concrete,true);box(68*scale,1,15*scale,tower.x,10.5*scale,tower.z+43*scale,seam);}

 const rx=x+W*.78,rz=z+H*.68,r=W*.13;part('cyl',[r,r,32,24],concrete,rx,16,rz);part('sphere',[r,24,14,0,Math.PI*2,0,Math.PI/2],concrete,rx,32,rz);solids.push({x:rx-r,y:rz-r,w:r*2,h:r*2});
 for(let i=0;i<4;i++){const px=x+W*.12+i*W*.12,pz=z+H*.47;box(8,12,10,px,6,pz,steel,true);for(let n=0;n<4;n++)box(.7,14,10,px-3+n*2,7,pz,dark);box(3,3,45,px,16,pz-20,steel);}
 for(const side of [-1,1]){const px=x+W/2+side*(W/2-3);box(2,15,H,px,7.5,z+H/2,steel,true);}box(W,15,2,x+W/2,7.5,z+3,steel,true);for(const side of [-1,1])box((W-52)/2,15,2,x+W/2+side*(W+52)/4,7.5,z+H-3,steel,true);
 box(44,.5,34,x+W/2,.9,z+H-18,dark);for(let i=0;i<4;i++)box(1,.3,13,x+W/2-16+i*10,1.3,z+H-18,yellow);
 for(let i=0;i<3;i++){const px=x+W*.64+i*W*.12,pz=z+H*.9;box(2,25,2,px,12.5,pz,steel);box(16,2,2,px,24,pz,steel);for(const dx of [-6,0,6])part('cyl',[1.2,1.2,4,6],green,px+dx,27,pz);}
 options.label?.(root,'CRESCENT ENERGY · NUCLEAR STATION',W-22,9,x+W/2,28,z+H-2,'#f0de9a');options.label?.(root,'AUTHORIZED PERSONNEL ONLY',W*.5,5,x+W/2,16,z+H-1,'#e7d894');
 const dummy=new T.Object3D();for(const [geo,by]of buckets)for(const [m,list]of by){const mesh=new T.InstancedMesh(geo,m,list.length),bounds=new T.Box3();geo.computeBoundingBox();list.forEach((p,i)=>{dummy.position.set(p.px,p.y,p.pz);dummy.scale.set(...p.s);dummy.rotation.set(p.rx||0,p.ry,0);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);bounds.union(geo.boundingBox.clone().applyMatrix4(dummy.matrix));});mesh.geometry=geo.clone();mesh.geometry.boundingSphere=bounds.getBoundingSphere(new T.Sphere());mesh.userData.noBatch=true;root.add(mesh);}root.add(steam);root.userData={solids,site,towers,referencePlant:true};return root;
}
const api={overlap,chooseSite,translateVenue,buildPlant};if(typeof module!=='undefined')module.exports=api;if(typeof window==='undefined')return;window.level29CathedralEnergy=api;if(window.level29EnergyReview)return;
const gen=genCity;genCity=function(){const c=gen.apply(this,arguments);if(!c.world||!c.survivalLandmarks?.sites.cathedral||!c.mansion)return c;
 const sites=c.survivalLandmarks.sites,old={...sites.cathedral},anchor={x:c.mansion.B.x+c.mansion.B.w/2,y:c.mansion.B.y+c.mansion.B.h/2},movedKinds=Object.keys(sites).filter(k=>k==='cathedral'||Math.hypot(sites[k].x-old.x,sites[k].y-old.y)<700),movedVenues=c.venues.filter(v=>!v.storyRole&&!['mall','safe','hospital','classroom'].includes(v.id)&&v!==c.casinoVenue&&!v.accessLandmark&&Math.hypot(v.b.x-old.x,v.b.y-old.y)<360);
 const scenery=c.buildings.filter(b=>!b.venue&&b.kind==='normal');
 const reserved=[...c.buildings.filter(b=>!movedVenues.some(v=>v.b===b)&&!scenery.includes(b)),...c.features.filter(f=>!['forest','garden'].includes(f.kind)),c.zoo,c.farm,c.militaryBase,c.beach,c.themePark?.rect,c.airportParcel,c.natchezParcel,c.mallParcel,c.greenmart?.b,c.civicLocations?.library,c.civicLocations?.metro,...Object.entries(sites).filter(([k])=>!movedKinds.includes(k)).map(([,b])=>b),...Object.values(c.nolaLandmarks?.sites||{}),old].filter(b=>b?.w&&b?.h),moves=[],newPaths=[];
 const relocate=(size,key,venue)=>{
  const target={x:anchor.x+(moves.length%2?380:-380),y:anchor.y+(moves.length<2?250:450)},options={maxDistance:2000,allowScenery:true,allowLandscape:true,valid:r=>!!level29DistrictPlanning.access(c,{x:r.x+r.w/2,y:r.y+r.h+24},reserved.concat(r))};
  // The church itself retains its authored 180x128 dimensions. A compact square
  // (not a shrunken church) fits the existing city blocks without cutting roads.
  let r=chooseSite(c,size,target,reserved,options);if(!r&&key==='cathedral')r=chooseSite(c,{w:256,h:256},target,reserved,options);
  if(!r)throw Error('No aligned penthouse-neighborhood parcel for '+key);
  c.buildings=c.buildings.filter(b=>!scenery.includes(b)||!overlap(b,r,24));const path=level29DistrictPlanning.access(c,{x:r.x+r.w/2,y:r.y+r.h+24},reserved.concat(r));if(!path)throw Error('No public path for relocated '+key);
  reserved.push(r,...path.map(p=>({x:p.x-16,y:p.y-16,w:32,h:32})));newPaths.push(path);moves.push({key,old:{...size},next:r});if(venue){const dx=r.x-venue.b.x,dy=r.y-venue.b.y;translateVenue(venue,dx,dy);}else Object.assign(sites[key],r);
  for(const p of path){const k=(p.y/32|0)*c.width+(p.x/32|0);if(![1,9].includes(c.g[k]))c.g[k]=T_WALK;}return r;
 };

 for(const key of movedKinds)relocate(sites[key],key);for(const v of movedVenues){const prev={...v.b};for(let y=prev.y/32|0;y<(prev.y+prev.h)/32;y++)for(let x=prev.x/32|0;x<(prev.x+prev.w)/32;x++)if(![1,9].includes(c.g[y*c.width+x]))c.g[y*c.width+x]=T_GRASS;relocate(prev,v.name,v);for(let y=v.b.y/32|0;y<(v.b.y+v.b.h)/32;y++)for(let x=v.b.x/32|0;x<(v.b.x+v.b.w)/32;x++)c.g[y*c.width+x]=T_LOT;}
 for(const move of moves)if(!movedVenues.some(v=>v.name===move.key)){for(let y=move.old.y/32|0;y<(move.old.y+move.old.h)/32;y++)for(let x=move.old.x/32|0;x<(move.old.x+move.old.w)/32;x++)if(![1,9].includes(c.g[y*c.width+x]))c.g[y*c.width+x]=T_GRASS;for(let y=move.next.y/32|0;y<(move.next.y+move.next.h)/32;y++)for(let x=move.next.x/32|0;x<(move.next.x+move.next.w)/32;x++)c.g[y*c.width+x]=T_PLAZA;}
 c.energyPlant={site:old,solids:[]};c.features.push({...old,kind:'nuclear-plant'});for(let y=old.y/32|0;y<(old.y+old.h)/32;y++)for(let x=old.x/32|0;x<(old.x+old.w)/32;x++)c.g[y*c.width+x]=T_PLAZA;
 c.cathedralRelocation={old,anchor,moves,paths:newPaths};c.survivalLandmarks.paths=c.survivalLandmarks.paths.concat(newPaths);const flat=c.heightAt,rects=[old,...moves.map(m=>m.next)];c.heightAt=(x,y)=>rects.some(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h)?0:flat(x,y);
 for(const key of ['trees','pineTrees','rocks','parked'])if(c[key])c[key]=c[key].filter(p=>!rects.some(r=>overlap({x:p.x-8,y:p.y-8,w:16,h:16},r,24))&&!newPaths.some(path=>path.some(q=>Math.hypot(q.x-p.x,q.y-p.y)<24)));indexTrees(c);return c;
};
const build=buildCity;buildCity=function(){const r=build.apply(this,arguments);if(city?.energyPlant){const m=buildPlant(THREE,city.energyPlant.site,{material:level29World.material,label:addSign});cityGroup.add(m);city.energyPlant.solids=m.userData.solids;}return r;};
const block=blockedCircle;blockedCircle=function(x,y,r){if(city?.energyPlant?.solids.some(b=>hitRect(x,y,r,b)))return true;return block.apply(this,arguments);};
const blips=extraBlips;extraBlips=function(){const out=blips.apply(this,arguments),s=city?.energyPlant?.site;if(s)out.push({x:s.x+s.w/2,y:s.y+s.h+16,label:'POWER',col:'#d9c472'});return out;};
})();
