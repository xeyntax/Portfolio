const header = document.getElementById('siteHeader');
const navLinks = [...document.querySelectorAll('.nav-links a')];
const sections = [...document.querySelectorAll('main section[id]')];

const updateHeader = () => {
  header.classList.toggle('is-scrolled', window.scrollY > 60);
};

const updateActiveNav = () => {
  const position = window.scrollY + window.innerHeight * 0.38;
  let current = 'home';
  sections.forEach((section) => {
    if (position >= section.offsetTop) current = section.id;
  });
  navLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
};

window.addEventListener('scroll', () => {
  updateHeader();
  updateActiveNav();
}, { passive: true });
updateHeader();
updateActiveNav();

// Interactive hero orb: pointer parallax while keeping touch scrolling natural.
const visual = document.getElementById('heroVisual');
const orb = document.getElementById('interactiveOrb');

if (visual && orb) {
  visual.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    const rect = visual.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    orb.style.transform = `translate(calc(-50% + ${x * 54}px), calc(-50% + ${y * 54}px)) rotate(${x * 12}deg)`;
  });
  visual.addEventListener('pointerleave', () => {
    orb.style.transform = 'translate(-50%, -50%)';
  });
}

// Work carousel
const viewport = document.getElementById('workViewport');
const track = document.getElementById('workTrack');
const originalCards = [...document.querySelectorAll('.work-card')];
const currentSlide = document.getElementById('currentSlide');
const progress = document.getElementById('statusProgress');
const prevButton = document.getElementById('workPrev');
const nextButton = document.getElementById('workNext');

const totalCards = originalCards.length;

// Clone the final and first cards so the carousel visually loops in both directions.
if (track && totalCards > 1) {
  const lastClone = originalCards[totalCards - 1].cloneNode(true);
  const firstClone = originalCards[0].cloneNode(true);
  lastClone.dataset.clone = 'true';
  firstClone.dataset.clone = 'true';
  lastClone.setAttribute('aria-hidden', 'true');
  firstClone.setAttribute('aria-hidden', 'true');
  track.prepend(lastClone);
  track.append(firstClone);
}

const cards = [...track.querySelectorAll('.work-card')];
let activeIndex = 0;
let visualIndex = totalCards > 1 ? 1 : 0;
let currentTranslate = 0;

function cardMetrics() {
  if (!cards.length) return { cardWidth: 0, gap: 0 };
  // Use the untransformed layout width. Inactive cards are scaled visually, which must not affect carousel math.
  const cardWidth = parseFloat(getComputedStyle(cards[0]).width);
  const style = getComputedStyle(track);
  const gap = parseFloat(style.columnGap || style.gap || 0);
  return { cardWidth, gap };
}

function translateFor(index) {
  const { cardWidth, gap } = cardMetrics();
  const viewportWidth = viewport.getBoundingClientRect().width;
  return viewportWidth / 2 - cardWidth / 2 - index * (cardWidth + gap);
}

function logicalFromVisual(index) {
  if (totalCards <= 1) return 0;
  if (index === 0) return totalCards - 1;
  if (index === totalCards + 1) return 0;
  return index - 1;
}

function updateCards() {
  cards.forEach((card, index) => {
    const distance = Math.abs(index - visualIndex);
    card.classList.toggle('is-active', distance === 0);
    card.classList.toggle('is-near', distance === 1);
    card.setAttribute('aria-hidden', distance > 1 ? 'true' : 'false');
  });
  currentSlide.textContent = String(activeIndex + 1).padStart(2, '0');
  progress.style.width = `${((activeIndex + 1) / totalCards) * 100}%`;
}

function jumpToRealCard() {
  if (visualIndex === 0) visualIndex = totalCards;
  else if (visualIndex === totalCards + 1) visualIndex = 1;
  else return;

  activeIndex = logicalFromVisual(visualIndex);
  currentTranslate = translateFor(visualIndex);
  track.style.transition = 'none';
  track.style.transform = `translate3d(${currentTranslate}px,0,0)`;
  updateCards();
  // Force the no-transition position to be committed before transitions are restored.
  void track.offsetWidth;
  requestAnimationFrame(() => { track.style.transition = ''; });
}

