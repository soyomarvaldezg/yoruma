/* ---------- shapes ---------- */
const CLOUD_D = 'M20 45 C7 45 0 37 0 27 C0 18 7 10 16 9 C20 2 28 -2 36 -2 '
              + 'C46 -2 54 5 56 14 C64 15 70 21 70 29 C70 38 63 45 54 45 Z';
const GLYPHS = ['people','api','dashboard','cube','shield','agent','contract','video','media'];
const LOGO_KINDS = new Set(['box','ellipse','tile']);


function shape(n){
  const { x, y, w, h } = n;
  const stroke = accentOf(n) || LINE;
  const tintHex = fillOf(n) || accentOf(n);
  const fillC = n.tint && tintHex
    ? (n.fillmode === 'solid' ? tintHex : pastel(tintHex))
    : (fillOf(n) || CARD);
  const g = mk('g');
  const style = n.stroke || (n.dash ? 'dashed' : 'solid');
  const dashed = style === 'dashed' ? { 'stroke-dasharray':'6 5' }
    : style === 'dotted' ? { 'stroke-dasharray':'2 3' } : {};
  const swid = n.sw || 1.2;
  const rx = n.sharp ? 0 : Math.min(12, Math.max(4, Math.min(w, h)/4));
  const rect = () => g.appendChild(mk('rect', {
    x, y, width:w, height:h, rx, fill:fillC, stroke, 'stroke-width':swid, ...dashed
  }));

  switch (n.kind){
    case 'image':
      if (n.src){
        g.appendChild(mk('image', { x, y, width:w, height:h, href:n.src,
          preserveAspectRatio:'xMidYMid meet' }));
      } else {
        g.appendChild(mk('rect', { x, y, width:w, height:h, rx:3, fill:fillC,
          stroke, 'stroke-width':1.2, 'stroke-dasharray':'4 3' }));
      }
      break;
    case 'line':
    case 'arrow': {
      const x1 = x, y1 = n.flip ? y+h : y;
      const x2 = x+w, y2 = n.flip ? y : y+h;
      const head = n.kind === 'arrow' ? `url(#ar${stroke.replace('#','')})` : 'none';
      g.appendChild(mk('line', { x1, y1, x2, y2, stroke, 'stroke-width':1.7,
        'stroke-linecap':'round',
        'marker-end': n.rev ? 'none' : head,
        'marker-start': n.rev ? head : 'none' }));
      g.appendChild(mk('line', { x1, y1, x2, y2, stroke:'transparent',
        'stroke-width':16, 'pointer-events':'stroke' }));
      break;
    }
    case 'zone': {
      g.appendChild(mk('rect', {
        x, y, width:w, height:h, rx:8,
        fill: fillOf(n)
          ? (n.fillmode === 'solid' ? fillOf(n) : pastel(fillOf(n)))
          : 'rgba(255,255,255,.30)',
        stroke: accentOf(n) || LINE,
        'stroke-width':n.sw || 1.4,
        ...(n.solid ? {} : { 'stroke-dasharray':'7 6' }),
        'pointer-events':'none'
      }));
      if (n.band && (n.title || n.logo)){
        const accent = accentOf(n) || LINE;
        g.appendChild(mk('path', {
          d:`M${x} ${y+34} V${y+8} a8 8 0 0 1 8 -8 H${x+w-8} a8 8 0 0 1 8 8 V${y+34} Z`,
          fill: hexA(accent, .16), stroke:'none', 'pointer-events':'none',
          'data-role':'zone-band'
        }));
      }
      if (n.logo){
        const ls = 18;
        g.appendChild(mk('image', { x:x+10, y:y+8, width:ls, height:ls,
          href:n.logo, preserveAspectRatio:'xMidYMid meet',
          'pointer-events':'none', 'data-role':'zone-logo' }));
      }
      if (n.band && n.title){
        const accent = accentOf(n) || LINE;
        addLines(g, x + 12 + (n.logo ? 24 : 0), y + 24, 'start', accent,
          "'VD Code',monospace", 15*fscale(n), 600, '.08em',
          [String(n.title).toUpperCase()], 0, '', 'zone-band-label');
      }
      break;
    }
    case 'text':
    case 'heading':
      g.appendChild(mk('rect', { x, y, width:w, height:h, fill:'transparent',
        stroke:'none', 'pointer-events':'all' }));
      break;
    case 'ellipse':
      g.appendChild(mk('ellipse', { cx:x+w/2, cy:y+h/2, rx:w/2, ry:h/2,
        fill:fillC, stroke, 'stroke-width':swid, ...dashed }));
      break;
    case 'table': {
      rect();
      const sc = nodeScale(n);
      g.appendChild(mk('path', { d:`M${x} ${y+26*sc} H${x+w}`, stroke, 'stroke-width':1.1, opacity:.8 }));
      g.appendChild(mk('path', { d:`M${x} ${y+50*sc} H${x+w}`, stroke, 'stroke-width':1, opacity:.18 }));
      break;
    }
    case 'store': {
      const ry = 12;
      g.appendChild(mk('path', {
        d:`M${x},${y+ry} A${w/2},${ry} 0 0 1 ${x+w},${y+ry}
           L${x+w},${y+h-ry} A${w/2},${ry} 0 0 1 ${x},${y+h-ry} Z`,
        fill:fillC, stroke, 'stroke-width':swid, ...dashed
      }));
      g.appendChild(mk('path', {
        d:`M${x},${y+ry} A${w/2},${ry} 0 0 0 ${x+w},${y+ry} A${w/2},${ry} 0 0 0 ${x},${y+ry}`,
        fill:'none', stroke, 'stroke-width':Math.max(1, swid - 0.1), ...dashed
      }));
      break;
    }
    case 'queue':
      rect();
      g.appendChild(mk('path', { d:`M${x+22},${y} V${y+h} M${x+w-22},${y} V${y+h}`,
        stroke, 'stroke-width':1, opacity:.45 }));
      break;
    case 'cloud':
      g.appendChild(mk('path', {
        d: CLOUD_D,
        transform:`translate(${x},${y}) scale(${(w/72).toFixed(3)},${(h/50).toFixed(3)})`,
        fill:fillC, stroke, 'stroke-width':swid, 'stroke-linejoin':'round',
        'vector-effect':'non-scaling-stroke', ...dashed
      }));
      break;
    case 'file':
      g.appendChild(mk('path', {
        d:`M${x},${y} h${w-26} l26,26 v${h-26} h-${w} z`,
        fill:fillC, stroke, 'stroke-width':swid, 'stroke-linejoin':'round', ...dashed
      }));
      g.appendChild(mk('path', { d:`M${x+w-26},${y} v26 h26`, fill:'none', stroke,
        'stroke-width':1.1, opacity:.8 }));
      break;
    case 'api': case 'dashboard': case 'cube': case 'shield':
    case 'agent': case 'contract': case 'video': case 'media': {
      const S0 = Math.max(16, Math.min(w*0.6, h*0.62, 170));
      const sc = S0/24;
      const g2 = mk('g', {
        transform:`translate(${(x+w/2-S0/2).toFixed(2)},${(y+h*0.33-S0/2).toFixed(2)}) scale(${sc.toFixed(3)})`,
        fill:'none', stroke, 'stroke-width':swid,
        'stroke-linecap':'round', 'stroke-linejoin':'round', ...dashed
      });
      g2.innerHTML = ICON[n.kind];
      g.appendChild(g2);
      break;
    }
    case 'people': {
      const sc = Math.max(0.7, Math.min(w/140, h/90, 2.8));
      const cx = x + w/2, top = y + 12*sc;
      const X = v => cx + v*sc, Y = v => top + v*sc, R = v => v*sc;
      g.appendChild(mk('circle', { cx:X(20), cy:Y(14), r:R(9), fill:'none', stroke,
        'stroke-width':1.1, opacity:.55 }));
      g.appendChild(mk('path', { d:`M${X(2)},${Y(40)} c0,${-12*sc} ${8*sc},${-18*sc} ${18*sc},${-18*sc} c${10*sc},0 ${18*sc},${6*sc} ${18*sc},${18*sc}`,
        fill:'none', stroke, 'stroke-width':1.1, opacity:.55 }));
      g.appendChild(mk('circle', { cx:X(-10), cy:Y(16), r:R(11), fill:fillC, stroke, 'stroke-width':1.2 }));
      g.appendChild(mk('path', { d:`M${X(-32)},${Y(44)} c0,${-14*sc} ${10*sc},${-21*sc} ${22*sc},${-21*sc} c${12*sc},0 ${22*sc},${7*sc} ${22*sc},${21*sc}`,
        fill:fillC, stroke, 'stroke-width':1.2 }));
      break;
    }
    case 'frame':
      if (isSelNode(n.id) || hoverId === n.id){
        g.appendChild(mk('rect', { x, y, width:w, height:h, rx:6, fill:'none',
          stroke:FIBER, 'stroke-width':1.2, 'stroke-dasharray':'6 5',
          'pointer-events':'none', class:'ui' }));
      }
      break;
    case 'tile':
      drawTile(g, n, stroke);
      break;
    case 'logo':
      if (n.logo){
        const captioned = !!(n.title || n.sub);
        const gh = captioned ? Math.max(24, h * 0.66) : h;
        const inner = n.mono ? monoInner(n.logo, stroke) : null;
        if (inner){
          const S0 = Math.min(w, gh) * 0.86, sc = S0 / 24;
          const g2 = mk('g', {
            transform:`translate(${(x + w/2 - S0/2).toFixed(2)},` +
                      `${(y + gh/2 - S0/2).toFixed(2)}) scale(${sc.toFixed(3)})`,
            'data-role':'logo'
          });
          g2.innerHTML = inner;
          g.appendChild(g2);
        } else {
          g.appendChild(mk('image', { x, y, width:w, height:gh,
            href:n.logo, preserveAspectRatio:'xMidYMid meet', 'data-role':'logo' }));
        }
      } else {
        g.appendChild(mk('rect', { x, y, width:w, height:h, rx:3, fill:'none',
          stroke, 'stroke-width':1.2, 'stroke-dasharray':'4 3' }));
      }
      break;
    default: rect();
  }
  return g;
}

