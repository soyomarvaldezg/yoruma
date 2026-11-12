const NS = 'http://www.w3.org/2000/svg';

const INK = '#2D3141', MUTED = '#4A5670', LINE = '#657486',
      CARD = '#E6EDF2', PAPER = '#CFDDE6', FIBER = '#08829C';

const ACCENTS = ['#1D1D1D','#9FA8B2','#E599F7','#AE3EC9',
                 '#4263EB','#4DABF7','#F6B26B','#F76707',
                 '#099268','#40C057','#FF8787','#E03131',
                 '#0C8599','#66A80F','#846358','#D6336C'];

const ICON = {
  select:'<path d="M6 3l12 7-5 1.3L10 18z"/>',
  hand:'<path d="M8 11V5.7a1.35 1.35 0 0 1 2.7 0V10m0-5.6a1.35 1.35 0 0 1 2.7 0V10m0-4.4a1.35 1.35 0 0 1 2.7 0v6.2m0-3a1.35 1.35 0 0 1 2.7 0v5c0 4.4-2.8 7-6.7 7-2.9 0-4.3-1-5.9-3.5l-2.3-3.6c-.5-.8.2-1.9 1.2-1.8.6.1 1.1.5 1.5 1.1L8 11z"/>',
  arrow:'<path d="M4.5 19.5L19 5M12 5h7v7"/>',
  line:'<path d="M4.5 19.5L19.5 4.5"/>',
  box:'<rect x="4" y="5.5" width="16" height="13" rx="1.5"/>',
  ellipse:'<ellipse cx="12" cy="12" rx="8.5" ry="6.5"/>',
  zone:'<rect x="3.5" y="4.5" width="17" height="15" rx="2" stroke-dasharray="3 2.6"/>',
  table:'<rect x="4" y="5.5" width="16" height="13" rx="1.5"/><path d="M4 9.5h16"/>',
  store:'<ellipse cx="12" cy="7" rx="7.5" ry="2.8"/><path d="M4.5 7v10a7.5 2.8 0 0 0 15 0V7"/>',
  queue:'<rect x="3" y="8.5" width="18" height="7" rx="1"/><path d="M7 8.5v7M17 8.5v7"/>',
  cloud:'<path d="M7.5 18h9a4 4 0 0 0 .4-7.98A5.6 5.6 0 0 0 6.3 9.4 4.3 4.3 0 0 0 7.5 18z"/>',
  file:'<path d="M7 3.5h6.5L18 8v12.5H7z"/><path d="M13.5 3.5V8H18"/>',
  api:'<circle cx="12" cy="12" r="7.5"/><path d="M4.5 12h15M12 4.5c2.6 2.8 2.6 12.2 0 15M12 4.5c-2.6 2.8-2.6 12.2 0 15"/>',
  dashboard:'<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><path d="M3.5 11h17M10.5 11v8.5"/>',
  cube:'<path d="M12 3.5l7 4v9l-7 4-7-4v-9z"/><path d="M5 7.5l7 4 7-4M12 11.5v9"/>',
  shield:'<path d="M12 3.5l7 2.6v5.4c0 4-3 7.2-7 9-4-1.8-7-5-7-9V6.1z"/>',
  image:'<rect x="3.5" y="5" width="17" height="14" rx="1.5"/><circle cx="8.5" cy="10" r="1.6"/><path d="M4 17l5-5 4 4 2.5-2.5 4.5 4.5"/>',
  video:'<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M10 9.5l5 2.5-5 2.5z"/>',
  agent:'<rect x="4.5" y="8" width="15" height="11.5" rx="2.5"/><path d="M12 8V5"/><circle cx="12" cy="3.6" r="1.4"/><circle cx="8.8" cy="12.6" r="1.3"/><circle cx="15.2" cy="12.6" r="1.3"/><path d="M9.2 16.2h5.6"/>',
  media:'<rect x="3.5" y="5" width="17" height="14" rx="1.5"/><circle cx="8.5" cy="10" r="1.6"/><path d="M4 17l5-5 4 4 2.5-2.5 4.5 4.5"/>',
  contract:'<path d="M6.5 3.5h8l3 3v14h-11z"/><path d="M9.5 13.5l2 2 3.5-3.5"/>',
  people:'<circle cx="9.5" cy="9" r="3"/><path d="M4 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><path d="M16 6.5a2.6 2.6 0 0 1 0 5M17.5 19c0-2.2-.8-3.6-2-4.4"/>',
  pen:'<path d="M4 20l3.6-.9 10-10a2.2 2.2 0 0 0-3.1-3.1l-10 10z"/><path d="M13.6 6.9l3.5 3.5"/>',
  laser:'<circle cx="12" cy="12" r="2.6"/><path d="M12 3.5v3.2M12 17.3v3.2M3.5 12h3.2M17.3 12h3.2"/><path d="M6.4 6.4l2.3 2.3M15.3 15.3l2.3 2.3M17.6 6.4l-2.3 2.3M8.7 15.3l-2.3 2.3"/>',
  eraser:'<path d="M9.5 19.5H20"/><path d="M5.5 15.5 14 7l5 5-8.5 8.5H8.5z"/><path d="M9 11l5 5"/>',
  text:'<path d="M5.5 6.5h13M12 6.5v11"/>',
  heading:'<path d="M6 5v14M18 5v14M6 12h12"/>',
  tile:'<rect x="4.5" y="4.5" width="15" height="15" rx="4"/>'
};

