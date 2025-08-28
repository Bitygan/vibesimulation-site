# Interactive Circuit Lab (SAX SOP v2.2) — Interactive Phase

**Following SAX Foundational SOP v2.2.md Principles:**
- **Agent-First Paradigm:** Discrete component agents with autonomous behavior
- **Deterministic Seeding:** Reasoning Reels with tamper-evident hash-chains
- **Real-time Collaborative Simulation:** Live circuit analysis with visual feedback
- **Tamper-evident Recording:** SHA-256 hash-chain + Ed25519 signatures

## 🎯 **Interactive Features**

### **Drag-and-Drop Interface**
- **Component Palette:** Drag batteries, resistors, and wires onto the canvas
- **Visual Connections:** Click component terminals to create wire connections
- **Real-time Movement:** Drag components around the canvas to reposition them
- **Interactive Editing:** Double-click components to edit their values

### **Live Circuit Simulation**
- **Real-time Analysis:** Instant voltage and current calculations
- **Visual Feedback:** See voltages at terminals and current flow in wires
- **Circuit Validation:** Automatic detection of open/short circuits
- **Animated Current:** Flowing current indicators in active circuits

### **Reasoning Reels Integration**
- **Tamper-evident Recording:** Every interaction is cryptographically signed
- **Export Capability:** Download `.saxlg` files with complete interaction history
- **Verification:** Built-in verification against tampering
- **Educational Tracking:** Record student circuit-building patterns

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

## 🎯 **Perfect for PhET-Style Learning**

This implementation provides the same interactive, exploratory learning experience as PhET simulations:

- **Visual Circuit Building:** Drag-and-drop component placement
- **Immediate Feedback:** Real-time voltage and current display
- **Scientific Rigor:** Tamper-evident recording capabilities
- **Educational Focus:** Clear visual representations of electrical concepts
- **Progressive Learning:** Start with simple circuits, build to complex ones

## 🔐 **Reasoning Reels Features**

- **Complete Audit Trail:** Every component placement, connection, and value change
- **Tamper Detection:** Cryptographic verification of interaction authenticity
- **Educational Assessment:** Track student problem-solving patterns
- **Scientific Reproducibility:** Deterministic replay of circuit construction
- **Export Format:** Standards-compliant `.saxlg` files with full metadata

---

*Interactive Circuit Lab v2.2 - Making Circuit Analysis Scientifically Interactive and Reproducible!* ⚡🔬✨
