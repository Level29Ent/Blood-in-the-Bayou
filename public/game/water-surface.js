'use strict';
(function(){
// Bounded bathymetry derived once from shoreline distance. The game has no seabed
// mesh/depth buffer: this is an authored shallow-to-deep approximation, not SSR.
function bathymetry(T,c,tile=32,waterId=4){
 const w=c.width||1,h=c.height||1,n=w*h,steps=new Uint16Array(n),queue=new Uint32Array(n);steps.fill(65535);let read=0,write=0;
 const wet=k=>c.g?c.g[k]===waterId:c.get?c.get(k%w,Math.floor(k/w))===waterId:true;
 for(let k=0;k<n;k++)if(!wet(k)){steps[k]=0;queue[write++]=k;}
 while(read<write){const k=queue[read++],x=k%w,y=Math.floor(k/w);for(const j of [x?k-1:-1,x<w-1?k+1:-1,y?k-w:-1,y<h-1?k+w:-1])if(j>=0&&steps[j]===65535){steps[j]=steps[k]+1;queue[write++]=j;}}
 const data=new Uint8Array(n*4);for(let k=0;k<n;k++){const depth=Math.min(24,steps[k]*tile*.22),v=Math.round(depth/24*255);data.set([v,v,v,255],k*4);}
 const map=new T.DataTexture(data,w,h);map.minFilter=map.magFilter=T.LinearFilter;map.generateMipmaps=false;map.needsUpdate=true;
 return {map,size:new T.Vector2(w*tile,h*tile)};
}
function patch(shader,T,u){
 Object.assign(shader.uniforms,u);
 shader.fragmentShader='uniform sampler2D bayouDepth;uniform vec2 bayouExtent;\n'+shader.fragmentShader;
 // r149 uses vUv here (not the vNormalMapUv introduced by later revisions).
 shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',T.ShaderChunk.normal_fragment_maps.replace(/\bvUv\b/g,'(bayouWorld.xz*.035+vec2(bayouTime*.012,-bayouTime*.008))'));
 shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float waterDepth=texture2D(bayouDepth,clamp(bayouWorld.xz/bayouExtent,0.,1.)).r*24.;
 float murk=1.-exp(-waterDepth*.16);
 diffuseColor.rgb=mix(vec3(.15,.21,.12),vec3(.025,.065,.048),murk);
 float shore=1.-smoothstep(1.,7.,waterDepth);
 float wash=smoothstep(.35,.85,sin(bayouWorld.x*.19+bayouWorld.z*.14-bayouTime*1.4)*.5+.5);
 diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.34,.38,.25),shore*wash*.28);`);
 shader.fragmentShader=shader.fragmentShader.replace('#include <output_fragment>',`// Fresnel sky reflection also works without the optional planar render target.
 float waterFresnel=.02+.98*pow(1.-clamp(dot(normal,normalize(vViewPosition)),0.,1.),5.);
 outgoingLight=mix(outgoingLight,vec3(.22,.27,.21),waterFresnel*.32);
 #include <output_fragment>`);
 return shader;
}
const api={bathymetry,patch};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29WaterSurface=api;
})();
