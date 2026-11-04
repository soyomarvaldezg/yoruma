/* ---------- shaper ---------- */
const shaper = document.getElementById('shaper');
const ALIGN_ICON = {
  left:'<path d="M4 6h16M4 12h9M4 18h13"/>',
  center:'<path d="M4 6h16M7.5 12h9M5.5 18h13"/>',
  right:'<path d="M4 6h16M11 12h9M7 18h13"/>'
};
const pickerEl = document.getElementById('logo-picker');
const pickerGrid = document.getElementById('logo-grid');
const pickerFilter = document.getElementById('logo-filter');
let pickerNode = null;
function closeLogoPicker(){
  pickerEl.classList.remove('on');
  pickerNode = null;
}
const DATA_BRANDS = ['snowflake','dbt','databricks','airflow','apache-spark','kafka','tableau',
  'looker','power-bi','bigquery','postgresql','mysql','mongodb','elasticsearch','redis',
  'segment','airbyte','docker','kubernetes','terraform'];
const BRAND_THUMB = {
  'power-bi': 'https://cdn.jsdelivr.net/gh/gilbarbara/logos/logos/microsoft-power-bi.svg',
  'bigquery': 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/googlebigquery.svg'
};
const brandThumb = name => BRAND_THUMB[name] ||
  'https://cdn.jsdelivr.net/gh/gilbarbara/logos/logos/' + logoSlug(name) + '.svg';
function brandTile(name){
  const b = document.createElement('button');
  b.className = 'logo-item';
  const img = document.createElement('img');
  img.loading = 'lazy';
  img.alt = '';
  if (BRAND_THUMB[name]) img.src = BRAND_THUMB[name];
  else {
    img.src = 'https://cdn.jsdelivr.net/gh/gilbarbara/logos/logos/' + logoSlug(name) + '-icon.svg';
    img.onerror = () => {
      img.onerror = null;
      img.src = 'https://cdn.jsdelivr.net/gh/gilbarbara/logos/logos/' + logoSlug(name) + '.svg';
    };
  }
  const sp = document.createElement('span');
  sp.textContent = name;
  b.appendChild(img);
  b.appendChild(sp);
  b.addEventListener('mousedown', ev => ev.preventDefault());
  b.addEventListener('click', () => fetchLogoByName(name, pickerNode));
  return b;
}
function pickerItem(it){
  const b = document.createElement('button');
  b.className = 'logo-item';
  const img = document.createElement('img');
  img.loading = 'lazy';
  img.alt = '';
  img.src = svglRoute(it);
  const sp = document.createElement('span');
  sp.textContent = it.title;
  b.appendChild(img);
  b.appendChild(sp);
  b.addEventListener('mousedown', ev => ev.preventDefault());
  b.addEventListener('click', () => useLogoSvg(it));
  return b;
}
function paintPicker(q){
  const query = normName(q);
  pickerGrid.innerHTML = '';
  const items = (svglIndex || []).filter(it => !query || normName(it.title).includes(query));
  if (!items.length){
    const typed = String(q || '').trim();
    if (typed){
      const b = document.createElement('button');
      b.className = 'logo-item';
      b.textContent = 'Fetch “' + typed + '”';
      b.addEventListener('click', () => { if (pickerNode) fetchLogoByName(typed, pickerNode); });
      pickerGrid.appendChild(b);
    } else {
      pickerGrid.innerHTML = '<div class="logo-empty">no brands loaded — use FROM FILE</div>';
    }
    return;
  }
  DATA_BRANDS.filter(n => !query || normName(n).includes(query))
    .forEach(n => pickerGrid.appendChild(brandTile(n)));
  items.slice(0, 600).forEach(it => pickerGrid.appendChild(pickerItem(it)));
}
function newLogoNode(){
  const c = centrePoint();
  const n = { id:'n'+(uid++), kind:'logo', title:'', sub:'', color:null,
    tcolor:null, scolor:null, fs:1, x:0, y:0, w:SIZE.logo[0], h:SIZE.logo[1] };
  n.x = Math.round(c.x - n.w/2);
  n.y = Math.round(c.y - n.h/2);
  nodes.push(n);
  selectNodes([n.id], false);
  return n;
}
async function useLogoSvg(it){
  const route = svglRoute(it);
  if (!route){ toast('no logo file for ' + it.title, 4000); return; }
  const file = route.split('/').pop();
  const svg = await tryLogoSvg('https://api.svgl.app/svg/' + encodeURIComponent(file));
  if (!svg){ toast('could not download ' + it.title, 4200); return; }
  snapshot();
  const n = pickerNode || newLogoNode();
  n.logo = svgDataUri(svg);
  render();
  closeLogoPicker();
  toast(it.title + ' logo added');
}
async function openLogoPicker(n){
  pickerNode = n;
  pickerEl.classList.add('on');
  pickerFilter.value = '';
  pickerGrid.innerHTML = '<div class="logo-empty">loading brands…</div>';
  if (!svglIndex){
    try {
      const r = await fetch('https://api.svgl.app');
      const list = r.ok ? await r.json() : [];
      svglIndex = Array.isArray(list) ? list : [];
    } catch (e){ svglIndex = []; }
  }
  paintPicker('');
  pickerFilter.focus();
}
pickerFilter.addEventListener('input', () => paintPicker(pickerFilter.value));
pickerFilter.addEventListener('keydown', ev => {
  if (ev.key !== 'Enter') return;
  const q = pickerFilter.value.trim();
  if (!q) return;
  ev.preventDefault();
  fetchLogoByName(q, pickerNode);
});
document.getElementById('logo-close').addEventListener('click', closeLogoPicker);
pickerEl.addEventListener('click', ev => { if (ev.target === pickerEl) closeLogoPicker(); });
pickerEl.addEventListener('keydown', ev => {
  if (ev.key === 'Escape'){ ev.stopPropagation(); closeLogoPicker(); }
});
['left','center','right'].forEach(al => {
  const b = document.createElement('button');
  b.innerHTML = `<svg viewBox="0 0 24 24">${ALIGN_ICON[al]}</svg>`;
  b.title = 'align ' + al;
  b.dataset.align = al;
  b.style.marginLeft = al === 'left' ? '6px' : '0';
  b.addEventListener('mousedown', ev => ev.preventDefault());
  b.addEventListener('click', () => {
    const n = byId(S.selNodes[0]);
    if (!n) return;
    snapshot();
    n.align = al;
    render();
  });
  shaper.appendChild(b);
});

