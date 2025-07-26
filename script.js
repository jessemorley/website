// Portfolio Images Configuration
const portfolioImages = [
    { file: 'portfolio-04.jpg', alt: 'Portrait Photography' },
    { file: 'portfolio-01.webp', alt: 'Fashion Photography' },
    { file: 'portfolio-02.jpg', alt: 'Still Life Photography' },
    { file: 'portfolio-03.webp', alt: 'Still Life Study' },
    { file: 'portfolio-05.webp', alt: 'Fashion Editorial' },
    { file: 'portfolio-06.webp', alt: 'Portrait Session' },
    { file: 'portfolio-07.webp', alt: 'Fashion Portrait' },
    { file: 'portfolio-09.jpg', alt: 'Creative Photography' },
    { file: 'portfolio-10.jpg', alt: 'Still Life Art' }
];

// Generate gallery dynamically
function generateGallery() {
    const galleryContainer = document.querySelector('.image-grid');
    if (!galleryContainer) return; // Only run on home page
    
    // Clear existing content
    galleryContainer.innerHTML = '';
    
    // Generate gallery items
    portfolioImages.forEach((image) => {
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item fade-in';
        
        const img = document.createElement('img');
        img.src = `./images/porfolio/${image.file}`;
        img.alt = image.alt;
        img.loading = 'lazy';
        
        imageItem.appendChild(img);
        galleryContainer.appendChild(imageItem);
    });
}

// Initialize everything when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}

function initializePage() {
    // Generate gallery
    generateGallery();
    
    // Initialize animations
    initializeAnimations();
}

// Animation system
const observerOptions = {
    threshold: 0,
    rootMargin: '0px 0px 0px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Initialize animations for fade-in elements
function initializeAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach((el, index) => {
        // Add staggered delay for grid items
        if (el.closest('.image-grid')) {
            el.style.transitionDelay = `${index * 0.1}s`;
        }
        observer.observe(el);
    });
}


// Form submission handler
const form = document.querySelector('form');
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        // Simulate form submission (replace with actual submission logic)
        setTimeout(() => {
            submitBtn.textContent = 'Message Sent!';
            form.reset();
            
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        }, 1000);
    });
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

