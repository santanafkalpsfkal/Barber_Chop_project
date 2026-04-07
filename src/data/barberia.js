// ─────────────────────────────────────────────────────────────
//  Datos centralizados de la barbería
//  Reemplaza estos valores con los datos reales del negocio
// ─────────────────────────────────────────────────────────────

export const BARBERIA = {
  nombre: 'BarberKing',
  slogan: 'La Mejor Barbería en Bogotá',
  subtitulo: 'Cortes de cabello y afeitados profesionales para hombres.',
  direccion: 'Calle 10 #20-30, Bogotá',
  telefono: '+57 312 345 6789',
  whatsapp: '573123456789',
  horario: 'Lun–Sáb 9:00 am – 8:00 pm',
  email: 'info@barberking.co',
  instagram: '@barberking_bog',
};

export const SERVICIOS = [
  {
    id: 1,
    icono: '✂️',
    nombre: 'Corte de Cabello',
    descripcion: 'Corte moderno y personalizado según tu estilo.',
    precio: 30000,
  },
  {
    id: 2,
    icono: '🪒',
    nombre: 'Afeitado Clásico',
    descripcion: 'Afeitado con toalla caliente y navaja profesional.',
    precio: 20000,
  },
  {
    id: 3,
    icono: '🧔',
    nombre: 'Barba y Aseo',
    descripcion: 'Diseño y mantenimiento de barba con productos premium.',
    precio: 25000,
  },
];

export const TARIFAS = [
  { nombre: 'Corte de Cabello',  precio: 30000 },
  { nombre: 'Afeitado Clásico',  precio: 20000 },
  { nombre: 'Corte + Afeitado',  precio: 45000 },
  { nombre: 'Arreglo de Barba',  precio: 25000 },
  { nombre: 'Tratamiento Capilar', precio: 35000 },
];

export const GALERIA = [
  {
    id: 1,
    alt: 'Corte fade profesional',
    url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80',
  },
  {
    id: 2,
    alt: 'Arreglo de barba',
    url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80',
  },
  {
    id: 3,
    alt: 'Corte clásico',
    url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80',
  },
  {
    id: 4,
    alt: 'Fade undercut',
    url: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&q=80',
  },
  {
    id: 5,
    alt: 'Barba y bigote',
    url: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=600&q=80',
  },
  {
    id: 6,
    alt: 'Barbero profesional',
    url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&q=80',
  },
];

export const BARBEROS = [
  { id: 1, nombre: 'Carlos Mendoza', especialidad: 'Fade & Skin Fade', exp: '8 años' },
  { id: 2, nombre: 'Luis Torres',    especialidad: 'Barba & Perfilado',  exp: '6 años' },
  { id: 3, nombre: 'Diego Ruiz',     especialidad: 'Cortes Clásicos',    exp: '5 años' },
];

export const HORARIOS_DISPONIBLES = ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM'];
