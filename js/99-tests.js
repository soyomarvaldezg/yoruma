if (/selftest/.test(location.search)){
  localStorage.removeItem(KEY);
  nodes = nodes.slice(0, 4);
  links = links.slice(0, 2);
  nodes.push({ id:'z1', kind:'zone', title:'Ingestion zone', sub:'', color:null,
    tcolor:null, scolor:null, fs:1, x:20, y:540, w:520, h:210 });
  nodes.push({ id:'t1', kind:'table', title:'Table X',
    sub:'From Customers here is something that I was okish but no and more words',
    color:null, tcolor:'#08829C', scolor:null, fs:1, x:620, y:540, w:200, h:96 });
  links.push({ id:'k90', from:'oltp', to:'events', color:'#8F2D45', motion:'both',
    label:'changes', way:null });
  nodes.push({ id:'sh1', kind:'shield', title:'Governance', sub:'policy', color:'#08829C',
    tcolor:'#08829C', scolor:null, fill:'#E6EDF2', fs:1, x:760, y:560, w:260, h:200 });
  nodes.push({ id:'ln1', kind:'line', title:'', sub:'', color:'#8F2D45', tcolor:null,
    scolor:null, fill:null, fs:1, x:60, y:760, w:320, h:120, flip:false });
  ['agent','contract','video','media'].forEach((k, i) => {
    nodes.push({ id:'g_'+k, kind:k, title:k, sub:'', color:null, tcolor:null,
      scolor:null, fill:null, fs:1, x:700 + i*190, y:700, w:172, h:110 });
  });
  S.selNodes = ['repl'];
  nodes = [
    { id:'A', kind:'box', title:'A', sub:'', color:null, tcolor:null, scolor:null,
      fill:null, fs:1, x:120, y:120, w:180, h:110 },
    { id:'B', kind:'box', title:'B', sub:'', color:null, tcolor:null, scolor:null,
      fill:null, fs:1, x:520, y:120, w:180, h:110 }
  ];
  links = [
    { id:'k1', from:'A', to:'B', color:null, motion:null, label:'',
      way:null, head:true, fromSide:'e', fromT:0.5, toSide:'s', toT:0.3 },
    { id:'k2', from:'A', to:'B', color:null, motion:null, label:'',
      way:null, head:true, fromSide:'s', fromT:0.7, toSide:'e', toT:0.2 },
    { id:'k3', from:'A', to:'B', color:null, motion:null, label:'',
      way:null, head:true, fromSide:'w', fromT:0, toSide:'w', toT:0 }
  ];
  S.selNodes = []; S.selLinks = ['k1'];
  render(); fit();

  document.title = 'selftest';
}