const ZONE_STYLE = [
  { flag:'band', title:'Header band',
    svg:'<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M3.5 10h17"/>' },
  { flag:'solid', title:'Solid border',
    svg:'<rect x="3.5" y="5" width="17" height="14" rx="2"/>' }
];
ZONE_STYLE.forEach(opt => {
  const b = document.createElement('button');
  b.innerHTML = `<svg viewBox="0 0 24 24">${opt.svg}</svg>`;
  b.title = opt.title;
  b.dataset.zone = opt.flag;
  b.style.marginLeft = opt.flag === 'band' ? '6px' : '0';
  b.addEventListener('mousedown', ev => ev.preventDefault());
  b.addEventListener('click', () => {
    const n = byId(S.selNodes[0]);
    if (!n || n.kind !== 'zone') return;
    snapshot();
    n[opt.flag] = !n[opt.flag];
    render();
  });
  shaper.appendChild(b);
});

const linkbar = document.getElementById('linkbar');
const LINK_STYLE = [
  { lw:1.2, title:'Thin', svg:'<path d="M3 12h18" stroke-width="1.2"/>' },
  { lw:1.5, title:'Medium', svg:'<path d="M3 12h18" stroke-width="2"/>' },
  { lw:3, title:'Thick', svg:'<path d="M3 12h18" stroke-width="3.4"/>' },
  { dash:'1', title:'Dashed', svg:'<path d="M3 12h5M11 12h5M19 12h2" stroke-width="2"/>' },
  { head:'1', title:'End arrow', svg:'<path d="M3 12h16M14 8l5 4-5 4"/>' },
  { headstart:'1', title:'Start arrow', svg:'<path d="M21 12H5M10 8l-5 4 5 4"/>' }
];
LINK_STYLE.forEach(opt => {
  const b = document.createElement('button');
  b.innerHTML = `<svg viewBox="0 0 24 24">${opt.svg}</svg>`;
  b.title = opt.title;
  if (opt.lw != null) b.dataset.lw = opt.lw;
  if (opt.dash) b.dataset.dash = '1';
  if (opt.head) b.dataset.head = '1';
  if (opt.headstart) b.dataset.headstart = '1';
  if (opt.dash || opt.head) b.style.marginLeft = '6px';
  b.addEventListener('mousedown', ev => ev.preventDefault());
  b.addEventListener('click', () => {
    const sel = links.filter(x => S.selLinks.includes(x.id));
    if (!sel.length) return;
    snapshot();
    sel.forEach(l => {
      if (b.dataset.lw != null) l.lw = +b.dataset.lw;
      else if (b.dataset.dash){
        const mode = l.motion || S.motion;
        const animated = mode === 'dashes' || mode === 'both';
        const on = animated || l.dash === true;
        l.dash = !on;
        if (on){
          if (mode === 'both') l.motion = 'dots';
          else if (mode === 'dashes') l.motion = 'off';
        }
      }
      else if (b.dataset.head) l.head = l.head === false;
      else if (b.dataset.headstart) l.headStart = !l.headStart;
    });
    render();
  });
  linkbar.appendChild(b);
});

