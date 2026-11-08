'use strict';
// =====================================================================
// BLOOD IN THE BAYOU — first-person 3D renderer for the Dead City sim.
// Map (x, y) in pixels  ->  Three.js (x, height, z = y). 1px ≈ 10cm.
// =====================================================================
const EYE = 16, BH = 2.4;               // eye height, building height multiplier
const view = { yaw: -Math.PI/2, pitch: 0, look: 0, chase: false, locked: false, hit: 0, lookIdle: 0, sway: 0, kick: 0, deadT: 0, lastCar: null, edge: 0 };
let renderer = null, scene, camera, vmScene, vmCam, builtCity = null, cityGroup = null, lightMode = '';
let hemi, sun, flash, headL, boomLight, muzzleLight;
const MAT = {}, facadeMats = new Map(), roofMats = new Map();
let facadeTex, litTex, softTex, starTex;
const carMeshes = new Map();
let zPool, sPool, cPool, kPool, decalMesh, decalN = 0, lampPools = null;
let bulletLines, spitMesh, ptsSmall, ptsFire, ptsSmoke, boomPool = [], markerMesh, markerRing, safeMarker, bossMesh = null, bossFx;
let gun, dash, wheel, muzzle;
const headImg = new Image(); headImg.crossOrigin = 'anonymous'; headImg.src = 'head.png';

const col3 = c => new THREE.Color(c);
function box(w, h, d, mat){ return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); }
function lam(c, o){ return new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {})); }

// ---------- Textures ----------
function canvasTex(w, h, fn, repeat){
  const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (repeat){ t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  t.anisotropy = 4; return t;
}
function makeTextures(){
  facadeTex = canvasTex(64, 48, (g, w, h) => {
    g.fillStyle = '#e6e2da'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,.06)'; for (let y=0;y<h;y+=4) g.fillRect(0, y, w, 1);
    g.fillStyle = '#c9c4ba'; g.fillRect(0, h-5, w, 5);
    for (const x of [8, 38]){ g.fillStyle = '#9a958c'; g.fillRect(x-2, 9, 22, 28); g.fillStyle = '#26303c'; g.fillRect(x, 11, 18, 24); g.fillStyle = '#3a4656'; g.fillRect(x, 11, 18, 4); g.fillStyle = '#9a958c'; g.fillRect(x+8, 11, 2, 24); }
  }, true);
  litTex = canvasTex(64, 48, (g, w, h) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffcf7a'; g.fillRect(8, 11, 18, 24);
    g.fillStyle = '#7a5a2a'; g.fillRect(38, 11, 18, 24);
  }, true);
  softTex = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.55, 'rgba(255,255,255,.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  starTex = canvasTex(64, 64, (g) => { g.translate(32, 32); g.fillStyle = '#fff3b0'; for (let k=0;k<6;k++){ g.rotate(Math.PI/3); g.beginPath(); g.moveTo(0, -4); g.lineTo(30, 0); g.lineTo(0, 4); g.fill(); } const gr = g.createRadialGradient(0, 0, 0, 0, 0, 16); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgba(255,200,80,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 16, 0, 7); g.fill(); });
}
function signTex(text, bg, fg, w, h){
  return canvasTex(w || 256, h || 48, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.strokeStyle = fg; g.lineWidth = 3; g.strokeRect(4, 4, W-8, H-8); g.fillStyle = fg; g.font = "800 " + Math.round(H*.58) + "px 'Barlow Condensed', sans-serif"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, W/2, H/2 + 2); });
}

