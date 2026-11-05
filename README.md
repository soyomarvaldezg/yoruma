# yoruma — Data Architecture

A data-architecture diagram editor that runs as one static page. Zones that nest, cards with
real brand logos, notes on arrows, and a present mode that walks the diagram step by step.

**Use it:** <https://soyomarvaldezg.github.io/yoruma/> — or open `index.html` from a clone.
Nothing to install, no build step. It starts on a blank canvas; **EXAMPLES ▾** loads a modern
BI stack, a real-time streaming pipeline or an ML platform, built only from the Blocks.

![The editor with the modern BI example open](docs/editor.png)

## What it does

- **Zones** nest: an outer zone's members are everything inside it at any depth, so moving or
  resizing a VPC carries the region, the group and the shapes, and children keep their
  proportions. A zone can show a **header band** with its title and drop its dashes for a
  solid outline.
- **Cards** take a border and a 10% tint in one click, and can carry a **real brand logo**,
  fetched from svgl (gilbarbara and simple-icons as fallbacks) or dropped in as a file. Logos
  are stored inside the document and never recoloured.
- **Arrows** attach anywhere along a border, enter perpendicular to it, can be bent, styled,
  animated, and carry a note that wraps to four lines.
- **Steps** are invisible frames: select shapes, add a step, and **PRESENT** glides from the
  overview through each step, dimming everything else. Arrows or clicks advance, `Esc` exits.
- **Blocks**: the reference capabilities in ten groups, mirroring Omar's
  [enterprise data architecture reference](https://github.com/soyomarvaldezg/enterprise-data-architecture-reference)
  (CC BY 4.0), narrowed to what its nine worked flows actually draw.

![Nested zones: VPC, region and subnet, with header bands](docs/zones.png)

## Keys

| | |
|---|---|
| `V` `A` `L` | select · arrow · line |
| `R` `O` `Z` | rectangle · ellipse · zone |
| `T` `H` | text · heading |
| `⌘Z` `⇧⌘Z` `⌫` | undo · redo · delete |
| `⌘C` `⌘V` `⌘D` | copy · paste · duplicate |
| `[` `]` `,` `.` `M` | text size · dot size · motion |
| `F` `Esc` `?` | fit · deselect · quick reference |

Double-click a shape to name it, or an arrow to give it a note. Right-drag pans, `⌘` + wheel
zooms, dragging a swatch colours the object under it. Palette buttons carry their letters on
hover.

![Present mode on the overview slide](docs/present.png)

## Saving and loading

The document autosaves to `localStorage` and restores on reload, zoom included. **FILE ▾** holds
**Open JSON…**, every export and **Clear the document…**; undo restores anything you clear. If
`localStorage` is full or blocked the header shows **NOT SAVED**; if another tab saves, autosave
pauses and **OTHER TAB** appears. Loading is strict: unknown fields are dropped, images must be
inline `data:image` URIs within the storage cap, step members must reference shapes that exist,
documents over 8 MB or 5000 shapes are refused, and dropped images over 20 MB are refused.

## Export

`FILE ▾` exports SVG, PNG (fonts inlined), the JSON document, Mermaid and D2 source, and a
`kroki.io/…` link for the last two. The SVG keeps motion: animated arrows become a CSS keyframe
animation inside the file. Mermaid and D2 skip steps and zones and strip the characters that
break their parsers.

## Performance

`render()` rebuilds the SVG, so the budget is one frame: a full render stays under **16 ms** for
a realistic diagram (0.7 ms at 50 shapes, 3 ms at 200, 9.3 ms at 400). `?test` enforces the
budget at the demo size and at 200 shapes; `just measure` reproduces the curve.

## Working on it

```
just deps      # once: verifier deps and Chromium
just check     # 60 assertions in headless Chromium, non-zero exit on red
just shots     # regenerate the README screenshots
```

`ARCHITECTURE.md` has the load order, what each file owns and where a feature belongs;
`BACKLOG.md` has what is open. `assets/` holds the ValdezData minimark used in the header.
No framework, no bundler, no runtime dependency: classic `<script>` tags in numbered order,
one shared scope, opened straight from disk.

## Limits

No snapping or grid, no lasso, no groups, no multiplayer.

## Licence

MIT for the code — see [LICENSE](LICENSE). The two bundled fonts are SIL OFL 1.1, with their
licence files beside them in `fonts/`.