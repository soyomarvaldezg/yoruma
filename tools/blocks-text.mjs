// Dev-only: emit the Blocks catalog as a yoruma text file, proving every palette chip is
// expressible in the text format. Writes docs/example-blocks.yaml.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const core = readFileSync(path.join(root, 'js/00-core.js'), 'utf8');
const start = core.indexOf('const CATALOG = [');
const end = core.indexOf('\n];', start);
if (start < 0 || end < 0) throw new Error('cannot find CATALOG in js/00-core.js');
const CATALOG = eval(core.slice(start + 'const CATALOG = '.length, end + 2));

const lines = [
  '# The Blocks palette itself, written as yoruma text — one zone per plane, one card per',
  '# chip. Every palette entry is a named card, so the text format can express all of it.',
  'dir: right',
  'theme: data',
  'title: The Blocks palette',
  'subtitle: every catalog chip as a card — 10 planes, ' +
    CATALOG.reduce((n, [, items]) => n + items.length, 0) + ' blocks',
  ''
];
for (const [plane, items] of CATALOG){
  lines.push('zone ' + plane + ':');
  for (const label of items){
    const w = Math.round(label.length * 9.4) + 26;
    if (w > 208) lines.push('  card ' + label + ':', '    w: ' + w);
    else lines.push('  card ' + label);
  }
  lines.push('');
}
writeFileSync(path.join(root, 'docs/example-blocks.yaml'), lines.join('\n'));
console.log('wrote docs/example-blocks.yaml:', CATALOG.length, 'planes,',
  CATALOG.reduce((n, [, items]) => n + items.length, 0), 'blocks');
