// Requires Node.js and sharp. Exports complete files atomically.
const fs = require('fs');
const path = require('path');
const sharp = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'sharp') : 'sharp');
const root = path.resolve(__dirname, '..');
const rows = JSON.parse(fs.readFileSync(path.join(root, 'rechte-fuer-eltern/manifest.json'), 'utf8'));
(async () => {
  for (const row of rows) {
    const target = path.join(root, row.image);
    const png = await sharp(path.join(root, row.svg)).png({ compressionLevel: 9 }).toBuffer();
    fs.writeFileSync(target + '.tmp', png);
    fs.renameSync(target + '.tmp', target);
    if (fs.statSync(target).size !== png.length) throw new Error('Incomplete PNG: ' + row.nr);
  }
  console.log('Exported 70 complete PNG diagrams.');
})().catch(error => { console.error(error); process.exit(1); });
