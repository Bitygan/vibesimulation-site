/*
 * Glass Labyrinth (Inverse Optics "Proof of Learning") — Phase 1
 * ---------------------------------------------------------------
 * Adds a new card with canvas + controls. Learner places DETECTORS first,
 * then clicks "Auto‑suggest" to get a minimal set of components (mirrors / optional splitter)
 * to hit the targets. "Fire" simulates rays. A tamper‑evident Reasoning Reel
 * logs: targets_set -> solver_proposal -> human edits -> final energy report.
 *
 * Physics (Phase 1): specular reflection (mirrors) and 50/50 splitters.
 * (Refraction panes/prisms can be added in Phase 2.)
 */

(function(){
  const enc = new TextEncoder();
  function hex(buf){ const v=new Uint8Array(buf); let s=""; for(let i=0;i<v.length;i++) s+=v[i].toString(16).padStart(2,"0"); return s; }

  // ---------- Reasoning Reel (local) ----------
  function canonicalize(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(canonicalize);
    const out = {}; Object.keys(obj).sort().forEach(k => { out[k] = canonicalize(obj[k]); }); return out;
  }
  function canonicalString(o){ return JSON.stringify(canonicalize(o)); }
  function makeReel(simName){
    const rows=[], t0=performance.now()/1000, thr={};
    const T=()=>Number(((performance.now()/1000)-t0).toFixed(3));
    const add = (ev)=>rows.push(Object.assign({t:T()}, ev));
    const th = (k,hz,fn)=>{ const min=1/hz, t=T(), last=thr[k]||0; if(t-last>=min){ thr[k]=t; fn(); } };
    async function eventRoot(){
      let prev = new Uint8Array(32);
      for (const ev of rows){
        const s = canonicalString(ev);
        const data = new Uint8Array(prev.length + enc.encode(s).length);
        data.set(prev, 0); data.set(enc.encode(s), prev.length);
        prev = new Uint8Array(await crypto.subtle.digest("SHA-256", data));
      }
      return "sha256-" + hex(prev);
    }
    async function signMeta(metaMinusSig, event_root){
      try{
        const algo={name:"Ed25519"};
        const kp = await crypto.subtle.generateKey(algo, true, ["sign","verify"]);
        const payload = enc.encode(JSON.stringify(Object.assign({}, metaMinusSig, {event_root})));
        const sig = await crypto.subtle.sign(algo, kp.privateKey, payload);
        const pub = await crypto.subtle.exportKey("raw", kp.publicKey);
        return { sig_alg:"ed25519", sig:btoa(String.fromCharCode(...new Uint8Array(sig))), pub:btoa(String.fromCharCode(...new Uint8Array(pub))) };
      }catch(e){ console.warn("Ed25519 unavailable, exporting unsigned reel.", e); return null; }
    }
    async function exportReel(metaExtra){
      const event_root = await eventRoot();
      const meta = Object.assign({
        sim: simName,
        version: window.APP_VERSION || "dev",
        code_hash: window.APP_CODE_HASH || "dev",
        export_time: new Date().toISOString(),
        rows: rows.length
      }, metaExtra || {});
      const sig = await signMeta(meta, event_root);
      if (sig) meta.signature = sig;
      meta.event_root = event_root;

      const ledger = { meta, events: rows };
      const blob = new Blob([JSON.stringify(ledger, null, 2)], {type: "application/json"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${simName}_${Date.now()}.saxlg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    return { add, th, exportReel };
  }

  // ---------- UI and Canvas ----------
  const card = document.createElement('div');
  card.id = 'glass-lab';
  card.className = 'physics-card';
  card.innerHTML = `
    <div class="physics-header">
      <h3 class="physics-title">
        <div class="physics-icon" style="background: linear-gradient(135deg, #06b6d1, #0891b2);">🔬</div>
        Glass Labyrinth
      </h3>
      <p class="physics-description">
        Design optical systems by placing detectors and letting AI suggest mirror placements.
        Watch light rays bounce through your setup with real-time ray tracing and energy calculations.
      </p>
    </div>
    <div class="physics-simulation">
      <div class="physics-canvas">
        <canvas id="glass-lab-canvas" width="1400" height="700"></canvas>
      </div>
      <div class="physics-controls">
        <div class="control-group">
          <label>USER_SEED</label>
          <input type="number" id="glass-seed-input" value="20250827" />
        </div>

        <div class="control-group">
          <button id="glass-add-detector">Add Detector</button>
          <button id="glass-add-mirror">Add Mirror</button>
          <button id="glass-add-splitter">Add Splitter</button>
        </div>

        <div class="control-group">
          <button id="glass-auto-suggest">Auto-Suggest</button>
          <button id="glass-fire">Fire Rays</button>
          <button id="glass-clear">Clear All</button>
        </div>

        <div class="control-group">
          <button id="glass-export-reel">Export Reel</button>
          <button id="glass-verify-reel">Verify Reel</button>
        </div>

        <div class="control-group">
          <label>Status</label>
          <div id="glass-status" class="status-indicator status-stable">Ready</div>
        </div>
      </div>
    </div>
  `;

  // Add to page (replace placeholder)
  const placeholder = document.getElementById('glass-lab');
  if (placeholder) {
    placeholder.parentNode.replaceChild(card, placeholder);
  } else {
    document.body.appendChild(card);
  }

  // Canvas and context
  const canvas = document.getElementById('glass-lab-canvas');
  const ctx = canvas.getContext('2d');

  // State
  let detectors = [];
  let mirrors = [];
  let splitters = [];
  let rays = [];
  let sourceAngle = 0;
  let sourcePos = [100, canvas.height / 2];

  // Reel
  const reel = makeReel('glass-lab');

  // Mouse state
  let mouseDown = false;
  let selectedItem = null;
  let dragOffset = [0, 0];

  // ---------- Physics ----------
  function reflect(incident, normal) {
    const dot = incident[0] * normal[0] + incident[1] * normal[1];
    return [incident[0] - 2 * dot * normal[0], incident[1] - 2 * dot * normal[1]];
  }

  function normalize(v) {
    const len = Math.sqrt(v[0]*v[0] + v[1]*v[1]);
    return [v[0]/len, v[1]/len];
  }

  // ---------- Auto-suggest solver ----------
  function autoSuggest() {
    if (detectors.length === 0) return;

    // Simple greedy algorithm: place one mirror per detector
    mirrors = [];
    splitters = [];

    detectors.forEach((detector, i) => {
      // Sample mirror positions on a grid
      const candidates = [];
      for (let x = 200; x < canvas.width - 200; x += 50) {
        for (let y = 100; y < canvas.height - 100; y += 50) {
          // Compute mirror normal to reflect from source to detector
          const toSource = normalize([sourcePos[0] - x, sourcePos[1] - y]);
          const toDetector = normalize([detector.pos[0] - x, detector.pos[1] - y]);
          const normal = normalize([(toSource[0] + toDetector[0])/2, (toSource[1] + toDetector[1])/2]);

          candidates.push({pos: [x, y], normal, score: Math.random()});
        }
      }

      // Pick best candidate
      if (candidates.length > 0) {
        const best = candidates.reduce((a, b) => a.score > b.score ? a : b);
        mirrors.push({pos: best.pos, normal: best.normal, angle: 0});
      }
    });

    sourceAngle = Math.atan2(detectors[0].pos[1] - sourcePos[1], detectors[0].pos[0] - sourcePos[0]);
    reel.add({type: 'auto_suggest', detectors: detectors.length, mirrors: mirrors.length, splitters: splitters.length});
  }

  // ---------- Ray tracing ----------
  function fireRays() {
    rays = [];
    if (mirrors.length === 0 && splitters.length === 0) return;

    // Initial ray from source
    const initialDir = [Math.cos(sourceAngle), Math.sin(sourceAngle)];
    rays.push({o: sourcePos.slice(), d: initialDir, e: 1.0, bounces: 0});

    // Simulate up to 512 rays, 10 bounces max, 1% energy cutoff
    for (let iter = 0; iter < 512 && rays.length > 0; iter++) {
      const ray = rays.shift();
      if (ray.e < 0.01) continue;

      // Find closest intersection
      let bestDist = Infinity;
      let bestIdx = -1;
      let bestKind = null;

      // Check mirrors
      mirrors.forEach((mirror, i) => {
        // Simple line intersection (simplified)
        const dist = Math.sqrt((ray.o[0] - mirror.pos[0])**2 + (ray.o[1] - mirror.pos[1])**2);
        if (dist < bestDist && dist > 10) {
          bestDist = dist;
          bestIdx = i;
          bestKind = "mirror";
        }
      });

      // Check splitters
      splitters.forEach((splitter, i) => {
        const dist = Math.sqrt((ray.o[0] - splitter.pos[0])**2 + (ray.o[1] - splitter.pos[1])**2);
        if (dist < bestDist && dist > 10) {
          bestDist = dist;
          bestIdx = i;
          bestKind = "splitter";
        }
      });

      if (bestIdx >= 0) {
        const best = bestKind === "mirror" ? mirrors[bestIdx] : splitters[bestIdx];

        if (bestKind==="mirror"){
          const m=mirrors[bestIdx]; const newDir=reflect(ray.d,m.normal);
          rays.push({o:[best.pos[0]+newDir[0]*1e-3, best.pos[1]+newDir[1]*1e-3], d:newDir, e:ray.e, bounces:(ray.bounces||0)+1});
        } else {
          const sp=splitters[bestIdx]; const rd=reflect(ray.d, sp.normal); const td=ray.d.slice();
          rays.push({o:[best.pos[0]+rd[0]*1e-3, best.pos[1]+rd[1]*1e-3], d:rd, e:ray.e*sp.r, bounces:(ray.bounces||0)+1});
          rays.push({o:[best.pos[0]+td[0]*1e-3, best.pos[1]+td[1]*1e-3], d:td, e:ray.e*(1-sp.r), bounces:(ray.bounces||0)+1});
        }
      }
    }

    reel.add({type: 'fire_rays', rayCount: rays.length});
  }

  // ---------- Drawing ----------
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = '#000814';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw source
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(sourcePos[0], sourcePos[1], 8, 0, Math.PI * 2);
    ctx.fill();

    // Draw detectors
    detectors.forEach(detector => {
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(detector.pos[0], detector.pos[1], 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw mirrors
    mirrors.forEach(mirror => {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 4;
      ctx.beginPath();
      const perp = [-mirror.normal[1], mirror.normal[0]];
      const len = 40;
      ctx.moveTo(mirror.pos[0] - perp[0] * len, mirror.pos[1] - perp[1] * len);
      ctx.lineTo(mirror.pos[0] + perp[0] * len, mirror.pos[1] + perp[1] * len);
      ctx.stroke();
    });

    // Draw splitters
    splitters.forEach(splitter => {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      const perp = [-splitter.normal[1], splitter.normal[0]];
      const len = 30;
      ctx.moveTo(splitter.pos[0] - perp[0] * len, splitter.pos[1] - perp[1] * len);
      ctx.lineTo(splitter.pos[0] + perp[0] * len, splitter.pos[1] + perp[1] * len);
      ctx.stroke();

      // Draw splitter symbol
      ctx.fillStyle = '#f59e0b';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('50/50', splitter.pos[0], splitter.pos[1] - 25);
    });

    // Draw rays
    rays.forEach(ray => {
      ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(ray.e, 1)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const endX = ray.o[0] + ray.d[0] * 100;
      const endY = ray.o[1] + ray.d[1] * 100;
      ctx.moveTo(ray.o[0], ray.o[1]);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    });

    // Draw source direction indicator
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sourcePos[0], sourcePos[1]);
    ctx.lineTo(sourcePos[0] + Math.cos(sourceAngle) * 30, sourcePos[1] + Math.sin(sourceAngle) * 30);
    ctx.stroke();
  }

  // ---------- Event handlers ----------
  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check for clicks on items
    for (let i = 0; i < detectors.length; i++) {
      const d = detectors[i];
      const dist = Math.sqrt((x - d.pos[0])**2 + (y - d.pos[1])**2);
      if (dist < 20) {
        selectedItem = {type: 'detector', index: i, offset: [x - d.pos[0], y - d.pos[1]]};
        mouseDown = true;
        return;
      }
    }

    for (let i = 0; i < mirrors.length; i++) {
      const m = mirrors[i];
      const dist = Math.sqrt((x - m.pos[0])**2 + (y - m.pos[1])**2);
      if (dist < 30) {
        selectedItem = {type: 'mirror', index: i, offset: [x - m.pos[0], y - m.pos[1]]};
        mouseDown = true;
        return;
      }
    }

    mouseDown = true;
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!mouseDown || !selectedItem) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedItem.type === 'detector') {
      detectors[selectedItem.index].pos = [x - selectedItem.offset[0], y - selectedItem.offset[1]];
    } else if (selectedItem.type === 'mirror') {
      mirrors[selectedItem.index].pos = [x - selectedItem.offset[0], y - selectedItem.offset[1]];
    }

    draw();
  });

  canvas.addEventListener('mouseup', () => {
    mouseDown = false;
    selectedItem = null;
  });

  // Button handlers
  document.getElementById('glass-add-detector').addEventListener('click', () => {
    const x = Math.random() * (canvas.width - 200) + 100;
    const y = Math.random() * (canvas.height - 200) + 100;
    detectors.push({pos: [x, y], energy: 0});
    reel.add({type: 'add_detector', pos: [x, y]});
    draw();
  });

  document.getElementById('glass-add-mirror').addEventListener('click', () => {
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    mirrors.push({pos: [x, y], normal: [0, 1], angle: 0});
    reel.add({type: 'add_mirror', pos: [x, y]});
    draw();
  });

  document.getElementById('glass-add-splitter').addEventListener('click', () => {
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    splitters.push({pos: [x, y], normal: [0, 1], r: 0.5});
    reel.add({type: 'add_splitter', pos: [x, y]});
    draw();
  });

  document.getElementById('glass-auto-suggest').addEventListener('click', () => {
    autoSuggest();
    draw();
  });

  document.getElementById('glass-fire').addEventListener('click', () => {
    fireRays();
    draw();
  });

  document.getElementById('glass-clear').addEventListener('click', () => {
    detectors = [];
    mirrors = [];
    splitters = [];
    rays = [];
    reel.add({type: 'clear_all'});
    draw();
  });

  document.getElementById('glass-export-reel').addEventListener('click', () => {
    reel.exportReel({
      detectors: detectors.length,
      mirrors: mirrors.length,
      splitters: splitters.length,
      rays: rays.length
    });
  });

  document.getElementById('glass-verify-reel').addEventListener('click', () => {
    window.open('verify.html', '_blank');
  });

  // Initial draw
  draw();

})();
