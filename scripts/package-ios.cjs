'use strict';
// Always stage the current repository game, never the stale copy in an old ZIP.
const fs = require('node:fs');
const path = require('node:path');
const { buildSync } = require('esbuild');
const root = path.resolve(__dirname, '..');
const app = path.join(root, 'native/ios-app');
const www = path.join(app, 'www');
fs.rmSync(www, { recursive: true, force: true });
fs.cpSync(path.join(root, 'public/game'), www, { recursive: true });
fs.mkdirSync(path.join(www, 'icons'), { recursive: true });
for (const icon of ['bayou-32.png', 'bayou-apple-180.png']) {
  fs.copyFileSync(path.join(root, 'public/icons', icon), path.join(www, 'icons', icon));
}
const html = fs.readFileSync(path.join(www, 'index.html'), 'utf8')
  .replace(/src="\/game\/ads\.js(\?[^"]*)?"/, 'src="ads.js$1"')
  .replace(/<script> if \(typeof navigator.serviceWorker[^\n]*<\/script>/, '')
  .replace('</body>', '<script src="native-ads.js"></script></body>');
fs.writeFileSync(path.join(www, 'index.html'), html);
buildSync({
  entryPoints: [path.join(app, 'src/entry.js')],
  outfile: path.join(www, 'native-ads.js'),
  bundle: true, platform: 'browser', format: 'iife', target: 'safari15',
});
console.log('Staged the current public/game and native ads bundle for cap sync ios.');
