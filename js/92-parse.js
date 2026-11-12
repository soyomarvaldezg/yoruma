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
    dash: raw.dash === true,
    sharp: raw.sharp === true,
    rev: raw.rev === true,
    flip: raw.flip === true,
    band: raw.band === true,
    solid: raw.solid === true
  };
  if (['left','center','right'].includes(raw.align)) n.align = raw.align;
  const src = image(raw.src), logo = image(raw.logo);
  if (src) n.src = src;
  if (logo) n.logo = logo;
  if (n.logo && raw.mono === true) n.mono = true;
  if (['solid','dashed','dotted'].includes(raw.stroke)) n.stroke = raw.stroke;
  if (ANIMS.includes(raw.anim)) n.anim = raw.anim;
  if (raw.fillmode === 'solid') n.fillmode = 'solid';
  if (isNum(raw.sw) && raw.sw > 0 && raw.sw <= 8) n.sw = raw.sw;
  if (isNum(raw.step) && raw.step > 0 && raw.step < 1e6) n.step = Math.round(raw.step);
  if (raw.kind === 'frame' && Array.isArray(raw.members)){
    const members = Array.from(new Set(raw.members.filter(m => idOf(m)).map(idOf))).slice(0, 500);
    if (members.length) n.members = members;
  }
  return n;
}

const isBend = p => p && isNum(p.x) && isNum(p.y) &&
  Math.abs(p.x) <= 1e7 && Math.abs(p.y) <= 1e7;
/* Bends are a list now. A version 1 file that carried the old single `way`
   keeps working: it reads as a list of one. */
function parseBends(raw){
  const list = Array.isArray(raw.bends) ? raw.bends : (isBend(raw.way) ? [raw.way] : []);
  return list.filter(isBend).slice(0, MAX_BENDS)
    .map(b => ({ x: b.x, y: b.y }));
}

function parseLink(raw, ids){
  if (!raw || typeof raw !== 'object') throw new Error('arrow is not an object');
  const id = idOf(raw.id);
  if (!id) throw new Error('arrow without a valid id');
  const from = idOf(raw.from), to = idOf(raw.to);
  if (!from || !to || !ids.has(from) || !ids.has(to))
    throw new Error('arrow ' + id + ' points to a missing shape');
  const bends = parseBends(raw);
  const out = {
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
    bends,
    fromSide: DOC_SIDES.has(raw.fromSide) ? raw.fromSide : null,
    toSide: DOC_SIDES.has(raw.toSide) ? raw.toSide : null,
    fromT: isNum(raw.fromT) ? Math.max(0, Math.min(1, raw.fromT)) : null,
    toT: isNum(raw.toT) ? Math.max(0, Math.min(1, raw.toT)) : null
  };
  /* `way` was the single-bend spelling; the list is the only shape now. */
  delete out.way;
  return out;
}

const DOC_MAX_CHARS = 8e6;
const DOC_MAX_ITEMS = 5000;
const DOC_MAX_PAGES = 40;
function parsePage(raw, index){
  if (!raw || typeof raw !== 'object') throw new Error('page ' + (index + 1) + ' is not an object');
  const id = idOf(raw.id) || ('p' + (index + 1));
  const name = String(raw.name == null ? 'Page ' + (index + 1) : raw.name).slice(0, 40);
  const ns = Array.isArray(raw.nodes) ? raw.nodes : [];
  const ls = Array.isArray(raw.links) ? raw.links : [];
  if (ns.length > DOC_MAX_ITEMS || ls.length > DOC_MAX_ITEMS)
    throw new Error('page ' + name + ' has too many shapes');
  const ids = new Set();
  const nodes = ns.map(rawN => {
    const n = parseNode(rawN);
    if (ids.has(n.id)) throw new Error('duplicate shape id ' + n.id);
    ids.add(n.id);
    return n;
  });
  nodes.forEach(n => {
    if (!n.members) return;
    n.members = n.members.filter(id => ids.has(id));
    if (!n.members.length) delete n.members;
  });
  const linkIds = new Set();
  const links = ls.map(rawL => {
    const l = parseLink(rawL, ids);
    if (linkIds.has(l.id)) throw new Error('duplicate arrow id ' + l.id);
    linkIds.add(l.id);
    return l;
  });
  const view = raw.view && isNum(raw.view.x) && isNum(raw.view.y) &&
               isNum(raw.view.k) && raw.view.k > 0
    ? { x: raw.view.x, y: raw.view.y, k: Math.min(3, Math.max(0.2, raw.view.k)) }
    : null;
  return { id, name, nodes, links, view };
}
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
  let pages = null, page = null;
  if (Array.isArray(raw.pages)){
    pages = raw.pages.slice(0, DOC_MAX_PAGES).map(parsePage);
    if (!pages.length) pages = null;
  }
  if (pages){
    const wanted = idOf(raw.page);
    page = pages.some(p => p.id === wanted) ? wanted : pages[0].id;
  } else {
    pages = [{ id:'p1', name:'Page 1', nodes: nextNodes, links: nextLinks, view }];
    page = 'p1';
  }
  return { nodes: nextNodes, links: nextLinks, motion, view, pages, page };
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

