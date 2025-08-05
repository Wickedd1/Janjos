let currentSeason = 'off-peak';
let scrollTimeout;

// ====== INITIALIZATION ======
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    setupScrollEffects();
    setupIntersectionObserver();
    setupParallaxEffect();
});

function initializeApp() {
    // Set minimum date for booking form
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('checkin').min = today;
    document.getElementById('checkout').min = today;
    
    // Setup date validation
    setupDateValidation();
    
    // Initialize animations
    triggerAnimations();
    
    console.log('🏝️ Janjos Resort website initialized successfully!');
}

// ====== EVENT LISTENERS ======
function setupEventListeners() {
    // Modal events
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleEscapeKey);
    
    // Form submissions
    setupFormHandlers();
    
    // Window events
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    // Image loading
    setupLazyLoading();
}

function setupFormHandlers() {
    // Booking form
    const bookingForm = document.querySelector('.booking-form-content');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }
    
    // Auth forms
    const authForms = document.querySelectorAll('.auth-form');
    authForms.forEach(form => {
        form.addEventListener('submit', handleAuthSubmit);
    });
}

function setupDateValidation() {
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    
    checkinInput.addEventListener('change', function() {
        const checkinDate = new Date(this.value);
        const nextDay = new Date(checkinDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        checkoutInput.min = nextDay.toISOString().split('T')[0];
        
        if (checkoutInput.value && new Date(checkoutInput.value) <= checkinDate) {
            checkoutInput.value = nextDay.toISOString().split('T')[0];
        }
    });
}

// ====== MODAL FUNCTIONS ======
function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    if (modal.classList.contains('show')) {
        closeModal(modalId);
    } else {
        openModal(modalId);
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Close any other open modals
    document.querySelectorAll('.modal.show').forEach(m => {
        if (m.id !== modalId) closeModal(m.id);
    });
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Trigger animation
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });
    
    // Focus first input
    const firstInput = modal.querySelector('input');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 300);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('show');
    document.body.style.overflow = '';
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function switchModal(currentModalId, targetModalId) {
    closeModal(currentModalId);
    setTimeout(() => {
        openModal(targetModalId);
    }, 300);
}

function handleOutsideClick(event) {
    if (event.target.classList.contains('modal-overlay')) {
        const modal = event.target.closest('.modal');
        if (modal) closeModal(modal.id);
    }
}

function handleEscapeKey(event) {
    if (event.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) closeModal(openModal.id);
    }
}

// ====== PRICING SEASON TOGGLE ======
function switchSeason(season) {
    if (currentSeason === season) return;
    
    // Update button states
    document.querySelectorAll('.season-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`btn-${season}`).classList.add('active');
    
    // Update content with fade effect
    const currentContent = document.getElementById(currentSeason);
    const newContent = document.getElementById(season);
    
    // Fade out current content
    currentContent.style.opacity = '0';
    currentContent.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        currentContent.classList.remove('active');
        newContent.classList.add('active');
        
        // Fade in new content
        requestAnimationFrame(() => {
            newContent.style.opacity = '1';
            newContent.style.transform = 'translateY(0)';
        });
    }, 200);
    
    currentSeason = season;
    
    // Show success message
    showToast(`Switched to ${season === 'off-peak' ? 'Off-Peak' : 'Peak'} Season pricing`);
}

function handleContactSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !message) {
        showToast('Please fill in all fields.', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showToast('Please enter a valid email.', 'error');
        return;
    }

    // Simulate sending (real implementation would involve backend/email service)
    showToast('Thanks for reaching out! We’ll get back to you soon.');

    // Reset form
    event.target.reset();
}


// ====== FORM HANDLERS ======
function handleBookingSubmit(event) {
    event.preventDefault();
    
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    
    if (!checkin || !checkout) {
        showToast('Please select both check-in and check-out dates', 'error');
        return;
    }
    
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
    
    // Add loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Checking...';
    submitBtn.classList.add('loading');
    
    // Simulate API call
    setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.classList.remove('loading');
        
        showToast(`Great! We found availability for ${nights} night${nights > 1 ? 's' : ''}. Redirecting to booking...`);
        
        // In a real app, this would redirect to booking page
        setTimeout(() => {
            console.log('Redirecting to booking page...', { checkin, checkout, nights });
        }, 2000);
    }, 1500);
}

function handleAuthSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const isSignup = form.closest('#signup-modal') !== null;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Get form data
    const formData = new FormData(form);
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;
    
    if (!email || !password) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // Validate email
    if (!isValidEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    // Validate password
    if (password.length < 6) {
        showToast('Password must be at least 6 characters long', 'error');
        return;
    }
    
    // Add loading state
    submitBtn.textContent = isSignup ? 'Creating Account...' : 'Signing In...';
    submitBtn.classList.add('loading');
    
    // Simulate API call
    setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.classList.remove('loading');
        
        const modalId = isSignup ? 'signup-modal' : 'signin-modal';
        closeModal(modalId);
        
        const message = isSignup ? 
            'Account created successfully! Welcome to Janjos Resort!' : 
            'Welcome back! You are now signed in.';   
        showToast(message);
        
        // In a real app, this would handle authentication
        console.log(`${isSignup ? 'Signup' : 'Signin'} attempt:`, { email });
    }, 1500);
}