// ---------- Init ----------
function initGL(){
  const glCv = document.getElementById('gl');
  renderer = new THREE.WebGLRenderer({ canvas: glCv, antialias: false, powerPreference: 'default' });
  renderer.setPixelRatio(window.level29MobileBudget?.pixelRatio(innerWidth,innerHeight,devicePixelRatio)||Math.min(1, devicePixelRatio || 1));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.autoClear = false; renderer.info.autoReset = false;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(74, innerWidth / innerHeight, 1, 1500);
  scene.fog = new THREE.Fog(0x9fb7c9, 240, 1150);
  hemi = new THREE.HemisphereLight(0xdfe8f0, 0x4a4436, .9); scene.add(hemi);
  sun = new THREE.DirectionalLight(0xfff1d8, .8); sun.position.set(-.5, 1, .35); scene.add(sun);
  flash = new THREE.SpotLight(0xfff2d8, 0, 720, .5, .55, 1); scene.add(flash); scene.add(flash.target);
  headL = new THREE.SpotLight(0xfff6d0, 0, 900, .55, .5, 1); scene.add(headL); scene.add(headL.target);
  boomLight = new THREE.PointLight(0xff8a30, 0, 420, 1); scene.add(boomLight);
  muzzleLight = new THREE.PointLight(0xffd27a, 0, 220, 1); scene.add(muzzleLight);
  makeTextures();
  MAT.trunk = lam('#5a4630'); MAT.leaf = lam('#2f5a2c'); MAT.palm = lam('#3f7a35'); MAT.pole = lam('#3a3e42');
  MAT.lamp = new THREE.MeshBasicMaterial({ color: 0x8a8a80 }); MAT.glass = lam('#1b2836', { emissive: 0x05080c });
  MAT.tire = lam('#141414'); MAT.dead = lam('#1f1d1b'); MAT.head = new THREE.MeshBasicMaterial({ color: 0xfff6c8 });
  MAT.tail = new THREE.MeshBasicMaterial({ color: 0x7a1010 }); MAT.red = new THREE.MeshBasicMaterial({ color: 0xff2a2a }); MAT.blue = new THREE.MeshBasicMaterial({ color: 0x2a6aff });
  MAT.eye = new THREE.MeshBasicMaterial({ color: 0xff3030 }); MAT.pool = new THREE.MeshBasicMaterial({ color: 0xffc070, map: softTex, transparent: true, opacity: .32, depthWrite: false, blending: THREE.AdditiveBlending });
  // dynamic systems
  zPool = new Pool(() => makeFigure(true)); sPool = new Pool(() => makeFigure(false)); cPool = new Pool(() => makeFigure(true)); kPool = new Pool(makePickup);
  const dg = new THREE.PlaneGeometry(1, 1); dg.rotateX(-Math.PI/2);
  decalMesh = new THREE.InstancedMesh(dg, new THREE.MeshBasicMaterial({ map: softTex, transparent: true, opacity: .8, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, fog: true }), 1600);
  decalMesh.count = 0; decalMesh.frustumCulled = false; decalMesh.setColorAt(0, new THREE.Color()); scene.add(decalMesh);
  // bullets
  const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(600 * 6), 3));
  bulletLines = new THREE.LineSegments(bg, new THREE.LineBasicMaterial({ color: 0xffe680, transparent: true, opacity: .9 })); bulletLines.frustumCulled = false; scene.add(bulletLines);
  spitMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(3.2, 8, 6), new THREE.MeshBasicMaterial({ color: 0x86d93c }), 80); spitMesh.count = 0; spitMesh.frustumCulled = false; scene.add(spitMesh);
  const mkPts = (n, size, blend, op) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n*3), 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n*3), 3)); const m = new THREE.Points(g, new THREE.PointsMaterial({ size, map: softTex, vertexColors: true, transparent: true, opacity: op, depthWrite: false, blending: blend, sizeAttenuation: true })); m.frustumCulled = false; scene.add(m); return m; };
  ptsSmall = mkPts(700, 3.2, THREE.NormalBlending, 1); ptsFire = mkPts(500, 16, THREE.AdditiveBlending, .9); ptsSmoke = mkPts(300, 26, THREE.NormalBlending, .5);
  // Elongated turbulent flame sprite rather than a round additive smoke blob.
  const flame=canvasTex(64,128,(g,W,H)=>{g.clearRect(0,0,W,H);const grad=g.createRadialGradient(32,96,2,32,76,53);grad.addColorStop(0,'rgba(255,255,215,1)');grad.addColorStop(.3,'rgba(255,201,65,.95)');grad.addColorStop(.7,'rgba(240,76,12,.65)');grad.addColorStop(1,'rgba(140,25,4,0)');g.fillStyle=grad;g.beginPath();g.moveTo(32,4);g.bezierCurveTo(16,44,6,68,12,105);g.bezierCurveTo(21,131,50,122,53,96);g.bezierCurveTo(58,65,34,45,32,4);g.fill();});ptsFire.material.map=flame;ptsFire.material.needsUpdate=true;
  for (let k=0;k<8;k++){ const m = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), new THREE.MeshBasicMaterial({ color: 0xff8a30, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); m.visible = false; scene.add(m); boomPool.push(m); }
  markerMesh = new THREE.Mesh(new THREE.CylinderGeometry(24, 24, 70, 28, 1, true), new THREE.MeshBasicMaterial({ color: 0xf4c355, transparent: true, opacity: .32, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  markerMesh.position.y = 35; scene.add(markerMesh);
  markerRing = new THREE.Mesh(new THREE.RingGeometry(.96, 1, 64), new THREE.MeshBasicMaterial({ color: 0xff5a4a, transparent: true, opacity: .55, side: THREE.DoubleSide, depthWrite: false })); markerRing.rotation.x = -Math.PI/2; markerRing.position.y = .6; scene.add(markerRing);
  safeMarker = new THREE.Mesh(new THREE.CylinderGeometry(22, 22, 40, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0x3cc86e, transparent: true, opacity: .22, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); safeMarker.position.y = 20; scene.add(safeMarker);
  bossFx = new THREE.Group();
  const tele = new THREE.Mesh(new THREE.PlaneGeometry(260, 14).rotateX(-Math.PI/2).translate(130, .8, 0), new THREE.MeshBasicMaterial({ color: 0xff3c28, transparent: true, opacity: .45, depthWrite: false })); tele.name = 'tele';
  const slam = new THREE.Mesh(new THREE.RingGeometry(160, 170, 48).rotateX(-Math.PI/2), new THREE.MeshBasicMaterial({ color: 0xffc850, transparent: true, opacity: .6, depthWrite: false, side: THREE.DoubleSide })); slam.name = 'slam'; slam.position.y = .9;
  bossFx.add(tele, slam); scene.add(bossFx);
  buildViewModel();
  addEventListener('resize', () => { if(window.level29MobileBudget?.mobile)renderer.setPixelRatio(Math.min(renderer.getPixelRatio(),window.level29MobileBudget.pixelRatio(innerWidth,innerHeight,devicePixelRatio)));renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); window.level29MobileViewport.fitViewmodel(vmCam,innerWidth,innerHeight); });
}

// ---------- Generic object pool ----------
class Pool {
  constructor(make){ this.make = make; this.map = new Map(); this.free = []; this.seen = new Set(); }
  begin(){ this.seen.clear(); }
  get(o){ let m = this.map.get(o), fresh = false; if (!m){ m = this.free.pop() || this.make(); if (!m.parent) scene.add(m); m.visible = true; this.map.set(o, m); fresh = true; } this.seen.add(o); return [m, fresh]; }
  end(){ for (const [o, m] of this.map) if (!this.seen.has(o)){ m.visible = false; this.free.push(m); this.map.delete(o); } }
  clear(){ for (const [o, m] of this.map){ m.visible = false; this.free.push(m); } this.map.clear(); }
}

// ---------- Figures (zombies, survivors, corpses, boss) ----------
// Shared geometry/materials so pooled figures stay cheap on memory.
let FIG = null;
function figParts(){
  if (FIG) return FIG;
  const cyl = (rt, rb, h, seg) => new THREE.CylinderGeometry(rt, rb, h, seg || 12);
  const sph = (r, w, h) => new THREE.SphereGeometry(r, w || 14, h || 10);
  const hairCap = new THREE.SphereGeometry(2.42, 18, 10, 0, Math.PI * 2, 0, Math.PI * .46);
  hairCap.scale(1.04, 1.06, 1.04); hairCap.translate(0, -2.2, 0);
  const longHair = new THREE.SphereGeometry(2.4, 16, 10, -Math.PI * .5, Math.PI, 0, Math.PI * .8);
  longHair.scale(1, 1.75, 1.05);
  FIG = {
    leg: cyl(1.6, 1.22, 7.4, 12), knee: sph(1.32, 10, 8), shoe: new THREE.BoxGeometry(4.3, 1.3, 2.7), toe: cyl(1.35, 1.35, 2.7, 10),
    hips: cyl(1, .95, 2.4, 14), belt: cyl(1, 1, .75, 14), buckle: new THREE.BoxGeometry(.3, .6, .9),
    torso: cyl(1, .84, 7.2, 16), shoulder: sph(1.48, 12, 8), neck: cyl(.92, 1, 1.8, 10),
    head: sph(1, 20, 14), ear: sph(1, 8, 6), nose: sph(1,12,8), jaw: sph(1, 14, 8),
    humanEye: sph(1,12,8), iris: sph(1,10,8), lip: sph(1,12,6), cheek: sph(1,12,8),
    eyeW: new THREE.BoxGeometry(.18, .5, .72), pupil: new THREE.BoxGeometry(.14, .38, .36), brow: new THREE.BoxGeometry(.18, .22, .95), mouth: new THREE.BoxGeometry(.16, .2, 1.05),
    sleeve: cyl(1.3, 1.12, 3.8, 12), elbow: sph(1.08, 10, 8), forearm: cyl(1.02, .84, 3.6, 10), hand: sph(.95, 10, 8),
    hairCap, longHair, zEye: new THREE.BoxGeometry(.4, .8, .9),
    shoeMat: lam('#1a1a1c'), soleMat: lam('#d8d4ca'), beltMat: lam('#231c16'), buckleMat: lam('#c9a44a', { emissive: 0x2a1e00 }),
    whiteMat: lam('#f2efe8'), pupilMat: lam('#1b120c'), mouthMat: lam('#7a3a34')
  };
  return FIG;
}
function makeFigure(zombie){
  const P = figParts();
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const skin = lam('#86a46e'), shirt = lam('#555'), pants = lam('#2e3a52');
  const add = (parent, geo, mat, x, y, z, sx, sy, sz) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (sx) m.scale.set(sx, sy, sz); parent.add(m); return m; };

  const legL = new THREE.Group(), legR = new THREE.Group();
  for (const leg of [legL, legR]){
    add(leg, P.leg, pants, 0, -3.7, 0, 1, 1, .95);
    add(leg, P.knee, pants, .15, -3.9, 0, 1, .9, .95);
    add(leg, P.shoe, P.shoeMat, .55, -7.35, 0);
    const toe = add(leg, P.toe, P.shoeMat, 2.7, -7.35, 0, .5, 1, .48); toe.rotation.x = Math.PI / 2;
    add(leg, P.shoe, P.soleMat, .55, -7.95, 0, 1.02, .12, 1.02);
  }
  legL.position.set(0, 8, -1.8); legR.position.set(0, 8, 1.8);

  add(body, P.hips, pants, 0, 8.7, 0, 2.25, 1, 3.55);
  add(body, P.belt, P.beltMat, 0, 9.45, 0, 2.22, 1, 3.42);
  add(body, P.buckle, P.buckleMat, 2.22, 9.45, 0);
  const torso = add(body, P.torso, shirt, 0, 12.4, 0, 2.38, 1, 3.75);
  for (const z of [-3.6, 3.6]) add(body, P.shoulder, shirt, 0, 15, z, 1.1, .85, 1);
  add(body, P.neck, skin, .1, 16.4, 0);

  const head = add(body, P.head, skin, .05, 18.3, 0, zombie?2.2:2.05, zombie?2.45:2.35, zombie?2.12:1.95);
  const jaw = add(body, P.jaw, skin, .45, 17.05, 0, 1.55, 1.05, 1.6);
  const hair = add(body, P.hairCap, lam('#3a2a1a'), 0, 20.4, 0);
  hair.position.y = 20.4;
  const longHair = add(body, P.longHair, hair.material, -.35, 17.6, 0); longHair.visible = false;

  let face = null;
  if (!zombie){
    face = new THREE.Group(); body.add(face);
    for (const z of [-2.12, 2.12]) add(face, P.ear, skin, -.1, 18.2, z, .45, .75, .3);
    // Nose bridge/tip, cheek planes and lips sit on the face, not inside the skull.
    add(face, P.nose, skin, 2.03, 18.25, 0, .38, .74, .32);
    add(face, P.nose, skin, 2.38, 17.95, 0, .42, .3, .4);
    for(const side of [-1,1])add(face,P.cheek,skin,1.64,17.8,side*1.12,.5,.5,.52);
    for (const z of [-.82, .82]){
      add(face, P.humanEye, P.whiteMat, 1.98, 18.65, z, .23, .23, .42);
      add(face, P.iris, P.pupilMat, 2.19, 18.65, z, .08, .17, .18);
      add(face, P.humanEye, skin, 1.99, 18.89, z, .18, .08, .43);
      const brow = add(face, P.brow, hair.material, 1.92, 19.13, z); brow.rotation.x = z > 0 ? .12 : -.12;
    }
    add(face, P.lip, P.mouthMat, 1.98, 17.15, 0, .15, .11, .57);
    add(face, P.lip, P.mouthMat, 1.99, 16.98, 0, .16, .12, .5);
  }

  const armL = new THREE.Group(), armR = new THREE.Group();
  for (const arm of [armL, armR]){
    add(arm, P.sleeve, shirt, 0, -1.9, 0);
    add(arm, P.elbow, skin, 0, -3.9, 0, .92, .9, .92);
    add(arm, P.forearm, skin, 0, -5.6, 0);
    add(arm, P.hand, skin, .1, -7.7, 0, 1, 1.25, .8);
  }
  armL.position.set(0, 15, -4.9); armR.position.set(0, 15, 4.9);
  body.add(legL, legR, armL, armR);

  let eyes = null;
  if (zombie){ eyes = new THREE.Group(); for (const z of [-.95, .95]){ const e = new THREE.Mesh(P.zEye, MAT.eye); e.position.set(2.05, 18.6, z); eyes.add(e); } body.add(eyes); }
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(3, 16, 8, 0, Math.PI*2, 0, Math.PI/2), lam('#4b5320')); helmet.position.y = 19.6; helmet.scale.set(1, .8, 1); helmet.visible = false; body.add(helmet);
  g.traverse(o => { if (o.isMesh){ o.castShadow = true; o.receiveShadow = false; } });
  g.userData = { body, legL, legR, armL, armR, torso, head, jaw, hair, longHair, face, eyes, helmet, skin, shirt, pants };
  return g;
}
function setFigureColors(m, skin, shirt, pants, hairCol){
  const u = m.userData; u.skin.color.set(skin); u.shirt.color.set(shirt); u.pants.color.set(pants); u.hair.material.color.set(hairCol || '#3a2a1a');
}
function makeBoss(spec){
  const g = makeFigure(true), u = g.userData; setFigureColors(g, spec.skin, spec.shirt, '#2a2a32');
  const k = lam('#141414'), hatG = new THREE.Group(); u.body.add(hatG); u.hair.visible = false;
  if (spec.hat==='tophat'){ const brim = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, .5, 16), k); brim.position.y = 20.4; const top = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 5, 16), k); top.position.y = 23; const band = new THREE.Mesh(new THREE.CylinderGeometry(2.9, 2.9, 1, 16), lam('#8a00a8')); band.position.y = 21.3; hatG.add(brim, top, band); }
  if (spec.hat==='cowboy'){ const brim = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 5.5, .5, 16), lam('#8a6a3a')); brim.position.y = 20.5; const top = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3, 3, 16), lam('#6a4e2a')); top.position.y = 22; hatG.add(brim, top); }
  if (spec.hat==='helmet'){ u.helmet.visible = true; u.helmet.scale.set(1.15, .9, 1.15); }
  if (spec.hat==='campaign'){ const brim = new THREE.Mesh(new THREE.CylinderGeometry(5.8, 5.8, .5, 16), lam('#8a6a3a')); brim.position.y = 20.5; const top = new THREE.Mesh(new THREE.ConeGeometry(3, 3.6, 4), lam('#a07e48')); top.position.y = 22.4; hatG.add(brim, top); }
  if (spec.hat==='shades'){ const sh = box(.6, 1, 4.6, k); sh.position.set(2.3, 18.4, 0); hatG.add(sh); const hair = box(4.8, 1.6, 4.8, lam('#c8a020')); hair.position.y = 20.6; hatG.add(hair); }
  g.scale.setScalar(2.4); scene.add(g); return g;
}
function poseFigure(m, x, y, a, anim, mode){
  const u = m.userData; m.position.set(x, 0, y); m.rotation.y = -a;
  const sw = Math.sin(anim);
  u.legL.rotation.z = sw * .7; u.legR.rotation.z = -sw * .7;
  if (mode==='zombie'){ u.armL.rotation.z = Math.PI/2 - .15 + Math.sin(anim * .7) * .15; u.armR.rotation.z = Math.PI/2 - .15 - Math.sin(anim * .7) * .15; u.body.rotation.z = -.12; }
  else if (mode==='wave'){ u.armL.rotation.z = 0; u.armR.rotation.x = -2.6 + Math.sin(anim * 1.5) * .4; u.armR.rotation.z = 0; u.body.rotation.z = 0; }
  else { u.armL.rotation.z = -sw * .6; u.armR.rotation.z = sw * .6; u.armR.rotation.x = 0; u.body.rotation.z = 0; }
  u.body.position.y = Math.abs(Math.cos(anim)) * .6; u.body.rotation.x = 0;
}

