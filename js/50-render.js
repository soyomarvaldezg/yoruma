/* ---------- render ---------- */
let motionEls = [], handles = [];
let dimPrev = new Set(), dimNow = new Set();
const lenCache = new Map();

function tick(now){
  requestAnimationFrame(tick);
  tickFrame(now);
}
function tickFrame(now){
  if (!motionEls.length || document.hidden) return;
  motionEls.forEach(m => {
    const t = (now * m.speed + m.phase) % 1;
    const p = m.path.getPointAtLength((m.dir < 0 ? 1 - t : t) * m.len);
    const el = m.el;
    el.setAttribute('cx', p.x);
    el.setAttribute('cy', p.y);
    el.setAttribute('r', m.base);
    el.setAttribute('opacity', '.9');
  });
}

function renderSoon(){
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => { rafPending = false; render(); });
}
function render(){
  const lite = !!(drag || resize);
  viewport.innerHTML = '';
  const defs = mk('defs');
  const mkArrow = (id, fill) => {
    const m = mk('marker', { id, viewBox:'0 0 10 10', refX:'9.5', refY:'5',
      markerWidth:'12', markerHeight:'12', markerUnits:'userSpaceOnUse',
      orient:'auto-start-reverse' });
    m.appendChild(mk('path', { d:'M0 0 L10 5 L0 10 z', fill }));
    return m;
  };
  const markerId = c => 'ar' + String(c || LINE).replace('#','');
  const colors = new Set([LINE, FIBER]);
  ACCENTS.forEach(c => colors.add(c));
  links.forEach(l => {
    const c = colorAt(l.color);
    if (c) colors.add(c);
  });
  nodes.forEach(n => {
    const c = accentOf(n);
    if (c) colors.add(c);
  });
  colors.forEach(c => defs.appendChild(mkArrow(markerId(c), c)));
  viewport.appendChild(defs);

  nodes.filter(n => n.kind === 'frame').forEach(f => {
    const box = membersBox(f);
    if (box){ f.x = box.x; f.y = box.y; f.w = box.w; f.h = box.h; }
  });

  const world = mk('g');
  const focusZone = presentZoneId ? nodes.find(n => n.id === presentZoneId) : null;
  const spot = !focusZone && spotId ? byId(spotId) : null;
  const focusMembers = focusZone && focusZone.kind === 'frame'
    ? stepMembers(focusZone) : null;
  const dimmed = n => {
    if (spot) return n !== spot && n.kind !== 'frame';
    if (!focusZone || n === focusZone || n.kind === 'frame') return false;
    if (focusMembers) return !focusMembers.has(n.id);
    return !(n.x >= focusZone.x && n.y >= focusZone.y &&
      n.x + n.w <= focusZone.x + focusZone.w &&
      n.y + n.h <= focusZone.y + focusZone.h);
  };

  nodes.filter(n => n.kind === 'zone').forEach(n => {
    const g = mk('g', { class:'node', 'data-id':n.id });
    if (isSelNode(n.id))
      g.appendChild(mk('rect', { x:n.x-2, y:n.y-2, width:n.w+4, height:n.h+4, rx:9,
        fill:'none', stroke:FIBER, 'stroke-width':1.4, 'stroke-dasharray':'3 3',
        'pointer-events':'none', class:'ui' }));
    g.appendChild(shape(n));
    if (dimmed(n)){
      g.setAttribute('opacity', '.16');
      if (!dimPrev.has(n.id)) g.classList.add('dimmed');
      dimNow.add(n.id);
    }
    world.appendChild(g);
  });

  const drawn = [], liveQ = [];
  links.forEach(l => {
    const a = byId(l.from), b = byId(l.to);
    if (!a || !b) return;
    const pts = route(a, b, bendsOf(l), l);
    const d = rounded(pts, 7);
    const col = colorAt(l.color) || LINE;
    const selected = isSelLink(l.id);
    const mode = l.motion || S.motion;
    const animated = mode === 'dashes' || mode === 'both';
    const flow = animated;
    const live = mode === 'live' && !lite;
    const staticDash = l.dash === true && !animated && !live;
    const dir = l.head === false && l.headStart === true ? -1 : 1;
    const lw = l.lw || 1.5;
    const g = mk('g', { 'data-link':l.id });

    g.appendChild(mk('path', { d, fill:'none', stroke:'transparent', 'stroke-width':16,
      'pointer-events':'stroke', class:'linkhit', 'data-link':l.id }));
    g.appendChild(mk('path', { d, fill:'none', stroke: col || LINE,
      'stroke-width': selected ? Math.max(2.6, lw + 1.1) : lw, 'stroke-linecap':'round',
      'marker-end': l.head === false ? 'none' : `url(#${markerId(col || LINE)})`,
      'marker-start': l.headStart ? `url(#${markerId(col || LINE)})` : 'none',
      opacity: flow && !lite ? 0.22 : (live ? 0.3 : 1),
      ...(staticDash ? { 'stroke-dasharray':'7 5' } : {}),
      ...(flow ? { 'data-flow':'1' } : {}),
      ...(selected ? { 'data-sel':'1', 'data-lw':lw } : {}) }));
    if (flow && !lite)
      g.appendChild(mk('path', { d, fill:'none', stroke: col || LINE,
        'stroke-width': Math.max(1.6, lw + 0.7),
        'stroke-linecap':'butt', class:'march ui' + (dir < 0 ? ' rev' : ''),
        opacity:'.95', 'pointer-events':'none',
        'marker-end': l.head === false ? 'none' : `url(#${markerId(col || LINE)})`,
        'marker-start': l.headStart ? `url(#${markerId(col || LINE)})` : 'none' }));
    if (live){
      const halo = mk('path', { d, fill:'none', stroke: col || LINE,
        'stroke-width': lw + 6, 'stroke-linecap':'round', opacity:'.13',
        'pointer-events':'none', class:'ui comet-halo',
        'data-live':dir < 0 ? '-1' : '1' });
      const comet = mk('path', { d, fill:'none', stroke: col || LINE,
        'stroke-width': lw + 1.3, 'stroke-linecap':'round', opacity:'.95',
        'pointer-events':'none', class:'ui comet', 'data-live':dir < 0 ? '-1' : '1' });
      g.appendChild(halo);
      g.appendChild(comet);
      liveQ.push({ el: comet, halo, dir });
    }
    if (selected)
      g.appendChild(mk('path', { d, fill:'none', stroke:FIBER, 'stroke-width':1,
        'stroke-dasharray':'2 4', opacity:'.9', 'pointer-events':'none', class:'ui' }));
    if ((spot && a !== spot && b !== spot) ||
        (focusZone && (focusMembers ? (dimmed(a) || dimmed(b)) : (dimmed(a) && dimmed(b))))){
      g.setAttribute('opacity', '.16');
      if (!dimPrev.has(l.id)) g.classList.add('dimmed');
      dimNow.add(l.id);
    }
    if (l.label){
      const m = midPoint(pts);
      const vertical = Math.abs(pts[pts.length-1][0]-pts[0][0]) <
                       Math.abs(pts[pts.length-1][1]-pts[0][1]);
      const k = l.fs || 1;
      const lines = wrapLines(l.label, (vertical ? 130 : 210)*k, 14*k, false, 4);
      const x = vertical ? m.x + 12*k : m.x;
      const lh = 17*k;
      const y = vertical ? m.y + 4*k - (lines.length - 1)*lh/2
                         : m.y - 6*k - (lines.length - 1)*lh;
      const t = mk('text', { x, y, 'text-anchor': vertical ? 'start' : 'middle',
        'font-family':"'VD Sans',sans-serif", 'font-size':String(14*k),
        fill: colorAt(l.color) || MUTED, stroke:PAPER, 'stroke-width':'2.6',
        'paint-order':'stroke', 'pointer-events':'all', 'data-role':'label' });
      lines.forEach((ln, i) => {
        const sp = mk('tspan', { x, dy: i ? lh : 0 });
        sp.textContent = ln;
        t.appendChild(sp);
      });
      g.appendChild(t);
    }
    world.appendChild(g);
    drawn.push({ link:l, d, mode, col });
  });

  const nodesG = mk('g');
  nodes.filter(n => n.kind !== 'zone').forEach(n => {
    const g = mk('g', { class:'node', 'data-id':n.id });
    if (isSelNode(n.id))
      g.appendChild(mk('rect', { x:n.x-2, y:n.y-2, width:n.w+4, height:n.h+4, rx:4,
        fill:'none', stroke:FIBER, 'stroke-width':1.4, 'stroke-dasharray':'3 3',
        'pointer-events':'none', class:'ui' }));
    g.appendChild(shape(n));
    drawText(g, n);
    if (dimmed(n)){
      g.setAttribute('opacity', '.22');
      if (!dimPrev.has(n.id)) g.classList.add('dimmed');
      dimNow.add(n.id);
    }
    nodesG.appendChild(g);
  });
  world.appendChild(nodesG);

  const zoneLabels = mk('g');
  nodes.filter(n => n.kind === 'zone').forEach(n => {
    const g = mk('g', { 'data-id':n.id });
    drawText(g, n);
    if (dimmed(n)) g.setAttribute('opacity', '.22');
    zoneLabels.appendChild(g);
  });
  world.appendChild(zoneLabels);

  dimPrev = dimNow; dimNow = new Set();

  viewport.appendChild(world);

  inked.forEach(s => viewport.appendChild(mk('path', {
    d: s.d, fill:'none', stroke: s.stroke, 'stroke-width': s.sw,
    'stroke-linecap':'round', 'stroke-linejoin':'round', opacity:'.95',
    'pointer-events':'none', class:'ui ink'
  })));

  motionEls = [];
  if (!lite) drawn.forEach(({ link, d, mode, col }) => {
    if (mode !== 'dots' && mode !== 'both') return;
    const c = mk('circle', { r:'2.8', opacity:'0',
      fill: col || FIBER, class:'ui' });
    viewport.appendChild(c);
    const ghost = mk('path', { d, fill:'none', stroke:'none', class:'ui' });
    viewport.appendChild(ghost);
    let len = lenCache.get(d);
    if (len == null){ len = ghost.getTotalLength(); lenCache.set(d, len); }
    const lw = link.lw || 1.5;
    const dir = link.head === false && link.headStart === true ? -1 : 1;
    motionEls.push({ id:link.id, path:ghost, el:c, len, dir,
      phase:(hash(link.id)%1000)/1000, speed:0.00022,
      base: S.dotSize * Math.max(0.85, Math.min(1.5, lw / 1.5)),
      seed:(hash(link.id)%97)/97 });
  });
  if (!lite) liveQ.forEach(({ el, halo, dir }) => {
    const len = el.getTotalLength();
    if (!len) return;
    const tail = Math.round(Math.max(18, len * 0.16));
    const lap = Math.round(len + 1);
    const dash = `${tail} ${Math.max(1, lap - tail)}`;
    const dur = Math.max(1200, Math.round(len * 5));
    [el, halo].forEach(node => {
      node.setAttribute('stroke-dasharray', dash);
      node.setAttribute('data-lap', String(lap));
      node.setAttribute('data-dur', String(dur));
      try {
        node.animate(
          dir < 0 ? [{ strokeDashoffset: -lap }, { strokeDashoffset: 0 }]
                  : [{ strokeDashoffset: 0 }, { strokeDashoffset: -lap }],
          { duration: dur, iterations: Infinity, easing: 'linear' });
      } catch (e){}
    });
  });

  /* A step carries its number on the canvas, just outside its box. The badge
     is a UI element, so exports drop it and present mode hides it. */
  nodes.forEach(n => {
    if (n.kind !== 'frame' || n.step == null) return;
    const label = String(n.step);
    const r = Math.max(8, Math.min(14, 10/view.k)) * (label.length > 1 ? 1.2 : 1);
    const box = membersBox(n) || n;
    const cx = box.x + box.w + r*0.35, cy = box.y - r*0.35;
    const g = mk('g', { class:'ui step-badge', 'data-step-badge':n.id,
      'pointer-events':'none' });
    g.appendChild(mk('circle', { cx, cy, r, fill:'#08829C', stroke:'#FFFFFF',
      'stroke-width':Math.max(1, 1.4/view.k) }));
    const t = mk('text', { x:cx, y:cy + r*0.36, 'text-anchor':'middle',
      fill:'#FFFFFF', 'font-family':"'VD Code', monospace",
      'font-size':String(r*1.05), 'font-weight':'600' });
    t.textContent = label;
    g.appendChild(t);
    viewport.appendChild(g);
  });

  handles = [];
  const hs = 9/view.k;
  if (S.selNodes.length === 1){
    const n = byId(S.selNodes[0]);
    if (n && n.kind !== 'frame'){
      [['nw',n.x,n.y],['ne',n.x+n.w,n.y],['sw',n.x,n.y+n.h],['se',n.x+n.w,n.y+n.h]]
        .forEach(([k,hx,hy]) => {
          viewport.appendChild(mk('rect', { x:hx-hs/2, y:hy-hs/2, width:hs, height:hs,
            fill:'#fff', stroke:FIBER, 'stroke-width':1.5/view.k,
            'pointer-events':'none', class:'ui' }));
          handles.push({ kind:'resize', id:n.id, corner:k, x:hx, y:hy, r:hs });
        });
    }
  }

  const connIds = new Set();
  if (S.selNodes.length === 1) connIds.add(S.selNodes[0]);
  if (hoverId && !connIds.has(hoverId)) connIds.add(hoverId);
  connIds.forEach(id => {
    const n = byId(id);
    if (!n || n.kind === 'zone' || n.kind === 'line' || n.kind === 'arrow' || n.kind === 'image') return;
    const pts = [
      ['n', n.x+n.w/2, n.y, 0.5],
      ['s', n.x+n.w/2, n.y+n.h, 0.5],
      ['w', n.x, n.y+n.h/2, 0.5],
      ['e', n.x+n.w, n.y+n.h/2, 0.5],
      ['w', n.x, n.y, 0],
      ['e', n.x+n.w, n.y, 0],
      ['w', n.x, n.y+n.h, 1],
      ['e', n.x+n.w, n.y+n.h, 1]
    ];
    pts.forEach(([side, px, py, t]) => {
      const rr = 4.2/view.k;
      viewport.appendChild(mk('circle', { cx:px, cy:py, r:rr + 2/view.k, fill:'#fff',
        stroke:'none', 'pointer-events':'none', class:'ui' }));
      viewport.appendChild(mk('circle', { cx:px, cy:py, r:rr, fill:FIBER,
        stroke:'none', 'pointer-events':'none', class:'ui' }));
      handles.push({ kind:'newedge', id, side, t, x:px, y:py, r:9/view.k });
    });
  });
  if (S.selLinks.length === 1){
    const l = links.find(x => x.id === S.selLinks[0]);
    if (l){
      const a = byId(l.from), b = byId(l.to);
      if (a && b){
        const { p1, p2 } = anchors(a, b, l);
        [[p1,'from'],[p2,'to']].forEach(([p,end]) => {
          viewport.appendChild(mk('circle', { cx:p.x, cy:p.y, r:hs*0.6, fill:'#fff',
            stroke:FIBER, 'stroke-width':1.5/view.k, 'pointer-events':'none', class:'ui' }));
          handles.push({ kind:'linkend', id:l.id, end, x:p.x, y:p.y, r:hs * 1.7 });
        });
        const pts = route(a, b, bendsOf(l), l);
        /* A circle sits on each straight run: dragging it commits a corner
           there. Filled dots are the corners already committed. */
        for (let i = 1; i < pts.length; i++){
          const [x0, y0] = pts[i-1], [x1, y1] = pts[i];
          if (Math.hypot(x1 - x0, y1 - y0) < 30) continue;
          const sx = (x0 + x1)/2, sy = (y0 + y1)/2;
          viewport.appendChild(mk('circle', { cx:sx, cy:sy, r:hs*0.44, fill:'#fff',
            stroke:FIBER, 'stroke-width':1.3/view.k, 'pointer-events':'none', class:'ui' }));
          handles.push({ kind:'linkadd', id:l.id, seg:i, x:sx, y:sy, r:hs*0.9 });
        }
        bendsOf(l).forEach((bd, index) => {
          viewport.appendChild(mk('circle', { cx:bd.x, cy:bd.y, r:hs*0.7, fill:FIBER,
            stroke:'#fff', 'stroke-width':1.6/view.k, 'pointer-events':'none', class:'ui' }));
          handles.push({ kind:'linkway', id:l.id, index, x:bd.x, y:bd.y, r:hs });
        });
      }
    }
  }


  if (marquee){
    viewport.appendChild(mk('rect', {
      x:Math.min(marquee.x0,marquee.x1), y:Math.min(marquee.y0,marquee.y1),
      width:Math.abs(marquee.x1-marquee.x0), height:Math.abs(marquee.y1-marquee.y0),
      fill:'rgba(8,130,156,.08)', stroke:FIBER, 'stroke-width':1/view.k,
      'stroke-dasharray':`${5/view.k} ${3/view.k}`, 'pointer-events':'none', class:'ui'
    }));
  }

  document.body.dataset.tool = S.tool;
  syncHud();
  /* The style bar is docked first: the loop strip has to see it to stay clear. */
  placeStylebar();
  placeShaper();
  placeLinkbar();
  if (typeof syncMinimap === 'function') syncMinimap();
  save();
  if (!lite) lintSoon();
}