function placeShaper(){
  if (S.selNodes.length !== 1 || editing){ shaper.style.display = 'none'; return; }
  const n = byId(S.selNodes[0]);
  if (!n){ shaper.style.display = 'none'; return; }
  const s = toScreen({ x:n.x, y:n.y });
  shaper.style.display = 'flex';
  shaper.style.left = Math.max(6, s.x) + 'px';
  const above = s.y - 78;
  shaper.style.top = (above < 8 ? s.y + n.h*view.k + 46 : above) + 'px';
  shaper.querySelectorAll('button').forEach(b => {
    if (b.dataset.zone){
      b.style.display = n.kind === 'zone' ? '' : 'none';
      b.classList.toggle('on', n.kind === 'zone' && n[b.dataset.zone] === true);
    } else if (b.dataset.align)
      b.classList.toggle('on', (n.align || 'center') === b.dataset.align);
  });
}

function placeLinkbar(){
  const l = S.selLinks.length === 1 && links.find(x => x.id === S.selLinks[0]);
  if (!l || S.selNodes.length || editing){ linkbar.style.display = 'none'; return; }
  const a = byId(l.from), b = byId(l.to);
  if (!a || !b){ linkbar.style.display = 'none'; return; }
  const m = midPoint(route(a, b, l.way, l));
  const s = toScreen(m);
  linkbar.style.display = 'flex';
  const w = linkbar.offsetWidth || 200;
  linkbar.style.left = Math.max(6, Math.min(window.innerWidth - w - 6, s.x - w/2)) + 'px';
  const above = s.y - 46;
  linkbar.style.top = (above < 8 ? s.y + 18 : above) + 'px';
  const lw = l.lw || 1.5;
  const mode = l.motion || S.motion;
  const animated = mode === 'dashes' || mode === 'both';
  const dashOn = animated || l.dash === true;
  linkbar.querySelectorAll('button').forEach(btn => {
    if (btn.dataset.lw){
      btn.disabled = false;
      btn.classList.toggle('on', +btn.dataset.lw === lw);
    } else if (btn.dataset.dash){
      btn.disabled = false;
      btn.classList.toggle('on', dashOn);
      btn.title = animated ? 'Stop animated dashes' : (l.dash === true ? 'Hide dashes' : 'Show dashes');
    } else if (btn.dataset.head){
      btn.disabled = false;
      btn.classList.toggle('on', l.head !== false);
    } else if (btn.dataset.headstart){
      btn.disabled = false;
      btn.classList.toggle('on', l.headStart === true);
      btn.title = (l.head === false && l.headStart) ? 'Start arrow (flow reversed)' : 'Start arrow';
    }
  });
}
window.addEventListener('resize', () => { placeShaper(); placeLinkbar(); });

