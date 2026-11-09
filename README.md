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
- **Cards** take an outline colour and a tint of their own colour, independently, and can carry
  a **real brand logo**,
  fetched from svgl (gilbarbara and simple-icons as fallbacks) or dropped in as a file. Logos
  are stored inside the document and never recoloured.
- **Arrows** attach anywhere along a border, enter perpendicular to it, can be bent, styled,
  animated, and carry a note that wraps to four lines.
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

| | |
|---|---|
| `V` `H` `A` `L` | select · hand (pan) · arrow · line |
| `R` `O` `Z` | rectangle · ellipse · zone |
| `T` `G` | text · heading |
| `⌘Z` `⇧⌘Z` `⌫` | undo · redo · delete |
| `⌘C` `⌘V` `⌘D` | copy · paste · duplicate |
| `[` `]` `,` `.` `M` | text size · dot size · motion |
| `F` `Esc` `?` | fit · deselect · quick reference |

Drop a `.yaml` text file (or a `.json` document) anywhere on the canvas and it opens; images
land where you drop them. Double-click a shape to name it, or an arrow to give it a note. Right-drag pans, `⌘` + wheel
zooms. Selecting anything opens the style bar docked top-right — swatches plus what to paint
(outline, title, subtitle, tinted card); arrows get the swatch row alone. It stays out of the
way while you draw or edit text. Dragging a swatch
onto the canvas colours whatever it lands on. Palette buttons carry their letters on hover.
Resizing a zone moves its own frame only: children stay where they are.

![Present mode on the overview slide](docs/present.png)

## Saving and loading

The document autosaves to `localStorage` and restores on reload, zoom included. **FILE ▾** holds
**Open JSON…**, **Open text…**, every export and **Clear the document…**; undo restores anything
you clear. If `localStorage` is full or blocked the header shows **NOT SAVED**; if another tab
saves, autosave pauses and **OTHER TAB** appears. Loading is strict: unknown fields are dropped,
images must be inline `data:image` URIs within the storage cap, step members must reference
shapes that exist, documents over 8 MB or 5000 shapes are refused, and dropped images over
20 MB are refused.

### The text format

**Open text…** takes the same diagram as a small declarative text format, YAML-shaped with no
positions required (worked files live at `docs/example-text.yaml`,
`docs/pipeline-from-d2.yaml`, a redraw of the D2 map example, `docs/example-theme.yaml`,
which leans on `theme: data` and per-arrow styling, and `docs/example-blocks.yaml`, the whole
Blocks palette written out as text — every chip is just a named card, so no palette block is
out of reach of the format):

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
`brand:` fetches the logo from svgl after import; arrows take `color:`, `dash:` (static dashes)
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

`FILE ▾` exports SVG, PNG (2x, fonts inlined), WebP (2x, same canvas path), the JSON document,
copies the PNG straight to the clipboard, and Mermaid and D2 source, plus a
`kroki.io/…` link for the last two. **FLOW** cycles off, dots, dashes, dashes + dots and
*live* — a travelling comet down each arrow, archify-style. The SVG keeps motion: animated
arrows become a CSS keyframe
animation inside the file. Mermaid and D2 skip steps and zones and strip the characters that
break their parsers.

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