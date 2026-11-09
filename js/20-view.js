/* ---------- view ---------- */
const stage = document.getElementById('stage');
const viewport = document.getElementById('viewport');
(function initGrid(){
  const ns = 'http://www.w3.org/2000/svg';
  const defs = document.createElementNS(ns, 'defs');
  const pat = document.createElementNS(ns, 'pattern');
  pat.setAttribute('id', 'grid');
  pat.setAttribute('width', '26');
  pat.setAttribute('height', '26');
  pat.setAttribute('patternUnits', 'userSpaceOnUse');
  const dot = document.createElementNS(ns, 'circle');
  dot.setAttribute('cx', '1.4');
  dot.setAttribute('cy', '1.4');
  dot.setAttribute('r', '1.4');
  dot.setAttribute('fill', INK);
  dot.setAttribute('opacity', '.11');
  pat.appendChild(dot);
  defs.appendChild(pat);
  const bg = document.createElementNS(ns, 'rect');
  bg.setAttribute('id', 'grid-bg');
  bg.setAttribute('x', '-6000');
  bg.setAttribute('y', '-6000');
  bg.setAttribute('width', '16000');
  bg.setAttribute('height', '16000');
  bg.setAttribute('fill', 'url(#grid)');
  bg.setAttribute('pointer-events', 'none');
  stage.insertBefore(bg, viewport);
  stage.insertBefore(defs, bg);
})();
function cap(ev){ try { stage.setPointerCapture(ev.pointerId); } catch (e){} }
const mk = (tag, attrs = {}) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  return e;
};
function applyView(){
  const tf = `translate(${view.x.toFixed(2)},${view.y.toFixed(2)}) scale(${view.k.toFixed(3)})`;
  viewport.setAttribute('transform', tf);
  const bgEl = document.getElementById('grid-bg');
  if (bgEl) bgEl.setAttribute('transform', tf);
  document.getElementById('z-pct').textContent = Math.round(view.k*100) + '%';
  if (typeof placeShaper === 'function') placeShaper();
  if (typeof placeLinkbar === 'function') placeLinkbar();
}
function toWorld(ev){
  const r = stage.getBoundingClientRect();
  return { x:(ev.clientX - r.left - view.x)/view.k, y:(ev.clientY - r.top - view.y)/view.k };
}
function toScreen(w){
  const r = stage.getBoundingClientRect();
  return { x: w.x*view.k + view.x + r.left, y: w.y*view.k + view.y + r.top };
}
function contentBBox(){
  if (!nodes.length) return { x:0, y:0, w:400, h:300 };
  return {
    x: Math.min(...nodes.map(n => n.x)),
    y: Math.min(...nodes.map(n => n.y)),
    w: Math.max(...nodes.map(n => n.x+n.w)) - Math.min(...nodes.map(n => n.x)),
    h: Math.max(...nodes.map(n => n.y+n.h)) - Math.min(...nodes.map(n => n.y))
  };
}
function fit(){
  const b = contentBBox();
  const r = stage.getBoundingClientRect();
  const pad = 28;
  const k = Math.min((r.width-pad*2)/Math.max(1,b.w), (r.height-pad*2)/Math.max(1,b.h), 1.4);
  view.k = Math.max(0.2, k);
  view.x = (r.width - b.w*view.k)/2 - b.x*view.k;
  view.y = (r.height - b.h*view.k)/2 - b.y*view.k;
  applyView();
}
function zoomAt(sx, sy, f){
  const k2 = Math.min(3, Math.max(0.2, view.k*f));
  const wx = (sx - view.x)/view.k, wy = (sy - view.y)/view.k;
  view.k = k2; view.x = sx - wx*k2; view.y = sy - wy*k2;
  applyView();
}
const zoomCenter = f => {
  const r = stage.getBoundingClientRect();
  zoomAt(r.width/2, r.height/2, f);
};

