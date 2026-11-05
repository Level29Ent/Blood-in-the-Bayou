'use strict';
// Paid civilian careers. No paid shift changes campaign progress or mission checkpoints.
(function(){
const KEY='level29.jobs.v1';
const CAREERS={
 fire:{name:'Firefighter',boss:'FIRE CAPTAIN',col:'#ed9465',ranks:['PROBATIONARY','FIREFIGHTER','LIEUTENANT','CAPTAIN','BATTALION CHIEF'],jobs:[
  {id:'fire-calls',name:'First Response',pay:3600,mins:5,rank:0,hard:1,desc:'Four street fires, each with flare-ups, burn damage and drawn-in zombies. Stay back from the flames and hold U to spray. Each fire has an 80-second limit.',kind:'fire',count:4,hold:420},
  {id:'fire-rescue',name:'Rescue Detail',pay:6200,mins:6,rank:0,hard:1,desc:'Three fires and a trapped resident guarded by a horde. A failed call costs 20 percent of your pay.',kind:'rescue',count:3,hold:440},
  {id:'fire-major',name:'Major Incident',pay:11000,mins:7,rank:1,hard:1,desc:'Eight fires back to back with zombie ambushes. Three failed calls end the shift.',kind:'fire',count:8,hold:480},
  {id:'fire-chem',name:'Chemical Fire',pay:15500,mins:8,rank:2,hard:2,desc:'Six fierce chemical fires with fast flare-ups and brutes in the smoke.',kind:'fire',count:6,hold:560}]},
 police:{name:'Police',boss:'CAPTAIN SMITH',col:'#98b7f0',ranks:['CADET','OFFICER','CORPORAL','SERGEANT','CAPTAIN'],jobs:[
  {id:'police-patrol',name:'Cruiser Patrol',pay:3400,mins:5,rank:0,hard:1,desc:'Five checkpoints in your cruiser. Zombies ambush every stop and you must stay stopped for three seconds. A 60-second limit applies to each checkpoint.',kind:'patrol',count:5},
  {id:'police-clear',name:'Horde Response',pay:5800,mins:6,rank:0,hard:1,desc:'Clear three large zombie groups with runners and brutes within 90 seconds each. Failed calls reduce your pay.',kind:'clear',count:3},
  {id:'police-evidence',name:'Evidence Courier',pay:8200,mins:6,rank:1,hard:1,desc:'Recover three sealed cases under heavy ambush, then return to the station.',kind:'evidence',count:3},
  {id:'police-riot',name:'Riot Control',pay:14500,mins:8,rank:2,hard:2,desc:'Five massive hordes with several brutes each.',kind:'clear',count:5}]},
 gas:{name:'Gas Station',boss:'STATION MANAGER',col:'#efbd65',ranks:['TRAINEE','ATTENDANT','SHIFT LEAD','SUPERVISOR','MANAGER'],jobs:[
  {id:'gas-pumps',name:'Pump Attendant',pay:1500,mins:3,rank:0,desc:'Work the forecourt. Fuel four customer vehicles by standing beside each one and holding U.',kind:'fuel',count:4},
  {id:'gas-stock',name:'Stock Delivery',pay:2400,mins:4,rank:0,desc:'Take the delivery van to the market, collect two supply crates, and unload back at the station.',kind:'stock',count:2},
  {id:'gas-night',name:'Night Service',pay:3400,mins:4,rank:1,desc:'Handle six alternating fuel and repair jobs at the pumps, then close the shift.',kind:'service',count:6}]},
 hospital:{name:'Hospital',boss:'MEDICAL DISPATCH',col:'#9adbe0',ranks:['ORDERLY','MEDIC','SENIOR MEDIC','CHARGE NURSE','MEDICAL CHIEF'],jobs:[
  {id:'hospital-triage',name:'Ward Rounds',pay:2200,mins:4,rank:0,desc:'Use the elevator to treat patients on floors 1, 2 and 3. Hold U beside each marked patient.',kind:'triage',count:3},
  {id:'hospital-ambulance',name:'Ambulance Response',pay:4200,mins:5,rank:0,desc:'Drive the ambulance to two casualties. Stabilize each on foot, then return them to emergency intake.',kind:'ambulance',count:2},
  {id:'hospital-supplies',name:'Medical Logistics',pay:5600,mins:5,rank:1,desc:'Collect cold-chain supplies from two marked supply points and deliver them to the hospital.',kind:'medical',count:2}]},
 grocery:{name:'Fresh Market',boss:'STORE MANAGER',col:'#a8d18b',ranks:['STOCKER','CLERK','LEAD CLERK','ASSISTANT MANAGER','STORE MANAGER'],jobs:[
  {id:'grocery-shelves',name:'Shelf Restock',pay:1900,mins:3,rank:0,desc:'Restock five shelves inside the market. Hold U at each marker. A calm shift in a zombie-free building.',kind:'inside',count:5,hold:200,verb:'Restock shelf'},
  {id:'grocery-delivery',name:'Home Delivery',pay:3600,mins:5,rank:0,desc:'Drive the market van to three customers on foot and hand over their orders.',kind:'drop',count:3,hold:120,verb:'Deliver order'},
  {id:'grocery-night',name:'Night Delivery',pay:6400,mins:6,rank:1,desc:'Five late-night deliveries with zombie ambushes at each stop.',kind:'drop',count:5,hold:150,verb:'Deliver order',ambush:3}]},
 bank:{name:'Trust Bank',boss:'BRANCH MANAGER',col:'#e4c479',ranks:['TRAINEE TELLER','TELLER','SENIOR TELLER','COURIER LEAD','BRANCH MANAGER'],jobs:[
  {id:'bank-teller',name:'Teller Window',pay:2500,mins:3,rank:0,desc:'Serve five customers at the teller line. Hold U at each window marker.',kind:'inside',count:5,hold:210,verb:'Serve customer'},
  {id:'bank-armored',name:'Armored Transfer',pay:4800,mins:5,rank:0,desc:'Drive the armored van to three branches and hand over the cash cases on foot.',kind:'drop',count:3,hold:150,verb:'Hand over cash case',ambush:1},
  {id:'bank-vault',name:'Vault Run',pay:8800,mins:6,rank:1,desc:'Collect three cash cases from marked street points under heavy ambush.',kind:'crate',count:3,hold:220,verb:'Secure cash case',ambush:4}]},
 gym:{name:'Iron Gym',boss:'HEAD COACH',col:'#ec9a6b',ranks:['INTERN','TRAINER','SENIOR TRAINER','HEAD COACH','GYM OWNER'],jobs:[
  {id:'gym-sessions',name:'Training Sessions',pay:2200,mins:3,rank:0,desc:'Coach four clients in the gym. Hold U at each marked station.',kind:'inside',count:4,hold:230,verb:'Coach client'},
  {id:'gym-bootcamp',name:'Zombie Boot Camp',pay:5000,mins:5,rank:0,hard:1,desc:'Train fast by clearing three small hordes in the street. Failed calls reduce your pay.',kind:'clear',count:3,small:true},
  {id:'gym-pro',name:'Pro Athlete Program',pay:7600,mins:6,rank:1,hard:1,desc:'Two coaching sessions then two large hordes.',kind:'pro',count:2}]},
 garage:{name:'Mechanic',boss:'SHOP FOREMAN',col:'#e8bc64',ranks:['APPRENTICE','MECHANIC','SENIOR MECHANIC','MASTER MECHANIC','SHOP OWNER'],jobs:[
  {id:'garage-bay',name:'Bay Service',pay:2300,mins:3,rank:0,desc:'Service four vehicles on the garage floor. Hold U at each marked bay.',kind:'inside',count:4,hold:230,verb:'Service vehicle'},
  {id:'garage-roadside',name:'Roadside Repair',pay:4600,mins:5,rank:0,desc:'Drive the service truck to three broken-down cars and repair them on foot. Zombies ambush the last stop.',kind:'roadside',count:3,hold:300,verb:'Repair stranded car',ambush:1},
  {id:'garage-rush',name:'Breakdown Rush',pay:8200,mins:6,rank:1,desc:'Five breakdowns across the district with ambushes at every stop.',kind:'roadside',count:5,hold:320,verb:'Repair stranded car',ambush:3}]},
 armory:{name:'Armorer',boss:'HEAD ARMORER',col:'#e58e72',ranks:['APPRENTICE','GUNSMITH','SENIOR GUNSMITH','MASTER ARMORER','ARMORY CHIEF'],jobs:[
  {id:'armory-bench',name:'Weapon Maintenance',pay:2700,mins:3,rank:0,desc:'Clean and test five weapons at the armory bench. Hold U at each rack.',kind:'inside',count:5,hold:210,verb:'Maintain weapon'},
  {id:'armory-ammo',name:'Ammo Run',pay:5300,mins:5,rank:0,desc:'Drive the armory van to three outposts and unload ammo crates under zombie ambush.',kind:'drop',count:3,hold:150,verb:'Unload ammo crate',ambush:2},
  {id:'armory-range',name:'Live Fire Training',pay:8600,mins:6,rank:1,hard:1,desc:'Run two bench drills then clear three live-fire hordes.',kind:'pro',count:3,verb:'Run bench drill'}]},
 spray:{name:'Car Wash',boss:'WASH FOREMAN',col:'#73bddd',ranks:['ATTENDANT','DETAILER','SENIOR DETAILER','HEAD DETAILER','WASH OWNER'],jobs:[
  {id:'spray-wash',name:'Hand Wash',pay:2000,mins:3,rank:0,desc:'Hand-wash five cars in the wash bay. Hold U at each marked station.',kind:'inside',count:5,hold:190,verb:'Wash car'},
  {id:'spray-mobile',name:'Mobile Detail',pay:3900,mins:5,rank:0,desc:'Drive the detail van to three customers and detail their cars on foot.',kind:'roadside',count:3,hold:260,verb:'Detail customer car'},
  {id:'spray-valet',name:'Premium Valet',pay:6500,mins:6,rank:1,desc:'Five valet deliveries with ambushes on the street.',kind:'drop',count:5,hold:150,verb:'Deliver detailed car',ambush:2}]},
 business:{name:'Business Associate',boss:'OFFICE MANAGER',col:'#bea0dd',ranks:['INTERN','ASSOCIATE','ACCOUNT MANAGER','DIRECTOR','EXECUTIVE'],jobs:[
  {id:'business-filing',name:'Office Filing',pay:2400,mins:3,rank:0,desc:'File contracts at five desks in the office. Hold U at each marked desk.',kind:'inside',count:5,hold:200,verb:'File contracts'},
  {id:'business-courier',name:'Client Courier',pay:4400,mins:5,rank:0,desc:'Drive the company van to three clients and hand over their contracts. One ambush on the route.',kind:'drop',count:3,hold:150,verb:'Hand over contract',ambush:1},
  {id:'business-deal',name:'Deal Closer',pay:9000,mins:6,rank:1,desc:'Secure three signed deals from marked street points under heavy ambush. Requires ASSOCIATE rank.',kind:'crate',count:3,hold:230,verb:'Secure signed deal',ambush:4}]},
 safe:{name:'Safe House Crew',boss:'HOUSE KEEPER',col:'#8fd0a0',ranks:['RECRUIT','HOUSEHAND','QUARTERMASTER','HEAD OF HOUSE','GATEKEEPER'],jobs:[
  {id:'safe-chores',name:'House Chores',pay:1800,mins:3,rank:0,desc:'Restock four bunk and supply stations inside the safe house. Hold U at each marker.',kind:'inside',count:4,hold:200,verb:'Restock supplies'},
  {id:'safe-supply',name:'Supply Run',pay:4000,mins:5,rank:0,desc:'Drive the supply van to three drop points and unload under zombie ambush.',kind:'drop',count:3,hold:150,verb:'Unload supplies',ambush:2},
  {id:'safe-sweep',name:'Perimeter Sweep',pay:7200,mins:6,rank:1,hard:1,desc:'Clear three zombie groups near the safe house, runners and brutes included. Requires HOUSEHAND rank.',kind:'clear',count:3}]},
 farm:{name:'Farm Hand',venue:'grocery',boss:'FARM COORDINATOR',col:'#b8cf79',ranks:['FIELD HAND','GROWER','SENIOR GROWER','FOREMAN','FARM MANAGER'],jobs:[
 {id:'farm-feed',name:'Animal Care & Harvest',pay:3200,mins:6,rank:0,kind:'farm',count:4,hold:180,desc:'Use the supplied van to travel to Bayou Farm. Fill the animal troughs, check the flock, harvest produce and load the barn crate. Hold WORK at each station, then return the van to market dispatch.'},
 {id:'farm-market',name:'Produce Delivery',pay:4700,mins:6,rank:0,kind:'drop',count:3,hold:180,verb:'Deliver fresh produce',desc:'Drive the market van to three fresh-produce customers, unload on foot and return for wages.'}]},
 air:{name:'Airport Ground Crew',venue:'terminal',boss:'GROUND OPERATIONS',col:'#8cc3d0',ranks:['RAMP TRAINEE','RAMP AGENT','SENIOR AGENT','CREW CHIEF','OPERATIONS LEAD'],jobs:[
 {id:'air-inspect',name:'Apron Inspection',pay:3600,mins:6,rank:0,kind:'apron',count:3,hold:180,desc:'Check the marked baggage, safety and ground-service stations on the apron. Keep off the runway and return to the terminal to clock out.'},
 {id:'air-courier',name:'Air Freight Courier',pay:5100,mins:6,rank:0,kind:'drop',count:3,hold:160,verb:'Unload air freight',desc:'Drive three freight loads from the terminal to marked city drop points, then return to dispatch.'}]},
 taxi:{name:'Cab Driver',venue:'gas',boss:'DISPATCHER',col:'#f2d04a',ranks:['TRAINEE DRIVER','CAB DRIVER','SENIOR DRIVER','FLEET DRIVER','FLEET OWNER'],jobs:[
  {id:'taxi-short',name:'Short Fares',pay:2600,mins:5,rank:0,desc:'Pick up three passengers in the cab and drop each at their street. Get out to pick up or drop off.',kind:'fare',count:3,hold:90},
  {id:'taxi-night',name:'Night Fares',pay:5000,mins:6,rank:0,desc:'Four fares through the night with zombie ambushes at the pick-ups.',kind:'fare',count:4,hold:100,ambush:2},
  {id:'taxi-vip',name:'VIP Run',pay:9200,mins:7,rank:1,desc:'Five VIP fares with heavy ambushes. Requires CAB DRIVER rank.',kind:'fare',count:5,hold:110,ambush:4}]}



};
let stats={};try{stats=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(_){}
for(const id in CAREERS){const s=stats[id]||{},best={};if(s.best&&typeof s.best==='object')for(const k in s.best)if(/^[SABC]$/.test(s.best[k]))best[k]=s.best[k];stats[id]={shifts:Math.max(0,+s.shifts||0),earned:Math.max(0,+s.earned||0),tasks:Math.max(0,+s.tasks||0),best};}
const thresholds=[0,3,8,15,25],multipliers=[1,1.15,1.3,1.5,1.8],speeds=[1,1.1,1.2,1.32,1.45],armor=[1.6,1.75,1.9,2.05,2.25];
const GRADES=['S','A','B','C'],GRADE_PAY={S:1.25,A:1.1,B:1,C:.85},gradeOf=s=>s>=95?'S':s>=80?'A':s>=62?'B':'C',pct=v=>Math.round((v-1)*100);
const rank=id=>{let n=0;thresholds.forEach((v,i)=>{if(stats[id].shifts>=v)n=i;});return n;};
const cashText=n=>'$'+Math.round(n).toLocaleString();
const timeText=t=>{const s=Math.max(0,Math.ceil(t/60));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(stats));}catch(_){}};
let active=null,gps=null,held=false,touchHeld=false,selected=null,selectedHome=null,objects=null,lastHud='',lastResult=null;
const panel=document.createElement('div');panel.id='jobsPanel';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Paid jobs and careers');document.body.appendChild(panel);
const hud=document.createElement('div');hud.id='jobHUD';hud.innerHTML='<div class="jobTop"></div><div class="jobTask"></div><div class="jobMeta"></div><div class="jobTrack"><i></i></div><div class="jobInc"></div><div class="jobDuty"></div>';document.body.appendChild(hud);
const boardButton=document.createElement('button');boardButton.id='jobBoardButton';boardButton.textContent='JOBS · O';boardButton.onclick=()=>open();document.body.appendChild(boardButton);
const workButton=document.createElement('button');workButton.id='jobWorkButton';workButton.textContent='HOLD TO WORK';workButton.style.touchAction='none';document.body.appendChild(workButton);
if(document.body.classList.contains('is-touch')){const g=document.querySelector('#touch .group');if(g){g.appendChild(boardButton);g.appendChild(workButton);}}
const css=document.createElement('style');css.textContent=`
 #jobsPanel{position:fixed;inset:0;z-index:55;display:none;align-items:center;justify-content:center;background:#05080cce;padding:16px;box-sizing:border-box;font-family:'IBM Plex Mono',monospace;color:#f1ebdc}
 #jobsPanel .sbox{width:min(700px,100%);max-height:90dvh;padding:24px;border-color:#b29456;overflow:auto}
 #jobsPanel h2{font-size:36px;margin-bottom:12px}#jobsPanel p{font-size:13px;line-height:1.65}
 #jobsPanel .jobNav{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}.jobNav button{background:#27323a;color:#ddd5c1;border:1px solid #56636a;padding:10px 12px;font:700 12px 'IBM Plex Mono',monospace;min-height:42px;cursor:pointer}
 #jobsPanel .jobNav button.selected{border-color:var(--job-color,#e0b24a);color:var(--job-color,#e0b24a);background:#303129}
 #jobsPanel .item{gap:16px}#jobsPanel .item>div{min-width:0}#jobsPanel .item span{font-size:12px;line-height:1.65}#jobsPanel .item button{min-width:128px;min-height:44px;cursor:pointer}#jobsPanel .item b{line-height:1.2}
 #jobsPanel .jobSpecs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-top:10px}#jobsPanel .jobSpecs div{background:#ffffff0b;border:1px solid #ffffff17;padding:6px 8px;min-width:0}#jobsPanel .jobSpecs em{display:block;font-style:normal;font-size:10px;letter-spacing:.06em;color:#8e9a9b}#jobsPanel .jobSpecs b{display:block;font-size:12px;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
 @media(max-width:699px){#jobsPanel .jobSpecs{grid-template-columns:repeat(2,minmax(0,1fr))}}
 #jobsPanel button:disabled{opacity:.45;cursor:not-allowed}#jobsPanel .jobNote{border-left:2px solid #b29456;padding-left:12px;color:#c9d0cc}#jobsPanel .jobPill{color:#a9d8b0}
 #jobsPanel .close{min-height:44px;cursor:pointer}#jobBoardButton,#jobWorkButton{position:fixed;z-index:25;background:#111c24e8;color:#e5bd63;border:1px solid #b2945688;padding:11px 14px;font:700 12px 'IBM Plex Mono',monospace;min-height:44px;cursor:pointer;display:none}
 #jobBoardButton{right:18px;top:150px}#jobWorkButton{right:18px;top:200px;color:#a5e0e4;min-width:148px}
 #jobHUD{display:none;position:fixed;z-index:15;top:145px;left:50%;transform:translateX(-50%);width:min(440px,calc(100% - 28px));box-sizing:border-box;background:#09131ded;border-left:3px solid var(--job-color,#e0b24a);padding:12px 14px;color:#f2eedf;font-family:'IBM Plex Mono',monospace;pointer-events:none;box-shadow:0 8px 24px #0005}
 #jobHUD .jobInc{display:none;margin-top:8px;padding:6px 8px;background:#3a2a0f;border-left:3px solid #ffd27a;color:#ffd27a;font-size:12px;font-weight:700;line-height:1.4}@media(max-width:699px){#jobHUD .jobDuty{display:none}}#jobHUD .jobDuty{margin-top:6px;font-size:11px;line-height:1.4;color:#a9b4b6}#jobHUD .jobTop{font-size:12px;font-weight:700;color:var(--job-color,#e0b24a);text-transform:uppercase;letter-spacing:.04em}#jobHUD .jobTask{font-size:13px;line-height:1.5;margin-top:6px}#jobHUD .jobMeta{font-size:12px;color:#b6c4c5;line-height:1.5;margin-top:6px}#jobHUD .jobTrack{height:3px;background:#ffffff20;margin-top:8px}#jobHUD .jobTrack i{display:block;height:100%;background:var(--job-color,#e0b24a);width:0}
 @media(max-width:699px){#jobsPanel{padding:10px}#jobsPanel .sbox{padding:18px;max-height:92dvh}#jobsPanel .item{align-items:flex-start;flex-direction:column;gap:10px}#jobsPanel .item button{width:100%}#jobsPanel h2{font-size:32px}#jobHUD{top:142px;padding:10px 12px}#jobHUD .jobTask{font-size:12px}#jobBoardButton{right:12px;top:252px;padding:9px}#jobWorkButton{right:12px;top:300px;min-width:132px}.jobNav button{flex:1 1 28%;padding:9px}}
 `;document.head.appendChild(css);
function close(){panel.style.display='none';if(state==='shop')state='play';held=touchHeld=false;for(const k in keys)keys[k]=false;mouse.down=false;}
function nearest(id){id=CAREERS[id]?.venue||id;const p=player?.car||player||{x:0,y:0};return (city?.venues||[]).filter(v=>v.id===id).sort((a,b)=>dist(p.x,p.y,a.doorX,a.doorY)-dist(p.x,p.y,b.doorX,b.doorY))[0];}
function atHome(v){return !!(player&&!player.dead&&!player.car&&v&&dist(player.x,player.y,v.doorX,v.doorY)<210&&(v.id!=='hospital'||v.floor===0));}
function line(title,desc,label,action,disabled,extra=''){return '<div class="item"><div><b>'+title+'</b><span>'+desc+'</span>'+extra+'</div><button data-job="'+action+'" '+(disabled?'disabled':'')+'>'+label+'</button></div>';}
function open(id,home){if(!player||player.dead||!['play','shop'].includes(state))return;
 if(window.level29Places.panel.style.display!=='none')level29Places.close();
 selected=id&&CAREERS[id]?id:null;selectedHome=home||selected&&nearest(selected);held=touchHeld=false;state='shop';mouse.down=false;for(const k in keys)keys[k]=false;
 let h='<div class="jobNav">'+Object.entries(CAREERS).map(([k,c])=>'<button class="'+(selected===k?'selected':'')+'" data-job="career-'+k+'">'+c.name.toUpperCase()+'</button>').join('')+'<button data-job="guard">GUARD</button></div>';
 const guard=window.level29Guard?.shift;
 if(active){const c=CAREERS[active.career];h+='<p class="jobPill">ON DUTY · '+c.name+' · '+active.def.name+' · '+timeText(active.t)+' LEFT</p>';h+=line('Current assignment',active.tasks[active.index]?.label||'Return to dispatch.','BACK TO WORK','close');h+=line('End shift early','Partial wages only for completed tasks. This does not count toward promotion.','END SHIFT','cancel');}
 else if(guard){h+='<p class="jobPill">GUARD DUTY · '+guard.def.name+' · '+timeText(guard.t)+' LEFT</p>';h+=line('Return to your post',guard.post.label,'BACK TO WORK','close');h+=line('End guard shift','Receive reduced wages for time already worked.','END SHIFT','cancel-guard');}
 else if(selected){const c=CAREERS[selected],s=stats[selected],r=rank(selected),v=selectedHome;panel.style.setProperty('--job-color',c.col);
  h+='<p><b>'+c.ranks[r]+'</b> · PAY x'+multipliers[r]+' · '+s.shifts+' SHIFTS<br>CAREER EARNINGS '+cashText(s.earned)+(r<4?' · NEXT RANK AT '+thresholds[r+1]+' SHIFTS':' · TOP RANK')+'</p>';
  h+='<p class="jobNote">'+(atHome(v)?'You are at dispatch. Clock in below.':'Start at '+(v?.name||'the marked workplace')+'. Set GPS, follow the marker, then open JOBS there.')+' Hold U or the WORK button at marked tasks. One paid job at a time; finish active story missions first.</p>';
  h+='<p class="jobNote"><b>RANK PERKS</b> · WORK SPEED +'+pct(speeds[r])+'% · DUTY VEHICLE ARMOR x'+armor[r]+(r<4?'<br>NEXT RANK · WORK SPEED +'+pct(speeds[r+1])+'% · PAY x'+multipliers[r+1]:'')+'</p>';
  h+='<p class="jobNote"><b>DUTIES</b> · '+(DUTY[selected]||'')+'</p>';
  h+='<p class="jobNote"><b>GRADING</b> · Every task pays a tip, and fast tasks build a streak that raises it. Shifts are graded S, A, B or C on time left, duties cleared, missed duties and vehicle condition. S pays +25%, A +10%, C -15%.</p>';
  for(const j of c.jobs){const locked=r<j.rank,busy=mission?.phase==='active';h+=line(j.name,j.desc+dutyNote(selected,j)+(j.rank?' Requires '+c.ranks[j.rank]+'.':''),locked?'LOCKED':busy?'MISSION ACTIVE':atHome(v)?'CLOCK IN':'SET GPS',locked||busy?'none':atHome(v)?'start-'+j.id:'gps-'+selected,locked||busy,specs(selected,j,r));}
 }else{h+='<p>Earn money keeping Level 29 running. Pick a career above, set GPS to its workplace, then clock in when you arrive.</p><p class="jobNote">Firefighter: extinguish fires and rescue residents.<br>Police: cruiser patrols, horde calls and evidence runs.<br>Gas station: fuel, repairs and stock deliveries.<br>Hospital: ward rounds, ambulance calls and supplies.<br>Business, safe house and cab driver: office work, supply runs and fares.<br>Mechanic, armorer and car wash: bay work, repairs and supply runs.<br>Market, bank and gym: deliveries, teller work, armored runs and coaching.<br>Guard: seven paid fortress shifts.</p>';if(lastResult)h+='<p class="jobPill">LAST SHIFT · '+lastResult.name+(lastResult.grade?' · GRADE '+lastResult.grade:'')+' · '+cashText(lastResult.pay)+'</p>';}
 if(gps&&!active&&!guard)h+=line('Workplace GPS',gps.name,'CLEAR GPS','clear-gps');
 panel.innerHTML='<div class="sbox"><div class="eyebrow">LEVEL 29 · PAID WORK</div><h2>Jobs & Careers</h2><p class="cash">WALLET '+cashText(cash)+'</p>'+h+'<button class="close" data-job="close">RETURN TO THE CITY · ESC</button></div>';panel.style.display='flex';}
panel.addEventListener('click',e=>{const b=e.target.closest('[data-job]');if(!b||b.disabled)return;const a=b.dataset.job;
 if(a==='close')return close();if(a==='cancel'){finish(false,'CLOCKED OUT');close();return;}if(a==='cancel-guard'){level29Guard.end('CLOCKED OUT',.4);close();return;}
 if(a==='clear-gps'){gps=null;close();toast('WORKPLACE GPS CLEARED');return;}
 if(a==='guard'){if(active||level29Guard.shift)return open();const c=level29Guard.chiefs.slice().sort((a,b)=>dist(player.x,player.y,a.x,a.y)-dist(player.x,player.y,b.x,b.y))[0];close();if(c&&dist(player.x,player.y,c.x,c.y)<150)level29Guard.open(c);else if(c){gps={x:c.x,y:c.y,name:'SECURITY CHIEF',col:'#e0b24a'};toast('GPS · SECURITY CHIEF · PRESS U AT THE BOOTH');}return;}
 if(a.startsWith('career-'))return open(a.slice(7));
 if(a.startsWith('gps-')){const c=a.slice(4),v=selectedHome||nearest(c);if(!v){toast('NO '+CAREERS[c].name.toUpperCase()+' WORKPLACE IN THIS DISTRICT');return;}if(v){gps={x:v.doorX,y:v.doorY+28,name:v.name,col:CAREERS[c].col};close();toast('GPS · '+v.short+' · OPEN JOBS ON ARRIVAL');}return;}
 if(a.startsWith('start-')){const c=selected,def=CAREERS[c]?.jobs.find(j=>'start-'+j.id===a),v=selectedHome;close();if(def)begin(c,def,v);}
});
addEventListener('keydown',e=>{if(e.target?.matches('input,textarea,select'))return;const k=e.key.toLowerCase();
 if(k==='o'&&!e.repeat&&['play','shop'].includes(state)){e.preventDefault();e.stopImmediatePropagation();if(panel.style.display==='flex')close();else open();return;}
 if(e.key==='Escape'&&panel.style.display==='flex'){e.preventDefault();e.stopImmediatePropagation();close();return;}
 if(k==='u'&&active&&state==='play'&&canWork(active.tasks[active.index])){e.preventDefault();e.stopImmediatePropagation();held=true;ensureAudio();}
},true);
addEventListener('keyup',e=>{if(e.key.toLowerCase()==='u')held=false;});addEventListener('blur',()=>{held=touchHeld=false;});
workButton.addEventListener('pointerdown',e=>{e.preventDefault();touchHeld=true;workButton.setPointerCapture(e.pointerId);ensureAudio();});for(const ev of ['pointerup','pointercancel','lostpointercapture'])workButton.addEventListener(ev,()=>touchHeld=false);
// USE on mobile now reaches the security chief, not only shop services.
const use=document.getElementById('venueAction');if(use)use.onclick=()=>{const c=level29Guard.chiefs.find(c=>!player?.car&&dist(player.x,player.y,c.x,c.y)<62);if(c&&!active&&!level29Guard.shift)return level29Guard.open(c);serviceVenue();};


// ---- Job duties and on-shift zombie incidents ----
const DUTY={farm:'Care for animals and load fresh harvests at Bayou Farm. Return to market dispatch for wages.',air:'Inspect ground equipment on the airport apron; freight shifts use marked city deliveries.',fire:'Put out fires, rescue trapped residents and hold off zombies drawn to the flames.',police:'Answer calls, protect civilians and survive ambushes, flanking rushes, brute charges and distress calls.',gas:'Serve customers, deliver stock and keep zombies off the forecourt.',hospital:'Treat patients, move casualties and defend your route from the infected.',grocery:'Restock, deliver orders and keep the street clear on your runs.',bank:'Serve customers, move cash safely and fight off robbers and zombies on the road.',gym:'Coach clients and train through live zombie drills.',garage:'Repair vehicles and defend your service truck.',armory:'Maintain weapons and escort ammo runs.',spray:'Detail cars and handle customers on the street.',business:'Run client errands and protect signed deals.',safe:'Keep the safe house stocked and the perimeter clear.',taxi:'Pick up fares and get them home alive.'};
const VEH={fire:'RESCUE ENGINE',police:'DUTY CRUISER',hospital:'AMBULANCE',grocery:'MARKET VAN',bank:'ARMORED VAN',garage:'SERVICE TRUCK',armory:'SUPPLY VAN',spray:'DETAIL VAN',business:'COMPANY VAN',safe:'SUPPLY VAN',taxi:'CAB',gas:'DELIVERY VAN'};
function specs(career,j,r){const th=j.kind==='inside'||j.kind==='triage'?['NONE','#8fd0a0']:j.hard>1?['EXTREME','#ff7a66']:j.hard||j.ambush>=3?['HIGH','#ffb35a']:j.ambush?['MEDIUM','#f2d04a']:['LOW','#a9d8b0'];
 const n=(j.kind==='fare'?j.count*2:j.kind==='rescue'?j.count+1:j.kind==='pro'?j.count+2:j.count)+1,veh=['fuel','service','triage','inside','pro'].includes(j.kind)||career==='gym'?'ON FOOT':(VEH[career]||'VAN'),best=stats[career].best[j.id];
 const cell=(k,v,col)=>'<div><em>'+k+'</em><b'+(col?' style="color:'+col+'"':'')+'>'+v+'</b></div>';
 return '<div class="jobSpecs">'+cell('PAY',cashText(j.pay*multipliers[r]))+cell('TIME',j.mins+' MIN')+cell('TASKS',n)+cell('VEHICLE',veh)+cell('THREAT',th[0],th[1])+cell('BEST GRADE',best||'—',best==='S'?'#ffd27a':null)+'</div>';}
const INC={police:{every:1500,types:['wave','pincer','brute','distress','wave','pincer']},fire:{every:2900,types:['wave','pincer']},hospital:{every:3300,types:['wave','distress']},taxi:{every:3300,types:['wave','pincer']},other:{every:3800,types:['wave']}};
const incCfg=a=>a.def.kind==='inside'?null:(INC[a.career]||INC.other);
function dutyNote(career,j){const c=incCfg({career,def:j});if(!c)return ' Duties: indoor work, zombies cannot enter.';const tp=c.types;return ' Duties: random street incidents every '+Math.round(c.every*(j.hard>1?.75:1)/60)+' seconds or so ('+(tp.includes('brute')?'ambushes, pincer rushes, brute charges, distress calls':tp.includes('distress')?'ambushes and distress calls':tp.includes('pincer')?'ambushes and pincer rushes':'ambushes')+'). Clear them for bonus pay.';}
function incFinish(a,ok){const i=a.inc;if(!i)return;if(ok){const b=Math.round(i.bonus);a.bonus=(a.bonus||0)+b;a.incDone=(a.incDone||0)+1;toast('DUTY COMPLETE · +'+cashText(b));sfx('pickup');}else{a.incMiss=(a.incMiss||0)+1;toast('DUTY MISSED · NO BONUS');sfx('fail');for(const z of i.zs)if(z.alive)z.alert=true;}a.inc=null;a.incT=(incCfg(a).every*(a.def.hard>1?.75:1))+rnd(0,500);}
function incSpawn(a,i,cx,cy,n,types,min,max,alert){for(let k=0;k<n;k++){const p=safePoint(cx,cy,min,max),z=spawnZombieAt(p.x,p.y,types[k%types.length]);if(z){z.alert=alert;i.zs.push(z);a.spawned.push(z);}}}
function incStart(a,type){const P=player.car||player,m=a.mult,r=Math.round((m-1)/.2),hard=a.def.hard||0,n=Math.min(12,4+hard*2+r),i={type,zs:[],t:0,limit:1800,loc:null,bonus:0};
 if(type==='wave'){i.label='AMBUSH · '+n+' ZOMBIES CLOSING IN';incSpawn(a,i,P.x,P.y,n,['walker','runner','walker'],170,300,true);i.bonus=n*45*m;}
 else if(type==='pincer'){i.label='PINCER · ZOMBIES FROM BOTH SIDES';const p=safePoint(P.x,P.y,210,320),q={x:2*P.x-p.x,y:2*P.y-p.y};incSpawn(a,i,p.x,p.y,Math.ceil(n/2),['runner','walker'],10,80,true);incSpawn(a,i,q.x,q.y,Math.floor(n/2),['runner','walker'],10,80,true);i.bonus=n*55*m;}
 else if(type==='brute'){const b=1+hard+(r>2?1:0);i.label='BRUTE CHARGE · '+b+' BRUTE'+(b>1?'S':'')+' AND RUNNERS';incSpawn(a,i,P.x,P.y,b,['brute'],230,330,true);incSpawn(a,i,P.x,P.y,3+hard,['runner'],230,330,true);i.bonus=(b*150+n*30)*m;}
 else{const c=safePoint(P.x,P.y,260,420);i.loc={x:c.x,y:c.y};i.label='DISTRESS CALL · CLEAR THE ZOMBIES AROUND THE CIVILIAN';i.limit=2700;incSpawn(a,i,c.x,c.y,n,['walker','walker','runner'],14,60,false);i.bonus=n*80*m;}
 if(!i.zs.length){a.incT=300;return;}a.inc=i;if(type==='wave'||type==='pincer'||type==='brute')alertZombies(P.x,P.y,500);toast(i.label);sfx('boss');}
function incUpdate(a,t){const cfg=incCfg(a);if(!cfg||!player)return;const P=player.car||player;
 if(a.inc){const i=a.inc;i.t++;const left=i.zs.filter(z=>z.alive).length;if(!left)return incFinish(a,true);if(i.t>=i.limit)return incFinish(a,false);if(i.loc&&i.t===1200)toast('THE CIVILIAN WILL NOT LAST MUCH LONGER');return;}
 if(t.floor!==undefined||t.type==='work'||t.type==='clear'||(city.venues||[]).some(v=>insideVenue(v,P)))return;
 if(--a.incT>0)return;incStart(a,cfg.types[Math.floor(Math.random()*cfg.types.length)]);}
function safePoint(x,y,min=180,max=650,road=false){for(let i=0;i<100;i++){const p=randomRoadPoint(x,y,min,max);if(!p)continue;if(road&&tileAt(p.x,p.y)!==T_ROAD&&tileAt(p.x,p.y)!==T_BRIDGE)continue;if((city.venues||[]).some(v=>insideVenue(v,p)))continue;if((city.safes||[]).some(s=>s.fort&&p.x>s.fort.x&&p.x<s.fort.x+s.fort.w&&p.y>s.fort.y&&p.y<s.fort.y+s.fort.h))continue;if(!blockedCircle(p.x,p.y,22))return p;}return {x,y:y+85};}
function reachable(x,y){if(x<20||y<20||x>WORLD-20||y>WORLD-20)return false;const t=tileAt(x,y);if(t===T_WATER||t===T_BLD)return false;const prev=moverCtx;moverCtx={x,y};let ok=true;try{ok=!blockedCircle(x,y,13);}catch(e){}moverCtx=prev;return ok;}
function reach(p){if(reachable(p.x,p.y))return p;for(let r=18;r<=270;r+=18)for(let k=0;k<12;k++){const a=k/12*Math.PI*2,x=p.x+Math.cos(a)*r,y=p.y+Math.sin(a)*r;if(reachable(x,y)&&!(city.venues||[]).some(v=>insideVenue(v,{x,y})))return {x,y};}return p;}
function task(type,p,label,hold=180,extra={}){const q=extra.floor!=null||(city.venues||[]).some(v=>insideVenue(v,p))?p:reach(p);return {type,x:q.x,y:q.y,label,hold,progress:0,...extra};}
function returnTask(home){return task('return',{x:home.doorX+(home.frontage?.dx||0)*30,y:home.doorY+(home.frontage?.dy??1)*30},'Return to dispatch and clock out',120);}
function vehicle(home,role){const type=role==='police'?'police':role==='fire'?'truck':role==='garage'?'pickup':role==='taxi'?'sedan':'van',p=safePoint(home.doorX,home.doorY,75,190,true),c=makeCar(p.x,p.y,0,type);c.jobRole=role;c.maxHp=Math.round(c.maxHp*(CAREERS[role]?armor[rank(role)]:1.6));c.hp=c.maxHp;c.spec={...c.spec,name:({fire:'LEVEL 29 RESCUE ENGINE',hospital:'LEVEL 29 AMBULANCE',police:'DUTY CRUISER',grocery:'MARKET DELIVERY VAN',bank:'ARMORED TRANSFER VAN',garage:'SERVICE TRUCK',armory:'ARMORY SUPPLY VAN',spray:'MOBILE DETAIL VAN',business:'COMPANY VAN',safe:'SAFE HOUSE SUPPLY VAN',taxi:'LEVEL 29 CAB'})[role]||'STOCK DELIVERY VAN'};c.col=({fire:'#b43529',hospital:'#e5e8dc',police:'#f2f2ef',grocery:'#4f9a52',bank:'#5d646b',garage:'#c9992f',armory:'#6b4a3d',spray:'#3c93b8',business:'#4b3f63',safe:'#4a6b52',taxi:'#e8c63a'})[role]||'#d6b24c';c.ai=null;cars.push(c);return c;}
function begin(career,def,home){if(window.level29CityStories?.active)return toast('FINISH YOUR CITY STORY FIRST');if(active||level29Guard.shift||mission?.phase==='active'||!atHome(home)||rank(career)<def.rank)return toast('FINISH YOUR CURRENT JOB AND CLOCK IN ON FOOT AT DISPATCH');
 const r=rank(career),tasks=[],road=()=>safePoint(home.doorX,home.doorY,230,850,true);const kind=def.kind;
 const hard=def.hard||0,amb=(n,b=0)=>({ambush:n,brutes:b}),sx=home.stationX,sy=home.stationY,spots=[[-60,-10],[60,-10],[0,-48],[-60,38],[60,38],[0,22]];
 const inside=(i,n,verb)=>{const B=home.b;let pt={x:sx,y:sy};for(let k=0;k<6;k++){const o=spots[(i+k)%6],q={x:Math.max(B.x+22,Math.min(B.x+B.w-22,sx+o[0])),y:Math.max(B.y+22,Math.min(B.y+B.h-30,sy+o[1]))};if(!blockedCircle(q.x,q.y,14)){pt=q;break;}}return task('work',pt,verb+' '+(i+1)+' of '+n,def.hold||220);};
 const horde=(i,n)=>task('clear',road(),(kind==='pro'?'Training run ':'Clear horde call ')+(i+1)+' of '+n,0,{enemies:[],spawned:false,limit:5400,size:def.small?3+i:Math.min(14,(hard>1?8:6)+2*i),brutes:def.small?0:Math.min(4,hard>1?1+i:i)});
 if(kind==='farm'){if(!city.farm)return toast('NO FARM IN THIS MAP');const f=city.farm;const points=[[36,80,'Fill feed trough'],[f.w-36,100,'Inspect the flock'],[50,f.h-40,'Harvest produce'],[f.w/2,f.h-35,'Load barn crate']];for(const [x,y,label]of points)tasks.push(task('work',reach({x:f.x+x,y:f.y+y}),label,def.hold));}
 if(kind==='apron'){const l=level29Downtown.lots.airport;for(let i=0;i<def.count;i++)tasks.push(task('work',reach({x:(l.x0+4.5)*TILE,y:(l.y0+1.5+i*2)*TILE}),['Inspect baggage cart','Check apron safety kit','Service ground equipment'][i],def.hold));}
 if(kind==='fire'||kind==='rescue'){for(let i=0;i<def.count;i++)tasks.push(task('fire',road(),'Extinguish fire '+(i+1)+' of '+def.count,def.hold,{limit:4800+(hard>1?600:0),...amb(Math.min(2+Math.floor(i/2),5),hard>1?1+Math.floor(i/3):0),flare:hard>1?190:260,fr:hard>1?68:62}));if(kind==='rescue')tasks.push(task('rescue',road(),'Stabilize and collect the stranded resident',def.hold-80,{limit:5400,...amb(6,1)}));}
 if(kind==='patrol')for(let i=0;i<def.count;i++)tasks.push(task('patrol',road(),'Cruiser checkpoint '+(i+1)+' of '+def.count,180,{limit:3600,...amb(3+Math.floor(i/2),i>=3?1:0)}));
 if(kind==='clear')for(let i=0;i<def.count;i++)tasks.push(horde(i,def.count));
 if(kind==='evidence')for(let i=0;i<def.count;i++)tasks.push(task('crate',road(),'Collect evidence case '+(i+1)+' of '+def.count,240,{limit:3600,...amb(5,1)}));
 if(kind==='inside')for(let i=0;i<def.count;i++)tasks.push(inside(i,def.count,def.verb));
 if(kind==='drop')for(let i=0;i<def.count;i++)tasks.push(task('deliver',road(),def.verb+' '+(i+1)+' of '+def.count,def.hold,{limit:4200,...amb(def.ambush||0)}));
 if(kind==='crate')for(let i=0;i<def.count;i++)tasks.push(task('crate',road(),def.verb+' '+(i+1)+' of '+def.count,def.hold,{limit:4200,...amb(def.ambush||0)}));
 if(kind==='roadside')for(let i=0;i<def.count;i++)tasks.push(task('repair',road(),def.verb+' '+(i+1)+' of '+def.count,def.hold,{limit:4800,...amb(i===def.count-1||def.ambush>2?def.ambush:0)}));
 if(kind==='fare')for(let i=0;i<def.count;i++){tasks.push(task('fare',road(),'Pick up passenger '+(i+1)+' of '+def.count,def.hold,{limit:4200,...amb(i>0?def.ambush||0:0)}));tasks.push(task('deliver',road(),'Drop off passenger '+(i+1)+' of '+def.count,def.hold,{limit:4200,...amb(0)}));}
 if(kind==='pro'){for(let i=0;i<2;i++)tasks.push(inside(i,2,def.verb||'Coach athlete'));for(let i=0;i<def.count;i++)tasks.push(horde(i,def.count));}
 if(kind==='fuel'||kind==='service'){for(let i=0;i<def.count;i++){const repair=kind==='service'&&i%2===1;tasks.push(task(repair?'repair':'fuel',{x:home.b.x+(i%2===0?25:home.b.w-25),y:home.doorY+66},(repair?'Repair':'Fuel')+' customer vehicle '+(i+1)+' of '+def.count,repair?360:300));}}
 if(kind==='stock'||kind==='medical'){const dest=nearest('grocery')||home;for(let i=0;i<def.count;i++)tasks.push(task('crate',{x:dest.doorX+(i?48:-48),y:dest.doorY+34},(kind==='medical'?'Collect medical supplies':'Load station stock')+' '+(i+1)+' of '+def.count,240));}
 if(kind==='triage'){for(let i=0;i<def.count;i++)tasks.push(task('patient',{x:home.b.x+(i%2?home.b.w-40:40),y:home.b.y+110},'Treat patient · hospital floor '+(i+1),300,{floor:i}));}
 if(kind==='ambulance')for(let i=0;i<def.count;i++)tasks.push(task('patient',road(),'Stabilize and collect casualty '+(i+1)+' of '+def.count,300));
 tasks.push(returnTask(home));
 active={career,def,home,t:def.mins*3600,total:def.mins*3600,index:0,tasks,mult:multipliers[r],speed:speeds[r],tips:0,streak:0,bestStreak:0,incMiss:0,tipMsg:'',savedObj:objective,city,car:null,carUsed:false,cargo:0,meshes:[],customer:null,spawned:[],entered:frame,bonus:0,incDone:0,inc:null,incT:900+Math.floor(Math.random()*600)};
 if(!['fuel','service','triage','inside','pro','apron'].includes(kind)&&career!=='gym')active.car=vehicle(home,career);
 if(career==='police')player.armor=Math.max(player.armor||0,100);
 gps=null;held=touchHeld=false;makeObjects();activateTask();banner={big:'CLOCKED IN',small:CAREERS[career].name.toUpperCase()+' · '+def.name.toUpperCase(),t:160,good:true};sfx('missionstart');
 level29Places.speak(CAREERS[career].boss,'You are on the clock. Follow the work marker, hold U to do each task, then return here for your pay.',CAREERS[career].col);return true;}
function disposeObjects(){if(!objects)return;objects.traverse(o=>{o.geometry?.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];for(const m of ms)if(m){if(m.map)m.map.dispose();m.dispose();}});scene?.remove(objects);objects=null;}
function makeObjects(){disposeObjects();objects=new THREE.Group();objects.name='level29-paid-job';scene.add(objects);const c=CAREERS[active.career];
 const ring=new THREE.Mesh(new THREE.RingGeometry(20,23,36).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:c.col,side:THREE.DoubleSide,transparent:true,opacity:.8,depthWrite:false}));objects.add(ring);objects.userData.ring=ring;
 const beam=new THREE.Mesh(new THREE.CylinderGeometry(.8,1.6,1,6),new THREE.MeshBasicMaterial({color:'#c0f0ff',transparent:true,opacity:.8}));beam.visible=false;objects.add(beam);objects.userData.beam=beam;
}
function clearTaskVisuals(){if(!objects)return;for(const m of active.meshes){objects.remove(m);m.traverse(o=>{o.geometry?.dispose();if(o.material&&!Array.isArray(o.material)){o.material.map?.dispose();o.material.dispose();}});}active.meshes=[];}
function activateTask(){if(!active)return;clearTaskVisuals();const a=active,t=a.tasks[a.index];if(!t)return;t.at=a.t;if(a.car&&!a.car.dead&&!a.car.burnT)a.car.hp=Math.max(a.car.hp,a.car.maxHp*.7);held=touchHeld=false;
 if(a.customer){cars=cars.filter(c=>c!==a.customer);a.customer=null;}
 if(t.type==='fuel'||t.type==='repair'){const c=makeCar(t.x,t.y,Math.PI/2,t.type==='repair'?'pickup':'sedan');c.hp=t.type==='repair'?c.maxHp*.45:c.maxHp;c.jobCustomer=true;c.ai=null;c.v=0;cars.push(c);a.customer=c;t.car=c;}
 if(t.type==='clear'&&!t.spawned){t.spawned=true;const n=t.size||5;for(let k=0;k<n;k++){const p=safePoint(t.x,t.y,40,140),z=spawnZombieAt(p.x,p.y,k<(t.brutes||0)?'brute':(k%2===0?'runner':'walker'));if(z){z.alert=true;z.jobTarget=true;t.enemies.push(z);a.spawned.push(z);}}if(!t.enemies.length){const z=spawnZombieAt(t.x,t.y,'walker');if(z){t.enemies.push(z);a.spawned.push(z);}}}
 if(t.ambush&&!t.ambushed){t.ambushed=true;for(let k=0;k<t.ambush;k++){const p=safePoint(t.x,t.y,110,270),z=spawnZombieAt(p.x,p.y,k<(t.brutes||0)?'brute':(k%2?'runner':'walker'));if(z){z.alert=true;a.spawned.push(z);}}if(t.ambush)toast('AMBUSH · '+t.ambush+' ZOMBIES INCOMING');}
 const group=new THREE.Group();group.position.set(t.x,t.floor!==undefined?t.floor*56:terrainHeight(t.x,t.y),t.y);
 if(t.type==='fire'){for(let k=0;k<7;k++){const m=new THREE.Mesh(new THREE.ConeGeometry(5+k%3,18+k*2,5),new THREE.MeshBasicMaterial({color:k%2?'#ff6a24':'#ffc53a',transparent:true,opacity:.85}));m.position.set(Math.cos(k*2.4)*9,12,Math.sin(k*2.4)*9);group.add(m);}}
 if(['patient','rescue','deliver','fare'].includes(t.type)){const m=makeFigure(false);setFigureColors(m,'#a47150',t.floor!==undefined?'#9bbec9':'#947760','#454f64','#352820');poseFigure(m,0,0,0,0,'stand');group.add(m);if(t.type==='deliver'&&a.def.kind!=='fare'){const bag=new THREE.Mesh(new THREE.BoxGeometry(9,7,7),new THREE.MeshLambertMaterial({color:CAREERS[a.career].col}));bag.position.set(9,3.5,0);group.add(bag);}const plus=t.type==='deliver'||t.type==='fare'?new THREE.Mesh(new THREE.BoxGeometry(.1,.1,.1),new THREE.MeshBasicMaterial({color:'#000'})):new THREE.Mesh(new THREE.BoxGeometry(2,9,1),new THREE.MeshBasicMaterial({color:'#83e0dd'})),cross=new THREE.Mesh(new THREE.BoxGeometry(8,2,1),plus.material.clone());plus.position.y=cross.position.y=35;group.add(plus,cross);}
 if(t.type==='work'){const bench=new THREE.Mesh(new THREE.BoxGeometry(14,3,10),new THREE.MeshBasicMaterial({color:CAREERS[a.career].col,transparent:true,opacity:.6}));bench.position.y=2;group.add(bench);}
 if(t.type==='work'&&(a.career==='farm'||a.career==='air')){const steel=new THREE.MeshStandardMaterial({color:'#7d8c8b',roughness:.7,metalness:.35}),wood=new THREE.MeshStandardMaterial({color:'#9b784a',roughness:.95});const part=(w,h,d,x,y,z,m)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);group.add(o);};
  if(a.career==='farm'){part(17,5,11,15,2.5,0,wood);part(14,1,8,15,5,0,new THREE.MeshStandardMaterial({color:a.index===0?'#c4b16a':'#598546',roughness:1}));for(let k=0;k<5;k++)part(2,2,3,10+k*2.5,7,0,wood);}
  else{part(20,2,12,15,3,0,steel);for(const z of [-6,6])for(const x of [8,22]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(2,2,1.5,10),wood);wheel.rotation.x=Math.PI/2;wheel.position.set(x,2,z);group.add(wheel);}for(let k=0;k<3;k++)part(6,5+k%2,8,8+k*7,7,0,wood);}
 }
 if(t.type==='crate'){const box=new THREE.Mesh(new THREE.BoxGeometry(17,12,14),new THREE.MeshLambertMaterial({color:a.career==='hospital'?'#d8ece7':'#ad8855'}));box.position.y=6;group.add(box);const seal=new THREE.Mesh(new THREE.BoxGeometry(3,12.3,14.3),new THREE.MeshBasicMaterial({color:CAREERS[a.career].col}));seal.position.y=6;group.add(seal);}
 objects.add(group);a.meshes.push(group);toast(t.label.toUpperCase()+(a.tipMsg?' · '+a.tipMsg:''));a.tipMsg='';sfx('checkpoint');}
