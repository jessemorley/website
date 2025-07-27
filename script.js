// Portfolio Images Configuration
const portfolioImages = [
    { file: 'portfolio-04.jpg', alt: 'Green Night Scene' },
    { file: 'portfolio-01.webp', alt: 'Silver Rings on Red' },
    { file: 'portfolio-02.webp', alt: 'After Still Life' },
    { file: 'portfolio-03.webp', alt: 'After BTS' },
    { file: 'portfolio-06.webp', alt: 'Fashion Portrait' },
    { file: 'portfolio-07.webp', alt: 'Fashion Portrait' },
    { file: 'portfolio-08.webp', alt: 'Still Life Ring on Can' },
    { file: 'portfolio-09.webp', alt: 'Still Life Items in Tray' },
    { file: 'portfolio-10.jpg', alt: 'Still Life Fruit and Paint' },

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
            img.loading = 'eager';
            
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
    // Set current year
    setCurrentYear();
    
    // Generate gallery
    generateGallery();
    
    // Initialize preloader
    initializePreloader();
    
    // Initialize animations
    initializeAnimations();
    
    // Initialize scroll-triggered grid movement
    initializeScrollMovement();
    
    // Initialize overlay navigation
    initializeOverlayNav();
}

// Set current year in copyright
function setCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Preloader functionality
function initializePreloader() {
    const preloader = document.querySelector('.preloader');
    const preloaderBlur = document.querySelector('.preloader-blur');
    
    // Check if page has been loaded before in this session
    if (sessionStorage.getItem('pageLoaded')) {
        preloader.classList.add('hidden');
        preloaderBlur.classList.add('hidden');
        return;
    }
    
    const percentage = document.querySelector('.percentage');
    const logo = document.querySelector('.preloader-logo');
    const images = document.querySelectorAll('img');
    
    let loadedCount = 0;
    let totalCount = images.length;
    
    // Update percentage display and logo rotation
    function updatePercentage() {
        const percent = Math.round((loadedCount / totalCount) * 100);
        percentage.textContent = `${percent}%`;
        
        // Rotate logo based on loading progress (0% = 0°, 100% = 18000°)
        const rotation = (percent / 100) * 18000;
        logo.style.transform = `rotate(${rotation}deg)`;
        
        if (loadedCount === totalCount) {
            setTimeout(() => {
                preloader.classList.add('hidden');
                preloaderBlur.classList.add('hidden');
                // Mark page as loaded in this session
                sessionStorage.setItem('pageLoaded', 'true');
            }, 500); // Small delay before hiding
        }
    }
    
    // Track image loading
    images.forEach(img => {
        if (img.complete) {
            loadedCount++;
        } else {
            img.addEventListener('load', () => {
                loadedCount++;
                updatePercentage();
            });
            img.addEventListener('error', () => {
                loadedCount++;
                updatePercentage();
            });
        }
    });
    
    // Initial percentage update
    updatePercentage();
}

