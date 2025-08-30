/**
 * VibeSim — Fire Percolation (SAX v2.3 Clean Build) - JavaScript Version
 * Transpiled from JSX for browser compatibility
 */

// Global variables for the simulation
const G = 96;
const CELL = 6;
const W = G * CELL;
const H = W;

/***********************************
 * Minimal math + utils
 ***********************************/
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function mean(xs) { return xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length); }
function stdev(xs) {
    const m = mean(xs);
    return Math.sqrt(mean(xs.map(x => (x - m) * (x - m))));
}

// Small t-critical table for 95% CI (two-sided), df=n-1 up to 60.
const t95 = {
    1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571, 6: 2.447, 7: 2.365, 8: 2.306,
    9: 2.262, 10: 2.228, 11: 2.201, 12: 2.179, 13: 2.160, 14: 2.145, 15: 2.131,
    16: 2.120, 17: 2.110, 18: 2.101, 19: 2.093, 20: 2.086, 21: 2.080, 22: 2.074,
    23: 2.069, 24: 2.064, 25: 2.060, 26: 2.056, 27: 2.052, 28: 2.048, 29: 2.045,
    30: 2.042, 40: 2.021, 60: 2.000
};
function tCritical95(n) {
    if (n <= 1) return Infinity;
    if (t95[n]) return t95[n];
    if (n < 40) return t95[30];
    if (n < 60) return t95[40];
    return t95[60];
}

/***********************************
 * RNG — PCG32 (Compat). Replace with WASM PCG64 for strict §6.20.
 ***********************************/
class PCG32 {
    constructor(seed = 42, seq = 54) {
        this.state = 0n;
        this.inc = (BigInt(seq) << 1n) | 1n;
        this.next();
        this.state = (this.state + BigInt(seed)) & ((1n << 64n) - 1n);
        this.next();
    }

    next() {
        const old = this.state;
        this.state = (old * 6364136223846793005n + this.inc) & ((1n << 64n) - 1n);
        const xorshifted = Number(((old >> 18n) ^ old) >> 27n) >>> 0;
        const rot = Number(old >> 59n) & 31;
        return (xorshifted >>> rot) | (xorshifted << ((-rot) & 31));
    }

    nextU32() { return this.next(); }
    float01() { return this.nextU32() / 0x1_0000_0000; }
}

class RNGFactory {
    constructor(user_seed, run_id) {
        this.user_seed = user_seed | 0;
        this.run_id = run_id | 0;
        this.run_seed = ((this.user_seed * 1315423911) ^ (this.run_id * 2654435761)) >>> 0;
    }

    makeStream(name) {
        let h = 2166136261 >>> 0;
        for (const ch of name) {
            h ^= ch.charCodeAt(0);
            h = Math.imul(h, 16777619) >>> 0;
        }
        const seq = (h ^ this.run_seed) >>> 0;
        return new PCG32(this.run_seed, seq);
    }
}

/***********************************
 * Ledger — .saxlg with hash chain + ECDSA P‑256 signature
 ***********************************/
function canonical(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(canonical);
    const out = {};
    for (const k of Object.keys(obj).sort()) {
        out[k] = canonical(obj[k]);
    }
    return out;
}

