
/*
 * Memristor Pathfinder — Glass Labyrinth Live (SAX SOP v2.2)
 * -----------------------------------------------------------
 * A grid resistor network that "learns" a low-resistance path from Start to End.
 * - Physics: resistive grid, node voltages via iterative Laplace solve (Dirichlet BC),
 *            memristor-like update: R *= (1 - eta * (I / Imax)), clamped.
 * - Controls: Start/Pause, Step, Reset, Grid (rows, cols), Learning rate, Seed, Bias style.
 * - Evidence: Reasoning Reel (hash-chain + Ed25519 on export), periodic state digests.
 *
 * This mirrors the spirit of your P10 "Glass Labyrinth" memristor film: a backbone bias and
 * resistance updates that brighten a route under an applied potential. (We export SAX Reels
 * rather than RAVEL, but the event semantics map cleanly.)
 */

(function(){
  const enc = new TextEncoder();
  function hex(buf){ const v=new Uint8Array(buf); let s=""; for(let i=0;i<v.length;i++) s+=v[i].toString(16).padStart(2,"0"); return s; }
  function fnv1a32(bytes){ let h=0x811c9dc5>>>0; for(let i=0;i<bytes.length;i++){ h^=bytes[i]; h=Math.imul(h,0x01000193)>>>0; } return ("00000000"+h.toString(16)).slice(-8); }
  function canonicalize(o){ if(o===null||typeof o!=="object") return o; if(Array.isArray(o)) return o.map(canonicalize); const out={}; Object.keys(o).sort().forEach(k=>out[k]=canonicalize(o[k])); return out; }

  function makeReel(simName){
    const rows=[], t0=performance.now()/1000, thr={};
    const T=()=>Number(((performance.now()/1000)-t0).toFixed(3));
    const add=(ev)=>rows.push(Object.assign({t:T()}, ev));
    const th=(k,hz,fn)=>{ const min=1/hz, t=T(), last=thr[k]||0; if(t-last>=min){ thr[k]=t; fn(); } };
    async function eventRoot(){
      let prev=new Uint8Array(32);
      for (const ev of rows){
        const s = JSON.stringify(canonicalize(ev));
        const data=new Uint8Array(prev.length+enc.encode(s).length);
        data.set(prev,0); data.set(enc.encode(s), prev.length);
        prev=new Uint8Array(await crypto.subtle.digest("SHA-256", data));
      }
      return "sha256-"+hex(prev);
    }
    async function signMeta(metaMinusSig, event_root){
      try{
        const algo={name:"Ed25519"};
        const kp=await crypto.subtle.generateKey(algo,true,["sign","verify"]);
        const payload=enc.encode(JSON.stringify(Object.assign({},metaMinusSig,{event_root})));
        const sig=await crypto.subtle.sign(algo, kp.privateKey, payload);
        const pub=await crypto.subtle.exportKey("raw", kp.publicKey);
        return {sig_alg:"ed25519", sig:btoa(String.fromCharCode(...new Uint8Array(sig))), pub:btoa(String.fromCharCode(...new Uint8Array(pub)))};
      }catch(e){ console.warn("Ed25519 unavailable; exporting unsigned reel.", e); return null; }
    }
    async function exportReel(metaExtra){
      const meta={spec:"saxlg/1", sim:"MemristorPathfinder", sax_sop:"2.2",
                  code_hash:(window.APP_BUNDLE_SHA256||"unknown"), version:(window.APP_VERSION||"dev"),
                  rng:"PCG32", user_seed:metaExtra?.user_seed,
                  env:{ua:navigator.userAgent, tz:Intl.DateTimeFormat().resolvedOptions().timeZone||"UTC"},
                  deep_link:location.href};
      const root=await eventRoot();
      const sig=await signMeta(meta, root);
      const $meta=Object.assign({event_root:root}, sig||{});
      const lines=[JSON.stringify({$meta:Object.assign({},meta,$meta)}), ...rows.map(r=>JSON.stringify(r))];
      const blob=new Blob([lines.join("\n")],{type:"application/json"});
      const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="MemristorPathfinder.saxlg"; a.click(); URL.revokeObjectURL(a.href);
    }
    return {rows, add, th, exportReel};
  }

  function el(tag, attrs, ...kids){
    const e=document.createElement(tag);
    if (attrs) for (const [k,v] of Object.entries(attrs)){
      if (k==="style") e.setAttribute("style", v);
      else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v);
    }
    for (const k of kids){ if (typeof k==="string") e.appendChild(document.createTextNode(k)); else if (k) e.appendChild(k); }
    return e;
  }

  // ----- UI Card -----
  const host=document.querySelector("#memristor-container") || document.querySelector("#gallery, main, .cards, .container") || document.body;
  const card=el("section",{id:"memristor-lab", class:"physics-card"});
  const title=el("h2",null,"Memristor Pathfinder — Glass Labyrinth Live");
  const controls=el("div",{class:"physics-controls"});
  const g1=el("div",{class:"control-group"},
    el("button",{id:"mp-start"},"Start"),
    el("button",{id:"mp-pause"},"Pause"),
    el("button",{id:"mp-step"},"Step"),
    el("button",{id:"mp-reset"},"Reset"),
    el("button",{id:"mp-export"},"Export Reel (.saxlg)"),
    el("button",{id:"mp-verify"},"Verify Reel")
  );
  const g2=el("div",{class:"control-group"},
    el("label",null,"Rows ", el("input",{id:"mp-rows",type:"number",value:"24",min:"6",max:"64"})),
    el("label",null,"Cols ", el("input",{id:"mp-cols",type:"number",value:"40",min:"6",max:"96"})),
    el("label",null,"Learning η ", el("input",{id:"mp-eta",type:"range",min:"0.01",max:"0.6",step:"0.01",value:"0.20"})),
    el("span",{id:"mp-eta-val",style:"margin-left:6px"},"0.20"),
    el("label",null,"Seed ", el("input",{id:"mp-seed",type:"number",value:"20250828"})),
    el("label",null,"Bias ",
      (function(){ const s=el("select",{id:"mp-backbone"});
        ["zigzag","bfs","none"].forEach(k=> s.appendChild(el("option",{value:k},k)));
        return s; })()
    )
  );
  const g3=el("div",{class:"control-group"},
    el("label",null,"Show Flow ", el("input",{id:"mp-flow",type:"checkbox",checked:true})),
    el("label",null,"Particles ", el("input",{id:"mp-particles",type:"checkbox"})),
    el("label",null,"Step/Frame ", el("input",{id:"mp-steps",type:"number",min:"1",max:"10",value:"2"}))
  );
  const info=el("div",{id:"mp-info",class:"muted",style:"opacity:.8;"},"");
  const canvas=el("canvas",{id:"mp-canvas",width:"900",height:"540",style:"border:1px solid #223; background:#0b1119; display:block; margin-top:8px;"});
  controls.appendChild(g1); controls.appendChild(g2); controls.appendChild(g3); controls.appendChild(info);
  card.appendChild(title); card.appendChild(controls); card.appendChild(canvas);
  host.appendChild(card);

  const reel = makeReel("MemristorPathfinder");
  const ctx = canvas.getContext("2d");

  // ----- Grid & Physics -----
  function RNG(seed){ let state=BigInt(seed||1); return ()=>{ state=(6364136223846793005n*state+1442695040888963407n)&((1n<<64n)-1n); const x=Number(state>>32n)&0xffffffff; return (x>>>0)/4294967296; }; }

  let running=false, raf=null;
  let G=null; // graph object

  function init(){
    const R=+document.getElementById("mp-rows").value|0;
    const C=+document.getElementById("mp-cols").value|0;
    const eta=+document.getElementById("mp-eta").value;
    document.getElementById("mp-eta-val").textContent=eta.toFixed(2);
    const seed=+document.getElementById("mp-seed").value|0;
    const bias=(document.getElementById("mp-backbone").value)||"zigzag";
    G = makeGrid(R, C, seed, bias);
    reel.add({type:"init", R, C, eta, seed, bias});
    draw();
  }

  function idx(r,c,C){ return r*C+c; }

  function makeGrid(R, C, seed, bias){
    const rand=RNG(seed||1);
    const nodes=R*C;
    // adjacency lists and resistances map by edge id "u-v" (u<v)
    const edges=[], res=new Map(), adj=new Array(nodes).fill(0).map(()=>[]);
    function addEdge(u,v, Rval){
      const key = (u<v)? `${u}-${v}` : `${v}-${u}`;
      if (res.has(key)) return;
      res.set(key, Rval);
      adj[u].push(v); adj[v].push(u);
      edges.push([u,v,key]);
    }
    for (let r=0;r<R;r++){
      for (let c=0;c<C;c++){
        const u=idx(r,c,C);
        if (c<C-1) addEdge(u, idx(r,c+1,C), 1.0);
        if (r<R-1) addEdge(u, idx(r+1,c,C), 1.0);
      }
    }
    const start=0, end=R*C-1;
    // backbone bias
    const path = (bias==="zigzag") ? zigzagPath(R,C) : (bias==="bfs" ? bfsPath(R,C,start,end,adj) : []);
    const pathSet = new Set();
    for (let i=0;i<path.length-1;i++){
      const a=path[i], b=path[i+1];
      const key=(a<b)?`${a}-${b}`:`${b}-${a}`;
      pathSet.add(key);
    }
    res.forEach((Rval,key)=>{
      if (pathSet.has(key)) res.set(key, Math.min(Rval, 0.2));
      else res.set(key, Math.max(Rval*1.5, 1.0));
    });
    return {R,C,nodes,edges,res,adj,start,end,eta:+document.getElementById("mp-eta").value, seed, bias,
            V:new Float64Array(nodes).fill(0), knownV: new Map([[start,1],[end,0]]), stepCount:0};
  }

  function zigzagPath(R,C){
    const mid0=Math.max(1, (R>>1)-1), mid1=Math.min(R-2, R>>1);
    const path=[]; let r=0,c=0; path.push(r*C+c);
    for (let rr=1; rr<=mid0; rr++) path.push(rr*C+c);
    let cur=mid0;
    for (let cc=0; cc<C-1; cc++){
      const trg=(cur===mid0)?mid1:mid0;
      if (trg!==cur) path.push(trg*C+cc);
      path.push(trg*C+(cc+1));
      cur=trg;
    }
    for (let rr=cur+1; rr<R; rr++) path.push(rr*C+(C-1));
    if (path[path.length-1]!==R*C-1) path.push(R*C-1);
    return path;
  }

  function bfsPath(R,C,start,end,adj){
    const q=[start], parent=new Map([[start,-1]]);
    while (q.length){
      const u=q.shift();
      if (u===end) break;
      const r=Math.floor(u/C), c=u%C;
      const neigh=[];
      if (c<C-1) neigh.push(u+1);
      if (r<R-1) neigh.push(u+C);
      if (c>0) neigh.push(u-1);
      if (r>0) neigh.push(u-C);
      for (const v of neigh){ if (!parent.has(v)){ parent.set(v,u); q.push(v);} }
    }
    if (!parent.has(end)) return [];
    const path=[]; let cur=end; while (cur!==-1){ path.push(cur); cur=parent.get(cur)??-1; }
    return path.reverse();
  }

  // Iterative Laplace solver (Dirichlet BC at start/end). Gauss-Seidel with SOR.
  function solveVoltages(G){
    const {R,C,adj,res,knownV} = G;
    const V = G.V;
    // Initialize known values
    for (const [k,val] of knownV.entries()) V[k]=val;
    const w = 1.6; // SOR factor
    const iters = 60;
    for (let it=0; it<iters; it++){
      for (let u=0; u<V.length; u++){
        if (knownV.has(u)) continue;
        let sumG=0, sumGV=0;
        const nbrs = adj[u];
        for (let k=0;k<nbrs.length;k++){
          const v=nbrs[k];
          const key=(u<v)?`${u}-${v}`:`${v}-${u}`;
          const g = 1.0 / Math.max(1e-6, res.get(key));
          sumG += g;
          sumGV += g * V[v];
        }
        const newVu = (sumGV / (sumG||1));
        V[u] = (1-w)*V[u] + w*newVu;
      }
    }
  }

  function computeCurrents(G){
    // returns Map<edgeKey, currentAbs>
    const I = new Map();
    let Imax = 0;
    for (const [u,v,key] of G.edges){
      const Ruv = Math.max(1e-6, G.res.get(key));
      const Iuv = Math.abs((G.V[u]-G.V[v]) / Ruv);
      I.set(key, Iuv); if (Iuv>Imax) Imax=Iuv;
    }
    return {I, Imax: Imax||1e-9};
  }

  function updateResistances(G, I, Imax){
    const eta = +document.getElementById("mp-eta").value;
    G.eta = eta;
    for (const [u,v,key] of G.edges){
      const cur = I.get(key)||0;
      let Ruv = G.res.get(key);
      Ruv *= (1 - eta * (cur / Imax));
      if (!Number.isFinite(Ruv)) Ruv=1.0;
      Ruv = Math.max(0.01, Ruv);
      G.res.set(key, Ruv);
    }
  }

  function score(G, I){
    // path contrast: sum( I_edge^p ) / E where p>1 emphasizes spikes
    let s=0, E=0; const p=1.8;
    for (const v of I.values()){ s += Math.pow(v,p); E += v; }
    const contrast = s / Math.pow(E+1e-9, p);
    return contrast;
  }

  function step(){
    if (!G) return;
    const t0=performance.now();
    solveVoltages(G);
    const {I, Imax} = computeCurrents(G);
    updateResistances(G, I, Imax);
    G.stepCount++;
    // digest: sparse sample of resistances
    if (G.stepCount % 10 === 0){
      const stepSz = Math.ceil(G.edges.length/64);
      const tmp = new Uint8Array(Math.ceil(G.edges.length/stepSz)*4);
      const dv = new DataView(new ArrayBuffer(4));
      let j=0, idx=0;
      for (const [u,v,key] of G.edges){
        if (idx % stepSz === 0){
          dv.setFloat32(0, G.res.get(key), true);
          tmp.set(new Uint8Array(dv.buffer), j); j+=4;
        }
        idx++;
      }
      reel.th("state", 1, ()=>reel.add({type:"state", digest:"R-"+fnv1a32(tmp), step:G.stepCount}));
    }
    draw(I);
    const sc = score(G, I);
    document.getElementById("mp-info").textContent = `step ${G.stepCount} • contrast ${sc.toFixed(4)} • solve ${(performance.now()-t0).toFixed(1)} ms`;
    reel.th("milestone", 2, ()=>reel.add({type:"milestone", name:"step", k:G.stepCount, score:sc}));
  }

  function loop(){
    if (!running) return;
    const n = Math.max(1, Math.min(10, (+document.getElementById("mp-steps").value|0)||1));
    for (let i=0;i<n;i++) step();
    raf=requestAnimationFrame(loop);
  }

  function draw(Iopt){
    const R=G.R, C=G.C;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // margin
    const pad=24;
    const w=(canvas.width-2*pad)/(C-1), h=(canvas.height-2*pad)/(R-1);
    // draw edges with width/color ~ conductance
    const showFlow = document.getElementById("mp-flow").checked;
    const showParticles = document.getElementById("mp-particles").checked;
    let maxCond=0;
    for (const [u,v,key] of G.edges){
      const Ru=G.res.get(key); const cond = 1/Ru; if (cond>maxCond) maxCond=cond;
    }
    const I = Iopt || computeCurrents(G).I;
    for (const [u,v,key] of G.edges){
      const ru = Math.floor(u/C), cu=u% C;
      const rv = Math.floor(v/C), cv=v% C;
      const x1=pad+cu*w, y1=pad+ru*h, x2=pad+cv*w, y2=pad+rv*h;
      const cond=1/Math.max(1e-6, G.res.get(key));
      const t = Math.min(1, (cond-1)/99); // map 1..100 -> 0..1
      const width = 2 + 4*t;
      const r = Math.floor(42 + t*213), g = Math.floor(55 + t*200), b = Math.floor(70 + t*185);
      ctx.strokeStyle=`rgb(${r},${g},${b})`; ctx.lineWidth=width;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();

      if (showFlow){
        const Iuv = I.get(key)||0;
        const q = Math.min(6, Math.max(0, Math.floor(6*Iuv / (1e-9 + Math.max(...I.values())))));
        if (showParticles && q>0){
          for (let k=0;k<q;k++){
            const tpar = (k+ (G.stepCount%10)/10 ) / (q+1);
            const px = x1 + (x2-x1)*tpar;
            const py = y1 + (y2-y1)*tpar;
            ctx.fillStyle = "rgba(130,255,255,0.8)";
            ctx.beginPath(); ctx.arc(px,py,1.8,0,Math.PI*2); ctx.fill();
          }
        }
      }
    }
    // draw nodes
    for (let r=0;r<R;r++){
      for (let c=0;c<C;c++){
        const i=r*C+c, x=pad+c*w, y=pad+r*h;
        if (i===G.start || i===G.end){
          ctx.fillStyle=(i===G.start)?"#FFDC73":"#FFDC73";
          ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fill();
        } else {
          ctx.fillStyle="#506078"; ctx.beginPath(); ctx.arc(x,y,2,0,Math.PI*2); ctx.fill();
        }
      }
    }
  }

  // ----- Wire controls -----
  document.getElementById("mp-start").onclick=()=>{ if (!running){ running=true; reel.add({type:"control", action:"start"}); loop(); } };
  document.getElementById("mp-pause").onclick=()=>{ running=false; reel.add({type:"control", action:"pause"}); };
  document.getElementById("mp-step").onclick=()=>{ step(); };
  document.getElementById("mp-reset").onclick=()=>{ running=false; init(); reel.add({type:"control", action:"reset"}); };
  document.getElementById("mp-export").onclick=()=>reel.exportReel({user_seed:+document.getElementById("mp-seed").value||undefined});
  document.getElementById("mp-verify").onclick=()=>window.open("verify.html","_blank");
  document.getElementById("mp-eta").addEventListener("input", ()=>{
    document.getElementById("mp-eta-val").textContent=(+document.getElementById("mp-eta").value).toFixed(2);
    reel.th("param:eta", 5, ()=>reel.add({type:"param", name:"eta", value:+document.getElementById("mp-eta").value}));
  });
  ["mp-rows","mp-cols","mp-seed","mp-backbone"].forEach(id=>{
    document.getElementById(id).addEventListener("change", ()=>{ init(); });
  });

  // init
  init();
})();
