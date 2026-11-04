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
await page.waitForTimeout(300);

await page.evaluate(() => {
  const ex = EXAMPLES.find(e => e.id === 'bi');
  nodes = JSON.parse(JSON.stringify(ex.nodes));
  links = JSON.parse(JSON.stringify(ex.links));
  S.selNodes = []; render(); fit();
});
await page.waitForTimeout(250);
await page.screenshot({ path: path.join(out, 'editor.png') });

await page.evaluate(() => {
  nodes = [
    { id:'z_vpc', kind:'zone', title:'VPC · prod', color:'#4263EB', tcolor:null,
      scolor:null, fs:1, x:0, y:0, w:760, h:560, band:true, solid:true },
    { id:'z_region', kind:'zone', title:'eu-west-1', color:'#F76707', tcolor:null,
      scolor:null, fs:1, x:40, y:80, w:680, h:440, band:true },
    { id:'z_subnet', kind:'zone', title:'private subnet', color:'#099268', tcolor:null,
      scolor:null, fs:1, x:80, y:170, w:600, h:300, band:true },
    { id:'n_api', kind:'api', title:'Ingest API', sub:'ECS · Fargate', color:'#099268',
      tcolor:null, scolor:null, fs:1, x:120, y:240, w:200, h:120 },
    { id:'n_db', kind:'store', title:'Warehouse', sub:'RDS · Postgres', color:'#4263EB',
      tcolor:null, scolor:null, fs:1, x:420, y:240, w:220, h:120 },
    { id:'n_dash', kind:'box', title:'Dashboards', sub:'Looker', color:'#F76707',
      tcolor:null, scolor:null, fs:1, x:860, y:240, w:200, h:110 }
  ];
  links = [
    { id:'lk1', from:'n_api', to:'n_db', label:'write', color:'#099268', motion:null, way:null },
    { id:'lk2', from:'n_db', to:'n_dash', label:'query', color:'#4263EB', motion:null, way:null }
  ];
  S.selNodes = []; render(); fit();
});
await page.waitForTimeout(250);
await page.screenshot({ path: path.join(out, 'zones.png') });

await page.evaluate(() => {
  const ex = EXAMPLES.find(e => e.id === 'bi');
  nodes = JSON.parse(JSON.stringify(ex.nodes));
  links = JSON.parse(JSON.stringify(ex.links));
  S.selNodes = []; setPresent(true);
});
await page.waitForTimeout(900);
await page.screenshot({ path: path.join(out, 'present.png') });
await browser.close();
console.log('shots written');