/* A tile carries a white glyph, so it can only wear accents dark enough to
   read on. Lightness is perceptual, which is why pale pink is out and a mid
   slate is in. */
const TILE_HUES = ACCENTS.filter(c => hexToOklch(c).L < 0.72);

/* A tile keeps one hue per icon: an explicit colour wins, a state wears its
   semantic hue, and everything else hashes to a stable accent so the same
   glyph always looks the same. */
function tileHue(n){
  const own = colorAt(n.color);
  if (own) return own;
  const state = n.logo ? STATE_HUES.get(n.logo) : null;
  if (state) return state;
  return TILE_HUES[hash(n.logo || n.id || 'tile') % TILE_HUES.length];
}

/* Loops that say "still working". SMIL, not a JS tick: the clone that becomes
   the exported SVG carries the animation with no extra export code. */
function tileAnim(n){
  return n.anim && ANIMS.includes(n.anim) ? n.anim : null;
}
function animSpeed(n){
  const s = Number(n && n.speed);
  if (!Number.isFinite(s) || s <= 0) return 1;
  return Math.min(4, Math.max(0.25, s));
}
/* A hand-written `speed:` need not land on a step; the stepper moves from the
   closest one so one press always changes the tempo. */
function speedStep(n){
  const s = animSpeed(n);
  let best = 0;
  SPEEDS.forEach((v, i) => {
    if (Math.abs(v - s) < Math.abs(SPEEDS[best] - s)) best = i;
  });
  return best;
}
function animGlyph(mode, ink, speed){
  /* `speed: 2` runs twice as fast, so every duration is divided by it. */
  const tempo = animSpeed({ speed });
  const dur = v => (v / tempo).toFixed(2) + 's';
  if (mode === 'loading')
    return '<g><circle cx="12" cy="12" r="7" fill="none" stroke-dasharray="12 32"/>' +
      '<animateTransform attributeName="transform" type="rotate" ' +
      `values="0 12 12;360 12 12" dur="${dur(1.1)}" repeatCount="indefinite"/></g>`;
  if (mode === 'progress')
    return '<rect x="3.5" y="9.8" width="17" height="4.4" rx="2.2" fill="none" ' +
      'opacity="0.4"/>' +
      `<rect x="5" y="11.2" width="0" height="1.6" rx="0.8" fill="${ink}" ` +
      'stroke="none"><animate attributeName="width" values="0;14;14" ' +
      `keyTimes="0;0.72;1" dur="${dur(1.9)}" repeatCount="indefinite"/></rect>`;
  if (mode === 'typing'){
    const dot = (cx, begin) => `<circle cx="${cx}" cy="12" r="1.7" fill="${ink}" ` +
      `stroke="none" opacity="0.25"><animate attributeName="opacity" ` +
      `values="0.25;1;0.25" dur="${dur(1.2)}" begin="${dur(begin)}" ` +
      'repeatCount="indefinite"/></circle>';
    return dot(6, 0) + dot(12, 0.2) + dot(18, 0.4);
  }
  if (mode === 'uploading')
    return '<g><path d="M12 16.5V7.5M8.5 11 12 7.5 15.5 11"/>' +
      '<animateTransform attributeName="transform" type="translate" ' +
      `values="0 2.2;0 -2.2;0 2.2" dur="${dur(1.5)}" repeatCount="indefinite"/></g>` +
      '<path d="M5.5 19.5h13" opacity="0.55"/>';
  if (mode === 'heartbeat')
    return '<path d="M3 12h3.6l2-5.4 3.2 10.8 2-5.4H21" stroke-dasharray="34 34">' +
      `<animate attributeName="stroke-dashoffset" values="34;0;-34" ` +
      `dur="${dur(1.6)}" repeatCount="indefinite"/></path>`;
  if (mode === 'stream'){
    const chev = (x, begin) => '<path d="M' + x + ' 7l4.5 5L' + x + ' 17" opacity="0.3">' +
      `<animate attributeName="opacity" values="0.3;1;0.3" dur="${dur(1.3)}" ` +
      `begin="${dur(begin)}" repeatCount="indefinite"/></path>`;
    return chev(4, 0) + chev(10.5, 0.22) + chev(17, 0.44);
  }
  if (mode === 'sync')
    return '<g><path d="M20 12a8 8 0 0 1-13.7 5.6"/><path d="M4 12a8 8 0 0 1 13.7-5.6"/>' +
      '<path d="M6 14.6v3.2h3.2M18 9.4V6.2h-3.2"/>' +
      '<animateTransform attributeName="transform" type="rotate" ' +
      `values="0 12 12;360 12 12" dur="${dur(2.6)}" repeatCount="indefinite"/></g>`;
  if (mode === 'waiting')
    return '<circle cx="12" cy="12" r="7.5"/>' +
      '<path d="M12 4.5v1.4M19.5 12h-1.4M12 19.5v-1.4M4.5 12h1.4"/>' +
      '<g><path d="M12 12V8M12 12h2.8"/>' +
      '<animateTransform attributeName="transform" type="rotate" ' +
      `values="0 12 12;360 12 12" dur="${dur(8)}" repeatCount="indefinite"/></g>`;
  if (mode === 'retry')
    return '<g><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.7 3.6v4.4h-4.4"/>' +
      '<animateTransform attributeName="transform" type="rotate" ' +
      `values="0 12 12;360 12 12" dur="${dur(2)}" repeatCount="indefinite"/></g>`;
  if (mode === 'throttle')
    return '<g><path d="M4.7 17.5a7.4 7.4 0 1 1 14.6 0" opacity="0.55"/>' +
      '<path d="M18.4 8.2l.9-.9"/>' +
      '<g><path d="M12 17.2 15.5 11.1"/>' +
      '<animateTransform attributeName="transform" type="rotate" ' +
      `values="0 12 17.5;-15 12 17.5;-15 12 17.5;0 12 17.5" ` +
      `keyTimes="0;0.4;0.72;1" dur="${dur(2.4)}" repeatCount="indefinite"/></g>` +
      '<circle cx="12" cy="17.5" r="1.1" fill="' + ink + '" stroke="none"/></g>';
  if (mode === 'poll')
    return '<circle cx="12" cy="12" r="7.5" opacity="0.4"/>' +
      '<g><path d="M12 12l6-3.4"/>' +
      '<animateTransform attributeName="transform" type="rotate" ' +
      `values="0 12 12;360 12 12" dur="${dur(3)}" repeatCount="indefinite"/></g>` +
      '<circle cx="12" cy="12" r="1.1" fill="' + ink + '" stroke="none"/>';
  return '';
}

