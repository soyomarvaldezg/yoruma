/* ---------- icon picker (left sidebar) ---------- */
const iconFilter = document.getElementById('icon-filter');
const iconGridEl = document.getElementById('icon-grid');

const icNorm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

/* Concepts no vendor publishes as a free icon: drawn here, stroked like the
   palette shapes so they read as categories rather than brands. */
const outline = d => d.replace(/<(path|rect|circle|ellipse|line|polyline|polygon)\b/g,
  '<$1 fill="none" stroke="currentColor" stroke-width="1.5" ' +
  'stroke-linecap="round" stroke-linejoin="round"');
const CONCEPTS = [
  { n:'Compute cluster', t:'cluster,compute,nodes,spark,emr,dataproc,warehouse,hdinsight,managed service for apache spark,oracle compute,fargate,ecs,gke,aks',
    d:outline('<rect x="3.5" y="4.5" width="7" height="5" rx="1"/><rect x="13.5" y="4.5" width="7" height="5" rx="1"/><rect x="8.5" y="14.5" width="7" height="5" rx="1"/><path d="M7 9.5v2.5h10V9.5M12 12v2.5"/>') },
  { n:'Serverless', t:'serverless,functions,faas,cloud run,run,lambda,azure container apps,app runner,container instances,serverless containers',
    d:outline('<path d="M13.5 3 6.5 13.2h4.6L10 21l7.5-10.4h-4.8z"/>') },
  { n:'Function', t:'function,lambda,cloud functions,azure functions,run functions,gcp functions,faas,compute at the edge',
    d:outline('<path d="M9.5 20c2 0 2.6-1.2 3-3l1.6-7c.3-1.4 1-2 2.4-2"/><path d="M7.5 11.5h7"/>') },
  { n:'Notebook', t:'notebook,jupyter,lab,analysis,explore,databricks notebooks,fabric notebooks,colab,zeppelin',
    d:outline('<path d="M5.5 4.5H17a2.5 2.5 0 0 1 2.5 2.5v12H8.5a3 3 0 0 1-3-3z"/><path d="M8.5 8.5h8M8.5 12h8M8.5 15.5h5"/>') },
  { n:'Data catalog', t:'catalog,metadata,glossary,discovery,collibra,datahub,amundsen,purview,glue data catalog,dataplex,knowledge catalog,alation,openmetadata,enterprise catalog',
    d:outline('<path d="M4 5h7.5a3 3 0 0 1 3 3v0M4 9.5h5M4 13h4.5M4 16.5h4"/><circle cx="16.5" cy="15" r="3.6"/><path d="M19.1 17.6 21.5 20"/>') },
  { n:'Feature store', t:'feature store,features,feast,ml,databricks feature store,snowflake feature store,vertex feature store',
    d:outline('<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M3.5 9h17"/><circle cx="8" cy="13.2" r="1.4"/><circle cx="12" cy="13.2" r="1.4"/><circle cx="16" cy="13.2" r="1.4"/><circle cx="8" cy="16.6" r="1.4"/><circle cx="12" cy="16.6" r="1.4"/>') },
  { n:'Model registry', t:'model registry,models,versions,artifacts,ml,vertex model registry,mlflow',
    d:outline('<path d="M12 3 3 7.5 12 12l9-4.5z"/><path d="M3 12l9 4.5L21 12M3 16.5 12 21l9-4.5"/>') },
  { n:'Pipeline', t:'pipeline,etl,elt,workflow,dag,job,dataworks,composer,managed airflow',
    d:outline('<circle cx="4.8" cy="12" r="2.2"/><rect x="9.4" y="9" width="5.2" height="6" rx="1"/><circle cx="19.2" cy="12" r="2.2"/><path d="M7 12h2.4M14.6 12H17"/>') },
  { n:'ETL service', t:'etl,elt,integration,glue,data factory,adf,data fusion,dataflow,matillion,talend,ingest,transform,loader,fivetran,airbyte',
    d:outline('<path d="M4 5h16l-6 7.5V20l-4-2.4v-5.1z"/>') },
  { n:'Load balancer', t:'load balancer,lb,ingress,proxy,gateway,elb,alb,nlb,application gateway,azure load balancer,cloud load balancing,traffic manager',
    d:outline('<circle cx="12" cy="4.6" r="2.2"/><circle cx="5" cy="19" r="2.2"/><circle cx="12" cy="19" r="2.2"/><circle cx="19" cy="19" r="2.2"/><path d="M10.9 6.4 6 16.8M12 6.8v10M13.1 6.4 18 16.8"/>') },
  { n:'Network', t:'network,vpc,vnet,vpn,subnet,peering,firewall,region,express route,direct connect,cloud interconnect,vpn gateway,transit gateway,privatelink',
    d:outline('<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/><path d="M10.5 7h3.5a3 3 0 0 1 3 3v3.5M7 10.5v3a3 3 0 0 0 3 3h3.5"/>') },
  { n:'Key vault', t:'keys,secrets,vault,kms,encryption,iam,identity,azure key vault,cloud kms,secrets manager,secret manager,confidential computing',
    d:outline('<path d="M12 3 5 6v6c0 4 3 6.8 7 9 4-2.2 7-5 7-9V6z"/><circle cx="12" cy="10.4" r="1.8"/><path d="M12 12.2v3.4"/>') },
  { n:'Identity', t:'identity,iam,entra id,azure ad,cognito,cloud identity,sso,users,access management,organizations',
    d:outline('<rect x="3.5" y="6" width="17" height="12" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M5.8 15.6c.5-1.6 1.7-2.4 3.2-2.4s2.7.8 3.2 2.4"/><path d="M14.5 10h4M14.5 13.2h4"/>') },
  { n:'Lineage', t:'lineage,provenance,dependencies,graph,trace,openlineage,impact analysis',
    d:outline('<circle cx="5" cy="5.5" r="2.2"/><circle cx="5" cy="18.5" r="2.2"/><circle cx="19" cy="12" r="2.2"/><path d="M7.2 6.7 16.8 11M7.2 17.3 16.8 13"/>') },
  { n:'Object storage', t:'object storage,bucket,s3,blob storage,cloud storage,gs,gcs,adls,data lake storage,azure blob,r2,oci object storage,archive storage,glacier',
    d:outline('<path d="M3.5 7h17l-2 12.2a1.8 1.8 0 0 1-1.8 1.5H7.3a1.8 1.8 0 0 1-1.8-1.5z"/><path d="M7.5 7a4.5 4.5 0 0 1 9 0"/>') },
  { n:'Data lake', t:'data lake,lake,datalake,bronze,silver,gold,lakehouse,lake formation,delta sharing',
    d:outline('<ellipse cx="12" cy="6" rx="7.5" ry="2.8"/><path d="M4.5 6v5M19.5 6v5"/><path d="M3.5 14.5c3-2 5.4 2 8.5 0s5.5-2 8.5 0"/><path d="M3.5 19c3-2 5.4 2 8.5 0s5.5-2 8.5 0"/>') },
  { n:'Data warehouse', t:'warehouse,dwh,redshift,synapse,bigquery,oracle atp,autonomous database,netezza,analytics,olap,vertica',
    d:outline('<path d="M4 9.5 12 5l8 4.5"/><path d="M6.5 11v6.5M10.2 11v6.5M13.8 11v6.5M17.5 11v6.5"/><path d="M4 20h16"/>') },
  { n:'Managed database', t:'database,managed db,rds,aurora,cloud sql,azure database,azure sql,oracle db,mysql,postgres,sql server,dbfs,relational',
    d:outline('<ellipse cx="12" cy="6.5" rx="7.5" ry="2.8"/><path d="M4.5 6.5v11a7.5 2.8 0 0 0 15 0v-11"/><path d="M9 12.5l2 2 4-4"/>') },
  { n:'NoSQL store', t:'nosql,dynamodb,cosmos db,firestore,bigtable,spanner,keyvalue,document,widecolumn,redis,memorystore,elasticache',
    d:outline('<rect x="3.5" y="4.5" width="17" height="6" rx="1.5"/><rect x="3.5" y="13.5" width="17" height="6" rx="1.5"/><path d="M7 7.5h.01M7 16.5h.01"/>') },
  { n:'Stream processor', t:'stream,streaming,kinesis,dataflow,stream analytics,flink,realtime,event processing,managed streaming',
    d:outline('<path d="M3 9c3-2.2 5.4 2.2 8.4 0S17 6.8 21 9"/><path d="M3 15c3-2.2 5.4 2.2 8.4 0S17 12.8 21 15"/><path d="M3 20c3-2 5.4 2 8.4 0"/>') },
  { n:'Event bus', t:'event bus,eventbridge,event grid,pubsub,pub sub,eventarc,events,topics,publish subscribe,event hubs,event hub',
    d:outline('<path d="M4 12h16"/><circle cx="7.5" cy="5" r="2"/><circle cx="16.5" cy="5" r="2"/><path d="M7.5 7v5M16.5 7v5"/><circle cx="12" cy="19" r="2"/><path d="M12 17v-5"/>') },
  { n:'Message queue', t:'queue,sqs,service bus,amqp,messaging,enqueue,worker,celery,rabbitmq',
    d:outline('<rect x="3.5" y="6.5" width="7" height="5" rx="1"/><rect x="13.5" y="6.5" width="7" height="5" rx="1"/><rect x="8.5" y="14" width="7" height="5" rx="1"/><path d="M10.5 9h3M12 11.5v2.5"/>') },
  { n:'Replication', t:'replication,cdc,change data capture,goldengate,dms,pglogical,sync,mirror,clone,data sharing',
    d:outline('<path d="M4.5 9h11l-2.8-3.2M19.5 15h-11l2.8 3.2"/>') },
  { n:'ML platform', t:'ml platform,machine learning,sagemaker,vertex ai,azure machine learning,aml,foundry,databricks ml,training platform,mlops',
    d:outline('<circle cx="6" cy="7" r="2"/><circle cx="6" cy="17" r="2"/><circle cx="18" cy="12" r="2.2"/><path d="M7.7 8.3 16 11M7.7 15.7 16 13"/>') },
  { n:'Generative AI', t:'genai,llm,gpt,bedrock,openai,anthropic,gemini,copilot,agent,foundry tools,ai studio',
    d:outline('<path d="M11 3.5l1.9 4.6 4.6 1.9-4.6 1.9L11 16.5 9.1 11.9 4.5 10l4.6-1.9z"/><path d="M18 15.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z"/>') },
  { n:'Model serving', t:'model serving,inference,endpoints,sagemaker endpoints,vertex prediction,hosting,api inference,bentoml',
    d:outline('<rect x="3.5" y="7" width="10" height="10" rx="2"/><path d="M13.5 12h6.5M17 9l3 3-3 3"/>') },
  { n:'BI workspace', t:'bi,business intelligence,quicksight,analytics hub,power bi service,reporting,dashboards,semantic model,metrics,lookml',
    d:outline('<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M8 16.5v-4M12 16.5v-7.5M16 16.5v-3"/>') },
  { n:'Monitoring', t:'monitoring,observability,cloudwatch,azure monitor,stackdriver,google cloud observability,apm,metrics,logs,tracing,alerting',
    d:outline('<circle cx="12" cy="12" r="8.5"/><path d="M6.5 12.5 9.5 9l2.6 5.2 2-3.2h3.4"/>') },
  { n:'Workflow', t:'workflow,orchestration,step functions,logic apps,cloud workflows,azure logic apps,activities,state machine,automation',
    d:outline('<circle cx="6" cy="6" r="2"/><rect x="10" y="10" width="6" height="6" rx="1"/><circle cx="18" cy="18" r="2"/><path d="M7.4 7.4 11 11M15 14l2.6 2.6"/>') },
  { n:'Table format', t:'table format,delta lake,delta,iceberg,hudi,paimon,open table,abfs,parquet files',
    d:outline('<rect x="4" y="5" width="16" height="14" rx="1.5"/><path d="M4 9.5h16M4 14.2h16M9.6 9.5V19M15 9.5V19"/>') },
  { n:'API gateway', t:'api gateway,apigee,azure api management,api management,endpoints,rest,http,openapi,api monitoring',
    d:outline('<path d="M4 19.5V10a8 8 0 0 1 16 0v9.5"/><path d="M9 19.5v-7a3 3 0 0 1 6 0v7"/>') },
  { n:'Edge delivery', t:'cdn,edge,cloudfront,front door,azure cdn,cloud cdn,cache,static content,distribution',
    d:outline('<circle cx="13" cy="12" r="6.5"/><path d="M6.5 12h13M13 5.5c1.9 2.6 1.9 10.4 0 13M13 5.5c-1.9 2.6-1.9 10.4 0 13"/><path d="M2 9h3M2 15h3"/>') }
];

