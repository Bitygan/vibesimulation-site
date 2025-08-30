/**
 * DOM Optimizer - Memory-efficient DOM management for low-RAM devices
 */

const DOMOptimizer = (function() {
    'use strict';

    let isLowMemory = false;
    let observer = null;
    let virtualScrollContainers = new Map();

    // Initialize DOM optimization
    function init() {
        if (!window.DeviceCapabilities) {
            setTimeout(init, 100);
            return;
        }

        isLowMemory = window.DeviceCapabilities.isLowMemory();
        console.log('DOM Optimizer initialized, low-memory mode:', isLowMemory);

        if (isLowMemory) {
            setupMemoryOptimization();
            setupVirtualScrolling();
            setupLazyLoading();
        }

        // Monitor DOM size
        monitorDOMSize();
    }

    // Memory optimization for low-RAM devices
    function setupMemoryOptimization() {
        console.log('Setting up memory optimization');

        // Throttle DOM manipulation
        const originalAppendChild = Element.prototype.appendChild;
        Element.prototype.appendChild = function(node) {
            // Small delay to allow garbage collection
            if (isLowMemory) {
                setTimeout(() => originalAppendChild.call(this, node), 1);
            } else {
                return originalAppendChild.call(this, node);
            }
        };

        // Optimize event listeners
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            if (isLowMemory && type === 'scroll') {
                // Throttle scroll events
                const throttledListener = throttle(listener, 100);
                return originalAddEventListener.call(this, type, throttledListener, options);
            }
            return originalAddEventListener.call(this, type, listener, options);
        };

        // Reduce DOM queries
        optimizeDOMQueries();
    }

    // Virtual scrolling for large lists
    function setupVirtualScrolling() {
        console.log('Setting up virtual scrolling');

        // Find scrollable containers that might benefit from virtual scrolling
        const scrollContainers = document.querySelectorAll('[data-virtual-scroll]');
        scrollContainers.forEach(container => {
            const config = JSON.parse(container.dataset.virtualScroll || '{}');
            setupVirtualScrollContainer(container, config);
        });
    }

    function setupVirtualScrollContainer(container, config) {
        const items = Array.from(container.children);
        const itemHeight = config.itemHeight || 50;
        const containerHeight = config.height || 400;
        const buffer = config.buffer || 5;

        // Hide original items
        items.forEach(item => item.style.display = 'none');

        // Create viewport
        const viewport = document.createElement('div');
        viewport.style.height = containerHeight + 'px';
        viewport.style.overflow = 'auto';
        viewport.style.position = 'relative';

        // Create content container
        const content = document.createElement('div');
        content.style.height = (items.length * itemHeight) + 'px';
        content.style.position = 'relative';

        viewport.appendChild(content);
        container.appendChild(viewport);

        // Track visible items
        let visibleItems = new Set();

        function updateVisibleItems() {
            const scrollTop = viewport.scrollTop;
            const startIndex = Math.floor(scrollTop / itemHeight) - buffer;
            const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer;

            const newVisibleItems = new Set();

            for (let i = Math.max(0, startIndex); i < Math.min(items.length, endIndex); i++) {
                newVisibleItems.add(i);
            }

            // Remove items that are no longer visible
            visibleItems.forEach(index => {
                if (!newVisibleItems.has(index)) {
                    const item = items[index];
                    if (item.parentNode) {
                        content.removeChild(item);
                    }
                }
            });

            // Add new visible items
            newVisibleItems.forEach(index => {
                if (!visibleItems.has(index)) {
                    const item = items[index];
                    item.style.position = 'absolute';
                    item.style.top = (index * itemHeight) + 'px';
                    item.style.width = '100%';
                    item.style.display = 'block';
                    content.appendChild(item);
                }
            });

            visibleItems = newVisibleItems;
        }

        viewport.addEventListener('scroll', throttle(updateVisibleItems, 16));
        updateVisibleItems();

        virtualScrollContainers.set(container, { viewport, updateVisibleItems });
    }

    // Lazy loading for images and content
    function setupLazyLoading() {
        console.log('Setting up lazy loading');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px'
            });

            // Observe all images with data-src
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    // Optimize DOM queries by caching results
    function optimizeDOMQueries() {
        const queryCache = new Map();
        const originalQuerySelector = document.querySelector;
        const originalQuerySelectorAll = document.querySelectorAll;

        document.querySelector = function(selector) {
            if (isLowMemory && queryCache.has(selector)) {
                return queryCache.get(selector);
            }
            const result = originalQuerySelector.call(this, selector);
            if (isLowMemory && result) {
                queryCache.set(selector, result);
            }
            return result;
        };

        document.querySelectorAll = function(selector) {
            if (isLowMemory && queryCache.has(selector)) {
                return queryCache.get(selector);
            }
            const result = originalQuerySelectorAll.call(this, selector);
            if (isLowMemory && result.length > 0) {
                queryCache.set(selector, result);
            }
            return result;
        };

        // Clear cache periodically on low-memory devices
        if (isLowMemory) {
            setInterval(() => {
                queryCache.clear();
            }, 30000);
        }
    }

    // Monitor DOM size and warn about memory usage
    function monitorDOMSize() {
        function checkDOMSize() {
            const elementCount = document.getElementsByTagName('*').length;
            const memoryUsage = elementCount * 1000; // Rough estimate

            if (elementCount > 2000 && isLowMemory) {
                console.warn(`High DOM element count: ${elementCount} elements (~${Math.round(memoryUsage/1024)}KB)`);
                suggestOptimization();
            }
        }

        // Check every 10 seconds
        setInterval(checkDOMSize, 10000);
    }

    // Suggest optimizations for high DOM usage
    function suggestOptimization() {
        console.log('DOM Optimization Suggestions:');
        console.log('1. Use virtual scrolling for large lists');
        console.log('2. Implement lazy loading for images');
        console.log('3. Remove unused DOM elements');
        console.log('4. Use CSS transforms instead of changing layout properties');
    }

    // Throttle function for performance
    function throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        return function(...args) {
            const currentTime = Date.now();

            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }

    // Memory cleanup
    function cleanup() {
        // Clear virtual scroll containers
        virtualScrollContainers.forEach(({ viewport, updateVisibleItems }) => {
            viewport.removeEventListener('scroll', updateVisibleItems);
        });
        virtualScrollContainers.clear();

        // Disconnect observer
        if (observer) {
            observer.disconnect();
            observer = null;
        }

        console.log('DOM Optimizer cleanup completed');
    }

    // Public API
    return {
        init: init,
        cleanup: cleanup,
        setupVirtualScroll: setupVirtualScrollContainer,
        throttle: throttle
    };
})();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', DOMOptimizer.init);
} else {
    DOMOptimizer.init();
}

// Make globally available
window.DOMOptimizer = DOMOptimizer;