function importText(text, name, label, quiet){
  let doc;
  try { doc = parseDoc(text); }
  catch (e){ toast('open failed: ' + e.message); return false; }
  const conflictNote = tabConflict
    ? '\n\nAnother tab changed the saved document; opening this file overwrites that version.'
    : '';
  if (!quiet && (nodes.length || links.length || tabConflict) &&
      !confirm(`Open ${name}?\n\nThis replaces the current document with ` +
               `${doc.nodes.length} shapes and ${doc.links.length} arrows. Undo restores it.` + conflictNote))
    return false;
  tabConflict = false;
  const tb = document.getElementById('tab-warn');
  if (tb) tb.classList.remove('on');
  undoStack.length = 0;
  snapshot();
  let saved = false;
  try { saved = loadDoc(doc); }
  catch (e){ toast('open failed: ' + e.message); return false; }
  const what = label || 'json';
  toast(saved ? what + ' opened' : what + ' opened: not saved (storage full or blocked)',
        saved ? 1800 : 6000);
  return true;
}

const jsonInput = document.createElement('input');
jsonInput.type = 'file';
jsonInput.accept = '.json,application/json';
jsonInput.style.display = 'none';
document.body.appendChild(jsonInput);
// the FILE menu opens the picker through the data-x handler below
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
async function buildSVG(opts){
  const sel = opts && opts.sel;
  const keepNodes = sel ? new Set(S.selNodes) : null;
  const keepLinks = sel ? new Set(S.selLinks) : null;
  if (sel && !keepNodes.size && !keepLinks.size) return null;
  let b = contentBBox();
  if (sel){
    const picked = nodes.filter(n => keepNodes.has(n.id));
    if (picked.length){
      const x1 = Math.min(...picked.map(n => n.x)), y1 = Math.min(...picked.map(n => n.y));
      b = { x:x1, y:y1,
        w: Math.max(...picked.map(n => n.x + n.w)) - x1,
        h: Math.max(...picked.map(n => n.y + n.h)) - y1 };
    }
  }
  const pad = sel ? 24 : 48;
  const w = Math.round(b.w + pad*2), h = Math.round(b.h + pad*2);
  const css = (await fontFace('VD Code','fonts/SourceCodePro.ttf'))
            + (await fontFace('VD Sans','fonts/DMSans.ttf'));
  const clone = viewport.cloneNode(true);
  clone.querySelectorAll('.ui').forEach(el => {
    if (el.classList.contains('march')) el.classList.remove('ui');
    else if (el.classList.contains('comet') || el.classList.contains('comet-halo')){
      el.classList.remove('ui');
      const lap = Number(el.getAttribute('data-lap') || 400);
      const dur = Number(el.getAttribute('data-dur') || 2000);
      const rev = el.getAttribute('data-live') === '-1';
      const a = document.createElementNS(NS, 'animate');
      a.setAttribute('attributeName', 'stroke-dashoffset');
      a.setAttribute('from', String(rev ? -lap : 0));
      a.setAttribute('to', String(rev ? 0 : -lap));
      a.setAttribute('dur', (dur / 1000) + 's');
      a.setAttribute('repeatCount', 'indefinite');
      el.appendChild(a);
      el.removeAttribute('data-lap');
      el.removeAttribute('data-dur');
      el.removeAttribute('data-live');
    }
    else el.remove();
  });
  /* Dots are moved by the editor's tick, so the clone would carry a frozen
     circle at the path start. Give each one a SMIL motion path instead. */
  links.forEach((l, i) => {
    const mode = l.motion || S.motion;
    if (mode !== 'dots' && mode !== 'both') return;
    const a = byId(l.from), b = byId(l.to);
    if (!a || !b) return;
    const g = clone.querySelector(`g[data-link="${l.id}"]`);
    if (!g) return;
    const d = rounded(route(a, b, bendsOf(l), l), 7);
    const ghost = mk('path', { id:'yoruma-mp' + i, d, fill:'none', stroke:'none' });
    g.appendChild(ghost);
    const len = ghost.getTotalLength() || 1;
    const dir = l.head === false && l.headStart === true ? -1 : 1;
    const lw = l.lw || 1.5;
    const dur = (Math.max(1200, len * 5) / 1000).toFixed(2) + 's';
    const dot = mk('circle', { r: String(S.dotSize * Math.max(0.85, Math.min(1.5, lw / 1.5))),
      fill: colorAt(l.color) || FIBER, opacity: '1' });
    const am = mk('animateMotion', {
      dur, repeatCount: 'indefinite', calcMode: 'linear',
      ...(dir < 0 ? { keyPoints: '1;0', keyTimes: '0;1' } : {})
    });
    const mp = document.createElementNS(NS, 'mpath');
    mp.setAttribute('href', '#yoruma-mp' + i);
    mp.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#yoruma-mp' + i);
    am.appendChild(mp);
    dot.appendChild(am);
    g.appendChild(dot);
  });
  if (sel){
    clone.querySelectorAll('g.node[data-id]').forEach(el => {
      if (!keepNodes.has(el.getAttribute('data-id'))) el.remove();
    });
    clone.querySelectorAll('g[data-link]').forEach(el => {
      const id = el.getAttribute('data-link');
      const l = links.find(x => x.id === id);
      const both = l && keepNodes.has(l.from) && keepNodes.has(l.to);
      if (!keepLinks.has(id) && !both) el.remove();
    });
  }
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
function svgToCanvas(svg){
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const cnv = document.createElement('canvas');
      cnv.width = img.width*2; cnv.height = img.height*2;
      const ctx = cnv.getContext('2d');
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      resolve(cnv);
    };
    img.onerror = () => reject(new Error('render failed'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}
function canvasBlob(cnv, type){
  return new Promise(resolve => cnv.toBlob(b => resolve(b), type));
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
      if (x === 'open'){ jsonInput.click(); return; }
      if (x === 'open-text'){ openTextFile(); return; }
      if (x === 'icons-import'){ importIconPack(); return; }
      if (x === 'icons-clear'){ clearImportedIcons(); return; }
      if (x === 'clear'){ clearDoc(); return; }
      if (x === 'mermaid') return copy(mermaid(), 'mermaid source copied');
      if (x === 'd2') return copy(d2(), 'd2 source copied');
      if (x === 'kroki-mermaid') return copy(await krokiPath('mermaid', mermaid()), 'kroki mermaid url copied');
      if (x === 'kroki-d2') return copy(await krokiPath('d2', d2()), 'kroki d2 url copied');
      if (x === 'svg'){
        download('yoruma.svg', new Blob([await buildSVG()], { type:'image/svg+xml' }));
        toast('svg downloaded');
        return;
      }
      if (x === 'svg-sel' || x === 'png-sel'){
        const svg = await buildSVG({ sel:true });
        if (!svg){ toast('select something first'); return; }
        if (x === 'svg-sel'){
          download('yoruma-selection.svg', new Blob([svg], { type:'image/svg+xml' }));
          toast('selection svg downloaded');
          return;
        }
        const cnv = await svgToCanvas(svg);
        download('yoruma-selection.png', await canvasBlob(cnv, 'image/png'));
        toast('selection png downloaded');
        return;
      }
      if (x === 'png' || x === 'webp' || x === 'png-copy'){
        const svg = await buildSVG();
        const c = await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const cnv = document.createElement('canvas');
            cnv.width = img.width*2; cnv.height = img.height*2;
            const ctx = cnv.getContext('2d');
            ctx.scale(2,2);
            ctx.drawImage(img, 0, 0);
            resolve(cnv);
          };
          img.onerror = () => reject(new Error('render failed'));
          img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        });
        if (x === 'png')
          c.toBlob(blob => { download('yoruma.png', blob); toast('png downloaded'); });
        else if (x === 'webp')
          c.toBlob(blob => {
            if (!blob || blob.type !== 'image/webp'){
              toast('webp export is not supported in this browser'); return;
            }
            download('yoruma.webp', blob); toast('webp downloaded');
          }, 'image/webp');
        else {
          if (!navigator.clipboard || !window.ClipboardItem){
            toast('copy needs a browser with clipboard images'); return;
          }
          c.toBlob(blob => {
            if (!blob){ toast('copy failed'); return; }
            navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
              .then(() => toast('image copied to clipboard'))
              .catch(() => toast('copy failed: the browser blocked it'));
          });
        }
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

