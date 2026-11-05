'use strict';
(function(){
function imageBudget(w,h,quality){const max=quality==='high'?1024:quality==='medium'?768:512,s=Math.min(1,max/Math.max(w,h));return {width:Math.max(1,Math.floor(w*s)),height:Math.max(1,Math.floor(h*s)),changed:s<1};}
if(typeof module!=='undefined')module.exports={imageBudget};if(typeof window==='undefined')return;
let textures=null,rendererSeen=null;
function getManager(){if(typeof renderer==='undefined'||!renderer||!window.BayouCompressed?.KTX2Loader||!window.level29TextureManager)return null;if(textures&&!textures.disposed&&rendererSeen===renderer)return textures;textures?.dispose();rendererSeen=renderer;textures=new level29TextureManager.TextureManager(renderer,THREE.DefaultLoadingManager);return textures;}
function ktx(){return getManager()?.ktx2Loader||null;}
const init=initGL;initGL=function(){const result=init.apply(this,arguments);getManager();return result;};
const load=THREE.TextureLoader.prototype.load;THREE.TextureLoader.prototype.load=function(url,onLoad,onProgress,onError){return load.call(this,url,texture=>{const image=texture.image,w=image?.naturalWidth||image?.width,h=image?.naturalHeight||image?.height,q=window.level29Graphics?.quality||'low';if(w&&h&&!/normal|rough|metal|font|logo|sign/i.test(String(url))){const b=imageBudget(w,h,q);if(b.changed){const canvas=document.createElement('canvas');canvas.width=b.width;canvas.height=b.height;canvas.getContext('2d').drawImage(image,0,0,b.width,b.height);texture.dispose();texture.image=canvas;texture.needsUpdate=true;}texture.anisotropy=1;if(q==='low'){texture.generateMipmaps=false;texture.minFilter=THREE.LinearFilter;}else{texture.generateMipmaps=true;texture.minFilter=THREE.LinearMipmapLinearFilter;}}onLoad?.(texture);},onProgress,onError);};
function loadCompressed(url,options={}){const manager=getManager();return manager?manager.acquire(url,options):Promise.reject(Error('KTX2 requires initialized WebGL renderer'));}
function releaseCompressed(url,options={}){return textures?.release(url,options)||false;}
// A persisted page may return from the back-forward cache. Recreate lazily on pageshow.
addEventListener('pagehide',()=>{textures?.dispose();textures=null;rendererSeen=null;});
window.level29TextureBudget={imageBudget,ktx,getManager,loadCompressed,releaseCompressed,loadKTX2Texture(url,onLoad,onProgress,onError,options={}){const manager=getManager();if(manager)return manager.loadKTX2Texture(url,onLoad,onProgress,onError,options);const error=Error('KTX2 requires initialized WebGL renderer');onError?.(error);const p=Promise.reject(error);if(onError)p.catch(()=>{});return p;}};
})();
