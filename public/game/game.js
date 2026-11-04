'use strict';
// =====================================================================
// LEVEL 29 · BLOOD IN THE BAYOU — first-person open-world zombie action
// Simulation runs on a 2D grid (x,y); fp.js renders it in 3D (x, height, y).
// =====================================================================
const cv = document.getElementById('c'), cx = cv.getContext('2d');
let SW = 0, SH = 0, DPR = 1;
function resize(){
  DPR = Math.min(1.5, window.devicePixelRatio || 1);
  SW = innerWidth; SH = innerHeight;
  cv.width = Math.round(SW * DPR); cv.height = Math.round(SH * DPR);
}
addEventListener('resize', resize); resize();
const head = new Image(); head.crossOrigin = 'anonymous'; head.src = 'head.png';

const TILE = 32;
let MW = 80, MH = 80, WORLD = MW * TILE, GS = 1;
const WORLD_ZONES = {
  quarter:{ roofs:['#c98f86','#d8c27a','#78aaa3','#a790c7','#d79b6b','#8fb07b'], hMin:24, hMax:58, cars:['sedan','pickup','taxi','van'] },
  marina:{ roofs:['#e9e4d8','#b8cfd8','#d8d0c0','#9fb7c4'], hMin:30, hMax:70, cars:['sports','convertible','sedan'] },
  hollywood:{ roofs:['#e7dccb','#cfc2b0','#d7a7b4','#a9c4d8','#efe2b9'], hMin:18, hMax:52, cars:['sports','lowrider','convertible','sedan'] },
  downtown:{ roofs:['#7c8a96','#9aa4ab','#6c7884','#b4aa98','#a8b3ba'], hMin:40, hMax:100, cars:['sedan','taxi','van','police'] },
  base:{ roofs:['#8a8f78','#9a9c88','#777c66','#a8a58f'], hMin:16, hMax:34, cars:['humvee','mtvr','pickup'] },
  forest:{ roofs:['#8a6f5c','#a08060','#6e5a48'], hMin:14, hMax:26, cars:['pickup','humvee'] },
  mountain:{ roofs:['#9aa1a0','#767e78','#b4aa98'], hMin:14, hMax:26, cars:['pickup','humvee'] },
};
const WORLD_D = { id:'world', name:'LEVEL 29 OPEN WORLD', grass:'#4a6a38', walk:'#9a9a94', roofs:WORLD_ZONES.quarter.roofs, wall:.62,
  v:['SHORE DR','CANAL ST','BOURBON ST','SUNSET BLVD','VINE ST','TRAVIS ST','MAIN ST','TRAINING RD','PINE RIDGE RD','EAST GATE RD'],
  h:['HARBOR BLVD','MARINA WAY','ROYAL ST','HOLLYWOOD BLVD','WASHINGTON AVE','FANNIN ST','DEPOT RD','FOREST TRAIL','SUMMIT PASS','SOUTH RIDGE RD'],
  cars:['sedan','pickup','taxi','sports','van','convertible','lowrider'], hMin:22, hMax:60 };
const WORLD_ROADS = [3,17,31,45,59,73,87,101,115,129], WORLD_SIZE = 136, GULF_X = 40;
function worldZoneAtTile(tx, ty){ const bx = Math.floor((tx - 3) / 14), by = Math.floor((ty - 3) / 14); return worldZoneKey(clamp(bx, 0, 8), clamp(by, 0, 8)); }
function worldZoneKey(bx, by){
  if (bx < 3) return 'gulf';
  if (by >= 7) return 'mountain';
  if (bx >= 7 && by >= 4) return 'forest';
  if (bx >= 7) return 'base';
  if (bx <= 4 && by <= 2) return 'quarter';
  if (bx === 3) return 'marina';
  if (bx <= 6 && by <= 2) return 'hollywood';
  return 'downtown';
}
const T_GRASS=0, T_ROAD=1, T_WALK=2, T_BLD=3, T_WATER=4, T_PARK=5, T_LOT=6, T_SAND=7, T_PLAZA=8, T_BRIDGE=9;
const ROADS = [3, 17, 31, 45, 59, 73];
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const dist = (a, b, c, d) => Math.hypot(a - c, b - d);
let mpRole = null, mpRemotes = []; // multiplayer: null | 'host' | 'client'
const rnd = (a, b) => a + Math.random() * (b - a);
const angDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= 2*Math.PI; while (d < -Math.PI) d += 2*Math.PI; return d; };
const money = n => '$' + String(Math.max(0, Math.floor(n))).padStart(8, '0');

// ---------- Districts ----------
const DISTRICTS = [
  { id:'nola', name:'NEW ORLEANS', grass:'#3f5d35', walk:'#8b8a83', roofs:['#c98f86','#d8c27a','#78aaa3','#a790c7','#d79b6b','#8fb07b','#cfc8b3'], wall:.62,
    v:['CANAL ST','BOURBON ST','ROYAL ST','DECATUR ST','CHARTRES ST','ESPLANADE AVE'], h:['RAMPART ST','ST. CHARLES AVE','FRENCHMEN ST','MAGAZINE ST','TCHOUPITOULAS ST','RIVERFRONT'],
    cars:['sedan','pickup','police','taxi','sedan','van'], hMin:24, hMax:58 },
  { id:'la', name:'LOS ANGELES', grass:'#5b6b38', walk:'#a39f96', roofs:['#e7dccb','#cfc2b0','#d7a7b4','#a9c4d8','#efe2b9','#bfb7aa'], wall:.66,
    v:['PACIFIC COAST HWY','LA BREA AVE','HIGHLAND AVE','VINE ST','FAIRFAX AVE','WESTERN AVE'], h:['HOLLYWOOD BLVD','SUNSET BLVD','SANTA MONICA BLVD','MELROSE AVE','WILSHIRE BLVD','VENICE BLVD'],
    cars:['sports','sedan','lowrider','police','convertible','van'], hMin:18, hMax:52 },
  { id:'hou', name:'HOUSTON', grass:'#456b34', walk:'#8f9294', roofs:['#7c8a96','#9aa4ab','#6c7884','#b4aa98','#8a6f5c','#a8b3ba'], wall:.55,
    v:['SHEPHERD DR','KIRBY DR','MONTROSE BLVD','MAIN ST','FANNIN ST','EMANCIPATION AVE'], h:['WASHINGTON AVE','ALLEN PKWY','WESTHEIMER RD','RICHMOND AVE','BISSONNET ST','HOLMAN ST'],
    cars:['pickup','truck','sedan','police','pickup','sports'], hMin:30, hMax:150 },
  { id:'lej', name:'CAMP LEJEUNE', grass:'#4a6334', walk:'#8b877a', roofs:['#8d4b38','#7c4436','#97624f','#6b6f5a','#8a8670'], wall:.6,
    v:['HOLCOMB BLVD','MCHUGH BLVD','BREWSTER BLVD','SNEADS FERRY RD','PIVER RD','ONSLOW BEACH RD'], h:['MAIN GATE RD','STONE ST','FRENCH CREEK RD','MARINE BLVD','DUNCAN ST','RANGE RD'],
    cars:['humvee','mtvr','humvee','pickup','humvee','police'], hMin:22, hMax:46 },
  { id:'pi', name:'PARRIS ISLAND', grass:'#5d6c3e', walk:'#a49e88', roofs:['#d6cdb4','#c6b998','#b8ad94','#cfc6ad','#9b8f73'], wall:.66,
    v:['BLVD DE FRANCE','PANAMA ST','WAKE BLVD','YELLOW FOOTPRINTS','RIFLE RANGE RD','PAGE FIELD RD'], h:['RECEIVING RD','PARADE DECK','CRUCIBLE TRAIL','DRILL FIELD RD','WEAPONS BATTALION','MARSH RD'],
    cars:['humvee','mtvr','humvee','sedan','humvee','pickup'], hMin:18, hMax:40 },
  { id:'forest', name:'FOREST RESERVE', grass:'#36553b', walk:'#827663', roofs:['#566247','#867457'], wall:.6,
    v:['PINE TRAIL','RANGER ROAD','CEDAR TRACK','TIMBER RUN','LAKE ROAD','FOREST EDGE'], h:['SOUTH CAMP','OLD MILL ROAD','RANGER STATION','DEEP WOODS','CREEK ROAD','NORTH CAMP'], cars:['pickup','humvee','sedan','van'], hMin:18, hMax:36 },
  { id:'mountain', name:'LEVEL 29 GARDENS', grass:'#697260', walk:'#8a887b', roofs:['#7b807c','#756752'], wall:.6,
    v:['SUMMIT ROAD','RIDGELINE','QUARRY TRACK','ALPINE WAY','SWITCHBACK','EAST RIDGE'], h:['BASE CAMP','VALLEY ROAD','MOUNTAIN PASS','SUMMIT TRAIL','SNOWLINE','LOOKOUT ROAD'], cars:['pickup','humvee','sports','mtvr'], hMin:18, hMax:38 },
];
const MISSIONS_PER = 30, CAMPAIGN_TOTAL = DISTRICTS.length * MISSIONS_PER, CAMPAIGN_LAST = CAMPAIGN_TOTAL - 1;
const CAR_SPECS = {
  sedan:{name:'SEDAN', len:44, wid:22, max:7.2, acc:.17, grip:.82, hp:100, cols:['#b6302f','#2d5fae','#d5d5d0','#25282c','#708a46','#c39233']},
  pickup:{name:'PICKUP', len:50, wid:25, max:6.7, acc:.15, grip:.8, hp:140, cols:['#3d5f7b','#7b2f2f','#d9d7cf','#2b2e2f','#6b5d43']},
  police:{name:'POLICE CRUISER', len:46, wid:23, max:8.2, acc:.19, grip:.84, hp:130, cols:['#f2f2ef'], police:true},
  taxi:{name:'CAB', len:44, wid:22, max:7, acc:.16, grip:.82, hp:100, cols:['#f0c22e']},
  van:{name:'VAN', len:54, wid:27, max:6, acc:.13, grip:.78, hp:160, cols:['#ddd8cc','#5a6f88','#3c3c42']},
  sports:{name:'SPORTS COUPE', len:44, wid:22, max:9.6, acc:.25, grip:.88, hp:85, cols:['#d82626','#f2c31f','#161616','#1e8a8a']},
  lowrider:{name:'LOWRIDER', len:50, wid:24, max:7, acc:.16, grip:.79, hp:110, cols:['#7d2bb2','#1e7a72','#b8212f']},
  convertible:{name:'CONVERTIBLE', len:44, wid:22, max:8.6, acc:.21, grip:.85, hp:90, cols:['#3a8cd6','#ececec','#e86a1e'], open:true},
  truck:{name:'BOX TRUCK', len:66, wid:28, max:5.6, acc:.11, grip:.76, hp:220, cols:['#ece8de','#3c5b78']},
  humvee:{name:'HUMVEE', len:52, wid:28, max:7.2, acc:.17, grip:.83, hp:220, cols:['#5a6238','#77684a']},
  boat:{name:'SPEEDBOAT', len:64, wid:26, max:8.8, acc:.2, grip:.55, hp:140, cols:['#f2f2ef','#d82626','#2d5fae','#f2c31f'], boat:true},
  yacht:{name:'LUXURY YACHT', len:110, wid:38, max:6.2, acc:.1, grip:.5, hp:300, cols:['#f4f1ea','#1c1f26'], boat:true},
  mtvr:{name:'7-TON TRUCK', len:70, wid:30, max:5.6, acc:.11, grip:.78, hp:320, cols:['#5b6339']},
};
const RADIO = [ ['KRZY 29.9 · BRASS', 'nola'], ['SUNSET WAVE 104', 'la'], ['H-TOWN HEAT 97', 'hou'], ['SEMPER FM', 'lej'], ['RECRUIT RADIO', 'pi'], ['NIGHT SIGNAL', 'title'] ];
const BOSSES = {
  nola:{name:'VOODOO ZOMBIE KING', hat:'tophat', skin:'#7da86a', shirt:'#5a1a7a'},
  la:{name:'SUNSET STRIP STALKER', hat:'shades', skin:'#93b07a', shirt:'#e8e8e8'},
  hou:{name:'BAYOU CITY BRUTE', hat:'cowboy', skin:'#8aa070', shirt:'#a8322a'},
  lej:{name:'THE UNDEAD GUNNY', hat:'helmet', skin:'#7f9a68', shirt:'#4b5320'},
  forest:{name:'THE TIMBER REVENANT', hat:'campaign', skin:'#7c9970', shirt:'#3d563e'},
  mountain:{name:'THE RIDGE WARDEN', hat:'helmet', skin:'#a0acac', shirt:'#727e87'},
  pi:{name:'DRILL INSTRUCTOR Z', hat:'campaign', skin:'#86a26e', shirt:'#c8b58a'},
};
const POWERS = [
  ['rapid','RAPID FIRE'],['armor','BODY ARMOR'],['spread','SPREAD SHOT'],['nitro','NITRO BOOST'],['cool','COOLING KIT'],['ap','ARMOR-PIERCING ROUNDS'],['tough','BULLETPROOF RIDES']
];

// ---------- State ----------
let state = 'menu', distIdx = 0, D = DISTRICTS[0], city = null, groundCv = null, miniCv = null, waterT = 0;
let player, cars = [], zombies = [], bullets = [], spits = [], parts = [], pickups = [], survivors = [], explosions = [], decals = 0;
let camX = 0, camY = 0, zoom = 1.1, shake = 0, frame = 0;
let cash = 0, missionIdx = 0, mission = null, heat = 0, lastShotFrame = -999, radioIdx = 0, showMap = false;
let banner = null, objective = '', areaName = '', areaShow = 0, vehShow = null, msg = null, completed = new Set();
let up = { rapid:0, armor:0, spread:0, nitro:false, cool:0, ap:0, tough:0 };
let boss = null;
const hurried = false;

