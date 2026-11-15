'use strict';
(function(){
const MISSIONS=[
 {title:'1 · Keep the Wheels Turning',from:'hardware',to:'tow',item:'sealed fastener box',pay:250,pickup:'Bayou Hardware clerk: The tow dispatcher called ahead. Take these fasteners over; their delivery cart needs repairs.',drop:'Tow dispatcher: That saves us a trip. Our mechanic can use this cart for tonight’s community supper.'},
 {title:'2 · A Favor for the Mechanic',from:'tow',to:'tire',item:'cart repair kit',pay:350,pickup:'Tow dispatcher: Bring this repair kit to the tire-shop mechanic. Tell them the supper crew is counting on us.',drop:'Tire-shop mechanic: The cart will roll again. I have a spare wheel ready for the truck-stop kitchen.'},
 {title:'3 · Kitchen on Wheels',from:'tire',to:'diner',item:'replacement cart wheel',pay:450,pickup:'Tire-shop mechanic: Take this replacement wheel to the truck stop. Their kitchen crew is helping Jojo feed the neighborhood.',drop:'Truck-stop cook: Perfect timing. We can move the supper supplies now. Jojo is waiting on our order.'},
 {title:'4 · Supper Across Town',from:'diner',to:'jojo',item:'sealed supper supply order',pay:550,pickup:'Truck-stop cook: This sealed order is for Chief Jojo. Tell her the mechanic and dispatcher made it happen.',drop:'Chief Jojo: Y’all looked after each other today. I saved a thank-you supper for the tow crew.'},
 {title:'5 · Bring It Home',from:'jojo',to:'tow',item:'tow-crew supper parcel',pay:1400,pickup:'Chief Jojo: One last stop. Bring this supper to the dispatcher and tell the whole crew thank you.',drop:'Tow dispatcher: Tools, wheels, and a hot supper. You brought this neighborhood together. You’re one of our own now.'}
];
function restore(raw){const valid=raw?.v===1&&Number.isInteger(raw.completed)&&raw.completed>=0&&raw.completed<=MISSIONS.length;const completed=valid?raw.completed:0;return {v:1,completed,accepted:valid&&completed<MISSIONS.length&&raw.accepted===true,carrying:valid&&completed<MISSIONS.length&&raw.carrying===true};}
function current(s){return MISSIONS[s.completed]||null;}
function target(s){const m=current(s);return s.accepted&&m?(s.carrying?m.to:m.from):null;}
function accept(s){if(!current(s)||s.accepted)return false;s.accepted=true;return true;}
function handoff(s,{site,using=false,onFoot=false,near=false,busy=false,dead=false}={}){if(!using||!onFoot||!near||busy||dead||site!==target(s)||!s.accepted)return null;const m=current(s);if(!s.carrying){s.carrying=true;return {type:'pickup',text:m.pickup,pay:0};}s.completed++;s.accepted=false;s.carrying=false;return {type:'delivery',text:m.drop,pay:m.pay};}
function retry(s){s.accepted=false;s.carrying=false;}
function resolve(c){const v=c?.venues||[];return {hardware:v.find(v=>v.infill&&v.name==='BAYOU HARDWARE'),tow:v.find(v=>v.careerBusiness==='tow'),tire:c?.tireShop||v.find(v=>v.kind==='tires'),diner:v.find(v=>v.depth==='diner'),jojo:c?.storySites?.jojo||v.find(v=>v.storyRole==='jojo')};}
function point(v,nav,clear,height){
 if(!v||!nav||!Number.isFinite(v.doorX)||!Number.isFinite(v.doorY))return null;
 const f=v.frontage||{dx:0,dy:1},dx=f.dx||0,dy=f.dy||0;
 // Try several frontage-adjacent graph nodes, not a remote coordinate fallback.
 for(const offset of [48,80,112])for(const side of [0,-32,32]){
  const k=nav.nearest(v.doorX+dx*offset-dy*side,v.doorY+dy*offset+dx*side,12);if(k<0)continue;
  const p=nav.point(k);if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)||Math.hypot(p.x-v.doorX,p.y-v.doorY)>160||!clear(p.x,p.y,12))continue;
  const base=height(p.x,p.y);if(Number.isFinite(base)&&Math.abs(base)<5)return {...p,base};
 }return null;
}
const api={MISSIONS,restore,current,target,accept,handoff,retry,resolve,point};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29NeighborhoodCore=api;
})();
