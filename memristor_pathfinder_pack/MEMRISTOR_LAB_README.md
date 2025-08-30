
# Memristor Pathfinder — Glass Labyrinth Live (SAX SOP v2.2)

**What it is**  
A browser-native version of your memristor maze solver: a resistive grid learns a low‑resistance path from **Start** to **End** under an applied potential. Resistances decrease where current flows, revealing the route. Evidence is captured via **Reasoning Reels** (SAX ledgers).

**Install**
1. Copy `memristor_lab.js` next to `index.html`.
2. Add at the very end of your page:
   ```html
   <script src="memristor_lab.js"></script>
   ```
3. Keep `verify.html` in the same folder for ledger checks.

**Controls (like your other pro sims)**
- **Start / Pause / Step / Reset**
- **Rows / Cols** (grid size), **Learning η**, **Seed**, **Bias** (`zigzag`, `bfs`, `none`)
- **Show Flow**, **Particles**, **Step/Frame**

**Physics**
- Grid graph of resistors. Dirichlet BC at Start=1V and End=0V. Node voltages solved by Gauss–Seidel SOR each step.
- Edge currents computed by `I = |(V_u - V_v)/R|`.
- Memristor update: `R ← max(0.01, R * (1 − η * I/I_max))` (normalized by current peak each step).

**Evidence (SAX SOP v2.2)**
- Logs: `init`, `param`, `control`, `milestone(step, score)`, and periodic `state` digests (sparse resistances → FNV32).
- Export => `.saxlg` with hash‑chain and Ed25519 signature.

**Notes**
- Default size 24×40 keeps CPU smooth on mid laptops; you can push higher.
- Biasing options match your film’s **zigzag** backbone or a classic **BFS** path for quicker convergence.
