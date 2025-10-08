// === EXISTENTE ===
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



// Aparición
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

// === NUEVO: AUTH + API ===

// 1) Pegá tu firebaseConfig EXACTA aquí:
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBH93vOKldh-IufVCZB1qyI6cRPoOr7iqw",
  authDomain: "mellifera-technology.firebaseapp.com",
  projectId: "mellifera-technology",
  storageBucket: "mellifera-technology.firebasestorage.app",
  messagingSenderId: "68043353319",
  appId: "1:68043353319:web:20a1aafde7b37d3457c642",
  measurementId: "G-FCW1E604DG"
};

// 2) URL base del backend (Worker) que vas a desplegar
const WORKER_BASE = "https://mellifera-worker.mellifera-tech.workers.dev/"; // <- reemplazar

// 3) Helpers UI
const $ = (id)=>document.getElementById(id);
const setText = (id, t)=>{ const el=$(id); if(el) el.textContent=t; };
const show = (id, v)=>{ const el=$(id); if(el) el.style.display = v ? '' : 'none'; };
const msg = (t)=> setText('msg', t||'');

// 4) Login / Registro / Google
$('btnRegister')?.addEventListener('click', async ()=>{
  try {
    const {user} = await auth.createUserWithEmailAndPassword($('email').value, $('pass').value);
    msg('Cuenta creada.');
  } catch(e){ msg(e.message); }
});
$('btnLogin')?.addEventListener('click', async ()=>{
  try {
    await auth.signInWithEmailAndPassword($('email').value, $('pass').value);
    msg('');
  } catch(e){ msg(e.message); }
});
$('btnGoogle')?.addEventListener('click', async ()=>{
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    await auth.signInWithPopup(provider);
    msg('');
  } catch(e){ msg(e.message); }
});
$('btnLogout')?.addEventListener('click', ()=> auth.signOut());

// 5) Llamadas al backend con ID token
async function callWorker(path, opts={}){
  const u = auth.currentUser;
  if(!u) throw new Error('No auth');
  const t = await u.getIdToken();
  const res = await fetch(`${WORKER_BASE}${path}`, {
    method: opts.method || 'GET',
    headers: { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  if(!res.ok){
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

// 6) Estado de sesión
auth.onAuthStateChanged(async (u)=>{
  if(!u){
    show('logged', false);
    setText('uEmail','');
    setText('uCode','—');
    $('tbl')?.querySelector('tbody').replaceChildren();
    return;
  }
  show('logged', true);
  setText('uEmail', u.email || '(sin email)');

  // 6.1 Asegurar usuario + código en Supabase vía Worker
  try{
    const { code } = await callWorker('/ensure_user', { method:'POST' });
    setText('uCode', code || '—');
  }catch(e){ msg(`ensure_user: ${e.message}`); }

  // 6.2 Cargar lecturas
try {
  const data = await callWorker('/readings?limit=200');
  const rows = (data.items || []).map(r => {
    const dt = new Date(r.ts);
    return `<tr>
      <td>${dt.toLocaleString()}</td>
      <td>${fmt(r.t_in)}</td>
      <td>${fmt(r.hr_in)}</td>
      <td>${fmt(r.t_out)}</td>
      <td>${fmt(r.hr_out)}</td>
    </tr>`;
  }).join('');
  $('tbl')?.querySelector('tbody').innerHTML = rows;
} catch(e) {
  msg(`readings: ${e.message}`);
}
const fmt = v => (v===null||v===undefined||Number.isNaN(+v)) ? '' : Number(v).toFixed(2);

// === BLOQUE FINAL DEFINITIVO: ANIMACIÓN GOTA DE MIEL ===
(function() {
  const orb = document.getElementById('bg-orb');
  const footer = document.querySelector('.footer');
  const solutionSection = document.getElementById('solucion');
  if (!orb || !footer || !solutionSection) {
    console.warn("⚠️ No se encontró bg-orb, footer o solucion");
    return;
  }

  function updatePosition() {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(scrollY / docHeight, 1);

    // movimiento horizontal (entra desde la derecha)
    const startX = window.innerWidth + 150;
    const endX = window.innerWidth / 2;
    const x = startX - (startX - endX) * progress;

    // movimiento vertical sutil
    const y = window.innerHeight / 2 + Math.sin(progress * Math.PI) * 100;

    // escala leve
    const scale = 1 + progress * 0.4;

    orb.style.left = `${x}px`;
    orb.style.top = `${y}px`;
    orb.style.transform = `translate(-50%, -50%) scale(${scale})`;

    // cambio de forma en "Solución"
    const solRect = solutionSection.getBoundingClientRect();
    if (solRect.top < window.innerHeight * 0.5) {
      orb.classList.add('drop-shape');
    } else {
      orb.classList.remove('drop-shape');
    }
  }

  // asegurar movimiento continuo
  window.addEventListener('scroll', updatePosition, {passive: true});
  window.addEventListener('resize', updatePosition);
  updatePosition();

  // detectar footer
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        orb.style.transition = 'all 1.4s ease-in-out';
        orb.style.top = `${footer.offsetTop + 80}px`;
        orb.style.left = `${window.innerWidth / 2}px`;
        orb.style.transform = 'translate(-50%, -50%) scale(1.5)';
        footer.classList.add('honey');
        setTimeout(() => orb.style.opacity = '0', 1000);
      } else {
        orb.style.opacity = '1';
        footer.classList.remove('honey');
      }
    });
  }, { threshold: 0.3 });
  observer.observe(footer);

  console.log("✅ Bloque de gota de miel activo");
})();


              
