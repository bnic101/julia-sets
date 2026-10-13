# Julia sets — a small gallery

Interactive WebGL renderings of Julia sets of polynomials, with short mathematical notes for each example.

Live site: https://bnic101.github.io/julia-sets/

## Examples

- **Cantor dust on the real line**: `z² − 6` (Milnor, *Dynamics in One Complex Variable*, Problem 4-e). The critical orbit escapes, so the Julia set is a Cantor set, and a short argument shows it lies in the interval [−3, 3]. The page draws the nested real intervals `I_{n+1} = f⁻¹(I_n) ∩ ℝ` whose intersection is J.
- Other Cantor sets: `c = −2.05` (just past the tip of the Mandelbrot set), `c = −0.75 + 0.1i` (the ghost of the basilica), `c = −0.8 + 0.156i` (a popular wallpaper image that is in fact totally disconnected).
- Connected quadratic examples: the circle, the interval, the basilica, Douady's rabbit, the airplane, the cauliflower, San Marco, a Siegel disk, the Feigenbaum map, and dendrites at Misiurewicz points.
- Higher degree: `z³ + c` and `z⁴ + c`, and a cubic where exactly one critical point escapes, so J is disconnected but not a Cantor set.

## Rendering

Three modes: smooth escape time (level curves of the Green's function), a distance estimate that draws only points near J (the right tool for Cantor sets, which have empty interior), and the filled Julia set. The critical orbit is iterated in double precision to label each parameter as connected / Cantor / mixed.

Everything is static HTML, CSS and JavaScript with no build step. KaTeX is loaded from a CDN for the notes.

## Running locally

Any static file server works, for example:

```
python3 -m http.server 8765
```

then open http://localhost:8765/.
