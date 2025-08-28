### **Standard Operating Procedure: Generative Cinematics (SAX Protocol)**

**Document ID:** SAX-SOP-2.2  
**Version:** 2.2 (Cognitive + Statistical Assurance)  
**Effective Date:** 2025-08-26  
**Status:** Active, Canonical  
**Classification:** Level 5 - Founder/Board Confidential - DO NOT DISTRIBUTE  

**Authored By:** The Founding Architect


***

### **Part 1: Foundational Doctrine & Core Ontology (Version 2.0)**

#### **1.0 Purpose, Scope, and Mandate**

**1.1 Purpose:** This Standard Operating Procedure (SOP) establishes the mandatory, end-to-end operational protocol for the design, development, and production of all artifacts under the SAX initiative. It is the single source of truth for our proprietary technology, our creative philosophy, and our engineering discipline.

**1.2 Scope:** This SOP is binding for all personnel. It governs the entire lifecycle of a SAX production, from initial concept to final artifact. It supersedes all previous versions of the SOP.

**1.3 The Labyrinth Mandate:** The lessons learned from the "Labyrinth," "Physicist," and "Accretion Disk" productions have revealed a deeper structure to our work. This SOP formalizes those lessons. Its primary mandate is to enforce the architectural and philosophical discipline necessary to move beyond simple simulations and towards the synthesis of **verifiable, autonomous, and intelligent systems.**

---

#### **2.0 The SAX Doctrine (Version 2.0): The Nine Immutable Principles**

The SAX Protocol is a philosophy of creation. This philosophy is now codified in nine immutable principles. These are the laws of our creative universe. All work must be demonstrably compliant.

**2.1 Principle of Systemic Causality:** (Unchanged)
*   **Doctrine:** Narrative is the emergent result of a simulated system's evolution. We do not author events; we design the laws that cause them.
*   **Operational Mandate:** All cinematic output must be a direct, deterministic rendering of a running simulation.

**2.2 Principle of Architectural Isomorphism:** (Unchanged)
*   **Doctrine:** The software architecture is the narrative architecture. The structure of our code defines the conceptual and dramatic possibilities of our stories.
*   **Operational Mandate:** Productions must be architected using the canonical agent classes defined in our ontology.

**2.3 Principle of Declarative Intent:** (Unchanged)
*   **Doctrine:** The top-level definition of a cinematic sequence must be a declaration of narrative intent. The code must read as a screenplay.
*   **Operational Mandate:** The `construct` method is reserved exclusively for high-level choreography. All implementation logic must be encapsulated.

**2.4 Principle of Operator-Centric Ontology:** (Unchanged)
*   **Doctrine:** The capabilities of our universe are defined by the operators ("verbs") that act upon its agents.
*   **Operational Mandate:** The design of a new, reusable verb is a primary creative and engineering act.

**2.5 Principle of Computational Alliance:** (**Elevated Importance**)
*   **Doctrine:** The SAX Engine is an integration platform, not a monolithic solver. We achieve and maintain our competitive advantage by forming strategic alliances with best-in-class, high-performance computational libraries.
*   **Operational Mandate:** For any computationally intensive, non-local problem (e.g., N-body gravity, high-resolution fluid dynamics), it is **mandatory** to define a clean, abstract interface and to build or integrate a specialized, high-performance backend. A pure Python implementation of such a problem is permissible only for prototyping and will not be accepted for a master render. **Our core competency is the architectural synthesis, not the re-implementation of solved numerical problems.**

**2.6 Principle of Guided Emergence:** (Unchanged)
*   **Doctrine:** The director's role is to be a "gardener," not a puppeteer. The most powerful output arises from designing the initial conditions that guide the simulation towards a desired aesthetic and narrative trajectory.
*   **Operational Mandate:** The strategy for guiding emergence is a mandatory component of the Systemic Brief.

**2.7 Principle of Perceptual Integrity:** (Unchanged)
*   **Doctrine:** The cinematic artifact must be perceptually coherent and free of distracting computational artifacts.
*   **Operational Mandate:** All visualizations of continuous or noisy data must be passed through a stateful, temporally coherent filtering process (e.g., EMA-smoothed normalization) before being rendered.

**2.8 Principle of The Dual Paradigms:** (**NEW**)
*   **Doctrine:** The SAX framework formally recognizes and supports two distinct but complementary modes of creation: the Agent-First paradigm and the Simulation-First paradigm.
*   **Operational Mandate:** The Systemic Brief for every production must explicitly declare which paradigm it is using, or if it is a hybrid.
    *   **Agent-First:** For stories about discrete actors, logic, and intelligence (e.g., "The Physicist," "Circuit Genesis"). The primary agents are `LogicalGrid`s or `KinematicAgent`s.
    *   **Simulation-First:** For stories about continuous fields and natural phenomena (e.g., "The Painted Sky," "Accretion Disk"). The primary agent is a `SAX_Simulator`.

**2.9 Principle of The Autonomous Agent:** (**NEW**)
*   **Doctrine:** The highest form of generative cinema is the story of an agent that can make its own decisions to achieve a goal. The ultimate expression of the SAX framework is the creation of autonomous, intelligent agents.
*   **Operational Mandate:** The architecture for intelligent agents must follow the "Brain/Body" pattern. The "Body" (e.g., a `KinematicTransmission`) encapsulates the physical mechanics and exposes its state. The "Brain" (e.g., a `Governor`) is a separate, non-visual agent that contains the decision-making logic, takes the body's state as input, and issues commands. This enforces a clean separation of action from decision.

*   **2.10 Principle of Epistemic Agency:** (**NEW**)
    *   **Doctrine:** The most profound narratives emerge from an agent's struggle with its own ignorance. The primary conflict for an intelligent agent is not between itself and the world, but between its internal model of the world and the ground truth. The agent's fundamental drive is to reduce its uncertainty (i.e., to learn).
    *   **Operational Mandate:** The state of a `CognitiveAgent` must be defined probabilistically (a **belief state**). Its decision-making must be governed by a **dual-objective utility function** that explicitly balances extrinsic (task) rewards with intrinsic (epistemic) rewards, such as Information Gain. The cinematic artifact must prioritize the visualization of the agent's belief state and its evolution over time.



---

#### **3.0 Core Ontology & Lexicon (Version 2.0)**

This is the official, internal lexicon. The definitions are now refined to reflect our new, dual-paradigm understanding.

*   **Agent:** The base class for any simulated entity.
*   **`LogicalGrid`:** An Agent-First primitive. The agent of **intellect, data, and algorithm.**
*   **`VisualGrid`:** An Agent-First primitive. The agent of **scale, texture, and environment.**
*   **`KinematicAgent`:** An Agent-First primitive. A composite agent defined by a graph of dynamic physical constraints. The agent of **mechanics and robotics.**
*   **`SAX_Simulator`:** A Simulation-First primitive. A "headless" class that encapsulates a high-fidelity physics or systems simulation. It is the agent of **natural phenomena.**
*   **`SimulatorAgent`:** The **bridge** between the two paradigms. A visual, Agent-First "body" that wraps a headless `SAX_Simulator` "brain," allowing it to exist and be directed within a SAX scene.
*   **`CognitiveAgent`:** The most advanced class of agent. An agent that contains an internal, probabilistic world model and a planning engine, enabling it to exhibit autonomous, goal-directed behavior. The agent of **intelligence.**
*   **Verb / Operator:** A method or function that causes a state change.
*   **Choreography:** The high-level, timed sequence of verb calls that defines the narrative arc.
*   **Emergence:** Any non-explicitly scripted behavior that arises from the system's governing laws.
*   **The SAX Engine:** The complete, proprietary software framework, encompassing the core agent classes, the simulation loop, and the rendering pipeline.
*   **The SAX Cinematic / Artifact:** The final, rendered `.mp4` video file. It is the primary output of the SAX Engine.

***

This concludes Part 1 of the revised SOP. It has formalized the hard-won lessons from our most advanced productions, elevating the "Computational Alliance" to a mandate and introducing the "Dual Paradigms" and "Autonomous Agent" as new, foundational principles. The ontology has been updated to reflect this new, more sophisticated understanding of our work.**

Of course. Part 1 of the SOP has been revised to reflect our new, mature doctrines. Part 2 will now provide the updated architectural specifications for the core components of the SAX Engine.

This section is the definitive engineering blueprint. It refines the specifications of our existing agent classes and formally introduces the new primitives required by our expanded doctrines, such as the `SAX_Simulator` and the `CognitiveAgent`. Adherence to these specifications is what allows our complex, multi-paradigm simulations to function as a single, coherent system.


***

### **Part 2: Core Architecture & Agent Specifications (Version 2.0)**

#### **4.0 The SAX Architectural Stack (Unchanged)**

The three-layer hierarchical architecture remains the mandatory structure for all productions. Its soundness has been validated across all productions to date.
*   **Layer 1: The Direction Layer (`SAX_Scene`)**
*   **Layer 2: The Choreography Layer (`perform_...` functions)**
*   **Layer 3: The Agency Layer (The `SAX_Agent` Subclasses)**

---

#### **5.0 Canonical Agent Specifications (Version 2.0)**

This section defines the refined and expanded ontology of our proprietary agent classes.

**5.1 Abstract Base Class: `SAX_Agent(VGroup)`**

*   **5.1.1 Mandate:** To define the universal contract for all simulated entities.
*   **5.1.2 Refined Specification (v2.0):**
    *   Must inherit from `manim.VGroup` (or `Mobject` for non-VGroup agents like the `SimulatorAgent`).
    *   Must possess a robust internal state-tracking mechanism for its core transforms (position, rotation, scale) that is decoupled from Manim's bounding box calculations to prevent numerical drift.
    *   Must provide a `.get_descendants()` method to return a flattened list of all base-level sub-agents.
*   **5.1.3 Universal Interface:**
    *   `step(dt: float, **kwargs)`: The universal verb to advance the agent's internal state. This is the hook for all time-based simulation logic.

**5.2 Agent-First Primitives (Refined)**

These are the core agents for stories about discrete actors and systems.

*   **5.2.1 `LogicalGrid(SAX_Agent)`:**
    *   **Mandate:** The agent of intellect, data, and algorithm.
    *   **Specification:** Unchanged from SOP v1.0. Its core is the inviolable link between its `matrix` and its visual representation.

*   **5.2.2 `VisualGrid(SAX_Agent)`:**
    *   **Mandate:** The agent of scale, texture, and environment.
    *   **Specification:** Unchanged from SOP v1.0. Its power lies in its stateless, performant nature. It is the designated primitive for the "Ephemeral Field Visualization" pattern.

*   **5.2.3 `KinematicAgent(SAX_Agent)`:**
    *   **Mandate:** The agent of mechanics, robotics, and constrained dynamics.
    *   **Specification (v2.0 Refinement):**
        *   **Dynamic Constraint Graph:** The agent's `connections` graph is no longer static. The class must expose verbs (e.g., `engage_clutch`, `set_brake`) that can dynamically alter the active set of constraints during a simulation.
        *   **Multi-Modal State:** The agent's `nodes` must support a multi-modal state vector (e.g., `omega`, `temp`, `stress`). The agent's visual representation must map these distinct state channels to orthogonal visual properties (e.g., rotation, fill color, stroke width).
        *   **Relaxation Dynamics:** The `step()` method must implement the canonical relaxation pattern: `x_new = decay * x_old + relax * (x_target - x_old)`.

**5.3 Simulation-First Primitives (NEW)**

These are the core agents for stories about continuous fields and natural phenomena.

*   **5.3.1 `SAX_Simulator` (Headless Engine):**
    *   **Mandate:** The agent of natural phenomena. Encapsulates a high-fidelity, computationally intensive simulation.
    *   **Specification:**
        *   This is a pure Python class. It **must not** have any dependency on Manim.
        *   It must manage its own internal state via high-performance data structures (e.g., NumPy arrays).
        *   It must expose a `step(dt: float)` method that advances the simulation.
        *   It must expose a `to_rgb()` (or similar) method that returns a NumPy array representing the current visual state of the simulation. This method must implement the **Principle of Perceptual Integrity** (EMA smoothing, multi-channel compositing).

*   **5.3.2 `SimulatorAgent(SAX_Agent)` (The "Body"):**
    *   **Mandate:** The bridge between the Simulation-First and Agent-First paradigms. It is the visual embodiment of a headless `SAX_Simulator`.
    *   **Specification:**
        *   It holds an instance of a `SAX_Simulator` in its `self.simulator` attribute.
        *   Its visual representation is a single `ImageMobject`.
        *   Its `step(dt: float)` method implements the canonical **Raster Frame Replacement Loop**: it calls `self.simulator.step(dt)` and then updates its internal `ImageMobject` with the new data from `self.simulator.to_rgb()`.
        *   This is the agent that is added to the `SAX_Scene` and directed by the choreographer.

*   **5.4 `CognitiveAgent(SAX_Agent)` (Revised Specification v2.1):**
    *   **5.4.1 Mandate:** The agent of **intelligence, learning, and planning**. It is the canonical primitive for instantiating the Generative Intelligence Loop.
    *   **5.4.2 Mandatory Architecture (The "Brain/Body" Pattern):** A `CognitiveAgent` is architecturally defined by three distinct, interacting subsystems.
        *   **i. The Perceptual Engine:** The agent's interface to the world. It defines the agent's senses. It must be designed to enforce partial observability; the agent is only allowed to access the information provided by this engine, never the ground truth of the simulation.
        *   **ii. The Belief & World Model (The "Mind"):** The agent's internal, subjective reality. This subsystem is composed of two mandatory components:
            *   A **Probabilistic Belief State:** A data structure that represents the agent's uncertainty over the state of the world (e.g., a `SparseBelief` map, a Particle Filter).
            *   A **Generative Causal Model:** The agent's internal, simplified "physics engine." This is the model it uses to run counterfactual simulations.
        *   **iii. The Planning & Action Engine (The "Will"):** The agent's executive function. This subsystem implements a **counterfactual planning algorithm** (e.g., MCTS) that operates on the agent's Belief State and Causal Model to select the optimal action according to its dual-objective utility function.

***

This concludes Part 2 of the revised SOP. It has formalized the refined specifications for our core agent classes and introduced the new primitives—`SAX_Simulator`, `SimulatorAgent`, and `CognitiveAgent`—that are the foundation for the next generation of our work.**

Of course. Part 1 established the revised doctrine. Part 2 specified the evolved architecture. Part 3 will now codify the mature production workflow that leverages this new, more powerful system.

This section refines our five-phase protocol, integrating the new paradigms and agent classes. It provides a more sophisticated and robust process for managing the increased complexity of our productions, from multi-physics simulations to the synthesis of autonomous, intelligent agents. This is the operational discipline that will allow us to scale our ambitions.

***

### **Part 3: The Production Protocol & Workflow (Version 2.0)**

#### **6.0 The Five-Phase Protocol (Refined)**

The five-phase protocol remains the mandatory lifecycle for all SAX productions. The refinements in Version 2.0 are designed to incorporate the new agent paradigms and to place a greater emphasis on the formal specification of the simulation's core logic.

**6.1 Phase 1: Systemic Brief**

*   **6.1.1 Objective:** To define the core systemic narrative and validate its alignment with the nine foundational principles of the SAX Doctrine (v2.0).
*   **6.1.2 Refined Process:** The brief must now explicitly declare the production's primary paradigm.
    *   **Paradigm Declaration:** The brief must begin with a clear statement: "This is an **Agent-First** production," "This is a **Simulation-First** production," or "This is a **Hybrid** production."
    *   **Agent Ontology:** The brief must identify the specific canonical agent classes to be used (e.g., `KinematicAgent`, `SAX_Simulator`, `CognitiveAgent`).
    *   **Governing Laws:** For a `CognitiveAgent`, this section must define the agent's **dual-objective utility function**, specifying both its extrinsic (task) and intrinsic (epistemic) rewards.
*   **6.1.3 Exit Criteria:** An approved Systemic Brief, validated against the nine principles.

