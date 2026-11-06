'use strict';
// Standalone GLB copies for editors. Runtime shares base GLBs and material clones instead.
const fs=require('node:fs'),path=require('node:path'),THREE=require('three');
const {schemes}=require('../../public/game/imported-assets.js');
function convert(buffer,scheme,id){
 if(buffer.readUInt32LE(0)!==0x46546c67||buffer.readUInt32LE(4)!==2)throw Error('Expected GLB 2');
 const n=buffer.readUInt32LE(12),g=JSON.parse(buffer.subarray(20,20+n).toString());
 const tint=new THREE.Color(scheme.tint);
 for(const m of g.materials||[]){if(m.alphaMode==='BLEND'||/glass|window|tire|wheel|lamp|light/i.test(m.name||''))continue;
 const p=m.pbrMetallicRoughness??={};const c=p.baseColorFactor||[1,1,1,1];
 p.baseColorFactor=[c[0]*tint.r,c[1]*tint.g,c[2]*tint.b,c[3]];
 if(scheme.roughness!==undefined)p.roughnessFactor=scheme.roughness;
 }
 g.extras={...g.extras,appearanceVariant:scheme.name,sourceModel:id,appearanceOnly:true};
 const raw=Buffer.from(JSON.stringify(g)),json=Buffer.alloc(Math.ceil(raw.length/4)*4,32);raw.copy(json);
 const tail=buffer.subarray(20+n),header=Buffer.alloc(20);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(20+json.length+tail.length,8);header.writeUInt32LE(json.length,12);header.writeUInt32LE(0x4e4f534a,16);
 return Buffer.concat([header,json,tail]);
}
function exportVariants(out,ids=['pickup','box-truck','wreck','apartment','abandoned','warehouse','modern-house','wooden-house','upload-2cd','upload-bf86']){
 fs.mkdirSync(out,{recursive:true});const manifest=[];
 for(const id of ids){const input=fs.readFileSync(path.join(__dirname,'../../public/game/models/optimized',id+'.glb'));
 for(const scheme of schemes(id)){const name=id+'--'+scheme.name+'.glb',bytes=convert(input,scheme,id);fs.writeFileSync(path.join(out,name),bytes);manifest.push({id,variant:scheme.name,file:name,bytes:bytes.length});}}
 fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 fs.writeFileSync(path.join(out,'README.txt'),'GLB appearance variants. Original embedded maps and geometry are retained. Finishes are color multipliers, not new textures or vehicle mechanics. Geometry scale/up-axis remains that of each source GLB. Runtime uses the shared base files plus material profiles instead of downloading all copies. These copies are for external editors.\n');return manifest;
}
if(require.main===module){if(!process.argv[2])throw Error('Usage: node scripts/assets/export-appearance-variants.cjs OUTPUT_DIRECTORY');console.log('Exported '+exportVariants(path.resolve(process.argv[2])).length+' GLBs');}
module.exports={convert,exportVariants};
