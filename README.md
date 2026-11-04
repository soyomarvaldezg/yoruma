# yoruma — Data Architecture

A data-architecture diagram editor that runs as one static page: zones that nest, cards
that carry real brand logos, notes on arrows, and a present mode that walks the diagram one
step at a time.

**Use it:** <https://soyomarvaldezg.github.io/yoruma/> — or clone the repository and open
`index.html` locally. Nothing to install, no build step. A first visit starts on a blank
canvas; **DEMO** in the header loads the example document (or open `index.html?demo`).

![The editor with the demo document open](docs/editor.png)

Zones nest and take a header band, so a VPC, a region and a group read the way cloud diagrams
do, and moving the outer one carries everything inside it.

![Two zones with header bands](docs/zones.png)

Present walks the steps you define, gliding the camera and dimming everything else.

![Present mode on the overview slide](docs/present.png)

## The app

Single static HTML file. The app has no build, no framework and no runtime dependency;
the only npm in the repository is the dev-only headless test runner in `tools/`, which never
ships. ValdezData brand. Block names follow Omar's
[enterprise data architecture reference](https://github.com/soyomarvaldezg/enterprise-data-architecture-reference)
(CC BY 4.0).

```sh
open index.html             # the editor
open index.html?test        # 59 tests, report in the ? panel
just check                  # same suite, headless, fails the shell on red
just deps                   # one-time: verifier deps and Chromium
```

## Persistence

The document saves itself to `localStorage` on every change and restores on reload, zoom
included. `CLEAR` confirms, then empties it (and saves the empty state). `OPEN JSON` reads a
version 1 yoruma JSON file, validates it, and replaces the current document; undo restores
the previous nodes and arrows. Loading is strict: unknown node fields are dropped, images must be
inline `data:image` URIs within the storage cap, step numbers must be positive and step members
must point at shapes that exist in the same document. Documents over 8 MB or 5000 shapes are
refused, dropped images over 20 MB are refused, and a logo fetched by name is only ever used as
an `<image>` source, so an SVG can never run script in the page.

If `localStorage` is full or blocked, autosave warns and shows **NOT SAVED**; export JSON to
keep a copy. If the saved document cannot be read, **RECOVER** downloads a copy and the demo
loads. If another tab saves, autosave pauses and **OTHER TAB** appears; export JSON to keep
this tab's version, or reload to load the other one.

## Panels

One **Draw** palette, no sections: select, arrow, line, rectangle, ellipse, zone (dashed),
text, heading, database, queue, cloud, file, service/API, security, consumers, AI agent,
data contract, video, image data. Every shortcut is a letter.

**PRESENT** hides the header, the sidebar and the status bar and walks the diagram step by
step. A **step** is an ordered set of shapes, not a box: select what belongs together, open
**STEPS ▾** next to PRESENT and choose `+ STEP FROM SELECTION`. Steps are invisible on the
canvas — nothing is drawn around their shapes — and the menu moves them ↑/↓ or deletes them.
Selecting a zone for a step pulls in every shape fully inside that zone, so a zone step is never
an empty band, and adding the same set twice is refused with the number of the step that already
holds it — partial overlap between steps stays allowed.
The first slide is always the **overview** (the whole diagram, fitted), then each step glides
the camera to the bounds of its shapes and dims everything else; a badge shows
`2 / 5 · Ingestion`. `→`, `↓`, space or a click advances, `←`/`↑` goes back, `Esc` or **EXIT**
restores the chrome. With no steps defined, present falls back to walking the zones, ordered by
a number in their title (`01 / Sources`) or by position.

Zone titles render at 20px — they read as section headers, not captions.

**Arrow** draws a free arrow unless both ends land on shapes, in which case it becomes a
connected flow. **Line** is always free.

Images: `+ IMAGE` in the header, or paste from the clipboard, or drop a file on the canvas.
They are downscaled to at most 960 px on the long edge and stored inline (WebP where
available); small GIF and SVG files keep their original data. Dropping an image onto a
rectangle or ellipse attaches it as that card's logo instead.
**Blocks**: the reference building blocks in ten groups, mirroring the architecture
reference's planes and bands — Sources, Integration, Platform, Serving & Data Products,
Consumption, Metadata & Knowledge, Governance & Trust, Control Plane, Platform Engineering,
ML & AI. It lists the blocks the reference's nine worked flows actually draw, plus the few
those flows under-sample but a diagram still needs: network connectivity (VPN, peering,
secure connectors), search indexes, the business glossary and data observability. The
inventory's posture-only items stay in the reference. The filter box narrows the
chips, and every entry lands as a rectangle.

Palette source: `soyomarvaldezg/enterprise-data-architecture-reference` at commit `9a01467`
(2026-11-02). Re-check that repository's worked flows when the reference changes.

## Zones

`Z` draws a dashed container — a VPC, a layer band, "sources", "ingestion". It renders
behind everything, its label stays on top, and it sits in the layer stack like any shape:
select it by its border or label, resize it with the corner handles, and its children scale
with it — positions and sizes keep their proportions, so the layout inside survives.
Zones nest: an outer zone's members are everything inside it at any depth, including other
zones, so moving or resizing a VPC carries the region, the group and the shapes with it, and
copying or stepping a zone brings the whole subtree. Two buttons in the floating bar style a
zone: **header band** draws a tinted strip with the title in it, the way cloud frames label a
VPC or an account, and **solid border** swaps the dashes for a clean outline.

## Creating and naming

Drag to create. On release the editor opens with title and subtitle. Double-click any shape
to reopen it; double-click an **arrow** to give it a note. The note wraps to four lines and
sits above the path, clear of the teal bend handle, and double-clicking the note itself edits
it. Enter moves title → subtitle,
Enter again commits, Escape cancels. Long text wraps and ellipsizes.

## Editing

- click / marquee / Shift or **⌘ click** to add to the selection / ⌘A for all · ⌫ deletes
- **undo / redo**: `⌘Z` and `⇧⌘Z` (`Ctrl+Y` also redoes)
- **copy / paste / duplicate**: `⌘C`, `⌘V`, `⌘D`; copies selected shapes and the arrows
  between them, a selected zone brings its children, and pastes cascade by 24px
- **z-order**: `⇧⌘]` brings the selection forward, `⇧⌘[` sends it back; zones stay behind
  shapes
- **inspector**: sidebar X/Y/W/H for one shape
- **resize** — corner handles; shapes scale their text and icon with them. Icons are sized
  from the box (up to 170px), not from a fixed small ceiling
- **free movement** — dragging puts a shape exactly where the pointer is: no snapping, no guide
  lines, so nothing jumps while you move
- **zones carry their children** — moving a zone moves every shape fully inside it
- **draw an arrow like draw.io** — drag from the **border** of any shape (the outer 10px) and
  a line follows the cursor; drop it on another shape. Connection dots also appear on hover
  and on selection if you prefer grabbing one. The target highlights while you drag.
- **re-route** — drag an arrow endpoint onto a shape; it attaches to the point on the border
  nearest the cursor, not just the four midpoints
- **bend** — drag the teal middle handle to change the path while keeping A → B
- **arrow style** — select a connected arrow to get a floating bar for thin / medium / thick,
  dashes, end arrow, and start arrow; both heads make it bidirectional. Width and heads
  also style the animated flow and dots scale with width. In an animated mode, the dash
  button stops the flow and leaves a solid line (dots stay in dots+dashes mode); a start-only
  arrow runs its animation backwards so the flow follows the visible head
- **shape switch** — the floating bar morphs a selected shape into rectangle, ellipse, zone,
  database, queue, cloud or file
- **card logo** — drop an image on a rectangle or ellipse, or use **+ LOGO** in the header to
  open the brand picker: it lists svgl's whole catalogue with thumbnails and a filter box, and
  when a name is not in that catalogue it offers to fetch it from gilbarbara/logos, then
  simple-icons. The chosen mark is drawn 40px at the left of the title, stored in the document
  as an inlined data URI. The header's **+ LOGO** runs the same picker and drops the mark as a
  standalone shape (no card around it), resizable and movable like any other; to clear a card's
  logo, drop a different image on it or delete the card. Typing a name that svgl does not carry (dbt, snowflake) and pressing
  Enter runs the fallback chain; the twenty data-platform brands are always offered as tiles at
  the top of the picker
- **text size** — `[` and `]`, from 0.4× to 4×, for the selected shapes and for an
  arrow's note; the arrow note defaults to 18px
- **text alignment** — three buttons at the end of the floating shape bar (headings included,
  left/centre/right)
- **fit to screen** — `F`
- **bold / italic** — `⌘B` and `⌘I` (Ctrl on Windows and Linux)
- **?** opens the quick reference; the exhaustive list is this file

Arrows attach **anywhere along the border**: the anchor is the point closest to where you
drop, so two arrows can leave the same shape a few pixels apart. Several arrows from the same
point are allowed, and two shapes can be joined by as many arrows as you want — only an arrow
landing on the exact same two anchors is treated as a duplicate. Every endpoint leaves and enters **perpendicular to its edge**: the route goes
around the box and arrives from outside, so the arrowhead always points into the shape instead
of across it.

## Colour

The swatch row sits at the top of the sidebar and colours whatever you last clicked —
**border** → outline, **title** → title, **subtitle** → subtitle, **body** → tinted card: the
border takes the colour and the body a 10% tint of the same hue, which is how a coloured
reference card reads. Underneath, four icons (outline, T, t, tinted card) show which of those
is armed and let you override it by hand. Arrows always take the outline colour.
12 colours plus one custom swatch — picking a new custom colour
replaces it instead of adding another. Swatches can be **dragged onto a shape or an arrow**
to colour that one object, or clicked to colour the selection.

## Motion

`MOTION` cycles off → dots → dashes → dashes+dots. With an arrow selected it applies there
only; with nothing selected it applies everywhere and clears per-arrow overrides.

Key: `M` cycles. Dots breathe in and out as they travel. `,` and `.` change the dot size.

## Performance

`render()` rebuilds the whole SVG, so the budget is one frame: a full render must stay under
**16 ms** (60 fps). `?test` measures the demo document and a synthetic 200-shape document, and
fails if either median crosses the budget. Measured headless (`node tools/measure.mjs`):
50 shapes 0.7 ms, 100 shapes 1.3 ms, 200 shapes 3 ms, 400 shapes 9.3 ms — a realistic diagram
is far inside one frame, so an incremental renderer is not worth its complexity yet.

Two rules protect the budget: the dotted background and its pattern are created once and only
transformed on pan and zoom, and dragging or resizing renders in a lite mode that skips the
animated overlays and motion dots, restoring them on drop.

## Export

`EXPORT ▾` — SVG, PNG (fonts inlined), JSON document, Mermaid source, D2 source, and a ready
`kroki.io/…/svg/<deflate+base64>` link for Mermaid and D2. The SVG keeps motion: animated
arrows are exported as a CSS keyframe animation inside the file, so a downloaded SVG still
shows the flow moving. Mermaid and D2 source skip steps and zones, and strip the characters
that break their parsers (`"`, brackets, pipes, angle brackets), so a note containing an arrow
can no longer produce an unparseable diagram. Kroki is free and open source and
renders ~25 diagram languages; Mermaid and D2 are the two that map cleanly onto this model.

## Verified

`?test` runs a self test inside the real app, and `node tools/verify.mjs` runs it headless and
fails the shell on any red line. The suite covers drawing and naming, arrows (creation,
selection, re-pointing, styling, notes, bend handle, animation), zones (creation, click-through,
border selection, resizing that scales children), colour and tinting, card logos and the brand
picker, steps and present mode, undo, duplication, paste, z-order, the size inspector, the
Blocks filter, JSON export and import against the schema rules, document limits, persistence,
the render budget at both sizes, nested-zone membership and zone styling. 59 assertions, all green.

## Still open

No snapping or grid, no lasso, no groups, no multiplayer. The full list, including publishing
and tooling follow-ups, lives in [BACKLOG.md](BACKLOG.md).

## Licence

MIT for the code — see [LICENSE](LICENSE). The two bundled fonts are SIL OFL 1.1; their licence
files sit beside them in `fonts/`.
