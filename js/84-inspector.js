/* ---------- inspector ---------- */
const inspectEl = document.getElementById('inspect');
const iX = document.getElementById('i-x'), iY = document.getElementById('i-y');
const iW = document.getElementById('i-w'), iH = document.getElementById('i-h');
const iStatus = document.getElementById('i-status');
let boxEdit = null;

function syncInspector(){
  const n = S.selNodes.length === 1 ? byId(S.selNodes[0]) : null;
  const ae = document.activeElement;
  const editingBox = ae && ae.tagName === 'INPUT' && inspectEl.contains(ae);
  if (!editingBox) boxEdit = null;
  [iX,iY,iW,iH].forEach(el => { el.disabled = !n; });
  if (n){
    if (!editingBox){
      iX.value = Math.round(n.x); iY.value = Math.round(n.y);
      iW.value = Math.round(n.w); iH.value = Math.round(n.h);
    }
    iStatus.textContent = n.kind + (n.title ? ' · ' + n.title : '');
  } else {
    if (!editingBox) [iX,iY,iW,iH].forEach(el => { el.value = ''; });
    iStatus.textContent = S.selNodes.length
      ? S.selNodes.length + ' shapes'
      : (S.selLinks.length ? 'arrow selected' : 'nothing selected');
  }
}

function commitBox(){
  const id = boxEdit != null ? boxEdit : (S.selNodes.length === 1 ? S.selNodes[0] : null);
  const n = id ? byId(id) : null;
  if (!n || [iX,iY,iW,iH].some(el => el.value.trim() === '')){ syncInspector(); return; }
  const x = Number(iX.value), y = Number(iY.value);
  const w = Number(iW.value), h = Number(iH.value);
  if (![x,y,w,h].every(Number.isFinite)){ syncInspector(); return; }
  snapshot();
  const nx = Math.round(x), ny = Math.round(y);
  if (n.kind === 'zone'){
    const ow = n.w || 1, oh = n.h || 1;
    const nw = Math.max(1, Math.round(w)), nh = Math.max(1, Math.round(h));
    nodes.forEach(m => {
      if (m.kind !== 'zone' && m.x >= n.x && m.y >= n.y &&
          m.x + m.w <= n.x + n.w && m.y + m.h <= n.y + n.h){
        const rx = (m.x - n.x)/ow, ry = (m.y - n.y)/oh;
        if (nw !== ow) m.w = Math.max(12, Math.round(m.w/ow*nw));
        if (nh !== oh) m.h = Math.max(12, Math.round(m.h/oh*nh));
        m.x = Math.round(nx + rx*nw);
        m.y = Math.round(ny + ry*nh);
      }
    });
  }
  n.x = nx; n.y = ny;
  n.w = Math.max(1, Math.round(w));
  n.h = Math.max(1, Math.round(h));
  render();
}



[iX,iY,iW,iH].forEach(el => {
  el.addEventListener('focus', () => {
    boxEdit = S.selNodes.length === 1 ? S.selNodes[0] : null;
    el.select();
  });
  el.addEventListener('change', commitBox);
  el.addEventListener('blur', () => setTimeout(syncInspector, 0));
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter'){ e.preventDefault(); el.blur(); }
  });
});

