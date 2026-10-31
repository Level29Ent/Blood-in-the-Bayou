'use strict';
// Daily log-in rewards: a 7-day streak that pays cash and bonuses once per calendar day.
(function(){
const KEY='level29.daily.v1';
const REWARDS=[
 {cash:1000,note:'Starter pay'},
 {cash:2000,note:'Steady work'},
 {cash:3500,armor:50,note:'Plus body armor'},
 {cash:5000,note:'Good week'},
 {cash:7500,hp:100,note:'Plus full health'},
 {cash:10000,armor:100,note:'Plus full armor'},
 {cash:25000,hp:100,armor:100,note:'Weekly jackpot'}
];
const pad=n=>String(n).padStart(2,'0');
const dayKey=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const today=()=>dayKey(new Date());
const yesterday=()=>{const d=new Date();d.setDate(d.getDate()-1);return dayKey(d);};
let data={last:'',streak:0,total:0,claims:0};
try{Object.assign(data,JSON.parse(localStorage.getItem(KEY)||'{}'));}catch(_){}
data.streak=Math.max(0,Math.min(7,+data.streak||0));data.total=Math.max(0,+data.total||0);data.claims=Math.max(0,+data.claims||0);
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(data));}catch(_){}};
const money=n=>'$'+Math.round(n).toLocaleString();
// Dates only ever move forward. Setting the clock back never allows a second claim.
const canClaim=()=>today()>String(data.last||'');
const nextIndex=()=>{if(!data.last)return 0;if(data.last===yesterday())return data.streak%7;return 0;};
const css=document.createElement('style');css.textContent=`
 #dailyPanel{position:fixed;inset:0;z-index:58;display:none;align-items:center;justify-content:center;background:#05080cd9;padding:14px;box-sizing:border-box;font-family:'IBM Plex Mono',monospace;color:#f1ebdc}
 #dailyPanel .sbox{width:min(720px,100%);max-height:92dvh;overflow:auto;padding:22px;border-color:#b29456}
 #dailyPanel h2{font-size:36px;margin:2px 0 8px}#dailyPanel p{font-size:13px;line-height:1.6;margin:6px 0}
 #dailyGrid{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;margin:16px 0}
 .dailyCell{border:1px solid #4d5a60;background:#18232b;padding:10px 4px;text-align:center;min-height:98px;display:flex;flex-direction:column;justify-content:space-between;gap:4px}
 .dailyCell b{font:700 12px 'IBM Plex Mono',monospace;color:#9fb0b4}.dailyCell strong{font:700 15px 'IBM Plex Mono',monospace;color:#f1d78c}.dailyCell span{font-size:10px;line-height:1.3;color:#aab8bb}
 .dailyCell.done{opacity:.55;border-color:#4f7a5c}.dailyCell.done b{color:#8fd0a0}
 .dailyCell.today{border-color:#e5bd63;background:#2b2a1d;box-shadow:0 0 0 1px #e5bd63}
 .dailyCell.big{grid-column:span 1}
 #dailyPanel button{min-height:46px;cursor:pointer}
 #dailyClaim{width:100%;margin-top:6px}
 #dailyBadge{position:fixed;z-index:24;right:18px;top:104px;background:#2a2412f2;color:#f1d78c;border:1px solid #e5bd63;padding:10px 12px;font:700 12px 'IBM Plex Mono',monospace;min-height:44px;cursor:pointer;display:none;animation:dailyPulse 1.6s ease-in-out infinite}
 @keyframes dailyPulse{50%{box-shadow:0 0 0 4px #e5bd6340}}
 @media(prefers-reduced-motion:reduce){#dailyBadge{animation:none}}
 @media(max-width:699px){#dailyPanel .sbox{padding:16px}#dailyPanel h2{font-size:30px}#dailyGrid{grid-template-columns:repeat(4,1fr)}.dailyCell{min-height:88px}#dailyBadge{right:12px;top:204px}}
`;document.head.appendChild(css);
const panel=document.createElement('div');panel.id='dailyPanel';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Daily log-in reward');document.body.appendChild(panel);
const badge=document.createElement('button');badge.id='dailyBadge';badge.textContent='DAILY REWARD';badge.onclick=()=>open();document.body.appendChild(badge);
function renderPanel(msg){
 const claimable=canClaim(),idx=claimable?nextIndex():(data.streak-1+7)%7;
 let cells='';
 REWARDS.forEach((r,i)=>{const done=claimable?i<idx:i<=idx,isToday=claimable&&i===idx;
  cells+='<div class="dailyCell '+(done?'done':'')+(isToday?' today':'')+'"><b>DAY '+(i+1)+'</b><strong>'+money(r.cash)+'</strong><span>'+(r.note)+'</span></div>';});
 const head=claimable?(nextIndex()===0&&data.last&&data.last!==yesterday()&&data.streak>0?'Your streak was reset. Start a new 7-day run.':'Claim today\'s reward to keep your streak going.'):'Come back tomorrow to continue your streak.';
 panel.innerHTML='<div class="sbox"><div class="eyebrow">LEVEL 29 · LOG-IN BONUS</div><h2>Daily Reward</h2><p class="cash">WALLET '+money(cash)+'</p><p>'+(msg||head)+' Streak: <b>'+data.streak+'</b> / 7 · Total claimed: '+money(data.total)+'</p><div id="dailyGrid">'+cells+'</div>'
  +(claimable?'<button id="dailyClaim" class="close" data-daily="claim">CLAIM '+money(REWARDS[nextIndex()].cash)+(REWARDS[nextIndex()].armor||REWARDS[nextIndex()].hp?' + BONUS':'')+'</button>':'')
  +'<button class="close" data-daily="close" style="width:100%;margin-top:8px">'+(claimable?'LATER · ESC':'RETURN TO THE CITY · ESC')+'</button></div>';
}
function updateBadge(){badge.style.display=(state==='play'&&canClaim()&&!showMap&&panel.style.display!=='flex')?'block':'none';}
function open(){if(!player||player.dead||!['play','shop'].includes(state))return;if(window.level29Jobs&&document.getElementById('jobsPanel').style.display==='flex')level29Jobs.close();
 if(window.level29Places&&level29Places.panel&&level29Places.panel.style.display!=='none')level29Places.close();
 state='shop';for(const k in keys)keys[k]=false;mouse.down=false;renderPanel();panel.style.display='flex';setTimeout(()=>document.getElementById('dailyClaim')?.focus(),30);}
