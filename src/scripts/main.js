document.addEventListener('DOMContentLoaded', () => {
    console.log('Enlace Societario loaded');

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
