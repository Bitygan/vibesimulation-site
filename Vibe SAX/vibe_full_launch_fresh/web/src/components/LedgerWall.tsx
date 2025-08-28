import React, { useEffect, useMemo, useState } from "react";
type Entry = { id: string; when: string; sim: "PaintedSky"|"GlassLabyrinth"; user_seed: number; kpi: string; mean: number; ci95: [number, number]; palette?: string; };
export default function LedgerWall(){
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    setLoading(true);
    fetch("/data/ledger_index.json")
      .then(r=>r.json())
      .then(data => {
        setEntries(data);
        setLoading(false);
      })
      .catch((e)=>{
        console.warn("Failed to load ledger data:", e);
        setEntries([]);
        setLoading(false);
      });
  }, []);
  const groups = useMemo(()=>{ const g: Record<string, Entry[]> = {}; for (const e of entries){ (g[e.sim] ||= []).push(e); }
    Object.values(g).forEach(arr=>arr.sort((a,b)=>b.when.localeCompare(a.when))); return g; }, [entries]);
  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <div className="text-xl font-semibold">Community Mural</div>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading community results...</div>
        </div>
      </div>
    );
  }

  return (<div className="p-4 space-y-3">
    <div className="text-xl font-semibold">Community Mural</div>
    {Object.keys(groups).length === 0 ? (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">No community results yet</div>
        <div className="text-xs opacity-70">Be the first to run accreditations and share your results!</div>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(groups).map(([sim, arr])=>(
          <div key={sim}>
            <div className="text-sm opacity-70 mb-2">{sim}</div>
            <div className="grid grid-cols-4 gap-2">
              {arr.slice(0,20).map(e=>(
                <div key={e.id} className="rounded-xl p-3 bg-black/20 shadow flex flex-col gap-1 hover:bg-black/30 transition-colors">
                  <div className="text-xs opacity-70">{new Date(e.when).toLocaleString()}</div>
                  <div className="text-sm font-mono">{e.kpi}: {e.mean.toFixed(2)}</div>
                  <div className="text-xs font-mono">CI95 [{e.ci95[0].toFixed(2)}, {e.ci95[1].toFixed(2)}]</div>
                  <div className="text-xs">seed {e.user_seed}</div>
                  {e.palette && <div className="text-xs opacity-70">palette {e.palette}</div>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>);
}