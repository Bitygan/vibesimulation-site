/**
 * Vanilla JavaScript Breakpoints
 * Replacement for breakpoints.min.js
 */
const breakpoints = (function() {
    'use strict';

    let list = null;
    let media = {};
    let events = [];

    function init(breakpointsList) {
        list = breakpointsList;
        window.addEventListener('resize', poll);
        window.addEventListener('orientationchange', poll);
        window.addEventListener('load', poll);
        window.addEventListener('fullscreenchange', poll);
    }

    function active(query) {
        if (!(query in media)) {
            let condition = null;
            let breakpoint = null;
            let mode = null;

            // Parse query
            if (query.substr(0, 2) === '>=') {
                mode = 'gte';
                breakpoint = query.substr(2);
            } else if (query.substr(0, 2) === '<=') {
                mode = 'lte';
                breakpoint = query.substr(2);
            } else if (query.substr(0, 1) === '>') {
                mode = 'gt';
                breakpoint = query.substr(1);
            } else if (query.substr(0, 1) === '<') {
                mode = 'lt';
                breakpoint = query.substr(1);
            } else if (query.substr(0, 1) === '!') {
                mode = 'not';
                breakpoint = query.substr(1);
            } else {
                mode = 'eq';
                breakpoint = query;
            }

            if (breakpoint && breakpoint in list) {
                const bp = list[breakpoint];
                let conditionStr = null;

                if (Array.isArray(bp)) {
                    const min = parseInt(bp[0]);
                    const max = parseInt(bp[1]);
                    const unit = isNaN(min) ? bp[1].substr(String(max).length) : bp[0].substr(String(min).length);

                    if (isNaN(min)) {
                        switch (mode) {
                            case 'gte': conditionStr = 'screen'; break;
                            case 'lte': conditionStr = `screen and (max-width: ${max}${unit})`; break;
                            case 'gt': conditionStr = `screen and (min-width: ${(max + 1)}${unit})`; break;
                            case 'lt': conditionStr = 'screen and (max-width: -1px)'; break;
                            case 'not': conditionStr = `screen and (min-width: ${(max + 1)}${unit})`; break;
                            default: conditionStr = `screen and (max-width: ${max}${unit})`;
                        }
                    } else if (isNaN(max)) {
                        switch (mode) {
                            case 'gte': conditionStr = `screen and (min-width: ${min}${unit})`; break;
                            case 'lte': conditionStr = 'screen'; break;
                            case 'gt': conditionStr = 'screen and (max-width: -1px)'; break;
                            case 'lt': conditionStr = `screen and (max-width: ${(min - 1)}${unit})`; break;
                            case 'not': conditionStr = `screen and (max-width: ${(min - 1)}${unit})`; break;
                            default: conditionStr = `screen and (min-width: ${min}${unit})`;
                        }
                    } else {
                        switch (mode) {
                            case 'gte': conditionStr = `screen and (min-width: ${min}${unit})`; break;
                            case 'lte': conditionStr = `screen and (max-width: ${max}${unit})`; break;
                            case 'gt': conditionStr = `screen and (min-width: ${(max + 1)}${unit})`; break;
                            case 'lt': conditionStr = `screen and (max-width: ${(min - 1)}${unit})`; break;
                            case 'not': conditionStr = `screen and (max-width: ${(min - 1)}${unit}), screen and (min-width: ${(max + 1)}${unit})`; break;
                            default: conditionStr = `screen and (min-width: ${min}${unit}) and (max-width: ${max}${unit})`;
                        }
                    }
                } else {
                    conditionStr = bp.charAt(0) === '(' ? `screen and ${bp}` : bp;
                }

                media[query] = conditionStr ? window.matchMedia(conditionStr) : false;
            } else {
                media[query] = false;
            }
        }

        return media[query] !== false && media[query].matches;
    }

    function on(query, handler) {
        events.push({
            query: query,
            handler: handler,
            state: false
        });

        if (active(query)) {
            handler();
        }
    }

    function poll() {
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            const isActive = active(event.query);

            if (isActive && !event.state) {
                event.state = true;
                event.handler();
            } else if (!isActive && event.state) {
                event.state = false;
            }
        }
    }

    return {
        _: { list, media, events, init, active, on, poll },
        on: on,
        active: active,
        init: init
    };
})();

// Make it available globally
window.breakpoints = breakpoints;