// ---------- City generation ----------
function isRoadCol(t){ return ROADS.some(r => t >= r && t < r + 3); }
function roadIndex(t){ return ROADS.findIndex(r => t >= r && t < r + 3); }
function genCity(di){
  const isW = di === 'world', d = isW ? WORLD_D : DISTRICTS[di], rng = mkRng((isW ? 9 : di) * 977 + 31), safes = [];
  const g = new Uint8Array(MW * MH), buildings = [], trees = [], parked = [], features = [];
  const set = (x, y, t) => { if (x>=0 && y>=0 && x<MW && y<MH) g[y*MW+x] = t; };
  const get = (x, y) => (x<0||y<0||x>=MW||y>=MH) ? T_WATER : g[y*MW+x];
  g.fill(T_GRASS);
  for (let y=0;y<MH;y++) for (let x=0;x<MW;x++) if (isRoadCol(x) || isRoadCol(y)) set(x, y, T_ROAD);
  // map edge water
  for (let y=0;y<MH;y++) for (let x=0;x<MW;x++) if (x<2 || y<2 || x>=MW-2 || y>=MH-2) set(x, y, T_WATER);
  // sidewalks: ring inside each block
  const blocks = [];
  for (let by=0; by<ROADS.length-1; by++) for (let bx=0; bx<ROADS.length-1; bx++){
    const x0 = ROADS[bx]+3, x1 = ROADS[bx+1]-1, y0 = ROADS[by]+3, y1 = ROADS[by+1]-1;
    for (let y=y0;y<=y1;y++) for (let x=x0;x<=x1;x++) if (x===x0||x===x1||y===y0||y===y1) set(x, y, T_WALK);
    blocks.push({bx, by, x0:x0+1, y0:y0+1, x1:x1-1, y1:y1-1});
  }
  // outer ring sidewalk beyond outermost roads
  for (let y=2;y<MH-2;y++) for (let x=2;x<MW-2;x++) if (get(x,y)===T_GRASS && (x<ROADS[0] || y<ROADS[0] || x>=ROADS[ROADS.length-1]+3 || y>=ROADS[ROADS.length-1]+3)) set(x,y,T_PARK);
  // district water features
  const water = (x, y) => { const t = get(x,y); if (t===T_ROAD) set(x,y, d.id==='hou' ? T_BRIDGE : T_WATER); else set(x,y,T_WATER); };
  if (isW){ for (let y=0;y<MH;y++){ for (let x=0;x<GULF_X;x++) water(x,y); for (let x=GULF_X;x<ROADS[3];x++) if (get(x,y)!==T_ROAD) set(x,y,T_SAND); } }
  if (d.id==='nola'){ for (let y=MH-16;y<MH;y++) for (let x=0;x<MW;x++) water(x,y); for (let y=MH-18;y<MH-16;y++) for (let x=0;x<MW;x++) if (get(x,y)!==T_ROAD) set(x,y,T_PLAZA); }
  if (d.id==='la'){ for (let y=0;y<MH;y++){ for (let x=0;x<=9;x++) water(x,y); for (let x=10;x<=16;x++) if (get(x,y)!==T_ROAD) set(x,y,T_SAND); } }
  if (d.id==='hou'){ for (let x=0;x<MW;x++){ const yy = 38 + Math.round(Math.sin(x*.18)*1.2); for (let y=yy-1;y<=yy+1;y++) water(x,y); } }
  if (d.id==='lej'){ for (let y=0;y<MH;y++){ for (let x=MW-10;x<MW;x++) water(x,y); for (let x=MW-17;x<MW-10;x++) if (get(x,y)!==T_ROAD) set(x,y,T_SAND); } }
  if (d.id==='pi'){ for (let y=0;y<MH;y++) for (let x=0;x<MW;x++){ if (y>=MH-13 || x>=MW-13){ const t=get(x,y); if (t===T_ROAD && (x<MW-6 && y<MH-6)) set(x,y,T_BRIDGE); else if (t!==T_BRIDGE) set(x,y,T_WATER);} } }
  const blockFree = b => { for (let y=b.y0;y<=b.y1;y++) for (let x=b.x0;x<=b.x1;x++) if (get(x,y)===T_WATER || get(x,y)===T_SAND) return false; return true; };
  // landmark assignment
  const special = {};
  const pick = (bx, by, kind) => { special[bx+','+by] = kind; };
  if (d.id==='nola'){ pick(2,1,'cathedral'); pick(1,2,'dome'); pick(3,3,'park'); pick(0,0,'safe'); }
  if (d.id==='la'){ pick(2,1,'park'); pick(3,2,'pools'); pick(1,3,'lot'); pick(1,0,'safe'); }
  if (d.id==='hou'){ pick(2,1,'downtown'); pick(3,1,'downtown'); pick(2,0,'downtown'); pick(0,3,'park'); pick(0,0,'safe'); }
  if (d.id==='lej'){ pick(1,1,'field'); pick(3,3,'watertower'); pick(2,2,'motorpool'); pick(0,0,'safe'); }
  if (d.id==='pi'){ pick(1,1,'paradedeck'); pick(2,2,'iwo'); pick(0,2,'field'); pick(0,0,'safe'); }
  if (isW){ pick(3,0,'safe'); pick(4,1,'cathedral'); pick(4,2,'dome'); pick(3,2,'park'); pick(3,3,'park'); pick(3,4,'tower'); pick(3,5,'park'); pick(3,6,'lot');
    pick(5,0,'safe'); pick(6,1,'pools'); pick(5,2,'lot'); pick(6,0,'park'); pick(6,2,'park');
    pick(5,3,'downtown'); pick(6,3,'downtown'); pick(5,4,'downtown'); pick(6,5,'safe'); pick(5,5,'park');
    pick(7,0,'safe'); pick(8,1,'field'); pick(7,2,'motorpool'); pick(8,3,'paradedeck'); pick(7,1,'iwo'); pick(8,0,'watertower'); pick(8,2,'safe');
    pick(7,4,'safe'); pick(8,4,'forest'); pick(7,5,'forest'); pick(8,5,'forest'); pick(7,6,'forest'); pick(8,6,'forest'); pick(5,7,'safe');
    for (let bx=3; bx<9; bx++) for (let by=7; by<9; by++) if (!(bx===5 && by===7)) pick(bx,by,'mountain'); }
  if (MW>80 && !isW){ pick(5,4,'park'); pick(6,5,'park'); pick(5,1,'park'); pick(3,5,'park'); }
  let safe = null;
  for (const b of blocks){
    if (isW){ const z = WORLD_ZONES[worldZoneKey(b.bx, b.by)]; if (z){ d.roofs = z.roofs; d.hMin = z.hMin; d.hMax = z.hMax; d.cars = z.cars; } }
    if (!blockFree(b)){ for (let y=b.y0;y<=b.y1;y++) for (let x=b.x0;x<=b.x1;x++) if (get(x,y)===T_GRASS) set(x,y, T_PARK); continue; }
    const kind = special[b.bx+','+b.by] || (rng() < .13 ? 'park' : rng() < .12 ? 'lot' : 'buildings');
    const W = b.x1 - b.x0 + 1, H = b.y1 - b.y0 + 1;
    const fill = (t) => { for (let y=b.y0;y<=b.y1;y++) for (let x=b.x0;x<=b.x1;x++) set(x,y,t); };
    const addB = (x, y, w, h, o) => {
      for (let yy=y; yy<y+h; yy++) for (let xx=x; xx<x+w; xx++) set(xx, yy, T_BLD);
      const B = Object.assign({ x:x*TILE, y:y*TILE, w:w*TILE, h:h*TILE, H: Math.round(d.hMin + rng()*(d.hMax-d.hMin)), col: d.roofs[Math.floor(rng()*d.roofs.length)], seed: rng()*1000, kind:'normal' }, o||{});
      buildings.push(B); return B;
    };
    if (kind==='forest' || kind==='mountain'){
      fill(T_PARK); features.push({ kind, x:b.x0*TILE, y:b.y0*TILE, w:W*TILE, h:H*TILE });
      if (kind==='forest') for (let k=0;k<46;k++) trees.push({ x:(b.x0 + .5 + rng()*(W-1))*TILE, y:(b.y0 + .5 + rng()*(H-1))*TILE, r: 15 + rng()*12 });
    } else if (kind==='tower'){
      fill(T_PLAZA); features.push({ kind:'tower', x:b.x0*TILE, y:b.y0*TILE, w:W*TILE, h:H*TILE });
      addB(b.x0+1, b.y0+1, 7, 7, { kind:'tower', H:300, col:'#cfd6da' });
    } else if (kind==='park' || kind==='field' || kind==='watertower' || kind==='iwo'){
      fill(T_PARK);
      if (kind==='park') for (let k=0;k<9;k++) trees.push({ x:(b.x0 + .5 + rng()*(W-1))*TILE, y:(b.y0 + .5 + rng()*(H-1))*TILE, r: 14 + rng()*10 });
      features.push({ kind, x:b.x0*TILE, y:b.y0*TILE, w:W*TILE, h:H*TILE });
      if (kind==='watertower') addB(b.x0+3, b.y0+3, 3, 3, { kind:'watertower', H:110, col:'#a6adb2' });
      if (kind==='iwo') addB(b.x0+3, b.y0+3, 3, 3, { kind:'iwo', H:40, col:'#7a7a74' });
    } else if (kind==='lot' || kind==='motorpool' || kind==='paradedeck' || kind==='safe'){
      fill(kind==='paradedeck' ? T_PLAZA : T_LOT);
      features.push({ kind, x:b.x0*TILE, y:b.y0*TILE, w:W*TILE, h:H*TILE });
      if (kind==='safe'){ const B = addB(b.x0+1, b.y0+1, 5, 4, { kind:'safe', H:34, col:'#5c5446' }); safe = { x:(b.x0+3.5)*TILE, y:(b.y0+6.5)*TILE, B, bx:b.bx, by:b.by }; safes.push(safe); }
      if (kind!=='paradedeck') for (let k=0;k<(kind==='safe'?2:7);k++){ const px = (b.x0 + 1.2 + (k%4)*2.1)*TILE, py = (b.y0 + (kind==='safe' ? 7.5 : 1.5 + Math.floor(k/4)*5))*TILE; if (get(Math.floor(px/TILE), Math.floor(py/TILE)) !== T_BLD) parked.push({x:px, y:py, a:Math.PI/2, type: kind==='motorpool' ? (k%2?'humvee':'mtvr') : d.cars[Math.floor(rng()*d.cars.length)]}); }
    } else if (kind==='cathedral'){
      fill(T_PLAZA);
      addB(b.x0+2, b.y0+1, 5, 4, { kind:'cathedral', H:70, col:'#efece2' });
      features.push({ kind:'square', x:b.x0*TILE, y:(b.y0+5)*TILE, w:W*TILE, h:(H-5)*TILE });
      for (let k=0;k<6;k++) trees.push({ x:(b.x0+1.5+k*1.2)*TILE, y:(b.y0+7)*TILE, r:12 });
    } else if (kind==='dome'){
      fill(T_LOT); addB(b.x0, b.y0, 9, 9, { kind:'dome', H:60, col:'#d9d6cc' });
    } else if (kind==='downtown'){
      fill(T_PLAZA);
      const pieces = [[0,0,4,4],[5,0,4,4],[0,5,4,4],[5,5,4,4]];
      for (const [ox,oy,w,h] of pieces) addB(b.x0+ox, b.y0+oy, w, h, { H: 120 + Math.round(rng()*130), col: d.roofs[Math.floor(rng()*d.roofs.length)], kind: rng()<.4 ? 'helipad' : 'tower' });
    } else if (kind==='pools'){
      fill(T_LOT);
      addB(b.x0, b.y0, 4, 4, {}); addB(b.x0+5, b.y0+5, 4, 4, {});
      features.push({ kind:'pool', x:(b.x0+5.3)*TILE, y:(b.y0+.6)*TILE, w:3.3*TILE, h:2.6*TILE });
      features.push({ kind:'pool', x:(b.x0+.4)*TILE, y:(b.y0+5.4)*TILE, w:3.2*TILE, h:2.8*TILE });
    } else {
      fill(T_LOT);
      const r = rng();
      if (r < .25) addB(b.x0, b.y0, W, H, { H: Math.round(d.hMin + rng()*(d.hMax-d.hMin)*1.2) });
      else if (r < .55){ addB(b.x0, b.y0, W, 4, {}); addB(b.x0, b.y0+5, W, 4, {}); }
      else if (r < .8){ addB(b.x0, b.y0, 4, H, {}); addB(b.x0+5, b.y0, 4, H, {}); }
      else { addB(b.x0, b.y0, 4, 4, {}); addB(b.x0+5, b.y0, 4, 4, {}); addB(b.x0, b.y0+5, 4, 4, {}); addB(b.x0+5, b.y0+5, 4, 4, {}); }
    }
  }
  // sidewalk trees / palms
  for (let i=0;i<ROADS.length;i++) for (let k=0;k<MW;k+=5){
    for (const side of [-1, 3]){
      const x = ROADS[i] + side, y = k;
      if (get(x, y)===T_WALK && rng() < (d.id==='la' ? .55 : .3)) trees.push({ x:(x+.5)*TILE, y:(y+.5)*TILE, r: d.id==='la' ? 13 : 11, palm: d.id==='la' || d.id==='pi' });
    }
  }
  // cars parked along curbs
  const carList = (x, y) => isW ? WORLD_ZONES[worldZoneAtTile(Math.floor(x/TILE), Math.floor(y/TILE))]?.cars || d.cars : d.cars;
  for (let i=0;i<ROADS.length;i++) for (let k=4;k<MW-4;k+=3){
    if (rng() < .11){ const x = (ROADS[i] + (rng()<.5 ? .5 : 2.5)) * TILE, y = (k + .5) * TILE; if (get(Math.floor(x/TILE), k)===T_ROAD && !isRoadCol(k)) parked.push({ x, y, a: Math.PI/2 + (rng()<.5?0:Math.PI), type: carList(x, y)[Math.floor(rng()*carList(x, y).length)] }); }
    if (rng() < .11){ const y = (ROADS[i] + (rng()<.5 ? .5 : 2.5)) * TILE, x = (k + .5) * TILE; if (get(k, Math.floor(y/TILE))===T_ROAD && !isRoadCol(k)) parked.push({ x, y, a: rng()<.5 ? 0 : Math.PI, type: carList(x, y)[Math.floor(rng()*carList(x, y).length)] }); }
  }
  if (isW){ safe = safes.find(q => q.bx===3 && q.by===0) || safe; d.roofs = WORLD_ZONES.quarter.roofs; d.cars = WORLD_D.cars; }
  if (!safe) safe = { x:(ROADS[0]+4)*TILE, y:(ROADS[0]+4)*TILE };
  return { g, get, buildings, trees, parked, features, safe, safes, rng, world: isW };
}
function tileAt(x, y){ return city.get(Math.floor(x / TILE), Math.floor(y / TILE)); }
let moverCtx = null;
function solidAt(x, y){ const t = tileAt(x, y); if (moverCtx && moverCtx.boat) return t !== T_WATER || x < 70 || y < 70 || x > WORLD - 70 || y > WORLD - 70; return t===T_BLD || t===T_WATER; }
function zombieGoal(z, gx, gy){ return { x:gx, y:gy }; }
function blockedCircle(x, y, r){
  return solidAt(x-r, y-r) || solidAt(x+r, y-r) || solidAt(x-r, y+r) || solidAt(x+r, y+r) || solidAt(x, y-r) || solidAt(x, y+r) || solidAt(x-r, y) || solidAt(x+r, y) || treeHit(x, y, r);
}
function treeHit(x, y, r){ for (const t of city.trees){ const dx = t.x - x, dy = t.y - y; if (dx*dx + dy*dy < (r + 5) * (r + 5)) return true; } return false; }
function moveCircle(e, dx, dy, r){
  let hit = false; moverCtx = e;
  if (!blockedCircle(e.x + dx, e.y, r)) e.x += dx; else hit = true;
  if (!blockedCircle(e.x, e.y + dy, r)) e.y += dy; else hit = true;
  moverCtx = null; return hit;
}
function streetAt(x, y){
  const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE);
  const vi = roadIndex(tx), hi = roadIndex(ty);
  if (vi >= 0 && hi >= 0) return D.v[vi] + ' & ' + D.h[hi];
  if (vi >= 0) return D.v[vi];
  if (hi >= 0) return D.h[hi];
  // nearest road
  let best = '', bd = 1e9;
  ROADS.forEach((r, i) => { const dv = Math.abs(tx - (r+1)); if (dv < bd){ bd = dv; best = D.v[i]; } const dh = Math.abs(ty - (r+1)); if (dh < bd){ bd = dh; best = D.h[i]; } });
  return best;
}
function randomRoadPoint(nearX, nearY, minD, maxD){
  for (let k=0;k<80;k++){
    const a = Math.random()*Math.PI*2, r = rnd(minD, maxD);
    const x = nearX + Math.cos(a)*r, y = nearY + Math.sin(a)*r;
    if (x < 3*TILE || y < 3*TILE || x > WORLD-3*TILE || y > WORLD-3*TILE) continue;
    const t = tileAt(x, y);
    if ((t===T_ROAD || t===T_WALK || t===T_LOT || t===T_PLAZA || t===T_PARK || t===T_BRIDGE || t===T_SAND) && !blockedCircle(x, y, 12)) return {x, y};
  }
  return null;
}
function roadPointFar(fromX, fromY, minD, maxD){
  for (let k=0;k<200;k++){
    const i = Math.floor(Math.random()*ROADS.length), along = (4 + Math.random()*(MW-8));
    const lane = ROADS[i] + .5 + Math.floor(Math.random()*3);
    const vertical = Math.random() < .5;
    const x = (vertical ? lane : along) * TILE, y = (vertical ? along : lane) * TILE;
    const dd = dist(x, y, fromX, fromY);
    const t = tileAt(x, y);
    if (dd >= minD && dd <= maxD && (t===T_ROAD || t===T_BRIDGE) && !blockedCircle(x, y, 14)) return {x, y};
  }
  return randomRoadPoint(fromX, fromY, 200, 900) || { x: city.safe.x, y: city.safe.y };
}

