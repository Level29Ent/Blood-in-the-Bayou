'use strict';
(function(){
 const KEY='level29.spin.v1',DAY=24*60*60*1000,PRIZES=[500,1000,1500,2500,5000,750,2000,10000];
 function read(storage){try{const d=JSON.parse(storage.getItem(KEY)||'null');return d&&Number.isFinite(d.at)&&d.at>=0?d:null;}catch(_){return null;}}
 function available(data,now){return !data||now>=data.at+DAY;}
 function pick(random){return Math.min(PRIZES.length-1,Math.max(0,Math.floor(random()*PRIZES.length)));}
 function claim(storage,now,random,pay){
  const old=read(storage);if(!available(old,now))return {ok:false,reason:'cooldown',at:old.at};
  const index=pick(random),receipt={at:now,index,cash:PRIZES[index]};
  // Reserve the spin before crediting, so duplicate taps/reloads cannot reroll it.
  const previous=storage.getItem(KEY);storage.setItem(KEY,JSON.stringify(receipt));
  try{if(pay(receipt.cash)!==true)throw Error('Campaign could not be saved');}
  catch(error){if(previous===null)storage.removeItem(KEY);else storage.setItem(KEY,previous);throw error;}
  return {ok:true,...receipt};
 }
 const model={KEY,DAY,PRIZES,read,available,pick,claim};
 if(typeof module!=='undefined')module.exports=model;
 if(typeof window==='undefined')return;
 let busy=false,turn=0,previousFocus=null;
 const css=document.createElement('style');css.textContent=`
 #spinPanel{position:fixed;inset:0;z-index:59;display:none;align-items:center;justify-content:center;background:#05080cdd;padding:12px;box-sizing:border-box;color:#f1ebdc;font-family:monospace}
 #spinPanel .sbox{width:min(480px,100%);max-height:94dvh;overflow:auto;text-align:center;padding:18px}
 #spinFrame{position:relative;width:min(280px,65vw,44dvh);aspect-ratio:1;margin:12px auto}
 #spinWheel{position:absolute;inset:0;border-radius:50%;border:5px solid #e5bd63;box-sizing:border-box;background:conic-gradient(from -22.5deg,#3a7966 0deg 45deg,#654478 45deg 90deg,#8a6331 90deg 135deg,#386d8b 135deg 180deg,#3a7966 180deg 225deg,#654478 225deg 270deg,#8a6331 270deg 315deg,#386d8b 315deg 360deg);transition:transform 2.6s cubic-bezier(.12,.7,.12,1)}
 #spinWheel span{position:absolute;left:50%;top:50%;width:64px;margin:-10px -32px;font:bold 13px monospace;color:white;text-shadow:0 1px 3px #000;transform:rotate(var(--angle)) translateY(-90px) rotate(calc(-1 * var(--angle)))}
 #spinPointer{position:absolute;top:-6px;left:calc(50% - 10px);z-index:1;width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;border-top:20px solid #ffdc7b}
 #spinPanel button{min-height:44px;margin:5px;width:calc(100% - 10px)}
 #spinStatus{min-height:3em}#spinPanel .spinRules{font:12px/1.5 monospace}
 @media(max-width:400px),(max-height:550px){#spinWheel span{font-size:11px;transform:rotate(var(--angle)) translateY(-64px) rotate(calc(-1 * var(--angle)))}}
 @media(prefers-reduced-motion:reduce){#spinWheel{transition:none}}
 `;document.head.appendChild(css);
 const panel=document.createElement('div');panel.id='spinPanel';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','spinTitle');
 panel.innerHTML='<div class="sbox"><div class="eyebrow">LEVEL 29 · FREE DAILY BONUS</div><h2 id="spinTitle">Daily Spin</h2><p class="spinRules">One free spin every 24 hours. In-game cash only — no purchase, ads or real-money prizes. Each of the 8 prizes has an equal chance.</p><div id="spinFrame" aria-hidden="true"><div id="spinPointer"></div><div id="spinWheel">'+PRIZES.map((n,i)=>'<span style="--angle:'+i*45+'deg">$'+n.toLocaleString()+'</span>').join('')+'</div></div><p id="spinStatus" role="status" aria-live="polite"></p><button id="spinNow" type="button">SPIN FREE</button><button id="spinClose" type="button">RETURN TO CITY</button></div>';
 document.body.appendChild(panel);
 const wheel=panel.querySelector('#spinWheel'),status=panel.querySelector('#spinStatus'),spin=panel.querySelector('#spinNow'),exit=panel.querySelector('#spinClose');
 const ready=()=>available(read(localStorage),Date.now());
 function render(){const data=read(localStorage),can=available(data,Date.now());spin.disabled=busy||!can;
  if(busy)return;
  status.textContent=can?'Ready! Win $500 to $10,000 in game cash.':(data.cash?'Last prize: $'+data.cash.toLocaleString()+'. ':'')+'Next free spin: '+new Date(data.at+DAY).toLocaleString()+'.';
 }
 function close(){if(busy)return;panel.style.display='none';if(state==='shop')state='play';for(const k in keys)keys[k]=false;mouse.down=false;previousFocus?.focus?.();}
 function open(){if(mpRole)return toast('DAILY SPIN IS AVAILABLE IN SOLO PLAY');if(state!=='play'||!player||player.dead||window.bayouAdActive)return;
  previousFocus=document.activeElement;state='shop';for(const k in keys)keys[k]=false;mouse.down=false;panel.style.display='flex';render();(spin.disabled?exit:spin).focus();}
 async function spinOnce(){if(busy||state!=='shop'||!player||player.dead||mpRole)return;busy=true;spin.disabled=true;exit.disabled=true;
  const run=()=>claim(localStorage,Date.now(),Math.random,amount=>{const before=cash;cash+=amount;try{if(window.level29Save?.save()===true)return true;}catch(_){}cash=before;return false;});
  try{
   const result=navigator.locks?await navigator.locks.request(KEY,run):run();
   if(!result.ok){busy=false;render();return;}
   const target=(360-result.index*45)%360;turn=(Math.floor(turn/360)+5)*360+target;wheel.style.transform='rotate('+turn+'deg)';
   status.textContent='Spinning… Your reward is already saved.';
   await new Promise(resolve=>setTimeout(resolve,matchMedia('(prefers-reduced-motion: reduce)').matches?0:2700));
   sfx('cash');status.textContent='YOU WON $'+result.cash.toLocaleString()+' IN GAME CASH! Saved. Come back in 24 hours.';
  }catch(_){status.textContent='Spin unavailable: enable browser storage and save your solo game, then try again. No reward was charged.';}
  finally{busy=false;exit.disabled=false;spin.disabled=!ready();}
 }
 spin.onclick=spinOnce;exit.onclick=close;
 addEventListener('keydown',e=>{if(panel.style.display!=='flex')return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}else if(e.key==='Tab'){e.preventDefault();(document.activeElement===exit&&!spin.disabled?spin:exit).focus();}},true);
 addEventListener('storage',e=>{if(e.key===KEY&&panel.style.display==='flex'&&!busy)render();});
 window.level29DailySpin={open,close,ready};
})();
