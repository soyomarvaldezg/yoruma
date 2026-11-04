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
    node tools/shots-examples.mjs

# Measure full-render cost at 50, 100, 200 and 400 shapes.
measure:
    node tools/measure.mjs
