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
  ok('an SVG with an XML prolog still counts as a logo',
     !!svgFromText('<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE svg>\n<svg width="10"><path/></svg>') &&
     !svgFromText('not an svg at all') &&
     svgFromText('<svg viewBox="0 0 24 24"><path/></svg>').startsWith('<svg xmlns='));
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

  nodes.push(lgNode);
  lgNode.title = 'S3';
  lgNode.sub = 'bucket';
  render();
  const lgText = stage.querySelector(`g.node[data-id="lgx"] [data-role="title"]`);
  const lgSub = stage.querySelector(`g.node[data-id="lgx"] [data-role="sub"]`);
  ok('an icon takes a title and subtitle',
     !!lgText && lgText.textContent === 'S3' && !!lgSub && lgSub.textContent === 'bucket');
  editNode(lgNode);
  edTitle.value = 'Object storage';
  commitEdit();
  ok('double-clicking an icon opens its text',
     lgNode.title === 'Object storage' &&
     !!stage.querySelector('g.node[data-id="lgx"] [data-role="title"]'));
  ok('icon captions are not linted as overflow',
     !lintIssues().some(x => x.id === 'lgx'));
  nodes.pop(); render();

  ok('icon pack ships monochrome glyphs',
     ICON_PACK.length >= 100 && ICON_PACK.every(ic => ic.d.includes('<path')));
  ok('concept glyphs cover the vendor-free gaps',
     LOCAL_ICONS.length === ICON_PACK.length + CONCEPTS.length &&
     CONCEPTS.every(c => c.d.includes('stroke="currentColor"')) &&
     iconSearch('vpc').some(c => c.n === 'Network') &&
     iconSearch('feature store').some(c => c.n === 'Feature store') &&
     !!iconByName('load balancer'));
  ok('icon search matches names and tags',
     iconSearch('kafka').some(ic => ic.n === 'Apache Kafka') &&
     iconSearch('events').some(ic => ic.n === 'Apache Kafka') &&
     iconSearch('s3').some(ic => ic.n === 'MinIO') &&
     iconSearch('zzzzz').length === 0);
  ok('icon lookup by name or alias',
     iconByName('Apache Kafka') === iconByName('kafka') &&
     iconByName('s3') === iconByName('MinIO') && iconByName('nothing here') === null);
  const kafka = iconByName('kafka');
  const kafkaInner = monoInner(iconDataUri(kafka), '#4263EB');
  ok('mono icon swaps its ink',
     kafkaInner && kafkaInner.includes('#4263EB') && !kafkaInner.includes('currentColor'));

  box.color = '#099268';
  S.selNodes = [box.id]; S.selLinks = [];
  placeIcon(kafka);
  render();
  const monoPath = stage.querySelector(`g.node[data-id="${box.id}"] [data-role="logo"] path`);
  ok('clicking an icon paints the selected card',
     box.mono === true && box.logo.startsWith('data:image/svg+xml') &&
     !!monoPath && monoPath.getAttribute('fill') === '#099268');
  ok('icon tint follows the outline colour',
     (() => {
       box.color = '#4263EB'; render();
       const p = stage.querySelector(`g.node[data-id="${box.id}"] [data-role="logo"] path`);
       return !!p && p.getAttribute('fill') === '#4263EB';
     })());
  delete box.mono;

  const monoDoc = parseDoc(JSON.stringify({ format:'yoruma', version:1, links:[],
    nodes:[{ id:'mono1', kind:'logo', x:0, y:0, w:40, h:40, mono:true,
      logo:iconDataUri(kafka) },
      { id:'mono2', kind:'logo', x:0, y:0, w:40, h:40, mono:true }] }));
  ok('document keeps the mono flag',
     monoDoc.nodes[0].mono === true && !('mono' in monoDoc.nodes[1]));

  const iconModel = parseText('card Kafka:\n  icon: kafka');
  ok('text format takes an icon name', iconModel.shapes[0].props.icon === 'kafka');
  let badIcon = false;
  try { parseText('card A:\n  icon:'); } catch (e){ badIcon = /icon needs a value/.test(e.message); }
  ok('text format rejects an empty icon', badIcon);

  const iconGrid = document.getElementById('icon-grid');
  const iconFilterEl = document.getElementById('icon-filter');
  iconFilterEl.value = 'kafka';
  iconFilterEl.dispatchEvent(new Event('input'));
  ok('sidebar icon search narrows the grid',
     iconGrid.querySelectorAll('.icon-tile').length >= 1 &&
     /Kafka/.test(iconGrid.textContent));
  iconFilterEl.value = '';
  iconFilterEl.dispatchEvent(new Event('input'));
  ok('sidebar icon grid returns to the whole pack',
     iconGrid.querySelectorAll('.icon-tile').length === LOCAL_ICONS.length &&
     ICON_PACK.length >= 100 && LOCAL_ICONS.length === ICON_PACK.length + CONCEPTS.length);
  iconFilterEl.value = 'tableau';
  iconFilterEl.dispatchEvent(new Event('input'));
  ok('brand marks join the same search box',
     !!iconFilterEl && Array.from(iconGrid.querySelectorAll('.icon-tile.brand img'))
       .some(img => /tableau\.svg/.test(img.src)));
  iconFilterEl.value = '';
  iconFilterEl.dispatchEvent(new Event('input'));
  const nLogo = nodes.length;
  S.selNodes = [];
  placeIcon(iconByName('docker'));
  const made = nodes[nodes.length-1];
  ok('an icon with no selection lands as its own shape',
     nodes.length === nLogo+1 && made.kind === 'logo' && made.mono === true);
  nodes.pop(); S.selNodes = []; render();

  ok('image insert lives in the top bar, not the draw grid',
     !!document.getElementById('btn-image') &&
     !document.querySelector('#tools button[data-tool="image"]') &&
     !document.getElementById('btn-insert'));
  const packResult = applyIconPack([
    { name:'Azure Data Factory', tags:'data factory,adf,azure,integration',
      svg:'<svg viewBox="0 0 24 24"><path fill="#0f6cbd" d="M3 3h18v18H3z"/></svg>' },
    { name:'Broken entry', svg:'not an svg' },
    { name:'', svg:'<svg></svg>' }
  ]);
  ok('an imported pack joins the same search',
     packResult === 1 &&
     iconSearch('data factory').some(e => e.n === 'Azure Data Factory') &&
     !!localStorage.getItem(PACK_KEY));
  const adf = iconByName('Azure Data Factory');
  ok('imported icons keep their own colours',
     !!adf && !!adf.src && iconTinted(adf) === false &&
     iconByName('Broken entry') === null);
  S.selNodes = [box.id];
  placeIcon(adf);
  render();
  ok('an imported icon lands as a colour logo',
     box.logo === adf.src && box.mono !== true &&
     !!stage.querySelector(`g.node[data-id="${box.id}"] image[data-role="logo"]`));
  delete box.logo;
  IMPORTED = [];
  loadIconPack();
  ok('a stored pack comes back on the next load',
     !!iconByName('Azure Data Factory'));
  applyIconPack([
    { name:'Mine', tags:'mine', svg:'<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 4h16v16H4z"/></svg>' }
  ]);
  ok('an imported glyph that says currentColor still tints',
     iconTinted(iconByName('Mine')) === true);
  ok('the file menu offers the import and its removal',
     !!document.querySelector('[data-x="icons-import"]') &&
     !!document.querySelector('[data-x="icons-clear"]'));
  clearImportedIcons();
  ok('the imported pack can be removed again',
     !iconSearch('data factory').some(e => e.n === 'Azure Data Factory') &&
     !iconByName('Mine') && !localStorage.getItem(PACK_KEY));
  render();

  ok('redrawn role glyphs answer vendor service names',
     iconSearch('s3').some(e => e.n === 'Object storage') &&
     iconSearch('blob storage').some(e => e.n === 'Object storage') &&
     iconSearch('redshift').some(e => e.n === 'Data warehouse') &&
     iconSearch('oracle autonomous database').some(e => e.n === 'Data warehouse') &&
     iconSearch('azure data factory').some(e => e.n === 'ETL service') &&
     iconSearch('azure event hubs').some(e => e.n === 'Event bus') &&
     iconSearch('azure key vault').some(e => e.n === 'Key vault') &&
     iconSearch('azure synapse analytics').some(e => e.n === 'Data warehouse') &&
     CONCEPTS.length >= 30 &&
     CONCEPTS.every(c => c.d.includes('stroke="currentColor"')));
  const zoneText = textDoc('zone R us-east-1:\n  band: true\n  card A');
  const zoneSel = textDoc('zone R:\n  solid: true\n  fill: "#099268"\n  card A');
  ok('zones take band, solid and fill from the text format',
     zoneText.nodes[0].band === true && zoneSel.nodes[0].solid === true &&
     zoneSel.nodes[0].fill === '#099268');
  let zoneBad = 0;
  try { parseText('zone R:\n  tilt: true\n  card A'); }
  catch (e){ zoneBad = /zones take/.test(e.message) ? 1 : 0; }
  ok('unknown zone props still fail loudly', zoneBad === 1);

  ok('an SVG filename becomes an icon name',
     fileIconName('10128-icon-service-Azure-Synapse-Analytics.svg') ===
       'Azure Synapse Analytics' &&
     fileIconName('azure-data-factory.svg') === 'Azure Data Factory' &&
     fileIconName('.svg') === '');
  const azEntry = entryFromFile('10128-icon-service-Azure-Synapse-Analytics.svg',
    '<svg viewBox="0 0 24 24"><path fill="#0078d4" d="M3 3h18v18H3z"/></svg>');
  ok('a plain SVG file imports with its name and tags',
     !!azEntry && azEntry.n === 'Azure Synapse Analytics' &&
     azEntry.t.includes('synapse') && azEntry.src.startsWith('data:image/svg+xml') &&
     applyIconPack([azEntry]) === 1 &&
     iconSearch('synapse').some(e => e.n === 'Azure Synapse Analytics'));
  clearImportedIcons();
  render();

  ok('brand catalog finds AWS services by short name',
     brandSearch('s3').some(e => e.f === 'aws-s3') &&
     brandSearch('data factory').length === 0 &&
     brandSearch('lambda').some(e => e.f === 'aws-lambda'));

  const sendAlt = (type, w) => {
    const q = toScreen(w);
    stage.dispatchEvent(new PointerEvent(type, { bubbles:true, cancelable:true,
      clientX:q.x, clientY:q.y, button:0, buttons: type === 'pointerup' ? 0 : 1,
      pointerId:1, isPrimary:true, pointerType:'mouse', altKey:true }));
  };

  S.selNodes = [box.id]; S.selLinks = []; spotId = null;
  window.dispatchEvent(new KeyboardEvent('keydown', { key:'w' }));
  const spotOn = spotId === box.id &&
    document.querySelectorAll('g.node[data-id="dash"]').length > 0 &&
    stage.querySelector('g.node[data-id="dash"]').classList.contains('dimmed');
  window.dispatchEvent(new KeyboardEvent('keydown', { key:'w' }));
  ok('W focuses one shape and dims the rest', spotOn && spotId === null);

  window.dispatchEvent(new KeyboardEvent('keydown', { key:'w' }));
  const dimFirst = stage.querySelector('g.node[data-id="dash"]').classList.contains('dimmed');
  render();
  const dimAgain = stage.querySelector('g.node[data-id="dash"]').classList.contains('dimmed');
  ok('the dim eases in once and does not re-flash on redraw', dimFirst && !dimAgain);
  spotId = null; render();

  sendAlt('pointerdown', { x:300, y:900 });
  for (let i = 1; i <= 6; i++) sendAlt('pointermove', { x:300 + i*24, y:900 + (i%2 ? 10 : -6) });
  const laserPath = stage.querySelector('path.laser');
  const laserDrawn = !!laserPath && (laserPath.getAttribute('d') || '').split('L').length > 3;
  ok('option-drag draws a laser stroke', laserDrawn);
  sendAlt('pointerup', { x:444, y:894 });
  const laserGone = !stage.querySelector('path.laser') ||
    stage.querySelector('path.laser').getAttribute('opacity') === '0';
  ok('the laser fades out on release', laserGone && spotId === null);

  const selBefore = S.selNodes.slice();
  send('pointerdown', { x:box.x + box.w/2, y:box.y + box.h/2 });
  send('pointerup', { x:box.x + box.w/2, y:box.y + box.h/2 });
  ok('a plain drag still selects, not lasers',
     !stage.querySelector('path.laser') && S.selNodes.length === 1);
  S.selNodes = selBefore; render();

  S.selNodes = []; S.selLinks = []; render();
  setTool('box', 'draw'); S.sticky = false;
  const stickBefore = new Set(nodes.map(n => n.id));
  const stickSel = S.selNodes.slice();
  window.dispatchEvent(new KeyboardEvent('keydown', { key:'r' }));
  drag({x:1250,y:640},{x:1370,y:700});
  drag({x:1250,y:760},{x:1370,y:820});
  const stickMade = nodes.filter(n => !stickBefore.has(n.id)).length;
  const stickKept = S.sticky === true && stickMade === 2 && S.tool === 'box';
  window.dispatchEvent(new KeyboardEvent('keydown', { key:'r' }));
  drag({x:1250,y:880},{x:1370,y:940});
  const stickMadeAll = nodes.filter(n => !stickBefore.has(n.id)).length;
  ok('pressing a tool key twice keeps it armed for more shapes',
     stickKept && S.sticky === false && S.tool === 'select' && stickMadeAll === 3);
  nodes = nodes.filter(n => stickBefore.has(n.id));
  S.selNodes = stickSel; S.sticky = false; document.body.dataset.sticky = '0';
  setTool('select', 'draw'); render();

  const dashNode = { id:'dd1', kind:'box', title:'AZ', sub:'', color:'#657486', tcolor:null,
    scolor:null, fs:1, dash:true, x:60, y:520, w:200, h:120 };
  nodes.push(dashNode); render();
  const dRect = stage.querySelector('g.node[data-id="dd1"] rect');
  ok('a plain shape can take a dashed outline',
     !!dRect && dRect.getAttribute('stroke-dasharray') === '6 5');
  const dashDoc = parseDoc(JSON.stringify({ format:'yoruma', version:1, links:[],
    nodes:[{ id:'d1', kind:'box', x:0, y:0, w:10, h:10, dash:true }] }));
  ok('the dashed flag survives the document and the text format',
     dashDoc.nodes[0].dash === true &&
     textDoc('card A:\n  dash: true\ncard B\nA -> B').nodes[0].dash === true);
  nodes.pop();

  S.selNodes = [box.id]; S.selLinks = []; render();
  setTool('laser');
  send('pointerdown', { x:200, y:1900 });
  send('pointermove', { x:280, y:1930 });
  send('pointerup', { x:280, y:1930 });
  const laserTool = stage.querySelector('path.laser');
  ok('the laser tool draws a stroke that fades on release',
     !!laserTool && laserTool.getAttribute('opacity') === '0');

  setTool('pen');
  send('pointerdown', { x:200, y:1960 });
  send('pointermove', { x:300, y:1985 });
  send('pointerup', { x:300, y:1985 });
  const inkForErase = stage.querySelector('path.ink');
  setTool('eraser');
  send('pointerdown', { x:250, y:1972 });
  send('pointerup', { x:250, y:1972 });
  ok('the eraser wipes the ink it passes over',
     !!inkForErase && !stage.querySelector('path.ink'));

  const erasable = { id:'er1', kind:'box', title:'gone', sub:'', color:null, tcolor:null,
    scolor:null, fs:1, x:2000, y:2000, w:120, h:80 };
  nodes.push(erasable); render();
  setTool('eraser');
  send('pointerdown', { x:2060, y:2040 });
  send('pointerup', { x:2060, y:2040 });
  ok('the eraser deletes a shape under the pointer', !byId('er1'));
  const redoSafe = undoStack.length;
  setTool('select', 'draw'); render();
  ok('the deletion is on the undo stack', redoSafe > 0);

  ok('the draw grid stays a square block of tools',
     document.querySelectorAll('#tools button').length % 4 === 0);

  S.selNodes = []; S.selLinks = []; render();
  setTool('box', 'draw');
  drag({x:1250, y:2140}, {x:1370, y:2200});
  const fresh = nodes[nodes.length-1];
  ok('drawing a shape no longer opens the text editor', editing === null);
  S.selNodes = [fresh.id]; S.selLinks = [];
  window.dispatchEvent(new KeyboardEvent('keydown', { key:'Enter' }));
  const enterEdits = editing === fresh.id;
  commitEdit();
  S.selNodes = []; render();
  ok('Enter opens the editor for the selected shape', enterEdits);
  ok('new shapes take the current stroke defaults',
     fresh.stroke === S.stroke && fresh.sw === S.sw);

  S.selNodes = [fresh.id]; S.selLinks = [];
  document.querySelector('#stroke-segs button[data-stroke="dotted"]').click();
  const widthSegsClick = k =>
    document.querySelector(`#width-segs button[data-size="${k}"]`).click();
  const shapeRect = id => {
    const g = stage.querySelector(`g.node[data-id="${id}"]`);
    return g && Array.from(g.querySelectorAll('rect'))
      .find(r => !r.classList.contains('ui'));
  };
  const dottedRect = shapeRect(fresh.id);
  const edgeRound = document.querySelector('#edge-segs button[data-sharp="0"]');
  ok('the stroke row dots the outline',
     byId(fresh.id).stroke === 'dotted' &&
     dottedRect.getAttribute('stroke-dasharray') === '2 3');
  document.querySelector('#edge-segs button[data-sharp="1"]').click();
  ok('the edges row sharpens the corners',
     byId(fresh.id).sharp === true &&
     shapeRect(fresh.id).getAttribute('rx') === '0');
  document.querySelector('#width-segs button[data-size="xl"]').click();
  const solidFill = { id:'sf1', kind:'box', title:'', sub:'', color:'#1D1D1D', tint:true,
    tcolor:null, scolor:null, fs:1, fillmode:'solid', x:0, y:0, w:120, h:80 };
  nodes.push(solidFill); render();
  const sfRect = shapeRect('sf1');
  ok('a solid fill uses the colour at full strength',
     sfRect.getAttribute('fill') === '#1D1D1D');
  nodes.pop();

  ok('a tint keeps its hue instead of washing into the grey paper',
     pastel('#846358') === '#f5e1db' && pastel('#1D1D1D') === '#e6e6e6' &&
     pastel('#D6336C') === '#fcdde3' && /^#[0-9a-f]{6}$/.test(pastel('#08829C')));

  ok('the width row thickens the outline',
     byId(fresh.id).sw === 3.4 &&
     shapeRect(fresh.id).getAttribute('stroke-width') === '3.4');

  S.selNodes = [fresh.id]; S.selLinks = [];
  widthSegsClick('s');
  const thin = byId(fresh.id).sw;
  widthSegsClick('m');
  ok('S and M are visually different widths', thin === 0.6 && byId(fresh.id).sw === 1.2);
  S.selNodes = []; render();

  ok('drawing ink keeps it across a re-render',
     (() => {
       setTool('pen');
       send('pointerdown', { x:200, y:2300 });
       send('pointermove', { x:280, y:2320 });
       send('pointerup', { x:280, y:2320 });
       const before = stage.querySelectorAll('path.ink').length;
       render();
       const after = stage.querySelectorAll('path.ink').length;
       S.selNodes = [fresh.id]; render();
       const afterSel = stage.querySelectorAll('path.ink').length;
       inked = []; render();
       setTool('select', 'draw');
       return before === 1 && after === 1 && afterSel === 1;
     })());

  const freeArrow = { id:'ra1', kind:'arrow', title:'', sub:'', color:null, tcolor:null,
    scolor:null, fs:1, x:100, y:2400, w:200, h:0, flip:false, rev:true };
  nodes.push(freeArrow); render();
  const raLine = stage.querySelector('g.node[data-id="ra1"] line');
  ok('a free arrow dragged right-to-left keeps its head on the left',
     !!raLine && raLine.getAttribute('marker-end') === 'none' &&
     /^url\(#ar/.test(raLine.getAttribute('marker-start') || ''));
  nodes.pop(); render();

  window.dispatchEvent(new KeyboardEvent('keydown', { key:'G', shiftKey:true }));
  ok('Shift+G picks the governance shape behind the heading',
     S.tool === 'shield');
  setTool('select', 'draw'); render();

  ok('ink is remembered across a reload',
     (() => {
       setTool('pen');
       send('pointerdown', { x:200, y:2450 });
       send('pointermove', { x:260, y:2470 });
       send('pointerup', { x:260, y:2470 });
       const raw = localStorage.getItem(INK_KEY);
       inked = []; render();
       loadInk(); render();
       const back = stage.querySelectorAll('path.ink').length;
       inked = []; localStorage.removeItem(INK_KEY);
       setTool('select', 'draw'); render();
       return !!raw && back === 1;
     })());

  const styledDoc = parseDoc(JSON.stringify({ format:'yoruma', version:1, links:[],
    nodes:[{ id:'st1', kind:'box', x:0, y:0, w:10, h:10, stroke:'dotted', sharp:true, sw:2 }] }));
  ok('stroke, edges and width survive the document',
     styledDoc.nodes[0].stroke === 'dotted' && styledDoc.nodes[0].sharp === true &&
     styledDoc.nodes[0].sw === 2);
  ok('and the text format',
     (() => {
       const n = textDoc('card A:\n  stroke: dashed\n  sharp: true\n  size: l\ncard B\nA -> B').nodes[0];
       return n.stroke === 'dashed' && n.sharp === true && n.sw === 2.2;
     })());
  nodes = nodes.filter(n => n.id !== fresh.id);
  S.selNodes = []; S.selLinks = []; setTool('select', 'draw'); render();

  const frontBtn = document.querySelector('#shaper button[data-order="front"]');
  const backBtn = document.querySelector('#shaper button[data-order="back"]');
  ok('the shape bar carries bring-to-front and send-to-back', !!frontBtn && !!backBtn);
  S.selNodes = [box.id]; render();
  document.querySelector('#shaper button[data-order="front"]').click();
  const onTop = nodes.indexOf(byId(box.id)) === nodes.length - 1;
  backBtn.click();
  const atBack = nodes.indexOf(byId(box.id)) === 0;
  ok('send to back and bring to front reorder the stack', onTop && atBack);
  S.selNodes = [box.id]; render();
  ok('no dashed toggle in the shape bar, no zone morph',
     !document.querySelector('#shaper button[data-dash="1"]') &&
     !Array.from(document.querySelectorAll('#shaper button'))
       .some(b => b.dataset.kind === 'zone'));

  setTool('pen');
  send('pointerdown', { x:200, y:1800 });
  send('pointermove', { x:260, y:1830 });
  send('pointermove', { x:320, y:1800 });
  send('pointerup', { x:320, y:1800 });
  const inkStroke = stage.querySelector('path.ink');
  ok('the pen keeps ink on the canvas', !!inkStroke && S.tool === 'pen' &&
     (inkStroke.getAttribute('d') || '').split('L').length >= 2);
  send('pointerdown', { x:200, y:1860 });
  send('pointermove', { x:280, y:1880 });
  send('pointerup', { x:280, y:1880 });
  ok('a second stroke is a second path',
     stage.querySelectorAll('path.ink').length === 2);
  window.dispatchEvent(new KeyboardEvent('keydown', { key:'Escape' }));
  ok('Escape clears the ink', !stage.querySelector('path.ink'));
  setTool('select', 'draw');

  nodes.push({ id:'sd1', kind:'frame', title:'S1', members:[box.id], step:1,
    x:0, y:0, w:1, h:1 });
  renderStepsMenu();
  const asideEl = document.querySelector('aside');
  const wasShown = getComputedStyle(asideEl).display !== 'none';
  window.dispatchEvent(new KeyboardEvent('keydown', { key:'.', metaKey:true }));
  const hid = getComputedStyle(asideEl).display === 'none' && S.panel === false;
  window.dispatchEvent(new KeyboardEvent('keydown', { key:'.', metaKey:true }));
  ok('the left panel hides and comes back',
     wasShown && hid && S.panel === true &&
     getComputedStyle(asideEl).display !== 'none' &&
     !!document.getElementById('btn-panel'));

  const keepPageId = pageId, keepPageObj = pageById(pageId);
  const mainIds = nodes.map(n => n.id).join();
  addPage('Invoices');
  ok('a new page starts empty and takes over',
     nodes.length === 0 && pages.length === 2 && pageId !== keepPageId &&
     document.querySelectorAll('#pages .page-tab').length === 2);
  nodes.push({ id:'ip1', kind:'box', title:'Invoice', sub:'', color:null, tcolor:null,
    scolor:null, fs:1, x:100, y:100, w:180, h:100 });
  render(); saveNow(true);
  switchPage(keepPageId);
  ok('pages keep their own shapes',
     nodes.map(n => n.id).join() === mainIds && !nodes.some(n => n.id === 'ip1'));
  const savedPages = JSON.parse(localStorage.getItem(KEY));
  ok('pagination is autosaved',
     Array.isArray(savedPages.pages) && savedPages.pages.length === 2 &&
     savedPages.pages.some(p => p.nodes.some(n => n.id === 'ip1')));
  const pageDoc = parseDoc(docJSON());
  ok('pages survive the document round-trip',
     pageDoc.pages.length === 2 && pageDoc.page === pageId &&
     pageDoc.pages.some(p => p.nodes.some(n => n.id === 'ip1')));
  window.dispatchEvent(new KeyboardEvent('keydown', { key:'ArrowRight', altKey:true }));
  ok('option-arrow moves between pages', pageId !== keepPageId);
  addPage('Scratch');
  const scratchId = pageId;
  deletePage(scratchId);
  ok('an empty page can be deleted again', !pages.some(p => p.id === scratchId));
  switchPage(keepPageId);
  pages = [keepPageObj];
  pageId = keepPageId;
  document.body.dataset.sticky = '0';
  renderPages(); render();
  ok('one page is left after cleanup', pages.length === 1);

  const stepRow = document.querySelector('.step-row');
  const stepDel = stepRow && stepRow.querySelector('button.del');
  ok('the step delete button is marked destructive',
     !!stepDel && stepDel.className === 'del' &&
     getComputedStyle(stepDel).color !== getComputedStyle(stepRow.querySelector('button')).color);
  nodes.pop(); renderStepsMenu();

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
  ok('arrow label size', !!lb2 && lb2.getAttribute('font-size') === '32');
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

  S.selNodes = []; S.selLinks = [lnk.id]; render();
  const anchorFrom = anchors(byId(lnk.from), byId(lnk.to), lnk).p1;
  const repl = byId('repl');
  const linkCount = links.length;
  send('pointerdown', { x:anchorFrom.x + 9, y:anchorFrom.y });
  send('pointermove', { x:repl.x + repl.w/2, y:repl.y + repl.h/2 });
  send('pointerup', { x:repl.x + repl.w/2, y:repl.y + repl.h/2 });
  ok('re-point near endpoint', links.length === linkCount && lnk.from === 'repl');
  S.selLinks = [];

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
  const accentBefore = links.find(l => l.id === lnk.id).color;
  box.color = '#E03131';
  delete links.find(l => l.id === lnk.id).color;
  render();
  const plainPath = stage.querySelector(
    `[data-link="${lnk.id}"] path:not(.linkhit):not(.ui)`);
  const staysNeutral = plainPath && plainPath.getAttribute('stroke') === LINE;
  links.find(l => l.id === lnk.id).color = accentBefore;
  render();
  ok('arrows keep their own colour, not the shape accent', staysNeutral);

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
  const dotEl = motionEls[0];
  dotEl.el.setAttribute('cx', '');
  tickFrame(performance.now() + 200);
  tickFrame(performance.now() + 600);
  const dotMoved = dotEl.el.getAttribute('cx') !== '' &&
                   Number.isFinite(Number(dotEl.el.getAttribute('cx')));
  ok('dots travel along their arrows', dotMoved && dotEl.el.getAttribute('opacity') === '.9');
  setMotion('live');
  const comets = stage.querySelectorAll('path.comet');
  const halos = stage.querySelectorAll('path.comet-halo');
  const cometDash = comets[0] && comets[0].getAttribute('stroke-dasharray');
  ok('live motion draws a travelling comet',
     comets.length === links.length && halos.length === links.length &&
     !!cometDash && cometDash.split(' ').length === 2 &&
     comets[0].getAnimations().length === 1 &&
     Number(comets[0].getAttribute('data-lap')) > 20);
  setMotion('off');
  ok('leaving live removes the comets', stage.querySelectorAll('path.comet').length === 0);

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
  ok('drag a swatch tints a card', box.fill === sw2.dataset.hex && box.tint === true);
  S.paint = prevPaint;

  const keptFill = box.fill;
  box.fill = null;
  S.selNodes = [box.id]; S.selLinks = [];
  S.paint = 'tint';
  applyColor('#08829C');
  S.selNodes = [];
  render();
  const trect = stage.querySelector(`g.node[data-id="${box.id}"] rect`);
  ok('tinted card', !!trect && trect.getAttribute('fill') === pastel('#08829C'));
  box.color = '#E03131';
  render();
  const combo = stage.querySelector(`g.node[data-id="${box.id}"] rect`);
  ok('outline and tint keep separate colours',
     box.fill === '#08829C' && box.tint === true &&
     combo.getAttribute('fill') === pastel('#08829C') &&
     combo.getAttribute('stroke') === '#E03131');
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
  clearSel(); setTool('hand', 'draw'); render();
  const vx0 = view.x, vy0 = view.y;
  send('pointerdown', { x:600, y:600 });
  send('pointermove', { x:660, y:640 });
  send('pointerup', { x:660, y:640 });
  ok('hand tool pans without selecting',
     view.x === vx0 + 60 && view.y === vy0 + 40 && S.selNodes.length === 0);
  setTool('select', 'draw'); render();

  setTool('box', 'draw');
  drag({x:zone.x+40,y:zone.y+40},{x:zone.x+240,y:zone.y+160});
  const kid = nodes[nodes.length-1];
  setTool('select', 'draw');
  selectNodes([zone.id], false);
  render();
  const zw = zone.w, kw = kid.w, kx = kid.x, ky = kid.y, kh = kid.h;
  drag({x:zone.x+zone.w,y:zone.y+zone.h},{x:zone.x+zone.w+120,y:zone.y+zone.h+80});
  ok('zone resize leaves children alone',
    zone.w >= zw+100 && zone.h >= 240 &&
    kid.w === kw && kid.h === kh && kid.x === kx && kid.y === ky);

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
  const bandLabel = zbG && zbG.querySelector('[data-role="zone-band-label"]');
  ok('zone band keeps the caps of a plain zone',
     !!bandLabel && bandLabel.textContent === 'VPC');
  nodes.pop(); render();

  const hitText = { id:'ht1', kind:'text', title:'notes', sub:'', color:null, tcolor:null,
    scolor:null, fs:1, x:100, y:1700, w:160, h:26 };
  const hitArrow = { id:'ha1', kind:'arrow', title:'', sub:'', color:null, tcolor:null,
    scolor:null, fs:1, x:0, y:1713, w:400, h:0 };
  nodes.push(hitText, hitArrow); render();
  ok('clicking text over an arrow picks the text',
     nodeAt({ x:170, y:1713 }, 0) === hitText);
  render();
  const arrowEl = stage.querySelector(`[data-link="${hitArrow.id}"]`);
  const at = { x:170, y:1713 };
  send('pointerdown', at, arrowEl); send('pointerup', at, arrowEl);
  ok('a click on a note keeps the text, not the arrow behind it',
     S.selNodes.includes(hitText.id) && !S.selLinks.includes(hitArrow.id));
  S.selNodes = []; S.selLinks = []; render();
  nodes.pop(); nodes.pop(); render();

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
  const sbar = document.getElementById('stylebar');
  ok('style bar follows the selection',
     getComputedStyle(sbar).display === 'block' &&
     document.getElementById('swatches').children.length > 12 &&
     getComputedStyle(document.getElementById('paint')).display !== 'none');
  ok('inspector is gone', !document.getElementById('i-x'));
  setTool('box', 'draw');
  ok('style bar steps out of the way while drawing',
     getComputedStyle(document.getElementById('stylebar')).display === 'none');
  setTool('select', 'draw');
  render();
  S.selNodes = [box.id]; S.selLinks = []; render();
  const sbRect = sbar.getBoundingClientRect();
  ok('style bar docks at the top right',
     sbRect.right <= window.innerWidth && sbRect.right > window.innerWidth - 60 &&
     sbRect.top < 140);
  const openMenus = () => ['steps-menu','demo-menu','menu']
    .filter(id => document.getElementById(id).classList.contains('on'));
  const menuFor = { 'btn-steps':'steps-menu', 'btn-demo':'demo-menu', 'btn-file':'menu' };
  let menuOk = true, fileClipped = 0;
  Object.keys(menuFor).forEach(id => {
    document.getElementById(id).click();
    const open = openMenus();
    if (open.length !== 1 || open[0] !== menuFor[id]) menuOk = false;
    if (id === 'btn-file')
      fileClipped = Array.from(document.querySelectorAll('#menu button'))
        .filter(btn => btn.scrollWidth > btn.clientWidth + 1).length;
  });
  const fileRight = document.getElementById('menu').getBoundingClientRect().right;
  document.body.click();
  ok('only one top menu opens at a time', menuOk && openMenus().length === 0);
  ok('file menu fits its labels on screen',
     fileClipped === 0 && fileRight <= window.innerWidth);
  const firstLink = links[0];
  S.selNodes = []; S.selLinks = [firstLink.id]; render();
  ok('style bar serves arrows too',
     getComputedStyle(sbar).display === 'block' &&
     document.getElementById('paint').style.display === 'none');
  S.selNodes = []; S.selLinks = []; render();
  ok('style bar hides without a selection',
     getComputedStyle(sbar).display === 'none');
  const toolBtn = document.querySelector('#tools button[data-tool="select"]');
  setTool('box', 'draw');
  const boxBtn = document.querySelector('#tools button[data-tool="box"]');
  const ariaTools = toolBtn.getAttribute('aria-label') === 'Select' &&
    toolBtn.getAttribute('aria-pressed') === 'false' &&
    boxBtn.getAttribute('aria-pressed') === 'true';
  setTool('select', 'draw');
  const swFocus = document.querySelector('#swatches .sw');
  const swAria = swFocus.getAttribute('role') === 'button' && swFocus.tabIndex === 0 &&
    /colour|no colour/.test(swFocus.getAttribute('aria-label') || '');
  const paintAria = Array.from(document.querySelectorAll('#paint button'))
    .every(b => !!b.getAttribute('aria-label') && !!b.hasAttribute('aria-pressed'));
  ok('controls expose labels and pressed state', ariaTools && swAria && paintAria);
  S.selNodes = [box.id]; S.paint = 'line'; render();
  swFocus.focus();
  const keyHex = swFocus.dataset.hex;
  swFocus.dispatchEvent(new KeyboardEvent('keydown', { key:'Enter', bubbles:true }));
  const keyPainted = keyHex ? box.color === keyHex : box.color == null;
  S.selNodes = []; render();
  ok('swatches work from the keyboard', keyPainted && document.activeElement === swFocus);
  setPresent(true);
  const stepsTotal = presentSteps.length;
  window.dispatchEvent(new KeyboardEvent('keydown', { key:'2' }));
  const jumped = presentIndex === Math.min(1, stepsTotal - 1);
  window.dispatchEvent(new KeyboardEvent('keydown', { key:'0' }));
  const backToOverview = presentIndex === 0;
  setPresent(false);
  ok('number keys jump to a step in present mode', jumped && backToOverview);

  setPresent(true);
  const asideHidden = getComputedStyle(document.querySelector('aside')).display === 'none';
  ok('present mode', document.body.classList.contains('present') && asideHidden);

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

  const lintN = nodes, lintL = links;
  nodes = [
    { id:'LX', kind:'box', title:'A', sub:'', color:null, tcolor:null, scolor:null,
      fill:null, fs:1, x:100, y:100, w:180, h:110 },
    { id:'LY', kind:'box', title:'B', sub:'', color:null, tcolor:null, scolor:null,
      fill:null, fs:1, x:700, y:100, w:180, h:110 },
    { id:'LZ', kind:'box', title:'wall', sub:'', color:null, tcolor:null, scolor:null,
      fill:null, fs:1, x:380, y:60, w:160, h:180 },
    { id:'LW', kind:'box', title:'supercalifragilisticexpialidocious', sub:'', color:null,
      tcolor:null, scolor:null, fill:null, fs:1, x:100, y:400, w:140, h:80 },
    { id:'LC', kind:'box', title:'one two three four five six seven eight', sub:'', color:null,
      tcolor:null, scolor:null, fill:null, fs:1, x:100, y:560, w:140, h:80 }
  ];
  links = [{ id:'lk1', from:'LX', to:'LY', color:null, motion:null, label:'',
    way:null, head:true, fromSide:'e', fromT:0.5, toSide:'w', toT:0.5 }];
  render();
  const li = lintIssues();
  ok('lint flags text outside the shape',
    li.some(i => i.id === 'LW' && i.type === 'text' && /outside/.test(i.msg)));
  ok('lint flags cut-off text',
    li.some(i => i.id === 'LC' && i.type === 'text' && /cut/.test(i.msg)));
  ok('lint flags an arrow crossing a shape',
    li.some(i => i.id === 'lk1' && i.type === 'cross'));
  nodes = nodes.filter(n => n.id !== 'LZ');
  render();
  ok('lint stays quiet without the crossing',
    !lintIssues().some(i => i.type === 'cross'));
  syncLint();
  const chip = document.getElementById('lint-chip');
  ok('lint chip lists the issues', !!chip && !chip.hidden && /LINT/.test(chip.textContent));
  chip.click();
  ok('lint chip click selects the offender',
    S.selNodes.length === 1 && lintList.some(i => i.id === S.selNodes[0]));
  nodes = lintN;
  links = lintL;
  render();

  const TXT = [
    '# a comment',
    'dir: right',
    'zone Azure:',
    '  dir: down',
    '  card Gateway:',
    '    sub: entry point',
    '  card API',
    '  db Events:',
      '    brand: kafka',
      'db Postgres:',
      '  brand: postgres',
    '  tint: true',
    'Gateway -> API',
    'API -> Postgres: reads',
    'Gateway -- Events'
  ].join('\n');
  const TXT_ERRORS = [
    ['duplicate name', 'card A\ncard A'],
    ['unknown kind', 'widget A'],
    ['missing arrow target', 'card A\nA -> B'],
    ['tab indent', 'card A:\n\tsub: x'],
    ['unknown prop', 'card A:\n  sn: x'],
    ['nameless shape', 'card:']
  ];
  let tParse = null;
  try { tParse = parseText(TXT); }
  catch (e){ tParse = 'threw: ' + e.message; }
  const tOk = Array.isArray(tParse && tParse.shapes);
  const tShapes = tOk ? tParse.shapes : [];
  const tFind = name => tShapes.find(s => s.name === name) || { props:{} };
  ok('text parser reads shapes and props', tOk &&
     tShapes.length === 5 &&
     tFind('Gateway').kind === 'box' && tFind('Gateway').props.sub === 'entry point' &&
     tFind('Events').kind === 'store' && tFind('Events').props.brand === 'kafka' &&
     tFind('Postgres').props.tint === true &&
     tFind('Azure').kind === 'zone' && tFind('Azure').props.dir === 'down' &&
     tParse.dir === 'right');
  ok('text parser reads arrows', tOk && tParse.links.length === 3 &&
     tParse.links[0].from === 'Gateway' && tParse.links[0].to === 'API' &&
     tParse.links[1].label === 'reads' && tParse.links[2].head === false);
  ok('arrow motion accepts live',
     parseText('card A\ncard B\nA -> B:\n  motion: live').links[0].motion === 'live');
  ok('text parser reads arrow props',
     parseText('card A\ncard B\nA -> B:\n  color: "#4263EB"\n  dash: true\n  motion: dots')
       .links[0].color === '#4263EB' &&
     parseText('card A\ncard B\nA -> B:\n  dash: true').links[0].dash === true &&
     parseText('card A\ncard B\nA <-> B:\n  motion: both')
       .links.every(l => l.motion === 'both') &&
     parseText('card A\ncard B\ncard C\ncard D\nA -> B\nC -> D:\n  color: "#099268"')
       .links[0].color == null);
  ok('text arrow props reach the document', (() => {
    const d = textDoc('card A\ncard B\nA -> B:\n  color: "#4263EB"\n  motion: dashes\n  dash: true');
    const l = d.links[0];
    if (!(l.color === '#4263EB' && l.motion === 'dashes' && l.dash === true)) return false;
    const r = parseDoc(JSON.stringify(d));
    const rl = r.links[0];
    return rl.color === '#4263EB' && rl.motion === 'dashes' && rl.dash === true;
  })());
  let tArrowBad = 0;
  for (const [what, src] of [
    ['bad arrow colour', 'card A\ncard B\nA -> B:\n  color: red'],
    ['bad arrow motion', 'card A\ncard B\nA -> B:\n  motion: sideways'],
    ['bad arrow dash', 'card A\ncard B\nA -> B:\n  dash: maybe'],
    ['unknown arrow prop', 'card A\ncard B\nA -> B:\n  speed: fast'],
    ['shape under arrow', 'card A\ncard B\nA -> B:\n  card C']
  ]){
    let threw = '';
    try { parseText(src); } catch (e){ threw = e.message; }
    if (threw) tArrowBad++;
    else console.log('arrow error miss:', what);
  }
  ok('text parser rejects bad arrow props', tArrowBad === 5);
  ok('text parser reads colonless props',
     parseText('card A:\n  brand kafka\ncard B\nA -> B').shapes[0].props.brand === 'kafka');
  ok('text parser reads colour props',
     parseText('card A:\n  color: "#4263EB"\n  fill: "#F6B26B"\ncard B\nA -> B')
       .shapes[0].props.fill === '#F6B26B' &&
     parseText('zone Z:\n  color: "#F6B26B"\n  card A\ncard B\nA -> B')
       .shapes[0].props.color === '#F6B26B');
  let tBad = 0;
  for (const [what, src] of TXT_ERRORS){
    let threw = '';
    try { parseText(src); } catch (e){ threw = e.message; }
    if (threw) tBad++;
    else console.log('text error miss:', what);
  }
  ok('text parser rejects the six bad inputs', tBad === TXT_ERRORS.length);
  let tRound = null;
  try { tRound = parseDoc(JSON.stringify(textDoc(TXT))); }
  catch (e){ tRound = null; }
  ok('text document passes the trust boundary', !!tRound &&
     tRound.nodes.length === 5 && tRound.links.length === 3);
  const tZone = tRound && tRound.nodes.find(n => n.id === 'azure');
  const tInside = ['gateway','api','events'].every(idn => {
    const c = tRound.nodes.find(n => n.id === idn);
    return c.x >= tZone.x && c.y >= tZone.y &&
           c.x + c.w <= tZone.x + tZone.w && c.y + c.h <= tZone.y + tZone.h;
  });
  ok('text layout packs the zone around its children', !!tZone &&
     tZone.w > 300 && tZone.h > 200 && tInside);
  const tOver = (() => {
    const list = tRound.nodes.filter(n => n.kind !== 'zone');
    for (let i = 0; i < list.length; i++)
      for (let j = i + 1; j < list.length; j++){
        const a = list[i], b = list[j];
        if (a.x < b.x + b.w && b.x < a.x + a.w &&
            a.y < b.y + b.h && b.y < a.y + b.h) return true;
      }
    return false;
  })();
  ok('text layout never overlaps shapes', !tOver);
  const tFlow = textDoc('card A\ncard B\nA -> B');
  const tA = tFlow.nodes.find(n => n.title === 'A');
  const tB = tFlow.nodes.find(n => n.title === 'B');
  ok('text layout flows right by default', tB.x > tA.x && Math.abs(tB.y - tA.y) < 1);
  const tDown = textDoc('dir: down\ncard A\ncard B\nA -> B');
  const tDA = tDown.nodes.find(n => n.title === 'A');
  const tDB = tDown.nodes.find(n => n.title === 'B');
  ok('text layout flows down on request', tDB.y > tDA.y);
  const tPin = textDoc('card A:\n  x: 500\n  y: 300\ncard B\nA -> B');
  const tWide = textDoc('card A:\n  w: 320\ncard B\nA -> B');
  ok('text layout honours a lone width',
     tWide.nodes[0].w === 320 && tWide.nodes[0].h === SIZE.box[1]);
  ok('text layout respects explicit coordinates',
     tPin.nodes[0].x === 500 && tPin.nodes[0].y === 300);
  ok('text layout is deterministic',
     JSON.stringify(textDoc(TXT)) === JSON.stringify(textDoc(TXT)));
  const tFan = textDoc('card A\ncard B\ncard C\nA -> B\nA -> C');
  const yCtr = (d, t) => {
    const n = d.nodes.find(x => x.title === t);
    return n.y + n.h / 2;
  };
  ok('text layout aligns shapes to their neighbours',
     Math.abs((yCtr(tFan, 'B') + yCtr(tFan, 'C')) / 2 - yCtr(tFan, 'A')) < 2 &&
     Math.abs(yCtr(textDoc('card A\ndb B\nA -> B'), 'A') -
              yCtr(textDoc('card A\ndb B\nA -> B'), 'B')) < 2);
  const tHead = textDoc('title: Mock Pipeline\nsubtitle: three sources\ncard A\ncard B\nA -> B');
  const hTitle = tHead.nodes.find(n => n.kind === 'heading');
  const hSub = tHead.nodes.find(n => n.kind === 'text');
  const hA = tHead.nodes.find(n => n.title === 'A');
  ok('text header renders title and subtitle above the diagram',
     !!hTitle && hTitle.title === 'Mock Pipeline' && hTitle.align === 'center' &&
     !!hSub && hSub.title === 'three sources' &&
     hTitle.y < hSub.y && hSub.y + hSub.h <= hA.y && hTitle.w >= hA.w);
  const hRound = parseDoc(JSON.stringify(tHead));
  ok('text header survives the trust boundary',
     hRound.nodes.filter(n => n.kind === 'heading').length === 1 &&
     hRound.nodes.filter(n => n.kind === 'text').length === 1);
  let tHeadBad = 0;
  for (const src of ['title:\ncard A', 'subtitle:\ncard A'])
    try { parseText(src); } catch (e){ tHeadBad++; }
  ok('text parser rejects an empty title or subtitle', tHeadBad === 2);
  const tTheme = textDoc('theme: data\ndb Orders\ncard Card A\nqueue Events\nOrders -> Card A');
  const thDb = tTheme.nodes.find(n => n.title === 'Orders');
  const thCard = tTheme.nodes.find(n => n.title === 'Card A');
  const thQ = tTheme.nodes.find(n => n.title === 'Events');
  ok('theme data tones shapes by kind',
     thDb.color === '#099268' && thQ.color === '#F76707' && thCard.color === null &&
     textDoc('db Orders\ncard Card A\nOrders -> Card A').nodes[0].color === null);
  let thBad = 0;
  try { parseText('theme: neon\ncard A'); } catch (e){ thBad++; }
  ok('theme rejects unknown palettes', thBad === 1);

  setTimeout(() => {
    render();
    setTimeout(async () => {
      let saved = false;
      try {
        const raw = localStorage.getItem('yoruma.doc.v1');
        saved = !!raw && JSON.parse(raw).nodes.length === nodes.length;
      } catch (e){}
      ok('document saved', saved);

      const got = { dl: [], toasts: [], clip: [] };
      const realDownload = window.download, realToast = window.toast;
      window.download = (name, blob) => got.dl.push({ name, blob });
      window.toast = m => got.toasts.push(m);
      const realWrite = navigator.clipboard && navigator.clipboard.write;
      if (navigator.clipboard)
        navigator.clipboard.write = items => (got.clip.push(items), Promise.resolve());
      const btn = x => document.querySelector('#menu button[data-x="' + x + '"]');
      btn('webp').click();
      await new Promise(r => setTimeout(r, 250));
      btn('png-copy').click();
      await new Promise(r => setTimeout(r, 250));
      window.download = realDownload;
      window.toast = realToast;
      if (navigator.clipboard && realWrite) navigator.clipboard.write = realWrite;
      const wb = got.dl.find(d => d.name === 'yoruma.webp');
      const cp = got.clip[0] && got.clip[0][0];
      const dropKeepN = nodes, dropKeepL = links;
      nodes = []; links = []; render();
      const dt = new DataTransfer();
      dt.items.add(new File(['card Dropped\ncard Next\nDropped -> Next'], 'dropped.yaml',
        { type:'text/yaml' }));
      stage.dispatchEvent(new DragEvent('drop',
        { bubbles:true, cancelable:true, dataTransfer:dt }));
      await new Promise(r => setTimeout(r, 200));
      const droppedOk = nodes.some(n => n.title === 'Dropped') && nodes.some(n => n.title === 'Next');
      ok('dropping a text file opens it', droppedOk);
      nodes = dropKeepN; links = dropKeepL; render();

      ok('webp export and png clipboard copy',
         !!wb && wb.blob.type === 'image/webp' && got.toasts.includes('webp downloaded') &&
         !!cp && [...cp.types].includes('image/png') &&
         got.toasts.includes('image copied to clipboard'));

      const selKeepN = nodes, selKeepL = links;
      const selKeepSel = { nodes:S.selNodes.slice(), links:S.selLinks.slice() };
      nodes = [
        { id:'sa', kind:'box', title:'A', sub:'', color:null, tcolor:null, scolor:null,
          fs:1, x:100, y:100, w:180, h:100 },
        { id:'sb', kind:'box', title:'B', sub:'', color:null, tcolor:null, scolor:null,
          fs:1, x:400, y:100, w:180, h:100 },
        { id:'sc', kind:'box', title:'C', sub:'', color:null, tcolor:null, scolor:null,
          fs:1, x:800, y:400, w:180, h:100 }
      ];
      links = [{ id:'sk', from:'sa', to:'sb', label:'', color:null, motion:null, way:null }];
      S.selNodes = ['sa','sb']; S.selLinks = [];
      render();
      const selSvg = await buildSVG({ sel:true });
      const allSvg = await buildSVG();
      ok('the selection export carries only what is selected',
         /data-id="sa"/.test(selSvg) && /data-id="sb"/.test(selSvg) &&
         !/data-id="sc"/.test(selSvg) && /data-link="sk"/.test(selSvg) &&
         /data-id="sc"/.test(allSvg) && selSvg.length < allSvg.length);
      S.selNodes = selKeepSel.nodes; S.selLinks = selKeepSel.links;
      nodes = selKeepN; links = selKeepL; render();

      const keepN = nodes, keepL = links, keepMotion = S.motion;
      nodes = [
        { id:'sa', kind:'box', title:'A', sub:'', color:null, tcolor:null, scolor:null,
          fs:1, x:100, y:100, w:180, h:110 },
        { id:'sb', kind:'box', title:'B', sub:'', color:null, tcolor:null, scolor:null,
          fs:1, x:600, y:100, w:180, h:110 }
      ];
      links = [{ id:'sk', from:'sa', to:'sb', label:'', color:null, motion:'dots', way:null }];
      S.selNodes = []; S.selLinks = []; S.motion = 'off';
      render();
      const dotSvg = await buildSVG();
      links[0].motion = 'off';
      render();
      const plainSvg = await buildSVG();
      ok('dots animate in the exported svg',
         /<animateMotion/.test(dotSvg) && /<mpath/.test(dotSvg) &&
         /yoruma-mp0/.test(dotSvg) && !/<animateMotion/.test(plainSvg));
      nodes = keepN; links = keepL; S.motion = keepMotion; render();

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
      setPresent(false);
      fit();
      render();
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
