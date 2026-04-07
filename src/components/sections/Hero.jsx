import { BARBERIA } from '../../data/barberia';
import { GoldButton, WAButton } from '../ui';
import AuthPanel from './AuthPanel';
import './Hero.css';

export default function Hero() {
  return (
    <section id="inicio" className="hero">
      {/* Dark overlay */}
      <div className="hero__overlay" />

      {/* Decorative stripes */}
      <div className="hero__stripes">
        <div className="stripe stripe--1" />
        <div className="stripe stripe--2" />
        <div className="stripe stripe--3" />
      </div>

      <div className="container hero__content">
        <div className="hero__copy">
          <div className="hero__badge">
            <span>✂</span>
            <span>Desde 2015 · Bogotá</span>
            <span>✂</span>
          </div>

          <h1 className="hero__title">
            <span className="hero__title-line1">La Mejor</span>
            <span className="hero__title-line2">Barbería</span>
            <span className="hero__title-line3">en Bogotá</span>
          </h1>

          <p className="hero__subtitle">{BARBERIA.subtitulo}</p>

          <div className="hero__actions">
            <GoldButton href="#reservar" size="lg">Reservar Tu Cita</GoldButton>
            <WAButton phone={BARBERIA.whatsapp} text="WhatsApp" />
          </div>

          <div className="hero__info">
            <div className="hero__info-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{BARBERIA.direccion}</span>
            </div>
            <div className="hero__info-divider" />
            <div className="hero__info-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.5 19.79 19.79 0 01.17 5.82 2 2 0 012.16 3.62h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 11.1a16 16 0 006 6l1.37-1.37a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
              </svg>
              <span>{BARBERIA.telefono}</span>
            </div>
          </div>
        </div>

        <div id="login" className="hero__auth">
          <AuthPanel />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero__scroll">
        <div className="hero__scroll-line" />
        <span>Scroll</span>
      </div>
    </section>
  );
}