// Animation system
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
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
            // Show all images immediately on page load
            el.classList.add('visible');
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
        // Ensure all images are loaded before calculating height
        const images = imageGrid.querySelectorAll('img');
        let loadedImages = 0;
        
        const checkHeight = () => {
            const totalHeight = imageGrid.scrollHeight;
            const singleSetHeight = Math.floor(totalHeight / 3); // Back to simple division
            
            console.log('Portfolio images:', portfolioImages.length);
            console.log('Total grid height:', totalHeight);
            console.log('Single set height:', singleSetHeight);
            console.log('Should have', portfolioImages.length * 3, 'total images');
            
            if (singleSetHeight === 0) {
                console.log('Height not ready, retrying...');
                setTimeout(checkHeight, 100);
                return;
            }
        
        function updateGridPosition() {
            // Keep scroll position within reasonable bounds to prevent large jumps
            while (scrollPosition >= singleSetHeight) {
                scrollPosition -= singleSetHeight;
            }
            while (scrollPosition < 0) {
                scrollPosition += singleSetHeight;
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
        
        // Handle wheel events for desktop
        window.addEventListener('wheel', (e) => {
            e.preventDefault();
            scrollPosition += e.deltaY * 0.5; // Adjust scroll speed
            requestTick();
        }, { passive: false });
        
        // Handle touch events for mobile with momentum
        let touchStartY = 0;
        let touchEndY = 0;
        let touchStartTime = 0;
        let velocity = 0;
        let momentumAnimation = null;
        
        window.addEventListener('touchstart', (e) => {
            // Only handle if overlay is not active
            if (document.getElementById('pageOverlay').classList.contains('active')) return;
            
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
            velocity = 0;
            // Stop any existing momentum
            if (momentumAnimation) {
                cancelAnimationFrame(momentumAnimation);
                momentumAnimation = null;
            }
        }, { passive: true });
        
        window.addEventListener('touchmove', (e) => {
            // Only handle if overlay is not active
            if (document.getElementById('pageOverlay').classList.contains('active')) return;
            
            e.preventDefault();
            touchEndY = e.touches[0].clientY;
            const deltaY = touchStartY - touchEndY;
            const deltaTime = Date.now() - touchStartTime;
            
            // Calculate velocity
            if (deltaTime > 0) {
                velocity = deltaY / deltaTime;
            }
            
            scrollPosition += deltaY * 1.2; // Adjust touch sensitivity
            touchStartY = touchEndY;
            touchStartTime = Date.now();
            requestTick();
        }, { passive: false });
        
        window.addEventListener('touchend', () => {
            // Only handle if overlay is not active
            if (document.getElementById('pageOverlay').classList.contains('active')) return;
            
            // Apply momentum scrolling
            if (Math.abs(velocity) > 0.05) {
                const applyMomentum = () => {
                    // Stop momentum if overlay becomes active
                    if (document.getElementById('pageOverlay').classList.contains('active')) {
                        momentumAnimation = null;
                        return;
                    }
                    
                    velocity *= 0.95; // Friction factor
                    scrollPosition += velocity * 16; // Apply velocity (16ms per frame)
                    requestTick();
                    
                    if (Math.abs(velocity) > 0.01) {
                        momentumAnimation = requestAnimationFrame(applyMomentum);
                    } else {
                        momentumAnimation = null;
                    }
                };
                applyMomentum();
            }
        }, { passive: true });
        
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
        
        };
        
        checkHeight(); // Start the height check
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

// Overlay Navigation System with GSAP
function initializeOverlayNav() {
    const overlay = document.getElementById('pageOverlay');
    const overlayBlur = document.getElementById('overlayBlur');
    const overlayBody = document.getElementById('overlayBody');
    const navLinks = document.querySelectorAll('.nav-link[data-page]');
    let currentActiveLink = null;
    let overlayTimeline = null;
    
    // Handle navigation link clicks
    navLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            
            // If clicking the currently active link, close the overlay
            if (link === currentActiveLink) {
                hideOverlay();
                return;
            }
            
            // Start overlay transition first
            await showOverlay(link);
            // Load content and animate it in
            await loadPageContent(page);
            animateContentIn();
        });
    });
    
    // Handle backdrop click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.classList.contains('overlay-backdrop')) {
            hideOverlay();
        }
    });
    
    // Handle escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            hideOverlay();
        }
    });
    
    async function loadPageContent(page) {
        try {
            const response = await fetch(`${page}.html`);
            const html = await response.text();
            
            // Extract content from the main element
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const mainContent = doc.querySelector('main');
            
            if (mainContent) {
                overlayBody.innerHTML = mainContent.innerHTML;
                // Initialize any fade-in animations for the loaded content
                initializeAnimations();
            }
        } catch (error) {
            console.error('Error loading page content:', error);
            overlayBody.innerHTML = '<p>Error loading content. Please try again.</p>';
        }
    }
    
    function showOverlay(activeLink) {
        return new Promise((resolve) => {
            // Remove active class from all links
            navLinks.forEach(link => link.classList.remove('active'));
            // Add active class to current link
            activeLink.classList.add('active');
            currentActiveLink = activeLink;
            
            // Kill any existing timeline
            if (overlayTimeline) overlayTimeline.kill();
            
            // Create GSAP timeline for smooth overlay entrance
            overlayTimeline = gsap.timeline({
                onComplete: resolve
            });
            
            // Set initial states
            gsap.set(overlay, { opacity: 0, visibility: 'visible' });
            gsap.set(overlayBody, { opacity: 0 });
            
            // Animate in sequence
            overlayTimeline
                .to(overlayBlur, { 
                    backdropFilter: 'blur(30px)', 
                    duration: 0.4, 
                    ease: "power2.out" 
                })
                .to(overlay, { 
                    opacity: 1, 
                    duration: 0.3, 
                    ease: "power2.out" 
                }, "-=0.2")
                .to(overlay.querySelector('.overlay-content'), {
                    backgroundColor: 'rgba(255,255,255, .9)',
                    duration: 0.4,
                    ease: "power2.out"
                }, "-=0.3");
                
            document.body.style.overflow = 'hidden';
        });
    }
    
    function hideOverlay() {
        return new Promise((resolve) => {
            // Remove active class from all links
            navLinks.forEach(link => link.classList.remove('active'));
            currentActiveLink = null;
            
            // Kill any existing timeline
            if (overlayTimeline) overlayTimeline.kill();
            
            // Create GSAP timeline for smooth overlay exit
            overlayTimeline = gsap.timeline({
                onComplete: () => {
                    document.body.style.overflow = '';
                    resolve();
                }
            });
            
            // Animate out in reverse sequence
            overlayTimeline
                .to(overlayBody, { 
                    opacity: 0, 
                    duration: 0.2, 
                    ease: "power2.in" 
                })
                .to(overlay.querySelector('.overlay-content'), {
                    backgroundColor: 'rgba(255,255,255, 0)',
                    duration: 0.3,
                    ease: "power2.in"
                }, "-=0.1")
                .to(overlay, { 
                    opacity: 0, 
                    duration: 0.3, 
                    ease: "power2.in" 
                }, "-=0.2")
                .to(overlayBlur, { 
                    backdropFilter: 'blur(0px)', 
                    duration: 0.4, 
                    ease: "power2.in" 
                }, "-=0.3")
                .set(overlay, { visibility: 'hidden' });
        });
    }
    
    function animateContentIn() {
        gsap.fromTo(overlayBody, 
            { 
                opacity: 0, 
                y: 20 
            },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.5, 
                ease: "power2.out" 
            }
        );
    }
}

