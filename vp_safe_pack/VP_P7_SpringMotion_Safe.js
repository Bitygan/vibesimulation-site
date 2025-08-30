
/* VP_P7_SpringMotion_Safe.js
 * Time-correct, stable spring motion (critically damped by default) for 1D/2D/3D.
 * Uses closed-form update, robust under large dt and variable frame rates.
 */
(function(G=window){
  if (G.VP_P7_SpringMotion_Safe) return;

  function omegaFromHalflife(hl){ return Math.LN2 / Math.max(1e-6, hl); }

  function step1D(state, target, params){
    const x = state.x, v=state.v||0;
    const zeta = (params.zeta==null)? 1 : params.zeta;
    const w0 = (params.omega!=null)? params.omega : omegaFromHalflife(params.halflife || 0.1);
    const dt = Math.max(1/600, Math.min(0.25, params.dt || 1/60));
    let xn, vn;
    if (zeta === 1){
      const e = Math.exp(-w0*dt);
      const y = x - target;
      xn = target + (y*(1 + w0*dt) + v*dt) * e;
      vn = (v*(1 - w0*dt) - y*(w0*w0*dt)) * e;
    } else if (zeta > 1){
      const za = Math.sqrt(zeta*zeta - 1);
      const r1 = -w0*(zeta - za), r2 = -w0*(zeta + za);
      const C1 = (v - r2*(x-target))/(r1 - r2);
      const C2 = (r1*(x-target) - v)/(r1 - r2);
      const e1 = Math.exp(r1*dt), e2 = Math.exp(r2*dt);
      xn = target + C1*e1 + C2*e2;
      vn = C1*r1*e1 + C2*r2*e2;
    } else {
      const za = Math.sqrt(1 - zeta*zeta);
      const wd = w0*za;
      const e = Math.exp(-w0*zeta*dt);
      const y = x - target;
      const A = y, B = (v + w0*zeta*y)/wd;
      const cos = Math.cos(wd*dt), sin = Math.sin(wd*dt);
      xn = target + e*(A*cos + B*sin);
      vn = e*(-A*w0*zeta*cos - A*wd*sin - B*w0*zeta*sin + B*wd*cos);
    }
    return {x:xn, v:vn};
  }

  function stepND(state, target, params){
    const res = {x:[], v:[]};
    const n = Math.min(state.x.length, target.length);
    for (let i=0;i<n;i++){
      const r = step1D({x:state.x[i], v:(state.v&&state.v[i])||0}, target[i], params);
      res.x[i]=r.x; res.v[i]=r.v;
    }
    return res;
  }

  G.VP_P7_SpringMotion_Safe = { step1D, stepND, omegaFromHalflife };
})();
