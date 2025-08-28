import React from "react";
export default function AccreditationChip(props:{ seed:number, enabled:boolean, ci?:[number,number], onToggle:(v:boolean)=>void }){
  const {seed, enabled, ci, onToggle} = props;
  return (<div className="flex items-center gap-2 text-xs bg-black/30 rounded-full px-3 py-1 shadow border border-white/10">
    <span className="opacity-70">SEED</span><span className="font-mono">{seed}</span>
    {ci && <><span className="opacity-70">CI95</span><span className="font-mono">[{ci[0].toFixed(2)},{ci[1].toFixed(2)}]</span></>}
    <label className="flex items-center gap-1 ml-2"><input type="checkbox" checked={enabled} onChange={e=>onToggle(e.target.checked)} /><span>Accreditation</span></label>
  </div>);
}