// ---------- Cars ----------
function makeCarMesh(c){
  const s = c.spec, L = s.len, W = s.wid, t = c.type, g = new THREE.Group();
  const paint = lam(c.col), dark = lam(shade(c.col, .7));
  const tall = t==='van' ? 15 : t==='humvee' ? 9.5 : 8;
  const bodyM = box(L, tall, W, paint); bodyM.position.y = 3 + tall/2; g.add(bodyM);
  const top = 3 + tall;
  const parts = [bodyM];
  if (t==='truck' || t==='mtvr'){
    const cabL = L*.3, cab = box(cabL, 11, W*.96, paint); cab.position.set(L/2 - cabL/2, top + 5.5, 0);
    const win = box(.6, 4.5, W*.8, MAT.glass); win.position.set(L/2 + .1, top + 7, 0);
    const cargo = box(L*.66, t==='truck' ? 22 : 15, W, t==='truck' ? lam('#ece8de') : lam('#4a5030')); cargo.position.set(-L*.17, top + (t==='truck' ? 11 : 7.5), 0);
    g.add(cab, win, cargo); parts.push(cab, cargo);
  } else if (t==='pickup'){
    const cab = box(L*.34, 7, W*.9, MAT.glass); cab.position.set(L*.08, top + 3.5, 0);
    const roof = box(L*.3, 1, W*.88, paint); roof.position.set(L*.07, top + 7.3, 0);
    const bedL = box(L*.4, 3, 1.2, dark), bedR = bedL.clone(), bedB = box(1.2, 3, W, dark); bedL.position.set(-L*.28, top + 1.5, -W/2 + .6); bedR.position.set(-L*.28, top + 1.5, W/2 - .6); bedB.position.set(-L/2 + .6, top + 1.5, 0);
    g.add(cab, roof, bedL, bedR, bedB); parts.push(roof);
  } else if (t==='van'){
    const ws = box(.6, 6, W*.84, MAT.glass); ws.position.set(L/2 + .1, top - 4, 0); g.add(ws);
    const sw = box(L*.5, 3.6, W + .2, MAT.glass); sw.position.set(L*.12, top - 4, 0); g.add(sw);
  } else if (t==='humvee'){
    const cab = box(L*.5, 6, W*.92, lam(shade(c.col, .82))); cab.position.set(-L*.06, top + 3, 0);
    const ws = box(.5, 4, W*.8, MAT.glass); ws.position.set(L*.19 + .2, top + 3, 0);
    const turret = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 3, 10), lam('#3a4024')); turret.position.set(-L*.08, top + 7.5, 0);
    g.add(cab, ws, turret); parts.push(cab);
  } else {
    const open = s.open, cabL = L*.48;
    const cab = box(cabL, 6.6, W*.86, MAT.glass); cab.position.set(-L*.04, top + 3.3, 0);
    if (!open){ g.add(cab); const roof = box(cabL*.82, 1, W*.84, paint); roof.position.set(-L*.06, top + 6.9, 0); g.add(roof); parts.push(roof); }
    else { const ws = box(.5, 4, W*.84, MAT.glass); ws.position.set(L*.18, top + 2, 0); ws.rotation.z = .4; g.add(ws); const seats = box(L*.3, 3, W*.7, lam('#3a2a22')); seats.position.set(-L*.08, top + 1.5, 0); g.add(seats); }
    if (s.police){ const bar = new THREE.Group(), r = box(2.4, 1.4, W*.38, MAT.red.clone()), b = box(2.4, 1.4, W*.38, MAT.blue.clone()); r.position.z = -W*.2; b.position.z = W*.2; bar.add(r, b); bar.position.set(-L*.06, top + 8.1, 0); g.add(bar); g.userData.bar = [r, b];
      const stripe = box(L*.55, 1.6, W + .3, lam('#1b1b1b')); stripe.position.set(0, 3 + tall*.55, 0); g.add(stripe); }
    if (t==='taxi'){ const sign = box(3, 2, 7, lam('#f4f4e0', { emissive: 0x332a00 })); sign.position.set(-L*.06, top + 8.3, 0); g.add(sign); }
    if (t==='sports'){ const wing = box(2, 1, W*.9, lam('#111')); wing.position.set(-L/2 + 2, top + 2.5, 0); g.add(wing); }
  }
  for (const [wx, wz] of [[L*.3, -W/2], [L*.3, W/2], [-L*.3, -W/2], [-L*.3, W/2]]){ const wh = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 3, 12), MAT.tire); wh.rotation.x = Math.PI/2; wh.position.set(wx, 4, wz); g.add(wh); }
  for (const z of [-W*.32, W*.32]){ const h = box(.6, 2, 4, MAT.head); h.position.set(L/2 + .1, 3 + tall*.55, z); g.add(h); const tl = box(.6, 2, 4, MAT.tail); tl.position.set(-L/2 - .1, 3 + tall*.6, z); g.add(tl); }
  g.userData.paint = paint; g.userData.parts = parts; g.userData.top = top; g.userData.dead = false;
  if (c.ai) g.userData.driver = addDriver(g, c, L, W, top);
  scene.add(g); return g;
}
const DRIVER_LOOKS = [
  ['#8a5a3c', '#c0392b', '#1d1d22', '#1a120c'], ['#c79a74', '#2d6a8f', '#2b2f3a', '#5a3a1e'],
  ['#5a3826', '#f2efe8', '#3a3f4a', '#0f0b08'], ['#e0b48f', '#3f7d4a', '#262626', '#c8a060'],
  ['#a87954', '#d8a23a', '#2a2a32', '#2a1a10'], ['#6b4430', '#6a3d8c', '#1e2230', '#120c08']
];
function addDriver(g, c, L, W, top){
  const t = c.type;
  const seat = t==='van' ? [L*.3, top - 9] : (t==='truck' || t==='mtvr') ? [L*.36, top + 2]
    : t==='pickup' ? [L*.1, top - 1] : c.spec.open ? [-L*.02, top + 1] : [L*.04, top - 1];
  const d = makeFigure(false), u = d.userData, look = DRIVER_LOOKS[Math.floor(Math.random() * DRIVER_LOOKS.length)];
  setFigureColors(d, look[0], look[1], look[2], look[3]);
  u.longHair.visible = Math.random() < .35;
  u.legL.visible = u.legR.visible = false;
  u.armL.rotation.set(.25, 0, 1.15); u.armR.rotation.set(-.25, 0, 1.15);
  const s = .55; d.scale.setScalar(s);
  d.position.set(seat[0], seat[1] - 8.7 * s, -W * .2);
  d.traverse(o => { if (o.isMesh) o.castShadow = false; });
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(1.6, .3, 6, 14), lam('#151515'));
  wheel.position.set(seat[0] + 4.2, seat[1] + 2.6, -W * .2); wheel.rotation.y = Math.PI / 2; wheel.rotation.x = .5;
  const rig = new THREE.Group(); rig.add(d, wheel); g.add(rig);
  return rig;
}
function syncCars(){
  const p = player, far = isNight() ? 580 : 780;
  if (frame % 30 === 0){ const live = new Set(cars); for (const [c, m] of carMeshes) if (!live.has(c)){ scene.remove(m); carMeshes.delete(c); } }
  for (const c of cars){
    if(c.gone)continue;
    const d = dist(c.x, c.y, camera.position.x, camera.position.z);
    let m = carMeshes.get(c);
    if (d >= far && (!p || p.car !== c)){ if (m) m.visible = false; continue; }
    if (!m){ m = makeCarMesh(c); carMeshes.set(c, m); }
    m.visible = d < far && !(player && player.car === c && !view.chase); if (!m.visible) continue;
    m.position.set(c.x, c.z || 0, c.y); m.rotation.set(0, -c.a, 0);
    if (!c.dead) m.rotation.x = clamp(c.vs * .03, -.08, .08);
    if (c.z > 0) m.rotation.z = clamp((c.vz || 0) * .06, -.35, .35);
    if (m.userData.col !== c.col){ if (m.userData.col) m.userData.paint.color.set(c.col); m.userData.col = c.col; }
    if (c.ai && !c.dead && !m.userData.driver) m.userData.driver = addDriver(m, c, c.spec.len, c.spec.wid, m.userData.top);
    if (m.userData.driver) m.userData.driver.visible = !!c.ai && !c.dead;
    if (c.dead && !m.userData.dead){ m.userData.dead = true; m.traverse(o => { if (o.isMesh) o.material = MAT.dead; }); m.position.y = -1; }
    if (m.userData.bar){ const on = c.siren && frame % 16 < 8; m.userData.bar[0].material.color.set(on ? 0xff2a2a : c.siren ? 0x4a0a0a : 0x7a1a1a); m.userData.bar[1].material.color.set(c.siren && !on ? 0x2a6aff : c.siren ? 0x0a1a4a : 0x1a2a6a); }
    m.userData.paint.emissive && m.userData.paint.emissive.setRGB(c.burnT ? .35 : 0, c.burnT ? .08 : 0, 0);
  }
}

// ---------- Pickups ----------
function makePickup(){
 const g=new THREE.Group(),m=box(8,8,8,lam('#fff'));g.add(m);g.userData.m=m;
 const cross=new THREE.Group(),red=new THREE.MeshStandardMaterial({color:'#ee2525',emissive:'#b81717',emissiveIntensity:.55,roughness:.45});
 cross.name='health-red-cross';cross.visible=false;
 // A single extruded plus silhouette, with no overlapping coplanar bar faces.
 const shape=new THREE.Shape();shape.moveTo(-2,7);for(const [x,y]of [[2,7],[2,2],[7,2],[7,-2],[2,-2],[2,-7],[-2,-7],[-2,-2],[-7,-2],[-7,2],[-2,2]])shape.lineTo(x,y);shape.closePath();
 const geometry=new THREE.ExtrudeGeometry(shape,{depth:4,bevelEnabled:false,steps:1});geometry.translate(0,0,-2);cross.add(new THREE.Mesh(geometry,red));g.add(cross);g.userData.healthCross=cross;return g;
}
const PICK = { health:['#f2f2f2', 0x501010], armor:['#2a5ad0', 0x0a1a50], cash:['#2f8a3a', 0x0a3010], crate:['#4b5320', 0], power:['#f4c355', 0x6a4a00] };

