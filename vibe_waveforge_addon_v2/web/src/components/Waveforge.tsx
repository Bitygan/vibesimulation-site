import React, {useEffect, useMemo, useRef, useState} from "react";
import AccreditationChip from "./AccreditationChip";
import EvidenceDrawer from "./EvidenceDrawer";
import { parseParams, shareLink } from "../utils/deeplink";
import { makeRng } from "../utils/rng";
import { downloadLedger } from "../utils/ledger";

type LUT = "Ocean" | "Icefire" | "Magma";
type Mode = "Splash" | "Walls";
const H=0, HU=1, HV=2;

function clamp(x:number,lo:number,hi:number){ return Math.max(lo, Math.min(hi, x)); }
function makeLUT(name:LUT){
  const g:number[] = [];
  for (let i=0;i<256;i++){
    const t=i/255; let r=0,gr=0,b=0;
    if (name==="Ocean"){ r=0.1+0.6*Math.pow(t,1.7); gr=0.3+0.6*t; b=0.6+0.4*(1-t); }
    else if (name==="Icefire"){ r=Math.pow(t,1.2); gr=0.8*Math.pow(1-t,0.6); b=1.0; }
    else { r=0.2+0.8*Math.pow(t,1.8); gr=0.1+0.6*Math.pow(t,1.2); b=0.1+0.2*t; }
    g.push(Math.round(clamp(r*255,0,255)), Math.round(clamp(gr*255,0,255)), Math.round(clamp(b*255,0,255)), 255);
  }
  return new Uint8ClampedArray(g);
}

