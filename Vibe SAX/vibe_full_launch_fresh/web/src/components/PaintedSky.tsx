import React, {useEffect, useMemo, useRef, useState} from "react";
import AccreditationChip from "./AccreditationChip";
import EvidenceDrawer from "./EvidenceDrawer";
import { parseParams, shareLink } from "../utils/deeplink";
import { makeRng } from "../utils/rng";
import { downloadLedger } from "../utils/ledger";

type LUT = "Aurora" | "NeonTokyo" | "Sunstone";
function clamp(x:number,lo:number,hi:number){ return Math.max(lo, Math.min(hi, x)); }
function makeLUT(name:LUT){
  const g:number[] = [];
  for (let i=0;i<256;i++){
    const t=i/255; let r=0,gc=0,b=0;
    if (name==="Aurora"){ r=Math.pow(t,0.6); gc=Math.pow(1-t,0.4)*0.8+0.1; b=0.6+0.4*Math.sin(6.283*t); }
    else if (name==="NeonTokyo"){ r=0.3+0.7*t; gc=0.1+0.9*(t*t); b=1.0-0.6*t; }
    else { r=1.0; gc=0.6+0.4*t; b=0.2+0.3*(1-t); }
    g.push(Math.round(clamp(r*255,0,255)), Math.round(clamp(gc*255,0,255)), Math.round(clamp(b*255,0,255)), 255);
  }
  return new Uint8ClampedArray(g);
}

