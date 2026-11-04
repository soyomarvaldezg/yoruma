import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'docs');
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(pathToFileURL(path.join(root,'index.html')).href, { waitUntil: 'load' });
for (const ex of ['bi','streaming','ml']){
  await page.evaluate((id) => {
    nodes = JSON.parse(JSON.stringify(EXAMPLES.find(e => e.id === id).nodes));
    links = JSON.parse(JSON.stringify(EXAMPLES.find(e => e.id === id).links));
    S.selNodes = []; render(); fit();
  }, ex);
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(out, 'example-' + ex + '.png') });
}
await browser.close();
console.log('ok');
