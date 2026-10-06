'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { mainNav } from '@/config/site';
import { Logo } from './Logo';

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname() ?? '/';
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Tuck the header away while reading down the page; bring it back on any scroll up.
  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 8);
      if (y > last + 6 && y > 240) setHidden(true);
      else if (y < last - 6 || y < 160) setHidden(false);
      last = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Escape closes the menu and returns focus to the toggle; the page behind can't scroll while it's open.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('has-open-menu');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('has-open-menu');
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header
      className={`site-header${scrolled ? ' site-header--scrolled' : ''}${hidden && !open ? ' site-header--hidden' : ''}`}
      onFocusCapture={() => setHidden(false)}
    >
      <div className="container site-header__inner">
        <Link href="/" className="site-header__brand" aria-label="Byte9 home" onClick={close}>
          <Logo />
        </Link>

        <nav className="site-header__nav" aria-label="Main">
          <ul className="site-header__list">
            {mainNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`site-header__link${active ? ' site-header__link--active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="site-header__actions">
          <Link href="/search" className="site-header__icon-link" aria-label="Search" onClick={close}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
              <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M15.5 15.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Link>
          <Link href="/contact" className="button button--primary button--small site-header__cta">
            Book a demo
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="site-header__toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="site-header__toggle-bars" aria-hidden="true" />
            <span>{open ? 'Close' : 'Menu'}</span>
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={`mobile-menu${open ? ' mobile-menu--open' : ''}`} hidden={!open}>
        <nav className="container" aria-label="Mobile">
          <ul className="mobile-menu__list">
            {mainNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`mobile-menu__link${active ? ' mobile-menu__link--active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                    onClick={close}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link href="/contact" className="button button--primary mobile-menu__cta" onClick={close}>
            Book a Blaze demo
          </Link>
        </nav>
      </div>
    </header>
  );
}
