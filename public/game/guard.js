'use strict';
// Level 29: Security Detail. Work paid shifts as a guard at the mansion fortress.
(function(){
const KEY='level29.guard.v1';
const {batch,material}=window.level29World;
const RANKS=[['RECRUIT',0,1],['GUARD',3,1.15],['SENIOR GUARD',8,1.3],['SERGEANT',15,1.5],['CAPTAIN',25,1.8]];
const SHIFTS=[
 {id:'gate',name:'Gate Watch',mins:2,pay:1800,rank:0,wave:12,size:3,rot:0,desc:'Hold the front gate for 2 minutes while the horde probes the walls.'},
 {id:'patrol',name:'Perimeter Patrol',mins:3,pay:3600,rank:0,wave:9,size:4,rot:45,desc:'Rotate between four posts every 45 seconds for 3 minutes.'},
 {id:'night',name:'Night Watch',mins:5,pay:8000,rank:1,wave:6,size:5,rot:50,desc:'A long, heavy shift with fast waves. Requires GUARD rank.'},
 {id:'courtyard',name:'Courtyard Relief',mins:2.5,pay:2600,rank:0,wave:11,size:3,rot:30,desc:'Relieve the wall guards, switching posts every 30 seconds.'},
 {id:'helipad',name:'Helipad Security',mins:3,pay:4200,rank:0,wave:8,size:4,rot:0,post:3,desc:'Protect the helicopter landing zone for 3 minutes.'},
 {id:'supplies',name:'Supply Watch',mins:4,pay:6200,rank:1,wave:7,size:5,rot:40,post:2,desc:'Cover the delivery route and rotate the perimeter. Requires GUARD rank.'},
 {id:'siege',name:'Fortress Siege',mins:7,pay:14000,rank:2,wave:5,size:6,rot:35,desc:'A seven-minute high-pressure defense. Requires SENIOR GUARD rank.'}
];
let st={shifts:0,earned:0,kills:0,best:0};
try{Object.assign(st,JSON.parse(localStorage.getItem(KEY)||'{}'));}catch(_){}
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(st));}catch(_){}};
const rankIdx=()=>{let r=0;RANKS.forEach((x,i)=>{if(st.shifts>=x[1])r=i;});return r;};
const money=n=>'$'+Math.floor(n).toLocaleString();
let chiefs=[],shift=null,savedObj='';
const panel=window.level29Places.panel;

// ---- Security chief at each fortress gate ----
const oldBuild=buildCity;buildCity=function(){oldBuild();chiefs=[];if(!city||!city.world)return;
 const g=new THREE.Group();g.name='level29-security-office';cityGroup.add(g);const q=batch(g),stone=material('#a5a58e'),iron=material('#344047',.5),cap=material('#d4cfb7'),wood=material('#6a4a2f');
 for(const sf of city.safes||[]){const f=sf.fort;if(!f)continue;const x=f.gateX-100,y=f.y+f.h-80;
  q.box(70,3,46,x,1.5,y,material('#6d6a60'));q.box(66,2,44,x,50,y,iron);for(const [dx,dy] of [[-32,-20],[32,-20],[-32,20],[32,20]])q.box(3,48,3,x+dx,24,y+dy,iron);
  q.box(54,3,13,x,18,y+11,wood);q.box(54,16,3,x,9,y+16,wood);q.box(16,9,10,x+14,23,y+11,material('#1f2a2f'));
  addSign(g,'SECURITY OFFICE · GUARD JOBS',120,8,x,56,y+23,'#e0b24a');
  const m=makeFigure(false);setFigureColors(m,'#9b6f4e','#1d2328','#161b1f','#2a2622');addPart(m,16,2,2,8,12,0,iron);g.add(m);
  chiefs.push({m,x:x,y:y-4,sf,a:Math.PI/2});}
 q.finish();};
const nearChief=()=>{if(!player||!city||player.car||player.dead)return null;return chiefs.find(c=>dist(player.x,player.y,c.x,c.y)<62)||null;};

