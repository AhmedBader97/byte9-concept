'use client';

import { useEffect, useId, useReducer, useRef, useState } from 'react';
import { useFlip } from '@/hooks/useFlip';

/**
 * A working miniature of the Blaze Page Builder: add, drag to reorder and
 * remove blocks, switch devices, then publish through a simulated CI/CD
 * pipeline. The preview uses CSS container queries, so blocks respond to the
 * device frame rather than the browser window, and FLIP animations glide every
 * block to its new place. Arrow buttons give keyboard users the same control.
 */

export type BlockType = 'masthead' | 'lead' | 'grid' | 'products' | 'ad' | 'newsletter';
export type Device = 'desktop' | 'tablet' | 'mobile';
type Status = 'draft' | 'publishing' | 'live';

export const BLOCK_INFO: Record<BlockType, { label: string; hint: string }> = {
  masthead: { label: 'Masthead', hint: 'Logo and navigation' },
  lead: { label: 'Lead story', hint: 'Headline and hero image' },
  grid: { label: 'Article grid', hint: 'Reflows from three columns to one' },
  products: { label: 'Product carousel', hint: 'Live prices from your store' },
  ad: { label: 'Ad slot', hint: 'Leaderboard or MPU, by device' },
  newsletter: { label: 'Newsletter', hint: 'Sign-ups grow your first-party data' },
};

const ADDABLE: BlockType[] = ['lead', 'grid', 'products', 'ad', 'newsletter'];
const DEVICES: { id: Device; label: string }[] = [
  { id: 'desktop', label: 'Desktop' },
  { id: 'tablet', label: 'Tablet' },
  { id: 'mobile', label: 'Mobile' },
];
export const PIPELINE = ['Lint', 'Unit tests', 'Visual checks', 'Deploy'] as const;
export const MAX_BLOCKS = 7;
const STEP_MS = 520;

interface Block {
  id: number;
  type: BlockType;
}

export interface BuilderState {
  blocks: Block[];
  nextId: number;
  device: Device;
  status: Status;
  step: number;
  announcement: string;
}

type Action =
  | { type: 'add'; block: BlockType }
  | { type: 'remove'; id: number }
  | { type: 'move'; id: number; by: -1 | 1 }
  | { type: 'moveTo'; id: number; to: number }
  | { type: 'device'; device: Device }
  | { type: 'publish' }
  | { type: 'advance' };

const initialState: BuilderState = {
  blocks: [
    { id: 1, type: 'masthead' },
    { id: 2, type: 'lead' },
    { id: 3, type: 'grid' },
    { id: 4, type: 'ad' },
  ],
  nextId: 5,
  device: 'desktop',
  status: 'draft',
  step: -1,
  announcement: '',
};

const label = (type: BlockType) => BLOCK_INFO[type].label;

export function builderReducer(state: BuilderState, action: Action): BuilderState {
  // Any edit after publishing puts the page back into draft.
  const edited = (next: Partial<BuilderState>, announcement: string): BuilderState => ({
    ...state,
    ...next,
    status: state.status === 'publishing' ? 'publishing' : 'draft',
    step: state.status === 'publishing' ? state.step : -1,
    announcement: state.status === 'live' ? `${announcement} Unpublished changes.` : announcement,
  });

  switch (action.type) {
    case 'add': {
      if (state.blocks.length >= MAX_BLOCKS) return state;
      return edited(
        { blocks: [...state.blocks, { id: state.nextId, type: action.block }], nextId: state.nextId + 1 },
        `${label(action.block)} added.`,
      );
    }
    case 'remove': {
      const target = state.blocks.find((b) => b.id === action.id);
      if (!target || target.type === 'masthead') return state;
      return edited({ blocks: state.blocks.filter((b) => b.id !== action.id) }, `${label(target.type)} removed.`);
    }
    case 'move':
    case 'moveTo': {
      const index = state.blocks.findIndex((b) => b.id === action.id);
      const to = action.type === 'move' ? index + action.by : action.to;
      // The masthead stays pinned to the top.
      if (index < 1 || to < 1 || to >= state.blocks.length || to === index) return state;
      const blocks = state.blocks.slice();
      const [moved] = blocks.splice(index, 1);
      if (!moved) return state;
      blocks.splice(to, 0, moved);
      return edited({ blocks }, `${label(moved.type)} moved to position ${to + 1} of ${blocks.length}.`);
    }
    case 'device':
      return { ...state, device: action.device, announcement: `Previewing on ${action.device}.` };
    case 'publish':
      if (state.status === 'publishing') return state;
      return { ...state, status: 'publishing', step: 0, announcement: 'Publishing: running checks.' };
    case 'advance': {
      if (state.status !== 'publishing') return state;
      const step = state.step + 1;
      if (step >= PIPELINE.length) {
        return { ...state, status: 'live', step: PIPELINE.length, announcement: 'Published. Your page is live.' };
      }
      return { ...state, step };
    }
    default:
      return state;
  }
}

