// Dev-only: build the bundled monochrome icon pack (js/84-icons.js) from
// simple-icons (CC0, public domain). The pack ships inside the app so it works
// from file:// with no network. Re-run this script to change the set:
//   node tools/icons.mjs
// Titles must match simple-icons titles; `slug` overrides resolve odd ones.
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const CDN = 'https://cdn.jsdelivr.net/npm/simple-icons@latest';

// [title, tags, slug-override?]
const WANTED = [
  ['Google Cloud', 'gcp,google,cloud,gcs,storage'],
  ['Google BigQuery', 'bigquery,warehouse,bq,sql'],
  ['Google Sheets', 'sheets,spreadsheet,excel,export'],
  ['Cloudflare', 'cloudflare,cdn,edge,r2,storage'],
  ['Snowflake', 'snowflake,warehouse,dwh'],
  ['Databricks', 'databricks,lakehouse,spark,delta lake,unity catalog'],
  ['Looker', 'looker,bi,lookml'],
  ['Metabase', 'metabase,bi,dashboards'],
  ['Apache Superset', 'superset,bi,dashboards'],
  ['Grafana', 'grafana,observability,dashboards'],
  ['Prometheus', 'prometheus,metrics,observability'],
  ['Datadog', 'datadog,observability,monitoring'],
  ['Splunk', 'splunk,logs,observability'],
  ['Apache Kafka', 'kafka,events,streaming,queue,broker'],
  ['RabbitMQ', 'rabbitmq,queue,amqp,messaging'],
  ['NATS.io', 'nats,messaging,bus,events'],
  ['Apache Airflow', 'airflow,orchestration,dag,pipelines'],
  ['Apache NiFi', 'nifi,flows,routing,ingest'],
  ['Apache Spark', 'spark,processing,etl'],
  ['Apache Flink', 'flink,streaming,processing'],
  ['Apache Hadoop', 'hadoop,hdfs,batch'],
  ['Apache Hive', 'hive,warehouse,sql'],
  ['Apache Cassandra', 'cassandra,nosql,widecolumn'],
  ['Apache Pulsar', 'pulsar,messaging,events'],
  ['PostgreSQL', 'postgres,postgresql,sql,database,oltp'],
  ['MySQL', 'mysql,sql,database,oltp'],
  ['MariaDB', 'mariadb,sql,database'],
  ['MongoDB', 'mongodb,document,nosql'],
  ['Redis', 'redis,cache,keyvalue'],
  ['Elasticsearch', 'elasticsearch,search,index'],
  ['ClickHouse', 'clickhouse,olap,columnar,warehouse'],
  ['DuckDB', 'duckdb,olap,embedded,analytics'],
  ['SQLite', 'sqlite,embedded,sql'],
  ['Cockroach Labs', 'cockroach,crdb,sql,distributed'],
  ['Timescale', 'timescale,tsdb,time series,postgres'],
  ['Supabase', 'supabase,postgres,backend'],
  ['PlanetScale', 'planetscale,mysql,vitess'],
  ['MinIO', 'minio,object,storage,s3,compatible'],
  ['Trino', 'trino,presto,federated,query'],
  ['Docker', 'docker,containers,images'],
  ['Kubernetes', 'kubernetes,k8s,containers,orchestration'],
  ['Terraform', 'terraform,iac,infrastructure'],
  ['Ansible', 'ansible,automation,config'],
  ['Git', 'git,vcs,version'],
  ['GitHub', 'github,git,vcs'],
  ['GitLab', 'gitlab,git,ci'],
  ['Airbyte', 'airbyte,connector,ingest,etl'],
  ['Python', 'python,py,scripting'],
  ['R', 'r,stats,statistics'],
  ['Scala', 'scala,jvm,spark'],
  ['Go', 'go,golang,services'],
  ['Rust', 'rust,services,systems'],
  ['TypeScript', 'typescript,ts,web'],
  ['Node.js', 'node,nodejs,services', 'nodedotjs'],
  ['Jupyter', 'jupyter,notebooks,lab'],
  ['Streamlit', 'streamlit,app,dashboards,python'],
  ['FastAPI', 'fastapi,api,services,python'],
  ['Pandas', 'pandas,dataframes,python'],
  ['NumPy', 'numpy,arrays,python'],
  ['scikit-learn', 'sklearn,ml,scikit,python'],
  ['PyTorch', 'pytorch,ml,deep learning,training'],
  ['TensorFlow', 'tensorflow,ml,deep learning,training'],
  ['MLflow', 'mlflow,ml,tracking,registry'],
  ['Hugging Face', 'huggingface,llm,ml,models'],
  ['NVIDIA', 'nvidia,gpu,compute'],
  ['Google Dataproc', 'dataproc,cluster,compute,gcp,spark'],
  ['Google Dataflow', 'dataflow,pipelines,stream gcp,beam'],
  ['Google Bigtable', 'bigtable,nosql,gcp,widecolumn'],
  ['Google Cloud Spanner', 'spanner,sql,distributed,gcp'],
  ['Google Pub/Sub', 'pubsub,events,messaging,topic,gcp'],
  ['WireGuard', 'vpn,network,tunnel'],
  ['OpenVPN', 'vpn,network,tunnel'],
  ['Tailscale', 'vpn,mesh,network,zero trust'],
  ['NGINX', 'nginx,proxy,web server,load balancer'],
  ['HAProxy', 'haproxy,proxy,load balancer'],
  ['Envoy Proxy', 'envoy,proxy,service mesh,gateway'],
  ['Consul', 'consul,discovery,mesh,service'],
  ['Vault', 'vault,secrets,keys,credentials'],
  ['OpenSearch', 'opensearch,search,index,logs'],
  ['Apache Solr', 'solr,search,index'],
  ['Couchbase', 'couchbase,nosql,document,cache'],
  ['InfluxDB', 'influxdb,timeseries,metrics'],
  ['Temporal', 'temporal,workflow,durable,orchestration'],
  ['Jaeger', 'jaeger,tracing,observability'],
  ['Sentry', 'sentry,errors,observability'],
  ['PagerDuty', 'pagerduty,alerts,oncall'],
  ['Jira', 'jira,tickets,tracking'],
  ['Confluence', 'confluence,docs,wiki'],
  ['Qlik', 'qlik,bi,dashboards'],
  ['MicroStrategy', 'microstrategy,bi,dashboards'],
  ['Prefect', 'prefect,orchestration,pipelines'],
  ['Argo', 'argo,kubernetes,cd,workflows'],
  ['Tekton', 'tekton,ci,pipelines,kubernetes'],
  ['Jenkins', 'jenkins,ci,pipelines'],
  ['GitHub Actions', 'githubactions,ci,workflows'],
  ['CircleCI', 'circleci,ci,pipelines'],
  ['SonarQube Cloud', 'sonarqube,code quality,static analysis'],
  ['Snyk', 'snyk,security,vulnerabilities'],
  ['Netdata', 'netdata,monitoring,metrics'],
  ['Matillion', 'matillion,etl,elt,warehouse'],
  ['Talend', 'talend,etl,integration'],
  ['ScyllaDB', 'scylladb,nosql,widecolumn'],
  ['Apache Druid', 'druid,olap,analytics,timeseries'],
  ['Presto', 'presto,query,federated,sql'],
  ['BentoML', 'bentoml,models,serving,ml'],
  ['etcd', 'etcd,key value,config,cluster'],
  ['Istio', 'istio,service mesh,network'],
  ['Logstash', 'logstash,logs,pipelines,ingest'],
  ['Kibana', 'kibana,logs,dashboards,search'],
  ['Fluent Bit', 'fluentbit,logs,forwarder'],
  ['Sumo Logic', 'sumologic,logs,observability'],
  ['New Relic', 'newrelic,observability,apm']
];

