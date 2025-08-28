import React, {useEffect, useMemo, useRef, useState} from "react";
import AccreditationChip from "./AccreditationChip";
import EvidenceDrawer from "./EvidenceDrawer";
import { parseParams, shareLink } from "../utils/deeplink";
import { makeRng } from "../utils/rng";
import { downloadLedger } from "../utils/ledger";

type Integrator = "EulerCromer" | "RK4";
type DragModel = "Quadratic" | "Linear";
type Shot = { x:number[], y:number[], t:number[], v:number[], workLoss:number, range:number, apexY:number, flightTime:number };

function clamp(x:number,lo:number,hi:number){ return Math.max(lo, Math.min(hi, x)); }
function rad(d:number){ return d*Math.PI/180; }
function lerp(a:number,b:number,t:number){ return a + (b-a)*t; }
function hsl(h:number,s:number,l:number){ return `hsl(${h} ${s}% ${l}%)`; }

export default function DragRangefinder(){
  const W=1120, H=630;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [seed,setSeed] = useState(20250827);
  const [integrator,setIntegrator] = useState<Integrator>("RK4");
  const [dragModel,setDragModel] = useState<DragModel>("Quadratic");
  const [v0,setV0] = useState(45);
  const [angle,setAngle] = useState(40);
  const [dt,setDt] = useState(0.02);
  const [rho,setRho] = useState(1.2);
  const [Cd,setCd] = useState(0.47);
  const [radius,setRadius] = useState(0.0366);
  const [mass,setMass] = useState(0.145);
  const [wind,setWind] = useState(5);
  const [windDir,setWindDir] = useState(180);
  const [fireKey, setFireKey] = useState(0);
  const [accreditation,setAccreditation] = useState(true);
  const [ci, setCi] = useState<[number,number]|undefined>(undefined);

  useEffect(()=>{
    const p=parseParams();
    if (p.seed) setSeed(Number(p.seed));
    if (p.intg) setIntegrator(String(p.intg) as Integrator);
    if (p.model) setDragModel(String(p.model) as DragModel);
    if (p.v0) setV0(Number(p.v0));
    if (p.angle) setAngle(Number(p.angle));
    if (p.dt) setDt(Number(p.dt));
    if (p.rho) setRho(Number(p.rho));
    if (p.Cd) setCd(Number(p.Cd));
    if (p.R) setRadius(Number(p.R));
    if (p.m) setMass(Number(p.m));
    if (p.wind) setWind(Number(p.wind));
    if (p.wdir) setWindDir(Number(p.wdir));
    if (p.accreditation!==undefined) setAccreditation(Boolean(Number(p.accreditation)));
  }, []);

  function integrateOnce(intg:Integrator, dt:number): Shot {
    const g = 9.81;
    const A = Math.PI*radius*radius;
    const k_lin = 6*Math.PI*1.8*radius;
    const k_quad = 0.5*rho*Cd*A;
    const theta = rad(angle);
    const wvx = wind*Math.cos(rad(windDir));
    const wvy = wind*Math.sin(rad(windDir));

    let x=0, y=1.0;
    let vx=v0*Math.cos(theta), vy=v0*Math.sin(theta);
    const xs:number[]=[x], ys:number[]=[y], ts:number[]=[0], vs:number[]=[Math.hypot(vx,vy)];
    let t=0, work=0, apexY=y;

    function accel(vx:number, vy:number){
      const vrelx=vx - wvx, vrely=vy - wvy;
      const vrel = Math.hypot(vrelx, vrely)+1e-12;
      let ax=0, ay=0;
      if (dragModel==="Quadratic"){
        const fx = -k_quad * vrel * vrelx;
        const fy = -k_quad * vrel * vrely;
        ax = fx/mass;
        ay = fy/mass - g;
        work += (fx*vx + fy*vy) * dt;
      } else {
        const fx = -k_lin * vrelx;
        const fy = -k_lin * vrely;
        ax = fx/mass;
        ay = fy/mass - g;
        work += (fx*vx + fy*vy) * dt;
      }
      return [ax, ay] as [number,number];
    }

    function stepEC(){
      const [ax, ay] = accel(vx,vy);
      vx += ax*dt; vy += ay*dt;
      x  += vx*dt; y  += vy*dt;
    }
    function stepRK4(){
      const f = (X:[number,number,number,number])=>{
        const [x,y,vx,vy]=X; const [ax,ay]=accel(vx,vy);
        return [vx, vy, ax, ay] as [number,number,number,number];
      };
      const s0:[number,number,number,number]=[x,y,vx,vy];
      const k1=f(s0);
      const s1:[number,number,number,number]=[x+0.5*dt*k1[0], y+0.5*dt*k1[1], vx+0.5*dt*k1[2], vy+0.5*dt*k1[3]];
      const k2=f(s1);
      const s2:[number,number,number,number]=[x+0.5*dt*k2[0], y+0.5*dt*k2[1], vx+0.5*dt*k2[2], vy+0.5*dt*k2[3]];
      const k3=f(s2);
      const s3:[number,number,number,number]=[x+dt*k3[0], y+dt*k3[1], vx+dt*k3[2], vy+dt*k3[3]];
      const k4=f(s3);
      x  += (dt/6)*(k1[0]+2*k2[0]+2*k3[0]+k4[0]);
      y  += (dt/6)*(k1[1]+2*k2[1]+2*k3[1]+k4[1]);
      vx += (dt/6)*(k1[2]+2*k2[2]+2*k3[2]+k4[2]);
      vy += (dt/6)*(k1[3]+2*k2[3]+2*k3[3]+k4[3]);
    }

    const maxSteps=20000;
    for (let n=0;n<maxSteps;n++){
      ts.push(t+=dt); xs.push(x); ys.push(y); vs.push(Math.hypot(vx,vy));
      if (intg==="EulerCromer") stepEC(); else stepRK4();
      if (y>apexY) apexY=y;
      if (y<=0){
        const y1=ys[ys.length-2], y2=y;
        const x1=xs[xs.length-2], x2=x;
        const t1=ts[ts.length-2], t2=t;
        const a = (0 - y1)/((y2-y1)||1e-9);
        const xr = x1 + a*(x2-x1);
        const tr = t1 + a*(t2-t1);
        xs[xs.length-1]=xr; ys[ys.length-1]=0; ts[ts.length-1]=tr;
        break;
      }
    }
    const range = xs[xs.length-1];
    const flightTime = ts[ts.length-1];
    return { x:xs, y:ys, t:ts, v:vs, workLoss: -work, range, apexY, flightTime };
  }

  function shootPair(intg:Integrator, dt:number){
    const shotA = integrateOnce(intg, dt);
    const shotB = integrateOnce(intg, dt*0.5);
    return { shotA, shotB };
  }

  useEffect(()=>{
    const canvas=canvasRef.current!; const ctx=canvas.getContext("2d")!;
    const {shotA, shotB} = shootPair(integrator, dt);
    const xmin=0, xmax=Math.max(70, Math.max(...shotB.x));
    const ymin=0, ymax=Math.max(20, Math.max(...shotB.y)*1.15);
    function X(x:number){ return (x - xmin)/(xmax-xmin+1e-6)*W*0.92 + W*0.04; }
    function Y(y:number){ return H*0.90 - (y - ymin)/(ymax-ymin+1e-6)*H*0.80; }

    let s=0;
    const total = shotB.x.length;
    function bg(){
      const g=ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0,hsl(210,90,12));
      g.addColorStop(0.4,hsl(250,80,18));
      g.addColorStop(1,hsl(245,65,8));
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      ctx.fillStyle=hsl(210,20,12); ctx.fillRect(0,H*0.90,W,H*0.10);
      // wind ribbons
      const ny=6;
      for (let j=0;j<ny;j++){
        const y = 40 + j*36;
        ctx.strokeStyle=`rgba(180,220,255,0.12)`; ctx.lineWidth=2;
        ctx.beginPath(); for (let x=0;x<W;x+=20){
          const yy = y + 6*Math.sin( (x*0.02) + s*0.06 + j*0.8 );
          if (x===0) ctx.moveTo(x,yy); else ctx.lineTo(x,yy);
        } ctx.stroke();
        ctx.fillStyle=`rgba(180,220,255,0.10)`;
        for (let k=0;k<10;k++){
          const x = ( (s*4 + k*120 + j*30) % W );
          const yy = y + 6*Math.sin( (x*0.02) + j*0.8 );
          ctx.fillRect(x,yy,18,2);
        }
      }
      ctx.fillStyle="rgba(255,255,255,0.85)"; ctx.font="12px ui-monospace, Menlo, monospace";
      ctx.fillText(`Wind ${wind.toFixed(1)} m/s @ ${windDir.toFixed(0)}°`, 12, 20);
    }

    function drawTrail(shot:Shot, alpha:number, th:number, neonHue:number){
      ctx.save();
      ctx.globalAlpha=alpha;
      ctx.lineWidth=th;
      ctx.beginPath();
      const vmax = Math.max(...shot.v);
      for (let i=0;i<shot.x.length;i++){
        const sp = shot.v[i];
        const h = (neonHue + 60*sp/Math.max(1,vmax))%360;
        ctx.strokeStyle=hsl(h, 95, 65);
        const x=X(shot.x[i]), y=Y(shot.y[i]);
        if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
      ctx.restore();
    }

    function drawMarkers(sA:Shot, sB:Shot){
      let iMax=0; for (let i=1;i<sB.y.length;i++){ if (sB.y[i]>sB.y[iMax]) iMax=i; }
      const xa=X(sB.x[iMax]), ya=Y(sB.y[iMax]);
      ctx.fillStyle="rgba(255,239,120,0.9)"; ctx.beginPath(); ctx.arc(xa,ya,5,0,Math.PI*2); ctx.fill();
      const xr=X(sB.x[sB.x.length-1]), yr=Y(0);
      const R = 8 + 6*Math.sin(s*0.2);
      ctx.strokeStyle="rgba(255,220,200,0.6)"; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(xr,yr,R,0,Math.PI*2); ctx.stroke();
      const xrA=X(sA.x[sA.x.length-1]);
      ctx.fillStyle="rgba(255,120,120,0.7)"; ctx.fillRect(xrA-2, yr-6, 4, 12);
    }

    function hud(){
      const da = Math.abs(shotA.apexY - shotB.apexY);
      const dr = Math.abs(shotA.range - shotB.range);
      const Wd = shotB.workLoss;
      ctx.fillStyle="rgba(255,255,255,0.9)";
      ctx.font="13px ui-monospace, Menlo, monospace";
      ctx.fillText(`Integrator: ${integrator}  |  Drag: ${dragModel}  |  dt = ${dt.toFixed(3)} vs dt/2`, 12, 44);
      ctx.fillText(`Range: ${shotB.range.toFixed(2)} m  (Δ vs dt: ${dr.toFixed(2)} m)`, 12, 62);
      ctx.fillText(`Apex: ${shotB.apexY.toFixed(2)} m  (Δ vs dt: ${da.toFixed(2)} m)`, 12, 80);
      ctx.fillText(`Flight time: ${shotB.flightTime.toFixed(2)} s  |  Work lost to drag: ${Wd.toFixed(1)} J`, 12, 98);
    }

    let s=0;
    function frame(){
      ctx.clearRect(0,0,W,H);
      bg();
      drawTrail(shotA, 0.5, 4, 320);
      const seg = Math.floor(lerp(2, shotB.x.length, Math.min(1, s/300)));
      drawTrail({ ...shotB, x: shotB.x.slice(0,seg), y: shotB.y.slice(0,seg), t: shotB.t.slice(0,seg), v: shotB.v.slice(0,seg), workLoss: shotB.workLoss, range: shotB.range, apexY: shotB.apexY, flightTime: shotB.flightTime }, 0.95, 5, 200);
      drawMarkers(shotA, shotB);
      hud();
      s++;
      requestAnimationFrame(frame);
    }
    frame();
    return ()=>{};
  }, [fireKey, integrator, dragModel, v0, angle, dt, rho, Cd, radius, mass, wind, windDir]);

  async function runAccreditation(){
    const rng = await makeRng(seed);
    const rows:any[] = [];
    const tests = 16;
    for (let i=0;i<tests;i++){
      const v = 25 + rng.int(0,30);
      const th = 20 + rng.int(0,50);
      const w = -5 + rng.int(0,11);
      // reference
      const sRef = integrateOnce("RK4", Math.max(0.002, dt*0.25));
      const sA = integrateOnce("RK4", dt);
      const sB = integrateOnce("EulerCromer", dt);
      const errR_A = Math.abs(sA.range - sRef.range);
      const errR_B = Math.abs(sB.range - sRef.range);
      const errH_A = Math.abs(sA.apexY - sRef.apexY);
      const errH_B = Math.abs(sB.apexY - sRef.apexY);
      const dW = Math.abs(sA.workLoss - sRef.workLoss);
      rows.push({rep:i, dt, integratorA:"RK4", integratorB:"EulerCromer", err_range_rk4:errR_A, err_range_ec:errR_B, err_apex_rk4:errH_A, err_apex_ec:errH_B, dW_vs_ref:dW,
        rho, Cd, radius, mass, wind, angle, v0 });
    }
    const arr = rows.map(r=> (r.err_range_ec+1e-9)/(r.err_range_rk4+1e-9) );
    const n=arr.length;
    const mean=arr.reduce((a,b)=>a+b,0)/n;
    const sd=Math.sqrt(arr.reduce((s,v)=>s+(v-mean)*(v-mean),0)/(n-1||1));
    const t = n>=30?1.959963984540054:2.131; const half=t*sd/Math.sqrt(n);
    const meta={generator:"PCG32 (wasm/js)", user_seed:seed, streams:["overlay","physics","solver"], sim:"DragRangefinder",
      metrics:{kpi:["Δrange_dt_vs_dt2","Δapex_dt_vs_dt2","work_loss_drag","err_ratio_EC_over_RK4"], ci95:[mean-half, mean+half], reps:n,
      params:{rho, Cd, radius, mass, dt, wind}}};
    downloadLedger(meta, rows, "drag_rangefinder.saxlg");
    return [mean-half, mean+half] as [number,number];
  }

  const share = useMemo(()=> shareLink("/drag-rangefinder", {
    seed, intg:integrator, model:dragModel, v0:v0.toFixed(2), angle:angle.toFixed(1), dt:dt.toFixed(3), rho:rho.toFixed(2), Cd:Cd.toFixed(2), R:radius.toFixed(4), m:mass.toFixed(3), wind:wind.toFixed(2), wdir:windDir.toFixed(0), accreditation:Number(accreditation)
  }), [seed, integrator, dragModel, v0, angle, dt, rho, Cd, radius, mass, wind, windDir, accreditation]);

  return (<div className="p-4 space-y-3">
    <div className="flex items-center justify-between">
      <div className="text-xl font-semibold">Drag Rangefinder — Projectile with Air</div>
      <AccreditationChip seed={seed} enabled={accreditation} ci={ci} onToggle={async(v)=>{ setAccreditation(v); if (v){ const c=await runAccreditation(); setCi(c);} else setCi(undefined); }}/>
    </div>
    <div className="text-xs opacity-70">Quadratic / linear drag with wind. Toggle <b>Euler–Cromer</b> vs <b>RK4</b>. Overlay <b>dt</b> and <b>dt/2</b> to see convergence. HUD shows drag work.</div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <canvas ref={canvasRef} width={W} height={H} className="rounded-2xl shadow-lg" style={{background:"#05070a"}}/>
      <div className="space-y-2">
        <label>USER_SEED</label><input type="number" value={seed} onChange={e=>setSeed(+e.target.value)} />
        <label>Integrator</label><select value={integrator} onChange={e=>setIntegrator(e.target.value as Integrator)}><option>RK4</option><option>EulerCromer</option></select>
        <label>Drag model</label><select value={dragModel} onChange={e=>setDragModel(e.target.value as DragModel)}><option>Quadratic</option><option>Linear</option></select>
        <label>Speed v0 {v0.toFixed(1)} m/s</label><input type="range" min={5} max={80} step={0.5} value={v0} onChange={e=>setV0(+e.target.value)} />
        <label>Angle {angle.toFixed(0)}°</label><input type="range" min={5} max={85} step={1} value={angle} onChange={e=>setAngle(+e.target.value)} />
        <label>dt {dt.toFixed(3)} s</label><input type="range" min={0.002} max={0.05} step={0.002} value={dt} onChange={e=>setDt(+e.target.value)} />
        <label>ρ air {rho.toFixed(2)} kg/m³</label><input type="range" min={0.5} max={1.5} step={0.01} value={rho} onChange={e=>setRho(+e.target.value)} />
        <label>Cd {Cd.toFixed(2)}</label><input type="range" min={0.10} max={1.20} step={0.01} value={Cd} onChange={e=>setCd(+e.target.value)} />
        <label>Radius {radius.toFixed(4)} m</label><input type="range" min={0.02} max={0.06} step={0.0005} value={radius} onChange={e=>setRadius(+e.target.value)} />
        <label>Mass {mass.toFixed(3)} kg</label><input type="range" min={0.03} max={0.2} step={0.001} value={mass} onChange={e=>setMass(+e.target.value)} />
        <label>Wind speed {wind.toFixed(1)} m/s</label><input type="range" min={-15} max={15} step={0.5} value={wind} onChange={e=>setWind(+e.target.value)} />
        <label>Wind dir {windDir.toFixed(0)}°</label><input type="range" min={0} max={360} step={1} value={windDir} onChange={e=>setWindDir(+e.target.value)} />
        <button className="px-3 py-2 rounded-lg bg-emerald-500/90 text-black font-semibold shadow" onClick={()=> setFireKey(fireKey+1)}>Fire</button>
        <div className="text-sm pt-1">
          <div>Deep‑link: <a className="underline" href={share}>/drag-rangefinder…</a></div>
        </div>
        <EvidenceDrawer/>
      </div>
    </div>
  </div>);
}
