/* ---------- pointer ---------- */
stage.addEventListener('contextmenu', e => e.preventDefault());

stage.addEventListener('pointerdown', ev => {
  if (ev.button === 2 || ev.button === 1){
    pan = { sx:ev.clientX, sy:ev.clientY, vx:view.x, vy:view.y };
    stage.classList.add('panning');
    cap(ev);
    return;
  }
  if (ev.button !== 0) return;
  if (document.body.classList.contains('present')){ stepPresent(1); return; }

  const p = toWorld(ev);
  if (editing) commitEdit();

  const h = handleAt(p);
  if (h){
    if (h.kind === 'newedge'){
      const n = byId(h.id);
      const sp = edgePoint(n, h.side);
      pen = { tool:'arrow', start:sp, pts:[sp], from:n, side:h.side,
              sideT:(h.t == null ? 0.5 : h.t), target:null };
      cap(ev);
      return;
    }
    if (h.kind === 'linkway'){
      bend = { l: links.find(x => x.id === h.id), moved:false };
    } else if (h.kind === 'resize'){
      const n = byId(h.id);
      const kids = n.kind === 'zone'
        ? nodes.filter(m => m.kind !== 'zone' && m.x >= n.x && m.y >= n.y &&
            m.x + m.w <= n.x + n.w && m.y + m.h <= n.y + n.h)
            .map(m => ({ m, rx:(m.x - n.x)/n.w, ry:(m.y - n.y)/n.h,
              rw:m.w/n.w, rh:m.h/n.h }))
        : [];
      resize = { n, corner:h.corner, ox:n.x, oy:n.y, ow:n.w, oh:n.h, kids, moved:false };
    } else {
      const l = links.find(x => x.id === h.id);
      lend = { l, end:h.end, other: h.end === 'from' ? byId(l.to) : byId(l.from) };
    }
    cap(ev);
    return;
  }

  if (S.armed){
    const label = S.armed;
    snapshot();
    const n = { id:'n'+(uid++), kind:'box', title:label, sub:'', color:S.color,
      tcolor:S.tcolor, scolor:S.scolor, tint:S.tint === true, fs:1,
      x:Math.round(p.x-88), y:Math.round(p.y-38), w:176, h:76 };
    nodes.push(n);
    selectNodes([n.id], false);
    setTool('select', 'draw');
    render();
    editNode(n, true);
    return;
  }

  const linkEl = ev.target.closest ? ev.target.closest('[data-link]') : null;
  const hit = nodeAt(p, 2);

  if (S.tool === 'select'){
    if (linkEl){
      S.paint = 'line';
      const lid = linkEl.dataset.link;
      const now = Date.now();
      if (lastHit.id === lid && now - lastHit.t < 340){
        lastHit = { id:null, t:0 };
        const l = links.find(x => x.id === lid);
        if (l) editLink(l);
        return;
      }
      lastHit = { id:lid, t:now };
      if (isSelLink(lid)){
        const l = links.find(x => x.id === lid);
        if (l){ bend = { l, moved:false }; cap(ev); return; }
      }
      selectLink(lid); render(); return;
    }
    if (hit){
      const now = Date.now();
      if (lastHit.id === hit.id && now - lastHit.t < 340){
        lastHit = { id:null, t:0 };
        editNode(hit);
        return;
      }
      lastHit = { id:hit.id, t:now };
      if (ev.shiftKey || ev.metaKey || ev.ctrlKey) selectNodes([hit.id], true);
      else if (!isSelNode(hit.id)) selectNodes([hit.id], false);
      pickTarget(ev, hit, p);
      const nearBorder = Math.min(Math.abs(p.x-hit.x), Math.abs(p.x-(hit.x+hit.w)),
                                  Math.abs(p.y-hit.y), Math.abs(p.y-(hit.y+hit.h))) < 10;
      if (nearBorder && !['zone','line','arrow','image'].includes(hit.kind)){
        pen = { tool:'arrow', start:p, pts:[p], from:hit, side:null, sideT:null, target:null };
        cap(ev);
        return;
      }
      const items = S.selNodes.map(id => byId(id)).filter(Boolean);
      if (hit.kind === 'zone'){
        nodes.forEach(n => {
          if (n.kind !== 'zone' && !items.includes(n) &&
              n.x >= hit.x && n.y >= hit.y &&
              n.x+n.w <= hit.x+hit.w && n.y+n.h <= hit.y+hit.h) items.push(n);
        });
      }
      drag = { items: items.map(n => ({ n, x:n.x, y:n.y })), start:p, moved:false };
      cap(ev);
      render();
      return;
    }
    if (!ev.shiftKey) clearSel();
    marquee = { x0:p.x, y0:p.y, x1:p.x, y1:p.y, add:ev.shiftKey };
    cap(ev);
    render();
    return;
  }

  if (S.tool === 'line'){ pen = { tool:'line', start:p, pts:[p], from:hit, target:null };
    cap(ev); return; }

  if (S.tool === 'text' || S.tool === 'heading'){
    if (hit && (hit.kind === 'text' || hit.kind === 'heading')){ editNode(hit); return; }
    const [w, hh] = SIZE[S.tool];
    snapshot();
    const n = { id:'n'+(uid++), kind:S.tool, title:'', sub:'', color:S.color,
      tcolor:S.tcolor, scolor:S.scolor, tint:S.tint === true, fs:1,
      x:Math.round(p.x - w/2), y:Math.round(p.y - hh/2), w, h:hh };
    nodes.push(n);
    selectNodes([n.id], false);
    setTool('select', 'draw');
    render();
    editNode(n);
    return;
  }

  pen = { tool:S.tool, start:p, pts:[p], from:hit, target:null };
  cap(ev);
});

