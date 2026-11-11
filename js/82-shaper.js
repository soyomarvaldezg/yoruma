/* ---------- shaper ---------- */
const shaper = document.getElementById('shaper');
MORPHS.forEach(kind => {
  const b = document.createElement('button');
  b.innerHTML = `<svg viewBox="0 0 24 24">${ICON[kind] || ICON.box}</svg>`;
  b.title = kind;
  b.setAttribute('aria-label', 'shape ' + kind);
  b.dataset.kind = kind;
  b.addEventListener('mousedown', ev => ev.preventDefault());
  b.addEventListener('click', () => {
    const n = byId(S.selNodes[0]);
    if (!n) return;
    snapshot();
    n.kind = kind;
    const [w, h] = SIZE[kind];
    n.w = Math.max(n.w, Math.min(w, 260));
    n.h = Math.max(n.h, Math.min(h, 140));
    render();
  });
  shaper.appendChild(b);
});
const ALIGN_ICON = {
  left:'<path d="M4 6h16M4 12h9M4 18h13"/>',
  center:'<path d="M4 6h16M7.5 12h9M5.5 18h13"/>',
  right:'<path d="M4 6h16M11 12h9M7 18h13"/>'
};
const DATA_BRANDS = [
  { f:'aws',            l:'AWS',              t:'aws,amazon,cloud' },
  { f:'aws-s3',         l:'S3',               t:'s3,bucket,object storage,aws' },
  { f:'aws-rds',        l:'RDS',              t:'rds,sql,database,aws' },
  { f:'aws-aurora',     l:'Aurora',           t:'aurora,sql,postgres,mysql,aws' },
  { f:'aws-redshift',   l:'Redshift',         t:'redshift,warehouse,aws' },
  { f:'aws-glue',       l:'Glue',             t:'glue,etl,catalog,aws' },
  { f:'aws-athena',     l:'Athena',           t:'athena,query,sql,aws' },
  { f:'aws-kinesis',    l:'Kinesis',          t:'kinesis,streaming,events,aws' },
  { f:'aws-msk',        l:'MSK',              t:'msk,kafka,streaming,aws' },
  { f:'aws-sqs',        l:'SQS',              t:'sqs,queue,messaging,aws' },
  { f:'aws-sns',        l:'SNS',              t:'sns,topic,pubsub,aws' },
  { f:'aws-mq',         l:'MQ',               t:'mq,activemq,rabbitmq,messaging,aws' },
  { f:'aws-eventbridge',l:'EventBridge',      t:'eventbridge,events,bus,aws' },
  { f:'aws-dynamodb',   l:'DynamoDB',         t:'dynamodb,nosql,keyvalue,aws' },
  { f:'aws-documentdb', l:'DocumentDB',       t:'documentdb,mongo,nosql,aws' },
  { f:'aws-neptune',    l:'Neptune',          t:'neptune,graph,aws' },
  { f:'aws-elasticache',l:'ElastiCache',      t:'elasticache,redis,cache,aws' },
  { f:'aws-lambda',     l:'Lambda',           t:'lambda,functions,serverless,aws' },
  { f:'aws-ec2',        l:'EC2',              t:'ec2,compute,vms,aws' },
  { f:'aws-ecs',        l:'ECS',              t:'ecs,containers,aws' },
  { f:'aws-eks',        l:'EKS',              t:'eks,kubernetes,containers,aws' },
  { f:'aws-fargate',    l:'Fargate',          t:'fargate,containers,serverless,aws' },
  { f:'aws-batch',      l:'Batch',            t:'batch,compute,jobs,aws' },
  { f:'aws-api-gateway',l:'API Gateway',      t:'api,gateway,http,aws' },
  { f:'aws-step-functions', l:'Step Functions', t:'step functions,orchestration,workflow,aws' },
  { f:'aws-cloudwatch', l:'CloudWatch',       t:'cloudwatch,metrics,logs,aws' },
  { f:'aws-iam',        l:'IAM',              t:'iam,identity,access,aws' },
  { f:'aws-kms',        l:'KMS',              t:'kms,keys,encryption,aws' },
  { f:'aws-secrets-manager', l:'Secrets Manager', t:'secrets,credentials,aws' },
  { f:'aws-lake-formation',  l:'Lake Formation',  t:'lake formation,governance,catalog,aws' },
  { f:'aws-quicksight', l:'QuickSight',       t:'quicksight,bi,dashboards,aws' },
  { f:'aws-cognito',    l:'Cognito',          t:'cognito,auth,identity,aws' },
  { f:'aws-appflow',    l:'AppFlow',          t:'appflow,ingest,connectors,aws' },
  { f:'aws-vpc',        l:'VPC',              t:'vpc,network,subnet,aws' },
  { f:'microsoft-azure',l:'Azure',            t:'azure,microsoft,cloud' },
  { f:'google-cloud',   l:'Google Cloud',     t:'gcp,google,cloud' },
  { f:'google-cloud-run', l:'Cloud Run',      t:'cloud run,run,serverless,containers,gcp' },
  { f:'google-cloud-functions', l:'Cloud Functions', t:'cloud functions,functions,faas,serverless,gcp' },
  { f:'power-bi',       l:'Power BI',         t:'power bi,powerbi,bi,microsoft' },
  { f:'tableau',        l:'Tableau',          t:'tableau,bi,viz' },
  { f:'looker',         l:'Looker',           t:'looker,bi,lookml' },
  { f:'bigquery',       l:'BigQuery',         t:'bigquery,warehouse,gcp' },
  { f:'dbt',            l:'dbt',              t:'dbt,transformation,modeling' },
  { f:'snowflake',      l:'Snowflake',        t:'snowflake,warehouse' },
  { f:'databricks',     l:'Databricks',       t:'databricks,lakehouse' },
  { f:'airflow',        l:'Airflow',          t:'airflow,orchestration,dag' },
  { f:'kafka',          l:'Kafka',            t:'kafka,events,streaming' },
  { f:'airbyte',        l:'Airbyte',          t:'airbyte,connectors,etl' },
  { f:'segment',        l:'Segment',          t:'segment,cdp,events' },
  { f:'postgresql',     l:'PostgreSQL',       t:'postgres,postgresql,sql' },
  { f:'mysql',          l:'MySQL',            t:'mysql,sql' },
  { f:'mongodb',        l:'MongoDB',          t:'mongodb,nosql' },
  { f:'elasticsearch',  l:'Elasticsearch',    t:'elasticsearch,search' },
  { f:'redis',          l:'Redis',            t:'redis,cache' },
  { f:'docker',         l:'Docker',           t:'docker,containers' },
  { f:'kubernetes',     l:'Kubernetes',       t:'kubernetes,k8s' },
  { f:'terraform',      l:'Terraform',        t:'terraform,iac' }
];
const BRAND_THUMB = {
  'power-bi': 'https://cdn.jsdelivr.net/gh/gilbarbara/logos/logos/microsoft-power-bi.svg',
  'bigquery': 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/googlebigquery.svg'
};
const brandThumb = file => BRAND_THUMB[file] ||
  'https://cdn.jsdelivr.net/gh/gilbarbara/logos/logos/' + logoSlug(file) + '.svg';

