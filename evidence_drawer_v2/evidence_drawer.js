
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

  // ---------- Parsing & canonicalization ----------
  function canonicalize(obj){
    if (obj===null || typeof obj!=="object") return obj;
    if (Array.isArray(obj)) return obj.map(canonicalize);
    const out={}; Object.keys(obj).sort().forEach(k=> out[k]=canonicalize(obj[k])); return out;
  }
  function canonicalString(obj){ return JSON.stringify(canonicalize(obj)); }

  async function computeEventRoot(rows){
    let prev = new Uint8Array(32);
    for(const ev of rows){
      const s = canonicalString(ev);
      const data = new Uint8Array(prev.length + (new TextEncoder()).encode(s).length);
      data.set(prev,0); data.set((new TextEncoder()).encode(s), prev.length);
      prev = new Uint8Array(await crypto.subtle.digest("SHA-256", data));
    }
    return "sha256-"+[...prev].map(b=>b.toString(16).padStart(2,"0")).join("");
  }

  // ---------- Digest helpers (same logic as recorder) ----------
  function fnv1a32(bytes){ let h=0x811c9dc5>>>0; for(let i=0;i<bytes.length;i++){ h^=bytes[i]; h=Math.imul(h,0x01000193)>>>0; } return ("00000000"+h.toString(16)).slice(-8); }
  function sampleFloat32(arr, step){ const view=new DataView(new ArrayBuffer(4)); const out=new Uint8Array(Math.ceil(arr.length/step)*4); let j=0; for(let i=0;i<arr.length;i+=step){ view.setFloat32(0, arr[i]||0, true); out.set(new Uint8Array(view.buffer), j); j+=4; } return out; }

  function digestPaintedSky(sim){ try{ const s=64; return "ps-"+fnv1a32(sampleFloat32(sim.u,s))+fnv1a32(sampleFloat32(sim.v,s))+fnv1a32(sampleFloat32(sim.d,s)); }catch{return "ps-NA";} }
  function digestChargePainter(sim){ try{ const s=64; return "cp-"+fnv1a32(sampleFloat32(sim.phi,s))+"-"+(sim.residual||0).toExponential(2); }catch{return "cp-NA";} }
  function digestResonant(sim){ try{ const s=64; return "rc-"+fnv1a32(sampleFloat32(sim.u_now,s))+"-"+(sim.energyDrift||0).toFixed(3); }catch{return "rc-NA";} }
  function digestDrag(sim){ try{ return "dr-"+(sim.lastRange||0).toFixed(2); }catch{return "dr-NA";} }

  const DIGEST_BY_SIM = {
    "PaintedSky": (w)=>digestPaintedSky(w.paintedSkySim),
    "ChargePainter": (w)=>digestChargePainter(w.chargePainterSim),
    "ResonantCanvas": (w)=>digestResonant(w.resonantCanvasSim),
    "DragRangefinder": (w)=>digestDrag(w.dragRangefinderSim),
  };

  // Map sim name -> {cardId, canvasId, paramToSelector(name)->selector}
  const SIM_UI = {
    PaintedSky: {
      card: "#fluid-dynamics",
      canvas: "#painted-sky-canvas",
      paramSel(name){
        const map = { seed:"#seed-input", shear:"#shear-slider", vort_conf:"#vort-slider", brush:"#brush-select", palette:"#palette-select" };
        return map[name] || null;
      }
    },
    ChargePainter: {
      card: "#electrostatics",
      canvas: "#charge-painter-canvas",
      paramSel(name){ return "#cp-"+({seed:"seed-input",method:"method-select",omega:"omega-slider",brushV:"voltage-slider",brushR:"radius-slider",isoCount:"iso-slider",chalk:"chalk-checkbox",sweepsPerFrame:"sweeps-slider"}[name]||""); }
    },
    ResonantCanvas: {
      card: "#wave-physics",
      canvas: "#resonant-canvas-canvas",
      paramSel(name){ return "#rc-"+({seed:"seed-input",geometry:"geometry-select",scheme:"scheme-select",sigmaTarget:"sigma-slider",damping:"damping-slider",enableBow:"bow-checkbox",bowFrequency:"frequency-slider"}[name]||""); }
    },
    DragRangefinder: {
      card: "#drag-rangefinder",
      canvas: "#drag-rangefinder-canvas",
      paramSel(name){ return "#dr-"+name; }
    },
  };

  // ---------- Charts (tiny canvas line) ----------
  function lineChart(canvas, xs, ys){
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0,0,w,h);
    ctx.save();
    ctx.translate(40, 10); // left padding
    const W = w-50, H = h-30;
    ctx.fillStyle = "#0f1720"; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle = "#223043"; ctx.lineWidth = 1;
    for(let i=0;i<=4;i++){ const y=i*(H/4); ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
    if (xs.length && ys.length) {
      const xmin = xs[0], xmax = xs[xs.length-1];
      let ymin = Math.min(...ys.filter(v=>Number.isFinite(v))); if (!Number.isFinite(ymin)) ymin = 0;
      let ymax = Math.max(...ys.filter(v=>Number.isFinite(v))); if (!Number.isFinite(ymax)) ymax = 1;
      if (ymax===ymin){ ymax += 1e-6; ymin -= 1e-6; }
      ctx.strokeStyle = "#6aa9ff"; ctx.lineWidth = 2; ctx.beginPath();
      for (let i=0;i<xs.length;i++) {
        const x = (xs[i]-xmin)/(xmax-xmin||1)*W;
        const y = H - (ys[i]-ymin)/(ymax-ymin||1)*H;
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
      ctx.fillStyle="#9ab"; ctx.font="11px ui-monospace,monospace";
      ctx.fillText(String(xmin.toFixed(1))+"s", 0, H+12);
      ctx.fillText(String(xmax.toFixed(1))+"s", W-40, H+12);
      ctx.fillText(String(ymax.toPrecision(3)), -36, 8);
      ctx.fillText(String(ymin.toPrecision(3)), -36, H-2);
    }
    ctx.restore();
  }

  // ---------- Drawer UI ----------
  const drawer = h("div", {style:{
    position:"fixed", top:"0", right:"0", width:"440px", height:"100vh", background:"#0b0f14", color:"#e6edf3",
    borderLeft:"1px solid #1b2734", transform:"translateX(100%)", transition:"transform .25s ease", zIndex:"9999",
    display:"flex", flexDirection:"column"
  }});
  const header = h("div", {style:{padding:"10px 12px", background:"#0f1720", borderBottom:"1px solid #1b2734", display:"flex", alignItems:"center", gap:"8px"}},
    h("strong", null, "Evidence Drawer"),
    h("span", {style:{opacity:.7, fontSize:"12px"}}, "• V2"),
    h("div", {style:{marginLeft:"auto"}},
      h("button", {id:"evd-close", style:{background:"#243447", color:"#e6edf3", border:"1px solid #2f4358", borderRadius:"8px", padding:"6px 10px"}}, "Close")
    )
  );
  const body = h("div", {style:{flex:"1 1 auto", overflow:"auto", padding:"10px 12px", display:"grid", gap:"10px"}});
  drawer.appendChild(header); drawer.appendChild(body);
  document.body.appendChild(drawer);

  const toggleBtn = h("button", {style:{
    position:"fixed", right:"12px", bottom:"12px", padding:"10px 14px", borderRadius:"10px",
    background:"#243447", color:"#e6edf3", border:"1px solid #2f4358", zIndex:"9999"
  }}, "Evidence");
  toggleBtn.addEventListener("click", ()=>{ drawer.style.transform = "translateX(0)"; });
  $("#evd-close", drawer).addEventListener("click", ()=>{ drawer.style.transform = "translateX(100%)"; });
  document.body.appendChild(toggleBtn);

  // Sections
  const drop = h("div", {style:{padding:"10px", background:"#0f1720", border:"1px solid #203042", borderRadius:"12px"}},
    h("div", {style:{fontSize:"13px", opacity:.8, marginBottom:"6px"}}, "Drop a .saxlg here or choose a file"),
    h("input", {type:"file", id:"evd-file", accept:".saxlg,application/json,text/plain"})
  );
  const metaBox = h("div", {style:{padding:"10px", background:"#0f1720", border:"1px solid #203042", borderRadius:"12px"}},
    h("div", {style:{fontSize:"13px", opacity:.8, marginBottom:"6px"}}, "Meta"),
    h("pre", {id:"evd-meta", style:{whiteSpace:"pre-wrap", wordBreak:"break-word", font:"12px ui-monospace,monospace", margin:0}})
  );
  const kpiBox = h("div", {style:{padding:"10px", background:"#0f1720", border:"1px solid #203042", borderRadius:"12px"}},
    h("div", {style:{fontSize:"13px", opacity:.8, marginBottom:"6px"}}, "KPIs"),
    h("div", {id:"evd-kpi", style:{font:"12px ui-monospace,monospace"}})
  );
  const charts = h("div", {style:{padding:"10px", background:"#0f1720", border:"1px solid #203042", borderRadius:"12px"}},
    h("div", {style:{fontSize:"13px", opacity:.8, marginBottom:"6px"}}, "Charts"),
    h("div", {style:{display:"grid", gap:"8px"}},
      h("canvas", {id:"chart-cfl", width:360, height:120, style:{width:"100%"}}),
      h("canvas", {id:"chart-residual", width:360, height:120, style:{width:"100%"}}),
      h("canvas", {id:"chart-energy", width:360, height:120, style:{width:"100%"}}),
    )
  );
  const timeline = h("div", {style:{padding:"10px", background:"#0f1720", border:"1px solid #203042", borderRadius:"12px"}},
    h("div", {style:{fontSize:"13px", opacity:.8, marginBottom:"6px"}}, "Timeline"),
    h("input", {type:"range", id:"evd-scrub", min:0, max:100, value:0, style:{width:"100%"}}),
    h("pre", {id:"evd-event", style:{whiteSpace:"pre-wrap", wordBreak:"break-word", font:"12px ui-monospace,monospace", margin:0, marginTop:"6px"}})
  );
  const spot = h("div", {style:{padding:"10px", background:"#0f1720", border:"1px solid #203042", borderRadius:"12px"}},
    h("div", {style:{display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px"}},
      h("div", {style:{fontSize:"13px", opacity:.8}}, "Spot-check replayer"),
      h("span", {id:"evd-spot-status", style:{marginLeft:"auto", fontSize:"12px", opacity:.75}})
    ),
    h("div", null,
      h("label", null, "Checkpoints (N): "),
      h("input", {type:"number", id:"evd-N", value:5, min:1, max:20, style:{width:"64px"}}),
      h("button", {id:"evd-run", style:{marginLeft:"8px", background:"#2d4a63", color:"#e6edf3", border:"1px solid #2f4358", borderRadius:"6px", padding:"6px 10px"}}, "Run"),
      h("div", {id:"evd-spot-log", style:{font:"12px ui-monospace,monospace", marginTop:"8px", whiteSpace:"pre-wrap"}})
    )
  );
  const accred = h("div", {style:{padding:"10px", background:"#0f1720", border:"1px solid #203042", borderRadius:"12px"}},
    h("div", {style:{display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px"}},
      h("div", {style:{fontSize:"13px", opacity:.8}}, "Accreditation mode (batch)"),
    ),
    h("div", null,
      h("label", null, "Replicates K: "),
      h("input", {type:"number", id:"evd-K", value:5, min:2, max:50, style:{width:"64px"}}),
      h("label", {style:{marginLeft:"12px"}}, "Base seed: "),
      h("input", {type:"number", id:"evd-base-seed", value:20250827, style:{width:"120px"}}),
      h("button", {id:"evd-batch", style:{marginLeft:"8px", background:"#2d4a63", color:"#e6edf3", border:"1px solid #2f4358", borderRadius:"6px", padding:"6px 10px"}}, "Run & Download"),
      h("div", {id:"evd-batch-log", style:{font:"12px ui-monospace,monospace", marginTop:"8px", whiteSpace:"pre-wrap"}})
    )
  );

  body.append(drop, metaBox, kpiBox, charts, timeline, spot, accred);

  // ---------- State ----------
  let loaded = null; // {meta, rows, times, measures:{cfl:[],residual:[],energy:[]}, stateEvents:[{i,t,digest}], simName}
  let currentRowIdx = 0;

  async function parseSAXLG(file){
    const text = await file.text();
    const lines = text.trim().split(/\r?\n/);
    if (!lines.length) throw new Error("Empty file");
    const top = JSON.parse(lines[0]);
    const meta = top.$meta || top;
    const rows = [];
    for(let i=1;i<lines.length;i++){ const s=lines[i].trim(); if(!s) continue; try{ rows.push(JSON.parse(s)); }catch{} }
    const times = rows.map(r=>r.t||0);
    const measures = { cfl:[], residual:[], energy:[] };
    const stateEvents = [];
    for(const r of rows){
      if (r.type==="measure"){
        if (r.name==="cfl") measures.cfl.push([r.t, Number(r.value)]);
        if (r.name==="residual") measures.residual.push([r.t, Number(r.value)]);
        if (r.name==="energyDrift") measures.energy.push([r.t, Number(r.value)]);
      } else if (r.type==="state"){
        stateEvents.push({t:r.t, digest:r.digest});
      }
    }
    return { meta, rows, times, measures, stateEvents, simName: meta.sim || "Unknown" };
  }

  function renderMeta(meta){
    $("#evd-meta").textContent = JSON.stringify(meta, null, 2);
  }

  function renderKPIs(obj){
    const evCount = obj.rows.length;
    const dur = obj.times.length ? obj.times[obj.times.length-1] : 0;
    const cflMax = obj.measures.cfl.length ? Math.max(...obj.measures.cfl.map(([t,v])=>v)) : null;
    const resMin = obj.measures.residual.length ? Math.min(...obj.measures.residual.map(([t,v])=>v)) : null;
    const energyMaxAbs = obj.measures.energy.length ? Math.max(...obj.measures.energy.map(([t,v])=>Math.abs(v))) : null;
    const flags = [];
    if (cflMax!=null && cflMax>1.0) flags.push("CFL>1 crossed");
    if (resMin!=null && resMin<1e-3) flags.push("Residual<1e-3 reached");
    $("#evd-kpi").innerHTML =
      `Events: <b>${evCount}</b> | Duration: <b>${dur.toFixed(2)}s</b><br>`+
      `Max CFL: <b>${cflMax==null?"—":cflMax.toFixed(3)}</b> | Min residual: <b>${resMin==null?"—":resMin.toExponential(2)}</b> | Max |energy drift|: <b>${energyMaxAbs==null?"—":energyMaxAbs.toPrecision(3)}</b><br>`+
      (flags.length? `<span style="color:#f59e0b">Flags: ${flags.join(", ")}</span>` : `<span style="opacity:.75">Flags: none</span>`);
  }

  function renderCharts(obj){
    const xsC = obj.measures.cfl.map(([t,v])=>t);
    const ysC = obj.measures.cfl.map(([t,v])=>v);
    lineChart($("#chart-cfl"), xsC, ysC);
    const xsR = obj.measures.residual.map(([t,v])=>t);
    const ysR = obj.measures.residual.map(([t,v])=>v);
    lineChart($("#chart-residual"), xsR, ysR);
    const xsE = obj.measures.energy.map(([t,v])=>t);
    const ysE = obj.measures.energy.map(([t,v])=>v);
    lineChart($("#chart-energy"), xsE, ysE);
  }

  function renderTimeline(obj){
    const range = $("#evd-scrub");
    range.max = String(Math.max(0, obj.rows.length-1));
    range.value = "0";
    $("#evd-event").textContent = obj.rows.length? JSON.stringify(obj.rows[0], null, 2) : "—";
  }

  // Scrubber handler
  $("#evd-scrub").addEventListener("input", (e)=>{
    if (!loaded) return;
    const i = clamp(parseInt(e.target.value,10)||0, 0, loaded.rows.length-1);
    currentRowIdx = i;
    $("#evd-event").textContent = JSON.stringify(loaded.rows[i], null, 2);
  });

  // Drag/drop / file input
  $("#evd-file").addEventListener("change", async (e)=>{
    if (!e.target.files.length) return;
    const f = e.target.files[0];
    try{
      loaded = await parseSAXLG(f);
      renderMeta(loaded.meta); renderKPIs(loaded); renderCharts(loaded); renderTimeline(loaded);
    }catch(err){
      alert("Parse error: "+err.message);
    }
  });
  drop.addEventListener("dragover", (e)=>{ e.preventDefault(); drop.style.outline="2px dashed #2f6"; });
  drop.addEventListener("dragleave", (e)=>{ drop.style.outline="none"; });
  drop.addEventListener("drop", async (e)=>{
    e.preventDefault(); drop.style.outline="none";
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (!f) return;
    $("#evd-file").files = e.dataTransfer.files; // reflect
    $("#evd-file").dispatchEvent(new Event("change"));
  });

  // ---------- Spot-check replayer ----------
  function controlFor(simName, paramName){
    const map = SIM_UI[simName]; if (!map) return null;
    const sel = map.paramSel(paramName); if (!sel) return null;
    return $(sel);
  }
  function canvasFor(simName){
    const map = SIM_UI[simName]; if (!map) return null; return $(map.canvas);
  }

  function setControl(el, value){
    if (!el) return false;
    const t = (el.tagName==="INPUT" && el.type==="range") ? "input" : "change";
    if (el.type==="checkbox"){ el.checked = !!value; el.dispatchEvent(new Event("change", {bubbles:true})); }
    else { el.value = value; el.dispatchEvent(new Event(t, {bubbles:true})); }
    return true;
  }

  function pointerToCanvas(canvas, op, x, y){
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = rect.left + x;
    const clientY = rect.top + y;
    const ev = new PointerEvent(op==="drag"?"pointermove":("pointer"+op), { bubbles:true, clientX, clientY });
    canvas.dispatchEvent(ev);
  }

  async function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

  async function runSpotCheck(N){
    $("#evd-spot-log").textContent = "Running…";
    const simName = loaded?.simName;
    if (!simName || !SIM_UI[simName]){ $("#evd-spot-log").textContent="Unsupported or unknown sim for spot-check."; return; }
    const rows = loaded.rows;
    const stateIdxs = []; for(let i=0;i<rows.length;i++) if (rows[i].type==="state") stateIdxs.push(i);
    if (!stateIdxs.length){ $("#evd-spot-log").textContent="No state checkpoints in reel."; return; }
    const take = Math.min(N, stateIdxs.length);
    const canvas = canvasFor(simName);
    if (!canvas){ $("#evd-spot-log").textContent="Canvas not found for this sim."; return; }

    // Save control values to restore
    const saved = {};
    $$(".physics-controls [id]").forEach(el=> saved[el.id] = (el.type==="checkbox" ? el.checked : el.value));

    // Move through events up to each checkpoint and compare digest
    let checked = 0;
    let mismatch = null;
    for (let k=0;k<take;k++){
      const idx = stateIdxs[k];
      const start = (k===0? 0 : stateIdxs[k-1]+1);
      for (let i=start; i<=idx; i++){
        const ev = rows[i];
        if (ev.type==="param"){
          const el = controlFor(simName, ev.name);
          setControl(el, ev.value);
        } else if (ev.type==="pointer"){
          pointerToCanvas(canvas, ev.op, ev.x||0, ev.y||0);
        } else if (ev.type==="milestone" || ev.type==="measure"){
          // ignored
        }
      }
      await sleep(80);
      const digestFn = DIGEST_BY_SIM[simName];
      const digest = digestFn ? digestFn(window) : "NA";
      if (digest !== rows[idx].digest){
        mismatch = {k, t: rows[idx].t, have: digest, want: rows[idx].digest};
        break;
      }
      checked++;
    }

    if (mismatch){
      $("#evd-spot-log").innerHTML = "<span style='color:#ef4444'>Mismatch at checkpoint "+(mismatch.k+1)+" (t="+mismatch.t.toFixed(2)+"s)</span>\n"+
        "have: "+mismatch.have+"\nwant: "+mismatch.want;
    } else {
      $("#evd-spot-log").innerHTML = "<span style='color:#22c55e'>Verified ✓</span>  ("+checked+" / "+take+" checkpoints)";
    }

    // Restore controls
    for (const [id,val] of Object.entries(saved)){
      const el = document.getElementById(id);
      if (!el) continue;
      setControl(el, (el.type==="checkbox")? !!val : val);
    }
  }

  $("#evd-run").addEventListener("click", ()=>{
    if (!loaded) { alert("Load a .saxlg first."); return; }
    const N = Math.max(1, Math.min(20, parseInt($("#evd-N").value,10)||5));
    runSpotCheck(N);
  });

  // ---------- Accreditation (batch) ----------
  async function runBatch(K, baseSeed){
    if (!loaded) { alert("Load a .saxlg first (we use its meta.sim to target the right sim)."); return; }
    const simName = loaded.simName;
    const ui = SIM_UI[simName];
    if (!ui){ alert("Unsupported sim for batch mode."); return; }
    const seedEl = controlFor(simName, "seed");
    if (!seedEl){ alert("Cannot locate seed control on this page."); return; }
    const digestFn = DIGEST_BY_SIM[simName];
    if (!digestFn){ alert("No digest helper for this sim."); return; }

    const rowsPerRun = [];
    const batch = [];

    $("#evd-batch-log").textContent = "Running "+K+" replicates…";
    for (let k=0;k<K;k++){
      const seed = (baseSeed|0) + k;
      setControl(seedEl, seed);
      await sleep(120);

      const t0 = performance.now()/1000;
      const rows = [];
      rows.push({ t: 0, type:"param", name:"seed", value: seed });
      for (let j=1;j<=5;j++){
        await sleep(1000);
        const digest = digestFn(window);
        rows.push({ t: performance.now()/1000 - t0, type:"state", digest });
      }
      rowsPerRun.push(rows);
      const root = await computeEventRoot(rows);
      batch.push({ seed, event_root: root });
      $("#evd-batch-log").textContent = "Run "+(k+1)+"/"+K+" complete";
    }

    const meta = {
      spec: "saxlg/1-batch",
      sim: loaded.simName,
      version: (window.APP_VERSION||"dev"),
      code_hash: (window.APP_CODE_HASH||"unknown"),
      batch
    };
    const lines = [ JSON.stringify({ $meta: meta }) ];
    for (let r=0; r<rowsPerRun.length; r++){
      lines.push(JSON.stringify({ run:r, type:"_run_start" }));
      for (const ev of rowsPerRun[r]) lines.push(JSON.stringify(ev));
      lines.push(JSON.stringify({ run:r, type:"_run_end" }));
    }

    const blob = new Blob([lines.join("\n")], { type:"application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (loaded.simName||"Sim") + ".batch.saxlg";
    a.click(); URL.revokeObjectURL(a.href);
    $("#evd-batch-log").textContent = "Batch file downloaded with "+K+" per-run roots in $meta.batch.";
  }

  $("#evd-batch").addEventListener("click", ()=>{
    const K = Math.max(2, Math.min(50, parseInt($("#evd-K").value,10)||5));
    const base = parseInt($("#evd-base-seed").value,10)||20250827;
    runBatch(K, base);
  });
})();
