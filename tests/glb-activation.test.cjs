const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),THREE=require('three');const {modelURL,install}=require('../public/game/ronnie-reference-model.js');
test('character GLB resolves within website game folder and native Capacitor bundle root',()=>{assert.equal(modelURL('https://example.test/game/index.html?v=1'),'https://example.test/game/models/characters/ronniebaby.glb');assert.equal(modelURL('capacitor://localhost/index.html'),'capacitor://localhost/models/characters/ronniebaby.glb');assert.equal(modelURL('https://localhost/index.html'),'https://localhost/models/characters/ronniebaby.glb');});
test('applying GLB keeps mission ring and identity label separate from hidden old visuals',()=>{const g=new THREE.Group(),body=new THREE.Group(),ring=new THREE.Group(),nameplate=new THREE.Group();g.add(body,ring,nameplate);g.userData={body,ring,nameplate};assert.equal(install(THREE,g,new THREE.Group()),true);assert.equal(body.visible,false);assert.equal(ring.visible,true);assert.equal(nameplate.visible,true);assert.equal(g.userData.body,body);});
test('all repository models have valid GLB containers and only embedded dependencies',()=>{const files=['characters/ronniebaby','watercraft/bowrider','watercraft/cruiser','watercraft/pontoon','watercraft/skiff','watercraft/steamboat'];for(const file of files){const b=fs.readFileSync('public/game/models/'+file+'.glb');assert.equal(b.readUInt32LE(0),0x46546c67);assert.equal(b.readUInt32LE(8),b.length);const g=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString());assert.ok(g.meshes.length);assert.ok(g.buffers.every(b=>!b.uri));assert.ok((g.images||[]).every(i=>i.bufferView!==undefined));}});
test('downloadable iOS archive contains all six source-identical GLBs, loader hooks and native project',()=>{const {execFileSync}=require('node:child_process');execFileSync('python3',['-c',`from pathlib import Path
import zipfile
with zipfile.ZipFile('public/downloads/blood-in-the-bayou-ios.zip') as z:
 for p in Path('public/game/models').rglob('*.glb'):
  assert z.read('www/'+p.relative_to('public/game').as_posix())==p.read_bytes()
 for n in ['ronnie-reference-model.js','watercraft-assets.js','vendor/gltf-loader-r149.js']:
  assert z.read('www/'+n)==Path('public/game',n).read_bytes()
 assert any(n.endswith('.xcodeproj/project.pbxproj') for n in z.namelist())
 assert b'src="ads.js?v=' in z.read('www/index.html')
`]);});
