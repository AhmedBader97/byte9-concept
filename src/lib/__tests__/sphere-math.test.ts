import { fibonacciSphere, greatCircleArc, rotatePoint, rotationToFront, TAU, type Vec3 } from '../sphere-math';

const length = (x: number, y: number, z: number) => Math.hypot(x, y, z);
const at = (points: Float32Array, i: number): Vec3 => [points[i * 3]!, points[i * 3 + 1]!, points[i * 3 + 2]!];

describe('fibonacciSphere', () => {
  it('puts every point on the unit sphere, from pole to pole', () => {
    const points = fibonacciSphere(200);
    for (let i = 0; i < 200; i++) expect(length(...at(points, i))).toBeCloseTo(1, 5);
    expect(points[1]).toBeCloseTo(1);
    expect(points[199 * 3 + 1]).toBeCloseTo(-1);
  });
});

describe('rotationToFront', () => {
  const samples: Vec3[] = [
    [1, 0, 0],
    [0, 0, -1],
    [0.6, 0.48, -0.64],
    [-0.36, -0.8, 0.48],
  ];

  it.each(samples)('turns (%p, %p, %p) to face the viewer', (...point) => {
    const { rotY, rotX } = rotationToFront(point);
    const [x, y, z] = rotatePoint(point, rotY, rotX);
    expect(x).toBeCloseTo(0, 6);
    expect(y).toBeCloseTo(0, 6);
    expect(z).toBeCloseTo(1, 6);
  });

  it('takes the short way round from wherever the sphere is', () => {
    const current = 5 * TAU + 0.3;
    const { rotY } = rotationToFront([0.6, 0.48, -0.64], current);
    expect(Math.abs(rotY - current)).toBeLessThanOrEqual(Math.PI);
  });
});

describe('greatCircleArc', () => {
  const a: Vec3 = [1, 0, 0];
  const b: Vec3 = [0, 0, 1];

  it('starts and ends on the two points and lifts off in the middle', () => {
    const arc = greatCircleArc(a, b, 10, 0.2);
    expect(at(arc, 0).map((n) => +n.toFixed(6))).toEqual([1, 0, 0]);
    expect(at(arc, 10).map((n) => +n.toFixed(6))).toEqual([0, 0, 1]);
    expect(length(...at(arc, 5))).toBeCloseTo(1.2, 5);
  });

  it('stays in the plane of the two points', () => {
    const arc = greatCircleArc(a, b, 12, 0.1);
    // The normal of the plane through a, b and the origin is the y axis.
    for (let s = 0; s <= 12; s++) expect(arc[s * 3 + 1]).toBeCloseTo(0, 6);
  });
});
