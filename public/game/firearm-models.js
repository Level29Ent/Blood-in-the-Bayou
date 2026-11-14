'use strict';
(function(){
// Cosmetic game meshes only. All dimensions are art-space, not manufacturing data.
const caches=new WeakMap();
function kit(T){
 const mat=(name,color,roughness,metalness=0)=>{const m=new T.MeshStandardMaterial({color,roughness,metalness});m.name=name;return m;};
 const P={steel:mat('Blued steel','#29343d',.38,.55),edge:mat('Brushed hardware','#7c858a',.32,.65),poly:mat('Textured polymer','#151b1d',.82),rubber:mat('Rubber buttpad','#171b1c',.95),wood:mat('Walnut furniture','#684631',.6),black:mat('Recesses','#101618',.75),lens:mat('Optic glass','#3d727b',.19,.35)};
 if(typeof document!=='undefined'){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;const c=canvas.getContext('2d');
  c.fillStyle='#95603c';c.fillRect(0,0,256,128);
  for(let i=0;i<65;i++){const y=i*2;c.strokeStyle=i%3?'#865332':'#a5734d';c.lineWidth=.6;c.beginPath();c.moveTo(0,y);c.bezierCurveTo(70,y+6,170,y-6,256,y+1);c.stroke();}
  const grain=new T.CanvasTexture(canvas);grain.encoding=T.sRGBEncoding;P.wood.map=grain;
  const noise=document.createElement('canvas');noise.width=noise.height=64;const n=noise.getContext('2d');n.fillStyle='#999';n.fillRect(0,0,64,64);
  for(let i=0;i<512;i++){n.fillStyle=i%2?'#777':'#bbb';n.fillRect((i*17)%64,(i*29+Math.floor(i/64)*7)%64,1,1);}
  const bump=new T.CanvasTexture(noise);bump.wrapS=bump.wrapT=T.RepeatWrapping;bump.repeat.set(3,3);P.poly.bumpMap=bump;P.poly.bumpScale=.018;
 }
 return P;
}
function build(T,id,P){
 const g=new T.Group(),details=[];
 const part=(name,w,h,d,x,y,z,m=P.steel)=>{
  const r=Math.min(w,h,d)*.12,s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
  const geo=new T.ExtrudeGeometry(s,{depth:Math.max(.01,d-r*2),bevelEnabled:true,bevelThickness:r,bevelSize:r*.5,bevelSegments:1,steps:1,curveSegments:2});geo.translate(0,0,-d/2+r);
  const mesh=new T.Mesh(geo,m);mesh.position.set(x,y,z);g.add(mesh);details.push(name);return mesh;
 };
 const profile=(name,points,width,material)=>{
  const shape=new T.Shape();points.forEach(([z,y],i)=>i?shape.lineTo(-z,y):shape.moveTo(-z,y));shape.closePath();
  const geo=new T.ExtrudeGeometry(shape,{depth:width,bevelEnabled:true,bevelThickness:.04,bevelSize:.04,bevelSegments:1,steps:1});geo.translate(0,0,-width/2);geo.rotateY(Math.PI/2);g.add(new T.Mesh(geo,material));details.push(name);
 };
 const tube=(name,r,len,x,y,z,m=P.steel)=>{const o=new T.Mesh(new T.CylinderGeometry(r,r,len,12),m);o.rotation.x=Math.PI/2;o.position.set(x,y,z);g.add(o);details.push(name);return o;};
 const muzzle=(z,y,r)=>{const lip=new T.Mesh(new T.RingGeometry(r*.66,r,16),P.steel);lip.position.set(0,y,z);lip.rotation.y=Math.PI;g.add(lip);const bore=new T.Mesh(new T.CircleGeometry(r*.65,16),P.black);bore.position.set(0,y,z+.035);bore.rotation.y=Math.PI;g.add(bore);details.push('recessed muzzle');};
 const guard=(z,y,scale=1)=>{const curve=new T.CatmullRomCurve3([new T.Vector3(0,y+.35,z+.7),new T.Vector3(0,y-.7,z+.7),new T.Vector3(0,y-.85,z-.7),new T.Vector3(0,y+.35,z-.8)],true);g.add(new T.Mesh(new T.TubeGeometry(curve,14,.1*scale,5,true),P.steel));part('curved trigger',.12,.6,.2,0,y-.1,z+.05,P.black).rotation.x=.25;details.push('open trigger guard');};
 const pins=(z,y,x=.83)=>{for(const dz of [0,1.25]){const pin=new T.Mesh(new T.CylinderGeometry(.1,.1,.05,8),P.edge);pin.rotation.z=Math.PI/2;pin.position.set(x,y,z+dz);g.add(pin);}details.push('receiver pins');};
 if(id==='pistol'){
  part('slide',1.2,.92,5.4,0,.65,-1.18);part('frame',1.08,.55,4.5,0,-.05,-.8,P.poly);
  part('ejection port',.04,.45,.95,.71,.7,-1.1,P.black);part('barrel hood',.05,.25,.55,.735,.66,-1.05,P.edge);
  const grip=part('angled grip',1.05,2.5,1.5,0,-1.4,.85,P.poly);grip.rotation.x=-.23;
  part('magazine base',1.18,.23,1.6,0,-2.7,1.16,P.rubber);
  for(const side of [-1,1]){for(let i=0;i<6;i++)part('slide serrations',.03,.65,.055,side*.71,.65,.35+i*.18,P.black);for(let y=0;y<5;y++)part('grip texture',.035,.08,.95,side*.64,-.65-y*.34,.9,P.rubber);}
  guard(-.5,-.85);part('rear sight',1.15,.25,.3,0,1.25,.98,P.black);part('front sight',.18,.28,.2,0,1.22,-3.48,P.black);
  for(const x of [-.37,.37])part('sight dots',.12,.12,.04,x,1.31,1.15,P.edge);
  part('slide stop',.12,.18,.65,-.66,-.02,.2,P.edge);muzzle(-3.95,.65,.27);pins(-.2,-.1,.64);
 }else if(id==='shotgun'){
  part('receiver',1.6,1.7,5.4,0,.25,.3);
  part('ejection port',.04,.7,1.8,.94,.3,-.4,P.black);
  tube('barrel',.34,13.6,0,.6,-8.85);tube('magazine tube',.26,11.5,0,-.25,-7.5);
  part('walnut pump',1.65,1.25,4.4,0,-.4,-6.2,P.wood);
  for(let i=0;i<10;i++)part('pump grooves',1.7,.12,.09,0,-.35,-8+i*.4,P.black);
  profile('walnut shoulder stock',[[3.1,.3],[8.1,.3],[8.1,-1.7],[6.5,-1.5],[3.1,-.6]],1.55,P.wood);
  part('buttpad',1.75,2.35,.5,0,-.8,8.4,P.rubber);
  part('stock wrist',1.1,1.7,1.7,0,-.8,2.4,P.wood).rotation.x=-.25;
  guard(.7,-1.1);muzzle(-15.65,.6,.34);pins(-.5,.15);
  part('bead sight',.12,.16,.12,0,1,-14.5,P.edge);
 }else{
  const compact=id==='smg',scoped=id==='marksman',front=compact?-8.32:-13.72;
  part('upper receiver',1.62,1.5,5.7,0,.45,.05);part('lower receiver',1.4,.85,3.8,0,-.5,1,P.poly);
  part('ejection port',.04,.52,1.55,.95,.55,-.3,P.black);part('bolt face',.05,.18,1.1,.975,.43,-.25,P.edge);
  part('charging handle',.45,.3,1.2,-1.02,.6,.4,P.black);pins(-.8,.1);
  const grip=part('pistol grip',.95,2.6,1.3,0,-1.9,2.1,P.poly);grip.rotation.x=-.25;guard(.6,-1.1);
  const magBottom=compact?-4.3:-5.7;
  profile('curved magazine',[[-1.65,-.85],[-.1,-.85],[.2,magBottom+.1],[-1.3,magBottom-.1],[-1.8,-2.6]],1.02,P.poly);
  for(const side of [-1,1])for(let i=0;i<3;i++)part('magazine ribs',.045,compact?2.3:3.6,.075,side*.565,compact?-2.8:-3.4,-1.25+i*.4,P.edge).rotation.x=.08;
  const stockZ=compact?4.8:5.6;part('buffer tube',.65,.65,3.4,0,.5,3.9,P.black);
  profile('tapered shoulder stock',[[stockZ-1.8,.95],[stockZ+1.8,.95],[stockZ+1.8,-1.05],[stockZ+.6,-.85],[stockZ-1.8,.1]],1.4,scoped?P.wood:P.poly);
  part('stock lower brace',.65,.45,3.5,0,-.65,stockZ,P.poly).rotation.x=.25;
  part('buttpad',1.7,2.5,.45,0,-.05,compact?6.8:7.6,P.rubber);
  const handLen=compact?3.1:6.8,handZ=compact?-4.25:-6.4;
  part('fore-end',1.45,1.45,handLen,0,.1,handZ,scoped?P.wood:P.poly);
  for(const side of [-1,1])for(let i=0;i<(compact?4:8);i++)part('vent recess',.035,.3,.46,side*.84,.25,handZ-handLen*.4+i*.7,P.black);
  tube('barrel',.2,compact?3.4:6.2,0,.4,(front+handZ)/2);tube('muzzle collar',.31,.65,0,.4,front+.35);muzzle(front,.4,.31);
  part('continuous rail spine',1.1,.5,compact?7:11,0,1.13,compact?-1.8:-3.8,P.steel);
  for(let i=0;i<(compact?9:17);i++)part('top rail',1.55,.16,.18,0,1.42,2.2-i*.5,P.edge);
  if(scoped){
   for(const z of [-1.4,1.4])part('optic mounts',.75,.8,.5,0,1.85,z,P.black);
   tube('scope tube',.5,4.7,0,2.45,-.5,P.black);tube('objective bell',.78,1.3,0,2.45,-3.1,P.steel);tube('eyepiece',.63,.85,0,2.45,2.2,P.rubber);
   for(const z of [-3.77,2.64]){const lens=new T.Mesh(new T.CircleGeometry(z<0?.68:.52,16),P.lens);lens.position.set(0,2.45,z);if(z<0)lens.rotation.y=Math.PI;g.add(lens);}
   part('optic turret',.65,.65,.65,.5,2.6,-.5,P.edge);details.push('scope lenses');
  }else{
   part('rear aperture base',1.2,.45,.6,0,1.7,1.8,P.black);
   const aperture=new T.Mesh(new T.TorusGeometry(.26,.08,5,12),P.steel);aperture.position.set(0,2,1.8);g.add(aperture);
   part('front sight tower',.42,1.2,.5,0,.95,front+1.2,P.steel);
   part('front post',.12,.6,.15,0,1.8,front+1.2,P.edge);
   for(const side of [-1,1])part('sight ears',.14,.65,.3,side*.45,1.55,front+1.2,P.black);
  }
 }
 // Merge static parts by shared material. Templates are cached and clones share resources.
 g.updateMatrixWorld(true);const buckets=new Map(),retired=[];
 g.traverse(o=>{if(!o.isMesh)return;const a=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();a.applyMatrix4(o.matrixWorld);if(!buckets.has(o.material))buckets.set(o.material,[]);buckets.get(o.material).push(a);retired.push(o.geometry);});
 g.clear();for(const [material,list]of buckets){const out=new T.BufferGeometry();for(const name of ['position','normal','uv']){const arrays=list.map(a=>a.attributes[name]),size=arrays[0].itemSize,data=new Float32Array(arrays.reduce((n,a)=>n+a.array.length,0));let offset=0;for(const a of arrays){data.set(a.array,offset);offset+=a.array.length;}out.setAttribute(name,new T.BufferAttribute(data,size));}out.computeBoundingSphere();g.add(new T.Mesh(out,material));for(const a of list)a.dispose();}for(const a of retired)a.dispose();
 g.name='Detailed firearm · '+id;g.userData.firearm=id;g.userData.details=details;return g;
}
function create(T,id){if(!['pistol','smg','carbine','marksman','shotgun'].includes(id))return null;let c=caches.get(T);if(!c){c={palette:kit(T),models:new Map()};caches.set(T,c);}if(!c.models.has(id))c.models.set(id,build(T,id,c.palette));return c.models.get(id).clone(true);}
const api={create};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29FirearmModels=api;
})();
