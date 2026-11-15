/* ---------- lint: overflow, crossings, labels, overlaps, density ---------- */
const LINT_SKIP = new Set(['zone', 'frame', 'line', 'arrow']);
let lintList = [], lintTimer = null, lintPick = 0;

function segRectLen(x1, y1, x2, y2, r){
  const dx = x2 - x1, dy = y2 - y1;
  let t0 = 0, t1 = 1;
  const P = [-dx, dx, -dy, dy];
  const Q = [x1 - r.x, r.x + r.w - x1, y1 - r.y, r.y + r.h - y1];
  for (let i = 0; i < 4; i++){
    if (P[i] === 0){ if (Q[i] < 0) return 0; continue; }
    const t = Q[i] / P[i];
    if (P[i] < 0){ if (t > t1) return 0; if (t > t0) t0 = t; }
    else { if (t < t0) return 0; if (t < t1) t1 = t; }
  }
  return Math.hypot(dx * (t1 - t0), dy * (t1 - t0));
}

function textIssues(){
  const out = [];
  stage.querySelectorAll('[data-role="title"], [data-role="sub"]').forEach(el => {
    let g = el.parentNode;
    while (g && g !== stage && !g.hasAttribute('data-id')) g = g.parentNode;
    if (!g || g === stage) return;
    const n = byId(g.getAttribute('data-id'));
    if (!n || n.kind === 'logo') return;
    const label = n.title || n.kind;
    let cut = false;
    el.querySelectorAll('tspan').forEach(sp => {
      if (/…$/.test(sp.textContent)){
        out.push({ id:n.id, type:'text', link:false,
          msg: label + ': text is cut off' });
        cut = true;
      }
    });
    if (cut) return;
    const bb = el.getBBox();
    if (!bb.width && !bb.height) return;
    const T = 2;
    if (bb.x < n.x - T || bb.y < n.y - T ||
        bb.x + bb.width > n.x + n.w + T || bb.y + bb.height > n.y + n.h + T)
      out.push({ id:n.id, type:'text', link:false,
        msg: label + ': text runs outside the shape' });
  });
  return out;
}

function crossIssues(){
  const out = [];
  const pad = 4, deep = 8;
  links.forEach(l => {
    const a = byId(l.from), b = byId(l.to);
    if (!a || !b) return;
    const pts = route(a, b, bendsOf(l), l);
    let blocker = null;
    for (const n of nodes){
      if (n === a || n === b || LINT_SKIP.has(n.kind)) continue;
      const r = { x:n.x + pad, y:n.y + pad, w:n.w - pad*2, h:n.h - pad*2 };
      if (r.w <= 0 || r.h <= 0) continue;
      for (let i = 1; i < pts.length; i++){
        if (segRectLen(pts[i-1][0], pts[i-1][1], pts[i][0], pts[i][1], r) > deep){
          blocker = n;
          break;
        }
      }
      if (blocker) break;
    }
    if (blocker) out.push({ id:l.id, type:'cross', link:true,
      msg: 'arrow ' + (a.title || a.kind) + ' → ' + (b.title || b.kind) +
        ' crosses ' + (blocker.title || blocker.kind) });
  });
  return out;
}

function overlapIssues(){
  const out = [];
  const drawn = nodes.filter(n => !LINT_SKIP.has(n.kind) &&
    n.kind !== 'heading' && n.kind !== 'text');
  if (drawn.length > 600) return out;
  for (let i = 0; i < drawn.length; i++){
    for (let j = i + 1; j < drawn.length; j++){
      const a = drawn[i], b = drawn[j];
      const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
      const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      if (ox <= 4 || oy <= 4) continue;
      out.push({ id:a.id, type:'overlap', link:false,
        msg: (a.title || a.kind) + ' overlaps ' + (b.title || b.kind) });
    }
  }
  return out;
}

function labelIssues(){
  const out = [];
  links.forEach(l => {
    if (!l.label) return;
    const a = byId(l.from), b = byId(l.to);
    if (!a || !b) return;
    const pts = route(a, b, bendsOf(l), l);
    const m = midPoint(pts);
    const vertical = Math.abs(pts[pts.length-1][0] - pts[0][0]) <
                     Math.abs(pts[pts.length-1][1] - pts[0][1]);
    const k = l.fs || 1;
    const lines = wrapLines(l.label, (vertical ? 130 : 210)*k, 14*k, false, 4);
    const h = lines.length * 17*k;
    const x = vertical ? m.x + 12*k : m.x;
    const y = vertical ? m.y + 4*k - (lines.length - 1)*17*k/2
                       : m.y - 6*k - (lines.length - 1)*17*k;
    const cx = x, cy = y - h/2;
    for (const n of nodes){
      if (n === a || n === b || LINT_SKIP.has(n.kind)) continue;
      if (cx > n.x && cx < n.x + n.w && cy > n.y && cy < n.y + n.h){
        out.push({ id:l.id, type:'label', link:true,
          msg: 'label “' + l.label + '” sits on ' + (n.title || n.kind) });
        break;
      }
    }
  });
  return out;
}

const LINT_DENSE = 24;
function densityIssues(){
  const count = nodes.filter(n => !LINT_SKIP.has(n.kind) &&
    n.kind !== 'heading' && n.kind !== 'text').length;
  if (count <= LINT_DENSE) return [];
  return [{ id:null, type:'dense', link:false,
    msg: count + ' shapes in one diagram; split it into pages' }];
}

function lintIssues(){
  return textIssues().concat(crossIssues(), labelIssues(), overlapIssues(), densityIssues());
}

function syncLint(){
  const chip = document.getElementById('lint-chip');
  if (!chip) return;
  lintList = lintIssues();
  if (!lintList.length){
    chip.hidden = true;
    chip.textContent = '';
    chip.title = '';
    return;
  }
  chip.hidden = false;
  chip.textContent = 'LINT · ' + lintList.length;
  chip.title = lintList.map(i => i.msg).join('\n');
}

function lintSoon(){
  if (lintTimer) clearTimeout(lintTimer);
  lintTimer = setTimeout(() => { lintTimer = null; syncLint(); }, 250);
}

document.getElementById('lint-chip').addEventListener('click', () => {
  if (!lintList.length) return;
  const it = lintList[lintPick % lintList.length];
  lintPick++;
  if (it.link) selectLink(it.id);
  else if (it.id) selectNodes([it.id], false);
  render();
  toast(it.msg, 2600);
});

if (document.fonts && document.fonts.ready)
  document.fonts.ready.then(syncLint).catch(() => {});
