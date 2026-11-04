'use strict';
const { execFileSync } = require('node:child_process');
const path = require('node:path');
// Run after ios:sync. Exclude dependencies/signing/user files; install+sync on Mac
// regenerates the SPM paths for that machine before opening Xcode.
execFileSync('python3', ['-c', `
import json, zipfile
from pathlib import Path
root=Path.cwd()
app=root/'native/ios-app'
out=root/'public/downloads/blood-in-the-bayou-ios.zip'
files=[]
for folder in ['ios','www','src']:
    for p in (app/folder).rglob('*'):
        n=p.relative_to(app).as_posix()
        if n.startswith('ios/App/App/public/'): continue
        if not p.is_file() or any(x in p.parts for x in ['node_modules','.build','symlinks','xcuserdata','Pods','DerivedData','build']): continue
        if p.name in ['.DS_Store','.gitignore'] or p.suffix in ['.p12','.mobileprovision','.xcuserstate']: continue
        files.append((n,p.read_bytes()))
manifest=json.loads((app/'package.json').read_text())
manifest['scripts']={'sync':'cap sync ios'}
files.extend([
 ('package.json',(json.dumps(manifest,indent=2)+'\\n').encode()),
 ('capacitor.config.json',(app/'capacitor.config.json').read_bytes()),
 ('README.txt',b'''Blood in the Bayou - iPhone ads integration

This ZIP includes the current repository game, not the former stale web copy.
It is not an App Store-ready release. Check src/config.json: test ads do not
generate revenue, and testMode is enabled by default.

On a Mac with Node, npm, and Xcode:
1. Unzip to a new folder; do not overwrite an older signed project.
2. Run npm install, then npm run sync in that folder. This is REQUIRED before
   opening Xcode; it installs AdMob and regenerates local Swift package paths.
3. Open ios/App/App.xcodeproj and choose your own Apple signing team.
4. Build on an iPhone and test consent/privacy, mission transitions, no fill,
   dismissal, failure, audio restoration and multiplayer (no ads).
5. Configure AdMob Privacy & messaging and confirm app readiness and policies.

Maintained source and release instructions are in the GitHub repository under
native/ios-app. Do not change only this generated ZIP: update source, set
src/config.json testMode=false ONLY AFTER device/policy verification, and run
pnpm ios:archive from the repository root. A new signed App Store build is still
required. The web site still needs separate AdSense and H5 Games Ads approval.
''')])
with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for name,data in sorted(files):
        info=zipfile.ZipInfo(name,(2026,10,31,0,0,0))
        info.compress_type=zipfile.ZIP_DEFLATED
        z.writestr(info,data)
print(f'Created iOS source download ({out.stat().st_size} bytes).')
`], { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
