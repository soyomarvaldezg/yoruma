const NS = 'http://www.w3.org/2000/svg';

const INK = '#2D3141', MUTED = '#4A5670', LINE = '#657486',
      CARD = '#E6EDF2', PAPER = '#CFDDE6', FIBER = '#08829C';

const ACCENTS = ['#1D1D1D','#9FA8B2','#E599F7','#AE3EC9',
                 '#4263EB','#4DABF7','#F6B26B','#F76707',
                 '#099268','#40C057','#FF8787','#E03131'];

const ICON = {
  select:'<path d="M6 3l12 7-5 1.3L10 18z"/>',
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
  text:'<path d="M5.5 6.5h13M12 6.5v11"/>',
  heading:'<path d="M6 5v14M18 5v14M6 12h12"/>'
};

const DRAW = [
  { id:'select',  key:'v', icon:'select',  label:'Select' },
  { id:'arrow',   key:'a', icon:'arrow',   label:'Arrow' },
  { id:'line',    key:'l', icon:'line',    label:'Line (no arrowhead)' },
  { id:'box',     key:'r', icon:'box',     label:'Rectangle' },
  { id:'ellipse', key:'o', icon:'ellipse', label:'Ellipse' },
  { id:'zone',    key:'z', icon:'zone',    label:'Zone / layer (dashed)' },
  { id:'text',    key:'t', icon:'text',    label:'Text' },
  { id:'heading', key:'h', icon:'heading', label:'Heading' }
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
  { id:'media',     key:'i', icon:'media',     label:'Image data' }
];
const MORPHS = ['box','ellipse','zone','store','queue','cloud','file'];

const SIZE = {
  box:[208,100], ellipse:[190,116], zone:[420,300], table:[236,120], store:[186,112],
  queue:[212,72], cloud:[206,112], file:[162,108], people:[188,124],
  api:[188,124], dashboard:[168,96], cube:[156,96], shield:[188,124],
  line:[140,80], arrow:[150,80], image:[220,150], text:[200,28], heading:[270,28],
  agent:[188,124], contract:[188,124], video:[206,134], media:[206,134], logo:[120,120],
  frame:[200,120]
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
  tool:'select', motion:'off', paint:'line', armed:null, dotSize:4, tint:false,
  color:null, tcolor:null, scolor:null, fill:null,
  selNodes:[], selLinks:[]
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
let hoverId = null, rafPending = false;
let editing = null, lastHit = { id:null, t:0 };

const byId = id => nodes.find(n => n.id === id);
const colorAt = v => v == null ? null : (typeof v === 'number' ? ACCENTS[v] : v);
const accentOf = n => n ? colorAt(n.color) : null;
const titleColorOf = n => n ? colorAt(n.tcolor) : null;
const subColorOf = n => n ? colorAt(n.scolor) : null;
const fillOf = n => n ? colorAt(n.fill) : null;
function hexA(hex, a){
  if (!hex) return null;
  const h = hex.replace('#','');
  return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;
}
const hash = s => { let h = 2166136261; for (let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h,16777619); } return h>>>0; };
const isSelNode = id => S.selNodes.includes(id);
const isSelLink = id => S.selLinks.includes(id);
const fscale = n => n.fs || 1;
