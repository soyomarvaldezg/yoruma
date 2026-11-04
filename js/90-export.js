/* ---------- export ---------- */
const menu = document.getElementById('menu');
document.getElementById('btn-file').addEventListener('click', ev => {
  ev.stopPropagation(); menu.classList.toggle('on');
});
menu.addEventListener('click', ev => ev.stopPropagation());
document.addEventListener('click', () => menu.classList.remove('on'));

function diagramId(n){
  return 'n_' + String(n.id).replace(/[^a-zA-Z0-9]/g, '_');
}
function diagramSkip(n){
  return n.kind === 'zone' || n.kind === 'frame';
}
function mermaidLabel(t){
  return String(t == null ? '' : t)
    .replace(/["\[\]{}|<>`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function mermaid(){
  const lines = ['flowchart LR'];
  nodes.forEach(n => {
    if (diagramSkip(n)) return;
    const t = mermaidLabel(n.title), s = mermaidLabel(n.sub);
    const label = t + (s ? '<br/>' + s : '');
    const wrap = n.kind === 'store' ? `[("${label}")]`
      : n.kind === 'queue' ? `[["${label}"]]`
      : n.kind === 'cloud' ? `("${label}")`
      : n.kind === 'people' ? `(["${label}"])` : `["${label}"]`;
    lines.push('  ' + diagramId(n) + wrap);
  });
  links.forEach(l => {
    const a = byId(l.from), b = byId(l.to);
    if (!a || !b || diagramSkip(a) || diagramSkip(b)) return;
    const lab = mermaidLabel(l.label);
    lines.push('  ' + diagramId(a) + ' -->' + (lab ? '|' + lab + '|' : '') + ' ' + diagramId(b));
  });
  return lines.join('\n');
}
function d2(){
  const map = { store:'cylinder', queue:'queue', cloud:'cloud', file:'document',
    people:'person', ellipse:'oval', dashboard:'stored_data', cube:'package',
    shield:'diamond', api:'hexagon' };
  const out = ['direction: right', ''];
  nodes.forEach(n => {
    if (diagramSkip(n)) return;
    const label = mermaidLabel(n.title).replace(/"/g, "'");
    const sub = n.sub ? '\\n' + mermaidLabel(n.sub).replace(/"/g, "'") : '';
    const t = map[n.kind];
    out.push(`${diagramId(n)}: "${label}${sub}"${t ? ` { shape: ${t} }` : ''}`);
  });
  links.forEach(l => {
    const a = byId(l.from), b = byId(l.to);
    if (!a || !b || diagramSkip(a) || diagramSkip(b)) return;
    const lab = mermaidLabel(l.label).replace(/"/g, "'");
    out.push(`${diagramId(a)} -> ${diagramId(b)}${lab ? ': "' + lab + '"' : ''}`);
  });
  return out.join('\n');
}
function docJSON(){
  return JSON.stringify({
    format:'yoruma', version:1, savedAt:new Date().toISOString(),
    motion:S.motion, view:{ x:view.x, y:view.y, k:view.k }, nodes, links
  }, null, 2);
}

