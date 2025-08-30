
/* VP_P1_DrawLoop_Safe.js
 * One-RAF draw loop with dt smoothing, error containment, and optional SAX logging.
 * Works with p5.js instance mode or raw Canvas 2D.
 */
(function(G=window){
  if (G.VP_P1_DrawLoop_Safe) return;
  const now = () => performance.now();
  function ema(prev, x, a){ return (prev==null)? x : (a*x + (1-a)*prev); }

  class DrawLoop {
    constructor(tick, opts={}){
      this.tick = (typeof tick === "function") ? tick : ()=>{};
      this.fps = opts.fps || 60;
      this.onError = opts.onError || ((e)=>console.error("[P1] draw error:", e));
      this.sax = opts.sax || (G.SAX && typeof G.SAX.log === "function" ? G.SAX : null);
      this.autoPauseOnHide = opts.autoPauseOnHide !== false;
      this._running = false;
      this._raf = 0;
      this._t0 = now();
      this._tLast = this._t0;
      this._dtAvg = 1000/this.fps;
      this._frame = 0;
      if (this.autoPauseOnHide){
        document.addEventListener("visibilitychange", ()=>{
          if (document.hidden) this.stop();
          else this.start();
        });
      }
    }
    start(){
      if (this._running) return;
      this._running = true;
      this._tLast = now();
      const loop = ()=>{
        if (!this._running) return;
        const t = now();
        let dt = (t - this._tLast) / 1000;
        if (!Number.isFinite(dt) || dt>1) dt = Math.min(1/15, 1/this.fps); // clamp huge stalls
        this._dtAvg = ema(this._dtAvg, dt, 0.2);
        this._tLast = t;
        try{
          this.tick({time:t/1000, dt, dtAvg:this._dtAvg, frame:this._frame++});
        }catch(e){
          this.onError(e);
          if (this.sax) try{ this.sax.log({type:"draw_error", msg:String(e&&e.message||e) }); }catch{}
        }
        this._raf = requestAnimationFrame(loop);
      };
      this._raf = requestAnimationFrame(loop);
    }
    stop(){ if (!this._running) return; this._running=false; if (this._raf) cancelAnimationFrame(this._raf); this._raf=0; }
    once(){ const t=now(); const dt=Math.max(1/240, Math.min(0.2, (t-this._tLast)/1000)); this._tLast=t; try{ this.tick({time:t/1000, dt, dtAvg:this._dtAvg, frame:this._frame}); }catch(e){ this.onError(e); } }
    isRunning(){ return this._running; }
  }

  G.VP_P1_DrawLoop_Safe = { DrawLoop };
})(); 
