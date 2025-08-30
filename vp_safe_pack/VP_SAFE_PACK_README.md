
# VP Safe Pack — P1, P2, P3, P4, P7

Drop‑in safety primitives for vibesimulation modules. All modules are **engine‑agnostic** (p5.js or Canvas 2D) and designed to play nicely with your SAX Reasoning Reels (optional logs on faults).

## Files
- `VP_P1_DrawLoop_Safe.js` — one‑RAF loop with dt smoothing, error containment, visibility pause.
- `VP_P2_StrokeFill_Safe.js` — safe style guard; `withStyle(ctx, style, fn)`; palettes.
- `VP_P3_PathBuilder_Safe.js` — safe Path2D builder with bounds/length and clip helper.
- `VP_P4_PixelFX_Safe.js` — pixel ops: blur, gaussian3, sobel, unsharp, bloom; pooled buffers.
- `VP_P7_SpringMotion_Safe.js` — stable spring (closed‑form) 1D/ND with halflife or (ω, ζ).

## Quick wire‑in
```html
<script src="VP_P1_DrawLoop_Safe.js"></script>
<script src="VP_P2_StrokeFill_Safe.js"></script>
<script src="VP_P3_PathBuilder_Safe.js"></script>
<script src="VP_P4_PixelFX_Safe.js"></script>
<script src="VP_P7_SpringMotion_Safe.js"></script>
```

### P1 — Draw Loop
```js
const loop = new VP_P1_DrawLoop_Safe.DrawLoop(({dt, frame}) => {
  // draw...
});
loop.start();
```

### P2 — Stroke/Fill
```js
VP_P2_StrokeFill_Safe.withStyle(ctx, {stroke:"#9cf", lineWidth:3, fill:"#024"}, (c) => {
  c.beginPath(); c.arc(200,150,40,0,Math.PI*2); c.fill(); c.stroke();
});
```

### P3 — Path Builder
```js
const pb = new VP_P3_PathBuilder_Safe.PathBuilder();
pb.begin().moveTo(100,100).lineTo(180,120).arc(180,120,30,0,Math.PI).close();
pb.stroke(ctx, {stroke:"#eee", lineWidth:2});
```

### P4 — Pixel FX
```js
const r = VP_P4_PixelFX_Safe.grab(ctx, 0,0, canvas.width, canvas.height);
VP_P4_PixelFX_Safe.bloom(r, 180, 0.7);
VP_P4_PixelFX_Safe.put(ctx, r);
```

### P7 — Spring Motion
```js
let state = {x:0, v:0};
function tick({dt}){
  state = VP_P7_SpringMotion_Safe.step1D(state, 1, {halflife:0.25, dt});
}
```

## Notes
- All modules are **pure JS**, no external deps. They work in your existing build and follow your minimal‑CPU ethos.
- If you’re using SAX reels, you can log errors/leaks by passing your recorder to P1 as `sax`.
