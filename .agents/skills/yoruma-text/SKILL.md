---
name: yoruma-text
description: >
  Write or edit yoruma diagrams in its plain-text format (YAML-shaped,
  no coordinates). Use when producing a data or architecture diagram as
  text for yoruma, when asked for a ".yaml diagram", a "yoruma diagram",
  or when converting an architecture description into shapes, zones and
  arrows that yoruma can lay out. Aimed at ~400 tokens per diagram.
user-invocable: true
---

# yoruma text format

yoruma (github.com/soyomarvaldezg/yoruma) takes a small declarative text file and lays it
out itself: you write names, kinds and connections, the packer does positions. Do not emit
coordinates, JSON, or a schema — the whole point is that the file stays short.

## Shape of a file

```yaml
title: Local mock-data pipeline
subtitle: three sources, one grain, one dashboard
dir: right

zone Raw:
  color: "#F6B26B"
  card Landing:
    sub: unmodified
  card Arrival checks:
    sub: findings counted

zone Standardized:
  dir: right
  card Cleanse:
    sub: dedup, null rule
  card sqlite3 load:
    sub: orders.db
  card duckdb COPY:
    sub: parquet

db DuckDB:
  sub: customer_summary

Landing -> Arrival checks:
Arrival checks -> Cleanse: pass
Cleanse -> sqlite3 load:
Cleanse -> duckdb COPY:
sqlite3 load -> DuckDB:
duckdb COPY -> DuckDB:
```

## Rules that matter

- **Indentation is nesting**, two spaces per level. Tabs are rejected.
- **Kinds** are palette words: `card`, `box`, `ellipse`, `zone`, `db`/`database`/`store`,
  `queue`, `cloud`, `file`, `api`, `shield`, `people`, `agent`, `contract`, `dashboard`,
  `cube`, `table`, `tile`, `text`, `heading`.
- **A tile** (`tile Status`) is a filled square in one hue with a white glyph and no
  outline: the explicit `color:` wins, otherwise the glyph hashes to a stable hue.
  It suits outcomes: `tile OK`, `tile Failed`, and the state glyphs
  `success`, `error`, `warning`, `info`, `question`, `blocked`, `retry`, `bug`, `alert`,
  plus the pipeline states `down`, `saturated` and `stale`.
  `tint: true` washes the tile pale and paints the glyph in the outline colour.
  `anim:` makes the tile loop instead of showing a glyph, and it wins over `icon:`
  and `brand:`. Match the loop to what is running: `loading` one call in flight,
  `progress` a backfill or an ingest, `typing` an agent or LLM, `uploading` a push
  or export, `stream` events flowing, `sync` replication or CDC, `waiting` queued or
  paused, `retry` backing off after a failure, `poll` a scheduled check, `heartbeat`
  uptime, `throttle` running but rate-limited or at capacity. A loop tile hashes its
  hue from its name, so write `color:` when the hue carries meaning and `tint: true`
  when it should stay quiet; two loops per diagram are plenty, they are the loudest
  thing on the canvas. A word can be both a state and a loop (`retry`): `icon:` draws
  it once, `anim:` makes it run.
  `speed: 0.5` makes that loop twice as slow and `speed: 2` twice as fast (0.25 to 4,
  default 1, and only with `anim:`); reach for it only when the same glyph needs two
  tempos in one picture, not to fine-tune a loop.
- **Names must be unique** and cannot contain `:`. Arrows refer to names, not ids.
- **Arrows live at the top level**: `A -> B: note`, chains `A -> B -> C`, `--` for no
  arrowhead, `<->` for both ends. Only the last segment of a chain takes a label.
- **Props are `key: value`**, indented under the shape they belong to:
  `sub:`, `icon:` (bundled glyph, see below), `brand:` (svgl colour logo name), `tint:`,
  `stroke:` (`solid`, `dashed`, `dotted`), `size:` (`s`, `m`, `l`, `xl` — stroke width),
  `sharp:` (square corners), `fillmode:` (`soft` wash or `solid`), `band:`, `solid:`, `dash:`
  (dashed outline), `color:` and `fill:` (`#RRGGBB`), `align:`, `anim:` and `speed:`
  (tiles only),
  `x:`/`y:`/`w:`/`h:` (absolute pinning — avoid it unless asked), and `dir:` on zones.
  Zones take `dir:`, `color:`, `fill:`, `band:`, `solid:` and `dash:`; `fill:` on a zone paints
  it as a pale wash, which is how subnet/VPC lanes get their tint.
- **Document props** at the top: `title:`, `subtitle:`, `dir: right|down`, `theme: data`
  (role tones by kind: stores green, queues orange, files blue, services and dashboards
  indigo, agents purple, people/clouds/shields gray; explicit `color:` still wins).
