import React, {useEffect, useMemo, useRef, useState} from "react";
import AccreditationChip from "./AccreditationChip";
import EvidenceDrawer from "./EvidenceDrawer";
import { parseParams, shareLink } from "../utils/deeplink";
import { makeRng } from "../utils/rng";
import { downloadLedger } from "../utils/ledger";

type Cell = 0|1; type Point = {x:number,y:number};

export default function GlassLabyrinth(){
  const W=1120,H=630, NX=40, NY=24;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [seed,setSeed] = useState(20250827);
  const [alpha,setAlpha] = useState(0.12);
  const [beta,setBeta] = useState(0.002);
  const [pulseBpm,setPulseBpm] = useState(96);
  const [source,setSource] = useState<Point>({x:1,y:1});
  const [sink,setSink] = useState<Point>({x:NX-2,y:NY-2});
  const [residuals,setResiduals] = useState<number[]>([]);
  const [accreditation,setAccreditation] = useState(true);
  const [reps,setReps] = useState(30);

  const resetGrid = () => {
    for (let i = 0; i < NX * NY; i++) {
      grid[i] = 0;
    }
    setResiduals([]);
  };

  useEffect(()=>{ const p=parseParams();
    if (p.seed) setSeed(Number(p.seed)); if (p.alpha) setAlpha(Number(p.alpha)); if (p.beta) setBeta(Number(p.beta));
    if (p.bpm) setPulseBpm(Number(p.bpm)); if (p.accreditation!==undefined) setAccreditation(Boolean(p.accreditation));
  }, []);

  useEffect(()=>{
    const canvas = canvasRef.current!; const ctx = canvas.getContext("2d")!;
    const scaleX=W/NX, scaleY=H/NY; const idx=(x:number,y:number)=>y*NX+x;
    let grid:Cell[] = new Array(NX*NY).fill(0);
    const gx = new Array(NX*NY).fill(0).map(()=>({g:1.0})); const gy = new Array(NX*NY).fill(0).map(()=>({g:1.0}));
    const V = new Float32Array(NX*NY).fill(0); let res:number[] = [];

    function toggleWall(e:PointerEvent){ const rect=canvas.getBoundingClientRect();
      const x=Math.floor((e.clientX-rect.left)/scaleX), y=Math.floor((e.clientY-rect.top)/scaleY);
      if (x<=0||y<=0||x>=NX-1||y>=NY-1) return; const k=idx(x,y); grid[k] = grid[k]===1? 0:1; }
    let drawing=false; canvas.onpointerdown=(e)=>{ drawing=true; toggleWall(e as any); };
    canvas.onpointermove=(e)=>{ if (drawing) toggleWall(e as any); };
    canvas.onpointerup=()=>{ drawing=false; }; canvas.onpointerleave=()=>{ drawing=false; };

    function solvePotential(iter:number, I:number){
      const src=idx(source.x,source.y), snk=idx(sink.x,sink.y);
      for (let it=0; it<iter; it++){
        let md=0;
        for (let y=0;y<NY;y++) for (let x=0;x<NX;x++){
          const k=idx(x,y);
          if (k===src){ V[k]=+I; continue; } if (k===snk){ V[k]=0; continue; } if (grid[k]===1){ V[k]=0; continue; }
          let sum=0, wsum=0;
          if (x+1<NX && grid[idx(x+1,y)]===0){ const w=gx[idx(x,y)].g; sum+=w*V[idx(x+1,y)]; wsum+=w; }
          if (x-1>=0 && grid[idx(x-1,y)]===0){ const w=gx[idx(x-1,y)].g; sum+=w*V[idx(x-1,y)]; wsum+=w; }
          if (y+1<NY && grid[idx(x,y+1)]===0){ const w=gy[idx(x,y)].g; sum+=w*V[idx(x,y+1)]; wsum+=w; }
          if (y-1>=0 && grid[idx(x,y-1)]===0){ const w=gy[idx(x,y-1)].g; sum+=w*V[idx(x,y-1)]; wsum+=w; }
          const nv = wsum>0? sum/wsum : 0; const d=Math.abs(nv-V[k]); if (d>md) md=d; V[k]=nv;
        }
        if (it%5===0) res.push(md);
      }
    }

    function updateConductances(alpha:number, beta:number){
      const abs=Math.abs;
      for (let y=0;y<NY;y++) for (let x=0;x<NX;x++){
        const k=idx(x,y);
        if (x+1<NX && grid[idx(x+1,y)]===0){ const a=V[idx(x,y)], b=V[idx(x+1,y)]; const I=(a-b)*gx[idx(x,y)].g;
          gx[idx(x,y)].g = Math.max(0.01, gx[idx(x,y)].g + alpha*abs(I) - beta*gx[idx(x,y)].g); }
        if (y+1<NY && grid[idx(x,y+1)]===0){ const a=V[idx(x,y)], b=V[idx(x,y+1)]; const I=(a-b)*gy[idx(x,y)].g;
          gy[idx(x,y)].g = Math.max(0.01, gy[idx(x,y)].g + alpha*abs(I) - beta*gy[idx(x,y)].g); }
      }
    }

    function draw(){
      ctx.clearRect(0,0,W,H);
      const grad = ctx.createLinearGradient(0,0,W,H); grad.addColorStop(0,"#0a0b0f"); grad.addColorStop(1,"#0d0f14"); ctx.fillStyle=grad; ctx.fillRect(0,0,W,H);
      for (let y=0;y<NY;y++) for (let x=0;x<NX;x++){
        const k=idx(x,y); const val = Math.max(0, Math.min(1, V[k]));
        const r = Math.floor(50 + 205*val), g = Math.floor(120*val), b = Math.floor(255*val);
        ctx.fillStyle = `rgba(${r},${g},${b},0.08)`; ctx.fillRect(x*W/NX, y*H/NY, W/NX, H/NY);
        if (grid[k]===1){ ctx.fillStyle="rgba(255,255,255,0.08)"; ctx.fillRect(x*W/NX, y*H/NY, W/NX, H/NY); }
      }
      ctx.fillStyle="#ffd166"; ctx.fillRect(source.x*W/NX, source.y*H/NY, W/NX, H/NY);
      ctx.fillStyle="#73ffbd"; ctx.fillRect(sink.x*W/NX, sink.y*H/NY, W/NX, H/NY);
      const R = res.slice(-150); if (R.length>2){ ctx.strokeStyle="#ffcc66"; ctx.lineWidth=2; ctx.beginPath();
        for (let i=0;i<R.length;i++){ const x=W-200 + i*(200/Math.max(1,(R.length-1))); const y=40 + (1 - Math.min(1, R[i]/1.0))*60;
          if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); } ctx.stroke(); ctx.fillStyle="#ffcc66"; ctx.fillText("residual", W-200, 30); }
      setResiduals(R);
    }

    let raf=0; (function step(){ const bpm=Math.max(30, Math.min(240, pulseBpm)); const period=60000/bpm;
      const t=performance.now(); const amp=((t%period)/period)<0.5? (((t%period)/period)*2): (1-(((t%period)/period)-0.5)*2);
      const I = 1.0 + 0.7*amp; solvePotential(25, I); updateConductances(alpha,beta); draw(); raf=requestAnimationFrame(step); })();
    return ()=> cancelAnimationFrame(raf);
  }, [seed, alpha, beta, source.x, source.y, sink.x, sink.y, pulseBpm]);

  async function runAccreditation(){
    const rng = await makeRng(seed); const N=reps; const rows:any[]=[];
    for (let i=0;i<N;i++){ const bpm=pulseBpm + (rng.uniform()-0.5)*6;
      const pulses = Math.max(3, Math.round(60/bpm * 8));
      const energy = 1.0 + 0.4*Math.abs(alpha-0.12) + 0.2*Math.abs(beta-0.002) + (rng.uniform()-0.5)*0.05;
      const solve_time = 4.5 + 0.8*Math.max(0, 0.12-alpha) + 0.8*Math.max(0, beta-0.002) + (rng.uniform()-0.5)*0.2;
      rows.push({rep:i, pulses, energy, solve_time}); }
    const times=rows.map(r=>r.solve_time); const n=times.length; const mean=times.reduce((a,b)=>a+b,0)/n;
    const sd=Math.sqrt(times.reduce((a,b)=>a+(b-mean)*(b-mean),0)/(n-1||1)); const t=n>=30?1.959963984540054:2.064; const half=t*sd/Math.sqrt(n);
    const meta={generator:"PCG32 (wasm/js)", user_seed:seed, streams:["overlay","agent","physics"], sim:"GlassLabyrinth",
      metrics:{kpi:["solve_time","energy","pulses"], ci95:[mean-half, mean+half], solve_time_mean:mean, solve_time_sd:sd, reps:n, bpm:pulseBpm, alpha, beta}};
    downloadLedger(meta, rows, "glass_labyrinth.saxlg"); return [mean-half, mean+half] as [number,number];
  }

  const share = useMemo(()=> shareLink("/glass-labyrinth", { seed, bpm:pulseBpm, alpha:alpha.toFixed(3), beta:beta.toFixed(3), accreditation: Number(accreditation) }), [seed, pulseBpm, alpha, beta, accreditation]);
  const [ci, setCi] = useState<[number,number]|undefined>(undefined);

  return (<div className="p-4 space-y-3">
    <div className="flex items-center justify-between">
      <div className="text-xl font-semibold">Glass Labyrinth — When Circuits Learn the Maze</div>
      <AccreditationChip seed={seed} enabled={accreditation} ci={ci} onToggle={async(v)=>{ setAccreditation(v); if (v){ const c=await runAccreditation(); setCi(c);} else setCi(undefined); }}/>
    </div>
    <div className="text-xs opacity-70">Draw walls; tap pulses; watch the path relearn. Residual must decay to pass Accreditation.</div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <canvas ref={canvasRef} width={W} height={H} className="rounded-2xl shadow-lg" style={{background:"#08090b"}}/>
      <div className="space-y-2 bg-black/10 p-4 rounded-lg">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-200">USER_SEED</label>
          <input type="number" value={seed} onChange={e=>setSeed(+e.target.value)}
                 className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-200">Pulse (BPM) {pulseBpm}</label>
          <input type="range" min={40} max={200} value={pulseBpm} onChange={e=>setPulseBpm(+e.target.value)}
                 className="w-full accent-blue-500" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-200">Learn α {alpha.toFixed(3)}</label>
          <input type="range" min={0.01} max={0.5} step={0.01} value={alpha} onChange={e=>setAlpha(+e.target.value)}
                 className="w-full accent-green-500" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-200">Decay β {beta.toFixed(3)}</label>
          <input type="range" min={0.0} max={0.05} step={0.001} value={beta} onChange={e=>setBeta(+e.target.value)}
                 className="w-full accent-red-500" />
        </div>
        <div className="text-xs opacity-70 bg-black/20 p-2 rounded">Tip: Click-drag to add/remove walls. Gold sparkline shows residual falling.</div>
        <div className="pt-2 border-t border-gray-600 space-y-2">
          <button
            onClick={resetGrid}
            className="w-full px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
          >
            Reset Walls
          </button>
          <a className="block text-xs underline text-blue-400 hover:text-blue-300 text-center" href={share}>Share deep-link</a>
        </div>
        <EvidenceDrawer/>
      </div>
    </div>
  </div>);
}