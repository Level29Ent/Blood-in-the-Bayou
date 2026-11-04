'use strict';
// Realism pass. Self-contained procedural geometry, cached by vehicle type.
// Local +X = nose; +Y = up; wheels spin about local Z. Physics dimensions are unchanged.
(function(){
  const cache=new Map(),geoCache=new Map();
  let materials=null,plateTexture=null,treadTexture=null;
  const profiles={
    sedan:{belt:10.3,roof:16.9,r:3.7,front:.31,rear:-.31,rf:.085,rr:-.205,bf:.255,br:-.36,rw:.365,doors:4},
    police:{belt:10.8,roof:17.3,r:3.9,front:.32,rear:-.32,rf:.075,rr:-.225,bf:.25,br:-.38,rw:.37,doors:4},
    taxi:{belt:10.3,roof:16.9,r:3.7,front:.31,rear:-.31,rf:.085,rr:-.205,bf:.255,br:-.36,rw:.365,doors:4},
    sports:{belt:9.0,roof:14.5,r:3.6,front:.33,rear:-.32,rf:.055,rr:-.24,bf:.255,br:-.395,rw:.33,doors:2},
    convertible:{belt:9.7,roof:15.3,r:3.7,front:.31,rear:-.31,rf:.065,rr:-.23,bf:.25,br:-.365,rw:.355,doors:2,open:true},
    lowrider:{belt:9.3,roof:15.0,r:3.55,front:.33,rear:-.32,rf:.02,rr:-.20,bf:.205,br:-.345,rw:.375,doors:2,classic:true},
    pickup:{belt:12.0,roof:21.0,r:4.45,front:.32,rear:-.32,rf:.165,rr:-.015,bf:.295,br:-.075,rw:.37,doors:2,bed:true},
    humvee:{belt:13.2,roof:22.0,r:4.8,front:.33,rear:-.33,rf:.165,rr:-.27,bf:.255,br:-.37,rw:.415,doors:4,military:true},
    van:{belt:12.0,roof:24.0,r:4.1,front:.34,rear:-.33,rf:.22,rr:-.405,bf:.36,br:-.455,rw:.415,doors:3,van:true},
    truck:{belt:12.0,roof:24.0,r:4.55,front:.34,rear:-.29,rf:.30,rr:.10,bf:.455,br:.04,rw:.41,doors:2,box:true},
    mtvr:{belt:14.0,roof:26.0,r:5.25,front:.35,rear:-.33,rf:.265,rr:.02,bf:.42,br:-.035,rw:.41,doors:2,cargo:true,military:true}
  };
  // Fifteen additional coachwork profiles, with distinct wheelbase, roofline and equipment.
  const additions={
    electric:['sedan',{belt:10.6,roof:17.8,rf:.15,rr:-.28,doors:4}],
    ambulance:['van',{roof:28,rf:.2,rr:-.4,doors:4}],
    utility:['pickup',{roof:23,r:4.6,doors:2,bed:true}],
    compact:['sedan',{roof:16.3,rr:-.28,doors:2}],
    hatchback:['sedan',{roof:18.5,rf:.15,rr:-.35,br:-.44}],
    wagon:['sedan',{roof:19,rr:-.39,br:-.45,doors:4}],
    crossover:['sedan',{belt:12,roof:22,r:4.25,rr:-.32,br:-.43}],
    suv:['humvee',{roof:24,r:4.6,military:false,rf:.18,rr:-.35}],
    executive:['sedan',{belt:11.4,roof:18.5,rf:.13,rr:-.25}],
    limousine:['sedan',{roof:19,rf:.23,rr:-.34,front:.37,rear:-.37}],
    muscle:['lowrider',{belt:10.2,roof:16,r:4,rf:.06,rr:-.22}],
    roadster:['convertible',{belt:8.8,roof:13.8,r:3.5,rf:.03,rr:-.19}],
    minivan:['van',{roof:23,r:3.9,rf:.20,rr:-.36,doors:4}],
    delivery:['truck',{roof:26,r:4.3}],
    offroad:['humvee',{roof:24,r:5.5,military:false,doors:2,rr:-.18}],
    rally:['sports',{belt:10.5,roof:18,r:4.2,doors:2}],
    flatbed:['pickup',{roof:23,r:4.8,front:.36,rear:-.35}],
    towtruck:['pickup',{roof:24,r:4.9,front:.34,rear:-.32}],
    supercar:['sports',{belt:8.4,roof:13.4,r:3.7,rf:.02,rr:-.2}],
    hypercar:['sports',{belt:8.0,roof:12.8,r:3.8,rf:0,rr:-.16,br:-.42}],
    coupe:['sports',{belt:9.6,roof:15.6,rf:.08,rr:-.28}],
    cadillac:['lowrider',{belt:10,roof:15.8,front:.36,rear:-.36,rr:-.24,doors:4}],
    ponycar:['lowrider',{belt:9.8,roof:15.4,r:3.9,rf:.05,rr:-.21}],
    hearse:['sedan',{belt:11,roof:19.5,rf:.18,rr:-.43,br:-.46,front:.36,rear:-.36}],
    swampbuggy:['humvee',{roof:21,r:6.2,military:false,doors:2,rr:-.15}],
    monster:['humvee',{belt:17,roof:26,r:8.8,military:false,doors:2,rr:-.2}],
    icecream:['van',{roof:25,rf:.24,rr:-.42}],
    camper:['truck',{roof:28,r:4.4,rf:.26,rr:-.44,br:-.47}]
  };
  for(const [key,[base,patch]]of Object.entries(additions))profiles[key]={...profiles[base],...patch};
  profiles.slab={...profiles.lowrider,roof:15.8,r:3.8,doors:4};
  function init(){
    if(materials)return;
    treadTexture=canvasTex(128,128,(g,w,h)=>{
      g.fillStyle='#777';g.fillRect(0,0,w,h);
      for(let x=0;x<w;x+=25){g.fillStyle='#292929';g.fillRect(x,0,3,h);}
      g.strokeStyle='#303030';g.lineWidth=3;
      for(let y=0;y<h;y+=13)for(let x=0;x<w;x+=25){g.beginPath();g.moveTo(x+4,y);g.lineTo(x+20,y+7);g.stroke();}
    },true);
    treadTexture.repeat.set(5,1);
    const env=vehicleEnv();
    materials={
      trim:new THREE.MeshStandardMaterial({color:'#15191c',metalness:.18,roughness:.65,envMap:env}),
      rubber:new THREE.MeshStandardMaterial({color:'#141617',roughness:.95,bumpMap:treadTexture,bumpScale:.13}),
      chrome:new THREE.MeshStandardMaterial({color:'#b4bdc5',metalness:.94,roughness:.22,envMap:env,envMapIntensity:1.1}),
      alloy:new THREE.MeshStandardMaterial({color:'#8e989e',metalness:.87,roughness:.31,envMap:env}),
      leather:new THREE.MeshStandardMaterial({color:'#272a29',roughness:.88}),
      glass:new THREE.MeshPhysicalMaterial({color:'#314956',metalness:0,roughness:.075,clearcoat:1,transmission:.78,thickness:.3,ior:1.45,envMap:env,envMapIntensity:.8,transparent:true,opacity:1,depthWrite:false,side:THREE.DoubleSide}),
      windshield:new THREE.MeshPhysicalMaterial({color:'#56717b',metalness:0,roughness:.075,clearcoat:1,transmission:.82,thickness:.3,ior:1.45,envMap:env,envMapIntensity:.8,transparent:true,opacity:1,depthWrite:false,side:THREE.DoubleSide}),
      darkGlass:new THREE.MeshPhysicalMaterial({color:'#192a33',metalness:0,roughness:.09,transmission:.55,thickness:.3,ior:1.45,transparent:true,opacity:1,depthWrite:false,envMap:env,envMapIntensity:.7,side:THREE.DoubleSide}),
      seam:new THREE.MeshStandardMaterial({color:'#253035',roughness:.75}),
      brake:new THREE.MeshStandardMaterial({color:'#696b68',metalness:.8,roughness:.46}),
      caliper:new THREE.MeshStandardMaterial({color:'#9c2927',metalness:.3,roughness:.6}),
      head:new THREE.MeshStandardMaterial({color:'#d9e7e7',metalness:.35,roughness:.18,emissive:'#fff1c9',emissiveIntensity:.08,envMap:env}),
      tail:new THREE.MeshStandardMaterial({color:'#811c22',metalness:.18,roughness:.2,emissive:'#fb2028',emissiveIntensity:.2,envMap:env}),
      amber:new THREE.MeshStandardMaterial({color:'#de802a',metalness:.1,roughness:.23,emissive:'#ce6a14',emissiveIntensity:.2}),
      white:new THREE.MeshStandardMaterial({color:'#e0e5e0',roughness:.38,metalness:.1,envMap:env}),
      cargo:new THREE.MeshStandardMaterial({color:'#c5c8c5',metalness:.25,roughness:.65,envMap:env}),
      canvas:new THREE.MeshStandardMaterial({color:'#4c5740',roughness:1}),
      taxi:new THREE.MeshStandardMaterial({color:'#e6c656',metalness:.12,roughness:.3}),
      red:new THREE.MeshStandardMaterial({color:'#ae1326',emissive:'#ff2535',emissiveIntensity:.4,roughness:.2}),
      blue:new THREE.MeshStandardMaterial({color:'#124fa6',emissive:'#207aff',emissiveIntensity:.4,roughness:.2})
    };
    plateTexture=canvasTex(256,96,g=>{
      g.fillStyle='#e2e7da';g.fillRect(0,0,256,96);g.fillStyle='#224c53';g.fillRect(0,0,256,19);
      g.fillStyle='#d9e3db';g.textAlign='center';g.font='700 12px sans-serif';g.fillText('LEVEL 29',128,14);
      g.fillStyle='#29353b';g.font='700 40px monospace';g.fillText('L29·087',128,65);
      g.font='10px sans-serif';g.fillText('BLOOD IN THE BAYOU',128,87);
    });
  }
  function mesh(group,geometry,material,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);group.add(m);return m;}
  function roundGeo(w,h,d,r=.35){
    r=Math.min(r,w*.24,h*.24,d*.24);const key=[w,h,d,r].join(':');if(geoCache.has(key))return geoCache.get(key);
    const s=new THREE.Shape(),x=-w/2+r,y=-h/2+r,W=w-2*r,H=h-2*r,q=Math.min(r,W/4,H/4);
    s.moveTo(x+q,y);s.lineTo(x+W-q,y);s.quadraticCurveTo(x+W,y,x+W,y+q);s.lineTo(x+W,y+H-q);s.quadraticCurveTo(x+W,y+H,x+W-q,y+H);s.lineTo(x+q,y+H);s.quadraticCurveTo(x,y+H,x,y+H-q);s.lineTo(x,y+q);s.quadraticCurveTo(x,y,x+q,y);
    const g=new THREE.ExtrudeGeometry(s,{depth:d-2*r,bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:3,curveSegments:6,steps:1});g.translate(0,0,-d/2+r);geoCache.set(key,g);return g;
  }
  const rb=(g,w,h,d,x,y,z,mat,r=.3)=>mesh(g,roundGeo(w,h,d,r),mat,x,y,z);
  function panel(g,p,mat){
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p.flat(),3));
    const idx=[];for(let i=1;i<p.length-1;i++)idx.push(0,i,i+1);geo.setIndex(idx);geo.computeVertexNormals();return mesh(g,geo,mat);
  }
  function beam(g,a,b,r,mat){
    const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),D=B.clone().sub(A);
    const m=mesh(g,new THREE.CylinderGeometry(r,r,D.length(),8),mat);m.position.copy(A.add(B).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),D.normalize());return m;
  }
  function line(g,pts,mat,r=.045){
    if(pts.length<2)return;const curve=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)),false,'centripetal');
    return mesh(g,new THREE.TubeGeometry(curve,Math.max(8,pts.length*3),r,4,false),mat);
  }
  function loft(g,sections,mat){
    const v=[],idx=[],n=sections[0].length;
    for(const s of sections)for(const p of s)v.push(...p);
    for(let i=0;i<sections.length-1;i++)for(let j=0;j<n-1;j++){const a=i*n+j,b=a+n;idx.push(a,a+1,b+1,a,b+1,b);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(idx);geo.computeVertexNormals();return mesh(g,geo,mat);
  }
  // Join same-material static components to reduce draw calls. No external geometry library needed.
  function batch(group){
    group.updateMatrixWorld(true);const buckets=new Map();
    for(const o of group.children.slice())if(o.isMesh&&!o.name&&!o.material.transparent){
      if(!buckets.has(o.material))buckets.set(o.material,[]);buckets.get(o.material).push(o);
    }
    for(const[mat,list]of buckets){
      if(list.length<2)continue;const positions=[],normals=[],uv=[];
      for(const o of list){let geo=o.geometry.clone();geo.applyMatrix4(o.matrix);if(geo.index){const ex=geo.toNonIndexed();geo.dispose();geo=ex;}
        const p=geo.attributes.position,n=geo.attributes.normal,u=geo.attributes.uv;
        for(let i=0;i<p.count;i++){positions.push(p.getX(i),p.getY(i),p.getZ(i));normals.push(n?n.getX(i):0,n?n.getY(i):1,n?n.getZ(i):0);uv.push(u?u.getX(i):0,u?u.getY(i):0);}
        geo.dispose();group.remove(o);
      }
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));mesh(group,geo,mat);
    }
  }
  function body(g,L,W,p,paint){
    const military=p.military,B=p.belt;
    const rough=[[-.5,.415,B-2.3],[-.465,.47,B-1.5],[-.38,.497,B-.35],[-.22,.5,B],[0,.5,B],[.22,.495,B-.15],[.35,.48,B-.8],[.46,.455,B-1.6],[.5,.405,B-2.5]];
    // Resample the rough design stations with a spline so the nose, hood and deck read as curved sheet metal.
    const curve=new THREE.CatmullRomCurve3(rough.map(r=>new THREE.Vector3(r[0]*L,r[1]*W,r[2])),false,'catmullrom',.5);
    const sections=curve.getSpacedPoints(30).map(v=>[v.x/L,v.y/W,v.z]);
    // Smooth hood/trunk crown and shoulders, never a solid slab across the wheel wells.
    loft(g,sections.map(([x,w,y])=>[[-1,-.93,-.8,-.6,-.35,0,.35,.6,.8,.93,1].map(q=>[x*L,y+(1-q*q)*.62,W*w*q])].flat()),paint);
    const axles=p.cargo?[p.rear,-.105,p.front]:[p.rear,p.front];
    for(const side of [-1,1]){
      const shape=new THREE.Shape();const first=sections[0];shape.moveTo(first[0]*L,first[2]);
      for(const s of sections.slice(1))shape.lineTo(s[0]*L,s[2]);
      const low=p.military?4.3:p.classic?3.3:3.7;shape.lineTo(L/2,low);
      const R=p.r+.6,cy=p.r,dy=low-cy,theta=Math.asin(clamp(dy/R,-.99,.99)),edge=Math.sqrt(R*R-dy*dy);
      for(const a of axles.slice().sort((a,b)=>b-a)){
        const cx=a*L;shape.lineTo(cx+edge,low);
        for(let k=1;k<=24;k++){const ang=theta+(Math.PI-2*theta)*k/24;shape.lineTo(cx+Math.cos(ang)*R,cy+Math.sin(ang)*R);}
      }
      shape.lineTo(-L/2,low);shape.closePath();
      const geo=new THREE.ExtrudeGeometry(shape,{depth:.65,bevelEnabled:true,bevelThickness:.18,bevelSize:.18,bevelSegments:2,curveSegments:8});
      // Taper bumper-end sheet metal inward to meet the top crown.
      const v=geo.attributes.position;
      for(let i=0;i<v.count;i++){
        const x=v.getX(i)/L;let width=.5;
        for(let k=0;k<sections.length-1;k++)if(x>=sections[k][0]&&x<=sections[k+1][0]){const u=(x-sections[k][0])/(sections[k+1][0]-sections[k][0]);width=sections[k][1]*(1-u)+sections[k+1][1]*u;break;}
        v.setZ(i,side*(W*width-.45+v.getZ(i)));
      }
      geo.computeVertexNormals();mesh(g,geo,paint);
      // Arch-lip molding follows the physical opening. It does not draw across the tire.
      for(const a of axles){const pts=[];for(let k=0;k<=24;k++){const ang=theta+(Math.PI-2*theta)*k/24;pts.push([a*L+Math.cos(ang)*(R+.1),cy+Math.sin(ang)*(R+.1),side*(W*.5+.1)]);}line(g,pts,military?materials.trim:paint,p.military?.24:.16);}
      rb(g,L*.30,.65,.65,0,low+.45,side*W*.505,p.military?materials.trim:paint,.15);
      line(g,[[-L*.42,B-.6,side*(W*.49+.15)],[-L*.2,B-.35,side*(W*.5+.18)],[L*.15,B-.35,side*(W*.5+.15)],[L*.39,B-1,side*(W*.48+.2)]],p.classic?materials.chrome:materials.seam,.045);
    }
    // Close the nose and tail so no interior or sky shows between the side sheets.
    for(const e of [sections[0],sections[sections.length-1]]){
      const hw=W*e[1]-.1,x=e[0]*L+(e[0]<0?.25:-.25),low=p.military?4.3:p.classic?3.3:3.7;
      panel(g,[[x,low,-hw],[x,low,hw],[x,e[2]+.05,hw],[x,e[2]+.05,-hw]],paint);
    }
    rb(g,L*.73,1.0,W*.68,0,3.3,0,materials.trim,.22);
    // Hood and trunk shut-lines use the body's curved crown.
    const front=p.bf*L+1.3,back=p.br*L-1;
    if(!p.box&&!p.cargo&&!p.van){
      line(g,[[front+.4,B+.35,-W*.37],[L*.43,B-1.1,-W*.34],[L*.455,B-1.2,0],[L*.43,B-1.1,W*.34],[front+.4,B+.35,W*.37]],materials.seam,.045);
      if(!p.bed)line(g,[[back,B+.35,-W*.38],[-L*.445,B-1,-W*.35],[-L*.46,B-1.2,0],[-L*.445,B-1,W*.35],[back,B+.35,W*.38]],materials.seam,.04);
    }
  }
  function cabin(g,L,W,p,paint){
    const B=p.belt,R=p.roof,bf=p.bf*L,br=p.br*L,rf=p.rf*L,rr=p.rr*L,bw=W*(p.military?.445:.43),rw=W*p.rw;
    const glass=materials.windshield;
    panel(g,[[bf,B+.25,-bw],[bf,B+.25,bw],[rf,R-.8,rw],[rf,R-.8,-rw]],glass);
    for(const side of [-1,1]){
      const C=side;
      beam(g,[bf,B+.1,C*bw],[rf,R,C*rw],p.military?.5:.33,paint);
      rb(g,.75,.55,2.3,bf-.15,B+.3,C*bw,materials.trim,.13);
      line(g,[[bf+.05,B+.3,C*bw],[rf+.04,R-.7,C*rw]],materials.trim,.1);
      if(!p.open){
        const upperZ=rw*C,lowerZ=bw*C;
        if(p.doors===4){
          const mid=(bf+br)*.5+.25;
          const topMid=(rf+rr)*.5;
          panel(g,[[bf-.45,B+.65,lowerZ],[mid+.4,B+.65,lowerZ],[topMid+.4,R-.65,upperZ],[rf-.3,R-.65,upperZ]],materials.glass);
          panel(g,[[mid-.45,B+.65,lowerZ],[br+.4,B+.65,lowerZ],[rr+.3,R-.65,upperZ],[topMid-.4,R-.65,upperZ]],materials.darkGlass);
          beam(g,[mid,B+.15,lowerZ],[topMid,R-.2,upperZ],.38,materials.trim);
          line(g,[[mid,B-.1,C*(W*.501)],[mid,4.5,C*(W*.502)]],materials.seam,.055);
        }else{
          panel(g,[[bf-.4,B+.6,lowerZ],[br+.4,B+.6,lowerZ],[rr+.3,R-.65,upperZ],[rf-.35,R-.65,upperZ]],p.van?materials.darkGlass:materials.glass);
        }
        beam(g,[br,B+.2,lowerZ],[rr,R,upperZ],p.military?.65:p.van?.8:.55,paint);
        line(g,[[bf,B+.1,lowerZ],[br,B+.1,lowerZ]],p.classic?materials.chrome:materials.trim,.12);
        beam(g,[rr,R-.1,upperZ],[rf,R-.1,upperZ],.22,materials.trim);
      }
      const doorEnd=p.doors===4?br:Math.max(br,-L*.25);
      line(g,[[bf-.15,B,C*(W*.5+.2)],[bf-.4,5.0,C*(W*.497+.2)],[doorEnd+1,4.6,C*(W*.5+.2)],[doorEnd,B-.1,C*(W*.5+.2)]],materials.seam,.045);
      const handleX=p.doors===4?((bf+br)*.5+2):doorEnd+2;
      rb(g,2.35,.45,.6,handleX,B-1.4,C*(W*.5+.4),p.military?materials.trim:materials.chrome,.12);
      if(p.doors===4)rb(g,2.35,.45,.6,br+2.2,B-1.4,C*(W*.5+.4),materials.chrome,.12);
      // Mirror has a stalk, colored housing and reflective inset on its rear face.
      beam(g,[bf-1,B+.8,C*bw],[bf-1.7,B+1.3,C*(W*.54)],.2,materials.trim);
      rb(g,2.9,1.7,2.5,bf-2,B+1.55,C*(W*.55),p.military?materials.trim:paint,.4);
      rb(g,.15,1.15,1.9,bf-3.4,B+1.6,C*(W*.55),materials.chrome,.05);
    }
    if(!p.open){
      panel(g,[[br,B+.35,bw],[br,B+.35,-bw],[rr,R-.7,-rw],[rr,R-.7,rw]],p.van||p.bed||p.box||p.cargo?materials.darkGlass:materials.glass);
      // Convex roof, slightly rolled at the leading and trailing ends.
      const stations=[rr-.3,rr+.9,(rr+rf)*.5,rf-.9,rf+.2];
      loft(g,stations.map((x,i)=>[-1,-.75,0,.75,1].map(q=>[x,R+(1-q*q)*.38-(i===0||i===4?.35:0),q*rw])),paint);
      for(const s of [-1,1])beam(g,[rr,R,s*rw],[rf,R,s*rw],.15,p.classic?materials.chrome:paint);
    }else{
      // Convertible leaves the cabin genuinely open with a folded rear soft-top.
      rb(g,L*.11,1.4,W*.72,br-1,B+1.0,0,materials.leather,.4);
      for(const s of [-1,1])beam(g,[br+2,B+.5,s*W*.27],[br+2,B+3.3,s*W*.27],.2,materials.chrome);
    }
    // Visible upholstery, sculpted headrests, centre console and dashboard.
    const seatX=p.box||p.cargo?(bf+br)*.5:(bf+br)*.5+1.3;
    for(const z of [-W*.22,W*.22]){
      rb(g,5.2,1.6,5.8,seatX,B-1.0,z,materials.leather,.55);
      const seat=rb(g,1.6,5.0,5.7,seatX-2.4,B+1,z,materials.leather,.55);seat.rotation.z=-.13;
      rb(g,1.7,1.8,3.2,seatX-2.6,B+4,z,materials.leather,.45);
      line(g,[[seatX-1.8,B-.14,z-2],[seatX+1.8,B-.14,z-2]],materials.seam,.03);
    }
    rb(g,7,1.7,3.2,seatX+.4,B-.45,0,materials.leather,.4);
    beam(g,[seatX+2,B+.3,0],[seatX+2.4,B+1.8,0],.16,materials.chrome);
    rb(g,3,2,W*.76,bf-1.6,B+.7,0,materials.trim,.45);
    const steering=mesh(g,new THREE.TorusGeometry(1.8,.20,8,24),materials.leather,bf-4,B+2.0,-W*.22);steering.rotation.y=Math.PI/2-.35;
    beam(g,[bf-3,B+1.3,-W*.22],[bf-4,B+2,-W*.22],.24,materials.trim);
    for(const side of [-1,1]){
      rb(g,Math.max(8,bf-br-3),3,.8,(bf+br)*.5,B-.8,side*W*.45,materials.leather,.2);
      rb(g,2,.35,.8,bf-4,B+.3,side*W*.44,materials.chrome,.08);
      for(let i=0;i<3;i++)line(g,[[seatX-1.5,B-.05,side*W*.22-1.6+i*1.5],[seatX+1.5,B-.05,side*W*.22-1.6+i*1.5]],materials.seam,.035);
    }
    rb(g,.4,2,2,bf-3,B+1.7,0,materials.darkGlass,.08);
    for(const z of [-W*.19,-W*.28])mesh(g,new THREE.CircleGeometry(.7,12),materials.chrome,bf-3.15,B+1.7,z).rotation.y=-Math.PI/2;
    // Separate wipers rest on the lower windshield.
    for(const z of [-W*.17,W*.17])beam(g,[bf+.2,B+.6,z-2.0],[bf-1.4,B+1.2,z+3],.075,materials.trim);
    return seatX;
  }
  function wheel(g,x,z,p,side,sports){
    const pivot=new THREE.Group();pivot.name='steer:'+x+':'+side;pivot.position.set(x,p.r,z);g.add(pivot);
    const spin=new THREE.Group();spin.name='spin';pivot.add(spin);
    const R=p.r,width=p.military?3.7:sports?3.1:2.7,rim=sports?R*.76:p.classic?R*.56:R*.68;
    const pts=[new THREE.Vector2(rim,-width*.5),new THREE.Vector2(R*.88,-width*.55),new THREE.Vector2(R*.98,-width*.4),new THREE.Vector2(R,-width*.27),new THREE.Vector2(R,width*.27),new THREE.Vector2(R*.98,width*.4),new THREE.Vector2(R*.88,width*.55),new THREE.Vector2(rim,width*.5),new THREE.Vector2(rim,-width*.5)];
    const tire=mesh(spin,new THREE.LatheGeometry(pts,32),materials.rubber);tire.rotation.x=Math.PI/2;
    const barrel=mesh(spin,new THREE.CylinderGeometry(rim*.93,rim*.93,width*.9,28),materials.trim);barrel.rotation.x=Math.PI/2;
    const outer=side*width*.55;
    const lip=mesh(spin,new THREE.TorusGeometry(rim,.12,6,32),materials.chrome,0,0,outer);
    const dish=mesh(spin,new THREE.CylinderGeometry(rim*.83,rim*.83,.15,32),materials.brake,0,0,side*width*.38);dish.rotation.x=Math.PI/2;
    const caliper=rb(pivot,1.0,R*.8,.85,x>0?1.6:-1.6,.3,side*width*.46,sports?materials.caliper:materials.trim,.15);
    const spokes=p.classic?40:p.military?8:sports?5:10;
    for(let k=0;k<spokes;k++){
      const a=k*Math.PI*2/spokes,sp=rb(spin,rim*.76,p.classic?.13:sports?.36:.23,.23,Math.cos(a)*rim*.43,Math.sin(a)*rim*.43,outer-.04,materials.alloy,.05);sp.rotation.z=a+.12;
      if(sports){const split=rb(spin,rim*.74,.13,.21,Math.cos(a+.10)*rim*.43,Math.sin(a+.10)*rim*.43,outer-.035,materials.chrome,.025);split.rotation.z=a+.24;}
    }
    if(p.classic){
      // Houston wire-wheel dish with crossed wires and a projecting swanga hub.
      for(let k=0;k<40;k++){const a=k*Math.PI*2/40;beam(spin,[Math.cos(a)*rim*.85,Math.sin(a)*rim*.85,outer],[Math.cos(a+.5)*rim*.23,Math.sin(a+.5)*rim*.23,outer+side*.5],.055,materials.chrome);}
      const poke=mesh(spin,new THREE.CylinderGeometry(rim*.20,rim*.10,3.5,16),materials.chrome,0,0,outer+side*1.75);poke.rotation.x=Math.PI/2;
    }
    const hub=mesh(spin,new THREE.CylinderGeometry(rim*.22,rim*.22,.30,16),materials.alloy,0,0,outer);hub.rotation.x=Math.PI/2;
    for(let k=0;k<5;k++){
      const a=k*Math.PI*2/5;const bolt=mesh(spin,new THREE.CylinderGeometry(.10,.10,.35,6),materials.chrome,Math.cos(a)*rim*.28,Math.sin(a)*rim*.28,outer);bolt.rotation.x=Math.PI/2;
    }
    // Two fine circumferential grooves and embossed-looking sidewall bands.
    for(const rr of [R*.80,R*.86])mesh(spin,new THREE.TorusGeometry(rr,.035,4,32),materials.trim,0,0,side*width*.54);
    batch(spin);batch(pivot);return pivot;
  }
  function extras(g,L,W,p,paint,t){
    const B=p.belt;
    if(p.bed){
      // Empty bed with a recessed floor, inner lining, ribbed floor and tailgate.
      const start=-L*.47,end=p.br*L-1,mid=(start+end)/2,len=end-start;
      rb(g,len,.7,W*.78,mid,B+.4,0,materials.trim,.16);
      for(const side of [-1,1]){rb(g,len,3.3,1.4,mid,B+1.9,side*W*.445,paint,.28);rb(g,len,.25,1.7,mid,B+3.6,side*W*.445,materials.trim,.08);}
      rb(g,1.5,3.3,W*.87,start,B+1.9,0,paint,.22);
      for(let k=-3;k<=3;k++)rb(g,len-1,.12,.22,mid,B+.82,k*W*.10,materials.trim,.03);
      rb(g,.22,.6,3,start-.85,B+2,0,materials.trim,.04);
    }
    if(p.van){
      // Van cargo sides are opaque, no giant block pasted over the cabin.
      const x0=-L*.46,x1=p.rr*L+1;
      for(const s of [-1,1]){
        panel(g,[[x0,B,s*W*.445],[x1,B,s*W*.445],[x1,p.roof-.7,s*W*.415],[x0,p.roof-.7,s*W*.415]],paint);
        line(g,[[-L*.13,B-1,s*W*.503],[-L*.13,p.roof-1,s*W*.425],[-L*.385,p.roof-1,s*W*.425],[-L*.39,B,s*W*.447]],materials.seam,.06);
        rb(g,2.5,.5,.45,-L*.15,B+3,s*W*.45,materials.trim,.1);
      }
      rb(g,1,1,W*.79,-L*.465,p.roof-.1,0,paint,.23);
    }
    if(p.box||p.cargo){
      const len=L*.64,center=-L*.16,h=p.box?23:13.5,c=p.box?materials.cargo:paint;
      rb(g,len,h,W*.96,center,B+h/2+.3,0,c,.5);
      if(p.box){
        for(const s of [-1,1])for(let k=0;k<8;k++)rb(g,.28,h-1,.16,-L*.465+k*L*.082,B+h/2,s*W*.486,materials.alloy,.04);
        const back=-L*.486;
        for(const s of [-1,1]){rb(g,.3,h-1,W*.43,back,B+h/2,s*W*.23,materials.cargo,.1);beam(g,[back-.25,B+1,s*W*.22],[back-.25,B+h-1,s*W*.22],.10,materials.chrome);}
        line(g,[[back-.4,B,0],[back-.4,B+h,0]],materials.seam,.055);
        rb(g,1,1.2,W*.99,back-1.2,B-.5,0,materials.trim,.2);
      }else{
        for(const s of [-1,1])for(let k=0;k<6;k++)rb(g,.65,8,.7,-L*.45+k*L*.10,B+5,s*W*.49,materials.trim,.1);
        rb(g,len-1,1,W*.94,center,B+14,0,materials.canvas,.35);
        for(let k=0;k<5;k++)rb(g,1,1.3,W*.96,-L*.44+k*L*.12,B+14.5,0,materials.canvas,.2);
      }
    }
    if(p.military){
      for(const s of [-1,1]){
        rb(g,L*.44,.8,2,0,5,s*W*.56,materials.trim,.2);
        for(let k=0;k<3;k++)rb(g,1.8,.35,.3,L*.29+k*1.6,B+.4,s*W*.23,materials.trim,.05);
      }
      for(const x of [-L*.48,L*.48])rb(g,1.7,1.6,W*1.03,x,5.3,0,materials.trim,.3);
      if(t==='humvee'){
        const spare=mesh(g,new THREE.TorusGeometry(p.r-.9,.9,10,28),materials.rubber,-L/2-1.5,B,0);spare.rotation.y=Math.PI/2;
        const hub=mesh(g,new THREE.CylinderGeometry(2.1,2.1,1.2,16),materials.alloy,-L/2-1.7,B,0);hub.rotation.z=Math.PI/2;
        beam(g,[-L*.32,p.roof,W*.3],[-L*.33,p.roof+11,W*.3],.07,materials.trim);
      }
    }
    if(t==='sports'){
      for(const s of [-1,1]){
        rb(g,2.8,.35,1.5,L*.34,B-.05,s*W*.29,materials.trim,.1);
        rb(g,L*.20,.65,1.0,-L*.41,4.2,s*W*.30,materials.trim,.12);
      }
      // Small rear lip spoiler, not an oversized arcade wing.
      rb(g,1.8,.55,W*.77,-L*.43,B+.8,0,paint,.14);
    }
    if(t==='taxi'){
      const lamp=rb(g,5.7,1.8,3.2,-L*.02,p.roof+1.1,0,materials.taxi,.3);
      for(const s of [-1,1]){
        const tex=canvasTex(128,48,c=>{c.fillStyle='#e8cf55';c.fillRect(0,0,128,48);c.fillStyle='#21292a';c.font='800 29px sans-serif';c.textAlign='center';c.fillText('TAXI',64,36);});
        const sign=mesh(g,new THREE.PlaneGeometry(4.8,1.5),new THREE.MeshBasicMaterial({map:tex}),-L*.02,p.roof+1.05,s*1.65);if(s<0)sign.rotation.y=Math.PI;
        for(let k=0;k<12;k++)rb(g,L*.035,.65,.10,-L*.22+k*L*.039,B-2.5,s*(W*.501+.16),k%2?materials.trim:materials.taxi,.02);
      }
    }
    if(t==='police'){
      for(const s of [-1,1]){
        // Black-and-white cruiser doors and readable small lettering.
        rb(g,L*.43,4.7,.10,-L*.045,B-2.65,s*(W*.5+.2),materials.white,.035);
        const tex=canvasTex(512,128,c=>{c.fillStyle='#e0e5e0';c.fillRect(0,0,512,128);c.fillStyle='#233037';c.textAlign='center';c.font='800 62px sans-serif';c.fillText('POLICE',256,84);c.font='14px sans-serif';c.fillText('LEVEL 29',256,109);});
        const sign=mesh(g,new THREE.PlaneGeometry(L*.31,2.3),new THREE.MeshBasicMaterial({map:tex}),-L*.04,B-2.0,s*(W*.5+.27));if(s<0)sign.rotation.y=Math.PI;
      }
      rb(g,3.3,.6,W*.72,-L*.01,p.roof+.55,0,materials.trim,.16);
      const red=rb(g,2.8,1.1,W*.31,-L*.01,p.roof+1.3,-W*.19,materials.red,.22);red.name='sirenRed';
      const blue=rb(g,2.8,1.1,W*.31,-L*.01,p.roof+1.3,W*.19,materials.blue,.22);blue.name='sirenBlue';
      // Bullbar is tubular rather than a flat box.
      for(const s of [-1,1])beam(g,[L*.515,4.5,s*W*.29],[L*.53,9.3,s*W*.29],.23,materials.trim);
      beam(g,[L*.53,9.3,-W*.29],[L*.53,9.3,W*.29],.23,materials.trim);
    }
  }
  function lamps(g,L,W,p,paint,t){
    const B=p.belt,sports=t==='sports',classic=p.classic;
    rb(g,1.8,2.1,W*.83,L*.49,4.8,0,p.military?materials.trim:classic?materials.chrome:paint,.4);
    rb(g,1.6,2.0,W*.87,-L*.49,4.8,0,p.military?materials.trim:classic?materials.chrome:paint,.4);
    rb(g,.5,2.7,W*.31,L*.505,B-3.4,0,materials.trim,.18);
    for(let k=-2;k<=2;k++)rb(g,.23,.15,W*.30,L*.513,B-3.4+k*.43,0,p.military?materials.trim:materials.chrome,.04);
    if(sports)rb(g,.35,1.3,W*.54,L*.51,4.9,0,materials.trim,.15);
    const headlights=[],tails=[],reverse=[];
    for(const s of [-1,1]){
      const z=s*W*.34;
      if(classic||p.military){
        const cup=mesh(g,new THREE.CylinderGeometry(1.24,1.24,.7,24),materials.chrome,L*.499,B-2.8,z);cup.rotation.z=Math.PI/2;
        const lamp=mesh(g,new THREE.CircleGeometry(.98,24),materials.head,L*.51,B-2.8,z);lamp.rotation.y=Math.PI/2;lamp.name='head:'+s;headlights.push(lamp);
      }else{
        const housing=rb(g,1.15,sports?1.4:1.85,W*.21,L*.472,B-2.1,z,materials.trim,.25);housing.rotation.y=-s*.15;
        const lamp=rb(g,.35,sports?1.0:1.38,W*.175,L*.491,B-2.05,z,materials.head,.15);lamp.rotation.y=-s*.15;lamp.name='head:'+s;headlights.push(lamp);
        rb(g,.40,.15,W*.15,L*.50,B-1.52,z,materials.white,.05);
      }
      rb(g,.25,.45,1.2,L*.499,B-3.5,s*W*.405,materials.amber,.07);
      const tail=rb(g,.7,p.van||p.box?3.8:1.45,W*.17,-L*.487,B-1.9,z,materials.tail,.2);tail.name='tail:'+s;tails.push(tail);
      const rev=rb(g,.4,.45,1.5,-L*.502,B-2.55,s*W*.28,materials.white,.08);rev.name='reverse:'+s;reverse.push(rev);
      rb(g,.3,.35,W*.14,-L*.501,4.5,s*W*.34,materials.tail,.04);
    }
    // Centre brake light and front/rear plates.
    const third=rb(g,.3,.2,W*.18,-L*.41,B+.8,0,materials.tail,.045);third.name='tail:centre';tails.push(third);
    const plateMat=new THREE.MeshStandardMaterial({map:plateTexture,roughness:.65,color:'#ffffff'});
    for(const s of [-1,1]){
      rb(g,.6,2.1,5.9,s*L*.508,5.1,0,materials.trim,.16);
      const plate=mesh(g,new THREE.PlaneGeometry(5.5,1.9),plateMat,s*L*.519,5.1,0);plate.rotation.y=s*Math.PI/2;
    }
    // Exhaust tube and inner dark bore. Not a filled silver cylinder.
    for(const z of sports?[-W*.30,W*.30]:[-W*.29]){
      const exhaust=mesh(g,new THREE.CylinderGeometry(.50,.50,2.1,16,1,true),materials.chrome,-L*.49,3.3,z);exhaust.rotation.z=Math.PI/2;
      const bore=mesh(g,new THREE.CircleGeometry(.39,16),materials.trim,-L*.518,3.3,z);bore.rotation.y=-Math.PI/2;
    }
  }
  function template(type,c){
    init();const L=c.spec.len,W=c.spec.wid,p=profiles[type]||profiles.sedan;
    const g=new THREE.Group(),shell=new THREE.Group();shell.name='coachwork';g.add(shell);
    const paint=new THREE.MeshPhysicalMaterial({color:'#9aa1a5',metalness:p.military?.08:.26,roughness:p.military?.7:.3,clearcoat:p.military?.08:.85,clearcoatRoughness:.16,envMap:vehicleEnv(),envMapIntensity:p.military?.24:.5,side:THREE.DoubleSide});paint.name='vehiclePaint';
    body(shell,L,W,p,paint);cabin(shell,L,W,p,paint);extras(shell,L,W,p,paint,type);lamps(shell,L,W,p,paint,type);
    if(['suv','wagon','crossover','offroad'].includes(type)){
      for(const z of [-W*.32,W*.32])rb(shell,L*.46,.8,1,L*-.08,p.roof+1,z,materials.chrome,.15);
      for(const x of [-L*.22,L*.12])rb(shell,1.2,.8,W*.72,x,p.roof+1.7,0,materials.trim,.15);
    }
    if(type==='rally'){rb(shell,3,2,W*.93,-L*.37,p.belt+7,0,materials.trim,.2);for(const z of [-W*.3,W*.3])rb(shell,2,6,1,-L*.37,p.belt+3,z,materials.chrome,.15);}
    if(type==='towtruck'){
      for(const z of [-W*.25,W*.25]){const arm=rb(shell,L*.44,2,2,-L*.17,p.belt+10,z,materials.chrome,.3);arm.rotation.z=-.35;}
      rb(shell,2,13,2,-L*.38,p.belt+3,0,materials.trim,.2);
    }
    if(type==='flatbed')rb(shell,L*.53,1.8,W*1.04,-L*.22,p.belt+1,0,materials.chrome,.2);
    if(type==='electric')for(const s of [-1,1])rb(shell,.4,1.2,W*.28,L*.47,p.belt-1,s*W*.27,materials.chrome,.1);
    if(type==='ambulance'){const cross=new THREE.MeshStandardMaterial({color:'#b34436',roughness:.6});for(const s of [-1,1]){rb(shell,8,2,.5,-L*.15,17,s*W*.505,cross,.1);rb(shell,2,8,.5,-L*.15,17,s*W*.505,cross,.1);}rb(shell,8,2,5,L*.1,p.roof+1,0,materials.chrome,.2);}
    if(type==='utility'){for(const z of [-W*.4,W*.4])rb(shell,L*.45,4,3,-L*.18,p.belt+2,z,materials.chrome,.2);}
    const axles=p.cargo?[p.rear,-.105,p.front]:[p.rear,p.front];
    for(const x of axles)for(const s of [-1,1])wheel(g,x*L,s*(W*.5-.1),p,s,type==='sports');
    // Narrow shadow grounds the tires; soft outer shadow does not look like a floating oval.
    const shadow=mesh(g,new THREE.PlaneGeometry(L*1.06,W*1.04).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:softTex,color:'#000000',opacity:.64,transparent:true,depthWrite:false}),0,.08,0);shadow.name='contactShadow';
    batch(shell);
    // Distant vehicles use a simplified copy; detail is retained up close.
    const simple=new THREE.Group();simple.name='distant';
    const core=rb(simple,L*.94,p.belt-4,W*.92,0,(p.belt+4)/2,0,paint,.9);
    rb(simple,L*(p.rf-p.rr+.1),p.roof-p.belt,W*.73,L*(p.rf+p.rr)/2,(p.roof+p.belt)/2,0,materials.darkGlass,.6);
    for(const x of [p.rear,p.front])for(const s of [-1,1]){const w=mesh(simple,new THREE.CylinderGeometry(p.r,p.r,2.2,12),materials.rubber,x*L,p.r,s*W*.49);w.rotation.x=Math.PI/2;}
    if(p.box||p.cargo)rb(simple,L*.63,p.box?23:13,W*.96,-L*.16,p.belt+(p.box?11.5:6.5),0,materials.cargo,.4);
    g.add(simple);simple.visible=false;
    return g;
  }
  makeCarMesh=function(c){
    if(!cache.has(c.type))cache.set(c.type,template(c.type,c));
    const g=cache.get(c.type).clone(true),p=profiles[c.type]||profiles.sedan;
    const paint=cache.get(c.type).getObjectByName('coachwork').children.find(o=>o.material&&o.material.name==='vehiclePaint').material.clone();paint.color.set(c.col);
    const ownedMaterials=new Set([paint]);const own=m=>{const clone=m.clone();ownedMaterials.add(clone);return clone;};const lamps=[],tails=[],rev=[],wheels=[];let bar=[];
    g.traverse(o=>{
      if(o.material&&o.material.name==='vehiclePaint')o.material=paint;
      if(o.name.startsWith('head:')){o.material=own(o.material);lamps.push(o);}
      if(o.name.startsWith('tail:')){o.material=own(o.material);tails.push(o);}
      if(o.name.startsWith('reverse:')){o.material=own(o.material);rev.push(o);}
      if(o.name==='sirenRed'||o.name==='sirenBlue'){o.material=own(o.material);bar[o.name==='sirenRed'?0:1]=o;}
      if(o.name.startsWith('steer:'))wheels.push({pivot:o,spin:o.getObjectByName('spin'),front:o.position.x>0,side:Math.sign(o.position.z)});
    });
    g.userData={paint,ownedMaterials,parts:[],top:p.van?18.2:p.belt,dead:false,col:c.col,wheels:[],tails:[],bar:bar.length?bar:null,
      shell:g.getObjectByName('coachwork'),distant:g.getObjectByName('distant'),rollingWheels:wheels,headlights:lamps,brakelights:tails,reverseLights:rev,
      profile:p,previousFrame:-1,previousV:c.v||0,steer:0,bodyPitch:0,bodyRoll:0,visualVersion:2};
    scene.add(g);return g;
  };
  // Capture actual steering/braking without changing any physics.
  const originalUpdateCar=updateCar;
  updateCar=function(c,input){c.visualSteer=input?input.steer:0;c.visualBrake=!!(input&&(input.brake||(input.thr<0&&c.v>.4)));originalUpdateCar(c,input);};
  const originalSync=syncCars;
  syncCars=function(){
    originalSync();
    for(const[c,m]of carMeshes){
      const u=m.userData;if(u.visualVersion!==2)continue;
      const distance=dist(c.x,c.y,camera.position.x,camera.position.z),detailed=distance<190||player&&player.car===c;
      u.shell.visible=detailed;u.distant.visible=!detailed;for(const w of u.rollingWheels)w.pivot.visible=detailed;
      if(!m.visible||c.dead)continue;
      // Update once per simulation frame: mesh motion no longer depends on render frame rate.
      if(u.previousFrame!==frame){
        const delta=u.previousFrame<0?1:Math.min(8,Math.max(0,frame-u.previousFrame));u.previousFrame=frame;
        const targetSteer=(c.visualSteer||0)*.43;u.steer+=(targetSteer-u.steer)*.22;
        const acc=c.v-u.previousV;u.previousV=c.v;
        u.bodyPitch+=(clamp(-acc*.035,-.028,.028)-u.bodyPitch)*.14;
        u.bodyRoll+=(clamp((c.visualSteer||0)*Math.abs(c.v)*.004,-.04,.04)-u.bodyRoll)*.16;
        for(const w of u.rollingWheels){w.spin.rotation.z-=c.v/u.profile.r*delta;w.pivot.rotation.y=w.front?-u.steer:0;}
      }
      u.shell.rotation.z=u.bodyPitch;u.shell.rotation.x=u.bodyRoll;u.shell.position.y=Math.abs(c.v)>.4?Math.sin(frame*.16)*Math.min(.10,Math.abs(c.v)*.012):0;
      const brake=!!c.visualBrake,reverse=c.v<-.4,night=isNight()||isDusk();
      for(const l of u.brakelights)l.material.emissiveIntensity=brake?2.6:night?.65:.13;
      for(const l of u.headlights)l.material.emissiveIntensity=night?1.45:.08;
      for(const l of u.reverseLights){l.material.emissive.set(reverse?'#eaf2ec':'#000000');l.material.emissiveIntensity=reverse?1.25:0;}
      // Surface wear grows with damage and resets correctly when a garage/carwash repairs the car.
      const damage=clamp(1-c.hp/c.maxHp,0,1);u.paint.roughness=u.profile.military?.7:Math.min(.68,.22+damage*.4);u.paint.clearcoat=u.profile.military?.08:.85-damage*.5;
    }
  };
  // Free per-instance materials on retirement; geometry and shared trim remain cached.
  const liveMaterials=new Map();const retireSync=syncCars;
  syncCars=function(){
    retireSync();if(frame%30!==0)return;const live=new Set(carMeshes.values());
    for(const [m,mats]of liveMaterials)if(!live.has(m)){for(const mat of mats)mat.dispose();liveMaterials.delete(m);}
    for(const m of live)if(!liveMaterials.has(m)&&m.userData.visualVersion===2){const u=m.userData;liveMaterials.set(m,new Set([u.paint,...u.headlights.map(o=>o.material),...u.brakelights.map(o=>o.material),...u.reverseLights.map(o=>o.material),...(u.bar||[]).map(o=>o.material)]));}
  };
  // Existing cars are regenerated on the next frame. No player/campaign state is reset.
  for(const m of carMeshes.values())scene.remove(m);carMeshes.clear();
  window.level29Cars={version:2,types:Object.keys(profiles),get cachedTemplates(){return cache.size;},get diagnostics(){return {vehicles:carMeshes.size,templates:cache.size,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles};}};
})();
