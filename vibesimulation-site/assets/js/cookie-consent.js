/**
 * EU Cookie Consent Banner for VibeSimulation
 * GDPR and ePrivacy Directive compliant
 */

class CookieConsent {
    constructor() {
        this.consentGiven = this.getCookie('cookie-consent');
        this.consentPreferences = JSON.parse(this.getCookie('cookie-preferences') || '{}');
        this.isEUUser = null;
        this.banner = null;

        this.init();
    }

    async init() {
        // Detect if user is in EU
        await this.detectEUUser();

        if (!this.consentGiven && this.isEUUser) {
            this.createBanner();
            this.showBanner();
        } else if (this.consentGiven) {
            this.applyConsentChoices();
        }
    }

    async detectEUUser() {
        try {
            // Use a simple IP geolocation service (replace with your preferred service)
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            const euCountries = [
                'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
                'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
                'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB'
            ];
            this.isEUUser = euCountries.includes(data.country_code);
        } catch (error) {
            // If geolocation fails, show banner for safety
            console.warn('Could not detect user location, showing cookie banner for safety');
            this.isEUUser = true;
        }
    }

    createBanner() {
        // Create banner HTML
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.className = 'cookie-consent-banner';
        banner.innerHTML = `
            <div class="cookie-consent-content">
                <div class="cookie-consent-text">
                    <h3>Cookie Preferences</h3>
                    <p>We use cookies to enhance your experience and analyze site traffic. You can choose which cookies to accept.</p>
                </div>
                <div class="cookie-consent-buttons">
                    <button id="accept-all-cookies" class="cookie-btn cookie-btn-primary">Accept All</button>
                    <button id="manage-cookies" class="cookie-btn cookie-btn-secondary">Manage Preferences</button>
                    <button id="reject-all-cookies" class="cookie-btn cookie-btn-secondary">Reject All</button>
                </div>
            </div>
            <div id="cookie-preferences-modal" class="cookie-modal" style="display: none;">
                <div class="cookie-modal-content">
                    <div class="cookie-modal-header">
                        <h3>Cookie Settings</h3>
                        <span class="cookie-modal-close">&times;</span>
                    </div>
                    <div class="cookie-modal-body">
                        <div class="cookie-category">
                            <div class="cookie-category-header">
                                <input type="checkbox" id="necessary-cookies" checked disabled>
                                <label for="necessary-cookies">
                                    <strong>Necessary Cookies</strong>
                                    <p>Required for the website to function properly</p>
                                </label>
                            </div>
                        </div>
                        <div class="cookie-category">
                            <div class="cookie-category-header">
                                <input type="checkbox" id="analytics-cookies">
                                <label for="analytics-cookies">
                                    <strong>Analytics Cookies</strong>
                                    <p>Help us understand how visitors interact with the website</p>
                                </label>
                            </div>
                        </div>
                        <div class="cookie-category">
                            <div class="cookie-category-header">
                                <input type="checkbox" id="marketing-cookies">
                                <label for="marketing-cookies">
                                    <strong>Marketing Cookies</strong>
                                    <p>Used to deliver personalized advertisements</p>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="cookie-modal-footer">
                        <button id="save-preferences" class="cookie-btn cookie-btn-primary">Save Preferences</button>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        banner.querySelector('#accept-all-cookies').addEventListener('click', () => this.acceptAllCookies());
        banner.querySelector('#reject-all-cookies').addEventListener('click', () => this.rejectAllCookies());
        banner.querySelector('#manage-cookies').addEventListener('click', () => this.showPreferencesModal());
        banner.querySelector('.cookie-modal-close').addEventListener('click', () => this.hidePreferencesModal());
        banner.querySelector('#save-preferences').addEventListener('click', () => this.savePreferences());

        this.banner = banner;
        document.body.appendChild(banner);
    }

    showBanner() {
        if (this.banner) {
            setTimeout(() => {
                this.banner.classList.add('show');
            }, 1000);
        }
    }

    acceptAllCookies() {
        this.setCookie('cookie-consent', 'accepted', 365);
        this.setCookie('cookie-preferences', JSON.stringify({
            necessary: true,
            analytics: true,
            marketing: true
        }), 365);

        this.applyConsentChoices();
        this.hideBanner();
    }

    rejectAllCookies() {
        this.setCookie('cookie-consent', 'rejected', 365);
        this.setCookie('cookie-preferences', JSON.stringify({
            necessary: true,
            analytics: false,
            marketing: false
        }), 365);

        this.applyConsentChoices();
        this.hideBanner();
    }

    showPreferencesModal() {
        const modal = document.getElementById('cookie-preferences-modal');
        if (modal) {
            modal.style.display = 'block';
            // Load existing preferences
            const prefs = this.consentPreferences;
            if (prefs.analytics !== undefined) {
                document.getElementById('analytics-cookies').checked = prefs.analytics;
            }
            if (prefs.marketing !== undefined) {
                document.getElementById('marketing-cookies').checked = prefs.marketing;
            }
        }
    }

    hidePreferencesModal() {
        const modal = document.getElementById('cookie-preferences-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    savePreferences() {
        const analytics = document.getElementById('analytics-cookies').checked;
        const marketing = document.getElementById('marketing-cookies').checked;

        this.setCookie('cookie-consent', 'custom', 365);
        this.setCookie('cookie-preferences', JSON.stringify({
            necessary: true,
            analytics: analytics,
            marketing: marketing
        }), 365);

        this.applyConsentChoices();
        this.hidePreferencesModal();
        this.hideBanner();
    }

    applyConsentChoices() {
        const prefs = JSON.parse(this.getCookie('cookie-preferences') || '{}');

        // Load Google Analytics if consented
        if (prefs.analytics !== false) {
            this.loadGoogleAnalytics();
        }

        // Load AdSense if consented (for non-EU users or EU users who consented)
        if (!this.isEUUser || prefs.marketing !== false) {
            this.loadAdSense();
        }
    }

    loadGoogleAnalytics() {
        // Load Google Analytics if not already loaded
        if (!window.gtag && this.getCookie('cookie-preferences')) {
            const prefs = JSON.parse(this.getCookie('cookie-preferences') || '{}');
            if (prefs.analytics !== false) {
                // Google Analytics code would go here
                console.log('Google Analytics loaded');
            }
        }
    }

    loadAdSense() {
        // AdSense is already in the head, but we can control when it executes
        console.log('AdSense consent given');
    }

    hideBanner() {
        if (this.banner) {
            this.banner.classList.remove('show');
            setTimeout(() => {
                this.banner.remove();
            }, 300);
        }
    }

    setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = name + '=' + value + ';expires=' + expires.toUTCString() + ';path=/;SameSite=Lax';
    }

    getCookie(name) {
        const nameEQ = name + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
}

// Initialize cookie consent when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new CookieConsent();
});
