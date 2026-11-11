# yoruma — Data Diagrams

A diagram editor for data work that runs as one static page. Zones that nest, cards with
real brand logos, notes on arrows, and a present mode that walks the diagram step by step.

**Use it:** <https://soyomarvaldezg.github.io/yoruma/> — or open `index.html` from a clone.
Nothing to install, no build step. It starts on a blank canvas; **EXAMPLES ▾** loads a modern
BI stack, a real-time streaming pipeline or an ML platform, built only from the Blocks.

**Beta, and it moves.** yoruma is a work in progress. Expect rough edges: a gesture that
behaves oddly, an export that misses a detail, a feature that changes shape next week. The
suite runs on every push and the document format is versioned, but nothing here is a promise.
Download a JSON copy of anything you would hate to redraw.

![The editor with the modern BI example open](docs/editor.png)

## What it does

- **Zones** nest: an outer zone's members are everything inside it at any depth, so moving a
  VPC carries the region, the group and the shapes. Resizing a zone moves its own frame only —
  neither the position nor the size of the shapes inside it changes. A zone can show a **header band** with its title and drop its dashes for a
  solid outline.
- **Cards** take an outline colour and a tint of their own colour independently, plus a
  **stroke style** (solid, dashed, dotted), **edges** (rounded or sharp), a **stroke width**
  (S/M/L/XL, wide enough apart to tell apart) and a **fill strength** (**Soft** = a pale wash of the
  fill colour, **Solid** = that colour at full strength) — the rows under the swatches, applied to
  the selection or kept as the default for the next shape. In text: `stroke: dashed`, `sharp: true`, `size: l` (`dash: true` still
  works), and can carry
  an **icon**: the **Icons** box in the left sidebar searches 144 bundled monochrome glyphs and
  paints whichever one you click in the card's own outline colour. 112 come from simple-icons
  (CC0); the other 32 are **role glyphs** drawn here — object storage, data lake, warehouse,
  managed database, NoSQL store, stream processor, event bus, message queue, ETL service,
  replication, catalog, notebook, compute cluster, serverless, function, workflow, pipeline,
  ML platform, generative AI, model serving, feature store, model registry, BI workspace,
  monitoring, table format, API gateway, edge delivery, network, load balancer, key vault,
  identity, lineage — each tagged with the vendor service names that fill that role. So `s3`, `blob storage` and `cloud storage` all find
  the bucket, and `redshift`, `synapse` and `Oracle ATP` all find the warehouse, with no vendor
  artwork in the repo and no network needed. Typing `kafka`, `s3`, `database` or `observability` is enough — every glyph carries
  tags. The same box also reaches **real brand logos** in colour, fetched from svgl and
  gilbarbara on click, for the vendors a bundled glyph cannot cover — the whole AWS service
  set (`s3`, `glue`, `kinesis`, `lambda`, `redshift`, `athena`…), Azure, Google Cloud, Tableau
  and Power BI. Logos are stored inside the document and never recoloured; images can also be
  dropped straight onto a card, or added with the **IMAGE** button in the header.
- **Arrows** attach anywhere along a border, enter perpendicular to it, can be bent, styled,
  animated, and carry a note that wraps to four lines.
- **Pages** hold separate diagrams in one document: the strip at the top-left of the canvas adds a
  page (`+`), switches on click, renames on double-click and deletes from its `×`. Each page keeps
  its own shapes, arrows and zoom, and autosave covers all of them — so a deck of diagrams lives
  in one file, and PRESENT still walks only the page you are on.
- **Steps** are invisible frames: select shapes, add a step, and **PRESENT** glides from the
  overview through each step, dimming everything else. Arrows or clicks advance, `Esc` exits.