const PACK_KEY = 'yoruma.icons.v1';
const PACK_MAX_CHARS = 1.4e6;
const PACK_MAX_ICONS = 400;
let IMPORTED = [];
let LOCAL_ICONS = ICON_PACK.concat(CONCEPTS);
let ICON_TAGS = new Map();
function rebuildIconIndex(){
  LOCAL_ICONS = ICON_PACK.concat(CONCEPTS, IMPORTED);
  ICON_TAGS = new Map();
  LOCAL_ICONS.forEach(e => {
    ICON_TAGS.set(e.n, e.t.split(',').map(t => icNorm(t)));
  });
}
const VENDOR_WORDS = new Set(['aws','azure','gcp','google','oracle','microsoft','amazon',
  'managed','service','services','platform','the']);
function iconTagsOf(e){ return ICON_TAGS.get(e.n) || []; }
function iconWordMatch(e, word){
  return icNorm(e.n).includes(word) || iconTagsOf(e).some(tag => tag.includes(word));
}
function iconMatches(e, raw){
  const q = icNorm(raw);
  if (!q) return true;
  if (iconWordMatch(e, q)) return true;
  const words = String(raw).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
    .filter(w => w.length > 1 && !VENDOR_WORDS.has(w)).map(icNorm);
  return words.length > 0 && words.every(w => iconWordMatch(e, w));
}
function iconSearch(query){
  return LOCAL_ICONS.filter(e => iconMatches(e, query));
}
function iconByName(name){
  const q = icNorm(name);
  if (!q) return null;
  return LOCAL_ICONS.find(e => icNorm(e.n) === q) ||
    LOCAL_ICONS.find(e => (ICON_TAGS.get(e.n) || []).includes(q)) || null;
}

