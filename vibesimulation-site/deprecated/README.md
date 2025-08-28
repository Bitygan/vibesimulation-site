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

**VibeSimulation continues to focus on delivering high-quality, performant physics simulations.** 🌊⚡🎵🎯

