
# SAX "Burstlets" — Tap-Only Dazzle Pack (Phase 1)

**What it is**  
Zero-instruction micro-sims that react to a single tap. No sliders, no menus:
- **Ripple Drum** — tap to pluck; ripples shimmer and fade.
- **Crystal Bloom** — tap to seed; patterns grow on their own.

**Install (drop-in)**
1. Copy `burstlets.js` next to `index.html`.
2. Add at the very end of your page:
   ```html
   <script src="burstlets.js"></script>
   ```
3. Optional but useful: keep `verify.html` in the same folder to check `.saxlg` files.

**Controls (kept invisible)**
- Just **tap** the canvases.
- **Long-press bottom-right** (~700ms) to reveal a tiny overlay with **Export Reel** and **Reset**.
  - Export builds a tamper-evident ledger (hash-chain + Ed25519 signature at export).

**Performance**
- No background work. Each micro-sim runs only after a tap and auto-stops when energy/pattern change falls below a threshold.
- Small internal grids (e.g., 180×100 for ripples, 144×90 for Gray–Scott) upscale to the canvas — fast on classroom laptops.

**SAX SOP v2.2**
- Deterministic where relevant; no RNG needed in Phase 1.
- Ledger types used: `touch`, `state` (sparse digests), plus signed `$meta` at export.
