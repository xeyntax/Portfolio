// Shared header and mobile navigation for the homepage and partnership page.
(() => {
  const header = document.getElementById('siteHeader');
  const menuToggle = document.querySelector('.nav-menu-toggle');
  const menuLinks = document.getElementById('primaryLinks');
  const partnershipLink = menuLinks.querySelector('.partnership-nav-link');
  const sectionLinks = [...menuLinks.querySelectorAll('a[href^="#"]')];
  const sections = [...document.querySelectorAll('main section[id]')];

  function updateNavigation() {
    header.classList.toggle('is-scrolled', window.scrollY > 60);
    if (!sectionLinks.length) return;
    const position = window.scrollY + window.innerHeight * .38;
    let current = 'home';
    sections.forEach(section => { if (position >= section.offsetTop) current = section.id; });
    sectionLinks.forEach(link => {
      const active = link.getAttribute('href') === `#${current}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function closeMenu() {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuLinks.classList.remove('is-open');
  }
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuLinks.classList.toggle('is-open', open);
  });
  menuLinks.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('click', event => { if (!event.target.closest('.nav-shell')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    partnershipLink.classList.add('tooltip-dismissed');
    if (menuLinks.classList.contains('is-open')) { closeMenu(); menuToggle.focus(); }
  });
  partnershipLink.addEventListener('pointerenter', () => partnershipLink.classList.remove('tooltip-dismissed'));
  partnershipLink.addEventListener('focus', () => partnershipLink.classList.remove('tooltip-dismissed'));
  window.addEventListener('scroll', updateNavigation, { passive: true });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1200) closeMenu();
    updateNavigation();
  });
  updateNavigation();
})();
