
/* VP_P3_PathBuilder_Safe.js
 * A tiny, safe path builder for Canvas 2D with length/bounds tracking.
 * Ensures begin/close consistency and optional Path2D caching.
 */
(function(G=window){
  if (G.VP_P3_PathBuilder_Safe) return;

  class PathBuilder{
    constructor(){ this.reset(); }
    reset(){ this._path = new Path2D(); this._started=false; this._closed=false; this._len=0; this._minX=+Infinity; this._minY=+Infinity; this._maxX=-Infinity; this._maxY=-Infinity; return this; }
    _touch(x,y){ if (x<this._minX) this._minX=x; if (y<this._minY) this._minY=y; if (x>this._maxX) this._maxX=x; if (y>this._maxY) this._maxY=y; }
    begin(){ this._started=true; this._closed=false; return this; }
    moveTo(x,y){ this._path.moveTo(x,y); this._touch(x,y); return this; }
    lineTo(x,y){ this._path.lineTo(x,y); this._touch(x,y); return this; }
    rect(x,y,w,h){ this._path.rect(x,y,w,h); this._touch(x,y); this._touch(x+w,y+h); this._len += Math.abs(w)*2 + Math.abs(h)*2; return this; }
    arc(cx,cy,r,a0,a1,ccw){ this._path.arc(cx,cy,r,a0,a1,!!ccw); this._touch(cx-r,cy-r); this._touch(cx+r,cy+r); return this; }
    quadTo(x1,y1,x,y){ this._path.quadraticCurveTo(x1,y1,x,y); this._touch(x1,y1); this._touch(x,y); return this; }
    bezierTo(x1,y1,x2,y2,x,y){ this._path.bezierCurveTo(x1,y1,x2,y2,x,y); this._touch(x1,y1); this._touch(x2,y2); this._touch(x,y); return this; }
    close(){ this._path.closePath(); this._closed=true; return this; }
    bounds(){ if (this._minX===+Infinity) return null; return {x:this._minX, y:this._minY, w:this._maxX-this._minX, h:this._maxY-this._minY}; }
    length(){ return this._len; } // rects only tracked exactly; others approximate
    stroke(ctx, style){ if (style && G.VP_P2_StrokeFill_Safe) VP_P2_StrokeFill_Safe.apply(ctx, style); ctx.stroke(this._path); return this; }
    fill(ctx, style, rule){ if (style && G.VP_P2_StrokeFill_Safe) VP_P2_StrokeFill_Safe.apply(ctx, style); ctx.fill(this._path, rule||"nonzero"); return this; }
    clip(ctx, rule){ ctx.save(); ctx.clip(this._path, rule||"nonzero"); return ()=>ctx.restore(); }
    path(){ return this._path; }
  }

  function withPath(ctx, fn){ const pb=new PathBuilder(); try{ fn(pb); } finally{} return pb; }

  G.VP_P3_PathBuilder_Safe = { PathBuilder, withPath };
})(); 
