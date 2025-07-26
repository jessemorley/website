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

// Generate gallery dynamically with duplication for infinite scroll
function generateGallery() {
    const galleryContainer = document.querySelector('.image-grid');
    if (!galleryContainer) return; // Only run on home page
    
    // Clear existing content
    galleryContainer.innerHTML = '';
    
    // Generate gallery items multiple times for seamless loop
    const duplicates = 3; // Number of times to duplicate the grid
    
    for (let d = 0; d < duplicates; d++) {
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
    
    // Initialize scroll-triggered grid movement
    initializeScrollMovement();
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

// Scroll-triggered grid movement with seamless infinite loop
function initializeScrollMovement() {
    const imageGrid = document.querySelector('.image-grid');
    if (!imageGrid) return;
    
    let scrollPosition = 0;
    let ticking = false;
    
    // Wait for images to load to get accurate height
    setTimeout(() => {
        const singleSetHeight = imageGrid.scrollHeight / 3; // Divide by number of duplicates
        
        function updateGridPosition() {
            // Reset position seamlessly when we've scrolled through one complete set
            if (scrollPosition >= singleSetHeight) {
                scrollPosition = scrollPosition - singleSetHeight;
            } else if (scrollPosition < 0) {
                scrollPosition = scrollPosition + singleSetHeight;
            }
            
            imageGrid.style.transform = `translateY(-${scrollPosition}px)`;
            ticking = false;
        }
        
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateGridPosition);
                ticking = true;
            }
        }
        
        // Use wheel event since body has overflow hidden
        window.addEventListener('wheel', (e) => {
            e.preventDefault();
            scrollPosition += e.deltaY * 0.5; // Adjust scroll speed
            requestTick();
        }, { passive: false });
        
        // Also handle keyboard scrolling
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === ' ') {
                e.preventDefault();
                scrollPosition += 100;
                requestTick();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                scrollPosition -= 100;
                requestTick();
            }
        });
    }, 500); // Wait for images to load
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

