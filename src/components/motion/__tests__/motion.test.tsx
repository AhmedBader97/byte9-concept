import { act, render, screen } from '@testing-library/react';
import { ClientStrip } from '@/components/shared/Blocks';
import { EmberStop } from '@/components/shared/EmberStop';
import { TileField } from '@/components/visuals/TileField';
import { clients } from '@/content/company';
import { mockReducedMotion } from '@/test/motion';
import { CountUp } from '../CountUp';
import { PageTransition } from '../PageTransition';

describe('<CountUp />', () => {
  it('always exposes the final value to assistive technology', () => {
    render(<CountUp value={817} prefix="+" suffix="%" />);
    expect(screen.getByText('+817%')).toHaveClass('u-visually-hidden');
  });

  it('shows the final value straight away when motion is reduced', () => {
    const restore = mockReducedMotion(true);
    const { container } = render(<CountUp value={253} />);
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('253');
    restore();
  });

  it('counts up to the final value', () => {
    jest.useFakeTimers();
    const { container } = render(<CountUp value={60} duration={400} />);
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('60');
    jest.useRealTimers();
  });
});

describe('<PageTransition />', () => {
  it('does not animate the first page load', () => {
    const { container } = render(<PageTransition>page</PageTransition>);
    expect(container.firstChild).not.toHaveClass('page-transition--animate');
  });

  it('animates pages after the first navigation', () => {
    render(<PageTransition>first</PageTransition>);
    const { container } = render(<PageTransition>second</PageTransition>);
    expect(container.firstChild).toHaveClass('page-transition--animate');
  });
});

describe('<ClientStrip /> marquee', () => {
  it('renders a second copy for the loop, hidden from assistive technology', () => {
    const { container } = render(<ClientStrip />);
    const tracks = container.querySelectorAll('.marquee__track');
    expect(tracks).toHaveLength(2);
    expect(tracks[0]).not.toHaveAttribute('aria-hidden');
    expect(tracks[1]).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getAllByRole('listitem')).toHaveLength(clients.length);
  });
});

describe('scroll reveals', () => {
  it('never hides content that is already on screen', () => {
    const { container } = render(
      <PageTransition>
        <h2 data-reveal>On screen</h2>
      </PageTransition>,
    );
    expect(container.firstChild).toHaveClass('js-reveal');
    expect(screen.getByText('On screen')).toHaveAttribute('data-revealed', 'instant');
  });

  it('reveals content below the fold as it scrolls in, then drops the reveal styles', () => {
    jest.useFakeTimers();
    const rect = jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ top: 5000 } as DOMRect);
    render(
      <PageTransition>
        <ul data-reveal="group">
          <li>Further down</li>
        </ul>
      </PageTransition>,
    );
    // The test observer reports everything as visible straight away
    const list = screen.getByRole('list');
    expect(list).toHaveAttribute('data-revealed', 'true');
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(list).toHaveAttribute('data-revealed', 'done');
    rect.mockRestore();
    jest.useRealTimers();
  });

  it('leaves everything visible when motion is reduced', () => {
    const restore = mockReducedMotion(true);
    const { container } = render(
      <PageTransition>
        <p data-reveal>Still here</p>
      </PageTransition>,
    );
    expect(container.firstChild).not.toHaveClass('js-reveal');
    expect(screen.getByText('Still here')).not.toHaveAttribute('data-revealed');
    restore();
  });
});

describe('brand details', () => {
  it('draws the full stop as the ember square but still reads as a full stop', () => {
    const { container } = render(
      <p>
        Expertly delivered
        <EmberStop />
      </p>,
    );
    expect(container.firstChild).toHaveTextContent('Expertly delivered.');
    expect(container.querySelector('.ember-stop')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders the tile field as decoration, even without canvas support', () => {
    const { container } = render(<TileField avoid="p" />);
    expect(container.querySelector('canvas')).toHaveAttribute('aria-hidden', 'true');
  });
});