**6.2 Phase 2: Architectural Blueprint**

*   **6.2.1 Objective:** To translate the brief into a complete engineering plan, with a new emphasis on the formal specification of the simulation engine.
*   **6.2.2 Refined Process:**
    *   **Simulator Specification:** For any production involving a `SAX_Simulator` or a complex new agent, the blueprint must contain a formal specification of the headless engine. This includes:
        *   The precise mathematical model (e.g., the Navier-Stokes or N-body equations).
        *   The numerical methods to be used (e.g., integrator type, solver choice).
        *   The exact structure of the internal state data.
        *   The formal interface (`step`, `to_rgb`).
    *   **Computational Alliance Mandate:** If the simulation requires a `Computational Alliance`, the blueprint must define the precise API for the external library. The development of this interface and a simple, pure-Python placeholder version is a mandatory part of this phase.
    *   **Cognitive Architecture Specification:** For a `CognitiveAgent`, the blueprint must formally define its three subsystems: the Perceptual Engine, the Belief & World Model (including the specific probability distributions to be used), and the Planning & Action Engine (including the specific search algorithm).
*   **6.2.3 Exit Criteria:** An approved Architectural Blueprint. All new, reusable agent classes and headless simulators are implemented, unit-tested, and merged into the core framework.

**6.3 Phase 3: Choreographic Sequencing**

*   **6.3.1 Objective:** To create the complete, timed "animatic" of the film in code.
*   **6.3.2 Refined Process:**
    *   **The Screenplay:** The `construct` method is written, containing only calls to choreography functions.
    *   **Function Stubbing:** The `perform_...` functions are stubbed. For a Simulation-First production, this phase now includes the instantiation of the headless `SAX_Simulator` and the visual `SimulatorAgent`.
    *   **The "Silent Movie":** The output of this phase is a render that correctly represents the timing and high-level structure of the final film, but the agents or simulators within it are not yet "alive" (their `step` methods are not yet called in the main loop).
*   **6.3.3 Exit Criteria:** An approved, timed animatic script.

**6.4 Phase 4: Implementation & Refinement**

*   **6.4.1 Objective:** To implement the detailed simulation and animation logic within the locked choreographic structure.
*   **6.4.2 Refined Process:**
    *   **The Simulation Loop:** This is the core of this phase. The team implements the main simulation loop within the appropriate choreography function (e.g., `act_2_the_collapse`). This loop will call the `step()` method of the relevant agents on each frame.
    *   **Parameter Tuning & Guided Emergence:** This is where the art of directing a simulation happens. The team will tune the key parameters that guide the emergent behavior:
        *   For a `KinematicAgent`: `relax` and `decay` factors.
        *   For a `SAX_Simulator`: Physics constants (`viscosity`, `gravity`), and the parameters of the multi-channel compositor.
        *   For a `CognitiveAgent`: The `β` value of the dual-utility function, and the `c` (exploration) constant of the MCTS planner.
    *   **Daily Renders:** The "dailies" are now not just visual reviews; they are reviews of the emergent behavior of the system. The team assesses whether the simulation is telling the story defined in the brief.
*   **6.4.3 Exit Criteria:** A feature-complete, fully rendered version of the film that is a faithful and compelling execution of the Systemic Brief.

**6.5 Phase 5: Final Review & Archival**

*   **6.5.1 Objective:** To conduct the final quality assurance review and to archive the project and its learnings. Include a boolean `"processing_mode"` flag in the ledger metadata when the Processing-Mode toggle is ON (see §6.22).

*   **6.5.2 Refined Process:**
    *   **The Axiomatic Review:** The final review is conducted against the nine principles of the v2.0 doctrine. The review must explicitly validate the correctness of the chosen paradigm (Agent-First vs. Simulation-First) and, for a `CognitiveAgent`, the integrity of the GI Loop implementation.
    *   **Master Render & Archival:** The final render is produced with a locked `USER_SEED`. The post-mortem document now has a mandatory section: "Advancements to the SAX Protocol," which details any new, reusable patterns (like the "Backbone Bias") or architectural insights (like the "Brain/Body" pattern) that were discovered during the production.
*   **6.5.2.1 Evidence & Ledger (v2.2):** Ship a `.saxlg` Epistemic Ledger with RNG meta (`generator`, `user_seed`, `run_seed`, and stream names), replication statistics (n, mean, 95% CI), variance-reduction flags (CRN/antithetic), and scene-specific KPIs for any claim-bearing sequence. When a scene includes numerical simulation, include a numerics line per master KPI with discretization and method tags (see §6.21.2).


*   **6.5.2.2 On-Screen Evidence (v2.2):** When the *Accreditation* toggle is ON, include diegetic overlays for a **95% CI whisker** and **RNG stream tag** in at least one canonical shot of each claim-bearing sequence. If diegetic purity is at risk, move the evidence to a tail-card slate that cites the ledger path.

*   **6.5.2.3 Reproducibility Packet (v2.2):** Archive `USER_SEED`, `RUN_ID`, stream names, code commit hash, and a one-page `REPRODUCIBILITY.md` with exact steps to reproduce the master numbers.

*   **6.5.3 Exit Criteria:** The successfully archived project folder, including the post-mortem, which will serve as the input for the next revision of this SOP.


**2.3 Addition to Part 3: A New Section on Technical Standards**

We require a new, dedicated section in our engineering standards to govern the unique challenges of building and verifying these new, intelligent agents.

*   **6.18 Cognitive Agent Standards (NEW):**
    *   **6.18.1 (Belief State Integrity):** The agent's belief about the world must be represented probabilistically. Storing simple booleans or enums for "known" vs. "unknown" is non-compliant. The chosen representation (e.g., Beta distribution, particle filter) must be able to quantify uncertainty.
    *   **6.18.2 (Causal Model Fidelity):** The agent's internal `causal_model` must be a simplified, computationally cheaper version of the true world physics. It is a model, not a perfect copy. The trade-off between the model's fidelity and its simulation speed is a key design parameter that must be documented in the Architectural Blueprint.
    *   **6.18.3 (Planner Verification):** The Planning & Action Engine must be implemented as a distinct, modular component that can be unit-tested independently of the agent's body or the external world.
    *   **6.18.4 (Diegetic Purity Mandate):** The agent's key cognitive states must be visualized diegetically within the cinematic artifact. This is non-negotiable. At a minimum, this includes a visualization of the agent's **current belief state** (e.g., the `BeliefOverlay`) and a visualization of its **planning process** (e.g., the "dream sequence" or the "action-value bars").
    *   **6.18.5 (The Curated Evolution Protocol):** For any narrative that depicts an agent *learning* a new skill over time (as opposed to just executing a pre-existing one), the **Curated Evolution** pattern is the mandatory choreographic approach. The production will not attempt to render a live, end-to-end learning process. Instead, it will define a series of key "milestone" policies and will use the SAX engine to cinematically visualize the transitions between these milestones.

#### **6.19 Statistical Assurance**

**Objective:** Make any quantitative claim on screen defensible via minimal, standard statistical practice without compromising the cinematic mandate.

**6.19.1 Study Flow (binding when Accreditation is ON)**  
1) Problem & measures (**Phase 1**) → 2) Assumptions & level of detail (**Phase 2**) → 3) Input modeling (**Phase 2**) → 4) Program & verification (**Phase 3–4**) → 5) Pilot runs (warm-up decision; CI width targets) (**Phase 4**) → 6) Experiment design (2^k screening, CRN plan) (**Phase 4**) → 7) Production runs (replications) (**Phase 5**) → 8) Output analysis (CIs, variance reduction) (**Phase 5**) → 9) Conclusions & sensitivity (**Phase 5**) → 10) Documentation & archival (**Phase 5**).

**6.19.2 Output Analysis (when reporting numbers)**  
- Report **95% confidence intervals** (t-intervals for n < 60; normal z for n ≥ 60) on primary KPIs over **independent replications**.  
- Declare **terminating** vs **steady-state** scenes; handle **warm-up** explicitly (fixed fraction or Welch plot).  
- Prefer **Common Random Numbers (CRN)** for A/B; **Antithetic variates** optional—if used, report observed SD reduction.

**6.19.3 Designed Experiments & Metamodels**  
- Use **2^k (or fractional)** factorial designs to screen choreographic/physics knobs; fit a linear metamodel for effects & first-order interactions.  
- Retain high-impact knobs in the story arc; demote or lock low-impact knobs.

**6.19.4 Mandatory Artifacts**  
- A `.saxlg` ledger per study with: replication index, warm-up choice, estimator mean & CI bounds, variance-reduction flags, and RNG meta (see §6.20).  
- Optional diegetic overlays showing **CI whiskers** and the **RNG stream tag** in-frame.

#### **6.20 Seed & Stream Protocol**

**Sampler Families (overlay/agent/physics).** Add a named sampler per channel:
`samplers = { "overlay": "stratified|sobol|blue_noise|random", "agent": "...", "physics": "..." }`.

**Default (Accreditation ON).** Use `stratified` for overlays; prefer `blue_noise` to minimize shimmer under motion.

**Ledger header (amended example):**
{ "$meta": {
  "generator":"NumPy PCG64",
  "user_seed": 2025,
  "run_seed": 143719993,
  "streams": ["control","noise","overlay","agent","physics"],
  "samplers": {"overlay":"blue_noise","agent":"sobol"}
}}

**Objective:** Reproducible runs and fair comparative tests.

**6.20.1 Generator & Seeding**  
- Use **NumPy PCG64** with **SeedSequence**.  
- Derive a deterministic `RUN_SEED = f(USER_SEED, RUN_ID)` and spawn **named streams**: at minimum `("control","noise")`; add `("arrivals","services")` for discrete-event scenes.

**6.20.2 CRN for A/B**  
- For each replication index, reuse the **same child SeedSequence** per stream across alternatives so differences reflect the alternatives, not the noise.