// ---------- City build ----------
function getFacade(col){ if (!facadeMats.has(col)) facadeMats.set(col, lam(col, { map: facadeTex, emissiveMap: litTex, emissive: 0x000000 })); return facadeMats.get(col); }
function getRoof(col){ if (!roofMats.has(col)) roofMats.set(col, lam(shade(col, .82))); return roofMats.get(col); }
function buildingBox(b, h){
  const geo = new THREE.BoxGeometry(b.w, h, b.h), uv = geo.attributes.uv;
  const faceW = [b.h, b.h, b.w, b.w, b.w, b.w];
  for (let f=0; f<6; f++){ if (f===2 || f===3) continue; for (let k=0;k<4;k++){ const i = f*4 + k; uv.setXY(i, uv.getX(i) * faceW[f] / 64, uv.getY(i) * h / 48); } }
  const fm = getFacade(b.col), rm = getRoof(b.col);
  const m = new THREE.Mesh(geo, [fm, fm, rm, rm, fm, fm]); m.position.set(b.x + b.w/2, h/2, b.y + b.h/2); return m;
}
function buildCity(){
  if (cityGroup){window.level29GroundMemory?.releaseGround(cityGroup,groundCv); scene.remove(cityGroup); cityGroup.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
  for (const m of carMeshes.values()) scene.remove(m); carMeshes.clear();
  zPool.clear(); sPool.clear(); cPool.clear(); kPool.clear();
  if (bossMesh){ scene.remove(bossMesh); bossMesh = null; }
  decalN = 0; decalMesh.count = 0;
  builtCity = city; cityGroup = new THREE.Group(); scene.add(cityGroup);
  // ground
  const gt = new THREE.CanvasTexture(groundCv); gt.encoding=THREE.sRGBEncoding;gt.anisotropy = 1;gt.generateMipmaps=false;gt.minFilter=THREE.LinearFilter;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(WORLD, WORLD), new THREE.MeshStandardMaterial({name:'worldGround',map:gt,roughness:1,metalness:0,envMapIntensity:0}));
  ground.rotation.x = -Math.PI/2; ground.position.set(WORLD/2, 0, WORLD/2); cityGroup.add(ground);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), lam(D.id==='pi' ? '#35574f' : '#1f4b66')); sea.rotation.x = -Math.PI/2; sea.position.set(WORLD/2, -1, WORLD/2); cityGroup.add(sea);
  // curbs along sidewalks (thin raised edges)
  // buildings
  for (const b of city.buildings){
    if (b.venue) continue;
    const h = Math.max(30, b.H * BH);
    if (b.kind==='watertower'){
      const cx0 = b.x + b.w/2, cz = b.y + b.h/2;
      for (const [ox, oz] of [[-26,-26],[26,-26],[-26,26],[26,26]]){ const leg = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.2, 150, 6), MAT.pole); leg.position.set(cx0 + ox, 75, cz + oz); cityGroup.add(leg); }
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(42, 42, 50, 24), lam('#a9b0b4')); tank.position.set(cx0, 175, cz); cityGroup.add(tank);
      const capM = new THREE.Mesh(new THREE.ConeGeometry(44, 16, 24), lam('#8f979c')); capM.position.set(cx0, 208, cz); cityGroup.add(capM);
      const s = new THREE.Mesh(new THREE.PlaneGeometry(60, 18), new THREE.MeshLambertMaterial({ map: signTex('USMC', '#a9b0b4', '#4b5320', 200, 60), side: THREE.DoubleSide })); s.position.set(cx0, 180, cz + 42.5); cityGroup.add(s);
      continue;
    }
    if (b.kind==='iwo'){
      const cx0 = b.x + b.w/2, cz = b.y + b.h/2;
      const ped = box(b.w - 20, 22, b.h - 20, lam('#7a7a74')); ped.position.set(cx0, 11, cz); cityGroup.add(ped);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 110, 6), MAT.pole); pole.position.set(cx0, 70, cz); pole.rotation.z = -.55; cityGroup.add(pole);
      const fl = new THREE.Mesh(new THREE.PlaneGeometry(40, 24), new THREE.MeshLambertMaterial({ side: THREE.DoubleSide, map: canvasTex(80, 48, (g) => { for (let s=0;s<13;s++){ g.fillStyle = s%2 ? '#fff' : '#b22234'; g.fillRect(0, s*48/13, 80, 48/13 + .5); } g.fillStyle = '#3c3b6e'; g.fillRect(0, 0, 32, 26); }) }));
      fl.position.set(cx0 + 48, 112, cz); cityGroup.add(fl);
      for (let f=0; f<5; f++){ const fig = makeFigure(false); setFigureColors(fig, '#3a4434', '#3a4434', '#3a4434', '#3a4434'); fig.position.set(cx0 - 18 + f*9, 22, cz + (f%2 ? 5 : -5)); fig.rotation.y = Math.PI; fig.userData.body.rotation.z = -.5 - f*.06; fig.userData.armR.rotation.z = 2.4; fig.userData.armL.rotation.z = 2.2; cityGroup.add(fig); }
      continue;
    }
    if (b.kind==='dome' && typeof makeLevel29Superdome==='function'){ cityGroup.add(makeLevel29Superdome(b)); continue; }
    if (b.kind==='dome'){ const dm = new THREE.Mesh(new THREE.SphereGeometry(Math.min(b.w, b.h)/2, 32, 16, 0, Math.PI*2, 0, Math.PI/2), lam('#e6e3da')); dm.scale.y = .42; dm.position.set(b.x + b.w/2, 26, b.y + b.h/2); cityGroup.add(box(b.w, 26, b.h, lam('#cfccc2')), dm); cityGroup.children[cityGroup.children.length-2].position.set(b.x + b.w/2, 13, b.y + b.h/2); continue; }
    const m = buildingBox(b, h); cityGroup.add(m);
    if (b.kind==='cathedral'){
      for (const f of [.2, .5, .8]){ const tall = f===.5 ? 120 : 80; const tw = box(22, tall - h, 22, lam('#efece2')); tw.position.set(b.x + b.w*f, h + (tall - h)/2, b.y + b.h - 14); cityGroup.add(tw);
        const sp = new THREE.Mesh(new THREE.ConeGeometry(13, f===.5 ? 60 : 40, 4), lam('#2b2e33')); sp.position.set(b.x + b.w*f, tall + (f===.5 ? 30 : 20), b.y + b.h - 14); sp.rotation.y = Math.PI/4; cityGroup.add(sp); }
    }
    if (b.kind==='helipad'){ const pad = new THREE.Mesh(new THREE.CircleGeometry(Math.min(b.w, b.h)*.36, 32), new THREE.MeshLambertMaterial({ map: signTex('H', '#3b4148', '#f4c355', 128, 128) })); pad.rotation.x = -Math.PI/2; pad.position.set(b.x + b.w/2, h + .5, b.y + b.h/2); cityGroup.add(pad);
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 6), MAT.red); beacon.position.set(b.x + 8, h + 3, b.y + 8); cityGroup.add(beacon); }
    if (b.kind==='safe'){
      const signC = document.createElement('canvas'); signC.width = 512; signC.height = 128; const g = signC.getContext('2d');
      g.fillStyle = '#12261a'; g.fillRect(0, 0, 512, 128); g.strokeStyle = '#3cc86e'; g.lineWidth = 6; g.strokeRect(6, 6, 500, 116);
      g.fillStyle = '#3cc86e'; g.font = "900 58px 'Barlow Condensed', sans-serif"; g.textBaseline = 'middle'; g.fillText('SAFEHOUSE', 128, 68);
      const tex = new THREE.CanvasTexture(signC); const sm = new THREE.Mesh(new THREE.PlaneGeometry(130, 32), new THREE.MeshBasicMaterial({ map: tex }));
      sm.position.set(b.x + b.w/2, h - 22, b.y + b.h + .6); cityGroup.add(sm);
      const drawHead = () => { try { g.drawImage(headImg, 22, 10, 96, 108); tex.needsUpdate = true; } catch(e){} };
      if (headImg.complete && headImg.naturalWidth) drawHead(); else headImg.addEventListener('load', drawHead, { once: true });
    }
  }
  // trees (instanced)
  const trees = city.trees, normal = trees.filter(t => !t.palm), palms = trees.filter(t => t.palm);
  const dummy = new THREE.Object3D();
  const leafCol = D.id==='lej' ? '#24452a' : '#2f5a2c';
  if (normal.length){
    const tr = new THREE.InstancedMesh(new THREE.CylinderGeometry(1.4, 2, 1, 6).translate(0, .5, 0), MAT.trunk, normal.length);
    const lf = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), lam(leafCol), normal.length);
    normal.forEach((t, i) => { dummy.position.set(t.x, 0, t.y); dummy.scale.set(1, 22 + t.r*.6, 1); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); tr.setMatrixAt(i, dummy.matrix);
      dummy.position.set(t.x, 26 + t.r*.9, t.y); dummy.scale.set(t.r*1.15, t.r*1.05, t.r*1.15); dummy.rotation.set(0, t.x, 0); dummy.updateMatrix(); lf.setMatrixAt(i, dummy.matrix); });
    cityGroup.add(tr, lf);
    // Offset crown lobes and forked branches replace the spherical lollipop silhouette.
    for(let side=-1;side<=1;side+=2){
      const crown=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),lam(side<0?'#355b35':'#486a3b'),normal.length);
      const branch=new THREE.InstancedMesh(new THREE.CylinderGeometry(.65,1.2,1,5).translate(0,.5,0),MAT.trunk,normal.length);
      normal.forEach((t,i)=>{
        dummy.position.set(t.x+side*t.r*.65,26+t.r*.7,t.y+Math.sin(t.x)*t.r*.45);dummy.rotation.set(.2,t.y*.1,side*.15);dummy.scale.set(t.r*.8,t.r*.65,t.r*.8);dummy.updateMatrix();crown.setMatrixAt(i,dummy.matrix);crown.setColorAt(i,new THREE.Color().setScalar(.8+hash(t.x+t.y)*.3));
        dummy.position.set(t.x,17+t.r*.3,t.y);dummy.rotation.set(0,t.y*.1,-side*.6);dummy.scale.set(1,t.r*1.4,1);dummy.updateMatrix();branch.setMatrixAt(i,dummy.matrix);
      });cityGroup.add(crown,branch);
    }
  }
  if (palms.length){
    const tr = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1.6, 1, 6).translate(0, .5, 0), MAT.trunk, palms.length);
    const lf = new THREE.InstancedMesh(new THREE.ConeGeometry(1, .35, 7, 1, true), new THREE.MeshLambertMaterial({ color: D.id==='pi' ? '#3a5a2a' : '#3f7a35', side: THREE.DoubleSide }), palms.length);
    palms.forEach((t, i) => { const H = 60 + hash(t.x) * 30; dummy.position.set(t.x, 0, t.y); dummy.scale.set(1, H, 1); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); tr.setMatrixAt(i, dummy.matrix);
      dummy.position.set(t.x, H, t.y); dummy.scale.set(t.r*1.8, t.r*1.8, t.r*1.8); dummy.rotation.set(Math.PI, t.y, 0); dummy.updateMatrix(); lf.setMatrixAt(i, dummy.matrix); });
    cityGroup.add(tr, lf);
  }
  // street lamps + light pools + street signs at intersections
  const lamps = [];city.lightPoleSolids=[];
  for (let i=0;i<ROADS.length;i++) for (let j=0;j<ROADS.length;j++){
    const t = city.get(ROADS[i]+1, ROADS[j]+1); if (t!==T_ROAD && t!==T_BRIDGE) continue;
    const lx = ROADS[i]*TILE - 8, lz = ROADS[j]*TILE - 8;
    if (city.get(ROADS[i]-1, ROADS[j]-1)===T_WALK) lamps.push([lx, lz]);
    const sx = (ROADS[i]+3)*TILE + 8, sz = (ROADS[j]+3)*TILE + 8;
    if (city.get(ROADS[i]+3, ROADS[j]+3)===T_WALK){
      city.lightPoleSolids.push({x:sx-1.5,y:sz-1.5,w:3,h:3});const pole = new THREE.Mesh(new THREE.CylinderGeometry(.8, .8, 40, 6), MAT.pole); pole.position.set(sx, 20, sz); cityGroup.add(pole);
      const a = new THREE.Mesh(new THREE.PlaneGeometry(36, 7), new THREE.MeshLambertMaterial({ map: signTexFor(D.v[i]), side: THREE.DoubleSide })); a.position.set(sx, 38, sz); a.rotation.y = Math.PI/2; cityGroup.add(a);
      const b = new THREE.Mesh(new THREE.PlaneGeometry(36, 7), new THREE.MeshLambertMaterial({ map: signTexFor(D.h[j]), side: THREE.DoubleSide })); b.position.set(sx, 31, sz); cityGroup.add(b);
    }
  }
  const lp = new THREE.InstancedMesh(new THREE.CylinderGeometry(.9, 1.2, 52, 6).translate(0, 26, 0), MAT.pole, lamps.length);
  const lh = new THREE.InstancedMesh(new THREE.BoxGeometry(10, 2, 4), MAT.lamp, lamps.length);
  const pools = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI/2), MAT.pool, lamps.length);
  lamps.forEach(([x, z], i) => { city.lightPoleSolids.push({x:x-1.5,y:z-1.5,w:3,h:3}); dummy.rotation.set(0, Math.PI/4, 0); dummy.scale.set(1, 1, 1); dummy.position.set(x, 0, z); dummy.updateMatrix(); lp.setMatrixAt(i, dummy.matrix);
    dummy.position.set(x + 5, 52, z + 5); dummy.updateMatrix(); lh.setMatrixAt(i, dummy.matrix);
    dummy.rotation.set(0, 0, 0); dummy.position.set(x + 12, .7, z + 12); dummy.scale.set(170, 1, 170); dummy.updateMatrix(); pools.setMatrixAt(i, dummy.matrix); });
  pools.userData.lampPoints=lamps;pools.userData.lastSelection=null;cityGroup.add(lp, lh, pools); lampPools = pools;
  lightMode = '';
}
const signCache = new Map();
function signTexFor(name){ if (!signCache.has(name)) signCache.set(name, signTex(name, '#1d6b3a', '#f2f2ec', 256, 50)); return signCache.get(name); }

