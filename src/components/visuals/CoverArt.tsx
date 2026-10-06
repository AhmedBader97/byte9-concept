import type { CoverStyle } from '@/content/types';

/**
 * Generated cover art. Replaces stock photography with deterministic SVG
 * compositions: each sector gets its own visual language, and the slug seeds
 * the details so every cover is unique but stable between builds.
 */

const W = 640;
const H = 400;
const INK = '#14214d';
const RAISED = '#1d2c63';
const EMBER = '#ff5f2e';
const SKY = '#afc0ff';
const PAPER = '#f5f6fa';
const LINE = '#d9deea';
const WHITE = '#ffffff';

/** Small, fast seeded PRNG (mulberry32 over an FNV-1a hash of the seed). */
export function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (n: number) => Math.round(n * 10) / 10;

function Masthead({ rand, initial }: { rand: () => number; initial: string }) {
  // Alternate light and dark editions so neighbouring covers differ.
  const light = rand() > 0.5;
  const textTone = light ? INK : WHITE;
  const columns = [0, 1, 2].map((c) => {
    const x = 334 + c * 96;
    return Array.from({ length: 12 }, (_, l) => {
      const endOfParagraph = l % 4 === 3;
      const width = endOfParagraph ? 30 + rand() * 30 : 74 - rand() * 10;
      return (
        <rect
          key={`${c}-${l}`}
          x={x}
          y={92 + l * 22}
          width={round(width)}
          height="7"
          rx="3.5"
          fill={textTone}
          opacity={light ? 0.16 : 0.2}
          className="cover__line"
          style={{ '--l': c * 12 + l } as React.CSSProperties}
        />
      );
    });
  });
  if (light) {
    return (
      <>
        <rect width={W} height={H} fill={WHITE} />
        <text
          x="-18"
          y={H + 70}
          className="cover__initial"
          style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
          fontSize="600"
          fontWeight="600"
          fill={EMBER}
        >
          {initial}
        </text>
        <rect x="334" y="44" width="266" height="12" rx="3" fill={INK} />
        <rect x="334" y="66" width="266" height="1.5" fill={INK} opacity="0.3" />
        {columns}
      </>
    );
  }
  return (
    <>
      <rect width={W} height={H} fill={INK} />
      <text
        x="-18"
        y={H + 70}
        className="cover__initial"
        style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
        fontSize="600"
        fontWeight="600"
        fill={EMBER}
      >
        {initial}
      </text>
      <rect x="334" y="44" width="266" height="12" rx="3" fill={WHITE} opacity="0.92" />
      <rect x="334" y="66" width="266" height="1.5" fill={WHITE} opacity="0.35" />
      {columns}
    </>
  );
}

function Waves({ rand }: { rand: () => number }) {
  const highlight = 4 + Math.floor(rand() * 6);
  const paths = Array.from({ length: 14 }, (_, i) => {
    const base = 34 + i * 26;
    const amp = 6 + rand() * 16;
    const freq = 1.2 + rand() * 1.6;
    const phase = rand() * Math.PI * 2;
    let d = '';
    for (let x = -20; x <= W + 20; x += 16) {
      const y = base + amp * Math.sin((freq * x * Math.PI * 2) / W + phase);
      d += `${d ? 'L' : 'M'}${x} ${round(y)} `;
    }
    const lit = i === highlight;
    if (lit) {
      // The lit wave carries a bright signal that travels along it.
      return (
        <g key={i}>
          <path d={d.trim()} fill="none" stroke={EMBER} strokeWidth={3} strokeLinecap="round" />
          <path
            d={d.trim()}
            pathLength={1}
            fill="none"
            stroke="#ffd2c2"
            strokeWidth={4}
            strokeLinecap="round"
            className="cover__signal"
          />
        </g>
      );
    }
    return (
      <path
        key={i}
        d={d.trim()}
        fill="none"
        stroke={SKY}
        strokeWidth={2}
        opacity={round(0.25 + rand() * 0.35)}
        strokeLinecap="round"
        className="cover__wave"
        style={{ '--w': i } as React.CSSProperties}
      />
    );
  });
  return (
    <>
      <rect width={W} height={H} fill={RAISED} />
      <rect y={H / 2} width={W} height={H / 2} fill={INK} opacity="0.6" />
      {paths}
    </>
  );
}

