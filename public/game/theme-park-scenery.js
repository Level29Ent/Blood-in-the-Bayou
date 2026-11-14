'use strict';
(function(){
function build(T){const root=new T.Group();root.name='29 Land · splash island and landscaped midway';root.userData.noBatch=true;const batches=new Map(),dummy=new T.Object3D(),cube=new T.BoxGeometry(1,1,1),cyl=new T.CylinderGeometry(1,1,1,10),sphere=new T.SphereGeometry(1,10,7),cone=new T.ConeGeometry(1,1,8),color=new T.Color();
 const mat=(c,extra={})=>new T.MeshStandardMaterial({color:c,roughness:.7,...extra}),teal=mat('#087d9b'),yellow=mat('#edbc32'),blue=mat('#359ac2'),pink=mat('#ce5381'),green=mat('#739f36'),purple=mat('#8154aa'),cream=mat('#e8d9b1'),wood=mat('#a27543'),leaves=mat('#32664a'),grass=mat('#61825a'),water=mat('#55bfce',{roughness:.25,metalness:.13}),white=mat('#e1f2e8'),red=mat('#d55745');
 function put(g,m,x,y,z,sx,sy,sz,rot=[0,0,0],tint){dummy.position.set(x,y,z);dummy.rotation.set(...rot);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();save(g,m,dummy.matrix,tint);}
 function save(g,m,matrix,tint){if(!batches.has(g))batches.set(g,new Map());const by=batches.get(g);if(!by.has(m))by.set(m,[]);by.get(m).push({matrix:matrix.clone(),tint});}
 const box=(m,w,h,d,x,y,z)=>put(cube,m,x,y,z,w,h,d);
 function rod(a,b,r,m){const p=new T.Vector3(...a),q=new T.Vector3(...b),d=q.clone().sub(p);dummy.position.copy(p.add(q).multiplyScalar(.5));dummy.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.clone().normalize());dummy.scale.set(r,d.length(),r);dummy.updateMatrix();save(cyl,m,dummy.matrix);}
 function slide(points,m,r=3){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const shape=new T.Shape();for(let i=0;i<=12;i++){const a=Math.PI+i*Math.PI/12,x=Math.cos(a)*r,y=Math.sin(a)*r;if(i===0)shape.moveTo(x,y);else shape.lineTo(x,y);}for(let i=12;i>=0;i--){const a=Math.PI+i*Math.PI/12;shape.lineTo(Math.cos(a)*(r+.45),Math.sin(a)*(r+.45));}shape.closePath();const g=new T.ExtrudeGeometry(shape,{steps:80,bevelEnabled:false,extrudePath:curve});const mesh=new T.Mesh(g,m);mesh.userData.noBatch=true;root.add(mesh);return curve;}
 // A shallow splash basin sits within the already fenced family-coaster envelope.
 box(cream,190,2,132,553,1,235);box(water,184,.25,126,553,2.2,235);for(const [x,z,w,d]of [[458,235,2,132],[648,235,2,132],[553,169,190,2],[553,301,190,2]])box(blue,w,2,d,x,2,z);
 const sx=517,sz=218;for(const x of [sx-19,sx+19])for(const z of [sz-19,sz+19]){rod([x,2,z],[x,77,z],1.3,teal);put(cyl,yellow,x,2,z,3,.7,3);}
 for(const y of [23,48]){box(blue,44,2,44,sx,y,sz);for(const z of [sz-21,sz+21]){box(yellow,44,1,1,sx,y+10,z);for(let x=sx-20;x<=sx+20;x+=5)rod([x,y+1,z],[x,y+10,z],.35,teal);}for(const x of [sx-21,sx+21]){box(yellow,1,1,44,x,y+10,sz);for(let z=sz-20;z<=sz+20;z+=5)rod([x,y+1,z],[x,y+10,z],.35,teal);}}
 put(cone,blue,sx,78,sz,29,16,29,[0,Math.PI/4,0]);rod([sx,78,sz],[sx,97,sz],.4,teal);box(pink,12,6,.5,sx+6,95,sz);
 // Yellow staircase, splash bucket and static stylized spray arcs; no water simulation.
 for(let i=0;i<12;i++){box(yellow,13,1.2,2.7,549,3+i*2,264-i*2.2);for(const x of [542,556])rod([x,10+i*2,264-i*2.2],[x,12+i*2,261.8-i*2.2],.4,teal);}box(blue,16,2,18,549,26,232);
 rod([564,2,205],[564,90,205],1.4,teal);rod([549,88,205],[578,88,205],1,teal);put(cyl,blue,564,85,205,9,13,9,[0,0,-.35]);put(cyl,water,565,91,205,7.8,.5,7.8,[0,0,-.35]);
 slide([[498,48,213],[480,43,217],[474,27,243],[485,8,269],[502,3.5,281]],pink,4);slide([[499,48,223],[488,40,240],[500,19,263],[516,4,280]],yellow,4);
 slide([[534,48,213],[575,46,189],[616,35,207],[612,26,250],[581,21,268],[574,6,285],[585,3.5,293]],purple,4.2);
 slide([[534,48,222],[564,42,234],[594,30,219],[627,20,226],[634,8,266],[621,3.5,286]],green,4.2);
 for(const [x,z,y]of [[575,189,44],[616,207,33],[612,250,24],[581,268,19],[594,219,28],[627,226,18]])rod([x,2,z],[x,y-2,z],.8,teal);
 for(const x of [600,620]){const points=[];for(let i=0;i<=16;i++){const t=i/16;points.push(new T.Vector3(x-10+t*20,4+Math.sin(t*Math.PI)*14,185));}const geo=new T.TubeGeometry(new T.CatmullRomCurve3(points),16,.3,4,false),m=new T.Mesh(geo,white);m.userData.noBatch=true;root.add(m);}
 // Living green islands frame existing ride envelopes, with palms away from the boarding approaches.
 const palms=[[49,336],[84,337],[245,338],[45,400],[45,478],[664,334],[621,335],[665,394],[668,482],[90,600],[607,609]];
 for(const [i,[x,z]]of palms.entries()){put(cyl,cream,x,1,z,11,1,11);put(cyl,grass,x,1.6,z,9,.35,9);rod([x,2,z],[x+2,31+i%3*3,z],1,wood);for(let n=0;n<7;n++){const a=n*Math.PI*2/7;put(sphere,leaves,x+Math.cos(a)*6,31+i%3*3,z+Math.sin(a)*6,9,1.2,2.3,[0,-a,.1]);}}
 // Parasols and picnic tables on the sides of the broad central route.
 const tables=[[260,398],[442,399],[247,574],[451,603]];
 for(const [i,[x,z]]of tables.entries()){put(cyl,wood,x,9,z,8,1.3,8);rod([x,1,z],[x,30,z],.65,teal);put(cone,i%2?red:yellow,x,29,z,16,6,16);for(const side of [-1,1]){box(wood,14,2,4,x,5,z+side*10);for(const dx of [-5,5])rod([x+dx,1,z+side*10],[x+dx,5,z+side*10],.6,teal);}}
 // Lattice wrapper makes the existing drop tower read as a substantial thrill-ride landmark.
 for(const x of [426,438])for(const z of [474,486])rod([x,0,z],[x,163,z],.65,teal);
 for(let y=8;y<157;y+=14){for(const z of [474,486]){rod([426,y,z],[438,y+14,z],.35,yellow);rod([438,y,z],[426,y+14,z],.35,yellow);}for(const x of [426,438]){rod([x,y,474],[x,y+14,486],.35,yellow);}}
 put(cyl,blue,432,165,480,11,8,11);put(cone,yellow,432,173,480,12,8,12);
 // Merge static instances once: compatible with the game's Three r149 parcel bounds and batcher.
 for(const [g,groups]of batches)for(const [m,items]of groups){const positions=[],normals=[],indices=[],v=new T.Vector3(),nmat=new T.Matrix3();let offset=0;for(const item of items){const p=g.attributes.position,n=g.attributes.normal;nmat.getNormalMatrix(item.matrix);for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(item.matrix);positions.push(...v.toArray());v.fromBufferAttribute(n,i).applyMatrix3(nmat).normalize();normals.push(...v.toArray());}for(let i=0;i<g.index.count;i++)indices.push(offset+g.index.getX(i));offset+=p.count;}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geo.setIndex(indices);geo.computeBoundingBox();geo.computeBoundingSphere();const mesh=new T.Mesh(geo,m);mesh.userData.noBatch=true;root.add(mesh);}
 root.userData.themeParkScenery={slides:4,splashTowers:1,staticBucket:1,palms:palms.length,picnicTables:tables.length};
 const solids=[{x:458,y:169,w:190,h:132,kind:'decorative-splash-basin'},...palms.map(([x,z])=>({x:x-10,y:z-10,w:20,h:20,kind:'planter'})),...tables.map(([x,z])=>({x:x-9,y:z-13,w:18,h:26,kind:'picnic-table'}))];return {root,solids};
}
const api={build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29ThemeParkScenery=api;
})();
