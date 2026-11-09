# Install the dev-only verifier: Node deps plus a Chromium for Playwright.
deps:
    cd tools && npm install
    cd tools && npx playwright install chromium

# Run the in-page suite headless; fails the shell on any red line.
check:
    node tools/verify.mjs

# Regenerate the README screenshots into docs/.
shots:
    node tools/shots.mjs

# Measure full-render cost at 50, 100, 200 and 400 shapes.
measure:
    node tools/measure.mjs

# Regenerate the Blocks palette as text (docs/example-blocks.yaml) from the catalog.
blocks:
    node tools/blocks-text.mjs

# Screenshot docs/pipeline-from-d2.yaml into docs/pipeline-from-d2.png.
shot-d2:
    node tools/shot-d2.mjs

