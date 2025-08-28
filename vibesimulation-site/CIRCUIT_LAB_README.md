# Circuit Lab (SAX SOP v2.2) — Phase 1

**Files**
- `circuit_lab.js` — DC solver + UI + built‑in Reasoning Reel export
- `recorder_circuit_patch.js` — optional; ensures a Verify button if your global recorder isn't present
- (Assumes `verify.html` already exists; if not, ask and I'll include it.)

**Install**
1. Copy `circuit_lab.js` next to your `index.html`.
2. Add at the end of your page:
   ```html
   <script src="circuit_lab.js"></script>
   ```
3. Optional (if using `recorder.js` already):
   ```html
   <script src="recorder_circuit_patch.js"></script>
   ```

**What’s in Phase 1**
- Components: Resistor (R), Battery (V), Wire (W), Switch (S, closed)
- Solver: DC Modified Nodal Analysis (Gaussian elimination for small N)
- Probes: Node voltage, element currents
- Reasoning Reels: hash-chain + Ed25519 signature at export; 1Hz state digest