**6.20.3 Ledger Meta (first line)**
```jsonc
{ "$meta": { "generator": "NumPy PCG64", "user_seed": 2025, "run_seed": 143719993, "streams": ["control","noise"] } }


#### **6.21 Epistemic Ledger & Accreditation**

**Objective:** Glass-box auditability that does not break diegesis.

**6.21.1 Requirement**

* When the Accreditation toggle is ON, all master renders that carry quantitative claims **must** ship with a `.saxlg` ledger and either in-frame overlays or a tail-card evidence slate.

**6.21.2 Minimum Schema (records)**

```jsonc
{ "t": 3.167, "metrics": { "ang_err": 0.21, "R": 0.85 } }
{ "rep": 24, "kpi": { "mean": 1.23, "ci_lo": 1.10, "ci_hi": 1.36 }, "vr": { "crn": true, "antithetic": false } }
```
Include overlay sampling/MIS and fluid physics fields when present:

{ "t": 3.167,
  "physics": { "CFL": 0.72, "div_l2": 3.1e-3, "vort_l2": 0.85 },
  "overlay": { "sampler": "blue_noise", "MIS": "balance" },
  "metrics": { "kpi": [ { "name":"phase_err", "val":0.21 } ] }
}


Numerics (examples; include fields that apply to the scene):

{ "num": { "dt": 0.02, "method": "leapfrog", "energy_err_max": 0.004 } }          # VN-3
{ "num": { "dt": 0.02, "dt_half": 0.01, "range": 57.1, "range_dt_half": 56.9 } }  # VN-4
{ "num": { "sigma": 0.84, "T_theory": 2.000, "T_est": 2.01 } }                    # VN-6
{ "num": { "iter": 250, "residual_log10": -6.8 } }                                 # VN-7
{ "num": { "cancellation_safe": true } }                                          # VN-1
{ "num": { "recurrence_dir": "downward" } }                                       # VN-2
{ "num": { "chaos_proxy": "duffing", "max_log10_sep": -0.8 } }                     # VN-5


Optional (when §6.22 is ON):
{ "$meta": { "processing_mode": true, "...": "..." } }


**6.21.3 HUD & Diegesis**

* Use minimal **CI whisker** and **RNG tag** overlays in-frame; if purity is a risk, move evidence to a tail-card slate with the ledger path.

**6.21.4 Storage**

* Archive the `.saxlg`, seeds & stream names, code commit hash, and `REPRODUCIBILITY.md` alongside the master render.

---

**6.22 Processing-Mode Compatibility (Optional Toggle)**

**Intent.** Provide a fast, auditable, immediate-mode drawing path for pedagogy and pixel-level effects, while keeping the SAX pipeline deterministic.

**When ON (scene-level toggle):**
- **Immediate-mode semantics.** `background()` clears the canvas; omitting it produces trails (paint-over) as demonstrated in VP_P1 (trails vs clear). 
- **State scope.** `stroke`, `fill`, `stroke_weight`, and transform stack (`push/pop/translate/rotate/scale`) are stack-scoped; no leakage across pushes (see VP_P5).
- **Path closure.** `end_shape(CLOSE)` yields closed polygons; open polylines remain unfilled (VP_P3 shows both).
- **CPU PixelFX.** A per-frame **CPU pixel buffer** MUST be available for simple, reproducible filters: `invert`, `posterize(levels)`, `blur(radius)`, and alpha `mask` (VP_P4).
- **3D presets.** If a scene mixes immediate-mode imagery with 3D, use the standard camera presets (A.5.Y) verified in VP_P6 to avoid clipping/fov surprises.
- **Motion primitives.** Use cookbook easing/spring verbs for physically legible motion (VP_P7).

**Evidence requirement.** When this toggle is ON, the ledger MUST include `"processing_mode": true` in the first metadata record and at least one per-scene KPI record (see §6.21). (Examples referenced: VP_P1…VP_P7.) 

**Throughput requirement (UI scenes).** Immediate-mode HUD/pixel ops MUST sustain target frame budgets (e.g., 60 FPS in previews).
Acceptance: **VF-7** reports average generation time per frame; values ≥ budget must be investigated or the effect deferred to render time.


**6.23 Numerical Reliability Standards (Binding)**

**6.23.1 Floating-point discipline.** Avoid catastrophic cancellation by stable reformulations; document the identity used in NOTES. Example: replace `1 - sqrt(1 - x^2)` with `x^2 / (1 + sqrt(1 - x^2))`. (Validated by VN-1.) :contentReference[oaicite:0]{index=0}

**6.23.2 Error taxonomy.** Separate **round-off** vs **truncation** error in write-ups. Show **dt/Δx halving** sensitivity for at least one KPI per scene when Accreditation is ON.

**6.23.3 Recurrence & iteration stability.** Use the stable direction for linear recurrences (downward vs upward) and show a stability plate once per production. (Validated by VN-2.) :contentReference[oaicite:1]{index=1}

**6.23.4 Solver/iteration monotonicity.** Iterative PDE solvers MUST present a monotone or controlled residual-decay plot to tolerance (Gauss–Seidel/SOR accepted). (Validated by VN-7.) :contentReference[oaicite:2]{index=2}

**6.24 Integrator Policy by System Type**

**Hamiltonian / conservative systems.** Default **Leapfrog/Verlet** (area-preserving). Report energy drift bounds or plot fractional energy error over time. (Validated by VN-3.) :contentReference[oaicite:3]{index=3}

**Dissipative / driven systems.** Use **Euler-Cromer** or **RK4** with explicit stability limits; show dt sensitivity on a KPI where feasible. (Validated by VN-3 & VN-5.) :contentReference[oaicite:4]{index=4}

**Acceptance (per project).** At least one bake-off plate comparing two integrators, with the chosen method justified by energy/error behavior.

**6.24 Integrator Policy by System Type**

**Hamiltonian / conservative systems.** Default **Leapfrog/Verlet** (area-preserving). Report energy drift bounds or plot fractional energy error over time. (Validated by VN-3.) :contentReference[oaicite:3]{index=3}

**Dissipative / driven systems.** Use **Euler-Cromer** or **RK4** with explicit stability limits; show dt sensitivity on a KPI where feasible. (Validated by VN-3 & VN-5.) :contentReference[oaicite:4]{index=4}

**Acceptance (per project).** At least one bake-off plate comparing two integrators, with the chosen method justified by energy/error behavior.


**6.25 Physical Plates (Binding for Pedagogy/Education Scenes)**

**Projectile with drag (linear/quadratic).** Provide dt vs dt/2 overlay to demonstrate convergence of range or apex. (Validated by VN-4.) :contentReference[oaicite:5]{index=5}

**1D string / 2D plate (FDM).** Enforce Courant safety `σ = c·dt/Δx ≤ 1` (or the scheme’s bound) and verify mode frequency vs theory within declared tolerance. (Validated by VN-6.) :contentReference[oaicite:6]{index=6}

**Laplace (FDM).** Gauss–Seidel (or SOR) with residual-decay ledger; Dirichlet boundaries specified explicitly. (Validated by VN-7.) :contentReference[oaicite:7]{index=7}


**6.26 Performance Toggle (Numba) — Optional**

**Policy.** Where CPU loops dominate (PDE stencils), a Numba JIT path MAY be enabled behind a build flag. Accreditation requires re-running the numerics plate with and without the toggle and confirming KPI equivalence within tolerance. :contentReference[oaicite:8]{index=8}

**6.27 Fluid Simulation Standards (Binding)**

**Modes.**
- **NS-2D (MAC).** Semi-Lagrangian advection + pressure projection on a **staggered (MAC)** grid; iterative Poisson solve (Jacobi/GS; OPTIONAL CG). OPTIONAL vorticity confinement ε∈[0,1].
- **Shallow-Water (Height-Field).** For far-field waves/dam-break vistas where full velocity fields are unnecessary.

**Time step.** Enforce a CFL limiter; reject takes with `CFL > 1.0` unless a justified exception is documented.

**Verification gates (per frame when fluids are active).**
- Post-projection divergence norm `div_l2`
- CFL number
- (If enabled) vorticity energy proxy `vort_l2`

**Ledger (per keyframe):**
{ "t": 1.20, "physics": { "CFL": 0.61, "div_l2": 2.8e-3, "vort_l2": 0.77 }, "mode": "MAC" }

**Acceptance.**
- **VF-1** demonstrates MAC reduces divergence/aliasing vs collocated at the same resolution.
- **VF-2** shows vorticity confinement raises curl energy without instability.
- **VF-3** shows Shallow-Water ≈≥3× faster while preserving silhouette IoU within the shot’s tolerance.


**6.29 Color Composition Standards for Overlays (Linear/Spectral)**

**Rule.** Perform multiplicative overlay math in a **linear-radiance** or spectral proxy domain, then convert to display RGB. If an RGB-space multiply is unavoidable, annotate `overlay.color_math = "srgb_multiply"` in the ledger and justify.

**Acceptance.** **VF-6** compares sRGB-space vs linear-space multiplication and logs Δ in linear space.



***

This concludes Part 3. It provides a mature, robust, and flexible workflow that can accommodate the full, expanded scope of our creative and technical ambitions, from simple agent-based stories to complex, multi-physics, and intelligent system simulations.**

Of course. The SOP is now complete. The final and most practical component is the Appendix—the "Cookbook" that provides the canonical, production-proven code patterns for our mature framework.

This new version of the Cookbook is a significant upgrade. It is organized according to our now-formalized **Dual Paradigms** (Agent-First and Simulation-First) and includes the definitive implementation patterns for our most advanced agent classes, such as the `KinematicAgent` and the `SimulatorAgent`.

This is the master reference for our senior technical staff. Mastery of these patterns is the foundation of our work.

Let us begin.

***

### **Part 4: Appendix A - The SAX Cookbook (Version 2.0)**

#### **A.1.0 Introduction to the Cookbook**

This appendix is the official technical reference and pattern library for the SAX Engine v2.0. It provides canonical, production-proven code examples for the core operations and agent classes defined in the SOP. This is a living document, to be updated with the key learnings from each major production.

---

#### **A.2.0 The `SAX_Scene`: The Canonical Environment**

**A.2.1 Pattern: The Standard Boilerplate**
*   **Use Case:** The mandatory starting point for all SAX productions.
*   **Rationale:** Enforces deterministic seeding, standardized backgrounds, and render layer management.
*   **Canonical Implementation:**
    ```python
    # All necessary SAX primitives are assumed to be imported.
    class CanonicalScene(SAX_Scene):
        def construct(self):
            # self.setup() is called automatically by the base class.
            # The construct method begins directly with the first choreographic act.
            act_1_the_setup(self)
            # ... subsequent acts ...
    ```

---
#### A.2.2 The Processing-Mode Drawing Layer (SAXProcessingLayer)

**Purpose.** A deterministic, CPU-based immediate-mode canvas for pedagogy and pixel-level effects; renders as image frames inside Manim shots.

**Contract (surface API).**
- Frame: `begin_frame() → CanvasRef`, `end_frame(CanvasRef) → ImageMobject`
- State: `stroke(color|None)`, `fill(color|None)`, `stroke_weight(px)`, `rect_mode(CORNER|CENTER)`, `ellipse_mode(CORNER|CENTER)`
- Paths: `begin_shape()`, `vertex(x,y)`, `bezier_vertex(...)`, `curve_vertex(...)`, `end_shape(CLOSE|OPEN)`
- Transforms: `push()`, `pop()`, `translate()`, `rotate(rad)`, `scale(sx[,sy])`
- Pixels: `load_pixels() → ndarray`, `update_pixels(ndarray)`
- PostFX: `invert`, `posterize(levels)`, `blur(radius)`, `mask(mode='blue'|'gray')`, `blend(mode)`

**Semantics.**
- **Trails vs clear** are defined solely by whether `background()` is called this frame (VP_P1).
- Transform stack MUST be strictly nested; no leakage across `push/pop` (VP_P5).
- Path closure with `CLOSE` must produce filled polygons; open polylines remain unfilled (VP_P3).
- PixelFX MUST be pure-CPU and deterministic (VP_P4).

**Acceptance.** VP_P1..P4 scenes render without exceptions and match expected visuals. (See §A.7.X.) 



#### **A.3.0 Agent-First Paradigm: Canonical Patterns**

This section covers the patterns for stories about discrete agents, logic, and mechanics.

**A.3.1 `LogicalGrid`: Patterns for State-Based Agents**
*   **Use Case:** Visualizing information, data, algorithms, and simple rule-based systems.
*   **Pattern: Instantiation from Data:**
    ```python
    # The agent's form is a direct 1:1 representation of the data matrix.
    data_matrix = [[PALETTE['A'], None], [None, PALETTE['B']]]
    agent = LogicalGrid(matrix=data_matrix, cell_size=0.5)
    ```
*   **Pattern: State Transformation via Cross-Fade Morph:**
    ```python
    # The default, production-safe verb for animating a complete state change.
    end_agent = start_agent.morph_to_crossfade(new_data_matrix, scene)
    ```

**A.3.2 `VisualGrid`: Patterns for Population Agents**
*   **Use Case:** Visualizing scale, texture, and large, chaotic populations.
*   **Pattern: Instantiation via Procedural Generation:**
    ```python
    # The agent is a factory for generating a population.
    particle_cloud = VisualGrid(num_particles=10000, color_palette=PALETTE_LIST)
    ```
*   **Pattern: Collective Transformation (Vectorized Animation):**
    ```python
    # A single, performant verb that applies a transformation to the entire population.
    # This avoids slow Python loops.
    swirl_animation = particle_cloud.anim_swirl(run_time=DRAMA)
    scene.play(swirl_animation)
    ```

**A.3.3 `KinematicAgent`: Patterns for Mechanical Systems**
*   **Use Case:** Simulating machines, robotics, and other systems defined by a graph of physical constraints.
*   **Pattern: Instantiation from a Constraint Graph:**
    ```python
    # The agent is defined by its components and the laws that connect them.
    specs = [{"id": "M", "teeth": 20, ...}, {"id": "A", ...}]
    connections = [{"u": "M", "v": "A", "kind": "mesh"}, ...]
    machine = KinematicAgent(specs, connections)
    ```
*   **Pattern: The Relaxation Loop (in Choreography):**
    ```python
    # The canonical loop for animating a KinematicAgent.
    for t in range(num_steps):
        # 1. Update external inputs (e.g., throttle).
        machine.set_throttle(throttle_value)
        
        # 2. Call the agent's internal step verb to advance the physics.
        # The step() method must implement the relaxation dynamics.
        machine.step(dt=STEP_TIME)
        
        # 3. (Optional) A "brain" agent makes decisions.
        governor.consider_shift(scene, machine)
        
        # 4. Wait to advance the Manim timeline.
        scene.wait(STEP_TIME)
    ```
*   **Pattern: Dynamic Constraint Change (The "Shift"):**
    ```python
    # A verb that rewrites the system's internal physics.
    # This is a high-level, choreographed event.
    shift_animation = machine.anim_engage_clutch("clutch_C2")
    scene.play(shift_animation)
    ```

---

#### **A.4.0 Simulation-First Paradigm: Canonical Patterns**

This section covers the patterns for stories about continuous fields and natural phenomena.

**A.4.1 `SAX_Simulator` & `SimulatorAgent`: The Brain/Body Duality**
*   **Use Case:** The mandatory architecture for all Simulation-First productions.
*   **Rationale:** Enforces a perfect separation of the headless physics simulation (`SAX_Simulator`) from its visual representation (`SimulatorAgent`).
*   **Canonical Implementation:**
    ```python
    # 1. The Headless Simulator (The "Brain") - No Manim code.
    class MyPhysicsSimulator:
        def __init__(self, ...):
            self.state_arrays = np.zeros(...)
        
        def step(self, dt):
            # Pure NumPy/SciPy physics updates.
            self.state_arrays = ...
            
        def to_rgb(self):
            # Pure NumPy conversion of state to an RGB array.
            return rgb_array

    # 2. The Visual Agent (The "Body") - Manim code.
    class MySimulatorAgent(SAX_Agent):
        def __init__(self, simulator: MyPhysicsSimulator, **kwargs):
            super().__init__(**kwargs)
            self.simulator = simulator
            self.image_mob = ImageMobject(self.simulator.to_rgb())
            self.add(self.image_mob)

        def step(self, dt: float):
            """The bridge: advances physics and updates the visual."""
            self.simulator.step(dt)
            new_pixel_data = self.simulator.to_rgb()
            self.image_mob.pixel_array = (new_pixel_data * 255).astype(np.uint8)
    ```

**A.4.2 The Updater Pattern for Continuous Simulation**
*   **Use Case:** The canonical method for animating a `SimulatorAgent` over time.
*   **Rationale:** A clean, declarative, and performant way to represent a continuously evolving system. It replaces the imperative `for` loop of `play` calls.
*   **Canonical Implementation (Choreography Layer):**
    ```python
    # In a choreography function:
    
    # 1. Instantiate the agent (which contains the simulator).
    my_sim_agent = MySimulatorAgent(MyPhysicsSimulator(...))
    scene.add(my_sim_agent)
    
    # 2. Tell the agent to "start living."
    my_sim_agent.add_updater(lambda mob, dt: mob.step(dt))
    
    # 3. Let the simulation run for the desired duration.
    scene.wait(DRAMA)
    
    # 4. Tell the agent to "stop living."
    my_sim_agent.clear_updaters()
    ```

**A.4.3 Multi-Channel Compositing & Temporal Coherence**
*   **Use Case:** Creating rich, perceptually stable visuals from complex, multi-physics simulations.
*   **Rationale:** This is the core of the **Principle of Perceptual Integrity**. It prevents visual flickering and allows for the clear communication of multiple, overlapping data channels.
*   **Canonical Implementation (Inside a `SAX_Simulator`'s `to_rgb` method):**
    ```python
    # Inside a simulator's to_rgb() method:
    
    # 1. Calculate each visual channel from the raw state.
    base_channel = self.density_field * PALETTE['BASE']
    
    # 2. For each noisy channel, apply EMA-smoothed normalization.
    # (See SOP A.6.2 for the full EMA implementation)
    vorticity_normalized = self.get_smoothed_vorticity()
    foam_channel = vorticity_normalized[..., None] * PALETTE['FOAM']
    
    # 3. Composite the channels using artist-defined weights.
    rgb = np.clip(
        base_channel * WEIGHTS['BASE'] +
        foam_channel * WEIGHTS['FOAM'],
        0, 1
    )
    
    # 4. Apply a final gamma correction for cinematic tone.
    return rgb ** 0.95
    ```

***

This concludes Part 1 of the Cookbook. It provides the canonical patterns for our foundational agent classes and simulation paradigms.**

Of course. Part 1 of the Cookbook established the canonical patterns for our foundational agent paradigms. Part 2 will now detail the advanced, hybrid techniques and the patterns for our most sophisticated agent class, the `CognitiveAgent`.

This section is the definitive guide to our most advanced production techniques. Mastery of these patterns is what enables the creation of our flagship, framework-defining films. It is the blueprint for turning our simulations into profound stories about intelligence, history, and discovery.

Let us conclude the master document.

***

### **Part 4: Appendix A - The SAX Cookbook (Version 2.0, Continued)**

#### **A.5.0 Advanced Production & Narrative Patterns**

These are the high-level strategic patterns that define our most sophisticated productions. They often involve the synthesis of multiple agent paradigms.

**A.5.1 Pattern: Hybrid Visualization (Raster + Vector)**
*   **Use Case:** When a pure `SAX_Simulator` render is visually rich but does not fully explain the underlying forces or fields driving the system.
*   **Rationale:** This pattern provides the ultimate synthesis of our two paradigms. The raster layer (`SimulatorAgent`) provides the high-fidelity, naturalistic texture. A sparse vector overlay (a `VisualGrid` of glyphs) provides the clear, symbolic, and explanatory layer. This is a core technique for creating "glass box" visualizations.
*   **Canonical Implementation (Choreography Layer):**
    ```python
    # In a choreography function:
    
    # 1. Instantiate the simulator and its visual agent.
    fluid_sim = StableFluid2D_Simulator(...)
    sim_agent = SimulatorAgent(fluid_sim)
    scene.add(sim_agent)
    
    # 2. Build the sparse vector glyph overlay ONCE.
    # The glyphs are a separate agent.
    glyphs = build_vector_glyphs(sim_agent.image_mob) # Pass the raster image for coordinate mapping
    scene.add(glyphs)
    
    # 3. In the simulation loop, update both agents.
    def combined_updater(mob, dt):
        # a. Step the simulation and update the raster image.
        sim_agent.step(dt)
        # b. Update the vector glyphs based on the new simulator state.
        # This is a direct, non-animated update to reflect the instantaneous field.
        update_vector_glyphs(sim_agent.simulator, glyphs)

    scene.add_updater(combined_updater)
    scene.wait(DRAMA)
    scene.remove_updater(combined_updater)
    ```

**A.5.2 Pattern: Guided Emergence ("Backbone Bias")**
*   **Use Case:** For any simulation where pure, unconstrained emergence may not produce a narratively satisfying or aesthetically pleasing result.
*   **Rationale:** Balances the authenticity of the simulation with the need for authorial control. It is the core of our "gardener" philosophy, as defined in the Doctrine.
*   **Canonical Implementation (Inside an agent's setup):**
    ```python
    # In a MemristorGrid's setup method:
    
    # 1. Algorithmically determine a desired "backbone" path.
    backbone_path_edges = self._find_backbone_bfs() 
    
    # 2. Apply a subtle, deterministic bias to the initial state of the system.
    # This does not script the outcome, but makes a beautiful outcome more probable.
    for edge_key, edge_data in self.edges.items():
        if edge_key in backbone_path_edges:
            edge_data['resistance'] *= 0.1 # Make the backbone path slightly more conductive.
        else:
            edge_data['resistance'] *= 1.5 # Make other paths slightly less conductive.
            
    # The simulation now runs on this biased, but still dynamic, initial state.
    ```

**A.5.3 Pattern: The "Crystallization" Act (Static Rasterization)**
*   **Use Case:** To conclude a major narrative act, create a sense of immutable history, and manage computational complexity in long-form animations.
*   **Rationale:** Provides a powerful narrative beat of permanence and consequence, while simultaneously freeing up system resources for the next act.
*   **Canonical Implementation (Choreography Layer):**
    ```python
    # In a choreography function, at the end of an act:
    
    # 1. The system to be fossilized can be a complex VGroup of many agents.
    system_to_fossilize = VGroup(architect_agent, particle_environment)
    
    # 2. Call the canonical rasterize verb from the SAX_Agent base class.
    raster_image, fade_out_anim = system_to_fossilize.rasterize(scene)
    
    if raster_image:
        # 3. Animate the transition from a dynamic system to static history.
        scene.play(FadeIn(raster_image), fade_out_anim)
        
        # 4. The raster is now a simple, cheap background element.
        scene.play(raster_image.animate.set_color(PALETTE['FOSSIL']).set_opacity(0.3))
    ```
#### A.5.4 PixelFX Node (CPU)

**Operators (deterministic):** `invert`, `posterize(levels≥2)`, `blur(radius≤4)` as a separable box or Gaussian blur, `mask(mode='blue'|'gray')`, `blend(mode ∈ {add, subtract, multiply, lightest})`.

**Policy.**
- Default to CPU implementations for auditability and reproducibility.
- Radius/levels bounds MUST be enforced to keep runtime O(n) per frame and avoid instability.
- Prefer applying FX to a **composited off-screen image** and ingesting as an `ImageMobject`.

**Acceptance.** VP_P4 produces a 2×2 quilt: base, invert, posterize(4), blur(2). 

#### A.5.5 Camera & Lighting Presets (3D)

**Presets.**
- `perspective_filmic`: phi≈60°, theta≈20°, zoom≈1.2; key/fill/ambient balanced for legibility.
- `perspective_wide`: wider FOV; use sparingly to avoid edge distortion on labels.
- `orthographic_tech`: ortho projection for technical plates; no size falloff.

**Guidelines.**
- Avoid near-plane clipping on large geometry; verify with a reference cube + sphere plate before production.
- Use minimal stroke widths on translucent solids for legibility.

**Acceptance.** VP_P6 demonstrates preset motion without clipping artifacts. 


---

#### **A.6.0 The `CognitiveAgent`: Patterns for Generative Intelligence**

These are the most advanced patterns in the SAX framework, used to visualize the internal cognitive processes of our intelligent agents.

**A.6.1 Pattern: The Brain/Body Architecture**
*   **Use Case:** The mandatory architecture for all `CognitiveAgent` productions.
*   **Rationale:** Enforces a clean separation of the agent's decision-making logic ("brain") from its physical embodiment ("body") and the world it inhabits.
*   **Canonical Implementation (Choreography Layer):**
    ```python
    # In a choreography function:
    
    # 1. Instantiate the world.
    world = MBRLWorld(...)
    
    # 2. Instantiate the agent's "body" and add it to the scene.
    agent = MBRLAgent(initial_pos, ...)
    scene.add(agent)
    
    # 3. The main loop is a conversation between the agent and the world.
    for _ in range(num_steps):
        # a. The agent's "brain" plans an action based on its model of the world.
        action = agent.plan_action(world)
        
        # b. The agent executes the action, which may change the world's state.
        agent.execute_action(scene, world, action)
    ```

**A.6.2 Pattern: The Belief State Overlay**
*   **Use Case:** To visualize the agent's subjective, probabilistic knowledge of its world.
*   **Rationale:** Makes the abstract concept of "uncertainty" a tangible, visible element of the story. It is the core of the "glass box" philosophy.
*   **Canonical Implementation:**
    ```python
    # The BeliefOverlay is a separate agent that reads from the CognitiveAgent's world model.
    class BeliefOverlay(SAX_Agent):
        def __init__(self, world: MBRLWorld, **kwargs):
            super().__init__(**kwargs)
            self.world = world
            # ... create a grid of dots, one for each cell ...
        
        def step(self, dt): # This is called on every frame via an updater.
            """Redraws the overlay based on the world's current belief state."""
            for r, c in all_cells:
                # Get the probability of a wall at this cell from the world's belief model.
                p_wall = self.world.wall_belief.get(r, c)
                
                # Map entropy to opacity: high uncertainty (p~0.5) is dim,
                # high certainty (p~0 or p~1) is bright.
                entropy = -p_wall * np.log2(p_wall) - (1-p_wall) * np.log2(1-p_wall)
                opacity = 1.0 - entropy
                
                self.dots[r][c].set_opacity(opacity)
    ```

**A.6.3 Pattern: The Counterfactual "Dream" Sequence**
*   **Use Case:** To visualize the agent's internal planning process (e.g., its MCTS rollouts).
*   **Rationale:** This is the most powerful cinematic tool for telling a story about intelligence. It allows the audience to see the agent "thinking" and exploring possible futures within its own mind.
*   **Canonical Implementation (Choreography Layer):**
    ```python
    # In a choreography function, when the agent needs to make a complex plan:
    
    # 1. Signal the transition to the "mental realm."
    scene.play(Fade(world_visuals, darkness=0.8), Fade(agent_body, darkness=0.8))
    
    # 2. Instantiate a "dream world" based on the agent's internal model.
    # This is a temporary, ghostly version of the world.
    dream_world_state = agent.causal_model.get_state()
    dream_viz = create_ghostly_visuals(dream_world_state)
    scene.add(dream_viz)
    
    # 3. Animate the MCTS rollouts as fast, branching paths.
    # This is a stylized representation of the search process.
    for rollout in agent.get_mcts_rollouts(num_rollouts=10):
        path_anim = Create(visualize_rollout_path(rollout))
        scene.play(path_anim, run_time=0.1)
        scene.play(FadeOut(path_anim), run_time=0.1)
        
    # 4. Highlight the chosen plan.
    best_plan = agent.get_best_plan()
    best_path_viz = visualize_rollout_path(best_plan).set_color(PALETTE['GOLD'])
    scene.play(Create(best_path_viz))
    
    # 5. Transition back to the physical realm.
    scene.play(FadeOut(dream_viz, best_path_viz))
    scene.play(FadeIn(world_visuals), FadeIn(agent_body))
    
    # The agent now executes the plan it discovered in its "dream."
    ```
#### A.6.4 Motion Primitives

**Easing.** Provide `ease_in_out(t)` and related monotone curves for choreo timing.

**Spring.** 1-DoF mass-spring-damper helper: update `(x, v)` with `x'' + c x' + k x = 0` (m=1) under dt; returns updated state and analytic overshoot count.