function canWork(t){if(!active||!t||!player||player.dead)return false;const p=player.car||player;if(t.floor!==undefined&&(active.home.floor!==t.floor||player.car))return false;
 if(t.type==='patrol')return player.car===active.car&&Math.abs(player.car.v)<1.5&&dist(p.x,p.y,t.x,t.y)<80;
 if(t.type==='clear')return false;if(t.type==='return')return !player.car&&dist(player.x,player.y,t.x,t.y)<65&&(!active.car||active.carUsed&&dist(active.car.x,active.car.y,active.home.doorX,active.home.doorY)<220);
 return !player.car&&dist(player.x,player.y,t.x,t.y)<(t.type==='fire'?74:58);}
function next(failed){const a=active,t=a.tasks[a.index];if(!failed){sfx('pickup');a.done=(a.done||0)+1;if(['rescue','patient','crate','fare'].includes(t.type))a.cargo++;
  if(t.type!=='return'){const elapsed=(t.at??a.t)-a.t,par=t.type==='clear'?3000:(t.floor!==undefined||t.type==='work'||(!a.car&&(t.type==='fuel'||t.type==='repair')))?900:2400,fast=elapsed<=par;
   a.streak=fast?a.streak+1:0;a.bestStreak=Math.max(a.bestStreak,a.streak);const tip=Math.round(a.def.pay*a.mult*.035*(fast?1.4:1)*(1+Math.min(.25,.05*Math.max(0,a.streak-1))));a.tips+=tip;
   a.tipMsg=(fast?'FAST · ':'')+'TIP +'+cashText(tip)+(a.streak>1?' · STREAK x'+a.streak:'');}
 }else a.streak=0;if(t.car){t.car.hp=t.car.maxHp;t.car.burnT=0;}
 a.index++;if(a.index>=a.tasks.length)return finish(true,'SHIFT COMPLETE');activateTask();}
