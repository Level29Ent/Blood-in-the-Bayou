'use strict';
(function(){
const SKIN=['#603d2b','#976b4d','#be8f6b','#d7ad88'],CLOTH=['#436c82','#88734c','#773d87','#3e7a5b','#d6b34b','#a75647'];
// Authored mixed crowd identities; hairstyle/clothes never change with animation or camera distance.
function character(id){const n=Math.abs(Math.trunc(id)||0),woman=n%2===1,pair=Math.floor(n/2),variant=pair%8,build=variant%4,hairstyle=woman?['bob','ponytail','bun','natural','long','locs-shoulder','locs-long','locs-tied'][variant]:['crop','short','curls','long','locs-short','locs-shoulder','locs-long','locs-tied'][variant],black=hairstyle.startsWith('locs');return {gender:woman?'woman':'man',hairstyle,outfit:woman?['blouse','jacket','tunic','tee'][build]:'shirt',build,...(black?{heritage:'African American',skin:['#573827','#754c35','#966b4b'][Math.floor(pair/8)%3],hairColor:variant===6?'#30231b':'#191715'}:{})};}

function population(nav,width,count=180){const cells=[];for(let k=0;k<nav.mask.length;k++)if(nav.mask[k])cells.push(k);if(!cells.length)return [];return Array.from({length:Math.min(count,cells.length)},(_,i)=>{const k=cells[Math.floor(i*cells.length/count)%cells.length],p=nav.point(k);return {...p,id:i,...character(i),cell:k,previous:-1,a:0,anim:0,wait:(i%5)*.4,activity:['commute','shop','talk','stroll','rest'][i%5]};});}
function advance(a,nav,width,dt,panic=false,zombies=[]){
 const danger=panic?zombies.filter(z=>z.alive&&Math.hypot(z.x-a.x,z.y-a.y)<150).sort((z,q)=>Math.hypot(z.x-a.x,z.y-a.y)-Math.hypot(q.x-a.x,q.y-a.y))[0]:null;
 a.wait-=dt;if(a.wait>0&&!panic)return;
 if(!a.target){const k=a.cell,x=k%width;let choices=[x?k-1:-1,x<width-1?k+1:-1,k-width,k+width].filter(n=>n>=0&&n<nav.mask.length&&nav.mask[n]);if(choices.length>1)choices=choices.filter(n=>n!==a.previous);if(danger)choices.sort((x,y)=>{const p=nav.point(x),q=nav.point(y);return Math.hypot(q.x-danger.x,q.y-danger.y)-Math.hypot(p.x-danger.x,p.y-danger.y);});const next=choices[panic?0:(a.id+Math.floor(a.anim))%choices.length];if(next===undefined)return;a.target={...nav.point(next),cell:next};}
 const dx=a.target.x-a.x,dy=a.target.y-a.y,d=Math.hypot(dx,dy),speed=panic?34:a.activity==='commute'?17:10,step=Math.min(d,Math.max(0,dt)*speed);
 a.a=Math.atan2(dy,dx);if(d){a.x+=dx/d*step;a.y+=dy/d*step;a.anim+=step*.15;}
 if(d<=step+.01){a.previous=a.cell;a.cell=a.target.cell;a.target=null;if(!panic&&['talk','rest','shop'].includes(a.activity))a.wait=1+a.id%4;}
}
function spectators(route,tileAt,blocked,count=384){
 const out=[],outbound=route.slice(0,Math.max(1,Math.floor(route.length/2)+1)),stations=[];
 for(let i=1;i<outbound.length;i++){const p=outbound[i-1],q=outbound[i],len=Math.hypot(q.x-p.x,q.y-p.y);for(let d=0;d<len;d+=14){const t=d/len;stations.push({x:p.x+(q.x-p.x)*t,y:p.y+(q.y-p.y)*t,a:Math.atan2(q.y-p.y,q.x-p.x)});}}
 if(!stations.length)return out;
 // Fill one rank across the entire route before deepening both sidewalk audiences.
 const occupied=new Map(),near=(x,y)=>{const cx=Math.floor(x/14),cy=Math.floor(y/14);for(let yy=cy-1;yy<=cy+1;yy++)for(let xx=cx-1;xx<=cx+1;xx++)for(const p of occupied.get(xx+','+yy)||[])if(Math.hypot(p.x-x,p.y-y)<13)return true;return false;};
 for(let row=0;row<3;row++)for(let i=0;i<stations.length&&out.length<count;i++){
  const p=stations[Math.floor(i*stations.length/Math.min(stations.length,Math.ceil(count/2)))%stations.length],nx=-Math.sin(p.a),ny=Math.cos(p.a);
  for(const side of [-1,1]){let curb=null;for(let off=16;off<=160;off+=4){const x=p.x+nx*side*off,y=p.y+ny*side*off;if([2,8].includes(tileAt(x,y))&&!blocked(x,y,7)){curb=off;break;}}if(curb===null)continue;
   const off=curb+6+row*14,x=p.x+nx*side*off,y=p.y+ny*side*off;
   if(![2,8].includes(tileAt(x,y))||blocked(x,y,7)||![-5,5].every(dx=>[-5,5].every(dy=>[2,8].includes(tileAt(x+dx,y+dy))))||near(x,y))continue;
   const actor={id:2000+out.length,...character(2000+out.length),x,y,a:Math.atan2(p.y-y,p.x-x),anim:0,wait:999,cheer:true,reaction:['wave','clap','dance','watch'][(out.length+Math.floor(out.length/2))%4],row};out.push(actor);const key=Math.floor(x/14)+','+Math.floor(y/14);if(!occupied.has(key))occupied.set(key,[]);occupied.get(key).push(actor);if(out.length>=count)return out;
  }
 }
 return out;
}
// Cache cross-sections once, not collision scans per marcher per animation frame.
function formation(route,pointAt,tileAt,blocked,spacing=16){
 const length=route.reduce((n,p,i)=>{const q=route[(i+1)%route.length];return n+Math.hypot(q.x-p.x,q.y-p.y);},0),stations=[];
 for(let d=0;d<length;d+=spacing){const p=pointAt(route,d),nx=-Math.sin(p.a),ny=Math.cos(p.a),runs=[];let run=null;
  for(let off=-128;off<=128;off+=4){const x=p.x+nx*off,y=p.y+ny*off,clear=[1,9].includes(tileAt(x,y))&&!blocked(x,y,7)&&[-6,6].every(a=>[-6,6].every(b=>[1,9].includes(tileAt(x+a,y+b))));
   if(clear){if(!run)run={min:off,max:off};run.max=off;}else if(run){runs.push(run);run=null;}
  }if(run)runs.push(run);runs.sort((a,b)=>Math.abs((a.min+a.max)/2)-Math.abs((b.min+b.max)/2));
  const band=runs.find(r=>r.max-r.min>=20),center=band?(band.min+band.max)/2:0,cx=p.x+nx*center,cy=p.y+ny*center;
  const floatClear=!!band&&band.max-band.min>=48&&[-34,0,54].every(along=>[-23,0,23].every(side=>{const x=cx+Math.cos(p.a)*along+nx*side,y=cy+Math.sin(p.a)*along+ny*side;return [1,9].includes(tileAt(x,y))&&!blocked(x,y,8);}));
  stations.push({...p,min:band?.min??0,max:band?.max??0,valid:!!band,floatClear});
 }
 return {stations,length,spacing};
}
function formationPoint(field,distance,column=0,columns=7){
 if(!field.stations.length)return null;const d=((distance%field.length)+field.length)%field.length,index=Math.floor(d/field.spacing),p=field.stations[index],next=field.stations[(index+1)%field.stations.length],t=(d-index*field.spacing)/Math.max(1,Math.min(field.spacing,field.length-index*field.spacing));
 // At bends use the sampled safe location; never interpolate a diagonal across a block.
 const straight=Math.abs(Math.sin(next.a-p.a))<.01&&Math.cos(next.a-p.a)>0,origin=straight?{x:p.x+(next.x-p.x)*t,y:p.y+(next.y-p.y)*t}:p;
 const min=straight?Math.max(p.min,next.min):p.min,max=straight?Math.min(p.max,next.max):p.max,usable=Math.max(0,max-min),capacity=Math.max(1,Math.floor(usable/12)+1),visible=max>=min&&p.valid&&(!straight||next.valid)&&column<Math.min(columns,capacity),n=Math.min(columns,capacity),off=(min+max)/2+(column-(n-1)/2)*Math.min(12,n>1?usable/(n-1):0);
 return {x:origin.x-Math.sin(p.a)*off,y:origin.y+Math.cos(p.a)*off,a:p.a,visible,floatClear:max-min>=48&&p.floatClear&&(!straight||next.floatClear)};
}
function procession(count=5,rows=6,columns=11){return Array.from({length:count*rows*columns},(_,i)=>({id:1000+i,...character(1000+i),festival:true,unit:Math.floor(i/(rows*columns)),row:Math.floor(i/columns)%rows,column:i%columns,columns,x:0,y:0,a:0,anim:0}));}
function create(T,capacity=72){
 const root=new T.Group();root.name='Prologue city residents / second line';root.userData.noBatch=true;
 const appearance=typeof window!=='undefined'?window.level29NPCAppearance:null;
 const specs=[['shirt',new T.CylinderGeometry(1,.84,1,10),1],['skin',new T.SphereGeometry(1,10,8),1],['arms',new T.CylinderGeometry(1,.8,1,8),2],['legs',new T.CylinderGeometry(1,.85,1,8),2],['shoes',new T.BoxGeometry(1,1,1),2],['eyes',new T.SphereGeometry(1,6,4),24],['hat',new T.CylinderGeometry(1,1,1,10),1],['brass',new T.CylinderGeometry(.4,1,1,8),1],['parasol',new T.ConeGeometry(1,1,10),1]];
 for(const [kind,geo,mult]of specs){const detailed=appearance?.crowdGeometry(T,kind),geometry=detailed||geo;if(detailed)geo.dispose();const material=appearance?new T.MeshStandardMaterial({color:'#ffffff',vertexColors:!!detailed,roughness:kind==='brass'?.35:.85,metalness:kind==='brass'?.6:0}):new T.MeshLambertMaterial({color:'#ffffff'});if(appearance&&['shirt','legs'].includes(kind)){material.bumpMap=appearance.details(T).cloth;material.bumpScale=.025;}const m=new T.InstancedMesh(geometry,material,capacity*mult);m.name=kind;m.count=0;m.frustumCulled=false;m.userData.noBatch=true;root.add(m);}root.userData.capacity=capacity;root.userData.detailed=!!appearance;return root;
}
function pose(T,root,actors,height){
 const dummy=new T.Object3D(),base=new T.Object3D(),local=new T.Matrix4(),matrix=new T.Matrix4(),color=new T.Color();for(const m of root.children)m.count=0;
 for(const a of actors.slice(0,root.userData.capacity)){
  const profile=character(a.id),skin=a.skin||profile.skin||SKIN[Math.floor(a.id/2)%SKIN.length],shirt=a.festival?['#713b91','#ceac3e','#32825d'][a.id%3]:CLOTH[a.id%CLOTH.length],sw=a.wait>0?0:Math.sin(a.anim||0),s=a.scale||(.94+(a.id%7)*.018),look={...profile,...a},woman=look.gender==='woman',build=look.build%4;const torsoWidth=woman?[3.25,3.55,3.6,3.45][build]:3.75;
  base.position.set(a.x,height(a.x,a.y),a.y);base.rotation.set(0,-a.a,0);base.scale.setScalar(s);base.updateMatrix();
  const put=(index,p,scale,c,rz=0,rx=0)=>{const m=root.children[index],i=m.count++;dummy.position.set(...p);dummy.scale.set(...scale);dummy.rotation.set(rx,0,rz);dummy.updateMatrix();local.copy(dummy.matrix);matrix.multiplyMatrices(base.matrix,local);m.setMatrixAt(i,matrix);color.set(c);m.setColorAt(i,color);};
  put(0,[0,woman&&look.outfit==='tunic'?11.9:12.4,0],[woman?2.15:2.38,woman&&look.outfit==='tunic'?8.2:7.2,torsoWidth],shirt);put(1,[.05,18.3,0],root.userData.detailed?[woman?1.6:1.7,1.85,woman?1.53:1.6]:[2.05,2.35,1.95],skin);
  const reaction=a.reaction||'wave',phase=a.anim||0,cheer=a.cheer;
  for(const side of [-1,1]){
   const wave=cheer&&reaction==='wave',clap=cheer&&reaction==='clap',dance=cheer&&reaction==='dance';
   const armPos=wave?[0,20,side*4.5]:clap?[3.5,13.5,side*(1.5+Math.sin(phase*2)*.6)]:dance?[1,14,side*5]:[a.festival?2.5:sw*side,11,side*4.5];
   put(2,armPos,[woman?.98:1.05,8,woman?.98:1.05],skin,wave?Math.PI+side*.16+Math.sin(phase)*.15:clap?-1.2:dance?side*.8+Math.sin(phase)*.2:a.festival?-1:sw*side*.3);
   put(3,[sw*side,4.4,side*1.8],[1.5,7.5,1.4],['#34465c','#333b36','#57504a','#283039'][a.id%4],sw*side*.28);
   put(4,[.7+sw*side,.8,side*1.8],[4,1.4,2.6],'#353331');
   if(!root.userData.detailed)put(5,[2,18.7,side*.8],[.18,.22,.3],'#241b18');
  }
  if(root.userData.detailed){const hair=look.hairColor||['#211c18','#39271c','#66513c','#aaa08b'][Math.floor(a.id/2)%4];
   put(5,[-.1,19.8,0],[1.72,.5+(a.id%3)*.1,1.63],hair);
   if(look.hairstyle.startsWith('locs')){
    const tied=look.hairstyle==='locs-tied',length=look.hairstyle==='locs-long'?5.5:look.hairstyle==='locs-short'?2.1:3.7;
    for(let i=0;i<16;i++){const angle=Math.PI*.35+i/15*Math.PI*1.3,x=-.45+Math.cos(angle)*1.15,z=Math.sin(angle)*1.7,drop=length*(.85+(i%3)*.075);
     put(5,[tied?-1.9:x,tied?18.4-i%4*.28:19.25-drop*.48,tied?z*.35:z],[.21,tied?1.75:drop*.56,.23],hair,tied?-.25:Math.sin(i)*.06);
    }
    if(tied)put(5,[-1.8,19.6,0],[.65,.65,.65],hair);
   }else if(woman&&look.hairstyle==='long'){
    for(let i=0;i<5;i++)put(5,[-1.12,16.8,(i-2)*.65],[.65,3.05,.48],hair);
    for(const side of [-1,1])put(5,[-.2,17.25,side*1.55],[.55,2.6,.4],hair);
   }else
   if(woman){
    if(look.hairstyle==='bob')for(const side of [-1,1])put(5,[-.4,18.45,side*1.25],[.95,1.35,.62],hair);
    if(look.hairstyle==='ponytail')put(5,[-1.7,18.4,0],[.7,1.75,.65],hair);
    if(look.hairstyle==='bun')put(5,[-1.15,20.35,0],[.85,.85,.85],hair);
    if(look.hairstyle==='natural')for(const side of [-1,1])put(5,[-.15,19.2,side*1.05],[1.1,1.1,1.05],hair);
   }else if(look.hairstyle==='long')put(5,[-1.1,18.65,0],[.8,1.3,1.54],hair);
  }
  if(a.festival){put(6,[0,21,0],[3,.7,3],'#dbb747');if(a.id%3===0)put(7,[5,14,-3],[2,6,2],'#caa548',Math.PI/2);if(a.id%3===1)put(8,[0,29,6],[8,4,8],shirt);}
 }
 for(const m of root.children){m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;}
}
function floatModel(T,index=0){
 if(typeof window!=='undefined'&&window.level29FestivalSpectacle)return window.level29FestivalSpectacle.floatModel(T,index);
 const g=new T.Group();g.name='Tremé Mardi Gras float '+(index+1);g.userData.noBatch=true;
 const mat=c=>new T.MeshLambertMaterial({color:c}),purple=mat('#70368e'),gold=mat('#d7b43b'),green=mat('#34815f'),dark=mat('#25252c');
 const box=(w,h,d,x,y,z,m)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);};
 box(36,3,18,0,5,0,purple);box(25,6,15,0,9,0,green);box(19,1,17,0,13,0,gold);
 for(const x of [-12,12])for(const z of [-8,8]){const wheel=new T.Mesh(new T.CylinderGeometry(3,3,2,10),dark);wheel.rotation.x=Math.PI/2;wheel.position.set(x,3,z);g.add(wheel);}
 for(let i=0;i<5;i++){const crown=new T.Mesh(new T.ConeGeometry(2.5,8,6),gold);crown.position.set(-8+i*4,18,0);g.add(crown);}
 for(const x of [-15,15]){box(.7,20,.7,x,17,0,gold);box(7,5,.5,x+3,25,0,index?green:purple);}return g;
}
const api={SKIN,CLOTH,character,population,advance,create,pose,floatModel,spectators,formation,formationPoint,procession};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29PrologueCrowd=api;
})();