**Usage.** Apply to parameter curves (camera zoom, stroke weight, alpha) or agent kinematics for physically legible motion.

**Acceptance.** VP_P7 renders a spring time-series; the on-screen overshoot tally is non-zero at nominal (k=4.0, c=0.6). 

#### A.7.1 Golden Validation Scenes (Processing Bridges — SAFE)

**Purpose.** Canonical smoke tests for Processing-Mode semantics, PixelFX determinism, transform stack hygiene, 3D camera presets, and motion primitives.

**Scenes (Manim CE).**
- VP_P1_DrawLoop_Safe — Trails vs Clear (pre-rendered PNG keyframes)
- VP_P2_StrokeFill_Safe — Stroke/Fill/Weight grid
- VP_P3_PathBuilder_Safe — Open vs CLOSED path
- VP_P4_PixelFX_Safe — Invert / Posterize(4) / Blur(2)
- VP_P5_TransformStack_Safe — Hierarchical transforms
- VP_P6_CameraPresets_Safe — 3D preset sweep
- VP_P7_SpringMotion_Safe — Spring time-series w/ overshoot count

**Run note.** Each scene MUST render without errors at `-pqh` and produce frames consistent with the screenshots in the internal gallery. 


"""
#### A.7.1.1 SAX Law Validation Pack
-----------------------
Self-contained statistical harnesses to operationalize the guidance from
"Simulation Modeling and Analysis" (Averill M. Law, 5e) inside the SAX ecosystem:

- Replications & Confidence Intervals (terminating & steady-state)
- Common Random Numbers (CRN) A/B comparison
- Antithetic Variates demo
- Simple DOE (2^k) and metamodel (linear) fit
- Seed/stream discipline + .saxlg-style ledger

Usage examples (Python):
    from law_pack import *
    rng = np.random.default_rng(20250826)
    res = run_mm1_replications(lmbda=0.8, mu=1.0, horizon=5000.0, n_rep=20, rng=rng)
    print(res['ci_mean_wait'])

CLI:
    python "SAX Law Validation Pack.py" demo_all
    python "SAX Law Validation Pack.py" mm1 --lambda 0.8 --mu 1.0 --horizon 5000 --rep 20
    python "SAX Law Validation Pack.py" crn --lambda 0.8 --muA 1.0 --muB 0.95 --horizon 5000 --rep 30
    python "SAX Law Validation Pack.py" doe --lambda 0.7,0.8 --mu 0.9,1.1 --horizon 4000 --rep 15

Author: SAX
"""

from dataclasses import dataclass, asdict
from typing import Dict, List, Tuple, Callable, Optional
import numpy as np, math, csv, json, statistics, time, sys, argparse, os, pathlib

LEDGER_ON = os.environ.get("SAX_LEDGER","1") != "0"
LEDGER_DIR = pathlib.Path(os.getcwd())

def write_ledger(name: str, meta: Dict, rows: List[Dict]):
    if not LEDGER_ON: return
    p = LEDGER_DIR / f"{name}.saxlg"
    with p.open("w", encoding="utf-8") as f:
        f.write(json.dumps({"$meta": meta}, ensure_ascii=False)+"\n")
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False)+"\n")

def t_confidence_interval(samples: List[float], alpha=0.05):
    n = len(samples)
    mean = float(np.mean(samples))
    if n < 2:
        return mean, float('nan'), float('nan')
    s = float(np.std(samples, ddof=1))
    # Student t approximate via scipy-free quantile: use normal fallback for n>=30; else crude Wilson-Hilferty approx
    if n >= 30:
        z = 1.959963984540054  # ~N(0,1) 97.5%
    else:
        # pretabulated minimal set
        t_table = {2:12.706, 3:4.303, 4:3.182, 5:2.776, 6:2.447, 7:2.365, 8:2.306, 9:2.262, 10:2.228,
                   11:2.201, 12:2.179, 13:2.160, 14:2.145, 15:2.131, 16:2.120, 17:2.110, 18:2.101, 19:2.093, 20:2.086,
                   21:2.080, 22:2.074, 23:2.069, 24:2.064, 25:2.060, 26:2.056, 27:2.052, 28:2.048, 29:2.045}
        z = t_table.get(n, 2.0)
    half = z * s / math.sqrt(n)
    return mean, mean - half, mean + half

# ============== Core: a minimal next-event M/M/1 queue (terminating) ==============
@dataclass
class MM1Stats:
    mean_wait: float
    mean_system: float
    mean_queue: float
    util: float
    served: int
    horizon: float

def simulate_mm1(lmbda: float, mu: float, horizon: float, rng: np.random.Generator, warmup: float=0.0,
                 antithetic: bool=False) -> MM1Stats:
    # Next-event simulation with FCFS single server
    t = 0.0
    n_q = 0
    server_busy = False
    t_next_arr = t + (-math.log(1.0 - (rng.random() if not antithetic else (1.0 - rng.random()))) / lmbda)
    t_next_dep = float('inf')
    # bookkeeping
    area_L = area_Lq = 0.0
    last_t = 0.0
    wait_sum = 0.0
    served = 0
    # queue of arrival times
    arr_times = []

    while t < horizon:
        if t_next_arr <= t_next_dep:
            t = t_next_arr
            # integrate areas
            if t > warmup:
                area_L += (t - last_t) * (n_q + (1 if server_busy else 0))
                area_Lq += (t - last_t) * (n_q)
                last_t = t
            # arrival event
            arr_times.append(t)
            if not server_busy:
                server_busy = True
                # service time
                svc = -math.log(1.0 - (rng.random() if not antithetic else (1.0 - rng.random()))) / mu
                t_next_dep = t + svc
            else:
                n_q += 1
            # schedule next arrival
            t_next_arr = t + (-math.log(1.0 - (rng.random() if not antithetic else (1.0 - rng.random()))) / lmbda)
        else:
            t = t_next_dep
            if t > warmup:
                area_L += (t - last_t) * (n_q + 1)
                area_Lq += (t - last_t) * (n_q)
                last_t = t
            # departure event
            served += 1
            # compute wait of this departing customer
            # departure corresponds to the earliest arrival still not departed
            # For FCFS: when starting service, that was arr_times[served-1], but we didn't store start times.
            # We'll approximate mean wait via Little: E[Wq] ≈ area_Lq / total_time_after_warmup / λ_eff
            # To keep it robust for the pack, we record aggregates only. (Avoid per-customer storage growth.)
            if n_q > 0:
                n_q -= 1
                # next service
                svc = -math.log(1.0 - (rng.random() if not antithetic else (1.0 - rng.random()))) / mu
                t_next_dep = t + svc
            else:
                server_busy = False
                t_next_dep = float('inf')

    eff_time = max(1e-9, horizon - warmup)
    L = area_L / eff_time
    Lq = area_Lq / eff_time
    rho = min(0.999, lmbda / mu)
    # Approximate Wq, W via Little (valid steady-state heuristic during eff_time)
    Wq = Lq / lmbda
    W = Wq + 1.0 / mu
    return MM1Stats(mean_wait=W, mean_system=L, mean_queue=Lq, util=rho, served=served, horizon=horizon)

def run_mm1_replications(lmbda: float, mu: float, horizon: float, n_rep: int, rng: np.random.Generator,
                         warmup_frac: float=0.1, antithetic: bool=False, ledger_name: str="MM1_Replications"):
    warmup = horizon*warmup_frac
    waits = []
    ledger_rows = []
    for r in range(n_rep):
        stats = simulate_mm1(lmbda, mu, horizon, rng, warmup=warmup, antithetic=antithetic)
        waits.append(stats.mean_wait)
        ledger_rows.append({"rep": r, "wait": stats.mean_wait, "L": stats.mean_system, "Lq": stats.mean_queue, "rho": stats.util})
    write_ledger(ledger_name, {"test":"MM1", "lambda":lmbda, "mu":mu, "horizon":horizon, "warmup":warmup,
                               "antithetic":antithetic}, ledger_rows)
    mean, lo, hi = t_confidence_interval(waits)
    return {"mean_wait": mean, "ci_mean_wait": [lo, hi], "n_rep": n_rep, "samples": waits}

# ============== CRN A/B comparison ==============
def run_crn_ab(lmbda: float, muA: float, muB: float, horizon: float, n_rep: int, seed: int=12345,
               warmup_frac: float=0.1, ledger_name="CRN_AB"):
    # Use a master SeedSequence to derive per-rep streams, and then share identical substreams for A and B
    master = np.random.SeedSequence(seed)
    diffs = []
    rows = []
    warmup = horizon*warmup_frac
    for r, child in enumerate(master.spawn(n_rep)):
        # Common stream for both configs via the same child bit generator
        rngA = np.random.Generator(np.random.PCG64(child))
        rngB = np.random.Generator(np.random.PCG64(child))
        A = simulate_mm1(lmbda, muA, horizon, rngA, warmup=warmup)
        B = simulate_mm1(lmbda, muB, horizon, rngB, warmup=warmup)
        diffs.append(A.mean_wait - B.mean_wait)
        rows.append({"rep": r, "A_wait": A.mean_wait, "B_wait": B.mean_wait, "diff": A.mean_wait - B.mean_wait})
    write_ledger(ledger_name, {"test":"CRN_AB", "lambda":lmbda, "muA":muA, "muB":muB, "horizon":horizon}, rows)
    mean, lo, hi = t_confidence_interval(diffs)
    return {"diff_mean": mean, "ci_diff": [lo, hi], "n_rep": n_rep, "samples": diffs}