// ---------- Ground pre-render ----------
function shade(hex, f){
  const n = parseInt(hex.slice(1), 16); let r = n>>16, g = n>>8&255, b = n&255;
  return 'rgb(' + clamp(Math.round(r*f),0,255) + ',' + clamp(Math.round(g*f),0,255) + ',' + clamp(Math.round(b*f),0,255) + ')';
}
function renderGround(){
  const DG = city.world ? WORLD_D : D;
  GS = WORLD > 4000 ? .75 : 1;
  groundCv = document.createElement('canvas'); groundCv.width = Math.round(WORLD*GS); groundCv.height = Math.round(WORLD*GS);
  const g = groundCv.getContext('2d'); g.scale(GS, GS);
  for (let ty=0; ty<MH; ty++) for (let tx=0; tx<MW; tx++){
    const t = city.get(tx, ty), x = tx*TILE, y = ty*TILE, h = hash(tx*31 + ty*17);
    if (t===T_GRASS || t===T_PARK){ g.fillStyle = shade(DG.grass, .92 + h*.16); g.fillRect(x, y, TILE, TILE); g.fillStyle = shade(DG.grass, 1.15); for (let k=0;k<4;k++) g.fillRect(x + hash(tx+k*7+ty)*30, y + hash(ty+k*13+tx)*30, 2, 2); }
    else if (t===T_ROAD || t===T_BRIDGE){
      g.fillStyle = t===T_BRIDGE ? '#5e6266' : shade('#11161b', .92 + h*.12); g.fillRect(x, y, TILE, TILE);
      if (h > .86){ g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(x+16, y+16, 6+h*6, 3+h*3, h*3, 0, 7); g.fill(); }
    }
    else if (t===T_WALK){ g.fillStyle = shade(DG.walk, .95 + h*.08); g.fillRect(x, y, TILE, TILE); g.strokeStyle = 'rgba(0,0,0,.14)'; g.lineWidth = 1; g.strokeRect(x+.5, y+.5, TILE-1, TILE-1); }
    else if (t===T_LOT){ g.fillStyle = shade('#3b3f43', .95 + h*.1); g.fillRect(x, y, TILE, TILE); }
    else if (t===T_PLAZA){ g.fillStyle = shade('#9d9a90', .93 + h*.1); g.fillRect(x, y, TILE, TILE); g.strokeStyle = 'rgba(0,0,0,.08)'; g.strokeRect(x+.5, y+.5, 15, 15); g.strokeRect(x+16.5, y+16.5, 15, 15); }
    else if (t===T_SAND){ g.fillStyle = shade('#d6c38c', .95 + h*.1); g.fillRect(x, y, TILE, TILE); }
    else if (t===T_WATER){ g.fillStyle = shade(DG.id==='pi' ? '#35574f' : DG.id==='hou' ? '#3a5244' : '#1f4b66', .92 + h*.1); g.fillRect(x, y, TILE, TILE); }
    else if (t===T_BLD){ g.fillStyle = '#222'; g.fillRect(x, y, TILE, TILE); }
  }
  // lane markings
  for (let i=0;i<ROADS.length;i++){
    const c = (ROADS[i] + 1.5) * TILE;
    for (let k=0;k<MW;k++){
      const isX = isRoadCol(k);
      // vertical road i: lines along y
      const tV = city.get(ROADS[i]+1, k);
      if (!isX && (tV===T_ROAD || tV===T_BRIDGE)){
        g.fillStyle = '#d7b13b'; g.fillRect(c-3, k*TILE + 4, 2, 24); g.fillRect(c+1, k*TILE + 4, 2, 24);
        g.fillStyle = 'rgba(235,235,230,.55)'; g.fillRect(ROADS[i]*TILE + 3, k*TILE, 2, TILE); g.fillRect((ROADS[i]+3)*TILE - 5, k*TILE, 2, TILE);
      }
      const tH = city.get(k, ROADS[i]+1);
      if (!isX && (tH===T_ROAD || tH===T_BRIDGE)){
        g.fillStyle = '#d7b13b'; g.fillRect(k*TILE + 4, c-3, 24, 2); g.fillRect(k*TILE + 4, c+1, 24, 2);
        g.fillStyle = 'rgba(235,235,230,.55)'; g.fillRect(k*TILE, ROADS[i]*TILE + 3, TILE, 2); g.fillRect(k*TILE, (ROADS[i]+3)*TILE - 5, TILE, 2);
      }
    }
    // crosswalks
    for (let j=0;j<ROADS.length;j++){
      const ix = ROADS[i]*TILE, iy = ROADS[j]*TILE;
      if (city.get(ROADS[i]+1, ROADS[j]+1)!==T_ROAD) continue;
      g.fillStyle = 'rgba(235,235,230,.7)';
      for (let s=0;s<8;s++){ g.fillRect(ix + 4 + s*11, iy - 14, 6, 12); g.fillRect(ix + 4 + s*11, iy + 3*TILE + 2, 6, 12); g.fillRect(ix - 14, iy + 4 + s*11, 12, 6); g.fillRect(ix + 3*TILE + 2, iy + 4 + s*11, 12, 6); }
    }
  }
  // Hollywood stars
  if (DG.id==='la'){ const r = ROADS[0]; for (let x=0;x<MW;x+=2){ for (const yy of [r-1, r+3]) if (city.get(x, yy)===T_WALK){ g.fillStyle = '#c86a8f'; star(g, x*TILE+16, yy*TILE+16, 7, 3); g.fillStyle = '#e8c547'; star(g, x*TILE+16, yy*TILE+16, 3, 1.4); } } }
  // features
  for (const f of city.features){
    if (f.kind==='pool'){ g.fillStyle = '#e8e1d0'; g.fillRect(f.x-4, f.y-4, f.w+8, f.h+8); g.fillStyle = '#3cb4d8'; g.fillRect(f.x, f.y, f.w, f.h); g.fillStyle = 'rgba(255,255,255,.3)'; for (let k=0;k<4;k++) g.fillRect(f.x+6, f.y+8+k*18, f.w-12, 2); }
    if (f.kind==='lot' || f.kind==='motorpool' || f.kind==='safe'){ g.strokeStyle = 'rgba(240,240,230,.5)'; g.lineWidth = 2; for (let k=0;k<5;k++){ g.beginPath(); g.moveTo(f.x + 20 + k*67, f.y + 20); g.lineTo(f.x + 20 + k*67, f.y + 90); g.stroke(); } }
    if (f.kind==='safe'){ g.fillStyle = 'rgba(60,200,110,.35)'; g.beginPath(); g.arc(city.safe.x, city.safe.y, 34, 0, 7); g.fill(); g.strokeStyle = '#3cc86e'; g.lineWidth = 3; g.stroke(); g.fillStyle = '#3cc86e'; g.font = "800 16px 'Barlow Condensed'"; g.textAlign = 'center'; g.fillText('SAFEHOUSE', city.safe.x, city.safe.y + 5); }
    if (f.kind==='field'){ g.strokeStyle = 'rgba(240,240,230,.6)'; g.lineWidth = 3; g.strokeRect(f.x+20, f.y+20, f.w-40, f.h-40); g.beginPath(); g.arc(f.x+f.w/2, f.y+f.h/2, 40, 0, 7); g.stroke(); }
    if (f.kind==='paradedeck'){ g.fillStyle = '#7b7d7d'; g.fillRect(f.x+10, f.y+10, f.w-20, f.h-20); g.strokeStyle = 'rgba(240,240,230,.55)'; g.lineWidth = 2; for (let k=0;k<6;k++){ g.beginPath(); g.moveTo(f.x+30, f.y+34+k*42); g.lineTo(f.x+f.w-30, f.y+34+k*42); g.stroke(); }
      g.fillStyle = '#f2cf2a'; for (let r=0;r<4;r++) for (let c=0;c<6;c++){ const fx = f.x + 50 + c*36, fy = f.y + f.h - 70 + r*14; g.beginPath(); g.ellipse(fx, fy, 4, 6, 0, 0, 7); g.ellipse(fx+10, fy, 4, 6, 0, 0, 7); g.fill(); } }
    if (f.kind==='square'){ g.fillStyle = '#4c7040'; g.fillRect(f.x+20, f.y+10, f.w-40, f.h-20); g.strokeStyle = '#9d9a90'; g.lineWidth = 8; g.beginPath(); g.moveTo(f.x+f.w/2, f.y+10); g.lineTo(f.x+f.w/2, f.y+f.h-10); g.moveTo(f.x+20, f.y+f.h/2); g.lineTo(f.x+f.w-20, f.y+f.h/2); g.stroke(); }
    if (f.kind==='park'){ g.strokeStyle = shade(DG.walk, .95); g.lineWidth = 10; g.beginPath(); g.moveTo(f.x, f.y); g.lineTo(f.x+f.w, f.y+f.h); g.moveTo(f.x+f.w, f.y); g.lineTo(f.x, f.y+f.h); g.stroke(); }
  }
  // minimap
  miniCv = document.createElement('canvas'); miniCv.width = MW*3; miniCv.height = MH*3;
  const m = miniCv.getContext('2d');
  const MC = { [T_GRASS]:shade(DG.grass,.8), [T_PARK]:shade(DG.grass,.9), [T_ROAD]:'#d9d9d2', [T_BRIDGE]:'#d9d9d2', [T_WALK]:'#7b7c78', [T_BLD]:'#3a3d42', [T_WATER]:'#1d4560', [T_LOT]:'#55585b', [T_SAND]:'#c8b47c', [T_PLAZA]:'#888680' };
  for (let ty=0;ty<MH;ty++) for (let tx=0;tx<MW;tx++){ m.fillStyle = MC[city.get(tx,ty)]; m.fillRect(tx*3, ty*3, 3, 3); }
}
function star(g, x, y, R, r){ g.beginPath(); for (let k=0;k<10;k++){ const a = -Math.PI/2 + k*Math.PI/5, rr = k%2 ? r : R; g.lineTo(x + Math.cos(a)*rr, y + Math.sin(a)*rr); } g.closePath(); g.fill(); }
function decal(x, y, kind, s){
  const g = groundCv.getContext('2d');
  if (kind==='blood'){ g.fillStyle = 'rgba(' + (90 + Math.random()*40|0) + ',8,8,.55)'; for (let k=0;k<5;k++){ g.beginPath(); g.arc(x + rnd(-8,8)*s, y + rnd(-8,8)*s, rnd(2,7)*s, 0, 7); g.fill(); } }
  if (kind==='green'){ g.fillStyle = 'rgba(70,110,30,.5)'; for (let k=0;k<4;k++){ g.beginPath(); g.arc(x + rnd(-6,6)*s, y + rnd(-6,6)*s, rnd(2,6)*s, 0, 7); g.fill(); } }
  if (kind==='scorch'){ const gr = g.createRadialGradient(x, y, 4, x, y, 60*s); gr.addColorStop(0,'rgba(10,10,10,.75)'); gr.addColorStop(1,'rgba(10,10,10,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, 60*s, 0, 7); g.fill(); }
  if (kind==='skid'){ g.fillStyle = 'rgba(15,15,15,.18)'; g.fillRect(x-1.5, y-1.5, 3, 3); }
}

// ---------- Entities ----------
function makeCar(x, y, a, type){
  const s = CAR_SPECS[type] || CAR_SPECS.sedan;
  return { x, y, a, v:0, vs:0, type, spec:s, col: s.cols[Math.floor(Math.random()*s.cols.length)], hp:s.hp, maxHp:s.hp, r: s.len*.42, fire:0, dead:false, burnT:0, driven:false, lights:0, siren:false, boat: !!s.boat };
}
function makeZombie(x, y, type){
  const military = D.id==='lej' || D.id==='pi', v = Math.random();
  const z = { x, y, a: rnd(0, 7), type, v, military, alive:true, hp:2, speed:.8, r:10, flash:0, anim:rnd(0,10), atkCd:0, wander:rnd(0,7), alert:false, stun:0 };
  const d = Math.min(1, missionIdx / CAMPAIGN_LAST);
  if (type==='walker'){ z.hp = 3; z.speed = .45 + v*.25 + d*.25; z.pts = 25; }
  if (type==='runner'){ z.hp = 2; z.speed = 1.15 + v*.3 + d*.35; z.pts = 40; }
  if (type==='brute'){ z.hp = 10 + d*8; z.speed = .45 + d*.2; z.r = 16; z.pts = 120; }
  z.fem = Math.random() < .45;
  z.maxHp = z.hp;
  const clothes = { nola:['#5a1a7a','#2a7a3a','#c8a020','#3a3a3a'], la:['#e8e8e8','#d07070','#3a8ad0','#202020'], hou:['#a8322a','#3a4a8a','#d8c8a0','#405030'] }[D.id];
  z.shirt = military ? '#4b5320' : (clothes || ['#666','#646d5b','#887765','#59685e'])[Math.floor(v*4)];
  return z;
}
function newPlayer(x, y){
  return { x, y, a:0, aim:0, vx:0, vy:0, hp:100, maxHp:100, armor: up.armor*25, r:10, anim:0, fireCd:0, heat:0, overheat:false, flash:0, inv:0, car:null, carrying:false, dead:false };
}

// ---------- Missions ----------
const TYPES = ['rescue','clear','deliver','race','defend'];
const TITLES = {
  rescue:['Ride or Die','Last Call','Pickup Run','No One Left Behind','Extraction','Get Me Out'],
  clear:['Street Sweeper','Dead Weight','Clean House','Block Party','Pest Control','Body Count'],
  deliver:['Hot Cargo','Supply Drop','Special Delivery','The Package','Lifeline','Med Run'],
  race:['Signal Run','Outrun the Horde','Checkpoint Charlie','Zero to Sixty','Fast Lane','Burnout'],
  defend:['Hold the Line','Last Stand','Siege','Fortress','Dawn Patrol','Stand Fast'],
};
function missionInfo(i){
  const di = Math.floor(i / MISSIONS_PER), isBoss = i % 5 === 4;
  const rng = mkRng(i * 4099 + 7);
  const type = isBoss ? 'boss' : TYPES[(i + Math.floor(rng()*3)) % 5];
  const title = isBoss ? BOSSES[DISTRICTS[di].id].name : TITLES[type][Math.floor(rng()*TITLES[type].length)];
  return { i, di, type, title, isBoss, rng, d: i / CAMPAIGN_LAST };
}
function placeMissionStart(){
  const info = missionInfo(missionIdx);
  const p = roadPointFar(player.x, player.y, 350, 1100);
  mission = { info, phase:'start', start:p, timer:0, targets:[], kills:0, need:0, ckIdx:0, holdT:0, outT:0 };
  objective = 'Mission ' + (missionIdx+1) + ' marker is on your map. Go to the yellow M.';
}
function beginMission(){
  const m = mission, info = m.info, d = info.d;
  m.phase = 'active';
  sfx('missionstart');
  banner = { big: info.title.toUpperCase(), small: 'MISSION ' + (info.i+1) + ' / ' + CAMPAIGN_TOTAL + ' · ' + D.name, t: 220 };
  heat = Math.max(heat, 1 + Math.floor(d * 3));
  const far = (a, b) => roadPointFar(player.x, player.y, a, b);
  if (info.type==='rescue'){
    const a = far(500, 1100); m.targets = [a];
    survivors = [{ x:a.x, y:a.y, hp:60, following:false, inCar:false, anim:0, shirt:['#d84a4a','#4a8ad8','#e8c040','#e87ad0'][Math.floor(Math.random()*4)] }];
    m.drop = { x: city.safe.x, y: city.safe.y }; m.timer = 60*150; m.step = 'reach';
    objective = 'Find the survivor before the horde does.';
    spawnHordeAround(a.x, a.y, 5 + Math.floor(d*8));
  } else if (info.type==='clear'){
    const a = far(450, 1000); m.targets = [a]; m.need = 12 + Math.floor(d*28); m.kills = 0; m.timer = 60*180;
    objective = 'Clear ' + m.need + ' zombies from ' + streetAt(a.x, a.y) + '.';
    spawnHordeAround(a.x, a.y, 10 + Math.floor(d*10));
  } else if (info.type==='deliver'){
    const a = far(450, 1000); let b = roadPointFar(a.x, a.y, 800, 1600); m.targets = [a]; m.drop = b; m.timer = 60*170; m.step = 'pickup';
    pickups.push({ x:a.x, y:a.y, kind:'crate', t:0 });
    objective = 'Grab the supply crate.';
    spawnHordeAround(a.x, a.y, 6 + Math.floor(d*8));
  } else if (info.type==='race'){
    const n = 5 + Math.floor(d*4); let p = { x: player.x, y: player.y }; m.cks = [];
    for (let k=0;k<n;k++){ p = roadPointFar(p.x, p.y, 450, 900); m.cks.push(p); }
    m.ckIdx = 0; m.timer = Math.round(60 * (18 + n * 9 - d*20)); m.started = false;
    objective = 'Get in a vehicle. Hit every checkpoint before time runs out.';
  } else if (info.type==='defend'){
    const a = far(350, 900); m.targets = [a]; m.holdT = 60 * (40 + Math.floor(d*30)); m.step = 'go'; m.timer = 60*90;
    objective = 'Get to the barricade at ' + streetAt(a.x, a.y) + '.';
  } else if (info.type==='boss'){
    const a = far(500, 1100); m.targets = [a]; m.step = 'go'; m.timer = 0;
    objective = 'Something big is waiting on ' + streetAt(a.x, a.y) + '. Go end it.';
  }
}
function missionTarget(){
  const m = mission; if (!m) return null;
  if (m.phase==='start') return { x:m.start.x, y:m.start.y, col:'#f4c355', label:'M' };
  const t = m.info.type;
  if (t==='rescue') return m.step==='reach' ? { x:survivors[0].x, y:survivors[0].y, col:'#5fb7ff', label:'!' } : { x:m.drop.x, y:m.drop.y, col:'#3cc86e', label:'S' };
  if (t==='clear') return { x:m.targets[0].x, y:m.targets[0].y, col:'#ff5a4a', label:'X', zone:300 };
  if (t==='deliver') return m.step==='pickup' ? { x:m.targets[0].x, y:m.targets[0].y, col:'#f4c355', label:'C' } : { x:m.drop.x, y:m.drop.y, col:'#3cc86e', label:'D' };
  if (t==='race') return m.cks[m.ckIdx] ? { x:m.cks[m.ckIdx].x, y:m.cks[m.ckIdx].y, col:'#ff9b2a', label:String(m.ckIdx+1) } : null;
  if (t==='defend') return { x:m.targets[0].x, y:m.targets[0].y, col:'#ff5a4a', label:'H', zone:220 };
  if (t==='boss' && m.drop) return { x:m.drop.x, y:m.drop.y, col:'#f4c355', label:'C' };
  if (t==='boss') return boss && !boss.dead ? { x:boss.x, y:boss.y, col:'#ff3a3a', label:'☠' } : { x:m.targets[0].x, y:m.targets[0].y, col:'#ff3a3a', label:'☠' };
  return null;
}
function updateMission(){
  const m = mission; if (!m) return;
  const px = player.car ? player.car.x : player.x, py = player.car ? player.car.y : player.y;
  if (m.phase==='start'){
    if (dist(px, py, m.start.x, m.start.y) < 46) beginMission();
    return;
  }
  if (m.phase!=='active') return;
  const t = m.info.type;
  if (m.timer > 0 && !(t==='defend' && m.step==='hold') && !(t==='race' && !m.started)){ m.timer--; if (m.timer <= 0) return failMission('OUT OF TIME'); }
  if (t==='rescue'){
    const s = survivors[0]; if (!s) return;
    if (s.hp <= 0) return failMission('THE SURVIVOR WAS EATEN');
    if (m.step==='reach' && dist(px, py, s.x, s.y) < 60){ m.step = 'escort'; s.following = true; objective = 'Get the survivor to the safehouse.'; sfx('pickup'); say('Thank god! Get me out of here!'); }
    if (m.step==='escort' && dist(s.x, s.y, m.drop.x, m.drop.y) < 60) passMission();
  } else if (t==='clear'){
    objective = 'Clear zombies near ' + streetAt(m.targets[0].x, m.targets[0].y) + ': ' + m.kills + ' / ' + m.need;
    if (frame % 90 === 0 && zombiesNear(m.targets[0].x, m.targets[0].y, 400) < 8) spawnHordeAround(m.targets[0].x, m.targets[0].y, 4);
    if (m.kills >= m.need) passMission();
  } else if (t==='deliver'){
    if (m.step==='pickup' && dist(px, py, m.targets[0].x, m.targets[0].y) < 40){ m.step = 'drop'; player.carrying = true; pickups = pickups.filter(p => p.kind!=='crate'); objective = 'Deliver the crate to ' + streetAt(m.drop.x, m.drop.y) + '.'; sfx('pickup'); heat = Math.min(5, heat + 1); }
    if (m.step==='drop' && dist(px, py, m.drop.x, m.drop.y) < 50){ player.carrying = false; passMission(); }
  } else if (t==='race'){
    if (!player.car){ objective = 'Get in a vehicle to start the run.'; return; }
    if (!m.started){ m.started = true; objective = 'Hit every checkpoint!'; sfx('missionstart'); }
    const c = m.cks[m.ckIdx];
    if (c && dist(px, py, c.x, c.y) < 70){ m.ckIdx++; sfx('checkpoint'); m.timer += 60*4; if (m.ckIdx >= m.cks.length) passMission(); else objective = 'Checkpoint ' + (m.ckIdx+1) + ' of ' + m.cks.length + '.'; }
  } else if (t==='defend'){
    const a = m.targets[0], inside = dist(px, py, a.x, a.y) < 220;
    if (m.step==='go' && inside){ m.step = 'hold'; objective = 'Hold the barricade!'; sfx('missionstart'); heat = 5; }
    if (m.step==='hold'){
      m.holdT--; objective = 'Hold the barricade: ' + Math.ceil(m.holdT/60) + 's';
      if (frame % 70 === 0) spawnHordeAround(a.x, a.y, 3 + Math.floor(m.info.d*4), 420, 620);
      if (!inside){ m.outT++; objective = 'GET BACK TO THE BARRICADE! ' + Math.ceil((240 - m.outT)/60) + 's'; if (m.outT > 240) return failMission('YOU ABANDONED THE BARRICADE'); } else m.outT = 0;
      if (m.holdT <= 0) passMission();
    }
  } else if (t==='boss'){
    const a = m.targets[0];
    if (m.step==='go' && dist(px, py, a.x, a.y) < 380){ m.step = 'fight'; spawnBoss(a.x, a.y); objective = 'Kill ' + boss.name + '.'; }
    if (m.step==='fight' && boss && boss.dead && boss.deadT > 90 && !m.drop){ m.drop = { x:boss.x, y:boss.y }; pickups.push({ x:boss.x, y:boss.y, kind:'power', t:0 }); objective = 'Grab the power-up.'; }
  }
}
function passMission(){
  const m = mission, info = m.info, reward = 500 + info.i * 120 + (info.isBoss ? 2500 : 0);
  cash += reward; completed.add(info.i);
  banner = { big:'MISSION PASSED', small:'+' + money(reward).replace('$0000','$').replace(/^\$0+/, '$'), t:240, good:true };
  sfx('pass'); m.phase = 'done';
  survivors = []; heat = Math.max(0, heat - 1.5);
  setTimeout(() => {
    if (info.i >= CAMPAIGN_LAST){ state = 'win'; return; }
    missionIdx = info.i + 1;
    if (Math.floor(missionIdx / MISSIONS_PER) !== distIdx){ travelTo(Math.floor(missionIdx / MISSIONS_PER)); return; }
    placeMissionStart();
  }, 3200);
}
function failMission(reason){
  const m = mission; if (!m || m.phase!=='active') return;
  m.phase = 'failed'; sfx('fail');
  banner = { big:'MISSION FAILED', small: reason, t:220, bad:true };
  survivors = []; player.carrying = false; pickups = pickups.filter(p => p.kind!=='crate' && p.kind!=='power');
  if (boss){ boss = null; stopBossVoice(); subtitle = null; }
  setTimeout(() => { if (state==='play' || state==='dead') placeMissionStart(); }, 3000);
}
function zombiesNear(x, y, r){ let n = 0; for (const z of zombies) if (z.alive && dist(z.x, z.y, x, y) < r) n++; return n; }

// ---------- Boss ----------
function spawnBoss(x, y){
  const spec = BOSSES[D.id], final = missionIdx === CAMPAIGN_LAST;
  const hp = Math.round((70 + missionIdx * 3.2) * (final ? 1.6 : 1));
  boss = { x, y, r:30, hp, maxHp:hp, a:0, spec, name: final ? 'ZOMBIE OVERLORD' : spec.name, mode:'walk', t:120, flash:0, anim:0, dead:false, deadT:0, vx:0, vy:0, enrageSaid:false, tauntT:520, tauntN:0, final };
  snd('roar'); snd('boss'); shake = 14;
  banner = { big:'BOSS FIGHT', small: boss.name, t:160, bad:true };
  heat = 5;
  setTimeout(() => bossSay(0, true), 500);
}
function bossKey(i){ return 'b_' + (boss && boss.final ? 'final' : D.id) + '_' + i; }
function bossSay(i, force){
  if (!actx || !boss) return;
  const now = actx.currentTime;
  if (!force && now < bossVoiceEnd) return;
  stopBossVoice();
  const key = bossKey(i), r = playVO(key, { vol:1.25 });
  if (!r) return;
  bossVoice = r; bossVoiceEnd = now + r.dur;
  subtitle = { name: boss.name, txt: VO_TEXT[key], t: Math.round(r.dur*60) + 40 };
  applyVolumes();
}
function updateBoss(){
  const B = boss; if (!B) return;
  if (B.dead){ B.deadT++; if (B.deadT % 5 === 0 && B.deadT < 80) gore(B.x + rnd(-20,20), B.y + rnd(-20,20), 5); return; }
  if (B.flash > 0) B.flash--;
  const tx = player.car ? player.car.x : player.x, ty = player.car ? player.car.y : player.y;
  const dx = tx - B.x, dy = ty - B.y, dd = Math.hypot(dx, dy) || 1;
  const enraged = B.hp < B.maxHp * .4, spd = (.9 + missionIdx/CAMPAIGN_LAST * 1.1) * (enraged ? 1.4 : 1);
  if (enraged && !B.enrageSaid){ B.enrageSaid = true; bossSay(3, true); for (let k=0;k<4;k++) spawnZombieAt(B.x + rnd(-80,80), B.y + rnd(-80,80), 'runner'); }
  if (--B.tauntT <= 0){ bossSay(1 + (B.tauntN++ % 2)); B.tauntT = 480 + Math.random()*300; }
  B.anim += .08; B.t--;
  if (B.mode==='walk'){
    B.a = Math.atan2(dy, dx); B.vx = Math.cos(B.a)*spd; B.vy = Math.sin(B.a)*spd;
    if (B.t <= 0){
      const r = Math.random();
      B.mode = r < .3 ? 'charge' : r < .6 ? 'spit' : r < .8 ? 'slam' : 'summon';
      B.t = B.mode==='charge' ? 80 : B.mode==='spit' ? 60 : B.mode==='slam' ? 50 : 40;
      B.vx = B.vy = 0;
    }
  } else if (B.mode==='charge'){
    if (B.t > 45){ B.a = Math.atan2(dy, dx); B.vx = B.vy = 0; }
    else { B.vx = Math.cos(B.a) * (6 + missionIdx/CAMPAIGN_LAST*3); B.vy = Math.sin(B.a) * (6 + missionIdx/CAMPAIGN_LAST*3); if (frame % 3 === 0) decal(B.x, B.y, 'skid'); }
    if (B.t <= 0) endBossMove(B);
  } else if (B.mode==='spit'){
    if (B.t === 40 || B.t === 20 || (enraged && B.t === 5)){
      const n = 3 + Math.floor(missionIdx/CAMPAIGN_LAST*4) + (enraged ? 2 : 0), base = Math.atan2(dy, dx);
      for (let k=0;k<n;k++){ const a = base + (k - (n-1)/2) * .22; spits.push({ x:B.x, y:B.y, vx:Math.cos(a)*5.5, vy:Math.sin(a)*5.5, t:120 }); }
      snd('spit');
    }
    if (B.t <= 0) endBossMove(B);
  } else if (B.mode==='slam'){
    if (B.t === 10){ snd('slam'); shake = 14; explosions.push({ x:B.x, y:B.y, r:0, max: 170, t:30, wave:true, dealt:false }); decal(B.x, B.y, 'scorch', .8); }
    if (B.t <= 0) endBossMove(B);
  } else if (B.mode==='summon'){
    if (B.t === 20){ for (let k=0;k<3 + Math.floor(missionIdx/30);k++) spawnZombieAt(B.x + rnd(-100,100), B.y + rnd(-100,100), Math.random()<.5 ? 'runner' : 'walker'); snd('roar'); }
    if (B.t <= 0) endBossMove(B);
  }
  moveCircle(B, B.vx, B.vy, B.r - 8);
  // contact
  if (!player.car && dist(B.x, B.y, player.x, player.y) < B.r + player.r) hurtPlayer(B.mode==='charge' ? 30 : 15, B.x, B.y);
  if (player.car && dist(B.x, B.y, player.car.x, player.car.y) < B.r + player.car.r){
    const c = player.car, sp = Math.abs(c.v);
    if (sp > 3){ damageBoss(sp * 4); c.v *= -.4; damageCar(c, 18); sfx('crash'); }
    else if (frame % 20 === 0){ damageCar(c, 10); sfx('bang'); }
  }
}
function endBossMove(B){ B.mode = 'walk'; B.t = 70 + Math.random()*70 - missionIdx*.3; }
function damageBoss(n){
  const B = boss; if (!B || B.dead) return;
  B.hp -= n; B.flash = 4;
  if (B.hp <= 0){
    B.hp = 0; B.dead = true; snd('bossdie'); shake = 24; bossSay(4, true);
    gore(B.x, B.y, 40); decal(B.x, B.y, 'blood', 3);
    cash += 1000 + missionIdx*50;
    for (const z of zombies) if (z.alive && dist(z.x, z.y, B.x, B.y) < 500){z.killSource='ambient';killZombie(z, 0, 0);}
  }
}

// ---------- Spawning ----------
function zombieType(){ const d = missionIdx/CAMPAIGN_LAST, r = Math.random(); if (r < .04 + d*.08) return 'brute'; if (r < .16 + d*.16) return 'runner'; return 'walker'; }
function spawnZombieAt(x, y, type){ if (blockedCircle(x, y, 12)) return null; const z = makeZombie(x, y, type || zombieType()); zombies.push(z); return z; }
function spawnHordeAround(x, y, n, minR, maxR){
  for (let k=0;k<n;k++){ const p = randomRoadPoint(x, y, minR || 60, maxR || 300); if (p) spawnZombieAt(p.x, p.y); }
}
function ambientSpawn(){
  const night=typeof isNight==='function'&&isNight();
  const cap = Math.min(night?100:85, (night?34:22) + Math.floor(heat * 9) + Math.floor(missionIdx/CAMPAIGN_LAST*20));
  const alive = zombies.filter(z => z.alive).length;
  if (alive >= cap) return;
  const rate = Math.max(10, (night?38:60) - heat * 9);
  if (frame % Math.round(rate) !== 0) return;
  const px = player.car ? player.car.x : player.x, py = player.car ? player.car.y : player.y;
  const n = 1 + Math.floor(heat / 2);
  for (let k=0;k<n;k++){ const p = randomRoadPoint(px, py, 520, 820); if (p){ const z = spawnZombieAt(p.x, p.y); if (z && heat >= 2) z.alert = true; } }
}

// ---------- Combat ----------
const fireDelay = () => Math.max(3, 7 - up.rapid * 1.3);
const heatPerShot = () => 4.6 / (1 + up.cool * .6);
const bulletDmg = () => 1 + up.ap * .6;
function nearestZombie(x, y, maxD){
  let best = null, bd = maxD;
  for (const z of zombies){ if (!z.alive) continue; const d = dist(x, y, z.x, z.y); if (d < bd){ bd = d; best = z; } }
  if (boss && !boss.dead){ const d = dist(x, y, boss.x, boss.y); if (d < bd + 60) best = boss; }
  return best;
}
function fireWeapon(ox, oy, aim){
  const p = player;
  const n = up.spread >= 2 ? 5 : up.spread >= 1 ? 3 : 1;
  for (let k=0;k<n;k++){
    const a = aim + (n===1 ? rnd(-.04,.04) : (k - (n-1)/2) * .09);
    bullets.push({ x: ox + Math.cos(a)*24, y: oy + Math.sin(a)*24, vx: Math.cos(a)*16, vy: Math.sin(a)*16, life: 38, dmg: bulletDmg(), pierce: up.ap > 0 ? 2 : 0, hit: new Set() });
  }
  parts.push({ k:'shell', x:ox, y:oy, vx: Math.cos(aim + 1.6)*2, vy: Math.sin(aim + 1.6)*2, t:30 });
  p.flash = 3; p.fireCd = fireDelay(); p.heat += heatPerShot();
  if (p.heat >= 100){ p.heat = 100; p.overheat = true; snd('heat'); toast('M240 OVERHEATED'); }
  snd('shot'); lastShotFrame = frame;
  heat = Math.min(5, heat + .012);
}
function gore(x, y, n, col){ for (let k=0;k<n;k++) parts.push({ k:'gore', x, y, vx:rnd(-3,3), vy:rnd(-3,3), t:rnd(20,40), c: col || (Math.random()<.5 ? '#5f8a3a' : '#8a1a1a') }); }
function killZombie(z, vx, vy){
  if (!z.alive) return;
  z.playerKill=z.killSource!=='ambient'&&z.killSource!=='guard'&&z.killSource!=='remote';
  z.alive = false; snd('zdie'); zombieSay(z, true);
  gore(z.x, z.y, 10); decal(z.x, z.y, Math.random()<.5 ? 'blood' : 'green', z.type==='brute' ? 1.6 : 1);
  parts.push({ k:'corpse', x:z.x, y:z.y, a:z.a, t:600, shirt:z.shirt, military:z.military, r:z.r, vx:(vx||0)*.4, vy:(vy||0)*.4 });
  if(z.playerKill){cash += z.pts; heat = Math.min(5, heat + .05);}
  if ((z.playerKill||(z.killSource==='remote'&&typeof mpRole!=='undefined'&&mpRole==='host')) && mission && mission.phase==='active' && mission.info.type==='clear' && dist(z.x, z.y, mission.targets[0].x, mission.targets[0].y) < 420) mission.kills++;
  if (!z.playerKill)return;
  if (Math.random() < .045) pickups.push({ x:z.x, y:z.y, kind: Math.random()<.6 ? 'health' : 'armor', t:0 });
  else if (Math.random() < .22) pickups.push({ x:z.x, y:z.y, kind:'cash', t:0, amt: 50 + Math.floor(Math.random()*150), expiresAt:Date.now()+30000 });
}
function hurtPlayer(n, sx, sy){
  const p = player;
  if (p.inv > 0 || p.dead) return;
  if (p.armor > 0){ const a = Math.min(p.armor, n * .7); p.armor -= a; n -= a; }
  p.hp -= n; p.inv = 24; shake = Math.max(shake, 6);
  snd('hurt'); decal(p.x, p.y, 'blood', .6);
  if (p.hp <= 0) killPlayer();
}
function damageCar(c, n, source='ambient', owner=0){
  if (c.dead) return;
  c.lastDamager=source;c.lastDamageOwner=source==='remote'?owner:0;
  c.hp -= n * (c.driven && up.tough ? 1 / (1 + up.tough*.6) : 1);
  if (c.hp <= 0 && !c.burnT){ c.burnT = 180; c.hp = 0; }
}
function explodeCar(c){
  c.dead = true; c.burnT = 0; sfx('explode'); shake = 22;
  explosions.push({ x:c.x, y:c.y, r:0, max:110, t:28, playerOwned:c.lastDamager==='player', owner:c.lastDamageOwner||0, dealt:false });
  decal(c.x, c.y, 'scorch', 1.2);
  for (let k=0;k<26;k++) parts.push({ k:'fire', x:c.x, y:c.y, vx:rnd(-5,5), vy:rnd(-5,5), t:rnd(20,45) });
  if (player.car === c){ exitCar(true); hurtPlayer(45, c.x, c.y); }
}
function killPlayer(){
  const p = player; if (p.dead) return;
  p.dead = true; state = 'dead'; snd('die');
  if (p.car){ p.car.driven = false; p.car = null; }
  banner = { big:'WASTED', small:'Hospital bill -$' + Math.min(cash, 500) + ' · back at the safehouse', t:240, bad:true };
  cash = Math.max(0, cash - 500);
  if (mission && mission.phase==='active') { mission.phase = 'failed'; survivors = []; player.carrying = false; if (boss){ boss = null; stopBossVoice(); subtitle = null; } }
  setTimeout(() => {
    player = newPlayer(city.safe.x, city.safe.y + 30); clearSpawn(); state = 'play'; heat = 0;
    zombies = zombies.filter(z => dist(z.x, z.y, player.x, player.y) > 500);
    snapCamera(); placeMissionStart();
  }, 3600);
}

// ---------- Vehicles ----------
function enterExit(){
  const p = player;
  if (p.car){ exitCar(false); return; }
  let best = null, bd = 66;
  for (const c of cars){ if (c.dead || c.burnT) continue; const d = dist(p.x, p.y, c.x, c.y); if (d < bd){ bd = d; best = c; } }
  if (best){
    p.car = best; best.driven = true; best.ai = null; sfx('door');
    vehShow = { txt: best.spec.name, t: 160 };
    const st = RADIO[radioIdx]; toast('RADIO · ' + st[0]);
    if (best.spec.police) best.siren = false;
  }
}
function exitCar(forced){
  const p = player, c = p.car; if (!c) return;
  const side = [ [Math.cos(c.a + Math.PI/2), Math.sin(c.a + Math.PI/2)], [Math.cos(c.a - Math.PI/2), Math.sin(c.a - Math.PI/2)], [Math.cos(c.a + Math.PI), Math.sin(c.a + Math.PI)] ];
  let placed = false;
  for (const [sx, sy] of side){ const nx = c.x + sx * (c.spec.wid*.5 + 14), ny = c.y + sy * (c.spec.wid*.5 + 14); if (!blockedCircle(nx, ny, p.r)){ p.x = nx; p.y = ny; placed = true; break; } }
  if (!placed){ p.x = c.x; p.y = c.y; }
  c.driven = false; c.siren = false; p.car = null; if (!forced) sfx('door');
}
function updateCar(c, input){
  const s = c.spec;
  if (c.burnT){ c.burnT--; if (frame % 3 === 0) parts.push({ k:'fire', x:c.x + rnd(-10,10), y:c.y + rnd(-10,10), vx:rnd(-.5,.5), vy:rnd(-1.5,-.3), t:rnd(15,30) }); if (c.burnT <= 0) explodeCar(c); }
  else if (c.hp < c.maxHp * .35 && frame % 6 === 0) parts.push({ k:'smoke', x:c.x + Math.cos(c.a)*s.len*.35, y:c.y + Math.sin(c.a)*s.len*.35, vx:rnd(-.3,.3), vy:rnd(-.8,-.2), t:50 });
  if ((c.z || 0) > 1){ moveCircle(c, Math.cos(c.a) * c.v, Math.sin(c.a) * c.v, c.r * .8); return; }
  let thr = 0, steer = 0, brake = false, boost = false;
  if (input){ thr = input.thr; steer = input.steer; brake = input.brake; boost = input.boost && up.nitro; }
  const max = s.max * (boost ? 1.3 : 1) * (c.hp < c.maxHp*.25 ? .7 : 1);
  if (thr > 0){ c.v += s.acc * (boost ? 1.5 : 1) * (c.v < 0 ? 2 : 1) * Math.max(.35, 1 - Math.max(0,c.v) / (max * 1.35)); }
  else if (thr < 0){ if (c.v > .4) c.v -= s.acc * 2.2; else c.v -= s.acc * .6; }
  else c.v *= .985;
  c.v = clamp(c.v, -max * .4, max);
  if (brake) c.v *= .9;
  c.v *= .996;
  const sp = Math.abs(c.v);
  c.steerSmooth = (c.steerSmooth || 0) + (clamp(steer,-1,1) - (c.steerSmooth || 0)) * (c.driven&&!c.boat?.22:.16);
  const turn = c.steerSmooth * .043 * clamp(c.v / 2.8, -1, 1) / (1 + sp * .075);
  c.a += turn;
  const grip = brake ? .7 : s.grip;
  c.vs += -turn * c.v * (1 - grip) * 2;
  c.vs *= brake ? .84 : .65;
  c.vs = clamp(c.vs, -sp * .24, sp * .24);
  if (!c.boat && Math.abs(c.vs) > 1.6 && sp > 3){ decal(c.x - Math.cos(c.a)*s.len*.35 + Math.cos(c.a+Math.PI/2)*s.wid*.4, c.y - Math.sin(c.a)*s.len*.35 + Math.sin(c.a+Math.PI/2)*s.wid*.4, 'skid'); decal(c.x - Math.cos(c.a)*s.len*.35 - Math.cos(c.a+Math.PI/2)*s.wid*.4, c.y - Math.sin(c.a)*s.len*.35 - Math.sin(c.a+Math.PI/2)*s.wid*.4, 'skid'); c.skid = true; } else c.skid = false;
  const mx = Math.cos(c.a) * c.v - Math.sin(c.a) * c.vs, my = Math.sin(c.a) * c.v + Math.cos(c.a) * c.vs;
  const hit = moveCircle(c, mx, my, c.r * .8);
  if (hit){
    if (sp > 2.5){ damageCar(c, sp * 3.2); sfx('crash', sp); shake = Math.max(shake, sp * 1.2); for (let k=0;k<5;k++) parts.push({ k:'spark', x:c.x + Math.cos(c.a)*c.r*Math.sign(c.v), y:c.y + Math.sin(c.a)*c.r*Math.sign(c.v), vx:rnd(-3,3), vy:rnd(-3,3), t:12 }); }
    c.v *= -.12; c.vs *= .2; c.steerSmooth *= .5;
  }
  // water check
  if (!c.boat && tileAt(c.x, c.y)===T_WATER){ c.hp = 0; c.burnT = 1; }
}
function carCollisions(){
  for (let i=0;i<cars.length;i++){
    const a = cars[i]; if (a.dead || (a.z || 0) > 6) continue;
    for (let j=i+1;j<cars.length;j++){
      const b = cars[j]; if (b.dead || (b.z || 0) > 6) continue;
      if(Math.abs(a.v)<.01&&Math.abs(b.v)<.01)continue;
      if (a.ai && b.ai) continue;
      const pc = player && player.car, loose = (a.ai || b.ai) && a !== pc && b !== pc;
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), md = (a.r + b.r) * (loose ? .5 : .78);
      if (d < md && d > 0){
        const nx = dx/d, ny = dy/d, push = (md - d) / 2;
        if (!blockedCircle(a.x - nx*push, a.y - ny*push, a.r*.8)){ a.x -= nx*push; a.y -= ny*push; }
        if (!blockedCircle(b.x + nx*push, b.y + ny*push, b.r*.8)){ b.x += nx*push; b.y += ny*push; }
        const rel = Math.abs(a.v - b.v);
        if (rel > 2.5){ damageCar(a, rel*2.5); damageCar(b, rel*2.5); sfx('crash', rel); }
        const av = a.v; a.v = b.v * .5; b.v = av * .5;
      }
    }
  }
}

// ---------- Input ----------
const keys = {}, touch = { up:false, down:false, left:false, right:false, shoot:false };
const stick = { x:0, y:0 }, gp = { fire:false, sprint:false, brake:false };
let mouse = { x:0, y:0, down:false, moved:0 };
addEventListener('keydown', e => {
  if (e.target && e.target.tagName==='INPUT') return;
  const k = e.key.toLowerCase();
  if (['tab',' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k)) e.preventDefault();
  if (keys[k]) return; keys[k] = true;
  ensureAudio();
  if (state==='menu') return;
  if (k==='e' || k==='enter'){ if (state==='play') enterExit(); }
  if (k==='p' || k==='escape'){ if (state==='play') state = 'pause'; else if (state==='pause') state = 'play'; applyVolumes(); }
  if (k==='tab') showMap = !showMap;
  if (k==='m') setSoundMode(soundMode===2 ? 0 : 2);
  if (k==='n') setSoundMode(soundMode===0 ? 1 : 0);
  if (k==='r' && player && player.car){ radioIdx = (radioIdx + 1) % RADIO.length; toast('RADIO · ' + RADIO[radioIdx][0]); sfx('tune'); }
  if (k==='h' && player && player.car){ sfx('horn'); if (player.car.spec.police) player.car.siren = !player.car.siren; alertZombies(player.car.x, player.car.y, 700); }
});
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
cv.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.moved = frame; });
cv.addEventListener('mousedown', e => { ensureAudio(); mouse.down = true; mouse.x = e.clientX; mouse.y = e.clientY; mouse.moved = frame; });
addEventListener('mouseup', () => { mouse.down = false; });
cv.addEventListener('contextmenu', e => e.preventDefault());
const tb = (id, key) => { const b = document.getElementById(id); const on = e => { e.preventDefault(); ensureAudio(); touch[key] = true; b.style.borderColor = '#f4c355'; }; const off = e => { e.preventDefault(); touch[key] = false; b.style.borderColor = ''; }; b.addEventListener('touchstart', on, {passive:false}); b.addEventListener('touchend', off); b.addEventListener('touchcancel', off); b.addEventListener('mousedown', on); b.addEventListener('mouseup', off); b.addEventListener('mouseleave', off); };
tb('shoot','shoot');
document.getElementById('enter').addEventListener('click', () => { ensureAudio(); if (state==='play') enterExit(); });
document.getElementById('audio').addEventListener('click', () => { ensureAudio(); setSoundMode(soundMode + 1); });
const kU = () => keys['w'] || keys['arrowup'] || touch.up, kD = () => keys['s'] || keys['arrowdown'] || touch.down;
const kL = () => keys['a'] || keys['arrowleft'] || touch.left, kR = () => keys['d'] || keys['arrowright'] || touch.right;
const kFire = () => mouse.down || keys['f'] || keys['j'] || touch.shoot || gp.fire;
const autoAim = () => keys['f'] || keys['j'] || touch.shoot || gp.fire;
function alertZombies(x, y, r){ for (const z of zombies) if (z.alive && dist(z.x, z.y, x, y) < r) z.alert = true; }
function screenToWorld(sx, sy){ return { x: (sx - SW/2) / zoom + camX, y: (sy - SH/2) / zoom + camY }; }

// ---------- Messages ----------
let toastQ = null;
function toast(t){ toastQ = { t, life: 150 }; }
function say(t){ subtitle = { name:'SURVIVOR', txt:t, t:180 }; }

// ---------- SFX additions ----------
let engine = null;
function sfx(type, arg){
  if (!actx || soundMode===2) return;
  const t = actx.currentTime, B = sfxBus;
  try {
    if (type==='crash'){ const s = Math.min(1, (arg||4)/8); noiseV(B, t, .35, .25*s + .05, {f:1800, fTo:200}); voice(B, t, 90, .25, {wave:'sine', to:40, vol:.3*s}); for (let k=0;k<4;k++) voice(B, t+rnd(0,.15), rnd(1800,3500), .08, {wave:'triangle', vol:.03*s}); }
    if (type==='bang'){ noiseV(B, t, .12, .15, {f:700}); voice(B, t, 140, .1, {wave:'square', to:70, vol:.08}); }
    if (type==='splat'){ noiseV(B, t, .2, .22, {f:900, fTo:200}); voice(B, t, 110, .18, {wave:'sine', to:45, vol:.3}); }
    if (type==='explode'){ noiseV(B, t, 1.4, .45, {f:2400, fTo:60}); voice(B, t, 70, 1, {wave:'sine', to:25, vol:.5}); noiseV(B, t+.05, .5, .2, {type:'highpass', f:3000, fTo:800}); }
    if (type==='door'){ noiseV(B, t, .06, .12, {f:1200}); voice(B, t+.02, 220, .07, {wave:'square', to:120, vol:.06}); }
    if (type==='horn'){ voice(B, t, 392, .45, {wave:'square', vol:.07, lp:1600, sustain:true}); voice(B, t, 494, .45, {wave:'square', vol:.06, lp:1600, sustain:true}); }
    if (type==='tune'){ noiseV(B, t, .25, .07, {type:'bandpass', f:2500, q:3}); }
    if (type==='pickup'){ voice(B, t, 660, .08, {vol:.07}); voice(B, t+.08, 990, .15, {vol:.07}); }
    if (type==='cash'){ voice(B, t, 1318, .06, {wave:'square', vol:.05}); voice(B, t+.06, 1760, .14, {wave:'square', vol:.05}); }
    if (type==='checkpoint'){ [784, 988, 1175].forEach((f,i)=>voice(B, t+i*.06, f, .12, {wave:'square', vol:.06})); }
    if (type==='missionstart'){ [392, 523, 659].forEach((f,i)=>voice(B, t+i*.11, f, .22, {wave:'sawtooth', vol:.06, lp:1800})); }
    if (type==='pass'){ [523,659,784,1047,784,1047,1319].forEach((f,i)=>{ voice(B, t+i*.13, f, i===6?.8:.15, {vol:.07}); voice(B, t+i*.13, f/2, .13, {wave:'triangle', vol:.09}); }); }
    if (type==='fail'){ [392,370,349,294].forEach((f,i)=>voice(B, t+i*.28, f, i===3 ? 1 : .26, {wave:'sawtooth', vol:.07, lp:1400})); }
  } catch(e){}
}
function updateEngine(){
  if (!actx) return;
  const c = player && player.car;
  const on = c && state==='play' && soundMode!==2;
  if (on && !engine){
    const o1 = actx.createOscillator(), o2 = actx.createOscillator(), f = actx.createBiquadFilter(), g = actx.createGain();
    o1.type = 'sawtooth'; o2.type = 'square'; f.type = 'lowpass'; f.frequency.value = 500; g.gain.value = 0;
    o1.connect(f); o2.connect(f); f.connect(g); g.connect(sfxBus); o1.start(); o2.start();
    const sk = actx.createBufferSource(), skf = actx.createBiquadFilter(), skg = actx.createGain();
    sk.buffer = noiseBuf; sk.loop = true; skf.type = 'bandpass'; skf.frequency.value = 2400; skf.Q.value = 4; skg.gain.value = 0;
    sk.connect(skf); skf.connect(skg); skg.connect(sfxBus); sk.start();
    let sir = null;
    engine = { o1, o2, f, g, skg, sk, sir };
  }
  if (!on && engine){ const e = engine; e.g.gain.setTargetAtTime(0, actx.currentTime, .05); e.skg.gain.setTargetAtTime(0, actx.currentTime, .05); setTimeout(() => { try { e.o1.stop(); e.o2.stop(); e.sk.stop(); if (e.sir) e.sir.stop(); } catch(x){} }, 300); engine = null; return; }
  if (engine){
    const sp = Math.abs(c.v) / c.spec.max, t = actx.currentTime;
    const gearPos = (sp * 3) % 1, rpm = 38 + sp * 50 + gearPos * 34 + (kU() ? 6 : 0);
    engine.o1.frequency.setTargetAtTime(rpm, t, .05); engine.o2.frequency.setTargetAtTime(rpm * .5, t, .05);
    engine.f.frequency.setTargetAtTime(350 + sp * 900, t, .05);
    engine.g.gain.setTargetAtTime(.05 + sp * .06, t, .08);
    engine.skg.gain.setTargetAtTime(c.skid ? .07 : 0, t, .03);
    if (c.siren && !engine.sir){ const o = actx.createOscillator(), g = actx.createGain(), l = actx.createOscillator(), lg = actx.createGain(); o.type = 'square'; o.frequency.value = 750; l.frequency.value = 1.6; lg.gain.value = 260; l.connect(lg); lg.connect(o.frequency); g.gain.value = .035; o.connect(g); g.connect(sfxBus); o.start(); l.start(); engine.sir = { stop(){ o.stop(); l.stop(); } }; }
    if (!c.siren && engine.sir){ engine.sir.stop(); engine.sir = null; }
  }
}

// ---------- Voice hooks ----------
function zombieSay(z, death){
  if (!actx || !player) return false;
  const now = actx.currentTime;
  let key;
  if (death){ if (now < zDeathUntil || Math.random() > .45) return false; key = (z.fem ? 'zfd_' : 'zd_') + Math.floor(Math.random()*3); }
  else {
    if (now < zVoiceUntil) return false;
    const pool = z.fem ? 'zf' : z.military ? (z.v < .6 ? 'zmar' : 'zm') : 'zm';
    key = pool + '_' + Math.floor(Math.random()*VO_COUNT[pool]);
  }
  const d = dist(z.x, z.y, camX, camY);
  if (d > 750) return false;
  const pan = clamp((z.x - camX) / 500, -1, 1) * .7, vol = Math.max(.25, 1 - d/800) * (z.type==='brute' ? 1.15 : .9);
  const rate = z.type==='brute' ? .8 : z.type==='runner' ? 1.06 : .9 + z.v*.08;
  const r = playVO(key, { vol, pan, rate }); if (!r) return false;
  if (death) zDeathUntil = now + 1.3; else zVoiceUntil = now + r.dur + 1.8 + Math.random()*2.5;
  return true;
}
function musicFor(){
  if (state==='menu') return 'title';
  if (state==='win') return 'nola';
  if (state!=='play' && state!=='pause') return null;
  if (boss && !boss.dead) return boss.final ? 'final' : 'boss';
  if (player && player.car) return RADIO[radioIdx][1];
  return D.id;
}
let lastVolKey = null;
function updateMusic(){
  if (!actx) return;
  setMusic(musicFor());
  mus.tempo = 1;
  const key = state + '|' + (bossVoiceEnd > actx.currentTime) + '|' + (voDuckUntil > actx.currentTime) + '|' + !!(typeof rbVoice !== 'undefined' && rbVoice.speaking) + '|' + !!(subtitle && subtitle.t > 0) + '|' + !!(boss && !boss.dead) + '|' + soundMode + '|' + !!(player && player.car);
  if (key !== lastVolKey){ lastVolKey = key; applyVolumes(); }
  if (subtitle && --subtitle.t <= 0) subtitle = null;
}
// override volume rules: radio full in cars, quieter on foot
function applyVolumes(){
  if (!actx) return;
  const t = actx.currentTime;
  sfxBus.gain.setTargetAtTime(soundMode===2 ? 0 : 1, t, .03);
  const speaking = bossVoiceEnd > t || voDuckUntil > t || (typeof rbVoice !== 'undefined' && rbVoice.speaking) || !!(subtitle && subtitle.t > 0 && subtitle.name !== 'SURVIVOR');
  const inCar = player && player.car;
  let mv = soundMode >= 1 ? 0 : state==='pause' ? .04 : speaking ? .035 : (boss && !boss.dead) ? .15 : inCar ? .17 : .09;
  musicBus.gain.setTargetAtTime(mv, t, .1);
  if (voiceBus) voiceBus.gain.setTargetAtTime(soundMode===2 ? 0 : VOICE_GAIN, t, .03);
}

// ---------- Travel / start ----------
function travelTo(di){
  distIdx = di; D = DISTRICTS[di];
  city = genCity(di); renderGround();
  cars = city.parked.map(p => makeCar(p.x, p.y, p.a, p.type));
  zombies = []; bullets = []; spits = []; parts = []; pickups = []; survivors = []; explosions = []; boss = null;
  const keepHp = player && !player.dead ? player.hp : 100;
  player = newPlayer(city.safe.x, city.safe.y + 30); clearSpawn(); player.hp = keepHp;
  heat = 0; snapCamera();
  banner = { big: D.name, small: 'DISTRICT ' + (di+1) + ' OF ' + DISTRICTS.length + ' · MISSIONS ' + (di*MISSIONS_PER+1) + '–' + (di*MISSIONS_PER+MISSIONS_PER), t: 240 };
  areaName = ''; placeMissionStart();
  for (let k=0;k<26;k++){ const p = randomRoadPoint(player.x, player.y, 500, 1600); if (p) spawnZombieAt(p.x, p.y); }
}
function snapCamera(){ camX = player.x; camY = player.y; }
function startGame(startMission){
  ensureAudio();
  document.getElementById('menu').style.display = 'none'; document.getElementById('touch').classList.remove('off');
  missionIdx = startMission; cash = 0;
  up = { rapid:0, armor:0, spread:0, nitro:false, cool:0, ap:0, tough:0 };
  for (let k=0; k<Math.floor(startMission/5); k++) applyPower(k, false);
  state = 'play';
  travelTo(Math.floor(startMission / MISSIONS_PER));
}
function applyPower(k, announce){
  const [id, name] = POWERS[k % POWERS.length];
  if (id==='rapid') up.rapid++; if (id==='armor') up.armor++; if (id==='spread') up.spread++;
  if (id==='nitro') up.nitro = true; if (id==='cool') up.cool++; if (id==='ap') up.ap++; if (id==='tough') up.tough++;
  if (announce){ banner = { big:'POWER-UP', small: name + (id==='nitro' ? ' · HOLD SHIFT IN A CAR' : ''), t:220, good:true }; snd('power'); if (id==='armor') player.armor = up.armor*25; player.hp = player.maxHp; }
  return name;
}
document.getElementById('start').addEventListener('click', () => startGame(+document.getElementById('district').value));

// ---------- Update ----------
function update(){
  frame++;
  // Real-time expiry also runs while paused or in a shop; expired cash cannot be collected.
  pickups=pickups.filter(k=>k.kind!=='cash'||!k.expiresAt||k.expiresAt>Date.now());
  if (shake > 0){ shake *= .86; if (shake < .3) shake = 0; }
  if (banner && --banner.t <= 0) banner = null;
  if (toastQ && --toastQ.life <= 0) toastQ = null;
  if (vehShow && --vehShow.t <= 0) vehShow = null;
  if (areaShow > 0) areaShow--;
  if (state==='menu'){ camX += .5; return; }
  if (state==='win' || ((state==='pause' || state==='shop' || state==='cheat' || state==='talk') && mpRole !== 'host')) return;
  waterT += .02;
  const p = player;
  if (state==='play' && !p.dead){
    if (p.car){
      const c = p.car;
      const dSteer = (kR() ? 1 : 0) - (kL() ? 1 : 0);
      updateCar(c, { thr: kU() || stick.y > .3 ? 1 : kD() || stick.y < -.4 ? -1 : 0, steer: dSteer || (Math.abs(stick.x) > .12 ? stick.x : 0), brake: keys[' '] || gp.brake, boost: keys['shift'] || gp.sprint });
      p.x = c.x; p.y = c.y;
      if (c.dead || !p.car){ /* ejected */ }
    } else {
      const fw = clamp((kU() ? 1 : 0) - (kD() ? 1 : 0) + stick.y, -1, 1), sf = clamp((keys['d'] || touch.right ? 1 : 0) - (keys['a'] || touch.left ? 1 : 0) + stick.x, -1, 1);
      let mx = Math.cos(view.yaw) * fw + Math.cos(view.yaw + Math.PI/2) * sf, my = Math.sin(view.yaw) * fw + Math.sin(view.yaw + Math.PI/2) * sf;
      const ml = Math.hypot(mx, my);
      const spd = (keys['shift'] || gp.sprint ? 3.3 : 2.3) * (p.carrying ? .75 : 1);
      p.a = view.yaw;
      if (ml > 1){ mx /= ml; my /= ml; }
      if (ml > .05) p.anim += .25 * Math.min(1, ml);
      p.vx = level29GameplayMath.velocity(p.vx,mx*spd); p.vy = level29GameplayMath.velocity(p.vy,my*spd);
      moveCircle(p, p.vx, p.vy, p.r);
      if (tileAt(p.x, p.y)===T_WATER&&!window.level29Destinations?.swimming&&!window.level29MetroTravel?.underground) hurtPlayer(1, p.x, p.y);
    }
    // aiming
    const ox = p.car ? p.car.x : p.x, oy = p.car ? p.car.y : p.y;
    let aim = viewAim();
    aim = assistAim(ox, oy, aim, autoAim() ? .32 : .07);
    p.aim = aim;
    if (p.fireCd > 0) p.fireCd--;
    if (p.flash > 0) p.flash--;
    if (p.inv > 0) p.inv--;
    const firing = kFire() && !p.overheat;
    if (firing && p.fireCd <= 0) fireWeapon(ox, oy, aim);
    p.heat = Math.max(0, p.heat - (firing ? .3 : 1.1) * (1 + up.cool*.3));
    if (p.overheat && p.heat < 35){ p.overheat = false; snd('cooled'); }
    // area name
    const st = streetAt(ox, oy);
    if (st !== areaName){ areaName = st; areaShow = 200; }
  }
  // cars
  for (const c of cars){ if (c.dead) continue; if (c !== (p && p.car)) updateCar(c, c.ai ? c.ai.input : null); }
  carCollisions();
  // pickups
  for (const k of pickups){
    k.t++;
    const ox = p.car ? p.car.x : p.x, oy = p.car ? p.car.y : p.y;
    if (k.kind!=='crate' && dist(ox, oy, k.x, k.y) < 30 && !p.dead){
      k.got = true;
      if (k.kind==='health'){ p.hp = Math.min(p.maxHp, p.hp + 35); snd('heal'); toast('+ HEALTH'); }
      if (k.kind==='armor'){ p.armor = Math.min(50 + up.armor*25, p.armor + 30); snd('heal'); toast('+ ARMOR'); }
      if (k.kind==='cash'){ cash += k.amt; sfx('cash'); toast('+ $' + k.amt); }
      if (k.kind==='power'){ applyPower(Math.floor(missionIdx/5), true); passMission(); boss = null; }
    }
  }
  pickups = pickups.filter(k => !k.got && (k.kind==='crate'||k.kind==='power'||(k.kind==='cash' ? Date.now() < (k.expiresAt || (k.expiresAt=Date.now()+Math.max(0,1800-k.t)*1000/60)) : k.t < 60*60)));
  // zombies
  const px = p.car ? p.car.x : p.x, py = p.car ? p.car.y : p.y;
  const localSafe=typeof isPlayerInsideBuilding==='function'&&isPlayerInsideBuilding(p),outdoorRemotes=mpRemotes.filter(r=>!r.dead&&!r.safe&&!(typeof isPlayerInsideBuilding==='function'&&isPlayerInsideBuilding(r)));
  if (frame - lastShotFrame < 3) alertZombies(px, py, 520);
  if (frame - lastShotFrame > 480) heat = Math.max(0, heat - .0025);
  // Nearby-cell separation avoids an all-zombies-against-all-zombies scan.
  const zCells = new Map();
  if (mpRole !== 'client' && frame % 2 === 0) for (const z of zombies) if(z.alive){
    const key=(Math.floor(z.x/64))+','+Math.floor(z.y/64);
    if(!zCells.has(key))zCells.set(key,[]);zCells.get(key).push(z);
  }
  if (mpRole !== 'client') for (const z of zombies){
    if (!z.alive) continue;
    if (z.flash > 0) z.flash--;
    // multiplayer: chase whichever Jester is closest
    let gxP = px, gyP = py, rem = null, dLocal = Math.hypot(px - z.x, py - z.y), dBest = p.dead||localSafe ? 1e9 : dLocal;
    for (const r of outdoorRemotes){ const rd = Math.hypot(r.x - z.x, r.y - z.y); if (rd < dBest){ dBest = rd; gxP = r.x; gyP = r.y; rem = r; } }
    const d = Math.min(dBest, dLocal + (p.dead ? 1e9 : 0));
    if (d > 1500){ if(z.heavyArmor)continue;z.alive = false; continue; }
    if (d < 200) z.alert = true;
    let tx = 0, ty = 0;
    // target survivors too
    let tgt = null;
    if (survivors.length && survivors[0].hp > 0 && !survivors[0].inCar && !(typeof isPlayerInsideBuilding==='function'&&isPlayerInsideBuilding(survivors[0]))){ const s = survivors[0], sd = dist(z.x, z.y, s.x, s.y); if (sd < d && sd < 260) tgt = s; }
    if (z.alert && ((!p.dead&&!localSafe) || rem || tgt)){
      const gg = zombieGoal(z, tgt ? tgt.x : gxP, tgt ? tgt.y : gyP), gx = gg.x, gy = gg.y;
      z.a = Math.atan2(gy - z.y, gx - z.x); tx = Math.cos(z.a) * z.speed; ty = Math.sin(z.a) * z.speed;
    } else { if (frame % 120 === 0) z.wander += rnd(-1.5, 1.5); z.a = z.wander; tx = Math.cos(z.a) * .35; ty = Math.sin(z.a) * .35; }
    if (z.stun > 0){ z.stun--; tx *= .2; ty *= .2; }
    const hit = moveCircle(z, tx, ty, z.r * .8);
    if (hit && !z.alert) z.wander += Math.PI * .7;
    else if (hit){ // slide around obstacles
      const side = z.v < .5 ? 1 : -1; moveCircle(z, Math.cos(z.a + side*1.3) * z.speed, Math.sin(z.a + side*1.3) * z.speed, z.r * .8);
    }
    z.anim += z.speed * .18;
    // separation
    if (frame % 2 === 0) for(let gy=Math.floor(z.y/64)-1;gy<=Math.floor(z.y/64)+1;gy++) for(let gx=Math.floor(z.x/64)-1;gx<=Math.floor(z.x/64)+1;gx++) for (const o of zCells.get(gx+','+gy)||[]){ if (o===z || !o.alive) continue; const ox = z.x - o.x, oy = z.y - o.y, od = ox*ox + oy*oy, rr = (z.r + o.r) * .9; if (od < rr*rr && od > .01){ const dd = Math.sqrt(od), push = (rr - dd) * .3; moveCircle(z, ox/dd*push, oy/dd*push, z.r*.8); } }
    // attacks
    if (z.atkCd > 0) z.atkCd--;
    if (tgt && dist(z.x, z.y, tgt.x, tgt.y) < z.r + 12 && z.atkCd <= 0){ tgt.hp -= z.type==='brute' ? 20 : 8; z.atkCd = 50; snd('hurt'); decal(tgt.x, tgt.y, 'blood', .5); }
    if (rem && !rem.car && !rem.safe && dBest < z.r + 14 && z.atkCd <= 0 && typeof mpHurtRemote === 'function'){ mpHurtRemote(rem, z.type==='brute' ? 13 : z.type==='runner' ? 5 : 6, z.x, z.y); z.atkCd = 60; }
    if (!p.dead && !p.car && !localSafe && dLocal < z.r + p.r + 4 && z.atkCd <= 0){if(z.windup===undefined)z.windup=18;if(--z.windup<=0){hurtPlayer(z.type==='brute' ? 13 : z.type==='runner' ? 5 : 6, z.x, z.y);z.atkCd=60;z.windup=undefined;}}else z.windup=undefined;
    // vs cars
    for (const c of cars){
      if (c.dead || (c.z || 0) > 8 || c===p.car&&localSafe) continue;
      const cd = dist(z.x, z.y, c.x, c.y);
      if (cd < c.r + z.r - 2){
        const sp = Math.abs(c.v);
        if (sp > 2.2 && !c.ai && !(z.type==='brute' && sp < 4.5)){
          z.killSource=c===p.car?'player':'ambient';z.lastHit=0;killZombie(z, Math.cos(c.a)*c.v, Math.sin(c.a)*c.v); sfx('splat'); damageCar(c, z.type==='brute' ? 10 : 2.5); c.v *= z.type==='brute' ? .55 : .93; shake = Math.max(shake, 3);
          if (z.type==='brute') shake = 9;
          break;
        } else {
          const nx = (z.x - c.x)/(cd||1), ny = (z.y - c.y)/(cd||1); moveCircle(z, nx*2, ny*2, z.r*.8);
          if (c === p.car && z.atkCd <= 0){ damageCar(c, z.type==='brute' ? 9 : 3); z.atkCd = 40; sfx('bang'); }
        }
      }
    }
  }
  zombies = zombies.filter(z => z.alive);
  // ambient zombie voices
  if (frame % 80 === 0 && Math.random() < .6){ const near = zombies.filter(z => dist(z.x, z.y, px, py) < 500); if (near.length){ const z = near[Math.floor(Math.random()*near.length)]; if (!(Math.random() < .6 && zombieSay(z))) snd('groan', z.type==='brute' ? 70 : z.type==='runner' ? 150 : 105); } }
  // bullets
  for (const b of bullets){
    const previousX=b.x,previousY=b.y;b.x += b.vx; b.y += b.vy; b.life--;
    if (level29GameplayMath.blockedSegment(previousX,previousY,b.x,b.y,(x,y)=>solidAt(x,y)&&tileAt(x,y)===T_BLD)){ b.life = 0; parts.push({ k:'spark', x:b.x - b.vx*.5, y:b.y - b.vy*.5, vx:rnd(-1,1), vy:rnd(-1,1), t:8 }); continue; }
    for (const z of zombies){
      if (!z.alive || b.hit.has(z)) continue;
      if (level29GameplayMath.segmentDistance2(z.x,z.y,previousX,previousY,b.x,b.y) < (z.r + 3)**2){
        z.hp -= b.dmg; z.flash = 4; b.hit.add(z); z.lastHit = b.owner || 0; z.killSource=b.owner?'remote':'player'; z.alert = true; z.stun = z.type==='brute' ? 2 : 6;
        moveCircle(z, b.vx*.12, b.vy*.12, z.r*.8); gore(b.x, b.y, 2);
        if (!b.owner){view.hit = 7;window.level29GameFeel?.hit(z.hp<=0);} if (z.hp <= 0) killZombie(z, b.vx, b.vy); else snd('zhit');
        if (b.pierce-- <= 0){ b.life = 0; break; }
      }
    }
    if (b.life > 0 && boss && !boss.dead && (b.x - boss.x)**2 + (b.y - boss.y)**2 < boss.r**2){ damageBoss(b.dmg); view.hit = 7; b.life = 0; gore(b.x, b.y, 2); if (frame % 3 === 0) snd('bosshit'); }
    if (b.life > 0) for (const c of cars){ if (c.dead || c === p.car) continue; if ((b.x - c.x)**2 + (b.y - c.y)**2 < (c.r*.8)**2){ damageCar(c, .8,b.owner?'remote':'player',b.owner); b.life = 0; parts.push({ k:'spark', x:b.x, y:b.y, vx:rnd(-1,1), vy:rnd(-1,1), t:8 }); break; } }
  }
  bullets = bullets.filter(b => b.life > 0);
  // boss + spits
  if (mpRole !== 'client') updateBoss();
  for (const s of spits){
    s.x += s.vx; s.y += s.vy; s.t--;
    if (solidAt(s.x, s.y)){ s.t = 0; decal(s.x, s.y, 'green', .7); }
    const tx = p.car ? p.car.x : p.x, ty = p.car ? p.car.y : p.y;
    if (s.t > 0 && dist(s.x, s.y, tx, ty) < (p.car ? p.car.r : p.r) + 6){ s.t = 0; if (p.car) damageCar(p.car, 12); else hurtPlayer(12, s.x, s.y); decal(s.x, s.y, 'green', .8); }
  }
  spits = spits.filter(s => s.t > 0);
  // explosions
  for (const e of explosions){
    e.t--; e.r += (e.max - e.r) * .25;
    if (!e.dealt && e.r > e.max * .6){
      e.dealt = true;
      for (const z of zombies) if (z.alive && dist(z.x, z.y, e.x, e.y) < e.max) { if (e.wave) { z.stun = 30; } else {z.killSource=e.owner?'remote':e.playerOwned?'player':'ambient';z.lastHit=e.owner||0;killZombie(z, z.x - e.x, z.y - e.y);} }
      if (!e.wave) for (const c of cars) if (!c.dead && !c.burnT && dist(c.x, c.y, e.x, e.y) < e.max && c !== p.car) damageCar(c, 60,e.owner?'remote':e.playerOwned?'player':'ambient',e.owner);
      const tx = p.car ? p.car.x : p.x, ty = p.car ? p.car.y : p.y;
      if (dist(tx, ty, e.x, e.y) < e.max){ if (p.car) damageCar(p.car, e.wave ? 20 : 40); else hurtPlayer(e.wave ? 22 : 35, e.x, e.y); }
    }
  }
  explosions = explosions.filter(e => e.t > 0);
  // survivors
  for (const s of survivors){
    s.anim += .2;
    if (!s.following || mpRole === 'client') continue;
    if (p.car){ if (dist(s.x, s.y, p.car.x, p.car.y) < 70 || s.inCar){ s.inCar = true; s.x = p.car.x; s.y = p.car.y; } }
    else {
      if (s.inCar){ s.inCar = false; s.x = p.x + 20; s.y = p.y; }
      const d = dist(s.x, s.y, p.x, p.y);
      if (d > 38){ const a = Math.atan2(p.y - s.y, p.x - s.x); moveCircle(s, Math.cos(a)*Math.min(3, d*.05 + 1.5), Math.sin(a)*Math.min(3, d*.05 + 1.5), 9); }
    }
  }
  // parts
  for (const q of parts){ q.t--; if (q.vx !== undefined){ q.x += q.vx; q.y += q.vy; q.vx *= .9; q.vy *= .9; } }
  parts = parts.filter(q => q.t > 0);
  if (parts.length > 500) parts.splice(0, parts.length - 500);
  if (state==='play'){ if (mpRole !== 'client'){ updateMission(); ambientSpawn(); } else if (mission && mission.phase === 'start') updateMission(); }
  // camera
  const tx = p.car ? p.car.x + Math.cos(p.car.a) * p.car.v * 22 : p.x + Math.cos(p.aim) * 50;
  const ty = p.car ? p.car.y + Math.sin(p.car.a) * p.car.v * 22 : p.y + Math.sin(p.aim) * 50;
  camX = p.car ? p.car.x : p.x; camY = p.car ? p.car.y : p.y;
}

// ---------- Rendering ----------
function draw(){
  cx.setTransform(DPR, 0, 0, DPR, 0, 0);
  cx.fillStyle = '#111518'; cx.fillRect(0, 0, SW, SH);
  if (!city) return;
  const sx = shake ? rnd(-shake, shake) : 0, sy = shake ? rnd(-shake, shake) : 0;
  const vw = SW / zoom, vh = SH / zoom, x0 = camX - vw/2, y0 = camY - vh/2;
  cx.setTransform(DPR*zoom, 0, 0, DPR*zoom, DPR*(SW/2 - camX*zoom + sx), DPR*(SH/2 - camY*zoom + sy));
  // ground
  const gx = clamp(Math.floor(x0), 0, WORLD), gy = clamp(Math.floor(y0), 0, WORLD), gw = clamp(Math.ceil(vw)+2, 0, WORLD - gx), gh = clamp(Math.ceil(vh)+2, 0, WORLD - gy);
  if (gw > 0 && gh > 0) cx.drawImage(groundCv, gx*GS, gy*GS, gw*GS, gh*GS, gx, gy, gw, gh);
  // water shimmer
  cx.fillStyle = 'rgba(255,255,255,.05)';
  for (let ty=Math.floor(y0/TILE); ty<=Math.ceil((y0+vh)/TILE); ty++) for (let tx=Math.floor(x0/TILE); tx<=Math.ceil((x0+vw)/TILE); tx++){ if (city.get(tx,ty)===T_WATER && hash(tx*7+ty*3) > .6){ const o = Math.sin(waterT*2 + tx + ty)*8; cx.fillRect(tx*TILE + 6 + o, ty*TILE + 12, 12, 2); } }
  const vis = (x, y, m) => x > x0 - m && x < x0 + vw + m && y > y0 - m && y < y0 + vh + m;
  // mission zones on ground
  drawMissionWorld(vis);
  // corpses
  for (const q of parts) if (q.k==='corpse' && vis(q.x, q.y, 40)) drawCorpse(q);
  for (const k of pickups) if (vis(k.x, k.y, 40)) drawPickup(k);
  for (const c of cars) if (vis(c.x, c.y, 80)) drawCar(c);
  for (const s of survivors) if (!s.inCar && vis(s.x, s.y, 40)) drawSurvivor(s);
  for (const z of zombies) if (vis(z.x, z.y, 40)) drawZombie(z);
  if (boss && vis(boss.x, boss.y, 120)) drawBoss(boss);
  if (!player.car && !player.dead) drawPlayer(player);
  else if (player.dead && !player.car){ drawCorpse({ x:player.x, y:player.y, a:player.a, shirt:'#111', r:10, t:600, isPlayer:true }); }
  // bullets
  cx.lineCap = 'round';
  for (const b of bullets){ cx.strokeStyle = '#ffe680'; cx.lineWidth = 2.5; cx.beginPath(); cx.moveTo(b.x, b.y); cx.lineTo(b.x - b.vx*1.3, b.y - b.vy*1.3); cx.stroke(); }
  for (const s of spits){ cx.fillStyle = '#86d93c'; cx.beginPath(); cx.arc(s.x, s.y, 6, 0, 7); cx.fill(); cx.fillStyle = '#d8ffaa'; cx.beginPath(); cx.arc(s.x-2, s.y-2, 2, 0, 7); cx.fill(); }
  for (const q of parts){
    if (q.k==='gore'){ cx.fillStyle = q.c; cx.fillRect(q.x-2, q.y-2, 4, 4); }
    else if (q.k==='shell'){ cx.fillStyle = '#d4a017'; cx.fillRect(q.x, q.y, 3, 1.5); }
    else if (q.k==='spark'){ cx.fillStyle = '#fff3a0'; cx.fillRect(q.x-1, q.y-1, 3, 3); }
    else if (q.k==='fire'){ cx.fillStyle = q.t > 20 ? '#ffd23a' : '#ff6a1a'; cx.globalAlpha = Math.min(1, q.t/20); cx.beginPath(); cx.arc(q.x, q.y, 3 + q.t*.15, 0, 7); cx.fill(); cx.globalAlpha = 1; }
    else if (q.k==='smoke'){ cx.fillStyle = 'rgba(60,60,60,' + (q.t/50*.45) + ')'; cx.beginPath(); cx.arc(q.x, q.y, 8 + (50-q.t)*.3, 0, 7); cx.fill(); }
  }
  for (const e of explosions){
    if (e.wave){ cx.strokeStyle = 'rgba(220,200,140,' + (e.t/30) + ')'; cx.lineWidth = 8; cx.beginPath(); cx.arc(e.x, e.y, e.r, 0, 7); cx.stroke(); }
    else { const gr = cx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r); gr.addColorStop(0, 'rgba(255,240,180,' + (e.t/28) + ')'); gr.addColorStop(.5, 'rgba(255,120,30,' + (e.t/40) + ')'); gr.addColorStop(1, 'rgba(255,60,0,0)'); cx.fillStyle = gr; cx.beginPath(); cx.arc(e.x, e.y, e.r, 0, 7); cx.fill(); }
  }
  // trees + buildings (2.5D)
  for (const t of city.trees) if (vis(t.x, t.y, 60)) drawTree(t);
  const bl = city.buildings.filter(b => vis(b.x + b.w/2, b.y + b.h/2, Math.max(b.w, b.h) + 200));
  bl.sort((a, b) => dist(b.x+b.w/2, b.y+b.h/2, camX, camY) - dist(a.x+a.w/2, a.y+a.h/2, camX, camY));
  for (const b of bl) drawBuilding(b);
  // night lighting
  drawLighting(x0, y0, vw, vh);
  // world markers above everything
  drawMarkers();
  cx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (state!=='menu') drawHUD();
}
function isNight(){ return mission && (mission.info.i % 3 === 2); }
function isDusk(){ return mission && (mission.info.i % 3 === 1); }
let lightCv = null;
function drawLighting(x0, y0, vw, vh){
  if (!isNight() && !isDusk()) return;
  if (!lightCv) lightCv = document.createElement('canvas');
  const W = Math.ceil(SW/2), H = Math.ceil(SH/2);
  if (lightCv.width !== W || lightCv.height !== H){ lightCv.width = W; lightCv.height = H; }
  const l = lightCv.getContext('2d'); l.clearRect(0, 0, W, H);
  l.globalCompositeOperation = 'source-over';
  l.fillStyle = isNight() ? 'rgba(5,8,22,.72)' : 'rgba(60,20,60,.28)'; l.fillRect(0, 0, W, H);
  if (isNight()){
    l.globalCompositeOperation = 'destination-out';
    const toS = (x, y) => [ (x - x0) / vw * W, (y - y0) / vh * H ], sc = W / vw;
    const glow = (x, y, r, a) => { const [sx, sy] = toS(x, y); const g = l.createRadialGradient(sx, sy, 0, sx, sy, r*sc); g.addColorStop(0, 'rgba(0,0,0,' + a + ')'); g.addColorStop(1, 'rgba(0,0,0,0)'); l.fillStyle = g; l.beginPath(); l.arc(sx, sy, r*sc, 0, 7); l.fill(); };
    const p = player;
    glow(p.car ? p.car.x : p.x, p.car ? p.car.y : p.y, 150, .9);
    // flashlight / headlights cone
    const cone = (x, y, a, len, spread, alpha) => { const [sx, sy] = toS(x, y); const g = l.createRadialGradient(sx, sy, 0, sx, sy, len*sc); g.addColorStop(0, 'rgba(0,0,0,' + alpha + ')'); g.addColorStop(1, 'rgba(0,0,0,0)'); l.fillStyle = g; l.beginPath(); l.moveTo(sx, sy); l.arc(sx, sy, len*sc, a - spread, a + spread); l.closePath(); l.fill(); };
    if (p.car) cone(p.car.x, p.car.y, p.car.a, 380, .42, .95); else if (!p.dead) cone(p.x, p.y, p.aim, 320, .38, .9);
    for (const c of cars) if (!c.dead && c !== p.car && vis2(c.x, c.y, x0, y0, vw, vh) && c.v > 1) cone(c.x, c.y, c.a, 200, .4, .6);
    for (const e of explosions) glow(e.x, e.y, e.max*1.6, .95);
    for (const q of parts) if (q.k==='fire' && Math.random() < .3) glow(q.x, q.y, 60, .5);
    if (p.flash > 0 && !p.dead) glow(p.car ? p.car.x : p.x, p.car ? p.car.y : p.y, 220, .5);
    // street lamps at intersections
    for (const r1 of ROADS) for (const r2 of ROADS){ const lx = (r1 - .5)*TILE, ly = (r2 - .5)*TILE; if (vis2(lx, ly, x0, y0, vw, vh) && city.get(r1-1, r2-1)===T_WALK) glow(lx, ly, 110, .55); }
  }
  cx.save(); cx.setTransform(DPR, 0, 0, DPR, 0, 0); cx.drawImage(lightCv, 0, 0, SW, SH); cx.restore();
}
function vis2(x, y, x0, y0, vw, vh){ return x > x0 - 200 && x < x0 + vw + 200 && y > y0 - 200 && y < y0 + vh + 200; }