const DRAW = [
  { id:'select',  key:'v', icon:'select',  label:'Select' },
  { id:'hand',    key:'h', icon:'hand',    label:'Hand (pan)' },
  { id:'arrow',   key:'a', icon:'arrow',   label:'Arrow' },
  { id:'line',    key:'l', icon:'line',    label:'Line (no arrowhead)' },
  { id:'box',     key:'r', icon:'box',     label:'Rectangle' },
  { id:'ellipse', key:'o', icon:'ellipse', label:'Ellipse' },
  { id:'zone',    key:'z', icon:'zone',    label:'Zone / layer (dashed)' },
  { id:'text',    key:'t', icon:'text',    label:'Text' },
  { id:'heading', key:'g', icon:'heading', label:'Heading' },
  { id:'pen',     key:'n', icon:'pen',     label:'Pen (ink)' },
  { id:'laser',   key:'y', icon:'laser',   label:'Laser (fades)' },
  { id:'eraser',  key:'x', icon:'eraser',  label:'Eraser (ink and shapes)' }
];
const DATA = [
  { id:'store',     key:'d', icon:'store',     label:'Database' },
  { id:'queue',     key:'q', icon:'queue',     label:'Queue' },
  { id:'cloud',     key:'c', icon:'cloud',     label:'Cloud' },
  { id:'file',      key:'e', icon:'file',      label:'File' },
  { id:'api',       key:'s', icon:'api',       label:'Service / API' },
  { id:'shield',    key:'g', icon:'shield',    label:'Governance' },
  { id:'people',    key:'p', icon:'people',    label:'Consumers' },
  { id:'agent',     key:'b', icon:'agent',     label:'AI agent' },
  { id:'contract',  key:'k', icon:'contract',  label:'Data contract' },
  { id:'video',     key:'u', icon:'video',     label:'Video' },
  { id:'media',     key:'i', icon:'media',     label:'Image data' },
  { id:'table',     key:'j', icon:'table',     label:'Table' }
];
const MORPHS = ['box','ellipse','store','queue','cloud','file','tile'];

/* Tile loops: what a running system looks like. The paths are stroked, so the
   picker wraps them in currentColor and the shape bar draws them as buttons. */
