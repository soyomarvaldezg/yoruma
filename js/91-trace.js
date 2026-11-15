/* ---------- trace ---------- */
function traceIndex(){
  const incoming = new Map(), outgoing = new Map();
  links.forEach(l => {
    const a = byId(l.from), b = byId(l.to);
    if (!a || !b || a.kind === 'frame' || b.kind === 'frame') return;
    if (!outgoing.has(l.from)) outgoing.set(l.from, []);
    if (!incoming.has(l.to)) incoming.set(l.to, []);
    outgoing.get(l.from).push(l);
    incoming.get(l.to).push(l);
  });
  return { incoming, outgoing };
}

function traceWalk(id, dir, depth){
  const { incoming, outgoing } = traceIndex();
  const nodesSet = new Set([id]);
  const linksSet = new Set();
  const dist = new Map([[id, 0]]);
  const max = depth > 0 ? depth : Infinity;
  let frontier = [id];
  while (frontier.length){
    const next = [];
    for (const cur of frontier){
      const d = dist.get(cur) || 0;
      if (d >= max) continue;
      const edges = [];
      if (dir !== 'down') edges.push(...(incoming.get(cur) || []));
      if (dir !== 'up') edges.push(...(outgoing.get(cur) || []));
      for (const l of edges){
        const other = l.to === cur ? l.from : l.to;
        if (!other) continue;
        linksSet.add(l.id);
        nodesSet.add(other);
        if (!dist.has(other)){ dist.set(other, d + 1); next.push(other); }
      }
    }
    frontier = next;
  }
  let hops = 0;
  dist.forEach(v => { if (v > hops) hops = v; });
  return { nodes:nodesSet, links:linksSet, hops };
}

function traceData(){
  if (!trace) return null;
  const origin = byId(trace.id);
  if (!origin || origin.kind === 'frame'){ trace = null; return null; }
  return traceWalk(trace.id, trace.dir, trace.depth);
}

function setTrace(dir, depth){
  const id = trace ? trace.id : (S.selNodes.length === 1 ? S.selNodes[0] : null);
  const n = id ? byId(id) : null;
  if (!n || n.kind === 'frame'){ toast('select one shape to trace'); return; }
  if (depth == null) depth = trace ? trace.depth : 3;
  trace = { id, dir, depth };
  spotId = null;
  render();
}

function syncTracebar(){
  const bar = document.getElementById('tracebar');
  if (!bar) return;
  const one = S.selNodes.length === 1 && !S.selLinks.length ? byId(S.selNodes[0]) : null;
  const visible = !document.body.classList.contains('present') &&
    (!!trace || (!!one && one.kind !== 'frame'));
  bar.classList.toggle('on', visible);
  if (!visible) return;
  const dir = trace ? trace.dir : 'both';
  const depth = trace ? trace.depth : 3;
  bar.querySelectorAll('[data-trace]').forEach(b => {
    b.classList.toggle('on', !!trace && b.dataset.trace === dir);
  });
  bar.querySelectorAll('[data-depth]').forEach(b => {
    b.classList.toggle('on', Number(b.dataset.depth) === depth);
  });
  const info = document.getElementById('trace-info');
  if (info){
    info.textContent = traceSet
      ? traceSet.nodes.size + ' shapes · ' + traceSet.hops +
        (traceSet.hops === 1 ? ' hop' : ' hops')
      : '';
  }
}

document.querySelectorAll('#tracebar [data-trace]').forEach(b => {
  b.addEventListener('click', () => {
    if (b.dataset.trace === 'off'){ trace = null; render(); return; }
    setTrace(b.dataset.trace);
  });
});
document.querySelectorAll('#tracebar [data-depth]').forEach(b => {
  b.addEventListener('click', () => {
    setTrace(trace ? trace.dir : 'both', Number(b.dataset.depth));
  });
});
