'use strict';
(function(){
function unique(points,min=100){const out=[];for(const p of points)if(!out.some(q=>Math.hypot(p.x-q.x,p.y-q.y)<min))out.push(p);return out;}
if(typeof module!=='undefined')module.exports={unique};if(typeof window==='undefined')return;
function points(){if(!city?.world||!level29Navigation.graph)return [];const nav=level29Navigation.graph,out=[];for(const v of city.venues){const f=v.frontage||{dx:0,dy:1},x=v.doorX+f.dx*48,y=v.doorY+f.dy*48,k=nav.nearest(x,y,14);if(k<0)continue;const p=nav.point(k);if(!blockedCircle(p.x,p.y,14))out.push({...p,name:v.name});}if(city.farmEntrance){const k=nav.nearest(city.farmEntrance.x,city.farmEntrance.y,14);if(k>=0)out.push({...nav.point(k),name:'BAYOU FARM'});}return unique(out);}
function withMap(fn,args){if(!city?.world||mpRole==='client')return fn.apply(null,args);const candidates=points(),used=[],old=roadPointFar;let step=0;
 roadPointFar=function(x,y,min,max){const pool=candidates.filter(p=>Math.hypot(p.x-x,p.y-y)>=Math.min(min||180,180)&&!used.includes(p));if(!pool.length)return old.apply(this,arguments);const p=pool[(missionIdx*7+step++)%pool.length];used.push(p);return {x:p.x,y:p.y};};
 try{return fn.apply(null,args);}finally{roadPointFar=old;}
}
// Updated supply operations reference named current-map venues, not removed storefront identities.
const info=missionInfo;missionInfo=function(i){const m=info.apply(this,arguments);if(m.isBoss)return m;const slots={20:{t:'Major Cajun Relief Run',stops:['cafe','grocery'],hold:180,storyStops:['jojo','grocery'],line:'Collect Chief Jojo’s relief order at Major Cajun, stop at the grocery, and return to the mansion.',say:'Relief supplies ready.'},22:{t:'Elevated City Supply Line',stops:['retail','gas'],hold:190,storyStops:['dayshawn','gas'],line:'Collect sealed business supplies at Elevated Melanin and fuel at Gas & Go. Return to the mansion.',say:'Sealed shipment ready.'},25:{t:'AK Gun Plus Equipment Transfer',stops:['armory','police'],hold:200,storyStops:['alex','police'],line:'Collect Alex’s equipment case at AK Gun Plus and check in at police dispatch. Return to the mansion.',say:'Equipment transfer approved.'},26:{t:'Felicia Cold-Chain Relief',stops:['retail','hospital'],hold:180,storyStops:['felicia','hospital'],line:'Collect cold-chain supplies at Felicia’s trailer and medical stock at the hospital. Bring both back to the mansion.',say:'Cold-chain supplies secured.'}};const op=slots[i%MISSIONS_PER];if(op){m.type='op';m.op=op;m.title=op.t;}return m;};
const begin=beginMission;beginMission=function(){return withMap(begin,arguments);};
const pass=passMission;passMission=function(){return withMap(pass,arguments);};
const dispatch=placeMissionStart;placeMissionStart=function(){dispatch.apply(this,arguments);if(!city?.world||!mission||missionIdx===0||mpRole==='client')return;const list=points();if(!list.length)return;const p=list[(missionIdx-1)%list.length];mission.start={x:p.x,y:p.y};ronnie.x=p.x;ronnie.y=p.y;objective='Meet Ronniebaby at '+p.name+'. Follow the gold mission marker.';mission.dispatchVenue=p.name;};
const brief=briefing;briefing=function(info){return brief.apply(this,arguments)+(city?.world?' Current city routes include Major Cajun, AK Gun Plus, Elevated Melanin, Felicia’s trailer, the farm and airport. Follow each mission marker; doors and roads use the current map.':'');};
window.level29CampaignMap={points};
})();
