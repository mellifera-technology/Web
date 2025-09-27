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

// Pelota miel: parallax + leve escala + saturación con scroll
(function(){
  const ball = document.getElementById('honey-ball');
  if (!ball) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  ball.classList.add('motion');

  const maxShift = 180;   // px vertical
  const maxScale = 1.12;  // leve zoom
  const maxSat   = 1.15;  // leve saturación

  function update(){
    const y = window.scrollY || 0;
    // progreso suave con techo
    const p = Math.min(1, y / 900);
    const ty = p * maxShift;
    const sc = 1 + p * (maxScale - 1);
    const sat = 1 + p * (maxSat - 1);
    ball.style.transform = `translateY(${ty}px) scale(${sc})`;
    ball.style.filter = `saturate(${sat})`;
  }

  update();
  window.addEventListener('scroll', () => requestAnimationFrame(update), {passive:true});
  window.addEventListener('resize', () => requestAnimationFrame(update));
})();

// Aparición de secciones
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
