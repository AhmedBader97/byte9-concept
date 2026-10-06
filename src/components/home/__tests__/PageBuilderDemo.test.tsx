import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { type BuilderState, builderReducer, dropIndex, MAX_BLOCKS, PageBuilderDemo, PIPELINE } from '../PageBuilderDemo';

const base = (): BuilderState => ({
  blocks: [
    { id: 1, type: 'masthead' },
    { id: 2, type: 'lead' },
    { id: 3, type: 'grid' },
  ],
  nextId: 4,
  device: 'desktop',
  status: 'draft',
  step: -1,
  announcement: '',
});

describe('builderReducer', () => {
  it('adds blocks to the end and announces them', () => {
    const next = builderReducer(base(), { type: 'add', block: 'ad' });
    expect(next.blocks.map((b) => b.type)).toEqual(['masthead', 'lead', 'grid', 'ad']);
    expect(next.announcement).toBe('Ad slot added.');
  });

  it('stops adding at the maximum', () => {
    let state = base();
    for (let i = 0; i < 10; i++) state = builderReducer(state, { type: 'add', block: 'ad' });
    expect(state.blocks).toHaveLength(MAX_BLOCKS);
  });

  it('keeps the masthead pinned', () => {
    const state = base();
    expect(builderReducer(state, { type: 'remove', id: 1 })).toBe(state);
    expect(builderReducer(state, { type: 'move', id: 2, by: -1 })).toBe(state);
  });

  it('moves blocks and reports the new position', () => {
    const next = builderReducer(base(), { type: 'move', id: 3, by: -1 });
    expect(next.blocks.map((b) => b.type)).toEqual(['masthead', 'grid', 'lead']);
    expect(next.announcement).toBe('Article grid moved to position 2 of 3.');
  });

  it('moves a dragged block straight to its drop position', () => {
    const state = { ...base(), blocks: [...base().blocks, { id: 4, type: 'ad' as const }] };
    const next = builderReducer(state, { type: 'moveTo', id: 4, to: 1 });
    expect(next.blocks.map((b) => b.type)).toEqual(['masthead', 'ad', 'lead', 'grid']);
  });

  it('ignores drops onto the masthead slot or the same place', () => {
    const state = base();
    expect(builderReducer(state, { type: 'moveTo', id: 3, to: 0 })).toBe(state);
    expect(builderReducer(state, { type: 'moveTo', id: 3, to: 2 })).toBe(state);
  });

  it('runs the pipeline step by step to live', () => {
    let state = builderReducer(base(), { type: 'publish' });
    expect(state.status).toBe('publishing');
    for (let i = 0; i < PIPELINE.length; i++) state = builderReducer(state, { type: 'advance' });
    expect(state.status).toBe('live');
  });

  it('marks a live page as having unpublished changes after an edit', () => {
    const live: BuilderState = { ...base(), status: 'live', step: PIPELINE.length };
    const next = builderReducer(live, { type: 'add', block: 'newsletter' });
    expect(next.status).toBe('draft');
    expect(next.announcement).toMatch(/Unpublished changes/);
  });
});

describe('dropIndex', () => {
  // Midpoints of four layers: masthead, lead, grid, ad
  const mids = [10, 50, 90, 130];

  it('keeps the position when dropped near its own slot', () => {
    expect(dropIndex(mids, 2, 92)).toBe(2);
  });

  it('moves down past later layers', () => {
    expect(dropIndex(mids, 1, 140)).toBe(3);
  });

  it('moves up but never above the masthead', () => {
    expect(dropIndex(mids, 3, 30)).toBe(1);
    expect(dropIndex(mids, 3, -50)).toBe(1);
  });
});

describe('<PageBuilderDemo />', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('adds a block from the palette to the layout list', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<PageBuilderDemo />);
    const layout = screen.getAllByRole('list')[0] as HTMLElement;
    expect(within(layout).queryByText('Product carousel')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Product carousel/ }));
    expect(within(layout).getByText('Product carousel')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Product carousel added.');
  });

  it('switches the preview device', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<PageBuilderDemo />);
    const mobile = screen.getByRole('button', { name: 'Mobile' });
    await user.click(mobile);
    expect(mobile).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Desktop' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('publishes through every pipeline step', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<PageBuilderDemo />);
    await user.click(screen.getByRole('button', { name: 'Publish' }));
    expect(screen.getByRole('button', { name: 'Publishing…' })).toBeDisabled();
    // Each step schedules the next once React has re-rendered, so advance one step at a time.
    for (let i = 0; i < PIPELINE.length; i++) {
      await act(async () => {
        jest.advanceTimersByTime(700);
      });
    }
    expect(screen.getByText('Live')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Published. Your page is live.');
  });

  it('has no detectable accessibility violations', async () => {
    jest.useRealTimers();
    const { container } = render(<PageBuilderDemo />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
