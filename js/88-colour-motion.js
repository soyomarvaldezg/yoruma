/* ---------- colour ---------- */
const swEl = document.getElementById('swatches');
document.querySelectorAll('#paint button').forEach(b => {
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
  lab.style.cssText = 'display:block;' +
    (CUSTOM.hex ? `background:${CUSTOM.hex}` :
      'background:conic-gradient(#8F2D45,#B4632B,#96700F,#2E6B4F,#08829C,#3D6BB3,#6D4B8F,#8F2D45)');
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
    b.classList.toggle('on', b.dataset.target === S.paint);
  });
  const hex = currentPaintColor() || '';
  swEl.querySelectorAll('.sw').forEach(sw => {
    sw.classList.toggle('on', (sw.dataset.hex || '') === hex);
  });
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

