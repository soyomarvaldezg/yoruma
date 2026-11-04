/* ---------- open json ---------- */
const DOC_KINDS = new Set(Object.keys(SIZE));
const DOC_SIDES = new Set(['n','s','e','w']);
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const idOf = v => {
  const id = (typeof v === 'string' || typeof v === 'number') ? String(v) : '';
  return /^[A-Za-z0-9_-]{1,64}$/.test(id) ? id : null;
};
const docColor = v => typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v) ? v
  : (Number.isInteger(v) && v >= 0 && v < ACCENTS.length ? v : null);

function parseNode(raw){
  if (!raw || typeof raw !== 'object') throw new Error('shape is not an object');
  const id = idOf(raw.id);
  if (!id) throw new Error('shape without a valid id');
  if (typeof raw.kind !== 'string' || !DOC_KINDS.has(raw.kind))
    throw new Error('shape ' + id + ' has an unknown kind');
  if (!isNum(raw.x) || !isNum(raw.y) || !isNum(raw.w) || !isNum(raw.h) ||
      Math.abs(raw.x) > 1e7 || Math.abs(raw.y) > 1e7 ||
      raw.w <= 0 || raw.h <= 0 || raw.w > 1e7 || raw.h > 1e7)
    throw new Error('shape ' + id + ' has invalid geometry');
  const text = v => v == null ? '' : String(v).slice(0, 2000);
  const image = v => typeof v === 'string' && v.startsWith('data:image/') &&
    v.length <= IMG_MAX_CHARS ? v : undefined;
  const n = {
    id,
    kind: raw.kind,
    title: text(raw.title),
    sub: text(raw.sub),
    color: docColor(raw.color),
    tcolor: docColor(raw.tcolor),
    scolor: docColor(raw.scolor),
    fill: docColor(raw.fill),
    fs: isNum(raw.fs) && raw.fs > 0 ? Math.min(4, Math.max(0.4, raw.fs)) : 1,
    x: raw.x, y: raw.y, w: raw.w, h: raw.h,
    bold: raw.bold === true,
    italic: raw.italic === true,
    tint: raw.tint === true,
    flip: raw.flip === true
  };
  if (['left','center','right'].includes(raw.align)) n.align = raw.align;
  const src = image(raw.src), logo = image(raw.logo);
  if (src) n.src = src;
  if (logo) n.logo = logo;
  if (isNum(raw.step) && raw.step > 0 && raw.step < 1e6) n.step = Math.round(raw.step);
  if (raw.kind === 'frame' && Array.isArray(raw.members)){
    const members = Array.from(new Set(raw.members.filter(m => idOf(m)).map(idOf))).slice(0, 500);
    if (members.length) n.members = members;
  }
  return n;
}

function parseLink(raw, ids){
  if (!raw || typeof raw !== 'object') throw new Error('arrow is not an object');
  const id = idOf(raw.id);
  if (!id) throw new Error('arrow without a valid id');
  const from = idOf(raw.from), to = idOf(raw.to);
  if (!from || !to || !ids.has(from) || !ids.has(to))
    throw new Error('arrow ' + id + ' points to a missing shape');
  const way = raw.way && isNum(raw.way.x) && isNum(raw.way.y) &&
              Math.abs(raw.way.x) <= 1e7 && Math.abs(raw.way.y) <= 1e7
    ? { x: raw.way.x, y: raw.way.y } : null;
  return {
    ...raw,
    id, from, to,
    label: raw.label == null ? '' : String(raw.label),
    color: docColor(raw.color),
    motion: MODES.includes(raw.motion) ? raw.motion : null,
    head: raw.head !== false,
    headStart: raw.headStart === true,
    lw: isNum(raw.lw) && raw.lw > 0 && raw.lw <= 8 ? raw.lw : undefined,
    fs: isNum(raw.fs) && raw.fs > 0 ? Math.min(4, Math.max(0.4, raw.fs)) : 1,
    dash: raw.dash === true,
    way,
    fromSide: DOC_SIDES.has(raw.fromSide) ? raw.fromSide : null,
    toSide: DOC_SIDES.has(raw.toSide) ? raw.toSide : null,
    fromT: isNum(raw.fromT) ? Math.max(0, Math.min(1, raw.fromT)) : null,
    toT: isNum(raw.toT) ? Math.max(0, Math.min(1, raw.toT)) : null
  };
}

