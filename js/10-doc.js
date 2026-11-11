/* ---------- seed ---------- */
const DEMO = [
  ['oltp','store',60,250,'OLTP Databases','Oracle · Salesforce'],
  ['events','queue',60,380,'Event Collectors','Segment · Snowplow'],
  ['files','file',60,490,'Object Storage','S3 · GCS · ADLS'],
  ['repl','box',330,250,'Data Replication','Fivetran · Airbyte'],
  ['stream','box',330,380,'Event Streaming','Kafka · Kinesis'],
  ['wh','store',590,130,'Data Warehouse','Snowflake · BigQuery'],
  ['lake','table',590,290,'Data Lake','Delta · Iceberg'],
  ['spark','box',860,290,'Spark Platform','Databricks · EMR'],
  ['model','table',1100,150,'Data Modeling','dbt · LookML'],
  ['dash','box',1100,380,'Dashboards','Looker · Superset'],
  ['serving','cloud',1330,250,'Serving Layer','Cube · Metabase'],
  ['analysts','people',1560,250,'Analysts','Business users']
];
const DEMO_LINKS = [
  ['oltp','repl'],['events','stream'],['files','lake'],['repl','wh'],
  ['repl','lake'],['stream','lake'],['lake','spark'],['wh','spark'],
  ['spark','model'],['model','dash'],['dash','serving'],['serving','analysts']
];

function loadDemo(){
  nodes = DEMO.map(([id,kind,x,y,title,sub]) => ({
    id, kind, title, sub, color:null, tcolor:null, scolor:null, fs:1,
    x, y, w:SIZE[kind][0], h:SIZE[kind][1]
  }));
  links = DEMO_LINKS.map(([a,b]) => ({
    id:'k'+(uid++), from:a, to:b, color:null, motion:null, label:'', way:null
  }));
  S.selNodes = []; S.selLinks = [];
  undoStack.length = 0; redoStack.length = 0;
}
function snapshot(){
  undoStack.push(JSON.stringify({ nodes, links }));
  if (undoStack.length > 60) undoStack.shift();
  redoStack.length = 0;
}
function undo(){
  const raw = undoStack.pop();
  if (!raw) return;
  redoStack.push(JSON.stringify({ nodes, links }));
  if (redoStack.length > 60) redoStack.shift();
  const d = JSON.parse(raw);
  nodes = d.nodes; links = d.links;
  S.selNodes = []; S.selLinks = [];
  render();
}
function redo(){
  const raw = redoStack.pop();
  if (!raw) return;
  undoStack.push(JSON.stringify({ nodes, links }));
  if (undoStack.length > 60) undoStack.shift();
  const d = JSON.parse(raw);
  nodes = d.nodes; links = d.links;
  S.selNodes = []; S.selLinks = [];
  render();
}

/* ---------- pages ---------- */
let pages = [{ id:'p1', name:'Page 1', nodes:[], links:[], view:null }];
let pageId = 'p1';
const pageById = id => pages.find(p => p.id === id) || pages[0];
const currentPage = () => pageById(pageId);
function syncPage(){
  const p = currentPage();
  p.nodes = nodes;
  p.links = links;
  p.view = { x:view.x, y:view.y, k:view.k };
  pageId = p.id;
}
function syncPageInto(id){
  const p = pageById(id);
  pageId = p.id;
  nodes = p.nodes;
  links = p.links;
  return p;
}
function renderPages(){
  const el = document.getElementById('pages');
  if (!el) return;
  el.innerHTML = '';
  pages.forEach(p => {
    const b = document.createElement('button');
    b.className = 'page-tab' + (p.id === pageId ? ' on' : '');
    b.textContent = p.name;
    b.title = 'Open ' + p.name + ' — double-click to rename';
    b.dataset.page = p.id;
    b.addEventListener('click', () => switchPage(p.id));
    b.addEventListener('dblclick', ev => {
      ev.preventDefault();
      const name = prompt('Page name', p.name);
      if (name && name.trim()){ p.name = name.trim().slice(0, 40); renderPages(); save(); }
    });
    if (pages.length > 1){
      const x = document.createElement('span');
      x.className = 'page-x';
      x.textContent = '×';
      x.title = 'Delete this page';
      x.addEventListener('click', ev => { ev.stopPropagation(); deletePage(p.id); });
      b.appendChild(x);
    }
    el.appendChild(b);
  });
  const add = document.createElement('button');
  add.className = 'page-add';
  add.textContent = '+';
  add.title = 'New page (⌥→ from the last one)';
  add.setAttribute('aria-label', 'New page');
  add.addEventListener('click', () => addPage());
  el.appendChild(add);
  if (pages.length < 2) el.classList.add('single'); else el.classList.remove('single');
}
function switchPage(id){
  if (id === pageId) return;
  syncPage();
  const p = pageById(id);
  pageId = p.id;
  nodes = p.nodes;
  links = p.links;
  S.selNodes = []; S.selLinks = [];
  hoverId = null; lastHit = { id:null, t:0 };
  inked = inked; // ink is global, not per page
  render();
  if (p.view){ view.x = p.view.x; view.y = p.view.y; view.k = p.view.k; applyView(); }
  else fit();
  renderPages();
  save();
}
function addPage(name){
  syncPage();
  const p = { id:'p' + (++uid), name: (name || ('Page ' + (pages.length + 1))).slice(0, 40),
    nodes:[], links:[], view:null };
  pages.push(p);
  pageId = p.id;
  nodes = []; links = [];
  S.selNodes = []; S.selLinks = [];
  render(); renderPages(); fit(); save();
  return p;
}
function deletePage(id){
  syncPage();
  if (pages.length < 2){ toast('the document needs at least one page'); return; }
  const p = pageById(id);
  if ((p.nodes.length || p.links.length) &&
      !confirm('Delete “' + p.name + '” and everything on it?')) return;
  pages = pages.filter(x => x.id !== p.id);
  if (pageId === p.id){
    pageId = pages[0].id;
    nodes = pages[0].nodes; links = pages[0].links;
    S.selNodes = []; S.selLinks = [];
    render();
    if (pages[0].view){ view.x = pages[0].view.x; view.y = pages[0].view.y; view.k = pages[0].view.k; applyView(); }
    else fit();
  }
  renderPages(); save();
  toast('page deleted');
}

