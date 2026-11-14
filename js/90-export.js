/* ---------- export ---------- */
const menu = document.getElementById('menu');
document.getElementById('btn-file').addEventListener('click', ev => {
  ev.stopPropagation();
  closeTopMenus(menu.classList.contains('on') ? null : 'menu');
  menu.classList.toggle('on');
});
menu.addEventListener('click', ev => ev.stopPropagation());
document.addEventListener('click', () => menu.classList.remove('on'));

function diagramId(n){
  return 'n_' + String(n.id).replace(/[^a-zA-Z0-9]/g, '_');
}
function diagramSkip(n){
  return n.kind === 'zone' || n.kind === 'frame';
}
function mermaidLabel(t){
  return String(t == null ? '' : t)
    .replace(/["\[\]{}|<>`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function mermaid(){
  const lines = ['flowchart LR'];
  nodes.forEach(n => {
    if (diagramSkip(n)) return;
    const t = mermaidLabel(n.title), s = mermaidLabel(n.sub);
    const label = t + (s ? '<br/>' + s : '');
    const wrap = n.kind === 'store' ? `[("${label}")]`
      : n.kind === 'queue' ? `[["${label}"]]`
      : n.kind === 'cloud' ? `("${label}")`
      : n.kind === 'people' ? `(["${label}"])` : `["${label}"]`;
    lines.push('  ' + diagramId(n) + wrap);
  });
  links.forEach(l => {
    const a = byId(l.from), b = byId(l.to);
    if (!a || !b || diagramSkip(a) || diagramSkip(b)) return;
    const lab = mermaidLabel(l.label);
    lines.push('  ' + diagramId(a) + ' -->' + (lab ? '|' + lab + '|' : '') + ' ' + diagramId(b));
  });
  return lines.join('\n');
}
function d2(){
  const map = { store:'cylinder', queue:'queue', cloud:'cloud', file:'document',
    people:'person', ellipse:'oval', dashboard:'stored_data', cube:'package',
    shield:'diamond', api:'hexagon' };
  const out = ['direction: right', ''];
  nodes.forEach(n => {
    if (diagramSkip(n)) return;
    const label = mermaidLabel(n.title).replace(/"/g, "'");
    const sub = n.sub ? '\\n' + mermaidLabel(n.sub).replace(/"/g, "'") : '';
    const t = map[n.kind];
    out.push(`${diagramId(n)}: "${label}${sub}"${t ? ` { shape: ${t} }` : ''}`);
  });
  links.forEach(l => {
    const a = byId(l.from), b = byId(l.to);
    if (!a || !b || diagramSkip(a) || diagramSkip(b)) return;
    const lab = mermaidLabel(l.label).replace(/"/g, "'");
    out.push(`${diagramId(a)} -> ${diagramId(b)}${lab ? ': "' + lab + '"' : ''}`);
  });
  return out.join('\n');
}
function docJSON(){
  syncPage();
  return JSON.stringify({
    format:'yoruma', version:1, savedAt:new Date().toISOString(),
    motion:S.motion, view:{ x:view.x, y:view.y, k:view.k }, nodes, links,
    pages, page: pageId
  }, null, 2);
}


/* ---------- draw.io ---------- */
/* Two flavours: an editable mxGraph model that maps yoruma shapes to draw.io
   primitives, and a one-cell image file that carries the SVG pixel for pixel. */
function xmlEsc(s){
  return String(s == null ? '' : s).replace(/[&<>"]/g, c =>
    ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
}
function drawioHtml(n){
  const t = n.title || '', s = n.sub || '';
  if (!t && !s) return '';
  return (t ? '<b>' + t + '</b>' : '') +
    (s ? (t ? '<br>' : '') + '<font style="font-size:10px">' + s + '</font>' : '');
}
function drawioColor(n){
  return n.color || '#657486';
}
function drawioLogoUri(n){
  if (!n.mono || !/^data:/i.test(n.logo || '')) return n.logo || '';
  try {
    const comma = n.logo.indexOf(',');
    const head = n.logo.slice(0, comma), tail = n.logo.slice(comma + 1);
    const svg = /;base64/i.test(head) ? atob(tail) : decodeURIComponent(tail);
    const tinted = svg.replace(/currentColor/g, drawioColor(n));
    return 'data:image/svg+xml;base64,' +
      toB64(new TextEncoder().encode(tinted));
  } catch (e){ return n.logo; }
}
function drawioStyle(n){
  if (n.kind === 'zone'){
    const c = drawioColor(n);
    return 'swimlane;container=1;collapsible=0;startSize=26;rounded=1;arcSize=6;' +
      (n.solid ? 'dashed=0;' : 'dashed=1;') +
      'fillColor=none;strokeColor=' + c + ';fontColor=' + (n.tcolor || c) +
      ';fontStyle=1;fontSize=11;html=0;align=left;spacingLeft=10;';
  }
  const c = drawioColor(n);
  const fill = n.tint ? (typeof pastel === 'function' ? pastel(c) : '#E6EDF2') : '#E6EDF2';
  const base = 'html=1;whiteSpace=wrap;strokeColor=' + c +
    ';strokeWidth=1.4;fillColor=' + fill +
    ';fontColor=#2D3141;fontSize=12;fontFamily=DM Sans;';
  if (n.kind === 'image' && n.src)
    return 'shape=image;image=' + (n.src || '') +
      ';imageAspect=1;html=1;verticalLabelPosition=bottom;verticalAlign=top;fontSize=10;';
  if (n.kind === 'logo' && /^data:/i.test(n.logo || ''))
    return 'shape=image;image=' + drawioLogoUri(n) +
      ';imageAspect=1;html=1;verticalLabelPosition=bottom;verticalAlign=top;fontSize=10;';
  switch (n.kind){
    case 'store': return 'shape=cylinder3;boundedLbl=1;backgroundOutline=1;size=14;' + base;
    case 'queue': return 'shape=process;backgroundOutline=1;' + base;
    case 'cloud': return 'ellipse;shape=cloud;' + base;
    case 'file': return 'shape=note;size=14;' + base;
    case 'people': return 'shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;' + base;
    case 'ellipse': return 'ellipse;' + base;
    case 'shield': case 'contract': case 'agent':
      return 'shape=hexagon;perimeter=hexagonPerimeter2;fixedSize=1;size=10;' + base;
    case 'text': return 'text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;' +
      'html=1;fontSize=14;fontColor=#2D3141;';
    case 'heading': return 'text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;' +
      'html=1;fontSize=18;fontStyle=1;fontColor=#2D3141;';
    case 'tile': return 'rounded=1;arcSize=22;fillColor=' + tileHue(n) +
      ';strokeColor=none;fontColor=#FFFFFF;html=1;fontSize=10;';
    case 'api': return 'rounded=1;arcSize=10;' + base;
    case 'video': case 'media': case 'table': return 'rounded=0;' + base;
    default: return 'rounded=1;arcSize=8;' + base;
  }
}
function drawioModel(cells, width, height, name){
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<mxfile host="yoruma" agent="yoruma" type="device">\n' +
    '  <diagram id="' + xmlEsc(pageId || 'p1') + '" name="' + xmlEsc(name) + '">\n' +
    '    <mxGraphModel dx="' + width + '" dy="' + height + '" grid="1" gridSize="10" ' +
    'guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" ' +
    'pageWidth="' + width + '" pageHeight="' + height + '" math="0" shadow="0">\n' +
    '      <root>\n' +
    '        <mxCell id="0"/>\n' +
    '        <mxCell id="1" parent="0"/>\n' +
    '        ' + cells.join('\n        ') + '\n' +
    '      </root>\n' +
    '    </mxGraphModel>\n' +
    '  </diagram>\n' +
    '</mxfile>\n';
}
function drawioXML(){
  const zones = nodes.filter(n => n.kind === 'zone');
  const area = z => z.w * z.h;
  const parentOf = n => {
    let best = null;
    zones.forEach(z => {
      if (z === n) return;
      if (n.x >= z.x && n.y >= z.y && n.x + n.w <= z.x + z.w &&
          n.y + n.h <= z.y + z.h && (!best || area(z) < area(best))) best = z;
    });
    return best;
  };
  const b = contentBBox(), pad = 48;
  const offX = pad - b.x, offY = pad - b.y;
  const width = Math.round(b.w + pad * 2), height = Math.round(b.h + pad * 2);
  const cells = [];
  const emit = n => {
    const p = parentOf(n);
    const x = p ? n.x - p.x : n.x + offX;
    const y = p ? n.y - p.y : n.y + offY;
    const value = n.kind === 'zone'
      ? xmlEsc([n.title, n.sub].filter(Boolean).join(' · '))
      : xmlEsc(drawioHtml(n));
    cells.push('<mxCell id="' + xmlEsc(n.id) + '" value="' + value +
      '" style="' + xmlEsc(drawioStyle(n)) + '" vertex="1" parent="' +
      (p ? xmlEsc(p.id) : '1') + '"><mxGeometry x="' + x + '" y="' + y +
      '" width="' + n.w + '" height="' + n.h + '" as="geometry"/></mxCell>');
    if (n.kind === 'zone' && n.logo){
      cells.push('<mxCell id="' + xmlEsc(n.id) + '_logo" value="" ' +
        'style="shape=image;image=' + drawioLogoUri(n) +
        ';imageAspect=1;html=1;" vertex="1" parent="' + xmlEsc(n.id) +
        '"><mxGeometry x="10" y="8" width="18" height="18" as="geometry"/></mxCell>');
    }
  };
  zones.slice().sort((a, b2) => area(b2) - area(a)).forEach(emit);
  nodes.forEach(n => {
    if (n.kind === 'zone' || n.kind === 'frame') return;
    emit(n);
  });
  links.forEach(l => {
    if (!byId(l.from) || !byId(l.to)) return;
    const c = l.color || '#657486';
    const lw = l.lw || 1.5;
    let style = 'edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;strokeColor=' + c +
      ';strokeWidth=' + lw + ';fontSize=10;fontColor=#2D3141;labelBackgroundColor=#CFDDE6;';
    style += l.head === false ? 'endArrow=none;' : 'endArrow=block;endFill=1;';
    if (l.headStart) style += 'startArrow=block;startFill=1;';
    if (l.dashed) style += 'dashed=1;';
    let geom = '<mxGeometry relative="1" as="geometry">';
    if (l.bends && l.bends.length){
      geom += '<Array as="points">' + l.bends.map(pt =>
        '<mxPoint x="' + (pt.x + offX) + '" y="' + (pt.y + offY) + '"/>').join('') +
        '</Array>';
    }
    geom += '</mxGeometry>';
    cells.push('<mxCell id="' + xmlEsc(l.id) + '" value="' + xmlEsc(l.label || '') +
      '" style="' + xmlEsc(style) + '" edge="1" parent="1" source="' +
      xmlEsc(l.from) + '" target="' + xmlEsc(l.to) + '">' + geom + '</mxCell>');
  });
  return drawioModel(cells, width, height, currentPage().name);
}
async function drawioImageXML(){
  const svg = await buildSVG();
  const b = contentBBox(), pad = 48;
  const width = Math.round(b.w + pad * 2), height = Math.round(b.h + pad * 2);
  const uri = 'data:image/svg+xml;base64,' +
    toB64(new TextEncoder().encode(svg));
  const cell = '<mxCell id="yoruma-svg" value="" style="shape=image;image=' +
    uri + ';imageAspect=1;html=1;" vertex="1" parent="1">' +
    '<mxGeometry x="0" y="0" width="' + width +
    '" height="' + height + '" as="geometry"/></mxCell>';
  return drawioModel([cell], width, height, currentPage().name);
}
