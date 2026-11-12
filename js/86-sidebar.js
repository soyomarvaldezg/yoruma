/* ---------- sidebar ---------- */
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'image/*';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);

const IMG_MAX = 960, IMG_QUALITY = 0.85, IMG_MAX_CHARS = 1.2e6;
function shrinkImage(img, dataUrl, type, limit){
  try {
    const cap = limit || IMG_MAX;
    const nw = img.naturalWidth || 200, nh = img.naturalHeight || 150;
    if ((type === 'image/svg+xml' || type === 'image/gif') && dataUrl.length <= IMG_MAX_CHARS)
      return dataUrl;
    if (nw <= cap && nh <= cap && dataUrl.length <= IMG_MAX_CHARS)
      return dataUrl;
    let out = dataUrl;
    for (const max of [cap, Math.min(cap, 640), Math.min(cap, 420)]){
      const sc = Math.min(1, max / Math.max(nw, nh));
      const w = Math.max(1, Math.round(nw*sc)), h = Math.max(1, Math.round(nh*sc));
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const ctx = c.getContext('2d');
      if (!ctx) return dataUrl;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);
      out = c.toDataURL('image/webp', IMG_QUALITY);
      if (out.length <= IMG_MAX_CHARS) return out;
    }
    return out.length < dataUrl.length ? out : dataUrl;
  } catch (e){ return dataUrl; }
}
function addImage(dataUrl, natW, natH, at){
  snapshot();
  const maxW = 280;
  const sc = Math.min(1, maxW / Math.max(1, natW));
  const n = { id:'n'+(uid++), kind:'image', title:'', sub:'', color:null, tcolor:null,
    scolor:null, fill:null, fs:1, src:dataUrl,
    x:Math.round(at.x - natW*sc/2), y:Math.round(at.y - natH*sc/2),
    w:Math.max(24, Math.round(natW*sc)), h:Math.max(24, Math.round(natH*sc)) };
  nodes.push(n);
  selectNodes([n.id], false);
  render();
  if (dataUrl.length > IMG_MAX_CHARS) toast('image is large; storage may fill', 5000);
}
const FILE_MAX_BYTES = 20e6;
function insertFile(file, at){
  if (!file || !file.type || !file.type.startsWith('image/')) return;
  if (file.size > FILE_MAX_BYTES){ toast('that image is too large', 4200); return; }
  const fr = new FileReader();
  fr.onload = () => {
    if (!fr.result){ toast('image could not be read'); return; }
    const img = new Image();
    img.onload = () => {
      const src = shrinkImage(img, fr.result, file.type);
      addImage(src, img.naturalWidth || 200, img.naturalHeight || 150, at);
    };
    img.onerror = () => toast('image could not be read');
    img.src = fr.result;
  };
  fr.onerror = () => toast('image could not be read');
  fr.readAsDataURL(file);
}
let svglIndex = null;
const normName = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
function svglRoute(item){
  const r = item && item.route;
  if (!r) return null;
  return typeof r === 'string' ? r : (r.light || r.dark || null);
}
function pickSvg(list, name){
  const q = normName(name);
  if (!q) return null;
  const loose = [];
  for (const it of list || []){
    const t = normName(it && it.title);
    if (!t) continue;
    if (t === q) return it;
    if (t.includes(q)) loose.push({ it, len: t.length });
  }
  loose.sort((a, b) => a.len - b.len);
  return loose.length ? loose[0].it : null;
}
function normaliseSvg(svg){
  let out = String(svg || '').replace(/^\uFEFF/, '')
    .replace(/^\s*<\?xml[^>]*\?>/i, '')
    .replace(/^\s*<!DOCTYPE[^>]*>/i, '')
    .trim();
  if (!/^<svg[^>]*\sxmlns\s*=/i.test(out))
    out = out.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  if (typeof safeSvgMarkup === 'function') out = safeSvgMarkup(out);
  return out;
}
function svgFromText(text){
  const svg = normaliseSvg(text);
  return /^<svg[\s>]/i.test(svg) ? svg : null;
}
function svgDataUri(svg){
  const bytes = new TextEncoder().encode(normaliseSvg(svg));
  let bin = '';
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return 'data:image/svg+xml;base64,' + btoa(bin);
}
const logoSlug = s => String(s || '').toLowerCase().trim()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
function svgAspect(svg){
  const vb = /viewBox\s*=\s*"([^"]+)"/i.exec(String(svg || ''));
  if (vb){
    const p = vb[1].trim().split(/[\s,]+/).map(Number);
    if (p.length === 4 && p[2] > 0 && p[3] > 0) return p[2] / p[3];
  }
  const w = /<svg[^>]*\swidth\s*=\s*"([\d.]+)/i.exec(String(svg || ''));
  const h = /<svg[^>]*\sheight\s*=\s*"([\d.]+)/i.exec(String(svg || ''));
  if (w && h && Number(h[1]) > 0) return Number(w[1]) / Number(h[1]);
  return 1;
}
async function tryLogoSvg(url){
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    return svgFromText(await r.text());
  } catch (e){ return null; }
}
async function fetchLogoByName(name, n, label){
  const shown = label || name;
  try {
    toast('looking up ' + shown + '…');
    const slug = logoSlug(name);
    let svg = null, from = '';
    if (!svglIndex){
      try {
        const r = await fetch('https://api.svgl.app');
        if (r.ok){
          const list = await r.json();
          svglIndex = Array.isArray(list) ? list : [];
        } else svglIndex = [];
      } catch (e){ svglIndex = []; }
    }
    const hit = pickSvg(svglIndex, name);
    const route = hit && svglRoute(hit);
    if (route){
      const file = route.split('/').pop();
      svg = await tryLogoSvg('https://api.svgl.app/svg/' + encodeURIComponent(file));
      if (svg) from = 'svgl · ' + hit.title;
    }
    if (!svg){
      const cands = [slug + '-icon', slug, 'microsoft-' + slug];
      const found = [];
      for (const c of cands){
        if (!c) continue;
        const body = await tryLogoSvg('https://cdn.jsdelivr.net/gh/gilbarbara/logos/logos/' + c + '.svg');
        if (body) found.push({ c, body, d: Math.abs(Math.log(svgAspect(body))) });
      }
      if (found.length){
        found.sort((a, b) => a.d - b.d);
        svg = found[0].body;
        from = 'logos · ' + found[0].c;
      }
    }
    if (!svg){
      const compact = slug.replace(/-/g, '');
      for (const c of [compact, 'google' + compact, 'apache' + compact]){
        svg = await tryLogoSvg('https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/' + c + '.svg');
        if (svg){ from = 'simple-icons · ' + c; break; }
      }
    }
    if (!svg){ toast('no logo found for “' + shown + '”', 4000); return; }
    if (svg.length > 200000){ toast('logo is large', 4000); return; }
    snapshot();
    const target = (n && byId(n.id) === n) ? n : newLogoNode();
    target.logo = svgDataUri(svg);
    delete target.mono;
    render();
    toast(shown + ' logo added (' + from + ')');
  } catch (e){
    toast('logo fetch failed: ' + e.message, 5000);
  }
}
function attachLogo(file, n){
  if (!file || !file.type || !file.type.startsWith('image/')) return;
  if (file.size > FILE_MAX_BYTES){ toast('that image is too large', 4200); return; }
  const fr = new FileReader();
  fr.onload = () => {
    if (!fr.result){ toast('logo could not be read'); return; }
    const img = new Image();
    img.onload = () => {
      const src = shrinkImage(img, fr.result, file.type, 96);
      snapshot();
      n.logo = src;
      delete n.mono;
      render();
    };
    img.onerror = () => toast('logo could not be read');
    img.src = fr.result;
  };
  fr.onerror = () => toast('logo could not be read');
  fr.readAsDataURL(file);
}
function centrePoint(){
  const r = stage.getBoundingClientRect();
  return toWorld({ clientX:r.left + r.width/2, clientY:r.top + r.height/2 });
}
fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) insertFile(fileInput.files[0], centrePoint());
  fileInput.value = '';
});
function inkPayload(){
  return JSON.stringify(inked.map(s => ({ d:s.d, stroke:s.stroke, sw:s.sw })));
}
function saveInk(){
  const raw = inkPayload();
  if (raw.length > INK_MAX){ toast('too much ink to remember; clear it with Esc', 4600); return; }
  try { localStorage.setItem(INK_KEY, raw); } catch (e){}
}
function loadInk(){
  try {
    const raw = localStorage.getItem(INK_KEY);
    if (!raw) return;
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return;
    inked = list.filter(s => s && typeof s.d === 'string').slice(0, 400)
      .map(s => ({ d:s.d.slice(0, 4000), stroke: s.stroke || INK, sw: +s.sw || 2.2 }));
  } catch (e){ inked = []; }
}