/* The tile is the host: a filled square, then a glyph, a logo or a loop. */
function drawTile(g, n, stroke){
  const { x, y, w, h } = n;
  const captioned = !!(n.title || n.sub);
  const gh = captioned ? Math.max(24, h * 0.62) : h;
  const side = Math.min(w, gh);
  const tx = x + (w - side)/2, ty = y + (gh - side)/2;
  const hue = tileHue(n);
  const tr = n.sharp ? 0 : side * 0.22;
  const anim = tileAnim(n);
  const ink = n.tint ? (accentOf(n) || INK) : '#FFFFFF';
  if (!anim && !n.logo){
    g.appendChild(mk('rect', { x:tx, y:ty, width:side, height:side, rx:tr,
      fill:'none', stroke, 'stroke-width':1.2, 'stroke-dasharray':'4 3',
      'data-role':'tile' }));
    return;
  }
  g.appendChild(mk('rect', { x:tx, y:ty, width:side, height:side, rx:tr,
    fill: n.tint ? pastel(hue) : hue, stroke:'none', 'data-role':'tile' }));
  const pad = side * 0.22;
  const box = (inner, role) => {
    const g2 = mk('g', {
      transform:`translate(${(tx + pad).toFixed(1)},${(ty + pad).toFixed(1)}) ` +
                `scale(${((side - 2*pad)/24).toFixed(3)})`,
      fill:'none', stroke:ink, 'stroke-width':1.9,
      'stroke-linecap':'round', 'stroke-linejoin':'round', 'data-role':role
    });
    g2.innerHTML = inner;
    g.appendChild(g2);
  };
  if (anim){ box(animGlyph(anim, ink, n.speed), 'anim'); return; }
  const inner = n.mono ? monoInner(n.logo, ink) : null;
  if (inner) box(inner, 'logo');
  else g.appendChild(mk('image', { x:tx + pad, y:ty + pad,
    width:side - 2*pad, height:side - 2*pad, href:n.logo,
    preserveAspectRatio:'xMidYMid meet', 'data-role':'logo' }));
}