// ---- Prompts and labels ----
const oldHUD=fpHUD;fpHUD=function(small){oldHUD(small);if(!player||state!=='play')return;
 for(const c of chiefs){const d=dist(player.x,player.y,c.x,c.y);if(d>650||d<40)continue;const pr=project(c.x,c.y,86);if(!pr||pr.x<50||pr.x>SW-50||pr.y<80||pr.y>SH-100)continue;hudText('SECURITY CHIEF · GUARD JOBS',pr.x,pr.y,small?11:14,'#e0b24a','center','800 ');}
 const c=nearChief();if(c&&!shift){const w=Math.min(SW-24,small?330:430),x=(SW-w)/2,y=SH*(small?.73:.78);cx.fillStyle='rgba(9,18,19,.88)';cx.fillRect(x,y,w,34);hudText('U · TALK TO THE SECURITY CHIEF · GET PAID',SW/2,y+8,small?12:16,'#e0b24a','center','800 ');}
 if(shift){const w=Math.min(SW-24,small?330:460),x=(SW-w)/2,y=small?144:144;cx.fillStyle='rgba(9,18,19,.82)';const inc=shift.inc,ih=inc?(small?22:26):0;cx.fillRect(x,y,w,(small?44:50)+ih);hudText('GUARD SHIFT · '+shift.def.name.toUpperCase()+' · '+fmt(shift.t),SW/2,y+6,small?12:15,'#e0b24a','center','800 ');hudText((shift.onPost?'ON POST: ':'RETURN TO POST: ')+shift.post.label+' · KILLS '+shift.kills+' · PAY '+money(shift.est()),SW/2,y+(small?24:27),small?10:13,shift.onPost?'#9bd8a4':'#ff9d7a','center','700 ');if(inc){const left=inc.inspect?Math.max(0,Math.ceil((240-inc.hold)/60))+'S HOLD':inc.zs.filter(z=>z.alive).length+' LEFT';hudText('DUTY · '+inc.label.split(' · ')[0]+' · '+left+' · '+fmt(inc.limit-inc.t)+' · +'+money(inc.bonus),SW/2,y+(small?46:52),small?10:13,'#ffd27a','center','800 ');}}};
const fmt=t=>{const s=Math.ceil(t/60);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};

// ---- Panel ----
function row(title,desc,label,act,dis){return '<div class="item"><div><b>'+title+'</b><span>'+desc+'</span></div><button data-guard="'+act+'" '+(dis?'disabled':'')+'>'+label+'</button></div>';}
function openPanel(c){if(!c||shift)return;state='shop';mouse.down=false;for(const k in keys)keys[k]=false;const r=rankIdx(),R=RANKS[r],next=RANKS[r+1];
 let h='<p>Rank: <b>'+R[0]+'</b> · Pay x'+R[2]+' · Shifts worked: '+st.shifts+(next?' · Next rank ('+next[0]+') at '+next[1]+' shifts':' · Top rank reached')+'</p><p>Lifetime earnings: '+money(st.earned)+' · Zombies stopped: '+st.kills+'</p><p>'+DUTIES+'</p>';
 const busy=!!(mission&&mission.phase==='active'||window.level29Jobs&&level29Jobs.active);
 for(const s of SHIFTS){const lock=r<s.rank;h+=row(s.name+' · '+s.mins+' min',s.desc+' Base pay '+money(s.pay*R[2])+' plus '+money(25*R[2])+' per zombie stopped (up to double pay).',lock?'LOCKED':busy?'FINISH YOUR JOB':'START SHIFT','start-'+s.id,lock||busy);}
 panel.innerHTML='<div class="sbox"><div class="eyebrow">LEVEL 29 · SECURITY DETAIL</div><h2>Security Chief</h2><p class="cash">WALLET '+money(cash)+'</p>'+h+'<button class="close" data-guard="close">RETURN TO THE YARD · ESC</button></div>';panel.style.display='flex';
 subtitle={name:'SECURITY CHIEF',txt:'Need work? Stay on your post, keep the horde off the walls, and you get paid.',t:300,col:'#e0b24a'};}
panel.addEventListener('click',e=>{const b=e.target.closest('[data-guard]');if(!b)return;const a=b.dataset.guard;if(a==='close'){window.level29Places.close();return;}
 if(a.startsWith('start-')){const def=SHIFTS.find(s=>'start-'+s.id===a);window.level29Places.close();if(def)begin(def,nearChief()||chiefs[0]);}});
