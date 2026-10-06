import { seeded } from './CoverArt';

/**
 * A sphere of points (Fibonacci lattice), lit by depth, with a handful of
 * "key language" nodes linked into a small graph: a picture of topological
 * content analysis. Computed at build time; no images, no client JavaScript.
 */
export function SphereVisual() {
  const N = 420;
  const R = 168;
  const C = 200;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const tiltX = 0.42;
  const tiltY = 0.65;
  const rand = seeded('sphere');

  const points = Array.from({ length: N }, (_, i) => {
    const y0 = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y0 * y0);
    const theta = golden * i;
    const x0 = Math.cos(theta) * r;
    const z0 = Math.sin(theta) * r;
    // Rotate around X, then Y
    const y1 = y0 * Math.cos(tiltX) - z0 * Math.sin(tiltX);
    const z1 = y0 * Math.sin(tiltX) + z0 * Math.cos(tiltX);
    const x2 = x0 * Math.cos(tiltY) + z1 * Math.sin(tiltY);
    const z2 = -x0 * Math.sin(tiltY) + z1 * Math.cos(tiltY);
    return { x: C + x2 * R, y: C + y1 * R, z: z2 };
  });

  const front = points.filter((p) => p.z > 0.35);
  const keys = Array.from({ length: 13 }, () => front[Math.floor(rand() * front.length)]).filter(
    (p, i, arr): p is (typeof front)[number] => Boolean(p) && arr.indexOf(p) === i,
  );

  // Link each key node to its two nearest key neighbours.
  const links = new Set<string>();
  keys.forEach((a, i) => {
    keys
      .map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
      .filter(({ j }) => j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, 2)
      .forEach(({ j }) => links.add([Math.min(i, j), Math.max(i, j)].join('-')));
  });

  const sorted = [...points].sort((a, b) => a.z - b.z);
  const r1 = (n: number) => Math.round(n * 10) / 10;

  return (
    <svg className="sphere-visual" viewBox="0 0 400 400" aria-hidden="true" focusable="false">
      <circle cx={C} cy={C} r={R + 14} fill="none" stroke="#d9deea" strokeWidth="1" />
      {sorted.map((p, i) => (
        <circle
          key={i}
          cx={r1(p.x)}
          cy={r1(p.y)}
          r={r1(1 + (p.z + 1) * 1.25)}
          fill="#14214d"
          opacity={r1(0.12 + ((p.z + 1) / 2) * 0.75)}
        />
      ))}
      {[...links].map((key) => {
        const [i, j] = key.split('-').map(Number);
        const a = keys[i ?? 0];
        const b = keys[j ?? 0];
        if (!a || !b) return null;
        return <line key={key} x1={r1(a.x)} y1={r1(a.y)} x2={r1(b.x)} y2={r1(b.y)} stroke="#ff5f2e" strokeWidth="1.5" opacity="0.8" />;
      })}
      {keys.map((p, i) => (
        <circle key={`k${i}`} cx={r1(p.x)} cy={r1(p.y)} r="5" fill="#ff5f2e" stroke="#f5f6fa" strokeWidth="2" />
      ))}
    </svg>
  );
}
