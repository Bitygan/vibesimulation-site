
/*
 * Glass Labyrinth (Inverse Optics "Proof of Learning") — Phase 1
 * ---------------------------------------------------------------
 * Adds a new card with canvas + controls. Learner places DETECTORS first,
 * then clicks "Auto‑suggest" to get a minimal set of components (mirrors / optional splitter)
 * to hit the targets. "Fire" simulates rays. A tamper‑evident Reasoning Reel
 * logs: targets_set -> solver_proposal -> human edits -> final energy report.
 *
 * Physics (Phase 1): specular reflection (mirrors) and 50/50 splitters.
 * (Refraction panes/prisms can be added in Phase 2.)
 */

(function(){
  const enc = new TextEncoder();
  function hex(buf){ const v=new Uint8Array(buf); let s=""; for(let i=0;i<v.length;i++) s+=v[i].toString(16).padStart(2,"0"); return s; }

  // ---------- Reasoning Reel (local) ----------
  function canonicalize(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(canonicalize);
    const out = {}; Object.keys(obj).sort().forEach(k => { out[k] = canonicalize(obj[k]); }); return out;
  }
  function canonicalString(o){ return JSON.stringify(canonicalize(o)); }
  function makeReel(simName){
    const rows=[], t0=performance.now()/1000, thr={};
    const T=()=>Number(((performance.now()/1000)-t0).toFixed(3));
    const add = (ev)=>rows.push(Object.assign({t:T()}, ev));
    const th = (k,hz,fn)=>{ const min=1/hz, t=T(), last=thr[k]||0; if(t-last>=min){ thr[k]=t; fn(); } };
    async function eventRoot(){
      let prev = new Uint8Array(32);
      for (const ev of rows){
        const s = canonicalString(ev);
        const data = new Uint8Array(prev.length + enc.encode(s).length);
        data.set(prev, 0); data.set(enc.encode(s), prev.length);
        prev = new Uint8Array(await crypto.subtle.digest("SHA-256", data));
      }
      return "sha256-" + hex(prev);
    }
    async function signMeta(metaMinusSig, event_root){
      try{
        const algo={name:"Ed25519"};
        const kp = await crypto.subtle.generateKey(algo, true, ["sign","verify"]);
        const payload = enc.encode(JSON.stringify(Object.assign({}, metaMinusSig, {event_root})));
        const sig = await crypto.subtle.sign(algo, kp.privateKey, payload);
        const pub = await crypto.subtle.exportKey("raw", kp.publicKey);
        return { sig_alg:"ed25519", sig:btoa(String.fromCharCode(...new Uint8Array(sig))), pub:btoa(String.fromCharCode(...new Uint8Array(pub))) };
      }catch(e){ console.warn("Ed25519 unavailable, exporting unsigned reel.", e); return null; }
    }
    async function exportReel(metaExtra){
      const meta = {
        spec:"saxlg/1", sim: simName, sax_sop:"2.2",
        code_hash:(window.APP_BUNDLE_SHA256||"unknown"), version:(window.APP_VERSION||"dev"),
        rng:"PCG32", user_seed: metaExtra&&metaExtra.user_seed||undefined,
        env:{ ua:navigator.userAgent, tz:Intl.DateTimeFormat().resolvedOptions().timeZone||"UTC" },
        deep_link: location.href
      };
      const root = await eventRoot();
      const sig = await signMeta(meta, root);
      const $meta = Object.assign({event_root:root}, sig||{});
      const lines = [JSON.stringify({$meta:Object.assign({}, meta, $meta)}), ...rows.map(r=>JSON.stringify(r))];
      const blob = new Blob([lines.join("\n")], {type:"application/json"});
      const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=simName + ".saxlg"; a.click(); URL.revokeObjectURL(a.href);
    }
    return { rows, add, th, exportReel };
  }

  // ---------- Geometry helpers ----------
  function dot(a,b){ return a[0]*b[0]+a[1]*b[1]; }
  function sub(a,b){ return [a[0]-b[0], a[1]-b[1]]; }
  function addV(a,b){ return [a[0]+b[0], a[1]+b[1]]; }
  function mul(a,k){ return [a[0]*k, a[1]*k]; }
  function norm(v){ const l=Math.hypot(v[0],v[1])||1; return [v[0]/l, v[1]/l]; }
  function perp(n){ return [-n[1], n[0]]; }
  function dist(a,b){ return Math.hypot(a[0]-b[0], a[1]-b[1]); }

  // Intersection with line segment mirror/splitter (center c, normal n, halfLen L)
  function rayLineHit(ray, elem){
    const {o,d} = ray, {c,n,L} = elem;
    const denom = dot(d,n);
    if (Math.abs(denom) < 1e-6) return null;
    const t = (dot(n, sub(c,o))) / denom;
    if (t <= 1e-6) return null;
    const p = addV(o, mul(d,t));
    // project onto tangential axis
    const tdir = perp(n);
    const s = dot(sub(p,c), tdir);
    if (Math.abs(s) <= L) return {t, p, s, tdir};
    return null;
  }

  // Line-circle intersection (detector capture). Returns t to first hit (if along dir) and point.
  function rayCircleHit(ray, det){
    const {o,d} = ray, {c,r} = det;
    const oc = sub(o,c);
    const b = 2*dot(d, oc);
    const cc = dot(oc, oc) - r*r;
    const disc = b*b - 4*cc;
    if (disc < 0) return null;
    const sqrt = Math.sqrt(disc);
    const t1 = (-b - sqrt)/2;
    const t2 = (-b + sqrt)/2;
    const t = (t1>1e-6) ? t1 : ((t2>1e-6) ? t2 : null);
    if (!t) return null;
    return {t, p:addV(o, mul(d,t))};
  }

  function reflect(dir, n){ // n must be unit
    const k = 2*dot(dir,n);
    return norm(sub(dir, mul(n,k)));
  }

  // ---------- Elements & Simulation ----------
  function makeSource(x,y,angRad){ return {type:"source", p:[x,y], ang:angRad}; }
  function makeMirror(x,y,angRad,L){ const n=[Math.cos(angRad), Math.sin(angRad)]; return {type:"mirror", c:[x,y], n:norm(n), L:L||60}; }
  function makeSplitter(x,y,angRad,L,ratio){ const n=[Math.cos(angRad), Math.sin(angRad)]; return {type:"splitter", c:[x,y], n:norm(n), L:L||50, r: (ratio==null?0.5:ratio)}; }
  function makeDetector(x,y,r,need){ return {type:"detector", c:[x,y], r:r||14, need:(need==null?1:need), got:0}; }

  function simulate(state, maxBounces=10, maxRays=512, energyCut=0.02){
    // state: {source, mirrors:[], splitters:[], detectors:[]}
    const {source, mirrors, splitters, detectors} = state;
    const rays = [{o: source.p.slice(), d:[Math.cos(source.ang), Math.sin(source.ang)], e:1}];
    let hits = new Array(detectors.length).fill(0);

    let safety = 0;
    while (rays.length && safety++ < maxRays){
      const ray = rays.shift();
      if (ray.e < energyCut) continue;
      if (ray.bounces>=maxBounces) continue;

      // nearest intersection
      let best = null; let bestKind=null; let bestIdx=-1;
      // detectors capture
      for (let i=0;i<detectors.length;i++){
        const h = rayCircleHit(ray, detectors[i]);
        if (!h) continue;
        if (!best || h.t < best.t){ best=h; bestKind="detector"; bestIdx=i; }
      }
      // mirrors
      for (let i=0;i<mirrors.length;i++){
        const h = rayLineHit(ray, mirrors[i]);
        if (!h) continue;
        if (!best || h.t < best.t){ best=h; bestKind="mirror"; bestIdx=i; }
      }
      // splitters
      for (let i=0;i<splitters.length;i++){
        const h = rayLineHit(ray, splitters[i]);
        if (!h) continue;
        if (!best || h.t < best.t){ best=h; bestKind="splitter"; bestIdx=i; }
      }
      if (!best){ continue; } // exits canvas or no hit

      if (bestKind==="detector"){
        hits[bestIdx] += ray.e;
        continue;
      } else if (bestKind==="mirror"){
        const m = mirrors[bestIdx];
        const newDir = reflect(ray.d, m.n);
        const next = {o: addV(best.p, mul(newDir, 1e-3)), d: newDir, e: ray.e, bounces:(ray.bounces||0)+1};
        rays.push(next);
      } else if (bestKind==="splitter"){
        const sp = splitters[bestIdx];
        const reflDir = reflect(ray.d, sp.n);
        const thruDir = ray.d.slice(); // pass-through
        const eR = ray.e * sp.r, eT = ray.e * (1-sp.r);
        if (eR > energyCut) rays.push({o: addV(best.p, mul(reflDir, 1e-3)), d: reflDir, e: eR, bounces:(ray.bounces||0)+1});
        if (eT > energyCut) rays.push({o: addV(best.p, mul(thruDir, 1e-3)), d: thruDir, e: eT, bounces:(ray.bounces||0)+1});
      }
    }
    return hits;
  }

  // ---------- Auto-suggest (greedy + tiny local search) ----------
  function suggest(state){
    const {source, detectors} = state;
    const mirrors=[];
    const splitters=[];
    const srcP = source.p;
    const canvas = document.getElementById("glass-canvas");

    function canDirect(d){
      const dir = norm(sub(d.c, srcP));
      const tmpState = {source:{p:srcP, ang:Math.atan2(dir[1], dir[0])}, mirrors:[], splitters:[], detectors:[d]};
      const hits = simulate(tmpState, 6, 256, 0.01);
      return hits[0] > 0.95; // essentially straight shot
    }

    function bestMirrorFor(d){
      const W=canvas.width, H=canvas.height;
      let best=null;
      const gx=12, gy=7;
      for (let iy=1; iy<gy; iy++){
        for (let ix=1; ix<gx; ix++){
          const p=[ (ix/(gx))*W, (iy/(gy))*H ];
          const din = norm(sub(p, srcP));
          const dout= norm(sub(d.c, p));
          let n = norm(sub(din, dout));
          if (Number.isNaN(n[0])||Number.isNaN(n[1])) continue;
          const L=70;
          const mirror = {type:"mirror", c:p, n:n, L};
          const ang = Math.atan2(din[1], din[0]);
          const tmp = {source:{p:srcP, ang}, mirrors:[mirror], splitters:[], detectors:[d]};
          const hits = simulate(tmp, 8, 300, 0.01);
          const score = hits[0] - 0.001*dist(p, srcP);
          if ((best==null || score>best.score) && hits[0]>0.6){
            best = {mirror, score, ang, hit: hits[0]};
          }
        }
      }
      return best;
    }

    const dets = detectors.slice().sort((a,b)=> (b.need||1)-(a.need||1));
    let suggestedAng = source.ang;
    for (const d of dets){
      if (canDirect(d)) {
        suggestedAng = Math.atan2((d.c[1]-srcP[1]), (d.c[0]-srcP[0]));
        continue;
      }
      const bm = bestMirrorFor(d);
      if (bm){
        mirrors.push(bm.mirror);
        suggestedAng = bm.ang;
      }
    }
    return {mirrors, splitters, ang:suggestedAng};
  }

  // ---------- UI + Canvas ----------
  function el(tag, attrs, ...kids){
    const e=document.createElement(tag);
    if (attrs) for (const [k,v] of Object.entries(attrs)) {
      if (k==="style") e.setAttribute("style", v);
      else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v);
    }
    for (const k of kids){ if (typeof k==="string") e.appendChild(document.createTextNode(k)); else if (k) e.appendChild(k); }
    return e;
  }

  const host = document.querySelector("#gallery, main, .cards, .container") || document.body;
  const card = el("section", {id:"glass-labyrinth", class:"physics-card"});
  const title = el("h2", null, "Glass Labyrinth — Inverse Optics (SAX SOP v2.2)");
  const controls = el("div", {class:"physics-controls"});
  const g1 = el("div",{class:"control-group"},
    el("button",{id:"gl-mode-det"}, "Add Detector"),
    el("button",{id:"gl-mode-mir"}, "Add Mirror"),
    el("button",{id:"gl-mode-spl"}, "Add Splitter"),
    el("button",{id:"gl-mode-move"}, "Move"),
    el("button",{id:"gl-mode-del"}, "Delete")
  );
  const g2 = el("div",{class:"control-group"},
    el("label", null, "Source angle ",
      el("input",{id:"gl-angle",type:"range",min:"-180",max:"180",value:"0",step:"1"})
    ),
    el("button",{id:"gl-suggest"}, "Auto‑suggest"),
    el("button",{id:"gl-fire"}, "Fire"),
    el("button",{id:"gl-export"}, "Export Reel (.saxlg)"),
    el("button",{id:"gl-verify"}, "Verify Reel")
  );
  const hint = el("div",{class:"control-group"},
    el("em", null, "Tip: place detectors first, then click Auto‑suggest. Drag elements in Move mode to refine. Rotate mirrors/splitters with Q/E.")
  );
  const canvas = el("canvas",{id:"glass-canvas",width:"900",height:"540",style:"border:1px solid #223; display:block; margin-top:8px; background:#0b1119"});
  const log = el("pre",{id:"gl-log",style:"background:#0b1119;color:#e6edf3;padding:8px;border:1px solid #223; margin-top:8px;"});
  controls.appendChild(g1); controls.appendChild(g2); controls.appendChild(hint);
  card.appendChild(title); card.appendChild(controls); card.appendChild(canvas); card.appendChild(log);
  host.appendChild(card);

  const ctx = canvas.getContext("2d");

  // State
  const reel = makeReel("GlassLabyrinth");
  const state = {
    source: makeSource(80, canvas.height/2, 0),
    mirrors: [], splitters: [], detectors: []
  };

  // UI State
  let mode="det"; let sel=null;
  function setMode(m){ mode=m; reel.add({type:"param", name:"mode", value:m}); }
  document.getElementById("gl-mode-det").onclick=()=>setMode("det");
  document.getElementById("gl-mode-mir").onclick=()=>setMode("mir");
  document.getElementById("gl-mode-spl").onclick=()=>setMode("spl");
  document.getElementById("gl-mode-move").onclick=()=>setMode("move");
  document.getElementById("gl-mode-del").onclick=()=>setMode("del");

  const angleEl = document.getElementById("gl-angle");
  angleEl.addEventListener("input", ()=>{
    const ang = (+angleEl.value) * Math.PI/180;
    state.source.ang = ang;
    reel.th("param:angle", 10, ()=>reel.add({type:"param", name:"source_ang_deg", value:+angleEl.value}));
    draw();
  });

  document.getElementById("gl-export").onclick=()=>reel.exportReel({user_seed: 20250828});
  document.getElementById("gl-verify").onclick=()=>window.open("verify.html","_blank");

  function pick(x,y){
    for (let i=state.detectors.length-1;i>=0;i--){
      const d=state.detectors[i];
      if (Math.hypot(x-d.c[0], y-d.c[1]) <= d.r+8) return {kind:"detector", idx:i};
    }
    for (let i=state.mirrors.length-1;i>=0;i--){
      const m=state.mirrors[i];
      const n=m.n, tdir=[-n[1], n[0]];
      const s = (x-m.c[0])*tdir[0] + (y-m.c[1])*tdir[1];
      const dn = Math.abs((x-m.c[0])*n[0] + (y-m.c[1])*n[1]);
      if (Math.abs(s)<=m.L+6 && dn<=6) return {kind:"mirror", idx:i};
    }
    for (let i=state.splitters.length-1;i>=0;i--){
      const sp=state.splitters[i];
      const n=sp.n, tdir=[-n[1], n[0]];
      const s = (x-sp.c[0])*tdir[0] + (y-sp.c[1])*tdir[1];
      const dn = Math.abs((x-sp.c[0])*n[0] + (y-sp.c[1])*n[1]);
      if (Math.abs(s)<=sp.L+6 && dn<=6) return {kind:"splitter", idx:i};
    }
    return null;
  }

  let dragging=false, dragOff=[0,0];
  canvas.addEventListener("pointerdown", (e)=>{
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    if (mode==="det"){
      const d = makeDetector(x,y,14,1);
      state.detectors.push(d);
      reel.add({type:"targets_set", detectors: state.detectors.map(dd=>({x:dd.c[0], y:dd.c[1], r:dd.r, need:dd.need}))});
      draw();
    } else if (mode==="mir"){
      const m = makeMirror(x,y,0,60);
      state.mirrors.push(m);
      reel.add({type:"user_add", what:"mirror", x, y, ang:0, L:60});
      draw();
    } else if (mode==="spl"){
      const sp = makeSplitter(x,y,0,50,0.5);
      state.splitters.push(sp);
      reel.add({type:"user_add", what:"splitter", x, y, ang:0, L:50, ratio:0.5});
      draw();
    } else if (mode==="move"){
      sel = pick(x,y);
      if (sel){
        dragging=true;
        const obj = (sel.kind==="detector")? state.detectors[sel.idx] : (sel.kind==="mirror" ? state.mirrors[sel.idx] : state.splitters[sel.idx]);
        dragOff = [x-(obj.c[0]), y-(obj.c[1])];
      }
    } else if (mode==="del"){
      const p = pick(x,y);
      if (p){
        if (p.kind==="detector") state.detectors.splice(p.idx,1);
        if (p.kind==="mirror") state.mirrors.splice(p.idx,1);
        if (p.kind==="splitter") state.splitters.splice(p.idx,1);
        reel.add({type:"user_delete", what:p.kind});
        draw();
      }
    }
  });
  canvas.addEventListener("pointermove", (e)=>{
    if (!dragging || !sel) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const obj = (sel.kind==="detector")? state.detectors[sel.idx] : (sel.kind==="mirror" ? state.mirrors[sel.idx] : state.splitters[sel.idx]);
    obj.c = [x-dragOff[0], y-dragOff[1]];
    draw();
  });
  window.addEventListener("pointerup", ()=>{
    if (dragging && sel){ reel.add({type:"user_move", what:sel.kind}); }
    dragging=false; sel=null;
  });

  window.addEventListener("keydown", (e)=>{
    if (!["q","e"].includes(e.key.toLowerCase())) return;
    const p = sel;
    if (!p) return;
    const obj = (p.kind==="mirror")? state.mirrors[p.idx] : (p.kind==="splitter"? state.splitters[p.idx] : null);
    if (!obj) return;
    const sign = (e.key.toLowerCase()==="q") ? -1 : 1;
    const tdir = Math.atan2(obj.n[1], obj.n[0]) + sign * (15*Math.PI/180);
    obj.n = [Math.cos(tdir), Math.sin(tdir)];
    reel.add({type:"user_rotate", what:p.kind, deg:(tdir*180/Math.PI)|0});
    draw();
  });

  document.getElementById("gl-suggest").onclick=()=>{
    const s = suggest(state);
    state.mirrors = s.mirrors;
    state.splitters = s.splitters;
    state.source.ang = s.ang;
    angleEl.value = (s.ang*180/Math.PI).toFixed(0);
    reel.add({type:"solver_proposal", mirrors: s.mirrors.map(m=>({x:m.c[0],y:m.c[1], nx:m.n[0],ny:m.n[1], L:m.L})), splitters: s.splitters, source_ang_deg:+angleEl.value});
    draw();
  };

  document.getElementById("gl-fire").onclick=()=>{
    const hits = simulate(state, 10, 512, 0.02);
    const sum = hits.reduce((a,b)=>a+b,0)||1;
    const report = hits.map(h=>h/sum);
    reel.add({type:"fire", energy: report});
    document.getElementById("gl-log").textContent = "Detector energy fractions:\n" + report.map((v,i)=>`D${i+1}: ${(v*100).toFixed(1)}%`).join("\n");
    draw(true, report);
  };

  function draw(showRays=false, lastReport=null){
    const ctx = document.getElementById("glass-canvas").getContext("2d");
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    ctx.strokeStyle="#12202e"; ctx.lineWidth=1;
    for (let x=0;x<ctx.canvas.width;x+=60){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,ctx.canvas.height); ctx.stroke(); }
    for (let y=0;y<ctx.canvas.height;y+=60){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(ctx.canvas.width,y); ctx.stroke(); }

    ctx.fillStyle="#10b981"; ctx.beginPath(); ctx.arc(state.source.p[0], state.source.p[1], 6, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle="#10b981"; ctx.beginPath();
    ctx.moveTo(state.source.p[0], state.source.p[1]);
    ctx.lineTo(state.source.p[0] + 40*Math.cos(state.source.ang), state.source.p[1] + 40*Math.sin(state.source.ang)); ctx.stroke();

    for (const m of state.mirrors){
      const tdir=[-m.n[1], m.n[0]];
      const a = [m.c[0]-tdir[0]*m.L, m.c[1]-tdir[1]*m.L];
      const b = [m.c[0]+tdir[0]*m.L, m.c[1]+tdir[1]*m.L];
      ctx.strokeStyle="#93c5fd"; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]); ctx.stroke();
    }
    for (const sp of state.splitters){
      const tdir=[-sp.n[1], sp.n[0]];
      const a = [sp.c[0]-tdir[0]*sp.L, sp.c[1]-tdir[1]*sp.L];
      const b = [sp.c[0]+tdir[0]*sp.L, sp.c[1]+tdir[1]*sp.L];
      ctx.strokeStyle="#f5d0fe"; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]); ctx.stroke();
    }
    for (let i=0;i<state.detectors.length;i++){
      const d = state.detectors[i];
      ctx.strokeStyle="#f59e0b"; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(d.c[0], d.c[1], d.r, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle="#e2e8f0"; ctx.fillText("D"+(i+1), d.c[0]+d.r+4, d.c[1]-d.r-4);
      if (lastReport){ ctx.fillText((lastReport[i]*100||0).toFixed(1)+"%", d.c[0]+d.r+4, d.c[1]+12); }
    }

    if (showRays){
      const {source, mirrors, splitters} = state;
      const rays=[{o:source.p.slice(), d:[Math.cos(source.ang), Math.sin(source.ang)], e:1}];
      let safety=0;
      ctx.strokeStyle="#34d399"; ctx.lineWidth=1.5;
      while (rays.length && safety++<200){
        const ray=rays.shift();
        let best=null, bestKind=null, bestIdx=-1;
        for (let i=0;i<state.detectors.length;i++){ const h=rayCircleHit(ray, state.detectors[i]); if (h && (!best||h.t<best.t)){best=h; bestKind="detector"; bestIdx=i;} }
        for (let i=0;i<mirrors.length;i++){ const h=rayLineHit(ray, mirrors[i]); if (h && (!best||h.t<best.t)){best=h; bestKind="mirror"; bestIdx=i;} }
        for (let i=0;i<splitters.length;i++){ const h=rayLineHit(ray, splitters[i]); if (h && (!best||h.t<best.t)){best=h; bestKind="splitter"; bestIdx=i;} }
        const toPt = best ? best.p : [ray.o[0]+ray.d[0]*1000, ray.o[1]+ray.d[1]*1000];
        ctx.beginPath(); ctx.moveTo(ray.o[0], ray.o[1]); ctx.lineTo(toPt[0], toPt[1]); ctx.stroke();
        if (!best) continue;
        if (bestKind==="detector") continue;
        if (bestKind==="mirror"){
          const m=mirrors[bestIdx]; const newDir=reflect(ray.d,m.n);
          rays.push({o:[best.p[0]+newDir[0]*1e-3, best.p[1]+newDir[1]*1e-3], d:newDir, e:ray.e, bounces:(ray.bounces||0)+1});
        } else {
          const sp=splitters[bestIdx]; const rd=reflect(ray.d, sp.n); const td=ray.d.slice();
          rays.push({o:[best.p[0]+rd[0]*1e-3, best.p[1]+rd[1]*1e-3], d:rd, e:ray.e*sp.r, bounces:(ray.bounces||0)+1});
          rays.push({o:[best.p[0]+td[0]*1e-3, best.p[1]+td[1]*1e-3], d:td, e:ray.e*(1-sp.r), bounces:(ray.bounces||0)+1});
        }
      }
    }
  }

  draw();

})();
