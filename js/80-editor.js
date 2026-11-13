/* ---------- editor ---------- */
const edEl = document.getElementById('editor');
const edTitle = document.getElementById('e-title');
const edSub = document.getElementById('e-sub');
let edNode = null, edLink = null;

function editNode(n, focusSub){
  edNode = n; edLink = null; editing = n.id;
  const s = toScreen({ x:n.x, y:n.y });
  edEl.style.display = 'block';
  placeStylebar();
  placeShaper();
  edEl.style.left = Math.max(8, s.x) + 'px';
  edEl.style.top = Math.max(8, s.y + n.h*view.k + 8) + 'px';
  edEl.style.width = Math.max(200, Math.min(340, n.w*view.k)) + 'px';
  edTitle.value = n.title;
  edSub.value = n.sub || '';
  edSub.style.display = (n.kind === 'text' || n.kind === 'heading' || n.kind === 'zone')
    ? 'none' : 'block';
  edTitle.placeholder = n.kind === 'zone' ? 'Zone name' : 'Title';
  setTimeout(() => {
    const t = focusSub && edSub.style.display !== 'none' ? edSub : edTitle;
    t.focus(); t.select();
  }, 30);
}
function editLink(l){
  edNode = null; edLink = l; editing = l.id;
  const a = byId(l.from), b = byId(l.to);
  const m = a && b ? midPoint(route(a, b, bendsOf(l), l)) : { x:0, y:0 };
  const s = toScreen(m);
  edEl.style.display = 'block';
  placeStylebar();
  placeLinkbar();
  edEl.style.left = Math.max(8, s.x - 100) + 'px';
  edEl.style.top = Math.max(8, s.y + 10) + 'px';
  edEl.style.width = '220px';
  edTitle.value = l.label || '';
  edTitle.placeholder = 'Arrow label';
  edSub.style.display = 'none';
  setTimeout(() => { edTitle.focus(); edTitle.select(); }, 30);
}
function commitEdit(){
  if (!editing) return;
  if (edLink){
    const l = edLink;
    edLink = null; editing = null;
    edEl.style.display = 'none';
    snapshot();
    l.label = edTitle.value.trim();
    render();
    return;
  }
  if (!edNode) return;
  const n = edNode;
  edNode = null; editing = null;
  edEl.style.display = 'none';
  snapshot();
  n.title = edTitle.value.trim();
  if (n.kind !== 'text' && n.kind !== 'heading') n.sub = edSub.value.trim();
  render();
}
edTitle.addEventListener('keydown', e => {
  if (e.key === 'Enter'){
    e.preventDefault();
    if (!edLink && edSub.style.display !== 'none'){ edSub.focus(); edSub.select(); }
    else commitEdit();
  }
  if (e.key === 'Escape'){ editing = null; edNode = null; edLink = null;
    edEl.style.display = 'none'; render(); }
});
edSub.addEventListener('keydown', e => {
  if (e.key === 'Enter'){ e.preventDefault(); commitEdit(); }
  if (e.key === 'Escape'){ editing = null; edNode = null; edLink = null;
    edEl.style.display = 'none'; render(); }
});
[edTitle, edSub].forEach(el => el.addEventListener('blur', () => {
  setTimeout(() => { if (editing && !edEl.contains(document.activeElement)) commitEdit(); }, 130);
}));

