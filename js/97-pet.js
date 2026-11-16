/* ---------- pet ---------- */
(function () {
  const pet = document.querySelector('[data-yoruma-pet]');
  if (!pet) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const faces = ['is-happy', 'is-surprised', 'is-wink'];
  let next = 0;
  let blinkOff = 0;
  let faceOff = 0;

  function reacting() {
    return faces.some(name => pet.classList.contains(name));
  }

  function blink() {
    if (reduce.matches || reacting()) return;
    pet.classList.add('is-blink');
    clearTimeout(blinkOff);
    blinkOff = setTimeout(() => pet.classList.remove('is-blink'), 120);
  }

  let initial = 0;
  function tick() {
    blink();
    initial += 1;
    setTimeout(tick, initial < 3 ? 550 : 1500);
  }
  tick();

  pet.addEventListener('click', () => {
    faces.forEach(name => pet.classList.remove(name));
    pet.classList.add(faces[next]);
    next = (next + 1) % faces.length;
    clearTimeout(faceOff);
    faceOff = setTimeout(() => faces.forEach(name => pet.classList.remove(name)), 1400);
  });
})();
