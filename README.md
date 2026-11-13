# yoruma — data diagrams

<p>
  <img src="assets/yoruma_logo.png" alt="yoruma — data architecture diagrams" width="480">
</p>

yoruma draws data diagrams. It runs as one static page.
Nothing to install. There is no build step.

**Use it:** <https://soyomarvaldezg.github.io/yoruma/> — or open `index.html` from a clone.

The page starts on a blank canvas. Press **EXAMPLES ▾** to load a sample:
a BI stack, a streaming pipeline, or an ML platform.

![The editor with the modern BI example open](docs/editor.png)

**yoruma is beta.** It is a work in progress. Expect rough edges:
a gesture that behaves oddly, an export that misses a detail.
The test suite runs on every push. The document format is versioned.
Nothing here is a promise. Download a JSON copy of work you cannot lose.

## The screen

```
┌─────────────────────────────────────────────────────────────────┐
│ header          │IMAGE  FLOW  STEPS  PRESENT  EXAMPLES  FILE    │
├─────────────────┬───────────────────────────────────────────────┤
│ left panel      │ canvas                                        │
│  Draw           │  shapes, zones and arrows                     │
│  Icons          │                                               │
│  Blocks         │   ┌─ style bar ──────────┐                    │
│                 │   │ swatches · stroke    │                    │
│                 │   │ fill · edges · width │                    │
│                 │   └──────────────────────┘                    │
│                 │                                               │
│                 │  status line       −  100%  +  FIT            │
└─────────────────┴───────────────────────────────────────────────┘
```

The left panel holds the tools, the icons and the Blocks palette.
Press **⌘.** to hide the panel. Press **⌘.** again to show it.

The style bar appears when you select a shape. It stays top-right.

The minimap sits bottom-right when the page is bigger than the window: every shape
as a silhouette, the current view as a rectangle. Click or drag inside it to jump
there. It keeps itself out of the way on small diagrams; **⇧M**, or the map button
in the zoombar, shows or hides it in one press. ⌥-click that button to hand the
decision back to auto.

## What you can draw

- **Zones** hold other shapes. A zone carries every shape inside it, at any depth.
  Move a zone and its shapes move with it. Resize a zone and the shapes stay in place.
  A zone can show a header band. Set `solid` to remove its dashes.
- **Cards** are boxes with a title and an optional subtitle.
  A card takes its own stroke colour and its own fill.
  It can carry an icon or a brand logo.
- **Icon tiles** are filled squares in one hue with a white glyph and no outline.
  The hue is the explicit colour, or a stable colour the icon hashes to.
  `tint: true` washes the tile pale and paints the glyph in the outline colour.
  A tile can loop instead of showing a glyph. Select a tile and its own small
  loop strip appears in place of the shape bar, beside the tile; press a loop,
  and press it again to stop. The two chevrons at the end of the strip make the
  same loop run slower or faster (`<` and `>` on the keyboard), so one glyph can
  mean "right now" in one corner and "every few minutes" in another.
  Select a card and pick the tile in the style bar to morph it.
- **Arrows** attach anywhere on a border. They enter the border at a right angle.
  Bend an arrow by dragging the small circle on any straight run — it pulls out
  a corner. Drag a filled dot to move a corner; click a corner twice to remove
  it. Style it, animate it, or give it a note.
- **Pages** hold separate diagrams in one document.
  The page strip sits at the top-left of the canvas.
  Click a page to open it. Double-click to rename it. Click `×` to delete it.
  Each page keeps its own shapes, arrows and zoom.
- **Steps** are invisible frames. Select shapes and add a step.
  Then **PRESENT** walks from the overview through each step.
  Everything outside the current step dims.

![Nested zones: VPC, region and subnet, with header bands](docs/zones.png)

## Shape style

The style bar has four paint targets: **stroke**, **fill**, **title** and **note**.
Click a target. Then click a swatch. The swatch paints that target.
Drag a swatch onto a shape to paint it directly.

The rows below the swatches change the shape itself:

