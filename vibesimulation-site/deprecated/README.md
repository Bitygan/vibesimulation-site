# 🚫 Deprecated Simulations

This folder contains simulations that have been removed from the main VibeSimulation build for various reasons.

## Circuit Lab - DEPRECATED

### **Status:** Removed from active build (August 2025)

### **What it was:**
An interactive circuit simulation featuring:
- Drag-and-drop component placement (batteries, resistors, light bulbs, switches, wires)
- Real-time circuit analysis using Modified Nodal Analysis (MNA)
- Educational presets for beginners
- Cartoon-realistic visual design inspired by PhET
- SAX SOP v2.2 compliance with Reasoning Reels
- Tamper-evident recording with SHA-256 hash-chains and Ed25519 signatures

### **Why removed:**
- **Loading Issues:** Complex initialization causing "Circuit Lab engine failed to initialize" errors
- **Performance Impact:** Large JavaScript bundle (73KB) affecting main page load times
- **Complexity:** High maintenance burden for a non-core physics simulation
- **Focus Shift:** Streamlining to core physics simulations (Fluid Dynamics, Electrostatics, Wave Physics, Drag Rangefinder)

### **Files:**
- `circuit_lab.js` - Main simulation engine (74KB)
- `CIRCUIT_LAB_README.md` - Comprehensive documentation
- `circuit-lab.html` - Dedicated page (if exists)

### **Replacement:**
The main navigation now features **Drag Rangefinder** instead of Circuit Lab, providing:
- Projectile motion with realistic air resistance
- Comparison of quadratic vs linear drag models
- Wind effects and numerical integration methods
- Real-time trajectory visualization

### **Recovery:**
If you need to restore Circuit Lab in the future:
1. Move files back to root directory
2. Update main navigation to include Circuit Lab link
3. Resolve the initialization issues that caused removal
4. Consider code splitting for better performance

### **Lessons Learned:**
- Complex interactive simulations need thorough testing before integration
- Large JavaScript bundles should be lazy-loaded or split
- User experience trumps feature completeness
- Focus on core competencies rather than feature bloat

---

## Advanced Optics - DEPRECATED

### **Status:** Removed from active build (August 28, 2025)

### **What it was:**
An advanced optical physics simulation featuring:
- **Ray Tracing Engine**: Real-time light propagation through optical systems
- **Lens Systems**: Convex/concave lenses with accurate focal point calculations
- **Diffraction Patterns**: Single/double/multiple slit interference with intensity visualization
- **Interactive Controls**: Real-time parameter adjustment (wavelength, focal length, ray count)
- **Dynamic Visual Effects**: Pulsing rays, glowing elements, animated background
- **Educational Interface**: Learning panels explaining optical principles
- **Basic Reasoning Reels**: SHA-256 hash chaining and Ed25519 signatures

### **Why removed:**
- **❌ SAX SOP v2.2 Non-Compliance**: Fundamental architectural violations
  - No paradigm declaration (Agent-First vs Simulation-First)
  - Used custom JavaScript classes instead of canonical `SAX_Simulator`, `SimulatorAgent`
  - Missing declarative intent and operator-centric ontology
  - No computational alliance (pure JavaScript instead of specialized libraries)
  - Incomplete Reasoning Reels integration (missing v2.2 statistical assurance)
- **Architectural Integrity**: Departure from established IP framework
- **Methodological Consistency**: Violated core engineering principles

### **Files:**
- `ADVANCED_OPTICS_README.md` - Complete documentation and compliance analysis
- `advanced-optics.html` - Main simulation page (removed from production)

### **Compliance Assessment:**
**Overall Score: 15% (Non-Compliant)**
- ✅ Systemic Causality: Emergent behavior from optical physics
- ❌ All other principles: Major architectural violations

### **Recovery:**
If Advanced Optics is to be re-implemented, it must achieve **full SAX SOP v2.2 compliance** using:
1. **Simulation-First Paradigm** declaration
2. **SAX_Simulator** for headless ray tracing physics
3. **SimulatorAgent** for visual rendering
4. **Declarative Choreography Layer**
5. **Complete v2.2 Ledger Integration**

### **Lessons Learned:**
- Architectural compliance must be prioritized over feature completeness
- Custom implementations cannot substitute for canonical agent classes
- Intellectual property integrity requires strict adherence to established protocols
- Experimental implementations should be clearly documented for future reference

---

**VibeSimulation continues to focus on delivering high-quality, performant physics simulations.** 🌊⚡🎵🎯

