/* ---------- keys ---------- */
window.addEventListener('keydown', e => {
  if (editableTarget(e.target)) return;
  if (document.body.classList.contains('present')){
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' ||
        e.key === 'PageDown'){
      e.preventDefault(); stepPresent(1); return;
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp'){
      e.preventDefault(); stepPresent(-1); return;
    }
    if (/^[0-9]$/.test(e.key)){
      e.preventDefault();
      showStep(e.key === '0' ? 0 : Number(e.key));
      return;
    }
  }
  if (e.key === 'Escape'){
    if (S.sticky){ S.sticky = false; document.body.dataset.sticky = '0'; }
    const ink = viewport.querySelectorAll('.laser, .ink');
    if (ink.length){
      ink.forEach(el => el.remove());
      inked = [];
      laser = null;
      saveInk();
      return;
    }
    if (spotId){ spotId = null; render(); return; }
    if (document.body.classList.contains('present')){ setPresent(false); return; }
    clearSel(); setTool('select', 'draw'); render();
    return;
  }
  if (!e.metaKey && !e.ctrlKey && e.key.toLowerCase() === 'w'){
    if (S.sticky){ S.sticky = false; document.body.dataset.sticky = '0'; }
    const only = S.selNodes.length === 1 ? byId(S.selNodes[0]) : null;
    if (spotId){ spotId = null; toast('focus off'); }
    else if (only){ spotId = only.id; toast('focus on ' + (only.title || only.kind)); }
    else { toast('select one shape to focus on it'); return; }
    render();
    return;
  }
  if (e.key === 'Enter' && S.selNodes.length === 1 && !S.selLinks.length){
    const n = byId(S.selNodes[0]);
    if (n && n.kind !== 'frame'){ e.preventDefault(); editNode(n); return; }
  }
  if (e.key === '?' ){ helpEl.classList.toggle('on'); return; }
  const meta = e.metaKey || e.ctrlKey;
  if (meta && (e.key.toLowerCase() === 'b' || e.key.toLowerCase() === 'i')){
    e.preventDefault();
    if (!S.selNodes.length) return;
    snapshot();
    const prop = e.key.toLowerCase() === 'b' ? 'bold' : 'italic';
    const on = !nodes.find(n => n.id === S.selNodes[0])[prop];
    nodes.filter(n => S.selNodes.includes(n.id)).forEach(n => n[prop] = on);
    render();
    return;
  }
  if (meta && e.key.toLowerCase() === 'a'){
    e.preventDefault();
    S.selNodes = nodes.filter(n => n.kind !== 'frame').map(n => n.id); S.selLinks = [];
    render();
    return;
  }
  if (meta && e.shiftKey && (e.key === ']' || e.key === '}')){
    e.preventDefault(); reorderSelection(true); return;
  }
  if (meta && e.shiftKey && (e.key === '[' || e.key === '{')){
    e.preventDefault(); reorderSelection(false); return;
  }
  if (meta && !e.shiftKey && e.key.toLowerCase() === 'd'){
    e.preventDefault(); duplicateSelection(); return;
  }
  if (meta && e.shiftKey && e.key.toLowerCase() === 'z'){ e.preventDefault(); redo(); return; }
  if (meta && e.key.toLowerCase() === 'y'){ e.preventDefault(); redo(); return; }
  if (meta && e.key.toLowerCase() === 'z'){ e.preventDefault(); undo(); return; }
  if (e.altKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')){
    e.preventDefault();
    const i = pages.findIndex(p => p.id === pageId);
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    switchPage(pages[(i + dir + pages.length) % pages.length].id);
    return;
  }
  if (meta && e.key === '.'){ e.preventDefault(); togglePanel(); return; }
  if (meta) return;

  if (e.key === 'f' || e.key === 'F'){ fit(); save(); return; }
  if (e.shiftKey && !e.altKey && e.key.toLowerCase() === 'p'){
    setPresent(!document.body.classList.contains('present'));
    return;
  }
  if (e.shiftKey && !e.altKey && !document.body.classList.contains('present') &&
      e.key.toLowerCase() === 's'){ addStep(); return; }
  if (!e.shiftKey && !e.altKey && !document.body.classList.contains('present') &&
      e.key.toLowerCase() === 's'){
    document.getElementById('btn-steps').click();
    const menu = document.getElementById('steps-menu');
    if (menu.classList.contains('on')){
      const first = menu.querySelector('button');
      if (first) first.focus();
    }
    return;
  }
  if (e.shiftKey && e.key.toLowerCase() === 'm'){ toggleMinimap(); return; }
  if (e.key === 'm' || e.key === 'M'){ setMotion('next'); return; }
  if (e.key === '['){ bumpFont(-0.1); return; }
  if (e.key === ']'){ bumpFont(0.1); return; }
  if ((e.key === '<' || e.key === '>') && S.selNodes.length === 1){
    if (stepSpeed(byId(S.selNodes[0]), e.key === '>' ? 1 : -1)) return;
  }
  if (e.key === ','){ setDotSize(-0.5); return; }
  if (e.key === '.'){ setDotSize(0.5); return; }

  if (e.key === 'Backspace' || e.key === 'Delete'){
    e.preventDefault();
    if (!S.selNodes.length && !S.selLinks.length) return;
    snapshot();
    if (S.selNodes.length){
      const kill = new Set(S.selNodes);
      nodes = nodes.filter(n => !kill.has(n.id));
      links = links.filter(l => !kill.has(l.from) && !kill.has(l.to));
      pruneSteps();
    }
    if (S.selLinks.length){
      const kill = new Set(S.selLinks);
      links = links.filter(l => !kill.has(l.id));
    }
    clearSel();
    render();
    return;
  }
  if (e.repeat) return;
  const all = DRAW.concat(DATA);
  const sameKey = all.filter(x => x.key === e.key.toLowerCase());
  const t = sameKey.length > 1 && e.shiftKey
    ? sameKey[sameKey.length - 1] : sameKey[0];
  if (t){
    if (!t.pick && S.tool === t.id){
      S.sticky = !S.sticky;
      document.body.dataset.sticky = S.sticky ? '1' : '0';
      toast(S.sticky ? t.label + ' stays armed — press ' + t.key.toUpperCase() +
                        ' again for one shape'
                     : t.label + ' arms for one shape');
      return;
    }
    S.sticky = false;
    document.body.dataset.sticky = '0';
    if (t.pick) fileInput.click();
    else setTool(t.id, DRAW.includes(t) ? 'draw' : 'data');
  }
});

window.__y = {
  S, toWorld, toScreen, render, save, undo, redo, snapshot, setTool, setMotion,
  duplicateSelection, reorderSelection,
  get nodes(){ return nodes; }, get links(){ return links; },
  get handles(){ return handles; }, get motionEls(){ return motionEls; },
  byId, anchors, route, midPoint
};

