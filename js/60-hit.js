/* ---------- hit ---------- */
function zoneHit(n, p){
  const near = Math.abs(p.x-n.x) < 9 || Math.abs(p.x-(n.x+n.w)) < 9 ||
               Math.abs(p.y-n.y) < 9 || Math.abs(p.y-(n.y+n.h)) < 9;
  const inside = p.x > n.x && p.x < n.x+n.w && p.y > n.y && p.y < n.y+n.h;
  const label = p.x > n.x && p.x < n.x+n.w && p.y > n.y && p.y < n.y+28;
  return inside && (near || label);
}
function lineDist(n, p){
  const x1 = n.x, y1 = n.flip ? n.y+n.h : n.y;
  const x2 = n.x+n.w, y2 = n.flip ? n.y : n.y+n.h;
  const dx = x2-x1, dy = y2-y1;
  const t = Math.max(0, Math.min(1, ((p.x-x1)*dx + (p.y-y1)*dy) / ((dx*dx+dy*dy) || 1)));
  return Math.hypot(p.x - (x1 + t*dx), p.y - (y1 + t*dy));
}
function nodeAt(p, pad){
  pad = pad || 0;
  for (let i=nodes.length-1;i>=0;i--){
    const n = nodes[i];
    if (n.kind === 'zone' || n.kind === 'frame') continue;
    if (n.kind === 'line' || n.kind === 'arrow'){ if (lineDist(n, p) <= 9 + pad) return n; continue; }
    if (p.x >= n.x-pad && p.x <= n.x+n.w+pad && p.y >= n.y-pad && p.y <= n.y+n.h+pad) return n;
  }
  for (let i=nodes.length-1;i>=0;i--){
    const n = nodes[i];
    if (n.kind === 'zone' && zoneHit(n, p)) return n;
  }
  return null;
}
function nearest(p, max){
  let best = null, bd = max || 70;
  nodes.forEach(n => {
    if (n.kind === 'zone') return;
    const d = Math.hypot(n.x+n.w/2-p.x, n.y+n.h/2-p.y);
    if (d < bd){ bd = d; best = n; }
  });
  return best;
}
function edgePoint(n, side, t){
  const k = (t == null ? 0.5 : Math.max(0.04, Math.min(0.96, t)));
  if (side === 'n') return { x:n.x + n.w*k, y:n.y };
  if (side === 's') return { x:n.x + n.w*k, y:n.y+n.h };
  if (side === 'w') return { x:n.x, y:n.y + n.h*k };
  return { x:n.x+n.w, y:n.y + n.h*k };
}
function sideOut(n, side, p, OUT){
  if (side === 'n') return { x:p.x, y:n.y - OUT };
  if (side === 's') return { x:p.x, y:n.y + n.h + OUT };
  if (side === 'w') return { x:n.x - OUT, y:p.y };
  return { x:n.x + n.w + OUT, y:p.y };
}
function nearestAnchor(n, p){
  const cx = Math.max(n.x, Math.min(n.x+n.w, p.x));
  const cy = Math.max(n.y, Math.min(n.y+n.h, p.y));
  const dl = Math.abs(p.x - n.x), dr = Math.abs(p.x - (n.x+n.w));
  const dt = Math.abs(p.y - n.y), db = Math.abs(p.y - (n.y+n.h));
  const clamp = v => Math.max(0.08, Math.min(0.92, v));
  const m = Math.min(dl, dr, dt, db);
  if (m === dl) return { side:'w', t:clamp((cy - n.y) / Math.max(1,n.h)) };
  if (m === dr) return { side:'e', t:clamp((cy - n.y) / Math.max(1,n.h)) };
  if (m === dt) return { side:'n', t:clamp((cx - n.x) / Math.max(1,n.w)) };
  return { side:'s', t:clamp((cx - n.x) / Math.max(1,n.w)) };
}
function handleAt(p){
  for (const h of handles) if (Math.hypot(p.x-h.x, p.y-h.y) <= h.r) return h;
  return null;
}
const PAINT_LABEL = { line:'outline', text:'title', sub:'subtitle', tint:'tinted card' };
function pickTarget(ev, n, p){
  if (!n) return;
  if (n.kind === 'zone' || n.kind === 'line' || n.kind === 'arrow' || n.kind === 'image'){
    S.paint = 'line'; return;
  }
  const g = stage.querySelector(`g.node[data-id="${n.id}"]`);
  if (g && ev){
    const tEl = g.querySelector('[data-role="title"]');
    const sEl = g.querySelector('[data-role="sub"]');
    const rt = tEl && tEl.getBoundingClientRect();
    const rs = sEl && sEl.getBoundingClientRect();
    const inR = (r, pad) => r && ev.clientX >= r.left - pad && ev.clientX <= r.right + pad &&
                                  ev.clientY >= r.top - pad && ev.clientY <= r.bottom + pad;
    if (rt && rs){
      const top = inR(rt, 7), bot = inR(rs, 7);
      if (bot && !top){ S.paint = 'sub'; return; }
      if (top && !bot){ S.paint = 'text'; return; }
      if (top && bot){
        S.paint = ev.clientY > (rt.bottom + rs.top) / 2 ? 'sub' : 'text';
        return;
      }
      if (ev.clientY >= rt.top - 7 && ev.clientY <= rs.bottom + 7){
        S.paint = ev.clientY > (rt.bottom + rs.top) / 2 ? 'sub' : 'text';
        return;
      }
    } else if (rt && inR(rt, 8)){ S.paint = 'text'; return; }
    else if (rs && inR(rs, 8)){ S.paint = 'sub'; return; }
  }
  if (n.kind === 'text' || n.kind === 'heading'){ S.paint = 'text'; return; }
  const nearEdge = Math.min(Math.abs(p.x-n.x), Math.abs(p.x-(n.x+n.w)),
                            Math.abs(p.y-n.y), Math.abs(p.y-(n.y+n.h)));
  if (nearEdge < 10){ S.paint = 'line'; return; }
  S.paint = 'tint';
}
function selectNodes(ids, add){
  S.selLinks = [];
  S.selNodes = add ? Array.from(new Set([...S.selNodes, ...ids])) : ids.slice();
}
function selectLink(id){ S.selNodes = []; S.selLinks = [id]; }
function clearSel(){ S.selNodes = []; S.selLinks = []; }
function reorderSelection(toFront){
  if (!S.selNodes.length) return;
  snapshot();
  const sel = new Set(S.selNodes);
  const picked = nodes.filter(n => sel.has(n.id));
  const rest = nodes.filter(n => !sel.has(n.id));
  nodes = toFront ? rest.concat(picked) : picked.concat(rest);
  render();
}

let preview = null, previewTarget = null;
const clearPreview = () => {
  if (preview){ preview.remove(); preview = null; }
  if (previewTarget){ previewTarget.remove(); previewTarget = null; }
};

