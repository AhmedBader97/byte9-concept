import { render } from '@testing-library/react';
import type { CoverStyle } from '@/content/types';
import { CoverArt, seeded } from '../CoverArt';

const variants: CoverStyle[] = ['masthead', 'waves', 'catalogue', 'civic', 'waveform', 'shelf', 'parts'];

describe('seeded', () => {
  it('is deterministic for the same seed', () => {
    const a = seeded('kogan-page');
    const b = seeded('kogan-page');
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('stays within [0, 1)', () => {
    const rand = seeded('range');
    for (let i = 0; i < 1000; i++) {
      const n = rand();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });
});

describe('<CoverArt />', () => {
  it.each(variants)('renders the %s variant as decorative SVG', (variant) => {
    const { container } = render(<CoverArt variant={variant} seed="test" initial="T" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg?.childElementCount).toBeGreaterThan(0);
  });

  it('produces identical artwork for the same seed', () => {
    const first = render(<CoverArt variant="waves" seed="dockwalk" />).container.innerHTML;
    const second = render(<CoverArt variant="waves" seed="dockwalk" />).container.innerHTML;
    expect(first).toBe(second);
  });

  it('produces different artwork for different seeds', () => {
    const first = render(<CoverArt variant="waves" seed="dockwalk" />).container.innerHTML;
    const second = render(<CoverArt variant="waves" seed="boat-international" />).container.innerHTML;
    expect(first).not.toBe(second);
  });
});