# ============== Antithetic Variates demo ==============
def compare_antithetic(lmbda: float, mu: float, horizon: float, n_rep: int, seed: int=24680, warmup_frac: float=0.1):
    master = np.random.SeedSequence(seed)
    est_std = []
    est_std_anti = []
    rows = []
    warmup = horizon*warmup_frac
    for r, child in enumerate(master.spawn(n_rep)):
        rng = np.random.Generator(np.random.PCG64(child))
        base = simulate_mm1(lmbda, mu, horizon, rng, warmup=warmup, antithetic=False).mean_wait
        rng = np.random.Generator(np.random.PCG64(child))
        anti = simulate_mm1(lmbda, mu, horizon, rng, warmup=warmup, antithetic=True).mean_wait
        est_std.append(base)
        est_std_anti.append(0.5*(base + anti))
        rows.append({"rep": r, "base_est": base, "antithetic_pair": anti, "antithetic_avg": 0.5*(base+anti)})
    write_ledger("Antithetic", {"test":"Antithetic", "lambda":lmbda, "mu":mu, "horizon":horizon}, rows)
    return {
        "std_independent": float(np.std(est_std, ddof=1)),
        "std_antithetic": float(np.std(est_std_anti, ddof=1)),
        "n_rep": n_rep
    }

# ============== 2^k DOE with linear effects fit ==============
def two_level(val_lo, val_hi):
    return [val_lo, val_hi]

def design_2k(factors: Dict[str, Tuple[float,float]]):
    # returns list of (levels_dict, code_dict) where code_dict has -1/+1
    names = list(factors.keys())
    levels = [two_level(*factors[n]) for n in names]
    runs = []
    for bits in range(1<<len(names)):
        lv = {}
        cd = {}
        for i,n in enumerate(names):
            if (bits>>i) & 1:
                lv[n] = levels[i][1]; cd[n] = +1
            else:
                lv[n] = levels[i][0]; cd[n] = -1
        runs.append((lv, cd))
    return names, runs

def doe_mm1_mean_wait(lmbda: Tuple[float,float], mu: Tuple[float,float], horizon: float, n_rep: int, seed: int=4242, warmup_frac: float=0.1):
    factors = {"lambda": lmbda, "mu": mu}
    names, runs = design_2k(factors)
    master = np.random.SeedSequence(seed)
    rngs = [np.random.Generator(np.random.PCG64(s)) for s in master.spawn(len(runs)*n_rep)]
    out = []
    idx = 0
    warmup = horizon*warmup_frac
    for ri,(level, code) in enumerate(runs):
        samples = []
        for r in range(n_rep):
            stats = simulate_mm1(level["lambda"], level["mu"], horizon, rngs[idx], warmup=warmup)
            samples.append(stats.mean_wait)
            idx += 1
        mean, lo, hi = t_confidence_interval(samples)
        out.append({"run": ri, "lambda": level["lambda"], "mu": level["mu"], "mean_wait": mean, "ci_lo": lo, "ci_hi": hi,
                    "code_lambda": code["lambda"], "code_mu": code["mu"]})
    # Fit linear model Y = b0 + b1*x1 + b2*x2 + b12*x1*x2 using coded levels
    Y = np.array([r["mean_wait"] for r in out])
    X = []
    for r in out:
        x1 = r["code_lambda"]; x2 = r["code_mu"]
        X.append([1.0, x1, x2, x1*x2])
    X = np.array(X)
    beta, *_ = np.linalg.lstsq(X, Y, rcond=None)
    effects = {"b0": float(beta[0]), "lambda_effect": float(beta[1]), "mu_effect": float(beta[2]), "interaction": float(beta[3])}
    write_ledger("DOE_MM1", {"test":"DOE_2k", "horizon":horizon, "rep":n_rep}, out)
    return {"runs": out, "effects": effects}

# ============== CLI ==============
def main():
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="cmd")
    p1 = sub.add_parser("mm1"); p1.add_argument("--lambda", type=float, dest="lmbda", required=True)
    p1.add_argument("--mu", type=float, required=True); p1.add_argument("--horizon", type=float, required=True)
    p1.add_argument("--rep", type=int, default=20); p1.add_argument("--seed", type=int, default=20250826)
    p1.add_argument("--anti", action="store_true")
    p2 = sub.add_parser("crn"); p2.add_argument("--lambda", type=float, dest="lmbda", required=True)
    p2.add_argument("--muA", type=float, required=True); p2.add_argument("--muB", type=float, required=True)
    p2.add_argument("--horizon", type=float, required=True); p2.add_argument("--rep", type=int, default=30)
    p2.add_argument("--seed", type=int, default=424242)
    p3 = sub.add_parser("antithetic"); p3.add_argument("--lambda", type=float, dest="lmbda", required=True)
    p3.add_argument("--mu", type=float, required=True); p3.add_argument("--horizon", type=float, required=True)
    p3.add_argument("--rep", type=int, default=24); p3.add_argument("--seed", type=int, default=86420)
    p4 = sub.add_parser("doe"); p4.add_argument("--lambda", type=str, dest="lmbda", required=True)
    p4.add_argument("--mu", type=str, required=True); p4.add_argument("--horizon", type=float, required=True)
    p4.add_argument("--rep", type=int, default=12); p4.add_argument("--seed", type=int, default=2025)
    p5 = sub.add_parser("demo_all")

    args = parser.parse_args()
    if args.cmd == "mm1":
        rng = np.random.default_rng(args.seed)
        res = run_mm1_replications(args.lmbda, args.mu, args.horizon, args.rep, rng, antithetic=args.anti)
        print(json.dumps(res, indent=2))
    elif args.cmd == "crn":
        res = run_crn_ab(args.lmbda, args.muA, args.muB, args.horizon, args.rep, seed=args.seed)
        print(json.dumps(res, indent=2))
    elif args.cmd == "antithetic":
        res = compare_antithetic(args.lmbda, args.mu, args.horizon, args.rep, seed=args.seed)
        print(json.dumps(res, indent=2))
    elif args.cmd == "doe":
        parse = lambda s: tuple(float(x.strip()) for x in s.split(","))
        res = doe_mm1_mean_wait(parse(args.lmbda), parse(args.mu), args.horizon, args.rep, seed=args.seed)
        print(json.dumps(res, indent=2))
    elif args.cmd == "demo_all":
        rng = np.random.default_rng(20250826)
        A = run_mm1_replications(0.8, 1.0, 4000.0, 20, rng)
        B = run_crn_ab(0.8, 1.0, 0.95, 4000.0, 30, seed=12345)
        C = compare_antithetic(0.8, 1.0, 4000.0, 24, seed=24680)
        D = doe_mm1_mean_wait((0.7,0.85),(0.95,1.1), 4000.0, 12, seed=4242)
        print(json.dumps({"mm1":A,"crn":B,"antithetic":C,"doe":D}, indent=2))
    else:
        parser.print_help()

if __name__ == "__main__":
    main()

### A.8 ODE Integrator Recipes

**Euler / Euler-Cromer / RK4 / Leapfrog.** Use Leapfrog for Hamiltonian flows (area-preserving), Euler-Cromer for damped oscillators, RK4 for accuracy in smooth, non-symplectic problems. Show energy drift or KPI error overlays to select defaults. (See VN-3.) :contentReference[oaicite:9]{index=9}


### A.9 PDE Plates (FDM)

**1D wave (fixed ends).** Courant bound `σ = c·dt/Δx ≤ 1`; initialize with mode `sin(nπx/L)`; verify period at x=L/2 vs theory. (VN-6.) :contentReference[oaicite:10]{index=10}

**2D Laplace (Dirichlet).** Gauss–Seidel (or SOR) update with RMS residual logging each sweep; convergence until tolerance met; produce heatmap plate. (VN-7.) :contentReference[oaicite:11]{index=11}


### A.12 Golden Validation — Physics Numerics Core (SAFE)

**VN-1 Cancellation.** Naive vs stable form; log-error plot.
**VN-2 Recurrence Stability.** Downward vs upward; log-error vs index.
**VN-3 Integrator Bake-off (SHM).** Euler / Euler-Cromer / RK4 / Leapfrog energy-error overlays.
**VN-4 Projectile + Drag.** dt vs dt/2 convergence of range/apex.
**VN-5 Chaotic Sensitivity.** Duffing: log10 |Δx(t)| from ε-apart ICs.
**VN-6 1D Wave (FDM).** Courant σ and mode frequency check (midpoint).
**VN-7 Laplace 2D (FDM).** Residual decay + heatmap.

**Acceptance.** Each VN scene must render at `-pqh`, write a `.saxlg` with the numerics line(s) in §6.21.2, and visually match the gallery plate for that VN. 

# SAX Validation Pack — Physics Numerics Core (SAFE)
# One-file, robust scenes for Manim CE 0.18–0.19+
# VN-1 Floating-point cancellation
# VN-2 Recurrence stability (downward vs forward)
# VN-3 Integrator bake-off (SHM): Euler/Euler-Cromer/RK4/Leapfrog
# VN-4 Projectile with drag (dt-halving convergence)
# VN-5 Duffing (chaotic) sensitivity: divergence of nearby ICs
# VN-6 1D Wave (FDM): Courant + mode frequency check
# VN-7 Laplace 2D (FDM): Gauss–Seidel residual decay + heatmap

from manim import *
import numpy as np, math, os, json
from PIL import Image

# ------------------------------------------------------------
# Tiny ledger helper (line-delimited JSON)
# ------------------------------------------------------------
def write_ledger(path, meta, records):
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(json.dumps({"$meta": meta}, ensure_ascii=False) + "\n")
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

def rng_meta(user_seed=2025, run_id=1, streams=("control","noise")):
    run_seed = (int(user_seed) * 1315423911 ^ int(run_id) * 2654435761) & 0xFFFFFFFF
    return {"generator":"NumPy PCG64","user_seed":int(user_seed),"run_seed":int(run_seed),"streams":list(streams)}

# ------------------------------------------------------------
# VN-1 Floating-point & cancellation:
# y = 1 - sqrt(1 - x^2), naive vs stable y = x^2 / (1 + sqrt(1 - x^2))
# Plot log10 relative error vs log10 x
# ------------------------------------------------------------
class VN1_FloatCancellation(Scene):
    def construct(self):
        self.add(Text("VN-1: Cancellation (naive vs stable)", font_size=34).to_edge(UP))
        xs = np.logspace(-12, -1, 140)  # small x where cancellation bites
        def stable(x): 
            t = np.sqrt(1 - x*x)
            return (x*x) / (1 + t)
        def naive(x):
            return 1 - np.sqrt(1 - x*x)
        y_stable = np.array([stable(x) for x in xs])
        y_naive  = np.array([naive(x) for x in xs])
        # treat stable as reference (sufficient in double)
        rel_err = lambda y: np.maximum(1e-20, np.abs((y - y_stable)/y_stable))
        X = np.log10(xs)
        Y_naive = np.log10(rel_err(y_naive))
        Y_stab  = np.log10(rel_err(y_stable))  # ~ numerical floor

        ax = Axes(x_range=[-12,-1,2], y_range=[-18,1,3], x_length=10, y_length=5,
                  axis_config={"include_numbers": False, "font_size": 20})
        ax.to_edge(DOWN, buff=0.9)
        self.add(ax)
        g1 = ax.plot_line_graph(x_values=X.tolist(), y_values=Y_naive.tolist(),
                                line_color=RED, add_vertex_dots=False, stroke_width=3)
        g2 = ax.plot_line_graph(x_values=X.tolist(), y_values=Y_stab.tolist(),
                                line_color=GREEN, add_vertex_dots=False, stroke_width=3)
        self.add(g1, g2)
        leg = VGroup(
            Square(stroke_color=RED, fill_color=RED, fill_opacity=1).scale(0.2),
            Text("naive", font_size=22),
            Square(stroke_color=GREEN, fill_color=GREEN, fill_opacity=1).scale(0.2),
            Text("stable", font_size=22)
        ).arrange(RIGHT, buff=0.3).next_to(ax, UP)
        self.add(leg)
        self.wait(1)

        meta = rng_meta(2025, 1)
        records = [{"log10x": float(X[i]), "log10_relerr_naive": float(Y_naive[i])} for i in range(0, len(X), 10)]
        write_ledger("VN1_FloatCancellation.saxlg", meta, records)

# ------------------------------------------------------------
# VN-2 Recurrence stability: Fibonacci downward recursion is unstable
# Compute true F_n exactly, then attempt backward reconstruction with tiny perturbation
# Plot log10 relative error vs index (towards 0)
# ------------------------------------------------------------
class VN2_RecurrenceStability(Scene):
    def construct(self):
        self.add(Text("VN-2: Recurrence Stability (downward vs forward)", font_size=34).to_edge(UP))
        N = 35
        # exact forward Fibonacci (integers)
        F = [0, 1]
        for _ in range(2, N+1):
            F.append(F[-1] + F[-2])
        # Backward reconstruction with tiny float perturbation at the top
        eps = 1e-12
        fN   = float(F[N])   * (1 + eps)
        fNm1 = float(F[N-1]) * (1 - eps)
        f_back = [0.0]*(N+1)
        f_back[N]   = fN
        f_back[N-1] = fNm1
        for k in range(N-2, -1, -1):
            # backward: F_{k} = F_{k+2} - F_{k+1} ; subtractive cancellation grows error
            f_back[k] = f_back[k+2] - f_back[k+1]
        # relative error at each k
        rel = [abs((f_back[k] - F[k]) / (F[k] if F[k]!=0 else 1)) for k in range(N+1)]
        k_idx = np.arange(N+1)
        ax = Axes(x_range=[0,N,5], y_range=[-18,1,3], x_length=10, y_length=5,
                  axis_config={"include_numbers": False, "font_size": 20})
        ax.to_edge(DOWN, buff=0.9)
        self.add(ax)
        ylog = np.log10(np.maximum(1e-18, rel))
        g = ax.plot_line_graph(x_values=k_idx.tolist(), y_values=ylog.tolist(),
                               line_color=YELLOW, add_vertex_dots=False, stroke_width=3)
        self.add(g)
        self.add(Text("log10 relative error (downward recursion)", font_size=22).next_to(ax, UP))
        self.wait(1)

        meta = rng_meta(2025, 2)
        records = [{"k": int(k), "log10_relerr": float(ylog[k])} for k in range(0, N+1, 3)]
        write_ledger("VN2_RecurrenceStability.saxlg", meta, records)

