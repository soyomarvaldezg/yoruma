# Backlog

Open work, roughly in the order it earns attention. Finished work lives in the git history.

## Publishing

- [x] Create the GitHub repository and add it as `origin`.
- [ ] Delete `soyomarvaldezg/yoruma-old` and `soyomarvaldezg/yoruma-old-2`, the repositories
      left behind when a stuck Pages deployment forced a rename and a fresh start (needs the
      `delete_repo` scope, or the GitHub UI).
- [x] MIT licence in `LICENSE`; the fonts stay SIL OFL 1.1.
- [x] Publish on GitHub Pages from `main` at the repository root, with `.nojekyll` so `js/` is
      served as files.
- [x] Add a short "Use it" section to the README: the published URL, or clone and open `index.html`.
- [x] Screenshots for the README: the editor, a zoned diagram with a header band, present mode.
- [ ] Custom domain later: `CNAME` plus DNS at the registrar, then enable HTTPS in the Pages settings.
- [ ] Watch for test flakiness on a cold browser: one run of the published `?test` reported two
      failures that did not reproduce; the timing assertions are the likely suspects.

## Architecture and tooling

- [x] `ARCHITECTURE.md`: load order, one file per responsibility, the invariants and where a new
      feature belongs.
- [x] CI on push: the `Checks` workflow runs the headless suite with its own Chromium.
- [x] `cog.toml` plus an annotated `v0.0.0` baseline tag; `cog check --from-latest-tag` passes.
- [x] `just` recipes for the helpers already in `tools/`: `shots` and `measure`.

## Site and identity

- [x] GitHub mark in the header linking to the repository.
- [x] ValdezData minimark in the header, plus the `> o_o` prompt pet in the canvas corner.
- [x] First-visit tour — dropped by Omar: no walkthrough.

## Top bar

- [x] Reduce the header: INSERT, EXAMPLES and FILE menus plus FLOW, STEPS, PRESENT.

## Features still open

- [ ] No snapping and no grid: shapes land exactly where the pointer is. A grid or snapping needs an
      explicit opt-in, not a default.
- [ ] No lasso selection.
- [ ] No groups: only zones carry children.
- [ ] No multiplayer or sharing beyond JSON export and the Kroki links.
- [ ] Vendor logos on zones: the header band could take a logo, matching the AWS/Azure frame style.

## Accessibility

- [ ] Focus rings and ARIA labels for the palette, the floating bars and the step menu.
- [ ] Keyboard path through present mode is arrows only; there is no way to jump to a step by key.

## Considerations, not commitments

- Incremental rendering: only worth it past roughly 500 shapes (see the numbers in the README).
- PNG export at 2x for print.