function finish(full,reason){if(!active)return;const a=active,c=CAREERS[a.career],s=stats[a.career],prior=rank(a.career),fraction=(a.done||0)/a.tasks.length;
 const carHp=a.car&&a.carUsed&&a.car.maxHp?Math.max(0,Math.min(1,a.car.hp/a.car.maxHp)):1,score=60+Math.max(0,a.t/a.total)*40+Math.min(15,(a.incDone||0)*5)-(a.incMiss||0)*5-(1-carHp)*25+Math.min(10,(a.bestStreak||0)*2),grade=full?gradeOf(score):null;
 const bonus=Math.round(a.bonus||0),tips=Math.round(a.tips||0),pay=Math.round(a.def.pay*a.mult*(full?GRADE_PAY[grade]*Math.max(.4,1-.2*(a.failed||0)):fraction*.35))+bonus+tips;cash+=pay;s.earned+=pay;s.tasks+=a.done||0;
 if(full){s.shifts++;const prev=s.best[a.def.id];if(!prev||GRADES.indexOf(grade)<GRADES.indexOf(prev))s.best[a.def.id]=grade;}persist();lastResult={name:a.def.name,pay,full,reason,bonus,tips,grade,duties:a.incDone||0};
 if(a.customer)cars=cars.filter(c=>c!==a.customer);if(a.car&&player?.car!==a.car){const car=a.car;setTimeout(()=>{if(player?.car!==car)cars=cars.filter(c=>c!==car);},9000);}for(const z of a.spawned){z.jobTarget=false;}a.inc=null;disposeObjects();active=null;held=touchHeld=false;objective=a.savedObj;hud.style.display='none';workButton.style.display='none';
 banner={big:full?'PAYCHECK RECEIVED':'SHIFT ENDED',small:reason+(grade?' · GRADE '+grade:'')+' · +'+cashText(pay)+(tips?' · TIPS '+cashText(tips):'')+(bonus?' · DUTY BONUS '+cashText(bonus)+' ('+(a.incDone||0)+' CLEARED)':''),t:240,good:full,bad:!full};sfx(full?'pass':'fail');
 level29Places.speak(c.boss,(full?'Good work. Grade '+grade+(grade==='S'?', outstanding':'')+'. ':'Partial wages for completed tasks only. ')+cashText(pay)+' paid. '+(rank(a.career)>prior?'Promoted to '+c.ranks[rank(a.career)]+'.':'Completed shifts: '+s.shifts+'.'),c.col);window.level29Save?.save('JOB PAY SAVED');return pay;}
