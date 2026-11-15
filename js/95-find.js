/* ---------- find a shape ---------- */
let findHits = [], findPick = 0;

function findMatches(q){
  const needle = q.trim().toLowerCase();
  const all = nodes.filter(n => n.kind !== 'frame');
  if (!needle) return all.slice(0, 8);
  return all.filter(n =>
    (n.title || '').toLowerCase().includes(needle) ||
    (n.sub || '').toLowerCase().includes(needle)
  ).slice(0, 8);
}

function renderFind(){
  const list = document.getElementById('find-list');
  const input = document.getElementById('find-input');
  if (!list || !input) return;
  findHits = findMatches(input.value);
  findPick = Math.min(findPick, Math.max(0, findHits.length - 1));
  list.innerHTML = '';
  if (!findHits.length){
    const d = document.createElement('div');
    d.className = 'find-empty';
    d.textContent = 'no shape matches';
    list.appendChild(d);
    return;
  }
  findHits.forEach((n, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'find-hit' + (i === findPick ? ' on' : '');
    b.dataset.id = n.id;
    const t = document.createElement('span');
    t.className = 'find-name';
    t.textContent = n.title || n.kind;
    const k = document.createElement('span');
    k.className = 'find-kind';
    k.textContent = n.kind;
    b.appendChild(t);
    b.appendChild(k);
    b.addEventListener('mousedown', ev => ev.preventDefault());
    b.addEventListener('click', () => jumpToShape(n.id));
    list.appendChild(b);
  });
  const on = list.querySelector('.find-hit.on');
  if (on && on.scrollIntoView) on.scrollIntoView({ block:'nearest' });
}

function openFind(){
  const box = document.getElementById('finder');
  const input = document.getElementById('find-input');
  if (!box || !input) return;
  box.hidden = false;
  box.classList.add('on');
  findPick = 0;
  input.value = '';
  renderFind();
  input.focus();
  input.select();
}

function closeFind(){
  const box = document.getElementById('finder');
  if (box){ box.hidden = true; box.classList.remove('on'); }
  const input = document.getElementById('find-input');
  if (input) input.blur();
}

function jumpToShape(id){
  const n = byId(id);
  if (!n) return;
  selectNodes([id], false);
  const r = stage.getBoundingClientRect();
  view.x = r.width/2 - (n.x + n.w/2)*view.k;
  view.y = r.height/2 - (n.y + n.h/2)*view.k;
  applyView();
  closeFind();
  render();
}

const findInput = document.getElementById('find-input');
if (findInput)
  findInput.addEventListener('input', () => { findPick = 0; renderFind(); });

document.addEventListener('pointerdown', ev => {
  const box = document.getElementById('finder');
  if (box && !box.hidden && !box.contains(ev.target)) closeFind();
}, true);

window.addEventListener('keydown', e => {
  const box = document.getElementById('finder');
  const open = box && !box.hidden;
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f'){
    e.preventDefault();
    e.stopImmediatePropagation();
    openFind();
    return;
  }
  if (!open) return;
  if (e.key === 'Escape'){
    e.preventDefault();
    e.stopImmediatePropagation();
    closeFind();
    return;
  }
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp'){
    if (!findHits.length) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    findPick = (findPick + (e.key === 'ArrowDown' ? 1 : -1) + findHits.length) %
      findHits.length;
    renderFind();
    return;
  }
  if (e.key === 'Enter'){
    if (!findHits.length) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    jumpToShape(findHits[findPick].id);
  }
});