- **Arrows take props** too, indented under the arrow line, applied to every arrow on that
  line: `color:`, `dash: true|false`, `motion: off|dots|dashes|both|live`,
  and repeated `bend: x y` lines, one per corner, in order along the arrow
  (at most 8).
- **Zones stack children top-to-bottom by default** (stage lanes). Give a zone
  `dir: right` when its children should read left to right (fan-outs beside the source).
  `dir` is the flow axis: children with no arrows between them form a row under `dir: down`.
- **Overlapping boxes are a layout problem, not a text one.** Zones nest by containment, so
  express "VPC spans the AZs" by nesting the AZs inside the VPC (or vice versa) rather than by
  stacking two frames on top of each other; `x:`/`y:` pins only exist as an escape hatch.
- End every shape and arrow line with `:`; the file then stays valid YAML.

## Reading like a data architect

Name the zones after lifecycle stages and let the arrows run left to right:
**Sources → Ingest → Transform → Serve → Consume**. Put governance, monitoring and
orchestration in their own lanes beside that spine, not in the middle of it.

| Stage | Role (`icon:`) | Loop (`anim:`) | State (`icon:` on a tile) |
|---|---|---|---|
| Sources | `object storage`, `file`, `queue` | `loading` | `success`, `error` |
| Ingest | `pipeline`, `etl service`, `replication` | `uploading`, `sync` | `error`, `warning` |
| Backfill | `pipeline` | `progress` at `speed: 0.5` | `warning` |
| Transform | `etl service`, `stream processor` | `progress`, `typing` | `retry`, `error` |
| Serve | `data warehouse`, `dashboard`, `api` | `poll` | `success`, `stale` |
| Operate | `workflow`, `monitoring` | `heartbeat`, `poll`, `throttle` | `down`, `saturated` |

- A loop tile says what is running now; a state tile says how it ended. Never imply both.
- `throttle` is "working but limited"; `saturated` is the outcome. `down` means nothing
  runs, so it never gets a loop.
- Two loops per diagram at most. Everything else is a card or a state.

## Motion and dash conventions (use these by default)

Arrows are plain lines unless the flow means something; pick the style from what the arrow
represents:

- **plain line (no props)** — a static dependency: "this calls that". The default for most
  arrows; never style arrows just for decoration.
- **`dash: true`** — weak or transitional coupling: batch loads, nightly syncs, replication,
  planned or retiring paths. Also use gray (`color: "#657486"`) so it reads as background.
- **`motion: dots`** — discrete messages or events travelling: one unit at a time
  (orders, requests, messages on a queue).
- **`motion: dashes`** — a continuous stream flowing: pipelines, replication, log shipping.
- **`motion: both`** — a heavy continuous flow that also carries discrete payloads; rare.
- **`motion: live`** — the hero flow. The animated comet draws the eye, so use it on one or
  two arrows at most: the real-time path of the diagram (a stream feeding a processor, the
  request path being discussed). Never put live on more than one arrow per zone.

Colour conventions on arrows: leave them neutral; use explicit `color:` only for meaning —
gray for deprecated/retiring paths, red (`#E03131`) for alerts or failure paths, the source
role's tone when the arrow *is* that pipeline's payload (e.g. orange from a queue).

`theme: data` already colours shapes by role, so prefer the theme over hand-picking shape
colours, and add `color:` only where it carries meaning.

## Icons: `icon:` vs `brand:`

- `icon:` paints a **bundled monochrome glyph** in the shape's outline colour. It works offline,
  costs nothing in the document, and matches the diagram's palette. Prefer it. A name the pack
  does not know is fetched as a colour logo instead, which needs the network: write
  `icon: etl service` (a role), not `icon: dbt`.
- `brand:` fetches the **colour logo** at import (svgl / gilbarbara / simple-icons) and stores it
  inline. Use it only when the brand itself is the point (a vendor deck), and expect a network.
- Vendor service names are aliases on role glyphs, so write what the box *is*:
  `blob storage`/`cloud storage` → Object storage (but `s3` is the MinIO brand glyph);
  `redshift`/`synapse`/`oracle atp` →
  Data warehouse; `data factory`/`glue`/`data fusion` → ETL service; `eventbridge`/`event grid`/
  `pubsub`/`event hubs` → Event bus; `sqs`/`service bus` → Message queue; `kinesis`/`dataflow`/
  `stream analytics` → Stream processor; `sagemaker`/`vertex ai`/`azure ml` → ML platform;
  `bedrock`/`gpt`/`gemini` → Generative AI; `purview`/`dataplex`/`glue catalog` → Data catalog;
  `iceberg`/`hudi` → Table format (but `delta lake` is the Databricks glyph);
  `golden gate`/`dms`/`cdc` → Replication;
  also `data lake`, `managed database`, `nosql store`, `compute cluster`, `serverless`,
  `function`, `workflow`, `pipeline`, `notebook`, `feature store`, `model registry`,
  `model serving`, `bi workspace`, `monitoring`, `api gateway`, `edge delivery`, `network`,
  `load balancer`, `key vault`, `identity`, `lineage`, `catalog`, `etl service`.
