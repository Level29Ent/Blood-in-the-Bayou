'use strict';
(function(){
const CHARACTERS={Anthony:'characters/Anthony.glb',Drako:'characters/Drako.glb',Ronniebaby:'characters/Ronniebaby.glb'};
class PbrAssetLoader{
 constructor(options={}){this.options=options;this.gltfLoader=null;this.dracoLoader=null;this.ktx2Loader=null;this.renderer=null;this.disposed=false;}
 init(renderer){if(this.disposed)throw Error('Character loader is disposed');if(!renderer)throw Error('Character loader requires an initialized WebGL renderer');if(this.gltfLoader){if(this.renderer!==renderer)throw Error('Dispose the character loader before changing renderer');return this;}
  const T=this.options.THREE||globalThis.THREE,D=this.options.dependencies||globalThis.BayouCharacterAssets;if(!T||!D?.GLTFLoader||!D.DRACOLoader)throw Error('Load the matching Three r149 character loaders first');
  const base=this.options.baseURL||(typeof document!=='undefined'?document.baseURI:'https://local.test/game/'),manager=this.options.manager||T.DefaultLoadingManager;
  this.dracoLoader=new D.DRACOLoader(manager).setDecoderPath(new URL('vendor/draco/',base).href).setWorkerLimit(1);
  this.gltfLoader=new D.GLTFLoader(manager).setDRACOLoader(this.dracoLoader);
  if(D.MeshoptDecoder)this.gltfLoader.setMeshoptDecoder(D.MeshoptDecoder);
  // KTX2 must detect the actual renderer, not claim readiness at script parse time.
  const K=this.options.KTX2Loader||globalThis.BayouCompressed?.KTX2Loader;
  if(K){this.ktx2Loader=new K(manager).setTranscoderPath(new URL('vendor/basis/',base).href).setWorkerLimit(1).detectSupport(renderer);this.gltfLoader.setKTX2Loader(this.ktx2Loader);}
  this.baseURL=base;this.renderer=renderer;return this;
 }
 load(url){if(!this.gltfLoader||this.disposed)return Promise.reject(Error('Call init(renderer) before loading character models'));let u;try{u=new URL(url,this.baseURL);const base=new URL(this.baseURL);if(u.origin!==base.origin||u.username||u.password||!u.pathname.toLowerCase().endsWith('.glb'))throw Error('Character assets must be same-origin GLB files');}catch(e){return Promise.reject(e);}return this.gltfLoader.loadAsync(u.href);}
 loadCharacter(name){const file=CHARACTERS[name];return file?this.load(file):Promise.reject(Error('Unknown character: '+name));}
 capabilities(){return {initialized:!!this.gltfLoader&&!this.disposed,dracoReady:!!this.dracoLoader&&!this.disposed,ktx2Ready:!!this.ktx2Loader&&!this.disposed,meshoptReady:!!this.gltfLoader&&!this.disposed&&!!(this.options.dependencies||globalThis.BayouCharacterAssets)?.MeshoptDecoder};}
 dispose(){if(this.disposed)return;this.dracoLoader?.dispose();this.ktx2Loader?.dispose();this.gltfLoader=null;this.renderer=null;this.disposed=true;}
}
const api={PbrAssetLoader,CHARACTERS};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined'){window.level29PbrAssetLoader=api;window.level29PbrAssets=new PbrAssetLoader();}
})();
