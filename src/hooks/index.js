import { useState, useEffect, useRef } from 'react';

// ── Scroll reveal animation ──────────────────────────────────
export function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

// ── Reservation form state ────────────────────────────────────
export function useReservation() {
  const [form, setForm] = useState({
    nombre: '', telefono: '', servicio: '', fecha: '', hora: '', barbero: '',
  });
  const [enviado, setEnviado] = useState(false);
  const [errores, setErrores] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrores(prev => ({ ...prev, [name]: '' }));
  };

  const validar = () => {
    const errs = {};
    if (!form.nombre.trim())   errs.nombre   = 'Ingresa tu nombre';
    if (!form.telefono.trim()) errs.telefono = 'Ingresa tu teléfono';
    if (!form.servicio)        errs.servicio = 'Elige un servicio';
    if (!form.fecha)           errs.fecha    = 'Elige una fecha';
    if (!form.hora)            errs.hora     = 'Elige una hora';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validar();
    if (Object.keys(errs).length > 0) { setErrores(errs); return; }
    setEnviado(true);
  };

  const resetForm = () => { setForm({ nombre:'',telefono:'',servicio:'',fecha:'',hora:'',barbero:'' }); setEnviado(false); };

  return { form, errores, enviado, handleChange, handleSubmit, resetForm };
}

// ── Active nav section ────────────────────────────────────────
export function useActiveSection(sectionIds) {
  const [active, setActive] = useState(sectionIds[0]);

  useEffect(() => {
    const handler = () => {
      const scrollY = window.scrollY + 100;
      for (const id of [...sectionIds].reverse()) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollY) { setActive(id); break; }
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [sectionIds]);

  return active;
}
