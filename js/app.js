'use strict';
/* Julia set viewer: WebGL renderer + UI. No build step. */

const VS = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';
const FS = `
precision highp float;
uniform vec2 u_res;
uniform vec2 u_center;
uniform float u_scale;      // complex units per device pixel
uniform vec2 u_c;
uniform vec2 u_a;
uniform int u_family;       // 0: z^d + c   1: z^3 + a z + c
uniform int u_degree;
uniform int u_iter;
uniform int u_mode;         // 0 escape time, 1 distance estimate, 2 filled
uniform int u_palette;
uniform float u_thick;
uniform float u_freq;
uniform int u_mandel;       // 1: parameter plane (z0 = critical point 0, c = pixel)
const int MAXIT = 4000;
const float R = 1.0e4;

vec2 cmul(vec2 a, vec2 b){ return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x); }
vec2 cpow(vec2 z, int d){ vec2 r = z; for(int k=1;k<8;k++){ if(k>=d) break; r = cmul(r,z); } return r; }

vec3 pal(float t){
  vec3 a, b, c, d;
  if(u_palette==0){ a=vec3(0.5); b=vec3(0.5); c=vec3(1.0); d=vec3(0.00,0.10,0.20); }
  else if(u_palette==1){ a=vec3(0.5); b=vec3(0.5); c=vec3(1.0,1.0,0.5); d=vec3(0.80,0.90,0.30); }
  else if(u_palette==2){ a=vec3(0.5); b=vec3(0.5); c=vec3(1.0,0.7,0.4); d=vec3(0.00,0.15,0.20); }
  else { a=vec3(0.5); b=vec3(0.46); c=vec3(1.0); d=vec3(0.0); }
  return a + b*cos(6.28318*(c*t + d));
}

void main(){
  vec2 uv = gl_FragCoord.xy - 0.5*u_res;
  vec2 pt = u_center + uv*u_scale;
  vec2 z, c, dz;
  if(u_mandel==1){ c = pt; z = vec2(0.0); dz = vec2(0.0); }
  else { c = u_c; z = pt; dz = vec2(1.0, 0.0); }
  float deg = (u_family==1) ? 3.0 : float(u_degree);
  bool esc = false; int n = 0;
  for(int i=0;i<MAXIT;i++){
    if(i>=u_iter) break;
    if(u_family==1){
      vec2 z2 = cmul(z,z);
      dz = cmul(3.0*z2 + u_a, dz);
      z = cmul(z2,z) + cmul(u_a,z) + c;
    } else {
      vec2 zd1 = cpow(z, u_degree-1);
      dz = deg*cmul(zd1,dz);
      z = cmul(zd1,z) + c;
    }
    if(u_mandel==1) dz += vec2(1.0,0.0);
    n = i+1;
    if(dot(z,z) > R*R){ esc = true; break; }
  }
  vec3 col;
  vec3 paper = vec3(0.96,0.95,0.92);
  vec3 ink = vec3(0.07,0.08,0.11);
  float nu = 0.0; float band = 0.0;
  if(esc){
    float r = length(z);
    nu = float(n) - log(log(r)/log(R))/log(deg);
    band = smoothstep(0.0, 0.08, fract(nu));
  }
  if(u_mode==0){
    col = esc ? pal(sqrt(max(nu,0.0))*u_freq) * (1.0 - 0.8*exp(-0.3*max(nu,0.0))) : vec3(0.0);
  } else if(u_mode==1){
    vec3 bg = paper*(0.93 + 0.07*band);
    if(esc){
      float r = length(z);
      float d = r*log(r)/max(length(dz), 1e-30);
      float v = exp(-d/(u_thick*u_scale));
      col = mix(bg, ink, v);
    } else {
      col = vec3(0.84,0.83,0.80);
    }
  } else {
    col = esc ? paper*(0.92 + 0.08*band) : ink;
  }
  gl_FragColor = vec4(col, 1.0);
}`;

