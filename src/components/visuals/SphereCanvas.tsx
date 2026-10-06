'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { clamp, easeInOutCubic, easeOutBack, easeOutExpo, prefersReducedMotion } from '@/lib/motion';
import { fibonacciSphere, greatCircleArc, rotationToFront, TAU, type Vec3 } from '@/lib/sphere-math';

/**
 * Sphere's "language intelligence" as a living object: a Fibonacci lattice of
 * points rendered in 3D on a 2D canvas. Key topics are joined by great-circle
 * arcs with signals travelling along them. On first view the points gather
 * into the sphere; after that it turns on its own, can be flung with inertia,
 * and a topic can be brought to the front from the buttons underneath.
 *
 * Performance: geometry is computed once into typed arrays, points are drawn
 * in a dozen batched paths (one per depth band, not one per point), nothing is
 * allocated per frame, and the loop stops when the sphere is off screen or the
 * tab is hidden. Reduced-motion visitors get a still frame they can still turn.
 */

export const SPHERE_TOPICS = [
  'publishing',
  'superyacht',
  'pharma',
  'headless',
  'ecommerce',
  'first-party data',
  'personalisation',
  'advertising',
  'archive',
  'council services',
];

interface SphereCanvasProps {
  /** Show topic labels next to the key nodes */
  labels?: boolean;
  /** Show buttons that turn a chosen topic to the front */
  controls?: boolean;
  /** Rendered underneath until the canvas draws (and if it never can) */
  fallback?: React.ReactNode;
  className?: string;
  label?: string;
}

const POINTS = 560;
const TILT = -0.38; // resting tilt, radians
const AUTO_SPIN = 0.2; // radians per second
const DRAG = 0.0065; // radians per pixel dragged
const SEGMENTS = 36; // per arc
const BUCKETS = 12; // depth bands for batched drawing
const INTRO_MS = 2600;
const HOLD_MS = 3200; // how long a chosen topic stays at the front
const INK = '20, 33, 77';
const EMBER = '255, 95, 46';

