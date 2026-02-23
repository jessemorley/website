# GSAP Blur Overlay Effect - Implementation Guide

This guide explains how to implement the smooth blur overlay navigation system from Jesse Morley Photography website in your own projects.

## Overview

The blur effect consists of two main systems:
1. **Page Overlay Blur** - Full-page blur transition using GSAP
2. **Gradual Edge Blur** - Progressive blur effect on top/bottom edges

## 1. Page Overlay Blur System

### Layer Architecture

The effect uses a three-layer system with specific z-index ordering:

```html
<!-- Layer 1: White overlay background (z-index: 48) -->
<div class="overlay-content" id="overlayContent"></div>

<!-- Layer 2: Blur layer (z-index: 49) -->
<div class="overlay-blur" id="overlayBlur"></div>

<!-- Layer 3: Content container (z-index: 50) -->
<div class="page-overlay" id="pageOverlay">
    <div class="overlay-backdrop"></div>
    <div class="overlay-body" id="overlayBody">
        <!-- Dynamic content loads here -->
    </div>
</div>
```

**Why this structure?** The white overlay sits under the blur layer so they both get blurred together, creating a unified effect.

### CSS Setup

```css
/* Layer 1: White overlay background */
.overlay-content {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0);
    z-index: 48;
}

/* Layer 2: Blur layer */
.overlay-blur {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(0px);
    z-index: 49;
    opacity: 1;
    visibility: visible;
}

/* Layer 3: Content container */
.page-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 50;
    opacity: 0;
    visibility: hidden;
}

.overlay-body {
    height: 100%;
    overflow-y: auto;
    padding: 100px 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 51;
    pointer-events: auto;
}
```

### JavaScript - GSAP Animation

Include GSAP via CDN:
```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
```

#### Show Overlay Function

```javascript
function showOverlay(activeLink) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('pageOverlay');
        const overlayBlur = document.getElementById('overlayBlur');
        const overlayContent = document.getElementById('overlayContent');
        const overlayBody = document.getElementById('overlayBody');

        // Kill any existing timeline
        if (overlayTimeline) overlayTimeline.kill();

        // Create GSAP timeline
        overlayTimeline = gsap.timeline({
            onComplete: resolve
        });

        // Set initial states
        gsap.set(overlay, { opacity: 0, visibility: 'visible' });
        gsap.set(overlayBody, { opacity: 0 });

        // Animate in sequence
        overlayTimeline
            // Step 1: Fade in overlay container (0.3s)
            .to(overlay, {
                opacity: 1,
                duration: 0.3,
                ease: "power2.out"
            })
            // Step 2: Apply blur (0.6s, overlaps by 0.1s)
            .to(overlayBlur, {
                backdropFilter: 'blur(30px)',
                duration: 0.6,
                ease: "power3.out"
            }, "-=0.1")
            // Step 3: Fade in white overlay (0.6s, simultaneous with blur)
            .to(overlayContent, {
                backgroundColor: 'rgba(255,255,255, .8)',
                duration: 0.6,
                ease: "power3.out"
            }, "-=0.6");

        document.body.style.overflow = 'hidden';
    });
}
```

**Timeline Breakdown:**
- **0-0.3s:** Overlay container fades in
- **0.2-0.8s:** Blur effect applies (30px blur)
- **0.2-0.8s:** White overlay fades to 80% opacity (runs simultaneously with blur)

The `-=` syntax creates overlaps for smoother transitions.

#### Hide Overlay Function

```javascript
function hideOverlay() {
    return new Promise((resolve) => {
        const overlay = document.getElementById('pageOverlay');
        const overlayBlur = document.getElementById('overlayBlur');
        const overlayContent = document.getElementById('overlayContent');
        const overlayBody = document.getElementById('overlayBody');

        // Kill any existing timeline
        if (overlayTimeline) overlayTimeline.kill();

        // Create GSAP timeline for exit
        overlayTimeline = gsap.timeline({
            onComplete: () => {
                document.body.style.overflow = '';
                resolve();
            }
        });

        // Animate out in reverse
        overlayTimeline
            // Step 1: Fade out content (0.2s)
            .to(overlayBody, {
                opacity: 0,
                duration: 0.2,
                ease: "power2.in"
            })
            // Step 2: Remove blur (0.6s, overlaps by 0.2s)
            .to(overlayBlur, {
                backdropFilter: 'blur(0px)',
                duration: 0.6,
                ease: "power3.in"
            }, "-=0.2")
            // Step 3: Fade out white overlay (0.6s, simultaneous with blur)
            .to(overlayContent, {
                backgroundColor: 'rgba(255,255,255, 0)',
                duration: 0.6,
                ease: "power3.in"
            }, "-=0.6")
            // Step 4: Fade out container (0.3s, overlaps by 0.2s)
            .to(overlay, {
                opacity: 0,
                duration: 0.3,
                ease: "power2.in"
            }, "-=0.2")
            // Step 5: Hide completely
            .set(overlay, { visibility: 'hidden' });
    });
}
```