if (/[?&]test/.test(location.search)){
  const backup = localStorage.getItem('yoruma.doc.v1');
  const R = [];
  const ok = (n, c) => { R.push((c ? 'PASS' : 'FAIL') + '  ' + n); console.log((c?'PASS':'FAIL'), n, 'nodes', nodes.length, 'links', links.length, 'selL', S.selLinks.length); };
  const send = (type, w, target) => {
    const q = toScreen(w);
    const e = new PointerEvent(type, { bubbles:true, cancelable:true,
      clientX:q.x, clientY:q.y, button:0, buttons: type === 'pointerup' ? 0 : 1,
      pointerId:1, isPrimary:true, pointerType:'mouse' });
    (target || stage).dispatchEvent(e);
  };
  const drag = (a, b, target) => { send('pointerdown', a, target); send('pointermove', b, target); send('pointerup', b, target); };

  const n0 = nodes.length;
  setTool('box', 'draw');
  drag({x:1250,y:640},{x:1370,y:700});
  const box = nodes[nodes.length-1];
  ok('create box by drag', nodes.length === n0+1 && box.kind === 'box');

  box.logo = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  render();
  ok('card logo', !!stage.querySelector(`g.node[data-id="${box.id}"] [data-role="logo"]`));
  ok('logo name match', pickSvg([{ title:'Snowflake', route:'x' }], 'snow flake').title === 'Snowflake' &&
     !pickSvg([{ title:'Snowflake', route:'x' }], 'oracle'));
  ok('logo slug', logoSlug('Power BI') === 'power-bi' && logoSlug('  Apache Kafka ') === 'apache-kafka');
  ok('brand tile url', brandThumb('dbt').endsWith('/dbt.svg') &&
     brandThumb('power-bi').includes('microsoft-power-bi'));
  ok('logo aspect', Math.abs(svgAspect('<svg viewBox="0 0 512 196"></svg>') - 2.612) < 0.01 &&
     Math.abs(svgAspect('<svg viewBox="0 0 256 256"></svg>') - 1) < 0.01);
  const lgNode = { id:'lgx', kind:'logo', title:'', sub:'', color:null, tcolor:null,
    scolor:null, fs:1, x:420, y:420, w:100, h:100,
    logo:'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' };
  nodes.push(lgNode); render();
  ok('logo node', !!stage.querySelector('g.node[data-id="lgx"] [data-role="logo"]'));
  nodes.pop(); render();
  delete box.logo;
  render();

  const l0 = links.length;
  setTool('arrow', 'draw');
  const A = byId('dash'), B = byId('spark');
  drag({x:A.x+A.w/2,y:A.y+A.h/2},{x:B.x+B.w/2,y:B.y+B.h/2});
  ok('arrow between two shapes', links.length === l0+1);
  const lnk = links[links.length-1];

  setTool('select', 'draw');
  const el = stage.querySelector(`[data-link="${lnk.id}"]`);
  const mid = midPoint(route(byId(lnk.from), byId(lnk.to), null, lnk));
  send('pointerdown', mid, el); send('pointerup', mid, el);
  ok('select arrow by click', S.selLinks.length === 1 && S.selLinks[0] === lnk.id);

  lnk.label = 'load and model the curated tables into the serving layer';
  render();
  const lb = stage.querySelector('[data-role="label"]');
  ok('arrow label wraps', !!lb && lb.querySelectorAll('tspan').length > 1);
  ok('arrow note clears the bend handle', !!lb &&
     Number(lb.getAttribute('y')) < mid.y &&
     lb.getAttribute('pointer-events') === 'all');

  lnk.fs = 2;
  render();
  const lb2 = stage.querySelector('[data-role="label"]');
  ok('arrow label size', !!lb2 && lb2.getAttribute('font-size') === '36');
  lnk.fs = 1;
  lnk.label = '';
  render();

  const C = byId('analysts');
  const hTo = handles.find(x => x.kind === 'linkend' && x.end === 'to');
  if (!hTo) ok('re-point arrow to another shape', false);
  else {
    drag({x:hTo.x,y:hTo.y},{x:C.x+C.w/2,y:C.y+C.h/2});
    ok('re-point arrow to another shape', lnk.to === 'analysts' && !!lnk.toSide);
  }

  S.selLinks = [lnk.id]; S.selNodes = []; setMotion('off');
  const wBtn = document.querySelector('#linkbar button[data-lw="3"]');
  const dBtn = document.querySelector('#linkbar button[data-dash]');
  const hBtn = document.querySelector('#linkbar button[data-head]');
  const sBtn = document.querySelector('#linkbar button[data-headstart]');
  wBtn && wBtn.click();
  dBtn && dBtn.click();
  hBtn && hBtn.click();
  sBtn && sBtn.click();
  const styled = links.find(l => l.id === lnk.id);
  ok('arrow style controls', styled.lw === 3 && styled.dash === true &&
     styled.head === false && styled.headStart === true);
  const styledPath = Array.from(stage.querySelectorAll(`[data-link="${lnk.id}"] path`))
    .find(p => (p.getAttribute('marker-start') || '').startsWith('url('));
  ok('arrow style renders', !!styledPath && styledPath.getAttribute('stroke-dasharray') === '7 5');

  setMotion('dashes');
  const march = stage.querySelector(`[data-link="${lnk.id}"] path.march`);
  const dashBtn = document.querySelector('#linkbar button[data-dash]');
  ok('animated flow follows style', !!march &&
     +march.getAttribute('stroke-width') === 3.7 &&
     (march.getAttribute('marker-start') || '').startsWith('url(') &&
     march.classList.contains('rev') &&
     dashBtn.disabled === false && dashBtn.classList.contains('on'));
  dashBtn.click();
  const stopped = !stage.querySelector(`[data-link="${lnk.id}"] path.march`);
  const stoppedLink = links.find(l => l.id === lnk.id);
  ok('dash toggle stops the animated flow', stopped &&
     stoppedLink.dash === false && stoppedLink.motion === 'off');

  setMotion('both');
  const reverseDot = window.__y.motionEls.find(x => x.id === lnk.id);
  ok('reverse dots follow the start head', !!reverseDot && reverseDot.dir === -1);
  setMotion('off');

  S.selNodes = [box.id]; S.selLinks = []; render();
  const l1 = links.length;
  const ph = handles.find(x => x.kind === 'newedge' && x.side === 'e');
  if (!ph) ok('paddle edge with side', false);
  else {
    drag({x:ph.x,y:ph.y},{x:C.x+C.w/2,y:C.y+C.h/2});
    const pl = links[links.length-1];
    ok('paddle edge with side', links.length === l1+1 && pl.fromSide === 'e');
  }

  S.selNodes = [box.id]; S.selLinks = []; render();
  const rh = handles.find(x => x.kind === 'resize' && x.corner === 'se');
  const w0 = box.w, h0 = box.h;
  if (!rh) ok('resize handles', false);
  else {
    drag({x:rh.x,y:rh.y},{x:rh.x+60,y:rh.y+40});
    ok('resize handles', box.w >= w0+40 && box.h >= h0+30);
  }

  const sw = swEl.children[2];
  const r2 = sw.getBoundingClientRect();
  sw.dispatchEvent(new PointerEvent('pointerdown', { bubbles:true, clientX:r2.left+7, clientY:r2.top+7, pointerId:1 }));
  const nb = toScreen({ x:box.x+box.w/2, y:box.y+box.h/2 });
  window.dispatchEvent(new PointerEvent('pointerup', { bubbles:true, clientX:nb.x, clientY:nb.y }));
  ok('drag a swatch onto a shape', box.color === sw.dataset.hex);

  setMotion('dots');
  ok('dots render', motionEls.length > 0);
  setMotion('off');

  const pe = (type, cx, cy) => stage.dispatchEvent(new PointerEvent(type, {
    bubbles:true, cancelable:true, clientX:cx, clientY:cy, button:0,
    buttons: type === 'pointerup' ? 0 : 1, pointerId:1, isPrimary:true, pointerType:'mouse' }));
  const clickText = (id, role) => {
    const el = stage.querySelector(`g.node[data-id="${id}"] [data-role="${role}"]`);
    if (!el) return false;
    const q = el.getBoundingClientRect();
    pe('pointerdown', (q.left+q.right)/2, (q.top+q.bottom)/2);
    pe('pointerup', (q.left+q.right)/2, (q.top+q.bottom)/2);
    return true;
  };
  const clickSwatch = n => {
    const sw3 = swEl.children[n];
    const q = sw3.getBoundingClientRect();
    sw3.dispatchEvent(new PointerEvent('pointerdown', { bubbles:true, clientX:q.left+5, clientY:q.top+5, pointerId:1 }));
    window.dispatchEvent(new PointerEvent('pointerup', { bubbles:true, clientX:q.left+5, clientY:q.top+5 }));
    return sw3.dataset.hex;
  };

  const hn = { id:'h1', kind:'heading', title:'SECTION', sub:'', color:null, tcolor:null,
    scolor:null, fill:null, fs:1, x:980, y:760, w:260, h:24 };
  nodes.push(hn); render();
  const gotH = clickText('h1', 'title');
  const hexH = clickSwatch(3);
  ok('heading title colour', gotH && hn.tcolor === hexH);

  const sn = { id:'s1', kind:'box', title:'Title', sub:'subtitle', color:null, tcolor:null,
    scolor:null, fill:null, fs:1, x:980, y:820, w:200, h:80 };
  nodes.push(sn); render();
  const gotS = clickText('s1', 'sub');
  const hexS = clickSwatch(5);
  ok('subtitle colour', gotS && sn.scolor === hexS);

  setTool('arrow', 'draw');
  const oA = byId('oltp'), oB = byId('repl');
  const multi0 = links.length;
  drag({ x:oA.x + oA.w/2, y:oA.y + oA.h },
       { x:oB.x + oB.w*0.25, y:oB.y + oB.h });
  drag({ x:oA.x + oA.w, y:oA.y + oA.h*0.25 },
       { x:oB.x + oB.w, y:oB.y + oB.h*0.25 });
  ok('two arrows between the same pair', links.length === multi0 + 2);

  const srcN = byId('model'), tgtN = byId('analysts');
  const lcorner = links.length;
  drag({ x: srcN.x + srcN.w/2, y: srcN.y + srcN.h/2 },
       { x: tgtN.x + tgtN.w, y: tgtN.y });
  const lk2 = links[links.length-1];
  ok('arrow lands on a corner', links.length === lcorner + 1 &&
     lk2.to === 'analysts' && lk2.toSide === 'e' && lk2.toT < 0.12);

  setTool('line', 'draw');
  const nl = nodes.length;
  drag({x:700,y:820},{x:900,y:950});
  ok('free line shape', nodes.length === nl+1 && nodes[nodes.length-1].kind === 'line');

  setTool('arrow', 'draw');
  const na = nodes.length;
  drag({x:980,y:820},{x:1150,y:940});
  ok('free arrow shape', nodes.length === na+1 && nodes[nodes.length-1].kind === 'arrow');

  setTool('select', 'draw');
  const prevPaint = S.paint;
  S.paint = 'tint';
  const sw2 = swEl.children[4];
  const rb = sw2.getBoundingClientRect();
  sw2.dispatchEvent(new PointerEvent('pointerdown', { bubbles:true, clientX:rb.left+7, clientY:rb.top+7, pointerId:1 }));
  const fb = toScreen({ x:box.x+box.w/2, y:box.y+box.h/2 });
  window.dispatchEvent(new PointerEvent('pointerup', { bubbles:true, clientX:fb.x, clientY:fb.y }));
  ok('drag a swatch tints a card', box.color === sw2.dataset.hex && box.tint === true);
  S.paint = prevPaint;

  const keptFill = box.fill;
  box.fill = null;
  S.selNodes = [box.id]; S.selLinks = [];
  S.paint = 'tint';
  applyColor('#08829C');
  S.selNodes = [];
  render();
  const trect = stage.querySelector(`g.node[data-id="${box.id}"] rect`);
  ok('tinted card', !!trect && trect.getAttribute('fill') === hexA('#08829C', .1));
  box.tint = false; box.color = null; box.fill = keptFill;
  S.paint = 'line';
  render();

  const moved = byId('repl');
  const zx = moved.x, zy = moved.y;
  const startP = toScreen({ x:moved.x+moved.w/2, y:moved.y+moved.h/2 });
  const endP = toScreen({ x:moved.x+moved.w/2 + 3, y:moved.y+moved.h/2 + 60 });
  send('pointerdown', { x:moved.x+moved.w/2, y:moved.y+moved.h/2 });
  send('pointermove', { x:moved.x+moved.w/2+3, y:moved.y+moved.h/2+60 });
  send('pointerup', { x:moved.x+moved.w/2+3, y:moved.y+moved.h/2+60 });
  ok('drag moves a shape', moved.y > zy + 40);

  setTool('zone', 'draw');
  const nz = nodes.length;
  drag({x:150,y:820},{x:520,y:1000});
  const zone = nodes[nodes.length-1];
  ok('zone created', nodes.length === nz+1 && zone.kind === 'zone');
  setTool('select', 'draw');
  send('pointerdown', {x:zone.x+zone.w/2, y:zone.y+zone.h/2});
  send('pointerup', {x:zone.x+zone.w/2, y:zone.y+zone.h/2});
  ok('zone body is click-through', S.selNodes.length === 0);
  send('pointerdown', {x:zone.x+2, y:zone.y+zone.h/2});
  send('pointerup', {x:zone.x+2, y:zone.y+zone.h/2});
  ok('zone border selects', S.selNodes[0] === zone.id);

  setTool('box', 'draw');
  drag({x:zone.x+40,y:zone.y+40},{x:zone.x+240,y:zone.y+160});
  const kid = nodes[nodes.length-1];
  setTool('select', 'draw');
  selectNodes([zone.id], false);
  render();
  const zw = zone.w, kw = kid.w;
  drag({x:zone.x+zone.w,y:zone.y+zone.h},{x:zone.x+zone.w+120,y:zone.y+zone.h+80});
  ok('zone resize scales children',
    zone.w >= zw+100 && kid.w >= kw+30 &&
    kid.x >= zone.x && kid.y >= zone.y &&
    kid.x + kid.w <= zone.x + zone.w && kid.y + kid.h <= zone.y + zone.h);

  const zo1 = { id:'zo1', kind:'zone', title:'Outer', color:null, tcolor:null, scolor:null,
    fs:1, x:400, y:1250, w:300, h:220 };
  const zi1 = { id:'zi1', kind:'zone', title:'Inner', color:null, tcolor:null, scolor:null,
    fs:1, x:430, y:1290, w:160, h:120 };
  const zs1 = { id:'zs1', kind:'box', title:'Leaf', color:null, tcolor:null, scolor:null,
    fs:1, x:450, y:1310, w:100, h:60 };
  nodes.push(zo1, zi1, zs1);
  setTool('select', 'draw');
  const ox = zo1.x;
  send('pointerdown', { x:zo1.x+2, y:zo1.y+zo1.h/2 });
  send('pointermove', { x:zo1.x+42, y:zo1.y+zo1.h/2+30 });
  send('pointerup', { x:zo1.x+42, y:zo1.y+zo1.h/2+30 });
  ok('nested zone moves', zo1.x === ox+40 && zi1.x === 470 && zs1.x === 490);

  const keepN = nodes, keepL = links;
  nodes = []; links = [];
  loadExample('bi');
  ok('example loads', nodes.length >= 10 && links.length >= 6 &&
     !!stage.querySelector('g.node[data-id="b_oltp"]'));
  nodes = keepN; links = keepL; render();
  nodes.pop(); nodes.pop(); nodes.pop(); render();

  const zb = { id:'zb1', kind:'zone', title:'VPC', color:null, tcolor:null, scolor:null,
    fs:1, x:200, y:1500, w:260, h:180, band:true, solid:true };
  nodes.push(zb); render();
  const zbG = stage.querySelector('g.node[data-id="zb1"]');
  const zbRect = zbG && zbG.querySelector('rect');
  ok('zone band', !!zbG && !!zbG.querySelector('[data-role="zone-band"]') &&
     !!zbRect && !zbRect.getAttribute('stroke-dasharray'));
  nodes.pop(); render();

  const before = nodes.length;
  snapshot(); nodes.pop(); render(); undo();
  ok('undo restores', nodes.length === before);
  redo();
  ok('redo reapplies', nodes.length === before - 1);
  undo();

  S.selNodes = [box.id]; S.selLinks = []; render();
  const nd = nodes.length;
  duplicateSelection();
  ok('duplicate selection', nodes.length === nd + 1 && nodes[nodes.length-1].id !== box.id);
  undo();

  S.selNodes = [box.id]; S.selLinks = []; render();
  const liveBox = byId(box.id);
  const clip = buildClipboard();
  const np = nodes.length, bx = liveBox.x;
  pasteClipboard(clip);
  ok('paste selection', nodes.length === np + 1 && nodes[nodes.length-1].x === bx + 24);
  undo();

  const zi = byId('oltp');
  S.selNodes = [zi.id]; S.selLinks = []; render();
  reorderSelection(true);
  ok('bring to front', nodes[nodes.length-1].id === zi.id);
  reorderSelection(false);
  ok('send to back', nodes[0].id === zi.id);
  undo(); undo();

  const cf = document.getElementById('catalog-filter');
  cf.value = 'lineage';
  cf.dispatchEvent(new Event('input', { bubbles:true }));
  const vis = Array.from(document.querySelectorAll('#catalog .chip')).filter(c => !c.hidden);
  ok('blocks filter', vis.length > 0 && vis.every(c => /lineage/i.test(c.dataset.label)));
  cf.value = '';
  cf.dispatchEvent(new Event('input', { bubbles:true }));

  S.selNodes = [box.id]; S.selLinks = []; render();
  const ix = document.getElementById('i-x');
  ix.value = '500';
  ix.dispatchEvent(new Event('change', { bubbles:true }));
  const ib = byId(box.id);
  ok('size inspector', ib.x === 500);

  setPresent(true);
  const asideHidden = getComputedStyle(document.querySelector('aside')).display === 'none';
  ok('present mode', document.body.classList.contains('present') && asideHidden);
  setPresent(false);

  const pzA = { id:'pz1', kind:'zone', title:'02 / Later', x:900, y:0, w:80, h:80 };
  const pzB = { id:'pz2', kind:'zone', title:'01 / First', x:0, y:400, w:80, h:80 };
  nodes.push(pzA, pzB);
  const order = presentZones().map(z => z.id);
  ok('present step order', order.indexOf('pz2') !== -1 && order.indexOf('pz1') !== -1 &&
     order.indexOf('pz2') < order.indexOf('pz1'));
  nodes.pop(); nodes.pop();

  const selIds = [box.id, byId('dash').id];
  S.selNodes = selIds.slice();
  const nf = nodes.length;
  addStep();
  const fr = nodes[nodes.length-1];
  ok('step add', nodes.length === nf+1 && fr.kind === 'frame' &&
     fr.members.length === 2 && presentFrames().some(f => f.id === fr.id));
  removeStep(fr.id);
  S.selNodes = [];

  const zT = { id:'zt', kind:'zone', title:'', color:null, tcolor:null, scolor:null,
    fs:1, x:0, y:0, w:100, h:100 };
  const cT = { id:'ct', kind:'box', title:'', color:null, tcolor:null, scolor:null,
    fs:1, x:10, y:10, w:20, h:20 };
  nodes.push(zT, cT);
  ok('step zone members', stepMembers({ members:['zt'] }).has('ct'));
  nodes.pop(); nodes.pop();

  S.selNodes = [box.id];
  const beforeSteps = presentFrames().length;
  addStep();
  addStep();
  const nasty = { id:'mz', kind:'box', title:'A [b] "c" | d', sub:'', color:null,
    tcolor:null, scolor:null, fs:1, x:0, y:0, w:10, h:10 };
  const metaFr = { id:'mf', kind:'frame', title:'Step 9', members:[], step:9,
    x:0, y:0, w:5, h:5 };
  nodes.push(nasty, metaFr);
  const mm = mermaid();
  ok('mermaid escape', mm.includes('n_mz["A b c d"]') && !mm.includes('n_mf'));
  nodes.pop(); nodes.pop();

  const rawDoc = JSON.stringify({ format:'yoruma', version:1, links:[], nodes:[
    { id:'a1', kind:'box', title:'A', x:0, y:0, w:10, h:10, tint:true, junk:'x',
      logo:'data:image/png;base64,AAA' },
    { id:'f1', kind:'frame', title:'S', x:0, y:0, w:1, h:1, step:2,
      members:['a1', 'gone', 'a1'] }
  ] });
  const pd = parseDoc(rawDoc);
  const pdA = pd.nodes[0], pdF = pd.nodes[1];
  ok('document fields', pdA.tint === true && !('junk' in pdA) &&
     pdA.logo === 'data:image/png;base64,AAA' &&
     pdF.step === 2 && pdF.members.length === 1 && pdF.members[0] === 'a1');

  let bigDoc = false, hugeDoc = false;
  try { parseDoc('x'.repeat(DOC_MAX_CHARS + 1)); } catch (e){ bigDoc = /too large/.test(e.message); }
  try {
    const many = Array.from({ length: DOC_MAX_ITEMS + 1 }, (_, i) =>
      ({ id:'b' + i, kind:'box', x:0, y:0, w:1, h:1 }));
    parseDoc(JSON.stringify({ format:'yoruma', version:1, nodes:many, links:[] }));
  } catch (e){ hugeDoc = /too many/.test(e.message); }
  ok('document limits', bigDoc && hugeDoc);

  ok('step duplicate guard', presentFrames().length === beforeSteps + 1);
  presentFrames().filter(f => (f.members || []).includes(box.id))
    .forEach(f => removeStep(f.id));
  S.selNodes = [];

  const doc = JSON.parse(docJSON());
  ok('json export document', doc.format === 'yoruma' && doc.version === 1 &&
     doc.nodes.length === nodes.length && doc.links.length === links.length);

  const round = parseDoc(docJSON());
  ok('json import round-trip', round.nodes.length === nodes.length &&
     round.links.length === links.length);

  let badLinks = false;
  try {
    parseDoc(JSON.stringify({ format:'yoruma', version:1, nodes:[],
      links:[{ id:'bad', from:'missing', to:'missing' }] }));
  } catch (e){ badLinks = true; }
  ok('json import rejects bad links', badLinks);

  setTimeout(() => {
    render();
    setTimeout(() => {
      let saved = false;
      try {
        const raw = localStorage.getItem('yoruma.doc.v1');
        saved = !!raw && JSON.parse(raw).nodes.length === nodes.length;
      } catch (e){}
      ok('document saved', saved);

      const times = [];
      for (let i = 0; i < 24; i++){
        const t = performance.now();
        render();
        times.push(performance.now() - t);
      }
      times.sort((a, b) => a - b);
      const median = times[Math.floor(times.length/2)];
      ok('render budget ' + median.toFixed(1) + 'ms', median < 16);

      const keepNodes = nodes, keepLinks = links;
      nodes = [];
      links = [];
      for (let i = 0; i < 200; i++){
        nodes.push({ id:'s'+i, kind:'box', title:'Node ' + i, sub:'sub', color:null,
          tcolor:null, scolor:null, fs:1, x:(i%20)*220, y:Math.floor(i/20)*140,
          w:180, h:90 });
        if (i) links.push({ id:'l'+i, from:'s'+(i-1), to:'s'+i, color:null,
          motion:'off', label:'', way:null });
      }
      const heavy = [];
      for (let i = 0; i < 10; i++){
        const t = performance.now();
        render();
        heavy.push(performance.now() - t);
      }
      heavy.sort((a, b) => a - b);
      const heavyMedian = heavy[Math.floor(heavy.length/2)];
      nodes = keepNodes;
      links = keepLinks;
      render();
      ok('heavy render ' + heavyMedian.toFixed(1) + 'ms', heavyMedian < 16);
      const fails = R.filter(r => r.startsWith('FAIL')).length;
      const el2 = document.getElementById('help');
      el2.innerHTML = '<h3>Self test</h3>' + R.map(r =>
        `<div><span>${r.slice(0,4)}</span><span>${r.slice(6)}</span></div>`).join('')
        + `<div style="margin-top:8px"><span></span><span>${fails} failed of ${R.length}</span></div>`;
      el2.classList.add('on');
      document.title = fails + ' failed';
      console.log(R.join('\n'));
      setTimeout(() => {
        if (backup) localStorage.setItem('yoruma.doc.v1', backup);
        else localStorage.removeItem('yoruma.doc.v1');
      }, 1500);
    }, 700);
  }, 50);
}
