/*
 * Morphogenetic Animation Studio — Reaction–Diffusion + Contour
 * --------------------------------------------------------------
 * Gray–Scott reaction–diffusion with live controls, presets, seeding,
 * inverse coverage matching, and a tamper‑evident Reasoning Reel (SAX SOP v2.2).
 */

(function(){
  const enc = new TextEncoder();
  function hex(buf){ const v=new Uint8Array(buf); let s=""; for(let i=0;i<v.length;i++) s+=v[i].toString(16).padStart(2,"0"); return s; }
  function fnv1a32(bytes){ let h=0x811c9dc5>>>0; for(let i=0;i<bytes.length;i++){ h^=bytes[i]; h=Math.imul(h,0x01000193)>>>0; } return ("00000000"+h.toString(16)).slice(-8); }
  function canonicalize(o){ if(o===null||typeof o!=="object") return o; if(Array.isArray(o)) return o.map(canonicalize); const out={}; Object.keys(o).sort().forEach(k=>out[k]=canonicalize(o[k])); return out; }
  function cstr(o){ return JSON.stringify(canonicalize(o)); }

  function makeReel(simName){
    const rows=[], t0=performance.now()/1000, thr={};
    const T=()=>Number(((performance.now()/1000)-t0).toFixed(3));
    const add=(ev)=>rows.push(Object.assign({t:T()}, ev));
    const th=(k,hz,fn)=>{ const min=1/hz, t=T(), last=thr[k]||0; if(t-last>=min){ thr[k]=t; fn(); } };
    async function root(){
      let prev=new Uint8Array(32);
      for (const ev of rows){
        const s=cstr(ev);
        const data=new Uint8Array(prev.length+enc.encode(s).length);
        data.set(prev,0); data.set(enc.encode(s), prev.length);
        prev=new Uint8Array(await crypto.subtle.digest("SHA-256", data));
      }
      return "sha256-"+hex(prev);
    }
    async function sign(metaMinusSig, event_root){
      try{
        const algo={name:"Ed25519"};
        const kp=await crypto.subtle.generateKey(algo,true,["sign","verify"]);
        const payload=enc.encode(JSON.stringify(Object.assign({}, metaMinusSig, {event_root})));
        const sig=await crypto.subtle.sign(algo, kp.privateKey, payload);
        const pub=await crypto.subtle.exportKey("raw", kp.publicKey);
        return { sig_alg:"ed25519", sig:btoa(String.fromCharCode(...new Uint8Array(sig))), pub:btoa(String.fromCharCode(...new Uint8Array(pub))) };
      }catch(e){ console.warn("Ed25519 unavailable; exporting unsigned reel.", e); return null; }
    }
    async function exportReel(metaExtra){
      const meta={spec:"saxlg/1", sim:simName, sax_sop:"2.2",
                  code_hash:(window.APP_BUNDLE_SHA256||"unknown"), version:(window.APP_VERSION||"dev"),
                  rng:"PCG32", user_seed:metaExtra?.user_seed,
                  env:{ua:navigator.userAgent, tz:Intl.DateTimeFormat().resolvedOptions().timeZone||"UTC"},
                  deep_link:location.href};
      const event_root=await root();
      const sig=await sign(meta, event_root);
      const $meta = Object.assign({event_root}, sig||{});
      const lines=[JSON.stringify({$meta:Object.assign({}, meta, $meta)}), ...rows.map(r=>JSON.stringify(r))];
      const blob=new Blob([lines.join("\n")], {type:"application/json"});
      const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=simName+".saxlg"; a.click(); URL.revokeObjectURL(a.href);
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

  // ---------- UI Setup ----------
  const canvasContainer = document.querySelector(".canvas-container");
  const controlsContainer = document.querySelector("#morphogen-controls");

  // Create canvas
  const canvas=el("canvas",{id:"ma-canvas",width:"900",height:"540",style:"border:1px solid #223; display:block; margin:0 auto; background:#0b1119; border-radius:1rem; box-shadow: 0 20px 60px rgba(0,0,0,0.5);"});
  canvasContainer.appendChild(canvas);

  // Create controls (placed at bottom)
  const g1=el("div",{class:"control-group"},
    el("button",{id:"ma-start", class:"control-toggle-btn"},"Start"),
    el("button",{id:"ma-pause", class:"control-toggle-btn"},"Pause"),
    el("button",{id:"ma-step", class:"control-toggle-btn"},"Step"),
    el("button",{id:"ma-reset", class:"control-toggle-btn"},"Reset"),
    el("button",{id:"ma-export", class:"control-toggle-btn"},"Export Reel (.saxlg)"),
    el("button",{id:"ma-verify", class:"control-toggle-btn"},"Verify Reel")
  );
  const g2=el("div",{class:"control-group"},
    el("label",null,"Preset ",
      (function(){ const s=el("select",{id:"ma-preset"});
        [["Coral",0.055,0.062],["Worms",0.037,0.065],["Spots",0.029,0.057],["Mazes",0.026,0.051],["Mitotic",0.018,0.050],["Custom",-1,-1]]
          .forEach(([name,F,k])=> s.appendChild(el("option",{value:JSON.stringify({F,k})}, name)));
        return s; })()
    ),
    el("label",null,"F ",
      el("input",{id:"ma-F",type:"range",min:"0.010",max:"0.080",step:"0.001",value:"0.055"}),
      el("span",{id:"ma-Fv",style:"margin-left:4px"},"0.055")
    ),
    el("label",null,"k ",
      el("input",{id:"ma-k",type:"range",min:"0.030",max:"0.070",step:"0.001",value:"0.062"}),
      el("span",{id:"ma-kv",style:"margin-left:4px"},"0.062")
    ),
    el("label",null,"Du ",
      el("input",{id:"ma-Du",type:"range",min:"0.02",max:"0.24",step:"0.01",value:"0.16"}),
      el("span",{id:"ma-Duv",style:"margin-left:4px"},"0.16")
    ),
    el("label",null,"Dv ",
      el("input",{id:"ma-Dv",type:"range",min:"0.01",max:"0.12",step:"0.01",value:"0.08"}),
      el("span",{id:"ma-Dvv",style:"margin-left:4px"},"0.08")
    ),
    el("label",null,"Steps/frame ", el("input",{id:"ma-spf",type:"number",min:"1",max:"30",value:"8"}))
  );
  const g3=el("div",{class:"control-group"},
    el("button",{id:"ma-seed-dot", class:"control-toggle-btn"},"Seed Dot"),
    el("button",{id:"ma-seed-ring", class:"control-toggle-btn"},"Seed Ring"),
    el("button",{id:"ma-seed-noise", class:"control-toggle-btn"},"Seed Noise"),
    el("label",null,"Brush: radius ", el("input",{id:"ma-brush",type:"range",min:"2",max:"32",value:"8"}))
  );
  const g4=el("div",{class:"control-group"},
    el("label",null,"Contour threshold ",
      el("input",{id:"ma-thr",type:"range",min:"0.05",max:"0.60",step:"0.005",value:"0.25"}),
      el("span",{id:"ma-thrv",style:"margin-left:4px"},"0.25")
    ),
    el("label",null,"Target coverage % ", el("input",{id:"ma-cov",type:"number",min:"1",max:"95",value:"30"})),
    el("button",{id:"ma-autothr", class:"control-toggle-btn"},"Auto‑threshold"),
    el("button",{id:"ma-autopreset", class:"control-toggle-btn"},"Auto‑preset")
  );
  controlsContainer.appendChild(g1); controlsContainer.appendChild(g2); controlsContainer.appendChild(g3); controlsContainer.appendChild(g4);

  // ---------- Model ----------
  const reel = makeReel("MorphogeneticAnimation");
  const ctx = canvas.getContext("2d");
  const W = 180, H = 108; // internal grid
  let U = new Float32Array(W*H);
  let V = new Float32Array(W*H);
  let running=false, raf=0, frame=0;

  function idx(x,y){ return y*W + x; }
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }

  function reset(){
    for (let i=0;i<W*H;i++){ U[i]=1; V[i]=0; }
    const r=6, cx=W>>1, cy=H>>1;
    for (let y=cy-r;y<=cy+r;y++){
      for (let x=cx-r;x<=cx+r;x++){
        if (x>1 && x<W-1 && y>1 && y<H-1){
          U[idx(x,y)]=0.50; V[idx(x,y)]=0.25;
        }
      }
    }
    frame=0;
    draw();
  }

  function lap(A, x, y){
    const xm = (x===0? W-1 : x-1), xp=(x===W-1? 0 : x+1);
    const ym = (y===0? H-1 : y-1), yp=(y===H-1? 0 : y+1);
    return A[ym*W+x] + A[yp*W+x] + A[y*W+xm] + A[y*W+xp] - 4*A[y*W+x];
  }

  function step(){
    const F = +document.getElementById("ma-F").value;
    const k = +document.getElementById("ma-k").value;
    const Du= +document.getElementById("ma-Du").value;
    const Dv= +document.getElementById("ma-Dv").value;
    const U2 = U.slice(), V2 = V.slice();
    for (let y=0;y<H;y++){
      for (let x=0;x<W;x++){
        const i=y*W+x;
        const u=U[i], v=V[i];
        const uvv = u*v*v;
        U2[i] = u + (Du*lap(U,x,y) - uvv + F*(1-u));
        V2[i] = v + (Dv*lap(V,x,y) + uvv - (F+k)*v);
      }
    }
    U = U2; V = V2;
    frame++;
    if (frame % 10 === 0){
      const digest = digestState();
      const m = metrics();
      reel.th("state:V", 1, ()=>reel.add({type:"state", digest, frame}));
      reel.th("mile", 1, ()=>reel.add({type:"milestone", name:"step", k:frame, metrics:m}));
      updateInfo(m);
    }
  }

  function digestState(){
    const stepSz=64;
    const tmp=new Uint8Array(Math.ceil(V.length/stepSz)*4);
    const dv=new DataView(new ArrayBuffer(4));
    let j=0;
    for (let i=0;i<V.length;i+=stepSz){ dv.setFloat32(0, V[i]||0, true); tmp.set(new Uint8Array(dv.buffer), j); j+=4; }
    return "V-"+fnv1a32(tmp);
  }

  function updateInfo(m){
    document.getElementById("ma-info").textContent =
      `step ${frame} • coverage ${m.coverage.toFixed(1)}% • entropy ${m.entropy.toFixed(3)} • gradE ${m.grad_energy.toFixed(3)}`;
  }

  function metrics(){
    const thr = +document.getElementById("ma-thr").value;
    let count=0, sum=0;
    for (let i=0;i<V.length;i++){ if (V[i]>thr) count++; sum += V[i]; }
    const coverage = 100*count / (W*H);
    const bins = new Float64Array(32);
    for (let i=0;i<V.length;i++){ const b = Math.max(0, Math.min(31, (V[i]*31)|0)); bins[b]++; }
    let Hn=0;
    for (let i=0;i<32;i++){ if (bins[i]>0){ const p=bins[i]/(W*H); Hn -= p*Math.log2(p); } }
    let ge=0;
    for (let y=1;y<H-1;y++){
      for (let x=1;x<W-1;x++){
        const i=y*W+x;
        const gx = (V[i+1]-V[i-1])*0.5, gy=(V[i+W]-V[i-W])*0.5;
        ge += Math.hypot(gx,gy);
      }
    }
    return {coverage, entropy:Hn/5, grad_energy: ge/(W*H)};
  }

  function draw(){
    const img = ctx.createImageData(W, H);
    const data = img.data;
    for (let i=0;i<W*H;i++){
      const v = clamp(V[i], 0, 1);
      const a = v, b = v*v;
      const r = 20 + 220*a;
      const g = 50 + 160*b;
      const c = 80 + 140*a;
      const j=i*4; data[j]=r|0; data[j+1]=g|0; data[j+2]=c|0; data[j+3]=255;
    }
    ctx.imageSmoothingEnabled=false;
    ctx.putImageData(img, 0, 0);
    ctx.drawImage(canvas, 0, 0, W, H, 0, 0, canvas.width, canvas.height);

    const thr = +document.getElementById("ma-thr").value;
    ctx.strokeStyle="#eab308"; ctx.lineWidth=1.5;
    const sx = canvas.width/W, sy = canvas.height/H;
    ctx.beginPath();
    for (let y=1;y<H;y++){
      for (let x=1;x<W;x++){
        const i=y*W+x;
        const v = V[i];
        const vL = V[i-1];
        if ((v>=thr) !== (vL>=thr)){
          const t = (thr - vL) / ((v - vL) || 1e-9);
          const px = (x-1 + t) * sx;
          const py = y * sy;
          ctx.moveTo(px, py-0.5);
          ctx.lineTo(px, py+0.5);
        }
      }
    }
    ctx.stroke();
  }

  function loop(){
    if (!running) return;
    const n = Math.max(1, Math.min(30, (+document.getElementById("ma-spf").value|0)||1));
    for (let i=0;i<n;i++) step();
    draw();
    raf = requestAnimationFrame(loop);
  }

  // ---------- Seeding ----------
  function seedDot(cx, cy, r=6){
    const x = Math.floor(cx / canvas.width * W);
    const y = Math.floor(cy / canvas.height * H);
    for (let dy=-r;dy<=r;dy++){
      for (let dx=-r;dx<=r;dx++){
        const xi=(x+dx+W)%W, yi=(y+dy+H)%H;
        if (dx*dx+dy*dy<=r*r){
          const i=yi*W+xi; U[i]=0.50; V[i]=0.25;
        }
      }
    }
  }
  function seedRing(cx, cy, r=10, t=2){
    const x = Math.floor(cx / canvas.width * W);
    const y = Math.floor(cy / canvas.height * H);
    for (let a=0;a<360;a+=1){
      const xr = Math.round(x + r*Math.cos(a*Math.PI/180));
      const yr = Math.round(y + r*Math.sin(a*Math.PI/180));
      for (let k=-t;k<=t;k++){
        const xi=(xr+W)%W, yi=(yr+W)%W;
        const i=yi*W+xi; U[i]=0.50; V[i]=0.30;
      }
    }
  }
  function seedNoise(amount=0.04){
    for (let i=0;i<W*H;i++){
      if (Math.random()<amount){ U[i]=0.50+0.05*(Math.random()-0.5); V[i]=0.25+0.05*(Math.random()-0.5); }
    }
  }

  function autoThreshold(targetCoverage){
    let lo=0.01, hi=0.8, best=+document.getElementById("ma-thr").value;
    for (let it=0; it<12; it++){
      const mid=(lo+hi)/2;
      let count=0; for (let i=0;i<V.length;i++){ if (V[i]>mid) count++; }
      const cov=100*count/(W*H);
      if (cov>targetCoverage){ lo=mid; } else { hi=mid; }
      best=mid;
    }
    return best;
  }

  function autoPreset(targetCoverage){
    const presets=[
      {name:"Coral",F:0.055,k:0.062},
      {name:"Worms",F:0.037,k:0.065},
      {name:"Spots",F:0.029,k:0.057},
      {name:"Mazes",F:0.026,k:0.051},
      {name:"Mitotic",F:0.018,k:0.050}
    ];
    let best=null;
    for (const p of presets){
      const thr = autoThreshold(targetCoverage);
      let count=0; for (let i=0;i<V.length;i++){ if (V[i]>thr) count++; }
      const cov=100*count/(W*H);
      const score=Math.abs(cov-targetCoverage) + Math.abs(p.F-(+document.getElementById("ma-F").value))*40 + Math.abs(p.k-(+document.getElementById("ma-k").value))*40;
      if (!best || score<best.score) best={p,score,thr};
    }
    return best;
  }

  function syncLabel(id, val){ document.getElementById(id).textContent=String(val); }
  function syncAll(){
    syncLabel("ma-Fv", (+document.getElementById("ma-F").value).toFixed(3));
    syncLabel("ma-kv", (+document.getElementById("ma-k").value).toFixed(3));
    syncLabel("ma-Duv", (+document.getElementById("ma-Du").value).toFixed(2));
    syncLabel("ma-Dvv", (+document.getElementById("ma-Dv").value).toFixed(2));
    syncLabel("ma-thrv", (+document.getElementById("ma-thr").value).toFixed(3));
  }

  document.getElementById("ma-start").onclick=()=>{ if (!running){ running=true; reel.add({type:"control",action:"start"}); loop(); } };
  document.getElementById("ma-pause").onclick=()=>{ running=false; reel.add({type:"control",action:"pause"}); };
  document.getElementById("ma-step").onclick=()=>{ step(); draw(); };
  document.getElementById("ma-reset").onclick=()=>{ running=false; reset(); reel.add({type:"control",action:"reset"}); };
  document.getElementById("ma-export").onclick=()=>reel.exportReel({user_seed:20250829});
  document.getElementById("ma-verify").onclick=()=>window.open("verify.html","_blank");

  ["ma-F","ma-k","ma-Du","ma-Dv","ma-thr"].forEach(id=>{
    document.getElementById(id).addEventListener("input", ()=>{
      syncAll();
      const val = +document.getElementById(id).value;
      reel.th("param:"+id, 6, ()=>reel.add({type:"param", name:id, value:val}));
      draw();
    });
  });
  document.getElementById("ma-preset").addEventListener("change", (e)=>{
    const {F,k} = JSON.parse(e.target.value);
    if (F<0){ return; }
    document.getElementById("ma-F").value=F;
    document.getElementById("ma-k").value=k;
    syncAll();
    reel.add({type:"param", name:"preset", value:{F,k}});
  });

  document.getElementById("ma-seed-dot").onclick=()=>{ reel.add({type:"seed", kind:"dot"}); canvas.style.cursor="crosshair"; tempSeedMode="dot"; };
  document.getElementById("ma-seed-ring").onclick=()=>{ reel.add({type:"seed", kind:"ring"}); canvas.style.cursor="crosshair"; tempSeedMode="ring"; };
  document.getElementById("ma-seed-noise").onclick=()=>{ reel.add({type:"seed", kind:"noise"}); seedNoise(0.04); draw(); };

  let tempSeedMode=null;
  canvas.addEventListener("pointerdown",(e)=>{
    const r=canvas.getBoundingClientRect(); const x=e.clientX-r.left, y=e.clientY-r.top;
    const rad = (+document.getElementById("ma-brush").value|0);
    if (tempSeedMode==="dot"){ seedDot(x,y, rad); reel.add({type:"seed_apply", kind:"dot", x:x|0, y:y|0, r:rad}); draw(); }
    if (tempSeedMode==="ring"){ seedRing(x,y, Math.max(5,rad+4), 2); reel.add({type:"seed_apply", kind:"ring", x:x|0, y:y|0, r:rad}); draw(); }
  });
  window.addEventListener("pointerup", ()=>{ tempSeedMode=null; canvas.style.cursor="default"; });

  document.getElementById("ma-autothr").onclick=()=>{
    const target = +document.getElementById("ma-cov").value;
    const thr = autoThreshold(target);
    document.getElementById("ma-thr").value=thr;
    syncAll();
    reel.add({type:"solver_proposal", what:"threshold", target_cov:target, thr});
    draw();
  };
  document.getElementById("ma-autopreset").onclick=()=>{
    const target = +document.getElementById("ma-cov").value;
    const best = autoPreset(target);
    if (best){
      document.getElementById("ma-F").value=best.p.F;
      document.getElementById("ma-k").value=best.p.k;
      document.getElementById("ma-thr").value=best.thr;
      syncAll();
      reel.add({type:"solver_proposal", what:"preset", target_cov:target, preset:best.p, thr:best.thr});
      draw();
    }
  };

  // init
  reset(); syncAll(); draw();

  // 1 Hz digests
  setInterval(()=>{ reel.th("state:V", 1, ()=>reel.add({type:"state", digest:digestState(), frame})); }, 1000);

})();