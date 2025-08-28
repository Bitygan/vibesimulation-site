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

      ctx.strokeStyle = this.current > 0 ? '#3b82f6' : '#6b7280';
      ctx.lineWidth = this.current > 0 ? 3 : 2;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      // Current flow indicator (animated)
      if (this.current > 0) {
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        const time = Date.now() * 0.01;
        const offset = Math.sin(time) * 5;

        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(midX + offset, midY, 2, 0, 2 * Math.PI);
        ctx.fill();

        // Current label
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.current.toFixed(2)}A`, midX, midY - 8);
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
            <!-- Component Palette -->
            <div class="control-group">
              <label>Components:</label>
              <div class="component-palette">
                <button class="palette-btn" data-type="battery" title="Battery (9V)">🔋</button>
                <button class="palette-btn" data-type="resistor" title="Resistor (100Ω)">🌀</button>
                <button class="palette-btn" data-type="wire" title="Wire">⚡</button>
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

      // Add custom styles for the palette
      const style = document.createElement('style');
      style.textContent = `
        .component-palette {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        .palette-btn {
          width: 40px;
          height: 40px;
          border: 2px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.05);
          color: white;
          border-radius: 8px;
          cursor: grab;
          font-size: 1.2rem;
          transition: all 0.3s ease;
        }
        .palette-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.4);
          transform: scale(1.05);
        }
        .palette-btn:active {
          cursor: grabbing;
          transform: scale(0.95);
        }
        .circuit-terminal {
          cursor: pointer;
        }
        .circuit-terminal:hover {
          fill: #60a5fa;
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

      // Check if clicking on a component
      for (const comp of this.components) {
        if (comp.containsPoint(x, y)) {
          this.selectedComponent = comp;
          comp.selected = true;
          this.draggedComponent = comp;
          this.dragOffset = { x: x - comp.x, y: y - comp.y };
          this.reel.add({ type: "component_select", id: comp.id, position: { x: comp.x, y: comp.y } });
          return;
        }
      }

      // Check if clicking on a terminal for wire connection
      for (const comp of this.components) {
        for (const terminal of comp.terminals) {
          const dx = x - terminal.x;
          const dy = y - terminal.y;
          if (Math.sqrt(dx*dx + dy*dy) < 8) {
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

      // Handle component dragging
      if (this.draggedComponent) {
        const newX = this.mousePos.x - this.dragOffset.x;
        const newY = this.mousePos.y - this.dragOffset.y;
        this.draggedComponent.updatePosition(newX, newY);
        this.reel.th('component_drag', 0.1, () => {
          this.reel.add({ type: "component_move", id: this.draggedComponent.id, position: { x: newX, y: newY } });
        });
      }

      // Handle wire preview
      if (this.connectingWire) {
        this.wireEnd = { x: this.mousePos.x, y: this.mousePos.y };
      }
    }

    handleMouseUp(e) {
      // Stop dragging component
      if (this.draggedComponent) {
        this.draggedComponent = null;
      }

      // Finish wire connection
      if (this.connectingWire) {
        this.finishWireConnection();
      }
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
      // Add a simple default circuit
      const battery = new CircuitComponent('battery', 200, 200, 9.0);
      const resistor = new CircuitComponent('resistor', 400, 200, 1000);
      const wire = new CircuitComponent('wire', 300, 200, 0);

      this.components.push(battery, resistor, wire);

      // Connect with wires
      this.wires.push(new WireConnection(battery, wire, battery.terminals[1], wire.terminals[0]));
      this.wires.push(new WireConnection(wire, resistor, wire.terminals[1], resistor.terminals[0]));

      // Mark terminals as connected
      battery.terminals[1].connected = true;
      wire.terminals[0].connected = true;
      wire.terminals[1].connected = true;
      resistor.terminals[0].connected = true;
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

      // Draw grid
      this.drawGrid();

      // Draw wires first (behind components)
      this.wires.forEach(wire => wire.draw(this.ctx));

      // Draw wire preview if connecting
      if (this.connectingWire && this.wireStart && this.wireEnd) {
        this.ctx.strokeStyle = '#60a5fa';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.wireStart.terminal.x, this.wireStart.terminal.y);
        this.ctx.lineTo(this.wireEnd.x, this.wireEnd.y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
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