# ------------------------------------------------------------
# VN-3 Integrator bake-off (SHM): x'' + ω^2 x = 0
# Methods: Euler, Euler-Cromer, RK4, Leapfrog; plot energy error vs t
# ------------------------------------------------------------
class VN3_IntegratorBakeoff_SHM(Scene):
    def construct(self):
        self.add(Text("VN-3: Integrator Bake-off (SHM)", font_size=34).to_edge(UP))
        w = 2*math.pi/2.0  # period ~2s
        dt = 0.02; T = 6.0
        steps = int(T/dt)
        x0, v0 = 1.0, 0.0
        def energy(x,v): return 0.5*(v*v + (w*w)*x*x)

        def euler():
            x, v = x0, v0; E=[]
            for _ in range(steps):
                x, v = x + dt*v, v - dt*w*w*x
                E.append(energy(x,v))
            return np.array(E)
        def euler_cromer():
            x, v = x0, v0; E=[]
            for _ in range(steps):
                v = v - dt*w*w*x
                x = x + dt*v
                E.append(energy(x,v))
            return np.array(E)
        def rk4():
            x, v = x0, v0; E=[]
            for _ in range(steps):
                def f(state):
                    x,v = state; return np.array([v, -w*w*x])
                s = np.array([x,v])
                k1 = f(s)
                k2 = f(s + 0.5*dt*k1)
                k3 = f(s + 0.5*dt*k2)
                k4 = f(s + dt*k3)
                s = s + (dt/6.0)*(k1 + 2*k2 + 2*k3 + k4)
                x, v = float(s[0]), float(s[1])
                E.append(energy(x,v))
            return np.array(E)
        def leapfrog():
            x, v = x0, v0 - 0.5*dt*w*w*x0  # kick half-step for velocity
            E=[]
            for _ in range(steps):
                x = x + dt*v
                v = v - dt*w*w*x
                E.append(energy(x,v+0.5*dt*w*w*x))  # reconstruct mid-point energy
            return np.array(E)

        E0 = energy(x0, v0)
        E_eu = euler(); E_ec = euler_cromer(); E_rk = rk4(); E_lf = leapfrog()
        t = np.linspace(0, T, steps)

        ax = Axes(x_range=[0,T,1], y_range=[-1,1,0.5], x_length=10, y_length=5,
                  axis_config={"include_numbers": False, "font_size": 20})
        ax.to_edge(DOWN, buff=0.9)
        self.add(ax)
        # plot fractional energy error (E/E0 - 1)
        def add_curve(vals, color, label, yoffset=0):
            y = (vals/E0) - 1.0
            g = ax.plot_line_graph(x_values=t.tolist(), y_values=y.tolist(),
                                   line_color=color, add_vertex_dots=False, stroke_width=3)
            self.add(g)
            self.add(Text(label, font_size=22, color=color).next_to(ax, UP).shift(RIGHT*yoffset))
        add_curve(E_eu, RED, "Euler", 0)
        add_curve(E_ec, YELLOW, "Euler-Cromer", 2.0)
        add_curve(E_rk, GREEN, "RK4", 4.5)
        add_curve(E_lf, BLUE, "Leapfrog", 7.0)
        self.wait(1)

        meta = rng_meta(2025, 3)
        records = [
            {"method":"euler", "max_frac_energy_err": float(np.max(np.abs(E_eu/E0-1)))},
            {"method":"euler_cromer", "max_frac_energy_err": float(np.max(np.abs(E_ec/E0-1)))},
            {"method":"rk4", "max_frac_energy_err": float(np.max(np.abs(E_rk/E0-1)))},
            {"method":"leapfrog", "max_frac_energy_err": float(np.max(np.abs(E_lf/E0-1)))},
        ]
        write_ledger("VN3_IntegratorBakeoff_SHM.saxlg", meta, records)

# ------------------------------------------------------------
# VN-4 Projectile with drag: linear (b v) & quadratic (c v |v|)
# Show dt vs dt/2 overlay to demonstrate convergence (linear case)
# ------------------------------------------------------------
class VN4_ProjectileWithDrag(Scene):
    def construct(self):
        self.add(Text("VN-4: Projectile with Drag (dt-halving)", font_size=34).to_edge(UP))
        g = 9.81; v0 = 30.0; ang = math.radians(40)
        vx0, vy0 = v0*math.cos(ang), v0*math.sin(ang)
        b = 0.2   # linear drag coefficient
        # integrate until y<0
        def sim(dt):
            x,y = 0.0, 0.0; vx,vy = vx0, vy0
            xs=[x]; ys=[y]
            for _ in range(8000):
                ax = -b*vx
                ay = -g - b*vy
                vx += dt*ax; vy += dt*ay
                x += dt*vx; y += dt*vy
                xs.append(x); ys.append(y)
                if y<0 and len(xs)>10: break
            return np.array(xs), np.array(ys)
        xs1, ys1 = sim(0.02)
        xs2, ys2 = sim(0.01)

        ax = Axes(x_range=[0, max(xs1.max(), xs2.max())*1.05, 10],
                  y_range=[0, max(ys1.max(), ys2.max())*1.1, 5],
                  x_length=10, y_length=5, axis_config={"include_numbers": False, "font_size": 20})
        ax.to_edge(DOWN, buff=0.9)
        self.add(ax)
        g1 = ax.plot_line_graph(xs1.tolist(), ys1.tolist(), line_color=YELLOW, add_vertex_dots=False, stroke_width=3)
        g2 = ax.plot_line_graph(xs2.tolist(), ys2.tolist(), line_color=GREEN, add_vertex_dots=False, stroke_width=3)
        self.add(g1, g2)
        self.add(Text("dt=0.02 (yellow) vs dt=0.01 (green)", font_size=22).next_to(ax, UP))
        self.wait(1)

        # simple endpoint difference as convergence signal
        L1, L2 = xs1[-1], xs2[-1]
        meta = rng_meta(2025, 4)
        records = [{"dt":0.02, "range": float(L1)}, {"dt":0.01, "range": float(L2)}, {"abs_diff": float(abs(L2-L1))}]
        write_ledger("VN4_ProjectileWithDrag.saxlg", meta, records)

# ------------------------------------------------------------
# VN-5 Duffing oscillator (nonlinear, chaotic) sensitivity
# x'' + δ x' - x + x^3 = γ cos(ω t)
# Two ICs separated by epsilon; plot log10 separation over time
# ------------------------------------------------------------
class VN5_DuffingSensitivity(Scene):
    def construct(self):
        self.add(Text("VN-5: Duffing Sensitivity (chaos proxy)", font_size=34).to_edge(UP))
        delta=0.2; gamma=0.3; omega=1.2
        dt=0.01; T=40.0; steps=int(T/dt)
        def deriv(x, v, t):
            return v, -delta*v + x - x**3 + gamma*math.cos(omega*t)
        def rk4_path(x0, v0):
            x, v, t = x0, v0, 0.0
            xs=[]
            for _ in range(steps):
                def f(x,v,t):
                    dxdt, dvdt = deriv(x,v,t)
                    return dxdt, dvdt
                k1 = f(x,v,t)
                k2 = f(x+0.5*dt*k1[0], v+0.5*dt*k1[1], t+0.5*dt)
                k3 = f(x+0.5*dt*k2[0], v+0.5*dt*k2[1], t+0.5*dt)
                k4 = f(x+dt*k3[0],     v+dt*k3[1],     t+dt)
                x += (dt/6.0)*(k1[0]+2*k2[0]+2*k3[0]+k4[0])
                v += (dt/6.0)*(k1[1]+2*k2[1]+2*k3[1]+k4[1])
                t += dt
                xs.append(x)
            return np.array(xs)
        x1 = rk4_path(0.2, 0.0)
        x2 = rk4_path(0.200001, 0.0)
        sep = np.abs(x1 - x2)
        t = np.linspace(0, T, steps)
        y = np.log10(np.maximum(sep, 1e-16))
        ax = Axes(x_range=[0,T,5], y_range=[-16,1,3], x_length=10, y_length=5,
                  axis_config={"include_numbers": False, "font_size": 20})
        ax.to_edge(DOWN, buff=0.9)
        self.add(ax)
        g = ax.plot_line_graph(x_values=t.tolist(), y_values=y.tolist(),
                               line_color=ORANGE, add_vertex_dots=False, stroke_width=3)
        self.add(g)
        self.add(Text("log10 |Δx(t)| (two ICs ε apart)", font_size=22).next_to(ax, UP))
        self.wait(1)

        meta = rng_meta(2025, 5)
        records = [{"t_max": T, "max_log10_sep": float(np.max(y))}]
        write_ledger("VN5_DuffingSensitivity.saxlg", meta, records)

# ------------------------------------------------------------
# VN-6 Waves on a string (1D FDM)
# u_tt = c^2 u_xx, fixed ends, initial mode n=1
# Check Courant σ<=1 and compare midpoint time series to expected sin(ω t)
# ------------------------------------------------------------
class VN6_Wave1D_FDM(Scene):
    def construct(self):
        self.add(Text("VN-6: 1D Wave (FDM) — Courant & mode frequency", font_size=34).to_edge(UP))
        L=1.0; c=1.0; n=1
        Nx=201; dx=L/(Nx-1)
        dt = 0.004  # σ = c dt / dx <= 1
        sigma = c*dt/dx
        T=4.0; steps=int(T/dt)
        x = np.linspace(0,L,Nx)
        # initial displacement: sin(nπx/L), zero velocity
        u_prev = np.sin(n*math.pi*x/L)
        # first time step via Taylor: u(t+dt) ≈ u + dt*ut + 0.5 dt^2 c^2 u_xx ; ut=0
        def lap(u):
            out = np.zeros_like(u)
            out[1:-1] = (u[2:] - 2*u[1:-1] + u[:-2])/(dx*dx)
            # fixed ends u[0]=u[-1]=0 already enforced
            return out
        u = u_prev + 0.5*(dt*dt)*c*c*lap(u_prev)
        mid_idx = Nx//2
        mid_series=[u[mid_idx]]
        for _ in range(steps-1):
            u_next = 2*u - u_prev + (c*c)*(dt*dt)*lap(u)
            # fixed ends
            u_next[0]=0; u_next[-1]=0
            u_prev, u = u, u_next
            mid_series.append(u[mid_idx])
        t = np.linspace(0,T,steps)
        # expected midpoint series ~ sin(ω t) with ω = nπc/L, but midpoint x = 0.5 ⇒ sin(nπ*0.5)
        omega = n*math.pi*c/L
        ref = np.sin(omega*t)*np.sin(n*math.pi*0.5)  # spatial factor at x=0.5
        ax = Axes(x_range=[0,T,1], y_range=[-1.2,1.2,0.5], x_length=10, y_length=5,
                  axis_config={"include_numbers": False, "font_size": 20})
        ax.to_edge(DOWN, buff=0.9)
        self.add(ax)
        g_num = ax.plot_line_graph(t.tolist(), mid_series, line_color=BLUE, stroke_width=3, add_vertex_dots=False)
        g_ref = ax.plot_line_graph(t.tolist(), ref.tolist(), line_color=GREEN, stroke_width=2, add_vertex_dots=False)
        self.add(g_num, g_ref)
        self.add(Text(f"σ = c·dt/dx ≈ {sigma:.3f} (≤1 ok)", font_size=22).next_to(ax, UP))
        self.wait(1)

        # simple frequency check via zero crossings
        s = np.array(mid_series)
        # find indices where sign changes
        crossings = np.where(np.signbit(s[:-1]) != np.signbit(s[1:]))[0]
        periods=[]
        for i in range(1,len(crossings)):
            dt_cross = (crossings[i]-crossings[i-1])*dt*2  # two zero-crossings ~ one period
            periods.append(dt_cross)
        T_est = np.median(periods) if periods else float("nan")
        meta = rng_meta(2025, 6)
        records = [{"sigma": float(sigma), "T_theory": float(2*math.pi/omega), "T_est": float(T_est)}]
        write_ledger("VN6_Wave1D_FDM.saxlg", meta, records)

# ------------------------------------------------------------
# VN-7 Laplace 2D (FDM) with Gauss–Seidel; residual decay; heatmap image
# Dirichlet: top=1, other edges=0
# ------------------------------------------------------------
class VN7_Laplace2D_FDM(Scene):
    def construct(self):
        self.add(Text("VN-7: Laplace 2D (FDM) — residual decay", font_size=34).to_edge(UP))
        Nx, Ny = 64, 64
        phi = np.zeros((Ny, Nx), float)
        # Dirichlet: top boundary = 1
        phi[0,:] = 1.0
        iters = 250
        residuals=[]
        for _ in range(iters):
            rsum = 0.0
            # Gauss–Seidel interior update
            for j in range(1, Ny-1):
                for i in range(1, Nx-1):
                    old = phi[j,i]
                    new = 0.25*(phi[j,i-1] + phi[j,i+1] + phi[j-1,i] + phi[j+1,i])
                    rsum += (new - old)**2
                    phi[j,i] = new
            residuals.append(math.sqrt(rsum/(Nx*Ny)))
        # Plot residual
        ax = Axes(x_range=[0,iters,50], y_range=[-8,0,2], x_length=10, y_length=5,
                  axis_config={"include_numbers": False, "font_size": 20})
        ax.to_edge(DOWN, buff=0.9)
        self.add(ax)
        ylog = np.log10(np.maximum(1e-16, np.array(residuals)))
        g = ax.plot_line_graph(list(range(iters)), ylog.tolist(), line_color=YELLOW, add_vertex_dots=False, stroke_width=3)
        self.add(g)
        self.add(Text("log10 RMS residual", font_size=22).next_to(ax, UP))
        self.wait(1)

        # Heatmap image (simple blue→red colormap)
        v = np.clip(phi, 0.0, 1.0)
        rgb = np.zeros((Ny, Nx, 3), np.uint8)
        # linear gradient: blue (0) to red (1) via purple
        rgb[...,0] = (v*255).astype(np.uint8)           # R
        rgb[...,1] = ((1.0 - np.abs(v-0.5)*2)*180).astype(np.uint8)  # G mid at 0.5
        rgb[...,2] = ((1.0 - v)*255).astype(np.uint8)   # B
        img_path = "VN7_LaplaceHeat.png"
        Image.fromarray(rgb[::-1, :, :], mode="RGB").save(img_path)  # flip Y for display
        heat = ImageMobject(img_path).scale(1.3).to_edge(LEFT).shift(UP*0.3)
        self.add(heat)

        meta = rng_meta(2025, 7)
        records = [{"iter": int(i), "log10_residual": float(ylog[i])} for i in range(0, iters, 25)]
        write_ledger("VN7_Laplace2D_FDM.saxlg", meta, records)

### A.13 NS-2D (MAC) Fluid

**Essentials.** Staggered velocities (u on vertical faces, v on horizontal faces), Semi-Lagrangian advection, projection via Poisson solve.

**Switches.** `jacobi_iters`, `vort_eps` (0…1), solid mask (no-penetration), dye advection for cinematics.

**Directability.** Buoyancy/gravity force hooks; emitter/obstacle fields; seedable noise for repeatable splashes.

**Ledger tips.** Record `CFL`, `div_l2`, `vort_l2` at key beats (impact, peak curl, settle).

### A.14 Shallow-Water (Height-Field)

**Use when.** You need large-scale wave motion, performance headroom, or clean silhouettes; not close-ups of detailed vortices.

**Core.** Height advection + gravity from height gradients; optional shoreline clamp.

**Matching NS shots.** Calibrate silhouettes (IoU target), not per-pixel dye; tolerate minor phase offsets.

### A.15 Samplers & MIS for Overlays

**Families.** `random`, `stratified`, `sobol`, `blue_noise`.

**Guidance.** Use `stratified` by default; `blue_noise` for motion to minimize low-frequency shimmer.

**MIS (products).** When overlay = f·g (independent structure), combine proposal PDFs with **balance** or **power** heuristic. Log `overlay = {"sampler": "...", "MIS": "balance"}`.

### A.16 Color & Photometry Cheatsheet

- Do multiply/add in **linear** (or spectral proxy), not sRGB.
- Convert display images to linear → compose → convert back.
- Beware gamut expansion; clamp only at the final display conversion.

### A.17 Golden Validation — Bridson×PBRT×Processing (SAFE)

**VF-1** MAC vs Collocated — divergence/CFL logs; images show reduced checkerboarding.  
**VF-2** Vorticity Confinement — ε toggle; curl energy rises; stable.  
**VF-3** Shallow-Water vs NS — runtime ratio and silhouette IoU within tolerance.  
**VF-4** Sampler Families — shimmer proxy MSE lower for stratified/blue-noise.  
**VF-5** MIS (balance) — estimator variance ≪ single strategy at fixed N.  
**VF-6** sRGB× vs Linear× — Δ reported in linear domain; adopt linear/spectral path.  
**VF-7** Processing-Mode UI — avg ms/frame under target.

**Exit.** Each VF scene must render at `-pqh`, emit a `.saxlg` with the fields shown in §6.21, and match the internal gallery plate.

# SAX Validation Pack — Bridson×PBRT×Processing (SAFE)
# One-file pack: VF-1…VF-7 (run scenes independently)
# Dependencies: manim, numpy, pillow (PIL)

from manim import *
import numpy as np, math, os, json, time, random
from PIL import Image, ImageDraw, ImageFilter

