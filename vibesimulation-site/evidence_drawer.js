/*! Evidence Drawer v2 — VibeSimulation (site-wide)
 * Drop this after recorder.js. It injects a floating "Evidence" button.
 * Features:
 *  - Drag/drop .saxlg to inspect: meta, KPIs, charts, digest deltas, stability flags.
 *  - Timeline scrubber.
 *  - Spot-check replayer: applies param & pointer events up to N checkpoints and compares digests.
 *  - Accreditation mode: run K fixed replicates, emit one .saxlg with $meta.batch=[...] and per-run roots.
 *
 * Notes:
 *  - Works with classic pages (cards with .physics-controls) and React routes as long as the sim DOM/IDs match.
 *  - For spot-check, we drive the *live* sim's DOM (controls + canvas) then restore values afterward.
 *  - If a sim does not expose the same control IDs, spot-check will declare "unavailable".
 */
(function(){
  // ---------- DOM helpers ----------
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const enc = new TextEncoder();
  function h(tag, attrs={}, ...kids){ const el=document.createElement(tag); for(const[k,v] of Object.entries(attrs||{})){ if(k==="style"&&typeof v==="object"){ Object.assign(el.style,v); } else if(k==="class") el.className=v; else el.setAttribute(k,v); } kids.flat().forEach(k=>{ if(k==null) return; if(typeof k==="string") el.appendChild(document.createTextNode(k)); else el.appendChild(k); }); return el; }
  function clamp(x,a,b){ return Math.max(a, Math.min(b,x)); }

  // ---------- Parsing & canonicalization (matches recorder exactly) ----------
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

  async function computeEventRoot(rows){
    let prev = new Uint8Array(32);
    for(const ev of rows){
      const s = canonicalString(ev);
      const data = concatBytes(prev, enc.encode(s));
      prev = new Uint8Array(await crypto.subtle.digest("SHA-256", data));
    }
    return "sha256-" + hex(prev);
  }

  // ---------- Digest helpers (same logic as recorder) ----------
  function fnv1a32(bytes){ let h=0x811c9dc5>>>0; for(let i=0;i<bytes.length;i++){ h^=bytes[i]; h=Math.imul(h,0x01000193)>>>0; } return ("00000000"+h.toString(16)).slice(-8); }
  function sampleFloat32(arr, step){ const view=new DataView(new ArrayBuffer(4)); const out=new Uint8Array(Math.ceil(arr.length/step)*4); let j=0; for(let i=0;i<arr.length;i+=step){ view.setFloat32(0, arr[i]||0, true); out.set(new Uint8Array(view.buffer), j); j+=4; } return out; }

  function digestPaintedSky(sim){ try{ const s=64; return "ps-"+fnv1a32(sampleFloat32(sim.u,s))+fnv1a32(sampleFloat32(sim.v,s))+fnv1a32(sampleFloat32(sim.d,s)); }catch{return "ps-NA";} }
  function digestChargePainter(sim){ try{ const s=64; return "cp-"+fnv1a32(sampleFloat32(sim.phi,s))+"-"+(sim.residual||0).toExponential(2); }catch{return "cp-NA";} }
  function digestResonant(sim){ try{ const s=64; return "rc-"+fnv1a32(sampleFloat32(sim.u_now,s))+"-"+(sim.energyDrift||0).toFixed(3); }catch{return "rc-NA";} }
  function digestDrag(sim){ try{ return "dr-"+(sim.lastRange||0).toFixed(2); }catch{return "dr-NA";} }

  // ---------- Sim UI maps (for spot-check replayer) ----------
  const SIM_UI = {
    "PaintedSky": {
      canvas: "#painted-sky-canvas",
      seed: "#seed-input",
      params: [
        ["#shear-slider", "shear"],
        ["#vort-slider", "vort_conf"],
        ["#brush-select", "brush"],
        ["#palette-select", "palette"]
      ]
    },
    "ChargePainter": {
      canvas: "#charge-painter-canvas",
      seed: "#cp-seed-input",
      params: [
        ["#cp-method-select", "method"],
        ["#cp-omega-slider", "omega"],
        ["#cp-voltage-slider", "brushV"],
        ["#cp-radius-slider", "brushR"],
        ["#cp-iso-slider", "isoCount"],
        ["#cp-chalk-checkbox", "chalk"],
        ["#cp-sweeps-slider", "sweepsPerFrame"]
      ]
    },
    "ResonantCanvas": {
      canvas: "#resonant-canvas-canvas",
      seed: "#rc-seed-input",
      params: [
        ["#rc-geometry-select", "geometry"],
        ["#rc-scheme-select", "scheme"],
        ["#rc-sigma-slider", "sigmaTarget"],
        ["#rc-damping-slider", "damping"],
        ["#rc-bow-checkbox", "enableBow"],
        ["#rc-frequency-slider", "bowFrequency"]
      ]
    },
    "DragRangefinder": {
      canvas: "#drag-rangefinder-canvas",
      params: Array.from({length:20}, (_,i)=> [`#dr-${String(i+1).padStart(2,"0")}`, `param${i+1}`]) // Generic for now
    }
  };

  // ---------- Chart helpers ----------
  function lineChart(canvas, data, color="#60a5fa", minY=null, maxY=null){
    const ctx=canvas.getContext("2d");
    const w=canvas.width, h=canvas.height;
    ctx.clearRect(0,0,w,h);
    if(!data.length) return;

    const ys = data.map(d=>d.y);
    const min=minY===null ? Math.min(...ys) : minY;
    const max=maxY===null ? Math.max(...ys) : maxY;
    const range = max-min || 1;

    ctx.strokeStyle=color;
    ctx.lineWidth=2;
    ctx.beginPath();
    data.forEach((d,i)=>{
      const x = (d.x / data[data.length-1].x) * w;
      const y = h - ((d.y - min) / range) * h;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.stroke();
  }

  // ---------- Drawer UI ----------
  let drawer = null;
  let currentReel = null;
  let timelinePos = 0;

  function createDrawer(){
    if(drawer) return drawer;

    const overlay = h("div", {
      style: {
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(0,0,0,0.5)", zIndex: 10000, display: "none",
        alignItems: "center", justifyContent: "center"
      }
    });

    const panel = h("div", {
      style: {
        background: "#1a1a2e", border: "1px solid #60a5fa", borderRadius: "12px",
        width: "90vw", maxWidth: "800px", height: "80vh", overflow: "hidden",
        display: "flex", flexDirection: "column", color: "white", fontFamily: "system-ui, sans-serif"
      }
    });

    const header = h("div", {
      style: { padding: "16px", borderBottom: "1px solid #60a5fa", display: "flex", alignItems: "center", justifyContent: "space-between" }
    }, [
      h("h2", {style: {margin: 0}}, "Evidence Drawer"),
      h("button", {
        onclick: ()=> hideDrawer(),
        style: { background: "none", border: "none", color: "white", fontSize: "24px", cursor: "pointer" }
      }, "×")
    ]);

    const content = h("div", {
      style: { flex: 1, overflow: "auto", padding: "16px" }
    });

    const footer = h("div", {
      style: { padding: "16px", borderTop: "1px solid #60a5fa", display: "flex", gap: "8px", alignItems: "center" }
    }, [
      h("input", {
        type: "file", accept: ".saxlg", multiple: false,
        onchange: (e)=> loadReel(e.target.files[0]),
        style: { flex: 1 }
      }),
      h("button", {
        onclick: ()=> spotCheck(),
        style: { background: "#60a5fa", border: "none", padding: "8px 16px", borderRadius: "4px", color: "white", cursor: "pointer" }
      }, "Spot Check"),
      h("button", {
        onclick: ()=> accreditationMode(),
        style: { background: "#f59e0b", border: "none", padding: "8px 16px", borderRadius: "4px", color: "white", cursor: "pointer" }
      }, "Accreditation")
    ]);

    panel.append(header, content, footer);
    overlay.append(panel);
    document.body.append(overlay);

    drawer = { overlay, panel, content, footer };
    return drawer;
  }

  function showDrawer(){
    const d = createDrawer();
    d.overlay.style.display = "flex";
  }

  function hideDrawer(){
    if(drawer) drawer.overlay.style.display = "none";
  }

  // ---------- Reel loading and display ----------
  async function loadReel(file){
    try {
      const text = await file.text();
      const lines = text.trim().split(/\r?\n/);
      if(!lines.length) throw new Error("Empty file");

      const metaLine = lines[0];
      const meta = JSON.parse(metaLine);
      const reelMeta = meta.$meta || meta;

      const rows = [];
      for(let i=1; i<lines.length; i++){
        const line = lines[i].trim();
        if(!line) continue;
        rows.push(JSON.parse(line));
      }

      currentReel = { meta: reelMeta, rows, fileName: file.name };

      await displayReel();

    } catch(err) {
      alert("Error loading reel: " + err.message);
    }
  }

  async function displayReel(){
    if(!currentReel) return;

    const { meta, rows } = currentReel;
    const content = drawer.content;
    content.innerHTML = "";

    // Meta section
    const metaSection = h("div", {style: {marginBottom: "20px"}}, [
      h("h3", {}, "Meta"),
      h("pre", {style: {background: "#0f0f23", padding: "8px", borderRadius: "4px", fontSize: "12px", overflow: "auto"}}, JSON.stringify(meta, null, 2))
    ]);

    // KPIs section
    const kpis = computeKPIs(rows);
    const kpiSection = h("div", {style: {marginBottom: "20px"}}, [
      h("h3", {}, "KPIs"),
      h("div", {style: {display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "8px"}}, [
        h("div", {}, `Events: ${rows.length}`),
        h("div", {}, `Duration: ${kpis.duration.toFixed(1)}s`),
        h("div", {}, `Max CFL: ${kpis.maxCfl.toFixed(3)}`),
        h("div", {}, `Min Residual: ${kpis.minResidual.toExponential(2)}`),
        h("div", {}, `Max Energy Drift: ${kpis.maxEnergyDrift.toFixed(3)}`),
        h("div", {}, `Stability Flags: ${kpis.stabilityFlags}`)
      ])
    ]);

    // Charts section
    const chartsSection = h("div", {style: {marginBottom: "20px"}}, [
      h("h3", {}, "Charts"),
      h("div", {style: {display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px"}}, [
        createChart("CFL", kpis.cflData),
        createChart("Residual", kpis.residualData),
        createChart("Energy Drift", kpis.energyDriftData)
      ])
    ]);

    // Timeline scrubber
    const timelineSection = h("div", {style: {marginBottom: "20px"}}, [
      h("h3", {}, "Timeline"),
      h("input", {
        type: "range", min: 0, max: rows.length-1, value: timelinePos,
        oninput: (e)=> setTimelinePos(parseInt(e.target.value)),
        style: {width: "100%"}
      }),
      h("div", {id: "timeline-preview"}, "Select a position...")
    ]);

    content.append(metaSection, kpiSection, chartsSection, timelineSection);
  }

  function createChart(title, data){
    const canvas = h("canvas", {width: 200, height: 100, style: {border: "1px solid #60a5fa", borderRadius: "4px"}});
    if(data.length) lineChart(canvas, data);
    return h("div", {}, [h("div", {style: {textAlign: "center", marginBottom: "4px"}}, title), canvas]);
  }

  function computeKPIs(rows){
    let maxCfl = 0, minResidual = Infinity, maxEnergyDrift = 0;
    let stabilityFlags = 0;
    const cflData = [], residualData = [], energyDriftData = [];

    rows.forEach((ev, i) => {
      if(ev.type === "measure"){
        if(ev.name === "cfl") {
          maxCfl = Math.max(maxCfl, ev.value);
          cflData.push({x: ev.t, y: ev.value});
          if(ev.value > 1.0) stabilityFlags++;
        }
        if(ev.name === "residual") {
          minResidual = Math.min(minResidual, ev.value);
          residualData.push({x: ev.t, y: ev.value});
        }
        if(ev.name === "energyDrift") {
          maxEnergyDrift = Math.max(maxEnergyDrift, Math.abs(ev.value));
          energyDriftData.push({x: ev.t, y: Math.abs(ev.value)});
        }
      }
    });

    return {
      duration: rows.length ? rows[rows.length-1].t : 0,
      maxCfl, minResidual: minResidual === Infinity ? 0 : minResidual, maxEnergyDrift,
      stabilityFlags,
      cflData, residualData, energyDriftData
    };
  }

  function setTimelinePos(pos){
    timelinePos = pos;
    if(!currentReel) return;

    const ev = currentReel.rows[pos];
    const preview = drawer.content.querySelector("#timeline-preview");
    if(preview) preview.textContent = `Event ${pos}: ${JSON.stringify(ev)}`;
  }

  // ---------- Spot-check replayer ----------
  async function spotCheck(){
    if(!currentReel) { alert("Load a reel first"); return; }

    const simName = currentReel.meta.sim;
    const ui = SIM_UI[simName];
    if(!ui) { alert("Spot-check not available for this sim"); return; }

    const checkpoints = 5;
    const step = Math.floor(currentReel.rows.length / checkpoints);
    let results = [];

    // Save original values
    const originals = {};
    if(ui.seed) originals.seed = $(ui.seed)?.value;
    ui.params.forEach(([sel]) => {
      const el = $(sel);
      if(el) originals[sel] = el.type === "checkbox" ? el.checked : el.value;
    });

    try {
      for(let i=0; i<checkpoints; i++){
        const checkpoint = Math.min(i * step, currentReel.rows.length - 1);
        await applyEventsUpTo(checkpoint);

        // Wait a bit for sim to settle
        await new Promise(r => setTimeout(r, 100));

        // Get current digest
        const expected = getDigestFromEvent(currentReel.rows[checkpoint]);
        const actual = getCurrentDigest(simName);

        results.push({
          checkpoint: i+1,
          time: currentReel.rows[checkpoint].t,
          expected,
          actual,
          match: expected === actual
        });

        if(!results[results.length-1].match) break;
      }

      // Restore originals
      if(ui.seed) $(ui.seed).value = originals.seed;
      ui.params.forEach(([sel]) => {
        const el = $(sel);
        if(el) {
          if(el.type === "checkbox") el.checked = originals[sel];
          else el.value = originals[sel];
        }
      });

      displaySpotCheckResults(results);

    } catch(err) {
      alert("Spot-check error: " + err.message);
    }
  }

  function getDigestFromEvent(ev){
    if(ev.type === "state") return ev.digest;
    return null;
  }

  function getCurrentDigest(simName){
    const simMap = {
      "PaintedSky": window.paintedSkySim,
      "ChargePainter": window.chargePainterSim,
      "ResonantCanvas": window.resonantCanvasSim,
      "DragRangefinder": window.dragRangefinderSim
    };

    const sim = simMap[simName];
    if(!sim) return "sim-NA";

    const digestMap = {
      "PaintedSky": digestPaintedSky,
      "ChargePainter": digestChargePainter,
      "ResonantCanvas": digestResonant,
      "DragRangefinder": digestDrag
    };

    const digestFn = digestMap[simName];
    return digestFn ? digestFn(sim) : "digest-NA";
  }

  async function applyEventsUpTo(checkpoint){
    const events = currentReel.rows.slice(0, checkpoint + 1);

    for(const ev of events){
      if(ev.type === "param") await applyParamEvent(ev);
      else if(ev.type === "pointer") await applyPointerEvent(ev);
      await new Promise(r => setTimeout(r, 1)); // Tiny delay to avoid jank
    }
  }

  async function applyParamEvent(ev){
    const simName = currentReel.meta.sim;
    const ui = SIM_UI[simName];
    if(!ui) return;

    // Find the control for this param
    const paramEntry = ui.params.find(([sel, name]) => name === ev.name);
    if(!paramEntry) return;

    const [sel] = paramEntry;
    const el = $(sel);
    if(!el) return;

    if(el.type === "checkbox") el.checked = ev.value;
    else el.value = ev.value;

    // Trigger change event
    el.dispatchEvent(new Event('change', {bubbles: true}));
    el.dispatchEvent(new Event('input', {bubbles: true}));
  }

  async function applyPointerEvent(ev){
    const simName = currentReel.meta.sim;
    const ui = SIM_UI[simName];
    if(!ui) return;

    const canvas = $(ui.canvas);
    if(!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = rect.left + ev.x;
    const y = rect.top + ev.y;

    if(ev.op === "down") {
      canvas.dispatchEvent(new MouseEvent('mousedown', {clientX: x, clientY: y}));
    } else if(ev.op === "drag") {
      canvas.dispatchEvent(new MouseEvent('mousemove', {clientX: x, clientY: y}));
    } else if(ev.op === "up") {
      canvas.dispatchEvent(new MouseEvent('mouseup', {clientX: x, clientY: y}));
    }
  }

  function displaySpotCheckResults(results){
    const content = drawer.content;

    const resultsDiv = h("div", {style: {marginTop: "20px", padding: "16px", background: "#0f0f23", borderRadius: "8px"}}, [
      h("h3", {}, "Spot Check Results"),
      ...results.map(r => h("div", {
        style: {marginBottom: "8px", padding: "8px", borderRadius: "4px", background: r.match ? "#22c55e20" : "#ef444420", border: `1px solid ${r.match ? "#22c55e" : "#ef4444"}`}
      }, [
        `Checkpoint ${r.checkpoint} (${r.time.toFixed(1)}s): `,
        r.match ? h("span", {style: {color: "#22c55e"}}, "✓ Verified") : h("span", {style: {color: "#ef4444"}}, `✗ Mismatch: ${r.expected} ≠ ${r.actual}`)
      ]))
    ]);

    // Remove old results if any
    const oldResults = content.querySelector("#spot-check-results");
    if(oldResults) oldResults.remove();

    resultsDiv.id = "spot-check-results";
    content.append(resultsDiv);
  }

  // ---------- Accreditation mode ----------
  async function accreditationMode(){
    const k = parseInt(prompt("Number of replicates (K):", "3"));
    if(!k || k < 1) return;

    const baseSeed = parseInt(prompt("Base seed:", "12345"));
    if(!baseSeed) return;

    const batch = [];
    const allRows = [];

    // Run K replicates
    for(let i=0; i<k; i++){
      const seed = baseSeed + i;
      console.log(`Running replicate ${i+1}/${k} with seed ${seed}`);

      // Reset sim to seed
      const simName = getCurrentSimName();
      if(simName) await resetSimToSeed(simName, seed);

      // Run for a bit and collect events
      const replicateRows = await runReplicate(simName, seed);
      const eventRoot = await computeEventRoot(replicateRows);

      batch.push({ seed, event_root: eventRoot });
      allRows.push(...replicateRows.map(row => ({...row, replicate: i})));
    }

    // Create batch meta
    const batchMeta = {
      spec: "saxlg/1-batch",
      sim: getCurrentSimName(),
      code_hash: window.APP_CODE_HASH || "unknown",
      version: window.APP_VERSION || "dev",
      batch
    };

    // Download
    const lines = [JSON.stringify({$meta: batchMeta}), ...allRows.map(r => JSON.stringify(r))];
    const blob = new Blob([lines.join("\n")], {type: "application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${getCurrentSimName() || "Sim"}.batch.saxlg`;
    a.click();
    URL.revokeObjectURL(a.href);

    alert(`Accreditation complete! Downloaded ${k} replicates.`);
  }

  function getCurrentSimName(){
    // Try to detect current sim from visible cards
    const cards = $$('.physics-card');
    for(const card of cards){
      // Check if card is visible (not hidden)
      if(card.style.display === 'none') continue;
      const id = card.id;
      if(id === 'fluid-dynamics') return 'PaintedSky';
      if(id === 'electrostatics') return 'ChargePainter';
      if(id === 'wave-physics') return 'ResonantCanvas';
      if(id === 'drag-rangefinder') return 'DragRangefinder';
    }
    return null; // No current sim found
  }

  async function resetSimToSeed(simName, seed){
    const ui = SIM_UI[simName];
    if(!ui || !ui.seed) return;

    const seedEl = $(ui.seed);
    if(seedEl) {
      seedEl.value = seed;
      seedEl.dispatchEvent(new Event('change', {bubbles: true}));
    }

    // Wait for sim to reset
    await new Promise(r => setTimeout(r, 500));
  }

  async function runReplicate(simName, seed){
    // Run the actual simulation for a short period and collect events
    const rows = [];
    const startTime = performance.now() / 1000;

    // Get the global recorder instance
    const recorder = window.reasoningReelsRecorder;
    if(!recorder) {
      console.warn("No recorder available for replicate");
      return rows;
    }

    // Clear any existing events
    recorder.rows = [];
    recorder.eventCount = 0;

    // Reset simulation to the given seed
    await resetSimToSeed(simName, seed);

    // Wait for simulation to initialize
    await new Promise(r => setTimeout(r, 1000));

    // Run simulation for 10 seconds, collecting events
    const duration = 10000; // 10 seconds
    const start = performance.now();

    while(performance.now() - start < duration) {
      // Let the simulation run naturally
      await new Promise(r => setTimeout(r, 100));

      // Periodically log state (every second)
      if(Math.floor((performance.now() - start) / 1000) > rows.length) {
        const digest = getCurrentDigest(simName);
        if(digest) {
          rows.push({
            t: startTime + (performance.now() - start) / 1000,
            type: "state",
            digest: digest
          });
        }
      }
    }

    // Add final state
    const finalDigest = getCurrentDigest(simName);
    if(finalDigest) {
      rows.push({
        t: startTime + duration / 1000,
        type: "state",
        digest: finalDigest
      });
    }

    return rows;
  }

  // ---------- Floating button ----------
  function createFloatingButton(){
    const btn = h("button", {
      style: {
        position: "fixed", bottom: "20px", right: "20px",
        background: "#60a5fa", border: "none", borderRadius: "50%",
        width: "60px", height: "60px", color: "white",
        fontSize: "24px", cursor: "pointer", zIndex: 1000,
        boxShadow: "0 4px 12px rgba(96, 165, 250, 0.3)",
        transition: "all 0.2s"
      }
    }, "🧪");

    // Add event listeners properly
    btn.addEventListener('mouseover', function(e) {
      e.target.style.transform = "scale(1.1)";
    });
    btn.addEventListener('mouseout', function(e) {
      e.target.style.transform = "scale(1)";
    });
    btn.addEventListener('click', function() {
      showDrawer();
    });

    document.body.append(btn);
  }

  // ---------- Init ----------
  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFloatingButton);
  } else {
    createFloatingButton();
  }

})();
