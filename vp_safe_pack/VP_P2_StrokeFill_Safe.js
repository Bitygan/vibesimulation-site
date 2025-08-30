
/* VP_P2_StrokeFill_Safe.js
 * Style guard for Canvas 2D / p5.js: balanced state with try/finally restore.
 * Also provides palette helpers and style diffs for debugging.
 */
(function(G=window){
  if (G.VP_P2_StrokeFill_Safe) return;

  function isP5(t){ return !!t && typeof t.push === 'function' && typeof t.pop === 'function'; }
  function isCtx(t){ return !!t && typeof t.save === 'function' && typeof t.restore === 'function'; }

  function withStyle(target, style, fn){
    if (isP5(target)){
      target.push();
      try{
        apply(target, style);
        return fn(target);
      } finally {
        target.pop();
      }
    } else if (isCtx(target)){
      const c = target; c.save();
      try{
        apply(c, style);
        return fn(c);
      } finally {
        c.restore();
      }
    } else {
      throw new Error("withStyle: unknown target");
    }
  }

  function apply(t, style={}){
    if (!style) return t;
    const s = style;
    if (isCtx(t)){
      if (s.fill != null){ t.fillStyle = s.fill; }
      if (s.stroke != null){ t.strokeStyle = s.stroke; }
      if (s.lineWidth != null){ t.lineWidth = s.lineWidth; }
      if (s.lineJoin != null){ t.lineJoin = s.lineJoin; }
      if (s.lineCap != null){ t.lineCap = s.lineCap; }
      if (s.miterLimit != null){ t.miterLimit = s.miterLimit; }
      if (s.globalAlpha != null){ t.globalAlpha = s.globalAlpha; }
      if (s.globalCompositeOperation != null){ t.globalCompositeOperation = s.globalCompositeOperation; }
      if (s.shadowColor != null){ t.shadowColor = s.shadowColor; }
      if (s.shadowBlur != null){ t.shadowBlur = s.shadowBlur; }
      if (s.shadowOffsetX != null){ t.shadowOffsetX = s.shadowOffsetX; }
      if (s.shadowOffsetY != null){ t.shadowOffsetY = s.shadowOffsetY; }
      if (s.setLineDash && t.setLineDash) t.setLineDash(s.setLineDash);
    } else if (isP5(t)){
      if (s.fill != null && t.fill) t.fill(s.fill);
      if (s.stroke != null && t.stroke) t.stroke(s.stroke);
      if (s.noFill && t.noFill) t.noFill();
      if (s.noStroke && t.noStroke) t.noStroke();
      if (s.strokeWeight && t.strokeWeight) t.strokeWeight(s.strokeWeight);
    }
    return t;
  }

  const Palette = {
    slate:   ["#0b1119","#1f2937","#334155","#64748b","#e2e8f0"],
    ocean:   ["#0b132b","#1c2541","#3a506b","#5bc0be","#eaeaea"],
    heat:    ["#18051E","#4F0D2D","#A0153E","#FF4D6D","#FFE3E3"],
    viridis: ["#440154","#3b528b","#21908d","#5dc863","#fde725"],
  };

  G.VP_P2_StrokeFill_Safe = { withStyle, apply, Palette };
})(); 
