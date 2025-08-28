/*
 * recorder_circuit_patch.js
 * -------------------------
 * Optional helper if you're already using recorder.js.
 * Safely ensures a "Verify Reel" button appears in the Circuit Lab card.
 */
(function(){
  function wait(cb, tries=40){
    const t = setInterval(()=>{
      try{ if (cb()) clearInterval(t); }catch{}
      if (--tries<=0) clearInterval(t);
    }, 100);
  }
  wait(function attach(){
    if (!document.getElementById("circuit-lab")) return false;
    if (!window.circuitLabSim) return false;
    const controls = document.querySelector("#circuit-lab .physics-controls");
    if (!controls) return true;
    const hasVerify = Array.from(controls.querySelectorAll("button")).some(b=>/Verify Reel/.test(b.textContent||""));
    if (!hasVerify){
      const row = document.createElement("div"); row.className="control-group";
      const btn = document.createElement("button"); btn.textContent="Verify Reel"; btn.addEventListener("click", ()=>window.open("verify.html","_blank"));
      row.appendChild(btn); controls.appendChild(row);
    }
    return true;
  });
})();