stage.addEventListener('pointermove', ev => {
  if (pan){
    view.x = pan.vx + (ev.clientX - pan.sx);
    view.y = pan.vy + (ev.clientY - pan.sy);
    applyView();
    return;
  }
  const p = toWorld(ev);

  if (bend){
    if (!bend.moved){ snapshot(); bend.moved = true; }
    bend.l.way = { x:Math.round(p.x), y:Math.round(p.y) };
    renderSoon();
    return;
  }
  if (resize){
    if (!resize.moved){ snapshot(); resize.moved = true; }
    const n = resize.n, c = resize.corner;
    let x1 = resize.ox, y1 = resize.oy, x2 = resize.ox + resize.ow, y2 = resize.oy + resize.oh;
    if (c === 'nw' || c === 'sw') x1 = p.x;
    if (c === 'ne' || c === 'se') x2 = p.x;
    if (c === 'nw' || c === 'ne') y1 = p.y;
    if (c === 'sw' || c === 'se') y2 = p.y;
    n.x = Math.round(Math.min(x1,x2));
    n.y = Math.round(Math.min(y1,y2));
    n.w = Math.max(60, Math.round(Math.abs(x2-x1)));
    n.h = Math.max(36, Math.round(Math.abs(y2-y1)));
    resize.kids.forEach(k => {
      k.m.x = Math.round(n.x + k.rx*n.w);
      k.m.y = Math.round(n.y + k.ry*n.h);
      k.m.w = Math.max(12, Math.round(k.rw*n.w));
      k.m.h = Math.max(12, Math.round(k.rh*n.h));
    });
    renderSoon();
    return;
  }
  if (lend){
    clearPreview();
    const { p1, p2 } = anchors(byId(lend.l.from), byId(lend.l.to), lend.l);
    const fixed = lend.end === 'from' ? p2 : p1;
    preview = mk('path', { d:`M${fixed.x} ${fixed.y} L${p.x} ${p.y}`,
      fill:'none', stroke:FIBER, 'stroke-width':1.6, 'stroke-dasharray':'4 4',
      'pointer-events':'none' });
    viewport.appendChild(preview);
    return;
  }
  if (drag){
    if (!drag.moved && Math.hypot(p.x-drag.start.x, p.y-drag.start.y) > 2){
      snapshot(); drag.moved = true;
    }
    if (drag.moved){
      const dx = p.x - drag.start.x, dy = p.y - drag.start.y;
      drag.items.forEach(it => {
        it.n.x = Math.round(it.x + dx);
        it.n.y = Math.round(it.y + dy);
      });
      renderSoon();
    }
    return;
  }
  if (marquee){
    marquee.x1 = p.x; marquee.y1 = p.y;
    renderSoon();
    return;
  }
  if (!pen){
    if (S.tool === 'select'){
      const h = nodeAt(p, 2);
      const id = h && !['zone','line','arrow','image'].includes(h.kind) ? h.id : null;
      if (id !== hoverId){ hoverId = id; render(); }
    }
    return;
  }
  pen.pts.push(p);
  pen.target = pen.tool === 'arrow' ? (nodeAt(p, 26) || nearest(p, 90)) : null;
  paintPreview();
});

