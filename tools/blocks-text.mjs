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

let blockCount = 0;
for (const [, sections] of CATALOG)
  for (const [, items] of sections) blockCount += items.length;

const lines = [
  '# The Blocks palette itself, written as yoruma text: one zone per plane, one card per',
  '# distinct chip. A comment names the subtitle each chip sits under in the sidebar.',
  '# A chip that repeats under two subtitles is listed once, because the text format',
  '# keys shapes by name.',
  'dir: right',
  'theme: data',
  'title: The Blocks palette',
  'subtitle: every distinct catalog chip as a card, ' + CATALOG.length + ' planes, ' +
    blockCount + ' chips',
  ''
];
const seen = new Set();
let cards = 0, repeats = 0;
for (const [plane, sections] of CATALOG){
  lines.push('zone ' + plane + ':');
  for (const [sub, items] of sections){
    if (sub) lines.push('  # ' + sub);
    for (const label of items){
      if (seen.has(label)){
        lines.push('  # ' + label + ' repeats under ' + sub + ' in the palette');
        repeats++;
        continue;
      }
      seen.add(label);
      cards++;
      const w = Math.round(label.length * 9.4) + 26;
      if (w > 208) lines.push('  card ' + label + ':', '    w: ' + w);
      else lines.push('  card ' + label);
    }
  }
  lines.push('');
}
writeFileSync(path.join(root, 'docs/example-blocks.yaml'), lines.join('\n'));
console.log('wrote docs/example-blocks.yaml:', CATALOG.length, 'planes,',
  cards, 'cards,', repeats, 'repeats of', blockCount, 'chips');
