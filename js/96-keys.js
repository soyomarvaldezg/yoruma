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
  }
  if (e.key === 'Escape'){
    if (pickerEl.classList.contains('on')){ closeLogoPicker(); return; }
    if (document.body.classList.contains('present')){ setPresent(false); return; }
    clearSel(); setTool('select', 'draw'); render();
    return;
  }
  if (e.key === '?' ){ helpEl.classList.toggle('on'); return; }
  if ((e.key === 'l' || e.key === 'L') && document.body.classList.contains('present')){
    toggleLegend(); return;
  }
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
  if (meta) return;

  if (e.key === 'f' || e.key === 'F'){ fit(); save(); return; }
  if (e.key === 'm' || e.key === 'M'){ setMotion('next'); return; }
  if (e.key === '['){ bumpFont(-0.1); return; }
  if (e.key === ']'){ bumpFont(0.1); return; }
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
  const t = all.find(t => t.key === e.key.toLowerCase());
  if (t){ if (t.pick) fileInput.click(); else setTool(t.id, DRAW.includes(t) ? 'draw' : 'data'); }
});

window.__y = {
  S, toWorld, toScreen, render, save, undo, redo, snapshot, setTool, setMotion,
  duplicateSelection, reorderSelection,
  get nodes(){ return nodes; }, get links(){ return links; },
  get handles(){ return handles; }, get motionEls(){ return motionEls; },
  byId, anchors, route, midPoint
};

