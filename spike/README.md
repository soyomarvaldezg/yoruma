# yoruma — Data Architecture

Single static HTML file. No build, no npm, no framework. ValdezData brand.
Capability names follow Omar's [enterprise data architecture reference](https://github.com/soyomarvaldezg/enterprise-data-architecture-reference)
(CC BY 4.0).

```sh
open spike/index.html        # the editor
open spike/index.html?test   # 38 tests, report in the ? panel
```

## Persistence

The document saves itself to `localStorage` on every change and restores on reload, zoom
included. `CLEAR` confirms, then empties it (and saves the empty state). `OPEN JSON` reads a
version 1 yoruma JSON file, validates it, and replaces the current document; undo restores
the previous nodes and arrows.

If `localStorage` is full or blocked, autosave warns and shows **NOT SAVED**; export JSON to
keep a copy. If the saved document cannot be read, **RECOVER** downloads a copy and the demo
loads. If another tab saves, autosave pauses and **OTHER TAB** appears; export JSON to keep
this tab's version, or reload to load the other one.

## Panels

One **Draw** palette, no sections: select, arrow, line, rectangle, ellipse, zone (dashed),
text, heading, database, queue, cloud, file, service/API, security, consumers, AI agent,
data contract, video, image data. Every shortcut is a letter.

**Arrow** draws a free arrow unless both ends land on shapes, in which case it becomes a
connected flow. **Line** is always free.

Images: `+ IMAGE` in the header, or paste from the clipboard, or drop a file on the canvas.
They are downscaled to at most 960 px on the long edge and stored inline (WebP where
available); small GIF and SVG files keep their original data.
**Catalog**: the reference capabilities in ten groups, mirroring the architecture
reference's planes and bands — Sources, Integration, Platform, Serving & Data Products,
Consumption, Metadata & Knowledge, Governance & Trust, Control Plane, Platform Engineering,
ML & AI. The filter box narrows the chips, and every entry lands as a rectangle.

## Zones

`Z` draws a dashed container — a VPC, a layer band, "sources", "ingestion". It renders
behind everything, its label stays on top, and it sits in the layer stack like any shape:
select it by its border or label, resize it with the corner handles, and its children scale
with it — positions and sizes keep their proportions, so the layout inside survives.

## Creating and naming

Drag to create. On release the editor opens with title and subtitle. Double-click any shape
to reopen it; double-click an **arrow** to give it a label. Enter moves title → subtitle,
Enter again commits, Escape cancels. Long text wraps and ellipsizes.

## Editing

- click / marquee / Shift or **⌘ click** to add to the selection / ⌘A for all · ⌫ deletes
- **undo / redo**: `⌘Z` and `⇧⌘Z` (`⌘Y` on Windows and Linux)
- **copy / paste / duplicate**: `⌘C`, `⌘V`, `⌘D`; copies selected shapes and the arrows
  between them, a selected zone brings its children, and pastes cascade by 24px
- **z-order**: `⇧⌘]` brings the selection forward, `⇧⌘[` sends it back; zones stay behind
  shapes
- **inspector**: sidebar X/Y/W/H for one shape; with two or more non-zone shapes, six align
  buttons (left/centre/right/top/middle/bottom)
- **resize** — corner handles; shapes scale their text and icon with them. Icons are sized
  from the box (up to 170px), not from a fixed small ceiling
- **snap** — dragging shows alignment guides against other shapes' edges and centres, and
  snaps within 6px
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
- **shape switch** — the floating bar above a selected shape morphs it
- **text size** — `[` and `]`, from 0.4× to 4×; the status line shows the multiplier
- **text alignment** — three buttons at the end of the floating shape bar (headings included,
  left/centre/right)
- **fit to screen** — `F`
- **bold / italic** — `⌘B` and `⌘I` (Ctrl on Windows and Linux)
- **?** opens the full command list

Arrows attach **anywhere along the border**: the anchor is the point closest to where you
drop, so two arrows can leave the same shape a few pixels apart. Several arrows from the same
point are allowed, and two shapes can be joined by as many arrows as you want — only an arrow
landing on the exact same two anchors is treated as a duplicate. Every endpoint leaves and enters **perpendicular to its edge**: the route goes
around the box and arrives from outside, so the arrowhead always points into the shape instead
of across it.

## Colour

The swatch row sits at the top of the sidebar and colours whatever you last clicked —
**border** → outline, **title** → title, **subtitle** → subtitle, **body** → fill. Underneath,
four icons (outline, T, t, filled square) show which of those is armed and let you override it
by hand. Arrows always take the outline colour.
12 colours plus one custom swatch — picking a new custom colour
replaces it instead of adding another. Swatches can be **dragged onto a shape or an arrow**
to colour that one object, or clicked to colour the selection.

## Motion

`MOTION` cycles off → dots → dashes → dashes+dots. With an arrow selected it applies there
only; with nothing selected it applies everywhere and clears per-arrow overrides.

Key: `M` cycles. Dots breathe in and out as they travel. `,` and `.` change the dot size.

## Export

`EXPORT ▾` — SVG, PNG (fonts inlined), JSON document, Mermaid source, D2 source, and a ready
`kroki.io/…/svg/<deflate+base64>` link for Mermaid and D2. Kroki is free and open source and
renders ~25 diagram languages; Mermaid and D2 are the two that map cleanly onto this model.

## Verified

`?test` runs a headless-style self test against the real app: create by drag, arrow between
shapes, select an arrow, re-point it, style it, check the animated flow and reverse flow,
create an edge from a paddle with its side, resize,
drag a swatch onto a shape, dots render, free line shape, fill a shape, drag moves a shape,
zone creation, zone click-through, zone border selection, zone resize scaling its children,
heading colour, subtitle colour, undo,
redo, duplicate, paste, z-order, size inspector, align, catalog filter, JSON export/import,
and persistence. 38/38 green.

## Still open

Resizing a zone scales its children. Still open: no grid snap (only shape-to-shape), no
lasso, no groups/frames, no multiplayer.