// ---------- Decals (blood, skids, scorch) ----------
const _dm = new THREE.Object3D(), _dc = new THREE.Color();
decal = function(x, y, kind, s){
  if (!decalMesh) return;
  s = s || 1;
  let size = 14 * s, col = '#5a0808';
  if (kind==='green'){ col = '#46701e'; size = 11 * s; }
  if (kind==='scorch'){ col = '#0a0a0a'; size = 110 * s; }
  if (kind==='skid'){ col = '#141414'; size = 4; }
  if (kind==='blood' && Math.random() < .5) size *= 1.4;
  const i = decalN % 1600; decalN++;
  _dm.position.set(x, .25 + (i % 7) * .03, y); _dm.rotation.set(0, Math.random()*7, 0); _dm.scale.set(size, 1, size * (kind==='skid' ? 1 : rnd(.7, 1.1))); _dm.updateMatrix();
  decalMesh.setMatrixAt(i, _dm.matrix); decalMesh.setColorAt(i, _dc.set(col));
  decalMesh.count = Math.min(decalN, 1600); decalMesh.instanceMatrix.needsUpdate = true; decalMesh.instanceColor.needsUpdate = true;
};

// ---------- View model (gun + hands, dashboard) ----------
function buildViewModel(){
  vmScene = new THREE.Scene(); vmCam = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, .1, 100);
  window.level29MobileViewport.fitViewmodel(vmCam,innerWidth,innerHeight);
  vmScene.add(new THREE.HemisphereLight(0xffffff, 0x404040, .9)); const dl = new THREE.DirectionalLight(0xffffff, .6); dl.position.set(-1, 2, 1); vmScene.add(dl); vmScene.userData.lights = [vmScene.children[0], dl];
  gun = new THREE.Group();
  const blk = lam('#1d1e1f'), gry = lam('#3a3c3e'), olv = lam('#4b5320'), gold = lam('#d4a017', { emissive: 0x2a1c00 }), glove = lam('#2b2620'), sleeve = lam('#0d0d0d');
  const add = (m, x, y, z) => { m.position.set(x, y, z); gun.add(m); return m; };
  add(box(2.2, 2.6, 9, blk), 0, 0, 0);
  add(box(2.3, .7, 4.2, gry), 0, 1.6, -.6);
  const barrelMat = lam('#26282a', { emissive: 0x000000 }); gun.userData.barrel = barrelMat;
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, 10, 8), barrelMat); barrel.rotation.x = Math.PI/2; add(barrel, 0, .3, -9);
  add(box(1.5, 1.3, 5.5, gry), 0, 1.1, -6.6);
  const fh = new THREE.Mesh(new THREE.CylinderGeometry(.75, .65, 1.6, 8), blk); fh.rotation.x = Math.PI/2; add(fh, 0, .3, -14.4);
  add(box(1.5, 2.4, 5.4, blk), 0, -.7, 6.4);
  add(box(.6, 2.4, .9, blk), 0, -2.4, 2.4);
  add(box(.5, 1.4, 3.2, gry), 0, 2.5, -2.8);
  add(box(2.8, 3.2, 3.4, olv), -2.5, -2, -.6);
  for (let k=0;k<5;k++){ const r = box(.5, .5, 1.3, gold); r.rotation.x = .5; add(r, -1.6 + k*.32, -.3 + k*.18, -.6); }
  for (const s of [-1, 1]){ const leg = box(.3, .3, 5, blk); leg.rotation.y = s*.08; add(leg, s*.5, -.5, -11); }
  // hands + black sleeves
  add(box(2.2, 2.2, 2.6, glove), .2, -1.6, -6.2);
  const fl = box(2.4, 2.4, 9, sleeve); fl.rotation.set(.3, .45, 0); add(fl, -1.8, -3.4, -2.2);
  add(box(2.2, 2.4, 2.4, glove), .5, -2.4, 2.2);
  const fr = box(2.6, 2.6, 10, sleeve); fr.rotation.set(.5, -.25, 0); add(fr, 1.8, -4.8, 7.2);
  muzzle = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), new THREE.MeshBasicMaterial({ map: starTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  muzzle.position.set(0, .3, -16.4); gun.add(muzzle);
  gun.scale.setScalar(.55); gun.position.set(4.2, -4.4, -12); vmScene.add(gun);
  dash = new THREE.Group();
  const dm = box(60, 5, 12, lam('#18191b')); dm.position.set(0, -10.5, -13); dash.add(dm);
  const gauge = new THREE.Mesh(new THREE.CircleGeometry(2.6, 24), new THREE.MeshBasicMaterial({ color: 0x0f2a18 })); gauge.position.set(-5.5, -7.6, -12.5); gauge.rotation.x = -.35; dash.add(gauge);
  wheel = new THREE.Mesh(new THREE.TorusGeometry(4.2, .55, 8, 28), lam('#101010')); wheel.position.set(-5.5, -7.2, -9.5); wheel.rotation.x = -.45; dash.add(wheel);
  const spoke = box(8, .6, .6, lam('#1b1b1b')); wheel.add(spoke); const hub = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, .8, 12), lam('#1b1b1b')); hub.rotation.x = Math.PI/2; wheel.add(hub);
  // Cockpit furnishings use the view-model camera, so they remain readable in first person.
  const trim=lam('#647078'),accent=new THREE.MeshStandardMaterial({color:'#353c41',roughness:.45,metalness:.35});dash.userData.accent=accent;
  const part=(w,h,d,x,y,z,mat)=>{const o=box(w,h,d,mat);o.position.set(x,y,z);dash.add(o);return o;};
  part(18,.4,.6,0,-7.9,-13,accent);
  for(const x of [-18,10,18]){part(4,1.7,.6,x,-8.4,-12.1,trim);for(let j=0;j<4;j++)part(3,.12,.3,x,-8.9+j*.35,-11.6,lam('#111719'));}
  const cluster=new THREE.Group();cluster.position.set(-5.5,-7.8,-11.7);cluster.rotation.x=-.35;dash.add(cluster);
  const needles=[];
  for(const x of [-2.1,2.1]){
    const dial=new THREE.Mesh(new THREE.CircleGeometry(1.6,24),new THREE.MeshBasicMaterial({color:'#18232a'}));dial.position.x=x;cluster.add(dial);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(1.65,.12,6,24),trim);rim.position.x=x;cluster.add(rim);
    for(let i=0;i<10;i++){const a=-.8+i*.48,tick=box(.12,.28,.1,lam('#d6dfd8'));tick.position.set(x+Math.sin(a)*1.25,Math.cos(a)*1.25,.12);tick.rotation.z=-a;cluster.add(tick);}
    const n=box(.08,1.2,.12,lam('#e19d51'));n.geometry.translate(0,.5,0);n.position.set(x,0,.2);cluster.add(n);needles.push(n);
  }
  dash.userData.needles=needles;
  part(5.5,3,.5,3,-8.2,-11.4,lam('#151d23'));part(4.5,2,.1,3,-8.2,-11.05,new THREE.MeshBasicMaterial({color:'#426c76'}));
  for(const x of [1.7,4.3]){const knob=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.4,10),trim);knob.rotation.x=Math.PI/2;knob.position.set(x,-10,-10.8);dash.add(knob);}
  part(.5,2,.5,3,-12,-8,trim);part(1,.5,1,3,-11,-8,lam('#232a2e'));
  part(9,2,.5,0,5,-18,lam('#253036'));part(7.5,1.3,.1,0,5,-17.7,lam('#9caeae'));
  vmScene.add(dash);
}

