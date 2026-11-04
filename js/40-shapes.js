/* ---------- shapes ---------- */
const CLOUD_D = 'M20 45 C7 45 0 37 0 27 C0 18 7 10 16 9 C20 2 28 -2 36 -2 '
              + 'C46 -2 54 5 56 14 C64 15 70 21 70 29 C70 38 63 45 54 45 Z';
const GLYPHS = ['people','api','dashboard','cube','shield','agent','contract','video','media'];
const LOGO_KINDS = new Set(['box','ellipse']);


function shape(n){
  const { x, y, w, h } = n;
  const stroke = accentOf(n) || LINE;
  const fillC = fillOf(n) || (n.tint && accentOf(n) ? hexA(accentOf(n), .10) : CARD);
  const g = mk('g');
  const rect = () => g.appendChild(mk('rect', {
    x, y, width:w, height:h, rx:3, fill:fillC, stroke, 'stroke-width':1.2
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
      g.appendChild(mk('line', { x1, y1, x2, y2, stroke, 'stroke-width':1.7,
        'stroke-linecap':'round',
        'marker-end': n.kind === 'arrow' ? `url(#ar${stroke.replace('#','')})` : 'none' }));
      g.appendChild(mk('line', { x1, y1, x2, y2, stroke:'transparent',
        'stroke-width':16, 'pointer-events':'stroke' }));
      break;
    }
    case 'zone':
      g.appendChild(mk('rect', {
        x, y, width:w, height:h, rx:8,
        fill: fillOf(n) ? hexA(fillOf(n), .10) : 'rgba(255,255,255,.30)',
        stroke: accentOf(n) || LINE,
        'stroke-width':1.4, 'stroke-dasharray':'7 6', 'pointer-events':'none'
      }));
      break;
    case 'text':
    case 'heading':
      g.appendChild(mk('rect', { x, y, width:w, height:h, fill:'transparent',
        stroke:'none', 'pointer-events':'all' }));
      break;
    case 'ellipse':
      g.appendChild(mk('ellipse', { cx:x+w/2, cy:y+h/2, rx:w/2, ry:h/2,
        fill:fillC, stroke, 'stroke-width':1.2 }));
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
        fill:fillC, stroke, 'stroke-width':1.2
      }));
      g.appendChild(mk('path', {
        d:`M${x},${y+ry} A${w/2},${ry} 0 0 0 ${x+w},${y+ry} A${w/2},${ry} 0 0 0 ${x},${y+ry}`,
        fill:'none', stroke, 'stroke-width':1.1
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
        fill:fillC, stroke, 'stroke-width':1.2, 'stroke-linejoin':'round',
        'vector-effect':'non-scaling-stroke'
      }));
      break;
    case 'file':
      g.appendChild(mk('path', {
        d:`M${x},${y} h${w-26} l26,26 v${h-26} h-${w} z`,
        fill:fillC, stroke, 'stroke-width':1.2, 'stroke-linejoin':'round'
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
        fill:'none', stroke, 'stroke-width':1.3,
        'stroke-linecap':'round', 'stroke-linejoin':'round'
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
    case 'logo':
      if (n.logo){
        g.appendChild(mk('image', { x, y, width:w, height:h, href:n.logo,
          preserveAspectRatio:'xMidYMid meet', 'data-role':'logo' }));
      } else {
        g.appendChild(mk('rect', { x, y, width:w, height:h, rx:3, fill:'none',
          stroke, 'stroke-width':1.2, 'stroke-dasharray':'4 3' }));
      }
      break;
    default: rect();
  }
  return g;
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

  if (n.kind === 'line' || n.kind === 'arrow' || n.kind === 'image' || n.kind === 'logo' || n.kind === 'frame') return;
  if (n.kind === 'heading'){
    const al = n.align || 'left';
    const hx = al === 'right' ? n.x + n.w - 6 : al === 'center' ? n.x + n.w/2 : n.x + 6;
    addLines(g, hx, n.y + 19, al === 'right' ? 'end' : al === 'center' ? 'middle' : 'start',
      ink, CODE, 18*k, W1, '.14em', [title.toUpperCase()], 0, ST, 'title');
    return;
  }
  if (n.kind === 'zone'){
    addLines(g, n.x + 12, n.y + 28, 'start', ink, CODE, 20*fscale(n), W1, '.12em',
      [title.toUpperCase()], 0, ST, 'title');
    return;
  }
  if (n.kind === 'text'){
    addLines(g, cx, cy + 6, 'middle', ink, SANS, 18*k, 500, '0',
      wrapLines(title, n.w - 12, 18*k, false, 1), 0, ST, 'title');
    return;
  }
  if (n.kind === 'table'){
    addLines(g, n.x + 12, n.y + 22*sc, 'start', ink, CODE, 14.5*k, W1, '.04em', [title], 0, ST, 'title');
    if (sub)
      addLines(g, n.x + 12, n.y + 52*sc, 'start', subInk, SANS, 13.5*k, W2, '0',
        wrapLines(sub, n.w - 28, 13.5*k, false, 3), 16.5*k, ST, 'sub');
    return;
  }
  if (GLYPHS.includes(n.kind)){
    addLines(g, cx, n.y + n.h - 32*sc, 'middle', ink, SANS, 16*k, W1, '0',
      wrapLines(title, n.w - 20, 16*k, false, 1), 0, ST, 'title');
    if (sub)
      addLines(g, cx, n.y + n.h - 12*sc, 'middle', subInk, SANS, 13*k, W2, '0',
        wrapLines(sub, n.w - 20, 13*k, false, 1), 0, ST, 'sub');
    return;
  }

  const fam = sub ? SANS : CODE;
  const logo = n.logo || null;
  const indent = logo ? 54*k : 0;
  const align = logo ? 'left' : (n.align || 'center');
  const ax = align === 'left' ? n.x + 12 + indent : align === 'right' ? n.x + n.w - 12 : cx;
  const anchor = align === 'left' ? 'start' : align === 'right' ? 'end' : 'middle';
  const tl = wrapLines(title, n.w - 26 - indent, 16*k, !sub, 2);
  const sl = sub ? wrapLines(sub, n.w - 26 - indent, 14*k, false, 2) : [];
  const lh = 19*k, lh2 = 17.5*k, gap = sub ? 3 : 0;
  const total = tl.length*lh + (sl.length ? sl.length*lh2 + gap : 0);
  const y = cy - total/2 + 9;
  if (logo){
    const box = 40*k;
    g.appendChild(mk('image', { x:(n.x + 12).toFixed(1), y:(y - 28*k).toFixed(1),
      width:String(box), height:String(box), href:logo,
      preserveAspectRatio:'xMidYMid meet', 'data-role':'logo' }));
  }
  addLines(g, ax, y, anchor, ink, fam, 16*k, W1, sub ? '0' : '.03em', tl, lh, ST, 'title');
  if (sl.length)
    addLines(g, ax, y + tl.length*lh + gap + 5, anchor, subInk, SANS, 14*k, W2, '0', sl, lh2, ST, 'sub');
}