function drawBuilding(b){
  const k = .0017 * b.H;
  const px = (x) => x + (x - camX) * k, py = (y) => y + (y - camY) * k;
  const X0 = b.x, Y0 = b.y, X1 = b.x + b.w, Y1 = b.y + b.h;
  const rX0 = px(X0), rY0 = py(Y0), rX1 = px(X1), rY1 = py(Y1);
  const wallC = shade(b.col, D.wall), wallD = shade(b.col, D.wall * .78);
  if (b.kind==='watertower'){
    const cxp = (X0+X1)/2, cyp = (Y0+Y1)/2, rx = px(cxp), ry = py(cyp);
    cx.strokeStyle = '#596066'; cx.lineWidth = 4; for (const [ox,oy] of [[-30,-30],[30,-30],[-30,30],[30,30]]){ cx.beginPath(); cx.moveTo(cxp+ox*.9, cyp+oy*.9); cx.lineTo(rx+ox*.6, ry+oy*.6); cx.stroke(); }
    cx.fillStyle = '#8f979c'; cx.beginPath(); cx.arc(rx, ry, 50, 0, 7); cx.fill(); cx.fillStyle = '#a9b0b4'; cx.beginPath(); cx.arc(rx, ry, 42, 0, 7); cx.fill();
    cx.fillStyle = '#4b5320'; cx.font = "900 22px 'Barlow Condensed'"; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('USMC', rx, ry); return;
  }
  if (b.kind==='iwo'){
    cx.fillStyle = '#6a6a64'; cx.fillRect(X0+10, Y0+10, b.w-20, b.h-20);
    const rx = px((X0+X1)/2), ry = py((Y0+Y1)/2);
    cx.strokeStyle = '#2f3a2c'; cx.lineWidth = 5; cx.beginPath(); cx.moveTo(rx-30, ry+20); cx.lineTo(rx+30, ry-35); cx.stroke();
    for (let f=0; f<5; f++){ cx.fillStyle = '#3a4434'; cx.beginPath(); cx.arc(rx - 26 + f*11, ry + 16 - f*9, 7, 0, 7); cx.fill(); }
    cx.fillStyle = '#b22234'; cx.fillRect(rx+30, ry-35, 26, 16); cx.fillStyle = '#fff'; for (let s=1;s<5;s+=2) cx.fillRect(rx+30, ry-35+s*3.2, 26, 3.2); cx.fillStyle = '#3c3b6e'; cx.fillRect(rx+30, ry-35, 11, 8); return;
  }
  // walls
  const wall = (ax, ay, bx2, by2, cx2, cy2, dx2, dy2, col) => { cx.fillStyle = col; cx.beginPath(); cx.moveTo(ax, ay); cx.lineTo(bx2, by2); cx.lineTo(cx2, cy2); cx.lineTo(dx2, dy2); cx.closePath(); cx.fill(); };
  if (camY > Y1) wall(X0, Y1, X1, Y1, rX1, rY1, rX0, rY1, wallC);
  if (camY < Y0) wall(X0, Y0, X1, Y0, rX1, rY0, rX0, rY0, wallD);
  if (camX > X1) wall(X1, Y0, X1, Y1, rX1, rY1, rX1, rY0, wallD);
  if (camX < X0) wall(X0, Y0, X0, Y1, rX0, rY1, rX0, rY0, wallC);
  // window rows on walls (south/north)
  const floors = Math.max(1, Math.floor(b.H / 14));
  cx.fillStyle = isNight() ? 'rgba(255,214,120,.55)' : 'rgba(30,40,55,.45)';
  if (camY > Y1 && rY1 - Y1 > 6) for (let f=1; f<floors; f++){ const tt = f / floors, yy = Y1 + (rY1 - Y1) * tt, xa = X0 + (rX0 - X0) * tt, xb = X1 + (rX1 - X1) * tt; for (let w=xa+6; w<xb-8; w+=14) if (hash(b.seed + f*13 + w) > .25) cx.fillRect(w, yy - 2, 7, Math.max(1.5, (rY1 - Y1) / floors * .5)); }
  if (D.id==='nola' && camY > Y1 && rY1 - Y1 > 8){ cx.strokeStyle = '#151515'; cx.lineWidth = 1.5; for (let f=1; f<floors; f++){ const tt = (f - .4) / floors, yy = Y1 + (rY1 - Y1) * tt, xa = X0 + (rX0 - X0) * tt, xb = X1 + (rX1 - X1) * tt; cx.beginPath(); cx.moveTo(xa, yy); cx.lineTo(xb, yy); cx.stroke(); for (let w=xa; w<xb; w+=5){ cx.beginPath(); cx.moveTo(w, yy); cx.lineTo(w, yy + 3); cx.stroke(); } } }
  // roof
  const rw = rX1 - rX0, rh = rY1 - rY0;
  if (b.kind==='dome'){
    const g = cx.createRadialGradient(rX0 + rw*.4, rY0 + rh*.4, 10, rX0 + rw/2, rY0 + rh/2, rw*.55); g.addColorStop(0, '#f4f2ea'); g.addColorStop(1, '#a8a49a');
    cx.fillStyle = g; cx.beginPath(); cx.ellipse(rX0 + rw/2, rY0 + rh/2, rw/2, rh/2, 0, 0, 7); cx.fill();
    cx.strokeStyle = 'rgba(0,0,0,.15)'; cx.lineWidth = 2; for (let k2=1;k2<5;k2++){ cx.beginPath(); cx.ellipse(rX0 + rw/2, rY0 + rh/2, rw/2*k2/5, rh/2*k2/5, 0, 0, 7); cx.stroke(); }
    return;
  }
  cx.fillStyle = b.col; cx.fillRect(rX0, rY0, rw, rh);
  cx.strokeStyle = shade(b.col, .75); cx.lineWidth = 3; cx.strokeRect(rX0 + 1.5, rY0 + 1.5, rw - 3, rh - 3);
  if (b.kind==='cathedral'){
    cx.fillStyle = '#d9d4c4'; cx.fillRect(rX0 + rw*.1, rY0 + rh*.2, rw*.8, rh*.6);
    for (const f of [.2, .5, .8]){ const sx = rX0 + rw*f, sy = rY0 + rh*.2; cx.fillStyle = '#2b2e33'; cx.beginPath(); cx.moveTo(sx - 12, sy); cx.lineTo(sx, sy - 22); cx.lineTo(sx + 12, sy); cx.closePath(); cx.fill(); cx.fillStyle = '#c9a43a'; cx.fillRect(sx - 1, sy - 30, 2, 8); }
    return;
  }
  if (b.kind==='safe'){ cx.fillStyle = '#3cc86e'; cx.font = "900 18px 'Barlow Condensed'"; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('LEVEL 29 SAFEHOUSE', rX0 + rw/2, rY0 + rh/2); return; }
  if (b.kind==='helipad'){ cx.fillStyle = '#3b4148'; cx.beginPath(); cx.arc(rX0 + rw/2, rY0 + rh/2, Math.min(rw, rh)*.36, 0, 7); cx.fill(); cx.strokeStyle = '#f4c355'; cx.lineWidth = 3; cx.stroke(); cx.fillStyle = '#f4f4f0'; cx.font = "900 " + Math.round(Math.min(rw,rh)*.34) + "px 'Barlow Condensed'"; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('H', rX0 + rw/2, rY0 + rh/2 + 2); return; }
  // AC units / vents
  const n = 2 + Math.floor(hash(b.seed) * 4);
  for (let i=0;i<n;i++){ const ax = rX0 + 10 + hash(b.seed + i*3) * (rw - 34), ay = rY0 + 10 + hash(b.seed + i*7) * (rh - 30); cx.fillStyle = 'rgba(0,0,0,.18)'; cx.fillRect(ax + 3, ay + 3, 18, 14); cx.fillStyle = shade(b.col, 1.12); cx.fillRect(ax, ay, 18, 14); cx.strokeStyle = shade(b.col, .7); cx.lineWidth = 1; cx.beginPath(); cx.arc(ax + 9, ay + 7, 4, 0, 7); cx.stroke(); }
  if (b.kind==='tower'){ cx.strokeStyle = 'rgba(255,255,255,.18)'; cx.lineWidth = 1; cx.strokeRect(rX0 + 10, rY0 + 10, rw - 20, rh - 20); cx.fillStyle = '#c33'; cx.fillRect(rX0 + rw/2 - 2, rY0 + rh/2 - 2, 4, 4); }
}
function drawTree(t){
  const k = .0017 * 26, x = t.x + (t.x - camX) * k, y = t.y + (t.y - camY) * k;
  cx.fillStyle = 'rgba(0,0,0,.25)'; cx.beginPath(); cx.arc(t.x + 4, t.y + 4, t.r, 0, 7); cx.fill();
  if (t.palm){ cx.strokeStyle = '#5a4a32'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(t.x, t.y); cx.lineTo(x, y); cx.stroke(); cx.fillStyle = D.id==='pi' ? '#3a5a2a' : '#2f6a33'; for (let a=0;a<7;a++){ cx.save(); cx.translate(x, y); cx.rotate(a * .9 + t.x); cx.beginPath(); cx.ellipse(t.r*.6, 0, t.r*.75, 3.5, 0, 0, 7); cx.fill(); cx.restore(); } return; }
  const c = D.id==='lej' ? '#24452a' : '#2f5a2c';
  cx.fillStyle = c; cx.beginPath(); cx.arc(x, y, t.r, 0, 7); cx.fill();
  cx.fillStyle = shade(c, 1.25); cx.beginPath(); cx.arc(x - t.r*.3, y - t.r*.3, t.r*.55, 0, 7); cx.fill();
  if (D.id==='nola' && hash(t.x) > .5) for (let k2=0;k2<6;k2++){ cx.fillStyle = ['#8a00a8','#3fbf3f','#f5b800'][k2%3]; cx.fillRect(x + (hash(t.x + k2)-.5)*t.r*1.6, y + (hash(t.y + k2)-.5)*t.r*1.6, 2.5, 2.5); }
}
function drawCar(c){
  const s = c.spec, L = s.len, W = s.wid;
  cx.save(); cx.translate(c.x, c.y); cx.rotate(c.a);
  cx.fillStyle = 'rgba(0,0,0,.3)'; cx.fillRect(-L/2 + 3, -W/2 + 3, L, W);
  if (c.dead){ cx.fillStyle = '#1f1d1b'; rr(-L/2, -W/2, L, W, 5); cx.fill(); cx.fillStyle = '#2b2826'; cx.fillRect(-L*.25, -W*.35, L*.5, W*.7); cx.restore(); return; }
  const col = c.col;
  cx.fillStyle = '#121212'; for (const [wx, wy] of [[L*.28, -W/2], [L*.28, W/2 - 3], [-L*.28, -W/2], [-L*.28, W/2 - 3]]) cx.fillRect(wx - 5, wy - 1, 10, 4);
  cx.fillStyle = col; rr(-L/2, -W/2, L, W, 6); cx.fill();
  cx.fillStyle = shade(col, .78); cx.fillRect(-L/2 + 2, -W/2 + 2, L - 4, 3); cx.fillRect(-L/2 + 2, W/2 - 5, L - 4, 3);
  if (c.type==='pickup' || c.type==='mtvr' || c.type==='truck'){
    const cabL = c.type==='truck' ? .3 : .38;
    cx.fillStyle = shade(col, .85); cx.fillRect(-L/2 + 4, -W/2 + 4, L*(1-cabL) - 8, W - 8);
    if (c.type==='mtvr'){ cx.fillStyle = '#4a5030'; cx.fillRect(-L/2 + 4, -W/2 + 4, L*(1-cabL) - 8, W - 8); cx.strokeStyle = '#3a4024'; cx.lineWidth = 1; for (let k=1;k<5;k++){ cx.beginPath(); cx.moveTo(-L/2 + 4 + k*(L*(1-cabL)-8)/5, -W/2+4); cx.lineTo(-L/2 + 4 + k*(L*(1-cabL)-8)/5, W/2-4); cx.stroke(); } }
    cx.fillStyle = '#1d2a36'; cx.fillRect(L/2 - L*cabL, -W/2 + 3, 6, W - 6);
    cx.fillStyle = shade(col, 1.1); cx.fillRect(L/2 - L*cabL + 6, -W/2 + 3, L*cabL - 14, W - 6);
    cx.fillStyle = '#2a3a4a'; cx.fillRect(L/2 - 9, -W/2 + 3, 5, W - 6);
  } else {
    cx.fillStyle = '#1d2a36'; cx.fillRect(L*.08, -W/2 + 3, L*.16, W - 6); cx.fillRect(-L*.36, -W/2 + 3, L*.1, W - 6);
    if (!s.open){ cx.fillStyle = shade(col, 1.08); cx.fillRect(-L*.26, -W/2 + 3, L*.34, W - 6); }
    else { cx.fillStyle = '#3a2a22'; cx.fillRect(-L*.26, -W/2 + 3, L*.34, W - 6); }
  }
  if (c.type==='taxi'){ cx.fillStyle = '#222'; cx.fillRect(-L*.12, -4, 8, 8); }
  if (c.type==='humvee'){ cx.fillStyle = '#2f3416'; cx.fillRect(-L*.18, -W*.28, L*.2, W*.56); cx.fillStyle = '#6b6b3a'; for (let k=0;k<4;k++) cx.fillRect(-L/2 + 6 + hash(k+c.x)*L*.7, -W/2 + 4 + hash(k*3+c.y)*W*.6, 6, 4); }
  if (s.police){ cx.fillStyle = '#1b1b1b'; cx.fillRect(-L*.3, -W/2, L*.6, 3); cx.fillRect(-L*.3, W/2 - 3, L*.6, 3); const on = c.siren && frame % 16 < 8; cx.fillStyle = on ? '#ff2a2a' : '#7a1a1a'; cx.fillRect(-L*.1, -W*.3, 6, W*.3); cx.fillStyle = (c.siren && !on) ? '#2a6aff' : '#1a2a6a'; cx.fillRect(-L*.1, 0, 6, W*.3); }
  if (c.type==='lowrider'){ cx.strokeStyle = '#f4c355'; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(-L*.4, 0); cx.lineTo(L*.4, 0); cx.stroke(); }
  if (c.type==='sports'){ cx.fillStyle = '#111'; cx.fillRect(-L*.48, -W*.4, 4, W*.8); cx.fillStyle = 'rgba(255,255,255,.7)'; cx.fillRect(-L*.45, -2, L*.9, 4); }
  cx.fillStyle = c.driven || isNight() ? '#fff6c8' : '#d9d6c8'; cx.fillRect(L/2 - 3, -W/2 + 2, 3, 5); cx.fillRect(L/2 - 3, W/2 - 7, 3, 5);
  cx.fillStyle = c.v < -.2 || (c.driven && kD()) ? '#ff3a2a' : '#8a1a1a'; cx.fillRect(-L/2, -W/2 + 2, 3, 5); cx.fillRect(-L/2, W/2 - 7, 3, 5);
  if (c.hp < c.maxHp * .5){ cx.strokeStyle = 'rgba(20,20,20,.55)'; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(L*.2, -W*.3); cx.lineTo(L*.32, W*.1); cx.moveTo(-L*.2, W*.2); cx.lineTo(-L*.05, -W*.1); cx.stroke(); }
  if (c.driven){ cx.save(); cx.rotate(-c.a); if (head.complete) cx.drawImage(head, -9, -10, 18, 19); cx.restore(); }
  cx.restore();
}
function rr(x, y, w, h, r){ cx.beginPath(); cx.moveTo(x + r, y); cx.lineTo(x + w - r, y); cx.quadraticCurveTo(x + w, y, x + w, y + r); cx.lineTo(x + w, y + h - r); cx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); cx.lineTo(x + r, y + h); cx.quadraticCurveTo(x, y + h, x, y + h - r); cx.lineTo(x, y + r); cx.quadraticCurveTo(x, y, x + r, y); cx.closePath(); }
const CAMO = ['#4b5320','#6b6b3a','#2f3416','#8a7a50'];
function drawPlayer(p){
  cx.save(); cx.translate(p.x, p.y);
  cx.fillStyle = 'rgba(0,0,0,.3)'; cx.beginPath(); cx.ellipse(3, 4, 13, 10, 0, 0, 7); cx.fill();
  cx.save(); cx.rotate(p.aim);
  const sw = Math.sin(p.anim) * 5 * (Math.hypot(p.vx, p.vy) > .4 ? 1 : 0);
  // legs (camo cargo pants)
  cx.fillStyle = CAMO[0]; cx.fillRect(-4 + sw, -8, 9, 6); cx.fillRect(-4 - sw, 2, 9, 6);
  cx.fillStyle = CAMO[2]; cx.fillRect(-2 + sw, -7, 3, 3); cx.fillRect(1 - sw, 4, 3, 2);
  cx.fillStyle = '#111'; cx.fillRect(4 + sw, -8, 3, 6); cx.fillRect(4 - sw, 2, 3, 6);
  // torso (black shirt)
  cx.fillStyle = '#0d0d0d'; cx.beginPath(); cx.ellipse(0, 0, 8, 12, 0, 0, 7); cx.fill();
  if (up.armor){ cx.fillStyle = '#3a3f2a'; cx.beginPath(); cx.ellipse(0, 0, 6, 10, 0, 0, 7); cx.fill(); }
  // M240
  cx.fillStyle = '#1b1b1b'; cx.fillRect(-2, 3, 30, 5); cx.fillStyle = '#2d2d2d'; cx.fillRect(4, 2, 12, 7); cx.fillStyle = '#4b5320'; cx.fillRect(6, 8, 7, 5);
  cx.fillStyle = '#d4a017'; cx.fillRect(9, 7, 4, 1.5); cx.fillStyle = '#111'; cx.fillRect(28, 3.5, 4, 4);
  if (p.overheat){ cx.fillStyle = 'rgba(255,90,40,.7)'; cx.fillRect(16, 4, 12, 3); }
  if (p.flash > 0){ cx.fillStyle = '#fff3a0'; cx.beginPath(); cx.moveTo(32, 5.5); cx.lineTo(46, 0); cx.lineTo(42, 5.5); cx.lineTo(48, 5.5); cx.lineTo(42, 7); cx.lineTo(46, 12); cx.closePath(); cx.fill(); }
  // arms
  cx.fillStyle = '#e8b98a'; cx.fillRect(10, 1, 5, 4); cx.fillRect(3, 6, 4, 4);
  cx.restore();
  if (p.carrying){ cx.fillStyle = '#4b5320'; cx.fillRect(-10, -26, 20, 14); cx.fillStyle = '#f4c355'; cx.fillRect(-10, -21, 20, 4); }
  // jester head (logo faces camera, GTA2-sprite style)
  if (head.complete) cx.drawImage(head, -11, -13, 22, 24);
  cx.restore();
}
function drawZombie(z){
  const s = z.type==='brute' ? 1.55 : 1;
  cx.save(); cx.translate(z.x, z.y);
  cx.fillStyle = 'rgba(0,0,0,.28)'; cx.beginPath(); cx.ellipse(3, 4, 11*s, 9*s, 0, 0, 7); cx.fill();
  cx.rotate(z.a); cx.scale(s, s);
  const W = z.flash > 0, col = c => W ? '#fff' : c;
  const skin = z.type==='runner' ? '#a3bc6c' : z.type==='brute' ? '#6f8a58' : '#86a46e';
  const sw = Math.sin(z.anim) * 4;
  cx.fillStyle = col(z.military ? CAMO[0] : '#2e3a52'); cx.fillRect(-4 + sw, -7, 8, 5); cx.fillRect(-4 - sw, 2, 8, 5);
  cx.fillStyle = col(z.shirt); cx.beginPath(); cx.ellipse(0, 0, 7, 10, 0, 0, 7); cx.fill();
  if (z.military && !W){ cx.fillStyle = CAMO[2]; cx.fillRect(-3, -5, 4, 3); cx.fillRect(1, 3, 3, 3); cx.fillStyle = CAMO[3]; cx.fillRect(-5, 1, 3, 2); }
  cx.fillStyle = col('#7a1a1a'); cx.fillRect(-2, 2, 3, 3);
  // arms reaching forward
  const reach = Math.sin(z.anim * .7) * 2;
  cx.fillStyle = col(skin); cx.fillRect(4, -9 + reach, 13, 3.5); cx.fillRect(4, 5.5 - reach, 13, 3.5);
  // head
  cx.fillStyle = col(skin); cx.beginPath(); cx.arc(2, 0, 6.2, 0, 7); cx.fill();
  cx.fillStyle = W ? '#fff' : '#ff3030'; cx.fillRect(5, -3, 2, 2); cx.fillRect(5, 1.5, 2, 2);
  if (z.military && z.v < .5){ cx.fillStyle = col(CAMO[0]); cx.beginPath(); cx.arc(1, 0, 6.5, Math.PI*.5, Math.PI*1.5); cx.fill(); }
  else { cx.fillStyle = col('#3a2a1a'); cx.beginPath(); cx.arc(0, 0, 5.5, Math.PI*.6, Math.PI*1.4); cx.fill(); }
  cx.restore();
  if (z.type==='brute' && z.hp < z.maxHp){ cx.fillStyle = '#000'; cx.fillRect(z.x - 16, z.y - 28, 32, 4); cx.fillStyle = '#e83a3a'; cx.fillRect(z.x - 15, z.y - 27, 30 * z.hp / z.maxHp, 2); }
}
function drawCorpse(q){
  cx.save(); cx.translate(q.x, q.y); cx.rotate(q.a + 1.2); cx.globalAlpha = Math.min(1, q.t / 60) * .9;
  const s = (q.r || 10) / 10;
  cx.scale(s, s);
  cx.fillStyle = q.isPlayer ? '#0d0d0d' : q.shirt; cx.beginPath(); cx.ellipse(0, 0, 11, 7, 0, 0, 7); cx.fill();
  cx.fillStyle = q.isPlayer ? CAMO[0] : '#2e3a52'; cx.fillRect(-15, -5, 6, 4); cx.fillRect(-15, 1, 6, 4);
  if (q.isPlayer){ cx.restore(); cx.save(); cx.translate(q.x, q.y); if (head.complete) cx.drawImage(head, -11, -13, 22, 24); }
  else { cx.fillStyle = '#86a46e'; cx.beginPath(); cx.arc(12, 0, 5.5, 0, 7); cx.fill(); }
  cx.restore();
}
function drawSurvivor(s){
  cx.save(); cx.translate(s.x, s.y);
  cx.fillStyle = 'rgba(0,0,0,.28)'; cx.beginPath(); cx.ellipse(3, 4, 10, 8, 0, 0, 7); cx.fill();
  cx.fillStyle = s.shirt; cx.beginPath(); cx.ellipse(0, 0, 8, 10, 0, 0, 7); cx.fill();
  cx.fillStyle = '#d9a37a'; cx.beginPath(); cx.arc(0, 0, 5.5, 0, 7); cx.fill();
  cx.fillStyle = '#3a2a1a'; cx.beginPath(); cx.arc(-1, -1, 4.5, Math.PI, Math.PI*2); cx.fill();
  if (!s.following){ cx.fillStyle = '#fff'; const wv = Math.sin(s.anim*1.5)*4; cx.fillRect(8, -12 + wv, 3, 8); }
  cx.fillStyle = '#000'; cx.fillRect(-12, -18, 24, 4); cx.fillStyle = '#5fb7ff'; cx.fillRect(-11, -17, 22 * Math.max(0, s.hp) / 60, 2);
  cx.restore();
}
function drawBoss(B){
  if (B.dead && B.deadT > 120) return;
  const spec = B.spec, W = B.flash > 0, col = c => W ? '#fff' : c;
  cx.save(); cx.translate(B.x, B.y);
  if (B.dead) cx.globalAlpha = Math.max(0, 1 - B.deadT / 120);
  cx.fillStyle = 'rgba(0,0,0,.35)'; cx.beginPath(); cx.ellipse(6, 8, 34, 28, 0, 0, 7); cx.fill();
  if (B.mode==='charge' && B.t > 45){ cx.strokeStyle = 'rgba(255,60,40,.5)'; cx.lineWidth = 14; cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(Math.cos(B.a)*260, Math.sin(B.a)*260); cx.stroke(); }
  if (B.mode==='slam' && B.t > 10){ cx.strokeStyle = 'rgba(255,200,80,' + (.3 + .3*Math.sin(frame*.5)) + ')'; cx.lineWidth = 3; cx.beginPath(); cx.arc(0, 0, 170, 0, 7); cx.stroke(); }
  cx.rotate(B.a); cx.scale(3, 3);
  const sw = Math.sin(B.anim * 2) * 3;
  cx.fillStyle = col('#2a2a32'); cx.fillRect(-4 + sw, -7, 8, 5); cx.fillRect(-4 - sw, 2, 8, 5);
  cx.fillStyle = col(spec.shirt); cx.beginPath(); cx.ellipse(0, 0, 8, 11, 0, 0, 7); cx.fill();
  if (spec.hat==='tophat' && !W) for (let k=0;k<7;k++){ cx.fillStyle = ['#8a00a8','#3fbf3f','#f5b800'][k%3]; cx.fillRect(3, -6 + k*2, 1.6, 1.6); }
  cx.fillStyle = col('#7a1a1a'); cx.fillRect(-3, 3, 3, 3);
  const reach = B.mode==='spit' ? -3 : 0;
  cx.fillStyle = col(spec.skin); cx.fillRect(4, -10 + reach, 14, 4); cx.fillRect(4, 6 - reach, 14, 4);
  cx.beginPath(); cx.arc(2, 0, 6.5, 0, 7); cx.fill();
  cx.fillStyle = W ? '#fff' : (B.hp < B.maxHp*.4 ? '#ffea00' : '#ff2d2d'); cx.fillRect(5, -3, 2, 2); cx.fillRect(5, 1.5, 2, 2);
  if (spec.hat==='tophat'){ cx.fillStyle = col('#141414'); cx.beginPath(); cx.arc(1, 0, 7.5, 0, 7); cx.fill(); cx.fillStyle = col('#8a00a8'); cx.beginPath(); cx.arc(1, 0, 5, 0, 7); cx.fill(); cx.fillStyle = col('#141414'); cx.beginPath(); cx.arc(1, 0, 4, 0, 7); cx.fill(); }
  if (spec.hat==='cowboy'){ cx.fillStyle = col('#8a6a3a'); cx.beginPath(); cx.ellipse(1, 0, 10, 8, 0, 0, 7); cx.fill(); cx.fillStyle = col('#6a4e2a'); cx.beginPath(); cx.ellipse(1, 0, 5, 4, 0, 0, 7); cx.fill(); }
  if (spec.hat==='helmet'){ cx.fillStyle = col('#4b5320'); cx.beginPath(); cx.arc(1, 0, 7, 0, 7); cx.fill(); cx.fillStyle = col('#2f3416'); cx.fillRect(-2, -3, 2, 2); cx.fillRect(2, 2, 2, 2); }
  if (spec.hat==='campaign'){ cx.fillStyle = col('#8a6a3a'); cx.beginPath(); cx.arc(1, 0, 9.5, 0, 7); cx.fill(); cx.fillStyle = col('#a07e48'); cx.beginPath(); cx.moveTo(1, -5); cx.lineTo(5, 0); cx.lineTo(1, 5); cx.lineTo(-3, 0); cx.closePath(); cx.fill(); }
  if (spec.hat==='shades'){ cx.fillStyle = col('#111'); cx.fillRect(4.5, -4, 3, 8); cx.fillStyle = col('#c8a020'); cx.beginPath(); cx.arc(-1, 0, 5, Math.PI*.6, Math.PI*1.4); cx.fill(); }
  cx.restore();
}
function drawPickup(k){
  const b = Math.sin(frame * .1 + k.x) * 2;
  cx.save(); cx.translate(k.x, k.y + b);
  cx.fillStyle = 'rgba(0,0,0,.3)'; cx.beginPath(); cx.ellipse(2, 10 - b, 10, 4, 0, 0, 7); cx.fill();
  if (k.kind==='health'){ cx.fillStyle = '#ee2525'; cx.fillRect(-3, -10, 6, 20); cx.fillRect(-10, -3, 20, 6); }
  if (k.kind==='armor'){ cx.fillStyle = '#2a5ad0'; cx.beginPath(); cx.moveTo(0, -10); cx.lineTo(9, -6); cx.lineTo(7, 6); cx.lineTo(0, 10); cx.lineTo(-7, 6); cx.lineTo(-9, -6); cx.closePath(); cx.fill(); cx.strokeStyle = '#fff'; cx.lineWidth = 1.5; cx.stroke(); }
  if (k.kind==='cash'){ cx.fillStyle = '#2f8a3a'; cx.fillRect(-10, -6, 20, 12); cx.fillStyle = '#9fe0a0'; cx.font = "800 11px 'Barlow Condensed'"; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('$', 0, 1); }
  if (k.kind==='crate'){ cx.fillStyle = '#4b5320'; cx.fillRect(-13, -13, 26, 26); cx.fillStyle = '#f4c355'; cx.fillRect(-13, -3, 26, 6); cx.strokeStyle = '#2f3416'; cx.lineWidth = 2; cx.strokeRect(-13, -13, 26, 26); }
  if (k.kind==='power'){ cx.fillStyle = 'rgba(244,195,85,.3)'; cx.beginPath(); cx.arc(0, 0, 26 + Math.sin(frame*.2)*4, 0, 7); cx.fill(); cx.fillStyle = '#4b5320'; cx.fillRect(-14, -14, 28, 28); cx.fillStyle = '#f4c355'; cx.font = "900 14px 'Barlow Condensed'"; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('UP', 0, 1); }
  cx.restore();
}
function drawMissionWorld(vis){
  if (!mission) return;
  const tg = missionTarget();
  if (tg && tg.zone && vis(tg.x, tg.y, tg.zone)){ cx.fillStyle = tg.col + '22'; cx.beginPath(); cx.arc(tg.x, tg.y, tg.zone, 0, 7); cx.fill(); cx.strokeStyle = tg.col + '88'; cx.lineWidth = 3; cx.setLineDash([14, 10]); cx.stroke(); cx.setLineDash([]); }
  if (mission.phase==='active' && mission.info.type==='deliver' && mission.step==='drop'){ const d = mission.drop; cx.fillStyle = 'rgba(60,200,110,.25)'; cx.beginPath(); cx.arc(d.x, d.y, 50, 0, 7); cx.fill(); }
}
function drawMarkers(){
  const tg = missionTarget(); if (!tg) return;
  const pulse = 1 + Math.sin(frame * .12) * .15;
  cx.save(); cx.translate(tg.x, tg.y);
  cx.fillStyle = tg.col + '40'; cx.beginPath(); cx.arc(0, 0, 34 * pulse, 0, 7); cx.fill();
  cx.strokeStyle = tg.col; cx.lineWidth = 3; cx.beginPath(); cx.arc(0, 0, 26, 0, 7); cx.stroke();
  const bob = Math.sin(frame*.1)*5;
  cx.fillStyle = tg.col; cx.beginPath(); cx.moveTo(0, -30 + bob); cx.lineTo(-12, -52 + bob); cx.lineTo(12, -52 + bob); cx.closePath(); cx.fill();
  cx.fillStyle = '#13191d'; cx.font = "900 14px 'Barlow Condensed'"; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(tg.label, 0, -45 + bob);
  cx.restore();
}