<<<<<<< HEAD
addEventListener('keydown',e=>{if(e.key.toLowerCase()!=='u'||e.repeat||state!=='play'||e.target.tagName==='INPUT')return;if(window.level29CityStories?.ownsUse())return;const c=nearChief();if(!c||shift)return;e.preventDefault();e.stopImmediatePropagation();openPanel(c);},true);
=======
addEventListener('keydown',e=>{if(e.key.toLowerCase()!=='u'||e.repeat||state!=='play'||e.target.tagName==='INPUT')return;const c=nearChief();if(!c||shift)return;e.preventDefault();e.stopImmediatePropagation();openPanel(c);},true);
>>>>>>> main

// ---- Shift logic ----
function posts(sf){const f=sf.fort;return [
 {x:f.gateX,y:f.y+f.h-70,label:'FRONT GATE'},{x:f.x+70,y:f.y+70,label:'NORTH-WEST WALL'},{x:f.x+f.w-70,y:f.y+70,label:'NORTH-EAST WALL'},{x:f.x+f.w-82,y:f.y+f.h-110,label:'HELIPAD'}];}

// ---- Guard duties: random attacks and tasks during a shift ----
const DUTIES='Duties: stay on your post, stop gate breaches, flank rushes and brute assaults, rescue civilians at the wall and inspect the perimeter. Each completed duty pays a bonus.';
function dutySpawn(s,i,cx,cy,n,types,min,max,alert){for(let k=0;k<n;k++){const p=randomRoadPoint(cx,cy,min,max);if(!p)continue;const z=spawnZombieAt(p.x,p.y,types[k%types.length]);if(z){z.alert=alert;i.zs.push(z);}}}
function dutyStart(s,type){const m=s.mult,r=rankIdx(),n=Math.min(11,s.def.size+1+r+Math.floor(s.wave/4)),P=s.post,i={type,zs:[],t:0,limit:1800,loc:null,bonus:0,hold:0};
 if(type==='breach'){i.label='GATE BREACH · '+n+' ZOMBIES RUSHING THE WALL';dutySpawn(s,i,P.x,P.y,n,['walker','runner','walker'],260,420,true);i.bonus=n*60*m;}
 else if(type==='flank'){i.label='FLANK RUSH · BOTH SIDES OF YOUR POST';const a=Math.random()*6.28,d=330;dutySpawn(s,i,P.x+Math.cos(a)*d,P.y+Math.sin(a)*d,Math.ceil(n/2),['runner','walker'],0,70,true);dutySpawn(s,i,P.x-Math.cos(a)*d,P.y-Math.sin(a)*d,Math.floor(n/2),['runner','walker'],0,70,true);i.bonus=n*65*m;}
 else if(type==='brute'){const b=1+(r>1?1:0)+(s.def.size>5?1:0);i.label='BRUTE ASSAULT · '+b+' BRUTE'+(b>1?'S':'')+' AT THE WALL';dutySpawn(s,i,P.x,P.y,b,['brute'],280,400,true);dutySpawn(s,i,P.x,P.y,3,['runner'],280,400,true);i.bonus=(b*180+90)*m;}
 else if(type==='rescue'){const f=s.sf.fort,c=randomRoadPoint(f.gateX,f.y+f.h,140,300)||{x:f.gateX,y:f.y+f.h+160};i.loc={x:c.x,y:c.y};i.label='CIVILIAN AT THE GATE · CLEAR THE ZOMBIES AROUND THEM';i.limit=2400;dutySpawn(s,i,c.x,c.y,n,['walker','walker','runner'],14,60,false);i.bonus=n*90*m;s.grace=Math.max(s.grace,2500);}
 else{const o=s.list.filter(p=>p!==s.post),q=o[Math.floor(Math.random()*o.length)];i.loc={x:q.x,y:q.y};i.label='PERIMETER CHECK · INSPECT THE '+q.label+' (HOLD 4 SECONDS)';i.limit=2400;i.hold=0;i.inspect=true;i.bonus=320*m;s.grace=Math.max(s.grace,2500);dutySpawn(s,i,q.x,q.y,3,['walker'],200,330,true);}
 if(!i.inspect&&!i.zs.length){s.incT=300;return;}s.inc=i;toast(i.label);sfx('boss');}
