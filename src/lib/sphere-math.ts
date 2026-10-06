/**
 * Small, allocation-free 3D helpers for the Sphere canvas.
 * Convention: rotate around Y first, then X. After rotation, +z faces the viewer.
 */

export const TAU = Math.PI * 2;

export type Vec3 = readonly [number, number, number];

/** `count` points spread evenly over a unit sphere (Fibonacci lattice), packed as xyz triples. */
export function fibonacciSphere(count: number): Float32Array {
  const points = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = count === 1 ? 0 : 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    points[i * 3] = Math.cos(golden * i) * r;
    points[i * 3 + 1] = y;
    points[i * 3 + 2] = Math.sin(golden * i) * r;
  }
  return points;
}

/** Rotate a point around Y by `rotY`, then around X by `rotX`. */
export function rotatePoint([x, y, z]: Vec3, rotY: number, rotX: number): [number, number, number] {
  const x1 = x * Math.cos(rotY) + z * Math.sin(rotY);
  const z1 = -x * Math.sin(rotY) + z * Math.cos(rotY);
  return [x1, y * Math.cos(rotX) - z1 * Math.sin(rotX), y * Math.sin(rotX) + z1 * Math.cos(rotX)];
}

/**
 * The rotation that turns a point on the unit sphere to face the viewer head-on.
 * Of all the equivalent Y angles, it picks the one nearest `currentY`, so the
 * sphere takes the short way round instead of spinning several turns.
 */
export function rotationToFront([x, y, z]: Vec3, currentY = 0): { rotY: number; rotX: number } {
  const theta = Math.atan2(-x, z);
  const rotY = theta + Math.round((currentY - theta) / TAU) * TAU;
  const rotX = Math.atan2(y, Math.hypot(x, z));
  return { rotY, rotX };
}

/**
 * Points along the great circle from `a` to `b` (both unit vectors), lifted off
 * the surface towards the middle like a flight path. Packed as xyz triples,
 * `segments + 1` points long, starting at `a` and ending at `b`.
 */
export function greatCircleArc(a: Vec3, b: Vec3, segments: number, lift: number): Float32Array {
  const out = new Float32Array((segments + 1) * 3);
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const omega = Math.acos(dot);
  const sinOmega = Math.sin(omega);
  for (let s = 0; s <= segments; s++) {
    const t = s / segments;
    // Spherical interpolation; fall back to a straight blend when the points coincide.
    const wa = sinOmega < 1e-6 ? 1 - t : Math.sin((1 - t) * omega) / sinOmega;
    const wb = sinOmega < 1e-6 ? t : Math.sin(t * omega) / sinOmega;
    const height = 1 + lift * Math.sin(Math.PI * t);
    out[s * 3] = (wa * a[0] + wb * b[0]) * height;
    out[s * 3 + 1] = (wa * a[1] + wb * b[1]) * height;
    out[s * 3 + 2] = (wa * a[2] + wb * b[2]) * height;
  }
  return out;
}
