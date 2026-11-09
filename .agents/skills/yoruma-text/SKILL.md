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
  `cube`, `table`, `text`, `heading`.
- **Names must be unique** and cannot contain `:`. Arrows refer to names, not ids.
- **Arrows live at the top level**: `A -> B: note`, chains `A -> B -> C`, `--` for no
  arrowhead, `<->` for both ends. Only the last segment of a chain takes a label.
- **Props are `key: value`**, indented under the shape they belong to:
  `sub:`, `brand:` (svgl logo name, e.g. `postgres`, `kafka`), `tint:`, `band:`, `solid:`,
  `color:` and `fill:` (`#RRGGBB`), `align:`, `x:`/`y:`/`w:`/`h:` (absolute pinning — avoid
  it unless asked), and `dir:` on zones.
- **Document props** at the top: `title:`, `subtitle:`, `dir: right|down`, `theme: data`
  (role tones by kind: stores green, queues orange, files blue, services and dashboards
  indigo, agents purple, people/clouds/shields gray; explicit `color:` still wins).
- **Arrows take props** too, indented under the arrow line, applied to every arrow on that
  line: `color:`, `dash: true|false`, `motion: off|dots|dashes|both|live`.
- **Zones stack children top-to-bottom by default** (stage lanes). Give a zone
  `dir: right` when its children should read left to right (fan-outs beside the source).
- End every shape and arrow line with `:`; the file then stays valid YAML.

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

## How the layout behaves (so you can predict it)

Ranks come from the arrows: a shape sits one rank after everything pointing at it. Within a
rank the packer orders by neighbouring shapes and slides each one to the average centre of
its neighbours, so arrows come out short and straight. Zones hug their children and their
title, and a rank of zones advances with a tight 48px lane gap. The result is deterministic:
the same file always lays out the same way, and `x:`/`y:` pins survive.

## Handing the diagram over

Yoruma is a static page: whoever wants the picture opens `index.html` from a clone of the repo
(or the published site) and loads the file there. There is no server, no CLI and nothing to
install — the yaml is the deliverable.

- Give the yaml in one fenced block, ready to save as `diagram.yaml`.
- Tell them: **FILE ▾ → Open text…**, or drop the saved file on the canvas.
- Close the loop in plain language: they say what should change, you answer with the updated
  block. Say what to look at ("the queue should now be orange, between Capture and Processing")
  so a mistake is visible at a glance.

Stay near the 400-token target: the file is meant to be read and edited by a human in a text
editor as much as by a model.

## Keep it small

Target roughly 400 tokens per diagram. Do not add a schema, a CLI, a parser wrapper or a
templating layer. Notes on arrows (`A -> B: read`) and short `sub:` lines carry most of the
meaning; avoid prose inside shapes.