| Row | Values | What it does |
|---|---|---|
| Stroke | solid · dashed · dotted | Changes the outline pattern |
| Edges | round · sharp | Changes the corner radius |
| Fill | soft · solid | Soft is a pale wash. Solid is the colour at full strength |
| Width | S · M · L · XL | Changes the stroke width |

These rows apply to the selection. With nothing selected, they become the default
for the next shape you draw.

## Icons

The **Icons** box searches 167 monochrome glyphs. Click one to place it.
The glyph takes the outline colour of the card that carries it.

Chips above the grid scope it: **All**, **Plumbing**, **Status**, **Loops**,
**Pack**, plus **Imported** once a pack is loaded. The text box searches inside
the chosen chip, so `loops` and `status` never mix; typing a section name
("plumbing", "loops") switches to that chip and clears the box. With no chip and
no query the box groups itself by section.

- 11 loops make a tile run instead of carry a glyph: loading, progress, typing,
  uploading, heartbeat, stream, sync, waiting, retry, poll, throttle.
  Click one and it lands as a running tile; click one while a tile is selected
  and it drives that tile. Press the same loop again to stop it.
  A selected tile grows a loop strip of its own under it; the chevrons at the
  end set its tempo from 0.25x to 4x, or press `<` and `>`.
- 12 glyphs name an outcome, not a vendor: success, error, warning, info,
  question, blocked, retry, bug, alert, and the data-engineering ones: down,
  saturated, stale. A state placed with nothing selected lands as its own tile.
- 112 glyphs come from simple-icons, which is CC0.
- 32 glyphs are drawn for yoruma. They name a role, not a vendor:
  object storage, data lake, warehouse, managed database, NoSQL store,
  stream processor, event bus, message queue, ETL service, replication,
  catalog, notebook, compute cluster, serverless, function, workflow,
  pipeline, ML platform, generative AI, model serving, feature store,
  model registry, BI workspace, monitoring, table format, API gateway,
  edge delivery, network, load balancer, key vault, identity, lineage.

Each role glyph carries the vendor service names that fill that role.
So `s3`, `blob storage` and `cloud storage` all find the bucket.
`redshift`, `synapse` and `oracle atp` all find the warehouse.
This works offline. No vendor artwork is in this repository.

The same box finds **brand logos** in colour. yoruma fetches them from svgl
and gilbarbara when you click. It covers the AWS service set (`glue`,
`kinesis`, `lambda`, `athena`…), Azure, Google Cloud, Tableau and Power BI.
A logo keeps its own colours. yoruma stores the logo inside the document.

You can also drop an image on a card. Or press **IMAGE** in the header.

### Import your own icons

Some vendors publish no free artwork: Azure Data Factory, Delta Lake,
Fivetran, Snowplow. You can import their icons once.

**FILE ▾ → Icons → Import pack…** accepts one or more `.svg` files.
The file name becomes the icon name. The words in the name become tags.
For example, `10128-icon-service-Azure-Synapse-Analytics.svg` becomes
**Azure Synapse Analytics**, and `synapse` finds it.

| Cloud | Where to get the files |
|---|---|
| AWS | <https://aws.amazon.com/architecture/icons/> — the "Icon package" zip |
| Azure | <https://learn.microsoft.com/en-us/azure/architecture/icons/> — one zip, SVGs under `Icons/<category>/` |
| Google Cloud | <https://cloud.google.com/icons> |
| Oracle | Request artwork from the Oracle brand team |

These icons are not open source. Each vendor grants use in architecture diagrams.
Importing uses them that way. The files stay in your browser and in your document.

The import also accepts a JSON pack:

```json
[
  { "name": "Azure Data Factory", "tags": "data factory,adf,integration",
    "svg": "<svg viewBox=\"0 0 24 24\">…</svg>" },
  { "name": "Unity Catalog", "tags": "unity,catalog,governance",
    "src": "data:image/svg+xml;base64,…" }
]
```

`svg` holds the whole file. `d` holds bare path markup. `src` holds a `data:image` URI.
yoruma stores imported icons under `yoruma.icons.v1`. It keeps 400 icons, about 1.4 MB.
**FILE ▾ → Remove imported icons** deletes the whole set.
An SVG that uses `currentColor` tints like a bundled glyph.

