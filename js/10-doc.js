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

/* ---------- persistence ---------- */
const KEY = 'yoruma.doc.v1';
const BROKEN_KEY = 'yoruma.doc.v1.broken';
let saveTimer = null, saveWarned = false;
let restoreError = null, recoveryRaw = null, tabConflict = false;
function saveNow(quiet){
  const warn = document.getElementById('save-warn');
  if (tabConflict) return false;
  try {
    localStorage.setItem(KEY, JSON.stringify({
      nodes, links, motion:S.motion,
      view:{ x:view.x, y:view.y, k:view.k }
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
  return JSON.stringify({ nodes, links, motion:S.motion });
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
      motion:d.motion, view:d.view
    }));
    nodes = doc.nodes;
    links = doc.links;
    S.motion = doc.motion;
    if (doc.view){ view.x = doc.view.x; view.y = doc.view.y; view.k = doc.view.k; }
    uid = 1;
    [...nodes, ...links].forEach(o => {
      const m = /(\d+)$/.exec(String(o.id));
      if (m) uid = Math.max(uid, +m[1] + 1);
    });
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