// ---------- Input: look ----------
function turnView(dx, dy){
  if (state!=='play' || !player || player.dead || typeof wheelOpen!=='undefined'&&wheelOpen) return;
  if (player.car){ view.look = clamp(view.look + dx, -2.4, 2.4); view.lookIdle = 0; }
  else view.yaw += dx;
  view.pitch = clamp(view.pitch - dy, -.75, .6);
}
cv.addEventListener('mousemove', e => {
  const dx = e.movementX || 0, dy = e.movementY || 0;
  if (Math.abs(dx) > 250 || Math.abs(dy) > 250) return;
  turnView(dx * .0032, dy * .0026);
});
let lookTouch = null;
cv.addEventListener('touchstart', e => { for (const t of e.changedTouches){ if (!lookTouch) lookTouch = { id: t.identifier, x: t.clientX, y: t.clientY }; } e.preventDefault(); }, { passive: false });
cv.addEventListener('touchmove', e => { for (const t of e.changedTouches){ if (lookTouch && t.identifier===lookTouch.id){ turnView((t.clientX - lookTouch.x) * .0065, (t.clientY - lookTouch.y) * .005); lookTouch.x = t.clientX; lookTouch.y = t.clientY; } } e.preventDefault(); }, { passive: false });
const endTouch = e => { for (const t of e.changedTouches) if (lookTouch && t.identifier===lookTouch.id) lookTouch = null; };
cv.addEventListener('touchend', endTouch); cv.addEventListener('touchcancel', endTouch);
addEventListener('keydown', e => { const k = e.key.toLowerCase(); if (k==='c' && state==='play' && player && player.car){ view.chase = !view.chase; toast(view.chase ? 'CHASE CAMERA' : 'COCKPIT CAMERA'); } });

function viewAim(){ const p = player; return p.car ? p.car.a + view.look : view.yaw; }
function assistAim(ox, oy, aim, cone){
  let best = null, bs = cone;
  const consider = (x, y, r) => { const d = dist(ox, oy, x, y); if (d > 560) return; const da = Math.abs(angDiff(aim, Math.atan2(y - oy, x - ox))) - Math.atan2(r, d); if (da < bs){ bs = da; best = Math.atan2(y - oy, x - ox); } };
  for (const z of zombies) if (z.alive) consider(z.x, z.y, z.r);
  if (boss && !boss.dead) consider(boss.x, boss.y, boss.r);
  return best == null ? aim : best;
}

// ---------- Per-frame view logic ----------
function viewTick(){
  const p = player; if (!p) return;
  if (p !== view.lastPlayer){ view.lastPlayer = p; view.pitch = 0; view.look = 0; const m = mission && mission.start; view.yaw = m ? Math.atan2(m.y - p.y, m.x - p.x) : Math.PI/2; }
  if (p.car !== view.lastCar){ if (p.car) view.look = 0; else if (view.lastCar) view.yaw = view.lastCar.a + view.look; view.lastCar = p.car; }
  if (state!=='play' || p.dead) return;
  if (!p.car){
    if (keys['arrowleft']) view.yaw -= .045; if (keys['arrowright']) view.yaw += .045;
    if (!view.locked && frame - mouse.moved < 120 && mouse.y > SH*.18 && mouse.y < SH*.8 && !('ontouchstart' in window)){
      if (mouse.x < SW*.05) view.yaw -= .03; else if (mouse.x > SW*.95) view.yaw += .03;
    }
  } else { view.lookIdle++; if (view.lookIdle > 90 && !mouse.down) view.look *= .93; }
}

// ---------- Camera ----------
function placeCamera(){
  const p = player;
  let ex, ey, ez, yaw, pitch = view.pitch, roll = 0;
  if (state==='menu' || !p){
    const t = frame * .0016; ex = WORLD/2 + Math.cos(t) * 900; ez = WORLD/2 + Math.sin(t) * 900; ey = 260; yaw = t + Math.PI + .35; pitch = -.32;
  } else if (p.car && !view.chase){
    const c = p.car, m = carMeshes.get(c), top = m ? m.userData.top : 11, L = c.spec.len, W = c.spec.wid;
    const tall = c.type==='truck' || c.type==='mtvr';
    yaw = c.a + view.look;
    ex = c.x + Math.cos(c.a) * (tall ? L*.32 : -L*.02) + Math.cos(c.a - Math.PI/2) * W*.2;
    ez = c.y + Math.sin(c.a) * (tall ? L*.32 : -L*.02) + Math.sin(c.a - Math.PI/2) * W*.2;
    ey = top + (tall ? 9 : c.type==='van' ? -2.5 : 4.6) + (c.z || 0);
  } else if (p.car){
    const c = p.car; yaw = c.a + view.look; ex = c.x - Math.cos(yaw) * 95; ez = c.y - Math.sin(yaw) * 95; ey = 42 + (c.z || 0); pitch = -.2 + view.pitch * .4;
  } else {
    yaw = view.yaw; ex = p.x; ez = p.y;
    const moving = Math.hypot(p.vx, p.vy) > .4;
    ey = EYE + (moving ? Math.abs(Math.sin(p.anim * .5)) * 1.1 : 0);
    if (p.dead){ view.deadT = Math.min(1, view.deadT + .02); ey = EYE - view.deadT * 13; roll = view.deadT * .9; pitch = view.pitch * (1 - view.deadT) - view.deadT * .15; }
    else view.deadT = 0;
  }
  if (shake){ ex += rnd(-shake, shake) * .25; ey += rnd(-shake, shake) * .15; ez += rnd(-shake, shake) * .25; }
  camera.position.set(ex, ey, ez);
  camera.lookAt(ex + Math.cos(yaw) * Math.cos(pitch), ey + Math.sin(pitch), ez + Math.sin(yaw) * Math.cos(pitch));
  if (roll) camera.rotateZ(roll);
  return yaw;
}

// ---------- Lighting modes ----------
function applyLightMode(){
  const mode = state==='menu' ? 'dusk' : isNight() ? 'night' : isDusk() ? 'dusk' : 'day';
  if (mode===lightMode) return; lightMode = mode;
  const S = { day:{ sky:0xa9c2d4, fog:[260, 1150], hemi:.95, sun:.85, sunC:0xfff1d8, win:0 }, dusk:{ sky:0xd08a6a, fog:[200, 1000], hemi:.7, sun:.7, sunC:0xffa060, win:.35 }, night:{ sky:0x0b1222, fog:[90, 720], hemi:.16, sun:.12, sunC:0x8aa0ff, win:1 } }[mode];
  scene.background = new THREE.Color(S.sky); scene.fog.color.set(S.sky); scene.fog.near = S.fog[0]; scene.fog.far = S.fog[1];
  hemi.intensity = S.hemi; sun.intensity = S.sun; sun.color.set(S.sunC);
  if (mode==='dusk') hemi.color.set(0xffc0a0); else if (mode==='night') hemi.color.set(0x6a7aa0); else hemi.color.set(0xdfe8f0);
  for (const m of facadeMats.values()) m.emissive.setRGB(S.win, S.win * .8, S.win * .5);
  MAT.lamp.color.set(mode==='day' ? 0x8a8a80 : 0xffe2a0);
  if (lampPools) lampPools.visible = mode!=='day';
  const vl = vmScene.userData.lights; vl[0].intensity = mode==='night' ? .45 : .9; vl[1].intensity = mode==='night' ? .25 : .6;
}