function goToVisual(index, animate = true) {
  visualIndex = index;
  activeIndex = logicalFromVisual(visualIndex);
  currentTranslate = translateFor(visualIndex);
  track.style.transition = animate ? '' : 'none';
  track.style.transform = `translate3d(${currentTranslate}px,0,0)`;
  updateCards();

  if (!animate) {
    // Commit this jump immediately so a later frame cannot animate from the old position.
    void track.offsetWidth;
    requestAnimationFrame(() => { track.style.transition = ''; });
    return;
  }

  if (visualIndex === 0 || visualIndex === totalCards + 1) {
    const handleTrackTransitionEnd = (event) => {
      // Card scale/opacity transitions bubble up too; only reset after the track finishes moving.
      if (event.target !== track || event.propertyName !== 'transform') return;
      track.removeEventListener('transitionend', handleTrackTransitionEnd);
      jumpToRealCard();
    };
    track.addEventListener('transitionend', handleTrackTransitionEnd);
  }
}

function goToLogical(index, animate = true) {
  if (totalCards <= 1) return goToVisual(0, animate);
  if (index < 0) return goToVisual(0, animate);
  if (index >= totalCards) return goToVisual(totalCards + 1, animate);
  goToVisual(index + 1, animate);
}

prevButton?.addEventListener('click', () => {
  goToLogical(activeIndex - 1);
});

nextButton?.addEventListener('click', () => {
  goToLogical(activeIndex + 1);
});

viewport.setAttribute('tabindex', '0');
viewport.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') {
    goToLogical(activeIndex + 1);
  }
  if (event.key === 'ArrowLeft') {
    goToLogical(activeIndex - 1);
  }
});

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => goToVisual(visualIndex, false), 100);
});

goToVisual(visualIndex, false);

// Expandable contact pills. Only one stays open at a time.
const contactItems = [...document.querySelectorAll('.contact-item')];
contactItems.forEach((item) => {
  const button = item.querySelector('.contact-toggle');
  const detail = item.querySelector('.contact-detail');

  button.addEventListener('click', () => {
    const opening = !item.classList.contains('is-open');
    contactItems.forEach((other) => {
      other.classList.remove('is-open');
      other.querySelector('.contact-toggle')?.setAttribute('aria-expanded', 'false');
      other.querySelector('.contact-detail')?.setAttribute('tabindex', '-1');
    });

    if (opening) {
      item.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
      detail.setAttribute('tabindex', '0');
    }
  });
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.contact-item')) {
    contactItems.forEach((item) => {
      item.classList.remove('is-open');
      item.querySelector('.contact-toggle')?.setAttribute('aria-expanded', 'false');
      item.querySelector('.contact-detail')?.setAttribute('tabindex', '-1');
    });
  }
});

document.getElementById('year').textContent = new Date().getFullYear();


// Keep the layout stable when the device viewport changes and prevent page zoom.
if (viewport && 'ResizeObserver' in window) {
  const carouselResizeObserver = new ResizeObserver(() => {
    goToVisual(visualIndex, false);
  });
  carouselResizeObserver.observe(viewport);
}

// Block browser/page zoom shortcuts and gesture zoom so the composition keeps its intended scale.
document.addEventListener('gesturestart', (event) => event.preventDefault(), { passive: false });
document.addEventListener('gesturechange', (event) => event.preventDefault(), { passive: false });
document.addEventListener('gestureend', (event) => event.preventDefault(), { passive: false });

window.addEventListener('wheel', (event) => {
  if (event.ctrlKey) event.preventDefault();
}, { passive: false });

window.addEventListener('keydown', (event) => {
  const zoomKeys = new Set(['+', '-', '=', '0']);
  if ((event.ctrlKey || event.metaKey) && zoomKeys.has(event.key)) {
    event.preventDefault();
  }
});
