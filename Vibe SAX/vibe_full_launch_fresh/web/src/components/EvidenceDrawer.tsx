import React, { useMemo, useState } from "react";
type LedgerMeta = { generator:string; user_seed:number; streams:string[]; sim:string; integrator?:string; metrics?:any };
type Row = Record<string, any>;
function parseSaxlg(text: string){ const lines = text.trim().split(/\r?\n/); if (!lines.length) return { meta:null, rows:[] };
  const header = JSON.parse(lines[0]); const meta = (header.$meta || header) as LedgerMeta; const rows: Row[] = [];
  for (let i=1;i<lines.length;i++){ if (!lines[i].trim()) continue; rows.push(JSON.parse(lines[i])); } return { meta, rows }; }
function ci95(values:number[]){ const n=values.length; const mean=values.reduce((a,b)=>a+b,0)/n;
  const sd=Math.sqrt(values.reduce((a,b)=>a+(b-mean)*(b-mean),0)/(n-1||1)); const tcrit=n>=30?1.959963984540054:2.064; const half=tcrit*sd/Math.sqrt(n);
  return {mean, lo: mean-half, hi: mean+half, sd, n}; }
export default function EvidenceDrawer(){
  const [open, setOpen] = useState(false); const [meta, setMeta] = useState<LedgerMeta|null>(null); const [rows, setRows] = useState<Row[]>([]); const [kpiKey, setKpiKey] = useState<string>("");
  function onFile(e: React.ChangeEvent<HTMLInputElement>){ const f=e.target.files?.[0]; if(!f) return; const reader=new FileReader();
    reader.onload=()=>{ const { meta, rows } = parseSaxlg(String(reader.result||"")); setMeta(meta); setRows(rows); }; reader.readAsText(f); }
  const keys = useMemo(()=>{ if(!rows.length) return []; const sample=rows[0]; return Object.keys(sample).filter(k=> typeof (sample as any)[k]==="number"); }, [rows]);
  const stats = useMemo(()=>{ if(!rows.length||!kpiKey) return null; const vals=rows.map(r=>Number(r[kpiKey])).filter(v=>Number.isFinite(v)); if(!vals.length) return null; return ci95(vals); }, [rows,kpiKey]);
  return (<div className="rounded-2xl shadow p-3 bg-black/10">
    <div className="flex items-center justify-between"><div className="font-semibold">Evidence</div>
      <button className="px-3 py-1 rounded bg-gray-100" onClick={()=>setOpen(!open)}>{open?"Hide":"Show"}</button></div>
    {open && (<div className="pt-3 space-y-3">
      <div className="flex items-center gap-2"><input type="file" accept=".saxlg,application/json,text/plain" onChange={onFile}/>
        <span className="text-xs opacity-70">Load a .saxlg to parse</span></div>
      {meta && <pre className="text-xs bg-black/20 p-2 rounded">{JSON.stringify(meta, null, 2)}</pre>}
      {rows.length>0 && (<>
        <div className="grid grid-cols-2 gap-2"><label className="text-sm">KPI field</label>
          <select value={kpiKey} onChange={e=>setKpiKey(e.target.value)} className="p-1 rounded">
            <option value="">—select—</option>{keys.map(k=>(<option key={k} value={k}>{k}</option>))}</select></div>
        {stats && <div className="text-sm">n={stats.n} mean={stats.mean.toFixed(3)} sd={stats.sd.toFixed(3)} CI95=[{stats.lo.toFixed(3)}, {stats.hi.toFixed(3)}]</div>}
        <div className="rounded bg-black/20 p-2 max-h-48 overflow-auto text-xs">{rows.slice(0,100).map((r,i)=>(<div key={i}>{JSON.stringify(r)}</div>))}</div>
      </>)}
    </div>)}
  </div>);
}