// ---------- Sync dynamic objects ----------
const _c = new THREE.Color();
function syncDynamic(){
  const p = player, camP = camera.position, far = window.level29Downtown?.ride?1200:isNight()?470:600;
  syncCars();
  // zombies
  zPool.begin();
  for (const z of zombies){
    if (!z.alive || window.level29MobileHordeSelection?.has(z) || dist(z.x, z.y, camP.x, camP.z) > far) continue;
    const [m, fresh] = zPool.get(z), u = m.userData;
    if (fresh){
      const skin = z.type==='runner' ? '#a3bc6c' : z.type==='brute' ? '#6f8a58' : '#86a46e';
      setFigureColors(m, skin, z.shirt, z.military ? CAMO[0] : '#2e3a52');
      u.helmet.visible = z.military && z.v < .5; u.hair.visible = !u.helmet.visible;
      u.hair.scale.set(1, 1, 1); u.hair.position.set(0, 20.4, 0);
      if (z.fem && !u.helmet.visible){ u.longHair.visible = true; u.hair.material.color.set(['#2a1a10','#6a3a1a','#c8a050','#151515'][Math.floor(z.v*4)]); } else { u.longHair.visible = false; u.hair.material.color.set('#3a2a1a'); }
      m.scale.setScalar(z.type==='brute' ? 1.6 : z.type==='runner' ? .95 : 1);
      u.eyes.visible = true;
    }
    m.scale.setScalar(z.storyScale||(z.type==='brute'?1.6:z.type==='runner'?.95:1));
    poseFigure(m, z.x, z.y, z.a, z.anim, 'zombie');
    if (z.type==='runner') u.body.rotation.z = -.35;
    u.shirt.emissive.setRGB(z.flash > 0 ? .9 : 0, z.flash > 0 ? .9 : 0, z.flash > 0 ? .9 : 0);
    u.skin.emissive.setRGB(z.flash > 0 ? .6 : 0, z.flash > 0 ? .6 : 0, z.flash > 0 ? .6 : 0);
  }
  zPool.end();
  // corpses
  cPool.begin();
  for (const q of parts){
    if (q.k!=='corpse' || q.isPlayer || dist(q.x, q.y, camP.x, camP.z) > far * .7) continue;
    const [m, fresh] = cPool.get(q), u = m.userData;
    if (fresh){ setFigureColors(m, '#7a9460', q.shirt, q.military ? CAMO[0] : '#2e3a52'); m.scale.setScalar((q.r || 10) / 10); u.eyes.visible = false; u.helmet.visible = false; u.legL.rotation.z = .2; u.legR.rotation.z = -.1; u.armL.rotation.z = 2.6; u.armR.rotation.z = 2.2; }
    m.position.set(q.x, 2.3, q.y); m.rotation.set(0, -(q.a + 1.2), 0); u.body.rotation.set(0, 0, -Math.PI/2); u.body.position.y = 0;
    if (q.t < 60) m.position.y = 2.3 - (60 - q.t) * .08;
  }
  cPool.end();
  // survivors
  sPool.begin();
  for (const s of survivors){
    if (s.inCar) continue;
    const [m, fresh] = sPool.get(s);
    if (fresh){ setFigureColors(m, '#d9a37a', s.shirt, '#2b3a5a'); m.userData.eyes && (m.userData.eyes.visible = false); m.userData.helmet.visible = false; }
    const fa = s.following ? Math.atan2(p.y - s.y, p.x - s.x) : Math.atan2(camP.z - s.y, camP.x - s.x);
    poseFigure(m, s.x, s.y, fa, s.following ? s.anim : 0, s.following ? 'walk' : 'wave');
  }
  sPool.end();
  // boss
  if (boss && !(boss.dead && boss.deadT > 120)){
    if (!bossMesh || bossMesh.userData.spec !== boss.spec){ if (bossMesh) scene.remove(bossMesh); bossMesh = makeBoss(boss.spec); bossMesh.userData.spec = boss.spec; }
    bossMesh.visible = true;
    poseFigure(bossMesh, boss.x, boss.y, boss.a, boss.anim * 2, 'zombie');
    const u = bossMesh.userData, fl = boss.flash > 0 ? .8 : 0; u.shirt.emissive.setRGB(fl, fl, fl); u.skin.emissive.setRGB(fl, fl * .3, fl * .3);
    if (boss.mode==='spit') u.armL.rotation.z = u.armR.rotation.z = Math.PI/2 + .6;
    if (boss.mode==='slam' && boss.t > 10) u.armL.rotation.z = u.armR.rotation.z = Math.PI - .2;
    if (boss.dead){ bossMesh.rotation.set(0, -boss.a, 0); u.body.rotation.z = -Math.min(Math.PI/2, boss.deadT * .05); bossMesh.position.y = -boss.deadT * .05; }
    const tele = bossFx.getObjectByName('tele'), slam = bossFx.getObjectByName('slam');
    bossFx.position.set(boss.x, 0, boss.y); bossFx.rotation.y = -boss.a;
    tele.visible = !boss.dead && boss.mode==='charge' && boss.t > 45;
    slam.visible = !boss.dead && boss.mode==='slam' && boss.t > 10; slam.material.opacity = .35 + .3 * Math.sin(frame * .5);
  } else { if (bossMesh) bossMesh.visible = false; bossFx.getObjectByName('tele').visible = false; bossFx.getObjectByName('slam').visible = false; }
  // pickups
  kPool.begin();
  for (const k of pickups){
    const [m, fresh] = kPool.get(k), mm = m.userData.m, P = PICK[k.kind] || PICK.cash;
    if (fresh){ if(m.userData.healthCross)m.userData.healthCross.visible=k.kind==='health'; mm.visible=k.kind!=='health'&&!(m.userData.cashStack&&k.kind==='cash');if(m.userData.cashStack)m.userData.cashStack.visible=k.kind==='cash'; mm.material.color.set(P[0]); mm.material.emissive.setHex(P[1]); mm.scale.setScalar(k.kind==='crate' ? 2.2 : k.kind==='power' ? 1.6 : 1); }
    m.position.set(k.x, (k.kind==='cash' ? 2.3 : k.kind==='crate' ? 9 : 8) + Math.sin(frame * .08 + k.x) * 1.5, k.y); m.rotation.y = k.kind==='cash' ? k.x*.017 : frame * .03;
  }
  kPool.end();
  // bullets
  const bp = bulletLines.geometry.attributes.position.array; let n = 0;
  const by = p && p.car ? 12 : 13;
  for (const b of bullets){ if (n >= 600) break; const o = n * 6; bp[o] = b.x; bp[o+1] = by; bp[o+2] = b.y; bp[o+3] = b.x - b.vx * 1.6; bp[o+4] = by; bp[o+5] = b.y - b.vy * 1.6; n++; }
  bulletLines.geometry.setDrawRange(0, n * 2); bulletLines.geometry.attributes.position.needsUpdate = true;
  // spits
  let si = 0; for (const s of spits){ if (si >= 80) break; _dm.position.set(s.x, 12, s.y); _dm.rotation.set(0, 0, 0); _dm.scale.set(1, 1, 1); _dm.updateMatrix(); spitMesh.setMatrixAt(si++, _dm.matrix); }
  spitMesh.count = si; spitMesh.instanceMatrix.needsUpdate = true;
  // particles
  const fill = (pts, list, fn) => { const pa = pts.geometry.attributes.position.array, ca = pts.geometry.attributes.color.array, max = pa.length / 3; let i = 0; for (const q of list){ if (i >= max) break; if (fn(q, pa, ca, i)) i++; } pts.geometry.setDrawRange(0, i); pts.geometry.attributes.position.needsUpdate = true; pts.geometry.attributes.color.needsUpdate = true; };
  fill(ptsSmall, parts, (q, pa, ca, i) => {
    let y, c;
    if (q.k==='gore'){ y = 1 + q.t * .3; c = q.c; } else if (q.k==='shell'){ y = 6 + q.t * .1; c = '#d4a017'; } else if (q.k==='spark'){ y = 10; c = '#fff3a0'; } else return false;
    pa[i*3] = q.x; pa[i*3+1] = y; pa[i*3+2] = q.y; _c.set(c); ca[i*3] = _c.r; ca[i*3+1] = _c.g; ca[i*3+2] = _c.b; return true; });
  fill(ptsFire, parts, (q, pa, ca, i) => { if (q.k!=='fire') return false; pa[i*3] = q.x; pa[i*3+1] = 4 + (45 - q.t) * .45; pa[i*3+2] = q.y; _c.set(q.t > 20 ? '#ffd23a' : '#ff6a1a'); const a = Math.min(1, q.t / 20); ca[i*3] = _c.r*a; ca[i*3+1] = _c.g*a; ca[i*3+2] = _c.b*a; return true; });
  fill(ptsSmoke, parts, (q, pa, ca, i) => { if (q.k!=='smoke') return false; pa[i*3] = q.x; pa[i*3+1] = 12 + (50 - q.t) * .9; pa[i*3+2] = q.y; ca[i*3] = ca[i*3+1] = ca[i*3+2] = .28; return true; });
  // explosions
  let bi = 0, bl = 0;
  for (const e of explosions){ if (bi >= boomPool.length) break; const m = boomPool[bi++]; m.visible = true; m.position.set(e.x, e.wave ? 2 : 10, e.y);
    // Fade a blast out when the camera is close to or inside it, so it never fills the whole screen with a flat orange shape.
    const bR = e.wave ? e.r : e.r * .55, bd = Math.hypot(camP.x - e.x, camP.z - e.y), nearFade = Math.max(.06, Math.min(1, (bd - bR * .5) / (bR * 1.4)));
    if (e.wave){ m.scale.set(e.r, 3, e.r); m.material.color.set(0xdcc88c); m.material.opacity = e.t / 30 * .4 * nearFade; } else { m.scale.setScalar(bR); m.material.color.setHex(e.t > 18 ? 0xffb347 : e.t > 9 ? 0xe2661f : 0x8a2f12); m.material.opacity = Math.min(.55, e.t / 28) * nearFade; bl = Math.max(bl, e.t / 28); boomLight.position.set(e.x, 40, e.y); } }
  for (; bi < boomPool.length; bi++) boomPool[bi].visible = false;
  boomLight.intensity = bl * 3;
  // mission marker
  const tg = mission ? missionTarget() : null;
  markerMesh.visible = !!tg && state!=='menu' && dist(camP.x, camP.z, tg.x, tg.y) > (mission && mission.phase==='start' ? 260 : 40); markerRing.visible = false;
  if (tg && markerMesh.visible){
    markerMesh.position.set(tg.x, 35 + Math.sin(frame * .06) * 2, tg.y); markerMesh.material.color.set(tg.col);
    const sc = 1 + Math.sin(frame * .1) * .06; markerMesh.scale.set(sc, 1, sc);
    if (tg.zone){ markerRing.visible = true; markerRing.position.set(tg.x, .6, tg.y); markerRing.scale.set(tg.zone, tg.zone, tg.zone); markerRing.material.color.set(tg.col); }
  }
  safeMarker.visible = state!=='menu' && !!city && dist(camP.x, camP.z, city.safe.x, city.safe.y) > 70; if (city) {const privateHome=city.safe===city.mansion;safeMarker.scale.set(1,privateHome?.025:1,1);safeMarker.position.set(city.safe.x,privateHome?.6:20,city.safe.y);}
}

// ---------- Lights that follow the player ----------
function syncLights(yaw){
  const p = player, night = isNight() && state!=='menu';
  // Transparent pools are an instance batch: the GPU cannot cull individual distant quads.
  if(lampPools&&window.level29StreetLighting){const cp=camera.position,q=window.level29Graphics?.quality||'low',key=[Math.floor(cp.x/32),Math.floor(cp.z/32),q,lightMode].join(':');if(lampPools.userData.lastSelection!==key){lampPools.userData.lastSelection=key;const points=lightMode==='day'?[]:level29StreetLighting.nearbyPools(lampPools.userData.lampPoints||[],cp.x,cp.z,q),m=new THREE.Matrix4(),r=new THREE.Quaternion(),scale=new THREE.Vector3(170,1,170),pos=new THREE.Vector3();points.forEach(([x,z],i)=>{pos.set(x+12,.7,z+12);m.compose(pos,r,scale);lampPools.setMatrixAt(i,m);});lampPools.count=points.length;lampPools.instanceMatrix.needsUpdate=true;}}

  const cp = camera.position, dir = new THREE.Vector3(); camera.getWorldDirection(dir);
  flash.intensity = night && p && !p.car && !p.dead ? 2.4 : 0;
  flash.position.copy(cp).addScaledVector(dir, -2); flash.position.y -= 2; flash.target.position.copy(cp).addScaledVector(dir, 100);
  if (night && p && p.car && !p.car.dead){ const c = p.car; headL.intensity = 2.6; headL.position.set(c.x + Math.cos(c.a) * c.spec.len * .5, 10, c.y + Math.sin(c.a) * c.spec.len * .5); headL.target.position.set(c.x + Math.cos(c.a) * 300, 0, c.y + Math.sin(c.a) * 300); }
  else headL.intensity = (isDusk() && p && p.car) ? .8 : 0;
  muzzleLight.intensity = p && p.flash > 0 ? 1.6 : 0; muzzleLight.position.copy(cp).addScaledVector(dir, 22);
}

