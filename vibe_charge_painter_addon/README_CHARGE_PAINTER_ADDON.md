# Charge Painter — Laplace Sandbox (add‑on)

**What you get**
- `web/src/components/ChargePainter.tsx` — interactive 2D Laplace solver (GS/SOR) with brushable Dirichlet plates, iso‑lines, “field chalk” particles, residual sparkline, and Accreditation (ledger export).

**Wire it**
1. Route `/charge-painter` → `<ChargePainter/>`.
2. Ensure shared utilities exist (from Painted Sky): `AccreditationChip`, `EvidenceDrawer`, `rng.ts`, `deeplink.ts`, `ledger.ts`.
3. Optional: add a card on `simulations.html` and a home CTA.

**Deep‑link example**
`/charge-painter?seed=20250827&method=SOR&omega=1.85&V=50&R=10&iso=11&chalk=1&accreditation=1`

**KPI / Accreditation notes**
- L₂ residual per sweep of the discrete Laplacian (5‑point stencil).
- Estimated convergence rate (exp of slope in log residual over last 4 samples).
- Boundary error on Dirichlet cells.
- Bake‑off inside Accreditation: GS vs SOR iterations to hit ε=1e‑3; logs `ratio_gs_over_sor` across seeded reps and CI95.

**References (pedagogical)**
- Laplace FDM + relaxation (Jacobi/GS/SOR): Univ. Kentucky notes; Illinois CS450; UNCW PDE notes; Chungbuk EM notes. 
- Why solutions are local averages (harmonic functions) and relaxation intuition: Caballero notes; Physics SE discussion.

Generated: 2025-08-27T22:11:18.416144Z
