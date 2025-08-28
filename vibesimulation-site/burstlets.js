/*
 * SAX "Burstlets" — Tap-Only Dazzle Pack (Phase 1)
 * ------------------------------------------------
 * Zero-instruction micro-sims that react to a single touch.
 * - Ripple Drum: tap to pluck a membrane; ripples shimmer and fade.
 * - Crystal Bloom: tap to seed a Gray–Scott reaction-diffusion bloom.
 *
 * Designed for ultra-low friction and low CPU. No visible UI.
 * Long-press bottom-right corner (~700ms) to reveal a tiny overlay with:
 *   [Export Reel]  [Reset]
 *
 * Drop this <script> near the end of your page. It injects a new card.
 */

(function(){
  const enc = new TextEncoder();
  function hex(buf){ const v=new Uint8Array(buf); let s=""; for(let i=0;i<v.length;i++) s+=v[i].toString(16).padStart(2,"0"); return s; }
  function fnv1a32(bytes){ let h=0x811c9dc5>>>0; for(let i=0;i<bytes.length;i++){ h^=bytes[i]; h=Math.imul(h,0x01000193)>>>0; } return ("00000000"+h.toString(16)).slice(-8); }
  function canonicalize(o){ if(o===null||typeof o!=="object") return o; if(Array.isArray(o)) return o.map(canonicalize); const out={}; Object.keys(o).sort().forEach(k=>out[k]=canonicalize(o[k])); return out; }
  function canonicalString(o){ return JSON.stringify(canonicalize(o)); }

  // -------------- Reasoning Reels (minimal) --------------
  function makeReel(simName){
    const rows=[], t0=performance.now()/1000, thr={};
    const T=()=>Number(((performance.now()/1000)-t0).toFixed(3));
    const add = (ev)=>rows.push(Object.assign({t:T()}, ev));
    const th=(k,hz,fn)=>{ const min=1/hz, t=T(), last=thr[k]||0; if(t-last>=min){ thr[k]=t; fn(); } };
    async function eventRoot(){
      let prev=new Uint8Array(32);
      for (const ev of rows){
        const s = canonicalString(ev);
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
      const meta={spec:"saxlg/1", sim:simName, sax_sop:"2.2", code_hash:(window.APP_BUNDLE_SHA256||"unknown"),
                  version:(window.APP_VERSION||"dev"), rng:"PCG32", user_seed:metaExtra?.user_seed,
                  env:{ua:navigator.userAgent, tz:Intl.DateTimeFormat().resolvedOptions().timeZone||"UTC"}, deep_link:location.href};
      const root=await eventRoot(); const sig=await signMeta(meta, root);
      const $meta=Object.assign({event_root:root}, sig||{});
      const lines=[JSON.stringify({$meta:Object.assign({},meta,$meta)}), ...rows.map(r=>JSON.stringify(r))];
      const blob=new Blob([lines.join("\n")],{type:"application/json"});
      const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=simName+".saxlg"; a.click(); URL.revokeObjectURL(a.href);
    }
    return {rows, add, th, exportReel};
  }

  // -------------- Card + overlay --------------
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

  // Replace placeholder or fallback to body
  const placeholder = document.getElementById('burstlets');
  const host = placeholder ? placeholder.parentNode : (document.querySelector("#gallery, main, .cards, .container") || document.body);

  const card=el("section",{id:"touch-experiments", class:"physics-card"});
  const title=el("h2",null,"Touch Experiments — Dazzle on Tap");
  const subtitle=el("div",{class:"muted",style:"opacity:.7;margin-top:-6px;margin-bottom:6px;"},"Just tap. No controls.");
  const wrap=el("div",{style:"display:grid;gap:12px"});
  card.appendChild(title); card.appendChild(subtitle); card.appendChild(wrap);

  if (placeholder) {
    placeholder.parentNode.replaceChild(card, placeholder);
  } else {
    host.appendChild(card);
  }

  // Tiny overlay (hidden)
  const overlay=el("div",{style:"position:fixed;right:12px;bottom:12px;background:#0f1720;border:1px solid #243447;color:#e6edf3;border-radius:10px;padding:8px;display:none;z-index:9999"});
  const btnExport=el("button",{style:"margin-right:6px"}, "Export Reel");
  const btnReset=el("button",null,"Reset");
  overlay.appendChild(btnExport); overlay.appendChild(btnReset);
  document.body.appendChild(overlay);

  // Long-press detector (bottom-right corner)
  let pressTimer=null;
  function cornerPressStart(x,y, canvas){
    const rect=canvas.getBoundingClientRect();
    const inCorner = (x>rect.right-80 && y>rect.bottom-80);
    if (!inCorner) return;
    clearTimeout(pressTimer);
    pressTimer=setTimeout(()=>{ overlay.style.display="block"; }, 700);
  }
  function pressEnd(){ clearTimeout(pressTimer); }

  // -------------- Ripple Drum --------------
  function RippleDrum(canvas, reel){
    const W = 180, H = 100; // sim grid
    const u = new Float32Array(W*H);
    const uPrev = new Float32Array(W*H);
    const damping = 0.995;
    const c2 = 0.25; // wave speed^2 scaled for stability
    let running=false;

    function idx(x,y){ return y*W + x; }
    function step(){
      // 5-point laplacian
      for (let y=1;y<H-1;y++){
        const yw=y*W;
        for (let x=1;x<W-1;x++){
          const i=yw+x;
          const lap = (u[i-1] + u[i+1] + u[i-W] + u[i+W] - 4*u[i]);
          const val = (2*u[i] - uPrev[i]) + c2*lap;
          uPrev[i] = u[i];
          u[i] = val * damping;
        }
      }
    }
    const ctx = canvas.getContext("2d");
    const img = ctx.createImageData(W, H);
    function draw(){
      // height to color (caustic-ish palette)
      for (let i=0;i<W*H;i++){
        const h = Math.max(-1, Math.min(1, u[i]));
        const b = 128 + h*120;
        const g = 128 + h*60;
        const r = 160 + h*30;
        const j=i*4; img.data[j]=r|0; img.data[j+1]=g|0; img.data[j+2]=b|0; img.data[j+3]=255;
      }
      ctx.imageSmoothingEnabled=false;
      ctx.putImageData(img, 0, 0);
      ctx.drawImage(canvas, 0, 0, W, H, 0, 0, canvas.width, canvas.height);
    }
    function excite(cx, cy){
      // map pixel to grid
      const x = Math.floor(cx / canvas.width * W);
      const y = Math.floor(cy / canvas.height * H);
      for (let dy=-3;dy<=3;dy++){
        for (let dx=-3;dx<=3;dx++){
          const xi=x+dx, yi=y+dy;
          if (xi>1 && xi<W-1 && yi>1 && yi<H-1){
            u[idx(xi,yi)] += Math.cos((dx*dx+dy*dy))*0.6;
          }
        }
      }
      reel.add({type:"touch", sim:"ripple", x:cx|0, y:cy|0});
    }
    function digest(){
      // sparse sample into bytes then fnv
      const stepSz=64;
      const tmp=new Uint8Array(Math.ceil(u.length/stepSz)*4);
      const dv=new DataView(new ArrayBuffer(4));
      let j=0;
      for (let i=0;i<u.length;i+=stepSz){ dv.setFloat32(0, u[i]||0, true); tmp.set(new Uint8Array(dv.buffer), j); j+=4; }
      return "rip-"+fnv1a32(tmp);
    }

    // Public
    canvas.addEventListener("pointerdown", (e)=>{
      const r=canvas.getBoundingClientRect(); const x=e.clientX-r.left, y=e.clientY-r.top;
      excite(x,y); running=true;
      cornerPressStart(e.clientX, e.clientY, canvas);
    });
    window.addEventListener("pointerup", pressEnd);

    let raf=null;
    function loop(){
      if (!running) return;
      step(); draw();
      // auto-stop when energy is tiny
      let energy=0; for (let i=0;i<u.length;i++){ energy+=u[i]*u[i]; }
      if (energy < 1e-4){ running=false; return; }
      raf=requestAnimationFrame(loop);
    }
    function start(){ if (!running){ running=true; loop(); } else if (!raf){ loop(); } }
    function reset(){ u.fill(0); uPrev.fill(0); draw(); }
    // periodic digest (only while running)
    setInterval(()=>{ if (running) reel.th("state:ripple",1, ()=>reel.add({type:"state", sim:"ripple", digest:digest()})); }, 1000);

    // init
    reset();
    return {start, reset};
  }

  // -------------- Crystal Bloom (Gray–Scott) --------------
  function CrystalBloom(canvas, reel){
    const W=144, H=90;
    let U=new Float32Array(W*H), V=new Float32Array(W*H);
    // Initialize
    for (let i=0;i<W*H;i++){ U[i]=1; V[i]=0; }
    const F=0.037, k=0.06, Du=0.16, Dv=0.08; // classic pattern
    let running=false;
    const ctx = canvas.getContext("2d");
    const img = ctx.createImageData(W, H);

    function lap(A, i, x, y){
      const xm = (x===0? W-1 : x-1), xp=(x===W-1? 0 : x+1);
      const ym = (y===0? H-1 : y-1), yp=(y===H-1? 0 : y+1);
      return A[ym*W + x] + A[yp*W + x] + A[y*W + xm] + A[y*W + xp] - 4*A[i];
    }

    function step(){
      const U2=U.slice(), V2=V.slice();
      for (let y=0;y<H;y++){
        for (let x=0;x<W;x++){
          const i=y*W+x;
          const u=U[i], v=V[i];
          const uvv=u*v*v;
          U2[i] = u + (Du*lap(U, i, x, y) - uvv + F*(1-u));
          V2[i] = v + (Dv*lap(V, i, x, y) + uvv - (F+k)*v);
        }
      }
      U=U2; V=V2;
    }

    function draw(){
      for (let i=0;i<W*H;i++){
        const v=V[i];
        const c = Math.max(0, Math.min(1, v*4)); // scale
        const r = (20 + 220*c)|0;
        const g = (40 + 150*c)|0;
        const b = (80 + 90*c)|0;
        const j=i*4; img.data[j]=r; img.data[j+1]=g; img.data[j+2]=b; img.data[j+3]=255;
      }
      ctx.imageSmoothingEnabled=false;
      ctx.putImageData(img, 0, 0);
      ctx.drawImage(canvas, 0, 0, W, H, 0, 0, canvas.width, canvas.height);
    }

    function seed(cx, cy){
      const x = Math.floor(cx / canvas.width * W);
      const y = Math.floor(cy / canvas.height * H);
      for (let dy=-3;dy<=3;dy++){
        for (let dx=-3;dx<=3;dx++){
          const xi=(x+dx+W)%W, yi=(y+dy+H)%H;
          const i=yi*W+xi;
          U[i]=0.5; V[i]=0.25;
        }
      }
      reel.add({type:"touch", sim:"bloom", x:cx|0, y:cy|0});
      running=true;
    }

    function digest(){
      const stepSz=64;
      const tmp=new Uint8Array(Math.ceil(V.length/stepSz)*4);
      const dv=new DataView(new ArrayBuffer(4));
      let j=0;
      for (let i=0;i<V.length;i+=stepSz){ dv.setFloat32(0, V[i]||0, true); tmp.set(new Uint8Array(dv.buffer), j); j+=4; }
      return "blo-"+fnv1a32(tmp);
    }

    canvas.addEventListener("pointerdown", (e)=>{
      const r=canvas.getBoundingClientRect(); const x=e.clientX-r.left, y=e.clientY-r.top;
      seed(x,y);
      cornerPressStart(e.clientX, e.clientY, canvas);
    });
    window.addEventListener("pointerup", pressEnd);

    let raf=null, idle=0;
    function loop(){
      if (!running) return;
      for (let k=0;k<1;k++) step(); // 1 iteration/frame (cheap)
      draw();
      // If pattern stabilizes, back off
      idle++;
      if (idle>300){ running=false; idle=0; return; }
      raf=requestAnimationFrame(loop);
    }
    function start(){ if (!running){ running=true; loop(); } else if (!raf){ loop(); } }
    function reset(){
      U.fill(1); V.fill(0);
      draw();
    }
    setInterval(()=>{ if (running) reel.th("state:bloom",1, ()=>reel.add({type:"state", sim:"bloom", digest:digest()})); }, 1000);

    reset();
    return {start, reset};
  }

  // -------------- Build canvases --------------
  function makeCanvasRow(label){
    const row=el("div",{class:"control-group"});
    const cap=el("div",{style:"opacity:.75;margin:2px 0 2px 2px"}, label);
    const cvs=el("canvas",{width:"720", height:"360", style:"display:block;border:1px solid #223; background:#0b1119; border-radius:8px"});
    row.appendChild(cap); row.appendChild(cvs);
    wrap.appendChild(row);
    return cvs;
  }

  const reel = makeReel("BurstletsPack");
  const rippleCanvas = makeCanvasRow("Ripple Drum — tap to pluck");
  const bloomCanvas  = makeCanvasRow("Crystal Bloom — tap to seed");

  const ripple = RippleDrum(rippleCanvas, reel);
  const bloom  = CrystalBloom(bloomCanvas, reel);

  // Overlay actions
  btnExport.onclick=()=>reel.exportReel({user_seed: 20250828});
  btnReset.onclick=()=>{ ripple.reset(); bloom.reset(); overlay.style.display="none"; };

  // Idle-friendly: only animate on demand
  function pump(){
    ripple.start(); bloom.start();
  }
  // Light heartbeat to give immediate feedback on first paint
  requestAnimationFrame(pump);

})();
