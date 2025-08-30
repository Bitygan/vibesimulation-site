/**
 * Optimized Loader - Memory-Aware Resource Management
 * Dynamically loads resources based on device capabilities
 */

const OptimizedLoader = (function() {
    'use strict';

    let loadedModules = new Set();
    let pendingLoads = new Map();
    let memoryWarnings = 0;

    // Memory-aware script loader
    function loadScript(src, options = {}) {
        return new Promise((resolve, reject) => {
            if (loadedModules.has(src)) {
                resolve();
                return;
            }

            // Check memory before loading
            if (window.DeviceCapabilities && window.DeviceCapabilities.shouldThrottle()) {
                console.warn('Memory pressure detected, delaying script load:', src);
                setTimeout(() => loadScript(src, options).then(resolve).catch(reject), 1000);
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.defer = options.defer !== false;

            if (options.async) script.async = true;
            if (options.type) script.type = options.type;

            script.onload = () => {
                loadedModules.add(src);
                resolve();
                console.log('Loaded script:', src);
            };

            script.onerror = (error) => {
                console.error('Failed to load script:', src, error);
                reject(error);
            };

            // Memory monitoring during load
            const memoryCheck = setInterval(() => {
                if (window.DeviceCapabilities && window.DeviceCapabilities.shouldThrottle()) {
                    memoryWarnings++;
                    if (memoryWarnings > 3) {
                        console.warn('High memory pressure, aborting script load:', src);
                        script.remove();
                        clearInterval(memoryCheck);
                        reject(new Error('Memory pressure'));
                        return;
                    }
                }
            }, 1000);

            document.head.appendChild(script);

            // Cleanup memory check after load
            script.addEventListener('load', () => clearInterval(memoryCheck));
            script.addEventListener('error', () => clearInterval(memoryCheck));
        });
    }

    // Progressive enhancement loader
    function loadProgressive() {
        const capabilities = window.DeviceCapabilities;
        if (!capabilities) {
            // Fallback to full load if capabilities not available
            return loadFull();
        }

        const deviceClass = capabilities.classifyDevice();
        console.log('Loading progressively for device class:', deviceClass);

        switch (deviceClass) {
            case 'ultra-low':
                return loadUltraLow();
            case 'low-end':
                return loadLowEnd();
            default:
                return loadStandard();
        }
    }

    // Ultra low-end device loading (minimal)
    function loadUltraLow() {
        console.log('Loading ultra-low configuration');

        const criticalScripts = [
            'assets/js/vanilla-browser.js',
            'assets/js/device-capabilities.js'
        ];

        const deferredScripts = [
            'assets/js/vanilla-breakpoints.js',
            'assets/js/vanilla-scrolly.js'
        ];

        // Load critical first
        return Promise.all(criticalScripts.map(src => loadScript(src)))
            .then(() => {
                console.log('Critical scripts loaded, waiting for user interaction...');

                // Wait for user interaction before loading more
                return new Promise((resolve) => {
                    const loadMore = () => {
                        document.removeEventListener('click', loadMore);
                        document.removeEventListener('touchstart', loadMore);
                        document.removeEventListener('scroll', loadMore);

                        loadScript('assets/js/vanilla-utilities.js')
                            .then(() => loadScript('assets/js/main.js'))
                            .then(resolve);
                    };

                    document.addEventListener('click', loadMore, { once: true });
                    document.addEventListener('touchstart', loadMore, { once: true });
                    document.addEventListener('scroll', loadMore, { once: true, passive: true });
                });
            });
    }

    // Low-end device loading (balanced)
    function loadLowEnd() {
        console.log('Loading low-end configuration');

        const scripts = [
            'assets/js/vanilla-browser.js',
            'assets/js/device-capabilities.js',
            'assets/js/vanilla-breakpoints.js',
            'assets/js/vanilla-scrolly.js',
            'assets/js/vanilla-utilities.js',
            'assets/js/dom-optimizer.js' // Always include DOM optimizer for low-end
        ];

        return Promise.all(scripts.map(src => loadScript(src)))
            .then(() => {
                // Delay main script loading
                setTimeout(() => {
                    loadScript('assets/js/main.js');
                }, 1000);
            });
    }

    // Standard device loading (full)
    function loadStandard() {
        console.log('Loading standard configuration');

        const deviceSettings = window.DeviceCapabilities ?
            window.DeviceCapabilities.getRecommendedSettings() : {};

        let scripts = [
            'assets/js/vanilla-browser.js',
            'assets/js/device-capabilities.js',
            'assets/js/vanilla-breakpoints.js',
            'assets/js/vanilla-scrolly.js',
            'assets/js/vanilla-dropotron.js',
            'assets/js/vanilla-scrollex.js',
            'assets/js/vanilla-utilities.js',
            'assets/js/main.js'
        ];

        // Add DOM optimizer for devices that need it
        if (deviceSettings.canvasResolution < 1.0 || deviceSettings.animationFPS < 45) {
            scripts.splice(scripts.length - 1, 0, 'assets/js/dom-optimizer.js');
            console.log('Added DOM optimizer for performance optimization');
        }

        return Promise.all(scripts.map(src => loadScript(src)));
    }

    // Full loading (fallback)
    function loadFull() {
        console.log('Loading full configuration (fallback)');

        const scripts = [
            'assets/js/vanilla-browser.js',
            'assets/js/device-capabilities.js',
            'assets/js/vanilla-breakpoints.js',
            'assets/js/vanilla-scrolly.js',
            'assets/js/vanilla-dropotron.js',
            'assets/js/vanilla-scrollex.js',
            'assets/js/vanilla-utilities.js',
            'assets/js/main.js',
            'assets/js/video.js',
            'assets/js/cookie-consent.js'
        ];

        return Promise.all(scripts.map(src => loadScript(src)));
    }

    // Memory-aware asset preloader (performance optimized)
    function preloadAssets(assetList) {
        if (window.DeviceCapabilities && window.DeviceCapabilities.isLowMemory()) {
            console.log('Skipping asset preloading on low-memory device');
            return Promise.resolve();
        }

        // Limit preloading to prevent memory pressure
        const maxPreload = window.DeviceCapabilities ?
            (window.DeviceCapabilities.classifyDevice() === 'high-end' ? 10 : 5) : 3;

        const limitedAssets = assetList.slice(0, maxPreload);

        const promises = limitedAssets.map(asset => {
            return new Promise((resolve, reject) => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.href = asset.src;
                link.as = asset.type;

                if (asset.crossorigin) link.crossOrigin = asset.crossorigin;

                link.onload = resolve;
                link.onerror = reject;

                // Add with delay to prevent overwhelming the network
                setTimeout(() => {
                    document.head.appendChild(link);
                }, Math.random() * 100); // Random delay up to 100ms

                // Timeout after 5 seconds
                setTimeout(() => reject(new Error('Preload timeout')), 5000);
            });
        });

        return Promise.allSettled(promises); // Use allSettled to prevent one failure from blocking others
    }

    // Dynamic canvas resolution adjustment
    function optimizeCanvas(canvas, originalWidth, originalHeight) {
        if (!window.DeviceCapabilities) return;

        const settings = window.DeviceCapabilities.getRecommendedSettings();
        const scale = settings.canvasResolution;

        if (scale < 1.0) {
            const newWidth = Math.floor(originalWidth * scale);
            const newHeight = Math.floor(originalHeight * scale);

            canvas.width = newWidth;
            canvas.height = newHeight;
            canvas.style.width = originalWidth + 'px';
            canvas.style.height = originalHeight + 'px';

            console.log(`Canvas optimized: ${originalWidth}x${originalHeight} → ${newWidth}x${newHeight} (${scale * 100}%)`);
        }
    }

    // Memory cleanup
    function cleanup() {
        // Clear unused modules from memory
        if (window.gc) {
            window.gc();
        }

        // Clear caches if memory pressure is high
        if (window.DeviceCapabilities && window.DeviceCapabilities.shouldThrottle()) {
            // Clear any cached data
            if ('caches' in window) {
                caches.keys().then(names => {
                    names.forEach(name => {
                        if (name.includes('temp') || name.includes('cache')) {
                            caches.delete(name);
                        }
                    });
                });
            }
        }
    }

    // Performance monitoring
    function monitorPerformance() {
        setInterval(() => {
            if (window.DeviceCapabilities && window.DeviceCapabilities.shouldThrottle()) {
                console.warn('Performance throttling active - memory pressure detected');
                cleanup();
            }
        }, 10000);
    }

    // Initialize
    function init() {
        monitorPerformance();
        console.log('Optimized loader initialized');
    }

    // Public API
    return {
        init: init,
        loadProgressive: loadProgressive,
        loadScript: loadScript,
        preloadAssets: preloadAssets,
        optimizeCanvas: optimizeCanvas,
        cleanup: cleanup
    };
})();

// Initialize
OptimizedLoader.init();

// Make globally available
window.OptimizedLoader = OptimizedLoader;
