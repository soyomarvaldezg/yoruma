/* ---------- hud ---------- */
document.getElementById('z-in').addEventListener('click', () => zoomCenter(1.2));
document.getElementById('z-out').addEventListener('click', () => zoomCenter(1/1.2));
document.getElementById('z-fit').addEventListener('click', () => { fit(); save(); });
const helpEl = document.getElementById('help');
document.getElementById('btn-help').addEventListener('click', ev => {
  ev.stopPropagation();
  helpEl.classList.toggle('on');
});
helpEl.addEventListener('click', ev => ev.stopPropagation());
document.addEventListener('click', () => helpEl.classList.remove('on'));

const insertMenu = document.getElementById('insert-menu');
document.getElementById('btn-insert').addEventListener('click', ev => {
  ev.stopPropagation();
  closeTopMenus(insertMenu.classList.contains('on') ? null : 'insert-menu');
  insertMenu.classList.toggle('on');
});
insertMenu.addEventListener('click', ev => ev.stopPropagation());
document.addEventListener('click', () => insertMenu.classList.remove('on'));
insertMenu.querySelectorAll('button').forEach(b => {
  b.addEventListener('click', () => {
    insertMenu.classList.remove('on');
    if (b.dataset.insert === 'image') fileInput.click();
    else openLogoPicker(null);
  });
});

