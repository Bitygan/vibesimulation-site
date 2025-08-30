/**
 * Device Capabilities & Memory Detection
 * Critical for low-RAM tablet optimization
 */

const DeviceCapabilities = (function() {
    'use strict';

    let capabilities = {
        memory: 'unknown',
        cores: navigator.hardwareConcurrency || 2,
        touch: 'ontouchstart' in window,
        connection: 'unknown',
        battery: 'unknown',
        performance: 'unknown',
        screenDensity: window.devicePixelRatio || 1,
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight
        }
    };

    let performanceMetrics = {
        fps: 60,
        memoryPressure: false,
        lastFrameTime: 0,
        frameCount: 0
    };

    // Memory detection (Chrome/Edge only)
    function detectMemory() {
        if ('memory' in performance) {
            const memInfo = performance.memory;
            const usedPercent = (memInfo.usedJSHeapSize / memInfo.totalJSHeapSize) * 100;

            capabilities.memory = {
                used: memInfo.usedJSHeapSize,
                total: memInfo.totalJSHeapSize,
                limit: memInfo.jsHeapSizeLimit,
                usedPercent: usedPercent,
                pressure: usedPercent > 80 ? 'high' : usedPercent > 60 ? 'medium' : 'low'
            };
        } else {
            // Fallback memory estimation
            capabilities.memory = estimateMemory();
        }
    }

    function estimateMemory() {
        // Rough estimation based on device characteristics
        let estimatedTotal = 512 * 1024 * 1024; // 512MB default

        // Adjust based on screen size (larger screens = more memory likely)
        const screenArea = window.screen.width * window.screen.height;
        if (screenArea > 2000000) estimatedTotal = 2048 * 1024 * 1024; // 2GB for large screens
        else if (screenArea > 1000000) estimatedTotal = 1024 * 1024 * 1024; // 1GB for medium screens
        else if (screenArea < 500000) estimatedTotal = 256 * 1024 * 1024; // 256MB for small screens

        // Adjust based on CPU cores
        if (capabilities.cores >= 8) estimatedTotal *= 1.5;
        else if (capabilities.cores <= 2) estimatedTotal *= 0.7;

        return {
            used: 0, // Can't estimate used memory without API
            total: estimatedTotal,
            limit: estimatedTotal,
            usedPercent: 0,
            pressure: estimatedTotal < 512 * 1024 * 1024 ? 'high' : 'low',
            estimated: true
        };
    }

    // Connection detection
    function detectConnection() {
        if ('connection' in navigator) {
            const conn = navigator.connection;
            capabilities.connection = {
                effectiveType: conn.effectiveType,
                downlink: conn.downlink,
                rtt: conn.rtt,
                saveData: conn.saveData
            };
        } else if ('mozConnection' in navigator) {
            const conn = navigator.mozConnection;
            capabilities.connection = {
                effectiveType: conn.effectiveType || 'unknown',
                downlink: conn.downlink || 0,
                rtt: conn.rtt || 0,
                saveData: false
            };
        } else {
            capabilities.connection = {
                effectiveType: 'unknown',
                downlink: 0,
                rtt: 0,
                saveData: false
            };
        }
    }

    // Battery detection
    function detectBattery() {
        if ('getBattery' in navigator) {
            navigator.getBattery().then(function(battery) {
                capabilities.battery = {
                    charging: battery.charging,
                    level: battery.level,
                    lowPower: battery.level < 0.2 && !battery.charging
                };
            });
        } else {
            capabilities.battery = {
                charging: true, // Assume charging if API not available
                level: 1,
                lowPower: false
            };
        }
    }

    // Performance measurement
    function measurePerformance() {
        const startTime = performance.now();

        // Simple performance test
        let iterations = 100000;
        let result = 0;
        for (let i = 0; i < iterations; i++) {
            result += Math.sin(i) * Math.cos(i);
        }

        const endTime = performance.now();
        const timeTaken = endTime - startTime;

        // Classify performance based on time taken
        if (timeTaken < 50) capabilities.performance = 'high';
        else if (timeTaken < 150) capabilities.performance = 'medium';
        else capabilities.performance = 'low';

        return timeTaken;
    }

    // Memory pressure monitoring (reduced frequency for performance)
    function monitorMemoryPressure() {
        if ('memory' in performance) {
            let monitorCount = 0;
            const monitorInterval = setInterval(() => {
                monitorCount++;

                // Only do full monitoring every 30 seconds, light monitoring every 10 seconds
                if (monitorCount % 6 === 0) { // Every 30 seconds
                    const memInfo = performance.memory;
                    const usedPercent = (memInfo.usedJSHeapSize / memInfo.totalJSHeapSize) * 100;
                    performanceMetrics.memoryPressure = usedPercent > 80;

                    // Only trigger GC in extreme cases and with delay
                    if (window.gc && usedPercent > 95 && monitorCount > 12) { // Only after 60 seconds
                        setTimeout(() => window.gc(), 1000); // Delay to avoid blocking
                    }
                } else { // Light monitoring every 10 seconds
                    // Just check if we're in a low-memory state
                    performanceMetrics.memoryPressure = performanceMetrics.memoryPressure || false;
                }

                // Stop monitoring after 5 minutes to reduce overhead
                if (monitorCount > 300) { // 300 * 10 seconds = 50 minutes
                    clearInterval(monitorInterval);
                    console.log('[DeviceCapabilities] Memory monitoring disabled after 50 minutes');
                }
            }, 10000); // Reduced from 5 seconds to 10 seconds
        }
    }

    // FPS monitoring (more efficient)
    function monitorFPS() {
        let lastTime = performance.now();
        let frames = 0;
        let monitoringActive = true;

        function updateFPS() {
            if (!monitoringActive) return;

            const currentTime = performance.now();
            frames++;

            if (currentTime - lastTime >= 2000) { // Reduced frequency from 1s to 2s
                performanceMetrics.fps = Math.round((frames * 1000) / (currentTime - lastTime));
                frames = 0;
                lastTime = currentTime;

                // Only flag memory pressure if consistently low FPS
                if (performanceMetrics.fps < 20) { // Reduced threshold from 30 to 20
                    performanceMetrics.memoryPressure = true;
                }

                // Disable monitoring after 10 minutes to reduce overhead
                if (currentTime - performanceMetrics.startTime > 600000) { // 10 minutes
                    monitoringActive = false;
                    console.log('[DeviceCapabilities] FPS monitoring disabled after 10 minutes');
                }
            }

            if (monitoringActive) {
                requestAnimationFrame(updateFPS);
            }
        }

        performanceMetrics.startTime = performance.now();
        requestAnimationFrame(updateFPS);
    }

    // Device capability classification
    function classifyDevice() {
        const mem = capabilities.memory;
        const perf = capabilities.performance;
        const cores = capabilities.cores;
        const connection = capabilities.connection;

        let deviceClass = 'standard';

        // Ultra low-end: Very limited memory and performance
        if ((mem.estimated && mem.total < 512 * 1024 * 1024) ||
            (!mem.estimated && mem.pressure === 'high') ||
            perf === 'low' ||
            cores <= 2) {
            deviceClass = 'ultra-low';
        }
        // Low-end: Limited memory or performance
        else if (mem.total < 1024 * 1024 * 1024 ||
                 perf === 'medium' ||
                 connection.effectiveType === 'slow-2g' ||
                 connection.effectiveType === '2g') {
            deviceClass = 'low-end';
        }
        // High-end: Good memory and performance
        else if (mem.total >= 2048 * 1024 * 1024 ||
                 perf === 'high' ||
                 cores >= 6) {
            deviceClass = 'high-end';
        }

        return deviceClass;
    }

    // Initialize all detections
    function init() {
        detectMemory();
        detectConnection();
        detectBattery();
        measurePerformance();
        monitorMemoryPressure();
        monitorFPS();

        // Update viewport on resize
        window.addEventListener('resize', () => {
            capabilities.viewport = {
                width: window.innerWidth,
                height: window.innerHeight
            };
        });

        console.log('Device capabilities detected:', capabilities);
        console.log('Device class:', classifyDevice());
    }

    // Public API
    return {
        init: init,
        getCapabilities: () => capabilities,
        getPerformanceMetrics: () => performanceMetrics,
        classifyDevice: classifyDevice,
        isLowMemory: () => {
            const deviceClass = classifyDevice();
            return deviceClass === 'ultra-low' || deviceClass === 'low-end';
        },
        isHighEnd: () => classifyDevice() === 'high-end',
        shouldThrottle: () => performanceMetrics.memoryPressure || performanceMetrics.fps < 30,
        getRecommendedSettings: function() {
            const deviceClass = classifyDevice();
            const settings = {
                'ultra-low': {
                    canvasResolution: 0.25,
                    animationFPS: 15,
                    maxParticles: 100,
                    enableParallax: false,
                    enableComplexEffects: false,
                    preloadAssets: false
                },
                'low-end': {
                    canvasResolution: 0.5,
                    animationFPS: 30,
                    maxParticles: 500,
                    enableParallax: false,
                    enableComplexEffects: true,
                    preloadAssets: true
                },
                'standard': {
                    canvasResolution: 0.75,
                    animationFPS: 45,
                    maxParticles: 1000,
                    enableParallax: true,
                    enableComplexEffects: true,
                    preloadAssets: true
                },
                'high-end': {
                    canvasResolution: 1.0,
                    animationFPS: 60,
                    maxParticles: 5000,
                    enableParallax: true,
                    enableComplexEffects: true,
                    preloadAssets: true
                }
            };

            return settings[deviceClass] || settings.standard;
        }
    };
})();

// Initialize immediately
DeviceCapabilities.init();

// Make globally available
window.DeviceCapabilities = DeviceCapabilities;