[{ order:'front', title:'Bring to front',
   svg:'<rect x="4" y="15" width="16" height="5" rx="1.2"/><path d="M12 12V3.5M8.5 7 12 3.5 15.5 7"/>' },
 { order:'back', title:'Send to back',
   svg:'<rect x="4" y="4" width="16" height="5" rx="1.2"/><path d="M12 12v8.5M8.5 17 12 20.5l3.5-3.5"/>' }
].forEach(opt => {
  const b = document.createElement('button');
  b.innerHTML = `<svg viewBox="0 0 24 24">${opt.svg}</svg>`;
  b.title = opt.title;
  b.setAttribute('aria-label', opt.title);
  b.dataset.order = opt.order;
  b.style.marginLeft = '6px';
  b.addEventListener('mousedown', ev => ev.preventDefault());
  b.addEventListener('click', () => reorderSelection(opt.order === 'front'));
  shaper.appendChild(b);
});

['left','center','right'].forEach(al => {
  const b = document.createElement('button');
  b.innerHTML = `<svg viewBox="0 0 24 24">${ALIGN_ICON[al]}</svg>`;
  b.title = 'align ' + al;
  b.dataset.align = al;
  b.style.marginLeft = al === 'left' ? '6px' : '0';
  b.addEventListener('mousedown', ev => ev.preventDefault());
  b.addEventListener('click', () => {
    const n = byId(S.selNodes[0]);
    if (!n) return;
    snapshot();
    n.align = al;
    render();
  });
  shaper.appendChild(b);
});

const ZONE_STYLE = [
  { flag:'band', title:'Header band',
    svg:'<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M3.5 10h17"/>' },
  { flag:'solid', title:'Solid border',
    svg:'<rect x="3.5" y="5" width="17" height="14" rx="2"/>' }
];
ZONE_STYLE.forEach(opt => {
  const b = document.createElement('button');
  b.innerHTML = `<svg viewBox="0 0 24 24">${opt.svg}</svg>`;
  b.title = opt.title;
  b.setAttribute('aria-label', opt.title);
  b.setAttribute('aria-pressed', 'false');
  b.dataset.zone = opt.flag;
  b.style.marginLeft = opt.flag === 'band' ? '6px' : '0';
  b.addEventListener('mousedown', ev => ev.preventDefault());
  b.addEventListener('click', () => {
    const n = byId(S.selNodes[0]);
    if (!n || n.kind !== 'zone') return;
    snapshot();
    n[opt.flag] = !n[opt.flag];
    render();
  });
  shaper.appendChild(b);
});