function dutyEnd(s,ok){const i=s.inc;if(!i)return;if(ok){const b=Math.round(i.bonus);s.bonus+=b;s.duties++;toast('DUTY COMPLETE · +'+money(b));sfx('pickup');}else{toast('DUTY MISSED · NO BONUS');sfx('fail');for(const z of i.zs)if(z.alive)z.alert=true;}s.inc=null;s.grace=Math.max(s.grace,i.loc?300:0);s.incT=s.incEvery+Math.floor(Math.random()*400);}
function dutyUpdate(s){if(s.inc){const i=s.inc;i.t++;if(i.inspect){const pp=player.car||player;if(!player.car&&dist(pp.x,pp.y,i.loc.x,i.loc.y)<70){i.hold++;if(i.hold>=240)return dutyEnd(s,true);}else i.hold=Math.max(0,i.hold-1);}else if(!i.zs.some(z=>z.alive))return dutyEnd(s,true);if(i.t>=i.limit)dutyEnd(s,false);return;}
 if(--s.incT>0)return;const pool=['breach','flank','rescue','inspect','breach','flank'];if(rankIdx()>=1||s.def.size>=5)pool.push('brute');dutyStart(s,pool[Math.floor(Math.random()*pool.length)]);}
<<<<<<< HEAD
function begin(def,c){if(window.level29CityStories?.active)return false;if(!c||!def||shift||window.level29Jobs&&level29Jobs.active||mission&&mission.phase==='active')return false;const r=rankIdx();if(r<def.rank)return false;const mult=RANKS[r][2],list=posts(c.sf);
=======
function begin(def,c){if(!c||!def||shift||window.level29Jobs&&level29Jobs.active||mission&&mission.phase==='active')return false;const r=rankIdx();if(r<def.rank)return false;const mult=RANKS[r][2],list=posts(c.sf);
>>>>>>> main
 shift={def,sf:c.sf,list,pi:def.post||0,post:list[def.post||0],t:def.mins*3600,total:def.mins*3600,wt:def.wave*60/2,wave:0,kills:0,off:0,offMax:720,rotT:def.rot?def.rot*60:0,grace:600,onPost:true,mult,att:0,offStreak:0,bonus:0,duties:0,inc:null,incT:900,incEvery:Math.max(1200,Math.round(def.wave*240)),
  est(){const frac=1-this.t/this.total;return def.pay*mult*frac+Math.min(this.kills*25*mult,def.pay*mult)+this.bonus;}};
 savedObj=objective;banner={big:'SHIFT STARTED',small:def.name.toUpperCase()+' · '+RANKS[r][0],t:200,good:true};sfx('missionstart');
 subtitle={name:'SECURITY CHIEF',txt:'Take your post at the '+shift.post.label.toLowerCase()+'. I am watching the clock.',t:300,col:'#e0b24a'};}
function end(why,frac){if(!shift)return;const s=shift,def=s.def;let pay=0,full=why==='done';
 if(full){pay=def.pay*s.mult+Math.min(s.kills*25*s.mult,def.pay*s.mult);if(s.off<300)pay*=1.1;pay+=s.bonus;}else pay=(def.pay*s.mult*(1-s.t/s.total)+Math.min(s.kills*25*s.mult,def.pay*s.mult))*(frac==null?.4:frac)+s.bonus;
 pay=Math.round(pay);s.inc=null;cash+=pay;st.earned+=pay;st.kills+=s.kills;if(full){const before=rankIdx();st.shifts++;st.best=Math.max(st.best,pay);if(rankIdx()>before)setTimeout(()=>{banner={big:'PROMOTED',small:RANKS[rankIdx()][0]+' · PAY x'+RANKS[rankIdx()][2],t:240,good:true};sfx('pass');},2600);}persist();
 banner={big:full?'SHIFT COMPLETE':'SHIFT ENDED',small:(why==='done'?'':why+' · ')+'+'+money(pay)+' · '+s.kills+' KILLS'+(s.bonus?' · DUTY BONUS '+money(s.bonus)+' ('+s.duties+')':''),t:240,good:full,bad:!full};sfx(full?'pass':'die');
 subtitle={name:'SECURITY CHIEF',txt:full?'Good shift. Here is your pay: '+money(pay)+'.':'You left us short. Partial pay only: '+money(pay)+'.',t:300,col:'#e0b24a'};
 shift=null;objective=savedObj;if(window.level29Save)window.level29Save.save('SHIFT PAY SAVED');}
<<<<<<< HEAD
const oldKill=killZombie;killZombie=function(z,vx,vy){const was=z&&z.alive;oldKill(z,vx,vy);if(shift&&was&&z.playerKill&&dist(z.x,z.y,shift.sf.fort.x+shift.sf.fort.w/2,shift.sf.fort.y+shift.sf.fort.h/2)<900)shift.kills++;};
=======
const oldKill=killZombie;killZombie=function(z,vx,vy){const was=z&&z.alive;oldKill(z,vx,vy);if(shift&&was&&dist(z.x,z.y,shift.sf.fort.x+shift.sf.fort.w/2,shift.sf.fort.y+shift.sf.fort.h/2)<900)shift.kills++;};
>>>>>>> main
const oldUpd=update;update=function(){oldUpd();if(shift&&player&&(player.dead||state==='dead')){end('YOU WERE DOWN',.4);return;}
 if(!shift||state!=='play'||!player)return;const s=shift,f=s.sf.fort;
 s.t--;if(s.t<=0){end('done');return;}
 // rotation between posts
 if(s.def.rot){s.rotT--;if(s.rotT<=0){s.rotT=s.def.rot*60;s.pi=(s.pi+1)%s.list.length;s.post=s.list[s.pi];s.grace=480;banner={big:'RELIEVE POST',small:s.post.label,t:150};sfx('checkpoint');}}
 const pp=player.car||player,d=dist(pp.x,pp.y,s.post.x,s.post.y);s.onPost=d<120;
 if(s.onPost)s.offStreak=0;if(s.grace>0){s.grace--;}else if(!s.onPost){s.off++;s.offStreak++;if(s.offStreak===300)toast('GET BACK TO YOUR POST');if(s.offStreak>=s.offMax){end('YOU ABANDONED YOUR POST',.25);return;}}
 objective='Guard shift: stay at '+s.post.label.toLowerCase()+' and keep the horde off the walls.';
 // waves around the fortress
 if(--s.wt<=0){s.wt=s.def.wave*60;s.wave++;const cx0=f.x+f.w/2,cy0=f.y+f.h/2,near=zombies.filter(z=>z.alive&&dist(z.x,z.y,cx0,cy0)<900).length,cap=18+Math.min(14,s.wave);if(near<cap){spawnHordeAround(cx0,cy0,Math.min(cap-near,s.def.size+Math.floor(s.wave/2)+Math.round(rankIdx()*.7)),360,620);if(s.wave%5===0){banner={big:'HORDE INCOMING',small:'WAVE '+s.wave,t:120,bad:true};sfx('boss');}}}
 dutyUpdate(s);};
const oldTarget=missionTarget;missionTarget=function(){if(shift&&shift.inc&&shift.inc.loc)return {x:shift.inc.loc.x,y:shift.inc.loc.y,col:'#ffd27a',label:'!',zone:70};if(shift&&shift.post)return {x:shift.post.x,y:shift.post.y,col:'#e0b24a',label:'G',zone:110};return oldTarget();};
const oldMU=updateMission;updateMission=function(){if(shift&&mission&&mission.phase==='start')return;return oldMU();};
// Chief figures stand at the booth.
const oldRU=update;update=function(){oldRU();for(const c of chiefs){const near=player&&dist(player.x,player.y,c.x,c.y)<850;c.m.visible=!!near;if(!near)continue;const a=near&&dist(player.x,player.y,c.x,c.y)<200?Math.atan2(player.y-c.y,player.x-c.x):c.a;poseFigure(c.m,c.x,c.y,a,0,'stand');c.m.position.y=0;}};
const oldBeginMission=beginMission;beginMission=function(){if(shift)return toast('FINISH OR END YOUR GUARD SHIFT FIRST');return oldBeginMission();};
window.level29Guard={get shift(){return shift;},get stats(){return st;},get chiefs(){return chiefs;},shifts:SHIFTS,open:openPanel,begin,end,rank:rankIdx};
})();