class Renderer {
  constructor(canvas){
    this.canvas = canvas;
    const gl = canvas.getContext('webgl', {preserveDrawingBuffer:true, antialias:false, alpha:false});
    if(!gl) throw new Error('no webgl');
    this.gl = gl;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if(!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    this.u = {};
    for(const name of ['u_res','u_center','u_scale','u_c','u_a','u_family','u_degree','u_iter','u_mode','u_palette','u_thick','u_freq','u_mandel'])
      this.u[name] = gl.getUniformLocation(prog, name);
  }
  render(s, mandel){
    const gl = this.gl, u = this.u, W = this.canvas.width, H = this.canvas.height;
    gl.viewport(0,0,W,H);
    gl.uniform2f(u.u_res, W, H);
    gl.uniform2f(u.u_center, s.cx, s.cy);
    gl.uniform1f(u.u_scale, s.w / W);
    gl.uniform2f(u.u_c, s.cre, s.cim);
    gl.uniform2f(u.u_a, s.are, s.aim);
    gl.uniform1i(u.u_family, s.family);
    gl.uniform1i(u.u_degree, s.degree);
    gl.uniform1i(u.u_iter, Math.min(4000, s.iter|0));
    gl.uniform1i(u.u_mode, s.mode);
    gl.uniform1i(u.u_palette, s.palette);
    gl.uniform1f(u.u_thick, s.thick);
    gl.uniform1f(u.u_freq, s.freq);
    gl.uniform1i(u.u_mandel, mandel ? 1 : 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

/* ---------- complex helpers (double precision, for facts/orbits) ---------- */
const C = {
  mul:(a,b)=>[a[0]*b[0]-a[1]*b[1], a[0]*b[1]+a[1]*b[0]],
  add:(a,b)=>[a[0]+b[0], a[1]+b[1]],
  abs:(a)=>Math.hypot(a[0],a[1]),
  sqrt:(a)=>{ const r=Math.hypot(a[0],a[1]); const re=Math.sqrt((r+a[0])/2); const im=Math.sign(a[1]||1)*Math.sqrt(Math.max(0,(r-a[0])/2)); return [re,im]; },
  pow:(z,d)=>{ let r=z; for(let k=1;k<d;k++) r=C.mul(r,z); return r; },
  fmt:(a,p=5)=>{ const re=+a[0].toFixed(p), im=+a[1].toFixed(p); if(Math.abs(im)<1e-12) return `${re}`; return `${re} ${im<0?'−':'+'} ${Math.abs(im)}i`; }
};
function mapF(s){
  const c=[s.cre,s.cim], a=[s.are,s.aim];
  if(s.family===1) return z=>C.add(C.add(C.pow(z,3), C.mul(a,z)), c);
  const d=s.degree; return z=>C.add(C.pow(z,d), c);
}
function escapes(f, z0, N=3000, R=1e6){ let z=z0; for(let n=0;n<N;n++){ z=f(z); if(C.abs(z)>R) return n+1; } return null; }
function criticalPoints(s){
  if(s.family===1){ const q=C.sqrt([-s.are/3,-s.aim/3]); return [q,[-q[0],-q[1]]]; }
  return [[0,0]];
}

/* ---------- state ---------- */
const DEF = {family:0, degree:2, cre:-1, cim:0, are:0, aim:0, cx:0, cy:0, w:4, iter:300, mode:0, palette:0, thick:1.5, freq:0.12};
let S = {...DEF};
let currentPreset = null;
let orbit = null;

const $ = id => document.getElementById(id);
const viewer=$('viewer'), view=$('view'), overlay=$('overlay'), hud=$('hud');
let R;
try { R = new Renderer(view); } catch(e){ $('nogl').hidden=false; console.error(e); }
const DPR = Math.min(window.devicePixelRatio||1, 2);

function resize(){
  const w=Math.max(1,Math.round(viewer.clientWidth*DPR)), h=Math.max(1,Math.round(viewer.clientHeight*DPR));
  if(view.width!==w||view.height!==h){ view.width=overlay.width=w; view.height=overlay.height=h; }
}
let raf=0;
function draw(){ if(raf) return; raf=requestAnimationFrame(()=>{ raf=0; if(!R) return; resize(); R.render(S,false); drawOverlay(); updateHud(); }); }

function toPixel(z){ const W=view.width,H=view.height, sc=S.w/W; return [(z[0]-S.cx)/sc + W/2, H/2 - (z[1]-S.cy)/sc]; }
function toComplex(px,py){ const W=view.width,H=view.height, sc=S.w/W; return [S.cx + (px-W/2)*sc, S.cy - (py-H/2)*sc]; }

function drawOverlay(){
  const ctx=overlay.getContext('2d'); ctx.clearRect(0,0,overlay.width,overlay.height);
  if(!orbit) return;
  ctx.lineWidth=1.2*DPR; ctx.strokeStyle='rgba(255,220,120,0.85)'; ctx.fillStyle='#ffd978';
  ctx.beginPath();
  orbit.forEach((z,i)=>{ const p=toPixel(z); if(i===0) ctx.moveTo(p[0],p[1]); else ctx.lineTo(p[0],p[1]); });
  ctx.stroke();
  orbit.forEach((z,i)=>{ const p=toPixel(z); const r=(i===0?4:2.3)*DPR; ctx.beginPath(); ctx.arc(p[0],p[1],r,0,6.283); ctx.fillStyle=i===0?'#ff6b6b':'#ffd978'; ctx.fill(); });
}
function updateHud(){ hud.textContent=`centre ${C.fmt([S.cx,S.cy],6)}   width ${S.w.toPrecision(4)}   ${S.iter} it`; }

/* ---------- interaction ---------- */
const ptrs=new Map(); let dragStart=null, pinch=null;
viewer.addEventListener('pointerdown', e=>{
  viewer.setPointerCapture(e.pointerId); ptrs.set(e.pointerId,[e.clientX,e.clientY]);
  if(ptrs.size===1){ dragStart={x:e.clientX,y:e.clientY,cx:S.cx,cy:S.cy,moved:false}; viewer.classList.add('dragging'); }
  else if(ptrs.size===2){ const [a,b]=[...ptrs.values()]; pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]), w:S.w}; dragStart=null; }
});
viewer.addEventListener('pointermove', e=>{
  if(!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId,[e.clientX,e.clientY]);
  if(ptrs.size===1 && dragStart){
    const dx=e.clientX-dragStart.x, dy=e.clientY-dragStart.y;
    if(Math.hypot(dx,dy)>3) dragStart.moved=true;
    const sc=S.w/viewer.clientWidth; S.cx=dragStart.cx-dx*sc; S.cy=dragStart.cy+dy*sc; draw();
  } else if(ptrs.size===2 && pinch){
    const [a,b]=[...ptrs.values()]; const d=Math.hypot(a[0]-b[0],a[1]-b[1]); S.w=pinch.w*pinch.d/Math.max(d,1); draw();
  }
});
function endPtr(e){
  const wasClick = dragStart && !dragStart.moved && ptrs.size===1;
  ptrs.delete(e.pointerId); if(ptrs.size<2) pinch=null;
  if(ptrs.size===0){ viewer.classList.remove('dragging'); if(wasClick) onClick(e); dragStart=null; pushHash(); }
}
viewer.addEventListener('pointerup', endPtr); viewer.addEventListener('pointercancel', endPtr);
viewer.addEventListener('wheel', e=>{
  e.preventDefault();
  const rect=viewer.getBoundingClientRect(); const px=(e.clientX-rect.left)*DPR, py=(e.clientY-rect.top)*DPR;
  const before=toComplex(px,py); const f=Math.exp(e.deltaY*0.0015); S.w*=f;
  const after=toComplex(px,py); S.cx+=before[0]-after[0]; S.cy+=before[1]-after[1]; draw(); pushHashSoon();
},{passive:false});
viewer.addEventListener('dblclick', e=>{
  const rect=viewer.getBoundingClientRect(); const px=(e.clientX-rect.left)*DPR, py=(e.clientY-rect.top)*DPR;
  const z=toComplex(px,py); S.cx=z[0]; S.cy=z[1]; S.w/=2.5; draw(); pushHash();
});
function onClick(e){
  if(!$('orbit').checked){ orbit=null; drawOverlay(); $('orbitinfo').textContent=''; return; }
  const rect=viewer.getBoundingClientRect(); const px=(e.clientX-rect.left)*DPR, py=(e.clientY-rect.top)*DPR;
  const z0=toComplex(px,py); const f=mapF(S); const pts=[z0]; let z=z0, esc=null;
  for(let n=1;n<=400;n++){ z=f(z); pts.push(z); if(C.abs(z)>50){ esc=n; break; } }
  orbit=pts.slice(0,esc?esc+1:120); drawOverlay();
  const first=pts.slice(0,8).map(C.fmt).join('  →  ');
  $('orbitinfo').textContent = `orbit of z₀ = ${C.fmt(z0)}\n${esc?`escapes after ${esc} steps`:'still bounded after 400 steps'}\n${first}${pts.length>8?'  →  …':''}`;
}

/* ---------- controls ---------- */
function bindControls(){
  $('mode').onchange=e=>{ S.mode=+e.target.value; syncVisible(); draw(); pushHash(); };
  $('palette').onchange=e=>{ S.palette=+e.target.value; draw(); pushHash(); };
  $('iter').oninput=e=>{ S.iter=+e.target.value; $('iterv').textContent=S.iter; draw(); pushHashSoon(); };
  $('thick').oninput=e=>{ S.thick=+e.target.value; $('thickv').textContent=S.thick.toFixed(1); draw(); pushHashSoon(); };
  $('freq').oninput=e=>{ S.freq=+e.target.value; $('freqv').textContent=S.freq.toFixed(2); draw(); pushHashSoon(); };
  $('orbit').onchange=()=>{ if(!$('orbit').checked){ orbit=null; drawOverlay(); $('orbitinfo').textContent=''; } };
  $('reset').onclick=()=>{ if(currentPreset){ Object.assign(S, currentPreset.view); } else { S.cx=0;S.cy=0;S.w=4; } orbit=null; draw(); pushHash(); };
  $('save').onclick=()=>{ R.render(S,false); const a=document.createElement('a'); a.download=(currentPreset?currentPreset.id:'julia')+'.png'; a.href=view.toDataURL('image/png'); a.click(); };
  $('share').onclick=async()=>{ pushHash(); try{ await navigator.clipboard.writeText(location.href); $('share').textContent='Copied'; setTimeout(()=>$('share').textContent='Copy link',1200);}catch(_){ prompt('Link', location.href);} };
  $('family').onchange=e=>{ const [f,d]=e.target.value.split(':').map(Number); S.family=f; S.degree=d; setCustom(); };
  for(const id of ['cre','cim','are','aim']) $(id).onchange=()=>{ const v=parseFloat($(id).value); if(Number.isFinite(v)){ S[id]=v; setCustom(); } };
  $('mapov').parentElement.addEventListener('click', e=>{
    const rect=e.currentTarget.getBoundingClientRect(); const mv=mapView();
    const sc=mv.w/mapC.width; const px=(e.clientX-rect.left)*DPR, py=(e.clientY-rect.top)*DPR;
    S.cre=mv.cx+(px-mapC.width/2)*sc; S.cim=mv.cy-(py-mapC.height/2)*sc; setCustom();
  });
  window.addEventListener('keydown', e=>{ if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT') return;
    if(e.key==='+'||e.key==='='){ S.w/=1.5; draw(); } if(e.key==='-'){ S.w*=1.5; draw(); } if(e.key==='r') $('reset').click(); });
  new ResizeObserver(()=>draw()).observe(viewer);
}
function syncControls(){
  $('mode').value=S.mode; $('palette').value=S.palette; $('iter').value=S.iter; $('iterv').textContent=S.iter;
  $('thick').value=S.thick; $('thickv').textContent=S.thick.toFixed(1); $('freq').value=S.freq; $('freqv').textContent=S.freq.toFixed(2);
  $('family').value=`${S.family}:${S.degree}`; $('cre').value=fmtNum(S.cre); $('cim').value=fmtNum(S.cim); $('are').value=fmtNum(S.are); $('aim').value=fmtNum(S.aim);
  $('awrap').hidden = S.family!==1; $('mapwrap').hidden = S.family===1;
  syncVisible();
}
function fmtNum(x){ return String(+x.toFixed(10)); }
function syncVisible(){ $('thickwrap').style.display = S.mode===1?'':'none'; $('freqwrap').style.display = S.mode===0?'':'none'; }

function setCustom(){
  currentPreset=null; document.querySelectorAll('.card').forEach(c=>c.classList.remove('active'));
  orbit=null; syncControls(); showNotes(null); draw(); drawMap(); pushHash();
}

/* ---------- parameter plane ---------- */
const mapC=$('map'), mapOv=$('mapov'); let mapR=null;
try{ mapR=new Renderer(mapC); }catch(_){}
function mapView(){ return S.degree===2 ? {cx:-0.55,cy:0,w:3.3} : {cx:0,cy:0,w:2.6}; }
function drawMap(){
  if(!mapR || S.family===1) return;
  const box=mapC.parentElement; const w=Math.round(box.clientWidth*DPR), h=Math.round(box.clientHeight*DPR);
  if(mapC.width!==w){ mapC.width=mapOv.width=w; mapC.height=mapOv.height=h; }
  const mv=mapView();
  mapR.render({...S, ...mv, mode:0, palette:3, iter:200, freq:0.25}, true);
  const ctx=mapOv.getContext('2d'); ctx.clearRect(0,0,w,h);
  const sc=mv.w/w; const px=(S.cre-mv.cx)/sc+w/2, py=h/2-(S.cim-mv.cy)/sc;
  ctx.strokeStyle='#e8b86d'; ctx.lineWidth=1.5*DPR; ctx.beginPath(); ctx.arc(px,py,5*DPR,0,6.283); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(px-9*DPR,py); ctx.lineTo(px+9*DPR,py); ctx.moveTo(px,py-9*DPR); ctx.lineTo(px,py+9*DPR); ctx.stroke();
}

/* ---------- facts ---------- */
function showFacts(){
  const f=mapF(S); const cps=criticalPoints(S); const lines=[];
  const name = S.family===1 ? `z³ + (${C.fmt([S.are,S.aim])})·z + (${C.fmt([S.cre,S.cim])})` : `z${['','','²','³','⁴'][S.degree]} + (${C.fmt([S.cre,S.cim])})`;
  lines.push(`<div><b>f(z) = ${name}</b></div>`);
  const esc = cps.map(z=>escapes(f,z));
  cps.forEach((z,i)=>{ lines.push(`<div>critical point ${C.fmt(z)}: ${esc[i]?`escapes after <b>${esc[i]}</b> iterations`:'orbit <b>bounded</b> (3000 iterations)'}</div>`); });
  let verdict;
  if(esc.every(e=>e===null)) verdict='<span class="ok">J is connected</span> (no critical point escapes)';
  else if(esc.every(e=>e!==null)) verdict='<span class="cantor">J is a Cantor set</span> (every critical point escapes)';
  else verdict='<span class="mixed">J is disconnected but not a Cantor set</span> (exactly one critical point escapes; Branner–Hubbard)';
  lines.push(`<div>${verdict}</div>`);
  if(S.family===0 && S.degree===2){
    const disc=C.sqrt([1-4*S.cre,-4*S.cim]); const b=[(1+disc[0])/2,disc[1]/2], a=[(1-disc[0])/2,-disc[1]/2];
    const lam=z=>C.abs(z)*2;
    const cls=m=>Math.abs(m-1)<1e-9?'indifferent':(m<1?'attracting':'repelling');
    lines.push(`<div>fixed points β = ${C.fmt(b)} (|f′| = ${lam(b).toFixed(4)}, ${cls(lam(b))}), α = ${C.fmt(a)} (|f′| = ${lam(a).toFixed(4)}, ${cls(lam(a))})</div>`);
  }
  $('facts').innerHTML=lines.join('');
}

/* ---------- notes / presets ---------- */
function showNotes(p){
  const notes=$('notes');
  if(!p){
    $('kicker').textContent='Custom parameter'; $('title').textContent='Your own Julia set';
    $('formula').innerHTML=''; $('views').innerHTML=''; $('cantor').innerHTML='';
    $('body').innerHTML='<p>Pick a map and a value of $c$ (or click in the parameter plane). The facts panel iterates the critical orbit in double precision and reports whether $J$ is connected, a Cantor set, or neither.</p>';
  } else {
    $('kicker').textContent=p.kicker||''; $('title').textContent=p.name; $('formula').innerHTML=p.formula||'';
    $('body').innerHTML=p.notes||'';
    $('views').innerHTML='';
    (p.views||[]).forEach(v=>{ const b=document.createElement('button'); b.textContent=v.label; b.onclick=()=>{ S.cx=v.cx;S.cy=v.cy;S.w=v.w; if(v.iter) S.iter=v.iter; if(v.mode!==undefined) S.mode=v.mode; syncControls(); draw(); pushHash(); }; $('views').appendChild(b); });
    $('cantor').innerHTML='';
    if(S.family===0 && S.degree===2 && S.cim===0 && S.cre<-2) renderCantorPanel($('cantor'), S.cre);
  }
  showFacts();
  if(window.renderMathInElement) renderMathInElement(notes, {delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}], throwOnError:false});
}
function loadPreset(p, keepView){
  currentPreset=p; orbit=null;
  Object.assign(S, {family:p.family||0, degree:p.degree||2, cre:p.c[0], cim:p.c[1], are:(p.a||[0,0])[0], aim:(p.a||[0,0])[1],
    iter:p.iter||300, mode:p.mode||0, palette:p.palette===undefined?0:p.palette, thick:p.thick||1.5, freq:p.freq||0.12});
  if(!keepView) Object.assign(S, p.view);
  document.querySelectorAll('.card').forEach(c=>c.classList.toggle('active', c.dataset.id===p.id));
  syncControls(); showNotes(p); draw(); drawMap(); pushHash();
}