#### Event Handlers

```javascript
// Navigation link click
navLinks.forEach(link => {
    link.addEventListener('click', async (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');

        // Load content and show overlay simultaneously
        const contentPromise = loadPageContent(page);
        const overlayPromise = showOverlay(link);

        await contentPromise;
        overlayBody.style.opacity = '1';
        await overlayPromise;
    });
});

// Close on backdrop click
overlayBlur.addEventListener('click', (e) => {
    if (e.target === overlayBlur) {
        hideOverlay();
    }
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
        hideOverlay();
    }
});
```

## 2. Gradual Edge Blur Effect

Creates progressive blur at top/bottom edges of the page.

### HTML Structure

```html
<div class="gradual-blur-top"></div>
<div class="gradual-blur-bottom"></div>
```

### CSS

```css
.gradual-blur-top,
.gradual-blur-bottom {
    position: fixed;
    left: 0;
    right: 0;
    height: 6rem;
    pointer-events: none;
    z-index: 50;
    isolation: isolate;
}

.gradual-blur-top {
    top: 0;
}

.gradual-blur-bottom {
    bottom: 0;
}

.gradual-blur-top > div,
.gradual-blur-bottom > div {
    position: absolute;
    inset: 0;
    opacity: 1;
}

/* Fallback for browsers without backdrop-filter support */
@supports not (backdrop-filter: blur(1px)) {
    .gradual-blur-top > div,
    .gradual-blur-bottom > div {
        background: rgba(0, 0, 0, 0.3);
        opacity: 0.5;
    }
}
```

### JavaScript Implementation

```javascript
function initializeGradualBlur() {
    const config = {
        divCount: 5,        // Number of blur layers
        strength: 2,        // Blur intensity multiplier
        exponential: true   // Use exponential progression
    };

    const topContainer = document.querySelector('.gradual-blur-top');
    const bottomContainer = document.querySelector('.gradual-blur-bottom');

    if (!topContainer || !bottomContainer) return;

    // Create blur divs
    createBlurDivs(topContainer, 'top', config);
    createBlurDivs(bottomContainer, 'bottom', config);
}

function createBlurDivs(container, position, config) {
    const increment = 100 / config.divCount;

    // Bezier curve for smooth progression
    const bezierCurve = (p) => p * p * (3 - 2 * p);

    for (let i = 1; i <= config.divCount; i++) {
        let progress = i / config.divCount;
        progress = bezierCurve(progress);

        // Calculate blur value (exponential)
        let blurValue;
        if (config.exponential) {
            blurValue = Math.pow(2, progress * 4) * 0.0625 * config.strength;
        } else {
            blurValue = 0.0625 * (progress * config.divCount + 1) * config.strength;
        }

        // Calculate gradient positions
        const p1 = Math.round((increment * i - increment) * 10) / 10;
        const p2 = Math.round(increment * i * 10) / 10;
        const p3 = Math.round((increment * i + increment) * 10) / 10;
        const p4 = Math.round((increment * i + increment * 2) * 10) / 10;

        // Build gradient string
        let gradient = `transparent ${p1}%, black ${p2}%`;
        if (p3 <= 100) gradient += `, black ${p3}%`;
        if (p4 <= 100) gradient += `, transparent ${p4}%`;

        // Determine gradient direction
        const direction = position === 'top' ? 'to top' : 'to bottom';

        // Create div element
        const div = document.createElement('div');
        div.style.maskImage = `linear-gradient(${direction}, ${gradient})`;
        div.style.webkitMaskImage = `linear-gradient(${direction}, ${gradient})`;
        div.style.backdropFilter = `blur(${blurValue.toFixed(3)}rem)`;
        div.style.webkitBackdropFilter = `blur(${blurValue.toFixed(3)}rem)`;

        container.appendChild(div);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeGradualBlur();
});
```

### How It Works

1. **Multiple layers**: Creates 5 div elements with progressively stronger blur
2. **Bezier curve**: Smooths the progression from no blur to full blur
3. **Exponential calculation**: Creates natural-looking blur transition
4. **Linear gradient masks**: Each layer is masked to only show in its designated area
5. **Backdrop-filter**: Applies the blur effect to content behind the element

**Blur progression example** (with strength=2):
- Layer 1: 0.125rem blur
- Layer 2: 0.25rem blur
- Layer 3: 0.5rem blur
- Layer 4: 1rem blur
- Layer 5: 2rem blur

## Key Concepts

### Why Use GSAP?

1. **RequestAnimationFrame integration**: Optimized timing
2. **Hardware acceleration**: Smooth 60fps animations
3. **Timeline control**: Complex sequencing with overlaps
4. **Easing functions**: Professional motion curves (power2, power3)

