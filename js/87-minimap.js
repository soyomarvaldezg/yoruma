/* ---------- minimap ----------
   A thumbnail of the current page with the viewport on it. It appears by
   itself when the diagram is larger than the screen, and the button (or
   Shift+M) cycles auto, on and off. */
const MAP_KEY = 'yoruma.map.v1';
const MAP_W = 200, MAP_H = 132, MAP_PAD = 7;
const mapEl = document.getElementById('minimap');
const mapCanvas = document.getElementById('minimap-canvas');
const mapCtx = mapCanvas.getContext('2d');
const MAP_DPR = Math.min(2, window.devicePixelRatio || 1);
mapCanvas.width = MAP_W * MAP_DPR;
mapCanvas.height = MAP_H * MAP_DPR;
mapCtx.setTransform(MAP_DPR, 0, 0, MAP_DPR, 0, 0);
/* The scene is painted once into an offscreen canvas; every pan only blits it
   and draws the viewport rectangle. DOM shapes cost a style recalc per render,
   which at 400 shapes was more than the render itself. */
const mapScene = document.createElement('canvas');
mapScene.width = mapCanvas.width;
mapScene.height = mapCanvas.height;
const mapSceneCtx = mapScene.getContext('2d');
mapSceneCtx.setTransform(MAP_DPR, 0, 0, MAP_DPR, 0, 0);
const mapBtn = document.getElementById('z-map');
let mapMode = 'auto';
try {
  const saved = localStorage.getItem(MAP_KEY);
  if (saved === 'auto' || saved === 'on' || saved === 'off') mapMode = saved;
} catch (e){}
let mapBox = null, mapK = 1, mapOX = 0, mapOY = 0;
let mapSig = 0, mapBuilt = 0, mapDragging = false;
let mapCounts = { nodes: 0, links: 0 };
let mapViewRect = { x: 0, y: 0, w: 0, h: 0 };
/* Reading the stage rect forces layout; at 400 shapes that cost more than the
   render. The size only changes with the window or the left panel. */
let mapStageSize = null;
function stageSize(){
  if (!mapStageSize){
    const r = stage.getBoundingClientRect();
    mapStageSize = { w: r.width, h: r.height };
  }
  return mapStageSize;
}

function mapVisible(box){
  if (document.body.classList.contains('present')) return false;
  if (!nodes.length) return false;
  if (window.innerWidth < 820 || window.innerHeight < 520) return false;
  if (mapMode === 'off') return false;
  if (mapMode === 'on') return true;
  const b = box || contentBBox();
  const s = stageSize();
  return b.w > s.w - 6 || b.h > s.h - 6;
}

/* A number, not a string: at 400 shapes the concatenation alone cost more
   than the whole render. Only ids, kinds and rounded geometry go in. */
