# Install the dev-only verifier: Node deps plus a Chromium for Playwright.
deps:
    cd tools && npm install
    cd tools && npx playwright install chromium

# Run the in-page suite headless; fails the shell on any red line.
check:
    node tools/verify.mjs
