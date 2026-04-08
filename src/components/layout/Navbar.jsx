import { useState, useEffect } from 'react';
import { BARBERIA } from '../../data/barberia';
import { useActiveSection } from '../../hooks';
import { GoldButton } from '../ui';
import { useAuthStore } from '../../store/authStore';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Inicio',    href: '#inicio'    },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Galería',   href: '#galeria'   },
  { label: 'Tarifas',   href: '#tarifas'   },
  { label: 'Reservar',  href: '#reservar'  },
];

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const user = useAuthStore((state) => state.user);
  const navLinks = user?.role === 'admin'
    ? [...NAV_LINKS, { label: 'Admin', href: '#admin' }]
    : NAV_LINKS;
  const active = useActiveSection(navLinks.map((link) => link.href.slice(1)));
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const close = () => setMenuOpen(false);

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">

        {/* Logo */}
        <a href="#inicio" className="navbar__logo" onClick={close}>
          <span className="navbar__logo-icon">✂</span>
          <span className="navbar__logo-text">{BARBERIA.nombre}</span>
        </a>

        {/* Desktop nav */}
        <nav className="navbar__nav">
          {navLinks.map(l => (
            <a
              key={l.label}
              href={l.href}
              className={`navbar__link ${active === l.href.slice(1) ? 'navbar__link--active' : ''}`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="navbar__cta">
          {user ? (
            <div className="navbar__userbox">
              <span className="navbar__usertext">{user.fullName}</span>
              <GoldButton size="sm" outlined onClick={logout}>Salir</GoldButton>
            </div>
          ) : (
            <GoldButton href="#login" size="sm">Acceso staff</GoldButton>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Menú"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`navbar__mobile ${menuOpen ? 'navbar__mobile--open' : ''}`}>
        {navLinks.map(l => (
          <a key={l.label} href={l.href} className="navbar__mobile-link" onClick={close}>
            {l.label}
          </a>
        ))}
        {user ? (
          <>
            <span className="navbar__mobile-user">{user.fullName}</span>
            <GoldButton size="sm" outlined onClick={() => { logout(); close(); }}>Cerrar sesión</GoldButton>
          </>
        ) : (
          <GoldButton href="#login" size="sm" onClick={close}>Acceso staff</GoldButton>
        )}
      </div>
    </header>
  );
}
