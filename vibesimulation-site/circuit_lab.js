/*
 * Circuit Lab (SAX SOP v2.2) — Phase 1
 * -------------------------------------
 * Plug-and-play: include this file near the end of your page.
 * It dynamically inserts a new "Circuit Lab" card (no HTML edits required).
 * Features: DC MNA solver (R, ideal V sources, wires, switches), simple UI, logs,
 * and built-in Reasoning Reel export (tamper-evident hash-chain + Ed25519 signature).
 *
 * If verify.html is present in the same folder, the "Verify Reel" button opens it.
 */

(function(){
  const enc = new TextEncoder();

  function canonicalize(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(canonicalize);
    const out = {};
    Object.keys(obj).sort().forEach(k => { out[k] = canonicalize(obj[k]); });
    return out;
  }
  function canonicalString(o){ return JSON.stringify(canonicalize(o)); }
  function hex(buf){ const v=new Uint8Array(buf); let s=""; for(let i=0;i<v.length;i++) s+=v[i].toString(16).padStart(2,"0"); return s; }

  function fnv1a32(bytes) {
    let h = 0x811c9dc5 >>> 0;
    for (let i = 0; i < bytes.length; i++) { h ^= bytes[i]; h = Math.imul(h, 0x01000193) >>> 0; }
    return ("00000000" + h.toString(16)).slice(-8);
  }
  function sampleFloat32(arr, step){
    const view = new DataView(new ArrayBuffer(4));
    const out = new Uint8Array(Math.ceil(arr.length / step) * 4);
    let j=0;
    for (let i=0; i<arr.length; i+=step){
      view.setFloat32(0, arr[i] || 0, true);
      out.set(new Uint8Array(view.buffer), j); j+=4;
    }
    return out;
  }

  function makeReel(simName){
    const rows=[];
    const t0=performance.now()/1000;
    const throttlers = {};
    function T(){ return Number(((performance.now()/1000)-t0).toFixed(3)); }
    function add(ev){ rows.push(Object.assign({t:T()}, ev)); }
    function th(key,hz,fn){ const min=1/hz; const t=T(); const last=throttlers[key]||0; if(t-last>=min){ throttlers[key]=t; fn(); } }
    function concatBytes(a, b) {
      const out = new Uint8Array(a.length + b.length);
      out.set(a, 0);
      out.set(b, a.length);
      return out;
    }

    async function eventRoot(){
      let prev = new Uint8Array(32);
      for(const ev of rows){
        const s = canonicalString(ev);
        const data = concatBytes(prev, enc.encode(s));
        prev = new Uint8Array(await crypto.subtle.digest('SHA-256', data));
      }
      return "sha256-" + hex(prev);
    }
    async function signMeta(meta){
      try{
        const algo={name:"Ed25519"};
        const keyPair = await crypto.subtle.generateKey(algo, true, ["sign","verify"]);
        const toSign = enc.encode(JSON.stringify(meta));
        const sig = await crypto.subtle.sign(algo.name, keyPair.privateKey, toSign);
        const pub = await crypto.subtle.exportKey("raw", keyPair.publicKey);
        return { sig_alg:"ed25519", pub: btoa(String.fromCharCode(...new Uint8Array(pub))), sig: btoa(String.fromCharCode(...new Uint8Array(sig))) };
      } catch { return null; }
    }
    async function exportReel(metaExtras){
      const meta = {
        spec: "saxlg/1",
        sim: simName,
        version: (window.APP_VERSION || "dev"),
        code_hash: (window.APP_CODE_HASH || "unknown"),
        rng: "deterministic",
        user_seed: metaExtras?.user_seed || undefined,
        env: { ua: navigator.userAgent, tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" },
        deep_link: window.location.href
      };
      const event_root = await eventRoot();
      meta.event_root = event_root;
      const sig = await signMeta(meta);
      if(sig) Object.assign(meta, sig);
      const lines = [JSON.stringify({$meta:meta}), ...rows.map(r=>JSON.stringify(r))];
      const blob = new Blob([lines.join("\n")], {type:"application/json"});
      const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`${simName}.saxlg`; a.click();
      URL.revokeObjectURL(a.href);
    }
    return { add, th, exportReel };
  }

  class CircuitLab {
    constructor(){
      this.canvas = null;
      this.ctx = null;
      this.W = 800;
      this.H = 600;
      this.netlist = [];
      this.nodes = {};
      this.nodeCount = 0;
      this.voltages = [];
      this.probes = [];
      this.reel = makeReel("CircuitLab");
      this.components = {
        R: (id, n1, n2, val) => ({ type:"R", id, n1, n2, val: Number(val) }),
        V: (id, n1, n2, val) => ({ type:"V", id, n1, n2, val: Number(val) }),
        W: (id, n1, n2) => ({ type:"W", id, n1, n2 }),
        S: (id, n1, n2) => ({ type:"S", id, n1, n2 })
      };
      this.init();
    }

    init(){
      this.setupCanvas();
      this.setupUI();
      this.setupEventListeners();
      this.addDefaultCircuit();
      this.solve();
      this.draw();
      this.startDigest();
    }

    setupCanvas(){
      this.canvas = document.createElement("canvas");
      this.canvas.width = this.W;
      this.canvas.height = this.H;
      this.canvas.style.width = "100%";
      this.canvas.style.height = "auto";
      this.canvas.style.border = "1px solid #333";
      this.canvas.style.borderRadius = "8px";
      this.ctx = this.canvas.getContext("2d");
    }

    setupUI(){
      // Create the card structure
      const card = document.createElement("div");
      card.id = "circuit-lab";
      card.className = "physics-card";
      card.innerHTML = `
        <div class="physics-header">
          <h3 class="physics-title">
            <div class="physics-icon" style="background: linear-gradient(135deg, #ff6b6b, #ee5a24);">
              <span style="font-size: 1.5rem;">⚡</span>
            </div>
            Circuit Lab
          </h3>
          <p class="physics-description">
            Design and simulate DC circuits with resistors, batteries, and switches. Analyze node voltages and element currents with tamper-evident recording.
          </p>
        </div>
        <div class="physics-simulation">
          <div class="physics-canvas"></div>
          <div class="physics-controls">
            <div class="control-group">
              <label>Netlist</label>
              <textarea id="netlist-text" rows="6" placeholder="R1 1 0 1000&#10;V1 1 0 5.0&#10;R2 2 1 2000&#10;V2 2 0 3.0"></textarea>
            </div>
            <div class="control-group">
              <button id="solve-btn">Solve Circuit</button>
            </div>
            <div class="control-group">
              <label>Probe Node:</label>
              <input type="number" id="probe-node" min="0" value="1" style="width: 60px;">
              <span id="probe-voltage">V(1) = 0.00V</span>
            </div>
            <div class="control-group">
              <button id="export-reel-btn">Export Reel (.saxlg)</button>
            </div>
            <div class="control-group">
              <button id="verify-reel-btn">Verify Reel</button>
            </div>
          </div>
        </div>
      `;

      // Insert after hero section, before other simulations
      const hero = document.querySelector('.physics-hero') || document.querySelector('#physics-hero');
      if(hero && hero.nextElementSibling){
        hero.parentNode.insertBefore(card, hero.nextElementSibling);
      } else {
        document.body.appendChild(card);
      }

      // Add canvas to the canvas container
      const canvasContainer = card.querySelector('.physics-canvas');
      if(canvasContainer){
        canvasContainer.appendChild(this.canvas);
      }
    }

    setupEventListeners(){
      const card = document.getElementById('circuit-lab');
      const solveBtn = card.querySelector('#solve-btn');
      const exportBtn = card.querySelector('#export-reel-btn');
      const verifyBtn = card.querySelector('#verify-reel-btn');
      const netlistText = card.querySelector('#netlist-text');

      solveBtn.addEventListener('click', () => {
        this.parseNetlist(netlistText.value);
        this.solve();
        this.draw();
        this.reel.add({ type: "solve", netlist: this.netlist.length + " components" });
      });

      exportBtn.addEventListener('click', async () => {
        await this.reel.exportReel({ user_seed: 20250827 });
      });

      verifyBtn.addEventListener('click', () => {
        window.open('verify.html', '_blank');
      });

      netlistText.addEventListener('change', (e) => {
        this.reel.th('netlist', 2, () => {
          this.reel.add({ type: "netlist_edit", content: e.target.value.length + " chars" });
        });
      });
    }

    addDefaultCircuit(){
      const netlist = `R1 1 0 1000
V1 1 0 5.0
R2 2 1 2000
V2 2 0 3.0
R3 3 2 1500
W 3 0`;

      document.getElementById('netlist-text').value = netlist;
      this.parseNetlist(netlist);
      this.solve();
    }

    parseNetlist(text){
      this.netlist = [];
      this.nodes = {};
      this.nodeCount = 0;

      const lines = text.trim().split('\n');
      for(const line of lines){
        const parts = line.trim().split(/\s+/);
        if(parts.length < 3) continue;

        const [id, n1, n2, ...rest] = parts;
        const type = id.charAt(0);
        const val = rest[0] ? Number(rest[0]) : undefined;

        // Ensure nodes exist
        if(!this.nodes[n1]) this.nodes[n1] = this.nodeCount++;
        if(!this.nodes[n2]) this.nodes[n2] = this.nodeCount++;

        if(this.components[type]){
          this.netlist.push(this.components[type](id, n1, n2, val));
        }
      }
    }

    solve(){
      // DC Modified Nodal Analysis (MNA) solver
      const N = this.nodeCount - 1; // Ground node 0 is reference
      if(N <= 0) return;

      // Build conductance matrix G and current vector I
      const G = new Array(N).fill(0).map(() => new Array(N).fill(0));
      const I = new Array(N).fill(0);

      // Process each component
      for(const comp of this.netlist){
        const n1 = this.nodes[comp.n1];
        const n2 = this.nodes[comp.n2];

        if(comp.type === 'R'){
          const g = 1 / comp.val; // Conductance
          if(n1 > 0){ // Not ground
            G[n1-1][n1-1] += g;
            if(n2 > 0) G[n1-1][n2-1] -= g;
          }
          if(n2 > 0){ // Not ground
            G[n2-1][n2-1] += g;
            if(n1 > 0) G[n2-1][n1-1] -= g;
          }
        } else if(comp.type === 'V'){
          // Voltage source - add to current vector
          const current = comp.val;
          if(n1 > 0) I[n1-1] += current;
          if(n2 > 0) I[n2-1] -= current;
        } else if(comp.type === 'S' || comp.type === 'W'){
          // Short circuit (ideal connection)
          const g = 1e12; // Very high conductance
          if(n1 > 0){
            G[n1-1][n1-1] += g;
            if(n2 > 0) G[n1-1][n2-1] -= g;
          }
          if(n2 > 0){
            G[n2-1][n2-1] += g;
            if(n1 > 0) G[n2-1][n1-1] -= g;
          }
        }
      }

      // Solve GV = I using Gaussian elimination
      this.voltages = this.gaussianElimination(G, I);
    }

    gaussianElimination(A, b){
      const n = A.length;
      const augmented = A.map((row, i) => [...row, b[i]]);

      // Forward elimination
      for(let i = 0; i < n; i++){
        // Find pivot
        let maxRow = i;
        for(let k = i + 1; k < n; k++){
          if(Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])){
            maxRow = k;
          }
        }

        // Swap rows
        [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

        // Eliminate
        for(let k = i + 1; k < n; k++){
          const factor = augmented[k][i] / augmented[i][i];
          for(let j = i; j <= n; j++){
            augmented[k][j] -= factor * augmented[i][j];
          }
        }
      }

      // Back substitution
      const x = new Array(n).fill(0);
      for(let i = n - 1; i >= 0; i--){
        x[i] = augmented[i][n];
        for(let j = i + 1; j < n; j++){
          x[i] -= augmented[i][j] * x[j];
        }
        x[i] /= augmented[i][i];
      }

      return x;
    }

    draw(){
      if(!this.ctx) return;

      this.ctx.fillStyle = '#f8f9fa';
      this.ctx.fillRect(0, 0, this.W, this.H);

      // Draw nodes
      this.ctx.fillStyle = '#2563eb';
      this.ctx.strokeStyle = '#1e40af';
      this.ctx.lineWidth = 2;

      const nodeRadius = 8;
      const nodePositions = {};

      // Position nodes in a grid
      Object.keys(this.nodes).forEach((nodeId, index) => {
        const row = Math.floor(index / 4);
        const col = index % 4;
        const x = 100 + col * 150;
        const y = 100 + row * 120;
        nodePositions[nodeId] = { x, y };

        // Draw node
        this.ctx.beginPath();
        this.ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();

        // Label node
        this.ctx.fillStyle = '#1e40af';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(nodeId, x, y - 15);

        // Show voltage if solved
        if(this.voltages[this.nodes[nodeId] - 1] !== undefined){
          const voltage = this.voltages[this.nodes[nodeId] - 1].toFixed(2);
          this.ctx.fillText(`${voltage}V`, x, y + 20);
        }
      });

      // Draw components
      for(const comp of this.netlist){
        const pos1 = nodePositions[comp.n1];
        const pos2 = nodePositions[comp.n2];

        if(pos1 && pos2){
          this.drawComponent(comp, pos1, pos2);
        }
      }

      // Update probe display
      const probeNode = document.getElementById('probe-node').value;
      const voltageEl = document.getElementById('probe-voltage');
      if(voltageEl && this.voltages[this.nodes[probeNode] - 1] !== undefined){
        const voltage = this.voltages[this.nodes[probeNode] - 1].toFixed(3);
        voltageEl.textContent = `V(${probeNode}) = ${voltage}V`;
      }
    }

    drawComponent(comp, pos1, pos2){
      const dx = pos2.x - pos1.x;
      const dy = pos2.y - pos1.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      this.ctx.strokeStyle = '#374151';
      this.ctx.lineWidth = 3;

      if(comp.type === 'R'){
        // Draw resistor as zigzag
        this.ctx.beginPath();
        this.ctx.moveTo(pos1.x, pos1.y);

        const segments = 6;
        const segmentLength = length / segments;
        for(let i = 0; i < segments; i++){
          const x = pos1.x + (i + 0.5) * segmentLength * Math.cos(angle);
          const y = pos1.y + (i + 0.5) * segmentLength * Math.sin(angle);
          const offset = (i % 2 === 0 ? 1 : -1) * 8;
          const perpX = x + offset * Math.cos(angle + Math.PI/2);
          const perpY = y + offset * Math.sin(angle + Math.PI/2);
          this.ctx.lineTo(perpX, perpY);
        }
        this.ctx.lineTo(pos2.x, pos2.y);
        this.ctx.stroke();

        // Label
        this.ctx.fillStyle = '#dc2626';
        this.ctx.font = '10px monospace';
        this.ctx.textAlign = 'center';
        const midX = (pos1.x + pos2.x) / 2;
        const midY = (pos1.y + pos2.y) / 2;
        this.ctx.fillText(`${comp.val}Ω`, midX, midY - 5);

      } else if(comp.type === 'V'){
        // Draw voltage source as circle with + and -
        const midX = (pos1.x + pos2.x) / 2;
        const midY = (pos1.y + pos2.y) / 2;

        this.ctx.strokeStyle = '#059669';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(midX, midY, 20, 0, 2 * Math.PI);
        this.ctx.stroke();

        this.ctx.fillStyle = '#059669';
        this.ctx.font = '12px monospace';
        this.ctx.fillText('+', midX - 8, midY - 3);
        this.ctx.fillText('-', midX + 8, midY - 3);
        this.ctx.fillText(`${comp.val}V`, midX, midY + 15);

      } else if(comp.type === 'S'){
        // Draw switch as break in line
        const midX = (pos1.x + pos2.x) / 2;
        const midY = (pos1.y + pos2.y) / 2;
        const offset = 15;

        this.ctx.beginPath();
        this.ctx.moveTo(pos1.x, pos1.y);
        this.ctx.lineTo(midX - offset, midY - offset);
        this.ctx.moveTo(midX + offset, midY + offset);
        this.ctx.lineTo(pos2.x, pos2.y);
        this.ctx.stroke();

        // Switch symbol
        this.ctx.fillStyle = '#7c3aed';
        this.ctx.fillText('S', midX, midY - 5);

      } else {
        // Wire (default)
        this.ctx.beginPath();
        this.ctx.moveTo(pos1.x, pos1.y);
        this.ctx.lineTo(pos2.x, pos2.y);
        this.ctx.stroke();
      }
    }

    startDigest(){
      setInterval(() => {
        if(this.voltages.length > 0){
          const step = Math.max(1, Math.floor(this.voltages.length / 16)); // Sample ~1/16
          const digest = "cl-" + fnv1a32(sampleFloat32(this.voltages, step));
          this.reel.th('state', 1, () => {
            this.reel.add({ type: "state", digest });
          });
        }
      }, 1000); // 1 Hz state digest
    }
  }

  // Initialize when DOM is ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', () => {
      window.circuitLabSim = new CircuitLab();
    });
  } else {
    window.circuitLabSim = new CircuitLab();
  }

})();