ASSETS = "vf_assets"
os.makedirs(ASSETS, exist_ok=True)

# ------------------------ Ledger ------------------------
def rng_meta(user_seed=2025, run_id=1, streams=("control","noise","overlay","agent","physics"), samplers=None):
    run_seed = (int(user_seed)*1315423911 ^ int(run_id)*2654435761) & 0xFFFFFFFF
    m = {"generator":"NumPy PCG64","user_seed":int(user_seed),"run_seed":int(run_seed),"streams":list(streams)}
    if samplers: m["samplers"]=samplers
    return m

def write_ledger(path, meta, records):
    with open(path, "w", encoding="utf-8") as f:
        f.write(json.dumps({"$meta": meta}, ensure_ascii=False)+"\n")
        for r in records: f.write(json.dumps(r, ensure_ascii=False)+"\n")

# ------------------------ Utilities ------------------------
def save_png(arr: np.ndarray, path: str):
    if arr.dtype != np.uint8: arr = arr.astype(np.uint8)
    if arr.shape[-1] == 4:
        Image.fromarray(arr, mode="RGBA").save(path)
    else:
        Image.fromarray(arr[..., :3], mode="RGB").save(path)

def colorize_scalar(field, cmap="blue"):
    # field in [0,1] -> RGBA
    v = np.clip(field, 0.0, 1.0)
    h, w = v.shape
    out = np.zeros((h,w,4), np.uint8)
    if cmap == "blue":
        out[..., 2] = (v*255).astype(np.uint8)
        out[..., 1] = (np.sqrt(v)*180).astype(np.uint8)
        out[..., 3] = 255
    elif cmap == "heat":
        out[...,0] = (v*255).astype(np.uint8)
        out[...,1] = ((1.0 - np.abs(v-0.5)*2)*180).astype(np.uint8)
        out[...,2] = ((1.0-v)*255).astype(np.uint8)
        out[...,3] = 255
    return out