// ====== UTILITY FUNCTIONS ======
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    
    toastMessage.textContent = message;
    
    // Update toast style based on type
    toast.style.borderLeftColor = type === 'error' ? '#e74c3c' : '#f39c12';
    
    toast.classList.add('show');
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        hideToast();
    }, 5000);
}

function hideToast() {
    const toast = document.getElementById('toast');
    toast.classList.remove('show');
}

// ====== SCROLL EFFECTS ======
function setupScrollEffects() {
    const header = document.querySelector('.header');
    
    // Throttled scroll handler
    let ticking = false;
    
    function updateHeader() {
        const scrollY = window.scrollY;
        
        if (scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        ticking = false;
    }
    
    function handleScroll() {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', handleScroll);
}

// ====== INTERSECTION OBSERVER FOR ANIMATIONS ======
function setupIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                
                // Add stagger effect for gallery items
                if (entry.target.classList.contains('gallery-item')) {
                    const delay = Array.from(entry.target.parentNode.children).indexOf(entry.target) * 200;
                    entry.target.style.animationDelay = `${delay}ms`;
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements that should animate on scroll
    const animateElements = document.querySelectorAll('.gallery-item, .resort-info, .pricing-section, .footer-section');
    animateElements.forEach(el => observer.observe(el));
}

// ====== PARALLAX EFFECT ======
function setupParallaxEffect() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        hero.style.transform = `translateY(${rate}px)`;
        ticking = false;
    }
    
    function handleParallaxScroll() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    // Only enable parallax on desktop
    if (window.innerWidth > 768) {
        window.addEventListener('scroll', handleParallaxScroll);
    }
}

// ====== LAZY LOADING ======
function setupLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('animate-fade-in');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// ====== RESPONSIVE HANDLERS ======
function handleResize() {
    // Debounce resize events
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        // Re-setup parallax based on screen size
        if (window.innerWidth <= 768) {
            document.querySelector('.hero').style.transform = 'none';
        }
        
        // Close modals on mobile orientation change
        if (window.innerWidth !== window.outerWidth) {
            document.querySelectorAll('.modal.show').forEach(modal => {
                closeModal(modal.id);
            });
        }
    }, 250);
}

// ====== ANIMATION TRIGGERS ======
function triggerAnimations() {
    // Trigger hero animations with stagger
    const heroElements = document.querySelectorAll('.hero-text, .booking-form');
    heroElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.3}s`;
    });
    
    // Trigger header animation
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.style.animationDelay = '0.5s';
    }
}

// ====== ERROR HANDLING ======
window.addEventListener('error', function(event) {
    console.error('JavaScript error occurred:', event.error);
    showToast('Something went wrong. Please refresh the page.', 'error');
});

// ====== PERFORMANCE MONITORING ======
window.addEventListener('load', function() {
    // Monitor page load performance
    if ('performance' in window) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`🚀 Page loaded in ${loadTime}ms`);
        
        // Show warning if load time is too high
        if (loadTime > 3000) {
            console.warn('⚠️ Page load time is above optimal threshold');
        }
    }
});

// ====== ACCESSIBILITY ENHANCEMENTS ======
document.addEventListener('keydown', function(event) {
    // Handle keyboard navigation for modals
    if (event.key === 'Tab') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
            trapFocus(event, openModal);
        }
    }
});

function handleScroll() {
    // This function was missing. You can expand this if needed.
    // For now, it just triggers scroll effects.
    // You already use `setupScrollEffects()` which defines its own internal scroll handler.

    // Optional: trigger any manual scroll logic here if you want.
}

function trapFocus(event, container) {
    const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
    }
}




let testimonialCardIndex = 0;
const testimonialCards = document.querySelectorAll('.testimonial-card');

function showTestimonialCard(index) {
  testimonialCards.forEach((card, i) => {
    card.classList.toggle('active', i === index);
  });
}

function nextTestimonialCard() {
  testimonialCardIndex = (testimonialCardIndex + 1) % testimonialCards.length;
  showTestimonialCard(testimonialCardIndex);
}

function prevTestimonialCard() {
  testimonialCardIndex = (testimonialCardIndex - 1 + testimonialCards.length) % testimonialCards.length;
  showTestimonialCard(testimonialCardIndex);
}

// Optional: Autoplay every 5 seconds
setInterval(nextTestimonialCard, 5000);

// Resorts Info



// ====== EXPORT FOR TESTING ======
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toggleModal,
        switchSeason,
        showToast,
        hideToast,
        isValidEmail
    };
}