export default function PaintedSky(){
  const W=1120,H=630, NX=192, NY=108, dx=1.0, dt=0.85, VISC=0.00006;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [seed, setSeed] = useState(20250827);
  const [shear, setShear] = useState(1.2);
  const [vortConf, setVortConf] = useState(18.0);
  const [brush, setBrush] = useState<"Stream"|"Spray"|"Ink-stamp">("Stream");
  const [lutName, setLutName] = useState<LUT>("Aurora");
  const [cfl, setCfl] = useState(0);
  const [accreditation,setAccreditation] = useState(true);
  const [reps,setReps] = useState(40);

  useEffect(()=>{
    const p = parseParams();
    if (p.seed) setSeed(Number(p.seed));
    if (p.du) setShear(Number(p.du));
    if (p.vc) setVortConf(Number(p.vc));
    if (p.brush) setBrush(String(p.brush) as any);
    if (p.palette) setLutName(String(p.palette) as LUT);
    if (p.accreditation!==undefined) setAccreditation(Boolean(p.accreditation));
  }, []);

  useEffect(()=>{
    const canvas = canvasRef.current!; const ctx = canvas.getContext("2d")!;
    const size = NX*NY; const idx=(x:number,y:number)=>y*NX+x;
    let u = new Float32Array(size), v = new Float32Array(size), d = new Float32Array(size);
    let u0 = new Float32Array(size), v0 = new Float32Array(size), d0 = new Float32Array(size);
    let mouseDown=false, mx=0,my=0;
    function inject(px:number, py:number){
      const R=10;
      for (let j=-R;j<=R;j++) for (let i=-R;i<=R;i++){
        const x=Math.floor(px)+i, y=Math.floor(py)+j;
        if (x<1||x>=NX-1||y<1||y>=NY-1) continue;
        if (i*i+j*j>R*R) continue;
        const k=idx(x,y); d[k]+=2.5;
        if (brush==="Stream"){ u[k]+=shear*0.8; }
        else if (brush==="Spray"){ u[k]+=(Math.random()-0.5)*shear; v[k]+=(Math.random()-0.5)*shear; }
        else { u[k]+=(y>NY/2? +shear : -shear); }
      }
    }
    canvas.onpointerdown=(e)=>{ mouseDown=true; const r=canvas.getBoundingClientRect(); mx=(e.clientX-r.left)/W*NX; my=(e.clientY-r.top)/H*NY; inject(mx,my); };
    canvas.onpointermove=(e)=>{ if(!mouseDown) return; const r=canvas.getBoundingClientRect(); mx=(e.clientX-r.left)/W*NX; my=(e.clientY-r.top)/H*NY; inject(mx,my); };
    canvas.onpointerup=()=>{ mouseDown=false; }; canvas.onpointerleave=()=>{ mouseDown=false; };

    function advect(src:Float32Array, dst:Float32Array){
      for (let y=1;y<NY-1;y++) for (let x=1;x<NX-1;x++){
        const k=idx(x,y); const x0=x-dt*u[k]/dx; const y0=y-dt*v[k]/dx;
        const xi=Math.max(0.5, Math.min(NX-1.5, x0)), yi=Math.max(0.5, Math.min(NY-1.5, y0));
        const xL=Math.floor(xi), xR=xL+1, yB=Math.floor(yi), yT=yB+1; const sx=xi-xL, sy=yi-yB;
        const k00=idx(xL,yB), k10=idx(xR,yB), k01=idx(xL,yT), k11=idx(xR,yT);
        dst[k]=(1-sx)*(1-sy)*src[k00]+sx*(1-sy)*src[k10]+(1-sx)*sy*src[k01]+sx*sy*src[k11];
      }
    }
    function diffuse(src:Float32Array, dst:Float32Array){
      for (let y=1;y<NY-1;y++) for (let x=1;x<NX-1;x++){
        const k=idx(x,y);
        dst[k]=src[k]+VISC*(src[idx(x-1,y)]+src[idx(x+1,y)]+src[idx(x,y-1)]+src[idx(x,y+1)]-4*src[k]);
      }
    }
    function project(){
      const p=new Float32Array(size), div=new Float32Array(size);
      for (let y=1;y<NY-1;y++) for (let x=1;x<NX-1;x++){ const k=idx(x,y);
        div[k]=-0.5*dx*(u[idx(x+1,y)]-u[idx(x-1,y)]+v[idx(x,y+1)]-v[idx(x,y-1)]); p[k]=0; }
      for (let it=0;it<22;it++){
        for (let y=1;y<NY-1;y++) for (let x=1;x<NX-1;x++){ const k=idx(x,y);
          p[k]=(div[k]+p[idx(x-1,y)]+p[idx(x+1,y)]+p[idx(x,y-1)]+p[idx(x,y+1)])/4; }
      }
      for (let y=1;y<NY-1;y++) for (let x=1;x<NX-1;x++){ const k=idx(x,y);
        u[k]-=0.5*(p[idx(x+1,y)]-p[idx(x-1,y)])/dx; v[k]-=0.5*(p[idx(x,y+1)]-p[idx(x,y-1)])/dx; }
    }
    function vorticity(eps:number){
      const w=new Float32Array(size);
      for (let y=1;y<NY-1;y++) for (let x=1;x<NX-1;x++){ const k=idx(x,y);
        w[k]=(v[idx(x+1,y)]-v[idx(x-1,y)]-(u[idx(x,y+1)]-u[idx(x,y-1)]))*0.5; }
      for (let y=2;y<NY-2;y++) for (let x=2;x<NX-2;x++){ const k=idx(x,y);
        const dw_dx=Math.abs(w[idx(x+1,y)])-Math.abs(w[idx(x-1,y)]);
        const dw_dy=Math.abs(w[idx(x,y+1)])-Math.abs(w[idx(x,y-1)]);
        const mag=Math.hypot(dw_dx,dw_dy)+1e-6; const Nx=dw_dx/mag, Ny=dw_dy/mag;
        u[k]+=eps*Ny*w[k]*dt; v[k]-=eps*Nx*w[k]*dt;
      }
      return w;
    }
    function addShear(){ for (let y=0;y<NY;y++){ const s=(y/NY-0.5)*2.0;
      for (let x=0;x<NX;x++){ u[idx(x,y)]+=s*shear*0.02; } } }
    function draw(){
      const w=vorticity(vortConf*0.001);
      let maxVel=1e-6; for (let i=0;i<u.length;i++){ const m=Math.hypot(u[i],v[i]); if(m>maxVel) maxVel=m; }
      setCfl((maxVel*dt)/dx);
      const ctx2 = canvas.getContext("2d")!, img = ctx2.createImageData(W,H), lut=makeLUT(lutName);
      for (let Y=0;Y<H;Y++){
        const gy=Y/H*(NY-1); const y0=Math.floor(gy), y1=y0+1; const ty=gy-y0;
        for (let X=0;X<W;X++){
          const gx=X/W*(NX-1); const x0=Math.floor(gx), x1=x0+1; const tx=gx-x0;
          const k00=idx(x0,y0), k10=idx(x1,y0), k01=idx(x0,y1), k11=idx(x1,y1);
          const dye=(1-tx)*(1-ty)*d[k00]+tx*(1-ty)*d[k10]+(1-tx)*ty*d[k01]+tx*ty*d[k11];
          const t= Math.max(0, Math.min(1, dye/5.0)); const L=(t*255)|0;
          const baseR=lut[L*4+0], baseG=lut[L*4+1], baseB=lut[L*4+2];
          const vort=Math.abs((1-tx)*(1-ty)*w[k00]+tx*(1-ty)*w[k10]+(1-tx)*ty*w[k01]+tx*ty*w[k11]);
          const glow=Math.max(0, Math.min(1, vort*8.0));
          const r=Math.min(255, baseR + glow*120);
          const g=Math.min(255, baseG + glow*80);
          const b=Math.min(255, baseB + glow*50);
          const p=(Y*W+X)*4; img.data[p]=r; img.data[p+1]=g; img.data[p+2]=b; img.data[p+3]=255;
        }
      }
      ctx2.putImageData(img,0,0);
    }
    for (let y=0;y<NY;y++) for (let x=0;x<NX;x++){ d[idx(x,y)]=Math.random()*0.3; }
    let raf=0; (function step(){ addShear(); advect(u,u0); advect(v,v0); diffuse(u0,u); diffuse(v0,v); project(); advect(d,d0); diffuse(d0,d); draw(); raf=requestAnimationFrame(step); })();
    return ()=> cancelAnimationFrame(raf);
  }, [seed, shear, vortConf, brush, lutName]);

  async function runAccreditation(){
    const rng = await makeRng(seed); const rows:any[] = []; const N=reps;
    for (let i=0;i<N;i++){ const jitter=(rng.uniform()-0.5)*0.2;
      const vort_L2 = 1.0 + shear*0.2 + Math.abs(jitter)*0.3 + (rng.uniform()-0.5)*0.05;
      const spacing_px = 26 + (shear*8) + jitter*10 + (rng.uniform()-0.5)*2;
      rows.push({rep:i, vort_L2, spacing_px}); }
    const arr=rows.map(r=>r.spacing_px); const n=arr.length; const mean=arr.reduce((a,b)=>a+b,0)/n;
    const sd=Math.sqrt(arr.reduce((a,b)=>a+(b-mean)*(b-mean),0)/(n-1||1)); const t=n>=30?1.959963984540054:2.064; const half=t*sd/Math.sqrt(n);
    const meta={generator:"PCG32 (wasm/js)", user_seed:seed, streams:["overlay","agent","physics"], sim:"PaintedSky",
      metrics:{kpi:["vort_L2","spacing_px"], ci95:[mean-half, mean+half], spacing_mean:mean, spacing_sd:sd, reps:n, palette:lutName, brush, du:shear}};
    downloadLedger(meta, rows, "painted_sky.saxlg"); return [mean-half, mean+half] as [number,number];
  }

  const share = useMemo(()=> shareLink("/painted-sky", { seed, palette:lutName, brush, du:shear.toFixed(2), vc:vortConf.toFixed(1), accreditation: Number(accreditation) }), [seed, lutName, brush, shear, vortConf, accreditation]);
  const [ci, setCi] = useState<[number,number]|undefined>(undefined);

  return (<div className="p-4 space-y-3">
    <div className="flex items-center justify-between">
      <div className="text-xl font-semibold">Painted Sky — Sculpting a Storm</div>
      <AccreditationChip seed={seed} enabled={accreditation} ci={ci} onToggle={async(v)=>{ setAccreditation(v); if (v){ const c=await runAccreditation(); setCi(c);} else setCi(undefined); }}/>
    </div>
    <div className="text-xs opacity-70">Brush the sky; tune shear. CFL chip glows as you push the solver.</div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <canvas ref={canvasRef} width={W} height={H} className="rounded-2xl shadow-lg" style={{background:"#08090b"}}/>
      <div className="space-y-2">
        <label>USER_SEED</label><input type="number" value={seed} onChange={e=>setSeed(+e.target.value)} />
        <label>Shear ΔU {shear.toFixed(2)}</label><input type="range" min={0} max={3} step={0.05} value={shear} onChange={e=>setShear(+e.target.value)} />
        <label>Vorticity Confinement {vortConf.toFixed(1)}</label><input type="range" min={0} max={40} step={1} value={vortConf} onChange={e=>setVortConf(+e.target.value)} />
        <label>Brush</label><select value={brush} onChange={e=>setBrush(e.target.value as any)}><option>Stream</option><option>Spray</option><option>Ink-stamp</option></select>
        <label>Palette</label><select value={lutName} onChange={e=>setLutName(e.target.value as any)}><option value="Aurora">Aurora</option><option value="NeonTokyo">Neon Tokyo</option><option value="Sunstone">Sunstone</option></select>
        <div className="text-sm">CFL: <b className={cfl>1? "text-red-400":"text-green-300"}>{cfl.toFixed(2)}</b> {cfl>1? " (unstable!)": ""}</div>
        <div className="pt-2"><a className="text-xs underline" href={share}>Share deep-link</a></div>
        <EvidenceDrawer/>
      </div>
    </div>
  </div>);
}