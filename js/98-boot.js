/* ---------- boot ---------- */
const restored = restore();
const wantDemo = /[?&](test|selftest|demo)\b/.test(location.search);
if (!restored && wantDemo) loadDemo();
setTool('select', 'draw');
render();
showRecovery();
requestAnimationFrame(() => {
  if (restored || nodes.length) applyView();
  else fit();
});
requestAnimationFrame(tick);

