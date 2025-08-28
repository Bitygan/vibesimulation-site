# Waveforge — Shallow‑Water Playground (add‑on, v2)

- `web/src/components/Waveforge.tsx` — height‑field **Saint‑Venant** solver (Rusanov flux), dynamic **CFL** dt, LUT shading + normal sparkle, **splash** & **wall** painting.
- Evidence: `.saxlg` with **mass drift (ppm)**, **IoU_highres**, **IoU_proxy**, CI95.

**Route** `/waveforge` → `<Waveforge/>`. Ensure: `AccreditationChip`, `EvidenceDrawer`, `rng.ts`, `deeplink.ts`, `ledger.ts`.

**Deep‑link:** `/waveforge?seed=20250827&g=9.81&mu=0.005&cfl=0.70&dx=1.00&palette=Ocean&vec=1&mode=Splash&R=12&accreditation=1`

Generated: 2025-08-27T23:07:25.124719Z