const ANIMS = ['loading','progress','typing','uploading','heartbeat','stream','sync','waiting','retry','poll'];
const LOOP_D = {
  loading:'<circle cx="12" cy="12" r="7" stroke-dasharray="10 30"/>',
  progress:'<rect x="3.5" y="10" width="17" height="4.5" rx="2.2"/><path d="M6 12.2h6"/>',
  typing:'<circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/>',
  uploading:'<path d="M12 16.5V7M8.5 10.5 12 7l3.5 3.5M5.5 19.5h13"/>',
  heartbeat:'<path d="M3.5 12h3.4l1.8-4.8 2.9 9.6 1.8-4.8h7.1"/>',
  stream:'<path d="M4 7l4.5 5L4 17M10.5 7l4.5 5-4.5 5M17 7l4.5 5L17 17"/>',
  sync:'<path d="M20 12a8 8 0 0 1-13.7 5.6"/><path d="M4 12a8 8 0 0 1 13.7-5.6"/>' +
    '<path d="M6 14.6v3.2h3.2M18 9.4V6.2h-3.2"/>',
  waiting:'<circle cx="12" cy="12" r="7.5"/><path d="M12 4.5v1.4M19.5 12h-1.4M12 19.5v-1.4M4.5 12h1.4"/>' +
    '<path d="M12 12V8M12 12h2.8"/>',
  retry:'<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.7 3.6v4.4h-4.4"/>',
  poll:'<circle cx="12" cy="12" r="7.5"/><path d="M12 12l6-3.4"/>'
};
const LOOP_TAGS = {
  loading:'loading,spinner,spin,wait,busy,working,pending',
  progress:'progress,percent,bar,copying,backfill,ingesting',
  typing:'typing,agent,assistant,llm,thinking,streaming out',
  uploading:'upload,push,ship,export,deliver,sync out',
  heartbeat:'heartbeat,alive,health,pulse,liveness,watchdog',
  stream:'stream,streaming,flow,events,continuous,consume,throughput',
  sync:'sync,replicate,replication,mirror,cdc,reconcile,two way',
  waiting:'waiting,idle,paused,queued,stalled,off hours',
  retry:'retry,again,backoff,rerun,failover,flaky',
  poll:'poll,check,scheduled,cron,interval,watch'
};

const SIZE = {
  box:[208,100], ellipse:[190,116], zone:[420,300], table:[236,120], store:[186,112],
  queue:[212,72], cloud:[206,112], file:[162,108], people:[188,124],
  api:[188,124], dashboard:[168,96], cube:[156,96], shield:[188,124],
  line:[140,80], arrow:[150,80], image:[220,150], text:[200,28], heading:[270,28],
  agent:[188,124], contract:[188,124], video:[206,134], media:[206,134], logo:[120,120],
  tile:[96,96], frame:[200,120]
};

const CATALOG = [
  ['Sources', ['Databases','Applications','Files & Documents','Unstructured Data',
    'Messages & Events','IoT Devices','SaaS Applications','APIs','External Databases',
    'External Files','Streaming Data','Third-Party Data']],
  ['Integration', ['Batch','Streaming','Micro-batch','CDC','Publish & Subscribe',
    'Event Streaming','Log-Based Replication','Database Connectivity','File Transfer',
    'VPN','Private Service Connectivity','Network Peering',
    'Dedicated Private Connectivity','Secure Connectors']],
  ['Platform', ['Raw','Standardized','Curated','Serving Views','Data Transformation',
    'Batch Processing','Stream Processing','Event Processing','Data Enrichment',
    'Schema Evolution','Data Validation','Published Datasets','Materialized Views',
    'Data Marts','Search Indexes']],
  ['Serving & Data Products', ['Business Metrics & KPIs','Business Definitions',
    'Semantic Models','Metric Models','Semantic Query APIs','SQL Access','REST APIs',
    'GraphQL APIs','Data Virtualization','Secure Data Sharing','Data Exchange',
    'Federated Data Access','Data Products']],
  ['Consumption', ['Business Users','Analysts','Data Scientists','ML Engineers',
    'Application Teams','Operational Applications','Downstream Systems',
    'Embedded Analytics','Partner Applications','Partners','External Consumers',
    'Analytics & Reporting','Advanced Analytics & Data Science','Self-Service Analytics']],
  ['Metadata & Knowledge', ['Enterprise Catalog','Data Lineage','Data Classification',
    'Business Glossary']],
  ['Governance & Trust', ['Data Quality','Data Observability','Contract Policies',
    'Data Product Governance','Policy as Code','Lifecycle, Retention & Deletion',
    'Audit & Compliance Reporting']],
  ['Control Plane', ['Access Management','Data Contracts Enforcement',
    'Workflow & Orchestration']],
  ['Platform Engineering', ['CI/CD & DevOps','Observability & Monitoring']],
  ['ML & AI', ['Feature Store','Experiment Tracking','Model Registry','Model Serving',
    'Evaluation & Drift']]
];

const S = {
  tool:'select', motion:'off', paint:'line', armed:null, sticky:false, dotSize:4, tint:false,
  stroke:'solid', sharp:false, sw:1.2, fillmode:'soft',
  color:null, tcolor:null, scolor:null, fill:null,
  panel:true, selNodes:[], selLinks:[]
};
let nodes = [], links = [], uid = 1;