let clipboard = null, pasteCount = 0;
const editableTarget = t => t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);

function buildClipboard(){
  const ids = new Set(S.selNodes);
  if (!ids.size) return null;
  nodes.forEach(n => {
    if (n.kind === 'zone' && ids.has(n.id))
      zoneMembers(n).forEach(m => ids.add(m.id));
  });
  const ns = nodes.filter(n => ids.has(n.id)).map(n => JSON.parse(JSON.stringify(n)));
  const ls = links.filter(l => ids.has(l.from) && ids.has(l.to))
                  .map(l => JSON.parse(JSON.stringify(l)));
  return { format:'yoruma-clip', version:1, nodes:ns, links:ls };
}
function parseClipboard(text){
  if (!text) return null;
  try {
    const d = JSON.parse(text);
    if (!d || d.format !== 'yoruma-clip' || d.version !== 1) return null;
    return parseDoc(JSON.stringify({
      format:'yoruma', version:1, nodes:d.nodes, links:d.links
    }));
  } catch (e){ return null; }
}
function pasteData(data, dx, dy){
  const ns = data && data.nodes || [], ls = data && data.links || [];
  if (!ns.length) return;
  snapshot();
  const map = new Map();
  const added = [];
  ns.forEach(src => {
    const n = JSON.parse(JSON.stringify(src));
    const newId = 'n' + (uid++);
    map.set(String(src.id), newId);
    n.id = newId;
    n.x += dx; n.y += dy;
    nodes.push(n);
    added.push(n);
  });
  ls.forEach(src => {
    const from = map.get(String(src.from)), to = map.get(String(src.to));
    if (!from || !to) return;
    const l = JSON.parse(JSON.stringify(src));
    l.id = 'k' + (uid++);
    l.from = from; l.to = to;
    if (l.bends) l.bends = l.bends.map(b => ({ x: b.x + dx, y: b.y + dy }));
    links.push(l);
  });
  selectNodes(added.map(n => n.id), false);
  render();
}
function pasteClipboard(data){
  if (!data || !data.nodes || !data.nodes.length) return;
  pasteCount++;
  pasteData(data, 24 * pasteCount, 24 * pasteCount);
}
function duplicateSelection(){
  const data = buildClipboard();
  if (data) pasteData(data, 24, 24);
}