const esc = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const innerOf = svg => {
  const m = /<svg[^>]*>([\s\S]*)<\/svg>\s*$/i.exec(String(svg).trim());
  if (!m) throw new Error('no svg body');
  return m[1].replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(/<\/?(path|g|circle|rect|ellipse|polygon|polyline|line)\b/gi, tag => {
      if (tag.startsWith('</')) return tag;
      const name = /(\w+)\b/.exec(tag)[1];
      return `<${name} fill="currentColor"`;
    })
    .replace(/\s+/g, ' ').trim();
};

const index = await (await fetch(CDN + '/data/simple-icons.json')).json();
const byTitle = new Map(index.map(i => [String(i.title).toLowerCase(), i]));

const entries = [], missing = [];
for (const [title, tags, slugOverride] of WANTED){
  const hit = byTitle.get(title.toLowerCase());
  const slug = slugOverride || (hit && hit.slug);
  if (!slug){ missing.push(title); continue; }
  let svg;
  try { svg = await (await fetch(CDN + '/icons/' + slug + '.svg')).text(); }
  catch (e){ missing.push(title); continue; }
  if (!String(svg).trim().startsWith('<svg')){ missing.push(title); continue; }
  entries.push({ n:title, t:tags, d:innerOf(svg) });
}

const out = `/* ---------- icon pack ---------- */
/* Monochrome icon pack, generated by \`node tools/icons.mjs\` from simple-icons
   (CC0, public domain). Edit the list in the tool and regenerate; do not
   hand-edit this file. Every glyph paints in the card's outline colour. */
const ICON_PACK = [
${entries.map(e => `  { n:'${esc(e.n)}', t:'${esc(e.t)}', d:'${esc(e.d)}' }`).join(',\n')}
];
`;
writeFileSync(path.join(root, 'js/84-icons.js'), out);
console.log('wrote js/84-icons.js:', entries.length, 'icons,',
  (out.length / 1024).toFixed(0) + ' KB');
if (missing.length) console.log('MISSING (not in simple-icons):', missing.join(', '));
