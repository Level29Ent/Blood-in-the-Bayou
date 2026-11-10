'use strict';
(function(){
const SKIN=['#603d2b','#976b4d','#be8f6b','#d7ad88'],CLOTH=['#436c82','#88734c','#773d87','#3e7a5b','#d6b34b','#a75647'];
function population(nav,width,count=180){const cells=[];for(let k=0;k<nav.mask.length;k++)if(nav.mask[k])cells.push(k);if(!cells.length)return [];return Array.from({length:Math.min(count,cells.length)},(_,i)=>{const k=cells[Math.floor(i*cells.length/count)%cells.length],p=nav.point(k);return {...p,id:i,cell:k,previous:-1,a:0,anim:0,wait:(i%5)*.4,activity:['commute','shop','talk','stroll','rest'][i%5]};});}
function advance(a,nav,width,dt,panic=false,zombies=[]){
 const danger=panic?zombies.filter(z=>z.alive&&Math.hypot(z.x-a.x,z.y-a.y)<150).sort((z,q)=>Math.hypot(z.x-a.x,z.y-a.y)-Math.hypot(q.x-a.x,q.y-a.y))[0]:null;
 a.wait-=dt;if(a.wait>0&&!panic)return;
 if(!a.target){const k=a.cell,x=k%width;let choices=[x?k-1:-1,x<width-1?k+1:-1,k-width,k+width].filter(n=>n>=0&&n<nav.mask.length&&nav.mask[n]);if(choices.length>1)choices=choices.filter(n=>n!==a.previous);if(danger)choices.sort((x,y)=>{const p=nav.point(x),q=nav.point(y);return Math.hypot(q.x-danger.x,q.y-danger.y)-Math.hypot(p.x-danger.x,p.y-danger.y);});const next=choices[panic?0:(a.id+Math.floor(a.anim))%choices.length];if(next===undefined)return;a.target={...nav.point(next),cell:next};}
 const dx=a.target.x-a.x,dy=a.target.y-a.y,d=Math.hypot(dx,dy),speed=panic?34:a.activity==='commute'?17:10,step=Math.min(d,Math.max(0,dt)*speed);
 a.a=Math.atan2(dy,dx);if(d){a.x+=dx/d*step;a.y+=dy/d*step;a.anim+=step*.15;}
 if(d<=step+.01){a.previous=a.cell;a.cell=a.target.cell;a.target=null;if(!panic&&['talk','rest','shop'].includes(a.activity))a.wait=1+a.id%4;}
}
function create(T,capacity=72){
 const root=new T.Group();root.name='Prologue city residents / second line';root.userData.noBatch=true;
 const specs=[['shirt',new T.CylinderGeometry(1,.84,1,10),1],['skin',new T.SphereGeometry(1,10,8),1],['arms',new T.CylinderGeometry(1,.8,1,8),2],['legs',new T.CylinderGeometry(1,.85,1,8),2],['shoes',new T.BoxGeometry(1,1,1),2],['eyes',new T.SphereGeometry(1,6,4),2],['hat',new T.CylinderGeometry(1,1,1,10),1],['brass',new T.CylinderGeometry(.4,1,1,8),1],['parasol',new T.ConeGeometry(1,1,10),1]];
 for(const [kind,geo,mult]of specs){const m=new T.InstancedMesh(geo,new T.MeshLambertMaterial({color:'#ffffff'}),capacity*mult);m.name=kind;m.count=0;m.frustumCulled=false;m.userData.noBatch=true;root.add(m);}root.userData.capacity=capacity;return root;
}
function pose(T,root,actors,height){
 const dummy=new T.Object3D(),base=new T.Object3D(),local=new T.Matrix4(),matrix=new T.Matrix4(),color=new T.Color();for(const m of root.children)m.count=0;
 for(const a of actors.slice(0,root.userData.capacity)){
  const skin=SKIN[a.id%SKIN.length],shirt=a.festival?['#713b91','#ceac3e','#32825d'][a.id%3]:CLOTH[a.id%CLOTH.length],sw=a.wait>0?0:Math.sin(a.anim||0),s=a.scale||1;
  base.position.set(a.x,height(a.x,a.y),a.y);base.rotation.set(0,-a.a,0);base.scale.setScalar(s);base.updateMatrix();
  const put=(index,p,scale,c,rz=0,rx=0)=>{const m=root.children[index],i=m.count++;dummy.position.set(...p);dummy.scale.set(...scale);dummy.rotation.set(rx,0,rz);dummy.updateMatrix();local.copy(dummy.matrix);matrix.multiplyMatrices(base.matrix,local);m.setMatrixAt(i,matrix);color.set(c);m.setColorAt(i,color);};
  put(0,[0,12.4,0],[2.38,7.2,3.75],shirt);put(1,[.05,18.3,0],[2.05,2.35,1.95],skin);
  for(const side of [-1,1]){put(2,[a.festival?2.5:sw*side,11,side*4.5],[1.1,8,1.1],skin,a.festival?-1:sw*side*.3);put(3,[sw*side,4.4,side*1.8],[1.5,7.5,1.4],'#34465c',sw*side*.28);put(4,[.7+sw*side,.8,side*1.8],[4,1.4,2.6],'#252324');put(5,[2,18.7,side*.8],[.18,.22,.3],'#241b18');}
  if(a.festival){put(6,[0,21,0],[3,.7,3],'#dbb747');if(a.id%3===0)put(7,[5,14,-3],[2,6,2],'#caa548',Math.PI/2);if(a.id%3===1)put(8,[0,29,6],[8,4,8],shirt);}
 }
 for(const m of root.children){m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;}
}
function floatModel(T,index=0){
 const g=new T.Group();g.name='Tremé Mardi Gras float '+(index+1);g.userData.noBatch=true;
 const mat=c=>new T.MeshLambertMaterial({color:c}),purple=mat('#70368e'),gold=mat('#d7b43b'),green=mat('#34815f'),dark=mat('#25252c');
 const box=(w,h,d,x,y,z,m)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);};
 box(36,3,18,0,5,0,purple);box(25,6,15,0,9,0,green);box(19,1,17,0,13,0,gold);
 for(const x of [-12,12])for(const z of [-8,8]){const wheel=new T.Mesh(new T.CylinderGeometry(3,3,2,10),dark);wheel.rotation.x=Math.PI/2;wheel.position.set(x,3,z);g.add(wheel);}
 for(let i=0;i<5;i++){const crown=new T.Mesh(new T.ConeGeometry(2.5,8,6),gold);crown.position.set(-8+i*4,18,0);g.add(crown);}
 for(const x of [-15,15]){box(.7,20,.7,x,17,0,gold);box(7,5,.5,x+3,25,0,index?green:purple);}return g;
}
const api={SKIN,CLOTH,population,advance,create,pose,floatModel};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29PrologueCrowd=api;
})();
