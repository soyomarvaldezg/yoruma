import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const root = path.resolve(import.meta.dirname, '..');
const src = path.join(root, 'docs', 'pipeline-from-d2.yaml');
const out = path.join(root, 'docs', 'pipeline-from-d2.png');
const url = pathToFileURL(path.join(root, 'index.html')).href;
const text = fs.readFileSync(src, 'utf8');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
page.on('dialog', d => d.accept());
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(300);

const report = await page.evaluate(async src => {
  openTextDoc(src, 'pipeline-from-d2.yaml');
  await new Promise(r => setTimeout(r, 300));
  return { lint: lintIssues().map(i => i.id + ' ' + i.type + ' ' + i.msg),
           nodes: nodes.length, links: links.length };
}, text);
console.log(JSON.stringify(report, null, 1));

await page.evaluate(() => fit());
await page.waitForTimeout(250);
await page.screenshot({ path: out });
await browser.close();
console.log('shot written');