- Real brands with a bundled glyph: Kafka, Spark, Airflow, Flink, Hadoop, Hive, Pulsar, Cassandra,
  Kafka-adjacent (RabbitMQ, NATS), Postgres, MySQL, MariaDB, MongoDB, Redis, Elasticsearch,
  ClickHouse, DuckDB, SQLite, Trino, Snowflake, Databricks (`delta lake`/`unity catalog` too),
  Looker, Metabase, Superset, Grafana, Prometheus, Datadog, Splunk, Docker, Kubernetes, Terraform,
  Ansible, Git/GitHub/GitLab, Airbyte, Jupyter, Streamlit, FastAPI, Python, R, Scala, Go, Rust,
  TypeScript, Node, Pandas, NumPy, scikit-learn, PyTorch, TensorFlow, MLflow, Hugging Face,
  NVIDIA, Cloudflare, Google Cloud/BigQuery/Sheets, Vault, Consul, Istio, etcd, InfluxDB, ScyllaDB,
  Druid, Presto, Timescale, Supabase, PlanetScale, Cockroach, MinIO, NiFi, Prefect, Temporal, Argo,
  Tekton, Jenkins, GitHub Actions, WireGuard/OpenVPN/Tailscale, NGINX/HAProxy/Envoy, Jaeger, Sentry,
  PagerDuty, Jira, Confluence, Qlik, MicroStrategy, Talend, Matillion, Netdata,
  Fluent Bit, Kibana, Logstash, Sumo Logic, New Relic.
- No free artwork exists for Azure service tiles, Oracle, Snowplow, Fivetran, dbt Cloud, DataHub,
  Collibra, Dagster, Kestra, Observable, or Delta Lake as a standalone logo. Use the role glyph, or tell the user to import
  the vendor pack once: **FILE ▾ → Icons → Import pack…** accepts `.svg` files (names and tags come
  from the filename) — AWS <https://aws.amazon.com/architecture/icons/>, Azure
  <https://learn.microsoft.com/en-us/azure/architecture/icons/>, Google
  <https://cloud.google.com/icons>. Their browser keeps it; the repo ships no vendor artwork.

## How the layout behaves (so you can predict it)

Ranks come from the arrows: a shape sits one rank after everything pointing at it. Within a
rank the packer orders by neighbouring shapes and slides each one to the average centre of
its neighbours, so arrows come out short and straight. Zones hug their children and their
title, and a rank of zones advances with a tight 48px lane gap. The result is deterministic:
the same file always lays out the same way, and `x:`/`y:` pins survive.

## Handing the diagram over

Yoruma is a static page: whoever wants the picture opens `index.html` from a clone of the repo
(or the published site) and loads the file there. Nothing is uploaded and a yaml file is the
deliverable. The repo also ships `tools/yoruma.mjs`, which renders that file to PNG or SVG
headlessly (`render`, `check`, `icons`; it needs `task deps` once). Use it when Node and the
tools are installed, since then you can look at the result before handing it over; otherwise
hand over the file.

- Write the yaml to a file yourself; never hand back a block and wait for the user to save it.
  Pick a name that says what the diagram is (`arquitectura-recomendada.yaml`, or the next
  `docs/example-*.yaml` when it belongs with the shipped examples), put it in the repo, and
  report the path.
- A fenced block is a preview of what you wrote, never the only copy.
- On an edit, rewrite that same file rather than printing a new one, so the path they already
  have open stays valid.
- Tell them: **FILE ▾ → Open text…**, or drop the saved file on the canvas.
- Close the loop in plain language: they say what should change, you answer with the updated
  file. Say what to look at ("the queue should now be orange, between Capture and Processing")
  so a mistake is visible at a glance.

Stay near the 400-token target: the file is meant to be read and edited by a human in a text
editor as much as by a model.

Load it once before saying it works. In this repo the shortest route is
`node tools/yoruma.mjs check FILE` (prints `line N: ...`) and
`node tools/yoruma.mjs render FILE -o /tmp/x.png`, then look at the image. Without the
tools, open `index.html` and call `openTextDoc(src, 'name.yaml', true)`, the same path
FILE ▾ → Open text takes. Do not stop at `buildTextDoc(parseText(src))`: that lays out the
file but skips the step that resolves `icon:` and `brand:`. A truncated `sub:` line or a
label sitting on an arrowhead only shows up in the picture.
`docs/example-loops.yaml` is the reference for icon cards, loops and `speed:`.

## Keep it small

Target roughly 400 tokens per diagram. Do not add a schema, a parser wrapper or a templating
layer; the repo's own renderer is `tools/yoruma.mjs` when it is installed.
Notes on arrows (`A -> B: read`) and short `sub:` lines carry most of the
meaning; avoid prose inside shapes.