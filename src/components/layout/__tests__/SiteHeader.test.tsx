import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { SiteHeader } from '../SiteHeader';

jest.mock('next/navigation', () => ({ usePathname: () => '/our-work/dockwalk' }));

describe('<SiteHeader />', () => {
  it('marks the current section in the main navigation', () => {
    render(<SiteHeader />);
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(within(nav).getByRole('link', { name: 'Our work' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'Blaze' })).not.toHaveAttribute('aria-current');
  });

  it('opens and closes the mobile menu', async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);
    const toggle = screen.getByRole('button', { name: 'Menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(screen.getByRole('button', { name: 'Close' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('navigation', { name: 'Mobile' })).toBeVisible();
    expect(document.body).toHaveClass('has-open-menu');
  });

  it('closes the menu with Escape and returns focus to the toggle', async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);
    await user.click(screen.getByRole('button', { name: 'Menu' }));
    await user.keyboard('{Escape}');
    const toggle = screen.getByRole('button', { name: 'Menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
    expect(document.body).not.toHaveClass('has-open-menu');
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<SiteHeader />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
