/**
 * Vanilla JavaScript Browser Detection
 * Replacement for browser.min.js
 */
const browser = (function() {
    'use strict';

    const browser = {
        name: null,
        version: null,
        os: null,
        osVersion: null,
        touch: null,
        mobile: null,
        _canUse: null,

        canUse: function(prop) {
            if (this._canUse === null) {
                this._canUse = document.createElement('div');
            }
            const style = this._canUse.style;
            const capitalized = prop.charAt(0).toUpperCase() + prop.slice(1);
            return prop in style ||
                   'Moz' + capitalized in style ||
                   'Webkit' + capitalized in style ||
                   'O' + capitalized in style ||
                   'ms' + capitalized in style;
        },

        init: function() {
            const ua = navigator.userAgent;
            let name = 'other';
            let version = 0;

            // Browser detection
            const browsers = [
                ['firefox', /Firefox\/([0-9\.]+)/],
                ['bb', /BlackBerry.+Version\/([0-9\.]+)/],
                ['bb', /BB[0-9]+.+Version\/([0-9\.]+)/],
                ['opera', /OPR\/([0-9\.]+)/],
                ['opera', /Opera\/([0-9\.]+)/],
                ['edge', /Edge\/([0-9\.]+)/],
                ['safari', /Version\/([0-9\.]+).+Safari/],
                ['chrome', /Chrome\/([0-9\.]+)/],
                ['ie', /MSIE ([0-9]+)/],
                ['ie', /Trident\/.+rv:([0-9]+)/]
            ];

            for (let i = 0; i < browsers.length; i++) {
                const match = ua.match(browsers[i][1]);
                if (match) {
                    name = browsers[i][0];
                    version = parseFloat(match[1]);
                    break;
                }
            }

            this.name = name;
            this.version = version;

            // OS detection
            let os = 'other';
            let osVersion = 0;

            const osList = [
                ['ios', /([0-9_]+) like Mac OS X/, (v) => v.replace(/_/g, '.')],
                ['ios', /CPU like Mac OS X/, () => '0'],
                ['wp', /Windows Phone ([0-9\.]+)/, null],
                ['android', /Android ([0-9\.]+)/, null],
                ['mac', /Macintosh.+Mac OS X ([0-9_]+)/, (v) => v.replace(/_/g, '.')],
                ['windows', /Windows NT ([0-9\.]+)/, null],
                ['bb', /BlackBerry.+Version\/([0-9\.]+)/, null],
                ['bb', /BB[0-9]+.+Version\/([0-9\.]+)/, null],
                ['linux', /Linux/, null],
                ['bsd', /BSD/, null],
                ['unix', /X11/, null]
            ];

            for (let i = 0; i < osList.length; i++) {
                const match = ua.match(osList[i][1]);
                if (match) {
                    os = osList[i][0];
                    osVersion = parseFloat(osList[i][2] ? osList[i][2](match[1]) : match[1]);
                    break;
                }
            }

            // Special case for iPad
            if (os === 'mac' && 'ontouchstart' in window &&
                (screen.width === 1024 && screen.height === 1366 ||
                 screen.width === 834 && screen.height === 1112 ||
                 screen.width === 810 && screen.height === 1080 ||
                 screen.width === 768 && screen.height === 1024)) {
                os = 'ios';
            }

            this.os = os;
            this.osVersion = osVersion;

            // Touch and mobile detection
            this.touch = os === 'wp' ? navigator.msMaxTouchPoints > 0 : 'ontouchstart' in window;
            this.mobile = ['wp', 'android', 'ios', 'bb'].includes(os);
        }
    };

    browser.init();
    return browser;
})();

// Make it available globally
window.browser = browser;
