'use client';

import { useEffect, useRef } from 'react';
import { clamp, prefersReducedMotion } from '@/lib/motion';

/**
 * A backdrop of small tiles taken from the Byte9 mark. On the home page it
 * gathers around the page builder demo; on inner pages it fills the space
 * beside the intro. A slow wave moves through it, the odd tile lights up ember
 * (like the one ember square in the logo), and tiles near the pointer warm up.
 * It ripples out from its anchor on load and always keeps clear of the text.
 *
 * Drawn on one canvas in a handful of batched paths; paused off screen and in
 * background tabs; a single still frame for reduced motion. Purely decorative.
 */

const PITCH = 26; // px between tile centres
const TILE = 4; // px
const LEVELS = 8; // alpha bands for batched drawing
const SPOT_RADIUS = 170;
const SPARK_MS = 1800;
const KEEP_CLEAR = 70;
const INK = '20, 33, 77';
const EMBER = '255, 95, 46';

const levelStyles = Array.from({ length: LEVELS }, (_, l) => `rgba(${INK}, ${(0.03 + (l / (LEVELS - 1)) * 0.17).toFixed(3)})`);

interface TileFieldProps {
  /** Element (inside the parent) to gather around; without one the field sits on the right */
  anchor?: string;
  /** Elements (inside the parent) to keep clear of, usually the copy */
  avoid?: string;
  className?: string;
}

