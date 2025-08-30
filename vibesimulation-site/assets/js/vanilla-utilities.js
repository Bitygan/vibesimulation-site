/**
 * Vanilla JavaScript Utilities
 * Replacement for util.js functions
 */

const utilities = (function() {
    'use strict';

    /**
     * Generate an indented list of links from a nav. Meant for use with panel().
     * @param {Element} element - The navigation element
     * @return {string} HTML string of indented links
     */
    function navList(element) {
        const links = element.querySelectorAll('a');
        const items = [];

        links.forEach(function(link) {
            const li = link.closest('li');
            const indent = li ? Math.max(0, getParents(li, 'li').length - 1) : 0;
            const href = link.getAttribute('href') || '';
            const target = link.getAttribute('target') || '';

            items.push(
                '<a ' +
                    'class="link depth-' + indent + '"' +
                    (target ? ' target="' + target + '"' : '') +
                    (href ? ' href="' + href + '"' : '') +
                '>' +
                    '<span class="indent-' + indent + '"></span>' +
                    link.textContent +
                '</a>'
            );
        });

        return items.join('');
    }

    /**
     * Panel-ify an element with mobile-friendly behavior
     * @param {Element} element - The element to panel-ify
     * @param {object} config - Configuration options
     */
    function panel(element, config) {
        if (!element) return;

        config = Object.assign({
            delay: 0,
            hideOnClick: false,
            hideOnEscape: false,
            hideOnSwipe: false,
            resetScroll: false,
            resetForms: false,
            side: null,
            target: element,
            visibleClass: 'visible'
        }, config);

        let touchPosX = null;
        let touchPosY = null;

        // Methods
        function hide(event) {
            if (!config.target.classList.contains(config.visibleClass)) return;

            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }

            config.target.classList.remove(config.visibleClass);

            setTimeout(function() {
                if (config.resetScroll) {
                    element.scrollTop = 0;
                }

                if (config.resetForms) {
                    const forms = element.querySelectorAll('form');
                    forms.forEach(function(form) {
                        form.reset();
                    });
                }
            }, config.delay);
        }

        // Event listeners
        element.style.webkitOverflowScrolling = 'touch';

        if (config.hideOnClick) {
            const links = element.querySelectorAll('a');
            links.forEach(function(link) {
                link.style.webkitTapHighlightColor = 'rgba(0,0,0,0)';
                link.addEventListener('click', function(event) {
                    const href = link.getAttribute('href');
                    if (!href || href === '#' || href === '#' + element.id) return;

                    event.preventDefault();
                    event.stopPropagation();
                    hide();

                    setTimeout(function() {
                        if (link.target === '_blank') {
                            window.open(href);
                        } else {
                            window.location.href = href;
                        }
                    }, config.delay + 10);
                });
            });
        }

        // Touch events
        element.addEventListener('touchstart', function(event) {
            touchPosX = event.touches[0].pageX;
            touchPosY = event.touches[0].pageY;
        });

        element.addEventListener('touchmove', function(event) {
            if (touchPosX === null || touchPosY === null) return;

            const diffX = touchPosX - event.touches[0].pageX;
            const diffY = touchPosY - event.touches[0].pageY;
            const boundary = 20;
            const delta = 50;

            let result = false;

            switch (config.side) {
                case 'left':
                    result = Math.abs(diffY) < boundary && diffX > delta;
                    break;
                case 'right':
                    result = Math.abs(diffY) < boundary && diffX < -delta;
                    break;
                case 'top':
                    result = Math.abs(diffX) < boundary && diffY > delta;
                    break;
                case 'bottom':
                    result = Math.abs(diffX) < boundary && diffY < -delta;
                    break;
            }

            if (result) {
                touchPosX = null;
                touchPosY = null;
                hide();
                return false;
            }
        });

        // Prevent bubbling
        element.addEventListener('click', stopPropagation);
        element.addEventListener('touchend', stopPropagation);
        element.addEventListener('touchstart', stopPropagation);
        element.addEventListener('touchmove', stopPropagation);

        // Hide on anchor click
        element.addEventListener('click', function(event) {
            if (event.target.matches('a[href="#' + element.id + '"]')) {
                event.preventDefault();
                event.stopPropagation();
                config.target.classList.remove(config.visibleClass);
            }
        });

        // Global hide events
        document.addEventListener('click', hide);
        document.addEventListener('touchend', hide);

        // Toggle functionality
        document.addEventListener('click', function(event) {
            if (event.target.matches('a[href="#' + element.id + '"]')) {
                event.preventDefault();
                event.stopPropagation();
                config.target.classList.toggle(config.visibleClass);
            }
        });

        // Escape key
        if (config.hideOnEscape) {
            window.addEventListener('keydown', function(event) {
                if (event.keyCode === 27) {
                    hide(event);
                }
            });
        }
    }

    /**
     * Placeholder polyfill for older browsers
     * @param {Element} form - The form element to apply placeholder polyfill to
     */
    function placeholder(form) {
        if (typeof document.createElement('input').placeholder !== 'undefined') return;

        const inputs = form.querySelectorAll('input[type="text"], input[type="password"], textarea');

        inputs.forEach(function(input) {
            const placeholder = input.getAttribute('placeholder');
            if (!placeholder) return;

            if (input.value === '' || input.value === placeholder) {
                input.classList.add('polyfill-placeholder');
                input.value = placeholder;
            }

            input.addEventListener('blur', function() {
                if (input.value === '') {
                    input.classList.add('polyfill-placeholder');
                    input.value = placeholder;
                }
            });

            input.addEventListener('focus', function() {
                if (input.value === placeholder) {
                    input.classList.remove('polyfill-placeholder');
                    input.value = '';
                }
            });
        });
    }

    /**
     * Prioritize elements (move to/from first positions of their parents)
     * @param {string|Element[]} elements - Elements to prioritize
     * @param {boolean} condition - If true, moves elements to the top
     */
    function prioritize(elements, condition) {
        const key = '__prioritize';

        if (typeof elements === 'string') {
            elements = document.querySelectorAll(elements);
        }

        if (!elements.length) return;

        Array.from(elements).forEach(function(element) {
            const parent = element.parentElement;
            if (!parent) return;

            if (!element[key]) {
                if (!condition) return;

                const prev = element.previousElementSibling;
                if (!prev) return;

                parent.insertBefore(element, parent.firstElementChild);
                element[key] = prev;
            } else {
                if (condition) return;

                const prev = element[key];
                if (prev.parentElement) {
                    prev.parentElement.insertBefore(element, prev.nextElementSibling);
                }

                delete element[key];
            }
        });
    }

    /**
     * Get all parent elements matching a selector
     * @param {Element} element - The element to start from
     * @param {string} selector - The selector to match
     * @return {Element[]} Array of matching parent elements
     */
    function getParents(element, selector) {
        const parents = [];
        let current = element.parentElement;

        while (current) {
            if (current.matches && current.matches(selector)) {
                parents.push(current);
            }
            current = current.parentElement;
        }

        return parents;
    }

    /**
     * Stop event propagation
     * @param {Event} event - The event to stop
     */
    function stopPropagation(event) {
        event.stopPropagation();
    }

    return {
        navList: navList,
        panel: panel,
        placeholder: placeholder,
        prioritize: prioritize,
        getParents: getParents
    };
})();

// Make it available globally
window.utilities = utilities;
