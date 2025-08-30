
# Glass Labyrinth — Inverse Optics “Proof of Learning” (Phase 1)

**Files**
- `glass_lab.js` — Canvas UI + solver + ray simulation + Reasoning Reels.

**Install**
1. Copy `glass_lab.js` next to your `index.html`.
2. Add at the very end of the page:
   ```html
   <script src="glass_lab.js"></script>
   ```
3. Ensure you have `verify.html` (the ledger verifier). If not, ask and I’ll include it.

**How it works**
- **Place DETECTORS first** (Add Detector). They’re circular targets.
- Click **Auto‑suggest** → the sim proposes **minimal mirrors** (one per target where needed) and sets source angle.
- Click **Fire** to simulate. The **Reasoning Reel** logs `targets_set → solver_proposal → user edits → fire (energy)`.
- You can **Move** elements and rotate mirrors/splitters with **Q/E** (15° snaps). **Delete** removes items.
- **Export Reel** downloads a tamper‑evident `.saxlg` (hash‑chain + Ed25519 signature at export). **Verify Reel** opens `verify.html`.

**Physics (Phase 1)**
- Specular **mirrors** and 50/50 **splitters**. Deterministic, bounded rays (max 512), 1% energy cutoff, ≤10 bounces.
- Greedy proposal: grid‑sample a candidate mirror point for each detector; computes mirror normal from incoming/outgoing rays and validates by simulation. Picks the best (shortest path / strongest hit).

**Performance**
- Simulation is event‑driven (no background work). Digest/signing only on Export.
- The live “ray preview” is drawn only after **Fire** and caps segments aggressively.

**Next upgrades (Phase 2)**
- Refractive panes/prisms (Snell + Fresnel), uniform grid spatial index.
- Local search refinements & multi‑detector splitter layout suggestions.
- Teacher Mode: assign a target pattern and verify with the reel.