// ---------- HUD ----------
function hudText(t, x, y, size, col, align, font){
  cx.font = (font || "800 ") + size + "px 'Barlow Condensed'"; cx.textAlign = align || 'left'; cx.textBaseline = 'top';
  cx.fillStyle = 'rgba(0,0,0,.75)'; cx.fillText(t, x + 2, y + 2); cx.fillStyle = col || '#fff'; cx.fillText(t, x, y);
}
function drawHUD(){
  const p = player, small = SW < 700 || SH < 500;
  // top right: cash + health + armor + heat skulls + weapon
  const R = SW - 18;
  if(!window.level29UnifiedHUD){
  hudText(money(cash), R, 14, small ? 26 : 34, '#7fe08a', 'right');
  const bw = small ? 140 : 190, bx = R - bw;
  let y = small ? 46 : 56;
  cx.fillStyle = 'rgba(0,0,0,.6)'; cx.fillRect(bx - 2, y - 2, bw + 4, 12);
  cx.fillStyle = p.hp < 30 && frame % 30 < 15 ? '#ff7a7a' : '#d23a3a'; cx.fillRect(bx, y, bw * Math.max(0, p.hp) / p.maxHp, 8);
  y += 14;
  if (p.armor > 0){ cx.fillStyle = 'rgba(0,0,0,.6)'; cx.fillRect(bx - 2, y - 2, bw + 4, 10); cx.fillStyle = '#4a82e8'; cx.fillRect(bx, y, bw * p.armor / (50 + up.armor*25), 6); y += 12; }
  // horde skulls
  for (let k=0;k<5;k++){ const on = heat > k + .05; drawSkull(R - 12 - (4-k)*24, y + 14, on, on && heat >= 4 && frame % 30 < 15); }
  y += 32;
  // weapon panel
  cx.fillStyle = 'rgba(0,0,0,.55)'; cx.fillRect(R - bw, y, bw, 34);
  if (typeof drawWeaponPanel === 'function' && drawWeaponPanel(R, bw, y)) {} else {
  hudText('M240', R - bw + 8, y + 4, 16, p.overheat ? '#ff7a4a' : '#f4c355');
  cx.fillStyle = '#222'; cx.fillRect(R - bw + 52, y + 12, bw - 62, 9);
  cx.fillStyle = p.overheat ? '#ff3a1a' : p.heat > 70 ? '#ff9a2a' : '#f4c355'; cx.fillRect(R - bw + 52, y + 12, (bw - 62) * p.heat / 100, 9);
  hudText(p.overheat ? 'OVERHEAT' : '∞ BELT', R - 8, y + 22, 10, '#c9d1d4', 'right', '600 '); }
  y += 40;
  if (p.car){ const c = p.car; cx.fillStyle = 'rgba(0,0,0,.55)'; cx.fillRect(R - bw, y, bw, 22); hudText(c.spec.name, R - bw + 8, y + 3, 14, '#fff'); cx.fillStyle = '#222'; cx.fillRect(R - 70, y + 8, 62, 7); cx.fillStyle = c.hp < c.maxHp*.35 ? '#ff6a2a' : '#7fe08a'; cx.fillRect(R - 70, y + 8, 62 * c.hp / c.maxHp, 7); y += 26; hudText(Math.round(Math.abs(c.v) * 12) + ' MPH', R - 8, y, 14, '#fff', 'right'); }
  // power-up chips
  const chips = [];
  if (up.rapid) chips.push('RAPID ×' + up.rapid); if (up.spread) chips.push(up.spread > 1 ? 'WIDE SPREAD' : 'SPREAD'); if (up.armor) chips.push('ARMOR ×' + up.armor);
  if (up.nitro) chips.push('NITRO'); if (up.cool) chips.push('COOLING ×' + up.cool); if (up.ap) chips.push('AP ×' + up.ap); if (up.tough) chips.push('TOUGH RIDES ×' + up.tough);
  if (chips.length){ y += 6; chips.forEach((ch, k) => { if (!small || k < 4) hudText(ch, R, y + k*16, small ? 10 : 12, '#9fdcab', 'right', '600 '); }); }
  // DOM actions start after the actual status stack (armor, vehicle and upgrade chips included).
  document.documentElement.style.setProperty('--hud-status-bottom', (y + (chips.length ? Math.min(chips.length, small ? 4 : chips.length) * 16 : 0) + 14) + 'px');
  }
  // mission panel top-left
  if (mission){
    const info = mission.info;
    hudText('MISSION ' + (info.i+1) + ' / ' + CAMPAIGN_TOTAL, 18, 14, 14, '#f4c355');
    hudText(info.title.toUpperCase(), 18, 30, small ? 22 : 28, '#fff');
    cx.font = "600 " + (small ? 12 : 14) + "px 'IBM Plex Mono'";
    const lines = wrap(objective, small ? SW - 200 : 430);
    lines.forEach((l, i) => { cx.fillStyle = 'rgba(0,0,0,.7)'; cx.fillText(l, 20, (small ? 58 : 66) + i*18 + 2); cx.fillStyle = '#d7dde0'; cx.fillText(l, 18, (small ? 58 : 66) + i*18); });
    if (mission.phase==='active' && mission.timer > 0 && !(info.type==='race' && !mission.started)){ const s = Math.ceil(mission.timer / 60); hudText(Math.floor(s/60) + ':' + String(s%60).padStart(2,'0'), 18, (small ? 62 : 72) + lines.length*18, small ? 22 : 30, s < 20 && frame % 30 < 15 ? '#ff5a4a' : '#fff'); }
  }
  // boss bar
  if (boss && !boss.dead){ const w = Math.min(560, SW - 60), x = (SW - w)/2, by = SH - (small ? 150 : 58); cx.fillStyle = 'rgba(0,0,0,.7)'; cx.fillRect(x - 4, by - 22, w + 8, 38); hudText(boss.name, SW/2, by - 20, 14, '#ff8a8a', 'center'); cx.fillStyle = '#3a0a0a'; cx.fillRect(x, by - 2, w, 10); cx.fillStyle = boss.hp < boss.maxHp*.4 ? '#ffea00' : '#e83a3a'; cx.fillRect(x, by - 2, w * boss.hp / boss.maxHp, 10); }
  // minimap
  drawMinimap(small);
  fpHUD(small);
  // area name bottom-right (GTA style)
  if (areaShow > 0 && !boss){ cx.globalAlpha = Math.min(1, areaShow / 30); if (small && SH >= 600){ hudText(areaName, 18, SH - 350, 17, '#f6f3e6', 'left'); hudText(D.name, 18, SH - 328, 12, '#f4c355', 'left', '600 '); } else { hudText(areaName, SW - 18, SH - (small ? 150 : 104), small ? 20 : 28, '#f6f3e6', 'right'); hudText(D.name, SW - 18, SH - (small ? 124 : 76), 13, '#f4c355', 'right', '600 '); } cx.globalAlpha = 1; }
  if (vehShow){ cx.globalAlpha = Math.min(1, vehShow.t / 30); hudText(vehShow.txt, SW - 18, SH - (small ? 176 : 138), 18, '#9fd0ff', 'right'); cx.globalAlpha = 1; }
  // toast
  if (toastQ){ cx.globalAlpha = Math.min(1, toastQ.life / 30); hudText(toastQ.t, SW/2, small ? 120 : 90, 18, '#f4c355', 'center'); cx.globalAlpha = 1; }
  // Portrait captions for every speaking character.
  if(subtitle&&window.drawCharacterCaption)window.drawCharacterCaption(subtitle);
  // banner
  if (banner){
    const a = Math.min(1, banner.t / 25);
    cx.globalAlpha = a;
    const col = banner.good ? '#f4c355' : banner.bad ? '#ff4d4d' : '#f6f3e6';
    cx.fillStyle = 'rgba(0,0,0,.45)'; cx.fillRect(0, SH*.32, SW, small ? 92 : 120);
    hudText(banner.big, SW/2, SH*.32 + 10, small ? 44 : 68, col, 'center', '900 ');
    hudText(banner.small, SW/2, SH*.32 + (small ? 62 : 84), small ? 14 : 18, '#e8e8e2', 'center', '600 ');
    cx.globalAlpha = 1;
  }
  if (state==='pause'){ cx.fillStyle = 'rgba(10,14,18,.7)'; cx.fillRect(0, 0, SW, SH); hudText('PAUSED', SW/2, SH/2 - 60, 72, '#f6f3e6', 'center', '900 '); hudText('P to resume · TAB map · Q weapons · T cheat codes · N music · M mute', SW/2, SH/2 + 24, 16, '#c9d1d4', 'center', '600 '); }
  if (state==='win'){ cx.fillStyle = 'rgba(10,14,18,.85)'; cx.fillRect(0, 0, SW, SH); hudText('THE CITY IS YOURS', SW/2, SH/2 - 80, small ? 46 : 80, '#f4c355', 'center', '900 '); hudText('All ' + CAMPAIGN_TOTAL + ' missions complete · ' + money(cash), SW/2, SH/2 + 20, 20, '#fff', 'center', '600 '); }
  if (showMap) drawFullMap();
}
function wrap(t, w){ const words = t.split(' '), out = ['']; for (const wd of words){ const tryL = (out[out.length-1] + ' ' + wd).trim(); if (cx.measureText(tryL).width > w && out[out.length-1]) out.push(wd); else out[out.length-1] = tryL; } return out; }
function drawSkull(x, y, on, flash){
  cx.save(); cx.translate(x, y); cx.globalAlpha = on ? 1 : .3;
  cx.fillStyle = flash ? '#ff4d4d' : on ? '#f6f3e6' : '#777';
  cx.beginPath(); cx.arc(0, -2, 9, 0, 7); cx.fill(); cx.fillRect(-5, 4, 10, 6);
  cx.fillStyle = '#13191d'; cx.beginPath(); cx.arc(-3.5, -2, 2.6, 0, 7); cx.arc(3.5, -2, 2.6, 0, 7); cx.fill(); cx.fillRect(-1, 2, 2, 3); cx.fillRect(-3, 7, 1.5, 3); cx.fillRect(1.5, 7, 1.5, 3);
  cx.restore();
}
function drawMinimap(small){
  const S = small ? 100 : 180, X = 18, Y = small ? Math.max(110, SH - S - (SH >= 600 ? 198 : 150)) : SH - S - 18, scale = 3 / TILE * (small ? .9 : 1.15);
  const p = player, ox = p.car ? p.car.x : p.x, oy = p.car ? p.car.y : p.y;
  cx.save();
  cx.fillStyle = 'rgba(0,0,0,.6)'; cx.fillRect(X - 4, Y - 4, S + 8, S + 8);
  cx.beginPath(); cx.rect(X, Y, S, S); cx.clip();
  cx.translate(X + S/2, Y + S/2);
  cx.drawImage(miniCv, -ox * scale, -oy * scale, MW*TILE*scale, MH*TILE*scale);
  for (const z of zombies){ const zx = (z.x - ox) * scale, zy = (z.y - oy) * scale; if (Math.abs(zx) < S/2 && Math.abs(zy) < S/2){ cx.fillStyle = '#ff4d4d'; cx.fillRect(zx - 1, zy - 1, 2.5, 2.5); } }
  const sx = (city.safe.x - ox) * scale, sy = (city.safe.y - oy) * scale;
  blip(clamp(sx, -S/2+6, S/2-6), clamp(sy, -S/2+6, S/2-6), '#3cc86e', 'S');
  if (typeof extraBlips === 'function') for (const b of extraBlips()){ const bx = (b.x - ox) * scale, by = (b.y - oy) * scale; if (Math.abs(bx) < S/2 - 6 && Math.abs(by) < S/2 - 6) blip(bx, by, b.col, b.label); }
  const tg = missionTarget();
  if (tg){ const tx = (tg.x - ox) * scale, ty = (tg.y - oy) * scale; blip(clamp(tx, -S/2+7, S/2-7), clamp(ty, -S/2+7, S/2-7), tg.col, tg.label); }
  cx.rotate(p.car ? p.car.a : p.aim); cx.fillStyle = '#fff'; cx.beginPath(); cx.moveTo(7, 0); cx.lineTo(-5, -5); cx.lineTo(-3, 0); cx.lineTo(-5, 5); cx.closePath(); cx.fill();
  cx.restore();
  hudText('N', X + S/2, Y + 2, 11, '#f4c355', 'center', '800 ');
}
function blip(x, y, col, label){ cx.fillStyle = col; cx.beginPath(); cx.arc(x, y, 6, 0, 7); cx.fill(); cx.fillStyle = '#13191d'; cx.font = "900 9px 'Barlow Condensed'"; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(label, x, y + .5); }
function drawFullMap(){
  const S = Math.min(SW, SH) - 80, X = (SW - S)/2, Y = (SH - S)/2, sc = S / WORLD;
  cx.fillStyle = 'rgba(8,10,12,.88)'; cx.fillRect(0, 0, SW, SH);
  cx.drawImage(miniCv, X, Y, S, S);
  cx.font = "600 10px 'IBM Plex Mono'"; cx.textBaseline = 'middle';
  ROADS.forEach((r, i) => { cx.save(); cx.translate(X + (r+1.5)*TILE*sc, Y + 18); cx.rotate(Math.PI/2); cx.fillStyle = '#13191d'; cx.textAlign = 'left'; cx.fillText(D.v[i], 0, 0); cx.restore(); cx.fillStyle = '#13191d'; cx.textAlign = 'left'; cx.fillText(D.h[i], X + 8, Y + (r+1.5)*TILE*sc); });
  const p = player, ox = p.car ? p.car.x : p.x, oy = p.car ? p.car.y : p.y;
  blip(X + city.safe.x*sc, Y + city.safe.y*sc, '#3cc86e', 'S');
  if (typeof extraBlips === 'function') for (const b of extraBlips()) blip(X + b.x*sc, Y + b.y*sc, b.col, b.label);
  const tg = missionTarget(); if (tg) blip(X + tg.x*sc, Y + tg.y*sc, tg.col, tg.label);
  cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(X + ox*sc, Y + oy*sc, 5, 0, 7); cx.fill();
  hudText(D.name + ' · CITY MAP', SW/2, Y - 34, 24, '#f4c355', 'center', '900 ');
  hudText('TAB to close', SW/2, Y + S + 8, 13, '#c9d1d4', 'center', '600 ');
}