function zoneMembers(zone){
  return nodes.filter(n => n !== zone &&
    n.x >= zone.x && n.y >= zone.y &&
    n.x + n.w <= zone.x + zone.w && n.y + n.h <= zone.y + zone.h);
}
const undoStack = [];
const redoStack = [];
const view = { x:0, y:0, k:1 };
const CUSTOM = { hex:null };

let drag = null, resize = null, lend = null, marquee = null, pen = null, pan = null, bend = null;
let spotId = null, laser = null, erase = null;
let inked = [];
const INK_KEY = 'yoruma.ink.v1';
const INK_MAX = 3e5;
let hoverId = null, rafPending = false;
let editing = null, lastHit = { id:null, t:0 };

const byId = id => nodes.find(n => n.id === id);
const colorAt = v => v == null ? null : (typeof v === 'number' ? ACCENTS[v] : v);
const accentOf = n => n ? colorAt(n.color) : null;
const titleColorOf = n => n ? colorAt(n.tcolor) : null;
const subColorOf = n => n ? colorAt(n.scolor) : null;
const fillOf = n => n ? colorAt(n.fill) : null;
/* A tint keeps the hue and softens it in OKLCH, a perceptual space: pinning the
   lightness in HSL made pink shout where violet whispered, because equal HSL
   saturation is not equal perceived colour. */
function srgbToLinear(v){ return v <= 0.04045 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); }
function linearToSrgb(v){
  const c = v <= 0.0031308 ? v*12.92 : 1.055*Math.pow(v, 1/2.4) - 0.055;
  return Math.min(1, Math.max(0, c));
}
function hexToOklch(hex){
  const h = String(hex || '').replace('#','');
  const r = srgbToLinear(parseInt(h.slice(0,2),16)/255),
        g = srgbToLinear(parseInt(h.slice(2,4),16)/255),
        b = srgbToLinear(parseInt(h.slice(4,6),16)/255);
  const l = Math.cbrt(0.4122214708*r + 0.5363325363*g + 0.0514459929*b);
  const m = Math.cbrt(0.2119034982*r + 0.6806995451*g + 0.1073969566*b);
  const s = Math.cbrt(0.0883024619*r + 0.2817188376*g + 0.6299787005*b);
  const L = 0.2104542553*l + 0.7936177850*m - 0.0040720468*s;
  const A = 1.9779984951*l - 2.4285922050*m + 0.4505937099*s;
  const B = 0.0259040371*l + 0.7827717662*m - 0.8086757660*s;
  return { L, C: Math.hypot(A, B), h: Math.atan2(B, A) };
}
function oklchToSrgb(L, C, h){
  const A = Math.cos(h)*C, B = Math.sin(h)*C;
  const l = Math.pow(L + 0.3963377774*A + 0.2158037573*B, 3);
  const m = Math.pow(L - 0.1055613458*A - 0.0638541728*B, 3);
  const s = Math.pow(L - 0.0894841775*A - 1.2914855480*B, 3);
  return [
    linearToSrgb(+4.0767416621*l - 3.3077115913*m + 0.2309699292*s),
    linearToSrgb(-1.2684380046*l + 2.6097574011*m - 0.3413193965*s),
    linearToSrgb(-0.0041960863*l - 0.7034186147*m + 1.7076147010*s)
  ];
}
function pastel(hex){
  const h = String(hex || '').replace('#','');
  if (h.length !== 6) return hex;
  const { C, h: hue } = hexToOklch('#' + h);
  const L = 0.925;
  let c = Math.min(C * 0.50, 0.092);
  let rgb = oklchToSrgb(L, c, hue);
  for (let i = 0; i < 8 && c > 0.002; i++){
    const raw = oklchToSrgb(L, c, hue);
    if (raw.every(v => v > 0.001 && v < 0.999)){ rgb = raw; break; }
    c *= 0.82;
    rgb = raw;
  }
  const to = v => Math.round(v*255).toString(16).padStart(2,'0');
  return '#' + to(rgb[0]) + to(rgb[1]) + to(rgb[2]);
}
function hexA(hex, a){
  if (!hex) return null;
  const h = hex.replace('#','');
  return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;
}
const hash = s => { let h = 2166136261; for (let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h,16777619); } return h>>>0; };
const isSelNode = id => S.selNodes.includes(id);
const isSelLink = id => S.selLinks.includes(id);
const fscale = n => n.fs || 1;
