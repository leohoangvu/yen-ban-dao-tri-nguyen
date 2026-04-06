// ===== LOADING SCREEN =====
window.addEventListener('load', () => {
  const loadingScreen = document.getElementById('loading-screen');
  setTimeout(() => {
    loadingScreen.classList.add('hidden');
  }, 1500);
});

// ===== HEADER SCROLL EFFECT =====
const header = document.getElementById('header');
let lastScrollY = 0;

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  
  if (currentScrollY > 80) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  
  lastScrollY = currentScrollY;
});

// ===== MOBILE NAVIGATION =====
const mobileToggle = document.getElementById('mobile-toggle');
const navLinks = document.getElementById('nav-links');

mobileToggle.addEventListener('click', () => {
  mobileToggle.classList.toggle('active');
  navLinks.classList.toggle('active');
  document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
});

// Close mobile nav when clicking a link
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileToggle.classList.remove('active');
    navLinks.classList.remove('active');
    document.body.style.overflow = '';
  });
});

// ===== SCROLL REVEAL ANIMATIONS =====
const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// ===== PRODUCT FILTER =====
const categoryTabs = document.querySelectorAll('.category-tab');
const productCards = document.querySelectorAll('.product-card');

categoryTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Update active tab
    categoryTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    const filter = tab.dataset.filter;
    
    productCards.forEach(card => {
      const categories = card.dataset.category;
      
      if (filter === 'all' || categories.includes(filter)) {
        card.style.display = '';
        card.style.animation = 'fadeInUp 0.5s ease forwards';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// ===== TESTIMONIAL SLIDER =====
const testimonialTrack = document.getElementById('testimonial-track');
const testimonialDots = document.querySelectorAll('.testimonial-dot');
let currentSlide = 0;
const totalSlides = testimonialDots.length;

function goToSlide(index) {
  currentSlide = index;
  testimonialTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
  
  testimonialDots.forEach(dot => dot.classList.remove('active'));
  testimonialDots[currentSlide].classList.add('active');
}

testimonialDots.forEach(dot => {
  dot.addEventListener('click', () => {
    goToSlide(parseInt(dot.dataset.index));
  });
});

// Auto slide
setInterval(() => {
  const next = (currentSlide + 1) % totalSlides;
  goToSlide(next);
}, 5000);

// ===== SCROLL TO TOP =====
const scrollTopBtn = document.getElementById('scroll-top');

window.addEventListener('scroll', () => {
  if (window.scrollY > 500) {
    scrollTopBtn.classList.add('visible');
  } else {
    scrollTopBtn.classList.remove('visible');
  }
});

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ===== COUNTER ANIMATION FOR STATS (Optional enhancement) =====
function animateCounter(element, target, duration) {
  let start = 0;
  const step = target / (duration / 16);
  
  function update() {
    start += step;
    if (start < target) {
      element.textContent = Math.floor(start).toLocaleString('vi-VN');
      requestAnimationFrame(update);
    } else {
      element.textContent = target.toLocaleString('vi-VN');
    }
  }
  
  update();
}

// ===== PARALLAX EFFECT ON HERO =====
window.addEventListener('scroll', () => {
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    const scrolled = window.scrollY;
    heroBg.style.transform = `scale(${1 + scrolled * 0.0002}) translateY(${scrolled * 0.3}px)`;
  }
});

// ===== PRODUCT CARD CLICK FOR ZALO =====
document.querySelectorAll('.btn-product').forEach(btn => {
  btn.addEventListener('mouseenter', function() {
    this.style.transform = 'scale(1.02)';
  });
  btn.addEventListener('mouseleave', function() {
    this.style.transform = 'scale(1)';
  });
});

// ===== DYNAMIC YEAR IN FOOTER =====
const yearEl = document.querySelector('.footer-bottom p');
if (yearEl) {
  const currentYear = new Date().getFullYear();
  yearEl.innerHTML = yearEl.innerHTML.replace('2024', currentYear);
}

// ===== PRELOAD IMAGES =====
const imageUrls = [];
for (let i = 1; i <= 14; i++) {
  imageUrls.push(`images/${i}.jpg`);
}

function preloadImages(urls) {
  urls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
}

// Preload critical images
preloadImages(imageUrls.slice(0, 5));