function Catalogue({ rand }: { rand: () => number }) {
  const size = 104;
  const gap = 16;
  const cols = 5;
  const rows = 3;
  const x0 = (W - (cols * size + (cols - 1) * gap)) / 2;
  const y0 = (H - (rows * size + (rows - 1) * gap)) / 2;
  const lit = Math.floor(rand() * cols * rows);
  const tiles = Array.from({ length: cols * rows }, (_, i) => {
    const x = x0 + (i % cols) * (size + gap);
    const y = y0 + Math.floor(i / cols) * (size + gap);
    const shape = rand();
    const isLit = i === lit;
    const fill = isLit ? EMBER : shape > 0.66 ? SKY : INK;
    return (
      <g key={i} className={isLit ? 'cover__lit' : undefined}>
        <rect x={x} y={y} width={size} height={size} rx="10" fill={WHITE} stroke={LINE} strokeWidth="1.5" />
        {shape > 0.5 ? (
          <circle cx={x + size / 2} cy={y + 44} r={22 + round(rand() * 6)} fill={fill} opacity={isLit ? 1 : 0.85} />
        ) : (
          <rect x={x + 30} y={y + 20} width="44" height="48" rx="6" fill={fill} opacity={isLit ? 1 : 0.85} />
        )}
        <rect x={x + 18} y={y + 80} width={isLit ? 46 : 34} height="9" rx="4.5" fill={isLit ? EMBER : LINE} />
      </g>
    );
  });
  return (
    <>
      <rect width={W} height={H} fill={PAPER} />
      {tiles}
    </>
  );
}

function Civic({ rand }: { rand: () => number }) {
  const xs = [0, 120 + rand() * 40, 260 + rand() * 40, 400 + rand() * 40, 520 + rand() * 30, W];
  const ys = [0, 110 + rand() * 30, 240 + rand() * 30, H];
  const road = 18;
  const blocks: React.ReactNode[] = [];
  let litDone = false;
  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < ys.length - 1; j++) {
      const x = (xs[i] ?? 0) + road / 2;
      const y = (ys[j] ?? 0) + road / 2;
      const w = (xs[i + 1] ?? W) - (xs[i] ?? 0) - road;
      const h = (ys[j + 1] ?? H) - (ys[j] ?? 0) - road;
      const lit = !litDone && i === 2 && j === 1;
      if (lit) litDone = true;
      blocks.push(
        <rect
          key={`${i}-${j}`}
          x={round(x)}
          y={round(y)}
          width={round(w)}
          height={round(h)}
          rx="6"
          fill={lit ? EMBER : PAPER}
          stroke={lit ? EMBER : LINE}
          strokeWidth="1.5"
        />,
      );
    }
  }
  const midX = ((xs[2] ?? 0) + (xs[3] ?? 0)) / 2;
  const midY = ((ys[1] ?? 0) + (ys[2] ?? 0)) / 2;
  return (
    <>
      <rect width={W} height={H} fill={WHITE} />
      {blocks}
      <path
        d={`M40 ${round(ys[1] ?? 120)} H${round(xs[2] ?? 280)} V${round(midY)} H${round(midX)}`}
        fill="none"
        stroke={INK}
        strokeWidth="4"
        strokeDasharray="2 10"
        strokeLinecap="round"
        className="cover__route"
      />
      <circle cx="40" cy={round(ys[1] ?? 120)} r="9" fill={INK} />
      <circle cx={round(midX)} cy={round(midY)} r="12" fill={WHITE} stroke={INK} strokeWidth="4" className="cover__pin" />
    </>
  );
}

function Waveform({ rand }: { rand: () => number }) {
  const count = 58;
  const barW = 6;
  const step = (W - 80) / count;
  let level = 0.4;
  const bars = Array.from({ length: count }, (_, i) => {
    level = Math.min(1, Math.max(0.08, level + (rand() - 0.5) * 0.45));
    const envelope = Math.sin((i / (count - 1)) * Math.PI);
    const h = 16 + level * envelope * 250;
    const lit = i > count * 0.38 && i < count * 0.6;
    return (
      <rect
        key={i}
        x={round(40 + i * step)}
        y={round(H / 2 - h / 2)}
        width={barW}
        height={round(h)}
        rx="3"
        fill={lit ? EMBER : SKY}
        opacity={lit ? 1 : 0.55}
        className="cover__bar"
        style={{ '--d': `${-((i * 7) % 13) * 0.11}s` } as React.CSSProperties}
      />
    );
  });
  return (
    <>
      <rect width={W} height={H} fill={INK} />
      {bars}
    </>
  );
}