function close(){panel.style.display='none';if(state==='shop')state='play';for(const k in keys)keys[k]=false;mouse.down=false;}
function claim(){if(!canClaim())return;const i=nextIndex(),r=REWARDS[i];
 data.streak=i+1;data.last=today();data.total+=r.cash;data.claims++;save();
 cash+=r.cash;if(r.hp&&player)player.hp=Math.min(player.maxHp,Math.max(player.hp,r.hp));if(r.armor&&player)player.armor=Math.max(player.armor||0,r.armor);
 sfx('cash');banner={big:'DAILY REWARD',small:'DAY '+(i+1)+' · +'+money(r.cash)+(r.note&&(r.hp||r.armor)?' · '+r.note.toUpperCase():''),t:200,good:true};
 try{window.level29Save?.save('DAILY REWARD SAVED');}catch(_){}
 renderPanel('Reward claimed: '+money(r.cash)+(r.note?' · '+r.note:'')+'.');}
panel.addEventListener('click',e=>{const b=e.target.closest('[data-daily]');if(!b)return;if(b.dataset.daily==='claim')claim();else close();});
addEventListener('keydown',e=>{if(panel.style.display!=='flex')return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}},true);
let shown=false,ready=0;

// Show the reward once per session after the player has actually started playing.
const prevUpdate=update;update=function(){prevUpdate();if(state==='play'&&player&&!player.dead)ready++;else if(state!=='shop')ready=Math.max(0,ready-1);
 if(!shown&&ready>600&&canClaim()&&!window.level29Jobs?.active&&!window.level29Guard?.shift&&!window.level29CityStories?.active){const jp=document.getElementById('jobsPanel');if(jp&&jp.style.display==='flex')return;shown=true;open();}};
const prevRender=render;render=function(){prevRender();updateBadge();if(panel.style.display==='flex'&&state!=='shop')panel.style.display='none';};
window.level29Daily={get data(){return data;},canClaim,open,close,claim,rewards:REWARDS};
})();
