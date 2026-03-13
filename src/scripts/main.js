document.addEventListener('DOMContentLoaded', () => {
    console.log('Enlace Societario loaded');

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

    /* --- Mobile Menu --- */
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    const mobileMenu = document.getElementById('mobileMenu');
    const body = document.body;

    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            mobileMenu.classList.add('is-open');
            body.style.overflow = 'hidden';
        });

        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', (e) => {
                e.preventDefault();
                toggleMobileMenu();
            });
        }

        // Close on link click
        const mobileLinks = mobileMenu.querySelectorAll('a');
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

        // Close on backdrop click
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) {
                mobileMenu.classList.remove('is-open');
                body.style.overflow = '';
            }
        });
    }
});
