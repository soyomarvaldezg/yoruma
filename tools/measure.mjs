import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const url = pathToFileURL(path.join(root, 'index.html')).href;
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(url, { waitUntil: 'load' });
const out = await page.evaluate(() => {
  const mk = (count) => {
    nodes = [];
    links = [];
    for (let i = 0; i < count; i++){
      nodes.push({ id:'s'+i, kind:'box', title:'Node ' + i, sub:'sub', color:null,
        tcolor:null, scolor:null, fs:1, x:(i%20)*220, y:Math.floor(i/20)*140, w:180, h:90 });
      if (i) links.push({ id:'l'+i, from:'s'+(i-1), to:'s'+i, color:null, motion:'off', label:'', way:null });
    }
  };
  const measure = (count) => {
    mk(count);
    render();
    const times = [];
    for (let i = 0; i < 20; i++){
      const t = performance.now();
      render();
      times.push(performance.now() - t);
    }
    times.sort((a,b) => a-b);
    return times[Math.floor(times.length/2)];
  };
  return { n50: measure(50), n100: measure(100), n200: measure(200), n400: measure(400) };
});
console.log(out);
await browser.close();