### Browser Compatibility

The `backdrop-filter` property requires:
- Chrome 76+
- Safari 9+ (with -webkit prefix)
- Firefox 103+
- Edge 79+

Always include fallbacks:
```css
@supports not (backdrop-filter: blur(1px)) {
    /* Fallback styling */
}
```

### Performance Considerations

1. **Use hardware-accelerated properties**: `opacity`, `transform`, `backdrop-filter`
2. **Avoid layout triggers**: Don't animate `width`, `height`, `margin`, etc.
3. **Kill timelines**: Always kill previous animations before starting new ones
4. **Use `will-change` sparingly**: Only for elements actively animating

### Customization Tips

**Adjust animation speed:**
```javascript
.to(overlayBlur, {
    backdropFilter: 'blur(30px)',
    duration: 0.4,  // Faster (was 0.6)
    ease: "power3.out"
})
```

**Change blur intensity:**
```javascript
backdropFilter: 'blur(20px)'  // Lighter blur
backdropFilter: 'blur(50px)'  // Heavier blur
```

**Modify easing:**
- `power1.out` - Gentle ease
- `power2.out` - Medium ease (default for UI)
- `power3.out` - Strong ease (dramatic)
- `power4.out` - Very strong ease

**Adjust overlay color:**
```javascript
backgroundColor: 'rgba(0,0,0, .8)'  // Dark overlay
backgroundColor: 'rgba(255,255,255, .9)'  // Lighter white
```

## Complete Minimal Example

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { margin: 0; padding: 0; }
        .content { padding: 20px; }

        .overlay-content {
            position: fixed; inset: 0; z-index: 48;
            background-color: rgba(255, 255, 255, 0);
        }
        .overlay-blur {
            position: fixed; inset: 0; z-index: 49;
            backdrop-filter: blur(0px);
        }
        .page-overlay {
            position: fixed; inset: 0; z-index: 50;
            opacity: 0; visibility: hidden;
        }
        .overlay-body {
            height: 100%; padding: 100px 32px;
            display: flex; align-items: center; justify-content: center;
        }
    </style>
</head>
<body>
    <div class="content">
        <button onclick="showOverlay()">Open Overlay</button>
        <p>Background content goes here...</p>
    </div>

    <div class="overlay-content" id="overlayContent"></div>
    <div class="overlay-blur" id="overlayBlur" onclick="hideOverlay()"></div>
    <div class="page-overlay" id="pageOverlay">
        <div class="overlay-body">
            <h1>Overlay Content</h1>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
    <script>
        let overlayTimeline = null;

        function showOverlay() {
            const overlay = document.getElementById('pageOverlay');
            const overlayBlur = document.getElementById('overlayBlur');
            const overlayContent = document.getElementById('overlayContent');

            if (overlayTimeline) overlayTimeline.kill();

            overlayTimeline = gsap.timeline();
            gsap.set(overlay, { opacity: 0, visibility: 'visible' });

            overlayTimeline
                .to(overlay, { opacity: 1, duration: 0.3, ease: "power2.out" })
                .to(overlayBlur, { backdropFilter: 'blur(30px)', duration: 0.6, ease: "power3.out" }, "-=0.1")
                .to(overlayContent, { backgroundColor: 'rgba(255,255,255,.8)', duration: 0.6, ease: "power3.out" }, "-=0.6");
        }

        function hideOverlay() {
            const overlay = document.getElementById('pageOverlay');
            const overlayBlur = document.getElementById('overlayBlur');
            const overlayContent = document.getElementById('overlayContent');

            if (overlayTimeline) overlayTimeline.kill();

            overlayTimeline = gsap.timeline();

            overlayTimeline
                .to(overlayBlur, { backdropFilter: 'blur(0px)', duration: 0.6, ease: "power3.in" })
                .to(overlayContent, { backgroundColor: 'rgba(255,255,255,0)', duration: 0.6, ease: "power3.in" }, "-=0.6")
                .to(overlay, { opacity: 0, duration: 0.3, ease: "power2.in" }, "-=0.2")
                .set(overlay, { visibility: 'hidden' });
        }
    </script>
</body>
</html>
```

## Troubleshooting

**Blur not appearing:**
- Check browser support for `backdrop-filter`
- Ensure z-index layering is correct
- Verify GSAP is loaded

**Choppy animations:**
- Reduce blur amount (30px → 20px)
- Increase duration for smoother effect
- Check for other heavy operations during animation

**Content not clickable:**
- Ensure overlay content has higher z-index than blur layer
- Add `pointer-events: auto` to content elements
- Check for overlapping transparent elements

## Credits

Implementation based on Jesse Morley Photography website (jessemorley.com)
- Built with vanilla JavaScript and GSAP
- Optimized for performance using hardware acceleration
- Mobile-responsive with touch support
