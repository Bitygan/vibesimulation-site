# Interactive Circuit Lab (SAX SOP v2.2) — Interactive Phase

**Following SAX Foundational SOP v2.2.md Principles:**
- **Agent-First Paradigm:** Discrete component agents with autonomous behavior
- **Deterministic Seeding:** Reasoning Reels with tamper-evident hash-chains
- **Real-time Collaborative Simulation:** Live circuit analysis with visual feedback
- **Tamper-evident Recording:** SHA-256 hash-chain + Ed25519 signatures

## 🎯 **Interactive Features (Cartoon-Realistic Design)**

### **Drag-and-Drop Interface**
- **Component Palette:** Drag batteries, resistors, light bulbs, switches, and wires onto the canvas
- **Visual Connections:** Click component terminals to create wire connections with auto-snap
- **Real-time Movement:** Drag components around with stretchable wires
- **Interactive Editing:** Double-click components to edit values
- **Grid Snapping:** Optional magnetic grid alignment (20px grid)
- **Centered Placement:** Components appear in the middle of the canvas for optimal visibility

### **Live Circuit Simulation**
- **Real-time Analysis:** Instant voltage and current calculations using Kirchhoff's laws
- **Visual Feedback:** See voltages at terminals and animated current flow
- **Circuit Validation:** Automatic detection of short/open circuits
- **Temperature Effects:** Resistor heating based on power dissipation
- **Ammeter Display:** Real-time current measurement with color coding
- **Switch Logic:** Toggle switches break/complete circuits dynamically

### **Cartoon-Realistic Visual Design**
- **Realistic Battery:** AA battery design with terminals and labeling
- **Ceramic Resistor:** Purple ceramic body with color bands and wire leads
- **Glowing Light Bulb:** Animated filament with brightness-based glow effects
- **Toggle Switch:** Mechanical switch with ON/OFF indicator
- **Insulated Wires:** Realistic insulated conductors with current flow

### **Interactive Components**
- **Light Bulb:** Glows based on current (0-100% brightness)
- **Toggle Switch:** Double-click to turn ON/OFF, breaks circuit when OFF
- **Battery:** Realistic 9V battery with voltage/current display
- **Resistor:** Temperature-dependent color with resistance bands
- **Wire:** Current-responsive styling with electron flow animation

### **Real-time Controls (Professional Style)**
- **Voltage Slider:** 0-15V battery voltage control with live display
- **Resistance Slider:** 100-5000Ω resistor value control
- **Ammeter:** Professional-style current measurement with color coding
- **Educational Views:** Toggle electron flow, voltage math, temperature display

### **Reasoning Reels Integration**
- **Tamper-evident Recording:** Every interaction cryptographically signed
- **Complete Audit Trail:** Component placement, connections, value changes
- **Educational Assessment:** Track learning patterns and problem-solving
- **Scientific Reproducibility:** Deterministic replay capabilities

## 🔧 **Example Circuits**

### **Beginner Circuits**
1. **Battery + Resistor** - Basic Ohm's Law demonstration
2. **Parallel Circuit** - Current division concepts
3. **Voltage Divider** - Thevenin equivalent circuits
4. **Light Bulb** - Filament resistance and brightness
5. **Switch + Light** - Circuit control and power switching
6. **Empty Canvas** - Advanced experimentation

### **Circuit Building Tutorial**
1. **Start Simple:** Try "Battery + Resistor" to see basic voltage/current
2. **Add Control:** Use "Switch + Light" to learn about circuit breaking
3. **Explore Parallel:** Build parallel circuits to understand current division
4. **Advanced:** Create custom circuits with multiple components

## 📁 **Files**

- `circuit-lab.html` — Dedicated page for the Interactive Circuit Lab
- `circuit_lab.js` — Interactive drag-and-drop circuit simulator with SAX SOP v2.2 compliance
- `recorder_circuit_patch.js` — Optional patch for existing Reasoning Reels setup
- `test-circuit-lab.html` — Test suite to verify functionality
- `debug-circuit.html` — Debug tools for troubleshooting
- `debug-circuit-simple.html` — Simple debug guide
- (Assumes `verify.html` exists for reel verification)

## 🚀 **Installation & Usage**

### **Option 1: Separate Page (Recommended for Performance)**

1. **Copy files** to your website root:
   - `circuit-lab.html` (main page)
   - `circuit_lab.js` (simulation engine)
   - `recorder.js` (reasoning reels)
   - `recorder_circuit_patch.js` (optional)

2. **Add navigation link** to your main site:
   ```html
   <a href="circuit-lab.html" class="nav-link">Circuit Lab</a>
   ```

3. **Access the Circuit Lab** by clicking the navigation link

### **Option 2: Embedded in Main Page**

1. Copy files next to your `index.html`
2. Add to the end of your HTML:
   ```html
   <script src="circuit_lab.js"></script>
   <script src="recorder_circuit_patch.js"></script>
   ```

## ⚡ **Performance Benefits**

### **Separate Page Approach:**
- **Faster Main Page Load** — No heavy circuit simulation on homepage
- **Better User Experience** — Dedicated space for complex interaction
- **Reduced Memory Usage** — Circuit Lab loads only when needed
- **Improved SEO** — Main page focuses on core simulations
- **Progressive Enhancement** — Users can explore circuits at their own pace

### **When to Use Each Approach:**

| Approach | Best For | Performance Impact |
|----------|----------|-------------------|
| **Separate Page** | Production sites, large audiences | ✅ Excellent |
| **Embedded** | Small demos, single-page apps | ⚠️ Higher load time |

## 🎯 **Quick Start**

1. **Navigate to Circuit Lab** from your main site
2. **Choose an example circuit** from the dropdown
3. **Drag components** onto the canvas
4. **Connect with wires** by clicking terminals
5. **Toggle switches** to control circuits
6. **Watch light bulbs glow** based on current!

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