stage.addEventListener('pointerup', ev => {
  if (pan){ pan = null; stage.classList.remove('panning'); return; }
  if (bend){ bend = null; render(); return; }
  if (resize){ resize = null; render(); return; }
  if (lend){
    const p = toWorld(ev);
    const target = nodeAt(p, 12) || nearest(p, 50);
    if (target && target !== lend.other){
      snapshot();
      const anc = nearestAnchor(target, p);
      if (lend.end === 'from'){
        lend.l.from = target.id; lend.l.fromSide = anc.side; lend.l.fromT = anc.t;
      } else {
        lend.l.to = target.id; lend.l.toSide = anc.side; lend.l.toT = anc.t;
      }
      lend.l.way = null;
    }
    lend = null; clearPreview(); render();
    return;
  }
  if (drag){ drag = null; render(); return; }
  if (marquee){
    const x1 = Math.min(marquee.x0, marquee.x1), x2 = Math.max(marquee.x0, marquee.x1);
    const y1 = Math.min(marquee.y0, marquee.y1), y2 = Math.max(marquee.y0, marquee.y1);
    const tiny = (x2-x1) < 4 && (y2-y1) < 4;
    const hit = tiny ? [] : nodes.filter(n => n.kind === 'zone'
      ? (n.x >= x1 && n.y >= y1 && n.x+n.w <= x2 && n.y+n.h <= y2)
      : n.kind !== 'frame'
        ? (n.x < x2 && n.x+n.w > x1 && n.y < y2 && n.y+n.h > y1)
        : false).map(n => n.id);
    const add = marquee.add;
    marquee = null;
    if (hit.length || !add) selectNodes(hit, add);
    render();
    return;
  }
  if (!pen) return;
  const p = toWorld(ev);
  pen.pts.push(p);
  const job = pen;
  pen = null;
  clearPreview();
  commit(job, p);
});

stage.addEventListener('pointerleave', () => {
  if (hoverId){ hoverId = null; render(); }
});

stage.addEventListener('wheel', ev => {
  ev.preventDefault();
  const r = stage.getBoundingClientRect();
  if (ev.ctrlKey || ev.metaKey){
    zoomAt(ev.clientX - r.left, ev.clientY - r.top, ev.deltaY < 0 ? 1.1 : 1/1.1);
  } else {
    view.x -= ev.deltaX; view.y -= ev.deltaY;
    applyView();
  }
}, { passive:false });

function paintPreview(){
  clearPreview();
  const a = pen.start, b = pen.pts[pen.pts.length-1];
  if (pen.tool === 'arrow' || pen.tool === 'line'){
    preview = mk('path', { d:`M${a.x} ${a.y} L${b.x} ${b.y}`,
      fill:'none', stroke:FIBER, 'stroke-width':1.8, 'stroke-linecap':'round',
      'marker-end': pen.tool === 'line' ? 'none' : 'url(#ar08829C)',
      'pointer-events':'none' });
  } else {
    preview = mk('rect', {
      x:Math.min(a.x,b.x), y:Math.min(a.y,b.y),
      width:Math.abs(b.x-a.x), height:Math.abs(b.y-a.y), rx:3,
      fill:'none', stroke:FIBER, 'stroke-width':1.5, 'stroke-dasharray':'4 4',
      'pointer-events':'none' });
  }
  viewport.appendChild(preview);
  if (pen.target){
    const t = pen.target;
    const anc = nearestAnchor(t, pen.pts[pen.pts.length-1]);
    const ap = edgePoint(t, anc.side, anc.t);
    previewTarget = mk('g');
    previewTarget.appendChild(mk('rect', { x:t.x-3, y:t.y-3, width:t.w+6, height:t.h+6, rx:4,
      fill:'rgba(8,130,156,.10)', stroke:FIBER, 'stroke-width':1.6 }));
    previewTarget.appendChild(mk('circle', { cx:ap.x, cy:ap.y, r:5.5/view.k,
      fill:FIBER, stroke:'#fff', 'stroke-width':1.6/view.k }));
    previewTarget.setAttribute('pointer-events','none');
    viewport.appendChild(previewTarget);
  }
}

