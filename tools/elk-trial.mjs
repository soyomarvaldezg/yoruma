// Trial: hand-rolled textPack vs elkjs layered, counted as straight-line
// arrow crossings between shape centres. Dev-only, not shipped.
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { readFileSync } from 'node:fs';

const root = path.resolve(import.meta.dirname, '..');
const elkPath = path.resolve(import.meta.dirname, 'node_modules/elkjs/lib/elk.bundled.js');

const pipeline = readFileSync(path.join(root, 'docs/pipeline-from-d2.yaml'), 'utf8');
const example = readFileSync(path.join(root, 'docs/example-text.yaml'), 'utf8');

// synthetic wide flat graph: 8 sources -> 4 middle -> 4 sinks, deterministic
const flat = [
  'dir right',
  ...['s1','s2','s3','s4','s5','s6','s7','s8'].map(n => `box ${n}`),
  ...['m1','m2','m3','m4'].map(n => `db ${n}`),
  ...['t1','t2','t3','t4'].map(n => `cloud ${n}`),
  's1 -> m1: feed', 's2 -> m1: feed', 's3 -> m2: feed', 's4 -> m2: feed',
  's5 -> m3: feed', 's6 -> m3: feed', 's7 -> m4: feed', 's8 -> m4: feed',
  'm1 -> t1', 'm1 -> t2', 'm2 -> t2', 'm2 -> t3', 'm3 -> t3', 'm3 -> t4',
  'm4 -> t4', 'm4 -> t1', 's1 -> m3', 's8 -> m2'
].join('\n');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(path.join(root, 'index.html')).href, { waitUntil: 'load' });
await page.addScriptTag({ path: elkPath });

const result = await page.evaluate(async ({ pipeline, example, flat }) => {
  const CENTER_GAP = 0; // segments may touch at shared nodes; filtered below
  function segInt(p1, p2, p3, p4){
    const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
    if (Math.abs(d) < 1e-9) return false;
    const t = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / d;
    const u = ((p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)) / d;
    return t > 0.02 && t < 0.98 && u > 0.02 && u < 0.98;
  }
  function crossings(nodes, links){
    const byId = new Map(nodes.map(n => [n.id, n]));
    const segs = links.map(l => {
      const a = byId.get(l.from), b = byId.get(l.to);
      if (!a || !b) return null;
      return {
        a: { x: a.x + a.w / 2, y: a.y + a.h / 2 },
        b: { x: b.x + b.w / 2, y: b.y + b.h / 2 },
        ends: new Set([l.from, l.to])
      };
    }).filter(Boolean);
    let n = 0;
    for (let i = 0; i < segs.length; i++)
      for (let j = i + 1; j < segs.length; j++){
        if ([...segs[i].ends].some(id => segs[j].ends.has(id))) continue;
        if (segInt(segs[i].a, segs[i].b, segs[j].a, segs[j].b)) n++;
      }
    return n;
  }
  function bbox(nodes){
    const w = Math.max(...nodes.map(n => n.x + n.w));
    const h = Math.max(...nodes.map(n => n.y + n.h));
    return { w, h };
  }

  const elk = new ELK();
  const DIRS = { right: 'RIGHT', down: 'DOWN' };

  // mirror the hand-rolled model into an ELK hierarchical graph
  function elkGraph(model, rootDir){
    const nodes = [];
    const edges = [];
    const seen = new Set();
    const walk = (s, dir) => {
      const opts = {
        'elk.algorithm': 'layered', 'elk.direction': DIRS[dir],
        'elk.layerSpacing': dir === 'down' ? 52 : 96,
        'elk.spacing.nodeNode': dir === 'down' ? 96 : 52,
      };
      if (s.kind === 'zone'){
        opts['elk.padding'] = `"[top=${56},left=32,bottom=32,right=32]"`;
        return {
          id: s.id, layoutOptions: opts,
          children: s.children.map(c => walk(c, s.props.dir || rootDir))
        };
      }
      const SIZE_ = SIZE[s.kind];
      return { id: s.id, width: SIZE_[0], height: SIZE_[1], layoutOptions: opts };
    };
    const root = {
      id: 'root', layoutOptions: {
        'elk.algorithm': 'layered', 'elk.direction': DIRS[rootDir],
        'elk.layerSpacing': rootDir === 'down' ? 52 : 96,
        'elk.spacing.nodeNode': rootDir === 'down' ? 96 : 52,
      },
      children: model.root.children.map(c => walk(c, rootDir))
    };
    for (const l of model.links){
      const key = l.fromId + '>' + l.toId;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ id: 'e' + edges.length, sources: [l.fromId], targets: [l.toId] });
    }
    return { graph: root, edges: edges };
  }
  // flatten compound result into absolute rects
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

  const run = async (name, src) => {
    const model = parseText(src);
    const doc = buildTextDoc(model);
    const handC = crossings(doc.nodes, doc.links);
    const handBox = bbox(doc.nodes);
    const { graph, edges } = elkGraph(model, model.dir);
    const t0 = performance.now();
    const placed = await elk.layout({ ...graph, edges });
    const ms = (performance.now() - t0).toFixed(0);
    const elNodes = flatten(placed);
    const elC = crossings(elNodes, doc.links);
    const elBox = bbox(elNodes);
    return { name, handC, elC, hand: handBox, elk: elBox, ms, links: doc.links.length };
  };

  return [
    await run('pipeline-from-d2', pipeline),
    await run('example-text', example),
    await run('synthetic wide flat', flat)
  ];
}, { pipeline, example, flat });

await browser.close();
for (const r of result){
  console.log(`${r.name}: hand ${r.handC} crossings | elk ${r.elC} crossings` +
    ` | hand ${Math.round(r.hand.w)}x${Math.round(r.hand.h)}` +
    ` | elk ${Math.round(r.elk.w)}x${Math.round(r.elk.h)} | elk ${r.ms}ms, ${r.links} arrows`);
}
