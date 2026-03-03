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
                mobileMenu.classList.remove('is-open');
                body.style.overflow = '';
            });
        }

        // Close on link click
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('is-open');
                body.style.overflow = '';
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
