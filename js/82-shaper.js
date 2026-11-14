/* ---------- shaper ---------- */
const shaper = document.getElementById('shaper');
const loopbar = document.getElementById('loopbar');
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
ANIMS.forEach(a => {
  const b = document.createElement('button');
  b.innerHTML = `<svg viewBox="0 0 24 24">${LOOP_D[a]}</svg>`;
  b.title = a.charAt(0).toUpperCase() + a.slice(1) + ' (press again to stop)';
  b.setAttribute('aria-label', 'animate the tile: ' + a);
  b.setAttribute('aria-pressed', 'false');
  b.dataset.anim = a;
  b.addEventListener('mousedown', ev => ev.preventDefault());
  b.addEventListener('click', () => {
    const n = byId(S.selNodes[0]);
    if (!n || n.kind !== 'tile') return;
    snapshot();
    if (n.anim === a) delete n.anim;
    else n.anim = a;
    render();
  });
  loopbar.appendChild(b);
});
/* The stepper only shows beside a running tile: the tempo belongs to the
   loop, not to every shape, so it stays out of the strip until it can act. */
function stepSpeed(n, dir){
  if (!n || n.kind !== 'tile' || !n.anim) return false;
  const next = SPEEDS[Math.min(SPEEDS.length - 1,
    Math.max(0, speedStep(n) + dir))];
  snapshot();
  if (next === 1) delete n.speed;
  else n.speed = next;
  render();
  return true;
}
[{ id:'slower', icon:'<path d="M14 6l-6 6 6 6"/>', label:'Slower' },
 { id:'faster', icon:'<path d="M10 6l6 6-6 6"/>', label:'Faster' }]