const DOC_MAX_CHARS = 8e6;
const DOC_MAX_ITEMS = 5000;
function parseDoc(text){
  const body = String(text).replace(/^\uFEFF/, '');
  if (body.length > DOC_MAX_CHARS) throw new Error('document is too large');
  let raw;
  try { raw = JSON.parse(body); }
  catch (e){ throw new Error('not valid JSON'); }
  if (!raw || typeof raw !== 'object') throw new Error('not a yoruma document');
  if (raw.format !== 'yoruma' || raw.version !== 1)
    throw new Error('not a version 1 yoruma document');
  if (!Array.isArray(raw.nodes) || !Array.isArray(raw.links))
    throw new Error('document has no nodes or links');
  if (raw.nodes.length > DOC_MAX_ITEMS || raw.links.length > DOC_MAX_ITEMS)
    throw new Error('document has too many shapes');
  const ids = new Set();
  const nextNodes = raw.nodes.map(rawN => {
    const n = parseNode(rawN);
    if (ids.has(n.id)) throw new Error('duplicate shape id ' + n.id);
    ids.add(n.id);
    return n;
  });
  nextNodes.forEach(n => {
    if (!n.members) return;
    n.members = n.members.filter(id => ids.has(id));
    if (!n.members.length) delete n.members;
  });
  const linkIds = new Set();
  const nextLinks = raw.links.map(rawL => {
    const l = parseLink(rawL, ids);
    if (linkIds.has(l.id)) throw new Error('duplicate arrow id ' + l.id);
    linkIds.add(l.id);
    return l;
  });
  const motion = MODES.includes(raw.motion) ? raw.motion : 'off';
  const view = raw.view && isNum(raw.view.x) && isNum(raw.view.y) &&
               isNum(raw.view.k) && raw.view.k > 0 &&
               Math.abs(raw.view.x) <= 1e7 && Math.abs(raw.view.y) <= 1e7
    ? { x: raw.view.x, y: raw.view.y, k: Math.min(3, Math.max(0.2, raw.view.k)) }
    : null;
  return { nodes: nextNodes, links: nextLinks, motion, view };
}

function loadDoc(doc){
  nodes = doc.nodes;
  links = doc.links;
  S.motion = doc.motion;
  S.selNodes = []; S.selLinks = [];
  hoverId = null;
  lastHit = { id:null, t:0 };
  setTool('select', 'draw');
  [...nodes, ...links].forEach(o => {
    const m = /(\d+)$/.exec(String(o.id));
    if (m) uid = Math.max(uid, +m[1] + 1);
  });
  render();
  if (doc.view){
    view.x = doc.view.x; view.y = doc.view.y; view.k = doc.view.k;
    applyView();
  } else fit();
  return saveNow(true);
}

function importText(text, name){
  let doc;
  try { doc = parseDoc(text); }
  catch (e){ toast('open failed: ' + e.message); return; }
  const conflictNote = tabConflict
    ? '\n\nAnother tab changed the saved document; opening this file overwrites that version.'
    : '';
  if ((nodes.length || links.length || tabConflict) &&
      !confirm(`Open ${name}?\n\nThis replaces the current document with ` +
               `${doc.nodes.length} shapes and ${doc.links.length} arrows. Undo restores it.` + conflictNote))
    return;
  tabConflict = false;
  const tb = document.getElementById('tab-warn');
  if (tb) tb.classList.remove('on');
  undoStack.length = 0;
  snapshot();
  let saved = false;
  try { saved = loadDoc(doc); }
  catch (e){ toast('open failed: ' + e.message); return; }
  toast(saved ? 'json opened' : 'json opened: not saved (storage full or blocked)',
        saved ? 1800 : 6000);
}

const jsonInput = document.createElement('input');
jsonInput.type = 'file';
jsonInput.accept = '.json,application/json';
jsonInput.style.display = 'none';
document.body.appendChild(jsonInput);
document.getElementById('btn-open').addEventListener('click', () => jsonInput.click());
jsonInput.addEventListener('change', async () => {
  const file = jsonInput.files[0];
  jsonInput.value = '';
  if (!file) return;
  if (file.size > DOC_MAX_CHARS){ toast('that file is too large to open', 4200); return; }
  try { importText(await file.text(), file.name); }
  catch (e){ toast('open failed: could not read file'); }
});

