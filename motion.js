/* ============================================================
   Motion — IntersectionObserver, parallax, scroll progress,
   button magnetism, hero reveal, FAQ/Aula accordions, slider
   ============================================================ */

(function(){
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Hero ready-state (word-reveal trigger) ---------- */
  const triggerHeroReady = () => {
    requestAnimationFrame(() => {
      document.querySelector('.hero')?.classList.add('ready');
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', triggerHeroReady);
  } else {
    triggerHeroReady();
  }

  /* ---------- Nav scrolled state + hide on scroll-down / show on scroll-up ---------- */
  const nav = document.querySelector('.nav');
  let lastY = window.scrollY;
  const onNavScroll = () => {
    if (!nav) return;
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 40);
    const dy = y - lastY;
    if (y < 80){
      nav.classList.remove('hidden');
    } else if (dy > 6){
      nav.classList.add('hidden');
    } else if (dy < -6){
      nav.classList.remove('hidden');
    }
    lastY = y;
  };
  window.addEventListener('scroll', onNavScroll, {passive:true});
  onNavScroll();

  /* ---------- Sticky offer bar visibility ---------- */
  const stickyBar = document.querySelector('.sticky-bar');
  const ofertaSection = document.querySelector('#oferta');
  const heroSection = document.querySelector('.hero');
  const updateStickyBar = () => {
    if (!stickyBar || !heroSection) return;
    const heroBottom = heroSection.getBoundingClientRect().bottom;
    const ofertaRect = ofertaSection?.getBoundingClientRect();
    const pastHero = heroBottom < 0;
    const ofertaVisible = ofertaRect && ofertaRect.top < window.innerHeight && ofertaRect.bottom > 0;
    stickyBar.classList.toggle('visible', pastHero && !ofertaVisible);
  };
  window.addEventListener('scroll', updateStickyBar, {passive:true});
  window.addEventListener('resize', updateStickyBar);
  updateStickyBar();

  /* ---------- IntersectionObserver: reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting){
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, {rootMargin:'-8% 0px -8% 0px', threshold:0.05});
  document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => io.observe(el));

  /* ---------- Hero parallax (subtle scale + translate on scroll) ---------- */
  if (!prefersReduced){
    const heroVid = document.querySelector('.hero .video-wrap');
    const heroContent = document.querySelector('.hero .content');
    const heroH = () => window.innerHeight;
    const onHeroScroll = () => {
      const y = window.scrollY;
      const max = heroH();
      const t = Math.min(y / max, 1);
      if (heroVid) heroVid.style.transform = `translateY(${y * 0.35}px) scale(${1 + t * 0.08})`;
      if (heroContent) heroContent.style.transform = `translateY(${y * 0.18}px)`;
      if (heroContent) heroContent.style.opacity = String(1 - t * 0.9);
    };
    window.addEventListener('scroll', onHeroScroll, {passive:true});
    onHeroScroll();
  }

  /* ---------- Parallax for any [data-parallax] el ---------- */
  if (!prefersReduced){
    const pxEls = [...document.querySelectorAll('[data-parallax]')];
    const onPxScroll = () => {
      pxEls.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.2;
        const r = el.getBoundingClientRect();
        const center = r.top + r.height/2 - window.innerHeight/2;
        el.style.transform = `translateY(${center * -speed}px)`;
      });
    };
    window.addEventListener('scroll', onPxScroll, {passive:true});
    onPxScroll();
  }

  /* ---------- Timeline progress fill ---------- */
  const tl = document.querySelector('.timeline');
  const tlProgress = document.querySelector('.timeline .progress');
  const updateTimeline = () => {
    if (!tl || !tlProgress) return;
    const r = tl.getBoundingClientRect();
    const vh = window.innerHeight;
    const start = vh * 0.6;
    const end = vh * 0.2;
    const total = r.height + (start - end);
    const traveled = start - r.top;
    const pct = Math.max(0, Math.min(1, traveled / total));
    tlProgress.style.height = `${pct * 100}%`;
  };
  window.addEventListener('scroll', updateTimeline, {passive:true});
  updateTimeline();

  /* ---------- Aulas accordion (exclusive: open one closes others) ---------- */
  const aulas = document.querySelectorAll('.aula');
  aulas.forEach((a, i) => {
    if (i === 0) a.classList.add('open');
    const toggleAula = () => {
      const wasOpen = a.classList.contains('open');
      aulas.forEach(x => x.classList.remove('open'));
      if (!wasOpen) a.classList.add('open');
    };
    a.addEventListener('click', toggleAula);
    a.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAula(); }
    });
  });

  /* ---------- Perfis: card click → swap active + crossfade video through black ---------- */
  const perfisBg = document.querySelector('.perfis-bg');
  const perfisCards = document.querySelectorAll('.perfil[data-target]');
  if (perfisBg && perfisCards.length){
    const videos = perfisBg.querySelectorAll('.perfis-video');
    perfisCards.forEach(card => {
      card.addEventListener('click', () => {
        const key = card.dataset.target;
        if (card.classList.contains('active')) return;
        // swap active state
        perfisCards.forEach(c => c.classList.toggle('active', c === card));
        // fade-to-black, swap video, fade back
        perfisBg.classList.add('fading');
        setTimeout(() => {
          videos.forEach(v => {
            const on = v.dataset.key === key;
            v.classList.toggle('is-on', on);
            if (on){ try { v.currentTime = 0; v.play(); } catch(e){} }
            else   { try { v.pause(); } catch(e){} }
          });
          // hold black briefly, then fade back
          setTimeout(() => perfisBg.classList.remove('fading'), 120);
        }, 450);
      });
    });
  }

  /* ---------- FAQ accordion (exclusive) ---------- */
  const faqs = document.querySelectorAll('.faq-item');
  faqs.forEach((it, i) => {
    if (i === 0) it.classList.add('open');
    const toggleFaq = () => {
      const wasOpen = it.classList.contains('open');
      faqs.forEach(x => x.classList.remove('open'));
      if (!wasOpen) it.classList.add('open');
    };
    it.addEventListener('click', toggleFaq);
    const q = it.querySelector('.faq-q');
    if (q) q.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFaq(); }
    });
  });

  /* ---------- Button radial glow (no magnetic follow) ---------- */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 100;
      const my = ((e.clientY - r.top) / r.height) * 100;
      btn.style.setProperty('--mx', mx+'%');
      btn.style.setProperty('--my', my+'%');
    });
  });

  /* ---------- Video card glow (mouse-follow only, no 3D tilt) ---------- */
  document.querySelectorAll('.video-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const mx = (e.clientX - r.left) / r.width;
      const my = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', (mx*100)+'%');
      card.style.setProperty('--my', (my*100)+'%');
    });
  });

  /* ---------- Before/After compare slider ---------- */
  const compares = document.querySelectorAll('.compare');
  compares.forEach(c => {
    const after = c.querySelector('.side.after');
    const handle = c.querySelector('.handle');
    const knob = c.querySelector('.knob');
    let dragging = false;

    const setPct = (pct) => {
      pct = Math.max(2, Math.min(98, pct));
      if (after) after.style.clipPath = `inset(0 0 0 ${pct}%)`;
      if (handle) handle.style.left = `${pct}%`;
      if (knob) knob.style.left = `${pct}%`;
    };

    const xToPct = (clientX) => {
      const r = c.getBoundingClientRect();
      return ((clientX - r.left) / r.width) * 100;
    };

    const start = (e) => { dragging = true; c.style.cursor='grabbing'; };
    const move = (e) => {
      if (!dragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setPct(xToPct(x));
    };
    const end = () => { dragging = false; c.style.cursor=''; };

    let kbPct = 50;
    let wobbleActive = true;
    c.addEventListener('mousedown', (e) => { start(e); setPct(xToPct(e.clientX)); kbPct = xToPct(e.clientX); });
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    c.addEventListener('touchstart', (e) => { start(e); setPct(xToPct(e.touches[0].clientX)); }, {passive:true});
    c.addEventListener('touchmove', move, {passive:true});
    c.addEventListener('touchend', end);
    c.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); wobbleActive = false; kbPct = Math.max(2, kbPct - 5); setPct(kbPct); }
      if (e.key === 'ArrowRight') { e.preventDefault(); wobbleActive = false; kbPct = Math.min(98, kbPct + 5); setPct(kbPct); }
    });

    // ambient idle motion (subtle wobble before user touches)
    if (!prefersReduced){
      let t = 0;
      const wob = () => {
        if (!wobbleActive) return;
        t += 0.012;
        const pct = 50 + Math.sin(t) * 6;
        setPct(pct);
        requestAnimationFrame(wob);
      };
      wob();
      const stop = () => { wobbleActive = false; };
      c.addEventListener('mousedown', stop, {once:true});
      c.addEventListener('touchstart', stop, {once:true});
      c.addEventListener('mouseenter', stop, {once:true});
    }
  });

  /* ---------- Pair thumbs — switch active + update compare content ---------- */
  document.querySelectorAll('.pair-thumb').forEach(t => {
    const activateThumb = () => {
      document.querySelectorAll('.pair-thumb').forEach(x => x.classList.remove('active'));
      t.classList.add('active');

      const img = t.dataset.img;
      const video = t.dataset.video;
      const compare = document.querySelector('.compare');
      if (!compare) return;

      const before = compare.querySelector('.side.before');
      const afterVid = compare.querySelector('.side.after video');

      if (before && img) before.style.backgroundImage = `url('${img}')`;
      if (afterVid && video) {
        afterVid.src = video;
        afterVid.load();
        afterVid.play().catch(() => {});
      }
    };
    t.addEventListener('click', activateThumb);
    t.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateThumb(); }
    });
  });

  /* ---------- Countdown timer (target = now + 2d 14h 37m) ---------- */
  const target = new Date();
  target.setDate(target.getDate() + 2);
  target.setHours(target.getHours() + 14);
  target.setMinutes(target.getMinutes() + 37);
  target.setSeconds(target.getSeconds() + 52);
  const tickCD = () => {
    const cells = document.querySelectorAll('.cd-cell .n');
    if (cells.length < 4) return;
    let diff = Math.max(0, target - new Date());
    const d = Math.floor(diff / 86400000); diff -= d*86400000;
    const h = Math.floor(diff / 3600000);  diff -= h*3600000;
    const m = Math.floor(diff / 60000);    diff -= m*60000;
    const s = Math.floor(diff / 1000);
    const pad = n => String(n).padStart(2,'0');
    cells[0].textContent = pad(d);
    cells[1].textContent = pad(h);
    cells[2].textContent = pad(m);
    cells[3].textContent = pad(s);
  };
  tickCD();
  setInterval(tickCD, 1000);

  /* ---------- Smooth anchor for in-page links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const tgt = document.getElementById(id);
      if (tgt){ e.preventDefault(); window.scrollTo({top: tgt.offsetTop - 60, behavior:'smooth'}); }
    });
  });

})();