export function TileField({ anchor, avoid, className }: TileFieldProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !host || !ctx) return;

    const reduce = prefersReducedMotion();
    let width = 0;
    let height = 0;
    let dpr = 1;
    let cols = 0;
    let rows = 0;
    let offsetX = 0;
    let offsetY = 0;
    let focusX = 0;
    let focusY = 0;
    let reach = 1;
    let mask = new Float32Array(0);
    let dist = new Float32Array(0);
    let level = new Uint8Array(0);
    let frame = 0;
    let visible = false;
    let elapsed = 0; // ms the field has been animating, for the load ripple
    let last = 0;
    let disposed = false;
    // Pointer spotlight eases towards the pointer and fades in and out.
    let spotX = 0;
    let spotY = 0;
    let targetX = 0;
    let targetY = 0;
    let spot = 0;
    let spotTarget = 0;
    const sparks: { cell: number; age: number }[] = [];
    let untilSpark = 400;
    let seed = 7;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const layout = () => {
      const rect = host.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      cols = Math.floor(width / PITCH) + 1;
      rows = Math.floor(height / PITCH) + 1;
      offsetX = (width - (cols - 1) * PITCH) / 2;
      offsetY = (height - (rows - 1) * PITCH) / 2;

      // Gather the field around the anchor, wherever the layout has put it.
      const target = anchor ? host.querySelector(anchor)?.getBoundingClientRect() : undefined;
      focusX = target ? target.left - rect.left + target.width / 2 : width * 0.82;
      focusY = target ? target.top - rect.top + target.height / 2 : height * 0.5;
      const rx = target ? target.width * 0.95 : width * 0.42;
      const ry = target ? target.height * 1.05 : height * 1.1;
      reach = Math.hypot(rx, ry);
      // Keep the copy clear: tiles fade out within KEEP_CLEAR px of any text block.
      // Measure the content, not the block: a full-width paragraph only clears its actual lines.
      const clearOf = avoid
        ? [...host.querySelectorAll(avoid)].map((el) => {
            const range = document.createRange();
            range.selectNodeContents(el);
            const content = range.getBoundingClientRect();
            const r = content.width ? content : el.getBoundingClientRect();
            return [r.left - rect.left, r.top - rect.top, r.right - rect.left, r.bottom - rect.top] as const;
          })
        : [];

      mask = new Float32Array(cols * rows);
      dist = new Float32Array(cols * rows);
      level = new Uint8Array(cols * rows);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = offsetX + c * PITCH;
          const y = offsetY + r * PITCH;
          const dx = (x - focusX) / rx;
          const dy = (y - focusY) / ry;
          const edge = clamp(y / 90, 0, 1) * clamp((height - y) / 90, 0, 1);
          let clear = 1;
          for (const [l, t, rr, b] of clearOf) {
            const ex = Math.max(l - x, 0, x - rr);
            const ey = Math.max(t - y, 0, y - b);
            clear = Math.min(clear, clamp(Math.hypot(ex, ey) / KEEP_CLEAR, 0, 1));
          }
          const m = clamp(1 - (dx * dx + dy * dy), 0, 1) * edge;
          mask[r * cols + c] = m * m * clear;
          dist[r * cols + c] = Math.hypot(x - focusX, y - focusY) / reach;
        }
      }
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const t = reduce ? 0 : elapsed;
      const ripple = reduce ? 9 : (t / 1500) * 1.6; // how far the load ripple has spread
      const n = cols * rows;

      // Base tiles: a slow diagonal wave, banded by brightness so each band is one fill.
      for (let i = 0; i < n; i++) {
        const m = mask[i]!;
        if (m < 0.01) {
          level[i] = 0;
          continue;
        }
        const x = offsetX + (i % cols) * PITCH;
        const y = offsetY + Math.floor(i / cols) * PITCH;
        const wave = 0.5 + 0.5 * Math.sin(x * 0.011 + y * 0.007 - t * 0.0005);
        const shown = clamp((ripple - dist[i]!) / 0.35, 0, 1);
        level[i] = Math.round(m * (0.3 + 0.7 * wave) * shown * (LEVELS - 1));
      }
      for (let l = 1; l < LEVELS; l++) {
        ctx.beginPath();
        let any = false;
        for (let i = 0; i < n; i++) {
          if (level[i] !== l) continue;
          ctx.rect(offsetX + (i % cols) * PITCH - TILE / 2, offsetY + Math.floor(i / cols) * PITCH - TILE / 2, TILE, TILE);
          any = true;
        }
        if (!any) continue;
        ctx.fillStyle = levelStyles[l]!;
        ctx.fill();
      }

      // Spotlight: tiles near the pointer warm to ember and grow a little.
      if (spot > 0.01) {
        const c0 = Math.max(0, Math.floor((spotX - SPOT_RADIUS - offsetX) / PITCH));
        const c1 = Math.min(cols - 1, Math.ceil((spotX + SPOT_RADIUS - offsetX) / PITCH));
        const r0 = Math.max(0, Math.floor((spotY - SPOT_RADIUS - offsetY) / PITCH));
        const r1 = Math.min(rows - 1, Math.ceil((spotY + SPOT_RADIUS - offsetY) / PITCH));
        for (let r = r0; r <= r1; r++) {
          for (let c = c0; c <= c1; c++) {
            const x = offsetX + c * PITCH;
            const y = offsetY + r * PITCH;
            const d = Math.hypot(x - spotX, y - spotY) / SPOT_RADIUS;
            if (d >= 1) continue;
            const s = (1 - d) * (1 - d) * spot * Math.sqrt(mask[r * cols + c]!);
            if (s < 0.02) continue;
            const size = TILE + s * 4;
            ctx.fillStyle = `rgba(${EMBER}, ${(s * 0.75).toFixed(3)})`;
            ctx.fillRect(x - size / 2, y - size / 2, size, size);
          }
        }
      }

      // Sparks: a tile lights up ember, then fades, like the ember square in the mark.
      for (const spark of sparks) {
        const p = spark.age / SPARK_MS;
        const a = Math.sin(Math.PI * p);
        const x = offsetX + (spark.cell % cols) * PITCH;
        const y = offsetY + Math.floor(spark.cell / cols) * PITCH;
        const size = TILE + 2.5 * a;
        ctx.fillStyle = `rgba(${EMBER}, ${(a * 0.9).toFixed(3)})`;
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
      }
    };

    const tick = (now: number) => {
      const dt = last ? Math.min(50, now - last) : 16;
      last = now;
      elapsed += dt;
      const ease = 1 - Math.exp(-dt / 90);
      spotX += (targetX - spotX) * ease;
      spotY += (targetY - spotY) * ease;
      spot += (spotTarget - spot) * (1 - Math.exp(-dt / 240));

      untilSpark -= dt;
      if (untilSpark <= 0 && elapsed > 1200) {
        untilSpark = 260 + random() * 420;
        for (let tries = 0; tries < 12 && sparks.length < 14; tries++) {
          const cell = Math.floor(random() * cols * rows);
          if (mask[cell]! > 0.3) {
            sparks.push({ cell, age: 0 });
            break;
          }
        }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        sparks[i]!.age += dt;
        if (sparks[i]!.age >= SPARK_MS) sparks.splice(i, 1);
      }

      draw();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      // Hidden on small screens by CSS: nothing to animate
      if (reduce || frame || !visible || document.hidden || !canvas.offsetWidth) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const rect = host.getBoundingClientRect();
      targetX = event.clientX - rect.left;
      targetY = event.clientY - rect.top;
      if (spot < 0.01) {
        spotX = targetX;
        spotY = targetY;
      }
      spotTarget = 1;
    };
    const onLeave = () => {
      spotTarget = 0;
    };
    if (!reduce) {
      host.addEventListener('pointermove', onMove, { passive: true });
      host.addEventListener('pointerleave', onLeave);
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) start();
      else stop();
    });
    io.observe(host);
    const ro = new ResizeObserver(() => {
      if (disposed) return;
      layout();
      draw();
      start();
    });
    ro.observe(host);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);

    layout();
    draw();

    return () => {
      disposed = true;
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
    };
  }, [anchor, avoid]);

  return <canvas ref={ref} className={`tile-field${className ? ` ${className}` : ''}`} aria-hidden="true" />;
}