function buildGallery(){
  const g=$('gallery'); g.innerHTML='';
  const thumb=document.createElement('canvas'); thumb.width=240; thumb.height=160; let tr=null;
  try{ tr=new Renderer(thumb); }catch(_){}
  let section='';
  for(const p of PRESETS){
    if(p.section!==section){ section=p.section; const h=document.createElement('h4'); h.textContent=section; g.appendChild(h); }
    const b=document.createElement('button'); b.className='card'; b.dataset.id=p.id;
    const img=document.createElement('img'); img.alt=p.name;
    if(tr){ const st={...DEF, family:p.family||0, degree:p.degree||2, cre:p.c[0], cim:p.c[1], are:(p.a||[0,0])[0], aim:(p.a||[0,0])[1], ...p.view,
        iter:Math.min(p.iter||300,600), mode:p.thumbMode!==undefined?p.thumbMode:(p.mode||0), palette:p.palette===undefined?0:p.palette, thick:2.2, freq:p.freq||0.12};
      st.w = st.w*1.0; tr.render(st,false); img.src=thumb.toDataURL('image/jpeg',0.85); }
    b.appendChild(img);
    const nm=document.createElement('span'); nm.className='nm'; nm.textContent=p.name; b.appendChild(nm);
    const tg=document.createElement('span'); tg.className='tg'; tg.textContent=p.tag||''; b.appendChild(tg);
    b.onclick=()=>loadPreset(p);
    g.appendChild(b);
  }
}