## Keys

The table shows macOS names. On Windows and Linux, `⌘` is Ctrl, `⌥` is Alt
and `⇧` is Shift.

| Keys | Action |
|---|---|
| `V` `H` `A` `L` | Select · hand (pan) · arrow · line |
| `R` `O` `Z` | Rectangle · ellipse · zone |
| `T` `G` `⇧G` | Text · heading · governance shape |
| `N` `Y` `X` | Pen (ink stays) · laser (fades) · eraser (ink and shapes) |
| `S` `⇧S` | Open the steps panel · add a step from the selection |
| `⇧P` | Enter or leave present mode |
| `1`…`9` `0` | Present mode, jump to a step. `0` shows the overview |
| `[` `]` | Text size |
| `,` `.` | Dot size |
| `M` | Cycle the motion mode |
| `<` `>` | Slow down or speed up the selected tile's loop |
| `F` `W` `Esc` `?` | Fit · focus one shape · deselect · quick reference |
| `⇧M` | Show or hide the minimap (⌥-click its button for auto) |
| `⌘Z` `⇧⌘Z` `⌫` | Undo · redo · delete |
| `⌘C` `⌘V` `⌘D` | Copy · paste · duplicate |
| `⌘⇧]` `⌘⇧[` | Bring to front · send to back. Some browsers take this for tabs |
| `⌘.` | Hide or show the left panel |
| `⌥←` `⌥→` | Previous page · next page |
| `R` `R` | Press a tool key twice to keep the tool armed. `Esc` releases it |

Press a tool key twice to draw shape after shape. Press it again to draw one shape.

| Mouse | Action |
|---|---|
| Drag | Draw a shape, or move one |
| Double-click | Name a shape, or add a note to an arrow |
| `Enter` | Name the selected shape |
| Right-drag | Pan |
| `⌘` + wheel | Zoom |
| `⌥` drag | Laser pointer. Some window managers take Alt+drag, so use `Y` instead |

A new shape no longer opens a text box. Draw the shape, then name it.
With `W`, one shape stays bright and everything else dims.
The pen (`N`) keeps its ink. The ink survives a reload. Press `Esc` to clear it.

## Present

**STEPS ▾ → + STEP FROM SELECTION** turns the selected shapes into a step, or
press **S** to open that panel and **⇧S** to add a step straight from the
selection. **Clear all steps** at the bottom of the panel removes the steps and
keeps the shapes. Double-click a step's name in the panel to rename it; an
unnamed step follows its number, so reordering never leaves a stale label.
Press **PRESENT**.
Each step wears its number beside its box on the canvas; the numbers disappear
in present mode, where the arrows and number keys move between steps. A click
never advances, so it cannot skip a step while you point at the slide.
`⌥`-drag (or the armed laser tool) draws the laser; `Esc` leaves.

![Present mode on the overview slide](docs/present.png)

Present mode walks the page you are on. To present one diagram from a document
that holds many, put that diagram on its own page.

## Save and load

The document saves to `localStorage` on every change. A reload restores it, zoom included.

**FILE ▾** holds these commands:

- **Open**: JSON… and text…
- **Export**: SVG, PNG, WebP, PNG to the clipboard and the JSON document.
- **Selection**: SVG and PNG of just the selected shapes.
- **Text source**: Mermaid, D2 and their Kroki links.
- **Icons**: import a pack, or remove the imported ones.
- **Clear the document…** empties the current page. Undo restores it.

The header shows **NOT SAVED** when storage is full or blocked.
The header shows **OTHER TAB** when another tab saved. Autosave then pauses.

Loading is strict:

- yoruma drops unknown fields.
- Images must be inline `data:image` URIs within the storage cap.
- Step members must point to shapes that exist.
- yoruma refuses a document over 8 MB or over 5000 shapes.
- yoruma refuses a dropped image over 20 MB.

## Text format

**Open text…** loads a small declarative format. The format is YAML-shaped.
It needs no positions. Files are in `docs/`:

