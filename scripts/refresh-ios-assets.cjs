'use strict';
// Refresh the existing downloadable Xcode project without replacing its native scaffold.
// package-ios.cjs stages current game + consent-aware bridge first. No signing/ads changes.
const {execFileSync}=require('node:child_process');
execFileSync(process.execPath,['scripts/package-ios.cjs'],{stdio:'inherit'});
execFileSync('python3',['-c',`
from pathlib import Path
import zipfile, json, os
root=Path.cwd();app=root/'native/ios-app';out=root/'public/downloads/blood-in-the-bayou-ios.zip';tmp=out.with_suffix('.tmp')
with zipfile.ZipFile(out) as source:
    config=json.loads(source.read('capacitor.config.json'))
    if config['appId']!=json.loads((app/'capacitor.config.json').read_text())['appId']:raise RuntimeError('Refusing to rewrite archive for different native app')
    names=source.namelist()
    if not any(n.endswith('.xcodeproj/project.pbxproj') for n in names):raise RuntimeError('Existing archive has no Xcode project')
    with zipfile.ZipFile(tmp,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as target:
        def put(name,data):
            info=zipfile.ZipInfo(name,(2026,10,31,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;target.writestr(info,data)
        for name in sorted(names):
            if name.startswith('www/') or name.startswith('ios/App/App/public/'):continue
            put(name,source.read(name))
        for file in sorted((app/'www').rglob('*')):
            if file.is_file():put('www/'+file.relative_to(app/'www').as_posix(),file.read_bytes())
with zipfile.ZipFile(tmp) as verify:
    for file in (root/'public/game/models').rglob('*.glb'):
        if verify.read('www/'+file.relative_to(root/'public/game').as_posix())!=file.read_bytes():raise RuntimeError('Archived model differs from source')
os.replace(tmp,out);print('Refreshed iOS game assets; retained native Xcode scaffold. Not compiled/signed.')
`],{stdio:'inherit'});