.forEach(st => {
  const b = document.createElement('button');
  b.innerHTML = `<svg viewBox="0 0 24 24">${st.icon}</svg>`;
  b.title = st.label;
  b.setAttribute('aria-label', st.label + ' the tile loop');
  b.dataset.speed = st.id;
  b.addEventListener('mousedown', ev => ev.preventDefault());
  b.addEventListener('click',
    () => stepSpeed(byId(S.selNodes[0]), st.id === 'faster' ? 1 : -1));
  loopbar.appendChild(b);
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

/* A zone wears its vendor mark in the band, like the AWS/Azure frame style.
   Click the button to pick an image; click it again to remove the logo. */
const zoneLogoInput = document.createElement('input');
zoneLogoInput.type = 'file';
zoneLogoInput.accept = 'image/*';
zoneLogoInput.style.display = 'none';
document.body.appendChild(zoneLogoInput);
zoneLogoInput.addEventListener('change', () => {
  const n = byId(S.selNodes[0]);
  if (n && n.kind === 'zone' && zoneLogoInput.files[0])
    attachLogo(zoneLogoInput.files[0], n);
  zoneLogoInput.value = '';
});
const zoneLogoBtn = document.createElement('button');
zoneLogoBtn.innerHTML = '<svg viewBox="0 0 24 24">' +
  '<rect x="3.5" y="5" width="17" height="14" rx="1.8"/>' +
  '<circle cx="8.6" cy="10" r="1.6"/>' +
  '<path d="M4.2 17.2l4.8-4.8 4.2 4.2 2.4-2.4 4.2 4.2"/></svg>';
zoneLogoBtn.dataset.zone = 'logo';
zoneLogoBtn.title = 'Zone logo — choose an image, or drop one on the band';
zoneLogoBtn.setAttribute('aria-label', 'Attach or remove the zone logo');
zoneLogoBtn.setAttribute('aria-pressed', 'false');
zoneLogoBtn.addEventListener('mousedown', ev => ev.preventDefault());
zoneLogoBtn.addEventListener('click', () => {
  const n = byId(S.selNodes[0]);
  if (!n || n.kind !== 'zone') return;
  if (n.logo){
    snapshot();
    delete n.logo;
    delete n.mono;
    render();
    toast('zone logo removed');
    return;
  }
  zoneLogoInput.click();
});
shaper.appendChild(zoneLogoBtn);

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

/* The strip hugs its tile, but the style bar is docked top-right and would
   swallow it: try above and below the tile, then left of that panel, and only
   then drop it under the panel. */
function loopSpot(n, s){
  const w = loopbar.offsetWidth, h = loopbar.offsetHeight;
  const panel = document.getElementById('stylebar');
  const sb = panel && panel.offsetWidth ? panel.getBoundingClientRect() : null;
  const across = x => Math.max(6, Math.min(window.innerWidth - w - 6, x));
  const spots = [];
  [s.y - h - 10, s.y + n.h*view.k + 10].forEach(y => {
    spots.push({ x: across(s.x), y });
    if (sb) spots.push({ x: across(sb.left - w - 8), y });
  });
  if (sb) spots.push({ x: across(s.x), y: sb.bottom + 8 });
  const clear = p => p.y >= 6 && p.y + h <= window.innerHeight - 6 &&
    (!sb || p.x + w <= sb.left || p.x >= sb.right ||
     p.y + h <= sb.top || p.y >= sb.bottom);
  return spots.find(clear) ||
    { x: across(s.x),
      y: Math.max(6, Math.min(s.y - h - 10, window.innerHeight - h - 6)) };
}

function placeShaper(){
  loopbar.style.display = 'none';
  if (S.selNodes.length !== 1 || editing){ shaper.style.display = 'none'; return; }
  const n = byId(S.selNodes[0]);
  if (!n){ shaper.style.display = 'none'; return; }
  const s = toScreen({ x:n.x, y:n.y });
  /* A tile is a running thing, not a shape to restyle: it gets the loop strip
     and nothing else, so one selection never means two floating bars. */
  if (n.kind === 'tile'){
    shaper.style.display = 'none';
    loopbar.style.display = 'flex';
    const at = loopSpot(n, s);
    loopbar.style.left = at.x + 'px';
    loopbar.style.top = at.y + 'px';
  } else {
    shaper.style.display = 'flex';
    shaper.style.left = Math.max(6, s.x) + 'px';
    const above = s.y - 78;
    shaper.style.top = (above < 8 ? s.y + n.h*view.k + 46 : above) + 'px';
  }
  document.querySelectorAll('#shaper button, #loopbar button').forEach(b => {
    let on = false;
    if (b.dataset.anim){
      b.style.display = n.kind === 'tile' ? '' : 'none';
      on = n.anim === b.dataset.anim;
    }
    else if (b.dataset.speed){
      b.style.display = n.kind === 'tile' && n.anim ? '' : 'none';
      const at = speedStep(n);
      b.disabled = b.dataset.speed === 'slower' ? at <= 0 : at === SPEEDS.length - 1;
      b.classList.toggle('tempo', animSpeed(n) !== 1);
      b.title = (b.dataset.speed === 'slower' ? 'Slower' : 'Faster') +
        ', now ' + animSpeed(n) + '×';
    }
    else if (b.dataset.zone){
      b.style.display = n.kind === 'zone' ? '' : 'none';
      on = n.kind === 'zone' && (b.dataset.zone === 'logo'
        ? !!n.logo : n[b.dataset.zone] === true);
      if (b.dataset.zone === 'logo')
        b.title = n.logo
          ? 'Remove the zone logo'
          : 'Zone logo — choose an image, or drop one on the band';
    } else if (b.dataset.align){
      b.style.display = n.kind === 'tile' ? 'none' : '';
      on = (n.align || 'center') === b.dataset.align;
    }
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
  const m = midPoint(route(a, b, bendsOf(l), l));
  const s = toScreen(m);
  linkbar.style.display = 'flex';
  const w = linkbar.offsetWidth || 200;
  linkbar.style.left = Math.max(6, Math.min(window.innerWidth - w - 6, s.x - w/2)) + 'px';
  /* Clear the label: it ends about 23px above the midpoint, the bar is ~36px
     tall, so 64px leaves a gap instead of clipping the text. */
  const above = s.y - 64;
  linkbar.style.top = (above < 8 ? s.y + 26 : above) + 'px';
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

