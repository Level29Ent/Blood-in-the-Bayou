'use strict';
(function(){
const BUSINESSES=[{id:'tow',name:'29 TOW & IMPOUND',kind:'tow',source:'garage'}, {id:'pawn',name:'BAYOU PAWN & COLLECTIBLES',kind:'pawn',source:'retail'}, {id:'marine',name:'29 MARINE REPAIR',kind:'marine',source:'garage'}, {id:'radio',name:'LEVEL 29 BROADCAST HOUSE',kind:'radio',source:'business'}, {id:'construction',name:'29 CITY WORKS',kind:'construction',source:'business'}, {id:'vet',name:'BAYOU VETERINARY CARE',kind:'vet',source:'hospital'}];
const JOBS=[
 ['tow','Roadside Rescue',['inspect','recover','return']],['tow','Impound Inventory',['investigate','inspect','return']],['tow','Cargo Recovery',['recover','drive','return']],
 ['pawn','Serial Number Trail',['investigate','investigate','return']],['pawn','Lost Studio Coin',['search','inspect','return']],['pawn','Owner Verification',['inspect','escort','return']],
 ['marine','Engine Parts Run',['search','repair','return']],['marine','Stranded Launch',['repair','boat','return']],['marine','Bayou Supply Escort',['boat','drive','return']],
 ['radio','Restore the Signal',['inspect','repair','return']],['radio','Reporter Protection',['escort','defend','return']],['radio','Distress Frequency',['investigate','search','return']],
 ['construction','Street Reopening',['inspect','repair','return']],['construction','Equipment Transfer',['recover','drive','return']],['construction','Bridge Repair Watch',['repair','defend','return']],
 ['vet','Missing Pet Search',['search','escort','return']],['vet','Wildlife Medicine',['inspect','drive','return']],['vet','Keeper Emergency',['repair','escort','return']],
 ['greenmart','Cold Storage Failure',['inspect','repair','return']],['greenmart','Missing Grocery Truck',['recover','drive','return']],['greenmart','Shoppers Home Safe',['escort','inspect','return']],
 ['zoo','Habitat Power Check',['inspect','repair','return']],['zoo','Missing Keeper',['search','escort','return']],['zoo','Animal Transfer',['inspect','escort','return']],
 ['base','Recon Without Contact',['stealth','inspect','return']],['base','Convoy Courier',['drive','defend','return']],['base','Missing Squad Medic',['search','escort','return']],
 ['metro','Signal Box Fault',['inspect','repair','return']],['metro','Lost Luggage',['investigate','search','return']],['metro','Stalled Service Evacuation',['inspect','escort','return']],
 ['park','Ride Power Restoration',['inspect','repair','return']],['park','Safety Inspection',['inspect','inspect','return']],['park','Missing Visitor',['search','escort','return']],
 ['studio','Recover the Footage',['investigate','search','return']],['studio','Protect the Shoot',['inspect','defend','return']],['studio','Props Before Sunset',['recover','drive','return']]
].map(([owner,name,stages],id)=>({id,owner,name,stages,reward:900+(id%3)*300,requires:0}));
function finishRecord(data,id){const job=JOBS[id];if(!job||data.completed.includes(id))return 0;data.completed.push(id);data.reputation[job.owner]=(data.reputation[job.owner]||0)+1;return job.reward;}
function stageDuration(kind){return {inspect:3,investigate:5,search:4,repair:7,stealth:10,defend:18}[kind]||0;}
if(typeof module!=='undefined')module.exports={BUSINESSES,JOBS,finishRecord,stageDuration};if(typeof window!=='undefined')window.level29CityCareerCatalog={BUSINESSES,JOBS,finishRecord,stageDuration};
})();