function safeSvgMarkup(text){
  return String(text || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/<\s*(iframe|object|embed|audio|video)\b[\s\S]*?<\/\s*\1\s*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '')
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '')
    .replace(/javascript:/gi, '');
}
const MONO_CACHE = new Map();
function monoInner(uri, ink){
  if (!uri) return null;
  let body = MONO_CACHE.get(uri);
  if (body === undefined){
    body = null;
    try {
      const comma = uri.indexOf(',');
      const head = uri.slice(0, comma);
      const tail = uri.slice(comma + 1);
      const svg = /;base64/i.test(head) ? atob(tail) : decodeURIComponent(tail);
      const m = /<svg[^>]*>([\s\S]*)<\/svg>/i.exec(svg);
      if (m) body = safeSvgMarkup(m[1].replace(/<title>[\s\S]*?<\/title>/gi, '')).trim();
    } catch (e){ body = null; }
    MONO_CACHE.set(uri, body);
  }
  return body ? body.replace(/currentColor/g, ink || LINE) : null;
}

function iconSvgText(e){
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' + e.d + '</svg>';
}
function svgUri(text){
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return 'data:image/svg+xml;base64,' + btoa(bin);
}
function iconDataUri(e){
  return e.src || svgUri(iconSvgText(e));
}
function iconTinted(e){
  return !e.src || e.mono === true;
}
function cardTarget(){
  const sel = byId(S.selNodes[0]);
  return sel && LOGO_KINDS.has(sel.kind) ? sel : null;
}
function newLogoNode(){
  const c = centrePoint();
  const n = { id:'n'+(uid++), kind:'logo', title:'', sub:'', color:null,
    tcolor:null, scolor:null, fs:1, x:0, y:0, w:SIZE.logo[0], h:SIZE.logo[1] };
  n.x = Math.round(c.x - n.w/2);
  n.y = Math.round(c.y - n.h/2);
  nodes.push(n);
  selectNodes([n.id], false);
  return n;
}
function placeIcon(e){
  snapshot();
  const card = cardTarget();
  const uri = iconDataUri(e);
  const mono = iconTinted(e);
  const target = card || newLogoNode();
  target.logo = uri;
  if (mono) target.mono = true;
  else delete target.mono;
  render();
  toast(e.n + (mono ? ' icon added' : ' logo added'));
}

