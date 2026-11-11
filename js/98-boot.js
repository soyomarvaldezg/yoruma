/* ---------- boot ---------- */
const restored = restore();
const wantDemo = /[?&](test|selftest)\b/.test(location.search);
if (!restored && wantDemo) loadDemo();
loadInk();
try { if (localStorage.getItem(PANEL_KEY) === '0') togglePanel(false); } catch (e){}
setTool('select', 'draw');
renderPages();
render();
showRecovery();
requestAnimationFrame(() => {
  if (restored || nodes.length) applyView();
  else fit();
});
requestAnimationFrame(tick);


