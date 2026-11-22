/* ---------- editor ---------- */
const edEl = document.getElementById('editor');
const edTitle = document.getElementById('e-title');
const edSub = document.getElementById('e-sub');
let edNode = null, edLink = null;

/* The title field grows with its own lines, so a note keeps its paragraph
   shape while you type. */
function growTitle(){
  if (edEl.style.display === 'none') return;
  edTitle.style.height = 'auto';
  edTitle.style.height = Math.min(240, Math.max(23, edTitle.scrollHeight)) + 'px';
}

/* A note and a heading carry their own line breaks. Their box grows to fit
   them, so the selection follows the words and lint sees no overflow. */
function fitTextBox(n){
  const heading = n.kind === 'heading';
  const fs = fscale(n);
  const size = (heading ? 20 : 21)*fs;
  const lh = 26*fs;
  const lines = String(n.title || '').split('\n');
  const longest = lines.reduce((max, line) => Math.max(max, line.length), 1);
  const per = size*(heading ? 0.9 : 0.64);
  n.w = Math.max(n.w, Math.ceil((longest + 1)*per + 12));
  n.h = Math.max(n.h, Math.ceil(21*fs + (lines.length - 1)*lh + 7*fs));
}

/* Text metrics differ by glyph, so after the first render the drawn block is
   measured and the box tightened around it. The width never drops below what
   wrapLines needs, or the next render would cut the line off. */
function sizeTextBox(n){
  const g = stage.querySelector('g.node[data-id="' + n.id + '"]');
  const el = g && g.querySelector('[data-role="title"]');
  if (!el) return false;
  const bb = el.getBBox();
  if (!bb.width && !bb.height) return false;
  const heading = n.kind === 'heading';
  const fs = fscale(n);
  const size = (heading ? 20 : 21)*fs;
  const lines = String(n.title || '').split('\n');
  const longest = lines.reduce((max, line) => Math.max(max, line.length), 1);
  const wrapW = heading ? 0 : 12 + (longest + 1)*0.58*size;
  const w = Math.max(60, Math.ceil(Math.max(wrapW, bb.width + 14)));
  const h = Math.max(28*fs, Math.ceil(bb.y + bb.height - n.y + 4));
  if (w === n.w && h === n.h) return false;
  n.w = w;
  n.h = h;
  return true;
}

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
  edTitle.placeholder = n.kind === 'zone' ? 'Zone name'
    : n.kind === 'text' ? 'Text — Enter starts a new line'
    : n.kind === 'heading' ? 'Heading — Enter starts a new line'
    : 'Title';
  growTitle();
  setTimeout(() => {
    growTitle();
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
  growTitle();
  setTimeout(() => { growTitle(); edTitle.focus(); edTitle.select(); }, 30);
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
  if (n.kind === 'text' || n.kind === 'heading'){
    fitTextBox(n);
    render();
    for (let i = 0; i < 2 && sizeTextBox(n); i++) render();
  } else render();
}
edTitle.addEventListener('input', growTitle);
edTitle.addEventListener('keydown', e => {
  if (e.key === 'Enter'){
    if (!edLink && edNode && (edNode.kind === 'text' || edNode.kind === 'heading')) return;
    e.preventDefault();
    if (!edLink && edSub.style.display !== 'none'){ edSub.focus(); edSub.select(); }
    else commitEdit();
  }
  if (e.key === 'Escape'){
    e.preventDefault();
    if (!edLink && edNode && (edNode.kind === 'text' || edNode.kind === 'heading')){
      commitEdit();
      return;
    }
    editing = null; edNode = null; edLink = null;
    edEl.style.display = 'none'; render();
  }
});
edSub.addEventListener('keydown', e => {
  if (e.key === 'Enter'){ e.preventDefault(); commitEdit(); }
  if (e.key === 'Escape'){ e.preventDefault(); editing = null; edNode = null; edLink = null;
    edEl.style.display = 'none'; render(); }
});
[edTitle, edSub].forEach(el => el.addEventListener('blur', () => {
  setTimeout(() => { if (editing && !edEl.contains(document.activeElement)) commitEdit(); }, 130);
}));
