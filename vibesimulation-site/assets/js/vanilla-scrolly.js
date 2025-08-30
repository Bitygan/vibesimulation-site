/**
 * Vanilla JavaScript Smooth Scrolling
 * Replacement for jquery.scrolly.min.js
 */

const scrolly = (function() {
    'use strict';

    function init() {
        // Find all elements with scrolly class
        const scrollyElements = document.querySelectorAll('.scrolly');

        scrollyElements.forEach(function(element) {
            element.addEventListener('click', function(e) {
                const href = element.getAttribute('href');

                // Only handle anchor links
                if (!href || href.charAt(0) !== '#') {
                    return;
                }

                const target = document.querySelector(href);
                if (!target) {
                    return;
                }

                e.preventDefault();

                // Get target position
                const targetRect = target.getBoundingClientRect();
                const targetTop = window.pageYOffset + targetRect.top;

                // Scroll smoothly to target
                window.scrollTo({
                    top: targetTop,
                    behavior: 'smooth'
                });
            });
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        init: init
    };
})();

// Make it available globally
window.scrolly = scrolly;
