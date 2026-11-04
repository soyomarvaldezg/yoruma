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
            n.color = hex; n.tint = !!hex; n.fill = null;
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



function applyColor(hex){
  if (S.paint === 'tint'){
    if (S.selNodes.length){
      snapshot();
      nodes.filter(n => S.selNodes.includes(n.id) && n.kind !== 'zone')
        .forEach(n => { n.color = hex; n.tint = !!hex; n.fill = null; });
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
const MODES = ['off','dots','dashes','both'];
const MLABEL = { off:'OFF', dots:'DOTS', dashes:'DASHES', both:'DASHES+DOTS' };
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

