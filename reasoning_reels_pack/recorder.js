
/*
 * VibeSimulation Reasoning Reels — recorder.js (MVP)
 * --------------------------------------------------
 * Drop this <script> AFTER your simulations are defined (near the end of index.html).
 * It auto-instruments the four cards in your current page:
 *   - Fluid Dynamics (#fluid-dynamics)              -> window.paintedSkySim
 *   - Electrostatics (#electrostatics)              -> window.chargePainterSim
 *   - Wave Physics (#wave-physics)                  -> window.resonantCanvasSim
 *   - Drag Rangefinder (#drag-rangefinder)          -> window.dragRangefinderSim
 *
 * CPU-conscious design:
 *   - No hashing during interaction. We compute the hash-chain only on export.
 *   - Pointer logging throttled (~20 Hz), state digests sampled at 1 Hz with cheap FNV-1a over sparse samples.
 *   - Hashing uses WebCrypto at export time (runs off the critical render path).
 *
 * Output:
 *   - Downloads a newline-delimited JSON ledger (.saxlg)
 *     Line1: {$meta:{...}}   // includes event_root and (if available) Ed25519 signature
 *     LineN: event rows (param/pointer/state/milestone/measure)
 */

(function () {
  // ---------- Utilities ----------
  const enc = new TextEncoder();

  function canonicalize(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(canonicalize);
    const out = {};
    Object.keys(obj).sort().forEach(k => {
      const v = obj[k];
      out[k] = canonicalize(v);
    });
    return out;
  }

  function canonicalString(obj) {
    return JSON.stringify(canonicalize(obj));
  }

  function concatBytes(a, b) {
    const out = new Uint8Array(a.length + b.length);
    out.set(a, 0);
    out.set(b, a.length);
    return out;
  }

  function hex(buf) {
    const v = new Uint8Array(buf);
    let s = "";
    for (let i = 0; i < v.length; i++) s += v[i].toString(16).padStart(2, "0");
    return s;
  }

  // Fast, non-crypto digest for checkpoints (cheap & tiny)
  function fnv1a32(bytes) {
    let h = 0x811c9dc5 >>> 0;
    for (let i = 0; i < bytes.length; i++) {
      h ^= bytes[i];
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return ("00000000" + h.toString(16)).slice(-8);
  }

  function sampleFloat32(arr, step) {
    const view = new DataView(new ArrayBuffer(4));
    const out = new Uint8Array(Math.ceil(arr.length / step) * 4);
    let j = 0;
    for (let i = 0; i < arr.length; i += step) {
      view.setFloat32(0, arr[i] || 0, true);
      out.set(new Uint8Array(view.buffer), j);
      j += 4;
    }
    return out;
  }

  function now() {
    return (performance && performance.now ? performance.now() : Date.now()) / 1000;
  }

  // Try to reuse df(meta, rows, fname) if present (from your React bundle); else fallback
  function downloadSAXLG(meta, rows, filename) {
    if (typeof window.df === 'function') {
      window.df(meta, rows, filename);
      return;
    }
    const lines = [JSON.stringify({ $meta: meta }), ...rows.map(r => JSON.stringify(r))];
    const blob = new Blob([lines.join("\n")], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename.endsWith(".saxlg") ? filename : (filename + ".saxlg");
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ---------- Hash-chain + signing (export-time only) ----------
  async function computeEventRoot(rows) {
    // H0 = 32 bytes zeros
    let prev = new Uint8Array(32);
    for (const ev of rows) {
      const s = canonicalString(ev);
      const data = concatBytes(prev, enc.encode(s));
      prev = new Uint8Array(await crypto.subtle.digest('SHA-256', data));
    }
    return "sha256-" + hex(prev);
  }

  async function signMetaEd25519(metaWithoutSig, event_root) {
    // MVP: generate ephemeral key if Ed25519 is supported; otherwise return null.
    try {
      const algo = { name: "Ed25519" };
      const keyPair = await crypto.subtle.generateKey(algo, true, ["sign", "verify"]);
      const toSign = enc.encode(JSON.stringify({ ...metaWithoutSig, event_root }));
      const sig = await crypto.subtle.sign(algo.name, keyPair.privateKey, toSign);
      const pub = await crypto.subtle.exportKey("raw", keyPair.publicKey);
      return {
        sig_alg: "ed25519",
        pub: btoa(String.fromCharCode(...new Uint8Array(pub))),
        sig: btoa(String.fromCharCode(...new Uint8Array(sig))),
      };
    } catch (err) {
      console.warn("Ed25519 not available; exporting unsigned reel.", err);
      return null;
    }
  }

  // ---------- Recorder core ----------
  function makeRecorder(simName) {
    const rows = [];
    const throttles = Object.create(null);
    const t0 = now();

    function log(type, obj) {
      rows.push({ t: Number((now() - t0).toFixed(3)), type, ...obj });
    }

    function throttle(key, hz, fn) {
      const minDt = 1 / hz;
      const t = now();
      const last = throttles[key] || 0;
      if (t - last >= minDt) {
        throttles[key] = t;
        fn();
      }
    }

    function logParam(name, value, extra) {
      log("param", { name, value, ...(extra || {}) });
    }

    function logPointer(op, x, y) {
      throttle("pointer", 20, () => log("pointer", { op, x: Math.round(x), y: Math.round(y) }));
    }

    function logMeasure(name, value) {
      throttle("measure:"+name, 2, () => log("measure", { name, value }));
    }

    function logMilestone(name, data) {
      log("milestone", { name, ...(data || {}) });
    }

    function logStateDigest(digest, extras) {
      throttle("state", 1, () => log("state", { digest, ...(extras || {}) }));
    }

    async function exportReel(metaExtras) {
      // Build $meta
      const meta = {
        spec: "saxlg/1",
        sim: simName,
        code_hash: "unknown", // optional: replace with a real hash at build time
        version: (window.APP_VERSION || "dev"),
        rng: "unknown",
        user_seed: (metaExtras && metaExtras.user_seed) || undefined,
        env: { ua: navigator.userAgent, tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" },
        deep_link: window.location.href
      };
      const event_root = await computeEventRoot(rows);
      const sigPack = await signMetaEd25519(meta, event_root);
      if (sigPack) Object.assign(meta, { event_root, ...sigPack });
      else Object.assign(meta, { event_root });

      downloadSAXLG(meta, rows, `${simName}.saxlg`);
    }

    return { rows, logParam, logPointer, logMeasure, logMilestone, logStateDigest, exportReel };
  }

  // ---------- State digest helpers per sim (cheap + sparse) ----------
  function digestPaintedSky(sim) {
    try {
      const step = 64;
      const uB = sampleFloat32(sim.u, step);
      const vB = sampleFloat32(sim.v, step);
      const dB = sampleFloat32(sim.d, step);
      return "ps-" + fnv1a32(uB) + fnv1a32(vB) + fnv1a32(dB);
    } catch { return "ps-NA"; }
  }

  function digestChargePainter(sim) {
    try {
      const step = 64;
      const pB = sampleFloat32(sim.phi, step);
      return "cp-" + fnv1a32(pB) + "-" + (sim.residual || 0).toExponential(2);
    } catch { return "cp-NA"; }
  }

  function digestResonant(sim) {
    try {
      const step = 64;
      const uB = sampleFloat32(sim.u_now, step);
      return "rc-" + fnv1a32(uB) + "-" + (sim.energyDrift || 0).toFixed(3);
    } catch { return "rc-NA"; }
  }

  function digestDrag(sim) {
    try {
      return "dr-" + (sim.lastRange || 0).toFixed(2);
    } catch { return "dr-NA"; }
  }

  // ---------- Auto-instrument each card ----------
  function attachToFluid() {
    const sim = window.paintedSkySim;
    const card = document.getElementById("fluid-dynamics");
    if (!sim || !card) return;
    const controls = card.querySelector(".physics-controls");
    const canvas = card.querySelector("#painted-sky-canvas");

    const R = makeRecorder("PaintedSky");
    // UI params
    const seedEl = controls.querySelector("#seed-input");
    const shearEl = controls.querySelector("#shear-slider");
    const vortEl  = controls.querySelector("#vort-slider");
    const brushEl = controls.querySelector("#brush-select");
    const palEl   = controls.querySelector("#palette-select");

    if (seedEl) seedEl.addEventListener("change", e => R.logParam("seed", Number(e.target.value)));
    if (shearEl) shearEl.addEventListener("input", e => R.logParam("shear", Number(e.target.value)));
    if (vortEl)  vortEl.addEventListener("input", e => R.logParam("vort_conf", Number(e.target.value)));
    if (brushEl) brushEl.addEventListener("change", e => R.logParam("brush", String(e.target.value)));
    if (palEl)   palEl.addEventListener("change", e => R.logParam("palette", String(e.target.value)));

    // Pointer
    if (canvas) {
      let down = false;
      canvas.addEventListener("pointerdown", (e) => { down = true; R.logPointer("down", e.offsetX, e.offsetY); });
      canvas.addEventListener("pointermove", (e) => { if (down) R.logPointer("drag", e.offsetX, e.offsetY); });
      window.addEventListener("pointerup",   (e) => { if (down) { R.logPointer("up", e.clientX, e.clientY); down = false; } });
    }

    // Measures / milestones
    setInterval(() => {
      if (typeof sim.cfl === "number") {
        R.logMeasure("cfl", Number(sim.cfl.toFixed(3)));
        if (sim.cfl > 1.0) R.logMilestone("cfl_cross", { cfl: Number(sim.cfl.toFixed(3)) });
      }
      R.logStateDigest(digestPaintedSky(sim));
    }, 1000);

    // Buttons
    addButtons(controls, () => R.exportReel({ user_seed: seedEl ? Number(seedEl.value) : undefined }));
  }

  function attachToCharge() {
    const sim = window.chargePainterSim;
    const card = document.getElementById("electrostatics");
    if (!sim || !card) return;
    const controls = card.querySelector(".physics-controls");
    const canvas = card.querySelector("#charge-painter-canvas");
    const R = makeRecorder("ChargePainter");

    // UI params
    const ids = [
      ["#cp-seed-input", "seed", v => Number(v)],
      ["#cp-method-select", "method", String],
      ["#cp-omega-slider", "omega", v => Number(v)],
      ["#cp-voltage-slider", "brushV", v => Number(v)],
      ["#cp-radius-slider", "brushR", v => Number(v)],
      ["#cp-iso-slider", "isoCount", v => Number(v)],
      ["#cp-chalk-checkbox", "chalk", v => !!v],
      ["#cp-sweeps-slider", "sweepsPerFrame", v => Number(v)],
    ];
    ids.forEach(([sel, name, map]) => {
      const el = controls.querySelector(sel);
      if (!el) return;
      const evt = (el.tagName === "INPUT" && el.type === "range") ? "input" : "change";
      el.addEventListener(evt, e => R.logParam(name, map(el.type==="checkbox" ? el.checked : el.value)));
    });

    // Pointer
    if (canvas) {
      let down = false;
      canvas.addEventListener("pointerdown", (e) => { down = true; R.logPointer("down", e.offsetX, e.offsetY); });
      canvas.addEventListener("pointermove", (e) => { if (down) R.logPointer("drag", e.offsetX, e.offsetY); });
      window.addEventListener("pointerup",   (e) => { if (down) { R.logPointer("up", e.clientX, e.clientY); down = false; } });
    }

    // Measures / milestones
    setInterval(() => {
      if (typeof sim.residual === "number") {
        R.logMeasure("residual", sim.residual);
        if (sim.residual < 1e-3) R.logMilestone("converged", { residual: sim.residual });
      }
      if (typeof sim.rate === "number") R.logMeasure("rate", sim.rate);
      R.logStateDigest(digestChargePainter(sim));
    }, 1000);

    addButtons(controls, () => R.exportReel({ user_seed: (controls.querySelector("#cp-seed-input")?.value|0) || undefined }));
  }

  function attachToResonant() {
    const sim = window.resonantCanvasSim;
    const card = document.getElementById("wave-physics");
    if (!sim || !card) return;
    const controls = card.querySelector(".physics-controls");
    const canvas = card.querySelector("#resonant-canvas-canvas");
    const R = makeRecorder("ResonantCanvas");

    // UI params
    const ids = [
      ["#rc-seed-input", "seed", v => Number(v)],
      ["#rc-geometry-select", "geometry", String],
      ["#rc-scheme-select", "scheme", String],
      ["#rc-sigma-slider", "sigmaTarget", v => Number(v)],
      ["#rc-damping-slider", "damping", v => Number(v)],
      ["#rc-bow-checkbox", "enableBow", v => !!v],
      ["#rc-frequency-slider", "bowFrequency", v => Number(v)],
    ];
    ids.forEach(([sel, name, map]) => {
      const el = controls.querySelector(sel);
      if (!el) return;
      const evt = (el.tagName === "INPUT" && el.type === "range") ? "input" : "change";
      el.addEventListener(evt, e => R.logParam(name, map(el.type==="checkbox" ? el.checked : el.value)));
    });

    if (canvas) {
      let down = false;
      canvas.addEventListener("pointerdown", (e) => { down = true; R.logPointer("down", e.offsetX, e.offsetY); });
      canvas.addEventListener("pointermove", (e) => { if (down) R.logPointer("drag", e.offsetX, e.offsetY); });
      window.addEventListener("pointerup",   (e) => { if (down) { R.logPointer("up", e.clientX, e.clientY); down = false; } });
    }

    setInterval(() => {
      if (typeof sim.sigmaLive === "number") R.logMeasure("sigma", Number(sim.sigmaLive.toFixed(3)));
      if (typeof sim.waveSpeed === "number") R.logMeasure("c", Number(sim.waveSpeed.toFixed(3)));
      if (typeof sim.energyDrift === "number") R.logMeasure("energyDrift", Number(sim.energyDrift));
      R.logStateDigest(digestResonant(sim));
    }, 1000);

    addButtons(controls, () => R.exportReel({ user_seed: (controls.querySelector("#rc-seed-input")?.value|0) || undefined }));
  }

  function attachToDrag() {
    const sim = window.dragRangefinderSim;
    const card = document.getElementById("drag-rangefinder");
    if (!sim || !card) return;
    const controls = card.querySelector(".physics-controls");
    const canvas = card.querySelector("#drag-rangefinder-canvas");
    const R = makeRecorder("DragRangefinder");

    // Scan all dr- controls
    controls.querySelectorAll("[id^='dr-']").forEach(el => {
      const id = el.id;
      const name = id.replace(/^dr-/, "");
      const map = (el.type === "checkbox") ? (v)=>!!v : (v)=>Number.isFinite(Number(v)) ? Number(v) : String(v);
      const evt = (el.tagName === "INPUT" && el.type === "range") ? "input" : "change";
      el.addEventListener(evt, e => R.logParam(name, map(el.type==="checkbox" ? el.checked : el.value)));
    });

    if (canvas) {
      let down = false;
      canvas.addEventListener("pointerdown", (e) => { down = true; R.logPointer("down", e.offsetX, e.offsetY); });
      canvas.addEventListener("pointermove", (e) => { if (down) R.logPointer("drag", e.offsetX, e.offsetY); });
      window.addEventListener("pointerup",   (e) => { if (down) { R.logPointer("up", e.clientX, e.clientY); down = false; } });
    }

    // Fire button (important event)
    const fireBtn = controls.querySelector("#dr-fire-button");
    if (fireBtn) fireBtn.addEventListener("click", () => R.logMilestone("fire"));

    setInterval(() => {
      R.logStateDigest(digestDrag(sim));
    }, 1000);

    addButtons(controls, () => R.exportReel({}));
  }

  function addButtons(controls, onExport) {
    if (!controls) return;
    // Create a row container
    const row = document.createElement("div");
    row.className = "control-group";
    const exportBtn = document.createElement("button");
    exportBtn.textContent = "Export Reel (.saxlg)";
    exportBtn.title = "Download a signed, tamper-evident ledger of this session";
    exportBtn.addEventListener("click", onExport);

    const verifyBtn = document.createElement("button");
    verifyBtn.textContent = "Verify Reel";
    verifyBtn.title = "Open verifier to check hash-chain/signature";
    verifyBtn.style.marginTop = "0.5rem";
    verifyBtn.addEventListener("click", () => {
      window.open("verify.html", "_blank");
    });

    row.appendChild(exportBtn);
    const row2 = document.createElement("div");
    row2.className = "control-group";
    row2.appendChild(verifyBtn);

    controls.appendChild(row);
    controls.appendChild(row2);
  }

  // Defer attach until DOM + sims exist
  window.addEventListener("DOMContentLoaded", () => {
    // Give the page a tick to construct sims
    setTimeout(() => {
      try { attachToFluid(); } catch (e) { console.warn("Recorder: fluid attach skipped", e); }
      try { attachToCharge(); } catch (e) { console.warn("Recorder: charge attach skipped", e); }
      try { attachToResonant(); } catch (e) { console.warn("Recorder: wave attach skipped", e); }
      try { attachToDrag(); } catch (e) { console.warn("Recorder: drag attach skipped", e); }
    }, 50);
  });
})();