const oldService=serviceVenue;serviceVenue=function(){const v=nearStation();if(v&&(v.id==='garage'||v.id==='spray')&&!player.car&&!active&&!level29Guard.shift)return open(v.id,v);return oldService();};
const oldBegin=beginMission;beginMission=function(){if(active)return toast('CLOCK OUT OF YOUR PAID JOB FIRST');return oldBegin();};
const oldMission=updateMission;updateMission=function(){if(active)return;return oldMission();};
const oldTarget=missionTarget;missionTarget=function(){if(active&&active.inc?.loc)return {x:active.inc.loc.x,y:active.inc.loc.y,col:'#ffd27a',label:'!',zone:70};if(active){const t=active.tasks[active.index];if(t)return {x:t.x,y:t.y,col:CAREERS[active.career].col,label:active.career==='hospital'?'+':active.career==='police'?'P':active.career==='fire'?'F':'W',zone:60};}if(gps&&!level29Guard.shift)return {x:gps.x,y:gps.y,col:gps.col,label:'J'};return oldTarget();};
const oldBuild=buildCity;buildCity=function(){if(active)finish(false,'LEFT THE WORK AREA');if(level29Guard.shift)level29Guard.end('LEFT THE FORTRESS',.25);gps=null;oldBuild();};
const originalCarMesh=makeCarMesh;makeCarMesh=function(c){const g=originalCarMesh(c);if(!c.jobRole||c.jobRole==='police')return g;
 const role=c.jobRole,color=({fire:'#e9d6a1',hospital:'#cc453e',grocery:'#f2f6e8',bank:'#e4c479',garage:'#2b2b2b',armory:'#f1d7c9',spray:'#f2fbff',business:'#eadff7',safe:'#e2f3e6',taxi:'#1b1b1b'})[role]||'#664d26',label=({fire:'FIRE / RESCUE',hospital:'LEVEL 29 EMS',grocery:'FRESH MARKET',bank:'TRUST BANK · ARMORED',garage:'GARAGE',armory:'ARMORY',spray:'PAY N SPRAY',business:'BUSINESS',safe:'SAFE HOUSE CREW',taxi:'LEVEL 29 CAB'})[role]||'LEVEL 29 STOCK',bg=({fire:'#9c3228',hospital:'#e6ebdf',grocery:'#3f7d43',bank:'#3a3f45',garage:'#e8bc64',armory:'#6b4a3d',spray:'#2f7ea1',business:'#6b4f93',safe:'#3c6a47',taxi:'#e8c63a'})[role]||'#d6b24c';
 for(const side of [-1,1]){const mat=new THREE.MeshBasicMaterial({map:signTex(label,bg,color,512,96),side:THREE.DoubleSide});const m=new THREE.Mesh(new THREE.PlaneGeometry(c.spec.len*.68,5),mat);m.position.set(-5,role==='fire'?27:18,side*(c.spec.wid/2+.35));m.rotation.y=side>0?0:Math.PI;g.add(m);}
 if(role==='fire'||role==='hospital'){const bar=new THREE.Mesh(new THREE.BoxGeometry(3,2.5,16),new THREE.MeshBasicMaterial({color:'#f15643'}));bar.position.set(c.spec.len*.22,role==='fire'?26:26,0);g.add(bar);}
 if(role==='fire'){for(const z of [-6,6]){const rail=new THREE.Mesh(new THREE.BoxGeometry(38,1.2,1.2),new THREE.MeshLambertMaterial({color:'#b9c4c6'}));rail.position.set(-10,37,z);g.add(rail);}for(let i=0;i<6;i++){const rung=new THREE.Mesh(new THREE.BoxGeometry(1,1,13),new THREE.MeshLambertMaterial({color:'#bdc7c6'}));rung.position.set(-25+i*6,37,0);g.add(rung);}}
 return g;};
