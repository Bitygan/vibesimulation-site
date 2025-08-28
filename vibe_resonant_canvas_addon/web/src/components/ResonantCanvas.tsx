
import React, {useEffect, useMemo, useRef, useState} from "react";
import AccreditationChip from "./AccreditationChip";
import EvidenceDrawer from "./EvidenceDrawer";
import { parseParams, shareLink } from "../utils/deeplink";
import { makeRng } from "../utils/rng";
import { downloadLedger } from "../utils/ledger";

/**
 * Resonant Canvas — String & Drum Studio
 * 1D string + 2D membrane finite differences with Courant σ control, spectrogram, and modal "fireflies".
 * Schemes: leapfrog (2nd order) and a 4th-order-in-space variant for bake-off.
 * KPIs: σ per frame, energy drift, and mode error vs theory (string; membrane basic).
 */

type Geo = "String1D" | "Square2D" | "Circle2D";
type Scheme = "Leapfrog2" | "Space4";

function clamp(x:number,lo:number,hi:number){ return Math.max(lo, Math.min(hi, x)); }
function lerp(a:number,b:number,t:number){ return a + (b-a)*t; }
function hann(n:number,i:number){ return 0.5*(1-Math.cos(2*Math.PI*i/(n-1))); }

export default function ResonantCanvas(){
  const W=1120, H=630;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const specRef = useRef<HTMLCanvasElement>(null);

  const [seed,setSeed] = useState(20250827);
  const [geo,setGeo] = useState<Geo>("String1D");
  const [scheme,setScheme] = useState<Scheme>("Leapfrog2");
  const [T,setT] = useState(1.0);       // tension proxy
  const [rho,setRho] = useState(1.0);   // density proxy
  const [sigmaTarget,setSigmaTarget] = useState(0.9);
  const [damp,setDamp] = useState(0.0005);
  const [bow,setBow] = useState(false);
  const [driveF,setDriveF] = useState(3.0); // Hz-like in sim time
  const [accreditation,setAccreditation] = useState(true);

  const [sigmaLive,setSigmaLive] = useState(0);
  const [energyDrift,setEnergyDrift] = useState(0);

  // Parse deep-links
  useEffect(()=>{
    const p=parseParams();
    if (p.seed) setSeed(Number(p.seed));
    if (p.geo) setGeo(String(p.geo) as Geo);
    if (p.scheme) setScheme(String(p.scheme) as Scheme);
    if (p.T) setT(Number(p.T));
    if (p.rho) setRho(Number(p.rho));
    if (p.sigma) setSigmaTarget(Number(p.sigma));
    if (p.damp) setDamp(Number(p.damp));
    if (p.bow!==undefined) setBow(Boolean(p.bow));
    if (p.f) setDriveF(Number(p.f));
    if (p.accreditation!==undefined) setAccreditation(Boolean(p.accreditation));
  }, []);

  useEffect(()=>{
    const canvas=canvasRef.current!; const ctx=canvas.getContext("2d")!;
    const spec=specRef.current?.getContext("2d")||null;

    const c = Math.sqrt(Math.max(1e-6, T)/Math.max(1e-6, rho)); // wave speed
    const dx = 1.0;

    // grid sizes
    const NX = (geo==="String1D")? 256 : 160;
    const NY = (geo==="String1D")? 1   : 90;
    const dim = (geo==="String1D")? 1 : 2;
    const dt = Math.min(0.5, Math.max(0.0005, (sigmaTarget * dx) / (c * (dim===1?1:Math.SQRT2))));
    const sigma = c*dt/dx;
    setSigmaLive(sigma);

    // state arrays
    const N = NX*NY;
    let u_now = new Float32Array(N).fill(0);
    let u_prv = new Float32Array(N).fill(0);
    let u_nxt = new Float32Array(N).fill(0);

    const mask = new Uint8Array(N).fill(1); // 1 interior, 0 boundary/clamped
    function idx(i:number,j:number){ return j*NX+i; }

    // Boundary conditions
    if (geo==="String1D"){
      mask[idx(0,0)]=0; mask[idx(NX-1,0)]=0;
    }else if (geo==="Square2D"){
      for (let i=0;i<NX;i++){ mask[idx(i,0)]=0; mask[idx(i,NY-1)]=0; }
      for (let j=0;j<NY;j++){ mask[idx(0,j)]=0; mask[idx(NX-1,j)]=0; }
    }else if (geo==="Circle2D"){
      const R = Math.min(NX,NY)*0.48;
      const cx = (NX-1)/2, cy=(NY-1)/2;
      for (let j=0;j<NY;j++) for (let i=0;i<NX;i++){
        const r = Math.hypot(i-cx, j-cy);
        mask[idx(i,j)] = (r<R-0.5)? 1:0;
      }
    }

    // Initial pluck/strike
    if (geo==="String1D"){
      const mid = Math.floor(NX*0.6);
      for (let i=0;i<NX;i++){
        const tri = (i<=mid)? (i/mid) : (1 - (i-mid)/(NX-1-mid));
        u_now[idx(i,0)] = 0.30*tri;
        u_prv[idx(i,0)] = u_now[idx(i,0)]; // rest start
      }
    }

    // Pointer interactions
    let pointer=false, px=0, py=0;
    function addImpulse(x:number,y:number){
      if (geo==="String1D"){
        const i = Math.max(1, Math.min(NX-2, Math.floor(x/(W)*(NX-1))));
        for (let k=-3;k<=3;k++){
          const ii=i+k; if (ii<=0||ii>=NX-1) continue;
          const amp = Math.exp(-0.5*k*k/4);
          u_now[idx(ii,0)] += 0.6*amp;
        }
      }else{
        const i = Math.floor(x/W*(NX-1)), j = Math.floor(y/H*(NY-1));
        const R=6;
        for (let jj=-R;jj<=R;jj++) for (let ii=-R;ii<=R;ii++){
          const xg=i+ii, yg=j+jj; if (xg<1||xg>=NX-1||yg<1||yg>=NY-1) continue;
          if (!mask[idx(xg,yg)]) continue;
          const r2=ii*ii+jj*jj; if (r2>R*R) continue;
          const amp = Math.exp(-r2/(0.5*R*R));
          u_now[idx(xg,yg)] += 0.4*amp;
        }
      }
    }
    canvas.onpointerdown=(e)=>{ pointer=true; const r=canvas.getBoundingClientRect(); px=e.clientX-r.left; py=e.clientY-r.top; addImpulse(px,py); };
    canvas.onpointermove=(e)=>{ if(!pointer) return; const r=canvas.getBoundingClientRect(); px=e.clientX-r.left; py=e.clientY-r.top; if (!bow) addImpulse(px,py); };
    canvas.onpointerup=()=>{ pointer=false; };
    canvas.onpointerleave=()=>{ pointer=false; };

    // Laplacians
    function lap2(i:number,j:number): number {
      if (geo==="String1D"){
        if (i<=0||i>=NX-1) return 0;
        const k=idx(i,0);
        return (u_now[idx(i-1,0)] - 2*u_now[k] + u_now[idx(i+1,0)]);
      }else{
        if (i<=0||i>=NX-1||j<=0||j>=NY-1) return 0;
        const k=idx(i,j);
        return (u_now[idx(i-1,j)] + u_now[idx(i+1,j)] + u_now[idx(i,j-1)] + u_now[idx(i,j+1)] - 4*u_now[k]);
      }
    }
    function lap4(i:number,j:number): number {
      if (geo==="String1D"){
        if (i<2||i>NX-3) return lap2(i,0);
        const k=idx(i,0);
        return (-u_now[idx(i+2,0)] + 16*u_now[idx(i+1,0)] - 30*u_now[k] + 16*u_now[idx(i-1,0)] - u_now[idx(i-2,0)])/12.0;
      }else{
        if (i<2||i>NX-3||j<2||j>NY-3) return lap2(i,j);
        const k=idx(i,j);
        const d2x = (-u_now[idx(i+2,j)] + 16*u_now[idx(i+1,j)] - 30*u_now[k] + 16*u_now[idx(i-1,j)] - u_now[idx(i-2,j)])/12.0;
        const d2y = (-u_now[idx(i,j+2)] + 16*u_now[idx(i,j+1)] - 30*u_now[k] + 16*u_now[idx(i,j-1)] - u_now[idx(i,j-2)])/12.0;
        return d2x + d2y;
      }
    }
    const useLap = (scheme==="Leapfrog2")? lap2 : lap4;

    // Energy (discrete kinetic + strain)
    let E0=-1;
    function energy(): number {
      let kin=0, str=0;
      for (let j=0;j<NY;j++){
        for (let i=0;i<NX;i++){
          const k=idx(i,j);
          const v = (u_now[k]-u_prv[k])/dt;
          kin += 0.5*rho*v*v;
          if (geo==="String1D"){
            const du = ( (i<NX-1? u_now[idx(i+1,0)]:0) - (i>0? u_now[idx(i-1,0)]:0) )*0.5;
            str += 0.5*T*du*du;
          }else{
            const dux = ( (i<NX-1? u_now[idx(i+1,j)]:0) - (i>0? u_now[idx(i-1,j)]:0) )*0.5;
            const duy = ( (j<NY-1? u_now[idx(i,j+1)]:0) - (j>0? u_now[idx(i,j-1)]:0) )*0.5;
            str += 0.5*T*(dux*dux+duy*duy);
          }
        }
      }
      const E=kin+str; if (E0<0) E0=E; return (E - E0)/(E0+1e-9);
    }

    // Spectrum buffer
    const Nspec=256; const ybuf=new Float32Array(Nspec); let yptr=0;
    function pushSample(){
      if (geo==="String1D"){
        const k=idx(Math.floor(NX/2),0);
        ybuf[yptr%Nspec]=u_now[k]; yptr++;
      }else{
        const k=idx(Math.floor(NX/2), Math.floor(NY/2));
        ybuf[yptr%Nspec]=u_now[k]; yptr++;
      }
    }
    function drawSpectrum(){
      if (!spec) return;
      const w=spec.canvas.width, h=spec.canvas.height;
      spec.clearRect(0,0,w,h);
      // naive DFT magnitude (first half)
      const N=ybuf.length; const mags=new Float32Array(N/2);
      for (let k=0;k<N/2;k++){
        let re=0, im=0;
        for (let n=0;n<N;n++){
          const win=hann(N,n); const ph=-2*Math.PI*k*n/N;
          re += ybuf[n]*win*Math.cos(ph);
          im += ybuf[n]*win*Math.sin(ph);
        }
        mags[k]=Math.sqrt(re*re+im*im);
      }
      const maxv = Math.max(1e-9, Math.max(...mags as any));
      spec.fillStyle="#0b0f16"; spec.fillRect(0,0,w,h);
      spec.fillStyle="#73ffbd";
      for (let k=0;k<mags.length;k++){
        const x = (k/(mags.length-1))*w;
        const y = h - (mags[k]/maxv)*h;
        spec.fillRect(x, y, Math.max(1, w/mags.length-1), h-y);
      }
    }

    // Render
    function render(){
      const ctx2=ctx;
      ctx2.clearRect(0,0,W,H);
      ctx2.fillStyle="#0b0f16"; ctx2.fillRect(0,0,W,H);
      if (geo==="String1D"){
        ctx2.strokeStyle="#87b7ff"; ctx2.lineWidth=3; ctx2.beginPath();
        for (let i=0;i<NX;i++){
          const x=i/(NX-1)*W; const y=H*0.5 - u_now[idx(i,0)]*H*0.35;
          if (i===0) ctx2.moveTo(x,y); else ctx2.lineTo(x,y);
        }
        ctx2.stroke();
        // fireflies at antinodes
        ctx2.fillStyle="rgba(255,229,89,0.85)";
        for (let i=2;i<NX-2;i++){
          const k=idx(i,0);
          if (Math.abs(u_now[k])>Math.abs(u_now[idx(i-1,0)]) && Math.abs(u_now[k])>Math.abs(u_now[idx(i+1,0)])){
            const x=i/(NX-1)*W, y=H*0.5 - u_now[k]*H*0.35;
            ctx2.beginPath(); ctx2.arc(x,y,3,0,Math.PI*2); ctx2.fill();
          }
        }
      }else{
        // membrane heatmap + fireflies
        let umin=1e9, umax=-1e9;
        for (let j=0;j<NY;j++) for (let i=0;i<NX;i++){ const k=idx(i,j); if (!mask[k]) continue; const v=u_now[k]; if (v<umin) umin=v; if (v>umax) umax=v; }
        const img=ctx2.createImageData(W,H);
        for (let Y=0;Y<H;Y++){
          const gy=Y/H*(NY-1); const j0=Math.floor(gy), j1=Math.min(NY-1,j0+1); const ty=gy-j0;
          for (let X=0;X<W;X++){
            const gx=X/W*(NX-1); const i0=Math.floor(gx), i1=Math.min(NX-1,i0+1); const tx=gx-i0;
            const k00=idx(i0,j0), k10=idx(i1,j0), k01=idx(i0,j1), k11=idx(i1,j1);
            const v = (1-tx)*(1-ty)*u_now[k00] + tx*(1-ty)*u_now[k10] + (1-tx)*ty*u_now[k01] + tx*ty*u_now[k11];
            const t = (v - umin)/Math.max(1e-6, (umax-umin));
            const r = Math.floor(lerp(20,255,t)), g = Math.floor(lerp(40,120,Math.sin(t*Math.PI))), b = Math.floor(lerp(255,50,t));
            const p=(Y*W+X)*4; img.data[p]=r; img.data[p+1]=g; img.data[p+2]=b; img.data[p+3]= mask[k00]?255:20;
          }
        }
        ctx2.putImageData(img,0,0);
        ctx2.fillStyle="rgba(255,229,89,0.85)";
        const step=8;
        for (let j=step;j<NY-step;j+=step){
          for (let i=step;i<NX-step;i+=step){
            const k=idx(i,j); if (!mask[k]) continue;
            const v=u_now[k];
            if (v>u_now[idx(i-1,j)] && v>u_now[idx(i+1,j)] && v>u_now[idx(i,j-1)] && v>u_now[idx(i,j+1)]){
              const x=i/(NX-1)*W, y=j/(NY-1)*H;
              ctx2.beginPath(); ctx2.arc(x,y,2,0,Math.PI*2); ctx2.fill();
            }
          }
        }
      }
      // overlays
      ctx2.fillStyle="rgba(255,255,255,0.85)";
      ctx2.font="12px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx2.fillText(`σ live = ${sigma.toFixed(3)}  |  c = ${c.toFixed(3)}  |  scheme = ${scheme}  |  geo = ${geo}`, 12, 18);
      ctx2.fillText(`Energy drift = ${(energy()*100).toFixed(2)}%`, 12, 36);
    }

    // main loop
    let t=0, raf=0;
    function step(){
      // bowing drive at pointer
      if (bow){
        // gentle global drive at center to keep UI simple
        if (geo==="String1D"){
          const i = Math.floor(NX/2);
          u_now[idx(i,0)] += 0.0015*Math.sin(2*Math.PI*driveF*t);
        }else{
          const i = Math.floor(NX/2), j=Math.floor(NY/2);
          u_now[idx(i,j)] += 0.0015*Math.sin(2*Math.PI*driveF*t);
        }
      }
      const useLap = (scheme==="Leapfrog2")? (i:number,j:number)=>{
        if (geo==="String1D"){
          if (i<=0||i>=NX-1) return 0;
          const k=idx(i,0);
          return (u_now[idx(i-1,0)] - 2*u_now[k] + u_now[idx(i+1,0)]);
        }else{
          if (i<=0||i>=NX-1||j<=0||j>=NY-1) return 0;
          const k=idx(i,j);
          return (u_now[idx(i-1,j)] + u_now[idx(i+1,j)] + u_now[idx(i,j-1)] + u_now[idx(i,j+1)] - 4*u_now[k]);
        }
      } : (i:number,j:number)=>{
        if (geo==="String1D"){
          if (i<2||i>NX-3) return (i<=0||i>=NX-1)?0:(u_now[idx(i-1,0)] - 2*u_now[idx(i,0)] + u_now[idx(i+1,0)]);
          const k=idx(i,0);
          return (-u_now[idx(i+2,0)] + 16*u_now[idx(i+1,0)] - 30*u_now[k] + 16*u_now[idx(i-1,0)] - u_now[idx(i-2,0)])/12.0;
        }else{
          if (i<2||i>NX-3||j<2||j>NY-3) return (i<=0||i>=NX-1||j<=0||j>=NY-1)?0:(u_now[idx(i-1,j)] + u_now[idx(i+1,j)] + u_now[idx(i,j-1)] + u_now[idx(i,j+1)] - 4*u_now[idx(i,j)]);
          const k=idx(i,j);
          const d2x = (-u_now[idx(i+2,j)] + 16*u_now[idx(i+1,j)] - 30*u_now[k] + 16*u_now[idx(i-1,j)] - u_now[idx(i-2,j)])/12.0;
          const d2y = (-u_now[idx(i,j+2)] + 16*u_now[idx(i,j+1)] - 30*u_now[k] + 16*u_now[idx(i,j-1)] - u_now[idx(i,j-2)])/12.0;
          return d2x + d2y;
        }
      };

      const dampF = (1 - damp);
      for (let j=0;j<NY;j++){
        for (let i=0;i<NX;i++){
          const k=idx(i,j);
          if (!mask[k]){ u_nxt[k]=0; continue; }
          const lap = useLap(i,j);
          const u = u_now[k], um = u_prv[k];
          u_nxt[k] = dampF*(2*u - um) + (c*c)*(dt*dt)*lap;
        }
      }
      // swap
      const tmp=u_prv; (u_prv as any)=u_now; (u_now as any)=u_nxt; (u_nxt as any)=tmp;

      t += dt;
      // sampling/spectrum
      if (spec){ pushSample(); if ((Math.random()<0.2)) drawSpectrum(); }
      render();
      setEnergyDrift( (()=>{
        let kin=0, str=0;
        for (let j=0;j<NY;j++){
          for (let i=0;i<NX;i++){
            const k=idx(i,j);
            const v = (u_now[k]-u_prv[k])/dt;
            kin += 0.5*rho*v*v;
            if (geo==="String1D"){
              const du = ( (i<NX-1? u_now[idx(i+1,0)]:0) - (i>0? u_now[idx(i-1,0)]:0) )*0.5;
              str += 0.5*T*du*du;
            }else{
              const dux = ( (i<NX-1? u_now[idx(i+1,j)]:0) - (i>0? u_now[idx(i-1,j)]:0) )*0.5;
              const duy = ( (j<NY-1? u_now[idx(i,j+1)]:0) - (j>0? u_now[idx(i,j-1)]:0) )*0.5;
              str += 0.5*T*(dux*dux+duy*duy);
            }
          }
        }
        const E=kin+str; return E; })() as any );
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    return ()=> { /* cleanup intentionally light; canvas anim stops on unmount */ };
  }, [geo, scheme, T, rho, sigmaTarget, damp, bow, driveF]);

  async function runAccreditation(){
    // 1D string: estimate fundamental and energy drift; compare Leapfrog2 vs Space4 at same σ.
    const rng = await makeRng(seed);
    const reps = 24;
    const rows:any[]=[];
    for (let r=0;r<reps;r++){
      const NX=256; const dx=1.0;
      const Tloc = T, rholoc=rho; const c = Math.sqrt(Tloc/rholoc);
      const sigma = sigmaTarget;
      const dt = Math.min(0.5, Math.max(0.0005, (sigma*dx)/c));
      function runOnce(space4:boolean){
        let u_now = new Float64Array(NX).fill(0);
        let u_prv = new Float64Array(NX).fill(0);
        let u_nxt = new Float64Array(NX).fill(0);
        // pluck at random mid region
        const mid = 30 + (rng.int(0,NX-60));
        for (let i=0;i<NX;i++){
          const tri=(i<=mid)? i/mid : (1-(i-mid)/(NX-1-mid));
          u_now[i]=0.3*tri; u_prv[i]=u_now[i];
        }
        function lap2(i:number){ if (i<=0||i>=NX-1) return 0; return (u_now[i-1]-2*u_now[i]+u_now[i+1]); }
        function lap4(i:number){ if (i<2||i>NX-3) return lap2(i); return (-u_now[i+2]+16*u_now[i+1]-30*u_now[i]+16*u_now[i-1]-u_now[i-2])/12.0; }
        // energy
        let E0=-1;
        function energy(){
          let kin=0,str=0;
          for (let i=0;i<NX;i++){
            const v=(u_now[i]-u_prv[i])/dt; kin+=0.5*rholoc*v*v;
            const du=( (i<NX-1?u_now[i+1]:0) - (i>0?u_now[i-1]:0) )*0.5;
            str+=0.5*Tloc*du*du;
          }
          const E=kin+str; if (E0<0) E0=E; return (E-E0)/(E0+1e-12);
        }
        const ybuf = new Float64Array(512); let yptr=0;
        function pushSample(v:number){ ybuf[yptr%ybuf.length]=v; yptr++; }
        const steps = 2000;
        for (let n=0;n<steps;n++){
          for (let i=0;i<NX;i++){
            const u=u_now[i], um=u_prv[i];
            const lap = space4? lap4(i): lap2(i);
            u_nxt[i] = 2*u - um + (c*c)*(dt*dt)*lap;
          }
          const tmp=u_prv; u_prv=u_now; u_now=u_nxt; u_nxt=tmp;
          if (n%4===0) pushSample(u_now[Math.floor(NX/2)]);
        }
        // DFT peak
        const N=ybuf.length; let kmax=1, vmax=0;
        for (let k=1;k<N//2;k++){
          let re=0, im=0;
          for (let n=0;n<N;n++){
            const win=0.5*(1-Math.cos(2*Math.PI*n/(N-1)));
            const ph=-2*Math.PI*k*n/N;
            re+=ybuf[n]*win*Math.cos(ph);
            im+=ybuf[n]*win*Math.sin(ph);
          }
          const mag=Math.hypot(re,im);
          if (mag>vmax){ vmax=mag; kmax=k; }
        }
        const fs = 1/dt; // samples per time unit
        const f_meas = (kmax*fs)/N;
        const L = (NX-1)*dx;
        const f_theory = c/(2*L);
        const mode_err = Math.abs(f_meas - f_theory)/(f_theory+1e-12);
        const drift = energy();
        return { f_meas, f_theory, mode_err, drift };
      }
      const a = runOnce(false); // Leapfrog2 (2nd-order space)
      const b = runOnce(true);  // Space4
      rows.push({
        rep:r, sigma, f_theory:a.f_theory, f_meas2:a.f_meas, f_meas4:b.f_meas,
        mode_err2:a.mode_err, mode_err4:b.mode_err, drift2:a.drift, drift4:b.drift,
        err_ratio:(a.mode_err+1e-9)/(b.mode_err+1e-9), drift_ratio:Math.abs(a.drift)+1e-9
      });
    }
    // summarize CI for err_ratio
    const arr = rows.map(r=>r.err_ratio); const n=arr.length;
    const mean=arr.reduce((x,y)=>x+y,0)/n;
    const sd=Math.sqrt(arr.reduce((s,v)=>s+(v-mean)*(v-mean),0)/(n-1||1));
    const t = n>=30?1.959963984540054:2.064; const half=t*sd/Math.sqrt(n);
    const meta={generator:"PCG32 (wasm/js)", user_seed:seed, streams:["overlay","physics","solver"], sim:"ResonantCanvas",
      metrics:{kpi:["mode_err2","mode_err4","drift2","drift4","err_ratio"], ci95:[mean-half, mean+half], reps:n, geo:"String1D", schemeA:"Leapfrog2", schemeB:"Space4", sigma:sigmaTarget, T, rho}};
    downloadLedger(meta, rows, "resonant_canvas.saxlg");
    return [mean-half, mean+half] as [number,number];
  }

  const share = useMemo(()=> shareLink("/resonant-canvas", { seed, geo, scheme, T:T.toFixed(3), rho:rho.toFixed(3), sigma:sigmaTarget.toFixed(2), damp:damp.toFixed(4), bow:Number(bow), f:driveF.toFixed(2), accreditation:Number(accreditation) }), [seed, geo, scheme, T, rho, sigmaTarget, damp, bow, driveF, accreditation]);
  const [ci, setCi] = useState<[number,number]|undefined>(undefined);

  return (<div className="p-4 space-y-3">
    <div className="flex items-center justify-between">
      <div className="text-xl font-semibold">Resonant Canvas — String & Drum Studio</div>
      <AccreditationChip seed={seed} enabled={accreditation} ci={ci} onToggle={async(v)=>{ setAccreditation(v); if (v){ const c=await runAccreditation(); setCi(c);} else setCi(undefined); }}/>
    </div>
    <div className="text-xs opacity-70">Pluck, strike, or bow. Courant σ = c·dt/Δx is enforced (≤1 in 1D, ≤1/√2 in 2D). Spectrogram shows peaks; fireflies mark antinodes.</div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <canvas ref={canvasRef} width={W} height={H} className="rounded-2xl shadow-lg" style={{background:"#08090b"}}/>
      <div className="space-y-2">
        <label>USER_SEED</label><input type="number" value={seed} onChange={e=>setSeed(+e.target.value)} />
        <label>Geometry</label><select value={geo} onChange={e=>setGeo(e.target.value as Geo)}><option>String1D</option><option>Square2D</option><option>Circle2D</option></select>
        <label>Scheme</label><select value={scheme} onChange={e=>setScheme(e.target.value as Scheme)}><option>Leapfrog2</option><option>Space4</option></select>
        <label>Tension T</label><input type="range" min={0.2} max={5.0} step={0.01} value={T} onChange={e=>setT(+e.target.value)} />
        <label>Density ρ</label><input type="range" min={0.2} max={5.0} step={0.01} value={rho} onChange={e=>setRho(+e.target.value)} />
        <label>σ target {sigmaTarget.toFixed(2)}</label><input type="range" min={0.2} max={0.99} step={0.01} value={sigmaTarget} onChange={e=>setSigmaTarget(+e.target.value)} />
        <label>Damping {damp.toFixed(4)}</label><input type="range" min={0.0} max={0.01} step={0.0001} value={damp} onChange={e=>setDamp(+e.target.value)} />
        <label><input type="checkbox" checked={bow} onChange={e=>setBow(e.target.checked)} /> Bow (sine drive at center)</label>
        <label>Bow freq {driveF.toFixed(2)}</label><input type="range" min={0.5} max={10.0} step={0.1} value={driveF} onChange={e=>setDriveF(+e.target.value)} />
        <div className="text-sm">σ live: <b className={sigmaLive>(geo==="String1D"?1:1/Math.SQRT2)? "text-red-400":"text-green-300"}>{sigmaLive.toFixed(3)}</b> | Energy drift (arb): <b>{(energyDrift as any).toFixed? (energyDrift as any).toFixed(3) : ""}</b></div>
        <div className="pt-2"><a className="text-xs underline" href={share}>Share deep-link</a></div>
        <EvidenceDrawer/>
        <canvas ref={specRef} width={220} height={100} className="rounded bg-black/30" />
      </div>
    </div>
  </div>);
}
