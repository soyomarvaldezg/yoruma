/* ---------- colour ---------- */
const swEl = document.getElementById('swatches');
document.querySelectorAll('#paint button').forEach(b => {
  b.setAttribute('aria-label', b.title || b.dataset.target);
  b.setAttribute('aria-pressed', 'false');
  b.addEventListener('click', () => { S.paint = b.dataset.target; syncHud(); });
});
function buildSwatches(){
  swEl.innerHTML = '';
  [null].concat(ACCENTS).forEach(hex => {
    const d = document.createElement('div');
    d.className = 'sw' + (hex === null ? ' none' : '');
    if (hex) d.style.background = hex;
    d.dataset.hex = hex || '';
    d.title = hex || 'default';
    d.tabIndex = 0;
    d.setAttribute('role', 'button');
    d.setAttribute('aria-label', hex ? 'colour ' + hex : 'no colour');
    d.addEventListener('keydown', ev => {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      ev.preventDefault();
      applyColor(hex);
    });
    d.addEventListener('pointerdown', ev => {
      const sx = ev.clientX, sy = ev.clientY;
      const up = e => {
        window.removeEventListener('pointerup', up);
        const moved = Math.hypot(e.clientX-sx, e.clientY-sy);
        if (moved < 8){ applyColor(hex); return; }
        const p = toWorld(e);
        const n = nodeAt(p, 0);
        if (n){
          snapshot();
          if (S.paint === 'tint' && n.kind !== 'zone'){
            n.fill = hex; n.tint = !!hex;
          } else {
            n[{ line:'color', text:'tcolor', sub:'scolor' }[S.paint]] = hex;
          }
          render();
          return;
        }
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const lk = el && el.closest ? el.closest('[data-link]') : null;
        if (lk){
          const l = links.find(x => x.id === lk.dataset.link);
          if (l){ snapshot(); l.color = hex; render(); }
        }
      };
      window.addEventListener('pointerup', up);
    });
    swEl.appendChild(d);
  });
  const lab = document.createElement('div');
  lab.className = 'sw';
  lab.title = 'custom colour';
  lab.tabIndex = 0;
  lab.setAttribute('role', 'button');
  lab.setAttribute('aria-label', 'custom colour');
  lab.style.cssText = 'display:block;' +
    (CUSTOM.hex ? `background:${CUSTOM.hex}` :
      'background:conic-gradient(#8F2D45,#B4632B,#96700F,#2E6B4F,#08829C,#3D6BB3,#6D4B8F,#8F2D45)');
  lab.addEventListener('keydown', ev => {
    if (ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); lab.click(); }
  });
  lab.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'color';
    input.value = CUSTOM.hex || '#08829C';
    input.style.cssText = 'position:fixed;left:-200px;top:-200px;width:1px;height:1px;opacity:0';
    document.body.appendChild(input);
    input.addEventListener('input', () => {
      CUSTOM.hex = input.value;
      buildSwatches();
      applyColor(input.value);
    });
    input.addEventListener('change', () => setTimeout(() => input.remove(), 300));
    input.click();
  });
  swEl.appendChild(lab);
}
buildSwatches();



