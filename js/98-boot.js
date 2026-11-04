/* ---------- boot ---------- */
const restored = restore();
if (!restored) loadDemo();
setTool('select', 'draw');
render();
showRecovery();
requestAnimationFrame(() => {
  if (restored) applyView(); else fit();
});
requestAnimationFrame(tick);

