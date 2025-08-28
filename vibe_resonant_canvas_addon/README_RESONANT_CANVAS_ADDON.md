# Resonant Canvas — String & Drum Studio (add‑on)

**What you get**
- `web/src/components/ResonantCanvas.tsx` — 1D string + 2D membrane FDM with **Courant σ** control, two schemes (**Leapfrog2** and **Space4**), a mini **spectrogram**, and **modal fireflies**.

**Wire it**
1. Route `/resonant-canvas` → `<ResonantCanvas/>`.
2. Ensure shared utilities exist (from Painted Sky): `AccreditationChip`, `EvidenceDrawer`, `rng.ts`, `deeplink.ts`, `ledger.ts`.
3. Optional: add cards on your **Simulations** page and a home CTA.

**Deep‑link example**
`/resonant-canvas?seed=20250827&geo=String1D&scheme=Leapfrog2&T=1.0&rho=1.0&sigma=0.90&damp=0.0005&bow=0&f=3.0&accreditation=1`

**Validation & Accreditation**
- Enforces **σ = c·dt/Δx** (≤ 1 in 1D; ≤ 1/√2 in 2D for the 5‑point Laplacian).
- Accreditation runs seeded 1D tests and logs:
  - **mode_err2**, **mode_err4**: |f_meas − f_theory|/f_theory for Leapfrog (2nd) vs 4th‑order space.
  - **drift2**, **drift4**: energy drift (relative) over the run.
  - **err_ratio** with **CI95**.
- Theoretical reference: **string modes** f_n = n c/(2L). **Membrane** modes follow Bessel zeros (used for UI hints and future checks).

**References**
- Courant/CFL condition for explicit wave schemes; leapfrog stability in 1D (r=cΔt/Δx ≤ 1).  (MIT 18.086; Wikipedia CFL)  
- 2D stability bound (canonical σ ≤ 1/√2 for standard 5‑point Laplacian in explicit schemes).  (Langtangen wave notes)  
- String harmonics: f_n = n c/(2L). (UNSW; Wikipedia)  
- Circular membrane modes: Bessel zeros. (UIUC acoustics notes)

Generated: 2025-08-27T22:43:15.067661Z
