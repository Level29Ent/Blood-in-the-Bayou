'use strict';
(function(){
function createDialogue(audio,options){let token=0,queue=[],timer=null,delayed=null,current=null;
 const cancel=()=>{token++;queue=[];current=null;clearTimeout(timer);clearTimeout(delayed);timer=delayed=null;audio.pause();audio.speaking=false;};
 const play=(key,...more)=>{cancel();if(!options.allowed())return false;const mine=token;queue=more;current=key;audio.src='rbvo/'+key+'.mp3';audio.muted=false;audio.volume=1;audio.speaking=true;
  try{const p=audio.play();if(p?.catch)p.catch(()=>{if(token===mine){audio.speaking=false;current=null;queue=[];}});}catch(_){audio.speaking=false;current=null;queue=[];}return true;};
 audio.addEventListener('playing',()=>{if(current&&options.allowed())options.caption(current);});
 audio.addEventListener('ended',()=>{audio.speaking=false;const mine=token,next=queue.slice();current=null;queue=[];if(next.length)timer=setTimeout(()=>{if(mine===token&&options.allowed())play(...next);},80);});
 audio.addEventListener('error',()=>{audio.speaking=false;current=null;queue=[];});
 const schedule=(key,delay,valid)=>{cancel();const mine=token;delayed=setTimeout(()=>{if(mine===token&&options.allowed()&&valid())play(key);},delay);};
 return {play,cancel,schedule,get speaking(){return !!audio.speaking;}};
}
if(typeof module!=='undefined')module.exports={createDialogue};if(typeof window!=='undefined')window.level29Dialogue={createDialogue};
})();
