(() => {
  'use strict';

  const colorData = {
    white:     { price: '$949',   raw: '$949',   label: 'White' },
    black:     { price: '$1,099', raw: '$1,099', label: 'Black' },
    stainless: { price: '$1,149', raw: '$1,149', label: 'Stainless Steel' },
  };

  let selectedColor = 'white';
  let currentIdx = 0;

  // Logo: white on lifestyle (idx 0), dark on product renders
  function updateLogoColor() {
    const logo = document.querySelector('.gallery-logo');
    if (!logo) return;
    logo.classList.toggle('logo-light', currentIdx === 0);
  }

  // --- Color Selector ---
  function initColorSelector() {
    const swatches = document.querySelectorAll('.swatch');
    swatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        selectedColor = swatch.dataset.color;
        swatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');

        const data = colorData[selectedColor];
        document.querySelector('.price').textContent = data.price;
        document.getElementById('color-name').textContent = data.label;

        // Swap gallery thumb-set
        currentIdx = 0;
        document.querySelectorAll('.thumb-set').forEach(set => {
          if (set.dataset.color === selectedColor) {
            set.classList.add('active');
            const firstImg = set.querySelector('.thumb img');
            if (firstImg) {
              document.getElementById('main-image').src = firstImg.src;
            }
            set.querySelectorAll('.thumb').forEach((t, i) => t.classList.toggle('active', i === 0));
          } else {
            set.classList.remove('active');
          }
        });
        updateLogoColor();
      });
    });
  }

  // --- Gallery thumbnails ---
  function initGallery() {
    document.querySelector('.gallery-thumbs')?.addEventListener('click', e => {
      const btn = e.target.closest('.thumb');
      if (!btn) return;
      const set = btn.closest('.thumb-set');
      set.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      currentIdx = parseInt(btn.dataset.idx, 10) || 0;

      const viewport = document.querySelector('.gallery-viewport');
      const muxId = btn.dataset.mux;
      if (muxId) {
        // Replace main image with video
        viewport.innerHTML = '<video class="gallery-hero-img" autoplay loop playsinline muted src="https://stream.mux.com/' + muxId + '/high.mp4"></video>';
      } else {
        const img = btn.querySelector('img');
        // Restore image if video was playing
        if (!viewport.querySelector('#main-image')) {
          viewport.innerHTML = '<img id="main-image" class="gallery-hero-img" src="' + (img ? img.src : '') + '" alt="Mill Food Recycler">';
        } else {
          if (img) document.getElementById('main-image').src = img.src;
        }
      }
      updateLogoColor();
    });
  }

  // --- Gallery Prev/Next arrows ---
  function initGalleryArrows() {
    const prevBtn = document.getElementById('gallery-prev');
    const nextBtn = document.getElementById('gallery-next');
    if (!prevBtn || !nextBtn) return;

    function navigate(dir) {
      const activeSet = document.querySelector('.thumb-set.active');
      if (!activeSet) return;
      const thumbs = activeSet.querySelectorAll('.thumb');
      if (!thumbs.length) return;

      currentIdx = (currentIdx + dir + thumbs.length) % thumbs.length;
      thumbs.forEach(t => t.classList.remove('active'));
      thumbs[currentIdx].classList.add('active');

      const viewport = document.querySelector('.gallery-viewport');
      const muxId = thumbs[currentIdx].dataset.mux;
      if (muxId) {
        viewport.innerHTML = '<video class="gallery-hero-img" autoplay loop playsinline muted src="https://stream.mux.com/' + muxId + '/high.mp4"></video>';
      } else {
        const img = thumbs[currentIdx].querySelector('img');
        if (!viewport.querySelector('#main-image')) {
          viewport.innerHTML = '<img id="main-image" class="gallery-hero-img" src="' + (img ? img.src : '') + '" alt="Mill Food Recycler">';
        } else {
          if (img) document.getElementById('main-image').src = img.src;
        }
      }
      updateLogoColor();
    }

    prevBtn.addEventListener('click', () => navigate(-1));
    nextBtn.addEventListener('click', () => navigate(1));
  }

  // --- FAQ Accordion ---
  function initFaq() {
    document.querySelectorAll('.faq-q').forEach(q => {
      q.addEventListener('click', () => {
        const item = q.closest('.faq-item');
        const wasActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
        if (!wasActive) item.classList.add('active');
      });
    });
  }

  // --- Add to Cart → Cart State transition ---
  function initCart() {
    const addBtn = document.getElementById('add-to-cart');
    const configPanel = document.getElementById('config-panel');
    const cartPanel = document.getElementById('cart-panel');
    if (!addBtn || !configPanel || !cartPanel) return;

    addBtn.addEventListener('click', () => {
      const data = colorData[selectedColor];

      // Populate cart
      document.getElementById('cart-color').textContent = data.label;
      document.getElementById('cart-price').textContent = data.raw;
      document.getElementById('cart-sub').textContent = data.raw;
      document.getElementById('cart-total').textContent = data.raw;

      // Use first image of selected color for cart thumb
      const activeSet = document.querySelector(`.thumb-set[data-color="${selectedColor}"]`);
      const thumbImg = activeSet?.querySelector('.thumb img');
      if (thumbImg) document.getElementById('cart-thumb').src = thumbImg.src;

      // Swap panels
      configPanel.classList.add('hidden');
      cartPanel.classList.remove('hidden');

      // Scroll to top of configurator
      document.getElementById('configurator').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // --- Video play buttons (Mux) ---
  function initVideoPlayers() {
    document.querySelectorAll('.play-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const muxId = btn.dataset.mux;
        if (!muxId) return;
        const poster = btn.closest('.video-poster');
        const iframe = document.createElement('iframe');
        iframe.src = `https://stream.mux.com/${muxId}.m3u8?autoplay=1`;
        // Use Mux player embed
        const video = document.createElement('video');
        video.autoplay = true;
        video.controls = true;
        video.playsInline = true;
        video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:16px;';
        video.src = `https://stream.mux.com/${muxId}/high.mp4`;
        video.poster = poster.querySelector('img')?.src || '';
        poster.innerHTML = '';
        poster.appendChild(video);
      });
    });
  }

  // --- Smooth anchor scroll ---
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id === '#') return;
        const target = document.querySelector(id);
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
      });
    });
  }

  // --- Init ---
  document.addEventListener('DOMContentLoaded', () => {
    initColorSelector();
    initGallery();
    initGalleryArrows();
    initFaq();
    initCart();
    initVideoPlayers();
    initSmoothScroll();
  });
})();
