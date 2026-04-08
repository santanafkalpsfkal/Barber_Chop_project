const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const {
  DATABASE_URL,
  JWT_SECRET,
  ADMIN_NAME = 'Administrador',
  ADMIN_EMAIL = 'admin@barberia.com',
  ADMIN_PASSWORD = 'admin123',
  ADMIN_PHONE = '555-123-4567',
  DEMO_USER_NAME = 'Cliente Normal',
  DEMO_USER_EMAIL = 'cliente@barberia.com',
  DEMO_USER_PASSWORD = 'user123',
  DEMO_USER_PHONE = '555-987-6543',
} = process.env;

if (!DATABASE_URL) throw new Error('DATABASE_URL is required');
if (!JWT_SECRET) throw new Error('JWT_SECRET is required');

const sql = neon(DATABASE_URL);
const app = express();
let initializationPromise;

app.disable('x-powered-by');
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

function timeStringToMinutes(value) {
  const normalized = String(value).slice(0, 5);
  const [hours, minutes] = normalized.split(':').map(Number);
  return (hours * 60) + minutes;
}

function minutesToTimeString(value) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function overlaps(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

async function runSchema() {
  await sql.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await sql.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
      nombre VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'normal')),
      telefono VARCHAR(20),
      fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      activo BOOLEAN DEFAULT TRUE,
      ultimo_acceso TIMESTAMP
    )
  `);
  await sql.query(`
    CREATE TABLE IF NOT EXISTS barberos (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      especialidad VARCHAR(100),
      email VARCHAR(150),
      telefono VARCHAR(20),
      activo BOOLEAN DEFAULT TRUE
    )
  `);
  await sql.query(`
    CREATE TABLE IF NOT EXISTS servicios (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      descripcion TEXT,
      duracion_minutos INTEGER NOT NULL,
      precio DECIMAL(10, 2) NOT NULL,
      activo BOOLEAN DEFAULT TRUE
    )
  `);
  await sql.query(`
    CREATE TABLE IF NOT EXISTS reservas (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      barbero_id INTEGER NOT NULL REFERENCES barberos(id) ON DELETE CASCADE,
      servicio_id INTEGER NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
      fecha_reserva DATE NOT NULL,
      hora_reserva TIME NOT NULL,
      estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'completada', 'cancelada')),
      notas TEXT,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT horario_unico UNIQUE (barbero_id, fecha_reserva, hora_reserva)
    )
  `);
  await sql.query(`
    CREATE TABLE IF NOT EXISTS horarios_disponibles (
      id SERIAL PRIMARY KEY,
      barbero_id INTEGER NOT NULL REFERENCES barberos(id) ON DELETE CASCADE,
      dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
      hora_inicio TIME NOT NULL,
      hora_fin TIME NOT NULL,
      activo BOOLEAN DEFAULT TRUE
    )
  `);
  await sql.query(`
    CREATE OR REPLACE FUNCTION actualizar_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `);
  await sql.query('DROP TRIGGER IF EXISTS trigger_actualizar_reserva ON reservas');
  await sql.query(`
    CREATE TRIGGER trigger_actualizar_reserva
      BEFORE UPDATE ON reservas
      FOR EACH ROW
      EXECUTE FUNCTION actualizar_timestamp()
  `);
  await sql.query(`
    CREATE OR REPLACE FUNCTION verificar_disponibilidad(
      p_barbero_id INTEGER,
      p_fecha DATE,
      p_hora TIME,
      p_duracion INTEGER
    )
    RETURNS BOOLEAN AS $$
    DECLARE
      v_disponible BOOLEAN;
    BEGIN
      SELECT NOT EXISTS (
        SELECT 1
        FROM reservas
        WHERE barbero_id = p_barbero_id
          AND fecha_reserva = p_fecha
          AND hora_reserva = p_hora
          AND estado NOT IN ('cancelada')
      ) INTO v_disponible;

      RETURN v_disponible;
    END;
    $$ LANGUAGE plpgsql
  `);
  await sql.query('DROP VIEW IF EXISTS vista_reservas_detalle');
  await sql.query(`
    CREATE VIEW vista_reservas_detalle AS
    SELECT
      r.id,
      r.usuario_id,
      u.nombre AS cliente_nombre,
      u.email AS cliente_email,
      u.telefono AS cliente_telefono,
      b.id AS barbero_id,
      b.nombre AS barbero_nombre,
      s.id AS servicio_id,
      s.nombre AS servicio_nombre,
      s.duracion_minutos,
      s.precio,
      r.fecha_reserva,
      r.hora_reserva,
      r.estado,
      r.notas,
      r.fecha_creacion,
      r.fecha_actualizacion
    FROM reservas r
    JOIN usuarios u ON r.usuario_id = u.id
    JOIN barberos b ON r.barbero_id = b.id
    JOIN servicios s ON r.servicio_id = s.id
    ORDER BY r.fecha_reserva, r.hora_reserva
  `);
  await sql.query('DROP VIEW IF EXISTS vista_disponibilidad_barberos');
  await sql.query(`
    CREATE VIEW vista_disponibilidad_barberos AS
    SELECT
      b.id AS barbero_id,
      b.nombre AS barbero_nombre,
      h.dia_semana,
      h.hora_inicio,
      h.hora_fin
    FROM barberos b
    JOIN horarios_disponibles h ON b.id = h.barbero_id
    WHERE b.activo = TRUE AND h.activo = TRUE
    ORDER BY b.id, h.dia_semana, h.hora_inicio
  `);
  await sql.query('CREATE INDEX IF NOT EXISTS idx_reservas_fecha ON reservas(fecha_reserva)');
  await sql.query('CREATE INDEX IF NOT EXISTS idx_reservas_estado ON reservas(estado)');
  await sql.query('CREATE INDEX IF NOT EXISTS idx_reservas_barbero_fecha ON reservas(barbero_id, fecha_reserva)');
  await sql.query('CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)');
  await sql.query('CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol)');
}

async function seedUsers() {
  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const demoHash = await bcrypt.hash(DEMO_USER_PASSWORD, 10);

  await sql`
    INSERT INTO usuarios (nombre, email, password_hash, rol, telefono, activo)
    VALUES (${ADMIN_NAME}, ${ADMIN_EMAIL.toLowerCase()}, ${adminHash}, 'admin', ${ADMIN_PHONE}, TRUE)
    ON CONFLICT (email)
    DO UPDATE SET
      nombre = EXCLUDED.nombre,
      password_hash = EXCLUDED.password_hash,
      rol = EXCLUDED.rol,
      telefono = EXCLUDED.telefono,
      activo = TRUE
  `;

  await sql`
    INSERT INTO usuarios (nombre, email, password_hash, rol, telefono, activo)
    VALUES (${DEMO_USER_NAME}, ${DEMO_USER_EMAIL.toLowerCase()}, ${demoHash}, 'normal', ${DEMO_USER_PHONE}, TRUE)
    ON CONFLICT (email)
    DO UPDATE SET
      nombre = EXCLUDED.nombre,
      password_hash = EXCLUDED.password_hash,
      rol = EXCLUDED.rol,
      telefono = EXCLUDED.telefono,
      activo = TRUE
  `;
}

async function seedCatalogData() {
  const [{ total: totalBarberos }] = await sql`SELECT COUNT(*)::INTEGER AS total FROM barberos`;
  if (totalBarberos === 0) {
    await sql.query(`
      INSERT INTO barberos (nombre, especialidad, email, telefono, activo) VALUES
      ('Juan Pérez', 'Corte Clásico y Barba', 'juan@barberia.com', '555-111-2222', TRUE),
      ('Carlos López', 'Corte Moderno', 'carlos@barberia.com', '555-333-4444', TRUE),
      ('Miguel Rodríguez', 'Especialista en Barba', 'miguel@barberia.com', '555-555-6666', TRUE)
    `);
  }

  const [{ total: totalServicios }] = await sql`SELECT COUNT(*)::INTEGER AS total FROM servicios`;
  if (totalServicios === 0) {
    await sql.query(`
      INSERT INTO servicios (nombre, descripcion, duracion_minutos, precio, activo) VALUES
      ('Corte de Cabello', 'Corte tradicional o moderno según preferencia', 30, 15.00, TRUE),
      ('Arreglo de Barba', 'Perfilado y arreglo de barba', 20, 10.00, TRUE),
      ('Corte + Barba', 'Paquete completo de corte y barba', 50, 22.00, TRUE),
      ('Corte Premium', 'Incluye lavado, corte y acabados especiales', 45, 25.00, TRUE),
      ('Afeitado Clásico', 'Afeitado tradicional con toalla caliente', 30, 18.00, TRUE)
    `);
  }

  const [{ total: totalHorarios }] = await sql`SELECT COUNT(*)::INTEGER AS total FROM horarios_disponibles`;
  if (totalHorarios === 0) {
    await sql.query(`
      INSERT INTO horarios_disponibles (barbero_id, dia_semana, hora_inicio, hora_fin, activo) VALUES
      (1, 1, '09:00', '19:00', TRUE),
      (1, 2, '09:00', '19:00', TRUE),
      (1, 3, '09:00', '19:00', TRUE),
      (1, 4, '09:00', '19:00', TRUE),
      (1, 5, '09:00', '19:00', TRUE),
      (1, 6, '09:00', '14:00', TRUE),
      (2, 1, '09:00', '19:00', TRUE),
      (2, 2, '09:00', '19:00', TRUE),
      (2, 3, '09:00', '19:00', TRUE),
      (2, 4, '09:00', '19:00', TRUE),
      (2, 5, '09:00', '19:00', TRUE),
      (2, 6, '09:00', '14:00', TRUE),
      (3, 1, '10:00', '20:00', TRUE),
      (3, 2, '10:00', '20:00', TRUE),
      (3, 3, '10:00', '20:00', TRUE),
      (3, 4, '10:00', '20:00', TRUE),
      (3, 5, '10:00', '20:00', TRUE),
      (3, 6, '10:00', '15:00', TRUE)
    `);
  }
}

async function initializeDatabase() {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      await runSchema();
      await seedUsers();
      await seedCatalogData();
    })().catch((error) => {
      initializationPromise = null;
      throw error;
    });
  }

  return initializationPromise;
}

function createToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.rol,
      fullName: user.nombre,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function sanitizeUser(user) {
  return {
    id: user.id,
    uuid: user.uuid,
    fullName: user.nombre,
    email: user.email,
    role: user.rol,
    phone: user.telefono,
    active: user.activo,
    lastAccess: user.ultimo_acceso,
    createdAt: user.fecha_registro,
  };
}

async function findUserByEmail(email) {
  const users = await sql`
    SELECT id, uuid, nombre, email, password_hash, rol, telefono, fecha_registro, activo, ultimo_acceso
    FROM usuarios
    WHERE email = ${email.toLowerCase()}
    LIMIT 1
  `;

  return users[0] || null;
}

async function getUserById(id) {
  const users = await sql`
    SELECT id, uuid, nombre, email, password_hash, rol, telefono, fecha_registro, activo, ultimo_acceso
    FROM usuarios
    WHERE id = ${id}
    LIMIT 1
  `;

  return users[0] || null;
}

async function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';

  if (!token) {
    return res.status(401).json({ message: 'Token no enviado.' });
  }

  try {
    req.auth = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
}

function adminMiddleware(req, res, next) {
  if (req.auth?.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso restringido al panel de administración.' });
  }

  next();
}

async function getReservationDetailById(id) {
  const reservations = await sql`
    SELECT *
    FROM vista_reservas_detalle
    WHERE id = ${Number(id)}
    LIMIT 1
  `;

  return reservations[0] || null;
}

function validateReservationStatus(status) {
  return ['pendiente', 'confirmada', 'completada', 'cancelada'].includes(status);
}

async function resolveReservationEntities({ userId, barberId, serviceId }) {
  const [user] = await sql`
    SELECT id, activo
    FROM usuarios
    WHERE id = ${Number(userId)}
    LIMIT 1
  `;
  const [barber] = await sql`
    SELECT id, activo
    FROM barberos
    WHERE id = ${Number(barberId)}
    LIMIT 1
  `;
  const [service] = await sql`
    SELECT id, activo
    FROM servicios
    WHERE id = ${Number(serviceId)}
    LIMIT 1
  `;

  return { user, barber, service }; 
}

async function listAvailability(barberId, date, serviceId, excludeReservationId = null) {
  const [service] = await sql`
    SELECT id, duracion_minutos
    FROM servicios
    WHERE id = ${Number(serviceId)}
      AND activo = TRUE
    LIMIT 1
  `;

  if (!service) {
    return [];
  }

  const dayOfWeek = new Date(`${date}T00:00:00`).getDay();
  const schedules = await sql`
    SELECT hora_inicio::TEXT AS hora_inicio, hora_fin::TEXT AS hora_fin
    FROM horarios_disponibles
    WHERE barbero_id = ${Number(barberId)}
      AND dia_semana = ${dayOfWeek}
      AND activo = TRUE
    ORDER BY hora_inicio
  `;

  if (schedules.length === 0) {
    return [];
  }

  const reservations = await sql`
    SELECT r.id, r.hora_reserva::TEXT AS hora_reserva, s.duracion_minutos
    FROM reservas r
    JOIN servicios s ON s.id = r.servicio_id
    WHERE r.barbero_id = ${Number(barberId)}
      AND r.fecha_reserva = ${date}
      AND r.estado <> 'cancelada'
  `;

  const slots = [];
  for (const schedule of schedules) {
    const scheduleStart = timeStringToMinutes(schedule.hora_inicio);
    const scheduleEnd = timeStringToMinutes(schedule.hora_fin);
    const duration = Number(service.duracion_minutos);

    for (let minute = scheduleStart; minute + duration <= scheduleEnd; minute += 30) {
      const slotEnd = minute + duration;
      const hasConflict = reservations.some((reservation) => {
        if (excludeReservationId && Number(reservation.id) === Number(excludeReservationId)) {
          return false;
        }

        const reservationStart = timeStringToMinutes(reservation.hora_reserva);
        const reservationEnd = reservationStart + Number(reservation.duracion_minutos);
        return overlaps(minute, slotEnd, reservationStart, reservationEnd);
      });

      if (!hasConflict) {
        slots.push(minutesToTimeString(minute));
      }
    }
  }

  return [...new Set(slots)];
}

app.use(async (_req, _res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

app.get('/api/health', async (_req, res) => {
  const nowRows = await sql`SELECT NOW() AS now`;
  res.json({ ok: true, dbTime: nowRows[0].now });
});

app.post('/api/auth/register', async (req, res) => {
  const { fullName = '', email = '', password = '', phone = '' } = req.body || {};

  if (!fullName.trim() || !email.trim() || password.length < 6) {
    return res.status(400).json({ message: 'Ingresa nombre, email y una contraseña de mínimo 6 caracteres.' });
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return res.status(409).json({ message: 'Ese correo ya está registrado.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const rows = await sql`
    INSERT INTO usuarios (nombre, email, password_hash, rol, telefono, activo)
    VALUES (${fullName.trim()}, ${email.toLowerCase()}, ${passwordHash}, 'normal', ${phone.trim() || null}, TRUE)
    RETURNING id, uuid, nombre, email, rol, telefono, fecha_registro, activo, ultimo_acceso
  `;

  const user = rows[0];
  const token = createToken(user);
  res.status(201).json({ token, user: sanitizeUser(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const { email = '', password = '' } = req.body || {};

  if (!email.trim() || !password) {
    return res.status(400).json({ message: 'Email y contraseña son obligatorios.' });
  }

  const user = await findUserByEmail(email);
  if (!user || !user.activo) {
    return res.status(401).json({ message: 'Credenciales incorrectas.' });
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    return res.status(401).json({ message: 'Credenciales incorrectas.' });
  }

  await sql`
    UPDATE usuarios
    SET ultimo_acceso = CURRENT_TIMESTAMP
    WHERE id = ${user.id}
  `;

  const refreshedUser = await getUserById(user.id);
  const token = createToken(refreshedUser);
  res.json({ token, user: sanitizeUser(refreshedUser) });
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const user = await getUserById(req.auth.sub);

  if (!user || !user.activo) {
    return res.status(404).json({ message: 'Usuario no encontrado.' });
  }

  res.json({ user: sanitizeUser(user) });
});

app.get('/api/catalog', async (_req, res) => {
  const [services, barbers] = await Promise.all([
    sql`
      SELECT id, nombre, descripcion, duracion_minutos, precio, activo
      FROM servicios
      WHERE activo = TRUE
      ORDER BY id
    `,
    sql`
      SELECT id, nombre, especialidad, email, telefono, activo
      FROM barberos
      WHERE activo = TRUE
      ORDER BY id
    `,
  ]);

  res.json({ services, barbers });
});

app.get('/api/catalog/availability', async (req, res) => {
  const { barberId = '', date = '', serviceId = '' } = req.query;

  if (!barberId || !date || !serviceId) {
    return res.status(400).json({ message: 'barberId, date y serviceId son obligatorios.' });
  }

  const slots = await listAvailability(barberId, date, serviceId);
  res.json({ slots });
});

app.get('/api/reservations/mine', authMiddleware, async (req, res) => {
  const reservations = await sql`
    SELECT *
    FROM vista_reservas_detalle
    WHERE usuario_id = ${req.auth.sub}
    ORDER BY fecha_reserva DESC, hora_reserva DESC
  `;

  res.json({ reservations });
});

app.post('/api/reservations', authMiddleware, async (req, res) => {
  const { serviceId = '', barberId = '', date = '', time = '', notes = '' } = req.body || {};

  if (!serviceId || !barberId || !date || !time) {
    return res.status(400).json({ message: 'Selecciona servicio, barbero, fecha y hora.' });
  }

  const user = await getUserById(req.auth.sub);
  if (!user || !user.activo) {
    return res.status(401).json({ message: 'Debes iniciar sesión para reservar.' });
  }

  const [service] = await sql`
    SELECT id, nombre, duracion_minutos
    FROM servicios
    WHERE id = ${Number(serviceId)}
      AND activo = TRUE
    LIMIT 1
  `;
  const [barber] = await sql`
    SELECT id, nombre
    FROM barberos
    WHERE id = ${Number(barberId)}
      AND activo = TRUE
    LIMIT 1
  `;

  if (!service || !barber) {
    return res.status(400).json({ message: 'Servicio o barbero no válido.' });
  }

  const slots = await listAvailability(barber.id, date, service.id);
  if (!slots.includes(String(time).slice(0, 5))) {
    return res.status(409).json({ message: 'Ese horario ya no está disponible. Elige otro.' });
  }

  const inserted = await sql`
    INSERT INTO reservas (usuario_id, barbero_id, servicio_id, fecha_reserva, hora_reserva, estado, notas)
    VALUES (${user.id}, ${barber.id}, ${service.id}, ${date}, ${time}, 'pendiente', ${notes.trim() || null})
    RETURNING id
  `;

  const [reservation] = await sql`
    SELECT *
    FROM vista_reservas_detalle
    WHERE id = ${inserted[0].id}
    LIMIT 1
  `;

  res.status(201).json({ reservation });
});

app.get('/api/admin/dashboard', authMiddleware, adminMiddleware, async (_req, res) => {
  const [usersRow] = await sql`
    SELECT COUNT(*)::INTEGER AS total
    FROM usuarios
    WHERE rol = 'normal' AND activo = TRUE
  `;
  const [reservationsRow] = await sql`
    SELECT COUNT(*)::INTEGER AS total
    FROM reservas
  `;
  const [barbersRow] = await sql`
    SELECT COUNT(*)::INTEGER AS total
    FROM barberos
    WHERE activo = TRUE
  `;
  const [servicesRow] = await sql`
    SELECT COUNT(*)::INTEGER AS total
    FROM servicios
    WHERE activo = TRUE
  `;

  const reservationsByService = await sql`
    SELECT s.nombre AS service, COUNT(r.id)::INTEGER AS total
    FROM servicios s
    LEFT JOIN reservas r ON r.servicio_id = s.id
    GROUP BY s.id, s.nombre
    ORDER BY total DESC, s.nombre ASC
  `;

  const reservationsByStatus = await sql`
    SELECT estado AS status, COUNT(*)::INTEGER AS total
    FROM reservas
    GROUP BY estado
    ORDER BY estado ASC
  `;

  const recentReservations = await sql`
    SELECT *
    FROM vista_reservas_detalle
    ORDER BY fecha_creacion DESC
    LIMIT 10
  `;

  res.json({
    totals: {
      users: usersRow.total,
      reservations: reservationsRow.total,
      barbers: barbersRow.total,
      services: servicesRow.total,
    },
    reservationsByService,
    reservationsByStatus,
    recentReservations,
  });
});

app.get('/api/admin/users', authMiddleware, adminMiddleware, async (_req, res) => {
  const users = await sql`
    SELECT id, uuid, nombre, email, rol, telefono, fecha_registro, activo, ultimo_acceso
    FROM usuarios
    WHERE activo = TRUE
    ORDER BY rol ASC, nombre ASC
  `;

  res.json({ users: users.map(sanitizeUser) });
});

app.get('/api/admin/reservations', authMiddleware, adminMiddleware, async (_req, res) => {
  const reservations = await sql`
    SELECT *
    FROM vista_reservas_detalle
    ORDER BY fecha_reserva DESC, hora_reserva DESC, fecha_creacion DESC
  `;

  res.json({ reservations });
});

app.post('/api/admin/reservations', authMiddleware, adminMiddleware, async (req, res) => {
  const {
    userId = '',
    barberId = '',
    serviceId = '',
    date = '',
    time = '',
    status = 'pendiente',
    notes = '',
  } = req.body || {};

  if (!userId || !barberId || !serviceId || !date || !time) {
    return res.status(400).json({ message: 'Completa usuario, barbero, servicio, fecha y hora.' });
  }

  if (!validateReservationStatus(status)) {
    return res.status(400).json({ message: 'Estado de reserva no válido.' });
  }

  const { user, barber, service } = await resolveReservationEntities({ userId, barberId, serviceId });
  if (!user?.activo || !barber?.activo || !service?.activo) {
    return res.status(400).json({ message: 'Usuario, barbero o servicio no válido.' });
  }

  const slots = await listAvailability(barber.id, date, service.id);
  if (status !== 'cancelada' && !slots.includes(String(time).slice(0, 5))) {
    return res.status(409).json({ message: 'Ese horario ya no está disponible para el barbero seleccionado.' });
  }

  const inserted = await sql`
    INSERT INTO reservas (usuario_id, barbero_id, servicio_id, fecha_reserva, hora_reserva, estado, notas)
    VALUES (${user.id}, ${barber.id}, ${service.id}, ${date}, ${time}, ${status}, ${notes.trim() || null})
    RETURNING id
  `;

  const reservation = await getReservationDetailById(inserted[0].id);
  res.status(201).json({ reservation });
});

app.put('/api/admin/reservations/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const reservationId = Number(req.params.id);
  const currentReservation = await getReservationDetailById(reservationId);

  if (!currentReservation) {
    return res.status(404).json({ message: 'Reserva no encontrada.' });
  }

  const {
    userId = currentReservation.usuario_id,
    barberId = currentReservation.barbero_id,
    serviceId = currentReservation.servicio_id,
    date = currentReservation.fecha_reserva,
    time = String(currentReservation.hora_reserva).slice(0, 5),
    status = currentReservation.estado,
    notes = currentReservation.notas || '',
  } = req.body || {};

  if (!validateReservationStatus(status)) {
    return res.status(400).json({ message: 'Estado de reserva no válido.' });
  }

  const { user, barber, service } = await resolveReservationEntities({ userId, barberId, serviceId });
  if (!user?.activo || !barber?.activo || !service?.activo) {
    return res.status(400).json({ message: 'Usuario, barbero o servicio no válido.' });
  }

  const slots = await listAvailability(barber.id, date, service.id, reservationId);
  if (status !== 'cancelada' && !slots.includes(String(time).slice(0, 5))) {
    return res.status(409).json({ message: 'Ese horario ya no está disponible para el barbero seleccionado.' });
  }

  await sql`
    UPDATE reservas
    SET usuario_id = ${user.id},
        barbero_id = ${barber.id},
        servicio_id = ${service.id},
        fecha_reserva = ${date},
        hora_reserva = ${time},
        estado = ${status},
        notas = ${notes.trim() || null}
    WHERE id = ${reservationId}
  `;

  const reservation = await getReservationDetailById(reservationId);
  res.json({ reservation });
});

app.delete('/api/admin/reservations/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const reservationId = Number(req.params.id);
  const currentReservation = await getReservationDetailById(reservationId);

  if (!currentReservation) {
    return res.status(404).json({ message: 'Reserva no encontrada.' });
  }

  await sql`
    DELETE FROM reservas
    WHERE id = ${reservationId}
  `;

  res.json({ success: true });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Error interno del servidor.' });
});

module.exports = { app, initializeDatabase };