function wrapLines(text, maxW, size, mono, maxLines){
  const per = size * (mono ? 0.66 : 0.58);
  const max = Math.max(6, Math.floor(maxW / per));
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const out = [];
  let cur = '';
  for (let i = 0; i < words.length; i++){
    const w = words[i];
    const cand = cur ? cur + ' ' + w : w;
    if (cand.length <= max){ cur = cand; continue; }
    if (cur) out.push(cur);
    if (out.length >= maxLines - 1){
      const rest = words.slice(i).join(' ');
      out.push(rest.length > max ? rest.slice(0, max - 1) + '…' : rest);
      return out.slice(0, maxLines);
    }
    cur = w;
  }
  if (cur) out.push(cur);
  if (!out.length) out.push('');
  return out.slice(0, maxLines);
}

function nodeScale(n){
  if (!SIZE[n.kind] || n.kind === 'text' || n.kind === 'heading' || n.kind === 'zone') return 1;
  const [dw, dh] = SIZE[n.kind];
  return Math.min(3, Math.max(0.7, Math.min(n.w/dw, n.h/dh)));
}

function addLines(g, x, y, anchor, fill, fam, size, weight, track, lines, lh, style, role){
  const el = mk('text', { x, y, 'text-anchor':anchor, fill,
    'font-family':fam, 'font-size':String(size), 'font-weight':String(weight),
    'letter-spacing':track || '0' });
  if (style === 'italic') el.setAttribute('font-style','italic');
  if (role) el.setAttribute('data-role', role);
  lines.forEach((ln, i) => {
    const sp = mk('tspan', { x, dy: i ? lh : 0 });
    sp.textContent = ln;
    el.appendChild(sp);
  });
  g.appendChild(el);
}