async function copy(text, msg){
  try { await navigator.clipboard.writeText(text); toast(msg); }
  catch (e){ toast('clipboard blocked — logged'); console.log(text); }
}

function toB64(u8){
  let s = '';
  const CH = 0x8000;
  for (let i=0;i<u8.length;i+=CH)
    s += String.fromCharCode.apply(null, u8.subarray(i, i+CH));
  return btoa(s);
}
async function fontFace(family, path){
  try {
    const res = await fetch(path);
    const buf = new Uint8Array(await res.arrayBuffer());
    return `@font-face{font-family:'${family}';src:url(data:font/ttf;base64,${toB64(buf)}) format('truetype')}`;
  } catch (e){
    return `@font-face{font-family:'${family}';src:url('${path}') format('truetype')}`;
  }
}
async function buildSVG(){
  const b = contentBBox();
  const pad = 48;
  const w = Math.round(b.w + pad*2), h = Math.round(b.h + pad*2);
  const css = (await fontFace('VD Code','fonts/SourceCodePro.ttf'))
            + (await fontFace('VD Sans','fonts/DMSans.ttf'));
  const clone = viewport.cloneNode(true);
  clone.querySelectorAll('.ui').forEach(el => {
    if (el.classList.contains('march')) el.classList.remove('ui');
    else el.remove();
  });
  clone.querySelectorAll('.linkhit').forEach(el => el.remove());
  clone.querySelectorAll('[data-sel]').forEach(el => {
    el.setAttribute('stroke-width', el.getAttribute('data-lw') || '1.5');
    el.removeAttribute('data-sel');
    el.removeAttribute('data-lw');
  });
  clone.querySelectorAll('[data-flow]').forEach(el => el.removeAttribute('data-flow'));
  const motionCss = '.march{stroke-dasharray:8 6;animation:march 1.4s linear infinite}'
    + '.march.rev{animation-direction:reverse}'
    + '@keyframes march{to{stroke-dashoffset:-56}}';
  clone.removeAttribute('transform');
  const body = new XMLSerializer().serializeToString(clone);
  return `<svg xmlns="${NS}" width="${w}" height="${h}" viewBox="${b.x-pad} ${b.y-pad} ${w} ${h}">`
    + `<style>${css}${motionCss}</style>`
    + `<rect x="${b.x-pad}" y="${b.y-pad}" width="${w}" height="${h}" fill="${PAPER}"/>`
    + body + '</svg>';
}
function download(name, blob){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
async function krokiPath(kind, text){
  const data = new TextEncoder().encode(text);
  const stream = new Blob([data]).stream().pipeThrough(new CompressionStream('deflate'));
  const buf = new Uint8Array(await new Response(stream).arrayBuffer());
  const enc = toB64(buf).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  return `https://kroki.io/${kind}/svg/${enc}`;
}
menu.querySelectorAll('button').forEach(b => {
  b.addEventListener('click', async () => {
    menu.classList.remove('on');
    const x = b.dataset.x;
    try {
      if (x === 'mermaid') return copy(mermaid(), 'mermaid source copied');
      if (x === 'd2') return copy(d2(), 'd2 source copied');
      if (x === 'kroki-mermaid') return copy(await krokiPath('mermaid', mermaid()), 'kroki mermaid url copied');
      if (x === 'kroki-d2') return copy(await krokiPath('d2', d2()), 'kroki d2 url copied');
      if (x === 'svg'){
        download('yoruma.svg', new Blob([await buildSVG()], { type:'image/svg+xml' }));
        toast('svg downloaded');
        return;
      }
      if (x === 'png'){
        const svg = await buildSVG();
        const img = new Image();
        img.onload = () => {
          const c = document.createElement('canvas');
          c.width = img.width*2; c.height = img.height*2;
          const ctx = c.getContext('2d');
          ctx.scale(2,2);
          ctx.drawImage(img, 0, 0);
          c.toBlob(blob => { download('yoruma.png', blob); toast('png downloaded'); });
        };
        img.onerror = () => toast('png export failed');
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        return;
      }
      if (x === 'json'){
        download('yoruma.json', new Blob([docJSON()], { type:'application/json' }));
        toast('json downloaded');
        return;
      }
    } catch (e){ toast('export failed'); }
  });
});