/** Stable pseudo-random number in [0, 1) for an index, so every visit looks the same. */
const noise = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export function SphereCanvas({
  labels = true,
  controls = false,
  fallback,
  className,
  label = 'A sphere of points representing content, with key topics linked into a network. Drag to turn it.',
}: SphereCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const focusRef = useRef<((topic: number) => void) | null>(null);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(-1);
  const topicsId = useId();

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!wrap || !canvas || !ctx) return; // the fallback stays visible

    const reduce = prefersReducedMotion();
    const topics = labels ? SPHERE_TOPICS : SPHERE_TOPICS.slice(0, 8);
    const K = topics.length;

    // ---------- Geometry (computed once) ----------
    const base = fibonacciSphere(POINTS);
    const vec = (i: number): Vec3 => [base[i * 3]!, base[i * 3 + 1]!, base[i * 3 + 2]!];
    const keys = topics.map((_, k) => Math.floor(((k + 0.5) / K) * (POINTS - 1)));

    // Link every key topic to its two nearest neighbours.
    const linkSet = new Set<string>();
    keys.forEach((a, i) => {
      const [ax, ay, az] = vec(a);
      keys
        .map((b, j) => {
          const [bx, by, bz] = vec(b);
          return { j, d: (ax - bx) ** 2 + (ay - by) ** 2 + (az - bz) ** 2 };
        })
        .filter(({ j }) => j !== i)
        .sort((p, q) => p.d - q.d)
        .slice(0, 2)
        .forEach(({ j }) => linkSet.add(`${Math.min(i, j)}-${Math.max(i, j)}`));
    });
    const links = [...linkSet].map((key) => key.split('-').map(Number) as [number, number]);
    const L = links.length;
    const STRIDE = SEGMENTS + 1;

    // Great-circle arcs between linked topics, lifted more the further they travel.
    const arcs = new Float32Array(L * STRIDE * 3);
    links.forEach(([a, b], l) => {
      const from = vec(keys[a]!);
      const to = vec(keys[b]!);
      const angle = Math.acos(clamp(from[0] * to[0] + from[1] * to[1] + from[2] * to[2], -1, 1));
      arcs.set(greatCircleArc(from, to, SEGMENTS, 0.06 + angle * 0.12), l * STRIDE * 3);
    });

    // Intro: each point starts scattered further out and swirls in on its own delay.
    const scatter = new Float32Array(POINTS * 3);
    const delays = new Float32Array(POINTS);
    for (let i = 0; i < POINTS; i++) {
      const [x, y, z] = vec(i);
      const radius = 1.35 + noise(i) * 0.95;
      const swirl = (noise(i + 911) - 0.5) * 1.8;
      scatter[i * 3] = (x * Math.cos(swirl) + z * Math.sin(swirl)) * radius;
      scatter[i * 3 + 1] = y * radius;
      scatter[i * 3 + 2] = (-x * Math.sin(swirl) + z * Math.cos(swirl)) * radius;
      delays[i] = noise(i + 4242) * 650;
    }

    // Signals travel along each arc; values past 1 are a pause before the next run.
    const signals = new Float32Array(L);
    const signalSpeed = new Float32Array(L);
    for (let l = 0; l < L; l++) {
      signals[l] = noise(l + 77) * 1.6;
      signalSpeed[l] = 0.18 + noise(l + 501) * 0.16;
    }

    // ---------- Per-frame buffers (reused) ----------
    const proj = new Float32Array(POINTS * 3);
    const grow = new Float32Array(POINTS);
    const bucket = new Uint8Array(POINTS);
    const counts = new Uint16Array(BUCKETS);
    const starts = new Uint16Array(BUCKETS);
    const cursor = new Uint16Array(BUCKETS);
    const order = new Uint16Array(POINTS);
    const arcProj = new Float32Array(arcs.length);
    const keyPos = new Float32Array(K * 3);
    const pointStyles = Array.from({ length: BUCKETS }, (_, b) => {
      const depth = (b + 0.5) / BUCKETS;
      return `rgba(${INK}, ${(0.05 + Math.pow(depth, 1.4) * 0.74).toFixed(3)})`;
    });

    // ---------- State ----------
    let rotY = 0.8;
    let rotX = TILT;
    let tiltTarget = TILT;
    let velY = reduce ? 0 : AUTO_SPIN;
    let velX = 0;
    let dragging = false;
    let moved = 0;
    let lastX = 0;
    let lastY = 0;
    let lastMoveAt = 0;
    let hovered = -1;
    let focused = -1;
    let holdUntil = 0;
    let tween: { fromY: number; fromX: number; toY: number; toX: number; start: number } | null = null;
    let introStarted = false;
    let introT = 0; // ms of intro played; advances only while the loop runs
    let introDone = reduce;
    let disposed = false;
    let frame = 0;
    let visible = false; // the observer starts the loop once the sphere is on screen
    let width = 0;
    let dpr = 1;
    let last = 0;
    let glow: CanvasGradient | null = null;
    let warmth: CanvasGradient | null = null;
    let fontSize = 13;
    let labelWidths: number[] = [];
    const font = getComputedStyle(canvas).fontFamily || 'sans-serif';

    const isLit = (l: number) => {
      const [a, b] = links[l]!;
      return a === focused || b === focused || a === hovered || b === hovered;
    };

    // Stroke the unlit arcs on one side of the sphere, in three depth bands.
    const strokeArcs = (front: boolean, reveal: number) => {
      const end = reveal * SEGMENTS;
      for (let band = 0; band < 3; band++) {
        ctx.beginPath();
        let any = false;
        for (let l = 0; l < L; l++) {
          if (isLit(l)) continue;
          for (let s = 0; s < end; s++) {
            const a = (l * STRIDE + s) * 3;
            const b = a + 3;
            const zm = (arcProj[a + 2]! + arcProj[b + 2]!) / 2;
            if ((zm >= 0) !== front || Math.min(2, Math.floor(Math.abs(zm) * 3)) !== band) continue;
            const f = Math.min(1, end - s); // the last segment grows in during the intro
            ctx.moveTo(arcProj[a]!, arcProj[a + 1]!);
            ctx.lineTo(arcProj[a]! + (arcProj[b]! - arcProj[a]!) * f, arcProj[a + 1]! + (arcProj[b + 1]! - arcProj[a + 1]!) * f);
            any = true;
          }
        }
        if (!any) continue;
        const alpha = front ? 0.28 + band * 0.22 : 0.15 - band * 0.045;
        ctx.strokeStyle = `rgba(${EMBER}, ${alpha})`;
        ctx.stroke();
      }
    };

    const drawNode = (q: number, now: number, t: number, k: number) => {
      const x = keyPos[q * 3]!;
      const y = keyPos[q * 3 + 1]!;
      const z = keyPos[q * 3 + 2]!;
      const depth = clamp((z + 1) / 2, 0, 1);
      const lit = q === focused || q === hovered;
      const pop = introDone ? 1 : easeOutBack(clamp((t - 550 - q * 60) / 600, 0, 1));
      if (pop <= 0) return;
      const r = (2.6 + depth * 3.2 + (lit ? 2.2 : 0)) * k * pop;
      if (!reduce && z > 0.05) {
        // A soft ping, staggered per topic
        const p = (now / 3400 + q * 0.173) % 1;
        ctx.strokeStyle = `rgba(${EMBER}, ${(1 - p) * (1 - p) * 0.5 * depth * pop})`;
        ctx.lineWidth = 1.2 * k;
        ctx.beginPath();
        ctx.arc(x, y, r + p * 24 * k, 0, TAU);
        ctx.stroke();
      }
      if (lit && z > -0.1) {
        ctx.fillStyle = `rgba(${EMBER}, 0.16)`;
        ctx.beginPath();
        ctx.arc(x, y, r + 7 * k, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = `rgba(${EMBER}, ${0.3 + depth * 0.7})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
      if (z > 0) {
        ctx.strokeStyle = `rgba(245, 246, 250, ${depth})`;
        ctx.lineWidth = 2 * k;
        ctx.stroke();
      }
    };

    const draw = (now: number) => {
      const size = width;
      if (!size) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      const c = size / 2;
      const R = size * 0.36;
      const k = clamp(size / 520, 0.4, 1.2);
      const t = introDone ? INTRO_MS : introT;
      const fade = clamp(t / 700, 0, 1);
      const arcReveal = easeInOutCubic(clamp((t - 650) / 1200, 0, 1));
      const labelReveal = clamp((t - 1500) / 700, 0, 1);
      const signalReveal = clamp((t - 1700) / 700, 0, 1);
      const cy = Math.cos(rotY);
      const sy = Math.sin(rotY);
      const cx = Math.cos(rotX);
      const sx = Math.sin(rotX);

      // Atmosphere: a cool glow behind, a little warmth low on the right
      ctx.globalAlpha = fade;
      if (glow) {
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, size, size);
      }
      if (warmth) {
        ctx.fillStyle = warmth;
        ctx.fillRect(0, 0, size, size);
      }
      // A thin halo and a slowly turning dashed orbit
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${INK}, 0.08)`;
      ctx.beginPath();
      ctx.arc(c, c, R * 1.2, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([2 * k, 9 * k]);
      ctx.lineDashOffset = reduce ? 0 : -now / 60;
      ctx.strokeStyle = `rgba(${INK}, 0.16)`;
      ctx.beginPath();
      ctx.arc(c, c, R * 1.31, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // Project the lattice, easing each point in from its scattered start during the intro
      counts.fill(0);
      for (let i = 0; i < POINTS; i++) {
        const o = i * 3;
        let x0 = base[o]!;
        let y0 = base[o + 1]!;
        let z0 = base[o + 2]!;
        let g = 1;
        if (!introDone) {
          g = easeOutExpo(clamp((t - delays[i]!) / 1400, 0, 1));
          x0 = scatter[o]! + (x0 - scatter[o]!) * g;
          y0 = scatter[o + 1]! + (y0 - scatter[o + 1]!) * g;
          z0 = scatter[o + 2]! + (z0 - scatter[o + 2]!) * g;
        }
        const x1 = x0 * cy + z0 * sy;
        const z1 = -x0 * sy + z0 * cy;
        const y2 = y0 * cx - z1 * sx;
        const z2 = y0 * sx + z1 * cx;
        const s = 1 + z2 * 0.12; // a touch of perspective
        proj[o] = c + x1 * R * s;
        proj[o + 1] = c + y2 * R * s;
        proj[o + 2] = z2;
        grow[i] = g;
        const b = Math.min(BUCKETS - 1, Math.max(0, Math.floor(((z2 + 1) / 2) * BUCKETS)));
        bucket[i] = b;
        counts[b]!++;
      }
      // Counting sort by depth band, so each band is one path and one fill
      let total = 0;
      for (let b = 0; b < BUCKETS; b++) {
        starts[b] = total;
        total += counts[b]!;
      }
      cursor.set(starts);
      for (let i = 0; i < POINTS; i++) order[cursor[bucket[i]!]!++] = i;

      for (let j = 0; j < arcProj.length; j += 3) {
        const x0 = arcs[j]!;
        const y0 = arcs[j + 1]!;
        const z0 = arcs[j + 2]!;
        const x1 = x0 * cy + z0 * sy;
        const z1 = -x0 * sy + z0 * cy;
        const y2 = y0 * cx - z1 * sx;
        const z2 = y0 * sx + z1 * cx;
        const s = 1 + z2 * 0.12;
        arcProj[j] = c + x1 * R * s;
        arcProj[j + 1] = c + y2 * R * s;
        arcProj[j + 2] = z2;
      }
      for (let q = 0; q < K; q++) {
        const i = keys[q]!;
        keyPos[q * 3] = proj[i * 3]!;
        keyPos[q * 3 + 1] = proj[i * 3 + 1]!;
        keyPos[q * 3 + 2] = proj[i * 3 + 2]!;
      }

      // Points, back to front. Arcs and nodes on the far side go in before the near half.
      for (let b = 0; b < BUCKETS; b++) {
        if (b === BUCKETS / 2) {
          ctx.lineWidth = 1.2 * k;
          strokeArcs(false, arcReveal);
          for (let q = 0; q < K; q++) if (keyPos[q * 3 + 2]! < 0) drawNode(q, now, t, k);
        }
        const n = counts[b]!;
        if (!n) continue;
        const radius = (0.5 + ((b + 0.5) / BUCKETS) * 1.7) * k;
        ctx.beginPath();
        for (let q = starts[b]!; q < starts[b]! + n; q++) {
          const i = order[q]!;
          const r = radius * grow[i]!;
          if (r < 0.05) continue;
          const x = proj[i * 3]!;
          const y = proj[i * 3 + 1]!;
          ctx.moveTo(x + r, y);
          ctx.arc(x, y, r, 0, TAU);
        }
        ctx.fillStyle = pointStyles[b]!;
        ctx.fill();
      }
      ctx.lineWidth = 1.3 * k;
      strokeArcs(true, arcReveal);

      // Arcs of the hovered or chosen topic, drawn over everything else
      if (focused >= 0 || hovered >= 0) {
        ctx.lineWidth = 2.2 * k;
        for (let l = 0; l < L; l++) {
          if (!isLit(l)) continue;
          for (let s = 0; s < SEGMENTS * arcReveal; s++) {
            const a = (l * STRIDE + s) * 3;
            const zm = (arcProj[a + 2]! + arcProj[a + 5]!) / 2;
            ctx.strokeStyle = `rgba(${EMBER}, ${zm >= 0 ? 0.95 : 0.3})`;
            ctx.beginPath();
            ctx.moveTo(arcProj[a]!, arcProj[a + 1]!);
            ctx.lineTo(arcProj[a + 3]!, arcProj[a + 4]!);
            ctx.stroke();
          }
        }
      }

      // Signals: a bright head with a fading tail, following each arc
      if (signalReveal > 0 && !reduce) {
        for (let l = 0; l < L; l++) {
          for (let tail = 6; tail >= 0; tail--) {
            let u = signals[l]! - tail * 0.018;
            if (u < 0 || u > 1) continue;
            if (l % 2) u = 1 - u; // alternate directions
            const pos = u * SEGMENTS;
            const s = Math.min(SEGMENTS - 1, Math.floor(pos));
            const f = pos - s;
            const a = (l * STRIDE + s) * 3;
            const x = arcProj[a]! + (arcProj[a + 3]! - arcProj[a]!) * f;
            const y = arcProj[a + 1]! + (arcProj[a + 4]! - arcProj[a + 1]!) * f;
            const z = arcProj[a + 2]! + (arcProj[a + 5]! - arcProj[a + 2]!) * f;
            const depth = clamp((z + 1) / 2, 0, 1);
            const alpha = signalReveal * (1 - tail / 7) * (0.12 + depth * 0.88);
            if (tail === 0) {
              ctx.fillStyle = `rgba(${EMBER}, ${alpha * 0.18})`;
              ctx.beginPath();
              ctx.arc(x, y, 6.5 * k, 0, TAU);
              ctx.fill();
            }
            ctx.fillStyle = `rgba(${EMBER}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, (2.6 - tail * 0.25) * k * (0.65 + depth * 0.45), 0, TAU);
            ctx.fill();
          }
        }
      }

      for (let q = 0; q < K; q++) if (keyPos[q * 3 + 2]! >= 0) drawNode(q, now, t, k);

      // Labels for topics facing us, kept inside the canvas
      if (labels && labelReveal > 0) {
        ctx.font = `600 ${fontSize}px ${font}`;
        ctx.textBaseline = 'middle';
        const h = fontSize + 10;
        const pad = 8;
        for (let q = 0; q < K; q++) {
          const z = keyPos[q * 3 + 2]!;
          const lit = q === focused || q === hovered;
          if (z < (lit ? -0.05 : 0.12)) continue;
          const alpha = (lit ? 1 : Math.min(1, (z - 0.12) * 2.6)) * labelReveal;
          if (alpha < 0.02) continue;
          const x = keyPos[q * 3]!;
          const y = keyPos[q * 3 + 1]!;
          const w = (labelWidths[q] ?? 0) + pad * 2;
          let lx = x + 12 * k;
          if (lx + w > size - 4) lx = x - 12 * k - w;
          const ly = clamp(y - 14 * k, h / 2 + 2, size - h / 2 - 2);
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(lx, ly - h / 2, w, h, h / 2);
          else ctx.rect(lx, ly - h / 2, w, h);
          ctx.fillStyle = lit ? `rgba(${INK}, ${alpha})` : `rgba(255, 255, 255, ${alpha * 0.94})`;
          ctx.fill();
          if (!lit) {
            ctx.strokeStyle = `rgba(${INK}, ${alpha * 0.1})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
          ctx.fillStyle = lit ? `rgba(255, 255, 255, ${alpha})` : `rgba(${INK}, ${alpha})`;
          ctx.fillText(topics[q]!, lx + pad, ly + 0.5);
        }
      }
    };

    const tick = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      if (!introStarted) {
        introStarted = true;
        velY = 1.6; // arrive with a swirl that settles into the idle spin
      }
      if (!introDone) {
        introT += dt * 1000;
        if (introT > INTRO_MS) introDone = true;
      }

      if (tween) {
        const p = clamp((now - tween.start) / 1100, 0, 1);
        const e = easeInOutCubic(p);
        rotY = tween.fromY + (tween.toY - tween.fromY) * e;
        rotX = tween.fromX + (tween.toX - tween.fromX) * e;
        if (p >= 1) {
          tween = null;
          holdUntil = now + HOLD_MS;
          velY = 0;
          velX = 0;
        }
      } else if (!dragging) {
        const holding = now < holdUntil;
        if (!holding) tiltTarget = TILT;
        const spin = holding ? 0 : hovered >= 0 ? AUTO_SPIN * 0.2 : AUTO_SPIN;
        velY += (spin - velY) * (1 - Math.exp(-dt * 1.4));
        velX *= Math.exp(-dt * 3.5);
        rotX += (tiltTarget - rotX) * (1 - Math.exp(-dt * 1.1));
        rotY += velY * dt;
        rotX = clamp(rotX + velX * dt, -1.2, 1.2);
      }
      for (let l = 0; l < L; l++) signals[l] = (signals[l]! + signalSpeed[l]! * dt) % 1.6;
      draw(now);
      frame = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (reduce || frame || !visible || document.hidden) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const redraw = () => {
      if (!frame) draw(performance.now());
    };

    const focus = (topic: number) => {
      if (topic < 0 || topic >= K) return;
      const target = rotationToFront(vec(keys[topic]!), rotY);
      const toX = clamp(target.rotX, -1, 1);
      focused = topic;
      tiltTarget = toX;
      if (reduce || !frame) {
        rotY = target.rotY;
        rotX = toX;
        holdUntil = performance.now() + HOLD_MS;
        velY = 0;
        redraw();
        return;
      }
      tween = { fromY: rotY, fromX: rotX, toY: target.rotY, toX, start: performance.now() };
    };
    focusRef.current = focus;

    const measure = () => {
      fontSize = clamp(Math.round(width / 38), 11, 15);
      ctx.font = `600 ${fontSize}px ${font}`;
      labelWidths = topics.map((topic) => ctx.measureText(topic).width);
    };

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = wrap.getBoundingClientRect().width;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(width * dpr);
      const c = width / 2;
      const R = width * 0.36;
      // Both gradients fade out before the canvas edge, so the square never shows.
      glow = ctx.createRadialGradient(c, c, R * 0.15, c, c, R * 1.38);
      glow.addColorStop(0, 'rgba(175, 192, 255, 0.34)');
      glow.addColorStop(0.55, 'rgba(175, 192, 255, 0.13)');
      glow.addColorStop(1, 'rgba(175, 192, 255, 0)');
      warmth = ctx.createRadialGradient(c + R * 0.4, c + R * 0.45, 0, c + R * 0.4, c + R * 0.45, R * 0.8);
      warmth.addColorStop(0, `rgba(${EMBER}, 0.1)`);
      warmth.addColorStop(1, `rgba(${EMBER}, 0)`);
      measure();
      draw(performance.now());
    };

    // ---------- Pointer: hover a topic, click to focus it, drag to turn with inertia ----------
    const hitTest = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      let best = -1;
      let bestD = 22 * 22;
      for (let q = 0; q < K; q++) {
        if (keyPos[q * 3 + 2]! < 0.1) continue;
        const d = (keyPos[q * 3]! - px) ** 2 + (keyPos[q * 3 + 1]! - py) ** 2;
        if (d < bestD) {
          bestD = d;
          best = q;
        }
      }
      return best;
    };
    const setHovered = (next: number) => {
      if (next === hovered) return;
      hovered = next;
      canvas.style.cursor = next >= 0 && !dragging ? 'pointer' : '';
      redraw();
    };

    const onDown = (event: PointerEvent) => {
      dragging = true;
      moved = 0;
      lastX = event.clientX;
      lastY = event.clientY;
      lastMoveAt = performance.now();
      tween = null;
      holdUntil = 0;
      velX = 0;
      velY = 0; // grabbing the sphere stops it, like a globe
      hovered = hitTest(event.clientX, event.clientY);
      canvas.setPointerCapture?.(event.pointerId);
      canvas.classList.add('is-dragging');
    };
    const onMove = (event: PointerEvent) => {
      if (!dragging) {
        setHovered(hitTest(event.clientX, event.clientY));
        return;
      }
      const now = performance.now();
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      const seconds = Math.max(0.008, (now - lastMoveAt) / 1000);
      lastX = event.clientX;
      lastY = event.clientY;
      lastMoveAt = now;
      moved += Math.abs(dx) + Math.abs(dy);
      rotY += dx * DRAG;
      rotX = clamp(rotX + dy * DRAG, -1.2, 1.2);
      velY = clamp(velY * 0.5 + ((dx * DRAG) / seconds) * 0.5, -8, 8);
      velX = clamp(velX * 0.5 + ((dy * DRAG) / seconds) * 0.5, -8, 8);
      if (moved > 6) hovered = -1;
      redraw();
    };
    const release = (event: PointerEvent, cancelled: boolean) => {
      if (!dragging) return;
      dragging = false;
      canvas.classList.remove('is-dragging');
      const tapped = moved < 6;
      // Held still before letting go, or just tapped: no fling
      if (tapped || reduce || performance.now() - lastMoveAt > 90) velX = velY = 0;
      if (tapped && !cancelled) {
        const hit = hitTest(event.clientX, event.clientY);
        if (hit >= 0) {
          focus(hit);
          setActive(hit);
        }
      }
      redraw();
    };
    const onUp = (event: PointerEvent) => release(event, false);
    const onCancel = (event: PointerEvent) => release(event, true);
    const onLeave = () => {
      if (!dragging) setHovered(-1);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onCancel);
    canvas.addEventListener('pointerleave', onLeave);

    const io = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) startLoop();
      else stop();
    });
    io.observe(wrap);
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    const onVisibility = () => (document.hidden ? stop() : startLoop());
    document.addEventListener('visibilitychange', onVisibility);
    // Label widths depend on the web font; measure again once it has loaded.
    document.fonts?.ready.then(() => {
      if (disposed) return;
      measure();
      redraw();
    });

    resize();
    setReady(true);

    return () => {
      disposed = true;
      stop();
      focusRef.current = null;
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onCancel);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, [labels]);

  const sphere = (
    <div
      ref={wrapRef}
      className={`sphere${ready ? ' sphere--ready' : ''}${!controls && className ? ` ${className}` : ''}`}
    >
      {fallback ? (
        <div className="sphere__fallback" aria-hidden="true">
          {fallback}
        </div>
      ) : null}
      <canvas ref={canvasRef} className="sphere__canvas" role="img" aria-label={label} />
    </div>
  );

  if (!controls) return sphere;

  return (
    <div className={`sphere-explorer${className ? ` ${className}` : ''}`}>
      {sphere}
      <div className={`sphere-topics${ready ? ' sphere-topics--ready' : ''}`}>
        <p className="sphere-topics__label" id={topicsId}>
          Bring a topic to the front
        </p>
        <ul className="sphere-topics__list" aria-labelledby={topicsId}>
          {SPHERE_TOPICS.map((topic, k) => (
            <li key={topic}>
              <button
                type="button"
                className="sphere-topics__chip"
                aria-pressed={active === k}
                onClick={() => {
                  setActive(k);
                  focusRef.current?.(k);
                }}
              >
                {topic}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
