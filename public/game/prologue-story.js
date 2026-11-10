'use strict';
(function(){
const STAGES=[
 {id:'sam',title:'Before the Bayou',site:'samCasino',action:'Talk to Sam Butcher',speaker:'SAM BUTCHER',line:"This city's election is a fuckin' goof. I've got something special planned for this city, and I need your help. Find Ahmad Ervins in Tremé. He's out with the second line."},
 {id:'festival',title:'Find Ahmad',site:'festival',action:'Find Ahmad Ervins in the moving Tremé parade',speaker:'AHMAD ERVINS',line:'Sam needs my help? All right. First, I left my phone at the apartments by the mall. Pick it up and bring it back here.'},
 {id:'phone',title:'A Phone in the Crowd',site:'phone',action:"Collect Ahmad's phone at the mall apartments"},
 {id:'phoneReturn',title:'Back to the Second Line',site:'festival',action:'Return the phone to Ahmad',speaker:'AHMAD ERVINS',line:'My phone! Thank you. Sam called. Go see him behind the casino; he has another job for you.'},
 {id:'samBook',title:'A Special Request',site:'samCasino',action:'Meet Sam behind the casino',speaker:'SAM BUTCHER',line:'I need the book on cordyceps from the public library. Look on the science shelf. Bring it back to me.'},
 {id:'book',title:'The Science Shelf',site:'book',action:'Take the cordyceps book from the library shelf'},
 {id:'bookReturn',title:'Something Special',site:'samCasino',action:'Bring the cordyceps book back to Sam',speaker:'SAM BUTCHER',line:'That is the book. Ahmad is at the university now. Bring him to me in the alley beside the garage shop.'},
 {id:'university',title:'Find the Scientist',site:'university',action:'Meet Ahmad at the university',speaker:'AHMAD ERVINS',line:"Sam is at the garage? Let's go. Stay close; I'll follow you on foot. If you drive, wait for me before you speak to Sam."},
 {id:'escort',title:'The Garage Alley',site:'samGarage',action:'Escort Ahmad to Sam in the garage alley',speaker:'AHMAD ERVINS',line:'Sam, the book is here. Before we start, I need my lab coat and goggles from the university, a Science Kit from Greenmart, and honey from Chief Jojo. Bring everything back to this alley.',escort:true},
 {id:'gear',title:'Ahmad’s Supplies',site:'gear',action:'Collect the lab coat and goggles at the university'},
 {id:'kit',title:'A Science Kit',site:'kit',action:'Collect the Science Kit inside Greenmart'},
 {id:'honey',title:'Chief Jojo’s Honey',site:'jojo',action:'Ask Chief Jojo for honey',speaker:'CHIEF JOJO',line:'Honey for Ahmad? Here you go. Keep that jar sealed until you get back to him.'},
 {id:'suppliesReturn',title:'Dusk at the Garage',site:'samGarage',action:'Bring the coat, goggles, Science Kit and honey to Ahmad',speaker:'AHMAD ERVINS',line:"Everything is here. It's getting late. I'll put these on and meet you inside the garage."},
 {id:'garage',title:'Behind Closed Doors',site:'garageDoor',action:'Follow Ahmad and enter the garage'},
 {id:'garageVideo',title:'The Experiment',site:'garageDoor',action:'Watch the garage scene',video:'dyg3Wbx4iSc'},
 {id:'mall',title:'Meet Ahmad at the Mall',site:'mall',action:'Find Ahmad beside the person sitting on the ground'},
 {id:'mallVideo',title:'The First Signs',site:'mall',action:'Watch the mall scene',video:'vAZoEoBmff0'},
 {id:'ronnie',title:'A City in Chaos',site:'ronnie',action:'Find Ronniebaby down the second neighborhood street',radius:18.3},
 {id:'ronnieVideo',title:'Blood in the Bayou',site:'ronnie',action:'Watch Ronniebaby’s scene',video:'jy8lyAr8620'}
];
const ITEMS={2:['phone'],3:[],5:['book'],6:[],9:['coat','goggles'],10:['kit'],11:['honey'],12:[]};
function restore(value){if(!value||value.v!==1||!Number.isInteger(value.stage)||value.stage<0||value.stage>STAGES.length)return null;return {v:1,stage:value.stage};}
function fresh(){return {v:1,stage:0};}
function active(s){return !!s&&s.stage<STAGES.length;}
function peaceful(s){return active(s)&&s.stage<17;}
function step(s,event){if(!active(s))return s;const stage=STAGES[s.stage];if(event!==(stage.video?'videoDone':'interact'))return s;return {v:1,stage:s.stage+1};}
function inventory(s){const bag=new Set();if(!s)return [];for(let i=0;i<s.stage;i++){if(i===3)bag.delete('phone');else if(i===6)bag.delete('book');else if(i===12)bag.clear();else for(const name of ITEMS[i]||[])bag.add(name);}return [...bag];}
function canInteract(s,player,target,escort){if(!active(s)||!player||player.dead||player.car||!target)return false;const distance=Math.hypot(player.x-target.x,player.y-target.y);return distance<=(STAGES[s.stage].radius||36)&&(!STAGES[s.stage].escort||!!escort&&Math.hypot(escort.x-target.x,escort.y-target.y)<55);}
function embedURL(id,origin){if(!STAGES.some(s=>s.video===id))return null;return 'https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&playsinline=1&enablejsapi=1&rel=0&origin='+encodeURIComponent(origin);}
function videoEnded(event,source){if(event.source!==source||event.origin!=='https://www.youtube-nocookie.com')return false;let d=event.data;try{if(typeof d==='string')d=JSON.parse(d);}catch(_){return false;}return d?.event==='onStateChange'&&d.info===0||d?.event==='infoDelivery'&&d.info?.playerState===0;}
function nearestOpen(point,blocked,max=160){if(!point)return null;for(let r=0;r<=max;r+=8)for(let k=0;k<(r?16:1);k++){const a=k*Math.PI/8,p={x:point.x+Math.cos(a)*r,y:point.y+Math.sin(a)*r};if(!blocked(p.x,p.y,10))return p;}return null;}
function plan(c,nav,blocked){
 const venues=c.venues||[],venue=id=>venues.find(v=>v.id===id),mall=c.mall||venue('mall'),casino=c.casinoVenue||venue('casino'),university=venues.find(v=>v.lotId==='university')||venue('classroom'),garage=venues.find(v=>v.id==='garage'&&!v.careerBusiness),jojo=venues.find(v=>v.storyRole==='jojo'),library=c.civicLocations?.library;
 if(!mall||!casino||!university||!garage||!jojo||!library||!c.greenmart||!c.treme?.homes?.length)throw Error('The prologue requires the casino, Tremé, university, mall, library, Greenmart, garage and Chief Jojo.');
 const outdoor=(p)=>{const k=nav.nearest(p.x,p.y,10);if(k<0)throw Error('No reachable prologue street');const q=nav.point(k);if(Math.hypot(q.x-p.x,q.y-p.y)>640)throw Error('Prologue site is too far from a public approach');return q;};
 const inner=(p)=>{const q=nearestOpen(p,blocked,40);if(!q)throw Error('A prologue pickup is obstructed');return q;};
 const home=c.treme.homes[0],flats=(c.neighborhood?.homes||[]).filter(h=>h.apartment).sort((a,b)=>Math.hypot(a.x-mall.b.x,a.y-mall.b.y)-Math.hypot(b.x-mall.b.x,b.y-mall.b.y)),apartment=flats[0];if(!apartment)throw Error('No mall-area apartment for Ahmad');
 const blocks=c.neighborhood.blocks,second=blocks[1]||blocks[0];
 const points={samCasino:c.riverboatHub?{x:casino.b.x+casino.b.w/2,y:casino.b.y+34}:outdoor({x:casino.b.x+casino.b.w/2,y:casino.b.y-32}),casinoEntry:c.riverboatHub?outdoor(c.riverboatHub.entry):outdoor({x:casino.doorX,y:casino.doorY+40}),festival:outdoor({x:home.x+home.w/2,y:home.y+home.h+48}),phone:inner({x:apartment.x+apartment.w/2,y:apartment.y+apartment.h+18}),samGarage:outdoor({x:garage.b.x-40,y:garage.b.y+garage.b.h*.65}),garageDoor:inner({x:garage.doorX+(garage.frontage?.dx??0)*28,y:garage.doorY+(garage.frontage?.dy??1)*28}),book:inner({x:library.x+library.w/2-70,y:library.y+35}),university:inner({x:university.stationX,y:university.stationY}),gear:inner({x:university.stationX+16,y:university.stationY}),kit:inner({x:c.greenmart.checkout.x,y:c.greenmart.checkout.y}),jojo:inner({x:jojo.stationX,y:jojo.stationY}),mall:outdoor({x:mall.doorX,y:mall.doorY+52}),ronnie:outdoor({x:second.x-32,y:second.y+second.h*.65})};
 return {points,apartment,garage,library,university,jojo};
}
// A cardinal out-and-back street path keeps marching crowds on actual walkable tiles.
function localPath(start,end,blocked,bounds,spacing=8){
 const minX=Math.floor(bounds.x/spacing)*spacing,minY=Math.floor(bounds.y/spacing)*spacing,W=Math.ceil(bounds.w/spacing)+1,H=Math.ceil(bounds.h/spacing)+1;
 const point=k=>({x:minX+(k%W)*spacing,y:minY+Math.floor(k/W)*spacing}),key=p=>Math.round((p.y-minY)/spacing)*W+Math.round((p.x-minX)/spacing),a=key(start),z=key(end);
 if(a<0||a>=W*H||z<0||z>=W*H)return null;
 const queue=[a],prev=new Map([[a,-1]]);let found=-1;
 for(let i=0;i<queue.length&&i<12000;i++){const k=queue[i],p=point(k);if(Math.hypot(p.x-end.x,p.y-end.y)<=spacing*1.5){found=k;break;}const x=k%W,y=Math.floor(k/W);for(const n of [x?k-1:-1,x<W-1?k+1:-1,y?k-W:-1,y<H-1?k+W:-1]){if(n<0||prev.has(n))continue;const p=point(n);if(blocked(p.x,p.y,6))continue;prev.set(n,k);queue.push(n);}}
 if(found<0)return null;const out=[];for(let k=found;k!==-1;k=prev.get(k))out.push(point(k));return out.reverse();
}
function paradeRoute(nav,start,width,limit=24,extraBlocks=0){
 const a=nav.nearest(start.x,start.y,10);if(a<0)return [];
 // Keep the original local route, then extend its outward leg by two 256-unit blocks.
 const visited=new Set([a]),path=[a];
 for(let n=1;n<limit;n++){const k=path.at(-1),x=k%width,candidates=[k+width,x<width-1?k+1:-1,k-width,x?k-1:-1].filter(q=>q>=0&&q<nav.mask.length&&nav.mask[q]&&!visited.has(q)&&Math.hypot(nav.point(q).x-start.x,nav.point(q).y-start.y)<=260);if(!candidates.length)break;const q=candidates[(n%5===0?1:0)%candidates.length];visited.add(q);path.push(q);}
 if(extraBlocks){const queue=[a],prev=new Map([[a,-1]]),distance=new Map([[a,0]]),goal=(path.length-1)*32+extraBlocks*256;let best=a;
  // Search from the start: the original local loop may end at a dead end.
  for(let i=0;i<queue.length;i++){const k=queue[i],x=k%width,d=distance.get(k);if(d>distance.get(best))best=k;if(d>=goal){best=k;break;}for(const q of [k+width,x<width-1?k+1:-1,k-width,x?k-1:-1])if(q>=0&&q<nav.mask.length&&nav.mask[q]&&!prev.has(q)){prev.set(q,k);distance.set(q,d+32);queue.push(q);}}
  const extended=[];for(let k=best;k>=0;k=prev.get(k))extended.push(k);path.splice(0,path.length,...extended.reverse());
 }

 return path.concat(path.slice(1,-1).reverse()).map(nav.point);
}

function routePoint(route,distance){if(!route.length)return null;let length=0;const edges=route.map((p,i)=>{const q=route[(i+1)%route.length],n=Math.hypot(q.x-p.x,q.y-p.y);length+=n;return n;});if(!length)return {...route[0],a:0};let d=((distance%length)+length)%length;for(let i=0;i<route.length;i++){if(d<=edges[i]&&edges[i]){const p=route[i],q=route[(i+1)%route.length],t=d/edges[i];return {x:p.x+(q.x-p.x)*t,y:p.y+(q.y-p.y)*t,a:Math.atan2(q.y-p.y,q.x-p.x)};}d-=edges[i];}return {...route[0],a:0};}
const api={STAGES,fresh,restore,active,peaceful,step,inventory,canInteract,embedURL,videoEnded,nearestOpen,plan,localPath,paradeRoute,routePoint};
if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29PrologueStory=api;
})();
