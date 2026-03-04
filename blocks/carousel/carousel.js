const AUTOSCROLL_INTERVAL = 7000;

/**
 * Clone slide content into a new slide element.
 * @param {Element} row The original authored row
 * @returns {Element} slide element
 */
function createSlide(row) {
  const slide = document.createElement('div');
  slide.className = 'carousel-slide';
  slide.setAttribute('aria-hidden', 'true');

  const imageCol = row.children[0];
  const textCol = row.children[1];

  // Image
  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'carousel-slide-image';
  if (imageCol) {
    imageWrapper.innerHTML = imageCol.innerHTML;
  }
  slide.append(imageWrapper);

  // Text overlay
  const content = document.createElement('div');
  content.className = 'carousel-slide-content';
  if (textCol) {
    content.innerHTML = textCol.innerHTML;
  }
  slide.append(content);

  return slide;
}

/**
 * Switch to a specific slide.
 * @param {Element} block The carousel block
 * @param {number} index Slide index
 */
function showSlide(block, index) {
  const slides = block.querySelectorAll('.carousel-slide');
  const indicators = block.querySelectorAll('.carousel-indicator');

  slides.forEach((slide, i) => {
    const active = i === index;
    slide.setAttribute('aria-hidden', String(!active));
    slide.classList.toggle('carousel-slide-active', active);
  });

  indicators.forEach((dot, i) => {
    dot.classList.toggle('carousel-indicator-active', i === index);
    dot.setAttribute('aria-selected', String(i === index));
  });

  block.dataset.activeSlide = index;
}

/**
 * Advance to the next slide.
 * @param {Element} block The carousel block
 */
function nextSlide(block) {
  const total = block.querySelectorAll('.carousel-slide').length;
  const current = parseInt(block.dataset.activeSlide, 10) || 0;
  showSlide(block, (current + 1) % total);
}

/**
 * Go to the previous slide.
 * @param {Element} block The carousel block
 */
function prevSlide(block) {
  const total = block.querySelectorAll('.carousel-slide').length;
  const current = parseInt(block.dataset.activeSlide, 10) || 0;
  showSlide(block, (current - 1 + total) % total);
}

/**
 * Loads and decorates the carousel block.
 * @param {Element} block The carousel block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  // Auto-scroll state
  let autoScrollTimer;

  function stopAutoScroll() {
    block.dataset.paused = 'true';
    clearInterval(autoScrollTimer);
  }

  function startAutoScroll() {
    block.dataset.paused = 'false';
    autoScrollTimer = setInterval(() => nextSlide(block), AUTOSCROLL_INTERVAL);
  }

  // Slide container
  const slidesWrapper = document.createElement('div');
  slidesWrapper.className = 'carousel-slides';

  rows.forEach((row) => {
    const slide = createSlide(row);
    slidesWrapper.append(slide);
  });

  block.append(slidesWrapper);

  // Navigation arrows
  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel-nav carousel-nav-prev';
  prevBtn.setAttribute('aria-label', 'Previous slide');
  prevBtn.innerHTML = '<span>&#10094;</span>';
  prevBtn.addEventListener('click', () => {
    prevSlide(block);
    stopAutoScroll();
  });

  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel-nav carousel-nav-next';
  nextBtn.setAttribute('aria-label', 'Next slide');
  nextBtn.innerHTML = '<span>&#10095;</span>';
  nextBtn.addEventListener('click', () => {
    nextSlide(block);
    stopAutoScroll();
  });

  block.append(prevBtn);
  block.append(nextBtn);

  // Controls container (indicators + pause)
  const controls = document.createElement('div');
  controls.className = 'carousel-controls';

  // Dot indicators
  const indicators = document.createElement('div');
  indicators.className = 'carousel-indicators';
  indicators.setAttribute('role', 'tablist');

  rows.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-indicator';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.setAttribute('aria-selected', String(i === 0));
    dot.addEventListener('click', () => {
      showSlide(block, i);
      stopAutoScroll();
    });
    indicators.append(dot);
  });

  controls.append(indicators);

  // Pause / Play button
  const pauseBtn = document.createElement('button');
  pauseBtn.className = 'carousel-pause';
  pauseBtn.setAttribute('aria-label', 'Pause carousel');
  pauseBtn.innerHTML = '<span class="carousel-pause-icon">&#9646;&#9646;</span>';
  pauseBtn.addEventListener('click', () => {
    const isPaused = block.dataset.paused === 'true';
    if (isPaused) {
      startAutoScroll();
      pauseBtn.innerHTML = '<span class="carousel-pause-icon">&#9646;&#9646;</span>';
      pauseBtn.setAttribute('aria-label', 'Pause carousel');
    } else {
      stopAutoScroll();
      pauseBtn.innerHTML = '<span class="carousel-play-icon">&#9654;</span>';
      pauseBtn.setAttribute('aria-label', 'Play carousel');
    }
  });

  controls.append(pauseBtn);
  block.append(controls);

  // Show first slide
  showSlide(block, 0);

  // Start auto-scroll
  startAutoScroll();

  // Pause on hover
  block.addEventListener('mouseenter', () => {
    if (block.dataset.paused !== 'true') stopAutoScroll();
  });

  block.addEventListener('mouseleave', () => {
    if (block.dataset.paused === 'true') {
      // Only restart if user didn't explicitly pause
      const wasPausedByUser = pauseBtn.getAttribute('aria-label') === 'Play carousel';
      if (!wasPausedByUser) startAutoScroll();
    }
  });

  // Keyboard navigation
  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      prevSlide(block);
      stopAutoScroll();
    } else if (e.key === 'ArrowRight') {
      nextSlide(block);
      stopAutoScroll();
    }
  });
}