window.addEventListener('copy', ev => {
  if (editableTarget(ev.target)) return;
  if (window.getSelection && String(window.getSelection())) return;
  if (!S.selNodes.length) return;
  const data = buildClipboard();
  if (!data) return;
  clipboard = data;
  pasteCount = 0;
  try { ev.clipboardData.setData('text/plain', JSON.stringify(data)); } catch (e){}
  ev.preventDefault();
  toast('copied ' + data.nodes.length + (data.nodes.length === 1 ? ' shape' : ' shapes'));
});
window.addEventListener('paste', ev => {
  if (editableTarget(ev.target)) return;
  let text = '';
  try {
    text = ev.clipboardData && ev.clipboardData.getData
      ? ev.clipboardData.getData('text/plain') : '';
  } catch (e){}
  const data = parseClipboard(text);
  if (data){
    ev.preventDefault();
    pasteClipboard(data);
    return;
  }
  const f = ev.clipboardData && ev.clipboardData.files && ev.clipboardData.files[0];
  if (f){ ev.preventDefault(); insertFile(f, centrePoint()); return; }
  if (!text && clipboard){
    ev.preventDefault();
    pasteClipboard(clipboard);
  }
});
stage.addEventListener('dragover', ev => { ev.preventDefault(); });
stage.addEventListener('drop', ev => {
  ev.preventDefault();
  const f = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
  if (!f) return;
  const name = String(f.name || '').toLowerCase();
  if (/\.(ya?ml|txt)$/.test(name) || f.type === 'text/yaml' || f.type === 'text/plain'){
    if (f.size > DOC_MAX_CHARS){ toast('that file is too large to open', 4200); return; }
    f.text().then(t => openTextDoc(t, f.name))
      .catch(() => toast('open failed: could not read file'));
    return;
  }
  if (/\.json$/.test(name)){
    if (f.size > DOC_MAX_CHARS){ toast('that file is too large to open', 4200); return; }
    f.text().then(t => importText(t, f.name))
      .catch(() => toast('open failed: could not read file'));
    return;
  }
  const p = toWorld(ev);
  const hit = nodeAt(p, 0);
  if (hit && LOGO_KINDS.has(hit.kind) && f.type && f.type.startsWith('image/')){
    attachLogo(f, hit);
    return;
  }
  insertFile(f, p);
});