function Icon({ name }: { name: 'up' | 'down' | 'remove' | 'add' | 'grip' | Device }) {
  const paths: Record<string, React.ReactNode> = {
    grip: (
      <>
        <circle cx="9" cy="6.5" r="1.4" />
        <circle cx="15" cy="6.5" r="1.4" />
        <circle cx="9" cy="12" r="1.4" />
        <circle cx="15" cy="12" r="1.4" />
        <circle cx="9" cy="17.5" r="1.4" />
        <circle cx="15" cy="17.5" r="1.4" />
      </>
    ),
    up: <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />,
    down: <path d="M12 5v14m-6.5-6.5L12 19l6.5-6.5" />,
    remove: <path d="M6 6l12 12M18 6 6 18" />,
    add: <path d="M12 5v14M5 12h14" />,
    desktop: (
      <>
        <rect x="3" y="4.5" width="18" height="12" rx="1.5" />
        <path d="M8.5 20h7M12 16.5V20" />
      </>
    ),
    tablet: <rect x="5.5" y="3" width="13" height="18" rx="2" />,
    mobile: (
      <>
        <rect x="7.5" y="3" width="9" height="18" rx="2" />
        <path d="M11 18h2" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" className="builder__icon">
      {paths[name]}
    </svg>
  );
}

function PreviewBlock({ type, order }: { type: BlockType; order: number }) {
  const style = { '--i': order } as React.CSSProperties;
  switch (type) {
    case 'masthead':
      return (
        <div className="pv pv--masthead" style={style}>
          <span className="pv__logo" />
          <span className="pv__nav">
            <i />
            <i />
            <i />
            <i />
          </span>
        </div>
      );
    case 'lead':
      return (
        <div className="pv pv--lead" style={style}>
          <span className="pv__media" />
          <span className="pv__copy">
            <i className="pv__line pv__line--title" />
            <i className="pv__line pv__line--title pv__line--short" />
            <i className="pv__line" />
            <i className="pv__line pv__line--short" />
          </span>
        </div>
      );
    case 'grid':
      return (
        <div className="pv pv--grid" style={style}>
          {[0, 1, 2].map((n) => (
            <span className="pv__card" key={n}>
              <span className="pv__thumb" />
              <i className="pv__line" />
              <i className="pv__line pv__line--short" />
            </span>
          ))}
        </div>
      );
    case 'products':
      return (
        <div className="pv pv--products" style={style}>
          {[0, 1, 2, 3].map((n) => (
            <span className="pv__product" key={n}>
              <span className="pv__pack" />
              <i className="pv__price" />
            </span>
          ))}
        </div>
      );
    case 'ad':
      return (
        <div className="pv pv--ad" style={style}>
          <span className="pv__ad">Ad</span>
        </div>
      );
    case 'newsletter':
      return (
        <div className="pv pv--newsletter" style={style}>
          <i className="pv__line pv__line--title pv__line--short" />
          <span className="pv__form">
            <span className="pv__input" />
            <span className="pv__submit" />
          </span>
        </div>
      );
    default:
      return null;
  }
}

interface DragState {
  id: number;
  from: number;
  to: number;
  startY: number;
  offset: number;
}

/** Where a dragged layer would land, given the pointer's Y position. */
export function dropIndex(midpoints: number[], from: number, y: number): number {
  let count = 0;
  midpoints.forEach((mid, i) => {
    if (i !== from && mid < y) count += 1;
  });
  // Index 0 is the pinned masthead.
  return Math.max(1, count);
}

export function PageBuilderDemo() {
  const [state, dispatch] = useReducer(builderReducer, initialState);
  const titleId = useId();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const layersRef = useRef<HTMLOListElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const midpoints = useRef<number[]>([]);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [ripples, setRipples] = useState(0);
  // Stagger the opening blocks once on load; later additions animate on their own.
  const [intro, setIntro] = useState(true);

  const order = state.blocks.map((b) => b.id).join(',');
  const snapshotLayers = useFlip(layersRef, [order]);
  useFlip(screenRef, [order], { duration: 420, enter: false });

  useEffect(() => {
    const t = setTimeout(() => setIntro(false), 1400);
    return () => clearTimeout(t);
  }, []);

  // Drive the pipeline one step at a time while publishing.
  useEffect(() => {
    if (state.status !== 'publishing') return;
    const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    timer.current = setTimeout(() => dispatch({ type: 'advance' }), reduced ? 0 : STEP_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [state.status, state.step]);

  // A ripple runs out across the canvas each time a page goes live.
  const wasLive = useRef(false);
  useEffect(() => {
    const live = state.status === 'live';
    if (live && !wasLive.current) setRipples((n) => n + 1);
    wasLive.current = live;
  }, [state.status]);

  // ---- Drag to reorder (pointer events: mouse, pen and touch) ----
  const onGripDown = (event: React.PointerEvent<HTMLSpanElement>, id: number, index: number) => {
    if (event.button !== 0 || !layersRef.current) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    midpoints.current = Array.from(layersRef.current.querySelectorAll<HTMLElement>('[data-flip]')).map((el) => {
      const rect = el.getBoundingClientRect();
      return rect.top + rect.height / 2;
    });
    setDrag({ id, from: index, to: index, startY: event.clientY, offset: 0 });
  };

  const onGripMove = (event: React.PointerEvent<HTMLSpanElement>) => {
    if (!drag) return;
    const offset = event.clientY - drag.startY;
    const y = (midpoints.current[drag.from] ?? 0) + offset;
    setDrag({ ...drag, offset, to: dropIndex(midpoints.current, drag.from, y) });
  };

  const onGripUp = () => {
    if (!drag) return;
    // Record where everything is right now (including the lifted card) so the drop glides.
    snapshotLayers();
    if (drag.to !== drag.from) dispatch({ type: 'moveTo', id: drag.id, to: drag.to });
    setDrag(null);
  };

  const full = state.blocks.length >= MAX_BLOCKS;
  const deviceLabel = DEVICES.find((d) => d.id === state.device)?.label ?? '';

  const dropClass = (index: number) => {
    if (!drag || drag.to === drag.from) return '';
    if (drag.to < drag.from && index === drag.to) return ' builder__layer--drop-before';
    if (drag.to > drag.from && index === drag.to) return ' builder__layer--drop-after';
    return '';
  };

  return (
    <div className="builder" role="group" aria-labelledby={titleId}>
      <div className="builder__toolbar">
        <h2 id={titleId} className="builder__title">
          Try the page builder
        </h2>
        <div className="builder__devices" role="group" aria-label="Preview device">
          {DEVICES.map((d) => (
            <button
              key={d.id}
              type="button"
              className="builder__device-button"
              aria-pressed={state.device === d.id}
              onClick={() => dispatch({ type: 'device', device: d.id })}
            >
              <Icon name={d.id} />
              <span className="u-visually-hidden">{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="builder__body">
        <div className="builder__stage">
          <p className="u-visually-hidden">
            Visual preview on {deviceLabel}. It mirrors the layout list.
          </p>
          {ripples > 0 && (
            <span key={ripples} className="builder__ripples" aria-hidden="true">
              <span />
              <span />
            </span>
          )}
          <div
            className={`builder__frame builder__frame--${state.device}${intro ? ' builder__frame--intro' : ''}${
              state.status === 'live' ? ' builder__frame--live' : ''
            }`}
            aria-hidden="true"
          >
            <div className="builder__screen" ref={screenRef}>
              {state.blocks.map((block, i) => (
                <div key={block.id} data-flip={block.id} className="builder__slot">
                  <PreviewBlock type={block.type} order={i} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="builder__panel">
          <h3 className="builder__panel-title">Layout</h3>
          <ol className="builder__layers" ref={layersRef}>
            {state.blocks.map((block, i) => {
              const locked = block.type === 'masthead';
              const name = label(block.type);
              const dragging = drag?.id === block.id;
              return (
                <li
                  key={block.id}
                  data-flip={block.id}
                  className={`builder__layer${locked ? ' builder__layer--locked' : ''}${
                    dragging ? ' builder__layer--dragging' : ''
                  }${dropClass(i)}`}
                  style={dragging ? { transform: `translateY(${drag.offset}px)` } : undefined}
                >
                  {!locked && (
                    <span
                      className="builder__grip"
                      aria-hidden="true"
                      title="Drag to reorder"
                      onPointerDown={(event) => onGripDown(event, block.id, i)}
                      onPointerMove={onGripMove}
                      onPointerUp={onGripUp}
                      onPointerCancel={() => setDrag(null)}
                    >
                      <Icon name="grip" />
                    </span>
                  )}
                  <span className="builder__layer-name">{name}</span>
                  {!locked && (
                    <span className="builder__layer-actions">
                      <button
                        type="button"
                        className="builder__mini"
                        onClick={() => dispatch({ type: 'move', id: block.id, by: -1 })}
                        disabled={i <= 1}
                        aria-label={`Move ${name} up`}
                      >
                        <Icon name="up" />
                      </button>
                      <button
                        type="button"
                        className="builder__mini"
                        onClick={() => dispatch({ type: 'move', id: block.id, by: 1 })}
                        disabled={i >= state.blocks.length - 1}
                        aria-label={`Move ${name} down`}
                      >
                        <Icon name="down" />
                      </button>
                      <button
                        type="button"
                        className="builder__mini"
                        onClick={() => dispatch({ type: 'remove', id: block.id })}
                        aria-label={`Remove ${name}`}
                      >
                        <Icon name="remove" />
                      </button>
                    </span>
                  )}
                </li>
              );
            })}
          </ol>

          <h3 className="builder__panel-title">Add a block</h3>
          <ul className="builder__palette">
            {ADDABLE.map((type) => (
              <li key={type}>
                <button
                  type="button"
                  className="builder__add"
                  onClick={() => dispatch({ type: 'add', block: type })}
                  disabled={full}
                  title={BLOCK_INFO[type].hint}
                >
                  <Icon name="add" />
                  {label(type)}
                </button>
              </li>
            ))}
          </ul>
          {full && <p className="builder__note">That’s a full page. Remove a block to add another.</p>}
        </div>
      </div>

      <div className="builder__footer">
        <ol className="builder__pipeline" aria-label="Release pipeline">
          {PIPELINE.map((step, i) => {
            const stepState =
              state.status === 'live' || i < state.step ? 'done' : i === state.step && state.status === 'publishing' ? 'running' : 'idle';
            return (
              <li key={step} className={`builder__step builder__step--${stepState}`}>
                <span className="builder__step-dot" aria-hidden="true" />
                {step}
                <span className="u-visually-hidden">
                  {stepState === 'done' ? ', passed' : stepState === 'running' ? ', running' : ''}
                </span>
              </li>
            );
          })}
        </ol>
        <div className="builder__publish">
          {state.status === 'live' && <span className="builder__live">Live</span>}
          <button
            type="button"
            className="button button--primary button--small"
            onClick={() => dispatch({ type: 'publish' })}
            disabled={state.status === 'publishing'}
          >
            {state.status === 'publishing' ? 'Publishing…' : state.status === 'live' ? 'Publish again' : 'Publish'}
          </button>
        </div>
      </div>
      <p className="u-visually-hidden" role="status" aria-live="polite">
        {state.announcement}
      </p>
    </div>
  );
}
