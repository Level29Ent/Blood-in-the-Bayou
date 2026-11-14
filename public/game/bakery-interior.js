'use strict';
(function(){
function plan(b,dir=1){const flip=r=>dir===-1?{...r,x:2*b.x+b.w-r.x-r.w,y:2*b.y+b.h-r.y-r.h}:r;return {solids:[{x:b.x+3,y:b.y+18,w:10,h:b.h-31,kind:'bread-rack'},{x:b.x+b.w-13,y:b.y+18,w:10,h:b.h-31,kind:'pastry-case'},{x:b.x+3,y:b.y+3,w:b.w-6,h:10,kind:'prep-counter'}].map(flip)};}
function build(T,b,{base=0,dir=1,sign}={}){const root=new T.Group();root.name='Crescent Bakery · artisan bread and pastry shop';root.position.set(b.x+b.w/2,base,b.y+b.h/2);if(dir===-1)root.rotation.y=Math.PI;const w=b.w,h=b.h,p=plan(b,dir),batches=new Map(),tmp=new T.Object3D(),color=new T.Color();let breads=0,pastries=0,cakes=0;
 const mat=(c,e={})=>new T.MeshStandardMaterial({color:c,roughness:.75,...e}),wood=mat('#a27b48'),trim=mat('#6d5133'),white=mat('#e8e0cf'),steel=mat('#a4ada8',{metalness:.5,roughness:.35}),dark=mat('#293337'),dough=mat('#b47b3c'),crust=mat('#87532c'),crumb=mat('#dbc18c'),cream=mat('#eee0bd'),chocolate=mat('#493027'),jam=mat('#9c303e',{roughness:.3}),glass=mat('#cadcda',{transparent:true,opacity:.11,depthWrite:false,roughness:.16}),glow=new T.MeshBasicMaterial({color:'#fff3d6'});
 const cube=new T.BoxGeometry(1,1,1),ball=new T.SphereGeometry(1,12,8),cyl=new T.CylinderGeometry(1,1,1,16),torus=new T.TorusGeometry(1,.32,6,16),cone=new T.ConeGeometry(1,1,10),flourGeo=new T.IcosahedronGeometry(1,0);
 function inst(g,m,x,y,z,sx=1,sy=1,sz=1,c,rot){if(!batches.has(g))batches.set(g,new Map());const by=batches.get(g);if(!by.has(m))by.set(m,[]);tmp.position.set(x,y,z);tmp.scale.set(sx,sy,sz);tmp.rotation.set(...(rot||[0,0,0]));tmp.updateMatrix();by.get(m).push({matrix:tmp.matrix.clone(),c});}
 const box=(m,ww,hh,dd,x,y,z,c)=>inst(cube,m,x,y,z,ww,hh,dd,c);
 function loaf(x,y,z,i){const long=i%3===0,round=i%3===1;inst(ball,dough,x,y,z,long?1.3:round?2.1:1.8,round?1.35:1.1,long?4:round?2.1:2.6,['#a76b35','#bc8b4f','#c49354','#86502b'][i%4]);for(let n=0;n<(long?5:3);n++)inst(cube,crumb,x,y+1.02,z+(n-(long?2:1))*(long?1.15:1.3),long?2:2.4,.1,.24,null,[0,.5,0]);for(let n=0;n<7;n++)inst(flourGeo,white,x+Math.sin(n*2+i)*1.1,y+1.18,z+Math.cos(n*2+i)*1.2,.11,.035,.12);breads++;}
 function pastry(x,y,z,i){if(i%4===0){inst(torus,dough,x,y,z,1,1,.65,null,[Math.PI/2,0,0]);inst(ball,jam,x,y+.25,z,.45,.13,.45);}else if(i%4===1){inst(cyl,dough,x,y,z,.9,.9,.9);inst(cone,cream,x,y+1,z,1,1.4,1);inst(ball,jam,x,y+1.7,z,.19,.2,.19);}else if(i%4===2){inst(ball,dough,x,y,z,1.35,.5,1);inst(ball,cream,x,y+.4,z,1.1,.17,.8);inst(ball,jam,x,y+.62,z,.3,.08,.3);}else{inst(ball,crust,x,y,z,.85,.6,1.5);for(let n=0;n<4;n++)box(chocolate,1.2,.1,.13,x,y+.58,z-.8+n*.5);}pastries++;}
 // Warm stone floor, white tile prep backsplash and wood-paneled display walls.
 box(white,w-4,.2,h-4,0,1.35,0);for(let x=-w/2+5;x<w/2-2;x+=10)box(trim,.1,.04,h-4,x,1.47,0);for(let z=-h/2+5;z<h/2-2;z+=10)box(trim,w-4,.04,.1,0,1.47,z);
 box(white,w-3,36,.5,0,25,-h/2+1.5);for(let y=12;y<41;y+=5)box(steel,w-4,.1,.1,0,y,-h/2+1.85);for(let x=-w/2+5;x<w/2-2;x+=8)box(steel,.1,29,.1,x,25,-h/2+1.9);
 // Three slatted bread-rack tiers: baguettes, scored oval loaves and round boules.
 const bx=-w/2+8,run=h-31;for(const z of [-run/2,run/2])for(const dx of [-4,4])box(trim,.7,31,.7,bx+dx,17,z);
 for(let row=0;row<3;row++){const y=5+row*9;for(let x=bx-4.5;x<bx+5;x+=1.5)box(wood,1.1,.6,run,x,y,0);for(const end of [-1,1])box(trim,10,2,.6,bx,y+1,end*run/2);box(steel,.3,2.7,run,bx+5,y+1.8,0);for(let i=0;i<Math.floor(run/5.5);i++)loaf(bx,y+1.6,-run/2+3+i*5.5,row*8+i);}
 // Right-hand lit pastry case with open, stocked shelves and faint customer glass.
 const px=w/2-8;box(wood,10,6,run,px,4.5,0);box(steel,11,1,run+1,px,8,0);for(const z of [-run/2,run/2])box(steel,10,20,.6,px,18,z);
 for(let row=0;row<3;row++){const y=9+row*6;box(steel,10,.4,run,px,y,0);box(glow,.25,.2,run-2,px+4.4,y+5,0);for(let j=0;j<Math.floor(run/4);j++)for(const side of [-1,1])pastry(px+side*2,y+1.1,-run/2+2+j*4,j+row*7);}
 box(glass,.25,20,run,px-5.2,18,0);box(glass,10,.25,run,px,28.3,0);box(steel,.6,.6,run,px-5.3,28.5,0);
 // Original cakes on platters above the cabinet: icing layers and piped cream dots.
 for(let i=0;i<3;i++){const z=-run*.28+i*run*.28;inst(cyl,white,px,29,z,3,.35,3);inst(cyl,i%2?chocolate:cream,px,31,z,2.4,3.5,2.4);inst(cyl,white,px,31,z,2.45,.4,2.45);for(let n=0;n<9;n++){const a=n*Math.PI*2/9;inst(ball,cream,px+Math.cos(a)*1.9,33,z+Math.sin(a)*1.9,.35,.5,.35);}inst(ball,jam,px,33.2,z,.4,.25,.4);cakes++;}
 // Working-looking prep counter and compact mixer behind the displays.
 const backZ=-h/2+8;box(wood,w-8,10,10,0,6.5,backZ);box(steel,w-7,1,11,0,12.2,backZ);
 box(white,8,1,7,-w*.25,13.4,backZ);box(steel,3,10,3,-w*.25,18,backZ-2);box(cream,9,4,4,-w*.25+2,22,backZ-1);inst(cyl,steel,-w*.25+3,16,backZ+1,3.4,3.5,3.4);inst(torus,steel,-w*.25+3,18,backZ+1,2.4,2.4,2.4,null,[Math.PI/2,0,0]);
 box(dark,16,17,7,w*.24,22,backZ);for(const y of [18,26]){box(steel,14,6,.4,w*.24,y,backZ+3.8);box(dark,11,3.5,.5,w*.24,y,backZ+4.1);box(steel,10,.4,.7,w*.24,y+2.3,backZ+4.5);}
 for(let i=0;i<4;i++){box(white,7,1.2,6,-4+i*2,13.3+i*1.3,backZ);}
 // Bread-price tickets and display-strip signs are original generic shop art.
 for(let row=0;row<3;row++)for(let j=0;j<3;j++){const z=-run*.28+j*run*.28;box(white,.15,2.5,4,bx+5.3,7+row*9,z);for(let n=0;n<2;n++)box(trim,.18,.18,2.8,bx+5.4,7+row*9+n*.6,z);}
 for(const x of [-w*.23,w*.23]){box(white,15,.4,h-10,x,48,0);for(const z of [-h*.22,h*.22])box(glow,13,.2,9,x,47.5,z);}
 if(sign){sign(root,'CRESCENT BAKERY',w-10,4,0,43,-h/2+2.7,'#b68a4a');sign(root,'ARTISAN BREAD · CAKES · PASTRIES',w-12,3,0,37,-h/2+2.9,'#6f573e');}
 for(const [g,groups]of batches)for(const [m,items]of groups){const mesh=new T.InstancedMesh(g,m,items.length);mesh.userData.noBatch=true;items.forEach((a,i)=>{mesh.setMatrixAt(i,a.matrix);if(a.c)mesh.setColorAt(i,color.set(a.c));});root.add(mesh);}root.userData.bakery={breads,pastries,cakes,drawBatches:root.children.length};return {root,solids:p.solids,plan:p};
}
const api={plan,build};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29Bakery=api;
})();