/* ---------- persistence ---------- */
const KEY = 'yoruma.doc.v1';
const BROKEN_KEY = 'yoruma.doc.v1.broken';
let saveTimer = null, saveWarned = false;
let restoreError = null, recoveryRaw = null, tabConflict = false;
function saveNow(quiet){
  const warn = document.getElementById('save-warn');
  if (tabConflict) return false;
  try {
    syncPage();
    localStorage.setItem(KEY, JSON.stringify({
      nodes, links, motion:S.motion,
      view:{ x:view.x, y:view.y, k:view.k },
      pages, page: pageId
    }));
    if (warn) warn.classList.remove('on');
    if (saveWarned && !quiet) toast('autosave resumed');
    saveWarned = false;
    return true;
  } catch (e){
    if (warn) warn.classList.add('on');
    if (!saveWarned && !quiet) toast('autosave failed: storage full or blocked', 6000);
    else if (!saveWarned) console.warn('yoruma autosave failed', e);
    saveWarned = true;
    return false;
  }
}
function save(){
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 400);
}
function contentPayload(){
  syncPage();
  return JSON.stringify({ nodes, links, motion:S.motion, pages, page: pageId });
}
function restore(){
  let raw = null;
  try {
    raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    if (!d || !Array.isArray(d.nodes)) throw new Error('not a yoruma document');
    const doc = parseDoc(JSON.stringify({
      format:'yoruma', version:1,
      nodes:d.nodes, links:Array.isArray(d.links) ? d.links : [],
      motion:d.motion, view:d.view, pages:d.pages, page:d.page
    }));
    pages = doc.pages;
    pageId = doc.page;
    syncPageInto(pageId);
    S.motion = doc.motion;
    if (doc.view){ view.x = doc.view.x; view.y = doc.view.y; view.k = doc.view.k; }
    uid = 1;
    pages.forEach(p => [...p.nodes, ...p.links].forEach(o => {
      const m = /(\d+)$/.exec(String(o.id));
      if (m) uid = Math.max(uid, +m[1] + 1);
    }));
    const pm = /(\d+)$/.exec(String(pageId));
    if (pm) uid = Math.max(uid, +pm[1] + 1);
    return true;
  } catch (e){
    restoreError = e;
    recoveryRaw = raw;
    try { if (raw) localStorage.setItem(BROKEN_KEY, raw); } catch (e2){}
    return false;
  }
}
function showRecovery(){
  try { recoveryRaw = recoveryRaw || localStorage.getItem(BROKEN_KEY); } catch (e){}
  if (!recoveryRaw) return;
  const b = document.getElementById('recover-warn');
  if (b) b.classList.add('on');
  toast('saved document was unreadable; RECOVER downloads a copy', 6000);
}
function downloadRecovery(){
  let raw = recoveryRaw;
  if (!raw){ try { raw = localStorage.getItem(BROKEN_KEY); } catch (e){} }
  if (!raw){ toast('no recovery copy'); return; }
  download('yoruma-recovery.json', new Blob([raw], { type:'application/json' }));
  recoveryRaw = null;
  try { localStorage.removeItem(BROKEN_KEY); } catch (e){}
  const b = document.getElementById('recover-warn');
  if (b) b.classList.remove('on');
  toast('recovery json downloaded');
}

