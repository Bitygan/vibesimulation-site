
/* VP_P4_PixelFX_Safe.js
 * Pixel ops with clamped regions, pooled buffers, and safe put/grab.
 * Includes: box blur (separable), gaussian3 (approx), sobel edges, unsharp mask, bloom.
 */
(function(G=window){
  if (G.VP_P4_PixelFX_Safe) return;

  const Pool = (()=>{
    const store = new Map(); // key: w*h -> Uint8ClampedArray
    return {
      get(size){ const arr = store.get(size); if (arr && arr.length===size) return arr; const a = new Uint8ClampedArray(size); store.set(size,a); return a; },
      temp(size){ return new Uint8ClampedArray(size); }
    };
  })();

  function grab(ctx, x, y, w, h){
    x|=0; y|=0; w=Math.max(1,w|=0); h=Math.max(1,h|=0);
    const img = ctx.getImageData(x,y,w,h);
    return {img, data:img.data, w, h, x, y};
  }
  function put(ctx, region){ ctx.putImageData(region.img, region.x, region.y); }

  function _sepBlur(src, dst, w, h, r){
    const a = 1/(2*r+1);
    for (let y=0;y<h;y++){
      let rsum=0, gsum=0, bsum=0, asum=0;
      const yoff=y*w*4;
      for (let x=-r; x<=r; x++){
        const xi = Math.min(w-1, Math.max(0,x));
        const i = yoff + (xi*4);
        rsum+=src[i]; gsum+=src[i+1]; bsum+=src[i+2]; asum+=src[i+3];
      }
      for (let x=0;x<w;x++){
        const i = yoff + x*4;
        dst[i  ] = (rsum*a)|0; dst[i+1] = (gsum*a)|0; dst[i+2] = (bsum*a)|0; dst[i+3] = (asum*a)|0;
        const x1 = Math.max(0, x-r); const x2 = Math.min(w-1, x+r+1);
        const i1 = yoff + x1*4, i2=yoff + x2*4;
        rsum += src[i2]-src[i1]; gsum += src[i2+1]-src[i1+1]; bsum += src[i2+2]-src[i1+2]; asum += src[i2+3]-src[i1+3];
      }
    }
    const tmp = Pool.temp(w*h*4); tmp.set(dst);
    for (let x=0;x<w;x++){
      let rsum=0, gsum=0, bsum=0, asum=0;
      for (let y=-r;y<=r;y++){
        const yi = Math.min(h-1, Math.max(0,y));
        const i = (yi*w + x)*4;
        rsum+=tmp[i]; gsum+=tmp[i+1]; bsum+=tmp[i+2]; asum+=tmp[i+3];
      }
      for (let y=0;y<h;y++){
        const i = (y*w + x)*4;
        dst[i  ] = (rsum*a)|0; dst[i+1] = (gsum*a)|0; dst[i+2] = (bsum*a)|0; dst[i+3] = (asum*a)|0;
        const y1 = Math.max(0, y-r); const y2 = Math.min(h-1, y+r+1);
        const i1 = (y1*w + x)*4, i2=(y2*w + x)*4;
        rsum += tmp[i2]-tmp[i1]; gsum += tmp[i2+1]-tmp[i1+1]; bsum += tmp[i2+2]-tmp[i1+2]; asum += tmp[i2+3]-tmp[i1+3];
      }
    }
  }

  function blurBox(region, radius=2){
    radius = Math.max(1, radius|0);
    const {data,w,h} = region;
    const dst = Pool.get(w*h*4);
    _sepBlur(data, dst, w, h, radius);
    region.img.data.set(dst);
    return region;
  }

  function gaussian3(region, sigma=1.2){
    const r = Math.max(1, Math.round(1.5*sigma));
    return blurBox(region, r);
  }

  function sobel(region){
    const {data,w,h} = region;
    const out = Pool.get(w*h*4);
    for (let y=0;y<h;y++){
      for (let x=0;x<w;x++){
        const idx=(y*w+x)*4;
        function pix(dx,dy){
          const xx=Math.min(w-1, Math.max(0,x+dx));
          const yy=Math.min(h-1, Math.max(0,y+dy));
          const ii=(yy*w+xx)*4;
          return 0.2126*data[ii] + 0.7152*data[ii+1] + 0.0722*data[ii+2];
        }
        const gx = -pix(-1,-1)-2*pix(-1,0)-pix(-1,1) + pix(1,-1)+2*pix(1,0)+pix(1,1);
        const gy = -pix(-1,-1)-2*pix(0,-1)-pix(1,-1) + pix(-1,1)+2*pix(0,1)+pix(1,1);
        const m = Math.min(255, Math.hypot(gx,gy));
        out[idx]=out[idx+1]=out[idx+2]=m; out[idx+3]=255;
      }
    }
    region.img.data.set(out);
    return region;
  }

  function unsharp(region, amount=0.6, radius=2){
    const {data,w,h} = region;
    const blur = {img:new ImageData(w,h), data:Pool.get(w*h*4), w,h, x:region.x, y:region.y};
    blur.img.data.set(data);
    blurBox(blur, radius);
    const dst = Pool.get(w*h*4);
    for (let i=0;i<w*h*4;i+=4){
      dst[i  ] = Math.max(0, Math.min(255, data[i]  + amount*(data[i]  - blur.img.data[i])));
      dst[i+1] = Math.max(0, Math.min(255, data[i+1]+ amount*(data[i+1]- blur.img.data[i+1])));
      dst[i+2] = Math.max(0, Math.min(255, data[i+2]+ amount*(data[i+2]- blur.img.data[i+2])));
      dst[i+3] = data[i+3];
    }
    region.img.data.set(dst);
    return region;
  }

  function bloom(region, threshold=180, intensity=0.8){
    const {data,w,h} = region;
    const bright = {img:new ImageData(w,h), data:Pool.get(w*h*4), w,h, x:region.x, y:region.y};
    for (let i=0;i<w*h*4;i+=4){
      const l = 0.2126*data[i] + 0.7152*data[i+1] + 0.0722*data[i+2];
      if (l>threshold){
        bright.img.data[i]=data[i]; bright.img.data[i+1]=data[i+1]; bright.img.data[i+2]=data[i+2]; bright.img.data[i+3]=255;
      } else {
        bright.img.data[i]=bright.img.data[i+1]=bright.img.data[i+2]=0; bright.img.data[i+3]=0;
      }
    }
    gaussian3(bright, 2);
    const dst = Pool.get(w*h*4);
    for (let i=0;i<w*h*4;i+=4){
      dst[i  ] = Math.min(255, data[i]  + intensity*bright.img.data[i]);
      dst[i+1] = Math.min(255, data[i+1]+ intensity*bright.img.data[i+1]);
      dst[i+2] = Math.min(255, data[i+2]+ intensity*bright.img.data[i+2]);
      dst[i+3] = data[i+3];
    }
    region.img.data.set(dst);
    return region;
  }

  G.VP_P4_PixelFX_Safe = { grab, put, blurBox, gaussian3, sobel, unsharp, bloom };
})(); 