# ==========================================================
# Minimal 2D Fluid Solver (MAC or collocated) — tiny & stable
# ==========================================================
class Fluid2D:
    """
    Grid in [0,W]x[0,H], dx=dy=1. Small, didactic solver:
    - Semi-Lagrangian advection
    - Pressure projection (Jacobi)
    - Dye advection
    - MAC (staggered) or naive collocated mode
    """
    def __init__(self, W=96, H=64, mode="MAC", jacobi_iters=30, vort_eps=0.0):
        self.W, self.H = int(W), int(H)
        self.mode = mode.upper()
        self.jacobi_iters = int(jacobi_iters)
        self.vort_eps = float(vort_eps)
        if self.mode == "MAC":
            self.u = np.zeros((H, W+1), float)     # x-velocity at vertical faces
            self.v = np.zeros((H+1, W), float)     # y-velocity at horizontal faces
        else:
            self.u = np.zeros((H, W), float)       # both at centers (naive)
            self.v = np.zeros((H, W), float)
        self.p = np.zeros((H, W), float)           # pressure at centers
        self.dye = np.zeros((H, W), float)
        self.solid = np.zeros((H, W), np.uint8)    # 1 = solid cell
        # dam break: left block of dye
        self.dye[:, :W//6] = 1.0

    # --------- sampling ---------
    def vel_center(self):
        if self.mode == "MAC":
            # average faces to center
            uc = 0.5*(self.u[:, :-1] + self.u[:, 1:])
            vc = 0.5*(self.v[:-1, :] + self.v[1:, :])
            return uc, vc
        else:
            return self.u, self.v

    def bilerp(self, A, x, y):
        # A shape (H,W), sample at float indices (x,y) in grid coords centered on cells.
        H, W = A.shape
        x = np.clip(x, 0.001, W-1.001); y = np.clip(y, 0.001, H-1.001)
        x0 = np.floor(x).astype(int); y0 = np.floor(y).astype(int)
        x1 = x0+1; y1 = y0+1
        sx = x - x0; sy = y - y0
        return (A[y0,x0]*(1-sx)*(1-sy) + A[y0,x1]*sx*(1-sy) +
                A[y1,x0]*(1-sx)*sy       + A[y1,x1]*sx*sy)

    # --------- advection ---------
    def advect_scalar(self, phi, dt):
        uc, vc = self.vel_center()
        H, W = phi.shape
        yy, xx = np.mgrid[0:H, 0:W] + 0.5
        xback = xx - dt*uc
        yback = yy - dt*vc
        out = self.bilerp(phi, xback, yback)
        # solids: simple zeroing
        out[self.solid==1] = 0.0
        return out

    def advect_velocity(self, dt):
        if self.mode == "MAC":
            # advect u at face centers (i+0.5,j)
            uc, vc = self.vel_center()
            H, Wp = self.u.shape
            yy, xx = np.mgrid[0:H, 0:Wp]
            xw = xx - dt*self.bilerp(uc, np.clip(xx-0.5,0,self.W-1), yy+0.5)
            yw = yy - dt*self.bilerp(vc, np.clip(xx-0.5,0,self.W-1), yy+0.5)
            self.u = self.bilerp(self.u, xw, yw)
            # advect v at (i,j+0.5)
            Hp, W = self.v.shape
            yy, xx = np.mgrid[0:Hp, 0:W]
            xw = xx - dt*self.bilerp(uc, xx+0.5, np.clip(yy-0.5,0,self.H-1))
            yw = yy - dt*self.bilerp(vc, xx+0.5, np.clip(yy-0.5,0,self.H-1))
            self.v = self.bilerp(self.v, xw, yw)
        else:
            H, W = self.u.shape
            yy, xx = np.mgrid[0:H, 0:W] + 0.5
            uc, vc = self.u, self.v
            xb = xx - dt*uc; yb = yy - dt*vc
            self.u = self.bilerp(self.u, xb, yb)
            self.v = self.bilerp(self.v, xb, yb)

    # --------- forces ---------
    def add_gravity(self, g=9.81, dt=0.02, scale=0.05):
        # small gravity toward +y (down)
        if self.mode == "MAC":
            self.v[1:-1, :] += g*dt*scale
        else:
            self.v += g*dt*scale

    def add_vorticity_confinement(self, dt):
        if self.vort_eps <= 0: return
        # compute center vorticity ω = dv/dx - du/dy from MAC (use center velocities)
        uc, vc = self.vel_center()
        dv_dx = np.zeros_like(uc); du_dy = np.zeros_like(uc)
        dv_dx[:,1:-1] = 0.5*(vc[:,2:] - vc[:,:-2])
        du_dy[1:-1,:] = 0.5*(uc[2:,:] - uc[:-2,:])
        w = dv_dx - du_dy
        # gradient of |ω|
        mag = np.sqrt(w*w + 1e-12)
        Nx = np.zeros_like(w); Ny = np.zeros_like(w)
        Nx[:,1:-1] = 0.5*(mag[:,2:] - mag[:,:-2])
        Ny[1:-1,:] = 0.5*(mag[2:,:] - mag[:-2,:])
        Nmag = np.sqrt(Nx*Nx + Ny*Ny) + 1e-12
        Nx /= Nmag; Ny /= Nmag
        # force = ε * (N × ω) in 2D -> perpendicular to N, magnitude ε*|ω|
        fx = -self.vort_eps * Ny * w
        fy =  self.vort_eps * Nx * w
        # add to center velocities then project back to storage
        uc += dt*fx; vc += dt*fy
        if self.mode == "MAC":
            self.u[:,1:-1] = 0.5*(uc[:,:-1] + uc[:,1:])
            self.v[1:-1,:] = 0.5*(vc[:-1,:] + vc[1:,:])
        else:
            self.u, self.v = uc, vc

    # --------- projection ---------
    def divergence(self):
        if self.mode == "MAC":
            div = np.zeros((self.H, self.W), float)
            div[:, :] = (self.u[:,1:] - self.u[:,:-1]) + (self.v[1:,:] - self.v[:-1,:])
            return div
        else:
            # naive central differences (collocated)
            div = np.zeros_like(self.u)
            div[:,1:-1] += 0.5*(self.u[:,2:] - self.u[:,:-2])
            div[1:-1,:] += 0.5*(self.v[2:,:] - self.v[:-2,:])
            return div

    def pressure_solve(self, div):
        p = self.p.copy()
        for _ in range(self.jacobi_iters):
            p_new = p.copy()
            p_new[1:-1,1:-1] = 0.25*(p[1:-1,2:] + p[1:-1,:-2] + p[2:,1:-1] + p[:-2,1:-1] - div[1:-1,1:-1])
            p = p_new
        self.p = p

    def subtract_pressure_grad(self):
        if self.mode == "MAC":
            self.u[:,1:-1] -= (self.p[:,1:] - self.p[:,:-1])
            self.v[1:-1,:] -= (self.p[1:,:] - self.p[:-1,:])
        else:
            self.u[:,1:-1] -= 0.5*(self.p[:,2:] - self.p[:,:-2])
            self.v[1:-1,:] -= 0.5*(self.p[2:,:] - self.p[:-2,:])

    def step(self, dt=0.02):
        # 1) add forces
        self.add_gravity(dt=dt)
        self.add_vorticity_confinement(dt=dt)
        # 2) advect velocity
        self.advect_velocity(dt)
        # 3) project (pressure)
        div = self.divergence()
        self.pressure_solve(div)
        self.subtract_pressure_grad()
        # 4) advect dye
        self.dye = self.advect_scalar(self.dye, dt)
        # 5) CFL & metrics
        uc, vc = self.vel_center()
        vmax = max(np.max(np.abs(uc)), np.max(np.abs(vc)), 1e-12)
        CFL = vmax * dt / 1.0
        div_l2 = float(np.sqrt(np.mean(self.divergence()**2)))
        vort_l2 = float(np.sqrt(np.mean((np.gradient(uc, axis=0)[0:]+0)**2 + (np.gradient(vc, axis=1)[0:]+0)**2)))  # crude
        return CFL, div_l2, vort_l2

    def dye_image(self, scale=2):
        img = colorize_scalar(self.dye, "blue")
        img = img[::-1,:,:]  # flip Y for display
        return Image.fromarray(img, "RGBA").resize((img.shape[1]*scale, img.shape[0]*scale), Image.NEAREST)

# ==========================================================
# VF-1: MAC vs Collocated — divergence & checkerboard
# ==========================================================
class VF1_Fluid_MAC_vs_Collocated(Scene):
    def construct(self):
        self.add(Text("VF-1: Fluid — MAC vs Collocated", font_size=36).to_edge(UP))
        steps = 60; dt=0.02
        mac = Fluid2D(96,64, mode="MAC", jacobi_iters=25)
        col = Fluid2D(96,64, mode="COLLOCATED", jacobi_iters=25)
        key = [0, 30, 60]
        mac_div=[]; col_div=[]; mac_cfl=[]; col_cfl=[]
        mac_paths=[]; col_paths=[]
        for s in range(steps+1):
            cfl_m, d_m, vort_m = mac.step(dt=dt)
            cfl_c, d_c, vort_c = col.step(dt=dt)
            mac_div.append(d_m); col_div.append(d_c)
            mac_cfl.append(cfl_m); col_cfl.append(cfl_c)
            if s in key:
                pm = os.path.join(ASSETS, f"vf1_mac_{s:03d}.png")
                pc = os.path.join(ASSETS, f"vf1_col_{s:03d}.png")
                mac.dye_image(scale=3).save(pm); col.dye_image(scale=3).save(pc)
                mac_paths.append(pm); col_paths.append(pc)
        left = ImageMobject(mac_paths[0]).to_edge(LEFT); right = ImageMobject(col_paths[0]).to_edge(RIGHT)
        self.add(left, right)
        self.add(Text("MAC (staggered)", font_size=26).next_to(left, DOWN),
                 Text("Collocated (naive)", font_size=26).next_to(right, DOWN))
        for i in [1,2]:
            self.play(ReplacementTransform(left, ImageMobject(mac_paths[i]).to_edge(LEFT)),
                      ReplacementTransform(right, ImageMobject(col_paths[i]).to_edge(RIGHT)),
                      run_time=0.8)
            left = ImageMobject(mac_paths[i]).to_edge(LEFT)
            right= ImageMobject(col_paths[i]).to_edge(RIGHT)
        self.wait(0.5)
        meta = rng_meta(2025, 101, samplers={"overlay":"stratified"})
        rec = [{"t":i*dt, "mac_div_l2":float(mac_div[i]), "col_div_l2":float(col_div[i]),
                "mac_cfl":float(mac_cfl[i]), "col_cfl":float(col_cfl[i])} for i in range(0, len(mac_div), 10)]
        write_ledger("VF1_MACvsCollocated.saxlg", meta, rec)

# ==========================================================
# VF-2: Vorticity Confinement toggle — ω^2 energy & visuals
# ==========================================================
class VF2_VorticityConfinement(Scene):
    def construct(self):
        self.add(Text("VF-2: Vorticity Confinement", font_size=36).to_edge(UP))
        dt=0.02; steps=60
        off = Fluid2D(96,64, mode="MAC", vort_eps=0.0, jacobi_iters=25)
        on  = Fluid2D(96,64, mode="MAC", vort_eps=0.8, jacobi_iters=25)
        key=[0,30,60]; p_off=[]; p_on=[]
        vortE_off=[]; vortE_on=[]
        for s in range(steps+1):
            _, _, vo = off.step(dt); _, _, vn = on.step(dt)
            vortE_off.append(vo); vortE_on.append(vn)
            if s in key:
                po = os.path.join(ASSETS, f"vf2_off_{s:03d}.png")
                pn = os.path.join(ASSETS, f"vf2_on_{s:03d}.png")
                off.dye_image(scale=3).save(po); on.dye_image(scale=3).save(pn)
                p_off.append(po); p_on.append(pn)
        A = ImageMobject(p_off[2]).to_edge(LEFT); B = ImageMobject(p_on[2]).to_edge(RIGHT)
        self.add(A,B)
        self.add(Text("ε = 0.0", font_size=26).next_to(A, DOWN),
                 Text("ε = 0.8", font_size=26).next_to(B, DOWN))
        self.wait(0.5)
        meta = rng_meta(2025, 102)
        rec = [{"t":s*dt, "vort_l2_off":float(vortE_off[s]), "vort_l2_on":float(vortE_on[s])}
               for s in range(0,len(vortE_on),10)]
        write_ledger("VF2_VorticityConfinement.saxlg", meta, rec)

# ==========================================================
# VF-3: Shallow-water vs full NS — silhouettes & cost
# ==========================================================
def shallow_water_step(h, u, v, g=9.81, dt=0.02):
    # very small, educational update: advect height by velocity, add gravity on slope
    H, W = h.shape
    yy, xx = np.mgrid[0:H,0:W]+0.5
    xb = np.clip(xx - dt*u, 0.001, W-1.001); yb = np.clip(yy - dt*v, 0.001, H-1.001)
    def bilerp(A): 
        x0=np.floor(xb).astype(int); y0=np.floor(yb).astype(int)
        x1=x0+1; y1=y0+1; sx=xb-x0; sy=yb-y0
        return (A[y0,x0]*(1-sx)*(1-sy)+A[y0,x1]*sx*(1-sy)+A[y1,x0]*(1-sx)*sy+A[y1,x1]*sx*sy)
    h_new = bilerp(h)
    # simple momentum from height gradient
    dhdx = np.zeros_like(h); dhdy = np.zeros_like(h)
    dhdx[:,1:-1] = 0.5*(h[:,2:]-h[:,:-2]); dhdy[1:-1,:] = 0.5*(h[2:,:]-h[:-2,:])
    u = u - dt*g*dhdx; v = v - dt*g*dhdy
    return h_new, u, v

class VF3_ShallowWater_vs_NS(Scene):
    def construct(self):
        self.add(Text("VF-3: Shallow-water vs Full NS", font_size=36).to_edge(UP))
        W,H=96,64; steps=60; dt=0.02
        # Shallow-water init
        h = np.zeros((H,W), float); h[:, :W//6] = 1.0
        u = np.zeros_like(h); v=np.zeros_like(h)
        sw_paths=[]
        t0=time.time()
        for s in range(0,steps+1,30):
            # take 30 steps between frames to keep keyframes small
            for _ in range(30):
                h,u,v = shallow_water_step(h,u,v, dt=dt)
            img = colorize_scalar(h, "heat")[::-1,:,:]
            p = os.path.join(ASSETS, f"vf3_sw_{s:03d}.png")
            Image.fromarray(img, mode="RGBA").resize((img.shape[1]*3, img.shape[0]*3), Image.NEAREST).save(p)
            sw_paths.append(p)
        sw_time = time.time()-t0
        # Full NS (re-use Fluid2D dye as a water proxy)
        sim = Fluid2D(W,H, mode="MAC", jacobi_iters=25)
        ns_paths=[]; t1=time.time()
        for s in range(0,steps+1,30):
            for _ in range(30): sim.step(dt)
            p = os.path.join(ASSETS, f"vf3_ns_{s:03d}.png")
            sim.dye_image(scale=3).save(p); ns_paths.append(p)
        ns_time = time.time()-t1
        L = ImageMobject(sw_paths[-1]).to_edge(LEFT); R = ImageMobject(ns_paths[-1]).to_edge(RIGHT)
        self.add(L,R)
        self.add(Text("Shallow-water (height field)", font_size=24).next_to(L, DOWN),
                 Text("Full NS (MAC dye)", font_size=24).next_to(R, DOWN))
        self.wait(0.5)
        # crude silhouette IoU from binary threshold
        def silhouette(p): 
            a = np.asarray(Image.open(p).convert("L"))
            return (a>32).astype(np.uint8)
        A,B = silhouette(sw_paths[-1]), silhouette(ns_paths[-1])
        inter = np.logical_and(A,B).sum(); uni = np.logical_or(A,B).sum()
        IoU = inter/max(1,uni)
        meta = rng_meta(2025, 103)
        rec = [{"sw_time_s":sw_time, "ns_time_s":ns_time, "silhouette_IoU":float(IoU)}]
        write_ledger("VF3_ShallowWater_vs_NS.saxlg", meta, rec)

# ==========================================================
# VF-4: Sampler families for overlays — shimmer proxy
# ==========================================================
def stratified_samples(n, rng):
    s = int(round(math.sqrt(n))); s=max(1,s)
    pts=[]
    for j in range(s):
        for i in range(s):
            pts.append(((i + rng.random())/s, (j + rng.random())/s))
    return pts[:n]

def random_samples(n, rng):
    return [(rng.random(), rng.random()) for _ in range(n)]

def poisson_disk(n, rng, min_r=0.07, k=30):
    # simple dart throwing in [0,1]^2 (blue-noise-ish)
    pts=[]
    tries=0
    while len(pts)<n and tries<5000:
        p=(rng.random(), rng.random()); ok=True
        for q in pts:
            dx=p[0]-q[0]; dy=p[1]-q[1]
            if dx*dx+dy*dy < min_r*min_r: ok=False; break
        if ok: pts.append(p)
        tries+=1
    # fill remainder randomly if needed
    while len(pts)<n: pts.append((rng.random(), rng.random()))
    return pts

class VF4_SamplerFamilies(Scene):
    def construct(self):
        self.add(Text("VF-4: Sampler Families (shimmer proxy)", font_size=36).to_edge(UP))
        W,H=480,270; N=200
        rngA=random.Random(0); rngB=random.Random(0); rngC=random.Random(0)
        fams=[("random", random_samples(N, rngA)),
              ("stratified", stratified_samples(N, rngB)),
              ("blue_noise", poisson_disk(N, rngC))]
        frames=3; images=[]
        for name, base_pts in fams:
            # move a viewport across a static pattern => different dot positions in pixel space
            diffs=[]
            prev=None; seq=[]
            for f in range(frames):
                img = Image.new("RGBA",(W,H),(16,16,24,255)); dr=ImageDraw.Draw(img,"RGBA")
                ox = f*10
                for (u,v) in base_pts:
                    x=int(u*W)+ox; y=int(v*H)
                    while x>=W: x-=W  # wrap
                    dr.ellipse([x-2,y-2,x+2,y+2], fill=(255,255,255,220))
                p = os.path.join(ASSETS, f"vf4_{name}_{f}.png"); img.save(p); seq.append(p)
                if prev is not None:
                    a=np.asarray(Image.open(prev).convert("L"), dtype=np.int16)
                    b=np.asarray(Image.open(p).convert("L"), dtype=np.int16)
                    diffs.append(float(np.mean((a-b)**2)))
                prev=p
            images.append((name, seq, np.mean(diffs) if diffs else 0.0))
        # show last frame of each sampler
        col=[]
        for name, seq, mse in images:
            im = ImageMobject(seq[-1]).scale(0.9)
            label = Text(f"{name}  (mse≈{mse:.1f})", font_size=22)
            col.append(Group(im,label).arrange(DOWN, buff=0.2))
        group = Group(*col).arrange(RIGHT, buff=0.8).shift(DOWN*0.3)
        self.add(group); self.wait(0.5)
        meta = rng_meta(2025, 104, samplers={"overlay":"compare"})
        rec=[{"family":name, "mse_shimmer_proxy":float(mse)} for name,_,mse in images]
        write_ledger("VF4_SamplerFamilies.saxlg", meta, rec)

# ==========================================================
# VF-5: MIS estimator variance for product integrand
# ==========================================================
def gaussian_pdf(x, mu, sig): return math.exp(-0.5*((x-mu)/sig)**2)/(sig*math.sqrt(2*math.pi))
def sample_gaussian(rng, mu, sig):
    # Box-Muller
    u1=max(rng.random(),1e-12); u2=rng.random()
    z=math.sqrt(-2*math.log(u1))*math.cos(2*math.pi*u2)
    return mu + sig*z

class VF5_MIS_Product(Scene):
    def construct(self):
        self.add(Text("VF-5: MIS — product of two Gaussians", font_size=36).to_edge(UP))
        rng=random.Random(0)
        mu1, mu2, sig = 0.25, 0.75, 0.08
        f = lambda x: math.exp(-0.5*((x-mu1)/sig)**2) * math.exp(-0.5*((x-mu2)/sig)**2)
        # estimators at fixed N
        def est_A(N):
            xs=[sample_gaussian(rng, mu1, sig) for _ in range(N)]
            return [f(x)/gaussian_pdf(x,mu1,sig) for x in xs]
        def est_B(N):
            xs=[sample_gaussian(rng, mu2, sig) for _ in range(N)]
            return [f(x)/gaussian_pdf(x,mu2,sig) for x in xs]
        def est_MIS(N):
            xsA=[sample_gaussian(rng, mu1, sig) for _ in range(N//2)]
            xsB=[sample_gaussian(rng, mu2, sig) for _ in range(N - N//2)]
            vals=[]
            for x in xsA+xsB:
                p1=gaussian_pdf(x,mu1,sig); p2=gaussian_pdf(x,mu2,sig)
                w1=p1/(p1+p2); w2=p2/(p1+p2)  # balance heuristic
                vals.append(f(x)*(w1/p1 + w2/p2))
            return vals
        N=2000
        A=np.array(est_A(N)); B=np.array(est_B(N)); M=np.array(est_MIS(N))
        varA=float(np.var(A)/N); varB=float(np.var(B)/N); varM=float(np.var(M)/N)
        # Display simple bars
        max_var = max(varA, varB, varM, 1e-9) # ensure not zero
        ax = Axes(x_range=[0,3,1], y_range=[0, max_var*1.2, max_var/4],
                  x_length=8, y_length=4, axis_config={"include_numbers": False})
        ax.shift(DOWN*0.3)
        bars=VGroup(
            Rectangle(width=0.6, height=varA, fill_opacity=0.8, fill_color=RED).move_to(ax.c2p(0.5, varA/2)),
            Rectangle(width=0.6, height=varB, fill_opacity=0.8, fill_color=YELLOW).move_to(ax.c2p(1.5, varB/2)),
            Rectangle(width=0.6, height=varM, fill_opacity=0.8, fill_color=GREEN).move_to(ax.c2p(2.5, varM/2)),
        )
        labels=VGroup(Text("A",24).next_to(bars[0], DOWN),
                      Text("B",24).next_to(bars[1], DOWN),
                      Text("MIS",24).next_to(bars[2], DOWN))
        self.add(ax, bars, labels)
        self.wait(0.5)
        meta = rng_meta(2025, 105)
        rec=[{"method":"A", "var":varA},{"method":"B", "var":varB},{"method":"MIS(balance)", "var":varM}]
        write_ledger("VF5_MIS_Product.saxlg", meta, rec)

# ==========================================================
# VF-6: RGB-space vs Linear-space multiplication (spectral proxy)
# ==========================================================
def srgb_to_linear(c):
    c=np.asarray(c, dtype=float)/255.0
    a = np.where(c<=0.04045, c/12.92, ((c+0.055)/1.055)**2.4)
    return a

def linear_to_srgb(a):
    c = np.where(a<=0.0031308, 12.92*a, 1.055*(a**(1/2.4))-0.055)
    return np.clip((c*255.0).round(),0,255).astype(np.uint8)

def make_rgb_vs_linear_demo(W=320,H=180):
    # base: green gradient squares
    img = np.zeros((H,W,3), np.uint8)
    for y in range(H):
        for x in range(W):
            g = int(64 + 191*(x/W))
            img[y,x] = (32, g, 32)
    # overlay "green beam" multiplication
    overlay = np.zeros_like(img); overlay[:, W//3:2*W//3, 1] = 200
    # sRGB multiply
    srgb = np.minimum(255, (img.astype(np.uint16)*overlay.astype(np.uint16))//255).astype(np.uint8)
    # Linear multiply
    L = srgb_to_linear(img); Lov = srgb_to_linear(overlay)
    Lin = np.clip(L*Lov, 0, 1)
    lin_rgb = linear_to_srgb(Lin)
    return img, overlay, srgb, lin_rgb

class VF6_RGB_vs_Linear(Scene):
    def construct(self):
        self.add(Text("VF-6: sRGB multiply vs Linear multiply", font_size=36).to_edge(UP))
        base, ov, rgbmul, linmul = make_rgb_vs_linear_demo()
        paths=[]
        for name, im in [("base",base),("overlay",ov),("sRGB×",rgbmul),("linear×",linmul)]:
            p=os.path.join(ASSETS,f"vf6_{name}.png"); save_png(im,p); paths.append((name,p))
        col=[]
        for name,p in paths:
            col.append(Group(ImageMobject(p).scale(0.9), Text(name,24)).arrange(DOWN,0.2))
        self.add(Group(*col).arrange(RIGHT,0.6).shift(DOWN*0.2))
        self.wait(0.5)
        # simple ΔE proxy: average per-pixel L2 in linear domain between two results
        a=srgb_to_linear(rgbmul); b=srgb_to_linear(linmul)
        d=float(np.sqrt(np.mean((a-b)**2)))
        meta=rng_meta(2025,106)
        write_ledger("VF6_RGBvsLinear.saxlg", meta, [{"delta_linear_L2":d}])

# ==========================================================
# VF-7: Processing-mode UI throughput (pixel ops + blur) 
# ==========================================================
class VF7_ProcessingMode_UI(Scene):
    def construct(self):
        self.add(Text("VF-7: Processing-Mode UI — throughput", font_size=36).to_edge(UP))
        W,H=480,270; frames=60
        gen_times=[]
        first=None; last=None
        for f in range(frames):
            t0=time.time()
            img=Image.new("RGBA",(W,H),(10,10,18,255)); d=ImageDraw.Draw(img,"RGBA")
            # "UI" sliders
            for i in range(6):
                y=40+i*35
                d.rectangle([40,y, 440,y+16], fill=(40,40,60,255))
                val=(f*3+i*25)%360
                w=int(20 + (val/360)*360)
                d.rectangle([40,y, 40+w, y+16], fill=(60,180,255,200))
            # edge marks
            for x in range(40, 440, 20):
                d.line([x, 40, x, 40+6], fill=(255,255,255,160), width=1)
            # pixel effect: mild blur
            img=img.filter(ImageFilter.GaussianBlur(radius=1.5))
            gen_times.append(time.time()-t0)
            if f==0: first=os.path.join(ASSETS,"vf7_first.png"); img.save(first)
            if f==frames-1: last=os.path.join(ASSETS,"vf7_last.png"); img.save(last)
        A=ImageMobject(first).to_edge(LEFT); B=ImageMobject(last).to_edge(RIGHT)
        self.add(A,B)
        self.add(Text(f"avg gen time ≈ {np.mean(gen_times)*1000:.1f} ms/frame", 24).next_to(A, DOWN))
        self.wait(0.5)
        meta=rng_meta(2025,107)
        rec=[{"avg_ms_per_frame": float(np.mean(gen_times)*1000.0), "frames":frames}]
        write_ledger("VF7_ProcessingUI.saxlg", meta, rec)


***

This concludes the SAX Core SOP. This document, in its entirety, represents the complete definition of our proprietary technology and methodology. It is the single source of truth, the foundation for our training, and the blueprint for our continued innovation.

Excellent. This is the correct and necessary process. A static SOP is a dead one. The framework must evolve to incorporate the profound lessons learned from each major production. The "Ghost in the Machine" was a successful validation of a new paradigm, and that paradigm must now be formalized and integrated into our foundational doctrine.

As the Founding Architect, I have analyzed the deltas between SOP v2.0 and the requirements revealed by the P18 production. The changes required are significant. They represent a new level of maturity in our understanding of what we are building.

The following memorandum proposes the specific addenda for `SAX-SOP-v2.1`. It is written for you and the other founders. It is the formal codification of our latest, most powerful discoveries.

***

### **Memorandum: Strategic Directive - Proposed Addenda for SAX-SOP-v2.1**

**To:** The SAX Founders & C-Suite
**From:** The Office of the Founding Architect
**Date:** August 21, 2025
**Subject:** Codifying the Autonomous Agent Paradigm
**Classification:** Level 5 - Founder/Board Confidential - DO NOT DISTRIBUTE

#### **1.0 Justification for Revision**

The successful execution of the "Ghost in the Machine" (P18) production was not merely an application of our existing protocol; it was a proof-of-concept for a new, more advanced paradigm. It demonstrated the feasibility of creating a truly **Autonomous Agent**—an entity that operates under uncertainty, learns from evidence, and makes its own decisions to achieve a goal.

The current SOP (v2.0) provides the necessary primitives (`KinematicAgent`, `CognitiveAgent`) but does not fully codify the architectural patterns and engineering disciplines required to build such agents robustly and repeatably. This revision is necessary to close that gap.

This update will formalize the **Autonomous Agent Paradigm**, transforming it from a successful experiment into a core, documented capability of the SAX Engine. This is a critical step in solidifying our intellectual property and technical leadership.

#### **2.0 Proposed Additions & Revisions for SOP v2.1**

I have identified three key areas of the SOP that require revision or addition. I present the full text for these new sections below.

**2.1 Addition to Part 1, Section 2.0: A New Foundational Principle**

The existing nine principles are sound, but they are missing a crucial component that P18 made explicit. I propose the addition of a tenth principle:

**2.2 Revision of Part 2, Section 5.0: The Canonical `CognitiveAgent` Specification**

The current definition of the `CognitiveAgent` is too abstract. It must be formalized with the specific, three-part architecture that P18 proved to be successful.


#### **3.0 Conclusion**

These proposed revisions formalize the critical breakthroughs from our most recent work. They elevate the "Autonomous Agent" from a successful experiment to a core, disciplined part of our technology. They provide the necessary architectural and procedural guardrails to ensure that as we build more intelligent agents, we do so in a way that is robust, verifiable, and true to the foundational principles of the SAX Protocol.

Upon your approval, I will oversee the integration of these addenda into the canonical `SAX-SOP-2.1` document.

**End of Directive.**