const presentBtn = document.getElementById('btn-present');
const presentBadge = document.getElementById('present-badge');
let presentSteps = [], presentIndex = 0, presentZoneId = null, presentAnim = null;
function presentZones(){
  const rank = n => {
    const m = /^\s*(\d+)/.exec(String(n.title || ''));
    return m ? Number(m[1]) : null;
  };
  return nodes.filter(n => n.kind === 'zone').slice().sort((a, b) => {
    if (a.step != null && b.step != null && a.step !== b.step) return a.step - b.step;
    if (a.step != null && b.step == null) return -1;
    if (a.step == null && b.step != null) return 1;
    const ra = rank(a), rb = rank(b);
    if (ra != null && rb != null && ra !== rb) return ra - rb;
    if (ra != null && rb == null) return -1;
    if (ra == null && rb != null) return 1;
    return (a.x - b.x) || (a.y - b.y);
  });
}
function stepMembers(f){
  const out = new Set();
  (f.members || []).forEach(id => {
    const n = byId(id);
    if (!n) return;
    out.add(n.id);
    if (n.kind === 'zone') zoneMembers(n).forEach(m => out.add(m.id));
  });
  return out;
}
function membersBox(f){
  const list = Array.from(stepMembers(f)).map(byId).filter(Boolean);
  if (!list.length) return null;
  const x = Math.min(...list.map(n => n.x)), y = Math.min(...list.map(n => n.y));
  const r = Math.max(...list.map(n => n.x + n.w)), b = Math.max(...list.map(n => n.y + n.h));
  return { x: x - 16, y: y - 16, w: r - x + 32, h: b - y + 32 };
}
function presentFrames(){
  return nodes.filter(n => n.kind === 'frame').slice().sort((a, b) => {
    if (a.step != null && b.step != null && a.step !== b.step) return a.step - b.step;
    if (a.step != null && b.step == null) return -1;
    if (a.step == null && b.step != null) return 1;
    return (a.x - b.x) || (a.y - b.y);
  });
}
function stepKey(ids){
  return Array.from(stepMembers({ members: ids })).sort().join('|');
}
function addStep(){
  const ids = Array.from(new Set(S.selNodes.filter(id => {
    const n = byId(id); return n && n.kind !== 'frame';
  })));
  if (!ids.length){ toast('select the shapes for this step first', 3200); return; }
  const key = stepKey(ids);
  const frames = presentFrames();
  const dup = frames.find(f => stepKey(f.members || []) === key);
  if (dup){
    toast('those shapes are already step ' + (frames.indexOf(dup) + 1), 4200);
    return;
  }
  snapshot();
  const f = { id:'n'+(uid++), kind:'frame', title:'Step ' + (frames.length + 1),
    sub:'', color:null, tcolor:null, scolor:null, fs:1, x:0, y:0, w:1, h:1,
    members: ids.slice(), step: frames.length + 1 };
  const box = membersBox(f);
  if (box){ f.x = box.x; f.y = box.y; f.w = box.w; f.h = box.h; }
  nodes.push(f);
  render();
  toast('step ' + f.step + ' added');
}
function moveStep(id, dir){
  const list = presentFrames();
  const i = list.findIndex(f => f.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  snapshot();
  const tmp = list[i];
  list[i] = list[j];
  list[j] = tmp;
  list.forEach((f, idx) => { f.step = idx + 1; });
  render();
}
function removeStep(id){
  snapshot();
  nodes = nodes.filter(n => n.id !== id);
  render();
}
function renderStepsMenu(){
  const el = document.getElementById('steps-menu');
  if (!el) return;
  el.innerHTML = '';
  const add = document.createElement('button');
  add.textContent = '+ STEP FROM SELECTION';
  add.disabled = !S.selNodes.length;
  add.addEventListener('click', () => { addStep(); renderStepsMenu(); });
  el.appendChild(add);
  const list = presentFrames();
  if (!list.length){
    const d = document.createElement('div');
    d.className = 'step-empty';
    d.textContent = 'no steps — present falls back to zones';
    el.appendChild(d);
    return;
  }
  list.forEach((f, i) => {
    const row = document.createElement('div');
    row.className = 'step-row';
    const num = document.createElement('span');
    num.className = 'num';
    num.textContent = String(i + 1).padStart(2, '0');
    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = f.title || 'step';
    name.title = 'Show this step';
    name.addEventListener('click', () => {
      selectNodes(Array.from(stepMembers(f)).filter(id => byId(id)), false);
      const b = membersBox(f);
      if (b) glideTo(viewFor({ x:b.x, y:b.y, w:b.w, h:b.h }));
      render();
    });
    const up = document.createElement('button');
    up.textContent = '↑';
    up.title = 'Move earlier';
    up.disabled = i === 0;
    up.addEventListener('click', () => { moveStep(f.id, -1); renderStepsMenu(); });
    const down = document.createElement('button');
    down.textContent = '↓';
    down.title = 'Move later';
    down.disabled = i === list.length - 1;
    down.addEventListener('click', () => { moveStep(f.id, 1); renderStepsMenu(); });
    const del = document.createElement('button');
    del.textContent = '×';
    del.title = 'Delete step';
    del.addEventListener('click', () => { removeStep(f.id); renderStepsMenu(); });
    row.appendChild(num);
    row.appendChild(name);
    row.appendChild(up);
    row.appendChild(down);
    row.appendChild(del);
    el.appendChild(row);
  });
}
function presentBox(){
  const z = presentZoneId ? nodes.find(n => n.id === presentZoneId) : null;
  if (z && z.kind === 'frame'){
    const b = membersBox(z);
    if (b) return b;
  }
  if (z) return { x: z.x - 20, y: z.y - 20, w: z.w + 40, h: z.h + 40 };
  const b = contentBBox();
  return { x: b.x, y: b.y, w: b.w, h: b.h };
}
function viewFor(b){
  const r = stage.getBoundingClientRect();
  const pad = 60;
  const k = Math.max(0.2, Math.min((r.width - pad*2)/Math.max(1, b.w),
                                   (r.height - pad*2)/Math.max(1, b.h), 1.3));
  return { k, x: (r.width - b.w*k)/2 - b.x*k, y: (r.height - b.h*k)/2 - b.y*k };
}
function glideTo(target){
  if (presentAnim) cancelAnimationFrame(presentAnim);
  presentAnim = null;
  const from = { x: view.x, y: view.y, k: view.k };
  const t0 = performance.now(), dur = 320;
  const step = now => {
    const t = Math.min(1, (now - t0) / dur);
    const e = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2)/2;
    view.x = from.x + (target.x - from.x)*e;
    view.y = from.y + (target.y - from.y)*e;
    view.k = from.k + (target.k - from.k)*e;
    applyView();
    if (t < 1) presentAnim = requestAnimationFrame(step);
    else presentAnim = null;
  };
  presentAnim = requestAnimationFrame(step);
}
function showStep(i){
  if (!presentSteps.length) return;
  presentIndex = Math.min(presentSteps.length - 1, Math.max(0, i));
  const z = presentSteps[presentIndex];
  presentZoneId = z ? z.id : null;
  render();
  glideTo(viewFor(presentBox()));
  const label = z ? (z.title || 'zone') : 'overview';
  presentBadge.textContent = (presentIndex + 1) + ' / ' + presentSteps.length + ' · ' + label;
}
function stepPresent(dir){
  if (!document.body.classList.contains('present')) return;
  showStep(presentIndex + dir);
}
function renderLegend(){
  const el = document.getElementById('legend');
  const rows = [];
  const zones = nodes.filter(n => n.kind === 'zone' && n.title);
  zones.forEach(z => {
    const accent = accentOf(z) || LINE;
    rows.push(`<div class="lg-row"><span class="lg-sw" style="background:${hexA(accent, .14)};` +
      `border:1.4px dashed ${accent}"></span>${escapeHtml(z.title)}</div>`);
  });
  const styles = [];
  const seen = new Set();
  links.forEach(l => {
    const mode = l.motion || S.motion;
    let key = 'solid', label = 'flow';
    if (l.dash === true && mode === 'off'){ key = 'dashed'; label = 'batch / retiring'; }
    else if (mode === 'dots'){ key = 'dots'; label = 'events'; }
    else if (mode === 'dashes'){ key = 'dashes'; label = 'stream'; }
    else if (mode === 'both'){ key = 'both'; label = 'stream + events'; }
    else if (mode === 'live'){ key = 'live'; label = 'live path'; }
    if (seen.has(key)) return;
    seen.add(key);
    const col = colorAt(l.color) || LINE;
    const dash = key === 'dashed' ? 'dashed' : key === 'dots' ? 'dotted' : 'solid';
    const label2 = key === 'solid' ? 'dependency' : label;
    styles.push(`<div class="lg-row"><span class="lg-line" style="border-top-color:${col};` +
      `border-top-style:${dash}"></span>${escapeHtml(label2)}</div>`);
  });
  if (!rows.length && !styles.length){ el.classList.remove('on'); return; }
  el.innerHTML = '<div class="lg-head">Key</div>' + rows.join('') +
    (rows.length && styles.length ? '<div class="lg-sep"></div>' : '') + styles.join('');
  el.classList.add('on');
}
function toggleLegend(){
  const el = document.getElementById('legend');
  if (el.classList.contains('on')){ el.classList.remove('on'); return; }
  renderLegend();
}
function escapeHtml(v){
  return String(v == null ? '' : v).replace(/[&<>"]/g, c =>
    ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
}
function setPresent(on){
  document.body.classList.toggle('present', on);
  presentBtn.textContent = on ? 'EXIT' : 'PRESENT';
  if (presentAnim){ cancelAnimationFrame(presentAnim); presentAnim = null; }
  if (on){
    clearSel();
    const frames = presentFrames();
    presentSteps = [null].concat(frames.length ? frames : presentZones());
    render();
    showStep(0);
    renderLegend();
  } else {
    presentSteps = []; presentIndex = 0; presentZoneId = null;
    presentBadge.textContent = '';
    document.getElementById('legend').classList.remove('on');
    render();
    fit();
  }
}
presentBtn.addEventListener('click', () =>
  setPresent(!document.body.classList.contains('present')));
function closeTopMenus(keep){
  ['insert-menu', 'steps-menu', 'demo-menu', 'menu'].forEach(id => {
    if (id === keep) return;
    const el = document.getElementById(id);
    if (el) el.classList.remove('on');
  });
}
const stepsMenu = document.getElementById('steps-menu');
document.getElementById('btn-steps').addEventListener('click', ev => {
  ev.stopPropagation();
  renderStepsMenu();
  closeTopMenus(stepsMenu.classList.contains('on') ? null : 'steps-menu');
  stepsMenu.classList.toggle('on');
});
stepsMenu.addEventListener('click', ev => ev.stopPropagation());
document.addEventListener('click', () => stepsMenu.classList.remove('on'));

function clearDoc(){
  if ((nodes.length || links.length) &&
      !confirm('Clear the whole document? Undo restores it until reload.')) return;
  snapshot(); nodes = []; links = []; clearSel(); render(); fit();
}
function loadExample(id){
  const ex = EXAMPLES.find(e => e.id === id);
  if (!ex) return;
  if ((nodes.length || links.length) &&
      !confirm('Load “' + ex.name + '”? This replaces the current document. Undo restores it.')) return;
  snapshot();
  nodes = JSON.parse(JSON.stringify(ex.nodes));
  links = JSON.parse(JSON.stringify(ex.links));
  S.selNodes = []; S.selLinks = [];
  render(); fit();
}
function renderDemoMenu(){
  const el = document.getElementById('demo-menu');
  el.innerHTML = '';
  const add = (label, fn) => {
    const b = document.createElement('button');
    b.textContent = label;
    b.addEventListener('click', () => { el.classList.remove('on'); fn(); });
    el.appendChild(b);
  };
  add('Blank canvas', clearDoc);
  EXAMPLES.forEach(ex => add(ex.name, () => loadExample(ex.id)));
}
const demoMenu = document.getElementById('demo-menu');
document.getElementById('btn-demo').addEventListener('click', ev => {
  ev.stopPropagation();
  renderDemoMenu();
  closeTopMenus(demoMenu.classList.contains('on') ? null : 'demo-menu');
  demoMenu.classList.toggle('on');
});
demoMenu.addEventListener('click', ev => ev.stopPropagation());
document.addEventListener('click', () => demoMenu.classList.remove('on'));



function reloadConflict(){
  if (confirm("Reload and load the version saved by the other tab? Export JSON first if you need this tab's changes."))
    location.reload();
}
window.addEventListener('storage', ev => {
  if (ev.key !== KEY && ev.key !== null) return;
  if (ev.newValue){
    try {
      const d = JSON.parse(ev.newValue);
      if (d && JSON.stringify({ nodes:d.nodes, links:d.links, motion:d.motion }) === contentPayload())
        return;
    } catch (e){}
  }
  const first = !tabConflict;
  tabConflict = true;
  const b = document.getElementById('tab-warn');
  if (b) b.classList.add('on');
  if (first) toast('another tab changed the document; autosave paused, export JSON or reload', 7000);
});
document.getElementById('tab-warn').addEventListener('click', reloadConflict);
document.getElementById('recover-warn').addEventListener('click', downloadRecovery);

function toast(msg, ms = 1800){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('on'), ms);
}

function setStatus(parts){
  const el = document.getElementById('status');
  el.textContent = '';
  parts.forEach(part => {
    if (typeof part === 'string'){
      el.appendChild(document.createTextNode(part));
    } else {
      const b = document.createElement('b');
      b.textContent = part.bold;
      el.appendChild(b);
    }
  });
}

function syncHud(){
  const total = S.selNodes.length + S.selLinks.length;
  const tgt = PAINT_LABEL[S.paint] || 'outline';
  document.querySelectorAll('#paint button').forEach(b =>
    b.classList.toggle('on', b.dataset.target === S.paint));
  if (!total) setStatus([{ bold:'nothing selected' }]);
  else if (total === 1 && S.selNodes.length){
    const n = byId(S.selNodes[0]);
    setStatus(n ? [{ bold:n.kind }, ' · ' + (n.title || 'no title')] : []);
  } else if (total === 1){
    const l = links.find(x => x.id === S.selLinks[0]);
    const from = l && byId(l.from), to = l && byId(l.to);
    setStatus(from && to
      ? [{ bold:'arrow' }, ' · ' + (from.title || '') + ' → ' + (to.title || '')]
      : [{ bold:'arrow' }]);
  } else setStatus([{ bold:total }, ' selected']);

  const prop = { line:'color', text:'tcolor', sub:'scolor', tint:'color' }[S.paint];
  let cur = S[prop];
  if (S.selNodes.length) cur = (byId(S.selNodes[0]) || {})[prop];
  if (S.selLinks.length && !S.selNodes.length) cur = (links.find(l => l.id === S.selLinks[0]) || {}).color;
  swEl.querySelectorAll('.sw').forEach(d => {
    const v = d.dataset.hex === '' ? null : d.dataset.hex;
    d.classList.toggle('on', v === (cur == null ? null : String(cur)));
  });

  const mode = S.selLinks.length
    ? ((links.find(l => l.id === S.selLinks[0]) || {}).motion || S.motion)
    : S.motion;
  motionBtn.textContent = 'FLOW · ' + MLABEL[mode];
}

