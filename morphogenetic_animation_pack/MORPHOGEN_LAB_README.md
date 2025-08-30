
# Morphogenetic Animation Studio — Gray–Scott (SAX SOP v2.2)

A serious, classroom‑ready **morphogenesis** lab: Gray–Scott reaction–diffusion with live controls, seeding, **inverse coverage matching**, and exportable **Reasoning Reels**.

## Files
- `morphogen_lab.js` — the whole lab (UI + model + Reels).

## Install
1. Copy `morphogen_lab.js` next to `index.html`.
2. Append at the very end of your page:
   ```html
   <script src="morphogen_lab.js"></script>
   ```
3. Keep your `verify.html` to check `.saxlg` reels.

## Controls
- **Start / Pause / Step / Reset / Export / Verify**
- **Presets** (Coral, Worms, Spots, Mazes, Mitotic) or **Custom**
- Parameters: **F, k, Du, Dv**; **Steps/frame**
- **Seeding**: Dot, Ring, Noise; **Brush radius**
- **Contour threshold** + **Target coverage %**
- **Auto‑threshold** (inverse matching) and **Auto‑preset** (fast heuristic among presets)

## Physics
Gray–Scott equations on a torus grid (wrap boundaries):
```
U_t = Du ∇²U − U V² + F (1 − U)
V_t = Dv ∇²V + U V² − (F + k) V
```
We use a 5‑point Laplacian and parameters ranges chosen for stability at dt≈1.

## Evidence (SAX SOP v2.2)
- **Events**: `param`, `seed`, `seed_apply`, `solver_proposal`, `control`, `milestone(step, metrics)`
- **State digests**: sparse Float32 samples of **V** → FNV32 (1 Hz)
- **Export**: `.saxlg` file with hash‑chained rows and Ed25519 signature (when available)

## Metrics shown (and logged)
- **Coverage** (% of cells with V > threshold)
- **Entropy** (V histogram entropy, scaled)
- **Gradient energy** (Sobol‑like magnitude / cell)

## Notes
- Internal grid 180×108 upscales to the canvas for speed on low‑spec laptops.
- The contour overlay is extracted at the threshold (marching‑squares style) for a crisp morpho outline.
- “Auto‑preset” is a quick heuristic; for deeper inverse design (e.g., spectral matching) we can add a worker with a small search later.
