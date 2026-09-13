const CONFIG = {
  // CAMBIA ESTA FECHA POR LA FECHA REAL DEL EVENTO
  eventDate: '2026-12-05T18:30:00',
  // Si después conectas Google Apps Script, pega aquí tu URL.
  rsvpScriptUrl: ''
};

let audioEnabled = false;
let slideIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
  initIntro();
  initMusic();
  initCountdown();
  initCarousel();
  initReveal();
  initRSVP();
  initCinderellaStars();
});

function initIntro() {
  const intro = document.getElementById('intro');
  const video = document.getElementById('introVideo');
  const enterBtn = document.getElementById('enterBtn');
  const hint = document.getElementById('audioHint');
  if (!intro || !video || !enterBtn) return;

  video.play().catch(() => {});

  const enableSound = async () => {
    if (audioEnabled) return;
    try {
      audioEnabled = true;
      video.muted = false;
      video.volume = 1;
      hint && (hint.style.display = 'none');
      await video.play();
    } catch {
      audioEnabled = false;
    }
  };

  intro.addEventListener('click', (e) => {
    if (!e.target.closest('#enterBtn')) enableSound();
  });
  hint?.addEventListener('click', (e) => { e.stopPropagation(); enableSound(); });

  const closeIntro = () => {
    video.pause();
    intro.classList.add('is-hidden');
    setTimeout(() => { intro.style.display = 'none'; }, 750);
    window.startMusic?.();
  };

  enterBtn.addEventListener('click', (e) => { e.stopPropagation(); closeIntro(); });
  video.addEventListener('ended', closeIntro);
}

function initMusic() {
  const btn = document.getElementById('musicBtn');
  const music = document.getElementById('bgMusic');
  if (!btn || !music) return;

  const sync = () => {
    const playing = !music.paused;
    btn.classList.toggle('playing', playing);
    btn.textContent = playing ? '♫' : '♪';
    btn.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
  };

  window.startMusic = async () => { try { await music.play(); } catch {} sync(); };
  btn.addEventListener('click', async () => {
    if (music.paused) { try { await music.play(); } catch {} }
    else music.pause();
    sync();
  });
  music.addEventListener('play', sync);
  music.addEventListener('pause', sync);
  sync();
}

function initCountdown() {
  const target = new Date(CONFIG.eventDate).getTime();
  const ids = ['days','hours','minutes','seconds'];
  if (ids.some(id => !document.getElementById(id))) return;

  const update = () => {
    const diff = Math.max(0, target - Date.now());
    const total = Math.floor(diff / 1000);
    const values = [
      Math.floor(total / 86400),
      Math.floor((total % 86400) / 3600),
      Math.floor((total % 3600) / 60),
      total % 60
    ];
    ids.forEach((id, i) => document.getElementById(id).textContent = String(values[i]).padStart(2,'0'));
  };
  update(); setInterval(update, 1000);
}

function initCarousel() {
  const track = document.getElementById('track');
  const prev = document.getElementById('prevBtn');
  const next = document.getElementById('nextBtn');
  const dots = document.getElementById('dots');
  if (!track || !prev || !next || !dots) return;
  const slides = [...track.children];
  let timer;

  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.className = 'dot' + (i === 0 ? ' active' : '');
    b.addEventListener('click', () => { slideIndex = i; render(); restart(); });
    dots.appendChild(b);
  });

  function render() {
    track.style.transform = `translateX(-${slideIndex * 100}%)`;
    dots.querySelectorAll('.dot').forEach((d,i) => d.classList.toggle('active', i === slideIndex));
  }
  function go(delta) { slideIndex = (slideIndex + delta + slides.length) % slides.length; render(); }
  function restart() { clearInterval(timer); timer = setInterval(() => go(1), 4500); }
  prev.addEventListener('click', () => { go(-1); restart(); });
  next.addEventListener('click', () => { go(1); restart(); });

  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, {passive:true});
  track.addEventListener('touchend', e => {
    const endX = e.changedTouches[0].clientX;
    if (Math.abs(startX - endX) > 45) go(startX > endX ? 1 : -1);
    restart();
  }, {passive:true});

  render(); restart();
}

function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('visible'));
  }, {threshold:.13});
  document.querySelectorAll('.section-reveal').forEach(el => observer.observe(el));
}

function initRSVP() {
  const form = document.getElementById('rsvpForm');
  const msg = document.getElementById('formMsg');
  if (!form || !msg) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    if (!CONFIG.rsvpScriptUrl) {
      msg.textContent = `¡Gracias, ${data.guestName}! ✨ Esta demo ya funciona; solo falta conectar tu Google Sheet.`;
      form.reset();
      return;
    }

    msg.textContent = 'Enviando confirmación...';
    try {
      const response = await fetch(CONFIG.rsvpScriptUrl, {
        method:'POST',
        headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({...data, createdAt:new Date().toISOString()})
      });
      const result = await response.json();
      msg.textContent = result.ok ? '¡Confirmación registrada! ✨' : 'No se pudo registrar. Intenta de nuevo.';
      if (result.ok) form.reset();
    } catch {
      msg.textContent = 'Ocurrió un error al enviar la confirmación.';
    }
  });
}
function initCinderellaStars() {

  // Cantidad de estrellas visibles/reutilizadas
  const totalStars = 10;

  for (let i = 0; i < totalStars; i++) {

    const star = document.createElement("img");

    star.src = "./img/estrellass.png";
    star.className = "magic-star-img";
    star.alt = "";

    document.body.appendChild(star);

    moveStar(star);

    // Cada estrella tendrá una velocidad diferente
    star.style.animationDuration =
      `${4 + Math.random() * 4}s`;

    // Evita que todas aparezcan al mismo tiempo
    star.style.animationDelay =
      `${Math.random() * 6}s`;

    // Cuando termina un brillo,
    // cambia a otro lugar
    star.addEventListener(
      "animationiteration",
      () => {
        moveStar(star);
      }
    );
  }
}


function moveStar(star) {

  // Nueva posición
  star.style.left =
    `${3 + Math.random() * 94}vw`;

  star.style.top =
    `${3 + Math.random() * 90}vh`;

  // Algunas grandes y otras pequeñas
  const size =
    18 + Math.random() * 35;

  star.style.width =
    `${size}px`;
}