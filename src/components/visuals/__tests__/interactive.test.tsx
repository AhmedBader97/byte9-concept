import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PIPELINE_STEPS, PipelineRun } from '@/components/about/PipelineRun';
import { mockReducedMotion } from '@/test/motion';
import { LiveQuery } from '../LiveQuery';
import { SPHERE_TOPICS, SphereCanvas } from '../SphereCanvas';

describe('<SphereCanvas />', () => {
  it('renders a labelled canvas and keeps the fallback when 2D canvas is unavailable', () => {
    const { container } = render(<SphereCanvas fallback={<svg data-testid="fallback" />} />);
    expect(screen.getByRole('img', { name: /Drag to turn it/ })).toBeInTheDocument();
    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(container.firstChild).not.toHaveClass('sphere--ready');
  });

  it('offers a button per topic and marks the chosen one as pressed', async () => {
    const user = userEvent.setup();
    render(<SphereCanvas controls />);
    const group = screen.getByRole('list', { name: 'Bring a topic to the front' });
    expect(group.querySelectorAll('button')).toHaveLength(SPHERE_TOPICS.length);
    const pharma = screen.getByRole('button', { name: 'pharma' });
    await user.click(pharma);
    expect(pharma).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'archive' })).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('<LiveQuery />', () => {
  const query = '{ jobs { title } }';
  const lines = ['{', '  "data": {}', '}'];

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows the full query and response when motion is reduced', () => {
    const restore = mockReducedMotion(true);
    render(<LiveQuery query={query} initialLines={lines} />);
    expect(screen.getByText(query)).toBeInTheDocument();
    expect(screen.getByText('"data"')).toBeInTheDocument();
    restore();
  });

  it('types the query, then streams the response', () => {
    jest.useFakeTimers();
    const { container } = render(<LiveQuery query={query} initialLines={lines} />);
    expect(container.querySelector('.code__pane code')?.textContent).toBe('');
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(container.querySelector('.code__pane code')?.textContent).toBe(query);
    expect(container.querySelectorAll('.code__line')).toHaveLength(lines.length);
    jest.useRealTimers();
  });

  it('re-runs the query against the API and reports the round trip', async () => {
    const restore = mockReducedMotion(true);
    const fetchMock = jest.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ data: { jobs: [{ title: 'Junior Front End Developer' }] } }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    const user = userEvent.setup();
    render(<LiveQuery query={query} initialLines={lines} />);
    await user.click(screen.getByRole('button', { name: 'Run it again' }));
    expect(fetchMock).toHaveBeenCalledWith('/api/graphql', expect.objectContaining({ method: 'POST' }));
    expect(await screen.findByText(/200 in \d+ ms/)).toBeInTheDocument();
    expect(screen.getByText('"Junior Front End Developer"')).toBeInTheDocument();
    restore();
  });
});

describe('<PipelineRun />', () => {
  it('shows every stage passed when motion is reduced', () => {
    const restore = mockReducedMotion(true);
    const { container } = render(<PipelineRun />);
    expect(container.querySelectorAll('.pipeline__step--done')).toHaveLength(PIPELINE_STEPS.length);
    expect(screen.getByRole('status')).toHaveTextContent('All checks passed. Deployed.');
    restore();
  });

  it('runs each stage in order', () => {
    jest.useFakeTimers();
    const { container } = render(<PipelineRun />);
    act(() => {
      jest.advanceTimersByTime(1100);
    });
    expect(container.querySelectorAll('.pipeline__step--done')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent(/Running unit tests/);
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(container.querySelectorAll('.pipeline__step--done')).toHaveLength(PIPELINE_STEPS.length);
    jest.useRealTimers();
  });
});
