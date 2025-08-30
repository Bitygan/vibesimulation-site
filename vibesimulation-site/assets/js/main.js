/*
	VibeSimulation - Vanilla JavaScript Main Script
	Replaced jQuery with vanilla JS for better performance
*/

(function() {
	'use strict';

	// Wait for device capabilities to be ready
	function initializeWhenReady() {
		if (!window.DeviceCapabilities) {
			setTimeout(initializeWhenReady, 50);
			return;
		}

		// Get device settings
		const deviceSettings = window.DeviceCapabilities.getRecommendedSettings();
		console.log('Applying device settings:', deviceSettings);

		// Initialize breakpoints with device-aware settings
		breakpoints.init({
			xlarge: ['1281px', '1680px'],
			large: ['981px', '1280px'],
			medium: ['737px', '980px'],
			small: ['481px', '736px'],
			xsmall: [null, '480px']
		});

		// Get references to key elements
		const body = document.body;
		const windowEl = window;

		// Play initial animations on page load (throttled for low-end devices)
		const animationDelay = deviceSettings.animationFPS < 30 ? 300 : 100;
		windowEl.addEventListener('load', function() {
			setTimeout(function() {
				body.classList.remove('is-preload');

				// Remove loading indicator if it exists
				const indicator = document.getElementById('loading-indicator');
				if (indicator) {
					indicator.style.transition = 'opacity 0.5s ease';
					indicator.style.opacity = '0';
					setTimeout(() => indicator.remove(), 500);
				}
			}, animationDelay);
		});

		// Touch mode
		if (window.browser && window.browser.mobile) {
			body.classList.add('is-touch');
		}

		// Scrolly links (handled by vanilla-scrolly.js)

		// Dropdowns (skip on ultra-low devices)
		if (deviceSettings.enableComplexEffects) {
			const nav = document.getElementById('nav');
			if (nav) {
				window.dropotron.init('#nav > ul', {
					alignment: 'right',
					hideDelay: deviceSettings.animationFPS < 30 ? 500 : 350
				});
			}
		}

		// Navigation setup
		setupNavigation();

		// Parallax functionality (skip on low-end devices)
		if (deviceSettings.enableParallax) {
			setupParallax();
		}

		// Scroll effects are handled by vanilla-scrollex.js

		// Optimize canvases on page
		optimizeCanvases();
	}

	// Optimize all canvases based on device capabilities
	function optimizeCanvases() {
		const canvases = document.querySelectorAll('canvas');
		canvases.forEach(canvas => {
			if (window.OptimizedLoader) {
				const rect = canvas.getBoundingClientRect();
				window.OptimizedLoader.optimizeCanvas(canvas, rect.width, rect.height);
			}
		});
	}

	// Start initialization
	initializeWhenReady();

	function setupNavigation() {
		// Title Bar
		const logo = document.getElementById('logo');
		if (logo) {
			const titleBar = document.createElement('div');
			titleBar.id = 'titleBar';

			const toggleLink = document.createElement('a');
			toggleLink.href = '#navPanel';
			toggleLink.className = 'toggle';
			titleBar.appendChild(toggleLink);

			const titleSpan = document.createElement('span');
			titleSpan.className = 'title';
			titleSpan.innerHTML = logo.innerHTML;
			titleBar.appendChild(titleSpan);

			body.appendChild(titleBar);
		}

		// Panel
		const navPanel = document.createElement('div');
		navPanel.id = 'navPanel';

		const navElement = document.createElement('nav');
		if (nav) {
			navElement.innerHTML = window.utilities.navList(nav);
		}
		navPanel.appendChild(navElement);

		body.appendChild(navPanel);

		// Initialize panel functionality
		window.utilities.panel(navPanel, {
			delay: 500,
			hideOnClick: true,
			hideOnSwipe: true,
			resetScroll: true,
			resetForms: true,
			side: 'left',
			target: body,
			visibleClass: 'navPanel-visible'
		});
	}

	function setupParallax() {
		// Disabled on IE and mobile platforms for performance
		if ((window.browser && window.browser.name === 'ie') || (window.browser && window.browser.mobile)) {
			// No parallax on IE or mobile
			return;
		}

		function setupParallaxElement(element) {
			function on() {
				element.style.backgroundPosition = 'center 0px';

				function handleScroll() {
					const rect = element.getBoundingClientRect();
					const pos = window.pageYOffset - rect.top;
					element.style.backgroundPosition = 'center ' + (pos * -0.15) + 'px';
				}

				window.addEventListener('scroll', handleScroll, { passive: true });

				// Store the handler for cleanup
				element._parallaxHandler = handleScroll;
			}

			function off() {
				element.style.backgroundPosition = '';
				if (element._parallaxHandler) {
					window.removeEventListener('scroll', element._parallaxHandler);
					element._parallaxHandler = null;
				}
			}

			breakpoints.on('<=medium', off);
			breakpoints.on('>medium', on);
		}

		// Setup parallax for spotlights
		const spotlights = document.querySelectorAll('.spotlight');
		spotlights.forEach(function(spotlight) {
			setupParallaxElement(spotlight);

			// Handle spotlight-specific background image
			const img = spotlight.querySelector('.image.main > img');
			if (img) {
				function on() {
					let top, bottom, mode;

					spotlight.style.backgroundImage = 'url("' + img.src + '")';

					if (spotlight.classList.contains('top')) {
						mode = 'top';
						top = '-20%';
						bottom = 0;
					} else if (spotlight.classList.contains('bottom')) {
						mode = 'bottom-only';
						top = 0;
						bottom = '20%';
					} else {
						mode = 'middle';
						top = 0;
						bottom = 0;
					}

					// Scrollex is handled by vanilla-scrollex.js
				}

				function off() {
					spotlight.style.backgroundImage = '';
				}

				breakpoints.on('<=medium', off);
				breakpoints.on('>medium', on);
			}
		});

		// Setup parallax for banner
		const banner = document.getElementById('banner');
		if (banner) {
			setupParallaxElement(banner);
		}

		// Trigger initial scroll
		window.addEventListener('load', function() {
			window.dispatchEvent(new Event('scroll'));
		});

		window.addEventListener('resize', function() {
			window.dispatchEvent(new Event('scroll'));
		});
	}

	// Wrappers are handled by vanilla-scrollex.js

})();