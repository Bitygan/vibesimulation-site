
import React, {useEffect, useMemo, useRef, useState} from "react";
import AccreditationChip from "./AccreditationChip";
import EvidenceDrawer from "./EvidenceDrawer";
import { parseParams, shareLink } from "../utils/deeplink";
import { makeRng } from "../utils/rng";
import { downloadLedger } from "../utils/ledger";

/**
 * Charge Painter — Laplace Sandbox
 * 2D Laplace solver (steady electrostatics/heat) with Gauss–Seidel or SOR.
 * Draw Dirichlet conductors at specified potentials; watch equipotentials and field lines.
 * KPIs for Accreditation: L2 residual per sweep, convergence rate, boundary error; bake-off GS vs SOR iterations to epsilon.
 *
 * Discretization (5-point Laplacian):
 *   φ_{i,j}^{new} = 0.25 * (φ_{i+1,j} + φ_{i-1,j} + φ_{i,j+1} + φ_{i,j-1})  (interior)
 * Gauss–Seidel: in-place update; SOR: φ ← (1−ω)φ + ω φ_new, 1<ω<2 typically.
 */

type Method = "GS"|"SOR";

export default function ChargePainter(){
  const W=1120, H=630, NX=160, NY=90;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparkRef = useRef<HTMLCanvasElement>(null);

  // Controls
  const [seed,setSeed] = useState(20250827);
  const [method,setMethod] = useState<Method>("SOR");
  const [omega,setOmega] = useState(1.85);
  const [brushV,setBrushV] = useState(50);
  const [brushR,setBrushR] = useState(10);
  const [isoCount,setIsoCount] = useState(11);
  const [chalk,setChalk] = useState(true);
  const [sweepsPerFrame,setSweepsPerFrame] = useState(3);
  const [accreditation,setAccreditation] = useState(true);
  const [residual,setResidual] = useState(0);
  const [rate,setRate] = useState(0);

  // Deep-link params
  useEffect(()=>{
    const p=parseParams();
    if (p.seed) setSeed(Number(p.seed));
    if (p.method) setMethod(String(p.method).toUpperCase()==="GS"?"GS":"SOR");
    if (p.omega) setOmega(Math.max(1.0, Math.min(1.99, Number(p.omega))));
    if (p.V) setBrushV(Number(p.V));
    if (p.R) setBrushR(Number(p.R));
    if (p.iso) setIsoCount(Math.max(5, Math.min(25, Number(p.iso))));
    if (p.chalk!==undefined) setChalk(Boolean(p.chalk));
    if (p.accreditation!==undefined) setAccreditation(Boolean(p.accreditation));
  }, []);

  useEffect(()=>{
    const NXloc=NX, NYloc=NY;
    const phi = new Float32Array(NXloc*NYloc).fill(0);
    const fixed = new Uint8Array(NXloc*NYloc).fill(0); // 1==Dirichlet
    const fval = new Float32Array(NXloc*NYloc).fill(0); // Dirichlet values

    const canvas = canvasRef.current!; const ctx = canvas.getContext("2d")!;
    const spark = sparkRef.current?.getContext("2d")||null;

    // Painting conductors
    let drawing=false;
    function paint(e:PointerEvent){
      const r=canvas.getBoundingClientRect();
      const x=((e.clientX-r.left)/W)*NXloc, y=((e.clientY-r.top)/H)*NYloc;
      const R=brushR;
      for (let j=-R;j<=R;j++) for (let i=-R;i<=R;i++){
        const xi=Math.floor(x)+i, yj=Math.floor(y)+j;
        if (xi<1||xi>=NXloc-1||yj<1||yj>=NYloc-1) continue;
        if (i*i+j*j>R*R) continue;
        const k=yj*NXloc+xi;
        fixed[k]=1; fval[k]=brushV; phi[k]=brushV;
      }
    }
    canvas.onpointerdown=(e)=>{ drawing=true; paint(e as any); };
    canvas.onpointermove=(e)=>{ if (drawing) paint(e as any); };
    canvas.onpointerup=()=>{ drawing=false; };
    canvas.onpointerleave=()=>{ drawing=false; };

    // Initialize: small grounded border by default
    for (let i=0;i<NXloc;i++){ fixed[0*NXloc+i]=1; fval[i]=0; phi[i]=0;
                                const k=(NYloc-1)*NXloc+i; fixed[k]=1; fval[k]=0; phi[k]=0; }
    for (let j=0;j<NYloc;j++){ fixed[j*NXloc+0]=1; fval[j*NXloc+0]=0; phi[j*NXloc+0]=0;
                                const k=j*NXloc + (NXloc-1); fixed[k]=1; fval[k]=0; phi[k]=0; }

    // Field chalk particles
    const NP=400;
    const px = new Float32Array(NP), py=new Float32Array(NP);
    for (let p=0;p<NP;p++){ px[p]=Math.random()*(NXloc-2)+1; py[p]=Math.random()*(NYloc-2)+1; }

    const resHist:number[] = [];
    function sweepOnce(): number {
      // Return L2 residual of discrete Laplacian
      let r2=0, count=0;
      for (let j=1;j<NYloc-1;j++){
        for (let i=1;i<NXloc-1;i++){
          const k=j*NXloc+i;
          if (fixed[k]) continue;
          const newv = 0.25*(phi[k-1]+phi[k+1]+phi[k-NXloc]+phi[k+NXloc]);
          const oldv = phi[k];
          const upd = (method==="SOR")? ((1-omega)*oldv + omega*newv) : newv;
          phi[k]=upd;
        }
      }
      // enforce Dirichlet
      for (let k=0;k<phi.length;k++){ if (fixed[k]) phi[k]=fval[k]; }

      // residual using discrete Laplacian
      for (let j=1;j<NYloc-1;j++){
        for (let i=1;i<NXloc-1;i++){
          const k=j*NXloc+i;
          const lap = (phi[k-1]+phi[k+1]+phi[k-NXloc]+phi[k+NXloc] - 4*phi[k]);
          r2 += lap*lap; count++;
        }
      }
      const l2 = Math.sqrt(r2/(count||1));
      resHist.push(l2); if (resHist.length>200) resHist.shift();
      return l2;
    }

    function draw(){
      // render φ as colored image + iso-lines + optional field vectors
      const img = ctx.createImageData(W,H);
      // find min/max
      let vmin=1e9, vmax=-1e9;
      for (let k=0;k<phi.length;k++){ const v=phi[k]; if (v<vmin) vmin=v; if (v>vmax) vmax=v; }
      const levels:number[]=[];
      for (let L=0;L<isoCount;L++){ levels.push(vmin + (vmax-vmin)*(L/(isoCount-1))); }
      // normalize helper
      function norm(v:number){ if (vmax<=vmin) return 0.5; return (v-vmin)/(vmax-vmin); }

      // simple colormap: blue->white->red
      function colormap(t:number){ t=Math.max(0,Math.min(1,t)); 
        const r = t<0.5? t*2*255 : 255;
        const b = t<0.5? 255 : (1-(t-0.5)*2)*255;
        const g = 220*Math.sin(Math.PI*t);
        return [r|0,g|0,b|0];
      }

      // raster shade
      for (let Y=0;Y<H;Y++){
        const gy=Y/H*(NYloc-1); const j0=Math.floor(gy), j1=Math.min(NYloc-1,j0+1); const ty=gy-j0;
        for (let X=0;X<W;X++){
          const gx=X/W*(NXloc-1); const i0=Math.floor(gx), i1=Math.min(NXloc-1,i0+1); const tx=gx-i0;
          const k00=j0*NXloc+i0, k10=j0*NXloc+i1, k01=j1*NXloc+i0, k11=j1*NXloc+i1;
          const v = (1-tx)*(1-ty)*phi[k00] + tx*(1-ty)*phi[k10] + (1-tx)*ty*phi[k01] + tx*ty*phi[k11];
          const c = colormap(norm(v));
          const p=(Y*W+X)*4; img.data[p]=c[0]; img.data[p+1]=c[1]; img.data[p+2]=c[2]; img.data[p+3]=255;
        }
      }
      ctx.putImageData(img,0,0);

      // iso-lines via marching squares (thin)
      ctx.strokeStyle="rgba(255,255,255,0.18)"; ctx.lineWidth=1;
      for (const L of levels){
        for (let j=0;j<NYloc-1;j++){
          for (let i=0;i<NXloc-1;i++){
            const k00=j*NXloc+i, k10=j*NXloc+i+1, k01=(j+1)*NXloc+i, k11=(j+1)*NXloc+i+1;
            const v00=phi[k00]-L, v10=phi[k10]-L, v01=phi[k01]-L, v11=phi[k11]-L;
            const s0=v00>0?1:0, s1=v10>0?1:0, s2=v11>0?1:0, s3=v01>0?1:0;
            const idx = s0 | (s1<<1) | (s2<<2) | (s3<<3);
            if (idx===0 || idx===15) continue;
            function interp(ax:number,ay:number,bx:number,by:number,va:number,vb:number){
              const t = va/(va-vb+1e-12);
              return [ax + t*(bx-ax), ay + t*(by-ay)];
            }
            const x=i, y=j;
            // edges midpoints in grid coords
            const eTop = interp(x,y, x+1,y, v00, v10);
            const eRight = interp(x+1,y, x+1,y+1, v10, v11);
            const eBottom = interp(x,y+1, x+1,y+1, v01, v11);
            const eLeft = interp(x,y, x,y+1, v00, v01);
            // patterns
            const table: Record<number, [number[], number[]][]> = {
              1:[[eLeft,eBottom]], 2:[[eBottom,eRight]],3:[[eLeft,eRight]],
              4:[[eTop,eRight]], 5:[[eTop,eLeft],[eBottom,eRight]], 6:[[eTop,eBottom]],7:[[eTop,eLeft]],
              8:[[eTop,eLeft]], 9:[[eTop,eBottom]],10:[[eTop,eRight],[eLeft,eBottom]],11:[[eTop,eRight]],
              12:[[eLeft,eRight]],13:[[eBottom,eRight]],14:[[eLeft,eBottom]]
            };
            const segs = table[idx]; if (!segs) continue;
            for (const [a,b] of segs){
              ctx.beginPath();
              ctx.moveTo(a[0]/(NXloc-1)*W, a[1]/(NYloc-1)*H);
              ctx.lineTo(b[0]/(NXloc-1)*W, b[1]/(NYloc-1)*H);
              ctx.stroke();
            }
          }
        }
      }

      // field chalk particles advect along E = -∇φ
      if (chalk){
        ctx.fillStyle="rgba(255,255,255,0.45)";
        for (let p=0;p<NP;p++){
          let x=px[p], y=py[p];
          const i=Math.max(1, Math.min(NXloc-2, Math.floor(x)));
          const j=Math.max(1, Math.min(NYloc-2, Math.floor(y)));
          const k=j*NXloc+i;
          const Ex = -(phi[k+1]-phi[k-1])*0.5;
          const Ey = -(phi[k+NXloc]-phi[k-NXloc])*0.5;
          const mag = Math.hypot(Ex,Ey)+1e-6;
          const dtp = 0.15;
          x += (Ex/mag)*dtp; y += (Ey/mag)*dtp;
          // if hit conductor, respawn
          const ki = Math.floor(y)*NXloc + Math.floor(x);
          if (x<=1||x>=NXloc-2||y<=1||y>=NYloc-2 || (fixed[ki]&&Math.random()<0.8)){
            px[p]=Math.random()*(NXloc-2)+1; py[p]=Math.random()*(NYloc-2)+1;
          }else{ px[p]=x; py[p]=y; }
          const X = (px[p]/(NXloc-1))*W, Y=(py[p]/(NYloc-1))*H;
          ctx.fillRect(X, Y, 1.5, 1.5);
        }
      }

      // draw sparkline of residuals
      if (spark){
        const w=spark.canvas.width, h=spark.canvas.height;
        spark.clearRect(0,0,w,h);
        spark.strokeStyle="#ffcc66"; spark.lineWidth=2; spark.beginPath();
        const n = Math.max(1,resHist.length);
        const maxv = Math.max(...resHist, 1e-6), minv=Math.min(...resHist, 0);
        for (let i=0;i<n;i++){
          const t=i/(n-1||1);
          const v=resHist[i];
          const y = h - ( (Math.log10(v+1e-12)-Math.log10(minv+1e-12)) / (Math.log10(maxv+1e-12)-Math.log10(minv+1e-12)+1e-9) ) * h;
          const x = t*w;
          if (i===0) spark.moveTo(x,y); else spark.lineTo(x,y);
        }
        spark.stroke();
      }
    }

    let raf=0;
    (function loop(){
      const nSweeps = sweepsPerFrame|0;
      let l2=0;
      for (let s=0;s<nSweeps;s++){ l2 = sweepOnce(); }
      setResidual(l2);
      // estimate rate from last samples
      if (resHist.length>5){
        const a = Math.log(resHist[resHist.length-5]+1e-12);
        const b = Math.log(resHist[resHist.length-1]+1e-12);
        const r = Math.exp((b-a)/4);
        setRate(r);
      }
      draw();
      raf=requestAnimationFrame(loop);
    })();
    return ()=> cancelAnimationFrame(raf);
  }, [seed, method, omega, brushV, brushR, isoCount, chalk, sweepsPerFrame]);

  async function runAccreditation(){
    const rng = await makeRng(seed);
    const N=20;
    const rows:any[]=[];
    for (let rep=0; rep<N; rep++){
      const nx=64, ny=36; const n=nx*ny;
      const phi = new Float64Array(n).fill(0);
      const fixed = new Uint8Array(n).fill(0);
      const fval = new Float64Array(n).fill(0);
      const idx=(i:number,j:number)=> j*nx+i;
      // border grounded
      for (let i=0;i<nx;i++){ fixed[idx(i,0)]=1; fixed[idx(i,ny-1)]=1; fval[idx(i,0)]=0; fval[idx(i,ny-1)]=0; }
      for (let j=0;j<ny;j++){ fixed[idx(0,j)]=1; fixed[idx(nx-1,j)]=1; fval[idx(0,j)]=0; fval[idx(nx-1,j)]=0; }
      // random two plates
      const V1 = 50, V2 = -50;
      const x1 = 10 + (rng.int(0,nx-20)), y1 = 8 + (rng.int(0,ny-16));
      const x2 = 10 + (rng.int(0,nx-20)), y2 = 8 + (rng.int(0,ny-16));
      for (let i=x1;i<x1+8;i++) for (let j=y1;j<y1+2;j++){ const k=idx(i,j); fixed[k]=1; fval[k]=V1; phi[k]=V1; }
      for (let i=x2;i<x2+8;i++) for (let j=y2;j<y2+2;j++){ const k=idx(i,j); fixed[k]=1; fval[k]=V2; phi[k]=V2; }

      function sweep(method:"GS"|"SOR", omega:number): number {
        // return L2 residual
        let r2=0, count=0;
        for (let j=1;j<ny-1;j++){
          for (let i=1;i<nx-1;i++){
            const k=idx(i,j);
            if (fixed[k]) continue;
            const newv = 0.25*(phi[k-1]+phi[k+1]+phi[k-nx]+phi[k+nx]);
            const oldv = phi[k];
            phi[k] = method==="SOR"? ((1-omega)*oldv + omega*newv) : newv;
          }
        }
        for (let k=0;k<n;k++){ if (fixed[k]) phi[k]=fval[k]; }
        for (let j=1;j<ny-1;j++){
          for (let i=1;i<nx-1;i++){
            const k=idx(i,j);
            const lap = (phi[k-1]+phi[k+1]+phi[k-nx]+phi[k+nx]-4*phi[k]);
            r2 += lap*lap; count++;
          }
        }
        return Math.sqrt(r2/(count||1));
      }

      function solveAndCount(method:"GS"|"SOR", omega:number, eps=1e-3, maxSweeps=600){
        let last=1e9; let sweeps=0;
        for (sweeps=0; sweeps<maxSweeps; sweeps++){
          const l2=sweep(method, omega);
          if (!Number.isFinite(l2)) break;
          if (l2<eps) break;
          last=l2;
        }
        // boundary error
        let be=0;
        for (let k=0;k<n;k++){ if (fixed[k]) be=Math.max(be, Math.abs(phi[k]-fval[k])); }
        return { sweeps, lastResidual:last, boundaryError:be };
      }

      // GS
      const gs = solveAndCount("GS", 1.0);
      // reinit for SOR test (fresh start)
      phi.fill(0); 
      for (let i=0;i<n;i++){ if (fixed[i]) phi[i]=fval[i]; }
      const sor = solveAndCount("SOR", 1.85);

      rows.push({rep, gs_sweeps:gs.sweeps, sor_sweeps:sor.sweeps, ratio:(gs.sweeps+1e-9)/(sor.sweeps+1e-9), 
                 gs_last:gs.lastResidual, sor_last:sor.lastResidual, b_err:max(gs.boundaryError, sor.boundaryError)});
    }
    const ratios = rows.map(r=>r.ratio);
    const n=ratios.length; const mean=ratios.reduce((a,b)=>a+b,0)/n;
    const sd=Math.sqrt(ratios.reduce((a,b)=>a+(b-mean)*(b-mean),0)/(n-1||1));
    const t=n>=30?1.959963984540054:2.064; const half=t*sd/Math.sqrt(n);
    const meta={generator:"PCG32 (wasm/js)", user_seed:seed, streams:["overlay","agent","solver"], sim:"ChargePainter",
      metrics:{kpi:["ratio_gs_over_sor","gs_sweeps","sor_sweeps","boundary_error","last_residual"], 
               ci95:[mean-half, mean+half], reps:n, method, omega, iso:isoCount}};
    downloadLedger(meta, rows, "charge_painter.saxlg");
    return [mean-half, mean+half] as [number,number];
  }

  const share = useMemo(()=> shareLink("/charge-painter", { seed, method, omega:omega.toFixed(2), V:brushV, R:brushR, iso:isoCount, chalk:Number(chalk), accreditation:Number(accreditation) }), [seed, method, omega, brushV, brushR, isoCount, chalk, accreditation]);
  const [ci, setCi] = useState<[number,number]|undefined>(undefined);

  return (<div className="p-4 space-y-3">
    <div className="flex items-center justify-between">
      <div className="text-xl font-semibold">Charge Painter — Laplace Sandbox</div>
      <AccreditationChip seed={seed} enabled={accreditation} ci={ci} onToggle={async(v)=>{ setAccreditation(v); if (v){ const c=await runAccreditation(); setCi(c);} else setCi(undefined); }}/>
    </div>
    <div className="text-xs opacity-70">Paint Dirichlet conductors (±V). Toggle GS/SOR; watch residuals fall, iso-lines grow, and field chalk drift along E = −∇φ.</div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <canvas ref={canvasRef} width={W} height={H} className="rounded-2xl shadow-lg" style={{background:"#08090b"}}/>
      <div className="space-y-2">
        <label>USER_SEED</label><input type="number" value={seed} onChange={e=>setSeed(+e.target.value)} />
        <label>Method</label><select value={method} onChange={e=>setMethod(e.target.value as Method)}><option>GS</option><option>SOR</option></select>
        <label>ω (SOR)</label><input type="range" min={1.0} max={1.99} step={0.01} value={omega} onChange={e=>setOmega(+e.target.value)} />
        <label>Brush V</label><input type="range" min={-100} max={+100} step={1} value={brushV} onChange={e=>setBrushV(+e.target.value)} />
        <label>Brush R</label><input type="range" min={2} max={20} step={1} value={brushR} onChange={e=>setBrushR(+e.target.value)} />
        <label>Iso-lines {isoCount}</label><input type="range" min={5} max={25} step={1} value={isoCount} onChange={e=>setIsoCount(+e.target.value)} />
        <label><input type="checkbox" checked={chalk} onChange={e=>setChalk(e.target.checked)} /> Field chalk</label>
        <label>Sweeps/frame {sweepsPerFrame}</label><input type="range" min={1} max={12} step={1} value={sweepsPerFrame} onChange={e=>setSweepsPerFrame(+e.target.value)} />
        <div className="text-sm">Residual L₂: <b className={residual<1e-3? "text-green-300":"text-yellow-300"}>{residual.toExponential(2)}</b> | Rate ≈ <b>{rate.toFixed(3)}</b></div>
        <div className="pt-2"><a className="text-xs underline" href={share}>Share deep-link</a></div>
        <EvidenceDrawer/>
        <canvas ref={sparkRef} width={220} height={64} className="rounded bg-black/30" />
      </div>
    </div>
  </div>);
}