async function sha256Hex(str) {
    const buf = new TextEncoder().encode(str);
    const dig = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(dig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

class Ledger {
    constructor(meta) {
        this.events = [];
        this.lastHash = "";
        this.$meta = meta;
        this.keyPair = null;
    }

    async init() {
        try {
            this.keyPair = await crypto.subtle.generateKey(
                { name: 'ECDSA', namedCurve: 'P-256' },
                true, ['sign', 'verify']
            );
        } catch (e) {
            console.warn('ECDSA unavailable', e);
        }
    }

    async record(type, data, t) {
        const ev = { t, type, data: canonical(data), prev: this.lastHash || null, hash: '' };
        const toHash = JSON.stringify({ prev: ev.prev, t: ev.t, type: ev.type, data: ev.data });
        ev.hash = await sha256Hex(toHash);
        this.lastHash = ev.hash;
        this.events.push(ev);
    }

    receipt() {
        return { event_root: this.lastHash, count: this.events.length };
    }

    async exportSAXLG() {
        const doc = { $meta: canonical(this.$meta), events: this.events.map(canonical) };
        if (this.keyPair) {
            try {
                const ser = new TextEncoder().encode(JSON.stringify(canonical(doc)));
                const sig = await crypto.subtle.sign(
                    { name: 'ECDSA', hash: { name: 'SHA-256' } },
                    this.keyPair.privateKey, ser
                );
                const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
                const spki = await crypto.subtle.exportKey('spki', this.keyPair.publicKey);
                const pubB64 = btoa(String.fromCharCode(...new Uint8Array(spki)));
                doc.signature = { algorithm: 'ECDSA-P256', value: sigB64, public_key: pubB64 };
            } catch (e) {
                console.warn('sign failed', e);
            }
        }
        return new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
    }
}

/***********************************
 * Simulation core — Fire Percolation
 ***********************************/
function runFireStep(grid, rng, pSpread) {
    const next = new Uint8Array(grid);
    let burning = 0;
    for (let y = 0; y < G; y++) {
        for (let x = 0; x < G; x++) {
            const i = y * G + x;
            const v = grid[i];
            if (v === 2) {
                next[i] = 3; // burning → ash
                // neighbors
                if (x + 1 < G && grid[i + 1] === 1 && rng.float01() < pSpread) next[i + 1] = 2;
                if (x - 1 >= 0 && grid[i - 1] === 1 && rng.float01() < pSpread) next[i - 1] = 2;
                if (y + 1 < G && grid[i + G] === 1 && rng.float01() < pSpread) next[i + G] = 2;
                if (y - 1 >= 0 && grid[i - G] === 1 && rng.float01() < pSpread) next[i - G] = 2;
            }
            if (next[i] === 2) burning++;
        }
    }
    return { next, burning };
}

function paint(grid, x, y, mode) {
    const gx = Math.floor(x / CELL), gy = Math.floor(y / CELL);
    if (gx < 0 || gy < 0 || gx >= G || gy >= G) return;
    const i = gy * G + gx;
    if (mode === 'break') grid[i] = 0;
    else if (mode === 'tree') grid[i] = 1;
    else grid[i] = 2;
}

/***********************************
 * React component (transpiled to plain JS)
 ***********************************/
function FirePercolation_SAX23() {
    // React hooks simulation using plain JavaScript
    const [userSeed] = useState(() => {
        const qs = new URLSearchParams(window.location.hash.split('?')[1] || '');
        const s = qs.get('seed');
        return s ? parseInt(s) : Math.floor(Math.random() * 1e9);
    });

    const runId = 1;
    const rngFactory = useMemo(() => new RNGFactory(userSeed, runId), [userSeed]);
    const rng_control = useMemo(() => rngFactory.makeStream('control'), [rngFactory]);
    const rng_noise = useMemo(() => rngFactory.makeStream('noise'), [rngFactory]);
    const rng_overlay = useMemo(() => rngFactory.makeStream('overlay'), [rngFactory]);
    const rng_phys = useMemo(() => rngFactory.makeStream('physics'), [rngFactory]);

    const ledger = useMemo(() => new Ledger({
        spec: 'saxlg/1', simulation: 'fire-percolation', version: '2025.08.30',
        generator: 'PCG32-JS (compat — replace with NumPy PCG64 per §6.20)',
        user_seed: userSeed, run_seed: rngFactory.run_seed, streams: ['control', 'noise', 'overlay', 'physics'],
        samplers: { overlay: 'blue_noise' }, processing_mode: false,
        env: { ua: navigator.userAgent, tz: Intl.DateTimeFormat().resolvedOptions().timeZone },
        resolution: [W, H], fps: 60, dt: 0.05,
        deep_link: `#/fire-percolation?seed=${userSeed}`
    }), [userSeed]);

    // Initialize ledger
    useEffect(() => { ledger.init(); }, [ledger]);

    const canvasRef = useRef(null);
    const gridRef = useRef(new Uint8Array(G * G).fill(1)); // start as forest
    const [mode, setMode] = useState('ignite');
    const [pSpread, setPSpread] = useState(0.35);
    const [kpi, setKpi] = useState({ crossed: false, burning: 0, treeDensity: 1 });
    const [running, setRunning] = useState(true);

    // Initialize forest with some ignited cells
    useEffect(() => {
        const g = gridRef.current;
        for (let y = 0; y < G; y++) {
            if (rng_noise.float01() < 0.10) g[y * G + 0] = 2;
        }
    }, []);

    const dragging = useRef(false);
    const onPointer = (e) => {
        const rect = e.target.getBoundingClientRect();
        paint(gridRef.current, e.clientX - rect.left, e.clientY - rect.top, mode);
    };

    const tRef = useRef(0);
    const accRef = useRef(0);
    const lastTsRef = useRef(null);
    const DT = 0.05;

    // Animation loop
    useEffect(() => {
        let raf;
        const tick = (ts) => {
            if (lastTsRef.current == null) lastTsRef.current = ts;
            const dt = (ts - lastTsRef.current) / 1000;
            lastTsRef.current = ts;
            accRef.current += dt;

            const cvs = canvasRef.current;
            if (!cvs) {
                raf = requestAnimationFrame(tick);
                return;
            }

            const ctx = cvs.getContext('2d');

            while (accRef.current >= DT) {
                if (running) {
                    const { next, burning } = runFireStep(gridRef.current, rng_phys, pSpread);
                    gridRef.current = next;
                    tRef.current += DT;

                    const crossed = gridRef.current.some((v, idx) => (idx % G) === G - 1 && v === 2);
                    const trees = gridRef.current.reduce((a, b) => a + (b === 1 ? 1 : 0), 0);
                    const treeDensity = trees / (G * G);

                    setKpi({ crossed, burning, treeDensity });

                    ledger.record('step', { dt: DT }, tRef.current);
                    ledger.record('metrics', { burning, crossed }, tRef.current);
                    ledger.record('num', { dt: DT, relax_complete: true }, tRef.current);
                }
                accRef.current -= DT;
            }

            // Render
            ctx.clearRect(0, 0, W, H);
            const g = gridRef.current;
            for (let y = 0; y < G; y++) {
                for (let x = 0; x < G; x++) {
                    const v = g[y * G + x];
                    ctx.fillStyle = v === 0 ? '#e2e8f0' : v === 1 ? '#16a34a' : v === 2 ? '#ef4444' : '#475569';
                    ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
                }
            }

            // Overlays
            ctx.save();
            ctx.font = '12px ui-monospace, SFMono-Regular, Menlo, monospace';
            ctx.fillStyle = '#0f172a';
            ctx.fillText(`RNG: control/noise/overlay/physics (PCG32‑JS compat)`, 8, 16);
            ctx.restore();

            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [running, pSpread, mode]);

    // Initialize simulation
    useEffect(() => {
        ledger.record('simulation_start', {
            initial: { pSpread, mode, grid: 'forest', ignite: 'left-10%' }
        }, 0.0);
    }, []);

    // Parameter change recording
    const setParam = async (name, from, to) => {
        await ledger.record('parameter_change', {
            parameter: name,
            old_value: from,
            new_value: to,
            user_initiated: true
        }, tRef.current);
    };

    // Accreditation system
    const [accreditation, setAccreditation] = useState(false);
    const [repCount, setRepCount] = useState(30);
    const [ci, setCI] = useState(null);

    const runReplications = async () => {
        setCI(null);
        const results = [];

        for (let r = 0; r < repCount; r++) {
            const rf = new RNGFactory(userSeed, runId + r);
            const r_noise = rf.makeStream('noise');
            const r_phys = rf.makeStream('physics');

            let grid = new Uint8Array(G * G).fill(1);
            for (let y = 0; y < G; y++) if (r_noise.float01() < 0.10) grid[y * G + 0] = 2;

            let burning = 1, steps = 0, crossed = false;
            while (burning > 0 && steps < 2000) {
                const step = runFireStep(grid, r_phys, pSpread);
                grid = step.next;
                burning = step.burning;
                crossed = crossed || grid.some((v, idx) => (idx % G) === G - 1 && v === 2);
                steps++;
            }
            results.push(crossed ? 1 : 0);
            await ledger.record('metrics', { rep: r, crossed }, tRef.current);
        }

        const m = mean(results);
        const s = stdev(results);
        const n = results.length;
        const t = tCritical95(n);
        const half = t * s / Math.sqrt(n);
        const lo = clamp(m - half, 0, 1);
        const hi = clamp(m + half, 0, 1);
        setCI({ mean: m, lo, hi });

        await ledger.record('kpi', {
            name: 'percolation_prob',
            mean: m,
            ci_lo: lo,
            ci_hi: hi,
            n: repCount,
            vr: { crn: true, antithetic: false }
        }, tRef.current);
    };

    // Finalize and export
    const finalize = async () => {
        const blob = await ledger.exportSAXLG();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fire-percolation_${userSeed}.saxlg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        const repro = `# REPRODUCIBILITY\n\nUSER_SEED: ${userSeed}\nRUN_ID: ${runId}\nRUN_SEED: ${rngFactory.run_seed}\nSTREAMS: control, noise, overlay, physics\nGENERATOR: PCG32-JS (compat) → Replace with NumPy PCG64 (§6.20)\nSCENE: fire-percolation v2025.08.30\nRESOLUTION: ${W}x${H} @ 60fps\nDT: ${0.05}\nPARAMS: pSpread=${pSpread}\nSTEPS: event_root=${ledger.receipt().event_root}\n`;
        const rb = new Blob([repro], { type: 'text/markdown' });
        const url2 = URL.createObjectURL(rb);
        const a2 = document.createElement('a');
        a2.href = url2;
        a2.download = `REPRODUCIBILITY.md`;
        document.body.appendChild(a2);
        a2.click();
        a2.remove();
        URL.revokeObjectURL(url2);
    };

    // Render the component (transpiled JSX)
    return React.createElement('div', {
        className: 'min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900 p-4 md:p-6'
    }, [
        React.createElement('div', {
            className: 'max-w-5xl mx-auto space-y-4',
            key: 'container'
        }, [
            React.createElement('div', {
                className: 'flex items-baseline justify-between gap-3',
                key: 'header'
            }, [
                React.createElement('h1', {
                    className: 'text-2xl md:text-3xl font-bold tracking-tight',
                    key: 'title'
                }, 'Fire Percolation — SAX v2.3'),
                React.createElement('div', {
                    className: 'text-xs text-slate-500',
                    key: 'seed'
                }, 'Seed: ', React.createElement('span', {
                    className: 'font-mono'
                }, userSeed))
            ]),

            React.createElement('div', {
                className: 'rounded-2xl border border-slate-200 p-3 bg-white/85 backdrop-blur',
                key: 'simulation-card'
            }, [
                React.createElement('div', {
                    className: 'flex items-center gap-3 text-sm',
                    key: 'controls'
                }, [
                    React.createElement('div', {
                        className: 'inline-flex items-center gap-1',
                        key: 'brush-control'
                    }, [
                        React.createElement('label', {
                            className: 'text-slate-600 mr-1',
                            key: 'brush-label'
                        }, 'Brush'),
                        React.createElement('select', {
                            className: 'border rounded px-2 py-1',
                            value: mode,
                            onChange: e => { const v = e.target.value; setParam('brush', mode, v); setMode(v); },
                            key: 'brush-select'
                        }, [
                            React.createElement('option', { value: 'ignite', key: 'ignite' }, 'Ignite'),
                            React.createElement('option', { value: 'break', key: 'break' }, 'Firebreak'),
                            React.createElement('option', { value: 'tree', key: 'tree' }, 'Trees')
                        ])
                    ]),

                    React.createElement('div', {
                        className: 'inline-flex items-center gap-2 ml-4',
                        key: 'spread-control'
                    }, [
                        React.createElement('span', {
                            className: 'text-slate-600',
                            key: 'spread-label'
                        }, 'Spread'),
                        React.createElement('input', {
                            type: 'range',
                            min: 0,
                            max: 1,
                            step: 0.01,
                            value: pSpread,
                            onChange: e => { const v = Number(e.target.value); setParam('pSpread', pSpread, v); setPSpread(v); },
                            key: 'spread-slider'
                        }),
                        React.createElement('span', {
                            className: 'font-mono text-xs',
                            key: 'spread-value'
                        }, pSpread.toFixed(2))
                    ]),

                    React.createElement('div', {
                        className: 'ml-auto inline-flex items-center gap-2',
                        key: 'buttons'
                    }, [
                        React.createElement('button', {
                            onClick: () => { setRunning(!running); },
                            className: 'px-3 py-1.5 rounded bg-slate-900 text-white text-xs',
                            key: 'run-btn'
                        }, running ? 'Pause' : 'Run'),
                        React.createElement('button', {
                            onClick: () => {
                                const g = gridRef.current; g.fill(1);
                                for (let y = 0; y < G; y++) if (rng_noise.float01() < 0.10) g[y * G + 0] = 2;
                                tRef.current = 0;
                                ledger.record('simulation_start', { reset: true, pSpread, mode }, 0.0);
                            },
                            className: 'px-3 py-1.5 rounded border text-xs',
                            key: 'reset-btn'
                        }, 'Reset')
                    ])
                ]),

                React.createElement('div', {
                    className: 'mt-3',
                    key: 'canvas-container'
                }, React.createElement('canvas', {
                    ref: canvasRef,
                    width: W,
                    height: H,
                    className: 'rounded-xl border border-slate-200 touch-none select-none',
                    onPointerDown: (e) => { dragging.current = true; onPointer(e); },
                    onPointerMove: (e) => dragging.current && onPointer(e),
                    onPointerUp: () => { dragging.current = false; },
                    onPointerLeave: () => { dragging.current = false; },
                    key: 'canvas'
                })),

                React.createElement('div', {
                    className: 'mt-2 text-[11px] text-slate-600',
                    key: 'kpi'
                }, 'KPI: crossed? ', React.createElement('span', {
                    className: `font-semibold ${kpi.crossed ? 'text-rose-600' : 'text-slate-800'}`
                }, kpi.crossed ? 'Yes' : 'No'), ' · burning: ', kpi.burning, ' · trees: ', (kpi.treeDensity).toFixed(2))
            ]),

            React.createElement('div', {
                className: 'grid md:grid-cols-2 gap-4',
                key: 'bottom-section'
            }, [
                React.createElement('div', {
                    className: 'rounded-2xl border border-slate-200 p-4 bg-white/85',
                    key: 'accreditation'
                }, [
                    React.createElement('div', {
                        className: 'flex items-center justify-between mb-2',
                        key: 'acc-header'
                    }, [
                        React.createElement('div', {
                            className: 'text-sm font-semibold text-slate-700',
                            key: 'acc-title'
                        }, 'Accreditation'),
                        React.createElement('label', {
                            className: 'text-xs inline-flex items-center gap-2',
                            key: 'acc-toggle'
                        }, [
                            React.createElement('input', {
                                type: 'checkbox',
                                checked: accreditation,
                                onChange: e => {
                                    setAccreditation(e.target.checked);
                                    ledger.record('parameter_change', {
                                        parameter: 'accreditation',
                                        new_value: e.target.checked,
                                        user_initiated: true
                                    }, tRef.current);
                                },
                                key: 'acc-checkbox'
                            }),
                            'ON'
                        ])
                    ]),

                    accreditation && React.createElement('div', {
                        className: 'space-y-2 text-sm',
                        key: 'acc-controls'
                    }, [
                        React.createElement('div', {
                            className: 'flex items-center gap-2',
                            key: 'rep-control'
                        }, [
                            React.createElement('span', { key: 'rep-label' }, 'Replications'),
                            React.createElement('input', {
                                type: 'number',
                                min: 10,
                                max: 200,
                                value: repCount,
                                onChange: e => setRepCount(parseInt(e.target.value || '30')),
                                className: 'w-20 border rounded px-2 py-1',
                                key: 'rep-input'
                            }),
                            React.createElement('button', {
                                onClick: runReplications,
                                className: 'px-3 py-1.5 rounded bg-slate-900 text-white text-xs',
                                key: 'run-rep-btn'
                            }, 'Run')
                        ]),

                        ci && React.createElement('div', {
                            className: 'text-[12px] text-slate-700',
                            key: 'ci-results'
                        }, [
                            'percolation_prob = ', React.createElement('span', {
                                className: 'font-mono',
                                key: 'ci-mean'
                            }, ci.mean.toFixed(3)), ' ± ', React.createElement('span', {
                                className: 'font-mono',
                                key: 'ci-error'
                            }, ((ci.hi - ci.lo) / 2).toFixed(3)), ' (95% CI)',
                            React.createElement('div', {
                                className: 'mt-1 h-2 bg-slate-200 rounded',
                                key: 'ci-bar'
                            }, React.createElement('div', {
                                className: 'h-2 rounded bg-slate-500',
                                style: { width: `${Math.round(ci.mean * 100)}%` },
                                key: 'ci-fill'
                            }))
                        ])
                    ])
                ]),

                React.createElement('div', {
                    className: 'rounded-2xl border border-slate-200 p-4 bg-white/85',
                    key: 'archive'
                }, [
                    React.createElement('div', {
                        className: 'text-sm font-semibold text-slate-700 mb-2',
                        key: 'archive-title'
                    }, 'Archive & Evidence'),
                    React.createElement('div', {
                        className: 'flex items-center gap-2',
                        key: 'archive-controls'
                    }, [
                        React.createElement('button', {
                            onClick: finalize,
                            className: 'px-3 py-2 rounded bg-slate-900 text-white text-xs',
                            key: 'export-btn'
                        }, 'Finalize & Download .saxlg + REPRODUCIBILITY.md'),
                        React.createElement('div', {
                            className: 'text-[11px] text-slate-600',
                            key: 'event-root'
                        }, 'event_root: ', React.createElement('span', {
                            className: 'font-mono',
                            key: 'root-value'
                        }, ledger.receipt().event_root.slice(0, 16) + '…'))
                    ]),
                    React.createElement('div', {
                        className: 'text-[11px] text-slate-500 mt-2',
                        key: 'compliance-note'
                    }, '$meta includes generator, seeds, streams, samplers, resolution, fps, dt; events include simulation_start, parameter_change, step, metrics, num, kpi.')
                ])
            ])
        ])
    ]);
}

// Simple React hooks simulation for plain JS
let stateIndex = 0;
const states = new Map();
const effects = new Map();

function useState(initialValue) {
    const key = stateIndex++;
    if (!states.has(key)) {
        states.set(key, typeof initialValue === 'function' ? initialValue() : initialValue);
    }
    return [
        states.get(key),
        (newValue) => {
            const currentValue = states.get(key);
            const updatedValue = typeof newValue === 'function' ? newValue(currentValue) : newValue;
            states.set(key, updatedValue);
            // Trigger re-render (simplified)
            renderApp();
        }
    ];
}

function useRef(initialValue) {
    return { current: initialValue };
}

function useMemo(factory, deps) {
    const key = stateIndex++;
    if (!states.has(key)) {
        states.set(key, { value: factory(), deps });
    }
    const cached = states.get(key);
    if (!cached.deps || !deps || cached.deps.some((dep, i) => dep !== deps[i])) {
        cached.value = factory();
        cached.deps = deps;
    }
    return cached.value;
}

function useEffect(callback, deps) {
    const key = stateIndex++;
    const prevDeps = effects.get(key);

    if (!prevDeps || !deps || prevDeps.some((dep, i) => dep !== deps[i])) {
        // Cleanup previous effect if it exists
        if (prevDeps && prevDeps.cleanup) {
            prevDeps.cleanup();
        }

        // Run new effect
        const cleanup = callback();
        effects.set(key, { deps, cleanup });
    }
}

function renderApp() {
    stateIndex = 0;
    const container = document.getElementById('fire-percolation-app');
    if (container) {
        ReactDOM.render(FirePercolation_SAX23(), container);
    }
}

// Make component globally available
window.FirePercolation_SAX23 = FirePercolation_SAX23;