- **Blocks**: the reference capabilities in ten groups, mirroring Omar's
  [enterprise data architecture reference](https://github.com/soyomarvaldezg/enterprise-data-architecture-reference)
  (CC BY 4.0), narrowed to what its nine worked flows actually draw.
- **Lint**: a small **LINT · n** pill appears above the status line when text runs outside or is
  cut off in a shape, or an arrow crosses a shape it is not attached to. Hover lists the
  problems, clicking steps through them and selects the offender. It only points; fixing stays
  with you.

![Nested zones: VPC, region and subnet, with header bands](docs/zones.png)

## Keys

macOS names are shown; on Windows and Linux `⌘` is Ctrl, `⌥` is Alt and `⇧` is Shift. Two caveats
there: some window managers keep `Alt`+drag for moving windows, so the laser and pen also exist as
tools (`Y`, `N`), and the left panel's `⌘.` becomes Ctrl+`.`.

| | |
|---|---|
| `V` `H` `A` `L` | select · hand (pan) · arrow · line |
| `R` `O` `Z` | rectangle · ellipse · zone |
| `N` `Y` `X` | pen (ink stays) · laser (fades) · eraser (ink and shapes) |
| `T` `G` `⇧G` | text · heading · governance shape (the second meaning of a key is Shift) |
| `⌘Z` `⇧⌘Z` `⌫` | undo · redo · delete |
| `⌘C` `⌘V` `⌘D` | copy · paste · duplicate |
| shape bar | bring to front · send to back (also `⌘⇧]` `⌘⇧[`, which some browsers take for tabs) |
| `[` `]` `,` `.` `M` | text size · dot size · motion |
| `F` `W` `Esc` `?` | fit · focus one shape · deselect · quick reference |
| `⌘.` | hide or show the left panel |
| `⌥←` `⌥→` | previous · next page |
| `R` `R` (twice) | keep the tool armed: draw shape after shape; press again (or `Esc`) for one |
| `1`…`9` `0` | present mode · jump to a step, 0 = overview |

Drop a `.yaml` text file (or a `.json` document) anywhere on the canvas and it opens; images
land where you drop them. Double-click a shape (or press `Enter`) to name it, or double-click an
arrow to give it a note. Right-drag pans, `⌘` + wheel
zooms. **`W`** dims everything except the selected shape — a spotlight for explaining one part of
a crowded diagram, in the editor or during a presentation. **`Y`** arms the laser (or `⌥`-drag anywhere): a red stroke over the diagram that fades when you
let go. **`N`** is the pen — the same drawing, but the ink stays until `Esc`, survives selecting, panning
and editing, and is remembered across a page refresh (it lives beside the document, never inside
it, so exports and shared JSON stay clean). **`X`** is the
eraser: it wipes ink it passes over and deletes any shape you drag it across, undoably. On Windows
and Linux `Alt`+drag is often taken by the window manager, which is why the tools exist as keys. Selecting anything opens the style bar docked top-right — swatches plus what to paint
(**stroke**, **fill**, **title**, **note**), then stroke style, edges and width; arrows get the
swatch row alone. Drawing a shape no longer opens a text box: name it by double-clicking, and
press a tool key twice (`R R`) to draw a run of them. A tint is mixed toward white rather than laid
over the blue-grey paper at 10%, so brown reads as brown and black reads as grey. It stays out of the
way while you draw or edit text. Dragging a swatch
onto the canvas colours whatever it lands on. Palette buttons carry their letters on hover.
Resizing a zone moves its own frame only: children stay where they are.

![Present mode on the overview slide](docs/present.png)

## Saving and loading

The document autosaves to `localStorage` and restores on reload, zoom included. **FILE ▾** holds
**Open JSON…**, **Open text…**, **Import icon pack…**, every export and **Clear the document…**; undo restores anything
you clear. If `localStorage` is full or blocked the header shows **NOT SAVED**; if another tab
saves, autosave pauses and **OTHER TAB** appears. Loading is strict: unknown fields are dropped,
images must be inline `data:image` URIs within the storage cap, step members must reference
shapes that exist, documents over 8 MB or 5000 shapes are refused, and dropped images over
20 MB are refused.

### Your own icons

Brands that no free source publishes — Azure Data Factory, Delta Lake, Snowplow, Fivetran — can be
imported once and then searched like the rest.

**The short way: pick SVG files.** **FILE ▾ → Import icon pack…** accepts one or many `.svg` files
(plus `.json`); the file name becomes the icon name and its words become tags, so
`10128-icon-service-Azure-Synapse-Analytics.svg` turns into **Azure Synapse Analytics**, findable
by `synapse`. The vendor sets to download:

| Cloud | Where |
|---|---|
| AWS | <https://aws.amazon.com/architecture/icons/> — the "Icon package" zip |
| Azure | <https://learn.microsoft.com/en-us/azure/architecture/icons/> — one zip, SVGs under `Icons/<category>/` |
| Google Cloud | <https://cloud.google.com/icons> (brand guidance: <https://about.google/brand-resource-center/>) |
| Oracle | artwork is licensed on request from Oracle brand, not a public download |

None of these are open source: each grants *use in architecture diagrams*, which is what importing
does — the files land in your browser and your document, and the repository ships none of them. If
you would rather not download anything, the bundled role glyphs cover the same services (see the
**Icons** box: `s3`, `blob storage`, `data factory`, `redshift` all resolve).

**The long way: a JSON pack** —

```json
[
  { "name": "Azure Data Factory", "tags": "data factory,adf,integration",
    "svg": "<svg viewBox=\"0 0 24 24\">…</svg>" },
  { "name": "Unity Catalog", "tags": "unity,catalog,governance",
    "src": "data:image/svg+xml;base64,…" }
]
```

`svg` is the full file (or `d` for bare path markup); `src` takes an existing `data:image` URI.
Imported icons keep their own colours, are stored in `localStorage` under `yoruma.icons.v1`, and
survive reloads — up to 400 icons and about 1.4 MB. **FILE ▾ → Remove imported icons** clears the
whole set. An SVG that paints with `currentColor` is treated as monochrome and tints like the
bundled glyphs. Whoever imports a vendor's artwork is the one accepting its licence.

### The text format

**Open text…** takes the same diagram as a small declarative text format, YAML-shaped with no
positions required (worked files live at `docs/example-text.yaml`,
`docs/pipeline-from-d2.yaml`, a redraw of the D2 map example, `docs/example-theme.yaml`,
which leans on `theme: data` and per-arrow styling, `docs/example-aws-az.yaml`, the AWS region /
availability-zone / subnet layout as four levels of nested zones, and `docs/example-blocks.yaml`,
the whole Blocks palette written out as text — every chip is just a named card, so no palette
block is out of reach of the format):

```yaml
title: Mock data pipeline
subtitle: three sources, one grain, one dashboard
dir: right
zone Azure:
  card Gateway:
    sub: entry point
  card API
db Postgres:
  brand postgres
  tint: true

Gateway -> API
API -> Postgres: reads
```

Arrows take props too, indented under the arrow line (a `<->` styles both directions):

```yaml
API -> Postgres:
  color: "#4263EB"
  dash: true
  motion: dashes
```

`theme: data` paints shapes by role instead of by hand — stores green, queues orange, files
blue, services and dashboards indigo, agents purple, people, clouds and shields gray — and any
explicit `color:` still wins. Kinds are palette words (`card`, `db`, `queue`, `cloud`, `file`,
`api`, `zone`, and the rest of
the Blocks shapes by name), nesting is indentation, and arrows are `A -> B: note` (chain them
with `->`, use `--` for no arrowhead). `title:` and `subtitle:` at the top print a centred
header above the diagram; `dir: right` or `dir: down` at the top picks the flow
direction; zones stack their children top-to-bottom by default — archify-style stage lanes —
and hug their content, so a `dir: right` inside a zone lays that lane out as a horizontal strip
instead. Props read `key: value` (a missing colon is tolerated on the known
shape props, since models and humans both drop it). `color:` and `fill:` take `#RRGGBB`,
`icon:` takes a name from the bundled pack (`icon: kafka`) and falls back to a brand fetch when
the pack has no such glyph; `brand:` fetches the colour logo from svgl after import; arrows take
`color:`, `dash:` (static dashes)
and `motion:` (`off`, `dots`, `dashes`, `both`, `live`). End every shape and arrow line with a colon and the
file is also valid YAML — editors stay quiet and the file opens anywhere (the worked files do
this); the parser accepts the loose form too. A
deterministic packer places everything, so the text is a seed: load it, then move things by
hand, and an explicit `x:` / `y:` line is honoured as an absolute position. The packer ranks
shapes by their arrows, slides each one toward the shapes it connects to and centres the ranks,
so arrows come out short and straight and fan-outs stay symmetric. The format was
designed to be written by an LLM: names, kinds
and connections are what models get right, and layout stays with the editor.


## Export

`FILE ▾` exports SVG, PNG (2x, fonts inlined), WebP (2x, same canvas path) — each of those for
**the selection alone** too, cropped to what is selected — the JSON document,
copies the PNG straight to the clipboard, and Mermaid and D2 source, plus a
`kroki.io/…` link for the last two. **FLOW** cycles off, dots, dashes, dashes + dots and
*live* — a travelling comet down each arrow, archify-style.

**Only the SVG keeps motion.** Inside it, `dashes` become a CSS keyframe on the stroke, `live`
becomes a SMIL `stroke-dashoffset` animation, and `dots` become a circle with `animateMotion`
walking the arrow's own path — so a shared `.svg` animates in any browser. PNG and WebP are
stills (the frame at t=0), and GitHub or a PDF viewer renders the SVG statically too: the motion
is there, the viewer decides whether to play it. Mermaid and D2 skip steps and zones and strip
the characters that break their parsers.

## Performance

`render()` rebuilds the SVG, so the budget is one frame: a full render stays under **16 ms** for
a realistic diagram (0.7 ms at 50 shapes, 3 ms at 200, 9.3 ms at 400). `?test` enforces the
budget at the demo size and at 200 shapes; `just measure` reproduces the curve.

## Working on it

```
just deps      # once: verifier deps and Chromium
just check     # the in-page suite in headless Chromium, non-zero exit on red
just shots     # regenerate the README screenshots
just measure   # render cost at 50, 100, 200 and 400 shapes
just blocks    # regenerate docs/example-blocks.yaml from the Blocks catalog
just render docs/example-theme.yaml   # text file straight to PNG, no app, --watch to follow
just shot-d2   # screenshot docs/pipeline-from-d2.yaml
```

`ARCHITECTURE.md` has the load order, what each file owns and where a feature belongs;
`assets/` holds the ValdezData minimark used in the header, and
`.agents/skills/yoruma-text/SKILL.md` teaches the text format to a model.
No framework, no bundler, no runtime dependency: classic `<script>` tags in numbered order,
one shared scope, opened straight from disk.

## Limits

No snapping or grid, no groups, no multiplayer.

## Licence

MIT for the code — see [LICENSE](LICENSE). The two bundled fonts are SIL OFL 1.1, with their
licence files beside them in `fonts/`.