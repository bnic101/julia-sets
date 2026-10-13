'use strict';
/* Nested-interval construction of the Cantor Julia set of z^2 + c for real c < -2. */
function cantorStages(c, depth){
  const beta = (1 + Math.sqrt(1 - 4*c)) / 2;           // repelling fixed point, J ⊂ [-β, β]
  let stages = [[[-beta, beta]]];
  for(let n=0;n<depth;n++){
    const next=[];
    for(const [p,q] of stages[n]){
      // preimage of [p,q] under z^2 + c: z^2 ∈ [p-c, q-c], both positive since c < -β
      const lo=Math.sqrt(p-c), hi=Math.sqrt(q-c);
      next.push([-hi,-lo]); next.push([lo,hi]);
    }
    next.sort((a,b)=>a[0]-b[0]);
    stages.push(next);
  }
  return {beta, stages};
}
function renderCantorPanel(el, c){
  const depth=8; const {beta, stages}=cantorStages(c, depth);
  const W=600, rowH=16, pad=8, H=pad*2 + (depth+1)*rowH;
  const L=pad+26; const x=v=>L + (v+beta)/(2*beta)*(W-L-pad);
  let svg=`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Nested intervals converging to the Cantor Julia set">`;
  stages.forEach((iv,n)=>{
    const y=pad+n*rowH;
    svg+=`<text x="${pad}" y="${y+10}" font-size="9" fill="#a2a6b5" font-family="JetBrains Mono, monospace">I${n}</text>`;
    for(const [p,q] of iv){ const w=Math.max(0.6, x(q)-x(p)); svg+=`<rect x="${x(p).toFixed(2)}" y="${y+2}" width="${w.toFixed(2)}" height="${rowH-5}" fill="${n===0?'#7fb7d8':'#e8b86d'}" opacity="${0.95-n*0.04}"/>`; }
  });
  svg+='</svg>';
  const g1=Math.sqrt(-beta-c);
  const rows=stages.slice(0,7).map((iv,n)=>{ const len=iv.reduce((s,[p,q])=>s+(q-p),0); return `<tr><td>${n}</td><td class="mono">${iv.length}</td><td class="mono">${len.toFixed(4)}</td></tr>`; }).join('');
  el.className='cantor';
  el.innerHTML=`<h3>Cantor construction on the real line</h3>
  <div class="cap">Here $\\beta = ${beta.toFixed(4)}$ is the larger fixed point, so $J\\subset[-\\beta,\\beta]$. Each stage is the real preimage of the previous one, $I_{n+1}=f^{-1}(I_n)\\cap\\mathbb R$, and $J=\\bigcap_n I_n$. Every interval splits in two because its middle, where $z^2+c<-\\beta$, is thrown out of $[-\\beta,\\beta]$ and escapes. First gap: $(-${g1.toFixed(4)},\\,${g1.toFixed(4)})$.</div>
  ${svg}
  <table><tr><th>stage</th><th>intervals</th><th>total length</th></tr>${rows}</table>`;
}