/* ---------- URL state ---------- */
let hashTimer=0;
function pushHashSoon(){ clearTimeout(hashTimer); hashTimer=setTimeout(pushHash,400); }
function pushHash(){
  const q=new URLSearchParams();
  if(currentPreset) q.set('p',currentPreset.id);
  q.set('f',S.family); q.set('d',S.degree); q.set('c',`${fmtNum(S.cre)},${fmtNum(S.cim)}`);
  if(S.family===1) q.set('a',`${fmtNum(S.are)},${fmtNum(S.aim)}`);
  q.set('v',`${S.cx.toPrecision(9)},${S.cy.toPrecision(9)},${S.w.toPrecision(6)}`);
  q.set('m',S.mode); q.set('pal',S.palette); q.set('it',S.iter); q.set('t',S.thick); q.set('fq',S.freq);
  history.replaceState(null,'','#'+q.toString());
}
function readHash(){
  if(!location.hash || location.hash.length<2) return false;
  const q=new URLSearchParams(location.hash.slice(1));
  if(!q.has('p') && !q.has('c')) return false;   // plain anchor such as #about
  const p=PRESETS.find(x=>x.id===q.get('p'));
  if(p) loadPreset(p, q.has('v')); else { currentPreset=null; }
  const num=(k,def)=>{ const v=parseFloat(q.get(k)); return Number.isFinite(v)?v:def; };
  if(q.has('f')) S.family=+q.get('f'); if(q.has('d')) S.degree=+q.get('d');
  if(q.has('c')){ const [a,b]=q.get('c').split(',').map(Number); if(Number.isFinite(a)&&Number.isFinite(b)){S.cre=a;S.cim=b;} }
  if(q.has('a')){ const [a,b]=q.get('a').split(',').map(Number); if(Number.isFinite(a)&&Number.isFinite(b)){S.are=a;S.aim=b;} }
  if(q.has('v')){ const [x,y,w]=q.get('v').split(',').map(Number); if([x,y,w].every(Number.isFinite)&&w>0){S.cx=x;S.cy=y;S.w=w;} }
  S.mode=num('m',S.mode)|0; S.palette=num('pal',S.palette)|0; S.iter=num('it',S.iter)|0; S.thick=num('t',S.thick); S.freq=num('fq',S.freq);
  if(!p){ document.querySelectorAll('.card').forEach(c=>c.classList.remove('active')); syncControls(); showNotes(null); }
  else { syncControls(); }
  draw(); drawMap();
  return true;
}

/* ---------- boot ---------- */
bindControls();
buildGallery();
if(window.renderMathInElement) renderMathInElement(document.getElementById('about'), {delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}], throwOnError:false});
if(!readHash()) loadPreset(PRESETS[0]);
window.addEventListener('hashchange', ()=>{ readHash(); });