// ---------- View model update ----------
function syncViewModel(){
  const p = player, show = state!=='menu' && p && !p.dead;
  const inCar = show && p.car;
  gun.visible = !!(show) && (!inCar || (mouse.down || keys['f'] || keys['j'] || touch.shoot)) && !view.chase && (typeof curW === 'undefined' || curW === 'm240' || (!!inCar && curW === 'bat'));
  dash.visible = !!inCar && !view.chase;
  if(inCar){const ratio=Math.min(1,Math.abs(p.car.v||0)/(p.car.spec.max||6));for(const [i,n]of (dash.userData.needles||[]).entries())n.rotation.z=2.1-ratio*(i?3.8:4.2);if(dash.userData.accent)dash.userData.accent.color.set(window.level29Trading?.color||'#353c41');}
  if (!show) return;
  if (p.flash > 0 && p.flash === 3){ view.kick = 1; }
  view.kick *= .72;
  const moving = !p.car && Math.hypot(p.vx, p.vy) > .4, sprint = moving && keys['shift'];
  const bobX = moving ? Math.sin(p.anim * .5) * .35 : 0, bobY = moving ? -Math.abs(Math.cos(p.anim * .5)) * .3 : 0;
  gun.position.set((inCar ? 3.2 : 4.2) + bobX, (inCar ? -3.8 : -4.4) + bobY - (sprint ? 1 : 0), -12 + view.kick * .8);
  gun.rotation.set(view.kick * .07 + (sprint ? -.25 : 0), (sprint ? .35 : 0), 0);
  gun.userData.barrel.emissive.setRGB(Math.pow(p.heat / 100, 2) * .9, Math.pow(p.heat / 100, 3) * .2, 0);
  muzzle.visible = p.flash > 0; muzzle.rotation.z = Math.random() * 7; muzzle.scale.setScalar(.8 + Math.random() * .6);
  if (inCar){ const st = (kR() ? 1 : 0) - (kL() ? 1 : 0); wheel.rotation.z += (-st * 1.6 - wheel.rotation.z) * .15; dash.rotation.y = -view.look; }
}

// ---------- Main render ----------
function render(){
  if (!renderer) initGL();
  if (city && city !== builtCity) buildCity();
  applyLightMode();
  viewTick();
  const yaw = placeCamera();
  syncDynamic();
  syncLights(yaw);
  syncViewModel();
  document.getElementById('gl').style.filter = state==='dead' ? 'grayscale(1) contrast(1.1)' : '';
  renderer.info.reset(); renderer.clear(); if(window.level29Cinematic)level29Cinematic.drawWorld();else renderer.render(scene, camera);
  renderer.clearDepth(); renderer.render(vmScene, vmCam);
  if (view.hit > 0) view.hit--;
  cx.setTransform(DPR, 0, 0, DPR, 0, 0); cx.clearRect(0, 0, SW, SH);
  if(state==='play'&&player&&!player.dead&&!player.car&&zombies.some(z=>z.alive&&z.windup!==undefined)){cx.save();cx.strokeStyle='#efbe62';cx.lineWidth=3;cx.strokeRect(SW/2-20,SH/2-20,40,40);cx.restore();}
  if (state!=='menu' && player) drawHUD();
}

// ---------- First-person HUD layer (called from drawHUD) ----------
function project(x, y, h){ const v = new THREE.Vector3(x, h, y).project(camera); if (v.z > 1 || v.z < -1) return null; return { x: (v.x + 1) / 2 * SW, y: (1 - v.y) / 2 * SH }; }
function fpHUD(small){
  const p = player;
  // damage vignette
  // Track real HP loss: spawn/elevator protection also sets p.inv and must not tint the screen.
  if (p._lastHp != null && p.hp < p._lastHp) p._hurtFlash = 24;
  p._lastHp = p.hp;
  if (p._hurtFlash > 0) p._hurtFlash--;
  if ((p._hurtFlash > 0 || p.hp < 30) && !p.dead){
    const a = p._hurtFlash > 0 ? p._hurtFlash / 24 * .55 : (.18 + Math.sin(frame * .15) * .1);
    const g = cx.createRadialGradient(SW/2, SH/2, Math.min(SW, SH) * .3, SW/2, SH/2, Math.max(SW, SH) * .7);
    g.addColorStop(0, 'rgba(160,0,0,0)'); g.addColorStop(1, 'rgba(160,0,0,' + a + ')'); cx.fillStyle = g; cx.fillRect(0, 0, SW, SH);
  }
  // crosshair
  if (!p.dead && (!p.car || view.chase || mouse.down || keys['f'] || touch.shoot)){
    const firing = frame - lastShotFrame < 6, gap = 5 + (firing ? 5 : 0) + (p.car ? 3 : 0), L = 7;
    let cxp = SW/2, cyp = SH/2;
    if (p.car && view.chase){ const pr = project(p.car.x + Math.cos(p.aim) * 300, p.car.y + Math.sin(p.aim) * 300, 12); if (pr){ cxp = pr.x; cyp = pr.y; } }
    cx.lineWidth = 2; cx.strokeStyle = 'rgba(0,0,0,.6)';
    const lines = () => { cx.beginPath(); cx.moveTo(cxp - gap - L, cyp); cx.lineTo(cxp - gap, cyp); cx.moveTo(cxp + gap, cyp); cx.lineTo(cxp + gap + L, cyp); cx.moveTo(cxp, cyp - gap - L); cx.lineTo(cxp, cyp - gap); cx.moveTo(cxp, cyp + gap); cx.lineTo(cxp, cyp + gap + L); cx.stroke(); };
    cx.lineWidth = 4; lines(); cx.lineWidth = 2; cx.strokeStyle = p.overheat ? '#ff7a4a' : '#f6f3e6'; lines();
    cx.fillStyle = '#f6f3e6'; cx.fillRect(cxp - 1, cyp - 1, 2, 2);
    if (view.hit > 0){ cx.strokeStyle = 'rgba(255,90,74,' + (view.hit / 7) + ')'; cx.lineWidth = 2.5; cx.beginPath(); for (const [sx, sy] of [[-1,-1],[1,-1],[-1,1],[1,1]]){ cx.moveTo(cxp + sx*6, cyp + sy*6); cx.lineTo(cxp + sx*13, cyp + sy*13); } cx.stroke(); }
  }
  // world marker label
  const tg = missionTarget();
  const ox = p.car ? p.car.x : p.x, oy = p.car ? p.car.y : p.y;
  if (tg){
    const pr = project(tg.x, tg.y, 82), d = dist(ox, oy, tg.x, tg.y);
    if (pr && pr.x > 0 && pr.x < SW && pr.y > 0 && pr.y < SH){
      const bob = Math.sin(frame * .1) * 3;
      cx.save(); cx.translate(pr.x, pr.y + bob);
      cx.fillStyle = tg.col; cx.beginPath(); cx.moveTo(0, -14); cx.lineTo(12, 0); cx.lineTo(0, 14); cx.lineTo(-12, 0); cx.closePath(); cx.fill();
      cx.fillStyle = '#13191d'; cx.font = "900 14px 'Barlow Condensed'"; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(tg.label, 0, 1);
      cx.restore();
      hudText(Math.round(d / 10) + ' M', pr.x, pr.y + bob + 18, 13, tg.col, 'center', '700 ');
    }
  }
  // compass
  const CW = small ? 190 : 380, CX = SW/2, CY = small ? SH - 34 : 14, range = 1.9, yaw = p.car ? p.car.a + view.look : view.yaw;
  cx.fillStyle = 'rgba(0,0,0,.45)'; cx.fillRect(CX - CW/2, CY, CW, 26);
  cx.save(); cx.beginPath(); cx.rect(CX - CW/2, CY, CW, 26); cx.clip();
  const pos = a => CX + angDiff(yaw, a) / (range / 2) * (CW / 2);
  for (let k=0;k<24;k++){ const a = -Math.PI/2 + k * Math.PI/12, x = pos(a); cx.fillStyle = 'rgba(246,243,230,.5)'; cx.fillRect(x - .5, CY + 19, 1, k % 2 ? 4 : 6); }
  [['N', -Math.PI/2], ['E', 0], ['S', Math.PI/2], ['W', Math.PI], ['NE', -Math.PI/4], ['SE', Math.PI/4], ['SW', Math.PI*.75], ['NW', -Math.PI*.75]].forEach(([t, a]) => hudText(t, pos(a), CY + 2, t.length > 1 ? 11 : 15, t==='N' ? '#f4c355' : '#f6f3e6', 'center', '800 '));
  const blipC = (x, y, col, label) => { const a = Math.atan2(y - oy, x - ox), d = angDiff(yaw, a), bx = Math.abs(d) < range/2 ? pos(a) : CX + Math.sign(d) * (CW/2 - 8); blip(bx, CY + 13, col, label); };
  if (city) blipC(city.safe.x, city.safe.y, '#3cc86e', 'S');
  if (tg) blipC(tg.x, tg.y, tg.col, tg.label);
  cx.restore();
  cx.fillStyle = '#f4c355'; cx.beginPath(); cx.moveTo(CX - 5, CY + 26); cx.lineTo(CX + 5, CY + 26); cx.lineTo(CX, CY + 21); cx.fill();
  if (tg && !small) hudText(Math.round(dist(ox, oy, tg.x, tg.y) / 10) + ' M', CX, CY + 30, 12, tg.col, 'center', '700 ');
  // jester portrait by the minimap (desktop)
  if (!small && headImg.complete && headImg.naturalWidth){
    const X = 18, Y = SH - 18 - 180 - 70;
    cx.fillStyle = 'rgba(0,0,0,.6)'; cx.fillRect(X - 4, Y - 4, 64, 64);
    cx.drawImage(head, X + 4, Y, 50, 56);
    if (p.inv > 0 && p.inv <= 40){ cx.fillStyle = 'rgba(255,40,40,' + Math.min(.5, p.inv / 80) + ')'; cx.fillRect(X - 4, Y - 4, 64, 64); }
    hudText(Math.max(0, Math.ceil(p.hp)) + '', X + 70, Y + 6, 30, p.hp < 30 ? '#ff6a6a' : '#f6f3e6', 'left', '900 ');
    hudText('HEALTH', X + 70, Y + 38, 11, '#9caab2', 'left', '700 ');
  }
  // interaction prompt
  if (!p.car && !p.dead && state==='play'){
    let best = null, bd = 56;
    for (const c of cars){ if (c.dead || c.burnT) continue; const d = dist(p.x, p.y, c.x, c.y); if (d < bd){ bd = d; best = c; } }
    if (best){ const t = ('ontouchstart' in window ? 'RIDE' : '[E]') + '  ENTER ' + best.spec.name; cx.font = "800 18px 'Barlow Condensed'"; const w = cx.measureText(t).width + 28; cx.fillStyle = 'rgba(0,0,0,.6)'; cx.fillRect(SW/2 - w/2, SH * .62, w, 30); hudText(t, SW/2, SH * .62 + 5, 18, '#f4c355', 'center'); }
  }
  if (p.car && !small) hudText((view.chase ? 'C  COCKPIT VIEW' : 'C  CHASE VIEW') + '   ·   R  RADIO   ·   H  HORN', SW/2, SH - 28, 12, 'rgba(246,243,230,.6)', 'center', '600 ');
}
