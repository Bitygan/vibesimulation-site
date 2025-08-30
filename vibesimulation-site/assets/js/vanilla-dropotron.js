/**
 * Vanilla JavaScript Dropdown Menu
 * Replacement for jquery.dropotron.min.js
 */

const dropotron = (function() {
    'use strict';

    let config = {
        baseZIndex: 1000,
        menuClass: 'dropotron',
        expandMode: 'hover',
        hoverDelay: 150,
        hideDelay: 250,
        openerClass: 'opener',
        openerActiveClass: 'active',
        submenuClassPrefix: 'level-',
        mode: 'fade',
        speed: 'fast',
        easing: 'swing',
        alignment: 'left',
        offsetX: 0,
        offsetY: 0,
        globalOffsetY: 0,
        IEOffsetX: 0,
        IEOffsetY: 0,
        noOpenerFade: true,
        detach: true,
        cloneOnDetach: true
    };

    let isAnimating = false;
    let hideTimeout = null;

    function init(selector, options) {
        // Merge options with defaults
        config = Object.assign({}, config, options);

        const containers = document.querySelectorAll(selector);
        containers.forEach(function(container) {
            setupDropdown(container);
        });
    }

    function setupDropdown(container) {
        const menus = container.querySelectorAll('ul');
        const body = document.body;
        const html = document.documentElement;

        menus.forEach(function(menu) {
            const parent = menu.parentElement;

            // Skip if already initialized
            if (parent.classList.contains(config.openerClass)) {
                return;
            }

            // Hide menu initially
            menu.style.display = 'none';
            menu.classList.add(config.menuClass);
            menu.style.position = 'absolute';

            // Disable text selection
            menu.style.userSelect = 'none';
            menu.style.webkitUserSelect = 'none';
            menu.style.mozUserSelect = 'none';
            menu.style.msUserSelect = 'none';

            // Setup event listeners
            if (config.expandMode === 'hover') {
                let showTimeout = null;

                parent.addEventListener('mouseenter', function() {
                    clearTimeout(hideTimeout);
                    clearTimeout(showTimeout);
                    showTimeout = setTimeout(function() {
                        expandMenu(menu, parent);
                    }, config.hoverDelay);
                });

                parent.addEventListener('mouseleave', function() {
                    clearTimeout(showTimeout);
                    hideTimeout = setTimeout(function() {
                        collapseMenu(menu, parent);
                    }, config.hideDelay);
                });

                menu.addEventListener('mouseenter', function() {
                    clearTimeout(hideTimeout);
                });

                menu.addEventListener('mouseleave', function() {
                    hideTimeout = setTimeout(function() {
                        collapseMenu(menu, parent);
                    }, config.hideDelay);
                });
            }

            // Click/touch handler
            parent.addEventListener('click', function(e) {
                if (isAnimating) return;

                e.preventDefault();
                e.stopPropagation();

                if (menu.style.display === 'none') {
                    expandMenu(menu, parent);
                } else {
                    collapseMenu(menu, parent);
                }
            });

            // Make parent non-selectable and add opener class
            parent.style.cursor = 'pointer';
            parent.style.userSelect = 'none';
            parent.style.webkitUserSelect = 'none';
            parent.style.mozUserSelect = 'none';
            parent.style.msUserSelect = 'none';
            parent.classList.add(config.openerClass);

            // Handle menu links
            const links = menu.querySelectorAll('a');
            links.forEach(function(link) {
                link.style.display = 'block';
                link.addEventListener('click', function(e) {
                    if (isAnimating) {
                        e.preventDefault();
                    }
                });
            });

            // Handle list items
            const listItems = menu.querySelectorAll('li');
            listItems.forEach(function(item) {
                item.style.whiteSpace = 'nowrap';

                const itemLink = item.querySelector('a');
                const subMenu = item.querySelector('ul');

                if (itemLink && subMenu) {
                    itemLink.addEventListener('click', function(e) {
                        const href = itemLink.getAttribute('href');
                        if (!href || href === '#') {
                            e.preventDefault();
                        }
                    });
                } else if (itemLink && !subMenu) {
                    item.addEventListener('click', function(e) {
                        if (isAnimating) return;
                        collapseAll();
                        e.stopPropagation();
                    });
                }
            });

            // Detach and reposition submenus if needed
            if (config.detach) {
                const subMenus = menu.querySelectorAll('ul');
                subMenus.forEach(function(subMenu, index) {
                    if (config.cloneOnDetach) {
                        const clone = subMenu.cloneNode(true);
                        clone.style.display = 'none';
                        clone.className = '';
                        subMenu.parentElement.appendChild(clone);
                    }

                    subMenu.parentElement.removeChild(subMenu);
                    body.appendChild(subMenu);

                    // Set z-index
                    subMenu.style.zIndex = config.baseZIndex + index + 1;
                    if (config.submenuClassPrefix) {
                        subMenu.classList.add(config.submenuClassPrefix + index);
                    }
                });
            }
        });

        // Global event listeners
        window.addEventListener('scroll', collapseAll);
        document.addEventListener('keydown', function(e) {
            if (e.keyCode === 27) { // Escape key
                e.preventDefault();
                collapseAll();
            }
        });

        html.addEventListener('click', collapseAll);
        body.addEventListener('click', collapseAll);
    }

    function expandMenu(menu, parent) {
        if (menu.style.display !== 'none' || isAnimating) return false;

        isAnimating = true;

        // Collapse other menus
        const allMenus = document.querySelectorAll('.' + config.menuClass);
        allMenus.forEach(function(otherMenu) {
            if (otherMenu !== menu && !menu.contains(otherMenu)) {
                collapseMenu(otherMenu, otherMenu.parentElement);
            }
        });

        // Calculate position
        const parentRect = parent.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        const windowWidth = window.innerWidth;

        let left, top;

        if (menu.style.position === 'absolute' && menu.style.position !== 'relative') {
            const parentOffset = getOffset(parent);
            top = parentOffset.top + parent.offsetHeight + config.globalOffsetY;
            left = parentOffset.left;

            // Handle alignment
            switch (config.alignment) {
                case 'right':
                    left = parentOffset.left - menuRect.width + parent.offsetWidth;
                    if (left < 0) {
                        left = parentOffset.left;
                        menu.classList.remove('right');
                        menu.classList.add('left');
                    }
                    break;
                case 'center':
                    left = parentOffset.left - Math.floor((menuRect.width - parent.offsetWidth) / 2);
                    if (left < 0) {
                        left = parentOffset.left;
                        menu.classList.remove('center');
                        menu.classList.add('left');
                    } else if (left + menuRect.width > windowWidth) {
                        left = parentOffset.left - menuRect.width + parent.offsetWidth;
                        menu.classList.remove('center');
                        menu.classList.add('right');
                    }
                    break;
                case 'left':
                default:
                    if (left + menuRect.width > windowWidth) {
                        left = parentOffset.left - menuRect.width + parent.offsetWidth;
                        menu.classList.add('right');
                    }
                    break;
            }
        } else {
            top = config.offsetY;
            left = parent.offsetWidth + config.offsetX;
        }

        // IE adjustments
        if (navigator.userAgent.match(/MSIE ([0-9]+)\./) && RegExp.$1 < 8) {
            left += config.IEOffsetX;
            top += config.IEOffsetY;
        }

        // Set position
        menu.style.left = left + 'px';
        menu.style.top = top + 'px';
        menu.style.opacity = '0.01';
        menu.style.display = 'block';

        // Adjust position if off-screen
        const menuOffset = getOffset(menu);
        if (menuOffset.left < 0) {
            left += parent.offsetWidth - config.offsetX;
            menu.style.left = left + 'px';
        } else if (menuOffset.left + menuRect.width > windowWidth) {
            left -= parent.offsetWidth + config.offsetX;
            menu.style.left = left + 'px';
        }

        // Hide and reset opacity
        menu.style.display = 'none';
        menu.style.opacity = '1';

        // Animate based on mode
        switch (config.mode) {
            case 'zoom':
                parent.classList.add(config.openerActiveClass);
                menu.style.display = 'block';
                menu.style.width = '0';
                menu.style.height = '0';
                animate(menu, { width: 'auto', height: 'auto' }, config.speed, function() {
                    isAnimating = false;
                });
                break;

            case 'slide':
                parent.classList.add(config.openerActiveClass);
                menu.style.display = 'block';
                menu.style.height = '0';
                animate(menu, { height: 'auto' }, config.speed, function() {
                    isAnimating = false;
                });
                break;

            case 'fade':
                if (config.noOpenerFade) {
                    parent.classList.add(config.openerActiveClass);
                    menu.style.display = 'block';
                    fadeIn(menu, config.speed, function() {
                        isAnimating = false;
                    });
                } else {
                    fadeIn(parent, 'fast', function() {
                        parent.classList.add(config.openerActiveClass);
                        fadeIn(menu, config.speed, function() {
                            isAnimating = false;
                        });
                    });
                }
                break;

            case 'instant':
            default:
                parent.classList.add(config.openerActiveClass);
                menu.style.display = 'block';
                isAnimating = false;
                break;
        }

        return false;
    }

    function collapseMenu(menu, parent) {
        if (menu.style.display === 'none') return false;

        isAnimating = true;

        // Remove active class
        if (parent) {
            parent.classList.remove(config.openerActiveClass);
        }

        // Hide all submenus
        const subMenus = menu.querySelectorAll('.' + config.menuClass);
        subMenus.forEach(function(subMenu) {
            subMenu.style.display = 'none';
            const subParent = subMenu.parentElement;
            if (subParent) {
                subParent.classList.remove(config.openerActiveClass);
            }
        });

        // Animate based on mode
        switch (config.mode) {
            case 'zoom':
                animate(menu, { width: 0, height: 0 }, config.speed, function() {
                    menu.style.display = 'none';
                    isAnimating = false;
                });
                break;

            case 'slide':
                animate(menu, { height: 0 }, config.speed, function() {
                    menu.style.display = 'none';
                    isAnimating = false;
                });
                break;

            case 'fade':
                fadeOut(menu, config.speed, function() {
                    menu.style.display = 'none';
                    isAnimating = false;
                });
                break;

            case 'instant':
            default:
                menu.style.display = 'none';
                isAnimating = false;
                break;
        }

        return false;
    }

    function collapseAll() {
        if (isAnimating) return;

        const menus = document.querySelectorAll('.' + config.menuClass);
        menus.forEach(function(menu) {
            if (menu.style.display !== 'none') {
                const parent = menu.parentElement;
                collapseMenu(menu, parent);
            }
        });
    }

    // Utility functions
    function getOffset(element) {
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top + window.pageYOffset,
            left: rect.left + window.pageXOffset
        };
    }

    function animate(element, properties, duration, callback) {
        const start = Date.now();
        const startValues = {};

        // Get starting values
        for (const prop in properties) {
            if (prop === 'width' || prop === 'height') {
                startValues[prop] = element.offsetWidth || element.offsetHeight;
            }
        }

        function step() {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);

            for (const prop in properties) {
                if (properties[prop] === 'auto') {
                    // Handle auto values
                    element.style[prop] = 'auto';
                }
            }

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                if (callback) callback();
            }
        }

        requestAnimationFrame(step);
    }

    function fadeIn(element, duration, callback) {
        element.style.opacity = '0';
        element.style.display = 'block';

        const start = Date.now();
        function step() {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            element.style.opacity = progress;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                if (callback) callback();
            }
        }

        requestAnimationFrame(step);
    }

    function fadeOut(element, duration, callback) {
        const start = Date.now();
        const startOpacity = parseFloat(getComputedStyle(element).opacity) || 1;

        function step() {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            element.style.opacity = startOpacity * (1 - progress);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                if (callback) callback();
            }
        }

        requestAnimationFrame(step);
    }

    return {
        init: init
    };
})();

// Make it available globally
window.dropotron = dropotron;
