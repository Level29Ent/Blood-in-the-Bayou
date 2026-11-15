'use strict';
(function(){
function entries(c){const out=[];for(const v of c?.venues||[]){if(v.privateResidence||!v.b||!v.name||!Number.isFinite(v.doorX)||!Number.isFinite(v.doorY))continue;const boat=v===c.casinoVenue&&c.riverboatHub,front=v.frontage||{dx:0,dy:1},p=boat?c.riverboatHub.entry:{x:v.doorX+front.dx*40,y:v.doorY+front.dy*40},district=boat?'RIVERBOAT HARBOR':v.millRoad?'MILL ROAD':v.southern?'BAYOU DISTRICT':v.depth?'CITY CENTER':'NEIGHBORHOOD';out.push({name:v.name,x:p.x,y:p.y,district,kind:v.id});for(const shop of v.mallLayout?.shops||[])out.push({name:shop.name,x:p.x,y:p.y,district:'GREENTOWN MALL · FLOOR '+(shop.floor+1),kind:'mall store',floor:shop.floor});}return out;}
function search(list,query='',p={x:0,y:0}){const words=String(query).toLowerCase().trim().split(/\s+/).filter(Boolean);return list.filter(s=>words.every(w=>(s.name+' '+s.district+' '+s.kind).toLowerCase().includes(w))).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y)||a.name.localeCompare(b.name));}
const api={entries,search};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29CityDirectory=api;
})();