function commit(job, end){
  const a = job.start;
  if (job.tool === 'line'){
    const x1 = job.start.x, y1 = job.start.y, x2 = end.x, y2 = end.y;
    if (Math.hypot(x2-x1, y2-y1) < 12) return;
    snapshot();
    nodes.push({ id:'n'+(uid++), kind:'line', title:'', sub:'', color:S.color,
      tcolor:null, scolor:null, fill:null, fs:1,
      x:Math.round(Math.min(x1,x2)), y:Math.round(Math.min(y1,y2)),
      w:Math.max(1, Math.round(Math.abs(x2-x1))), h:Math.max(1, Math.round(Math.abs(y2-y1))),
      flip: (x2-x1)*(y2-y1) < 0 });
    selectNodes([nodes[nodes.length-1].id], false);
    setTool('select', 'draw');
    render();
    return;
  }

  if (job.tool === 'arrow'){
    const from = job.from || nodeAt(a, 26) || nearest(a, 90);
    const to = nodeAt(end, 26) || nearest(end, 90) || job.target;
    if (!from || !to || from === to){
      if (Math.hypot(end.x-a.x, end.y-a.y) < 16) return;
      snapshot();
      nodes.push({ id:'n'+(uid++), kind:'arrow', title:'', sub:'', color:S.color,
        tcolor:null, scolor:null, fill:null, fs:1,
        x:Math.round(Math.min(a.x,end.x)), y:Math.round(Math.min(a.y,end.y)),
        w:Math.max(1, Math.round(Math.abs(end.x-a.x))),
        h:Math.max(1, Math.round(Math.abs(end.y-a.y))),
        flip: (end.x-a.x)*(end.y-a.y) < 0 });
      selectNodes([nodes[nodes.length-1].id], false);
      setTool('select', 'draw');
      render();
      return;
    }
    const na1 = nearestAnchor(from, a), na2 = nearestAnchor(to, end);
    const dup = links.find(l => l.from === from.id && l.to === to.id &&
      l.fromSide === na1.side && l.toSide === na2.side &&
      Math.abs((l.fromT == null ? 0.5 : l.fromT) - na1.t) < 0.1 &&
      Math.abs((l.toT == null ? 0.5 : l.toT) - na2.t) < 0.1);
    if (dup){ selectLink(dup.id); render(); return; }
    snapshot();
    links.push({ id:'k'+(uid++), from:from.id, to:to.id, color:null, motion:null,
      label:'', way:null, head:true,
      fromSide: job.side || na1.side,
      fromT: job.side ? (job.sideT == null ? 0.5 : job.sideT) : na1.t,
      toSide: na2.side,
      toT: na2.t });
    render();
    return;
  }

  if (Math.hypot(end.x-a.x, end.y-a.y) < 14) return;

  const [dw, dh] = SIZE[job.tool];
  let w = Math.abs(end.x-a.x), h = Math.abs(end.y-a.y);
  if (w < 40 || h < 28){ w = dw; h = dh; }
  snapshot();
  const n = { id:'n'+(uid++), kind:job.tool, title:'', sub:'', color:S.color,
    tcolor:S.tcolor, scolor:S.scolor, fs:1,
    x:Math.round(Math.min(a.x, end.x)), y:Math.round(Math.min(a.y, end.y)),
    w:Math.round(w), h:Math.round(h) };
  nodes.push(n);
  selectNodes([n.id], false);
  setTool('select', 'draw');
  render();
  editNode(n);
}