// ---------- Menu backdrop ----------
function menuBackdrop(){
  if (!city){ travelToMenu(); }
  camY = 34 * TILE + Math.sin(frame * .002) * 300; camX = (camX % (WORLD - 800));
}
function clearSpawn(){ const bx = player.x, by = player.y; for (const [dx, dy] of [[0,0],[0,40],[0,-60],[45,0],[-45,0],[45,40],[-45,40],[0,80]]){ const x = bx + dx, y = by + dy; if (!blockedCircle(x, y, 12) && !cars.some(c => !c.dead && dist(c.x, c.y, x, y) < 40)){ player.x = x; player.y = y; return; } } }
function travelToMenu(){ D = DISTRICTS[0]; city = genCity(0); renderGround(); cars = city.parked.map(p => makeCar(p.x, p.y, p.a, p.type)); player = newPlayer(city.safe.x, city.safe.y); camX = 20*TILE; zombies = []; for (let k=0;k<40;k++){ const p = randomRoadPoint(30*TILE, 34*TILE, 50, 900); if (p) spawnZombieAt(p.x, p.y); } }

// ---------- Loop ----------
let last = performance.now(), accT = 0;
const loopErrors = new Map();
function reportLoopError(where, e){
  const key = where + ':' + (e && e.message);
  const n = (loopErrors.get(key) || 0) + 1; loopErrors.set(key, n);
  if (n === 1 || n % 600 === 0) console.error('[loop] ' + where + ' failed (x' + n + '):', e);
}
function loop(now){
  // Schedule first so a thrown error in one frame can never stop the game permanently.
  requestAnimationFrame(loop);
  if (window.bayouAdActive || document.hidden) { last = now; accT = 0; return; }
  // Avoid a catch-up spiral on a slow phone: at most three simulation steps per rendered frame.
  accT = Math.min(50, accT + Math.min(50, now - last)*(mpRole?1:(window.level29TimeScale||1))); last = now;
  let stepped = false; const stepStart=performance.now(); let steps=0;
  while (accT >= 1000/60){
    accT -= 1000/60; stepped = true;
    try { if (state==='menu'){ frame++; menuBackdrop(); for (const z of zombies){ z.a = z.wander; z.anim += .1; moveCircle(z, Math.cos(z.a)*.3, Math.sin(z.a)*.3, 8) && (z.wander += 2); } } else update(); }
    catch (e) { reportLoopError('update', e); }
    steps++; if(steps>=3 || performance.now()-stepStart>=8){accT=Math.min(accT,1000/60);break;}
  }
  try { updateMusic(); updateEngine(); } catch (e) { reportLoopError('audio', e); }
  // On 90/120Hz phones a frame with no simulation step would redraw an identical image; skipping it halves GPU load and heat.
  if (!stepped && window.L29_SKIP_IDLE_FRAMES) return;
  try { render(); } catch (e) { reportLoopError('render', e); }
}
