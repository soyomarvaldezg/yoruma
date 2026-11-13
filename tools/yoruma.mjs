#!/usr/bin/env node
/*
 * yoruma CLI: render and check the text format without leaving the terminal.
 * It drives the real page in a headless browser, so a render cannot disagree
 * with what the editor shows. Requires tools/deps (`task deps`).
 */
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const TEXT_EXT = /\.(yaml|yml|txt|text)$/i;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.ttf': 'font/ttf',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
  '.md': 'text/plain; charset=utf-8',
  '.yaml': 'text/plain; charset=utf-8',
  '.yml': 'text/plain; charset=utf-8'
};

/* The page fetches its fonts to embed them in the export, and browsers do not
   allow that over file://. Serve the repo on an ephemeral port instead, so a
   CLI render matches the app byte for byte. */
function serveRoot(){
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      const rel = decodeURIComponent(url.pathname === '/' ? '/index.html'
        : url.pathname);
      const file = path.join(root, rel);
      if (!file.startsWith(root + path.sep)) throw new Error('outside');
      const body = await fs.readFile(file);
      res.writeHead(200, {
        'content-type': MIME[path.extname(file)] || 'application/octet-stream'
      });
      res.end(body);
    } catch (e){
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('not found');
    }
  });
  return new Promise(resolve => {
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

const USAGE = `yoruma: render and check text diagrams

  yoruma render FILE [-o OUT] [--svg] [--scale N]
      Lay out the text file and write a picture.
      Default: FILE with .png beside it, at 2x. --svg writes vector.
      -o - streams the file to stdout.

  yoruma check FILE...
      Parse and lay out every file. Prints "line N: ..." and exits 1
      if any of them is invalid.

  yoruma icons [QUERY] [--all]
      List the icon names the text format accepts, with their tags.
      A query filters the same way the editor's icon box does.

Options
  -h, --help     this text
  --scale N      0.5 to 4, PNG only (default 2)
  --svg          write SVG instead of PNG
  -o, --out P    output path, or - for stdout

The render uses the bundled icons. It does not fetch network logos:
a "brand:" or an unbundled "icon:" is reported and left blank.`;

function fail(msg, code = 1){
  console.error('yoruma: ' + msg);
  process.exitCode = code;
}

/* Playwright hands back the page's stack; the first line is the one a person
   needs, and it already reads `line N: ...`. */
function cleanError(e){
  return String((e && e.message) || e).split('\n')[0]
    .replace(/^page\.evaluate: /, '')
    .replace(/^Error: /, '');
}

process.stdout.on('error', e => {
  if (e.code === 'EPIPE') process.exit(0);
  throw e;
});

function parseArgs(argv){
  const out = { files: [], flags: {} };
  for (let i = 0; i < argv.length; i++){
    const a = argv[i];
    if (a === '-h' || a === '--help') out.flags.help = true;
    else if (a === '--svg') out.flags.svg = true;
    else if (a === '--all') out.flags.all = true;
    else if (a === '--scale' || a === '--out' || a === '-o' || a === '--search'){
      const key = a === '--scale' ? 'scale' : a === '--search' ? 'search' : 'out';
      const v = argv[++i];
      if (v == null) throw new Error(a + ' needs a value');
      out.flags[key] = v;
    }
    else if (a.startsWith('--')) throw new Error('unknown option ' + a);
    else out.files.push(a);
  }
  return out;
}

async function openPage(){
  const server = await serveRoot();
  const port = server.address().port;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const noise = [];
  page.on('pageerror', e => noise.push('page error: ' + e.message));
  page.on('console', m => {
    if (m.type() === 'error') noise.push('console: ' + m.text());
  });
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof buildSVG === 'function', null,
    { timeout: 20000 });
  const close = async () => {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  };
  return { page, noise, close };
}

/* The text path in the app also resolves `icon:` after layout. The CLI does
   the bundled half of that synchronously and reports what it cannot resolve
   offline, so a render never depends on the network. */
async function loadText(page, text, name){
  return page.evaluate(({ text, name }) => {
    const model = parseText(text);
    const doc = buildTextDoc(model);
    if (!importText(JSON.stringify(doc), name, 'text', true))
      throw new Error('the page refused the document');
    const missing = [];
    for (const s of model.shapes){
      if (!s.props.icon) continue;
      const n = byId(s.id);
      if (!n) continue;
      const local = iconByName(s.props.icon);
      if (local){
        n.logo = iconDataUri(local);
        n.mono = true;
      } else missing.push('icon "' + s.props.icon + '" is not bundled');
    }
    for (const s of model.shapes){
      if (s.props.brand)
        missing.push('brand "' + s.props.brand + '" needs a network fetch');
    }
    render();
    return {
      nodes: model.shapes.length,
      links: model.links.length,
      warnings: Array.from(new Set(missing))
    };
  }, { text, name });
}

async function toPng(page, scale){
  return page.evaluate(async (scale) => {
    const svg = await buildSVG();
    if (!svg) throw new Error('nothing to render');
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error('could not rasterize the diagram'));
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    return { dataUrl: canvas.toDataURL('image/png'),
      width: canvas.width, height: canvas.height };
  }, scale);
}