- `example-text.yaml` — a small pipeline.
- `pipeline-from-d2.yaml` — the D2 map example, redrawn.
- `example-theme.yaml` — `theme: data` and arrow styling.
- `example-aws-az.yaml` — a region, two availability zones and their subnets.
- `example-blocks.yaml` — the whole Blocks palette as text.
- `example-loops.yaml` — icon cards, two loop tiles and a `speed:` change.

```yaml
title: Mock data pipeline
subtitle: three sources, one grain, one dashboard
dir: right

zone Azure:
  card Gateway:
    sub: entry point
  card API

db Postgres:
  icon: postgres
  tint: true

Gateway -> API
API -> Postgres: reads
```

A shape takes these props:

| Prop | Value |
|---|---|
| `sub` | Subtitle text |
| `icon` | A bundled glyph, for example `icon: kafka` |
| `brand` | A colour logo, for example `brand: snowflake` |
| `stroke` | `solid`, `dashed` or `dotted` |
| `size` | `s`, `m`, `l` or `xl` |
| `sharp` | `true` for square corners |
| `fillmode` | `soft` or `solid` |
| `tint` `band` `solid` `dash` | `true` or `false` |
| `anim` | Tiles only: `loading`, `progress`, `typing`, `uploading`, `heartbeat`, `stream`, `sync`, `waiting`, `retry`, `poll`, `throttle` |
| `speed` | Tiles only: `0.25` to `4`, a multiplier on the loop's own tempo |
| `color` `fill` | `#RRGGBB` |
| `align` | `left`, `center` or `right` |
| `x` `y` `w` `h` | A fixed position or size. Avoid it unless you need it |

A zone takes `dir`, `color`, `fill`, `band`, `solid` and `dash`.
A `fill` tints the whole zone as one wash.
`dir` is the flow axis, not the row axis: children that point at each other
read left to right with `dir: right`. Children with no arrows between them
line up in a row with `dir: down`.

`tile Name` draws an icon tile. It takes an `icon:` like any other shape.
A `color:` wins; otherwise the icon keeps a hue of its own, and a state glyph
keeps the hue its meaning asks for.

An arrow takes these props, indented under the arrow line:

```yaml
API -> Postgres:
  color: "#4263EB"
  dash: true
  motion: dashes
  bend: 480 340
```

`motion` takes `off`, `dots`, `dashes`, `both` or `live`.
A `bend` line adds one corner; repeat the line for more, in the order they
appear along the arrow.
`A -> B` draws an arrow. `A -- B` draws a line. `A <-> B` draws both arrowheads.
Chain arrows with `->`. Only the last arrow in a chain takes a note.

`theme: data` colours shapes by role.
Stores are green, queues orange, files blue, services and dashboards indigo,
agents purple, people and clouds grey.
An explicit `color:` wins.

yoruma places every shape with a deterministic packer. The packer ranks shapes
by their arrows. It slides each shape toward its neighbours, then centres the ranks.
So arrows stay short and straight, and fan-outs stay symmetric.
An `x:` or `y:` line pins a shape to a fixed position.

End each line with a colon and the file is also valid YAML.
The parser also accepts lines without the colon.

## Export

**FILE ▾** exports these formats:

| Format | Notes |
|---|---|
| SVG | Vector. The only format that keeps motion |
| PNG | 2×, fonts inlined |
| WebP | 2×, same path as PNG |
| JSON | The document, for backup and sharing |
| Mermaid, D2 | Text source. Skips steps and zones |
| Kroki link | A link to the Mermaid or D2 source |
| Clipboard | Copies the PNG |

SVG and PNG also export **the selection alone**. That export crops to the selection.

**FLOW** cycles the motion: off, dots, dashes, dashes + dots, and live.
Live sends a travelling comet down each arrow.

**Only the SVG keeps motion.** Dashes become a CSS keyframe.
Live becomes a SMIL animation. Dots become a circle that walks the arrow path.
Tile loops are SMIL inside the tile, so they travel with the clone.
A shared `.svg` therefore animates in any browser.
PNG and WebP are stills. GitHub and PDF viewers show the SVG without motion.