function normaliseSvgText(text){
  let out = String(text || '').replace(/^\uFEFF/, '')
    .replace(/^\s*<\?xml[^>]*\?>/i, '')
    .replace(/^\s*<!DOCTYPE[^>]*>/i, '')
    .trim();
  if (!/^<svg[^>]*\sxmlns\s*=/i.test(out))
    out = out.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  return out;
}
function packEntry(raw){
  if (!raw || typeof raw !== 'object') return null;
  const name = String(raw.name || raw.n || '').trim().slice(0, 60);
  if (!name) return null;
  const tags = String(raw.tags || raw.t || '').toLowerCase().slice(0, 300);
  if (typeof raw.src === 'string'){
    if (!/^data:image\//.test(raw.src) || raw.src.length > 400000) return null;
    return { n:name, t:tags, src:raw.src, pack:true };
  }
  const svg = typeof raw.svg === 'string' ? raw.svg
    : (typeof raw.d === 'string'
      ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' + raw.d + '</svg>'
      : '');
  if (!/<svg[\s>]/i.test(svg) || svg.length > 400000) return null;
  const text = normaliseSvgText(svg);
  return { n:name, t:tags, src:svgUri(text), mono:text.includes('currentColor'), pack:true };
}
function applyIconPack(list){
  const entries = (Array.isArray(list) ? list : []).map(packEntry).filter(Boolean)
    .slice(0, PACK_MAX_ICONS);
  if (!entries.length) return 0;
  const byName = new Map(IMPORTED.map(e => [icNorm(e.n), e]));
  entries.forEach(e => byName.set(icNorm(e.n), e));
  const merged = [...byName.values()].slice(0, PACK_MAX_ICONS);
  let raw = '';
  try { raw = JSON.stringify(merged); } catch (e){ return 0; }
  if (raw.length > PACK_MAX_CHARS){
    toast('that icon pack is too large to store', 5200);
    return 0;
  }
  IMPORTED = merged;
  try { localStorage.setItem(PACK_KEY, JSON.stringify(IMPORTED)); }
  catch (e){ toast('could not store the icon pack (storage full)', 5000); return 0; }
  rebuildIconIndex();
  iconFilter.value = '';
  paintIconGrid();
  return entries.length;
}
function loadIconPack(){
  try {
    const raw = localStorage.getItem(PACK_KEY);
    if (raw) IMPORTED = (JSON.parse(raw) || []).map(packEntry).filter(Boolean)
      .slice(0, PACK_MAX_ICONS);
  } catch (e){ IMPORTED = []; }
  rebuildIconIndex();
}
function clearImportedIcons(){
  if (!IMPORTED.length){ toast('no imported icons to remove'); return; }
  const n = IMPORTED.length;
  IMPORTED = [];
  try { localStorage.removeItem(PACK_KEY); } catch (e){}
  rebuildIconIndex();
  iconFilter.value = '';
  paintIconGrid();
  toast(n + (n === 1 ? ' imported icon removed' : ' imported icons removed'));
}
function fileIconName(name){
  const base = String(name || '').replace(/\.[a-z0-9]+$/i, '')
    .replace(/^\d+-icon-service-/i, '')
    .replace(/^icon-service-/i, '');
  const words = base.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!words) return '';
  return words.replace(/\b[a-z]/g, c => c.toUpperCase()).slice(0, 60);
}
function entryFromFile(name, svg){
  const n = fileIconName(name);
  if (!n) return null;
  const tags = [n, String(name || '').replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ')]
    .join(',').toLowerCase();
  return packEntry({ name:n, tags, svg });
}
const packInput = document.createElement('input');
packInput.type = 'file';
packInput.accept = '.json,application/json,.svg,image/svg+xml';
packInput.multiple = true;
packInput.style.display = 'none';
document.body.appendChild(packInput);
function importIconPack(){ packInput.click(); }
packInput.addEventListener('change', async () => {
  const files = Array.from(packInput.files || []);
  packInput.value = '';
  if (!files.length) return;
  const list = [];
  for (const file of files){
    if (file.size > 4e6){ toast('“' + file.name + '” is too large', 4200); continue; }
    let text;
    try { text = await file.text(); }
    catch (e){ continue; }
    if (/\.json$/i.test(file.name) || /^\s*[[{]/.test(text)){
      try {
        const parsed = JSON.parse(text);
        const items = Array.isArray(parsed)
          ? parsed : (parsed && Array.isArray(parsed.icons) ? parsed.icons : null);
        if (items) list.push(...items);
        else toast('“' + file.name + '” has no icon list', 4200);
      } catch (e){ toast('“' + file.name + '” is not valid JSON', 4200); }
      continue;
    }
    const entry = entryFromFile(file.name, text);
    if (entry) list.push(entry);
    else toast('“' + file.name + '” is not an SVG', 4200);
  }
  if (!list.length){ toast('no usable icons in that selection', 4400); return; }
  const added = applyIconPack(list);
  if (!added) toast('no usable icons in that selection', 4400);
  else toast(added + (added === 1 ? ' icon imported' : ' icons imported'));
});

async function useBrandLogo(it){
  const route = svglRoute(it);
  if (!route){ toast('no logo file for ' + it.title, 4000); return; }
  const file = route.split('/').pop();
  const svg = await tryLogoSvg('https://api.svgl.app/svg/' + encodeURIComponent(file));
  if (!svg){ toast('could not download ' + it.title, 4200); return; }
  snapshot();
  const n = cardTarget() || newLogoNode();
  n.logo = svgDataUri(svg);
  delete n.mono;
  render();
  toast(it.title + ' logo added');
}

let brandState = 'idle';
const BRAND_LIMIT = 16;
function iconTile(e){
  const b = document.createElement('button');
  b.className = 'icon-tile';
  b.title = e.n + ' (tinted icon)';
  b.setAttribute('aria-label', 'place the ' + e.n + ' icon');
  if (e.src){
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.alt = '';
    img.src = e.src;
    b.className = 'icon-tile pack';
    b.title = e.n + ' (imported)';
    b.appendChild(img);
    const sp = document.createElement('span');
    sp.textContent = e.n;
    b.appendChild(sp);
  } else {
    b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${e.d}</svg><span>${e.n}</span>`;
  }
  b.addEventListener('mousedown', ev => ev.preventDefault());
  b.addEventListener('click', () => placeIcon(e));
  return b;
}
function brandIconTile(item){
  const b = document.createElement('button');
  b.className = 'icon-tile brand';
  b.title = item.title + ' (brand logo)';
  b.setAttribute('aria-label', 'place the ' + item.title + ' brand logo');
  const img = document.createElement('img');
  img.loading = 'lazy';
  img.alt = '';
  img.src = svglRoute(item);
  const sp = document.createElement('span');
  sp.textContent = item.title;
  b.appendChild(img);
  b.appendChild(sp);
  b.addEventListener('mousedown', ev => ev.preventDefault());
  b.addEventListener('click', () => useBrandLogo(item));
  return b;
}
function brandSearch(query){
  const q = icNorm(query);
  if (!q) return [];
  return DATA_BRANDS.filter(e =>
    icNorm(e.l).includes(q) || icNorm(e.f).includes(q) ||
    e.t.split(',').some(tag => icNorm(tag).includes(q)));
}
function brandEntryTile(e){
  const b = document.createElement('button');
  b.className = 'icon-tile brand';
  b.title = e.l + ' (brand logo)';
  b.setAttribute('aria-label', 'place the ' + e.l + ' brand logo');
  const img = document.createElement('img');
  img.loading = 'lazy';
  img.alt = '';
  img.src = brandThumb(e.f);
  const sp = document.createElement('span');
  sp.textContent = e.l;
  b.appendChild(img);
  b.appendChild(sp);
  b.addEventListener('mousedown', ev => ev.preventDefault());
  b.addEventListener('click', () => fetchLogoByName(e.f, cardTarget(), e.l));
  return b;
}
function brandFetchTile(query){
  const b = document.createElement('button');
  b.className = 'icon-tile brand';
  b.title = 'Fetch “' + query + '” from svgl';
  b.textContent = 'Fetch “' + query + '”';
  b.addEventListener('mousedown', ev => ev.preventDefault());
  b.addEventListener('click', () => fetchLogoByName(query, cardTarget(), query));
  return b;
}
function paintIconGrid(){
  const raw = iconFilter.value.trim();
  const q = icNorm(raw);
  iconGridEl.innerHTML = '';
  const local = iconSearch(raw);
  local.forEach(e => iconGridEl.appendChild(iconTile(e)));

  const brands = [];
  const shown = new Set();
  if (q.length >= 2){
    const svglHits = [];
    if (brandState === 'ready'){
      for (const it of svglIndex){
        const key = icNorm(it.title);
        if (key && key.includes(q)) svglHits.push(it);
      }
    }
    brandSearch(raw).forEach(e => {
      const key = icNorm(e.l);
      if (svglHits.some(it => icNorm(it.title).includes(key))) return;
      shown.add(key);
      brands.push(e);
    });
    svglHits.forEach(it => {
      const key = icNorm(it.title);
      if (brands.length >= BRAND_LIMIT || shown.has(key)) return;
      shown.add(key);
      brands.push(it);
    });
  }
  const rank = it => {
    const name = icNorm(it && it.f ? it.l : (it && it.title) || '');
    return name === q ? 0 : name.startsWith(q) ? 1 : 2;
  };
  brands.sort((a, b) => rank(a) - rank(b));
  brands.forEach(it => iconGridEl.appendChild(
    it && it.f ? brandEntryTile(it) : brandIconTile(it)));

  if (brandState === 'loading' && q.length >= 2){
    const note = document.createElement('div');
    note.className = 'icon-note';
    note.textContent = 'loading brand marks…';
    iconGridEl.appendChild(note);
  }
  if (!local.length && !brands.length && q.length >= 2)
    iconGridEl.appendChild(brandFetchTile(raw));
}

async function loadBrandIndex(){
  if (brandState !== 'idle') return;
  brandState = 'loading';
  paintIconGrid();
  try {
    const r = await fetch('https://api.svgl.app');
    const list = r.ok ? await r.json() : [];
    svglIndex = Array.isArray(list) ? list : [];
    brandState = svglIndex.length ? 'ready' : 'failed';
  } catch (e){ brandState = 'failed'; }
  paintIconGrid();
}

iconFilter.addEventListener('input', () => {
  paintIconGrid();
  if (icNorm(iconFilter.value).length >= 2) loadBrandIndex();
});
iconFilter.addEventListener('keydown', ev => {
  if (ev.key !== 'Enter') return;
  const q = iconFilter.value.trim();
  if (!q) return;
  ev.preventDefault();
  if (brandState === 'idle' && icNorm(q).length >= 2) loadBrandIndex();
  const local = iconByName(q);
  const brand = brandSearch(q)[0];
  const hit = brandState === 'ready' ? pickSvg(svglIndex, q) : null;
  if (brand) fetchLogoByName(brand.f, cardTarget(), brand.l);
  else if (hit) useBrandLogo(hit);
  else if (local) placeIcon(local);
  else fetchLogoByName(q, cardTarget());
});
loadIconPack();
paintIconGrid();