function mapSignature(){
  let h = 2166136261;
  const mix = v => {
    const s = v == null ? '' : String(v);
    for (let i = 0; i < s.length; i++){
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    h ^= 31;
    h = Math.imul(h, 16777619);
  };
  mix(pageId); mix(nodes.length); mix(links.length);
  for (const n of nodes){
    mix(n.id); mix(n.kind); mix(Math.round(n.x)); mix(Math.round(n.y));
    mix(Math.round(n.w)); mix(Math.round(n.h)); mix(n.color); mix(n.fill);
  }
  for (const l of links){ mix(l.from); mix(l.to); }
  return h >>> 0;
}

function mapX(x){ return mapOX + x*mapK; }
function mapY(y){ return mapOY + y*mapK; }

function mapRect(n){
  return {
    x: mapX(n.x), y: mapY(n.y),
    w: Math.max(1.5, n.w*mapK), h: Math.max(1.5, n.h*mapK)
  };
}

function buildMinimap(box){
  const b = box || contentBBox();
  const w = Math.max(1, b.w), h = Math.max(1, b.h);
  mapK = Math.min((MAP_W - MAP_PAD*2)/w, (MAP_H - MAP_PAD*2)/h, 1);
  mapOX = (MAP_W - w*mapK)/2 - b.x*mapK;
  mapOY = (MAP_H - h*mapK)/2 - b.y*mapK;
  mapBox = b;

  const ctx = mapSceneCtx;
  ctx.clearRect(0, 0, MAP_W, MAP_H);

  nodes.forEach(n => {
    if (n.kind !== 'zone' && n.kind !== 'frame') return;
    const r = mapRect(n);
    ctx.fillStyle = 'rgba(101,116,134,.13)';
    ctx.strokeStyle = 'rgba(101,116,134,.45)';
    ctx.lineWidth = 0.8;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeRect(r.x, r.y, r.w, r.h);
  });

  let lineCount = 0;
  ctx.beginPath();
  links.forEach(l => {
    const a = byId(l.from), z = byId(l.to);
    if (!a || !z) return;
    ctx.moveTo(mapX(a.x + a.w/2), mapY(a.y + a.h/2));
    ctx.lineTo(mapX(z.x + z.w/2), mapY(z.y + z.h/2));
    lineCount++;
  });
  ctx.strokeStyle = 'rgba(124,140,160,.7)';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  let nodeCount = 0;
  nodes.forEach(n => {
    if (n.kind === 'zone' || n.kind === 'frame') return;
    if (n.kind === 'text' || n.kind === 'heading') return;
    if (String(n.id).startsWith('doc-')) return;
    const r = mapRect(n);
    ctx.fillStyle = (n.kind === 'tile' ? tileHue(n) : colorAt(n.color)) || '#9FB0BE';
    if (n.kind === 'ellipse' || n.kind === 'people'){
      ctx.beginPath();
      ctx.ellipse(r.x + r.w/2, r.y + r.h/2, r.w/2, r.h/2, 0, 0, Math.PI*2);
      ctx.fill();
    } else {
      ctx.fillRect(r.x, r.y, r.w, r.h);
    }
    nodeCount++;
  });

  mapCounts = { nodes: nodeCount, links: lineCount };
  drawMinimapView();
}

function drawMinimapView(){
  if (!mapBox) return;
  const s = stageSize();
  const x = mapX(-view.x/view.k), y = mapY(-view.y/view.k);
  const w = (s.w/view.k)*mapK, h = (s.h/view.k)*mapK;
  const x1 = Math.max(0, x), y1 = Math.max(0, y);
  const x2 = Math.min(MAP_W, x + w), y2 = Math.min(MAP_H, y + h);
  mapViewRect = { x: x1, y: y1,
    w: Math.max(1, x2 - x1), h: Math.max(1, y2 - y1) };

  mapCtx.clearRect(0, 0, MAP_W, MAP_H);
  mapCtx.drawImage(mapScene, 0, 0, MAP_W, MAP_H);
  mapCtx.fillStyle = 'rgba(8,130,156,.12)';
  mapCtx.strokeStyle = '#08829C';
  mapCtx.lineWidth = 1.2;
  mapCtx.fillRect(mapViewRect.x, mapViewRect.y, mapViewRect.w, mapViewRect.h);
  mapCtx.strokeRect(mapViewRect.x, mapViewRect.y, mapViewRect.w, mapViewRect.h);
}

function syncMinimap(){
  /* Panning only moves the viewport, so skip the O(n) scan and the hash and
     just blit the scene with the new rectangle. */
  if (document.body.classList.contains('panning')){
    if (!mapEl.classList.contains('off')) drawMinimapView();
    return;
  }
  const box = nodes.length ? contentBBox() : null;
  const want = mapVisible(box);
  mapEl.classList.toggle('off', !want);
  if (mapBtn){
    const lit = want && mapMode !== 'off';
    mapBtn.classList.toggle('on', lit);
    mapBtn.setAttribute('aria-pressed', lit ? 'true' : 'false');
    mapBtn.title = 'Minimap: ' + mapMode + ' (click to ' + (want ? 'hide' : 'show') +
      ', ⌥click for auto)';
  }
  if (!want) return;
  const sig = mapSignature();
  const now = performance.now();
  const busy = (typeof drag !== 'undefined' && drag) ||
    (typeof resize !== 'undefined' && resize);
  if (!mapBox || (sig !== mapSig && (!busy || now - mapBuilt > 120))){
    mapSig = sig;
    mapBuilt = now;
    buildMinimap(box);
  }
  drawMinimapView();
}

function mapJump(ev){
  if (!mapBox) return;
  const r = mapCanvas.getBoundingClientRect();
  if (!r.width || !r.height) return;
  const px = (ev.clientX - r.left) * MAP_W / r.width;
  const py = (ev.clientY - r.top) * MAP_H / r.height;
  const wx = (px - mapOX)/mapK, wy = (py - mapOY)/mapK;
  const s = stage.getBoundingClientRect();
  view.x = s.width/2 - wx*view.k;
  view.y = s.height/2 - wy*view.k;
  applyView();
}

function setMapMode(mode){
  mapMode = mode;
  try { localStorage.setItem(MAP_KEY, mode); } catch (e){}
  syncMinimap();
}
function toggleMinimap(){
  if (document.body.classList.contains('present')) return;
  setMapMode(mapVisible() ? 'off' : 'on');
}

if (mapBtn) mapBtn.addEventListener('click', ev => {
  if (ev.altKey){ setMapMode('auto'); return; }
  toggleMinimap();
});
mapEl.addEventListener('pointerdown', ev => {
  if (ev.button !== 0) return;
  ev.preventDefault();
  mapDragging = true;
  try { mapEl.setPointerCapture(ev.pointerId); } catch (e){}
  mapJump(ev);
});
mapEl.addEventListener('pointermove', ev => { if (mapDragging) mapJump(ev); });
const mapRelease = ev => {
  if (!mapDragging) return;
  mapDragging = false;
  try { mapEl.releasePointerCapture(ev.pointerId); } catch (e){}
  save();
};
mapEl.addEventListener('pointerup', mapRelease);
mapEl.addEventListener('pointercancel', mapRelease);
window.addEventListener('resize', () => { mapStageSize = null; syncMinimap(); });
if (typeof ResizeObserver === 'function'){
  new ResizeObserver(() => { mapStageSize = null; syncMinimap(); })
    .observe(stage);
}