function scaleFrom(flags){
  const raw = flags.scale == null ? 2 : Number(flags.scale);
  if (!Number.isFinite(raw) || raw < 0.5 || raw > 4)
    throw new Error('--scale takes a number from 0.5 to 4');
  return raw;
}

async function cmdRender(args){
  const input = args.files[0];
  if (!input) throw new Error('render needs a file');
  if (!TEXT_EXT.test(input))
    throw new Error('render takes a text file (.yaml, .yml, .txt)');
  const source = await fs.readFile(input, 'utf8');
  const asked = String(args.flags.out || '').toLowerCase().endsWith('.svg');
  const svg = args.flags.svg || asked;
  const scale = scaleFrom(args.flags);
  const out = args.flags.out ||
    input.replace(TEXT_EXT, svg ? '.svg' : '.png');

  const { page, noise, close } = await openPage();
  try {
    const info = await loadText(page, source, path.basename(input));
    let payload, dims = '';
    if (svg){
      const text = await page.evaluate(() => buildSVG());
      if (!text) throw new Error('nothing to render');
      payload = Buffer.from(text, 'utf8');
    } else {
      const png = await toPng(page, scale);
      if (!png || !png.dataUrl) throw new Error('nothing to render');
      payload = Buffer.from(png.dataUrl.split(',')[1], 'base64');
      dims = ` ${png.width}x${png.height}`;
    }
    if (out === '-') process.stdout.write(payload);
    else {
      await fs.writeFile(out, payload);
      console.log(`${out}${dims} (${info.nodes} shapes, ${info.links} arrows)`);
    }
    for (const w of info.warnings) console.warn('warning: ' + w);
    for (const n of noise) console.warn(n);
  } finally {
    await close();
  }
}

async function cmdCheck(args){
  if (!args.files.length) throw new Error('check needs at least one file');
  const { page, noise, close } = await openPage();
  let bad = 0;
  let warned = 0;
  try {
    for (const file of args.files){
      let source;
      try {
        source = await fs.readFile(file, 'utf8');
      } catch (e){
        console.log(`FAIL ${file}: cannot read it`);
        bad++;
        continue;
      }
      try {
        const info = await page.evaluate(({ text, name }) => {
          const model = parseText(text);
          const doc = buildTextDoc(model);
          const warnings = [];
          for (const s of model.shapes){
            if (s.props.icon && !iconByName(s.props.icon))
              warnings.push('icon "' + s.props.icon + '" is not bundled');
            if (s.props.brand)
              warnings.push('brand "' + s.props.brand + '" needs a network fetch');
          }
          return { nodes: model.shapes.length, links: model.links.length,
            warnings: Array.from(new Set(warnings)) };
        }, { text: source, name: path.basename(file) });
        console.log(`ok ${file} (${info.nodes} shapes, ${info.links} arrows)`);
        for (const w of info.warnings){ console.log('  warning: ' + w); warned++; }
      } catch (e){
        console.log(`FAIL ${file}: ${cleanError(e)}`);
        bad++;
      }
    }
    for (const n of noise) console.warn(n);
    if (bad) process.exitCode = 1;
    console.log(`${args.files.length - bad} ok, ${bad} failed` +
      (warned ? `, ${warned} warnings` : ''));
  } finally {
    await close();
  }
}

async function cmdIcons(args){
  const query = args.flags.search != null ? args.flags.search : args.files.join(' ');
  const { page, close } = await openPage();
  try {
    const info = await page.evaluate((q) => {
      const list = q ? iconSearch(q) : LOCAL_ICONS;
      const states = new Set(STATES);
      const loops = new Set(LOOPS);
      return {
        list: list.map(e => ({ name: e.n, tags: e.t || '',
          loop: loops.has(e), state: states.has(e) })),
        anims: ANIMS.slice(),
        total: LOCAL_ICONS.length
      };
    }, query);
    if (!info.list.length){
      console.log(`no icon matches "${query}"`);
      process.exitCode = 1;
      return;
    }
    if (query) console.log(`icons matching "${query}" (${info.list.length})`);
    else console.log(`icon names the text format accepts (${info.total})`);
    for (const e of info.list){
      const kind = e.loop ? ' [loop]' : e.state ? ' [state]' : '';
      console.log(`  ${e.name}${kind}${e.tags ? '  (' + e.tags + ')' : ''}`);
    }
    if (!query || args.flags.all){
      console.log(`anim values for a tile: ${info.anims.join(', ')}`);
    }
  } finally {
    await close();
  }
}

const COMMANDS = { render: cmdRender, check: cmdCheck, icons: cmdIcons };

try {
  const argv = process.argv.slice(2);
  const command = argv[0];
  if (!command || command === '-h' || command === '--help'){
    console.log(USAGE);
    process.exitCode = command ? 0 : 2;
  } else if (!COMMANDS[command]){
    fail(`unknown command "${command}"\n\n${USAGE}`, 2);
  } else {
    const args = parseArgs(argv.slice(1));
    if (args.flags.help) console.log(USAGE);
    else await COMMANDS[command](args);
  }
} catch (e){
  fail(cleanError(e));
}
