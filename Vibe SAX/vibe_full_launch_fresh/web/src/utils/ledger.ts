export function downloadLedger(meta:any, rows:any[], filename:string){
  const first = JSON.stringify({$meta:meta}); const lines=[first, ...rows.map(r=>JSON.stringify(r))];
  const blob = new Blob([lines.join("\n")], {type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
  a.download = filename.endsWith(".saxlg")? filename : (filename+".saxlg"); a.click(); URL.revokeObjectURL(a.href);
}