'use strict';
(function(){
function plan(b,dir=1){const flip=r=>dir===-1?{...r,x:2*b.x+b.w-r.x-r.w,y:2*b.y+b.h-r.y-r.h}:r;return {solids:[{x:b.x+3,y:b.y+18,w:15,h:b.h-34,kind:'fashion-rail'},{x:b.x+b.w-18,y:b.y+18,w:15,h:b.h-34,kind:'fashion-rail'},{x:b.x+3,y:b.y+3,w:b.w-6,h:11,kind:'fashion-wall'},{x:b.x+5,y:b.y+b.h-15,w:18,h:11,kind:'folded-display'},{x:b.x+b.w-25,y:b.y+b.h-15,w:20,h:11,kind:'mannequin-plinth'}].map(flip)};}
function build(T,b,{base=0,dir=1}={}){
 const root=new T.Group();root.name='Bayou Fashion · wood boutique and curated clothing';root.position.set(b.x,base,b.y);if(dir===-1){root.rotation.y=Math.PI;root.position.set(b.x+b.w,base,b.y+b.h);}root.userData.noBatch=true;
 const cube=new T.BoxGeometry(1,1,1),sphere=new T.SphereGeometry(1,12,8),cyl=new T.CylinderGeometry(1,1,1,12),cone=new T.ConeGeometry(1,1,12),ring=new T.TorusGeometry(1,.1,5,16),dummy=new T.Object3D(),color=new T.Color(),batches=new Map(),mats={};
 const mat=(key,c,e={})=>mats[key]||(mats[key]=new T.MeshStandardMaterial({color:c,roughness:.8,...e}));
 const oak=mat('oak','#ae8756'),panel=mat('panel','#8b6843'),cream=mat('cream','#e5dbc5'),dark=mat('dark','#252a2c'),gold=mat('gold','#bc9b5b',{metalness:.65,roughness:.38}),cloth=mat('cloth','#ffffff'),denim=mat('denim','#64798a'),mannequin=mat('mannequin','#d4c9b2'),glass=mat('glass','#b5cbd0',{transparent:true,opacity:.13,depthWrite:false,roughness:.2}),leaf=mat('leaf','#42614a');const glow=new T.MeshBasicMaterial({color:'#fff0d1'}),palette=['#eee3cd','#303437','#ac7857','#867257','#d9cbd3','#707d7a','#674459','#b4483b','#4d6359','#caa654'];let garments=0,folds=0,mannequins=0,shoes=0,bags=0;
 function emit(g,m,x,y,z,sx,sy,sz,rot=[0,0,0],tint){dummy.position.set(x,y,z);dummy.rotation.set(...rot);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();save(g,m,dummy.matrix,tint);}
 function save(g,m,matrix,tint){if(!batches.has(g))batches.set(g,new Map());const by=batches.get(g);if(!by.has(m))by.set(m,[]);by.get(m).push({matrix:matrix.clone(),tint});}
 const box=(m,w,h,d,x,y,z,tint)=>emit(cube,m,x,y,z,w,h,d,undefined,tint),ball=(m,x,y,z,sx,sy,sz,tint)=>emit(sphere,m,x,y,z,sx,sy,sz,undefined,tint);
 function rod(a,b,r,m){const p=new T.Vector3(...a),q=new T.Vector3(...b),d=q.clone().sub(p);dummy.position.copy(p.add(q).multiplyScalar(.5));dummy.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.clone().normalize());dummy.scale.set(r,d.length(),r);dummy.updateMatrix();save(cyl,m,dummy.matrix);}
 function clothItem(x,y,z,i,angle=0){const g=new T.Matrix4().makeRotationY(angle);g.setPosition(x,y,z);const old=save;
 // Local outfit parts share the same hanger pose; geometry includes sleeves, collars, seams and buttons.
 function part(geo,m,xx,yy,zz,sx,sy,sz,rot=[0,0,0],tint){dummy.position.set(xx,yy,zz);dummy.rotation.set(...rot);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();old(geo,m,g.clone().multiply(dummy.matrix),tint);}
 const c=palette[i%palette.length],dress=i%4===0,jacket=i%4===1;
 part(cube,cloth,0,-6,0,6,10,1.5,undefined,c);for(const side of [-1,1]){part(cube,cloth,side*4.1,-4,0,2.7,7.5,1.5,[0,0,side*.24],c);part(cube,cream,side*.9,-1.1,.9,1.6,2.2,.25,[0,0,side*.5]);}
 if(dress)part(cone,cloth,0,-13,0,4.5,9,2.7,[Math.PI,0,0],c);else if(i%4===2)for(const side of [-1,1])part(cube,denim,side*1.6,-14,0,2.6,9,1.3);
 if(jacket){for(let n=0;n<10;n++){const xx=(n%2?1:-1)*1.7,yy=-2.5-Math.floor(n/2)*1.8;part(sphere,cloth,xx,yy,1.01,.45,.5,.05,undefined,palette[(i+n+3)%10]);part(sphere,cream,xx,yy,1.08,.12,.12,.05);}part(cube,dark,0,-6,.85,.35,9,.1);for(const side of [-1,1])part(cube,cream,side*1.7,-7,1,1.7,1.3,.12);}
 for(let n=0;n<4;n++)part(sphere,gold,0,-3-n*1.7,1,.15,.15,.12);
 for(const side of [-1,1])part(cube,oak,side*2,-.2,0,4.5,.3,.4,[0,0,side*.3]);part(ring,gold,0,1.3,0,.55,.75,.55);garments++;}
 function fold(x,y,z,i){box(cloth,6,.8,4,x,y,z,palette[i%10]);box(cloth,5.7,.25,3.8,x,y+.5,z,palette[(i+1)%10]);box(cream,1,.08,1.3,x+1.7,y+.66,z+.6);folds++;}
 function shoe(x,y,z,i){ball(dark,x,y,z,1.7,.7,3);box(cream,3.2,.25,5.4,x,y-.55,z);ball(cloth,x,y+.5,z-.8,1.3,.6,1.5,palette[i%10]);for(let n=0;n<3;n++)box(cream,1.9,.1,.16,x,y+1,z-.8+n*.5);shoes++;}
 function bag(x,y,z,i){box(cloth,4.5,3.3,2.7,x,y+1.8,z,palette[(i+2)%10]);box(gold,.9,.65,.2,x,y+2,z+1.45);emit(ring,gold,x,y+4.3,z,1.2,1.2,1.2);bags++;}
 const w=b.w,h=b.h;
 box(oak,w-4,.15,h-4,w/2,1.65,h/2);for(let x=4;x<w-2;x+=6)box(panel,.08,.03,h-4,x,1.75,h/2);for(let row=0;row<6;row++)for(let x=4+(row%2)*12;x<w-2;x+=24)box(panel,5.8,.03,.08,x,1.76,4+row*12);
 // Wood-paneled rear wall, molded frames and two tiers of face-out clothing.
 box(panel,w-4,40,.5,w/2,24,1.7);for(let x=4;x<w-3;x+=16){for(const xx of [x,x+13])box(oak,.65,35,.4,xx,24,2.2);for(const yy of [7,41])box(oak,13,.65,.4,x+6.5,yy,2.2);}
 for(const side of [-1,1]){const x=side===-1?2:w-2;box(cream,.4,40,h-6,x,24,h/2);for(let z=5;z<h-4;z+=13)box(oak,.5,34,.7,x+(side===-1?.3:-.3),24,z);}
 for(let row=0;row<2;row++){const y=23+row*16;rod([6,y,8],[w-6,y,8],.4,gold);box(oak,w-9,.7,7,w/2,y+4,5.7);for(let i=0;i<Math.floor((w-12)/9);i++)clothItem(9+i*9,y-2,8,i+row*11);}
 // Two freestanding black/brass side rails hold aisle-facing outfits with front and lower shelves.
 for(const side of [-1,1]){const x=side<0?10.5:w-10.5,angle=side<0?Math.PI/2:-Math.PI/2;for(const z of [19,h-18]){rod([x,2,z],[x,38,z],.5,dark);box(gold,11,.5,2,x,2,z);}rod([x,38,19],[x,38,h-18],.5,gold);box(oak,13,.7,h-34,x,7,h/2+1);
 for(let i=0;i<Math.floor((h-38)/4);i++)clothItem(x,35,22+i*4,i+(side<0?3:14),angle);
 for(let i=0;i<4;i++)for(let stack=0;stack<3;stack++)fold(x,side<0?8+stack:3.4+stack,22+i*7,i+stack);
 }
 // Low glass accessory cabinet sits inside the right rail footprint, below the hanging hems.
 const caseX=w-10.5;box(gold,13,1,24,caseX,7.5,h/2+1);box(glass,13,.15,24,caseX,14,h/2+1);box(glass,.15,5,24,caseX-6.5,11.5,h/2+1);for(const z of [h/2-11,h/2+13])box(gold,13,5,.35,caseX,11.5,z);for(let i=0;i<3;i++)bag(caseX,8,h/2-6+i*7,i);
 // Folded-shirt oak display island and lower shoe shelf stay left of the entry's clear middle.
 box(oak,18,1,11,14,12,h-9.5);box(oak,18,.8,11,14,4,h-9.5);for(const x of [5.4,22.6])box(oak,.8,10,11,x,7,h-9.5);for(let i=0;i<2;i++){for(let j=0;j<4;j++)fold(10+i*8,12.9+j,h-9.5,i+j);shoe(9+i*7,5,h-9.5,i);}
 // Two original faceless display mannequins wear jackets/dresses on a low entry plinth.
 box(cream,20,1.8,11,w-15,2.8,h-9.5);for(let i=0;i<2;i++){const x=w-20+i*10,z=h-10;rod([x,3,z],[x,8,z],.3,gold);ball(mannequin,x,29,z,1.7,2.3,1.6);emit(cyl,mannequin,x,26.3,z,.65,1.7,.65);ball(cloth,x,21,z,2.8,4.5,1.6,palette[i?7:1]);for(const side of [-1,1]){rod([x+side*2.4,24,z],[x+side*3.3,17,z],.6,mannequin);rod([x+side*1.2,17,z],[x+side*1.2,7,z],.8,i?mannequin:denim);shoe(x+side*1.2,5.8,z+.7,i);}if(i){emit(cone,cloth,x,16,z,3.6,8,2,[Math.PI,0,0],palette[7]);for(let n=0;n<8;n++)ball(cream,x+(n%2?1:-1)*1.1,18+Math.floor(n/2)*1.6,z+1.65,.4,.45,.06);}else{for(const side of [-1,1])box(cream,1.2,3,.15,x+side,23,z+1.6);}mannequins++;}
 // Mirrors reflect the palette through simple glass panels, not a costly real-time camera.
 box(gold,10,18,.7,w/2,29,3);box(glass,8,16,.8,w/2,29,3.5);
 for(const x of [w*.24,w*.76]){box(dark,1,.6,h-8,x,48,h/2);for(const z of [15,35,55]){emit(cone,greenOrDark(),x,44,z,2.5,3.5,2.5);emit(cyl,glow,x,42.2,z,2,.15,2);box(gold,.2,2,.2,x,46,z);}}
 function greenOrDark(){return mat('lamp','#476b58',{roughness:.6});}
 if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#e3d2b1';ctx.fillRect(0,0,1024,128);ctx.fillStyle='#2a3430';ctx.textAlign='center';ctx.font='bold 48px sans-serif';ctx.fillText('BAYOU FASHION',512,55);ctx.font='22px sans-serif';ctx.fillText('CURATED CLOTHING · ACCESSORIES · NEW SEASON',512,103);const tex=new T.CanvasTexture(c);tex.encoding=T.sRGBEncoding;const sign=new T.Mesh(new T.PlaneGeometry(w-13,7),new T.MeshBasicMaterial({map:tex}));sign.position.set(w/2,44,3);sign.userData.noBatch=true;root.add(sign);}
 for(const [g,groups]of batches)for(const [m,items]of groups){const mesh=new T.InstancedMesh(g,m,items.length);mesh.userData.noBatch=true;items.forEach((a,i)=>{mesh.setMatrixAt(i,a.matrix);if(a.tint)mesh.setColorAt(i,color.set(a.tint));});root.add(mesh);}
 root.userData.fashionStore={garments,folds,mannequins,shoes,bags};return {root,solids:plan(b,dir).solids,plan:plan(b,dir)};
}
const api={plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29FashionStore=api;
})();
