// Portfolio Images Configuration
const portfolioImages = [
    { file: 'portfolio-04.jpg', alt: 'Green Night Scene' },
    { file: 'portfolio-06.webp', alt: 'Fashion Portrait Mali' },
    { file: 'portfolio-02.webp', alt: 'After Still Life' },
    { file: 'portfolio-09.webp', alt: 'Still Life Items in Tray' },
    { file: 'portfolio-03.webp', alt: 'After BTS' },
    { file: 'portfolio-07.webp', alt: 'Fashion Portrait Mariangel' },
    { file: 'portfolio-01.webp', alt: 'Silver Rings on Red' },
    { file: 'portfolio-08.webp', alt: 'Still Life Ring on Can' },
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
            imageItem.className = 'image-item';
            
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
    
    // Initialize logo behavior
    initializeLogoBehavior();
    
    // Initialize obfuscated email
    initializeObfuscatedEmail();
    
    // Handle hash on page load
    handleHashOnLoad();
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

// Initialize animations - now just a placeholder
function initializeAnimations() {
    // No animations - all elements show immediately
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
            
            
            if (singleSetHeight === 0) {
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



// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return; // Skip empty hash links
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Global overlay variables and functions
let overlayTimeline = null;
let currentActiveLink = null;

// Overlay Navigation System with GSAP
function initializeOverlayNav() {
    const overlay = document.getElementById('pageOverlay');
    const overlayBlur = document.getElementById('overlayBlur');
    const overlayContent = document.getElementById('overlayContent');
    const overlayBody = document.getElementById('overlayBody');
    const navLinks = document.querySelectorAll('.nav-link[data-page]');
    
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
            
            // Load content and start overlay transition simultaneously
            const contentPromise = loadPageContent(page);
            const overlayPromise = showOverlay(link);
            
            await contentPromise;
            // Set content visible during the overlay animation (not immediately)
            setTimeout(() => {
                console.log('Normal nav click: setting overlayBody opacity to 1 at time:', Date.now());
                overlayBody.style.opacity = '1';
            }, 200); // Delay to show content during the blur animation phase
            
            await overlayPromise;
        });
    });
    
    // Handle backdrop click
    overlayBlur.addEventListener('click', (e) => {
        if (e.target === overlayBlur) {
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
            console.log('Loading page content for:', page);
            const response = await fetch(`${page}.html`);
            const html = await response.text();
            console.log('Fetched HTML length:', html.length);
            
            // Extract content from the main element
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const mainContent = doc.querySelector('main');
            
            if (mainContent) {
                console.log('Main content found, innerHTML length:', mainContent.innerHTML.length);
                overlayBody.innerHTML = mainContent.innerHTML;
                console.log('Content set in overlayBody, new innerHTML length:', overlayBody.innerHTML.length);
                // Re-initialize email obfuscation after loading new content
                initializeObfuscatedEmail();
            } else {
                console.log('No main content found in fetched HTML');
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
                .to(overlay, { 
                    opacity: 1, 
                    duration: 0.3, 
                    ease: "power2.out" 
                })
                .to(overlayBlur, {
                    backdropFilter: 'blur(30px)',
                    duration: 0.6,
                    ease: "power3.out"
                }, "-=0.1")
                .to(overlayContent, {
                    backgroundColor: 'rgba(255,255,255, .8)',
                    duration: 0.6,
                    ease: "power3.out"
                }, "-=0.6");
                
            document.body.style.overflow = 'hidden';
        });
    }
    
}

// Global hideOverlay function
function hideOverlay() {
    return new Promise((resolve) => {
        const overlay = document.getElementById('pageOverlay');
        const overlayBlur = document.getElementById('overlayBlur');
        const overlayContent = document.getElementById('overlayContent');
        const overlayBody = document.getElementById('overlayBody');
        const navLinks = document.querySelectorAll('.nav-link[data-page]');
        
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
            .to(overlayBlur, {
                backdropFilter: 'blur(0px)',
                duration: 0.6,
                ease: "power3.in"
            }, "-=0.2")
            .to(overlayContent, {
                backgroundColor: 'rgba(255,255,255, 0)',
                duration: 0.6,
                ease: "power3.in"
            }, "-=0.6")
            .to(overlay, { 
                opacity: 0, 
                duration: 0.3, 
                ease: "power2.in" 
            }, "-=0.2")
            .set(overlay, { visibility: 'hidden' });
    });
}

// Email obfuscation to prevent spam bots
function initializeObfuscatedEmail() {
    const emailLink = document.getElementById('email-link');
    if (emailLink) {
        const parts = ['hi', 'jessemorley', 'com'];
        const email = parts[0] + '@' + parts[1] + '.' + parts[2];
        emailLink.innerHTML = '<a href="mailto:' + email + '" class="email-link">' + email + '</a>';
    }
}

// Logo behavior - close overlay if open, otherwise go to home
function initializeLogoBehavior() {
    const logoLink = document.querySelector('.logo a');
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault(); // Always prevent default
            const overlay = document.getElementById('pageOverlay');
            if (overlay && (overlay.style.opacity === '1' || overlay.style.visibility === 'visible')) {
                hideOverlay();
            } else if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
                // If no overlay is active and not on home page, go to home
                window.location.href = 'index.html';
            }
            // If already on home page with no overlay, do nothing
        });
    }
}

// Handle hash navigation on page load
function handleHashOnLoad() {
    const hash = window.location.hash.slice(1); // Remove the # symbol
    if (hash && (hash === 'info' || hash === 'contact')) {
        // Find the corresponding nav link
        const navLink = document.querySelector(`.nav-link[data-page="${hash}"]`);
        if (navLink) {
            // Longer delay to ensure all initialization is complete, especially on slower connections
            setTimeout(async () => {
                console.log('Triggering hash navigation for:', hash);
                
                // Check if overlay system is ready
                if (!window.gsap) {
                    console.error('GSAP not loaded, retrying hash navigation...');
                    setTimeout(() => handleHashOnLoad(), 500);
                    return;
                }
                
                // Manually replicate the nav link click logic
                const overlay = document.getElementById('pageOverlay');
                const overlayBlur = document.getElementById('overlayBlur');
                const overlayContent = document.getElementById('overlayContent');
                const overlayBody = document.getElementById('overlayBody');
                const navLinks = document.querySelectorAll('.nav-link[data-page]');
                
                // Simply trigger the nav link click to get proper timing and content loading
                console.log('Triggering nav link click for hash:', hash);
                console.log('Nav link found:', navLink);
                console.log('Current active link before click:', currentActiveLink);
                const clickEvent = new Event('click', { bubbles: true, cancelable: true });
                navLink.dispatchEvent(clickEvent);
                console.log('Click event dispatched');
                
            }, 500);
        }
    }
}

// Download jsync function
function downloadJsync(event) {
    event.preventDefault();
    console.log('Download link clicked');
    
    fetch('https://api.github.com/repos/jessemorley/jsync/releases/latest')
        .then(response => response.json())
        .then(data => {
            console.log('GitHub API response:', data);
            const zipAsset = data.assets.find(asset => asset.name.endsWith('.zip'));
            if (zipAsset) {
                console.log('Found zip asset:', zipAsset.browser_download_url);
                window.open(zipAsset.browser_download_url, '_blank');
            } else {
                console.log('No zip asset found');
            }
        })
        .catch(error => {
            console.error('Error fetching release:', error);
        });
}
