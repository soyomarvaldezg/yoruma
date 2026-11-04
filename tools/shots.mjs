import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'docs');
fs.mkdirSync(out, { recursive: true });
const url = pathToFileURL(path.join(root, 'index.html')).href;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(400);
await page.evaluate(() => { fit(); });
await page.screenshot({ path: path.join(out, 'editor.png') });

await page.evaluate(() => {
  nodes.push({ id:'zsrc', kind:'zone', title:'Sources', color:'#4263EB', tcolor:null,
    scolor:null, fs:1, x:0, y:180, w:300, h:420, band:true, solid:true });
  nodes.push({ id:'zwh', kind:'zone', title:'Warehouse', color:'#F76707', tcolor:null,
    scolor:null, fs:1, x:530, y:60, w:330, h:400, band:true, solid:true });
  S.selNodes = []; render(); fit();
});
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(out, 'zones.png') });

await page.evaluate(() => {
  nodes = nodes.filter(n => !n.id.startsWith('z'));
  S.selNodes = []; setPresent(true);
});
await page.waitForTimeout(900);
await page.screenshot({ path: path.join(out, 'present.png') });
await browser.close();
console.log('shots written');