function Shelf({ rand }: { rand: () => number }) {
  // A bookshelf for a business publisher: spines of varying height and width.
  const base = 318;
  const books: React.ReactNode[] = [];
  let x = 44;
  let i = 0;
  const lit = 6 + Math.floor(rand() * 8);
  while (x < W - 60) {
    const w = 18 + Math.round(rand() * 22);
    const h = 150 + Math.round(rand() * 120);
    const tone = rand();
    const fill = i === lit ? EMBER : tone > 0.72 ? SKY : tone > 0.4 ? INK : RAISED;
    const onDark = fill === INK || fill === RAISED;
    books.push(
      <g key={i} className={i === lit ? 'cover__book' : undefined}>
        <rect x={x} y={base - h} width={w} height={h} rx="2" fill={fill} />
        <rect x={x + 4} y={base - h + 16} width={w - 8} height="5" rx="2" fill={onDark ? WHITE : INK} opacity="0.45" />
        <rect x={x + 4} y={base - 22} width={w - 8} height="3" rx="1.5" fill={onDark ? WHITE : INK} opacity="0.3" />
      </g>,
    );
    x += w + 3 + (rand() > 0.85 ? 10 : 0);
    i += 1;
  }
  return (
    <>
      <rect width={W} height={H} fill={PAPER} />
      {books}
      <rect x="24" y={base} width={W - 48} height="10" rx="2" fill={INK} />
    </>
  );
}

function gearPath(cx: number, cy: number, r: number, teeth: number, rotation: number) {
  const depth = r * 0.16;
  const steps = teeth * 4;
  let d = '';
  for (let s = 0; s < steps; s++) {
    const a = rotation + (s / steps) * Math.PI * 2;
    const radius = s % 4 < 2 ? r : r - depth;
    d += `${s === 0 ? 'M' : 'L'}${round(cx + Math.cos(a) * radius)} ${round(cy + Math.sin(a) * radius)} `;
  }
  return `${d}Z`;
}

function Parts({ rand }: { rand: () => number }) {
  // A blueprint of meshing gears for a packaging machinery supplier.
  const grid: React.ReactNode[] = [];
  for (let gx = 0; gx <= W; gx += 32) grid.push(<line key={`x${gx}`} x1={gx} y1="0" x2={gx} y2={H} stroke={SKY} opacity="0.12" />);
  for (let gy = 0; gy <= H; gy += 32) grid.push(<line key={`y${gy}`} x1="0" y1={gy} x2={W} y2={gy} stroke={SKY} opacity="0.12" />);
  const spin = rand() * Math.PI;
  const gears = [
    { cx: 236, cy: 206, r: 112, teeth: 18, lit: true },
    { cx: 418, cy: 140, r: 74, teeth: 12, lit: false },
    { cx: 452, cy: 296, r: 58, teeth: 10, lit: false },
  ];
  return (
    <>
      <rect width={W} height={H} fill={INK} />
      {grid}
      {gears.map((g, i) => (
        <g
          key={i}
          className="cover__gear"
          // Smaller gears turn faster, and neighbours turn the opposite way, like real meshing gears.
          style={{ '--spin': `${round((g.teeth / 18) * 16)}s`, animationDirection: i % 2 ? 'reverse' : 'normal' } as React.CSSProperties}
        >
          <path
            d={gearPath(g.cx, g.cy, g.r, g.teeth, spin * (i % 2 ? -1 : 1))}
            fill={g.lit ? EMBER : 'none'}
            stroke={g.lit ? EMBER : SKY}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx={g.cx} cy={g.cy} r={g.r * 0.28} fill={g.lit ? INK : 'none'} stroke={g.lit ? INK : SKY} strokeWidth="2.5" />
          <circle cx={g.cx} cy={g.cy} r="5" fill={g.lit ? EMBER : SKY} />
        </g>
      ))}
      <path d="M60 352 H200 M60 344 V360 M200 344 V360" stroke={SKY} strokeWidth="2" opacity="0.7" />
    </>
  );
}

interface CoverArtProps {
  variant: CoverStyle;
  seed: string;
  /** Letter for the editorial masthead variant */
  initial?: string;
  className?: string;
  /** Animate continuously (otherwise covers animate on hover or focus) */
  live?: boolean;
}

export function CoverArt({ variant, seed, initial = 'B', className, live = false }: CoverArtProps) {
  const rand = seeded(seed);
  return (
    <svg
      className={`cover cover--${variant}${live ? ' cover--live' : ''}${className ? ` ${className}` : ''}`}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {variant === 'masthead' && <Masthead rand={rand} initial={initial} />}
      {variant === 'waves' && <Waves rand={rand} />}
      {variant === 'catalogue' && <Catalogue rand={rand} />}
      {variant === 'civic' && <Civic rand={rand} />}
      {variant === 'waveform' && <Waveform rand={rand} />}
      {variant === 'shelf' && <Shelf rand={rand} />}
      {variant === 'parts' && <Parts rand={rand} />}
    </svg>
  );
}