## Performance

`render()` rebuilds the whole SVG. The budget is one frame.
A full render stays under 16 ms: 0.7 ms at 50 shapes, 3 ms at 200, 9.3 ms at 400.
`?test` checks the budget. `task measure` prints the curve.

## Working on it

```
task deps      # once: verifier deps and Chromium
task check     # the in-page suite in headless Chromium
task shots     # regenerate the README screenshots
task measure   # render cost at 50, 100, 200 and 400 shapes
task blocks    # regenerate docs/example-blocks.yaml
task icons     # regenerate the bundled icon pack from simple-icons
task shot-d2   # screenshot docs/pipeline-from-d2.yaml
task text-check             # validate every text example
task render -- FILE -o OUT   # render a text file to PNG or SVG
```

`ARCHITECTURE.md` explains the load order and what each file owns.
`.agents/skills/yoruma-text/SKILL.md` teaches the text format to a model.

The page uses classic `<script>` tags in numbered order. It has one shared scope.
There is no framework, no bundler and no runtime dependency.

## Command line

`tools/yoruma.mjs` renders and checks the text format from a terminal. It opens
the real page in a headless browser, so its output cannot disagree with the
editor. It needs `task deps` once (Node and a Chromium for Playwright); the page
itself still needs nothing.

```
node tools/yoruma.mjs render docs/example-loops.yaml -o loops.png
node tools/yoruma.mjs render docs/example-loops.yaml -o loops.svg --svg
node tools/yoruma.mjs render docs/example-loops.yaml -o loops.png --scale 3
node tools/yoruma.mjs check docs/*.yaml
node tools/yoruma.mjs icons --search postgres
```

It serves the page to the local browser on `127.0.0.1` for the length of one
command, so nothing leaves the machine.

`render` defaults to a 2x PNG beside the input; `-o -` streams to stdout.
`check` prints `line N: ...` and exits 1 on the first bad file. `icons` lists
what `icon:` accepts, with the same matching as the editor's icon box.

The render is offline on purpose: bundled icons are used, and a `brand:` or an
unbundled `icon:` is reported and left blank instead of fetched. Open the file
in the page when you want the logo. `task render`, `task text-check` and
`task icon-name` wrap the same three verbs.

## Limits

yoruma has no snapping and no grid. It has no groups; only zones hold shapes.
It has no multiplayer. Sharing means a JSON file or a Kroki link.

## Privacy

yoruma is one static page. There is no server, no account and no analytics,
so a diagram does not leave the browser on its own.

- Work is autosaved to `localStorage`, under `yoruma.*` keys: the document, the
  panel state, the pen strokes and any icon pack you imported. Clearing site
  data removes it. Nothing is uploaded.
- The only outbound requests happen when you ask for a brand or a vendor logo:
  the search and the SVG come from `api.svgl.app` and jsDelivr, and carry the
  logo name, never the diagram. The bundled icons and both fonts are local.
- A Kroki link is encoded on your machine. It reaches `kroki.io` only when
  someone opens the link, and it carries the diagram inside the URL itself.
- The published site is served by GitHub Pages, which sees what any web server
  sees: IP address, requested path and user agent.

If any of that changes, this section changes with it.

## Support

Bugs and feature requests go to [Issues](https://github.com/soyomarvaldezg/yoruma/issues).
Attach the JSON document that fails and say what you expected: that is the
fastest route to a fix. Report a vulnerability through GitHub's private
vulnerability reporting on the repository, not a public issue; if it is not
enabled, open an issue that says only that you have a security report.

yoruma is a beta maintained in spare time, with no service level agreement.
Download a JSON copy of anything you cannot afford to lose.

## Credits

The interaction and motion ideas owe a debt to
[Fluyo](https://github.com/itsnect/fluyo) (MIT), an animated diagram editor by
Claudio Jiménez Flores. No Fluyo source is copied here; where the two projects
overlap, the code is independent.

## Licence

MIT for the code — see [LICENSE](LICENSE).
The two bundled fonts use SIL OFL 1.1. Their licence files are in `fonts/`.
