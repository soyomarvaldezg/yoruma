// Which ELK config, if any, reaches hand-rolled crossing counts on the pipeline.
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { readFileSync } from 'node:fs';

const root = path.resolve(import.meta.dirname, '..');
const elkPath = path.resolve(import.meta.dirname, 'node_modules/elkjs/lib/elk.bundled.js');
const pipeline = readFileSync(path.join(root, 'docs/pipeline-from-d2.yaml'), 'utf8');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(path.join(root, 'index.html')).href, { waitUntil: 'load' });
await page.addScriptTag({ path: elkPath });

const out = await page.evaluate(async (pipeline) => {
  function segInt(p1, p2, p3, p4){
    const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
    if (Math.abs(d) < 1e-9) return false;
    const t = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / d;
    const u = ((p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)) / d;
    return t > 0.02 && t < 0.98 && u > 0.02 && u < 0.98;
  }
  function crossingPairs(nodes, links){
    const byId = new Map(nodes.map(n => [n.id, n]));
    const segs = links.map(l => {
      const a = byId.get(l.from), b = byId.get(l.to);
      if (!a || !b) return null;
      return { l, a: { x: a.x + a.w/2, y: a.y + a.h/2 }, b: { x: b.x + b.w/2, y: b.y + b.h/2 } };
    }).filter(Boolean);
    const pairs = [];
    for (let i = 0; i < segs.length; i++)
      for (let j = i + 1; j < segs.length; j++){
        if (segs[i].l.from === segs[j].l.from || segs[i].l.from === segs[j].l.to ||
            segs[i].l.to === segs[j].l.from || segs[i].l.to === segs[j].l.to) continue;
        if (segInt(segs[i].a, segs[i].b, segs[j].a, segs[j].b))
          pairs.push(segs[i].l.from + '>' + segs[i].l.to + ' X ' + segs[j].l.from + '>' + segs[j].l.to);
      }
    return pairs;
  }
  const DIRS = { right: 'RIGHT', down: 'DOWN' };
  function elkGraph(model, rootDir, over){
    const walk = (s, dir) => {
      const opts = {
        'elk.algorithm': 'layered', 'elk.direction': DIRS[dir],
        'elk.layerSpacing': dir === 'down' ? 52 : 96,
        'elk.spacing.nodeNode': dir === 'down' ? 96 : 52,
        ...over
      };
      if (s.kind === 'zone'){
        opts['elk.padding'] = '"[top=56,left=32,bottom=32,right=32]"';
        return { id: s.id, layoutOptions: opts,
          children: s.children.map(c => walk(c, s.props.dir || rootDir)) };
      }
      const SIZE_ = SIZE[s.kind];
      return { id: s.id, width: SIZE_[0], height: SIZE_[1], layoutOptions: opts };
    };
    const seen = new Set(), edges = [];
    for (const l of model.links){
      const key = l.fromId + '>' + l.toId;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ id: 'e' + edges.length, sources: [l.fromId], targets: [l.toId] });
    }
    return { id: 'root', children: model.root.children.map(c => walk(c, rootDir)), edges };
  }
  function flatten(placed){
    const out = [];
    const walk = (n, ox, oy) => {
      const x = ox + (n.x || 0), y = oy + (n.y || 0);
      out.push({ id: n.id, x, y, w: n.width || 0, h: n.height || 0 });
      (n.children || []).forEach(c => walk(c, x, y));
    };
    walk(placed, 0, 0);
    return out.filter(n => n.w > 0);
  }
  const model = parseText(pipeline);
  const doc = buildTextDoc(model);
  const handPairs = crossingPairs(doc.nodes, doc.links);
  const configs = [];
  for (const seed of [0, 1, 7, 42, 99])
    for (const nodePlacement of ['BRANDES_KOEPF', 'SIMPLE'])
      for (const merge of ['ALWAYS', 'NEVER'])
        configs.push({ 'elk.randomizationSeed': seed,
          'elk.layered.nodePlacement.strategy': nodePlacement,
          'elk.layered.merger.strategy': merge });
  const results = [];
  for (const over of configs){
    const placed = await new ELK().layout(elkGraph(model, model.dir, over));
    const nodes = flatten(placed);
    const pairs = crossingPairs(nodes, doc.links);
    const w = Math.max(...nodes.map(n => n.x + n.w)), h = Math.max(...nodes.map(n => n.y + n.h));
    results.push({ over: JSON.stringify(over), c: pairs.length, w, h, pairs });
  }
  results.sort((a, b) => a.c - b.c);
  return { hand: handPairs, best: results.slice(0, 3), worst: results[results.length - 1].c };
}, pipeline);

await browser.close();
console.log('hand pairs:', out.hand.length, JSON.stringify(out.hand));
console.log('best ELK configs:');
out.best.forEach(r => console.log(' ', r.c, 'crossings', Math.round(r.w) + 'x' + Math.round(r.h), r.over));
if (out.best[0].c) console.log('  pairs:', JSON.stringify(out.best[0].pairs));
console.log('worst ELK:', out.worst);
