(function () {
  var pet = document.querySelector('[data-vd-pet]');
  if (!pet) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var faces = ['is-happy', 'is-surprised', 'is-wink'];
  var next = 0;
  var blinkOff, faceOff;

  function reacting() {
    return faces.some(function (name) { return pet.classList.contains(name); });
  }

  function blink() {
    if (reduce.matches || reacting()) return;
    pet.classList.add('is-blink');
    clearTimeout(blinkOff);
    blinkOff = setTimeout(function () { pet.classList.remove('is-blink'); }, 120);
  }

  var initial = 0;
  function tick() {
    blink();
    initial += 1;
    setTimeout(tick, initial < 3 ? 550 : 1500);
  }
  tick();

  pet.addEventListener('click', function () {
    faces.forEach(function (name) { pet.classList.remove(name); });
    pet.classList.add(faces[next]);
    next = (next + 1) % faces.length;
    clearTimeout(faceOff);
    faceOff = setTimeout(function () {
      faces.forEach(function (name) { pet.classList.remove(name); });
    }, 1400);
  });
})();
