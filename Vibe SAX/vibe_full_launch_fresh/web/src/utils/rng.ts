// rng.ts — WASM-first PCG32 with JS fallback. Deterministic, fast.
export type RNG = { nextU32: () => number; uniform: () => number; int: (min: number, max: number) => number; };
function jsFallback(seed: number){ let state=BigInt(seed)|1n; let inc=(BigInt(seed)<<1n)|1n; const MULT=6364136223846793005n;
  function nextU32(){ const old=state; state=(old*MULT+inc)&((1n<<64n)-1n); let x=Number(((old>>18n)^old)>>27n)>>>0; const r=Number(old>>59n)&31; return (x>>>r)|((x<<((32-r)&31))>>>0); }
  return { nextU32, uniform: ()=> nextU32()/4294967296, int:(min:number,max:number)=> min + (nextU32()%((max-min+1)>>>0)) }; }
export async function makeRng(seed:number){
  try{ const resp=await fetch("/wasm/pcg32.wasm"); if(!resp.ok) throw new Error("no wasm");
    const {instance}=await WebAssembly.instantiateStreaming(resp,{});
    const seedFn=instance.exports.seed as (slo:bigint,shi:bigint,ilo:bigint,ihi:bigint)=>void;
    const nextFn=instance.exports.next_u32 as ()=>number; const s=BigInt(seed)|1n; seedFn(s,0n,(s<<1n)|1n,0n);
    const nextU32=()=> (nextFn()>>>0); return { nextU32, uniform: ()=> nextU32()/4294967296, int:(min:number,max:number)=> min + (nextU32()%((max-min+1)>>>0)) };
  }catch(e){ console.warn("WASM RNG not available, using JS fallback.", e); return jsFallback(seed); }
}