function updateHud(){const playing=state==='play'&&!showMap;boardButton.style.display=playing?'block':'none';hud.style.display=active&&playing?'block':'none';
 if(!active){workButton.style.display='none';return;}const a=active,t=a.tasks[a.index],c=CAREERS[a.career];if(!t)return;hud.style.setProperty('--job-color',c.col);
 let hint=t.type==='fire'&&player.car?'PARK AND GET OUT':t.type==='fire'&&!canWork(t)&&dist(player.x,player.y,t.x,t.y)<46?'TOO CLOSE · BACK AWAY':canWork(t)?'HOLD U / WORK':t.floor!==undefined&&a.home.floor!==t.floor?'USE ELEVATOR → FLOOR '+(t.floor+1):t.type==='clear'?'CLEAR THE MARKED ZOMBIES':t.type==='patrol'?'DRIVE THE ASSIGNED CRUISER TO THE MARKER':t.type==='return'&&a.car&&!a.carUsed?'USE THE ASSIGNED DUTY VEHICLE':t.type==='return'&&a.car&&dist(a.car.x,a.car.y,a.home.doorX,a.home.doorY)>=220?'RETURN YOUR DUTY VEHICLE TO DISPATCH':player.car?'PARK AND GET OUT':'FOLLOW THE WORK MARKER';
 const top=c.name+' · '+a.def.name+' · '+timeText(a.t),desc=t.label,meta=(a.index+1)+' / '+a.tasks.length+' · '+hint+(t.limit?' · CALL '+timeText(t.limit-(t.age||0)):'')+(a.failed?' · STRIKES '+a.failed+'/3':'')+' · PAY '+cashText(a.def.pay*a.mult)+(a.tips?' · TIPS '+cashText(a.tips):'')+(a.streak>1?' · STREAK x'+a.streak:'');const val=top+desc+meta;
 if(lastHud!==val){hud.querySelector('.jobTop').textContent=top;hud.querySelector('.jobTask').textContent=desc;hud.querySelector('.jobMeta').textContent=meta;lastHud=val;}
 {const ie=hud.querySelector('.jobInc'),i=a.inc,txt=i?'DUTY · '+i.label+' · '+i.zs.filter(z=>z.alive).length+' LEFT · '+timeText(i.limit-i.t)+' · BONUS '+cashText(i.bonus):'';if(ie.textContent!==txt){ie.textContent=txt;ie.style.display=i?'block':'none';}const du=hud.querySelector('.jobDuty'),dt='DUTY: '+(DUTY[a.career]||'')+(a.bonus?' · BONUS EARNED '+cashText(a.bonus):'');if(du.textContent!==dt)du.textContent=dt;}
 hud.querySelector('.jobTrack i').style.width=(t.hold?Math.min(100,t.progress/t.hold*100):t.spawned&&t.enemies.length?(1-t.enemies.filter(z=>z.alive).length/t.enemies.length)*100:0)+'%';
 workButton.style.display=playing&&canWork(t)?'block':'none';workButton.textContent=(held||touchHeld)?'WORKING…':'HOLD TO WORK';}
