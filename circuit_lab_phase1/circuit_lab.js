
/*
 * Circuit Lab (SAX SOP v2.2) — Phase 1
 * -------------------------------------
 * Plug-and-play: include this file near the end of your page.
 * It dynamically inserts a new "Circuit Lab" card (no HTML edits required).
 * Features: DC MNA solver (R, ideal V sources, wires, switches), simple UI, logs,
 * and built-in Reasoning Reel export (tamper-evident hash-chain + Ed25519 signature).
 *
 * If verify.html is present in the same folder, the "Verify Reel" button opens it.
 */

(function(){
  const enc = new TextEncoder();

  function canonicalize(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(canonicalize);
    const out = {};
    Object.keys(obj).sort().forEach(k => { out[k] = canonicalize(obj[k]); });
    return out;
  }
  function canonicalString(o){ return JSON.stringify(canonicalize(o)); }
  function hex(buf){ const v=new Uint8Array(buf); let s=""; for(let i=0;i<v.length;i++) s+=v[i].toString(16).padStart(2,"0"); return s; }

  function fnv1a32(bytes) {
    let h = 0x811c9dc5 >>> 0;
    for (let i = 0; i < bytes.length; i++) { h ^= bytes[i]; h = Math.imul(h, 0x01000193) >>> 0; }
    return ("00000000" + h.toString(16)).slice(-8);
  }
  function sampleFloat32(arr, step){
    const view = new DataView(new ArrayBuffer(4));
    const out = new Uint8Array(Math.ceil(arr.length / step) * 4);
    let j=0;
    for (let i=0; i<arr.length; i+=step){
      view.setFloat32(0, arr[i] || 0, true);
      out.set(new Uint8Array(view.buffer), j); j+=4;
    }
    return out;
  }

  function makeReel(simName){
    const rows=[];
    const t0=performance.now()/1000;
    const throttlers = {};
    function T(){ return Number(((performance.now()/1000)-t0).toFixed(3)); }
    function add(ev){ rows.push(Object.assign({t:T()}, ev)); }
    function th(key,hz,fn){ const min=1/hz; const t=T(); const last=throttlers[key]||0; if(t-last>=min){ throttlers[key]=t; fn(); } }
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
        const algo = { name: "Ed25519" };
        const kp = await crypto.subtle.generateKey(algo, true, ["sign","verify"]);
        const data = enc.encode(JSON.stringify(Object.assign({}, metaMinusSig, {event_root})));
        const sig  = await crypto.subtle.sign(algo, kp.privateKey, data);
        const pub  = await crypto.subtle.exportKey("raw", kp.publicKey);
        return { sig_alg:"ed25519", sig:btoa(String.fromCharCode(...new Uint8Array(sig))), pub:btoa(String.fromCharCode(...new Uint8Array(pub))) };
      }catch(e){ console.warn("Ed25519 not available; exporting unsigned reel.", e); return null; }
    }
    async function exportReel(metaExtra){
      const meta = {
        spec:"saxlg/1",
        sim: simName,
        sax_sop:"2.2",
        code_hash: (window.APP_BUNDLE_SHA256 || "unknown"),
        version: (window.APP_VERSION || "dev"),
        rng: "PCG32",
        user_seed: metaExtra && metaExtra.user_seed || undefined,
        env: { ua: navigator.userAgent, tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" },
        deep_link: location.href
      };
      const root = await eventRoot();
      const sig = await signMeta(meta, root);
      const $meta = Object.assign({event_root: root}, sig||{});
      const lines = [JSON.stringify({$meta:Object.assign({}, meta, $meta)}), ...rows.map(r=>JSON.stringify(r))];
      const blob = new Blob([lines.join("\n")], {type:"application/json"});
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = simName + ".saxlg"; a.click(); URL.revokeObjectURL(a.href);
    }
    return { rows, add, th, exportReel };
  }

  function UnionFind(n){ this.p=new Int32Array(n); for(let i=0;i<n;i++) this.p[i]=i; }
  UnionFind.prototype.find=function(x){ return this.p[x]===x?x:(this.p[x]=this.find(this.p[x])); };
  UnionFind.prototype.union=function(a,b){ a=this.find(a); b=this.find(b); if(a!==b) this.p[b]=a; };

  function Circuit(){
    this.comps=[]; this.nodes=new Set([0]); this.lastSolution=null;
  }
  Circuit.prototype.add=function(eid, kind, n1, n2, value, closed=true){
    eid=String(eid|| (kind+"?")); kind=String(kind||"R").toUpperCase();
    n1=+n1; n2=+n2;
    if (!Number.isFinite(n1)||!Number.isFinite(n2)) throw new Error("Bad nodes");
    if (kind!=="W" && kind!=="S" && !Number.isFinite(+value)) throw new Error("Bad value");
    this.comps=this.comps.filter(c=>c.eid!==eid);
    this.comps.push({eid,kind,n1,n2,value:+value||0,closed:!!closed});
    this.nodes.add(n1); this.nodes.add(n2);
  };
  Circuit.prototype.clear=function(){ this.comps.length=0; this.nodes=new Set([0]); this.lastSolution=null; };

  function buildMNA(c){
    const maxNode = Math.max(0, ...c.nodes);
    const uf = new UnionFind(maxNode+1);
    for (const x of c.comps) if (x.kind==="W" || (x.kind==="S" && x.closed)) uf.union(x.n1, x.n2);
    function root(i){ return uf.find(i); }
    const GND = root(0);
    const nodes = Array.from(new Set(Array.from(c.nodes).map(root)));
    const mapNode = new Map(), nodeList=[];
    for (const n of nodes) if (n!==GND){ mapNode.set(n, nodeList.length); nodeList.push(n); }
    const n = nodeList.length;
    const Vsrc = c.comps.filter(x=>x.kind==="V");
    const m = Vsrc.length;
    const N = n + m;
    const A = new Float64Array(N*N).fill(0);
    const b = new Float64Array(N).fill(0);

    function idx(i,j){ return i*N + j; }
    function stampG(i,j,val){ A[idx(i,i)] += val; A[idx(j,j)] += val; A[idx(i,j)] -= val; A[idx(j,i)] -= val; }

    for (const x of c.comps){
      if (x.kind!=="R") continue;
      const g = 1/Math.max(1e-12, x.value);
      const ni = (root(x.n1)===GND) ? -1 : mapNode.get(root(x.n1));
      const nj = (root(x.n2)===GND) ? -1 : mapNode.get(root(x.n2));
      if (ni>=0 && nj>=0) stampG(ni, nj, g);
      else if (ni>=0) A[idx(ni,ni)] += g;
      else if (nj>=0) A[idx(nj,nj)] += g;
    }

    let k=0;
    for (const x of Vsrc){
      const ni = (root(x.n1)===GND) ? -1 : mapNode.get(root(x.n1));
      const nj = (root(x.n2)===GND) ? -1 : mapNode.get(root(x.n2));
      const row = n + k;
      if (ni>=0){ A[idx(ni,row)] += 1; A[idx(row,ni)] += 1; }
      if (nj>=0){ A[idx(nj,row)] -= 1; A[idx(row,nj)] -= 1; }
      b[row] += x.value;
      k++;
    }
    return {A,b,mapNode,nodeList,GND,Vsrc,n};
  }

  function solveLinear(A,b){
    const n = b.length;
    const M = A.slice();
    const x = b.slice();
    for (let i=0;i<n;i++){
      let p=i, max=Math.abs(M[i*n+i]);
      for (let r=i+1;r<n;r++){ const v=Math.abs(M[r*n+i]); if(v>max){max=v;p=r;} }
      if (max<1e-18) throw new Error("Singular circuit (check connectivity)");
      if (p!==i){ for (let c=i;c<n;c++){ const tmp=M[i*n+c]; M[i*n+c]=M[p*n+c]; M[p*n+c]=tmp; } const t=x[i]; x[i]=x[p]; x[p]=t; }
      const piv = M[i*n+i];
      for (let c=i;c<n;c++) M[i*n+c] /= piv; x[i] /= piv;
      for (let r=0;r<n;r++) if (r!==i){
        const f = M[r*n+i]; if (f===0) continue;
        for (let c=i;c<n;c++) M[r*n+c] -= f*M[i*n+c];
        x[r] -= f*x[i];
      }
    }
    return x;
  }

  Circuit.prototype.solve=function(){
    const {A,b,mapNode,nodeList,GND,Vsrc,n} = buildMNA(this);
    const x = solveLinear(A,b);
    const V = new Map(); V.set(GND, 0);
    for (let i=0;i<nodeList.length;i++) V.set(nodeList[i], x[i]);
    const I = new Map();
    for (const c of this.comps){
      const n1v = V.get(findRoot(c.n1, this));
      const n2v = V.get(findRoot(c.n2, this));
      if (c.kind==="R"){
        I.set(c.eid, ((n1v||0)-(n2v||0))/Math.max(1e-12,c.value));
      } else if (c.kind==="V"){
        const idx = Vsrc.findIndex(v=>v.eid===c.eid);
        I.set(c.eid, x[n + idx] || 0);
      } else {
        I.set(c.eid, 0);
      }
    }
    this.lastSolution = { V, I };
    return this.lastSolution;
  };

  function findRoot(i, c){
    const maxNode = Math.max(0, ...c.nodes);
    const uf = new UnionFind(maxNode+1);
    for (const x of c.comps) if (x.kind==="W" || (x.kind==="S" && x.closed)) uf.union(x.n1, x.n2);
    return uf.find(i);
  }

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

  function buildCard(){
    const host = document.querySelector("#gallery, main, .cards, .container") || document.body;
    const card = el("section", {id:"circuit-lab", class:"physics-card"});
    const title = el("h2", null, "Circuit Lab (SAX SOP v2.2)");
    const controls = el("div", {class:"physics-controls"});
    const g1 = el("div",{class:"control-group"},
      el("label",null,"Seed ", el("input",{id:"cl-seed",type:"number",value:"20250828"})),
      el("span",{style:"display:inline-block;width:12px"}),
      el("label",null,"Ground Node ", el("input",{id:"cl-gnd",type:"number",value:"0"}))
    );
    const g2 = el("div",{class:"control-group"},
      el("select",{id:"cl-kind"},
        el("option",{value:"R"},"Resistor (Ω)"),
        el("option",{value:"V"},"Battery (V)"),
        el("option",{value:"W"},"Wire"),
        el("option",{value:"S"},"Switch (closed)")
      ),
      el("input",{id:"cl-eid",placeholder:"Id e.g. R1"}),
      el("input",{id:"cl-n1",type:"number",placeholder:"n1"}),
      el("input",{id:"cl-n2",type:"number",placeholder:"n2"}),
      el("input",{id:"cl-val",type:"number",placeholder:"value"}),
      el("button",{id:"cl-add"},"Add"),
      el("button",{id:"cl-solve"},"Solve"),
      el("button",{id:"cl-clear"},"Clear"),
      el("button",{id:"cl-export"},"Export Reel (.saxlg)"),
      el("button",{id:"cl-verify"},"Verify Reel")
    );
    const g3 = el("div",{class:"control-group"},
      el("label",null,"Probe node V: ", el("input",{id:"cl-probe-node",type:"number",value:"1"})),
      el("button",{id:"cl-probe-voltage"},"Read V  "),
      el("input",{id:"cl-probe-elem",placeholder:"eid e.g. R1"}),
      el("button",{id:"cl-probe-current"},"Read I")
    );
    const canvas = el("canvas",{id:"circuit-canvas",width:"720",height:"360",style:"border:1px solid #223; display:block; margin-top:8px;"});
    const log = el("pre",{id:"cl-log",style:"background:#0b1119;color:#e6edf3;padding:8px;border:1px solid #223; margin-top:8px;"});
    controls.appendChild(g1); controls.appendChild(g2); controls.appendChild(g3);
    card.appendChild(title); card.appendChild(controls); card.appendChild(canvas); card.appendChild(log);
    host.appendChild(card);
    return {card, controls, canvas, log};
  }

  function run(){
    const {controls, canvas, log} = buildCard();
    const ctx = canvas.getContext("2d");
    const sim = new Circuit();
    window.circuitLabSim = sim;

    const reel = makeReel("CircuitLab");
    function logText(s){ log.textContent = s; }

    const seedEl = controls.querySelector("#cl-seed");
    const gndEl  = controls.querySelector("#cl-gnd");
    function paramLog(id){ reel.add({type:"param", name:id, value:Number((id==="ground")?gndEl.value:seedEl.value)}); }
    seedEl.addEventListener("change", ()=>paramLog("seed"));
    gndEl.addEventListener("change", ()=>paramLog("ground"));

    const kindEl = controls.querySelector("#cl-kind");
    const eidEl  = controls.querySelector("#cl-eid");
    const n1El   = controls.querySelector("#cl-n1");
    const n2El   = controls.querySelector("#cl-n2");
    const valEl  = controls.querySelector("#cl-val");
    const addBtn = controls.querySelector("#cl-add");
    const solveBtn=controls.querySelector("#cl-solve");
    const clearBtn=controls.querySelector("#cl-clear");
    const exportBtn=controls.querySelector("#cl-export");
    const verifyBtn=controls.querySelector("#cl-verify");

    function render(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle="#0b1119"; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.strokeStyle="#86a2b5"; ctx.lineWidth=2;
      const nodes = Array.from(sim.nodes).sort((a,b)=>a-b);
      const N = Math.max(1, nodes.length);
      const cx=canvas.width/2, cy=canvas.height/2, R=Math.min(cx,cy)-40;
      const pos = new Map();
      for (let i=0;i<N;i++){
        const th = (i/N)*Math.PI*2;
        pos.set(nodes[i], [Math.round(cx+R*Math.cos(th)), Math.round(cy+R*Math.sin(th))]);
      }
      for (const c of sim.comps){
        const [x1,y1]=pos.get(c.n1)||[20,20], [x2,y2]=pos.get(c.n2)||[40,40];
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
        ctx.fillStyle = "#cbd5e1";
        ctx.fillText(`${c.eid}:${c.kind}${c.kind==="R"?"="+c.value+"Ω":(c.kind==="V"?"="+c.value+"V":"")}`, (x1+x2)/2, (y1+y2)/2);
      }
      for (const n of nodes){
        const [x,y]=pos.get(n);
        ctx.fillStyle = (n===0) ? "#10b981" : "#60a5fa";
        ctx.beginPath(); ctx.arc(x,y,5,0,Math.PI*2); ctx.fill();
        ctx.fillStyle="#e2e8f0"; ctx.fillText(String(n), x+8, y-8);
      }
      logText(`Components: ${sim.comps.length} | Nodes: ${nodes.length}`);
    }

    function addComp(){
      const kind = kindEl.value;
      const eid  = eidEl.value || (kind + (sim.comps.length+1));
      const n1   = +n1El.value, n2 = +n2El.value;
      const val  = +valEl.value || 0;
      if (kind==="S") sim.add(eid,"S",n1,n2,0,true);
      else sim.add(eid,kind,n1,n2,val,true);
      reel.add({type:"add_component", eid, kind, n1, n2, value: val});
      render();
    }

    function probeV(){
      const node = +controls.querySelector("#cl-probe-node").value;
      try{
        const sol = sim.lastSolution || sim.solve();
        const V = sol.V.get(findRoot(node, sim)) || 0;
        reel.th("measureV", 3, ()=>reel.add({type:"measure", meter:"nodeV", node, volts:+V.toFixed(6)}));
        logText((log.textContent||"") + `\nV(${node}) = ${V.toFixed(6)} V`);
      }catch(e){ logText("Solve error: "+e.message); }
    }
    function probeI(){
      const eid = controls.querySelector("#cl-probe-elem").value.trim();
      try{
        const sol = sim.lastSolution || sim.solve();
        const I = sol.I.get(eid) || 0;
        reel.th("measureI", 3, ()=>reel.add({type:"measure", meter:"elemI", eid, amps:+I.toFixed(6)}));
        logText((log.textContent||"") + `\nI(${eid}) = ${I.toFixed(6)} A`);
      }catch(e){ logText("Solve error: "+e.message); }
    }

    function solve(){
      try{
        const s = sim.solve();
        let out = "Solution:\n";
        const allNodes = Array.from(sim.nodes).sort((a,b)=>a-b);
        for (const n of allNodes){ out += `V(${n}) = ${(s.V.get(findRoot(n,sim))||0).toFixed(6)} V\n`; }
        for (const c of sim.comps){ out += `I(${c.eid}) = ${(s.I.get(c.eid)||0).toFixed(6)} A\n`; }
        logText(out);
        reel.add({type:"milestone", name:"solve", algo:"MNA", tol:1e-8});
        stateDigest();
      }catch(e){ logText("Solve error: "+e.message); }
    }

    function canonicalNetlist(){
      return sim.comps.slice().sort((a,b)=> (a.eid>b.eid?1:-1))
        .map(c=>`${c.eid};${c.kind};${c.n1};${c.n2};${(+c.value).toFixed(6)}`).join("|");
    }
    async function stateDigest(){
      try{
        const net = canonicalNetlist();
        const nlHashBuf = await crypto.subtle.digest("SHA-256", enc.encode(net));
        const nlHash = "sha256-"+hex(nlHashBuf);
        const nodes = Array.from(sim.nodes).sort((a,b)=>a-b);
        const volts = new Float32Array(nodes.map(n => (sim.lastSolution?.V.get(findRoot(n,sim))||0)));
        const vBytes = sampleFloat32(volts, Math.max(1, Math.floor(volts.length/16)));
        const digest = "V-"+fnv1a32(vBytes);
        reel.th("state", 1, ()=>reel.add({type:"state", netlist_hash:nlHash, V_digest:digest}));
      }catch{}
    }

    setInterval(stateDigest, 1000);

    controls.querySelector("#cl-probe-voltage").addEventListener("click", probeV);
    controls.querySelector("#cl-probe-current").addEventListener("click", probeI);
    addBtn.addEventListener("click", addComp);
    solveBtn.addEventListener("click", solve);
    clearBtn.addEventListener("click", ()=>{ sim.clear(); reel.add({type:"clear"}); render(); });
    exportBtn.addEventListener("click", ()=>reel.exportReel({ user_seed: +seedEl.value||undefined }));
    verifyBtn.addEventListener("click", ()=>window.open("verify.html","_blank"));

    sim.add("V1","V",0,1,9);
    sim.add("R1","R",1,2,100);
    sim.add("R2","R",2,0,100);
    render();
  }

  window.addEventListener("DOMContentLoaded", run);
})();
