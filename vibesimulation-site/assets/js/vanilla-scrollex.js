/**
 * Vanilla JavaScript Scroll Effects
 * Replacement for jquery.scrollex.min.js
 */

const scrollex = (function() {
    'use strict';

    let elements = [];
    let ticking = false;

    function init() {
        // Find all elements that should have scroll effects
        const scrollElements = document.querySelectorAll('[data-scrollex]');

        scrollElements.forEach(function(element) {
            setupScrollex(element);
        });

        // Also handle elements with specific classes that need scroll effects
        const spotlightElements = document.querySelectorAll('.spotlight');
        const wrapperElements = document.querySelectorAll('.wrapper');

        spotlightElements.forEach(function(element) {
            setupScrollex(element, {
                mode: 'middle',
                top: '-20%',
                bottom: 0,
                initialize: function(t) { element.classList.add('inactive'); },
                terminate: function(t) { element.classList.remove('inactive'); },
                enter: function(t) { element.classList.remove('inactive'); }
            });
        });

        wrapperElements.forEach(function(element) {
            setupScrollex(element, {
                top: 250,
                bottom: 0,
                initialize: function(t) { element.classList.add('inactive'); },
                terminate: function(t) { element.classList.remove('inactive'); },
                enter: function(t) { element.classList.remove('inactive'); }
            });
        });

        // Start listening for scroll events
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });

        // Initial check
        onScroll();
    }

    function setupScrollex(element, options) {
        const config = Object.assign({
            mode: 'middle',
            top: 0,
            bottom: 0,
            initialize: null,
            terminate: null,
            enter: null,
            leave: null
        }, options);

        // Parse data attributes
        if (element.dataset.scrollex) {
            try {
                const dataConfig = JSON.parse(element.dataset.scrollex);
                Object.assign(config, dataConfig);
            } catch (e) {
                console.warn('Invalid scrollex data attribute:', element.dataset.scrollex);
            }
        }

        elements.push({
            element: element,
            config: config,
            state: 'unknown'
        });
    }

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(updateElements);
            ticking = true;
        }
    }

    function updateElements() {
        const viewportHeight = window.innerHeight;
        const scrollTop = window.pageYOffset;

        elements.forEach(function(item) {
            const element = item.element;
            const config = item.config;
            const rect = element.getBoundingClientRect();

            // Calculate element position relative to viewport
            const elementTop = rect.top + scrollTop;
            const elementHeight = rect.height;
            const elementBottom = elementTop + elementHeight;

            // Calculate trigger points
            let topTrigger, bottomTrigger;

            switch (config.mode) {
                case 'top':
                    topTrigger = elementTop + parseValue(config.top, viewportHeight);
                    bottomTrigger = elementBottom + parseValue(config.bottom, viewportHeight);
                    break;
                case 'bottom':
                    topTrigger = elementTop + parseValue(config.top, viewportHeight);
                    bottomTrigger = elementBottom + parseValue(config.bottom, viewportHeight);
                    break;
                case 'middle':
                    topTrigger = elementTop + elementHeight / 2 + parseValue(config.top, viewportHeight);
                    bottomTrigger = elementTop + elementHeight / 2 + parseValue(config.bottom, viewportHeight);
                    break;
                case 'bottom-only':
                    topTrigger = elementBottom + parseValue(config.top, viewportHeight);
                    bottomTrigger = elementBottom + parseValue(config.bottom, viewportHeight);
                    break;
                default:
                    topTrigger = elementTop + parseValue(config.top, viewportHeight);
                    bottomTrigger = elementBottom + parseValue(config.bottom, viewportHeight);
            }

            // Determine if element should be active
            const shouldBeActive = scrollTop >= topTrigger && scrollTop <= bottomTrigger;
            const newState = shouldBeActive ? 'active' : 'inactive';

            // Only trigger callbacks if state changed
            if (newState !== item.state) {
                item.state = newState;

                if (newState === 'active') {
                    if (config.enter) config.enter(0);
                } else {
                    if (config.leave) config.leave(0);
                }

                // Update element classes
                if (newState === 'active') {
                    element.classList.remove('inactive');
                } else {
                    element.classList.add('inactive');
                }
            }

            // Trigger initialize/terminate if needed
            if (item.state === 'unknown') {
                if (config.initialize) config.initialize(0);
                item.state = newState;
            }
        });

        ticking = false;
    }

    function parseValue(value, viewportHeight) {
        if (typeof value === 'string') {
            if (value.endsWith('%')) {
                return (parseFloat(value) / 100) * viewportHeight;
            } else if (value.endsWith('px')) {
                return parseFloat(value);
            }
        }
        return parseFloat(value) || 0;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        init: init,
        setupScrollex: setupScrollex
    };
})();

// Make it available globally
window.scrollex = scrollex;
