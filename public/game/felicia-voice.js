'use strict';
(function(){
const LINES={
 greet:{file:'felicia_greet.mp3',text:'Sweet enough for you. Cold enough for the undead. Welcome in, baby!'},
 pitch:{file:'felicia_pitch.mp3',text:'These are my packed-ice specials. Six snowballs for one-eighty. Throw them at the zombies, not my trailer!'},
 buy:{file:'felicia_buy.mp3',text:'Six snowballs, coming right up. Keep your aim steady and make those zombies chill out.'},
 poor:{file:'felicia_poor.mp3',text:'Baby, I still have to pay for the ice. Come back when you have one-eighty.'},
 equip:{file:'felicia_equip.mp3',text:'Pick your snowball from the weapon wheel. Aim, then throw. The big ones might need a second helping.'},
 empty:{file:'felicia_empty.mp3',text:'Out of ice? Come see Felicia. I will get you packed up again.'},
 bye:{file:'felicia_bye.mp3',text:'Stay sweet out there, and keep that cold shoulder ready.'}
};
// Independent playback handles guard stale events while sharing one unlocked game AudioContext.
function create(options){let current=null,pending=[],generation=0;
 function stop(){generation++;pending=[];if(current){current.pause();current=null;}options.clear?.();}
 function next(){if(!pending.length||!options.allowed()){stop();return false;}const key=pending.shift(),line=LINES[key];if(!line){stop();return false;}const mine=generation,a=options.audio();current=a;a.preload='auto';a.src=options.url?options.url(line.file):'business-vo/'+line.file;a.volume=.85;
 const valid=()=>mine===generation&&current===a;
 a.addEventListener('playing',()=>{if(!valid())return;if(!options.allowed())return stop();options.caption(key,line.text,Number.isFinite(a.duration)?a.duration:8);});
 a.addEventListener('ended',()=>{if(!valid())return;current=null;options.clear?.();if(pending.length)next();});
 const failed=()=>{if(!valid())return;stop();options.fallback?.(key,line.text);};a.addEventListener('error',failed);
 try{const p=a.play();if(p?.catch)p.catch(failed);}catch(_){failed();}return true;
 }
 function play(...keys){stop();if(!options.allowed()||!keys.length)return false;options.beforePlay?.();pending=keys.slice();return next();}
 return {play,stop,check(){if(current&&!options.allowed())stop();},get speaking(){return !!current;},get src(){return current?.src||null;}};
}
if(typeof module!=='undefined')module.exports={LINES,create};if(typeof window==='undefined')return;
const caption=document.createElement('div');caption.id='feliciaVoiceCaption';caption.setAttribute('role','status');caption.style.cssText='display:none;position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:79;width:min(650px,calc(100% - 32px));box-sizing:border-box;padding:10px 14px;background:#101a24f2;color:#f2e5ef;border-left:3px solid #dab6d3;font:13px/1.5 monospace;pointer-events:none';document.body.appendChild(caption);
const url=file=>'business-vo/'+file+'?v=2';
const recorded=level29RecordedAudio.createFactory({unlock:ensureAudio,context:()=>actx,destination:()=>sfxBus,fetch:resource=>fetch(resource)});
let primed=false;function prime(){if(primed||soundMode===2)return;primed=true;recorded.prepare(Object.values(LINES).map(l=>url(l.file)));}
for(const event of ['pointerdown','touchend','keydown'])addEventListener(event,prime,{capture:true});
const playback=create({audio:recorded.audio,url,beforePlay:()=>{rbStopVoice();prime();},allowed:()=>!!player&&!player.dead&&soundMode!==2&&['play','shop'].includes(state)&&!document.hidden&&!window.level29CityStories?.cutscene,
 clear:()=>{caption.style.display='none';if(typeof subtitle!=='undefined'&&subtitle?.name==='FELICIA')subtitle=null;},caption:(key,text,duration)=>{caption.textContent='FELICIA · '+text;caption.style.display='block';subtitle={name:'FELICIA',txt:text,t:Math.ceil(duration*60),col:'#e3b6d3'};},fallback:(key,text)=>{caption.style.display='none';subtitle={name:'FELICIA',txt:text,t:300,col:'#e3b6d3'};}});
const mode=setSoundMode;setSoundMode=function(){mode.apply(this,arguments);playback.check();};
const rbLine=rbSay;rbSay=function(){if(playback.speaking&&state!=='talk')return false;if(state==='talk')playback.stop();return rbLine.apply(this,arguments);};
const updateBase=update;update=function(){updateBase.apply(this,arguments);playback.check();};
for(const event of ['blur','pagehide'])addEventListener(event,()=>playback.stop());document.addEventListener('visibilitychange',()=>{if(document.hidden)playback.stop();});
window.level29FeliciaVoice=playback;
})();