function buildGrid(el, list, group){
  list.forEach(t => {
    const b = document.createElement('button');
    b.innerHTML = `<svg viewBox="0 0 24 24">${ICON[t.icon]}</svg>`;
    const name = t.key ? `${t.label}  (${t.key.toUpperCase()})` : t.label;
    b.title = name;
    b.setAttribute('aria-label', t.label);
    b.setAttribute('aria-pressed', 'false');
    b.dataset.tool = t.id;
    b.dataset.group = group;
    b.addEventListener('click', () => {
      if (t.pick){ fileInput.click(); return; }
      if (S.tool === t.id && !t.pick){
        S.sticky = !S.sticky;
        document.body.dataset.sticky = S.sticky ? '1' : '0';
        toast(S.sticky ? t.label + ' stays armed — click again for one shape'
                       : t.label + ' arms for one shape');
        return;
      }
      S.sticky = false;
      document.body.dataset.sticky = '0';
      setTool(t.id, group);
    });
    el.appendChild(b);
  });
}
buildGrid(document.getElementById('tools'), DRAW.concat(DATA), 'all');

function setTool(id, group){
  S.tool = id;
  S.armed = null;
  remarkChips(null);
  document.querySelectorAll('#tools button').forEach(b => {
    const on = b.dataset.tool === id;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  document.body.dataset.tool = id;
  if (id === 'select'){ S.sticky = false; document.body.dataset.sticky = '0'; }
  syncHud();
  if (typeof placeStylebar === 'function') placeStylebar();
}

const catalogEl = document.getElementById('catalog');
CATALOG.forEach(([name, items]) => {
  const d = document.createElement('details');
  const s = document.createElement('summary');
  s.textContent = name;
  d.appendChild(s);
  const box = document.createElement('div');
  box.className = 'chips';
  items.forEach(label => {
    const c = document.createElement('button');
    c.className = 'chip';
    c.textContent = label;
    c.dataset.label = label;
    c.setAttribute('aria-label', 'place ' + label);
    c.addEventListener('click', () => {
      S.armed = label;
      remarkChips(c);
      S.tool = 'place';
      document.body.dataset.tool = 'place';
      document.querySelectorAll('#tools button').forEach(b => b.classList.remove('on'));
    });
    box.appendChild(c);
  });
  d.appendChild(box);
  catalogEl.appendChild(d);
});
const catalogFilter = document.getElementById('catalog-filter');
const catalogEmpty = document.getElementById('catalog-empty');
let catalogWasOpen = null;
function filterCatalog(){
  const q = catalogFilter.value.trim().toLowerCase();
  const groups = catalogEl.querySelectorAll('details');
  if (q && !catalogWasOpen)
    catalogWasOpen = Array.from(groups, d => d.open);
  let shown = 0;
  groups.forEach(d => {
    let hits = 0;
    d.querySelectorAll('.chip').forEach(c => {
      const hit = !q || c.dataset.label.toLowerCase().includes(q);
      c.hidden = !hit;
      if (hit) hits++;
    });
    d.hidden = !!q && hits === 0;
    if (q) d.open = hits > 0;
    shown += hits;
  });
  if (!q && catalogWasOpen){
    groups.forEach((d, i) => { d.open = catalogWasOpen[i]; });
    catalogWasOpen = null;
  }
  catalogEmpty.hidden = !q || shown > 0;
}
catalogFilter.addEventListener('input', filterCatalog);
catalogFilter.addEventListener('keydown', e => {
  if (e.key === 'Escape'){
    catalogFilter.value = '';
    filterCatalog();
    catalogFilter.blur();
  }
});
function remarkChips(active){
  catalogEl.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === active));
}

