// scripts/build_ledger_index.mjs
// Usage: node scripts/build_ledger_index.mjs ./ledgers ./web/public/data/ledger_index.json
import { readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";
const [,, inDir, outFile] = process.argv;
if (!inDir || !outFile){ console.error("Usage: node scripts/build_ledger_index.mjs <inDir> <outFile>"); process.exit(1); }
function parseLedger(path){
  const lines = readFileSync(path, "utf8").trim().split(/\r?\n/);
  const meta = JSON.parse(lines[0]).$meta;
  let kpi=""; let mean=0; let ci95=[0,0];
  if (meta.sim==="PaintedSky"){ kpi="spacing_px"; mean=meta.metrics?.spacing_mean||0; ci95=meta.metrics?.ci95||[0,0]; }
  else if (meta.sim==="GlassLabyrinth"){ kpi="solve_time"; mean=meta.metrics?.solve_time_mean||0; ci95=meta.metrics?.ci95||[0,0]; }
  return { id: path.split("/").pop().replace(".saxlg",""), when: new Date().toISOString(), sim: meta.sim, user_seed: meta.user_seed, kpi, mean, ci95, palette: meta.metrics?.palette };
}
const files = readdirSync(inDir).filter(f=>f.endsWith(".saxlg"));
const rows = files.map(f=>parseLedger(join(inDir,f)));
writeFileSync(outFile, JSON.stringify(rows, null, 2));
console.log(`Wrote ${rows.length} entries to ${outFile}`);
