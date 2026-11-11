const { buildSync } = require("esbuild");
buildSync({
  nodePaths: (process.env.NODE_PATH || "")
    .split(require("node:path").delimiter)
    .filter(Boolean),
  entryPoints: ["lib/community-client.js"],
  bundle: true,
  platform: "browser",
  format: "iife",
  target: "safari15",
  outfile: "public/game/vendor/community-client.js",
  minify: true,
  legalComments: "eof",
});