const oldUpdate=update;update=function(){oldUpdate();if(gps&&player&&dist((player.car||player).x,(player.car||player).y,gps.x,gps.y)<110){gps=null;toast('ARRIVED · OPEN JOBS');}if(!active)return;if(!player||player.dead||state==='dead'){finish(false,'INJURED ON DUTY');return;}if(active.city!==city){finish(false,'LEFT THE WORK AREA');return;}if(state!=='play')return;
 const a=active,t=a.tasks[a.index];if(!t)return;if(--a.t<=0){finish(false,'RESPONSE CLOCK EXPIRED');return;}
 if(a.car){if(a.car.dead||a.car.burnT){finish(false,'DUTY VEHICLE LOST');return;}if(player.car===a.car)a.carUsed=true;}
 if(t.car){t.x=t.car.x;t.y=t.car.y;t.car.ai=null;if(t.car.dead||t.car.burnT){finish(false,'CUSTOMER VEHICLE LOST');return;}}
 objective='Paid work · '+CAREERS[a.career].name+' · follow the marker.';
 if(t.limit){t.age=(t.age||0)+1;if(t.age>=t.limit){a.failed=(a.failed||0)+1;toast('CALL FAILED · STRIKE '+a.failed+' OF 3');sfx('fail');if(a.failed>=3){finish(false,'THREE FAILED CALLS');return;}next(true);return;}}
 incUpdate(a,t);
 if(t.type==='clear'){const alive=t.enemies.filter(z=>z.alive);if(!alive.length&&t.spawned){next();return;}for(const z of alive)if(dist(z.x,z.y,t.x,t.y)>280){const p=safePoint(t.x,t.y,25,90);z.x=p.x;z.y=p.y;}if(frame%120===0)toast(alive.length+' ZOMBIES LEFT AT THIS CALL');}
 else if(canWork(t)&&(held||touchHeld)){t.progress+=a.speed||1;if(t.progress>=t.hold){next();return;}}
 // Extinguisher, beacon and patient markers are bounded to this job and disposed on clock-out.
 if(objects){const ground=t.floor!==undefined?t.floor*56:terrainHeight(t.x,t.y),ring=objects.userData.ring;ring.position.set(t.x,ground+1.3,t.y);ring.rotation.y=frame*.01;
  const beam=objects.userData.beam;beam.visible=t.type==='fire'&&canWork(t)&&(held||touchHeld);if(beam.visible){const from=new THREE.Vector3(player.x,ground+16,player.y),to=new THREE.Vector3(t.x,ground+12,t.y),diff=to.clone().sub(from);beam.position.copy(from.add(to).multiplyScalar(.5));beam.scale.y=diff.length();beam.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),diff.normalize());}
  if(t.type==='fire'){const d=dist(player.x,player.y,t.x,t.y),per=t.flare||260,ph=(t.flareT=(t.flareT||0)+1)%per,warn=ph>per-50,fr=t.fr||62,working=canWork(t)&&(held||touchHeld);
   if(!working&&t.progress>0)t.progress=Math.max(0,t.progress-.6);
   if(ph===per-50)toast('FLARE-UP · BACK AWAY');
   if(ph===0&&!player.car&&d<fr){hurtPlayer(16+(a.def.hard>1?8:0),t.x,t.y);}
   if(!player.car&&d<46&&frame%20===0)hurtPlayer(3+(a.def.hard||0)*2,t.x,t.y);
   const boost=warn?1.7:1;for(const m of a.meshes[0]?.children||[]){m.scale.y=(.8+Math.sin(frame*.22+m.id)*.2)*Math.max(.15,1-t.progress/t.hold)*boost;m.scale.x=m.scale.z=warn?1.5:1;m.rotation.y=frame*.035;}
   if(frame%10===0){parts.push({k:'smoke',x:t.x+rnd(-12,12),y:t.y+rnd(-12,12),vx:rnd(-.3,.3),vy:rnd(-.3,.3),t:45});}}
 }
};
const oldRender=render;render=function(){oldRender();updateHud();if(panel.style.display==='flex'&&state!=='shop')panel.style.display='none';};
const oldText=window.render_game_to_text;window.render_game_to_text=()=>{const x=JSON.parse(oldText());x.guard=level29Guard.shift&&{name:level29Guard.shift.def.name,seconds:Math.ceil(level29Guard.shift.t/60),post:level29Guard.shift.post.label};x.workGPS=gps;x.job=active&&{career:active.career,name:active.def.name,seconds:Math.ceil(active.t/60),step:active.index+1,total:active.tasks.length,task:active.tasks[active.index]?.label,progress:active.tasks[active.index]?.progress,pay:active.def.pay*active.mult};return JSON.stringify(x);};
window.level29Jobs={careers:CAREERS,get active(){return active;},get stats(){return stats;},get gps(){return gps;},get lastResult(){return lastResult;},open,close,begin,finish,rank,canWork};
})();