function drawText(g, n){
  const k = fscale(n) * nodeScale(n);
  const sc = nodeScale(n);
  const title = String(n.title || '');
  const sub = String(n.sub || '');
  const ink = titleColorOf(n) || INK;
  const subInk = subColorOf(n) || MUTED;
  const W1 = n.bold ? 700 : 600, W2 = n.bold ? 700 : 400;
  const ST = n.italic ? 'italic' : '';
  const CODE = "'VD Code',monospace", SANS = "'VD Sans',sans-serif";
  const cx = n.x + n.w/2, cy = n.y + n.h/2;

  if (n.kind === 'line' || n.kind === 'arrow' || n.kind === 'image' || n.kind === 'frame') return;
  if (n.kind === 'logo' || n.kind === 'tile'){
    if (!title && !sub) return;
    const tile = n.kind === 'tile';
    const tw = (tile ? 15 : 16)*k;
    const tl = wrapLines(title, n.w - (tile ? 4 : 6), tw, true, 2);
    const sl = sub ? wrapLines(sub, n.w - 6, 14*k, false, 1) : [];
    const lh = 19*k, lh2 = 16*k;
    const subY = n.y + n.h - 5*k;
    const titleBottom = sl.length ? subY - lh2 : n.y + n.h - 6*k;
    addLines(g, cx, titleBottom - (tl.length - 1)*lh, 'middle', ink, CODE, tw, W1,
      '.02em', tl, lh, ST, 'title');
    if (sl.length)
      addLines(g, cx, subY, 'middle', subInk, SANS, 14*k, W2, '0', sl, lh2, ST, 'sub');
    return;
  }
  if (n.kind === 'heading'){
    const al = n.align || 'left';
    const hx = al === 'right' ? n.x + n.w - 6 : al === 'center' ? n.x + n.w/2 : n.x + 6;
    addLines(g, hx, n.y + 21*k, al === 'right' ? 'end' : al === 'center' ? 'middle' : 'start',
      ink, CODE, 20*k, W1, '.14em', [title.toUpperCase()], 0, ST, 'title');
    return;
  }
  if (n.kind === 'zone'){
    if (n.band) return;
    addLines(g, n.x + 12 + (n.logo ? 24 : 0), n.y + 26, 'start', ink, CODE,
      17*fscale(n), W1, '.12em', [title.toUpperCase()], 0, ST, 'title');
    return;
  }
  if (n.kind === 'text'){
    addLines(g, cx, cy + 7, 'middle', ink, SANS, 21*k, 500, '0',
      wrapLines(title, n.w - 12, 21*k, false, 1), 0, ST, 'title');
    return;
  }
  if (n.kind === 'table'){
    addLines(g, n.x + 12, n.y + 24*sc, 'start', ink, CODE, 16*k, W1, '.04em', [title], 0, ST, 'title');
    if (sub)
      addLines(g, n.x + 12, n.y + 54*sc, 'start', subInk, SANS, 15*k, W2, '0',
        wrapLines(sub, n.w - 28, 15*k, false, 3), 18*k, ST, 'sub');
    return;
  }
  if (GLYPHS.includes(n.kind)){
    addLines(g, cx, n.y + n.h - 34*sc, 'middle', ink, SANS, 18*k, W1, '0',
      wrapLines(title, n.w - 20, 18*k, false, 1), 0, ST, 'title');
    if (sub)
      addLines(g, cx, n.y + n.h - 13*sc, 'middle', subInk, SANS, 14.5*k, W2, '0',
        wrapLines(sub, n.w - 20, 14.5*k, false, 1), 0, ST, 'sub');
    return;
  }

  const fam = sub ? SANS : CODE;
  const logo = n.logo || null;
  const indent = logo ? 60*k : 0;
  const align = logo ? 'left' : (n.align || 'center');
  const ax = align === 'left' ? n.x + 12 + indent : align === 'right' ? n.x + n.w - 12 : cx;
  const anchor = align === 'left' ? 'start' : align === 'right' ? 'end' : 'middle';
  const tl = wrapLines(title, n.w - 26 - indent, 18*k, !sub, 2);
  const sl = sub ? wrapLines(sub, n.w - 26 - indent, 15.5*k, false, 2) : [];
  const lh = 21*k, lh2 = 19.5*k, gap = sub ? 3 : 0;
  const total = tl.length*lh + (sl.length ? sl.length*lh2 + gap : 0);
  const y = cy - total/2 + 9;
  if (logo){
    const box = 40*k;
    const inner = n.mono ? monoInner(logo, accentOf(n) || LINE) : null;
    if (inner){
      const g2 = mk('g', {
        transform:`translate(${(n.x + 12).toFixed(1)},${(y - 28*k).toFixed(1)}) ` +
                  `scale(${(box/24).toFixed(3)})`,
        'data-role':'logo'
      });
      g2.innerHTML = inner;
      g.appendChild(g2);
    } else {
      g.appendChild(mk('image', { x:(n.x + 12).toFixed(1), y:(y - 28*k).toFixed(1),
        width:String(box), height:String(box), href:logo,
        preserveAspectRatio:'xMidYMid meet', 'data-role':'logo' }));
    }
  }
  addLines(g, ax, y, anchor, ink, fam, 18*k, W1, sub ? '0' : '.03em', tl, lh, ST, 'title');
  if (sl.length)
    addLines(g, ax, y + tl.length*lh + gap + 5, anchor, subInk, SANS, 15.5*k, W2, '0', sl, lh2, ST, 'sub');
}

