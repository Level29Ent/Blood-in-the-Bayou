'use strict';
(function(){
const CONTRACTS={
 jojo_supply:{owner:'jojo',name:'Major Cajun · Dinner Rush',pay:2200,stops:['grocery','farm','jojo'],labels:['Recover the rice order','Pick up the farm produce crate','Return the dinner supplies to Chief Jojo'],counts:[3,4,0]},
 alex_parts:{owner:'alex',name:'AK Gun Plus · Workshop Salvage',pay:2700,stops:['garage','terminal','alex'],labels:['Recover gunsmith tool crate','Collect air-freight components','Return the test parts to Alex'],counts:[4,5,0]},
 bonnie_parts:{owner:'bonnie',name:'Slab Motors · Chrome Run',pay:2400,stops:['garage','gas','bonnie'],labels:['Collect the chrome wheel shipment','Recover the tuning kit','Return the hardware to Bonnie'],counts:[3,4,0]},
 felicia_ice:{owner:'felicia',name:'Felicia · Cold Chain',pay:1900,stops:['grocery','hospital','felicia'],labels:['Collect food-safe ice supplies','Recover the refrigeration relay','Return the cold-chain supplies to Felicia'],counts:[3,4,0]},
 damion_gear:{owner:'damion',name:'Laugh Theater · Show Must Go On',pay:2100,stops:['studio','business','damion'],labels:['Recover the stage sound kit','Retrieve the microphone case','Return the comedy gear to Damion'],counts:[3,4,0]},
 dayshawn_product:{owner:'dayshawn',name:'Elevated Melanin · Missing Stock',pay:3200,stops:['grocery','terminal','gas','dayshawn'],labels:['Recover the marked cannabis flower crate','Recover the marked edible shipment','Recover the marked concentrate case','Return the sealed product to Dayshawn'],counts:[4,5,5,0]},
 dayshawn_bosses:{owner:'dayshawn',name:'Elevated Melanin · Four Rivals',pay:7800,stops:['classroom','garage','terminal','casino','dayshawn'],labels:['Defeat the university rival boss','Defeat the garage rival boss','Defeat the airport rival boss','Defeat the waterfront rival boss','Report the four boss victories to Dayshawn'],counts:[1,1,1,1,0],bosses:true}
};
function definition(id){return Object.hasOwn(CONTRACTS,id)?CONTRACTS[id]:null;}
if(typeof module!=='undefined')module.exports={CONTRACTS,definition};if(typeof window!=='undefined')window.level29BusinessContracts={CONTRACTS,definition};
})();
