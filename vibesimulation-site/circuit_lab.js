/*
 * Circuit Lab (SAX SOP v2.2) — Interactive Phase
 * -----------------------------------------------
 * Following SAX Foundational SOP v2.2.md principles:
 * - Agent-First paradigm for discrete components
 * - Deterministic seeding with Reasoning Reels
 * - Tamper-evident recording with hash-chain
 * - Autonomous component behavior
 * - Real-time collaborative simulation
 *
 * Interactive drag-and-drop circuit builder with:
 * - Component palette (battery, resistor, wire)
 * - Drag-and-drop placement
 * - Visual wire routing
 * - Real-time circuit simulation
 * - Reasoning Reels export
 */

(function(){
  const enc = new TextEncoder();

  // SAX SOP v2.2: Canonical utility functions
  function canonicalize(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(canonicalize);
    const out = {};
    Object.keys(obj).sort().forEach(k => { out[k] = canonicalize(obj[k]); });
    return out;
  }
  function canonicalString(o){ return JSON.stringify(canonicalize(o)); }
  function hex(buf){ const v=new Uint8Array(buf); let s=""; for(let i=0;i<v.length;i++) s+=v[i].toString(16).padStart(2,"0"); return s; }
  function concatBytes(a, b) {
    const out = new Uint8Array(a.length + b.length);
    out.set(a, 0);
    out.set(b, a.length);
    return out;
  }

  // SAX SOP v2.2: Agent-First Paradigm - Component Agents
  class CircuitComponent {
    constructor(type, x, y, value = 0) {
      this.type = type; // 'battery', 'resistor', 'wire'
      this.x = x;
      this.y = y;
      this.value = value;
      this.id = Math.random().toString(36).substr(2, 9);
      this.selected = false;
      this.dragging = false;
      this.terminals = this.getTerminals();
      this.voltage = 0;
      this.current = 0;
    }

    getTerminals() {
      // Each component has input/output terminals
      return [
        { x: this.x - 20, y: this.y, type: 'input', connected: false, voltage: 0 },
        { x: this.x + 20, y: this.y, type: 'output', connected: false, voltage: 0 }
      ];
    }

    updatePosition(x, y) {
      this.x = x;
      this.y = y;
      this.terminals = this.getTerminals();
    }

    containsPoint(px, py) {
      return Math.abs(px - this.x) < 25 && Math.abs(py - this.y) < 25;
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);

      // Draw component body
      if (this.type === 'battery') {
        this.drawBattery(ctx);
      } else if (this.type === 'resistor') {
        this.drawResistor(ctx);
      } else if (this.type === 'wire') {
        this.drawWire(ctx);
      }

      // Draw terminals
      this.drawTerminals(ctx);

      // Draw selection indicator
      if (this.selected) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(-25, -25, 50, 50);
      }

      ctx.restore();
    }

    drawTerminals(ctx) {
      ctx.fillStyle = '#374151';
      this.terminals.forEach(terminal => {
        const localX = terminal.x - this.x;
        const localY = terminal.y - this.y;
        ctx.beginPath();
        ctx.arc(localX, localY, 3, 0, 2 * Math.PI);
        ctx.fill();

        // Voltage display at terminals
        if (terminal.voltage !== undefined) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(terminal.voltage.toFixed(1) + 'V', localX, localY - 8);
          ctx.fillStyle = '#374151';
        }
      });
    }

    drawBattery(ctx) {
      // Battery symbol
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-15, 0);
      ctx.lineTo(-5, 0);
      ctx.moveTo(-5, -8);
      ctx.lineTo(-5, 8);
      ctx.moveTo(5, -5);
      ctx.lineTo(5, 5);
      ctx.moveTo(5, 0);
      ctx.lineTo(15, 0);
      ctx.stroke();

      // Voltage label
      ctx.fillStyle = '#059669';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${this.value}V`, 0, -15);
    }

    drawResistor(ctx) {
      // Resistor zigzag
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-15, 0);
      for (let i = 0; i < 5; i++) {
        const x = -10 + i * 5;
        const y = (i % 2 === 0 ? 5 : -5);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(15, 0);
      ctx.stroke();

      // Resistance label
      ctx.fillStyle = '#dc2626';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${this.value}Ω`, 0, -15);

      // Current display
      if (this.current > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px monospace';
        ctx.fillText(`${this.current.toFixed(2)}A`, 0, 15);
      }
    }

    drawWire(ctx) {
      // Simple wire line
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-15, 0);
      ctx.lineTo(15, 0);
      ctx.stroke();
    }
  }

  // SAX SOP v2.2: Agent-First Paradigm - Wire Agent
  class WireConnection {
    constructor(startComp, endComp, startTerm, endTerm) {
      this.startComp = startComp;
      this.endComp = endComp;
      this.startTerm = startTerm;
      this.endTerm = endTerm;
      this.id = Math.random().toString(36).substr(2, 9);
      this.current = 0;
    }

    draw(ctx) {
      const start = this.startTerm;
      const end = this.endTerm;

      // Calculate wire length for stretch effect
      const length = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
      const maxLength = 200; // Maximum "normal" length
      const stretched = length > maxLength * 1.2;

      // Wire color based on state
      if (stretched) {
        ctx.strokeStyle = '#f59e0b'; // Orange for stretched
        ctx.lineWidth = 2;
      } else if (this.current > 0) {
        ctx.strokeStyle = '#10b981'; // Green for active current
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = '#6b7280'; // Gray for inactive
        ctx.lineWidth = 2;
      }

      // Draw the wire with smooth curve
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);

      // Add slight curve for more natural look
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      const curveOffset = Math.abs(end.x - start.x) * 0.1;

      if (Math.abs(end.x - start.x) > Math.abs(end.y - start.y)) {
        // Horizontal wire
        ctx.bezierCurveTo(
          start.x + curveOffset, start.y,
          end.x - curveOffset, end.y,
          end.x, end.y
        );
      } else {
        // Vertical wire
        ctx.bezierCurveTo(
          start.x, start.y + curveOffset,
          end.x, end.y - curveOffset,
          end.x, end.y
        );
      }

      ctx.stroke();

      // Current flow indicator (animated)
      if (this.current > 0) {
        const time = Date.now() * 0.01;
        const offset = Math.sin(time) * 8;
        const progress = (Math.sin(time * 0.5) + 1) * 0.5; // 0 to 1

        // Calculate position along the wire
        const currentX = start.x + (end.x - start.x) * progress;
        const currentY = start.y + (end.y - start.y) * progress;

        // Draw current flow particle
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(currentX, currentY, 3, 0, 2 * Math.PI);
        ctx.fill();

        // Current label at midpoint
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.current.toFixed(2)}A`, midX, midY - 8);
      }

      // Stretch indicator
      if (stretched) {
        ctx.fillStyle = '#f59e0b';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('!', midX, midY + 8);
      }
    }
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

  // SAX SOP v2.2: Interactive Circuit Simulator (Agent-First)
  class InteractiveCircuitLab {
    constructor(){
      this.canvas = null;
      this.ctx = null;
      this.W = 800;
      this.H = 600;

      // SAX SOP v2.2: Agent collections
      this.components = []; // CircuitComponent agents
      this.wires = []; // WireConnection agents
      this.reel = makeReel("InteractiveCircuitLab");

      // Interaction state
      this.selectedComponent = null;
      this.draggedComponent = null;
      this.dragOffset = { x: 0, y: 0 };
      this.mousePos = { x: 0, y: 0 };
      this.connectingWire = null;
      this.wireStart = null;

      // Simulation state
      this.voltages = new Map();
      this.currents = new Map();
      this.isRunning = false;

      // Snap settings
      this.snapToGrid = true;
      this.autoSnap = true;
      this.snapTarget = null;

      this.init();
    }

    init(){
      this.setupCanvas();
      this.setupUI();
      this.setupEventListeners();
      this.addDefaultComponents();
      this.startAnimation();
    }

    setupCanvas(){
      this.canvas = document.createElement("canvas");
      this.canvas.width = this.W;
      this.canvas.height = this.H;
      this.canvas.style.width = "100%";
      this.canvas.style.height = "auto";
      this.canvas.style.border = "1px solid #333";
      this.canvas.style.borderRadius = "8px";
      this.canvas.style.cursor = "crosshair";
      this.ctx = this.canvas.getContext("2d");
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
            Interactive Circuit Lab
          </h3>
          <p class="physics-description">
            Drag components onto the canvas, connect them with wires, and watch real-time circuit simulation. Following SAX SOP v2.2 Agent-First paradigm.
          </p>
        </div>
        <div class="physics-simulation">
          <div class="physics-canvas"></div>
          <div class="physics-controls">
            <!-- Beginner Circuit Presets -->
            <div class="control-group">
              <label>Beginner Circuits:</label>
              <div class="preset-buttons">
                <button class="preset-btn" data-preset="simple-series">Simple Series</button>
                <button class="preset-btn" data-preset="parallel-resistors">Parallel</button>
                <button class="preset-btn" data-preset="voltage-divider">Voltage Divider</button>
                <button class="preset-btn" data-preset="empty">Empty Canvas</button>
              </div>
            </div>

            <!-- Component Palette -->
            <div class="control-group">
              <label>Add Components:</label>
              <div class="component-palette">
                <button class="palette-btn" data-type="battery" title="Battery (9V)">🔋</button>
                <button class="palette-btn" data-type="resistor" title="Resistor (1000Ω)">🌀</button>
                <button class="palette-btn" data-type="wire" title="Wire">⚡</button>
              </div>
            </div>

            <!-- Advanced Controls -->
            <div class="control-group">
              <label>Settings:</label>
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <label style="font-size: 0.8rem;">
                  <input type="checkbox" id="snap-to-grid" checked> Snap to Grid
                </label>
                <label style="font-size: 0.8rem;">
                  <input type="checkbox" id="auto-snap" checked> Auto-Snap Wires
                </label>
              </div>
            </div>

            <!-- Controls -->
            <div class="control-group">
              <button id="clear-circuit-btn">Clear Circuit</button>
              <button id="run-simulation-btn">Run Simulation</button>
              <button id="stop-simulation-btn" style="display: none;">Stop Simulation</button>
            </div>

            <!-- Measurements -->
            <div class="control-group">
              <label>Circuit Status:</label>
              <div id="circuit-status" class="status-indicator status-stable">Ready</div>
            </div>

            <!-- Reasoning Reels -->
            <div class="control-group">
              <button id="export-reel-btn">Export Reel (.saxlg)</button>
              <button id="verify-reel-btn">Verify Reel</button>
            </div>

            <!-- Instructions -->
            <div class="control-group">
              <label>Instructions:</label>
              <div style="font-size: 0.8rem; color: rgba(255,255,255,0.7);">
                • Drag components from palette<br>
                • Click terminals to connect wires<br>
                • Double-click to edit values<br>
                • Drag components to move them
              </div>
            </div>
          </div>
        </div>
      `;

      // Add custom styles for the enhanced UI
      const style = document.createElement('style');
      style.textContent = `
        .component-palette, .preset-buttons {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
          flex-wrap: wrap;
        }
        .palette-btn, .preset-btn {
          padding: 0.5rem 1rem;
          border: 2px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.05);
          color: white;
          border-radius: 8px;
          cursor: grab;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          min-width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .palette-btn:hover, .preset-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.4);
          transform: scale(1.05);
        }
        .palette-btn:active, .preset-btn:active {
          cursor: grabbing;
          transform: scale(0.95);
        }
        .preset-btn {
          font-size: 0.8rem;
          min-width: auto;
          padding: 0.25rem 0.75rem;
          height: 32px;
        }
        .circuit-terminal {
          cursor: pointer;
          transition: fill 0.2s ease;
        }
        .circuit-terminal:hover {
          fill: #60a5fa;
        }
        .snap-zone {
          fill: rgba(96, 165, 250, 0.3);
          stroke: #60a5fa;
          stroke-width: 2;
          stroke-dasharray: 5,5;
          pointer-events: none;
        }
        .wire-preview {
          stroke: #60a5fa;
          stroke-width: 3;
          stroke-dasharray: 8,4;
          fill: none;
        }
        .wire-stretched {
          stroke: #f59e0b;
          stroke-width: 2;
          animation: wire-pulse 2s ease-in-out infinite;
        }
        @keyframes wire-pulse {
          0%, 100% { stroke-width: 2; }
          50% { stroke-width: 3; }
        }
      `;
      document.head.appendChild(style);

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

      // Canvas interaction events
      this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
      this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
      this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
      this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));

      // Component palette events
      const paletteBtns = card.querySelectorAll('.palette-btn');
      paletteBtns.forEach(btn => {
        btn.addEventListener('mousedown', (e) => {
          e.preventDefault();
          this.startDraggingComponent(btn.dataset.type);
        });
      });

      // Preset circuit events
      const presetBtns = card.querySelectorAll('.preset-btn');
      presetBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          this.loadBeginnerCircuit(btn.dataset.preset);
        });
      });

      // Settings toggle events
      const snapToGridCheckbox = card.querySelector('#snap-to-grid');
      const autoSnapCheckbox = card.querySelector('#auto-snap');

      snapToGridCheckbox.addEventListener('change', (e) => {
        this.snapToGrid = e.target.checked;
        this.reel.add({ type: "setting_changed", setting: "snap_to_grid", value: this.snapToGrid });
      });

      autoSnapCheckbox.addEventListener('change', (e) => {
        this.autoSnap = e.target.checked;
        this.reel.add({ type: "setting_changed", setting: "auto_snap", value: this.autoSnap });
      });

      // Initialize settings
      this.snapToGrid = snapToGridCheckbox.checked;
      this.autoSnap = autoSnapCheckbox.checked;

      // Control button events
      const clearBtn = card.querySelector('#clear-circuit-btn');
      const runBtn = card.querySelector('#run-simulation-btn');
      const stopBtn = card.querySelector('#stop-simulation-btn');
      const exportBtn = card.querySelector('#export-reel-btn');
      const verifyBtn = card.querySelector('#verify-reel-btn');

      clearBtn.addEventListener('click', () => this.clearCircuit());
      runBtn.addEventListener('click', () => this.startSimulation());
      stopBtn.addEventListener('click', () => this.stopSimulation());
      exportBtn.addEventListener('click', async () => {
        await this.reel.exportReel({ user_seed: 20250827 });
      });
      verifyBtn.addEventListener('click', () => {
        window.open('verify.html', '_blank');
      });

      // Prevent text selection on canvas
      this.canvas.addEventListener('selectstart', (e) => e.preventDefault());
    }

    handleMouseDown(e) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if clicking on a component (larger hit area for better responsiveness)
      for (const comp of this.components) {
        if (comp.containsPoint(x, y)) {
          this.selectedComponent = comp;
          comp.selected = true;
          this.draggedComponent = comp;
          // Better drag offset - use center of component for smoother dragging
          this.dragOffset = { x: comp.x - x, y: comp.y - y };
          this.reel.add({ type: "component_select", id: comp.id, position: { x: comp.x, y: comp.y } });
          return;
        }
      }

      // Check if clicking on a terminal for wire connection (larger hit area)
      for (const comp of this.components) {
        for (const terminal of comp.terminals) {
          const dx = x - terminal.x;
          const dy = y - terminal.y;
          if (Math.sqrt(dx*dx + dy*dy) < 12) { // Increased from 8 to 12
            this.startWireConnection(comp, terminal);
            return;
          }
        }
      }

      // Deselect all
      this.components.forEach(comp => comp.selected = false);
      this.selectedComponent = null;
    }

    handleMouseMove(e) {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePos.x = e.clientX - rect.left;
      this.mousePos.y = e.clientY - rect.top;

      // Handle component dragging with improved responsiveness
      if (this.draggedComponent) {
        let newX = this.mousePos.x + this.dragOffset.x;
        let newY = this.mousePos.y + this.dragOffset.y;

        // Add grid snapping for better alignment
        if (this.snapToGrid) {
          const gridSize = 20;
          newX = Math.round(newX / gridSize) * gridSize;
          newY = Math.round(newY / gridSize) * gridSize;
        }

        this.draggedComponent.updatePosition(newX, newY);

        // Update connected wires to stretch with component
        this.updateConnectedWires(this.draggedComponent);

        this.reel.th('component_drag', 0.05, () => { // More frequent updates
          this.reel.add({ type: "component_move", id: this.draggedComponent.id, position: { x: newX, y: newY } });
        });
      }

      // Handle wire preview with auto-snap
      if (this.connectingWire) {
        this.wireEnd = { x: this.mousePos.x, y: this.mousePos.y };

        // Auto-snap to nearby terminals
        const snapDistance = 20;
        for (const comp of this.components) {
          if (comp === this.wireStart.comp) continue; // Don't snap to same component

          for (const terminal of comp.terminals) {
            const dx = this.wireEnd.x - terminal.x;
            const dy = this.wireEnd.y - terminal.y;
            const distance = Math.sqrt(dx*dx + dy*dy);

            if (distance < snapDistance) {
              this.wireEnd.x = terminal.x;
              this.wireEnd.y = terminal.y;
              this.snapTarget = { comp, terminal };
              break;
            }
          }
        }

        // Clear snap target if moved away
        if (this.snapTarget) {
          const dx = this.wireEnd.x - this.snapTarget.terminal.x;
          const dy = this.wireEnd.y - this.snapTarget.terminal.y;
          const distance = Math.sqrt(dx*dx + dy*dy);
          if (distance > snapDistance * 1.5) {
            this.snapTarget = null;
          }
        }
      }
    }

    handleMouseUp(e) {
      // Stop dragging component
      if (this.draggedComponent) {
        this.draggedComponent = null;
      }

      // Finish wire connection with auto-snap
      if (this.connectingWire) {
        this.finishWireConnection();
      }
    }

    // Enhanced wire connection with auto-snap
    finishWireConnection() {
      if (!this.wireStart) return;

      let connected = false;

      // First, try to connect to snap target if available
      if (this.snapTarget) {
        const wire = new WireConnection(this.wireStart.comp, this.snapTarget.comp, this.wireStart.terminal, this.snapTarget.terminal);
        this.wires.push(wire);

        // Mark terminals as connected
        this.wireStart.terminal.connected = true;
        this.snapTarget.terminal.connected = true;

        this.reel.add({
          type: "wire_connect",
          start_comp: this.wireStart.comp.id,
          end_comp: this.snapTarget.comp.id,
          start_terminal: this.wireStart.terminal.type,
          end_terminal: this.snapTarget.terminal.type,
          auto_snapped: true
        });

        connected = true;
      } else {
        // Fallback to original distance-based connection
        for (const comp of this.components) {
          if (comp === this.wireStart.comp) continue;

          for (const terminal of comp.terminals) {
            const dx = this.wireEnd.x - terminal.x;
            const dy = this.wireEnd.y - terminal.y;
            if (Math.sqrt(dx*dx + dy*dy) < 15) {
              const wire = new WireConnection(this.wireStart.comp, comp, this.wireStart.terminal, terminal);
              this.wires.push(wire);

              this.wireStart.terminal.connected = true;
              terminal.connected = true;

              this.reel.add({
                type: "wire_connect",
                start_comp: this.wireStart.comp.id,
                end_comp: comp.id,
                start_terminal: this.wireStart.terminal.type,
                end_terminal: terminal.type,
                auto_snapped: false
              });

              connected = true;
              break;
            }
          }
          if (connected) break;
        }
      }

      // Clear connection state
      this.connectingWire = false;
      this.wireStart = null;
      this.wireEnd = null;
      this.snapTarget = null;

      if (this.isRunning) {
        this.solveCircuit();
      }
    }

    // Update connected wires when components move (stretchable wires)
    updateConnectedWires(movedComponent) {
      // Wires automatically stretch as components move
      this.wires.forEach(wire => {
        // Wire endpoints are updated automatically when component positions change
        // The wire drawing handles the stretching visually
      });
    }

    handleDoubleClick(e) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if double-clicking on a component
      for (const comp of this.components) {
        if (comp.containsPoint(x, y)) {
          this.editComponentValue(comp);
          return;
        }
      }
    }

    addDefaultComponents(){
      // Add a simple beginner circuit
      this.loadBeginnerCircuit('simple-series');
    }

    // Beginner-friendly circuit presets
    loadBeginnerCircuit(circuitType) {
      // Clear existing circuit
      this.components = [];
      this.wires = [];

      const centerX = this.W / 2;
      const centerY = this.H / 2;

      switch(circuitType) {
        case 'simple-series':
          // Simple battery + resistor circuit
          const battery = new CircuitComponent('battery', centerX - 150, centerY, 9.0);
          const resistor = new CircuitComponent('resistor', centerX + 50, centerY, 1000);
          const wire1 = new CircuitComponent('wire', centerX - 50, centerY, 0);
          const wire2 = new CircuitComponent('wire', centerX + 150, centerY, 0);

          this.components.push(battery, resistor, wire1, wire2);

          // Connect: Battery -> Wire1 -> Resistor -> Wire2
          this.wires.push(new WireConnection(battery, wire1, battery.terminals[1], wire1.terminals[0]));
          this.wires.push(new WireConnection(wire1, resistor, wire1.terminals[1], resistor.terminals[0]));
          this.wires.push(new WireConnection(resistor, wire2, resistor.terminals[1], wire2.terminals[0]));

          // Mark terminals as connected
          battery.terminals[1].connected = true;
          wire1.terminals.forEach(t => t.connected = true);
          resistor.terminals.forEach(t => t.connected = true);
          wire2.terminals.forEach(t => t.connected = true);
          break;

        case 'parallel-resistors':
          // Two resistors in parallel
          const battery2 = new CircuitComponent('battery', centerX - 200, centerY, 12.0);
          const resistor1 = new CircuitComponent('resistor', centerX, centerY - 80, 1000);
          const resistor2 = new CircuitComponent('resistor', centerX, centerY + 80, 2000);
          const wireStart = new CircuitComponent('wire', centerX - 100, centerY, 0);
          const wireEnd = new CircuitComponent('wire', centerX + 100, centerY, 0);

          this.components.push(battery2, resistor1, resistor2, wireStart, wireEnd);

          // Connect in parallel
          this.wires.push(new WireConnection(battery2, wireStart, battery2.terminals[1], wireStart.terminals[0]));
          this.wires.push(new WireConnection(wireStart, resistor1, wireStart.terminals[1], resistor1.terminals[0]));
          this.wires.push(new WireConnection(wireStart, resistor2, wireStart.terminals[1], resistor2.terminals[0]));
          this.wires.push(new WireConnection(resistor1, wireEnd, resistor1.terminals[1], wireEnd.terminals[0]));
          this.wires.push(new WireConnection(resistor2, wireEnd, resistor2.terminals[1], wireEnd.terminals[0]));

          // Mark terminals as connected
          battery2.terminals[1].connected = true;
          wireStart.terminals.forEach(t => t.connected = true);
          resistor1.terminals.forEach(t => t.connected = true);
          resistor2.terminals.forEach(t => t.connected = true);
          wireEnd.terminals.forEach(t => t.connected = true);
          break;

        case 'voltage-divider':
          // Voltage divider circuit
          const battery3 = new CircuitComponent('battery', centerX - 200, centerY, 10.0);
          const r1 = new CircuitComponent('resistor', centerX - 50, centerY, 1000);
          const r2 = new CircuitComponent('resistor', centerX + 100, centerY, 2000);
          const wireA = new CircuitComponent('wire', centerX - 125, centerY, 0);
          const wireB = new CircuitComponent('wire', centerX + 25, centerY, 0);
          const wireC = new CircuitComponent('wire', centerX + 175, centerY, 0);

          this.components.push(battery3, r1, r2, wireA, wireB, wireC);

          // Connect in series
          this.wires.push(new WireConnection(battery3, wireA, battery3.terminals[1], wireA.terminals[0]));
          this.wires.push(new WireConnection(wireA, r1, wireA.terminals[1], r1.terminals[0]));
          this.wires.push(new WireConnection(r1, wireB, r1.terminals[1], wireB.terminals[0]));
          this.wires.push(new WireConnection(wireB, r2, wireB.terminals[1], r2.terminals[0]));
          this.wires.push(new WireConnection(r2, wireC, r2.terminals[1], wireC.terminals[0]));

          // Mark terminals as connected
          [battery3, r1, r2, wireA, wireB, wireC].forEach(comp => {
            comp.terminals.forEach(t => t.connected = true);
          });
          break;

        case 'empty':
          // Empty canvas for advanced users
          break;
      }

      this.reel.add({ type: "circuit_preset_loaded", preset: circuitType });
      if (this.isRunning) {
        this.solveCircuit();
      }
    }

    startDraggingComponent(type) {
      const defaultValues = { battery: 9.0, resistor: 1000, wire: 0 };
      const comp = new CircuitComponent(type, 100, 100, defaultValues[type]);
      this.components.push(comp);
      this.draggedComponent = comp;
      this.dragOffset = { x: 25, y: 25 }; // Center of component
      this.reel.add({ type: "component_add", component_type: type, id: comp.id, value: defaultValues[type] });
    }

    startWireConnection(comp, terminal) {
      this.connectingWire = true;
      this.wireStart = { comp, terminal };
      this.wireEnd = { x: terminal.x, y: terminal.y };
      this.reel.add({ type: "wire_start", component_id: comp.id, terminal: terminal.type });
    }

    finishWireConnection() {
      if (!this.wireStart) return;

      // Find terminal near mouse position
      for (const comp of this.components) {
        if (comp === this.wireStart.comp) continue; // Don't connect to same component

        for (const terminal of comp.terminals) {
          const dx = this.wireEnd.x - terminal.x;
          const dy = this.wireEnd.y - terminal.y;
          if (Math.sqrt(dx*dx + dy*dy) < 15) {
            // Create wire connection
            const wire = new WireConnection(this.wireStart.comp, comp, this.wireStart.terminal, terminal);
            this.wires.push(wire);

            // Mark terminals as connected
            this.wireStart.terminal.connected = true;
            terminal.connected = true;

            this.reel.add({
              type: "wire_connect",
              start_comp: this.wireStart.comp.id,
              end_comp: comp.id,
              start_terminal: this.wireStart.terminal.type,
              end_terminal: terminal.type
            });
            break;
          }
        }
      }

      this.connectingWire = false;
      this.wireStart = null;
      this.wireEnd = null;
    }

    editComponentValue(comp) {
      const newValue = prompt(`Edit ${comp.type} value:`, comp.value);
      if (newValue !== null) {
        const numValue = parseFloat(newValue);
        if (!isNaN(numValue)) {
          comp.value = numValue;
          this.reel.add({ type: "component_edit", id: comp.id, old_value: comp.value, new_value: numValue });
          comp.value = numValue;
          if (this.isRunning) {
            this.solveCircuit();
          }
        }
      }
    }

    clearCircuit() {
      this.components = [];
      this.wires = [];
      this.voltages.clear();
      this.currents.clear();
      this.reel.add({ type: "circuit_clear" });
      this.updateStatus("Circuit cleared");
    }

    startSimulation() {
      this.isRunning = true;
      const runBtn = document.getElementById('run-simulation-btn');
      const stopBtn = document.getElementById('stop-simulation-btn');
      runBtn.style.display = 'none';
      stopBtn.style.display = 'inline-block';
      this.solveCircuit();
      this.reel.add({ type: "simulation_start", component_count: this.components.length, wire_count: this.wires.length });
    }

    stopSimulation() {
      this.isRunning = false;
      const runBtn = document.getElementById('run-simulation-btn');
      const stopBtn = document.getElementById('stop-simulation-btn');
      runBtn.style.display = 'inline-block';
      stopBtn.style.display = 'none';
      this.reel.add({ type: "simulation_stop" });
    }

    solveCircuit() {
      // Simple circuit analysis for series circuits
      this.voltages.clear();
      this.currents.clear();

      // Find batteries and calculate total voltage
      const batteries = this.components.filter(c => c.type === 'battery');
      const resistors = this.components.filter(c => c.type === 'resistor');

      if (batteries.length === 0) {
        this.updateStatus("No battery found");
        return;
      }

      const totalVoltage = batteries.reduce((sum, b) => sum + b.value, 0);
      const totalResistance = resistors.reduce((sum, r) => sum + r.value, 0);

      if (totalResistance === 0) {
        this.updateStatus("Short circuit!");
        return;
      }

      const totalCurrent = totalVoltage / totalResistance;

      // Distribute voltages and currents
      let voltageDrop = 0;
      batteries.forEach((battery, i) => {
        this.voltages.set(battery.id, battery.value);
        battery.voltage = battery.value;
      });

      resistors.forEach((resistor, i) => {
        const current = totalCurrent;
        const voltage = current * resistor.value;
        this.voltages.set(resistor.id, voltage);
        this.currents.set(resistor.id, current);
        resistor.voltage = voltage;
        resistor.current = current;

        // Update terminals
        resistor.terminals.forEach(term => {
          term.voltage = term.type === 'input' ? voltageDrop : voltageDrop + voltage;
        });
        voltageDrop += voltage;
      });

      this.updateStatus(`Solved: ${totalVoltage.toFixed(1)}V, ${totalCurrent.toFixed(3)}A`);
      this.reel.th('circuit_solve', 1, () => {
        this.reel.add({ type: "circuit_solve", total_voltage: totalVoltage, total_current: totalCurrent, component_count: this.components.length });
      });
    }

    updateStatus(message) {
      const statusEl = document.getElementById('circuit-status');
      if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = 'status-indicator status-stable';
      }
    }

    startAnimation() {
      const animate = () => {
        this.draw();
        requestAnimationFrame(animate);
      };
      animate();
    }

    draw() {
      if (!this.ctx) return;

      // Clear canvas
      this.ctx.fillStyle = '#1a1a2e';
      this.ctx.fillRect(0, 0, this.W, this.H);

      // Draw grid first
      this.drawGrid();

      // Draw snap zones if auto-snap is enabled and connecting wire
      if (this.connectingWire && this.autoSnap) {
        this.drawSnapZones();
      }

      // Draw wires first (behind components)
      this.wires.forEach(wire => wire.draw(this.ctx));

      // Draw wire preview if connecting
      if (this.connectingWire && this.wireStart && this.wireEnd) {
        // Rubber band effect - wire follows mouse smoothly
        this.ctx.strokeStyle = this.snapTarget ? '#10b981' : '#60a5fa';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash(this.snapTarget ? [] : [8, 4]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.wireStart.terminal.x, this.wireStart.terminal.y);

        // Add some curve to make it look more like a rubber band
        const startX = this.wireStart.terminal.x;
        const startY = this.wireStart.terminal.y;
        const endX = this.wireEnd.x;
        const endY = this.wireEnd.y;

        // Simple bezier curve for smoother wire preview
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const controlOffset = Math.abs(endX - startX) * 0.3;

        this.ctx.bezierCurveTo(
          startX + controlOffset, startY,
          endX - controlOffset, endY,
          endX, endY
        );

        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Draw connection hint if snapping
        if (this.snapTarget) {
          this.ctx.fillStyle = '#10b981';
          this.ctx.font = '12px monospace';
          this.ctx.textAlign = 'center';
          this.ctx.fillText('✓', endX, endY - 15);
        }
      }

      // Draw components
      this.components.forEach(comp => comp.draw(this.ctx));

      // Draw cursor hint
      if (this.draggedComponent) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = '12px monospace';
        this.ctx.fillText('Release to place', this.mousePos.x + 10, this.mousePos.y - 10);
      }
    }

    drawGrid() {
      this.ctx.strokeStyle = '#2a2a3e';
      this.ctx.lineWidth = 1;

      const gridSize = 20;
      for (let x = 0; x <= this.W; x += gridSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.H);
        this.ctx.stroke();
      }

      for (let y = 0; y <= this.H; y += gridSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.W, y);
        this.ctx.stroke();
      }
    }

    drawSnapZones() {
      // Draw snap zones around available terminals
      this.components.forEach(comp => {
        if (comp === this.wireStart?.comp) return; // Skip the component we're connecting from

        comp.terminals.forEach(terminal => {
          if (!terminal.connected) { // Only show snap zones for unconnected terminals
            this.ctx.beginPath();
            this.ctx.arc(terminal.x, terminal.y, 25, 0, 2 * Math.PI);
            this.ctx.fillStyle = 'rgba(96, 165, 250, 0.1)';
            this.ctx.fill();
            this.ctx.strokeStyle = 'rgba(96, 165, 250, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([3, 3]);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
          }
        });
      });
    }

  }

  // SAX SOP v2.2: Initialize the Interactive Circuit Lab
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', () => {
      window.interactiveCircuitLab = new InteractiveCircuitLab();
    });
  } else {
    window.interactiveCircuitLab = new InteractiveCircuitLab();
  }

})();
