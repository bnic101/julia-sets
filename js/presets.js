'use strict';
/* Each preset: id, section, name, tag, kicker, formula (HTML/KaTeX), c=[re,im], optional a, family (0: z^d+c, 1: z^3+az+c),
   degree, view {cx,cy,w}, mode (0 escape, 1 distance, 2 filled), iter, palette, notes (HTML with $..$ math), views [...] */
const PRESETS = [
{
  id:'cantor-6', section:'Cantor Julia sets', name:'Cantor dust on the real line', tag:'z² − 6 · Milnor 4-e',
  kicker:'Totally disconnected', formula:'$f(z)=z^2-6$', c:[-6,0], view:{cx:0,cy:0,w:7.2}, mode:1, iter:400, thick:3,
  views:[{label:'Whole set',cx:0,cy:0,w:7.2},{label:'Right half [√3, 3]',cx:2.37,cy:0,w:1.5},{label:'Near the fixed point 3',cx:2.95,cy:0,w:0.14},{label:'Escape-time view',cx:0,cy:0,w:12,mode:0}],
  notes:`
<p>This is Problem 4-e in Milnor's <em>Dynamics in One Complex Variable</em>: the Julia set of $f(z)=z^2-6$ is a Cantor set contained in the real interval $[-3,3]$. The fixed points are $3$ and $-2$, with multipliers $f'(3)=6$ and $f'(-2)=-4$, so both are repelling; write $\\beta=3$ for the larger one.</p>
<p><strong>Why it is a Cantor set.</strong> The only critical point is $0$, and its orbit $0\\mapsto-6\\mapsto 30\\mapsto 894\\mapsto\\cdots$ escapes to infinity. By the theorem of Fatou and Julia, a quadratic polynomial whose critical point escapes has a totally disconnected Julia set, and then $K(f)=J(f)$: there is no interior at all. In the escape-time view the set is only visible as the place where the colour bands pinch together.</p>
<p><strong>Why it lies on the real axis.</strong> If $|z|>3$ then $|f(z)|\\ge|z|^2-6>|z|$, so bounded orbits stay in the disk $|z|\\le 3$. Write $z_n=x_n+iy_n$ for such an orbit. From $x_{n+1}=x_n^2-y_n^2-6\\ge-3$ we get $x_n^2\\ge 3+y_n^2\\ge 3$, hence $|x_n|\\ge\\sqrt3$ for every $n$. But $y_{n+1}=2x_ny_n$, so $|y_{n+1}|\\ge 2\\sqrt3\\,|y_n|$, and a nonzero imaginary part would grow without bound. So $y_0=0$: every point of $K(f)=J(f)$ is real, and in fact lies in $[-3,3]$.</p>
<p><strong>The construction.</strong> On the real line $f$ maps $[-3,3]$ onto $[-6,3]$, folding at $0$. The points that stay in $[-3,3]$ for one step form $I_1=[-3,-\\sqrt3]\\cup[\\sqrt3,3]$; the middle third-ish $(-\\sqrt3,\\sqrt3)$ is sent below $-3$ and escapes. Repeating, $I_{n+1}=f^{-1}(I_n)\\cap\\mathbb R$ consists of $2^{n+1}$ intervals and $J=\\bigcap_n I_n$. Since $|f'|\\ge 2\\sqrt3>1$ on $I_1$, the intervals shrink geometrically and the intersection is a Cantor set of measure zero. Coding each point by the sequence of left/right choices conjugates $f|_J$ to the full shift on two symbols.</p>
<p><strong>What to look at.</strong> Use the distance-estimate mode, which draws every point within a pixel or two of $J$; zoom along the real axis to see the gaps repeat at every scale. Click a point just off the axis to watch its imaginary part double away. The same construction works for every real $c<-2$; as $c\\to-2^-$ the gaps close up and $J$ fills the interval $[-2,2]$, which is the next example but one.</p>`
},
{
  id:'cantor-2p05', section:'Cantor Julia sets', name:'Just past the tip', tag:'c = −2.05',
  kicker:'Totally disconnected', formula:'$f(z)=z^2-2.05$', c:[-2.05,0], view:{cx:0,cy:0,w:4.6}, mode:1, iter:600, thick:2,
  views:[{label:'Whole set',cx:0,cy:0,w:4.6},{label:'Zoom at the right end',cx:1.9,cy:0,w:0.3},{label:'Escape-time view',cx:0,cy:0,w:5,mode:0}],
  notes:`
<p>The Mandelbrot set meets the real axis in $[-2,\\tfrac14]$; its left tip is $c=-2$. Nudge just past it and the critical orbit still escapes, here after $7$ iterations, so $J$ is again a real Cantor set, now inside $[-\\beta,\\beta]$ with $\\beta\\approx 2.017$.</p>
<p>The difference from $c=-6$ is quantitative. The first gap is $(-\\sqrt{-\\beta-c},\\sqrt{-\\beta-c})\\approx(-0.18,0.18)$ instead of $(-1.73,1.73)$, the expansion constant on $I_1$ is barely above $1$ near the ends, and the Hausdorff dimension of $J$ is close to $1$ rather than close to $0$. The dust is dense enough that at the default zoom it looks like a slightly moth-eaten segment; keep zooming on the real axis and the gaps appear at every scale.</p>`
},
{
  id:'basilica-dust', section:'Cantor Julia sets', name:'Ghost of the basilica', tag:'c = −0.75 + 0.1i',
  kicker:'Totally disconnected', formula:'$f(z)=z^2-0.75+0.1i$', c:[-0.75,0.1], view:{cx:0,cy:0,w:3.6}, mode:1, iter:500, thick:1.6,
  views:[{label:'Whole set',cx:0,cy:0,w:3.6},{label:'Zoom',cx:0.35,cy:0.25,w:0.5},{label:'Escape-time view',cx:0,cy:0,w:3.6,mode:0}],
  notes:`
<p>$c=-\\tfrac34$ is the parabolic parameter where the main cardioid of the Mandelbrot set touches the period-two disk (the San Marco Julia set in the gallery). Moving a little off the axis to $c=-0.75+0.1i$ leaves the Mandelbrot set through the pinch point, and the critical orbit escapes after about $36$ iterations.</p>
<p>The Julia set is therefore a Cantor set, but it remembers where it came from: the dust is arranged along the outline of the basilica, with the pinch points of the basilica turned into actual gaps. Compare it with the basilica $c=-1$ and with San Marco $c=-0.75$. Points of a Cantor Julia set are never isolated, so every speck you can resolve is itself a copy of the whole.</p>`
},
{
  id:'wallpaper', section:'Cantor Julia sets', name:'A famous near miss', tag:'c = −0.8 + 0.156i',
  kicker:'Totally disconnected, barely', formula:'$f(z)=z^2-0.8+0.156i$', c:[-0.8,0.156], view:{cx:0,cy:0,w:3.6}, mode:0, iter:1200, freq:0.1,
  views:[{label:'Whole set',cx:0,cy:0,w:3.6},{label:'Distance estimate',cx:0,cy:0,w:3.6,mode:1},{label:'Zoom',cx:-0.2,cy:0.55,w:0.4}],
  notes:`
<p>This parameter appears in countless fractal posters. It is in fact outside the Mandelbrot set: the critical orbit escapes, but only after roughly $255$ iterations, so with a low iteration cap the picture looks like a connected dendrite with a dark interior. Raise the iteration count and the dark regions dissolve.</p>
<p>It is a useful warning that pictures do not decide connectivity. The facts panel iterates the critical point in double precision for $3000$ steps; for parameters this close to the boundary of the Mandelbrot set that is the honest answer, and parameters still closer can defeat it either way.</p>`
},
{
  id:'circle', section:'Connected quadratics', name:'The circle', tag:'c = 0',
  kicker:'Connected, smooth', formula:'$f(z)=z^2$', c:[0,0], view:{cx:0,cy:0,w:3.2}, mode:0, iter:200,
  notes:`
<p>The one Julia set everyone can compute by hand: $|z|<1$ tends to the superattracting fixed point $0$, $|z|>1$ tends to infinity, and $J$ is the unit circle. On the circle $f$ is the angle-doubling map $\\theta\\mapsto 2\\theta$, which is chaotic in every sense: dense orbits, dense repelling periodic points, sensitive dependence on initial conditions.</p>
<p>Every other connected quadratic Julia set is the image of this one under a conjugacy that breaks down only on the circle itself: outside $K(f)$ the Böttcher coordinate conjugates $f_c$ to $z\\mapsto z^2$, and the colour bands in the escape-time mode are the images of circles $|z|=r$ under that coordinate.</p>`
},
{
  id:'interval', section:'Connected quadratics', name:'The interval', tag:'c = −2',
  kicker:'Connected, no interior', formula:'$f(z)=z^2-2$', c:[-2,0], view:{cx:0,cy:0,w:5}, mode:0, iter:300,
  views:[{label:'Whole set',cx:0,cy:0,w:5},{label:'Distance estimate',cx:0,cy:0,w:5,mode:1}],
  notes:`
<p>The map $z^2-2$ is the second Chebyshev polynomial in disguise: with $z=w+w^{-1}$ it becomes $w\\mapsto w^2$, so $J$ is the image of the unit circle under $w\\mapsto w+1/w$, which is the segment $[-2,2]$, and $f|_J$ is a two-to-one factor of angle doubling, $2\\cos\\theta\\mapsto 2\\cos 2\\theta$. On the interval it is the full tent-like map with absolutely continuous invariant measure $dx/(\\pi\\sqrt{4-x^2})$.</p>
<p>The critical point is preperiodic, $0\\mapsto-2\\mapsto 2\\mapsto 2$: this is a Misiurewicz parameter, so $K(f)=J(f)$ has no interior. It is the limit of the real Cantor sets $c<-2$ as the gaps close.</p>`
},
{
  id:'basilica', section:'Connected quadratics', name:'The basilica', tag:'c = −1',
  kicker:'Connected, superattracting 2-cycle', formula:'$f(z)=z^2-1$', c:[-1,0], view:{cx:0,cy:0,w:3.6}, mode:0, iter:300,
  views:[{label:'Whole set',cx:0,cy:0,w:3.6},{label:'Filled set',cx:0,cy:0,w:3.6,mode:2},{label:'A pinch point',cx:-0.618,cy:0,w:0.5}],
  notes:`
<p>Here $0\\mapsto-1\\mapsto 0$ is a superattracting cycle of period two. The interior of $K(f)$ is the basin of this cycle; it consists of infinitely many components (two of them contain $0$ and $-1$), each a topological disk, each touching its neighbours at a single point. The central two meet at the fixed point $\\alpha=(1-\\sqrt5)/2\\approx-0.618$, which is repelling with multiplier $2\\alpha\\approx-1.236$, and all other pinch points are preimages of $\\alpha$.</p>
<p>The Julia set is the boundary of all these disks together, a connected, locally connected curve with no interior. In the parameter plane $c=-1$ is the centre of the period-two disk attached to the main cardioid.</p>`
},
{
  id:'sanmarco', section:'Connected quadratics', name:'San Marco', tag:'c = −3/4',
  kicker:'Connected, parabolic', formula:'$f(z)=z^2-\\tfrac34$', c:[-0.75,0], view:{cx:0,cy:0,w:3.6}, mode:0, iter:1500,
  views:[{label:'Whole set',cx:0,cy:0,w:3.6},{label:'Filled set',cx:0,cy:0,w:3.6,mode:2},{label:'The parabolic point',cx:-0.5,cy:0,w:0.6}],
  notes:`
<p>At $c=-\\tfrac34$ the fixed point $-\\tfrac12$ has multiplier $-1$: it is parabolic, and the parameter sits exactly where the period-two disk is attached to the main cardioid. Interior orbits converge to $-\\tfrac12$, but only like $1/\\sqrt n$, which is why the renderer needs many iterations to colour the interior consistently; with few iterations a false fringe appears around the pinch.</p>
<p>Douady named it after the Basilica di San Marco and its reflection in a flooded piazza. Perturbing $c$ into the cardioid turns the parabolic point into an attracting fixed point and the two basins fuse; perturbing it into the period-two disk produces the basilica; perturbing it off the axis produces the Cantor set shown as the ghost of the basilica.</p>`
},
{
  id:'rabbit', section:'Connected quadratics', name:"Douady's rabbit", tag:'c ≈ −0.1226 + 0.7449i',
  kicker:'Connected, superattracting 3-cycle', formula:'$f(z)=z^2+c,\\quad c^3+2c^2+c+1=0$', c:[-0.12256116687665,0.74486176661974], view:{cx:0,cy:0,w:3.4}, mode:0, iter:300,
  views:[{label:'Whole set',cx:0,cy:0,w:3.4},{label:'Filled set',cx:0,cy:0,w:3.4,mode:2},{label:'An ear',cx:-0.3,cy:0.95,w:0.7}],
  notes:`
<p>The parameter is the complex root of $c^3+2c^2+c+1=0$ in the upper half plane, chosen so that $0\\mapsto c\\mapsto c^2+c\\mapsto 0$ is a superattracting cycle of period three. The three basin components containing the cycle meet at the repelling fixed point $\\alpha$, and the map permutes them cyclically; every other component is an iterated preimage, which gives the picture its rabbit-ears recursion.</p>
<p>The real root of the same cubic, $c\\approx-1.7549$, gives the airplane: same combinatorics on the real axis, completely different shape. Together with the basilica these are the standard examples for Thurston's classification of postcritically finite maps.</p>`
},
{
  id:'airplane', section:'Connected quadratics', name:'The airplane', tag:'c ≈ −1.7549',
  kicker:'Connected, superattracting 3-cycle', formula:'$f(z)=z^2-1.7549\\ldots$', c:[-1.7548776662466927,0], view:{cx:0,cy:0,w:4.4}, mode:0, iter:300,
  views:[{label:'Whole set',cx:0,cy:0,w:4.4},{label:'Filled set',cx:0,cy:0,w:4.4,mode:2},{label:'Wing detail',cx:-1.4,cy:0,w:0.5}],
  notes:`
<p>The real root of $c^3+2c^2+c+1=0$, the centre of the main period-three window on the real axis of the Mandelbrot set. The critical orbit $0\\mapsto c\\mapsto c^2+c\\mapsto 0$ is a superattracting 3-cycle on the real line; the three basin components lie along the axis like a fuselage and the rest of $K(f)$ hangs off them.</p>
<p>Restricted to the real line this is the period-three window of the logistic family, so by Sharkovskii's theorem the map has periodic points of every period, all of them (except the attracting cycle) lying in $J$.</p>`
},
{
  id:'cauliflower', section:'Connected quadratics', name:'The cauliflower', tag:'c = 1/4',
  kicker:'Connected, parabolic', formula:'$f(z)=z^2+\\tfrac14$', c:[0.25,0], view:{cx:0,cy:0,w:3.4}, mode:0, iter:2000, freq:0.1,
  views:[{label:'Whole set',cx:0,cy:0,w:3.4},{label:'Filled set',cx:0,cy:0,w:3.4,mode:2},{label:'The cusp at 1/2',cx:0.5,cy:0,w:0.5}],
  notes:`
<p>The cusp of the main cardioid. The fixed point $\\tfrac12$ is parabolic with multiplier exactly $1$; every interior point converges to it, but on the real axis the convergence is like $1/n$, so a point near $\\tfrac12$ needs thousands of iterations to be classified. That is why the picture uses $2000$ iterations and why the interior near the cusp looks grainy at lower settings.</p>
<p>For $c$ slightly larger than $\\tfrac14$ the parabolic point splits into two complex conjugate repelling fixed points and the Julia set becomes a Cantor set: the whole cauliflower implodes. This parabolic implosion is the mechanism behind the discontinuity of $c\\mapsto J(f_c)$ at the cusp.</p>`
},
{
  id:'siegel', section:'Connected quadratics', name:'A Siegel disk', tag:'golden-mean rotation',
  kicker:'Connected, irrationally indifferent', formula:'$c=\\tfrac{\\lambda}{2}-\\tfrac{\\lambda^2}{4},\\quad \\lambda=e^{2\\pi i\\theta},\\ \\theta=\\tfrac{\\sqrt5-1}{2}$', c:[-0.390540870218399,-0.586787907346969], view:{cx:0,cy:0,w:3.2}, mode:0, iter:800, freq:0.1,
  views:[{label:'Whole set',cx:0,cy:0,w:3.2},{label:'Filled set',cx:0,cy:0,w:3.2,mode:2},{label:'The disk',cx:-0.37,cy:-0.34,w:1.0}],
  notes:`
<p>The parameter is chosen so that the fixed point $z_0=\\lambda/2$ has multiplier $\\lambda=e^{2\\pi i\\theta}$ with $\\theta$ the golden mean. Since $\\theta$ is badly approximable, Siegel's theorem applies: on a neighbourhood of $z_0$ the map is conjugate to the rigid rotation by angle $2\\pi\\theta$. The maximal such neighbourhood is the Siegel disk, the roundish component of the interior containing $z_0$; the fixed point itself lies in the Fatou set, not in $J$.</p>
<p>Click inside the disk to see an orbit: it never converges and never escapes, but moves around an invariant curve, filling it densely. Herman and others showed the boundary of this disk is a quasicircle passing through the critical point $0$, which is why the disk looks pinched there. The surrounding components are preimages of the disk.</p>`
},
{
  id:'feigenbaum', section:'Connected quadratics', name:'The Feigenbaum map', tag:'c ≈ −1.4012',
  kicker:'Connected, no interior, infinitely renormalizable', formula:'$f(z)=z^2-1.401155\\ldots$', c:[-1.4011551890920506,0], view:{cx:0,cy:0,w:4.2}, mode:0, iter:1500, freq:0.1,
  views:[{label:'Whole set',cx:0,cy:0,w:4.2},{label:'Distance estimate',cx:0,cy:0,w:4.2,mode:1},{label:'Zoom on the axis',cx:-0.2,cy:0,w:0.6}],
  notes:`
<p>The accumulation point of the period-doubling cascade $c=-\\tfrac34,-\\tfrac54,-1.3681,\\ldots$ on the real axis. The critical orbit is bounded but there is no attracting cycle: $0$ is recurrent, and the map is infinitely renormalizable, with a small copy of itself inside every copy. The Julia set is connected and has empty interior, so $K(f)=J(f)$, and it contains the interval $[-\\beta,\\beta]$.</p>
<p>The self-similarity visible along the real axis, with scaling factor $\\alpha\\approx-2.5029$, is the Feigenbaum universality of one-dimensional dynamics, here seen in the complex plane. Because there is no attracting cycle, the dark regions of the picture are an artefact of the iteration cap; raise it and they shrink.</p>`
},
{
  id:'dendrite-i', section:'Connected quadratics', name:'A dendrite', tag:'c = i',
  kicker:'Connected, no interior', formula:'$f(z)=z^2+i$', c:[0,1], view:{cx:0,cy:0,w:3.6}, mode:0, iter:400,
  views:[{label:'Whole set',cx:0,cy:0,w:3.6},{label:'Distance estimate',cx:0,cy:0,w:3.6,mode:1},{label:'Branch point',cx:-0.6,cy:0.4,w:0.5}],
  notes:`
<p>The critical orbit is $0\\mapsto i\\mapsto -1+i\\mapsto -i\\mapsto -1+i$: after two steps it lands on a repelling cycle of period two. Such parameters are called Misiurewicz points, and they lie in the Mandelbrot set but not in any hyperbolic component. The Julia set is a dendrite: compact, connected, locally connected, containing no simple closed curve and with empty interior.</p>
<p>In the parameter plane $c=i$ is the tip of a branch of the Mandelbrot set, and near a Misiurewicz point the Mandelbrot set and the Julia set are asymptotically similar (Tan Lei): zooming into the parameter plane at $c=i$ and into the dynamical plane at $z=i$ gives the same picture up to rotation and scaling.</p>`
},
{
  id:'dendrite-real', section:'Connected quadratics', name:'A real dendrite', tag:'c ≈ −1.5437',
  kicker:'Connected, no interior', formula:'$f(z)=z^2+c,\\quad c^3+2c^2+2c+2=0$', c:[-1.5436890126920764,0], view:{cx:0,cy:0,w:4.4}, mode:0, iter:500,
  views:[{label:'Whole set',cx:0,cy:0,w:4.4},{label:'Distance estimate',cx:0,cy:0,w:4.4,mode:1},{label:'Zoom',cx:-0.84,cy:0,w:0.6}],
  notes:`
<p>Here $0\\mapsto c\\mapsto c^2+c\\mapsto \\alpha$, where $\\alpha\\approx-0.8393$ is the repelling fixed point with multiplier $2\\alpha$: the critical point lands on a fixed point after three steps. The condition is $(c^2+c)^2+c=-(c^2+c)$, which reduces to $c^3+2c^2+2c+2=0$.</p>
<p>This is the real Misiurewicz point at the far end of the period-three window, where the three bands of the real map merge into one. The Julia set is a dendrite containing the whole interval $[-\\beta,\\beta]$, with trees hanging off the axis at every preimage of $\\alpha$.</p>`
},
{
  id:'cubic-fixed', section:'Higher degree', name:'A cubic with an attracting fixed point', tag:'z³ + 0.4i',
  kicker:'Degree three, connected', formula:'$f(z)=z^3+0.4i$', family:0, degree:3, c:[0,0.4], view:{cx:0,cy:0,w:3.0}, mode:0, iter:300,
  views:[{label:'Whole set',cx:0,cy:0,w:3.0},{label:'Filled set',cx:0,cy:0,w:3.0,mode:2}],
  notes:`
<p>For $z^3+c$ the only critical point is $0$, of multiplicity two, so the same dichotomy holds: $J$ is connected if $0$ has a bounded orbit, a Cantor set otherwise. Here the critical orbit converges to the attracting fixed point $z\\approx 0.361i$ on the imaginary axis, whose multiplier $3z^2\\approx-0.39$ is small, and the interior of $K(f)$ is its basin.</p>
<p>Every Julia set of $z^3+c$ has threefold rotational symmetry because $f(\\omega z)=f(z)$ for $\\omega=e^{2\\pi i/3}$. The parameter-plane map below is the degree-three analogue of the Mandelbrot set, which has twofold symmetry.</p>`
},
{
  id:'cubic-cantor', section:'Higher degree', name:'A cubic Cantor set', tag:'z³ + 0.53 + 0.1i',
  kicker:'Degree three, totally disconnected', formula:'$f(z)=z^3+0.53+0.1i$', family:0, degree:3, c:[0.53,0.1], view:{cx:0,cy:0,w:3.0}, mode:1, iter:400, thick:1.8,
  views:[{label:'Whole set',cx:0,cy:0,w:3.0},{label:'Escape-time view',cx:0,cy:0,w:3.0,mode:0},{label:'Zoom',cx:0.75,cy:0.35,w:0.5}],
  notes:`
<p>The critical point $0$ escapes after about $14$ iterations, so the Julia set is a Cantor set, this time with threefold symmetry. Because the critical point has multiplicity two, each piece of the dust has three preimages rather than two, and the dynamics on $J$ is conjugate to the full shift on three symbols.</p>`
},
{
  id:'cubic-mixed', section:'Higher degree', name:'One critical point escapes', tag:'z³ − 1.08z + 0.375 + 0.125i',
  kicker:'Degree three, disconnected but not Cantor', formula:'$f(z)=z^3-3a^2z+b,\\quad a=0.6,\\ b=0.375+0.125i$', family:1, degree:3, c:[0.375,0.125], a:[-1.08,0], view:{cx:0,cy:0,w:3.6}, mode:0, iter:600, freq:0.1,
  views:[{label:'Whole set',cx:0,cy:0,w:3.6},{label:'Distance estimate',cx:0,cy:0,w:3.6,mode:1},{label:'Filled set',cx:0,cy:0,w:3.6,mode:2},{label:'Zoom',cx:0.6,cy:0.1,w:1.0}],
  notes:`
<p>A cubic polynomial has two critical points, here $\\pm a=\\pm 0.6$. For this $b$ the orbit of $+a$ stays bounded, converging to an attracting cycle, while the orbit of $-a$ escapes. Neither alternative of the quadratic dichotomy applies.</p>
<p>Branner and Hubbard analysed exactly this situation: $K(f)$ has infinitely many components. Countably many of them are copies of a connected quadratic-like filled Julia set (the ones that eventually visit the bounded critical point), and the rest are single points, uncountably many of them. In the picture the fat components are the quadratic-like pieces; the dust between them is the Cantor part. Whether the single-point components form a set of measure zero was a long-standing question, settled affirmatively by Branner and Hubbard for most cubics and later in general by Kozlovski and van Strien and by Qiu and Yin.</p>`
},
{
  id:'quartic', section:'Higher degree', name:'A quartic', tag:'z⁴ + 0.2 + 0.6i',
  kicker:'Degree four, connected', formula:'$f(z)=z^4+0.2+0.6i$', family:0, degree:4, c:[0.2,0.6], view:{cx:0,cy:0,w:2.8}, mode:0, iter:300,
  views:[{label:'Whole set',cx:0,cy:0,w:2.8},{label:'Filled set',cx:0,cy:0,w:2.8,mode:2}],
  notes:`
<p>Unicritical maps $z^d+c$ all behave like the quadratic family, with $d$-fold symmetry. The escape rate is faster, since $|f(z)|\\approx|z|^d$, so the colour bands outside are more widely spaced in the Böttcher coordinate and the smooth iteration count uses $\\log_d$ instead of $\\log_2$.</p>`
}
];