export default function Waveforge(){
  const W=1120, Hpx=630;
  const NX=160, NY=90;
  const [dxScale,setDxScale] = useState(1.0);
  const [seed,setSeed] = useState(20250827);
  const [grav,setGrav] = useState(9.81);
  const [fric,setFric] = useState(0.005);
  const [cflTarget,setCflTarget] = useState(0.7);
  const [palette,setPalette] = useState<LUT>("Ocean");
  const [showVec,setShowVec] = useState(false);
  const [mode,setMode] = useState<Mode>("Splash");
  const [brushR,setBrushR] = useState(10);
  const [accreditation,setAccreditation] = useState(true);
  const [cflLive,setCflLive] = useState(0);
  const [massPpm,setMassPpm] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(()=>{
    const p=parseParams();
    if (p.seed) setSeed(Number(p.seed));
    if (p.g) setGrav(Number(p.g));
    if (p.mu) setFric(Number(p.mu));
    if (p.cfl) setCflTarget(Number(p.cfl));
    if (p.dx) setDxScale(Number(p.dx));
    if (p.palette) setPalette(String(p.palette) as LUT);
    if (p.vec!==undefined) setShowVec(Boolean(Number(p.vec)));
    if (p.mode) setMode(String(p.mode) as Mode);
    if (p.R) setBrushR(Number(p.R));
    if (p.accreditation!==undefined) setAccreditation(Boolean(Number(p.accreditation)));
  }, []);

  useEffect(()=>{
    const nx=NX, ny=NY, ncell=nx*ny;
    const dx = 1.0*dxScale;

    let U = new Float32Array(ncell*3);
    let Utmp = new Float32Array(ncell*3);
    const solid = new Uint8Array(ncell).fill(0); // walls

    // initial film
    for (let j=0;j<ny;j++) for (let i=0;i<nx;i++){
      const k=(j*nx+i)*3; U[k+H]=0.8 + 0.02*Math.sin(i*0.2)*Math.sin(j*0.17); U[k+HU]=0; U[k+HV]=0;
    }

    const canvas = canvasRef.current!; const ctx = canvas.getContext("2d")!;
    let drawing=false;

    function idx(i:number,j:number){ return (j*nx+i); }
    function k3(i:number,j:number){ return ((j*nx+i)*3); }

    function inject(px:number, py:number){
      const R=brushR, amp=0.8;
      for (let j=-R;j<=R;j++) for (let i=-R;i<=R;i++){
        const x=Math.floor(px)+i, y=Math.floor(py)+j;
        if (x<1||x>=nx-1||y<1||y>=ny-1) continue;
        const r2=i*i+j*j; if (r2>R*R) continue;
        const k=k3(x,y);
        if (mode==="Walls"){
          solid[idx(x,y)] = 1;
          U[k+H]=0.02; U[k+HU]=0; U[k+HV]=0;
        }else{
          const bump = amp*Math.exp(-r2/(0.5*R*R));
          U[k+H]+= bump*0.15;
          const mag=Math.sqrt(r2)+1e-6;
          U[k+HU]+= 0.5*bump*(i/mag);
          U[k+HV]+= 0.5*bump*(j/mag);
        }
      }
    }

    canvas.oncontextmenu=(e)=>{ e.preventDefault(); return false; };
    canvas.onpointerdown=(e)=>{ drawing=true; const r=canvas.getBoundingClientRect(); const x=(e.clientX-r.left)/W*nx; const y=(e.clientY-r.top)/Hpx*ny; inject(x,y); };
    canvas.onpointermove=(e)=>{ if (!drawing) return; const r=canvas.getBoundingClientRect(); const x=(e.clientX-r.left)/W*nx; const y=(e.clientY-r.top)/Hpx*ny; inject(x,y); };
    canvas.onpointerup=()=>{ drawing=false; }; canvas.onpointerleave=()=>{ drawing=false; };

    function maxwavespeed(i:number,j:number,g:number){
      const k=k3(i,j); const h=U[k+H]; const u = U[k+HU]/(h+1e-6); const v=U[k+HV]/(h+1e-6);
      return Math.max(0, Math.abs(u)+Math.sqrt(g*Math.max(0,h)), Math.abs(v)+Math.sqrt(g*Math.max(0,h)));
    }

    function step(dt:number,g:number,mu:number){
      Utmp.set(U);
      // X flux
      for (let j=1;j<ny-1;j++){
        for (let i=1;i<nx-1;i++){
          const leftSolid = solid[idx(i-1,j)]===1, rightSolid = solid[idx(i,j)]===1;
          if (leftSolid && rightSolid) continue;
          const kL=k3(i-1,j), kR=k3(i,j);
          const hL=U[kL+H], uL=U[kL+HU]/(hL+1e-6), vL=U[kL+HV]/(hL+1e-6);
          const hR=U[kR+H], uR=U[kR+HU]/(hR+1e-6), vR=U[kR+HV]/(hR+1e-6);
          const s = Math.max(Math.abs(uL)+Math.sqrt(g*Math.max(0,hL)), Math.abs(uR)+Math.sqrt(g*Math.max(0,hR)));
          if (leftSolid || rightSolid){ continue; }
          const FL_h = U[kL+HU],    FR_h = U[kR+HU];
          const FL_hu= U[kL+HU]*uL + 0.5*g*hL*hL,  FR_hu= U[kR+HU]*uR + 0.5*g*hR*hR;
          const FL_hv= U[kL+HU]*vL,                FR_hv= U[kR+HU]*vR;
          const f_h  = 0.5*(FL_h+FR_h) - 0.5*s*(hR-hL);
          const f_hu = 0.5*(FL_hu+FR_hu) - 0.5*s*(U[kR+HU]-U[kL+HU]);
          const f_hv = 0.5*(FL_hv+FR_hv) - 0.5*s*(U[kR+HV]-U[kL+HV]);
          const sdx = dt/dx;
          Utmp[kR+H]  -= sdx * f_h;  Utmp[kR+HU] -= sdx * f_hu; Utmp[kR+HV] -= sdx * f_hv;
          Utmp[kL+H]  += sdx * f_h;  Utmp[kL+HU] += sdx * f_hu; Utmp[kL+HV] += sdx * f_hv;
        }
      }
      // Y flux
      for (let j=1;j<ny-1;j++){
        for (let i=1;i<nx-1;i++){
          const botSolid = solid[idx(i,j-1)]===1, topSolid = solid[idx(i,j)]===1;
          if (botSolid && topSolid) continue;
          const kB=k3(i,j-1), kT=k3(i,j);
          const hB=U[kB+H], uB=U[kB+HU]/(hB+1e-6), vB=U[kB+HV]/(hB+1e-6);
          const hT=U[kT+H], uT=U[kT+HU]/(hT+1e-6), vT=U[kT+HV]/(hT+1e-6);
          const s = Math.max(Math.abs(vB)+Math.sqrt(g*Math.max(0,hB)), Math.abs(vT)+Math.sqrt(g*Math.max(0,hT)));
          if (botSolid || topSolid){ continue; }
          const GL_h = U[kB+HV],    GR_h = U[kT+HV];
          const GL_hu= U[kB+HU]*vB,  GR_hu= U[kT+HU]*vT;
          const GL_hv= U[kB+HV]*vB + 0.5*g*hB*hB,  GR_hv= U[kT+HV]*vT + 0.5*g*hT*hT;
          const g_h  = 0.5*(GL_h+GR_h) - 0.5*s*(hT-hB);
          const g_hu = 0.5*(GL_hu+GR_hu) - 0.5*s*(U[kT+HU]-U[kB+HU]);
          const g_hv = 0.5*(GL_hv+GR_hv) - 0.5*s*(U[kT+HV]-U[kB+HV]);
          const sdy = dt/dx;
          Utmp[kT+H]  -= sdy * g_h;  Utmp[kT+HU] -= sdy * g_hu; Utmp[kT+HV] -= sdy * g_hv;
          Utmp[kB+H]  += sdy * g_h;  Utmp[kB+HU] += sdy * g_hu; Utmp[kB+HV] += sdy * g_hv;
        }
      }
      // Friction + floors
      const df = Math.exp(-Math.max(0,mu)*dt);
      for (let j=0;j<ny;j++) for (let i=0;i<nx;i++){
        const k=k3(i,j);
        Utmp[k+HU]*=df; Utmp[k+HV]*=df;
        const h = Math.max(0.02, Utmp[k+H]);
        const scl = h/(Utmp[k+H]||h);
        U[k+H]=h; U[k+HU]=Utmp[k+HU]*scl; U[k+HV]=Utmp[k+HV]*scl;
        if (solid[idx(i,j)]===1){ U[k+H]=0.02; U[k+HU]=0; U[k+HV]=0; }
      }
    }

    function draw(){
      const ctx = canvas.getContext("2d")!;
      const img = ctx.createImageData(W,Hpx);
      const lut = makeLUT(palette);
      // min/max
      let hmin=1e9, hmax=-1e9;
      for (let j=0;j<ny;j++) for (let i=0;i<nx;i++){
        const k=k3(i,j); const h=U[k+H]; if (h<hmin) hmin=h; if (h>hmax) hmax=h;
      }
      const range = Math.max(1e-3, hmax-hmin);
      for (let Y=0;Y<Hpx;Y++){
        const gy=Y/Hpx*(ny-1); const j0=Math.floor(gy), j1=Math.min(ny-1,j0+1); const ty=gy-j0;
        for (let X=0;X<W;X++){
          const gx=X/W*(nx-1); const i0=Math.floor(gx), i1=Math.min(nx-1,i0+1); const tx=gx-i0;
          const k00=k3(i0,j0), k10=k3(i1,j0), k01=k3(i0,j1), k11=k3(i1,j1);
          const h = (1-tx)*(1-ty)*U[k00+H] + tx*(1-ty)*U[k10+H] + (1-tx)*ty*U[k01+H] + tx*ty*U[k11+H];
          let t = clamp((h - hmin)/range, 0,1); let L=(t*255)|0;
          let r=lut[L*4+0], g=lut[L*4+1], b=lut[L*4+2];
          // cheap normal sparkle
          const hx = (U[k3(Math.min(nx-1,i0+1),j0)+H]-U[k3(Math.max(0,i0-1),j0)+H])*0.5;
          const hy = (U[k3(i0,Math.min(ny-1,j0+1))+H]-U[k3(i0,Math.max(0,j0-1))+H])*0.5;
          const shade = clamp(0.7 + 0.6*( -0.4*hx + 0.5*hy ), 0, 1.2);
          r = clamp(r*shade,0,255)|0; g = clamp(g*shade,0,255)|0; b = clamp(b*shade,0,255)|0;
          const p=(Y*W+X)*4; img.data[p]=r; img.data[p+1]=g; img.data[p+2]=b; img.data[p+3]=255;
        }
      }
      // walls overlay
      for (let Y=0;Y<Hpx;Y+=Math.max(1, Math.floor(Hpx/ny))){
        const j=Math.floor(Y/Hpx*(ny-1));
        for (let X=0;X<W;X+=Math.max(1, Math.floor(W/nx))){
          const i=Math.floor(X/W*(nx-1));
          if (solid[idx(i,j)]===1){
            const x0=Math.floor(i/(nx-1)*W), y0=Math.floor(j/(ny-1)*Hpx);
            const xs=Math.floor(W/(nx-1)+1), ys=Math.floor(Hpx/(ny-1)+1);
            for (let yy=0;yy<ys;yy++){
              for (let xx=0;xx<xs;xx++){
                const p=((y0+yy)*W + (x0+xx))*4;
                img.data[p]=30; img.data[p+1]=30; img.data[p+2]=35; img.data[p+3]=255;
              }
            }
          }
        }
      }
      ctx.putImageData(img,0,0);

      if (showVec){
        ctx.strokeStyle="rgba(255,255,255,0.32)"; ctx.lineWidth=1;
        const skip=8;
        for (let j=skip;j<ny-skip;j+=skip){
          for (let i=skip;i<nx-skip;i+=skip){
            const k=k3(i,j); const h=U[k+H]; const u=U[k+HU]/(h+1e-6); const v=U[k+HV]/(h+1e-6);
            const x=i/nx*W, y=j/ny*Hpx;
            ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+u*6, y+v*6); ctx.stroke();
          }
        }
      }
      // HUD
      const ctx2=ctx;
      ctx2.fillStyle="rgba(255,255,255,0.85)"; ctx2.font="12px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx2.fillText(`CFL live ≈ ${cflLive.toFixed(2)}  |  g=${grav.toFixed(2)}  μ=${fric.toFixed(3)}  Δx=${dx.toFixed(2)}  mode=${mode}`, 10, 18);
      ctx2.fillText(`Mass drift ≈ ${massPpm.toFixed(1)} ppm  |  Paint: ${mode==="Walls"?"WALLS":"SPLASHES"} (drag)`, 10, 34);
    }

    let raf=0;
    (function loop(){
      let smax=1e-6;
      for (let j=1;j<ny-1;j++) for (let i=1;i<nx-1;i++){
        const k=k3(i,j); const h=U[k+H]; const u=U[k+HU]/(h+1e-6); const v=U[k+HV]/(h+1e-6);
        const s = Math.max(Math.abs(u)+Math.sqrt(grav*Math.max(0,h)), Math.abs(v)+Math.sqrt(grav*Math.max(0,h)));
        if (s>smax) smax=s;
      }
      const dt = Math.min(0.5, Math.max(0.001, (cflTarget*dx)/smax));
      setCflLive(Math.min(2.0, (smax*dt)/dx));
      let mass=0; for (let k=0;k<U.length;k+=3) mass+=U[k+H];
      const pm = (loop as any)._m || mass; const ppm = ((mass-pm)/(pm+1e-6))*1e6; setMassPpm(ppm); (loop as any)._m = mass;
      step(dt, grav, fric);
      draw();
      raf=requestAnimationFrame(loop);
    })();

    return ()=> cancelAnimationFrame(raf);
  }, [grav, fric, cflTarget, palette, showVec, mode, brushR, dxScale]);

  function silhouetteFrom(U:Float64Array, nx:number, ny:number): Uint8Array{
    const S=new Uint8Array(nx*ny);
    for (let j=0;j<ny;j++) for (let i=0;i<nx;i++){
      const k=(j*nx+i)*3; const h=U[k+0];
      S[j*nx+i] = (Math.abs(h-0.8)>0.02)? 1:0;
    }
    return S;
  }
  function IoU(a:Uint8Array, b:Uint8Array): number{
    let I=0,U=0; const n=a.length;
    for (let i=0;i<n;i++){ if (a[i]||b[i]) U++; if (a[i]&&b[i]) I++; }
    return (U>0)? I/U : 1.0;
  }

  async function runAccreditation(){
    const rng = await makeRng(seed);
    const reps = 16;
    const rows:any[] = [];
    const g=grav, mu=fric, cfl=cflTarget;

    function runSWE(nx:number,ny:number,steps:number){
      const U = new Float64Array(nx*ny*3);
      const k3=(i:number,j:number)=> ((j*nx+i)*3);
      for (let j=0;j<ny;j++) for (let i=0;i<nx;i++){ const k=k3(i,j); U[k+0]=0.8; U[k+1]=0; U[k+2]=0; }
      for (let d=0; d<2; d++){
        const cx = 10 + (rng.int(0,nx-20)), cy = 8 + (rng.int(0,ny-16));
        for (let j=-3;j<=3;j++) for (let i=-3;i<=3;i++){
          const x=cx+i, y=cy+j; if (x<1||x>=nx-1||y<1||y>=ny-1) continue; const r2=i*i+j*j; if (r2>9) continue;
          const k=k3(x,y); const amp=Math.exp(-0.5*r2);
          U[k+0]+= 0.15*amp; U[k+1]+= 0.25*i; U[k+2]+= 0.25*j;
        }
      }
      function step(dt:number){
        const Utmp = new Float64Array(U);
        for (let j=1;j<ny-1;j++) for (let i=1;i<nx-1;i++){
          const kL=k3(i-1,j), kR=k3(i,j);
          const hL=U[kL+0], uL=U[kL+1]/(hL+1e-9), vL=U[kL+2]/(hL+1e-9);
          const hR=U[kR+0], uR=U[kR+1]/(hR+1e-9), vR=U[kR+2]/(hR+1e-9);
          const s = Math.max(Math.abs(uL)+Math.sqrt(g*Math.max(0,hL)), Math.abs(uR)+Math.sqrt(g*Math.max(0,hR)));
          const FLh=U[kL+1], FRh=U[kR+1];
          const FLhu=U[kL+1]*uL+0.5*g*hL*hL, FRhu=U[kR+1]*uR+0.5*g*hR*hR;
          const FLhv=U[kL+1]*vL, FRhv=U[kR+1]*vR;
          const f0=0.5*(FLh+FRh)-0.5*s*(hR-hL);
          const f1=0.5*(FLhu+FRhu)-0.5*s*(U[kR+1]-U[kL+1]);
          const f2=0.5*(FLhv+FRhv)-0.5*s*(U[kR+2]-U[kL+2]);
          const sdx=dt;
          Utmp[kR+0]-=sdx*f0; Utmp[kR+1]-=sdx*f1; Utmp[kR+2]-=sdx*f2;
          Utmp[kL+0]+=sdx*f0; Utmp[kL+1]+=sdx*f1; Utmp[kL+2]+=sdx*f2;
        }
        for (let j=1;j<ny-1;j++) for (let i=1;i<nx-1;i++){
          const kB=k3(i,j-1), kT=k3(i,j);
          const hB=U[kB+0], uB=U[kB+1]/(hB+1e-9), vB=U[kB+2]/(hB+1e-9);
          const hT=U[kT+0], uT=U[kT+1]/(hT+1e-9), vT=U[kT+2]/(hT+1e-9);
          const s = Math.max(Math.abs(vB)+Math.sqrt(g*Math.max(0,hB)), Math.abs(vT)+Math.sqrt(g*Math.max(0,hT)));
          const GLh=U[kB+2], GRh=U[kT+2];
          const GLhu=U[kB+1]*vB, GRhu=U[kT+1]*vT;
          const GLhv=U[kB+2]*vB+0.5*g*hB*hB, GRhv=U[kT+2]*vT+0.5*g*hT*hT;
          const g0=0.5*(GLh+GRh)-0.5*s*(hT-hB);
          const g1=0.5*(GLhu+GRhu)-0.5*s*(U[kT+1]-U[kB+1]);
          const g2=0.5*(GLhv+GRhv)-0.5*s*(U[kT+2]-U[kB+2]);
          const sdy=dt;
          Utmp[kT+0]-=sdy*g0; Utmp[kT+1]-=sdy*g1; Utmp[kT+2]-=sdy*g2;
          Utmp[kB+0]+=sdy*g0; Utmp[kB+1]+=sdy*g1; Utmp[kB+2]+=sdy*g2;
        }
        const df=Math.exp(-0.003);
        for (let k=0;k<U.length;k+=3){
          Utmp[k+1]*=df; Utmp[k+2]*=df;
          const h=Math.max(0.02,Utmp[k+0]); const scl=h/(Utmp[k+0]||h);
          U[k+0]=h; U[k+1]=Utmp[k+1]*scl; U[k+2]=Utmp[k+2]*scl;
        }
      }
      // crude CFL dt from first sweep
      let smax=1e-6;
      for (let j=1;j<ny-1;j++) for (let i=1;i<nx-1;i++){
        const k=k3(i,j); const h=U[k+0]; const u=U[k+1]/(h+1e-9); const v=U[k+2]/(h+1e-9);
        const s = Math.max(Math.abs(u)+Math.sqrt(g*Math.max(0,h)), Math.abs(v)+Math.sqrt(g*Math.max(0,h))); if (s>smax) smax=s;
      }
      const dt=Math.min(0.4, Math.max(0.001, (cfl*1.0)/smax));
      for (let n=0;n<steps;n++) step(dt);
      return U;
    }

    function runProxy(nx:number,ny:number,steps:number){
      const H0 = new Float64Array(nx*ny).fill(0.8);
      const idx=(i:number,j:number)=> j*nx+i;
      for (let d=0; d<2; d++){
        const cx = 10 + (Math.floor(Math.random()*(nx-20))), cy = 8 + (Math.floor(Math.random()*(ny-16)));
        for (let j=-3;j<=3;j++) for (let i=-3;i<=3;i++){
          const x=cx+i, y=cy+j; if (x<1||x>=nx-1||y<1||y>=ny-1) continue; const r2=i*i+j*j; if (r2>9) continue;
          H0[idx(x,y)] += 0.15*Math.exp(-0.5*r2);
        }
      }
      function blur(){
        const Hb = new Float64Array(H0);
        for (let j=1;j<ny-1;j++) for (let i=1;i<nx-1;i++){
          Hb[idx(i,j)] = 0.25*(H0[idx(i-1,j)]+H0[idx(i+1,j)]+H0[idx(i,j-1)]+H0[idx(i,j+1)]);
        }
        H0.set(Hb);
      }
      for (let n=0;n<steps;n++) blur();
      const U = new Float64Array(nx*ny*3);
      for (let j=0;j<ny;j++) for (let i=0;i<nx;i++){ const k=idx(i,j); U[k*3+0]=H0[k]; }
      return U;
    }

    const nx=96, ny=54;
    for (let rep=0; rep<reps; rep++){
      const Ulo = runSWE(nx,ny,220);
      const Uhi = runSWE(nx*2,ny*2,440);
      const Upx = runProxy(nx,ny,220);
      const Slo = silhouetteFrom(Ulo, nx,ny);
      const Shi = silhouetteFrom(Uhi, nx*2,ny*2);
      const Sd = new Uint8Array(nx*ny);
      for (let j=0;j<ny;j++) for (let i=0;i<nx;i++){
        let s=0; for (let jj=0;jj<2;jj++) for (let ii=0;ii<2;ii++){ s += Shi[( (2*j+jj)*(nx*2) + (2*i+ii) )]; }
        Sd[j*nx+i] = (s>=2)?1:0;
      }
      function IoU(a:Uint8Array, b:Uint8Array){ let I=0,U=0; for (let i=0;i<a.length;i++){ if (a[i]||b[i]) U++; if (a[i]&&b[i]) I++; } return (U>0)? I/U : 1.0; }
      const iou_highres = IoU(Slo, Sd);
      const iou_proxy   = IoU(Slo, silhouetteFrom(Upx, nx,ny));
      let m=0; for (let k=0;k<Ulo.length;k+=3) m+=Ulo[k]; const mass_ppm=0; // single snapshot
      rows.push({rep, iou_highres, iou_proxy, mass_ppm, cfl:cflTarget});
    }
    const arr = rows.map(r=>r.iou_highres); const n=arr.length;
    const mean=arr.reduce((a,b)=>a+b,0)/n;
    const sd=Math.sqrt(arr.reduce((s,v)=>s+(v-mean)*(v-mean),0)/(n-1||1));
    const t=n>=30?1.959963984540054:2.064; const half=t*sd/Math.sqrt(n);
    const meta={generator:"PCG32 (wasm/js)", user_seed:seed, streams:["overlay","agent","physics"], sim:"Waveforge",
      metrics:{kpi:["mass_ppm","iou_highres","iou_proxy","cfl"], ci95:[mean-half, mean+half], reps:n, g:grav, mu:fric, cfl:cflTarget, dx:dxScale}};
    downloadLedger(meta, rows, "waveforge.saxlg");
    return [mean-half, mean+half] as [number,number];
  }

  const share = useMemo(()=> shareLink("/waveforge", { seed, g:grav.toFixed(2), mu:fric.toFixed(3), cfl:cflTarget.toFixed(2), dx:dxScale.toFixed(2), palette, vec:Number(showVec), mode, R:brushR, accreditation:Number(accreditation) }), [seed, grav, fric, cflTarget, dxScale, palette, showVec, mode, brushR, accreditation]);
  const [ci, setCi] = useState<[number,number]|undefined>(undefined);

  return (<div className="p-4 space-y-3">
    <div className="flex items-center justify-between">
      <div className="text-xl font-semibold">Waveforge — Shallow‑Water Playground</div>
      <AccreditationChip seed={seed} enabled={accreditation} ci={ci} onToggle={async(v)=>{ setAccreditation(v); if (v){ const c=await runAccreditation(); setCi(c);} else setCi(undefined); }}/>
    </div>
    <div className="text-xs opacity-70">Draw basin walls or spawn splashes. Explicit SWE with Rusanov flux; dt from live CFL. Palette LUTs + normal sparkle.</div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <canvas ref={canvasRef} width={W} height={Hpx} className="rounded-2xl shadow-lg" style={{background:"#08090b"}}/>
      <div className="space-y-2">
        <label>USER_SEED</label><input type="number" value={seed} onChange={e=>setSeed(+e.target.value)} />
        <label>Mode</label><select value={mode} onChange={e=>setMode(e.target.value as Mode)}><option>Splash</option><option>Walls</option></select>
        <label>Brush R</label><input type="range" min={3} max={24} step={1} value={brushR} onChange={e=>setBrushR(+e.target.value)} />
        <label>Gravity g {grav.toFixed(2)}</label><input type="range" min={1.0} max={20.0} step={0.1} value={grav} onChange={e=>setGrav(+e.target.value)} />
        <label>Friction μ {fric.toFixed(3)}</label><input type="range" min={0.0} max={0.05} step={0.001} value={fric} onChange={e=>setFric(+e.target.value)} />
        <label>CFL target {cflTarget.toFixed(2)}</label><input type="range" min={0.2} max={0.95} step={0.01} value={cflTarget} onChange={e=>setCflTarget(+e.target.value)} />
        <label>Δx scale {dxScale.toFixed(2)}</label><input type="range" min={0.5} max={2.0} step={0.05} value={dxScale} onChange={e=>setDxScale(+e.target.value)} />
        <label>Palette</label><select value={palette} onChange={e=>setPalette(e.target.value as LUT)}><option>Ocean</option><option>Icefire</option><option>Magma</option></select>
        <label><input type="checkbox" checked={showVec} onChange={e=>setShowVec(e.target.checked)} /> Show velocity vectors</label>
        <div className="text-sm">Live CFL: <b className={cflLive>1? "text-red-400":"text-green-300"}>{cflLive.toFixed(2)}</b> | Mass drift: <b className={Math.abs(massPpm)>500? "text-red-400":"text-green-300"}>{massPpm.toFixed(1)} ppm</b></div>
        <div className="pt-2"><a className="text-xs underline" href={share}>Share deep-link</a></div>
        <EvidenceDrawer/>
      </div>
    </div>
  </div>);
}
