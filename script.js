// menu start
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('show');
});

// Handle active tab highlighting
const links = document.querySelectorAll('.nav-links a');

links.forEach((link) => {
  link.addEventListener('click', (e) => {
    // Remove active class from all links
    links.forEach((l) => l.classList.remove('active'));
    // Add active class to clicked link
    e.target.classList.add('active');
    // On mobile, close the menu after clicking
    if (window.innerWidth <= 768) {
      navLinks.classList.remove('show');
    }
  });
});

// Set active tab based on current URL hash
function setActiveTab() {
  const hash = window.location.hash || '#home';
  links.forEach((link) => {
    if (link.getAttribute('href') === hash) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Set active tab on page load and hash change
window.addEventListener('load', setActiveTab);
window.addEventListener('hashchange', setActiveTab);
// menu end

// carousel start
const carousel = {
  currentSlide: 0,
  slides: document.querySelectorAll('.slide'),
  dots: document.querySelectorAll('.carousel-dot'),
  autoplayInterval: 5000, // 5 seconds
  autoplayTimer: null,

  init() {
    this.addEventListeners();
    this.startAutoplay();
  },

  addEventListeners() {
    // Add click events to dots
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.goToSlide(index);
        this.resetAutoplay();
      });
    });

    // Pause autoplay on hover
    document
      .querySelector('.hero-carousel')
      .addEventListener('mouseenter', () => {
        this.stopAutoplay();
      });

    // Resume autoplay on mouse leave
    document
      .querySelector('.hero-carousel')
      .addEventListener('mouseleave', () => {
        this.startAutoplay();
      });
  },

  goToSlide(index) {
    // Remove active classes
    this.slides[this.currentSlide].classList.remove('active');
    this.dots[this.currentSlide].classList.remove('active');

    // Update current slide
    this.currentSlide = index;

    // Add active classes
    this.slides[this.currentSlide].classList.add('active');
    this.dots[this.currentSlide].classList.add('active');
  },

  nextSlide() {
    const next = (this.currentSlide + 1) % this.slides.length;
    this.goToSlide(next);
  },

  startAutoplay() {
    this.autoplayTimer = setInterval(() => {
      this.nextSlide();
    }, this.autoplayInterval);
  },

  stopAutoplay() {
    clearInterval(this.autoplayTimer);
  },

  resetAutoplay() {
    this.stopAutoplay();
    this.startAutoplay();
  },
};

// Initialize carousel
carousel.init();
// carousel end
