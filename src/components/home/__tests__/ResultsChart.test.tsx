import { render, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { ResultsChart } from '../ResultsChart';

const panels = [
  {
    title: 'Audience growth',
    rows: [
      { client: 'Dockwalk', label: 'Users', value: 800, direction: 'up' as const, href: '/our-work/dockwalk' },
      { client: 'Bear & Bear', label: 'Page views', value: 200, direction: 'up' as const, href: '/our-work/bear-and-bear' },
    ],
  },
  {
    title: 'Speed and sales',
    rows: [{ client: 'Bear & Bear', label: 'Page load time', value: 47, direction: 'down' as const, href: '/our-work/bear-and-bear' }],
  },
];

describe('<ResultsChart />', () => {
  it('renders each panel as a labelled data table', () => {
    render(<ResultsChart panels={panels} />);
    const table = screen.getByRole('table', { name: 'Audience growth' });
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(3); // header + 2
    expect(within(table).getByRole('rowheader', { name: /Dockwalk Users/ })).toBeInTheDocument();
    expect(within(table).getByText('+800%')).toBeInTheDocument();
  });

  it('scales bars within each panel', () => {
    const { container } = render(<ResultsChart panels={panels} />);
    const bars = container.querySelectorAll<HTMLElement>('.results__bar');
    expect(bars[0]?.style.inlineSize).toBe('100%');
    expect(bars[1]?.style.inlineSize).toBe('25%');
    expect(bars[2]?.style.inlineSize).toBe('100%');
  });

  it('shows decreases with a minus sign', () => {
    render(<ResultsChart panels={panels} />);
    expect(screen.getByText('−47%')).toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<ResultsChart panels={panels} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
