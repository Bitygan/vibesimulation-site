# Interactive Circuit Lab (SAX SOP v2.2) — Interactive Phase

**Following SAX Foundational SOP v2.2.md Principles:**
- **Agent-First Paradigm:** Discrete component agents with autonomous behavior
- **Deterministic Seeding:** Reasoning Reels with tamper-evident hash-chains
- **Real-time Collaborative Simulation:** Live circuit analysis with visual feedback
- **Tamper-evident Recording:** SHA-256 hash-chain + Ed25519 signatures

## 🎯 **Interactive Features (PhET-Inspired)**

### **Drag-and-Drop Interface**
- **Component Palette:** Drag batteries, resistors, and wires onto the canvas
- **Visual Connections:** Click component terminals to create wire connections with auto-snap
- **Real-time Movement:** Drag components around with stretchable wires
- **Interactive Editing:** Double-click components to edit values
- **Grid Snapping:** Optional magnetic grid alignment (20px grid)

### **Live Circuit Simulation**
- **Real-time Analysis:** Instant voltage and current calculations using Kirchhoff's laws
- **Visual Feedback:** See voltages at terminals and animated current flow
- **Circuit Validation:** Automatic detection of short/open circuits
- **Temperature Effects:** Resistor heating based on power dissipation
- **Ammeter Display:** Real-time current measurement with color coding

### **PhET-Inspired Educational Views**
- **Electron Flow:** Animated particle-level current visualization
- **Battery Chemistry:** Internal electrode and electrolyte visualization
- **Resistor Cores:** Purple internal structure representation
- **Voltage Mathematics:** Live Ohm's Law calculations overlay
- **Temperature Display:** Color-coded heating effects

### **Real-time Controls (PhET Style)**
- **Voltage Slider:** 0-15V battery voltage control
- **Resistance Slider:** 100-5000Ω resistor value control
- **Ammeter:** Professional-style current measurement display
- **Temperature Toggle:** Show resistor heating effects

### **Reasoning Reels Integration**
- **Tamper-evident Recording:** Every interaction cryptographically signed
- **Complete Audit Trail:** Component placement, connections, value changes
- **Educational Assessment:** Track learning patterns and problem-solving
- **Scientific Reproducibility:** Deterministic replay capabilities

## 📁 **Files**

- `circuit_lab.js` — Interactive drag-and-drop circuit simulator with SAX SOP v2.2 compliance
- `recorder_circuit_patch.js` — Optional patch for existing Reasoning Reels setup
- (Assumes `verify.html` exists for reel verification)

## 🚀 **Installation**

1. Copy files next to your `index.html`
2. Add to the end of your HTML:
   ```html
   <script src="circuit_lab.js"></script>
   <script src="recorder_circuit_patch.js"></script>
   ```

## 🎮 **User Experience**

### **Building Circuits**
1. **Drag Components:** Click and drag from the component palette
2. **Connect Wires:** Click on component terminals to start connections
3. **Edit Values:** Double-click components to change battery voltage or resistance
4. **Run Simulation:** Click "Run Simulation" to analyze the circuit
5. **Export Reel:** Download tamper-evident recording of your work

### **Visual Elements**
- **Grid Background:** Helps with component alignment
- **Terminal Indicators:** Small circles showing connection points
- **Voltage Labels:** Real-time voltage display at each terminal
- **Current Flow:** Animated indicators in connected wires
- **Component Symbols:** Professional circuit diagram symbols

## 🔬 **Educational Value**

### **Circuit Theory Concepts**
- **Ohm's Law:** V = IR relationships
- **Series Circuits:** Voltage division and current conservation
- **Component Behavior:** Battery voltage sources, resistor current-voltage relationships
- **Circuit Analysis:** Systematic approach to solving DC circuits

### **Interactive Learning**
- **Immediate Feedback:** See results of circuit changes instantly
- **Experimentation:** Try different configurations safely
- **Verification:** Export scientifically reproducible results
- **Progressive Disclosure:** Start simple, build complexity gradually

## ⚡ **Technical Implementation**

### **SAX SOP v2.2 Compliance**
- **Agent-First:** Each component is an autonomous agent with state and behavior
- **Deterministic RNG:** Seeded random number generation for reproducibility
- **Hash-chain Integrity:** SHA-256 hash-chain with Ed25519 signatures
- **Event Recording:** Complete interaction history with timestamps

### **Circuit Analysis Engine**
- **DC Analysis:** Kirchhoff's voltage and current laws
- **Real-time Solving:** Instant recalculation on circuit changes
- **Component Models:** Accurate electrical behavior simulation
- **Error Detection:** Short circuit and open circuit detection

### **Performance Optimized**
- **Canvas Rendering:** Hardware-accelerated graphics
- **Efficient Updates:** Only recalculate when circuit changes
- **Memory Efficient:** Minimal memory footprint
- **Smooth Animation:** 60fps interaction and animation

## 🧪 **PhET-Inspired Educational Excellence**

This implementation draws direct inspiration from PhET's award-winning battery-resistor circuit simulation, incorporating their proven educational design principles:

### **Multi-Level Learning Approach**
- **Conceptual Level:** Abstract circuit symbols and connections
- **Mathematical Level:** Live Ohm's Law calculations (V = IR)
- **Particle Level:** Animated electron flow visualization
- **Phenomenological Level:** Temperature and power effects

### **Progressive Disclosure**
Following PhET's methodology:
- **Basic View:** Simple circuit symbols and measurements
- **Intermediate View:** Electron flow and voltage mathematics
- **Advanced View:** Internal component structures and chemistry
- **Expert View:** Real-time parameter control and analysis

### **Interactive Exploration**
- **Playful Discovery:** Drag components and see immediate effects
- **Parameter Variation:** Sliders for voltage and resistance control
- **Visual Feedback:** Color-coded current levels and temperature
- **Multiple Representations:** Numerical, visual, and conceptual displays

### **Scientific Accuracy**
- **Kirchhoff's Laws:** Proper circuit analysis implementation
- **Power Calculations:** P = V × I with temperature effects
- **Realistic Values:** Industry-standard component ranges
- **Physical Scaling:** Appropriate current and voltage magnitudes

## 🎯 **Perfect for PhET-Style Learning**

This implementation provides the same interactive, exploratory learning experience as PhET simulations:

- **Visual Circuit Building:** Drag-and-drop component placement
- **Immediate Feedback:** Real-time voltage and current display
- **Scientific Rigor:** Tamper-evident recording capabilities
- **Educational Focus:** Clear visual representations of electrical concepts
- **Progressive Learning:** Start with simple circuits, build to complex ones
- **Research-Based Design:** Grounded in PhET's proven pedagogy

## 🔐 **Reasoning Reels Features**

- **Complete Audit Trail:** Every component placement, connection, and value change
- **Tamper Detection:** Cryptographic verification of interaction authenticity
- **Educational Assessment:** Track student problem-solving patterns
- **Scientific Reproducibility:** Deterministic replay of circuit construction
- **Export Format:** Standards-compliant `.saxlg` files with full metadata

---

*Interactive Circuit Lab v2.2 - Making Circuit Analysis Scientifically Interactive and Reproducible!* ⚡🔬✨
