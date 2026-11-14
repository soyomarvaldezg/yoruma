/* ---------- hud ---------- */
const PANEL_KEY = 'yoruma.panel.v1';
function togglePanel(force){
  S.panel = force == null ? !S.panel : !!force;
  document.body.classList.toggle('panel-off', !S.panel);
  try { localStorage.setItem(PANEL_KEY, S.panel ? '1' : '0'); } catch (e){}
}
document.getElementById('btn-panel').addEventListener('click', () => togglePanel());
document.getElementById('btn-image').addEventListener('click', () => fileInput.click());
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

const presentBtn = document.getElementById('btn-present');
const presentBadge = document.getElementById('present-badge');
presentBadge.title = 'Back to the overview (0 or Home)';
presentBadge.addEventListener('click', () => {
  if (document.body.classList.contains('present')) showStep(0);
});
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
  const f = { id:'n'+(uid++), kind:'frame', title:'',
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
/* A step is its members. When a member disappears, drop it from the step;
   when the last one goes, the step goes too. Numbering stays contiguous. */
function pruneSteps(){
  let changed = false;
  nodes = nodes.filter(n => {
    if (n.kind !== 'frame') return true;
    const before = (n.members || []).length;
    n.members = (n.members || []).filter(id => byId(id));
    if (!n.members.length){ changed = true; return false; }
    if (n.members.length !== before){
      changed = true;
      const b = membersBox(n);
      if (b){ n.x = b.x; n.y = b.y; n.w = b.w; n.h = b.h; }
    }
    return true;
  });
  if (changed) presentFrames().forEach((f, i) => { f.step = i + 1; });
  return changed;
}
function clearSteps(){
  const list = presentFrames();
  if (!list.length){ toast('no steps to clear', 2400); return; }
  snapshot();
  const ids = new Set(list.map(f => f.id));
  nodes = nodes.filter(n => !ids.has(n.id));
  render();
  toast(list.length === 1 ? 'step cleared' : list.length + ' steps cleared');
}
/* A step's number is positional, so a name that only repeats it would go stale
   the moment steps are reordered. Empty titles fall back to the number. */
function stepName(f, i){
  return f.title || 'Step ' + (i + 1);
}
function renameStep(f, name){
  const input = document.createElement('input');
  input.className = 'step-name-edit';
  input.value = f.title || '';
  input.placeholder = stepName(f, presentFrames().indexOf(f));
  input.maxLength = 80;
  input.setAttribute('aria-label', 'Step name');
  name.replaceWith(input);
  input.focus();
  input.select();
  let done = false;
  const commit = keep => {
    if (done) return;
    done = true;
    const v = keep ? input.value.trim() : (f.title || '');
    if (keep && v !== (f.title || '')){ snapshot(); f.title = v; render(); }
    renderStepsMenu();
  };
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter'){ e.preventDefault(); commit(true); }
    else if (e.key === 'Escape'){ e.preventDefault(); commit(false); }
  });
  input.addEventListener('blur', () => commit(true));
}
const STEPNUMS_KEY = 'yoruma.stepnums.v1';
const stepNums = { edit:true, present:false };
try {
  const saved = JSON.parse(localStorage.getItem(STEPNUMS_KEY) || 'null');
  if (saved && typeof saved === 'object'){
    if (typeof saved.edit === 'boolean') stepNums.edit = saved.edit;
    if (typeof saved.present === 'boolean') stepNums.present = saved.present;
  }
} catch (e){}
const numsBtn = document.getElementById('z-nums');
function numsActive(){
  return document.body.classList.contains('present')
    ? !!stepNums.present : !!stepNums.edit;
}
function applyStepNums(){
  document.body.classList.toggle('step-nums-off', !stepNums.edit);
  document.body.classList.toggle('show-step-nums', !!stepNums.present);
  if (numsBtn){
    const on = numsActive();
    numsBtn.classList.toggle('on', on);
    numsBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  try { localStorage.setItem(STEPNUMS_KEY, JSON.stringify(stepNums)); } catch (e){}
}
function toggleStepNumsPresent(){
  stepNums.present = !stepNums.present;
  applyStepNums();
  toast('step numbers ' + (stepNums.present ? 'on' : 'off') + ' in present mode');
}
function toggleStepNumsHere(){
  if (document.body.classList.contains('present')){
    toggleStepNumsPresent();
    return;
  }
  stepNums.edit = !stepNums.edit;
  applyStepNums();
  toast('step numbers ' + (stepNums.edit ? 'on' : 'off') + ' while editing');
}
applyStepNums();
if (numsBtn) numsBtn.addEventListener('click', toggleStepNumsHere);
function stepNumsRow(){
  const box = document.createElement('div');
  box.className = 'step-prefs';
  [['edit', 'while editing'], ['present', 'in present mode']].forEach(([key, label]) => {
    const l = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !!stepNums[key];
    input.addEventListener('change', () => {
      stepNums[key] = input.checked;
      applyStepNums();
    });
    l.appendChild(input);
    l.appendChild(document.createTextNode(label));
    box.appendChild(l);
  });
  return box;
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
  const numsLabel = document.createElement('div');
  numsLabel.className = 'menu-label';
  numsLabel.textContent = 'Show step numbers';
  el.appendChild(numsLabel);
  el.appendChild(stepNumsRow());
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
    name.textContent = stepName(f, i);
    name.title = 'Show this step — double-click to rename';
    name.addEventListener('click', () => {
      selectNodes(Array.from(stepMembers(f)).filter(id => byId(id)), false);
      const b = membersBox(f);
      if (b) glideTo(viewFor({ x:b.x, y:b.y, w:b.w, h:b.h }));
      render();
    });
    name.addEventListener('dblclick', ev => {
      ev.stopPropagation();
      ev.preventDefault();
      renameStep(f, name);
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
    del.className = 'del';
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
  const sep = document.createElement('div');
  sep.className = 'menu-sep';
  el.appendChild(sep);
  const clear = document.createElement('button');
  clear.className = 'clear-steps';
  clear.textContent = 'Clear all steps';
  clear.title = 'Remove every step; the shapes stay';
  clear.addEventListener('click', () => { clearSteps(); renderStepsMenu(); });
  el.appendChild(clear);
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
  const label = z ? (z.kind === 'frame'
    ? stepName(z, presentIndex - 1) : (z.title || 'zone')) : 'overview';
  const total = presentSteps.length - 1;
  presentBadge.textContent = presentIndex === 0
    ? (total ? 'overview · 0 / ' + total : 'overview')
    : presentIndex + ' / ' + total + ' · ' + label;
}
function stepPresent(dir){
  if (!document.body.classList.contains('present')) return;
  showStep(presentIndex + dir);
}
function setPresent(on){
  document.body.classList.toggle('present', on);
  presentBtn.textContent = on ? 'EXIT' : 'PRESENT';
  applyStepNums();
  if (presentAnim){ cancelAnimationFrame(presentAnim); presentAnim = null; }
  if (on){
    clearSel();
    const frames = presentFrames();
    presentSteps = [null].concat(frames.length ? frames : presentZones());
    render();
    showStep(0);
  } else {
    presentSteps = []; presentIndex = 0; presentZoneId = null;
    presentBadge.textContent = '';
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
  const where = pages.length > 1 ? 'this page' : 'the whole document';
  if ((nodes.length || links.length) &&
      !confirm('Clear ' + where + '? Undo restores it until reload.')) return;
  snapshot(); nodes = []; links = []; clearSel(); render(); fit(); save();
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
  const add = (label, fn, note) => {
    const b = document.createElement('button');
    b.textContent = label;
    if (note) b.title = note;
    b.addEventListener('click', () => { el.classList.remove('on'); fn(); });
    el.appendChild(b);
  };
  add('Blank canvas', clearDoc);
  EXAMPLES.forEach(ex => add(ex.name, () => loadExample(ex.id),
    ex.sourceName ? 'Based on ' + ex.sourceName : ''));
  const src = document.createElement('div');
  src.className = 'menu-source';
  src.appendChild(document.createTextNode('Sources: '));
  [
    ['a16z data architectures',
      'https://a16z.com/emerging-architectures-for-modern-data-infrastructure/'],
    ['AWS', 'https://aws.amazon.com/architecture/'],
    ['Google Cloud', 'https://docs.cloud.google.com/architecture'],
    ['Azure', 'https://learn.microsoft.com/en-us/azure/architecture/']
  ].forEach(([label, href], i) => {
    if (i) src.appendChild(document.createTextNode(' · '));
    const a = document.createElement('a');
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = label;
    src.appendChild(a);
  });
  el.appendChild(src);
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
  const motionLabel = motionBtn.querySelector('.hlabel');
  if (motionLabel) motionLabel.textContent = 'FLOW · ' + MLABEL[mode];
  else motionBtn.textContent = 'FLOW · ' + MLABEL[mode];
}