const stylebar = document.getElementById('stylebar');
const paintRow = document.getElementById('paint');
function placeStylebar(){
  const edOpen = document.getElementById('editor').style.display === 'block';
  if (S.tool !== 'select' || editing || edOpen){
    stylebar.style.display = 'none';
    return;
  }
  const hasNodes = S.selNodes.length > 0;
  const forArrow = !hasNodes && S.selLinks.length > 0;
  if ((!hasNodes && !forArrow) || document.body.classList.contains('present')){
    stylebar.style.display = 'none';
    return;
  }
  if (forArrow) S.paint = 'line';
  paintRow.style.display = forArrow ? 'none' : '';
  stylebar.style.display = 'block';
  syncSwatchState();
}
function currentPaintColor(){
  if (S.selLinks.length && !S.selNodes.length){
    const l = links.find(x => x.id === S.selLinks[0]);
    return l ? l.color : null;
  }
  const n = S.selNodes.length ? byId(S.selNodes[0]) : null;
  if (!n) return null;
  return n[{ line:'color', text:'tcolor', sub:'scolor', tint:'fill' }[S.paint]] || null;
}
function syncSwatchState(){
  paintRow.querySelectorAll('button').forEach(b => {
    const on = b.dataset.target === S.paint;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  const hex = currentPaintColor() || '';
  swEl.querySelectorAll('.sw').forEach(sw => {
    sw.classList.toggle('on', (sw.dataset.hex || '') === hex);
  });
  if (typeof syncStyleRows === 'function') syncStyleRows();
}
function applyColor(hex){
  if (S.paint === 'tint'){
    if (S.selNodes.length){
      snapshot();
      nodes.filter(n => S.selNodes.includes(n.id) && n.kind !== 'zone')
        .forEach(n => { n.fill = hex; n.tint = !!hex; });
      render();
    } else {
      S.color = hex; S.tint = !!hex;
    }
    return;
  }
  const prop = { line:'color', text:'tcolor', sub:'scolor' }[S.paint];
  if (S.paint === 'line' && S.selLinks.length && !S.selNodes.length){
    snapshot();
    links.filter(l => S.selLinks.includes(l.id)).forEach(l => l.color = hex);
  } else if (S.selNodes.length){
    snapshot();
    nodes.filter(n => S.selNodes.includes(n.id)).forEach(n => n[prop] = hex);
  } else {
    S[prop] = hex;
  }
  render();
}

/* ---------- stroke style, edges, width ---------- */
const SW = { s:0.6, m:1.2, l:2.2, xl:3.4 };
const LW = { s:0.8, m:1.5, l:2.6, xl:4.2 };
const strokeSegs = document.getElementById('stroke-segs');
const edgeSegs = document.getElementById('edge-segs');
const widthSegs = document.getElementById('width-segs');
const fillSegs = document.getElementById('fill-segs');
function styleNodes(){ return nodes.filter(n => S.selNodes.includes(n.id)); }
function styleLinks(){ return links.filter(l => S.selLinks.includes(l.id)); }
function setStrokeStyle(v){
  const ns = styleNodes();
  if (ns.length){ snapshot(); ns.forEach(n => n.stroke = v); }
  S.stroke = v;
  render();
}
function setSharp(v){
  const ns = styleNodes();
  if (ns.length){ snapshot(); ns.forEach(n => n.sharp = v); }
  S.sharp = v;
  render();
}
function setStrokeSize(key){
  const ns = styleNodes(), ls = styleLinks();
  if (ns.length || ls.length) snapshot();
  ns.forEach(n => n.sw = SW[key]);
  ls.forEach(l => l.lw = LW[key]);
  S.sw = SW[key];
  render();
}
function setFillMode(mode){
  const ns = styleNodes();
  if (ns.length){ snapshot(); ns.forEach(n => { n.fillmode = mode; n.tint = true; }); }
  S.fillmode = mode;
  render();
}
function syncStyleRows(){
  const n = S.selNodes.length ? byId(S.selNodes[0]) : null;
  const stroke = n ? (n.stroke || (n.dash ? 'dashed' : 'solid')) : S.stroke;
  const sharp = n ? n.sharp === true : S.sharp;
  const sw = n ? (n.sw || 1.2) : S.sw;
  const sizeKey = Object.keys(SW).find(k => Math.abs(SW[k] - sw) < 0.01) || 'm';
  strokeSegs.querySelectorAll('button').forEach(b =>
    b.classList.toggle('on', b.dataset.stroke === stroke));
  edgeSegs.querySelectorAll('button').forEach(b =>
    b.classList.toggle('on', (b.dataset.sharp === '1') === sharp));
  widthSegs.querySelectorAll('button').forEach(b =>
    b.classList.toggle('on', b.dataset.size === sizeKey));
  const mode = n ? (n.fillmode === 'solid' ? 'solid' : 'soft') : S.fillmode;
  fillSegs.querySelectorAll('button').forEach(b =>
    b.classList.toggle('on', b.dataset.fill === mode));
}
strokeSegs.querySelectorAll('button').forEach(b =>
  b.addEventListener('click', () => setStrokeStyle(b.dataset.stroke)));
edgeSegs.querySelectorAll('button').forEach(b =>
  b.addEventListener('click', () => setSharp(b.dataset.sharp === '1')));
widthSegs.querySelectorAll('button').forEach(b =>
  b.addEventListener('click', () => setStrokeSize(b.dataset.size)));
fillSegs.querySelectorAll('button').forEach(b =>
  b.addEventListener('click', () => setFillMode(b.dataset.fill)));

/* ---------- motion / font size ---------- */
const MODES = ['off','dots','dashes','both','live'];
const MLABEL = { off:'OFF', dots:'DOTS', dashes:'DASHES', both:'DASHES+DOTS', live:'LIVE' };
const motionBtn = document.getElementById('btn-motion');
motionBtn.addEventListener('click', () => setMotion('next'));
function setMotion(mode){
  if (mode === 'next')
    mode = S.selLinks.length
      ? MODES[(MODES.indexOf((links.find(l => l.id === S.selLinks[0]) || {}).motion || S.motion) + 1) % MODES.length]
      : MODES[(MODES.indexOf(S.motion) + 1) % MODES.length];
  if (S.selLinks.length){
    snapshot();
    links.filter(l => S.selLinks.includes(l.id)).forEach(l => l.motion = mode);
  } else {
    S.motion = mode;
    links.forEach(l => l.motion = null);
  }
  render();
}
function setDotSize(delta){
  S.dotSize = Math.min(9, Math.max(1.2, Math.round((S.dotSize + delta)*10)/10));
  toast('dot size ' + S.dotSize.toFixed(1));
  render();
}
function bumpFont(delta){
  if (!S.selNodes.length && !S.selLinks.length) return;
  snapshot();
  nodes.filter(n => S.selNodes.includes(n.id)).forEach(n => {
    n.fs = Math.min(4, Math.max(0.4, Math.round(((n.fs || 1) + delta) * 10) / 10));
  });
  links.filter(l => S.selLinks.includes(l.id)).forEach(l => {
    l.fs = Math.min(4, Math.max(0.4, Math.round(((l.fs || 1) + delta) * 10) / 10));
  });
  const l = links.find(x => S.selLinks.includes(x.id));
  if (l) toast('arrow note ' + (l.fs || 1).toFixed(1) + '×');
  render();
}

