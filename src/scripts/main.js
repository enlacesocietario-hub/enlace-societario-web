document.addEventListener('DOMContentLoaded', () => {
    console.log('Enlace Societario loaded');

    /* --- Tally Form Lazy Injection --- */
    if (document.body.getAttribute('data-form-mode') === 'tally' && document.querySelector('iframe[data-tally-src]')) {
        var d=document,w="https://tally.so/widgets/embed.js",v=function(){"undefined"!=typeof Tally?Tally.loadEmbeds():d.querySelectorAll("iframe[data-tally-src]:not([src])").forEach((function(e){e.src=e.dataset.tallySrc}))};if("undefined"!=typeof Tally)v();else if(d.querySelector('script[src="'+w+'"]')==null){var s=d.createElement("script");s.src=w,s.onload=v,s.onerror=v,d.body.appendChild(s);}
    }

    /* --- Typewriter Effect for Hero H1 --- */
    const typewriterEl = document.getElementById('hero-typewriter');
    if (typewriterEl) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            typewriterEl.style.visibility = 'visible';
        } else {
            const text = typewriterEl.textContent;
            typewriterEl.innerHTML = '';
            typewriterEl.style.visibility = 'visible';
            
            const chars = [];
            // We iterate over the characters to wrap each in a span.
            for (let i = 0; i < text.length; i++) {
                const charSpan = document.createElement('span');
                charSpan.textContent = text[i];
                charSpan.style.visibility = 'hidden';
                typewriterEl.appendChild(charSpan);
                chars.push(charSpan);
            }
            
            const cursor = document.createElement('span');
            cursor.className = 'typewriter-cursor';
            typewriterEl.appendChild(cursor);
            
            let charIndex = 0;
            const baseSpeed = 40; // Base speed per char in ms
            
            function typeNextChar() {
                if (charIndex < chars.length) {
                    chars[charIndex].style.visibility = 'visible';
                    // Move the cursor right after the currently visible character
                    typewriterEl.insertBefore(cursor, chars[charIndex].nextSibling);
                    charIndex++;
                    
                    // Minor organic speed variations
                    const randomDelay = baseSpeed + (Math.random() * 20 - 10);
                    setTimeout(typeNextChar, randomDelay);
                } else {
                    // Turn off cursor after a while to stay elegant
                    setTimeout(() => {
                        cursor.style.display = 'none';
                    }, 4000);
                }
            }
            
            // Wait slightly before starting the animation
            setTimeout(typeNextChar, 300);
        }
    }

    /* --- Transparent Navbar Scroll Logic --- */
    const mainHeader = document.querySelector('.main-header');
    const SCROLL_THRESHOLD = 50;

    if (mainHeader) {
        const handleScroll = () => {
            if (window.scrollY > SCROLL_THRESHOLD) {
                mainHeader.classList.add('is-scrolled');
            } else {
                mainHeader.classList.remove('is-scrolled');
            }
        };

        // Initial check in case the page is loaded scrolled down
        handleScroll();

        // Add scroll listener
        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    /* --- FAQ Accordion (Exclusive) --- */
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        item.addEventListener('toggle', (e) => {
            if (item.open) {
                // If this one is opening, close all others
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.open = false;
                    }
                });
            }
        });
    });

    // Future: Form validation logic here

    /* --- Mobile Menu Logic --- */
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    const mobileMenu = document.getElementById('mobileMenu');
    const body = document.body;

    function toggleMobileMenu() {
        console.log('Toggling menu');
        const isOpen = mobileMenu.classList.contains('is-open');

        if (!isOpen) {
            // Opening
            console.log('Opening menu');
            mobileMenu.style.display = 'flex';
            // Force reflow
            mobileMenu.offsetHeight;
            mobileMenu.classList.add('is-open');
            body.classList.add('menu-open');
            body.style.overflow = 'hidden';
        } else {
            // Closing
            console.log('Closing menu');
            mobileMenu.classList.remove('is-open');
            body.classList.remove('menu-open');
            body.style.overflow = '';
            // Wait for transition (300ms)
            setTimeout(() => {
                if (!mobileMenu.classList.contains('is-open')) {
                    mobileMenu.style.display = 'none';
                }
            }, 300);
        }
    }

    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            toggleMobileMenu();
        });

        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', (e) => {
                e.preventDefault();
                toggleMobileMenu();
            });
        }

        // Close on link click
        const mobileLinks = mobileMenu.querySelectorAll('a:not(.mobile-dropdown-header > a)');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                toggleMobileMenu();
            });
        });

        // Dropdown toggle for mobile
        const mobileDropdownToggles = mobileMenu.querySelectorAll('.mobile-dropdown-toggle');
        mobileDropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const parent = toggle.closest('.mobile-nav-dropdown');
                const menu = parent.querySelector('.mobile-dropdown-menu');
                const isActive = parent.classList.contains('is-active');

                if (isActive) {
                    parent.classList.remove('is-active');
                    menu.style.display = 'none';
                } else {
                    parent.classList.add('is-active');
                    menu.style.display = 'block';
                }
            });
        });

        // Close on backdrop click (optional logic)
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) {
                toggleMobileMenu();
            }
        });
    }
});
