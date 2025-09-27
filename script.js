// Año en footer
document.getElementById('year').textContent = new Date().getFullYear();

// Hide-on-scroll del header
(function(){
  const header = document.getElementById('site-header');
  let lastY = window.scrollY;
  let ticking = false;

  function onScroll(){
    const y = window.scrollY;
    const goingDown = y > lastY && y > 24;
    header.classList.toggle('hide', goingDown);
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking){ requestAnimationFrame(onScroll); ticking = true; }
  }, {passive:true});
})();

// Orb miel: movimiento horizontal derecha→izquierda al hacer scroll.
// Queda detrás del contenido.
(function(){
  const orb = document.getElementById('bg-orb');
  if (!orb) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const baseTop = 18;         // vh
  const baseLeftVW = 60;      // vw inicial
  const travelVW = 120;       // cuánto viaja hacia la izquierda

  function update(){
    const y = window.scrollY || 0;
    // progreso suave y limitado
    const p = Math.min(1, y / 1600);
    // derecha (60vw) → izquierda (-60vw)
    const left = baseLeftVW - travelVW * p;
    // ligero paralaje vertical
    const top = baseTop + p * 6;
    // micro-escala
    const scale = 1 + p * 0.06;

    orb.style.left = `${left}vw`;
    orb.style.top = `${top}vh`;
    orb.style.transform = `scale(${scale})`;
  }

  update();
  window.addEventListener('scroll', () => requestAnimationFrame(update), {passive:true});
  window.addEventListener('resize', () => requestAnimationFrame(update));
})();

// Aparición de bloques al entrar al viewport
(function(){
  const els = [...document.querySelectorAll('.section, .card, .story, .spec, .hero-copy, .hero-media')];
  els.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, {threshold:.12});
  els.forEach(el => io.observe(el));
})();

