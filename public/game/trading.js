'use strict';
// Earned in-game cash only. Ownership and equipped cosmetics are browser-save data.
(function(){
const CATALOG={
 tackle:{name:'Offshore tackle',price:1800,kind:'fish',desc:'25% stronger reeling. Permanent.'},
 cooler:{name:'Insulated fish cooler',price:1200,kind:'fish',desc:'Market pays $90 per catch instead of $60.'},
 boat:{name:'Personal fishing launch',price:4500,kind:'fish',desc:'Own a fishing boat. Free replacement delivery at the market.'},
 medkit:{name:'Emergency care',price:180,kind:'clinic',repeat:true,desc:'Restore health to your current maximum.'},
 trauma:{name:'Trauma training',price:2400,kind:'clinic',desc:'Recover 1 health per second while inside a safe building.'},
 grip:{name:'Precision grip',price:1600,kind:'smoke',desc:'SMG / carbine spread reduced by 35%.'},
 ammo:{name:'Match ammunition upgrade',price:2200,kind:'smoke',desc:'SMG / carbine damage increased by 20%.'},
 teal:{name:'Lagoon equipment finish',price:650,kind:'smoke',desc:'Equip teal SMG / carbine and dashboard accents.'},
 bronze:{name:'Bronze equipment finish',price:850,kind:'smoke',desc:'Equip bronze SMG / carbine and dashboard accents.'}
};
function purchase(data,id,balance){const item=Object.hasOwn(CATALOG,id)?CATALOG[id]:null;if(!item||!Number.isFinite(balance)||balance<item.price||data.owned[id]&&!item.repeat)return {ok:false,balance};data.owned[id]=true;if(id==='teal'||id==='bronze')data.finish=id;return {ok:true,balance:balance-item.price};}
if(typeof module!=='undefined')module.exports={CATALOG,purchase};
if(typeof window==='undefined')return;
const KEY='level29.trading.v1';let data={owned:{},finish:'stock'};
try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s){data.owned=s.owned&&typeof s.owned==='object'?s.owned:{};data.finish=['stock','teal','bronze'].includes(s.finish)?s.finish:'stock';}}catch(_){}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(data));}catch(_){}if(window.level29Save)level29Save.save();}
let venue=null,previous='play';const panel=document.createElement('div');panel.id='tradingPanel';panel.style.cssText='position:fixed;inset:0;z-index:70;display:none;align-items:center;justify-content:center;background:#071017d9;padding:16px;color:#eee';document.body.appendChild(panel);
function close(){panel.style.display='none';venue=null;if(state==='shop')state=previous;mouse.down=false;}
function draw(){if(!venue)return;
 const stock=Math.max(0,Number(level29OpenWorld.save.fishStock)||0),value=data.owned.cooler?90:60;
 const item=(title,desc,action,label,disabled=false)=>'<div class="item"><div><b>'+title+'</b><span>'+desc+'</span></div><button data-action="'+action+'"'+(disabled?' disabled':'')+'>'+label+'</button></div>';
 let content='';
 if(venue.kind==='fish')content+=item('Fresh catch delivery',stock+' unsold catches · $'+value+' each. This is a market bonus on top of catch rewards.','sell','SELL · $'+stock*value,stock===0);
 for(const [id,it] of Object.entries(CATALOG))if(it.kind===venue.kind){const owned=!!data.owned[id],cosmetic=['teal','bronze'].includes(id);
  content+=item(it.name,it.desc,owned&&cosmetic?'equip:'+id:'buy:'+id,owned&&!it.repeat?(cosmetic?(data.finish===id?'EQUIPPED':'EQUIP'):'OWNED'):'$'+it.price,owned&&!it.repeat&&!cosmetic||(!owned||it.repeat)&&cash<it.price);
 }
 if(venue.kind==='fish'&&data.owned.boat)content+=item('Your fishing launch','Delivery requires clear water near the Gulf pier. Existing active launch is reused.','deliver','DELIVER BOAT');
 if(venue.kind==='smoke')content+=item('Factory finish','Restore the standard equipment appearance.','equip:stock','EQUIP');
 panel.innerHTML='<div class="sbox"><div class="eyebrow">'+venue.short+' · IN-GAME CASH ONLY</div><h2>'+venue.name+'</h2><p class="cash">'+money(cash)+'</p>'+content+'<button class="close" data-action="close">RETURN TO STREET · ESC</button></div>';
}
function open(v){if(!player||player.dead||player.car||!insideVenue(v,player))return;previous=state==='shop'?'play':state;venue=v;state='shop';mouse.down=false;for(const k in keys)keys[k]=false;if(document.pointerLockElement)document.exitPointerLock();panel.style.display='flex';draw();}
function deliver(){
 const active=cars.find(c=>c.playerLaunch&&!c.dead&&!c.gone);if(active){toast('YOUR BOAT IS ALREADY AFLOAT · CHECK THE B MARKER');return;}
 const p=city.pier;if(!p)return toast('NO HARBOR IN THIS AREA');
 let spot=null;const old=moverCtx;moverCtx={boat:true};
 try{for(let ring=2;ring<14&&!spot;ring++)for(let k=0;k<16;k++){const a=k*Math.PI/8,x=p.x0+Math.cos(a)*ring*TILE,y=p.y+Math.sin(a)*ring*TILE;
  if(!blockedCircle(x,y,32)&&!cars.some(c=>!c.dead&&dist(c.x,c.y,x,y)<100)){spot={x,y};break;}
 }}finally{moverCtx=old;}
 if(!spot)return toast('HARBOR BLOCKED · CLEAR A MOORING FIRST');
 const c=makeCar(spot.x,spot.y,0,'boat');c.playerLaunch=true;cars.push(c);toast('PERSONAL LAUNCH DELIVERED · B ON MAP');
}
panel.addEventListener('click',e=>{const button=e.target.closest('[data-action]');if(!button||!venue||button.disabled)return;const a=button.dataset.action;
 if(a==='close')return close();
 if(a==='sell'&&venue.kind==='fish'){
  const stock=Math.max(0,Math.floor(Number(level29OpenWorld.save.fishStock)||0));if(stock){cash+=stock*(data.owned.cooler?90:60);level29OpenWorld.save.fishStock=0;persistOpenWorld();sfx('cash');persist();}
 }else if(a==='deliver'&&venue.kind==='fish'&&data.owned.boat)deliver();
 else if(a.startsWith('equip:')){const id=a.slice(6);if(id==='stock'||['teal','bronze'].includes(id)&&data.owned[id]){data.finish=id;persist();}}
 else if(a.startsWith('buy:')){const id=a.slice(4),it=CATALOG[id];if(!it||it.kind!==venue.kind)return;const result=purchase(data,id,cash);if(result.ok){cash=result.balance;if(id==='medkit')player.hp=player.maxHp;sfx('cash');persist();}}
 draw();
});
addEventListener('keydown',e=>{if(venue&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}},true);
const oldUpdate=update;
update=function(){oldUpdate.apply(this,arguments);if(venue&&state!=='shop'){close();return;}if(state!=='play'||!player||player.dead)return;
 if(data.owned.trauma&&frame%60===0&&!player.car&&city.venues.some(v=>insideVenue(v,player)))player.hp=Math.min(player.maxHp,player.hp+1);
};
const blips=extraBlips;extraBlips=function(){return blips().concat(cars.filter(c=>c.playerLaunch&&!c.dead&&!c.gone).map(c=>({x:c.x,y:c.y,col:'#7ed2d6',label:'B'})));};
window.level29Trading={open,close,get data(){return data;},get reelPower(){return data.owned.tackle?1.25:1;},get spread(){return data.owned.grip?.65:1;},get damage(){return data.owned.ammo?1.2:1;},get color(){return {stock:'#353c41',teal:'#368e91',bronze:'#af8252'}[data.finish];}};
})();