const linkbar = document.getElementById('linkbar');
const LINK_STYLE = [
  { lw:1.2, title:'Thin', svg:'<path d="M3 12h18" stroke-width="1.2"/>' },
  { lw:1.5, title:'Medium', svg:'<path d="M3 12h18" stroke-width="2"/>' },
  { lw:3, title:'Thick', svg:'<path d="M3 12h18" stroke-width="3.4"/>' },
  { dash:'1', title:'Dashed', svg:'<path d="M3 12h5M11 12h5M19 12h2" stroke-width="2"/>' },
  { head:'1', title:'End arrow', svg:'<path d="M3 12h16M14 8l5 4-5 4"/>' },
  { headstart:'1', title:'Start arrow', svg:'<path d="M21 12H5M10 8l-5 4 5 4"/>' }
];
LINK_STYLE.forEach(opt => {
  const b = document.createElement('button');
  b.innerHTML = `<svg viewBox="0 0 24 24">${opt.svg}</svg>`;
  b.title = opt.title;
  b.setAttribute('aria-label', opt.title);
  b.setAttribute('aria-pressed', 'false');
  if (opt.lw != null) b.dataset.lw = opt.lw;
  if (opt.dash) b.dataset.dash = '1';
  if (opt.head) b.dataset.head = '1';
  if (opt.headstart) b.dataset.headstart = '1';
  if (opt.dash || opt.head) b.style.marginLeft = '6px';
  b.addEventListener('mousedown', ev => ev.preventDefault());
  b.addEventListener('click', () => {
    const sel = links.filter(x => S.selLinks.includes(x.id));
    if (!sel.length) return;
    snapshot();
    sel.forEach(l => {
      if (b.dataset.lw != null) l.lw = +b.dataset.lw;
      else if (b.dataset.dash){
        const mode = l.motion || S.motion;
        const animated = mode === 'dashes' || mode === 'both' || mode === 'live';
        const on = animated || l.dash === true;
        l.dash = !on;
        if (on){
          if (mode === 'both') l.motion = 'dots';
          else if (mode === 'dashes' || mode === 'live') l.motion = 'off';
        }
      }
      else if (b.dataset.head) l.head = l.head === false;
      else if (b.dataset.headstart) l.headStart = !l.headStart;
    });
    render();
  });
  linkbar.appendChild(b);
});

function placeShaper(){
  if (S.selNodes.length !== 1 || editing){ shaper.style.display = 'none'; return; }
  const n = byId(S.selNodes[0]);
  if (!n){ shaper.style.display = 'none'; return; }
  const s = toScreen({ x:n.x, y:n.y });
  shaper.style.display = 'flex';
  shaper.style.left = Math.max(6, s.x) + 'px';
  const above = s.y - 78;
  shaper.style.top = (above < 8 ? s.y + n.h*view.k + 46 : above) + 'px';
  shaper.querySelectorAll('button').forEach(b => {
    let on = false;
    if (b.dataset.zone){
      b.style.display = n.kind === 'zone' ? '' : 'none';
      on = n.kind === 'zone' && n[b.dataset.zone] === true;
    } else if (b.dataset.align) on = (n.align || 'center') === b.dataset.align;
    else on = b.dataset.kind === n.kind;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}

function placeLinkbar(){
  const l = S.selLinks.length === 1 && links.find(x => x.id === S.selLinks[0]);
  if (!l || S.selNodes.length || editing){ linkbar.style.display = 'none'; return; }
  const a = byId(l.from), b = byId(l.to);
  if (!a || !b){ linkbar.style.display = 'none'; return; }
  const m = midPoint(route(a, b, l.way, l));
  const s = toScreen(m);
  linkbar.style.display = 'flex';
  const w = linkbar.offsetWidth || 200;
  linkbar.style.left = Math.max(6, Math.min(window.innerWidth - w - 6, s.x - w/2)) + 'px';
  const above = s.y - 46;
  linkbar.style.top = (above < 8 ? s.y + 18 : above) + 'px';
  const lw = l.lw || 1.5;
  const mode = l.motion || S.motion;
  const animated = mode === 'dashes' || mode === 'both' || mode === 'live';
  const dashOn = animated || l.dash === true;
  linkbar.querySelectorAll('button').forEach(btn => {
    let on = false;
    if (btn.dataset.lw){
      btn.disabled = false;
      on = +btn.dataset.lw === lw;
    } else if (btn.dataset.dash){
      btn.disabled = false;
      on = dashOn;
      btn.title = animated ? 'Stop animated dashes' : (l.dash === true ? 'Hide dashes' : 'Show dashes');
    } else if (btn.dataset.head){
      btn.disabled = false;
      on = l.head !== false;
    } else if (btn.dataset.headstart){
      btn.disabled = false;
      on = l.headStart === true;
      btn.title = (l.head === false && l.headStart) ? 'Start arrow (flow reversed)' : 'Start arrow';
    }
    btn.classList.toggle('on', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}
window.addEventListener('resize', () => { placeShaper(); placeLinkbar(); placeStylebar(); });

