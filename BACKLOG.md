# Backlog

Open work, roughly in the order it earns attention. Finished work lives in the git history.

## Publishing

- [x] Create the GitHub repository and add it as `origin`.
- [ ] Delete `soyomarvaldezg/yoruma-old`, the repository left behind when the stuck Pages
      deployment forced a rename and a fresh start (needs the `delete_repo` scope).
- [ ] Decide the code licence and add `LICENSE`. The reference architecture the block list follows is
      CC BY 4.0; the fonts in `fonts/` are already SIL OFL 1.1. MIT for the code is the simplest fit.
- [ ] Publish on GitHub Pages: serve the repository root, add a `.nojekyll` file so `js/` and `css/`
      are not filtered, and confirm `index.html?test` runs from the published URL.
- [x] Add a short "Use it" section to the README: the published URL, or clone and open `index.html`.
- [x] Screenshots for the README: the editor, a zoned diagram with a header band, present mode.
- [ ] Custom domain later: `CNAME` plus DNS at the registrar, then enable HTTPS in the Pages settings.
- [ ] Watch for test flakiness on a cold browser: one run of the published `?test` reported two
      failures that did not reproduce; the timing assertions are the likely suspects.

## Architecture and tooling

- [ ] `ARCHITECTURE.md`: load order, one line per file in `js/`, the invariants (one global scope, no
      modules, no build, `just check` as the gate), and where a new feature belongs.
- [ ] CI on push: `just deps && just check`, pinned to a Chromium download. Blocked until the remote exists.
- [ ] `cog.toml` plus an annotated `v0.0.0` baseline tag, so `cog check` and versioning start clean.
- [ ] `just measure` recipe for the render scaling probe.

## Site and identity

- [ ] GitHub mark in the header linking to the repository.
- [ ] Omar's logo in the header, in place of, or beside, the `yoruma` wordmark.
- [ ] First-visit tour: an optional walkthrough over the real UI (draw a shape, colour a card,
      add a step, present) with the option to skip and never see it again.

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
