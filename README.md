# ✂ BarberKing – Sitio Web en React

Página web profesional para barbería en Bogotá, construida con **React** y arquitectura limpia.

---

## 🚀 Instalación y uso

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
copy .env.example .env

# 3. Iniciar frontend + API
npm run dev

# 4. Build para producción
npm run build
```

Frontend: [http://localhost:3000](http://localhost:3000)

API auth: [http://localhost:4000/api/health](http://localhost:4000/api/health)

Configura en `.env` estos valores:

```env
DATABASE_URL=tu-string-de-neon
JWT_SECRET=una-clave-larga-y-segura
PORT=4000
ADMIN_NAME=Admin BarberKing
ADMIN_EMAIL=admin@barberking.com
ADMIN_PASSWORD=ChangeMe123!
```

Si quieres regenerar el usuario administrador:

```bash
npm run seed:admin
```

Credenciales iniciales del panel:

```text
admin@barberking.com
ChangeMe123!
```

El frontend usa Zustand para persistir sesión y consume la API Express conectada a Neon Postgres.

## Despliegue en Vercel

Este proyecto ya quedó preparado para desplegarse en Vercel con:

- frontend estático de React
- funciones serverless en `/api`
- conexión a Neon Postgres
- panel admin protegido por JWT

En Vercel debes crear estas variables de entorno:

```env
DATABASE_URL=tu-string-de-neon
JWT_SECRET=una-clave-larga-y-segura
ADMIN_NAME=Admin BarberKing
ADMIN_EMAIL=admin@barberking.com
ADMIN_PASSWORD=ChangeMe123!
```

Después del deploy, Vercel usará `vercel.json` para enrutar:

- `/api/*` hacia la API serverless
- el resto hacia la SPA de React

---

## 🏗️ Arquitectura del proyecto

```
src/
├── data/
│   └── barberia.js          → Todos los datos del negocio (centralizado)
│
├── hooks/
│   └── index.js             → useScrollReveal, useReservation, useActiveSection
│
├── styles/
│   └── globals.css          → Variables CSS, reset, utilidades globales
│
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx       → Navegación fija con scroll y menú mobile
│   │   └── Footer.jsx       → Pie de página con redes y contacto
│   │
│   ├── ui/
│   │   ├── index.jsx        → GoldButton, WAButton, SectionHeader, Reveal
│   │   └── ui.css           → Estilos de componentes reutilizables
│   │
│   └── sections/
│       ├── Hero.jsx         → Sección principal con fondo y CTA
│       ├── Stats.jsx        → Barra de estadísticas (clientes, años, etc.)
│       ├── Servicios.jsx    → Grid de servicios ofrecidos
│       ├── Galeria.jsx      → Galería de trabajos con lightbox
│       ├── Equipo.jsx       → Tarjetas de barberos
│       ├── TarifasReserva.jsx → Precios + formulario de reserva
│       └── Ubicacion.jsx    → Mapa + info de contacto
│
└── App.jsx                  → Composición principal
```

---

## ✏️ Personalización

### Cambiar datos del negocio
Edita **`src/data/barberia.js`** — un solo archivo con toda la información:
```js
export const BARBERIA = {
  nombre:    'TuBarbería',
  telefono:  '+57 3XX XXX XXXX',
  whatsapp:  '57XXXXXXXXXX',    // sin + ni espacios
  direccion: 'Calle X #Y-Z, Ciudad',
  horario:   'Lun–Sáb 9am – 8pm',
  // ...
};
```

### Agregar servicios
```js
export const SERVICIOS = [
  { id: 4, icono: '💈', nombre: 'Nuevo Servicio', descripcion: '...', precio: 35000 },
  // ...
];
```

### Cambiar fotos de galería
Reemplaza las URLs en `GALERIA` con tus fotos reales (Unsplash, Cloudinary, etc.)

---

## 📱 Secciones incluidas

| Sección | Descripción |
|---|---|
| **Hero** | Banner principal con foto de fondo, título animado y CTAs |
| **Stats** | Barra con estadísticas del negocio |
| **Servicios** | 3 servicios en grid con íconos y precios |
| **Galería** | 6 fotos en grid con lightbox interactivo |
| **Equipo** | Tarjetas de los 3 barberos |
| **Tarifas** | Panel estilo barbería clásica con lista de precios |
| **Reservas** | Formulario con validación (nombre, teléfono, servicio, fecha, hora) |
| **Ubicación** | Mapa embed + info de contacto + botón WhatsApp |
| **Footer** | Redes sociales, links y copyright |

---

## 🎨 Diseño

- **Paleta**: Navy (#0d1b2e) + Gold (#c9a84c) + Cream (#f8f4ec)
- **Tipografía**: Playfair Display (display) + Cormorant Garamond (serif) + Montserrat (UI)
- **Animaciones**: Scroll reveal en todas las secciones, microinteracciones en hover
- **Responsive**: Funciona en móvil, tablet y desktop
