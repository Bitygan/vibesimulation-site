# Drag Rangefinder — Projectile with Air (add‑on)

- `web/src/components/DragRangefinder.tsx` — Projectile with **linear/quadratic drag** + wind; integrator toggle (**Euler–Cromer**, **RK4**); ghost overlay of **dt** vs **dt/2**; HUD **work lost to drag**.
- Evidence ledger: Δrange(dt,dt/2), Δapex, drag work; bake‑off errors (EC vs RK4) and CI95 logged to `drag_rangefinder.saxlg`.

**Route** `/drag-rangefinder` → `<DragRangefinder/>` and confirm: `AccreditationChip`, `EvidenceDrawer`, `rng.ts`, `deeplink.ts`, `ledger.ts`.

**Deep‑link** `/drag-rangefinder?seed=20250827&intg=RK4&model=Quadratic&v0=45&angle=40&dt=0.020&rho=1.20&Cd=0.47&R=0.0366&m=0.145&wind=5&wdir=180&accreditation=1`

Generated: 2025-08-27T23:44:50.453797Z
