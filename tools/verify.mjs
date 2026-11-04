import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const target = path.resolve(process.argv[2] || path.join(root, 'spike', 'index.html'));
const url = pathToFileURL(target).href + '?test';

const logs = [];
const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', m => logs.push(m.text()));
page.on('pageerror', e => logs.push('PAGEERROR ' + e.message));
await page.goto(url, { waitUntil: 'load' });
await page.waitForFunction(() => /failed$/.test(document.title), null, { timeout: 30000 });
const panel = await page.$eval('#help', el => el.innerText);
await browser.close();

console.log(panel.trim());
const summary = /(\d+) failed of (\d+)/.exec(panel);
if (!summary){
  console.error('no summary in the test panel');
  process.exit(2);
}
const failed = Number(summary[1]);
const total = Number(summary[2]);
const errors = logs.filter(l => /^PAGEERROR|^FAIL /.test(l));
if (errors.length) console.error(errors.join('\n'));
if (failed > 0 || errors.length){
  console.error('FAILED ' + failed + ' of ' + total);
  process.exit(1);
}
console.log('OK ' + total + '/' + total);
