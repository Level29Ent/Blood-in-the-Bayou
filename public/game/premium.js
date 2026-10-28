'use strict';
// Storefront UI only. A native host must supply verified StoreKit entitlements.
(function(){
const PRODUCTS={adFree:{id:'level29.adfree',title:'Permanent ad removal'}};
let adFree=false,elapsed=0,lastOffer=0,pending=false;
const host=()=>window.level29NativeStore;
const box=document.createElement('div');box.id='premiumOffer';box.style.cssText='display:none;position:fixed;z-index:80;left:12px;top:110px;max-width:290px;padding:14px;background:#14202bf5;border:1px solid #c9a768;color:#fff;font:14px system-ui';document.body.appendChild(box);
function dismiss(){box.style.display='none';lastOffer=elapsed;}
async function refresh(){
 const h=host();if(!h||typeof h.entitlements!=='function'){adFree=false;return;}
 try{const ent=await h.entitlements();adFree=Array.isArray(ent)&&ent.includes(PRODUCTS.adFree.id);if(adFree)dismiss();}catch(_){/* Never unlock on transport failure. */}
}
async function open(){
 const h=host();if(!h||typeof h.products!=='function')return toast('APP STORE PURCHASES ARE NOT AVAILABLE IN THIS BUILD');
 const items=await h.products(Object.values(PRODUCTS).map(p=>p.id));
 box.replaceChildren();const title=document.createElement('strong');title.textContent='LEVEL 29 CUSTOMIZATIONS';box.append(title);
 for(const p of Object.values(PRODUCTS)){const product=items.find(i=>i.id===p.id);if(!product)continue;const button=document.createElement('button');button.textContent=p.title+' · '+product.displayPrice;button.onclick=()=>purchase(p.id);box.append(document.createElement('br'),button);}
 const restore=document.createElement('button');restore.textContent='Restore purchases';restore.onclick=async()=>{if(pending)return;pending=true;try{await h.restore();await refresh();}catch(_){toast('RESTORE UNAVAILABLE · TRY AGAIN');}finally{pending=false;}};
 const close=document.createElement('button');close.textContent='Not now';close.onclick=dismiss;box.append(document.createElement('br'),restore,close);box.style.display='block';
}
async function purchase(id){if(pending)return;const h=host();if(!h)return;pending=true;try{await h.purchase(id);await refresh();if(adFree)toast('AD-FREE OWNERSHIP VERIFIED');}catch(_){toast('PURCHASE NOT COMPLETED · NO UNLOCK APPLIED');}finally{pending=false;}}
const tick=update;
update=function(){tick.apply(this,arguments);if(state!=='play'||!player||player.dead)return;elapsed++;
 // No fake paid-ad-removal advertising while ads are disabled or native billing is absent.
 if(!adFree&&host()&&window.bayouAdsConfig?.enabled&&elapsed-lastOffer>=60*300&&mission?.phase==='start'&&!player.car){lastOffer=elapsed;open().catch(()=>{});}
};
window.level29Premium={open,refresh,get adFree(){return adFree;},products:PRODUCTS};refresh();
})();
