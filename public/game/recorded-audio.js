'use strict';
(function(){
// Buffer playback shares the game AudioContext already unlocked by a user gesture.
// Chained clips do not depend on a new HTMLMediaElement autoplay grant.
function createFactory(options){const buffers=new Map();
 function load(url){if(!buffers.has(url)){const p=options.fetch(url).then(r=>{if(!r.ok)throw Error('Audio load failed: '+r.status);return r.arrayBuffer();}).then(data=>new Promise((resolve,reject)=>options.context().decodeAudioData(data,resolve,reject)));buffers.set(url,p);p.catch(()=>{if(buffers.get(url)===p)buffers.delete(url);});}return buffers.get(url);}
 function prepare(urls){options.unlock();if(!options.context())return;for(const url of urls)load(url).catch(()=>{});}
 function audio(){const events=new Map();let source=null,gain=null,cancelled=false;
  const emit=type=>{for(const fn of events.get(type)||[])fn();};
  const a={src:'',volume:1,duration:NaN,addEventListener(type,fn){if(!events.has(type))events.set(type,[]);events.get(type).push(fn);},pause(){cancelled=true;if(source){source.onended=null;try{source.stop();}catch(_){}source.disconnect();source=null;}gain?.disconnect();gain=null;},async play(){options.unlock();const ctx=options.context();if(!ctx)throw Error('Audio unavailable');const resumed=ctx.resume();await resumed;if(cancelled)return;
   const buffer=await load(a.src);if(cancelled)return;if(ctx.state!=='running')throw Error('Audio needs a user gesture');a.duration=buffer.duration;source=ctx.createBufferSource();gain=ctx.createGain();source.buffer=buffer;gain.gain.value=a.volume;source.connect(gain);gain.connect(options.destination());source.onended=()=>{if(cancelled)return;source?.disconnect();gain?.disconnect();source=gain=null;emit('ended');};source.start();emit('playing');
  }};return a;
 }
 return {audio,prepare};
}
if(typeof module!=='undefined')module.exports={createFactory};if(typeof window!=='undefined')window.level29RecordedAudio={createFactory};
})();
