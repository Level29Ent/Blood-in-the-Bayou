'use strict';
(function(){
const C=level29StoryCore,KEY='level29.city-stories.v1';
let save=C.initial();try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s?.v===1)save={...save,...s,ingredients:(s.ingredients||[]).filter(k=>C.INGREDIENTS.includes(k))};}catch(_){}
// Interrupted live encounters restart from a safe dispatch, never restore references to old entities.
if(['cinematic','boss','escort'].includes(save.gumbo))save.gumbo='capture';
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(save));}catch(_){}window.level29Save?.save();};
let active=null,rental=null,cut=null,sceneParts=null,actorRoot=null,escort=null,gps=null,usedSpeech=false,lastJoke=-1,speechOn=false,speechWait=0,siteCity=null;
const sites={};const assets={jojo:'characters/jojo.webp',alex:'characters/alex.webp',damion:'characters/damion.webp',dayshawn:'characters/dayshawn.webp'};
const gen=genCity;
genCity=function(){const c=gen.apply(this,arguments);if(!c.world)return c;
 const downtown=v=>worldZoneAtTile((v.b.x+v.b.w/2)/TILE,(v.b.y+v.b.h/2)/TILE)==='downtown';
 const fish=c.venues.filter(v=>v.kind==='fish').sort((a,b)=>(downtown(b)-downtown(a))||(Math.hypot(a.b.x-2624,a.b.y-1728)-Math.hypot(b.b.x-2624,b.b.y-1728)))[0];
 const gun=c.venues.filter(v=>v.id==='business'||v.kind==='clinic').sort((a,b)=>(downtown(b)-downtown(a))||Math.hypot(a.b.x-2176,a.b.y-1728)-Math.hypot(b.b.x-2176,b.b.y-1728))[0];
 const dispensary=level29Downtown.lots.dispensary;dispensary.name='ELEVATED MELANIN';Object.assign(dispensary.venue,{name:'ELEVATED MELANIN',short:'DAYSHAWN · OWNER',storyRole:'dayshawn',kind:'dispensary',col:'#bf9e67'});
 const theater=c.venues.find(v=>v.name==='GOLDEN HILLS SCREEN TESTS')||c.venues.find(v=>v.id==='studio');
 if(!fish||!gun||!theater)throw Error('City story venues missing');
 // Reuse existing safe footprints, street orientation and accessible door colliders.
 Object.assign(fish,{id:'cafe',kind:'restaurant',name:'MAJOR CAJUN',short:'CHIEF JOJO',letter:'J',col:'#e6b36b',storyRole:'jojo',extended:false});fish.b.venue='cafe';
 Object.assign(gun,{id:'armory',kind:'gunstore',name:'AK GUN PLUS',short:'ALEX · GUNSMITH',letter:'A',col:'#90c5d2',storyRole:'alex',extended:false});gun.b.venue='armory';
 Object.assign(theater,{id:'studio',kind:'theater',name:'BAYOU LAUGH THEATER',short:'DAMION · COMEDY',letter:'D',storyRole:'damion',extended:false});
 for(const v of [fish,theater]){v.stationX=v.b.x+v.b.w/2;v.stationY=v.b.y+v.b.h-24;}
 c.storySites={jojo:fish,alex:gun,damion:theater,dayshawn:dispensary.venue,felicia:c.venues.find(v=>v.kind==='snowballs')};return c;
};
const build=buildVenue;
buildVenue=function(v){
 if(v.storyRole==='jojo'||v.storyRole==='damion'){
  if(v.mesh?.parent===cityGroup)return;const b=v.b,g=new THREE.Group();v.mesh=g;cityGroup.add(g);const {box}=level29StoryScenes;
  box(g,b.w,1,b.h,b.x+b.w/2,.5,b.y+b.h/2,'#756653');for(const r of v.colliderWalls)box(g,r.w,44,r.h,r.x+r.w/2,22,r.y+r.h/2,'#c5b797');box(g,v.doorW,6,3,v.doorX,41,v.doorY-1,'#634737');v.door=box(g,1,1,1,v.doorX,0,v.doorY,'#302c26');v.door.visible=false;v.roof=box(g,b.w,2,b.h,b.x+b.w/2,46,b.y+b.h/2,'#40362c');addSign(g,v.name,Math.min(150,b.w),11,v.doorX,54,v.doorY+1,v.col);v.labelH=70;v.furniture=[];
 }else build.apply(this,arguments);if(!v.storyRole||!v.mesh||v.mesh.userData.storyDecor)return;v.mesh.userData.storyDecor=true;
 if(v.storyRole==='jojo')v.storyKitchen=level29StoryScenes.kitchen(v);
 if(v.storyRole==='dayshawn'){const m=level29StoryScenes.figure('dayshawn');v.mesh.add(m);poseFigure(m,v.b.x+v.b.w/2,v.b.y+18,Math.PI/2,0,'stand');v.storyActor=m;}
 if(v.storyRole==='alex'){const m=level29StoryScenes.figure('alex');v.mesh.add(m);poseFigure(m,v.stationX-18,v.stationY-18,Math.PI/2,0,'stand');v.storyActor=m;}
 if(v.storyRole==='damion')v.storyTheater=level29StoryScenes.theater(v);
};
const panel=document.createElement('section');panel.id='cityStories';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','City stories');panel.style.display='none';document.body.appendChild(panel);
const ui=document.createElement('style');ui.textContent=`.story-cutscene #touch,.story-cutscene #joy,.story-cutscene #hudMapActions,.story-cutscene #storyHUD,.story-cutscene #storyUse{display:none!important}#cityStories{position:fixed;inset:0;z-index:75;background:#081016df;display:none;align-items:center;justify-content:center;padding:16px;color:#eee7d9;box-sizing:border-box;font:14px/1.6 monospace}#cityStories .sheet{max-height:90dvh;overflow:auto;width:min(700px,100%);background:#152029;border:1px solid #b39a61;padding:20px;box-sizing:border-box}#cityStories button,#storyUse,#storyBoard,#sceneSkip{min-height:44px;padding:9px 12px;margin:4px;border:1px solid #bea469;background:#293a39;color:#f0dba9;cursor:pointer;font:700 12px monospace}#cityStories img{width:82px;height:100px;object-fit:cover;float:right;margin:0 0 12px 14px}#storyHUD{position:fixed;left:16px;bottom:120px;max-width:min(400px,calc(100vw - 32px));background:#101c22e8;border-left:3px solid #bfa267;color:#f3e8d4;padding:8px;z-index:23;pointer-events:none;font:12px/1.5 monospace}#storyUse{position:fixed;bottom:68px;left:50%;transform:translateX(-50%);z-index:26}#sceneCaption{position:fixed;bottom:5%;left:10%;width:80%;background:#060a0ce8;color:#f5e8d2;padding:16px;box-sizing:border-box;z-index:80;font:16px/1.5 monospace}#sceneSkip{position:fixed;right:18px;top:20px;z-index:81}#hudMapActions #storyBoard{position:static;margin:0} @media(max-height:500px){#storyHUD{bottom:70px;max-width:320px;font-size:11px}#sceneCaption{font-size:12px;padding:8px}}`;document.head.appendChild(ui);
const board=document.createElement('button');board.id='storyBoard';board.textContent='CITY STORIES';board.onclick=()=>open('board');(document.getElementById('hudMapActions')||document.body).appendChild(board);
const hud=document.createElement('div');hud.id='storyHUD';hud.style.display='none';document.body.appendChild(hud);
const use=document.createElement('button');use.id='storyUse';use.textContent='HOLD · STORY ACTION';use.style.display='none';document.body.appendChild(use);
const caption=document.createElement('div');caption.id='sceneCaption';caption.style.display='none';document.body.appendChild(caption);
const skip=document.createElement('button');skip.id='sceneSkip';skip.textContent='SKIP SCENE → BOSS FIGHT';skip.style.display='none';skip.onclick=()=>finishScene();document.body.appendChild(skip);
let held=false,hold=0,currentRole='board',currentContract=null;
const jokes=["I made reservations for dinner. The zombies made reservations for me.","Houston traffic is so slow, a zombie asked me if my car was a food truck.","Bonnie told me my trade-in had character. Turns out the character was still in the trunk.","Jojo says her gumbo wakes the dead. I told her to stop offering free refills."];
function stopSpeech(){if(usedSpeech&&window.speechSynthesis)speechSynthesis.cancel();usedSpeech=false;}
function speak(text){if(!speechOn||soundMode===2||!window.speechSynthesis)return;stopSpeech();const u=new SpeechSynthesisUtterance(text);u.rate=.95;u.volume=.75;speechSynthesis.speak(u);usedSpeech=true;}
function close(){panel.style.display='none';if(state==='shop')state='play';held=false;}
function image(role){return assets[role]?'<img src="'+assets[role]+'" alt="'+role+' character reference">':'';}
function btn(a,text){return '<button data-story="'+a+'">'+text+'</button>';}
function open(role){if(!player||player.dead||cut)return;currentRole=role;state='shop';mouse.down=false;for(const k in keys)keys[k]=false;document.exitPointerLock?.();
 let h=image(role)+'<h2>'+({jojo:'Chief Jojo · Major Cajun',alex:'Alex · AK Gun Plus',bonnie:'Bonnie De Vette',damion:'Damion · Bayou Laugh Theater',board:'City Stories',dayshawn:'Dayshawn · Elevated Melanin'}[role])+'</h2>';
 if(role==='board')h+='<p>Meet each owner inside their business. Follow the gold story marker; these side stories do not advance Ronniebaby’s campaign. All prices use earned game cash.</p>'+['jojo','alex','bonnie','damion','felicia','dayshawn'].map(r=>btn('gps:'+r,'MAP · '+({jojo:'MAJOR CAJUN',alex:'AK GUN PLUS',bonnie:'SLAB MOTORS',damion:'LAUGH THEATER',felicia:'FELICIA’S SNOWBALL TRAILER',dayshawn:'ELEVATED MELANIN'}[r]))).join('');
 if(role==='jojo')h+=btn('audio',speechOn?'DISABLE GENERIC DIALOGUE AUDIO':'ENABLE GENERIC DIALOGUE AUDIO')+'<p>“My zombie gumbo will turn this city human again. Bring rice from the farmers market, pork from the farm, shrimp from Natchez, fresh alligator meat, and Ronniebaby’s roux. Then catch me a university zombie. Don’t kill that one!”</p><p>Recipe: '+save.ingredients.join(', ')+'</p>'+btn('gumbo',save.gumbo==='done'?'REPLAY GUMBO STORY':save.gumbo==='intro'?'ACCEPT · ZOMBIE GUMBO':'CONTINUE · '+save.gumbo.toUpperCase());
 if(role==='alex')h+='<p>Field-test my exclusive weapons. Rentals last 30 real seconds, including time in menus. Trials supply a free temporary weapon; no real money is charged.</p>'+Object.entries(C.RENTALS).map(([k,r])=>btn('rent:'+k,r.name+' · $'+r.price+' / 30 SEC')).join('')+btn('stock','STANDARD WEAPONS / AMMO')+btn('waves','FIELD TRIAL · SURVIVE 5 WAVES')+btn('specimens','RESEARCH · CAPTURE 3 FARM ANIMALS + 3 BOSSES');
 if(role==='bonnie')h+='<p>“I need a sedan, a sports car and a Houston slab recovered from marked locations. Bring each one back intact. No buying a substitute.”</p>'+btn('cars','START · THREE VEHICLE RECOVERIES')+btn('sales','OPEN VEHICLE SHOWROOM');
 if(role==='damion')h+='<p>Original fictional comedy material with generic browser speech—not a recording or voice imitation. Enter the room to hear the set after enabling audio. Captions work without speech support.</p>'+btn('audio',speechOn?'DISABLE PERFORMANCE AUDIO':'ENABLE PERFORMANCE AUDIO')+btn('listen','WATCH THE SET');
 if(role==='dayshawn')h+='<p>“Dayshawn. Elevated Melanin. Somebody took my flower, edibles and concentrates. And four zombie bosses across town think they can sell their own product, fucking up my money. Recover my sealed stock, then deal with those four.”</p>'+btn('dispensary-shop','SHOP · LOCAL GOODS');
 if(role==='board')h+='<h3>Business Contract Board</h3><p>Meet the owner first. Each contract has distinct marked stops and a return handoff.</p>';
 for(const [id,c] of Object.entries(level29BusinessContracts.CONTRACTS))if(role===c.owner||role==='board')h+=btn('contract:'+id,c.name+' · $'+c.pay);
 if(active)h+=btn('cancel','ABANDON CURRENT SIDE STORY (NO REWARD)');h+=btn('close','RETURN TO GAME');panel.innerHTML='<div class="sheet">'+h+'</div>';panel.style.display='flex';
}
function nearRole(role){const v=role==='bonnie'?level29Downtown.lots.dealer?.venue:city.storySites?.[role];return v&&!player.car&&insideVenue(v,player);}
function ready(){return !active&&!boss&&!level29Jobs?.active&&!level29Guard?.shift&&mission?.phase!=='active'&&!mpRole;}
function start(kind){if(mpRole)return toast('CITY STORIES ARE SOLO-ONLY · LEAVE MULTIPLAYER FIRST');if(!ready())return toast('FINISH YOUR CURRENT MISSION / SHIFT / SIDE STORY FIRST');close();active={kind,index:0,entities:[],wave:0,localCity:city,hold:0};gps=null;hold=0;
 if(kind==='gumbo'){if(save.gumbo==='done')save={...save,gumbo:'intro',ingredients:[]};if(save.gumbo==='intro')save.gumbo='ingredients';active.phase=save.gumbo;setGumboTarget();}
 if(kind==='waves'){active.phase='travel';active.target=streetPoint(sites.alex.doorX,sites.alex.doorY,220,440);active.label='Reach Alex’s outdoor test range';}
 if(kind==='specimens'){active.phase='samples';active.target=samplePoints()[0];active.label='Humane live capture · cow (1/3) · HOLD at marked animal';}
 if(kind==='contract'){active.contract=currentContract;active.phase='contract';contractNext();}
 if(kind==='cars'){active.phase='recover';newRecovery();}
 persist();
}
function streetPoint(x,y,min=80,max=300){for(let i=0;i<100;i++){const p=randomRoadPoint(x,y,min,max);if(p&&!city.buildings.some(b=>level29SiteLayout.contains(b,p.x,p.y,24))&&!blockedCircle(p.x,p.y,15))return p;}const n=level29Navigation.graph,k=n.nearest(x,y,14);return n.point(k);}
function approach(v){const f=v.frontage||{dx:0,dy:1};return {x:v.doorX+f.dx*38,y:v.doorY+f.dy*38};}
function samplePoints(){return [0,4,8].map(i=>{const a=level29CityLife.animals[i];return {x:a.x,y:a.y};});}
function ingredientPoints(){const market=city.features.find(f=>f.kind==='market'),f=city.farm;return {rice:market?streetPoint(market.x+market.w/2,market.y+market.h,30,150):approach(city.venues.find(v=>v.id==='grocery')),pork:{...city.farmEntrance},shrimp:streetPoint(119*TILE,81.5*TILE,40,140),alligator:null,roux:{x:city.mansion.B.x+city.mansion.B.w/2,y:city.mansion.B.y+34}};}
function setGumboTarget(){const a=active;if(!a)return;
 if(save.gumbo==='ingredients'){const key=C.INGREDIENTS.find(k=>!save.ingredients.includes(k));a.item=key;if(key==='alligator'){const g=level29Life.gators.find(g=>!g.dead);a.target=g?{x:g.x,y:g.y}:streetPoint(GULF_X*TILE,50*TILE,30,200);a.label='Hunt an alligator for fresh meat · use your weapon';}else{a.target=ingredientPoints()[key];a.label='Collect '+(key==='roux'?'roux from Ronniebaby (penthouse)':key==='rice'?'rice at the farmers market':key==='pork'?'pork at Bayou Farm':'shrimp at the Natchez steamboat dock');}a.spawned=false;}
 else if(save.gumbo==='return'){a.target=approach(sites.jojo);a.label='Return all five ingredients to Chief Jojo';}
 else if(save.gumbo==='capture'){const u=level29Downtown.lots.university.venue;a.target=streetPoint(u.doorX,u.doorY,60,160);a.label='University: weaken the marked zombie below half health, then HOLD to capture alive';a.spawned=false;}
 else if(save.gumbo==='escort'){a.target=approach(sites.jojo);a.label='Escort your captured zombie to Major Cajun (vehicle transport allowed)';}
}
function spawnGroup(p,n,brute=false){const out=[];for(let i=0;i<n;i++){let z=null;for(let attempt=0;attempt<12&&!z;attempt++){const at=streetPoint(p.x,p.y,85,220+attempt*16);z=spawnZombieAt(at.x,at.y,brute?'brute':i%3===0?'runner':'walker');}if(z){z.alert=true;z.storyEncounter=true;out.push(z);}}return out;}
function newRecovery(){const a=active,type=['sedan','sports','slab'][a.index],loc=streetPoint(sites.jojo.doorX,sites.jojo.doorY,400+a.index*200,1200);const c=makeCar(loc.x,loc.y,0,type);c.storyRecovery=true;c.ai=null;cars.push(c);a.car=c;a.target=c;a.label='Recover the marked '+c.spec.name+' · drive THIS vehicle to Bonnie';a.entities=spawnGroup(loc,4);}
function rent(id,free=false){if(mpRole)return toast('EXCLUSIVE WEAPONS ARE SOLO-ONLY');const r=C.rent(free?1e9:cash,id,Date.now());if(!r)return toast('NOT ENOUGH IN-GAME CASH');endRental();if(!free){cash=r.balance;window.level29Save?.save();}rental={...r,previous:curW};selectW('m240');close();toast(C.RENTALS[id].name+' ACTIVE · 30 SECONDS');}
function endRental(){for(const m of Object.values(rentalModels))m.visible=false;if(!rental)return;const w=rental.previous;rental=null;if(hasW(w))selectW(w);}
function cancel(){document.body.classList.remove('story-cutscene');for(const a of level29CityLife.animals){a.storyCaptured=false;a.g.visible=true;}if(cut){cut=null;state='play';caption.style.display=skip.style.display='none';}stopSpeech();endRental();if(active){for(const z of active.entities||[])if(z.alive){z.alive=false;}if(active.car){active.car.storyRecovery=false;}if(active.kind==='gumbo'&&['escort','cinematic','boss'].includes(save.gumbo))save.gumbo='capture';}active=null;escort?.parent?.remove(escort);escort=null;actorRoot?.parent?.remove(actorRoot);actorRoot=null;hold=0;persist();}
function success(n,text){cash+=n;if(active.kind==='contract'){save.contractWins=save.contractWins||{};save.contractWins[active.contract]=(save.contractWins[active.contract]||0)+1;}toast(text+' · +$'+n);sfx('pass');if(active.kind==='gumbo')save.gumbo='done';if(active.kind==='cars')save.bonnieWins++;if(active.kind==='waves'||active.kind==='specimens')save.alexWins++;cancel();persist();}
panel.onclick=e=>{const action=e.target.closest('[data-story]')?.dataset.story;if(!action)return;if(action==='close')return close();if(action==='cancel'){cancel();return close();}if(action.startsWith('gps:')){if(active)return toast('FOLLOW YOUR ACTIVE STORY MARKER FIRST');const r=action.split(':')[1],v=r==='bonnie'?level29Downtown.lots.dealer.venue:sites[r];gps={...approach(v),name:v.name};close();showMap=false;toast('FOLLOW THE GOLD STORY MARKER · '+v.name);return;}
 if(action==='audio'){speechOn=!speechOn;if(speechOn)lastJoke=-1;if(!speechOn)stopSpeech();return open(currentRole);}if(action==='listen'){close();return;}
 if(!action.startsWith('contract:')&&!nearRole(currentRole))return toast('MEET THE OWNER INSIDE THEIR BUSINESS');
 if(action.startsWith('contract:')){const id=action.slice(9),c=level29BusinessContracts.definition(id);if(!c||!nearRole(c.owner))return toast('MEET '+(c?.owner||'THE OWNER').toUpperCase()+' INSIDE FIRST');currentContract=id;return start('contract');}
 if(action==='dispensary-shop'){close();return level29Downtown.spots().find(s=>s.label.includes('ELEVATED MELANIN'))?.act();}
 if(action==='stock'){close();return openShop();}
 if(action==='sales'){close();return level29Downtown.spots().find(s=>s.label.includes('BONNIE'))?.act();}
 if(action.startsWith('rent:')){if(active)return toast('FINISH YOUR TRIAL BEFORE RENTING');return rent(action.split(':')[1]);}if(action==='gumbo'&&active?.kind==='gumbo'){close();return;}start(action==='gumbo'?'gumbo':action);
};
function startScene(){document.body.classList.add('story-cutscene');hud.style.display=use.style.display='none';escort?.parent?.remove(escort);escort=null;close();save.gumbo='cinematic';persist();state='pause';held=false;mouse.down=false;for(const k in keys)keys[k]=false;rbStopVoice();stopSpeech();
 const v=sites.jojo,k=v.storyKitchen;sceneParts=k;cut={frame:0,v,k,b:v.frontage?.canonical||v.b};actorRoot=new THREE.Group();v.mesh.add(actorRoot);
 const watcher=makeFigure(false);setFigureColors(watcher,'#b88360','#657452','#353c42');poseFigure(watcher,cut.b.x+cut.b.w/2,cut.b.y+cut.b.h-30,-Math.PI/2,0,'stand');actorRoot.add(watcher);
 const z=makeFigure(true);setFigureColors(z,'#869b66','#5b6657','#333b48');poseFigure(z,k.zx,k.zz,Math.PI,0,'zombie');actorRoot.add(z);cut.z=z;cut.watcher=watcher;k.chains.children.forEach(link=>{if(!link.userData.home)link.userData.home={y:link.position.y,z:link.rotation.z};else{link.position.y=link.userData.home.y;link.rotation.z=link.userData.home.z;}});k.chains.visible=true;caption.style.display=skip.style.display='block';
}
function sceneTick(){const t=++cut.frame/60,k=cut.k,beat=C.sceneBeat(t),z=cut.z;const phrases={prepare:'Chief Jojo chops rice, pork, shrimp, alligator and Ronniebaby’s roux. The captured zombie waits in wall chains.',stir:'Chief Jojo: “A little roux, a little patience...” The boiling blue water turns gumbo brown.',serve:'Jojo scoops ice into a bowl, then pours hot gumbo with her ladle.',speech:'Chief Jojo: “I have the best gumbo in town! The only reason all these people acting like zombies is because they hungry!”',convulse:'The zombie thrashes violently for five seconds. Something is wrong.',still:'Silence. The zombie slumps, apparently lifeless.',mutate:'The chains snap. The zombie grows into the Gumbo Behemoth. Chief Jojo: “Not in my house!”',escape:'You and the mutated zombie rush outside. Get ready to fight!'};
 caption.textContent=phrases[beat];if(cut.lastBeat!==beat){cut.lastBeat=beat;if(['speech','mutate'].includes(beat))speak(phrases[beat]);}
 k.liquid.material.color.lerpColors(new THREE.Color('#518aab'),new THREE.Color('#68401f'),Math.min(1,Math.max(0,(t-7)/6)));
 k.bubbles.forEach((b,i)=>{b.position.y=23+Math.max(0,Math.sin(t*4+i))*1.6;});
 const bx=cut.b.x+cut.b.w*.7,progress=Math.max(0,Math.min(1,(t-18)/5)),chefX=k.x+22+(k.zx-15-(k.x+22))*progress,chefZ=k.z+(k.zz-k.z)*progress;
 poseFigure(k.chef,chefX,chefZ,progress>0?0:Math.PI,0,'stand');k.chef.userData.armR.rotation.x=beat==='stir'?Math.sin(t*4)*.7:t>=23&&t<29?-1.1:-.4;k.chef.userData.armL.rotation.z=Math.sin(t*2)*.15;
 const pour=Math.max(0,Math.min(1,(t-15)/2));k.ladle.position.set(k.x+11+(bx-k.x-11)*pour,25+Math.sin(t*2)*2,k.z);k.ladle.rotation.z=beat==='serve'?-.4+Math.sin(t*2)*.6:-.4;
 k.ice.visible=t>=13&&t<18;k.ice.position.y=14+Math.max(0,1-(t-13))*9;k.bowl.position.set(bx+(chefX+5-bx)*progress,t<18?13:14,k.z+(chefZ-k.z)*progress);
 k.pour.visible=t>=16&&t<18;k.pour.position.set(bx,20,k.z);k.bowlFill.visible=t>=17;k.bowlFill.position.copy(k.bowl.position);k.bowlFill.position.y+=.2;
 z.userData.body.rotation.z=beat==='convulse'?Math.sin(t*35)*.3:beat==='still'?.7:0;z.userData.armL.rotation.x=beat==='convulse'?Math.sin(t*40)*1.1:0;
 const growth=Math.max(0,Math.min(1,(t-32)/5));z.scale.setScalar(1+growth*1.6);k.chains.visible=t<35;if(t>=33)k.chains.children.forEach((link,i)=>{link.position.y-=.08;link.rotation.z+=i%2?.12:-.12;});
 if(beat==='escape'){const d=Math.min(1,(t-37)/3);z.position.x+=(cut.b.x+cut.b.w/2-z.position.x)*.08;z.position.z=cut.k.zz+(cut.b.y+cut.b.h-10-cut.k.zz)*d;cut.watcher.position.z=cut.b.y+cut.b.h-30+30*d;}
 if(t>=40)finishScene();
}
function finishScene(){if(!cut)return;document.body.classList.remove('story-cutscene');const v=cut.v;cut=null;state='play';caption.style.display=skip.style.display='none';stopSpeech();actorRoot?.parent?.remove(actorRoot);actorRoot=null;sceneParts.chains.visible=false;sceneParts.bubbles.forEach(b=>b.position.y=23);
 const p=streetPoint(v.doorX,v.doorY,65,150);player.car=null;player.x=p.x;player.y=p.y;player.vx=player.vy=0;player.inv=180;snapCamera();const z=spawnGroup(streetPoint(p.x,p.y,100,150),1,true)[0];if(!z){save.gumbo='capture';cancel();return toast('STREET BLOCKED · RESTART CAPTURE');}z.hp=z.maxHp=260;z.storyScale=2.8;z.speed=1.35;active.entities=[z];active.phase='boss';active.target=z;active.label='Kill the Gumbo Behemoth outside Major Cajun';save.gumbo='boss';persist();banner={big:'GUMBO BEHEMOTH',small:'CHIEF JOJO: NOT IN MY HOUSE!',t:200,bad:true};
}
const cam=placeCamera;placeCamera=function(){if(!cut)return cam.apply(this,arguments);const {v,k,b}=cut,t=cut.frame/60,local=new THREE.Vector3(b.x+b.w*.52,36,b.y+b.h-12),look=new THREE.Vector3(k.x+12,18,k.z+10);if(t>23){local.set(b.x+b.w*.5,30,b.y+b.h*.7);look.set(k.zx,20,k.zz);}v.mesh.updateMatrixWorld(true);camera.position.copy(v.mesh.localToWorld(local));camera.lookAt(v.mesh.localToWorld(look));return 0;};
const renderBase=render;render=function(){if(cut){placeCamera();renderer.setRenderTarget(null);renderer.clear();renderer.render(scene,camera);cx.clearRect(0,0,SW,SH);return;}renderBase.apply(this,arguments);
 for(const a of level29CityLife.animals)if(a.storyCaptured)a.g.visible=false;board.style.display=state==='play'?'block':'none';hud.style.display=state==='play'&&(active||gps||rental)?'block':'none';
 const text=active?active.label:gps?'MAP · '+gps.name:'';hud.textContent=text+(active?.kind==='gumbo'&&active.phase==='ingredients'?' · '+save.ingredients.length+'/5':'')+(active?.kind==='waves'?' · wave '+Math.max(1,active.wave)+'/5':'')+(rental?' · '+C.RENTALS[rental.id].name+' '+Math.max(0,Math.ceil((rental.expires-Date.now())/1000))+'s':'');
 use.style.display=state==='play'&&actionable()?'block':'none';use.textContent=active?'HOLD · '+Math.min(100,Math.floor(hold/60*100))+'%':'TALK · CITY STORY';
};
function actionable(){if(!player||player.dead||player.car&&active?.kind!=='cars')return false;
 if(active){const a=active;if(a.item==='roux'&&a.phase==='ingredients'&&!city.penthouse?.active)return false;if(a.phase==='boss'||a.phase==='wave'||a.kind==='contract'&&a.entities?.some(z=>z.alive)||a.item==='alligator'&&a.phase==='ingredients'||a.phase==='ingredients'&&a.entities?.some(z=>z.alive))return false;const p=player.car||player;if(!a.target||dist(p.x,p.y,a.target.x,a.target.y)>48)return false;if(a.phase==='capture'||a.phase==='bossCapture')return a.entities[0]?.alive&&a.entities[0].hp<=a.captureHP;return true;}
 return ['jojo','alex','damion','bonnie','dayshawn'].some(nearRole);
}
function interact(){if(!active){const r=['jojo','alex','damion','bonnie','dayshawn'].find(nearRole);if(r)open(r);return;}const a=active;
 if(a.kind==='contract'){const c=level29BusinessContracts.definition(a.contract);if(++a.index>=c.stops.length)return success(c.pay,c.name.toUpperCase()+' COMPLETE');contractNext();return;}
 if(a.kind==='gumbo'){
  if(a.phase==='ingredients'){if(C.ingredient(save,a.item)){sfx('pickup');persist();a.phase=save.gumbo;setGumboTarget();}}
  else if(a.phase==='return'){save.gumbo='capture';a.phase='capture';setGumboTarget();persist();}
  else if(a.phase==='capture'){const z=a.entities[0];z.alive=false;save.gumbo='escort';a.phase='escort';a.entities=[];escort=makeFigure(true);scene.add(escort);setGumboTarget();persist();}
  else if(a.phase==='escort')startScene();
 }
 if(a.kind==='waves'&&a.phase==='travel'){a.phase='wave';a.wave=1;rent('arc',true);a.entities=spawnGroup(a.target,4);a.label='Clear wave 1 · automatic trial weapon supplied';}
 if(a.kind==='specimens'){
  if(a.phase==='samples'){const animal=level29CityLife.animals[[0,4,8][a.index]];animal.storyCaptured=true;animal.g.visible=false;if(++a.index<3){a.target=samplePoints()[a.index];a.label='Humane live capture · '+['cow','pig','chicken'][a.index]+' ('+(a.index+1)+'/3)';}else{a.index=0;spawnResearchBoss();}}
  else if(a.phase==='bossCapture'){a.entities[0].alive=false;if(++a.index<3)spawnResearchBoss();else{a.phase='report';a.target=approach(sites.alex);a.label='Return the three restrained boss specimens to Alex';}}
  else if(a.phase==='report')success(5000,'ALEX RESEARCH COMPLETE');
 }
 if(a.kind==='cars'){
  if(player.car!==a.car)return toast('RETURN THE EXACT MARKED VEHICLE');if(a.car.hp<a.car.maxHp*.25)return toast('REPAIR THE RECOVERY CAR FIRST');exitCar(true);a.car.gone=true;cars=cars.filter(c=>c!==a.car);if(++a.index<3)newRecovery();else success(4800,'BONNIE RECOVERIES COMPLETE');
 }
}
function spawnResearchBoss(){const a=active,v=[level29Downtown.lots.university.venue,city.venues.find(v=>v.id==='police'),sites.alex][a.index],at=streetPoint(v.doorX,v.doorY,150,350);a.entities=spawnGroup(at,1,true);if(!a.entities.length)return cancel();const z=a.entities[0];z.hp=z.maxHp=90+a.index*30;z.storyCapturable=true;z.storyScale=2+a.index*.25;a.captureHP=z.hp*.35;a.target=z;a.phase='bossCapture';a.label='Weaken and capture research boss '+(a.index+1)+'/3 · HOLD near it below 35% HP';}
function contractNext(){const a=active,c=level29BusinessContracts.definition(a.contract),id=c.stops[a.index];let p;
 if(id==='farm')p={...city.farmEntrance};else{const v=id==='bonnie'?level29Downtown.lots.dealer.venue:sites[id]||city.venues.filter(v=>v.id===id&&!v.storyRole)[(a.index+Math.floor(save.contractWins?.[a.contract]||0))%Math.max(1,city.venues.filter(v=>v.id===id&&!v.storyRole).length)];p=approach(v);}
 a.target=p;a.label=c.labels[a.index]+' · '+(a.index+1)+'/'+c.stops.length;a.entities=[];a.spawned=false;a.venueMarker=p;
}
function updateActive(){const a=active;if(!a)return;for(const z of a.entities||[])if(z.storyCapturable&&z.alive&&z.hp<=a.captureHP){z.stun=5;z.speed=.15;}if(a.localCity!==city||player.dead){cancel();return;}if(a.car?.dead||a.car?.gone&&a.phase==='recover'){toast('RECOVERY LOST · TALK TO BONNIE TO RETRY');cancel();return;}
 if(a.kind==='contract'){const c=level29BusinessContracts.definition(a.contract),n=c.counts[a.index];if(!a.spawned&&n&&dist(player.x,player.y,a.target.x,a.target.y)<400){a.entities=spawnGroup(a.target,n,c.bosses);if(a.entities.length){a.spawned=true;if(c.bosses){const z=a.entities[0];z.hp=z.maxHp=120+a.index*45;z.storyBoss=true;z.storyScale=2.2+a.index*.2;z.speed=1.1+a.index*.1;}}}if(n&&!a.spawned){hold=0;return;}if(a.spawned&&a.entities.some(z=>z.alive))a.label=c.labels[a.index]+' · '+a.entities.filter(z=>z.alive).length+' THREATS';else a.label=c.labels[a.index]+' · HOLD TO COLLECT / CONFIRM';}
 if(a.kind==='gumbo'){
  if(a.phase==='ingredients'&&a.item==='alligator'){const g=level29Life.gators.find(g=>!g.dead);if(g)a.target=g;}
  if(a.phase==='ingredients'&&!a.spawned&&a.item!=='alligator'&&a.item!=='roux'&&dist(player.x,player.y,a.target.x,a.target.y)<350){a.entities=spawnGroup(a.target,5);a.spawned=true;}
  if(a.phase==='capture'&&!a.spawned&&dist(player.x,player.y,a.target.x,a.target.y)<350){a.entities=spawnGroup(a.target,1);if(a.entities.length){const z=a.entities[0];z.hp=z.maxHp=24;z.storyCapturable=true;a.captureHP=12;a.target=z;a.spawned=true;}}
  if(a.phase==='capture'&&a.spawned&&!a.entities[0]?.alive){a.spawned=false;setGumboTarget();toast('SUBJECT KILLED · A NEW UNIVERSITY SUBJECT IS MARKED');}
  if(a.phase==='escort'&&escort){const p=player.car||player;poseFigure(escort,p.x-22,p.y+12,player.a||0,frame*.04,'zombie');escort.position.y=terrainHeight(p.x,p.y);escort.visible=!player.car;}
  if(a.phase==='boss'&&a.entities.length&&!a.entities[0].alive)return success(6500,'MAJOR CAJUN · RECIPE GONE WRONG COMPLETE');
 }
 if(a.kind==='waves'&&a.phase==='wave'&&!a.entities.length){a.entities=spawnGroup(a.target,3+a.wave,a.wave===5);return;}
 if(a.kind==='waves'&&a.phase==='wave'&&!a.entities.some(z=>z.alive)){if(a.wave===5)return success(4200,'ALEX FIVE-WAVE TRIAL COMPLETE');a.wave++;a.entities=spawnGroup(a.target,3+a.wave,a.wave===5);rent(a.wave%2?'arc':'slug',true);a.label='Survive weapon trial wave '+a.wave+'/5';}
 if(a.kind==='specimens'&&a.phase==='bossCapture'&&!a.entities[0]?.alive){toast('BOSS KILLED · CAPTURE REQUIRES A LIVE SPECIMEN');spawnResearchBoss();}
 if(a.kind==='cars'){if(player.car===a.car){a.target=approach(level29Downtown.lots.dealer.venue);a.label='Deliver '+a.car.spec.name+' intact to Bonnie · HOLD at marked lot';}else{a.target=a.car;a.label='Steal the marked '+a.car.spec.name+' for Bonnie';}}
 if(held&&actionable()){if(++hold>=60){hold=0;held=false;interact();}}else hold=0;
}
const oldUpdate=update;update=function(){if(rental&&Date.now()>=rental.expires){endRental();toast('ALEX RENTAL ENDED · ORIGINAL WEAPON RESTORED');}if(cut){sceneTick();return;}
 oldUpdate.apply(this,arguments);if(state!=='play'||!player||!city?.world){if(!cut)stopSpeech();return;}if(soundMode===2)stopSpeech();
 if(siteCity!==city){siteCity=city;Object.assign(sites,city.storySites);}
 updateActive();
 const inside=sites.damion&&insideVenue(sites.damion,player);if(inside){if(++speechWait>=480||lastJoke<0){speechWait=0;lastJoke=(lastJoke+1)%jokes.length;subtitle={name:'DAMION · LIVE COMEDY',txt:jokes[lastJoke],t:420,col:'#dfc290'};speak(jokes[lastJoke]);}const m=sites.damion.storyTheater?.damion;if(m)m.userData.armR.rotation.x=-.6+Math.sin(frame*.04)*.5;}
 else if(lastJoke>=0){stopSpeech();lastJoke=-1;speechWait=0;}
};
const death=killZombie;killZombie=function(z){if(z.storyBoss&&['guard','ambient'].includes(z.killSource)){z.hp=Math.max(1,z.maxHp*.3);return;}if(z.storyCapturable&&['guard','ambient'].includes(z.killSource)){z.hp=Math.max(1,z.maxHp*.3);return;}return death.apply(this,arguments);};
const fire=fireWeapon;fireWeapon=function(x,y,a){if(!rental||Date.now()>=rental.expires)return fire.apply(this,arguments);const r=C.RENTALS[rental.id];bullets.push({x:x+Math.cos(a)*24,y:y+Math.sin(a)*24,vx:Math.cos(a)*26,vy:Math.sin(a)*26,life:36,dmg:r.damage,pierce:r.pierce,hit:new Set()});player.fireCd=r.cooldown;player.flash=3;lastShotFrame=frame;snd('shot');};
const rentalModels={};const syncWeapon=syncViewModel;syncViewModel=function(){syncWeapon.apply(this,arguments);if(!rental||cut)return;
 const id=rental.id;if(!rentalModels[id]){ensurePools();const source=extraWeap[id==='arc'?'carbine':'shotgun'],m=source.clone(true);m.traverse(o=>{if(o.isMesh&&o.material){o.material=o.material.clone();if(o.material.color)o.material.color.set(C.RENTALS[id].color);}});const cell=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,4,12),new THREE.MeshStandardMaterial({color:C.RENTALS[id].color,emissive:C.RENTALS[id].color,emissiveIntensity:.6}));cell.rotation.x=Math.PI/2;cell.position.set(1.6,1.5,-3);m.add(cell);vmScene.add(m);rentalModels[id]=m;}
 for(const [k,m]of Object.entries(rentalModels)){m.visible=k===id&&state==='play'&&!player.dead&&!view.chase;m.position.set(4,-4,-12);m.scale.setScalar(.55);}
 gun.visible=false;for(const m of Object.values(extraWeap))m.visible=false;
};
const rentalPanel=drawWeaponPanel;drawWeaponPanel=function(R,w,y){if(!rental)return rentalPanel.apply(this,arguments);hudText(C.RENTALS[rental.id].name,R-w+8,y+4,14,C.RENTALS[rental.id].color);hudText(Math.max(0,Math.ceil((rental.expires-Date.now())/1000))+'s TRIAL',R-8,y+21,11,'#fff','right');return true;};
let contractProp=null,contractPropScene=null;
const contractRender=render;render=function(){contractRender.apply(this,arguments);if(!scene)return;if(contractPropScene!==scene){contractPropScene=scene;contractProp=new THREE.Group();contractProp.name='active-business-contract';const crate=new THREE.Mesh(new THREE.BoxGeometry(13,10,11),new THREE.MeshStandardMaterial({color:'#97734c',roughness:.9}));crate.position.y=5;contractProp.add(crate);const seal=new THREE.Mesh(new THREE.BoxGeometry(3,10.3,11.3),new THREE.MeshStandardMaterial({color:'#bdb886'}));seal.position.y=5;contractProp.add(seal);scene.add(contractProp);}contractProp.visible=state==='play'&&active?.kind==='contract'&&!level29BusinessContracts.definition(active.contract)?.bosses;if(contractProp.visible){const p=active.target;contractProp.position.set(p.x,terrainHeight(p.x,p.y),p.y);}};
const target=missionTarget;missionTarget=function(){if(active?.target)return {...active.target,col:'#eac077',label:active.kind==='gumbo'?'J':active.kind==='cars'?'V':'A'};if(gps)return {...gps,col:'#eac077',label:'S'};return target.apply(this,arguments);};
const service=serviceVenue;serviceVenue=function(){const role=['jojo','alex','damion','dayshawn'].find(nearRole);if(role)return open(role);return service.apply(this,arguments);};
const campaignTick=updateMission;updateMission=function(){if(active)return;return campaignTick.apply(this,arguments);};
const begin=beginMission;beginMission=function(){if(active)return toast('FINISH OR ABANDON YOUR CITY STORY FIRST');return begin.apply(this,arguments);};
const reset=startGame;startGame=function(){cancel();gps=null;stopSpeech();return reset.apply(this,arguments);};
addEventListener('level29:gator-killed',e=>{if(active?.kind==='gumbo'&&active.item==='alligator'&&e.detail?.playerOwned){if(C.ingredient(save,'alligator')){active.phase=save.gumbo;setGumboTarget();persist();toast('FRESH ALLIGATOR MEAT COLLECTED');}}});
addEventListener('keydown',e=>{if(e.target?.matches?.('input,textarea,select'))return;if(e.key==='Escape'&&panel.style.display!=='none'){e.stopImmediatePropagation();close();}if(e.key.toLowerCase()==='u'&&state==='play'&&actionable()){e.preventDefault();e.stopImmediatePropagation();if(!active)interact();else held=true;}},true);
addEventListener('keyup',e=>{if(e.key.toLowerCase()==='u')held=false;});addEventListener('blur',()=>{held=false;stopSpeech();});
use.onpointerdown=e=>{e.preventDefault();if(!active)interact();else{held=true;use.setPointerCapture(e.pointerId);}};for(const e of ['pointerup','pointercancel','lostpointercapture'])use.addEventListener(e,()=>held=false);addEventListener('pagehide',()=>{stopSpeech();persist();});
const textDump=window.render_game_to_text;window.render_game_to_text=()=>{const d=JSON.parse(textDump());d.cityStory=active&&{kind:active.kind,phase:active.phase,label:active.label,wave:active.wave};d.gumbo=save.gumbo;d.ingredientCount=save.ingredients.length;d.trialSeconds=rental?Math.max(0,Math.ceil((rental.expires-Date.now())/1000)):0;return JSON.stringify(d);};
window.level29CityStories={open,close,ownsUse:()=>state==='play'&&actionable(),get save(){return save;},get active(){return active;},get rental(){return rental;},get cutscene(){return cut&&{seconds:cut.frame/60,beat:C.sceneBeat(cut.frame/60)};},get sites(){return sites;}};
})();
